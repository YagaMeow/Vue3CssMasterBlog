<template>
  <div class="post mas-post-container">
    <div class="post-cover" @click="mas_post.show_details" :uri="data.uri">
      <img :id="`cover${data.id}`" :src="mas_post.imgUrl.value" alt="">

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
    default: () => ({})
  }
})

const mas_post = {
  imgUrl: ref(""),
  init() {
    if (props.data.cover.cover_url) {
      this.imgUrl.value = import.meta.env.VITE_BASE_API + "/api" + props.data.cover.cover_url
    } else {
      const bgstyle = range(1, 7)
      this.imgUrl.value = `/img/music${Math.floor(bgstyle)}.jpg`
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
  }
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
  box-shadow: -.1rem -.1rem .1rem #fff;
  border-radius: 1rem;
  // background-color: #000;
  opacity: 0;

  .post-cover {
    width: 100%;
    border-radius: .7rem;
    overflow: hidden;

    img {
      width: 100%;
      scale: 1;
      transition: scale ease .3s;
    }
  }

  &:hover {
    filter: brightness(.9);

    .post-cover img {
      scale: 1.05;
      transition: scale ease .1s;
    }
  }
}
</style>
