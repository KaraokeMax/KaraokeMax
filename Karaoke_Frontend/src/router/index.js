import { createRouter, createWebHashHistory } from "vue-router";
import TelaLogin from "../views/TelaLogin.vue";
import TelaPrincipal from "../views/TelaPrincipal.vue";
import TelaMusicas from "../views/TelaMusicas.vue";
import TelaKaraoke from "../views/TelaKaraoke.vue";
import TelaDefinirSenha from "../views/TelaDefinirSenha.vue";
import TelaAdicionarMusica from "../views/TelaAdicionarMusica.vue";

const routes = [
	{
		path: "/",
		name: "Login",
		component: TelaLogin
	},
	{
		path: "/definirSenha",
		name: "DefinirSenha",
		component: TelaDefinirSenha
	},
	{
		path: "/principal",
		name: "Principal",
		component: TelaPrincipal,
		meta: { requiresAuth: true }
	},
	{
		path: "/musicas",
		name: "Musicas",
		component: TelaMusicas,
		meta: { requiresAuth: true }
	},
	{
		path: "/karaoke",
		name: "Karaoke",
		component: TelaKaraoke,
		props: route => ({ id: route.query.id})
	},
	{
		path: "/adicionarMusica",
		name: "AdicionarMusica",
		component: TelaAdicionarMusica,
		meta: { requiresAuth: true }
	}
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

// Guard para proteger rotas que requerem autenticação
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token');
    const expiry = localStorage.getItem('token_expiry');
    const now = Date.now();

    // Verifica se o token existe e se está expirado
    const isTokenValid = token && expiry && now < Number(expiry);

    if (to.meta.requiresAuth && !isTokenValid) {
        // Remove token inválido
        localStorage.removeItem('token');
        localStorage.removeItem('token_expiry');
        next('/');
    } else if (to.name === 'Login' && isTokenValid) {
        next('/principal');
    } else {
        next();
    }
});

export default router;