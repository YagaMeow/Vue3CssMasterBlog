<template>
  <aside class="agent-panel" data-no-pan>
    <!-- 头部 -->
    <header class="ag-header">
      <div class="ag-title-row">
        <span class="ag-chip">AI 智能体</span>
        <h3 class="ag-title">智能开票助手</h3>
        <span class="ag-dot" :class="{ on: configured }" :title="configured ? '已配置' : '未配置令牌 / 智能体 ID'" />
        <button class="ag-icon-btn" :class="{ active: settingsOpen }" title="设置" @click="settingsOpen = !settingsOpen">
          <svg viewBox="0 0 24 24" width="15" height="15">
            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" fill="none" stroke="currentColor" stroke-width="1.7" />
            <path
              d="M19.4 15a1.7 1.7 0 00.34 1.87l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.7 1.7 0 00-1.87-.34 1.7 1.7 0 00-1 1.56V21a2 2 0 11-4 0v-.09a1.7 1.7 0 00-1.11-1.56 1.7 1.7 0 00-1.87.34l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.7 1.7 0 00.34-1.87 1.7 1.7 0 00-1.56-1H3a2 2 0 110-4h.09A1.7 1.7 0 004.6 8.9a1.7 1.7 0 00-.34-1.87l-.06-.06a2 2 0 112.83-2.83l.06.06a1.7 1.7 0 001.87.34H9a1.7 1.7 0 001-1.56V3a2 2 0 114 0v.09a1.7 1.7 0 001 1.56 1.7 1.7 0 001.87-.34l.06-.06a2 2 0 112.83 2.83l-.06.06a1.7 1.7 0 00-.34 1.87V9a1.7 1.7 0 001.56 1H21a2 2 0 110 4h-.09a1.7 1.7 0 00-1.51 1z"
              fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
          </svg>
        </button>
        <button class="ag-icon-btn" title="收起面板" @click="emit('close')">
          <svg viewBox="0 0 24 24" width="15" height="15">
            <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <Transition name="ag-collapse">
        <div v-if="settingsOpen" class="ag-settings">
          <label class="ag-field">
            <span>访问令牌</span>
            <input v-model="config.token" type="password" spellcheck="false" placeholder="cztei_..." />
          </label>
          <label class="ag-field">
            <span>智能体 ID</span>
            <input v-model="config.botId" spellcheck="false" placeholder="bot_id" />
          </label>
          <label class="ag-field">
            <span>接口地址</span>
            <input v-model="config.baseURL" spellcheck="false" placeholder="https://api.coze.cn" />
          </label>
          <label class="ag-field">
            <span>用户标识</span>
            <input v-model="config.userId" spellcheck="false" placeholder="user_id" />
          </label>
          <label class="ag-check">
            <input v-model="config.includeCatalog" type="checkbox" />
            提问时附带本站设备清单（推荐）
          </label>
          <label class="ag-check">
            <input v-model="config.autoLoad" type="checkbox" />
            解析出操作票后自动载入「待执行」
          </label>
          <div class="ag-settings-actions">
            <button class="ag-btn small" @click="settingsOpen = false">完成</button>
            <button class="ag-btn small ghost" @click="resetConfig">恢复默认</button>
          </div>
        </div>
      </Transition>
    </header>

    <!-- 消息列表 -->
    <div ref="listRef" class="ag-body">
      <div v-if="!messages.length" class="ag-welcome">
        <div class="ag-welcome-icon">
          <svg viewBox="0 0 24 24" width="26" height="26">
            <path d="M12 3l2.2 5.3L20 9.3l-4 3.9.9 5.8L12 16.3 7.1 19l.9-5.8-4-3.9 5.8-1z"
              fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
          </svg>
        </div>
        <p class="ag-welcome-title">向智能体描述操作任务</p>
        <p class="ag-welcome-sub">
          例如「220kV 出线 2 运行改开关及线路检修」，智能体将生成操作票并
          <b>自动载入右侧「待执行」</b>。
        </p>
        <div class="ag-chips">
          <button v-for="p in presets" :key="p" class="ag-chip-btn" :disabled="streaming" @click="send(p)">
            {{ p }}
          </button>
        </div>
      </div>

      <div v-for="m in messages" :key="m.id" class="ag-msg" :class="m.role">
        <div class="ag-avatar" :class="m.role">{{ m.role === 'user' ? '我' : 'AI' }}</div>
        <div class="ag-col">
          <div v-if="m.reasoning" class="ag-reasoning">
            <button class="ag-reasoning-toggle" @click="m.reasoningOpen = !m.reasoningOpen">
              <svg viewBox="0 0 24 24" width="12" height="12" :class="{ open: m.reasoningOpen }">
                <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
              思考过程
            </button>
            <pre v-show="m.reasoningOpen" class="ag-reasoning-text">{{ m.reasoning }}</pre>
          </div>

          <div class="ag-bubble" :class="{ error: !!m.error }">
            <div v-if="m.role === 'assistant' && !m.content && m.streaming" class="ag-typing">
              <i /><i /><i />
            </div>
            <template v-else>{{ displayText(m) }}</template>
          </div>

          <div v-if="m.status && m.streaming" class="ag-status">{{ m.status }}</div>
          <div v-if="m.error" class="ag-error">{{ m.error }}</div>

          <!-- 操作票预览卡片 -->
          <div v-if="m.ticket" class="ag-ticket" :class="{ loaded: m.ticket.loaded }">
            <div class="ag-ticket-head">
              <span class="ag-ticket-badge">操作票</span>
              <b class="ag-ticket-name" :title="m.ticket.title">{{ m.ticket.title }}</b>
              <span class="ag-ticket-count">{{ m.ticket.total }} 步</span>
            </div>
            <div class="ag-ticket-meta">
              <span v-if="m.ticket.ticketNo">编号 {{ m.ticket.ticketNo }}</span>
              <span v-if="m.ticket.unresolved" class="warn">未识别设备 {{ m.ticket.unresolved }}</span>
              <span v-else-if="m.ticket.total" class="ok">设备已全部识别</span>
            </div>
            <ol class="ag-ticket-steps">
              <li v-for="s in m.ticket.steps.slice(0, 6)" :key="s.seq" :class="{ unresolved: !s.resolved }">
                <span class="seq">{{ s.seq }}</span>
                <span class="txt">{{ s.text }}</span>
                <span class="act" :class="s.action">{{ s.action === 'close' ? '合' : '分' }}</span>
              </li>
              <li v-if="m.ticket.total > 6" class="more">…… 其余 {{ m.ticket.total - 6 }} 步</li>
            </ol>
            <div class="ag-ticket-foot">
              <span class="ag-ticket-msg" :class="{ ok: m.ticket.loaded }">{{ m.ticket.message }}</span>
              <button v-if="!m.ticket.loaded" class="ag-btn small primary" @click="applyTicket(m)">载入待执行</button>
            </div>
          </div>

          <div v-if="m.followUps.length" class="ag-chips">
            <button v-for="f in m.followUps" :key="f" class="ag-chip-btn" :disabled="streaming" @click="send(f)">
              {{ f }}
            </button>
          </div>
        </div>
      </div>

      <Transition name="ag-fade">
        <div v-if="noticeText" class="ag-notice" :class="noticeType">{{ noticeText }}</div>
      </Transition>
    </div>

    <!-- 输入区 -->
    <footer class="ag-footer">
      <textarea
        v-model="input"
        class="ag-input"
        rows="2"
        placeholder="描述操作任务，Enter 发送 / Shift+Enter 换行"
        :disabled="streaming"
        @keydown.enter.exact.prevent="send()"
      />
      <div class="ag-footer-actions">
        <span class="ag-hint">流式输出 · 结果自动开票</span>
        <button v-if="streaming" class="ag-btn danger" @click="stop">停止生成</button>
        <button v-else class="ag-btn primary" :disabled="!input.trim()" @click="send()">发送</button>
      </div>
    </footer>
  </aside>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'

