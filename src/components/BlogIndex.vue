<template>
  <div class="index-container">
    <BackGround></BackGround>
    <Nav style="z-index: 999"></Nav>
    <Posts></Posts>
    <TitleMenu></TitleMenu>
  </div>
</template>
<script setup lang="ts">
import Nav from './Nav/Nav.vue'
import Posts from './Posts/PostList.vue'
import BackGround from './background.vue'
import Lenis from 'lenis'
import TitleMenu from './TitleMenu.vue'
const lenis = new Lenis({})
function raf(time: number) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}
requestAnimationFrame(raf)
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
  width: 100%;
  min-height: 100vh;
  display: flex;
}
</style>
