/**
 * 收银设备 Token 目录（商家后台 + 收银端共用口径）
 *
 * 最终方案：
 * - 统一叫 Token（一次性）
 * - 新建时生成 Token，未使用；在某台电脑绑定后 = 已使用，绑死该机
 * - 其他电脑再用同一 Token → 失败
 * - 换机：新建另一台设备的 Token；旧机可继续用直到店长手动禁用
 * - 登录仍需店员账号密码
 * - 不做同 Token 互踢
 *
 * 原型：localStorage + cookie 双写，尽量跨 9527/9529 端口同步。
 */

export const CASHIER_DEVICE_CATALOG_KEY = 'cashierDeviceCatalogV1'
export const CASHIER_MACHINE_ID_KEY = 'cashierMachineId'
export const CASHIER_LOCAL_BIND_KEY = 'cashierDeviceLocalBindV1'

export type CashierDeviceRecord = {
  id: number
  shop: string
  name: string
  token: string
  /** 店长启用/禁用；禁用后该 Token 不能登录 */
  enabled: boolean
  /** 是否已在某台电脑上使用（绑定） */
  used: boolean
  /** 绑定的本机实例 ID；未使用时为空 */
  machineId: string
  createTime: string
  boundAt?: string
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

export function generateToken(): string {
  const hex = '0123456789ABCDEF'
  let s = ''
  for (let i = 0; i < 32; i++) s += hex[Math.floor(Math.random() * 16)]
  return s
}

function nowStr() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

const DEFAULT_DEVICES: CashierDeviceRecord[] = [
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

export function loadCashierDevices(): CashierDeviceRecord[] {
  const list = readStore<CashierDeviceRecord[]>(CASHIER_DEVICE_CATALOG_KEY, [])
  if (!list.length) {
    writeStore(CASHIER_DEVICE_CATALOG_KEY, DEFAULT_DEVICES)
    return DEFAULT_DEVICES.map((d) => ({ ...d }))
  }
  return list.map((d) => ({
    ...d,
    used: !!d.used || !!d.machineId,
    machineId: d.machineId || '',
    enabled: d.enabled !== false,
  }))
}

export function saveCashierDevices(list: CashierDeviceRecord[]) {
  writeStore(CASHIER_DEVICE_CATALOG_KEY, list)
}

export function createCashierDevice(input: {
  shop: string
  name: string
  token?: string
  enabled?: boolean
}): CashierDeviceRecord {
  const list = loadCashierDevices()
  const id = list.length ? Math.max(...list.map((d) => d.id)) + 1 : 1
  const token = (input.token || generateToken()).trim().toUpperCase()
  if (list.some((d) => d.token.toUpperCase() === token)) {
    throw new Error('Token 已存在，请重新生成')
  }
  const row: CashierDeviceRecord = {
    id,
    shop: input.shop,
    name: input.name.trim(),
    token,
    enabled: input.enabled !== false,
    used: false,
    machineId: '',
    createTime: nowStr(),
  }
  list.unshift(row)
  saveCashierDevices(list)
  return row
}

export function updateCashierDevice(id: number, patch: Partial<CashierDeviceRecord>) {
  const list = loadCashierDevices()
  const idx = list.findIndex((d) => d.id === id)
  if (idx < 0) throw new Error('设备不存在')
  list[idx] = { ...list[idx], ...patch, id: list[idx].id, token: list[idx].token }
  saveCashierDevices(list)
  return list[idx]
}

/** 店长禁用/启用 */
export function setCashierDeviceEnabled(id: number, enabled: boolean) {
  return updateCashierDevice(id, { enabled })
}

/**
 * 换机用：作废旧绑定，生成新 Token，状态回到未使用
 * （旧机在禁用前仍可用的是「禁用」操作；重置是给新机准备新 Token）
 */
export function reissueCashierDeviceToken(id: number) {
  const list = loadCashierDevices()
  const idx = list.findIndex((d) => d.id === id)
  if (idx < 0) throw new Error('设备不存在')
  const nextToken = generateToken()
  list[idx] = {
    ...list[idx],
    token: nextToken,
    used: false,
    machineId: '',
    boundAt: undefined,
    enabled: true,
  }
  saveCashierDevices(list)
  return list[idx]
}
