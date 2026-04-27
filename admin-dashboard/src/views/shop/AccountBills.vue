<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">{{ pageTitle }}</h1>
      <div class="page-actions">
        <n-button type="primary" @click="showFilterDrawer = true">
          <template #icon><n-icon :component="FilterOutline" /></template>
          筛选
        </n-button>
        <n-button secondary @click="handleExport">
          <template #icon><n-icon :component="DownloadOutline" /></template>
          导出
        </n-button>
      </div>
    </div>

    <div class="table-card">
      <n-data-table
        :columns="billsColumns"
        :data="billsData"
        :bordered="false"
        :single-line="false"
        :pagination="{ pageSize: 15, showSizePicker: false }"
        size="small"
        striped
      />
    </div>

    <!-- 筛选抽屉 -->
    <n-drawer v-model:show="showFilterDrawer" width="380" placement="right" :trap-focus="false">
      <n-drawer-content title="筛选" closable>
        <n-form ref="filterFormRef" label-placement="left" :label-width="70" size="medium">
          <n-form-item label="门店">
            <n-select
              v-model:value="filterStore"
              placeholder="请选择"
              :options="storeOptions"
              clearable
            />
          </n-form-item>
          <n-form-item label="日期范围">
            <n-date-picker
              v-model:value="filterDate"
              type="daterange"
              clearable
              style="width: 100%;"
            />
          </n-form-item>
          <n-form-item label="账单类型">
            <n-select
              v-model:value="filterType"
              placeholder="请选择"
              :options="billTypeOptions"
              clearable
            />
          </n-form-item>
          <n-form-item label="设备">
            <n-select
              v-model:value="filterDevice"
              placeholder="请选择"
              :options="deviceOptions"
              clearable
            />
          </n-form-item>
          <n-form-item label="游戏">
            <n-input
              v-model:value="filterGame"
              placeholder="请输入游戏名"
              clearable
            />
          </n-form-item>
        </n-form>

        <template #footer>
          <div class="drawer-footer">
            <n-button @click="resetFilter">重置</n-button>
            <n-button type="primary" @click="handleFilter">搜索</n-button>
          </div>
        </template>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useRoute } from 'vue-router'
import { NButton, NIcon, NSelect, NDatePicker, NInput, NDataTable, NDrawer, NDrawerContent, NForm, NFormItem } from 'naive-ui'
import { FilterOutline, DownloadOutline } from '@vicons/ionicons5'

const route = useRoute()

// 筛选抽屉显示
const showFilterDrawer = ref(false)

// 筛选表单引用
const filterFormRef = ref<any>(null)

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
  { title: '门店', key: 'store', minWidth: 130 },
  { title: '账单类型', key: 'type', width: 110 },
  { title: '设备', key: 'device', width: 90 },
  { title: '影片', key: 'film', width: 120 },
  {
    title: '人数',
    key: 'people',
    width: 70,
    render: (row: any) => {
      const noShow = ['转入', '转出', '平台赠送']
      return noShow.includes(row.type) ? h('span', {}, '') : h('span', {}, row.people || '')
    }
  },
  { title: '变动前', key: 'before', width: 90 },
  {
    title: '游戏豆',
    key: 'amount',
    width: 100,
    render: (row: any) => h('span', {
      style: { color: row.amount >= 0 ? '#10B981' : '#EF4444', fontWeight: 500 }
    }, (row.amount >= 0 ? '+' : '') + row.amount)
  },
  { title: '变动后', key: 'after', width: 90 },
  { title: '时间', key: 'time', minWidth: 160 },
]

function handleFilter() {
  console.log('筛选条件', {
    store: filterStore.value,
    date: filterDate.value,
    type: filterType.value,
    device: filterDevice.value,
    game: filterGame.value
  })
  showFilterDrawer.value = false
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

.table-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid var(--border-color);
}

.drawer-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
</style>
