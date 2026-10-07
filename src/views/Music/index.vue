<template>
  <div class="music-container _fullscreen">
    <div class="mask _fullscreen"></div>

    <div class="bg-layer _fullscreen">
      <div class="orb-field">
        <span class="orb orb-1"></span>
        <span class="orb orb-2"></span>
        <span class="orb orb-3"></span>
      </div>
      <div class="vignette"></div>
    </div>

    <canvas ref="trailRef" class="trail-canvas _fullscreen"></canvas>

    <div class="album-container">
      <div class="song-info-wrap">
        <Transition :name="music.slideName.value" mode="out-in">
          <div class="song-info" :key="music.currentSong.value?.id ?? 'idle'" v-if="music.currentSong.value">
            <div class="title">{{ music.currentSong.value.title || "当前未在播放" }}</div>
            <div class="artist">
              <span>{{ music.currentSong.value.artist || "未知歌手" }}</span>
              <template v-if="music.currentSong.value.album"> · {{ music.currentSong.value.album }}</template>
            </div>
          </div>
        </Transition>
      </div>
      <div class="album">
        <canvas class="canvas-container" width="700" height="700"></canvas>
        <svg class="svg-container" viewBox="0 0 120 160" width="700" height="700" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <clipPath id="cover">
              <circle cx="60" cy="80" r="35"></circle>
            </clipPath>
          </defs>
          <g v-if="music.mode == 'svg'">
            <rect v-for="i in 200" :key="'rect-' + i" :id="'rect-' + i" class="rect"></rect>
          </g>
          <g class="svg-img" :class="{ 'playing': music.playing.value }">
            <circle cx="60" cy="80" r="45" fill="#000" stroke="#666" stroke-width=".1"></circle>
            <image @contextmenu="music.swap" @click="music.toggle" :href="music.coverUrl.value" x="20" y="40" width="80"
              height="80" clip-path="url(#cover)">
            </image>
          </g>
        </svg>
      </div>
    </div>


    <div class="lrc-container">
      <div class="panel-tabs">
        <button type="button" :class="{ active: music.panel.value === 'lyrics' }"
          @click="music.panel.value = 'lyrics'">歌词</button>
        <button type="button" :class="{ active: music.panel.value === 'comment' }"
          @click="music.panel.value = 'comment'">评论</button>
      </div>

      <div class="lrc-tab" :class="{ faded: music.panel.value !== 'lyrics' }">
        <div v-if="!music.lrcs.value.length" class="lrc active">
          <span>{{ music.currentSong.value ? '暂无歌词' : '请从下方选单中选择歌曲' }}</span>
        </div>
        <div v-else class="lrc" v-for="(l, i) in music.lrcs.value" :key="'lrc-' + i"
          :class="[(i == music.currentIdx.value) ? 'active' : 'inactive']"
          :style="{ '--r': `${music.currentIdx.value - i}` }">
          <span>{{ l.content || "..." }}</span>
        </div>
      </div>

      <div class="comment-panel" :class="{ faded: music.panel.value !== 'comment' }">
        <div class="comment-inner" v-if="music.currentSong.value">
          <div class="comment-head">
            <span class="comment-label">评论</span>
            <h3>{{ music.currentSong.value.title || '未知歌曲' }}</h3>
            <p class="comment-sub">{{ music.currentSong.value.artist || '未知歌手' }}</p>
          </div>
          <p class="comment-text">{{ music.currentSong.value.comment || '这首歌暂无评论信息' }}</p>
          <dl class="meta-grid">
            <div v-if="music.currentSong.value.album"><dt>专辑</dt><dd>{{ music.currentSong.value.album }}</dd></div>
            <div v-if="music.currentSong.value.year"><dt>年份</dt><dd>{{ music.currentSong.value.year }}</dd></div>
            <div v-if="music.currentSong.value.track"><dt>曲目号</dt><dd>{{ music.currentSong.value.track }}</dd></div>
            <div v-if="music.currentSong.value.genre"><dt>流派</dt><dd>{{ music.currentSong.value.genre }}</dd></div>
            <div v-if="music.currentSong.value.composer"><dt>作曲家</dt><dd>{{ music.currentSong.value.composer }}</dd></div>
            <div v-if="music.currentSong.value.bpm"><dt>BPM</dt><dd>{{ music.currentSong.value.bpm }}</dd></div>
            <div v-if="music.currentSong.value.mood"><dt>Mood</dt><dd>{{ music.currentSong.value.mood }}</dd></div>
            <div v-if="music.currentSong.value.featuring"><dt>Featuring</dt><dd>{{ music.currentSong.value.featuring }}</dd></div>
            <div v-if="music.currentSong.value.copyright"><dt>版权</dt><dd>{{ music.currentSong.value.copyright }}</dd></div>
          </dl>
        </div>
        <div class="comment-empty" v-else>请从下方选单中选择歌曲</div>
      </div>
    </div>
    <MusicMenu></MusicMenu>
  </div>
