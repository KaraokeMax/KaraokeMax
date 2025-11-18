<template>
	<div class="container">
		<div class="pontuacoes-container">
			<h1 class="pontuacoes-title">Pontuações</h1>
			<div class="search-bar">
				<input v-model="search" @input="filtrarPontuacoes" type="text" placeholder="Pesquisar por música..."
					class="search-input" />
			</div>
			<div v-if="loading" class="loading">Carregando pontuações...</div>
			<div v-else class="container-pontuacoes-list">
				<div v-if="pontuacoesFiltradas.length === 0" class="no-results">Nenhuma pontuação encontrada.</div>
				<ul class="pontuacoes-list">
					<li v-for="pontuacao in pontuacoesFiltradas" :key="pontuacao.id" class="pontuacao-item">
						<div class="pontuacao-info">
							<span class="pontuacao-musica">{{ pontuacao.musica?.nome || 'Música desconhecida' }}</span>
							<span class="pontuacao-artista">{{ pontuacao.musica?.artista?.nome || 'Artista desconhecido' }}</span>
							<span class="pontuacao-usuario">Cantado por: {{ pontuacao.usuario?.nome || 'Usuário desconhecido' }}</span>
						</div>
						<div class="pontuacao-score">
							<span class="score-label">Pontuação</span>
							<span class="score-value">{{ pontuacao.pontuacao }}</span>
						</div>
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<script>
import api from '../services/api';

export default {
	name: 'TelaPontuacoes',
	data() {
		return {
			pontuacoes: [],
			search: '',
			loading: true,
			pontuacoesFiltradas: []
		};
	},
	methods: {
		async carregarPontuacoes() {
			this.loading = true;
			try {
				const res = await api.get('/pontuacoes');
				this.pontuacoes = res.data.map(p => ({
					...p,
					musica: p.musica || { nome: 'Música desconhecida', artista: { nome: 'Artista desconhecido' } },
					usuario: p.usuario || { nome: 'Usuário desconhecido' }
				}));
				this.pontuacoesFiltradas = this.pontuacoes;
			} catch (err) {
				console.error('Erro ao carregar pontuações:', err);
				alert('Erro ao carregar pontuações.');
				this.pontuacoes = [];
				this.pontuacoesFiltradas = [];
			}
			this.loading = false;
		},
		filtrarPontuacoes() {
			const termo = this.search.trim().toLowerCase();
			if (!termo) {
				this.pontuacoesFiltradas = this.pontuacoes;
				return;
			}
			this.pontuacoesFiltradas = this.pontuacoes.filter(p =>
				(p.musica && p.musica.nome && p.musica.nome.toLowerCase().includes(termo)) ||
				(p.musica && p.musica.artista && p.musica.artista.nome && p.musica.artista.nome.toLowerCase().includes(termo))
			);
		}
	},
	mounted() {
		// Descomente para usar dados reais da API
		// this.carregarPontuacoes();
		
		// Mock para visualização se não houver dados reais
		setTimeout(() => {
			if (!this.pontuacoes.length) {
				this.pontuacoes = [
					{ 
						id: 1, 
						pontuacao: 95, 
						musica: { nome: 'Evidências', artista: { nome: 'Chitãozinho & Xororó' } },
						usuario: { nome: 'João Silva' }
					},
					{ 
						id: 2, 
						pontuacao: 88, 
						musica: { nome: 'Fogo e Paixão', artista: { nome: 'Wando' } },
						usuario: { nome: 'Maria Santos' }
					},
					{ 
						id: 3, 
						pontuacao: 92, 
						musica: { nome: 'Garçom', artista: { nome: 'Reginaldo Rossi' } },
						usuario: { nome: 'Pedro Oliveira' }
					},
					{ 
						id: 4, 
						pontuacao: 78, 
						musica: { nome: 'Sinônimos', artista: { nome: 'Zezé Di Camargo & Luciano' } },
						usuario: { nome: 'Ana Costa' }
					},
					{ 
						id: 5, 
						pontuacao: 85, 
						musica: { nome: 'Ainda Ontem Chorei de Saudade', artista: { nome: 'João Mineiro & Marciano' } },
						usuario: { nome: 'Carlos Ferreira' }
					},
					{ 
						id: 6, 
						pontuacao: 91, 
						musica: { nome: 'Evidências', artista: { nome: 'Chitãozinho & Xororó' } },
						usuario: { nome: 'Lucia Mendes' }
					}
				];
				this.pontuacoesFiltradas = this.pontuacoes;
				this.loading = false;
			}
		}, 1200);
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

.pontuacoes-container {
	width: 95%;
	max-width: 1400px;
	height: 100%;
	padding: 30px;
	border-radius: 8px;
	color: white;
	display: flex;
	flex-direction: column;
	align-items: center;
	margin: auto;
}

.pontuacoes-title {
	font-size: 2rem;
	color: white;
	margin-bottom: 1.2rem;
	text-align: center;
}

.search-bar {
	width: 100%;
	display: flex;
	justify-content: center;
	margin-bottom: 1.2rem;
}

.container-pontuacoes-list {
	width: 100%;
	flex: 1;
	overflow-y: auto;
}

.search-input {
	width: 55vw;
	min-width: 200px;
	max-width: 800px;
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

.pontuacoes-list {
	list-style: none;
	padding: 0;
	margin: 0 auto;
	width: 50%;
	max-width: 1200px;
	box-sizing: border-box;
}

.pontuacao-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20px 30px;
	background: rgba(0, 0, 0, 0.08);
	margin: 12px 0;
	border-radius: 6px;
	transition: all 0.3s ease;
	width: 100%;
	box-sizing: border-box;
}

.pontuacao-item:hover {
	border-color: #764ba2;
	box-shadow: 0 4px 16px rgba(102, 126, 234, 0.12);
	transform: translateY(-2px);
}

.pontuacao-info {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	width: auto;
	flex: 1;
}

.pontuacao-musica {
	font-weight: 600;
	color: white;
	font-size: 1.1rem;
}

.pontuacao-artista {
	font-size: 0.98rem;
	color: #bdc3c7;
	margin-top: 2px;
}

.pontuacao-usuario {
	font-size: 0.9rem;
	color: #95a5a6;
	margin-top: 4px;
	font-style: italic;
}

.pontuacao-score {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 8px 15px;
	background: linear-gradient(135deg, #2d3260 0%, #3a225a 100%);
	border-radius: 8px;
	min-width: 80px;
    margin-left: 20px;
}

.score-label {
	font-size: 0.85rem;
	color: #bdc3c7;
	text-transform: uppercase;
	letter-spacing: 0.5px;
	margin-bottom: 4px;
}

.score-value {
	font-size: 1.5rem;
	font-weight: 700;
	color: #fff;
	text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.no-results {
	text-align: center;
	color: #a0aec0;
	margin-top: 2rem;
}

.loading {
	text-align: center;
	color: #a0aec0;
	margin-top: 2rem;
}
</style>