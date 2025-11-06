import os
import torchaudio
from demucs import pretrained
from demucs.apply import apply_model
import torch

# reduzir contenda de CPU em instâncias pequenas
torch.set_num_threads(max(1, int(os.environ.get("TORCH_NUM_THREADS", "1"))))

_DEMUCS_MODEL = None

def get_demucs():
    global _DEMUCS_MODEL
    if _DEMUCS_MODEL is None:
        _DEMUCS_MODEL = pretrained.get_model('htdemucs')
        _DEMUCS_MODEL.eval()
    return _DEMUCS_MODEL

def separar_voz(audio_path, output_dir="temp"):
    """
    Separa voz e instrumental com Demucs.
    Retorna (voz_path, inst_path).
    """
    os.makedirs(output_dir, exist_ok=True)
    print(audio_path)

    # carrega áudio
    wav, sr = torchaudio.load(audio_path)
    # garante no máximo 2 canais
    if wav.shape[0] > 2:
        wav = wav[:2]

    # modelo + device
    print("Carregando modelo Demucs (htdemucs)...")
    model = get_demucs()
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model.to(device)

    print("Separando voz e instrumental (pode demorar um pouco)...")
    with torch.no_grad():
        sources = apply_model(model, wav[None], device=device)[0]

    base_name = os.path.splitext(os.path.basename(audio_path))[0]
    voz_path = os.path.join(output_dir, f"{base_name}_Voz.wav")
    inst_path = os.path.join(output_dir, f"{base_name}_Instrumental.wav")

    # sources[3] = vocals; others = drums, bass, other
    torchaudio.save(voz_path, sources[3], sr)
    torchaudio.save(inst_path, sources[0] + sources[1] + sources[2], sr)

    print("Separação concluída!")
    return voz_path, inst_path
