/* =============================================================================
 *  操作票（Operation Ticket）
 *  · JSON 解析与容错（字段别名、中文动作词、序号缺失自动补全）
 *  · 设备标识解析（编号 / 中文名 / 别名 / 模糊匹配）
 *  · 简易“五防”校核（带电合地刀、带地线合闸、带负荷拉刀闸…）
 *  · 执行记录导出
 * ========================================================================== */

import type { DeviceDef, DeviceRole, StationModel } from './station'
import { resolveDevice } from './station'

export type StepAction = 'open' | 'close'
export type StepStatus = 'pending' | 'active' | 'done' | 'skipped' | 'error'

export interface TicketStep {
  index: number
  seq: number
  /** 调度术语原文 */
  text: string
  /** 解析到的设备编号（未解析成功为空） */
  deviceId: string
  deviceLabel: string
  role: DeviceRole | ''
  action: StepAction
  actionLabel: string
  note: string
  /** 校验结论 */
  check: { level: 'ok' | 'warn' | 'error'; message: string } | null
  status: StepStatus
  message: string
  executedAt: string
  before: boolean | null
  after: boolean | null
  raw: Record<string, unknown>
}

export interface TicketMeta {
  ticketNo: string
  title: string
  station: string
  operator: string
  guardian: string
  createdAt: string
  remark: string
}

export interface OperationTicket {
  meta: TicketMeta
  steps: TicketStep[]
  warnings: string[]
  source: string
}

export interface ParseResult {
  ticket: OperationTicket | null
  errors: string[]
}

const ACTION_LABEL: Record<StepAction, string> = { open: '分闸', close: '合闸' }
const ROLE_LABEL: Record<DeviceRole, string> = {
  breaker: '断路器',
  disconnector: '刀闸',
  ground: '接地刀闸'
}

const OPEN_WORDS = ['拉开', '断开', '分闸', '分开', '切除', '停用', '退出', 'open', 'off', '分']
const CLOSE_WORDS = ['合上', '合闸', '闭合', '推上', '投入', '送电', '启用', 'close', 'on', '合']

function pick(obj: Record<string, unknown>, keys: string[]): unknown {
  for (const k of keys) {
    const v = obj[k]
    if (v !== undefined && v !== null && v !== '') return v
  }
  return undefined
}

function str(v: unknown): string {
  return v === undefined || v === null ? '' : String(v).trim()
}

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {}
}

/** 归一化动作词 */
export function normalizeAction(raw: unknown, text: string): StepAction | null {
  const s = str(raw).toLowerCase().replace(/[\s_\-]/g, '')
  if (s) {
    if (['open', 'off', 'break', 'disconnect', '0', 'false', 'no'].includes(s)) return 'open'
    if (['close', 'on', 'connect', '1', 'true', 'yes'].includes(s)) return 'close'
    if (s.includes('分') || s.includes('拉') || s.includes('断') || s.includes('退')) return 'open'
    if (s.includes('合') || s.includes('投') || s.includes('送')) return 'close'
  }
  // 从操作术语文本中推断
  const t = text.toLowerCase()
  for (const w of OPEN_WORDS) if (t.includes(w)) return 'open'
  for (const w of CLOSE_WORDS) if (t.includes(w)) return 'close'
  return null
}

/** 从文本推断设备名（去掉动作词之后的部分） */
function guessDeviceFromText(text: string): string {
  let t = text
  for (const w of [...OPEN_WORDS, ...CLOSE_WORDS]) {
    const i = t.indexOf(w)
    if (i >= 0) { t = t.slice(i + w.length); break }
  }
  return t.replace(/^[的：:\s]+/, '').trim()
}

