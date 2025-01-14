import service from "@/utils/request";
export const login = (data: any) => {
    return service({
        url: '/base/login',
        method: 'post',
        data: data
    })
}