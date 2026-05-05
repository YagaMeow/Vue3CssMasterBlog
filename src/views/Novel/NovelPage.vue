<template>
  <div class="novel-container _fullscreen" v-show="novel.if_visible.value">
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';

const novel = {
  if_visible: ref(false)
}
</script>
<style lang="scss" scoped></style>
