import os
import re
import json
import numpy as np
import librosa
import crepe

# ----------------------------
# Helpers musicais
# ----------------------------
def hz_to_cents(f_hz, a4=440.0):
    """Converte Hz -> cents (escala log), usando A4=440 como referência."""
    return 1200.0 * np.log2(f_hz / a4) + 6900.0

def cents_to_chroma_bin(cents):
    """
    Mapeia cents -> bin de 0..11 (12 semitons por oitava), ignorando oitava.
    Arredonda para o semitom mais próximo.
    """
    # ((cents % 1200) + 1200) % 1200 garante faixa [0, 1200)
    val = ((cents % 1200.0) + 1200.0) % 1200.0
    bin_idx = int(np.round(val / 100.0)) % 12
    return bin_idx

def normaliza_l1(v):
    s = np.sum(v)
    return (v / s) if s > 0 else v

TIMESTAMP_RE = re.compile(r"^\[(\d{2}):(\d{2}\.\d{2})\]\s*(.*)$")

def ler_lrc(lrc_path):
    """
    Lê um LRC simples e retorna uma lista de linhas com:
    [{"line_id": i, "start_s": ..., "text": ...}]
    """
    linhas = []
    with open(lrc_path, "r", encoding="utf-8") as f:
        raw = f.readlines()

    for i, line in enumerate(raw):
        m = TIMESTAMP_RE.match(line.strip())
        if not m:
            continue
        mm = int(m.group(1))
        ss = float(m.group(2))
        text = m.group(3)
        start_s = mm * 60 + ss
        linhas.append({
            "line_id": i + 1,
            "start_s": start_s,
            "text": text
        })

    # Define end_s de cada linha como o start da próxima, ou +2s (fallback)
    for i in range(len(linhas)):
        if i < len(linhas) - 1:
            linhas[i]["end_s"] = linhas[i + 1]["start_s"]
        else:
            linhas[i]["end_s"] = linhas[i]["start_s"] + 2.0
    return linhas

