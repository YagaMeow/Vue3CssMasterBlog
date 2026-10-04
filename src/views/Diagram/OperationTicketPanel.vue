<template>
  <aside class="ticket-panel" data-no-pan>
    <header class="tp-header">
      <div class="tp-header-row">
        <span class="tp-chip">操作票</span>
        <h3 class="tp-title" :title="ticket?.meta.title || '操作票执行'">
          {{ ticket?.meta.title || '操作票执行' }}
        </h3>
        <button class="tp-icon-btn" title="收起面板" @click="emit('close')">
          <svg viewBox="0 0 24 24" width="15" height="15">
            <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
      </div>
      <div v-if="ticket" class="tp-meta">
        <span class="tp-meta-item">编号 {{ ticket.meta.ticketNo }}</span>
        <span v-if="ticket.meta.operator" class="tp-meta-item">操作人 {{ ticket.meta.operator }}</span>
        <span v-if="ticket.meta.guardian" class="tp-meta-item">监护人 {{ ticket.meta.guardian }}</span>
      </div>
    </header>

    <!-- 空状态：上传入口 -->
    <div v-if="!ticket" class="tp-empty">
      <div
        class="tp-drop"
        :class="{ 'is-over': dragOver }"
        @click="pickFile"
        @dragover.prevent="dragOver = true"
        @dragleave.prevent="dragOver = false"
        @drop.prevent="onDrop"
      >
        <svg viewBox="0 0 24 24" width="34" height="34">
          <path
            d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M4 15v3a2 2 0 002 2h12a2 2 0 002-2v-3"
            fill="none" stroke="currentColor" stroke-width="1.6"
            stroke-linecap="round" stroke-linejoin="round"
          />
        </svg>
        <p class="tp-drop-title">拖拽 JSON 操作票到此处</p>
        <p class="tp-drop-sub">或点击选择文件</p>
      </div>

      <div class="tp-empty-actions">
        <button class="tp-btn ghost" @click="emit('load-sample')">载入示例操作票</button>
        <button class="tp-btn ghost" @click="emit('download-template')">下载 JSON 模板</button>
      </div>

      <pre class="tp-schema">{{ schemaHint }}</pre>
    </div>

    <!-- 有票状态 -->
    <template v-else>
      <div class="tp-progress">
        <div class="tp-ring" :style="ringStyle">
          <span class="tp-ring-text">{{ percent }}%</span>
        </div>
        <div class="tp-stats">
          <div class="tp-stat"><b>{{ ticket.steps.length }}</b><span>总步数</span></div>
          <div class="tp-stat ok"><b>{{ doneCount }}</b><span>已执行</span></div>
          <div class="tp-stat"><b>{{ pendingCount }}</b><span>待执行</span></div>
          <div v-if="skippedCount" class="tp-stat warn"><b>{{ skippedCount }}</b><span>已跳过</span></div>
        </div>
      </div>

      <div class="tp-actions">
        <button v-if="!running" class="tp-btn primary" :disabled="finished" @click="emit('start')">
          开始执行
        </button>
        <button v-else class="tp-btn" @click="emit('pause')">暂停执行</button>
        <button class="tp-btn" :disabled="finished || autoPlaying" @click="emit('auto')">自动演示</button>
        <button class="tp-btn" :disabled="autoPlaying" @click="emit('reset')">重置状态</button>
        <button class="tp-btn ghost" @click="emit('export-record')">导出记录</button>
        <button class="tp-btn ghost danger" @click="emit('clear')">移除操作票</button>
      </div>

      <div v-if="running && current" class="tp-guide" :class="'lv-' + (current.check?.level || 'ok')">
        <div class="tp-guide-head">
          <span class="tp-guide-seq">第 {{ current.seq }} 步</span>
          <span class="tp-guide-action" :class="current.action">
            {{ current.action === 'close' ? '合闸' : '分闸' }}
          </span>
        </div>
        <p class="tp-guide-text">{{ current.text }}</p>
        <p class="tp-guide-hint">
          请在左侧接线图上点击
          <b>{{ current.deviceLabel }}</b>
          完成本步操作
        </p>
        <p v-if="current.check?.message" class="tp-guide-check">{{ current.check?.message }}</p>
        <div class="tp-guide-actions">
          <button class="tp-btn small" @click="emit('focus')">定位设备</button>
          <button class="tp-btn small primary" @click="emit('execute-current')">代为执行</button>
          <button class="tp-btn small ghost" @click="emit('skip')">跳过</button>
        </div>
      </div>

      <ol ref="listRef" class="tp-steps">
        <li
          v-for="step in ticket.steps"
          :key="step.index"
          class="tp-step"
          :class="[`is-${step.status}`, { 'is-current': running && current && step.index === current.index }]"
          @click="emit('focus-step', step.index)"
        >
          <span class="tp-step-seq">{{ step.seq }}</span>
          <div class="tp-step-body">
            <p class="tp-step-text">{{ step.text }}</p>
            <p class="tp-step-device">
              <span class="tp-tag" :class="step.action">{{ step.action === 'close' ? '合' : '分' }}</span>
              {{ step.deviceLabel }}
            </p>
            <p v-if="step.message" class="tp-step-msg">{{ step.message }}</p>
            <p v-if="step.executedAt" class="tp-step-time">{{ step.executedAt }}</p>
          </div>
          <span class="tp-step-state" :class="step.status">{{ statusText(step.status) }}</span>
        </li>
      </ol>
    </template>

    <input ref="fileRef" class="tp-file" type="file" accept=".json,application/json" @change="onFileChange" />
  </aside>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import type { OperationTicket, StepStatus } from './ticket'
