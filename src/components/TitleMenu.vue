<template>
  <div class="title_menu">
    <div class="title_menu_button">
      <div class="live">live now</div>
      2025
    </div>
    <div class="title_menu_button">2024</div>
    <div class="title_menu_button">2023</div>
    <div class="title_menu_button">2022</div>
    <div class="title_menu_button">2021</div>
  </div>
</template>
<script setup lang="ts"></script>
<style lang="scss" scoped>
.title_menu {
  --scale: 1;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100vh;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .title_menu_button {
    width: calc(var(--scale) * 30rem);
    height: calc(var(--scale) * 8rem);

    margin: 3px 0;
    transition: all ease-out 0.1s;
    background-color: #616161;
    border-radius: 10px;
    box-shadow: inset 1px 1px #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 3rem;
    font-weight: bolder;
    color: #fff;
    letter-spacing: 0.2rem;
    user-select: none;
    cursor: pointer;
    flex-direction: column;
    position: relative;

    &:hover {
      height: calc(var(--scale) * 16rem);
      transition: all ease-in 0.2s;
      background-color: rgba(0, 0, 0, 0.1);
      &:nth-child(1) {
        &::after {
          opacity: 100;
          transition: all ease-in 0.5s;
          animation: scroll 5s linear infinite;
        }
      }
    }
    .live {
      font-size: 1rem;
      position: absolute;
      top: 10%;
      padding-right: 5px;
      display: flex;
      align-items: center;
      gap: 10px;
      &::after {
        content: '';
        background-color: rgb(39, 213, 39);
        display: block;
        width: 0.8rem;
        height: 0.8rem;
        border-radius: 100%;
        animation: blink linear 2s infinite;
      }
    }

    &:nth-child(1) {
      &::after {
        content: 'test·';
        position: absolute;
        font-size: 1rem;
        bottom: 10%;
        opacity: 0;
      }
    }
  }
}

@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
}

@keyframes blink {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 100%;
  }
  100% {
    opacity: 0;
  }
}
</style>
