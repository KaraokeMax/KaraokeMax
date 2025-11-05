<template>
    <div class="container">
        <div class="search-section">
            <h2 class="titulo-pagina">Adicionar Nova Música</h2>
            <div class="search-box">
                <input 
                    v-model="searchQuery" 
                    type="text" 
                    placeholder="Digite o nome da música..."
                    @keyup.enter="searchSongs"
                >
                <button @click="searchSongs">Buscar</button>
            </div>

            <div v-if="loading" class="loading">
                Buscando músicas...
            </div>

            <div v-if="songs.length > 0" class="results">
                <div v-for="song in songs" :key="song.id" :class="!lrcSelecionada? 'song-item' : 'song-item-selecionado'">
					<div class="song-info">
                        <h3>{{ song.title }}</h3>
                        <p>
                          {{ song.artist }}
                          <span v-if="song.duration"> • {{ formatDuration(song.duration) }}</span>
                        </p>
                    </div>
                    <button @click="selectSong(song)" v-if="!lrcSelecionada">Selecionar</button>
                </div>
            </div>

            <!-- Botão -->
            <div class="upload-button" @click="openFilePicker">
                <strong>🎶 {{ file ? 'Trocar arquivo MP3' : 'Selecionar arquivo MP3' }} </strong>
                <div class="file-info" v-if="fileInfo">
                    <p><strong>Nome: </strong> {{ fileInfo.name }} </p>
                    <p><strong>Duração: </strong> {{ fileInfo.duration }}</p>
                </div>
            </div>

            <!-- input escondido -->
            <input type="file" ref="fileInput" accept=".mp3" style="display: none" @change="handleFileSelected" />

            <div class="process-div">
                <button @click="processMusic" class="process-button">
                  Processar Música
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import api from '../services/api';

export default {
  name: 'TelaAdicionarMusica',
  data() {
    return {
      searchQuery: '',
      songs: [],
      loading: false,
      selectedSong: null,
      lrcSelecionada: null,
      file: null,
      fileInfo: null,
    };
  },
  methods: {
    openFilePicker() {
      // usa a ref do template
      this.$refs.fileInput && this.$refs.fileInput.click();
    },

    handleFileSelected(event) {
      const selectedFile = event.target.files?.[0];
      if (!selectedFile) return;

      this.file = selectedFile;

      const url = URL.createObjectURL(selectedFile);
      const audio = new Audio(url);

      audio.addEventListener('loadedmetadata', () => {
        this.fileInfo = {
          name: selectedFile.name,
          size: (selectedFile.size / 1024).toFixed(1),   // KB
          duration: this.formatDuration(audio.duration), // segundos
        };
        URL.revokeObjectURL(url); // evita vazamento de memória
      });

      // (opcional) tratar erro de metadata
      audio.addEventListener('error', () => {
        console.error('Não foi possível ler metadados do áudio.');
        URL.revokeObjectURL(url);
      });
    },

    async searchSongs() {
      if (!this.searchQuery) return;

      this.loading = true;
      this.songs = [];
	  this.selectedSong = null;
	  this.lrcSelecionada = null;

      try {
        const response = await axios.get('https://lrclib.net/api/search', {
          params: { q: this.searchQuery }
        });
        const data = (response.data || []).filter(s => s.syncedLyrics != null);

        if (data.length === 0) {
          alert('Não foi possível encontrar músicas com letras sincronizadas. Tente outro termo de busca.');
          return;
        }

        this.songs = data.map(s => ({
          id: s.id,
          title: s.name + " - " + s.albumName,
          artist: s.artistName,
          duration: Math.floor(s.duration),
          lrc: s.syncedLyrics,
        }));
      } catch (error) {
        console.error('Error searching songs:', error);
      } finally {
        this.loading = false;
      }
    },

    async selectSong(song) {
      const resp = await api.get(`/musicas/${song.title}`);
      if (resp.data.musicaExiste) {
        alert('A música já está cadastrada no sistema.');
        return;
      }
      this.selectedSong = song;
      this.lrcSelecionada = song.lrc;
	  this.songs = this.songs.filter(s => s.id === song.id);
    },

    limparSelecao() {
        this.selectedSong = null;
        this.lrcSelecionada = null;
        this.file = null;
        this.fileInfo = null;
    },

    async processMusic() {
        if (!this.selectedSong && !this.file) {
            alert('Selecione uma música ou faça upload de um arquivo MP3.');
            return;
        }
    
        if (this.fileInfo.duration > this.selectedSong.duration + 10 || this.fileInfo.duration < this.selectedSong.duration - 10) {
            alert('A duração do arquivo MP3 é muito diferente da duração da música selecionada.');
            return;
        }

        try {
			const formData = new FormData();
			formData.append('audio', this.file);
			formData.append('lrc', this.lrcSelecionada);
			formData.append('nomeMusica', this.selectedSong.title);
			formData.append('nomeArtista', this.selectedSong.artist);

			const resp = await api.post('/musicas', formData);

			if (resp.status !== 202) {
				throw new Error('Erro ao adicionar música', resp.data);
			}

			alert('Música adicionada com sucesso!');
            
        } catch (error) {
            console.error('Erro ao adicionar música:', error);
            alert('Ocorreu um erro ao adicionar a música. Tente novamente.');
        }     
    },

    formatDuration(seconds) {
        if (seconds == null) return '';
        if (typeof seconds !== 'number') return String(seconds);
        const m = Math.floor(seconds / 60);
        let s = String(seconds % 60).padStart(2, '0');
        s = Math.floor(s);
        return `${m}:${s}`;
    }
  }
};
</script>


