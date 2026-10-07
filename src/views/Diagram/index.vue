<template>
  <div ref="pageRef" class="diagram-page">
    <div class="stage">
      <div ref="containerRef" class="diagram-container">
        <canvas ref="canvasRef" />

        <!-- 左上：站点信息 + 执行指引 -->
        <div class="hud-corner top-left" data-no-pan>
          <div class="hud hud-info">
            <div class="hud-title">
              <span class="pulse-dot" :class="{ off: liveNodeCount === 0 }" />
              示范变电站 · 电气主接线
            </div>
            <div class="hud-sub">
              <span>{{ model.devices.length }} 台可操作设备</span>
              <i class="sep" />
              <span :class="liveNodeCount ? 'live' : 'dead'">
                {{ liveNodeCount ? `带电节点 ${liveNodeCount}` : '全站失电' }}
              </span>
            </div>
          </div>

          <Transition name="drop">
            <div v-if="running && currentStep" class="hud hud-guide"
              :class="{ wrong: guideWrong, 'lv-error': currentStep.check?.level === 'error' }">
              <div class="guide-left">
                <span class="guide-seq">{{ currentIndex + 1 }} / {{ ticket?.steps.length }}</span>
                <div class="guide-main">
                  <p class="guide-text">{{ currentStep.text }}</p>
                  <p class="guide-hint">
                    请在图上点击
                    <b>{{ currentStep.deviceLabel }}</b>
                    <span class="guide-action" :class="currentStep.action">
                      {{ currentStep.action === 'close' ? '合闸' : '分闸' }}
                    </span>
                  </p>
                </div>
              </div>
              <div class="guide-right">
                <button class="mini-btn" @click="focusCurrent">定位</button>
                <button class="mini-btn primary" @click="executeCurrent(false)">代为执行</button>
                <button class="mini-btn" @click="skipStep">跳过</button>
                <button class="mini-btn ghost" @click="pause">暂停</button>
              </div>
            </div>
          </Transition>
        </div>

        <!-- 右上：查看操作票 + 图例 -->
        <div class="hud-corner top-right" data-no-pan>
          <Transition name="reopen">
            <button v-if="!agentOpen" class="hud reopen-btn agent-btn" @click="agentOpen = true">
              <svg viewBox="0 0 24 24" width="15" height="15">
                <path d="M12 3l2.2 5.3L20 9.3l-4 3.9.9 5.8L12 16.3 7.1 19l.9-5.8-4-3.9 5.8-1z" fill="none"
                  stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
              </svg>
              AI 智能开票
            </button>
          </Transition>

          <Transition name="reopen">
            <button v-if="!panelOpen" class="hud reopen-btn" @click="panelOpen = true">
              <svg viewBox="0 0 24 24" width="15" height="15">
                <path d="M8 6h9a2 2 0 012 2v9M4 9h9a2 2 0 012 2v9H6a2 2 0 01-2-2V9z" fill="none" stroke="currentColor"
                  stroke-width="1.6" stroke-linejoin="round" />
              </svg>
              操作票执行
            </button>
          </Transition>

          <div class="hud hud-legend" :class="panelOpen?'left':''">
            <span class="lg"><i class="sw closed" />合闸</span>
            <span class="lg"><i class="sw open" />分闸</span>
            <span class="lg"><i class="sw ground" />接地</span>
            <span class="lg"><i class="sw live" />带电 / 潮流</span>
            <span class="lg"><i class="sw active" />待操作</span>
          </div>
        </div>

        <!-- 底部左侧：电源设置 -->
        <div class="source-panel" :class="{ expand: sourceExpand }" data-no-pan>
          <div class="panel-title" @click="sourceExpand = !sourceExpand">
            <span class="dot" />
            电源设置
            <span class="panel-count">{{ activeSourceCount }} / {{ model.sources.length }}</span>
            <svg class="chev" :class="{ up: sourceExpand }" viewBox="0 0 24 24" width="14" height="14">
              <path d="M6 15l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </div>
          <Transition name="collapse">
            <div v-show="sourceExpand" class="source-list">
              <div v-for="group in sourceGroups" :key="group.voltage" class="source-group">
                <div class="group-label">{{ group.voltage }}kV</div>
                <label v-for="s in group.items" :key="s.id" class="source-item">
                  <input type="checkbox" :checked="sourceConfig[s.id]" @change="onSourceChange(s.id, $event)" />
                  <span>{{ s.label }}</span>
                </label>
              </div>
            </div>
          </Transition>
        </div>

        <!-- 底部右侧：工具栏 -->
        <div class="toolbar" data-no-pan>
          <button title="放大 ( + )" @click="zoomIn">
            <svg viewBox="0 0 24 24" width="15" height="15">
              <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
          <button title="缩小 ( - )" @click="zoomOut">
            <svg viewBox="0 0 24 24" width="15" height="15">
              <path d="M5 12h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
          <button title="复位视图 ( 0 )" @click="resetView">
            <svg viewBox="0 0 24 24" width="15" height="15">
              <path d="M4 9V5h4M20 15v4h-4M20 9V5h-4M4 15v4h4" fill="none" stroke="currentColor" stroke-width="1.8"
                stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <input class="zoom-range" type="range" :min="12" :max="400" :value="scalePercent" title="缩放"
            @input="onZoomSlider" />
          <span class="scale">{{ scalePercent }}%</span>
          <i class="divider" />
          <button :class="{ active: animEnabled }" title="潮流动画" @click="toggleAnim">
            <svg viewBox="0 0 24 24" width="15" height="15">
              <path d="M3 12h4l2-6 3 12 2.5-6H21" fill="none" stroke="currentColor" stroke-width="1.8"
                stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <button :class="{ active: showLabels }" title="标注显示" @click="toggleLabels">
            <svg viewBox="0 0 24 24" width="15" height="15">
              <path d="M5 19L11 5l6 14M7.5 14h7" fill="none" stroke="currentColor" stroke-width="1.8"
                stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <button :class="{ active: showGrid }" title="坐标网格" @click="toggleGrid">
            <svg viewBox="0 0 24 24" width="15" height="15">
              <path d="M4 4h16v16H4zM4 10h16M4 16h16M10 4v16M16 4v16" fill="none" stroke="currentColor"
                stroke-width="1.4" />
            </svg>
          </button>
          <button title="全屏" @click="toggleFullscreen">
            <svg viewBox="0 0 24 24" width="15" height="15">
              <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="1.8"
                stroke-linecap="round" />
            </svg>
          </button>
        </div>

        <!-- 设备悬浮提示 -->
        <Transition name="fade">
          <div v-if="tip.visible && tip.label" class="device-tip" :style="{ left: tip.x + 'px', top: tip.y + 'px' }">
            <div class="tip-name">{{ tip.label }}</div>
            <div class="tip-meta">
              <span class="tip-state" :class="tip.closed ? 'on' : 'off'">
                {{ tip.closed ? '合闸' : '分闸' }}
              </span>
              <span class="tip-role">{{ tip.role }}</span>
            </div>
            <div class="tip-hint">{{ ticketRunning ? '点击执行当前步骤' : '左键打开操作菜单' }}</div>
          </div>
        </Transition>

        <!-- 设备操作菜单 -->
        <Transition name="pop">
          <div v-if="menu.visible" ref="menuRef" class="context-menu"
            :style="{ left: menu.x + 'px', top: menu.y + 'px' }" data-no-pan @click.stop>
            <div class="menu-title">{{ menu.label }}</div>
            <div class="menu-state">
              当前状态
              <span :class="menu.closed ? 'state-on' : 'state-off'">
                {{ menu.closed ? '合闸' : '分闸' }}
              </span>
            </div>
            <div class="menu-actions">
              <button type="button" class="menu-action" @click="toggleMenuDevice">
                {{ menu.closed ? '执行分闸' : '执行合闸' }}
              </button>
              <button type="button" class="menu-action ghost" @click="focusMenuDevice">定位</button>
            </div>
          </div>
        </Transition>

        <!-- 拖拽上传遮罩 -->
        <Transition name="fade">
          <div v-if="dragActive" class="drop-mask">
            <div class="drop-card">
              <svg viewBox="0 0 24 24" width="40" height="40">
                <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M4 15v3a2 2 0 002 2h12a2 2 0 002-2v-3" fill="none"
                  stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <p>松开鼠标载入操作票 JSON</p>
            </div>
          </div>
        </Transition>
      </div>

      <div class="dock-layer">
        <Transition name="dock">
          <AgentChat v-if="agentOpen" :model="model" :load-ticket="loadAgentTicket" @close="agentOpen = false" />
        </Transition>
        <Transition name="dock">
          <OperationTicketPanel v-if="panelOpen" :ticket="ticket" :running="running" :auto-playing="autoPlaying"
            :current-index="currentIndex" @close="panelOpen = false" @load-sample="loadSample"
            @download-template="downloadTemplate" @upload="handleUpload" @start="start" @pause="pause" @auto="autoPlay"
            @reset="resetTicket" @execute-current="executeCurrent" @skip="skipStep" @focus="focusCurrent"
            @focus-step="focusStep" @export-record="exportRecord" @clear="clearTicket" />
        </Transition>
      </div>
    </div>

    <!-- 五防校核确认 -->
    <Transition name="fade">
      <div v-if="confirmStep" class="modal-mask" @click.self="confirmStep = null">
        <div class="modal">
          <div class="modal-icon warn">!</div>
          <h4>安全校核未通过</h4>
          <p class="modal-msg">{{ confirmStep.check?.message }}</p>
          <p class="modal-step">第 {{ confirmStep.seq }} 步：{{ confirmStep.text }}</p>
          <div class="modal-actions">
            <button class="tp-btn ghost" @click="confirmStep = null">取消操作</button>
            <button class="tp-btn danger" @click="forceExecute">强制继续（培训模式）</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 消息提示 -->
    <TransitionGroup name="toast" tag="div" class="toast-wrap">
      <div v-for="t in toasts" :key="t.id" class="toast" :class="t.type">
        <span class="toast-dot" />
        <span class="toast-text">{{ t.text }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import gsap from 'gsap'

import AgentChat from './AgentChat.vue'
import OperationTicketPanel from './OperationTicketPanel.vue'
import { DiagramRenderer } from './renderer'
import {
  computeEnergized,
  createStationModel,
  MAX_SCALE,
  MIN_SCALE,
  type DeviceDef
} from './station'
import {
  buildRecord,
  checkStep,
  createSampleTicket,
  downloadJson,
  parseTicket,
  type OperationTicket,
  type TicketStep
} from './ticket'
import type { TicketPreview } from './agentTicket'

defineOptions({ name: 'EDiagram' })

/* ============================== 基础模型 ============================== */

const model = createStationModel()

const sourceConfig = reactive<Record<string, boolean>>({})
for (const s of model.sources) sourceConfig[s.id] = false
// 默认投入三个电源，便于直接观察潮流与操作效果
for (const id of ['b220_0']) {
  if (id in sourceConfig) sourceConfig[id] = true
}

let energized: Set<string> = new Set()
const isEnergized = (node: string): boolean => energized.has(node)

const pageRef = ref<HTMLDivElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const menuRef = ref<HTMLDivElement | null>(null)

let renderer: DiagramRenderer | null = null

const scalePercent = ref(100)
const animEnabled = ref(true)
const showLabels = ref(true)
const showGrid = ref(true)
const sourceExpand = ref(false)
const liveNodeCount = ref(0)
const dragActive = ref(false)

const activeSourceCount = computed(() => model.sources.filter(s => sourceConfig[s.id]).length)
const sourceGroups = computed(() => {
  const groups: Array<{ voltage: number; items: typeof model.sources }> = []
  for (const v of [220, 110, 35]) {
    const items = model.sources.filter(s => s.voltage === v)
    if (items.length) groups.push({ voltage: v, items })
  }
  return groups
})

/* ============================== 消息提示 ============================== */

interface Toast {
  id: number
  type: 'success' | 'error' | 'info' | 'warn'
  text: string
}

const toasts = ref<Toast[]>([])
let toastSeq = 0

function toast(type: Toast['type'], text: string, duration = 3200): void {
  const id = ++toastSeq
  toasts.value.push({ id, type, text })
  if (toasts.value.length > 4) toasts.value.shift()
  setTimeout(() => {
    const i = toasts.value.findIndex(t => t.id === id)
    if (i >= 0) toasts.value.splice(i, 1)
  }, duration)
}

/* ============================== 悬浮提示 ============================== */

const ROLE_TEXT: Record<string, string> = {
  breaker: '断路器',
  disconnector: '隔离开关',
  ground: '接地刀闸'
}

const tip = reactive({ visible: false, x: 0, y: 0, label: '', closed: false, role: '' })
let hoverRaf = 0
let pendingHover: { device: DeviceDef | null; screenX: number; screenY: number } | null = null

/* ============================== 设备菜单 ============================== */

const menu = reactive({
  visible: false,
  x: 0,
  y: 0,
  deviceId: '',
  label: '',
  closed: false
})

let menuDevice: DeviceDef | null = null

function openMenu(device: DeviceDef, sx: number, sy: number): void {
  if(menu.visible)return
  menuDevice = device
  menu.visible = true
  menu.deviceId = device.id
  menu.label = device.label
  menu.closed = device.get()
  const w = containerRef.value?.clientWidth ?? 800
  const h = containerRef.value?.clientHeight ?? 600
  menu.x = Math.min(sx + 6, Math.max(10, w - 210))
  menu.y = Math.min(sy + 6, Math.max(10, h - 150))
  nextTick(() => {
    if (menuRef.value) {
      gsap.fromTo(menuRef.value, { scale: 0.9, opacity: 0 }, {
        scale: 1, opacity: 1, duration: 0.18, ease: 'power3.out', overwrite: true
      })
    }
  })
}

function closeMenu(): void {
  if (!menu.visible) return
  const el = menuRef.value
  if (!el) { menu.visible = false; return }
  gsap.to(el, {
    scale: 0.88,
    opacity: 0,
    duration: 0.14,
    ease: 'power2.in',
    overwrite: true,
    onComplete: () => { menu.visible = false; menuDevice = null }
  })
}

function toggleMenuDevice(): void {
  if (menuDevice) applyDevice(menuDevice, !menuDevice.get())
  closeMenu()
}

function focusMenuDevice(): void {
  if (menuDevice) renderer?.focusDevice(menuDevice, Math.max(renderer.view.scale, 1))
  closeMenu()
}

/* ============================== 拓扑 / 设备操作 ============================== */

function refreshTopology(): void {
  energized = computeEnergized(model, sourceConfig)
  liveNodeCount.value = energized.size
  renderer?.markChanged()
  if (ticket.value) refreshChecks()
}

function applyDevice(device: DeviceDef, value: boolean): boolean {
  const from = device.get()
  if (from === value) return false
  device.set(value)
  refreshTopology()
  renderer?.animateDevice(device.id, from, value)
  renderer?.ripple(device.x, device.y, value ? '#3ddc97' : '#ff5f6d', 64, 620)
  return true
}

function onSourceChange(id: string, e: Event): void {
  const target = e.target as HTMLInputElement
  sourceConfig[id] = target.checked
  refreshTopology()
}

/* ============================== 操作票状态 ============================== */

const ticket = ref<OperationTicket | null>(null)
const panelOpen = ref(false)
const agentOpen = ref(false)
const running = ref(false)
const autoPlaying = ref(false)
const currentIndex = ref(0)
const confirmStep = ref<TicketStep | null>(null)
const guideWrong = ref(false)

const initialSnapshot = new Map<string, boolean>()
let autoTimer = 0

const currentStep = computed<TicketStep | null>(() => {
  const t = ticket.value
  if (!t) return null
  return t.steps[currentIndex.value] ?? null
})

const ticketRunning = computed(() => running.value && !!currentStep.value)

/* ------------------------------ 载入 / 解析 ------------------------------ */

function applyTicket(t: OperationTicket, errors: string[]): void {
  // 记录当前一次设备状态，供“重置”还原
  initialSnapshot.clear()
  for (const d of model.devices) initialSnapshot.set(d.id, d.get())

  ticket.value = t
  panelOpen.value = true
  running.value = false
  autoPlaying.value = false
  confirmStep.value = null
  const firstPending = t.steps.findIndex(s => s.status === 'pending')
  currentIndex.value = firstPending >= 0 ? firstPending : 0
  refreshChecks()
  syncHighlights()

  if (errors.length) {
    toast('warn', `已载入 ${t.steps.length} 步，其中 ${errors.length} 步无法识别，请检查设备编号`, 5200)
  } else {
    toast('success', `操作票「${t.meta.title}」已载入待执行 · 共 ${t.steps.length} 步`)
  }
}

/**
 * 智能体回答解析出的操作票 → 自动载入「待执行」。
 * 返回结果供对话面板展示；执行中的操作票不会被静默覆盖。
 */
function loadAgentTicket(preview: TicketPreview): { ok: boolean; message: string } {
  const { ticket: parsed, errors } = preview.result
  if (!parsed) {
    const msg = errors[0] || '未能从回答中解析出可执行的操作票'
    toast('error', msg, 5000)
    return { ok: false, message: msg }
  }

  const busy = !!ticket.value && running.value &&
    !ticket.value.steps.every(s => s.status === 'done' || s.status === 'skipped')
  if (busy) {
    const msg = '当前操作票正在执行，新票未自动覆盖；请先移除操作票后再载入'
    toast('warn', msg, 5600)
    return { ok: false, message: msg }
  }

  applyTicket(parsed, errors)
  return { ok: true, message: `已自动载入待执行 · 共 ${parsed.steps.length} 步` }
}

function readTicketFile(file: File): void {
  if (!/\.json$/i.test(file.name)) {
    toast('error', '仅支持 .json 格式的操作票文件')
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const raw = JSON.parse(String(reader.result))
      const { ticket: parsed, errors } = parseTicket(raw, model, file.name)
      if (!parsed) {
        toast('error', errors[0] || '操作票解析失败')
        return
      }
      applyTicket(parsed, errors)
    } catch (err) {
      toast('error', `JSON 解析失败：${(err as Error).message}`)
    }
  }
  reader.onerror = () => toast('error', '文件读取失败')
  reader.readAsText(file, 'utf-8')
}

