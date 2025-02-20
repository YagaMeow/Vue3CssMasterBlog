import Mock from 'mockjs'
import user from './modules/user'

const { mock } = Mock;

mock("/api/base/login","post",user.login)
mock("/api/base/logout","post",user.logout)