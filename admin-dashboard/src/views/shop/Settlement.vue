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
        <n-select v-model:value="filterStatus" placeholder="结算状态" :options="statusOptions" size="small" style="width: 120px;" clearable />
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
        <n-descriptions-item label="总结算金额">{{ `¥${currentRecord.amount.toLocaleString()}` }}</n-descriptions-item>
        <n-descriptions-item label="总手续费">{{ `¥${currentRecord.fee}` }}</n-descriptions-item>
        <n-descriptions-item label="实际到账">{{ `¥${(currentRecord.amount - currentRecord.fee).toLocaleString()}` }}</n-descriptions-item>
        <n-descriptions-item label="状态">
          <n-tag :type="currentRecord.status === 'done' ? 'success' : currentRecord.status === 'pending' ? 'warning' : 'info'" size="small">
            {{ currentRecord.statusText }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="打款时间">{{ currentRecord.time }}</n-descriptions-item>
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
      
      <!-- 打款凭证查看 -->
      <div style="margin-top: 20px;" v-if="currentRecord?.status === 'done'">
        <n-divider>打款凭证</n-divider>
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
        <n-empty v-else description="暂无打款凭证" />
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

// 店铺明细表格列
const storeDetailColumns = [
  { title: '店铺名称', key: 'store', width: 160 },
  { title: '结算金额', key: 'amount', width: 120, render: (row: any) => `¥${row.amount.toLocaleString()}` },
  { title: '手续费', key: 'fee', width: 100, render: (row: any) => `¥${row.fee}` },
  { title: '实际到账', key: 'actual', width: 120, render: (row: any) => `¥${(row.amount - row.fee).toLocaleString()}` },
]
import {
  WalletOutline, CheckmarkCircleOutline, TimeOutline, DownloadOutline
} from '@vicons/ionicons5'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

const message = useMessage()

// 筛选条件
const filterStatus = ref<string | null>(null)
const filterDateRange = ref<[number, number] | null>(null)

const statusOptions = [
  { label: '已打款', value: 'done' },
  { label: '待打款', value: 'pending' },
  { label: '处理中', value: 'processing' },
]

// 表格列定义
const columns = [
  { title: '结算单号', key: 'no', width: 150 },
  { title: '结算周期', key: 'period', width: 160 },
  { title: '结算金额', key: 'amount', width: 110, render: (row: any) => `¥${row.amount.toLocaleString()}` },
  { title: '实际到账', key: 'actualAmount', width: 110, render: (row: any) => `¥${(row.amount - row.fee).toLocaleString()}` },
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

// 模拟数据（实际应该从API获取，这里复用平台端的数据）
const settlementData = ref([
  { 
    id: 1, 
    no: 'ST2026042001', 
    merchant: '深圳XX科技公司', 
    period: '2026-04-13 ~ 2026-04-19', 
    amount: 137963, 
    feeRate: 0.03, 
    fee: 4138.89, 
    status: 'done', 
    statusText: '已打款', 
    time: '2026-04-20 10:00',
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
    feeRate: 0.03, 
    fee: 2670.00, 
    status: 'done', 
    statusText: '已打款', 
    time: '2026-04-13 10:00',
    voucher: '',
    storeDetails: [
      { store: '深圳福田旗舰店', amount: 55000, fee: 1650.00 },
      { store: '南山科技园店', amount: 34000, fee: 1020.00 },
    ]
  },
  { 
    id: 3, 
    no: 'ST2026042003', 
    merchant: '深圳XX科技公司', 
    period: '2026-03-30 ~ 2026-04-05', 
    amount: 72330, 
    feeRate: 0.03, 
    fee: 2169.90, 
    status: 'pending', 
    statusText: '待打款', 
    time: '-',
    voucher: '',
    storeDetails: [
      { store: '深圳福田旗舰店', amount: 42330, fee: 1269.90 },
      { store: '南山科技园店', amount: 30000, fee: 900.00 },
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
    // 导出数据包含店铺明细
    const exportData: any[] = []
    
    filteredData.value.forEach((item, index) => {
      // 添加总结算记录
      exportData.push({
        '序号': index + 1,
        '结算单号': item.no,
        '结算周期': item.period,
        '总结算金额': item.amount,
        '总手续费': item.fee,
        '实际到账': item.amount - item.fee,
        '状态': item.statusText,
        '打款时间': item.time,
        '店铺明细': `包含 ${item.storeDetails.length} 家店铺`
      })
      
      // 添加店铺明细记录
      item.storeDetails.forEach((store: any, storeIndex: number) => {
        exportData.push({
          '序号': `${index + 1}.${storeIndex + 1}`,
          '结算单号': '',
          '结算周期': '',
          '总结算金额': '',
          '总手续费': '',
          '实际到账': '',
          '状态': '',
          '打款时间': '',
          '店铺明细': `${store.store} - ¥${store.amount.toLocaleString()} (手续费: ¥${store.fee})`
        })
      })
    })
    
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '结算记录')
    
    // 设置列宽
    ws['!cols'] = [
      { wch: 8 },  // 序号
      { wch: 15 }, // 结算单号
      { wch: 20 }, // 结算周期
      { wch: 12 }, // 总结算金额
      { wch: 10 }, // 总手续费
      { wch: 12 }, // 实际到账
      { wch: 10 }, // 状态
      { wch: 18 }, // 打款时间
      { wch: 40 }, // 店铺明细
    ]
    
    const fileName = `结算记录_${new Date().toLocaleDateString('zh-CN')}.xlsx`
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
