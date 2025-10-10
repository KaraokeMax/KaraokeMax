import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHashHistory } from 'vue-router'
// importa a tela de login
import TelaLogin from './views/TelaLogin.vue'
import TelaPrincipal from './views/TelaPrincipal.vue'

const routes = [
  { path: '/', component: TelaLogin },
  { path: '/principal', component: TelaPrincipal }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

createApp(App).use(router).mount('#app')
