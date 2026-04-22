<template>
  <div class="page-container animate-fade-in">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>活动赠送订单</h2>
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
      <n-tag v-if="displayShop" closable @close="clearShopFilter" size="small" type="info">
        {{ displayShopLabel }}
      </n-tag>
      <n-tag v-if="displayPhone" closable @close="clearPhoneFilter" size="small" type="info">
        手机: {{ displayPhone }}
      </n-tag>
      <n-tag v-if="displayActivity" closable @close="clearActivityFilter" size="small" type="info">
        活动: {{ displayActivity }}
      </n-tag>
    </div>

    <!-- 数据表格 -->
    <div class="section-card">
      <div class="table-wrapper">
        <n-data-table
          :columns="columns"
          :data="filteredData"
          :pagination="pagination"
          striped
          size="small"
          :scroll-x="1200"
        />
      </div>
    </div>

    <!-- 筛选抽屉 -->
    <n-drawer v-model:show="showFilterDrawer" width="360" placement="right">
      <n-drawer-content title="筛选条件" closable>
        <n-form label-placement="left" :label-width="80">
          <n-form-item label="店铺">
            <n-select v-model:value="filterShop" placeholder="请选择店铺" :options="shopOptions" clearable />
          </n-form-item>
          <n-form-item label="会员手机">
            <n-input v-model:value="filterPhone" placeholder="请输入会员手机号" clearable />
          </n-form-item>
          <n-form-item label="活动名称">
            <n-input v-model:value="filterActivity" placeholder="请输入活动名称" clearable />
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
    <n-modal v-model:show="showDetailModal" preset="card" title="订单详情" style="width: 520px;" :bordered="false">
      <n-descriptions :column="1" label-placement="left" label-style="width: 100px; font-weight: 500;">
        <n-descriptions-item label="订单号">{{ detailData?.orderNo }}</n-descriptions-item>
        <n-descriptions-item label="会员">{{ detailData?.member }}</n-descriptions-item>
        <n-descriptions-item label="活动名称">{{ detailData?.activityName }}</n-descriptions-item>
        <n-descriptions-item label="赠送类型">
          <n-tag :type="getGiftTypeTag(detailData?.giftType)" size="small">{{ detailData?.giftType }}</n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="赠送内容">{{ detailData?.giftContent }}</n-descriptions-item>
        <n-descriptions-item label="赠送价值">{{ detailData?.giftValue }}</n-descriptions-item>
        <n-descriptions-item label="创建时间">{{ detailData?.createTime }}</n-descriptions-item>
      </n-descriptions>
      <template #footer>
        <n-space justify="center">
          <n-button @click="showDetailModal = false">关闭</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NButton, NIcon, NDataTable, NDrawer, NDrawerContent,
  NForm, NFormItem, NSelect, NDatePicker, NSpace, NTag,
  NModal, NDescriptions, NDescriptionsItem, NInput,
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { FilterOutline, DownloadOutline } from '@vicons/ionicons5'

// ===== 筛选状态 =====
const showFilterDrawer = ref(false)
const filterShop = ref<string | null>(null)
const filterPhone = ref('')
const filterActivity = ref('')
const filterDateRange = ref<[number, number] | null>(null)

// 当前展示筛选（点击搜索后生效）
const displayShop = ref<string | null>(null)
const displayPhone = ref('')
const displayActivity = ref('')
const displayDateRange = ref<[number, number] | null>(null)

const shopOptions = [
  { label: '卓远萝岗区店', value: 'shop1' },
  { label: '卓远萧山区店', value: 'shop2' },
  { label: '卓远亚运城店', value: 'shop3' },
  { label: '卓远文鼎路店', value: 'shop4' },
]

const displayShopLabel = computed(() => {
  if (!displayShop.value) return ''
  return shopOptions.find(o => o.value === displayShop.value)?.label || ''
})

const hasActiveFilter = computed(() => {
  return !!displayDateRange.value || !!displayShop.value || !!displayPhone.value || !!displayActivity.value
})

const displayDateStr = computed(() => {
  if (!displayDateRange.value) return ''
  const s = new Date(displayDateRange.value[0])
  const e = new Date(displayDateRange.value[1])
  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return `${fmt(s)} ~ ${fmt(e)}`
})

function clearDateFilter() {
  displayDateRange.value = null
  filterDateRange.value = null
}
function clearShopFilter() {
  displayShop.value = null
  filterShop.value = null
}
function clearPhoneFilter() {
  displayPhone.value = ''
  filterPhone.value = ''
}
function clearActivityFilter() {
  displayActivity.value = ''
  filterActivity.value = ''
}

