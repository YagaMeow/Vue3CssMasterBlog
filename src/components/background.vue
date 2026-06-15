<template>
  <div class="bg _fullscreen">
    <ASCIIbg></ASCIIbg>
    <!-- <div class="bg-ball-container _fullscreen _null">
      <div class="bg-ball" style="--x: 0; --y: 0; --s: 2; --o: 0.9"></div>
      <div class="bg-ball" style="--x: 0.8; --y: 0.1; --s: 1; --o: 0.8"></div>
      <div class="bg-ball" style="--x: 0.3; --y: 0.3; --s: 0.8; --o: 0.2"></div>
      <div class="bg-ball" style="--x: 0.1; --y: 0.6; --s: 1; --o: 0.9"></div>
      <div class="bg-ball" style="--x: 0.9; --y: 0.7; --s: 2; --o: 0.7"></div>
    </div> -->
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import gsap, { random } from 'gsap'
import ASCIIbg from './ScrollPage/ASCIIbg.vue'

defineOptions({
  name: 'BackGround',
})

const background = {
  container: null as null | HTMLElement,
  balls: document.querySelectorAll('.bg-ball'),
  mouse_x: 0,
  mouse_y: 0,
  distance_x: 0,
  distance_y: 0,
  animator: null as null | gsap.core.Timeline,
  init() {
    this.container = document.querySelector('.bg')
    background.balls = document.querySelectorAll('.bg-ball')
    // document.addEventListener('mousemove', background.handleMove)
    // document.addEventListener('mouseleave', background.reset)
    // document.addEventListener('touchmove', background.handleMoveMobile)
    // document.addEventListener('touchend', background.reset)
    // gsap.timeline().fromTo(
    //   document.querySelector('.bg-ball-container'),
    //   {
    //     z: '-100rem',
    //   },
    //   {
    //     z: 0,
    //     duration: 15,
    //     ease: 'power3.out',
    //     onComplete: () => {},
    //   },
    // )
    // this.swing()
  },
  handleMove(e: MouseEvent) {
    background.move(e.x, e.y)
  },
  handleMoveMobile(e: TouchEvent) {
    background.move(e.touches[0].clientX, e.touches[0].clientY)
  },
  swing() {
    if (!this.container) return
    this.animator = gsap.timeline().fromTo(
      this.container,
      {
        background:
          'linear-gradient(0deg,rgba(0,0,0,.6),transparent),linear-gradient(-30deg,rgb(0, 106, 182),rgb(156, 212, 251) 95%)',
      },
      {
        background:
          'linear-gradient(0deg,rgba(0,0,0,.8),transparent),linear-gradient(30deg,rgb(0, 106, 182),rgb(156, 212, 251) 95%)',
        repeat: -1,
        duration: 3,
        yoyo: true,
        ease: 'none',
      },
    )
  },
  move: (x: number, y: number) => {
    if (background.mouse_x === 0 && background.mouse_y === 0) {
      background.mouse_x = x
      background.mouse_y = y
    }
    background.distance_x += ((x - background.mouse_x) / document.body.offsetWidth) * -20
    background.distance_y += ((y - background.mouse_y) / document.body.offsetHeight) * -20
    gsap.to(background.balls, {
      x: `${background.distance_x}%`,
      y: `${background.distance_y}%`,
      duration: 3,
      ease: 'power3.out',
    })
    background.mouse_x = x
    background.mouse_y = y
  },
  reset: () => {
    background.mouse_x = 0
    background.mouse_y = 0
    background.distance_x = 0
    background.distance_y = 0
    gsap.to(background.balls, {
      x: 0,
      y: 0,
      duration: 5,
      ease: 'power3.out',
    })
  },
}

onMounted(() => background.init())
onUnmounted(() => {
  document.removeEventListener('mousemove', background.handleMove)
  document.removeEventListener('mouseleave', background.reset)
  document.removeEventListener('touchmove', background.handleMoveMobile)
  document.removeEventListener('touchend', background.reset)
})
</script>
<style lang="scss" scoped>
.bg {
  // filter: blur(1rem) brightness(0.8);
  // background: linear-gradient(0deg, #d5edff 70%, #fff 70%);
  user-select: none;
  pointer-events: none;
  --scale: 1;

  .bg-ball-container {
    transform: perspective(500rem);
  }

  .bg-ball {
    width: 30rem;
    height: 30rem;
    background-color: rgb(156, 212, 251);
    position: absolute;
    border-radius: 50%;
    scale: calc(var(--scale) * var(--s));
    left: calc(100vw * var(--x));
    top: calc(100vh * var(--y));
    opacity: var(--o);
    filter: blur(1rem);
  }
}
</style>
