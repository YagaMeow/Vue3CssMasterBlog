<template>
  <div class="mask-container _fullscreen" v-show="posttap.if_visible.value">
    <div class="mask _fullscreen" @click="handleClose"></div>
    <div class="tab-container">
      <div class="tab-title">
        <div class="tab-title-info">
          <div class="title" v-if="!appStore.edit_mode">{{ appStore.post_data.title }}</div>
          <div v-else>
            <div class="tab-title-input">
              <input v-model="_title" type="text" placeholder="Please enter title...">
            </div>
            <div class="tab-uri-input">
              <input v-model="_uri" type="text" placeholder="uri"></input>
            </div>
          </div>

          <div class="info" v-if="!appStore.edit_mode">{{ formatDate(appStore.post_data.created_at.toString()) }}</div>
        </div>
        <MyButton v-if="appStore.edit_mode" class="confirm_btn" @click="handleHide">√</MyButton>
        <MyButton v-else class="edit_btn" @click="posttap.handleEdit">
          <svg-icon :iconClass="posttap.editable.value ? 'no-edit':'edit'">
          </svg-icon>
        </MyButton>
        <MyButton class="close_btn" @click="handleClose">×</MyButton>
      </div>
      <div class="tab-content">
        <PostPage ref="ed" :uri="appStore.post_data.uri.toString()"></PostPage>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import MyButton from '@/components/ui/btn.vue'
import { onMounted, ref } from 'vue'
import gsap from 'gsap'
import { useAppStore } from '@/pinia'
import { formatDate } from '@/utils/utils'
import PostPage from '@/views/PostPage/PostPage.vue'
import CreatePage from '@/views/PostPage/CreatePost.vue'
import Lenis from 'lenis'
import { ArticleAPI } from '@/api/api'
import { Editor } from '@tiptap/vue-3'
import SvgIcon from './SvgIcon.vue'
const appStore = useAppStore()

const _title = ref("")
const _uri = ref("")
const ed = ref()

const posttap = {
  if_visible: ref(false),
  animator: null as null | gsap.core.Timeline,
  container: null as null | HTMLElement,
  content: null as null | HTMLElement,
  mask: null as null | HTMLElement,
  lenis: null as null | Lenis,
  editable: ref(false),
  rafId: 0,
  init() {
    this.container = document.querySelector('.tab-container')
    this.mask = document.querySelector('.mask-container .mask')
    this.content = document.querySelector('.tab-content')
    console.log(this.container, this.mask)
  },
  show() {
    console.log(this.lenis)
    appStore.show_detail = true
    if (appStore.edit_mode) {
      posttap.editable.value = true
      ed.value.editor.setEditable(true)
    }
    this.if_visible.value = true
    this.animator = gsap
      .timeline()
      .to(this.container, {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        ease: 'power3.out',
        onComplete: () => {
          appStore.show_post?.()
        },
      })
      .to(
        this.mask,
        {
          opacity: 1,
          'backdrop-filter': 'blur(1rem)',
          duration: 1,
          ease: 'power3.out',
        },
        '<',
      )
    appStore.audio_controller.showposttab.play()
  },
  hide() {
    if (this.animator?.isActive()) return

    this.animator = gsap
      .timeline()
      .to(this.container, {
        scale: 0.8,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.out',
      })
      .to(
        this.mask,
        {
          opacity: 0,
          'backdrop-filter': 'blur(0rem)',
          duration: 1,
          ease: 'power3.out',
          onComplete: () => {
            this.if_visible.value = false
            console.log(appStore.hide_post)
            appStore.show_detail = false
            appStore.hide_post?.()
          },
        },
        '<',
      )
    appStore.audio_controller.hideposttab.play()
  },
  initLenis() {
    this.lenis = new Lenis({
      wrapper: this.content as HTMLElement,
    })
    function raf(time: number) {
      posttap.lenis?.raf(time)
      posttap.rafId = requestAnimationFrame(raf)
    }
    this.rafId = requestAnimationFrame(raf)
  },
  removeLenis() {
    cancelAnimationFrame(this.rafId)
    this.rafId = 0
    this.lenis?.destroy()
    this.lenis = null
  },
  async handleCreate() {
    await ArticleAPI.create({
      title: _title.value,
      content: JSON.stringify(ed.value.editor.getJSON()),
      uri: _uri.value
    })
  },
  handleEdit() {
    posttap.editable.value = !posttap.editable.value
    ed.value.editor.setEditable(posttap.editable.value)
  },
  reset() {
    console.log('reset editor')
    appStore.post_data = {
      title: '',
      uri: '',
      id: 0,
      created_at: '',
    }
    posttap.editable.value = false
    ed.value.editor.commands.clearContent()
  }
}

async function handleClose() {
  if (appStore.edit_mode) {
    posttap.reset()
    appStore.hide_tab?.()

  } else {
    await ArticleAPI.update({
      title: appStore.post_data.title as string,
      content: JSON.stringify(ed.value.editor.getJSON()),
      uri: appStore.post_data.uri as string
    }).then(() => {
      posttap.reset()
      appStore.hide_tab?.()
    })
  }
}

async function handleHide() {
  if (appStore.edit_mode) {
    posttap.handleCreate().then(() => {
      posttap.reset()
      appStore.hide_tab?.()
    })
  }
}
appStore.show_tab = posttap.show.bind(posttap)
appStore.hide_tab = posttap.hide.bind(posttap)

onMounted(() => {
  posttap.init()
})
</script>
<style lang="scss" scoped>
.mask-container {
  z-index: 1000;
  --scale: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  .mask {
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(0rem);
    opacity: 0;
  }

  .tab-container {
    scale: 0.8;
    opacity: 0;
    width: 60rem;
    height: 80rem;
    background-color: #61616161;
    border-radius: 1rem;
    box-shadow: inset 1px 1px var(--white);
    background: #191919;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    .tab-title {
      width: 100%;
      display: flex;
      flex: 0;
      padding: 1rem;
      align-items: flex-start;

      .confirm_btn,
      .edit_btn {
        margin-left: auto;
        color: #fff;
      }

      .close_btn {
        margin-left: 1rem;
      }

      .close_btn,
      .confirm_btn,
      .edit_btn {
        width: 4rem;
        height: 4rem;
        font-size: 2rem;
        color: var(--white);

      }

      .tab-title-info {
        display: flex;
        flex-direction: column;

        .tab-title-input,
        .tab-uri-input {
          margin-left: 2rem;
          padding: 0.5rem 0;
          position: relative;

          &::after {
            content: "";
            width: 100%;
            height: 0.1rem;
            background-color: #fff;
            display: block;
            position: absolute;
            bottom: 0;
            transform: scaleX(0);
            transform-origin: left;
          }

          &:focus-within::after {
            transform: scaleX(1);
            transition: transform 0.2s ease-out;
          }

          input {
            font-size: 2rem;
            color: #fff;
            width: 100%;
            height: 3rem;
            background-color: transparent;
            outline: none;
            border: none;
            // &:focus{
            //   outline: 1px solid white;
            // }
          }
        }

      }

      .title,
      .info {
        margin-left: 2rem;
        padding: 0.5rem 0;
        color: #fff;
      }

      .title {
        font-size: 2rem;
      }

      .info {
        font-size: 1.8rem;
        color: #ccc;
      }
    }

    .tab-content {
      cursor: pointer;
      position: relative;
      width: 58rem;
      flex: 1 1 auto;
      background-color: transparent;
      margin-bottom: 1rem;
      border-radius: 0.8rem;
      margin-top: auto;
      overflow: auto;
    }
  }
}
</style>
