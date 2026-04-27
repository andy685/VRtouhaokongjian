<template>
  <div class="page-container">
    <n-breadcrumb class="page-breadcrumb">
      <n-breadcrumb-item>主页</n-breadcrumb-item>
      <n-breadcrumb-item>用户设置</n-breadcrumb-item>
      <n-breadcrumb-item>账户账单</n-breadcrumb-item>
    </n-breadcrumb>

    <div class="page-header">
      <h1 class="page-title">{{ pageTitle }}</h1>
      <div class="page-actions">
        <n-popover placement="bottom" trigger="click">
          <template #trigger>
            <n-button type="primary" ghost>
              <template #icon><n-icon :component="FilterOutline" /></template>
              筛选
            </n-button>
          </template>
          <div class="filter-form">
            <div class="filter-row">
              <div class="filter-item">
                <label>门店：</label>
                <n-select
                  v-model:value="filterStore"
                  :options="storeOptions"
                  placeholder="请选择"
                  clearable
                  style="width: 150px;"
                />
              </div>
              <div class="filter-item">
                <label>日期：</label>
                <n-date-picker
                  v-model:value="filterDate"
                  type="daterange"
                  clearable
                  style="width: 240px;"
                />
              </div>
            </div>
            <div class="filter-row">
              <div class="filter-item">
                <label>账单类型：</label>
                <n-select
                  v-model:value="filterType"
                  :options="billTypeOptions"
                  placeholder="请选择"
                  clearable
                  style="width: 150px;"
                />
              </div>
              <div class="filter-item">
                <label>设备：</label>
                <n-select
                  v-model:value="filterDevice"
                  :options="deviceOptions"
                  placeholder="请选择"
                  clearable
                  style="width: 150px;"
                />
              </div>
            </div>
            <div class="filter-row">
              <div class="filter-item">
                <label>游戏：</label>
                <n-input
                  v-model:value="filterGame"
                  placeholder="请输入游戏名"
                  style="width: 150px;"
                />
              </div>
            </div>
            <div class="filter-buttons">
              <n-button @click="resetFilter">重置</n-button>
              <n-button type="primary" @click="handleFilter">搜索</n-button>
            </div>
          </div>
        </n-popover>
        <n-button type="primary" @click="handleExport">
          <template #icon><n-icon :component="DownloadOutline" /></template>
          导出
        </n-button>
      </div>
    </div>

    <div class="table-card">
      <n-data-table
        :columns="billsColumns"
        :data="billsData"
        :bordered="true"
        :single-line="true"
        :pagination="{ pageSize: 10 }"
        size="small"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useRoute } from 'vue-router'
import { NBreadcrumb, NBreadcrumbItem, NButton, NIcon, NPopover, NSelect, NDatePicker, NInput, NDataTable, NTag } from 'naive-ui'
import { FilterOutline, DownloadOutline } from '@vicons/ionicons5'

const route = useRoute()

// 页面标题
const pageTitle = computed(() => {
  const type = route.query.type
  if (type === 'game-bean') return '游戏豆明细'
  if (type === 'operating') return '运营账户明细'
  if (type === 'basic') return '基础账户明细'
  return '账户明细'
})

// 筛选条件
const filterStore = ref('')
const filterDate = ref(null)
const filterType = ref('')
const filterDevice = ref('')
const filterGame = ref('')

// 门店选项
const storeOptions = [
  { value: '6288', label: '党建馆' },
  { value: '5764', label: '华东展厅' },
  { value: '5760', label: '恒然分部展厅' },
  { value: '5759', label: '利民街大展厅' },
  { value: '5077', label: '利民街小展厅' },
  { value: '8088', label: '幻影星空馆 NO.8088' },
]

// 账单类型选项
const billTypeOptions = [
  { value: '转入', label: '转入' },
  { value: '转出', label: '转出' },
  { value: '平台赠送', label: '平台赠送' },
  { value: '游戏消耗', label: '游戏消耗' },
  { value: '商户充值', label: '商户充值' },
  { value: '系统调整', label: '系统调整' },
  { value: '活动奖励', label: '活动奖励' },
]

// 设备选项
const deviceOptions = [
  { value: '设备1', label: '设备1' },
  { value: '设备2', label: '设备2' },
  { value: '设备3', label: '设备3' },
]

