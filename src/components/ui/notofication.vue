<template>
  <div class="notify-container">
    <span class="notify-text">
      {{ notify.text.value }}
    </span>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import gsap from 'gsap'
import { useAppStore } from '@/pinia'
defineOptions({
  name: 'MyNotify',
})
const appStore = useAppStore()
const notify = {
  animator: null as null | gsap.core.Timeline,
  text: ref('sample text'),
  container: null as null | HTMLElement,
  show() {
    if (this.animator?.isActive()) return
    if (this.container?.classList.contains('show')) this.container.classList.remove('show')
    this.container?.classList.add('show')
    this.animator = gsap
      .timeline()
      .fromTo(
        this.container,
        {
          y: '-10rem',
          scale: 0.6,
        },
        {
          y: '3rem',
          scale: 1,
          duration: 1,
          ease: 'elastic.out(1,0.7)',
        },
      )
      .add(() => {
        this.hide()
      }, '+=0.8')
  },
  hide() {
    if (this.animator?.isActive()) return
    this.animator = gsap
      .timeline()
      .to(this.container, {
        y: '-10rem',
        duration: 0.8,
        ease: 'power1.in',
      })
      .to(
        this.container,
        {
          opacity: 0,
          duration: 0.7,
          ease: 'power1.out',
        },
        '<',
      )
      .to(this.container, {
        opacity: 1,
        y: '-30rem',
        duration: 0,
        onComplete: () => {
          this.container?.classList.remove('show')
        },
      })
  },
  init() {
    this.container = document.querySelector('.notify-container')
  },
  notify(text: string) {
    this.text.value = text
    this.show()
  },
}

appStore.notify = notify.notify.bind(notify)

onMounted(() => {
  notify.init()
})
</script>
<style lang="scss" scoped>
.notify-container {
  z-index: 1000;
  width: 30rem;
  height: 7rem;
  background-color: #000;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -10rem) scale(0.9);
  border-radius: 0 0 2rem 2rem;
  box-shadow: inset 1px 1px 0.1rem #616161;
  display: flex;
  align-items: center;
  justify-content: flex-start;

  .notify-text {
    width: 100%;
    color: #fff;
    font-size: 2rem;
    text-align: center;
  }

  @keyframes progress {
    0% {
      width: 0%;
    }
    100% {
      width: 100%;
    }
  }
  &::before {
    width: 0%;
    content: '';
    position: absolute;
    background-color: rgba($color: #0088c3, $alpha: 1);
    border-radius: 1rem 1rem 0 0;
    display: block;
    // width: 100%;
    height: 0.5rem;
    top: -0.5rem;
    align-self: flex-start;
  }
  &.show {
    &::before {
      animation: progress 1.5s linear 0.1s forwards;
    }
  }
}
</style>
