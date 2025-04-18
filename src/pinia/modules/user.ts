import { login } from '@/api/user'
import { defineStore } from 'pinia'
import { useAppStore } from './app'
import { computed, ref } from 'vue'
import { useStorage } from '@vueuse/core'
import { useCookies } from '@vueuse/integrations/useCookies'
import { ElMessage } from 'element-plus'
import { useRouterStore } from './router'
import router from '@/router'
import type { RouteRecordRaw } from 'vue-router'
import { fa } from 'element-plus/es/locales.mjs'

interface LoginResponse {
  code: number
  message: string
  data: {
    user: { ID: number; username: string }
    token: string
  }
}

export const useUserStore = defineStore('user', () => {
  const appStore = useAppStore()
  const userInfo = ref({
    id: '',
    name: '',
  })
  const token = useStorage('token', '')
  const xToken = useCookies(['x-token'])
  const currentToken = computed(() => token.value || xToken.get('x-token') || '')
  const isLoggedIn = computed(() => !!currentToken.value)

  interface LoginInfo {
    username: string
    password: string
  }

  const LoginIn = async (loginInfo: LoginInfo) => {
    const res = (await login(loginInfo)) as unknown as LoginResponse
    if ((res.data as unknown as LoginResponse).code !== 200) {
      ElMessage.error((res as LoginResponse).message || '登录失败')
      return false
    }
    setUserInfo((res.data as unknown as LoginResponse).data.user)
    setToken((res.data as unknown as LoginResponse).data.token)
    // const routerStore = useRouterStore()
    // await routerStore.SetAsyncRouter()
    // const asyncRouters = routerStore.asyncRouters
    // asyncRouters.forEach(r => {
    //     router.addRoute(r as RouteRecordRaw)
    // })
    return true
  }

  const setUserInfo = (val: { ID: number; username: string }) => {
    userInfo.value = {
      id: val.ID.toString(),
      name: val.username,
    }
  }

  const setToken = (val: string) => {
    token.value = val
    xToken.set('x-token', val)
  }

  const GetUserInfo = () => {
    return userInfo.value
  }

  const Logout = () => {
    localStorage.removeItem('token')
    xToken.remove('x-token')
    userInfo.value = { id: '', name: '' }
  }

  const CheckLogin = () => {
    const token = localStorage.getItem('token')
    if (token) return true
    else return false
  }

  return {
    currentToken,
    isLoggedIn,
    CheckLogin,
    Logout,
    LoginIn,
    GetUserInfo,
  }
})