import { streamCozeChat, type CozeStreamEvent } from '@/api/coze'
import {
  DEFAULT_AGENT_CONFIG,
  isAgentConfigured,
  loadAgentConfig,
  saveAgentConfig,
  type AgentConfig
} from './agentConfig'
import { buildAgentMessage, buildTicketPreview, extractTicketJson, type TicketPreview } from './agentTicket'
import type { StationModel } from './station'

const props = defineProps<{
  model: StationModel
  /** 由父组件决定是否真正载入（例如执行中的票不覆盖） */
  loadTicket?: (preview: TicketPreview) => { ok: boolean; message: string }
}>()

const emit = defineEmits<{ (e: 'close'): void }>()

interface AnswerPart {
  id: string
  text: string
}

/** 对话面板中的操作票卡片：在预览结果上补充载入状态 */
interface ChatTicket extends TicketPreview {
  loaded: boolean
  message: string
}

interface ChatMessage {
  id: number
  role: 'user' | 'assistant'
  content: string
  reasoning: string
  reasoningOpen: boolean
  streaming: boolean
  error: string
  status: string
  followUps: string[]
  ticket: ChatTicket | null
  parts: AnswerPart[]
}

const presets = [
  '帮我生成220kv出线2运行改开关及线路检修的操作票',
  '220kV出线3由运行转检修，生成操作票',
  '220kV母联由运行转检修操作票',
  '主变1由运行转检修操作票'
]

