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
      注意：退款按实际退款日统计，跨日退款可能导致当日净营收为负数（如1号充值、2号退款，1号营收正常，2号退款列显示冲正金额）。
    </n-alert>

    <!-- 数据说明 -->
    <n-alert v-if="showDataExplain" type="info" :show-icon="false" class="notice-bar">
      <div class="data-explain-content">
        <p style="font-weight:600;margin-bottom:4px;">两种收银方式（按结算方式区分，非按游戏区分）：</p>
        <p>🖥️ <b>收银系统</b> — 店员通过柜员 POS 操作：预存款充值、设备项目开台、商品销售</p>
        <p>📱 <b>点播系统</b> — 顾客自助扫码点播，结算时可在小程序中使用优惠券抵扣</p>
        <p style="margin-top:4px;">营收总额 = 收银系统（预存款 + 设备项目 + 商品）+ 点播系统</p>
        <p style="color:#999;font-size:12px;">收银系统和点播系统均为优惠后金额。净营收 = 营收总额 − 退款金额（退款按退款日统计，可能为负值）</p>
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
          :scroll-x="1320"
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
 * 营收总额 = 收银系统 + 点播系统 = 订单原价 − 优惠抵扣
 * 收银系统和点播系统均为优惠后净营收（已扣减优惠券）
 * 收银系统 = 预存款 + 设备项目 + 商品（从子项汇总）
 * 净营收 = 营收总额 − 退款金额（退款按退款日统计，可正可负）
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

  // 订单原价和优惠（基于同一种子，保持一致）
  const grossAmount = Math.round(s * 13800) / 100             // 订单原价
  const couponAmount = Math.round(s * 940) / 100               // 优惠抵扣
  const revenueTotal = grossAmount - couponAmount              // 营收总额 = 原价 − 优惠

  // 点播系统（顾客扫码，占比较小），约 5%~15% 的营收总额
  const selfServiceRatio = 0.05 + (s2 % 10) / 100             // 5%~15%
  const selfServiceRevenue = Math.round(revenueTotal * selfServiceRatio * 100) / 100

  // 收银系统 = 营收总额 − 点播系统（确保加总一致）
  const cashierRevenue = Math.round((revenueTotal - selfServiceRevenue) * 100) / 100

  // 收银系统子项拆分（按比例：预存款~55%，设备项目~32%，商品~13%）
  const cashierPrepaid = Math.round(cashierRevenue * 0.55 * 100) / 100
  const cashierDevice = Math.round(cashierRevenue * 0.32 * 100) / 100
  const cashierGoods = Math.round((cashierRevenue - cashierPrepaid - cashierDevice) * 100) / 100

  // 退款金额（按退款日统计，部分行退款 > 营收以体现跨日退款场景）
  const refundRatio = 0.05 + (s2 % 30) / 100                 // 5%~35%
  const refundAmount = Math.round(revenueTotal * refundRatio * 100) / 100

  // 净营收 = 营收总额 − 退款金额（可为负值）
  const netRevenue = Math.round((revenueTotal - refundAmount) * 100) / 100

  return {
    ...store,
    revenueTotal,
    grossAmount,
    couponAmount,
    refundAmount,
    netRevenue,
    cashierRevenue,
    cashierPrepaid,
    cashierDevice,
    cashierGoods,
    selfServiceRevenue,
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
    refundAmount: 0,
    netRevenue: 0,
    cashierRevenue: 0,
    selfServiceRevenue: 0,
    cashierPrepaid: 0,
    cashierDevice: 0,
    cashierGoods: 0,
    isTotal: true,
  }
  for (const d of data) {
    total.revenueTotal += d.revenueTotal
    total.grossAmount += d.grossAmount
    total.couponAmount += d.couponAmount
    total.refundAmount += d.refundAmount
    total.netRevenue += d.netRevenue
    total.cashierRevenue += d.cashierRevenue
    total.selfServiceRevenue += d.selfServiceRevenue
    total.cashierPrepaid += d.cashierPrepaid
    total.cashierDevice += d.cashierDevice
    total.cashierGoods += d.cashierGoods
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
  { title: '退款金额', key: 'refundAmount', width: 100, align: 'center' as const,
    render(row: any) { return h('span', { style: 'color:#EF4444;font-weight:600;' }, `-${fmtMoney(row.refundAmount)}`) }
  },
  { title: '净营收', key: 'netRevenue', width: 110, align: 'center' as const,
    render(row: any) { return h('span', { style: row.netRevenue < 0 ? 'color:#EF4444;font-weight:700;' : 'color:#059669;font-weight:700;' }, fmtMoney(row.netRevenue)) }
  },
  { title: '收银系统', key: 'cashierRevenue', width: 110, align: 'center' as const,
    render(row: any) { return h('span', { style: 'color:#3B82F6;font-weight:500;' }, fmtMoney(row.cashierRevenue)) }
  },
  { title: '点播系统', key: 'selfServiceRevenue', width: 110, align: 'center' as const,
    render(row: any) { return h('span', { style: 'color:#8B5CF6;font-weight:500;' }, fmtMoney(row.selfServiceRevenue)) }
  },
  { title: '收银系统-预存款', key: 'cashierPrepaid', width: 130, align: 'center' as const,
    render(row: any) { return fmtMoney(row.cashierPrepaid) }
  },
  { title: '收银系统-设备项目', key: 'cashierDevice', width: 140, align: 'center' as const,
    render(row: any) { return fmtMoney(row.cashierDevice) }
  },
  { title: '收银系统-商品', key: 'cashierGoods', width: 120, align: 'center' as const,
    render(row: any) { return fmtMoney(row.cashierGoods) }
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
