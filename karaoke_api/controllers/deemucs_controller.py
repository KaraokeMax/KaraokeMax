import os
import torchaudio
from demucs import pretrained
from demucs.apply import apply_model
import torch

def separar_voz(audio_path, output_dir="temp"):
    """
    Recebe o caminho do áudio MP3/WAV e separa a voz usando Demucs.
    Retorna o caminho do arquivo de voz isolada.
    """

    os.makedirs(output_dir, exist_ok=True)

    # === Carregar o áudio ===
    wav, sr = torchaudio.load(audio_path)

    # Garantir estéreo (2 canais)
    if wav.shape[0] > 2:
        wav = wav[:2]

    # === Carregar o modelo Demucs ===
    print("Carregando modelo Demucs (htdemucs)...")
    model = pretrained.get_model('htdemucs')
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model.to(device)

    # === Separar fontes ===
    print("Separando voz e instrumental (pode demorar um pouco)...")
    sources = apply_model(model, wav[None], device=device)[0]

    # === Nome base do arquivo ===
    base_name = os.path.splitext(os.path.basename(audio_path))[0]

    # === Salvar resultados ===
    voz_path = os.path.join(output_dir, f"{base_name}_Voz.wav")
    inst_path = os.path.join(output_dir, f"{base_name}_Instrumental.wav")

    # sources[3] = voz; sources[0:3] = instrumental
    torchaudio.save(voz_path, sources[3], sr)
    torchaudio.save(inst_path, sources[0] + sources[1] + sources[2], sr)

    print("Separação concluída!")

    return voz_path
