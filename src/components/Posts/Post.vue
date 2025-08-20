<template>
  <div class="post post-container" ref="p" v-show="post.if_visible.value">
    <div class="post-info" ref="info" @dragover="
      (e: DragEvent) => {
        e.preventDefault()
        if (e.dataTransfer) {
          e.dataTransfer.dropEffect = 'move'
        }
      }
    ">
      <div class="myform col">
        <div class="row">
          <div class="text">Creator</div>
          <div class="dot"></div>
          <div class="text">Loujz</div>
        </div>
        <div class="row">
          <div class="text">Create at</div>
          <div class="dot"></div>
          <div class="text">{{new Date(data.created_at).toLocaleDateString('zh-CN',{

          })}} </div>
        </div>
      </div>
      <MyButton>
        <div id="share">share</div>
      </MyButton>
    </div>
    <div class="post-content" @click="post.show_details">
      <h2 class="post-title">
        <!-- <RouterLink :to="`/posts/${data.uri}`" class="post-link"> -->
        <div class="post-link">
          <span class="title">{{ data.title }}</span>
        </div>
        <!-- </RouterLink> -->
      </h2>
      <p class="abstract"></p>
      <p class="post-footer">
        <MyButton @click.stop="post.switchInfo" class="icon" ref="i">i</MyButton>
        <MyButton style="margin-left: 1rem;" @click.stop="handleDelete(data.uri)">
          <svg-icon iconClass="bin"></svg-icon>
        </MyButton>
        <span class="date">{{ formatDate(data.created_at) }}</span>
      </p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { range } from '@/utils/utils'
import MyButton from '@/components/ui/btn.vue'
import gsap from 'gsap'
import type { ComponentPublicInstance } from 'vue'
import { useAppStore } from '@/pinia'
import { formatDate } from '@/utils/utils'
import { ArticleAPI } from '@/api/api'
defineOptions({
  name: 'SinglePost',
})

const appStore = useAppStore()
const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
})

const p = ref<HTMLElement | null>(null)
const info = ref<HTMLElement | null>(null)

const i = ref<ComponentPublicInstance | null>(null)
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutations) => {
    if (mutations.attributeName === 'class') {
      if (p.value?.classList.contains('glitch')) post.glitch()
    }
  })
})

const post = {
  post: null as HTMLElement | null,
  info: null as HTMLElement | null,
  icon: null as HTMLElement | null,
  timer: null as number | null,

  if_visible: ref(true),
  show_info: ref(false),
  init: () => {
    const top = Math.random() * 100
    const left = Math.random() * 100

    post.post = p.value
    post.info = info.value
    post.icon = i.value ? (i.value.$el as HTMLElement) : null
      ; (post.post as HTMLElement).style.left = `${left}%`
      ; (post.post as HTMLElement).style.top = `${top}%`
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
            ; (post.post as HTMLElement).style.clipPath =
              `polygon(${x}% ${y}%, ${x + w}% ${y}%,${x + w}% ${y + h}%,${x}% ${y + h}%)`
            ; (post.post as HTMLElement).style.left = `${left}%`
            ; (post.post as HTMLElement).style.top = `${top}%`
        }, 30)
          // post.if_visible.value = true
          ; (post.post as HTMLElement).style.opacity = '1'
        setTimeout(post.reset, 800)
      },
      range(0, 500),
    )
  },
  reset: () => {
    ; (post.post as HTMLElement).style.clipPath = ``
      ; (post.post as HTMLElement).classList.remove('glitch')
    clearInterval(post.timer as number)
  },
  switchInfo() {
    if (post.show_info.value === false) {
      post.show_info.value = true
        ; (post.info as HTMLElement).style.pointerEvents = 'auto'
        ; (post.icon as HTMLElement).textContent = '×'
      gsap.timeline().to(post.info, {
        opacity: 1,
        duration: 0.2,
        ease: 'power3.out',
        onComplete: () => {
          post.icon?.classList.add('always-show')
        },
      })
    } else {
      post.show_info.value = false
        ; (post.info as HTMLElement).style.pointerEvents = 'none'
        ; (post.icon as HTMLElement).textContent = 'i'
      gsap.timeline().to(post.info, {
        opacity: 0,
        duration: 0.2,
        ease: 'power3.out',
        onComplete: () => {
          post.icon?.classList.remove('always-show')
        },
      })
    }
  },
  hide() {
    gsap.timeline().to(this.post, {
      scale: 0.8,
      opacity: 0,
      duration: .2,
      ease: "power1.out"
    })
  },
  show_details() {
    appStore.post_data = props.data as {
      title: string
      uri: string
      id: number
      created_at: string
    }
    // console.log(appStore.post_data.title)
    appStore.edit_mode = false
    appStore.show_tab?.()
    // appStore.lenis.stop()
  },
}

