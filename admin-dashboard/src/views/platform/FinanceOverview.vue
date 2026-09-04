<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>营收总览</h1>
        <p class="header-desc">分模块查看平台营收与代理商分润数据</p>
      </div>
      <n-space>
        <n-button type="primary" secondary @click="router.push('/platform/finance/platform-withdraw')">平台提现</n-button>
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
        <span class="section-desc">游戏豆销售（收入）− 供应商成本 − 代理商分润（扣除供应商成本后）= 平台毛利</span>
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
            <n-icon :component="PeopleOutline" size="16" color="#EF4444" />
            成本 — 供应商成本
          </div>
          <div class="funnel-value" style="color:#EF4444;">¥1,177,594</div>
          <div class="funnel-sub">Σ(各CP有效体验次数 × 各CP单次成本价)，非固定比例</div>
          <div class="funnel-trend up">↑ 10.1% 环比上月</div>
        </div>

        <div class="funnel-operator">−</div>

        <div class="funnel-card">
          <div class="funnel-label">
            <n-icon :component="WalletOutline" size="16" color="#F59E0B" />
            成本 — 代理商分润
          </div>
          <div class="funnel-value cost">¥144,523</div>
          <div class="funnel-sub">（采购额 − 供应商成本）× 分润比例</div>
          <div class="funnel-trend down">↓ 52.3% 环比上月</div>
        </div>

        <div class="funnel-operator">=</div>

        <div class="funnel-card profit-card">
          <div class="funnel-label">
            <n-icon :component="WalletOutline" size="16" color="#10B981" />
            回报 — 平台毛利
          </div>
          <div class="funnel-value profit">¥818,963</div>
          <div class="funnel-sub">销售收入 − 供应商成本 − 代理商分润</div>
          <div class="funnel-trend up">↑ 15.2% 环比上月</div>
        </div>
      </div>

      <!-- 平台营收辅助指标 -->
      <div class="sub-metrics-row">
        <div class="sub-metric-card">
          <span class="sub-label">平台毛利率</span>
          <span class="sub-value accent">38.3%</span>
          <span class="sub-detail">（销售收入 − 供应商成本 − 代理商分润）/ 销售收入</span>
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

    <!-- ======================== 二、代理商分润状态 ======================== -->
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
        <div class="sub-metric-card">
          <span class="sub-label">本月手续费</span>
          <span class="sub-value">¥2,268</span>
          <span class="sub-detail">拉卡拉手续费（约 0.3%）</span>
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

    <!-- ======================== 三、CP供应商结算概览 ======================== -->
    <div class="section-block" style="border-bottom: none; padding-bottom: 0;">
      <div class="section-title-bar">
        <span class="section-badge cp">CP 供应商结算</span>
        <span class="section-desc">CP 有效体验收益结算与打款状态</span>
      </div>

      <div class="sub-metrics-row">
        <div class="sub-metric-card">
          <span class="sub-label">待结算</span>
          <span class="sub-value warning">¥128,450</span>
          <span class="sub-detail">23 笔，含退款冲正调整中 2 笔</span>
        </div>
        <div class="sub-metric-card">
          <span class="sub-label">本月已到账</span>
          <span class="sub-value accent">¥342,800</span>
          <span class="sub-detail">18 笔，拉卡拉代付成功</span>
        </div>
        <div class="sub-metric-card">
          <span class="sub-label">本月手续费</span>
          <span class="sub-value">¥1,028</span>
          <span class="sub-detail">拉卡拉手续费（约 0.3%）</span>
        </div>
        <div class="sub-metric-card">
          <span class="sub-label">异常 / 失败</span>
          <span class="sub-value" style="color: #EF4444;">¥0</span>
          <span class="sub-detail">无异常结算单</span>
        </div>
      </div>

      <div class="table-card">
        <div class="section-header">
          <h3>近期 CP 结算流水</h3>
          <n-button quaternary size="tiny" @click="$router.push('/platform/cp/settlement')">查看全部</n-button>
        </div>
        <n-data-table :columns="cpSettleColumns" :data="cpSettleData" :pagination="{ pageSize: 5 }" striped size="small" />
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
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent, GraphicComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([LineChart, BarChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, GraphicComponent, CanvasRenderer])
import {
  TrendingUpOutline, WalletOutline, PeopleOutline
} from '@vicons/ionicons5'

