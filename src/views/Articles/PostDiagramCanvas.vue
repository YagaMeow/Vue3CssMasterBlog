<template>
  <div class="posts-diagram-container _fullscreen" v-show="diagram.if_visible.value" ref="containerRef">
    <canvas ref="canvasRef" class="diagram-canvas"></canvas>
    <Transition name="popover">
      <div v-if="popover.visible" class="edge-popover" :style="{ left: popover.x + 'px', top: popover.y + 'px' }">
        <div class="edge-popover-title">{{ popover.title }}</div>
        <div v-if="popover.date" class="edge-popover-date">{{ popover.date }}</div>
      </div>
    </Transition>
  </div>
</template>
<script lang="ts" setup>
defineOptions({ name: 'PostDiagramCanvas' })

import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { ArticleAPI } from '@/api/api'
import { useAppStore } from '@/pinia'
import { formatDate, range } from '@/utils/utils'
import type { Article,Tag } from '@/utils/utils'

const appStore = useAppStore()

const containerRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

let ctx: CanvasRenderingContext2D | null = null
let W = 0, H = 0, DPR = 1
let CW = 0, CH = 0 // 世界尺寸 = 3W × 3H
let rafId = 0
let lastT = 0

/* ---------------- 可调参数 ---------------- */

const CARD_W = 250
const CARD_H = 250
const CARD_R = 18
const BIN_R = 13

// 惯性：越接近 1，松手后滑得越远（每帧衰减系数）
const CAM_FRICTION = 0.96
const NODE_FRICTION = 0.94
const MIN_SPEED = 0.02
const MAX_SPEED = 80

// 缓动速率（指数逼近，无回弹）
const EASE_ALPHA = 0.16
const EASE_SCALE = 0.18
const EASE_HOVER = 0.2
const EASE_CAM = 0.12

const FONT_TITLE = '600 15px -apple-system, system-ui, "Noto Sans JP", sans-serif'
const FONT_DATE = '500 11px -apple-system, system-ui, sans-serif'

// 屏幕边缘指示点
const EDGE_PAD = 18        // 圆点中心距屏幕边缘的距离
const EDGE_DOT_OUTER = 9   // 白色外圈半径
const EDGE_DOT_INNER = 6   // 彩色内圈半径

// popover
const POPOVER_W = 220
const POPOVER_GAP = 14

interface PostNode {
  data: Article
  title: string
  date: string
  tags: Tag[]
  x: number
  y: number
  vx: number
  vy: number
  w: number
  h: number
  img: HTMLImageElement | null
  imgReady: boolean
  bgstyle: number
  alpha: number
  targetAlpha: number
  scale: number
  targetScale: number
  oy: number // 入场纵向偏移（缓动到 0）
  wait: number // 入场错峰剩余帧数
  hover: number // 悬停插值 0~1
  hoverTarget: number
  hoverBin: boolean
  deleting: boolean
  lines: string[] | null // 缓存折行后的标题
}

const nodes: PostNode[] = []
// cam 表示「屏幕正中心对应的世界坐标」
const cam = { x: 0, y: 0, vx: 0, vy: 0 }
const camTarget = { x: 0, y: 0, active: false }

// 每帧缓存的边缘指示点位置，供命中检测使用
let edgeHits: { n: PostNode; bx: number; by: number }[] = []

// popover 状态
const popover = reactive({
  visible: false,
  x: 0,
  y: 0,
  title: '',
  date: '',
})
let popoverNode: PostNode | null = null

/* ---------------- 初始化 / 尺寸 ---------------- */

function resize() {
  if (!canvasRef.value) return
  DPR = Math.min(window.devicePixelRatio || 1, 2)
  W = window.innerWidth
  H = window.innerHeight
  canvasRef.value.width = Math.round(W * DPR)
  canvasRef.value.height = Math.round(H * DPR)
  canvasRef.value.style.width = W + 'px'
  canvasRef.value.style.height = H + 'px'
  ctx = canvasRef.value.getContext('2d')
  ctx?.setTransform(DPR, 0, 0, DPR, 0, 0)
  CW = 3 * W
  CH = 3 * H
  for (const n of nodes) n.lines = null
}

