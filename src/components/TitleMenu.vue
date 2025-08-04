<template>
  <div class="title_menu" ref="container" v-show="(titleMenu.if_visible as Ref).value">
    <div class="title_menu_button" @click="appStore.menus_to_diagram()">
      <div class="live">live now</div>
      2025
    </div>
    <div class="title_menu_button">2024</div>
    <div class="title_menu_button">2023</div>
    <div class="title_menu_button">2022</div>
    <div class="title_menu_button">2021</div>
  </div>
</template>
<script setup lang="ts">
import { useAppStore } from '@/pinia/index'
import { onMounted, ref } from 'vue'
import type { Ref } from 'vue'
import gsap from 'gsap'
const appStore = useAppStore()
interface BaseTitleMenu {
  animator: unknown
  init: () => void
}
type TitleMenuType = BaseTitleMenu & {
  [key: string]: unknown
}
const container = ref<HTMLElement | null>(null)

const titleMenu: TitleMenuType = {
  animator: null,
  if_visible: ref(true),
  init() {
    titleMenu.animator = gsap.timeline().fromTo(
      container.value,
      {
        opacity: 0,
      },
      {
        opacity: 1,
        duration: 1,
        onComplete: () => {
          console.log('complete')
        },
      },
    )
  },
  hide(immediate: () => void, next: () => void) {
    if ((titleMenu.animator as gsap.core.Timeline).isActive()) {
      return
    }
    if (immediate) immediate()
    titleMenu.animator = gsap.timeline().to(container.value, {
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      onComplete: () => {
        ;(titleMenu.if_visible as Ref).value = false
        if (next) next()
      },
    })
  },
}
appStore.hide_menus = (titleMenu.hide as () => void).bind(titleMenu)
onMounted(() => {
  titleMenu.init()
  console.log(container.value)
})
</script>
<style lang="scss" scoped>
.title_menu {
  --scale: 1;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100vh;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .title_menu_button {
    width: calc(var(--scale) * 30rem);
    height: calc(var(--scale) * 8rem);

    margin: 3px 0;
    transition: height cubic-bezier(0, -0.5, 1, 1.46) 0.1s;
    background-color: #616161;
    border-radius: 10px;
    box-shadow: inset 1px 1px #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 3rem;
    font-weight: bolder;
    color: #fff;
    letter-spacing: 0.2rem;
    user-select: none;
    cursor: pointer;
    flex-direction: column;
    position: relative;

    &:hover {
      height: calc(var(--scale) * 16rem);
      transition: height cubic-bezier(0, -0.5, 1, 1.46) 0.2s;
      background-color: rgba(0, 0, 0, 0.1);
      &:nth-child(1) {
        &::after {
          opacity: 100;
          transition: all ease-in-out 0.5s;
          animation: scroll 5s linear infinite;
        }
      }
    }
    .live {
      font-size: 1rem;
      position: absolute;
      top: 10%;
      padding-right: 5px;
      display: flex;
      align-items: center;
      gap: 10px;
      &::after {
        content: '';
        background-color: rgb(39, 213, 39);
        display: block;
        width: 0.8rem;
        height: 0.8rem;
        border-radius: 100%;
        animation: blink linear 2s infinite;
      }
    }

    &:nth-child(1) {
      &::after {
        content: 'test·';
        position: absolute;
        font-size: 1rem;
        bottom: 10%;
        opacity: 0;
      }
    }
  }
}

@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
}

@keyframes blink {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 100%;
  }
  100% {
    opacity: 0;
  }
}
</style>
