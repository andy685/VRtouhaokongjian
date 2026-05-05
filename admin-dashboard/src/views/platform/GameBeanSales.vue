<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">游戏豆销售总览</h1>
      <div class="page-actions">
        <n-button secondary size="small">导出报表</n-button>
      </div>
    </div>

    <!-- 核心指标（当月） -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-label">本月销售总额</div>
        <div class="metric-value">¥{{ metrics.totalSales.toLocaleString() }}</div>
        <div class="metric-trend up">↑ 15.2%</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">本月销售数量</div>
        <div class="metric-value">{{ metrics.totalAmount.toLocaleString() }} 豆</div>
        <div class="metric-trend up">↑ 12.8%</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">余额预警商家</div>
        <div class="metric-value" style="color: #EF4444;">{{ metrics.alertCount }}</div>
        <div class="metric-trend">需关注</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">今日销售</div>
        <div class="metric-value">¥{{ metrics.todaySales.toLocaleString() }}</div>
        <div class="metric-trend up">↑ 8.5%</div>
      </div>
    </div>

    <div class="table-card">
      <n-data-table :columns="columns" :data="data" :bordered="false" :single-line="false" size="small" striped />
    </div>
  </div>
</template>

<script setup lang="ts">
import { NDataTable, NButton } from 'naive-ui'

const metrics = {
  totalSales: 2568000,
  totalAmount: 2568000,
  alertCount: 3,
  todaySales: 86580,
}

const columns = [
  { title: '商家', key: 'merchant', minWidth: 140 },
  { title: '店铺数', key: 'storeCount', width: 90 },
  { title: '总购买量', key: 'totalPurchase', width: 110 },
  { title: '总消耗量', key: 'totalConsume', width: 110 },
  { title: '当前余额', key: 'balance', width: 110 },
  { title: '最近购买时间', key: 'lastPurchaseTime', minWidth: 160 },
  { title: '预警状态', key: 'alertStatus', width: 100 },
]

const data = [
  { merchant: '恒然集团', storeCount: 3, totalPurchase: 50000, totalConsume: 32000, balance: 18000, lastPurchaseTime: '2023-09-16 15:30:22', alertStatus: '正常' },
  { merchant: '幻影星空', storeCount: 2, totalPurchase: 30000, totalConsume: 28000, balance: 2000, lastPurchaseTime: '2023-09-15 10:20:15', alertStatus: '余额不足' },
  { merchant: '利民街商家', storeCount: 2, totalPurchase: 45000, totalConsume: 15000, balance: 30000, lastPurchaseTime: '2023-09-16 12:10:05', alertStatus: '正常' },
  { merchant: '党建馆集团', storeCount: 1, totalPurchase: 20000, totalConsume: 18500, balance: 1500, lastPurchaseTime: '2023-09-14 09:30:00', alertStatus: '余额不足' },
  { merchant: '华东展厅', storeCount: 1, totalPurchase: 35000, totalConsume: 12000, balance: 23000, lastPurchaseTime: '2023-09-16 14:20:30', alertStatus: '正常' },
]
</script>

<style scoped>
.page-container { padding: 20px 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-title { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.page-actions { display: flex; gap: 12px; }

.metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
.metric-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid var(--border-color); }
.metric-label { font-size: 13px; color: var(--text-muted); margin-bottom: 8px; }
.metric-value { font-family: 'Orbitron', sans-serif; font-size: 26px; font-weight: 700; color: var(--text-primary); }
.metric-trend { font-size: 12px; color: var(--text-muted); margin-top: 6px; }
.metric-trend.up { color: #10B981; }

.table-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid var(--border-color); }
</style>
