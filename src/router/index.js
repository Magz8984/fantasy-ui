import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/Home.vue'
import Squad from '../components/Squad.vue'
import Rankings from '../components/Rankings.vue'

const router = createRouter({
  history: createWebHistory(),

  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/squad',
      name: 'squad',
      component: Squad,
    },
    {
      path: '/rankings',
      name: 'rankings',
      component: Rankings,
    },
  ],
})

export default router