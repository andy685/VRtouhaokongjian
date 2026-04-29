<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>平台财务管理</h1>
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

    <!-- Tab切换 -->
    <n-tabs type="line" animated :value="activeTab" @update:value="handleTabChange">
      <!-- 财务总览 -->
      <n-tab-pane name="overview" tab="📊 财务总览">
        <div class="tab-content">
          <n-grid :cols="2" :x-gap="20" :y-gap="20">
            <n-gi>
              <div class="chart-card">
                <div class="chart-header">
                  <h3>月度营收趋势</h3>
                </div>
                <div ref="revenueChartRef" class="chart-container"></div>
              </div>
            </n-gi>
            <n-gi>
              <div class="chart-card">
                <div class="chart-header">
                  <h3>收入构成</h3>
                </div>
                <div ref="incomeChartRef" class="chart-container"></div>
              </div>
            </n-gi>
          </n-grid>

          <!-- 最新交易 -->
          <div class="section-card">
            <div class="section-header">
              <h3>最新交易记录</h3>
              <n-button quaternary size="tiny">查看全部 →</n-button>
            </div>
            <n-data-table :columns="transactionColumns" :data="transactionData" :pagination="{ pageSize: 8 }" striped />
          </div>
        </div>
      </n-tab-pane>

      <!-- 结算管理 -->
      <n-tab-pane name="settlement" tab="💰 结算管理">
        <div class="tab-content">
          <n-grid :cols="3" :x-gap="20" :y-gap="20" style="margin-bottom: 20px;">
            <n-gi>
              <div class="stat-card">
                <span class="label">本月应付</span>
                <span class="value">¥856,234</span>
                <n-tag type="success" size="small">已结算 80%</n-tag>
              </div>
            </n-gi>
            <n-gi>
              <div class="stat-card">
                <span class="label">待确认</span>
                <span class="value warning">¥128,560</span>
                <n-button type="primary" size="tiny">立即结算</n-button>
              </div>
            </n-gi>
            <n-gi>
              <div class="stat-card">
                <span class="label">已打款</span>
                <span class="value">¥727,674</span>
                <span class="sub">共 45 笔</span>
              </div>
            </n-gi>
          </n-grid>

          <div class="section-card">
            <div class="section-header">
              <h3>结算记录</h3>
              <n-space>
                <n-select size="small" placeholder="结算状态" :options="statusOptions" style="width: 120px;" />
                <n-button type="primary" size="small">批量结算</n-button>
              </n-space>
            </div>
            <n-data-table :columns="settlementColumns" :data="settlementData" :pagination="{ pageSize: 10 }" striped />
          </div>
        </div>
      </n-tab-pane>

      <!-- 对账中心 -->
      <n-tab-pane name="reconciliation" tab="📋 对账中心">
        <div class="tab-content">
          <n-grid :cols="4" :x-gap="20" :y-gap="20" style="margin-bottom: 20px;">
            <n-gi>
              <div class="stat-card success"><span class="label">对账成功</span><span class="value">1,258</span></div>
            </n-gi>
            <n-gi>
              <div class="stat-card warning"><span class="label">待处理</span><span class="value">23</span></div>
            </n-gi>
            <n-gi>
              <div class="stat-card error"><span class="label">异常订单</span><span class="value">5</span></div>
            </n-gi>
            <n-gi>
              <div class="stat-card"><span class="label">退款中</span><span class="value">12</span></div>
            </n-gi>
          </n-grid>

          <div class="section-card">
            <div class="section-header">
              <h3>异常订单</h3>
            </div>
            <n-data-table :columns="exceptionColumns" :data="exceptionData" :pagination="{ pageSize: 8 }" striped />
          </div>
        </div>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, h, onMounted, nextTick } from 'vue'
