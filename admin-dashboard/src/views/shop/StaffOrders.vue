<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>员工点播</h1>
      <n-space>
        <n-input placeholder="搜索员工姓名..." size="small" style="width: 180px;">
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
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
          <span class="value">856</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="TimeOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">总时长</span>
          <span class="value success">1,286h</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="CashOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">消费金额</span>
          <span class="value">¥28,560</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
          <n-icon :component="PeopleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">参与员工</span>
          <span class="value">12</span>
        </div>
      </div>
    </div>

    <!-- 点播记录 -->
    <n-card class="table-card">
      <n-data-table :columns="columns" :data="tableData" :pagination="pagination" />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import {
  NCard, NDataTable, NButton, NSpace, NInput, NIcon, NDatePicker, NSelect, NTag
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { SearchOutline, PlayOutline, TimeOutline, CashOutline, PeopleOutline } from '@vicons/ionicons5'

const deviceType = ref(null)
const deviceOptions = [
  { label: '全部设备', value: null },
  { label: 'VR设备', value: 'vr' },
  { label: '银幕互动', value: 'screen' }
]
const dateRange = ref<[number, number] | null>(null)
const pagination = { pageSize: 10 }

const columns: DataTableColumns = [
  { title: '员工姓名', key: 'name', width: 120 },
  { title: '工号', key: 'employeeId', width: 100 },
  { title: '设备', key: 'device', width: 120 },
  { title: '游戏名称', key: 'game', width: 180 },
  { title: '开始时间', key: 'startTime', width: 180 },
  { title: '时长', key: 'duration', width: 100, render: (row) => `${row.duration}分钟` },
  { title: '金额', key: 'amount', width: 100, render: (row) => `¥${row.amount}` },
  { title: '操作人', key: 'operator', width: 100 },
  { title: '状态', key: 'status', width: 100, render: (row) =>
    h(NTag, { type: row.status === '完成' ? 'success' : row.status === '进行中' ? 'info' : 'warning', size: 'small' },
      { default: () => row.status })
  }
]

const tableData = ref([
  { id: 1, name: '张三', employeeId: 'A001', device: 'VR-01', game: '星际探险', startTime: '2026-04-20 14:30:00', duration: 45, amount: 68, operator: '系统', status: '完成' },
  { id: 2, name: '李四', employeeId: 'A002', device: 'VR-02', game: '深海潜水', startTime: '2026-04-20 15:00:00', duration: 60, amount: 88, operator: '系统', status: '完成' },
  { id: 3, name: '王五', employeeId: 'A003', device: '银幕-01', game: '节奏大师', startTime: '2026-04-20 16:30:00', duration: 30, amount: 38, operator: '张三', status: '进行中' },
  { id: 4, name: '赵六', employeeId: 'A004', device: 'VR-03', game: '极限滑雪', startTime: '2026-04-20 10:00:00', duration: 50, amount: 78, operator: '系统', status: '完成' },
  { id: 5, name: '钱七', employeeId: 'A005', device: 'VR-01', game: '星际探险', startTime: '2026-04-19 18:00:00', duration: 45, amount: 68, operator: '系统', status: '完成' },
])

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
