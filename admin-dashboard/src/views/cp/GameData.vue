<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <n-button size="small" text @click="$router.back()" style="margin-bottom: 8px;">
          <template #icon><n-icon :component="ArrowBackOutline" /></template> 返回游戏列表
        </n-button>
        <h1>{{ game.name }}</h1>
        <p class="header-desc">游戏数据详情 · 版本 {{ game.version }} · 上线于 {{ game.onlineDate }}</p>
      </div>
      <n-space>
        <n-select v-model:value="datePreset" :options="dateOptions" size="small" style="width: 110px;" />
        <n-button size="small" secondary @click="refreshData">
          <template #icon><n-icon :component="RefreshOutline" /></template> 刷新
        </n-button>
      </n-space>
    </div>

    <!-- 状态标签 -->
    <div class="game-status-bar">
      <n-tag :type="statusType(game.status)" round :bordered="false">{{ game.statusText }}</n-tag>
      <span class="game-meta">题材：{{ game.category }} | 单次成本：¥{{ game.perPlayCost.toFixed(2) }} | 游戏豆：{{ game.beanPrice }}/次</span>
    </div>

    <!-- 核心指标 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background:linear-gradient(135deg,#3B82F6,#2563EB);">
          <n-icon :component="TrendingUpOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">累计体验次数</span>
          <span class="value">{{ game.totalPlays.toLocaleString() }}</span>
          <span class="trend up">↑ 12.5% 环比</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:linear-gradient(135deg,#10B981,#059669);">
          <n-icon :component="WalletOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">累计收益</span>
          <span class="value">¥{{ game.totalRevenue.toLocaleString() }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:linear-gradient(135deg,#8B5CF6,#7C3AED);">
          <n-icon :component="BarChartOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">本月体验次数</span>
          <span class="value">{{ game.monthPlays.toLocaleString() }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:linear-gradient(135deg,#F59E0B,#D97706);">
          <n-icon :component="CashOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">本月收益</span>
          <span class="value">¥{{ game.monthRevenue.toLocaleString() }}</span>
        </div>
      </div>
    </div>

    <!-- 趋势图 + 每日数据 -->
    <div class="charts-row">
      <!-- 近30天体验趋势 - 面积折线图 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>近30天体验趋势</h3>
          <n-tag size="tiny" :bordered="false" type="info">次</n-tag>
        </div>
        <div class="area-chart-wrapper">
          <svg viewBox="0 0 600 180" class="area-chart-svg" preserveAspectRatio="xMidYMid meet">
            <!-- 网格线 -->
            <line v-for="i in 4" :key="'grid'+i" :x1="0" :y1="i*36" :x2="600" :y2="i*36" stroke="#F1F5F9" stroke-width="1" />
            <!-- 面积填充 -->
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.25" />
                <stop offset="100%" stop-color="#3B82F6" stop-opacity="0.02" />
              </linearGradient>
            </defs>
            <path :d="areaPath" fill="url(#areaGrad)" />
            <!-- 折线 -->
            <path :d="linePath" fill="none" stroke="#3B82F6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
            <!-- 数据点 -->
            <circle v-for="(p, i) in chartPoints" :key="'dot'+i" :cx="p.x" :cy="p.y" r="4" fill="#fff" stroke="#3B82F6" stroke-width="2.5" />
          </svg>
          <!-- X轴标签 -->
          <div class="chart-x-labels">
            <span v-for="d in dailyTrend" :key="d.day">{{ d.day }}</span>
          </div>
        </div>
        <!-- 图例 -->
        <div class="chart-legend">
          <span class="legend-dot" style="background:#3B82F6;"></span> 每日体验次数
          <span class="legend-avg">均值 {{ avgTrend }}</span>
        </div>
      </div>

      <!-- 收益趋势 - 渐变柱状图 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>收益趋势</h3>
          <n-tag size="tiny" :bordered="false" type="success">¥</n-tag>
        </div>
        <div class="revenue-chart-wrapper">
          <div class="rev-bars-row">
            <div v-for="(m, i) in monthRevenue" :key="m.month" class="rev-bar-item">
              <div class="rev-value-top">¥{{ m.valueRaw || m.value }}</div>
              <div
                class="rev-bar-track"
                :style="{ height: Math.max(m.height, 4) + '%' }"
              >
                <div class="rev-bar-glow" :style="{ background: gradientAt(i, monthRevenue.length) }"></div>
              </div>
              <span class="rev-month-label">{{ m.month }}</span>
            </div>
          </div>
        </div>
        <div class="chart-legend">
          <span class="legend-dot" style="background:linear-gradient(180deg,#10B981,#059669);"></span> 月度收益
          <span class="legend-avg">合计 ¥{{ totalRevenueStr }}</span>
        </div>
      </div>
    </div>

    <!-- 收益明细 -->
    <div class="section-card">
      <div class="section-header">
        <h3>收益明细</h3>
      </div>
      <n-data-table :columns="settleColumns" :data="settleRecords" :pagination="false" striped size="small" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useRoute } from 'vue-router'
import { NButton, NIcon, NTag, NSelect, NSpace, NDataTable } from 'naive-ui'
import { ArrowBackOutline, RefreshOutline, TrendingUpOutline, WalletOutline, BarChartOutline, CashOutline } from '@vicons/ionicons5'

const route = useRoute()
const gameId = route.params.id as string
const datePreset = ref('30d')
const dateOptions = [
  { label: '近7天', value: '7d' },
  { label: '近30天', value: '30d' },
  { label: '近90天', value: '90d' },
]

const game = ref({
  id: gameId, name: '过山车VR', version: 'v2.1.0', category: '冒险体验',
  onlineDate: '2025-08-15', status: 'online', statusText: '已上线',
  perPlayCost: 2.40, beanPrice: 8,
  totalPlays: 158000, totalRevenue: 379200,
  monthPlays: 12800, monthRevenue: 30720,
})

function statusType(s: string) {
  const m: Record<string, any> = { online: 'success', pending: 'warning', rejected: 'error', offline: 'default', draft: 'info' }
  return m[s] || 'default'
}

function refreshData() {}

// SVG 图表计算
const SVG_W = 600, SVG_H = 180, PAD = 8
const areaPath = computed(() => {
  const pts = dailyTrend.map((d, i) => {
    const x = (SVG_W - PAD * 2) / (dailyTrend.length - 1) * i + PAD
    const y = SVG_H - PAD - (d.height / 100) * (SVG_H - PAD * 2)
    return `${i === 0 ? 'M' : 'L'}${x},${y}`
  })
  const lastX = (SVG_W - PAD * 2) / (dailyTrend.length - 1) * (dailyTrend.length - 1) + PAD
  return pts.join(' ') + ` L${lastX},${SVG_H - PAD} L${PAD},${SVG_H - PAD} Z`
})
const linePath = computed(() => {
  return dailyTrend.map((d, i) => {
    const x = (SVG_W - PAD * 2) / (dailyTrend.length - 1) * i + PAD
    const y = SVG_H - PAD - (d.height / 100) * (SVG_H - PAD * 2)
    return `${i === 0 ? 'M' : 'L'}${x},${y}`
  }).join(' ')
})
const chartPoints = computed(() => {
  return dailyTrend.map((d, i) => ({
    x: (SVG_W - PAD * 2) / (dailyTrend.length - 1) * i + PAD,
    y: SVG_H - PAD - (d.height / 100) * (SVG_H - PAD * 2),
  }))
})
const avgTrend = computed(() => {
  const sum = dailyTrend.reduce((a, d) => a + d.value, 0)
  return Math.round(sum / dailyTrend.length)
})
const totalRevenueStr = computed(() => {
  const nums = monthRevenue.map(m => {
    const n = String(m.value).replace(/[^0-9.]/g, '')
    return parseFloat(n) * (String(m.value).includes('万') ? 10000 : 1)
  })
  const total = nums.reduce((a, b) => a + b, 0)
  return total >= 10000 ? (total / 10000).toFixed(1) + '万' : total.toLocaleString()
})
function gradientAt(i: number, total: number) {
  const colors = ['#10B981,#059669', '#06B6D4,#0891B2', '#3B82F6,#2563EB', '#8B5CF6,#7C3AED', '#EC4899,#DB2777', '#F59E0B,#D97706']
  const idx = i % colors.length
  return `linear-gradient(180deg, ${colors[idx]})`
}

const dailyTrend = [
  { day: '5/1', value: 380, height: 50 }, { day: '5/5', value: 420, height: 55 },
  { day: '5/10', value: 510, height: 62 }, { day: '5/15', value: 480, height: 58 },
  { day: '5/20', value: 560, height: 72 }, { day: '5/22', value: 600, height: 78 },
  { day: '5/24', value: 550, height: 70 }, { day: '5/26', value: 620, height: 80 },
  { day: '5/28', value: 580, height: 74 }, { day: '5/30', value: 650, height: 85 },
]

const monthRevenue = [
  { month: '1月', value: '2.1万', height: 40 },
  { month: '2月', value: '1.8万', height: 35 },
  { month: '3月', value: '2.3万', height: 45 },
  { month: '4月', value: '2.7万', height: 52 },
  { month: '5月', value: '3.1万', height: 60 },
  { month: '6月', value: '2.8万', height: 54 },
]

const settleRecords = [
  { period: '2026-05', playCount: 12800, perPlayCost: 2.40, settledAmount: 30720, fee: 614, actualAmount: 30106, status: 'settled' },
  { period: '2026-04', playCount: 11500, perPlayCost: 2.40, settledAmount: 27600, fee: 552, actualAmount: 27048, status: 'settled' },
  { period: '2026-03', playCount: 10200, perPlayCost: 2.40, settledAmount: 24480, fee: 490, actualAmount: 23990, status: 'settled' },
  { period: '2026-02', playCount: 9800, perPlayCost: 2.40, settledAmount: 23520, fee: 470, actualAmount: 23050, status: 'settled' },
]

const settleColumns = [
  { title: '周期', key: 'period', width: 90 },
  { title: '次数', key: 'playCount', width: 80, align: 'right' as const, render: (r: any) => r.playCount.toLocaleString() },
  { title: '单次成本(¥)', key: 'perPlayCost', width: 100, align: 'right' as const, render: (r: any) => r.perPlayCost.toFixed(2) },
  {
    title: '收益(¥)', key: 'settledAmount', width: 100, align: 'right' as const,
    render: (r: any) => h('span', { style: 'color:#4F46E5;font-weight:600;' }, `¥${r.settledAmount.toLocaleString()}`)
  },
]
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.header-desc { font-size: 13px; color: var(--text-muted); margin-top: 4px; }

.game-status-bar { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
.game-meta { font-size: 12px; color: var(--text-muted); }

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: white; border-radius: 14px; padding: 18px; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 14px; }
.stat-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-content { display: flex; flex-direction: column; }
.stat-content .label { font-size: 12px; color: var(--text-muted); }
.stat-content .value { font-family: 'Orbitron', sans-serif; font-size: 20px; font-weight: 700; color: var(--text-primary); }
.trend { font-size: 11px; margin-top: 2px; }
.trend.up { color: #10B981; }

.charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
.chart-card { background: white; border-radius: 14px; padding: 24px; border: 1px solid var(--border-color); }
.chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.chart-header h3 { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0; }

/* SVG 面积折线图 */
.area-chart-wrapper { position: relative; }
.area-chart-svg { width: 100%; height: 160px; display: block; }
.chart-x-labels {
  display: flex; justify-content: space-around; padding: 0 8px; margin-top: 4px;
}
.chart-x-labels span { font-size: 10px; color: var(--text-muted); }

/* 图表图例 */
.chart-legend {
  display: flex; align-items: center; gap: 8px; margin-top: 8px; padding-top: 10px;
  border-top: 1px dashed #E5E7EB; font-size: 11px; color: var(--text-muted);
}
.legend-dot { width: 8px; height: 8px; border-radius: 2px; display: inline-block; }
.legend-avg { margin-left: auto; font-weight: 500; color: var(--text-secondary); }

/* 收益趋势柱状图 */
.revenue-chart-wrapper { padding: 0 4px; }
.rev-bars-row {
  display: flex; align-items: flex-end; justify-content: space-around;
  height: 160px; padding-bottom: 20px; gap: 6px;
}
.rev-bar-item {
  flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%;
  justify-content: flex-end;
}
.rev-value-top {
  font-size: 10px; font-weight: 600; color: var(--text-secondary);
  margin-bottom: 4px; white-space: nowrap;
}
.rev-bar-track {
  width: 100%; max-width: 42px; border-radius: 8px 8px 4px 4px;
  position: relative; overflow: hidden; min-height: 12px;
  transition: height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.15);
}
.rev-bar-glow {
  width: 100%; height: 100%; border-radius: 8px 8px 4px 4px;
}
.rev-month-label { font-size: 10px; color: var(--text-muted); margin-top: 6px; }

.section-card { background: white; border-radius: 14px; padding: 24px; border: 1px solid var(--border-color); }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-header h3 { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0; }
</style>
