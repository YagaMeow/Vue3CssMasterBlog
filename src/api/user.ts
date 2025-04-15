import service from "@/utils/request";
interface LoginData {
    username: string;
    password: string;
}

export const login = (data: LoginData) => {
    return service({
        url: 'http://127.0.0.1:8889/login',
        method: 'post',
        data: data
    })
}
