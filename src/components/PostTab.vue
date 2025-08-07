<template>
  <div class="mask-container _fullscreen" v-show="posttap.if_visible.value">
    <div class="mask _fullscreen" @click="handleHide"></div>
    <div class="tab-container">
      <div class="tab-title">
        <div class="tab-title-info">
          <div class="title">{{ appStore.post_data.title }}</div>
          <div class="info">{{ formatDate(appStore.post_data.created_at) }}</div>
        </div>
        <MyButton class="close_btn" @click="appStore.hide_tab">×</MyButton>
      </div>
      <div class="tab-content">
        <PostPage :uri="appStore.post_data.uri"></PostPage>
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
import Lenis from 'lenis'
const appStore = useAppStore()

const posttap = {
  if_visible: ref(false),
  animator: null as null | gsap.core.Timeline,
  container: null as null | HTMLElement,
  content: null as null | HTMLElement,
  mask: null as null | HTMLElement,
  lenis: null as null | Lenis,
  rafId: 0,
  init() {
    this.container = document.querySelector('.tab-container')
    this.mask = document.querySelector('.mask-container .mask')
    this.content = document.querySelector('.tab-content')
    console.log(this.container, this.mask)
  },
  show() {
    console.log(this.lenis)
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
            appStore.hide_post?.()
          },
        },
        '<',
      )
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
}

function handleHide() {
  appStore.hide_tab?.()
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
  user-select: none;
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
      align-items: center;
      .close_btn {
        width: 4rem;
        height: 4rem;
        font-size: 2rem;
        color: var(--white);
        margin-left: auto;
      }

      .tab-title-info {
        display: flex;
        flex-direction: column;
      }
      .title,
      .info {
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
