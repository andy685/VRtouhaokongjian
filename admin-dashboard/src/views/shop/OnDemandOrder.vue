<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>点播系统订单</h1>
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
        <n-form-item label="设备">
          <n-input v-model:value="filterDevice" placeholder="输入设备名称..." />
        </n-form-item>
        <n-form-item label="游戏/影片">
          <n-input v-model:value="filterGameFilm" placeholder="输入游戏或影片名称..." />
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
    <n-modal v-model:show="showDetail" preset="card" title="订单详情" style="width: 520px;" :bordered="false">
      <n-descriptions v-if="currentOrder" :columns="2" bordered size="small">
        <n-descriptions-item label="订单号">{{ currentOrder.orderNo }}</n-descriptions-item>
        <n-descriptions-item label="设备">{{ currentOrder.device }}</n-descriptions-item>
        <n-descriptions-item label="游戏/影片">{{ currentOrder.gameFilm }}</n-descriptions-item>
        <n-descriptions-item label="类型">{{ currentOrder.type }}</n-descriptions-item>
        <n-descriptions-item label="时长">{{ currentOrder.duration }}</n-descriptions-item>
        <n-descriptions-item label="金额">¥{{ currentOrder.amount.toFixed(2) }}</n-descriptions-item>
        <n-descriptions-item label="会员">{{ currentOrder.member }}</n-descriptions-item>
        <n-descriptions-item label="创建时间">{{ currentOrder.createTime }}</n-descriptions-item>
        <n-descriptions-item label="状态">
          <n-tag :type="statusType(currentOrder.status)" size="small">{{ currentOrder.status }}</n-tag>
        </n-descriptions-item>
      </n-descriptions>
      <div v-if="currentOrder" style="margin-top: 16px;">
        <h3 style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">点播明细</h3>
        <n-data-table :columns="detailColumns" :data="currentOrder.details" :bordered="true" :single-line="false" size="small" />
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NDataTable, NButton, NIcon, NModal, NForm, NFormItem,
  NSelect, NDatePicker, NSpace, NTag, NDescriptions, NDescriptionsItem
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { FilterOutline, DownloadOutline } from '@vicons/ionicons5'

const showFilter = ref(false)
const showDetail = ref(false)
const currentOrder = ref<any>(null)

const filterShop = ref<string | null>(null)
const filterDevice = ref('')
const filterGameFilm = ref('')
const dateRange = ref<[number, number] | null>(null)

const shopOptions = [
  { label: '利民街小展厅', value: '利民街小展厅' },
]

const pagination = { pageSize: 15 }

function statusType(status: string) {
  switch (status) {
    case '已完成': return 'success'
    case '进行中': return 'warning'
    case '已取消': return 'error'
    default: return 'default'
  }
}

const columns: DataTableColumns = [
  { title: '订单号', key: 'orderNo', width: 160, align: 'center' },
  { title: '所属店铺', key: 'shop', width: 120, align: 'center' },
  { title: '设备', key: 'device', width: 150, align: 'center' },
  { title: '游戏/影片', key: 'gameFilm', width: 150, align: 'center' },
  { title: '类型', key: 'type', width: 90, align: 'center' },
  { title: '时长', key: 'duration', width: 90, align: 'center' },
  { title: '金额', key: 'amount', width: 100, align: 'center', render: (row: any) => `¥${row.amount.toFixed(2)}` },
  { title: '会员', key: 'member', width: 130, align: 'center' },
  { title: '创建时间', key: 'createTime', width: 160, align: 'center' },
  { title: '状态', key: 'status', width: 90, align: 'center', render: (row: any) => h(NTag, { type: statusType(row.status), size: 'small' }, { default: () => row.status }) },
  { title: '操作', key: 'action', width: 90, align: 'center', render: (row: any) => h(NButton, { type: 'primary', size: 'tiny', onClick: () => openDetail(row) }, { default: () => '详情' }) },
]

const detailColumns: DataTableColumns = [
  { title: '项目', key: 'item', align: 'center' },
  { title: '内容', key: 'content', align: 'center' },
]

