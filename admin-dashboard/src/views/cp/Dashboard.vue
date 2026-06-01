<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>数据中心</h1>
        <p class="header-desc">查看游戏数据表现与收益统计</p>
      </div>
      <n-space>
        <n-button size="small" secondary @click="refreshData">
          <template #icon><n-icon :component="RefreshOutline" /></template> 刷新数据
        </n-button>
      </n-space>
    </div>

    <!-- 核心指标卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="GameControllerOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">累计游戏数</span>
          <span class="value">12</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="CheckmarkCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">已上线</span>
          <span class="value">8</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="TimeOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">审核中</span>
          <span class="value warning">2</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
          <n-icon :component="TrendingUpOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">本月体验次数</span>
          <span class="value">3.2K</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #EF4444, #DC2626);">
          <n-icon :component="WalletOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">上月收益</span>
          <span class="value">¥28,450</span>
        </div>
      </div>
    </div>

    <!-- 审核状态提醒 -->
    <div v-if="pendingGames.length" class="alert-card">
      <div class="alert-title">
        <n-icon :component="AlertCircleOutline" size="18" color="#F59E0B" />
        <span>审核状态提醒</span>
      </div>
      <div class="alert-list">
        <div v-for="g in pendingGames" :key="g.id" class="alert-item" :class="g.status">
          <span class="game-name">{{ g.name }}</span>
          <n-tag :type="g.status === 'pending' ? 'warning' : 'error'" size="small" bordered>
            {{ g.status === 'pending' ? '审核中' : '审核不通过' }}
          </n-tag>
          <span v-if="g.reason" class="reason">原因：{{ g.reason }}</span>
          <n-button v-if="g.status === 'rejected'" size="tiny" type="primary" secondary @click="$router.push(`/cp/games/${g.id}`)">修改重提</n-button>
        </div>
      </div>
    </div>

    <!-- 近30天体验趋势 -->
    <div class="chart-card chart-full">
      <div class="chart-header">
        <h3>近30天体验趋势</h3>
        <n-radio-group v-model:value="trendPeriod" size="small">
          <n-radio-button value="day">按日</n-radio-button>
          <n-radio-button value="week">按周</n-radio-button>
          <n-radio-button value="month">按月</n-radio-button>
        </n-radio-group>
      </div>
      <div ref="trendChartRef" class="chart-body chart-body-tall"></div>
    </div>

    <!-- 游戏排行 + 收益趋势 + 收益占比 -->
    <div class="charts-row charts-row-3">
      <div class="chart-card">
        <div class="chart-header">
          <h3>游戏排行榜</h3>
          <n-radio-group v-model:value="rankField" size="small">
            <n-radio-button value="plays">体验次数</n-radio-button>
            <n-radio-button value="revenue">收益</n-radio-button>
          </n-radio-group>
        </div>
        <div class="rank-list">
          <div v-for="(game, idx) in rankedGames" :key="game.id" class="rank-item">
            <span class="rank-num" :class="{ top: idx < 3 }">{{ idx + 1 }}</span>
            <div class="rank-game-info">
              <span class="rank-game-name">{{ game.name }}</span>
              <span class="rank-game-meta">{{ rankField === 'plays' ? (game.plays + ' 次') : ('¥' + game.revenue.toLocaleString()) }}</span>
            </div>
            <div class="rank-bar" :style="{ width: rankBarWidth(idx) + '%' }"></div>
          </div>
        </div>
      </div>
      <div class="chart-card">
        <div class="chart-header">
          <h3>近6个月收益趋势</h3>
          <span class="growth-tag up">环比 ↑ 8.5%</span>
        </div>
        <div ref="revenueChartRef" class="chart-body"></div>
      </div>
      <div class="chart-card">
        <div class="chart-header">
          <h3>各游戏收益占比</h3>
        </div>
        <div class="pie-list">
          <div v-for="(item, idx) in gameRevenuePie" :key="idx" class="pie-item">
            <span class="pie-dot" :style="{ background: colors[idx] }"></span>
            <span class="pie-name">{{ item.name }}</span>
            <span class="pie-pct">{{ item.pct }}%</span>
            <span class="pie-amount">¥{{ item.amount.toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import {
  NButton, NIcon, NTag, NSpace, NRadioGroup, NRadioButton, useMessage
} from 'naive-ui'
import {
  GameControllerOutline, CheckmarkCircleOutline, TimeOutline,
  TrendingUpOutline, WalletOutline, RefreshOutline, AlertCircleOutline,
} from '@vicons/ionicons5'
import * as echarts from 'echarts/core'
import { LineChart, BarChart } from 'echarts/charts'
import {
  TitleComponent, TooltipComponent, GridComponent, LegendComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([LineChart, BarChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer])

const message = useMessage()
const trendPeriod = ref<'day' | 'week' | 'month'>('day')
const rankField = ref('plays')
const trendChartRef = ref<HTMLElement>()
const revenueChartRef = ref<HTMLElement>()
let trendChart: echarts.ECharts | null = null
let revenueChart: echarts.ECharts | null = null

const pendingGames = ref([
  { id: 1, name: '深海探险VR', status: 'pending', reason: '' },
  { id: 2, name: '末日求生', status: 'rejected', reason: '游戏描述与内容不符' },
])

const rankedGames = ref([
  { id: 1, name: '过山车VR', plays: '15.8K', revenue: 125000, playsNum: 15800 },
  { id: 2, name: '恐怖医院', plays: '12.3K', revenue: 98000, playsNum: 12300 },
  { id: 3, name: '极速赛车', plays: '10.5K', revenue: 85000, playsNum: 10500 },
  { id: 4, name: '海洋世界', plays: '8.2K', revenue: 62000, playsNum: 8200 },
  { id: 5, name: '恐龙王国', plays: '6.1K', revenue: 48000, playsNum: 6100 },
  { id: 6, name: '太空探险', plays: '4.5K', revenue: 35000, playsNum: 4500 },
  { id: 7, name: '深海探险', plays: '3.8K', revenue: 28000, playsNum: 3800 },
  { id: 8, name: '末日求生', plays: '2.1K', revenue: 15000, playsNum: 2100 },
])

const monthRevenue = [
  { month: '1月', value: 21000 },
  { month: '2月', value: 18000 },
  { month: '3月', value: 25000 },
  { month: '4月', value: 28000 },
  { month: '5月', value: 31000 },
  { month: '6月', value: 28500 },
]

const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#F97316', '#EC4899']
const gameRevenuePie = [
  { name: '过山车VR', pct: 28, amount: 125000 },
  { name: '恐怖医院', pct: 22, amount: 98000 },
  { name: '极速赛车', pct: 18, amount: 85000 },
  { name: '海洋世界', pct: 14, amount: 62000 },
  { name: '恐龙王国', pct: 10, amount: 48000 },
  { name: '其他游戏', pct: 8, amount: 35000 },
]

function rankBarWidth(idx: number) {
  const max = rankedGames.value[0]?.playsNum || 1
  const val = rankedGames.value[idx]?.playsNum || 0
  return Math.max((val / max) * 100, 5)
}

// 近30天模拟数据
const trendDaily = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1
  const base = 80 + Math.sin(i * 0.3) * 30 + Math.random() * 20
  return { label: `${day}日`, value: Math.round(base) }
})
const trendWeekly = [
  { label: '第1周', value: 580 },
  { label: '第2周', value: 640 },
  { label: '第3周', value: 720 },
  { label: '第4周', value: 690 },
]
const trendMonthly = [
  { label: '1月', value: 2800 },
  { label: '2月', value: 3200 },
  { label: '3月', value: 2900 },
  { label: '4月', value: 3500 },
  { label: '5月', value: 3200 },
  { label: '6月', value: 3800 },
]

function getTrendData() {
  if (trendPeriod.value === 'week') return trendWeekly
  if (trendPeriod.value === 'month') return trendMonthly
  return trendDaily
}

function initTrendChart() {
  if (!trendChartRef.value) return
  if (trendChart) trendChart.dispose()
  trendChart = echarts.init(trendChartRef.value)
  const data = getTrendData()
  trendChart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e2e8f0',
      textStyle: { color: '#334155', fontSize: 12 },
    },
    grid: { left: 40, right: 20, top: 20, bottom: 28 },
    xAxis: {
      type: 'category',
      data: data.map(d => d.label),
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisLabel: { color: '#94a3b8', fontSize: 11 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      name: '体验次数',
      nameTextStyle: { color: '#94a3b8', fontSize: 11 },
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
      axisLabel: { color: '#94a3b8', fontSize: 11 },
    },
    series: [{
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 5,
      data: data.map(d => d.value),
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(59,130,246,0.2)' },
          { offset: 1, color: 'rgba(59,130,246,0)' },
        ]),
      },
      lineStyle: { width: 3, color: '#3B82F6' },
      itemStyle: { color: '#3B82F6', borderWidth: 2, borderColor: '#fff' },
    }],
  })
  window.addEventListener('resize', () => trendChart?.resize())
}

