<template>
  <div class="nav-container" v-show="nav.if_visible.value">
    <MyButton id="discover">
      <div class="button-content" @click="appStore.posts_to_menus">discover</div>
    </MyButton>
    <MyButton id="collect">
      <div class="button-content" @click="nav.handleCollect">collect</div>
    </MyButton>
    <MyButton id="sound">
      <div class="button-content">
        <svg-icon iconClass="volumeHigh"></svg-icon>
      </div>
    </MyButton>
    <MyButton id="info">
      <div class="button-content">i</div>
    </MyButton>
    <MyButton id="login" @click="appStore.show_login">
      <div class="button-content">L</div>
    </MyButton>
  </div>
  <div class="nav-container footer" v-show="nav.if_visible.value">
    <div id="type" style="">
      <div class="type-list">
        <div class="type-list-items">
          <label class="type-list-item" for="">
            <div>test</div>
            <input type="checkbox">
          </label>
        </div>
        <div class="type-list-items">
          <label class="type-list-item" for="">
            <div>test</div>
            <input type="checkbox">
          </label>
        </div>
        <div class="type-list-items">
          <label class="type-list-item" for="">
            <div>test</div>
            <input type="checkbox">
          </label>
        </div>
        <div class="type-list-items">
          <label class="type-list-item" for="">
            <div>test</div>
            <input type="checkbox">
          </label>
        </div>
      </div>
      <div class="button-content">
        <span>type</span>
        <div class="plus">
          <div class="row"></div>
          <div class="col"></div>
        </div>
      </div>
    </div>
    <div id="date">
      <div class="date-list">
        <div class="date-list-items">
          <label class="date-list-item" for="">
            <div>test</div>
            <input type="checkbox">
          </label>
        </div>
      </div>
      <div class="button-content">
        <span>date</span>
        <div class="plus">
          <div class="row"></div>
          <div class="col"></div>
        </div>
      </div>
    </div>
    <MyButton id="layout" class="group">
      <div class="button-content">
        <svg-icon iconClass="layout1" @click="nav.switch(0)"></svg-icon>
        <svg-icon iconClass="layout2" @click="nav.switch(1)"></svg-icon>
        <svg-icon iconClass="layout3" @click="nav.switch(2)"></svg-icon>
      </div>
    </MyButton>
  </div>
</template>
<script lang="ts" setup>
defineOptions({
  name: 'NavBar',
})
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useUserStore, useAppStore } from '@/pinia'
import router from '@/router'
import MyButton from '@/components/ui/btn.vue'
import gsap from 'gsap'
import SvgIcon from '../SvgIcon.vue'
import { elasticEase, elasticEase2 } from '@/utils/utils'
gsap.registerEase('myEase', elasticEase)
gsap.registerEase('myEase2', elasticEase2)

const userStore = useUserStore()
const appStore = useAppStore()
let CheckLogin = userStore.isLoggedIn