function handleUpload(file: File): void {
  readTicketFile(file)
}

function loadSample(): void {
  const { ticket: parsed, errors } = parseTicket(createSampleTicket(), model, '示例操作票.json')
  if (parsed) applyTicket(parsed, errors)
  else toast('error', errors[0] || '示例操作票解析失败')
}

function downloadTemplate(): void {
  downloadJson('operation-ticket-template.json', createSampleTicket())
  toast('info', '模板已开始下载，可参考其中的字段说明')
}

/* ------------------------------ 校核 / 执行 ------------------------------ */

function refreshChecks(): void {
  const t = ticket.value
  if (!t) return
  for (const step of t.steps) {
    if (!step.deviceId || step.status === 'done') continue
    step.check = checkStep(step, model, isEnergized)
  }
}

function syncHighlights(): void {
  const t = ticket.value
  if (!renderer || !t) {
    if (renderer) {
      renderer.activeDeviceId = null
      renderer.doneDeviceIds.clear()
    }
    return
  }
  renderer.doneDeviceIds.clear()
  for (const s of t.steps) {
    if (s.status === 'done' && s.deviceId) renderer.doneDeviceIds.set(s.deviceId, s.seq)
  }
  const cur = running.value ? currentStep.value : null
  renderer.activeDeviceId = cur && cur.deviceId ? cur.deviceId : null
  renderer.markChanged()
}

