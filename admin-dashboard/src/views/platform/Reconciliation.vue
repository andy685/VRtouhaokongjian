<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>对账中心</h1>
        <p class="header-desc">平台与门店、支付渠道的财务对账</p>
      </div>
      <n-space>
        <n-date-picker type="daterange" clearable size="small" v-model:value="dateRange" />
        <n-button type="primary" @click="refreshData">
          <template #icon><n-icon :component="RefreshOutline" /></template> 刷新
        </n-button>
      </n-space>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="CheckmarkCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">对账成功</span>
          <span class="value">1,258</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="TimeOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">待处理</span>
          <span class="value warning">23</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #EF4444, #DC2626);">
          <n-icon :component="CloseCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">异常订单</span>
          <span class="value error">5</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="ReceiptOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">退款中</span>
          <span class="value">12</span>
        </div>
      </div>
    </div>

    <div class="content-card">
      <n-tabs type="line" animated v-model:value="activeTab">
        <n-tab-pane name="exception" tab="异常订单">
          <n-data-table :columns="exceptionColumns" :data="exceptionData" :pagination="{ pageSize: 10 }" striped />
        </n-tab-pane>
        <n-tab-pane name="records" tab="对账记录">
          <n-data-table :columns="recordColumns" :data="recordData" :pagination="{ pageSize: 10 }" striped />
        </n-tab-pane>
      </n-tabs>
    </div>

    <!-- 处理异常弹窗 -->
    <n-modal v-model:show="showHandleModal" preset="card" title="处理异常订单" style="width: 560px;" :bordered="false">
      <n-descriptions v-if="currentRecord" label-placement="left" :column="2" bordered>
        <n-descriptions-item label="订单号">{{ currentRecord.orderNo }}</n-descriptions-item>
        <n-descriptions-item label="门店">{{ currentRecord.store }}</n-descriptions-item>
        <n-descriptions-item label="金额">{{ currentRecord.amount }}</n-descriptions-item>
        <n-descriptions-item label="异常类型">
          <n-tag :type="currentRecord.type === '金额异常' ? 'error' : 'warning'" size="small">{{ currentRecord.type }}</n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="异常原因" :span="2">{{ currentRecord.reason }}</n-descriptions-item>
      </n-descriptions>
      <n-divider />
      <n-form label-placement="left" label-width="80">
        <n-form-item label="处理方式">
          <n-radio-group v-model:value="handleResult">
            <n-radio value="resolved">已解决</n-radio>
            <n-radio value="refund">退款</n-radio>
            <n-radio value="ignore">忽略</n-radio>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="处理备注">
          <n-input v-model:value="handleRemark" type="textarea" placeholder="请输入处理备注" :rows="3" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showHandleModal = false">取消</n-button>
          <n-button type="primary" @click="confirmHandle">确认处理</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import {
  NButton, NDataTable, NTag, NSpace, NDatePicker, NModal,
  NForm, NFormItem, NRadioGroup, NRadio, NInput, NIcon,
  NDescriptions, NDescriptionsItem, NDivider, NTabs, NTabPane, useMessage
} from 'naive-ui'
import {
  CheckmarkCircleOutline, TimeOutline, CloseCircleOutline,
  ReceiptOutline, RefreshOutline
} from '@vicons/ionicons5'

const message = useMessage()
const dateRange = ref(null)
const activeTab = ref('exception')

const stats = ref([
  { label: '对账成功', value: '1,258', color: '#10B981' },
  { label: '待处理', value: '23', color: '#F59E0B' },
  { label: '异常订单', value: '5', color: '#EF4444' },
  { label: '退款中', value: '12', color: '#3B82F6' },
])

const exceptionColumns = [
  { title: '订单号', key: 'orderNo', width: 160 },
  { title: '门店', key: 'store', width: 160 },
  { title: '金额', key: 'amount', width: 120 },
  {
    title: '异常类型',
    key: 'type',
    width: 120,
    render(row: any) {
      return h(NTag, { type: row.type === '金额异常' ? 'error' : 'warning', size: 'small', bordered: true }, () => row.type)
    }
  },
  { title: '原因', key: 'reason', ellipsis: { tooltip: true } },
  { title: '时间', key: 'time', width: 150 },
  {
    title: '操作',
    key: 'action',
    width: 120,
    render(row: any) {
      return h(NButton, { size: 'tiny', type: 'primary', onClick: () => openHandle(row) }, () => '处理')
    }
  },
]

const exceptionData = ref([
  { id: 1, orderNo: 'VR20260419001', store: '深圳福田旗舰店', amount: '¥128.00', type: '金额异常', reason: '支付金额与订单不符', time: '2026-04-19 18:30' },
  { id: 2, orderNo: 'VR20260419002', store: '南山科技园店', amount: '¥99.00', type: '重复支付', reason: '同一订单出现两次支付记录', time: '2026-04-19 16:45' },
  { id: 3, orderNo: 'VR20260419003', store: '广州天河店', amount: '¥256.00', type: '金额异常', reason: '门店上报金额与平台记录不一致', time: '2026-04-19 14:20' },
  { id: 4, orderNo: 'VR20260419004', store: '北京朝阳店', amount: '¥68.00', type: '未到账', reason: '顾客已支付但平台未收到', time: '2026-04-19 12:10' },
  { id: 5, orderNo: 'VR20260419005', store: '上海浦东店', amount: '¥188.00', type: '重复支付', reason: '顾客重复扫码支付', time: '2026-04-19 10:30' },
])

const recordColumns = [
  { title: '对账日期', key: 'date', width: 120 },
  { title: '对账批次', key: 'batch', width: 140 },
  { title: '订单总数', key: 'totalOrders', width: 100 },
  { title: '对账金额', key: 'amount', width: 120, render: (row: any) => `¥${row.amount.toLocaleString()}` },
  {
    title: '对账状态',
    key: 'status',
    width: 120,
    render(row: any) {
      return h(NTag, { type: row.status === 'success' ? 'success' : 'warning', size: 'small', bordered: true }, () => row.statusText)
    }
  },
  { title: '差异笔数', key: 'diffCount', width: 100 },
  { title: '操作人', key: 'operator', width: 100 },
]

const recordData = [
  { id: 1, date: '2026-04-20', batch: 'RC20260420', totalOrders: 1256, amount: 185620, status: 'success', statusText: '对账成功', diffCount: 0, operator: '管理员' },
  { id: 2, date: '2026-04-19', batch: 'RC20260419', totalOrders: 1189, amount: 168430, status: 'success', statusText: '对账成功', diffCount: 2, operator: '管理员' },
  { id: 3, date: '2026-04-18', batch: 'RC20260418', totalOrders: 1320, amount: 192560, status: 'warning', statusText: '存在差异', diffCount: 5, operator: '管理员' },
]

function refreshData() {
  message.success('数据已刷新')
}

// 处理异常
const showHandleModal = ref(false)
const currentRecord = ref<any>(null)
const handleResult = ref('resolved')
const handleRemark = ref('')

function openHandle(row: any) {
  currentRecord.value = row
  handleResult.value = 'resolved'
  handleRemark.value = ''
  showHandleModal.value = true
}

function confirmHandle() {
  if (currentRecord.value) {
    const idx = exceptionData.value.findIndex(d => d.id === currentRecord.value.id)
    if (idx !== -1) {
      exceptionData.value.splice(idx, 1)
      message.success('异常订单已处理')
    }
  }
  showHandleModal.value = false
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
.stat-content .value.error { color: #EF4444; }

.content-card { background: white; border-radius: 16px; padding: 24px; border: 1px solid var(--border-color); }
</style>
