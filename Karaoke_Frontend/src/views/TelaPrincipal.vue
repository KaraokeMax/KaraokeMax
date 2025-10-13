<template>
    <div class="main-menu-layout">
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
                <div class="notification-dropdown-wrapper">
                    <button class="title-bar-button notification-bell" @click="toggleDropdown" title="Notificações">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C8.13 2 5 5.13 5 9V15L3 17V18H21V17L19 15V9C19 5.13 15.87 2 12 2ZM12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22Z" fill="currentColor"/>
                        </svg>
                        <span v-if="notificacoes.length" class="notification-dot"></span>
                    </button>
                    <div v-if="dropdownOpen" class="notification-dropdown">
                        <div class="notification-title">Notificações</div>
                        <ul class="notification-list">
                            <li v-for="(n, idx) in notificacoes" :key="idx" class="notification-item">
                                {{ n.mensagem }}
                            </li>
                            <li v-if="!notificacoes.length" class="notification-item empty">Nenhuma notificação</li>
                        </ul>
                    </div>
                </div>
                <button class="title-bar-button close" @click="closeWindow" title="Fechar">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
                    </svg>
                </button>
            </div>
        </div>

        <div class="main-content">
            <aside class="sidebar">
                <div class="sidebar-header">
                    <div class="logo-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L13.09 8.26L19 7L14.74 12L19 17L13.09 15.74L12 22L10.91 15.74L5 17L9.26 12L5 7L10.91 8.26L12 2Z" fill="currentColor"/>
                        </svg>
                    </div>
                    <h2 class="sidebar-title">KaraokeMax</h2>
                </div>
                <nav class="sidebar-menu">
                    <button class="sidebar-btn" @click="irParaEscolherMusica">
                        <span class="icon">🎤</span>
                        <span>Escolher música</span>
                    </button>
                    <button class="sidebar-btn" @click="irParaAdicionarMusica">
                        <span class="icon">➕</span>
                        <span>Adicionar música</span>
                    </button>
                    <button class="sidebar-btn" @click="irParaPontuacoes">
                        <span class="icon">🏆</span>
                        <span>Ver pontuações</span>
                    </button>
                </nav>
            </aside>
            <section class="menu-welcome">
                <div class="welcome-content">
                    <!-- Notificações agora estão no dropdown do sino -->
                    <h1>Bem-vindo ao KaraokeMax!</h1>
                    <p>Escolha uma opção no menu à esquerda para começar a cantar, adicionar músicas ou ver as pontuações dos participantes.</p>
                    <div class="welcome-illustration">
                        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="60" cy="60" r="60" fill="#667eea" fill-opacity="0.15"/>
                            <path d="M60 30L70 80L50 80Z" fill="#764ba2"/>
                            <ellipse cx="60" cy="90" rx="12" ry="5" fill="#667eea"/>
                        </svg>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>

<script>
export default {
    name: 'TelaPrincipal',
    data() {
        return {
            isMaximized: false,
            notificacoes: [
                { mensagem: '🎉 Bem-vindo! Você tem uma nova música disponível.' },
                { mensagem: '🔔 Você recebeu uma pontuação!' },
                { mensagem: '🎵 Nova playlist adicionada.' }
            ],
            dropdownOpen: false
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
        },
        toggleDropdown() {
            this.dropdownOpen = !this.dropdownOpen;
            if (this.dropdownOpen) {
                document.addEventListener('mousedown', this.handleClickOutside);
            } else {
                document.removeEventListener('mousedown', this.handleClickOutside);
            }
        },
        handleClickOutside(event) {
            const dropdown = this.$el.querySelector('.notification-dropdown-wrapper');
            if (dropdown && !dropdown.contains(event.target)) {
                this.dropdownOpen = false;
                this.notificacoes = [];
                document.removeEventListener('mousedown', this.handleClickOutside);
            }
        }
    },
    mounted() {
        this.checkMaximizedState();
    },
    beforeDestroy() {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }
};
</script>

