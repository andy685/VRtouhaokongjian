<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>点播消费记录</h1>
      <n-space>
        <n-select v-model:value="filterGame" :options="gameOptions" size="small" style="width: 140px;" placeholder="游戏筛选" clearable />
        <n-date-picker type="daterange" clearable size="small" v-model:value="dateRange" />
        <n-button secondary size="small" @click="exportData">
          <template #icon><n-icon :component="DownloadOutline" /></template>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NDataTable, NButton, NIcon, NSelect, NDatePicker, NSpace } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { DownloadOutline } from '@vicons/ionicons5'

interface PlayRecord {
  game: string
  people: number
  playTime: string
  beansConsumed: number
  cpRevenue: number
}

const filterGame = ref<string | null>(null)
const dateRange = ref<[number, number] | null>(null)

const gameOptions = [
  { label: '过山车VR', value: '过山车VR' },
  { label: '恐怖医院', value: '恐怖医院' },
  { label: '极速赛车', value: '极速赛车' },
  { label: '海洋世界', value: '海洋世界' },
  { label: '节奏光剑', value: '节奏光剑' },
  { label: '幻影突袭', value: '幻影突袭' },
]

const pagination = { pageSize: 15 }

const rawData = ref<PlayRecord[]>([
  { game: '过山车VR', people: 2, playTime: '2026-05-31 16:20', beansConsumed: 8, cpRevenue: 12.80 },
  { game: '恐怖医院', people: 1, playTime: '2026-05-31 15:45', beansConsumed: 6, cpRevenue: 9.60 },
  { game: '极速赛车', people: 3, playTime: '2026-05-31 14:30', beansConsumed: 12, cpRevenue: 19.20 },
  { game: '海洋世界', people: 1, playTime: '2026-05-31 13:15', beansConsumed: 4, cpRevenue: 6.40 },
  { game: '节奏光剑', people: 1, playTime: '2026-05-31 12:00', beansConsumed: 4, cpRevenue: 6.40 },
  { game: '幻影突袭', people: 2, playTime: '2026-05-31 11:40', beansConsumed: 10, cpRevenue: 16.00 },
  { game: '过山车VR', people: 1, playTime: '2026-05-31 10:50', beansConsumed: 4, cpRevenue: 6.40 },
  { game: '恐怖医院', people: 2, playTime: '2026-05-31 09:30', beansConsumed: 12, cpRevenue: 19.20 },
  { game: '过山车VR', people: 5, playTime: '2026-05-30 18:20', beansConsumed: 20, cpRevenue: 32.00 },
  { game: '极速赛车', people: 1, playTime: '2026-05-30 17:10', beansConsumed: 4, cpRevenue: 6.40 },
  { game: '过山车VR', people: 3, playTime: '2026-05-30 16:00', beansConsumed: 12, cpRevenue: 19.20 },
  { game: '海洋世界', people: 2, playTime: '2026-05-30 14:30', beansConsumed: 8, cpRevenue: 12.80 },
  { game: '恐怖医院', people: 2, playTime: '2026-05-30 13:45', beansConsumed: 12, cpRevenue: 19.20 },
  { game: '节奏光剑', people: 1, playTime: '2026-05-30 11:20', beansConsumed: 4, cpRevenue: 6.40 },
  { game: '幻影突袭', people: 4, playTime: '2026-05-30 10:10', beansConsumed: 20, cpRevenue: 32.00 },
])

const columns: DataTableColumns<PlayRecord> = [
  { title: '游戏', key: 'game', minWidth: 140 },
  { title: '人数', key: 'people', width: 80, align: 'center' },
  { title: '消费时间', key: 'playTime', width: 170, align: 'center' },
  { title: '消耗游戏豆', key: 'beansConsumed', width: 120, align: 'center', render: (row) => `${row.beansConsumed}` },
  { title: 'CP收益', key: 'cpRevenue', width: 120, align: 'center', render: (row) => `¥${row.cpRevenue.toFixed(2)}` },
]

const filteredData = computed(() => {
  let data = rawData.value
  if (filterGame.value) data = data.filter(d => d.game === filterGame.value)
  return data
})

function exportData() {
  console.log('导出点播消费记录')
}
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-header h1 { font-size: 18px; font-weight: 600; color: var(--text-primary); margin: 0; }
</style>
