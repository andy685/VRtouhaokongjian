<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">会员储值变更</h1>
      <n-space>
        <n-input placeholder="搜索姓名/手机号..." size="small" style="width: 180px;">
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
        <n-select v-model:value="changeType" :options="typeOptions" size="small" style="width: 120px;" />
        <n-select v-model:value="merchantFilter" :options="merchantOptions" size="small" placeholder="筛选商家" clearable style="width: 160px;" />
        <n-date-picker type="daterange" clearable size="small" v-model:value="dateRange" />
        <n-button secondary size="small" @click="exportData">导出</n-button>
      </n-space>
    </div>

    <!-- 统计概览 -->
    <div class="stats-row">
      <div class="stat-card"><div class="stat-icon blue"><n-icon :component="ArrowUpCircleOutline" size="20" color="#fff" /></div><div class="stat-body"><span class="label">充值总额</span><span class="value">¥686,280</span></div></div>
      <div class="stat-card"><div class="stat-icon green"><n-icon :component="ArrowDownCircleOutline" size="20" color="#fff" /></div><div class="stat-body"><span class="label">消费总额</span><span class="value">¥452,180</span></div></div>
      <div class="stat-card"><div class="stat-icon orange"><n-icon :component="WalletOutline" size="20" color="#fff" /></div><div class="stat-body"><span class="label">剩余总额</span><span class="value">¥523,600</span></div></div>
      <div class="stat-card"><div class="stat-icon purple"><n-icon :component="PeopleOutline" size="20" color="#fff" /></div><div class="stat-body"><span class="label">变更笔数</span><span class="value">12,686</span></div></div>
    </div>

    <!-- 变更记录 -->
    <div class="table-card">
      <n-tabs type="line" v-model:value="activeTab">
        <n-tab name="all">全部</n-tab>
        <n-tab name="recharge">充值</n-tab>
        <n-tab name="consume">消费</n-tab>
        <n-tab name="refund">退款</n-tab>
        <n-tab name="adjust">调整</n-tab>
      </n-tabs>
      <n-data-table :columns="columns" :data="filteredTableData" :pagination="{ pageSize: 10 }" striped />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { NDataTable, NSpace, NInput, NIcon, NTabs, NTab, NDatePicker, NSelect, NTag } from 'naive-ui'
import { SearchOutline, ArrowUpCircleOutline, ArrowDownCircleOutline, WalletOutline, PeopleOutline } from '@vicons/ionicons5'

const changeType = ref(null)
const typeOptions = [
  { label: '全部类型', value: null },
  { label: '充值', value: 'recharge' },
  { label: '消费', value: 'consume' },
  { label: '退款', value: 'refund' },
  { label: '调整', value: 'adjust' },
]
const activeTab = ref('all')
const dateRange = ref<[number, number] | null>(null)
const merchantFilter = ref<string | null>(null)
const merchantOptions = [
  { label: '恒然集团', value: '恒然集团' },
  { label: '幻影星空', value: '幻影星空' },
  { label: '利民街商家', value: '利民街商家' },
  { label: '党建馆集团', value: '党建馆集团' },
  { label: '华东展厅', value: '华东展厅' },
]

const columns = [
  { title: '变更时间', key: 'changeTime', width: 165 },
  { title: '商家', key: 'merchant', width: 100, render: (row: any) => h(NTag, { size: 'small', bordered: false }, () => row.merchant) },
  { title: '会员姓名', key: 'name', width: 100 },
  { title: '手机号', key: 'phone', width: 125 },
  { title: '变更类型', key: 'type', width: 85, render: (row: any) => {
    const m: Record<string, string> = { recharge: 'success', consume: 'warning', refund: 'error', adjust: 'info' }
    const t: Record<string, string> = { recharge: '充值', consume: '消费', refund: '退款', adjust: '调整' }
    return h(NTag, { type: (m[row.type] || 'default') as any, size: 'small' }, () => t[row.type])
  }},
  { title: '变更金额', key: 'amount', width: 115, render: (row: any) =>
    h('span', { style: `color:${row.amount > 0 ? '#10B981' : '#EF4444'};font-weight:600;` }, row.amount > 0 ? `+¥${row.amount}` : `-¥${Math.abs(row.amount)}`)
  },
  { title: '变更前', key: 'balanceBefore', width: 105, render: (row: any) => `¥${row.balanceBefore}` },
  { title: '变更后', key: 'balanceAfter', width: 105, render: (row: any) => `¥${row.balanceAfter}` },
  { title: '操作人', key: 'operator', width: 90 },
  { title: '备注', key: 'remark', ellipsis: { tooltip: true } as any },
]

