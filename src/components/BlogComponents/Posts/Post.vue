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
</script>
<template>
  <div class="post-container">
    <h2 class="post-title">
      <RouterLink :to="`/posts/${data.uri}`" class="post-link">
        <span class="title">{{ data.name }}</span>
        <span class="date">1970-01-01</span>
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
