import tkinter as tk
from tkinter import filedialog, messagebox
import librosa
import numpy as np
import re
import os

import librosa
import numpy as np
import re
import os

def processar_lrc_com_pitch(lrc_path, wav_path, output_dir="outputs"):
    """
    Recebe o arquivo LRC base e o WAV da voz isolada,
    adiciona as notas sílaba por sílaba e salva o LRC final.
    
    Retorna o caminho do arquivo final.
    """
    try:
        os.makedirs(output_dir, exist_ok=True)

        # Carregar áudio
        y, sr = librosa.load(wav_path, sr=None)
        pitches, magnitudes = librosa.piptrack(y=y, sr=sr)

        # Extrair pitch médio (em Hz -> nota musical)
        pitch_values = [np.mean(pitches[:, i][pitches[:, i] > 0]) for i in range(pitches.shape[1])]
        pitch_values = [p for p in pitch_values if not np.isnan(p) and p > 0]

        if not pitch_values:
            raise ValueError("Nenhum pitch detectado no áudio.")

        # Converter para notas musicais
        notes = [librosa.hz_to_note(p) for p in pitch_values]
        note_index = 0

        # Ler LRC
        with open(lrc_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        new_lines = []
        for line in lines:
            match = re.match(r"(\[\d{2}:\d{2}\.\d{2}\])\s*(.*)", line)
            if not match:
                new_lines.append(line)
                continue

            timestamp, text = match.groups()
            silabas = re.findall(r'\S+', text)
            nova_linha = f"{timestamp} "

            for silaba in silabas:
                if note_index < len(notes):
                    nota = notes[note_index]
                    nova_linha += f"{silaba}({nota}) "
                    note_index += 1
                else:
                    nova_linha += f"{silaba} "

            new_lines.append(nova_linha.strip() + "\n")

        # Salvar novo arquivo
        base_name = os.path.splitext(os.path.basename(lrc_path))[0]
        output_path = os.path.join(output_dir, f"{base_name}_com_notas.lrc")
        with open(output_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)

        return output_path

    except Exception as e:
        raise RuntimeError(f"Erro ao processar LRC e áudio: {str(e)}")

