<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>点播游戏记录</h1>
      <n-button type="primary" size="small" @click="showFilter = true">
        <template #icon>
          <n-icon :component="FilterOutline" />
        </template>
        筛选
      </n-button>
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
        <n-form-item label="游戏">
          <n-input v-model:value="filterGame" placeholder="搜索游戏名称..." />
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
import { FilterOutline } from '@vicons/ionicons5'

const showFilter = ref(false)
const filterShop = ref<string | null>(null)
const filterDevice = ref('')
const filterGame = ref('')
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
  { title: '店铺', key: 'shop', width: 140, align: 'center' },
  { title: '设备', key: 'device', width: 160, align: 'center' },
  { title: '游戏', key: 'game', minWidth: 200 },
  { title: '人数', key: 'people', width: 80, align: 'center' },
  { title: '时长(s)', key: 'duration', width: 100, align: 'center' },
  { title: '点播时间', key: 'time', width: 160, align: 'center' },
]

const rawData = ref([
  { shop: '利民街小展厅', device: '幻影飞碟', game: '急速森林(飞碟)', people: 5, duration: 24, time: '2023-07-25 12:54' },
  { shop: '利民街小展厅', device: '幻影飞碟', game: '急速森林(飞碟)', people: 1, duration: 11, time: '2023-07-25 12:54' },
  { shop: '利民街小展厅', device: '幻影飞碟', game: '急速森林(飞碟)', people: 1, duration: 7, time: '2023-07-25 12:53' },
  { shop: '利民街小展厅', device: '幻影飞碟', game: '急速森林(飞碟)', people: 1, duration: 9, time: '2023-07-25 12:51' },
  { shop: '利民街小展厅', device: '幻影飞碟', game: '急速森林(飞碟)', people: 1, duration: 23, time: '2023-07-25 12:50' },
  { shop: '利民街小展厅', device: '幻影飞碟', game: '恐怖森林(飞碟)', people: 1, duration: 321, time: '2023-07-25 11:54' },
  { shop: '利民街小展厅', device: '幻影飞碟', game: '恐怖森林(飞碟)', people: 5, duration: 501, time: '2023-07-25 11:39' },
  { shop: '利民街小展厅', device: '幻影飞碟', game: '勇闯恐龙谷(飞碟)', people: 5, duration: 396, time: '2023-07-25 11:23' },
  { shop: '利民街小展厅', device: '幻影飞碟', game: '阿拉丁历险记4K高清版(飞碟)', people: 5, duration: 271, time: '2023-07-25 11:17' },
  { shop: '利民街小展厅', device: '暗黑机甲22版', game: '破甲风暴', people: 1, duration: 277, time: '2023-07-25 11:30' },
  { shop: '利民街小展厅', device: '暗黑战场[主控端]', game: '节奏光剑', people: 1, duration: 604, time: '2023-07-25 10:47' },
  { shop: '利民街小展厅', device: '暗黑战场[主控端]', game: '节奏光剑', people: 1, duration: 502, time: '2023-07-25 10:38' },
  { shop: '利民街小展厅', device: '幻影飞碟', game: '荒岛逃生(飞碟)', people: 5, duration: 318, time: '2023-07-25 10:57' },
  { shop: '利民街小展厅', device: '悬浮骑兵', game: '荒野飞车', people: 1, duration: 241, time: '2023-07-25 10:33' },
  { shop: '利民街小展厅', device: '悬浮骑兵', game: '极速狂飙', people: 1, duration: 181, time: '2023-07-25 10:30' },
])

const filteredData = computed(() => {
  let data = rawData.value
  if (filterShop.value) data = data.filter(d => d.shop === filterShop.value)
  if (filterDevice.value) data = data.filter(d => d.device.includes(filterDevice.value))
  if (filterGame.value) data = data.filter(d => d.game.includes(filterGame.value))
  return data
})

function resetFilter() {
  filterShop.value = null
  filterDevice.value = ''
  filterGame.value = ''
  dateRange.value = null
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
