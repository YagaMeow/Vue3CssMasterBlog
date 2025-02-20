import { Random } from 'mockjs'

function login(req) {
    return {
        code: 0,
        data: {
            username: Random.cname(),
            token: Random.guid(),
            message: "Login succeed"
        },
        headers: {
            success: true,
            message: true
        }
    }
}

function logout(req) {
    return {
        code: 0,
        data: {
            username: Random.cname(),
            age: Random.integer(10,30),
            date: Random.date(),
            message: ""
        }
    }
}

export default {
    login,
    logout
}