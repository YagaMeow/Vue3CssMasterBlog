<template>
    <div class="page_container" v-show="scroll.if_visible.value">
        <div class="first_screen _screen">
            <div class="title-container">
                <div class="svg-container">
                    <h1>Svg PlaceHolder</h1>
                </div>
            </div>
        </div>
        <div class="second_screen _screen">
            <div class="left_section">
                
            </div>
            <div class="right_section"></div>
        </div>
        <div class="third_screen"></div>
        <div class="row_scroll">
            <div class="row_unit">
                <div v-for="i in 8" class="unit" :style="`--color: ${color[i - 1]};`">
                    <span>{{i}}</span>
                </div>
            </div>

        </div>
    </div>
</template>
<script lang="ts" setup>
import { useAppStore } from '@/pinia';
import { ref } from 'vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger)

const color = ref(['#fff', '#bcd', '#cde', '#def', '#fed', '#edc', '#dcb', '#cba'])
const appStore = useAppStore()
const scroll = {
    if_visible: ref(false),
    animator: null as null | gsap.core.Timeline,
    init() {
    },
    show() {
        this.if_visible.value = true
        this.animator = gsap.timeline({
            scrollTrigger: {
                scroller: document.querySelector('.page_container'),
                trigger: document.querySelector('.row_scroll'),
                start: "top 0%",
                end: "bottom 100%",
                scrub: true
            }
        }).to(document.querySelector('.row_unit'), {
            x: '-700vw',
            ease: 'none',
        }).to(document.querySelector('.page_container'), {
            filter: 'hue-rotate(360deg)'
        },"<")

    },
    hide() {
        this.animator = gsap.timeline().to(null, {
            onComplete: () => {
                this.if_visible.value = false
            }
        })

    },
}
appStore.show_scroll_page = scroll.show.bind(scroll)
appStore.hide_scroll_page = scroll.hide.bind(scroll)


</script>
<style lang="scss" scoped>

._screen {
    width: 100vw;
    height: 100dvh;
}

.page_container {
    overflow: scroll;
    background-color: #71dcf7;
    filter: hue-rotate(0);
}

.first_screen {
    width: 100vw;
    height: 100dvh;
    position: relative;
    display: flex;

    .title-container {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);

        .svg-container {
            h1 {
                font-size: 10rem;
            }
        }
    }
}

.second_screen,
.third_screen {
    display: flex;
    flex-direction: column;
}

.row_scroll {
    height: calc(8 * 100dvh);
    position: relative;

    .row_unit {
        position: sticky;
        top: 100dvh;
        display: flex;
        width: 800vw;
        top: 0;
        left: 0;

        .unit {
            width: 100vw;
            height: 100dvh;
            display: flex;
            align-items: center;
            justify-content: center;
            span {
                font-size: 10rem;
            }
        }
    }
}
</style>