function start(): void {
  const t = ticket.value
  if (!t) return
  const first = t.steps.findIndex(s => s.status === 'pending')
  if (first < 0) {
    toast('info', '操作票已全部执行完毕，如需重来请点击“重置状态”')
    return
  }
  currentIndex.value = first
  running.value = true
  syncHighlights()
  focusCurrent()
  toast('info', '已进入执行模式：请在接线图上点击高亮设备完成操作')
}

function pause(): void {
  running.value = false
  autoPlaying.value = false
  clearTimeout(autoTimer)
  syncHighlights()
}

function executeCurrent(forced = false): void {
  const step = currentStep.value
  if (!step) return
  if (step.status === 'done' || step.status === 'skipped') { advance(); return }

  const device = model.deviceMap.get(step.deviceId)
  if (!device) {
    toast('error', step.message || '当前步骤未关联有效设备')
    return
  }
  const res = checkStep(step, model, isEnergized)
  step.check = res
  if (res.level === 'error' && !forced) {
    confirmStep.value = step
    return
  }
  performStep(step)
}

function forceExecute(): void {
  const step = confirmStep.value
  confirmStep.value = null
  if (step) executeCurrent(true)
}

function performStep(step: TicketStep): void {
  const device = model.deviceMap.get(step.deviceId)
  if (!device) return
  const before = device.get()
  const target = step.action === 'close'
  applyDevice(device, target)
  step.before = before
  step.after = device.get()
  step.status = 'done'
  step.executedAt = timeString()
  step.message = before === target ? '设备原已在目标位置' : (target ? '合闸到位 ✓' : '分闸到位 ✓')
  renderer?.ripple(device.x, device.y, '#3ddc97', 90, 800)
  renderer?.clearError()
  toast('success', `第 ${step.seq} 步完成：${step.text}`)
  advance()
}

