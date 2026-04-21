<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>营业报表</h1>
      <n-space>
        <n-date-picker type="daterange" clearable size="small" v-model:value="dateRange" />
        <n-button secondary size="small">
          <template #icon><n-icon :component="DownloadOutline" /></template> 导出Excel
        </n-button>
      </n-space>
    </div>
    
    <!-- 核心指标 -->
    <div class="metrics-row">
      <div class="metric-card">
        <div class="metric-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="CashOutline" size="22" color="#fff" />
        </div>
        <div class="metric-content">
          <span class="label">今日营收</span>
          <span class="value primary">¥15,680</span>
          <span class="trend up">↑ 12.3%</span>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="PeopleOutline" size="22" color="#fff" />
        </div>
        <div class="metric-content">
          <span class="label">客单价</span>
          <span class="value">¥182</span>
          <span class="trend up">↑ 5.2%</span>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="CartOutline" size="22" color="#fff" />
        </div>
        <div class="metric-content">
          <span class="label">订单数</span>
          <span class="value">86</span>
          <span class="trend down">↓ 2.1%</span>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon" style="background: linear-gradient(135deg, #EF4444, #DC2626);">
          <n-icon :component="RefreshOutline" size="22" color="#fff" />
        </div>
        <div class="metric-content">
          <span class="label">退款率</span>
          <span class="value">1.2%</span>
          <span class="trend good">↓ 0.5%</span>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-grid">
      <div class="chart-card chart-large">
        <div class="chart-header">
          <h3>营收趋势</h3>
          <n-radio-group v-model:value="revenueType" size="small">
            <n-radio-button value="day">日</n-radio-button>
            <n-radio-button value="week">周</n-radio-button>
            <n-radio-button value="month">月</n-radio-button>
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

      <div class="chart-card">
        <div class="chart-header">
          <h3>游戏热度</h3>
        </div>
        <div class="game-rank">
          <div v-for="(game, idx) in topGames" :key="game.name" class="rank-item">
            <span class="rank-num" :class="{ gold: idx === 0, silver: idx === 1, bronze: idx === 2 }">{{ idx + 1 }}</span>
            <div class="rank-info">
              <span class="rank-name">{{ game.name }}</span>
              <div class="rank-bar-wrap">
                <div class="rank-bar" :style="{ width: game.percentage + '%' }"></div>
              </div>
            </div>
            <span class="rank-count">{{ game.count }}次</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 订单明细 -->
    <div class="section-card">
      <div class="section-header">
        <h3>订单明细</h3>
        <n-space>
          <n-select size="small" placeholder="订单状态" :options="orderStatusOptions" style="width: 120px;" />
          <n-input placeholder="订单号/会员名..." size="small" style="width: 160px;" />
        </n-space>
      </div>
      <n-data-table :columns="orderColumns" :data="orderData" :pagination="{ pageSize: 10 }" striped />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, h } from 'vue'
