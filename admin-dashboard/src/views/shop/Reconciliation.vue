<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>异常订单</h1>
        <p class="header-desc">集中处理店铺订单异常，支持自行关闭或提交平台复核</p>
        <n-button text size="small" type="primary" @click="showHelp = !showHelp" style="padding:0;margin-top:2px;">
          {{ showHelp ? '收起说明 ▲' : '处理规则说明 ▼' }}
        </n-button>
      </div>
      <n-button type="primary" @click="refreshData">
        <template #icon><n-icon :component="RefreshOutline" /></template> 刷新
      </n-button>
    </div>

    <div v-show="showHelp" class="help-card">
      <h4 style="margin-bottom:8px;">异常订单使用说明</h4>
      <n-descriptions :column="1" label-placement="left" bordered size="small">
        <n-descriptions-item label="数据来源">订单列表页手动标记的异常订单，以及历史遗留的自动识别异常。</n-descriptions-item>
        <n-descriptions-item label="商家处理">确认无误可标记为已处理；如需平台介入，可提交平台审核。</n-descriptions-item>
        <n-descriptions-item label="驳回重提">平台驳回后，商家可补充说明并重新提交，或自行解决后关闭。</n-descriptions-item>
      </n-descriptions>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: #FEF3C7;"><n-icon :component="TimeOutline" size="22" color="#F59E0B" /></div>
        <div class="stat-content">
          <span class="label">待处理</span>
          <span class="value warning">{{ stats.pending }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: #E0F2FE;"><n-icon :component="RefreshOutline" size="22" color="#3B82F6" /></div>
        <div class="stat-content">
          <span class="label">平台处理中</span>
          <span class="value info">{{ stats.escalated }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: #FEE2E2;"><n-icon :component="CloseCircleOutline" size="22" color="#EF4444" /></div>
        <div class="stat-content">
          <span class="label">已驳回</span>
          <span class="value error">{{ stats.rejected }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: #D1FAE5;"><n-icon :component="CheckmarkCircleOutline" size="22" color="#10B981" /></div>
        <div class="stat-content">
          <span class="label">已处理</span>
          <span class="value success">{{ stats.resolved }}</span>
        </div>
      </div>
    </div>

    <div class="content-card">
      <n-data-table :columns="exceptionColumns" :data="exceptionData" :pagination="{ pageSize: 10 }" striped />
    </div>

    <n-modal v-model:show="showHandleModal" preset="card" title="处理异常订单" style="width: 560px;" :bordered="false">
      <n-descriptions v-if="currentRecord" label-placement="left" :column="2" bordered>
        <n-descriptions-item label="订单号">{{ currentRecord.orderNo }}</n-descriptions-item>
        <n-descriptions-item label="店铺">{{ currentRecord.store }}</n-descriptions-item>
        <n-descriptions-item label="金额">{{ currentRecord.amount }}</n-descriptions-item>
        <n-descriptions-item label="异常类型">
          <n-tag :type="currentRecord.type === '金额异常' ? 'error' : 'warning'" size="small">{{ currentRecord.type }}</n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="当前状态">
          <n-tag v-if="currentRecord.status === 'rejected'" type="error" size="small">已驳回</n-tag>
          <n-tag v-else-if="currentRecord.status === 'escalated'" type="info" size="small">平台处理中</n-tag>
          <n-tag v-else-if="currentRecord.status === 'resolved'" type="success" size="small">已处理</n-tag>
          <n-tag v-else type="warning" size="small">待处理</n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="异常原因" :span="2">{{ currentRecord.reason }}</n-descriptions-item>
        <n-descriptions-item v-if="currentRecord.status === 'rejected' && currentRecord.handleRemark" label="驳回原因" :span="2">
          <span style="color: #EF4444; font-weight: 500;">{{ currentRecord.handleRemark }}</span>
        </n-descriptions-item>
      </n-descriptions>
      <n-divider />
      <n-alert v-if="currentRecord?.status === 'rejected'" type="warning" style="margin-bottom: 16px;" :show-icon="false">
        该订单已被平台驳回，请补充说明后重新提交，或自行处理后关闭。
      </n-alert>
      <n-form label-placement="left" label-width="80">
        <n-form-item label="处理方式">
          <n-radio-group v-if="currentRecord?.status === 'rejected'" v-model:value="handleResult">
            <n-radio value="re_escalate">补充说明后重新提交</n-radio>
            <n-radio value="resolved">自行解决</n-radio>
          </n-radio-group>
          <n-radio-group v-else v-model:value="handleResult">
            <n-radio value="resolved">已解决</n-radio>
            <n-radio value="escalate">提交平台</n-radio>
            <n-radio value="ignore">忽略并移除</n-radio>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="处理备注">
          <n-input v-model:value="handleRemark" type="textarea" :placeholder="currentRecord?.status === 'rejected' ? '请输入补充说明' : '请输入处理备注'" :rows="3" />
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
import { computed, h, ref } from 'vue'
import {
  NAlert,
  NButton,
  NDataTable,
  NDescriptions,
  NDescriptionsItem,
  NDivider,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NModal,
  NRadio,
  NRadioGroup,
  NSpace,
  NTag,
  useMessage,
} from 'naive-ui'
import {
  CheckmarkCircleOutline,
  CloseCircleOutline,
  RefreshOutline,
  TimeOutline,
} from '@vicons/ionicons5'
import { useExceptionOrders } from '@/composables/useExceptionOrders'

const message = useMessage()
const { exceptionOrders: exceptionData } = useExceptionOrders()
const showHelp = ref(false)

const stats = computed(() => ({
  pending: exceptionData.value.filter(item => item.status === 'pending').length,
  escalated: exceptionData.value.filter(item => item.status === 'escalated').length,
  rejected: exceptionData.value.filter(item => item.status === 'rejected').length,
  resolved: exceptionData.value.filter(item => item.status === 'resolved').length,
}))

const exceptionColumns = [
  { title: '订单号', key: 'orderNo', width: 160 },
  { title: '店铺', key: 'store', width: 160 },
  { title: '金额', key: 'amount', width: 120 },
  {
    title: '异常类型',
    key: 'type',
    width: 120,
    render(row: any) {
      return h(NTag, { type: row.type === '金额异常' ? 'error' : 'warning', size: 'small', bordered: true }, () => row.type)
    },
  },
  { title: '来源', key: 'source', width: 100 },
  { title: '原因', key: 'reason', ellipsis: { tooltip: true } },
  { title: '时间', key: 'time', width: 160 },
  {
    title: '处理状态',
    key: 'status',
    width: 100,
    render(row: any) {
      if (row.status === 'resolved') return h(NTag, { type: 'success' as const, size: 'small' }, () => '已处理')
      if (row.status === 'escalated') return h(NTag, { type: 'info' as const, size: 'small' }, () => '平台处理中')
      if (row.status === 'rejected') return h(NTag, { type: 'error' as const, size: 'small' }, () => '已驳回')
      return h(NTag, { type: 'warning' as const, size: 'small' }, () => '待处理')
    },
  },
  {
    title: '处理备注',
    key: 'handleRemark',
    width: 180,
    ellipsis: { tooltip: true },
    render(row: any) {
      return row.handleRemark || '-'
    },
  },
  {
    title: '操作',
    key: 'action',
    width: 100,
    render(row: any) {
      const label = row.status === 'resolved' ? '查看' : row.status === 'rejected' ? '重新处理' : '处理'
      const btnType = row.status === 'resolved' ? 'default' : 'primary'
      return h(NButton, { size: 'tiny', type: btnType, onClick: () => openHandle(row) }, () => label)
    },
  },
]

function refreshData() {
  message.success('异常订单数据已刷新')
}

const showHandleModal = ref(false)
const currentRecord = ref<any>(null)
const handleResult = ref('resolved')
const handleRemark = ref('')

function openHandle(row: any) {
  currentRecord.value = row
  handleResult.value = row.status === 'rejected' ? 're_escalate' : 'resolved'
  handleRemark.value = row.status === 'rejected' ? '' : (row.handleRemark || '')
  showHandleModal.value = true
}

function confirmHandle() {
  if (!currentRecord.value) {
    showHandleModal.value = false
    return
  }

  const idx = exceptionData.value.findIndex(item => item.id === currentRecord.value.id)
  if (idx === -1) {
    showHandleModal.value = false
    return
  }

  exceptionData.value[idx].handleRemark = handleRemark.value

  if (handleResult.value === 'resolved') {
    exceptionData.value[idx].status = 'resolved'
    message.success('异常订单已标记为已处理')
  } else if (handleResult.value === 'escalate') {
    exceptionData.value[idx].status = 'escalated'
    exceptionData.value[idx].source = '商家提交'
    message.success('异常订单已提交平台处理')
  } else if (handleResult.value === 're_escalate') {
    exceptionData.value[idx].status = 'escalated'
    exceptionData.value[idx].source = '商家提交'
    message.success('异常订单已重新提交平台审核')
  } else {
    exceptionData.value.splice(idx, 1)
    message.success('异常订单已移除')
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
.stat-content .value.info { color: #3B82F6; }
.stat-content .value.error { color: #EF4444; }
.stat-content .value.success { color: #10B981; }

.content-card { background: white; border-radius: 16px; padding: 24px; border: 1px solid var(--border-color); }
</style>
