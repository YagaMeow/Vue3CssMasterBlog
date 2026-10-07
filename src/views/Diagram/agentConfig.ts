/* =============================================================================
 *  智能体开票 · 配置
 *  · 默认值内置，可在界面「设置」中修改并持久化到 localStorage
 *  · 生产环境建议改为后端代理，避免令牌暴露在前端
 * ========================================================================== */

export interface AgentConfig {
  /** Coze 访问令牌 */
  token: string
  /** 接口地址 */
  baseURL: string
  /** 智能体 ID */
  botId: string
  /** 用户标识 */
  userId: string
  /** 提问时是否附带本站设备清单（强烈建议开启，可显著提升 device 命中率） */
  includeCatalog: boolean
  /** 解析到操作票后是否自动载入「待执行」 */
  autoLoad: boolean
}

export const AGENT_CONFIG_KEY = 'diagram-agent-config'

export const DEFAULT_AGENT_CONFIG: AgentConfig = {
  token:
    'pat_N9SgiIlrl6KTcmcELvdiH7r5QiZohxhGtlYWXd0oeHMNjHTlk7LrdQXOqlIJ4IMU',
  baseURL: 'https://api.coze.cn',
  botId: '7693335830416769024',
  userId: '123456789',
  includeCatalog: true,
  autoLoad: true
}

export function loadAgentConfig(): AgentConfig {
  const base = { ...DEFAULT_AGENT_CONFIG }
  try {
    const raw = localStorage.getItem(AGENT_CONFIG_KEY)
    if (!raw) return base
    const saved = JSON.parse(raw) as Partial<AgentConfig>
    return {
      ...base,
      ...saved,
      includeCatalog: saved.includeCatalog ?? base.includeCatalog,
      autoLoad: saved.autoLoad ?? base.autoLoad
    }
  } catch {
    return base
  }
}

export function saveAgentConfig(config: AgentConfig): void {
  try {
    localStorage.setItem(AGENT_CONFIG_KEY, JSON.stringify(config))
  } catch {
    /* localStorage 不可用时静默降级 */
  }
}

export function isAgentConfigured(config: AgentConfig): boolean {
  return Boolean(config.token.trim() && config.botId.trim())
}
