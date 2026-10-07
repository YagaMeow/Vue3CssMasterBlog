/* =============================================================================
 *  电子变电站主接线 —— Canvas 渲染引擎
 *  性能要点：
 *   1. 路径批处理：导线 / 母线 / 开关按“颜色 + 线型”合并进 Path2D，
 *      每帧 draw call 从 300+ 降到 ~15。
 *   2. 按需渲染：无动画、无交互时完全停止 requestAnimationFrame，
 *      空闲 CPU 占用为 0；有潮流流动时按 30FPS 节流。
 *   3. 世界坐标缓存：Path2D 以世界坐标缓存，缩放 / 平移仅改变换矩阵，
 *      不重建任何路径。
 *   4. 命中测试对象只在拓扑变化时重建一次（旧实现每帧重建 45 个闭包）。
 *   5. 页面不可见 / 移出视口时自动暂停渲染。
 * ========================================================================== */

import gsap from 'gsap'

import {
  COLOR,
  GEOM,
  MAX_SCALE,
  MIN_SCALE,
  PT_R,
  PT_X,
  PT_Y,
  SEG35_BUS_LEFT_END,
  SEG35_BUS_RIGHT_START,
  SEG35_X,
  SEG_BUS_LEFT_END,
  SEG_BUS_RIGHT_START,
  SEG_X,
  SEG_Y,
  TR110_GND_Y,
  TR110_QF_Y,
  TR110_X,
  TR35_GND_Y,
  TR35_QF_Y,
  TR35_X,
  TR_H_CENTER,
  TR_L_CENTER,
  TR_M_CENTER,
  TR_R,
  TR_X,
  TR_Y,
  WORLD_X0,
  WORLD_X1,
  WORLD_Y0,
  WORLD_Y1,
  type DeviceDef,
  type StationModel
} from './station'

export interface ViewState {
  scale: number
  x: number
  y: number
}

/** Path2D 与 CanvasRenderingContext2D 的公共路径接口 */
interface PathSink {
  moveTo(x: number, y: number): void
  lineTo(x: number, y: number): void
  quadraticCurveTo(cx: number, cy: number, x: number, y: number): void
}

interface Batches {
  grid: Path2D
  bus220: Path2D
  bus110: Path2D
  bus35: Path2D
  busLive220: Path2D
  busLive110: Path2D
  busLive35: Path2D
  wireBase: Path2D
  wireLive: Path2D
  swStub: Path2D
  swClosedArm: Path2D
  swOpenArm: Path2D
  breakerClosed: Path2D
  breakerOpen: Path2D
  dotClosed: Path2D
  dotOpen: Path2D
  ground: Path2D
  arrows: Path2D
  transformer: Path2D
  ptSymbol: Path2D
  liveWires: number
  liveBuses: number
}

interface TextLabel {
  text: string
  x: number
  y: number
  font: string
  fill: string
  align: CanvasTextAlign
  baseline: CanvasTextBaseline
}

interface DeviceAnim {
  from: number
  to: number
  t0: number
  dur: number
}

interface Ripple {
  x: number
  y: number
  t0: number
  dur: number
  color: string
  maxR: number
}

export interface HoverInfo {
  device: DeviceDef | null
  screenX: number
  screenY: number
}

const clamp = (v: number, a: number, b: number): number => (v < a ? a : v > b ? b : v)
const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3)

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16)
  ]
}

function mixHex(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a)
  const [r2, g2, b2] = hexToRgb(b)
  return `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)})`
}

function roundRectPath(p: PathSink, x: number, y: number, w: number, h: number, r: number): void {
  const rr = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2)
  p.moveTo(x + rr, y)
  p.lineTo(x + w - rr, y)
  p.quadraticCurveTo(x + w, y, x + w, y + rr)
  p.lineTo(x + w, y + h - rr)
  p.quadraticCurveTo(x + w, y + h, x + w - rr, y + h)
  p.lineTo(x + rr, y + h)
  p.quadraticCurveTo(x, y + h, x, y + h - rr)
  p.lineTo(x, y + rr)
  p.quadraticCurveTo(x, y, x + rr, y)
}

/** 描边一个圆角矩形（自动 beginPath） */
function strokeRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
): void {
  ctx.beginPath()
  roundRectPath(ctx, x, y, w, h, r)
  ctx.stroke()
}

function addPolyline(p: Path2D, points: Array<[number, number]>): void {
  if (points.length < 2) return
  p.moveTo(points[0][0], points[0][1])
  for (let i = 1; i < points.length; i++) p.lineTo(points[i][0], points[i][1])
}

export class DiagramRenderer {
  readonly view: ViewState = { scale: 1, x: 0, y: 0 }

  /** 潮流 / 脉冲动画开关 */
  animEnabled = true
  showLabels = true
  showGrid = true

  /** 操作票可视化状态 */
  activeDeviceId: string | null = null
  doneDeviceIds = new Map<string, number>()
  errorDeviceId: string | null = null

  /** 由外部注入：电源投入状态查询 */
  sourceOn: ((id: string) => boolean) | null = null

  onScaleChange: ((scale: number) => void) | null = null
  onHoverChange: ((info: HoverInfo) => void) | null = null
  onDeviceClick: ((device: DeviceDef, screenX: number, screenY: number) => void) | null = null
  onDeviceContext: ((device: DeviceDef, screenX: number, screenY: number) => void) | null = null
  onBackgroundClick: ((screenX: number, screenY: number) => void) | null = null

  private ctx!: CanvasRenderingContext2D
  private readonly canvas: HTMLCanvasElement
  private readonly container: HTMLElement
  private readonly model: StationModel
  private isEnergized: (node: string) => boolean

  private dpr = 1
  private rafId = 0
  private resizeRaf = 0
  private lastDraw = 0
  private batches: Batches | null = null
  private batchesDirty = true
  private needFit = true
  private disposed = false

