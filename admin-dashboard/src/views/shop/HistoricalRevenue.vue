<template>
  <div class="page-container animate-fade-in">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>历史营收统计</h2>
    </div>

    <!-- 筛选标签 -->
    <div v-if="hasActiveFilter" class="filter-tags">
      <span class="filter-label">当前筛选：</span>
      <n-tag v-if="displayDateLabel" closable @close="clearDateFilter" size="small" type="info">
        {{ displayDateLabel }}
      </n-tag>
      <n-tag v-if="displayStore" closable @close="clearStoreFilter" size="small" type="info">
        {{ displayStoreLabel }}
      </n-tag>
    </div>

    <!-- 操作栏：视图切换 + 筛选 + 导出 -->
    <div class="view-mode-bar">
      <n-radio-group v-model:value="viewMode" size="small">
        <n-radio-button value="day">按日查看</n-radio-button>
        <n-radio-button value="month">按月查看</n-radio-button>
      </n-radio-group>
      <div class="header-actions">
        <n-button type="primary" @click="showFilterDrawer = true">
          <template #icon><n-icon :component="FilterOutline" /></template>
          筛选
        </n-button>
        <n-button type="primary">
          <template #icon><n-icon :component="DownloadOutline" /></template>
          导出
        </n-button>
      </div>
    </div>

    <!-- 二、趋势图表区 -->
    <div class="section-card">
      <div class="section-title">
        <span class="title-bar"></span>
        <span>营收趋势</span>
        <span class="section-sub">{{ displayDateLabel || '全部数据' }}</span>
      </div>
      <div class="chart-tabs">
        <n-radio-group v-model:value="chartType" size="small">
          <n-radio-button value="revenue">营收趋势</n-radio-button>
          <n-radio-button value="order">订单趋势</n-radio-button>
        </n-radio-group>
      </div>
      <div class="chart-area" @mouseleave="hoveredIndex = -1">
        <!-- Y 轴 -->
        <div class="y-axis">
          <span v-for="(label, i) in yAxisLabels" :key="i">{{ label }}</span>
        </div>
        <div class="chart-scroll-wrapper">
          <!-- 网格线 -->
          <div class="chart-grid">
            <div
              v-for="n in 3"
              :key="n"
              class="grid-line"
              :style="{ top: ((n - 1) / 2) * 100 + '%' }"
            ></div>
          </div>
          <div class="mock-chart">
            <div
              v-for="(item, idx) in trendData"
              :key="idx"
              class="chart-bar-group"
              @mouseenter="hoveredIndex = idx"
              @mousemove="handleChartMouseMove"
            >
              <div
                class="chart-bar"
                :class="{ 'chart-bar-hover': hoveredIndex === idx }"
                :style="{ height: (chartType === 'revenue' ? item.revenueHeight : item.orderHeight) + 'px', background: chartType === 'revenue' ? '#3B82F6' : '#10B981' }"
              ></div>
            </div>
          </div>
          <div class="x-axis">
            <span
              v-for="(item, idx) in trendData"
              :key="idx"
              class="x-label"
            >
              {{ idx % labelStep === 0 ? item.label : '' }}
            </span>
          </div>
          <!-- 悬浮提示面板 -->
          <div
            v-if="hoveredIndex >= 0 && hoveredIndex < trendData.length"
            class="chart-tooltip"
            :style="{ left: tooltipX + 'px', top: tooltipY + 'px' }"
          >
            <div class="tooltip-title">{{ trendData[hoveredIndex].label }}</div>
            <div class="tooltip-row">
              <span class="tooltip-dot" :style="{ background: chartType === 'revenue' ? '#3B82F6' : '#10B981' }"></span>
              <span class="tooltip-label">{{ chartType === 'revenue' ? '营收' : '订单' }}</span>
              <span class="tooltip-value">{{ chartType === 'revenue' ? fmtMoney(trendData[hoveredIndex].rawRevenue) : trendData[hoveredIndex].rawOrders.toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 三、渠道占比/门店对比 -->
    <div class="section-card">
      <div class="section-title">
        <span class="title-bar"></span>
        <span>渠道营收占比</span>
        <span class="section-sub">{{ displayDateLabel || '全部数据' }}</span>
      </div>
      <div class="channel-stats">
        <div v-for="ch in channelData" :key="ch.key" class="channel-item">
          <div class="channel-name">{{ ch.name }}</div>
          <div class="channel-bar-wrap">
            <div class="channel-bar" :style="{ width: ch.percent + '%', background: ch.color }"></div>
          </div>
          <div class="channel-value">{{ ch.percent }}%</div>
        </div>
      </div>
    </div>

    <!-- 四、数据明细表格 -->
    <div class="section-card">
      <div class="section-title">
        <span class="title-bar"></span>
        <span>营收明细</span>
        <span class="section-sub">{{ displayDateLabel || '全部数据' }}</span>
      </div>
      <div class="table-wrapper">
        <n-data-table
          :columns="columns"
          :data="tableData"
          :pagination="pagination"
          striped
          size="small"
          :scroll-x="1200"
          :row-class-name="(row: any) => row.isTotal ? 'total-row' : ''"
        />
      </div>
    </div>

    <!-- 筛选抽屉 -->
    <n-drawer v-model:show="showFilterDrawer" width="360" placement="right">
      <n-drawer-content title="筛选条件" closable>
        <n-form label-placement="left" :label-width="80">
          <n-form-item v-if="viewMode === 'day'" label="日期范围">
            <n-date-picker v-model:value="filterDateRange" type="daterange" style="width: 100%;" clearable />
          </n-form-item>
          <n-form-item v-else label="月份范围">
            <n-date-picker v-model:value="filterMonthRange" type="monthrange" style="width: 100%;" clearable />
          </n-form-item>
          <n-form-item label="门店">
            <n-select v-model:value="filterStore" placeholder="请选择门店" :options="storeOptions" clearable />
          </n-form-item>
        </n-form>
        <template #footer>
          <n-space>
            <n-button @click="handleResetFilter">重置</n-button>
            <n-button type="primary" block @click="handleSearch">搜索</n-button>
          </n-space>
        </template>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, h, computed } from 'vue'
import {
  NButton, NIcon, NDataTable, NDrawer, NDrawerContent,
  NForm, NFormItem, NSelect, NDatePicker, NSpace, NTag,
  NRadioGroup, NRadioButton,
} from 'naive-ui'
import { FilterOutline, DownloadOutline, CashOutline, CartOutline, TrendingUpOutline, ArrowUndoOutline } from '@vicons/ionicons5'

const showFilterDrawer = ref(false)
const filterDateRange = ref<[number, number] | null>(null)
const filterMonthRange = ref<[number, number] | null>(null)
const filterStore = ref<string | null>(null)

const displayDateRange = ref<[number, number] | null>(null)
const displayMonthRange = ref<[number, number] | null>(null)
const displayStore = ref<string | null>(null)
const viewMode = ref<'day' | 'month'>('day')
const chartType = ref('revenue')
const hoveredIndex = ref(-1)
const tooltipX = ref(0)
const tooltipY = ref(0)
const labelStep = computed(() => Math.max(1, Math.ceil(trendData.value.length / 10)))

const yAxisLabels = computed(() => {
  const maxVal = Math.max(...trendData.value.map(d => chartType.value === 'revenue' ? d.rawRevenue : d.rawOrders), 1)
  const top = chartType.value === 'revenue' ? fmtMoney(maxVal) : maxVal.toLocaleString()
  const mid = chartType.value === 'revenue' ? fmtMoney(Math.round(maxVal / 2)) : Math.round(maxVal / 2).toLocaleString()
  return [top, mid, '0']
})

function handleChartMouseMove(e: MouseEvent) {
  const rect = (e.currentTarget as HTMLElement)?.closest('.chart-scroll-wrapper')?.getBoundingClientRect()
  if (rect) {
    tooltipX.value = e.clientX - rect.left + 12
    tooltipY.value = e.clientY - rect.top - 12
  }
}

const storeOptions = [
  { label: '卓远萝岗区店', value: '1' },
  { label: '卓远萧山区店', value: '2' },
  { label: '卓远亚运城店', value: '3' },
  { label: '卓远文鼎路店', value: '4' },
]

const displayStoreLabel = computed(() => {
  if (!displayStore.value) return ''
  return storeOptions.find(o => o.value === displayStore.value)?.label || ''
})

const displayDateLabel = computed(() => {
  if (viewMode.value === 'day' && displayDateRange.value) {
    const s = new Date(displayDateRange.value[0])
    const e = new Date(displayDateRange.value[1])
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    return `${fmt(s)} ~ ${fmt(e)}`
  }
  if (viewMode.value === 'month' && displayMonthRange.value) {
    const s = new Date(displayMonthRange.value[0])
    const e = new Date(displayMonthRange.value[1])
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    return `${fmt(s)} ~ ${fmt(e)}`
  }
  return ''
})

const hasActiveFilter = computed(() => {
  return !!displayDateRange.value || !!displayMonthRange.value || !!displayStore.value
})

function clearDateFilter() {
  displayDateRange.value = null
  displayMonthRange.value = null
  filterDateRange.value = null
  filterMonthRange.value = null
}

function clearStoreFilter() {
  displayStore.value = null
  filterStore.value = null
}

function handleSearch() {
  if (viewMode.value === 'day') {
    if (filterDateRange.value) {
      displayDateRange.value = [...filterDateRange.value]
    }
    filterMonthRange.value = null
  } else {
    if (filterMonthRange.value) {
      displayMonthRange.value = [...filterMonthRange.value]
    }
    filterDateRange.value = null
  }
  displayStore.value = filterStore.value || null
  showFilterDrawer.value = false
}

function handleResetFilter() {
  filterDateRange.value = null
  filterMonthRange.value = null
  filterStore.value = null
  displayDateRange.value = null
  displayMonthRange.value = null
  displayStore.value = null
}

function fmtMoney(val: number) {
  return '¥' + val.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ===== 模拟数据生成：日粒度（最近365天） =====
function generateDailyData(days: number) {
  const data: any[] = []
  const stores = ['卓远萝岗区店', '卓远萧山区店', '卓远亚运城店', '卓远文鼎路店']
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = `${d.getMonth() + 1}/${d.getDate()}`
    const fullDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    for (const store of stores) {
      const seed = (fullDate.charCodeAt(0) + store.length + i) % 100
      const revenue = Math.round((seed + 20) * 128.6)
      const orderCount = Math.round((seed + 5) * 2.5)
      const refund = Math.round(revenue * (seed % 5) / 100)
      data.push({
        date: fullDate,
        displayDate: dateStr,
        store,
        revenueTotal: revenue,
        orderCount,
        refundAmount: refund,
        offlineRevenue: Math.round(revenue * 0.65),
        wechatRevenue: Math.round(revenue * 0.35),
        offlinePrepaid: Math.round(revenue * 0.25),
        offlinePackage: Math.round(revenue * 0.15),
        offlineDevice: Math.round(revenue * 0.12),
        offlineGoods: Math.round(revenue * 0.08),
        offlineLive: Math.round(revenue * 0.05),
      })
    }
  }
  return data
}

const dailyRawData = generateDailyData(365)

const filteredData = computed(() => {
  let data = dailyRawData
  if (displayStore.value) {
    const storeName = storeOptions.find(o => o.value === displayStore.value)?.label || ''
    data = data.filter(d => d.store === storeName)
  }
  if (viewMode.value === 'day' && displayDateRange.value) {
    const start = new Date(displayDateRange.value[0])
    const end = new Date(displayDateRange.value[1])
    const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`
    const endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`
    data = data.filter(d => d.date >= startStr && d.date <= endStr)
  }
  if (viewMode.value === 'month' && displayMonthRange.value) {
    const start = new Date(displayMonthRange.value[0])
    const end = new Date(displayMonthRange.value[1])
    const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`
    const endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}`
    data = data.filter(d => d.date.slice(0, 7) >= startStr && d.date.slice(0, 7) <= endStr)
  }
  return data
})

// ===== KPI 指标 =====
const kpiData = computed(() => {
  const data = filteredData.value
  const revenueTotal = data.reduce((s, d) => s + d.revenueTotal, 0)
  const orderCount = data.reduce((s, d) => s + d.orderCount, 0)
  const refundAmount = data.reduce((s, d) => s + d.refundAmount, 0)
  const atv = orderCount > 0 ? revenueTotal / orderCount : 0
  const refundRate = revenueTotal > 0 ? (refundAmount / revenueTotal * 100) : 0
  return {
    revenueTotal,
    orderCount,
    atv,
    refundRate: refundRate.toFixed(1),
    revenueMom: 12.5,
    orderMom: 8.3,
    atvMom: 3.8,
    refundRateMom: -1.2,
  }
})

// ===== 趋势数据 =====
const trendData = computed(() => {
  const map = new Map<string, { label: string; revenue: number; orders: number }>()
  for (const d of filteredData.value) {
    const key = viewMode.value === 'month' ? d.date.slice(0, 7) : d.date
    const label = viewMode.value === 'month' ? d.date.slice(0, 7) : d.displayDate
    if (!map.has(key)) {
      map.set(key, { label, revenue: 0, orders: 0 })
    }
    const item = map.get(key)!
    item.revenue += d.revenueTotal
    item.orders += d.orderCount
  }
  let arr = Array.from(map.values())

  // 桶聚合：可见区域最多展示 20 份，避免标签重叠
  const MAX_BARS = 20
  if (arr.length > MAX_BARS) {
    const bucketSize = Math.ceil(arr.length / MAX_BARS)
    const buckets: typeof arr = []
    for (let i = 0; i < arr.length; i += bucketSize) {
      const chunk = arr.slice(i, i + bucketSize)
      const startLabel = chunk[0].label
      const endLabel = chunk[chunk.length - 1].label
      buckets.push({
        label: startLabel,
        revenue: chunk.reduce((s, d) => s + d.revenue, 0),
        orders: chunk.reduce((s, d) => s + d.orders, 0),
      })
    }
    arr = buckets
  }

  const maxRevenue = Math.max(...arr.map(a => a.revenue), 1)
  const maxOrders = Math.max(...arr.map(a => a.orders), 1)
  return arr.map(item => ({
    label: item.label,
    revenueHeight: Math.round((item.revenue / maxRevenue) * 160),
    orderHeight: Math.round((item.orders / maxOrders) * 160),
    rawRevenue: item.revenue,
    rawOrders: item.orders,
  }))
})

// ===== 渠道占比数据 =====
const channelData = computed(() => {
  const data = filteredData.value
  const offline = data.reduce((s, d) => s + d.offlineRevenue, 0)
  const wechat = data.reduce((s, d) => s + d.wechatRevenue, 0)
  const total = offline + wechat
  if (total === 0) return []
  return [
    { key: 'offline', name: '线下营收', percent: Math.round(offline / total * 100), color: '#3B82F6' },
    { key: 'wechat', name: '小程序营收', percent: Math.round(wechat / total * 100), color: '#10B981' },
  ]
})

// ===== 表格数据 =====
const tableData = computed(() => {
  const data = filteredData.value
  const map = new Map<string, any>()
  for (const d of data) {
    const key = viewMode.value === 'month' ? `${d.date.slice(0, 7)}|${d.store}` : `${d.date}|${d.store}`
    const dateLabel = viewMode.value === 'month' ? d.date.slice(0, 7) : d.displayDate
    if (!map.has(key)) {
      map.set(key, {
        date: dateLabel,
        sortKey: viewMode.value === 'month' ? d.date.slice(0, 7) : d.date,
        store: d.store,
        revenueTotal: 0,
        orderCount: 0,
        refundAmount: 0,
        offlineRevenue: 0,
        wechatRevenue: 0,
        offlinePrepaid: 0,
        offlinePackage: 0,
        offlineDevice: 0,
        offlineGoods: 0,
        offlineLive: 0,
      })
    }
    const item = map.get(key)
    item.revenueTotal += d.revenueTotal
    item.orderCount += d.orderCount
    item.refundAmount += d.refundAmount
    item.offlineRevenue += d.offlineRevenue
    item.wechatRevenue += d.wechatRevenue
    item.offlinePrepaid += d.offlinePrepaid
    item.offlinePackage += d.offlinePackage
    item.offlineDevice += d.offlineDevice
    item.offlineGoods += d.offlineGoods
    item.offlineLive += d.offlineLive
  }

  const rows = Array.from(map.values())
  rows.sort((a, b) => b.sortKey.localeCompare(a.sortKey))

  const total = {
    date: '',
    store: '合计',
    revenueTotal: 0,
    orderCount: 0,
    refundAmount: 0,
    offlineRevenue: 0,
    wechatRevenue: 0,
    offlinePrepaid: 0,
    offlinePackage: 0,
    offlineDevice: 0,
    offlineGoods: 0,
    offlineLive: 0,
    isTotal: true,
  }
  for (const r of rows) {
    total.revenueTotal += r.revenueTotal
    total.orderCount += r.orderCount
    total.refundAmount += r.refundAmount
    total.offlineRevenue += r.offlineRevenue
    total.wechatRevenue += r.wechatRevenue
    total.offlinePrepaid += r.offlinePrepaid
    total.offlinePackage += r.offlinePackage
    total.offlineDevice += r.offlineDevice
    total.offlineGoods += r.offlineGoods
    total.offlineLive += r.offlineLive
  }

  return [...rows, total]
})

const columns = computed(() => [
  { title: viewMode.value === 'month' ? '月份' : '日期', key: 'date', width: 90, fixed: 'left' as const },
  { title: '门店', key: 'store', width: 130, fixed: 'left' as const,
    render(row: any) { return row.isTotal ? h('b', {}, row.store) : row.store }
  },
  { title: '营收总额', key: 'revenueTotal', width: 110, align: 'center' as const,
    render(row: any) { return fmtMoney(row.revenueTotal) }
  },
  { title: '订单数', key: 'orderCount', width: 80, align: 'center' as const },
  { title: '退款金额', key: 'refundAmount', width: 100, align: 'center' as const,
    render(row: any) { return fmtMoney(row.refundAmount) }
  },
  { title: '线下营收', key: 'offlineRevenue', width: 100, align: 'center' as const,
    render(row: any) { return fmtMoney(row.offlineRevenue) }
  },
  { title: '小程序营收', key: 'wechatRevenue', width: 100, align: 'center' as const,
    render(row: any) { return fmtMoney(row.wechatRevenue) }
  },
  { title: '线下-预存款', key: 'offlinePrepaid', width: 100, align: 'center' as const,
    render(row: any) { return fmtMoney(row.offlinePrepaid) }
  },
  { title: '线下-套票', key: 'offlinePackage', width: 90, align: 'center' as const,
    render(row: any) { return fmtMoney(row.offlinePackage) }
  },
  { title: '线下-设备项目', key: 'offlineDevice', width: 110, align: 'center' as const,
    render(row: any) { return fmtMoney(row.offlineDevice) }
  },
  { title: '线下-商品', key: 'offlineGoods', width: 90, align: 'center' as const,
    render(row: any) { return fmtMoney(row.offlineGoods) }
  },
  { title: '线下-直接点播', key: 'offlineLive', width: 110, align: 'center' as const,
    render(row: any) { return fmtMoney(row.offlineLive) }
  },
])

const pagination = { pageSize: 10 }
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.filter-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 10px 16px;
  background: #f6f8fa;
  border-radius: 6px;
}

