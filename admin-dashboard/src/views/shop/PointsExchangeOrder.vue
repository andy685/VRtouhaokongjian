<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>积分兑换订单</h1>
      <n-space>
        <n-button type="primary" size="small" @click="showFilter = true">
          <template #icon>
            <n-icon :component="FilterOutline" />
          </template>
          筛选
        </n-button>
        <n-button type="primary" size="small" @click="exportData">
          <template #icon>
            <n-icon :component="DownloadOutline" />
          </template>
          导出
        </n-button>
      </n-space>
    </div>

    <n-data-table
      :columns="columns"
      :data="filteredData"
      :pagination="pagination"
      :bordered="true"
      :single-line="false"
      size="small"
    />

    <!-- 筛选弹窗 -->
    <n-modal v-model:show="showFilter" preset="card" title="筛选条件" style="width: 420px;" :bordered="false">
      <n-form label-placement="left" label-width="80">
        <n-form-item label="店铺">
          <n-select v-model:value="filterShop" :options="shopOptions" placeholder="选择店铺" clearable />
        </n-form-item>
        <n-form-item label="会员手机">
          <n-input v-model:value="filterPhone" placeholder="输入会员手机号..." />
        </n-form-item>
        <n-form-item label="兑换类型">
          <n-select v-model:value="filterExchangeType" :options="exchangeTypeFilterOptions" placeholder="选择兑换类型" clearable />
        </n-form-item>
        <n-form-item label="状态">
          <n-select v-model:value="filterStatus" :options="statusFilterOptions" placeholder="选择状态" clearable />
        </n-form-item>
        <n-form-item label="兑换商品">
          <n-input v-model:value="filterProduct" placeholder="输入兑换商品名称..." />
        </n-form-item>
        <n-form-item label="日期范围">
          <n-date-picker type="daterange" clearable v-model:value="dateRange" style="width: 100%;" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="resetFilter">重置</n-button>
          <n-button type="primary" @click="showFilter = false">确定</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 详情弹窗 -->
    <n-modal v-model:show="showDetailModal" preset="card" title="订单详情" style="width: 560px;" :bordered="false">
      <n-descriptions v-if="detailData" :column="2" bordered label-placement="left" size="small">
        <n-descriptions-item label="订单号">{{ detailData.orderNo }}</n-descriptions-item>
        <n-descriptions-item label="所属店铺">{{ detailData.shop }}</n-descriptions-item>
        <n-descriptions-item label="会员">{{ detailData.member }}</n-descriptions-item>
        <n-descriptions-item label="兑换类型">
          <n-tag :color="{ color: exchangeTypeMap[detailData.exchangeType]?.color || '#999', textColor: '#fff' }" size="small">{{ exchangeTypeMap[detailData.exchangeType]?.label || detailData.exchangeType }}</n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="兑换前积分">{{ detailData.pointsBefore }}</n-descriptions-item>
        <n-descriptions-item label="兑换后积分">{{ detailData.pointsAfter }}</n-descriptions-item>
        <n-descriptions-item label="状态">
          <n-tag :type="statusMap[detailData.status]?.type || 'default'" size="small">{{ statusMap[detailData.status]?.label || detailData.status }}</n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="创建时间">{{ detailData.createTime }}</n-descriptions-item>
      </n-descriptions>
      <div v-if="detailData" class="detail-items-section">
        <h3 class="section-title">兑换明细</h3>
        <n-data-table :columns="itemColumns" :data="[{ product: detailData.product, exchangeType: exchangeTypeMap[detailData.exchangeType]?.label || detailData.exchangeType, pointsUsed: detailData.pointsUsed }]" :bordered="true" :single-line="false" size="small" />
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
import { ref, computed, h } from 'vue'
import { NDataTable, NButton, NIcon, NModal, NForm, NFormItem, NSelect, NDatePicker, NSpace, NTag, NDescriptions, NDescriptionsItem } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { FilterOutline, DownloadOutline } from '@vicons/ionicons5'

const showFilter = ref(false)
const showDetailModal = ref(false)
const detailData = ref<any>(null)
const filterShop = ref<string | null>(null)
const filterPhone = ref('')
const filterExchangeType = ref<string | null>(null)
const filterStatus = ref<string | null>(null)
const filterProduct = ref('')
const dateRange = ref<[number, number] | null>(null)

function openDetail(row: any) {
  detailData.value = row
  showDetailModal.value = true
}

const shopOptions = [
  { label: '利民街小展厅', value: '利民街小展厅' },
]

const exchangeTypeFilterOptions = [
  { label: '商品兑换', value: 'product' },
  { label: '单次消费兑换', value: 'singleConsumption' },
  { label: '套票兑换', value: 'package' },
]

const statusFilterOptions = [
  { label: '兑换成功', value: 'success' },
  { label: '兑换失败', value: 'failed' },
  { label: '处理中', value: 'pending' },
]

const pagination = { pageSize: 15 }

