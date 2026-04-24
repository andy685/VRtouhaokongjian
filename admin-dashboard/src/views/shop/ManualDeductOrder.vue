<template>
  <div class="page-container animate-fade-in">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>手动扣费订单</h2>
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

    <!-- 筛选标签 -->
    <div v-if="hasActiveFilter" class="filter-tags">
      <span class="filter-label">当前筛选：</span>
      <n-tag v-if="displayDateRange" closable @close="clearDateFilter" size="small" type="info">
        {{ displayDateStr }}
      </n-tag>
      <n-tag v-if="displayStore" closable @close="clearStoreFilter" size="small" type="info">
        {{ displayStoreLabel }}
      </n-tag>
      <n-tag v-if="displayMemberPhone" closable @close="clearMemberPhoneFilter" size="small" type="info">
        会员手机: {{ displayMemberPhone }}
      </n-tag>
      <n-tag v-if="displayDeductType" closable @close="clearDeductTypeFilter" size="small" type="info">
        扣费类型: {{ displayDeductTypeLabel }}
      </n-tag>
      <n-tag v-if="displayOperator" closable @close="clearOperatorFilter" size="small" type="info">
        操作人: {{ displayOperator }}
      </n-tag>
    </div>

    <!-- 数据表格 -->
    <div class="section-card">
      <div class="table-wrapper">
        <n-data-table
          :columns="columns"
          :data="tableData"
          :pagination="pagination"
          striped
          size="small"
          :scroll-x="1400"
        />
      </div>
    </div>

    <!-- 筛选抽屉 -->
    <n-drawer v-model:show="showFilterDrawer" width="360" placement="right">
      <n-drawer-content title="筛选条件" closable>
        <n-form label-placement="left" :label-width="80">
          <n-form-item label="店铺">
            <n-select v-model:value="filterStore" placeholder="请选择店铺" :options="storeOptions" clearable />
          </n-form-item>
          <n-form-item label="会员手机">
            <n-input v-model:value="filterMemberPhone" placeholder="请输入会员手机号" clearable />
          </n-form-item>
          <n-form-item label="扣费类型">
            <n-select v-model:value="filterDeductType" placeholder="请选择扣费类型" :options="deductTypeOptions" clearable />
          </n-form-item>
          <n-form-item label="操作人">
            <n-input v-model:value="filterOperator" placeholder="请输入操作人" clearable />
          </n-form-item>
          <n-form-item label="日期范围">
            <n-date-picker v-model:value="filterDateRange" type="daterange" style="width: 100%;" clearable />
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

    <!-- 详情弹窗 -->
    <n-modal v-model:show="showDetailModal" preset="card" title="订单详情" style="width: 560px;" :bordered="false">
      <n-descriptions v-if="detailData" :column="2" bordered label-placement="left" size="small">
        <n-descriptions-item label="订单号">{{ detailData.orderNo }}</n-descriptions-item>
        <n-descriptions-item label="所属店铺">{{ detailData.shop }}</n-descriptions-item>
        <n-descriptions-item label="会员">{{ detailData.member }}</n-descriptions-item>
        <n-descriptions-item label="会员手机">{{ detailData.memberPhone }}</n-descriptions-item>
        <n-descriptions-item label="扣费类型">
          <n-tag :type="deductTypeMap[detailData.deductType]?.type || 'default'" size="small">{{ deductTypeMap[detailData.deductType]?.label || detailData.deductType }}</n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="扣费金额">{{ detailData.deductAmount }}</n-descriptions-item>
        <n-descriptions-item label="扣费前余额">{{ detailData.balanceBefore }}</n-descriptions-item>
        <n-descriptions-item label="扣费后余额">{{ detailData.balanceAfter }}</n-descriptions-item>
        <n-descriptions-item label="操作人">{{ detailData.operator }}</n-descriptions-item>
        <n-descriptions-item label="创建时间">{{ detailData.createTime }}</n-descriptions-item>
      </n-descriptions>
      <div v-if="detailData" class="detail-items-section">
        <h3 class="section-title">扣费明细</h3>
        <n-data-table :columns="itemColumns" :data="[{ device: detailData.device, gameFilm: detailData.gameFilm, deductAmount: detailData.deductAmount, remark: detailData.remark }]" :bordered="true" :single-line="false" size="small" />
      </div>
      <template #footer>
        <n-space justify="center">
          <n-button @click="showDetailModal = false">关闭</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, h, computed } from 'vue'
