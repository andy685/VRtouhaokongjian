<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>影片分成明细</h1>
      <n-space>
        <n-select v-model:value="filmType" :options="filmOptions" size="small" style="width: 120px;" />
        <n-date-picker type="daterange" clearable size="small" v-model:value="dateRange" />
        <n-button secondary @click="exportData">导出</n-button>
      </n-space>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="FilmOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">上映影片</span>
          <span class="value">48</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="PlayCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">播放次数</span>
          <span class="value success">2,856</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="CashOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">分成总额</span>
          <span class="value">¥45,680</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
          <n-icon :component="BusinessOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">片方分成</span>
          <span class="value">¥28,680</span>
        </div>
      </div>
    </div>

    <!-- 分成明细 -->
    <n-card class="table-card">
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
import { FilmOutline, PlayCircleOutline, CashOutline, BusinessOutline } from '@vicons/ionicons5'

const filmType = ref(null)
const filmOptions = [
  { label: '全部类型', value: null },
  { label: 'VR影片', value: 'vr' },
  { label: '互动影片', value: 'interactive' }
]
const dateRange = ref<[number, number] | null>(null)
const pagination = { pageSize: 10 }

const columns: DataTableColumns = [
  { title: '影片名称', key: 'name', width: 180 },
  { title: '类型', key: 'type', width: 120, render: (row) =>
    h(NTag, { type: row.type === 'VR影片' ? 'info' : 'success', size: 'small' },
      { default: () => row.type })
  },
  { title: '片方', key: 'studio', width: 150 },
  { title: '播放次数', key: 'plays', width: 100 },
  { title: '分成比例', key: 'ratio', width: 100, render: (row) => `${row.ratio}%` },
  { title: '总收入', key: 'totalRevenue', width: 130, render: (row) => `¥${row.totalRevenue.toLocaleString()}` },
  { title: '片方分成', key: 'studioShare', width: 130, render: (row) => `¥${row.studioShare.toLocaleString()}` },
  { title: '门店收入', key: 'storeShare', width: 130, render: (row) => `¥${row.storeShare.toLocaleString()}` },
  { title: '状态', key: 'status', width: 100, render: (row) =>
    h(NTag, { type: row.status === '上映中' ? 'success' : 'warning', size: 'small' },
      { default: () => row.status })
  }
]

const tableData = ref([
  { id: 1, name: '星际探险家', type: 'VR影片', studio: '星际影业', plays: 286, ratio: 30, totalRevenue: 28600, studioShare: 8580, storeShare: 20020, status: '上映中' },
  { id: 2, name: '深海大冒险', type: 'VR影片', studio: '蓝色工坊', plays: 256, ratio: 28, totalRevenue: 25600, studioShare: 7168, storeShare: 18432, status: '上映中' },
  { id: 3, name: '极限挑战', type: 'VR影片', studio: '巅峰制作', plays: 228, ratio: 25, totalRevenue: 22800, studioShare: 5700, storeShare: 17100, status: '上映中' },
  { id: 4, name: '太空漫游', type: '互动影片', studio: '未来视界', plays: 186, ratio: 32, totalRevenue: 18600, studioShare: 5952, storeShare: 12648, status: '上映中' },
  { id: 5, name: '丛林探秘', type: 'VR影片', studio: '自然工作室', plays: 168, ratio: 28, totalRevenue: 16800, studioShare: 4704, storeShare: 12096, status: '即将下映' },
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