function advance(): void {
  const t = ticket.value
  if (!t) return
  syncHighlights()

  let next = t.steps.findIndex((s, i) => i > currentIndex.value && s.status === 'pending')
  if (next < 0) next = t.steps.findIndex(s => s.status === 'pending')
  if (next < 0) {
    running.value = false
    autoPlaying.value = false
    clearTimeout(autoTimer)
    syncHighlights()
    toast('success', '操作票全部执行完成 🎉', 4200)
    return
  }
  currentIndex.value = next
  syncHighlights()
  focusCurrent()
  if (autoPlaying.value) scheduleAuto()
}

function skipStep(): void {
  const step = currentStep.value
  if (!step) return
  step.status = 'skipped'
  step.message = '已跳过（未操作设备）'
  step.executedAt = timeString()
  toast('info', `第 ${step.seq} 步已跳过`)
  advance()
}

function autoPlay(): void {
  const t = ticket.value
  if (!t) return
  const first = t.steps.findIndex(s => s.status === 'pending')
  if (first < 0) { toast('info', '没有待执行步骤'); return }
  currentIndex.value = first
  running.value = true
  autoPlaying.value = true
  syncHighlights()
  focusCurrent()
  scheduleAuto()
  toast('info', '自动演示已开始')
}

function scheduleAuto(): void {
  clearTimeout(autoTimer)
  autoTimer = window.setTimeout(() => {
    if (!autoPlaying.value) return
    const step = currentStep.value
    if (!step) { autoPlaying.value = false; return }
    if (step.status === 'done' || step.status === 'skipped') { advance(); return }
    const res = checkStep(step, model, isEnergized)
    step.check = res
    if (res.level === 'error') {
      autoPlaying.value = false
      toast('error', `自动演示已暂停：${res.message}`, 5000)
      return
    }
    performStep(step)
  }, 900)
}

function resetTicket(): void {
  const t = ticket.value
  if (!t) return
  clearTimeout(autoTimer)
  autoPlaying.value = false
  running.value = false
  // 恢复载入操作票时的一次设备状态
  let restored = 0
  for (const [id, value] of initialSnapshot) {
    const d = model.deviceMap.get(id)
    if (d && d.get() !== value) { d.set(value); restored++ }
  }
  for (const s of t.steps) {
    s.status = 'pending'
    s.message = ''
    s.executedAt = ''
    s.before = null
    s.after = null
  }
  currentIndex.value = 0
  refreshTopology()
  refreshChecks()
  syncHighlights()
  renderer?.markChanged()
  toast('info', restored ? `已恢复 ${restored} 台设备并重置操作票` : '操作票已重置')
}