  private labels: TextLabel[] = []
  private groundPoints: Array<[number, number]> = []
  private sourcePoints: Array<{ x: number; y: number; id: string }> = []

  private anims = new Map<string, DeviceAnim>()
  private ripples: Ripple[] = []
  private hoverId: string | null = null
  private errorUntil = 0

  private dragging = false
  private pointerId: number | null = null
  private lastX = 0
  private lastY = 0
  private downX = 0
  private downY = 0
  private moved = false

  private resizeObserver: ResizeObserver | null = null
  private intersectionObserver: IntersectionObserver | null = null
  private visible = true
  private camTween: gsap.core.Tween | null = null

  constructor(
    canvas: HTMLCanvasElement,
    container: HTMLElement,
    model: StationModel,
    isEnergized: (node: string) => boolean
  ) {
    this.canvas = canvas
    this.container = container
    this.model = model
    this.isEnergized = isEnergized
    const context = canvas.getContext('2d', { alpha: true })
    if (!context) throw new Error('Canvas 2D 上下文创建失败')
    this.ctx = context
    this.buildLabels()
  }

  /* ------------------------------ 生命周期 ------------------------------ */

  mount(): void {
    this.resize()
    this.container.addEventListener('pointerdown', this.onPointerDown)
    window.addEventListener('pointermove', this.onPointerMove, { passive: true })
    window.addEventListener('pointerup', this.onPointerUp)
    window.addEventListener('pointercancel', this.onPointerUp)
    this.container.addEventListener('wheel', this.onWheel, { passive: false })
    this.container.addEventListener('contextmenu', this.onContextMenu)
    document.addEventListener('visibilitychange', this.onVisibilityChange)

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(this.onResizeObserved)
      this.resizeObserver.observe(this.container)
    } else {
      window.addEventListener('resize', this.onResize)
    }
    if (typeof IntersectionObserver !== 'undefined') {
      this.intersectionObserver = new IntersectionObserver(entries => {
        this.visible = entries.some(e => e.isIntersecting)
        if (this.visible) this.requestRender()
      })
      this.intersectionObserver.observe(this.container)
    }
    this.requestRender()
  }

  destroy(): void {
    this.disposed = true
    if (this.rafId) cancelAnimationFrame(this.rafId)
    this.rafId = 0
    this.camTween?.kill()
    this.container.removeEventListener('pointerdown', this.onPointerDown)
    window.removeEventListener('pointermove', this.onPointerMove)
    window.removeEventListener('pointerup', this.onPointerUp)
    window.removeEventListener('pointercancel', this.onPointerUp)
    this.container.removeEventListener('wheel', this.onWheel)
    this.container.removeEventListener('contextmenu', this.onContextMenu)
    window.removeEventListener('resize', this.onResize)
    document.removeEventListener('visibilitychange', this.onVisibilityChange)
    this.resizeObserver?.disconnect()
    this.intersectionObserver?.disconnect()
  }

  /* --------------------------- 状态 / 失效标记 --------------------------- */

  /** 拓扑或设备状态变化：重建批处理路径 */
  markChanged(): void {
    this.batchesDirty = true
    this.requestRender()
  }

  setEnergizedFn(fn: (node: string) => boolean): void {
    this.isEnergized = fn
    this.markChanged()
  }

  requestRender(): void {
    if (this.disposed || this.rafId) return
    this.rafId = requestAnimationFrame(this.loop)
  }

  private schedule(): void {
    if (!this.disposed && !this.rafId) this.rafId = requestAnimationFrame(this.loop)
  }

  private loop = (now: number): void => {
    this.rafId = 0
    // 节流到约 30FPS，绘制量减半而视觉几乎无差别
    if (now - this.lastDraw < 30 && this.hasTransientWork()) {
      this.schedule()
      return
    }
    this.draw(now)
    if (this.hasTransientWork()) this.schedule()
  }

  private hasTransientWork(): boolean {
    if (this.batchesDirty) return true
    if (this.anims.size > 0 || this.ripples.length > 0) return true
    if (this.errorDeviceId && performance.now() < this.errorUntil) return true
    const B = this.batches
    if (this.animEnabled && this.visible && B && B.liveWires + B.liveBuses > 0) return true
    return false
  }

  /* ------------------------------- 视图控制 ------------------------------ */

  private onResizeObserved = (): void => {
    if (this.resizeRaf) return
    this.resizeRaf = requestAnimationFrame(() => {
      this.resizeRaf = 0
      this.resize()
    })
  }

  private onResize = (): void => this.resize()

  resize(): void {
    const w = this.container.clientWidth
    const h = this.container.clientHeight
    if (!w || !h) return
    this.dpr = Math.min(window.devicePixelRatio || 1, 2)
    const bw = Math.round(w * this.dpr)
    const bh = Math.round(h * this.dpr)
    if (this.canvas.width !== bw || this.canvas.height !== bh) {
      this.canvas.width = bw
      this.canvas.height = bh
      this.canvas.style.width = w + 'px'
      this.canvas.style.height = h + 'px'
    }
    if (this.needFit) {
      this.needFit = false
      this.fitInstant()
      return
    }
    this.requestRender()
  }

  fitInstant(): void {
    const w = this.container.clientWidth
    const h = this.container.clientHeight
    if (!w || !h) return
    const s = clamp(Math.min(w / (WORLD_X1 - WORLD_X0), h / (WORLD_Y1 - WORLD_Y0)) * 0.92, MIN_SCALE, MAX_SCALE)
    this.view.scale = s
    this.view.x = w / 2 - ((WORLD_X0 + WORLD_X1) / 2) * s
    this.view.y = h / 2 - ((WORLD_Y0 + WORLD_Y1) / 2) * s
    this.emitScale()
    this.requestRender()
  }

  /** 平滑复位视图 */
  fit(animated = true): void {
    const w = this.container.clientWidth
    const h = this.container.clientHeight
    if (!w || !h) return
    const s = clamp(Math.min(w / (WORLD_X1 - WORLD_X0), h / (WORLD_Y1 - WORLD_Y0)) * 0.92, MIN_SCALE, MAX_SCALE)
    const cx = (WORLD_X0 + WORLD_X1) / 2
    const cy = (WORLD_Y0 + WORLD_Y1) / 2
    if (!animated) { this.fitInstant(); return }
    this.camTween?.kill()
    this.camTween = gsap.to(this.view, {
      scale: s,
      x: w / 2 - cx * s,
      y: h / 2 - cy * s,
      duration: 0.55,
      ease: 'power3.out',
      onUpdate: () => { this.emitScale(); this.requestRender() }
    })
  }

  private emitScale(): void {
    this.onScaleChange?.(this.view.scale)
  }

  zoomAt(px: number, py: number, factor: number): void {
    const ns = clamp(this.view.scale * factor, MIN_SCALE, MAX_SCALE)
    if (ns === this.view.scale) return
    const k = ns / this.view.scale
    this.view.x = px - (px - this.view.x) * k
    this.view.y = py - (py - this.view.y) * k
    this.view.scale = ns
    this.emitScale()
    this.requestRender()
  }

  zoomBy(factor: number): void {
    this.zoomAt(this.container.clientWidth / 2, this.container.clientHeight / 2, factor)
  }

  /** 以画布中心为锚点平滑缩放（工具栏滑杆用） */
  zoomTo(scale: number): void {
    const s = clamp(scale, MIN_SCALE, MAX_SCALE)
    const cx = this.container.clientWidth / 2
    const cy = this.container.clientHeight / 2
    const wx = (cx - this.view.x) / this.view.scale
    const wy = (cy - this.view.y) / this.view.scale
    this.camTween?.kill()
    this.camTween = gsap.to(this.view, {
      scale: s,
      x: cx - wx * s,
      y: cy - wy * s,
      duration: 0.35,
      ease: 'power2.out',
      onUpdate: () => { this.emitScale(); this.requestRender() }
    })
    this.emitScale()
  }

  /** 平滑移动镜头到指定设备 */
  focusDevice(device: DeviceDef, targetScale?: number): void {
    const w = this.container.clientWidth
    const h = this.container.clientHeight
    if (!w || !h) return
    const s = clamp(targetScale ?? Math.max(this.view.scale, 0.85), MIN_SCALE, MAX_SCALE)
    this.camTween?.kill()
    this.camTween = gsap.to(this.view, {
      scale: s,
      x: w / 2 - device.x * s,
      y: h * 0.45 - device.y * s,
      duration: 0.75,
      ease: 'power3.inOut',
      onUpdate: () => { this.emitScale(); this.requestRender() }
    })
    this.emitScale()
  }

  screenToWorld(sx: number, sy: number): { x: number; y: number } {
    return { x: (sx - this.view.x) / this.view.scale, y: (sy - this.view.y) / this.view.scale }
  }

  worldToScreen(wx: number, wy: number): { x: number; y: number } {
    return { x: wx * this.view.scale + this.view.x, y: wy * this.view.scale + this.view.y }
  }

  localPoint(e: { clientX: number; clientY: number }): { x: number; y: number } {
    const rect = this.container.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  deviceAt(sx: number, sy: number): DeviceDef | null {
    const { x, y } = this.screenToWorld(sx, sy)
    const pad = 6 / this.view.scale
    const list = this.model.devices
    for (let i = list.length - 1; i >= 0; i--) {
      const d = list[i]
      if (
        x >= d.x - d.w / 2 - pad && x <= d.x + d.w / 2 + pad &&
        y >= d.y - d.h / 2 - pad && y <= d.y + d.h / 2 + pad
      ) return d
    }
    return null
  }

  /* ------------------------------ 动画触发 ------------------------------ */

  /** 记录一次设备动作动画 */
  animateDevice(id: string, fromClosed: boolean, toClosed: boolean): void {
    this.anims.set(id, {
      from: fromClosed ? 0 : 1,
      to: toClosed ? 0 : 1,
      t0: performance.now(),
      dur: 420
    })
    this.batchesDirty = true
    this.requestRender()
  }

  ripple(x: number, y: number, color = COLOR.live, maxR = 70, dur = 620): void {
    this.ripples.push({ x, y, t0: performance.now(), dur, color, maxR })
    if (this.ripples.length > 12) this.ripples.shift()
    this.requestRender()
  }

  flashError(deviceId: string): void {
    this.errorDeviceId = deviceId
    this.errorUntil = performance.now() + 1400
    const d = this.model.deviceMap.get(deviceId)
    if (d) this.ripple(d.x, d.y, COLOR.open, 90, 700)
    this.requestRender()
  }

  clearError(): void {
    this.errorDeviceId = null
    this.requestRender()
  }

  /* ---------------------------- 指针交互 ---------------------------- */

  private onPointerDown = (e: PointerEvent): void => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    const target = e.target as HTMLElement
    if (target.closest('[data-no-pan]')) return
    this.dragging = true
    this.moved = false
    this.pointerId = e.pointerId
    this.lastX = e.clientX
    this.lastY = e.clientY
    this.downX = e.clientX
    this.downY = e.clientY
    this.container.classList.add('is-dragging')
    try { this.canvas.setPointerCapture(e.pointerId) } catch { /* ignore */ }
  }

  private onPointerMove = (e: PointerEvent): void => {
    if (this.dragging) {
      if (this.pointerId !== null && e.pointerId !== this.pointerId) return
      const dx = e.clientX - this.lastX
      const dy = e.clientY - this.lastY
      if (Math.abs(e.clientX - this.downX) + Math.abs(e.clientY - this.downY) > 4) this.moved = true
      this.lastX = e.clientX
      this.lastY = e.clientY
      if (this.moved) {
        this.view.x += dx
        this.view.y += dy
        this.requestRender()
      }
      return
    }
    if (e.pointerType !== 'mouse') return
    const p = this.localPoint(e)
    const device = this.deviceAt(p.x, p.y)
    const id = device ? device.id : null
    if (id !== this.hoverId) {
      this.hoverId = id
      this.container.style.cursor = device ? 'pointer' : 'grab'
      this.requestRender()
    }
    this.onHoverChange?.({ device, screenX: p.x, screenY: p.y })
  }

  private onPointerUp = (e: PointerEvent): void => {
    if (this.pointerId !== null && e.pointerId !== this.pointerId) return
    const wasDrag = this.moved
    this.dragging = false
    this.pointerId = null
    this.container.classList.remove('is-dragging')
    if (!wasDrag) {
      const p = this.localPoint(e)
      const device = this.deviceAt(p.x, p.y)
      if (device) this.onDeviceClick?.(device, p.x, p.y)
      else this.onBackgroundClick?.(p.x, p.y)
    }
  }

  private onWheel = (e: WheelEvent): void => {
    e.preventDefault()
    const p = this.localPoint(e)
    const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY
    this.zoomAt(p.x, p.y, Math.pow(1.0016, -delta))
  }

  private onContextMenu = (e: MouseEvent): void => {
    e.preventDefault()
    const p = this.localPoint(e)
    const device = this.deviceAt(p.x, p.y)
    if (device) this.onDeviceContext?.(device, p.x, p.y)
    else this.onBackgroundClick?.(p.x, p.y)
  }

  private onVisibilityChange = (): void => {
    if (!document.hidden) this.requestRender()
  }

  /* ------------------------------ 路径构建 ------------------------------ */

  private buildLabels(): void {
    const L: TextLabel[] = []
    const push = (
      text: string, x: number, y: number, font: string, fill: string,
      align: CanvasTextAlign = 'center', baseline: CanvasTextBaseline = 'top'
    ): void => { L.push({ text, x, y, font, fill, align, baseline }) }

    const fontBig = 'bold 20px system-ui, "Microsoft YaHei", sans-serif'
    const fontMid = '17px system-ui, "Microsoft YaHei", sans-serif'
    const fontSmall = '15px system-ui, "Microsoft YaHei", sans-serif'
    const fontTiny = '13px system-ui, "Microsoft YaHei", sans-serif'

    push('220kV Ⅰ 母', WORLD_X0 + 80, GEOM[220].bus1Y - 30, fontBig, COLOR.bus220, 'left', 'middle')
    push('220kV Ⅱ 母', WORLD_X0 + 80, GEOM[220].bus2Y - 30, fontBig, COLOR.bus220, 'left', 'middle')
    push('110kV Ⅰ 母', WORLD_X0 + 80, GEOM[110].bus1Y - 30, fontBig, COLOR.bus110, 'left', 'middle')
    push('110kV Ⅱ 母', WORLD_X0 + 80, GEOM[110].bus2Y - 30, fontBig, COLOR.bus110, 'left', 'middle')
    push('35kV 母线', GEOM[35].busX0, GEOM[35].busY - 30, fontBig, COLOR.bus35, 'left', 'middle')

    for (const bay of this.model.bays220) {
      if (bay.kind === 'line') push(bay.name, bay.x, GEOM[220].term + 30, fontMid, COLOR.label)
      else if (bay.kind === 'ml') push(bay.name, bay.x, GEOM[220].bus1Y + 14, fontMid, COLOR.label)
    }
    for (const bay of this.model.bays110) {
      if (bay.kind === 'line') push(bay.name, bay.x, GEOM[110].term + 26, fontMid, COLOR.label)
      else if (bay.kind === 'ml') push(bay.name, bay.x, GEOM[110].bus1Y + 14, fontMid, COLOR.label)
    }
    for (const bay of this.model.bays35) {
      push(bay.name, bay.x, GEOM[35].term + 26, fontMid, COLOR.label)
    }

    push('110kV 主变间隔', TR110_X - 70, TR110_QF_Y - 20, fontSmall, COLOR.label, 'left', 'middle')
    push('35kV 主变间隔', TR35_X + 25, TR35_QF_Y - 20, fontSmall, COLOR.label, 'left', 'middle')
    push('220kV 母线分段', SEG_X, SEG_Y + 30, fontTiny, COLOR.label)
    push('35kV 母线分段', SEG35_X, GEOM[35].busY + 34, fontTiny, COLOR.label)
    push('主变 1', TR_X - 100, TR_Y - 40, '16px system-ui, "Microsoft YaHei", sans-serif', COLOR.label)
    push('高', TR_H_CENTER.x, TR_H_CENTER.y - TR_R - 40, fontTiny, COLOR.label, 'center', 'middle')
    push('中', TR_M_CENTER.x - TR_R - 40, TR_M_CENTER.y, fontTiny, COLOR.label, 'center', 'middle')
    push('低', TR_L_CENTER.x, TR_L_CENTER.y + TR_R + 40, fontTiny, COLOR.label, 'center', 'middle')
    push('220kV 正母压变', PT_X, PT_Y + PT_R + 80, fontTiny, COLOR.label)

    this.labels = L

    const grounds: Array<[number, number]> = []
    for (const bay of this.model.bays220) if (bay.kind !== 'ml') grounds.push([bay.x + 62, GEOM[220].gnd + 60],[bay.x - 62, GEOM[220].gndXlc + 60],[bay.x - 62, GEOM[220].gndMx + 60])
    for (const bay of this.model.bays110) if (bay.kind !== 'ml') grounds.push([bay.x + 62, GEOM[110].gnd + 60],[bay.x - 62, GEOM[110].gndXlc + 60],[bay.x - 62, GEOM[110].gndMx + 60])
    for (const bay of this.model.bays35) if (bay.kind !== 'ml') grounds.push([bay.x - 62, GEOM[35].gnd + 60],[bay.x + 62, GEOM[35].gndXlc + 60],[bay.x - 62, GEOM[35].gndMx + 60])
    grounds.push([TR110_X - 55, TR110_GND_Y + 12 + 44])
    grounds.push([TR35_X - 62, TR35_GND_Y + 12 + 48])
    this.groundPoints = grounds

    this.sourcePoints = this.model.sources.map(s => ({ x: s.x, y: s.termY, id: s.id }))
  }

  private deviceOpenness(d: DeviceDef, now: number): number {
    const anim = this.anims.get(d.id)
    if (!anim) return d.get() ? 0 : 1
    const k = clamp((now - anim.t0) / anim.dur, 0, 1)
    if (k >= 1) {
      this.anims.delete(d.id)
      this.batchesDirty = true
      return anim.to
    }
    return anim.from + (anim.to - anim.from) * easeOutCubic(k)
  }

  private switchAnchors(d: DeviceDef): [number, number, number, number] {
    if (d.kind === 'v-switch') return [d.x, d.y - d.h * 0.2, d.x, d.y + d.h * 0.2]
    return [d.x - d.w * 0.22, d.y, d.x + d.w * 0.22, d.y]
  }

  private buildBatches(): void {
    const grid = new Path2D()
    const bus220 = new Path2D()
    const bus110 = new Path2D()
    const bus35 = new Path2D()
    const busLive220 = new Path2D()
    const busLive110 = new Path2D()
    const busLive35 = new Path2D()
    const wireBase = new Path2D()
    const wireLive = new Path2D()
    const swStub = new Path2D()
    const swClosedArm = new Path2D()
    const swOpenArm = new Path2D()
    const breakerClosed = new Path2D()
    const breakerOpen = new Path2D()
    const dotClosed = new Path2D()
    const dotOpen = new Path2D()
    const ground = new Path2D()
    const arrows = new Path2D()
    const transformer = new Path2D()
    const ptSymbol = new Path2D()

    const en = this.isEnergized

    /* 世界坐标网格（一次构建，随手势缩放平移） */
    for (let x = WORLD_X0-500; x <= WORLD_X1 + 2500; x += 100) {
      grid.moveTo(x, WORLD_Y0)
      grid.lineTo(x, WORLD_Y1)
    }
    for (let y = WORLD_Y0; y <= WORLD_Y1; y += 100) {
      grid.moveTo(WORLD_X0-500, y)
      grid.lineTo(WORLD_X1+2500, y)
    }

    /* 母线 */
    let liveBuses = 0
    const buses: Array<[Path2D, Path2D, string, number, number, number]> = [
      [bus220, busLive220, 'bus220_1L', WORLD_X0 + 60, SEG_BUS_LEFT_END, GEOM[220].bus1Y],
      [bus220, busLive220, 'bus220_1R', SEG_BUS_RIGHT_START, WORLD_X1 - 60, GEOM[220].bus1Y],
      [bus220, busLive220, 'bus220_2', WORLD_X0 + 60, WORLD_X1 - 60, GEOM[220].bus2Y],
      [bus110, busLive110, 'bus110_1', GEOM[110].bus1X0, GEOM[110].bus1X1, GEOM[110].bus1Y],
      [bus110, busLive110, 'bus110_2', GEOM[110].bus2X0, GEOM[110].bus2X1, GEOM[110].bus2Y],
      [bus35, busLive35, 'bus35L', GEOM[35].busX0, SEG35_BUS_LEFT_END, GEOM[35].busY],
      [bus35, busLive35, 'bus35R', SEG35_BUS_RIGHT_START, GEOM[35].busX1, GEOM[35].busY]
    ]
    for (const [base, live, node, x1, x2, y] of buses) {
      base.moveTo(x1, y)
      base.lineTo(x2, y)
      if (en(node)) { live.moveTo(x1, y); live.lineTo(x2, y); liveBuses++ }
    }

    /* 导线 */
    let liveWires = 0
    for (const w of this.model.wires) {
      if (w.points.length < 2) continue
      addPolyline(wireBase, w.points)
      if (en(w.a) && en(w.b)) { addPolyline(wireLive, w.points); liveWires++ }
    }

    /* 设备 */
    for (const d of this.model.devices) {
      if (this.anims.has(d.id)) continue // 动画中的设备单独绘制
      const closed = d.get()
      if (d.kind === 'v-breaker' || d.kind === 'h-breaker') {
        const p = closed ? breakerClosed : breakerOpen
        p.rect(d.x - d.w / 2, d.y - d.h / 2, d.w, d.h)
        continue
      }
      const [tx, ty, bx, by] = this.switchAnchors(d)
      const arm = closed ? swClosedArm : swOpenArm
      const dot = closed ? dotClosed : dotOpen
      if (d.kind === 'v-switch') {
        swStub.moveTo(d.x, d.y - d.h / 2); swStub.lineTo(d.x, ty)
        swStub.moveTo(d.x, by); swStub.lineTo(d.x, d.y + d.h / 2)
      } else {
        swStub.moveTo(d.x - d.w / 2, d.y); swStub.lineTo(tx, d.y)
        swStub.moveTo(bx, d.y); swStub.lineTo(d.x + d.w / 2, d.y)
      }
      arm.moveTo(tx, ty)
      if (closed) arm.lineTo(bx, by)
      else if (d.kind === 'v-switch') arm.lineTo(tx + d.h * 0.45, by)
      else arm.lineTo(bx, ty - d.w * 0.45)
      dot.moveTo(tx + 2.8, ty); dot.arc(tx, ty, 2.8, 0, Math.PI * 2)
      dot.moveTo(bx + 2.8, by); dot.arc(bx, by, 2.8, 0, Math.PI * 2)
    }

    /* 接地符号 */
    for (const [x, y] of this.groundPoints) {
      ground.moveTo(x, y); ground.lineTo(x, y + 12)
      ground.moveTo(x - 16, y + 12); ground.lineTo(x + 16, y + 12)
      ground.moveTo(x - 10, y + 20); ground.lineTo(x + 10, y + 20)
      ground.moveTo(x - 4, y + 28); ground.lineTo(x + 4, y + 28)
    }

    /* 出线箭头 */
    const arrow = (x: number, y: number): void => {
      const s = 13
      arrows.moveTo(x, y + s * 1.7)
      arrows.lineTo(x - s * 0.72, y + s * 0.35)
      arrows.lineTo(x + s * 0.72, y + s * 0.35)
      arrows.closePath()
    }
    for (const bay of this.model.bays220) if (bay.kind === 'line') arrow(bay.x, GEOM[220].term)
    for (const bay of this.model.bays110) if (bay.kind === 'line') arrow(bay.x, GEOM[110].term)
    for (const bay of this.model.bays35) if (bay.kind === 'line') arrow(bay.x, GEOM[35].term)

    /* 三绕组主变 + 母线压变 */
    const s3 = Math.sqrt(3)
    const star = (p: Path2D, cx: number, cy: number, r: number): void => {
      p.moveTo(cx, cy); p.lineTo(cx, cy - r)
      p.moveTo(cx, cy); p.lineTo(cx - r * s3 / 2, cy + r / 2)
      p.moveTo(cx, cy); p.lineTo(cx + r * s3 / 2, cy + r / 2)
    }
    const h = TR_H_CENTER
    const m = TR_M_CENTER
    const l = TR_L_CENTER
    transformer.moveTo(h.x + TR_R, h.y); transformer.arc(h.x, h.y, TR_R, 0, Math.PI * 2)
    transformer.moveTo(m.x + TR_R, m.y); transformer.arc(m.x, m.y, TR_R, 0, Math.PI * 2)
    transformer.moveTo(l.x + TR_R, l.y); transformer.arc(l.x, l.y, TR_R, 0, Math.PI * 2)
    star(transformer, h.x, h.y, TR_R * 0.55)
    transformer.moveTo(h.x, h.y); transformer.lineTo(h.x, h.y - TR_R - 25)
    star(transformer, m.x, m.y, TR_R * 0.55)
    transformer.moveTo(m.x, m.y); transformer.lineTo(m.x - TR_R - 25, m.y)
    const lr = TR_R * 0.55
    transformer.moveTo(l.x, l.y - lr)
    transformer.lineTo(l.x - lr * s3 / 2, l.y + lr / 2)
    transformer.lineTo(l.x + lr * s3 / 2, l.y + lr / 2)
    transformer.closePath()
    transformer.moveTo(l.x, l.y + TR_R); transformer.lineTo(l.x, l.y + TR_R + 25)

    ptSymbol.moveTo(PT_X + PT_R, PT_Y); ptSymbol.arc(PT_X, PT_Y, PT_R, 0, Math.PI * 2)
    ptSymbol.moveTo(PT_X + PT_R, PT_Y + 30); ptSymbol.arc(PT_X, PT_Y + 30, PT_R, 0, Math.PI * 2)
    star(ptSymbol, PT_X, PT_Y, PT_R * 0.55)
    star(ptSymbol, PT_X, PT_Y + 30, PT_R * 0.55)
    ptSymbol.moveTo(PT_X, PT_Y + PT_R + 30); ptSymbol.lineTo(PT_X, PT_Y + PT_R + 48)
    const gy = PT_Y + PT_R + 48
    ptSymbol.moveTo(PT_X, gy); ptSymbol.lineTo(PT_X, gy + 12)
    ptSymbol.moveTo(PT_X - 16, gy + 12); ptSymbol.lineTo(PT_X + 16, gy + 12)
    ptSymbol.moveTo(PT_X - 10, gy + 20); ptSymbol.lineTo(PT_X + 10, gy + 20)
    ptSymbol.moveTo(PT_X - 4, gy + 28); ptSymbol.lineTo(PT_X + 4, gy + 28)

    this.batches = {
      grid,
      bus220, bus110, bus35, busLive220, busLive110, busLive35,
      wireBase, wireLive, swStub, swClosedArm, swOpenArm,
      breakerClosed, breakerOpen, dotClosed, dotOpen,
      ground, arrows, transformer, ptSymbol,
      liveWires, liveBuses
    }
  }

  /* -------------------------------- 绘制 -------------------------------- */

  private draw(now: number): void {
    const canvas = this.canvas
    const ctx = this.ctx
    this.lastDraw = now

    let B = this.batches
    if (this.batchesDirty || !B) {
      this.buildBatches()
      this.batchesDirty = false
      B = this.batches
    }
    if (!B) return

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.setTransform(
      this.dpr * this.view.scale, 0,
      0, this.dpr * this.view.scale,
      this.dpr * this.view.x,
      this.dpr * this.view.y
    )
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.globalAlpha = 1

    const s = this.view.scale
    const wireW = clamp(2.6 * s, 1.1, 3.2) / s
    const busW = clamp(7 * s, 2.2, 7.5) / s

    /* --- 基础层：网格 / 母线 / 导线 / 接地 / 主变 --- */
    ctx.setLineDash([])
    if (this.showGrid) {
      ctx.lineWidth = 1 / s
      ctx.strokeStyle = 'rgba(110,170,220,0.075)'
      ctx.stroke(B.grid)
    }

    ctx.lineWidth = busW
    ctx.strokeStyle = COLOR.bus220; ctx.stroke(B.bus220)
    ctx.strokeStyle = COLOR.bus110; ctx.stroke(B.bus110)
    ctx.strokeStyle = COLOR.bus35; ctx.stroke(B.bus35)

    ctx.lineWidth = wireW
    ctx.strokeStyle = COLOR.wireDim
    ctx.stroke(B.wireBase)

    ctx.lineWidth = wireW + 0.6 / s
    ctx.strokeStyle = COLOR.ground
    ctx.stroke(B.ground)

    ctx.lineWidth = 2.2
    ctx.strokeStyle = COLOR.transformer
    ctx.stroke(B.transformer)
    ctx.stroke(B.ptSymbol)

    ctx.fillStyle = COLOR.wire
    ctx.fill(B.arrows)

    /* --- 设备层 --- */
    ctx.lineWidth = wireW
    ctx.strokeStyle = COLOR.wire
    ctx.stroke(B.swStub)

    const armW = clamp(3 * s, 1.3, 3.6) / s
    ctx.lineWidth = armW
    ctx.strokeStyle = COLOR.closed
    ctx.stroke(B.swClosedArm)
    ctx.fillStyle = COLOR.closed
    ctx.fill(B.dotClosed)
    ctx.fill(B.breakerClosed)
    ctx.stroke(B.breakerClosed)

    ctx.strokeStyle = COLOR.open
    ctx.stroke(B.swOpenArm)
    ctx.fillStyle = COLOR.open
    ctx.fill(B.dotOpen)
    ctx.stroke(B.breakerOpen)

    /* --- 带电层：外发光 + 流动虚线 --- */
    if (B.liveWires + B.liveBuses > 0) {
      const pulse = this.animEnabled ? 0.6 + 0.4 * Math.sin(now * 0.0022) : 0.85
      const phase = this.animEnabled ? (now * 0.09) % 1000 : 0

      ctx.setLineDash([])
      ctx.globalAlpha = 0.2
      ctx.strokeStyle = COLOR.live
      ctx.lineWidth = wireW + 5
      ctx.stroke(B.wireLive)
      ctx.lineWidth = busW + 6
      ctx.stroke(B.busLive220); ctx.stroke(B.busLive110); ctx.stroke(B.busLive35)

      ctx.globalAlpha = pulse
      ctx.lineWidth = wireW + 0.4
      ctx.strokeStyle = COLOR.live
      ctx.stroke(B.wireLive)
      ctx.lineWidth = busW + 0.6
      ctx.stroke(B.busLive220); ctx.stroke(B.busLive110); ctx.stroke(B.busLive35)

      ctx.globalAlpha = this.animEnabled ? 0.6 : 0
      ctx.setLineDash([12, 16])
      ctx.lineDashOffset = -phase
      ctx.lineWidth = clamp(3.4 * s, 1.6, 4) / s
      ctx.strokeStyle = '#eafff6'
      ctx.stroke(B.wireLive)
      ctx.lineWidth = busW
      ctx.stroke(B.busLive220); ctx.stroke(B.busLive110); ctx.stroke(B.busLive35)
      ctx.setLineDash([])
      ctx.globalAlpha = 1
    }

    /* --- 动作中的设备（角度 / 颜色插值） --- */
    if (this.anims.size > 0) {
      for (const d of this.model.devices) {
        if (!this.anims.has(d.id)) continue
        this.drawDeviceAnimated(d, this.deviceOpenness(d, now))
      }
    }

    /* --- 文字标注 --- */
    if (this.showLabels) {
      for (const l of this.labels) {
        ctx.font = l.font
        ctx.fillStyle = l.fill
        ctx.textAlign = l.align
        ctx.textBaseline = l.baseline
        ctx.fillText(l.text, l.x, l.y)
      }
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
    }

    /* --- 电源标记 --- */
    if (this.sourceOn) {
      for (const p of this.sourcePoints) {
        if (!this.sourceOn(p.id)) continue
        ctx.beginPath()
        ctx.arc(p.x, p.y, 7, 0, Math.PI * 2)
        ctx.fillStyle = COLOR.live
        ctx.fill()
        ctx.strokeStyle = 'rgba(37,240,165,0.35)'
        ctx.lineWidth = 6
        ctx.stroke()
        if (this.showLabels) {
          ctx.font = '12px system-ui, "Microsoft YaHei", sans-serif'
          ctx.fillStyle = COLOR.live
          ctx.fillText('电源', p.x + 34, p.y)
        }
      }
    }

    /* --- 操作票 / 悬停高亮 / 波纹 --- */
    this.drawTicketDecorations(now)
    this.drawHover()
    this.drawRipples(now)
  }

  /** 设备动作过程的插值绘制 */
  private drawDeviceAnimated(d: DeviceDef, openness: number): void {
    const ctx = this.ctx
    const s = this.view.scale
    const wireW = clamp(2.6 * s, 1.1, 3.2) / s
    const armColor = mixHex(COLOR.closed, COLOR.open, openness)

    if (d.kind === 'v-breaker' || d.kind === 'h-breaker') {
      const x = d.x - d.w / 2
      const y = d.y - d.h / 2
      ctx.setLineDash([])
      if (openness < 0.99) {
        ctx.globalAlpha = 1 - openness
        ctx.fillStyle = COLOR.closed
        ctx.fillRect(x, y, d.w, d.h)
        ctx.globalAlpha = 1
      }
      ctx.strokeStyle = armColor
      ctx.lineWidth = clamp(3 * s, 1.3, 3.6) / s
      ctx.strokeRect(x, y, d.w, d.h)
      return
    }

    const [tx, ty, bx, by] = this.switchAnchors(d)
    ctx.setLineDash([])
    ctx.strokeStyle = COLOR.wire
    ctx.lineWidth = wireW
    ctx.beginPath()
    if (d.kind === 'v-switch') {
      ctx.moveTo(d.x, d.y - d.h / 2); ctx.lineTo(d.x, ty)
      ctx.moveTo(d.x, by); ctx.lineTo(d.x, d.y + d.h / 2)
    } else {
      ctx.moveTo(d.x - d.w / 2, d.y); ctx.lineTo(tx, d.y)
      ctx.moveTo(bx, d.y); ctx.lineTo(d.x + d.w / 2, d.y)
    }
    ctx.stroke()

    ctx.strokeStyle = armColor
    ctx.lineWidth = clamp(3 * s, 1.3, 3.6) / s
    ctx.beginPath()
    ctx.moveTo(tx, ty)
    if (d.kind === 'v-switch') ctx.lineTo(tx + openness * d.h * 0.45, by)
    else ctx.lineTo(bx, ty - openness * d.w * 0.45)
    ctx.stroke()

    ctx.fillStyle = armColor
    ctx.beginPath(); ctx.arc(tx, ty, 2.8, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(bx, by, 2.8, 0, Math.PI * 2); ctx.fill()
  }

  /* --------------------------- 操作票可视化装饰 --------------------------- */

  private drawTicketDecorations(now: number): void {
    const ctx = this.ctx
    const s = this.view.scale

    // 已完成步骤：绿色编号徽标
    if (this.doneDeviceIds.size > 0) {
      ctx.setLineDash([])
      ctx.font = 'bold 13px system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      for (const [id, seq] of this.doneDeviceIds) {
        const d = this.model.deviceMap.get(id)
        if (!d) continue
        const r = Math.max(d.w, d.h) / 2 + 16
        ctx.beginPath()
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2)
        ctx.strokeStyle = COLOR.done
        ctx.globalAlpha = 0.4
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.globalAlpha = 1

        ctx.beginPath()
        ctx.arc(d.x + r * 0.72, d.y - r * 0.72, 11, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(10,22,18,0.92)'
        ctx.fill()
        ctx.strokeStyle = COLOR.done
        ctx.lineWidth = 1.6
        ctx.stroke()
        ctx.fillStyle = COLOR.done
        ctx.fillText(String(seq), d.x + r * 0.72, d.y - r * 0.72)
      }
    }

    // 当前待操作设备：琥珀色脉冲 + 指引箭头
    const activeId = this.activeDeviceId
    if (activeId) {
      const d = this.model.deviceMap.get(activeId)
      if (d) {
        const t = (now % 1600) / 1600
        ctx.save()
        ctx.setLineDash([])
        ctx.strokeStyle = COLOR.active
        ctx.globalAlpha = 0.85 * (1 - t)
        ctx.lineWidth = 2.5
        const pad = 10 + 14 * t
        strokeRoundRect(ctx, d.x - d.w / 2 - pad, d.y - d.h / 2 - pad, d.w + pad * 2, d.h + pad * 2, 10)
        ctx.restore()

        ctx.save()
        ctx.setLineDash([7, 5])
        ctx.strokeStyle = COLOR.active
        ctx.globalAlpha = 0.95
        ctx.lineWidth = clamp(2.4 * s, 1.2, 3) / s
        strokeRoundRect(ctx, d.x - d.w / 2 - 12, d.y - d.h / 2 - 12, d.w + 24, d.h + 24, 8)
        ctx.restore()

        const bob = Math.sin(now * 0.005) * 5
        const ay = d.y - d.h / 2 - 26 - bob
        const ref = Math.max(1, 1 / s)
        ctx.save()
        ctx.fillStyle = COLOR.active
        ctx.beginPath()
        ctx.moveTo(d.x, ay + 12 * ref)
        ctx.lineTo(d.x - 8 * ref, ay - 2 * ref)
        ctx.lineTo(d.x + 8 * ref, ay - 2 * ref)
        ctx.closePath()
        ctx.fill()
        ctx.restore()
      }
    }

    // 错误操作：红色闪烁
    if (this.errorDeviceId) {
      if (now >= this.errorUntil) {
        this.errorDeviceId = null
      } else {
        const d = this.model.deviceMap.get(this.errorDeviceId)
        if (!d) {
          this.errorDeviceId = null
        } else {
          const k = (this.errorUntil - now) / 1400
          const shake = Math.sin(now * 0.05) * 6 * k
          ctx.save()
          ctx.setLineDash([])
          ctx.strokeStyle = COLOR.open
          ctx.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(now * 0.012))
          ctx.lineWidth = 3
          strokeRoundRect(
            ctx,
            d.x - d.w / 2 - 14 + shake, d.y - d.h / 2 - 14,
            d.w + 28, d.h + 28, 10
          )
          ctx.restore()
        }
      }
    }
  }

  private drawHover(): void {
    if (!this.hoverId || this.hoverId === this.activeDeviceId) return
    const d = this.model.deviceMap.get(this.hoverId)
    if (!d) return
    const ctx = this.ctx
    ctx.save()
    ctx.setLineDash([6, 4])
    ctx.strokeStyle = COLOR.hover
    ctx.lineWidth = 2.2
    strokeRoundRect(ctx, d.x - d.w / 2 - 8, d.y - d.h / 2 - 8, d.w + 16, d.h + 16, 8)
    ctx.restore()
  }

  private drawRipples(now: number): void {
    if (this.ripples.length === 0) return
    const ctx = this.ctx
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i]
      const k = (now - r.t0) / r.dur
      if (k >= 1) { this.ripples.splice(i, 1); continue }
      ctx.beginPath()
      ctx.arc(r.x, r.y, 10 + r.maxR * easeOutCubic(k), 0, Math.PI * 2)
      ctx.strokeStyle = r.color
      ctx.globalAlpha = 1 - k
      ctx.lineWidth = 3 * (1 - k) + 0.5
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }

  hoverDeviceId(): string | null {
    return this.hoverId
  }
}
