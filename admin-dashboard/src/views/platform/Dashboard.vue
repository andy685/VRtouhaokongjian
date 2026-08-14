<template>
  <div class="platform-dashboard">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-title">
        <h1>数据中心</h1>
        <span class="header-desc">平台全局运营概览</span>
      </div>
      <div class="header-actions">
        <n-date-picker type="daterange" clearable size="small" />
        <n-button secondary size="small">导出报表</n-button>
      </div>
    </div>

    <!-- 核心指标卡片 -->
    <div class="metrics-grid">
      <div 
        v-for="(metric, index) in metrics" 
        :key="metric.label"
        class="metric-card card-hover animate-fade-in"
        :style="{ animationDelay: `${index * 0.08}s` }"
      >
        <div class="metric-header">
          <div class="metric-icon" :style="{ background: metric.gradient }">
            <n-icon :component="metric.icon" size="24" color="#fff" />
          </div>
          <n-tag v-if="metric.trend !== null" :type="metric.trend > 0 ? 'success' : 'error'" size="small" bordered>
            {{ metric.trend > 0 ? '+' : '' }}{{ metric.trend }}%
          </n-tag>
        </div>
        <div class="metric-body">
          <div class="metric-value">
            <span class="value-prefix">{{ metric.prefix }}</span>
            <count-up :end-val="metric.value" :duration="1.5" />
            <span v-if="metric.suffix">{{ metric.suffix }}</span>
          </div>
          <div class="metric-label">{{ metric.label }}</div>
        </div>
        <div v-if="metric.sparkData.length" class="metric-footer">
          <div class="mini-chart">
            <svg viewBox="0 0 100 24" preserveAspectRatio="none">
              <polyline
                :points="generateSparkline(metric.sparkData)"
                fill="none"
                :stroke="metric.color"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <span class="compare-label">较昨日</span>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-stack">
      <!-- 游戏豆销售趋势 -->
      <div class="chart-card chart-large">
        <div class="chart-header">
          <div>
            <h3>游戏豆销售趋势</h3>
            <p>{{ revenuePeriodMap[currentPeriod].title }}</p>
          </div>
          <n-radio-group v-model:value="currentPeriod" size="small">
            <n-radio-button value="week">周</n-radio-button>
            <n-radio-button value="month">月</n-radio-button>
            <n-radio-button value="year">年</n-radio-button>
          </n-radio-group>
        </div>
        <div ref="revenueChartRef" class="chart-container"></div>
      </div>

      <div class="charts-row">
        <!-- 店铺分布 -->
        <div class="chart-card">
          <div class="chart-header">
            <div>
              <h3>店铺分布</h3>
              <p>各地区店铺数量</p>
            </div>
          </div>
          <div ref="storeChartRef" class="chart-container"></div>
          <div class="store-region-list">
            <div v-for="region in storeRegionStats" :key="region.name" class="store-region-item">
              <span class="region-name">{{ region.name }}</span>
              <span class="region-meta">{{ region.count }}家 · {{ region.percent }}%</span>
            </div>
          </div>
        </div>

        <!-- 游戏热度排行 -->
        <div class="chart-card">
          <div class="chart-header">
            <div>
              <h3>游戏TOP10</h3>
              <p>全平台最受欢迎游戏</p>
            </div>
          </div>
          <div class="game-rank-list">
            <div
              v-for="(game, idx) in topGames"
              :key="game.name"
              class="rank-item"
            >
              <span class="rank-num" :class="{ 'top-three': idx < 3 }">{{ idx + 1 }}</span>
              <div class="rank-info">
                <span class="rank-name">{{ game.name }}</span>
                <div class="rank-bar-wrap">
                  <div class="rank-bar" :style="{ width: game.percentage + '%', background: getRankColor(idx) }"></div>
                </div>
              </div>
              <span class="rank-count">{{ game.count.toLocaleString() }}次</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 店铺列表预览 -->
    <div class="section-card">
      <div class="section-header">
        <h2>店铺监控</h2>
        <n-input placeholder="搜索店铺..." size="small" style="width: 200px;">
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
      </div>
      
      <n-data-table
        :columns="storeColumns"
        :data="storeList"
        :pagination="{ pageSize: 8 }"
        striped
        :row-class-name="() => 'table-row'"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch, h } from 'vue'
