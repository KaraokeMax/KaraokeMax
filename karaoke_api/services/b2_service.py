from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional, Dict, List
from pathlib import Path
from datetime import datetime, timezone
import os
from dotenv import load_dotenv
from b2sdk.v2 import (InMemoryAccountInfo, B2Api, UploadSourceLocalFile, Bucket)

# Carrega variáveis do .env automaticamente
load_dotenv()

@dataclass
class B2Uploader:
    """
    Serviço para enviar arquivos (.wav e .lrc) a um bucket Backblaze B2 privado.
    As credenciais são carregadas de variáveis de ambiente:
      - B2_KEY_ID
      - B2_APP_KEY
      - B2_BUCKET
    """

    _api: B2Api = field(init=False, repr=False)
    _bucket: Bucket = field(init=False, repr=False)

    def __post_init__(self) -> None:
        key_id = os.getenv("B2_KEY_ID")
        app_key = os.getenv("B2_APP_KEY")
        bucket_name = os.getenv("B2_BUCKET")

        if not all([key_id, app_key, bucket_name]):
            raise EnvironmentError(
                "Variáveis de ambiente B2_KEY_ID, B2_APP_KEY e B2_BUCKET são obrigatórias."
            )

        info = InMemoryAccountInfo()
        self._api = B2Api(info)
        self._api.authorize_account("production", key_id, app_key)
        self._bucket = self._api.get_bucket_by_name(bucket_name)
        if self._bucket is None:
            raise ValueError(f"Bucket '{bucket_name}' não encontrado.")

    def upload_files(self, wav1_path: str | Path, wav2_path: str | Path, lrc_path: str | Path, json_path: str | Path, *, prefix: str, file_infos: Optional[Dict[str, str]] = None) -> Dict[str, Dict[str, str]]:
        """
        Sobe dois .wav e um .lrc para o bucket privado, organizando em pastas de artista/música.
        Usa upload_large_file para arquivos grandes e faz uploads em paralelo.
        """
        import threading
        paths = {
            "voz": Path(wav1_path),
            "instrumentos": Path(wav2_path),
            "lyrics": Path(lrc_path),
            "json": Path(json_path)
        }
        infos = {
            "uploadedBy": "B2Uploader",
            "uploadedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            **(file_infos or {}),
        }
        results: Dict[str, Dict[str, str]] = {}
        threads = []

        import time
        def upload_file(label, p):
            if label == "voz":
                remote_name = f"{prefix}/voz.wav"
            elif label == "instrumentos":
                remote_name = f"{prefix}/instrumentos.wav"
            elif label == "lyrics":
                remote_name = f"{prefix}/lyrics.lrc"
            elif label == "json":
                remote_name = f"{prefix}/notes.json"
            else:
                remote_name = f"{prefix}/{p.name}"
            content_type = self._guess_content_type(p)
            file_size = p.stat().st_size
            try:
                print(f"[B2 UPLOAD] Iniciando upload de {remote_name} ({file_size} bytes)")
                start_time = time.time()
                if file_size > 100 * 1024 * 1024:  # >100MB usa multipart
                    print(f"[B2 UPLOAD] Usando upload_large_file para {remote_name}")
                    uploaded = self._bucket.upload_local_file(
                        local_file=str(p),
                        file_name=remote_name,
                        content_type=content_type,
                        file_infos=infos,
                    )
                else:
                    print(f"[B2 UPLOAD] Usando upload_local_file para {remote_name}")
                    uploaded = self._bucket.upload_local_file(
                        local_file=str(p),
                        file_name=remote_name,
                        content_type=content_type,
                        file_infos=infos,
                    )
                elapsed = time.time() - start_time
                print(f"[B2 UPLOAD] Upload de {remote_name} concluído em {elapsed:.2f} segundos.")
                results[label] = {
                    "fileId": uploaded.id_,
                    "fileName": uploaded.file_name,
                    "contentType": content_type,
                    "size": str(uploaded.size),
                    "uploadTime": f"{elapsed:.2f} segundos"
                }
            except Exception as e:
                print(f"[B2 UPLOAD ERROR] {label}: {e}")
                results[label] = {"error": str(e)}

        for label, p in paths.items():
            t = threading.Thread(target=upload_file, args=(label, p))
            t.start()
            threads.append(t)
        for t in threads:
            t.join()
        return results

    def _guess_content_type(self, file_path: Path) -> str:
        """
        Faz o 'guess' do tipo de conteúdo com base na extensão do arquivo.
        """
        ext = file_path.suffix.lower()
        if ext == ".wav":
            return "audio/wav"
        elif ext == ".lrc":
            return "text/plain"
        elif ext == ".json":
            return "application/json"
        else:
            return "application/octet-stream"
