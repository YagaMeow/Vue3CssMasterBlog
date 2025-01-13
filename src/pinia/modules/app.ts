import { defineStore } from "pinia";
import { ref } from "vue";

export const useAppStore = defineStore('app', () => {
    const device = ref('')
    const drawerSize = ref('')
    const operateMinWith = ref('240')
})