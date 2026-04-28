<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">会员数据</h1>
    </div>
    <div class="table-card">
      <n-data-table :columns="columns" :data="data" :bordered="false" :single-line="false" size="small" striped />
    </div>
  </div>
</template>

<script setup lang="ts">
import { NDataTable } from 'naive-ui'

const columns = [
  { title: '商家', key: 'merchant', minWidth: 140 },
  { title: '会员总数', key: 'totalMembers', width: 100 },
  { title: '本月新增', key: 'newThisMonth', width: 100 },
  { title: '储值总额', key: 'totalDeposit', width: 110 },
  { title: '游戏豆总额', key: 'totalBeans', width: 110 },
  { title: '活跃会员', key: 'activeMembers', width: 100 },
  { title: '流失会员', key: 'churnedMembers', width: 100 },
]

const data = [
  { merchant: '恒然集团', totalMembers: 3280, newThisMonth: 156, totalDeposit: 156800, totalBeans: 45200, activeMembers: 2100, churnedMembers: 120 },
  { merchant: '幻影星空', totalMembers: 1890, newThisMonth: 89, totalDeposit: 98500, totalBeans: 23100, activeMembers: 1200, churnedMembers: 80 },
  { merchant: '利民街商家', totalMembers: 2150, newThisMonth: 102, totalDeposit: 112000, totalBeans: 28500, activeMembers: 1450, churnedMembers: 65 },
  { merchant: '党建馆集团', totalMembers: 980, newThisMonth: 45, totalDeposit: 56800, totalBeans: 15200, activeMembers: 680, churnedMembers: 40 },
  { merchant: '华东展厅', totalMembers: 1560, newThisMonth: 78, totalDeposit: 89200, totalBeans: 19800, activeMembers: 980, churnedMembers: 55 },
]
</script>

<style scoped>
.page-container { padding: 20px 24px; }
.page-header { margin-bottom: 24px; }
.page-title { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.table-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid var(--border-color); }
</style>
