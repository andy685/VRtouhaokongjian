/**
 * 通知/消息/公告 - 统一类型常量
 */

// ---- 一级：消息中心分类 ----
export const MESSAGE_CATEGORIES = [
  { label: '审核通知', value: 'review' },
  { label: '财务核算', value: 'financial' },
  { label: '订单监控', value: 'order' },
  { label: '安全风控', value: 'security' },
  { label: '系统公告', value: 'announcement' },
] as const

export type MessageCategory = (typeof MESSAGE_CATEGORIES)[number]['value']

// ---- 二级：公告子类型（仅系统公告下使用）----
export const ANNOUNCEMENT_SUB_TYPES = [
  { label: '普通公告', value: 'normal' },
  { label: '紧急通知', value: 'urgent' },
  { label: '维护公告', value: 'maintain' },
] as const

export type AnnouncementSubType = (typeof ANNOUNCEMENT_SUB_TYPES)[number]['value']

// ---- 子级：各端特有消息类型（CP/代理商/商家）----
export const MESSAGE_SUB_TYPES = [
  { label: '审核通知', value: 'review' },
  { label: '分润提醒', value: 'commission' },
  { label: '活动通知', value: 'activity' },
] as const

// ---- 统一标签映射表 ----
export const MESSAGE_TAG_MAP: Record<string, { label: string; type: string }> = {
  review:       { label: '审核通知', type: 'warning' },
  commission:   { label: '分润提醒', type: 'success' },
  activity:     { label: '活动通知', type: 'warning' },
  financial:    { label: '财务核算', type: 'success' },
  order:        { label: '订单监控', type: 'info' },
  security:     { label: '安全风控', type: 'error' },
  announcement: { label: '系统公告', type: 'warning' },
}

// ---- 工具函数 ----

/** 分类 value → 显示名称 */
export function categoryLabel(v: string): string {
  const m: Record<string, string> = {
    review: '审核通知',
    financial: '财务核算',
    order: '订单监控',
    security: '安全风控',
    announcement: '系统公告',
  }
  return m[v] || v
}

/** 分类 value → NTag type */
export function categoryTagType(v: string): 'info' | 'success' | 'warning' | 'error' | 'default' {
  const m: Record<string, string> = {
    review: 'warning',
    financial: 'success',
    order: 'info',
    security: 'error',
    announcement: 'warning',
  }
  return (m[v] || 'default') as 'info' | 'success' | 'warning' | 'error' | 'default'
}

/** 公告子类型 value → 显示名称 */
export function subTypeLabel(v: string): string {
  const m: Record<string, string> = { normal: '普通公告', urgent: '紧急通知', maintain: '维护公告' }
  return m[v] || v
}

/** 公告子类型 value → NTag type */
export function subTypeTagType(v: string): 'default' | 'error' | 'warning' {
  const m: Record<string, string> = { normal: 'default', urgent: 'error', maintain: 'warning' }
  return (m[v] || 'default') as 'default' | 'error' | 'warning'
}

/** 统一消息标签 value → label */
export function msgTagLabel(v: string): string {
  return MESSAGE_TAG_MAP[v]?.label ?? v
}

/** 统一消息标签 value → NTag type */
export function msgTagType(v: string): 'info' | 'success' | 'warning' | 'error' | 'default' {
  return (MESSAGE_TAG_MAP[v]?.type ?? 'default') as 'info' | 'success' | 'warning' | 'error' | 'default'
}
