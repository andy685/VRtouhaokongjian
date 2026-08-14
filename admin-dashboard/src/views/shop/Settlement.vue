<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>结算记录</h1>
        <p class="header-desc">查看商家结算记录与店铺明细</p>
      </div>
      <n-space>
        <!-- 高级筛选 -->
        <n-date-picker
          v-model:value="filterDateRange"
          type="daterange"
          clearable
          size="small"
          style="width: 240px;"
          placeholder="选择日期范围"
        />
        <n-select v-model:value="filterStatus" placeholder="打款状态" :options="statusOptions" size="small" style="width: 120px;" clearable />
        <n-select v-model:value="filterPaymentMethod" placeholder="打款方式" :options="paymentMethodOptions" size="small" style="width: 140px;" clearable />
        <n-button @click="exportToExcel">
          <template #icon>
            <n-icon :component="DownloadOutline" />
          </template>
          导出Excel
        </n-button>
      </n-space>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="WalletOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">累计结算</span>
          <span class="value">¥{{ totalSettlement.toLocaleString() }}</span>
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

    <div class="content-card">
      <n-data-table :columns="columns" :data="filteredData" :pagination="pagination" striped />
    </div>

    <!-- 详情弹窗 -->
    <n-modal v-model:show="showDetailModal" preset="card" :title="`结算明细 - ${currentRecord?.no || ''}`" style="width: 800px;" :bordered="false">
      <n-descriptions v-if="currentRecord" label-placement="left" :column="2" bordered>
        <n-descriptions-item label="结算单号">{{ currentRecord.no }}</n-descriptions-item>
        <n-descriptions-item label="商家">{{ currentRecord.merchant }}</n-descriptions-item>
        <n-descriptions-item label="结算周期">{{ currentRecord.period }}</n-descriptions-item>
        <n-descriptions-item label="结算状态">
          <n-tag type="success" size="small">已生成结算单</n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="打款方式">{{ currentRecord.paymentMethod }}</n-descriptions-item>
        <n-descriptions-item label="结算金额">¥{{ currentRecord.amount.toLocaleString() }}</n-descriptions-item>
        <n-descriptions-item label="手续费">¥{{ currentRecord.fee.toFixed(2) }}</n-descriptions-item>
        <n-descriptions-item label="实缴金额">
          <span style="font-weight:700;color:#10B981;">¥{{ currentRecord.actualAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</span>
        </n-descriptions-item>
        <n-descriptions-item label="打款时间">{{ currentRecord.time || '-' }}</n-descriptions-item>
        <n-descriptions-item label="拉卡拉商户号">{{ currentRecord.lakalaMerchantNo || '-' }}</n-descriptions-item>
        <n-descriptions-item label="打款状态">
          <n-tag :type="currentRecord.status === 'done' ? 'success' : currentRecord.status === 'pending' ? 'warning' : 'info'" size="small">
            {{ currentRecord.statusText }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="拉卡拉分账流水号">
          <span v-if="currentRecord.lakalaSplitNo" style="font-family: monospace; font-size: 12px;">{{ currentRecord.lakalaSplitNo }}</span>
          <span v-else style="color: #999;">-</span>
        </n-descriptions-item>
        <n-descriptions-item label="打款凭证">
          <n-image v-if="currentRecord.voucher" :src="currentRecord.voucher" width="120" style="border-radius: 8px;" />
          <span v-else style="color: #999;">未上传</span>
        </n-descriptions-item>
      </n-descriptions>

      <!-- 店铺明细 -->
      <div style="margin-top: 20px;" v-if="currentRecord?.storeDetails?.length">
        <n-divider>店铺明细</n-divider>
        <n-data-table 
          :columns="storeDetailColumns" 
          :data="currentRecord.storeDetails" 
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
  NImage, useMessage
} from 'naive-ui'

import {
  WalletOutline, CheckmarkCircleOutline, TimeOutline, DownloadOutline
} from '@vicons/ionicons5'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

const message = useMessage()

// 店铺明细表格列
const storeDetailColumns = [
  { title: '店铺名称', key: 'store', width: 240 },
  { title: '结算金额', key: 'amount', width: 140, render: (row: any) => `¥${row.amount.toLocaleString()}` },
  { title: '手续费', key: 'fee', width: 120, render: (row: any) => `¥${row.fee.toFixed(2)}` },
  { title: '实缴金额', key: 'actualAmount', width: 140, render: (row: any) => `¥${(row.amount - row.fee).toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
]

// 筛选条件
const filterStatus = ref<string | null>(null)
const filterPaymentMethod = ref<string | null>(null)
const filterDateRange = ref<[number, number] | null>(null)

const statusOptions = [
  { label: '已打款', value: 'done' },
  { label: '待打款', value: 'pending' },
  { label: '处理中', value: 'processing' },
]

const paymentMethodOptions = [
  { label: '拉卡拉自动分账', value: '自动分账' },
  { label: '人工打款', value: '人工打款' },
]

// 表格列定义
const columns = [
  { title: '结算单号', key: 'no', width: 150 },
  { title: '结算周期', key: 'period', width: 160 },
  { title: '打款方式', key: 'paymentMethod', width: 100 },
  { title: '结算金额', key: 'amount', width: 110, render: (row: any) => `¥${row.amount.toLocaleString()}` },
  { title: '实缴金额', key: 'actualAmount', width: 110, render: (row: any) => `¥${row.actualAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
  {
    title: '拉卡拉分账流水号',
    key: 'lakalaSplitNo',
    width: 160,
    ellipsis: { tooltip: true },
    render: (row: any) => row.lakalaSplitNo ? row.lakalaSplitNo : '-'
  },
  {
    title: '打款状态',
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

// 模拟数据（实际应该从API获取，字段按分账与对账说明.md 第5.3节定义）
const settlementData = ref([
  {
    id: 1,
    no: 'ST2026042001',
    merchant: '深圳XX科技公司',
    period: '2026-04-13 ~ 2026-04-19',
    amount: 137963,
    fee: 4138.89,
    actualAmount: 133824.11,
    paymentMethod: '自动分账',
    status: 'done',
    statusText: '自动分账成功',
    time: '2026-04-20 10:00',
    lakalaMerchantNo: '890123456789',
    lakalaSplitNo: 'LS2026042000156789',
    voucher: '',
    storeDetails: [
      { store: '深圳福田旗舰店', amount: 85623, fee: 2568.69 },
      { store: '南山科技园店', amount: 52340, fee: 1570.20 },
    ]
  },
  {
    id: 2,
    no: 'ST2026042002',
    merchant: '深圳XX科技公司',
    period: '2026-04-06 ~ 2026-04-12',
    amount: 89000,
    fee: 2670,
    actualAmount: 86330,
    paymentMethod: '人工打款',
    status: 'done',
    statusText: '已人工打款',
    time: '2026-04-13 10:00',
    lakalaMerchantNo: '890123456789',
    lakalaSplitNo: '',
    voucher: 'https://dummyimage.com/640x360/f8fafc/334155&text=Manual+Payment+Voucher',
    storeDetails: [
      { store: '深圳福田旗舰店', amount: 55000, fee: 1650 },
      { store: '南山科技园店', amount: 34000, fee: 1020 },
    ]
  },
  {
    id: 3,
    no: 'ST2026042003',
    merchant: '深圳XX科技公司',
    period: '2026-03-30 ~ 2026-04-05',
    amount: 72330,
    fee: 2169.90,
    actualAmount: 70160.10,
    paymentMethod: '自动分账',
    status: 'pending',
    statusText: '待打款',
    time: '-',
    lakalaMerchantNo: '890123456789',
    lakalaSplitNo: '',
    voucher: '',
    storeDetails: [
      { store: '深圳福田旗舰店', amount: 42330, fee: 1269.90 },
      { store: '南山科技园店', amount: 30000, fee: 900 },
    ]
  },
  {
    id: 4,
    no: 'ST2026042004',
    merchant: '深圳XX科技公司',
    period: '2026-03-23 ~ 2026-03-29',
    amount: 56800,
    fee: 1704,
    actualAmount: 55096,
    paymentMethod: '人工打款',
    status: 'pending',
    statusText: '待人工打款',
    time: '-',
    lakalaMerchantNo: '890123456789',
    lakalaSplitNo: '',
    voucher: '',
    storeDetails: [
      { store: '深圳福田旗舰店', amount: 36800, fee: 1104 },
      { store: '南山科技园店', amount: 20000, fee: 600 },
    ]
  },
])

const pagination = { pageSize: 10 }

// 筛选后的数据
const filteredData = computed(() => {
  let data = [...settlementData.value]
  
  // 按状态筛选
  if (filterStatus.value) {
    data = data.filter(d => d.status === filterStatus.value)
  }

  // 按打款方式筛选
  if (filterPaymentMethod.value) {
    data = data.filter(d => d.paymentMethod === filterPaymentMethod.value)
  }
  
  // 按日期范围筛选
  if (filterDateRange.value && filterDateRange.value.length === 2) {
    const [start, end] = filterDateRange.value
    data = data.filter(d => {
      const recordDate = new Date(d.period.split(' ~ ')[0])
      return recordDate.getTime() >= start && recordDate.getTime() <= end
    })
  }
  
  return data
})

// 统计数据处理
const totalSettlement = computed(() => {
  return filteredData.value.reduce((sum, item) => sum + item.amount, 0)
})

const totalPaid = computed(() => {
  return filteredData.value
    .filter(item => item.status === 'done')
    .reduce((sum, item) => sum + item.amount, 0)
})

const totalPending = computed(() => {
  return filteredData.value
    .filter(item => item.status === 'pending')
    .reduce((sum, item) => sum + item.amount, 0)
})

// 导出Excel功能
function exportToExcel() {
  try {
    const exportData: any[] = []
    
    filteredData.value.forEach((item, index) => {
      exportData.push({
        '序号': index + 1,
        '结算单号': item.no,
        '结算周期': item.period,
        '结算金额': item.amount,
        '手续费': item.fee,
        '实缴金额': item.actualAmount,
        '结算状态': '已生成结算单',
        '打款方式': item.paymentMethod,
        '打款状态': item.statusText,
        '打款时间': item.time,
        '打款凭证': item.voucher ? '已上传' : '未上传',
        '店铺数': `${item.storeDetails.length} 家`,
      })
      
      item.storeDetails.forEach((store: any, storeIndex: number) => {
        exportData.push({
          '序号': `${index + 1}.${storeIndex + 1}`,
          '结算单号': '',
          '结算周期': '',
          '结算金额': '',
          '手续费': '',
          '实缴金额': '',
          '结算状态': '',
          '打款方式': '',
          '打款状态': '',
          '打款时间': '',
          '打款凭证': '',
          '店铺数': `${store.store} ¥${store.amount.toLocaleString()}，实缴 ¥${(store.amount - store.fee).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        })
      })
    })
    
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '商家结算记录')
    
    ws['!cols'] = [
      { wch: 8 },  // 序号
      { wch: 16 }, // 结算单号
      { wch: 22 }, // 结算周期
      { wch: 14 }, // 结算金额
      { wch: 12 }, // 结算状态
      { wch: 18 }, // 打款时间
      { wch: 36 }, // 店铺明细
    ]
    
    const fileName = `商家结算记录_${new Date().toLocaleDateString('zh-CN')}.xlsx`
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([wbout], { type: 'application/octet-stream' })
    saveAs(blob, fileName)
    
    message.success('导出成功')
  } catch (error) {
    message.error('导出失败')
    console.error(error)
  }
}

// 详情
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

</style>
