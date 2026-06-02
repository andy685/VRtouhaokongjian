<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>营收总览</h1>
        <p class="header-desc">分模块查看平台营收、商家结算与代理商分润数据</p>
      </div>
      <n-space>
        <n-radio-group v-model:value="trendPeriod" size="small">
          <n-radio-button value="month">近6个月</n-radio-button>
          <n-radio-button value="year">近一年</n-radio-button>
        </n-radio-group>
      </n-space>
    </div>

    <!-- ======================== 一、平台营收 ======================== -->
    <div class="section-block">
      <div class="section-title-bar">
        <span class="section-badge platform">平台营收</span>
        <span class="section-desc">游戏豆销售（收入）− 代理商分润（成本）= 平台毛利</span>
      </div>

      <!-- 收入漏斗 -->
      <div class="funnel-row">
        <div class="funnel-card">
          <div class="funnel-label">
            <n-icon :component="TrendingUpOutline" size="16" color="#3B82F6" />
            收入 — 游戏豆销售
          </div>
          <div class="funnel-value revenue">¥2,141,080</div>
          <div class="funnel-sub">商家向平台采购游戏豆总额（批发价 ¥90/万豆）</div>
          <div class="funnel-trend up">↑ 12.3% 环比上月</div>
        </div>

        <div class="funnel-operator">−</div>

        <div class="funnel-card">
          <div class="funnel-label">
            <n-icon :component="PeopleOutline" size="16" color="#F59E0B" />
            成本 — 代理商分润
          </div>
          <div class="funnel-value cost">¥892,450</div>
          <div class="funnel-sub">本月应发分润（占销售收入 41.7%）</div>
          <div class="funnel-trend up">↑ 8.3% 环比上月</div>
        </div>

        <div class="funnel-operator">=</div>

        <div class="funnel-card profit-card">
          <div class="funnel-label">
            <n-icon :component="WalletOutline" size="16" color="#10B981" />
            回报 — 平台毛利
          </div>
          <div class="funnel-value profit">¥1,248,630</div>
          <div class="funnel-sub">游戏豆销售 − 代理商分润 = 平台毛利</div>
          <div class="funnel-trend up">↑ 15.2% 环比上月</div>
        </div>
      </div>

      <!-- 平台营收辅助指标 -->
      <div class="sub-metrics-row">
        <div class="sub-metric-card">
          <span class="sub-label">平台毛利率</span>
          <span class="sub-value accent">58.3%</span>
          <span class="sub-detail">较上月提升 2.4 个百分点</span>
        </div>
        <div class="sub-metric-card">
          <span class="sub-label">累计销售游戏豆</span>
          <span class="sub-value">¥2,568 万</span>
          <span class="sub-detail">年初至今平台累计批发额</span>
        </div>
      </div>
    </div>

    <!-- 月度收入趋势 -->
    <div class="chart-card">
      <div class="chart-header">
        <h3>月度收入趋势</h3>
      </div>
      <div ref="revenueChartRef" class="chart-container"></div>
    </div>

    <!-- ======================== 二、商家结算状态 ======================== -->
    <div class="section-block">
      <div class="section-title-bar">
        <span class="section-badge merchant">商家结算</span>
        <span class="section-desc">商家待结算金额与近期结算流水</span>
      </div>

      <div class="sub-metrics-row">
        <div class="sub-metric-card">
          <span class="sub-label">待结算总额</span>
          <span class="sub-value warning">¥456,180</span>
          <span class="sub-detail">商家待结算金额（含提现手续费）</span>
        </div>
      </div>

      <div class="table-card">
        <div class="section-header">
          <h3>近期商家结算流水</h3>
          <n-button quaternary size="tiny" @click="$router.push('/platform/finance/settlement')">查看全部</n-button>
        </div>
        <n-data-table :columns="settlementColumns" :data="settlementData" :pagination="{ pageSize: 5 }" striped size="small" />
      </div>
    </div>

    <!-- ======================== 三、代理商分润状态 ======================== -->
    <div class="section-block">
      <div class="section-title-bar">
        <span class="section-badge agent">代理商分润</span>
        <span class="section-desc">代理商分润打款进度与排行</span>
      </div>

      <div class="sub-metrics-row">
        <div class="sub-metric-card">
          <span class="sub-label">上月已打款</span>
          <span class="sub-value">¥756,300</span>
          <span class="sub-detail">占应发分润 84.7%</span>
        </div>
        <div class="sub-metric-card">
          <span class="sub-label">活跃代理商</span>
          <span class="sub-value">128 家</span>
          <span class="sub-detail">省级 8 / 区域 24 / 城市 96</span>
        </div>
      </div>

      <div class="table-card">
        <div class="section-header">
          <h3>代理商分润 TOP 排行</h3>
          <n-button quaternary size="tiny" @click="$router.push('/platform/finance/payouts')">查看全部</n-button>
        </div>
        <n-data-table :columns="agentRankColumns" :data="agentRankData" :pagination="false" striped size="small" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, h } from 'vue'
