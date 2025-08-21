<template>
    <div class="notify-container">
        <span class="notify-text">
            {{ notify.text.value }}
        </span>
    </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import gsap from 'gsap';
import { useAppStore } from '@/pinia';
defineOptions({
    Name: 'MyNotify'
})
const appStore = useAppStore()
const notify = {
    animator: null as null | gsap.core.Timeline,
    text: ref("sample text"),
    container: null as null | HTMLElement,
    show() {
        this.animator = gsap.timeline().to(
            this.container, {
                y: '3rem',
                duration: 0.2,
                ease: "power1.out",
            }
        ).to(this.container,{
            rotate: '-2deg',
            duration: 0
        }).to(this.container,{
            rotate: '2deg',
            yoyo: true,
            repeat: 5,
            duration: 0.03
        }).to(this.container,{
            rotate: 0,
            duration: 0
        }).add(() => {
            this.hide()
        },"+=0.3")
    },
    hide() {
        this.animator = gsap.timeline().to(this.container,{
            y: '-10rem',
            duration: 0.8,
            ease: "power1.in"
        }).to(this.container,{
            opacity: 0,
            duration: 0.7,
            ease: "power1.out"
        },"<").to(this.container,{
            opacity: 1,
            y: "-30rem",
            duration: 0
        })
    },
    init() {
        this.container = document.querySelector(".notify-container")
    },
    notify(text: string){
        this.text.value = text,
        this.show()
    }
}

appStore.notify = notify.notify.bind(notify)

onMounted(() => {
    notify.init()
})
</script>
<style lang="scss" scoped>
.notify-container {
    z-index: 1000;
    width: 30rem;
    height: 7rem;
    background-color: #000;
    position: absolute;
    left: 50%;
    transform: translate(-50%,-30rem);
    border-radius: 2rem;
    box-shadow: inset 1px 1px 0.1rem #616161;
    display: flex;
    align-items: center;
    justify-content: center;

    .notify-text {
        color: #fff;
        font-size: 2rem;
    }
}
</style>