</template>
<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import gsap from 'gsap'
import MusicMenu from './menu.vue'
import { player, resolveUrl } from './player'

defineOptions({
  name: "MusicPage"
})

const fallbackCover = resolveUrl('/api/covers/jpg/cover.jpg')
const trailRef = ref<HTMLCanvasElement | null>(null)

interface Point { x: number; y: number }

const music = {
  mode: 'canvas' as 'canvas' | 'svg',
  rects: null as null | NodeListOf<HTMLElement>,
  canvas: null as null | HTMLCanvasElement,
  svgImg: null as null | HTMLElement,
  isSwapping: false,
  animationID: 0,
  // State shared with the playback engine (see ./player.ts).
  playing: player.playing,
  lrcs: player.lyrics,
  currentIdx: player.currentLrcIdx,
  current: player.current,
  duration: player.duration,
  currentSong: player.currentSong,
  direction: player.direction,
  // 歌词 / 评论 面板切换
  panel: ref<'lyrics' | 'comment'>('lyrics'),
  slideName: computed(() => (player.direction.value >= 0 ? 'slide-left' : 'slide-right')),
  coverUrl: computed(() => resolveUrl(player.currentSong.value?.cover_url) || resolveUrl(player.songs.value[0]?.cover_url) || fallbackCover),
  // 视觉特效
  trailCtx: null as null | CanvasRenderingContext2D,
  trailDpr: 1,
  trailPos: null as null | Point,
  trailLast: null as null | Point,
  parallax: null as null | { x: (v: number) => void; y: (v: number) => void },
  orbTo: null as null | ((v: number) => void),
  expandEl: null as null | HTMLElement,
  reduceMotion: false,
  toggle: () => {
    void player.toggle()
  },
  swap(e: Event) {
    e.stopPropagation()
    e.preventDefault()
    gsap.to(music.svgImg, {
      y: music.isSwapping ? 0 : -20,
      ease: 'power3.out',
      duration: .2
    })
    music.isSwapping = !music.isSwapping
  },
  init() {
    music.svgImg = document.querySelector('.svg-img')
    music.rects = document.querySelectorAll('.rect')
    music.canvas = document.querySelector('.canvas-container')
    music.rects.forEach((rect, i) => {
      rect.style.setProperty("--id", i.toString())
    })
    if (music.mode == 'canvas')
      music.initCanvas()
    music.initEffects()
  },
  initCanvas() {
    if (!music.canvas) return
    const ctx = music.canvas.getContext("2d")
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    music.canvas.style.width = music.canvas.width + 'px'
    music.canvas.style.height = music.canvas.height + 'px'
    music.canvas.width = music.canvas.width * dpr
    music.canvas.height = music.canvas.height * dpr
    ctx.fillStyle = 'rgb(255,255,255)'
    ctx.translate(music.canvas.width / 2, music.canvas.height / 2)
    const ratio = music.canvas.width / parseInt(music.canvas.style.width)
    const rectWidth = 5 * ratio
    const rectHeight = 25 * ratio
    const x = -rectWidth / 2
    const y = -0.6 * music.canvas.height / 2 - rectHeight / 2
    ctx.shadowColor = "#fff"
    ctx.lineWidth = 3
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
    ctx.shadowBlur = 10
    for (let i = 0; i < 200; ++i) {
      ctx.rotate(2 * Math.PI / 200)
      ctx.fillRect(x, y, rectWidth, rectHeight)
    }
  },
  // ---- 视觉效果：鼠标拖尾 / 视差 ----
  initEffects() {
    music.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (music.reduceMotion) return

    const bg = document.querySelector('.bg-layer') as HTMLElement | null
    // Note: only transform elements that are not the containing block of the
    // absolutely positioned visualiser canvas, otherwise it would jump.
    const cover = document.querySelector('.svg-container') as HTMLElement | null
    if (bg && cover) {
      const bgX = gsap.quickTo(bg, 'x', { duration: 1.1, ease: 'power3.out' })
      const bgY = gsap.quickTo(bg, 'y', { duration: 1.1, ease: 'power3.out' })
      const coverX = gsap.quickTo(cover, 'x', { duration: .8, ease: 'power3.out' })
      const coverY = gsap.quickTo(cover, 'y', { duration: .8, ease: 'power3.out' })
      music.parallax = {
        x: (v: number) => { bgX(-v * 18); coverX(-v * 12) },
        y: (v: number) => { bgY(-v * 12); coverY(-v * 8) },
      }
    }

    music.resizeTrail()
    window.addEventListener('resize', music.resizeTrail)
    window.addEventListener('mousemove', music.onPointerMove, { passive: true })
    window.addEventListener('mouseout', music.onPointerLeave)

    // 选单横向滚动时，背景光斑做视差
    music.expandEl = document.querySelector('.card-container') as HTMLElement | null
    const orbField = document.querySelector('.orb-field') as HTMLElement | null
    if (music.expandEl && orbField) {
      music.orbTo = gsap.quickTo(orbField, 'x', { duration: .6, ease: 'power2.out' })
      music.expandEl.addEventListener('scroll', music.onExpandScroll, { passive: true })
    }
  },
  cleanupEffects() {
    window.removeEventListener('resize', music.resizeTrail)
    window.removeEventListener('mousemove', music.onPointerMove)
    window.removeEventListener('mouseout', music.onPointerLeave)
    music.expandEl?.removeEventListener('scroll', music.onExpandScroll)
  },
  resizeTrail() {
    const canvas = trailRef.value
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    music.trailDpr = dpr
    canvas.width = Math.floor(window.innerWidth * dpr)
    canvas.height = Math.floor(window.innerHeight * dpr)
    canvas.style.width = window.innerWidth + 'px'
    canvas.style.height = window.innerHeight + 'px'
    music.trailCtx = canvas.getContext('2d')
  },
  onPointerMove(e: MouseEvent) {
    const nx = (e.clientX / window.innerWidth) * 2 - 1
    const ny = (e.clientY / window.innerHeight) * 2 - 1
    music.parallax?.x(nx)
    music.parallax?.y(ny)
    music.trailPos = { x: e.clientX * music.trailDpr, y: e.clientY * music.trailDpr }
  },
  onPointerLeave() {
    music.trailLast = null
    music.trailPos = null
  },
  onExpandScroll() {
    const el = music.expandEl
    if (!el || !music.orbTo) return
    const max = Math.max(el.scrollWidth - el.clientWidth, 1)
    music.orbTo(-(el.scrollLeft / max) * 140)
  },
  drawTrail() {
    const ctx = music.trailCtx
    const canvas = trailRef.value
    if (!ctx || !canvas) return
    ctx.globalCompositeOperation = 'destination-out'
    ctx.fillStyle = 'rgba(0, 0, 0, 0.16)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    if (music.trailLast && music.trailPos) {
      const { x: x0, y: y0 } = music.trailLast
      const { x: x1, y: y1 } = music.trailPos
      if (Math.hypot(x1 - x0, y1 - y0) > 0.6) {
        const dpr = music.trailDpr
        const grad = ctx.createLinearGradient(x0, y0, x1, y1)
        grad.addColorStop(0, 'rgba(113, 220, 247, 0)')
        grad.addColorStop(1, 'rgba(160, 240, 255, 0.9)')
        ctx.globalCompositeOperation = 'lighter'
        ctx.strokeStyle = grad
        ctx.lineWidth = 3.5 * dpr
        ctx.lineCap = 'round'
        ctx.shadowColor = 'rgba(113, 220, 247, 0.9)'
        ctx.shadowBlur = 14 * dpr
        ctx.beginPath()
        ctx.moveTo(x0, y0)
        ctx.lineTo(x1, y1)
        ctx.stroke()
        ctx.shadowBlur = 0
      }
    }
    music.trailLast = music.trailPos ? { ...music.trailPos } : null
  },
  animate() {
    const canvas = music.canvas
    if (music.mode == 'canvas' && canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        const data = player.getFrequencyData()
        const ratio = canvas.width / parseInt(canvas.style.width)
        const rectWidth = 5 * ratio
        const rectHeight = 25 * ratio
        const x = -rectWidth / 2
        const y = -0.6 * canvas.height / 2 - rectHeight / 2
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = 'rgb(255,255,255)'
        ctx.shadowColor = "#fff"
        ctx.lineWidth = 3
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
        ctx.shadowBlur = 10
        ctx.translate(canvas.width / 2, canvas.height / 2)
        for (let i = 0; i < 200; ++i) {
          ctx.rotate(2 * Math.PI / 200)
          const height = Math.max((data ? data[i] : 0) / 255 * 3, 1)
          ctx.fillRect(x, y - rectHeight * height + rectHeight, rectWidth, rectHeight * height)
        }
      }
    }
    else if (music.mode == 'svg') {
      const data = player.getFrequencyData()
      music.rects?.forEach((rect, idx) => {
        const value = data ? data[idx] * 0.1 : 5
        rect.style.setProperty('height', value + 'px')
        rect.style.setProperty('y', 35 - value + 'px')
      })
    }
    if (!music.reduceMotion) music.drawTrail()
    music.animationID = requestAnimationFrame(() => music.animate())
  }
}