def gerar_json_notas(lrc_path, wav_path, output_dir="temp", confidence_threshold=0.6, a4_hz=440.0):
    """
    Gera <basename>.notes.json no formato mínimo:
    {
      "version": "notes_v1",
      "a4_hz": 440,
      "hop_ms": 10,
      "segments": [
        {
          "line_id": ...,
          "start_ms": ...,
          "end_ms": ...,
          "text": "...",
          "cents": [.. null ..],
          "voiced": [0/1, ...],
          "conf": [0..1, ...],
          "hist_chroma": [12 valores L1],
          "conf_mean": 0..1
        }
      ]
    }
    """
    os.makedirs(output_dir, exist_ok=True)
    base_name = os.path.splitext(os.path.basename(lrc_path))[0]
    song_id = base_name

    # 1) Ler LRC
    segments_lrc = ler_lrc(lrc_path)
    if not segments_lrc:
        raise ValueError("LRC não possui linhas válidas com timestamps.")

    # 2) Carregar áudio e rodar CREPE
    # OBS: CREPE funciona bem em 16k e retorna time com passo ~10ms
    y, sr = librosa.load(wav_path, sr=16000, mono=True)
    time_s, frequency_hz, confidence, _ = crepe.predict(y, sr, viterbi=True)

    # 3) Preparos: voiced mask global (não aplicamos filtro 'apagando' frames;
    #    guardamos a confiança e marcamos voiced=0/1)
    #    Nota: frequency pode vir 0 em não vozeado
    voiced_global = (confidence >= confidence_threshold) & (frequency_hz > 0)

    # 4) Montar JSON
    hop_est_s = np.median(np.diff(time_s)) if len(time_s) > 1 else 0.01
    hop_ms = int(round(hop_est_s * 1000)) if hop_est_s > 0 else 10

    out = {
        "version": "notes_v1",
        "a4_hz": a4_hz,
        "hop_ms": hop_ms,
        "segments": []
    }

    # 5) Para cada linha do LRC, fatiar os frames do CREPE e preencher campos
    for seg in segments_lrc:
        start_s = seg["start_s"]
        end_s = seg["end_s"]
        text = seg["text"]
        line_id = seg["line_id"]

        # Seleciona frames cujo time esteja dentro do intervalo [start, end)
        mask = (time_s >= start_s) & (time_s < end_s)
        idx = np.where(mask)[0]

        if idx.size == 0:
            # Linha sem frames (muito curta ou gap): exporta arrays vazios
            out["segments"].append({
                "line_id": line_id,
                "start_ms": int(round(start_s * 1000)),
                "end_ms": int(round(end_s * 1000)),
                "text": text,
                "cents": [],
                "voiced": [],
                "conf": [],
                "hist_chroma": [0.0]*12,
                "conf_mean": 0.0
            })
            continue

        f0_seg = frequency_hz[idx]
        conf_seg = confidence[idx]
        voiced_seg = voiced_global[idx].astype(np.uint8)

        # Converter para cents, mas apenas onde há voz; outros serão None (null no JSON)
        cents_seg = np.empty_like(f0_seg, dtype=np.float64)
        cents_seg[:] = np.nan
        voiced_inds = np.where(voiced_seg == 1)[0]
        if voiced_inds.size > 0:
            cents_voiced = hz_to_cents(f0_seg[voiced_inds], a4=a4_hz)
            cents_seg[voiced_inds] = cents_voiced

        # Construir histograma de chroma (12 bins) apenas com frames vozeados
        hist = np.zeros(12, dtype=np.float64)
        if voiced_inds.size > 0:
            for v_i in voiced_inds:
                c = cents_seg[v_i]
                if np.isfinite(c):
                    b = cents_to_chroma_bin(c)
                    hist[b] += 1.0
        hist = normaliza_l1(hist)

        # Média de confiança nos frames vozeados (se houver)
        conf_mean = float(np.mean(conf_seg[voiced_inds])) if voiced_inds.size > 0 else 0.0

        # Preparar arrays para JSON: cents -> lista com None onde não vozeado
        cents_list = []
        voiced_list = []
        conf_list = []
        for i in range(len(idx)):
            voiced_list.append(int(voiced_seg[i]))
            conf_list.append(float(conf_seg[i]))
            if voiced_seg[i] == 1 and np.isfinite(cents_seg[i]):
                cents_list.append(float(cents_seg[i]))
            else:
                cents_list.append(None)  # vira 'null' no JSON

        out["segments"].append({
            "line_id": line_id,
            "start_ms": int(round(start_s * 1000)),
            "end_ms": int(round(end_s * 1000)),
            "text": text,
            "cents": cents_list,
            "voiced": voiced_list,
            "conf": conf_list,
            "hist_chroma": [float(x) for x in hist.tolist()],
            "conf_mean": conf_mean
        })

    # 6) Salvar JSON
    out_path = os.path.join(output_dir, f"{base_name}.notes.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    print(f"✅ JSON de notas gerado: {out_path}")
    return out_path


def processar_lrc_com_pitch(lrc_path, wav_path, output_dir="temp", confidence_threshold=0.6):
    """
    (ORIGINAL) Recebe o LRC e o WAV da voz isolada,
    adiciona notas palavra a palavra com timestamps e salva um novo LRC.
    """
    try:
        os.makedirs(output_dir, exist_ok=True)

        # === Carregar áudio ===
        y, sr = librosa.load(wav_path, sr=16000)  # CREPE precisa de 16kHz

        # === Detectar pitch com CREPE ===
        print("🎵 Detectando notas com CREPE...")
        time, frequency, confidence, activation = crepe.predict(y, sr, viterbi=True)

        # Filtrar apenas frequências confiáveis
        valid = confidence >= confidence_threshold
        time = time[valid]
        frequency = frequency[valid]

        if len(frequency) == 0:
            raise ValueError("Nenhum pitch confiável detectado no áudio.")

        # === Ler LRC ===
        with open(lrc_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        new_lines = []

        for i, line in enumerate(lines):
            match = re.match(r"(\[\d{2}:\d{2}\.\d{2}\])\s*(.*)", line)
            if not match:
                new_lines.append(line)
                continue

            timestamp_str, text = match.groups()
            silabas = re.findall(r'\S+', text)

            # Converter timestamp da linha para segundos
            minutos, segundos = map(float, timestamp_str.strip('[]').split(':'))
            start_time = minutos * 60 + segundos

            # Determinar tempo final da linha
            if i + 1 < len(lines):
                next_match = re.match(r"\[\d{2}:\d{2}\.\d{2}\]", lines[i+1])
                if next_match:
                    next_timestamp = next_match.group(0)
                    min_n, sec_n = map(float, next_timestamp.strip('[]').split(':'))
                    end_time = min_n*60 + sec_n
                else:
                    end_time = start_time + 2.0  # default 2s
            else:
                end_time = start_time + 2.0

            # Distribuir notas por “sílabas” (tokens por espaço)
            dur_total = end_time - start_time
            dur_silaba = dur_total / len(silabas) if len(silabas) > 0 else dur_total

            nova_linha = f"{timestamp_str} "
            for j, silaba in enumerate(silabas):
                ts_silaba = start_time + j * dur_silaba
                # Pegar pitch mais próximo do timestamp da “sí­laba”
                idx = np.argmin(np.abs(time - ts_silaba))
                nota = librosa.hz_to_note(frequency[idx])
                nova_linha += f"{silaba}<{nota}> "

            new_lines.append(nova_linha.strip() + "\n")

        # === Salvar novo arquivo ===
        base_name = os.path.splitext(os.path.basename(lrc_path))[0]
        output_path = os.path.join(output_dir, f"{base_name}_com_notas.lrc")
        with open(output_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)

        print(f"✅ LRC final gerado: {output_path}")
        return output_path

    except Exception as e:
        raise RuntimeError(f"Erro ao processar LRC e áudio: {str(e)}")


# ----------------------------------------------------------
# Exemplo de uso do novo fluxo:
# path_json = gerar_json_notas("minha_musica.lrc", "voz.wav", output_dir="temp")
# ----------------------------------------------------------
