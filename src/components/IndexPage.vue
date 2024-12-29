<script setup lang="ts">
import MyCard from './MyCard.vue';
import Loading from './Loading/Loading.vue';
import Nav from './NavMenu/Nav.vue';
import FirstScreen from './FirstScreen/FirstScreen.vue';
import ScrollBar from './ScrollBar/ScrollBar.vue';
import Lenis from 'lenis';
const lenis = new Lenis({});
function raf(time: number) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
</script>
<template>
    <div class="container">
        <Loading></Loading>
        <header class="top">
            <Nav></Nav>
        </header>
        <FirstScreen></FirstScreen>
        <div style="height: 10vh;width: 100%;"></div>
        <ScrollBar :lenis="lenis"></ScrollBar>
        <!-- <MyCard v-for="id in 7" :num="id"></MyCard> -->
    </div>
</template>
<style scoped>
.container {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}
.top {
    width: 100%;
    position: relative;
}
</style>