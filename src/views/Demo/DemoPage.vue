<template>
  <div class="demo-container _fullscreen" v-show="demo.if_visible.value">
    <DemoItem class="demo-item">
      <LoadTest></LoadTest>
    </DemoItem>
    <DemoItem class="demo-item" v-for="i in 4" :key="i"></DemoItem>
  </div>
</template>
<script lang="ts" setup>
import { useAppStore } from '@/pinia';
import { onMounted, ref } from 'vue';
import DemoItem from './Demo.vue';
import gsap from 'gsap';
import LoadTest from './pages/Feathers.vue'

const demo = {
  if_visible: ref(false),
  demos: null as null | NodeListOf<HTMLElement>,
  animator: null as null | gsap.core.Timeline,
  init() {
    this.demos = document.querySelectorAll(".demo-item")
  },
  show() {
    this.if_visible.value = true
    appStore.current_page = 'demo'
    let count = 0
    this.animator = gsap.timeline().fromTo(this.demos, {
      opacity: 0,
      y: 20,
      scale: .95
    }, {
      opacity: 1,
      y: 0,
      scale: 1,
      stagger: {
        each: 0.1,
        onComplete: () => {
          if (this.demos)
            this.demos[count++].style.cssText = ""
        }
      },
      duration: .5,
    })
  },
  hide(im: () => void, nx: () => void) {
    if (im) im()
    this.animator = gsap.timeline().to(this.demos, {
      opacity: 0,
      y: 20,
      scale: .95,
      duration: .2,
      onComplete: () => {
        this.if_visible.value = false
        if (nx) nx()
      }
    })
  }
}

const appStore = useAppStore()
appStore.show_demo = demo.show.bind(demo)
appStore.hide_demo = demo.hide.bind(demo)

onMounted(() => {
  demo.init()
})
</script>
<style lang="scss" scoped>
.demo-container {
  padding: 0 1rem;
  padding-top: 6rem;
  display: grid;
  grid-template-columns: repeat(4,1fr);
  flex-wrap: wrap;
  overflow: scroll;
  justify-content: center;
  @media screen and (max-aspect-ratio: 1.8/1) {
    grid-template-columns: repeat(3,1fr);
  }
  @media screen and (max-aspect-ratio: 1.4/1) {
    grid-template-columns: repeat(2,1fr);
  }
}
</style>
