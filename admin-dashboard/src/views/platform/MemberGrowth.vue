<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">会员增长</h1>
    </div>
    <div class="table-card">
      <n-data-table :columns="columns" :data="data" :bordered="false" :single-line="false" size="small" striped />
    </div>
  </div>
</template>

<script setup lang="ts">
import { h, ref } from 'vue'
import { NDataTable, NTooltip, NIcon, NText } from 'naive-ui'
import { HelpCircleOutline } from '@vicons/ionicons5'

function renderTitle(label: string, tooltip: string, color: string) {
  return () => h('span', { style: 'display:inline-flex;align-items:center;gap:4px;' }, [
    label,
    h(NTooltip, { placement: 'top' }, {
      trigger: () => h(NIcon, { component: HelpCircleOutline, size: 14, style: `cursor:pointer;color:${color};` }),
      default: () => tooltip,
    }),
  ])
}

const columns = [
  { title: '日期', key: 'date', minWidth: 120 },
  { title: '新增会员', key: 'newMembers', width: 100 },
  { title: '储值新增', key: 'newDeposit', width: 110 },
  { title: '游戏豆新增', key: 'newBeans', width: 110 },
  { title: renderTitle('活跃数', '当天有消费记录的会员数', '#8B5CF6'), key: 'active', width: 100 },
  { title: renderTitle('流失数', '当天新增流失会员（超过60天无消费）', '#EF4444'), key: 'churned', width: 100 },
  { title: '净增长', key: 'netGrowth', width: 90 },
]

const data = [
  { date: '2023-09-16', newMembers: 45, newDeposit: 12800, newBeans: 5600, active: 320, churned: 12, netGrowth: 33 },
  { date: '2023-09-15', newMembers: 38, newDeposit: 9500, newBeans: 4200, active: 298, churned: 8, netGrowth: 30 },
  { date: '2023-09-14', newMembers: 42, newDeposit: 11200, newBeans: 4800, active: 305, churned: 10, netGrowth: 32 },
  { date: '2023-09-13', newMembers: 35, newDeposit: 8900, newBeans: 3900, active: 280, churned: 9, netGrowth: 26 },
  { date: '2023-09-12', newMembers: 50, newDeposit: 14500, newBeans: 6200, active: 340, churned: 11, netGrowth: 39 },
  { date: '2023-09-11', newMembers: 28, newDeposit: 7200, newBeans: 3100, active: 265, churned: 7, netGrowth: 21 },
  { date: '2023-09-10', newMembers: 55, newDeposit: 15800, newBeans: 6800, active: 360, churned: 14, netGrowth: 41 },
]
</script>

<style scoped>
.page-container { padding: 20px 24px; }
.page-header { margin-bottom: 24px; }
.page-title { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.table-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid var(--border-color); }
</style>
