<script setup lang="ts">
import { ref, onMounted, triggerRef } from 'vue';
import Lenis, { type ScrollCallback } from 'lenis';
import { loadRouteLocation } from 'vue-router';
const props = defineProps({
    lenis: {
        type: Lenis
    }
})
onMounted(() => {
    const sf = {
        observer: null as IntersectionObserver | null,
        container: document.querySelector(".pin-spacer") as HTMLElement,
        chara: document.querySelector(".chara") as HTMLElement,
        carousel: document.querySelector(".chara-carousel") as HTMLElement,
        distance_scroll: 0,
        distance_trigger: 0,
        distance_edge: 0,
        binded_scroll: null as Function | null,
        observe() {
            this.observer = new IntersectionObserver((e) => {
                if (e[0].isIntersecting) {
                    this.createListener();
                } else {
                    this.removeListener();
                }
            }) as IntersectionObserver;
            this.observer.observe(this.container as HTMLElement);
        }, resize() {
            this.distance_trigger = this.container.offsetTop;
            this.distance_edge = this.container.offsetHeight - innerHeight;
        }, createListener() {
            if (this.binded_scroll ?? null === null)
                this.binded_scroll = this.scroll.bind(this);
            props.lenis?.on('scroll', this.binded_scroll as ScrollCallback);
        }, removeListener() {
            props.lenis?.off('scroll', this?.binded_scroll as ScrollCallback);
        }, scroll() {
            if (scrollY < this.distance_trigger) return this.reset();
            this.distance_scroll = scrollY - this.distance_trigger;
            this.distance_scroll = Math.max(this.distance_scroll, 0);
            this.distance_scroll = Math.min(this.distance_scroll, this.distance_edge);
            this.chara.style.transform = `translate(0,${this.distance_scroll}px)`;
            this.carousel.style.transform = `translate(${-this.distance_scroll}px,0)`;
            let proportion = this.distance_scroll * 14 / sf.carousel.scrollWidth;
            this.clearBgColor()
            console.log(proportion);
            proportion = Math.min(10,Math.floor(proportion));
            for(let i=0;i<11;++i){
                if(proportion == i){
                    this.chara.classList.add("bg"+(i+1));
                }
            }
        }, clearBgColor() {
            let classList = [];
            for (let i = 1; i <= 11; ++i)
                classList.push('bg' + i);
            this.chara.classList.remove(...classList);
        }, reset() {
            this.clearBgColor();
            if (scrollY < this.distance_trigger) {
                this.distance_scroll = 0;
            }
            else {
                this.distance_scroll = this.distance_edge;
            }
            this.chara.style.transform = `translate(0,${this.distance_scroll}px)`;
            this.carousel.style.transform = `translate(${-this.distance_scroll}px,0)`;
        }, remove() {
            this.observer?.unobserve(this.container);
            this.observer = null;
        }
    }
    sf.container.style.height = sf.carousel.scrollWidth + "px";
    sf.resize();
    sf.observe();
    window.addEventListener("resize", sf.resize.bind(sf));
});
</script>
<template>
    <div class="pin-spacer">
        <section id="character" class="chara">
            <ul class="chara-carousel">
                <li class="chara-text-box">
                    <h2 class="chara-title">
                        <span class="disp-none">
                            S.E.E.S
                        </span>
                    </h2>
                    <div class="chara-text">
                        An aggregation vigilantly chosen to
                        <br>
                        vanquish the Shadows, will face Destiny.
                        <br>
                        Time won't wait for you, destiny won't change for you.
                        <br>
                    </div>
                </li>
                <li>
                    <ul class="chara-list">
                        <li v-for="i in 10" class="chara-slide">
                            <a class="chara-image" href="">
                                <img :src="`../../../public/img/ch${i}.webp`" alt="">
                            </a>
                        </li>
                    </ul>
                </li>
                <li class="chara-text-box">
                    <h2 class="chara-title">
                        STREGA
                    </h2>
                    <div class="chara-text">
                        The Dark Hour is a period of time hidden between each day that most people cannot perceive.
                        <br>
                        A group called Strega takes advantage of this, using it to carry out requests for revenge on
                        others.
                        <br>
                        As the members of S.E.E.S. strive to solve the mystery of the Dark Hour, Strega stands before
                        them as an adversary.
                    </div>
                </li>
                <li>
                    <ul class="chara-list">
                        <li v-for="i in 3" class="chara-slide">
                            <a class="chara-image" href="">
                                <img :src="`../../../public/img/ch${10 + i}.webp`" alt="">
                            </a>
                        </li>
                    </ul>
                </li>
            </ul>
        </section>
    </div>
</template>
<style scoped>
.pin-spacer {
    width: 100%;
    display: block;
    margin: -1px 0 0;
    overflow: hidden;
    position: relative;
    height: 11557px;
}

.chara-carousel {
    /* position: absolute;
    top: 0;
    bottom: 0;
    left: 0; */
    list-style: none;
    display: flex;
    width: 100%;
    align-items: center;
    margin: auto 0;
}

.chara-text-box {
    margin-right: calc(158 / 1920 * 100vw);
    padding-left: calc(179 / 1920 * 100vw);
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
}

.chara-text-box {
    display: block;
}

.chara-title {
    width: 704px;
    height: 211px;
    font-family: Noto Sans JP;
    font-size: 200px;
    line-height: 211px;
    font-style: italic;
    display: block;
}

.chara-text {
    margin-top: 50px;
    line-height: 3;
}

.chara-list {
    display: flex;
    align-items: center;
    list-style: none;
}

.chara-list>li {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 100px;
}

.chara-slide {
    display: flex;
}

.chara-image {
    width: calc(570 / 944 * 100vh);
    height: calc(760 / 944 * 100vh);
    overflow: hidden;
    position: relative;
}

.chara-image img {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    transform: scale(1);
    transition: transform .5s ease-in-out;
    user-select: none;
}

.chara-image img:hover {
    transform: scale(1.1);
}

.chara {
    height: 100vh;
    display: flex;
    align-items: center;
    color: #fff;
}

.chara {
    background-color: #5ba4d7;
    transition: background-color 0.5s ease-in-out;
}

.chara.bg1 {
    background-color: #86edfc;
}

.chara.bg2 {
    background-color: #fc93ff;
}

.chara.bg3 {
    background-color: #989ffb;
}

.chara.bg4 {
    background-color: #d3dada;
}

.chara.bg5 {
    background-color: #f68ca8;
}

.chara.bg6 {
    background-color: #95f5dc;
}

.chara.bg7 {
    background-color: #f2f4f2;
}

.chara.bg8 {
    background-color: #faf6a6;
}

.chara.bg9 {
    background-color: #faba80;
}

.chara.bg10 {
    background-color: #ce8998;
}

.chara.bg11 {
    background-color: #93cc96;
}
</style>