function clearTicket(): void {
  const snapshot = new Map(initialSnapshot)
  clearTimeout(autoTimer)
  autoPlaying.value = false
  running.value = false
  ticket.value = null
  confirmStep.value = null
  for (const [id, value] of snapshot) {
    const d = model.deviceMap.get(id)
    if (d) d.set(value)
  }
  initialSnapshot.clear()
  refreshTopology()
  if (renderer) {
    renderer.activeDeviceId = null
    renderer.doneDeviceIds.clear()
    renderer.markChanged()
  }
  toast('info', '操作票已移除，设备状态已还原')
}

function exportRecord(): void {
  const t = ticket.value
  if (!t) return
  downloadJson(`操作票执行记录-${t.meta.ticketNo || Date.now()}.json`, buildRecord(t, '示范变电站'))
  toast('success', '执行记录已导出')
}

function focusCurrent(): void {
  const step = currentStep.value
  if (!step || !renderer) return
  const d = model.deviceMap.get(step.deviceId)
  if (d) renderer.focusDevice(d, Math.max(renderer.view.scale, 0.9))
}

function focusStep(index: number): void {
  const t = ticket.value
  if (!t) return
  const step = t.steps[index]
  if (!step) return
  currentIndex.value = index
  syncHighlights()
  const d = model.deviceMap.get(step.deviceId)
  if (d) renderer?.focusDevice(d, Math.max(renderer?.view.scale ?? 1, 0.9))
}

function timeString(): string {
  const d = new Date()
  const p = (n: number): string => String(n).padStart(2, '0')
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

/* ------------------------------ 画布交互回调 ------------------------------ */

function handleDeviceClick(device: DeviceDef, x: number, y: number): void {
  closeMenu()
  // 执行模式下：点击目标设备即完成当前操作步骤
  if (running.value && currentStep.value) {
    const step = currentStep.value
    if (step.deviceId === device.id) {
      executeCurrent()
    } else {
      guideWrong.value = true
      setTimeout(() => { guideWrong.value = false }, 600)
      renderer?.flashError(step.deviceId)
      toast('warn', `当前步骤应操作「${step.deviceLabel}」，请重新选择`, 2600)
    }
    return
  }
  openMenu(device, x, y)
}

function handleHover(info: { device: DeviceDef | null; screenX: number; screenY: number }): void {
  // 鼠标移动事件频率高于渲染帧率，这里做一帧节流，避免无谓的响应式更新
  pendingHover = info
  if (hoverRaf) return
  hoverRaf = requestAnimationFrame(() => {
    hoverRaf = 0
    const cur = pendingHover
    if (!cur) return
    const d = cur.device
    if (!d) {
      tip.visible = false
      return
    }
    const w = containerRef.value?.clientWidth ?? 800
    const h = containerRef.value?.clientHeight ?? 600
    tip.visible = true
    tip.label = d.label
    tip.closed = d.get()
    tip.role = ROLE_TEXT[d.role] ?? ''
    tip.x = Math.min(cur.screenX + 16, w - 200)
    tip.y = Math.min(cur.screenY + 16, h - 96)
  })
}

/* ============================== 视图控制 ============================== */

function zoomIn(): void { renderer?.zoomBy(1.25) }
function zoomOut(): void { renderer?.zoomBy(0.8) }
function resetView(): void { renderer?.fit(true) }

function onZoomSlider(e: Event): void {
  const value = Number((e.target as HTMLInputElement).value) / 100
  const target = Math.min(MAX_SCALE, Math.max(MIN_SCALE, value))
  renderer?.zoomTo(target)
}

function toggleAnim(): void {
  animEnabled.value = !animEnabled.value
  if (renderer) { renderer.animEnabled = animEnabled.value; renderer.requestRender() }
}

function toggleLabels(): void {
  showLabels.value = !showLabels.value
  if (renderer) { renderer.showLabels = showLabels.value; renderer.requestRender() }
}

function toggleGrid(): void {
  showGrid.value = !showGrid.value
  if (renderer) { renderer.showGrid = showGrid.value; renderer.requestRender() }
}

function toggleFullscreen(): void {
  const el = pageRef.value
  if (!el) return
  if (document.fullscreenElement) document.exitFullscreen()
  else el.requestFullscreen?.()
}

/* ============================== 拖拽上传 ============================== */

function onDragOver(e: DragEvent): void {
  if (!e.dataTransfer?.types.includes('Files')) return
  e.preventDefault()
  dragActive.value = true
}

function onDragLeave(e: DragEvent): void {
  if (e.relatedTarget === null) dragActive.value = false
}

function onDrop(e: DragEvent): void {
  e.preventDefault()
  dragActive.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) readTicketFile(file)
}

/* ============================== 键盘快捷键 ============================== */

function onKeyDown(e: KeyboardEvent): void {
  const target = e.target as HTMLElement | null
  if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return
  switch (e.key) {
    case ' ':
      if (running.value) { e.preventDefault(); executeCurrent() }
      break
    case 'Escape':
      if (confirmStep.value) confirmStep.value = null
      else closeMenu()
      break
    case '+':
    case '=':
      zoomIn()
      break
    case '-':
      zoomOut()
      break
    case '0':
    case 'f':
      resetView()
      break
  }
}

/* ============================== 生命周期 ============================== */

onMounted(() => {
  const canvas = canvasRef.value
  const container = containerRef.value
  if (!canvas || !container) return

  renderer = new DiagramRenderer(canvas, container, model, isEnergized)
  renderer.sourceOn = id => !!sourceConfig[id]
  renderer.animEnabled = animEnabled.value
  renderer.showLabels = showLabels.value
  renderer.showGrid = showGrid.value
  renderer.onScaleChange = s => { scalePercent.value = Math.round(s * 100) }
  renderer.onHoverChange = handleHover
  renderer.onDeviceClick = handleDeviceClick
  renderer.onDeviceContext = (device, x, y) => { closeMenu(); openMenu(device, x, y) }
  renderer.onBackgroundClick = () => closeMenu()
  renderer.mount()

  refreshTopology()
  renderer.markChanged()
  renderer.fitInstant()

  window.addEventListener('dragover', onDragOver)
  window.addEventListener('dragleave', onDragLeave)
  window.addEventListener('drop', onDrop)
  window.addEventListener('keydown', onKeyDown)
})

