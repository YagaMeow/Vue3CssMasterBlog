import service from "@/utils/request";

interface LoginResponse {
    code: number
    msg: string
}

export const login = (data: any) => {
    return service<LoginResponse>({
        url: '/base/login',
        method: 'post',
        data: data
    })
}