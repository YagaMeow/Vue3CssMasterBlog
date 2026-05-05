<template>
  <div class="login-container _fullscreen" v-show="login.is_visible.value">
    <div class="mask _fullscreen" @click="login.hide"></div>
    <div class="login-content" @keydown.enter="login.login">
      <!-- <div class="logout-card"></div> -->
      <div class="title"></div>
      <div class="username">
        <div class="label" style="--r: 3deg">
          <span>Username</span>
        </div>
        <div>
          <input type="text" v-model="login.username.value" />
        </div>
      </div>
      <div class="password">
        <div class="label" style="--r: -3deg">
          <span>Password</span>
        </div>
        <div>
          <input type="password" v-model="login.password.value" />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted } from 'vue'
import gsap from 'gsap'
import { useAppStore, useUserStore } from '@/pinia'
import { elasticEase2 } from '@/utils/utils'
import { ref } from 'vue'
gsap.registerEase('myEase', elasticEase2)
const appStore = useAppStore()
const userStore = useUserStore()

defineOptions({
  name: 'LoginCard',
})

const login = {
  is_visible: ref(false),
  animator: null as null | gsap.core.Timeline,
  container: null as HTMLElement | null,
  content: null as HTMLElement | null,
  username: ref(''),
  password: ref(''),
  init() {
    this.content = document.querySelector('.login-content')
    // this.container = document.querySelector('.login-container')
  },
  show() {
    if (this.animator?.isActive()) {
      return
    }
    this.content?.classList.add('show')
    appStore.login_tab = true
    this.is_visible.value = true
    this.animator = gsap
      .timeline()
      .to(this.content, {
        x: 0,
        duration: 0.5,
        ease: 'power1.out',
      })
      .to(
        this.content,
        {
          rotate: 5,
          duration: 1.5,
          ease: 'power4.out',
          onComplete: () => {
            this.content?.classList.remove('show')
          },
        },
        '<0.1',
      )
  },
  hide() {
    if (this.animator?.isActive()) {
      return
    }
    console.log('hide login')
    this.animator = gsap
      .timeline()
      .to(this.content, {
        x: '100vw',
        rotate: -5,
        duration: 0.5,
        ease: 'power1.in',
        onComplete: () => {
          this.is_visible.value = false
        },
      })
      .to(this.content, {
        x: '-100vw',
        rotate: 15,
        duration: 0,
        onComplete: () => {
          appStore.login_tab = false
        },
      })
  },
  async login() {
    await userStore
      .LoginIn({
        username: this.username.value,
        password: this.password.value,
      })
      .then(() => {
        login.hide()
        login.password.value = ''
      })
      .catch((e) => {
        if (appStore.notify) appStore.notify(e.message)
      })
  },
}
appStore.show_login = login.show.bind(login)
appStore.hide_login = login.hide.bind(login)
onMounted(() => {
  login.init()
})
</script>
<style scoped lang="scss">
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;

  @keyframes myrotate {
    0% {
      transform: rotate(0);
    }
    100% {
      transform: rotate(10deg);
    }
  }

  .login-content {
    display: grid;
    grid-template-rows: repeat(3, minmax(0, 1fr));
    padding: 1rem 0;
    transform: translateX(-100rem) rotate(15deg);
    width: 50rem;
    height: 30rem;
    &.show::after {
      animation: myrotate 1s ease-in-out forwards;
    }

    &::before,
    &::after {
      user-select: none;
      pointer-events: none;
      content: '';
      width: 50rem;
      height: 30rem;
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      transition: all 0.1s ease-out;
      border-radius: 2rem;
      box-shadow: 0.1rem 0.1rem inset #fff;
    }

    &::before {
      background-color: rgba($color: #000000, $alpha: 0.9);
    }

    &::after {
      z-index: -1;
      background-color: #eee;
      transform: rotate(10deg);
      transition: transform 0.2s ease;
    }

    @keyframes elastic {
      0% {
        scale: 1;
      }

      50% {
        scale: 1.02;
      }

      100% {
        scale: 1;
      }
    }

    &:hover::before {
      width: 50rem;
      height: 30rem;
      animation: elastic 0.4s cubic-bezier(0.175, 1, 0.5, 1.5);
    }

    &:hover::after {
      transform: rotate(13deg);
      transition: transform 0.5s ease;
    }


    .title {
      display: flex;
      align-items: center;
      justify-content: center;

      &::after {
        content: 'Login';
        font-size: 5rem;
        font-weight: bold;
        letter-spacing: 0.2rem;
        color: var(--white);
        transform: rotate(-5deg);
      }

      flex-basis: 10rem;
    }

    .username {
      input {
        letter-spacing: 0.1rem !important;
      }
    }

    .username,
    .password {
      padding: 0 4rem;

      display: grid;
      align-items: center;
      grid-template-columns: 1fr minmax(0, 2.5fr);

      > div {
        position: relative;
        margin-left: 1rem;

        &::after {
          content: '';
          display: block;
          width: 100%;
          height: 0.1rem;
          position: absolute;
          background-color: #fff;
          transform: scaleX(0);
        }

        &:focus-within::after {
          transform: scaleX(1);
          transform-origin: center;
          transition: transform 0.2s ease-out;
        }

        input {
          caret-shape: underscore;
          caret-color: #fff;
          color: #fff;
          letter-spacing: 1rem;

          font-size: 2rem;
          width: 100%;
          height: 4rem;
          background: transparent;
          display: block;
          border: none;

          &:focus {
            outline: none;
          }
        }
      }

      .label {
        span {
          color: #fff;
          font-size: 2rem;
          transform-origin: right;
        }

        transform: rotate(var(--r));

        &::first-letter {
          font-size: 3rem;
          color: #000;
          font-weight: bold;
          background-color: #fff;
          margin-right: 0.3rem;
          padding: 0.1rem;
        }
      }
    }
  }
}
</style>
