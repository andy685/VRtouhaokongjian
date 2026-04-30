<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>代理商结算管理</h1>
        <p class="header-desc">管理与代理商的分润结算单据</p>
      </div>
      <n-space>
        <n-date-picker type="daterange" clearable size="small" v-model:value="dateRange" />
        <n-select v-model:value="filterAgent" placeholder="全部代理商" :options="agentOptions" size="small" style="width: 160px;" clearable />
        <n-select v-model:value="filterStatus" placeholder="结算状态" :options="statusOptions" size="small" style="width: 120px;" clearable />
        <n-button type="primary" @click="showBatchModal = true">同步结算状态</n-button>
      </n-space>
    </div>

    <!-- 结算列表 -->
    <div class="content-card">
      <div style="display:flex;align-items:center;gap:6px;font-size:13px;color:#10B981;margin-bottom:12px;padding:10px 14px;background:#ECFDF5;border-radius:8px;">
        <n-icon :component="InformationCircleOutline" size="16" />
        <span>结算通过 <strong>拉卡拉支付</strong> 自动打款。以下状态同步操作仅用于手动更新三方回调结果，正常情况下无需手动操作。</span>
      </div>
      <n-data-table :columns="columns" :data="filteredData" :pagination="pagination" striped />
    </div>

    <!-- 详情弹窗 -->
    <n-modal v-model:show="showDetailModal" preset="card" :title="`结算详情 - ${currentRecord?.no || ''}`" style="width: 820px;" :bordered="false">
      <n-descriptions v-if="currentRecord" label-placement="left" :column="2" bordered>
        <n-descriptions-item label="结算单号">{{ currentRecord.no }}</n-descriptions-item>
        <n-descriptions-item label="代理商">{{ currentRecord.agentName }}</n-descriptions-item>
        <n-descriptions-item label="结算周期">{{ currentRecord.period }}</n-descriptions-item>
        <n-descriptions-item label="分润比例">{{ currentRecord.commissionRate }}%</n-descriptions-item>
        <n-descriptions-item label="采购总额">{{ `¥${currentRecord.purchaseAmount.toLocaleString()}` }}</n-descriptions-item>
        <n-descriptions-item label="分润金额">{{ `¥${currentRecord.commissionAmount.toLocaleString()}` }}</n-descriptions-item>
        <n-descriptions-item label="手续费率">{{ (currentRecord.feeRate * 100).toFixed(1) }}%</n-descriptions-item>
        <n-descriptions-item label="手续费">{{ `¥${currentRecord.fee.toFixed(2)}` }}</n-descriptions-item>
        <n-descriptions-item label="实际打款">
          <span style="font-weight: 600; color: var(--color-success);">¥{{ (currentRecord.commissionAmount - currentRecord.fee).toFixed(2) }}</span>
        </n-descriptions-item>
        <n-descriptions-item label="状态">
          <n-tag :type="statusType(currentRecord.status)" size="small">{{ statusLabel(currentRecord.status) }}</n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="打款时间">{{ currentRecord.transferTime || '-' }}</n-descriptions-item>
        <n-descriptions-item label="开户银行" :span="2">{{ currentRecord.bankName || '未绑定' }}</n-descriptions-item>
        <n-descriptions-item label="银行卡号" :span="2">{{ currentRecord.cardNo ? formatCardNo(currentRecord.cardNo) : '未绑定' }}</n-descriptions-item>
      </n-descriptions>

      <!-- 下属商家分润明细 -->
      <div style="margin-top: 20px;" v-if="currentRecord?.merchantDetails?.length">
        <n-divider>下属商家分润明细</n-divider>
        <n-data-table :columns="merchantDetailColumns" :data="currentRecord.merchantDetails" :pagination="false" size="small" striped />
      </div>

      <!-- 打款凭证上传 -->
      <div style="margin-top: 20px;" v-if="currentRecord?.status === 'done'">
        <n-divider>打款凭证</n-divider>
        <div v-if="currentRecord.voucher">
          <n-image :src="currentRecord.voucher" width="200" style="border-radius: 8px;" />
          <div style="margin-top: 8px;">
            <n-button size="small" @click="currentRecord.voucher = null; message.success('凭证已删除')">
              删除凭证
            </n-button>
          </div>
        </div>
        <n-upload
          v-else
          accept="image/*"
          :max="1"
          :custom-request="handleVoucherUpload"
        >
          <n-upload-dragger>
            <div style="padding: 20px 0;">
              <n-icon size="32" :depth="3"><CloudUploadOutline /></n-icon>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #666;">点击或拖拽上传打款凭证</p>
            </div>
          </n-upload-dragger>
        </n-upload>
      </div>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showDetailModal = false">关闭</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 批量结算弹窗 -->
    <n-modal v-model:show="showBatchModal" preset="card" title="同步结算状态" style="width: 600px;" :bordered="false">
      <p style="margin-bottom: 12px; color: #666;">以下为待打款记录，确认后将标记为「已打款」状态（模拟拉卡拉回调同步）。</p>
      <p style="margin-bottom: 16px; color: #F59E0B; font-size: 12px;">注意：实际生产环境中，此状态由拉卡拉回调自动更新，无需手动操作。</p>
      <n-data-table :columns="batchColumns" :data="pendingData" :pagination="false" size="small" striped />
      <template #footer>
        <n-space justify="end">
          <n-button @click="showBatchModal = false">取消</n-button>
          <n-button type="primary" @click="confirmBatch">确认同步状态</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NButton, NDataTable, NTag, NSpace, NSelect, NModal,
  NIcon, NDescriptions, NDescriptionsItem, NDatePicker, NDivider,
  NUpload, NUploadDragger, NImage, useMessage
} from 'naive-ui'
import { CloudUploadOutline, InformationCircleOutline } from '@vicons/ionicons5'

