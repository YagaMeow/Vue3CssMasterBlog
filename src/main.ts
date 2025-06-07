// import './assets/main.css'
import './assets/style.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'element-plus/dist/index.css'

import ElementPlus from 'element-plus'

import { createApp } from 'vue'
import { store } from './pinia'

import App from './App.vue'
import router from './router'

import 'virtual:svg-icons-register'
import initSvgIcon from '@/assets/icons/index'

const app = createApp(App)

app.use(router).use(store).use(ElementPlus).use(initSvgIcon)

app.mount('#app')