/* ---------------- 节点创建 ---------------- */

function makeNode(a: Article, idx: number, total: number): PostNode {
  // 围绕世界中心 (1.5W, 1.5H) 环形散布
  const angle = (idx / Math.max(total, 1)) * Math.PI * 2
  const radius = Math.min(W, H) * 0.2 + (idx % 3) * 400
  const cx = CW / 2 + Math.cos(angle) * radius
  const cy = CH / 2 + Math.sin(angle) * radius
  const node: PostNode = {
    data: a,
    title: a.title ? String(a.title) : '',
    date: a.created_at ? formatDate(String(a.created_at)) : '',
    tags: a.tags,
    x: cx,
    y: cy,
    vx: 0,
    vy: 0,
    w: CARD_W,
    h: CARD_H,
    img: null,
    imgReady: false,
    bgstyle: Math.floor(range(1, 7)),
    alpha: 0,
    targetAlpha: 1,
    scale: 0.86,
    targetScale: 1,
    oy: 26,
    wait: 0,
    hover: 0,
    hoverTarget: 0,
    hoverBin: false,
    deleting: false,
    lines: null,
  }
  if (a.cover && a.cover.width && a.cover.height) {
    const ratio = a.cover.height / a.cover.width
    if (a.cover.height > a.cover.width) {
      node.h = node.w * ratio
    }
    else {
      node.w = node.h / ratio
    }
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
    requestRender()
  }
  img.onerror = () => {
    // 网络封面加载失败时退回本地占位图，仍然失败则显示渐变色块
    if (!img.src.endsWith(fallback)) img.src = fallback
    else n.imgReady = false
  }
  img.src = coverUrl(n.data) || fallback
  n.img = img
}

/* ---------------- 交互状态 ---------------- */

let dragging = false
let dragMode: 'canvas' | 'card' | null = null
let dragNode: PostNode | null = null
let lastX = 0
let lastY = 0
let downX = 0
let downY = 0
let moved = false
let lastMoveT = 0
let hoverNode: PostNode | null = null

/* ---------------- 主循环（按需渲染） ---------------- */

function requestRender() {
  if (rafId || !diagram.if_visible.value || document.hidden) return
  lastT = 0
  rafId = requestAnimationFrame(tick)
}

function stopLoop() {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = 0
}

/** 是否还有未完成的动效：拖拽 / 惯性 / 淡入淡出 / 悬停过渡 / 相机飞行 */
function hasWork() {
  if (dragging) return true
  if (camTarget.active) return true
  if (cam.vx !== 0 || cam.vy !== 0) return true
  for (const n of nodes) {
    if (n.wait > 0 || n.vx !== 0 || n.vy !== 0 || n.oy > 0.1) return true
    if (Math.abs(n.alpha - n.targetAlpha) > 0.002) return true
    if (Math.abs(n.scale - n.targetScale) > 0.002) return true
    if (Math.abs(n.hover - n.hoverTarget) > 0.002) return true
  }
  return false
}

function decay(v: number, friction: number, dt: number) {
  const next = v * Math.pow(friction, dt)
  return Math.abs(next) < MIN_SPEED ? 0 : next
}

function clampSpeed(v: number) {
  return v > MAX_SPEED ? MAX_SPEED : v < -MAX_SPEED ? -MAX_SPEED : v
}

/** 求两坐标在一个周期内的最短差值（处理环绕） */
function shortestDelta(from: number, to: number, period: number) {
  let d = to - from
  if (d > period / 2) d -= period
  else if (d < -period / 2) d += period
  return d
}

