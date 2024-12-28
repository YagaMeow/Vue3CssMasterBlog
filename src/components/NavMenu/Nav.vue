<script setup>
import { computed, ref } from 'vue'
const menu_list = [
    'features',
    'game_system',
    'character',
    'dlc',
    'expansion_pass'
]
</script>
<template>
    <nav class="nav-box">
        <ul class="nav">
            <li v-for="(name,idx) in menu_list">
                <a href="">
                    <img :src="`../../../public/img/${name}.svg`" :alt="name">
                </a>
            </li>
        </ul>
        <div class="news">
            <a href="" title="NEWS">NEWS</a>
        </div>
        <div class="lang-box">
            <a href="#">

            </a>
        </div>
    </nav>

</template>

<style scoped>
.news {
    position: absolute;
    top: -12px;
    padding: 13px;
    font-size: 14px;
    right: -67px;
}

.news a {
    text-decoration: none;
    cursor: pointer;
    outline: none;
    color: #1d384a;
}

.news a::after {
    content: "";
    display: block;
    position: absolute;
    height: 18px;
    width: 1px;
    top: 11px;
    background-color: #1d384a;
    right: 0
}

.nav-box {
    position: absolute;
    width: 100%;
    top: 45px;
    right: 110px;
    z-index: 99;
}
.nav {
    display: flex;
    justify-content: flex-end;
    align-items: stretch;
}

.nav li {
    list-style: none;
    margin-right: 10px;
}

.nav li a {
    display: block;
    text-decoration: none;
    font-family: Urbanist,Noto Sans JP;
}

.nav li:nth-child(1) a {
    width: 72px;
    transform: translateY(-2px);
}

.nav li:nth-child(2) a {
    width: 124px;
}

.nav li:nth-child(3) a{
    width: 88px;
    transform: translateY(-2px);
}

.nav li:nth-child(4) a{
    width: 29px;
    transform: translateY(-2px);
}

.nav li:nth-child(5) a{
    width: 130px;
}

.nav li:last-child {
    margin-right: 0;
}

img {
    width: 100%;
    margin: 0;
    padding: 0;
    font: inherit;
    font-size: 100%;
    vertical-align: baseline;
}
</style>