const config = reactive<AgentConfig>(loadAgentConfig())
watch(config, () => saveAgentConfig(config), { deep: true })

const configured = computed(() => isAgentConfigured(config))

const messages = ref<ChatMessage[]>([])
const input = ref('')
const streaming = ref(false)
const settingsOpen = ref(false)
const listRef = ref<HTMLDivElement | null>(null)

const noticeText = ref('')
const noticeType = ref<'info' | 'warn' | 'error' | 'success'>('info')
let noticeTimer = 0

let msgSeq = 0
let abortCtrl: AbortController | null = null
let lastConversationId = ''

function notice(type: typeof noticeType.value, text: string): void {
  noticeType.value = type
  noticeText.value = text
  clearTimeout(noticeTimer)
  noticeTimer = window.setTimeout(() => (noticeText.value = ''), 4200)
}

function createMessage(role: 'user' | 'assistant'): ChatMessage {
  return reactive<ChatMessage>({
    id: ++msgSeq,
    role,
    content: '',
    reasoning: '',
    reasoningOpen: false,
    streaming: role === 'assistant',
    error: '',
    status: '',
    followUps: [],
    ticket: null,
    parts: []
  })
}

function syncContent(msg: ChatMessage): void {
  msg.content = msg.parts.map(p => p.text).join('')
}

function appendAnswer(msg: ChatMessage, id: string, delta: string): void {
  if (!delta) return
  const key = id || 'answer-0'
  let part = msg.parts.find(p => p.id === key)
  if (!part) {
    part = { id: key, text: '' }
    msg.parts.push(part)
  }
  part.text += delta
  syncContent(msg)
}

function setAnswer(msg: ChatMessage, id: string, full: string): void {
  if (!full) return
  const key = id || 'answer-0'
  let part = msg.parts.find(p => p.id === key)
  if (!part) {
    part = { id: key, text: '' }
    msg.parts.push(part)
  }
  // completed 事件返回完整内容，直接覆盖避免增量重复
  part.text = full
  syncContent(msg)
}

