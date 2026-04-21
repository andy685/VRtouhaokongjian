<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>渠道营收统计</h1>
      <n-space>
        <n-select v-model:value="shopId" :options="shopOptions" size="small" style="width: 160px;" />
        <n-date-picker type="daterange" clearable size="small" v-model:value="dateRange" />
        <n-button secondary @click="exportData">导出</n-button>
      </n-space>
    </div>

    <!-- 渠道统计 -->
    <div class="stats-row">
      <div v-for="channel in channelStats" :key="channel.id" class="stat-card">
        <div class="channel-info">
          <n-icon :component="channel.icon" size="24" :color="channel.color" />
          <div class="channel-detail">
            <span class="channel-name">{{ channel.name }}</span>
            <span class="channel-desc">{{ channel.description }}</span>
          </div>
        </div>
        <div class="stat-value">
          <span class="value">¥{{ channel.revenue.toLocaleString() }}</span>
          <span class="percent">{{ channel.percent }}%</span>
        </div>
      </div>
    </div>

    <!-- 渠道占比图 -->
    <n-card class="chart-card">
      <template #header>
        <div class="card-title">渠道营收占比</div>
      </template>
      <div class="chart-placeholder">
        <n-icon :component="PieChartOutline" size="48" color="#ccc" />
        <span>饼图展示渠道占比</span>
      </div>
    </n-card>

    <!-- 渠道明细 -->
    <n-card class="table-card">
      <n-data-table :columns="columns" :data="tableData" :pagination="pagination" />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  NCard, NDataTable, NButton, NSpace, NIcon, NDatePicker, NSelect
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { GameControllerOutline, CardOutline, PhonePortraitOutline, CartOutline, PieChartOutline } from '@vicons/ionicons5'

const shopId = ref('futian')
const shopOptions = [
  { label: '深圳福田旗舰店', value: 'futian' },
  { label: '南山科技园店', value: 'nanshan' }
]
const dateRange = ref<[number, number] | null>(null)
const pagination = { pageSize: 10 }

const channelStats = ref([
  { id: 1, name: 'VR设备', description: 'VR游戏点播', icon: GameControllerOutline, color: '#3B82F6', revenue: 89600, percent: 58 },
  { id: 2, name: '会员卡', description: '会员充值', icon: CardOutline, color: '#10B981', revenue: 35800, percent: 23 },
  { id: 3, name: '小程序', description: '线上预约', icon: PhonePortraitOutline, color: '#8B5CF6', revenue: 18600, percent: 12 },
  { id: 4, name: '商品', description: '周边商品', icon: CartOutline, color: '#F59E0B', revenue: 10800, percent: 7 },
])

const columns: DataTableColumns = [
  { title: '渠道', key: 'name', width: 150 },
  { title: '描述', key: 'description', width: 150 },
  { title: '订单数', key: 'orders', width: 100 },
  { title: '营收', key: 'revenue', width: 140, render: (row) => `¥${row.revenue.toLocaleString()}` },
  { title: '占比', key: 'percent', width: 100, render: (row) => `${row.percent}%` },
  { title: '环比', key: 'mom', width: 100, render: (row) =>
    h('span', { style: { color: row.mom > 0 ? '#10B981' : '#EF4444' } },
      row.mom > 0 ? `+${row.mom}%` : `${row.mom}%`)
  },
]

const tableData = ref([
  { name: 'VR设备', description: 'VR游戏点播', orders: 586, revenue: 89600, percent: 58, mom: 12.5 },
  { name: '会员卡', description: '会员充值', orders: 156, revenue: 35800, percent: 23, mom: 8.2 },
  { name: '小程序', description: '线上预约', orders: 286, revenue: 18600, percent: 12, mom: -3.5 },
  { name: '商品', description: '周边商品', orders: 68, revenue: 10800, percent: 7, mom: 5.8 },
])
</script>

<script lang="ts">
import { h } from 'vue'
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { font-size: 20px; font-weight: 600; color: #333; margin: 0; }
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: #fff; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.channel-info { display: flex; align-items: center; gap: 12px; }
.channel-detail { display: flex; flex-direction: column; }
.channel-name { font-size: 15px; font-weight: 600; color: #333; }
.channel-desc { font-size: 12px; color: #999; }
.stat-value { display: flex; justify-content: space-between; align-items: baseline; }
.stat-value .value { font-size: 20px; font-weight: 700; color: #333; }
.stat-value .percent { font-size: 14px; color: #999; }
.chart-card { margin-bottom: 24px; border-radius: 12px; }
.card-title { font-size: 16px; font-weight: 600; color: #333; }
.chart-placeholder { height: 280px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: #999; background: #fafafa; border-radius: 8px; }
.table-card { border-radius: 12px; }
</style>