import {
  NButton, NIcon, NSpace, NDatePicker, NRadioGroup, NRadioButton,
  NDataTable, NTag, NSelect, NInput
} from 'naive-ui'
import * as echarts from 'echarts/core'
import { LineChart, PieChart, BarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import {
  DownloadOutline, CashOutline, PeopleOutline, CartOutline,
  RefreshOutline
} from '@vicons/ionicons5'

echarts.use([LineChart, PieChart, BarChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer])

const dateRange = ref(null)
const revenueType = ref('day')
const revenueChartRef = ref<HTMLElement>()
const incomeChartRef = ref<HTMLElement>()

const orderStatusOptions = [
  { label: '全部', value: 'all' },
  { label: '已完成', value: 'completed' },
  { label: '已退款', value: 'refunded' },
]

const topGames = ref([
  { name: '过山车VR', count: 28, percentage: 100 },
  { name: '恐怖医院', count: 23, percentage: 82 },
  { name: '极速赛车', count: 19, percentage: 68 },
  { name: '海洋世界', count: 15, percentage: 54 },
  { name: '恐龙王国', count: 12, percentage: 43 },
])

const orderColumns = [
  { title: '订单号', key: 'orderNo', width: 160 },
  { title: '消费类型', key: 'type', render: (row: any) => h(NTag, { size: 'small', bordered: true }, () => row.type) },
  { title: '会员', key: 'member' },
  { title: '金额', key: 'amount', render: (row: any) => `¥${row.amount.toFixed(2)}` },
  { title: '支付方式', key: 'payment', render: (row: any) => h(NTag, { type: row.payment === '微信' ? 'success' : row.payment === '支付宝' ? 'info' : 'warning', size: 'tiny', bordered: true }, () => row.payment) },
  { title: '时间', key: 'time' },
  { title: '状态', key: 'status', render: (row: any) => h(NTag, { type: row.status === 'completed' ? 'success' : 'error', size: 'small', bordered: true }, () => row.statusText) },
]

const orderData = [
  { orderNo: 'VR20260420001', type: 'VR体验', member: '张三 (金卡)', amount: 128, payment: '微信', time: '15:30:25', status: 'completed', statusText: '已完成' },
  { orderNo: 'VR20260420002', type: '会员充值', member: '李四 (银卡)', amount: 500, payment: '支付宝', time: '15:25:10', status: 'completed', statusText: '已完成' },
  { orderNo: 'VR20260420003', type: 'VR体验', member: '散客', amount: 49, payment: '现金', time: '15:20:33', status: 'completed', statusText: '已完成' },
  { orderNo: 'VR20260420004', type: '商品购买', member: '王五 (普通)', amount: 29, payment: '微信', time: '15:15:42', status: 'refunded', statusText: '已退款' },
  { orderNo: 'VR20260420005', type: 'VR体验', member: '赵六 (金卡)', amount: 128, payment: '微信', time: '15:10:18', status: 'completed', statusText: '已完成' },
  { orderNo: 'VR20260420006', type: '次数卡购买', member: '孙七 (普通)', amount: 99, payment: '支付宝', time: '14:58:55', status: 'completed', statusText: '已完成' },
]

function initCharts() {
  nextTick(() => {
    if (revenueChartRef.value) {
      const chart = echarts.init(revenueChartRef.value)
      chart.setOption({
        tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#eee', textStyle: { color: '#333' } },
        grid: { left: 56, right: 24, top: 24, bottom: 32 },
        xAxis: { type: 'category', data: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'], axisLine: { lineStyle: { color: '#e2e8f0' } }, axisLabel: { color: '#64748b' } },
        yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } }, axisLabel: { color: '#64748b', formatter: '¥{value}' } },
        series: [
          {
            type: 'bar', data: [1200, 1800, 2400, 3200, 2800, 2100, 1560, 980],
            barWidth: '50%',
            itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#3B82F6' }, { offset: 1, color: 'rgba(59,130,246,0.6)' }]), borderRadius: [4, 4, 0, 0] }
          }
        ]
      })
      window.addEventListener('resize', () => chart.resize())
    }

    if (incomeChartRef.value) {
      const chart = echarts.init(incomeChartRef.value)
      chart.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: ¥{c} ({d}%)' },
        series: [{
          type: 'pie',
          radius: ['45%', '72%'],
          center: ['50%', '50%'],
          label: { show: true, fontSize: 11, color: '#64748b' },
          data: [
            { value: 6800, name: 'VR体验', itemStyle: { color: '#3B82F6' } },
            { value: 4200, name: '会员充值', itemStyle: { color: '#10B981' } },
            { value: 2800, name: '实体商品', itemStyle: { color: '#F59E0B' } },
            { value: 1880, name: '其他', itemStyle: { color: '#8B5CF6' } },
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
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); }

.metrics-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.metric-card { background: white; border-radius: 14px; padding: 20px; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 16px; }
.metric-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.metric-content { display: flex; flex-direction: column; }
.metric-content .label { font-size: 12px; color: var(--text-muted); }
.metric-content .value { font-family: 'Orbitron', sans-serif; font-size: 22px; font-weight: 700; color: var(--text-primary); }
.metric-content .value.primary { color: #3B82F6; }
.metric-content .trend { font-size: 12px; font-weight: 600; }
.metric-content .trend.up { color: #10B981; }
.metric-content .trend.down { color: #EF4444; }
.metric-content .trend.good { color: #10B981; }

.charts-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 20px; margin-bottom: 24px; }
.chart-card { background: white; border-radius: 16px; padding: 22px; border: 1px solid var(--border-color); }
.chart-large { grid-column: span 1; }
.chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.chart-header h3 { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.chart-container { width: 100%; height: 260px; }

.game-rank { padding: 8px 0; }
.rank-item { display: flex; align-items: center; gap: 12px; padding: 8px 0; }
.rank-num { width: 22px; height: 22px; border-radius: 6px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: var(--text-muted); flex-shrink: 0; }
.rank-num.gold { background: linear-gradient(135deg, #FEF3C7, #FDE68A); color: #D97706; }
.rank-num.silver { background: linear-gradient(135deg, #F1F5F9, #E2E8F0); color: #64748B; }
.rank-num.bronze { background: linear-gradient(135deg, #FFEDD5, #FED7AA); color: #C27D3B; }
.rank-info { flex: 1; }
.rank-name { font-size: 13px; font-weight: 500; color: var(--text-primary); display: block; margin-bottom: 4px; }
.rank-bar-wrap { height: 4px; background: #f1f5f9; border-radius: 2px; overflow: hidden; }
.rank-bar { height: 100%; background: linear-gradient(90deg, #3B82F6, #93C5FD); border-radius: 2px; }
.rank-count { font-size: 12px; color: var(--text-muted); font-weight: 600; flex-shrink: 0; }

.section-card { background: white; border-radius: 16px; padding: 22px; border: 1px solid var(--border-color); }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-header h3 { font-size: 15px; font-weight: 600; color: var(--text-primary); }
</style>