async function handleDelete(uri: string) {
  await ArticleAPI.delete(uri)
  post.hide()
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
<style lang="scss" scoped>
.post-container {
  opacity: 0;
  scale: 0.8;

  &:hover {
    z-index: 998;
    filter: brightness(0.9);

    .mybutton {
      opacity: 1 !important;
      transition: opacity ease-in-out 0.5s;
    }
  }

  cursor: pointer;
  user-select: none;
  display: flex;
  width: 32rem;
  height: 32rem;
  border-radius: 2rem;
  backdrop-filter: blur(1rem);
  background-color: rgba($color: #000, $alpha: 0.8);
  box-shadow: inset 0.1rem 0.1rem var(--white);
  display: flex;
  justify-content: center;

  .post-info {
    pointer-events: none;
    opacity: 0;
    position: absolute;
    top: 0.9rem;
    left: 0.9rem;
    width: 30.2rem;
    height: 30.2rem;
    display: flex;
    flex-direction: column;
    background-color: rgba(0, 0, 0, 0.8);
    border-radius: 1rem;
    backdrop-filter: blur(1rem);
    padding: 1rem;

    .col {
      display: flex;
      flex-direction: column;
    }

    .row {
      display: flex;
      flex-wrap: nowrap;
      gap: 1rem;
      align-items: center;
      justify-content: center;
      margin: 0 1rem;
    }

    .myform {
      .text {
        font-size: 1.5rem;
        color: #fff;
      }

      .dot {
        flex: 1 1;
        border-bottom: dotted 0.2rem #fff;
      }
    }

    margin-top: auto;

    .mybutton {
      margin: 1rem;
      margin-top: auto;
      margin-left: auto;
      padding: 0 1rem;
      transform: translateY(-0.5rem);

      div {
        display: flex;
        gap: 0.5rem;
        color: #fff;
        font-size: 1.5rem;

        &#share::after {
          content: '↗';
          transition: ease-in-out 0.1s;
        }

        &#share:hover::after {
          transform: translate(0.2rem, -0.2rem);
          transition: ease-in-out 0.1s;
        }
      }
    }
  }

  .post-content {
    margin: 1rem;
    flex-grow: 1;
    border-radius: 1rem;
    background-color: rgba($color: #d1d1d1, $alpha: 1);
    color: #000;
    display: flex;
    flex-direction: column;

    .post-footer {
      padding: 2rem;
      margin-top: auto;
      display: flex;
      align-items: center;
      justify-content: center;

      .date {
        margin-left: auto;
        font-size: 2rem;
      }

      .mybutton {
        &:hover {
          filter: brightness(2);
        }

        &.always-show {
          opacity: 1 !important;
        }

        width: 4rem;
        height: 4rem;
        color: #fff;
        opacity: 0;
        transition: opacity ease-in-out 0.5s;
        font-size: 2rem;
      }
    }
  }

  /* outline: 1rem solid rgba(0, 0, 0, 0.4); */
  /* animation: 1s rect; */
  &::after,
  &::before {
    pointer-events: none;
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
}

span.title {
  display: flex;
  font-size: 3rem;
  padding: 2rem 2rem;
}
</style>
