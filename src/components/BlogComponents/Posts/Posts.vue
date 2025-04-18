<script setup lang="ts">
defineOptions({
  name: 'PostList',
})
import { ref } from 'vue'
import { useRouter } from 'vue-router'
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
const router = useRouter()
const handleCreate = () => {
  router.push('/posts/new')
}
</script>
<template>
  <div class="posts-container">
    <div class="create" @click="handleCreate"></div>
    <Post v-for="(item, index) in postList" :key="index" :data="item"></Post>
  </div>
</template>
<style scoped>
.create {
  width: 100px;
  height: 300px;
  background-color: #fafafa;
  position: absolute;
  transform: translateX(-460px);
  border-radius: 20px;
  box-shadow: 1px 1px 20px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

.create::before {
  content: '+';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 5rem;
  color: #aaa;
}
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
