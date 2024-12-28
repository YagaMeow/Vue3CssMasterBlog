<style scoped>
    .card-container {
        min-height: 100vh;
        width: 100%;
        border: solid 10px greenyellow;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .card-container h1 {
        color: #fff;
        font-size: 3rem;
    }
</style>
<template>
    <div class="card-container">
        <h1>
            CARD {{num}}
        </h1>
        <h2>

        </h2>
    </div>
</template>
<script setup lang="ts">
defineProps<{
    num: Number
}>()
</script>