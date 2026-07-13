<template>
  <div class="page-container">
    <div class="page-header"><h1 class="page-title">设备在线统计</h1></div>

    <n-tabs type="line" animated>
      <n-tab-pane name="hosts" tab="🖥️ 主机统计">
        <div class="metrics-grid">
          <div class="metric-card"><div class="metric-label">主机总数</div><div class="metric-value">{{ hostSummary.total }}</div><div class="metric-sub">在线 {{ hostSummary.online }} / 离线 {{ hostSummary.offline }}</div></div>
          <div class="metric-card"><div class="metric-label">今日核销次数</div><div class="metric-value" style="color:#6366f1">{{ hostSummary.dailyVerifyCount }}</div></div>
          <div class="metric-card"><div class="metric-label">今日核销金额</div><div class="metric-value" style="color:#10B981">¥{{ hostSummary.dailyAmount.toLocaleString() }}</div></div>
          <div class="metric-card"><div class="metric-label">平均在线率</div><div class="metric-value" :style="{color:hostSummary.avgRate>=90?'#10B981':'#F59E0B'}">{{ hostSummary.avgRate }}%</div><div class="metric-sub">故障主机 {{ hostSummary.fault }}</div></div>
        </div>
        <div class="filter-bar">
          <n-select v-model:value="hostFilterStore" :options="hostStoreOpts" placeholder="全部店铺" style="width:150px;" clearable size="small" />
          <n-input v-model:value="hostKeyword" placeholder="搜索主机名称/编号" style="width:200px;" clearable size="small" />
        </div>
        <div class="table-card">
          <n-data-table :columns="hostColumns" :data="filteredHostData" :bordered="false" size="small" striped />
        </div>
      </n-tab-pane>

      <n-tab-pane name="headsets" tab="🥽 头显统计">
        <div class="metrics-grid">
          <div class="metric-card"><div class="metric-label">头显总数</div><div class="metric-value">{{ hsSummary.total }}</div><div class="metric-sub">在线 {{ hsSummary.online }} / 使用中 {{ hsSummary.inUse }}</div></div>
          <div class="metric-card"><div class="metric-label">在线率</div><div class="metric-value" :style="{color:hsSummary.rate>=85?'#10B981':'#F59E0B'}">{{ hsSummary.rate }}%</div></div>
          <div class="metric-card"><div class="metric-label">低电量预警</div><div class="metric-value" :style="{color:hsSummary.lowBattery>0?'#EF4444':'#10B981'}">{{ hsSummary.lowBattery }} 台</div></div>
          <div class="metric-card"><div class="metric-label">绑定率</div><div class="metric-value" style="color:#6366f1">{{ hsSummary.boundRate }}%</div></div>
        </div>
        <div class="filter-bar">
          <n-select v-model:value="hsFilterStore" :options="hsStoreOpts" placeholder="全部店铺" style="width:150px;" clearable size="small" />
          <n-select v-model:value="hsFilterStatus" :options="hsStatusOpts" placeholder="全部状态" style="width:120px;" clearable size="small" />
          <n-input v-model:value="hsKeyword" placeholder="搜索头显名称/SN码" style="width:200px;" clearable size="small" />
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
import { NDataTable, NTag, NSelect, NInput, NTabs, NTabPane, NTooltip } from 'naive-ui'

