<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>会员消费排行</h1>
      <n-space>
        <n-date-picker type="daterange" clearable size="small" v-model:value="dateRange" />
        <n-select v-model:value="timeRange" :options="timeOptions" size="small" style="width: 120px;" />
        <n-button secondary @click="exportData">导出Excel</n-button>
      </n-space>
    </div>

    <!-- 排行卡片 -->
    <div class="ranking-cards">
      <div v-for="(member, index) in topMembers" :key="member.id" class="ranking-card" :class="'rank-' + (index + 1)">
        <div class="rank-badge">
          <n-icon v-if="index === 0" :component="TrophyOutline" size="24" />
          <span v-else class="rank-num">{{ index + 1 }}</span>
        </div>
        <div class="member-info">
          <span class="member-name">{{ member.name }}</span>
          <span class="member-phone">{{ member.phone }}</span>
        </div>
        <div class="member-stats">
          <div class="stat-item">
            <span class="stat-label">消费金额</span>
            <span class="stat-value">¥{{ member.totalConsume.toLocaleString() }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">消费次数</span>
            <span class="stat-value">{{ member.visitCount }}次</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 完整排行列表 -->
    <n-card class="table-card">
      <n-data-table :columns="columns" :data="tableData" :pagination="pagination" />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import {
  NCard, NDataTable, NButton, NSpace, NIcon, NTag, NDatePicker, NSelect
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { TrophyOutline, MedalOutline } from '@vicons/ionicons5'

const dateRange = ref<[number, number] | null>(null)
const timeRange = ref('month')
const timeOptions = [
  { label: '本月', value: 'month' },
  { label: '上月', value: 'lastMonth' },
  { label: '本季度', value: 'quarter' },
  { label: '本年', value: 'year' }
]
const pagination = { pageSize: 10 }

const topMembers = ref([
  { id: 1, name: '张小明', phone: '138****1234', totalConsume: 15800, visitCount: 56 },
  { id: 2, name: '李小红', phone: '139****5678', totalConsume: 12800, visitCount: 48 },
  { id: 3, name: '王小强', phone: '137****9012', totalConsume: 9800, visitCount: 38 },
])

const columns: DataTableColumns = [
  { title: '排名', key: 'rank', width: 80, render: (row) =>
    h('div', { class: 'rank-cell' },
      row.rank <= 3
        ? h(NIcon, { component: row.rank === 1 ? TrophyOutline : MedalOutline, size: 20, color: row.rank === 1 ? '#F59E0B' : row.rank === 2 ? '#9CA3AF' : '#CD7F32' })
        : h('span', { class: 'rank-num' }, row.rank))
  },
  { title: '会员姓名', key: 'name', width: 120 },
  { title: '手机号', key: 'phone', width: 130 },
  { title: '会员等级', key: 'level', width: 100, render: (row) =>
    h(NTag, { type: row.level === 'VIP' ? 'error' : row.level === '金卡' ? 'warning' : 'info', size: 'small' },
      { default: () => row.level })
  },
  { title: '累计消费', key: 'totalConsume', width: 130, render: (row) => `¥${row.totalConsume.toLocaleString()}` },
  { title: '消费次数', key: 'visitCount', width: 100 },
  { title: '最近消费', key: 'lastConsume', width: 120 },
  { title: '活跃度', key: 'activity', width: 150, render: (row) =>
    h('div', { class: 'activity-bar' },
      h('div', { class: 'activity-fill', style: { width: row.activity + '%' } }))
  }
]

const tableData = ref([
  { rank: 1, name: '张小明', phone: '138****1234', level: 'VIP', totalConsume: 15800, visitCount: 56, lastConsume: '2026-04-18', activity: 95 },
  { rank: 2, name: '李小红', phone: '139****5678', level: '金卡', totalConsume: 12800, visitCount: 48, lastConsume: '2026-04-15', activity: 88 },
  { rank: 3, name: '王小强', phone: '137****9012', level: '金卡', totalConsume: 9800, visitCount: 38, lastConsume: '2026-04-12', activity: 82 },
  { rank: 4, name: '陈小芳', phone: '136****3456', level: '银卡', totalConsume: 6500, visitCount: 28, lastConsume: '2026-04-10', activity: 75 },
  { rank: 5, name: '刘小丽', phone: '135****7890', level: '银卡', totalConsume: 5200, visitCount: 22, lastConsume: '2026-04-08', activity: 68 },
  { rank: 6, name: '赵小军', phone: '134****2345', level: '普卡', totalConsume: 3800, visitCount: 16, lastConsume: '2026-04-05', activity: 55 },
  { rank: 7, name: '孙小娟', phone: '133****6789', level: '普卡', totalConsume: 2800, visitCount: 12, lastConsume: '2026-04-02', activity: 45 },
])

function exportData() {
  console.log('导出数据')
}
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { font-size: 20px; font-weight: 600; color: #333; margin: 0; }
.ranking-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px; }
.ranking-card { background: #fff; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); position: relative; overflow: hidden; }
.ranking-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; }
.rank-1::before { background: linear-gradient(90deg, #F59E0B, #FBBF24); }
.rank-2::before { background: linear-gradient(90deg, #9CA3AF, #D1D5DB); }
.rank-3::before { background: linear-gradient(90deg, #CD7F32, #D4A574); }
.rank-badge { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; }
.rank-1 .rank-badge { background: linear-gradient(135deg, #F59E0B, #D97706); }
.rank-2 .rank-badge { background: linear-gradient(135deg, #9CA3AF, #6B7280); }
.rank-3 .rank-badge { background: linear-gradient(135deg, #CD7F32, #A0522D); }
.rank-num { font-size: 20px; font-weight: 700; }
.member-info { flex: 1; }
.member-name { display: block; font-size: 16px; font-weight: 600; color: #333; }
.member-phone { display: block; font-size: 13px; color: #999; margin-top: 2px; }
.member-stats { display: flex; gap: 24px; }
.stat-item { text-align: center; }
.stat-label { display: block; font-size: 12px; color: #999; }
.stat-value { display: block; font-size: 16px; font-weight: 600; color: #333; margin-top: 2px; }
.table-card { border-radius: 12px; }
.rank-cell { display: flex; align-items: center; justify-content: center; }
.activity-bar { width: 100px; height: 6px; background: #E5E7EB; border-radius: 3px; overflow: hidden; }
.activity-fill { height: 100%; background: linear-gradient(90deg, #3B82F6, #60A5FA); border-radius: 3px; }
</style>
