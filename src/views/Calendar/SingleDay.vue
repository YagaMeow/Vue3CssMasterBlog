<template>
  <div class="day" ref="container" :class="{
    'current': props.current,
    'empty': props.notes.length == 0
  }" :style="{
    '--g': notes.reduce((pre, cur) => pre + Number(cur.status == 0), 0),
    '--y': notes.reduce((pre, cur) => pre + Number(cur.status == 1), 0),
    '--r': notes.reduce((pre, cur) => pre + Number(cur.status == 2), 0)
  }" @click="day.showDetail">
    <div class="content">
      <div class="header">
        <div class="date">{{ props.date }}</div>
        <div class="week">{{ props.week }}</div>
      </div>
      <ul class="list" ref="list">
        <li v-for="note in props.notes" :key="note.ID" @click="day.changeStatus(note)" :class="`status${note.status}`">
          {{ note.content }}
        </li>
      </ul>
    </div>
  </div>
</template>
<script lang="ts" setup>
const emit = defineEmits(['preInput', 'closeInput'])
import { inject, onMounted, ref, type PropType } from 'vue'
import gsap from 'gsap'
import { CalendarAPI } from '@/api/calendar'

interface note {
  ID: number,
  content: string,
  status: number,
  date: string
}

interface var_note extends note {
  note: note
}

const props = defineProps({
  date: {
    type: Number,
    default: null,
  },
  current: {
    type: Boolean,
    default: true,
  },
  week: {
    type: String,
    default: ""
  },
  notes: {
    type: Array as PropType<note[]>,
    default: () => []
  }
})

const container = ref()
const list = ref()

const day = {
  note: inject('note') as var_note,
  init() {
    console.log(props.notes)
  },
  animator: null as null | gsap.core.Timeline,
  if_expand: ref(false),
  handleLeave() {
    // return
    day.note.status = 0
    day.if_expand.value = false
    emit("closeInput")
    if (day.animator?.isActive()) day.animator.kill()
    day.animator = gsap.timeline().to(container.value, {
      width: "100%",
      height: "100%",
      x: 0,
      y: 0,
      duration: .2,
      onComplete: () => {
        container.value.removeEventListener("mouseleave", day.handleLeave)
      }
    })
    // .to(list.value, {
    //   height: 0,
    //   duration: 0
    // }, "<").to(list.value.querySelectorAll("li"), {
    //   opacity: 0,
    //   duration: 0
    // }, "<")
  },
  changeStatus(note: note) {
    note.status = (note.status + 1) % 3
    this.note.content = note.content
    this.note.ID = note.ID
    this.note.status = note.status
    this.note.date = note.date
    this.note.note = note
    const input = document.querySelector(".pre-input input") as HTMLElement
    if (input)
      input.focus()
    CalendarAPI.updateNote({
      ID: note.ID,
      status: note.status,
      content: note.content,
      date: note.date
    })
  },
  showDetail() {
    if (this.if_expand.value) return
    if (container.value && container.value.classList.contains("current")) {
      this.if_expand.value = true
      emit('preInput')
      container.value.addEventListener("mouseleave", day.handleLeave)
      if (this.animator?.isActive()) this.animator.kill()
      this.animator = gsap.timeline().to(container.value, {
        width: "200%",
        height: "calc(200% + 1rem)",
        scale: 1,
        duration: .5,
        x: window.innerWidth - container.value.getBoundingClientRect().right < container.value.clientWidth ? "-50%" : container.value.getBoundingClientRect().left < container.value.clientWidth ? "2%" : 0,
        y: window.innerHeight - container.value.getBoundingClientRect().bottom < container.value.clientHeight ? "-50%" : 0,
        ease: "elastic.out(1,1)"
      })
      // .to(list.value, {
      //   height: "auto",
      //   duration: 0
      // }, "<")
      // .fromTo(list.value.querySelectorAll("li"), {
      //   opacity: 0,
      //   x: 20
      // }, {
      //   opacity: 1,
      //   x: 0,
      //   duration: 1,
      //   stagger: 0.2
      // }, "<")
    }
  }
}

onMounted(() => {
  day.init()
})
</script>
<style lang="scss" scoped>
@property --gp {
  syntax: '<number>';
  inherits: false;
  initial-value: 0;
}

@property --yp {
  syntax: '<number>';
  inherits: false;
  initial-value: 0;
}

@property --rp {
  syntax: '<number>';
  inherits: false;
  initial-value: 0;
}

