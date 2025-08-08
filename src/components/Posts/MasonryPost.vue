<template>
  <div class="masonry-post-container _fullscreen" v-show="masonry.if_visible.value">
    <div v-for="i in cols" :key="'col-' + i" class="masonry-post-col">
      <Post
        v-for="item in masonry.colList.value[i - 1]"
        :key="`masonry-post-${item.id}`"
        :data="item"
        class="masonry-post"
        :style="{ height: masonry.height.get(item.id) + 'rem' }"
      ></Post>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ScrollTrigger } from 'gsap/all'
import gsap, { random } from 'gsap'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { ArticleAPI } from '@/api/api'
import type { Article } from '@/utils/utils'
import Post from './Post.vue'
import { range } from '@/utils/utils'
import { useAppStore } from '@/pinia'
import { fa } from 'element-plus/es/locales.mjs'
const appStore = useAppStore()
const cols = ref(5)

gsap.registerPlugin(ScrollTrigger)

const masonry = {
  if_visible: ref(false),
  postList: ref<Article[]>([]),
  colList: ref<Article[][]>(Array.from({ length: 5 }, () => [])),
  container: ref<HTMLElement | null>(null),
  animator: null as gsap.core.Timeline | null,
  posts: null as NodeListOf<HTMLElement> | null,
  height: new Map<number, number>(),
  current_height: new Map<number, number>(),
  h_queue: <number[]>[],
  resizeId: () => {},

  cmp(a: number, b: number): number {
    if (!masonry.current_height.has(a)) masonry.current_height.set(a, 0)
    if (!masonry.current_height.has(b)) masonry.current_height.set(b, 0)
    const ha = masonry.current_height.get(a)
    const hb = masonry.current_height.get(b)
    if (ha === hb) {
      return a - b
    }
    if (ha !== undefined && hb !== undefined) return ha - hb
    return 0
  },
  init() {
    this.container.value = document.querySelector('.masonry-post-container')
    this.resizeId = this.resize.bind(this)
    window.addEventListener('resize', this.resizeId)
  },
  async show() {
    await ArticleAPI.getList({ page: 1, limit: 10 })
      .then((response) => {
        this.postList.value = response.data
        for (let i = 0; i < 20; ++i) {
          this.postList.value.push({
            title: 'place holder',
            uri: 'Xxx' + i,
            id: i,
            created_at: 'today',
          })
        }
        this.postList.value.forEach((p, idx) => {
          const cid = idx
          p.id = idx
          p.title = p.title + idx.toString()
          const randomheight = range(30, 50)
          this.height.set(p.id, randomheight)
        })
        this.calc()
      })
      .catch((error) => {
        console.error('Failed to fetch posts:', error)
      })
    this.posts = document.querySelectorAll('.masonry-post')
    this.if_visible.value = true
    nextTick(() => {
      this.posts?.forEach((p) => {
        this.animator = gsap
          .timeline({
            scrollTrigger: {
              trigger: p,
              scroller: masonry.container.value,
              start: 'top 90%',
              toggleActions: 'play none none one',
            },
          })
          .to(p, {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.2,
            ease: 'power3.out',
          })
      })
    })
  },
  hide(immediate: () => void, next: () => void) {
    if (this.animator?.isActive()) {
      this.animator.kill()
      this.reset()
    }
    if (immediate) immediate()
    this.animator = gsap.timeline().to(this.posts, {
      opacity: 0,
      scale: 0.8,
      duration: 0.2,
      ease: 'power3.in',
      onComplete: () => {
        this.if_visible.value = false
        this.reset()
        if (next) next()
      },
    })
  },
  calc() {
    if (this.container.value)
      cols.value = parseInt(getComputedStyle(this.container.value).getPropertyValue('--cols'))
    this.current_height.clear()
    this.colList.value = Array.from({ length: cols.value }, () => [])
    this.h_queue = Array.from({ length: cols.value }, (v: undefined, idx: number) => idx)
    this.postList.value.forEach((p, idx) => {
      this.h_queue.sort(this.cmp)
      const coltoadd = this.h_queue[0]
      const minheight = this.current_height.get(coltoadd)
      const randomheight = this.height.get(p.id)
      if (minheight !== undefined && randomheight !== undefined)
        this.current_height.set(coltoadd, minheight + randomheight)
      this.colList.value[this.h_queue[0]].push(p)
    })
  },
  reset() {
    this.height.clear()
    this.current_height.clear()
    this.h_queue = []
    this.postList.value = []
    console.log('reset', this.postList.value)
    this.colList.value = Array.from({ length: cols.value }, () => [])
  },
  resize() {
    if (this.container.value)
      cols.value = parseInt(getComputedStyle(this.container.value).getPropertyValue('--cols'))
    console.log(cols.value)
    // this.reset()
    this.calc()
    nextTick(() => {
      this.posts = document.querySelectorAll('.masonry-post')
      this.posts?.forEach((p) => {
        this.animator = gsap
          .timeline({
            scrollTrigger: {
              trigger: p,
              scroller: masonry.container.value,
              start: 'top 90%',
              toggleActions: 'play none none one',
            },
          })
          .to(p, {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.2,
            ease: 'power3.out',
          })
      })
    })
  },
}
appStore.show_masonry = masonry.show.bind(masonry)
appStore.hide_masonry = masonry.hide.bind(masonry)
onMounted(() => {
  masonry.init()
})

onUnmounted(() => {
  window.removeEventListener('resize', masonry.resizeId)
})
</script>
<style lang="scss" scoped>
.masonry-post-container {
  --cols: 5;
  // background-color: rgba($color: #000000, $alpha: 0.4);
  display: grid;
  grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
  grid-gap: 3rem;
  padding: 6rem 5rem;
  overflow: auto;
  .masonry-post-col {
    display: flex;
    gap: 3rem;
    flex-direction: column;
    .masonry-post {
      width: 100%;
      transform: translateY(10rem);
    }
  }
}
@media screen and (max-aspect-ratio: 1.7/1) {
  .masonry-post-container {
    --cols: 4;
  }
}

@media screen and (max-aspect-ratio: 1.4/1) {
  .masonry-post-container {
    --cols: 3;
  }
}

@media screen and (max-aspect-ratio: 1/1) {
  .masonry-post-container {
    --cols: 2;
  }
}

@media screen and (max-aspect-ratio: 0.8/1) {
  .masonry-post-container {
    --cols: 1;
  }
}
</style>
