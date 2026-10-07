/**
 * Coze 智能体对话 · 流式（SSE）客户端
 * ---------------------------------------------------------------------------
 * 与官方 SDK `@coze/api` 的 `chat.stream` 行为保持一致，但**零依赖**实现，
 * 便于在无法安装 npm 包的环境中直接运行。
 *
 * 官方 SDK 等价写法（若已 `npm i @coze/api`，可直接替换本文件实现）：
 *   import { CozeAPI } from '@coze/api'
 *   const apiClient = new CozeAPI({ token, baseURL: 'https://api.coze.cn' })
 *   const res = await apiClient.chat.stream({
 *     bot_id: '7693335830416769024',
 *     user_id: '123456789',
 *     additional_messages: [
 *       { content_type: 'text', role: 'user', type: 'question', content: '...' }
 *     ]
 *   })
 *   for await (const { event, data } of res) { ... }   // 事件结构与下方完全一致
 *
 * 说明：Token 直接放在浏览器端仅适用于内网 / 演示环境，生产环境建议由后端
 * 代理转发，避免令牌泄露。
 * ---------------------------------------------------------------------------
 */

export const COZE_DEFAULT_BASE_URL = 'https://api.coze.cn'

export type CozeMessageRole = 'user' | 'assistant'
export type CozeMessageType =
  | 'question'
  | 'answer'
  | 'function_call'
  | 'tool_output'
  | 'tool_response'

export interface CozeMessageInput {
  role: CozeMessageRole
  content: string
  content_type?: 'text' | 'object_string'
  type?: CozeMessageType
}

export interface CozeChatStreamOptions {
  token: string
  baseURL?: string
  botId: string
  userId: string
  /** 续聊时传入上一次的会话 ID */
  conversationId?: string
  additionalMessages: CozeMessageInput[]
  /** 是否携带历史（默认 true） */
  autoSaveHistory?: boolean
  signal?: AbortSignal
}

/** 流式事件：与 Coze v3 `chat.stream` 返回结构一致 */
export interface CozeStreamEvent {
  /** conversation.chat.created / conversation.message.delta / done ... */
  event: string
  data: Record<string, unknown>
}

export class CozeApiError extends Error {
  code: number
  constructor(message: string, code = -1) {
    super(message)
    this.name = 'CozeApiError'
    this.code = code
  }
}

/** 将入参消息规范化为 Coze 需要的结构 */
export function normalizeMessages(
  messages: CozeMessageInput[]
): Record<string, unknown>[] {
  return messages.map(m => ({
    role: m.role,
    type: m.type ?? (m.role === 'user' ? 'question' : 'answer'),
    content_type: m.content_type ?? 'text',
    content: m.content
  }))
}

/** 解析单个 SSE 数据块（event: / data: 多行） */
function parseSseBlock(block: string): CozeStreamEvent | null {
  let event = ''
  const dataLines: string[] = []

  for (const line of block.split(/\r?\n/)) {
    if (!line || line.startsWith(':')) continue
    const colon = line.indexOf(':')
    const field = colon >= 0 ? line.slice(0, colon) : line
    let value = colon >= 0 ? line.slice(colon + 1) : ''
    if (value.startsWith(' ')) value = value.slice(1)
    if (field === 'event') event = value
    else if (field === 'data') dataLines.push(value)
  }

  if (!dataLines.length) return null
  const payload = dataLines.join('\n').trim()
  if (!payload || payload === '[DONE]') return { event: event || 'done', data: {} }

  let data: Record<string, unknown>
  try {
    const parsed: unknown = JSON.parse(payload)
    data = parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : { value: parsed }
  } catch {
    return { event: event || 'message', data: { raw: payload } }
  }

  // Coze 会把事件名同时放进 data.event，优先使用 SSE 事件名
  return { event: event || String(data.event ?? 'message'), data }
}

/** 从缓冲区中切出完整 SSE 块，返回 [块列表, 剩余缓冲] */
function splitBlocks(buffer: string): [string[], string] {
  const blocks: string[] = []
  let rest = buffer
  const sep = /\r?\n\r?\n/
  let m: RegExpExecArray | null
  while ((m = sep.exec(rest))) {
    blocks.push(rest.slice(0, m.index))
    rest = rest.slice(m.index + m[0].length)
  }
  return [blocks, rest]
}

/**
 * 发起一次流式对话，逐事件 yield。
 *
 * @example
 * for await (const evt of streamCozeChat({ ... })) {
 *   if (evt.event === 'conversation.message.delta') console.log(evt.data.content)
 * }
 */
export async function* streamCozeChat(
  options: CozeChatStreamOptions
): AsyncGenerator<CozeStreamEvent, void, unknown> {
  const base = (options.baseURL || COZE_DEFAULT_BASE_URL).replace(/\/+$/, '')
  const query = new URLSearchParams()
  if (options.conversationId) query.set('conversation_id', options.conversationId)
  const url = `${base}/v3/chat${query.toString() ? `?${query.toString()}` : ''}`

  const body = {
    bot_id: options.botId,
    user_id: options.userId,
    stream: true,
    auto_save_history: options.autoSaveHistory ?? true,
    additional_messages: normalizeMessages(options.additionalMessages)
  }

  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${options.token}`,
        'Content-Type': 'application/json',
        Accept: 'text/event-stream'
      },
      body: JSON.stringify(body),
      signal: options.signal
    })
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err
    throw new CozeApiError(`无法连接 Coze 服务：${(err as Error).message}`)
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    let msg = `请求失败（HTTP ${res.status}）`
    let code = res.status
    try {
      const parsed = JSON.parse(text) as { code?: number; msg?: string; error_message?: string }
      if (parsed?.msg) msg = parsed.msg
      else if (parsed?.error_message) msg = parsed.error_message
      if (typeof parsed?.code === 'number') code = parsed.code
    } catch {
      if (text) msg = `${msg}：${text.slice(0, 200)}`
    }
    throw new CozeApiError(msg, code)
  }

  if (!res.body) throw new CozeApiError('当前环境不支持流式读取（ReadableStream 不可用）')

  const reader = res.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''

  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      const [blocks, rest] = splitBlocks(buffer)
      buffer = rest
      for (const block of blocks) {
        const evt = parseSseBlock(block)
        if (evt) yield evt
      }
    }
    // 处理结尾未以空行结束的残余块
    const tail = parseSseBlock(buffer)
    if (tail) yield tail
  } finally {
    reader.releaseLock?.()
  }
}