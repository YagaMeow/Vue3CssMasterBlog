<template>
    <div class="title_menu" ref="container" v-show="(titleMenu.if_visible as Ref).value"
      @mouseenter="appStore.audio_controller.entermenubutton.play()">
      <div @mouseleave="titleMenu.mouseout" class="title_menu_button" @click="appStore.menus_to_posts()">
        <div class="live">live now</div>
        2025
      </div>
      <div @mouseleave="titleMenu.mouseout" class="title_menu_button">2024</div>
      <div @mouseleave="titleMenu.mouseout" class="title_menu_button">2023</div>
      <div @mouseleave="titleMenu.mouseout" class="title_menu_button">2022</div>
      <div @mouseleave="titleMenu.mouseout" class="title_menu_button">2021</div>
    </div>

</template>
<script setup lang="ts">
import { useAppStore } from '@/pinia/index'
import { onMounted, ref } from 'vue'
import type { Ref } from 'vue'
import gsap from 'gsap'
const appStore = useAppStore()
const container = ref<HTMLElement | null>(null)
const buttons = ref<NodeListOf<HTMLElement> | null>(null)
let no_audio = false

const titleMenu = {
  animator: null as null | gsap.core.Timeline,
  if_visible: ref(true),
  init() {
    buttons.value = document.querySelectorAll('.title_menu_button')
    this.animator = gsap.timeline().fromTo(
      container.value,
      {
        clipPath: 'circle(0)',
      },
      {
        duration: 3,
        onComplete: () => {
          console.log('complete')
        },
        delay: .5,
        ease: 'power4.out',
        clipPath: 'circle(100%)'
      },
    ).fromTo(buttons.value,{
      opacity: 0,
    },{
      opacity: 1,
      stagger: .2,
      duration: .6,
      delay: .3,
      ease: "power3.in"
    },"<")
  },
  show() {
    if (this.animator?.isActive()) return
    this.if_visible.value = true
    this.animator = gsap
      .timeline()
      .to(container.value, {
        opacity: 1,
        duration: 0,
      })
      .to(buttons.value, {
        opacity: 1,
        duration: 0.2,
        stagger: 0.05,
        ease: 'power3.out',
        onComplete: () => {
          no_audio = false
        },
      })
  },
  hide(immediate: () => void, next: () => void) {
    if ((this.animator as gsap.core.Timeline).isActive()) {
      this.animator?.kill()
      return
    }
    no_audio = true
    if (immediate) immediate()
    this.animator = gsap
      .timeline()
      .to(container.value, {
        opacity: 0,
        duration: 0.2,
        ease: 'power3.in',
        onComplete: () => {
          ; (this.if_visible as Ref).value = false
          if (next) next()
        },
      })
      .to(buttons.value, {
        opacity: 0,
        duration: 0,
      })
  },
  mouseout() {
    if (!no_audio) appStore.audio_controller.leavemenubutton.play()
  }
}
appStore.show_menus = titleMenu.show.bind(titleMenu)
appStore.hide_menus = titleMenu.hide.bind(titleMenu)
onMounted(() => {
  titleMenu.init()
  console.log(container.value)
})
</script>
<style lang="scss" scoped>
.title_menu {
  --scale: 1;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .title_menu_button {
    width: calc(var(--scale) * 60rem);
    height: calc(var(--scale) * 16rem);
    overflow: hidden;

    margin: .3rem 0;
    transition: height cubic-bezier(0, 0, 0.8, 1.2) 0.1s;
    background-color: #616161;
    border-radius: 1rem;
    box-shadow: inset .1rem .1rem #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 5rem;
    font-weight: bolder;
    color: #fff;
    letter-spacing: 0.5rem;
    user-select: none;
    cursor: pointer;
    flex-direction: column;
    position: relative;

    &:hover {
      height: calc(var(--scale) * 32rem);
      transition: height cubic-bezier(0, 0, 0.8, 1.2) 0.2s;
      background-color: rgba(0, 0, 0, 0.1);

      &:nth-child(1) {
        &::after {
          opacity: 100;
          transition: all ease-in-out 0.5s;
          animation: scroll 50s linear infinite;
        }
      }
    }

    .live {
      font-size: 2rem;
      letter-spacing: 0.2rem;
      position: absolute;
      top: 10%;
      padding-right: 5px;
      display: flex;
      align-items: center;
      gap: 0.5rem;

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
        content: "If by life you were deceived·Don't be dismal, don't be wild·In the day of grief, be mild·Merry days will come, believe·Heart is living in tomorrow·Present is dejected here·In a moment, passes sorrow·That which passes will be dear.";
        position: absolute;
        font-size: 2rem;
        bottom: 10%;
        opacity: 0;
        text-wrap: nowrap;
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
