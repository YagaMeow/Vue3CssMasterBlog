<template>
    <div class="login-container _fullscreen" v-show="login.is_visible.value">
        <div class="mask _fullscreen" @click="login.hide"></div>
        <div class="login-content" @keydown.enter="login.login">
            <div class="title"></div>
            <div class="username">
                <div class="label" style="--r:3deg">
                    <span>Username</span>
                </div>
                <div>
                    <input type="text" v-model="login.username.value" />
                </div>
            </div>
            <div class="password">
                <div class="label" style="--r:-3deg">
                    <span>Password</span>
                </div>
                <div>
                    <input type="password" v-model="login.password.value">
                </div>

            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { onMounted } from 'vue';
import gsap from 'gsap';
import { useAppStore, useUserStore } from '@/pinia';
import { elasticEase2 } from '@/utils/utils';
import { ref } from 'vue';
gsap.registerEase('myEase', elasticEase2)
const appStore = useAppStore()
const userStore = useUserStore()

const login = {
    is_visible: ref(false),
    animator: null as null | gsap.core.Timeline,
    container: null as HTMLElement | null,
    username: ref(""),
    password: ref(""),
    init() {
        this.container = document.querySelector('.login-content')
    },
    show() {
        if (this.animator?.isActive()) {
            return
        }
        this.is_visible.value = true
        this.animator = gsap.timeline().to(
            this.container, {
            x: 0,
            duration: 1,
            ease: 'power3.out'
        }
        ).to(this.container,{
            rotate: 5,
            duration: 1.5,
            ease: 'power4.out'
        },"<0.1")
    },
    hide() {
        if (this.animator?.isActive()) {
            this.animator.kill()
        }
        console.log('hide login')
        this.animator = gsap.timeline().to(
            this.container, {
            x: '100rem',
            rotate: -5,
            duration: .5,
            ease: 'power4.in',
            onComplete: () => {
                this.is_visible.value = false
            }
        }
        ).to(this.container, {
            x: '-100rem',
            rotate: 15,
            duration: 0
        })
    },
    async login() {
        await userStore.LoginIn({
            username: this.username.value,
            password: this.password.value
        }).then(() => {
            login.hide()
        })
    }
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

    .login-content {
        transform: translateX(-100rem) rotate(15deg);
        width: 50rem;
        height: 30rem;
        border-radius: 2rem;
        box-shadow: .1rem .1rem inset #fff;
        background: #000;
        display: grid;
        grid-template-rows: repeat(3, minmax(0, 1fr));
        padding: 1rem 0;

        .title {
            display: flex;
            align-items: center;
            justify-content: center;

            &::after {
                content: "Login";
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

            >div {
                position: relative;
                margin-left: 1rem;

                &::after {
                    content: "";
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
                    transition: transform .2s ease-out;
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
                    margin-right: .3rem;
                    padding: 0.1rem;
                }

            }

        }


    }
}
</style>