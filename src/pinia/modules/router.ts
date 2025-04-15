import { defineStore } from "pinia"
import { ref } from 'vue'
export const useRouterStore = defineStore('router', () => {
    const asyncRouters = ref([{}])
    const baseRouter = [
        {

        }
    ]
    // const SetAsyncRouter = async () => {
    //     const asyncRouter = [{
    //         path: '/edit',
    //         name: 'edit',
    //         component: () => import('@/views/EditPage/EditPage.vue')
    //     }]
    //     console.log(asyncRouter)
    //     asyncRouters.value = asyncRouter
    //     return true
    // }
    return {
        // asyncRouters,
        // SetAsyncRouter
    }
})
