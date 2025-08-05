<template>
  <div class="nav-container">
    <MyButton id="discover">
      <div class="button-content" @click="appStore.diagram_to_menus">discover</div>
    </MyButton>
    <MyButton id="collect"><div class="button-content">collect</div></MyButton>
    <MyButton id="sound"> <div class="button-content">s</div> </MyButton>
    <MyButton id="info"><div class="button-content">i</div></MyButton>
  </div>
</template>
<script lang="ts" setup>
defineOptions({
  name: 'NavBar',
})
import { computed, onMounted, ref } from 'vue'
import NavItem from './NavItem.vue'
import { useUserStore, useAppStore } from '@/pinia'
import router from '@/router'
import MyButton from '@/components/ui/btn.vue'
import gsap from 'gsap'

const userStore = useUserStore()
const appStore = useAppStore()
let CheckLogin = userStore.isLoggedIn

const nav = {
  if_visible: ref(false),
  container: null as null | HTMLElement,
  animator: null as gsap.core.Timeline | null,
  discover: null as HTMLElement | null,
  collect: null as HTMLElement | null,
  init: () => {
    nav.container = document.querySelector('.nav-container')
    nav.discover = document.querySelector('#discover')
    nav.collect = document.querySelector('#collect')
  },
  show: () => {
    nav.animator = gsap
      .timeline()
      .to(nav.discover, {
        y: '0',
        duration: 0.5,
        ease: 'power3.out',
      })
      .to(
        nav.collect,
        {
          y: '0',
          duration: 0.5,
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
        duration: 0.5,
        ease: 'power3.out',
      })
      .to(
        nav.collect,
        {
          y: '-6rem',
          duration: 0.5,
          ease: 'power3.out',
        },
        '<',
      )
  },
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
})
</script>
<style lang="scss" scoped>
.nav-container {
  width: 100%;
  // background-color: rgba(255, 255, 255, 0.3);
  position: fixed;
  // box-shadow: 1px 1px 20px rgba(0, 0, 0, 0.2);
  display: flex;
  gap: 1rem;
  padding: 1rem 1rem;
  .mybutton {
    color: var(--white);
    // position: absolute;

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

    &:nth-child(1) {
      top: 2rem;
      left: 2rem;
      .button-content::before {
        content: '<';
        font-family: cursive;
        font-weight: bolder;
        font-size: 1.7rem;
        left: -2rem;
        top: 0;
        transition: ease-in-out 0.2s;
      }
      &:hover {
        .button-content::before {
          transform: translateX(-0.6rem);
          transition: ease-in-out 0.2s;
        }
      }
    }
    &:nth-child(2) {
      left: 14rem;
      top: 2rem;
      .button-content::after {
        content: '↗';
        font-size: 2.3rem;
        transition: ease-in-out 0.2s;
      }
      &:hover {
        .button-content::after {
          transform: translate(0.3rem, -0.3rem);
          transition: ease-in-out 0.2s;
        }
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

@media screen and (max-width: 1280px) {
}

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
