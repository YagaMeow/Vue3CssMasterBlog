<template>
  <div class="progress-n-welcome _fullscreen">
    <div class="bricks _fullscreen"></div>
    <div class="progress-text" :class="appStore.total_steps != 0 && appStore.total_steps == appStore.completed_steps
      ? ['complete']
      : []
      ">
      <p>
        <span>Welcome</span>
      </p>
    </div>
    <div class="progress-bar" :class="appStore.total_steps != 0 && appStore.total_steps == appStore.completed_steps
      ? ['complete']
      : []
      " :style="{
        '--progress':
          appStore.total_steps == 0 ? 0 : appStore.completed_steps / appStore.total_steps,
      }">
      <!-- <p>{{ appStore.completed_steps }}/{{ appStore.total_steps }}</p> -->
    </div>
    <div class="progress-container">
      <div :class="p.complete ? ['hide'] : []" class="progress" v-for="(p, i) in appStore.progress"
        :key="`progress${i}`">
        <p v-if="!p.complete">{{ p.label }}{{ p.current }}/{{ p.total }}</p>
        <p v-else>{{ p.label }}</p>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
defineOptions({
  name: 'MyProgress',
})
import { useAppStore } from '@/pinia'
import { nextTick, onMounted, ref, onUnmounted } from 'vue'
import { watch } from 'vue'
import gsap from 'gsap'
import { isMobile } from '@/utils/utils'

const appStore = useAppStore()
const progress = {
  animator: null as null | gsap.core.Timeline,
  width: 0,
  height: 0,
  count: 0,
  bricks_container: null as null | HTMLElement,
  init() {
    this.width = document.body.offsetWidth
    this.height = document.body.offsetHeight
    if (this.width > this.height)
      this.count = Math.floor(this.width / (this.height / 5)) + 1
    else this.count = Math.floor(this.height / (this.width / 5)) + 1
    this.bricks_container = document.querySelector(".bricks")
    for (let i = 0; i < 5; ++i) {
      const el = document.createElement("div")
      el.classList.add("brick-rows")
      for (let j = 0; j < this.count; ++j) {
        const b = document.createElement("div")
        b.classList.add("brick")
        el.appendChild(b)
      }
      this.bricks_container?.appendChild(el)
    }
    progress.show()
  },
  handleResize() {
    progress.width = document.body.offsetWidth
    progress.height = document.body.offsetHeight
    progress.count = Math.floor(progress.width / (progress.height / 5)) + 1
    console.log(progress.count)
    if (progress.bricks_container) progress.bricks_container.innerHTML = ""
    for (let i = 0; i < 5; ++i) {
      const el = document.createElement("div")
      el.classList.add("brick-rows")
      for (let j = 0; j < progress.count; ++j) {
        const b = document.createElement("div")
        b.classList.add("brick")
        el.appendChild(b)
      }
      progress.bricks_container?.appendChild(el)
    }
  },
  show() {
    console.log("[progress]", progress.count)
    this.animator = gsap
      .timeline()
      .fromTo(document.querySelectorAll(".brick"), {
        rotate: "45deg",
        scale: 0,
        borderRadius: "1%",
        y: "-50%",
        x: "50%",
      }, {
        y: 0,
        x: 0,
        duration: .6,
        rotate: 0,
        scale: 1,
        borderRadius: 0,
        stagger: {
          grid: 'auto',
          from: isMobile() ? 4 * progress.count : (progress.count - 1),
          amount: .5
        }
      })
  }
}
onMounted(() => {
  progress.init()
  window.addEventListener("resize", progress.handleResize)
})
onUnmounted(() => {
  window.removeEventListener("resize", progress.handleResize)
})

