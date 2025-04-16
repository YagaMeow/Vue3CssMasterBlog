<script setup lang="ts">
defineOptions({
  name: 'PostList',
})
import { ref } from 'vue'
import Post from './Post.vue'
const postList = ref([
  { name: 'Post 1', id: 1, uri: 'page1' },
  { name: 'Post 2', id: 2, uri: 'page2' },
  { name: 'Post 3', id: 3, uri: 'page3' },
  { name: 'Post 4', id: 4, uri: 'page4' },
])
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
