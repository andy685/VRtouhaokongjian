<template>
  <div class="page-container animate-fade-in">
    <!-- 筛选栏 -->
    <div class="view-mode-bar">
      <n-radio-group v-model:value="viewMode" size="small">
        <n-radio-button value="day">按日</n-radio-button>
        <n-radio-button value="month">按月</n-radio-button>
      </n-radio-group>
      <div class="header-actions">
        <n-button secondary size="small" @click="showFilterDrawer = true">
          <template #icon>
            <n-icon :component="FilterOutline" />
          </template>
          筛选
        </n-button>
        <n-button secondary size="small" @click="exportData">
          <template #icon>
            <n-icon :component="DownloadOutline" />
          </template>
          导出
        </n-button>
      </div>
    </div>

    <!-- 已选条件标签 -->
    <div v-if="hasActiveFilter" class="filter-tags">
      <n-tag v-if="displayDateLabel" closable @close="clearDateFilter" size="small" style="margin-right: 8px;">
        {{ displayDateLabel }}
      </n-tag>
      <n-tag v-if="displayStoreLabel" closable @close="clearStoreFilter" size="small">
        {{ displayStoreLabel }}
      </n-tag>
    </div>

    <!-- 一、统计概览 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="CashOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">期间收款总额</span>
          <span class="value">¥{{ kpiData.receiptTotal.toLocaleString() }}</span>
          <span class="kpi-hint">含充值收款 + 直接消费</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="ArrowUpCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">期间充值总额</span>
          <span class="value">¥{{ kpiData.rechargeTotal.toLocaleString() }}</span>
          <span class="kpi-hint">顾客向会员账户储值</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #EF4444, #DC2626);">
          <n-icon :component="ArrowDownCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">期间消费总额</span>
          <span class="value" style="color: #EF4444;">¥{{ kpiData.consumeTotal.toLocaleString() }}</span>
          <span class="kpi-hint">含直接消费 + 预存款消费</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="SwapHorizontalOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">净变动金额</span>
          <span class="value" :style="{ color: kpiData.netChange >= 0 ? '#10B981' : '#EF4444' }">
            {{ kpiData.netChange >= 0 ? '+' : '-' }}¥{{ Math.abs(kpiData.netChange).toLocaleString() }}
          </span>
          <span class="kpi-hint">充值 + 赠送 − 消费 ± 调整</span>
        </div>
      </div>
    </div>
    <n-alert type="info" :bordered="false" class="kpi-explanation">
      <strong>口径说明：</strong>充值总额为顾客向会员账户储值的原始金额（此金额已通过拉卡拉进入商家总账）；消费总额为顾客用账户余额/直接支付消费的金额（含预存款消费和直接消费），消费不产生新的拉卡拉收款。充值总额与消费总额不可直接相加，否则会造成重复计算。
    </n-alert>

    <!-- 二、收款与充值消费趋势 -->
    <div class="section-card">
      <div class="section-title">
        <span class="title-bar"></span>
        <span>{{ chartMetric === 'receipt' ? '收款趋势' : chartMetric === 'recharge' ? '充值趋势' : '消费趋势' }}</span>
        <span class="section-sub">{{ displayDateLabel || '全部数据' }}</span>
      </div>
      <div class="chart-metric-switch">
        <button
          class="metric-btn"
          :class="{ active: chartMetric === 'receipt' }"
          @click="chartMetric = 'receipt'"
        >
          收款
        </button>
        <button
          class="metric-btn"
          :class="{ active: chartMetric === 'recharge' }"
          @click="chartMetric = 'recharge'"
        >
          充值
        </button>
        <button
          class="metric-btn"
          :class="{ active: chartMetric === 'consume' }"
          @click="chartMetric = 'consume'"
        >
          消费
        </button>
      </div>
      <div class="chart-area" @mouseleave="hoveredIndex = -1">
        <div class="y-axis">
          <span v-for="(label, i) in yAxisLabels" :key="i">{{ label }}</span>
        </div>
        <div class="chart-scroll-wrapper">
          <div class="chart-grid">
            <div v-for="n in 3" :key="n" class="grid-line" :style="{ top: ((n - 1) / 2) * 100 + '%' }"></div>
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
                class="chart-bar single"
                :class="{ 'chart-bar-hover': hoveredIndex === idx }"
                :style="{ height: item.barHeight + 'px', background: chartMetric === 'receipt' ? '#F59E0B' : chartMetric === 'recharge' ? '#3B82F6' : '#EF4444' }"
              ></div>
            </div>
          </div>
          <div class="x-axis">
            <span v-for="(item, idx) in trendData" :key="idx" class="x-label">
              {{ idx % labelStep === 0 ? item.label : '' }}
            </span>
          </div>
          <!-- 悬浮提示 -->
          <div
            v-if="hoveredIndex >= 0 && hoveredIndex < trendData.length"
            class="chart-tooltip"
            :style="{ left: tooltipX + 'px', top: tooltipY + 'px' }"
          >
            <div class="tooltip-title">{{ trendData[hoveredIndex].label }}</div>
            <div class="tooltip-row">
              <span class="tooltip-dot" :style="{ background: chartMetric === 'receipt' ? '#F59E0B' : chartMetric === 'recharge' ? '#3B82F6' : '#EF4444' }"></span>
              <span class="tooltip-label">{{ chartMetric === 'receipt' ? '收款' : chartMetric === 'recharge' ? '充值' : '消费' }}</span>
              <span class="tooltip-value">¥{{ trendData[hoveredIndex].rawValue.toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 三、账户变动汇总表 -->
    <div class="section-card">
      <div class="section-title">
        <span class="title-bar"></span>
        <span>账户变动汇总</span>
        <span class="section-sub">{{ displayDateLabel || '全部数据' }}</span>
      </div>
      <div class="table-wrapper">
        <n-data-table
          :columns="columns"
          :data="tableData"
          :pagination="pagination"
          striped
          size="small"
          :row-class-name="rowClassName"
        />
      </div>
    </div>

    <!-- 筛选抽屉 -->
    <n-drawer v-model:show="showFilterDrawer" placement="right" width="360">
      <n-drawer-content title="筛选条件">
        <n-form label-placement="top">
          <n-form-item label="日期范围">
            <n-date-picker
              v-if="viewMode === 'day'"
              v-model:value="filterDateRange"
              type="daterange"
              clearable
              style="width: 100%;"
            />
            <n-date-picker
              v-else
              v-model:value="filterMonthRange"
              type="monthrange"
              clearable
              style="width: 100%;"
            />
          </n-form-item>
          <n-form-item label="店铺">
            <n-select v-model:value="filterStore" placeholder="请选择店铺" :options="storeOptions" clearable />
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
import { ref, computed, h } from 'vue'
import {
  NButton, NIcon, NDataTable, NDrawer, NDrawerContent,
  NForm, NFormItem, NSelect, NDatePicker, NSpace, NTag,
  NRadioGroup, NRadioButton, NAlert,
} from 'naive-ui'
import {
  FilterOutline, DownloadOutline,
  ArrowUpCircleOutline, ArrowDownCircleOutline,
  SwapHorizontalOutline, CashOutline
} from '@vicons/ionicons5'

const showFilterDrawer = ref(false)
const filterDateRange = ref<[number, number] | null>(null)
const filterMonthRange = ref<[number, number] | null>(null)
const filterStore = ref<string | null>(null)

const displayDateRange = ref<[number, number] | null>(null)
const displayMonthRange = ref<[number, number] | null>(null)
const displayStore = ref<string | null>(null)
const viewMode = ref<'day' | 'month'>('day')
const chartMetric = ref<'receipt' | 'recharge' | 'consume'>('receipt')
const hoveredIndex = ref(-1)
const tooltipX = ref(0)
const tooltipY = ref(0)
const labelStep = computed(() => Math.max(1, Math.ceil(trendData.value.length / 10)))

const storeOptions = [
  { label: '利民街小展厅', value: '利民街小展厅' },
  { label: '卓远萝岗区店', value: '卓远萝岗区店' },
  { label: '卓远萧山区店', value: '卓远萧山区店' },
  { label: '卓远亚运城店', value: '卓远亚运城店' },
  { label: '卓远文鼎路店', value: '卓远文鼎路店' },
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
    if (filterDateRange.value) displayDateRange.value = [...filterDateRange.value]
    filterMonthRange.value = null
  } else {
    if (filterMonthRange.value) displayMonthRange.value = [...filterMonthRange.value]
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

function handleChartMouseMove(e: MouseEvent) {
  const rect = (e.currentTarget as HTMLElement)?.closest('.chart-scroll-wrapper')?.getBoundingClientRect()
  if (rect) {
    tooltipX.value = e.clientX - rect.left + 12
    tooltipY.value = e.clientY - rect.top - 12
  }
}

function exportData() {
  console.log('导出数据')
}

// ===== 模拟数据生成 =====
function generateDailyData(days: number) {
  const data: any[] = []
  const stores = ['利民街小展厅', '卓远萝岗区店', '卓远萧山区店', '卓远亚运城店', '卓远文鼎路店']
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = `${d.getMonth() + 1}/${d.getDate()}`
    const fullDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    for (const store of stores) {
      const seed = (fullDate.charCodeAt(0) + store.length + i) % 100
      const recharge = Math.round((seed + 10) * 85)
      const directConsume = Math.round((seed + 3) * 28)
      const prepaidConsume = Math.round((seed + 5) * 34)
      const consume = directConsume + prepaidConsume
      const gift = Math.round((seed + 2) * 15)
      const adjust = Math.round((seed % 3) * 8)
      data.push({
        date: fullDate,
        displayDate: dateStr,
        store,
        recharge,
        directConsume,
        prepaidConsume,
        consume,
        gift,
        adjust,
        receipt: recharge + directConsume,
        netChange: recharge + gift - consume + adjust,
      })
    }
  }
  return data
}

const dailyRawData = generateDailyData(365)

const filteredData = computed(() => {
  let data = dailyRawData
  if (displayStore.value) {
    data = data.filter(d => d.store === displayStore.value)
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
  const rechargeTotal = data.reduce((s, d) => s + d.recharge, 0)
  const consumeTotal = data.reduce((s, d) => s + d.consume, 0)
  const giftTotal = data.reduce((s, d) => s + d.gift, 0)
  const adjustTotal = data.reduce((s, d) => s + d.adjust, 0)
  const receiptTotal = data.reduce((s, d) => s + d.receipt, 0)
  const netChange = rechargeTotal + giftTotal - consumeTotal + adjustTotal
  return {
    receiptTotal,
    rechargeTotal,
    consumeTotal,
    netChange,
  }
})

function fmtMoney(val: number) {
  if (val >= 10000) return '¥' + (val / 10000).toFixed(1) + '万'
  return '¥' + val.toLocaleString()
}

// ===== 趋势数据 =====
const trendData = computed(() => {
  const map = new Map<string, { label: string; receipt: number; recharge: number; consume: number }>()
  for (const d of filteredData.value) {
    const key = viewMode.value === 'month' ? d.date.slice(0, 7) : d.date
    const label = viewMode.value === 'month' ? d.date.slice(0, 7) : d.displayDate
    if (!map.has(key)) {
      map.set(key, { label, receipt: 0, recharge: 0, consume: 0 })
    }
    const item = map.get(key)!
    item.receipt += d.receipt
    item.recharge += d.recharge
    item.consume += d.consume
  }
  let arr = Array.from(map.values())

  const MAX_BARS = 20
  if (arr.length > MAX_BARS) {
    const bucketSize = Math.ceil(arr.length / MAX_BARS)
    const buckets: typeof arr = []
    for (let i = 0; i < arr.length; i += bucketSize) {
      const chunk = arr.slice(i, i + bucketSize)
      buckets.push({
        label: chunk[0].label,
        receipt: chunk.reduce((s, d) => s + d.receipt, 0),
        recharge: chunk.reduce((s, d) => s + d.recharge, 0),
        consume: chunk.reduce((s, d) => s + d.consume, 0),
      })
    }
    arr = buckets
  }

  const key = chartMetric.value
  const maxVal = Math.max(...arr.map(a => a[key]), 1)
  return arr.map(item => ({
    label: item.label,
    barHeight: Math.round((item[key] / maxVal) * 160),
    rawValue: item[key],
  }))
})

// ===== Y 轴标签 =====
const yAxisLabels = computed(() => {
  const maxVal = Math.max(...trendData.value.map(d => d.rawValue), 1)
  const top = fmtMoney(maxVal)
  const mid = fmtMoney(Math.round(maxVal / 2))
  return [top, mid, '0']
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
        recharge: 0,
        directConsume: 0,
        prepaidConsume: 0,
        consume: 0,
        receipt: 0,
        adjust: 0,
        netChange: 0,
      })
    }
    const item = map.get(key)
    item.recharge += d.recharge
    item.directConsume += d.directConsume
    item.prepaidConsume += d.prepaidConsume
    item.consume += d.consume
    item.receipt += d.receipt
    item.adjust += d.adjust
    item.netChange += d.netChange
  }
  const arr = Array.from(map.values()).sort((a, b) => a.sortKey.localeCompare(b.sortKey))
  const total = {
    date: '合计',
    store: '',
    recharge: arr.reduce((s, d) => s + d.recharge, 0),
    directConsume: arr.reduce((s, d) => s + d.directConsume, 0),
    prepaidConsume: arr.reduce((s, d) => s + d.prepaidConsume, 0),
    consume: arr.reduce((s, d) => s + d.consume, 0),
    receipt: arr.reduce((s, d) => s + d.receipt, 0),
    adjust: arr.reduce((s, d) => s + d.adjust, 0),
    netChange: arr.reduce((s, d) => s + d.netChange, 0),
    isTotal: true,
  }
  return [...arr, total]
})

