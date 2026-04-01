<template>
  <div class="post mas-post-container">
    <div class="post-cover" @click="mas_post.show_details" :uri="data.uri">
      <img :id="`cover${data.id}`" :src="handleUrl(mas_post.imgUrl.value)" alt="" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useAppStore } from '@/pinia'
import { range } from '@/utils/utils'
import { onMounted, ref } from 'vue'
const appStore = useAppStore()

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
})

function handleUrl(origin: string): string {
  if (origin == '') {
    const bgstyle = range(1, 7)
    return `/img/music${Math.floor(bgstyle)}.jpg`
  } else {
    origin = origin.replace('covers', 'covers/webp')
    origin = origin.slice(0, origin.lastIndexOf('.')) + '-400w.webp'
  }
  return origin
}

const mas_post = {
  imgUrl: ref(''),
  init() {
    if (props.data.cover.cover_url) {
      this.imgUrl.value = import.meta.env.VITE_BASE_API + '/api' + props.data.cover.cover_url
    } else {
      this.imgUrl.value = ''
    }
  },
  show_details() {
    appStore.post_data = props.data as {
      title: string
      uri: string
      id: number
      created_at: string
      tags: { name: string }[]
    }
    appStore.edit_mode = false
    appStore.show_tab?.()
  },
}
onMounted(() => {
  mas_post.init()
})
</script>
<style lang="scss" scoped>
.mas-post-container {
  cursor: pointer;
  overflow: hidden;
  box-sizing: border-box;
  border: 1rem solid transparent;
  box-shadow: -0.1rem -0.1rem 0.1rem #fff;
  border-radius: 1rem;
  // background-color: #000;
  opacity: 0;

  .post-cover {
    width: 100%;
    border-radius: 0.7rem;
    overflow: hidden;

    img {
      width: 100%;
      scale: 1;
      transition: scale ease 0.3s;
    }
  }

  &:hover {
    filter: brightness(0.9);

    .post-cover img {
      scale: 1.05;
      transition: scale ease 0.1s;
    }
  }
}
</style>