import {
  NButton, NIcon, NTag, NDatePicker, NRadioGroup,
  NRadioButton, NInput, NDataTable
} from 'naive-ui'
import * as echarts from 'echarts/core'
import { LineChart, PieChart, BarChart } from 'echarts/charts'
import {
  TitleComponent, TooltipComponent, GridComponent,
  LegendComponent, DatasetComponent, GraphicComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import {
  TrendingUpOutline, PeopleOutline, HardwareChipOutline,
  StorefrontOutline, SearchOutline
} from '@vicons/ionicons5'

echarts.use([
  LineChart, PieChart, BarChart,
  TitleComponent, TooltipComponent, GridComponent,
  LegendComponent, DatasetComponent, GraphicComponent, CanvasRenderer
])

// CountUp 组件（简化版）
const CountUp = {
  props: ['endVal', 'duration'],
  setup(props: any) {
    const displayVal = ref(0)
    onMounted(() => {
      const startTime = Date.now()
      const step = () => {
        const elapsed = (Date.now() - startTime) / (props.duration * 1000)
        if (elapsed >= 1) { displayVal.value = props.endVal; return }
        displayVal.value = Math.floor(props.endVal * elapsed)
        requestAnimationFrame(step)
      }
      step()
    })
    return () => h('span', { class: 'count-number' }, displayVal.value.toLocaleString())
  }
}

// 核心指标数据 - 平台视角（游戏豆销售、内容消费、设备、会员）
const metrics = ref([
  {
    label: '今日游戏豆销售',
    prefix: '¥',
    value: 86580,
    suffix: '',
    trend: 12.5,
    icon: TrendingUpOutline,
    gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)',
    color: '#3B82F6',
    sparkData: [50, 55, 48, 62, 58, 72, 68]
  },
  {
    label: '今日游戏豆消耗',
    prefix: '',
    value: 45680,
    suffix: '豆',
    trend: 8.3,
    icon: HardwareChipOutline,
    gradient: 'linear-gradient(135deg, #10B981, #059669)',
    color: '#10B981',
    sparkData: [32000, 34000, 31000, 38000, 40000, 43000, 45680]
  },
  {
    label: '今日点播次数',
    prefix: '',
    value: 3286,
    suffix: '次',
    trend: 15.2,
    icon: PeopleOutline,
    gradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
    color: '#F59E0B',
    sparkData: [2100, 2300, 2500, 2700, 2900, 3100, 3286]
  },
  {
    label: '设备在线率',
    prefix: '',
    value: 94.2,
    suffix: '%',
    trend: null,
    icon: StorefrontOutline,
    gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
    color: '#8B5CF6',
    sparkData: []
  }
])

// TOP游戏排行
const topGames = ref([
  { name: '过山车VR', count: 15860, percentage: 95 },
  { name: '恐怖医院', count: 13240, percentage: 82 },
  { name: '极速赛车', count: 10890, percentage: 70 },
  { name: '海洋世界', count: 8920, percentage: 58 },
  { name: '恐龙王国', count: 7560, percentage: 48 },
  { name: 'CS对战', count: 6890, percentage: 44 },
  { name: '音乐节VR', count: 5430, percentage: 35 },
  { name: '太空探险', count: 4820, percentage: 31 },
  { name: '丛林跑酷', count: 4360, percentage: 28 },
  { name: '星际射击', count: 4010, percentage: 26 },
])

// 店铺列表
const storeColumns = [
  { title: '店铺名称', key: 'name' },
  { title: '地区', key: 'region' },
  {
    title: '状态',
    key: 'status',
    render(row: any) {
      return h(NTag, { type: row.status === 'online' ? 'success' : 'warning', size: 'small', bordered: true }, { default: () => row.statusText })
    }
  },
  { title: '设备数', key: 'devices' },
  { title: '游戏豆余额', key: 'beanBalance' },
  { title: '今日消耗', key: 'beanConsume' },
  { title: '设备在线率', key: 'deviceRate' },
]

