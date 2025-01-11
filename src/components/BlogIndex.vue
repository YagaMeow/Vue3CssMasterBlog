<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Nav from './BlogComponents/Nav/Nav.vue';
import Posts from './BlogComponents/Posts/Posts.vue';
import Loading from './Loading/Loading.vue';
import Login from './Login/Login.vue';
import Lenis from 'lenis';
import router from '@/router';
const lenis = new Lenis({});
function raf(time: number) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

</script>
<template>
    <div class="index-container">
        <Nav></Nav>
        <Posts></Posts>
    </div>
</template>
<style scoped>
.index-container {
    width: 100%;
    min-height: 100vh;
    display: flex;
}
</style>