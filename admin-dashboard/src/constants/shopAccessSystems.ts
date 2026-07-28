/**
 * 角色可用系统（商家运营后台 / 头号掌柜收银系统）
 * 仅在「创建角色」时配置；登录时按用户所属角色判断是否有权进入对应系统。
 */

export type ShopAccessSystem = 'shop' | 'cashier'

export const SHOP_ACCESS_SYSTEMS: {
  key: ShopAccessSystem
  label: string
  shortLabel: string
}[] = [
  { key: 'shop', label: '商家运营后台', shortLabel: '商家运营后台' },
  { key: 'cashier', label: '头号掌柜收银系统', shortLabel: '收银系统' },
]

export const SHOP_ACCESS_SYSTEM_OPTIONS = SHOP_ACCESS_SYSTEMS.map((s) => ({
  label: s.label,
  value: s.key,
}))

export const SHOP_STAFF_STORAGE_KEY = 'shopStaffAccessRegistry'
export const SHOP_ROLE_STORAGE_KEY = 'shopRoleAccessRegistry'

/** 预设角色：仅管理员 / 店长 / 收银员 */
export const PRESET_ROLE_NAMES = ['管理员', '店长', '收银员'] as const

/** 演示账号（登录页展示，密码统一 123456） */
export const DEMO_LOGIN_ACCOUNTS = [
  {
    role: '管理员',
    name: '系统管理员',
    account: 'admin',
    password: '123456',
    systems: ['shop', 'cashier'] as ShopAccessSystem[],
    systemsText: '商家运营后台 + 收银系统',
    note: '双端可登录',
  },
  {
    role: '店长',
    name: 'he',
    account: 'hehai',
    password: '123456',
    systems: ['shop', 'cashier'] as ShopAccessSystem[],
    systemsText: '商家运营后台 + 收银系统',
    note: '双端可登录',
  },
  {
    role: '收银员',
    name: '张三',
    account: '18998311111',
    password: '123456',
    systems: ['cashier'] as ShopAccessSystem[],
    systemsText: '仅收银系统',
    note: '商家后台会拒绝；不可改会员等级',
  },
] as const

export function systemLabel(key: ShopAccessSystem | string) {
  return SHOP_ACCESS_SYSTEMS.find((s) => s.key === key)?.label || key
}

export function systemShortLabel(key: ShopAccessSystem | string) {
  return SHOP_ACCESS_SYSTEMS.find((s) => s.key === key)?.shortLabel || key
}

export function formatSystems(systems: string[] = []) {
  if (!systems.length) return '未配置'
  return systems.map(systemShortLabel).join('、')
}

/** 是否为管理员角色（可用系统固定双端，不可关闭商家运营后台） */
export function isAdminRoleName(name: string) {
  return String(name || '').trim() === '管理员'
}

/** 管理员固定可用系统 */
export const ADMIN_FIXED_SYSTEMS: ShopAccessSystem[] = ['shop', 'cashier']

/** 角色默认可用系统（创建角色时的初始勾选） */
export function defaultSystemsByRole(role: string): ShopAccessSystem[] {
  if (isAdminRoleName(role)) return [...ADMIN_FIXED_SYSTEMS]
  if (role === '收银员') return ['cashier']
  // 店长及其他：默认双端
  return ['shop', 'cashier']
}

/** 收银员（店员）不可编辑会员等级；管理员/店长可以 */
export function canEditMemberLevel(role: string) {
  return role === '管理员' || role === '店长'
}

/**
 * 规范化角色可用系统
 * - 管理员：强制双端
 * - 其他角色：至少保留 1 个；空则回退默认
 */
export function normalizeRoleSystems(
  roleName: string,
  systems: ShopAccessSystem[] | string[] | null | undefined,
): ShopAccessSystem[] {
  if (isAdminRoleName(roleName)) {
    return [...ADMIN_FIXED_SYSTEMS]
  }
  const list = Array.from(new Set((systems || []).filter(Boolean))) as ShopAccessSystem[]
  if (list.length === 0) {
    return defaultSystemsByRole(roleName)
  }
  return list
}

export interface ShopStaffRecord {
  id: number
  account: string
  name: string
  role: string
  status: boolean
}