import { TICKET_SCHEMA_HINT } from './ticket'

const props = defineProps<{
  ticket: OperationTicket | null
  running: boolean
  autoPlaying: boolean
  currentIndex: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'load-sample'): void
  (e: 'download-template'): void
  (e: 'upload', file: File): void
  (e: 'start'): void
  (e: 'pause'): void
  (e: 'auto'): void
  (e: 'reset'): void
  (e: 'execute-current'): void
  (e: 'skip'): void
  (e: 'focus'): void
  (e: 'focus-step', index: number): void
  (e: 'export-record'): void
  (e: 'clear'): void
}>()

const schemaHint = TICKET_SCHEMA_HINT

const fileRef = ref<HTMLInputElement | null>(null)
const listRef = ref<HTMLOListElement | null>(null)
const dragOver = ref(false)

const current = computed(() => {
  if (!props.ticket || !props.running) return null
  return props.ticket.steps[props.currentIndex] ?? null
})

const doneCount = computed(() => props.ticket?.steps.filter(s => s.status === 'done').length ?? 0)
const skippedCount = computed(() => props.ticket?.steps.filter(s => s.status === 'skipped').length ?? 0)
const pendingCount = computed(() => (props.ticket?.steps.length ?? 0) - doneCount.value - skippedCount.value)
const finished = computed(() => {
  const t = props.ticket
  if (!t) return true
  return t.steps.every(s => s.status === 'done' || s.status === 'skipped')
})
const percent = computed(() => {
  const t = props.ticket
  if (!t || t.steps.length === 0) return 0
  return Math.round(((doneCount.value + skippedCount.value) / t.steps.length) * 100)
})
const ringStyle = computed(() => ({
  background: `conic-gradient(#3ddc97 0% ${percent.value}%, rgba(120,170,220,0.16) ${percent.value}% 100%)`
}))

const STATUS_TEXT: Record<StepStatus, string> = {
  pending: '待执行',
  active: '执行中',
  done: '已完成',
  skipped: '已跳过',
  error: '异常'
}

function statusText(s: StepStatus): string {
  return STATUS_TEXT[s]
}

function pickFile(): void {
  fileRef.value?.click()
}

function onFileChange(e: Event): void {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) emit('upload', file)
  input.value = ''
}

function onDrop(e: DragEvent): void {
  dragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) emit('upload', file)
}

// 当前步骤自动滚动到可视区域
watch(
  () => props.currentIndex,
  index => {
    const el = listRef.value?.querySelector<HTMLElement>(`li:nth-child(${index + 1})`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
)
</script>

<style lang="scss" scoped>
/* 全局样式含 `* { font-size: 1vmin }`，此处让文本元素继承父级字号 */
:where(p, span, b, i, em, strong, small, label, li, h3, h4, input, button) {
  font-size: inherit;
}

.ticket-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 348px;
  flex: 0 0 348px;
  height: 100%;
  padding: 14px 14px 10px;
  box-sizing: border-box;
  color: #d7e7f7;
  background: linear-gradient(180deg, rgba(16, 26, 38, 0.96) 0%, rgba(10, 17, 26, 0.98) 100%);
  border-left: 1px solid rgba(110, 165, 215, 0.18);
  box-shadow: -18px 0 44px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(14px);
  font-size: 13px;
  overflow: hidden;
}

.tp-header {
  flex: none;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(110, 165, 215, 0.14);
}

.tp-header-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tp-chip {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  letter-spacing: 0.5px;
  color: #04231a;
  background: linear-gradient(135deg, #46e08a, #22c7a0);
  box-shadow: 0 0 14px rgba(70, 224, 138, 0.35);
  flex: none;
}

.tp-title {
  flex: 1;
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #eaf5ff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tp-icon-btn {
  flex: none;
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(120, 170, 220, 0.22);
  border-radius: 8px;
  background: rgba(40, 60, 82, 0.5);
  color: #a9c8e4;
  cursor: pointer;
  transition: all 0.18s;

  &:hover {
    color: #fff;
    border-color: rgba(150, 210, 255, 0.6);
    background: rgba(70, 120, 170, 0.55);
  }
}

.tp-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
  margin-top: 8px;
  font-size: 11.5px;
  color: #7fa8c9;
}

/* -------------------------------- 空状态 -------------------------------- */

.tp-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 14px;
  overflow-y: auto;
}

