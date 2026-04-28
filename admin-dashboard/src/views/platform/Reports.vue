<template>
  <div class="page-container">
    <div class="page-header">
      <h1>数据报表</h1>
      <n-space>
        <n-date-picker type="daterange" clearable size="small" v-model:value="dateRange" />
        <n-button secondary size="small">
          <template #icon><n-icon :component="DownloadOutline" /></template> 导出报表
        </n-button>
      </n-space>
    </div>

    <!-- 核心指标 - 平台视角 -->
    <n-grid :cols="4" :x-gap="20" :y-gap="20">
      <n-gi>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
            <n-icon :component="TrendingUpOutline" size="24" color="#fff" />
          </div>
          <div class="stat-info">
            <span class="label">今日游戏豆销售</span>
            <span class="value">¥86,580</span>
            <span class="trend up">↑ 12.3%</span>
          </div>
        </div>
      </n-gi>
      <n-gi>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
            <n-icon :component="StorefrontOutline" size="24" color="#fff" />
          </div>
          <div class="stat-info">
            <span class="label">本周游戏豆销售</span>
            <span class="value">¥592,340</span>
            <span class="trend up">↑ 8.5%</span>
          </div>
        </div>
      </n-gi>
      <n-gi>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
            <n-icon :component="WalletOutline" size="24" color="#fff" />
          </div>
          <div class="stat-info">
            <span class="label">本月游戏豆销售</span>
            <span class="value">¥2,156,780</span>
            <span class="trend up">↑ 15.2%</span>
          </div>
        </div>
      </n-gi>
      <n-gi>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
            <n-icon :component="CashOutline" size="24" color="#fff" />
          </div>
          <div class="stat-info">
            <span class="label">本年游戏豆销售</span>
            <span class="value">¥18,934,560</span>
            <span class="trend up">↑ 22.1%</span>
          </div>
        </div>
      </n-gi>
    </n-grid>
    
    <!-- 图表区域 -->
    <n-grid :cols="2" :x-gap="20" :y-gap="20" style="margin-top: 20px;">
      <n-gi>
        <div class="chart-card">
          <div class="chart-header">
            <h3>游戏豆销售趋势</h3>
            <n-radio-group v-model:value="trendType" size="small">
              <n-radio-button value="week">近7天</n-radio-button>
              <n-radio-button value="month">近30天</n-radio-button>
              <n-radio-button value="year">近一年</n-radio-button>
            </n-radio-group>
          </div>
          <div ref="revenueChartRef" class="chart-container"></div>
        </div>
      </n-gi>
      <n-gi>
        <div class="chart-card">
          <div class="chart-header">
            <h3>商家游戏豆消耗排行 TOP10</h3>
          </div>
          <div class="store-rank">
            <div v-for="(store, idx) in storeRank" :key="store.name" class="rank-item">
              <span class="rank-num" :class="{ gold: idx===0, silver: idx===1, bronze: idx===2 }">{{ idx + 1 }}</span>
              <div class="rank-info">
                <span class="store-name">{{ store.name }}</span>
                <div class="rank-bar-wrap">
                  <div class="rank-bar" :style="{ width: store.percentage + '%' }"></div>
                </div>
              </div>
              <span class="rank-value">{{ store.value.toLocaleString() }}豆</span>
            </div>
          </div>
        </div>
      </n-gi>
    </n-grid>

    <n-grid :cols="3" :x-gap="20" :y-gap="20" style="margin-top: 20px;">
      <n-gi>
        <div class="chart-card">
          <div class="chart-header">
            <h3>游戏豆用途构成</h3>
          </div>
          <div ref="incomeChartRef" class="chart-container-sm"></div>
        </div>
      </n-gi>
      <n-gi>
        <div class="chart-card">
          <div class="chart-header">
            <h3>各区域店铺分布</h3>
          </div>
          <div ref="regionChartRef" class="chart-container-sm"></div>
        </div>
      </n-gi>
      <n-gi>
        <div class="chart-card">
          <div class="chart-header">
            <h3>内容类型分布</h3>
          </div>
          <div ref="typeChartRef" class="chart-container-sm"></div>
        </div>
      </n-gi>
    </n-grid>

    <!-- 数据表格 -->
    <div class="data-table" style="margin-top: 20px;">
      <div class="table-header">
        <h3>详细数据</h3>
        <n-button size="small">导出Excel</n-button>
      </div>
      <n-data-table :columns="columns" :data="tableData" :pagination="{ pageSize: 10 }" striped />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, h } from 'vue'
