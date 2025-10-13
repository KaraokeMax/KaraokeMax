<template>
  <div class="musicas-container">
    <h1 class="musicas-title">Músicas cadastradas</h1>
    <div class="search-bar">
      <input v-model="search" @input="filtrarMusicas" type="text" placeholder="Pesquisar por nome ou artista..." class="search-input" />
    </div>
    <div v-if="loading" class="loading">Carregando músicas...</div>
    <div v-else>
      <div v-if="musicasFiltradas.length === 0" class="no-results">Nenhuma música encontrada.</div>
      <ul class="musicas-list">
        <li v-for="musica in musicasFiltradas" :key="musica.id" class="musica-item">
          <div class="musica-info">
            <span class="musica-nome">{{ musica.nome }}</span>
            <span class="musica-artista">{{ musica.artista?.nome || 'Artista desconhecido' }}</span>
          </div>
          <button class="selecionar-btn" @click="selecionarMusica(musica)">Selecionar</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import api from '../services/api';
export default {
  name: 'TelaMusicas',
  data() {
    return {
      musicas: [],
      search: '',
      loading: true,
      musicasFiltradas: []
    };
  },
  methods: {
    selecionarMusica(musica) {
      // Aqui você pode definir o que acontece ao selecionar
      alert(`Selecionada: ${musica.nome}`);
    },
    async carregarMusicas() {
      this.loading = true;
      try {
        const res = await api.get('/musicas');
        // Garante que cada música tenha artista, mesmo se vier null
        this.musicas = res.data.map(m => ({
          ...m,
          artista: m.artista || { nome: 'Artista desconhecido' }
        }));
        this.musicasFiltradas = this.musicas;
      } catch (err) {
        alert('Erro ao carregar músicas.');
        this.musicas = [];
        this.musicasFiltradas = [];
      }
      this.loading = false;
    },
    filtrarMusicas() {
      const termo = this.search.trim().toLowerCase();
      if (!termo) {
        this.musicasFiltradas = this.musicas;
        return;
      }
      this.musicasFiltradas = this.musicas.filter(m =>
        m.nome.toLowerCase().includes(termo) ||
        (m.artista && m.artista.nome && m.artista.nome.toLowerCase().includes(termo))
      );
    }
  },
  mounted() {
    this.carregarMusicas();
    // Mock para visualização se não houver dados reais
    setTimeout(() => {
      if (!this.musicas.length) {
        this.musicas = [
          { id: 1, nome: 'Evidências', artista: { nome: 'Chitãozinho & Xororó' } },
          { id: 2, nome: 'Fogo e Paixão', artista: { nome: 'Wando' } },
          { id: 3, nome: 'Garçom', artista: { nome: 'Reginaldo Rossi' } },
          { id: 4, nome: 'Sinônimos', artista: { nome: 'Zezé Di Camargo & Luciano' } },
          { id: 5, nome: 'Ainda Ontem Chorei de Saudade', artista: { nome: 'João Mineiro & Marciano' } }
        ];
        this.musicasFiltradas = this.musicas;
        this.loading = false;
      }
    }, 1200);
  }
};
</script>

<style scoped>
.selecionar-btn {
  margin-left: 1.5rem;
  padding: 0.5rem 1.2rem;
  background: linear-gradient(90deg, #764ba2 0%, #667eea 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(102,126,234,0.10);
}
.selecionar-btn:hover {
  background: linear-gradient(90deg, #6b47a1 0%, #5a67d8 100%);
  transform: translateY(-2px);
}
body {
  width: 100vw;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7fafc;
}
.musicas-container {
  width: 75%;
  margin: 2rem auto;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(102,126,234,0.12);
  padding: 2rem 2rem 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.musicas-title {
  font-size: 2rem;
  color: #764ba2;
  margin-bottom: 1.2rem;
  text-align: center;
}
.search-bar {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 1.2rem;
}
.search-input {
  width: 45vw;
  min-width: 200px;
  max-width: 600px;
  margin: 0 auto;
  padding: 0.7rem 1rem;
  border-radius: 10px;
  border: 2px solid #e2e8f0;
  font-size: 1.08rem;
  background: #f7fafc;
  transition: border-color 0.2s;
  box-sizing: border-box;
  display: block;
}
.search-input:focus {
  border-color: #667eea;
  outline: none;
}

.musicas-list {
  list-style: none;
  padding: 0;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}
.musica-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 1rem 1.5rem;
  margin-bottom: 1rem;
  background: #f7f6fd;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(102,126,234,0.06);
  transition: box-shadow 0.2s, border-color 0.2s;
}
.musica-item:hover {
  border-color: #764ba2;
  box-shadow: 0 4px 16px rgba(102,126,234,0.12);
}
.musica-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: auto;
}
.musica-nome {
  font-weight: 600;
  color: #2d3748;
}
.musica-artista {
  font-size: 0.98rem;
  color: #718096;
}
.no-results {
  text-align: center;
  color: #a0aec0;
  margin-top: 2rem;
}
.loading {
  text-align: center;
  color: #667eea;
  margin-top: 2rem;
}
</style>
