<template>
  <div class="diagram-container _fullscreen">
    <canvas id="canvas" width="1000" height="1000"></canvas>
  </div>
</template>
<script setup lang="ts">
import { el, fa } from 'element-plus/es/locales.mjs'
import { onMounted } from 'vue'

defineOptions({
  name: "EDiagram"
})
const diagram = {
  canvas: null as null | HTMLCanvasElement,
  raf: 0,
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
        const data = [{
          x: 100,
          y: this.canvas.height * 0.4 - 344,
          data: 0b0000,
          type: 'line'
        }, {
          x: 300,
          y: this.canvas.height * 0.4 - 344,
          data: 0b1001,
          type: 'line'
        }, {
          x: 500,
          y: this.canvas.height * 0.4 - 344,
          data: 0b1101,
          type: 'line'
        }, {
          x: 700,
          y: this.canvas.height * 0.4 - 344,
          data: 0,
          type: 'ml'
        }, {
          x: 900,
          y: this.canvas.height * 0.4 - 344,
          data: 0,
          type: 'fd'
        }, {
          x: 1100,
          y: this.canvas.height * 0.4 - 344,
          data: 0b1001,
          type: 'line'
        }, {
          x: 1300,
          y: this.canvas.height * 0.4 - 344,
          data: 0b1001,
          type: 'ml'
        }, {
          x: 1500,
          y: this.canvas.height * 0.4 - 344,
          data: 0b1001,
          type: 'line'
        }, {
          x: 1700,
          y: this.canvas.height * 0.4 - 344,
          data: 0b1001,
          type: 'line'
        }]
        let lastTime = 0
        let cnt = 0
        const animate = (time: number) => {
          if (!lastTime) {
            this.draw(ctx, data)
            lastTime = time
            this.raf = requestAnimationFrame(animate)
            return
          }
          const delta = time - lastTime
          if (delta > 17) {
            cnt++
            cnt %= 100;
            if (cnt == 0) {
              data[0].data++
              data[0].data %= 16
            } else if (cnt == 25) {
              data[1].data++
              data[1].data %= 16
            } else if (cnt == 50) {
              data[2].data++
              data[2].data %= 16
            }

            if (this.canvas)
              ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
            this.draw(ctx, data)
          }

          this.raf = requestAnimationFrame(animate)
        }
        this.raf = requestAnimationFrame(animate)
      }
    }

  },
  draw(ctx: CanvasRenderingContext2D, data: { x: number, y: number, data: number, type: string }[]) {
    if (!this.canvas) return
    //bus
    ctx.fillStyle = 'rgb(255,255,255)'
    const ratio = this.canvas.width / parseInt(this.canvas.style.width) / 1.5
    // const busWidth = this.canvas.width
    const lineWdith = 3 * ratio
    // const busHeight = lineWdith
    // const y1 = this.canvas.height * 0.4 - busHeight / 2
    // const y2 = this.canvas.height * 0.6 - busHeight / 2
    // ctx.fillRect(0, y1, busWidth, busHeight)
    // ctx.fillRect(0, y2, busWidth, busHeight)

    const bus = {
      st: 0,
      nd: 0
    }

    const draw_zd = (ctx: CanvasRenderingContext2D, x: number, y: number, close: boolean, scale?: number, rotate?: number) => {
      ctx.save()
      ctx.translate(x, y)
      if (rotate) {
        ctx.rotate(rotate / 180 * Math.PI)
      }
      let cx = 0
      let cy = 0

      ctx.strokeStyle = 'rgb(255,255,255)'
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      const lineHeight = 6 * lineWdith
      ctx.lineTo(cx, cy + lineHeight)

      if (!close) {
        ctx.moveTo(cx + lineHeight / 2, cy + lineHeight)
        ctx.lineTo(cx, cy + 2 * lineHeight)
      } else {
        ctx.moveTo(cx, cy + lineHeight)
        ctx.lineTo(cx, cy + 2 * lineHeight)
      }


      ctx.moveTo(cx, cy + lineHeight * 2)
      ctx.lineTo(cx, cy + lineHeight * 3)
      cy += lineHeight * 3
      ctx.stroke()
      ctx.restore()
      //72
      return {
        'x': x + Math.sqrt(cx * cx + cy * cy) * Math.cos(Math.atan(cy / cx) + ((rotate || 0) / 180 * Math.PI)),
        'y': y + Math.sqrt(cx * cx + cy * cy) * Math.sin(Math.atan(cy / cx) + ((rotate || 0) / 180 * Math.PI))
      }
    }

    // 出线 ctx x y data
    const draw_line = (ctx: CanvasRenderingContext2D, x: number, y: number, states: number) => {
      // ctx.moveTo(x,y)
      const rect = states & 1
      const xlzd = states & 1 << 1
      const zmzd = states & 1 << 2
      const fmzd = states & 1 << 3

      let cx = x
      let cy = y

      // 箭头
      ctx.beginPath()
      ctx.moveTo(x, y + 10 * ratio)
      ctx.lineTo(x + 10 * ratio / Math.sqrt(3), y)
      ctx.lineTo(x + 20 * ratio / Math.sqrt(3), y + 10 * ratio)
      ctx.closePath()
      ctx.fill()

      cx += 10 * ratio / Math.sqrt(3)
      cy += 10 * ratio

      // 线
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx, y + 100 * ratio)
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = lineWdith
      ctx.stroke()
      cy = y + 100 * ratio

      // 接地闸刀
      ctx.moveTo(x + 10 * ratio / Math.sqrt(3), y + 80 * ratio)
      ctx.lineTo(x - 80 * ratio / Math.sqrt(3), y + 80 * ratio)
      ctx.lineTo(x - 80 * ratio / Math.sqrt(3), y + 100 * ratio)
      ctx.stroke()
      let pos = draw_zd(ctx, x - 80 * ratio / Math.sqrt(3), y + 100 * ratio, false)
      draw_jd(ctx, pos.x, pos.y)

      // 线路闸刀
      pos = draw_zd(ctx, cx, cy, Boolean(xlzd))

      // 线
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
      ctx.lineTo(pos.x, pos.y + 20 * ratio)
      ctx.moveTo(pos.x, pos.y + 20 * ratio)
      ctx.stroke()

      // 接地闸刀
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
      ctx.lineTo(pos.x + 50 * ratio, pos.y)
      ctx.stroke()

      const tmp_pos = draw_zd(ctx, pos.x + 50 * ratio, pos.y, false)
      draw_jd(ctx, tmp_pos.x, tmp_pos.y)



      // 开关
      ctx.beginPath()
      if (rect)
        ctx.fillRect(x - 3 * ratio, pos.y + 20 * ratio, 16 * ratio, 30 * ratio)
      else
        ctx.strokeRect(x - 3 * ratio, pos.y + 20 * ratio, 16 * ratio, 30 * ratio)

      // 线
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y + 50 * ratio)
      ctx.lineTo(pos.x, pos.y + 100 * ratio)
      ctx.stroke()

      cx = pos.x
      cy = pos.y + 100 * ratio

      // 副母闸刀
      pos = draw_zd(ctx, cx, cy, Boolean(fmzd))

      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
      ctx.lineTo(pos.x, pos.y + 36 * ratio)

      ctx.moveTo(cx - 50 * ratio, cy)
      ctx.lineTo(cx + 50 * ratio, cy)
      ctx.stroke()

      bus.st = pos.y + 36 * ratio
      bus.nd = pos.y + 136 * ratio

      // 接地闸刀
      pos = draw_zd(ctx, cx - 50 * ratio, cy, false)
      draw_jd(ctx, pos.x, pos.y)

      // 正母闸刀
      pos = draw_zd(ctx, cx + 50 * ratio, cy, Boolean(zmzd))

      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
      ctx.lineTo(pos.x, pos.y + 136 * ratio)
      ctx.stroke()
    }

    // 接地 ctx x y rotate
    const draw_jd = (ctx: CanvasRenderingContext2D, x: number, y: number, rotate?: number) => {
      ctx.save()
      ctx.translate(x, y)
      if (rotate) {
        ctx.rotate(rotate / 180 * Math.PI)
      }
      ctx.beginPath()
      ctx.strokeStyle = '#ff0000'
      let cx = 0
      let cy = 0
      ctx.moveTo(cx, cy)
      cy += 10 * ratio
      ctx.lineTo(cx, cy)

      cx -= 10 * ratio
      ctx.moveTo(cx, cy)
      cx += 20 * ratio
      ctx.lineTo(cx, cy)

      cy += 5 * ratio
      cx -= 10 * ratio
      ctx.moveTo(cx, cy)

      cx -= 8 * ratio
      ctx.moveTo(cx, cy)
      cx += 16 * ratio
      ctx.lineTo(cx, cy)

      cy += 5 * ratio
      cx -= 8 * ratio
      ctx.moveTo(cx, cy)

      cx -= 5 * ratio
      ctx.moveTo(cx, cy)
      cx += 10 * ratio
      ctx.lineTo(cx, cy)

      ctx.stroke()
      ctx.restore()
    }

    // 主变 ctx x y
    const draw_zb = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
      ctx.save()
      ctx.lineCap = 'square'
      ctx.beginPath()
      ctx.fillStyle = '#ff0000'
      ctx.strokeStyle = '#ff0000'
      ctx.arc(x, y, 30 * ratio, 0, 2 * Math.PI)
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(x, y + 30 * Math.sqrt(3) * ratio, 30 * ratio, 0, 2 * Math.PI)
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(x - 45 * ratio, y + 15 * Math.sqrt(3) * ratio, 30 * ratio, 0, 2 * Math.PI)
      ctx.stroke()

      let cx = x
      let cy = y
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx, cy - 20 * ratio)
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx - 10 * Math.sqrt(3) * ratio, cy + 10 * ratio)
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + 10 * Math.sqrt(3) * ratio, cy + 10 * ratio)
      ctx.stroke()

      cy = y + 30 * Math.sqrt(3) * ratio
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx, cy - 20 * ratio)
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx - 10 * Math.sqrt(3) * ratio, cy + 10 * ratio)
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + 10 * Math.sqrt(3) * ratio, cy + 10 * ratio)
      ctx.stroke()

      cx = x - 45 * ratio
      cy = y + 15 * Math.sqrt(3) * ratio
      ctx.moveTo(cx - 5 * ratio, cy - 5 * Math.sqrt(3) * ratio)
      ctx.lineTo(cx - 5 * ratio, cy + 5 * Math.sqrt(3) * ratio)
      ctx.lineTo(cx + 10 * ratio, cy)
      ctx.closePath()
      ctx.stroke()
      ctx.restore()
    }

    // 母联 ctx x y data
    const draw_ml = (ctx: CanvasRenderingContext2D, x: number, y: number, data: number) => {
      let cx = x
      let cy = y
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx, cy + 100 * ratio)
      ctx.stroke()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + 80 * ratio, cy)
      ctx.lineTo(cx + 80 * ratio, cy + 444 * ratio)
      ctx.stroke()


      let pos = draw_zd(ctx, cx, cy + 100 * ratio, false)
      cx = pos.x
      cy = pos.y
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx - 40 * ratio, cy)
      ctx.stroke()
      pos = draw_zd(ctx, cx - 40 * ratio, cy, false, 0, 180)
      draw_jd(ctx, pos.x, pos.y, 180)

      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx, cy + 20 * ratio)
      ctx.stroke()
      cy += 20 * ratio
      ctx.fillRect(cx - 8 * ratio, cy, 16 * ratio, 30 * ratio)
      cy += 30 * ratio
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx, cy + 20 * ratio)
      ctx.stroke()
      ctx.moveTo(cx, cy + 20 * ratio)
      ctx.lineTo(cx - 40 * ratio, cy + 20 * ratio)
      ctx.stroke()
      pos = draw_zd(ctx, cx - 40 * ratio, cy + 20 * ratio, false)
      draw_jd(ctx, pos.x, pos.y)
      // ctx.lineTo(cx-40*ratio,cy+)
      cy += 20 * ratio
      pos = draw_zd(ctx, cx, cy, false)
      cx = pos.x
      cy = pos.y
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx, cy + 66 * ratio)
      ctx.stroke()
      ctx.restore()
    }

    // 分段 ctx x y data
    const draw_fd = (ctx: CanvasRenderingContext2D, x: number, y: number, data: number) => {
      ctx.save()
      ctx.beginPath()
      let cx = x
      let cy = y
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx, cy + 100 * ratio)
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + 100 * ratio, cy)
      ctx.lineTo(cx + 100 * ratio, bus.st)
      ctx.stroke()
      cy += 100 * ratio
      let pos = draw_zd(ctx, cx, cy, false)
      cx = pos.x
      cy = pos.y
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx, cy + 20 * ratio)
      ctx.stroke()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx - 40 * ratio, cy)
      ctx.stroke()
      pos = draw_zd(ctx, cx - 40 * ratio, cy, false, 0, 180)
      draw_jd(ctx, pos.x, pos.y, 180)
      ctx.beginPath()
      cy += 20 * ratio
      ctx.fillRect(cx - 8 * ratio, cy, 16 * ratio, 30 * ratio)
      cy += 30 * ratio
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx, cy + 20 * ratio)
      ctx.stroke()
      cy += 20 * ratio
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx - 40 * ratio, cy)
      ctx.stroke()
      pos = draw_zd(ctx, cx - 40 * ratio, cy, false)
      draw_jd(ctx, pos.x, pos.y)
      pos = draw_zd(ctx, cx, cy, false)
      ctx.moveTo(pos.x, pos.y)
      ctx.lineTo(pos.x, bus.st)
      ctx.stroke()
      ctx.restore()
    }

    data.forEach(d => {
      if (d.type == 'line')
        draw_line(ctx, d.x * ratio, d.y * ratio, d.data)
      else if (d.type == 'ml')
        draw_ml(ctx, d.x * ratio, d.y * ratio, d.data)
      else if (d.type == 'fd')
        draw_fd(ctx, d.x * ratio, d.y * ratio, d.data)
    })
    ctx.beginPath()
    ctx.moveTo(0, bus.st)
    ctx.lineTo(920 * ratio, bus.st)
    ctx.moveTo(980 * ratio, bus.st)
    ctx.lineTo(1980 * ratio, bus.st)
    ctx.moveTo(0, bus.nd)

    ctx.lineTo(1980 * ratio, bus.nd)
    ctx.stroke()

    draw_zb(ctx, bus.nd, bus.nd + 200 * ratio)

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
<style lang="scss" scoped>
.diagram-container {
  background: radial-gradient(circle at 30% 50%, rgb(67, 65, 65), black);
  ;
}
</style>