onBeforeUnmount(() => {
  clearTimeout(autoTimer)
  renderer?.destroy()
  renderer = null
  window.removeEventListener('dragover', onDragOver)
  window.removeEventListener('dragleave', onDragLeave)
  window.removeEventListener('drop', onDrop)
  window.removeEventListener('keydown', onKeyDown)
})
</script>

<style lang="scss" scoped>
/* 项目全局样式含 `* { font-size: 1vmin }`，会让未显式声明字号的元素变得极小。
   这里统一让文本元素继承父级字号，具体类名（特异性更高）仍可覆盖。 */
:where(p, span, b, i, em, strong, small, label, li, h1, h2, h3, h4, input, button) {
  font-size: inherit;
}

/* ================================ 布局 ================================ */

.diagram-page {
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #05090f;
}

.stage {
  position: relative;
  /* 新增：给浮层做定位参照 */
  display: flex;
  flex: 1;
  min-width: 0;
  height: 100%;
}

/* 新增：操作票浮层容器，脱离文档流，不再挤压 canvas */
.dock-layer {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 15;
  display: flex;
  min-width: 0;
}

.diagram-container {
  position: relative;
  flex: 1;
  min-width: 0;
  height: 100%;
  overflow: hidden;
  cursor: grab;
  touch-action: none;
  user-select: none;
  background:
    radial-gradient(1100px 640px at 26% 12%, rgba(36, 92, 142, 0.34), transparent 62%),
    radial-gradient(860px 560px at 82% 88%, rgba(18, 122, 112, 0.2), transparent 60%),
    linear-gradient(165deg, #0a1622 0%, #060c14 58%, #04070c 100%);

  &.is-dragging {
    cursor: grabbing;
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
}

/* ================================ HUD ================================ */

.hud-corner {
  position: absolute;
  z-index: 12;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;

  &.top-left {
    top: 16px;
    left: 16px;
    align-items: flex-start;
  }

  &.top-right {
    top: 16px;
    right: 16px;
    align-items: flex-end;
  }

  >* {
    pointer-events: auto;
  }
}

.hud {
  border-radius: 13px;
  background: rgba(13, 22, 33, 0.78);
  border: 1px solid rgba(110, 165, 215, 0.2);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.42);
  backdrop-filter: blur(12px);
  color: #cfe6ff;
}

.hud-info {
  padding: 10px 14px;
}

.hud-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #eaf5ff;
  letter-spacing: 0.3px;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #46e08a;
  box-shadow: 0 0 0 0 rgba(70, 224, 138, 0.7);
  animation: halo 2.2s ease-out infinite;

  &.off {
    background: #ff5f6d;
    animation: none;
    box-shadow: 0 0 10px rgba(255, 95, 109, 0.7);
  }
}

@keyframes halo {
  0% {
    box-shadow: 0 0 0 0 rgba(70, 224, 138, 0.6);
  }

  70% {
    box-shadow: 0 0 0 9px rgba(70, 224, 138, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(70, 224, 138, 0);
  }
}

.hud-sub {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  font-size: 11.5px;
  color: #7fa8c9;

  .sep {
    width: 1px;
    height: 10px;
    background: rgba(120, 170, 220, 0.3);
  }

  .live {
    color: #46e08a;
  }

  .dead {
    color: #ff8f98;
  }
}

.hud-legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px 12px;
  max-width: 230px;
  padding: 9px 13px;
  font-size: 11.5px;
  color: #9dc0dd;
  &.left {
    transform: translate(-360px);
  }

  .lg {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  .sw {
    width: 12px;
    height: 12px;
    border-radius: 3px;
    display: inline-block;

    &.closed {
      background: #3ddc97;
      box-shadow: 0 0 8px rgba(61, 220, 151, 0.55);
    }

    &.open {
      background: transparent;
      border: 2px solid #ff5f6d;
    }

    &.ground {
      background: #ffa94d;
    }

    &.live {
      background: #25f0a5;
    }

    &.active {
      background: #ffd166;
    }
  }
}

.reopen-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 14px;
  font-size: 12.5px;
  color: #04231a;
  cursor: pointer;
  border: 1px solid rgba(120, 240, 200, 0.5);
  background: linear-gradient(135deg, rgba(70, 224, 138, 0.95), rgba(34, 158, 190, 0.95));
  font-weight: 600;
  transition: transform 0.18s, box-shadow 0.18s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 26px rgba(45, 200, 150, 0.3);
  }
}

/* 智能体开票入口：与操作票入口做蓝色系区分 */
.reopen-btn.agent-btn {
  color: #06192e;
  border-color: rgba(140, 200, 255, 0.55);
  background: linear-gradient(135deg, rgba(150, 205, 255, 0.96), rgba(92, 140, 255, 0.96));

  &:hover {
    box-shadow: 0 10px 26px rgba(90, 150, 255, 0.32);
  }
}

/* 执行指引条 */
.hud-guide {
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: min(520px, 44vw);
  padding: 10px 14px;
  border-color: rgba(255, 209, 102, 0.4);
  background: linear-gradient(135deg, rgba(38, 32, 18, 0.92), rgba(14, 22, 33, 0.9));

  &.lv-error {
    border-color: rgba(255, 95, 109, 0.6);
  }

  &.wrong {
    animation: shake 0.5s ease;
    border-color: rgba(255, 95, 109, 0.8);
  }
}

@keyframes shake {

  0%,
  100% {
    transform: translateX(0);
  }

  20% {
    transform: translateX(-8px);
  }

  40% {
    transform: translateX(8px);
  }

  60% {
    transform: translateX(-5px);
  }

  80% {
    transform: translateX(5px);
  }
}

