<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>结算管理</h1>
        <p class="header-desc">管理商家结算周期与打款状态</p>
      </div>
    </div>

    <!-- 财务概览 -->
    <div class="metrics-row">
      <div class="metric-card">
        <div class="metric-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="TrendingUpOutline" size="22" color="#fff" />
        </div>
        <div class="metric-content">
          <span class="label">商家营收总额</span>
          <span class="value">¥2,856,780</span>
          <span class="trend up">↑ 15.2%</span>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="WalletOutline" size="22" color="#fff" />
        </div>
        <div class="metric-content">
          <span class="label">待结算金额</span>
          <span class="value warning">¥328,560</span>
          <span class="sub-text">本月交易中</span>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="CardOutline" size="22" color="#fff" />
        </div>
        <div class="metric-content">
          <span class="label">已结算金额</span>
          <span class="value">¥1,856,200</span>
          <span class="sub-text">含服务费</span>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-grid">
      <div class="chart-card chart-large">
        <div class="chart-header">
          <h3>月度营收趋势</h3>
          <n-radio-group v-model:value="trendPeriod" size="small">
            <n-radio-button value="month">近6个月</n-radio-button>
            <n-radio-button value="year">近一年</n-radio-button>
          </n-radio-group>
        </div>
        <div ref="revenueChartRef" class="chart-container"></div>
      </div>
      <div class="chart-card">
        <div class="chart-header">
          <h3>收入构成</h3>
        </div>
        <div ref="incomeChartRef" class="chart-container"></div>
      </div>
    </div>

    <div class="content-card">
      <!-- 筛选栏 -->
      <div class="table-toolbar">
        <n-space>
          <n-date-picker
            v-model:value="filterDateRange"
            type="daterange"
            clearable
            size="small"
            style="width: 240px;"
            placeholder="选择日期范围"
          />
          <n-select 
            v-model:value="filterMerchant" 
            placeholder="选择商家" 
            :options="merchantOptions" 
            size="small" 
            style="width: 160px;" 
            clearable 
          />
          <n-select v-model:value="filterStatus" placeholder="结算状态" :options="statusOptions" size="small" style="width: 120px;" clearable />
        </n-space>
        <n-space>
          <n-button @click="exportToExcel">
            <template #icon><n-icon :component="DownloadOutline" /></template> 导出Excel
          </n-button>
          <n-button type="primary" @click="showBatchModal = true">批量结算</n-button>
        </n-space>
      </div>
      <n-data-table :columns="columns" :data="filteredData" :pagination="pagination" striped />
    </div>

    <!-- 批量结算弹窗 -->
    <n-modal v-model:show="showBatchModal" preset="card" title="批量结算" style="width: 600px;" :bordered="false">
      <p style="margin-bottom: 16px; color: #666;">选择要结算的商家记录</p>
      <n-data-table :columns="batchColumns" :data="pendingData" :pagination="false" size="small" striped />
      <template #footer>
        <n-space justify="end">
          <n-button @click="showBatchModal = false">取消</n-button>
          <n-button type="primary" @click="confirmBatch">确认批量结算</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 详情弹窗 -->
    <n-modal v-model:show="showDetailModal" preset="card" :title="`结算明细 - ${currentRecord?.no || ''}`" style="width: 800px;" :bordered="false">
      <n-descriptions v-if="currentRecord" label-placement="left" :column="2" bordered>
        <n-descriptions-item label="结算单号">{{ currentRecord.no }}</n-descriptions-item>
        <n-descriptions-item label="商家">{{ currentRecord.merchant }}</n-descriptions-item>
        <n-descriptions-item label="结算周期">{{ currentRecord.period }}</n-descriptions-item>
        <n-descriptions-item label="总结算金额">{{ `¥${currentRecord.amount.toLocaleString()}` }}</n-descriptions-item>
        <n-descriptions-item label="手续费率">{{ (currentRecord.feeRate * 100).toFixed(1) }}%</n-descriptions-item>
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
      
      <!-- 打款凭证上传 -->
      <div style="margin-top: 20px;" v-if="currentRecord?.status === 'done'">
        <n-divider>打款凭证</n-divider>
        <div v-if="currentRecord.voucher">
          <n-image 
            :src="currentRecord.voucher" 
            width="200"
            style="border-radius: 8px;"
          />
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
              <n-icon size="32" :depth="3">
                <CloudUploadOutline />
              </n-icon>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #666;">
                点击或拖拽上传打款凭证
              </p>
            </div>
          </n-upload-dragger>
        </n-upload>
      </div>
      
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
import { ref, computed, h, onMounted, onUnmounted, nextTick } from 'vue'
import {
  NButton, NDataTable, NTag, NSpace, NSelect, NModal,
  NIcon, NDescriptions, NDescriptionsItem, useMessage, NDatePicker,
  NUpload, NUploadDragger, NImage, NRadioGroup, NRadioButton
} from 'naive-ui'
import {
  DownloadOutline, CloudUploadOutline,
  TrendingUpOutline, WalletOutline, CardOutline
} from '@vicons/ionicons5'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import * as echarts from 'echarts/core'
import { LineChart, PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 注册 ECharts 组件
echarts.use([LineChart, PieChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer])

const message = useMessage()
const filterStatus = ref<string | null>(null)
const filterMerchant = ref<string | null>(null)
const filterDateRange = ref<[number, number] | null>(null)

// 图表
const trendPeriod = ref('month')
const revenueChartRef = ref<HTMLElement | null>(null)
const incomeChartRef = ref<HTMLElement | null>(null)
let revenueChart: echarts.ECharts | null = null
let incomeChart: echarts.ECharts | null = null

const statusOptions = [
  { label: '已打款', value: 'done' },
  { label: '待打款', value: 'pending' },
  { label: '处理中', value: 'processing' },
]

const merchantOptions = [
  { label: '深圳XX科技公司', value: '深圳XX科技公司' },
  { label: '广州YY传媒公司', value: '广州YY传媒公司' },
  { label: '北京ZZ娱乐公司', value: '北京ZZ娱乐公司' },
  { label: '上海WW投资公司', value: '上海WW投资公司' },
]

const columns = [
  { title: '结算单号', key: 'no', width: 150 },
  { title: '商家', key: 'merchant', width: 160 },
  { title: '店铺数量', key: 'storeCount', width: 90, render: (row: any) => `${row.storeDetails.length} 家` },
  { title: '结算周期', key: 'period', width: 160 },
  { title: '结算金额', key: 'amount', width: 110, render: (row: any) => `¥${row.amount.toLocaleString()}` },
  { title: '手续费率', key: 'feeRate', width: 90, render: (row: any) => `${(row.feeRate * 100).toFixed(1)}%` },
  { title: '手续费', key: 'fee', width: 90, render: (row: any) => `¥${row.fee}` },
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
    merchant: '广州YY传媒公司', 
    period: '2026-04-13 ~ 2026-04-19', 
    amount: 78230, 
    feeRate: 0.03, 
    fee: 2346.90, 
    status: 'pending', 
    statusText: '待打款', 
    time: '-',
    voucher: '',
    storeDetails: [
      { store: '广州天河店', amount: 78230, fee: 2346.90 },
    ]
  },
  { 
    id: 3, 
    no: 'ST2026042003', 
    merchant: '北京ZZ娱乐公司', 
    period: '2026-04-13 ~ 2026-04-19', 
    amount: 45680, 
    feeRate: 0.03, 
    fee: 1370.40, 
    status: 'processing', 
    statusText: '处理中', 
    time: '-',
    voucher: '',
    storeDetails: [
      { store: '北京朝阳店', amount: 45680, fee: 1370.40 },
    ]
  },
  { 
    id: 4, 
    no: 'ST2026042004', 
    merchant: '上海WW投资公司', 
    period: '2026-04-13 ~ 2026-04-19', 
    amount: 97850, 
    feeRate: 0.03, 
    fee: 2935.50, 
    status: 'pending', 
    statusText: '待打款', 
    time: '-',
    voucher: '',
    storeDetails: [
      { store: '上海浦东店', amount: 97850, fee: 2935.50 },
    ]
  },
])

