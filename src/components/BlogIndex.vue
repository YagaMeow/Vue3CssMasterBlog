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
    <ScrollIndex></ScrollIndex>
    <CalendarSchedule></CalendarSchedule>
    <MyNotify></MyNotify>
    <!-- <LoadTest /> -->
    <DemoPage></DemoPage>
    <!-- <div class="hue-mask _fullscreen"></div> -->
  </div>
  <Progress></Progress>
</template>
<script setup lang="ts">
import DemoPage from '@/views/Demo/DemoPage.vue'
// import LoadTest from './Feathers.vue'
import CalendarSchedule from '@/views/Calendar/Calendar.vue'
import Progress from './ui/progress.vue'
// import ScrollIndex from './ScrollPage/ScrollIndex.vue'
import MyNotify from './ui/notofication.vue'
import Login from './Login.vue'
import PostTab from './PostTab.vue'
import Nav from './Nav/Nav.vue'
import Posts from '@/views/Articles/PostDiagram.vue'
import BackGround from './background.vue'
import TitleMenu from './TitleMenu.vue'
import PostList from '@/views/Articles/PostList.vue'
import MasonryPost from '@/views/Articles/MasonryPost.vue'
import { useAppStore } from '@/pinia'
import { onMounted, onUnmounted } from 'vue'
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
      // .fromTo(document.querySelectorAll(".brick"), {
      //   scale:0,
      //   rotate: "45deg",
      // },{
      //   scale:1,
      //   rotate: 0,
      //   stagger: {
      //     from: this.count,
      //     amount: 1
      //   }
      // })
      // .fromTo(
      //   this.hue,
      //   {
      //     clipPath: 'polygon(0 0, 100% 0,100% 100%,0 100%)',
      //   },
      //   {
      //     clipPath: 'polygon(100% 0, 100% 0,100% 100%,100% 100%)',
      //     ease: 'power1.out',
      //     duration: 0.5,
      //   },
      //   '>-0.3',
      // )
    }
  }
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
  // mix-blend-mode: difference;
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
  // clip-path: polygon(0 0, 0 0, 0 100%, 0 100%);
  display: flex;
  will-change: clip-path;
  overflow: hidden;
}
</style>
