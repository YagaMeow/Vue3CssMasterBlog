<script setup>
import WaveBox from './WaveBox.vue';
import LoadingText from './LoadingText.vue';
</script>
<template>
    <div id="loading">
        <LoadingText></LoadingText>
        <WaveBox></WaveBox>
    </div>
</template>
<style scoped>
#loading {
    height: 100%;
    width: 100%;
    background: #fff;
    position: fixed;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    z-index: 999;
}
</style>