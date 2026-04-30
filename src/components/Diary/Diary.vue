<template>
  <div class="diary-container _fullscreen" v-show="diary.if_visible.value">
    <div class="view-container">
      <div class="content-container" style="--h: 100%">
        <div class="cards">
          <div class="content card" style="--r: -10deg">
            <span> 很久很久以前...</span>
            <span class="footer">1970-01-01</span>
          </div>
          <div class="content card" style="--r: 10deg">
            <span>有一座名为索姆阿尔峰的山峰</span>
            <span class="footer">2026-01-01</span>
          </div>
          <div class="content card" style="--r: -10deg">
            <span> 很久很久以前...</span>
            <span class="footer">1970-01-01</span>
          </div>
          <div class="content card" style="--r: 10deg">
            <span>有一座名为索姆阿尔峰的山峰</span>
            <span class="footer">2026-01-01</span>
          </div>
          <div class="content card" style="--r: -10deg">
            <span> 很久很久以前...</span>
            <span class="footer">1970-01-01</span>
          </div>
          <div class="content card" style="--r: 10deg">
            <span>有一座名为索姆阿尔峰的山峰</span>
            <span class="footer">2026-01-01</span>
          </div>
          <div class="content card" style="--r: -10deg">
            <span> 很久很久以前...</span>
            <span class="footer">1970-01-01</span>
          </div>
          <div class="content card" style="--r: 10deg">
            <span>有一座名为索姆阿尔峰的山峰</span>
            <span class="footer">2026-01-01</span>
          </div>
          <div class="content card" style="--r: -10deg">
            <span> 很久很久以前...</span>
            <span class="footer">1970-01-01</span>
          </div>
          <div class="content card" style="--r: 10deg">
            <span>有一座名为索姆阿尔峰的山峰</span>
            <span class="footer">2026-01-01</span>
          </div>
        </div>
      </div>
      <!-- <div class="add">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="100"></circle>
        </svg>
      </div> -->
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useAppStore } from '@/pinia'
import { dialogEmits } from 'element-plus'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'
import { range } from '@/utils/utils'

defineOptions({
  name: 'MyDiary',
})
const diary = {
  if_visible: ref(false),
  content_container: null as null | HTMLElement,
  view_container: null as null | HTMLElement,
  cards: null as null | HTMLElement,
  cardList: null as null | NodeListOf<HTMLElement>,
  pos: {
    x: 0,
    y: 0,
  },
  lock: false,
  animator: null as null | gsap.core.Timeline,
  init() {
    this.content_container = document.querySelector('.content-container')
    this.view_container = document.querySelector('.view-container')
    this.cards = document.querySelector('.cards')
    this.cardList = document.querySelectorAll('.card')
    if (this.cardList)
      this.cardList.forEach((c) => {
        c.style.setProperty('--r', range(-10, 10) + 'deg')
      })
  },
  show() {
    this.if_visible.value = true
    appStore.current_page = 'diary'
    nextTick(() => {
      // console.log(this.content_container?.scrollWidth.toString())
      if (this.content_container)
        this.content_container.style.setProperty(
          '--h',
          (this.content_container.scrollWidth - window.innerHeight).toString() + 'px',
        )
      console.log(this.cards?.clientWidth)
    })
    this.view_container?.addEventListener('wheel', diary.handleScroll)
  },
  handleScroll(e: WheelEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (diary.lock) return
    if (diary.animator?.isActive()) diary.animator.kill()
    if (diary.view_container && diary.content_container && diary.cards) {
      // diary.view_container.scrollTo(diary.pos.x + e.deltaY, 0)
      diary.pos.x += e.deltaY
      console.log(diary.pos.x)
      if (diary.pos.x < -1 * diary.cards.scrollWidth) {
        diary.lock = true
        diary.pos.x = window.innerWidth
        diary.animator = gsap
          .timeline()
          .to(diary.cards, {
            x: -1 * diary.cards.scrollWidth,
          })
          .to(diary.cards, {
            x: window.innerWidth,
            duration: 0,
            onComplete: () => {
              diary.lock = false
            },
          })
      } else if (diary.pos.x > window.innerWidth) {
        diary.lock = true
        diary.pos.x = -1 * diary.cards.scrollWidth
        diary.animator = gsap
          .timeline()
          .to(diary.cards, {
            x: window.innerWidth,
          })
          .to(diary.cards, {
            x: -1 * diary.cards.scrollWidth,
            duration: 0,
            onComplete: () => {
              diary.lock = false
            },
          })
      } else
        diary.animator = gsap.timeline().to(diary.cards, {
          x: diary.pos.x,
          ease: 'power1.out',
        })
    }
  },
  hide(im: () => void, nx: () => void) {
    if (im) im()
    if (nx) nx()
    this.if_visible.value = false
  },
}
onMounted(() => {
  diary.init()
})

onUnmounted(() => {
  document.removeEventListener('wheel', diary.handleScroll)
})
const appStore = useAppStore()
appStore.show_diary = diary.show.bind(diary)
appStore.hide_diary = diary.hide.bind(diary)
</script>
<style lang="scss" scoped>
.diary-container {
  // background-color: #000;
  display: flex;
  flex-direction: column;
  .view-container {
    width: 100%;
    height: 100%;
    overflow-x: scroll;
    // background-color: red;
    .content-container {
      height: var(--h);
      // background-color: red;
    }
    .cards {
      // background-color: blue;
      gap: 2rem;
      padding: 3rem;
      padding-top: 6rem;
      display: flex;
      // flex-direction: column;
      .add {
        width: 5rem;
        height: 5rem;
        background-color: #fff;
        svg {
          width: 100%;
          height: 100%;
        }
        // margin-left: auto;
      }
      overflow: visible;
      .card {
        width: 45vh;
        height: 60vh;
        rotate: var(--r);
        flex-shrink: 0;
      }
      .content {
        display: flex;
        flex-direction: column;
        border-radius: 1rem;
        background-color: rgba($color: #3d3d3d, $alpha: 1);
        // width: 100%;
        * {
          font-size: 3rem;
          color: #fff;
        }
        span {
          line-height: 5rem;
          padding: 1rem;
        }
        .footer {
          font-size: 1.5rem;
          line-height: 2rem;
          margin-left: auto;
        }
      }
    }
  }
}
</style>
