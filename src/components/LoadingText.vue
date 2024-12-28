<template>
    <div class="loading-text-box">
        <h1>
            <img src="../assets/svg/loading_text.svg" alt="">   
        </h1>
        <p class="loading-text">
            Remember, You Will Die.
            <br>
            Time never waits.
            <br>
            It delivers all equally to the same end.
        </p>
    </div>
</template>
<style scoped>
.loading-text-box h1 {
    height: 30px;
    width: 251px;
    margin-bottom: 22px;
}

.loading-text-box h1 img {
    font-size: 100%;
}

.loading-text-box .loading-text {
    font-family: Urbanist, sans-serif;
    font-size: 10px;
    line-height: 1.5;
    text-align: center;
}

.loading-text-box {
    transition: opacity 1s ease;
}

.loading-text-box.fadeout {
    opacity: 0;
}

</style>