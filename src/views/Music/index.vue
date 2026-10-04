<template>
  <div class="music-container _fullscreen">
    <div class="mask _fullscreen"></div>
    <div class="album-container">
      <canvas class="canvas-container" width="700" height="700"></canvas>
      <svg class="svg-container" viewBox="0 0 120 160" width="700" height="700" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="cover">
            <circle cx="60" cy="80" r="35"></circle>
          </clipPath>
        </defs>
        <g v-if="music.mode == 'svg'">
          <rect id="rect-1" class="rect"></rect>
          <rect id="rect-2" class="rect"></rect>
          <rect id="rect-3" class="rect"></rect>
          <rect id="rect-4" class="rect"></rect>
          <rect id="rect-5" class="rect"></rect>
          <rect id="rect-6" class="rect"></rect>
          <rect id="rect-7" class="rect"></rect>
          <rect id="rect-8" class="rect"></rect>
          <rect id="rect-9" class="rect"></rect>
          <rect id="rect-10" class="rect"></rect>
          <rect id="rect-11" class="rect"></rect>
          <rect id="rect-12" class="rect"></rect>
          <rect id="rect-13" class="rect"></rect>
          <rect id="rect-14" class="rect"></rect>
          <rect id="rect-15" class="rect"></rect>
          <rect id="rect-16" class="rect"></rect>
          <rect id="rect-17" class="rect"></rect>
          <rect id="rect-18" class="rect"></rect>
          <rect id="rect-19" class="rect"></rect>
          <rect id="rect-20" class="rect"></rect>
          <rect id="rect-21" class="rect"></rect>
          <rect id="rect-22" class="rect"></rect>
          <rect id="rect-23" class="rect"></rect>
          <rect id="rect-24" class="rect"></rect>
          <rect id="rect-25" class="rect"></rect>
          <rect id="rect-26" class="rect"></rect>
          <rect id="rect-27" class="rect"></rect>
          <rect id="rect-28" class="rect"></rect>
          <rect id="rect-29" class="rect"></rect>
          <rect id="rect-30" class="rect"></rect>
          <rect id="rect-31" class="rect"></rect>
          <rect id="rect-32" class="rect"></rect>
          <rect id="rect-33" class="rect"></rect>
          <rect id="rect-34" class="rect"></rect>
          <rect id="rect-35" class="rect"></rect>
          <rect id="rect-36" class="rect"></rect>
          <rect id="rect-37" class="rect"></rect>
          <rect id="rect-38" class="rect"></rect>
          <rect id="rect-39" class="rect"></rect>
          <rect id="rect-40" class="rect"></rect>
          <rect id="rect-41" class="rect"></rect>
          <rect id="rect-42" class="rect"></rect>
          <rect id="rect-43" class="rect"></rect>
          <rect id="rect-44" class="rect"></rect>
          <rect id="rect-45" class="rect"></rect>
          <rect id="rect-46" class="rect"></rect>
          <rect id="rect-47" class="rect"></rect>
          <rect id="rect-48" class="rect"></rect>
          <rect id="rect-49" class="rect"></rect>
          <rect id="rect-50" class="rect"></rect>
          <rect id="rect-51" class="rect"></rect>
          <rect id="rect-52" class="rect"></rect>
          <rect id="rect-53" class="rect"></rect>
          <rect id="rect-54" class="rect"></rect>
          <rect id="rect-55" class="rect"></rect>
          <rect id="rect-56" class="rect"></rect>
          <rect id="rect-57" class="rect"></rect>
          <rect id="rect-58" class="rect"></rect>
          <rect id="rect-59" class="rect"></rect>
          <rect id="rect-60" class="rect"></rect>
          <rect id="rect-61" class="rect"></rect>
          <rect id="rect-62" class="rect"></rect>
          <rect id="rect-63" class="rect"></rect>
          <rect id="rect-64" class="rect"></rect>
          <rect id="rect-65" class="rect"></rect>
          <rect id="rect-66" class="rect"></rect>
          <rect id="rect-67" class="rect"></rect>
          <rect id="rect-68" class="rect"></rect>
          <rect id="rect-69" class="rect"></rect>
          <rect id="rect-70" class="rect"></rect>
          <rect id="rect-71" class="rect"></rect>
          <rect id="rect-72" class="rect"></rect>
          <rect id="rect-73" class="rect"></rect>
          <rect id="rect-74" class="rect"></rect>
          <rect id="rect-75" class="rect"></rect>
          <rect id="rect-76" class="rect"></rect>
          <rect id="rect-77" class="rect"></rect>
          <rect id="rect-78" class="rect"></rect>
          <rect id="rect-79" class="rect"></rect>
          <rect id="rect-80" class="rect"></rect>
          <rect id="rect-81" class="rect"></rect>
          <rect id="rect-82" class="rect"></rect>
          <rect id="rect-83" class="rect"></rect>
          <rect id="rect-84" class="rect"></rect>
          <rect id="rect-85" class="rect"></rect>
          <rect id="rect-86" class="rect"></rect>
          <rect id="rect-87" class="rect"></rect>
          <rect id="rect-88" class="rect"></rect>
          <rect id="rect-89" class="rect"></rect>
          <rect id="rect-90" class="rect"></rect>
          <rect id="rect-91" class="rect"></rect>
          <rect id="rect-92" class="rect"></rect>
          <rect id="rect-93" class="rect"></rect>
          <rect id="rect-94" class="rect"></rect>
          <rect id="rect-95" class="rect"></rect>
          <rect id="rect-96" class="rect"></rect>
          <rect id="rect-97" class="rect"></rect>
          <rect id="rect-98" class="rect"></rect>
          <rect id="rect-99" class="rect"></rect>
          <rect id="rect-100" class="rect"></rect>
          <rect id="rect-101" class="rect"></rect>
          <rect id="rect-102" class="rect"></rect>
          <rect id="rect-103" class="rect"></rect>
          <rect id="rect-104" class="rect"></rect>
          <rect id="rect-105" class="rect"></rect>
          <rect id="rect-106" class="rect"></rect>
          <rect id="rect-107" class="rect"></rect>
          <rect id="rect-108" class="rect"></rect>
          <rect id="rect-109" class="rect"></rect>
          <rect id="rect-110" class="rect"></rect>
          <rect id="rect-111" class="rect"></rect>
          <rect id="rect-112" class="rect"></rect>
          <rect id="rect-113" class="rect"></rect>
          <rect id="rect-114" class="rect"></rect>
          <rect id="rect-115" class="rect"></rect>
          <rect id="rect-116" class="rect"></rect>
          <rect id="rect-117" class="rect"></rect>
          <rect id="rect-118" class="rect"></rect>
          <rect id="rect-119" class="rect"></rect>
          <rect id="rect-120" class="rect"></rect>
          <rect id="rect-121" class="rect"></rect>
          <rect id="rect-122" class="rect"></rect>
          <rect id="rect-123" class="rect"></rect>
          <rect id="rect-124" class="rect"></rect>
          <rect id="rect-125" class="rect"></rect>
          <rect id="rect-126" class="rect"></rect>
          <rect id="rect-127" class="rect"></rect>
          <rect id="rect-128" class="rect"></rect>
          <rect id="rect-129" class="rect"></rect>
          <rect id="rect-130" class="rect"></rect>
          <rect id="rect-131" class="rect"></rect>
          <rect id="rect-132" class="rect"></rect>
          <rect id="rect-133" class="rect"></rect>
          <rect id="rect-134" class="rect"></rect>
          <rect id="rect-135" class="rect"></rect>
          <rect id="rect-136" class="rect"></rect>
          <rect id="rect-137" class="rect"></rect>
          <rect id="rect-138" class="rect"></rect>
          <rect id="rect-139" class="rect"></rect>
          <rect id="rect-140" class="rect"></rect>
          <rect id="rect-141" class="rect"></rect>
          <rect id="rect-142" class="rect"></rect>
          <rect id="rect-143" class="rect"></rect>
          <rect id="rect-144" class="rect"></rect>
          <rect id="rect-145" class="rect"></rect>
          <rect id="rect-146" class="rect"></rect>
          <rect id="rect-147" class="rect"></rect>
          <rect id="rect-148" class="rect"></rect>
          <rect id="rect-149" class="rect"></rect>
          <rect id="rect-150" class="rect"></rect>
          <rect id="rect-151" class="rect"></rect>
          <rect id="rect-152" class="rect"></rect>
          <rect id="rect-153" class="rect"></rect>
          <rect id="rect-154" class="rect"></rect>
          <rect id="rect-155" class="rect"></rect>
          <rect id="rect-156" class="rect"></rect>
          <rect id="rect-157" class="rect"></rect>
          <rect id="rect-158" class="rect"></rect>
          <rect id="rect-159" class="rect"></rect>
          <rect id="rect-160" class="rect"></rect>
          <rect id="rect-161" class="rect"></rect>
          <rect id="rect-162" class="rect"></rect>
          <rect id="rect-163" class="rect"></rect>
          <rect id="rect-164" class="rect"></rect>
          <rect id="rect-165" class="rect"></rect>
          <rect id="rect-166" class="rect"></rect>
          <rect id="rect-167" class="rect"></rect>
          <rect id="rect-168" class="rect"></rect>
          <rect id="rect-169" class="rect"></rect>
          <rect id="rect-170" class="rect"></rect>
          <rect id="rect-171" class="rect"></rect>
          <rect id="rect-172" class="rect"></rect>
          <rect id="rect-173" class="rect"></rect>
          <rect id="rect-174" class="rect"></rect>
          <rect id="rect-175" class="rect"></rect>
          <rect id="rect-176" class="rect"></rect>
          <rect id="rect-177" class="rect"></rect>
          <rect id="rect-178" class="rect"></rect>
          <rect id="rect-179" class="rect"></rect>
          <rect id="rect-180" class="rect"></rect>
          <rect id="rect-181" class="rect"></rect>
          <rect id="rect-182" class="rect"></rect>
          <rect id="rect-183" class="rect"></rect>
          <rect id="rect-184" class="rect"></rect>
          <rect id="rect-185" class="rect"></rect>
          <rect id="rect-186" class="rect"></rect>
          <rect id="rect-187" class="rect"></rect>
          <rect id="rect-188" class="rect"></rect>
          <rect id="rect-189" class="rect"></rect>
          <rect id="rect-190" class="rect"></rect>
          <rect id="rect-191" class="rect"></rect>
          <rect id="rect-192" class="rect"></rect>
          <rect id="rect-193" class="rect"></rect>
          <rect id="rect-194" class="rect"></rect>
          <rect id="rect-195" class="rect"></rect>
          <rect id="rect-196" class="rect"></rect>
          <rect id="rect-197" class="rect"></rect>
          <rect id="rect-198" class="rect"></rect>
          <rect id="rect-199" class="rect"></rect>
          <rect id="rect-200" class="rect"></rect>
        </g>
        <g class="svg-img" :class="{ 'playing': music.playing.value && !music.pause.value }">
          <circle cx="60" cy="80" r="45" fill="#000" stroke="#666" stroke-width=".1"></circle>
          <image @contextmenu="music.swap" @click="music.start" href="http://localhost:8889/api/covers/jpg/cover.jpg"
            x="20" y="40" width="80" height="80" clip-path="url(#cover)">
          </image>
        </g>
      </svg>
    </div>
    <div class="lrc-container">
      <div class="lrc-tab">
        <div class="lrc" :class="[(i == music.currentIdx.value) ? 'active' : 'inactive']"
          v-for="(l, i) in music.lrcs.value" :key="'lrc-' + i" :style="{ '--r': `${music.currentIdx.value - i}` }">
          <span>{{ l.content || "..." }}</span>
        </div>
      </div>

    </div>
    <MusicMenu></MusicMenu>
  </div>
