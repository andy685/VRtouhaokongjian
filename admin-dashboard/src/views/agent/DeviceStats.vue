<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>设备统计</h1>
      <p class="header-desc">查看代理商旗下所有店铺的设备运行状态</p>
    </div>

    <!-- 核心指标 -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="HardwareChipOutline" size="20" color="#fff" />
        </div>
        <div class="metric-body">
          <div class="metric-label">设备总数</div>
          <div class="metric-value">{{ summary.totalDevices }}</div>
          <div class="metric-sub">在线 {{ summary.onlineDevices }} 台</div>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="CheckmarkCircleOutline" size="20" color="#fff" />
        </div>
        <div class="metric-body">
          <div class="metric-label">平均在线率</div>
          <div class="metric-value" :style="{ color: summary.avgOnlineRate >= 90 ? '#10B981' : '#F59E0B' }">
            {{ summary.avgOnlineRate }}%
          </div>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon" style="background: linear-gradient(135deg, #EF4444, #DC2626);">
          <n-icon :component="AlertCircleOutline" size="20" color="#fff" />
        </div>
        <div class="metric-body">
          <div class="metric-label">故障设备</div>
          <div class="metric-value" :style="{ color: summary.faultDevices > 0 ? '#EF4444' : '#10B981' }">
            {{ summary.faultDevices }}
          </div>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
          <n-icon :component="StorefrontOutline" size="20" color="#fff" />
        </div>
        <div class="metric-body">
          <div class="metric-label">离线店铺</div>
          <div class="metric-value" :style="{ color: summary.offlineShops > 0 ? '#F59E0B' : '#10B981' }">
            {{ summary.offlineShops }}
          </div>
          <div class="metric-sub">无在线设备</div>
        </div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <n-select
        v-model:value="filterMerchant"
        :options="merchantOptions"
        placeholder="全部商家"
        style="width: 160px; flex-shrink: 0;"
        clearable
        size="small"
      />
      <n-input
        v-model:value="filterKeyword"
        placeholder="搜索店铺名称"
        style="width: 200px; flex-shrink: 0;"
        size="small"
        clearable
      >
        <template #prefix><n-icon :component="SearchOutline" /></template>
      </n-input>
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
        :pagination="{ pageSize: 12 }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { h, ref, computed } from 'vue'
import { NDataTable, NTag, NSelect, NInput, NIcon } from 'naive-ui'
import {
  SearchOutline, StorefrontOutline, CheckmarkCircleOutline,
  AlertCircleOutline, HardwareChipOutline
} from '@vicons/ionicons5'

// ─── 数据（代理商视角：旗下所有商家的店铺）─────────────
const rawData = ref([
  { merchant: '恒然集团', shop: '深圳福田旗舰店', total: 12, online: 11, offline: 1, fault: 0, onlineRate: '92%', utilization: '78%', lastHeartbeat: '2026-04-30 11:40:00' },
  { merchant: '恒然集团', shop: '南山科技园店', total: 8, online: 8, offline: 0, fault: 0, onlineRate: '100%', utilization: '85%', lastHeartbeat: '2026-04-30 11:39:20' },
  { merchant: '南山科创', shop: '南山科创店', total: 10, online: 9, offline: 1, fault: 0, onlineRate: '90%', utilization: '72%', lastHeartbeat: '2026-04-30 11:38:45' },
  { merchant: '宝安体验', shop: '宝安体验中心', total: 4, online: 3, offline: 1, fault: 0, onlineRate: '75%', utilization: '60%', lastHeartbeat: '2026-04-30 11:35:00' },
  { merchant: '龙岗欢乐', shop: '龙岗欢乐时光', total: 6, online: 0, offline: 6, fault: 1, onlineRate: '0%', utilization: '-', lastHeartbeat: '2026-04-29 22:10:30' },
  { merchant: '东莞松山湖', shop: '东莞松山湖店', total: 5, online: 5, offline: 0, fault: 0, onlineRate: '100%', utilization: '88%', lastHeartbeat: '2026-04-30 11:41:00' },
  { merchant: '幻影星空', shop: '广州天河店', total: 9, online: 8, offline: 1, fault: 0, onlineRate: '89%', utilization: '70%', lastHeartbeat: '2026-04-30 11:36:15' },
  { merchant: '幻影星空', shop: '广州番禺店', total: 7, online: 7, offline: 0, fault: 0, onlineRate: '100%', utilization: '82%', lastHeartbeat: '2026-04-30 11:39:50' },
  { merchant: '利民街', shop: '利民街小展厅', total: 4, online: 4, offline: 0, fault: 0, onlineRate: '100%', utilization: '76%', lastHeartbeat: '2026-04-30 11:37:00' },
  { merchant: '利民街', shop: '利民街大展厅', total: 10, online: 9, offline: 1, fault: 0, onlineRate: '90%', utilization: '68%', lastHeartbeat: '2026-04-30 11:33:20' },
])

// ─── 筛选 ─────────────────────────────────────
const filterMerchant = ref<string | null>(null)
const filterKeyword = ref('')

const merchantOptions = computed(() => {
  const merchants = [...new Set(rawData.value.map(d => d.merchant))]
  return merchants.map(m => ({ label: m, value: m }))
})

const rateNum = (r: string) => parseInt(r.replace('%', ''))

const filteredData = computed(() => {
  let d = rawData.value
  if (filterMerchant.value) d = d.filter(i => i.merchant === filterMerchant.value)
  if (filterKeyword.value) d = d.filter(i => i.shop.includes(filterKeyword.value))
  return d
})

// ─── 汇总指标 ─────────────────────────────────
const summary = computed(() => {
  const all = rawData.value
  const total = all.reduce((s, i) => s + i.total, 0)
  const online = all.reduce((s, i) => s + i.online, 0)
  const fault = all.reduce((s, i) => s + i.fault, 0)
  const rates = all.map(i => rateNum(i.onlineRate))
  const avg = rates.length ? Math.round(rates.reduce((s, r) => s + r, 0) / rates.length) : 0
  const offlineShops = all.filter(i => i.online === 0).length
  return { totalDevices: total, onlineDevices: online, faultDevices: fault, avgOnlineRate: avg, offlineShops }
})

// ─── 表格列 ─────────────────────────────────────
const renderRateTag = (rate: string) => {
  const n = rateNum(rate)
  const type = n >= 90 ? 'success' : n >= 80 ? 'warning' : 'error'
  return h(NTag, { type, size: 'small', bordered: false }, { default: () => rate })
}

const columns = [
  { title: '所属商家', key: 'merchant', width: 120 },
  { title: '店铺', key: 'shop', minWidth: 160 },
  { title: '设备总数', key: 'total', width: 90, sorter: (a: any, b: any) => a.total - b.total },
  {
    title: '在线',
    key: 'online',
    width: 80,
    sorter: (a: any, b: any) => a.online - b.online,
    render: (row: any) => h('span', { style: row.online === 0 ? 'color:#EF4444;font-weight:600;' : 'color:#10B981;font-weight:600;' }, row.online),
  },
  { title: '离线', key: 'offline', width: 80, sorter: (a: any, b: any) => a.offline - b.offline },
  {
    title: '故障',
    key: 'fault',
    width: 80,
    sorter: (a: any, b: any) => a.fault - b.fault,
    render: (row: any) => row.fault > 0 ? h(NTag, { type: 'error', size: 'small', bordered: false }, { default: () => String(row.fault) }) : row.fault,
  },
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
.page-container { padding: 24px; }

.page-header { margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.header-desc { font-size: 13px; color: var(--text-muted); margin-top: 4px; display: block; }

.metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.metric-card { background: white; border-radius: 14px; padding: 18px 20px; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 14px; }
.metric-icon { width: 44px; height: 44px; border-radius: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.metric-body { display: flex; flex-direction: column; }
.metric-label { font-size: 12px; color: var(--text-muted); margin-bottom: 4px; }
.metric-value { font-family: 'Orbitron', sans-serif; font-size: 22px; font-weight: 700; color: var(--text-primary); }
.metric-sub { font-size: 11px; color: var(--text-muted); margin-top: 2px; }

.filter-bar { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }

.table-card { background: white; border-radius: 16px; padding: 20px; border: 1px solid var(--border-color); }
</style>
