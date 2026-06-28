<template>
  <div class="posts-diagram-container _fullscreen" v-show="diagram.if_visible.value" @dragover="dragOver">
    <Post v-for="(item, index) in diagram.postList.value" :key="index" :data="item" :class="{
      dragging: dragData.activeUri === item.uri,
    }" draggable="true" @dragstart="dragStart" @dragend="dragEnd" @drag="onDrag" :uri="item.uri" class="diagram-post">
    </Post>
  </div>
</template>
<script setup lang="ts">
defineOptions({
  name: 'PostList',
})
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import Post from './Post.vue'
import { ArticleAPI } from '@/api/api'
import { autoResizerProps, ElNotification } from 'element-plus'
import { useAppStore } from '@/pinia'
import gsap from 'gsap'
import { fa, id } from 'element-plus/es/locales.mjs'
import type { Article } from '@/utils/utils'

const appStore = useAppStore()

const router = useRouter()

function handleInter(entries: IntersectionObserverEntry[]) {
  entries.map((entry) => {
    console.log('inter')
      ; (entry.target as HTMLElement).style.backgroundImage =
        (entry.target as HTMLElement).dataset.bg || ''
    let dbg = (entry.target as HTMLElement).dataset.bg || ''
    dbg = dbg.slice(dbg.indexOf('"') + 1, dbg.lastIndexOf('"'))
      ; (entry.target as HTMLElement).querySelector("img")?.setAttribute("src", dbg || '')
    entry.target.classList.remove('lazy-load')
    observer.unobserve(entry.target)
  })
}

const observer = new IntersectionObserver(handleInter)

