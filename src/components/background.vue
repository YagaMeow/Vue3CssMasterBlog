<template>
  <div class="bg _fullscreen">
    <div class="bg-ball-container _fullscreen">
      <div class="bg-ball" style="--x: 0; --y: 0; --s: 2; --o: 0.9"></div>
      <div class="bg-ball" style="--x: 0.8; --y: 0.1; --s: 1; --o: 0.8"></div>
      <div class="bg-ball" style="--x: 0.3; --y: 0.3; --s: 0.8; --o: 0.2"></div>
      <div class="bg-ball" style="--x: 0.1; --y: 0.6; --s: 1; --o: 0.9"></div>
      <div class="bg-ball" style="--x: 0.9; --y: 0.7; --s: 2; --o: 0.7"></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted } from 'vue'
import gsap from 'gsap'

defineOptions({
  name: 'BackGround',
})

interface Background {
  balls: NodeListOf<Element>
  mouse_x: number
  mouse_y: number
  distance_x: number
  distance_y: number
  init: () => void
  move: (x: number, y: number) => void
  reset: () => void
}

const background: Background = {
  balls: document.querySelectorAll('.bg-ball'),
  mouse_x: 0,
  mouse_y: 0,
  distance_x: 0,
  distance_y: 0,
  init: () => {
    background.balls = document.querySelectorAll('.bg-ball')
    document.addEventListener('mousemove', (e) => {
      background.move(e.x, e.y)
    })
    document.addEventListener('mouseleave', (e) => {
      background.reset()
    })
    document.addEventListener('touchmove', (e) => {
      background.move(e.touches[0].clientX, e.touches[0].clientY)
    })
    document.addEventListener('touchend', (e) => {
      background.reset()
    })
    gsap.timeline().fromTo(
      document.querySelector('.bg-ball-container'),
      {
        z: '-100rem',
      },
      {
        z: 0,
        duration: 15,
        ease: 'power3.out',
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
</script>
<style lang="scss" scoped>
.bg {
  user-select: none;
  pointer-events: none;
  --scale: 1;
  background-color: #fff;

  .bg-ball-container {
    transform: perspective(500rem);
  }

  .bg-ball {
    width: 30rem;
    height: 30rem;
    background-color: #000;
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