.guide-left {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}

.guide-seq {
  flex: none;
  padding: 4px 9px;
  border-radius: 8px;
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
  color: #04231a;
  background: #ffd166;
  font-weight: 600;
}

.guide-main {
  min-width: 0;
}

.guide-text {
  margin: 0;
  font-size: 13px;
  color: #eaf5ff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.guide-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 3px 0 0;
  font-size: 11.5px;
  color: #9dc0dd;

  b {
    color: #ffd166;
  }
}

.guide-action {
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 10.5px;
  text-align: center;

  &.close {
    color: #04231a;
    background: #46e08a;
  }

  &.open {
    color: #2a0a0e;
    background: #ff7a85;
  }
}

.guide-right {
  flex: none;
  display: flex;
  gap: 6px;
}

.mini-btn {
  padding: 5px 10px;
  border-radius: 8px;
  border: 1px solid rgba(120, 170, 220, 0.3);
  background: rgba(40, 62, 86, 0.6);
  color: #d7e7f7;
  font-size: 11.5px;
  cursor: pointer;
  transition: all 0.16s;

  &:hover {
    background: rgba(70, 120, 170, 0.7);
    border-color: rgba(140, 205, 255, 0.65);
  }

  &.primary {
    color: #04231a;
    font-weight: 600;
    border-color: rgba(120, 240, 200, 0.5);
    background: linear-gradient(135deg, #46e08a, #22c7a0);
  }

  &.ghost {
    background: transparent;
  }
}

/* ================================ 电源面板 ================================ */

.source-panel {
  position: absolute;
  left: 16px;
  bottom: 16px;
  z-index: 12;
  width: 190px;
  max-height: calc(1.7rem + 24px);
  padding: 10px 12px;
  border-radius: 13px;
  background: rgba(13, 22, 33, 0.82);
  border: 1px solid rgba(110, 165, 215, 0.2);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.42);
  backdrop-filter: blur(12px);
  color: #cfe6ff;
  font-size: 12.5px;
  overflow: hidden;
  transition: max-height 0.28s cubic-bezier(0.4, 0, 0.2, 1);

  &.expand {
    max-height: 46vh;
  }
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 7px;
  font-weight: 600;
  color: #e8f4ff;
  font-size: 12.5px;
  cursor: pointer;

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #46e08a;
    box-shadow: 0 0 8px #46e08a;
  }

  .panel-count {
    margin-left: auto;
    font-size: 11px;
    color: #7fa8c9;
    font-variant-numeric: tabular-nums;
  }

  .chev {
    color: #7fa8c9;
    transition: transform 0.25s;

    &.up {
      transform: rotate(180deg);
    }
  }
}

.source-list {
  margin-top: 9px;
  max-height: calc(46vh - 58px);
  overflow-y: auto;
  padding-right: 4px;

  &::-webkit-scrollbar {
    display: block;
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(120, 170, 220, 0.35);
    border-radius: 3px;
  }
}

.source-group {
  margin-bottom: 8px;
}

.group-label {
  font-size: 10.5px;
  letter-spacing: 0.6px;
  color: #5f83a2;
  margin-bottom: 2px;
}

.source-item {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 3px 0;
  cursor: pointer;
  color: #b8d4ea;
  transition: color 0.15s;

  &:hover {
    color: #eaf5ff;
  }

  span {
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  input[type='checkbox'] {
    flex: none;
    width: 14px;
    height: 14px;
    accent-color: #22c7a0;
    cursor: pointer;
  }
}

/* ================================ 工具栏 ================================ */

.toolbar {
  position: absolute;
  right: 16px;
  bottom: 16px;
  z-index: 12;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 13px;
  background: rgba(13, 22, 33, 0.82);
  border: 1px solid rgba(110, 165, 215, 0.2);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.42);
  backdrop-filter: blur(12px);

  button {
    width: 30px;
    height: 30px;
    display: grid;
    place-items: center;
    border-radius: 8px;
    border: 1px solid rgba(120, 170, 220, 0.22);
    background: rgba(40, 60, 80, 0.55);
    color: #cfe6ff;
    cursor: pointer;
    transition: all 0.16s;

    &:hover {
      background: rgba(70, 120, 170, 0.6);
      border-color: rgba(120, 200, 255, 0.6);
    }

    &:active {
      transform: scale(0.94);
    }

    &.active {
      color: #04231a;
      background: linear-gradient(135deg, #46e08a, #22c7a0);
      border-color: rgba(120, 240, 200, 0.6);
    }
  }

  .divider {
    width: 1px;
    height: 18px;
    margin: 0 2px;
    background: rgba(120, 170, 220, 0.22);
  }

  .zoom-range {
    width: 84px;
    accent-color: #22c7a0;
    cursor: pointer;
  }

  .scale {
    min-width: 42px;
    text-align: center;
    color: #7fa8c9;
    font-size: 11.5px;
    font-variant-numeric: tabular-nums;
  }
}

/* ================================ 悬浮提示 ================================ */

.device-tip {
  position: absolute;
  z-index: 20;
  min-width: 150px;
  padding: 8px 11px;
  border-radius: 10px;
  pointer-events: none;
  background: rgba(10, 20, 30, 0.94);
  border: 1px solid rgba(95, 208, 255, 0.4);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
}

.tip-name {
  font-size: 12.5px;
  color: #eaf5ff;
  margin-bottom: 4px;
}

.tip-meta {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 11px;
  color: #7fa8c9;
}

.tip-state {
  padding: 1px 7px;
  border-radius: 999px;

  &.on {
    color: #04231a;
    background: #46e08a;
  }

  &.off {
    color: #2a0a0e;
    background: #ff7a85;
  }
}

.tip-hint {
  margin-top: 5px;
  font-size: 10.5px;
  color: #5f83a2;
}

/* ================================ 右键菜单 ================================ */

.context-menu {
  position: absolute;
  z-index: 30;
  min-width: 190px;
  padding: 11px 12px 12px;
  border-radius: 12px;
  background: rgba(14, 24, 35, 0.96);
  border: 1px solid rgba(120, 190, 255, 0.32);
  box-shadow: 0 16px 38px rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(14px);
  color: #cfe6ff;
  font-size: 12.5px;
}

.menu-title {
  font-weight: 600;
  color: #eaf5ff;
  margin-bottom: 6px;
}

.menu-state {
  color: #8fb4d4;
  font-size: 11.5px;
  margin-bottom: 10px;
  display: flex;
  gap: 6px;

  .state-on {
    color: #46e08a;
    font-weight: 600;
  }

  .state-off {
    color: #ff5f6d;
    font-weight: 600;
  }
}

.menu-actions {
  display: flex;
  gap: 6px;
}

.menu-action {
  flex: 1;
  padding: 7px 0;
  border-radius: 8px;
  border: 1px solid rgba(120, 200, 255, 0.4);
  background: rgba(50, 110, 170, 0.45);
  color: #d7ecff;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.16s;

  &:hover {
    background: rgba(70, 150, 220, 0.65);
    border-color: rgba(150, 220, 255, 0.8);
  }

  &.ghost {
    flex: 0 0 62px;
    background: transparent;
  }
}

/* ================================ 拖拽遮罩 / 弹窗 / 提示 ================================ */

.drop-mask {
  position: absolute;
  inset: 0;
  z-index: 40;
  display: grid;
  place-items: center;
  background: rgba(4, 10, 18, 0.72);
  backdrop-filter: blur(3px);
}

.drop-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 34px 52px;
  border-radius: 18px;
  border: 2px dashed rgba(70, 224, 138, 0.75);
  background: rgba(12, 26, 24, 0.75);
  color: #8ff0c4;

  p {
    margin: 0;
    font-size: 14px;
  }
}

