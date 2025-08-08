import type { Article } from '@/utils/utils'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 加载页面
  const hide_loading = ref<((im: () => void, nx: () => void) => void) | null>(null)
  // 标题主菜单
  const show_menus = ref<(() => void) | null>(null)
  const hide_menus = ref<((im: () => void, nx: () => void) => void) | null>(null)
  //导航栏
  const show_nav = ref<(() => void) | null>(null)
  const hide_nav = ref<((im: () => void, nx: () => void) => void) | null>(null)
  // 无限滑动视图
  const show_diagram = ref<(() => void) | null>(null)
  const hide_diagram = ref<((im: () => void, nx: () => void) => void) | null>(null)
  // 瀑布流视图
  const show_masonry = ref<(() => void) | null>(null)
  const hide_masonry = ref<((im: () => void, nx: () => void) => void) | null>(null)
  // 列表视图
  const show_list = ref<(() => void) | null>(null)
  const hide_list = ref<((im: () => void, nx: () => void) => void) | null>(null)

  // 文章标签页
  const show_tab = ref<(() => void) | null>(null)
  const hide_tab = ref<(() => void) | null>(null)
  // 文章页面
  const show_post = ref<(() => void) | null>(null)
  const hide_post = ref<(() => void) | null>(null)

  const post_data = ref<Article>({
    title: '',
    uri: '',
    id: 0,
    created_at: '',
  })

  const layout_type = ref(0)

  function first_show() {
    hide_loading.value?.(
      () => {
        show_menus.value?.()
      },
      () => {},
    )
  }

  function menus_to_posts() {
    switch (layout_type.value) {
      case 0: {
        hide_menus.value?.(
          () => {
            show_nav.value?.()
          },
          () => {
            show_diagram.value?.()
          },
        )
        break
      }
      case 1: {
        hide_menus.value?.(
          () => {
            show_nav.value?.()
          },
          () => {
            show_masonry.value?.()
          },
        )
        break
      }
      case 2: {
        hide_menus.value?.(
          () => {
            show_nav.value?.()
          },
          () => {
            show_list.value?.()
          },
        )
        break
      }
    }
  }

  function posts_to_menus() {
    switch (layout_type.value) {
      case 0: {
        hide_diagram.value?.(
          () => {
            hide_nav.value?.(
              () => {},
              () => {},
            )
          },
          () => {
            show_menus.value?.()
          },
        )
        break
      }
      case 1: {
        hide_masonry.value?.(
          () => {
            hide_nav.value?.(
              () => {},
              () => {},
            )
          },
          () => {
            show_menus.value?.()
          },
        )
        break
      }
      case 2: {
        hide_list.value?.(
          () => {
            hide_nav.value?.(
              () => {},
              () => {},
            )
          },
          () => {
            show_menus.value?.()
          },
        )
        break
      }
    }
  }

  function diagram_to_list() {
    hide_diagram.value?.(
      () => {},
      () => {
        show_list.value?.()
      },
    )
  }

  function diagram_to_masonry() {
    hide_diagram.value?.(
      () => {},
      () => {
        show_masonry.value?.()
      },
    )
  }

  function list_to_diagram() {
    hide_list.value?.(
      () => {},
      () => {
        show_diagram.value?.()
      },
    )
  }

  function list_to_masonry() {
    hide_list.value?.(
      () => {},
      () => {
        show_masonry.value?.()
      },
    )
  }

  function masonry_to_diagram() {
    hide_masonry.value?.(
      () => {},
      () => {
        show_diagram.value?.()
      },
    )
  }

  function masonry_to_list() {
    hide_masonry.value?.(
      () => {},
      () => {
        show_list.value?.()
      },
    )
  }

  return {
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
    show_list,
    hide_list,
    layout_type,
    hide_masonry,
    show_masonry,
    first_show,
    menus_to_posts,
    posts_to_menus,
    diagram_to_list,
    diagram_to_masonry,
    list_to_diagram,
    list_to_masonry,
    masonry_to_diagram,
    masonry_to_list,
  }
})
