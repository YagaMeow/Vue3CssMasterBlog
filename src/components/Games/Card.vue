<template>
  <div class="card-container"
    :style="{ '--back': props.group == 'A' ? '#fff' : '#000', '--front': props.group == 'A' ? '#000' : '#fff' }">
    <div class="attack-data top">
      <span>{{ formatATK(props.data.attack[0]) }}</span>
    </div>
    <div class="attack-data right">
      <span>{{ formatATK(props.data.attack[1]) }}</span>
    </div>
    <div class="attack-data bottom">
      <span>{{ formatATK(props.data.attack[2]) }}</span>
    </div>
    <div class="attack-data left">
      <span>{{ formatATK(props.data.attack[3]) }}</span>
    </div>
  </div>
</template>
<script lang="ts" setup>

defineOptions({
  name: "GameCard"
})

function formatATK(atk: number) {
  if (atk === 10) {
    return 'A'
  } else return atk
}
const props = defineProps({
  group: {
    type: String,
    default: 'A'
  },
  data: {
    type: Object as () => {
      id: string,
      name: string,
      attack: number[]
    },
    default: () => {
      return {
        name: "Unknown",
        attack: [0, 0, 0, 0]
      }
    }
  }
})

const card = {
  data: {
    name: "Bug",
    attack: [1, 2, 3, 4]
  },
  flip() {
  }
}
</script>
<style lang="scss" scoped>
.card-container {
  width: 20rem;
  height: 28rem;
  background-color: var(--back);
  outline: .2rem solid var(--front);
  border-radius: 1rem;
  position: relative;
  padding: 1rem;
  box-shadow: 1rem 1rem 1rem rgba($color: #000000, $alpha: .4);
  transform: perspective(100rem) translate3d(0, 0, 0);
  .attack-data {
    pointer-events: none;
    width: 4rem;
    height: 4rem;
    background-color: var(--front);
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;

    &.top {
      left: 50%;
      transform: translateX(-50%);
    }

    &.right {
      top: 50%;
      right: 1rem;
      transform: translateY(-50%);
    }

    &.bottom {
      bottom: 1rem;
      left: 50%;
      transform: translateX(-50%);
    }

    &.left {
      top: 50%;
      transform: translateY(-50%);
    }

    span {
      font-size: 2rem;
      color: var(--back);
    }
  }

}

.player-area {
  .card-container {
    // box-shadow: none !important;
    // @keyframes hide {
    //   100% {
    //     display: none
    //   }
    // }
    // &.hide {
    //   .attack-data {
    //     animation: .1s forwards 0s hide;
    //   }
    // }

    @keyframes hover {
      0% {
        transform: perspective(100rem) translate3d(0, 0, 0);
      }

      20% {
        transform: perspective(100rem) translate3d(0, 0, 10rem) rotate3d(0, 1, 0, 10deg);
        ;
      }

      30% {
        transform: perspective(100rem) translate3d(0, 0, 10rem) rotate3d(0, 1, 0, 0deg);
      }

      50% {
        transform: perspective(100rem) translate3d(0, 0, 10rem) rotate3d(0, 1, 0, -5deg);
      }

      100% {
        transform: perspective(100rem) translate3d(0, 0, 10rem);
      }
    }

    &:hover {
      cursor: pointer;
      animation: hover 1s ease forwards;
      z-index: 10;
    }
  }

}
</style>