import { useRouter } from 'vue-router'
import {
  NButton, NIcon, NRadioGroup, NRadioButton,
  NDataTable, NTag, NSpace, useMessage
} from 'naive-ui'
import * as echarts from 'echarts/core'
import { LineChart, BarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([LineChart, BarChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer])
import {
  TrendingUpOutline, WalletOutline, PeopleOutline
} from '@vicons/ionicons5'

const router = useRouter()
const message = useMessage()

const trendPeriod = ref('month')
const revenueChartRef = ref<HTMLElement | null>(null)
let revenueChart: echarts.ECharts | null = null

// ---- 商家结算流水表 ----
const settlementColumns = [
  { title: '单号', key: 'settlementNo', width: 130, ellipsis: { tooltip: true } },
  { title: '商家', key: 'merchant' },
  { title: '金额', key: 'amount', width: 100, render: (row: any) => `¥${row.amount.toLocaleString()}` },
  { title: '提现手续费', key: 'fee', width: 80, render: (row: any) => `¥${row.fee.toLocaleString()}` },
  {
    title: '状态', key: 'status', width: 75, align: 'center',
    render: (row: any) => h(NTag, {
      type: row.status === 'done' ? 'success' : row.status === 'pending' ? 'warning' : 'default',
      size: 'small', bordered: false
    }, () => row.statusText),
  },
]

const settlementData = [
  { settlementNo: 'ST2026042001', merchant: '深圳XX科技公司', amount: 137963, fee: 4138.89, actual: 133824.11, status: 'done', statusText: '已打款', payTime: '2026-04-20 10:00' },
  { settlementNo: 'ST2026042002', merchant: '广州YY传媒公司', amount: 78230, fee: 2346.9, actual: 75883.1, status: 'pending', statusText: '待打款', payTime: '-' },
  { settlementNo: 'ST2026042003', merchant: '北京ZZ娱乐公司', amount: 45680, fee: 1370.4, actual: 44309.6, status: 'processing', statusText: '处理中', payTime: '-' },
  { settlementNo: 'ST2026042004', merchant: '上海WW投资公司', amount: 97850, fee: 2935.5, actual: 94914.5, status: 'pending', statusText: '待打款', payTime: '-' },
  { settlementNo: 'ST2026041301', merchant: '杭州AA文化公司', amount: 156200, fee: 4686, actual: 151514, status: 'done', statusText: '已打款', payTime: '2026-04-14 11:30' },
]

// ---- 代理商分润排行 ----
const agentRankColumns = [
  { title: '排名', key: 'rank', width: 55, align: 'center', render: (row: any) => h('span', {
    style: `font-weight:700;${row.rank <= 3 ? (row.rank === 1 ? 'color:#F59E0B' : row.rank === 2 ? 'color:#9CA3AF' : '#CD7F32') : ''}`
  }, `#${row.rank}`) },
  { title: '代理商', key: 'agentName' },
  { title: '级别', key: 'level', width: 80, align: 'center', render: (row: any) => h(NTag, {
    type: row.level === '省级总代' ? 'error' : row.level === '区域代理' ? 'warning' : 'default', size: 'tiny', bordered: false
  }, () => row.level) },
  { title: '游戏豆采购额', key: 'monthlyFlow', width: 110, render: (row: any) => `¥${row.monthlyFlow.toLocaleString()}` },
  { title: '应发分润', key: 'commission', width: 115, render: (row: any) => h('span', { style: 'font-weight:600;color:#4F46E5;' }, `¥${row.commission.toLocaleString()}`) },
  { title: '实际分润率', key: 'effectiveRate', width: 85, align: 'center', render: (row: any) => `${row.effectiveRate}%` },
]

const agentRankData = [
  { rank: 1, agentName: '广东省级总代-A', level: '省级总代', monthlyFlow: 1850000, commission: 277500, effectiveRate: 15.0 },
  { rank: 2, agentName: '华东区域代理-B', level: '区域代理', monthlyFlow: 680000, commission: 57120, effectiveRate: 8.4 },
  { rank: 3, agentName: '深圳城市代理-C', level: '城市代理', monthlyFlow: 120000, commission: 5700, effectiveRate: 4.75 },
  { rank: 4, agentName: '成都城市代理-E', level: '城市代理', monthlyFlow: 88000, commission: 3960, effectiveRate: 4.5 },
  { rank: 5, agentName: '武汉创新体验-F', level: '城市代理', monthlyFlow: 65000, commission: 2925, effectiveRate: 4.5 },
]

// ---- 图表初始化 ----
function initCharts() {
  nextTick(() => {
    setTimeout(() => {
      if (revenueChartRef.value) {
        revenueChart = echarts.init(revenueChartRef.value)
        revenueChart.setOption({
          tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#eee' },
          legend: { data: ['游戏豆销售', '代理商分润', '平台毛利'], bottom: 0, textStyle: { fontSize: 11 } },
          grid: { left: 52, right: 16, top: 16, bottom: 36 },
          xAxis: { type: 'category', data: ['11月','12月','1月','2月','3月','4月'], axisLine: { lineStyle: { color: '#e2e8f0' } }, axisLabel: { color: '#64748b' } },
          yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } }, axisLabel: { color: '#64748b', formatter: (val: number) => val >= 10000 ? `${val/10000}万` : val } },
          series: [
            { name: '游戏豆销售', type: 'bar', barWidth: 24, data: [145, 162, 180, 196, 207, 214], itemStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'#3B82F6'},{offset:1,color:'#93C5FD'}]) } },
            { name: '代理商分润', type: 'bar', barWidth: 24, data: [58, 64, 72, 79, 83, 89], itemStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'#F59E0B'},{offset:1,color:'#FDE68A'}]) } },
            { name: '平台毛利', type: 'line', smooth: true, data: [87, 98, 108, 117, 124, 125], lineStyle: { width: 3, color: '#10B981' }, itemStyle: { color: '#10B981' }, areaStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'rgba(16,185,129,0.12)'},{offset:1,color:'rgba(16,185,129,0)'}]) } },
          ]
        })
      }
    }, 200)
  })
}

