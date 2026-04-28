<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>财务总览</h1>
        <p class="header-desc">平台全局财务数据概览与分析</p>
      </div>
      <n-space>
        <n-date-picker type="daterange" clearable size="small" v-model:value="dateRange" />
        <n-button secondary size="small">
          <template #icon><n-icon :component="DownloadOutline" /></template> 导出
        </n-button>
      </n-space>
    </div>

    <!-- 财务概览 -->
    <div class="metrics-row">
      <div class="metric-card">
        <div class="metric-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="TrendingUpOutline" size="22" color="#fff" />
        </div>
        <div class="metric-content">
          <span class="label">平台总营收</span>
          <span class="value">¥2,856,780</span>
          <span class="trend up">↑ 15.2%</span>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="WalletOutline" size="22" color="#fff" />
        </div>
        <div class="metric-content">
          <span class="label">待结算金额</span>
          <span class="value warning">¥328,560</span>
          <span class="sub-text">本月交易中</span>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="CardOutline" size="22" color="#fff" />
        </div>
        <div class="metric-content">
          <span class="label">已提现金额</span>
          <span class="value">¥1,856,200</span>
          <span class="sub-text">含服务费</span>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
          <n-icon :component="ReceiptOutline" size="22" color="#fff" />
        </div>
        <div class="metric-content">
          <span class="label">订单总数</span>
          <span class="value">12,580</span>
          <span class="sub-text">本月订单</span>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-grid">
      <div class="chart-card chart-large">
        <div class="chart-header">
          <h3>月度营收趋势</h3>
          <n-radio-group v-model:value="trendPeriod" size="small">
            <n-radio-button value="month">近6个月</n-radio-button>
            <n-radio-button value="year">近一年</n-radio-button>
          </n-radio-group>
        </div>
        <div ref="revenueChartRef" class="chart-container"></div>
      </div>
      <div class="chart-card">
        <div class="chart-header">
          <h3>收入构成</h3>
        </div>
        <div ref="incomeChartRef" class="chart-container"></div>
      </div>
    </div>

    <!-- 最新交易 -->
    <div class="section-card">
      <div class="section-header">
        <h3>最新交易记录</h3>
        <n-button quaternary size="tiny" @click="viewAllTransactions">查看全部</n-button>
      </div>
      <n-data-table :columns="transactionColumns" :data="transactionData" :pagination="{ pageSize: 8 }" striped />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import {
  NButton, NIcon, NSpace, NDatePicker, NRadioGroup, NRadioButton,
  NDataTable, NTag, useMessage
} from 'naive-ui'
import * as echarts from 'echarts/core'
import { LineChart, PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import {
  TrendingUpOutline, WalletOutline, CardOutline, ReceiptOutline,
  DownloadOutline
} from '@vicons/ionicons5'

const router = useRouter()
const message = useMessage()

const dateRange = ref(null)
const trendPeriod = ref('month')
const revenueChartRef = ref<HTMLElement>()
const incomeChartRef = ref<HTMLElement>()

const transactionColumns = [
  { title: '订单号', key: 'orderNo', width: 160 },
  { title: '店铺', key: 'store' },
  { title: '金额', key: 'amount', render: (row: any) => `¥${row.amount.toLocaleString()}` },
  { title: '手续费', key: 'fee', render: (row: any) => `¥${row.fee}` },
  { title: '到账金额', key: 'actual', render: (row: any) => `¥${row.actual.toLocaleString()}` },
  { title: '时间', key: 'time' },
  { title: '状态', key: 'status', render: (row: any) => h(NTag, { type: row.status === 'success' ? 'success' : 'warning', size: 'small' }, () => row.statusText) },
]

const transactionData = [
  { orderNo: 'VR20260420001', store: '深圳福田旗舰店', amount: 128, fee: 3.84, actual: 124.16, time: '2026-04-20 15:30', status: 'success', statusText: '已结算' },
  { orderNo: 'VR20260420002', store: '南山科技园店', amount: 256, fee: 7.68, actual: 248.32, time: '2026-04-20 15:25', status: 'success', statusText: '已结算' },
  { orderNo: 'VR20260420003', store: '广州天河店', amount: 99, fee: 2.97, actual: 96.03, time: '2026-04-20 15:20', status: 'pending', statusText: '待结算' },
  { orderNo: 'VR20260420004', store: '北京朝阳店', amount: 188, fee: 5.64, actual: 182.36, time: '2026-04-20 15:15', status: 'success', statusText: '已结算' },
  { orderNo: 'VR20260420005', store: '上海浦东店', amount: 320, fee: 9.60, actual: 310.40, time: '2026-04-20 15:10', status: 'success', statusText: '已结算' },
]

function viewAllTransactions() {
  message.info('查看全部交易记录')
}

function initCharts() {
  nextTick(() => {
    if (revenueChartRef.value) {
      const chart = echarts.init(revenueChartRef.value)
      chart.setOption({
        tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#eee' },
        grid: { left: 48, right: 16, top: 24, bottom: 32 },
        xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'], axisLine: { lineStyle: { color: '#e2e8f0' } }, axisLabel: { color: '#64748b' } },
        yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } }, axisLabel: { color: '#64748b', formatter: '¥{value}k' } },
        series: [{
          type: 'line', smooth: true, data: [320, 380, 420, 480, 520, 580],
          areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(59,130,246,0.2)' }, { offset: 1, color: 'rgba(59,130,246,0)' }]) },
          lineStyle: { width: 3, color: '#3B82F6' },
          itemStyle: { color: '#3B82F6' }
        }]
      })
      window.addEventListener('resize', () => chart.resize())
    }

    if (incomeChartRef.value) {
      const chart = echarts.init(incomeChartRef.value)
      chart.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: ¥{c}k ({d}%)' },
        series: [{
          type: 'pie',
          radius: ['45%', '72%'],
          center: ['50%', '50%'],
          label: { show: true, fontSize: 12, color: '#64748b' },
          data: [
            { value: 280, name: 'VR体验', itemStyle: { color: '#3B82F6' } },
            { value: 180, name: '会员充值', itemStyle: { color: '#10B981' } },
            { value: 120, name: '实体商品', itemStyle: { color: '#F59E0B' } },
            { value: 80, name: '其他', itemStyle: { color: '#8B5CF6' } },
          ]
        }]
      })
      window.addEventListener('resize', () => chart.resize())
    }
  })
}

onMounted(() => {
  initCharts()
})
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.header-desc { font-size: 13px; color: var(--text-muted); margin-top: 4px; display: block; }

.metrics-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.metric-card { background: white; border-radius: 14px; padding: 20px; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 16px; }
.metric-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.metric-content { display: flex; flex-direction: column; }
.metric-content .label { font-size: 12px; color: var(--text-muted); }
.metric-content .value { font-family: 'Orbitron', sans-serif; font-size: 22px; font-weight: 700; color: var(--text-primary); }
.metric-content .value.warning { color: #F59E0B; }
.metric-content .trend { font-size: 12px; color: #10B981; font-weight: 600; }
.metric-content .sub-text { font-size: 11px; color: var(--text-muted); }

.charts-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 24px; }
.chart-card { background: white; border-radius: 16px; padding: 22px; border: 1px solid var(--border-color); }
.chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.chart-header h3 { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.chart-container { width: 100%; height: 280px; }

.section-card { background: white; border-radius: 16px; padding: 22px; border: 1px solid var(--border-color); }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-header h3 { font-size: 15px; font-weight: 600; color: var(--text-primary); }

@media (max-width: 1200px) {
  .charts-grid { grid-template-columns: 1fr; }
}
</style>
