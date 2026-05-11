<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>设备统计</h1>
      <p class="header-desc">查看代理商旗下所有店铺的设备运行状态</p>
    </div>

    <n-tabs type="line" animated style="overflow:visible;">
      <!-- Tab 1: 主机统计 -->
      <n-tab-pane name="hosts" tab="🖥️ 主机统计" style="overflow:visible;">
        <div class="metrics-grid">
          <div class="metric-card"><div class="metric-label">主机总数</div><div class="metric-value">{{ hostSummary.total }}</div><div class="metric-sub">在线 {{ hostSummary.online }} / 离线 {{ hostSummary.offline }}</div></div>
          <div class="metric-card"><div class="metric-label">平均在线率</div><div class="metric-value" :style="{color:hostSummary.avgRate>=90?'#10B981':'#F59E0B'}">{{ hostSummary.avgRate }}%</div></div>
          <div class="metric-card"><div class="metric-label">故障主机</div><div class="metric-value" :style="{color:hostSummary.fault>0?'#EF4444':'#10B981'}">{{ hostSummary.fault }}</div></div>
          <div class="metric-card"><div class="metric-label">离线店铺</div><div class="metric-value" :style="{color:hostSummary.offlineShops>0?'#F59E0B':'#10B981'}">{{ hostSummary.offlineShops }}</div></div>
        </div>
        <div class="filter-bar">
          <n-select v-model:value="hostFilterMerchant" :options="merchantOptions" placeholder="全部商家" style="width:160px;" clearable size="small" @update:value="hostFilterStore = null" />
          <n-select v-model:value="hostFilterStore" :options="hostStoreOpts" placeholder="全部店铺" style="width:150px;" size="small" :disabled="hostFilterMerchant === null" />
          <n-input v-model:value="hostFilterKeyword" placeholder="搜索店铺/主机名称" style="width:200px;" clearable size="small" />
        </div>
        <div class="table-card">
          <n-data-table :columns="hostColumns" :data="filteredHostData" :bordered="false" size="small" striped />
        </div>
      </n-tab-pane>

      <!-- Tab 2: 头显统计 -->
      <n-tab-pane name="headsets" tab="🥽 头显统计" style="overflow:visible;">
        <div class="metrics-grid">
          <div class="metric-card"><div class="metric-label">头显总数</div><div class="metric-value">{{ hsSummary.total }}</div><div class="metric-sub">在线 {{ hsSummary.online }} / 空闲 {{ hsSummary.idle }}</div></div>
          <div class="metric-card"><div class="metric-label">在线率</div><div class="metric-value" :style="{color:hsSummary.rate>=85?'#10B981':'#F59E0B'}">{{ hsSummary.rate }}%</div></div>
          <div class="metric-card"><div class="metric-label">低电量预警</div><div class="metric-value" :style="{color:hsSummary.lowBattery>0?'#EF4444':'#10B981'}">{{ hsSummary.lowBattery }} 台</div></div>
          <div class="metric-card"><div class="metric-label">绑定率</div><div class="metric-value" style="color:#6366f1">{{ hsSummary.boundRate }}%</div></div>
        </div>
        <div class="filter-bar">
          <n-select v-model:value="hsFilterMerchant" :options="merchantOptions" placeholder="全部商家" style="width:160px;" clearable size="small" @update:value="hsFilterStore = null" />
          <n-select v-model:value="hsFilterStore" :options="hsStoreOpts" placeholder="全部店铺" style="width:150px;" size="small" :disabled="hsFilterMerchant === null" />
          <n-select v-model:value="hsFilterStatus" :options="hsStatusOpts" placeholder="全部状态" style="width:120px;" clearable size="small" />
          <n-input v-model:value="hsFilterKeyword" placeholder="搜索头显名称/SN码" style="width:200px;" clearable size="small" />
        </div>
        <div class="table-card">
          <n-data-table :columns="hsColumns" :data="filteredHsData" :bordered="false" size="small" striped />
        </div>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup lang="ts">
import { h, ref, computed } from 'vue'
import { NDataTable, NTag, NSelect, NInput, NIcon, NTabs, NTabPane } from 'naive-ui'
import { StorefrontOutline, CheckmarkCircleOutline, AlertCircleOutline, HardwareChipOutline, SearchOutline } from '@vicons/ionicons5'

