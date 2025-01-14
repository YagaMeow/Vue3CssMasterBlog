<script setup lang="ts">
import { useUserStore } from '@/pinia/modules/user';
import router from '@/router';
import axios from 'axios';
import { onMounted,ref } from 'vue';

interface FormData {
    username: '',
    password: ''
}

const form = ref<FormData>({
    username: '',
    password: ''
})

const userStore = useUserStore()
const login = async () => {
    return await userStore.LoginIn(form.value)
}

async function handleLogin() {
    const flag = await login()
    if(flag) {
        router.push('edit')
    }
}

</script>
<template>
    <div class="login-container">
        <div class="form-container">
            <h2 class="form-title">
                <span>Login</span>
            </h2>
            <form action="" class="form">
                <label for="">
                    <span>Username:</span>
                    <input type="text" v-model="form.username">
                </label>
                <label for="">
                    <span>Password:</span>
                    <input type="password" v-model="form.password">
                </label>
            </form>
            <button class="login-button" @click="handleLogin">
                Submit
            </button>
        </div>
    </div>
</template>
<style scoped>
.login-container {
    display: flex;
    height: 100vh;
    width: 100%;
    justify-content: center;
    align-items: center;
    background-color: #ecf0f3;
}

.form-container {
    background-color: #ecf0f3;
    width: 400px;
    height: 600px;
    border-radius: 18px;
    box-shadow: 18px 18px 30px #d1d9e6, -18px -18px 30px white;
    display: flex;
    justify-content: center;
    padding: 20px 40px;
    position: relative;
}

.form-title {
    position: absolute;
}

.form {
    display: flex;
    flex-direction: column;
    width: 100%;
    justify-content: space-around;
    margin-top: 50px;
    margin-bottom: 200px;
    position: relative;
}

.form label span {
    position: absolute;
    left: 0;
    font-size: 1.2rem;
}

.form label input {
    position: absolute;
    left: 100px;
    background-color: transparent;
    border: 0;
    border-bottom: 2px #fff solid;
    width: 200px;
    font-size: 1rem;
    padding: 0.25rem;
    font-family: Urbanist, Noto Sans JP;
}

.form label:nth-child(2) input {
    letter-spacing: 0.2em;
    font-weight: bolder;
}

.form label input:focus {
    outline: 0;
}


.login-button {
    cursor: pointer;
    position: absolute;
    width: 100px;
    height: 50px;
    bottom: 80px;
    right: 40px;
    background-color: transparent;
    border: 0;
    border-radius: 10px;
    box-shadow: -5px -5px 20px #fff inset,
        5px 5px 20px #d1d9e6 inset;
}

.login-button:hover {
    box-shadow: -5px -5px 5px #fff inset,
        5px 5px 5px #d1d9e6 inset;
}
</style>