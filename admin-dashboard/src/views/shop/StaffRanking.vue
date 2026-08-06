<template>
  <div class="page-container animate-fade-in">
    <!-- 页头 -->
    <div class="page-header">
      <h1>员工销售排名</h1>
      <n-button secondary size="small" @click="exportData">
        <template #icon><n-icon :component="DownloadOutline" /></template>
        导出Excel
      </n-button>
    </div>

    <!-- 口径说明 -->
    <n-alert type="info" :show-icon="true" style="margin-bottom: 20px;">
      本排名仅统计收银台（头号管家）人工服务产生的销售数据，不包含机柜自助点播产生的销售流水。
    </n-alert>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <n-select v-model:value="timeRange" :options="timeOptions" size="small" style="width: 130px;" />
      <n-date-picker
        v-if="timeRange === 'custom'"
        type="daterange"
        clearable
        size="small"
        v-model:value="customDateRange"
        style="width: 260px;"
      />
      <n-select v-model:value="filterShop" :options="shopOptions" size="small" style="width: 160px;" clearable placeholder="全部店铺" />
      <n-select v-model:value="sortBy" :options="sortOptions" size="small" style="width: 150px;" />
    </div>

    <!-- Top3 领奖台 -->
    <div class="podium">
      <div
        v-for="(staff, index) in topStaff"
        :key="staff.id"
        class="podium-card"
        :class="'rank-' + (index + 1)"
      >
        <div class="podium-rank">
          <n-icon v-if="index === 0" :component="TrophyOutline" size="28" color="#F59E0B" />
          <n-icon v-else-if="index === 1" :component="MedalOutline" size="24" color="#9CA3AF" />
          <n-icon v-else :component="MedalOutline" size="24" color="#CD7F32" />
        </div>
        <div class="podium-avatar" :class="'avatar-' + (index + 1)">
          {{ staff.name.charAt(0) }}
        </div>
        <div class="podium-name">{{ staff.name }}</div>
        <div class="podium-id">{{ staff.employeeId }} · {{ staff.shop }}</div>
        <div class="podium-metrics">
          <div class="podium-metric">
            <span class="metric-label">收银总额</span>
            <span class="metric-value">¥{{ staff.totalAmount.toLocaleString() }}</span>
          </div>
          <div class="podium-metric">
            <span class="metric-label">收银笔数</span>
            <span class="metric-value">{{ staff.orderCount }}笔</span>
          </div>
          <div class="podium-metric">
            <span class="metric-label">实收金额</span>
            <span class="metric-value">¥{{ staff.netAmount.toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 排名表格 -->
    <div class="section-card">
      <div class="section-title">
        <span class="title-bar"></span>
        <span>完整排名</span>
        <span class="section-sub">{{ currentPeriodLabel }}</span>
      </div>
      <div class="table-wrapper">
        <n-data-table
          :columns="columns"
          :data="tableData"
          :pagination="pagination"
          striped
          size="small"
          :row-class-name="(row: any) => row.rank <= 3 ? 'rank-highlight-row' : ''"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NButton, NIcon, NDataTable, NSelect, NDatePicker, NAlert, NTag, useMessage,
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { DownloadOutline, TrophyOutline, MedalOutline } from '@vicons/ionicons5'

const message = useMessage()

// ==================== 筛选 ====================
const timeRange = ref('month')
const timeOptions = [
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '上月', value: 'lastMonth' },
  { label: '本季度', value: 'quarter' },
  { label: '自定义', value: 'custom' },
]
const customDateRange = ref<[number, number] | null>(null)

const filterShop = ref<string | null>(null)
const shopOptions = [
  { label: '利民街小展厅', value: '利民街小展厅' },
  { label: '卓远萝岗区店', value: '卓远萝岗区店' },
  { label: '卓远萧山区店', value: '卓远萧山区店' },
  { label: '卓远亚运城店', value: '卓远亚运城店' },
  { label: '卓远文鼎路店', value: '卓远文鼎路店' },
]

const sortBy = ref('totalAmount')
const sortOptions = [
  { label: '按收银总额', value: 'totalAmount' },
  { label: '按实收金额', value: 'netAmount' },
  { label: '按收银笔数', value: 'orderCount' },
  { label: '按客单价', value: 'avgAmount' },
]

const currentPeriodLabel = computed(() => {
  const map: Record<string, string> = {
    week: '本周',
    month: '本月',
    lastMonth: '上月',
    quarter: '本季度',
    custom: '自定义',
  }
  return map[timeRange.value] || ''
})

const pagination = { pageSize: 15 }

// ==================== Mock 数据 ====================
interface StaffRecord {
  id: number
  name: string
  employeeId: string
  shop: string
  orderCount: number
  totalAmount: number
  refundCount: number
  refundAmount: number
  giftCount: number
  giftAmount: number
  netAmount: number
  rank: number
  status: string
}

// 不同时段的数据（模拟）
const allStaffData: StaffRecord[] = [
  { id: 1, name: '张三', employeeId: 'A001', shop: '卓远亚运城店', orderCount: 186, totalAmount: 12860, refundCount: 3, refundAmount: 180, giftCount: 5, giftAmount: 320, status: '在职' },
  { id: 2, name: '李四', employeeId: 'A002', shop: '卓远亚运城店', orderCount: 162, totalAmount: 10980, refundCount: 2, refundAmount: 120, giftCount: 3, giftAmount: 180, status: '在职' },
  { id: 3, name: '王五', employeeId: 'A003', shop: '卓远亚运城店', orderCount: 145, totalAmount: 9560, refundCount: 5, refundAmount: 360, giftCount: 2, giftAmount: 150, status: '在职' },
  { id: 4, name: '赵六', employeeId: 'A004', shop: '卓远萝岗区店', orderCount: 138, totalAmount: 8920, refundCount: 1, refundAmount: 60, giftCount: 4, giftAmount: 240, status: '在职' },
  { id: 5, name: '钱七', employeeId: 'A005', shop: '卓远萝岗区店', orderCount: 120, totalAmount: 7680, refundCount: 2, refundAmount: 140, giftCount: 1, giftAmount: 80, status: '在职' },
  { id: 6, name: '孙八', employeeId: 'A006', shop: '卓远萧山区店', orderCount: 110, totalAmount: 6950, refundCount: 4, refundAmount: 280, giftCount: 2, giftAmount: 120, status: '在职' },
  { id: 7, name: '周九', employeeId: 'A007', shop: '卓远萧山区店', orderCount: 95, totalAmount: 5820, refundCount: 1, refundAmount: 50, giftCount: 3, giftAmount: 160, status: '在职' },
  { id: 8, name: '吴十', employeeId: 'A008', shop: '卓远文鼎路店', orderCount: 88, totalAmount: 5160, refundCount: 3, refundAmount: 200, giftCount: 2, giftAmount: 100, status: '在职' },
  { id: 9, name: '郑十一', employeeId: 'A009', shop: '卓远文鼎路店', orderCount: 76, totalAmount: 4380, refundCount: 0, refundAmount: 0, giftCount: 1, giftAmount: 60, status: '在职' },
  { id: 10, name: '陈十二', employeeId: 'A010', shop: '利民街小展厅', orderCount: 68, totalAmount: 3920, refundCount: 2, refundAmount: 100, giftCount: 1, giftAmount: 50, status: '在职' },
  { id: 11, name: '林十三', employeeId: 'A011', shop: '利民街小展厅', orderCount: 55, totalAmount: 3180, refundCount: 1, refundAmount: 40, giftCount: 0, giftAmount: 0, status: '休假' },
  { id: 12, name: '黄十四', employeeId: 'A012', shop: '卓远亚运城店', orderCount: 42, totalAmount: 2460, refundCount: 1, refundAmount: 60, giftCount: 1, giftAmount: 40, status: '在职' },
]

// 时段数据缩放因子（模拟不同时段的数值差异）
const periodFactor: Record<string, number> = {
  week: 0.25,
  month: 1,
  lastMonth: 0.92,
  quarter: 3,
  custom: 1,
}

// ==================== 计算属性 ====================
const filteredData = computed(() => {
  let data = [...allStaffData]
  if (filterShop.value) {
    data = data.filter(d => d.shop === filterShop.value)
  }
  return data
})

const rankedData = computed(() => {
  const factor = periodFactor[timeRange.value] || 1
  const list = filteredData.value.map(s => ({
    ...s,
    orderCount: Math.round(s.orderCount * factor),
    totalAmount: Math.round(s.totalAmount * factor),
    refundCount: Math.round(s.refundCount * factor),
    refundAmount: Math.round(s.refundAmount * factor),
    giftCount: Math.round(s.giftCount * factor),
    giftAmount: Math.round(s.giftAmount * factor),
  }))
  // 计算实收金额
  list.forEach(s => {
    s.netAmount = s.totalAmount - s.refundAmount
  })
  // 排序
  list.sort((a, b) => (b as any)[sortBy.value] - (a as any)[sortBy.value])
  // 分配排名
  list.forEach((s, i) => { s.rank = i + 1 })
  return list
})

const topStaff = computed(() => rankedData.value.slice(0, 3))

const tableData = computed(() => rankedData.value.map(s => ({
  ...s,
  avgAmount: s.orderCount > 0 ? Math.round(s.totalAmount / s.orderCount) : 0,
})))

// ==================== 表格列 ====================
const fmtMoney = (val: number) => `¥${val.toLocaleString()}`

const columns: DataTableColumns = [
  {
    title: '排名',
    key: 'rank',
    width: 80,
    align: 'center',
    sorter: (a: any, b: any) => a.rank - b.rank,
    render: (row: any) =>
      row.rank <= 3
        ? h(NIcon, {
            component: row.rank === 1 ? TrophyOutline : MedalOutline,
            size: 20,
            color: row.rank === 1 ? '#F59E0B' : row.rank === 2 ? '#9CA3AF' : '#CD7F32',
          })
        : h('span', { style: { fontWeight: 600, color: '#6B7280' } }, row.rank),
  },
  { title: '收银员', key: 'name', width: 100, fixed: 'left' as const },
  { title: '工号', key: 'employeeId', width: 90, align: 'center' as const },
  { title: '店铺', key: 'shop', width: 140 },
  { title: '状态', key: 'status', width: 80, align: 'center' as const, render: (row: any) =>
    h(NTag, { type: row.status === '在职' ? 'success' : 'warning', size: 'small', bordered: false },
      { default: () => row.status })
  },
  {
    title: '收银笔数',
    key: 'orderCount',
    width: 110,
    align: 'center' as const,
    sorter: (a: any, b: any) => a.orderCount - b.orderCount,
    render: (row: any) => `${row.orderCount}笔`,
  },
  {
    title: '收银总额',
    key: 'totalAmount',
    width: 120,
    align: 'center' as const,
    sorter: (a: any, b: any) => a.totalAmount - b.totalAmount,
    render: (row: any) => h('span', { style: { color: '#3B82F6', fontWeight: 600 } }, fmtMoney(row.totalAmount)),
  },
  {
    title: '客单价',
    key: 'avgAmount',
    width: 100,
    align: 'center' as const,
    sorter: (a: any, b: any) => a.avgAmount - b.avgAmount,
    render: (row: any) => fmtMoney(row.avgAmount),
  },
  {
    title: '退款笔数',
    key: 'refundCount',
    width: 100,
    align: 'center' as const,
    sorter: (a: any, b: any) => a.refundCount - b.refundCount,
    render: (row: any) => row.refundCount > 0
      ? h('span', { style: { color: '#EF4444' } }, `${row.refundCount}笔`)
      : `${row.refundCount}笔`,
  },
  {
    title: '退款金额',
    key: 'refundAmount',
    width: 110,
    align: 'center' as const,
    sorter: (a: any, b: any) => a.refundAmount - b.refundAmount,
    render: (row: any) => row.refundAmount > 0
      ? h('span', { style: { color: '#EF4444' } }, fmtMoney(row.refundAmount))
      : '-',
  },
  {
    title: '赠送笔数',
    key: 'giftCount',
    width: 100,
    align: 'center' as const,
    sorter: (a: any, b: any) => a.giftCount - b.giftCount,
    render: (row: any) => row.giftCount > 0 ? `${row.giftCount}笔` : '-',
  },
  {
    title: '赠送金额',
    key: 'giftAmount',
    width: 110,
    align: 'center' as const,
    sorter: (a: any, b: any) => a.giftAmount - b.giftAmount,
    render: (row: any) => row.giftAmount > 0
      ? h('span', { style: { color: '#8B5CF6' } }, fmtMoney(row.giftAmount))
      : '-',
  },
  {
    title: '实收金额',
    key: 'netAmount',
    width: 130,
    align: 'center' as const,
    sorter: (a: any, b: any) => a.netAmount - b.netAmount,
    render: (row: any) => h('span', { style: { color: '#10B981', fontWeight: 600 } }, fmtMoney(row.netAmount)),
  },
]

// ==================== 导出 ====================
function exportData() {
  const headers = ['排名', '收银员', '工号', '店铺', '状态', '收银笔数', '收银总额', '客单价', '退款笔数', '退款金额', '赠送笔数', '赠送金额', '实收金额']
  const rows = tableData.value.map((item: any) => [
    item.rank,
    item.name,
    item.employeeId,
    item.shop,
    item.status,
    item.orderCount,
    item.totalAmount,
    item.avgAmount,
    item.refundCount,
    item.refundAmount,
    item.giftCount,
    item.giftAmount,
    item.netAmount,
  ])

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.href = url
  link.download = `员工销售排名-${currentPeriodLabel.value}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  message.success('排名数据已导出')
}
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-header h1 { font-size: 20px; font-weight: 600; color: var(--text-primary); margin: 0; }

/* 筛选栏 */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

/* Top3 领奖台 */
.podium {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}
.podium-card {
  background: var(--color-bg-white);
  border-radius: 16px;
  padding: 24px 20px;
  border: 1px solid var(--border-color);
  text-align: center;
  position: relative;
  overflow: hidden;
  transition: all 0.25s;
}
.podium-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
.podium-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 4px;
}
.rank-1::before { background: linear-gradient(90deg, #F59E0B, #FBBF24); }
.rank-2::before { background: linear-gradient(90deg, #9CA3AF, #D1D5DB); }
.rank-3::before { background: linear-gradient(90deg, #CD7F32, #D4A574); }
.podium-rank { margin-bottom: 12px; }
.podium-avatar {
  width: 56px; height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin: 0 auto 10px;
}
.avatar-1 { background: linear-gradient(135deg, #F59E0B, #D97706); }
.avatar-2 { background: linear-gradient(135deg, #9CA3AF, #6B7280); }
.avatar-3 { background: linear-gradient(135deg, #CD7F32, #A0522D); }
.podium-name { font-size: 16px; font-weight: 600; color: var(--text-primary); }
.podium-id { font-size: 12px; color: var(--text-muted); margin-top: 2px; margin-bottom: 16px; }
.podium-metrics {
  display: flex;
  justify-content: space-around;
  gap: 8px;
}
.podium-metric { text-align: center; }
.podium-metric .metric-label { display: block; font-size: 12px; color: var(--text-muted); }
.podium-metric .metric-value { display: block; font-size: 15px; font-weight: 600; color: var(--text-primary); margin-top: 4px; }

/* 区块卡片 */
.section-card {
  background: var(--color-bg-white);
  border-radius: 12px;
  padding: 20px 24px;
  border: 1px solid var(--border-color);
}
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.title-bar { width: 4px; height: 16px; background: var(--color-brand); border-radius: 2px; }
.section-title > span:nth-child(2) { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.section-sub { font-size: 13px; color: var(--text-muted); }
.table-wrapper { overflow-x: auto; }

/* 高亮排名行 */
::deep(.rank-highlight-row td) {
  background-color: #FFFBEB !important;
}

/* 响应式 */
@media (max-width: 900px) {
  .podium { grid-template-columns: 1fr; }
  .podium-metrics { flex-direction: column; gap: 12px; }
}
</style>
