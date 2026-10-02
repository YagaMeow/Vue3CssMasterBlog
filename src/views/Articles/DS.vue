<template>
  <div
    class="posts-diagram-container _fullscreen"
    v-show="diagram.if_visible.value"
    ref="containerRef"
  >
    <canvas ref="canvasRef" class="diagram-canvas"></canvas>
  </div>
</template>
<script lang="ts" setup>
defineOptions({ name: 'PostList' })

import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { ArticleAPI } from '@/api/api'
import { useAppStore } from '@/pinia'
import { formatDate, range } from '@/utils/utils'
import type { Article } from '@/utils/utils'

const appStore = useAppStore()

const containerRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

let ctx: CanvasRenderingContext2D | null = null
let W = 0,
  H = 0,
  DPR = 1
let CW = 0,
  CH = 0 // 世界尺寸 = 3W × 3H
let rafId = 0
let lastT = 0

interface PostNode {
  data: Article
  x: number
  y: number // 当前世界坐标（不取模，可无限延伸）
  tx: number
  ty: number // 目标世界坐标
  vx: number
  vy: number // 速度（弹簧用）
  w: number
  h: number
  img: HTMLImageElement | null
  imgReady: boolean
  bgstyle: number // 无封面时使用的本地占位图编号
  alpha: number
  targetAlpha: number
  scale: number
  targetScale: number
  hover: boolean // 指针是否悬停在卡片上
  hoverBin: boolean // 指针是否悬停在删除按钮上
  deleting: boolean // 正在删除（避免重复触发）
}

const nodes: PostNode[] = []
const cam = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 }

// 弹簧参数：stiffness 越大越快，damping 越小回弹越明显
const STIFF = 0.14,
  DAMP = 0.74
// 相机略"重"，拖动整块画布时有拖尾的丝滑感
const CAM_STIFF = 0.1,
  CAM_DAMP = 0.8

const CARD_W = 180
const CARD_H = 240
const BIN_R = 13 // 卡片右下角删除按钮半径

/* ---------------- 初始化 / 尺寸 ---------------- */

function resize() {
  // const el = document
  if (!canvasRef.value) return
  DPR = Math.min(window.devicePixelRatio || 1, 2)
  W = window.innerWidth
  H = window.innerHeight
  canvasRef.value.width = W * DPR
  canvasRef.value.height = H * DPR
  canvasRef.value.style.width = W + 'px'
  canvasRef.value.style.height = H + 'px'
  ctx = canvasRef.value.getContext('2d')
  ctx?.setTransform(DPR, 0, 0, DPR, 0, 0)
  CW = 3 * W
  CH = 3 * H
}

/* ---------------- 节点创建 ---------------- */

function makeNode(a: Article, idx: number): PostNode {
  // 围绕世界中心 (1.5W, 1.5H) 环形散布
  const angle = (idx / 10) * Math.PI * 2
  const radius = Math.min(W, H) * 0.18 + (idx % 3) * 70
  const cx = CW / 2 + Math.cos(angle) * radius
  const cy = CH / 2 + Math.sin(angle) * radius
  const bgstyle = Math.floor(range(1, 7))
  const node: PostNode = {
    data: a,
    x: cx,
    y: cy,
    tx: cx,
    ty: cy,
    vx: 0,
    vy: 0,
    w: CARD_W,
    h: CARD_H,
    img: null,
    imgReady: false,
    bgstyle,
    alpha: 0,
    targetAlpha: 1,
    scale: 0.8,
    targetScale: 1,
    hover: false,
    hoverBin: false,
    deleting: false,
  }
  loadImage(node)
  return node
}

/** 依据 Article.cover 拼接封面地址（与 Post.vue 保持一致） */
function coverUrl(a: Article): string | null {
  const raw = a.cover?.cover_url
  if (!raw) return null
  let curl = String(raw).replace('covers', 'covers/webp')
  curl = curl.slice(0, curl.lastIndexOf('.')) + '-400w.webp'
  return import.meta.env.VITE_BASE_API + '/api' + curl
}

