<template>
  <div class="menu-min-container">
    <div class="bar"></div>
    <div class="buttons">
      <div class="list button" @click="menu.handleListButton">
        <svg-icon iconClass="more"></svg-icon>
      </div>
      <div class="play button" @click="menu.handlePlayButton">
        <svg-icon v-if="!menu.playing.value || menu.pause.value" iconClass="play"></svg-icon>
        <svg-icon v-else iconClass="pause"></svg-icon>
      </div>
      <div class="duration"
        :style="{ '--p': menu.duration.value == 0 ? 0 : (menu.current.value / menu.duration.value) }">
        <div class="label"></div>
      </div>
    </div>
  </div>
  <!-- <div class="menu-expand-container">
    <div class="song" v-for="song, i in menu.songs" :key="'song-' + i" :style="{ '--id': i }">
      <div class="cover">
        <svg width="180" height="180" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <clipPath id="small">
            <circle cx="50" cy="50" r="35"></circle>
          </clipPath>
          <circle cx="50" cy="50" r="50" fill="#000"></circle>
          <image x="10" y="10" :href="song.cover_url" width="80" height="80" clip-path="url(#small)"></image>
        </svg>
        <div class="text-content">
          <div class="name">
            《{{ song.name }}》
          </div>
          <div class="author">
            {{ song.author }}
          </div>
        </div>
      </div>
    </div>
  </div> -->
  <div class="card-container _fullscreen" @contextmenu="menu.closeexpand" v-show="menu.if_expand.value" :class="{ 'show': menu.if_expand.value }">
    <div class="card" v-for="song, i in menu.songs" :key="'song-' + i">
      <img :src="song.cover_url" alt="">
    </div>

  </div>

