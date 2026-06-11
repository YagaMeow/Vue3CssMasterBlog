<template>
  <div class="demo-container _fullscreen" v-show="demo.if_visible.value">
    <DemoItem class="demo-item" v-for="i in 20" :key="i"></DemoItem>
  </div>
</template>
<script lang="ts" setup>
import { useAppStore } from '@/pinia';
import { onMounted, ref } from 'vue';
import DemoItem from './Demo.vue';
import gsap from 'gsap';

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
        onComplete:() => {
          if(this.demos)
          this.demos[count++].style.cssText = ""
        }
      },
      duration: .5,

    })
  },
  hide(im: () => void, nx: () => void) {
    this.if_visible.value = false
    if (im) im()
    if (nx) nx()
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
  display: flex;
  flex-wrap: wrap;
  overflow: scroll;
  justify-content: space-around;
}
</style>