function loadImage(n: PostNode) {
  const fallback = `/img/music${n.bgstyle}.jpg`
  const img = new Image()
  img.onload = () => {
    n.imgReady = true
  }
  img.onerror = () => {
    // 网络封面加载失败时退回本地占位图，仍然失败则显示灰底
    if (!img.src.endsWith(fallback)) img.src = fallback
    else n.imgReady = false
  }
  img.src = coverUrl(n.data) || fallback
  n.img = img
}

/* ---------------- 主循环 ---------------- */

function startLoop() {
  if (rafId) return
  lastT = 0
  rafId = requestAnimationFrame(tick)
}

function stopLoop() {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = 0
}

function tick(t: number) {
  rafId = requestAnimationFrame(tick)
  const dt = lastT ? Math.min((t - lastT) / 16.667, 3) : 1
  lastT = t

  // 相机弹簧
  cam.vx = (cam.vx + (cam.tx - cam.x) * CAM_STIFF) * CAM_DAMP
  cam.vy = (cam.vy + (cam.ty - cam.y) * CAM_STIFF) * CAM_DAMP
  cam.x += cam.vx * dt
  cam.y += cam.vy * dt

  // 卡片弹簧 + 淡入淡出
  for (const n of nodes) {
    n.vx = (n.vx + (n.tx - n.x) * STIFF) * DAMP
    n.vy = (n.vy + (n.ty - n.y) * STIFF) * DAMP
    n.x += n.vx * dt
    n.y += n.vy * dt
    n.alpha += (n.targetAlpha - n.alpha) * 0.15 * dt
    n.scale += (n.targetScale - n.scale) * 0.15 * dt
  }

  wrapCamera()
  draw()
}

/* ---------------- 绘制 ---------------- */

/** 世界坐标 -> 屏幕坐标，并选中最接近视口的那个"环绕副本" */
function project(n: PostNode) {
  const baseSx = n.x - cam.x + W / 2
  const baseSy = n.y - cam.y + H / 2
  // 用卡片中心计算需要平移几个世界周期，让副本尽量靠近视口
  const cx = baseSx + n.w / 2
  const cy = baseSy + n.h / 2
  const kx = Math.round((W / 2 - cx) / CW)
  const ky = Math.round((H / 2 - cy) / CH)
  return { sx: baseSx + kx * CW, sy: baseSy + ky * CH }
}

function draw() {
  if (!ctx) return
  ctx.clearRect(0, 0, W, H)
  for (const n of nodes) {
    if (n.alpha < 0.01) continue
    const { sx, sy } = project(n)
    // 视口裁剪
    if (sx + n.w < 0 || sx > W || sy + n.h < 0 || sy > H) continue
    drawCard(ctx, n, sx, sy)
  }
}

function roundRect(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  c.beginPath()
  c.moveTo(x + r, y)
  c.arcTo(x + w, y, x + w, y + h, r)
  c.arcTo(x + w, y + h, x, y + h, r)
  c.arcTo(x, y + h, x, y, r)
  c.arcTo(x, y, x + w, y, r)
  c.closePath()
}

function clipText(c: CanvasRenderingContext2D, text: string, maxW: number) {
  if (c.measureText(text).width <= maxW) return text
  let t = text
  while (t.length && c.measureText(t + '…').width > maxW) t = t.slice(0, -1)
  return t + '…'
}

/** 悬停时卡片略微放大 */
function nodeScale(n: PostNode) {
  return n.scale * (n.hover && !n.deleting ? 1.05 : 1)
}

/** 删除按钮在屏幕上的圆心（跟随卡片缩放） */
function binCenter(n: PostNode, sx: number, sy: number) {
  const s = nodeScale(n)
  return {
    x: sx + n.w / 2 + (n.w / 2 - 20) * s,
    y: sy + n.h / 2 + (n.h / 2 - 20) * s,
  }
}

