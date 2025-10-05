<template>
    <div class="login-container">
        <div class="login-box">
            <h1>KaraokeMax Login</h1>
            <input type="text" placeholder="Usuário" v-model="username" />
            <input type="password" placeholder="Senha" v-model="password" />
            <button @click="login">Entrar</button>
        </div>
    </div>
</template>

<script>
export default {
    name: "TelaLogin",
    data() {
        return {
            username: "",
            password: ""
        };
    },
    methods: {
        login() {
            // Lógica de login aqui
            alert("Login realizado!");
        }
    }
};
</script>

<style scoped>
.login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #7b2ff2 0%, #f357a8 100%);
}

.login-box {
    background: white;
    padding: 2rem 2.5rem;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(123, 47, 242, 0.2);
    display: flex;
    flex-direction: column;
    align-items: center;
}

.login-box h1 {
    color: #7b2ff2;
    margin-bottom: 1.5rem;
}

.login-box input {
    width: 100%;
    padding: 0.75rem;
    margin-bottom: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
}

.login-box button {
    background: #7b2ff2;
    color: white;
    border: none;
    padding: 0.75rem 2rem;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s;
}

.login-box button:hover {
    background: #5e1bb7;
}
</style>