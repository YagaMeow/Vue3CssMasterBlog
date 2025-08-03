<template>
  <div class="post post-container" ref="p">
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
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { range } from '@/utils/utils'

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

const p = ref<HTMLElement | null>(null)

const post = {
  post: null as HTMLElement | null,
  timer: null as number | null,
  init: () => {
    post.post = p.value
    post.glitch()
  },
  glitch: () => {
    setTimeout(
      () => {
        post.timer = setInterval(() => {
          const top = Math.random() * 100
          const left = Math.random() * 100
          const x = Math.random() * 100
          const y = Math.random() * 100
          const w = Math.random() * 50 + 50
          const h = Math.random() * 10 + 40
          ;(post.post as HTMLElement).style.display = 'flex'
          ;(post.post as HTMLElement).style.clipPath =
            `polygon(${x}% ${y}%, ${x + w}% ${y}%,${x + w}% ${y + h}%,${x}% ${y + h}%)`
          ;(post.post as HTMLElement).style.left = `${left}%`
          ;(post.post as HTMLElement).style.top = `${top}%`
        }, 30)
        setTimeout(post.reset, 800)
      },
      range(0, 500),
    )
  },
  reset: () => {
    ;(post.post as HTMLElement).style.clipPath = ``
    clearInterval(post.timer as number)
  },
}

onMounted(() => {
  post.init()
})
</script>
<style scoped>
.post-container {
  display: flex;
  flex-direction: column;
  max-width: 400px;
  min-width: 350px;
  height: 300px;
  border-radius: 20px;
  backdrop-filter: blur(5px);
  background-color: #fff;
  /* animation: 1s rect; */
  &::after,
  &::before {
    content: '';
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    border-radius: 20px;
  }
  &::after {
    box-shadow: 10px 0 0 red;
  }

  &::before {
    box-shadow: -10px 0 0 cyan;
    background-color: rgba(0, 0, 0, 0.8);
    mix-blend-mode: lighten;
    z-index: 2;
  }
  display: none;
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