function handleSearch() {
  displayShop.value = filterShop.value || null
  displayPhone.value = filterPhone.value
  displayActivity.value = filterActivity.value
  if (filterDateRange.value) {
    displayDateRange.value = [...filterDateRange.value]
  } else {
    displayDateRange.value = null
  }
  showFilterDrawer.value = false
}

function handleResetFilter() {
  filterShop.value = null
  filterPhone.value = ''
  filterActivity.value = ''
  filterDateRange.value = null
}

// ===== 模拟数据 =====
interface GiftOrder {
  id: number
  orderNo: string
  member: string
  activityName: string
  giftType: string
  giftContent: string
  giftValue: string
  createTime: string
  shop: string
}

const rawData = ref<GiftOrder[]>([
  {
    id: 1, orderNo: 'GF202504230001', member: '张三 (138****1234)', activityName: '新用户注册有礼',
    giftType: '储值', giftContent: '赠送储值 50 元', giftValue: '¥50.00', createTime: '2025-04-23 10:30:00', shop: 'shop1'
  },
  {
    id: 2, orderNo: 'GF202504230002', member: '李四 (139****5678)', activityName: '五一劳动节活动',
    giftType: '次数', giftContent: '赠送 VR过山车 2 次', giftValue: '¥76.00', createTime: '2025-04-23 11:15:00', shop: 'shop2'
  },
  {
    id: 3, orderNo: 'GF202504230003', member: '王五 (137****9012)', activityName: '会员生日特权',
    giftType: '积分', giftContent: '赠送 500 积分', giftValue: '¥50.00', createTime: '2025-04-23 14:20:00', shop: 'shop1'
  },
  {
    id: 4, orderNo: 'GF202504230004', member: '赵六 (136****3456)', activityName: '周年庆大回馈',
    giftType: '优惠券', giftContent: '满100减20优惠券 1 张', giftValue: '¥20.00', createTime: '2025-04-23 16:45:00', shop: 'shop3'
  },
  {
    id: 5, orderNo: 'GF504230005', member: '孙七 (135****7890)', activityName: '邀请好友得奖励',
    giftType: '储值', giftContent: '赠送储值 30 元', giftValue: '¥30.00', createTime: '2025-04-22 09:10:00', shop: 'shop2'
  },
  {
    id: 6, orderNo: 'GF202504220006', member: '周八 (134****2468)', activityName: '周末狂欢',
    giftType: '次数', giftContent: '赠送暗黑战车 1 次', giftValue: '¥48.00', createTime: '2025-04-22 15:30:00', shop: 'shop4'
  },
])

const filteredData = computed(() => {
  let data = rawData.value
  if (displayShop.value) {
    data = data.filter(d => d.shop === displayShop.value)
  }
  if (displayPhone.value) {
    data = data.filter(d => d.member.includes(displayPhone.value))
  }
  if (displayActivity.value) {
    data = data.filter(d => d.activityName.includes(displayActivity.value))
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

const pagination = { pageSize: 10 }

// ===== 赠送类型标签颜色 =====
function getGiftTypeTag(type?: string) {
  const map: Record<string, string> = {
    '储值': 'success',
    '次数': 'warning',
    '积分': 'info',
    '优惠券': 'error',
  }
  return (type && map[type]) ? map[type] : 'default'
}

// ===== 表格列 =====
const columns: DataTableColumns<GiftOrder> = [
  { title: '订单号', key: 'orderNo', width: 160 },
  { title: '所属店铺', key: 'shop', width: 120, align: 'center', render(row: GiftOrder) { const s = shopOptions.find(o => o.value === row.shop); return s?.label || row.shop } },
  { title: '会员', key: 'member', width: 160 },
  { title: '活动名称', key: 'activityName', width: 150 },
  {
    title: '赠送类型', key: 'giftType', width: 100, align: 'center',
    render(row) {
      return h(NTag, { type: getGiftTypeTag(row.giftType) as any, size: 'small' }, { default: () => row.giftType })
    }
  },
  { title: '赠送内容', key: 'giftContent', minWidth: 180 },
  { title: '赠送价值', key: 'giftValue', width: 100, align: 'center' },
  { title: '创建时间', key: 'createTime', width: 160 },
  {
    title: '操作', key: 'actions', width: 90, align: 'center',
    render(row) {
      return h(NButton, { type: 'primary', size: 'small', onClick: () => openDetail(row) }, { default: () => '详情' })
    }
  },
]

// ===== 详情弹窗 =====
const showDetailModal = ref(false)
const detailData = ref<GiftOrder | null>(null)

function openDetail(row: GiftOrder) {
  detailData.value = row
  showDetailModal.value = true
}
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
  overflow-x: auto;
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
</style>
