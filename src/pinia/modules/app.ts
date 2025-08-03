import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 加载页面
  const hide_loading = ref(null)
  // 标题主菜单
  const show_menus = ref<(() => void) | null>(null)
  const hide_menus = ref<(() => void) | null>(null)
  // 文章无限滑动
  const show_diagram = ref<(() => void) | null>(null)
  const hide_diagram = ref(null)
  // 文章页面
  const show_post = ref(null)
  const hide_post = ref(null)

  function first_show() {
    ;(hide_loading.value as ((cb: () => void) => void) | null)?.(() => {
      show_menus.value?.()
    })
  }

  function menus_to_diagram() {
    ;(hide_menus.value as ((cb: () => void) => void) | null)?.(() => {
      show_diagram.value?.()
    })
  }

  function diagram_to_menus() {
    ;(hide_diagram.value as ((cb: () => void) => void) | null)?.(() => {
      show_menus.value?.()
    })
  }
})
