<template>
  <div class="f-container _fullscreen">
    <div class="mask"></div>

    <img src="../assets/img/feather.png" alt="" style="--x: 0;--y: 0;--z: 50rem;--s:1">
    <img src="../assets/img/feather.png" alt="" style="--x: 0;--y: 0;--z: 50rem;--s:1">

    <img src="../assets/img/feather.png" alt="" style="--x: 0;--y: 0;--z: 60rem;--s:1">
    <img src="../assets/img/feather.png" alt="" style="--x: 0;--y: 0;--z: 60rem;--s:1">

    <img src="../assets/img/feather.png" alt="" style="--x: 0;--y: 0;--z: 70rem;--s:1">
    <img src="../assets/img/feather.png" alt="" style="--x: 0;--y: 0;--z: 70rem;--s:1">

    <img src="../assets/img/feather.png" alt="" style="--x: 0;--y: 0;--z: 80rem;--s:1">
    <img src="../assets/img/feather.png" alt="" style="--x: 0;--y: 0;--z: 80rem;--s:1">

    <img src="../assets/img/feather.png" alt="" style="--x: 0;--y: 0;--z: 90rem;--s:1">
    <img src="../assets/img/feather.png" alt="" style="--x: 0;--y: 0;--z: 90rem;--s:1">

    <img src="../assets/img/feather.png" alt="" style="--x: 0;--y: 0;--z: 100rem;--s:1">
    <img src="../assets/img/feather.png" alt="" style="--x: 0;--y: 0;--z: 100rem;--s:1">


    <img src="../assets/img/feather.png" alt="" style="--x: 0;--y: 0;--z: 110rem;--s:1">
    <img src="../assets/img/feather.png" alt="" style="--x: 0;--y: 0;--z: 110rem;--s:1">


    <img src="../assets/img/feather.png" alt="" style="--x: 0;--y: 0;--z: 40rem;--s:1">
    <img src="../assets/img/feather.png" alt="" style="--x: 0;--y: 0;--z: 40rem;--s:1">


    <img src="../assets/img/feather.png" alt="" style="--x: 0;--y: 0;--z: 30rem;--s:1">
    <img src="../assets/img/feather.png" alt="" style="--x: 0;--y: 0;--z: 30rem;--s:1">

    <img src="../assets/img/feather.png" alt="" style="--x: 0;--y: 0;--z: 20rem;--s:1">
    <img src="../assets/img/feather.png" alt="" style="--x: 0;--y: 0;--z: 20rem;--s:1">

    <img src="../assets/img/feather.png" alt="" style="--x: 0;--y: 0;--z: 10rem;--s:1">
    <img src="../assets/img/feather.png" alt="" style="--x: 0;--y: 0;--z: 10rem;--s:1">

    <img src="../assets/img/feather.png" alt="" style="--x: 0;--y: 0;--z: 0rem;--s:1">
    <img src="../assets/img/feather.png" alt="" style="--x: 0;--y: 0;--z: 0rem;--s:1">

    <img src="../assets/img/feather.png" alt="" style="--x: 0;--y: 0;--z: -10rem;--s:1">
    <img src="../assets/img/feather.png" alt="" style="--x: 0;--y: 0;--z: -10rem;--s:1">

    <img src="../assets/img/feather.png" alt="" style="--x: 0;--y: 0;--z: -20rem;--s:1">
    <img src="../assets/img/feather.png" alt="" style="--x: 0;--y: 0;--z: -20rem;--s:1">

    <img src="../assets/img/feather.png" alt="" style="--x: 0;--y: 0;--z: -30rem;--s:1">
    <img src="../assets/img/feather.png" alt="" style="--x: 0;--y: 0;--z: -30rem;--s:1">

  </div>
</template>
<script lang="ts" setup>
import { isMobile, normalRange, range } from '@/utils/utils';
import { onMounted } from 'vue';
import gsap from 'gsap';
import { delay } from 'lodash';

defineOptions({
  name: "LoadTest"
})

const feathers = {
  feathers: null as null | NodeListOf<HTMLElement>,
  container: null as null | HTMLElement,
  init() {
    this.container = document.querySelector(".f-container")
    this.feathers = document.querySelectorAll(".f-container img")
    this.feathers.forEach(f => {
      f.style.setProperty("--d", 3 + 's')
      f.style.setProperty("--s", range(0.4, 0.6).toString())
      if (isMobile()) {
        f.style.setProperty('--s', range(0.2, 0.4).toString())
      }
      f.style.setProperty("--rx", range(-1, 1).toString())
      f.style.setProperty("--ry", range(-1, 1).toString())
      f.style.setProperty("--rz", range(-1, 1).toString())
      f.style.setProperty("--ra", range(0, 360) + "deg")
      f.style.setProperty("--v", range(1.2, 2.4) + 's')
      if(isMobile()) {
        f.style.setProperty("--v",range(1.2,1.8)+'s')
      }
      const x = range(-100, 0)
      const y = normalRange(100 + x, 10)
      f.style.setProperty("--x",'-100%')
      f.style.setProperty("--x", `calc(${x}vw - 100%)`)
      f.style.setProperty("--y", y + 'dvh')
    })
    gsap.timeline().to(this.container, {
      "--p": "100%",
      delay: 3.8,
      duration: 0.6
    }).to(
      this.container, {
      "--tp": "100%",
      duration: 1.1
    },
      "<"
    )
  }
}

onMounted(() => {
  feathers.init()
})
</script>
<style lang="scss" scoped>
@keyframes feather {
  0% {
    top: 100%;
    right: 100%;
  }

  100% {
    top: 0;
    right: -200%;
  }
}

@keyframes mask {
  0% {
    mask: linear-gradient(45deg, transparent 0%, #fff 0%);
  }

  100% {
    mask: linear-gradient(45deg, transparent 100%, #fff 100%);
  }
}

.f-container {
  --p: 0%;
  --tp: 0%;
  pointer-events: none;

  img {
    position: absolute;
    transform: translate3d(var(--x), var(--y), var(--z)) rotate3d(var(--rx), var(--ry), var(--rz), var(--ra));
    scale: var(--s);
    transform-origin: right top;
    top: 100%;
    right: 100%;
    animation: feather var(--v) ease-in var(--d) forwards;
    user-select: none;
    pointer-events: none;
  }

  .mask {
    pointer-events: none;
    user-select: none;
    mix-blend-mode: darken;
    width: 100%;
    height: 100%;
    background-color: rgba($color: #000000, $alpha: 1);
    mask: radial-gradient(circle at left bottom, transparent var(--tp), #fff var(--p));
  }
}
</style>
