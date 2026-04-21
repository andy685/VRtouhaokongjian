<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>售品销售报表</h1>
      <n-space>
        <n-select v-model:value="category" :options="categoryOptions" size="small" style="width: 120px;" />
        <n-date-picker type="daterange" clearable size="small" v-model:value="dateRange" />
        <n-button secondary @click="exportData">导出</n-button>
      </n-space>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="BagOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">商品总数</span>
          <span class="value">86</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="CartOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">销售笔数</span>
          <span class="value success">1,286</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="CashOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">销售金额</span>
          <span class="value">¥28,680</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
          <n-icon :component="CubeOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">库存预警</span>
          <span class="value">5</span>
        </div>
      </div>
    </div>

    <!-- 销售排行 -->
    <n-card class="table-card">
      <template #header>
        <div class="card-title">商品销售排行</div>
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
import { BagOutline, CartOutline, CashOutline, CubeOutline } from '@vicons/ionicons5'

const category = ref(null)
const categoryOptions = [
  { label: '全部分类', value: null },
  { label: 'VR商品', value: 'vr' },
  { label: '饮料零食', value: 'food' },
  { label: '周边商品', value: 'goods' }
]
const dateRange = ref<[number, number] | null>(null)
const pagination = { pageSize: 10 }

const columns: DataTableColumns = [
  { title: '排名', key: 'rank', width: 80 },
  { title: '商品名称', key: 'name', width: 180 },
  { title: '分类', key: 'category', width: 100, render: (row) =>
    h(NTag, { size: 'small', type: row.category === 'VR商品' ? 'info' : row.category === '饮料零食' ? 'success' : 'warning' },
      { default: () => row.category })
  },
  { title: '销量', key: 'sales', width: 100 },
  { title: '销售额', key: 'revenue', width: 130, render: (row) => `¥${row.revenue.toLocaleString()}` },
  { title: '库存', key: 'stock', width: 100, render: (row) =>
    h('span', { style: { color: row.stock < 10 ? '#EF4444' : '#333' } }, row.stock)
  },
  { title: '单价', key: 'price', width: 100, render: (row) => `¥${row.price}` },
  { title: '利润率', key: 'profitRate', width: 100, render: (row) => `${row.profitRate}%` },
]

const tableData = ref([
  { rank: 1, name: 'VR体验套餐A', category: 'VR商品', sales: 286, revenue: 22880, stock: 50, price: 80, profitRate: 45 },
  { rank: 2, name: '可乐', category: '饮料零食', sales: 520, revenue: 1560, stock: 100, price: 3, profitRate: 60 },
  { rank: 3, name: 'VR体验套餐B', category: 'VR商品', sales: 186, revenue: 16740, stock: 30, price: 90, profitRate: 48 },
  { rank: 4, name: '薯片', category: '饮料零食', sales: 380, revenue: 1140, stock: 80, price: 3, profitRate: 55 },
  { rank: 5, name: 'VR周边T恤', category: '周边商品', sales: 48, revenue: 2880, stock: 25, price: 60, profitRate: 35 },
  { rank: 6, name: '雪碧', category: '饮料零食', sales: 420, revenue: 1260, stock: 90, price: 3, profitRate: 58 },
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
