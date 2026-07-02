<template>
  <div class="calendar-container _fullscreen" v-show="calendar.if_visible.value">
    <div class="pre-input" v-show="calendar.show_input.value">
      <input v-model="calendar.inputText.value" type="text" />
    </div>
    <div class="calendar-header card">
      <div class="card month">
        <div class="date">
          <span>{{ formatMonth(new Date().getMonth()) }}</span>
          <span>{{ new Date().getDate() }}</span>
        </div>
        <hr />
        <div class="message">Nothing to do. Just waste your life.</div>
      </div>
    </div>
    <div class="days-container">
      <SingleDay v-for="i in calendar.date.value" :key="`date${i}`" :date="i.date" :current="i.current" :week="i.week"
        class="card" @pre-input="calendar.preInput" @close-input="calendar.closeInput">
      </SingleDay>
      <div class="light-plate-container">
        <div class="light-plate"></div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useAppStore } from '@/pinia'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import SingleDay from './SingleDay.vue'
import gsap, { Cubic } from 'gsap'
import { elasticEase } from '@/utils/utils'
import { ca } from 'element-plus/es/locales.mjs'
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
  return table[month] || 'Null'
}

const calendar = {
  inputText: ref(""),
  if_visible: ref(false),
  start_line: ref(false),
  date: ref([] as { date: number; current: boolean, week: string }[]),
  container: null as HTMLElement | null,
  svg: null as null | SVGSVGElement,
  line: null as null | SVGLineElement,
  plate: null as null | HTMLElement,
  card: null as null | NodeListOf<HTMLElement>,
  animator: null as null | gsap.core.Timeline,
  input: null as null | HTMLElement,
  show_input: ref(false),
  init() {
    this.container = document.querySelector('.days-container')
    this.card = document.querySelectorAll('.card')
    this.plate = document.querySelector(".light-plate")
    this.initDate()
    this.container?.addEventListener('mousemove', calendar.handlePlateMove)
    this.container?.addEventListener('mouseenter', calendar.handlePlateEnter)
    this.container?.addEventListener('mouseleave', calendar.handlePlateLeave)
    this.input = document.querySelector(".pre-input input")
  },
  preInput() {
    calendar.show_input.value = true
    nextTick(() => {
      if (calendar.input)
        calendar.input.focus()
    })
  },
  closeInput() {
    if (calendar.input) {
      calendar.show_input.value = false
      calendar.inputText.value = ""
    }
  },
  handlePlateEnter(e: MouseEvent) {

    if (calendar.plate) {
      if (calendar.animator?.isActive()) calendar.animator.kill()
      calendar.animator = gsap.timeline().to(calendar.plate, {
        opacity: 1
      })
    }
  },
  handlePlateLeave(e: MouseEvent) {
    if (calendar.plate) {
      if (calendar.animator?.isActive()) calendar.animator.kill()
      calendar.animator = gsap.timeline().to(calendar.plate, {
        opacity: 0
      })
    }
  },
  handlePlateMove(e: MouseEvent) {
    const container = document.querySelector(".light-plate-container") as HTMLElement
    if (calendar.plate && container) {
      calendar.plate.style.setProperty("top", e.pageY - container.getBoundingClientRect().top + 'px')
      calendar.plate.style.setProperty("left", e.pageX - container.getBoundingClientRect().left + 'px')
    }
  },
  formatWeek(week: number) {
    const table = [
      "周日",
      "周一",
      "周二",
      "周三",
      "周四",
      "周五",
      "周六",

    ]
    return table[week % 7]
  },
  initDate() {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const pastLast = new Date(year, month, 0)
    const pastLastDay = pastLast.getDate()
    const pastLastWeek = pastLast.getDay()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(month == 11 ? year + 1 : year, month == 11 ? 1 : month + 1, 0)
    let currentWeek = firstDay.getDay()
    for (let i = firstDay.getDay() - 2; i >= 0; --i) {
      this.date.value.push({
        date: pastLastDay - i,
        current: false,
        week: this.formatWeek(pastLastWeek - i)
      })
    }
    for (let i = 1; i <= lastDay.getDate(); ++i) {
      this.date.value.push({
        date: i,
        current: true,
        week: this.formatWeek(currentWeek++)
      })
    }

    for (let i = 1; i <= 43 - firstDay.getDay() - lastDay.getDate(); ++i) {
      this.date.value.push({
        date: i,
        current: false,
        week: this.formatWeek(currentWeek++)
      })
    }
  },
  show() {
    this.card = document.querySelectorAll('.card')
    if (this.animator?.isActive()) return
    appStore.current_page = 'calendar'
    this.if_visible.value = true
    this.animator = gsap.timeline().fromTo(
      Array.from(this.card).sort((a, b) => Math.random() - 0.5),
      {
        scale: 0.9,
        // transformOrigin: 'top left',
        opacity: 0,
        y: 10,
      },
      {
        stagger: 0.01,
        scale: 1,
        duration: 0.3,
        opacity: 1,
        y: 0,
        ease: 'elastic.out(1,0.8)',
      },
    )
    // document.addEventListener('mousedown', calendar.handle_md)
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
    console.log(target, target.offsetLeft, target.offsetTop)
    const startX = target.offsetLeft + target.offsetWidth / 2
    const startY = target.offsetTop + target.offsetHeight / 2
    console.log(startX, startY)
    // document.addEventListener('mousemove', this.handle_mv)
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
      z-index: 20
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

    // document.addEventListener('mousemove', calendar.handle_mv)
    // document.addEventListener('mouseup', calendar.handle_mu)

    e.preventDefault()
    // e.stopPropagation()
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
    // document.removeEventListener('mousemove', calendar.handle_mv)
    // document.removeEventListener('mouseup', calendar.handle_mu)
    calendar.container.removeChild(calendar.svg)
  },
}