function collectFollowUps(msg: ChatMessage, content: string): void {
  if (!content) return
  let items: string[] = []
  try {
    const parsed: unknown = JSON.parse(content)
    if (Array.isArray(parsed)) items = parsed.map(String)
    else if (parsed && typeof parsed === 'object') {
      const obj = parsed as Record<string, unknown>
      const arr = obj.follow_up ?? obj.questions ?? obj.data
      if (Array.isArray(arr)) items = arr.map(String)
    }
  } catch {
    items = content
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(Boolean)
  }
  const cleaned = items
    .map(s => s.replace(/^["'\-•\d.\s]+/, '').replace(/["']$/, '').trim())
    .filter(Boolean)
  if (cleaned.length) msg.followUps = cleaned.slice(0, 4)
}

function handleEvent(evt: CozeStreamEvent, msg: ChatMessage): void {
  const data = evt.data || {}
  const type = String(data.type ?? '')

  switch (evt.event) {
    case 'conversation.chat.created': {
      lastConversationId = String(data.conversation_id ?? lastConversationId)
      msg.status = '对话已创建…'
      break
    }
    case 'conversation.chat.in_progress':
      msg.status = '智能体正在分析任务…'
      break
    case 'conversation.message.delta': {
      if (data.reasoning_content) msg.reasoning += String(data.reasoning_content)
      if (type === 'answer') {
        msg.status = '正在生成操作票…'
        appendAnswer(msg, String(data.id ?? ''), String(data.content ?? ''))
      } else if (type === 'function_call') {
        msg.status = `调用工具 ${String(data.name ?? '')}…`
      } else if (type === 'tool_output' || type === 'tool_response') {
        msg.status = '工具已返回结果…'
      }
      break
    }
    case 'conversation.message.completed': {
      if (type === 'answer') setAnswer(msg, String(data.id ?? ''), String(data.content ?? ''))
      else if (type === 'follow_up') collectFollowUps(msg, String(data.content ?? ''))
      break
    }
    case 'conversation.chat.failed': {
      const lastError = data.last_error as { msg?: string } | undefined
      msg.error = lastError?.msg || String(data.msg ?? '对话失败')
      break
    }
    case 'error':
      msg.error = String(data.msg ?? data.error_message ?? '流式响应错误')
      break
    default:
      break
  }
}

function displayText(msg: ChatMessage): string {
  if (msg.ticket) {
    return msg.content
      .replace(/```[ \t]*[A-Za-z]*[ \t]*\r?\n[\s\S]*?```/g, '（操作票 JSON 已解析，见下方卡片）')
      .trim()
  }
  return msg.content
}

function finalize(msg: ChatMessage): void {
  msg.streaming = false
  msg.status = ''
  if (msg.error) return

  const raw = extractTicketJson(msg.content)
  if (!raw) {
    if (msg.content.trim()) notice('info', '未在回答中检测到可载入的操作票 JSON')
    return
  }

  const preview = buildTicketPreview(raw, props.model)
  if (!preview.result.ticket) {
    notice('error', preview.result.errors[0] || '操作票解析失败')
    return
  }
  msg.ticket = { ...preview, loaded: false, message: '待载入' }
  if (config.autoLoad) applyTicket(msg)
}

function applyTicket(msg: ChatMessage): void {
  const preview = msg.ticket
  if (!preview) return
  if (!props.loadTicket) {
    preview.loaded = true
    preview.message = `已载入待执行 · 共 ${preview.total} 步`
    notice('success', preview.message)
    return
  }
  const res = props.loadTicket(preview)
  preview.loaded = res.ok
  preview.message = res.message
  notice(res.ok ? 'success' : 'warn', res.message)
}

async function send(text?: string): Promise<void> {
  const question = (text ?? input.value).trim()
  if (!question || streaming.value) return

  if (!configured.value) {
    settingsOpen.value = true
    notice('warn', '请先填写 Coze 访问令牌与智能体 ID')
    return
  }

  input.value = ''
  const userMsg = createMessage('user')
  userMsg.content = question
  userMsg.streaming = false
  const aiMsg = createMessage('assistant')
  aiMsg.status = '正在连接智能体…'
  messages.value.push(userMsg, aiMsg)
  await scrollToBottom()

  streaming.value = true
  abortCtrl = new AbortController()

  try {
    const stream = streamCozeChat({
      token: config.token.trim(),
      baseURL: config.baseURL.trim() || DEFAULT_AGENT_CONFIG.baseURL,
      botId: config.botId.trim(),
      userId: config.userId.trim() || 'anonymous',
      conversationId: lastConversationId || undefined,
      additionalMessages: [
        {
          role: 'user',
          type: 'question',
          content: buildAgentMessage(question, props.model, config.includeCatalog)
        }
      ],
      signal: abortCtrl.signal
    })

    for await (const evt of stream) {
      handleEvent(evt, aiMsg)
      scrollToBottom(false)
    }
  } catch (err) {
    const e = err as Error
    if (e.name === 'AbortError') {
      aiMsg.status = ''
      if (!aiMsg.content) aiMsg.content = '（已停止生成）'
    } else {
      aiMsg.error = e.message || '对话失败，请检查网络与配置'
    }
  } finally {
    streaming.value = false
    abortCtrl = null
    finalize(aiMsg)
    await scrollToBottom()
  }
}

function stop(): void {
  abortCtrl?.abort()
  streaming.value = false
}

function resetConfig(): void {
  Object.assign(config, DEFAULT_AGENT_CONFIG)
  notice('info', '已恢复默认配置')
}

async function scrollToBottom(smooth = true): Promise<void> {
  await nextTick()
  const el = listRef.value
  if (!el) return
  el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
}
</script>

<style lang="scss" scoped>
/* 全局样式含 `* { font-size: 1vmin }`，此处让文本元素继承父级字号 */
:where(p, span, b, i, em, strong, small, label, li, h3, h4, pre, input, textarea, button) {
  font-size: inherit;
}

.agent-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 392px;
  flex: 0 0 392px;
  height: 100%;
  padding: 14px 14px 10px;
  box-sizing: border-box;
  color: #d7e7f7;
  background: linear-gradient(180deg, rgba(15, 24, 37, 0.97) 0%, rgba(9, 15, 24, 0.99) 100%);
  border-left: 1px solid rgba(110, 165, 215, 0.18);
  box-shadow: -18px 0 44px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(14px);
  font-size: 13px;
  overflow: hidden;
}

/* -------------------------------- 头部 -------------------------------- */

.ag-header {
  flex: none;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(110, 165, 215, 0.14);
}

.ag-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ag-chip {
  flex: none;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  letter-spacing: 0.5px;
  color: #06192e;
  background: linear-gradient(135deg, #7cc4ff, #4f8dff);
  box-shadow: 0 0 14px rgba(94, 160, 255, 0.4);
}

.ag-title {
  flex: 1;
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #eaf5ff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ag-dot {
  flex: none;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ff5f6d;
  box-shadow: 0 0 8px rgba(255, 95, 109, 0.7);

  &.on {
    background: #46e08a;
    box-shadow: 0 0 8px rgba(70, 224, 138, 0.7);
  }
}

.ag-icon-btn {
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

  &:hover,
  &.active {
    color: #fff;
    border-color: rgba(150, 210, 255, 0.6);
    background: rgba(70, 120, 170, 0.55);
  }
}

/* ------------------------------ 设置面板 ------------------------------ */

.ag-settings {
  margin-top: 10px;
  padding: 10px;
  border-radius: 11px;
  border: 1px solid rgba(120, 170, 220, 0.22);
  background: rgba(18, 30, 44, 0.75);
}

.ag-field {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 7px;

  > span {
    flex: none;
    width: 62px;
    font-size: 12px;
    color: #9dc0dd;
  }

  input {
    flex: 1;
    min-width: 0;
    padding: 5px 8px;
    border-radius: 7px;
    border: 1px solid rgba(120, 170, 220, 0.25);
    background: rgba(8, 14, 22, 0.8);
    color: #eaf5ff;
    font-size: 12px;
    outline: none;

    &:focus {
      border-color: rgba(120, 190, 255, 0.7);
    }
  }
}

.ag-check {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 4px 0 0;
  font-size: 12px;
  color: #b6d4ee;
  cursor: pointer;
}

.ag-settings-actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 10px;
}

/* -------------------------------- 消息 -------------------------------- */

.ag-body {
  flex: 1;
  min-height: 0;
  margin: 0 -4px;
  padding: 10px 6px 12px;
  overflow-y: auto;
  scrollbar-width: thin;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(120, 170, 220, 0.35);
    border-radius: 3px;
  }
}

.ag-welcome {
  margin: auto 0;
  padding: 8px 6px;
  text-align: center;
}

.ag-welcome-icon {
  width: 46px;
  height: 46px;
  margin: 0 auto 10px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  color: #8fd0ff;
  background: linear-gradient(135deg, rgba(70, 130, 200, 0.35), rgba(30, 60, 100, 0.35));
  border: 1px solid rgba(120, 190, 255, 0.3);
}

.ag-welcome-title {
  margin: 0 0 6px;
  font-size: 13.5px;
  font-weight: 600;
  color: #eaf5ff;
}

.ag-welcome-sub {
  margin: 0 0 12px;
  font-size: 12px;
  line-height: 1.6;
  color: #8fb4d4;

  b {
    color: #6fe0b0;
  }
}

.ag-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.ag-chip-btn {
  padding: 6px 10px;
  border-radius: 9px;
  text-align: left;
  font-size: 12px;
  line-height: 1.4;
  color: #b6d4ee;
  background: rgba(30, 48, 68, 0.6);
  border: 1px solid rgba(120, 170, 220, 0.22);
  cursor: pointer;
  transition: all 0.18s;

  &:hover:not(:disabled) {
    color: #fff;
    border-color: rgba(140, 200, 255, 0.6);
    background: rgba(45, 72, 100, 0.75);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.ag-msg {
  display: flex;
  gap: 8px;

  &.user {
    flex-direction: row-reverse;

    .ag-col {
      align-items: flex-end;
    }

    .ag-bubble {
      color: #06192e;
      background: linear-gradient(135deg, #9fd4ff, #6ea8ff);
      border-color: transparent;
    }
  }
}

.ag-avatar {
  flex: none;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 9px;
  font-size: 11.5px;
  font-weight: 600;
  color: #cfe6ff;
  background: rgba(50, 78, 108, 0.65);
  border: 1px solid rgba(120, 170, 220, 0.25);

  &.assistant {
    color: #06192e;
    background: linear-gradient(135deg, #7cc4ff, #4f8dff);
  }
}

.ag-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.ag-bubble {
  max-width: 100%;
  padding: 9px 12px;
  border-radius: 12px;
  font-size: 12.5px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  color: #dbeafe;
  background: rgba(22, 35, 50, 0.85);
  border: 1px solid rgba(110, 165, 215, 0.16);

  &.error {
    border-color: rgba(255, 95, 109, 0.5);
    color: #ffc3c7;
  }
}

.ag-typing {
  display: inline-flex;
  gap: 4px;
  padding: 3px 0;

  i {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #7cc4ff;
    animation: ag-blink 1.2s infinite ease-in-out;

    &:nth-child(2) {
      animation-delay: 0.18s;
    }

    &:nth-child(3) {
      animation-delay: 0.36s;
    }
  }
}

@keyframes ag-blink {
  0%, 80%, 100% { opacity: 0.25; transform: translateY(0); }
  40% { opacity: 1; transform: translateY(-2px); }
}

.ag-status {
  font-size: 11.5px;
  color: #7fa8c9;
}

.ag-error {
  font-size: 11.5px;
  color: #ff9aa2;
  line-height: 1.5;
}

.ag-reasoning {
  width: 100%;
}

.ag-reasoning-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11.5px;
  color: #a9c8e4;
  background: rgba(40, 60, 82, 0.5);
  border: 1px solid rgba(120, 170, 220, 0.2);
  cursor: pointer;

  svg {
    transition: transform 0.2s;

    &.open {
      transform: rotate(90deg);
    }
  }
}

.ag-reasoning-text {
  margin: 6px 0 0;
  padding: 8px 10px;
  max-height: 190px;
  overflow-y: auto;
  border-radius: 9px;
  border-left: 2px solid rgba(140, 190, 240, 0.4);
  background: rgba(12, 20, 30, 0.7);
  font-size: 11.5px;
  line-height: 1.55;
  color: #9dc0dd;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: inherit;
}

/* ----------------------------- 操作票卡片 ----------------------------- */

.ag-ticket {
  width: 100%;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid rgba(255, 209, 102, 0.35);
  background: linear-gradient(135deg, rgba(255, 209, 102, 0.1), rgba(20, 32, 46, 0.6));
  animation: ag-ticket-in 0.32s ease;

  &.loaded {
    border-color: rgba(70, 224, 138, 0.4);
    background: linear-gradient(135deg, rgba(70, 224, 138, 0.1), rgba(20, 32, 46, 0.6));
  }
}

@keyframes ag-ticket-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ag-ticket-head {
  display: flex;
  align-items: center;
  gap: 7px;
}

.ag-ticket-badge {
  flex: none;
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 10.5px;
  color: #2a1c00;
  background: #ffd166;
}

.ag-ticket-name {
  flex: 1;
  min-width: 0;
  font-size: 12.5px;
  color: #ffe6a8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  .loaded & {
    color: #b7f5d6;
  }
}

.ag-ticket-count {
  flex: none;
  font-size: 11px;
  color: #b6d4ee;
}

.ag-ticket-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 5px;
  font-size: 11px;
  color: #8fb4d4;

  .ok {
    color: #6fe0b0;
  }

  .warn {
    color: #ffb27a;
  }
}

.ag-ticket-steps {
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
  max-height: 168px;
  overflow-y: auto;

  li {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    padding: 3px 0;
    font-size: 11.5px;
    color: #dbeafe;
    line-height: 1.45;

    &.unresolved .txt {
      color: #ffb27a;
    }

    &.more {
      color: #7fa8c9;
      justify-content: center;
    }
  }

  .seq {
    flex: none;
    width: 16px;
    height: 16px;
    display: grid;
    place-items: center;
    border-radius: 5px;
    font-size: 10px;
    color: #b6d4ee;
    background: rgba(70, 110, 150, 0.35);
  }

  .txt {
    flex: 1;
    min-width: 0;
  }

  .act {
    flex: none;
    width: 16px;
    height: 16px;
    display: grid;
    place-items: center;
    border-radius: 4px;
    font-size: 10px;

    &.open {
      color: #2a0a0e;
      background: #ff7a85;
    }

    &.close {
      color: #04231a;
      background: #46e08a;
    }
  }
}

.ag-ticket-foot {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 9px;
}

.ag-ticket-msg {
  flex: 1;
  min-width: 0;
  font-size: 11px;
  color: #ffd166;

  &.ok {
    color: #6fe0b0;
  }
}

/* -------------------------------- 提示 -------------------------------- */

.ag-notice {
  align-self: center;
  max-width: 100%;
  padding: 7px 12px;
  border-radius: 10px;
  font-size: 11.5px;
  text-align: center;
  color: #dbeafe;
  background: rgba(12, 20, 30, 0.94);
  border: 1px solid rgba(110, 165, 215, 0.3);

  &.success {
    border-color: rgba(70, 224, 138, 0.5);
    color: #b7f5d6;
  }

  &.warn {
    border-color: rgba(255, 209, 102, 0.55);
    color: #ffe6a8;
  }

  &.error {
    border-color: rgba(255, 95, 109, 0.55);
    color: #ffc3c7;
  }
}

/* -------------------------------- 输入 -------------------------------- */

.ag-footer {
  flex: none;
  padding-top: 10px;
  border-top: 1px solid rgba(110, 165, 215, 0.14);
}

.ag-input {
  width: 100%;
  box-sizing: border-box;
  padding: 9px 11px;
  border-radius: 11px;
  border: 1px solid rgba(120, 170, 220, 0.25);
  background: rgba(8, 14, 22, 0.85);
  color: #eaf5ff;
  font-size: 12.5px;
  line-height: 1.55;
  resize: none;
  outline: none;
  font-family: inherit;
  transition: border-color 0.18s;

  &::placeholder {
    color: #5f83a2;
  }

  &:focus {
    border-color: rgba(120, 190, 255, 0.7);
  }

  &:disabled {
    opacity: 0.6;
  }
}

.ag-footer-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 8px;
}

.ag-hint {
  font-size: 11px;
  color: #5f83a2;
}

/* -------------------------------- 按钮 -------------------------------- */

.ag-btn {
  padding: 7px 16px;
  border-radius: 9px;
  font-size: 12.5px;
  font-weight: 600;
  color: #cfe6ff;
  background: rgba(40, 60, 82, 0.6);
  border: 1px solid rgba(120, 170, 220, 0.25);
  cursor: pointer;
  transition: all 0.18s;

  &:hover:not(:disabled) {
    border-color: rgba(150, 210, 255, 0.65);
    background: rgba(60, 95, 135, 0.7);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &.primary {
    color: #06192e;
    border-color: transparent;
    background: linear-gradient(135deg, #9fd4ff, #5c97ff);

    &:hover:not(:disabled) {
      box-shadow: 0 8px 22px rgba(90, 150, 255, 0.3);
    }
  }

  &.danger {
    color: #fff;
    border-color: rgba(255, 120, 130, 0.5);
    background: linear-gradient(135deg, rgba(255, 95, 109, 0.9), rgba(200, 60, 80, 0.9));
  }

  &.ghost {
    background: transparent;
  }

  &.small {
    padding: 4px 11px;
    font-size: 11.5px;
    border-radius: 8px;
  }
}

/* ------------------------------ 过渡动画 ------------------------------ */

.ag-collapse-enter-active,
.ag-collapse-leave-active {
  overflow: hidden;
  transition: opacity 0.2s ease, max-height 0.26s ease, margin-top 0.26s ease;
  max-height: 320px;
}

.ag-collapse-enter-from,
.ag-collapse-leave-to {
  opacity: 0;
  max-height: 0;
  margin-top: 0;
}

.ag-fade-enter-active,
.ag-fade-leave-active {
  transition: opacity 0.24s ease;
}

.ag-fade-enter-from,
.ag-fade-leave-to {
  opacity: 0;
}
</style>
