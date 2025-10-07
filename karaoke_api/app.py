from flask import Flask, request, jsonify, send_file
import os
import tempfile
import uuid
from deemucs_handler import separar_voz
from pitch_lrc_handler import processar_lrc_com_pitch

app = Flask(__name__)

UPLOAD_FOLDER = "uploads"
OUTPUT_FOLDER = "outputs"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

@app.route("/")
def index():
    return send_file(os.path.join(os.path.dirname(__file__), "index.html"))

@app.route("/process", methods=["POST"])
def process_audio():
    try:
        # === 1️⃣ Recebe os arquivos enviados ===
        if "audio" not in request.files or "lrc" not in request.files:
            return jsonify({"error": "Envie 'audio' (mp3) e 'lrc' (arquivo de legenda)"}), 400

        audio_file = request.files["audio"]
        lrc_file = request.files["lrc"]

        # === 2️⃣ Salva os arquivos temporariamente ===
        id_job = str(uuid.uuid4())[:8]
        audio_path = os.path.join(UPLOAD_FOLDER, f"{id_job}.mp3")
        lrc_path = os.path.join(UPLOAD_FOLDER, f"{id_job}.lrc")

        audio_file.save(audio_path)
        lrc_file.save(lrc_path)

        # === 3️⃣ Roda o Demucs para separar a voz ===
        voz_path = separar_voz(audio_path)  # essa função retorna o caminho do arquivo de voz isolada

        # === 4️⃣ Processa o arquivo LRC e adiciona notas ===
        lrc_final_path = os.path.join(OUTPUT_FOLDER, f"{id_job}_pitch.lrc")
        processar_lrc_com_pitch(lrc_path, voz_path, lrc_final_path)

        # === 5️⃣ Retorna o arquivo final ===
        return send_file(lrc_final_path, as_attachment=True)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
