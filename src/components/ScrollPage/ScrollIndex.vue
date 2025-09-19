<template>
    <div class="page_container" v-show="scroll.if_visible.value">
        <pre class="asciibox"></pre>
        <div class="first_screen _screen">
            <div class="title-container">
                <div class="split svg-container">
                    memento mori
                </div>
            </div>
        </div>
        <div class="second_screen _screen">
            <div class="row">
                <div class="text-container">
                    <div>
                        <h1 class="split">
                            Introduction
                        </h1>
                        <p>
                            <span>港区の人工島ポートアイランドにある月光館学園高等部に編入した主人公の少年は、怪物の襲撃をきっかけに「ペルソナ」という心の力に目覚める。</span>

                        </p>
                        <p>
                            <span>彼は特別課外活動部（S.E.E.S.）に加入し、仲間と共に「影時間」に現れる謎の怪物「シャドウ」を討伐するため戦い続ける。</span>
                        </p>
                        <p>
                            <span>果たして彼を待ち受ける運命とは…</span>
                        </p>
                    </div>

                </div>
                <div class="img-container">
                </div>

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
            <div class="row">

                <div class="img-container">
                </div>
                <div class="text-container">
                    <div>
                        <h1 class="split">
                            Features
                        </h1>
                        <p>
                            <span>操作性の向上、インターフェースを含むゲーム全体が</span>
                        </p>
                        <p>
                            <span>よりユーザーフレンドリーになるなど、細部にわたり調整。より遊びやすく。</span>
                        </p>
                        <p>
                            <span>最新機種でより鮮明に、”あの感動”が蘇る！</span>
                        </p>
                    </div>

                </div>
            </div>
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
import { da } from 'element-plus/es/locales.mjs';
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
    animate_status: 0,
    splitText() {
        const doms = document.querySelectorAll(".split")
        doms.forEach(d => {
            const text = (d as HTMLElement).innerText;
            (d as HTMLElement).innerText = ""
            for (let i = 0; i < text.length; ++i) {
                const newh1 = document.createElement("span")
                newh1.innerText = text[i]
                d?.appendChild(newh1)
            }
        })
    },
    showImgText() {
        const container = document.querySelector('.page_container') as HTMLElement
        const screen1 = document.querySelector('.first_screen') as HTMLElement
        const screen2 = document.querySelector('.second_screen') as HTMLElement
        const screen3 = document.querySelector('.third_screen') as HTMLElement

        const img1 = screen2.querySelector('.img-container') as HTMLElement
        const img2 = screen3.querySelector('.img-container') as HTMLElement

        const scrollTop = container.scrollTop;
        const imgdata1 = {
            height: img1.offsetHeight,
            top: img1.offsetTop,
            target: img1,
        }
        const imgdata2 = {
            height: img2.offsetHeight,
            top: img2.offsetTop,
            target: img2
        }

        // console.log(scrollTop,screen1.offsetHeight,imgdata.top)

        if (scrollTop + screen1.offsetHeight > imgdata1.top + imgdata1.height / 2) {
            // console.log(imgdata.target)
            // imgdata.target.style.setProperty('--height', `${100 - scrollTop * 100 / 500}%`)
            if (!imgdata1.target.classList.contains('show')) {
                imgdata1.target.classList.add("show")
                gsap.timeline().fromTo(screen2.querySelectorAll('h1 span'), {
                    top: '5rem',
                    opacity: 0
                }, {
                    top: 0,
                    opacity: 1,
                    duration: 1.5,
                    stagger: .03,
                    ease: "power1.out"
                }).fromTo(screen2.querySelectorAll('p span'), {
                    top: '5rem',
                    opacity: 0,
                }, {
                    top: 0,
                    opacity: 1,
                    duration: 1,
                    stagger: .25,
                    ease: "power1.out"
                }, "<+0.5")
            }

        }

        if (scrollTop + screen1.offsetHeight > imgdata2.top + imgdata2.height / 2) {
            if (!imgdata2.target.classList.contains('show')) {
                imgdata2.target.classList.add('show')
                // console.log(screen3.querySelectorAll('h1 span'))
                gsap.timeline().fromTo(screen3.querySelectorAll('h1 span'), {
                    top: '100%',
                    opacity: 0
                }, {
                    top: 0,
                    opacity: 1,
                    duration: 1.5,
                    stagger: .03,
                    ease: "power1.out"
                }).fromTo(screen3.querySelectorAll('p span'), {
                    opacity: 0.8,
                    top: '5rem'
                }, {
                    top: 0,
                    opacity: 1,
                    duration: 1,
                    stagger: .25,
                    ease: "power1.out"
                }, "<+0.5")
            }
        }
    },
    init() {
        if (document.querySelector(".page_container")) {
            document.querySelector(".page_container")?.addEventListener("scroll", () => {
                this.showImgText()
            })
        }
        this.splitText()
        // this.animate("/img/p3r_4.gif")
        this.solveGif('/img/p3r_4.gif', 1)
        this.solveGif('/img/p3r_9.gif', 0)

    },
    solveGif(url: string, id: number) {
        const worker = new Worker()
        fetch(url)
            .then(resp => resp.arrayBuffer())
            .then(buff => worker.postMessage({
                buff: buff,
                workId: id
            }))
        appStore.add_global_progress({
            current: 0,
            total: 0,
            label: '加载资源: ',
            complete: false
        })
        worker.onmessage = (e) => {
            const data = e.data
            if (e.data.type == 'progress') {
                appStore.progress[data.workId] = {
                    current: data.current,
                    total: data.total,
                    label: '加载资源: ',
                    complete: false
                }
                appStore.update_global_progress()
                // update progress
            } else if (data.type == 'complete') {
                // work complete
                this.texts[data.workId] = data.result
                appStore.progress[data.workId] = {
                    current: 0,
                    total: 0,
                    label: 'Completed!',
                    complete: true
                }
                worker.terminate()
            }else if(data.type == 'info') {
                appStore.total_steps += data.total
            }
        }
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
        }).to(document.querySelector('.row_unit'), {
            filter: 'hue-rotate(360deg)'
        }, "<")
        //screen1
        // document.addEventListener('scroll',this.showImgText)

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

