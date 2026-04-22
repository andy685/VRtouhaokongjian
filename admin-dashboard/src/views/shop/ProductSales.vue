<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>售品销售报表</h1>
      <n-space>
        <n-select v-model:value="filterShop" :options="shopOptions" size="small" style="width: 140px;" placeholder="所属店铺" clearable />
        <n-select v-model:value="category" :options="categoryOptions" size="small" style="width: 120px;" />
        <n-date-picker type="daterange" clearable size="small" v-model:value="dateRange" />
        <n-button secondary @click="exportData">导出</n-button>
      </n-space>
    </div>

    <!-- 商品汇总 -->
    <n-card class="table-card" title="商品汇总" style="margin-bottom: 24px;">
      <n-data-table :columns="columns" :data="filteredData" :pagination="pagination" />
    </n-card>

    <!-- 销售明细 -->
    <div class="section-header">
      <h2>销售明细</h2>
    </div>
    <n-data-table
      :columns="detailColumns"
      :data="filteredDetailData"
      :pagination="{ pageSize: 15 }"
      :bordered="true"
      :single-line="false"
      size="small"
      @update:page="() => {}"
      :row-props="(row: SaleRecord) => ({ style: 'cursor: pointer;', onClick: () => openDetail(row) })"
    />

    <!-- 销售明细详情弹窗 -->
    <n-modal v-model:show="showDetailModal" preset="card" title="销售明细详情" style="width: 480px;" :bordered="false">
      <n-descriptions :column="1" label-placement="left" label-style="width: 100px; font-weight: 500;">
        <n-descriptions-item label="所属店铺">{{ detailRecord?.shop }}</n-descriptions-item>
        <n-descriptions-item label="商品名称">{{ detailRecord?.product }}</n-descriptions-item>
        <n-descriptions-item label="分类">
          <n-tag :size="'small'" :type="detailRecord?.category === 'VR商品' ? 'info' : detailRecord?.category === '饮料零食' ? 'success' : 'warning'">
            {{ detailRecord?.category }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="买家">{{ detailRecord?.buyer }}</n-descriptions-item>
        <n-descriptions-item label="数量">{{ detailRecord?.quantity }}</n-descriptions-item>
        <n-descriptions-item label="单价">¥{{ detailRecord?.price?.toFixed(2) }}</n-descriptions-item>
        <n-descriptions-item label="销售额">¥{{ detailRecord?.amount?.toFixed(2) }}</n-descriptions-item>
        <n-descriptions-item label="利润">
          <span style="color: #10B981; font-weight: 500;">¥{{ detailRecord?.profit?.toFixed(2) }}</span>
        </n-descriptions-item>
        <n-descriptions-item label="销售时间">{{ detailRecord?.saleTime }}</n-descriptions-item>
      </n-descriptions>
      <template #footer>
        <n-space justify="center">
          <n-button @click="showDetailModal = false">关闭</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NCard, NDataTable, NButton, NSpace, NIcon, NDatePicker, NSelect, NTag,
  NModal, NDescriptions, NDescriptionsItem
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { BagOutline, CartOutline, CashOutline, CubeOutline } from '@vicons/ionicons5'

interface ProductItem {
  id: number
  shop: string
  name: string
  category: string
  sales: number
  revenue: number
  profit: number
  stock: number
  price: number
  profitRate: number
}

interface SaleRecord {
  id: number
  shop: string
  product: string
  category: string
  buyer: string
  quantity: number
  price: number
  amount: number
  profit: number
  saleTime: string
}

const shopOptions = [
  { label: '利民街小展厅', value: '利民街小展厅' },
  { label: '卓远萝岗区店', value: '卓远萝岗区店' },
  { label: '卓远萧山区店', value: '卓远萧山区店' },
  { label: '卓远亚运城店', value: '卓远亚运城店' },
  { label: '卓远文鼎路店', value: '卓远文鼎路店' },
]

const filterShop = ref<string | null>(null)
const category = ref<string | null>(null)
const categoryOptions = [
  { label: '全部分类', value: null },
  { label: 'VR商品', value: 'VR商品' },
  { label: '饮料零食', value: '饮料零食' },
  { label: '周边商品', value: '周边商品' }
]
const dateRange = ref<[number, number] | null>(null)
const pagination = { pageSize: 10 }

// 商品汇总列
const columns: DataTableColumns<ProductItem> = [
  { title: '所属店铺', key: 'shop', width: 140, align: 'center' },
  { title: '商品名称', key: 'name', width: 180 },
  { title: '分类', key: 'category', width: 100, align: 'center', render: (row) =>
    h(NTag, { size: 'small', type: row.category === 'VR商品' ? 'info' : row.category === '饮料零食' ? 'success' : 'warning' },
      { default: () => row.category })
  },
  { title: '销量', key: 'sales', width: 100, align: 'center' },
  { title: '销售额', key: 'revenue', width: 130, align: 'center', render: (row) => `¥${row.revenue.toLocaleString()}` },
  { title: '利润', key: 'profit', width: 120, align: 'center', render: (row) =>
    h('span', { style: 'color: #10B981; font-weight: 500;' }, `¥${row.profit.toLocaleString()}`)
  },
  { title: '库存', key: 'stock', width: 100, align: 'center', render: (row) =>
    h('span', { style: { color: row.stock < 10 ? '#EF4444' : '#333' } }, row.stock)
  },
  { title: '单价', key: 'price', width: 100, align: 'center', render: (row) => `¥${row.price}` },
  { title: '利润率', key: 'profitRate', width: 100, align: 'center', render: (row) => `${row.profitRate}%` },
]

// 销售明细列
const detailColumns: DataTableColumns<SaleRecord> = [
  { title: '所属店铺', key: 'shop', width: 140, align: 'center' },
  { title: '商品名称', key: 'product', minWidth: 160 },
  { title: '分类', key: 'category', width: 100, align: 'center', render: (row) =>
    h(NTag, { size: 'small', type: row.category === 'VR商品' ? 'info' : row.category === '饮料零食' ? 'success' : 'warning' },
      { default: () => row.category })
  },
  { title: '买家', key: 'buyer', width: 140, align: 'center' },
  { title: '数量', key: 'quantity', width: 80, align: 'center' },
  { title: '单价', key: 'price', width: 100, align: 'center', render: (row) => `¥${row.price.toFixed(2)}` },
  { title: '销售额', key: 'amount', width: 110, align: 'center', render: (row) => `¥${row.amount.toFixed(2)}` },
  { title: '利润', key: 'profit', width: 100, align: 'center', render: (row) =>
    h('span', { style: 'color: #10B981; font-weight: 500;' }, `¥${row.profit.toFixed(2)}`)
  },
  { title: '销售时间', key: 'saleTime', width: 160, align: 'center' },
]

// 商品汇总数据
const rawData = ref<ProductItem[]>([
  { id: 1, shop: '利民街小展厅', name: 'VR体验套餐A', category: 'VR商品', sales: 286, revenue: 22880, profit: 10296, stock: 50, price: 80, profitRate: 45 },
  { id: 2, shop: '利民街小展厅', name: '可乐', category: '饮料零食', sales: 520, revenue: 1560, profit: 936, stock: 100, price: 3, profitRate: 60 },
  { id: 3, shop: '卓远萝岗区店', name: 'VR体验套餐B', category: 'VR商品', sales: 186, revenue: 16740, profit: 8035, stock: 30, price: 90, profitRate: 48 },
  { id: 4, shop: '卓远萧山区店', name: '薯片', category: '饮料零食', sales: 380, revenue: 1140, profit: 627, stock: 80, price: 3, profitRate: 55 },
  { id: 5, shop: '卓远亚运城店', name: 'VR周边T恤', category: '周边商品', sales: 48, revenue: 2880, profit: 1008, stock: 25, price: 60, profitRate: 35 },
  { id: 6, shop: '卓远文鼎路店', name: '雪碧', category: '饮料零食', sales: 420, revenue: 1260, profit: 731, stock: 90, price: 3, profitRate: 58 },
])

// 销售明细数据
const detailData = ref<SaleRecord[]>([
  { id: 1, shop: '利民街小展厅', product: 'VR体验套餐A', category: 'VR商品', buyer: '散客', quantity: 1, price: 80.00, amount: 80.00, profit: 36.00, saleTime: '2025-04-23 14:32:00' },
  { id: 2, shop: '利民街小展厅', product: 'VR体验套餐A', category: 'VR商品', buyer: '138****1234', quantity: 2, price: 80.00, amount: 160.00, profit: 72.00, saleTime: '2025-04-23 13:15:00' },
  { id: 3, shop: '利民街小展厅', product: '可乐', category: '饮料零食', buyer: '散客', quantity: 3, price: 3.00, amount: 9.00, profit: 5.40, saleTime: '2025-04-23 11:48:00' },
  { id: 4, shop: '卓远萝岗区店', product: 'VR体验套餐B', category: 'VR商品', buyer: '139****5678', quantity: 1, price: 90.00, amount: 90.00, profit: 43.20, saleTime: '2025-04-23 10:22:00' },
  { id: 5, shop: '卓远萧山区店', product: '薯片', category: '饮料零食', buyer: '散客', quantity: 5, price: 3.00, amount: 15.00, profit: 8.25, saleTime: '2025-04-23 09:55:00' },
  { id: 6, shop: '卓远亚运城店', product: 'VR周边T恤', category: '周边商品', buyer: '137****9012', quantity: 1, price: 60.00, amount: 60.00, profit: 21.00, saleTime: '2025-04-22 16:45:00' },
  { id: 7, shop: '卓远文鼎路店', product: '雪碧', category: '饮料零食', buyer: '散客', quantity: 2, price: 3.00, amount: 6.00, profit: 3.48, saleTime: '2025-04-22 14:30:00' },
  { id: 8, shop: '利民街小展厅', product: '可乐', category: '饮料零食', buyer: '136****3456', quantity: 10, price: 3.00, amount: 30.00, profit: 18.00, saleTime: '2025-04-22 11:20:00' },
  { id: 9, shop: '卓远萝岗区店', product: 'VR体验套餐B', category: 'VR商品', buyer: '散客', quantity: 1, price: 90.00, amount: 90.00, profit: 43.20, saleTime: '2025-04-22 10:15:00' },
  { id: 10, shop: '卓远萧山区店', product: '薯片', category: '饮料零食', buyer: '135****2222', quantity: 3, price: 3.00, amount: 9.00, profit: 4.95, saleTime: '2025-04-21 15:30:00' },
  { id: 11, shop: '卓远亚运城店', product: 'VR周边T恤', category: '周边商品', buyer: '散客', quantity: 2, price: 60.00, amount: 120.00, profit: 42.00, saleTime: '2025-04-21 13:10:00' },
  { id: 12, shop: '卓远文鼎路店', product: '雪碧', category: '饮料零食', buyer: '138****7890', quantity: 6, price: 3.00, amount: 18.00, profit: 10.44, saleTime: '2025-04-21 09:45:00' },
  { id: 13, shop: '利民街小展厅', product: 'VR体验套餐A', category: 'VR商品', buyer: '散客', quantity: 1, price: 80.00, amount: 80.00, profit: 36.00, saleTime: '2025-04-20 16:00:00' },
  { id: 14, shop: '卓远萝岗区店', product: 'VR体验套餐B', category: 'VR商品', buyer: '139****1111', quantity: 3, price: 90.00, amount: 270.00, profit: 129.60, saleTime: '2025-04-20 10:30:00' },
])

const filteredData = computed(() => {
  let data = rawData.value
  if (filterShop.value) {
    data = data.filter(d => d.shop === filterShop.value)
  }
  if (category.value) {
    data = data.filter(d => d.category === category.value)
  }
  return data
})

const filteredDetailData = computed(() => {
  let data = detailData.value
  if (filterShop.value) {
    data = data.filter(d => d.shop === filterShop.value)
  }
  if (category.value) {
    data = data.filter(d => d.category === category.value)
  }
  return data
})

const showDetailModal = ref(false)
const detailRecord = ref<SaleRecord | null>(null)

function openDetail(row: SaleRecord) {
  detailRecord.value = row
  showDetailModal.value = true
}

function exportData() {
  console.log('导出数据')
}
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { font-size: 20px; font-weight: 600; color: #333; margin: 0; }
.table-card { border-radius: 12px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-header h2 { font-size: 16px; font-weight: 600; color: #333; margin: 0; }
</style>