const storeList = ref([
  { name: '深圳福田旗舰店', region: '深圳', status: 'online', statusText: '营业中', devices: 12, beanBalance: '8,500', beanConsume: 320, deviceRate: '92%' },
  { name: '南山科技园店', region: '深圳', status: 'online', statusText: '营业中', devices: 8, beanBalance: '5,200', beanConsume: 180, deviceRate: '100%' },
  { name: '广州天河店', region: '广州', status: 'online', statusText: '营业中', devices: 16, beanBalance: '12,000', beanConsume: 450, deviceRate: '88%' },
  { name: '北京朝阳店', region: '北京', status: 'offline', statusText: '已打烊', devices: 14, beanBalance: '6,800', beanConsume: 0, deviceRate: '0%' },
  { name: '上海浦东店', region: '上海', status: 'online', statusText: '营业中', devices: 20, beanBalance: '15,600', beanConsume: 580, deviceRate: '95%' },
  { name: '成都太古里店', region: '成都', status: 'online', statusText: '营业中', devices: 10, beanBalance: '4,200', beanConsume: 210, deviceRate: '90%' },
  { name: '杭州西湖店', region: '杭州', status: 'maintain', statusText: '维护中', devices: 8, beanBalance: '3,800', beanConsume: 0, deviceRate: '75%' },
  { name: '武汉光谷店', region: '武汉', status: 'online', statusText: '营业中', devices: 11, beanBalance: '7,100', beanConsume: 290, deviceRate: '91%' },
])

const currentPeriod = ref<'week' | 'month' | 'year'>('week')
const revenueChartRef = ref<HTMLElement>()
const storeChartRef = ref<HTMLElement>()

function generateSparkline(data: number[]) {
  const max = Math.max(...data)
  return data.map((v, i) => `${i * (100 / (data.length - 1))},${24 - (v / max * 22)}`).join(' ')
}

function getRankColor(idx: number): string {
  if (idx === 0) return 'linear-gradient(90deg, #F59E0B, #FBBF24)'
  if (idx === 1) return 'linear-gradient(90deg, #94A3B8, #CBD5E1)'
  if (idx === 2) return 'linear-gradient(90deg, #CD7C4A, #E8A87C)'
  return 'linear-gradient(90deg, #3B82F6, #93C5FD)'
}

const revenuePeriodMap = {
  week: {
    title: '近7天平台游戏豆销售额变化',
    labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    data: [185, 210, 195, 230, 245, 280, 286]
  },
  month: {
    title: '近30天平台游戏豆销售额变化',
    labels: ['1日', '5日', '10日', '15日', '20日', '25日', '30日'],
    data: [820, 910, 865, 980, 1030, 1125, 1210]
  },
  year: {
    title: '近12个月平台游戏豆销售额变化',
    labels: ['1月', '3月', '5月', '7月', '9月', '11月', '12月'],
    data: [5600, 6100, 6480, 7200, 6850, 8300, 9100]
  }
} as const

const storeRegionStats = [
  { name: '深圳', count: 42, percent: 26.9 },
  { name: '广州', count: 38, percent: 24.4 },
  { name: '北京', count: 32, percent: 20.5 },
  { name: '上海', count: 28, percent: 17.9 },
  { name: '其他', count: 16, percent: 10.3 }
]

function renderRevenueChart(period: keyof typeof revenuePeriodMap) {
  if (!revenueChartRef.value) return
  const chart = echarts.getInstanceByDom(revenueChartRef.value) || echarts.init(revenueChartRef.value)
  const config = revenuePeriodMap[period]
  chart.setOption({
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#eee', textStyle: { color: '#333' } },
    grid: { left: 48, right: 16, top: 24, bottom: 28 },
    xAxis: { type: 'category', data: config.labels, axisLine: { lineStyle: { color: '#e2e8f0' } }, axisLabel: { color: '#64748b' } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } }, axisLabel: { color: '#64748b', formatter: period === 'week' ? '¥{value}k' : period === 'month' ? '¥{value}k' : '¥{value}k' } },
    series: [{
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      data: config.data,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(59,130,246,0.25)' },
          { offset: 1, color: 'rgba(59,130,246,0)' }
        ])
      },
      lineStyle: { width: 3, color: '#3B82F6' },
      itemStyle: { color: '#3B82F6', borderWidth: 2, borderColor: '#fff' }
    }]
  })
}