function drawDeleteButton(c: CanvasRenderingContext2D, n: PostNode) {
  const bx = n.w - 20
  const by = n.h - 20
  c.beginPath()
  c.arc(bx, by, BIN_R, 0, Math.PI * 2)
  c.fillStyle = n.hoverBin ? 'rgba(228, 62, 62, 0.95)' : 'rgba(30, 30, 30, 0.55)'
  c.fill()
  c.strokeStyle = '#fff'
  c.lineWidth = 1.6
  c.lineCap = 'round'
  c.lineJoin = 'round'
  // 桶盖
  c.beginPath()
  c.moveTo(bx - 5.5, by - 3.5)
  c.lineTo(bx + 5.5, by - 3.5)
  c.stroke()
  // 提手
  c.beginPath()
  c.moveTo(bx - 2, by - 6)
  c.lineTo(bx + 2, by - 6)
  c.stroke()
  // 桶身
  c.beginPath()
  c.moveTo(bx - 4, by - 2)
  c.lineTo(bx - 3.2, by + 5)
  c.lineTo(bx + 3.2, by + 5)
  c.lineTo(bx + 4, by - 2)
  c.stroke()
  // 竖纹
  c.beginPath()
  c.moveTo(bx - 1.4, by - 0.5)
  c.lineTo(bx - 1.4, by + 3.2)
  c.moveTo(bx + 1.4, by - 0.5)
  c.lineTo(bx + 1.4, by + 3.2)
  c.stroke()
}

function drawCard(c: CanvasRenderingContext2D, n: PostNode, sx: number, sy: number) {
  c.save()
  c.globalAlpha = n.alpha
  c.translate(sx + n.w / 2, sy + n.h / 2)
  c.scale(nodeScale(n), nodeScale(n))
  c.translate(-n.w / 2, -n.h / 2)

  // 阴影 + 底板
  c.shadowColor = 'rgba(0,0,0,0.18)'
  c.shadowBlur = 18
  c.shadowOffsetY = 6
  roundRect(c, 0, 0, n.w, n.h, 14)
  c.fillStyle = '#ffffff'
  c.fill()
  c.shadowColor = 'transparent'
  c.shadowBlur = 0
  c.shadowOffsetY = 0

  // 封面（cover 裁剪）
  const imgH = n.h * 0.62
  if (n.imgReady && n.img) {
    c.save()
    roundRect(c, 0, 0, n.w, imgH, 14)
    c.clip()
    const iw = n.img.naturalWidth,
      ih = n.img.naturalHeight
    const s = Math.max(n.w / iw, imgH / ih)
    const dw = iw * s,
      dh = ih * s
    c.drawImage(n.img, (n.w - dw) / 2, (imgH - dh) / 2, dw, dh)
    c.restore()
  } else {
    roundRect(c, 0, 0, n.w, imgH, 14)
    c.fillStyle = '#f0f0f0'
    c.fill()
  }

  // 标题
  c.fillStyle = '#1f1f1f'
  c.font = '600 15px -apple-system, system-ui, sans-serif'
  c.textBaseline = 'top'
  c.fillText(clipText(c, String(n.data.title), n.w - 24), 12, imgH + 12)

  // 日期
  if (n.data.created_at) {
    c.fillStyle = '#9a9a9a'
    c.font = '400 12px -apple-system, system-ui, sans-serif'
    c.fillText(formatDate(String(n.data.created_at)), 12, n.h - 22)
  }

  // 悬停时显示删除按钮
  if (n.hover && !n.deleting) drawDeleteButton(c, n)

  c.restore()
}

/* ---------------- 交互 ---------------- */

let dragging = false
let dragMode: 'canvas' | 'card' | null = null
let dragNode: PostNode | null = null
let lastX = 0,
  lastY = 0,
  downX = 0,
  downY = 0
let moved = false
let hoverNode: PostNode | null = null

/** 世界坐标取模，保持数值有界；同时平移当前坐标，屏幕位置不变 */
function wrapWorld(n: PostNode) {
  if (n.tx >= CW) {
    n.tx -= CW
    n.x -= CW
  } else if (n.tx < 0) {
    n.tx += CW
    n.x += CW
  }
  if (n.ty >= CH) {
    n.ty -= CH
    n.y -= CH
  } else if (n.ty < 0) {
    n.ty += CH
    n.y += CH
  }
}