const columns = [
  { title: '日期', key: 'date', width: 120 },
  { title: '店铺', key: 'store', width: 140 },
  { title: '收款合计', key: 'receipt', width: 130, render: (row: any) => h('span', { style: { color: '#F59E0B', fontWeight: 600 } }, `¥${row.receipt.toLocaleString()}`) },
  { title: '充值', key: 'recharge', width: 130, render: (row: any) => h('span', { style: { color: '#3B82F6', fontWeight: 600 } }, `¥${row.recharge.toLocaleString()}`) },
  { title: '直接消费', key: 'directConsume', width: 120, render: (row: any) => h('span', { style: { color: '#EF4444', fontWeight: 600 } }, `¥${row.directConsume.toLocaleString()}`) },
  { title: '预存款消费', key: 'prepaidConsume', width: 120, render: (row: any) => h('span', { style: { color: '#EF4444', fontWeight: 600 } }, `¥${row.prepaidConsume.toLocaleString()}`) },
  { title: '手动调整', key: 'adjust', width: 110, render: (row: any) => `¥${row.adjust.toLocaleString()}` },
  { title: '净变动', key: 'netChange', width: 130, render: (row: any) => h('span', { style: { color: row.netChange >= 0 ? '#10B981' : '#EF4444', fontWeight: 600 } }, `${row.netChange >= 0 ? '+' : '-'}¥${Math.abs(row.netChange).toLocaleString()}`) },
]

