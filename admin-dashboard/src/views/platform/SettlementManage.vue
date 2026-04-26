<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>结算管理</h1>
        <p class="header-desc">管理门店结算周期与打款状态</p>
      </div>
      <n-space>
        <n-select v-model:value="filterStatus" placeholder="结算状态" :options="statusOptions" size="small" style="width: 120px;" clearable />
        <n-button type="primary" @click="showBatchModal = true">批量结算</n-button>
      </n-space>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="WalletOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">本月应付</span>
          <span class="value">¥856,234</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="CheckmarkCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">已打款</span>
          <span class="value">¥727,674</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="TimeOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">待确认</span>
          <span class="value warning">¥128,560</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
          <n-icon :component="ReceiptOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">结算笔数</span>
          <span class="value">45</span>
        </div>
      </div>
    </div>

    <div class="content-card">
      <n-data-table :columns="columns" :data="filteredData" :pagination="pagination" striped />
    </div>

    <!-- 批量结算弹窗 -->
    <n-modal v-model:show="showBatchModal" preset="card" title="批量结算" style="width: 520px;" :bordered="false">
      <p style="margin-bottom: 16px; color: #666;">选择要结算的门店记录</p>
      <n-data-table :columns="batchColumns" :data="pendingData" :pagination="false" size="small" striped />
      <template #footer>
        <n-space justify="end">
          <n-button @click="showBatchModal = false">取消</n-button>
          <n-button type="primary" @click="confirmBatch">确认批量结算</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 详情弹窗 -->
    <n-modal v-model:show="showDetailModal" preset="card" title="结算详情" style="width: 600px;" :bordered="false">
      <n-descriptions v-if="currentRecord" label-placement="left" :column="2" bordered>
        <n-descriptions-item label="结算单号">{{ currentRecord.no }}</n-descriptions-item>
        <n-descriptions-item label="门店">{{ currentRecord.store }}</n-descriptions-item>
        <n-descriptions-item label="结算周期">{{ currentRecord.period }}</n-descriptions-item>
        <n-descriptions-item label="结算金额">{{ `¥${currentRecord.amount.toLocaleString()}` }}</n-descriptions-item>
        <n-descriptions-item label="手续费">{{ `¥${currentRecord.fee}` }}</n-descriptions-item>
        <n-descriptions-item label="实际到账">{{ `¥${(currentRecord.amount - currentRecord.fee).toLocaleString()}` }}</n-descriptions-item>
        <n-descriptions-item label="状态">
          <n-tag :type="currentRecord.status === 'done' ? 'success' : currentRecord.status === 'pending' ? 'warning' : 'info'" size="small">
            {{ currentRecord.statusText }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="打款时间">{{ currentRecord.time }}</n-descriptions-item>
      </n-descriptions>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showDetailModal = false">关闭</n-button>
          <n-button v-if="currentRecord?.status === 'pending'" type="primary" @click="confirmSingle">确认结算</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NButton, NDataTable, NTag, NSpace, NSelect, NModal,
  NIcon, NDescriptions, NDescriptionsItem, useMessage
} from 'naive-ui'
import {
  WalletOutline, CheckmarkCircleOutline, TimeOutline, ReceiptOutline
} from '@vicons/ionicons5'

const message = useMessage()
const filterStatus = ref<string | null>(null)

const statusOptions = [
  { label: '已打款', value: 'done' },
  { label: '待打款', value: 'pending' },
  { label: '处理中', value: 'processing' },
]