function wrapCamera() {
  if (cam.tx >= CW) {
    cam.tx -= CW
    cam.x -= CW
  } else if (cam.tx < 0) {
    cam.tx += CW
    cam.x += CW
  }
  if (cam.ty >= CH) {
    cam.ty -= CH
    cam.y -= CH
  } else if (cam.ty < 0) {
    cam.ty += CH
    cam.y += CH
  }
}

function hitTest(clientX: number, clientY: number): PostNode | null {
  const rect = canvasRef.value!.getBoundingClientRect()
  const px = clientX - rect.left
  const py = clientY - rect.top
  // 后画的在上层，倒序命中
  for (let i = nodes.length - 1; i >= 0; i--) {
    const n = nodes[i]
    if (n.alpha < 0.5) continue
    const { sx, sy } = project(n)
    if (px >= sx && px <= sx + n.w && py >= sy && py <= sy + n.h) return n
  }
  return null
}

function isOverBin(n: PostNode, clientX: number, clientY: number) {
  const rect = canvasRef.value!.getBoundingClientRect()
  const { sx, sy } = project(n)
  const p = binCenter(n, sx, sy)
  return Math.hypot(clientX - rect.left - p.x, clientY - rect.top - p.y) <= BIN_R
}

function updateHover(clientX: number, clientY: number) {
  const n = diagram.if_visible.value && !appStore.show_detail ? hitTest(clientX, clientY) : null
  if (hoverNode && hoverNode !== n) {
    hoverNode.hover = false
    hoverNode.hoverBin = false
  }
  hoverNode = n
  if (n) {
    n.hover = true
    n.hoverBin = isOverBin(n, clientX, clientY)
  }
  if (canvasRef.value) canvasRef.value.style.cursor = n?.hoverBin ? 'pointer' : 'grab'
}

function resetDrag() {
  dragging = false
  dragMode = null
  dragNode = null
  moved = false
}

function handleDelete(n: PostNode) {
  if (n.deleting) return
  n.deleting = true
  n.hover = false
  n.hoverBin = false
  if (hoverNode === n) hoverNode = null
  const uri = String(n.data.uri)
  ArticleAPI.delete(uri)
    .then(() => {
      appStore.notify?.('数据已删除')
      n.targetAlpha = 0
      n.targetScale = 0.85
      diagram.postList.value = diagram.postList.value.filter((item) => String(item.uri) !== uri)
      setTimeout(() => {
        const i = nodes.indexOf(n)
        if (i >= 0) nodes.splice(i, 1)
      }, 240)
    })
    .catch((e: unknown) => {
      n.deleting = false
      appStore.notify?.(e instanceof Error ? e.message : String(e))
    })
}

function onPointerDown(e: PointerEvent) {
  if (!diagram.if_visible.value || appStore.show_detail) return
  updateHover(e.clientX, e.clientY)
  // 命中删除按钮时直接删除，不进入拖拽
  if (hoverNode && hoverNode.hoverBin) {
    handleDelete(hoverNode)
    return
  }
  dragging = true
  moved = false
  downX = lastX = e.clientX
  downY = lastY = e.clientY
  const n = hitTest(e.clientX, e.clientY)
  if (n) {
    dragMode = 'card'
    dragNode = n
    // 把卡片提到最上层
    const i = nodes.indexOf(n)
    if (i >= 0 && i !== nodes.length - 1) {
      nodes.splice(i, 1)
      nodes.push(n)
    }
  } else {
    dragMode = 'canvas'
    dragNode = null
  }
  canvasRef.value?.setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!dragging) {
    updateHover(e.clientX, e.clientY)
    return
  }
  const dx = e.clientX - lastX
  const dy = e.clientY - lastY
  lastX = e.clientX
  lastY = e.clientY
  if (!moved && (Math.abs(e.clientX - downX) > 3 || Math.abs(e.clientY - downY) > 3)) {
    moved = true
  }

  if (dragMode === 'canvas') {
    // 拖动画布：相机向反方向移动
    cam.tx -= dx
    cam.ty -= dy
    wrapCamera()
  } else if (dragMode === 'card' && dragNode) {
    // 拖卡片：目标世界坐标跟随（相机此时基本稳定）
    dragNode.tx += dx
    dragNode.ty += dy
    wrapWorld(dragNode)
  }
}

