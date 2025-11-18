import requests
base_url = "http://localhost:3000" 
# base_url = "https://karaokemax.onrender.com"

def atualizar_status_musica(id_musica, novo_status, erro = None):
    url = f"{base_url}/musicas/{id_musica}/status"
    headers = {
        "Content-Type": "application/json"
    }
    payload = {"status": novo_status}
    if (erro):
        payload["erro"] = erro
        
    response = requests.patch(url, json=payload, headers=headers)
    response.raise_for_status()