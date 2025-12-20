<template>
  <div class="scaler-container" draggable="false" v-show="imgScaler.if_visible.value">
    <div class="scaler-slot"></div>
    <div class="scaler-bar" draggable="false"></div>
  </div>

</template>
<script lang="ts" setup>
import { useAppStore } from '@/pinia';
import { onMounted } from 'vue';
import { ref } from 'vue';
import { gsap } from 'gsap';

const appStore = useAppStore()
const imgScaler = {
  container: null as null | HTMLElement,
  if_visible: ref(false),
  deltaY: 0,
  lastY: null as null | number,
  bar: null as null | HTMLElement,
  slotHeight: 0,
  show(pos: { x: number, y: number },p: number) {
    this.if_visible.value = true
    if (this.container) {
      this.container.style.top = pos.y + 'px'
      this.container.style.left = pos.x + 'px'
    }
    if(this.bar)
    this.bar.style.top = p + 'px'
    gsap.to(this.container, {
      opacity: 1,
    })
  },
  hide() {
    gsap.to(this.container, {
      opacity: 0,
      onComplete: () => {
        this.if_visible.value = false
        this.lastY = null
        this.deltaY = 0
        if(this.bar)
        this.bar.style.top = '0'
      }
    })
  },
  init() {
    this.container = document.querySelector('.scaler-container')
    this.bar = document.querySelector('.scaler-bar')
    this.bar?.addEventListener("mousedown", imgScaler.handleDragBar)
  },
  handleMove(e: MouseEvent) {
    if (imgScaler.lastY === null) imgScaler.lastY = e.clientY
    else {
      imgScaler.deltaY += e.clientY - imgScaler.lastY
      if (imgScaler.deltaY < 0) imgScaler.deltaY = 0
      if (imgScaler.deltaY > imgScaler.slotHeight) imgScaler.deltaY = imgScaler.slotHeight
      if (imgScaler.bar)
        imgScaler.bar.style.top = imgScaler.deltaY + 'px'
      imgScaler.lastY = e.clientY
    }
    appStore.resize_image?.(1-imgScaler.deltaY/imgScaler.slotHeight)
  },
  handleUp() {
    console.log('up')
    document.removeEventListener("mousemove", imgScaler.handleMove)
    document.removeEventListener("mouseup", imgScaler.handleUp)
    imgScaler.lastY = null
  },
  handleDragBar() {
    imgScaler.slotHeight = (document.querySelector('.scaler-slot')?.clientHeight as number - (imgScaler.bar as HTMLElement).clientHeight as number) || 0
    console.log(imgScaler.slotHeight)
    console.log('down')
    document.addEventListener("mousemove", imgScaler.handleMove)
    document.addEventListener("mouseup", imgScaler.handleUp)
  }
}
onMounted(() => {
  imgScaler.init()
})

appStore.show_scaler = imgScaler.show.bind(imgScaler)
appStore.hide_scaler = imgScaler.hide.bind(imgScaler)

</script>
<style lang="scss" scoped>
.scaler-container {
  transform: translate(-50%, -50%);
  opacity: 0;
  top: 10rem;
  z-index: 1001;
  width: 5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;

  .scaler-slot {
    user-select: none;
    width: .8em;
    height: 10rem;
    background-color: #ccc;
    outline: solid .4rem #000;
    border-radius: .5rem;
  }

  .scaler-bar {
    top: 0;
    cursor: pointer;
    position: absolute;
    width: 3rem;
    height: 1.5rem;
    background-color: #000;
    border: .2rem solid #ccc;
    border-radius: .5rem;
  }
}
</style>
