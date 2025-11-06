import os
import uuid
from controllers.deemucs_controller import separar_voz
from controllers.pitch_lrc_controller import processar_lrc_com_pitch, gerar_json_notas
from controllers.b2_controller import upload_to_b2

TEMP_FOLDER = "temp"

def save_temp_files(audio_file, lrc_file):
    id_job = str(uuid.uuid4())[:8]
    audio_path = os.path.join(TEMP_FOLDER, f"{id_job}.mp3")
    lrc_path = os.path.join(TEMP_FOLDER, f"{id_job}.lrc")
    audio_file.save(audio_path)
    lrc_file.save(lrc_path)
    return id_job, audio_path, lrc_path

def process_audio_and_lrc(audio_path, lrc_path):
    voz_path, instrumental_path = separar_voz(audio_path)
    lrc_final_path = processar_lrc_com_pitch(lrc_path, voz_path, output_dir=TEMP_FOLDER)
    json_path = gerar_json_notas(lrc_path, voz_path, output_dir=TEMP_FOLDER)
    return voz_path, instrumental_path, lrc_final_path, json_path

def cleanup_temp_folder():
    import shutil
    try:
        for filename in os.listdir(TEMP_FOLDER):
            file_path = os.path.join(TEMP_FOLDER, filename)
            if os.path.isfile(file_path):
                os.remove(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
    except Exception as e:
        print(f"[TEMP CLEANUP ERROR] {str(e)}")

def process_request(audio_path, lrc_path, artista_nome, musica_nome, id_job):
    voz_path, instrumental_path, lrc_final_path, json_path = process_audio_and_lrc(audio_path, lrc_path)
    upload_to_b2(voz_path, instrumental_path, lrc_final_path, json_path, artista_nome, musica_nome, id_job)
    print("[PROCESS] Antes de cleanup_temp_folder")
    cleanup_temp_folder()
    print("[PROCESS] Depois de cleanup_temp_folder")
    print("[PROCESS] Antes do return da resposta")
