<script setup lang="ts">
defineOptions({
  name: 'PostList',
})
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Post from './Post.vue'
import { ArticleAPI } from '@/api/api'
import { ElNotification } from 'element-plus'
import { ta } from 'element-plus/es/locales.mjs'

interface PostItem {
  uri: string
  // Add other properties as needed
  [key: string]: string | number | boolean | undefined
}
const postList = ref<PostItem[]>([])

//获取文章
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

//拖拽逻辑
const dragData = {
  isDragging: ref(false),
  pos: {
    x: 0,
    y: 0,
  },
}
function dragStart(event: DragEvent) {
  const target = event.target as HTMLElement
  if (target.classList.contains('post-container')) {
    event.dataTransfer?.setData('text/plain', target.dataset.id || '')
    target.classList.add('dragging')
    dragData.pos.x = event.clientX - parseInt(target.getAttribute('x') || '0')
    dragData.pos.y = event.clientY - parseInt(target.getAttribute('y') || '0')
    console.log('[drag]start')
    dragData.isDragging.value = true
  }
}

function dragEnd(event: DragEvent) {
  const target = event.target as HTMLElement
  target.classList.remove('dragging')
  console.log('[drag]end')
  const rect = target.getBoundingClientRect()
  const x = rect.left + rect.width
  const y = rect.top + rect.height

  const bin = document.querySelector('.bin')
  if (bin && x >= bin?.getBoundingClientRect().left && y >= bin?.getBoundingClientRect().top) {
    handleDelete(target.getAttribute('uri') || '')
  }
  dragData.isDragging.value = false
}

function onDrag(event: DragEvent) {
  const target = event.target as HTMLElement
  if (target.classList.contains('post-container')) {
    const draggingElement = document.querySelector('.dragging') as HTMLElement
    if (draggingElement) {
      const rect = target.getBoundingClientRect()
      const width = rect.width
      const height = rect.height
      const left = target.offsetLeft
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight
      const offsetY = event.clientY - dragData.pos.y
      let offsetX = event.clientX - dragData.pos.x
      console.log(`[drag]${event.clientX}, ${event.clientY}`)
      if (event.clientX !== 0 || event.clientY !== 0) {
        if (offsetX + left < 0) {
          offsetX = -left
        } else if (offsetX + width + left > windowWidth - 5) {
          offsetX = windowWidth - width - left - 5
        }
        target.setAttribute('x', offsetX.toString())
        target.setAttribute('y', offsetY.toString())
        draggingElement.style.transform = `translateY(${offsetY}px)`
        draggingElement.style.transform += `translateX(${offsetX}px)`
      }
    }
  }
}

//删除逻辑

function handleDelete(uri: string) {
  ArticleAPI.delete(uri).then(() => {
    ElNotification({
      title: '保存成功',
      message: '文章已保存',
      type: 'success',
      duration: 2000,
    })
    postList.value = postList.value.filter((item) => item.uri !== uri)
  })
}
</script>
<template>
  <div class="posts-container">
    <div class="create" @click="handleCreate"></div>
    <div class="bin" :class="dragData.isDragging.value === true ? 'active' : 'inactive'"></div>
    <Post
      v-for="(item, index) in postList"
      :key="index"
      :data="item"
      draggable="true"
      @dragstart="dragStart"
      @dragend="dragEnd"
      @drag="onDrag"
      :uri="item.uri"
    ></Post>
  </div>
</template>
<style scoped>
.create,
.bin {
  width: 50px;
  height: 50px;
  bottom: 20px;
  background-color: #fafafa;
  position: absolute;
  border-radius: 20%;
  box-shadow: 1px 1px 20px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

.create {
  left: 20px;
}

.bin {
  right: 20px;
  background-image: url('@/assets/svg/bin.svg');
  background-size: 50%;
  background-repeat: no-repeat;
  background-position: center;
}

.create::before,
.bin::before {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
  color: #aaa;
}

.bin.active {
  background-color: rgba(255, 0, 0, 0.5);
  z-index: 999;
}

.create::before {
  content: '+';
}

.bin::before {
  content: '';
}
.posts-container {
  margin-top: 50px;
  padding: 20px 100px;
  width: 100%;
  display: flex;
  /* align-items: center; */
  gap: 10px;
  flex-wrap: wrap;
}
</style>
