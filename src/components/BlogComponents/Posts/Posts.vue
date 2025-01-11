<script setup lang="ts">
import { ref } from 'vue';
import Post from './Post.vue';
const postList = ref([
    {name: 'Post 1'},
    {name: 'Post 2'},
    {name: 'Post 3'},
    {name: 'Post 4'}
])

</script>
<template>
    <div class="posts-container">
        <Post v-for="item in postList" :data="item"></Post>
    </div>
</template>
<style scoped>
    .posts-container {
        margin-top: 50px;
        padding: 20px 100px;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
    }
</style>