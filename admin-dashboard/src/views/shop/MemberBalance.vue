<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>会员储值变更</h1>
      <n-space>
        <n-input placeholder="搜索姓名/手机号..." size="small" style="width: 180px;">
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
        <n-select v-model:value="changeType" :options="typeOptions" size="small" style="width: 120px;" />
        <n-date-picker type="daterange" clearable size="small" v-model:value="dateRange" />
        <n-button secondary @click="exportData">导出</n-button>
      </n-space>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="ArrowUpCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">充值总额</span>
          <span class="value">¥68,580</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="ArrowDownCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">消费总额</span>
          <span class="value">¥45,280</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="WalletOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">剩余总额</span>
          <span class="value">¥52,360</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
          <n-icon :component="PeopleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">变更笔数</span>
          <span class="value">1,286</span>
        </div>
      </div>
    </div>

    <!-- 变更记录 -->
    <n-card class="table-card">
      <n-tabs type="line" v-model:value="activeTab">
        <n-tab name="all">全部</n-tab>
        <n-tab name="recharge">充值</n-tab>
        <n-tab name="consume">消费</n-tab>
        <n-tab name="refund">退款</n-tab>
        <n-tab name="adjust">调整</n-tab>
      </n-tabs>
      <n-data-table :columns="columns" :data="filteredTableData" :pagination="pagination" />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NCard, NDataTable, NButton, NSpace, NInput, NIcon, NTabs, NTab,
  NDatePicker, NSelect, NTag
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import {
  SearchOutline, ArrowUpCircleOutline, ArrowDownCircleOutline,
  WalletOutline, PeopleOutline
} from '@vicons/ionicons5'

const changeType = ref(null)
const typeOptions = [
  { label: '全部类型', value: null },
  { label: '充值', value: 'recharge' },
  { label: '消费', value: 'consume' },
  { label: '退款', value: 'refund' },
  { label: '调整', value: 'adjust' }
]
const activeTab = ref('all')
const dateRange = ref<[number, number] | null>(null)
const pagination = { pageSize: 10 }

const columns: DataTableColumns = [
  { title: '变更时间', key: 'changeTime', width: 180 },
  { title: '会员姓名', key: 'name', width: 120 },
  { title: '手机号', key: 'phone', width: 130 },
  { title: '变更类型', key: 'type', width: 100, render: (row) =>
    h(NTag, {
      type: row.type === 'recharge' ? 'success' : row.type === 'consume' ? 'warning' : row.type === 'refund' ? 'error' : 'info',
      size: 'small'
    }, { default: () => row.type === 'recharge' ? '充值' : row.type === 'consume' ? '消费' : row.type === 'refund' ? '退款' : '调整' })
  },
  { title: '变更金额', key: 'amount', width: 130, render: (row) =>
    h('span', { style: { color: row.amount > 0 ? '#10B981' : '#EF4444', fontWeight: 600 } },
      row.amount > 0 ? `+¥${row.amount}` : `-¥${Math.abs(row.amount)}`)
  },
  { title: '变更前', key: 'balanceBefore', width: 120, render: (row) => `¥${row.balanceBefore}` },
  { title: '变更后', key: 'balanceAfter', width: 120, render: (row) => `¥${row.balanceAfter}` },
  { title: '操作人', key: 'operator', width: 100 },
  { title: '备注', key: 'remark', width: 150, ellipsis: { tooltip: true } }
]

const tableData = ref([
  { id: 1, changeTime: '2026-04-20 14:30:00', name: '张小明', phone: '13801231234', type: 'recharge', amount: 500, balanceBefore: 280, balanceAfter: 780, operator: '系统', remark: '会员卡充值' },
  { id: 2, changeTime: '2026-04-20 11:20:00', name: '李小红', phone: '13905675678', type: 'consume', amount: -68, balanceBefore: 388, balanceAfter: 320, operator: '系统', remark: 'VR游戏消费' },
  { id: 3, changeTime: '2026-04-20 10:15:00', name: '王小强', phone: '13709019012', type: 'recharge', amount: 200, balanceBefore: 50, balanceAfter: 250, operator: '张三', remark: '前台充值' },
  { id: 4, changeTime: '2026-04-19 16:45:00', name: '陈小芳', phone: '13603453456', type: 'consume', amount: -118, balanceBefore: 468, balanceAfter: 350, operator: '系统', remark: '套票消费' },
  { id: 5, changeTime: '2026-04-19 14:00:00', name: '刘小丽', phone: '13507897890', type: 'adjust', amount: -20, balanceBefore: 100, balanceAfter: 80, operator: '管理员', remark: '余额调整' },
  { id: 6, changeTime: '2026-04-19 10:30:00', name: '赵小军', phone: '13402342345', type: 'refund', amount: 50, balanceBefore: 80, balanceAfter: 130, operator: '系统', remark: '退款返还' },
])

function exportData() {
  console.log('导出数据')
}

// 根据 Tab 筛选表格数据
const filteredTableData = computed(() => {
  if (activeTab.value === 'all') return tableData.value
  return tableData.value.filter(item => item.type === activeTab.value)
})
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { font-size: 20px; font-weight: 600; color: #333; margin: 0; }
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: #fff; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-content { display: flex; flex-direction: column; gap: 4px; }
.stat-content .label { font-size: 13px; color: #666; }
.stat-content .value { font-size: 24px; font-weight: 600; color: #333; }
.table-card { border-radius: 12px; }
</style>
