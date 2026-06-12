<template>
  <div class="page_container" v-show="scroll.if_visible.value">
    <pre class="asciibox"></pre>
  </div>
</template>
<script lang="ts" setup>
import { useAppStore } from '@/pinia'
import { onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Worker from './gif-worker?worker'
import { da } from 'element-plus/es/locales.mjs'
gsap.registerPlugin(ScrollTrigger)

const color = ref(['#fff', '#bcd', '#cde', '#def', '#fed', '#edc', '#dcb', '#cba'])
const appStore = useAppStore()
const scroll = {
  pause: false,
  if_visible: ref(false),
  animator: null as null | gsap.core.Timeline,
  width: 0,
  height: 0,
  scale: 2,
  texts: [[], []] as string[][],
  current_idx: 0,
  animationId: null as null | number,
  animate_status: 0,
  asciibox: null as null | HTMLElement,
  splitText() {
    const doms = document.querySelectorAll('.split')
    doms.forEach((d) => {
      const text = (d as HTMLElement).innerText
        ; (d as HTMLElement).innerText = ''
      for (let i = 0; i < text.length; ++i) {
        const newh1 = document.createElement('span')
        newh1.innerText = text[i]
        d?.appendChild(newh1)
      }
    })
  },
  async init() {
    window.addEventListener("resize", () => {
      scroll.resize()
    })
    this.asciibox = document.querySelector(".asciibox")
    this.splitText()

    const gifTasks = [
      { url: '/img/p3r_4.gif', id: 1, type: 'gif' },
      { url: '/img/p3r_9.gif', id: 0, type: 'gif' },
    ]

    const fetchTasks = [
      {
        url: '/fonts/SweiB2SerifCJKsc-Regular.woff2',
        type: 'font',
        format: 'woff2',
        family: 'Swei',
      },
      { url: '/fonts/NotoSansJP-Regular.otf', type: 'font', format: 'otf', family: 'Noto Sans JP' },
      { url: '/fonts/Syncopate-Bold.ttf', type: 'font', format: 'ttf', family: 'Syncopate' },
      {
        url: '/fonts/Urbanist-VariableFont_wght.ttf',
        type: 'font',
        format: 'ttf',
        family: 'Urbanist',
      },
      { url: '/img/music1.jpg', type: 'img', fomat: 'jpg' },
      { url: '/img/music2.jpg', type: 'img', fomat: 'jpg' },
      { url: '/img/music3.jpg', type: 'img', fomat: 'jpg' },
      { url: '/img/music4.jpg', type: 'img', fomat: 'jpg' },
      { url: '/img/music5.jpg', type: 'img', fomat: 'jpg' },
      { url: '/img/music6.jpg', type: 'img', fomat: 'jpg' },
    ]

    const tasks = [...gifTasks, ...fetchTasks]
    const frameCounts = await Promise.all(
      tasks.map((task) => {
        if (task.type == 'gif') return this.getTotalSteps(task.url)
        else return this.getFetchSteps(task.url)
      }),
    )

    let res = 0

    for (const count of frameCounts) {
      res += count
    }

    appStore.total_steps = res

    // this.animate("/img/p3r_4.gif")
    for (let i = 0; i < gifTasks.length; ++i) {
      this.solveGif(gifTasks[i].url, gifTasks[i].id)
    }
    for (let i = 0; i < fetchTasks.length; ++i) {
      if (fetchTasks[i].type == 'font') {
        this.preloadFont(
          fetchTasks[i].family || 'f',
          fetchTasks[i].url,
          fetchTasks[i].fomat || 'woff2',
        )
      } else {
        this.preloadImage(fetchTasks[i].url).then(() => {
          appStore.completed_steps += 10
        })
      }
    }
  },
  preloadImage(url: string) {
    const promise = new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(url)
      img.onerror = reject
      img.src = url
    })
    return promise
  },
  async preloadFont(family: string, url: string, format: string) {
    const font = new FontFace(family, `url(${url}) format('${format}')`)
    try {
      await font.load()
      document.fonts.add(font)
      appStore.completed_steps += 10
      return
    } catch (e) {
      throw new Error(`字体预加载失败: ${url}`)
    }
  },
  solveGif(url: string, id: number) {
    const worker = new Worker()
    fetch(url)
      .then((resp) => resp.arrayBuffer())
      .then((buff) =>
        worker.postMessage({
          buff: buff,
          workId: id,
        }),
      )

    appStore.add_global_progress({
      current: 0,
      total: 0,
      label: '加载资源: ',
      complete: false,
    })
    worker.onmessage = (e) => {
      const data = e.data
      if (e.data.type == 'progress') {
        appStore.progress[data.workId] = {
          current: data.current,
          total: data.total,
          label: '加载资源: ',
          complete: false,
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
          complete: true,
        }
        worker.terminate()
      } else if (data.type == 'info') {
        appStore.total_steps += data.total
      }
    }
  },
  async getFetchSteps(url: string) {
    return 10
  },
  async getTotalSteps(url: string) {
    const resp = await fetch(url)
    const buffer = await resp.arrayBuffer()
    const data = new Uint8Array(buffer)
    let pos = 0

    // GIF 签名 "GIF87a" 或 "GIF89a"
    if (data[pos] !== 0x47 || data[pos + 1] !== 0x49 || data[pos + 2] !== 0x46) {
      throw new Error('Invalid GIF')
    }
    pos += 6

    // --- 逻辑屏幕描述符 + 全局颜色表 ---
    const packedScreen = data[pos + 4] // packed 字段（偏移4）
    const hasGlobalColorTable = (packedScreen & 0x80) !== 0
    let globalColorTableSize = 0
    if (hasGlobalColorTable) {
      const colorTableBits = packedScreen & 0x07 // 低3位表示 2^(n+1) 个颜色
      const colorCount = 2 << colorTableBits // 颜色数量 = 2^(n+1)
      globalColorTableSize = 3 * colorCount // 每个颜色3字节
    }
    pos += 7 // 跳过屏幕描述符
    pos += globalColorTableSize // 跳过全局颜色表（若有）

    let frameCount = 0
    while (pos < data.length) {
      const blockType = data[pos]
      if (blockType === 0x2c) {
        // 图像描述符
        frameCount++
        pos += 1 // 跳过 0x2c

        // --- 解析图像描述符 + 局部颜色表 ---
        const packedImage = data[pos + 8] // packed 字段（9字节中的第9个，偏移8）
        const hasLocalColorTable = (packedImage & 0x80) !== 0
        let localColorTableSize = 0
        if (hasLocalColorTable) {
          const colorTableBits = packedImage & 0x07
          const colorCount = 2 << colorTableBits
          localColorTableSize = 3 * colorCount
        }
        pos += 9 // 跳过图像描述符的9字节
        pos += localColorTableSize // 跳过局部颜色表（若有）

        // --- LZW 最小码字大小 ---
        const lzwCodeSize = data[pos]
        pos += 1

        // --- 跳过图像数据块（子块结构）---
        while (pos < data.length) {
          const blockSize = data[pos]
          if (blockSize === 0) break
          pos += blockSize + 1
        }
        pos += 1 // 跳过子块结束符 0x00
      } else if (blockType === 0x21) {
        // 扩展块
        pos += 1 // 跳过 0x21
        const label = data[pos]
        pos += 1 // 跳过 label
        // 跳过扩展块的子块数据
        while (pos < data.length) {
          const blockSize = data[pos]
          if (blockSize === 0) break
          pos += blockSize + 1
        }
        pos += 1 // 跳过子块结束符 0x00
      } else if (blockType === 0x3b) {
        // 文件结束符
        break
      } else {
        // 非法块，提前终止
        break
      }
    }
    return frameCount
  },
  pauseAscii() {
    this.pause = true
  },
  resumeAscii() {
    this.pause = false
  },
  startUpdating() {
    // if(this.animationId)clearInterval(this.animationId)
    // this.animationId = setInterval(() => {
    //   if (!this.if_visible.value || this.pause) {
    //     return
    //   }
    //   if (this.asciibox)
    //     this.asciibox.innerText = this.texts[this.animate_status][this.current_idx]
    //   this.current_idx = (this.current_idx + 1) % this.texts[this.animate_status].length
    //   if (this.current_idx == 0 && this.animate_status == 0) {
    //     this.animate_status++
    //   }
    // }, 100);
    let lastTime = 0
    const update = (time: number) => {
      if (this.pause) {
        this.animationId = requestAnimationFrame(update)
        return
      }
      if (!this.if_visible.value && this.animationId) {
        cancelAnimationFrame(this.animationId)
        this.animationId = null
        return
      }
      if (!lastTime) lastTime = time
      const delta = time - lastTime
      if (delta > 100) {
        if (this.asciibox)
          this.asciibox.innerText = this.texts[this.animate_status][this.current_idx]
        lastTime = time
        this.current_idx = (this.current_idx + 1) % this.texts[this.animate_status].length
        if (this.current_idx == 0 && this.animate_status == 0) {
          this.animate_status++
        }
      }
      this.animationId = requestAnimationFrame(update)
    }
    this.animationId = requestAnimationFrame(update)
  },
  show() {
    if (this.animator?.isActive()) return
    this.resize()
    this.if_visible.value = true
    this.startUpdating()

    this.animator = gsap
      .timeline()
      .to(document.querySelectorAll('.page_container'), {
        // opacity: 1,
        delay: 1,
        // clipPath: 'circle(100%)',
        duration: 1,
        ease: 'power3.in',
      })
      .to(
        document.querySelector('pre'),
        {
          opacity: 1,
          duration: 0.5,
          ease: 'power1.in',
        },
        '<',
      )
  },
  hide(immediate: () => void, next: () => void) {
    if (this.animator?.isActive()) return
    if (immediate) immediate()
    this.animator = gsap.timeline().to(document.querySelector('.page_container'), {
      opacity: 0,
      // clipPath: 'circle(0%)',
      duration: 0.5,
      ease: 'power3.out',
      onComplete: () => {
        this.if_visible.value = false
        if (next) next()
        if (this.animationId) cancelAnimationFrame(this.animationId)
        this.animate_status = 0
        this.current_idx = 0
      },
    })
  },
  resize() {

    const width = window.innerWidth
    const height = window.innerHeight
    if (width * 169 > 300 * height) {
      scroll.asciibox?.style.setProperty("--scale", (width / 300).toString())
      // const ascii_height = width * 2.25 * scroll.texts.length / 300
      // console.log(scroll.texts[0][0].indexOf("<br>") * ascii_height, height)
      // scroll.asciibox?.style.setProperty("transform", `translateY(${-(ascii_height - height)}px)`)
    }
    else if (width * 169 < 300 * height) {
      scroll.asciibox?.style.setProperty("--scale", (height / 169).toString())
    }
    else {
      scroll.asciibox?.style.setProperty("--scale", (height / 300).toString())
    }
  }
}
appStore.show_scroll_page = scroll.show.bind(scroll)
appStore.hide_scroll_page = scroll.hide.bind(scroll)
appStore.ascii_pause = scroll.pauseAscii.bind(scroll)
appStore.ascii_resume = scroll.resumeAscii.bind(scroll)

