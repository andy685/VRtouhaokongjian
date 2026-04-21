<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>门店销售日报</h1>
      <n-space>
        <n-select v-model:value="shopId" :options="shopOptions" size="small" style="width: 160px;" />
        <n-date-picker type="daterange" clearable size="small" v-model:value="dateRange" />
        <n-button secondary @click="exportData">导出Excel</n-button>
      </n-space>
    </div>

    <!-- 统计概览 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="CashOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">日营收</span>
          <span class="value">¥15,680</span>
          <span class="trend up">↑ 12.3%</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="PeopleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">客流</span>
          <span class="value">86人</span>
          <span class="trend up">↑ 5.2%</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="TicketOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">订单数</span>
          <span class="value">128</span>
          <span class="trend down">↓ 2.1%</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
          <n-icon :component="TrendingUpOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">客单价</span>
          <span class="value">¥182</span>
          <span class="trend up">↑ 8.6%</span>
        </div>
      </div>
    </div>

    <!-- 销售趋势图 -->
    <n-card class="chart-card">
      <template #header>
        <div class="card-title">每日销售趋势</div>
      </template>
      <div class="chart-placeholder">
        <n-icon :component="StatsChartOutline" size="48" color="#ccc" />
        <span>销售趋势图表</span>
      </div>
    </n-card>

    <!-- 销售明细 -->
    <n-card class="table-card">
      <n-data-table :columns="columns" :data="tableData" :pagination="pagination" />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  NCard, NDataTable, NButton, NSpace, NIcon, NDatePicker, NSelect
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import {
  CashOutline, PeopleOutline, TicketOutline, TrendingUpOutline, StatsChartOutline
} from '@vicons/ionicons5'

const shopId = ref('futian')
const shopOptions = [
  { label: '深圳福田旗舰店', value: 'futian' },
  { label: '南山科技园店', value: 'nanshan' },
  { label: '宝安中心店', value: 'baoan' }
]
const dateRange = ref<[number, number] | null>(null)
const pagination = { pageSize: 10 }

const columns: DataTableColumns = [
  { title: '日期', key: 'date', width: 120 },
  { title: '营收', key: 'revenue', width: 130, render: (row) => `¥${row.revenue.toLocaleString()}` },
  { title: '订单数', key: 'orders', width: 100 },
  { title: '客流', key: 'customers', width: 100 },
  { title: '客单价', key: 'avgPrice', width: 110, render: (row) => `¥${row.avgPrice}` },
  { title: 'VR收入', key: 'vrRevenue', width: 120, render: (row) => `¥${row.vrRevenue}` },
  { title: '套餐收入', key: 'packageRevenue', width: 120, render: (row) => `¥${row.packageRevenue}` },
  { title: '商品收入', key: 'productRevenue', width: 120, render: (row) => `¥${row.productRevenue}` },
  { title: '退款', key: 'refund', width: 100, render: (row) => `¥${row.refund}` },
]

const tableData = ref([
  { date: '2026-04-20', revenue: 15680, orders: 128, customers: 86, avgPrice: 182, vrRevenue: 8960, packageRevenue: 4520, productRevenue: 2200, refund: 320 },
  { date: '2026-04-19', revenue: 14280, orders: 118, customers: 78, avgPrice: 183, vrRevenue: 8120, packageRevenue: 4160, productRevenue: 2000, refund: 280 },
  { date: '2026-04-18', revenue: 16890, orders: 138, customers: 92, avgPrice: 184, vrRevenue: 9680, packageRevenue: 4920, productRevenue: 2290, refund: 450 },
  { date: '2026-04-17', revenue: 12560, orders: 102, customers: 68, avgPrice: 185, vrRevenue: 7180, packageRevenue: 3580, productRevenue: 1800, refund: 200 },
  { date: '2026-04-16', revenue: 18250, orders: 148, customers: 98, avgPrice: 186, vrRevenue: 10450, packageRevenue: 5320, productRevenue: 2480, refund: 380 },
])

function exportData() {
  console.log('导出数据')
}
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { font-size: 20px; font-weight: 600; color: #333; margin: 0; }
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: #fff; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-content { display: flex; flex-direction: column; gap: 2px; }
.stat-content .label { font-size: 13px; color: #666; }
.stat-content .value { font-size: 24px; font-weight: 600; color: #333; }
.stat-content .trend { font-size: 12px; }
.stat-content .trend.up { color: #10B981; }
.stat-content .trend.down { color: #EF4444; }
.chart-card { margin-bottom: 24px; border-radius: 12px; }
.card-title { font-size: 16px; font-weight: 600; color: #333; }
.chart-placeholder { height: 280px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: #999; background: #fafafa; border-radius: 8px; }
.table-card { border-radius: 12px; }
</style>
