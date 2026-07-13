<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">设备运行总览</h1>
    </div>

    <n-tabs type="line" animated style="overflow:visible;">

      <!-- ========== Tab 1: 主机监控 ========== -->
      <n-tab-pane name="hosts" tab="🖥️ 主机监控" style="overflow:visible;">
        <div class="metrics-grid">
          <div class="metric-card"><div class="metric-label">主机总数</div><div class="metric-value">{{ hostSummary.total }}</div><div class="metric-sub">在线 {{ hostSummary.online }} / 离线 {{ hostSummary.offline }}</div></div>
          <div class="metric-card"><div class="metric-label">今日核销次数</div><div class="metric-value" style="color:#6366f1">{{ hostSummary.dailyVerifyCount }}</div></div>
          <div class="metric-card"><div class="metric-label">今日核销金额</div><div class="metric-value" style="color:#10B981">¥{{ hostSummary.dailyAmount.toLocaleString() }}</div></div>
          <div class="metric-card"><div class="metric-label">平均在线率</div><div class="metric-value" :style="{color:hostSummary.avgRate>=90?'#10B981':'#F59E0B'}">{{ hostSummary.avgRate }}%</div><div class="metric-sub">故障主机 {{ hostSummary.fault }}</div></div>
        </div>
        <div class="filter-bar">
          <n-select v-model:value="hostFilterMerchant" :options="merchantOpts" placeholder="全部商家" style="width:150px;" clearable size="small" @update:value="hostFilterStore = null" />
          <n-select v-model:value="hostFilterStore" :options="hostStoreOpts" placeholder="全部店铺" style="width:150px;" size="small" :disabled="hostFilterMerchant === null" />
          <n-input v-model:value="hostFilterKeyword" placeholder="搜索主机名称" style="width:180px;" clearable size="small" />
        </div>
        <div class="table-card">
          <n-data-table :columns="hostMonitorColumns" :data="filteredHostMonitor" :bordered="false" :single-line="false" size="small" striped />
        </div>
      </n-tab-pane>

      <!-- ========== Tab 2: 头显监控 ========== -->
      <n-tab-pane name="headsets" tab="🥽 头显监控" style="overflow:visible;">
        <div class="metrics-grid">
          <div class="metric-card"><div class="metric-label">头显总数</div><div class="metric-value">{{ hsSummary.total }}</div><div class="metric-sub">使用中 {{ hsSummary.inUse }} / 空闲 {{ hsSummary.idle }}</div></div>
          <div class="metric-card"><div class="metric-label">在线头显</div><div class="metric-value" :style="{color:hsSummary.onlineRate>=85?'#10B981':'#F59E0B'}">{{ hsSummary.onlineRate }}%</div></div>
          <div class="metric-card"><div class="metric-label">低电量预警</div><div class="metric-value" :style="{color:hsSummary.lowBattery>0?'#EF4444':'#10B981'}">{{ hsSummary.lowBattery }} 台</div></div>
          <div class="metric-card"><div class="metric-label">已绑定主机</div><div class="metric-value" style="color:#6366f1">{{ hsSummary.boundRate }}%</div></div>
        </div>
        <div class="filter-bar">
          <n-select v-model:value="hsFilterMerchant" :options="merchantOpts" placeholder="全部商家" style="width:150px;" clearable size="small" @update:value="hsFilterStore = null" />
          <n-select v-model:value="hsFilterStore" :options="hsStoreOpts" placeholder="全部店铺" style="width:150px;" size="small" :disabled="hsFilterMerchant === null" />
          <n-select v-model:value="hsFilterStatus" :options="hsStatusOpts" placeholder="全部状态" style="width:130px;" clearable size="small" />
          <n-input v-model:value="hsFilterKeyword" placeholder="搜索头显名称/SN码" style="width:200px;" clearable size="small" />
        </div>
        <div class="table-card">
          <n-data-table :columns="hsMonitorColumns" :data="filteredHsMonitor" :bordered="false" :single-line="false" size="small" striped />
        </div>
      </n-tab-pane>

    </n-tabs>
  </div>
