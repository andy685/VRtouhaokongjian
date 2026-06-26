<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>对账中心</h1>
        <p class="header-desc">核对店铺订单与支付渠道到账记录</p>
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
        <n-descriptions-item label="对账目的">核对店铺订单与支付渠道（微信/支付宝）到账记录，确保每笔交易金额一致，发现差异及时处理。</n-descriptions-item>
        <n-descriptions-item label="自动对账">点击「自动对账」后，系统将店铺订单与支付渠道流水按订单号匹配：金额一致→对账成功；金额不一致→金额异常；同一订单多次支付→重复支付。每日凌晨自动执行一次。</n-descriptions-item>
        <n-descriptions-item label="手动对账">点击「手动对账」，可上传支付渠道对账单或手动录入订单信息，与店铺订单手动比对。</n-descriptions-item>
        <n-descriptions-item label="异常处理">在异常订单列表中点击「处理」，选择处理方式（已解决/退款/忽略/提交平台）并填写备注。如自行无法处理，可选择「提交平台」升级至运营后台统一处理。</n-descriptions-item>
      </n-descriptions>
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
      <!-- 已驳回：只允许重新提交 -->
      <n-alert v-if="currentRecord?.status === 'rejected'" type="warning" style="margin-bottom: 16px;" :show-icon="false">
        该订单已被平台驳回，请根据驳回原因修正后重新提交。
      </n-alert>
      <n-form label-placement="left" label-width="80">
        <n-form-item label="处理方式">
          <n-radio-group v-if="currentRecord?.status === 'rejected'" v-model:value="handleResult">
            <n-radio value="re_escalate">修正后重新提交平台</n-radio>
            <n-radio value="resolved">自行解决</n-radio>
          </n-radio-group>
          <n-radio-group v-else v-model:value="handleResult">
            <n-radio value="resolved">已解决</n-radio>
            <n-radio value="refund">退款</n-radio>
            <n-radio value="escalate">提交平台</n-radio>
            <n-radio value="ignore">忽略</n-radio>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="处理备注">
          <n-input v-model:value="handleRemark" type="textarea" :placeholder="currentRecord?.status === 'rejected' ? '请输入修正说明' : '请输入处理备注'" :rows="3" />
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
    <n-modal v-model:show="showAutoModal" preset="card"
      :title="autoStep === 'idle' ? '自动对账' : autoStep === 'running' ? '对账中...' : '对账结果'"
      style="width: 520px;" :bordered="false" :mask-closable="false">
      <div v-if="autoStep === 'idle'">
        <n-form label-placement="left" label-width="100">
          <n-form-item label="对账范围">
            <n-select v-model:value="autoRange" :options="autoRangeOptions" style="width: 240px;" />
          </n-form-item>
        </n-form>
        <n-alert type="info" style="margin-top: 8px;">
          系统将按订单号匹配店铺订单与支付渠道流水，自动识别异常订单。
        </n-alert>
      </div>

      <div v-else-if="autoStep === 'running'" style="text-align: center; padding: 32px 0;">
        <n-progress type="circle" :percentage="autoProgress" :show-indicator="true" size="large" />
        <p style="margin-top: 16px; font-size: 14px; color: var(--text-secondary);">
          {{ autoProgressText }}
        </p>
      </div>

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
                <p style="margin: 8px 0 4px; font-size: 14px; color: var(--text-primary);">点击或拖拽文件到此处上传</p>
                <p style="margin: 0; font-size: 12px; color: var(--text-muted);">支持 .xlsx / .xls / .csv 格式，需包含「订单号」和「到账金额」列</p>
              </div>
            </n-upload-dragger>
          </n-upload>
          <n-alert v-if="manualUploadResult" :type="manualUploadResult.exception > 0 ? 'warning' : 'success'" style="margin-top: 12px;">
            上传完成：共 {{ manualUploadResult.total }} 笔，匹配成功 {{ manualUploadResult.success }} 笔，发现异常 {{ manualUploadResult.exception }} 笔
          </n-alert>
        </n-tab-pane>
        <n-tab-pane name="input" tab="手动录入">
          <n-form label-placement="left" label-width="100" style="margin-top: 16px;">
            <n-form-item label="订单号">
              <n-input v-model:value="manualInput.orderNo" placeholder="请输入订单号" />
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
  NButton, NDataTable, NTag, NDatePicker, NModal,
  NForm, NFormItem, NRadioGroup, NRadio, NInput, NIcon,
  NDescriptions, NDescriptionsItem, NDivider, NTabs, NTabPane, useMessage,
  NUpload, NUploadDragger, NProgress, NResult, NAlert, NSelect,
  NSpace, NInputNumber
} from 'naive-ui'
import {
  CheckmarkCircleOutline, TimeOutline, CloseCircleOutline,
  ReceiptOutline, RefreshOutline, SyncOutline, CreateOutline, CloudUploadOutline
} from '@vicons/ionicons5'
import * as XLSX from 'xlsx'
import { useExceptionOrders } from '@/composables/useExceptionOrders'

