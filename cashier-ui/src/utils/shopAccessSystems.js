/**
 * 登录鉴权 + 收银会话
 * 预设角色仅：管理员 / 店长 / 收银员
 * 收银员（店员）不可编辑会员等级
 */

export const SHOP_STAFF_STORAGE_KEY = 'shopStaffAccessRegistry'
export const SHOP_ROLE_STORAGE_KEY = 'shopRoleAccessRegistry'
export const CASHIER_SESSION_KEY = 'cashierStaffSession'

const SYSTEM_LABELS = {
  shop: '商家运营后台',
  cashier: '头号掌柜收银系统',
}

const SYSTEM_SHORT = {
  shop: '商家运营后台',
  cashier: '收银系统',
}

/** 与 admin-dashboard DEMO_LOGIN_ACCOUNTS 保持一致 */
export const DEMO_LOGIN_ACCOUNTS = [
  {
    role: '管理员',
    name: '系统管理员',
    account: 'admin',
    password: '123456',
    systems: ['shop', 'cashier'],
    systemsText: '商家运营后台 + 收银系统',
    canCashier: true,
    canShop: true,
  },
  {
    role: '店长',
    name: 'he',
    account: 'hehai',
    password: '123456',
    systems: ['shop', 'cashier'],
    systemsText: '商家运营后台 + 收银系统',
    canCashier: true,
    canShop: true,
  },
  {
    role: '收银员',
    name: '张三',
    account: '18998311111',
    password: '123456',
    systems: ['cashier'],
    systemsText: '仅收银系统',
    canCashier: true,
    canShop: false,
  },
]

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
  if (role === '管理员') return ['shop', 'cashier']
  if (role === '收银员') return ['cashier']
  return ['shop', 'cashier']
}

function getRoleSystems(roleName) {
  if (roleName === '管理员') return ['shop', 'cashier']
  const roles = readStore(SHOP_ROLE_STORAGE_KEY, [])
  const role = roles.find((r) => r.name === roleName && r.status !== false)
  if (role?.systems?.length) return role.systems
  return defaultSystemsByRole(roleName)
}

function resolveStaff(account) {
  const username = String(account || '').trim()
  const demo = DEMO_LOGIN_ACCOUNTS.find((d) => d.account === username)
  if (demo) {
    return {
      account: demo.account,
      name: demo.name,
      role: demo.role,
      status: true,
    }
  }
  const staffList = readStore(SHOP_STAFF_STORAGE_KEY, [])
  return staffList.find((u) => u.account === username) || null
}

export function checkCashierLoginAccess(account) {
  const username = String(account || '').trim()
  if (!username) {
    return { ok: false, message: '请输入店员账号' }
  }

  const demo = DEMO_LOGIN_ACCOUNTS.find((d) => d.account === username)
  if (demo) {
    if (!demo.canCashier) {
      return {
        ok: false,
        message: `账号「${demo.name}（${demo.account}）」所属角色「${demo.role}」无权登录${SYSTEM_LABELS.cashier}。该角色可用系统：${demo.systemsText}`,
      }
    }
    return { ok: true, staff: { account: demo.account, name: demo.name, role: demo.role } }
  }

  const staff = resolveStaff(username)
  if (!staff) {
    return { ok: true, staff: { account: username, name: username, role: '收银员' } }
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

  return { ok: true, staff }
}

/** 登录成功后写入收银会话 */
export function setCashierSession(staff) {
  const payload = {
    account: staff?.account || '',
    name: staff?.name || staff?.account || '',
    role: staff?.role || '收银员',
    loginAt: Date.now(),
  }
  try {
    sessionStorage.setItem(CASHIER_SESSION_KEY, JSON.stringify(payload))
  } catch {
    // ignore
  }
  return payload
}

export function getCashierSession() {
  try {
    const raw = sessionStorage.getItem(CASHIER_SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function clearCashierSession() {
  try {
    sessionStorage.removeItem(CASHIER_SESSION_KEY)
  } catch {
    // ignore
  }
}

/** 当前登录角色是否可编辑会员等级（管理员/店长可以，收银员不可以） */
export function canEditMemberLevel(role) {
  const r = role || getCashierSession()?.role || ''
  return r === '管理员' || r === '店长'
}
