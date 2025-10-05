import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHashHistory } from 'vue-router'

// importa a tela de login
import TelaLogin from './views/TelaLogin.vue'

const routes = [
  { path: '/', component: TelaLogin } 
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

createApp(App).use(router).mount('#app')
