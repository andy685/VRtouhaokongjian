<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>订单查询</h1>
      <n-space>
        <n-input placeholder="订单号/会员手机..." size="small" style="width: 180px;">
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
        <n-select v-model:value="orderType" :options="typeOptions" size="small" style="width: 120px;" />
        <n-date-picker type="daterange" clearable size="small" v-model:value="dateRange" />
        <n-button secondary @click="exportData">导出</n-button>
      </n-space>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="DocumentTextOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">订单总数</span>
          <span class="value">1,286</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="CashOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">订单总额</span>
          <span class="value success">¥168,580</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="WalletOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">已支付</span>
          <span class="value">¥165,280</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #EF4444, #DC2626);">
          <n-icon :component="RefreshOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">退款</span>
          <span class="value">¥3,300</span>
        </div>
      </div>
    </div>

    <!-- 订单列表 -->
    <n-card class="table-card">
      <n-tabs type="line" v-model:value="activeTab">
        <n-tab name="all">全部</n-tab>
        <n-tab name="paid">已支付</n-tab>
        <n-tab name="refunded">已退款</n-tab>
        <n-tab name="pending">待支付</n-tab>
      </n-tabs>
      <n-data-table :columns="columns" :data="tableData" :pagination="pagination" />
    </n-card>

    <!-- 订单详情弹窗 -->
    <n-modal v-model:show="showDetailModal" preset="card" title="订单详情" style="width: 560px;">
      <n-descriptions :column="2" bordered label-placement="left">
        <n-descriptions-item label="订单编号">{{ currentOrder?.orderId }}</n-descriptions-item>
        <n-descriptions-item label="订单状态">
          <n-tag :type="currentOrder?.status === '已完成' ? 'success' : 'warning'" size="small">
            {{ currentOrder?.status }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="会员姓名">{{ currentOrder?.member }}</n-descriptions-item>
        <n-descriptions-item label="手机号">{{ currentOrder?.phone }}</n-descriptions-item>
        <n-descriptions-item label="订单类型">{{ currentOrder?.type }}</n-descriptions-item>
        <n-descriptions-item label="支付方式">{{ currentOrder?.payment }}</n-descriptions-item>
        <n-descriptions-item label="订单金额">¥{{ currentOrder?.amount }}</n-descriptions-item>
        <n-descriptions-item label="实付金额">¥{{ currentOrder?.paid }}</n-descriptions-item>
        <n-descriptions-item label="创建时间" :span="2">{{ currentOrder?.createTime }}</n-descriptions-item>
        <n-descriptions-item label="支付时间" :span="2">{{ currentOrder?.payTime }}</n-descriptions-item>
      </n-descriptions>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showDetailModal = false">关闭</n-button>
          <n-button v-if="currentOrder?.status === '已完成'" type="warning" @click="handleRefund">退款</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import {
  NCard, NDataTable, NButton, NSpace, NInput, NIcon, NDatePicker, NTabs, NTab,
  NSelect, NTag, NModal, NDescriptions, NDescriptionsItem
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { SearchOutline, DocumentTextOutline, CashOutline, WalletOutline, RefreshOutline } from '@vicons/ionicons5'

const orderType = ref(null)
const typeOptions = [
  { label: '全部类型', value: null },
  { label: 'VR点播', value: 'vr' },
  { label: '会员充值', value: 'recharge' },
  { label: '商品购买', value: 'product' }
]
const activeTab = ref('all')
const dateRange = ref<[number, number] | null>(null)
const showDetailModal = ref(false)
const currentOrder = ref<any>(null)
const pagination = { pageSize: 10 }

const columns: DataTableColumns = [
  { title: '订单编号', key: 'orderId', width: 180 },
  { title: '会员', key: 'member', width: 120 },
  { title: '类型', key: 'type', width: 100, render: (row) =>
    h(NTag, { size: 'small', type: row.type === 'VR点播' ? 'info' : row.type === '会员充值' ? 'success' : 'warning' },
      { default: () => row.type })
  },
  { title: '金额', key: 'amount', width: 100, render: (row) => `¥${row.amount}` },
  { title: '实付', key: 'paid', width: 100, render: (row) => `¥${row.paid}` },
  { title: '支付方式', key: 'payment', width: 100 },
  { title: '创建时间', key: 'createTime', width: 180 },
  { title: '状态', key: 'status', width: 100, render: (row) =>
    h(NTag, {
      type: row.status === '已完成' ? 'success' : row.status === '已退款' ? 'error' : 'warning',
      size: 'small'
    }, { default: () => row.status })
  },
  { title: '操作', key: 'actions', width: 100, render: (row) =>
    h(NButton, { size: 'small', text: true, type: 'primary', onClick: () => showDetail(row) },
      { default: () => '详情' })
  }
]

const tableData = ref([
  { id: 1, orderId: 'VR2026042000001', member: '张小明', type: 'VR点播', amount: 88, paid: 88, payment: '会员卡', createTime: '2026-04-20 14:30:00', payTime: '2026-04-20 14:30:05', status: '已完成' },
  { id: 2, orderId: 'CZ2026042000002', member: '李小红', type: '会员充值', amount: 500, paid: 500, payment: '微信', createTime: '2026-04-20 11:20:00', payTime: '2026-04-20 11:20:08', status: '已完成' },
  { id: 3, orderId: 'SP2026042000003', member: '王小强', type: '商品购买', amount: 68, paid: 68, payment: '支付宝', createTime: '2026-04-20 10:15:00', payTime: '2026-04-20 10:15:03', status: '已完成' },
  { id: 4, orderId: 'VR2026041900004', member: '陈小芳', type: 'VR点播', amount: 128, paid: 0, payment: '-', createTime: '2026-04-19 16:45:00', payTime: '-', status: '已退款' },
])

function showDetail(row: any) {
  currentOrder.value = row
  showDetailModal.value = true
}

function handleRefund() {
  console.log('退款操作')
}

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