<style scoped>
.container {
    width: 100%;
    max-width: none;
    height: 100vh;
    box-sizing: border-box;
    padding: 30px;
    display: flex;
    align-items: stretch;
    justify-content: center;
}

.titulo-pagina {
    color: white;
    margin-bottom: 40px;
	font-size: 2rem;
	text-align: center;
}

.search-section {
    width: 90%;
    max-width: 1100px; /* ajuste conforme desejar; remova se quiser 100% */
    height: 90%;
    padding: 30px;
    border-radius: 8px;
    color: white;
    display: flex;
    flex-direction: column;
}

.results {
    flex: 1 1 auto;
    overflow: auto;
    margin: 20px 10px;
	  padding-right: 10px;
}

.search-box {
    display: flex;
    gap: 10px;
    margin-bottom: 12px;
}

input {
    flex: 1;
    padding: 12px;
    border: none;
    border-radius: 4px;
    background: #34495e;
    color: white;
    font-size: 1rem;
}

button {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    background: linear-gradient(135deg, #2d3260 0%, #3a225a 100%);;
    color: white;
    cursor: pointer;
    transition: background 0.3s;
}

button:hover {
    background: #0099ff;
}

button:disabled {
    background: #666;
    cursor: not-allowed;
}

.song-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background: rgba(0,0,0,0.08);
    margin: 12px 4px;
    border-radius: 6px;
}

.song-item-selecionado {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background: rgba(95, 16, 148, 0.3);
    margin: 12px 4px;
    border-radius: 6px;
	box-shadow: 0 0 4px rgba(255, 255, 255, 0.9);;
}

.song-info h3 {
    margin: 0;
    font-size: 1.1em;
}

.song-info p {
    margin: 5px 0 0;
    color: #bdc3c7;
}

.loading {
    text-align: center;
    padding: 20px;
    color: #bdc3c7;
}

.upload-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-button {
  background: rgba(158, 19, 238, 0.274);
  color: white;
  padding: 12px 20px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 3px 6px rgba(0,0,0,0.2);
}

.upload-button:hover {
  background-color: #9225eb;
  transform: scale(1.03);
}

.file-info {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-top: 10px;
  padding: 10px;
  font-size: 0.9rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  color: #111827;
  height: auto;
}

.file-info p {
  margin: 6px 0;   /* controla o espaçamento entre parágrafos */
  line-height: 1.4;
}

.process-div {
  margin-top: 20px;
  text-align: center;
}

.process-button {
  font-size: medium;
  padding: 15px 35px;
}

.results::-webkit-scrollbar {
  width: 7px;
}
.results::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
}

</style>