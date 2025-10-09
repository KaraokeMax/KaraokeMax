<template>
    <div class="main-container">
        <!-- Barra de título personalizada -->
        <div class="title-bar">
            <div class="title-bar-drag-area">
                <span class="app-title">KaraokeMax - Bem-vindo, {{ usuario.nome }}!</span>
            </div>
            <div class="title-bar-controls">
                <button class="title-bar-button minimize" @click="minimizeWindow" title="Minimizar">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 19H18V17H6V19Z" fill="currentColor"/>
                    </svg>
                </button>
                <button class="title-bar-button maximize" @click="maximizeWindow" title="Maximizar/Restaurar">
                    <svg v-if="!isMaximized" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 4H20V20H4V4ZM6 6V18H18V6H6Z" fill="currentColor"/>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 8H8V4H20V16H16V20H4V8ZM6 6V18H14V16H18V6H6ZM8 8V14H6V8H8Z" fill="currentColor"/>
                    </svg>
                </button>
                <button class="title-bar-button close" @click="closeWindow" title="Fechar">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
                    </svg>
                </button>
            </div>
        </div>

        <div class="main-content">
            <div class="welcome-section">
                <div class="welcome-icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L13.09 8.26L19 7L14.74 12L19 17L13.09 15.74L12 22L10.91 15.74L5 17L9.26 12L5 7L10.91 8.26L12 2Z" fill="currentColor"/>
                    </svg>
                </div>
                <h1>Bem-vindo ao KaraokeMax!</h1>
                <p class="welcome-subtitle">Sua plataforma de karaokê profissional</p>
                
                <div class="user-info">
                    <div class="info-card">
                        <h3>Informações do Usuário</h3>
                        <div class="info-item">
                            <span class="label">Nome:</span>
                            <span class="value">{{ usuario.nome }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Email:</span>
                            <span class="value">{{ usuario.email }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Tipo:</span>
                            <span class="value">{{ usuario.tipo }}</span>
                        </div>
                    </div>
                </div>

                <div class="action-buttons">
                    <button class="action-button primary" @click="logout">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.59L17 17L22 12L17 7ZM4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z" fill="currentColor"/>
                        </svg>
                        Sair
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import api from '../services/api.js';

export default {
    name: "TelaPrincipal",
    data() {
        return {
            usuario: {
                nome: '',
                email: '',
                tipo: ''
            },
            isMaximized: false
        };
    },
    methods: {
        minimizeWindow() {
            if (window.electronAPI) {
                window.electronAPI.minimizeWindow();
            }
        },
        closeWindow() {
            if (window.electronAPI) {
                window.electronAPI.closeWindow();
            }
        },
        async maximizeWindow() {
            if (window.electronAPI) {
                const maximized = await window.electronAPI.maximizeWindow();
                this.isMaximized = maximized;
            }
        },
        async checkMaximizedState() {
            if (window.electronAPI) {
                this.isMaximized = await window.electronAPI.isMaximized();
            }
        },
        async logout() {
            try {
                localStorage.removeItem('token');
                this.$router.push('/');
            } catch (error) {
                console.error('Erro ao fazer logout:', error);
            }
        }
    },
    async mounted() {
        this.checkMaximizedState();
        
        // Buscar dados do usuário usando o token
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await api.get('/usuarios/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                this.usuario = response.data;
            } catch (error) {
                console.error('Erro ao buscar dados do usuário:', error);
                this.logout();
            }
        } else {
            this.logout();
        }
    }
};
</script>

<style scoped>
.main-container {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    position: fixed;
    top: 0;
    left: 0;
    overflow: hidden;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    margin: 0;
    padding: 0;
}

.title-bar {
    height: 32px;
    background: rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 8px;
    -webkit-app-region: drag;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    z-index: 1000;
}

.title-bar-drag-area {
    display: flex;
    align-items: center;
    flex: 1;
    height: 100%;
}

.app-title {
    color: rgba(255, 255, 255, 0.9);
    font-size: 13px;
    font-weight: 500;
    margin-left: 8px;
}

.title-bar-controls {
    display: flex;
    align-items: center;
    -webkit-app-region: no-drag;
}

.title-bar-button {
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    border-radius: 4px;
}

.title-bar-button:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
}

.title-bar-button.close:hover {
    background: #e81123;
    color: white;
}

.title-bar-button svg {
    width: 16px;
    height: 16px;
}

.main-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
}

.welcome-section {
    text-align: center;
    max-width: 600px;
    width: 100%;
}

.welcome-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 2rem;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #667eea;
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.welcome-icon svg {
    width: 40px;
    height: 40px;
}

.welcome-section h1 {
    color: white;
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.welcome-subtitle {
    color: rgba(255, 255, 255, 0.8);
    font-size: 1.1rem;
    margin-bottom: 3rem;
    font-weight: 400;
}

.user-info {
    margin-bottom: 3rem;
}

.info-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    padding: 2rem;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
}

.info-card h3 {
    color: #2d3748;
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    text-align: center;
}

.info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.info-item:last-child {
    border-bottom: none;
}

.label {
    color: #718096;
    font-weight: 500;
    font-size: 0.95rem;
}

.value {
    color: #2d3748;
    font-weight: 600;
    font-size: 0.95rem;
}

.action-buttons {
    display: flex;
    justify-content: center;
    gap: 1rem;
}

.action-button {
    padding: 1rem 2rem;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.action-button.primary {
    background: rgba(255, 255, 255, 0.95);
    color: #e53e3e;
    backdrop-filter: blur(10px);
}

.action-button.primary:hover {
    background: #e53e3e;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(229, 62, 62, 0.3);
}

.action-button svg {
    width: 20px;
    height: 20px;
}

/* Responsividade */
@media (max-width: 480px) {
    .welcome-section h1 {
        font-size: 2rem;
    }
    
    .welcome-icon {
        width: 64px;
        height: 64px;
    }
    
    .welcome-icon svg {
        width: 32px;
        height: 32px;
    }
    
    .info-card {
        padding: 1.5rem;
    }
    
    .action-button {
        padding: 0.875rem 1.5rem;
    }
}

/* Animações */
.welcome-section {
    animation: slideInUp 0.6s ease-out;
}

@keyframes slideInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>