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
  border-radius: 0.5rem;
  box-shadow: inset 1px 1px var(--white);
  background-color: var(--grey);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
