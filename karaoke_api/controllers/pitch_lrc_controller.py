import librosa
import numpy as np
import re
import os
import crepe

def processar_lrc_com_pitch(lrc_path, wav_path, output_dir="temp", confidence_threshold=0.6):
    """
    Recebe o arquivo LRC base e o WAV da voz isolada,
    adiciona notas sílaba por sílaba com timestamps e salva o LRC final.
    
    Retorna o caminho do arquivo final.
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

            # Distribuir notas por sílaba
            dur_total = end_time - start_time
            dur_silaba = dur_total / len(silabas) if len(silabas) > 0 else dur_total

            nova_linha = f"{timestamp_str} "
            for j, silaba in enumerate(silabas):
                ts_silaba = start_time + j * dur_silaba
                # Pegar pitch mais próximo do timestamp da sílaba
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
