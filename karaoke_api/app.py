from flask import Flask, request, jsonify, send_file
import os
from controllers.process_controller import process_request
from controllers.deemucs_controller import get_demucs
from concurrent.futures import ThreadPoolExecutor
import uuid, traceback
import threading

app = Flask(__name__)

executor = ThreadPoolExecutor(max_workers=2)
JOBS = {}  # {job_id: {"status": "...", "result": {...}, "error": "..."}}

TEMP_FOLDER = "temp"
os.makedirs(TEMP_FOLDER, exist_ok=True)

def _warmup_async():
    try:
        get_demucs()
        print("[WARMUP] Demucs carregado (async)")
    except Exception as e:
        print(f"[WARMUP] Falhou: {e}")

# Dispara o warmup em background na importação do app (não bloqueia /process)
threading.Thread(target=_warmup_async, daemon=True).start()

@app.route("/process", methods=["POST"])
def process_audio():
    print("[REQUEST RECEIVED] Processing audio and LRC files...")

    if "audio" not in request.files or "lrc" not in request.files or "musica" not in request.form or "artista" not in request.form:
        return jsonify({"error": "Estão faltando arquivos ou informações"}), 400

    id_job = str(uuid.uuid4())[:8]
    audio_file = request.files["audio"]
    lrc_file = request.files["lrc"]
    musica_nome = request.form.get("musica")
    artista_nome = request.form.get("artista")

    audio_path = os.path.join(TEMP_FOLDER, f"{id_job}.mp3")
    lrc_path = os.path.join(TEMP_FOLDER, f"{id_job}.lrc")
    audio_file.save(audio_path)
    lrc_file.save(lrc_path)

    JOBS[id_job] = {"status": "queued"}

    def _run():
        try:
            JOBS[id_job]["status"] = "running"
            process_request(audio_path, lrc_path, artista_nome, musica_nome, id_job)
            JOBS[id_job]["status"] = "done"
            JOBS[id_job]["result"] = {"message": "Arquivos processados e enviados ao B2.", "id_job": id_job}
        except Exception as e:
            JOBS[id_job]["status"] = "error"
            JOBS[id_job]["error"] = f"{e}\n{traceback.format_exc()}"
    
    executor.submit(_run)
    return jsonify({"job_id": id_job}), 202

@app.route("/status/<job_id>", methods=["GET"])
def job_status(job_id):
    info = JOBS.get(job_id)
    if not info:
        return jsonify({"error": "job not found"}), 404
    return jsonify(info), 200

@app.route("/")
def index():
    return send_file(os.path.join(os.path.dirname(__file__), "tests", "static", "index.html"))

# app.py (adicione isso)
@app.route("/health")
def health():
    return jsonify({"ok": True}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