// ─── 主机 ──────────────────────────────────────────
const hostData = ref([
  { name: '主机 #01', serial: 'PCT-001', store: '利民街小展厅', status: 'online', bound: 2, uptime: '7d 12h', lastHb: '2026-05-08 09:30:00', dailyVerifyCount: 42, dailyAmount: 5960, playHours: 28.6, onlineRate: 96, exceptionCount: 1, faultCount: 0, topContent: '阿拉丁历险记4K高清版' },
  { name: '主机 #02', serial: 'PCT-002', store: '利民街小展厅', status: 'online', bound: 1, uptime: '3d 05h', lastHb: '2026-05-08 09:29:45', dailyVerifyCount: 31, dailyAmount: 4280, playHours: 19.4, onlineRate: 91, exceptionCount: 2, faultCount: 0, topContent: '勇闯恐龙谷' },
  { name: '主机 #03', serial: 'PCT-003', store: '利民街大展厅', status: 'offline', bound: 0, uptime: '--', lastHb: '2026-05-07 18:00:00', dailyVerifyCount: 0, dailyAmount: 0, playHours: 0, onlineRate: 0, exceptionCount: 0, faultCount: 1, topContent: '--' },
  { name: '主机 #04', serial: 'PCT-004', store: '卓远萝岗区店', status: 'online', bound: 2, uptime: '10d 03h', lastHb: '2026-05-08 09:28:20', dailyVerifyCount: 26, dailyAmount: 3260, playHours: 18.2, onlineRate: 94, exceptionCount: 1, faultCount: 0, topContent: '节奏光剑' },
])
const hostFilterStore = ref<string | null>(null); const hostKeyword = ref('')
const hostStoreOpts = computed(() => [...new Set(hostData.value.map(d => d.store))].filter(Boolean).map(s => ({ label: s, value: s })))
const hostSummary = computed(() => {
  const all = hostData.value; const total = all.length; const online = all.filter(d => d.status === 'online').length; const offline = all.filter(d => d.status === 'offline').length; const fault = all.filter(d => d.status === 'fault').length
  const dailyVerifyCount = all.reduce((s, d) => s + d.dailyVerifyCount, 0)
  const dailyAmount = all.reduce((s, d) => s + d.dailyAmount, 0)
  const avgRate = total ? Math.round(all.reduce((s, d) => s + d.onlineRate, 0) / total) : 0
  return { total, online, offline, fault, avgRate, dailyVerifyCount, dailyAmount }
})
const filteredHostData = computed(() => {
  let d = hostData.value
  if (hostFilterStore.value) d = d.filter(i => i.store === hostFilterStore.value)
  if (hostKeyword.value) { const kw = hostKeyword.value.toLowerCase(); d = d.filter(i => i.name.includes(kw) || i.serial.includes(kw)) }
  return d
})
const statusRender = (s: string) => { const m: Record<string,any> = { online:{type:'success',label:'在线'}, offline:{type:'default',label:'离线'}, fault:{type:'warning',label:'故障'} }; return h(NTag, { size:'small', type: m[s]?.type }, { default: () => m[s]?.label }) }
const columnTip = (label: string, tip: string) => h(NTooltip, { trigger: 'hover' }, {
  trigger: () => h('span', { style: 'cursor: help; border-bottom: 1px dotted #94a3b8;' }, label),
  default: () => tip,
})

const hostColumns = [
  { title: '主机名称', key: 'name', minWidth: 100 }, { title: '编号', key: 'serial', width: 100 }, { title: '门店', key: 'store', minWidth: 120 },
  { title: '状态', key: 'status', width: 70, align:'center' as const, render: (row: any) => statusRender(row.status) },
  { title: '今日核销', key: 'dailyVerifyCount', width: 90, align:'center' as const },
  { title: '核销金额', key: 'dailyAmount', width: 100, align:'center' as const, render: (row: any) => `¥${row.dailyAmount.toLocaleString()}` },
  { title: () => columnTip('体验时长', '统计周期内用户实际游玩 Session 累计时长，用于商家查看主机使用效率。'), key: 'playHours', width: 90, align:'center' as const, render: (row: any) => `${row.playHours}h` },
  { title: () => columnTip('在线率', '统计周期内主机在线时长 / 门店营业时长或应在线时长。'), key: 'onlineRate', width: 80, align:'center' as const, render: (row: any) => `${row.onlineRate}%` },
  { title: '异常', key: 'exceptionCount', width: 70, align:'center' as const },
  { title: '故障', key: 'faultCount', width: 70, align:'center' as const },
  { title: 'Top内容', key: 'topContent', minWidth: 130 },
  { title: () => columnTip('运行时长', '主机自最近一次启动或上线后的连续运行时长，重启后重新计算。'), key: 'uptime', width: 90 },
  { title: '绑定头显', key: 'bound', width: 80, align:'center' as const },
  { title: '最后心跳', key: 'lastHb', minWidth: 150 },
]

