<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineOptions({
  name: 'SinglePost',
})

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
})
function formatDate(date: string): string {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(date).toLocaleDateString(undefined, options)
}
</script>
<template>
  <div class="post-container">
    <h2 class="post-title">
      <RouterLink :to="`/posts/${data.uri}`" class="post-link">
        <span class="title">{{ data.title }}</span>
      </RouterLink>
    </h2>
    <p class="abstract"></p>
    <p class="post-footer">
      <span class="date">{{ formatDate(data.created_at) }}</span>
    </p>
  </div>
</template>
<style scoped>
.post-container {
  display: flex;
  flex-direction: column;
  max-width: 400px;
  min-width: 350px;
  height: 300px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 20px;
  backdrop-filter: blur(5px);
  animation: 1s rect;
}

.post-container .post-title {
  display: flex;
  padding: 20px 20px;
}

.post-footer {
  padding: 20px;
  margin-top: auto;
  margin-left: auto;
}

.post-footer .post-footer .date {
  font-size: 0.8rem;
  margin-left: 20px;
}

@keyframes rect {
  0% {
    clip-path: inset(0 100% 0 0 round 5%);
    transform: translateX(-5rem);
    animation-timing-function: cubic-bezier(0.7, 0, 0.3, 1);
  }
  100% {
    clip-path: inset(0 0 0 0 round 5%);
    transform: translateX(0);
  }
}
</style>
