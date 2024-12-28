<script setup lang="ts">
import { ref, onMounted } from 'vue'
onMounted(() => {
    const waves = document.querySelector(".wavebox");
    const loading = document.querySelector("#loading") as HTMLElement;
    function handleLoading() {
        console.log(waves);
        waves?.classList.add("run");
        const textbox = document.querySelector(".loading-text-box")
        setTimeout(() => {
            textbox?.classList.add("fadeout");
            setTimeout(() => {
                if(loading && loading.style)
                    loading.style.display = "none";
            },1000);
        }, 2250);
    }
    window.addEventListener("load", handleLoading);
})
</script>
<template>
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
</template>
<style scoped>
.wavebox {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transition: transform 2.5s cubic-bezier(0.03, 0.1, 0.25,1.02);
    background: #029eeb;
}

#loading .wavebox.run {
    transform: translateY(110%);
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
