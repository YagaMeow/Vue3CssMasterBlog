import { createRouter, createWebHistory } from 'vue-router'

import {useUserStore} from '../pinia'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginPage/LoginPage.vue')
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
      path: '/edit',
      name: 'edit',
      component: () => import('@/views/EditPage/EditPage.vue')
    }
  ],
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const user = userStore.GetUserInfo()
  console.log(user.name)
  if(to.path === '/login' && userStore.CheckLogin()){
    next('/edit')
  }else if(to.path === 'edit' && !userStore.CheckLogin()) {
    next('/login')
  }else {
    next()
  }
  
})

export default router
