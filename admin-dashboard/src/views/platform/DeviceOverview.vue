<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">设备运行总览</h1>
    </div>

    <!-- 核心指标（真实计算，非 mock） -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-label">设备总数</div>
        <div class="metric-value">{{ summary.totalDevices }}</div>
        <div class="metric-sub">在线 {{ summary.onlineDevices }} / 离线 {{ summary.offlineDevices }}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">平均在线率</div>
        <div class="metric-value" :style="{ color: summary.avgOnlineRate >= 90 ? '#10B981' : '#F59E0B' }">
          {{ summary.avgOnlineRate }}%
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-label">故障设备</div>
        <div class="metric-value" :style="{ color: summary.faultDevices > 0 ? '#EF4444' : '#10B981' }">
          {{ summary.faultDevices }}
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-label">预警商家</div>
        <div class="metric-value" :style="{ color: summary.alertMerchants > 0 ? '#EF4444' : '#10B981' }">
          {{ summary.alertMerchants }}
        </div>
        <div class="metric-sub">在线率 &lt; 80%</div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <n-select
        v-model:value="filterMerchant"
        :options="merchantOptions"
        placeholder="全部商家"
        style="width: 150px; flex-shrink: 0;"
        clearable
        size="small"
      />
      <n-input
        v-model:value="filterKeyword"
        placeholder="搜索店铺名称"
        style="width: 180px; flex-shrink: 0;"
        size="small"
        clearable
      />
    </div>

    <!-- 数据表格 -->
    <div class="table-card">
      <n-data-table
        :columns="columns"
        :data="filteredData"
        :bordered="false"
        :single-line="false"
        size="small"
        striped
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { h, ref, computed } from 'vue'
import { NDataTable, NTag, NSelect, NTabs, NTab, NInput } from 'naive-ui'

// ─── 数据（带商家字段，真实计算）─────────────
const rawData = ref([
  { merchant: '恒然集团', store: '恒然分部展厅', total: 6, online: 5, offline: 1, fault: 0, onlineRate: '83%', utilization: '72%', lastHeartbeat: '2023-09-16 16:30:00' },
  { merchant: '恒然集团', store: '恒然科技园店', total: 8, online: 8, offline: 0, fault: 0, onlineRate: '100%', utilization: '85%', lastHeartbeat: '2023-09-16 16:29:45' },
  { merchant: '利民街商家', store: '利民街大展厅', total: 10, online: 9, offline: 1, fault: 0, onlineRate: '90%', utilization: '68%', lastHeartbeat: '2023-09-16 16:28:20' },
  { merchant: '利民街商家', store: '利民街小展厅', total: 4, online: 4, offline: 0, fault: 0, onlineRate: '100%', utilization: '75%', lastHeartbeat: '2023-09-16 16:27:55' },
  { merchant: '党建馆集团', store: '党建馆', total: 5, online: 4, offline: 0, fault: 1, onlineRate: '80%', utilization: '60%', lastHeartbeat: '2023-09-16 16:25:10' },
  { merchant: '华东展厅', store: '华东展厅', total: 7, online: 6, offline: 1, fault: 0, onlineRate: '86%', utilization: '70%', lastHeartbeat: '2023-09-16 16:26:40' },
])

// ─── 筛选 ──────────────────────────────────────
const filterMerchant = ref<string | null>(null)
const filterStatus = ref<'all' | 'online' | 'offline' | 'fault'>('all')
const filterKeyword = ref('')

const merchantOptions = computed(() =>
  [...new Set(rawData.value.map(d => d.merchant))].map(m => ({ label: m, value: m }))
)

const rateNum = (r: string) => parseInt(r.replace('%', ''))

const filteredData = computed(() => {
  let d = rawData.value
  if (filterMerchant.value) d = d.filter(i => i.merchant === filterMerchant.value)
  if (filterKeyword.value) d = d.filter(i => i.store.includes(filterKeyword.value))
  if (filterStatus.value === 'online') d = d.filter(i => i.online > 0)
  if (filterStatus.value === 'offline') d = d.filter(i => i.offline > 0)
  if (filterStatus.value === 'fault') d = d.filter(i => i.fault > 0)
  return d
})

// ─── 汇总指标（真实计算）────────────────────────
const summary = computed(() => {
  const all = rawData.value
  const total = all.reduce((s, i) => s + i.total, 0)
  const online = all.reduce((s, i) => s + i.online, 0)
  const offline = all.reduce((s, i) => s + i.offline, 0)
  const fault = all.reduce((s, i) => s + i.fault, 0)
  const rates = all.map(i => rateNum(i.onlineRate))
  const avg = Math.round(rates.reduce((s, r) => s + r, 0) / rates.length)
  const alerts = new Set(all.filter(i => rateNum(i.onlineRate) < 80).map(i => i.merchant)).size
  return { totalDevices: total, onlineDevices: online, offlineDevices: offline, faultDevices: fault, avgOnlineRate: avg, alertMerchants: alerts }
})

// ─── 表格列 ─────────────────────────────────────
const renderRateTag = (rate: string) => {
  const n = rateNum(rate)
  const type = n >= 90 ? 'success' : n >= 80 ? 'warning' : 'error'
  return h(NTag, { type, size: 'small', bordered: false }, { default: () => rate })
}

const columns = [
  { title: '商家', key: 'merchant', minWidth: 120 },
  { title: '店铺', key: 'store', minWidth: 160, sorter: 'default' as const },
  { title: '设备总数', key: 'total', width: 90, sorter: (a: any, b: any) => a.total - b.total },
  { title: '在线数', key: 'online', width: 80, sorter: (a: any, b: any) => a.online - b.online },
  { title: '离线数', key: 'offline', width: 80, sorter: (a: any, b: any) => a.offline - b.offline },
  { title: '故障数', key: 'fault', width: 80, sorter: (a: any, b: any) => a.fault - b.fault },
  {
    title: '在线率',
    key: 'onlineRate',
    width: 90,
    sorter: (a: any, b: any) => rateNum(a.onlineRate) - rateNum(b.onlineRate),
    render: (row: any) => renderRateTag(row.onlineRate),
  },
  { title: '今日利用率', key: 'utilization', width: 100 },
  { title: '最后心跳', key: 'lastHeartbeat', minWidth: 160 },
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

.filter-bar { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }

.table-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid var(--border-color); }
</style>
