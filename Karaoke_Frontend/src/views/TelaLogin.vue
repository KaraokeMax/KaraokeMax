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
        
        <div class="login-box">
            <div class="logo-section">
                <div class="logo-icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L13.09 8.26L19 7L14.74 12L19 17L13.09 15.74L12 22L10.91 15.74L5 17L9.26 12L5 7L10.91 8.26L12 2Z" fill="currentColor"/>
                    </svg>
                </div>
                <h1>KaraokeMax</h1>
                <p class="subtitle">Sua plataforma de karaokê profissional</p>
            </div>
            
            <form @submit.prevent="login" class="login-form">
                <div class="input-group">
                    <div class="input-wrapper">
                        <svg class="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
                        </svg>
                        <input 
                            type="text" 
                            placeholder="Email" 
                            v-model="email"
                            required
                            class="form-input"
                        />
                    </div>
                </div>
                
                <div class="input-group">
                    <div class="input-wrapper">
                        <svg class="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 8H20C20.55 8 21 8.45 21 9V21C21 21.55 20.55 22 20 22H4C3.45 22 3 21.55 3 21V9C3 8.45 3.45 8 4 8H6V6C6 3.79 7.79 2 10 2H14C16.21 2 18 3.79 18 6V8ZM8 8H16V6C16 4.9 15.1 4 14 4H10C8.9 4 8 4.9 8 6V8ZM5 10V20H19V10H5Z" fill="currentColor"/>
                        </svg>
                        <input 
                            :type="showPassword ? 'text' : 'password'"
                            placeholder="Senha" 
                            v-model="password"
                            required
                            class="form-input"
                        />
                        <button type="button" class="eye-toggle" @click="showPassword = !showPassword" :aria-label="showPassword ? 'Esconder senha' : 'Mostrar senha'">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="eye-icon">
                                <path d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7zm0 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8a3 3 0 100 6 3 3 0 000-6z" fill="#718096"/>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div class="remember-group">
                    <label class="remember-label">
                        <input type="checkbox" v-model="rememberMe" class="remember-checkbox" />
                        Lembrar-me
                    </label>
                </div>
                <button type="submit" class="login-button" :disabled="!email || !password">
                    <span class="button-text">Entrar</span>
                    <svg class="button-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" fill="currentColor"/>
                    </svg>
                </button>
            </form>
            
        </div>
    </div>
</template>

<script>
import api from '../services/api';
export default {
    name: "TelaLogin",
    data() {
        return {
            email: "",
            password: "",
            isMaximized: false,
            showPassword: false,
            rememberMe: false
        };
    },
    methods: {
        async login() {
            if (!this.email || !this.password) {
                alert("Por favor, preencha todos os campos!");
                return;
            }

            try {                
                const response = await api.post('/usuarios/login', {
                    email: this.email,
                    senha: this.password
                });

                if (response.data.primeiroAcesso) {
                    this.$router.push({ path: '/definirSenha', query: { id: response.data.id } });
                    return;
                }
                if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                    if (this.rememberMe) {
                        localStorage.setItem('rememberedEmail', this.email);
                    } else {
                        localStorage.removeItem('rememberedEmail');
                    }
                    this.$router.push('/principal');
                }
                else {
                    alert("Login falhou. Tente novamente.");
                }
            } catch (error) {
                console.error('Erro no login:', error);
                if (error.response?.status === 401) {
                    alert("Email ou senha incorretos!");
                } else {
                    alert("Erro ao fazer login. Tente novamente.");
                }
            }
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
        // Preenche o email se estiver salvo
        const remembered = localStorage.getItem('rememberedEmail');
        if (remembered) {
            this.email = remembered;
            this.rememberMe = true;
        }
    }
};
</script>

<style scoped>
/* Checkbox lembrar-me */
.remember-group {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
    width: 100%;
}
.remember-label {
    font-size: 0.98rem;
    color: #718096;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
}
.remember-checkbox {
    accent-color: #667eea;
    width: 18px;
    height: 18px;
    margin-right: 0.3rem;
}
.eye-toggle {
    position: absolute;
    right: 0.7rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px;
    display: flex;
    align-items: center;
    z-index: 3;
    height: 28px;
}
.eye-icon {
    width: 22px;
    height: 22px;
    color: #718096;
    transition: opacity 0.2s;
    display: block;
}
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

.login-form {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.input-group {
    position: relative;
}

.input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.input-icon {
    position: absolute;
    left: 1rem;
    width: 20px;
    height: 20px;
    color: #a0aec0;
    z-index: 2;
    pointer-events: none;
}

.form-input {
    width: 100%;
    padding: 1rem 1rem 1rem 3rem;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 1rem;
    background: #ffffff;
    transition: all 0.2s ease;
    outline: none;
    font-weight: 500;
}

.form-input:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    transform: translateY(-1px);
}

.form-input::placeholder {
    color: #a0aec0;
    font-weight: 400;
}

.login-button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.login-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

.login-button:active:not(:disabled) {
    transform: translateY(0);
}

.login-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.button-icon {
    width: 16px;
    height: 16px;
    transition: transform 0.2s ease;
}

.login-button:hover:not(:disabled) .button-icon {
    transform: translateX(2px);
}


/* Responsividade */
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

/* Animações de entrada */
.login-box {
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

.form-input {
    animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}
</style>