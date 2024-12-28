<script setup lang="ts">
import { onMounted } from 'vue'
onMounted(() => {
    const video1 = document.querySelector("#video1") as HTMLVideoElement;
    const video2 = document.querySelector("#video2") as HTMLVideoElement;
    function handleResize() {
        const height = document.documentElement.clientHeight;
        const width = document.documentElement.clientWidth;
        var proportion = 1;
        if (height / width > 1080 / 1920) {
            proportion = height / 1080;
            video1.style.top = '0';
            video2.style.top = '0';
        } else {
            proportion = width / 1920;
            video1.style.top = -(proportion * 1080 - height) / 2 + 'px';
            video2.style.top = -(proportion * 1080 - height) / 2 + 'px';
        }
        video1.style.height = proportion * 1080 + 'px';
        video1.style.width = proportion * 1920 + 'px';
        video2.style.height = proportion * 1080 + 'px';
        video2.style.width = proportion * 1920 + 'px';
    }
    function handleLoadVideo() {
        handleResize();
        setTimeout(() => {
            video1.play();
            setTimeout(() => {
                video1.style.opacity = "0";
                video2.play();
            }, 6000);
        }, 2250);
    }
    window.addEventListener("resize", handleResize);
    window.addEventListener("load", handleLoadVideo);
})

</script>
<template>
    <section class="fv">
        <h1 class="title-logo">
            <img src="../../assets/img/logo.svg" alt="">
            <img src="../../assets/img/logo2.svg" alt="">
        </h1>
        <div class="fv-movie">
            <video id="video1" preload="auto" muted>
                <source src="../../assets/video/start.mp4" type="video/mp4">
            </video>
            <video id="video2" preload="auto" muted loop>
                <source src="../../assets/video/end.mp4" type="video/mp4">
            </video>
        </div>
        <div class="fv-overlay">
            <!-- <img src="../../assets/img/layout2.webp" alt=""> -->
            <img src="../../assets/img/layout.webp" alt="">
        </div>
        <div class="scroll-box">
            <div class="scroll-text">SCROLL</div>
        </div>
    </section>
</template>
<style scoped>
.fv-overlay {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: -8%;
    overflow: hidden;
}

.fv-overlay img {
    width: 100%;
    height: 100%;
    mix-blend-mode: screen;
    user-select: none;
}

.fv {
    height: 100vh;
    display: block;
}

.fv .fv-movie {
    height: 100%;
    width: 100%;
    position: absolute;
    left: 0;
    top: 0;
    overflow: hidden;
    z-index: -1;
}

.fv-movie video {
    position: absolute;
    left: 0;
}

.fv-movie #video1 {
    z-index: 2;
}

.title-logo {
    display: block;
    width: 137px;
    height: 96px;
    position: absolute;
    top: 73px;
    left: 51px;
    z-index: 100;
}

.title-logo img {
    height: 100%;
    width: 100%;
}

.title-logo img:nth-child(1) {
    display: none;
}

.scroll-box {
    position: absolute;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
}

.scroll-text {
    font-size: 10px;
    color: #fff;
    margin-bottom: 5px;
    font-family: Syncopate, sans-serif;
}

.scroll-text::after {
    content: '';
    position: absolute;
    top: 15px;
    left: 0;
    right: 0;
    margin: auto;
    width: 1px;
    height: 30px;
    background-color: #fff;
    animation: pathmove 1.4s ease-in-out infinite;
    opacity: 0;
}

@keyframes pathmove {
    0% {
        height: 0;
        top: 15px;
        opacity: 0;
    }

    30% {
        height: 30px;
        opacity: 1;
    }

    100% {
        height: 0;
        top: 65px;
        opacity: 0;
    }
}
</style>