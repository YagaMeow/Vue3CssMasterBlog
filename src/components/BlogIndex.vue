<template>
  <!-- <Loading></Loading> -->
  <div class="index-container _fullscreen">
    <BackGround></BackGround>
    <Nav></Nav>
    <Posts></Posts>
    <PostList></PostList>
    <MasonryPost></MasonryPost>
    <TitleMenu></TitleMenu>
    <PostTab></PostTab>
    <Login></Login>
    <ScrollIndex></ScrollIndex>
    <ImgScaler></ImgScaler>
    <CalendarSchedule></CalendarSchedule>
    <!-- <Games></Games> -->
    <Diary></Diary>
    <MyNotify></MyNotify>
    <div class="hue-mask _fullscreen"></div>
  </div>
  <Progress></Progress>
</template>
<script setup lang="ts">
import Diary from './Diary/Diary.vue'
import CalendarSchedule from './Calendar/Calendar.vue'
import Games from './Games/Games.vue'
import ImgScaler from './ImgScaler.vue'
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
  hue: null as null | HTMLElement,
  init() {
    this.container = document.querySelector('.index-container')
    this.hue = document.querySelector('.hue-mask')
  },
  show() {
    if (appStore.hajime) {
      appStore.hajime = false
      this.animator = gsap
        .timeline()
        .to(this.container, {
          // clipPath: 'polygon(-100% 50%, 100% 50%, -100% 50%)',
          // clipPath: 'circle(100%)',
          clipPath: 'polygon(0 0, 100% 0,100% 100%,0 100%)',
          duration: 1,
          force3D: true,
          ease: 'power1.out',
        })
        .fromTo(
          this.hue,
          {
            clipPath: 'polygon(0 0, 100% 0,100% 100%,0 100%)',
          },
          {
            clipPath: 'polygon(100% 0, 100% 0,100% 100%,100% 100%)',
            ease: 'power1.out',
            duration: 1,
          },
          '<+0.2',
        )
        .fromTo(
          this.container,
          {
            borderRadius: '5rem',
            scale: 0.9,
          },
          {
            borderRadius: 0,
            scale: 1,
            duration: 0.8,
          },
          '<-0.2',
        )
    }
  },
}
appStore.show_loading = index.show.bind(index)

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
.hue-mask {
  user-select: none;
  pointer-events: none;
  background-color: #fff;
  backdrop-filter: hue-rotate(240deg);
  // filter: contrast(1.5) saturate(2);
  mix-blend-mode: difference;
}
.index-container {
  /* background: linear-gradient(110deg, rgba(74, 47, 95, 0.5) 10%, #fff 50%),
    linear-gradient(
      160deg,
      rgba(71, 84, 125, 0.5) 20%,
      transparent 30%,
      transparent 85%,
      rgba(105, 82, 116, 0.15) 100%
    ); */
  // clip-path: polygon(100% -50%,100% 50%,100% 150%);
  // clip-path: path("M10,150 C10,150 25,25 180,25 C180,25 195,150 180,150 L10,150 Z");
  // clip-path: path("M 100 0 a 50 50 180 1 0 0 100 Z");
  clip-path: polygon(0 0, 0 0, 0 100%, 0 100%);
  display: flex;
  will-change: clip-path;
  overflow: hidden;
}
</style>