.second_screen,
.third_screen {
    display: flex;
    align-items: center;
    height: calc(100vh - 30rem);

    .row {
        display: flex;
        width: 100%;
        height: 100%;

        .text-container {
            box-sizing: border-box;
            margin: 10rem 0;
            padding: 5rem;
            width: 30%;

            // flex -grow: 0;
            flex: 1 1 0;

            * {
                font-size: 2rem;
                color: #fff;
            }

            h1 {
                padding-left: 20%;

                * {
                    font-size: 5rem;
                }
            }

            p {
                margin-top: 2rem;
                position: relative;
                overflow: hidden;
                padding: 2rem;
                padding-left: 20%;
            }

            h1 span,
            p span {
                position: relative;
                opacity: 0;
                text-shadow: 0 0 2rem #71dcf7,
                    0 0 1rem #fff,
                    0 0 5rem rgb(72, 72, 251);
            }


        }

        .img-container {
            background-image: url("https://p3re.jp/resources/img/top/ss_introduction_ccbbd0e83f473acf4647f51baab6867f.png");
            background-repeat: no-repeat;
            background-size: cover;
            background-position: center;
            width: 70%;
            flex: 1 1 0;
            box-sizing: border-box;
            // flex-grow: 1;
            background-color: #fff;
            margin: 10rem 0rem;
            position: relative;
            opacity: 0;

            &::before {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: #fff;
            }

            &.show {
                opacity: 1;
                transition: opacity 0.5s ease-in-out;

                &::before {
                    height: 0;
                    transition: height 1s 0.5s ease-in-out;
                }

            }

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

.third_screen .img-container {
    background-image: url('https://p3re.jp/resources/img/top/ss_features_57a9f52b44e40f3709e529468cefbeb5.png') !important;
}

.row_scroll {
    height: calc(8 * 100dvh);
    position: relative;
    overflow: clip;
    // background-color: red;

    .row_unit {
        background-color: #71dcf7;
        opacity: .2;
        position: sticky;
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
    position: fixed;
    z-index: -10;
    mask-image: linear-gradient(rgba(0, 0, 0, 1), 99%, transparent);
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

.second_screen,
.third_screen {
    h1 {
        overflow: hidden;

        span {
            position: relative;
            opacity: 0;
        }
    }
}
</style>