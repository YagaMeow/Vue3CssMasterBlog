<template>
  <div class="posts-diagram-container _fullscreen" v-show="diagram.if_visible.value" @dragover="dragOver">
    <Post v-for="(item, index) in postList" :key="index" :data="item" :class="{
      dragging: dragData.activeUri === item.uri,
    }" draggable="true" @dragstart="dragStart" @dragend="dragEnd" @drag="onDrag" :uri="item.uri" class="diagram-post">
    </Post>
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
import { useAppStore } from '@/pinia'
import gsap from 'gsap'
import { fa } from 'element-plus/es/locales.mjs'

interface PostItem {
  uri: string
  [key: string]: string | number | boolean | undefined
}

const appStore = useAppStore()

const postList = ref<PostItem[]>([])
const router = useRouter()
const diagram = {
  if_visible: ref(false),
  animator: null as gsap.core.Timeline | null,
  container: null as HTMLElement | null,
  posts: ref<NodeListOf<HTMLElement> | null>(null),
  draggable: ref(false),
  mouse_pos: ref([0, 0]),
  moving: [] as gsap.core.Tween[],
  offset_per: ref([0, 0]),
  timer: null as null | number,
  init: () => {
    diagram.container = document.querySelector('.posts-diagram-container')
    document.addEventListener('mousedown', () => {
      if (diagram.if_visible.value) diagram.draggable.value = true
    })
    document.addEventListener('touchstart', () => {
      if (diagram.if_visible.value) diagram.draggable.value = true
    })
    document.addEventListener('mouseup', () => {
      diagram.draggable.value = false
      diagram.reset()
    })
    document.addEventListener('touchend', () => {
      diagram.draggable.value = false
      diagram.reset()
    })
    document.addEventListener('mousemove', (e) => {
      if (!diagram.draggable.value || appStore.show_detail) return
      if (diagram.mouse_pos.value[0] === 0 || diagram.mouse_pos.value[1] === 0) {
        diagram.mouse_pos.value = [e.x, e.y]
        return
      }
      if (diagram.timer) return
      diagram.timer = setTimeout(() => {
        diagram.timer = 0
      }, 10)
      if (diagram.mouse_pos.value[0] !== 0 || diagram.mouse_pos.value[1] !== 0)
        diagram.move(e.x, e.y)
      diagram.mouse_pos.value = [e.x, e.y]
    })
    document.addEventListener('touchmove', (e) => {
      if (!diagram.draggable.value || appStore.show_detail) return
      if (diagram.mouse_pos.value[0] === 0 || diagram.mouse_pos.value[1] === 0) {
        diagram.mouse_pos.value = [e.touches[0].clientX, e.touches[0].clientY]
        return
      }
      if (diagram.timer) return
      diagram.timer = setTimeout(() => {
        diagram.timer = 0
      }, 10)
      if (diagram.mouse_pos.value[0] !== 0 || diagram.mouse_pos.value[1] !== 0)
        diagram.move(e.touches[0].clientX, e.touches[0].clientY)
      diagram.mouse_pos.value = [e.touches[0].clientX, e.touches[0].clientY]
    })
  },
  async show() {
    if (this.animator?.isActive()) return
    await ArticleAPI.getList({ page: 1, limit: 10 })
      .then((response) => {
        postList.value = response.data
        console.log(postList.value)
      })
      .catch((error) => {
        console.error('Failed to fetch posts:', error)
      })
    this.if_visible.value = true
    this.posts.value = document.querySelectorAll('.diagram-post')
    this.animator = gsap.timeline().to(this.posts.value, {
      opacity: 1,
      scale: 1,
      duration: 0.2,
      stagger: 0.1,
      ease: 'power3.out',
    })
    // this.posts?.forEach((p) => {
    //   p.classList.add('glitch')
    // })
  },
  hide: (immediate: () => void, next: () => void) => {
    if (diagram.animator?.isActive()) {
      diagram.animator.kill()
    }
    if (immediate) immediate()
    if (diagram.posts.value) {
      console.log('[diagram]', diagram.posts)
      diagram.animator = gsap.timeline().to(diagram.posts.value, {
        opacity: 0,
        duration: 0.2,
        ease: 'power3.out',
        onComplete: () => {
          diagram.if_visible.value = false
          console.log(diagram.if_visible.value)
          if (next) next()
        },
      })
    } else if (next) next()
  },
  move(x: number, y: number) {
    const offet_x = (x - diagram.mouse_pos.value[0]) / document.body.offsetWidth
    const offet_y = (y - diagram.mouse_pos.value[1]) / document.body.offsetHeight
    diagram.offset_per.value[0] = offet_x * 100
    diagram.offset_per.value[1] = offet_y * 100
    // if (diagram.offset_per.value[0]) console.log(diagram.offset_per.value)
    console.log('[move]', diagram.posts)
    if (diagram.posts.value) {
      diagram.posts.value.forEach((p, idx) => {
        console.log('yes')
        let new_left = parseFloat(p.style.left) + diagram.offset_per.value[0] * 10
        let new_top = parseFloat(p.style.top) + diagram.offset_per.value[1] * 10
        let _duration = 0
        const width = 250
        if (new_left < 50 - width / 2) new_left += width
        else if (new_left > width / 2 + 50) new_left -= width
        else if (new_top < 50 - width / 2) new_top += width
        else if (new_top > width / 2 + 50) new_top -= width
        else _duration = 0.5
        if (this.moving[idx] != undefined && this.moving[idx].isActive()) this.moving[idx].kill()
        this.moving[idx] = gsap.to(p, {
          left: new_left + '%',
          top: new_top + '%',
          duration: _duration,
          ease: 'power4.out',
        })
      })
    }
  },
  reset() {
    this.mouse_pos.value = [0, 0]
  },
}

appStore.show_diagram = diagram.show.bind(diagram)
appStore.hide_diagram = diagram.hide.bind(diagram)

onMounted(() => {
  diagram.init()
})

onUnmounted(() => {
  document.removeEventListener('mousedown', diagram.init)
  document.removeEventListener('mouseup', diagram.init)
  document.removeEventListener('mousemove', diagram.init)
})

// 长按拖拽相关逻辑
const dragData = ref({
  isDragging: false,
  pos: { x: 0, y: 0 },
  activeUri: '', // 当前激活的文章URI
})

const transparentImg = new Image()
transparentImg.src =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
// 初始化拖拽事件
function dragStart(event: DragEvent) {
  diagram.draggable.value = false
  diagram.reset()
  event.dataTransfer?.setDragImage(transparentImg, 0, 0)
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

  // const bin = document.querySelector('.bin')
  // if (bin && x >= bin?.getBoundingClientRect().left && y >= bin?.getBoundingClientRect().top) {
  //   handleDelete(target.getAttribute('uri') || '')
  // }
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

function dragOver(e: DragEvent) {
  e.preventDefault()
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move'
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
</script>
<style lang="scss" scoped>
.posts-diagram-container {
  --scale: 1;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}

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

.posts-diagram-container {
  overflow: hidden;
  padding: 20px 100px;
  width: 100%;
  display: flex;
  gap: 30px;
  flex-wrap: wrap;

  .post {
    position: absolute;
  }
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
