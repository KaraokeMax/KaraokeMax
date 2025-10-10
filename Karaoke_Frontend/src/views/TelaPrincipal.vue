
<template>
    <div class="login-container">
        <!-- Barra de título personalizada -->
        <div class="title-bar">
            <div class="title-bar-drag-area">
                <span class="app-title">KaraokeMax</span>
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

        <div class="background-decoration">
            <div class="floating-shapes">
                <div class="shape shape-1"></div>
                <div class="shape shape-2"></div>
                <div class="shape shape-3"></div>
            </div>
        </div>

        <div class="login-box principal-box">
            <div class="logo-section">
                <div class="logo-icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L13.09 8.26L19 7L14.74 12L19 17L13.09 15.74L12 22L10.91 15.74L5 17L9.26 12L5 7L10.91 8.26L12 2Z" fill="currentColor"/>
                    </svg>
                </div>
                <h1>KaraokeMax</h1>
                <p class="subtitle">Escolha uma opção para começar</p>
            </div>
            <div class="menu">
                <button class="principal-button" @click="irParaEscolherMusica">
                    <span>🎤 Escolher música para cantar</span>
                </button>
                <button class="principal-button" @click="irParaAdicionarMusica">
                    <span>➕ Adicionar uma música</span>
                </button>
                <button class="principal-button" @click="irParaPontuacoes">
                    <span>🏆 Ver pontuações</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'TelaPrincipal',
    data() {
        return {
            isMaximized: false
        };
    },
    methods: {
        irParaEscolherMusica() {
            this.$router.push({ name: 'EscolherMusica' });
        },
        irParaAdicionarMusica() {
            this.$router.push({ name: 'AdicionarMusica' });
        },
        irParaPontuacoes() {
            this.$router.push({ name: 'Pontuacoes' });
        },
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
        }
    },
    mounted() {
        this.checkMaximizedState();
    }
};
</script>

<style scoped>
.login-container {
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

.background-decoration {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
}

.floating-shapes {
    position: relative;
    width: 100%;
    height: 100%;
}

.shape {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    animation: float 6s ease-in-out infinite;
}

.shape-1 {
    width: 200px;
    height: 200px;
    top: 10%;
    left: 10%;
    animation-delay: 0s;
}

.shape-2 {
    width: 150px;
    height: 150px;
    top: 60%;
    right: 15%;
    animation-delay: 2s;
}

.shape-3 {
    width: 100px;
    height: 100px;
    bottom: 20%;
    left: 20%;
    animation-delay: 4s;
}

@keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(180deg); }
}

.login-box {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    padding: 3rem 2.5rem;
    border-radius: 24px;
    box-shadow: 
        0 20px 40px rgba(0, 0, 0, 0.1),
        0 0 0 1px rgba(255, 255, 255, 0.2);
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 420px;
    position: relative;
    z-index: 1;
    border: 1px solid rgba(255, 255, 255, 0.3);
    margin: auto;
}

.logo-section {
    text-align: center;
    margin-bottom: 2.5rem;
}

.logo-icon {
    width: 64px;
    height: 64px;
    margin: 0 auto 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.logo-icon svg {
    width: 32px;
    height: 32px;
}

.login-box h1 {
    color: #2d3748;
    margin-bottom: 0.5rem;
    font-size: 2rem;
    font-weight: 700;
    letter-spacing: -0.025em;
}

.subtitle {
    color: #718096;
    font-size: 0.95rem;
    margin: 0;
    font-weight: 400;
}

.menu {
    display: flex;
    flex-direction: column;
    gap: 22px;
    align-items: center;
    width: 100%;
}

.principal-button {
    width: 100%;
    max-width: 320px;
    min-width: 220px;
    box-sizing: border-box;
    justify-content: center;
    text-align: center;
}

.principal-button {
    padding: 16px 40px;
    font-size: 1.15rem;
    font-weight: 600;
    border-radius: 10px;
    border: none;
    background: linear-gradient(120deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    cursor: pointer;
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.18);
    transition: background 0.2s, transform 0.2s;
    display: flex;
    align-items: center;
    gap: 0.7rem;
}

.principal-button:hover {
    background: linear-gradient(120deg, #5a67d8 0%, #6b47a1 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.28);
}

.principal-button:active {
    transform: translateY(0);
}

@media (max-width: 480px) {
    .login-box {
        margin: 1rem;
        padding: 2rem 1.5rem;
    }
    .login-box h1 {
        font-size: 1.75rem;
    }
    .logo-icon {
        width: 56px;
        height: 56px;
    }
    .logo-icon svg {
        width: 28px;
        height: 28px;
    }
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
