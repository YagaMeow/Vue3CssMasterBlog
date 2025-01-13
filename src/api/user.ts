import service from "@/utils/request";

export const login = (data: any) => {
    return service({
        url: '/base/users',
        method: 'get',
        data: data
    })
}