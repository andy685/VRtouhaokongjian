<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>点播消费记录</h1>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NDataTable, NButton, NIcon, NModal, NForm, NFormItem, NSelect, NDatePicker, NSpace } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { FilterOutline, DownloadOutline } from '@vicons/ionicons5'

const showFilter = ref(false)
const filterShop = ref<string | null>(null)
const filterDevice = ref('')
const dateRange = ref<[number, number] | null>(null)

const shopOptions = [
  { label: '利民街小展厅', value: '利民街小展厅' },
]

const deviceOptions = [
  { label: '幻影飞碟', value: '幻影飞碟' },
  { label: '暗黑机甲22版', value: '暗黑机甲22版' },
  { label: '暗黑战场[主控端]', value: '暗黑战场[主控端]' },
  { label: '悬浮骑兵', value: '悬浮骑兵' },
]

const pagination = { pageSize: 15 }

const columns: DataTableColumns = [
  { title: '店铺', key: 'shop', width: 130, align: 'center' },
  { title: '设备', key: 'device', width: 150, align: 'center' },
  { title: '人数', key: 'people', width: 70, align: 'center' },
  { title: '消费时间', key: 'time', width: 160, align: 'center' },
  { title: '消费方式', key: 'payType', width: 110, align: 'center' },
  { title: '会员/散客', key: 'member', width: 120, align: 'center' },
  { title: '预存款金额', key: 'prepaidAmount', width: 110, align: 'center', render: (row: any) => row.prepaidAmount ? `¥${row.prepaidAmount.toFixed(2)}` : '-' },
  { title: '套票次数', key: 'packageTimes', width: 90, align: 'center', render: (row: any) => row.packageTimes ?? '-' },
  { title: '预存次数', key: 'prepaidTimes', width: 90, align: 'center', render: (row: any) => row.prepaidTimes ?? '-' },
  { title: '直接支付金额', key: 'directAmount', width: 120, align: 'center', render: (row: any) => row.directAmount ? `¥${row.directAmount.toFixed(2)}` : '-' },
]

const rawData = ref([
  { shop: '利民街小展厅', device: '幻影飞碟', people: 2, time: '2023-07-25 12:54', payType: '直接支付', member: '散客', prepaidAmount: null, packageTimes: null, prepaidTimes: null, directAmount: 48.00 },
  { shop: '利民街小展厅', device: '幻影飞碟', people: 1, time: '2023-07-25 12:50', payType: '会员消费', member: '138****1234', prepaidAmount: 38.00, packageTimes: null, prepaidTimes: null, directAmount: null },
  { shop: '利民街小展厅', device: '幻影飞碟', people: 3, time: '2023-07-25 12:45', payType: '套票抵扣', member: '139****5678', prepaidAmount: null, packageTimes: 1, prepaidTimes: null, directAmount: null },
  { shop: '利民街小展厅', device: '暗黑机甲22版', people: 1, time: '2023-07-25 11:30', payType: '直接支付', member: '散客', prepaidAmount: null, packageTimes: null, prepaidTimes: null, directAmount: 58.00 },
  { shop: '利民街小展厅', device: '暗黑战场[主控端]', people: 1, time: '2023-07-25 10:47', payType: '预存次数', member: '137****9012', prepaidAmount: null, packageTimes: null, prepaidTimes: 1, directAmount: null },
  { shop: '利民街小展厅', device: '暗黑战场[主控端]', people: 2, time: '2023-07-25 10:38', payType: '直接支付', member: '散客', prepaidAmount: null, packageTimes: null, prepaidTimes: null, directAmount: 96.00 },
  { shop: '利民街小展厅', device: '悬浮骑兵', people: 1, time: '2023-07-25 10:33', payType: '会员消费', member: '136****3456', prepaidAmount: 28.00, packageTimes: null, prepaidTimes: null, directAmount: null },
  { shop: '利民街小展厅', device: '悬浮骑兵', people: 1, time: '2023-07-25 10:30', payType: '套票抵扣', member: '138****1234', prepaidAmount: null, packageTimes: 1, prepaidTimes: null, directAmount: null },
  { shop: '利民街小展厅', device: '幻影飞碟', people: 5, time: '2023-07-25 11:39', payType: '直接支付', member: '散客', prepaidAmount: null, packageTimes: null, prepaidTimes: null, directAmount: 190.00 },
  { shop: '利民街小展厅', device: '幻影飞碟', people: 1, time: '2023-07-25 11:23', payType: '预存次数', member: '139****5678', prepaidAmount: null, packageTimes: null, prepaidTimes: 1, directAmount: null },
  { shop: '利民街小展厅', device: '幻影飞碟', people: 2, time: '2023-07-25 11:17', payType: '会员消费', member: '137****9012', prepaidAmount: 76.00, packageTimes: null, prepaidTimes: null, directAmount: null },
  { shop: '利民街小展厅', device: '暗黑机甲22版', people: 1, time: '2023-07-25 11:05', payType: '直接支付', member: '散客', prepaidAmount: null, packageTimes: null, prepaidTimes: null, directAmount: 58.00 },
])

const filteredData = computed(() => {
  let data = rawData.value
  if (filterShop.value) data = data.filter(d => d.shop === filterShop.value)
  if (filterDevice.value) data = data.filter(d => d.device.includes(filterDevice.value))
  return data
})

function resetFilter() {
  filterShop.value = null
  filterDevice.value = ''
  dateRange.value = null
}

function exportData() {
  console.log('导出点播消费记录')
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
