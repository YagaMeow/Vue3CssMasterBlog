<template>
  <div class="game-container _fullscreen" v-show="games.if_visible.value">
    <div
      class="cards-a player-area"
      @click="
        (e) => {
          games.handleSelect(e)
        }
      "
      :style="{ border: games.round.value != 'A' ? '.5rem solid transparent' : '' }"
    >
      <Card
        v-for="(c, idx) in games.data.A.value"
        :data="c"
        :key="`card-a-${idx}`"
        :group="'A'"
        :name="c.name"
        team="A"
        :id="c.id"
      >
      </Card>
    </div>
    <div class="table-container">
      <div
        class="table"
        @click="
          (e) => {
            games.handleDrop(e)
          }
        "
      >
        <div class="slot" id="slot11" col="1" row="1"></div>
        <div class="slot" id="slot12" col="2" row="1"></div>
        <div class="slot" id="slot13" col="3" row="1"></div>
        <div class="slot" id="slot21" col="1" row="2"></div>
        <div class="slot" id="slot22" col="2" row="2"></div>
        <div class="slot" id="slot23" col="3" row="2"></div>
        <div class="slot" id="slot31" col="1" row="3"></div>
        <div class="slot" id="slot32" col="2" row="3"></div>
        <div class="slot" id="slot33" col="3" row="3"></div>
      </div>
    </div>
    <div
      class="cards-b player-area"
      @click="
        (e) => {
          games.handleSelect(e)
        }
      "
      :style="{ border: games.round.value != 'B' ? '.5rem solid transparent' : '' }"
    >
      <Card
        v-for="(c, idx) in games.data.B.value"
        :data="c"
        :key="`card-a-${idx}`"
        :group="'B'"
        :name="c.name"
        team="B"
        :id="c.id"
      >
      </Card>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useAppStore } from '@/pinia'
import { onMounted, ref } from 'vue'
import Card from './Card.vue'
import { range } from '@/utils/utils'
import gsap, { toArray } from 'gsap'
import { da } from 'element-plus/es/locales.mjs'
defineOptions({
  name: 'CardGame',
})