export interface ShopRoleRecord {
  id: number
  name: string
  systems: ShopAccessSystem[]
  status: boolean
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`
}

function readStore<T>(key: string, fallback: T): T {
  try {
    const fromCookie = getCookie(key)
    if (fromCookie) return JSON.parse(fromCookie) as T
  } catch {
    // ignore
  }
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw) as T
  } catch {
    // ignore
  }
  return fallback
}

function writeStore(key: string, value: unknown) {
  const raw = JSON.stringify(value)
  try {
    localStorage.setItem(key, raw)
  } catch {
    // ignore
  }
  try {
    setCookie(key, raw)
  } catch {
    // ignore
  }
}

const DEFAULT_DEMO_STAFF: ShopStaffRecord[] = DEMO_LOGIN_ACCOUNTS.map((item, index) => ({
  id: index + 1,
  account: item.account,
  name: item.name,
  role: item.role,
  status: true,
}))

const DEFAULT_DEMO_ROLES: ShopRoleRecord[] = [
  { id: 1, name: '管理员', systems: ['shop', 'cashier'], status: true },
  { id: 2, name: '店长', systems: ['shop', 'cashier'], status: true },
  { id: 3, name: '收银员', systems: ['cashier'], status: true },
]

/** 仅保留预设三类角色（清理历史缓存中的接待员/财务等） */
function keepPresetRoles(list: ShopRoleRecord[]): ShopRoleRecord[] {
  const preset = new Set<string>(PRESET_ROLE_NAMES)
  const filtered = list.filter((r) => preset.has(r.name))
  return ensureDemoRoles(filtered)
}

/** 合并演示账号，保证登录页展示的账号始终可鉴权 */
function ensureDemoStaff(list: ShopStaffRecord[]): ShopStaffRecord[] {
  const map = new Map(list.map((u) => [u.account, u]))
  DEFAULT_DEMO_STAFF.forEach((demo) => {
    if (!map.has(demo.account)) map.set(demo.account, demo)
  })
  return Array.from(map.values())
}

function ensureDemoRoles(list: ShopRoleRecord[]): ShopRoleRecord[] {
  if (!list.length) return DEFAULT_DEMO_ROLES.map((r) => ({ ...r, systems: [...r.systems] }))
  const map = new Map(list.map((r) => [r.name, r]))
  DEFAULT_DEMO_ROLES.forEach((demo) => {
    if (!map.has(demo.name)) {
      map.set(demo.name, { ...demo, systems: [...demo.systems] })
    } else {
      const cur = map.get(demo.name)!
      map.set(demo.name, {
        ...cur,
        systems: normalizeRoleSystems(cur.name, cur.systems),
      })
    }
  })
  return Array.from(map.values())
}

export function loadShopStaffRegistry(): ShopStaffRecord[] {
  return ensureDemoStaff(readStore<ShopStaffRecord[]>(SHOP_STAFF_STORAGE_KEY, []))
}

export function saveShopStaffRegistry(list: ShopStaffRecord[]) {
  writeStore(SHOP_STAFF_STORAGE_KEY, ensureDemoStaff(list))
}

export function removeShopStaff(account: string) {
  // 演示账号不允许删除（登录页固定展示）
  if (DEMO_LOGIN_ACCOUNTS.some((d) => d.account === account)) return
  saveShopStaffRegistry(loadShopStaffRegistry().filter((u) => u.account !== account))
}

export function loadShopRoleRegistry(): ShopRoleRecord[] {
  return keepPresetRoles(readStore<ShopRoleRecord[]>(SHOP_ROLE_STORAGE_KEY, []))
}

export function saveShopRoleRegistry(list: ShopRoleRecord[]) {
  writeStore(SHOP_ROLE_STORAGE_KEY, keepPresetRoles(list))
}

export function getRoleSystems(roleName: string): ShopAccessSystem[] {
  if (isAdminRoleName(roleName)) return [...ADMIN_FIXED_SYSTEMS]
  const role = loadShopRoleRegistry().find((r) => r.name === roleName && r.status !== false)
  return normalizeRoleSystems(roleName, role?.systems)
}

/**
 * 登录鉴权：按账号所属角色的「可用系统」判断
 * - 演示账号 / 已录入账号：按角色可用系统校验
 * - 未录入账号：演示环境放行
 * - 账号禁用：拒绝
 */
export function checkSystemLoginAccess(
  account: string,
  system: ShopAccessSystem,
): { ok: boolean; message?: string } {
  const username = String(account || '').trim()
  if (!username) {
    return { ok: false, message: '请输入账号' }
  }

  // 优先演示账号表（与登录页展示一致）
  const demo = DEMO_LOGIN_ACCOUNTS.find((d) => d.account === username)
  if (demo) {
    if (!demo.systems.includes(system)) {
      return {
        ok: false,
        message: `账号「${demo.name}（${demo.account}）」所属角色「${demo.role}」无权登录${systemLabel(system)}。该角色可用系统：${demo.systemsText}`,
      }
    }
    return { ok: true }
  }

  const staff = loadShopStaffRegistry().find((u) => u.account === username)
  if (!staff) {
    return { ok: true }
  }

  if (staff.status === false) {
    return { ok: false, message: `账号「${staff.name || username}」已禁用，无法登录` }
  }

  const systems = getRoleSystems(staff.role)
  if (!systems.includes(system)) {
    return {
      ok: false,
      message: `账号「${staff.name || username}」所属角色「${staff.role}」无权登录${systemLabel(system)}。该角色可用系统：${formatSystems(systems)}`,
    }
  }

  return { ok: true }
}