// ─── 公共 ──────────────────────────────────────────
const merchantNames = ['恒然集团', '南山科创', '宝安体验', '龙岗欢乐', '东莞松山湖', '幻影星空', '利民街']
const merchantStoreMap: Record<string, string[]> = {
  '恒然集团': ['深圳福田旗舰店', '南山科技园店'], '南山科创': ['南山科创店'], '宝安体验': ['宝安体验中心'],
  '龙岗欢乐': ['龙岗欢乐时光'], '东莞松山湖': ['东莞松山湖店'], '幻影星空': ['广州天河店', '广州番禺店'], '利民街': ['利民街小展厅', '利民街大展厅'],
}
const merchantOptions = computed(() => merchantNames.map(m => ({ label: m, value: m })))

// ─── 主机统计 ─────────────────────────────────────
interface HostStat { merchant: string; shop: string; hostName: string; serial: string; macAddress: string; status: string; cpu: number; mem: number; bound: number; lastHb: string }
const hostData = ref<HostStat[]>([
  { merchant: '恒然集团', shop: '深圳福田旗舰店', hostName: '主机 #01', serial: 'PCT-001', macAddress: '00:1A:2B:01:07:0D', status: 'online', cpu: 32, mem: 55, bound: 3, lastHb: '2026-05-08 11:40:00' },
  { merchant: '恒然集团', shop: '深圳福田旗舰店', hostName: '主机 #02', serial: 'PCT-002', macAddress: '00:1A:2B:02:0E:1A', status: 'online', cpu: 78, mem: 82, bound: 2, lastHb: '2026-05-08 11:39:20' },
  { merchant: '恒然集团', shop: '南山科技园店', hostName: '主机 #03', serial: 'PCT-003', macAddress: '00:1A:2B:03:15:27', status: 'online', cpu: 15, mem: 30, bound: 2, lastHb: '2026-05-08 11:38:45' },
  { merchant: '南山科创', shop: '南山科创店', hostName: '主机 #04', serial: 'PCT-004', macAddress: '00:1A:2B:04:1C:34', status: 'offline', cpu: 0, mem: 0, bound: 0, lastHb: '2026-05-07 22:10:30' },
  { merchant: '宝安体验', shop: '宝安体验中心', hostName: '主机 #05', serial: 'PCT-005', macAddress: '00:1A:2B:05:23:41', status: 'online', cpu: 45, mem: 60, bound: 1, lastHb: '2026-05-08 11:35:00' },
  { merchant: '幻影星空', shop: '广州天河店', hostName: '主机 #06', serial: 'PCT-006', macAddress: '00:1A:2B:06:2A:4E', status: 'fault', cpu: 0, mem: 0, bound: 0, lastHb: '2026-05-07 15:20:00' },
  { merchant: '利民街', shop: '利民街小展厅', hostName: '主机 #07', serial: 'PCT-007', macAddress: '00:1A:2B:07:31:5B', status: 'online', cpu: 22, mem: 45, bound: 2, lastHb: '2026-05-08 11:37:00' },
  { merchant: '利民街', shop: '利民街大展厅', hostName: '主机 #08', serial: 'PCT-008', macAddress: '00:1A:2B:08:38:68', status: 'online', cpu: 55, mem: 70, bound: 1, lastHb: '2026-05-08 11:33:20' },
])

const hostFilterMerchant = ref<string | null>(null); const hostFilterStore = ref<string | null>(null); const hostFilterKeyword = ref('')
const hostStoreOpts = computed(() => {
  if (!hostFilterMerchant.value) return []
  return (merchantStoreMap[hostFilterMerchant.value] || []).map(s => ({ label: s, value: s }))
})
const filteredHostData = computed(() => {
  let d = hostData.value
  if (hostFilterMerchant.value) d = d.filter(i => i.merchant === hostFilterMerchant.value)
  if (hostFilterStore.value) d = d.filter(i => i.shop === hostFilterStore.value)
  if (hostFilterKeyword.value) { const kw = hostFilterKeyword.value.toLowerCase(); d = d.filter(i => i.shop.includes(kw) || i.hostName.includes(kw)) }
  return d
})
const hostSummary = computed(() => {
  const all = hostData.value; const total = all.length; const online = all.filter(d => d.status === 'online').length; const offline = all.filter(d => d.status === 'offline').length; const fault = all.filter(d => d.status === 'fault').length
  const rates = all.filter(d => d.status === 'online'); const avgCpu = rates.length ? Math.round(rates.reduce((s,d) => s+d.cpu, 0) / rates.length) : 0
  const offlineShops = new Set(all.filter(d => d.status === 'offline' || d.status === 'fault').map(d => d.shop)).size
  return { total, online, offline, fault, avgRate: total ? Math.round(online / total * 100) : 0, avgCpu, offlineShops }
})

