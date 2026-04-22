<template>
  <div class="page-container animate-fade-in">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>销售日报</h2>
      <div class="header-actions">
        <n-button type="primary" @click="showFilterDrawer = true">
          <template #icon><n-icon :component="FilterOutline" /></template>
          筛选
        </n-button>
        <n-button type="primary">导出</n-button>
      </div>
    </div>

    <!-- 一、营业概况 -->
    <div class="section-card">
      <div class="section-title">
        <span class="title-bar"></span>
        <span>营业概况</span>
        <span class="section-sub">{{ displayDateStr }}</span>
      </div>
      <div class="table-wrapper">
        <n-data-table
          :columns="overviewColumns"
          :data="overviewData"
          :pagination="false"
          striped
          size="small"
          :row-class-name="(row: any) => row.isTotal ? 'total-row' : ''"
          :scroll-x="800"
        />
      </div>
    </div>

    <!-- 二、业务数据 -->
    <div class="section-card">
      <div class="section-title">
        <span class="title-bar"></span>
        <span>业务数据</span>
        <span class="section-sub">{{ displayDateStr }}</span>
      </div>
      <div class="table-wrapper">
        <n-data-table
          :columns="businessColumns"
          :data="businessData"
          :pagination="false"
          striped
          size="small"
          :row-class-name="(row: any) => row.isTotal ? 'total-row' : ''"
          :scroll-x="700"
        />
      </div>
    </div>

    <!-- 三、支付数据 -->
    <div class="section-card">
      <div class="section-title">
        <span class="title-bar"></span>
        <span>支付数据</span>
        <span class="section-sub">{{ displayDateStr }}</span>
      </div>
      <div class="table-wrapper">
        <n-data-table
          :columns="paymentColumns"
          :data="paymentData"
          :pagination="false"
          striped
          size="small"
          :row-class-name="(row: any) => row.isTotal ? 'total-row' : ''"
          :scroll-x="900"
        />
      </div>
    </div>

    <!-- 筛选抽屉 -->
    <n-drawer v-model:show="showFilterDrawer" width="360" placement="right">
      <n-drawer-content title="筛选条件" closable>
        <n-form label-placement="left" :label-width="80">
          <n-form-item label="查看日期">
            <n-date-picker v-model:value="filterDate" type="date" style="width: 100%;" clearable />
          </n-form-item>
          <n-form-item label="门店">
            <n-select placeholder="请选择门店" :options="storeOptions" clearable />
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
  NButton, NIcon, NDataTable,
  NDrawer, NDrawerContent, NForm, NFormItem, NSelect,
  NDatePicker, NSpace,
} from 'naive-ui'
import { FilterOutline } from '@vicons/ionicons5'

const showFilterDrawer = ref(false)
const filterDateRange = ref<[number, number] | null>(null)

// 当前展示的日报（默认今天）
const displayDateRange = ref<[number, number] | null>(null)

const storeOptions = [
  { label: '卓远萝岗区店', value: '1' },
  { label: '卓远萧山区店', value: '2' },
  { label: '卓远亚运城店', value: '3' },
  { label: '卓远文鼎路店', value: '4' },
]

