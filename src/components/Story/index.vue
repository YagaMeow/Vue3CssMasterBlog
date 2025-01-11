<script setup lang="ts">
import BgText from './BgText.vue';
import Wrapper from './Wrapper.vue';
</script>
<template>
    <section class="story">
        <wrapper></wrapper>
        <BgText></BgText>
    </section>
</template>
<script lang="ts">
export default {
    name: 'Story'
}
</script>
<style scoped>
    .story {
        width: 100%;
        background-color: #c0d5e8   ;
    }
</style>