function tick(t: number) {
  rafId = 0
  const dt = lastT ? Math.min((t - lastT) / 16.667, 3) : 1
  lastT = t

  // 相机飞向指定节点
  if (camTarget.active) {
    const dx = shortestDelta(cam.x, camTarget.x, CW)
    const dy = shortestDelta(cam.y, camTarget.y, CH)
    const ease = Math.min(EASE_CAM * dt, 1)
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
      cam.x = camTarget.x
      cam.y = camTarget.y
      camTarget.active = false
      wrapCamera()
    } else {
      cam.x += dx * ease
      cam.y += dy * ease
      wrapCamera()
    }
  } else if (cam.vx !== 0 || cam.vy !== 0) {
    // 相机惯性（拖拽中由指针直接驱动，松手后按摩擦滑行）
    cam.x -= cam.vx * dt
    cam.y -= cam.vy * dt
    cam.vx = decay(cam.vx, CAM_FRICTION, dt)
    cam.vy = decay(cam.vy, CAM_FRICTION, dt)
    wrapCamera()
  }

  for (const n of nodes) {
    if (n.wait > 0) {
      n.wait -= dt
      continue
    }
    // 卡片惯性（拖拽中的卡片由指针直接驱动）
    if (!(dragging && dragMode === 'card' && dragNode === n) && (n.vx !== 0 || n.vy !== 0)) {
      n.x += n.vx * dt
      n.y += n.vy * dt
      n.vx = decay(n.vx, NODE_FRICTION, dt)
      n.vy = decay(n.vy, NODE_FRICTION, dt)
      wrapWorld(n)
    }
    n.alpha += (n.targetAlpha - n.alpha) * Math.min(EASE_ALPHA * dt, 1)
    n.scale += (n.targetScale - n.scale) * Math.min(EASE_SCALE * dt, 1)
    n.hover += (n.hoverTarget - n.hover) * Math.min(EASE_HOVER * dt, 1)
    if (n.oy > 0.1) n.oy += (0 - n.oy) * Math.min(EASE_SCALE * dt, 1)
    else n.oy = 0
  }

  draw()
  if (hasWork() && !document.hidden) rafId = requestAnimationFrame(tick)
}

/* ---------------- 绘制 ---------------- */

/** 世界坐标 -> 屏幕坐标，并选中最接近视口的那个「环绕副本」 */
function project(n: PostNode) {
  const baseSx = n.x - cam.x + W / 2
  const baseSy = n.y - cam.y + H / 2
  const cx = baseSx + n.w / 2
  const cy = baseSy + n.h / 2
  const kx = Math.round((W / 2 - cx) / CW)
  const ky = Math.round((H / 2 - cy) / CH)
  return { sx: baseSx + kx * CW, sy: baseSy + ky * CH }
}

/** 悬停时卡片略微放大 */
function nodeScale(n: PostNode) {
  return n.scale * (1 + 0.06 * n.hover)
}

/** 卡片中心的屏幕坐标（含悬停缩放） */
function nodeCenter(n: PostNode) {
  const { sx, sy } = project(n)
  return { cx: sx + n.w / 2, cy: sy + n.oy + n.h / 2, s: nodeScale(n) }
}