watch(() => player.currentLrcIdx.value, (idx) => {
  const elements = document.querySelectorAll('.lrc')
  const first = document.querySelector('.lrc') as HTMLElement | null
  if (!elements.length || !first) return
  gsap.to(elements, {
    y: idx * (-1 * (first.offsetHeight || 1)),
    rotate: (index: number) => index - idx + 'deg',
    ease: 'power3.out',
  })
})

onMounted(() => {
  music.init()
  void player.loadList()
  music.animate()
})

onUnmounted(() => {
  cancelAnimationFrame(music.animationID)
  music.cleanupEffects()
  player.dispose()
})
</script>
<style lang="scss" scoped>
.music-container {
  background: radial-gradient(circle at 30% 50%, rgb(45, 44, 44), black);
  --view: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  .mask {
    pointer-events: none;
    user-select: none;
    z-index: 1;
  }

  // ---- 背景光斑 ----
  .bg-layer {
    pointer-events: none;
    z-index: 0;
    overflow: hidden;

    .orb-field {
      position: absolute;
      inset: 0;
    }

    .orb {
      position: absolute;
      display: block;
      border-radius: 50%;
      filter: blur(70px);
      opacity: .45;
      mix-blend-mode: screen;
      will-change: transform;
    }

    .orb-1 {
      width: 42vw;
      height: 42vw;
      left: -8vw;
      top: -6vw;
      background: radial-gradient(circle, #1f8fae, transparent 68%);
      animation: drift-a 22s ease-in-out infinite alternate;
    }

    .orb-2 {
      width: 38vw;
      height: 38vw;
      right: -6vw;
      top: 12vh;
      background: radial-gradient(circle, #5a3f9e, transparent 68%);
      animation: drift-b 27s ease-in-out infinite alternate;
    }

    .orb-3 {
      width: 34vw;
      height: 34vw;
      left: 26vw;
      bottom: -14vw;
      background: radial-gradient(circle, #2a7f6a, transparent 68%);
      animation: drift-c 31s ease-in-out infinite alternate;
    }

    .vignette {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 50% 45%, transparent 30%, rgba(0, 0, 0, .55) 100%);
    }
  }

  .trail-canvas {
    pointer-events: none;
    z-index: 2;
  }

  @keyframes drift-a {
    0% { transform: translate3d(0, 0, 0) scale(1); }
    100% { transform: translate3d(6vw, 8vh, 0) scale(1.15); }
  }

  @keyframes drift-b {
    0% { transform: translate3d(0, 0, 0) scale(1.1); }
    100% { transform: translate3d(-8vw, -6vh, 0) scale(.92); }
  }

  @keyframes drift-c {
    0% { transform: translate3d(0, 0, 0) scale(.95); }
    100% { transform: translate3d(-5vw, -9vh, 0) scale(1.2); }
  }

  .canvas-container {
    mix-blend-mode: screen;
    position: absolute;
    pointer-events: none;
  }

  .album-container {
    width: 700px;
    height: 700px;
    display: flex;
    flex-direction: column;
    z-index: 10;
  }

  .song-info-wrap {
    position: relative;
    height: 96px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .song-info {
    position: absolute;
    left: 0;
    right: 0;
    text-align: center;
    z-index: 30;
    pointer-events: none;
    color: #fff;

    .title {
      font-size: 3rem;
      letter-spacing: .2rem;
      text-shadow: 0 0 10px rgba($color: #fff, $alpha: .5);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .artist {
      margin-top: 6px;
      font-size: 2rem;
      color: #bbb;
      letter-spacing: .1rem;
      text-wrap: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }

  // 上一首 / 下一首：标题左右滑动，艺术家淡入淡出
  .slide-left-enter-from .title,
  .slide-right-leave-to .title {
    transform: translateX(72%);
  }

  .slide-left-leave-to .title,
  .slide-right-enter-from .title {
    transform: translateX(-72%);
  }

  .slide-left-enter-from .artist,
  .slide-left-leave-to .artist,
  .slide-right-enter-from .artist,
  .slide-right-leave-to .artist {
    opacity: 0;
  }

  .slide-left-enter-active,
  .slide-left-leave-active,
  .slide-right-enter-active,
  .slide-right-leave-active {
    .title {
      transition: transform .5s cubic-bezier(.22, .61, .36, 1);
    }

    .artist {
      transition: opacity .4s ease;
    }
  }

  .svg-container {
    margin-right: -10vw;

    .svg-img {
      z-index: 20;
      cursor: pointer;
      transform-origin: 50% 50%;
      transform: rotate(0);
      transition: transform linear .1s;

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
    transition: height .2s ease, y .2s ease;
    filter: drop-shadow(0 0 2px #fff);
  }

  .lrc-container {
    position: relative;
    width: 50vw;
    z-index: 10;
  }

  .panel-tabs {
    position: absolute;
    top: -8vh;
    right: 2vw;
    display: flex;
    gap: 6px;
    z-index: 40;

    button {
      cursor: pointer;
      padding: 4px 16px;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, .22);
      background: rgba(255, 255, 255, .06);
      color: #bbb;
      font-size: 1.4rem;
      letter-spacing: .2rem;
      backdrop-filter: blur(6px);
      transition: color .25s, border-color .25s, background-color .25s;

      &:hover {
        color: #fff;
        border-color: rgba(113, 220, 247, .6);
      }

      &.active {
        color: #04222b;
        background: #71dcf7;
        border-color: #71dcf7;
      }
    }
  }

  .lrc-tab {
    width: 100vw;
    position: absolute;
    transform: perspective(1500px) rotateY(-10deg) translateX(-20vw);
    display: flex;
    flex-direction: column;
    overflow: visible;
    align-self: flex-start;
    align-items: center;
    height: 120vh;
    transition: opacity .4s ease, visibility .4s;

    &.faded {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }
  }

  .comment-panel {
    position: absolute;
    top: 0;
    width: 100vw;
    transform: perspective(1500px) rotateY(-10deg) translateX(-20vw);
    display: flex;
    justify-content: center;
    z-index: 20;
    transition: opacity .4s ease, visibility .4s;

    &.faded {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;

      .comment-inner {
        transform: translateY(18px);
      }
    }

    .comment-inner {
      width: min(620px, 62vw);
      max-height: 74vh;
      overflow-y: auto;
      padding: 1.5rem 2rem;
      border-radius: 18px;
      background: rgba(255, 255, 255, .05);
      border: 1px solid rgba(255, 255, 255, .1);
      backdrop-filter: blur(10px);
      color: #e8e8e8;
      transform: translateY(0);
      transition: transform .45s cubic-bezier(.22, .61, .36, 1);
    }

    .comment-head {
      .comment-label {
        display: inline-block;
        font-size: 1.3rem;
        letter-spacing: .3rem;
        color: #71dcf7;
        padding: 2px 10px;
        border: 1px solid rgba(113, 220, 247, .5);
        border-radius: 999px;
      }

      h3 {
        margin-top: 12px;
        font-size: 2.6rem;
        letter-spacing: .1rem;
        color: #fff;
      }

      .comment-sub {
        margin-top: 4px;
        font-size: 1.6rem;
        color: #9a9a9a;
      }
    }

    .comment-text {
      margin-top: 18px;
      font-size: 1.7rem;
      line-height: 1.8;
      color: #ddd;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .meta-grid {
      margin-top: 22px;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px 22px;

      > div {
        display: flex;
        gap: 10px;
        align-items: baseline;
        border-bottom: 1px dashed rgba(255, 255, 255, .1);
        padding-bottom: 6px;
      }

      dt {
        flex-shrink: 0;
        font-size: 1.4rem;
        color: #71dcf7;
        letter-spacing: .08rem;
      }

      dd {
        font-size: 1.5rem;
        color: #ccc;
        word-break: break-word;
      }
    }

    .comment-empty {
      margin-top: 30vh;
      color: #999;
      font-size: 2rem;
      letter-spacing: .2rem;
    }
  }

  .lrc {
    transform: rotate(calc(var(--r) * -1deg));

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

  // ---- 移动端适配 ----
  @media (max-width: 1024px) {
    flex-direction: column;
    justify-content: flex-start;
    padding-top: 6vh;

    .bg-layer .orb {
      filter: blur(50px);
    }

    .album-container {
      width: 100%;
      height: auto;
      flex-shrink: 0;
    }

    .song-info-wrap {
      height: 66px;
    }

    .song-info {
      .title {
        font-size: 24px;
        letter-spacing: 1px;
      }

      .artist {
        font-size: 14px;
      }
    }

    .album {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
    }

    .svg-container {
      margin-right: 0;
      width: min(76vw, 360px);
      height: min(76vw, 360px);
    }

    .canvas-container {
      transform: scale(.54);
    }

    .lrc-container {
      width: 100vw;
      flex: 1 1 auto;
      min-height: 0;
      margin-top: 6px;
    }

    .panel-tabs {
      top: -2px;
      right: 5vw;

      button {
        padding: 4px 14px;
        font-size: 13px;
        letter-spacing: 1px;
      }
    }

    .lrc-tab {
      transform: none;
      width: 100vw;
      height: 40vh;
      top: 40px;
      overflow: hidden;
      padding-top: 12vh;
    }

    .comment-panel {
      transform: none;
      top: 40px;
      height: 40vh;
      align-items: flex-start;
      overflow: hidden;

      .comment-inner {
        width: 90vw;
        max-height: 40vh;
        padding: 14px 16px;
      }

      .comment-head {
        .comment-label {
          font-size: 12px;
          letter-spacing: 2px;
        }

        h3 {
          font-size: 20px;
        }

        .comment-sub {
          font-size: 13px;
        }
      }

      .comment-text {
        margin-top: 12px;
        font-size: 15px;
      }

      .meta-grid {
        grid-template-columns: 1fr;

        dt {
          font-size: 12px;
        }

        dd {
          font-size: 13px;
        }
      }

      .comment-empty {
        margin-top: 18vh;
        font-size: 16px;
      }
    }

    .lrc {
      font-size: 21px;
      padding: 8px 0;

      span {
        letter-spacing: 3px;
      }

      &:hover span {
        font-size: 24px;
      }
    }
  }
}
</style>