import {
  NButton, NIcon, NSpace, NTabs, NTabPane, NGrid, NGi,
  NDataTable, NTag, NDatePicker, NSelect
} from 'naive-ui'
import * as echarts from 'echarts/core'
import { LineChart, PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import {
  TrendingUpOutline, WalletOutline, CardOutline, ReceiptOutline,
  DownloadOutline
} from '@vicons/ionicons5'

echarts.use([LineChart, PieChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer])

const dateRange = ref(null)
const activeTab = ref('overview')
const revenueChartRef = ref<HTMLElement | null>(null)
const incomeChartRef = ref<HTMLElement | null>(null)
let revenueChart: echarts.ECharts | null = null
let incomeChart: echarts.ECharts | null = null

const statusOptions = [
  { label: '全部', value: 'all' },
  { label: '已结算', value: 'settled' },
  { label: '待结算', value: 'pending' },
]

// 交易记录
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

// 结算记录
const settlementColumns = [
  { title: '结算单号', key: 'no', width: 160 },
  { title: '店铺', key: 'store' },
  { title: '结算周期', key: 'period' },
  { title: '结算金额', key: 'amount', render: (row: any) => `¥${row.amount.toLocaleString()}` },
  { title: '手续费', key: 'fee', render: (row: any) => `¥${row.fee}` },
  { title: '状态', key: 'status', render: (row: any) => h(NTag, { type: row.status === 'done' ? 'success' : row.status === 'pending' ? 'warning' : 'info', size: 'small' }, () => row.statusText) },
  { title: '打款时间', key: 'time' },
]

const settlementData = [
  { no: 'ST2026042001', store: '深圳福田旗舰店', period: '2026-04-13 ~ 2026-04-19', amount: 85623, fee: 2568.69, status: 'done', statusText: '已打款', time: '2026-04-20 10:00' },
  { no: 'ST2026042002', store: '南山科技园店', period: '2026-04-13 ~ 2026-04-19', amount: 52340, fee: 1570.20, status: 'done', statusText: '已打款', time: '2026-04-20 10:00' },
  { no: 'ST2026042003', store: '广州天河店', period: '2026-04-13 ~ 2026-04-19', amount: 78230, fee: 2346.90, status: 'pending', statusText: '待打款', time: '-' },
  { no: 'ST2026042004', store: '北京朝阳店', period: '2026-04-13 ~ 2026-04-19', amount: 45680, fee: 1370.40, status: 'processing', statusText: '处理中', time: '-' },
]

// 异常订单
const exceptionColumns = [
  { title: '订单号', key: 'orderNo' },
  { title: '店铺', key: 'store' },
  { title: '金额', key: 'amount' },
  { title: '异常类型', key: 'type', render: (row: any) => h(NTag, { type: row.type === '金额异常' ? 'error' : 'warning', size: 'small' }, () => row.type) },
  { title: '原因', key: 'reason' },
  { title: '时间', key: 'time' },
  { title: '操作', key: 'action', render: () => h(NButton, { size: 'tiny', secondary: true }, () => '处理') },
]

const exceptionData = [
  { orderNo: 'VR20260419001', store: '深圳福田旗舰店', amount: '¥128.00', type: '金额异常', reason: '支付金额与订单不符', time: '2026-04-19 18:30' },
  { orderNo: 'VR20260419002', store: '南山科技园店', amount: '¥99.00', type: '重复支付', reason: '同一订单出现两次支付记录', time: '2026-04-19 16:45' },
]

function initCharts() {
  nextTick(() => {
    // 只初始化收入趋势图（在 overview tab 内，需要等 tab 激活）
    if (activeTab.value !== 'overview') return
    initRevenueChart()
    initIncomeChart()
  })
}

function initRevenueChart() {
  if (!revenueChartRef.value) return
  if (revenueChart) revenueChart.dispose()
  revenueChart = echarts.init(revenueChartRef.value)
  revenueChart.setOption({
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#eee' },
    grid: { left: 48, right: 16, top: 24, bottom: 32 },
    xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'], axisLine: { lineStyle: { color: '#e2e8f0' } }, axisLabel: { color: '#64748b' } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } }, axisLabel: { color: '#64748b', formatter: '¥{value}k' } },
    series: [
      {
        type: 'line', smooth: true, data: [320, 380, 420, 480, 520, 580],
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(59,130,246,0.2)' }, { offset: 1, color: 'rgba(59,130,246,0)' }]) },
        lineStyle: { width: 3, color: '#3B82F6' },
        itemStyle: { color: '#3B82F6' }
      }
    ]
  })
}

function initIncomeChart() {
  if (!incomeChartRef.value) return
  if (incomeChart) incomeChart.dispose()
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

function handleTabChange(tab: string) {
  activeTab.value = tab
  if (tab === 'overview') {
    nextTick(() => {
      initRevenueChart()
      initIncomeChart()
    })
  }
}

onMounted(() => {
  // 初始 tab 是 overview，延迟初始化（等待 DOM 渲染完成）
  setTimeout(() => initCharts(), 100)
  window.addEventListener('resize', () => {
    revenueChart?.resize()
    incomeChart?.resize()
  })
})
</script>
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); }

.metrics-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.metric-card { background: white; border-radius: 14px; padding: 20px; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 16px; }
.metric-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.metric-content { display: flex; flex-direction: column; }
.metric-content .label { font-size: 12px; color: var(--text-muted); }
.metric-content .value { font-family: 'Orbitron', sans-serif; font-size: 22px; font-weight: 700; color: var(--text-primary); }
.metric-content .value.warning { color: #F59E0B; }
.metric-content .trend { font-size: 12px; color: #10B981; font-weight: 600; }
.metric-content .sub-text { font-size: 11px; color: var(--text-muted); }

.tab-content { padding-top: 16px; }

.chart-card { background: white; border-radius: 16px; padding: 22px; border: 1px solid var(--border-color); }
.chart-header { margin-bottom: 16px; }
.chart-header h3 { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.chart-container { width: 100%; height: 280px; }

.section-card { background: white; border-radius: 16px; padding: 22px; border: 1px solid var(--border-color); margin-top: 20px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-header h3 { font-size: 15px; font-weight: 600; color: var(--text-primary); }

.stat-card { background: white; border-radius: 12px; padding: 20px; text-align: center; border: 1px solid var(--border-color); }
.stat-card .label { font-size: 12px; color: var(--text-muted); display: block; }
.stat-card .value { font-family: 'Orbitron', sans-serif; font-size: 26px; font-weight: 700; color: var(--text-primary); display: block; margin: 8px 0; }
.stat-card .value.warning { color: #F59E0B; }
.stat-card .sub { font-size: 11px; color: var(--text-muted); }
.stat-card.success { border-color: rgba(16,185,129,0.3); background: linear-gradient(180deg, rgba(16,185,129,0.05), white); }
.stat-card.warning { border-color: rgba(245,158,11,0.3); background: linear-gradient(180deg, rgba(245,158,11,0.05), white); }
.stat-card.error { border-color: rgba(239,68,68,0.3); background: linear-gradient(180deg, rgba(239,68,68,0.05), white); }
</style>
