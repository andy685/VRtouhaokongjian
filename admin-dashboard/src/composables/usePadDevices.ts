import { ref, onMounted, onUnmounted } from 'vue'
export interface Pad { token:string; tokenStatus:'active'|'none'; id:string; serialNo:string; name:string; model:string; sn:string; specs:string; osVersion:string; macAddress:string; notes:string; runtimeStatus:'online'|'offline'; isFault:boolean; merchant:string; store:string; createdAt:string }
const storageKey = 'vr-platform-pads-v1'
const changedEvent = 'vr-pad-devices-changed'
const demoSeedKey = 'vr-platform-pads-demo-v1'
function demoPads(): Pad[] {
  const cases = [
    { name: '大厅接待Pad', merchant: '恒然集团', store: '恒然科技园店', online: true, fault: false, active: true, notes: '演示：在线设备，已分配且Token有效。' },
    { name: '包间控制Pad', merchant: '恒然集团', store: '恒然科技园店', online: false, fault: false, active: true, notes: '演示：设备离线，保留有效Token，等待重新联网。' },
    { name: '展厅故障Pad', merchant: '恒然集团', store: '恒然分部展厅', online: false, fault: true, active: false, notes: '演示：故障设备，Token已吊销。' },
    { name: '门店备用Pad', merchant: '利民街商家', store: '利民街小展厅', online: true, fault: false, active: false, notes: '演示：已分配但尚未配置Token，可在总运营端生成。' },
    { name: '体验区控制Pad', merchant: '卓远科技', store: '卓远萧山区店', online: true, fault: false, active: true, notes: '演示：跨商家、门店筛选和Token复制。' },
    { name: '待分配库存Pad', merchant: '', store: '', online: false, fault: false, active: false, notes: '演示：待分配库存，仅总运营端可见，分配后出现在商家端。' },
  ]
  return cases.map((item, index) => ({
    id: `demo-pad-${index + 1}`, serialNo: `PAD-DEMO-${String(index + 1).padStart(3, '0')}`,
    name: item.name, model: index % 2 ? '小米平板 6' : '华为 MatePad 11',
    sn: `DEMO-PAD-SN-${index + 1}`, specs: index % 2 ? '8GB / 256GB' : '8GB / 128GB',
    osVersion: index % 2 ? 'Android 14' : 'HarmonyOS 4', macAddress: `02:00:00:00:01:${String(index + 1).padStart(2, '0')}`,
    runtimeStatus: item.online ? 'online' : 'offline', isFault: item.fault,
    merchant: item.merchant, store: item.store, notes: item.notes, createdAt: '2026-10-27',
    token: item.active ? `tk_pad_demo_${index + 1}_example_only` : '', tokenStatus: item.active ? 'active' : 'none',
  }))
}
function seedDemoPads() {
  if (localStorage.getItem(demoSeedKey)) return
  const existing = localStorage.getItem(storageKey)
  const rows: unknown = existing ? JSON.parse(existing) : []
  if (!Array.isArray(rows)) return
  const samples = demoPads().filter(sample => !rows.some(row => row && (row.id === sample.id || row.serialNo === sample.serialNo || row.sn === sample.sn || row.macAddress === sample.macAddress)))
  localStorage.setItem(storageKey, JSON.stringify([...rows, ...samples]))
  localStorage.setItem(demoSeedKey, '1')
}
function load(): Pad[] {
  try {
    seedDemoPads()
    const value = JSON.parse(localStorage.getItem(storageKey) || '[]')
    return Array.isArray(value) ? value.filter(p => p && ['id','merchant','store','createdAt','serialNo','name','model','sn','specs','osVersion','macAddress','notes'].every(k=>typeof p[k]==='string') && ['online','offline'].includes(p.runtimeStatus) && typeof p.isFault==='boolean').map(p => ({...p, token: p.merchant && p.tokenStatus === 'active' && typeof p.token === 'string' ? p.token : '', tokenStatus: p.merchant && p.tokenStatus === 'active' && typeof p.token === 'string' && p.token ? 'active' : 'none'})) : []
  } catch { return [] }
}
export function usePadDevices() {
  const pads = ref<Pad[]>(load())
  const refresh = () => { pads.value = load() }
  const onStorage = (event: StorageEvent) => { if (event.key === storageKey || event.key === null) refresh() }
  onMounted(() => {
    refresh()
    window.addEventListener('storage', onStorage)
    window.addEventListener(changedEvent, refresh)
    window.addEventListener('focus', refresh)
  })
  onUnmounted(() => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(changedEvent, refresh)
    window.removeEventListener('focus', refresh)
  })
  function savePads(next: Pad[]) {
    localStorage.setItem(storageKey, JSON.stringify(next))
    pads.value = next
    window.dispatchEvent(new Event(changedEvent))
  }
  return { pads, savePads }
}
