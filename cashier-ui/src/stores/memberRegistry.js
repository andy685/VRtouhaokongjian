/**
 * 会员注册表（前端演示用）
 *
 * 业务规则：
 * - 手机号是全局唯一会员身份，也是收银「新增会员」唯一输入项
 * - 用户名 / 性别 / 生日 / 备注 属于全局档案，门店收银不可录入、不可覆盖
 * - 门店侧只能通过手机号建立「本店关联」；新手机号仅创建最小档案（手机号）
 */

const createAvatar = (bg1, bg2) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><linearGradient id="av" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${bg1}"/><stop offset="100%" stop-color="${bg2}"/></linearGradient></defs><rect width="40" height="40" rx="20" fill="url(#av)"/><circle cx="20" cy="15" r="7" fill="rgba(255,255,255,0.9)"/><ellipse cx="20" cy="33" rx="12" ry="10" fill="rgba(255,255,255,0.85)"/></svg>`
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
}

/** 全局唯一会员档案（按手机号） */
const globalProfiles = new Map([
  ['17600110765', {
    id: 1,
    name: '李明',
    phone: '17600110765',
    gender: '男',
    birthday: '1990-05-12',
    remark: '平台老客',
    level: '钻石',
    avatar: createAvatar('#74b9ff', '#0984e3'),
  }],
  ['13956785678', {
    id: 2,
    name: '王芳',
    phone: '13956785678',
    gender: '女',
    birthday: '1992-08-20',
    remark: '',
    level: '铂金',
    avatar: createAvatar('#fd79a8', '#e84393'),
  }],
  ['13790123456', {
    id: 3,
    name: '张伟',
    phone: '13790123456',
    gender: '男',
    birthday: '1988-03-01',
    remark: '常来周末场',
    level: '黄金',
    avatar: createAvatar('#55efc4', '#00b894'),
  }],
  ['13634567890', {
    id: 4,
    name: '刘洋',
    phone: '13634567890',
    gender: '男',
    birthday: '1995-11-11',
    remark: '',
    level: '黄金',
    avatar: createAvatar('#ffeaa7', '#fdcb6e'),
  }],
  ['15812345678', {
    id: 5,
    name: '陈静',
    phone: '15812345678',
    gender: '女',
    birthday: '1993-07-07',
    remark: '',
    level: '铂金',
    avatar: createAvatar('#a29bfe', '#6c5ce7'),
  }],
  ['15987654321', {
    id: 6,
    name: '周磊',
    phone: '15987654321',
    gender: '男',
    birthday: '1991-01-30',
    remark: '',
    level: '白银',
    avatar: createAvatar('#fab1a0', '#e17055'),
  }],
])

/** 门店关联：storeId -> Set(phone) */
const storeLinks = new Map([
  ['current', new Set(['17600110765', '13956785678', '13790123456', '13634567890'])],
])

const CURRENT_STORE_ID = 'current'

export function normalizePhone(phone = '') {
  return String(phone).replace(/\D/g, '')
}

export function isValidPhone(phone = '') {
  return /^1\d{10}$/.test(normalizePhone(phone))
}

/** 展示用脱敏手机号 */
export function maskPhone(phone = '') {
  const p = normalizePhone(phone)
  if (p.length !== 11) return p
  return `${p.slice(0, 3)}****${p.slice(7)}`
}

/** 新会员默认展示名：会员 + 后四位 */
export function defaultMemberName(phone = '') {
  const p = normalizePhone(phone)
  return p.length >= 4 ? `会员${p.slice(-4)}` : '新会员'
}

/**
 * 按手机号查询全局会员档案
 */
export function lookupGlobalMemberByPhone(phone) {
  const p = normalizePhone(phone)
  if (!isValidPhone(p)) return null
  const profile = globalProfiles.get(p)
  if (!profile) {
    return { exists: false, phone: p, linkedToCurrentStore: false, profile: null }
  }
  const links = storeLinks.get(CURRENT_STORE_ID) || new Set()
  return {
    exists: true,
    phone: p,
    linkedToCurrentStore: links.has(p),
    profile: { ...profile },
  }
}

/**
 * 仅凭手机号：新建或关联到当前门店
 * - 已是本店会员：拒绝
 * - 全局已存在：只关联，不改档案
 * - 全新手机号：创建最小档案（仅手机号 + 系统默认名），不接收姓名/性别/生日/备注
 */
export function createOrLinkMemberToStore(payload = {}) {
  const phone = normalizePhone(payload.phone)
  if (!isValidPhone(phone)) {
    return { ok: false, code: 'INVALID_PHONE', message: '请输入正确的 11 位手机号' }
  }

  const existing = globalProfiles.get(phone)
  let links = storeLinks.get(CURRENT_STORE_ID)
  if (!links) {
    links = new Set()
    storeLinks.set(CURRENT_STORE_ID, links)
  }

  if (existing && links.has(phone)) {
    return {
      ok: false,
      code: 'ALREADY_LINKED',
      message: '该手机号已是本店会员，无需重复添加',
      member: { ...existing, phone },
      mode: 'already_linked',
    }
  }

  if (existing) {
    links.add(phone)
    return {
      ok: true,
      code: 'LINKED',
      message: '已关联到本店',
      member: { ...existing, phone },
      mode: 'link_only',
    }
  }

  // 全新手机号：收银端不采集全局档案字段
  const profile = {
    id: Date.now(),
    name: defaultMemberName(phone),
    phone,
    gender: '',
    birthday: '',
    remark: '',
    level: '普通会员',
    avatar: createAvatar('#74b9ff', '#0984e3'),
  }
  globalProfiles.set(phone, profile)
  links.add(phone)

  return {
    ok: true,
    code: 'CREATED',
    message: '已添加本店会员',
    member: { ...profile },
    mode: 'create',
  }
}

export function getCurrentStoreId() {
  return CURRENT_STORE_ID
}