</template>

<script setup lang="ts">
import { h, ref, computed } from 'vue'
import { NDataTable, NTag, NSelect, NTabs, NTabPane, NInput, NTooltip } from 'naive-ui'

// ─── 公共数据 ──────────────────────────────────────
const merchantNames = ['恒然集团', '利民街商家', '党建馆集团', '华东展厅', '卓远科技']
const merchantOpts = computed(() => merchantNames.map(m => ({ label: m, value: m })))

// ─── 主机监控数据 ─────────────────────────────────
interface HostMonitor {
  merchant: string
  store: string
  hostName: string
  serialNo: string
  status: 'online' | 'offline' | 'fault'
  cpu: number
  mem: number
  disk: number
  uptime: string
  boundHeadsetCount: number
  lastHeartbeat: string
  dailyVerifyCount: number
  dailyAmount: number
  playHours: number
  onlineRate: number
  exceptionCount: number
  faultCount: number
  replayRate: number
  cardLeadCount: number
  topContent: string
}
const hostMonitorData = ref<HostMonitor[]>([
  { merchant: '恒然集团', store: '恒然科技园店', hostName: '主机 #01', serialNo: 'PCT-001', status: 'online', cpu: 32, mem: 55, disk: 68, uptime: '7d 12h', boundHeadsetCount: 3, lastHeartbeat: '2026-05-08 09:30:00', dailyVerifyCount: 42, dailyAmount: 5960, playHours: 28.6, onlineRate: 96, exceptionCount: 1, faultCount: 0, replayRate: 24, cardLeadCount: 3, topContent: '星际探险' },
  { merchant: '恒然集团', store: '恒然科技园店', hostName: '主机 #02', serialNo: 'PCT-002', status: 'online', cpu: 78, mem: 82, disk: 72, uptime: '3d 05h', boundHeadsetCount: 2, lastHeartbeat: '2026-05-08 09:29:45', dailyVerifyCount: 31, dailyAmount: 4280, playHours: 19.4, onlineRate: 91, exceptionCount: 2, faultCount: 0, replayRate: 18, cardLeadCount: 2, topContent: '深海潜水' },
  { merchant: '恒然集团', store: '恒然分部展厅', hostName: '主机 #03', serialNo: 'PCT-003', status: 'online', cpu: 15, mem: 30, disk: 45, uptime: '15d 08h', boundHeadsetCount: 2, lastHeartbeat: '2026-05-08 09:28:20', dailyVerifyCount: 26, dailyAmount: 3260, playHours: 18.2, onlineRate: 94, exceptionCount: 1, faultCount: 0, replayRate: 16, cardLeadCount: 1, topContent: '节奏光剑' },
  { merchant: '利民街商家', store: '利民街小展厅', hostName: '主机 #04', serialNo: 'PCT-004', status: 'offline', cpu: 0, mem: 0, disk: 0, uptime: '--', boundHeadsetCount: 0, lastHeartbeat: '2026-05-07 18:00:00', dailyVerifyCount: 0, dailyAmount: 0, playHours: 0, onlineRate: 0, exceptionCount: 0, faultCount: 1, replayRate: 0, cardLeadCount: 0, topContent: '--' },
  { merchant: '利民街商家', store: '利民街小展厅', hostName: '主机 #05', serialNo: 'PCT-005', status: 'online', cpu: 45, mem: 60, disk: 55, uptime: '10d 03h', boundHeadsetCount: 1, lastHeartbeat: '2026-05-08 09:27:55', dailyVerifyCount: 48, dailyAmount: 7280, playHours: 31.4, onlineRate: 97, exceptionCount: 2, faultCount: 0, replayRate: 29, cardLeadCount: 4, topContent: '急速森林(飞碟)' },
  { merchant: '卓远科技', store: '卓远萧山区店', hostName: '主机 #06', serialNo: 'PCT-006', status: 'fault', cpu: 0, mem: 0, disk: 0, uptime: '--', boundHeadsetCount: 0, lastHeartbeat: '2026-05-06 14:30:00', dailyVerifyCount: 8, dailyAmount: 760, playHours: 4.1, onlineRate: 42, exceptionCount: 4, faultCount: 2, replayRate: 6, cardLeadCount: 0, topContent: '极限滑雪' },
  { merchant: '党建馆集团', store: '党建馆', hostName: '主机 #07', serialNo: 'PCT-007', status: 'online', cpu: 22, mem: 45, disk: 60, uptime: '20d 01h', boundHeadsetCount: 2, lastHeartbeat: '2026-05-08 09:26:40', dailyVerifyCount: 22, dailyAmount: 2860, playHours: 15.5, onlineRate: 90, exceptionCount: 1, faultCount: 0, replayRate: 12, cardLeadCount: 1, topContent: '红色征程VR' },
])

