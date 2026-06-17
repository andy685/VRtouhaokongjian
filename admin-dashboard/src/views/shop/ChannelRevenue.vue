<template>
  <div class="page-container animate-fade-in">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>渠道营收分析</h2>
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

    <!-- 提示信息 -->
    <n-alert type="warning" :show-icon="false" class="notice-bar">
      注意:该报表只统计收入数据，不会减去退款数据。退款冲正影响请查看「历史营收统计」页面的退款金额列，或月度结算页。
    </n-alert>

    <!-- 数据说明 -->
    <n-alert v-if="showDataExplain" type="info" :show-icon="false" class="notice-bar">
      <div class="data-explain-content">
        <p style="font-weight:600;margin-bottom:4px;">两种收银方式（按结算方式区分，非按游戏区分）：</p>
        <p>🖥️ <b>收银系统</b> — 店员通过柜员 POS 操作：预存款充值、设备项目开台、商品销售</p>
        <p>📱 <b>点播系统</b> — 顾客自助扫码点播，结算时可在小程序中使用优惠券抵扣</p>
        <p style="margin-top:4px;">营收总额 = 线下营收（线下-预存款 + 线下-设备项目 + 线下-商品 + 线下-直接点播）+ 小程序营收（小程序-预存款 + 小程序-设备项目）</p>
        <p style="color:#3B82F6;font-weight:500;">净营收 = 营收总额 − 优惠券抵扣额（本表暂不含退款，退款见结算页）</p>
      </div>
    </n-alert>

    <!-- 筛选标签 -->
    <div v-if="hasActiveFilter" class="filter-tags">
      <span class="filter-label">当前筛选：</span>
      <n-tag v-if="displayDateRange" closable @close="clearDateFilter" size="small" type="info">
        {{ displayDateStr }}
      </n-tag>
      <n-tag v-if="displayStore" closable @close="clearStoreFilter" size="small" type="info">
        {{ displayStoreLabel }}
      </n-tag>
    </div>

    <!-- 数据表格 -->
    <div class="section-card">
      <div class="scroll-hint" v-if="showScrollHint && !hasScrolled">
        <n-icon :component="ChevronForwardOutline" size="16" />
        <span>左右滑动查看所有数据</span>
        <n-icon :component="ChevronForwardOutline" size="16" />
      </div>
      <div
        class="table-wrapper"
        ref="tableWrapperRef"
        @scroll="handleTableScroll"
      >
        <n-data-table
          :columns="columns"
          :data="tableData"
          :pagination="pagination"
          striped
          size="small"
          :scroll-x="1500"
          :row-class-name="(row: any) => row.isTotal ? 'total-row' : ''"
        />
      </div>
    </div>

    <!-- 筛选抽屉 -->
    <n-drawer v-model:show="showFilterDrawer" width="360" placement="right">
      <n-drawer-content title="筛选条件" closable>
        <n-form label-placement="left" :label-width="80">
          <n-form-item label="日期范围">
            <n-date-picker v-model:value="filterDateRange" type="daterange" style="width: 100%;" clearable />
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
import { ref, h, computed } from 'vue'
import {
  NButton, NIcon, NDataTable, NDrawer, NDrawerContent,
  NForm, NFormItem, NSelect, NDatePicker, NSpace, NTag, NAlert,
} from 'naive-ui'
import { FilterOutline, DownloadOutline, ChevronForwardOutline } from '@vicons/ionicons5'

const showFilterDrawer = ref(false)
const filterDateRange = ref<[number, number] | null>(null)
const filterStore = ref<string | null>(null)
const tableWrapperRef = ref<HTMLDivElement | null>(null)
const hasScrolled = ref(false)
const showDataExplain = ref(true)
const showScrollHint = ref(false)

function handleTableScroll() {
  if (tableWrapperRef.value && tableWrapperRef.value.scrollLeft > 10) {
    hasScrolled.value = true
  }
}

function checkScrollable() {
  if (tableWrapperRef.value) {
    showScrollHint.value = tableWrapperRef.value.scrollWidth > tableWrapperRef.value.clientWidth
  }
}

const displayDateRange = ref<[number, number] | null>(null)
const displayStore = ref<string | null>(null)

const storeOptions = [
  { label: '卓远萝岗区店', value: '1' },
  { label: '卓远萧山区店', value: '2' },
  { label: '卓远亚运城店', value: '3' },
  { label: '卓远文鼎路店', value: '4' },
  { label: '卓远天河路店', value: '5' },
  { label: '卓远白云路店', value: '6' },
]