const columns = [
  { title: '结算单号', key: 'no', width: 160 },
  { title: '门店', key: 'store', width: 160 },
  { title: '结算周期', key: 'period', width: 180 },
  { title: '结算金额', key: 'amount', width: 120, render: (row: any) => `¥${row.amount.toLocaleString()}` },
  { title: '手续费', key: 'fee', width: 100, render: (row: any) => `¥${row.fee}` },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render(row: any) {
      const typeMap: Record<string, string> = { done: 'success', pending: 'warning', processing: 'info' }
      return h(NTag, { type: typeMap[row.status] as any, size: 'small', bordered: true }, () => row.statusText)
    }
  },
  { title: '打款时间', key: 'time', width: 150 },
  {
    title: '操作',
    key: 'action',
    width: 120,
    render(row: any) {
      return h(NButton, { size: 'tiny', secondary: true, onClick: () => openDetail(row) }, () => '详情')
    }
  },
]

const settlementData = ref([
  { id: 1, no: 'ST2026042001', store: '深圳福田旗舰店', period: '2026-04-13 ~ 2026-04-19', amount: 85623, fee: 2568.69, status: 'done', statusText: '已打款', time: '2026-04-20 10:00' },
  { id: 2, no: 'ST2026042002', store: '南山科技园店', period: '2026-04-13 ~ 2026-04-19', amount: 52340, fee: 1570.20, status: 'done', statusText: '已打款', time: '2026-04-20 10:00' },
  { id: 3, no: 'ST2026042003', store: '广州天河店', period: '2026-04-13 ~ 2026-04-19', amount: 78230, fee: 2346.90, status: 'pending', statusText: '待打款', time: '-' },
  { id: 4, no: 'ST2026042004', store: '北京朝阳店', period: '2026-04-13 ~ 2026-04-19', amount: 45680, fee: 1370.40, status: 'processing', statusText: '处理中', time: '-' },
  { id: 5, no: 'ST2026042005', store: '上海浦东店', period: '2026-04-13 ~ 2026-04-19', amount: 97850, fee: 2935.50, status: 'pending', statusText: '待打款', time: '-' },
])

const pagination = { pageSize: 10 }

const filteredData = computed(() => {
  let data = [...settlementData.value]
  if (filterStatus.value) {
    data = data.filter(d => d.status === filterStatus.value)
  }
  return data
})

const pendingData = computed(() => settlementData.value.filter(d => d.status === 'pending'))

// 批量结算
const showBatchModal = ref(false)
const batchColumns = [
  { title: '门店', key: 'store' },
  { title: '结算金额', key: 'amount', render: (row: any) => `¥${row.amount.toLocaleString()}` },
  { title: '状态', key: 'status', render: () => h(NTag, { type: 'warning', size: 'tiny' }, () => '待打款') },
]

function confirmBatch() {
  let count = 0
  settlementData.value.forEach(d => {
    if (d.status === 'pending') {
      d.status = 'done'
      d.statusText = '已打款'
      d.time = new Date().toLocaleString('zh-CN')
      count++
    }
  })
  message.success(`已成功结算 ${count} 笔订单`)
  showBatchModal.value = false
}

// 详情
const showDetailModal = ref(false)
const currentRecord = ref<any>(null)

function openDetail(row: any) {
  currentRecord.value = row
  showDetailModal.value = true
}

function confirmSingle() {
  if (currentRecord.value) {
    const idx = settlementData.value.findIndex(d => d.id === currentRecord.value.id)
    if (idx !== -1) {
      settlementData.value[idx].status = 'done'
      settlementData.value[idx].statusText = '已打款'
      settlementData.value[idx].time = new Date().toLocaleString('zh-CN')
      message.success('结算成功')
    }
  }
  showDetailModal.value = false
}
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.header-desc { font-size: 13px; color: var(--text-muted); margin-top: 4px; display: block; }

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: white; border-radius: 14px; padding: 20px; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 16px; }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-content { display: flex; flex-direction: column; }
.stat-content .label { font-size: 12px; color: var(--text-muted); }
.stat-content .value { font-family: 'Orbitron', sans-serif; font-size: 22px; font-weight: 700; color: var(--text-primary); }
.stat-content .value.warning { color: #F59E0B; }

.content-card { background: white; border-radius: 16px; padding: 24px; border: 1px solid var(--border-color); }
</style>
