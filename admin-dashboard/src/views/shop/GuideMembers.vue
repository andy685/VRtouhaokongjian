<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>会员管理（导购）</h1>
      <n-space>
        <n-input placeholder="搜索姓名/手机..." size="small" style="width: 180px;">
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
        <n-select v-model:value="guideId" :options="guideOptions" size="small" style="width: 140px;" placeholder="选择导购" />
        <n-button type="primary">导出报表</n-button>
      </n-space>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="PeopleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">我的会员</span>
          <span class="value">328</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="PersonAddOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">本月新增</span>
          <span class="value success">28</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="CardOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">会员消费</span>
          <span class="value">¥45,680</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
          <n-icon :component="StarOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">会员等级</span>
          <span class="value">黄金</span>
        </div>
      </div>
    </div>

    <!-- 会员列表 -->
    <n-card class="table-card">
      <n-data-table :columns="columns" :data="tableData" :pagination="pagination" />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import {
  NCard, NDataTable, NButton, NSpace, NInput, NIcon, NTag, NSelect
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import {
  SearchOutline, PeopleOutline, PersonAddOutline, CardOutline, StarOutline
} from '@vicons/ionicons5'

const guideId = ref(null)
const guideOptions = [
  { label: '全部导购', value: null },
  { label: '张三', value: 'zhangsan' },
  { label: '李四', value: 'lisi' },
  { label: '王五', value: 'wangwu' }
]
const pagination = { pageSize: 10 }

const columns: DataTableColumns = [
  { title: '会员姓名', key: 'name', width: 120 },
  { title: '手机号', key: 'phone', width: 130 },
  { title: '所属导购', key: 'guide', width: 100 },
  { title: '会员等级', key: 'level', width: 100, render: (row) =>
    h(NTag, { type: row.level === '黄金' ? 'warning' : row.level === '白银' ? 'info' : 'default', size: 'small' },
      { default: () => row.level })
  },
  { title: '余额', key: 'balance', width: 100, render: (row) => `¥${row.balance}` },
  { title: '积分', key: 'points', width: 100 },
  { title: '累计消费', key: 'totalConsume', width: 120, render: (row) => `¥${row.totalConsume}` },
  { title: '最近消费', key: 'lastConsume', width: 120 },
  { title: '操作', key: 'actions', width: 150, render: () =>
    h(NSpace, { size: 'small' },
      { default: () => [
        h(NButton, { size: 'small', text: true, type: 'primary' }, { default: () => '详情' }),
        h(NButton, { size: 'small', text: true }, { default: () => '消费' })
      ]})
  }
]

const tableData = ref([
  { id: 1, name: '张小明', phone: '13801231234', guide: '张三', level: '黄金', balance: 580, points: 5600, totalConsume: 12800, lastConsume: '2026-04-18' },
  { id: 2, name: '李小红', phone: '13905675678', guide: '李四', level: '白银', balance: 320, points: 3200, totalConsume: 8600, lastConsume: '2026-04-15' },
  { id: 3, name: '王小强', phone: '13709019012', guide: '张三', level: '青铜', balance: 150, points: 1500, totalConsume: 4500, lastConsume: '2026-04-10' },
  { id: 4, name: '陈小芳', phone: '13603453456', guide: '王五', level: '黄金', balance: 890, points: 8900, totalConsume: 15600, lastConsume: '2026-04-19' },
  { id: 5, name: '刘小丽', phone: '13507897890', guide: '李四', level: '普通会员', balance: 80, points: 800, totalConsume: 2200, lastConsume: '2026-04-05' },
])
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