const message = useMessage()

// 筛选条件
const dateRange = ref<[number, number] | null>(null)
const filterAgent = ref<string | null>(null)
const filterStatus = ref<string | null>(null)

const agentOptions = [
  { label: '深圳未来科技', value: 1 },
  { label: '北京梦想空间', value: 2 },
  { label: '上海星际娱乐', value: 3 },
  { label: '成都虚拟现实', value: 4 },
  { label: '武汉创新体验', value: 5 },
]

const statusOptions = [
  { label: '已打款', value: 'done' },
  { label: '待打款', value: 'pending' },
  { label: '处理中', value: 'processing' },
]

// 表格列定义
const columns = [
  { title: '结算单号', key: 'no', width: 150 },
  { title: '代理商', key: 'agentName', width: 130 },
  { title: '结算周期', key: 'period', width: 170 },
  { title: '采购总额', key: 'purchaseAmount', width: 120, render: (row: any) => `¥${row.purchaseAmount.toLocaleString()}` },
  {
    title: '分润比例',
    key: 'commissionRate',
    width: 80,
    render: (row: any) => `${row.commissionRate}%`
  },
  {
    title: '分润金额',
    key: 'commissionAmount',
    width: 110,
    render: (row: any) => h('span', { style: 'font-weight: 600; color: #3B82F6;' }, `¥${row.commissionAmount.toLocaleString()}`)
  },
  {
    title: '手续费',
    key: 'fee',
    width: 90,
    render: (row: any) => `¥${row.fee.toFixed(2)}`
  },
  {
    title: '实付金额',
    key: 'actualPay',
    width: 110,
    render: (row: any) => h('span', { style: 'font-weight: 600; color: #10B981;' }, `¥${(row.commissionAmount - row.fee).toFixed(2)}`)
  },
  {
    title: '状态',
    key: 'status',
    width: 85,
    render(row: any) {
      return h(NTag, { type: statusType(row.status), size: 'small', bordered: true }, () => statusLabel(row.status))
    }
  },
  { title: '打款时间', key: 'transferTime', width: 150 },
  {
    title: '操作',
    key: 'action',
    width: 90,
    render(row: any) {
      return h(NButton, { size: 'tiny', secondary: true, onClick: () => openDetail(row) }, () => '详情')
    }
  },
]

function formatCardNo(cardNo: string) {
  if (!cardNo) return ''
  return cardNo.replace(/(\d{4})(?=\d)/g, '$1 ')
}

function statusType(status: string) {
  const map: Record<string, string> = { done: 'success', pending: 'warning', processing: 'info' }
  return map[status] || 'default'
}
function statusLabel(status: string) {
  const map: Record<string, string> = { done: '已打款', pending: '待打款', processing: '处理中' }
  return map[status] || status
}

