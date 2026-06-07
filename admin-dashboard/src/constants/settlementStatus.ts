/**
 * 统一结算/分账状态枚举
 * 依据：分账与对账说明.md 第11章 状态机
 *
 * 后端统一使用这9种状态码，前端按角色精简展示
 */

export enum SettlementStatus {
  /** 待生成或待提交 */
  PENDING = 'pending',
  /** 待平台/财务审核 */
  REVIEWING = 'reviewing',
  /** 已提交拉卡拉 */
  SUBMITTED = 'submitted',
  /** 拉卡拉处理中 */
  PROCESSING = 'processing',
  /** 已到账 */
  SETTLED = 'settled',
  /** 分账失败 */
  FAILED = 'failed',
  /** 退款或差异调整中 */
  ADJUSTING = 'adjusting',
  /** 结算关闭 */
  CLOSED = 'closed',
}

/** 完整状态标签映射（Platform 总运营后台使用全部） */
export const STATUS_FULL_LABELS: Record<SettlementStatus, string> = {
  [SettlementStatus.PENDING]: '待提交',
  [SettlementStatus.REVIEWING]: '审核中',
  [SettlementStatus.SUBMITTED]: '已提交拉卡拉',
  [SettlementStatus.PROCESSING]: '处理中',
  [SettlementStatus.SETTLED]: '已到账',
  [SettlementStatus.FAILED]: '失败',
  [SettlementStatus.ADJUSTING]: '调整中',
  [SettlementStatus.CLOSED]: '已关闭',
}

/** 商家/代理商/CP端简化展示映射 */
export const STATUS_MERCHANT_LABELS: Record<SettlementStatus, string> = {
  [SettlementStatus.PENDING]: '待结算',
  [SettlementStatus.REVIEWING]: '处理中',
  [SettlementStatus.SUBMITTED]: '处理中',
  [SettlementStatus.PROCESSING]: '处理中',
  [SettlementStatus.SETTLED]: '已到账',
  [SettlementStatus.FAILED]: '失败',
  [SettlementStatus.ADJUSTING]: '处理中',
  [SettlementStatus.CLOSED]: '已关闭',
}

/** Naive-ui Tag type 映射 */
export const STATUS_TAG_TYPE: Record<SettlementStatus, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  [SettlementStatus.PENDING]: 'warning',
  [SettlementStatus.REVIEWING]: 'info',
  [SettlementStatus.SUBMITTED]: 'info',
  [SettlementStatus.PROCESSING]: 'info',
  [SettlementStatus.SETTLED]: 'success',
  [SettlementStatus.FAILED]: 'error',
  [SettlementStatus.ADJUSTING]: 'warning',
  [SettlementStatus.CLOSED]: 'default',
}

/** 需要高亮显示的状态集合（异常/待关注） */
export const STATUS_ATTENTION = new Set([
  SettlementStatus.FAILED,
  SettlementStatus.ADJUSTING,
])