</template>
<script lang="ts" setup>
import { MusicAPI } from '@/api/music';
import { onMounted, onUnmounted, provide, ref } from 'vue';
import type { Ref } from 'vue';
import gsap from 'gsap';
import MusicMenu from './menu.vue';

defineOptions({
  name: "MusicPage"
})

interface LRC {
  time: string,
  content: string,
  minute: number,
  second: number,
  millis: number
}
const music = {
  rects: null as null | NodeListOf<HTMLElement>,
  music_data: [] as number[][],
  lrcContainer: null as null | HTMLElement,
  animationID: 0,
  min: 1,
  max: 0,
  audioContext: null as null | AudioContext,
  sourceNode: null as null | AudioBufferSourceNode,
  analyser: null as null | AnalyserNode,
  playing: ref(false),
  pause: ref(false),
  lrcs: ref([]) as Ref<LRC[]>,
  current: ref(0),
  currentIdx: ref(0),
  duration: ref(0),
  loading: ref(true),
  isSwapping: false,
  svgImg: null as null | HTMLElement,
  svgContainer: null as null | HTMLElement,
  lrcElements: null as null | NodeListOf<HTMLElement>,
  canvas: null as null | HTMLCanvasElement,
  mode: 'canvas',
  init() {
    this.svgImg = document.querySelector('.svg-img');
    this.lrcElements = document.querySelectorAll(".lrc");
    this.rects = document.querySelectorAll(".rect")
    this.canvas = document.querySelector(".canvas-container")
    this.svgContainer = document.querySelector('.svg-container')
    this.rects.forEach((rect, i) => {
      rect.style.setProperty("--id", i.toString())
    })
    this.lrcContainer = document.querySelector(".lrc-container")
    this.getData()
    if (this.mode == 'canvas')
      this.initCanvas()
    console.log(this.svgContainer?.offsetWidth, this.svgContainer?.offsetHeight)
    // this.setBgColor('http://localhost:8889/api/covers/jpg/cover.jpg')
  },
  initCanvas() {
    if (this.canvas) {
      const ctx = this.canvas.getContext("2d")
      if (ctx) {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.style.width = this.canvas.width + 'px';
        this.canvas.style.height = this.canvas.height + 'px';
        this.canvas.width = this.canvas.width * dpr;
        this.canvas.height = this.canvas.height * dpr;
        ctx.fillStyle = 'rgb(255,255,255)'
        console.log(this.canvas.width)
        ctx.translate(this.canvas.width / 2, this.canvas.height / 2)
        // ctx.fillRect(-3.5, -227.5, 7, 35)
        const ratio = this.canvas.width / parseInt(this.canvas.style.width)
        const rectWidth = 5 * ratio
        const rectHeight = 25 * ratio
        const x = -rectWidth / 2
        const y = -0.6 * this.canvas.height / 2 - rectHeight / 2
        ctx.shadowColor = "#fff";
        ctx.lineWidth = 3;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 10;
        for (let i = 0; i < 200; ++i) {
          ctx.rotate(2 * Math.PI / 200)
          ctx.fillRect(x, y, rectWidth, rectHeight)
        }
      }
    }

  },
  swap(e: Event) {
    e.stopPropagation()
    e.preventDefault()
    if (this.isSwapping) {
      gsap.to(this.svgImg, {
        y: 0,
        ease: 'power3.out',
        duration: .2
      })
      this.isSwapping = false
    }
    else {
      gsap.to(this.svgImg, {
        y: -20,
        ease: 'power3.out',
        duration: .2
      })
      this.isSwapping = true
    }

  },
  async getData() {
    this.getLrc()
    const resp = await MusicAPI.getMusic("http://localhost:8889/api/uploads/audio/test.mp3")
    this.max = 0
    this.min = 1
    if (resp.data instanceof ArrayBuffer) {
      this.audioContext = new AudioContext()
      const sourceNode = this.audioContext.createBufferSource()
      const analyser = this.audioContext.createAnalyser()
      analyser.fftSize = 4096
      const audio = await this.audioContext.decodeAudioData(resp.data as ArrayBuffer)
      this.duration.value = audio.duration
      const rate = audio.sampleRate
      const duration = audio.duration
      const data = audio.getChannelData(0)
      const time = 0.1
      const seg = time * rate
      for (let i = 0; i < data.length; i += seg) {
        const rectA = []
        for (let j = i; j < i + seg && j < data.length; j += seg / 200) {
          let sum = 0;
          for (let k = j; k < j + seg / 200 && k < data.length; ++k) {
            sum += data[k]
          }
          sum /= (seg / 200)
          this.max = Math.max(this.max, sum)
          this.min = Math.min(this.min, sum)
          rectA.push(sum)
        }
        this.music_data.push(rectA)
      }

      sourceNode.buffer = audio;
      const gain = this.audioContext.createGain()
      gain.gain.value = 0.1
      sourceNode.connect(gain)
      gain.connect(analyser)
      analyser.connect(this.audioContext.destination)
      this.sourceNode = sourceNode
      this.analyser = analyser
      this.loading.value = false
      gsap.to(document.querySelectorAll(".rect"), {
        clipPath: 'none',
        stagger: {
          from: 'random',
          amount: 0.4
        },
      })
    }

  },
  async getLrc() {
    const resp = await MusicAPI.getLrc("http://localhost:8889/api/uploads/audio/test.lrc")
    const data_str = resp.data
    const re = /(?<time>\[(?<minute>\d*):(?<second>\d*).(?<millis>\d*)\])(?<content>[^[\n]*)/g
    // const  matches = data_str.match(re);
    let matches
    while ((matches = re.exec(data_str)) !== null) {
      // console.log(matches);
      this.lrcs.value.push({
        content: matches?.groups?.content || "",
        time: matches?.groups?.time || "",
        minute: Number(matches?.groups?.minute) || 0,
        second: Number(matches?.groups?.second) || 0,
        millis: Number(matches?.groups?.millis) || 0
      })
    }
  },
  start() {
    if (this.loading.value) return
        console.log('start!!')
    if (this.playing.value) {
      if (this.pause.value) {
        this.pause.value = false
        this.audioContext?.resume()
        return
      }
      this.pause.value = true
      this.audioContext?.suspend()
      return
    }
    this.playing.value = true
    if (this.sourceNode)
      this.sourceNode.start(0);
    let lastTime = 0
    const update = (time: number) => {
      if (!lastTime) lastTime = time
      const delta = time - lastTime
      if (delta > 17 && this.audioContext?.state == 'running') {
        if (this.current.value > this.duration.value) {
          this.audioContext.close()
          return
        }
        if (this.analyser?.frequencyBinCount) {
          const data = new Uint8Array(this.analyser?.frequencyBinCount);
          this.analyser?.getByteFrequencyData(data)
          this.current.value = this.audioContext?.currentTime || 0
          this.updateLRC()

          // canvas test'
          if (this.mode == 'canvas') {
            if (this.canvas) {

              const ratio = this.canvas.width / parseInt(this.canvas.style.width)
              const rectWidth = 5 * ratio
              const rectHeight = 25 * ratio
              const x = -rectWidth / 2
              const y = -0.6 * this.canvas.height / 2 - rectHeight / 2
              const ctx = this.canvas.getContext("2d")
              if (ctx) {
                ctx.setTransform(1, 0, 0, 1, 0, 0)
                ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)


                // ctx.fillStyle = 'rgba(0, 0, 0)'
                // ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

                ctx.shadowColor = "#fff";
                ctx.lineWidth = 3;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.shadowBlur = 10;
                ctx.fillStyle = 'rgb(255,255,255)'
                const centerX = this.canvas.width / 2
                const centerY = this.canvas.height / 2
                ctx.translate(centerX, centerY)

                for (let i = 0; i < 200; ++i) {
                  ctx.rotate(2 * Math.PI / 200)
                  const height = data[i] / 255 * 5
                  // ctx.strokeRect(x, y - rectHeight * height, rectWidth, rectHeight * height);
                  ctx.fillRect(x, y - rectHeight * height + rectHeight, rectWidth, rectHeight * height)
                }
                // ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
                //  ctx.setTransform(1, 0, 0, 1, 0, 0)
                // ctx.fillStyle = 'rgb(255,255,255)'
                // ctx.translate(525, 525)
                // // ctx.fillRect(-3.5, -227.5, 7, 35)
                // for (let i = 0; i < 200; ++i) {
                //   ctx.rotate(2 * Math.PI / 200)
                //   ctx.fillRect(-3.5, -350, 7, data[i] * 0.7)
                // }
              }
            }
          }
          else {
            // console.log(data)
            this.rects?.forEach((rect, idx) => {
              rect.style.setProperty('height', data[idx] * 0.1 + 'px')
              rect.style.setProperty('y', 35 - data[idx] * 0.1 + 'px')
            })
          }
          lastTime = time
          if (!this.svgImg?.classList.contains("playing")) {
            this.svgImg?.classList.add('playing')
          }
        }
      }
      this.animationID = requestAnimationFrame(update)
    }
    this.animationID = requestAnimationFrame(update)
  }, updateLRC() {
    let idx = 0
    this.lrcs.value.forEach((l, i) => {
      const time = l.minute * 60 + l.second + l.millis * 0.01
      if (time < this.current.value) {
        idx = i
        return
      }
    });
    if (idx != this.currentIdx.value) {
      this.currentIdx.value = idx
      // console.log(idx)
      gsap.timeline()
        // .to(document.querySelectorAll(".lrc"), {
        //   fontSize: (index) => {
        //     return index == music.currentIdx.value ? '4rem' : '3rem'
        //   },
        //   ease: 'none',
        //   duration: .2
        // })
        .to(document.querySelectorAll(".lrc"), {
          y: idx * (-1 * (document.querySelector(".lrc") as HTMLElement).offsetHeight || 1),
          rotate: (index) => index - music.currentIdx.value + 'deg',
          ease: 'power3.out',
        }, "<")
    }

  }
}