const router = useRouter()
const message = useMessage()

const trendPeriod = ref('month')
const revenueChartRef = ref<HTMLElement | null>(null)
let revenueChart: echarts.ECharts | null = null

// ---- 代理商分润排行 ----
const agentRankColumns = [
  { title: '排名', key: 'rank', width: 55, align: 'center', render: (row: any) => h('span', {
    style: `font-weight:700;${row.rank <= 3 ? (row.rank === 1 ? 'color:#F59E0B' : row.rank === 2 ? 'color:#9CA3AF' : '#CD7F32') : ''}`
  }, `#${row.rank}`) },
  { title: '代理商', key: 'agentName' },
  { title: '地区', key: 'region', width: 100, align: 'center' },
  { title: '结算基数', key: 'monthlyFlow', width: 110, render: (row: any) => `¥${row.monthlyFlow.toLocaleString()}` },
  { title: '分润金额', key: 'commission', width: 115, render: (row: any) => h('span', { style: 'font-weight:600;color:#4F46E5;' }, `¥${row.commission.toLocaleString()}`) },
  { title: '手续费', key: 'payoutFee', width: 90, render: (row: any) => `¥${(row.payoutFee ?? Math.round(row.commission * 0.003)).toLocaleString()}` },
  { title: '应打款金额', key: 'actualPayout', width: 115, render: (row: any) => h('span', { style: 'font-weight:600;color:#10B981;' }, `¥${row.actualPayout.toLocaleString()}`) },
  { title: '综合分润比例', key: 'compositeRate', width: 110, align: 'center', render: (row: any) => `${row.compositeRate}%` },
]

const agentRankData = [
  { rank: 1, agentName: '广东省级总代-A', region: '广东省', monthlyFlow: 1850000, commission: 111000, payoutFee: 333, actualPayout: 110667, compositeRate: 6.0 },
  { rank: 2, agentName: '华东区域代理-B', region: '华东区', monthlyFlow: 680000, commission: 21420, payoutFee: 64.26, actualPayout: 21355.74, compositeRate: 3.15 },
  { rank: 3, agentName: '深圳城市代理-C', region: '深圳市', monthlyFlow: 120000, commission: 3000, payoutFee: 9, actualPayout: 2991, compositeRate: 2.5 },
  { rank: 4, agentName: '成都城市代理-E', region: '成都市', monthlyFlow: 88000, commission: 1730, payoutFee: 5.19, actualPayout: 1724.81, compositeRate: 1.97 },
  { rank: 5, agentName: '武汉创新体验-F', region: '武汉市', monthlyFlow: 65000, commission: 1300, payoutFee: 3.9, actualPayout: 1296.1, compositeRate: 2.0 },
]

// ---- CP 供应商结算流水表（按分账与对账说明 第7章） ----
const cpSettleColumns = [
  { title: '结算单号', key: 'settlementNo', width: 140, ellipsis: { tooltip: true } },
  { title: 'CP 供应商', key: 'cpName' },
  { title: '结算周期', key: 'settlementCycle', width: 150, align: 'center' },
  { title: '结算基数', key: 'cpSettleAmount', width: 110, render: (row: any) => `¥${row.cpSettleAmount.toLocaleString()}` },
  { title: '分润金额', key: 'actualPayout', width: 110, render: (row: any) => h('span', { style: 'font-weight:600;color:#4F46E5;' }, `¥${row.actualPayout.toLocaleString()}`) },
  { title: '手续费', key: 'payoutFee', width: 95, render: (row: any) => `¥${(row.payoutFee ?? Math.round(row.cpSettleAmount * 0.003)).toLocaleString()}` },
  { title: '可提现金额', key: 'withdrawableAmount', width: 110, render: (row: any) => h('span', { style: 'font-weight:600;color:#10B981;' }, `¥${row.withdrawableAmount.toLocaleString()}`) },
  { title: '创建时间', key: 'createTime', width: 145, align: 'center' },
  {
    title: '状态', key: 'status', width: 75, align: 'center',
    render: (row: any) => h(NTag, {
      type: row.status === 'settled' ? 'success' : row.status === 'pending' ? 'warning' : row.status === 'adjusting' ? 'error' : 'default',
      size: 'small', bordered: false
    }, () => row.statusText),
  },
]