// Mock 数据
const settlementData = ref([
  {
    id: 1, no: 'AS2026042001', agentId: 1, agentName: '深圳未来科技',
    period: '2026-04-13 ~ 2026-04-19', purchaseAmount: 856200, commissionRate: 15,
    commissionAmount: 128430, feeRate: 0.005, fee: 642.15,
    status: 'done', transferTime: '2026-04-20 10:00',
    bankName: 'ICBC', cardNo: '6222021234567890123',
    voucher: '',
    merchantDetails: [
      { merchant: '恒然集团', purchaseAmount: 156800, commission: 23520, fee: 117.60 },
      { merchant: '南山科创', purchaseAmount: 134600, commission: 20190, fee: 100.95 },
      { merchant: '利民街商家', purchaseAmount: 0, commission: 0, fee: 0 },
    ]
  },
  {
    id: 2, no: 'AS2026042002', agentId: 3, agentName: '上海星际娱乐',
    period: '2026-04-13 ~ 2026-04-19', purchaseAmount: 1056800, commissionRate: 18,
    commissionAmount: 190224, feeRate: 0.006, fee: 1141.34,
    status: 'pending', transferTime: '-',
    bankName: '', cardNo: '',
    merchantDetails: [
      { merchant: '幻影星空', purchaseAmount: 98500, commission: 17730, fee: 106.38 },
      { merchant: '华东展厅', purchaseAmount: 89200, commission: 16056, fee: 96.34 },
    ]
  },
  {
    id: 3, no: 'AS2026041301', agentId: 2, agentName: '北京梦想空间',
    period: '2026-04-06 ~ 2026-04-12', purchaseAmount: 623400, commissionRate: 12,
    commissionAmount: 74808, feeRate: 0.005, fee: 374.04,
    status: 'pending', transferTime: '-',
    bankName: 'CCB', cardNo: '6227001234567890123',
    merchantDetails: [
      { merchant: '利民街商家', purchaseAmount: 112000, commission: 13440, fee: 67.20 },
    ]
  },
  {
    id: 4, no: 'AS2026041302', agentId: 4, agentName: '成都虚拟现实',
    period: '2026-04-06 ~ 2026-04-12', purchaseAmount: 312500, commissionRate: 10,
    commissionAmount: 31250, feeRate: 0.004, fee: 125.00,
    status: 'processing', transferTime: '-',
    bankName: 'ABC', cardNo: '6228481234567890123',
    merchantDetails: [
      { merchant: '党建馆集团', purchaseAmount: 56800, commission: 5680, fee: 22.72 },
    ]
  },
])

const pagination = { pageSize: 10 }

const filteredData = computed(() => {
  let data = [...settlementData.value]
  if (filterAgent.value) data = data.filter(d => d.agentId === filterAgent.value)
  if (filterStatus.value) data = data.filter(d => d.status === filterStatus.value)
  return data
})

// 商家明细表格列
const merchantDetailColumns = [
  { title: '下属商家', key: 'merchant', width: 140 },
  { title: '采购金额', key: 'purchaseAmount', width: 120, render: (row: any) => `¥${row.purchaseAmount.toLocaleString()}` },
  { title: '分润金额', key: 'commission', width: 110, render: (row: any) => `¥${row.commission.toLocaleString()}` },
  { title: '手续费', key: 'fee', width: 100, render: (row: any) => `¥${row.fee.toFixed(2)}` },
]

// 详情
const showDetailModal = ref(false)
const currentRecord = ref<any>(null)

function openDetail(row: any) {
  currentRecord.value = row
  showDetailModal.value = true
}

// 批量结算
const showBatchModal = ref(false)
const batchColumns = [
  { title: '代理商', key: 'agentName' },
  { title: '结算周期', key: 'period', width: 170 },
  { title: '分润金额', key: 'commissionAmount', render: (row: any) => `¥${row.commissionAmount.toLocaleString()}` },
  { title: '状态', key: 'status', render: () => h(NTag, { type: 'warning', size: 'tiny' }, () => '待打款') },
]

const pendingData = computed(() => settlementData.value.filter(d => d.status === 'pending'))

function confirmBatch() {
  let count = 0
  settlementData.value.forEach(d => {
    if (d.status === 'pending') {
      d.status = 'done'
      d.transferTime = new Date().toLocaleString('zh-CN')
      count++
    }
  })
  message.success(`已同步 ${count} 笔结算状态为「已打款」`)
  showBatchModal.value = false
}

// 上传打款凭证
function handleVoucherUpload({ file, onFinish }: any) {
  if (!currentRecord.value) return
  const reader = new FileReader()
  reader.onload = (e) => {
    const idx = settlementData.value.findIndex(d => d.id === currentRecord.value.id)
    if (idx !== -1) {
      settlementData.value[idx].voucher = e.target?.result as string
      message.success('凭证上传成功')
    }
    onFinish()
  }
  reader.readAsDataURL(file.file)
}
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.header-desc { font-size: 13px; color: var(--text-muted); margin-top: 4px; display: block; }

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: white; border-radius: 14px; padding: 20px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 6px; }
.stat-label { font-size: 12px; color: var(--text-muted); }
.stat-value { font-family: 'Orbitron', sans-serif; font-size: 22px; font-weight: 700; color: var(--text-primary); }
.stat-value.warning { color: #F59E0B; }
.stat-value.success { color: #10B981; }
.stat-value.info { color: #3B82F6; }
.stat-sub { font-size: 11px; color: var(--text-muted); }

.content-card { background: white; border-radius: 16px; padding: 24px; border: 1px solid var(--border-color); }
</style>