export function parseTicket(raw: unknown, model: StationModel, source = 'ticket.json'): ParseResult {
  const errors: string[] = []
  const warnings: string[] = []

  const root = asRecord(raw)
  if (!root || Object.keys(root).length === 0) {
    return { ticket: null, errors: ['文件内容不是合法的 JSON 对象'] }
  }

  const metaSrc = { ...root, ...asRecord(pick(root, ['meta', 'info', 'header', 'ticketInfo'])) }
  const stepsRaw = pick(root, ['steps', 'items', 'operations', 'tasks', 'list', 'stepList'])
  const stepsArr = Array.isArray(stepsRaw)
    ? stepsRaw
    : Array.isArray(asRecord(root.data).steps)
      ? (asRecord(root.data).steps as unknown[])
      : null

  if (!stepsArr || stepsArr.length === 0) {
    return { ticket: null, errors: ['未找到操作步骤数组，请使用 steps / items / operations 字段承载步骤列表'] }
  }

  const steps: TicketStep[] = []

  stepsArr.forEach((item, i) => {
    const src = asRecord(item)
    // 纯字符串步骤也支持： "拉开 220kV 出线 1 断路器"
    const text0 = typeof item === 'string'
      ? item
      : str(pick(src, ['text', 'desc', 'description', 'content', 'name', 'title', 'item', 'operation', 'step']))

    const deviceToken = typeof item === 'string'
      ? guessDeviceFromText(text0)
      : str(pick(src, ['device', 'deviceId', 'deviceKey', 'target', 'equipment', 'equipmentId', 'tag', 'obj', 'object']))

    const device = deviceToken ? resolveDevice(model, deviceToken) : null
    const action = normalizeAction(
      typeof item === 'string' ? undefined : pick(src, ['action', 'op', 'operate', 'operationType', 'state', 'type']),
      text0
    )

    const seqRaw = typeof item === 'string' ? undefined : pick(src, ['seq', 'no', 'number', 'index', 'order', 'id'])
    const seqNum = Number(seqRaw)

    const step: TicketStep = {
      index: i,
      seq: Number.isFinite(seqNum) && seqNum > 0 ? seqNum : i + 1,
      text: text0 || (device ? `${action === 'close' ? '合上' : '拉开'} ${device.label}` : `第 ${i + 1} 步`),
      deviceId: device ? device.id : '',
      deviceLabel: device ? device.label : (deviceToken || '未指定设备'),
      role: device ? device.role : '',
      action: action ?? 'open',
      actionLabel: action ? ACTION_LABEL[action] : '未识别',
      note: typeof item === 'string' ? '' : str(pick(src, ['note', 'remark', 'memo', 'comment'])),
      check: null,
      status: 'pending',
      message: '',
      executedAt: '',
      before: null,
      after: null,
      raw: src
    }

    if (!device) {
      step.status = 'error'
      step.message = deviceToken
        ? `无法在接线图中定位设备「${deviceToken}」`
        : '缺少设备标识（device 字段）'
      errors.push(`第 ${step.seq} 步：${step.message}`)
    }
    if (!action) {
      step.status = 'error'
      step.message = '无法识别操作类型（请在 action 中填写 open/close 或 分/合）'
      errors.push(`第 ${step.seq} 步：${step.message}`)
    }
    steps.push(step)
  })

  const ticket: OperationTicket = {
    meta: {
      ticketNo: str(pick(metaSrc, ['ticketNo', 'no', 'number', 'code', 'id'])) || '未编号',
      title: str(pick(metaSrc, ['title', 'name', 'task', 'subject'])) || '操作票',
      station: str(pick(metaSrc, ['station', 'stationName', 'substation'])) || '示范变电站',
      operator: str(pick(metaSrc, ['operator', 'oper', 'worker'])) || '',
      guardian: str(pick(metaSrc, ['guardian', 'supervisor', 'watch'])) || '',
      createdAt: str(pick(metaSrc, ['createdAt', 'date', 'time', 'createTime'])) || new Date().toISOString(),
      remark: str(pick(metaSrc, ['remark', 'note', 'memo', 'description']))
    },
    steps,
    warnings,
    source
  }

  if (errors.length === 0 && steps.length > 40) {
    warnings.push(`本次操作票共 ${steps.length} 步，步骤较多，建议使用“自动演示”模式`)
  }

  return { ticket, errors }
}

/* ============================== 五防简易校核 ============================== */

export interface CheckResult {
  level: 'ok' | 'warn' | 'error'
  message: string
}

function baySiblings(model: StationModel, device: DeviceDef): DeviceDef[] {
  return model.devices.filter(d => d.bayId === device.bayId && d.id !== device.id)
}

/**
 * 操作前校核（在设备状态尚未改变时调用）
 * 返回 error 级别时默认拦截，用户可强制继续（培训 / 演示场景）。
 */
