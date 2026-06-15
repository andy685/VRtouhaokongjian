<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>结算记录</h1>
        <p class="header-desc">查看分润结算记录（平台到期自动结算打款）</p>
      </div>
      <n-space>
        <n-date-picker
          v-model:value="filterDateRange"
          type="daterange"
          clearable
          size="small"
          style="width: 240px;"
          placeholder="选择日期范围"
        />
        <n-select v-model:value="filterStatus" placeholder="结算状态" :options="statusOptions" size="small" style="width: 120px;" clearable />
        <n-button @click="exportToExcel">
          <template #icon>
            <n-icon :component="DownloadOutline" />
          </template>
          导出Excel
        </n-button>
      </n-space>
    </div>

    <!-- 统计卡片（与商家端一致） -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="WalletOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">累计分润</span>
          <span class="value">¥{{ totalCommission.toLocaleString() }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="CheckmarkCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">已到账</span>
          <span class="value">¥{{ totalPaid.toLocaleString() }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="TimeOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">待结算</span>
          <span class="value warning">¥{{ totalPending.toLocaleString() }}</span>
        </div>
      </div>
    </div>

    <!-- 结算表格 -->
    <div class="content-card">
      <div class="table-hint" style="flex-wrap: wrap;">
        <n-icon :component="InformationCircleOutline" size="16" style="color:#10B981;flex-shrink:0;" />
        <span>本系统通过 <strong>拉卡拉支付</strong> 自动完成分润打款，到期自动结算至绑定银行账户。</span>
        <span style="color:var(--text-muted); margin-left: 4px;">如遇状态未及时更新，可手动同步拉卡拉回调结果。</span>
        <div style="width: 100%; margin-top: 4px; color:var(--text-secondary);">
          到账计算：<strong>分润 =（采购额 − 供应商成本）× 分润比例，实际到账 = 分润金额 − 银行手续费</strong>
          <span style="color:#F59E0B; margin-left: 4px;">（手续费按分润金额的 0.5% 收取）</span>
        </div>
      </div>
      <n-data-table :columns="columns" :data="filteredData" :pagination="pagination" striped />
    </div>

    <!-- 详情弹窗 -->
    <n-modal v-model:show="showDetailModal" preset="card" :title="`结算明细 - ${currentRecord?.no || ''}`" style="width: 800px;" :bordered="false">
      <n-descriptions v-if="currentRecord" label-placement="left" :column="2" bordered>
        <n-descriptions-item label="结算单号">{{ currentRecord.no }}</n-descriptions-item>
        <n-descriptions-item label="结算周期">{{ currentRecord.period }}</n-descriptions-item>
        <n-descriptions-item label="充值总额">{{ `¥${currentRecord.rechargeAmount.toLocaleString()}` }}</n-descriptions-item>
        <n-descriptions-item label="供应商成本">{{ `¥${(currentRecord.supplierCost || 0).toLocaleString()}` }}</n-descriptions-item>
        <n-descriptions-item label="分润基数">{{ `¥${((currentRecord.rechargeAmount - (currentRecord.supplierCost || 0))).toLocaleString()}` }}</n-descriptions-item>
        <n-descriptions-item label="分润金额">{{ `¥${currentRecord.amount.toLocaleString()}` }}</n-descriptions-item>
        <n-descriptions-item label="手续费">{{ `¥${currentRecord.fee}` }}</n-descriptions-item>
        <n-descriptions-item label="实际到账">{{ `¥${(currentRecord.amount - currentRecord.fee).toLocaleString()}` }}</n-descriptions-item>
        <n-descriptions-item label="状态">
          <n-tag :type="currentRecord.status === 'done' ? 'success' : currentRecord.status === 'pending' ? 'warning' : 'info'" size="small">
            {{ currentRecord.statusText }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="打款时间">{{ currentRecord.time || '-' }}</n-descriptions-item>
      </n-descriptions>

      <!-- 商家明细 -->
      <div style="margin-top: 20px;" v-if="currentRecord?.merchantDetails?.length">
        <n-divider>商家分润明细</n-divider>
        <n-data-table
          :columns="merchantDetailColumns"
          :data="currentRecord.merchantDetails"
          :pagination="false"
          size="small"
          striped
        />
      </div>

      <!-- 打款凭证 / 上传收款凭证 -->
      <div style="margin-top: 20px;" v-if="currentRecord?.status === 'done' || currentRecord?.status === 'processing'">
        <n-divider>凭证管理</n-divider>
        <!-- 平台打款凭证（只读） -->
        <div style="margin-bottom: 16px;">
          <p style="font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--text-primary);">平台打款凭证</p>
          <div v-if="currentRecord.voucher">
            <n-image
              :src="currentRecord.voucher"
              width="200"
              style="border-radius: 8px;"
            />
            <p style="margin-top: 8px; font-size: 12px; color: #999;">
              此为平台上传的打款凭证，如有疑问请联系平台运营
            </p>
          </div>
          <n-empty v-else description="暂无打款凭证" size="small" />
        </div>
      </div>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showDetailModal = false">关闭</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NButton, NDataTable, NTag, NSpace, NSelect, NModal,
  NIcon, NDescriptions, NDescriptionsItem, NDatePicker, NImage, NEmpty, NDivider,
  useMessage
} from 'naive-ui'
import {
  WalletOutline, CheckmarkCircleOutline, TimeOutline, DownloadOutline,
  InformationCircleOutline
} from '@vicons/ionicons5'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

const message = useMessage()

// 筛选条件
const filterStatus = ref<string | null>(null)
const filterDateRange = ref<[number, number] | null>(null)

// 状态与商家端一致：已打款 / 待打款 / 处理中
const statusOptions = [
  { label: '已打款', value: 'done' },
  { label: '待打款', value: 'pending' },
  { label: '处理中', value: 'processing' },
]

// 商家明细列
const merchantDetailColumns = [
  { title: '商家名称', key: 'merchant', width: 140 },
  { title: '充值金额', key: 'rechargeAmount', width: 110, render: (row: any) => `¥${row.rechargeAmount.toLocaleString()}` },
  { title: '供应商成本', key: 'supplierCost', width: 100, render: (row: any) => `¥${(row.supplierCost || 0).toLocaleString()}` },
  { title: '分润比例', key: 'rate', width: 80 },
  { title: '分润金额', key: 'amount', width: 110, render: (row: any) => `¥${row.amount.toLocaleString()}` },
]

// 表格列定义
const columns = [
  { title: '结算单号', key: 'no', width: 150 },
  { title: '结算周期', key: 'period', width: 140 },
  { title: '分润金额', key: 'amount', width: 120, render: (row: any) => `¥${row.amount.toLocaleString()}` },
  {
    title: '手续费',
    key: 'fee',
    width: 100,
    render: (row: any) => h('span', { style: 'color:#F59E0B' }, `¥${row.fee.toFixed(2)}`),
    sorter: (a: any, b: any) => a.fee - b.fee,
  },
  { title: '实际到账', key: 'actualAmount', width: 120, render: (row: any) => `¥${(row.amount - row.fee).toLocaleString()}` },
  {
    title: '状态',
    key: 'status',
    width: 90,
    render(row: any) {
      const typeMap: Record<string, string> = { done: 'success', pending: 'warning', processing: 'info' }
      return h(NTag, { type: typeMap[row.status] as any, size: 'small', bordered: true }, () => row.statusText)
    }
  },
  { title: '打款时间', key: 'time', width: 140 },
  {
    title: '操作',
    key: 'action',
    width: 120,
    render(row: any) {
      return h(NButton, { size: 'tiny', secondary: true, onClick: () => openDetail(row) }, () => '查看明细')
    }
  },
]

// 模拟数据 —— 分润 =（采购额 − 供应商成本）× 分润比例
const settlementData = ref([
  {
    id: 1,
    no: 'AS2026042001',
    period: '2026-04-13 ~ 2026-04-19',
    rechargeAmount: 890300,
    supplierCost: 489665,
    amount: 53418,
    feeRate: 0.005,
    fee: 267.09,
    status: 'done',
    statusText: '已打款',
    time: '2026-04-20 14:00',
    voucher: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="280"><rect width="200" height="280" fill="#EEF2FF" rx="8"/><rect x="40" y="30" width="120" height="30" fill="#4F46E5" rx="4" opacity="0.8"/><rect x="30" y="80" width="140" height="2" fill="#C7D2FE"/><text x="100" y="100" text-anchor="middle" font-size="9" fill="#6366F1">拉卡拉电子回执</text><text x="100" y="120" text-anchor="middle" font-size="9" fill="#374151">付款方：头号空间平台</text><text x="100" y="140" text-anchor="middle" font-size="9" fill="#374151">收款方：深圳未来科技</text><text x="100" y="160" text-anchor="middle" font-size="9" fill="#374151">金额：¥53,150.91</text><text x="100" y="180" text-anchor="middle" font-size="9" fill="#374151">流水号：LK2026042001</text><text x="100" y="260" text-anchor="middle" font-size="8" fill="#9CA3AF">平台上传打款凭证</text></svg>'),
    receiptVoucher: '',
    merchantDetails: [
      { merchant: '恒然集团', rechargeAmount: 356800, supplierCost: 196240, rate: '15%', amount: 24084 },
      { merchant: '南山科创', rechargeAmount: 245600, supplierCost: 135080, rate: '15%', amount: 16578 },
      { merchant: '利民街商家', rechargeAmount: 189200, supplierCost: 104060, rate: '12%', amount: 10217 },
      { merchant: '宝安体验中心', rechargeAmount: 98700, supplierCost: 54285, rate: '15%', amount: 2539 },
    ]
  },
  {
    id: 2,
    no: 'AS2026041301',
    period: '2026-04-06 ~ 2026-04-12',
    rechargeAmount: 826700,
    supplierCost: 454685,
    amount: 55802,
    feeRate: 0.005,
    fee: 279.01,
    status: 'done',
    statusText: '已打款',
    time: '2026-04-13 14:00',
    voucher: '',
    receiptVoucher: '',
    merchantDetails: [
      { merchant: '恒然集团', rechargeAmount: 328400, supplierCost: 180620, rate: '15%', amount: 22167 },
      { merchant: '南山科创', rechargeAmount: 221800, supplierCost: 121990, rate: '15%', amount: 14972 },
      { merchant: '利民街商家', rechargeAmount: 176500, supplierCost: 97075, rate: '12%', amount: 9531 },
      { merchant: '宝安体验中心', rechargeAmount: 100000, supplierCost: 55000, rate: '15%', amount: 9133 },
    ]
  },
  {
    id: 3,
    no: 'AS2026040601',
    period: '2026-03-30 ~ 2026-04-05',
    rechargeAmount: 796900,
    supplierCost: 438295,
    amount: 53791,
    feeRate: 0.005,
    fee: 268.96,
    status: 'pending',
    statusText: '待打款',
    time: '-',
    voucher: '',
    receiptVoucher: '',
    merchantDetails: [
      { merchant: '恒然集团', rechargeAmount: 298600, supplierCost: 164230, rate: '15%', amount: 20156 },
      { merchant: '南山科创', rechargeAmount: 198300, supplierCost: 109065, rate: '15%', amount: 13385 },
      { merchant: '利民街商家', rechargeAmount: 168000, supplierCost: 92400, rate: '12%', amount: 9072 },
      { merchant: '宝安体验中心', rechargeAmount: 132000, supplierCost: 72600, rate: '15%', amount: 11178 },
    ]
  },
  {
    id: 4,
    no: 'AS2026033001',
    period: '2026-03-23 ~ 2026-03-29',
    rechargeAmount: 723400,
    supplierCost: 397870,
    amount: 40510,
    feeRate: 0.005,
    fee: 202.55,
    status: 'processing',
    statusText: '处理中',
    time: '-',
    voucher: '',
    receiptVoucher: '',
    merchantDetails: [
      { merchant: '恒然集团', rechargeAmount: 312700, supplierCost: 171985, rate: '14%', amount: 19700 },
      { merchant: '南山科创', rechargeAmount: 210500, supplierCost: 115775, rate: '14%', amount: 13262 },
      { merchant: '利民街商家', rechargeAmount: 150000, supplierCost: 82500, rate: '12%', amount: 8100 },
      { merchant: '宝安体验中心', rechargeAmount: 50200, supplierCost: 27610, rate: '14%', amount: 3163 },
    ]
  },
])

const pagination = { pageSize: 10 }

// 筛选后的数据
const filteredData = computed(() => {
  let data = [...settlementData.value]
  if (filterStatus.value) {
    data = data.filter(d => d.status === filterStatus.value)
  }
  if (filterDateRange.value && filterDateRange.value.length === 2) {
    const [start, end] = filterDateRange.value
    data = data.filter(d => {
      if (!d.time || d.time === '-') return false
      const settleDate = new Date(d.time.replace(/(\d{4})-(\d{2})-(\d{2}).*/, '$1/$2/$3'))
      return settleDate.getTime() >= start && settleDate.getTime() <= end
    })
  }
  return data
})

// 统计数据
const totalCommission = computed(() => filteredData.value.reduce((sum, item) => sum + item.amount, 0))
const totalPaid = computed(() => filteredData.value.filter(item => item.status === 'done').reduce((sum, item) => sum + (item.amount - item.fee), 0))
const totalPending = computed(() => filteredData.value.filter(item => item.status === 'pending').reduce((sum, item) => sum + (item.amount - item.fee), 0))

// 导出Excel
function exportToExcel() {
  try {
    const exportData: any[] = []
    filteredData.value.forEach((item, index) => {
      exportData.push({
        '序号': index + 1,
        '结算单号': item.no,
        '结算周期': item.period,
        '分润金额': item.amount,
        '手续费': item.fee,
        '实际到账': item.amount - item.fee,
        '状态': item.statusText,
        '打款时间': item.time,
        '商家数': `${item.merchantDetails.length} 家`,
      })
      item.merchantDetails.forEach((m: any, mi: number) => {
        exportData.push({
          '序号': `${index + 1}.${mi + 1}`,
          '结算单号': '',
          '结算周期': '',
          '分润金额': '',
          '手续费': '',
          '实际到账': '',
          '状态': '',
          '打款时间': '',
          '商家数': `${m.merchant} ¥${m.amount.toLocaleString()} (${m.rate})`,
        })
      })
    })

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '代理商结算记录')

    ws['!cols'] = [
      { wch: 6 },   // 序号
      { wch: 16 },  // 结算单号
      { wch: 22 },  // 结算周期
      { wch: 14 },  // 分润金额
      { wch: 10 },  // 手续费
      { wch: 12 },  // 实际到账
      { wch: 10 },  // 状态
      { wch: 18 },  // 打款时间
      { wch: 36 },  // 商家明细
    ]

    const fileName = `代理商结算记录_${new Date().toLocaleDateString('zh-CN')}.xlsx`
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([wbout], { type: 'application/octet-stream' })
    saveAs(blob, fileName)
    message.success('导出成功')
  } catch (error) {
    message.error('导出失败')
    console.error(error)
  }
}

// 详情弹窗
const showDetailModal = ref(false)
const currentRecord = ref<any>(null)

function openDetail(row: any) {
  currentRecord.value = row
  showDetailModal.value = true
}

</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.header-desc { font-size: 13px; color: var(--text-muted); margin-top: 4px; display: block; }

.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: white; border-radius: 14px; padding: 20px; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 16px; }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-content { display: flex; flex-direction: column; }
.stat-content .label { font-size: 12px; color: var(--text-muted); }
.stat-content .value { font-family: 'Orbitron', sans-serif; font-size: 22px; font-weight: 700; color: var(--text-primary); }
.stat-content .value.warning { color: #F59E0B; }

.content-card { background: white; border-radius: 16px; padding: 24px; border: 1px solid var(--border-color); }
.table-hint { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-secondary); padding-bottom: 12px; margin-bottom: -4px; }
.table-hint strong { color: var(--text-primary); }
</style>