interface CardData {
  id: string
  name: string
  attack: number[]
}
const games = {
  if_visible: ref(false),
  target: null as null | HTMLElement,
  data: {
    A: ref([] as CardData[]),
    B: ref([] as CardData[]),
  },
  round: ref('A'),
  generateCard(rare: number) {
    const data = [] as number[]
    let max = 0
    if (rare == 4) {
      const total = 27
      data.push(Math.floor(range(1, 10) + 0.5))
      data.push(Math.floor(range(1, 10) + 0.5))
      data.push(Math.floor(range(1, 10) + 0.5))
      data.push(total - data[0] - data[1] - data[2])
      max = 10
    } else if (rare == 3) {
      const total = 25
      data.push(Math.floor(range(1, 9) + 0.5))
      data.push(Math.floor(range(1, 9) + 0.5))
      data.push(Math.floor(range(1, 9) + 0.5))
      data.push(total - data[0] - data[1] - data[2])
      max = 9
    } else if (rare == 2) {
      const total = 21
      data.push(Math.floor(range(1, 8) + 0.5))
      data.push(Math.floor(range(1, 8) + 0.5))
      data.push(Math.floor(range(1, Math.min(8, total - data[0] - data[1] - 1)) + 0.5))
      data.push(total - data[0] - data[1] - data[2])
      max = 8
    } else if (rare == 1) {
      const total = 18
      data.push(Math.floor(range(1, 7) + 0.5))
      data.push(Math.floor(range(1, 7) + 0.5))
      data.push(Math.floor(range(1, Math.min(7, total - data[0] - data[1] - 1)) + 0.5))
      data.push(total - data[0] - data[1] - data[2])
      max = 7
    } else if (rare == 0) {
      const total = 14
      data.push(Math.floor(range(1, 7) + 0.5))
      data.push(Math.floor(range(1, Math.min(7, total - data[0] - 1)) + 0.5))
      data.push(Math.floor(range(1, Math.min(7, total - data[0] - data[1] - 1)) + 0.5))
      data.push(total - data[0] - data[1] - data[2])
      max = 7
    }
    while (data[3] > max) {
      for (let i = 0; i < 3 && data[3] > max; ++i) {
        if (data[i] < max) {
          data[i]++
          data[3]--
        }
      }
    }
    return data
  },
  init() {
    this.round.value = range(-1, 1) > 0 ? 'A' : 'B'
    const A = [] as CardData[]
    const B = [] as CardData[]
    for (let i = 0; i < 5; ++i) {
      A.push({
        id: 'A' + i,
        name: 'RandomGuy',
        attack: this.generateCard(i),
      })
      B.push({
        id: 'B' + i,
        name: 'RandomGuy',
        attack: this.generateCard(i),
      })
    }
    this.data.A.value = A
    this.data.B.value = B
  },
  show() {
    this.if_visible.value = true
    setTimeout(() => {
      appStore.notify?.(this.round.value == 'A' ? '白方先手' : '黑方先手')
    }, 500)
  },
  hide(immediate: () => void, next: () => void) {
    if (immediate) immediate()
    this.if_visible.value = false
    if (next) next()
  },
  handleSelect(e: MouseEvent) {
    if (
      !(e.target as HTMLElement).classList.contains('card-container') ||
      (e.target as HTMLElement).getAttribute('team') != this.round.value
    )
      return
    if (this.target) (this.target as HTMLElement).style.outline = '0.2rem solid var(--front)'
    ;(e.target as HTMLElement).style.outline = '.5rem solid orange'
    this.target = e.target as HTMLElement
  },
  handleDrop(e: MouseEvent) {
    if (this.target === null) return
    this.move(this.target, e.target as HTMLElement)
    if (this.round.value == 'A') this.round.value = 'B'
    else this.round.value = 'A'
    ;(this.target as HTMLElement).style.outline = '0.2rem solid var(--front)'
    this.target = null
  },
  flipCard(show: NodeListOf<HTMLElement>, hide: NodeListOf<HTMLElement>) {
    gsap
      .timeline()
      .to(show, {
        rotateY: '180deg',
      })
      .to(hide, {
        rotateY: 0,
      })
  },
  move(from: HTMLElement, to: HTMLElement) {
    to.appendChild(from)
    const col = parseInt(to.getAttribute('col') as string)
    const row = parseInt(to.getAttribute('row') as string)
    this.judge(col, row)
  },
  judge(x: number, y: number) {
    const challenger = document.querySelector(`#slot${y}${x} .card-container`) as HTMLElement
    const c_id = parseInt(challenger.id.slice(1))
    const c_team = challenger.getAttribute('team')

    const dir = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]
    for (let i = 0; i < dir.length; ++i) {
      const dx = x + dir[i][0]
      const dy = y + dir[i][1]
      if (dx > 3 || dx < 1 || dy > 3 || dy < 1) continue
      const master = document.querySelector(`#slot${dy}${dx} .card-container`) as HTMLElement
      if (master == null) continue
      const m_id = parseInt(master.id.slice(1))
      const m_team = master.getAttribute('team')
      if (m_team == c_team) continue
      let c_idx = 0,
        m_idx = 0
      if (dir[i][0] == 1 && dir[i][1] == 0) {
        c_idx = 1
        m_idx = 3
      } else if (dir[i][0] == -1 && dir[i][1] == 0) {
        c_idx = 3
        m_idx = 1
      } else if (dir[i][0] == 0 && dir[i][1] == 1) {
        c_idx = 2
        m_idx = 0
      } else {
        c_idx = 0
        m_idx = 2
      }
      let c_data = 0,
        m_data = 0
      console.log(c_id, m_id)
      console.log(c_idx, m_idx)
      c_data = eval(`this.data.${challenger.id.slice(0, 1)}.value[c_id].attack[c_idx]`)
      m_data = eval(`this.data.${master.id.slice(0, 1)}.value[m_id].attack[m_idx]`)
      if (c_data > m_data) {
        this.flip(master as HTMLElement)
      }
    }
  },
  flip(card: HTMLElement) {
    const back = card.style.getPropertyValue('--back')
    const front = card.style.getPropertyValue('--front')
    const team = card.getAttribute('team')
    console.log(card)
    gsap
      .timeline()
      .to(card, {
        z: '5rem',
        duration: 0.2,
      })
      .to(card, {
        rotateY: '360deg',
        duration: 0.5,
      })
      .to(
        card,
        {
          '--back': front,
          '--front': back,
          duration: 0.25,
        },
        '<+.25',
      )
      .to(card, {
        z: 0,
        duration: 0.25,
      })
      .to(card, {
        rotateY: 0,
        duration: 0,
      })
    if (team == 'A') card.setAttribute('team', 'B')
    else card.setAttribute('team', 'A')
  },
}

onMounted(() => {
  games.init()
})

const appStore = useAppStore()
appStore.show_game_page = games.show.bind(games)
appStore.hide_game_page = games.hide.bind(games)
</script>
<style lang="scss" scoped>
.game-container {
  display: flex;
  justify-content: space-between;

  .table-container {
    width: 100dvh;
    height: 100dvh;
    padding: 5rem;

    .table {
      cursor: pointer;
      width: 100%;
      height: 100%;
      background-color: #000;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(3, 1fr);
      outline: 0.3rem solid #000;
      border-radius: 1rem;

      .slot {
        &:nth-child(2n) {
          background-color: #fff;
        }

        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }

  .player-area {
    border-radius: 1rem;
    border: 0.5rem solid #000;
    height: calc(100dvh - 1rem);
    margin: 0.5rem;

    .card {
      transition: transform 0.5s ease;
      // &.hide {
      //   transform: rotate3d(0, 1, 0, 180deg);
      // }
    }
  }

  .cards-a,
  .cards-b {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    width: 60rem;
    gap: 2rem;
    padding: 5rem;
  }
}
</style>