function handleResize() {
  revenueChart?.resize()
}

onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  revenueChart?.dispose()
})
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.header-desc { font-size: 13px; color: var(--text-muted); margin-top: 4px; display: block; }

/* ===== 分区块样式 ===== */
.section-block { margin-bottom: 28px; }

.section-title-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.section-badge {
  font-size: 13px;
  font-weight: 700;
  padding: 3px 12px;
  border-radius: 6px;
  letter-spacing: 0.5px;
}

.section-badge.platform {
  background: #EFF6FF;
  color: #2563EB;
}

.section-badge.merchant {
  background: #ECFDF5;
  color: #059669;
}

.section-badge.agent {
  background: #FFF7ED;
  color: #D97706;
}

.section-desc {
  font-size: 12px;
  color: var(--text-muted);
}

/* ===== 收入漏斗 ===== */
.funnel-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.funnel-card {
  flex: 1;
  background: white;
  border-radius: 16px;
  padding: 22px 24px;
  border: 1px solid var(--border-color);
  transition: box-shadow 0.2s;
}

.funnel-card:hover {
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
}

.funnel-label {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.funnel-value {
  font-family: 'Orbitron', sans-serif;
  font-size: 26px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 6px;
}

.funnel-value.revenue { color: #3B82F6; }
.funnel-value.cost { color: #F59E0B; }
.funnel-value.profit { color: #10B981; }

.funnel-sub {
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.funnel-trend {
  font-size: 12px;
  font-weight: 600;
}

.funnel-trend.up { color: #10B981; }
.funnel-trend.down { color: #EF4444; }

.funnel-operator {
  font-size: 28px;
  font-weight: 300;
  color: #CBD5E1;
  padding: 0 4px;
  flex-shrink: 0;
}

/* ===== 辅助指标行 ===== */
.sub-metrics-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.sub-metric-card {
  background: white;
  border-radius: 12px;
  padding: 16px 20px;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sub-label {
  font-size: 11px;
  color: var(--text-muted);
}

.sub-value {
  font-family: 'Orbitron', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

.sub-value.warning { color: #F59E0B; }
.sub-value.accent { color: #8B5CF6; }

.sub-detail {
  font-size: 11px;
  color: var(--text-muted);
}

/* ===== 图表 ===== */
.chart-card {
  background: white;
  border-radius: 16px;
  padding: 22px;
  border: 1px solid var(--border-color);
  margin-bottom: 28px;
}

.chart-header { margin-bottom: 16px; }
.chart-header h3 { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0; }
.chart-container { width: 100%; height: 280px; }

/* ===== 表格 ===== */
.table-card {
  background: white;
  border-radius: 16px;
  padding: 22px;
  border: 1px solid var(--border-color);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 { font-size: 14px; font-weight: 600; color: var(--text-primary); margin: 0; }

@media (max-width: 1400px) {
  .funnel-row { flex-wrap: wrap; }
  .funnel-card { min-width: 200px; }
  .sub-metrics-row { grid-template-columns: repeat(2, 1fr); }
}
</style>
