import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHashHistory } from 'vue-router'
// importa a tela de login
import router  from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')

createApp(App).use(router).mount('#app')
