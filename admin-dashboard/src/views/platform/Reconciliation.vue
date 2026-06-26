<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>异常订单汇总</h1>
        <p class="header-desc">汇总各商家提交的异常订单与平台巡检发现的异常，统一审核处理</p>
        <n-button text size="small" type="primary" @click="showHelp = !showHelp" style="padding:0;margin-top:2px;">
          {{ showHelp ? '收起说明 ▲' : '规则说明 ▼' }}
        </n-button>
      </div>
      <n-button type="primary" @click="refreshData">
        <template #icon><n-icon :component="RefreshOutline" /></template> 刷新
      </n-button>
    </div>

    <!-- 说明 -->
    <div v-show="showHelp" class="help-card">
      <h4 style="margin-bottom:8px;">异常订单处理说明</h4>
      <n-descriptions :column="1" label-placement="left" bordered size="small">
        <n-descriptions-item label="数据来源">汇总两部分异常：商家对账后自行提交的异常订单 + 平台自动巡检发现的异常订单。</n-descriptions-item>
        <n-descriptions-item label="处理方式">点击「处理」，可审核通过（标记已解决）、直接退款、或驳回商家重新处理。</n-descriptions-item>
        <n-descriptions-item label="异常类型">金额异常：渠道到账与订单金额不一致；重复支付：同一订单多次到账；未到账：渠道已扣款但平台无记录。</n-descriptions-item>
      </n-descriptions>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: #E0F2FE;"><n-icon :component="RefreshOutline" size="22" color="#3B82F6" /></div>
        <div class="stat-content">
          <span class="label">商家提交</span>
          <span class="value warning">{{ stats.merchantSubmit }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: #FEF3C7;"><n-icon :component="RefreshOutline" size="22" color="#F59E0B" /></div>
        <div class="stat-content">
          <span class="label">平台巡检</span>
          <span class="value warning">{{ stats.platformInspect }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: #D1FAE5;"><n-icon :component="RefreshOutline" size="22" color="#10B981" /></div>
        <div class="stat-content">
          <span class="label">已处理</span>
          <span class="value" style="color:#10B981;">{{ stats.resolved }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: #FEE2E2;"><n-icon :component="RefreshOutline" size="22" color="#EF4444" /></div>
        <div class="stat-content">
          <span class="label">待处理</span>
          <span class="value error">{{ stats.pending }}</span>
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

    <!-- 处理异常弹窗（平台端：审核处理） -->
    <n-modal v-model:show="showHandleModal" preset="card" title="审核处理异常订单" style="width: 560px;" :bordered="false">
      <n-descriptions v-if="currentRecord" label-placement="left" :column="2" bordered>
        <n-descriptions-item label="订单号">{{ currentRecord.orderNo }}</n-descriptions-item>
        <n-descriptions-item label="店铺">{{ currentRecord.store }}</n-descriptions-item>
        <n-descriptions-item label="金额">{{ currentRecord.amount }}</n-descriptions-item>
        <n-descriptions-item label="异常类型">
          <n-tag :type="currentRecord.type === '金额异常' ? 'error' : 'warning'" size="small">{{ currentRecord.type }}</n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="来源">{{ currentRecord.source || '未知' }}</n-descriptions-item>
        <n-descriptions-item label="异常原因" :span="2">{{ currentRecord.reason }}</n-descriptions-item>
      </n-descriptions>
      <n-divider />
      <n-form label-placement="left" label-width="80">
        <n-form-item label="审核结果">
          <n-radio-group v-model:value="handleResult">
            <n-radio value="resolved">通过（已解决）</n-radio>
            <n-radio value="refund">退款</n-radio>
            <n-radio value="reject">驳回商家</n-radio>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="处理备注">
          <n-input v-model:value="handleRemark" type="textarea" placeholder="请输入处理备注（驳回时必填原因）" :rows="3" />
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
import { ref, h, computed } from 'vue'
import {
  NButton, NDataTable, NTag, NSpace, NModal,
  NForm, NFormItem, NRadioGroup, NRadio, NInput, NIcon,
  NDescriptions, NDescriptionsItem, NDivider, NTabs, NTabPane, useMessage
} from 'naive-ui'
import {
  RefreshOutline
} from '@vicons/ionicons5'

const message = useMessage()
const activeTab = ref('exception')
const showHelp = ref(false)



const exceptionColumns = [
  { title: '订单号', key: 'orderNo', width: 160 },
  { title: '店铺', key: 'store', width: 160 },
  { title: '金额', key: 'amount', width: 120 },
  {
    title: '异常类型',
    key: 'type',
    width: 120,
    render(row: any) {
      const typeMap: Record<string, any> = { '金额异常': 'error', '重复支付': 'warning', '未到账': 'info', '退款异常': 'error' }
      return h(NTag, { type: typeMap[row.type] || 'warning', size: 'small', bordered: true }, () => row.type)
    }
  },
  { title: '来源', key: 'source', width: 100 },
  { title: '原因', key: 'reason', ellipsis: { tooltip: true } },
  { title: '时间', key: 'time', width: 150 },
  {
    title: '处理状态',
    key: 'status',
    width: 100,
    render(row: any) {
      if (row.status === 'resolved') {
        return h(NTag, { type: 'success' as const, size: 'small' }, () => '已处理')
      }
      if (row.status === 'rejected') {
        return h(NTag, { type: 'error' as const, size: 'small' }, () => '已驳回')
      }
      if (row.status === 'escalated') {
        return h(NTag, { type: 'info' as const, size: 'small' }, () => '商家重提')
      }
      return h(NTag, { type: 'warning' as const, size: 'small' }, () => '待处理')
    }
  },
  {
    title: '处理备注',
    key: 'handleRemark',
    width: 160,
    ellipsis: { tooltip: true },
    render(row: any) {
      return row.handleRemark || '-'
    }
  },
  {
    title: '操作',
    key: 'action',
    width: 100,
    render(row: any) {
      const label = row.status === 'resolved' ? '查看' : '处理'
      return h(NButton, { size: 'tiny', type: 'primary', onClick: () => openHandle(row) }, () => label)
    }
  },
]

const exceptionData = ref([
  { id: 1, orderNo: 'VR20260419001', store: '深圳福田旗舰店', amount: '¥128.00', type: '金额异常', reason: '渠道到账 ¥128.00，订单金额 ¥148.00，差额 ¥20.00', time: '2026-04-19 18:30', status: 'pending', handleRemark: '', source: '商家提交' },
  { id: 2, orderNo: 'VR20260419002', store: '南山科技园店', amount: '¥99.00', type: '重复支付', reason: '订单 #VR20260419002 在支付宝渠道出现 2 笔到账', time: '2026-04-19 16:45', status: 'pending', handleRemark: '', source: '商家提交' },
  { id: 3, orderNo: 'VR20260419003', store: '广州天河店', amount: '¥256.00', type: '金额异常', reason: '渠道到账 ¥240.00，订单金额 ¥256.00，差额 ¥16.00', time: '2026-04-19 14:20', status: 'pending', handleRemark: '', source: '平台巡检' },
  { id: 4, orderNo: 'VR20260419004', store: '北京朝阳店', amount: '¥68.00', type: '未到账', reason: '微信支付已扣款 ¥68.00，但平台无对应订单记录', time: '2026-04-19 12:10', status: 'pending', handleRemark: '', source: '平台巡检' },
  { id: 5, orderNo: 'VR20260419005', store: '上海浦东店', amount: '¥188.00', type: '重复支付', reason: '顾客同一订单重复扫码支付', time: '2026-04-19 10:30', status: 'rejected', handleRemark: '请提供退款凭证截图，核实后重新提交', source: '商家提交' },
  { id: 6, orderNo: 'VR20260419006', store: '深圳福田旗舰店', amount: '¥320.00', type: '未到账', reason: '银行扣款成功但平台无订单记录', time: '2026-04-18 15:45', status: 'rejected', handleRemark: '银行流水显示付款方非本店铺客户，请确认订单归属', source: '商家提交' },
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

const recordData = ref([
  { id: 1, date: '2026-04-20', batch: 'RC20260420', totalOrders: 1256, amount: 185620, status: 'success', statusText: '对账成功', diffCount: 0, operator: '管理员' },
  { id: 2, date: '2026-04-19', batch: 'RC20260419', totalOrders: 1189, amount: 168430, status: 'success', statusText: '对账成功', diffCount: 2, operator: '管理员' },
  { id: 3, date: '2026-04-18', batch: 'RC20260418', totalOrders: 1320, amount: 192560, status: 'warning', statusText: '存在差异', diffCount: 5, operator: '管理员' },
])

// 统计数据（必须在 recordData / exceptionData 之后定义）
const stats = computed(() => {
  const resolved = exceptionData.value.filter((e: any) => e.status === 'resolved').length
  const pending = exceptionData.value.filter((e: any) => e.status === 'pending').length
  const merchantSubmit = exceptionData.value.filter((e: any) => e.source === '商家提交').length
  const platformInspect = exceptionData.value.filter((e: any) => e.source === '平台巡检').length
  return { resolved, pending, merchantSubmit, platformInspect }
})

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
  handleRemark.value = row.handleRemark || ''
  showHandleModal.value = true
}

function confirmHandle() {
  if (currentRecord.value) {
    const idx = exceptionData.value.findIndex(d => d.id === currentRecord.value.id)
    if (idx !== -1) {
      exceptionData.value[idx].handleRemark = handleRemark.value
      if (handleResult.value === 'resolved') {
        exceptionData.value[idx].status = 'resolved'
        message.success('异常订单已审核通过并标记已处理')
      } else if (handleResult.value === 'refund') {
        exceptionData.value[idx].status = 'resolved'
        message.success('已发起退款流程')
      } else if (handleResult.value === 'reject') {
        if (!handleRemark.value.trim()) {
          message.warning('驳回时必须填写处理备注（驳回原因）')
          return
        }
        exceptionData.value[idx].status = 'rejected'
        message.success('已驳回至商家重新处理')
      }
    }
  }
  showHandleModal.value = false
}

</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.header-desc { font-size: 13px; color: var(--text-muted); margin-top: 4px; display: block; }

.help-card { background: #F0F9FF; border-radius: 12px; padding: 16px 20px; margin-bottom: 20px; border: 1px solid #BAE6FD; }
.help-card h4 { margin: 0 0 8px 0; font-size: 15px; color: var(--text-primary); }

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
