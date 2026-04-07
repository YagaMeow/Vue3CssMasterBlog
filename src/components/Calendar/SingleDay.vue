<template>
  <div class="day">
    <div class="content">
      <div class="date">{{ props.date }}</div>
      <div class=""></div>
    </div>
  </div>
</template>
<script lang="ts" setup>
const props = defineProps({
  date: {
    type: Number,
    default: null,
  },
})
</script>
<style lang="scss" scoped>
.day {
  // background-color: rgba($color: #000000, $alpha: 0.3);
  border-radius: 1rem;
  // min-width: 20vh;
  // height: auto;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  .content {
    z-index: 1;
    cursor: pointer;
    * {
      pointer-events: none;
    }
    .date {
      font-size: 5rem;
      font-weight: bolder;
      font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
      color: #fff;
      -webkit-text-stroke: 0.05rem #000;
      user-select: none;
    }
  }

  @media screen and (max-aspect-ratio: 1/1) {
    display: flex;
    justify-content: center;
    .content {
      background-color: #eee;
      border-radius: 50%;
      width: 100%;
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow:
        inset 0rem -1rem 1rem rgba($color: #ffffffe0, $alpha: 0.8),
        inset 0rem 1rem 1rem rgba($color: #ffffffe0, $alpha: 0.8),
        inset 1rem 0rem 1rem rgba($color: #ffffffe0, $alpha: 0.8),
        inset -1rem 0rem 1rem rgba($color: #ffffffe0, $alpha: 0.8),
        inset 1rem 0rem 2rem rgba($color: #a5a5a5, $alpha: 0.5),
        inset -1rem 0rem 2rem rgba($color: #a5a5a5, $alpha: 0.5),
        inset 0rem 1rem 2rem rgba($color: #a5a5a5, $alpha: 0.5),
        inset 0rem -1rem 2rem rgba($color: #a5a5a5, $alpha: 0.5);
      &:hover {
        scale: 0.9;
        transition: scale 0.05s ease;
        filter: brightness(0.5);
      }
      transition:
        scale 0.2s 0.3s cubic-bezier(0.175, 0.885, 0.32, 2.275),
        filter 0.5s ease;
    }
  }
}
</style>
