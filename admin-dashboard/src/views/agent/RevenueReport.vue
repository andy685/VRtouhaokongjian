<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>营收统计</h1>
      <n-space>
        <n-date-picker type="daterange" clearable size="small" v-model:value="dateRange" />
        <n-button secondary size="small">
          <template #icon><n-icon :component="DownloadOutline" /></template> 导出报表
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
          <span class="label">总营收</span>
          <n-tooltip trigger="hover">
            <template #trigger><span style="cursor:help; color: var(--text-muted); font-size: 11px; margin-left: 2px;">ⓘ</span></template>
            旗下所有商家店铺的所有入账金额总和（充值、商品销售、项目消费、点播等）
          </n-tooltip>
          <span class="value primary">¥896,420</span>
          <span class="trend up">↑ 15.2%</span>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="CartOutline" size="22" color="#fff" />
        </div>
        <div class="metric-content">
          <span class="label">交易笔数</span>
          <n-tooltip trigger="hover">
            <template #trigger><span style="cursor:help; color: var(--text-muted); font-size: 11px; margin-left: 2px;">ⓘ</span></template>
            所有入账类型合计（充值、商品销售、项目消费、点播等）
          </n-tooltip>
          <span class="value" style="color:#10B981;">4,328</span>
          <span class="trend up">↑ 15.7%</span>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="StorefrontOutline" size="22" color="#fff" />
        </div>
        <div class="metric-content">
          <span class="label">活跃商家</span>
          <n-tooltip trigger="hover">
            <template #trigger><span style="cursor:help; color: var(--text-muted); font-size: 11px; margin-left: 2px;">ⓘ</span></template>
            统计周期内有产生消费记录的商家数量
          </n-tooltip>
          <span class="value">18</span>
          <span class="trend up">↑ 2</span>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
          <n-icon :component="StatsChartOutline" size="22" color="#fff" />
        </div>
        <div class="metric-content">
          <span class="label">日均营收</span>
          <n-tooltip trigger="hover">
            <template #trigger><span style="cursor:help; color: var(--text-muted); font-size: 11px; margin-left: 2px;">ⓘ</span></template>
            统计周期内总营收 ÷ 天数
          </n-tooltip>
          <span class="value" style="color:#8B5CF6;">¥29,881</span>
          <span class="trend good">↑ 12.1%</span>
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
          <h3>商家营收占比</h3>
        </div>
        <div ref="merchantPieRef" class="chart-container"></div>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <h3>商家营收排行</h3>
        </div>
        <div class="rank-list">
          <div v-for="(item, idx) in merchantRank" :key="item.name" class="rank-item">
            <span class="rank-num" :class="{ gold: idx === 0, silver: idx === 1, bronze: idx === 2 }">{{ idx + 1 }}</span>
            <div class="rank-info">
              <span class="rank-name">{{ item.name }}</span>
              <div class="rank-bar-wrap">
                <div class="rank-bar" :style="{ width: item.percentage + '%' }"></div>
              </div>
            </div>
            <span class="rank-value">¥{{ item.value.toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 商家营收明细 -->
    <div class="section-card">
      <div class="section-header">
        <h3>商家营收明细</h3>
        <n-space>
          <n-select size="small" placeholder="全部商家" v-model:value="filterMerchant" :options="merchantOptions" clearable style="width: 140px;" />
          <n-input placeholder="搜索商家名称..." size="small" style="width: 160px;" />
        </n-space>
      </div>
      <n-data-table :columns="columns" :data="filteredTableData" :pagination="{ pageSize: 10 }" striped />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, h } from 'vue'
import {
  NButton, NIcon, NSpace, NDatePicker, NRadioGroup, NRadioButton,
  NDataTable, NTag, NSelect, NInput, NTooltip
} from 'naive-ui'
import * as echarts from 'echarts/core'
import { LineChart, PieChart, BarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent, GraphicComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import {
  DownloadOutline, CashOutline, CartOutline,
  StorefrontOutline, StatsChartOutline
} from '@vicons/ionicons5'

echarts.use([LineChart, PieChart, BarChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, GraphicComponent, CanvasRenderer])

const dateRange = ref(null)
const revenueType = ref('month')
const filterMerchant = ref(null)
const revenueChartRef = ref<HTMLElement>()
const merchantPieRef = ref<HTMLElement>()

const merchantOptions = [
  { label: '全部商家', value: null },
  { label: '广州天河VR体验馆', value: 'merchant1' },
  { label: '深圳南山头号空间', value: 'merchant2' },
  { label: '成都春熙路VR店', value: 'merchant3' },
  { label: '北京朝阳VR乐园', value: 'merchant4' },
]

// 商家营收排行榜
const merchantRank = ref([
  { name: '广州天河VR体验馆', value: 198600, percentage: 100 },
  { name: '深圳南山头号空间', value: 176200, percentage: 89 },
  { name: '成都春熙路VR店', value: 153800, percentage: 77 },
  { name: '北京朝阳VR乐园', value: 132400, percentage: 67 },
  { name: '杭州西湖VR世界', value: 98500, percentage: 50 },
])

// 表格列
const columns = [
  { title: '商家名称', key: 'merchant', width: 180 },
  { title: '店铺数', key: 'storeCount', width: 80 },
  {
    title: '当月营收',
    key: 'revenue',
    width: 120,
    render: (row: any) => `¥${row.revenue.toLocaleString()}`,
    sorter: (a: any, b: any) => a.revenue - b.revenue,
  },
  {
    title: '交易笔数',
    key: 'orderCount',
    width: 90,
    render: (row: any) => h('span', { style: 'font-weight:600;color:var(--text-primary);' }, row.orderCount.toLocaleString()),
    sorter: (a: any, b: any) => a.orderCount - b.orderCount,
  },
  {
    title: '日均营收',
    key: 'dailyAvg',
    width: 110,
    render: (row: any) => `¥${row.dailyAvg.toLocaleString()}`,
  },
  {
    title: '环比',
    key: 'mom',
    width: 90,
    render: (row: any) =>
      h('span', { style: `color:${row.mom >= 0 ? '#10B981':'#EF4444'};font-weight:600;` }, `${row.mom >= 0 ? '+' : ''}${row.mom}%`),
  },
  { title: '更新时间', key: 'updateTime', width: 150 },
]

const tableData = ref([
  { merchant: '广州天河VR体验馆', storeCount: 5, revenue: 198600, orderCount: 980, dailyAvg: 6620, mom: 12.3, updateTime: '2026-04-30 10:25' },
  { merchant: '深圳南山头号空间', storeCount: 3, revenue: 176200, orderCount: 802, dailyAvg: 5873, mom: 8.7, updateTime: '2026-04-30 09:18' },
  { merchant: '成都春熙路VR店', storeCount: 4, revenue: 153800, orderCount: 704, dailyAvg: 5127, mom: -2.1, updateTime: '2026-04-30 08:45' },
  { merchant: '北京朝阳VR乐园', storeCount: 6, revenue: 132400, orderCount: 652, dailyAvg: 4413, mom: 15.6, updateTime: '2026-04-30 07:30' },
  { merchant: '杭州西湖VR世界', storeCount: 2, revenue: 98500, orderCount: 486, dailyAvg: 3283, mom: 6.2, updateTime: '2026-04-29 22:10' },
  { merchant: '武汉光谷VR中心', storeCount: 3, revenue: 76200, orderCount: 376, dailyAvg: 2540, mom: -4.8, updateTime: '2026-04-29 20:55' },
  { merchant: '南京新街口VR城', storeCount: 2, revenue: 60720, orderCount: 328, dailyAvg: 2024, mom: 3.4, updateTime: '2026-04-29 18:20' },
])

const filteredTableData = computed(() => {
  if (!filterMerchant.value) return tableData.value
  // 实际按商家筛选逻辑
  return tableData.value
})

function initCharts() {
  nextTick(() => {
    if (revenueChartRef.value) {
      const chart = echarts.init(revenueChartRef.value)
      chart.setOption({
        tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#eee', textStyle: { color: '#333' } },
        legend: { data: ['总营收', '交易笔数'], bottom: 0, textStyle: { fontSize: 11, color: '#64748b' } },
        grid: { left: 56, right: 24, top: 16, bottom: 40 },
        xAxis: {
          type: 'category',
          data: ['11月', '12月', '1月', '2月', '3月', '4月'],
          axisLine: { lineStyle: { color: '#e2e8f0' } },
          axisLabel: { color: '#64748b' }
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
          axisLabel: { color: '#64748b', formatter: (v: number) => v >= 10000 ? (v / 10000).toFixed(1) + 'w' : v }
        },
        series: [
          {
            name: '总营收',
            type: 'bar',
            data: [652000, 723000, 698000, 785000, 842000, 896420],
            barWidth: '35%',
            itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#3B82F6' }, { offset: 1, color: 'rgba(59,130,246,0.5)' }]), borderRadius: [4, 4, 0, 0] }
          },
          {
            name: '交易笔数',
            type: 'line',
            data: [3180, 3620, 3410, 3950, 4180, 4328],
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: { color: '#10B981', width: 2.5 },
            itemStyle: { color: '#10B981' },
            areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(16,185,129,0.25)' }, { offset: 1, color: 'rgba(16,185,129,0)' }]) }
          }
        ]
      })
      window.addEventListener('resize', () => chart.resize())
    }

    if (merchantPieRef.value) {
      const chart = echarts.init(merchantPieRef.value)
      chart.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: ¥{c} ({d}%)' },
        series: [{
          type: 'pie',
          radius: ['42%', '70%'],
          center: ['50%', '50%'],
          label: { show: true, fontSize: 10.5, color: '#64748b', formatter: '{b}\n{d}%' },
          data: [
            { value: 198600, name: '广州天河', itemStyle: { color: '#3B82F6' } },
            { value: 176200, name: '深圳南山', itemStyle: { color: '#10B981' } },
            { value: 153800, name: '成都春熙', itemStyle: { color: '#F59E0B' } },
            { value: 132400, name: '北京朝阳', itemStyle: { color: '#8B5CF6' } },
            { value: 235420, name: '其他商家', itemStyle: { color: '#94A3B8' } },
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
.metric-content .trend { font-size: 12px; font-weight: 600; margin-top: 2px; }
.metric-content .trend.up { color: #10B981; }
.metric-content .trend.down { color: #EF4444; }
.metric-content .trend.good { color: #10B981; }

.charts-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 20px; margin-bottom: 24px; }
.chart-card { background: white; border-radius: 16px; padding: 22px; border: 1px solid var(--border-color); }
.chart-large { grid-column: span 1; }
.chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.chart-header h3 { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.chart-container { width: 100%; height: 280px; }

.rank-list { padding: 4px 0; }
.rank-item { display: flex; align-items: center; gap: 12px; padding: 9px 0; }
.rank-num { width: 22px; height: 22px; border-radius: 6px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: var(--text-muted); flex-shrink: 0; }
.rank-num.gold { background: linear-gradient(135deg, #FEF3C7, #FDE68A); color: #D97706; }
.rank-num.silver { background: linear-gradient(135deg, #F1F5F9, #E2E8F0); color: #64748B; }
.rank-num.bronze { background: linear-gradient(135deg, #FFEDD5, #FED7AA); color: #C27D3B; }
.rank-info { flex: 1; }
.rank-name { font-size: 13px; font-weight: 500; color: var(--text-primary); display: block; margin-bottom: 4px; }
.rank-bar-wrap { height: 4px; background: #f1f5f9; border-radius: 2px; overflow: hidden; }
.rank-bar { height: 100%; background: linear-gradient(90deg, #3B82F6, #93C5FD); border-radius: 2px; }
.rank-value { font-size: 12px; color: var(--text-muted); font-weight: 600; flex-shrink: 0; }

.section-card { background: white; border-radius: 16px; padding: 22px; border: 1px solid var(--border-color); }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-header h3 { font-size: 15px; font-weight: 600; color: var(--text-primary); }
</style>
