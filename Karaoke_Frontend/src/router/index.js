import { createRouter, createWebHistory } from "vue-router";
import TelaLogin from "../views/TelaLogin.vue"; 

const routes = [
  {
    path: "/",
    name: "Login",
    component: TelaLogin
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
