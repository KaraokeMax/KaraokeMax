from flask import Flask, request, jsonify, send_file
import os
from controllers.process_controller import process_request
import uuid

app = Flask(__name__)

TEMP_FOLDER = "temp"
os.makedirs(TEMP_FOLDER, exist_ok=True)

@app.route("/")
def index():
    return send_file(os.path.join(os.path.dirname(__file__), "tests", "static", "index.html"))

# Nova rota que recebe nome da música e artista, e salva arquivos no B2
@app.route("/process", methods=["POST"])
def process_audio():
    print("[REQUEST RECEIVED] Processing audio and LRC files...")

    if "audio" not in request.files or "lrc" not in request.files or "musica" not in request.form or "artista" not in request.form:
        return jsonify({"error": "Estão faltando arquivos ou informações"}), 400

    id_job = str(uuid.uuid4())[:8]
    audio_file = request.files["audio"]
    path_audio = os.path.join(TEMP_FOLDER, id_job + ".mp3")
    audio_file.save(path_audio)
    lrc_file = request.files["lrc"]
    path_lrc = os.path.join(TEMP_FOLDER, id_job + ".lrc")
    lrc_file.save(path_lrc)
    musica_nome = request.form.get("musica")
    artista_nome = request.form.get("artista")
    
    # Processa áudio e LRC
    try:
        process_request(path_audio, path_lrc, artista_nome, musica_nome, id_job)
    except Exception as e:
        print(f"[PROCESS ERROR] {str(e)}")
        return jsonify({"error": str(e)}), 500

    # Retorna info dos arquivos enviados
    return jsonify({
        "success": True
    }), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
