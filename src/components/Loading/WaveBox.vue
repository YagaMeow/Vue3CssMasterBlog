<script setup lang="ts">
import { ref, onMounted } from 'vue'
onMounted(() => {
    const waves = document.querySelector(".wavebox");
    const loading = document.querySelector("#loading") as HTMLElement;
    function handleLoading() {
        waves?.classList.add("run");
        const textbox = document.querySelector(".loading-text-box")
        // setTimeout(() => {
        //     textbox?.classList.add("fadeout");
        //     setTimeout(() => {
        //         if(loading && loading.style)
        //             loading.style.display = "none";
        //     },1000);
        // }, 2250);
    }
    window.addEventListener("load", handleLoading);
})
</script>
<template>
  <div class="wavebox"></div>
</template>
<style scoped>

</style>