const hostStatusRender = (s: string) => { const m: Record<string,any> = { online:{type:'success',label:'在线'}, offline:{type:'default',label:'离线'}, fault:{type:'warning',label:'故障'} }; return h(NTag, { size:'small', type: m[s]?.type }, { default: () => m[s]?.label }) }
const hostColumns = [
  { title: '商家', key: 'merchant', minWidth: 100 }, { title: '店铺', key: 'shop', minWidth: 130 }, { title: '主机名称', key: 'hostName', minWidth: 100 },
  { title: '编号', key: 'serial', width: 90 },
  { title: 'MAC 地址', key: 'macAddress', width: 140, render: (row: any) => h('span', { style: 'font-family:monospace;font-size:11px;color:#6366f1;' }, row.macAddress) },
  { title: '状态', key: 'status', width: 70, align:'center' as const, render: (row: any) => hostStatusRender(row.status) },
  { title: 'CPU', key: 'cpu', width: 70, align:'center' as const, render: (row: any) => row.cpu ? h('span', { style: `color:${row.cpu>80?'#EF4444':row.cpu>60?'#F59E0B':'#10B981'};font-weight:600` }, `${row.cpu}%`) : '--' },
  { title: '内存', key: 'mem', width: 70, align:'center' as const, render: (row: any) => row.mem ? h('span', { style: `color:${row.mem>80?'#EF4444':row.mem>60?'#F59E0B':'#10B981'};font-weight:600` }, `${row.mem}%`) : '--' },
  { title: '绑定头显', key: 'bound', width: 80, align:'center' as const },
  { title: '最后心跳', key: 'lastHb', minWidth: 150 },
]

// ─── 头显统计 ─────────────────────────────────────
interface HsStat { merchant: string; shop: string; hsName: string; sn: string; model: string; status: string; battery: number; boundHost: string; lastHb: string }
const hsData = ref<HsStat[]>([
  { merchant: '恒然集团', shop: '深圳福田旗舰店', hsName: 'Pico 4 Pro #01', sn: 'SN100001A', model: 'Pico 4 Pro', status: 'in_use', battery: 85, boundHost: '主机 #01', lastHb: '2026-05-08 11:39:50' },
  { merchant: '恒然集团', shop: '深圳福田旗舰店', hsName: 'Pico 4 Pro #02', sn: 'SN100002B', model: 'Pico 4 Pro', status: 'idle', battery: 65, boundHost: '主机 #01', lastHb: '2026-05-08 11:38:20' },
  { merchant: '恒然集团', shop: '深圳福田旗舰店', hsName: 'Meta Quest 3 #01', sn: 'SN200001A', model: 'Meta Quest 3', status: 'charging', battery: 30, boundHost: '主机 #01', lastHb: '2026-05-08 11:30:00' },
  { merchant: '恒然集团', shop: '南山科技园店', hsName: 'Pico 4 #01', sn: 'SN100003C', model: 'Pico 4', status: 'in_use', battery: 72, boundHost: '主机 #03', lastHb: '2026-05-08 11:38:45' },
  { merchant: '南山科创', shop: '南山科创店', hsName: 'Pico Neo 3 #01', sn: 'SN300001A', model: 'Pico Neo 3', status: 'offline', battery: 0, boundHost: '--', lastHb: '2026-05-07 22:10:30' },
  { merchant: '幻影星空', shop: '广州天河店', hsName: 'Pico 4 Pro #03', sn: 'SN100005E', model: 'Pico 4 Pro', status: 'fault', battery: 0, boundHost: '--', lastHb: '2026-05-07 15:20:00' },
  { merchant: '利民街', shop: '利民街小展厅', hsName: 'Pico 4 #02', sn: 'SN100004D', model: 'Pico 4', status: 'idle', battery: 92, boundHost: '主机 #07', lastHb: '2026-05-08 11:37:00' },
  { merchant: '利民街', shop: '利民街大展厅', hsName: 'Pico 4 Ultra #01', sn: 'SN400001A', model: 'Pico 4 Ultra', status: 'idle', battery: 78, boundHost: '主机 #08', lastHb: '2026-05-08 11:33:20' },
])