import {
  NButton, NIcon, NDataTable, NDrawer, NDrawerContent,
  NForm, NFormItem, NSelect, NDatePicker, NSpace, NTag, NInput,
} from 'naive-ui'
import { FilterOutline, DownloadOutline } from '@vicons/ionicons5'

const showFilterDrawer = ref(false)
const showDetailModal = ref(false)
const detailData = ref<DeductOrder | null>(null)
const filterStore = ref<string | null>(null)
const filterMemberPhone = ref('')
const filterDeductType = ref<string | null>(null)
const filterOperator = ref('')
const filterDateRange = ref<[number, number] | null>(null)

const displayStore = ref<string | null>(null)
const displayMemberPhone = ref('')
const displayDeductType = ref<string | null>(null)
const displayOperator = ref('')
const displayDateRange = ref<[number, number] | null>(null)

const storeOptions = [
  { label: '卓远萝岗区店', value: '1' },
  { label: '卓远萧山区店', value: '2' },
  { label: '卓远亚运城店', value: '3' },
  { label: '卓远文鼎路店', value: '4' },
]

const deductTypeOptions = [
  { label: '储值', value: 'stored' },
  { label: '次数', value: 'times' },
  { label: '游戏币', value: 'points' },
]

const displayStoreLabel = computed(() => {
  if (!displayStore.value) return ''
  return storeOptions.find(o => o.value === displayStore.value)?.label || ''
})

const displayDeductTypeLabel = computed(() => {
  if (!displayDeductType.value) return ''
  return deductTypeMap[displayDeductType.value]?.label || displayDeductType.value
})

const hasActiveFilter = computed(() => {
  return !!displayDateRange.value || !!displayStore.value || !!displayMemberPhone.value || !!displayDeductType.value || !!displayOperator.value
})

function clearDateFilter() {
  displayDateRange.value = null
  filterDateRange.value = null
}

function clearStoreFilter() {
  displayStore.value = null
  filterStore.value = null
}

function clearMemberPhoneFilter() {
  displayMemberPhone.value = ''
  filterMemberPhone.value = ''
}

function clearDeductTypeFilter() {
  displayDeductType.value = null
  filterDeductType.value = null
}

function clearOperatorFilter() {
  displayOperator.value = ''
  filterOperator.value = ''
}

const displayDateStr = computed(() => {
  if (displayDateRange.value) {
    const s = new Date(displayDateRange.value[0])
    const e = new Date(displayDateRange.value[1])
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    return `${fmt(s)} ~ ${fmt(e)}`
  }
  return ''
})

function handleSearch() {
  displayStore.value = filterStore.value || null
  displayMemberPhone.value = filterMemberPhone.value || ''
  displayDeductType.value = filterDeductType.value || null
  displayOperator.value = filterOperator.value || ''
  if (filterDateRange.value) {
    displayDateRange.value = [...filterDateRange.value]
  } else {
    displayDateRange.value = null
  }
  showFilterDrawer.value = false
}

function handleResetFilter() {
  filterStore.value = null
  filterMemberPhone.value = ''
  filterDeductType.value = null
  filterOperator.value = ''
  filterDateRange.value = null
}

// ===== 扣费类型映射 =====
const deductTypeMap: Record<string, { label: string; type: 'success' | 'warning' | 'info' }> = {
  stored: { label: '储值', type: 'success' },
  times: { label: '次数', type: 'warning' },
  points: { label: '游戏币', type: 'info' },
}

// ===== 模拟数据 =====
interface DeductOrder {
  id: number
  orderNo: string
  member: string
  memberPhone: string
  deductType: string
  deductAmount: number
  balanceBefore: number
  balanceAfter: number
  operator: string
  remark: string
  createTime: string
  device: string
  gameFilm: string
  shop: string
}