const tableData = ref([
  { id: 1, changeTime: '2026-04-21 17:25', merchant: '华东展厅', name: '赵天宇', phone: '177****9900', type: 'recharge', amount: 5000, balanceBefore: 45000, balanceAfter: 50000, operator: '系统', remark: '会员卡充值' },
  { id: 2, changeTime: '2026-04-21 16:38', merchant: '恒然集团', name: '张浩理', phone: '138****7890', type: 'consume', amount: -168, balanceBefore: 20168, balanceAfter: 20000, operator: '系统', remark: 'VR游戏消费' },
  { id: 3, changeTime: '2026-04-21 15:10', merchant: '幻影星空', name: '李明远', phone: '136****3456', type: 'recharge', amount: 2000, balanceBefore: 3000, balanceAfter: 5000, operator: '店员-小王', remark: '前台充值' },
  { id: 4, changeTime: '2026-04-21 14:22', merchant: '幻影星空', name: '王思琪', phone: '137****9012', type: 'consume', amount: -88, balanceBefore: 88, balanceAfter: 0, operator: '系统', remark: 'VR游戏消费' },
  { id: 5, changeTime: '2026-04-20 18:30', merchant: '恒然集团', name: '阳恩', phone: '159****3344', type: 'adjust', amount: -200, balanceBefore: 2200, balanceAfter: 2000, operator: '管理员', remark: '余额修正' },
  { id: 6, changeTime: '2026-04-20 16:15', merchant: '利民街商家', name: '陈晓峰', phone: '186****5566', type: 'refund', amount: 300, balanceBefore: 700, balanceAfter: 1000, operator: '系统', remark: '退款返还' },
  { id: 7, changeTime: '2026-04-20 11:40', merchant: '党建馆集团', name: '孙浩然', phone: '199****4455', type: 'recharge', amount: 3000, balanceBefore: 0, balanceAfter: 3000, operator: '店员-小李', remark: '前台充值' },
  { id: 8, changeTime: '2026-04-20 09:55', merchant: '华东展厅', name: '郑雨萱', phone: '135****6677', type: 'consume', amount: -256, balanceBefore: 8256, balanceAfter: 8000, operator: '系统', remark: '套票消费' },
])

const filteredTableData = computed(() => {
  let list = tableData.value
  if (activeTab.value !== 'all') list = list.filter(i => i.type === activeTab.value)
  if (merchantFilter.value) list = list.filter(i => i.merchant === merchantFilter.value)
  return list
})

function exportData() {}
</script>

<style scoped>
.page-container { padding: 20px 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-title { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }
.stat-card { background: white; border-radius: 12px; padding: 16px 18px; display: flex; align-items: center; gap: 14px; border: 1px solid var(--border-color); }
.stat-icon { width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-icon.blue { background: linear-gradient(135deg, #3B82F6, #2563EB); }
.stat-icon.green { background: linear-gradient(135deg, #10B981, #059669); }
.stat-icon.orange { background: linear-gradient(135deg, #F59E0B, #D97706); }
.stat-icon.purple { background: linear-gradient(135deg, #8B5CF6, #7C3AED); }
.stat-body { display: flex; flex-direction: column; gap: 2px; }
.stat-body .label { font-size: 12px; color: var(--text-muted); }
.stat-body .value { font-size: 20px; font-weight: 700; color: var(--text-primary); }

.table-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid var(--border-color); }
</style>
