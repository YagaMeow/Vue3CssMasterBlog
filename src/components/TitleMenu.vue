<template>
  <div class="_fullscreen title_menu_container" v-show="(titleMenu.if_visible as Ref).value">
    <div
      class="title_menu"
      ref="container"
      @mouseenter="appStore.audio_controller.entermenubutton.play()"
    >
      <svg class="middle_line" viewBox="0 0 50 50">
        <circle class="_dashed" cx="25" cy="25" r="25" vector-effect="non-scaling-stroke"></circle>
      </svg>
      <svg class="out_line" viewBox="0 0 50 50">
        <!-- <circle class="orbit" cx="25" cy="25" r="25"></circle> -->
        <circle class="_dashed" cx="25" cy="25" r="25" vector-effect="non-scaling-stroke"></circle>
      </svg>
      <div
        @mouseleave="titleMenu.mouseout"
        class="title_menu_button"
        @click="appStore.menus_to_posts()"
      >
        <div class="live">live now</div>
        2025
      </div>
      <div @mouseleave="titleMenu.mouseout" class="title_menu_button">2024</div>
      <div @mouseleave="titleMenu.mouseout" class="title_menu_button">2023</div>
      <div @mouseleave="titleMenu.mouseout" class="title_menu_button">2022</div>
      <div @mouseleave="titleMenu.mouseout" class="title_menu_button">2021</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useAppStore } from '@/pinia/index'
import { onMounted, ref } from 'vue'
import type { Ref } from 'vue'
import gsap, { Circ } from 'gsap'
const appStore = useAppStore()
const container = ref<HTMLElement | null>(null)
const buttons = ref<NodeListOf<HTMLElement> | null>(null)
let no_audio = false

const titleMenu = {
  animator: null as null | gsap.core.Timeline,
  if_visible: ref(true),
  init() {
    buttons.value = document.querySelectorAll('.title_menu_button')
    gsap
      .timeline()
      .to(document.querySelector('.middle_line'), {
        rotate: '360deg',
        duration: 40,
        repeat: -1,
        ease: 'none',
      })
      .to(
        document.querySelector('.out_line'),
        {
          rotate: '-360deg',
          duration: 30,
          repeat: -1,
          ease: 'none',
        },
        '<',
      )
    this.animator = gsap
      .timeline()
      .fromTo(
        container.value,
        {
          // clipPath: 'circle(0)',
          scale: 0,
        },
        {
          duration: 2,
          scale: 1,
          delay: 0.6,
          onComplete: () => {
            console.log('complete')
          },
          ease: 'power4.out',
          // clipPath: 'circle(100%)',
        },
      )
      .fromTo(
        buttons.value,
        {
          scale: 0.9,
          opacity: 0,
        },
        {
          scale: 1,
          opacity: 1,
          stagger: 0.2,
          duration: 0.6,
          ease: 'power4.out',
        },
        '<+0.3',
      )
      .fromTo(
        document.querySelector('.middle_line'),
        {
          scale: 0,
        },
        {
          scale: 1,
          duration: 2,
        },
        '<-0.2',
      )
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
          ;(this.if_visible as Ref).value = false
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
  },
}
appStore.show_menus = titleMenu.show.bind(titleMenu)
appStore.hide_menus = titleMenu.hide.bind(titleMenu)
onMounted(() => {
  titleMenu.init()
  console.log(container.value)
})
</script>
<style lang="scss" scoped>
.title_menu_container {
  display: flex;
  justify-content: center;
  align-items: center;
}
.title_menu {
  --scale: 1;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .title_menu_button {
    transform-origin: 50% 0;
    width: calc(var(--scale) * 60rem);
    height: calc(var(--scale) * 16rem);
    overflow: hidden;

    margin: 0.3rem 0;
    transition: height cubic-bezier(0, 0, 0.8, 1.2) 0.1s;
    background-color: #616161;
    border-radius: 1rem;
    box-shadow: inset 0.1rem 0.1rem #fff;
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

._dashed {
  fill: none;
  stroke-width: 0.5rem;
  stroke-linecap: round;
}

.out_line {
  scale: 1.5;
  ._dashed {
    stroke-width: 1rem;
  }
}

.middle_line,
.out_line {
  position: absolute;
  width: 80rem;
  overflow: visible;
  circle {
    stroke-linecap: round;
    stroke-dasharray: 0 4rem;
    transform-origin: center;
    stroke: rgba($color: #000000, $alpha: 0.8);
  }
  .orbit {
    fill: none;
    stroke-dasharray: none;
    stroke-width: 0.001rem;
    stroke: rgba($color: #000, $alpha: 0.8);
  }
  // animation: rotate infinite 40s linear;
}

@keyframes rotate {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media screen and (max-aspect-ratio: 0.8/1) {
  .middle_line,
  .out_line {
    display: none;
  }
  .title_menu {
    .title_menu_button {
      width: calc(var(--scale) * 80rem);
      height: calc(var(--scale) * 24rem);
      font-size: 10rem;
      .live {
        font-size: 4rem;
        &::after {
          margin-left: 2rem;
          width: 1.6rem;
          height: 1.6rem;
        }
      }
    }
  }
}
</style>
