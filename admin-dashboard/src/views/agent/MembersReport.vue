<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>会员统计</h1>
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
          <n-icon :component="PeopleOutline" size="22" color="#fff" />
        </div>
        <div class="metric-content">
          <span class="label">总会员数</span>
          <span class="value primary">12,846</span>
          <span class="trend up">↑ 328 本周</span>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="PersonAddOutline" size="22" color="#fff" />
        </div>
        <div class="metric-content">
          <span class="label">本月新增</span>
          <span class="value" style="color:#10B981;">+1,256</span>
          <span class="trend up">↑ 18.5%</span>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="StarOutline" size="22" color="#fff" />
        </div>
        <div class="metric-content">
          <span class="label">付费会员</span>
          <span class="value">4,328</span>
          <span class="trend up">占 33.7%</span>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon" style="background: linear-gradient(135deg, #EF4444, #DC2626);">
          <n-icon :component="RepeatOutline" size="22" color="#fff" />
        </div>
        <div class="metric-content">
          <span class="label">复购率</span>
          <span class="value" style="color:#EF4444;">62.4%</span>
          <span class="trend good">↑ 3.2%</span>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-grid">
      <div class="chart-card chart-large">
        <div class="chart-header">
          <h3>会员增长趋势</h3>
          <n-radio-group v-model:value="growthType" size="small">
            <n-radio-button value="week">周</n-radio-button>
            <n-radio-button value="month">月</n-radio-button>
          </n-radio-group>
        </div>
        <div ref="growthChartRef" class="chart-container"></div>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <h3>会员等级分布</h3>
        </div>
        <div ref="levelChartRef" class="chart-container"></div>
      </div>
    </div>

    <!-- 双栏布局 -->
    <div class="dual-row">
      <div class="section-card flex-1">
        <div class="section-header">
          <h3>各商家会员数</h3>
          <n-select size="small" placeholder="全部商家" :options="merchantOptions" clearable style="width: 140px;" />
        </div>
        <div class="merchant-member-list">
          <div v-for="item in merchantMembers" :key="item.name" class="member-item">
            <div class="member-info">
              <span class="member-name">{{ item.name }}</span>
              <span class="member-shops">{{ item.shops }}家店铺</span>
            </div>
            <div class="member-stat">
              <span class="member-count">{{ item.total.toLocaleString() }}</span>
              <span class="member-new" :class="{ up: item.new > 0 }">{{ item.new > 0 ? '+' : '' }}{{ item.new }}</span>
            </div>
            <div class="member-bar-wrap">
              <div class="member-bar" :style="{ width: item.percent + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="section-card flex-1">
        <div class="section-header">
          <h3>近期注册会员</h3>
          <n-tag size="small" type="info" bordered>最近7天</n-tag>
        </div>
        <div class="recent-list">
          <div v-for="m in recentMembers" :key="m.id" class="recent-item">
            <div class="recent-avatar" :style="{ background: m.avatarBg }">{{ m.name[0] }}</div>
            <div class="recent-info">
              <span class="recent-name">{{ m.name }}</span>
              <span class="recent-shop">{{ m.shop }}</span>
            </div>
            <n-tag :type="levelColor(m.level)" size="tiny" bordered>{{ m.level }}</n-tag>
            <span class="recent-time">{{ m.time }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import {
  NButton, NIcon, NSpace, NDatePicker, NRadioGroup, NRadioButton,
  NTag, NSelect
} from 'naive-ui'
import * as echarts from 'echarts/core'
import { LineChart, PieChart, BarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import {
  DownloadOutline, PeopleOutline, PersonAddOutline,
  StarOutline, RepeatOutline
} from '@vicons/ionicons5'

echarts.use([LineChart, PieChart, BarChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer])

const dateRange = ref(null)
const growthType = ref('month')
const growthChartRef = ref<HTMLElement>()
const levelChartRef = ref<HTMLElement>()

const merchantOptions = [
  { label: '全部商家', value: null },
  { label: '广州天河VR体验馆', value: 'm1' },
  { label: '深圳南山头号空间', value: 'm2' },
  { label: '成都春熙路VR店', value: 'm3' },
]

// 各商家会员数
const merchantMembers = ref([
  { name: '广州天河VR体验馆', shops: 5, total: 3420, new: 186, percent: 100 },
  { name: '深圳南山头号空间', shops: 3, total: 2890, new: 152, percent: 85 },
  { name: '成都春熙路VR店', shops: 4, total: 2560, new: 128, percent: 75 },
  { name: '北京朝阳VR乐园', shops: 6, total: 2120, new: 98, percent: 62 },
  { name: '杭州西湖VR世界', shops: 2, total: 1286, new: 72, percent: 38 },
  { name: '武汉光谷VR中心', shops: 3, total: 570, new: 35, percent: 17 },
])

// 近期注册会员
const recentMembers = ref([
  { id: 1, name: '张伟', shop: '广州天河店', level: '黄金', time: '5分钟前', avatarBg: 'linear-gradient(135deg,#3B82F6,#2563EB)' },
  { id: 2, name: '李娜', shop: '深圳南山店', level: '普通', time: '12分钟前', avatarBg: 'linear-gradient(135deg,#10B981,#059669)' },
  { id: 3, name: '王强', shop: '成都春熙店', level: '白银', time: '28分钟前', avatarBg: 'linear-gradient(135deg,#F59E0B,#D97706)' },
  { id: 4, name: '刘芳', shop: '北京朝阳店', level: '钻石', time: '45分钟前', avatarBg: 'linear-gradient(135deg,#8B5CF6,#7C3AED)' },
  { id: 5, name: '陈明', shop: '杭州西湖店', level: '青铜', time: '1小时前', avatarBg: 'linear-gradient(135deg,#EF4444,#DC2626)' },
  { id: 6, name: '杨洋', shop: '广州天河店', level: '黄金', time: '1小时前', avatarBg: 'linear-gradient(135deg,#EC4899,#DB2777)' },
  { id: 7, name: '赵丽', shop: '深圳南山店', level: '普通', time: '2小时前', avatarBg: 'linear-gradient(135deg,#06B6D4,#0891B2)' },
  { id: 8, name: '孙浩', shop: '成都春熙店', level: '白银', time: '3小时前', avatarBg: 'linear-gradient(135deg,#84CC16,#65A30D)' },
])

function levelColor(level: string): 'default' | 'success' | 'warning' | 'error' | 'info' {
  const map: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = { '青铜': 'default', '普通': 'info', '白银': 'warning', '黄金': 'success', '钻石': 'error' }
  return map[level] || 'info'
}

function initCharts() {
  nextTick(() => {
    if (growthChartRef.value) {
      const chart = echarts.init(growthChartRef.value)
      chart.setOption({
        tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#eee', textStyle: { color: '#333' } },
        legend: { data: ['新增会员', '累计会员'], bottom: 0, textStyle: { fontSize: 11, color: '#64748b' } },
        grid: { left: 56, right: 24, top: 16, bottom: 40 },
        xAxis: {
          type: 'category',
          data: ['11月', '12月', '1月', '2月', '3月', '4月'],
          axisLine: { lineStyle: { color: '#e2e8f0' } },
          axisLabel: { color: '#64748b' }
        },
        yAxis: [
          { type: 'value', splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } }, axisLabel: { color: '#64748b' } },
          { type: 'value', splitLine: { show: false }, axisLabel: { color: '#94a3b8', formatter: '{value}k' } }
        ],
        series: [
          {
            name: '新增会员',
            type: 'bar',
            data: [892, 1056, 978, 1132, 1208, 1256],
            barWidth: '35%',
            itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#3B82F6' }, { offset: 1, color: 'rgba(59,130,246,0.4)' }]), borderRadius: [4, 4, 0, 0] }
          },
          {
            name: '累计会员',
            type: 'line',
            yAxisIndex: 1,
            data: [8.2, 9.3, 10.2, 11.1, 11.6, 12.8],
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: { color: '#10B981', width: 2.5 },
            itemStyle: { color: '#10B981' },
            areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(16,185,129,0.2)' }, { offset: 1, color: 'rgba(16,185,129,0)' }]) }
          }
        ]
      })
      window.addEventListener('resize', () => chart.resize())
    }

    if (levelChartRef.value) {
      const chart = echarts.init(levelChartRef.value)
      chart.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: {c}人 ({d}%)' },
        series: [{
          type: 'pie',
          radius: ['40%', '72%'],
          center: ['50%', '50%'],
          label: { show: true, fontSize: 11, color: '#64748b', formatter: '{b}\n{d}%' },
          data: [
            { value: 8516, name: '普通会员', itemStyle: { color: '#94A3B8' } },
            { value: 2156, name: '白银会员', itemStyle: { color: '#E2E8F0' } },
            { value: 1682, name: '黄金会员', itemStyle: { color: '#F59E0B' } },
            { value: 376, name: '钻石会员', itemStyle: { color: '#8B5CF6' } },
            { value: 116, name: '青铜会员', itemStyle: { color: '#CD7F32' } },
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

.charts-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 24px; }
.chart-card { background: white; border-radius: 16px; padding: 22px; border: 1px solid var(--border-color); }
.chart-large { grid-column: span 1; }
.chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.chart-header h3 { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.chart-container { width: 100%; height: 280px; }

.dual-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.section-card { background: white; border-radius: 16px; padding: 22px; border: 1px solid var(--border-color); }
.flex-1 { min-width: 0; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-header h3 { font-size: 15px; font-weight: 600; color: var(--text-primary); }

/* 商家会员列表 */
.merchant-member-list { display: flex; flex-direction: column; gap: 4px; }
.member-item { padding: 12px 0; border-bottom: 1px solid #f8fafc; }
.member-item:last-child { border-bottom: none; }
.member-info { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; }
.member-name { font-size: 13px; font-weight: 500; color: var(--text-primary); }
.member-shops { font-size: 11px; color: var(--text-muted); }
.member-stat { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.member-count { font-family: 'Orbitron', sans-serif; font-size: 17px; font-weight: 700; color: var(--text-primary); }
.member-new { font-size: 12px; color: #EF4444; font-weight: 600; }
.member-new.up { color: #10B981; }
.member-bar-wrap { height: 4px; background: #f1f5f9; border-radius: 2px; overflow: hidden; }
.member-bar { height: 100%; background: linear-gradient(90deg, #3B82F6, #93C5FD); border-radius: 2px; transition: width 0.3s; }

/* 近期注册列表 */
.recent-list { display: flex; flex-direction: column; gap: 2px; max-height: 340px; overflow-y: auto; }
.recent-item { display: flex; align-items: center; gap: 10px; padding: 10px 8px; border-radius: 8px; transition: background 0.15s; }
.recent-item:hover { background: #f8fafc; }
.recent-avatar { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #fff; flex-shrink: 0; }
.recent-info { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.recent-name { font-size: 13px; font-weight: 500; color: var(--text-primary); }
.recent-shop { font-size: 11px; color: var(--text-muted); }
.recent-time { font-size: 11px; color: #94a3b8; flex-shrink: 0; }
</style>
