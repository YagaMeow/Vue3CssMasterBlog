import { useUserStore } from '@/pinia/modules/user'
import axios, { type AxiosRequestHeaders, type InternalAxiosRequestConfig } from 'axios'

console.log(import.meta.env)

const service = axios.create({
  baseURL: import.meta.env.VITE_BASE_API,
  timeout: 5 * 1000,
})

service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const userStore = useUserStore()
    const token = userStore.currentToken
    if (!config.headers['Content-Type']) config.headers['Content-Type'] = 'application/json'
    config.headers['x-token'] = token
    return config
  },
  (error) => {
    return error
  },
)

service.interceptors.response.use(
  (response) => {
    // console.log(response)
    const useStore = useUserStore()
    if (response.data.code === 200) {
      return response.data
    } else return response.data.msg ? response.data : response
  },
  (error) => {

    if (error.response) {
      switch (error.response.status) {
        case 400: {
          const errMessage = error.response.data.message || '请求错误'
          return Promise.reject(new Error(errMessage))
        }
        case 401: {
          const userStore = useUserStore()
          userStore.Logout()
          return Promise.reject(new Error('未授权，请登录'))
        }
        default: {
          console.log(error)
          return Promise.reject(new Error(error.response.data.message))
        }
      }
    }
  },
)

export default service
