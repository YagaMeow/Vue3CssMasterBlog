<script setup lang="ts">
defineOptions({
  name: '404Page',
})
</script>
<template>
  <div class="container">
    <RouterLink to="/" class="back-button"
      ><img class="icon" src="@/assets/svg/back.svg" alt="" />返回首页</RouterLink
    >
    <h1 class="text">
      <span class="code-text">404</span> <span class="delimiter">|</span
      ><ruby>当前页面不存在<rt>p a g e n o t f o u n d</rt></ruby>
    </h1>
  </div>
</template>

<style scoped>
.text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.code-text {
  font-size: 3em;
  color: rgb(178, 0, 0);
}

.delimiter {
  font-size: 2em;
  color: #999;
}

.back-button {
  position: absolute;
  left: 0;
  top: 0;
}

.icon {
  height: 1.5em;
  vertical-align: middle;
}

.back-button {
  padding: 10px;
  border: 1px solid #eee;
  border-top: none;
  border-left: none;
  border-bottom-right-radius: 10%;
  background-color: #eee;
  cursor: pointer;
}
</style>