const hostSummary = computed(() => {
	  const all = hostMonitorData.value; const total = all.length; const online = all.filter(d => d.status === 'online').length; const offline = all.filter(d => d.status === 'offline').length; const fault = all.filter(d => d.status === 'fault').length
	  const dailyVerifyCount = all.reduce((s, d) => s + d.dailyVerifyCount, 0)
	  const dailyAmount = all.reduce((s, d) => s + d.dailyAmount, 0)
	  const avgOnlineRate = total ? Math.round(all.reduce((s, d) => s + d.onlineRate, 0) / total) : 0
	  return { total, online, offline, fault, avgRate: avgOnlineRate, dailyVerifyCount, dailyAmount }
	})

const hostFilterMerchant = ref<string | null>(null); const hostFilterStore = ref<string | null>(null); const hostFilterKeyword = ref('')
const hostStoreOpts = computed(() => {
  if (!hostFilterMerchant.value) return []
  return [...new Set(hostMonitorData.value.filter(i => i.merchant === hostFilterMerchant.value).map(i => i.store))].map(s => ({ label: s, value: s }))
})
const filteredHostMonitor = computed(() => {
  let d = hostMonitorData.value
  if (hostFilterMerchant.value) d = d.filter(i => i.merchant === hostFilterMerchant.value)
  if (hostFilterStore.value) d = d.filter(i => i.store === hostFilterStore.value)
  if (hostFilterKeyword.value) { const kw = hostFilterKeyword.value.toLowerCase(); d = d.filter(i => i.hostName.toLowerCase().includes(kw) || i.serialNo.toLowerCase().includes(kw)) }
  return d
})

