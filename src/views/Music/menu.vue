<template>
  <div class="menu-min-container hit-area">
    <div class="bar"></div>
    <div class="buttons">
      <div class="list button" @click="menu.handleListButton">
        <svg-icon iconClass="more"></svg-icon>
      </div>
      <div class="prev button" @click="menu.handlePrevButton">
        <svg-icon iconClass="prev"></svg-icon>
      </div>
      <div class="play button" @click="menu.handlePlayButton">
        <svg-icon v-if="!menu.playing.value" iconClass="play"></svg-icon>
        <svg-icon v-else iconClass="pause"></svg-icon>
      </div>
      <div class="next button" @click="menu.handleNextButton">
        <svg-icon iconClass="next"></svg-icon>
      </div>
      <div class="upload button" :class="{ loading: menu.uploading.value }" @click="menu.pickFile">
        <svg-icon iconClass="upload"></svg-icon>
      </div>
      <div class="duration" @mousedown="menu.beginDrag" :style="{ '--p': menu.progress.value }">
        <div class="label"></div>
      </div>
      <div class="time">{{ menu.currentLabel.value }} / {{ menu.durationLabel.value }}</div>
      <input class="file-input" type="file" multiple accept=".ncm,audio/*,.mp3,.flac,.wav,.m4a,.aac,.lrc,.txt" hidden
        @change="menu.handleFile" />
    </div>
  </div>

  <div class="card-container _fullscreen" @contextmenu="menu.closeexpand" v-show="menu.if_expand.value"
    :class="{ 'show': menu.if_expand.value }">
    <div class="empty" v-if="!menu.songs.value.length">还没有歌曲，点击上传按钮添加吧</div>
    <div class="card" v-for="(song, i) in menu.songs.value" :key="song.id"
      :class="{ active: i === menu.currentIndex.value }" @click="menu.handleSelect(i)">
      <img :src="menu.cover(song)" alt="" @error="menu.coverError($event)">
      <div class="actions">
        <div class="action download" @click.stop="menu.handleDownload(song)">
          <svg-icon iconClass="download"></svg-icon>
        </div>
        <div class="action edit" @click.stop="menu.handleEdit(song)">
          <svg-icon iconClass="pen"></svg-icon>
        </div>
        <div class="action remove" @click.stop="menu.handleRemove(song, $event)">
          <svg-icon iconClass="bin"></svg-icon>
        </div>
      </div>
      <div class="overlay">
        <div class="name">{{ song.title || '未知歌曲' }}</div>
        <div class="author">{{ song.artist || '未知歌手' }}</div>
      </div>
    </div>
  </div>

  <MetaEdit v-model="editVisible" :song="editingSong" @saved="menu.onSaved" />
</template>
<script lang="ts" setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import Lenis from 'lenis'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { ElMessage } from 'element-plus'
import MetaEdit from './MetaEdit.vue'
import { formatTime, player, resolveUrl, type Song } from './player'

defineOptions({
  name: "MusicMenu",
})

interface MyTimeLine {
  tl?: gsap.core.Timeline,
  el: HTMLElement
}

const DEFAULT_COVER = resolveUrl('/api/covers/jpg/cover.jpg')
const editVisible = ref(false)
const editingSong = ref<Song | null>(null)