const displayStoreLabel = computed(() => {
  if (!displayStore.value) return ''
  return storeOptions.find(o => o.value === displayStore.value)?.label || ''
})

const hasActiveFilter = computed(() => {
  return !!displayDateRange.value || !!displayStore.value
})

function clearDateFilter() {
  displayDateRange.value = null
  filterDateRange.value = null
}

function clearStoreFilter() {
  displayStore.value = null
  filterStore.value = null
}

const today = new Date()
const displayDateStr = computed(() => {
  if (displayDateRange.value) {
    const s = new Date(displayDateRange.value[0])
    const e = new Date(displayDateRange.value[1])
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    return `${fmt(s)} ~ ${fmt(e)}`
  }
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
})

function handleSearch() {
  if (filterDateRange.value) {
    displayDateRange.value = [...filterDateRange.value]
  } else {
    displayDateRange.value = null
  }
  displayStore.value = filterStore.value || null
  showFilterDrawer.value = false
}

function handleResetFilter() {
  filterDateRange.value = null
  filterStore.value = null
}

/**
 * 数据生成说明：
 * 当前各字段（营收总额、线下营收、小程序营收、各细分渠道）均为独立随机生成，
 * 它们之间没有真实的加总关系。即：
 *   revenueTotal ≠ offlineRevenue + wechatRevenue
 *   offlineRevenue ≠ 线下各细分渠道之和
 * 这是模拟数据的简化处理，实际业务中应从底层渠道往上汇总。
 */

// 模拟数据：生成最近7天、6个店铺的数据
function generateMockData() {
  const stores = ['卓远萝岗区店', '卓远萧山区店', '卓远亚运城店', '卓远文鼎路店', '卓远天河路店', '卓远白云路店']
  const result: { id: number; store: string; date: string }[] = []
  let id = 1
  for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
    const d = new Date()
    d.setDate(d.getDate() - dayOffset)
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    for (const store of stores) {
      result.push({ id: id++, store, date: dateStr })
    }
  }
  return result
}

const allStores = generateMockData()

function seedRandom(storeId: number, index: number, dateStr: string): number {
  let hash = storeId * 31 + index * 17
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i)
  }
  hash = Math.abs(hash)
  return (hash % 10000) / 100
}

function getStoreData(store: typeof allStores[0]) {
  const s = seedRandom(store.id, 1, store.date)
  const s2 = seedRandom(store.id, 2, store.date)
  return {
    ...store,
    revenueTotal: Math.round(s * 12860) / 100,
    grossAmount: Math.round(s * 13800) / 100,
    couponAmount: Math.round(s * 940) / 100,
    offlineRevenue: Math.round(s * 8560) / 100,
    wechatRevenue: Math.round(s2 * 2860) / 100,
    // 收银系统 = 店员操作渠道（预存款+套票+设备项目+商品）
    cashierRevenue: Math.round(s * 8220) / 100,
    // 点播系统 = 顾客自助（直接点播）
    selfServiceRevenue: Math.round(s2 * 340) / 100,
    offlinePrepaid: Math.round(s * 3560) / 100,
    offlineDevice: Math.round(s * 2120) / 100,
    offlineGoods: Math.round(s * 860) / 100,
    offlineLive: Math.round(s2 * 340) / 100,
    wechatPrepaid: Math.round(s2 * 1260) / 100,
    wechatDevice: Math.round(s2 * 860) / 100,
  }
}

const tableData = computed(() => {
  let data = allStores.map(getStoreData)
  // 数据计算完成后检查是否需要横向滚动提示
  setTimeout(checkScrollable, 100)

  // 店铺筛选
  if (displayStore.value) {
    const storeName = storeOptions.find(o => o.value === displayStore.value)?.label || ''
    data = data.filter(d => d.store === storeName)
  }

  // 日期范围筛选
  if (displayDateRange.value) {
    const start = new Date(displayDateRange.value[0])
    const end = new Date(displayDateRange.value[1])
    const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`
    const endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`
    data = data.filter(d => d.date >= startStr && d.date <= endStr)
  }

  // 合计行
  const total = {
    id: 999,
    store: '合计',
    date: '',
    revenueTotal: 0,
    grossAmount: 0,
    couponAmount: 0,
    offlineRevenue: 0,
    wechatRevenue: 0,
    cashierRevenue: 0,
    selfServiceRevenue: 0,
    offlinePrepaid: 0,
    offlineDevice: 0,
    offlineGoods: 0,
    offlineLive: 0,
    wechatPrepaid: 0,
    wechatDevice: 0,
    isTotal: true,
  }
  for (const d of data) {
    total.revenueTotal += d.revenueTotal
    total.grossAmount += d.grossAmount
    total.couponAmount += d.couponAmount
    total.offlineRevenue += d.offlineRevenue
    total.wechatRevenue += d.wechatRevenue
    total.cashierRevenue += d.cashierRevenue
    total.selfServiceRevenue += d.selfServiceRevenue
    total.offlinePrepaid += d.offlinePrepaid
    total.offlineDevice += d.offlineDevice
    total.offlineGoods += d.offlineGoods
    total.offlineLive += d.offlineLive
    total.wechatPrepaid += d.wechatPrepaid
    total.wechatDevice += d.wechatDevice
  }

  return [...data, total]
})