function rowClassName(row: any) {
  return row.isTotal ? 'total-row' : ''
}

const pagination = { pageSize: 15 }
</script>

<style scoped>
.page-container { padding: 24px; --border-color: #e8e8e8; --text-primary: #333; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { font-size: 20px; font-weight: 600; color: #333; margin: 0; }

.view-mode-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding: 12px 20px; background: #ffffff; border-radius: 10px; border: 1px solid #e8e8e8; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); }
.header-actions { display: flex; gap: 10px; }

::deep(.view-mode-bar .n-radio-group .n-radio-button) { font-weight: 500; min-width: 72px; text-align: center; }
::deep(.view-mode-bar .n-radio-group .n-radio-button.n-radio-button--checked) { background: #f0f5ff; color: #2563eb; border-color: #2563eb; }

/* 统计卡片 */
.stats-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 20px; }
.stat-card { background: white; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-content { display: flex; flex-direction: column; gap: 4px; }
.stat-content .label { font-size: 13px; color: #666; }
.stat-content .value { font-size: 22px; font-weight: 700; color: #333; }
.stat-content .kpi-hint { font-size: 11px; color: #999; margin-top: 2px; line-height: 1.4; }

.kpi-explanation { margin-bottom: 20px; font-size: 13px; line-height: 1.7; }

/* 区块 */
.section-card { background: white; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 20px; overflow: hidden; }
.section-title { display: flex; align-items: center; gap: 8px; padding: 14px 20px; font-size: 15px; font-weight: 600; color: var(--text-primary); border-bottom: 1px solid #f0f0f0; }
.title-bar { width: 4px; height: 16px; background: #1890ff; border-radius: 2px; }
.section-sub { font-size: 13px; font-weight: 400; color: #999; margin-left: auto; }

/* 图表 */
.chart-metric-switch { display: flex; gap: 0; padding: 12px 20px 0; }
.metric-btn { padding: 5px 16px; border: 1px solid #e0e0e0; background: #fff; font-size: 13px; color: #666; cursor: pointer; transition: all 0.2s; }
.metric-btn:first-child { border-radius: 4px 0 0 4px; }
.metric-btn:last-child { border-radius: 0 4px 4px 0; }
.metric-btn:hover { border-color: #1890ff; color: #1890ff; }
.metric-btn.active { background: #1890ff; border-color: #1890ff; color: #fff; }
.chart-area { display: flex; padding: 12px 20px 20px; height: 240px; position: relative; }
.y-axis { display: flex; flex-direction: column; justify-content: space-between; align-items: flex-end; padding-right: 10px; font-size: 11px; color: #999; flex-shrink: 0; height: 180px; margin-top: 10px; border-right: 1px solid #e0e0e0; }
.chart-scroll-wrapper { flex: 1; position: relative; overflow-x: auto; overflow-y: hidden; }
.chart-grid { position: absolute; top: 10px; left: 0; right: 0; bottom: 40px; pointer-events: none; z-index: 0; }
.grid-line { position: absolute; left: 0; right: 0; height: 1px; background: #f0f0f0; }
.mock-chart { display: flex; align-items: flex-end; justify-content: space-around; height: calc(100% - 40px); gap: 4px; padding: 0 10px; min-height: 160px; position: relative; z-index: 1; }
.chart-bar-group { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; flex: 1; min-width: 14px; height: 100%; }
.chart-bar-stack { display: flex; align-items: flex-end; justify-content: center; gap: 2px; width: 100%; }
.chart-bar { width: 14px; border-radius: 4px 4px 0 0; transition: height 0.3s; }
.chart-bar.single { width: 14px; }
.x-axis { display: flex; align-items: flex-start; justify-content: space-around; height: 40px; gap: 4px; padding: 6px 10px 0; position: relative; z-index: 1; }
.x-label { flex: 1; min-width: 14px; text-align: center; font-size: 11px; color: #999; white-space: nowrap; }
.chart-bar-hover { opacity: 0.8; filter: brightness(1.1); }
.chart-tooltip { position: absolute; background: rgba(0, 0, 0, 0.85); color: white; border-radius: 6px; padding: 10px 14px; font-size: 13px; pointer-events: none; z-index: 100; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); white-space: nowrap; }
.tooltip-title { font-weight: 600; margin-bottom: 6px; padding-bottom: 6px; border-bottom: 1px solid rgba(255, 255, 255, 0.15); }
.tooltip-row { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.tooltip-row:last-child { margin-bottom: 0; }
.tooltip-dot { width: 8px; height: 8px; border-radius: 50%; }
.tooltip-label { color: rgba(255, 255, 255, 0.7); }
.tooltip-value { font-weight: 600; margin-left: auto; }

/* 表格 */
.table-wrapper { padding: 12px 20px; }
::deep(.total-row td) { font-weight: 600; background-color: #fafafa !important; }

/* 筛选标签 */
.filter-tags { margin-bottom: 16px; }

@media (max-width: 1400px) {
  .stats-row { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 768px) {
  .stats-row { grid-template-columns: 1fr; }
}
</style>