const statusMap: Record<string, { type: 'success' | 'warning' | 'error' | 'default', label: string }> = {
  success: { type: 'success', label: '兑换成功' },
  failed: { type: 'error', label: '兑换失败' },
  pending: { type: 'warning', label: '处理中' },
}

const exchangeTypeMap: Record<string, { label: string; color: string }> = {
  product: { label: '商品兑换', color: '#1890ff' },
  singleConsumption: { label: '单次消费兑换', color: '#52c41a' },
  package: { label: '套票兑换', color: '#faad14' },
}

const itemColumns: DataTableColumns = [
  { title: '兑换商品', key: 'product', minWidth: 160, align: 'center' },
  { title: '兑换类型', key: 'exchangeType', width: 120, align: 'center' },
  { title: '消耗积分', key: 'pointsUsed', width: 100, align: 'center' },
]

const columns: DataTableColumns = [
  { title: '订单号', key: 'orderNo', width: 160, align: 'center' },
  { title: '所属店铺', key: 'shop', width: 120, align: 'center' },
  { title: '会员', key: 'member', width: 130, align: 'center' },
  {
    title: '兑换类型',
    key: 'exchangeType',
    width: 100,
    align: 'center',
    render(row: any) {
      const cfg = exchangeTypeMap[row.exchangeType]
      return h(NTag, { color: { color: cfg?.color || '#999', textColor: '#fff' }, size: 'small' }, { default: () => cfg?.label || row.exchangeType })
    },
  },
  { title: '兑换商品', key: 'product', width: 160, align: 'center' },
  { title: '消耗积分', key: 'pointsUsed', width: 100, align: 'center' },
  { title: '兑换前积分', key: 'pointsBefore', width: 100, align: 'center' },
  { title: '兑换后积分', key: 'pointsAfter', width: 100, align: 'center' },
  { title: '创建时间', key: 'createTime', width: 160, align: 'center' },
  {
    title: '状态',
    key: 'status',
    width: 100,
    align: 'center',
    render(row: any) {
      const s = statusMap[row.status] || { type: 'default', label: row.status }
      return h(NTag, { type: s.type, size: 'small' }, { default: () => s.label })
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    align: 'center',
    render(row: any) {
      return h(NButton, { size: 'small', type: 'primary', text: true, onClick: () => openDetail(row) }, { default: () => '详情' })
    },
  },
]

const rawData = ref([
  { orderNo: 'EX202307250001', shop: '利民街小展厅', member: '138****1234', exchangeType: 'singleConsumption', product: 'VR游戏单次体验', pointsUsed: 500, pointsBefore: 1200, pointsAfter: 700, createTime: '2023-07-25 14:32', status: 'success' },
  { orderNo: 'EX202307250002', shop: '利民街小展厅', member: '139****5678', exchangeType: 'product', product: '精美周边钥匙扣', pointsUsed: 300, pointsBefore: 800, pointsAfter: 500, createTime: '2023-07-25 13:15', status: 'success' },
  { orderNo: 'EX202307250003', shop: '利民街小展厅', member: '137****9012', exchangeType: 'package', product: '双人体验套票', pointsUsed: 1000, pointsBefore: 2500, pointsAfter: 1500, createTime: '2023-07-25 11:48', status: 'pending' },
  { orderNo: 'EX202307250004', shop: '利民街小展厅', member: '136****3456', exchangeType: 'singleConsumption', product: 'VR赛车单次体验', pointsUsed: 500, pointsBefore: 600, pointsAfter: 100, createTime: '2023-07-25 10:22', status: 'success' },
  { orderNo: 'EX202307250005', shop: '利民街小展厅', member: '138****1234', exchangeType: 'product', product: '限量手办模型', pointsUsed: 2000, pointsBefore: 2700, pointsAfter: 700, createTime: '2023-07-25 09:55', status: 'failed' },
  { orderNo: 'EX202307250006', shop: '利民街小展厅', member: '135****7890', exchangeType: 'package', product: '家庭欢乐套票', pointsUsed: 200, pointsBefore: 450, pointsAfter: 250, createTime: '2023-07-25 08:30', status: 'success' },
])

const filteredData = computed(() => {
  let data = rawData.value
  if (filterShop.value) data = data.filter(d => d.shop === filterShop.value)
  if (filterPhone.value) data = data.filter(d => d.member.includes(filterPhone.value))
  if (filterExchangeType.value) data = data.filter(d => d.exchangeType === filterExchangeType.value)
  if (filterStatus.value) data = data.filter(d => d.status === filterStatus.value)
  if (filterProduct.value) data = data.filter(d => d.product.includes(filterProduct.value))
  return data
})

function resetFilter() {
  filterShop.value = null
  filterPhone.value = ''
  filterExchangeType.value = null
  filterStatus.value = null
  filterProduct.value = ''
  dateRange.value = null
}

function exportData() {
  console.log('导出积分兑换订单')
}
</script>

<style scoped>
.page-container {
  padding: 24px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.page-header h1 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
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
