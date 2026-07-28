/**
 * 收银 Token 设备绑定（最终方案 · 原型）
 *
 * - 统一叫 Token（一次性）
 * - 商家后台新建设备生成 Token，状态「未使用」
 * - 在目标电脑绑定后 →「已使用」，绑死该机；其他电脑再用同一 Token → 失败
 * - 换机：后台新建/换发 Token；旧机可继续用直到店长手动禁用
 * - 登录 = 本机已绑定 + 店员账号密码
 * - 不做同 Token 互踢
 *
 * 与商家后台共享 localStorage/cookie 键：cashierDeviceCatalogV1
 */

export const CASHIER_DEVICE_CATALOG_KEY = 'cashierDeviceCatalogV1'
export const CASHIER_MACHINE_ID_KEY = 'cashierMachineId'
export const CASHIER_LOCAL_BIND_KEY = 'cashierDeviceLocalBindV1'
export const CASHIER_STAFF_SESSION_HINT = 'cashierKickHint'
const TEST_OTHER_MACHINE_ID = 'machine_test_other'

const DEVICE_NOT_BOUND = '本机尚未绑定收银 Token，无法登录。请在设置中输入 Token 完成绑定。'
const DEVICE_DISABLED = '该收银设备已被店长禁用，无法登录。'
const TOKEN_USED_ELSEWHERE = '该 Token 已被其他设备使用'
const TOKEN_INVALID = 'Token 无效，请核对商家后台「收银终端」'

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function setCookie(name, value) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`
}

function readJson(key, fallback) {
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

function writeJson(key, value) {
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

function removeKey(storage, key) {
  try {
    storage.removeItem(key)
  } catch {
    // ignore
  }
}

function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

export function getMachineId() {
  try {
    let id = localStorage.getItem(CASHIER_MACHINE_ID_KEY)
    if (id && id.trim()) return id.trim()
    id = createId('machine')
    localStorage.setItem(CASHIER_MACHINE_ID_KEY, id)
    return id
  } catch {
    return 'machine_fallback'
  }
}

/** 默认演示设备（与后台一致，首次无数据时写入） */
const DEFAULT_DEVICES = [
  {
    id: 1,
    shop: '演示门店',
    name: '前台1号收银机',
    token: 'TKNFRONT001ALPHASPACEDEMO0001',
    enabled: true,
    used: false,
    machineId: '',
    createTime: '2026-07-28 10:00:00',
  },
  {
    id: 2,
    shop: '演示门店',
    name: '吧台2号收银机',
    token: 'TKNBAR002ALPHASPACEDEMO0000002',
    enabled: true,
    used: false,
    machineId: '',
    createTime: '2026-07-28 10:05:00',
  },
]

export function loadDeviceCatalog() {
  const list = readJson(CASHIER_DEVICE_CATALOG_KEY, null)
  if (!list || !Array.isArray(list) || !list.length) {
    writeJson(CASHIER_DEVICE_CATALOG_KEY, DEFAULT_DEVICES)
    return DEFAULT_DEVICES.map((d) => ({ ...d }))
  }
  return list.map((d) => ({
    ...d,
    used: !!d.used || !!d.machineId,
    machineId: d.machineId || '',
    enabled: d.enabled !== false,
  }))
}

function saveDeviceCatalog(list) {
  writeJson(CASHIER_DEVICE_CATALOG_KEY, list)
}

export function getTokenTestStatus(device = {}) {
  if (device.enabled === false) return '已禁用'
  if (device.machineId === getMachineId()) return '已绑定本机'
  if (device.machineId) return '已绑定其他设备'
  if (device.used) return '已使用'
  return '未使用'
}

function findByToken(token) {
  const t = String(token || '').trim().toUpperCase()
  if (!t) return null
  return loadDeviceCatalog().find((d) => String(d.token).toUpperCase() === t) || null
}

function getLocalBind() {
  return readJson(CASHIER_LOCAL_BIND_KEY, null)
}

function setLocalBind(bind) {
  writeJson(CASHIER_LOCAL_BIND_KEY, bind)
}

function clearLocalBind() {
  try {
    localStorage.removeItem(CASHIER_LOCAL_BIND_KEY)
  } catch {
    // ignore
  }
  try {
    document.cookie = `${CASHIER_LOCAL_BIND_KEY}=; path=/; max-age=0; SameSite=Lax`
  } catch {
    // ignore
  }
}

/**
 * 本机绑定展示信息
 */
export function getLocalDevice() {
  const bind = getLocalBind()
  if (!bind?.token) return null

  const machineId = getMachineId()
  const row = findByToken(bind.token)
  if (!row) {
    return {
      bound: false,
      deviceName: bind.deviceName || '未知设备',
      storeName: bind.shop || '',
      token: bind.token,
      status: 'orphan',
      enabled: false,
      used: true,
    }
  }

  const isThisMachine = row.machineId === machineId
  const bound = isThisMachine && row.used && row.enabled

  return {
    bound,
    deviceName: row.name,
    storeName: row.shop,
    token: row.token,
    status: !row.enabled ? 'disabled' : isThisMachine ? 'active' : 'foreign',
    enabled: row.enabled,
    used: row.used,
    isThisMachine,
  }
}

/**
 * 登录前校验：本机绑定 + 设备启用
 */
export function checkDeviceBinding() {
  const bind = getLocalBind()
  if (!bind?.token) {
    return { ok: false, message: DEVICE_NOT_BOUND }
  }

  const machineId = getMachineId()
  const row = findByToken(bind.token)
  if (!row) {
    return { ok: false, message: TOKEN_INVALID }
  }
  if (!row.enabled) {
    return { ok: false, message: DEVICE_DISABLED }
  }
  if (!row.used || !row.machineId) {
    return { ok: false, message: DEVICE_NOT_BOUND }
  }
  if (row.machineId !== machineId) {
    return {
      ok: false,
      message: TOKEN_USED_ELSEWHERE,
    }
  }

  return {
    ok: true,
    device: {
      token: row.token,
      deviceName: row.name,
      storeName: row.shop,
    },
  }
}

/**
 * 用 Token 绑定本机（一次性）
 */
export function bindTokenToThisMachine(rawToken) {
  const token = String(rawToken || '').trim()
  if (!token) {
    return { ok: false, message: '请输入 Token' }
  }

  const list = loadDeviceCatalog()
  const idx = list.findIndex((d) => String(d.token).toUpperCase() === token.toUpperCase())
  if (idx < 0) {
    return { ok: false, message: TOKEN_INVALID }
  }

  const row = list[idx]
  if (!row.enabled) {
    return { ok: false, message: DEVICE_DISABLED }
  }

  const machineId = getMachineId()

  // 已使用且绑的是别的机
  if (row.used && row.machineId && row.machineId !== machineId) {
    return { ok: false, message: TOKEN_USED_ELSEWHERE }
  }

  // 已绑本机：幂等
  if (row.used && row.machineId === machineId) {
    setLocalBind({
      token: row.token,
      deviceName: row.name,
      shop: row.shop,
      machineId,
      boundAt: row.boundAt || new Date().toISOString(),
    })
    return {
      ok: true,
      alreadyBound: true,
      message: `收银设备已绑定「${row.name}」`,
      device: { deviceName: row.name, storeName: row.shop, token: row.token },
    }
  }

  // 首次使用：写死 machineId，标记已使用
  const boundAt = new Date().toISOString()
  list[idx] = {
    ...row,
    used: true,
    machineId,
    boundAt,
  }
  saveDeviceCatalog(list)
  setLocalBind({
    token: row.token,
    deviceName: row.name,
    shop: row.shop,
    machineId,
    boundAt,
  })

  return {
    ok: true,
    message: `已绑定「${row.name}」`,
    device: { deviceName: row.name, storeName: row.shop, token: row.token },
  }
}

/** 兼容旧名 */
export function activateDeviceByCode(code) {
  return bindTokenToThisMachine(code)
}

/** 仅清本机本地绑定（模拟重装） */
export function clearLocalBindOnly() {
  clearLocalBind()
  return {
    ok: true,
    message: '已清除本机绑定',
  }
}

export function setTokenTestScenario(token, scenario = 'available') {
  const list = loadDeviceCatalog()
  const idx = list.findIndex((d) => String(d.token).toUpperCase() === String(token || '').trim().toUpperCase())
  if (idx < 0) {
    return { ok: false, message: TOKEN_INVALID }
  }

  const next = { ...list[idx] }

  if (scenario === 'available') {
    next.enabled = true
    next.used = false
    next.machineId = ''
  } else if (scenario === 'bound-other') {
    next.enabled = true
    next.used = true
    next.machineId = TEST_OTHER_MACHINE_ID
  } else if (scenario === 'disabled') {
    next.enabled = false
  } else {
    return { ok: false, message: '未知测试场景' }
  }

  list[idx] = next
  saveDeviceCatalog(list)

  return {
    ok: true,
    message: `已设为「${getTokenTestStatus(next)}」`,
  }
}

// ——— 会话（仅账号会话，无 Token 互踢）———

export function getCashierToken() {
  return getLocalBind()?.token || ''
}

export function setCashierToken() {
  return getCashierToken()
}

export function claimTokenSession(staff = {}) {
  const binding = checkDeviceBinding()
  if (!binding.ok) {
    throw new Error(binding.message || DEVICE_NOT_BOUND)
  }
  // 仅记录本机会话，不做跨端互踢
  const session = {
    sessionId: createId('sess'),
    token: binding.device.token,
    account: staff.account || '',
    name: staff.name || staff.account || '',
    role: staff.role || '收银员',
    loginAt: Date.now(),
    deviceName: binding.device.deviceName || '',
  }
  try {
    sessionStorage.setItem('cashierTokenLocalSession', JSON.stringify(session))
  } catch {
    // ignore
  }
  clearKickHint()
  return session
}

export function releaseTokenSession() {
  removeKey(sessionStorage, 'cashierTokenLocalSession')
}

export function getLocalTokenSession() {
  try {
    const raw = sessionStorage.getItem('cashierTokenLocalSession')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearLocalTokenSession() {
  releaseTokenSession()
}

/**
 * 会话校验：只查设备绑定是否仍有效（禁用/换发），不做互踢
 */
export function checkTokenSessionValid() {
  const local = getLocalTokenSession()
  if (!local?.sessionId) {
    return { ok: false, kicked: false, message: '未登录' }
  }
  const binding = checkDeviceBinding()
  if (!binding.ok) {
    return {
      ok: false,
      kicked: true,
      message: binding.message,
      lastAccount: local.account,
    }
  }
  if (local.token !== binding.device.token) {
    return {
      ok: false,
      kicked: true,
      message: '收银设备 Token 已变更，请重新登录。',
      lastAccount: local.account,
    }
  }
  return { ok: true }
}

export function getKickMessage() {
  return DEVICE_DISABLED
}

export function setKickHint({ message, lastAccount } = {}) {
  try {
    sessionStorage.setItem(
      CASHIER_STAFF_SESSION_HINT,
      JSON.stringify({ message: message || '', lastAccount: lastAccount || '', at: Date.now() }),
    )
  } catch {
    // ignore
  }
}

export function consumeKickHint() {
  try {
    const raw = sessionStorage.getItem(CASHIER_STAFF_SESSION_HINT)
    sessionStorage.removeItem(CASHIER_STAFF_SESSION_HINT)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearKickHint() {
  removeKey(sessionStorage, CASHIER_STAFF_SESSION_HINT)
}

export function handleTokenKicked(onKicked) {
  const check = checkTokenSessionValid()
  if (check.ok) return false
  if (check.kicked) {
    setKickHint({ message: check.message, lastAccount: check.lastAccount })
  }
  clearLocalTokenSession()
  if (typeof onKicked === 'function') onKicked(check)
  return true
}

/** 监听设备被禁用/换发（storage），无互踢轮询逻辑 */
export function startTokenSessionWatch(onKicked, intervalMs = 3000) {
  let stopped = false
  const evaluate = () => {
    if (stopped) return
    if (!getLocalTokenSession()) return
    handleTokenKicked(onKicked)
  }
  const onStorage = (event) => {
    if (event.key === CASHIER_DEVICE_CATALOG_KEY || event.key === CASHIER_LOCAL_BIND_KEY) {
      evaluate()
    }
  }
  window.addEventListener('storage', onStorage)
  const timer = window.setInterval(evaluate, intervalMs)
  evaluate()
  return () => {
    stopped = true
    window.removeEventListener('storage', onStorage)
    window.clearInterval(timer)
  }
}

export function getTokenSessionDebugInfo() {
  const device = getLocalDevice()
  const binding = checkDeviceBinding()
  const catalog = loadDeviceCatalog()
  const local = getLocalTokenSession()
  const check = local ? checkTokenSessionValid() : { ok: false, message: '未登录' }

  return {
    device,
    bindingOk: binding.ok,
    bindingMessage: binding.message || '',
    local,
    valid: !!check.ok,
    message: check.message || (check.ok ? '会话有效' : '无有效会话'),
    catalog: catalog.map((d) => ({
      name: d.name,
      tokenShort: `${String(d.token).slice(0, 8)}…`,
      used: d.used ? '已使用' : '未使用',
      enabled: d.enabled ? '启用' : '禁用',
      mine: d.machineId === getMachineId() ? '本机' : d.machineId ? '其他机' : '—',
    })),
  }
}

/** 已废弃：方案不做互踢 */
export function simulateRemoteKick() {
  return {
    ok: false,
    message: '当前方案不做同 Token 互踢。Token 一次性绑一机，不存在两台机抢登录。',
  }
}

export function disableCurrentDevice() {
  return {
    ok: false,
    message: '请在商家后台「收银终端」中禁用该设备（店长操作）。',
  }
}

export function resetDeviceByCode() {
  return {
    ok: false,
    message: '请在商家后台换发 Token 或新建收银设备。',
  }
}

export function unbindLocalDevice() {
  return clearLocalBindOnly()
}
