<template>
    <div class="loading-container _fullscreen">
        <div class="circle-1">

        </div>
        <div class="circle-2"></div>
    </div>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue';
import gsap from 'gsap';

const loading = {
    c1: null as null | HTMLElement,
    c2: null as null | HTMLElement,
    animator: null as null | gsap.core.Timeline,
    show() {
        this.animator = gsap.timeline().to(this.c1,{
            transform: "translate(-25rem, -25rem) scale(2.2)",
            duration: 2,
            ease: "power4.out",
            delay: .5
        }).to(this.c1,{
            opacity: 0,
            duration: 1
        },"<+1").to(this.c2,{
            transform: "translate(-25rem,-25rem) scale(.8)",
            duration: 1,
            ease: "power4.out"           
        },"<-1").to(this.c2,{
            opacity: 0,
            duration: .5
        },"<+.5")

    },
    init() {
        this.c1 = document.querySelector('.circle-1')
        this.c2 = document.querySelector('.circle-2')
    }
}
onMounted(() => {
    loading.init()
    loading.show()
})
</script>
<style lang="scss" scoped>
.loading-container {
    user-select: none;
    pointer-events: none;
    .circle-1 {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-25rem, -25rem) scale(0);
        border-radius: 50%;

        width: 50rem;
        height: 50rem;
        background-color: transparent;
        border: .5rem solid rgba($color: #fff, $alpha: .7);
        box-shadow: inset .2rem .2rem 2rem #fff;
        filter: blur(.1rem);
    }
    .circle-2 {
        background-color: transparent;
        border: .5rem solid #fff;
        width: 50rem;
        height: 50rem;
        border-radius: 50%;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-25rem,-25rem) scale(0);

    }
}
</style>