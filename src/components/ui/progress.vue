<template>
    <div class="progress-container">
        <div :class="p.complete?['hide']:[]" class="progress" v-for="p in appStore.progress">
            <p v-if="!p.complete">{{p.label}}{{ p.current }}/{{ p.total }}</p>
            <p v-else>{{p.label}}</p>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { useAppStore } from '@/pinia';

const appStore = useAppStore()
const progress = {}
</script>
<style lang="scss" scoped>
.progress-container {
    display: flex;
    flex-direction: column;
    position: absolute;
    left: 0;
    bottom: 0;
    padding: 2rem;

    .progress {
        p {
            font-size: 2rem;
        }

        width: 30rem;
        padding: 1rem 0;
        // background-color: #fff;
        &.hide {
            animation: 1s fadeout ease-out forwards;
        }
    }
}
@keyframes fadeout {
    0% {
        opacity: 1;
    }
    100% {
        display: none;
        opacity: 0;
    }
}

</style>