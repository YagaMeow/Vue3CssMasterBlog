<template>
  <div class="mybutton">
    <slot></slot>
  </div>
</template>
<script setup lang="ts">
defineOptions({
  name: 'MyButton',
})
</script>
<style lang="scss" scoped>
.mybutton {
  --scale: 1;
  cursor: pointer;
  user-select: none;
  height: calc(var(--scale) * 4rem);
  border-radius: 1rem;
  box-shadow: inset 0.1rem 0.1rem var(--white);
  background-color: rgba($color: #000, $alpha: 0.4);
  // opacity: 0.7;
  backdrop-filter: blur(1rem);
  display: flex;
  justify-content: center;
  align-items: center;
  &:hover {
    filter: brightness(2);
  }
}
</style>
