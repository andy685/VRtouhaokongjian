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
          <span class="label">已打款</span>
          <span class="value">¥{{ totalPaid.toLocaleString() }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="TimeOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">待打款</span>
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
          到账计算：<strong>分润 = 充值额 × 分润比例</strong>
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
        <n-descriptions-item label="分润金额">{{ `¥${currentRecord.amount.toLocaleString()}` }}</n-descriptions-item>
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
  NIcon, NDescriptions, NDescriptionsItem, NDatePicker, NDivider,
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
  { title: '分润比例', key: 'rate', width: 80 },
  { title: '分润金额', key: 'amount', width: 110, render: (row: any) => `¥${row.amount.toLocaleString()}` },
]

// 表格列定义
const columns = [
  { title: '结算单号', key: 'no', width: 150 },
  { title: '结算周期', key: 'period', width: 140 },
  { title: '分润金额', key: 'amount', width: 120, render: (row: any) => `¥${row.amount.toLocaleString()}` },
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

// 模拟数据 —— 分润 = 充值额 × 分润比例
const settlementData = ref([
  {
    id: 1,
    no: 'AS2026042001',
    period: '2026-04-13 ~ 2026-04-19',
    rechargeAmount: 890300,
    amount: 127869,
    feeRate: 0.005,
    fee: 639.35,
    status: 'done',
    statusText: '已打款',
    time: '2026-04-20 14:00',
    receiptVoucher: '',
    merchantDetails: [
      { merchant: '恒然集团', rechargeAmount: 356800, rate: '15%', amount: 53520 },
      { merchant: '南山科创', rechargeAmount: 245600, rate: '15%', amount: 36840 },
      { merchant: '利民街商家', rechargeAmount: 189200, rate: '12%', amount: 22704 },
      { merchant: '宝安体验中心', rechargeAmount: 98700, rate: '15%', amount: 14805 },
    ]
  },
  {
    id: 2,
    no: 'AS2026041301',
    period: '2026-04-06 ~ 2026-04-12',
    rechargeAmount: 826700,
    amount: 118710,
    feeRate: 0.005,
    fee: 593.55,
    status: 'done',
    statusText: '已打款',
    time: '2026-04-13 14:00',
    receiptVoucher: '',
    merchantDetails: [
      { merchant: '恒然集团', rechargeAmount: 328400, rate: '15%', amount: 49260 },
      { merchant: '南山科创', rechargeAmount: 221800, rate: '15%', amount: 33270 },
      { merchant: '利民街商家', rechargeAmount: 176500, rate: '12%', amount: 21180 },
      { merchant: '宝安体验中心', rechargeAmount: 100000, rate: '15%', amount: 15000 },
    ]
  },
  {
    id: 3,
    no: 'AS2026040601',
    period: '2026-03-30 ~ 2026-04-05',
    rechargeAmount: 796900,
    amount: 114495,
    feeRate: 0.005,
    fee: 572.48,
    status: 'pending',
    statusText: '待打款',
    time: '-',
    receiptVoucher: '',
    merchantDetails: [
      { merchant: '恒然集团', rechargeAmount: 298600, rate: '15%', amount: 44790 },
      { merchant: '南山科创', rechargeAmount: 198300, rate: '15%', amount: 29745 },
      { merchant: '利民街商家', rechargeAmount: 168000, rate: '12%', amount: 20160 },
      { merchant: '宝安体验中心', rechargeAmount: 132000, rate: '15%', amount: 19800 },
    ]
  },
  {
    id: 4,
    no: 'AS2026033001',
    period: '2026-03-23 ~ 2026-03-29',
    rechargeAmount: 723400,
    amount: 98276,
    feeRate: 0.005,
    fee: 491.38,
    status: 'processing',
    statusText: '处理中',
    time: '-',
    receiptVoucher: '',
    merchantDetails: [
      { merchant: '恒然集团', rechargeAmount: 312700, rate: '14%', amount: 43778 },
      { merchant: '南山科创', rechargeAmount: 210500, rate: '14%', amount: 29470 },
      { merchant: '利民街商家', rechargeAmount: 150000, rate: '12%', amount: 18000 },
      { merchant: '宝安体验中心', rechargeAmount: 50200, rate: '14%', amount: 7028 },
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
const totalPaid = computed(() => filteredData.value.filter(item => item.status === 'done').reduce((sum, item) => sum + item.amount, 0))
const totalPending = computed(() => filteredData.value.filter(item => item.status === 'pending').reduce((sum, item) => sum + item.amount, 0))

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
