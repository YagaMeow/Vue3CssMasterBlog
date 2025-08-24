import service from '@/utils/request'
interface LoginData {
  username: string
  password: string
}

export const login = (data: LoginData) => {
  return service({
    url: '/login',
    method: 'post',
    data: data,
  })
}

export const getAuth = () => {
  return service({
    url: '/api/auth',
    method: 'POST',
  })
}
