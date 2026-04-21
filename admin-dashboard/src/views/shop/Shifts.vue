<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>交接班记录</h1>
      <n-space>
        <n-select v-model:value="shiftType" :options="shiftOptions" size="small" style="width: 120px;" />
        <n-date-picker type="daterange" clearable size="small" v-model:value="dateRange" />
        <n-button secondary @click="exportData">导出</n-button>
      </n-space>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="TimeOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">本月班次</span>
          <span class="value">186</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="CashOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">交款总额</span>
          <span class="value success">¥156,800</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="PeopleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">在岗人数</span>
          <span class="value">8</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #EF4444, #DC2626);">
          <n-icon :component="AlertCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">异常记录</span>
          <span class="value">3</span>
        </div>
      </div>
    </div>

    <!-- 交接班记录 -->
    <n-card class="table-card">
      <n-tabs type="line" v-model:value="activeTab">
        <n-tab name="all">全部</n-tab>
        <n-tab name="morning">早班</n-tab>
        <n-tab name="afternoon">中班</n-tab>
        <n-tab name="night">晚班</n-tab>
      </n-tabs>
      <n-data-table :columns="columns" :data="tableData" :pagination="pagination" />
    </n-card>

    <!-- 交接详情弹窗 -->
    <n-modal v-model:show="showDetailModal" preset="card" title="交接班详情" style="width: 600px;">
      <n-descriptions :column="2" bordered>
        <n-descriptions-item label="班次类型">{{ currentRecord?.shift }}</n-descriptions-item>
        <n-descriptions-item label="交接时间">{{ currentRecord?.time }}</n-descriptions-item>
        <n-descriptions-item label="交班人">{{ currentRecord?.handover }}</n-descriptions-item>
        <n-descriptions-item label="接班人">{{ currentRecord?.receiver }}</n-descriptions-item>
        <n-descriptions-item label="收入金额">¥{{ currentRecord?.income }}</n-descriptions-item>
        <n-descriptions-item label="支出金额">¥{{ currentRecord?.expense }}</n-descriptions-item>
        <n-descriptions-item label="现金">¥{{ currentRecord?.cash }}</n-descriptions-item>
        <n-descriptions-item label="线上">¥{{ currentRecord?.online }}</n-descriptions-item>
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
import { ref, h } from 'vue'
import {
  NCard, NDataTable, NButton, NSpace, NIcon, NDatePicker, NTabs, NTab,
  NSelect, NTag, NModal, NDescriptions, NDescriptionsItem
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { TimeOutline, CashOutline, PeopleOutline, AlertCircleOutline } from '@vicons/ionicons5'

const shiftType = ref(null)
const shiftOptions = [
  { label: '全部班次', value: null },
  { label: '早班', value: 'morning' },
  { label: '中班', value: 'afternoon' },
  { label: '晚班', value: 'night' }
]
const activeTab = ref('all')
const dateRange = ref<[number, number] | null>(null)
const showDetailModal = ref(false)
const currentRecord = ref<any>(null)
const pagination = { pageSize: 10 }

const columns: DataTableColumns = [
  { title: '交接时间', key: 'time', width: 180 },
  { title: '班次', key: 'shift', width: 100, render: (row) =>
    h(NTag, { type: row.shift === '早班' ? 'success' : row.shift === '中班' ? 'warning' : 'info', size: 'small' },
      { default: () => row.shift })
  },
  { title: '交班人', key: 'handover', width: 100 },
  { title: '接班人', key: 'receiver', width: 100 },
  { title: '收入', key: 'income', width: 120, render: (row) => `¥${row.income}` },
  { title: '支出', key: 'expense', width: 100, render: (row) => `¥${row.expense}` },
  { title: '现金', key: 'cash', width: 100, render: (row) => `¥${row.cash}` },
  { title: '线上', key: 'online', width: 100, render: (row) => `¥${row.online}` },
  { title: '状态', key: 'status', width: 100, render: (row) =>
    h(NTag, { type: row.status === '正常' ? 'success' : 'error', size: 'small' },
      { default: () => row.status })
  },
  { title: '操作', key: 'actions', width: 100, render: (row) =>
    h(NButton, { size: 'small', text: true, type: 'primary', onClick: () => showDetail(row) },
      { default: () => '详情' })
  }
]

const tableData = ref([
  { id: 1, time: '2026-04-20 22:00:00', shift: '晚班', handover: '张三', receiver: '李四', income: 5680, expense: 320, cash: 3280, online: 2400, status: '正常' },
  { id: 2, time: '2026-04-20 16:00:00', shift: '中班', handover: '王五', receiver: '张三', income: 8560, expense: 580, cash: 4860, online: 3700, status: '正常' },
  { id: 3, time: '2026-04-20 08:00:00', shift: '早班', handover: '李四', receiver: '王五', income: 4560, expense: 280, cash: 2680, online: 1880, status: '正常' },
  { id: 4, time: '2026-04-19 22:00:00', shift: '晚班', handover: '张三', receiver: '李四', income: 6280, expense: 420, cash: 3680, online: 2600, status: '异常' },
])

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
