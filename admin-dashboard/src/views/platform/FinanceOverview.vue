<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>商家营收总额</h1>
        <p class="header-desc">商家游戏豆采购与结算数据概览</p>
      </div>
    </div>

    <!-- 财务概览 -->
    <div class="metrics-row">
      <div class="metric-card">
        <div class="metric-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="TrendingUpOutline" size="22" color="#fff" />
        </div>
        <div class="metric-content">
          <span class="label">商家营收总额</span>
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
          <span class="label">已结算金额</span>
          <span class="value">¥1,856,200</span>
          <span class="sub-text">含服务费</span>
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
        <h3>近期结算流水</h3>
        <n-button quaternary size="tiny" @click="viewAllSettlements">查看全部</n-button>
      </div>
      <n-data-table :columns="settlementColumns" :data="settlementData" :pagination="{ pageSize: 8 }" striped />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, h, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import {
  NButton, NIcon, NRadioGroup, NRadioButton,
  NDataTable, NTag, useMessage
} from 'naive-ui'
import * as echarts from 'echarts/core'
import { LineChart, PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 注册 ECharts 组件
echarts.use([LineChart, PieChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer])
import {
  TrendingUpOutline, WalletOutline, CardOutline
} from '@vicons/ionicons5'

const router = useRouter()
const message = useMessage()

const trendPeriod = ref('month')
const revenueChartRef = ref<HTMLElement | null>(null)
const incomeChartRef = ref<HTMLElement | null>(null)
let revenueChart: echarts.ECharts | null = null
let incomeChart: echarts.ECharts | null = null

const settlementColumns = [
  { title: '结算单号', key: 'settlementNo', width: 140 },
  { title: '商家', key: 'merchant' },
  { title: '店铺数量', key: 'storeCount', width: 80, align: 'center' },
  { title: '结算周期', key: 'period', width: 180 },
  { title: '结算金额', key: 'amount', width: 110, render: (row: any) => `¥${row.amount.toLocaleString()}` },
  { title: '手续费率', key: 'feeRate', width: 80, align: 'center' },
  { title: '手续费', key: 'fee', width: 100, render: (row: any) => `¥${row.fee.toLocaleString()}` },
  { title: '实际到账', key: 'actual', width: 120, render: (row: any) => `¥${row.actual.toLocaleString()}` },
  { title: '状态', key: 'status', width: 80, align: 'center', render: (row: any) => h(NTag, {
    type: row.status === 'done' ? 'success' : row.status === 'pending' ? 'warning' : 'default',
    size: 'small', bordered: false
  }, () => row.statusText) },
  { title: '打款时间', key: 'payTime', width: 160 },
  { title: '操作', key: 'actions', width: 80, render: (row: any) => h(NButton, { text: true, size: 'small', type: 'primary' }, () => '查看明细') },
]

const settlementData = [
  { settlementNo: 'ST2026042001', merchant: '深圳XX科技公司', storeCount: '2家', period: '2026-04-13 ~ 2026-04-19', amount: 137963, feeRate: '3.0%', fee: 4138.89, actual: 133824.11, status: 'done', statusText: '已打款', payTime: '2026-04-20 10:00' },
  { settlementNo: 'ST2026042002', merchant: '广州YY传媒公司', storeCount: '1家', period: '2026-04-13 ~ 2026-04-19', amount: 78230, feeRate: '3.0%', fee: 2346.9, actual: 75883.1, status: 'pending', statusText: '待打款', payTime: '-' },
  { settlementNo: 'ST2026042003', merchant: '北京ZZ娱乐公司', storeCount: '1家', period: '2026-04-13 ~ 2026-04-19', amount: 45680, feeRate: '3.0%', fee: 1370.4, actual: 44309.6, status: 'processing', statusText: '处理中', payTime: '-' },
  { settlementNo: 'ST2026042004', merchant: '上海WW投资公司', storeCount: '1家', period: '2026-04-13 ~ 2026-04-19', amount: 97850, feeRate: '3.0%', fee: 2935.5, actual: 94914.5, status: 'pending', statusText: '待打款', payTime: '-' },
]

function viewAllSettlements() {
  message.info('查看全部结算记录')
}

function initCharts() {
  nextTick(() => {
    // 等待 DOM 完全渲染
    setTimeout(() => {
      if (revenueChartRef.value) {
        revenueChart = echarts.init(revenueChartRef.value)
        revenueChart.setOption({
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
      }
      if (incomeChartRef.value) {
        incomeChart = echarts.init(incomeChartRef.value)
        incomeChart.setOption({
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
      }
    }, 200)
  })
}

function handleResize() {
  revenueChart?.resize()
  incomeChart?.resize()
}

onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  revenueChart?.dispose()
  incomeChart?.dispose()
})
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.header-desc { font-size: 13px; color: var(--text-muted); margin-top: 4px; display: block; }

.metrics-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
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