const statusRender = (s: string) => { const m: Record<string,any> = { online:{type:'success',label:'在线'}, offline:{type:'default',label:'离线'}, fault:{type:'warning',label:'故障'} }; return h(NTag, { size:'small', type: m[s]?.type }, { default: () => m[s]?.label }) }
const columnTip = (label: string, tip: string) => h(NTooltip, { trigger: 'hover' }, {
  trigger: () => h('span', { style: 'cursor: help; border-bottom: 1px dotted #94a3b8;' }, label),
  default: () => tip,
})
const hostMonitorColumns = [
  { title: '商家', key: 'merchant', minWidth: 100 }, { title: '店铺', key: 'store', minWidth: 130 }, { title: '主机名称', key: 'hostName', minWidth: 100 },
  { title: '编号', key: 'serialNo', width: 90 }, { title: '状态', key: 'status', width: 70, align:'center' as const, render: (row: any) => statusRender(row.status) },
  { title: '今日核销', key: 'dailyVerifyCount', width: 90, align:'center' as const },
  { title: '核销金额', key: 'dailyAmount', width: 100, align:'center' as const, render: (row: any) => `¥${row.dailyAmount.toLocaleString()}` },
  { title: () => columnTip('体验时长', '统计周期内用户实际游玩 Session 累计时长，用于设备经营效率分析。'), key: 'playHours', width: 90, align:'center' as const, render: (row: any) => `${row.playHours}h` },
  { title: () => columnTip('在线率', '统计周期内主机在线时长 / 门店营业时长或应在线时长。'), key: 'onlineRate', width: 80, align:'center' as const, render: (row: any) => `${row.onlineRate}%` },
  { title: '复玩率', key: 'replayRate', width: 80, align:'center' as const, render: (row: any) => `${row.replayRate}%` },
  { title: '带动办卡', key: 'cardLeadCount', width: 90, align:'center' as const, render: (row: any) => `${row.cardLeadCount}人` },
  { title: '异常', key: 'exceptionCount', width: 70, align:'center' as const },
  { title: '故障', key: 'faultCount', width: 70, align:'center' as const },
  { title: 'Top内容', key: 'topContent', minWidth: 130 },
  { title: () => columnTip('运行时长', '主机自最近一次启动或上线后的连续运行时长，重启后重新计算。'), key: 'uptime', width: 90 }, { title: '绑定头显', key: 'boundHeadsetCount', width: 80, align:'center' as const },
  { title: '最后心跳', key: 'lastHeartbeat', minWidth: 150 },
]

// ─── 头显监控数据 ─────────────────────────────────
interface HsMonitor { merchant: string; store: string; hsName: string; sn: string; model: string; status: string; battery: number; boundHost: string; firmware: string; lastHeartbeat: string }
const hsMonitorData = ref<HsMonitor[]>([
  { merchant: '恒然集团', store: '恒然科技园店', hsName: 'Pico 4 Pro #01', sn: 'SN100001A', model: 'Pico 4 Pro', status: 'in_use', battery: 85, boundHost: '主机 #01', firmware: 'v5.4.1', lastHeartbeat: '2026-05-08 09:29:50' },
  { merchant: '恒然集团', store: '恒然科技园店', hsName: 'Pico 4 Pro #02', sn: 'SN100002B', model: 'Pico 4 Pro', status: 'idle', battery: 65, boundHost: '主机 #01', firmware: 'v5.4.1', lastHeartbeat: '2026-05-08 09:28:10' },
  { merchant: '恒然集团', store: '恒然科技园店', hsName: 'Meta Quest 3 #01', sn: 'SN200001A', model: 'Meta Quest 3', status: 'charging', battery: 30, boundHost: '主机 #01', firmware: 'v72.0', lastHeartbeat: '2026-05-08 08:50:00' },
  { merchant: '恒然集团', store: '恒然分部展厅', hsName: 'Pico 4 #01', sn: 'SN100003C', model: 'Pico 4', status: 'in_use', battery: 72, boundHost: '主机 #03', firmware: 'v5.4.1', lastHeartbeat: '2026-05-08 09:28:15' },
  { merchant: '利民街商家', store: '利民街小展厅', hsName: 'Pico Neo 3 #01', sn: 'SN300001A', model: 'Pico Neo 3', status: 'offline', battery: 0, boundHost: '--', firmware: 'v4.8.0', lastHeartbeat: '2026-05-07 18:00:00' },
  { merchant: '利民街商家', store: '利民街小展厅', hsName: 'Pico 4 #02', sn: 'SN100004D', model: 'Pico 4', status: 'idle', battery: 92, boundHost: '主机 #05', firmware: 'v5.3.0', lastHeartbeat: '2026-05-08 09:27:50' },
  { merchant: '卓远科技', store: '卓远萧山区店', hsName: 'Pico 4 Pro #03', sn: 'SN100005E', model: 'Pico 4 Pro', status: 'fault', battery: 0, boundHost: '主机 #06', firmware: 'v5.4.1', lastHeartbeat: '2026-05-06 14:30:00' },
])