const cpSettleData = [
  { settlementNo: 'CP2026042001', cpName: '广州星辰游戏科技', settlementCycle: '2026-04-01 至 2026-04-15', cpSettleAmount: 192750, actualPayout: 191550, payoutFee: 574.65, withdrawableAmount: 190975.35, createTime: '2026-04-20 09:30', status: 'settled', statusText: '已到账' },
  { settlementNo: 'CP2026042002', cpName: '上海梦幻互动娱乐', settlementCycle: '2026-04-01 至 2026-04-15', cpSettleAmount: 129300, actualPayout: 128850, payoutFee: 386.55, withdrawableAmount: 128463.45, createTime: '2026-04-20 09:40', status: 'settled', statusText: '已到账' },
  { settlementNo: 'CP2026041801', cpName: '北京极客乐园 CP', settlementCycle: '2026-04-01 至 2026-04-15', cpSettleAmount: 80700, actualPayout: 80700, payoutFee: 242.1, withdrawableAmount: 80457.9, createTime: '2026-04-18 10:15', status: 'settled', statusText: '已到账' },
  { settlementNo: 'CP2026042501', cpName: '成都创梦空间游戏', settlementCycle: '2026-04-16 至 2026-04-30', cpSettleAmount: 48000, actualPayout: 47200, payoutFee: 141.6, withdrawableAmount: 47058.4, createTime: '2026-04-25 14:20', status: 'adjusting', statusText: '调整中' },
  { settlementNo: 'CP2026042601', cpName: '杭州未来视界科技', settlementCycle: '2026-04-16 至 2026-04-30', cpSettleAmount: 31500, actualPayout: 31500, payoutFee: 94.5, withdrawableAmount: 31405.5, createTime: '2026-04-26 11:05', status: 'pending', statusText: '待结算' },
]

// ---- 图表初始化 ----
function initCharts() {
  nextTick(() => {
    setTimeout(() => {
      if (revenueChartRef.value) {
        revenueChart = echarts.init(revenueChartRef.value)
        revenueChart.setOption({
          tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#eee' },
          legend: { data: ['游戏豆销售', '供应商成本', '代理商分润', '平台毛利'], bottom: 0, textStyle: { fontSize: 11 } },
          grid: { left: 52, right: 16, top: 16, bottom: 36 },
          xAxis: { type: 'category', data: ['11月','12月','1月','2月','3月','4月'], axisLine: { lineStyle: { color: '#e2e8f0' } }, axisLabel: { color: '#64748b' } },
          yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } }, axisLabel: { color: '#64748b', formatter: (val: number) => val >= 10000 ? `${val/10000}万` : val } },
          series: [
            { name: '游戏豆销售', type: 'bar', barWidth: 24, data: [145, 162, 180, 196, 207, 214], itemStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'#3B82F6'},{offset:1,color:'#93C5FD'}]) } },
            { name: '供应商成本', type: 'bar', barWidth: 24, data: [80, 89, 99, 108, 114, 118], itemStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'#EF4444'},{offset:1,color:'#FCA5A5'}]) } },
            { name: '代理商分润', type: 'bar', barWidth: 24, data: [10, 11, 12, 13, 14, 15], itemStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'#F59E0B'},{offset:1,color:'#FDE68A'}]) } },
            { name: '平台毛利', type: 'line', smooth: true, data: [55, 62, 69, 75, 79, 81], lineStyle: { width: 3, color: '#10B981' }, itemStyle: { color: '#10B981' }, areaStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'rgba(16,185,129,0.12)'},{offset:1,color:'rgba(16,185,129,0)'}]) } },
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
.section-block {
  margin-bottom: 36px;
  padding-bottom: 28px;
  border-bottom: 1px dashed #E5E7EB;
}
.section-block:last-child { border-bottom: none; padding-bottom: 0; }

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

.section-badge.cp {
  background: #F3E8FF;
  color: #7C3AED;
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

/* 区块内部间距 */
.section-block .sub-metrics-row {
  margin-bottom: 16px;
}

@media (max-width: 1400px) {
  .funnel-row { flex-wrap: wrap; }
  .funnel-card { min-width: 200px; }
  .sub-metrics-row { grid-template-columns: repeat(2, 1fr); }
}
</style>
