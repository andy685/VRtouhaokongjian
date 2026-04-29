<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>对账中心</h1>
        <p class="header-desc">平台与店铺、支付渠道的财务对账</p>
        <n-button text size="small" type="primary" @click="showHelp = !showHelp" style="padding:0;margin-top:2px;">
          {{ showHelp ? '收起说明 ▲' : '对账规则说明 ▼' }}
        </n-button>
      </div>
      <n-space>
        <n-date-picker type="daterange" clearable size="small" v-model:value="dateRange" />
        <n-button @click="handleAutoReconcile">
          <template #icon><n-icon :component="SyncOutline" /></template> 自动对账
        </n-button>
        <n-button @click="showManualModal = true">
          <template #icon><n-icon :component="CreateOutline" /></template> 手动对账
        </n-button>
        <n-button type="primary" @click="refreshData">
          <template #icon><n-icon :component="RefreshOutline" /></template> 刷新
        </n-button>
      </n-space>
    </div>

    <!-- 对账说明 -->
    <div v-show="showHelp" class="help-card">
      <h4 style="margin-bottom:8px;">对账中心使用说明</h4>
      <n-descriptions :column="1" label-placement="left" bordered size="small">
        <n-descriptions-item label="对账目的">核对平台订单与支付渠道（微信/支付宝）到账记录，确保每笔交易金额、状态一致，发现差异及时处理。</n-descriptions-item>
        <n-descriptions-item label="自动对账">点击「自动对账」后，系统将平台订单与支付渠道流水按订单号匹配：金额一致→对账成功；金额不一致→金额异常；同一订单多次支付→重复支付；平台无记录但渠道已到账→未到账。每日凌晨自动执行一次。</n-descriptions-item>
        <n-descriptions-item label="手动对账">点击「手动对账」，可人工录入渠道流水订单号与金额，与平台订单手动比对，适用于自动对账未覆盖的异常场景。</n-descriptions-item>
        <n-descriptions-item label="异常处理">在异常订单列表中点击「处理」，选择处理方式（已解决/退款/忽略）并填写备注，备注将保存在记录中可供追溯。</n-descriptions-item>
      </n-descriptions>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="CheckmarkCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">对账成功</span>
          <span class="value">{{ stats.success }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="TimeOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">待处理</span>
          <span class="value warning">{{ stats.pending }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #EF4444, #DC2626);">
          <n-icon :component="CloseCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">异常订单</span>
          <span class="value error">{{ stats.exception }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="ReceiptOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">退款中</span>
          <span class="value">{{ stats.refunding }}</span>
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
        <n-descriptions-item label="店铺">{{ currentRecord.store }}</n-descriptions-item>
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

    <!-- 自动对账弹窗 -->
    <n-modal v-model:show="showAutoModal" preset="card" :title="autoStep === 'idle' ? '自动对账' : autoStep === 'running' ? '对账中...' : '对账结果'" style="width: 520px;" :bordered="false" :mask-closable="false">
      <!-- 步骤一：选择时间范围 -->
      <div v-if="autoStep === 'idle'">
        <n-form label-placement="left" label-width="100">
          <n-form-item label="对账范围">
            <n-select v-model:value="autoRange" :options="autoRangeOptions" style="width: 240px;" />
          </n-form-item>
          <n-form-item v-if="autoRange === 'custom'" label="自定义范围">
            <n-date-picker v-model:value="autoCustomRange" type="daterange" clearable size="small" />
          </n-form-item>
        </n-form>
        <n-alert type="info" style="margin-top: 8px;">
          系统将按订单号匹配平台订单与支付渠道流水，自动识别异常订单。
        </n-alert>
      </div>

      <!-- 步骤二：对账中动画 -->
      <div v-else-if="autoStep === 'running'" style="text-align: center; padding: 32px 0;">
        <n-progress type="circle" :percentage="autoProgress" :show-indicator="true" size="large" />
        <p style="margin-top: 16px; font-size: 14px; color: var(--text-secondary);">
          {{ autoProgressText }}
        </p>
      </div>

      <!-- 步骤三：结果展示 -->
      <div v-else-if="autoStep === 'done'">
        <n-result status="success" title="对账完成">
          <template #footer>
            <n-descriptions :column="2" bordered size="small">
              <n-descriptions-item label="对账范围">{{ autoResult.range }}</n-descriptions-item>
              <n-descriptions-item label="总订单数">{{ autoResult.total }} 笔</n-descriptions-item>
              <n-descriptions-item label="对账成功">
                <span style="color: #10B981; font-weight: 600;">{{ autoResult.success }} 笔</span>
              </n-descriptions-item>
              <n-descriptions-item label="发现异常">
                <span style="color: #EF4444; font-weight: 600;">{{ autoResult.exception }} 笔</span>
              </n-descriptions-item>
            </n-descriptions>
          </template>
        </n-result>
      </div>

      <template #footer>
        <n-space justify="end">
          <n-button v-if="autoStep === 'idle'" @click="showAutoModal = false">取消</n-button>
          <n-button v-if="autoStep === 'idle'" type="primary" @click="startAutoReconcile">开始对账</n-button>
          <n-button v-if="autoStep === 'done'" type="primary" @click="finishAutoReconcile">完成</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 手动对账弹窗 -->
    <n-modal v-model:show="showManualModal" preset="card" title="手动对账" style="width: 600px;" :bordered="false">
      <n-tabs v-model:value="manualTab" type="line">
        <!-- Tab1：上传对账单 -->
        <n-tab-pane name="upload" tab="上传对账单">
          <n-upload
            v-model:file-list="manualFileList"
            accept=".xlsx,.xls,.csv"
            :max="1"
            :custom-request="handleManualUpload"
            style="margin-bottom: 16px;"
          >
            <n-upload-dragger>
              <div style="padding: 24px;">
                <n-icon :component="CloudUploadOutline" size="36" color="#3B82F6" />
                <p style="margin: 8px 0 4px; font-size: 14px; color: var(--text-primary);">点击或拖拽文件到此处上传</n-popover>
                <p style="margin: 0; font-size: 12px; color: var(--text-muted);">支持 .xlsx / .xls / .csv 格式，需包含「订单号」和「到账金额」列</p>
              </div>
            </n-upload-dragger>
          </n-upload>
          <n-alert v-if="manualUploadResult" :type="manualUploadResult.exception > 0 ? 'warning' : 'success'" style="margin-top: 12px;">
            上传完成：共 {{ manualUploadResult.total }} 笔，匹配成功 {{ manualUploadResult.success }} 笔，发现异常 {{ manualUploadResult.exception }} 笔
          </n-alert>
        </n-tab-pane>

        <!-- Tab2：手动录入 -->
        <n-tab-pane name="input" tab="手动录入">
          <n-form label-placement="left" label-width="100" style="margin-top: 16px;">
            <n-form-item label="订单号">
              <n-input v-model:value="manualInput.orderNo" placeholder="请输入平台订单号" />
            </n-form-item>
            <n-form-item label="渠道金额">
              <n-input-number v-model:value="manualInput.amount" :min="0" :precision="2" style="width: 200px;" />
              <span style="margin-left: 8px; font-size: 12px; color: var(--text-muted);">元</span>
            </n-form-item>
            <n-form-item label="异常类型">
              <n-select v-model:value="manualInput.type" :options="exceptionTypes" style="width: 200px;" placeholder="请选择" />
            </n-form-item>
            <n-form-item label="备注">
              <n-input v-model:value="manualInput.remark" type="textarea" placeholder="可选填备注" :rows="2" />
            </n-form-item>
          </n-form>
        </n-tab-pane>
      </n-tabs>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showManualModal = false">关闭</n-button>
          <n-button v-if="manualTab === 'input'" type="primary" @click="submitManualInput">提交比对</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, h, computed } from 'vue'
import {
  NButton, NDataTable, NTag, NSpace, NDatePicker, NModal,
  NForm, NFormItem, NRadioGroup, NRadio, NInput, NIcon,
  NDescriptions, NDescriptionsItem, NDivider, NTabs, NTabPane, useMessage, NUpload, NUploadDragger,
  NSelect, NSwitch, NProgress, NResult, NStatistic, NCard, NStep, NSteps
} from 'naive-ui'
import {
  CheckmarkCircleOutline, TimeOutline, CloseCircleOutline,
  ReceiptOutline, RefreshOutline, SyncOutline, CreateOutline, CloudUploadOutline
} from '@vicons/ionicons5'
import * as XLSX from 'xlsx'

const message = useMessage()
const dateRange = ref(null)
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
      return h(NTag, { type: row.type === '金额异常' ? 'error' : 'warning', size: 'small', bordered: true }, () => row.type)
    }
  },
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
      const btnType = row.status === 'resolved' ? 'default' : 'primary'
      return h(NButton, { size: 'tiny', type: btnType, onClick: () => openHandle(row) }, () => label)
    }
  },
]

