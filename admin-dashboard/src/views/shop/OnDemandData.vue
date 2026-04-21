<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>点播数据</h1>
      <n-space>
        <n-select v-model:value="deviceId" :options="deviceOptions" size="small" style="width: 140px;" />
        <n-date-picker type="daterange" clearable size="small" v-model:value="dateRange" />
        <n-button secondary @click="exportData">导出</n-button>
      </n-space>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="PlayCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">总点播次数</span>
          <span class="value">3,856</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="TimeOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">总点播时长</span>
          <span class="value success">5,280h</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="CashOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">点播收入</span>
          <span class="value">¥156,800</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
          <n-icon :component="GameControllerOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">游戏数量</span>
          <span class="value">48</span>
        </div>
      </div>
    </div>

    <!-- 游戏排行 -->
    <n-card class="table-card">
      <template #header>
        <div class="card-title">游戏点播排行</div>
      </template>
      <n-data-table :columns="columns" :data="tableData" :pagination="pagination" />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import {
  NCard, NDataTable, NButton, NSpace, NIcon, NDatePicker, NSelect, NTag
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { PlayCircleOutline, TimeOutline, CashOutline, GameControllerOutline } from '@vicons/ionicons5'

const deviceId = ref(null)
const deviceOptions = [
  { label: '全部设备', value: null },
  { label: 'VR-01', value: 'vr01' },
  { label: 'VR-02', value: 'vr02' },
  { label: 'VR-03', value: 'vr03' }
]
const dateRange = ref<[number, number] | null>(null)
const pagination = { pageSize: 10 }

const columns: DataTableColumns = [
  { title: '排名', key: 'rank', width: 80 },
  { title: '游戏名称', key: 'name', width: 180 },
  { title: '类型', key: 'type', width: 100, render: (row) =>
    h(NTag, { type: row.type === 'VR' ? 'info' : 'success', size: 'small' },
      { default: () => row.type })
  },
  { title: '点播次数', key: 'plays', width: 120 },
  { title: '点播时长', key: 'duration', width: 120, render: (row) => `${row.duration}h` },
  { title: '平均时长', key: 'avgDuration', width: 120, render: (row) => `${row.avgDuration}分钟` },
  { title: '点播收入', key: 'revenue', width: 130, render: (row) => `¥${row.revenue.toLocaleString()}` },
  { title: '占比', key: 'percent', width: 100, render: (row) => `${row.percent}%` },
  { title: '状态', key: 'status', width: 100, render: (row) =>
    h(NTag, { type: row.status === '热门' ? 'error' : row.status === '推荐' ? 'warning' : 'success', size: 'small' },
      { default: () => row.status })
  }
]

const tableData = ref([
  { rank: 1, name: '星际探险', type: 'VR', plays: 586, duration: 856, avgDuration: 88, revenue: 26880, percent: 15.2, status: '热门' },
  { rank: 2, name: '深海潜水', type: 'VR', plays: 456, duration: 698, avgDuration: 92, revenue: 21880, percent: 12.5, status: '热门' },
  { rank: 3, name: '极限滑雪', type: 'VR', plays: 386, duration: 568, avgDuration: 88, revenue: 18560, percent: 10.5, status: '推荐' },
  { rank: 4, name: '节奏大师', type: '银幕', plays: 328, duration: 456, avgDuration: 83, revenue: 12560, percent: 8.5, status: '推荐' },
  { rank: 5, name: '太空大战', type: 'VR', plays: 286, duration: 412, avgDuration: 86, revenue: 13860, percent: 7.8, status: '正常' },
  { rank: 6, name: '丛林冒险', type: 'VR', plays: 256, duration: 368, avgDuration: 86, revenue: 12280, percent: 6.8, status: '正常' },
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
.card-title { font-size: 16px; font-weight: 600; color: #333; }
</style>