const hsSummary = computed(() => {
  const all = hsMonitorData.value; const total = all.length; const inUse = all.filter(d => d.status === 'in_use').length; const idle = all.filter(d => d.status === 'idle').length
  const online = all.filter(d => d.status !== 'offline' && d.status !== 'fault').length; const lowBattery = all.filter(d => d.battery > 0 && d.battery < 30).length
  const bound = all.filter(d => d.boundHost !== '--').length
  return { total, inUse, idle, onlineRate: total ? Math.round(online / total * 100) : 0, lowBattery, boundRate: total ? Math.round(bound / total * 100) : 0 }
})

const hsFilterMerchant = ref<string | null>(null); const hsFilterStore = ref<string | null>(null); const hsFilterStatus = ref<string | null>(null); const hsFilterKeyword = ref('')
const hsStatusOpts = [{ label: '空闲', value: 'idle' }, { label: '使用中', value: 'in_use' }, { label: '充电', value: 'charging' }, { label: '离线', value: 'offline' }, { label: '故障', value: 'fault' }]
const hsStoreOpts = computed(() => {
  if (!hsFilterMerchant.value) return []
  return [...new Set(hsMonitorData.value.filter(i => i.merchant === hsFilterMerchant.value).map(i => i.store))].map(s => ({ label: s, value: s }))
})
const filteredHsMonitor = computed(() => {
  let d = hsMonitorData.value
  if (hsFilterMerchant.value) d = d.filter(i => i.merchant === hsFilterMerchant.value)
  if (hsFilterStore.value) d = d.filter(i => i.store === hsFilterStore.value)
  if (hsFilterStatus.value) d = d.filter(i => i.status === hsFilterStatus.value)
  if (hsFilterKeyword.value) { const kw = hsFilterKeyword.value.toLowerCase(); d = d.filter(i => i.hsName.toLowerCase().includes(kw) || i.sn.toLowerCase().includes(kw)) }
  return d
})

const hsStatusRender = (s: string) => { const m: Record<string,any> = { idle:{type:'info',label:'空闲'}, in_use:{type:'success',label:'使用中'}, charging:{type:'warning',label:'充电'}, offline:{type:'default',label:'离线'}, fault:{type:'error',label:'故障'} }; return h(NTag, { size:'small', type: m[s]?.type }, { default: () => m[s]?.label }) }
const batteryRender = (v: number) => {
  if (v === 0) return h('span', { style:'color:#94a3b8;font-size:12px;' }, '--')
  const color = v > 50 ? '#10B981' : v > 20 ? '#F59E0B' : '#EF4444'
  return h('div', { style:'display:flex;align-items:center;gap:4px;' }, [
    h('div', { style: `width:36px;height:6px;background:#e8e8e8;border-radius:3px;overflow:hidden;` }, [h('div', { style: `width:${v}%;height:100%;background:${color};border-radius:3px;` })]),
    h('span', { style: `font-size:11px;color:${color};font-weight:600;` }, `${v}%`),
  ])
}

const hsMonitorColumns = [
  { title: '商家', key: 'merchant', minWidth: 100 }, { title: '店铺', key: 'store', minWidth: 130 },
  { title: '头显名称', key: 'hsName', minWidth: 140 }, { title: 'SN 码', key: 'sn', width: 110 },
  { title: '型号', key: 'model', width: 110 }, { title: '状态', key: 'status', width: 80, align:'center' as const, render: (row: any) => hsStatusRender(row.status) },
  { title: '电量', key: 'battery', width: 80, render: (row: any) => batteryRender(row.battery) },
  { title: '绑定主机', key: 'boundHost', width: 100, align:'center' as const },
  { title: '固件', key: 'firmware', width: 80 }, { title: '最后心跳', key: 'lastHeartbeat', minWidth: 150 },
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
.filter-bar { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; position:relative; z-index:1; }
.table-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid var(--border-color); }
</style>