.filter-label {
  font-size: 13px;
  color: #666;
  white-space: nowrap;
}

/* ===== 数据展示方式 ===== */
.view-mode-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 12px 20px;
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.view-mode-bar .header-actions {
  display: flex;
  gap: 10px;
}

/* 视图切换按钮美化 */
::deep(.view-mode-bar .n-radio-group .n-radio-button) {
  font-weight: 500;
  min-width: 72px;
  text-align: center;
}

::deep(.view-mode-bar .n-radio-group .n-radio-button.n-radio-button--checked) {
  background: #f0f5ff;
  color: #2563eb;
  border-color: #2563eb;
}

/* ===== 关键指标卡片 ===== */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid var(--border-color);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.stat-content .label {
  font-size: 13px;
  color: #999;
}

.stat-content .value {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-content .compare {
  font-size: 12px;
  color: #999;
}

.stat-content .compare .up {
  color: #10B981;
  font-weight: 600;
}

.stat-content .compare .down {
  color: #EF4444;
  font-weight: 600;
}

/* ===== 图表区 ===== */
.section-card {
  background: white;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  margin-bottom: 20px;
  overflow: hidden;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 20px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 1px solid #f0f0f0;
}

.title-bar {
  width: 4px;
  height: 16px;
  background: #1890ff;
  border-radius: 2px;
}

.section-sub {
  font-size: 13px;
  font-weight: 400;
  color: #999;
  margin-left: auto;
}

.chart-tabs {
  padding: 12px 20px 0;
}

.chart-area {
  display: flex;
  padding: 20px;
  height: 240px;
  position: relative;
}

.y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  padding-right: 10px;
  font-size: 11px;
  color: #999;
  flex-shrink: 0;
  height: 180px;
  margin-top: 10px;
  border-right: 1px solid #e0e0e0;
}

