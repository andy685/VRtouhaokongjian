<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>员工点播</h1>
      <n-space>
        <n-select v-model:value="filterShop" :options="shopOptions" size="small" style="width: 160px;" clearable placeholder="选择门店" />
        <n-select v-model:value="filterEmployee" :options="employeeOptions" size="small" style="width: 140px;" clearable placeholder="选择员工" />
        <n-select v-model:value="deviceType" :options="deviceOptions" size="small" style="width: 120px;" />
        <n-date-picker type="daterange" clearable size="small" v-model:value="dateRange" />
        <n-button secondary @click="exportData">导出</n-button>
      </n-space>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="PlayOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">点播次数</span>
          <span class="value">{{ kpi.count }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="TimeOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">总时长</span>
          <span class="value success">{{ kpi.durationHours }}h</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="CashOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">消费金额</span>
          <span class="value">¥{{ kpi.amount.toLocaleString() }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
          <n-icon :component="PeopleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">参与员工</span>
          <span class="value">{{ kpi.employees }}</span>
        </div>
      </div>
    </div>

    <!-- 点播记录 -->
    <n-card class="table-card">
      <n-data-table :columns="columns" :data="filteredTableData" :pagination="pagination" />
    </n-card>

    <!-- 详情弹窗 -->
    <n-modal v-model:show="showDetailModal" preset="card" title="点播详情" style="width: 520px;">
      <n-descriptions :column="2" bordered>
        <n-descriptions-item label="门店">{{ currentRecord?.shop }}</n-descriptions-item>
        <n-descriptions-item label="员工">{{ currentRecord?.name }}（{{ currentRecord?.employeeId }}）</n-descriptions-item>
        <n-descriptions-item label="设备">{{ currentRecord?.device }}</n-descriptions-item>
        <n-descriptions-item label="游戏">{{ currentRecord?.game }}</n-descriptions-item>
        <n-descriptions-item label="开始时间">{{ currentRecord?.startTime }}</n-descriptions-item>
        <n-descriptions-item label="时长">{{ currentRecord?.duration }}分钟</n-descriptions-item>
        <n-descriptions-item label="金额">¥{{ currentRecord?.amount }}</n-descriptions-item>
        <n-descriptions-item label="状态">{{ currentRecord?.status }}</n-descriptions-item>
      </n-descriptions>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showDetailModal = false">关闭</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NCard, NDataTable, NButton, NSpace, NIcon, NDatePicker, NSelect, NTag, NModal, NDescriptions, NDescriptionsItem
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { PlayOutline, TimeOutline, CashOutline, PeopleOutline } from '@vicons/ionicons5'

const filterShop = ref<string | null>(null)
const filterEmployee = ref<string | null>(null)
const deviceType = ref<string | null>(null)
const deviceOptions = [
  { label: '全部设备', value: null },
  { label: 'VR设备', value: 'vr' },
  { label: '银幕互动', value: 'screen' }
]
const dateRange = ref<[number, number] | null>(getTodayRange())
const pagination = { pageSize: 10 }

const shopOptions = [
  { label: '利民街小展厅', value: '利民街小展厅' },
  { label: '卓远萝岗区店', value: '卓远萝岗区店' },
  { label: '卓远萧山区店', value: '卓远萧山区店' },
  { label: '卓远亚运城店', value: '卓远亚运城店' },
  { label: '卓远文鼎路店', value: '卓远文鼎路店' },
]

const employeeOptions = [
  { label: '张三', value: '张三' },
  { label: '李四', value: '李四' },
  { label: '王五', value: '王五' },
  { label: '赵六', value: '赵六' },
  { label: '钱七', value: '钱七' },
]

function getTodayRange(): [number, number] {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
  return [start.getTime(), end.getTime()]
}

const columns: DataTableColumns = [
  { title: '门店', key: 'shop', width: 140 },
  { title: '员工姓名', key: 'name', width: 100 },
  { title: '工号', key: 'employeeId', width: 90 },
  { title: '设备', key: 'device', width: 110 },
  { title: '游戏名称', key: 'game', width: 160 },
  { title: '开始时间', key: 'startTime', width: 170 },
  { title: '时长', key: 'duration', width: 90, render: (row: any) => `${row.duration}分钟` },
  { title: '金额', key: 'amount', width: 100, render: (row: any) => h('span', { style: { color: '#3B82F6', fontWeight: 600 } }, `¥${row.amount}`) },
  { title: '状态', key: 'status', width: 90, render: (row: any) =>
    h(NTag, { type: row.status === '完成' ? 'success' : row.status === '进行中' ? 'info' : 'warning', size: 'small' },
      { default: () => row.status })
  },
  { title: '操作', key: 'actions', width: 100, render: (row: any) =>
    h(NButton, { size: 'small', text: true, type: 'primary', onClick: () => showDetail(row) },
      { default: () => '详情' })
  }
]

const rawData = ref([
  { id: 1, shop: '卓远亚运城店', name: '张三', employeeId: 'A001', device: 'VR-01', deviceType: 'vr', game: '星际探险', startTime: '2026-04-23 14:30:00', duration: 45, amount: 68, operator: '扫码', status: '完成' },
  { id: 2, shop: '卓远亚运城店', name: '李四', employeeId: 'A002', device: 'VR-02', deviceType: 'vr', game: '深海潜水', startTime: '2026-04-23 15:00:00', duration: 60, amount: 88, operator: '扫码', status: '完成' },
  { id: 3, shop: '卓远亚运城店', name: '王五', employeeId: 'A003', device: '银幕-01', deviceType: 'screen', game: '节奏大师', startTime: '2026-04-23 16:30:00', duration: 30, amount: 38, operator: '手动', status: '进行中' },
  { id: 4, shop: '卓远萝岗区店', name: '赵六', employeeId: 'A004', device: 'VR-03', deviceType: 'vr', game: '极限滑雪', startTime: '2026-04-23 10:00:00', duration: 50, amount: 78, operator: '扫码', status: '完成' },
  { id: 5, shop: '卓远萝岗区店', name: '钱七', employeeId: 'A005', device: 'VR-01', deviceType: 'vr', game: '星际探险', startTime: '2026-04-23 18:00:00', duration: 45, amount: 68, operator: '扫码', status: '完成' },
  { id: 6, shop: '卓远萧山区店', name: '张三', employeeId: 'A001', device: '银幕-02', deviceType: 'screen', game: '动感飞车', startTime: '2026-04-23 11:00:00', duration: 40, amount: 58, operator: '手动', status: '完成' },
  { id: 7, shop: '利民街小展厅', name: '李四', employeeId: 'A002', device: 'VR-04', deviceType: 'vr', game: '恐怖医院', startTime: '2026-04-23 20:00:00', duration: 35, amount: 48, operator: '扫码', status: '完成' },
])

const filteredTableData = computed(() => {
  let data = rawData.value
  if (filterShop.value) {
    data = data.filter(d => d.shop === filterShop.value)
  }
  if (filterEmployee.value) {
    data = data.filter(d => d.name === filterEmployee.value)
  }
  if (deviceType.value) {
    data = data.filter(d => d.deviceType === deviceType.value)
  }
  return data
})

const kpi = computed(() => {
  const data = filteredTableData.value
  const totalDuration = data.reduce((s, d) => s + d.duration, 0)
  return {
    count: data.length,
    durationHours: Math.round(totalDuration / 60 * 10) / 10,
    amount: data.reduce((s, d) => s + d.amount, 0),
    employees: new Set(data.map(d => d.name)).size,
  }
})

const showDetailModal = ref(false)
const currentRecord = ref<any>(null)

function showDetail(row: any) {
  currentRecord.value = row
  showDetailModal.value = true
}

function exportData() {
  console.log('导出数据')
}
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { font-size: 20px; font-weight: 600; color: #333; margin: 0; }
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: #fff; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-content { display: flex; flex-direction: column; gap: 4px; }
.stat-content .label { font-size: 13px; color: #666; }
.stat-content .value { font-size: 24px; font-weight: 600; color: #333; }
.stat-content .value.success { color: #10B981; }
.table-card { border-radius: 12px; }
</style>
