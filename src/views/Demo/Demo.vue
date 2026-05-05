<template>
  <div class="demo-item-container">
    <div class="demo-header">
      <slot name="header">
        <h3>{{name}}</h3>
      </slot>
    </div>
    <div class="demo-content">
      <img src="" alt="">
    </div>
    <!-- <LoadTest style="width: 100%;height: 100%;"></LoadTest> -->
  </div>
</template>
<script lang="ts" setup>
// import LoadTest from './pages/Feathers.vue'
defineOptions({
  name: "DemoItem"
})

defineProps({
  name: {
    type: String,
    default: "demo"
  }
})
</script>
<style lang="scss" scoped>

.demo-item-container {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  align-items: flex-start;
  justify-content: flex-end;
  .demo-header {
    * {
      font-size: 2rem;
    }
  }
  &:hover {
    scale: 1.01;
    transition: scale .5s ease;
  }
  transition: scale .2s ease;
  z-index: 1;
  position: relative;
  width: 40rem;
  height: 30rem;
  background-color: #eee;
  border-radius: 2rem;
  margin: 2rem;
  &::after {
    mix-blend-mode: screen;
    content: "";
    width: 42rem;
    height: 32rem;
    position: absolute;
    border-radius: 3rem;
    left: -1rem;
    top: -1rem;
    background-color: rgba($color: #000000, $alpha: .2);
  }
}
</style>
