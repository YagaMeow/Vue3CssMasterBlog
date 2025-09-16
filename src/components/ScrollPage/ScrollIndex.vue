<template>
    <div class="page_container" v-show="scroll.if_visible.value">
        <pre class="asciibox"></pre>
        <div class="first_screen _screen">
            <div class="title-container">
                <div class="svg-container">
                    memento mori
                </div>
            </div>
        </div>
        <div class="second_screen _screen">
            <div class="row">
                <div class="text-container">
                    <h1>
                        title
                    </h1>
                    <p>
                        message
                    </p>
                </div>
                <div class="img-container"></div>

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
    <svg width="0" height="0">
        <defs>
            <clipPath id="myClip">
                <polygon points="400,50 400,320, 140,300" />
                <polygon points="450,10 500,200 600,100" />
                <polygon points="150,10 100,200 300,100" />
            </clipPath>

            <clipPath id="clip1" clipPathUnits="objectBoundingBox">
                <rect id="rect1" x="5rem" y="5rem" width="90rem" height="90rem"></rect>
            </clipPath>
            <clipPath id="clip2" clipPathUnits="objectBoundingBox">
                <rect id="rect2" x="90rem" y="10rem" width="60rem" height="60rem"></rect>
            </clipPath>
            <clipPath id="clip3" clipPathUnits="objectBoundingBox">
                <rect id="rect3" x="20rem" y="60rem" width="25rem" height="30rem"></rect>
            </clipPath>
            <clipPath id="clip4" clipPathUnits="objectBoundingBox">
                <rect id="rect4" x="60rem" y="20rem" width="30rem" height="25rem"></rect>
            </clipPath>

            <clipPath id="combinedClip">
                <use xlink:href="#rect1" />
                <use xlink:href="#rect2" />
                <use xlink:href="#rect3" />
                <use xlink:href="#rect4" />
            </clipPath>
        </defs>
    </svg>
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
    texts: [] as string[][],
    current_idx: 0,
    animationId: null as null | number,
    worker: [] as Worker[],
    animate_status: 0,
    splitText() {
        const h1 = document.querySelector(".svg-container")
        const text = (h1 as HTMLElement).innerText;
        (h1 as HTMLElement).innerText = ""
        for (let i = 0; i < text.length; ++i) {
            const newh1 = document.createElement("span")
            newh1.innerText = text[i]
            h1?.appendChild(newh1)
        }
    },
    init() {
        this.splitText()
        const worker1 = new Worker()
        const worker2 = new Worker()
        worker1.onmessage = worker2.onmessage = (e) => {
            this.texts.push(e.data)
            // this.startUpdating();
        }
        this.worker.push(worker1)
        this.worker.push(worker2)


        fetch("/img/p3r_9.gif")
            .then(resp => resp.arrayBuffer())
            .then(buff => worker1.postMessage(buff))

        fetch("/img/p3r_4.gif")
            .then(resp => resp.arrayBuffer())
            .then(buff => worker2.postMessage(buff))
        // this.animate("/img/p3r_4.gif")
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
                const asciibox = document.querySelector(".asciibox")
                if (asciibox)
                    (asciibox as HTMLElement).innerText = this.texts[this.animate_status][this.current_idx]
                lastTime = time
                this.current_idx = (this.current_idx + 1) % this.texts[this.animate_status].length;
                if (this.current_idx == 0 && this.animate_status == 0) {
                    this.animate_status++;
                }
            }
            this.animationId = requestAnimationFrame(update)
        }
        this.animationId = requestAnimationFrame(update)
    },
    show() {
        if (this.animator?.isActive()) return
        this.if_visible.value = true
        this.startUpdating()
        this.animator = gsap.timeline().to(document.querySelectorAll('.page_container'), {
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
        gsap.timeline().fromTo(document.querySelectorAll('.svg-container span'), {
            top: "15rem",
            opacity: 0,
        }, {
            top: 0,
            opacity: 1,
            duration: 2,
            stagger: .03,
            delay: 1.5,
            ease: "power3.out"
        })
        //横向滑动
        const rowScroll = gsap.timeline({
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
        //screen1
        // document.addEventListener('scroll',)

    },
    hide(immediate: () => void, next: () => void) {
        if (this.animator?.isActive()) return
        if (immediate) immediate()
        this.animator = gsap.timeline().to(document.querySelector('.page_container'), {
            opacity: 0,
            clipPath: 'circle(0%)',
            duration: .5,
            ease: 'power3.out',
            onComplete: () => {
                this.if_visible.value = false
                if (next) next()
                if (this.animationId)
                    cancelAnimationFrame(this.animationId)
                this.animate_status = 0
                this.current_idx = 0
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
    position: relative;
    display: flex;
    // clip-path: url(#combinedClip);

    .title-container {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        opacity: 0;

        .svg-container {
            padding: 2rem;
        }
    }
}

.second_screen,
.third_screen {
    display: flex;
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
    height: calc(100vh - 30rem);

    .row {
        display: flex;
        width: 100%;
        height: 100%;
        .text-container{
            flex-grow: 1;
            background-color: red;
        }
        .img-container {
            flex-grow: 1;
            background-color: blue;
            margin: 10rem;
            margin-right: 0;

        }
    }

    .bowl {
        display: none;
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
        background-color: #71dcf7;
        position: sticky;
        top: 100dvh;
        display: flex;
        width: 800vw;
        top: 0;
        left: 0;

        .unit {
            width: 100vw;
            height: 100dvh;
            // display: flex;
            align-items: center;
            justify-content: center;

            span {
                font-size: 10rem;
            }
        }
    }
}

.asciibox {
    position: fixed;
    z-index: -1;
    mask-image: linear-gradient(rgba(0, 0, 0, 1),99%, transparent);
    opacity: 0;
    --scale: 0.5;
    color: #71dcf7;
    font-family: monospace;
    line-height: calc(var(--scale) * 1.3rem);
    letter-spacing: calc(var(--scale) * 1.03rem);
    font-size: calc(var(--scale) * 1rem);
    user-select: none;
    height: 100dvh;

    * {
        font-weight: bolder;
        text-align: center;
    }
}
</style>
<style lang="scss">
.svg-container {
    span {
        color: #fff;
        font-size: 10rem;
        font-weight: bold;
        text-shadow: 0 0 2rem #71dcf7,
            0 0 1rem #fff,
            0 0 5rem rgb(72, 72, 251);
        padding-bottom: 5rem;
        // display: block;
        position: relative;
        // transform: translateY(15rem);
    }
    overflow: hidden;
}
</style>