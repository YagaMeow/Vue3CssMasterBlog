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
        <span class="date">{{ formatDate(data.created_at) }}</span>
      </RouterLink>
    </h2>
    <p class="abstract"></p>
  </div>
</template>
<style scoped>
.post-container {
  width: 800px;
  height: 300px;
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 1px 1px 20px rgba(0, 0, 0, 0.2);
}

.post-container .post-title {
  display: flex;
  padding: 20px 20px;
}

.post-title .date {
  font-size: 0.8rem;
  margin-left: 20px;
}
</style>