const rawData = ref<DeductOrder[]>([
  { id: 1, orderNo: 'DK20260423001', shop: '卓远萝岗区店', member: '张三', memberPhone: '13800138001', deductType: 'stored', deductAmount: 50.00, balanceBefore: 200.00, balanceAfter: 150.00, operator: 'admin', remark: 'VR设备暗黑战场扣费', createTime: '2026-04-23 10:30:00', device: '暗黑战场舱', gameFilm: '暗黑战场' },
  { id: 2, orderNo: 'DK20260423002', shop: '卓远萧山区店', member: '李四', memberPhone: '13800138002', deductType: 'times', deductAmount: 2, balanceBefore: 10, balanceAfter: 8, operator: 'admin', remark: '幻影飞碟项目消费', createTime: '2026-04-23 11:15:00', device: '幻影飞碟舱', gameFilm: '幻影飞碟' },
  { id: 3, orderNo: 'DK20260423003', shop: '卓远亚运城店', member: '王五', memberPhone: '13800138003', deductType: 'points', deductAmount: 500, balanceBefore: 2000, balanceAfter: 1500, operator: 'manager', remark: '星际穿越游戏币兑换', createTime: '2026-04-23 14:20:00', device: '星际穿越舱', gameFilm: '星际穿越' },
  { id: 4, orderNo: 'DK20260422001', shop: '卓远文鼎路店', member: '赵六', memberPhone: '13800138004', deductType: 'stored', deductAmount: 100.00, balanceBefore: 500.00, balanceAfter: 400.00, operator: 'admin', remark: '亲子套票设备扣费', createTime: '2026-04-22 09:45:00', device: '亲子互动舱', gameFilm: '亲子乐园' },
  { id: 5, orderNo: 'DK20260422002', shop: '卓远萝岗区店', member: '孙七', memberPhone: '13800138005', deductType: 'times', deductAmount: 1, balanceBefore: 5, balanceAfter: 4, operator: 'staff01', remark: '深海探险单次消费', createTime: '2026-04-22 16:00:00', device: '深海探险舱', gameFilm: '深海探险' },
  { id: 6, orderNo: 'DK20260421001', shop: '卓远萧山区店', member: '周八', memberPhone: '13800138006', deductType: 'stored', deductAmount: 30.00, balanceBefore: 120.00, balanceAfter: 90.00, operator: 'admin', remark: '暗黑双子星补扣费用', createTime: '2026-04-21 13:10:00', device: '暗黑双子星舱', gameFilm: '暗黑双子星' },
])

const tableData = computed(() => {
  let data = rawData.value

  if (displayStore.value) {
    data = data.filter(d => d.shop === displayStore.value)
  }

  if (displayMemberPhone.value) {
    data = data.filter(d => d.memberPhone.includes(displayMemberPhone.value))
  }

  if (displayDeductType.value) {
    data = data.filter(d => d.deductType === displayDeductType.value)
  }

  if (displayOperator.value) {
    data = data.filter(d => d.operator.includes(displayOperator.value))
  }

  if (displayDateRange.value) {
    const start = new Date(displayDateRange.value[0])
    const end = new Date(displayDateRange.value[1])
    const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`
    const endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`
    data = data.filter(d => {
      const datePart = d.createTime.split(' ')[0]
      return datePart >= startStr && datePart <= endStr
    })
  }

  return data
})

const columns = [
  { title: '订单号', key: 'orderNo', width: 160 },
  { title: '所属店铺', key: 'shop', width: 120, align: 'center' as const },
  { title: '会员', key: 'member', width: 100 },
  {
    title: '扣费类型',
    key: 'deductType',
    width: 90,
    align: 'center' as const,
    render(row: DeductOrder) {
      const cfg = deductTypeMap[row.deductType]
      return h(NTag, { type: cfg?.type || 'default', size: 'small' }, { default: () => cfg?.label || row.deductType })
    }
  },
  { title: '设备', key: 'device', width: 120, align: 'center' as const },
  { title: '游戏/影片', key: 'gameFilm', width: 120, align: 'center' as const },
  { title: '扣费金额', key: 'deductAmount', width: 100, align: 'center' as const },
  { title: '扣费前余额', key: 'balanceBefore', width: 110, align: 'center' as const },
  { title: '扣费后余额', key: 'balanceAfter', width: 110, align: 'center' as const },
  { title: '操作人', key: 'operator', width: 90, align: 'center' as const },
  { title: '扣费原因', key: 'remark', minWidth: 160 },
  { title: '创建时间', key: 'createTime', width: 160 },
  {
    title: '操作',
    key: 'actions',
    width: 80,
    align: 'center' as const,
    fixed: 'right' as const,
    render(row: DeductOrder) {
      return h(NButton, { size: 'small', type: 'primary', text: true, onClick: () => openDetail(row) }, { default: () => '详情' })
    }
  },
]

const pagination = { pageSize: 10 }

function openDetail(row: DeductOrder) {
  detailData.value = row
  showDetailModal.value = true
}

const itemColumns = [
  { title: '设备', key: 'device', minWidth: 120 },
  { title: '游戏/影片', key: 'gameFilm', minWidth: 120 },
  { title: '扣费金额', key: 'deductAmount', width: 100, align: 'center' as const },
  { title: '扣费原因', key: 'remark', minWidth: 160 },
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
}
.detail-items-section {
  margin-top: 16px;
}
.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}
</style>