function onPointerUp(e: PointerEvent) {
  if (!dragging) return
  canvasRef.value?.releasePointerCapture(e.pointerId)
  const n = dragNode
  const wasMoved = moved
  // 触摸没有 hover 概念，抬手时清掉悬停态
  if (e.pointerType !== 'mouse' && n) {
    n.hover = false
    n.hoverBin = false
  }
  resetDrag()
  if (!wasMoved && n) {
    // 点击卡片：打开文章详情，与 Post.vue 的 show_details 保持一致
    appStore.post_data = n.data
    appStore.edit_mode = false
    appStore.show_tab?.()
  } else if (e.pointerType === 'mouse') {
    updateHover(e.clientX, e.clientY)
  }
}

/* ---------------- 对外接口 ---------------- */

const diagram = {
  if_visible: ref(false),
  postList: ref<Article[]>([]),

  async show() {
    const list: Article[] = await ArticleAPI.getList({ page: 1, limit: 10 })
      .then((r) => r.data as Article[])
      .catch(() => [])
    diagram.postList.value = list
    hoverNode = null

    nextTick(() => {
      diagram.if_visible.value = true
      resize()

      nodes.length = 0
      list.forEach((a, i) => nodes.push(makeNode(a, i)))

      // 相机对准世界中心
      cam.x = cam.tx = CW / 2
      cam.y = cam.ty = CH / 2
      cam.vx = cam.vy = 0

      // 入场错峰淡入
      nodes.forEach((n, i) => {
        n.alpha = 0
        n.scale = 0.8
        n.targetAlpha = 1
        n.targetScale = 1
        setTimeout(() => {
          n.targetAlpha = 1
          n.targetScale = 1
        }, i * 60)
      })

      startLoop()
    })
  },

  hide(immediate?: () => void, next?: () => void) {
    hoverNode = null
    nodes.forEach((n) => {
      n.hover = false
      n.hoverBin = false
      n.targetAlpha = 0
      n.targetScale = 0.9
    })
    immediate?.()
    setTimeout(() => {
      stopLoop()
      diagram.if_visible.value = false
      nodes.length = 0
      next?.()
    }, 240)
  },

  addPost(a: Article) {
    diagram.postList.value.push(a)
    nodes.push(makeNode(a, nodes.length))
  },
}

appStore.update_diagram = diagram.addPost.bind(diagram)
appStore.show_diagram = diagram.show.bind(diagram)
appStore.hide_diagram = diagram.hide.bind(diagram)

/* ---------------- 生命周期 ---------------- */

function onResize() {
  if (!diagram.if_visible.value) return
  resize()
  // 相机重新对准世界中心
  cam.x = cam.tx = CW / 2
  cam.y = cam.ty = CH / 2
}

onMounted(() => {
  const cv = canvasRef.value
  cv?.addEventListener('pointerdown', onPointerDown)
  cv?.addEventListener('pointermove', onPointerMove)
  cv?.addEventListener('pointerup', onPointerUp)
  cv?.addEventListener('pointercancel', onPointerUp)
  window.addEventListener('resize', onResize)
  console.log('DS')
})

onUnmounted(() => {
  stopLoop()
  const cv = canvasRef.value
  cv?.removeEventListener('pointerdown', onPointerDown)
  cv?.removeEventListener('pointermove', onPointerMove)
  cv?.removeEventListener('pointerup', onPointerUp)
  cv?.removeEventListener('pointercancel', onPointerUp)
  window.removeEventListener('resize', onResize)
})
</script>
<style lang="scss" scoped>
.posts-diagram-container {
  position: fixed;
  inset: 0;
  overflow: hidden;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }

  .diagram-canvas {
    display: block;
    width: 100%;
    height: 100%;
    touch-action: none; // 让 pointer 事件接管触摸拖拽
  }
}
</style>
