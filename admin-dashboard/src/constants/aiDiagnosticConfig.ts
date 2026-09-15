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
  { key: 'revenue', label: '营收增长力', weight: 20, desc: '数据来源：月度营收环比、客单价变化、营收目标完成率（历史营收统计）。' },
  { key: 'traffic', label: '客流活跃度', weight: 18, desc: '数据来源：订单数、到店客次、工作日/周末转化差异（订单查询、销售日报）。' },
  { key: 'member', label: '会员质量', weight: 16, desc: '数据来源：新增会员、30 天复购率、储值消耗、沉睡会员占比（会员数据、储值变更）。' },
  { key: 'device', label: '设备效率', weight: 16, desc: '数据来源：设备可用率、故障时长、高峰可用设备率、单机产出（设备数据、故障记录）。' },
  { key: 'content', label: '内容吸引力', weight: 15, desc: '数据来源：点播次数、游戏点播分布、尾部内容占比（点播数据、内容消耗明细）。' },
  { key: 'operation', label: '运营执行力', weight: 15, desc: '数据来源：上月行动计划完成率、巡检/交接班执行记录（运营数据）。' },
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
  const list = readJSON<DiagnosticDimension[]>(DIMENSIONS_KEY, [])
  if (!Array.isArray(list) || !list.length) {
    return DEFAULT_DIAGNOSTIC_DIMENSIONS.map((item) => ({ ...item }))
  }
  return list.slice(0, MAX_DIMENSIONS).map((item, index) => ({
    key: String(item.key || 'dim-' + index),
    label: String(item.label || ''),
    weight: Math.min(100, Math.max(0, Number(item.weight) || 0)),
    desc: item.desc ? String(item.desc) : '',
  }))
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