// ─── 头显 ──────────────────────────────────────────
const hsData = ref([
  { name: 'Pico 4 Pro #01', sn: 'SN100001A', store: '利民街小展厅', model: 'Pico 4 Pro', status: 'idle', battery: 85, bound: '主机 #01', lastHb: '2026-05-08 09:28:10' },
  { name: 'Pico 4 Pro #02', sn: 'SN100002B', store: '利民街小展厅', model: 'Pico 4 Pro', status: 'in_use', battery: 65, bound: '主机 #01', lastHb: '2026-05-08 09:29:50' },
  { name: 'Pico 4 #01', sn: 'SN100003C', store: '利民街大展厅', model: 'Pico 4', status: 'offline', battery: 0, bound: '--', lastHb: '2026-05-07 18:00:00' },
  { name: 'Meta Quest 3 #01', sn: 'SN200001A', store: '卓远萝岗区店', model: 'Meta Quest 3', status: 'idle', battery: 30, bound: '主机 #04', lastHb: '2026-05-08 08:50:00' },
  { name: 'Pico 4 #02', sn: 'SN100004D', store: '卓远萝岗区店', model: 'Pico 4', status: 'charging', battery: 72, bound: '--', lastHb: '2026-05-08 09:28:15' },
])
const hsFilterStore = ref<string | null>(null); const hsFilterStatus = ref<string | null>(null); const hsKeyword = ref('')
const hsStatusOpts = [{ label: '空闲', value: 'idle' }, { label: '使用中', value: 'in_use' }, { label: '充电', value: 'charging' }, { label: '离线', value: 'offline' }, { label: '故障', value: 'fault' }]
const hsStoreOpts = computed(() => [...new Set(hsData.value.map(d => d.store))].filter(Boolean).map(s => ({ label: s, value: s })))
const hsSummary = computed(() => {
  const all = hsData.value; const total = all.length; const online = all.filter(d => d.status !== 'offline').length; const inUse = all.filter(d => d.status === 'in_use').length; const lowBattery = all.filter(d => d.battery > 0 && d.battery < 30).length; const bound = all.filter(d => d.bound !== '--').length
  return { total, online, inUse, rate: total ? Math.round(online / total * 100) : 0, lowBattery, boundRate: total ? Math.round(bound / total * 100) : 0 }
})
const filteredHsData = computed(() => {
  let d = hsData.value
  if (hsFilterStore.value) d = d.filter(i => i.store === hsFilterStore.value)
  if (hsFilterStatus.value) d = d.filter(i => i.status === hsFilterStatus.value)
  if (hsKeyword.value) { const kw = hsKeyword.value.toLowerCase(); d = d.filter(i => i.name.includes(kw) || i.sn.includes(kw)) }
  return d
})
const hsStatusRender = (s: string) => { const m: Record<string,any> = { idle:{type:'info',label:'空闲'}, in_use:{type:'success',label:'使用中'}, charging:{type:'warning',label:'充电'}, offline:{type:'default',label:'离线'} }; return h(NTag, { size:'small', type: m[s]?.type }, { default: () => m[s]?.label }) }
const hsColumns = [
  { title: '头显名称', key: 'name', minWidth: 130 }, { title: 'SN 码', key: 'sn', width: 100 }, { title: '门店', key: 'store', minWidth: 110 },
  { title: '型号', key: 'model', width: 100 }, { title: '状态', key: 'status', width: 70, align:'center' as const, render: (row: any) => hsStatusRender(row.status) },
  { title: '电量', key: 'battery', width: 60, align:'center' as const, render: (row: any) => row.battery ? h('span', { style: `color:${row.battery>50?'#10B981':row.battery>20?'#F59E0B':'#EF4444'};font-weight:600` }, `${row.battery}%`) : '--' },
  { title: '绑定主机', key: 'bound', width: 90, align:'center' as const },
  { title: '最后心跳', key: 'lastHb', minWidth: 150 },
]
</script>

<style scoped>
.page-container { padding: 20px 24px; }
.page-header { margin-bottom: 20px; }
.page-title { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
.metric-card { background: white; border-radius: 12px; padding: 16px 20px; border: 1px solid var(--border-color); }
.metric-label { font-size: 12px; color: var(--text-muted); margin-bottom: 6px; }
.metric-value { font-family: 'Orbitron', sans-serif; font-size: 24px; font-weight: 700; color: var(--text-primary); }
.metric-sub { font-size: 11px; color: var(--text-muted); margin-top: 4px; }
.filter-bar { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; position: relative; z-index: 1; }
.table-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid var(--border-color); }
</style>