// 账单数据
const billsData = [
  // 新增的转入转出记录
  { id: 1, store: '利民街大展厅', type: '转入', device: '', film: '', people: 0, before: 0, amount: 100, after: 100, time: '2023-09-16 15:23:54' },
  { id: 2, store: '利民街小展厅', type: '转出', device: '', film: '', people: 200, before: 200, amount: -100, after: 100, time: '2023-09-16 15:23:54' },
  { id: 3, store: '利民街小展厅', type: '转入', device: '', film: '', people: 0, before: 0, amount: 200, after: 200, time: '2023-09-16 15:23:36' },
  { id: 4, store: '---', type: '转出', device: '', film: '', people: 1028, before: 1028, amount: -200, after: 828, time: '2023-09-16 15:23:36' },
  { id: 5, store: '---', type: '转入', device: '', film: '', people: 1022, before: 1022, amount: 6, after: 1028, time: '2023-09-16 15:09:17' },
  { id: 6, store: '利民街小展厅', type: '转出', device: '', film: '', people: 6, before: 6, amount: -6, after: 0, time: '2023-09-16 15:09:17' },
  { id: 7, store: '---', type: '转入', device: '', film: '', people: 1020, before: 1020, amount: 2, after: 1022, time: '2023-09-16 15:09:08' },
  { id: 8, store: '利民街大展厅', type: '转出', device: '', film: '', people: 2, before: 2, amount: -2, after: 0, time: '2023-09-16 15:09:08' },
  { id: 9, store: '---', type: '平台赠送', device: '', film: '', people: 20, before: 20, amount: 1000, after: 1020, time: '2023-09-16 14:54:28' },
  { id: 10, store: '利民街小展厅', type: '转入', device: '', film: '', people: 0, before: 0, amount: 6, after: 6, time: '2023-09-16 10:17:44' },
  { id: 11, store: '---', type: '转出', device: '', film: '', people: 26, before: 26, amount: -6, after: 20, time: '2023-09-16 10:17:44' },
  { id: 12, store: '利民街大展厅', type: '转入', device: '', film: '', people: 0, before: 0, amount: 2, after: 2, time: '2023-09-16 10:17:33' },
  { id: 13, store: '---', type: '转出', device: '', film: '', people: 28, before: 28, amount: -2, after: 26, time: '2023-09-16 10:17:33' },
  { id: 14, store: '---', type: '转入', device: '', film: '', people: 0, before: 0, amount: 28, after: 28, time: '2023-09-16 10:16:48' },
  { id: 15, store: '利民街小展厅', type: '转出', device: '', film: '', people: 28, before: 28, amount: -28, after: 0, time: '2023-09-16 10:16:48' },
  // 原有记录
  { id: 16, store: '利民街大展厅', type: '商户充值', device: '', film: '', people: 0, before: 0, amount: 500, after: 500, time: '2023-09-16 16:30:22' },
  { id: 17, store: '党建馆', type: '游戏消耗', device: '设备1', film: '过山车VR', people: 2, before: 100, amount: -20, after: 80, time: '2023-09-16 16:25:15' },
  { id: 18, store: '华东展厅', type: '游戏消耗', device: '设备2', film: '恐怖医院', people: 1, before: 50, amount: -15, after: 35, time: '2023-09-16 16:20:45' },
  { id: 19, store: '恒然分部展厅', type: '活动奖励', device: '', film: '', people: 0, before: 200, amount: 50, after: 250, time: '2023-09-16 15:50:12' },
  { id: 20, store: '利民街小展厅', type: '商户充值', device: '', film: '', people: 0, before: 100, amount: 300, after: 400, time: '2023-09-16 15:45:30' },
  { id: 21, store: '利民街大展厅', type: '游戏消耗', device: '设备3', film: '极速赛车', people: 3, before: 500, amount: -45, after: 455, time: '2023-09-16 15:30:20' },
  { id: 22, store: '党建馆', type: '系统调整', device: '', film: '', people: 0, before: 80, amount: 10, after: 90, time: '2023-09-16 14:45:18' },
  { id: 23, store: '华东展厅', type: '游戏消耗', device: '设备1', film: '海洋世界', people: 2, before: 35, amount: -12, after: 23, time: '2023-09-16 14:30:45' },
  { id: 24, store: '恒然分部展厅', type: '转入', device: '', film: '', people: 0, before: 250, amount: 50, after: 300, time: '2023-09-16 14:15:30' },
  { id: 25, store: '利民街小展厅', type: '转出', device: '', film: '', people: 0, before: 400, amount: -100, after: 300, time: '2023-09-16 14:00:22' },
]

// 账单列定义
const billsColumns = [
  { title: '门店', key: 'store', width: 140 },
  { title: '账单类型', key: 'type', width: 100, render: (row: any) => h(NTag, { 
    type: row.type === '转入' || row.type === '商户充值' || row.type === '平台赠送' || row.type === '活动奖励' ? 'success' : 
           row.type === '转出' || row.type === '游戏消耗' ? 'error' : 'warning', 
    size: 'small' 
  }, () => row.type) },
  { title: '设备', key: 'device', width: 100 },
  { title: '影片', key: 'film', width: 100 },
  { title: '人数', key: 'people', width: 80 },
  { title: '变动前', key: 'before', width: 90 },
  { title: '变动金额', key: 'amount', width: 100, render: (row: any) => h('span', { style: { color: row.amount >= 0 ? '#10B981' : '#EF4444' } }, () => (row.amount >= 0 ? '+' : '') + row.amount) },
  { title: '变动后', key: 'after', width: 90 },
  { title: '时间', key: 'time', width: 170 },
]

function handleFilter() {
  console.log('筛选条件', {
    store: filterStore.value,
    date: filterDate.value,
    type: filterType.value,
    device: filterDevice.value,
    game: filterGame.value
  })
}

function resetFilter() {
  filterStore.value = ''
  filterDate.value = null
  filterType.value = ''
  filterDevice.value = ''
  filterGame.value = ''
}

function handleExport() {
  console.log('导出账单')
}
</script>

<style scoped>
.page-container {
  padding: 20px 24px;
}

.page-breadcrumb {
  margin-bottom: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.page-actions {
  display: flex;
  gap: 12px;
}

.filter-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  min-width: 500px;
}

.filter-row {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-item label {
  font-size: 14px;
  color: var(--text-secondary);
  white-space: nowrap;
}

.filter-buttons {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.table-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid var(--border-color);
}
</style>
