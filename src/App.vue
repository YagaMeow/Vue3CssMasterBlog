<template>
  <Loading ref="loading" :check="check_loading"></Loading>
  <RouterView></RouterView>
</template>
<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted, ref } from 'vue'
import Loading from './components/Loading/Loading.vue'
import router from './router'

interface LoadingInstance {
  _out: () => void
  _in: (next: () => void) => void
}

const loading = ref<LoadingInstance | null>(null)

function check_loading() {
  console.log('[Loading] Check Loading')
  const timer = setInterval(() => {
    if (document.readyState === 'complete') {
      clearInterval(timer)
      loading.value?._out()
    }
  }, 300)
}

onMounted(() => {
  const container = document.querySelector('.index-container')
  router.beforeEach((to, from, next) => {
    loading.value?._in(next)
  })
  check_loading()
})
</script>
<style scoped></style>
