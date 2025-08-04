<template>
  <div class="posts-container">
    <div class="create" @click="handleCreate"></div>
    <div class="bin" :class="dragData.isDragging === true ? 'active' : 'inactive'"></div>
    <Post
      :data="{
        title: 'Test',
      }"
    ></Post>
    <Post
      v-for="(item, index) in postList"
      :key="index"
      :data="item"
      :class="{
        dragging: dragData.activeUri === item.uri,
      }"
      draggable="true"
      @dragstart="dragStart"
      @dragend="dragEnd"
      @drag="onDrag"
      :uri="item.uri"
    ></Post>
    <!-- <Post
      v-for="(item, index) in postList"
      :key="index"
      :data="item"
      :class="{
        shaking: longPress.active && longPress.targetUri === item.uri,
        dragging: dragData.activeUri === item.uri,
      }"
      draggable="true"
      @mousedown="startLongPress($event, item.uri)"
      @touchstart="startLongPress($event, item.uri)"
      @mouseup="cancelLongPress"
      @touchend="cancelLongPress"
      @mouseleave="cancelLongPress"
      @dragstart="dragStart"
      @dragend="dragEnd"
      @drag="onDrag"
      :uri="item.uri"
    ></Post> -->
  </div>
</template>
<script setup lang="ts">
defineOptions({
  name: 'PostList',
})
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Post from './Post.vue'
import { ArticleAPI } from '@/api/api'
import { ElNotification } from 'element-plus'

interface PostItem {
  uri: string
  [key: string]: string | number | boolean | undefined
}

const postList = ref<PostItem[]>([])
const router = useRouter()

// 获取文章
ArticleAPI.getList({ page: 1, limit: 10 })
  .then((response) => {
    postList.value = response.data
    console.log(postList.value)
  })
  .catch((error) => {
    console.error('Failed to fetch posts:', error)
  })

const handleCreate = () => {
  router.push('/posts/new')
}

// 长按拖拽相关逻辑
const dragData = ref({
  isDragging: false,
  pos: { x: 0, y: 0 },
  activeUri: '', // 当前激活的文章URI
})

// 开始拖拽
function startDrag(uri: string) {
  dragData.value.isDragging = true
  dragData.value.activeUri = uri
}

// 初始化拖拽事件
function dragStart(event: DragEvent) {
  const target = event.target as HTMLElement
  if (target.classList.contains('post-container')) {
    event.dataTransfer?.setData('text/plain', target.dataset.id || '')
    target.classList.add('dragging')
    dragData.value.pos.x = event.clientX - parseInt(target.getAttribute('x') || '0')
    dragData.value.pos.y = event.clientY - parseInt(target.getAttribute('y') || '0')
    dragData.value.isDragging = true
  }
}

// 拖拽结束
function dragEnd(event: DragEvent) {
  const target = event.target as HTMLElement
  target.classList.remove('dragging')
  const rect = target.getBoundingClientRect()
  const x = rect.left + rect.width
  const y = rect.top + rect.height

  const bin = document.querySelector('.bin')
  if (bin && x >= bin?.getBoundingClientRect().left && y >= bin?.getBoundingClientRect().top) {
    handleDelete(target.getAttribute('uri') || '')
  }
  dragData.value.isDragging = false
  dragData.value.activeUri = ''
}

// 拖拽过程中
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
      const offsetY = event.clientY - dragData.value.pos.y
      let offsetX = event.clientX - dragData.value.pos.x

      if (event.clientX !== 0 || event.clientY !== 0) {
        if (offsetX + left < 0) {
          offsetX = -left
        } else if (offsetX + width + left > windowWidth - 5) {
          offsetX = windowWidth - width - left - 5
        }
        target.setAttribute('x', offsetX.toString())
        target.setAttribute('y', offsetY.toString())
        draggingElement.style.transform = `translate(${offsetX}px, ${offsetY}px)`
      }
    }
  }
}

// 删除逻辑
function handleDelete(uri: string) {
  ArticleAPI.delete(uri).then(() => {
    ElNotification({
      title: '删除成功',
      message: '文章已删除',
      type: 'success',
      duration: 2000,
    })
    postList.value = postList.value.filter((item) => item.uri !== uri)
  })
}

// 清理计时器
onUnmounted(() => {})
</script>
<style scoped>
.create,
.bin {
  width: 50px;
  height: 50px;
  bottom: 20px;
  background-color: #fafafa;
  position: fixed;
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
  gap: 30px;
  flex-wrap: wrap;
}

.create:hover,
.bin:hover {
  animation: shake 0.5s ease-in-out;
}

/* 抖动动画 */
.shaking {
  animation: shake 0.5s ease-in-out infinite;
}

@keyframes shake {
  0% {
    transform: translate(0, 0);
  }
  25% {
    transform: rotate(-10deg);
  }
  50% {
    transform: rotate(10deg);
  }
  75% {
    transform: rotate(-5deg);
  }
  100% {
    transform: translate(0, 0);
  }
}

/* 环形进度条 */
.progress-ring {
  position: fixed;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 9999;
}
</style>
