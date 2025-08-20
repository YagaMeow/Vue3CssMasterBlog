import { onMounted, onUnmounted, ref } from "vue"
import type { Ref } from "vue"
export default function (containerRef: Ref<HTMLElement>) {
    const showMenu = ref(false)
    const x = ref(0)
    const y = ref(0)
    const handleContextMenu = (e:MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        showMenu.value = true
        console.log(e.clientX,e.clientY)
        x.value = e.clientX
        y.value = e.clientY
    }
    const closeMenu = (e:MouseEvent) => {
        showMenu.value = false
    }
    onMounted(() => {
        const div = containerRef.value
        console.log("haha",div)
        div.addEventListener("contextmenu",handleContextMenu)
        window.addEventListener("click",closeMenu);
    })
    onUnmounted(() => {

    })
    return {
        showMenu, x, y
    }
}