function initCharts() {
  nextTick(() => {
    // 营收趋势图
    if (revenueChartRef.value) {
      const revenueChart = echarts.init(revenueChartRef.value)
      revenueChart.setOption({
        tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#eee', textStyle: { color: '#333' } },
        grid: { left: 48, right: 16, top: 24, bottom: 28 },
        xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], axisLine: { lineStyle: { color: '#e2e8f0' } }, axisLabel: { color: '#64748b' } },
        yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } }, axisLabel: { color: '#64748b', formatter: '¥{value}k' } },
        series: [{
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          data: [185, 210, 195, 230, 245, 280, 286],
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59,130,246,0.25)' },
              { offset: 1, color: 'rgba(59,130,246,0)' }
            ])
          },
          lineStyle: { width: 3, color: '#3B82F6' },
          itemStyle: { color: '#3B82F6', borderWidth: 2, borderColor: '#fff' }
        }]
      })
      window.addEventListener('resize', () => revenueChart.resize())
    }

    // 店铺分布图
    if (storeChartRef.value) {
      const storeChart = echarts.init(storeChartRef.value)
      storeChart.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: {c}家 ({d}%)' },
        series: [{
          type: 'pie',
          radius: ['45%', '72%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
          label: { show: true, fontSize: 11, color: '#64748b' },
          emphasis: { label: { show: true, fontSize: 13, fontWeight: 'bold' } },
          data: [
            { value: 42, name: '深圳', itemStyle: { color: '#3B82F6' } },
            { value: 38, name: '广州', itemStyle: { color: '#10B981' } },
            { value: 32, name: '北京', itemStyle: { color: '#F59E0B' } },
            { value: 28, name: '上海', itemStyle: { color: '#EF4444' } },
            { value: 16, name: '其他', itemStyle: { color: '#8B5CF6' } },
          ]
        }]
      })
      window.addEventListener('resize', () => storeChart.resize())
    }
  })
}

watch(currentPeriod, (period) => {
  renderRevenueChart(period)
})

onMounted(() => {
  initCharts()
})
</script>

<style scoped>
.platform-dashboard {
  max-width: 1440px;
}

/* ===== 页面头部 ===== */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
}

.header-title h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.5px;
}

.header-desc {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 4px;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* ===== 指标卡片 ===== */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 28px;
}

.metric-card {
  background: white;
  border-radius: 16px;
  padding: 22px;
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: var(--gradient-brand);
  opacity: 0;
  transition: opacity 0.3s;
}

.metric-card:hover::before { opacity: 1; }

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.metric-icon {
  width: 46px; height: 46px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.metric-body { margin-bottom: 16px; }

.metric-value {
  font-family: 'Orbitron', sans-serif;
  font-size: 30px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.1;
}

.value-prefix {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-right: 2px;
}

.count-number {
  font-family: 'Orbitron', sans-serif !important;
}

.metric-label {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 4px;
}

.metric-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mini-chart {
  width: 80px; height: 24px;
}

.mini-chart svg { width: 100%; height: 100%; }

.compare-label {
  font-size: 11px;
  color: var(--text-muted);
}

/* ===== 图表区域 ===== */
.charts-stack {
  display: grid;
  gap: 20px;
  margin-bottom: 28px;
}

.charts-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.chart-card {
  background: white;
  border-radius: 16px;
  padding: 22px;
  border: 1px solid var(--border-color);
}

.store-region-list {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.store-region-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 12px;
  line-height: 1;
}

.region-name {
  color: var(--text-primary);
  font-weight: 600;
}

.region-meta {
  color: var(--text-muted);
  white-space: nowrap;
}

.chart-large { min-height: 360px; }

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.chart-header h3 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.chart-header p {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}

.chart-container {
  width: 100%;
  min-height: 260px;
}

.game-rank-list { padding: 4px 0; }

.rank-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 0;
  border-bottom: 1px solid #f8fafc;
}

.rank-item:last-child { border-bottom: none; }

.rank-num {
  width: 24px; height: 24px;
  border-radius: 6px;
  background: #f1f5f9;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; color: var(--text-muted);
  flex-shrink: 0;
}

.rank-num.top-three {
  background: linear-gradient(135deg, #FEF3C7, #FDE68A);
  color: #D97706;
}

.rank-info { flex: 1; }

.rank-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  display: block;
  margin-bottom: 4px;
}

.rank-bar-wrap {
  height: 6px;
  background: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
}

.rank-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.rank-count {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  flex-shrink: 0;
}

/* ===== 表格区域 ===== */
.section-card {
  background: white;
  border-radius: 16px;
  padding: 22px;
  border: 1px solid var(--border-color);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.section-header h2 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

:deep(.table-row:hover) {
  background: var(--gradient-glow) !important;
}

@media (max-width: 1200px) {
  .metrics-grid { grid-template-columns: repeat(2, 1fr); }
  .charts-row { grid-template-columns: 1fr; }
  .chart-large { min-height: 320px; }
}
</style>
