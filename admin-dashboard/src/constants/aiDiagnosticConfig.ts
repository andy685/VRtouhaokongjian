/**
 * AI 店铺经营诊断 - 可配置项共享模块
 * 平台端「AI 诊断报告配置」写入，商家端「AI 店铺经营诊断」读取。
 * 演示环境使用 localStorage 存储；接入后端后由接口提供，读写函数保持签名不变。
 */

export interface DiagnosticDimension {
  key: string
  label: string
  /** 权重百分比 0~100，加权模式下合计须为 100 */
  weight: number
  /** 数据来源说明：展示给商家，并作为 AI 生成报告时的口径约束 */
  desc?: string
}

export interface SupplementQuestion {
  id: number
  title: string
  placeholder: string
  required: boolean
}

export type DiagnosticScoreMode = 'average' | 'weighted'

const DIMENSIONS_KEY = 'aiDiagnosticDimensions'
const QUESTIONS_KEY = 'aiDiagnosticSupplementQuestions'
const SCORE_MODE_KEY = 'aiDiagnosticScoreMode'

export const MAX_DIMENSIONS = 8
export const MIN_DIMENSIONS = 2
export const MAX_QUESTIONS = 6
export const MIN_QUESTIONS = 2

export const DEFAULT_DIAGNOSTIC_DIMENSIONS: DiagnosticDimension[] = [
  { key: 'revenue', label: '营收增长力', weight: 30, desc: '数据来源：营收环比、客单价环比、同类门店营收表现（相对同城同店型中位数）。门店自设目标不参与评分，目标完成率仅作展示。' },
  { key: 'traffic', label: '客流活跃度', weight: 18, desc: '数据来源：日均订单（基准取本店近 3 个完整周期）、高峰/非高峰订单转化率（高峰时段由门店配置）。' },
  { key: 'member', label: '会员质量', weight: 24, desc: '数据来源：90 天复购率、储值转化率、30 天沉睡会员占比（会员数据、90 天消费滚动快照）。' },
  { key: 'content', label: '内容吸引力', weight: 12, desc: '数据来源：TOP 游戏订单占比、尾部内容订单占比、内容完成率（游戏启动/完成/中断事件与订单归因）。' },
  { key: 'operation', label: '运营执行力', weight: 16, desc: '数据来源：上期行动计划完成率、活动转化率、数据完整率。' },
]

export const DEFAULT_SUPPLEMENT_QUESTIONS: SupplementQuestion[] = [
  { id: 1, title: '本月是否有活动、装修或营业时间调整？', placeholder: '例如：暑期亲子活动延长至 22:00', required: false },
  { id: 2, title: '是否发生设备故障、人员变化或外部客流影响？', placeholder: '例如：两台头显维修三天，附近商场举办活动', required: false },
  { id: 3, title: '你希望优先改善什么经营问题？', placeholder: '例如：提升工作日晚间转化或会员复购', required: false },
]

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore */
  }
}

export function loadDiagnosticDimensions(): DiagnosticDimension[] {
  /* 维度结构以代码内置定义为准（结构锁定，五维，不含设备效率）；已保存的配置仅覆盖
     名称、权重与说明，历史遗留的结构性增删（含已移除的设备效率）自动失效。 */
  const saved = readJSON<DiagnosticDimension[]>(DIMENSIONS_KEY, [])
  const savedMap = new Map((Array.isArray(saved) ? saved : []).map((item) => [String(item.key), item]))
  return DEFAULT_DIAGNOSTIC_DIMENSIONS.map((def) => {
    const item = savedMap.get(def.key)
    const weight = item ? Math.min(100, Math.max(0, Number(item.weight))) : NaN
    return {
      key: def.key,
      label: item && String(item.label || '').trim() ? String(item.label) : def.label,
      weight: Number.isFinite(weight) ? weight : def.weight,
      desc: item && item.desc ? String(item.desc) : def.desc,
    }
  })
}

export function saveDiagnosticDimensions(list: DiagnosticDimension[]) {
  writeJSON(DIMENSIONS_KEY, list)
}

export function loadSupplementQuestions(): SupplementQuestion[] {
  const list = readJSON<SupplementQuestion[]>(QUESTIONS_KEY, [])
  if (!Array.isArray(list) || !list.length) {
    return DEFAULT_SUPPLEMENT_QUESTIONS.map((item) => ({ ...item }))
  }
  return list.slice(0, MAX_QUESTIONS).map((item, index) => ({
    id: Number(item.id) || index + 1,
    title: String(item.title || ''),
    placeholder: String(item.placeholder || ''),
    required: Boolean(item.required),
  }))
}

export function saveSupplementQuestions(list: SupplementQuestion[]) {
  writeJSON(QUESTIONS_KEY, list)
}

export function loadDiagnosticScoreMode(): DiagnosticScoreMode {
  return readJSON<DiagnosticScoreMode>(SCORE_MODE_KEY, 'weighted')
}

export function saveDiagnosticScoreMode(mode: DiagnosticScoreMode) {
  writeJSON(SCORE_MODE_KEY, mode)
}