const diagram = {
  postList: ref<Article[]>([]),
  if_visible: ref(false),
  animator: null as gsap.core.Timeline | null,
  container: null as HTMLElement | null,
  posts: ref<NodeListOf<HTMLElement> | null>(null),
  draggable: ref(false),
  mouse_pos: ref([0, 0]),
  moving: [] as gsap.core.Timeline[],
  lock: new Map<number, boolean>(),
  position: [] as { x: number; y: number }[],
  offset_per: ref([0, 0]),
  timer: null as null | number,
  rafId: null as number | null,
  resetId: null as number | null,
  // setters: new Map<HTMLElement, { left: gsap.QuickToFunc; top: gsap.QuickToFunc }>(),
  init: () => {
    diagram.container = document.querySelector('.posts-diagram-container')
    document.addEventListener('mousedown', (e) => {
      if (diagram.rafId || !(e.target as HTMLElement).classList.contains("posts-diagram-container")) return
      if (diagram.if_visible.value) diagram.draggable.value = true
    })
    document.addEventListener('touchstart', () => {
      if (diagram.rafId) return
      if (diagram.if_visible.value) diagram.draggable.value = true
    })
    document.addEventListener('mouseup', () => {
      diagram.draggable.value = false
      if (!diagram.resetId) {
        diagram.resetId = requestAnimationFrame(() => {
          diagram.reset()
          diagram.resetId = null
        })
      }

    })
    document.addEventListener('touchend', () => {
      diagram.draggable.value = false
      if (!diagram.resetId) {
        diagram.resetId = requestAnimationFrame(() => {
          diagram.reset()
          diagram.resetId = null
        })
      }
    })
    document.addEventListener('mousemove', (e) => {
      if (!diagram.rafId) {
        if (!diagram.draggable.value || appStore.show_detail) return
        if (diagram.mouse_pos.value[0] === 0 && diagram.mouse_pos.value[1] === 0) {
          diagram.mouse_pos.value = [e.x, e.y]
          return
        }
        diagram.rafId = requestAnimationFrame(() => {
          // console.log(diagram.mouse_pos.value)
          const delta = [e.x - diagram.mouse_pos.value[0], e.y - diagram.mouse_pos.value[1]]
          diagram.mouse_pos.value = [e.x, e.y]
          diagram.move(delta[0], delta[1])
          diagram.rafId = null
        })
      }
    })
    document.addEventListener('touchmove', (e) => {
      if (!diagram.rafId) {
        if (!diagram.draggable.value || appStore.show_detail) return
        if (diagram.mouse_pos.value[0] === 0 || diagram.mouse_pos.value[1] === 0) {
          diagram.mouse_pos.value = [e.touches[0].clientX, e.touches[0].clientY]
          return
        }
        diagram.rafId = requestAnimationFrame(() => {
          // console.log(diagram.mouse_pos.value)
          const delta = [e.touches[0].clientX - diagram.mouse_pos.value[0], e.touches[0].clientY - diagram.mouse_pos.value[1]]
          diagram.mouse_pos.value = [e.touches[0].clientX, e.touches[0].clientY]
          diagram.move(delta[0], delta[1])
          diagram.rafId = null
        })
      }
    })
  },
  async show() {
    if (this.animator?.isActive()) return
    await ArticleAPI.getList({ page: 1, limit: 10 })
      .then((response) => {
        this.postList.value = response.data
        nextTick(() => {
          const images = document.querySelectorAll('.lazyload')
          images.forEach((img) => observer.observe(img))
        })
      })
      .catch((error) => {
        console.error('Failed to fetch posts:', error)
      })
    // this.initSetters()
    this.if_visible.value = true
    this.posts.value = document.querySelectorAll('.diagram-post')
    this.posts.value?.forEach((p) => {
      this.position.push({
        x: parseFloat(p.style.getPropertyValue('--x')),
        y: parseFloat(p.style.getPropertyValue('--y')),
      })
    })
    this.posts.value?.forEach(p => {
      console.log(p.style.getPropertyValue("--x"), p.style.getPropertyValue("--y"))

      // p.style.setProperty("transform", `translate(10px,200px)`)
      p.style.setProperty("transform", `translate(${p.style.getPropertyValue("--x")},${p.style.getPropertyValue("--y")})`)
    })

    this.animator = gsap.timeline()
      .fromTo(this.posts.value, {
        opacity: 0,
        scale: .8,
      }, {
        opacity: 1,
        scale: 1,
        duration: 0.2,
        stagger: 0.1,
        ease: 'power3.out'
      })
  },

  hide: (immediate: () => void, next: () => void) => {
    if (diagram.animator?.isActive()) {
      diagram.animator.kill()
    }
    if (immediate) immediate()
    if (diagram.posts.value) {
      diagram.animator = gsap.timeline().to(diagram.posts.value, {
        opacity: 0,
        duration: 0.2,
        scale: 1,
        ease: 'power3.out',
        onComplete: () => {
          diagram.if_visible.value = false
          diagram.reset()
          diagram.position = []
          if (next) next()
        },
      })
    } else if (next) next()
  },
  move(x: number, y: number) {
    if (diagram.posts.value) {
      diagram.posts.value.forEach((p, idx) => {
        // if (diagram.lock.get(idx)) return
        if (this.moving[idx] != undefined && this.moving[idx].isActive()) {
          this.moving[idx].kill()
        }
        diagram.position[idx].x = diagram.position[idx].x + x
        diagram.position[idx].y = diagram.position[idx].y + y
        const out_left = diagram.position[idx].x
        const out_top = diagram.position[idx].y
        const width_per = 300
        let flag = false

        let new_left = out_left
        let new_top = out_top
        const width = document.body.offsetWidth
        const height = document.body.offsetHeight
        if (new_left < -width) {
          new_left += 3 * width
          flag = true
        } else if (new_left > 2 * width) {
          new_left -= 3 * width
          flag = true
        }
        if (new_top < -height) {
          new_top += 3 * height
          flag = true
        } else if (new_top > 2 * height) {
          new_top -= 3 * height
          flag = true
        }

        if (flag) {
          diagram.lock.set(idx, true)
          gsap.fromTo(p, {
            opacity: 0
          }, {
            x: new_left + 'px',
            y: new_top + 'px',
            onComplete: () => {
              p.style.setProperty("opacity", "1")
              diagram.lock.set(idx, false)
              diagram.position[idx].x = new_left
              diagram.position[idx].y = new_top
              p.style.setProperty("--x", new_left + 'px')
              p.style.setProperty("--y", new_top + 'px')
            }
          })
          return
        }
        // if (diagram.lock.get(idx)) return
        // if (flag) console.log(idx)
        if (flag) console.log("fuck!")
        gsap.to(p, {
          x: out_left + 'px',
          y: out_top + 'px',
        })
        p.style.setProperty("--x", out_left + 'px')
        p.style.setProperty("--y", out_top + 'px')
      })
    }
  },
  reset() {
    this.mouse_pos.value = [0, 0]
    dragData.value.isDragging = false
    dragData.value.pos = { x: 0, y: 0 }
    dragData.value.activeUri = ''
  },
  addPost(a: Article) {
    this.postList.value.push(a)
    nextTick(() => {
      this.posts.value = document.querySelectorAll('.diagram-post')
      this.position = []
      this.posts.value.forEach((p) => {
        this.position.push({
          x: parseFloat(p.style.getPropertyValue('left')),
          y: parseFloat(p.style.getPropertyValue('top')),
        })
      })
      const images = document.querySelectorAll('.lazyload')
      images.forEach((img) => observer.observe(img))
    })
  },
}

appStore.update_diagram = diagram.addPost.bind(diagram)
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
    dragData.value.pos.x = event.clientX - parseInt(target.style.getPropertyValue('--x') || '0')
    dragData.value.pos.y = event.clientY - parseInt(target.style.getPropertyValue('--y') || '0')
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
      const offsetX = event.clientX - dragData.value.pos.x
      if (event.clientX !== 0 || event.clientY !== 0) {
        // if (offsetX + left < 0) {
        //   offsetX = -left
        // } else if (offsetX + width + left > windowWidth - 5) {
        //   offsetX = windowWidth - width - left - 5
        // }
        target.style.setProperty('--x', offsetX.toString())
        target.style.setProperty('--y', offsetY.toString())
        gsap.to(target, {
          // x: 'var(--x) + "px"',
          // y: 'var(--y) + "px"',
        })
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
    appStore.notify?.('数据已删除')
    diagram.postList.value = diagram.postList.value.filter((item) => item.uri !== uri)
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

@media screen and (max-aspect-ratio: 0.8/1) {

  .post {
    :deep(.title) {
      font-size: 5rem;
    }

    :deep(.date) {
      font-size: 4rem !important;
    }
  }
}
</style>
