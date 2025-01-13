import { login } from "@/api/user";
import { defineStore } from "pinia";
import { useAppStore } from "./app";
import { computed, ref } from "vue";
import { useStorage } from "@vueuse/core";
import { useCookies } from "@vueuse/integrations/useCookies";
import Login from "@/components/Login/Login.vue";


interface LoginResponse {
    code: number
}


export const useUserStore = defineStore('user', () => {
    const appStore = useAppStore()
    const userInfo = ref({
        id: '',
        name: ''
    })
    const token = useStorage('token', '')
    const xToken = useCookies(['x-token'])
    const currentToken = computed(() => token.value || xToken || '')

    const LoginIn = async (loginInfo: any) => {
        const res = await login(loginInfo) as unknown
        if ((res as LoginResponse).code !== 0) {
            console.log('login failed')
            return false
        }
    }

    return {
        LoginIn
    }
})

