<template>
  <div class="_fullscreen title_menu_container" v-show="(titleMenu.if_visible as Ref).value">
    <div
      class="title_menu"
      ref="container"
      @mouseenter="appStore.audio_controller.entermenubutton.play()"
    >
      <!-- <svg class="middle_line _null" viewBox="0 0 50 50"> -->
      <!-- <circle class="_dashed" cx="25" cy="25" r="25" vector-effect="non-scaling-stroke"></circle> -->
      <!-- </svg> -->
      <!-- <svg class="out_line _null" viewBox="0 0 50 50"> -->
      <!-- <circle class="orbit" cx="25" cy="25" r="25"></circle> -->
      <!-- <circle class="_dashed" cx="25" cy="25" r="25" vector-effect="non-scaling-stroke"></circle> -->
      <!-- </svg> -->
      <div
        @mouseleave="titleMenu.mouseout"
        class="title_menu_button active"
        @click="appStore.menus_to_posts()"
      >
        <div class="live">live now</div>
        Articles
      </div>
      <!-- <div
        @mouseleave="titleMenu.mouseout"
        class="title_menu_button"
        @click="appStore.menus_to_scroll_page()"
      >
        Scroll Trigger
      </div> -->
      <div
        class="title_menu_button"
        @mouseleave="titleMenu.mouseout"
        @click="appStore.menus_to_calendar_page"
      >
        Calendar
      </div>
      <div
        class="title_menu_button"
        @mouseleave="titleMenu.mouseout"
        @click="appStore.menus_to_demo_page"
      >
        Demo
      </div>
      <!-- <div
        @mouseleave="titleMenu.mouseout"
        class="title_menu_button"
        @click="appStore.menus_to_game_page()"
      >
        Game
      </div> -->
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
    // gsap.timeline().to(document.querySelector('.middle_line'), {
    //   rotate: '360deg',
    //   duration: 40,
    //   repeat: -1,
    //   ease: 'none',
    // })
    // .to(
    //   document.querySelector('.out_line'),
    //   {
    //     rotate: '-360deg',
    //     duration: 30,
    //     repeat: -1,
    //     ease: 'none',
    //   },
    //   '<',
    // )
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
            console.log('[TitleMenu] animation complete')
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
          scale: 0.98,
          opacity: 0.8,
          stagger: 0.2,
          duration: 0.6,
          ease: 'power4.out',
        },
        '<+0.3',
      )
    // .fromTo(
    //   document.querySelector('.middle_line'),
    //   {
    //     scale: 0,
    //   },
    //   {
    //     scale: 1,
    //     duration: 2,
    //     onComplete: () => {
    //       document.addEventListener('keydown', titleMenu.arrowKey)
    //     },
    //   },
    //   '<-0.2',
    // )
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
        opacity: 0.8,
        duration: 0.2,
        stagger: 0.05,
        ease: 'power3.out',
        onComplete: () => {
          no_audio = false
          document.addEventListener('keydown', titleMenu.arrowKey)
        },
      })
  },
  hide(immediate: () => void, next: () => void) {
    if ((this.animator as gsap.core.Timeline).isActive()) {
      return
    }
    no_audio = true
    document.removeEventListener('keydown', titleMenu.arrowKey)
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
  arrowKey(e: KeyboardEvent) {
    let currentAcitveIndex = 0
    const buttons = document.querySelectorAll('.title_menu_button')
    buttons.forEach((b, i) => {
      if (b.classList.contains('active')) {
        currentAcitveIndex = i
        return
      }
    })
    if (e.code == 'ArrowDown') {
      buttons[currentAcitveIndex].classList.remove('active')
      buttons[(currentAcitveIndex + 1) % buttons.length].classList.add('active')
      appStore.audio_controller.entermenubutton.play()
    } else if (e.code == 'ArrowUp') {
      buttons[currentAcitveIndex].classList.remove('active')
      buttons[(currentAcitveIndex - 1 + buttons.length) % buttons.length].classList.add('active')
      appStore.audio_controller.entermenubutton.play()
    } else if (e.code == 'Enter') {
      if (appStore.login_tab) return
      ;(buttons[currentAcitveIndex] as HTMLElement).click()
    }
  },
}
appStore.show_menus = titleMenu.show.bind(titleMenu)
appStore.hide_menus = titleMenu.hide.bind(titleMenu)
onMounted(() => {
  titleMenu.init()
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
  gap: 1rem;
  .title_menu_button {
    &.active {
      background-color: #454545;
      opacity: 1 !important;
      transform: scale(1) !important;
      transition:
        opacity 0.2s ease,
        height cubic-bezier(0, 0, 0.8, 1.2) 0.1s;
    }
    transform-origin: center center;
    width: calc(var(--scale) * 60rem);
    height: calc(var(--scale) * 16rem);
    overflow: hidden;

    margin: 0.3rem 0;
    transition:
      opacity 0.1s ease,
      height cubic-bezier(0.11, 0.73, 0.37, 1.23) 0.1s;
    background-color: #616161;
    border-radius: 1rem;
    box-shadow:
      0 0 10px #fff,
      0 0 20px #eee,
      0 0 30px #666;
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
      transition: height cubic-bezier(0.11, 0.73, 0.37, 1.23) 0.2s;
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