.tp-drop {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 26px 12px;
  border: 1.5px dashed rgba(120, 170, 220, 0.38);
  border-radius: 14px;
  color: #8fb6d6;
  cursor: pointer;
  transition: all 0.2s;

  &:hover,
  &.is-over {
    border-color: rgba(70, 224, 138, 0.85);
    color: #8ff0c4;
    background: rgba(70, 224, 138, 0.07);
    transform: translateY(-1px);
  }
}

.tp-drop-title {
  margin: 6px 0 0;
  font-size: 13px;
  color: #cfe6ff;
}

.tp-drop-sub {
  margin: 0;
  font-size: 11.5px;
  color: #7fa8c9;
}

.tp-empty-actions {
  display: flex;
  gap: 8px;
}

.tp-schema {
  margin: 0;
  padding: 10px;
  border-radius: 10px;
  background: rgba(8, 14, 22, 0.75);
  border: 1px solid rgba(110, 165, 215, 0.14);
  color: #6f93b3;
  font-size: 11px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}

/* -------------------------------- 进度区 -------------------------------- */

.tp-progress {
  flex: none;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 2px;
}

.tp-ring {
  position: relative;
  width: 62px;
  height: 62px;
  flex: none;
  border-radius: 50%;
  display: grid;
  place-items: center;

  &::after {
    content: '';
    position: absolute;
    inset: 6px;
    border-radius: 50%;
    background: #0c151f;
  }
}

.tp-ring-text {
  position: relative;
  z-index: 1;
  font-size: 13px;
  font-weight: 600;
  color: #eaf5ff;
}

.tp-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px 10px;
  flex: 1;
}

.tp-stat {
  display: flex;
  flex-direction: column;

  b {
    font-size: 16px;
    color: #dbeafe;
    font-variant-numeric: tabular-nums;
  }

  span {
    font-size: 11px;
    color: #7fa8c9;
  }

  &.ok b {
    color: #46e08a;
  }

  &.warn b {
    color: #ffc861;
  }
}

/* -------------------------------- 操作按钮 -------------------------------- */

.tp-actions {
  flex: none;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding-bottom: 10px;
}

.tp-btn {
  padding: 6px 11px;
  border-radius: 9px;
  border: 1px solid rgba(120, 170, 220, 0.28);
  background: rgba(40, 62, 86, 0.55);
  color: #d7e7f7;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.18s;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: rgba(70, 120, 170, 0.6);
    border-color: rgba(140, 205, 255, 0.65);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.42;
    cursor: not-allowed;
  }

  &.primary {
    background: linear-gradient(135deg, rgba(58, 200, 140, 0.9), rgba(34, 158, 190, 0.9));
    border-color: rgba(120, 240, 200, 0.55);
    color: #04231a;
    font-weight: 600;
    box-shadow: 0 6px 18px rgba(45, 200, 150, 0.25);
  }

  &.ghost {
    background: transparent;
  }

  &.danger {
    color: #ff9aa2;
    border-color: rgba(255, 95, 109, 0.35);

    &:hover:not(:disabled) {
      background: rgba(255, 95, 109, 0.14);
      border-color: rgba(255, 95, 109, 0.7);
    }
  }

  &.small {
    padding: 4px 9px;
    font-size: 11.5px;
    border-radius: 7px;
  }
}

/* -------------------------------- 当前步骤指引 -------------------------------- */

.tp-guide {
  flex: none;
  margin-bottom: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 209, 102, 0.35);
  background: linear-gradient(135deg, rgba(255, 209, 102, 0.12), rgba(255, 209, 102, 0.03));
  animation: guide-in 0.35s ease;

  &.lv-error {
    border-color: rgba(255, 95, 109, 0.55);
    background: linear-gradient(135deg, rgba(255, 95, 109, 0.14), rgba(255, 95, 109, 0.03));
  }

  &.lv-warn {
    border-color: rgba(255, 200, 97, 0.5);
  }
}

