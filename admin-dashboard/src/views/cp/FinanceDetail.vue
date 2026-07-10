<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>结算记录</h1>
        <p class="header-desc">平台到期自动结算至绑定银行账户，无需手动提现</p>
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
          <template #icon><n-icon :component="DownloadOutline" /></template>
          导出Excel
        </n-button>
      </n-space>
    </div>

    <!-- 统计卡片 -->
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

    <!-- 结算表格 -->
    <div class="content-card">
      <n-data-table :columns="columns" :data="filteredData" :pagination="pagination" striped />
    </div>

    <!-- 详情弹窗 -->
    <n-modal v-model:show="showDetailModal" preset="card" :title="`结算明细 - ${currentRecord?.no || ''}`" style="width: 800px;" :bordered="false">
      <n-descriptions v-if="currentRecord" label-placement="left" :column="2" bordered>
        <n-descriptions-item label="结算单号">{{ currentRecord.no }}</n-descriptions-item>
        <n-descriptions-item label="结算周期">{{ currentRecord.period }}</n-descriptions-item>
        <n-descriptions-item label="总结算额">{{ `¥${currentRecord.amount.toLocaleString()}` }}</n-descriptions-item>
        <n-descriptions-item label="状态">
          <n-tag :type="currentRecord.status === 'done' ? 'success' : currentRecord.status === 'pending' ? 'warning' : 'info'" size="small">
            {{ currentRecord.statusText }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="打款时间">{{ currentRecord.time || '-' }}</n-descriptions-item>
      </n-descriptions>

      <!-- 游戏明细 -->
      <div style="margin-top: 20px;" v-if="currentRecord?.gameDetails?.length">
        <n-divider>游戏明细</n-divider>
        <n-data-table
          :columns="gameDetailColumns"
          :data="currentRecord.gameDetails"
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
} from '@vicons/ionicons5'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

const message = useMessage()

// 筛选
const filterStatus = ref<string | null>(null)
const filterDateRange = ref<[number, number] | null>(null)

const statusOptions = [
  { label: '已打款', value: 'done' },
  { label: '待打款', value: 'pending' },
  { label: '处理中', value: 'processing' },
]

// 游戏明细列（弹窗内）
const gameDetailColumns = [
  { title: '游戏名称', key: 'gameName', width: 140 },
  { title: '体验次数', key: 'playCount', width: 100, align: 'right' as const, render: (row: any) => row.playCount.toLocaleString() },
  { title: '单次成本', key: 'perPlayCost', width: 90, align: 'right' as const, render: (row: any) => `¥${row.perPlayCost.toFixed(2)}` },
  { title: '收益额', key: 'revenue', width: 110, align: 'right' as const, render: (row: any) => h('span', { style: 'font-weight:600;color:#4F46E5;' }, `¥${row.revenue.toLocaleString()}`) },
]

// 主表格列 —— 与 Shop/Agent 结算页对齐
const columns = [
  { title: '结算单号', key: 'no', width: 150 },
  { title: '结算周期', key: 'period', width: 180 },
  { title: '结算额', key: 'amount', width: 120, render: (row: any) => `¥${row.amount.toLocaleString()}` },
  {
    title: '状态',
    key: 'status',
    width: 90,
    render(row: any) {
      const typeMap: Record<string, string> = { done: 'success', pending: 'warning', processing: 'info' }
      return h(NTag, { type: typeMap[row.status] as any, size: 'small', bordered: true }, () => row.statusText)
    }
  },
  { title: '打款时间', key: 'time', width: 160 },
  {
    title: '操作',
    key: 'action',
    width: 100,
    render(row: any) {
      return h(NButton, { size: 'tiny', secondary: true, onClick: () => openDetail(row) }, () => '查看明细')
    }
  },
]