// ===== 日期相关 =====
const displayDateStr = computed(() => {
  const d = new Date(displayDate.value)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${y}-${m}-${day} ${weekDays[d.getDay()]}`
})

function handleSearch() {
  if (filterDate.value) {
    displayDate.value = filterDate.value
  }
  showFilterDrawer.value = false
}

function handleResetFilter() {
  filterDate.value = null
}

// ===== 模拟每日数据生成 =====
function seedRandom(dateStr: string, index: number): number {
  let hash = 0
  for (let i = 0; i < dateStr.length; i++) hash = ((hash << 5) - hash) + dateStr.charCodeAt(i) + index * 31
  hash = Math.abs(hash)
  return (hash % 10000) / 100
}

function getDayData(dateStr: string) {
  const s = seedRandom(dateStr, 1)
  const s2 = seedRandom(dateStr, 2)
  const overview = [
    { id: 1, store: '卓远萝岗区店', revenueTotal: Math.round(s * 128.6), costTotal: Math.round(s * 35.8), orderCount: Math.round(s * 8.6) + 20, grossProfit: Math.round(s * 92.8), grossRate: '72.2' },
    { id: 2, store: '卓远萧山区店', revenueTotal: Math.round(s2 * 95.2), costTotal: Math.round(s2 * 28.56), orderCount: Math.round(s2 * 6.2) + 15, grossProfit: Math.round(s2 * 66.64), grossRate: '70.0' },
    { id: 3, store: '卓远亚运城店', revenueTotal: Math.round((s + s2) / 2 * 156.8), costTotal: Math.round((s + s2) / 2 * 42.38), orderCount: Math.round((s + s2) / 2 * 10.5) + 30, grossProfit: Math.round((s + s2) / 2 * 114.42), grossRate: '73.0' },
    { id: 4, store: '卓远文鼎路店', revenueTotal: Math.round(s2 * 73.45), costTotal: Math.round(s2 * 22.03), orderCount: Math.round(s2 * 4.8) + 12, grossProfit: Math.round(s2 * 51.41), grossRate: '70.0' },
    { isTotal: true, store: '合计',
      revenueTotal: Math.round(s * 128.6) + Math.round(s2 * 95.2) + Math.round((s + s2) / 2 * 156.8) + Math.round(s2 * 73.45),
      costTotal: Math.round(s * 35.8) + Math.round(s2 * 28.56) + Math.round((s + s2) / 2 * 42.38) + Math.round(s2 * 22.03),
      orderCount: Math.round(s * 8.6) + 20 + Math.round(s2 * 6.2) + 15 + Math.round((s + s2) / 2 * 10.5) + 30 + Math.round(s2 * 4.8) + 12,
      grossProfit: Math.round(s * 92.8) + Math.round(s2 * 66.64) + Math.round((s + s2) / 2 * 114.42) + Math.round(s2 * 51.41),
      grossRate: '71.6',
    },
  ]

  const b1 = seedRandom(dateStr, 3)
  const business = [
    { id: 1, store: '卓远萝岗区店', business: '预存充值', revenueAmount: Math.round(b1 * 52), refundAmount: Math.round(b1 * 2) },
    { id: 2, store: '卓远萝岗区店', business: '开卡费', revenueAmount: Math.round(b1 * 12.8), refundAmount: 0 },
    { id: 3, store: '卓远萝岗区店', business: '直播卖打赏赚', revenueAmount: Math.round(b1 * 8.6), refundAmount: Math.round(b1 * 0.5) },
    { id: 4, store: '卓远萝岗区店', business: '项目套餐', revenueAmount: Math.round(b1 * 55.2), refundAmount: Math.round(b1 * 3) },
    { id: 5, store: '合计', business: '', revenueAmount: Math.round(b1 * 128.6), refundAmount: Math.round(b1 * 5.5), isTotal: true },
  ]

  const p1 = seedRandom(dateStr, 4)
  const payment = [
    { id: 1, store: '卓远萝岗区店', payMethod: '微信', count: Math.round(p1 * 5.2) + 15, actualAmount: Math.round(p1 * 78.6), refundAmount: Math.round(p1 * 3.8), netAmount: Math.round(p1 * 74.8) },
    { id: 2, store: '卓远萝岗区店', payMethod: '支付宝', count: Math.round(p1 * 2.2) + 8, actualAmount: Math.round(p1 * 36.8), refundAmount: Math.round(p1 * 1.2), netAmount: Math.round(p1 * 35.6) },
    { id: 3, store: '卓远萝岗区店', payMethod: '现金', count: Math.round(p1 * 0.8) + 3, actualAmount: Math.round(p1 * 10.2), refundAmount: Math.round(p1 * 0.5), netAmount: Math.round(p1 * 9.7) },
    { id: 4, store: '卓远萝岗区店', payMethod: '会员余额', count: Math.round(p1 * 1.2) + 5, actualAmount: Math.round(p1 * 13), refundAmount: Math.round(p1 * 1), netAmount: Math.round(p1 * 12) },
    { id: 5, store: '合计', payMethod: '',
      count: Math.round(p1 * 9.4) + 31,
      actualAmount: Math.round(p1 * 138.6),
      refundAmount: Math.round(p1 * 6.5),
      netAmount: Math.round(p1 * 132.1),
      isTotal: true,
    },
  ]

  return { overview, business, payment }
}

// ===== 响应式数据 =====
const currentData = computed(() => {
  const d = new Date(displayDate.value)
  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return getDayData(dateStr)
})

const overviewData = computed(() => currentData.value.overview)
const businessData = computed(() => currentData.value.business)
const paymentData = computed(() => currentData.value.payment)

// ===== 营业概况 表格列 =====
const overviewColumns = [
  {
    title: '门店', key: 'store', width: 140,
    render(row: any) { return row.isTotal ? h('b', {}, row.store) : row.store }
  },
  { title: '营收总额（元）', key: 'revenueTotal', width: 130, align: 'center' as const,
    render(row: any) { const v = Number(row.revenueTotal); return Number.isFinite(v) ? v.toLocaleString('zh-CN') : row.revenueTotal }
  },
  { title: '成本总额（元）', key: 'costTotal', width: 130, align: 'center' as const,
    render(row: any) { const v = Number(row.costTotal); return Number.isFinite(v) ? v.toLocaleString('zh-CN') : row.costTotal }
  },
  { title: '总单数（元）', key: 'orderCount', width: 110, align: 'center' as const },
  { title: '毛利润（元）', key: 'grossProfit', width: 120, align: 'center' as const,
    render(row: any) { const v = Number(row.grossProfit); return Number.isFinite(v) ? v.toLocaleString('zh-CN') : row.grossProfit }
  },
  { title: '毛利率（%）', key: 'grossRate', width: 110, align: 'center' as const },
]

// ===== 业务数据 表格列 =====
const businessColumns = [
  { title: '店铺', key: 'store', width: 140 },
  { title: '业务', key: 'business', width: 130 },
  { title: '营收金额（元）', key: 'revenueAmount', width: 130, align: 'center' as const,
    render(row: any) { const v = Number(row.revenueAmount); return Number.isFinite(v) ? v.toLocaleString('zh-CN', { minimumFractionDigits: 2 }) : row.revenueAmount }
  },
  { title: '退款金额（元）', key: 'refundAmount', width: 130, align: 'center' as const,
    render(row: any) { const v = Number(row.refundAmount); return Number.isFinite(v) ? v.toLocaleString('zh-CN', { minimumFractionDigits: 2 }) : row.refundAmount }
  },
]

// ===== 支付数据 表格列 =====
const paymentColumns = [
  { title: '店铺', key: 'store', width: 140 },
  { title: '支付方式', key: 'payMethod', width: 130 },
  { title: '笔数', key: 'count', width: 80, align: 'center' as const },
  { title: '实收金额（元）', key: 'actualAmount', width: 130, align: 'center' as const,
    render(row: any) { const v = Number(row.actualAmount); return Number.isFinite(v) ? v.toLocaleString('zh-CN', { minimumFractionDigits: 2 }) : row.actualAmount }
  },
  { title: '退款金额（元）', key: 'refundAmount', width: 130, align: 'center' as const,
    render(row: any) { const v = Number(row.refundAmount); return Number.isFinite(v) ? v.toLocaleString('zh-CN', { minimumFractionDigits: 2 }) : row.refundAmount }
  },
  { title: '净收金额（元）', key: 'netAmount', width: 130, align: 'center' as const,
    render(row: any) { const v = Number(row.netAmount); return Number.isFinite(v) ? v.toLocaleString('zh-CN', { minimumFractionDigits: 2 }) : row.netAmount }
  },
]
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

.table-wrapper {
  padding: 12px 20px;
}

::deep(.total-row td) {
  font-weight: 600;
  background-color: #fafafa !important;
}
</style>