provide('playing', music.playing)
provide('start', music.start.bind(music))
provide('pause', music.pause)
provide('current', music.current)
provide('duration', music.duration)

onMounted(() => {
  music.init()
})

onUnmounted(() => {
  music.audioContext?.close()
})
</script>
<style lang="scss" scoped>
.music-container {
  background: radial-gradient(circle at 30% 50%, rgb(45, 44, 44), black);
  ;
  --view: 60;
  // background-color: red;
  display: flex;
  align-items: center;
  justify-content: center;

  .canvas-container {
    mix-blend-mode: screen;
    position: absolute;
    pointer-events: none;
  }

  .mask {
    pointer-events: none;
    user-select: none;
  }

  .album-container {
    width: 700px;
    height: 700px;
  }

  .svg-container {
    margin-right: -10vw;

    .svg-img {
      z-index: 20;
      cursor: pointer;
      transform-origin: 50% 50%;
      transform: rotate(0);
      transition: transform linear .1s;

      &:hover {
        // transform: scale(.98);
        // transition: none;
      }

      @keyframes rolling {
        0% {
          transform: rotate(0);
        }

        100% {
          transform: rotate(360deg);
        }
      }

      animation: rolling infinite 15s linear;
      animation-play-state: paused;

      &.playing {
        animation-play-state: running;
      }

      transition: transform .5s ease-out;
    }

    z-index: 10;
  }

  .rect {
    position: relative;
    box-shadow: 0 0;
    x: var(--view);
    y: 30;
    width: 1px;
    height: 5px;
    clip-path: rect(0 1px 0 0);
    fill: #fff;
    transform: rotate(calc(var(--id) / 200 * 360deg));
    transform-origin: center center;
    // animation: roll 1s infinite calc(var(--id) * 0.02s);
    transition: height .2s ease, y .2s ease;
    filter: drop-shadow(0 0 2px #fff);
  }

  .lrc-container {
    position: relative;
    width: 50vw;

    .lrc-tab {
      width: 100vw;
      position: absolute;
      transform: perspective(1500px) rotateY(-10deg) translateX(-20vw);
      display: flex;
      flex-direction: column;
      // margin-left: 10vw;
      overflow: visible;
      align-self: flex-start;
      align-items: center;
      // padding-top: calc(50vh - 5rem);
      height: 120vh;
      transition: ease all 1s;
    }


    .lrc {
      transform: rotate(calc(var(--r) * -1deg));
      // pointer-events: none;

      &.inactive {
        * {
          color: #ccc;
        }
      }

      &.active {
        * {
          color: #fff;
        }
      }

      color: #fff;
      font-size: 3rem;
      font-family: Noto Sans JP;


      text-align: center;
      padding: 2rem 0;

      // transform: translate3d(0,0,10rem);

      span {
        display: block;
        user-select: none;
        text-shadow:
          0 0 20px #ccc,
          2px 2px 7px #fff,
          1px 1px 5px #111;
        color: inherit;
        font-size: inherit;
        font-family: inherit;
        text-wrap: nowrap;
        letter-spacing: .5rem;
        transition: all cubic-bezier(0.52, 0.52, 0.17, 1.26) .2s;

        &::after {
          content: "";
          position: absolute;
          height: 10px;
          width: 120%;
          background-color: transparent;
          top: 50%;
          left: 50%;
          background-color: #999;
          box-shadow:
            0px 0px 5px #71dcf7,
            0px 0px 10px #fff;
          opacity: .8;
          border-radius: 5px;
          z-index: -1;
          transform: scaleX(.6) translate(-50%, -50%);
          transition:
            opacity .2s linear,
            transform .2s ease-out;
          opacity: 0;
          transform-origin: 0 0;
        }
      }

      &:hover {
        span {
          text-shadow:
            1px 1px 5px #111,
            2px 2px 7px #fff,
            0 0 20px #ccc;
          // color: ;
          font-size: 4rem;

          &::after {
            display: block;
            transform: scaleX(1) translate(-50%, -50%);
            opacity: 1;
            transition:
              opacity .2s .1s linear,
              transform .2s ease-out;
            transform-origin: 0 0;
          }
        }

      }
    }
  }
}
</style>
