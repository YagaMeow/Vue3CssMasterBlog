<template>
  <div class="diagram-container _fullscreen">
    <canvas id="canvas" width="1000" height="1000"></canvas>
  </div>
</template>
<script setup lang="ts">
import { el } from 'element-plus/es/locales.mjs'
import { onMounted } from 'vue'

defineOptions({
  name: "EDiagram"
})
const diagram = {
  canvas: null as null | HTMLCanvasElement,
  init() {
    this.canvas = document.querySelector('#canvas')
    if (this.canvas) {
      const ctx = this.canvas.getContext('2d')
      if (ctx) {
        // const dpr = window.devicePixelRatio || 1
        // this.canvas.style.width = this.canvas.width + 'px'
        // this.canvas.style.height = this.canvas.height + 'px'
        // this.canvas.width = this.canvas.width * dpr
        // this.canvas.height = this.canvas.height * dpr
        this.resize()
        this.draw(ctx)

      }
    }
  },
  draw(ctx: CanvasRenderingContext2D) {
    if (!this.canvas) return
    //bus
    ctx.fillStyle = 'rgb(255,255,255)'
    const ratio = this.canvas.width / parseInt(this.canvas.style.width) / 1.5
    const busWidth = this.canvas.width
    const lineWdith = 3 * ratio
    const busHeight = lineWdith
    const y1 = this.canvas.height * 0.4 - busHeight / 2
    const y2 = this.canvas.height * 0.6 - busHeight / 2
    ctx.fillRect(0, y1, busWidth, busHeight)
    ctx.fillRect(0, y2, busWidth, busHeight)

    const draw_zd = (ctx: CanvasRenderingContext2D, x: number, y: number, close: boolean, scale?: number) => {
      let ny = y
      ctx.save()
      ctx.strokeStyle = 'rgb(255,255,255)'
      ctx.beginPath()
      ctx.moveTo(x, y)
      const lineHeight = 8 * lineWdith
      ctx.lineTo(x, y + lineHeight)

      if (!close) {
        ctx.moveTo(x + lineHeight / 2, y + lineHeight)
        ctx.lineTo(x, y + 2 * lineHeight)
      } else {
        ctx.moveTo(x, y + lineHeight)
        ctx.lineTo(x, y + 2 * lineHeight)
      }


      ctx.moveTo(x, y + lineHeight * 2)
      ctx.lineTo(x, ny = y + lineHeight * 3)
      ctx.stroke()
      ctx.restore()
      //72
      return {
        'x': x,
        'y': ny
      }
    }

    const draw_line = (ctx: CanvasRenderingContext2D, x: number, y: number, states: number) => {
      // ctx.moveTo(x,y)
      const rect = states & 1
      const xlzd = states & 1 << 1
      const zmzd = states & 1 << 2
      const fmzd = states & 1 << 3

      ctx.beginPath()
      ctx.moveTo(x, y + 10 * ratio)
      ctx.lineTo(x + 10 * ratio / Math.sqrt(3), y)
      ctx.lineTo(x + 20 * ratio / Math.sqrt(3), y + 10 * ratio)
      ctx.closePath()
      ctx.fill()

      ctx.moveTo(x + 10 * ratio / Math.sqrt(3), y + 10 * ratio)
      ctx.lineTo(x + 10 * ratio / Math.sqrt(3), y + 100 * ratio)
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = lineWdith
      ctx.stroke()

      let pos = draw_zd(ctx, x + 10 * ratio / Math.sqrt(3), y + 100 * ratio, Boolean(xlzd))

      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
      ctx.lineTo(pos.x, pos.y + 10 * ratio)
      ctx.moveTo(pos.x, pos.y + 10 * ratio)

      if (rect)
        ctx.fillRect(x - 3 * ratio, pos.y + 10 * ratio, 16 * ratio, 30 * ratio)
      else
        ctx.strokeRect(x - 3 * ratio, pos.y + 10 * ratio, 16 * ratio, 30 * ratio)

      ctx.moveTo(pos.x, pos.y + 40 * ratio)
      ctx.lineTo(pos.x, pos.y + 100 * ratio)
      ctx.stroke()

      draw_zd(ctx, pos.x, pos.y + 100 * ratio, Boolean(fmzd))

      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y + 100 * ratio)
      ctx.lineTo(pos.x + 50 * ratio, pos.y + 100 * ratio)
      ctx.stroke()

      pos = draw_zd(ctx, pos.x + 50 * ratio, pos.y + 100 * ratio, Boolean(zmzd))

      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
      ctx.lineTo(pos.x, pos.y + (diagram.canvas ? diagram.canvas.height * 0.2 * ratio : 0))
      ctx.stroke()
    }
    draw_line(ctx, 100, this.canvas.height * 0.4 - 344 * ratio, 0b0000)
    draw_line(ctx, 200, this.canvas.height * 0.4 - 344 * ratio, 0b1001)
    // draw_zd(ctx, 100, 100, true)

    // draw_zd(ctx, 200, 100, true)
    //line

  },
  resize() {
    if (diagram.canvas) {
      diagram.canvas.style.width = window.innerWidth + 'px'
      diagram.canvas.style.height = window.innerHeight + 'px'
      const dpr = window.devicePixelRatio || 1
      diagram.canvas.width = dpr * window.innerWidth
      diagram.canvas.height = dpr * window.innerHeight
    }
  }
}
onMounted(() => {
  diagram.init()
})
</script>
<style lang="scss" scoped></style>