function draw() {
  if (!ctx) return
  ctx.clearRect(0, 0, W, H)

  const offscreen: { n: PostNode; sx: number; sy: number }[] = []

  for (const n of nodes) {
    if (n.alpha < 0.01) continue
    const { sx, sy } = project(n)
    const y = sy + n.oy
    // 完全在屏幕外：记为边缘指示，跳过绘制卡片本体
    if (sx + n.w < 0 || sx > W || y + n.h < 0 || y > H) {
      offscreen.push({ n, sx, sy: y })
      continue
    }
    drawCard(ctx, n, sx, y)
  }

  // 指示点画在最上层
  edgeHits = []
  for (const item of offscreen) {
    drawEdgeIndicator(ctx, item.n, item.sx, item.sy)
  }

  // popover 跟随指示点移动
  if (popoverNode) {
    const hit = edgeHits.find((h) => h.n === popoverNode)
    if (hit) positionPopover(hit.bx, hit.by)
    else {
      popover.visible = false
      popoverNode = null
    }
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

/** 按宽度折行，最多 maxLines 行，超出用省略号 */
function wrapText(c: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number) {
  const lines: string[] = []
  let line = ''
  for (const ch of Array.from(text)) {
    if (line && c.measureText(line + ch).width > maxW) {
      lines.push(line)
      line = ch
    } else {
      line += ch
    }
  }
  if (line) lines.push(line)
  if (lines.length <= maxLines) return lines
  const kept = lines.slice(0, maxLines)
  let last = kept[maxLines - 1]
  while (last.length && c.measureText(last + '…').width > maxW) last = last.slice(0, -1)
  kept[maxLines - 1] = last + '…'
  return kept
}

/** 没有可用封面时的渐变底 */
function drawPlaceholder(c: CanvasRenderingContext2D, n: PostNode, imgH: number) {
  const hue = (n.bgstyle * 53) % 360
  const g = c.createLinearGradient(0, 0, n.w, imgH)
  g.addColorStop(0, `hsl(${hue}, 72%, 88%)`)
  g.addColorStop(1, `hsl(${(hue + 42) % 360}, 70%, 76%)`)
  roundRect(c, 0, 0, n.w, imgH, CARD_R)
  c.fillStyle = g
  c.fill()
}

function drawDeleteButton(c: CanvasRenderingContext2D, n: PostNode) {
  const bx = n.w - 20
  const by = n.h - 20
  const pop = 0.7 + 0.3 * n.hover
  c.save()
  c.globalAlpha = Math.min(1, n.hover * 1.4)
  c.translate(bx, by)
  c.scale(pop, pop)
  c.translate(-bx, -by)
  c.beginPath()
  c.arc(bx, by, BIN_R, 0, Math.PI * 2)
  c.fillStyle = n.hoverBin ? '#e5484d' : 'rgba(22, 24, 31, 0.62)'
  c.fill()
  c.strokeStyle = 'rgba(255, 255, 255, 0.85)'
  c.lineWidth = 1.1
  c.stroke()
  c.strokeStyle = '#ffffff'
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
  c.restore()
}

/** 卡片中心在屏幕外时，在屏幕边缘画一个 bgstyle 颜色的小圆点指示方位 */
function drawEdgeIndicator(
  c: CanvasRenderingContext2D,
  n: PostNode,
  sx: number,
  sy: number, // 已包含 n.oy
) {
  const cx = sx + n.w / 2
  const cy = sy + n.h / 2

  const centerX = W / 2
  const centerY = H / 2
  const dx = cx - centerX
  const dy = cy - centerY
  if (dx === 0 && dy === 0) return

  // 从屏幕中心沿 (dx, dy) 方向射线，与内缩矩形求交
  const maxX = W / 2 - EDGE_PAD
  const maxY = H / 2 - EDGE_PAD
  const tx = dx !== 0 ? maxX / Math.abs(dx) : Infinity
  const ty = dy !== 0 ? maxY / Math.abs(dy) : Infinity
  const t = Math.min(tx, ty)
  const bx = centerX + dx * t
  const by = centerY + dy * t

  // 与封面占位图同一套色相，保持视觉一致
  const hue = (n.bgstyle * 53) % 360

  c.save()
  c.globalAlpha = n.alpha

  // 白色外圈：让圆点在深色/浅色背景下都能看清
  c.beginPath()
  c.arc(bx, by, EDGE_DOT_OUTER, 0, Math.PI * 2)
  c.fillStyle = 'rgba(255, 255, 255, 0.92)'
  c.fill()

  // 内圈 bgstyle 颜色
  c.beginPath()
  c.arc(bx, by, EDGE_DOT_INNER, 0, Math.PI * 2)
  c.fillStyle = `hsl(${hue}, 72%, 58%)`
  c.fill()

  c.restore()

  // 缓存位置，供命中检测 / popover 跟随使用
  edgeHits.push({ n, bx, by })
}

function drawCard(c: CanvasRenderingContext2D, n: PostNode, sx: number, sy: number) {
  const s = nodeScale(n)
  c.save()
  c.globalAlpha = n.alpha
  c.translate(sx + n.w / 2, sy + n.h / 2)
  c.scale(s, s)
  c.translate(-n.w / 2, -n.h / 2)

  // 阴影 + 底板
  c.shadowColor = `rgba(10, 14, 26, ${0.14 + 0.12 * n.hover})`
  c.shadowBlur = 20 + 16 * n.hover
  c.shadowOffsetY = 9 + 7 * n.hover
  roundRect(c, 0, 0, n.w, n.h, CARD_R)
  c.fillStyle = '#ffffff'
  c.fill()
  c.shadowColor = 'transparent'
  c.shadowBlur = 0
  c.shadowOffsetY = 0

  // 封面
  // const imgH = Math.round(n.h * 0.6)
  const imgH = n.h
  if (n.imgReady && n.img) {
    c.save()
    roundRect(c, 0, 0, n.w, imgH, CARD_R)
    c.clip()
    const iw = n.img.naturalWidth
    const ih = n.img.naturalHeight
    const k = Math.max(n.w / iw, imgH / ih)
    const dw = iw * k
    const dh = ih * k
    c.drawImage(n.img, (n.w - dw) / 2, (imgH - dh) / 2, dw, dh)
    // 底部轻微压暗，标题区过渡更自然
    const ov = c.createLinearGradient(0, imgH * 0.55, 0, imgH)
    ov.addColorStop(0, 'rgba(0, 0, 0, 0)')
    ov.addColorStop(1, 'rgba(0, 0, 0, 0.16)')
    c.fillStyle = ov
    c.fillRect(0, 0, n.w, imgH)
    c.restore()
  } else {
    drawPlaceholder(c, n, imgH)
  }

  // 标题（最多两行，结果缓存）
  let lines = n.lines
  if (!lines) {
    c.font = FONT_TITLE
    lines = wrapText(c, n.title, n.w - 28, 2)
    n.lines = lines
  }
  c.font = FONT_TITLE
  c.fillStyle = '#1b1f2a'
  c.textBaseline = 'top'
  let ty = imgH - 50
  for (const line of lines) {
    c.fillText(line, 14, ty)
    ty += 19
  }

  // 日期
  if (n.date) {
    c.font = FONT_DATE
    c.fillStyle = '#9aa0b0'
    c.textBaseline = 'alphabetic'
    c.fillText(n.date, 14, n.h - 15)
  }

  // 悬停时浮出删除按钮
  if (n.hover > 0.02 && !n.deleting) drawDeleteButton(c, n)

  c.restore()
}

/* ---------------- 命中 / 交互 ---------------- */

function hitTest(clientX: number, clientY: number): PostNode | null {
  const rect = canvasRef.value!.getBoundingClientRect()
  const px = clientX - rect.left
  const py = clientY - rect.top
  // 后画的在上层，倒序命中
  for (let i = nodes.length - 1; i >= 0; i--) {
    const n = nodes[i]
    if (n.alpha < 0.5 || n.deleting) continue
    const { cx, cy, s } = nodeCenter(n)
    const hw = (n.w * s) / 2
    const hh = (n.h * s) / 2
    if (px >= cx - hw && px <= cx + hw && py >= cy - hh && py <= cy + hh) return n
  }
  return null
}

/** 命中屏幕边缘的指示点 */
function hitTestEdge(px: number, py: number) {
  const r = EDGE_DOT_OUTER + 4
  for (const h of edgeHits) {
    if (Math.hypot(px - h.bx, py - h.by) <= r) return h
  }
  return null
}

function isOverBin(n: PostNode, clientX: number, clientY: number) {
  const rect = canvasRef.value!.getBoundingClientRect()
  const { cx, cy, s } = nodeCenter(n)
  const bx = cx + (n.w / 2 - 20) * s
  const by = cy + (n.h / 2 - 20) * s
  return Math.hypot(clientX - rect.left - bx, clientY - rect.top - by) <= BIN_R
}

/** 计算 popover 位置（默认放在圆点上方，放不下就放下方） */
function positionPopover(bx: number, by: number) {
  let x = bx - POPOVER_W / 2
  let y = by - POPOVER_GAP - 56
  x = Math.max(8, Math.min(W - POPOVER_W - 8, x))
  if (y < 8) y = by + POPOVER_GAP + EDGE_DOT_OUTER
  popover.x = x
  popover.y = y
}

function updateHover(clientX: number, clientY: number) {
  const rect = canvasRef.value!.getBoundingClientRect()
  const px = clientX - rect.left
  const py = clientY - rect.top

  const cardHit =
    diagram.if_visible.value && !appStore.show_detail
      ? hitTest(clientX, clientY)
      : null

  const changed = cardHit !== hoverNode
  if (changed) {
    if (hoverNode) {
      hoverNode.hoverTarget = 0
      hoverNode.hoverBin = false
    }
    hoverNode = cardHit
    if (cardHit) cardHit.hoverTarget = 1
  }
  let dirty = false
  if (cardHit) {
    const overbin = isOverBin(cardHit, clientX, clientY)
    if (cardHit.hoverBin != overbin) {
      cardHit.hoverBin = overbin
      dirty = true
    }
  }

  // 边缘指示点 hover（只有没命中卡片时才检测）
  const edgeHit =
    !cardHit && diagram.if_visible.value && !appStore.show_detail
      ? hitTestEdge(px, py)
      : null

  if (edgeHit) {
    popoverNode = edgeHit.n
    popover.visible = true
    popover.title = edgeHit.n.title || '无标题'
    popover.date = edgeHit.n.date
    positionPopover(edgeHit.bx, edgeHit.by)
  } else {
    popoverNode = null
    popover.visible = false
  }

  if (canvasRef.value) {
    if (edgeHit) canvasRef.value.style.cursor = 'pointer'
    else if (cardHit) canvasRef.value.style.cursor = cardHit.hoverBin ? 'pointer' : 'grab'
    else canvasRef.value.style.cursor = 'grab'
  }

  if (changed || dirty) requestRender()
}

/** 让相机平滑飞到指定节点 */
function focusNode(n: PostNode) {
  camTarget.x = (((n.x + n.w / 2) % CW) + CW) % CW
  camTarget.y = (((n.y + n.h / 2) % CH) + CH) % CH
  camTarget.active = true
  cam.vx = cam.vy = 0
  popover.visible = false
  popoverNode = null
  requestRender()
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
  n.hover = 0
  n.hoverTarget = 0
  n.hoverBin = false
  n.vx = n.vy = 0
  if (hoverNode === n) hoverNode = null
  if (popoverNode === n) {
    popoverNode = null
    popover.visible = false
  }
  const uri = String(n.data.uri)
  ArticleAPI.delete(uri)
    .then(() => {
      appStore.notify?.('数据已删除')
      n.targetAlpha = 0
      n.targetScale = 0.85
      requestRender()
      diagram.postList.value = diagram.postList.value.filter((item) => String(item.uri) !== uri)
      setTimeout(() => {
        const i = nodes.indexOf(n)
        if (i >= 0) nodes.splice(i, 1)
      }, 260)
    })
    .catch((e: unknown) => {
      n.deleting = false
      appStore.notify?.(e instanceof Error ? e.message : String(e))
    })
}

function onPointerDown(e: PointerEvent) {
  if (!diagram.if_visible.value || appStore.show_detail) return
  updateHover(e.clientX, e.clientY)

  // 优先响应边缘指示点：点击后相机飞过去，不进入拖拽
  const rect = canvasRef.value!.getBoundingClientRect()
  const px = e.clientX - rect.left
  const py = e.clientY - rect.top
  const edgeHit = hitTestEdge(px, py)
  if (edgeHit) {
    focusNode(edgeHit.n)
    return
  }

  // 命中删除按钮时直接删除，不进入拖拽
  if (hoverNode && hoverNode.hoverBin) {
    handleDelete(hoverNode)
    return
  }
  dragging = true
  moved = false
  downX = lastX = e.clientX
  downY = lastY = e.clientY
  lastMoveT = performance.now()
  const n = hitTest(e.clientX, e.clientY)
  if (n) {
    dragMode = 'card'
    dragNode = n
    n.vx = 0
    n.vy = 0
    // 把卡片提到最上层
    const i = nodes.indexOf(n)
    if (i >= 0 && i !== nodes.length - 1) {
      nodes.splice(i, 1)
      nodes.push(n)
    }
  } else {
    dragMode = 'canvas'
    dragNode = null
    cam.vx = 0
    cam.vy = 0
    camTarget.active = false
  }
  requestRender()
  canvasRef.value?.setPointerCapture(e.pointerId)
}

let lt = 0
function onPointerMove(e: PointerEvent) {
  if (!dragging) {
    updateHover(e.clientX, e.clientY)
    return
  }
  const t = new Date().getTime()
  const dt = lt ? Math.min((t - lt) / 16.667, 3) : 1
  lt = t
  const dx = e.clientX - lastX
  const dy = e.clientY - lastY
  lastX = e.clientX
  lastY = e.clientY
  lastMoveT = performance.now()
  if (!moved && (Math.abs(e.clientX - downX) > 3 || Math.abs(e.clientY - downY) > 3)) {
    moved = true
  }
  if (dragMode === 'canvas') {
    // 拖动画布：直接跟手，并记录速度用于松手后的惯性滑行
    cam.vx = clampSpeed(cam.vx + dx / 5)
    cam.vy = clampSpeed(cam.vy + dy / 5)
    wrapCamera()
  } else if (dragMode === 'card' && dragNode) {
    dragNode.x += dx
    dragNode.y += dy
    dragNode.vx = clampSpeed(dx)
    dragNode.vy = clampSpeed(dy)
    wrapWorld(dragNode)
  }
  requestRender()
}

function onPointerUp(e: PointerEvent) {
  if (!dragging) return
  canvasRef.value?.releasePointerCapture(e.pointerId)
  const n = dragNode
  const wasMoved = moved
  // 松手前若已停住，就不触发惯性
  // if (performance.now() - lastMoveT > 90) {
  //   console.log("aa")
  //   cam.vx = cam.vy = 0
  //   if (n) {
  //     n.vx = n.vy = 0
  //   }
  // }
  // 触摸没有 hover 概念，抬手时清掉悬停态
  if (e.pointerType !== 'mouse' && n) {
    n.hoverTarget = 0
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
  requestRender()
}

/* ---------------- 世界环绕 ---------------- */

function wrapWorld(n: PostNode) {
  if (n.x >= CW) n.x -= CW
  else if (n.x < 0) n.x += CW
  if (n.y >= CH) n.y -= CH
  else if (n.y < 0) n.y += CH
}

function wrapCamera() {
  if (cam.x >= CW) cam.x -= CW
  else if (cam.x < 0) cam.x += CW
  if (cam.y >= CH) cam.y -= CH
  else if (cam.y < 0) cam.y += CH
}

/* ---------------- 对外接口 ---------------- */

const diagram = {
  if_visible: ref(false),
  postList: ref<Article[]>([]),

  async show() {
    const list: Article[] = await ArticleAPI.getList({ page: 1, limit: 10 })
      .then((r) => r.data as Article[])
      .catch(() => [])
    console.log(list)
    diagram.postList.value = list
    hoverNode = null
    popoverNode = null
    popover.visible = false

    nextTick(() => {
      diagram.if_visible.value = true
      resize()

      nodes.length = 0
      list.forEach((a, i) => {
        const n = makeNode(a, i, list.length)
        n.wait = i * 3.6
        nodes.push(n)
      })

      // 相机对准世界中心
      cam.x = CW / 2
      cam.y = CH / 2
      cam.vx = cam.vy = 0
      camTarget.active = false

      requestRender()
    })
  },

  hide(immediate?: () => void, next?: () => void) {
    hoverNode = null
    popoverNode = null
    popover.visible = false
    cam.vx = cam.vy = 0
    camTarget.active = false
    for (const n of nodes) {
      n.wait = 0
      n.hover = 0
      n.hoverTarget = 0
      n.hoverBin = false
      n.vx = n.vy = 0
      n.targetAlpha = 0
      n.targetScale = 0.9
    }
    immediate?.()
    requestRender()
    setTimeout(() => {
      stopLoop()
      diagram.if_visible.value = false
      nodes.length = 0
      next?.()
    }, 300)
  },

  addPost(a: Article) {
    diagram.postList.value.push(a)
    const n = makeNode(a, nodes.length, nodes.length + 1)
    nodes.push(n)
    requestRender()
  },
}

appStore.update_diagram = diagram.addPost.bind(diagram)
appStore.show_diagram = diagram.show.bind(diagram)
appStore.hide_diagram = diagram.hide.bind(diagram)

/* ---------------- 生命周期 ---------------- */

function onResize() {
  if (!diagram.if_visible.value) return
  resize()
  cam.x = CW / 2
  cam.y = CH / 2
  cam.vx = cam.vy = 0
  camTarget.active = false
  requestRender()
}

function onVisibility() {
  if (document.hidden) stopLoop()
  else requestRender()
}

onMounted(() => {
  const cv = canvasRef.value
  cv?.addEventListener('pointerdown', onPointerDown)
  cv?.addEventListener('pointermove', onPointerMove)
  cv?.addEventListener('pointerup', onPointerUp)
  cv?.addEventListener('pointercancel', onPointerUp)
  window.addEventListener('resize', onResize)
  document.addEventListener('visibilitychange', onVisibility)
})

onUnmounted(() => {
  stopLoop()
  const cv = canvasRef.value
  cv?.removeEventListener('pointerdown', onPointerDown)
  cv?.removeEventListener('pointermove', onPointerMove)
  cv?.removeEventListener('pointerup', onPointerUp)
  cv?.removeEventListener('pointercancel', onPointerUp)
  window.removeEventListener('resize', onResize)
  document.removeEventListener('visibilitychange', onVisibility)
})
</script>
<style lang="scss" scoped>
.posts-diagram-container {
  position: fixed;
  inset: 0;
  overflow: hidden;
  cursor: grab;
  contain: layout paint;
  user-select: none;

  &:active {
    cursor: grabbing;
  }

  .diagram-canvas {
    display: block;
    width: 100%;
    height: 100%;
    touch-action: none; // 让 pointer 事件接管触摸拖拽
  }

  .edge-popover {
    position: absolute;
    width: 220px;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.97);
    border-radius: 10px;
    box-shadow: 0 6px 22px rgba(10, 14, 26, 0.18);
    pointer-events: none; // 让鼠标事件穿透，避免 hover 抖动
    z-index: 10;
    font-size: 13px;
    color: #1b1f2a;
    transition: opacity 0.12s ease;

    .edge-popover-title {
      font-size: 2rem;
      font-weight: 600;
      line-height: 1.32;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .edge-popover-date {
      margin-top: 4px;
      font-size: 11px;
      color: #9aa0b0;
    }
  }
}
.popover-enter-from,
.popover-leave-to {
  opacity: 0;
  scale: .9;
}
.popover-enter-active {
  transition: all 0.32s cubic-bezier(0.2, 0.9, 0.3, 1.2);
}
.popover-leave-active {
  transition: all 0.2s ease;
}

</style>
