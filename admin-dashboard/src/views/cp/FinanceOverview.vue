<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>收益总览</h1>
        <p class="header-desc">平台到期自动结算至绑定银行账户，无需手动提现</p>
      </div>
    </div>

<!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="TimeOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">待结算</span>
          <span class="value warning">¥44,198</span>
          <span class="sub">本期待打款</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="CheckmarkCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">累计已到账</span>
          <span class="value success">¥226,164</span>
          <span class="sub">共 3 期结算完成</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="WalletOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">最近一期结算</span>
          <span class="value">¥95,031</span>
          <span class="sub">2026-05 周期 · 费率 2%</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
          <n-icon :component="GameControllerOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">在架游戏数</span>
          <span class="value purple">5 款</span>
          <span class="sub">覆盖全品类</span>
        </div>
      </div>
    </div>

    <!-- 收益趋势 + 各游戏收益占比 -->
    <div class="charts-row">
      <div class="chart-card">
        <div class="chart-header">
          <h3>近12个月收益趋势</h3>
          <span class="chart-total">合计 ¥{{ totalYearRevenue }}</span>
        </div>
        <div class="chart-body" @mousemove="onChartHover" @mouseleave="tooltipIdx = -1">
          <svg viewBox="0 0 640 220" class="trend-svg">
            <!-- 网格线 -->
            <line v-for="y in gridLines" :key="'gl'+y" x1="0" :y1="y" x2="640" :y2="y" stroke="#f0f0f0" stroke-width="1" />
            <!-- 渐变面积 -->
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#10B981" stop-opacity="0.25" />
                <stop offset="100%" stop-color="#10B981" stop-opacity="0.02" />
              </linearGradient>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="#10B981" />
                <stop offset="100%" stop-color="#3B82F6" />
              </linearGradient>
            </defs>
            <path :d="areaPath" fill="url(#areaGrad)" />
            <path :d="linePath" fill="none" stroke="url(#lineGrad)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
            <!-- 数据点 -->
            <circle
              v-for="(pt, idx) in chartPoints"
              :key="'pt'+idx"
              :cx="pt.x"
              :cy="pt.y"
              :r="tooltipIdx === idx ? 6 : 4"
              :fill="tooltipIdx === idx ? '#10B981' : '#fff'"
              :stroke="tooltipIdx === idx ? '#fff' : '#10B981'"
              stroke-width="2.5"
              style="cursor: pointer; transition: all 0.15s;"
              @mouseenter="tooltipIdx = idx"
            />
            <!-- Tooltip -->
            <g v-if="tooltipIdx >= 0" :transform="`translate(${chartPoints[tooltipIdx].x}, ${chartPoints[tooltipIdx].y - 42})`">
              <rect x="-48" y="-18" width="96" height="32" rx="6" fill="rgba(0,0,0,0.78)" />
              <text text-anchor="middle" dy="-2" fill="#fff" font-size="12" font-weight="700" font-family="Orbitron, sans-serif">
                ¥{{ yearRevenueRaw[tooltipIdx] }}万
              </text>
            </g>
            <!-- x轴标签 -->
            <g v-for="(pt, idx) in chartPoints" :key="'lb'+idx">
              <text :x="pt.x" y="215" text-anchor="middle" fill="#999" font-size="11">{{ yearRevenue[idx].month }}</text>
            </g>
          </svg>
        </div>
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

    <!-- 近期结算记录 -->
    <div class="section-card">
      <div class="section-header">
        <h3>近期结算记录</h3>
        <n-button size="small" text type="primary" @click="$router.push('/cp/finance/detail')">查看全部</n-button>
      </div>
      <n-data-table :columns="settleColumns" :data="settleRecords" :pagination="false" striped size="small" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import { NButton, NDataTable, NTag, NIcon } from 'naive-ui'
import { TimeOutline, CheckmarkCircleOutline, WalletOutline, GameControllerOutline } from '@vicons/ionicons5'

const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4']
const gameRevenuePie = [
  { name: '过山车VR', pct: 28, amount: 125000 },
  { name: '恐怖医院', pct: 22, amount: 98000 },
  { name: '极速赛车', pct: 18, amount: 85000 },
  { name: '海洋世界', pct: 14, amount: 62000 },
  { name: '恐龙王国', pct: 10, amount: 48000 },
  { name: '其他游戏', pct: 8, amount: 38280 },
]

const yearRevenueRaw = [2.8, 3.2, 3.5, 2.9, 4.1, 3.8, 4.5, 2.1, 1.8, 2.5, 2.6, 2.8]
const yearRevenue = [
  { month: '6月', value: '2.8万' },
  { month: '7月', value: '3.2万' },
  { month: '8月', value: '3.5万' },
  { month: '9月', value: '2.9万' },
  { month: '10月', value: '4.1万' },
  { month: '11月', value: '3.8万' },
  { month: '12月', value: '4.5万' },
  { month: '1月', value: '2.1万' },
  { month: '2月', value: '1.8万' },
  { month: '3月', value: '2.5万' },
  { month: '4月', value: '2.6万' },
  { month: '5月', value: '2.8万' },
]