const exceptionData = ref([
  { id: 1, orderNo: 'VR20260419001', store: '深圳福田旗舰店', amount: '¥128.00', type: '金额异常', reason: '支付金额与订单不符', time: '2026-04-19 18:30', status: 'pending', handleRemark: '' },
  { id: 2, orderNo: 'VR20260419002', store: '南山科技园店', amount: '¥99.00', type: '重复支付', reason: '同一订单出现两次支付记录', time: '2026-04-19 16:45', status: 'pending', handleRemark: '' },
  { id: 3, orderNo: 'VR20260419003', store: '广州天河店', amount: '¥256.00', type: '金额异常', reason: '店铺上报金额与平台记录不一致', time: '2026-04-19 14:20', status: 'pending', handleRemark: '' },
  { id: 4, orderNo: 'VR20260419004', store: '北京朝阳店', amount: '¥68.00', type: '未到账', reason: '顾客已支付但平台未收到', time: '2026-04-19 12:10', status: 'pending', handleRemark: '' },
  { id: 5, orderNo: 'VR20260419005', store: '上海浦东店', amount: '¥188.00', type: '重复支付', reason: '顾客重复扫码支付', time: '2026-04-19 10:30', status: 'pending', handleRemark: '' },
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

const exceptionTypes = [
  { label: '金额异常', value: '金额异常' },
  { label: '重复支付', value: '重复支付' },
  { label: '未到账', value: '未到账' },
  { label: '退款异常', value: '退款异常' },
]

const recordData = ref([
  { id: 1, date: '2026-04-20', batch: 'RC20260420', totalOrders: 1256, amount: 185620, status: 'success', statusText: '对账成功', diffCount: 0, operator: '管理员' },
  { id: 2, date: '2026-04-19', batch: 'RC20260419', totalOrders: 1189, amount: 168430, status: 'success', statusText: '对账成功', diffCount: 2, operator: '管理员' },
  { id: 3, date: '2026-04-18', batch: 'RC20260418', totalOrders: 1320, amount: 192560, status: 'warning', statusText: '存在差异', diffCount: 5, operator: '管理员' },
])

// 统计数据（必须在 recordData / exceptionData 之后定义）
const stats = computed(() => {
  const success = recordData.value.filter((r: any) => r.status === 'success').length
  const pending = exceptionData.value.filter((e: any) => e.status === 'pending').length
  const exception = exceptionData.value.length
  const refunding = exceptionData.value.filter((e: any) => e.type === '退款异常').length
  return { success, pending, exception, refunding }
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
      // 保存备注
      exceptionData.value[idx].handleRemark = handleRemark.value
      if (handleResult.value === 'resolved') {
        exceptionData.value[idx].status = 'resolved'
        message.success('异常订单已标记为已处理')
      } else if (handleResult.value === 'refund') {
        exceptionData.value[idx].status = 'resolved'
        message.success('已发起退款流程')
      } else {
        exceptionData.value.splice(idx, 1)
        message.success('异常订单已忽略')
      }
    }
  }
  showHandleModal.value = false
}

// ========== 自动对账 ==========
const showAutoModal = ref(false)
const autoStep = ref<'idle' | 'running' | 'done'>('idle')
const autoProgress = ref(0)
const autoProgressText = ref('')
const autoRange = ref('today')
const autoCustomRange = ref(null)
const autoResult = ref<{ range: string, total: number, success: number, exception: number }>({ range: '', total: 0, success: 0, exception: 0 })

const autoRangeOptions = [
  { label: '今天', value: 'today' },
  { label: '昨天', value: 'yesterday' },
  { label: '最近7天', value: 'week' },
  { label: '自定义范围', value: 'custom' },
]

function handleAutoReconcile() {
  autoStep.value = 'idle'
  autoProgress.value = 0
  showAutoModal.value = true
}

function startAutoReconcile() {
  autoStep.value = 'running'
  autoProgress.value = 0
  autoProgressText.value = '正在拉取平台订单...'

  // 模拟对账进度
  const steps = [
    { pct: 20, text: '正在拉取支付渠道流水...' },
    { pct: 45, text: '正在按订单号匹配...' },
    { pct: 70, text: '正在比对金额...' },
    { pct: 90, text: '正在生成异常订单...' },
    { pct: 100, text: '对账完成！' },
  ]
  let i = 0
  const timer = setInterval(() => {
    if (i < steps.length) {
      autoProgress.value = steps[i].pct
      autoProgressText.value = steps[i].text
      i++
    } else {
      clearInterval(timer)
      // 生成模拟结果
      const rangeLabel = autoRangeOptions.find(o => o.value === autoRange.value)?.label || '自定义'
      const total = Math.floor(Math.random() * 500) + 800
      const success = total - Math.floor(Math.random() * 20)
      const exception = total - success
      autoResult.value = { range: rangeLabel, total, success, exception }

      // 随机加入几条异常订单（模拟）
      const mockStores = ['深圳福田旗舰店', '南山科技园店', '广州天河店', '北京朝阳店', '上海浦东店']
      const mockTypes = ['金额异常', '重复支付', '未到账']
      for (let j = 0; j < exception; j++) {
        exceptionData.value.push({
          id: Date.now() + j,
          orderNo: `VR${Date.now()}${j}`.slice(0, 13),
          store: mockStores[Math.floor(Math.random() * mockStores.length)],
          amount: `¥${(Math.random() * 300 + 50).toFixed(2)}`,
          type: mockTypes[Math.floor(Math.random() * mockTypes.length)],
          reason: '自动对账发现差异',
          time: new Date().toLocaleString('zh-CN'),
          status: 'pending',
          handleRemark: '',
        })
      }

      // 加入对账记录
      const today = new Date().toISOString().slice(0, 10)
      recordData.value.unshift({
        id: Date.now(),
        date: today,
        batch: `RC${today.replace(/-/g, '')}`,
        totalOrders: total,
        amount: Math.floor(Math.random() * 500000),
        status: exception > 0 ? 'warning' : 'success',
        statusText: exception > 0 ? '存在差异' : '对账成功',
        diffCount: exception,
        operator: '管理员',
      })

      autoStep.value = 'done'
    }
  }, 600)
}

function finishAutoReconcile() {
  showAutoModal.value = false
  autoStep.value = 'idle'
  message.success('对账数据已更新')
}

// ========== 手动对账 ==========
const showManualModal = ref(false)
const manualTab = ref<'upload' | 'input'>('upload')
const manualFileList = ref<any[]>([])
const manualUploadResult = ref<{ total: number, success: number, exception: number } | null>(null)
const manualInput = ref({ orderNo: '', amount: 0, type: '', remark: '' })

async function handleManualUpload({ file, onFinish, onError }: any) {
  try {
    const data = await file.file.arrayBuffer()
    const workbook = XLSX.read(data, { type: 'array' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const json: any[] = XLSX.utils.sheet_to_json(sheet)
    const total = json.length
    let success = 0
    let exception = 0

    json.forEach((row: any) => {
      const orderNo = row['订单号'] || row['orderNo'] || row['订单编号'] || ''
      const amount = row['到账金额'] || row['amount'] || row['金额'] || 0
      if (!orderNo) { exception++; return }

      // 模拟比对：随机决定是否正常
      if (Math.random() > 0.1) {
        success++
      } else {
        exception++
        exceptionData.value.push({
          id: Date.now() + Math.random(),
          orderNo: String(orderNo),
          store: '未知店铺',
          amount: `¥${Number(amount).toFixed(2)}`,
          type: '金额异常',
          reason: '手动对账发现差异',
          time: new Date().toLocaleString('zh-CN'),
          status: 'pending',
          handleRemark: manualInput.value.remark || '',
        })
      }
    })

    manualUploadResult.value = { total, success, exception }
    onFinish()
  } catch (e) {
    message.error('文件解析失败，请检查格式')
    onError()
  }
}

function submitManualInput() {
  if (!manualInput.value.orderNo) {
    message.warning('请输入订单号')
    return
  }
  // 模拟比对
  const isMatch = Math.random() > 0.3
  if (!isMatch) {
    exceptionData.value.push({
      id: Date.now(),
      orderNo: manualInput.value.orderNo,
      store: '手动录入',
      amount: `¥${Number(manualInput.value.amount || 0).toFixed(2)}`,
      type: manualInput.value.type || '金额异常',
      reason: manualInput.value.remark || '手动对账发现差异',
      time: new Date().toLocaleString('zh-CN'),
      status: 'pending',
      handleRemark: '',
    })
    message.warning('比对不一致，已加入异常订单')
  } else {
    message.success('比对一致，无异常')
  }
  manualInput.value = { orderNo: '', amount: 0, type: '', remark: '' }
  showManualModal.value = false
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