const nav = {
  if_visible: ref(false),
  layout_type: 0,
  container: null as null | HTMLElement,
  footer: null as null | HTMLElement,
  slider: null as null | HTMLElement,
  animator: null as gsap.core.Timeline | null,
  discover: null as HTMLElement | null,
  collect: null as HTMLElement | null,
  type: null as HTMLElement | null,
  type_list: null as HTMLElement | null,
  type_after: null as HTMLElement | null,
  date: null as HTMLElement | null,
  date_list: null as HTMLElement | null,
  date_after: null as HTMLElement | null,
  init: () => {
    nav.container = document.querySelector('.nav-container')
    nav.discover = document.querySelector('#discover')
    nav.collect = document.querySelector('#collect')
    nav.footer = document.querySelector('.footer')
    nav.slider = document.querySelector('#layout .button-content')
    nav.type = document.querySelector('#type .button-content')
    nav.type_list = document.querySelector('#type .type-list')
    nav.type_after = document.querySelector('#type .button-content .plus')
    nav.date = document.querySelector('#date .button-content')
    nav.date_list = document.querySelector('#date .date-list')
    nav.date_after = document.querySelector('#date .button-content .plus')
  },
  show: () => {
    nav.if_visible.value = true
    nav.animator = gsap
      .timeline()
      .to(nav.discover, {
        y: '0',
        duration: 0.2,
        ease: 'power3.out',
      })
      .to(
        nav.collect,
        {
          y: '0',
          duration: 0.2,
          ease: 'power3.out',
        },
        '<',
      )
      .to(
        nav.footer,
        {
          y: 0,
          duration: 0.2,
          ease: 'power3.out',
        },
        '<',
      )
  },
  hide: (immediate: () => void, next: () => void) => {
    if (nav.animator?.isActive()) {
      return
    }
    if (immediate) immediate()
    nav.animator = gsap
      .timeline()
      .to(nav.discover, {
        y: '-6rem',
        duration: 0.2,
        ease: 'power3.in',
      })
      .to(
        nav.collect,
        {
          y: '-6rem',
          duration: 0.2,
          ease: 'power3.in',
        },
        '<',
      )
      .to(
        nav.footer,
        {
          y: '6rem',
          duration: 0.2,
          ease: 'power3.in',
          onComplete: () => {
            nav.if_visible.value = false
          }
        },
        '<',
      )
  },
  switch(type: number) {
    const change = type !== nav.layout_type
    gsap.timeline().to(nav.slider, {
      '--type': type,
      duration: 0.2,
      ease: 'myEase',
    })
    if (type === 0) {
      if (nav.layout_type === 1) appStore.masonry_to_diagram()
      if (nav.layout_type === 2) appStore.list_to_diagram()
    } else if (type === 1) {
      if (nav.layout_type === 0) appStore.diagram_to_masonry()
      if (nav.layout_type === 2) appStore.list_to_masonry()
    } else if (type === 2) {
      if (nav.layout_type === 0) appStore.diagram_to_list()
      if (nav.layout_type === 1) appStore.masonry_to_list()
    }
    nav.layout_type = type
    appStore.layout_type = type
    appStore.audio_controller.stopAll()
    appStore.audio_controller.switchlayout.play()
  },
  handleCollect() {
    appStore.edit_mode = true
    appStore.show_tab?.()
  },
  handleTypeFilter() {

    if (nav.type?.classList.contains('expand')) {
      appStore.audio_controller.leavemenubutton.play()
      nav.type.classList.remove('expand')
      gsap.timeline().to(nav.type_list, {
        height: 0,
        duration: .2,
        ease: "power1.out"
      }).to(nav.type_after, {
        rotate: -90,
        duration: .2,
        ease: "myEase2"
      }, "<").to(nav.type_after?.querySelector('.row') as Element, {
        opacity: 1,
        duration: .2
      }, "<")
    }
    else {
      appStore.audio_controller.entermenubutton.play()
      nav.type?.classList.add("expand")
      gsap.timeline().to(nav.type_list, {
        height: 'auto',
        duration: .2,
        ease: "power1.out"
      }).to(nav.type_after, {
        rotate: 90,
        duration: .2,
        ease: "myEase2"
      }, "<").to(nav.type_after?.querySelector('.row') as Element, {
        opacity: 0,
        duration: .2
      }, "<")
    }
  },
  handleDateFilter() {
    if (nav.date?.classList.contains('expand')) {
      appStore.audio_controller.leavemenubutton.play()
      nav.date.classList.remove('expand')
      gsap.timeline().to(nav.date_list, {
        height: 0,
        duration: .2,
        ease: "power1.out"
      }).to(nav.date_after, {
        rotate: -90,
        duration: .2,
        ease: "myEase2"
      }, "<").to(nav.date_after?.querySelector('.row') as Element, {
        opacity: 1,
        duration: .2
      }, "<")
    }
    else {
      appStore.audio_controller.entermenubutton.play()
      nav.date?.classList.add("expand")
      gsap.timeline().to(nav.date_list, {
        height: 'auto',
        duration: .2,
        ease: "power1.out"
      }).to(nav.date_after, {
        rotate: 90,
        duration: .2,
        ease: "myEase2"
      }, "<").to(nav.date_after?.querySelector('.row') as Element, {
        opacity: 0,
        duration: .2
      }, "<")
    }
  }
}
appStore.show_nav = nav.show.bind(nav)
appStore.hide_nav = nav.hide.bind(nav)

async function handleLogout() {
  userStore.Logout()

  CheckLogin = false

  router.push({
    path: '/',
    query: {
      date: new Date().getTime(),
    },
  })
}