.chart-scroll-wrapper {
  flex: 1;
  position: relative;
  overflow-x: auto;
  overflow-y: hidden;
}

.chart-grid {
  position: absolute;
  top: 10px;
  left: 0;
  right: 0;
  bottom: 40px;
  pointer-events: none;
  z-index: 0;
}

.grid-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: #f0f0f0;
}

.mock-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: calc(100% - 40px);
  gap: 4px;
  padding: 0 10px;
  min-height: 160px;
  position: relative;
  z-index: 1;
}

.chart-bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
  min-width: 14px;
  height: 100%;
}

.chart-bar {
  width: 100%;
  max-width: 20px;
  border-radius: 4px 4px 0 0;
  transition: height 0.3s;
}

.x-axis {
  display: flex;
  align-items: flex-start;
  justify-content: space-around;
  height: 40px;
  gap: 4px;
  padding: 6px 10px 0;
  position: relative;
  z-index: 1;
}

.x-label {
  flex: 1;
  min-width: 14px;
  text-align: center;
  font-size: 11px;
  color: #999;
  white-space: nowrap;
}

.chart-bar-hover {
  opacity: 0.8;
  filter: brightness(1.1);
}

.chart-tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.85);
  color: white;
  border-radius: 6px;
  padding: 10px 14px;
  font-size: 13px;
  pointer-events: none;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  white-space: nowrap;
}

.tooltip-title {
  font-weight: 600;
  margin-bottom: 6px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.tooltip-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tooltip-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.tooltip-label {
  color: rgba(255, 255, 255, 0.7);
}

.tooltip-value {
  font-weight: 600;
  margin-left: auto;
}

/* ===== 渠道占比 ===== */
.channel-stats {
  padding: 20px;
}

.channel-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.channel-item:last-child {
  margin-bottom: 0;
}

.channel-name {
  width: 90px;
  font-size: 13px;
  color: #666;
  flex-shrink: 0;
}

.channel-bar-wrap {
  flex: 1;
  height: 12px;
  background: #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
}

.channel-bar {
  height: 100%;
  border-radius: 6px;
  transition: width 0.5s;
}

.channel-value {
  width: 50px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  text-align: right;
  flex-shrink: 0;
}

/* ===== 表格 ===== */
.table-wrapper {
  padding: 12px 20px;
}

::deep(.total-row td) {
  font-weight: 600;
  background-color: #fafafa !important;
}

@media (max-width: 1200px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: 1fr;
  }
}
</style>
