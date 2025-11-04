<template>
    <div class="container">
        <div class="search-section">
            <h2>Adicionar Nova Música</h2>
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
                <div v-for="song in songs" :key="song.id" class="song-item">
                    <div class="song-info">
                        <h3>{{ song.title }}</h3>
                        <p>
                          {{ song.artist }}
                          <span v-if="song.duration"> • {{ formatDuration(song.duration) }}</span>
                        </p>
                    </div>
                    <button @click="selectSong(song)">Selecionar</button>
                </div>
            </div>

            <div v-if="selectedSong" class="youtube-section">
                <h3>Insira o link do YouTube para "{{ selectedSong.title }}"</h3>
                <input 
                    v-model="youtubeUrl" 
                    type="text" 
                    placeholder="Cole o link do YouTube aqui..."
                >
                <button @click="processMusic" :disabled="!youtubeUrl">Processar Música</button>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'TelaAdicionarMusica',
    data() {
        return {
            searchQuery: '',
            songs: [],
            loading: false,
            selectedSong: null,
            youtubeUrl: ''
        }
    },
    methods: {
        async searchSongs() {
            if (!this.searchQuery) return;
            
            this.loading = true;
            this.songs = [];
            
                        try {
                const response = await axios.get(`https://lrclib.net/api/search`, {
                    params: {
                        q: this.searchQuery
                    }
                });
                console.log(response.data);
                
                                // Normalize API result to the fields used in the template (title, artist, id, duration)
                this.songs = response.data.map(s => {
                    const id = s.id || s.trackId || s.track_id || null;
                    const title = s.name || s.trackName || s.title || 'Sem título';
                    const artist = s.artist || s.artistName || (Array.isArray(s.artists) ? s.artists.join(', ') : '') || 'Desconhecido';

                    // Try to extract duration (in seconds). Many APIs use duration, length, time or duration_ms.
                    const rawDur = s.duration ?? s.length ?? s.time ?? s.duration_ms ?? s.trackLength ?? s.track_duration ?? s.trackDuration;
                    let durationSeconds = null;

                    if (typeof rawDur === 'number') {
                        // Heuristic: if number is large, assume milliseconds
                        durationSeconds = rawDur > 10000 ? Math.round(rawDur / 1000) : rawDur;
                    } else if (typeof rawDur === 'string') {
                        // If already "mm:ss", convert; else try numeric parse
                        if (/^\d+:\d{2}$/.test(rawDur)) {
                            const parts = rawDur.split(':').map(Number);
                            durationSeconds = parts[0] * 60 + parts[1];
                        } else {
                            const num = Number(rawDur);
                            if (!isNaN(num)) durationSeconds = num > 10000 ? Math.round(num / 1000) : num;
                        }
                    }

                    return {
                        id,
                        title,
                        artist,
                        duration: durationSeconds
                    };
                });
            } catch (error) {
                console.error('Error searching songs:', error);
            } finally {
                this.loading = false;
            }
        },
        
        selectSong(song) {
            this.selectedSong = song;
        },
        
        async processMusic() {
            if (!this.youtubeUrl || !this.selectedSong) return;
            
            try {
                // Here you would call your backend API to process the YouTube video
                const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/process-music`, {
                    youtubeUrl: this.youtubeUrl,
                    songId: this.selectedSong.id
                });
                                
                console.log('Music processed successfully:', response.data);
            } catch (error) {
                console.error('Error processing music:', error);
            }
        },

        formatDuration(seconds) {
            if (seconds === null || seconds === undefined) return '';
            if (typeof seconds !== 'number') return String(seconds);
            const m = Math.floor(seconds / 60);
            const s = String(seconds % 60).padStart(2, '0');
            return `${m}:${s}`;
        }
    }
}
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

.search-section {
    width: 100%;
    max-width: 1100px; /* ajuste conforme desejar; remova se quiser 100% */
    height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 30px;
    border-radius: 8px;
    color: white;
    display: flex;
    flex-direction: column;
}

.results {
    flex: 1 1 auto;
    overflow: auto;
    margin-top: 10px;
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
    margin: 10px 0;
    border-radius: 6px;
}

.song-info h3 {
    margin: 0;
    font-size: 1.1em;
}

.song-info p {
    margin: 5px 0 0;
    color: #bdc3c7;
}

.youtube-section {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #34495e;
}

.loading {
    text-align: center;
    padding: 20px;
    color: #bdc3c7;
}
</style>