onMounted(() => {
  calendar.init()
})

onUnmounted(() => {
  document.removeEventListener('mousemove', calendar.handlePlateMove)
  document.removeEventListener('mousedown', calendar.handle_md)
  // document.removeEventListener('mousemove', calendar.handle_mv)
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
  padding-top: 7rem;
  gap: 1rem;
  justify-content: space-around;

  .pre-input {
    position: absolute;
    width: 40vw;
    left: 50%;
    top: 20%;
    transform: translate(-50%, -50%);
    z-index: 30;
    // background-color: red;
    display: flex;

    input {
      flex-grow: 1;
      display: block;
      font-size: 3rem;
      padding: 1rem 2rem;
      outline: none;
      border-radius: 3.5rem;
      border: none;
      background-color: #333;
      color: #eee;

      // width: 0;
      // height: 0;
      // opacity: 0;
    }
  }

  .calendar-header {
    flex-shrink: 0;
    // background-color: rgba($color: #000, $alpha: 0.8);
    // backdrop-filter: blur(3rem);
    height: 20vh;
    border-radius: 2rem;

    .card {
      // background-color: rgba($color: #eee, $alpha: .4);
      backdrop-filter: blur(5px);
      border-radius: 2rem;
      // box-shadow:
      //   inset 0.5rem 0rem 1rem #eee,
      //   inset -0.5rem 0rem 1rem #eee,
      //   inset 1rem 0rem 1rem #636363,
      //   inset -1rem 0 1rem #636363,
      //   inset 0 -0.5rem 1rem rgba($color: #000000, $alpha: 0.8);
      box-shadow: inset 1px 1px 1px #fff;
      padding: 1rem;
    }

    .month {
      * {
        color: #b7b7b7;
      }
      height: 100%;
      aspect-ratio: 2;
      // height: 50%;
      // display: none;
      flex-direction: column;
      justify-content: center;
      padding-left: 1.5rem;

      span {
        font-size: 4rem;
        font-weight: bold;
      }

      .date {
        padding: 1rem;
      }

      .message {
        padding: 1rem;
        font-size: medium;

        * {
          font-size: medium;
        }
      }
    }
  }

  .days-container {
    position: relative;
    // background-color: rgba($color: #000, $alpha: 0.8);
    flex-grow: 1;
    border-radius: 2rem;
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    // grid-template-rows: repeat(6,1fr);
    gap: 1rem;
    justify-content: flex-start;

    .light-plate-container {
      position: absolute;
      width: 100%;
      height: 100%;
      overflow: hidden;
      user-select: none;
      pointer-events: none;
      border-radius: 1rem;

      .light-plate {
        @keyframes mscale {
          0% {
            scale: 0.8;
            opacity: .5;
          }
          30% {
            opacity: .6;
          }
          50% {
            scale: 1.1;
          }
          60% {
            opacity: .7;
          }
          90% {
            opacity: .6;
          }
          100% {
            scale: .8;
            opacity: .5;
          }
        }
        animation: mscale 3s ease-in-out infinite;
        opacity: 0;
        transform-origin: 0 0;
        transform: translate(-50%, -50%);
        width: 50rem;
        height: 50rem;
        border-radius: 50%;
        position: absolute;
        // backdrop-filter: brightness(2);
        background: rgba($color: #fff, $alpha: .5);
        mix-blend-mode: soft-light;
        mask: radial-gradient(#000 0%, transparent 70%);
        user-select: none;
        pointer-events: none;

      }
    }
  }
}
</style>
