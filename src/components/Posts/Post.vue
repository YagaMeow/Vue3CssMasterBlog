<template>
  <div class="post post-container" ref="p" v-show="post.if_visible.value">
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
import { onMounted, onUnmounted, ref, watch } from 'vue'
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
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutations) => {
    if (mutations.attributeName === 'class') {
      if (p.value?.classList.contains('glitch')) post.glitch()
    }
  })
})

const post = {
  post: null as HTMLElement | null,
  timer: null as number | null,
  if_visible: ref(false),
  init: () => {
    post.post = p.value
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
        post.if_visible.value = true
        ;(post.post as HTMLElement).style.opacity = '1'
        setTimeout(post.reset, 800)
      },
      range(0, 500),
    )
  },
  reset: () => {
    ;(post.post as HTMLElement).style.clipPath = ``
    ;(post.post as HTMLElement).classList.remove('glitch')
    clearInterval(post.timer as number)
  },
}

onMounted(() => {
  post.init()
  observer.observe(p.value as HTMLElement, {
    attributes: true,
    attributeFilter: ['class'],
  })
})

onUnmounted(() => {
  observer.disconnect()
})
</script>
<style scoped>
.post-container {
  display: flex;
  flex-direction: column;
  width: 30rem;
  height: 30rem;
  border-radius: 1rem;
  backdrop-filter: blur(1rem);
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
    border-radius: 1rem;
  }
  &.giltch::after {
    box-shadow: 1rem 0 0 red;
  }

  &.glitch::before {
    box-shadow: -1rem 0 0 cyan;
    background-color: rgba(0, 0, 0, 0.8);
    mix-blend-mode: lighten;
    z-index: 2;
  }
  display: none;
}

span.title {
  display: flex;
  font-size: 3rem;
  padding: 20px 20px;
}

span.date {
  font-size: 2rem;
}

.post-footer {
  padding: 20px;
  margin-top: auto;
  margin-left: auto;
}

.post-footer .post-footer .date {
  font-size: 2rem;
  margin-left: 20px;
}
</style>