const message = useMessage()
const { exceptionOrders: exceptionData } = useExceptionOrders()
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
      if (row.status === 'escalated') {
        return h(NTag, { type: 'info' as const, size: 'small' }, () => '平台处理中')
      }
      if (row.status === 'rejected') {
        return h(NTag, { type: 'error' as const, size: 'small' }, () => '已驳回')
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
      const label = row.status === 'resolved' ? '查看' : row.status === 'rejected' ? '重新处理' : '处理'
      const btnType = row.status === 'resolved' ? 'default' : 'primary'
      return h(NButton, { size: 'tiny', type: btnType, onClick: () => openHandle(row) }, () => label)
    }
  },
]

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
]

const recordData = ref([
  { id: 1, date: '2026-04-20', batch: 'RC20260420', totalOrders: 86, amount: 12880, status: 'success', statusText: '对账成功', diffCount: 0 },
  { id: 2, date: '2026-04-19', batch: 'RC20260419', totalOrders: 72, amount: 10240, status: 'warning', statusText: '存在差异', diffCount: 2 },
])

// stats 必须在 recordData / exceptionData 之后定义
const stats = computed(() => {
  const success = recordData.value.filter((r: any) => r.status === 'success').length
  const pending = exceptionData.value.filter((e: any) => e.status === 'pending').length
  const exception = exceptionData.value.length
  const refunding = exceptionData.value.filter((e: any) => e.type === '退款异常').length
  return { success, pending, exception, refunding: refunding || 0 }
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
  // 已驳回订单默认选"重新提交平台"
  handleResult.value = row.status === 'rejected' ? 're_escalate' : 'resolved'
  handleRemark.value = row.status === 'rejected' ? '' : (row.handleRemark || '')
  showHandleModal.value = true
}

function confirmHandle() {
  if (currentRecord.value) {
    const idx = exceptionData.value.findIndex(d => d.id === currentRecord.value.id)
    if (idx !== -1) {
      exceptionData.value[idx].handleRemark = handleRemark.value
      if (handleResult.value === 'resolved') {
        exceptionData.value[idx].status = 'resolved'
        message.success('异常订单已标记为已处理')
      } else if (handleResult.value === 'refund') {
        exceptionData.value[idx].status = 'resolved'
        message.success('已发起退款流程')
      } else if (handleResult.value === 'escalate') {
        exceptionData.value[idx].status = 'escalated'
        exceptionData.value[idx].source = '商家提交'
        message.success('该异常已提交至平台运营中心处理')
      } else if (handleResult.value === 're_escalate') {
        // 驳回后重新提交：状态回 escalated，保留商家修正说明
        exceptionData.value[idx].status = 'escalated'
        exceptionData.value[idx].source = '商家提交'
        message.success('已重新提交至平台审核')
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
const autoRangeOptions = [
  { label: '今天', value: 'today' },
  { label: '昨天', value: 'yesterday' },
  { label: '最近7天', value: 'week' },
]
const autoResult = ref<{ range: string, total: number, success: number, exception: number }>({ range: '', total: 0, success: 0, exception: 0 })

function handleAutoReconcile() {
  autoStep.value = 'idle'
  autoProgress.value = 0
  showAutoModal.value = true
}

function startAutoReconcile() {
  autoStep.value = 'running'
  autoProgress.value = 0
  autoProgressText.value = '正在拉取店铺订单...'
  const steps = [
    { pct: 25, text: '正在拉取支付渠道流水...' },
    { pct: 55, text: '正在按订单号匹配...' },
    { pct: 80, text: '正在比对金额...' },
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
      // 基于当前分钟数确定性计算出总订单数和异常数
      const minuteSeed = new Date().getMinutes()
      const daySeed = new Date().getDate()
      const total = 60 + (minuteSeed % 30) + (daySeed % 20)
      const exception = Math.min(total, (minuteSeed % 4) + (daySeed % 3) + 1)
      const success = total - exception
      autoResult.value = { range: autoRangeOptions.find(o => o.value === autoRange.value)?.label || '', total, success, exception }

      // 加入异常订单（确定性生成，不再随机）
      const types = ['金额异常', '重复支付', '未到账'] as const
      function simpleHash(str: string): number {
        let hash = 0
        for (let i = 0; i < str.length; i++) {
          hash = ((hash << 5) - hash) + str.charCodeAt(i)
          hash |= 0
        }
        return Math.abs(hash)
      }
      // mock一些「已知店铺订单」与「渠道流水」的对照数据
      const mockOrders = [
        { orderNo: 'CO20260420001', storeAmt: 148.00, chnlAmt: 128.00 },
        { orderNo: 'CO20260420002', storeAmt: 88.00, chnlAmt: 88.00 },
        { orderNo: 'CO20260420003', storeAmt: 56.00, chnlAmt: 56.00 },
        { orderNo: 'CO20260420004', storeAmt: 299.00, chnlAmt: 199.00 },
        { orderNo: 'CO20260420005', storeAmt: 38.00, chnlAmt: 0 },
      ]
      for (let j = 0; j < exception; j++) {
        const orderNo = `CO${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(j + 1).padStart(3, '0')}`
        const typeIndex = simpleHash(orderNo) % 3
        const type = types[typeIndex]
        const storeAmt = +(Math.round((Math.random() * 200 + 30) * 100) / 100).toFixed(2)
        let reason = ''
        let amount = `¥${storeAmt.toFixed(2)}`
        switch (type) {
          case '金额异常': {
            const diff = +(Math.round(Math.random() * 50 * 100) / 100).toFixed(2)
            const chnlAmt = storeAmt - diff
            reason = `渠道到账 ¥${chnlAmt.toFixed(2)}，店铺订单 ¥${storeAmt.toFixed(2)}，差额 ¥${diff.toFixed(2)}`
            break
          }
          case '重复支付':
            reason = `订单 #${orderNo} 在微信渠道出现 2 笔到账记录`
            break
          case '未到账':
            reason = `支付渠道存在到账记录，但平台无对应订单 #${orderNo}`
            break
        }
        exceptionData.value.push({
          id: Date.now() + j,
          orderNo,
          store: '我的旗舰店',
          amount,
          type,
          reason,
          time: new Date().toLocaleString('zh-CN'),
          status: 'pending',
          handleRemark: '',
          source: '自动对账',
        })
      }

      // 加入对账记录
      const today = new Date().toISOString().slice(0, 10)
      recordData.value.unshift({
        id: Date.now(),
        date: today,
        batch: `RC${today.replace(/-/g, '')}`,
        totalOrders: total,
        amount: Math.floor(Math.random() * 50000),
        status: exception > 0 ? 'warning' : 'success',
        statusText: exception > 0 ? '存在差异' : '对账成功',
        diffCount: exception,
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
const exceptionTypes = [
  { label: '金额异常', value: '金额异常' },
  { label: '重复支付', value: '重复支付' },
  { label: '未到账', value: '未到账' },
]

async function handleManualUpload({ file, onFinish, onError }: any) {
  try {
    const data = await (file as any).file.arrayBuffer()
    const workbook = XLSX.read(data, { type: 'array' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const json: any[] = XLSX.utils.sheet_to_json(sheet)
    const total = json.length
    let success = 0
    let exception = 0
    json.forEach((row: any) => {
      const orderNo = row['订单号'] || row['orderNo'] || ''
      if (!orderNo) { exception++; return }
      if (Math.random() > 0.15) {
        success++
      } else {
        exception++
        exceptionData.value.push({
          id: Date.now() + Math.random(),
          orderNo: String(orderNo),
          store: '我的旗舰店',
          amount: `¥${Number(row['到账金额'] || row['amount'] || 0).toFixed(2)}`,
          type: '金额异常',
          reason: '手动对账上传发现差异',
          time: new Date().toLocaleString('zh-CN'),
          status: 'pending',
          handleRemark: manualInput.value.remark || '',
          source: '手动对账',
        })
      }
    })
    manualUploadResult.value = { total, success, exception }
    onFinish()
  } catch {
    message.error('文件解析失败，请检查格式')
    onError()
  }
}

function submitManualInput() {
  if (!manualInput.value.orderNo) {
    message.warning('请输入订单号')
    return
  }
  const isMatch = Math.random() > 0.3
  if (!isMatch) {
    exceptionData.value.push({
      id: Date.now(),
      orderNo: manualInput.value.orderNo,
      store: '我的旗舰店',
      amount: `¥${Number(manualInput.value.amount || 0).toFixed(2)}`,
      type: manualInput.value.type || '金额异常',
      reason: manualInput.value.remark || '手动对账录入发现差异',
      time: new Date().toLocaleString('zh-CN'),
      status: 'pending',
      handleRemark: '',
      source: '手动对账',
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
