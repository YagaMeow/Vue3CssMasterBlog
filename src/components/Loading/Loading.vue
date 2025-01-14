<script setup>
import WaveBox from './WaveBox.vue';
import LoadingText from './LoadingText.vue';

const props = defineProps({
    check: {
        type: Function
    }
})

function _out() {
    let container = document.querySelector("#loading")
    container.classList.add("run")
}

function _in(next) {
    let container = document.querySelector("#loading")
    container.classList.remove("run")
    setTimeout(() => {
        props.check()
        next()
    },1000)
}

defineExpose({
    _out,
    _in
})
</script>
<template>
    <div id="loading">
        <!-- <LoadingText></LoadingText> -->
        <div class="wavebox">
        <svg class="waves" viewBox="0 24 150 24" preserveAspectRatio="none">
            <defs>
                <path id="wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
            </defs>
            <g>
                <use class="wave" xlink:href="#wave" fill="rgba(2, 158, 235, 0.7)" x="48" y="0"></use>
                <use class="wave" xlink:href="#wave" fill="rgba(2, 158, 235, 0.5)" x="48" y="3"></use>
                <use class="wave" xlink:href="#wave" fill="rgba(2, 158, 235, 0.2)" x="48" y="5"></use>
                <use class="wave" xlink:href="#wave" fill="#029eeb" x="48" y="7"></use>
            </g>

        </svg>
    </div>
    </div>
</template>
<style scoped>
#loading {
    height: 100%;
    width: 100%;
    background-color: #fff;
    position: fixed;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    z-index: 999;
    overflow: visible;
    pointer-events: none;
    transition: background-color 1s ease;
}

#loading.run {
    background-color: transparent;
    transition: background-color 4s ease;
}

.wavebox {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #029eeb;
    transition: transform 1s cubic-bezier(0.03, 0.1, 0.25,1.02);
}

#loading.run .wavebox {
    transform: translateY(110%);
    transition:transform 1s cubic-bezier(0.03, 0.1, 0.25,1.02);
}

.waves {
    position: absolute;
    top: -10vh;
    left: 0;
    width: 100%;
    height: 10vh;
}

.waves .wave {
    animation: move 3s linear infinite;
}

.waves .wave:nth-child(1) {
    animation-delay: -0.5s;
    animation-duration: 3s;
}

.waves .wave:nth-child(2) {
    animation-delay: -1s;
    animation-duration: 5.5s;
}

.waves .wave:nth-child(3) {
    animation-delay: -4s;
    animation-duration: 13s;
}

.waves .wave:nth-child(4) {
    animation-delay: -5s;
    animation-duration: 20s;
}

@keyframes move {
    from {
        transform: translate(-90px, 0%);
    }

    to {
        transform: translate(85px, 0%);
    }

}
</style>