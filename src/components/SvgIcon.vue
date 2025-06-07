<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps({
  iconClass: {
    type: String,
    required: true,
    default: '',
  },
  className: {
    type: String,
    default: '',
  },
})

const iconName = computed(() => `#icon-${props.iconClass}`)
const svgClass = computed(() => {
  return props.className ? `svg-icon ${props.className}` : 'svg-icon'
})
</script>
<template>
  <svg :class="svgClass" aria-hidden="true" width="15" height="15" fill="currentColor">
    <use :xlink:href="iconName" />
  </svg>
</template>

<style scoped>
.svg-icon {
  fill: currentColor;
}
</style>