onMounted(() => {
  nav.init()
  console.log(nav.type)
  nav.type?.addEventListener("click", nav.handleTypeFilter)
  nav.date?.addEventListener("click", nav.handleDateFilter)
})

onUnmounted(() => {
  nav.type?.removeEventListener("click", nav.handleTypeFilter)
  nav.date?.removeEventListener("click", nav.handleDateFilter)

})
</script>
<style lang="scss" scoped>
.nav-container {
  z-index: 999;
  width: 100%;
  // background-color: rgba(255, 255, 255, 0.3);
  position: fixed;
  // box-shadow: 1px 1px 20px rgba(0, 0, 0, 0.2);
  display: flex;
  gap: 1rem;
  padding: 1rem 1rem;

  .mybutton {
    color: var(--white);

    &#sound {
      margin-left: auto;
    }

    &#discover,
    &#collect {
      transform: translateY(-6rem);
    }

    .button-content {
      min-width: 2rem;
      margin: 0 1rem;
      font-size: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
    }

    &#discover {
      top: 2rem;
      left: 2rem;

      .button-content::before {
        content: '<';
        font-family: cursive;
        font-weight: bolder;
        font-size: 1.7rem;
        padding-left: 0.5rem;
        transition: transform ease-in-out 0.2s;
      }

      &:hover {
        .button-content::before {
          transform: translateX(-0.3rem);
          transition: transform ease-in-out 0.2s;
        }
      }
    }

    &#collect {
      left: 14rem;
      top: 2rem;

      .button-content::after {
        content: '↗';
        font-size: 2.3rem;
        transition: transform ease-in-out 0.2s;
      }

      &:hover {
        .button-content::after {
          transform: translate(0.15rem, -0.15rem);
          transition: transform ease-in-out 0.2s;
        }
      }
    }
  }

  &.footer {
    align-items: end;
    bottom: 1rem;
    left: 1rem;
    transform: translateY(6rem);

    #type,
    #date {
      user-select: none;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: end;
      background-color: rgba($color: #000, $alpha: 0.4);
      backdrop-filter: blur(0.1rem);
      border-radius: 1rem;
      box-shadow: inset 0px 1px #fff,
        inset 0px -1px #fff;

      * {
        font-size: 2rem;
        color: #fff;
      }

      .button-content {
        padding: 1rem;
        display: flex;
        align-items: center;

        .plus {
          margin-left: auto;
          position: relative;
          width: 1rem;
          height: 1rem;

          .row {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 1.5rem;
            height: 0.2rem;
            background-color: #fff;
          }

          .col {
            position: absolute;
            width: 1.5rem;
            height: 0.2rem;
            background-color: #fff;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(90deg);
            transform-origin: center;
          }
        }
      }

      .type-list,
      .date-list {
        height: 0;
        overflow: hidden;
      }

      .date-list-item,
      .type-list-item {
        display: flex;
        padding: 1rem;

        input {
          margin-left: auto;
        }
      }
    }

    .button-content {
      min-width: 20rem;
      justify-content: space-between;
    }

    #layout {
      margin-left: auto;
      margin-right: 2rem;
      position: relative;
      filter: none;

      .button-content {
        --type: 0;
        min-width: 0;
        gap: 0.5rem;
        margin: 0 0.5rem;

        &::after {
          content: '';
          display: block;
          position: absolute;
          left: calc(var(--type) * 3.5rem);
          width: 4rem;
          height: 4rem;
          border-radius: 1rem;
          background-color: rgba($color: #fff, $alpha: 0.2);
          mix-blend-mode: lighten;
        }
      }

      .svg-icon {
        width: 3rem;
        height: 3rem;
      }
    }
  }
}

.nav-container .pc {
  list-style: none;
  display: flex;
  margin-left: 100px;
  /* justify-content: center; */
  align-items: center;
}

.pc .login {
  margin-left: auto;
  margin-right: 50px;
  cursor: pointer;
}

.nav-icon {
  height: 1em;
  vertical-align: middle;
  transform: translateY(-0.1em);
}

@media screen and (max-width: 1280px) {}

@media screen and (max-width: 1024px) {
  .nav-container .pc {
    margin-left: 50px;
  }
}

@media screen and (max-width: 768px) {
  .nav-container .pc {
    margin-left: 0;
  }
}
</style>