import { computed } from 'vue'
const totalYearRevenue = computed(() => {
  const sum = yearRevenueRaw.reduce((a, b) => a + b, 0)
  return sum.toFixed(1) + '万'
})

// SVG 布局常量
const SVG_W = 640, SVG_H = 220
const PAD_L = 10, PAD_R = 10, PAD_T = 24, PAD_B = 32
const chartW = SVG_W - PAD_L - PAD_R
const chartH = SVG_H - PAD_T - PAD_B

const maxVal = Math.max(...yearRevenueRaw)
const minVal = Math.min(...yearRevenueRaw)
const valRange = maxVal - minVal || 1

const chartPoints = computed(() =>
  yearRevenueRaw.map((val, i) => ({
    x: PAD_L + (chartW / (yearRevenueRaw.length - 1)) * i,
    y: PAD_T + chartH - ((val - minVal) / valRange) * chartH * 0.75 - chartH * 0.1,
    val,
  }))
)

const linePath = computed(() =>
  chartPoints.value.map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ')
)

const areaPath = computed(() => {
  const pts = chartPoints.value
  const line = pts.map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ')
  return `${line} L${pts[pts.length - 1].x.toFixed(1)} ${SVG_H - PAD_B} L${pts[0].x.toFixed(1)} ${SVG_H - PAD_B} Z`
})

const gridLines = computed(() => {
  const lines = []
  for (let i = 0; i <= 4; i++) {
    lines.push(PAD_T + (chartH / 4) * i)
  }
  return lines
})

const tooltipIdx = ref(-1)

function onChartHover(e: MouseEvent) {
  const el = (e.currentTarget as HTMLElement).querySelector('svg')
  if (!el) return
  const rect = el.getBoundingClientRect()
  const scaleX = SVG_W / rect.width
  const mouseX = (e.clientX - rect.left) * scaleX
  let best = 0
  let bestDist = Infinity
  chartPoints.value.forEach((pt, i) => {
    const d = Math.abs(pt.x - mouseX)
    if (d < bestDist) { bestDist = d; best = i }
  })
  tooltipIdx.value = bestDist < 30 ? best : -1
}

const settleColumns = [
  { title: '结算时间', key: 'time', width: 160 },
  { title: '金额', key: 'amount', width: 120, render: (row: any) => `¥${row.amount.toLocaleString()}` },
  { title: '收款账户', key: 'account', width: 200 },
  {
    title: '状态', key: 'status', width: 100,
    render(row: any) {
      const m: Record<string, any> = { done: ['success', '已到账'], pending: ['warning', '分账中'], failed: ['error', '失败'] }
      const [type, label] = m[row.status] || ['default', row.status]
      return h(NTag, { type, size: 'small', bordered: false }, () => label)
    }
  },
]
const settleRecords = ref([
  { id: 1, time: '2026-05-01 14:30', amount: 100000, account: '招商银行 尾号3821', status: 'done' },
  { id: 2, time: '2026-04-01 10:15', amount: 80000, account: '招商银行 尾号3821', status: 'done' },
  { id: 3, time: '2026-06-01 06:00', amount: 28450, account: '招商银行 尾号3821', status: 'pending' },
])
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.header-desc { font-size: 13px; color: var(--text-muted); margin-top: 4px; }

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: white; border-radius: 14px; padding: 20px; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 16px; }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-content { display: flex; flex-direction: column; gap: 2px; }
.stat-content .label { font-size: 12px; color: var(--text-muted); }
.stat-content .value { font-family: 'Orbitron', sans-serif; font-size: 22px; font-weight: 700; color: var(--text-primary); }
.stat-content .value.warning { color: #F59E0B; }
.stat-content .value.success { color: #10B981; }
.stat-content .value.purple { color: #8B5CF6; }
.stat-content .sub { font-size: 11px; color: var(--text-muted); }

.charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
.chart-card { background: white; border-radius: 14px; padding: 24px; border: 1px solid var(--border-color); }
.chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.chart-header h3 { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0; }
.chart-total { font-size: 13px; color: var(--text-muted); font-family: 'Orbitron', sans-serif; }

.chart-body { position: relative; }
.trend-svg { width: 100%; height: auto; display: block; }

.pie-list { display: flex; flex-direction: column; gap: 10px; }
.pie-item { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.pie-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.pie-name { flex: 1; color: var(--text-primary); font-weight: 500; }
.pie-pct { color: var(--text-muted); min-width: 36px; text-align: right; }
.pie-amount { color: var(--text-secondary); min-width: 72px; text-align: right; font-weight: 500; }

.section-card { background: white; border-radius: 14px; padding: 24px; border: 1px solid var(--border-color); }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-header h3 { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0; }
</style>