const hsFilterMerchant = ref<string | null>(null); const hsFilterStore = ref<string | null>(null); const hsFilterStatus = ref<string | null>(null); const hsFilterKeyword = ref('')
const hsStatusOpts = [{ label: '空闲', value: 'idle' }, { label: '使用中', value: 'in_use' }, { label: '充电', value: 'charging' }, { label: '离线', value: 'offline' }, { label: '故障', value: 'fault' }]
const hsStoreOpts = computed(() => {
  if (!hsFilterMerchant.value) return []
  return (merchantStoreMap[hsFilterMerchant.value] || []).map(s => ({ label: s, value: s }))
})
const filteredHsData = computed(() => {
  let d = hsData.value
  if (hsFilterMerchant.value) d = d.filter(i => i.merchant === hsFilterMerchant.value)
  if (hsFilterStore.value) d = d.filter(i => i.shop === hsFilterStore.value)
  if (hsFilterStatus.value) d = d.filter(i => i.status === hsFilterStatus.value)
  if (hsFilterKeyword.value) { const kw = hsFilterKeyword.value.toLowerCase(); d = d.filter(i => i.hsName.includes(kw) || i.sn.toLowerCase().includes(kw)) }
  return d
})
const hsSummary = computed(() => {
  const all = hsData.value; const total = all.length; const online = all.filter(d => d.status !== 'offline' && d.status !== 'fault').length; const idle = all.filter(d => d.status === 'idle').length
  const lowBattery = all.filter(d => d.battery > 0 && d.battery < 30).length; const bound = all.filter(d => d.boundHost !== '--').length
  return { total, online, idle, rate: total ? Math.round(online / total * 100) : 0, lowBattery, boundRate: total ? Math.round(bound / total * 100) : 0 }
})

const hsStatusRender = (s: string) => { const m: Record<string,any> = { idle:{type:'info',label:'空闲'}, in_use:{type:'success',label:'使用中'}, charging:{type:'warning',label:'充电'}, offline:{type:'default',label:'离线'}, fault:{type:'error',label:'故障'} }; return h(NTag, { size:'small', type: m[s]?.type }, { default: () => m[s]?.label }) }
const batteryRender = (v: number) => {
  if (v === 0) return h('span', { style:'color:#94a3b8;font-size:12px;' }, '--')
  const color = v > 50 ? '#10B981' : v > 20 ? '#F59E0B' : '#EF4444'
  return h('div', { style:'display:flex;align-items:center;gap:4px;' }, [
    h('div', { style: 'width:36px;height:6px;background:#e8e8e8;border-radius:3px;overflow:hidden;' }, [h('div', { style: `width:${v}%;height:100%;background:${color};border-radius:3px;` })]),
    h('span', { style: `font-size:11px;color:${color};font-weight:600;` }, `${v}%`),
  ])
}
const hsColumns = [
  { title: '商家', key: 'merchant', minWidth: 100 }, { title: '店铺', key: 'shop', minWidth: 130 },
  { title: '头显名称', key: 'hsName', minWidth: 130 }, { title: 'SN 码', key: 'sn', width: 100 },
  { title: '型号', key: 'model', width: 100 }, { title: '状态', key: 'status', width: 70, align:'center' as const, render: (row: any) => hsStatusRender(row.status) },
  { title: '电量', key: 'battery', width: 70, render: (row: any) => batteryRender(row.battery) },
  { title: '绑定主机', key: 'boundHost', width: 90, align:'center' as const },
  { title: '最后心跳', key: 'lastHb', minWidth: 150 },
]
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.header-desc { font-size: 13px; color: var(--text-muted); margin-top: 4px; display: block; }
.metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.metric-card { background: white; border-radius: 14px; padding: 18px 20px; border: 1px solid var(--border-color); }
.metric-label { font-size: 12px; color: var(--text-muted); margin-bottom: 4px; }
.metric-value { font-family: 'Orbitron', sans-serif; font-size: 22px; font-weight: 700; color: var(--text-primary); }
.metric-sub { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
.filter-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; position: relative; z-index: 1; }
.table-card { background: white; border-radius: 16px; padding: 20px; border: 1px solid var(--border-color); }
</style>