.modal-mask {
  position: absolute;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  background: rgba(3, 8, 14, 0.6);
  backdrop-filter: blur(4px);
}

.modal {
  width: 380px;
  padding: 22px;
  border-radius: 16px;
  background: linear-gradient(160deg, rgba(24, 32, 44, 0.98), rgba(12, 18, 26, 0.98));
  border: 1px solid rgba(255, 95, 109, 0.4);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.65);
  color: #dbeafe;

  h4 {
    margin: 8px 0 6px;
    font-size: 15px;
    color: #ffb0b6;
  }

  p {
    margin: 0;
    font-size: 12.5px;
    line-height: 1.6;
  }
}

.modal-icon {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  font-weight: 700;
  color: #2a0a0e;
  background: #ff7a85;
}

.modal-msg {
  color: #ffd0d4;
}

.modal-step {
  margin-top: 6px !important;
  color: #8fb4d4;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 18px;
}

.tp-btn {
  padding: 7px 14px;
  border-radius: 9px;
  border: 1px solid rgba(120, 170, 220, 0.3);
  background: rgba(40, 62, 86, 0.6);
  color: #d7e7f7;
  font-size: 12.5px;
  cursor: pointer;
  transition: all 0.18s;

  &:hover {
    background: rgba(70, 120, 170, 0.7);
  }

  &.ghost {
    background: transparent;
  }

  &.danger {
    color: #2a0a0e;
    background: #ff7a85;
    border-color: rgba(255, 140, 150, 0.6);
  }
}

.toast-wrap {
  position: fixed;
  left: 50%;
  bottom: 78px;
  transform: translateX(-50%);
  z-index: 80;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 9px;
  max-width: 460px;
  padding: 9px 15px;
  border-radius: 11px;
  font-size: 12.5px;
  color: #dbeafe;
  background: rgba(12, 20, 30, 0.94);
  border: 1px solid rgba(110, 165, 215, 0.3);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(12px);
  will-change: transform, opacity;

  .toast-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #5fd0ff;
    box-shadow: 0 0 8px currentColor;
  }

  &.success {
    border-color: rgba(70, 224, 138, 0.5);

    .toast-dot {
      background: #46e08a;
    }
  }

  &.error {
    border-color: rgba(255, 95, 109, 0.55);

    .toast-dot {
      background: #ff5f6d;
    }
  }

  &.warn {
    border-color: rgba(255, 209, 102, 0.55);

    .toast-dot {
      background: #ffd166;
    }
  }
}

/* ================================ 过渡动画 ================================ */

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.22s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.pop-enter-active {
  transition: opacity 0.18s ease;
}

.pop-leave-active {
  transition: opacity 0.14s ease;
}

.pop-enter-from,
.pop-leave-to {
  opacity: 0;
}

.drop-enter-active {
  transition: all 0.32s cubic-bezier(0.2, 0.9, 0.3, 1.2);
}

.drop-leave-active {
  transition: all 0.2s ease;
}

.drop-enter-from,
.drop-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

.dock-enter-active {
  transition: opacity 0.3s ease, transform 0.34s cubic-bezier(0.2, 0.9, 0.3, 1);
}

.dock-leave-active {
  transition: opacity 0.2s ease, transform 0.24s cubic-bezier(0.4, 0, 1, 1);
}

.dock-enter-from,
.dock-leave-to {
  opacity: 0;
  transform: translateX(40px);
}

/* 新增：按钮折叠/展开过渡，避免图例瞬间跳动 */
.reopen-enter-active,
.reopen-leave-active {
  overflow: hidden;
  max-height: 44px;
  margin-bottom: 0;
  transition:
    opacity 0.22s ease,
    transform 0.22s ease,
    max-height 0.26s ease,
    padding 0.26s ease,
    margin-bottom 0.26s ease;
}

.reopen-enter-from,
.reopen-leave-to {
  opacity: 0;
  transform: translateX(14px);
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-bottom: -8px;
  /* 抵消 .hud-corner 的 gap: 8px */
}

.collapse-enter-active,
.collapse-leave-active {
  transition: opacity 0.2s ease;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
}

/* 过渡：不再使用 position: absolute */
.toast-enter-active {
  transition:
    opacity 0.26s ease,
    transform 0.3s cubic-bezier(0.2, 0.9, 0.3, 1.2);
}

.toast-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.96);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}

.toast-move {
  transition: transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1);
}
</style>