<style scoped>
.notification-dropdown-wrapper {
    position: relative;
    display: inline-block;
}
.notification-bell {
    position: relative;
}
.notification-dot {
    position: absolute;
    top: 7px;
    right: 7px;
    width: 8px;
    height: 8px;
    background: #e81123;
    border-radius: 50%;
    border: 2px solid #fff;
    z-index: 2;
}
.notification-dropdown {
    position: absolute;
    top: 36px;
    right: 0;
    min-width: 220px;
    background: rgba(255,255,255,0.97);
    color: #2d3748;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(44,62,80,0.18);
    padding: 12px 0 8px 0;
    z-index: 2000;
    font-size: 0.98rem;
    border: 1px solid #e2e8f0;
}
.notification-title {
    font-weight: 700;
    font-size: 1.08rem;
    margin-bottom: 8px;
    margin-left: 18px;
    letter-spacing: 0.02em;
    color: #4b2676;
}
.notification-list {
    list-style: none;
    padding: 0 18px;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.notification-item {
    background: #edeff5;
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 0.98rem;
    box-shadow: 0 2px 8px rgba(44,62,80,0.08);
    color: #373f7c;
    display: flex;
    align-items: center;
}
.notification-item.empty {
    background: none;
    color: #808080;
    font-style: italic;
    box-shadow: none;
    justify-content: center;
}
.notification-item.empty {
    background: none;
    color: #eee;
    font-style: italic;
    box-shadow: none;
    justify-content: center;
}
.main-menu-layout {
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
    display: flex;
    flex: 1;
    height: calc(100vh - 32px);
}

.sidebar {
    width: 240px;
    background: linear-gradient(135deg, #2d3260 0%, #3a225a 100%);
    box-shadow: 0 8px 32px 0 rgba(44,62,80,0.18);
    border-right: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px 0 0 0;
    z-index: 10;
    border-radius: 0 24px 24px 0;
}
.sidebar-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 32px;
}
.logo-icon {
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.18);
    margin-bottom: 10px;
}
.logo-icon svg {
    width: 28px;
    height: 28px;
}
.sidebar-title {
    color: #fff;
    font-size: 1.3rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    text-shadow: 0 2px 8px rgba(44, 62, 80, 0.18);
}
.sidebar-menu {
    display: flex;
    flex-direction: column;
    gap: 18px;
    width: 100%;
    align-items: center;
}
.sidebar-btn {
    width: 180px;
    padding: 14px 18px;
    font-size: 1.08rem;
    font-weight: 600;
    border-radius: 8px;
    border: none;
    background: rgba(255,255,255,0.08);
    color: #fff;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.12);
    transition: background 0.2s, transform 0.2s;
    display: flex;
    align-items: center;
    gap: 0.7rem;
    justify-content: flex-start;
}
.sidebar-btn:hover {
    background: rgba(255,255,255,0.18);
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.18);
}
.sidebar-btn:active {
    transform: translateY(0);
}
.sidebar-btn:hover {
    background: linear-gradient(120deg, #5a67d8 0%, #6b47a1 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.18);
}
.sidebar-btn:active {
    transform: translateY(0);
}
.icon {
    font-size: 1.3rem;
    margin-right: 8px;
}
.menu-welcome {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    position: relative;
    z-index: 1;
}
.welcome-content {
    background: rgba(255,255,255,0.85);
    border-radius: 24px;
    box-shadow: 0 8px 32px rgba(102,126,234,0.10);
    padding: 48px 40px;
    text-align: center;
    max-width: 480px;
}
.welcome-content h1 {
    color: #2d3748;
    font-size: 2.1rem;
    font-weight: 800;
    margin-bottom: 1rem;
}
.welcome-content p {
    color: #4a5568;
    font-size: 1.08rem;
    margin-bottom: 2rem;
}
.welcome-illustration {
    margin: 0 auto;
    margin-top: 12px;
}
@media (max-width: 700px) {
    .main-content {
        flex-direction: column;
    }
    .sidebar {
        width: 100vw;
        flex-direction: row;
        justify-content: center;
        padding: 12px 0;
        border-right: none;
        border-bottom: 1px solid rgba(102,126,234,0.12);
    }
    .sidebar-header {
        flex-direction: row;
        margin-bottom: 0;
        margin-right: 18px;
    }
    .sidebar-title {
        font-size: 1.1rem;
    }
    .sidebar-menu {
        flex-direction: row;
        gap: 10px;
    }
    .sidebar-btn {
        width: auto;
        padding: 10px 12px;
        font-size: 1rem;
    }
    .menu-welcome {
        padding: 12px;
    }
    .welcome-content {
        padding: 24px 10px;
    }
}
</style>
