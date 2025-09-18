<template>
  <div class="index-container _fullscreen">
    <BackGround></BackGround>
    <Nav></Nav>
    <Posts></Posts>
    <PostList></PostList>
    <MasonryPost></MasonryPost>
    <TitleMenu></TitleMenu>
    <PostTab></PostTab>
    <Login></Login>
    <MyNotify></MyNotify>
    <Loading></Loading>
    <ScrollIndex></ScrollIndex>
    <Progress></Progress>
  </div>
</template>
<script setup lang="ts">
import Progress from './ui/progress.vue'
import ScrollIndex from './ScrollPage/ScrollIndex.vue'
import MyNotify from './ui/notofication.vue'
import Login from './Login.vue'
import PostTab from './PostTab.vue'
import Nav from './Nav/Nav.vue'
import Posts from './Posts/PostDiagram.vue'
import BackGround from './background.vue'
import Lenis from 'lenis'
import TitleMenu from './TitleMenu.vue'
import PostList from './Posts/PostList.vue'
import MasonryPost from './Posts/MasonryPost.vue'
import { useAppStore } from '@/pinia'
import Loading from './Loading/Circle.vue'
import { onMounted } from 'vue'
import gsap from 'gsap'

const appStore = useAppStore()
const index = {
  container: null as null | HTMLElement,
  animator: null as null | gsap.core.Timeline,
  init() {
    this.container = document.querySelector('.index-container')
    this.show()
  },
  show() {
    if (appStore.hajime) {
      appStore.hajime = false
      this.animator = gsap.timeline().to(this.container, {
        clipPath: 'circle(100%)',
        duration: 2,
        force3D: true,
        ease: 'power4.out',
      })
    }
  },
}

onMounted(() => {
  index.init()
})
// const appStore = useAppStore()
// const lenis = new Lenis({})
// appStore.lenis = lenis
// function raf(time: number) {
//   lenis.raf(time)
//   requestAnimationFrame(raf)
// }
// requestAnimationFrame(raf)
</script>
<style lang="scss" scoped>
.index-container {
  /* background: linear-gradient(110deg, rgba(74, 47, 95, 0.5) 10%, #fff 50%),
    linear-gradient(
      160deg,
      rgba(71, 84, 125, 0.5) 20%,
      transparent 30%,
      transparent 85%,
      rgba(105, 82, 116, 0.15) 100%
    ); */
  clip-path: circle(0%);
  display: flex;
  will-change: clip-path;
  overflow: hidden;
}
</style>
