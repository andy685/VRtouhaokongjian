<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>历史营收统计</h1>
      <n-space>
        <n-select v-model:value="shopId" :options="shopOptions" size="small" style="width: 160px;" />
        <n-select v-model:value="year" :options="yearOptions" size="small" style="width: 100px;" />
        <n-button secondary @click="exportData">导出</n-button>
      </n-space>
    </div>

    <!-- 年度统计 -->
    <div class="stats-row">
      <div class="stat-card large">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="CashOutline" size="28" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">年度总营收</span>
          <span class="value primary">¥1,856,800</span>
          <span class="compare">较去年增长 <span class="up">+18.6%</span></span>
        </div>
      </div>
    </div>

    <!-- 月度趋势 -->
    <n-card class="chart-card">
      <template #header>
        <div class="card-title">月度营收趋势</div>
      </template>
      <div class="chart-placeholder">
        <n-icon :component="StatsChartOutline" size="48" color="#ccc" />
        <span>月度营收趋势图表</span>
      </div>
    </n-card>

    <!-- 月度明细 -->
    <n-card class="table-card">
      <n-data-table :columns="columns" :data="tableData" :pagination="pagination" />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  NCard, NDataTable, NButton, NSpace, NIcon, NSelect
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { CashOutline, StatsChartOutline } from '@vicons/ionicons5'

const shopId = ref('futian')
const shopOptions = [
  { label: '深圳福田旗舰店', value: 'futian' },
  { label: '南山科技园店', value: 'nanshan' },
  { label: '宝安中心店', value: 'baoan' }
]
const year = ref('2026')
const yearOptions = [
  { label: '2026年', value: '2026' },
  { label: '2025年', value: '2025' },
  { label: '2024年', value: '2024' }
]
const pagination = { pageSize: 12 }

const columns: DataTableColumns = [
  { title: '月份', key: 'month', width: 100 },
  { title: 'VR收入', key: 'vrRevenue', width: 140, render: (row) => `¥${row.vrRevenue.toLocaleString()}` },
  { title: '套餐收入', key: 'packageRevenue', width: 140, render: (row) => `¥${row.packageRevenue.toLocaleString()}` },
  { title: '商品收入', key: 'productRevenue', width: 140, render: (row) => `¥${row.productRevenue.toLocaleString()}` },
  { title: '其他收入', key: 'otherRevenue', width: 130, render: (row) => `¥${row.otherRevenue.toLocaleString()}` },
  { title: '退款', key: 'refund', width: 120, render: (row) => `¥${row.refund.toLocaleString()}` },
  { title: '合计', key: 'total', width: 140, render: (row) => `¥${row.total.toLocaleString()}` },
  { title: '同比', key: 'yoy', width: 100, render: (row) =>
    h('span', { style: { color: row.yoy > 0 ? '#10B981' : '#EF4444' } },
      row.yoy > 0 ? `+${row.yoy}%` : `${row.yoy}%`)
  },
]

const tableData = ref([
  { month: '1月', vrRevenue: 168000, packageRevenue: 86000, productRevenue: 42000, otherRevenue: 12000, refund: 5600, total: 308000, yoy: 15.2 },
  { month: '2月', vrRevenue: 186000, packageRevenue: 96000, productRevenue: 48000, otherRevenue: 15000, refund: 6200, total: 345000, yoy: 18.6 },
  { month: '3月', vrRevenue: 158000, packageRevenue: 82000, productRevenue: 38000, otherRevenue: 11000, refund: 4800, total: 289000, yoy: 12.8 },
  { month: '4月', vrRevenue: 142000, packageRevenue: 72000, productRevenue: 35000, otherRevenue: 9000, refund: 4200, total: 262000, yoy: 8.5 },
])

function exportData() {
  console.log('导出数据')
}
</script>

<script lang="ts">
import { h } from 'vue'
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { font-size: 20px; font-weight: 600; color: #333; margin: 0; }
.stats-row { display: grid; grid-template-columns: 1fr; gap: 16px; margin-bottom: 24px; }
.stat-card { background: #fff; border-radius: 12px; padding: 24px; display: flex; align-items: center; gap: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.stat-card.large .stat-icon { width: 64px; height: 64px; }
.stat-content { display: flex; flex-direction: column; gap: 4px; }
.stat-content .label { font-size: 14px; color: #666; }
.stat-content .value { font-size: 32px; font-weight: 700; color: #333; }
.stat-content .value.primary { color: #3B82F6; }
.stat-content .compare { font-size: 14px; color: #666; }
.stat-content .compare .up { color: #10B981; font-weight: 600; }
.chart-card { margin-bottom: 24px; border-radius: 12px; }
.card-title { font-size: 16px; font-weight: 600; color: #333; }
.chart-placeholder { height: 280px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: #999; background: #fafafa; border-radius: 8px; }
.table-card { border-radius: 12px; }
</style>