function fmtMoney(val: number) {
  return val.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const columns = [
  { title: '店铺', key: 'store', width: 120, fixed: 'left' as const,
    render(row: any) { return row.isTotal ? h('b', {}, row.store) : row.store }
  },
  { title: '日期', key: 'date', width: 100, fixed: 'left' as const },
  { title: '营收总额', key: 'revenueTotal', width: 110, align: 'center' as const,
    render(row: any) { return fmtMoney(row.revenueTotal) }
  },
  { title: '订单原价', key: 'grossAmount', width: 100, align: 'center' as const,
    render(row: any) { return fmtMoney(row.grossAmount) }
  },
  { title: '优惠抵扣', key: 'couponAmount', width: 95, align: 'center' as const,
    render(row: any) { return h('span', { style: 'color:#EF4444;font-weight:600;' }, `-${fmtMoney(row.couponAmount)}`) }
  },
  { title: '线下营收', key: 'offlineRevenue', width: 110, align: 'center' as const,
    render(row: any) { return fmtMoney(row.offlineRevenue) }
  },
  { title: '小程序营收', key: 'wechatRevenue', width: 110, align: 'center' as const,
    render(row: any) { return fmtMoney(row.wechatRevenue) }
  },
  { title: '收银系统', key: 'cashierRevenue', width: 100, align: 'center' as const,
    render(row: any) { return h('span', { style: 'color:#3B82F6;font-weight:500;' }, fmtMoney(row.cashierRevenue)) }
  },
  { title: '点播系统', key: 'selfServiceRevenue', width: 100, align: 'center' as const,
    render(row: any) { return h('span', { style: 'color:#8B5CF6;font-weight:500;' }, fmtMoney(row.selfServiceRevenue)) }
  },
  { title: '线下-预存款', key: 'offlinePrepaid', width: 110, align: 'center' as const,
    render(row: any) { return fmtMoney(row.offlinePrepaid) }
  },
  { title: '线下-设备项目', key: 'offlineDevice', width: 110, align: 'center' as const,
    render(row: any) { return fmtMoney(row.offlineDevice) }
  },
  { title: '线下-商品', key: 'offlineGoods', width: 100, align: 'center' as const,
    render(row: any) { return fmtMoney(row.offlineGoods) }
  },
  { title: '线下-直接点播', key: 'offlineLive', width: 110, align: 'center' as const,
    render(row: any) { return fmtMoney(row.offlineLive) }
  },
  { title: '小程序-预存款', key: 'wechatPrepaid', width: 120, align: 'center' as const,
    render(row: any) { return fmtMoney(row.wechatPrepaid) }
  },
  { title: '小程序-设备项目', key: 'wechatDevice', width: 120, align: 'center' as const,
    render(row: any) { return fmtMoney(row.wechatDevice) }
  },
]

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
  margin-bottom: 16px;
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

.notice-bar {
  margin-bottom: 16px;
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

.section-card {
  background: white;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.table-wrapper {
  padding: 12px 16px;
  overflow-x: auto;
  cursor: grab;
}

.table-wrapper:active {
  cursor: grabbing;
}

.table-wrapper::-webkit-scrollbar {
  height: 8px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.scroll-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  font-size: 12px;
  color: #999;
  background: linear-gradient(90deg, transparent, #fff8e6, transparent);
  border-bottom: 1px dashed #f0e6c8;
  animation: hint-pulse 2s ease-in-out infinite;
}

.data-explain-content {
  padding: 8px 12px;
  font-size: 13px;
  color: #666;
  line-height: 1.8;
}

.data-explain-content p {
  margin: 0;
}

@keyframes hint-pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

::deep(.total-row td) {
  font-weight: 600;
  background-color: #fafafa !important;
}
</style>
