/* =============================================================================
 *  智能体开票 · 提示词组装 / 回答解析
 *  · buildAgentMessage：把「本站设备清单 + 输出格式」拼进用户提问，提升开票准确率
 *  · extractTicketJson：从大模型回答（含 ```json 代码块 / 纯文本）中提取操作票 JSON
 *  · buildTicketPreview：结合接线图模型给出设备命中情况预览
 * ========================================================================== */

import type { StationModel } from './station'
import { parseTicket, type OperationTicket, type ParseResult } from './ticket'

const ROLE_CN: Record<string, string> = {
  breaker: '断路器',
  disconnector: '刀闸/隔离开关',
  ground: '接地刀闸'
}

/** 生成紧凑的设备清单（编号 | 名称 | 类型） */
export function buildDeviceCatalog(model: StationModel): string {
  return model.devices
    .map(d => `${d.id} | ${d.label} | ${ROLE_CN[d.role] ?? d.role}`)
    .join('\n')
}

/**
 * 组装发送给智能体的提问内容。
 * includeCatalog 为 true 时附带设备清单，要求其直接输出可被本系统解析的 JSON。
 */
export function buildAgentMessage(
  question: string,
  model: StationModel,
  includeCatalog = true
): string {
  if (!includeCatalog) return question

  return [
    '你是变电站倒闸操作票生成智能体。请严格依据下方设备清单生成规范的操作票。',
    '',
    '【输出格式】只输出一个 ```json 代码块，不要输出其他解释性文字。JSON 结构如下：',
    '{"ticketNo":"票号","title":"任务名称","station":"示范变电站","operator":"","guardian":"",' +
      '"steps":[{"seq":1,"text":"拉开 220kV 出线 2 断路器","device":"设备编号","action":"open"}]}',
    '· action：open = 分闸/拉开，close = 合闸/合上；',
    '· device：必须使用设备清单第一列的「编号」；',
    '· 步骤顺序遵循倒闸操作原则：停电时先拉断路器→再拉（线路侧）刀闸→最后合接地刀闸；送电顺序相反；',
    '· text 使用标准调度术语，seq 从 1 开始连续编号。',
    '',
    '【设备清单】编号 | 名称 | 类型',
    buildDeviceCatalog(model),
    '',
    `【用户任务】${question}`
  ].join('\n')
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === 'object' && !Array.isArray(v)
}

/** 兼容 { steps: [...] } 与 { data: { steps: [...] } } 两种返回结构 */
function unwrapTicket(raw: unknown): Record<string, unknown> | null {
  if (!isRecord(raw)) return null
  if (Array.isArray(raw.steps)) return raw
  const data = raw.data
  if (isRecord(data) && Array.isArray(data.steps)) return data
  return null
}

function tryParse(text: string): Record<string, unknown> | null {
  const trimmed = text.trim()
  if (!trimmed) return null
  try {
    return unwrapTicket(JSON.parse(trimmed))
  } catch {
    return null
  }
}

/** 扫描文本中所有「大括号平衡」的片段并尝试解析（忽略字符串内的括号） */
function scanBalancedObjects(text: string): Record<string, unknown>[] {
  const found: Record<string, unknown>[] = []
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== '{') continue
    let depth = 0
    let inString = false
    let escaped = false
    for (let j = i; j < text.length; j++) {
      const ch = text[j]
      if (inString) {
        if (escaped) escaped = false
        else if (ch === '\\') escaped = true
        else if (ch === '"') inString = false
        continue
      }
      if (ch === '"') inString = true
      else if (ch === '{') depth++
      else if (ch === '}') {
        depth--
        if (depth === 0) {
          const parsed = tryParse(text.slice(i, j + 1))
          if (parsed) found.push(parsed)
          i = j
          break
        }
      }
    }
  }
  return found
}

/**
 * 从智能体回答中提取操作票 JSON。
 * 依次尝试：```json 代码块 → 其它代码块 → 全文直解 → 全文括号扫描。
 */
export function extractTicketJson(text: string): Record<string, unknown> | null {
  if (!text) return null

  const fenced: string[] = []
  const re = /```[ \t]*[A-Za-z]*[ \t]*\r?\n([\s\S]*?)```/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) fenced.push(m[1])

  for (const block of fenced) {
    const direct = tryParse(block)
    if (direct) return direct
    const scanned = scanBalancedObjects(block)
    if (scanned.length) return scanned[0]
  }

  const directAll = tryParse(text)
  if (directAll) return directAll

  const scannedAll = scanBalancedObjects(text)
  return scannedAll.length ? scannedAll[0] : null
}

/* --------------------------- 预览（结合接线图） --------------------------- */

export interface TicketPreviewStep {
  seq: number
  text: string
  deviceLabel: string
  action: 'open' | 'close'
  resolved: boolean
}

export interface TicketPreview {
  raw: Record<string, unknown>
  result: ParseResult
  title: string
  ticketNo: string
  total: number
  unresolved: number
  steps: TicketPreviewStep[]
}

export function buildTicketPreview(
  raw: Record<string, unknown>,
  model: StationModel
): TicketPreview {
  const result = parseTicket(raw, model, 'AI 智能体')
  const ticket: OperationTicket | null = result.ticket
  const steps: TicketPreviewStep[] = ticket
    ? ticket.steps.map(s => ({
        seq: s.seq,
        text: s.text,
        deviceLabel: s.deviceLabel || s.deviceId || '未识别设备',
        action: s.action,
        resolved: Boolean(s.deviceId)
      }))
    : []

  return {
    raw,
    result,
    title: ticket?.meta.title || String(raw.title ?? 'AI 生成操作票'),
    ticketNo: ticket?.meta.ticketNo || String(raw.ticketNo ?? ''),
    total: ticket ? ticket.steps.length : 0,
    unresolved: steps.filter(s => !s.resolved).length,
    steps
  }
}