const pagination = { pageSize: 10 }

const filteredData = computed(() => {
  let data = [...settlementData.value]
  
  // 按状态筛选
  if (filterStatus.value) {
    data = data.filter(d => d.status === filterStatus.value)
  }
  
  // 按商家筛选
  if (filterMerchant.value) {
    data = data.filter(d => d.merchant === filterMerchant.value)
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

// 导出Excel功能
function exportToExcel() {
  try {
    const exportData = filteredData.value.map((item, index) => ({
      '序号': index + 1,
      '结算单号': item.no,
      '商家': item.merchant,
      '店铺数量': `${item.storeDetails.length} 家`,
      '结算周期': item.period,
      '总结算金额': item.amount,
      '手续费率': `${(item.feeRate * 100).toFixed(1)}%`,
      '总手续费': item.fee,
      '实际到账': item.amount - item.fee,
      '状态': item.statusText,
      '打款时间': item.time
    }))
    
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '结算管理')
    
    // 设置列宽
    ws['!cols'] = [
      { wch: 6 },  // 序号
      { wch: 15 }, // 结算单号
      { wch: 18 }, // 商家
      { wch: 10 }, // 店铺数量
      { wch: 20 }, // 结算周期
      { wch: 12 }, // 总结算金额
      { wch: 10 }, // 手续费率
      { wch: 10 }, // 总手续费
      { wch: 12 }, // 实际到账
      { wch: 10 }, // 状态
      { wch: 18 }, // 打款时间
    ]
    
    const fileName = `结算管理_${new Date().toLocaleDateString('zh-CN')}.xlsx`
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([wbout], { type: 'application/octet-stream' })
    saveAs(blob, fileName)
    
    message.success('导出成功')
  } catch (error) {
    message.error('导出失败')
    console.error(error)
  }
}

const pendingData = computed(() => settlementData.value.filter(d => d.status === 'pending'))

// 店铺明细表格列
const storeDetailColumns = [
  { title: '店铺名称', key: 'store', width: 160 },
  { title: '结算金额', key: 'amount', width: 120, render: (row: any) => `¥${row.amount.toLocaleString()}` },
  { title: '手续费', key: 'fee', width: 100, render: (row: any) => `¥${row.fee}` },
  { title: '实际到账', key: 'actual', width: 120, render: (row: any) => `¥${(row.amount - row.fee).toLocaleString()}` },
]

// 批量结算
const showBatchModal = ref(false)
const batchColumns = [
  { title: '商家', key: 'merchant' },
  { title: '店铺数量', key: 'storeCount', width: 90, render: (row: any) => `${row.storeDetails.length} 家` },
  { title: '结算金额', key: 'amount', render: (row: any) => `¥${row.amount.toLocaleString()}` },
  { title: '状态', key: 'status', render: () => h(NTag, { type: 'warning', size: 'tiny' }, () => '待打款') },
]

function confirmBatch() {
  // 结算前检查：检查是否有异常订单
  const pendingSettlements = settlementData.value.filter(d => d.status === 'pending')
  let hasException = false
  let exceptionCount = 0
  
  // 模拟检查：随机决定是否有异常订单
  if (Math.random() > 0.5) {
    hasException = true
    exceptionCount = Math.floor(Math.random() * 5) + 1
  }
  
  if (hasException) {
    const confirmed = window.confirm(`⚠️ 警告：存在 ${exceptionCount} 笔异常订单，是否继续结算？\n\n点击"取消"暂停结算，先处理异常订单。`)
    if (!confirmed) {
      message.warning('已暂停结算，请先处理异常订单')
      return
    }
  }
  
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
  // 结算前检查：检查是否有异常订单
  const currentMerchant = currentRecord.value?.merchant
  let hasException = false
  let exceptionCount = 0
  
  // 模拟检查：随机决定是否有异常订单
  if (Math.random() > 0.5) {
    hasException = true
    exceptionCount = Math.floor(Math.random() * 3) + 1
  }
  
  if (hasException) {
    const confirmed = window.confirm(`⚠️ 警告：商家"${currentMerchant}"存在 ${exceptionCount} 笔异常订单，是否继续结算？\n\n点击"取消"暂停结算，先处理异常订单。`)
    if (!confirmed) {
      message.warning('已暂停结算，请先处理异常订单')
      return
    }
  }
  
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

// 上传打款凭证
function handleVoucherUpload({ file, onFinish }: any) {
  if (!currentRecord.value) return
  
  // 模拟上传，实际应该调用API
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

// 图表初始化
function initCharts() {
  nextTick(() => {
    setTimeout(() => {
      if (revenueChartRef.value) {
        revenueChart = echarts.init(revenueChartRef.value)
        revenueChart.setOption({
          tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#eee' },
          grid: { left: 48, right: 16, top: 24, bottom: 32 },
          xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'], axisLine: { lineStyle: { color: '#e2e8f0' } }, axisLabel: { color: '#64748b' } },
          yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } }, axisLabel: { color: '#64748b', formatter: '¥{value}k' } },
          series: [{
            type: 'line', smooth: true, data: [320, 380, 420, 480, 520, 580],
            areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(59,130,246,0.2)' }, { offset: 1, color: 'rgba(59,130,246,0)' }]) },
            lineStyle: { width: 3, color: '#3B82F6' },
            itemStyle: { color: '#3B82F6' }
          }]
        })
      }
      if (incomeChartRef.value) {
        incomeChart = echarts.init(incomeChartRef.value)
        incomeChart.setOption({
          tooltip: { trigger: 'item', formatter: '{b}: ¥{c}k ({d}%)' },
          series: [{
            type: 'pie',
            radius: ['45%', '72%'],
            center: ['50%', '50%'],
            label: { show: true, fontSize: 12, color: '#64748b' },
            data: [
              { value: 280, name: 'VR体验', itemStyle: { color: '#3B82F6' } },
              { value: 180, name: '会员充值', itemStyle: { color: '#10B981' } },
              { value: 120, name: '实体商品', itemStyle: { color: '#F59E0B' } },
              { value: 80, name: '其他', itemStyle: { color: '#8B5CF6' } },
            ]
          }]
        })
      }
    }, 200)
  })
}

function handleResize() {
  revenueChart?.resize()
  incomeChart?.resize()
}

onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  revenueChart?.dispose()
  incomeChart?.dispose()
})
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.header-desc { font-size: 13px; color: var(--text-muted); margin-top: 4px; display: block; }

.metrics-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
.metric-card { background: white; border-radius: 14px; padding: 20px; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 16px; }
.metric-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.metric-content { display: flex; flex-direction: column; }
.metric-content .label { font-size: 12px; color: var(--text-muted); }
.metric-content .value { font-family: 'Orbitron', sans-serif; font-size: 22px; font-weight: 700; color: var(--text-primary); }
.metric-content .value.warning { color: #F59E0B; }
.metric-content .trend { font-size: 12px; color: #10B981; font-weight: 600; }
.metric-content .sub-text { font-size: 11px; color: var(--text-muted); }

.content-card { background: white; border-radius: 16px; padding: 24px; border: 1px solid var(--border-color); }
.table-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }

.charts-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 24px; }
.chart-card { background: white; border-radius: 16px; padding: 22px; border: 1px solid var(--border-color); }
.chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.chart-header h3 { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.chart-container { width: 100%; height: 280px; }

@media (max-width: 1200px) {
  .charts-grid { grid-template-columns: 1fr; }
}
</style>
