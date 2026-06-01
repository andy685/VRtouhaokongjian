<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>CP 对账中心</h1>
        <p class="header-desc">核对 CP 供应商结算数据与拉卡拉分账记录</p>
      </div>
      <n-space>
        <n-date-picker type="daterange" clearable size="small" v-model:value="dateRange" />
        <n-select v-model:value="filterCp" :options="cpOptions" placeholder="全部CP" size="small" style="width: 150px;" clearable />
        <n-button @click="handleAutoReconcile">
          <template #icon><n-icon :component="SyncOutline" /></template> 自动对账
        </n-button>
        <n-button type="primary" @click="refreshData">
          <template #icon><n-icon :component="RefreshOutline" /></template> 刷新
        </n-button>
      </n-space>
    </div>

    <!-- 对账汇总 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="CheckmarkCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">对账一致</span>
          <span class="value">{{ matchedCount }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #EF4444, #DC2626);">
          <n-icon :component="AlertCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">差异笔数</span>
          <span class="value error">{{ diffCount }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="TimeOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">待核对</span>
          <span class="value warning">{{ pendingCount }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
          <n-icon :component="WalletOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">差异金额</span>
          <span class="value">¥{{ diffAmount.toLocaleString() }}</span>
        </div>
      </div>
    </div>

    <!-- 对账记录 -->
    <div class="content-card">
      <n-tabs type="line" animated v-model:value="activeTab">
        <n-tab-pane name="all" tab="全部记录">
          <n-data-table :columns="columns" :data="filteredRecords" :pagination="{ pageSize: 10 }" striped />
        </n-tab-pane>
        <n-tab-pane name="diff" tab="差异记录">
          <n-data-table :columns="columns" :data="filteredRecords.filter(r => r.status !== 'matched')" :pagination="{ pageSize: 10 }" striped />
        </n-tab-pane>
      </n-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NButton, NSelect, NTag, NIcon, NSpace, NTabs, NTabPane,
  NDatePicker, NDataTable, useMessage
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import {
  CheckmarkCircleOutline, AlertCircleOutline, TimeOutline,
  WalletOutline, SyncOutline, RefreshOutline,
} from '@vicons/ionicons5'

const message = useMessage()
const dateRange = ref<[number, number] | null>(null)
const filterCp = ref<string | null>(null)
const activeTab = ref('all')

const cpOptions = [
  { label: '极境互动科技', value: '极境互动科技' },
  { label: '闪耀游戏工作室', value: '闪耀游戏工作室' },
  { label: '乐游网络', value: '乐游网络' },
  { label: '星际科技', value: '星际科技' },
  { label: '未来幻境', value: '未来幻境' },
  { label: '幻视科技', value: '幻视科技' },
  { label: '星辰游戏', value: '星辰游戏' },
]

const records = ref([
  { id: 1, no: 'CP-202505-001', cpName: '极境互动科技', period: '2025年05月', settledAmount: 109920, feeAmount: 2198, actualAmount: 107722, lakalaAmount: 107722, status: 'matched', reconcileTime: '2025-06-05 10:30' },
  { id: 2, no: 'CP-202505-002', cpName: '闪耀游戏工作室', period: '2025年05月', settledAmount: 44200, feeAmount: 884, actualAmount: 43316, lakalaAmount: 43316, status: 'matched', reconcileTime: '2025-06-05 10:31' },
  { id: 3, no: 'CP-202505-003', cpName: '乐游网络', period: '2025年05月', settledAmount: 68040, feeAmount: 1361, actualAmount: 66679, lakalaAmount: 66679, status: 'matched', reconcileTime: '2025-06-05 10:32' },
  { id: 4, no: 'CP-202505-004', cpName: '星际科技', period: '2025年05月', settledAmount: 15300, feeAmount: 306, actualAmount: 14994, lakalaAmount: 14994, status: 'matched', reconcileTime: '2025-06-05 10:33' },
  { id: 5, no: 'CP-202504-005', cpName: '未来幻境', period: '2025年04月', settledAmount: 65800, feeAmount: 1316, actualAmount: 64484, lakalaAmount: 64480, status: 'diff', diffDetail: '拉卡拉到账少 ¥4.00', reconcileTime: '2025-05-05 10:30' },
  { id: 6, no: 'CP-202505-006', cpName: '幻视科技', period: '2025年05月', settledAmount: 32760, feeAmount: 655, actualAmount: 32105, lakalaAmount: 0, status: 'pending', diffDetail: '拉卡拉未回调', reconcileTime: '-' },
])

const columns: DataTableColumns<any> = [
  { title: '结算单号', key: 'no', width: 150 },
  { title: 'CP 名称', key: 'cpName', width: 140 },
  { title: '结算周期', key: 'period', width: 110 },
  { title: '结算额(¥)', key: 'settledAmount', width: 110, align: 'right', render: (row) => `¥${row.settledAmount.toLocaleString()}` },
  { title: '到账金额(¥)', key: 'actualAmount', width: 110, align: 'right', render: (row) => `¥${row.actualAmount.toLocaleString()}` },
  { title: '拉卡拉金额(¥)', key: 'lakalaAmount', width: 120, align: 'right', render: (row) => row.lakalaAmount ? `¥${row.lakalaAmount.toLocaleString()}` : '-' },
  {
    title: '对账状态', key: 'status', width: 100,
    render: (row) => {
      const map: Record<string, any> = { matched: { type: 'success', label: '一致' }, diff: { type: 'error', label: '差异' }, pending: { type: 'warning', label: '待核对' } }
      return h(NTag, { type: map[row.status].type, size: 'small', bordered: true }, { default: () => map[row.status].label })
    }
  },
  { title: '差异说明', key: 'diffDetail', width: 160, render: (row) => row.diffDetail || '-' },
  { title: '对账时间', key: 'reconcileTime', width: 150 },
]

const filteredRecords = computed(() => {
  let data = [...records.value]
  if (filterCp.value) data = data.filter(r => r.cpName === filterCp.value)
  return data
})

const matchedCount = computed(() => records.value.filter(r => r.status === 'matched').length)
const diffCount = computed(() => records.value.filter(r => r.status === 'diff').length)
const pendingCount = computed(() => records.value.filter(r => r.status === 'pending').length)
const diffAmount = computed(() => records.value.filter(r => r.status === 'diff').reduce((s, r) => s + Math.abs(r.actualAmount - (r.lakalaAmount || 0)), 0))

function handleAutoReconcile() {
  message.success('自动对账已触发，请稍后刷新查看结果')
}
function refreshData() {
  message.success('数据已刷新')
}
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.header-desc { font-size: 13px; color: var(--text-muted); margin-top: 4px; }
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: white; border-radius: 14px; padding: 20px; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 16px; }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-content { display: flex; flex-direction: column; }
.stat-content .label { font-size: 12px; color: var(--text-muted); }
.stat-content .value { font-family: 'Orbitron', sans-serif; font-size: 22px; font-weight: 700; color: var(--text-primary); }
.stat-content .value.error { color: #EF4444; }
.stat-content .value.warning { color: #F59E0B; }
.content-card { background: white; border-radius: 16px; padding: 24px; border: 1px solid var(--border-color); }
</style>