const rawData = ref([
  {
    orderNo: 'OD202307250001', shop: '利民街小展厅', device: '幻影飞碟', gameFilm: '星际穿越', type: 'VR', duration: '15分钟', amount: 48.00, member: '散客', createTime: '2023-07-25 12:54', status: '已完成',
    details: [
      { item: '点播内容', content: '星际穿越' },
      { item: '设备名称', content: '幻影飞碟' },
      { item: '体验人数', content: '2人' },
      { item: '支付方式', content: '直接支付' },
      { item: '支付金额', content: '¥48.00' },
    ]
  },
  {
    orderNo: 'OD202307250002', shop: '利民街小展厅', device: '暗黑机甲22版', gameFilm: '机甲风暴', type: 'VR', duration: '20分钟', amount: 58.00, member: '138****1234', createTime: '2023-07-25 11:30', status: '已完成',
    details: [
      { item: '点播内容', content: '机甲风暴' },
      { item: '设备名称', content: '暗黑机甲22版' },
      { item: '体验人数', content: '1人' },
      { item: '支付方式', content: '会员消费' },
      { item: '支付金额', content: '¥58.00' },
    ]
  },
  {
    orderNo: 'OD202307250003', shop: '利民街小展厅', device: '暗黑战场[主控端]', gameFilm: '僵尸围城', type: 'VR', duration: '10分钟', amount: 38.00, member: '139****5678', createTime: '2023-07-25 10:47', status: '进行中',
    details: [
      { item: '点播内容', content: '僵尸围城' },
      { item: '设备名称', content: '暗黑战场[主控端]' },
      { item: '体验人数', content: '1人' },
      { item: '支付方式', content: '预存次数' },
      { item: '支付金额', content: '¥38.00' },
    ]
  },
  {
    orderNo: 'OD202307250004', shop: '利民街小展厅', device: '悬浮骑兵', gameFilm: '极速飞车', type: 'VR', duration: '12分钟', amount: 28.00, member: '137****9012', createTime: '2023-07-25 10:33', status: '已完成',
    details: [
      { item: '点播内容', content: '极速飞车' },
      { item: '设备名称', content: '悬浮骑兵' },
      { item: '体验人数', content: '1人' },
      { item: '支付方式', content: '套票抵扣' },
      { item: '支付金额', content: '¥28.00' },
    ]
  },
  {
    orderNo: 'OD202307250005', shop: '利民街小展厅', device: '幻影飞碟', gameFilm: '深海探险', type: '银幕', duration: '25分钟', amount: 68.00, member: '136****3456', createTime: '2023-07-25 09:15', status: '已取消',
    details: [
      { item: '点播内容', content: '深海探险' },
      { item: '设备名称', content: '幻影飞碟' },
      { item: '体验人数', content: '3人' },
      { item: '支付方式', content: '直接支付' },
      { item: '支付金额', content: '¥68.00' },
    ]
  },
  {
    orderNo: 'OD202307250006', shop: '利民街小展厅', device: '暗黑机甲22版', gameFilm: '恐龙世界', type: 'VR', duration: '18分钟', amount: 52.00, member: '散客', createTime: '2023-07-25 08:40', status: '已完成',
    details: [
      { item: '点播内容', content: '恐龙世界' },
      { item: '设备名称', content: '暗黑机甲22版' },
      { item: '体验人数', content: '2人' },
      { item: '支付方式', content: '直接支付' },
      { item: '支付金额', content: '¥52.00' },
    ]
  },
])

const filteredData = computed(() => {
  let data = rawData.value
  if (filterShop.value) data = data.filter(d => d.shop === filterShop.value)
  if (filterDevice.value) data = data.filter(d => d.device.includes(filterDevice.value))
  if (filterGameFilm.value) data = data.filter(d => d.gameFilm.includes(filterGameFilm.value))
  return data
})

function resetFilter() {
  filterShop.value = null
  filterDevice.value = ''
  filterGameFilm.value = ''
  dateRange.value = null
}

function exportData() {
  console.log('导出点播系统订单')
}

function openDetail(row: any) {
  currentOrder.value = row
  showDetail.value = true
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
</style>
