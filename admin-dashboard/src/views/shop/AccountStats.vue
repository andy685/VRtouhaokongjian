<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>账户金额统计</h1>
      <n-space>
        <n-date-picker type="daterange" clearable size="small" v-model:value="dateRange" />
        <n-button secondary @click="exportData">导出</n-button>
      </n-space>
    </div>

    <!-- 账户概览 -->
    <div class="account-cards">
      <div class="account-card primary">
        <div class="account-icon">
          <n-icon :component="WalletOutline" size="32" color="#fff" />
        </div>
        <div class="account-info">
          <span class="account-label">账户总余额</span>
          <span class="account-value">¥128,560</span>
        </div>
      </div>
      <div class="account-card">
        <div class="account-icon green">
          <n-icon :component="CardOutline" size="24" color="#fff" />
        </div>
        <div class="account-info">
          <span class="account-label">会员储值余额</span>
          <span class="account-value">¥86,280</span>
        </div>
      </div>
      <div class="account-card">
        <div class="account-icon orange">
          <n-icon :component="GiftOutline" size="24" color="#fff" />
        </div>
        <div class="account-info">
          <span class="account-label">赠送金余额</span>
          <span class="account-value">¥12,850</span>
        </div>
      </div>
      <div class="account-card">
        <div class="account-icon purple">
          <n-icon :component="StarOutline" size="24" color="#fff" />
        </div>
        <div class="account-info">
          <span class="account-label">积分折算</span>
          <span class="account-value">¥29,430</span>
        </div>
      </div>
    </div>

    <!-- 收支明细 -->
    <n-card class="table-card">
      <template #header>
        <div class="card-title">收支明细</div>
      </template>
      <n-tabs type="line" v-model:value="activeTab">
        <n-tab name="income">收入</n-tab>
        <n-tab name="expense">支出</n-tab>
      </n-tabs>
      <n-data-table :columns="columns" :data="tableData" :pagination="pagination" />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import {
  NCard, NDataTable, NButton, NSpace, NIcon, NDatePicker, NTabs, NTab, NTag
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { WalletOutline, CardOutline, GiftOutline, StarOutline } from '@vicons/ionicons5'

const dateRange = ref<[number, number] | null>(null)
const activeTab = ref('income')
const pagination = { pageSize: 10 }

const columns: DataTableColumns = [
  { title: '时间', key: 'time', width: 180 },
  { title: '类型', key: 'type', width: 120, render: (row) =>
    h(NTag, { type: row.type === 'recharge' ? 'success' : row.type === 'gift' ? 'info' : 'warning', size: 'small' },
      { default: () => row.type === 'recharge' ? '充值' : row.type === 'gift' ? '赠送' : '兑换' })
  },
  { title: '会员', key: 'member', width: 120 },
  { title: '金额', key: 'amount', width: 130, render: (row) =>
    h('span', { style: { color: row.isIncome ? '#10B981' : '#EF4444', fontWeight: 600 } },
      row.isIncome ? `+¥${row.amount}` : `-¥${row.amount}`)
  },
  { title: '来源', key: 'source', width: 120 },
  { title: '操作人', key: 'operator', width: 100 },
  { title: '备注', key: 'remark', ellipsis: { tooltip: true } }
]

const tableData = ref([
  { time: '2026-04-20 14:30:00', type: 'recharge', member: '张小明', amount: 500, isIncome: true, source: '前台', operator: '张三', remark: '会员卡充值' },
  { time: '2026-04-20 11:20:00', type: 'gift', member: '李小红', amount: 50, isIncome: true, source: '系统', operator: '系统', remark: '消费满额赠送' },
  { time: '2026-04-20 10:15:00', type: 'exchange', member: '王小强', amount: 200, isIncome: false, source: '兑换', operator: '李四', remark: '积分兑换礼品' },
  { time: '2026-04-19 16:45:00', type: 'recharge', member: '陈小芳', amount: 1000, isIncome: true, source: '小程序', operator: '系统', remark: '线上充值' },
])

function exportData() {
  console.log('导出数据')
}
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { font-size: 20px; font-weight: 600; color: #333; margin: 0; }
.account-cards { display: grid; grid-template-columns: 2fr repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
.account-card { background: #fff; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.account-card.primary { background: linear-gradient(135deg, #3B82F6, #2563EB); }
.account-icon { width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.2); }
.account-icon.green { background: linear-gradient(135deg, #10B981, #059669); }
.account-icon.orange { background: linear-gradient(135deg, #F59E0B, #D97706); }
.account-icon.purple { background: linear-gradient(135deg, #8B5CF6, #7C3AED); }
.account-info { display: flex; flex-direction: column; gap: 4px; }
.account-label { font-size: 14px; color: rgba(255,255,255,0.8); }
.account-value { font-size: 24px; font-weight: 700; color: #fff; }
.table-card { border-radius: 12px; }
.card-title { font-size: 16px; font-weight: 600; color: #333; }
</style>