@keyframes guide-in {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tp-guide-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tp-guide-seq {
  font-size: 12px;
  color: #ffd166;
  letter-spacing: 0.4px;
}

.tp-guide-action {
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 11px;

  &.close {
    color: #04231a;
    background: #46e08a;
  }

  &.open {
    color: #2a0a0e;
    background: #ff7a85;
  }
}

.tp-guide-text {
  margin: 6px 0 4px;
  font-size: 13px;
  color: #eaf5ff;
  line-height: 1.5;
}

.tp-guide-hint {
  margin: 0;
  font-size: 11.5px;
  color: #9dc0dd;
  line-height: 1.5;

  b {
    color: #ffd166;
  }
}

.tp-guide-check {
  margin: 6px 0 0;
  font-size: 11.5px;
  color: #ffb0b6;
  line-height: 1.5;
}

.tp-guide-actions {
  display: flex;
  gap: 6px;
  margin-top: 9px;
}

/* -------------------------------- 步骤列表 -------------------------------- */

.tp-steps {
  flex: 1;
  min-height: 0;
  margin: 0;
  padding: 0 2px 16px 0;
  list-style: none;
  overflow-y: auto;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    display: block;
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(120, 170, 220, 0.35);
    border-radius: 3px;
  }
}

.tp-step {
  position: relative;
  display: flex;
  gap: 9px;
  padding: 9px 10px;
  margin-bottom: 6px;
  border-radius: 11px;
  border: 1px solid rgba(110, 165, 215, 0.12);
  background: rgba(20, 32, 46, 0.55);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: rgba(120, 190, 255, 0.4);
    background: rgba(28, 46, 66, 0.7);
    transform: translateX(2px);
  }

  &.is-current {
    border-color: rgba(255, 209, 102, 0.7);
    background: linear-gradient(90deg, rgba(255, 209, 102, 0.14), rgba(20, 32, 46, 0.6));
    box-shadow: 0 0 0 1px rgba(255, 209, 102, 0.18), 0 8px 22px rgba(0, 0, 0, 0.35);

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 10px;
      bottom: 10px;
      width: 3px;
      border-radius: 3px;
      background: #ffd166;
      box-shadow: 0 0 12px #ffd166;
      animation: bar-pulse 1.4s ease-in-out infinite;
    }
  }

  &.is-done {
    border-color: rgba(70, 224, 138, 0.35);
  }

  &.is-skipped {
    opacity: 0.62;
  }

  &.is-error {
    border-color: rgba(255, 95, 109, 0.5);
    background: rgba(60, 22, 28, 0.5);
  }
}

@keyframes bar-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}

.tp-step-seq {
  flex: none;
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  border-radius: 7px;
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
  color: #b6d4ee;
  background: rgba(70, 110, 150, 0.35);

  .is-done & {
    color: #04231a;
    background: #46e08a;
  }

  .is-error & {
    color: #2a0a0e;
    background: #ff7a85;
  }
}

.tp-step-body {
  flex: 1;
  min-width: 0;
}

.tp-step-text {
  margin: 0 0 3px;
  font-size: 12.5px;
  color: #dbeafe;
  line-height: 1.45;
}

.tp-step-device {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  color: #7fa8c9;
}

.tp-tag {
  flex: none;
  width: 16px;
  height: 16px;
  display: grid;
  place-items: center;
  border-radius: 4px;
  font-size: 10.5px;

  &.open {
    color: #2a0a0e;
    background: #ff7a85;
  }

  &.close {
    color: #04231a;
    background: #46e08a;
  }
}

.tp-step-msg {
  margin: 4px 0 0;
  font-size: 11px;
  color: #ffb0b6;
  line-height: 1.45;
}

.tp-step-time {
  margin: 3px 0 0;
  font-size: 10.5px;
  color: #5f83a2;
  font-variant-numeric: tabular-nums;
}

.tp-step-state {
  flex: none;
  align-self: flex-start;
  font-size: 10.5px;
  padding: 2px 6px;
  border-radius: 999px;
  color: #8fb4d4;
  background: rgba(70, 110, 150, 0.25);

  &.done {
    color: #46e08a;
    background: rgba(70, 224, 138, 0.14);
  }

  &.active {
    color: #ffd166;
    background: rgba(255, 209, 102, 0.16);
  }

  &.skipped {
    color: #c8b184;
    background: rgba(200, 177, 132, 0.14);
  }

  &.error {
    color: #ff9aa2;
    background: rgba(255, 95, 109, 0.16);
  }
}

.tp-file {
  display: none;
}
</style>