const menu = {
  if_expand: ref(false),
  songs: player.songs,
  playing: player.playing,
  uploading: player.uploading,
  progress: player.progress,
  currentIndex: player.currentIndex,
  currentLabel: computed(() => formatTime(player.current.value)),
  durationLabel: computed(() => formatTime(player.duration.value)),
  expandContainer: null as null | HTMLElement,
  lenis: null as null | Lenis,
  cards: null as null | NodeListOf<HTMLElement>,
  animator: null as null | gsap.core.Timeline,
  tls: [] as MyTimeLine[],
  dragging: false,
  cover(song: Song) {
    return resolveUrl(song.cover_url) || DEFAULT_COVER
  },
  coverError(e: Event) {
    const img = e.target as HTMLImageElement
    if (img && img.getAttribute('src') !== DEFAULT_COVER) img.src = DEFAULT_COVER
  },
  handleDownload(song: Song) {
    const link = document.createElement('a')
    link.href = resolveUrl(`/api/music/${song.id}/download`)
    link.rel = 'noopener'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  },
  handlePlayButton() {
    void player.toggle()
  },
  handleNextButton() {
    void player.next()
  },
  handlePrevButton() {
    void player.prev()
  },
  handleSelect(index: number) {
    void player.playIndex(index)
  },
  handleEdit(song: Song) {
    editingSong.value = song
    editVisible.value = true
  },
  onSaved() {
    void player.loadList()
  },
  pickFile() {
    const input = document.querySelector('.file-input') as HTMLInputElement | null
    input?.click()
  },
  async handleFile(e: Event) {
    const input = e.target as HTMLInputElement
    const files = Array.from(input.files || [])
    input.value = ''
    if (!files.length) return
    const lyric = files.find(f => /\.(lrc|txt)$/i.test(f.name))
    const audio = files.find(f => f !== lyric)
    if (!audio) {
      ElMessage.warning('请选择音频文件（可同时选择 .lrc 歌词）')
      return
    }
    try {
      await player.upload(audio, lyric)
      ElMessage.success(`《${audio.name}》上传成功`)
    } catch (err) {
      ElMessage.error('上传失败：' + ((err as Error).message || '未知错误'))
    }
  },
  async handleRemove(song: Song, e: Event) {
    e.stopPropagation()
    try {
      await player.remove(song.id)
      ElMessage.success('已删除')
    } catch (err) {
      ElMessage.error('删除失败：' + ((err as Error).message || '未知错误'))
    }
  },
  handleListButton() {
    if (menu.if_expand.value) menu.hide()
    else menu.show()
  },
  closeexpand(e: Event) {
    e.preventDefault()
    menu.hide()
  },
  beginDrag(e: MouseEvent) {
    const bar = e.currentTarget as HTMLElement
    menu.dragging = true
    menu.seekFromEvent(e, bar)
    const move = (ev: MouseEvent) => menu.seekFromEvent(ev, bar)
    const up = () => {
      menu.dragging = false
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
  },
  seekFromEvent(e: MouseEvent, bar: HTMLElement) {
    const rect = bar.getBoundingClientRect()
    if (!rect.width) return
    player.seekRatio((e.clientX - rect.left) / rect.width)
  },
  init() {
    gsap.registerPlugin(ScrollTrigger)
    menu.expandContainer = document.querySelector('.card-container')
    menu.cards = document.querySelectorAll('.card')

    function raf(time: number) {
      menu.lenis?.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
  },
  // Lenis is created lazily: the playlist starts hidden (display: none), which
  // would give it a zero-sized scroll range and break smooth scrolling.
  ensureLenis() {
    const el = menu.expandContainer
    if (!el) return
    if (menu.lenis) {
      menu.lenis.resize()
      return
    }
    menu.lenis = new Lenis({
      wrapper: el,
      content: el,
      orientation: 'horizontal',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1,
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })
  },
  killCardTimelines() {
    menu.tls.forEach(tl => {
      const st = (tl.tl as unknown as { scrollTrigger?: { kill(): void } } | undefined)?.scrollTrigger
      st?.kill()
      tl.tl?.kill()
    })
    menu.tls = []
  },
  // (Re)build the per-card scroll timelines. Must be called after the card list
  // changes, otherwise the ScrollTrigger start/end offsets stay stale and the
  // cards scale at the wrong scroll position.
  buildCards(animateIn = false) {
    menu.expandContainer = document.querySelector('.card-container')
    menu.cards = document.querySelectorAll('.card')
    menu.killCardTimelines()
    menu.cards.forEach(c => menu.tls.push({ el: c as HTMLElement }))
    menu.tls.forEach(tl => {
      tl.tl = gsap.timeline({
        scrollTrigger: {
          trigger: tl.el,
          scroller: menu.expandContainer,
          horizontal: true,
          scrub: true,
        }
      })
      tl.tl.to(tl.el, {
        scale: 1.5,
        ease: 'power1.out',
        zIndex: 10,
      }).to(tl.el, {
        scale: .8,
        zIndex: 0,
        ease: 'power1.in',
      })
    })
    gsap.set(menu.cards, { opacity: 1 })
    menu.ensureLenis()
    ScrollTrigger.refresh()
    if (animateIn) {
      menu.animator = gsap.timeline().fromTo(menu.cards, {
        opacity: 0
      }, {
        opacity: 1,
        ease: "power3.out",
      })
    }
  },
  onResize() {
    menu.lenis?.resize()
    ScrollTrigger.refresh()
  },
  show() {
    if (menu.animator?.isActive()) return
    menu.if_expand.value = true
    nextTick(() => menu.buildCards(true))
  },
  hide() {
    if (menu.animator?.isActive()) return
    menu.killCardTimelines()
    menu.animator = gsap.timeline().to(menu.cards, {
      scale: .8,
      opacity: 0,
      ease: "power3.in"
    }).to(menu.cards, {
      scale: 1,
      duration: 0,
      onComplete: () => {
        menu.if_expand.value = false
      }
    })
  }
}

// When the playlist changes (upload / delete / edit) while the overlay is open,
// the cards are re-created and the horizontal scroll width changes. Rebuild the
// ScrollTriggers and refresh their offsets so the parallax stays in sync.
watch(() => player.songs.value.map(s => s.id).join(','), () => {
  if (!menu.if_expand.value) return
  nextTick(() => menu.buildCards(false))
})

onMounted(() => {
  menu.init()
  window.addEventListener('resize', menu.onResize)
})
onUnmounted(() => {
  window.removeEventListener('resize', menu.onResize)
  menu.lenis?.destroy()
  ScrollTrigger.getAll().forEach(st => st.kill())
})
</script>
<style lang="scss" scoped>
@keyframes shine {
  0% {
    filter: drop-shadow(0 0 1px #71dcf7);
  }

  50% {
    filter: drop-shadow(0 0 3px #71dcf7);
  }

  100% {
    filter: drop-shadow(0 0 1px #71dcf7);
  }
}

@keyframes rolling {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.menu-min-container {
  // background-color: red;
  position: absolute;
  height: 50px;
  width: 300px;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 20;

  .bar {
    // pointer-events: all;
    position: absolute;
    cursor: pointer;
    background-color: #ccc;
    box-shadow: -1px -1px 2px #111 inset,
      1px 1px 5px #eee inset;
    height: 10px;
    width: 250px;
    border-radius: 5px;
    transition: transform .2s ease-out;
    margin-bottom: 10px;
  }

  .buttons {
    // pointer-events: all;
    width: 900px;
    position: absolute;
    background-color: rgba($color: #000000, $alpha: .3);
    transform: scale(.6) translateY(calc(100% + 100px));
    transition: transform .2s ease-out;
    height: 80px;
    border-radius: 40px;
    box-shadow: 0px 1px 1px #fff inset,
      0px -1px 1px #fff inset;
    opacity: 0.7;
    display: flex;
    align-items: center;
    padding: 40px;
    gap: 10px;
    margin-bottom: 10px;

    .button {
      width: 50px;
      aspect-ratio: 1;
      background-color: transparent;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;

      .svg-icon {
        color: #fff;
        width: 30%;
        height: 30%;
      }

      &.list {
        .svg-icon {
          width: 50%;
          height: 50%;
        }
      }

      &.upload.loading {
        opacity: .4;
        pointer-events: none;
      }

      &:hover {
        .svg-icon {
          scale: 1.1;
          transition: scale .2s cubic-bezier(0.52, 0.52, 0.17, 1.26);
        }
      }
    }

    .duration {
      flex: 1 1 auto;
      min-width: 160px;
      height: 10px;
      background-color: #ccc;
      border-radius: 5px;
      position: relative;
      cursor: pointer;
      background: linear-gradient(to right,
          rgba($color: #71dcf7, $alpha: .3) calc(var(--p) * 100% + 7.5px),
          rgba($color: #fff, $alpha: .5) calc(var(--p) * 100% + 7.5px));

      .label {
        position: absolute;
        width: 15px;
        height: 15px;
        top: -2.5px;
        border-radius: 50%;
        z-index: 10;
        background-color: #fff;
        left: calc(var(--p) * 100%);
        animation: shine infinite 1s ease-in-out;

        &:hover {
          scale: 1.2;
          transition: scale .2s linear;
        }

        transition: scale .2s linear;
      }
    }

    .time {
      flex-shrink: 0;
      color: #fff;
      font-size: 1.8rem;
      letter-spacing: .05rem;
      white-space: nowrap;
      user-select: none;
    }
  }

  &:hover {
    .bar {
      transform: translateY(calc(100% + 100px));
      transition: transform .2s ease-out;
    }

    .buttons {
      opacity: 1;
      transform: scale(1) translateY(0);
      transition: transform .5s cubic-bezier(0.52, 0.52, 0.17, 1.26), opacity .1s linear;
    }
  }
}

.card-container {
  display: flex;
  overflow: scroll;
  align-items: center;
  padding: 0 20%;
  gap: 30px;

  .empty {
    color: #fff;
    font-size: 1.5rem;
    margin: 0 auto;
    letter-spacing: .2rem;
    opacity: .8;
  }

  .card {
    position: relative;
    opacity: 0;
    flex-shrink: 0;
    width: 300px;
    aspect-ratio: 1;
    border-radius: 10px;
    overflow: hidden;
    border: 2px solid #eee;
    box-shadow: 0 0 10px rgba($color: #000000, $alpha: .5);
    cursor: pointer;
    transition: border-color .2s ease;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .actions {
      position: absolute;
      top: 12px;
      right: 12px;
      display: flex;
      gap: 8px;
      opacity: 0;
      transition: opacity .2s ease;
      z-index: 2;
    }

    .action {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background-color: rgba($color: #000, $alpha: .45);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background-color .2s ease;

      .svg-icon {
        width: 55%;
        height: 55%;
        color: #fff;
      }

      &:hover {
        background-color: rgba($color: #71dcf7, $alpha: .9);
      }
    }

    .overlay {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      padding: 18px 16px;
      background: linear-gradient(to top, rgba(0, 0, 0, .85), transparent);
      display: flex;
      flex-direction: column;
      gap: 4px;
      pointer-events: none;

      .name {
        color: #fff;
        font-size: 1.2rem;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }

      .author {
        color: #ccc;
        font-size: .9rem;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
    }

    &:hover {
      z-index: 10;

      .actions {
        opacity: 1;
      }
    }

    &.active {
      border-color: #71dcf7;
      box-shadow: 0 0 20px rgba($color: #71dcf7, $alpha: .8);
    }
  }

  &.show {
    backdrop-filter: blur(3px);
    transition: backdrop-filter .2s linear;
  }
}

// ---- 移动端适配 ----
@media (max-width: 1024px) {
  .menu-min-container {
    width: 100vw;
    height: 88px;
    padding: 0 3vw 6px;

    // 移动端不再用顶部细进度条，避免与常驻按钮重叠
    .bar {
      display: none;
    }

    .buttons {
      width: 100%;
      height: 62px;
      padding: 10px 14px;
      gap: 2px;
      border-radius: 32px;
      transform: none;
      opacity: .95;
      margin-bottom: 6px;

      .button {
        width: 38px;

        .svg-icon {
          width: 44%;
          height: 44%;
        }
      }

      .duration {
        min-width: 0;
      }

      .time {
        font-size: 12px;
      }
    }

    &:hover {
      .buttons {
        transform: none;
      }
    }
  }

  .card-container {
    padding: 0 10vw;
    gap: 18px;

    .card {
      width: min(62vw, 260px);

      .actions {
        opacity: 1;
        top: 8px;
        right: 8px;
        gap: 6px;
      }

      .action {
        width: 30px;
        height: 30px;
      }

      .overlay {
        padding: 14px 12px;

        .name {
          font-size: 15px;
        }

        .author {
          font-size: 12px;
        }
      }
    }
  }
}
</style>