watch(trendPeriod, () => nextTick(initTrendChart))

function initRevenueChart() {
  if (!revenueChartRef.value) return
  if (revenueChart) revenueChart.dispose()
  revenueChart = echarts.init(revenueChartRef.value)
  revenueChart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e2e8f0',
      textStyle: { color: '#334155', fontSize: 12 },
      formatter: (p: any) => `${p[0].name}<br/><b style="color:#10B981">¥${p[0].value.toLocaleString()}</b>`,
    },
    grid: { left: 52, right: 16, top: 12, bottom: 28 },
    xAxis: {
      type: 'category',
      data: monthRevenue.map(d => d.month),
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisLabel: { color: '#94a3b8', fontSize: 11 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      name: '收益(元)',
      nameTextStyle: { color: '#94a3b8', fontSize: 11 },
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
      axisLabel: { color: '#94a3b8', fontSize: 11, formatter: (v: number) => v >= 10000 ? `${(v / 10000).toFixed(1)}万` : `${v}` },
    },
    series: [{
      type: 'bar',
      data: monthRevenue.map(d => d.value),
      barWidth: 28,
      itemStyle: {
        borderRadius: [6, 6, 0, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#34D399' },
          { offset: 1, color: '#10B981' },
        ]),
      },
      emphasis: {
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#6EE7B7' },
            { offset: 1, color: '#059669' },
          ]),
        },
      },
    }],
  })
  window.addEventListener('resize', () => revenueChart?.resize())
}

