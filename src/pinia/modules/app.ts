import type { Article } from '@/utils/utils'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Howl } from 'howler'
import { Editor } from '@tiptap/vue-3'

import a_enter from '@/assets/audio/enter.mp3'
import a_leave from '@/assets/audio/leave.mp3'
import a_list from '@/assets/audio/list.mp3'
import a_discover from '@/assets/audio/discover.mp3'
import a_switch from '@/assets/audio/switch.mp3'
import a_showtab from '@/assets/audio/showtab.mp3'
import a_closetab from '@/assets/audio/closetab.mp3'

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
  const hide_tab = ref<((im: () => void, nx: () => void) => void) | null>(null)
  // 文章页面
  const show_post = ref<(() => void) | null>(null)
  const hide_post = ref<(() => void) | null>(null)
  //登录页
  const show_login = ref<(() => void) | null>(null)
  const hide_login = ref<(() => void) | null>(null)
  //提示栏
  const notify = ref<((text: string) => void) | null>(null)
  //滚动触发页面
  const show_scroll_page = ref<(() => void) | null>(null)
  const hide_scroll_page = ref<((im: () => void,nx: () => void) => void) | null>(null)

  const audio_controller = {
    entermenubutton: new Howl({
      src: [a_enter],
      preload: true,
    }),
    leavemenubutton: new Howl({
      src: [a_leave],
      preload: true,
    }),
    switchmenubutton: new Howl({
      src: [a_switch],
      preload: true,
    }),
    toorfrompost: new Howl({
      src: [a_discover],
      preload: true,
    }),
    switchlayout: new Howl({
      src: [a_list],
      preload: true,
    }),
    showposttab: new Howl({
      src: [a_showtab],
      preload: true,
    }),
    hideposttab: new Howl({
      src: [a_closetab],
      preload: true,
    }),
    stopAll: () => {
      audio_controller.entermenubutton.stop()
      audio_controller.hideposttab.stop()
      audio_controller.leavemenubutton.stop()
      audio_controller.showposttab.stop()
      audio_controller.switchlayout.stop()
      audio_controller.switchmenubutton.stop()
      audio_controller.toorfrompost.stop()
    },
  }

  const post_data = ref<Article>({
    title: '',
    uri: '',
    id: 0,
    created_at: '',
    tags: [],
  })

  const edit_mode = ref(false)

  const show_detail = ref(false)

  const layout_type = ref(0)

  const hajime = ref(true)

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
            audio_controller.toorfrompost.play()
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
            audio_controller.toorfrompost.play()
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
            audio_controller.toorfrompost.play()
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
            audio_controller.toorfrompost.play()
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
            audio_controller.toorfrompost.play()
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
            audio_controller.toorfrompost.play()
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

  function menus_to_scroll_page() {
    hide_menus.value?.(
      () => {
      },
      () => {
        show_scroll_page.value?.()
      }
    )
  }

  function scroll_page_to_menus() {
    hide_scroll_page.value?.(
      () => {},
      () => {
        show_menus.value?.()
      }
    )
  }

  return {
    show_scroll_page,
    hide_scroll_page,
    menus_to_scroll_page,
    hajime,
    notify,
    show_detail,
    edit_mode,
    hide_loading,
    show_menus,
    hide_menus,
    show_nav,
    hide_nav,
    show_diagram,
    hide_diagram,
    show_post,
    hide_post,
    show_login,
    hide_login,
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
    audio_controller,
  }
})