watch(
  () => appStore.completed_steps,
  (val) => {
    if (appStore.total_steps != 0 && appStore.total_steps == appStore.completed_steps) {
      gsap
        .timeline()
        .to(document.querySelector('.progress-text'), {
          x: '8rem',
          duration: 2,
          ease: 'power3.out',
          delay: 0.6,
        })
        .to(
          document.querySelector('.progress-text'),
          {
            opacity: 0,
            duration: 0.5,
            ease: 'power1.out',
            delay: 0.6,
          },
          '<',
        )
        .to(document.querySelectorAll(".brick"), {
          duration: .6,
          rotate: "45deg",
          scale: 0,
          borderRadius: "1%",
          // backgroundColor: '#9be1f3',
          // "--color": '#71dcf7',
          // "--blur": "100px",
          stagger: {
            grid: 'auto',
            from: isMobile() ? progress.count - 1 : 4 * progress.count,
            amount: .5,
          },
          y: '-50%',
          x: '50%',
          opacity: .8,
          onComplete: () => {
            window.removeEventListener("resize", progress.handleResize)
          },
        }, "<+0.3")
      setTimeout(() => {
        if (appStore.show_loading) appStore?.show_loading()
        appStore.show_scroll_page?.()
      }, 1300)
    }
  },
)
</script>
<style lang="scss">
.bricks {
  pointer-events: none;
  user-select: none;
  // background-color: red;
  display: grid;
  filter: blur(1px);

  grid-template-rows: repeat(5, 1fr);

  @media screen and (max-aspect-ratio : 1/1) {
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: 1fr;
  }

  .brick-rows {
    display: flex;

    @media screen and (max-aspect-ratio: 1/1) {
      flex-direction: column;
    }

    .brick {
      color: #9be1f3;
      --color: #fff;
      --blur: 10px;
      box-shadow: 1px 1px var(--blur) var(--color), -1px -1px var(--blur) var(--color);
      // border: 1px solid #fff;
      background-color: #eee;
      width: auto;
      height: 100%;
      aspect-ratio: 1;

      @media screen and (max-aspect-ratio : 1/1) {
        height: auto;
        // background-color: red;
      }
    }
  }

}
</style>
<style lang="scss" scoped>
.progress-container {
  display: flex;
  flex-direction: column;
  position: absolute;
  left: 0;
  bottom: 0;
  padding: 2rem;

  .progress {
    p {
      font-size: 2rem;
    }

    width: 30rem;
    padding: 1rem 0;

    // background-color: #fff;
    &.hide {
      animation: 1s fadeout ease-out forwards;
    }
  }
}

.progress-n-welcome {
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.progress-text {
  overflow: hidden;
  // position: absolute;
  // left: 50%;
  // top: 50%;
  // transform: translate(-50%, -50%);
  transform: translateY(-3.2rem);

  &.complete {
    user-select: none;
  }

  p {
    position: relative;
  }

  p span {
    position: relative;
    font-size: 3rem;
    color: #fff;
    top: 3.2rem;
  }

  &.complete {
    p span {
      transition: top 0.5s ease-out;
      top: 0;
    }
  }
}

.progress-bar,
.progress-text {
  mix-blend-mode: difference;
}

.progress-bar {
  position: absolute;
  width: 50rem;
  background-color: #111;
  outline: 1px solid #fff;
  height: 2rem;
  border-radius: 1rem;
  // position: absolute;
  // left: 50%;
  // top: 50%;
  transform: scaleX(1) scaleY(1);
  transform-origin: center right;

  p span {
    color: #fff;
    font-size: 2rem;
  }

  &::after {
    position: absolute;
    content: '';
    left: 0;
    height: 2rem;
    border-radius: 1rem;
    width: calc(var(--progress) * 100%);
    background-color: #fff;
  }

  &.complete {
    transform: scaleX(1) scaleY(0.1);
    animation: shrinkright 0.3s 0.7s linear forwards;
    transition: transform 0.5s ease-in;
  }
}

@keyframes shrinkright {
  0% {
    transform: scaleX(1) scaleY(0.1);
  }

  100% {
    transform: scaleX(0) scaleY(0.1);
  }
}

@keyframes fadeout {
  0% {
    opacity: 1;
  }

  100% {
    display: none;
    opacity: 0;
  }
}
</style>