import {
  NGrid, NGi, NButton, NIcon, NSpace, NDatePicker, NRadioGroup, NRadioButton,
  NDataTable, NTag
} from 'naive-ui'
import * as echarts from 'echarts/core'
import { LineChart, PieChart, BarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import {
  TrendingUpOutline, StorefrontOutline, WalletOutline, CashOutline,
  DownloadOutline
} from '@vicons/ionicons5'

echarts.use([LineChart, PieChart, BarChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer])

const dateRange = ref(null)
const trendType = ref('week')
const revenueChartRef = ref<HTMLElement>()
const incomeChartRef = ref<HTMLElement>()
const regionChartRef = ref<HTMLElement>()
const typeChartRef = ref<HTMLElement>()

const storeRank = ref([
  { name: '深圳福田旗舰店', value: 8560, percentage: 100 },
  { name: '上海浦东店', value: 7230, percentage: 84.5 },
  { name: '广州天河店', value: 6850, percentage: 80.0 },
  { name: '北京朝阳店', value: 5980, percentage: 69.9 },
  { name: '成都太古里店', value: 4560, percentage: 53.3 },
  { name: '杭州西湖店', value: 3980, percentage: 46.6 },
  { name: '武汉光谷店', value: 3250, percentage: 38.0 },
  { name: '南京新街口店', value: 2890, percentage: 33.8 },
  { name: '西安钟楼店', value: 2560, percentage: 30.0 },
  { name: '重庆解放碑店', value: 2230, percentage: 26.1 },
])

const columns = [
  { title: '日期', key: 'date', width: 120 },
  { title: '游戏豆销售', key: 'beanSales', render: (row: any) => `¥${row.beanSales.toLocaleString()}` },
  { title: '销售数量', key: 'beanAmount' },
  { title: '游戏豆消耗', key: 'beanConsume' },
  { title: '店铺数', key: 'stores' },
  { title: '设备在线率', key: 'deviceRate', render: (row: any) => `${row.deviceRate}%` },
  { title: '环比', key: 'trend', render: (row: any) => h('span', { style: `color:${row.trend >= 0 ? '#10B981' : '#EF4444'};font-weight:600;` }, row.trend >= 0 ? `+${row.trend}%` : `${row.trend}%`) },
]

const tableData = [
  { date: '2026-04-20', beanSales: 86580, beanAmount: 86580, beanConsume: 45680, stores: 168, deviceRate: 94.2, trend: 12.3 },
  { date: '2026-04-19', beanSales: 77230, beanAmount: 77230, beanConsume: 41200, stores: 168, deviceRate: 93.8, trend: 5.6 },
  { date: '2026-04-18', beanSales: 68960, beanAmount: 68960, beanConsume: 38900, stores: 168, deviceRate: 92.5, trend: -2.1 },
  { date: '2026-04-17', beanSales: 71340, beanAmount: 71340, beanConsume: 40100, stores: 168, deviceRate: 93.2, trend: 8.9 },
  { date: '2026-04-16', beanSales: 62260, beanAmount: 62260, beanConsume: 35600, stores: 168, deviceRate: 91.8, trend: -5.2 },
  { date: '2026-04-15', beanSales: 67880, beanAmount: 67880, beanConsume: 37800, stores: 168, deviceRate: 92.1, trend: 3.8 },
  { date: '2026-04-14', beanSales: 64010, beanAmount: 64010, beanConsume: 36200, stores: 168, deviceRate: 93.5, trend: 1.2 },
]

function initCharts() {
  nextTick(() => {
    // 营收趋势
    if (revenueChartRef.value) {
      const chart = echarts.init(revenueChartRef.value)
      const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      chart.setOption({
        tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#eee', textStyle: { color: '#333' } },
        grid: { left: 56, right: 24, top: 24, bottom: 32 },
        xAxis: { type: 'category', data: days, axisLine: { lineStyle: { color: '#e2e8f0' } }, axisLabel: { color: '#64748b' } },
        yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } }, axisLabel: { color: '#64748b', formatter: '¥{value}k' } },
        series: [
          {
            type: 'line', smooth: true,
            data: [185, 210, 195, 230, 245, 280, 286],
            areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(59,130,246,0.25)' }, { offset: 1, color: 'rgba(59,130,246,0)' }]) },
            lineStyle: { width: 3, color: '#3B82F6' },
            itemStyle: { color: '#3B82F6' }
          }
        ]
      })
      window.addEventListener('resize', () => chart.resize())
    }

      // 游戏豆用途构成
    if (incomeChartRef.value) {
      const chart = echarts.init(incomeChartRef.value)
      chart.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: {c}豆 ({d}%)' },
        series: [{
          type: 'pie', radius: ['45%', '72%'], center: ['50%', '50%'],
          label: { show: true, fontSize: 11, color: '#64748b' },
          data: [
            { value: 28000, name: '启动游戏', itemStyle: { color: '#3B82F6' } },
            { value: 12000, name: '系统扣费', itemStyle: { color: '#10B981' } },
            { value: 8000, name: '转入转出', itemStyle: { color: '#F59E0B' } },
            { value: 5000, name: '其他', itemStyle: { color: '#8B5CF6' } },
          ]
        }]
      })
      window.addEventListener('resize', () => chart.resize())
    }

    // 区域分布
    if (regionChartRef.value) {
      const chart = echarts.init(regionChartRef.value)
      chart.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: {c}家 ({d}%)' },
        series: [{
          type: 'pie', radius: ['45%', '72%'], center: ['50%', '50%'],
          label: { show: true, fontSize: 11, color: '#64748b' },
          data: [
            { value: 42, name: '深圳', itemStyle: { color: '#3B82F6' } },
            { value: 38, name: '广州', itemStyle: { color: '#10B981' } },
            { value: 32, name: '北京', itemStyle: { color: '#F59E0B' } },
            { value: 28, name: '上海', itemStyle: { color: '#EF4444' } },
            { value: 16, name: '其他', itemStyle: { color: '#8B5CF6' } },
          ]
        }]
      })
      window.addEventListener('resize', () => chart.resize())
    }

    // 内容类型分布
    if (typeChartRef.value) {
      const chart = echarts.init(typeChartRef.value)
      chart.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: {c}%' },
        series: [{
          type: 'pie', radius: ['45%', '72%'], center: ['50%', '50%'],
          label: { show: true, fontSize: 11, color: '#64748b' },
          data: [
            { value: 45, name: 'VR游戏', itemStyle: { color: '#3B82F6' } },
            { value: 30, name: 'VR影片', itemStyle: { color: '#10B981' } },
            { value: 15, name: '互动体验', itemStyle: { color: '#F59E0B' } },
            { value: 10, name: '其他内容', itemStyle: { color: '#8B5CF6' } },
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
.page-container { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { font-size: 20px; font-weight: 600; }

.stat-card { background: white; border-radius: 14px; padding: 20px; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 16px; }
.stat-icon { width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-info { display: flex; flex-direction: column; }
.stat-info .label { font-size: 12px; color: var(--text-muted); }
.stat-info .value { font-family: 'Orbitron', sans-serif; font-size: 22px; font-weight: 700; color: var(--text-primary); }
.stat-info .trend { font-size: 12px; color: #10B981; font-weight: 600; }

.chart-card { background: white; border-radius: 16px; padding: 22px; border: 1px solid var(--border-color); }
.chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.chart-header h3 { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.chart-container { width: 100%; height: 280px; }
.chart-container-sm { width: 100%; height: 200px; }

.store-rank { padding: 8px 0; }
.rank-item { display: flex; align-items: center; gap: 12px; padding: 8px 0; }
.rank-num { width: 24px; height: 24px; border-radius: 6px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: var(--text-muted); flex-shrink: 0; }
.rank-num.gold { background: linear-gradient(135deg, #FEF3C7, #FDE68A); color: #D97706; }
.rank-num.silver { background: linear-gradient(135deg, #F1F5F9, #E2E8F0); color: #64748B; }
.rank-num.bronze { background: linear-gradient(135deg, #FFEDD5, #FED7AA); color: #C27D3B; }
.rank-info { flex: 1; }
.store-name { font-size: 13px; font-weight: 500; color: var(--text-primary); display: block; margin-bottom: 4px; }
.rank-bar-wrap { height: 4px; background: #f1f5f9; border-radius: 2px; overflow: hidden; }
.rank-bar { height: 100%; background: linear-gradient(90deg, #3B82F6, #93C5FD); border-radius: 2px; }
.rank-value { font-size: 13px; font-weight: 600; color: var(--text-secondary); flex-shrink: 0; }

.data-table { background: white; border-radius: 16px; padding: 22px; border: 1px solid var(--border-color); }
.table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.table-header h3 { font-size: 15px; font-weight: 600; color: var(--text-primary); }
</style>
