from services.b2_service import B2Uploader
import os

def upload_to_b2(voz_path, instrumental_path, lrc_final_path, artista_nome, musica_nome, id_job):
    """
    Controller para upload de arquivos ao B2. Valida dados e chama o serviço.
    Adiciona logs e tratamento de erro detalhado.
    """
    try:
        print(f"[B2 UPLOAD] Iniciando upload para B2...")
        # Valida parâmetros obrigatórios
        if not all([voz_path, instrumental_path, lrc_final_path, artista_nome, musica_nome, id_job]):
            raise ValueError("Todos os parâmetros são obrigatórios para o upload ao B2.")
        # Valida existência dos arquivos
        for f in [voz_path, instrumental_path, lrc_final_path]:
            if not os.path.exists(f):
                print(f"[B2 UPLOAD ERROR] Arquivo não encontrado: {f}")
                raise FileNotFoundError(f"Arquivo não encontrado: {f}")
            elif os.path.getsize(f) == 0:
                print(f"[B2 UPLOAD ERROR] Arquivo está vazio: {f}")
                raise ValueError(f"Arquivo está vazio: {f}")
        # Monta prefixo
        artista_nome = str(artista_nome).strip().replace("/", "-")
        musica_nome = str(musica_nome).strip().replace("/", "-")
        prefix = f"{artista_nome}/{musica_nome}"
        uploader = B2Uploader()
        print(f"[B2 UPLOAD] Chamando uploader.upload_files...")
        result = uploader.upload_files(
            wav1_path=voz_path,
            wav2_path=instrumental_path,
            lrc_path=lrc_final_path,
            prefix=prefix,
            file_infos={
                "musica_nome": musica_nome,
                "artista_nome": artista_nome,
                "id_job": id_job
            }
        )
        print(f"[B2 UPLOAD] Upload concluído. Resultado: {result}")
    except Exception as e:
        print(f"[B2 UPLOAD ERROR] {str(e)}")
        return {"error": str(e)}
