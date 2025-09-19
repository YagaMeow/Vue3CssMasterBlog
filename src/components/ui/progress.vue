<template>

    <div class="progress-bar"
        :class="(appStore.total_steps != 0 && appStore.total_steps == appStore.completed_steps) ? ['complete'] : []"
        :style="{ '--progress': appStore.total_steps == 0 ? 0 : appStore.completed_steps / appStore.total_steps }">
        <!-- <p>{{ appStore.completed_steps }}/{{ appStore.total_steps }}</p> -->
    </div>
    <div class="progress-text"
        :class="(appStore.total_steps != 0 && appStore.total_steps == appStore.completed_steps) ? ['complete'] : []">
        <p>
            <span>Welcome</span>
        </p>
    </div>
    <div class="progress-container">
        <div :class="p.complete ? ['hide'] : []" class="progress" v-for="p in appStore.progress">
            <p v-if="!p.complete">{{ p.label }}{{ p.current }}/{{ p.total }}</p>
            <p v-else>{{ p.label }}</p>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { useAppStore } from '@/pinia';
import { nextTick, onMounted, ref } from 'vue';
import { watch } from 'vue'

const appStore = useAppStore()
const progress = {
    init() { }
}

watch(() => appStore.completed_steps, (val) => {
    if (appStore.total_steps != 0 && appStore.total_steps == appStore.completed_steps) {
        setTimeout(() => {
            if (appStore.show_loading)
                appStore?.show_loading()
        }, 500);
    }
})
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

.progress-text {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    p {
        overflow: hidden;
        padding: 0.5rem;
        position: relative;
        top: -1.6rem;
        overflow: hidden;
    }

    p span {
        position: relative;
        font-size: 3rem;
        color: #fff;
        top: 3.5rem;
    }

    &.complete {
        p span {
            transition: top 0.5s ease-out;
            top: -1rem;
        }
    }
}

.progress-bar {
    width: 50rem;
    background-color: #111;
    outline: 1px solid #fff;
    height: 2rem;
    border-radius: 1rem;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: scaleY(1) translate(-50%, -50%);

    p span {
        color: #fff;
        font-size: 2rem;
    }

    &::after {
        position: absolute;
        content: '';
        left: 0;
        height: 2rem;
        border-radius: 1rem;
        width: calc(var(--progress) * 100%);
        background-color: #fff;
    }

    &.complete {
        transform: scaleY(0.1) translate(-50%, -50%);
        transition: transform 0.5s ease;
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