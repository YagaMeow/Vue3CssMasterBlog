import { createRouter, createWebHistory } from 'vue-router'

import { useUserStore } from '../pinia'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginPage/LoginPage.vue'),
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('@/views/AboutView.vue'),
    },
    {
      path: '/404',
      name: '404',
      component: () => import('@/views/Error/404.vue'),
    },
    {
      path: '/posts/:uri',
      name: 'Post',
      component: () => import('@/views/PostPage/PostPage.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404',
      name: 'notFound',
    },
  ],
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const user = userStore.GetUserInfo()
  console.log(user.name)
  if (to.path === '/login' && userStore.CheckLogin()) {
    next('/')
  } else {
    next()
  }
})

export default router
