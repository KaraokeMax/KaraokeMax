import { createRouter, createWebHashHistory } from "vue-router";
import TelaLogin from "../views/TelaLogin.vue";
import TelaPrincipal from "../views/TelaPrincipal.vue";

const routes = [
  {
    path: "/",
    name: "Login",
    component: TelaLogin
  },
  {
    path: "/principal",
    name: "Principal",
    component: TelaPrincipal,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});


// Guard para proteger rotas que requerem autenticação
router.isReady().then((to, from, next) => {
  const token = localStorage.getItem('token');
  console.log(token);
  
  if (to.meta.requiresAuth && !token) {
    next('/');
  } else if (to.name === 'Login' && token) {
    next('/principal');
  } else {
    next();
  }
});

export default router;
