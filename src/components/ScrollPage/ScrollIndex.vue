<template>
    <div class="page_container" v-show="scroll.if_visible.value">
        <div class="first_screen _screen">
            <pre class="asciibox"></pre>
            <div class="title-container">
                <div class="svg-container">
                    <h1>Svg PlaceHolder</h1>
                </div>
            </div>
        </div>
        <div class="second_screen _screen _null">
            <div class="row">
                <div class="bowl rgb" style="--color:#71dcf7;">
                    <div class="liquid"></div>
                </div>
                <div class="bowl" style="--color:#ffa832;">
                    <div class="liquid"></div>
                </div>
                <div class="bowl rgb" style="--color:#71dcf7;">
                    <div class="liquid"></div>
                </div>
                <div class="bowl" style="--color:#71dcf7;">
                    <div class="liquid"></div>
                </div>
                <div class="bowl rgb" style="--color:#71dcf7;">
                    <div class="liquid"></div>
                </div>
                <div class="bowl" style="--color:#71dcf7;">
                    <div class="liquid"></div>
                </div>
            </div>

        </div>
        <div class="third_screen _screen">

        </div>
        <div class="row_scroll">
            <div class="row_unit">
                <div v-for="i in 8" class="unit" :style="`--color: ${color[i - 1]};`">
                    <span>{{ i }}</span>
                </div>
            </div>

        </div>
        <div class="end_screen _screen"></div>
    </div>
</template>
<script lang="ts" setup>
import { useAppStore } from '@/pinia';
import { onMounted, ref } from 'vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Worker from './gif-worker?worker'
gsap.registerPlugin(ScrollTrigger)

const color = ref(['#fff', '#bcd', '#cde', '#def', '#fed', '#edc', '#dcb', '#cba'])
const appStore = useAppStore()
const scroll = {
    if_visible: ref(false),
    animator: null as null | gsap.core.Timeline,
    width: 0,
    height: 0,
    scale: 2,
    texts: [[], []] as string[][],
    current_idx: 0,
    animationId: null as null | number,
    worker: null as null | Worker,
    animate_statuts: 0,
    init() {
        this.worker = new Worker()

        this.animate("/img/p3r_8.gif")
        // this.animate("/img/p3r_4.gif")

        this.worker.onmessage = (e) => {
            this.texts[this.animate_statuts] = e.data
            this.startUpdating();
        }
    },
    animate(url: string) {
        fetch(url)
            .then(resp => resp.arrayBuffer())
            .then(buff => {
                if (this.worker)
                    this.worker.postMessage(buff)
            })
    },
    startUpdating() {
        let lastTime = 0;
        const update = (time: number) => {
            if (!this.if_visible.value && this.animationId) {
                cancelAnimationFrame(this.animationId)
                this.animationId = null
                return;
            }
            if (!lastTime) lastTime = time;
            const delta = time - lastTime;
            if (delta > 100) {
                this.current_idx = (this.current_idx + 1) % this.texts[this.animate_statuts].length;
                const asciibox = document.querySelector(".asciibox")
                if (asciibox)
                    (asciibox as HTMLElement).innerText = this.texts[this.animate_statuts][this.current_idx]
                lastTime = time
                console.log(this.current_idx)
            }
            this.animationId = requestAnimationFrame(update)
        }
        this.animationId = requestAnimationFrame(update)
    },
    show() {
        this.if_visible.value = true
        this.startUpdating()
        this.animator = gsap.timeline().to(document.querySelector('.page_container'), {
            opacity: 1,
            clipPath: 'circle(100%)',
            duration: .5,
            ease: 'power3.in'
        }).to(document.querySelector('.title-container'), {
            opacity: 1,
            duration: .3,
            ease: 'power3.out'
        }, "<+0.2").to(document.querySelector('pre'), {
            opacity: 1,
            duration: .5,
            ease: 'power1.in'
        }, "<")
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
            onComplete: () => {
                (document.querySelector('.row-unit') as HTMLElement).style.setProperty('position', 'absolute')
            }
        }).to(document.querySelector('.page_container'), {
            filter: 'hue-rotate(360deg)'
        }, "<")

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

onMounted(() => {
    scroll.init()
})

</script>
<style lang="scss" scoped>
._screen {
    width: 100vw;
    height: 100dvh;
}

.page_container {
    overflow: scroll;
    background-color: rgba($color: #000, $alpha: 1);
    opacity: 0;
    clip-path: circle(0);
}

.first_screen {
    height: calc(100dvh - 25rem);
    position: relative;
    display: flex;

    .title-container {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        opacity: 0;

        .svg-container {
            h1 {
                color: #fff;
                font-size: 10rem;
                text-shadow: 0 0 2rem #71dcf7,
                    0 0 1rem #fff,
                    0 0 5rem rgb(72, 72, 251);
            }
        }
    }
}

.second_screen,
.third_screen {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}

.rgb {
    animation: rgb infinite 3s ease-in-out;
}

@keyframes rgb {
    0% {
        filter: hue-rotate(0);
    }

    100% {
        filter: hue-rotate(360deg);

    }
}

.second_screen {
    display: flex;
    align-items: center;

    .row {
        display: flex;
    }

    .bowl {
        background-color: rgba($color: #fff, $alpha: .1);
        width: 20rem;
        height: 20rem;
        border-radius: 50%;
        position: relative;

        &::before {
            // content: '';
            width: 10rem;
            height: 5rem;
            border: 1rem solid #444;
            left: 50%;
            top: -1rem;
            transform: translateX(-50%);
            position: absolute;
            border-radius: 50%;
            box-shadow: 0 .5rem #222;
        }

        &::after {
            content: '';
            width: 10rem;
            height: 5rem;
            background-color: rgba($color: #000000, $alpha: .05);
            position: absolute;
            left: 50%;
            top: 40%;
            transform: translate(-50%, -50%);
            border-radius: 50%;
        }

        .liquid {
            position: absolute;
            top: 50%;
            left: 1rem;
            right: 1rem;
            bottom: 1rem;
            border-radius: 0 0 10rem 10rem;
            background-color: var(--color);
            filter: drop-shadow(0 0 2rem var(--color));

            &::before {
                content: '';
                position: absolute;
                width: 100%;
                height: 2rem;
                border-radius: 50%;
                background-color: var(--color);
                filter: saturate(200%) brightness(80%);
                top: -1rem;
            }
        }
    }
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

.asciibox {
    opacity: 0;
    --scale: 0.9;
    color: #71dcf7;
    font-family: monospace;
    line-height: calc(var(--scale) * 1.3rem);
    letter-spacing: calc(var(--scale) * 1.03rem);
    font-size: calc(var(--scale) * 1rem);
    user-select: none;

    * {
        font-weight: bolder;
        text-align: center;
    }
}
</style>