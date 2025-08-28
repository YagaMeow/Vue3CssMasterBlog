<template>
  <div class="post-list-container" v-show="postlist.if_visible.value">
    <div class="post-list-head">
      <div>Name</div>
      <div>Type</div>
      <div>CreatedAt</div>
      <div>Creator</div>
      <div>ID</div>
    </div>
    <div class="post-list-item-container">
      <div
        class="post-list-item"
        @click="postlist.show_details(item)"
        v-for="(item, index) in postlist.postList.value"
        :key="index"
      >
        <div class="title">
          <div class="avatar _null"></div>
          <span>{{ (item as Article).title }}</span>
        </div>
        <div class="type">none</div>
        <div class="created">{{ formatDate((item as Article).created_at.toString()) }}</div>
        <div class="creator">Loujz</div>
        <div class="id">{{ (item as Article).id }}</div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import type { Ref } from 'vue'
import { ArticleAPI } from '@/api/api'
import type { Article } from '@/utils/utils'
import gsap from 'gsap'
import { useAppStore } from '@/pinia'
import { formatDate } from '@/utils/utils'

const appStore = useAppStore()

const postlist = {
  if_visible: ref(false),
  postList: ref<Article[]>([]),
  container: null as HTMLElement | null,
  posts: null as NodeListOf<HTMLElement> | null,
  animator: null as null | gsap.core.Timeline,
  init() {
    this.container = document.querySelector('.post-list-container')
  },
  async show() {
    await ArticleAPI.getList({ page: 1, limit: 10 })
      .then((response) => {
        this.postList.value = response.data
        // for (let i = 0; i < 10; ++i) {
        //   this.postList.value.push({
        //     title: 'place holder',
        //     uri: 'Xxx' + i,
        //     id: i,
        //     created_at: 'today',
        //   })
        // }
      })
      .catch((error) => {
        console.error('Failed to fetch posts:', error)
      })
    this.if_visible.value = true
    this.posts = document.querySelectorAll('.post-list-item')
    this.animator = gsap
      .timeline()
      .to(this.container, {
        opacity: 1,
        duration: 0.3,
        ease: 'power3.in',
      })
      .to(
        this.posts,
        {
          opacity: 1,
          duration: 0.2,
          ease: 'power3.in',
          stagger: 0.04,
        },
        '<',
      )
  },
  hide(immediate: () => void, next: () => void) {
    if (this.animator?.isActive()) this.animator.kill()
    if (immediate) immediate()
    if (next) next()
    this.animator = gsap
      .timeline()
      .to(this.container, {
        opacity: 0,
        duration: 0.5,
        ease: 'power3.out',
      })
      .to(this.posts, {
        opacity: 0,
        duration: 0,
        onComplete: () => {
          this.if_visible.value = false
        },
      })
  },
  show_details(a: Article) {
    appStore.post_data = a
    appStore.show_tab?.()
  },
}
appStore.show_list = postlist.show.bind(postlist)
appStore.hide_list = postlist.hide.bind(postlist)

onMounted(() => {
  postlist.init()
})
</script>
<style lang="scss" scoped>
.post-list-container {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  user-select: none;
  margin: 5.5rem 1rem;
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  background-color: rgba($color: #000000, $alpha: 0.2);
  border-radius: 2rem;
  box-shadow: inset 0rem 0.1rem #fff;
  opacity: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .post-list-head,
  .post-list-item {
    display: grid;
    grid-template-columns: 10fr auto 8fr 4fr auto;
    grid-gap: 1rem;
  }
  .post-list-item-container {
    overflow: auto;
  }
  .post-list-head {
    flex-shrink: 0;
    padding: 1rem;
    height: 6rem;
    width: 100%;

    align-items: center;
    justify-content: left;
    div {
      font-size: 2rem;
      color: #fff;
    }
  }
  .post-list-item {
    opacity: 0;
    cursor: pointer;
    width: 100%;
    padding: 1rem;
    align-items: center;
    justify-content: left;

    backdrop-filter: blur(1rem);
    border-radius: 1rem;
    .title {
      align-items: center;
      gap: 1rem;
      display: flex;
      align-items: center;
      justify-content: left;
      .avatar {
        width: 5rem;
        height: 5rem;
        min-width: 5rem;
        background-color: black;
        flex-shrink: 0;
      }
    }
    span,
    div {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      min-width: 0;
      font-size: 2rem;
      color: #fff;
    }
    &:nth-child(2n) {
      background-color: rgba($color: #000000, $alpha: 0.7);
    }
    &:nth-child(2n-1) {
      background-color: rgba($color: #616161, $alpha: 0.8);
    }
  }
}
@media screen and (max-aspect-ratio: 0.8/1) {
  .post-list-item {
    * {
      font-size: 4rem !important;
    }
    .id,
    .type {
      width: 0;
    }
  }
}
</style>