</template>
<script lang="ts" setup>
import { inject, nextTick, onMounted, onUnmounted, ref } from 'vue';
import type { Ref } from 'vue';
import Lenis from 'lenis';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
defineOptions({
  name: "MusicMenu",
})
interface MyTimeLine {
  tl?: gsap.core.Timeline,
  el: HTMLElement
}
const menu = {
  songs: [{
    'cover_url': 'http://localhost:8889/api/covers/jpg/cover.jpg',
    'source': '',
    'name': '17',
    'author': '椎名林檎',
    'album': '罪と罰',
  }, {
    'cover_url': 'http://localhost:8889/api/covers/jpg/17.jpg',
    'source': '',
    'name': 'クロノスタシス',
    'author': 'きのこ帝国',
    'album': 'フェイクワールドワンダーランド',
  }, {
    'cover_url': 'http://localhost:8889/api/covers/jpg/17.jpg',
    'source': '',
    'name': 'クロノスタシス',
    'author': 'きのこ帝国',
    'album': 'フェイクワールドワンダーランド',
  }, {
    'cover_url': 'http://localhost:8889/api/covers/jpg/17.jpg',
    'source': '',
    'name': 'クロノスタシス',
    'author': 'きのこ帝国',
    'album': 'フェイクワールドワンダーランド',
  }, {
    'cover_url': 'http://localhost:8889/api/covers/jpg/17.jpg',
    'source': '',
    'name': 'クロノスタシス',
    'author': 'きのこ帝国',
    'album': 'フェイクワールドワンダーランド',
  }, {
    'cover_url': 'http://localhost:8889/api/covers/jpg/17.jpg',
    'source': '',
    'name': 'クロノスタシス',
    'author': 'きのこ帝国',
    'album': 'フェイクワールドワンダーランド',
  }, {
    'cover_url': 'http://localhost:8889/api/covers/jpg/17.jpg',
    'source': '',
    'name': 'クロノスタシス',
    'author': 'きのこ帝国',
    'album': 'フェイクワールドワンダーランド',
  }, {
    'cover_url': 'http://localhost:8889/api/covers/jpg/17.jpg',
    'source': '',
    'name': 'クロノスタシス',
    'author': 'きのこ帝国',
    'album': 'フェイクワールドワンダーランド',
  }, {
    'cover_url': 'http://localhost:8889/api/covers/jpg/17.jpg',
    'source': '',
    'name': 'クロノスタシス',
    'author': 'きのこ帝国',
    'album': 'フェイクワールドワンダーランド',
  }, {
    'cover_url': 'http://localhost:8889/api/covers/jpg/17.jpg',
    'source': '',
    'name': 'クロノスタシス',
    'author': 'きのこ帝国',
    'album': 'フェイクワールドワンダーランド',
  }, {
    'cover_url': 'http://localhost:8889/api/covers/jpg/17.jpg',
    'source': '',
    'name': 'クロノスタシス',
    'author': 'きのこ帝国',
    'album': 'フェイクワールドワンダーランド',
  }, {
    'cover_url': 'http://localhost:8889/api/covers/jpg/17.jpg',
    'source': '',
    'name': 'クロノスタシス',
    'author': 'きのこ帝国',
    'album': 'フェイクワールドワンダーランド',
  }, {
    'cover_url': 'http://localhost:8889/api/covers/jpg/17.jpg',
    'source': '',
    'name': 'クロノスタシス',
    'author': 'きのこ帝国',
    'album': 'フェイクワールドワンダーランド',
  }, {
    'cover_url': 'http://localhost:8889/api/covers/jpg/17.jpg',
    'source': '',
    'name': 'クロノスタシス',
    'author': 'きのこ帝国',
    'album': 'フェイクワールドワンダーランド',
  }, {
    'cover_url': 'http://localhost:8889/api/covers/jpg/17.jpg',
    'source': '',
    'name': 'クロノスタシス',
    'author': 'きのこ帝国',
    'album': 'フェイクワールドワンダーランド',
  }, {
    'cover_url': 'http://localhost:8889/api/covers/jpg/17.jpg',
    'source': '',
    'name': 'クロノスタシス',
    'author': 'きのこ帝国',
    'album': 'フェイクワールドワンダーランド',
  }, {
    'cover_url': 'http://localhost:8889/api/covers/jpg/17.jpg',
    'source': '',
    'name': 'クロノスタシス',
    'author': 'きのこ帝国',
    'album': 'フェイクワールドワンダーランド',
  }, {
    'cover_url': 'http://localhost:8889/api/covers/jpg/17.jpg',
    'source': '',
    'name': 'クロノスタシス',
    'author': 'きのこ帝国',
    'album': 'フェイクワールドワンダーランド',
  }, {
    'cover_url': 'http://localhost:8889/api/covers/jpg/17.jpg',
    'source': '',
    'name': 'クロノスタシス',
    'author': 'きのこ帝国',
    'album': 'フェイクワールドワンダーランド',
  }, {
    'cover_url': 'http://localhost:8889/api/covers/jpg/17.jpg',
    'source': '',
    'name': 'クロノスタシス',
    'author': 'きのこ帝国',
    'album': 'フェイクワールドワンダーランド',
  }, {
    'cover_url': 'http://localhost:8889/api/covers/jpg/17.jpg',
    'source': '',
    'name': 'クロノスタシス',
    'author': 'きのこ帝国',
    'album': 'フェイクワールドワンダーランド',
  }, {
    'cover_url': 'http://localhost:8889/api/covers/jpg/17.jpg',
    'source': '',
    'name': 'クロノスタシス',
    'author': 'きのこ帝国',
    'album': 'フェイクワールドワンダーランド',
  }, {
    'cover_url': 'http://localhost:8889/api/covers/jpg/17.jpg',
    'source': '',
    'name': 'クロノスタシス',
    'author': 'きのこ帝国',
    'album': 'フェイクワールドワンダーランド',
  }, {
    'cover_url': 'http://localhost:8889/api/covers/jpg/17.jpg',
    'source': '',
    'name': 'クロノスタシス',
    'author': 'きのこ帝国',
    'album': 'フェイクワールドワンダーランド',
  }, {
    'cover_url': 'http://localhost:8889/api/covers/jpg/17.jpg',
    'source': '',
    'name': 'クロノスタシス',
    'author': 'きのこ帝国',
    'album': 'フェイクワールドワンダーランド',
  }, {
    'cover_url': 'http://localhost:8889/api/covers/jpg/17.jpg',
    'source': '',
    'name': 'クロノスタシス',
    'author': 'きのこ帝国',
    'album': 'フェイクワールドワンダーランド',
  }, {
    'cover_url': 'http://localhost:8889/api/covers/jpg/17.jpg',
    'source': '',
    'name': 'クロノスタシス',
    'author': 'きのこ帝国',
    'album': 'フェイクワールドワンダーランド',
  }, {
    'cover_url': 'http://localhost:8889/api/covers/jpg/17.jpg',
    'source': '',
    'name': 'クロノスタシス',
    'author': 'きのこ帝国',
    'album': 'フェイクワールドワンダーランド',
  }, {
    'cover_url': 'http://localhost:8889/api/covers/jpg/17.jpg',
    'source': '',
    'name': 'クロノスタシス',
    'author': 'きのこ帝国',
    'album': 'フェイクワールドワンダーランド',
  }, {
    'cover_url': 'http://localhost:8889/api/covers/jpg/17.jpg',
    'source': '',
    'name': 'クロノスタシス',
    'author': 'きのこ帝国',
    'album': 'フェイクワールドワンダーランド',
  }, {
    'cover_url': 'http://localhost:8889/api/covers/jpg/17.jpg',
    'source': '',
    'name': 'クロノスタシス',
    'author': 'きのこ帝国',
    'album': 'フェイクワールドワンダーランド',
  }],
  if_expand: ref(false),
  playing: inject('playing') as Ref<Boolean>,
  pause: inject('pause') as Ref<Boolean>,
  start: inject('start') as () => void,
  duration: inject('duration') as Ref<number>,
  current: inject('current') as Ref<number>,
  expandContainer: null as null | HTMLElement,
  lenis: null as null | Lenis,
  cards: null as null | NodeListOf<HTMLElement>,
  animator: null as null | gsap.core.Timeline,
  tls: [] as MyTimeLine[],
  handlePlayButton() {
    this.start()
  },
  handleListButton() {
    if (this.if_expand.value) {
      this.hide()
    } else {
      this.show()
    }
    // if (this.expandContainer?.classList.contains('show')) {
    //   this.expandContainer.classList.remove('show')
    //   this.if_expand.value = false
    // }
    // else {
    //   this.if_expand.value = true
    //   this.expandContainer?.classList.add('show')
    // }
  },
  closeexpand(e:Event) {
    e.preventDefault()
    this.hide()
  },
  init() {
    gsap.registerPlugin(ScrollTrigger)
    // this.expandContainer = document.querySelector('.menu-expand-container')
    this.expandContainer = document.querySelector('.card-container')
    this.cards = document.querySelectorAll('.card')
    if (menu.expandContainer) {
      menu.lenis = new Lenis({
        wrapper: menu.expandContainer,
        content: menu.expandContainer,
        orientation: 'horizontal',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1,
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      })
    }

    function raf(time: number) {
      menu.lenis?.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
    nextTick(() => {
      document.querySelectorAll(".card").forEach(c => {
        this.tls.push({
          el: c as HTMLElement
        })
      })
    })
  },
  show() {
    if (this.animator?.isActive()) return
    this.if_expand.value = true
    nextTick(() => {
      this.tls.forEach(tl => {
        if (tl.tl?.isActive()) tl.tl.kill()
        tl.tl = gsap.timeline({
          scrollTrigger: {
            trigger: tl.el,
            scroller: this.expandContainer,
            horizontal: true,
            scrub: true,
          }
        });
        tl.tl.to(tl.el, {
          scale: 1.5,
          ease: 'power1.out',
          zIndex: 10,
        }).to(tl.el, {
          scale: .8,
          zIndex: 0,
          ease: 'power1.in',
        });
      })
      this.animator = gsap.timeline().fromTo(this.cards, {
        opacity: 0
      }, {
        opacity: 1,
        ease: "power3.out",
      })
    })

  },
  hide() {
    if (this.animator?.isActive()) return
    this.tls.forEach(tl => {
      tl.tl?.kill()
    })
    this.animator = gsap.timeline().to(this.cards, {
      scale: .8,
      opacity: 0,
      ease: "power3.in"
    }).to(this.cards, {
      scale: 1,
      duration: 0,
      onComplete: () => {
        this.if_expand.value = false
      }
    })
  }
}
onMounted(() => {
  menu.init()
  // menu.expandContainer?.addEventListener("wheel", menu.handleScroll)
})
onUnmounted(() => {
  menu.lenis?.destroy()
  ScrollTrigger.getAll().forEach(st => st.kill())
  // menu.expandContainer?.removeEventListener("wheel", menu.handleScroll)
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

@keyframes expand {
  0% {
    width: 200px;
    background-color: rgba($color: #fff, $alpha: 0);
  }

  20% {
    width: 200px;
    background-color: rgba($color: #fff, $alpha: 0);
  }

  100% {
    width: 500px;
    background-color: rgba($color: #fff, $alpha: 0);
    // background-color: blue;
  }
}

.menu-expand-container {
  overflow: scroll;
  z-index: 11;
  height: 100dvh;
  width: 100vw;
  position: absolute;
  left: 0;
  transform: translateY(-100dvh);
  background-color: rgba($color: #000000, $alpha: .5);
  backdrop-filter: blur(5px);
  display: grid;
  grid-template-rows: repeat(3, 1fr);
  direction: ltr;
  grid-auto-flow: column;
  // flex-direction: column;
  padding: 50px;
  clip-path: polygon(0 0, 100% 0, 100% 0%, 0 50%);
  transition: clip-path .3s .5s linear, transform .3s .5s ease-in;

  // border-radius: 0 0 50px 50px;
  .song {
    display: flex;
    padding-top: 50px;

    // !!out!!
    .cover {
      transform: translateX(-100px);
      height: 190px;
      width: 200px;
      transition:
        opacity linear .3s calc(.2s + var(--id) * .1s),
        transform ease-out .5s calc(.15s + var(--id) * .1s);
      display: flex;
      align-items: center;
      padding-left: 6px;
      opacity: 0;

      .text-content {
        width: 900px;
        height: 180px;
        margin-left: 20px;
        padding-left: 20px;
        transform: translateX(10px);
        position: absolute;
        left: 200px;
        top: 0;
        display: flex;
        flex-direction: column;
        transition:
          opacity .2s linear,
          transform .2s ease-in;

        // !!out!!
        .name {
          font-size: 3rem;
          color: #fff;
          opacity: 0;
          transform: translateX(10px);
          transition: opacity .2s linear;
        }

        .author {
          font-size: 2rem;
          color: #fff;
          opacity: 0;
          transform: translateX(10px);
          transition: opacity .2s linear;
        }

        &::before {
          content: "";
          height: 20%;
          opacity: 0;
          width: 1px;
          background-color: #fff;
          position: absolute;
          left: 0;
          top: 0;
          transition:
            opacity .2s linear,
            height .2s ease-in,
            transform .2s ease-in;
        }
      }
    }

  }

  &.show {
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
    transform: translateY(0dvh);
    transition:
      clip-path .2s linear,
      transform .2s ease-out;

    .song:nth-child(3n+2) {
      transform: translateX(100px);
    }

    // border-radius: 0;
    .song:hover {

      // transform: translateX(0);
      .cover {
        width: 500px;
        transition: width .4s .1s ease-out;
        // animation: expand 1s forwards;

        .text-content {
          transform: translateX(0px);
          transition: transform .2s .2s ease-out;

          &::before {
            transform: translateX(0);
            opacity: 1;
            height: 100%;
            transition:
              opacity .2s .2s linear,
              height .2s .2s ease-out,
              transform .2s .2s ease-out;
          }

          .name {
            opacity: 1;
            transform: translateX(0);
            transition:
              opacity .2s .4s linear,
              transform .2s .4s ease-out;
          }

          .author {
            opacity: 1;
            transform: translateX(0);
            transition: opacity .3s .5s linear,
              transform .3s .4s ease-out;

          }
        }
      }
    }

    // width !!out
    .song .cover {
      opacity: 1;
      transform: translateX(0);
      transition:
        width .5s .5s ease,
        opacity .3s calc(.2s + var(--id) * .1s) linear,
        transform ease-out .5s calc(.15s + var(--id) * .1s);
      cursor: pointer;

      background-color: rgba($color: #000, $alpha: 0);
      border-radius: 100px;

    }
  }
}

.menu-min-container {
  position: absolute;
  height: 110px;
  width: 800px;
  // background-color: red;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  // background-color: red;
  // padding-bottom: 20px;
  z-index: 20;
  // background-color: red;

  .bar {
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
    width: 800px;
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
      // border-radius: 50%;
      background-color: transparent;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
      // box-shadow: .5px .5px 1px #fff inset;

      .svg-icon {
        width: 30%;
        height: 30%;
      }

      &.list {
        .svg-icon {
          width: 50%;
          height: 50%;
        }
      }

      &:hover {
        .svg-icon {
          scale: 1.1;
          transition: scale .2s cubic-bezier(0.52, 0.52, 0.17, 1.26);
        }

      }
    }

    .duration {
      flex-shrink: 0;
      width: 600px;
      height: 10px;
      background-color: #ccc;
      border-radius: 5px;
      position: relative;
      background: linear-gradient(to right,
          rgba($color: #71dcf7, $alpha: .3) calc(var(--p) * 100% + 7.5px),
          rgba($color: #fff, $alpha: .5) calc(var(--p) * 100% + 7.5px));

      .label {
        // content: "";
        position: absolute;
        // height: 22.5px;
        // width: 15px;
        // background: linear-gradient(to right,
        //     #111 0%,
        //     rgba($color: #fff, $alpha: .1) 50%);
        // filter: drop-shadow(0px 0px 5px#111);
        // top: -22.5px;
        // clip-path: polygon(100% 0, 100% 60%, 50% 100%, 0 60%, 0 0);
        // box-shadow: 0 4px 1px #fff inset, 0 5px 1px #111 inset;
        width: 15px;
        height: 15px;
        top: -2.5px;
        border-radius: 50%;
        z-index: 10;
        background-color: #fff;
        left: calc(var(--p) * 100%);
        // cursor: grab;
        animation: shine infinite 1s ease-in-out;

        &:hover {
          scale: 1.2;
          transition: scale .2s linear;
        }

        transition: scale .2s linear;
      }

      // &::before {
      //   content: "";
      //   position: absolute;
      //   background-color: #fff;
      //   height: 26.5px;
      //   width: 19px;
      //   top: -22.5px;
      //   // clip-path: polygon(50% 0, 100% 40%, 100% 100%, 0 100%, 0 40%);
      //   clip-path: polygon(100% 0, 100% 60%, 50% 100%, 0 60%, 0 0);
      //   transform: translate(-2px,-2px);
      // }
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

  // background-color: red;
  display: flex;
  overflow: scroll;
  align-items: center;
  padding: 0 20%;

  .card {
    opacity: 0;
    flex-shrink: 0;
    width: 300px;
    aspect-ratio: 1;
    border-radius: 10px;
    overflow: hidden;
    border: 2px solid #eee;
    box-shadow: 0 0 10px rgba($color: #000000, $alpha: .5);

    img {
      width: 100%;
      height: 100%;
    }

    &:hover {
      z-index: 10;
    }
  }

  &.show {
    backdrop-filter: blur(3px);
    transition: backdrop-filter .2s linear;
  }
}
</style>
