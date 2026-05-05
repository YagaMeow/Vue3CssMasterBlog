<template>
  <div class="day" ref="container" :class="[props.current ? 'current' : '']" @click="day.showDetail">
    <div class="content">
      <div class="header">
        <div class="date">{{ props.date }}</div>
        <div class="week">{{ props.week }}</div>
      </div>
      <ul class="list" ref="list">
        <li>吃顿好的</li>
        <li>睡个好觉</li>
      </ul>
    </div>
  </div>
</template>
<script lang="ts" setup>
const emit = defineEmits(['preInput','closeInput'])
import { onMounted, ref } from 'vue'
import gsap from 'gsap'

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
  }
})

const container = ref()
const list = ref()

const day = {
  init() {
  },
  animator: null as null | gsap.core.Timeline,
  if_expand: ref(false),
  handleLeave() {
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
    }).to(list.value, {
      height: 0,
      duration: 0
    }, "<").to(list.value.querySelectorAll("li"), {
      opacity: 0,
      duration: 0
    }, "<")
  },
  showDetail() {
    if (container.value && container.value.classList.contains("current")) {
      this.if_expand.value = true
      emit('preInput')
      container.value.addEventListener("mouseleave", day.handleLeave)
      if (this.animator?.isActive()) this.animator.kill()
      this.animator = gsap.timeline().to(container.value, {
        width: "200%",
        height: "calc(200% + 1rem)",
        duration: 1,
        x: window.innerWidth - container.value.getBoundingClientRect().right < container.value.clientWidth ? "-50%" : container.value.getBoundingClientRect().left < container.value.clientWidth ? "2%" : 0,
        y: window.innerHeight - container.value.getBoundingClientRect().bottom < container.value.clientHeight ? "-50%" : 0,
        ease: "elastic.out(1,1)"
      }).to(list.value, {
        height: "auto",
        duration: 0
      }, "<").fromTo(list.value.querySelectorAll("li"), {
        opacity: 0,
        x: 20
      }, {
        opacity: 1,
        x: 0,
        duration: 1,
        stagger: 0.2
      }, "<")
    }
  }
}

onMounted(() => {
  day.init()
})
</script>
<style lang="scss" scoped>
.day {
  cursor: pointer;
  // background-color: rgba($color: #000000, $alpha: 0.3);
  background-color: rgba($color: #868686, $alpha: 0.8);
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
    background-color: rgba($color: #3a3a3a, $alpha: 0.8);

    &:hover {
      scale: 1.05 !important;
      z-index: 10;
      background-color: #aaa;
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
    pointer-events: none;
    z-index: 1;
    cursor: pointer;
    gap: 1rem;

    * {
      pointer-events: none;
    }

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
      font-size: 2.5rem;
      color: #eee;
      padding-bottom: .5rem;
      writing-mode: vertical-rl;
    }

    .list {
      width: 100%;
      top: 7rem;
      position: absolute;
      height: 0;
      overflow: hidden;

      li {
        display: flex;
        align-items: center;
        list-style: none;
        font-size: 2rem;
        color: #333;
        opacity: 0;
        margin-top: 1rem;
        &::before {
          box-shadow: inset .2rem .2rem .2rem #e3f9cc,
          inset -0.2rem -0.2rem 0.2rem #e3f9cc,
          inset .5rem .5rem 1rem greenyellow,
          inset -.5rem -.5rem 1rem greenyellow;
          border-radius: .5rem;
          margin-right: 1rem;
          content: "";
          display: block;
          width: 2rem;
          height: 2rem;
          background-color: green;
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
