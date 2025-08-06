import { defineStore } from 'pinia'
import { ref } from 'vue'
import type Lenis from 'lenis'

export const useAppStore = defineStore('app', () => {
  // 加载页面
  const hide_loading = ref<((im: () => void, nx: () => void) => void) | null>(null)
  // 标题主菜单
  const show_menus = ref<(() => void) | null>(null)
  const hide_menus = ref<((im: () => void, nx: () => void) => void) | null>(null)
  //导航栏
  const show_nav = ref<(() => void) | null>(null)
  const hide_nav = ref<((im: () => void, nx: () => void) => void) | null>(null)
  // 文章无限滑动
  const show_diagram = ref<(() => void) | null>(null)
  const hide_diagram = ref<((im: () => void, nx: () => void) => void) | null>(null)

  // 文章标签页
  const show_tab = ref<(() => void) | null>(null)
  const hide_tab = ref<(() => void) | null>(null)
  // 文章页面
  const show_post = ref<(() => void) | null>(null)
  const hide_post = ref<((im: () => void, nx: () => void) => void) | null>(null)

  const lenis = ref<Lenis>

  const post_data = ref({
    title: '',
    uri: '',
    id: 0,
    created_at: '',
  })

  function first_show() {
    hide_loading.value?.(
      () => {
        show_menus.value?.()
      },
      () => {},
    )
  }

  function menus_to_diagram() {
    hide_menus.value?.(
      () => {
        show_nav.value?.()
      },
      () => {
        show_diagram.value?.()
      },
    )
  }

  function diagram_to_menus() {
    hide_diagram.value?.(
      () => {
        hide_nav.value?.(
          () => {},
          () => {},
        )
      },
      () => {
        console.log('show')
        show_menus.value?.()
      },
    )
  }

  return {
    lenis,
    hide_loading,
    show_menus,
    hide_menus,
    show_nav,
    hide_nav,
    show_diagram,
    hide_diagram,
    show_post,
    hide_post,
    show_tab,
    hide_tab,
    post_data,
    first_show,
    menus_to_diagram,
    diagram_to_menus,
  }
})
