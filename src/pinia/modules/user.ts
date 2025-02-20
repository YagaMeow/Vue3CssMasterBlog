import { login } from "@/api/user";
import { defineStore } from "pinia";
import { useAppStore } from "./app";
import { computed, ref } from "vue";
import { useStorage } from "@vueuse/core";
import { useCookies } from "@vueuse/integrations/useCookies";
import { ElMessage } from "element-plus";
import { useRouterStore } from "./router";
import router from "@/router";
import type { RouteRecordRaw } from "vue-router";
import { fa } from "element-plus/es/locales.mjs";

interface LoginResponse {
    code: number
    message: string
    data: {
        user: any
        token: string
    }
}

export const useUserStore = defineStore('user', () => {
    const appStore = useAppStore()
    const userInfo = ref({
        id: '',
        name: ''
    })
    const token = useStorage('token', '')
    const xToken = useCookies(['x-token'])
    const currentToken = computed(() => token.value || xToken.get('x-token') || '')

    const LoginIn = async (loginInfo: any) => {
        const res = await login(loginInfo) as unknown
        console.log(res)
        if ((res as LoginResponse).code !== 0) {
            ElMessage.error((res as LoginResponse).message || '登录失败')
            return false
        }
        setUserInfo((res as LoginResponse).data)
        setToken((res as LoginResponse).data.token)
        const routerStore = useRouterStore()
        await routerStore.SetAsyncRouter()
        const asyncRouters = routerStore.asyncRouters
        asyncRouters.forEach(r => {
            router.addRoute(r as RouteRecordRaw)
        })
        return true
    }

    const setUserInfo = (val: any) => {
        userInfo.value = val
    }

    const setToken = (val: string) => {
        token.value = val
        xToken.set('x-token', val)
    }

    const GetUserInfo = () => {
        return userInfo.value
    }

    const CheckLogin = () => {
        const token = localStorage.getItem('token')
        if (token)
            return true
        else
            return false
    }

    return {
        CheckLogin,
        LoginIn,
        GetUserInfo
    }
})