function refreshData() {
  message.success('数据已刷新')
  initTrendChart()
  initRevenueChart()
}

onMounted(() => {
  nextTick(() => {
    initTrendChart()
    initRevenueChart()
  })
})
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.header-desc { font-size: 13px; color: var(--text-muted); margin-top: 4px; }

.stats-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: white; border-radius: 14px; padding: 20px; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 16px; }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-content { display: flex; flex-direction: column; }
.stat-content .label { font-size: 12px; color: var(--text-muted); }
.stat-content .value { font-family: 'Orbitron', sans-serif; font-size: 22px; font-weight: 700; color: var(--text-primary); }
.stat-content .value.warning { color: #F59E0B; }

.alert-card { background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; }
.alert-title { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #92400E; margin-bottom: 12px; }
.alert-list { display: flex; flex-direction: column; gap: 8px; }
.alert-item { display: flex; align-items: center; gap: 12px; font-size: 13px; }
.alert-item .game-name { font-weight: 500; color: var(--text-primary); }
.alert-item .reason { color: var(--text-muted); font-size: 12px; flex: 1; }

.charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
.charts-row-3 { grid-template-columns: 1fr 1fr 1fr; }
.chart-card { background: white; border-radius: 16px; padding: 24px; border: 1px solid var(--border-color); }
.chart-full { margin-bottom: 24px; }
.chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.chart-header h3 { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0; }
.growth-tag { font-size: 12px; padding: 2px 8px; border-radius: 4px; }
.growth-tag.up { color: #10B981; background: #ECFDF5; }
.chart-body { height: 220px; }
.chart-body-tall { height: 280px; }

.rank-list { display: flex; flex-direction: column; gap: 8px; }
.rank-item { display: flex; align-items: center; gap: 12px; position: relative; }
.rank-num { width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: var(--text-muted); background: var(--color-bg-base); }
.rank-num.top { color: white; background: linear-gradient(135deg, #F59E0B, #D97706); }
.rank-game-info { flex: 1; min-width: 0; }
.rank-game-name { font-size: 13px; font-weight: 500; color: var(--text-primary); display: block; }
.rank-game-meta { font-size: 11px; color: var(--text-muted); }
.rank-bar { height: 4px; background: linear-gradient(90deg, #10B981, #34D399); border-radius: 2px; position: absolute; bottom: -4px; left: 36px; max-width: calc(100% - 36px); }

.pie-list { display: flex; flex-direction: column; gap: 10px; }
.pie-item { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.pie-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.pie-name { flex: 1; color: var(--text-primary); font-weight: 500; }
.pie-pct { color: var(--text-muted); min-width: 36px; text-align: right; }
.pie-amount { color: var(--text-secondary); min-width: 72px; text-align: right; font-weight: 500; }
</style>
