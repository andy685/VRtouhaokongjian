/**
 * 登录鉴权：按账号所属角色的「可用系统」判断
 * 与商家后台共享 Cookie / localStorage
 */

export const SHOP_STAFF_STORAGE_KEY = 'shopStaffAccessRegistry'
export const SHOP_ROLE_STORAGE_KEY = 'shopRoleAccessRegistry'

const SYSTEM_LABELS = {
  shop: '商家运营后台',
  cashier: '头号掌柜收银系统',
}

const SYSTEM_SHORT = {
  shop: '商家运营后台',
  cashier: '收银系统',
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function readStore(key, fallback) {
  try {
    const fromCookie = getCookie(key)
    if (fromCookie) return JSON.parse(fromCookie)
  } catch {
    // ignore
  }
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore
  }
  return fallback
}

function formatSystems(systems = []) {
  if (!systems.length) return '未配置'
  return systems.map((s) => SYSTEM_SHORT[s] || s).join('、')
}

function defaultSystemsByRole(role) {
  if (role === '收银员') return ['cashier']
  if (role === '导购' || role === '接待员' || role === '设备维护' || role === '财务') return ['shop']
  return ['shop', 'cashier']
}

function getRoleSystems(roleName) {
  const roles = readStore(SHOP_ROLE_STORAGE_KEY, [])
  const role = roles.find((r) => r.name === roleName && r.status !== false)
  if (role?.systems?.length) return role.systems
  return defaultSystemsByRole(roleName)
}

export function checkCashierLoginAccess(account) {
  const username = String(account || '').trim()
  if (!username) {
    return { ok: false, message: '请输入店员账号' }
  }

  const staffList = readStore(SHOP_STAFF_STORAGE_KEY, [])
  const staff = staffList.find((u) => u.account === username)

  if (!staff) {
    return { ok: true }
  }

  if (staff.status === false) {
    return {
      ok: false,
      message: `账号「${staff.name || username}」已禁用，无法登录收银系统`,
    }
  }

  const systems = getRoleSystems(staff.role)
  if (!systems.includes('cashier')) {
    return {
      ok: false,
      message: `账号「${staff.name || username}」所属角色「${staff.role}」无权登录${SYSTEM_LABELS.cashier}。该角色可用系统：${formatSystems(systems)}`,
    }
  }

  return { ok: true }
}
