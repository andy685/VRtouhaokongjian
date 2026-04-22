<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>点播设备汇总</h1>
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
      :data="tableData"
      :pagination="false"
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
import { NDataTable, NButton, NIcon, NModal, NForm, NFormItem, NSelect, NInput, NDatePicker, NSpace } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { FilterOutline, DownloadOutline } from '@vicons/ionicons5'

const showFilter = ref(false)
const filterShop = ref<string | null>(null)
const filterDevice = ref('')
const dateRange = ref<[number, number] | null>(null)

const shopOptions = [
  { label: '利民街小展厅', value: '利民街小展厅' },
]

const rawData = ref([
  { shop: '利民街小展厅', device: '悬浮骑兵', plays: 4, people: 4, playPercent: 14.81, peoplePercent: 7.84 },
  { shop: '利民街小展厅', device: '悬浮骑兵', plays: 2, people: 2, playPercent: 7.41, peoplePercent: 3.92 },
  { shop: '利民街小展厅', device: '悬浮骑兵', plays: 1, people: 1, playPercent: 3.70, peoplePercent: 1.96 },
  { shop: '利民街小展厅', device: '暗黑机甲22版', plays: 1, people: 1, playPercent: 3.70, peoplePercent: 1.96 },
  { shop: '利民街小展厅', device: '暗黑行者', plays: 2, people: 2, playPercent: 7.41, peoplePercent: 3.92 },
  { shop: '利民街小展厅', device: '暗黑行者', plays: 1, people: 1, playPercent: 3.70, peoplePercent: 1.96 },
  { shop: '利民街小展厅', device: '幻影飞碟', plays: 11, people: 35, playPercent: 40.74, peoplePercent: 68.63 },
  { shop: '利民街小展厅', device: '悬浮骑兵', plays: 2, people: 2, playPercent: 7.41, peoplePercent: 3.92 },
  { shop: '利民街小展厅', device: '暗黑战场[主控端]', plays: 3, people: 3, playPercent: 11.11, peoplePercent: 5.88 },
])

const totalPlays = computed(() => rawData.value.reduce((sum, d) => sum + d.plays, 0))
const totalPeople = computed(() => rawData.value.reduce((sum, d) => sum + d.people, 0))

const tableData = computed(() => {
  let list = filterShop.value ? rawData.value.filter(d => d.shop === filterShop.value) : [...rawData.value]
  if (filterDevice.value) list = list.filter(d => d.device.includes(filterDevice.value))
  list.push({
    shop: '合计',
    device: '',
    plays: totalPlays.value,
    people: totalPeople.value,
    playPercent: list.reduce((sum, d) => sum + d.playPercent, 0),
    peoplePercent: list.reduce((sum, d) => sum + d.peoplePercent, 0),
  } as any)
  return list
})

const columns: DataTableColumns = [
  { title: '店铺', key: 'shop', width: 130, align: 'center' },
  { title: '设备', key: 'device', width: 150, align: 'center' },
  { title: '点播次数', key: 'plays', width: 100, align: 'center' },
  { title: '游戏人数', key: 'people', width: 100, align: 'center' },
  { title: '点播次数占比(%)', key: 'playPercent', width: 140, align: 'center', render: (row: any) => row.playPercent.toFixed(2) },
  { title: '游戏人数占比(%)', key: 'peoplePercent', width: 140, align: 'center', render: (row: any) => row.peoplePercent.toFixed(2) },
]

function resetFilter() {
  filterShop.value = null
  filterDevice.value = ''
  dateRange.value = null
}

function exportData() {
  console.log('导出点播设备汇总')
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
