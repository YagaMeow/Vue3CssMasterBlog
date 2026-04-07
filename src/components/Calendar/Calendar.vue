<template>
  <div class="calendar-container _fullscreen" v-show="calendar.if_visible.value">
    <div class="calendar-header card">
      <div class="card month">
        <span>{{ formatMonth(new Date().getMonth()) }}</span>
      </div>
    </div>
    <div class="days-container card">
      <SingleDay v-for="i in 42" :key="i" :date="i"></SingleDay>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useAppStore } from '@/pinia'
import { onMounted, onUnmounted, ref } from 'vue'
import SingleDay from './SingleDay.vue'
import gsap, { Cubic } from 'gsap'
import { elasticEase } from '@/utils/utils'
defineOptions({
  name: 'CalendarSchedule',
})

function formatMonth(month: number): string {
  const table = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  return table[month - 1] || 'Null'
}

const calendar = {
  if_visible: ref(false),
  start_line: ref(false),
  date: ref([]),
  container: null as HTMLElement | null,
  svg: null as null | SVGSVGElement,
  line: null as null | SVGLineElement,
  card: null as null | NodeListOf<HTMLElement>,
  animator: null as null | gsap.core.Timeline,
  init() {
    this.container = document.querySelector('.days-container')
    this.card = document.querySelectorAll('.card')
  },
  show() {
    if (this.animator?.isActive()) return
    appStore.current_page = 'calendar'
    this.if_visible.value = true
    this.animator = gsap.timeline().fromTo(
      this.card,
      {
        scale: 0.9,
        // transformOrigin: 'top left',
        opacity: 0,
        y: 10,
      },
      {
        stagger: 0.1,
        scale: 1,
        duration: 0.3,
        opacity: 1,
        y: 0,
        ease: 'elastic.out(1,0.8)',
      },
    )
    document.addEventListener('mousedown', calendar.handle_md)
  },
  hide(im: () => void, nx: () => void) {
    this.if_visible.value = false
    if (im) im()
    if (nx) nx()
  },
  handle_md(e: MouseEvent) {
    if (calendar.start_line.value) return
    calendar.start_line.value = true
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    const target = e.target as HTMLElement
    console.log(target)
    const startX = target.offsetLeft + target.offsetWidth / 2
    const startY = target.offsetTop + target.offsetHeight / 2
    document.addEventListener('mousemove', this.handle_mv)
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute(
      'style',
      `
      position:absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events:none;
      animation: roll infinite .2s linear;
      z-indx: -1
      `,
    )

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('stroke', '#eee')
    line.setAttribute('stroke-width', '10')
    line.setAttribute('stroke-dasharray', '10,20')
    line.setAttribute('fill', 'none')
    line.setAttribute('stroke-linecap', 'round')
    line.setAttribute('x1', startX.toString())
    line.setAttribute('y1', startY.toString())
    line.setAttribute('x2', startX.toString())
    line.setAttribute('y2', startY.toString())

    svg.appendChild(line)
    calendar.container?.appendChild(svg)

    calendar.svg = svg
    calendar.line = line

    document.addEventListener('mousemove', calendar.handle_mv)
    document.addEventListener('mouseup', calendar.handle_mu)

    e.preventDefault()
    e.stopPropagation()
  },
  handle_mv(e: MouseEvent) {
    if (!calendar.container || !calendar.line) return
    const rect = calendar.container.getBoundingClientRect()
    const currentX = e.clientX - rect.left
    const currentY = e.clientY - rect.top

    calendar.line.setAttribute('x2', currentX.toString())
    calendar.line.setAttribute('y2', currentY.toString())
  },
  handle_mu(e: MouseEvent) {
    if (!calendar.container || !calendar.line || !calendar.svg) return
    const target = e.target as HTMLElement
    console.log(target)
    const endX = target.offsetLeft + target.offsetWidth / 2
    const endY = target.offsetTop + target.offsetHeight / 2
    calendar.line.setAttribute('x2', endX.toString())
    calendar.line.setAttribute('y2', endY.toString())
    calendar.start_line.value = false
    document.removeEventListener('mousemove', calendar.handle_mv)
    document.removeEventListener('mouseup', calendar.handle_mu)
    calendar.container.removeChild(calendar.svg)
  },
}

onMounted(() => {
  calendar.init()
})

onUnmounted(() => {
  document.removeEventListener('mousedown', calendar.handle_md)
  document.removeEventListener('mousemove', calendar.handle_mv)
  document.removeEventListener('mouseup', calendar.handle_mu)
})

const appStore = useAppStore()

appStore.show_calendar = calendar.show.bind(calendar)
appStore.hide_calendar = calendar.hide.bind(calendar)
</script>
<style>
@keyframes roll {
  0% {
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dashoffset: -30;
  }
}
</style>
<style lang="scss" scoped>
.calendar-container {
  display: flex;
  flex-direction: column;
  // align-items: stretch;
  // background-color: red;
  padding: 1rem;
  gap: 1rem;
  justify-content: space-around;
  .calendar-header {
    flex-shrink: 0;
    background-color: rgba($color: #000, $alpha: 0.8);
    backdrop-filter: blur(3rem);
    height: 20vh;
    border-radius: 2rem;
    .card {
      background-color: #eee;
      border-radius: 2rem;
      box-shadow:
        inset 0.5rem 0rem 1rem #eee,
        inset -0.5rem 0rem 1rem #eee,
        inset 1rem 0rem 1rem #636363,
        inset -1rem 0 1rem #636363,
        inset 0 -0.5rem 1rem rgba($color: #000000, $alpha: 0.8);
    }
    .month {
      width: 30vw;
      height: 50%;
      display: none;
      flex-direction: column;
      justify-content: center;
      padding-left: 1.5rem;
      span {
        font-size: 5rem;
        font-weight: bold;
      }
    }
  }
  .days-container {
    position: relative;
    overflow-y: scroll;
    background-color: rgba($color: #000, $alpha: 0.8);
    flex-grow: 1;
    border-radius: 2rem;
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 5rem;
    padding: 2rem;
    justify-content: flex-start;
  }
}
</style>
