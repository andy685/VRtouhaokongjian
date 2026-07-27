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

/** 角色默认可用系统（创建角色时的初始勾选） */
export function defaultSystemsByRole(role: string): ShopAccessSystem[] {
  if (role === '收银员') return ['cashier']
  if (role === '导购' || role === '接待员' || role === '设备维护' || role === '财务') return ['shop']
  return ['shop', 'cashier']
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

export function loadShopStaffRegistry(): ShopStaffRecord[] {
  return readStore<ShopStaffRecord[]>(SHOP_STAFF_STORAGE_KEY, [])
}

export function saveShopStaffRegistry(list: ShopStaffRecord[]) {
  writeStore(SHOP_STAFF_STORAGE_KEY, list)
}

export function removeShopStaff(account: string) {
  saveShopStaffRegistry(loadShopStaffRegistry().filter((u) => u.account !== account))
}

export function loadShopRoleRegistry(): ShopRoleRecord[] {
  return readStore<ShopRoleRecord[]>(SHOP_ROLE_STORAGE_KEY, [])
}

export function saveShopRoleRegistry(list: ShopRoleRecord[]) {
  writeStore(SHOP_ROLE_STORAGE_KEY, list)
}

export function getRoleSystems(roleName: string): ShopAccessSystem[] {
  const role = loadShopRoleRegistry().find((r) => r.name === roleName && r.status !== false)
  if (role?.systems?.length) return role.systems
  return defaultSystemsByRole(roleName)
}

/**
 * 登录鉴权：按账号所属角色的「可用系统」判断
 * - 未录入账号：演示环境放行
 * - 账号禁用：拒绝
 * - 角色未开通目标系统：拒绝并提示
 */
export function checkSystemLoginAccess(
  account: string,
  system: ShopAccessSystem,
): { ok: boolean; message?: string } {
  const username = String(account || '').trim()
  if (!username) {
    return { ok: false, message: '请输入账号' }
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