onMounted(async () => {
  await scroll.init()
})

onUnmounted(() => {
  window.removeEventListener("resize", scroll.resize)
})
</script>
<style lang="scss" scoped>
._screen {
  width: 100vw;
  height: 100dvh;
}

.page_container {
  background-color: red;
  overflow: scroll;
  background-color: rgba($color: #000, $alpha: 1);
  opacity: 1;
  // clip-path: circle(0);
}

.asciibox {
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: -10;
  mask-image: linear-gradient(rgba(0, 0, 0, 1), 99%, transparent);
  opacity: 0;
  --scale: 1;
  color: #71dcf7;
  font-family: monospace;
  line-height: calc(var(--scale) * 2.25px);
  letter-spacing: calc(var(--scale) * 1.5px);
  font-size: calc(var(--scale) * 1.5px);
  user-select: none;

  * {
    font-weight: bolder;
    text-align: center;
  }
}

@media screen and (max-aspect-ratio: 0.8/1) {
  .asciibox {
    --scale: 1;
    transform: translateX(-10%);
  }

  .second_screen,
  .third_screen {
    .row {
      flex-direction: column;

      .text-container,
      .img-container {
        width: 100%;

        h1,
        p {
          padding-left: 0;
        }
      }

      .text-container {
        p span {
          font-size: 5rem;
        }
      }
    }
  }
}
</style>
<style lang="scss">
.svg-container {
  span {
    color: #fff;
    font-size: 10rem;
    font-weight: bold;
    text-shadow:
      0 0 2rem #71dcf7,
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

@media screen and (max-aspect-ratio: 0.8/1) {

  .second_screen,
  .third_screen {
    .row h1.split span {
      font-size: 8rem !important;
    }
  }
}
</style>