export function checkStep(
  step: TicketStep,
  model: StationModel,
  isEnergized: (node: string) => boolean
): CheckResult {
  const device = model.deviceMap.get(step.deviceId)
  if (!device) return { level: 'error', message: '设备不存在' }

  const current = device.get()
  const target = step.action === 'close'

  if (current === target) {
    return { level: 'warn', message: `${device.label} 已处于${target ? '合闸' : '分闸'}位置，无需重复操作` }
  }

  const siblings = baySiblings(model, device)
  const groundClosed = siblings.some(d => d.role === 'ground' && d.get())
  const breaker = siblings.find(d => d.role === 'breaker')

  // 1. 带接地线（接地刀闸在合位）合闸
  if (target && device.role !== 'ground' && groundClosed) {
    return { level: 'error', message: `接地刀闸在合位，禁止合上 ${device.label}（带接地线合闸）` }
  }

  // 2. 带电合接地刀闸
  if (target && device.role === 'ground' && isEnergized(device.nodeA)) {
    return { level: 'error', message: `${device.label} 线路侧带电，禁止合接地刀闸` }
  }

  // 3. 带负荷拉合刀闸：间隔断路器在合位时禁止操作刀闸（先拉断路器，后拉刀闸）
  if (!target && device.role === 'disconnector' && current && breaker && breaker.get()) {
    return { level: 'error', message: `间隔断路器在合位，禁止直接拉开 ${device.label}，请先拉开断路器` }
  }

  // 4. 送电前确认断路器在分位
  if (target && device.role === 'disconnector' && breaker && breaker.get()) {
    return { level: 'warn', message: `间隔断路器在合位，合刀闸前请确认操作顺序（${ROLE_LABEL[device.role]}操作）` }
  }

  return { level: 'ok', message: '' }
}

/* ============================== 执行记录导出 ============================== */

export function buildRecord(ticket: OperationTicket, stationLabel: string): Record<string, unknown> {
  const done = ticket.steps.filter(s => s.status === 'done').length
  const skipped = ticket.steps.filter(s => s.status === 'skipped').length
  return {
    ticketNo: ticket.meta.ticketNo,
    title: ticket.meta.title,
    station: stationLabel,
    operator: ticket.meta.operator,
    guardian: ticket.meta.guardian,
    exportedAt: new Date().toISOString(),
    summary: { total: ticket.steps.length, done, skipped, pending: ticket.steps.length - done - skipped },
    steps: ticket.steps.map(s => ({
      seq: s.seq,
      text: s.text,
      device: s.deviceId,
      deviceName: s.deviceLabel,
      action: s.action,
      status: s.status,
      result: s.message || (s.status === 'done' ? '执行成功' : ''),
      executedAt: s.executedAt,
      before: s.before,
      after: s.after
    }))
  }
}

export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/* ================================ 示例票 ================================= */

export function createSampleTicket(): Record<string, unknown> {
  return {
    ticketNo: 'DD2024-0521-001',
    title: '220kV 出线 3、出线 4 由运行转检修',
    station: '示范变电站',
    operator: '张三',
    guardian: '李四',
    createdAt: '2024-05-21T08:30:00+08:00',
    remark: '示例操作票：上传后按步骤在接线图上点击对应设备即可完成执行可视化。',
    steps: [
      { seq: 1, text: '拉开 220kV 出线 3 断路器', device: 'b220_2-qf', action: 'open', note: '检查断路器确在分位' },
      { seq: 2, text: '拉开 220kV 出线 3 正母刀闸', device: 'b220_2-zm', action: 'open' },
      { seq: 3, text: '拉开 220kV 出线 3 副母刀闸', device: 'b220_2-fm', action: 'open' },
      { seq: 4, text: '合上 220kV 出线 3 接地刀闸', device: 'b220_2-gnd', action: 'close', note: '验明无电压后装设接地' },
      { seq: 5, text: '拉开 220kV 出线 4 断路器', device: 'b220_4-qf', action: 'open' },
      { seq: 6, text: '拉开 220kV 出线 4 正母刀闸', device: 'b220_4-zm', action: 'open' },
      { seq: 7, text: '拉开 220kV 出线 4 副母刀闸', device: 'b220_4-fm', action: 'open' },
      { seq: 8, text: '合上 220kV 出线 4 接地刀闸', device: 'b220_4-gnd', action: 'close' }
    ]
  }
}

/** 供“字段说明”面板展示 */
export const TICKET_SCHEMA_HINT = `{
  "ticketNo": "编号", "title": "任务名", "station": "站名",
  "operator": "操作人", "guardian": "监护人",
  "steps": [
    { "seq": 1, "text": "拉开 220kV 出线 1 断路器",
      "device": "b220_0-qf", "action": "open", "note": "备注" }
  ]
}
· device 支持设备编号、中文全称或别名；action 支持 open/close、分/合。`
