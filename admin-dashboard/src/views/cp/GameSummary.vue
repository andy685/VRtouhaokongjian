<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>点播游戏汇总</h1>
      <n-space>
        <n-date-picker type="daterange" clearable size="small" v-model:value="dateRange" />
        <n-button secondary size="small" @click="exportData">
          <template #icon><n-icon :component="DownloadOutline" /></template>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { NDataTable, NButton, NIcon, NDatePicker, NSpace } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { DownloadOutline } from '@vicons/ionicons5'

interface GameSummaryItem {
  game: string
  plays: number
  people: number
  beansConsumed: number
  cpRevenue: number
}

const dateRange = ref<[number, number] | null>(null)

// 按游戏汇总（不区分店铺）
const rawData = ref<GameSummaryItem[]>([
  { game: '过山车VR', plays: 1086, people: 1350, beansConsumed: 4344, cpRevenue: 6950.40 },
  { game: '恐怖医院', plays: 872, people: 1040, beansConsumed: 5232, cpRevenue: 8371.20 },
  { game: '极速赛车', plays: 530, people: 600, beansConsumed: 2120, cpRevenue: 3392.00 },
  { game: '海洋世界', plays: 490, people: 580, beansConsumed: 1960, cpRevenue: 3136.00 },
  { game: '节奏光剑', plays: 370, people: 400, beansConsumed: 1480, cpRevenue: 2368.00 },
  { game: '幻影突袭', plays: 185, people: 210, beansConsumed: 925, cpRevenue: 1480.00 },
])

const totalPlays = computed(() => rawData.value.reduce((s, d) => s + d.plays, 0))
const totalPeople = computed(() => rawData.value.reduce((s, d) => s + d.people, 0))
const totalBeans = computed(() => rawData.value.reduce((s, d) => s + d.beansConsumed, 0))
const totalRevenue = computed(() => rawData.value.reduce((s, d) => s + d.cpRevenue, 0))

const tableData = computed(() => {
  const playsSum = totalPlays.value || 1
  const revenueSum = totalRevenue.value || 1
  const result = rawData.value.map(d => ({
    ...d,
    playPercent: (d.plays / playsSum * 100),
    revenuePercent: (d.cpRevenue / revenueSum * 100),
  }))
  result.push({
    game: '合计',
    plays: totalPlays.value,
    people: totalPeople.value,
    beansConsumed: totalBeans.value,
    cpRevenue: totalRevenue.value,
    playPercent: 100,
    revenuePercent: 100,
  } as any)
  return result
})

const columns: DataTableColumns = [
  { title: '游戏', key: 'game', minWidth: 160, render: (row: any) =>
    row.game === '合计' ? h('b', {}, '合计') : row.game
  },
  { title: '点播次数', key: 'plays', width: 110, align: 'center', render: (row: any) =>
    row.game === '合计' ? h('b', {}, row.plays.toLocaleString()) : row.plays.toLocaleString()
  },
  { title: '游戏人数', key: 'people', width: 110, align: 'center', render: (row: any) =>
    row.game === '合计' ? h('b', {}, row.people.toLocaleString()) : row.people.toLocaleString()
  },
  { title: '消耗游戏豆', key: 'beansConsumed', width: 130, align: 'center', render: (row: any) =>
    row.game === '合计' ? h('b', {}, row.beansConsumed.toLocaleString()) : row.beansConsumed.toLocaleString()
  },
  { title: 'CP收益', key: 'cpRevenue', width: 130, align: 'center', render: (row: any) => {
    const val = `¥${row.cpRevenue.toLocaleString()}`
    return row.game === '合计' ? h('b', { style: 'color:#10B981' }, val) : val
  }},
  { title: '次数占比(%)', key: 'playPercent', width: 120, align: 'center', render: (row: any) =>
    row.game === '合计' ? h('b', {}, '100.00') : row.playPercent.toFixed(2)
  },
  { title: '收益占比(%)', key: 'revenuePercent', width: 120, align: 'center', render: (row: any) =>
    row.game === '合计' ? h('b', {}, '100.00') : row.revenuePercent.toFixed(2)
  },
]

function exportData() {
  console.log('导出点播游戏汇总')
}
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-header h1 { font-size: 18px; font-weight: 600; color: var(--text-primary); margin: 0; }
</style>
