<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Nav from './BlogComponents/Nav/Nav.vue'
import Posts from './BlogComponents/Posts/Posts.vue'
import Loading from './Loading/Loading.vue'
import Login from './Login/Login.vue'
import Lenis from 'lenis'
import router from '@/router'
const lenis = new Lenis({})
function raf(time: number) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}
requestAnimationFrame(raf)
</script>
<template>
  <div class="index-container">
    <Nav style="z-index: 999"></Nav>
    <Posts></Posts>
  </div>
</template>
<style scoped>
.index-container {
  background: linear-gradient(110deg, rgba(74, 47, 95, 0.5) 10%, #fff 50%),
    linear-gradient(
      160deg,
      rgba(71, 84, 125, 0.5) 20%,
      transparent 30%,
      transparent 85%,
      rgba(105, 82, 116, 0.15) 100%
    );
  width: 100%;
  min-height: 100vh;
  display: flex;
}
</style>