// 结算数据：一个周期一条记录，游戏明细在弹窗中展开
const settlementData = ref([
  {
    id: 1,
    no: 'CS2026060101',
    period: '2026-05-01 ~ 2026-05-31',
    amount: 96970,
    feeRate: 0.02,
    fee: 1939,
    actualAmount: 95031,
    status: 'done',
    statusText: '已打款',
    time: '2026-06-03 10:30',
    voucher: '',
    gameDetails: [
      { gameName: '过山车VR', playCount: 12800, perPlayCost: 2.40, revenue: 30720 },
      { gameName: '恐怖医院', playCount: 10500, perPlayCost: 2.10, revenue: 22050 },
      { gameName: '极速赛车', playCount: 8900, perPlayCost: 2.00, revenue: 17800 },
      { gameName: '海洋世界', playCount: 7200, perPlayCost: 1.80, revenue: 12960 },
      { gameName: '恐龙王国', playCount: 6400, perPlayCost: 2.10, revenue: 13440 },
    ]
  },
  {
    id: 2,
    no: 'CS2026050301',
    period: '2026-04-01 ~ 2026-04-30',
    amount: 76280,
    feeRate: 0.02,
    fee: 1526,
    actualAmount: 74754,
    status: 'done',
    statusText: '已打款',
    time: '2026-05-03 09:15',
    voucher: '',
    gameDetails: [
      { gameName: '过山车VR', playCount: 11500, perPlayCost: 2.40, revenue: 27600 },
      { gameName: '恐怖医院', playCount: 9800, perPlayCost: 2.10, revenue: 20580 },
      { gameName: '极速赛车', playCount: 8200, perPlayCost: 2.00, revenue: 16400 },
      { gameName: '海洋世界', playCount: 6500, perPlayCost: 1.80, revenue: 11700 },
    ]
  },
  {
    id: 3,
    no: 'CS2026040301',
    period: '2026-03-01 ~ 2026-03-31',
    amount: 57530,
    feeRate: 0.02,
    fee: 1151,
    actualAmount: 56379,
    status: 'done',
    statusText: '已打款',
    time: '2026-04-03 14:20',
    voucher: '',
    gameDetails: [
      { gameName: '过山车VR', playCount: 10200, perPlayCost: 2.40, revenue: 24480 },
      { gameName: '恐怖医院', playCount: 8500, perPlayCost: 2.10, revenue: 17850 },
      { gameName: '极速赛车', playCount: 7600, perPlayCost: 2.00, revenue: 15200 },
    ]
  },
  {
    id: 4,
    no: 'CS2026070101',
    period: '2026-06-01 ~ 2026-06-30',
    amount: 45100,
    feeRate: 0.02,
    fee: 902,
    actualAmount: 44198,
    status: 'pending',
    statusText: '待打款',
    time: '-',
    voucher: '',
    gameDetails: [
      { gameName: '过山车VR', playCount: 10500, perPlayCost: 2.40, revenue: 25200 },
      { gameName: '极速赛车', playCount: 6200, perPlayCost: 2.00, revenue: 12400 },
      { gameName: '恐龙王国', playCount: 3500, perPlayCost: 2.10, revenue: 7500 },
    ]
  },
])

const pagination = { pageSize: 10 }

// 筛选
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

// 统计
const totalSettlement = computed(() => filteredData.value.reduce((sum, item) => sum + item.amount, 0))
const totalPaid = computed(() => filteredData.value.filter(item => item.status === 'done').reduce((sum, item) => sum + item.amount, 0))
const totalPending = computed(() => filteredData.value.filter(item => item.status === 'pending').reduce((sum, item) => sum + item.amount, 0))

// 详情弹窗
const showDetailModal = ref(false)
const currentRecord = ref<any>(null)

function openDetail(row: any) {
  currentRecord.value = row
  showDetailModal.value = true
}

// 导出
function exportToExcel() {
  try {
    const exportData: any[] = []
    filteredData.value.forEach((item, index) => {
      exportData.push({
        '序号': index + 1,
        '结算单号': item.no,
        '结算周期': item.period,
        '结算额': item.amount,
        '状态': item.statusText,
        '打款时间': item.time,
        '游戏数': `${item.gameDetails.length} 款`,
      })
      item.gameDetails.forEach((g: any, gi: number) => {
        exportData.push({
          '序号': `${index + 1}.${gi + 1}`,
          '结算单号': '',
          '结算周期': '',
          '结算额': '',
          '状态': '',
          '打款时间': '',
          '游戏数': `${g.gameName} - ${g.playCount.toLocaleString()}次 × ¥${g.perPlayCost.toFixed(2)} = ¥${g.revenue.toLocaleString()}`,
        })
      })
    })

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'CP结算记录')

    ws['!cols'] = [
      { wch: 8 }, { wch: 16 }, { wch: 22 }, { wch: 12 },
      { wch: 10 }, { wch: 18 }, { wch: 52 },
    ]

    const fileName = `CP结算记录_${new Date().toLocaleDateString('zh-CN')}.xlsx`
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([wbout], { type: 'application/octet-stream' })
    saveAs(blob, fileName)
    message.success('导出成功')
  } catch (error) {
    message.error('导出失败')
    console.error(error)
  }
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
