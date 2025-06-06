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
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 1px 1px 20px rgba(0, 0, 0, 0.2);
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
</style>
