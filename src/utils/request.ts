import { useUserStore } from '@/pinia/modules/user'
import axios, { type AxiosRequestHeaders, type InternalAxiosRequestConfig } from 'axios'

const service = axios.create({
  baseURL: import.meta.env.VITE_BASE_API,
  timeout: 5 * 1000,
})

service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const userStore = useUserStore()
    const token = userStore.currentToken
    config.headers['Content-Type'] = 'application/json'
    config.headers['x-token'] = token
    return config
  },
  (error) => {
    return error
  },
)

service.interceptors.response.use(
  (response) => {
    console.log(response)
    const useStore = useUserStore()
    if (response.data.code === 200) {
      return response.data
    } else return response.data.msg ? response.data : response
  },
  (error) => {
    if (error.response && error.response.status === 400) {
      const errMessage = error.response.data.message || '请求错误'
      return Promise.reject(new Error(errMessage))
    }
    return Promise.reject(error)
  },
)

export default service
