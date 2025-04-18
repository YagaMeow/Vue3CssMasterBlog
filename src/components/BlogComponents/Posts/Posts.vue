<script setup lang="ts">
defineOptions({
  name: 'PostList',
})
import { ref } from 'vue'
import Post from './Post.vue'
import { ArticleAPI } from '@/api/api'

const postList = ref([])

ArticleAPI.getList({ page: 1, limit: 10 })
  .then((response) => {
    postList.value = response.data
    console.log(postList.value)
  })
  .catch((error) => {
    console.error('Failed to fetch posts:', error)
  })
</script>
<template>
  <div class="posts-container">
    <Post v-for="(item, index) in postList" :key="index" :data="item"></Post>
  </div>
</template>
<style scoped>
.posts-container {
  margin-top: 50px;
  padding: 20px 100px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
</style>