.day {
  overflow: hidden;

  &.empty::after {
    display: none;
  }

  &::after {
    content: "";
    display: block;
    position: absolute;
    width: 100%;
    height: 3px;
    --gp: calc(100 * var(--g) / (var(--g) + var(--y) + var(--r)));
    --yp: calc(100 * var(--y) / (var(--g) + var(--y) + var(--r)));
    --rp: calc(100 * var(--r) / (var(--g) + var(--y) + var(--r)));
    background: linear-gradient(to right,
        rgb(130, 255, 130) 0 calc(var(--gp) * 1%),
        rgb(255, 255, 160) calc(var(--gp) * 1%) calc((var(--gp) + var(--yp)) * 1%),
        rgb(255, 143, 143) calc((var(--gp) + var(--yp)) * 1%) calc((var(--gp) + var(--yp) + var(--rp)) * 1%));
    transition: all 1s ease;
    bottom: 0;
    left: 0;
    transition: --gp 0.5s ease, --yp 0.5s ease, --rp 0.5s ease;
  }

  cursor: pointer;
  // background-color: rgba($color: #000000, $alpha: 0.3);
  // background-color: rgba($color: #868686, $alpha: 0.8);
  border-radius: 1rem;
  // min-width: 20vh;
  // height: auto;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  backdrop-filter: blur(3rem);
  box-shadow: inset 0.1rem 0.1rem 0.2rem #fff;
  padding: 1rem;

  &.show {
    width: 200%;
    height: 150%;
  }

  &.current {
    background-color: rgba($color: #3a3a3a, $alpha: 0.6);

    .content .list li {
      pointer-events: auto;
    }

    &:hover {
      scale: 1.05 !important;
      z-index: 10;
      background-color: rgba(51, 51, 51, .96);
      backdrop-filter: blur(1px);
      transition: scale 0.2s cubic-bezier(0.29, 1.32, 0.74, 1.77), background-color 0.2s ease;

      .content {
        .date {
          // color: #666;
          -webkit-text-stroke: 0.05rem #000;
        }
      }
    }

    transition: scale .2s ease,
    background-color 1s ease;

    .content {
      .date {
        color: #fff;
        -webkit-text-stroke: 0.05rem #000;
      }
    }
  }

  .content {
    display: flex;
    flex-direction: column;
    // justify-content: stretch;
    overflow: scroll;
    z-index: 1;
    cursor: pointer;
    gap: 1rem;

    .header {
      width: 100%;
      display: flex;
      align-items: flex-end;
    }

    .date {
      font-size: 5rem;
      font-weight: bolder;
      font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
      color: #a9a9a9;
      user-select: none;
      min-width: 5rem;
    }

    .week {
      user-select: none;
      font-size: 2.5rem;
      color: #eee;
      padding-bottom: .5rem;
      writing-mode: vertical-rl;
    }

    .list {
      width: 100%;
      top: 7rem;
      position: absolute;
      display: block;
      height: calc(100% - 8rem);
      overflow: scroll;

      li {
        pointer-events: none;
        display: flex;
        align-items: center;
        list-style: none;
        font-size: 2rem;
        color: #eee;
        // opacity: 0;
        margin-top: 1rem;

        &.status0::before {
          box-shadow: inset .2rem .2rem .2rem #e3f9cc,
            inset -0.2rem -0.2rem 0.2rem #e3f9cc,
            inset .5rem .5rem 1rem greenyellow,
            inset -.5rem -.5rem 1rem greenyellow;
          border-radius: 50%;
          margin-right: 1.5rem;
          content: "";
          display: block;
          width: 1.5rem;
          height: 1.5rem;
          background-color: green;
        }

        &.status1::before {
          // box-shadow: inset .2rem .2rem .2rem #e3f9cc,
          //   inset -0.2rem -0.2rem 0.2rem #e3f9cc,
          //   inset .5rem .5rem 1rem greenyellow,
          //   inset -.5rem -.5rem 1rem greenyellow;
          border-radius: .5rem;
          margin-right: 1rem;
          content: "";
          display: block;
          width: 2rem;
          height: 2rem;
          // background-color: red;
          background-image: url("@/assets/img/pen.png");
          background-size: contain;
        }

        &.status2::before {
          // box-shadow: inset .2rem .2rem .2rem #e3f9cc,
          //   inset -0.2rem -0.2rem 0.2rem #e3f9cc,
          //   inset .5rem .5rem 1rem greenyellow,
          //   inset -.5rem -.5rem 1rem greenyellow;
          // border-radius: .5rem;
          margin-right: 1rem;
          content: "";
          display: block;
          width: 2rem;
          height: 2rem;
          background-image: url("@/assets/img/wrong.png");
          background-size: contain;
        }

        &.status2 {
          text-decoration: line-through;
        }
      }
    }
  }

  @media screen and (max-aspect-ratio: 1/1) {
    // display: flex;
    // justify-content: center;

    .content {
      // background-color: #eee;
      // border-radius: 50%;
      // width: 100%;
      // aspect-ratio: 1;
      // display: flex;
      // align-items: center;
      // justify-content: center;
      // box-shadow:
      //   inset 0rem -1rem 1rem rgba($color: #ffffffe0, $alpha: 0.8),
      //   inset 0rem 1rem 1rem rgba($color: #ffffffe0, $alpha: 0.8),
      //   inset 1rem 0rem 1rem rgba($color: #ffffffe0, $alpha: 0.8),
      //   inset -1rem 0rem 1rem rgba($color: #ffffffe0, $alpha: 0.8),
      //   inset 1rem 0rem 2rem rgba($color: #a5a5a5, $alpha: 0.5),
      //   inset -1rem 0rem 2rem rgba($color: #a5a5a5, $alpha: 0.5),
      //   inset 0rem 1rem 2rem rgba($color: #a5a5a5, $alpha: 0.5),
      //   inset 0rem -1rem 2rem rgba($color: #a5a5a5, $alpha: 0.5);

      &:hover {
        scale: 0.9;
        transition: scale 0.05s ease;
        filter: brightness(0.5);
      }

      transition: scale 0.2s 0.3s cubic-bezier(0.175, 0.885, 0.32, 2.275),
      filter 0.5s ease;
    }
  }
}
</style>
