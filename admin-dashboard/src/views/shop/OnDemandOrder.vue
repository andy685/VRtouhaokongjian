<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>点播系统订单</h1>
      <n-space>
        <n-button type="primary" size="small" @click="showFilter = true">
          <template #icon>
            <n-icon :component="FilterOutline" />
          </template>
          筛选
        </n-button>
        <n-button type="primary" size="small" @click="exportData">
          <template #icon>
            <n-icon :component="DownloadOutline" />
          </template>
          导出
        </n-button>
      </n-space>
    </div>

    <n-data-table
      :columns="columns"
      :data="filteredData"
      :pagination="pagination"
      :bordered="true"
      :single-line="false"
      size="small"
    />

    <!-- 筛选弹窗 -->
    <n-modal v-model:show="showFilter" preset="card" title="筛选条件" style="width: 420px;" :bordered="false">
      <n-form label-placement="left" label-width="80">
        <n-form-item label="店铺">
          <n-select v-model:value="filterShop" :options="shopOptions" placeholder="选择店铺" clearable />
        </n-form-item>
        <n-form-item label="设备">
          <n-input v-model:value="filterDevice" placeholder="输入设备名称..." />
        </n-form-item>
        <n-form-item label="游戏/影片">
          <n-input v-model:value="filterGameFilm" placeholder="输入游戏或影片名称..." />
        </n-form-item>
        <n-form-item label="结算状态">
          <n-select v-model:value="filterSettled" :options="settledOptions" placeholder="选择结算状态" clearable />
        </n-form-item>
        <n-form-item label="日期范围">
          <n-date-picker type="daterange" clearable v-model:value="dateRange" style="width: 100%;" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="resetFilter">重置</n-button>
          <n-button type="primary" @click="showFilter = false">确定</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 详情弹窗 -->
    <n-modal v-model:show="showDetail" preset="card" title="订单详情" style="width: 620px;" :bordered="false">
      <n-descriptions v-if="currentOrder" :column="2" bordered label-placement="left" size="small">
        <n-descriptions-item label="订单号">{{ currentOrder.orderNo }}</n-descriptions-item>
        <n-descriptions-item label="店铺">{{ currentOrder.shop }}</n-descriptions-item>
        <n-descriptions-item label="会员">{{ currentOrder.member }}</n-descriptions-item>
        <n-descriptions-item label="金额">¥{{ currentOrder.amount.toFixed(2) }}</n-descriptions-item>
        <n-descriptions-item label="订单状态">
          <n-tag :type="statusType(currentOrder.status)" size="small">{{ currentOrder.status }}</n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="交易时间">{{ currentOrder.createTime }}</n-descriptions-item>
        <n-descriptions-item label="设备">{{ currentOrder.device || '--' }}</n-descriptions-item>
        <n-descriptions-item label="设备类型">{{ currentOrder.deviceType || '--' }}</n-descriptions-item>
        <n-descriptions-item label="核销方式">{{ currentOrder.verifyMode || '--' }}</n-descriptions-item>
        <n-descriptions-item label="结束原因">{{ currentOrder.endReason || '正常完成' }}</n-descriptions-item>
        <n-descriptions-item label="异常状态">
          <n-tag :type="currentOrder.exceptionStatus === '异常' ? 'warning' : 'success'" size="small">
            {{ currentOrder.exceptionStatus || '正常' }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="异常类型">{{ currentOrder.exceptionType || '--' }}</n-descriptions-item>
        <n-descriptions-item label="结算状态">
          <n-tag :type="currentOrder.settled ? 'warning' : 'success'" size="small">
            {{ currentOrder.settled ? '已结算' : '未结算' }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="来源">{{ currentOrder.source || '点播系统' }}</n-descriptions-item>
        <n-descriptions-item label="备注" :span="2">{{ currentOrder.remark || '--' }}</n-descriptions-item>
      </n-descriptions>
      <div class="detail-section">
        <h3 class="section-title">支付方式</h3>
        <n-data-table :columns="paymentColumns" :data="onDemandPayments" :bordered="true" :single-line="false" size="small" />
      </div>
      <div v-if="currentOrder" class="detail-section">
        <h3 class="section-title">点播明细</h3>
        <n-data-table :columns="detailColumns" :data="getVodDetailRows(currentOrder)" :bordered="true" :single-line="false" size="small" />
      </div>
      <template #footer>
        <n-space justify="center">
          <n-button
            v-if="currentOrder?.status === '已完成'"
            type="warning"
            @click="openRefund"
          >
            退款
          </n-button>
          <n-button @click="showDetail = false">关闭</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 退款弹窗 -->
    <n-modal v-model:show="showRefund" preset="card" :title="'退款'" style="width: 560px;" :bordered="false" :mask-closable="false" size="small">
      <!-- 顶部提示条 -->
      <div class="refund-banner" :class="isSettled ? 'offline' : 'original'">
        <span class="banner-icon">{{ isSettled ? '!' : 'i' }}</span>
        <span class="banner-text">
          {{ isSettled ? '线下退款' : '原路退回' }}，退款总金额<span class="banner-amount">¥{{ refundTotalAmount.toFixed(2) }}元</span>
        </span>
      </div>

      <!-- 基本信息 2x2 -->
      <div class="refund-info-grid">
        <div class="refund-info-cell">
          <div class="cell-label">订单号</div>
          <div class="cell-value">{{ currentOrder?.orderNo }}</div>
        </div>
        <div class="refund-info-cell">
          <div class="cell-label">退款内容</div>
          <div class="cell-value highlight">{{ currentOrder?.gameFilm || '--' }}</div>
        </div>
        <div class="refund-info-cell">
          <div class="cell-label">退款金额</div>
          <div class="cell-value amount">¥{{ refundTotalAmount.toFixed(2) }}</div>
        </div>
        <div class="refund-info-cell">
          <div class="cell-label">退款方式</div>
          <div class="cell-value">{{ isSettled ? '线下退款' : '原路退款' }}</div>
        </div>
      </div>

      <!-- 退款路径 -->
      <div class="refund-section-title">退款路径</div>
      <div class="refund-path-table">
        <div class="path-row path-header">
          <div class="path-cell">支付方式</div>
          <div class="path-cell">支付渠道</div>
          <div class="path-cell">退款金额</div>
          <div class="path-cell">说明</div>
        </div>
        <div v-for="(p, idx) in refundPathList" :key="idx" class="path-row">
          <div class="path-cell method" :style="{ color: p.color }">{{ p.method }}</div>
          <div class="path-cell">{{ p.channel }}</div>
          <div class="path-cell">¥{{ p.amount.toFixed(2) }}</div>
          <div class="path-cell remark">{{ p.remark }}</div>
        </div>
        <div v-if="!refundPathList.length" class="path-empty">暂无退款路径</div>
      </div>

      <!-- 已结算：上传线下退款凭证 -->
      <div v-if="isSettled" class="refund-receipt-block">
        <div class="receipt-label">线下退款凭证 <span class="required">*</span></div>
        <n-upload action="/api/upload" accept=".jpg,.png,.jpeg" :max="1" v-model:file-list="refundReceiptFiles" list-type="image-card">
          <n-button size="small">上传转账截图</n-button>
        </n-upload>
        <div class="receipt-hint">上传微信/支付宝转账截图或现金收据照片</div>
      </div>

      <!-- 退款原因 -->
      <div class="refund-reason-block">
        <div class="refund-reason-label">退款原因<span class="required">*</span></div>
        <n-select v-model:value="refundReason" :options="refundReasonOptions" placeholder="请选择退款原因" size="small" />
        <n-input v-if="refundReason === '其他'" v-model:value="refundReasonCustom" type="textarea" :rows="2" placeholder="请详细描述退款原因" style="margin-top:8px;" />
      </div>

      <!-- 底部汇总卡 -->
      <div class="refund-summary" :class="isSettled ? 'offline' : 'original'">
        <div class="summary-row">
          <span class="summary-label">退款方式：</span>
          <span class="summary-text">{{ isSettled ? '线下退款' : '原路退款' }}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">本次退款总额：</span>
          <span class="summary-total">¥{{ refundTotalAmount.toFixed(2) }}</span>
        </div>
        <div v-if="onDemandPayments.length" class="summary-row breakdown">
          <span v-for="(p, idx) in onDemandPayments" :key="idx" class="breakdown-item" :style="{ color: p.color }">
            {{ p.method }}：¥{{ p.amount.toFixed(2) }}
          </span>
        </div>
      </div>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showRefund = false" size="small">取消</n-button>
          <n-button :type="isSettled ? 'warning' : 'primary'" @click="confirmRefund" size="small">
            {{ isSettled ? '确认已线下退款' : '确认退款' }}
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <MarkExceptionDialog />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NDataTable, NButton, NIcon, NModal, NForm, NFormItem,
  NSelect, NInput, NDatePicker, NSpace, NTag,
  NDescriptions, NDescriptionsItem, NUpload, useMessage,
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { FilterOutline, DownloadOutline } from '@vicons/ionicons5'
import { useExceptionOrders } from '@/composables/useExceptionOrders'
import MarkExceptionDialog from '@/components/MarkExceptionDialog.vue'

const { openMarkDialog, isMarked, unmarkOrder } = useExceptionOrders()
const message = useMessage()

const showFilter = ref(false)
const showDetail = ref(false)
const currentOrder = ref<any>(null)

// ===== 退款 =====
const showRefund = ref(false)
const refundReason = ref<string | null>(null)
const refundReasonCustom = ref('')
const refundReceiptFiles = ref<any[]>([])

const isSettled = computed(() => currentOrder.value?.settled === true)

const refundReasonOptions = [
  { label: '客户不想要了', value: '客户不想要了' },
  { label: '游戏体验异常', value: '游戏体验异常' },
  { label: '操作错误（买错项目）', value: '操作错误' },
  { label: '设备故障', value: '设备故障' },
  { label: '重复付款', value: '重复付款' },
  { label: '其他', value: '其他' },
]

function openRefund() {
  refundReason.value = null
  refundReasonCustom.value = ''
  refundReceiptFiles.value = []
  showRefund.value = true
}

function confirmRefund() {
  const reason = refundReason.value === '其他' ? refundReasonCustom.value : refundReason.value
  if (!reason) {
    message.warning('请选择退款原因')
    return
  }
  // 已结算订单必须上传凭证
  if (isSettled.value && refundReceiptFiles.value.length === 0) {
    message.warning('请上传线下退款凭证')
    return
  }
  if (currentOrder.value) {
    currentOrder.value.refundReason = reason
    currentOrder.value.refundTime = new Date().toLocaleString()
    if (isSettled.value) {
      currentOrder.value.status = '已退款'
      currentOrder.value.refundMethod = '线下退款'
      currentOrder.value.refundReceipt = refundReceiptFiles.value.length > 0 ? refundReceiptFiles.value[0].name : ''
      message.success(`已标记线下退款，退款金额 ¥${currentOrder.value.amount.toFixed(2)}`)
    } else {
      currentOrder.value.status = '退款中'
      currentOrder.value.refundMethod = '拉卡拉原路退回'
      setTimeout(() => {
        if (currentOrder.value) {
          currentOrder.value.status = '已退款'
          currentOrder.value.refundNo = 'RF' + Date.now()
          message.success(`拉卡拉退款成功，退款单号 ${currentOrder.value.refundNo}`)
        }
      }, 2000)
      message.info('退款请求已提交，等待拉卡拉处理...')
    }
    showRefund.value = false
    showDetail.value = false
  }
}

interface PaymentItem {
  method: string
  amount: number
  color: string
}

function parsePayments(paymentContent: string): PaymentItem[] {
  if (!paymentContent) return []
  const parts = paymentContent.split(/[,，]/)
  return parts.reduce<PaymentItem[]>((result, p: string) => {
    const match = p.match(/(.+?)[:：]\s*([\d.]+)/)
    if (match) {
      const method = match[1]; const amount = parseFloat(match[2])
      const color = method.includes('预存款') || method.includes('余额') ? '#6366f1'
        : method.includes('微信') ? '#07c160' : method.includes('支付宝') ? '#1677ff'
        : method.includes('游戏币') ? '#f59e0b' : method.includes('现金') ? '#64748b' : '#64748b'
      result.push({ method, amount, color })
    }
    return result
  }, [])
}

const onDemandPayments = computed(() => parsePayments(currentOrder.value?.paymentContent || ''))

// 整单退款总额：实付金额 - 已退金额
const refundTotalAmount = computed(() => {
  if (!currentOrder.value) return 0
  const paid = currentOrder.value.amount || 0
  const refunded = currentOrder.value.refunded || 0
  return Math.max(0, paid - refunded)
})

// 退款路径列表：把每一笔支付映射到退款渠道
const refundPathList = computed(() => {
  if (!currentOrder.value) return []
  const pays = onDemandPayments.value
  if (pays.length === 0) {
    // 没有解析出支付明细，整单退
    return [{
      method: currentOrder.value.payMethod || '未知',
      channel: isSettled.value ? '线下账户' : '原路退回',
      amount: currentOrder.value.amount,
      remark: isSettled.value ? '商家线下退款' : '原路退回至用户支付账户',
      color: '#6366f1',
    }]
  }
  return pays.map((p: any) => ({
    method: p.method,
    channel: isSettled.value ? '线下账户' : '原路退回',
    amount: p.amount,
    remark: isSettled.value ? '商家线下退款' : `原路退回至${channelLabel(p.method)}`,
    color: p.color,
  }))
})

function channelLabel(method: string) {
  if (method.includes('预存款') || method.includes('余额')) return '会员卡余额'
  if (method.includes('微信')) return '微信账户'
  if (method.includes('支付宝')) return '支付宝账户'
  if (method.includes('游戏币')) return '游戏币账户'
  if (method.includes('现金')) return '现金'
  if (method.includes('套票')) return '套票账户'
  if (method.includes('预存次数')) return '预存次数账户'
  return '用户支付账户'
}

const paymentColumns: DataTableColumns = [
  { title: '支付方式', key: 'method', width: 140, align: 'center', render: (row: any) => h('span', { style: `color:${row.color};font-weight:500;` }, row.method) },
  { title: '金额', key: 'amount', width: 120, align: 'center', render: (row: any) => `¥${row.amount.toFixed(2)}` },
]

const filterShop = ref<string | null>(null)
const filterDevice = ref('')
const filterGameFilm = ref('')
const filterSettled = ref<string | null>(null)
const dateRange = ref<[number, number] | null>(null)

const shopOptions = [
  { label: '利民街小展厅', value: '利民街小展厅' },
]

const settledOptions = [
  { label: '已结算', value: '已结算' },
  { label: '未结算', value: '未结算' },
]

const pagination = { pageSize: 15 }

function statusType(status: string) {
  switch (status) {
    case '已完成': return 'success'
    case '进行中': return 'warning'
    case '已取消': return 'error'
    case '已退款': return 'error'
    case '退款中': return 'warning'
    default: return 'default'
  }
}

function openDetail(row: any) {
  currentOrder.value = row
  showDetail.value = true
}

const columns: DataTableColumns = [
  { title: '订单号', key: 'orderNo', width: 160, align: 'center' },
  { title: '所属店铺', key: 'shop', width: 120, align: 'center' },
  { title: '设备', key: 'device', width: 150, align: 'center' },
  { title: '游戏/影片', key: 'gameFilm', width: 150, align: 'center' },
  { title: '时长', key: 'duration', width: 90, align: 'center' },
  { title: '金额', key: 'amount', width: 100, align: 'center', render: (row: any) => `¥${row.amount.toFixed(2)}` },
  {
    title: '支付方式',
    key: 'paymentContent',
    width: 150,
    align: 'center',
    render: (row: any) => {
      if (!row.paymentContent) return row.payMethod || '--'
      const pays = parsePayments(row.paymentContent)
      if (pays.length === 1) {
        return h('span', { style: `color:${pays[0].color};font-size:12px;font-weight:500;` }, pays[0].method)
      }
      return h('div', { style: 'display:flex;flex-direction:column;gap:1px;' },
        pays.map((p: any) => h('span', { style: `color:${p.color};font-size:11px;font-weight:500;` }, `${p.method} ¥${p.amount.toFixed(2)}`))
      )
    },
  },
  { title: '会员', key: 'member', width: 130, align: 'center' },
  { title: '创建时间', key: 'createTime', width: 160, align: 'center' },
  { title: '状态', key: 'status', width: 90, align: 'center', render: (row: any) => h(NTag, { type: statusType(row.status), size: 'small' }, { default: () => row.status }) },
  {
    title: '会员/商家结算',
    key: 'settled',
    width: 110,
    align: 'center',
    render: (row: any) => h(NTag, { type: row.settled ? 'warning' : 'success', size: 'small', bordered: false }, { default: () => row.settled ? '已结算' : '未结算' }),
  },
  { title: '操作', key: 'action', width: 160, align: 'center', render: (row: any) => h(NSpace, { size: 4 }, { default: () => [h(NButton, { type: 'primary', size: 'small', text: true, onClick: () => openDetail(row) }, { default: () => '详情' }), isMarked(row.orderNo) ? h(NButton, { type: 'warning', size: 'small', text: true, onClick: () => { unmarkOrder(row.orderNo); message.info('已取消标记') } }, { default: () => '取消标记' }) : h(NButton, { type: 'warning', size: 'small', text: true, onClick: () => { if (!openMarkDialog({ orderNo: row.orderNo, store: row.shop, amount: `¥${row.amount.toFixed(2)}` })) message.warning('该订单已在异常列表中') } }, { default: () => '标记异常' })] }) },
]

const detailColumns: DataTableColumns = [
  { title: '点播内容', key: 'content', minWidth: 120 },
  { title: '设备', key: 'device', width: 130, align: 'center' },
  { title: '核销方式', key: 'verifyMode', width: 120, align: 'center' },
  { title: '时长', key: 'duration', width: 90, align: 'center' },
  { title: '结束原因', key: 'endReason', width: 130, align: 'center' },
  { title: '异常类型', key: 'exceptionType', width: 130, align: 'center' },
  { title: '金额', key: 'price', width: 100, align: 'center' },
]

function getVodDetailRows(order: any) {
  return [{
    content: order.gameFilm || '--',
    device: order.device || '--',
    verifyMode: order.verifyMode || '--',
    duration: order.duration || '--',
    endReason: order.endReason || '正常完成',
    exceptionType: order.exceptionType || '无',
    price: `¥${(order.amount || 0).toFixed(2)}`,
  }]
}

const rawData = ref([
  // 混合支付示例（预存款+微信支付）
  {
    orderNo: 'MX202605070003', shop: '利民街小展厅', device: '幻影飞碟', deviceType: 'VR设备', verifyMode: '小程序主动扫码', endReason: '正常完成', exceptionStatus: '正常', exceptionType: '', gameFilm: '过山车VR', type: 'VR', duration: '10分钟', amount: 36.10, member: '张小明(139****5678)', createTime: '2026-05-07 11:00', status: '已完成', paymentContent: '预存款:26.10,微信支付:10.00', settled: false, source: '小程序', remark: '金卡95折',
    details: [
      { item: '支付方式', content: '预存款+微信支付' },
      { item: '优惠', content: '金卡95折, 游戏币抵扣260币' },
      { item: '实付', content: '微信支付 ¥10.00' },
    ], payMethod: '混合支付',
  },
  {
    orderNo: 'OD202307250001', shop: '利民街小展厅', device: '幻影飞碟', deviceType: 'VR设备', verifyMode: '小程序主动扫码', endReason: '正常完成', exceptionStatus: '正常', exceptionType: '', gameFilm: '星际穿越', type: 'VR', duration: '15分钟', amount: 48.00, member: '散客', createTime: '2023-07-25 12:54', status: '已完成', paymentContent: '微信支付:48.00', settled: true, source: '点播系统', remark: '',
    details: [
      { item: '点播内容', content: '星际穿越' },
      { item: '设备名称', content: '幻影飞碟' },
      { item: '体验人数', content: '2人' },
      { item: '支付方式', content: '直接支付' },
      { item: '支付金额', content: '¥48.00' },
    ], payMethod: '微信支付',
  },
  {
    orderNo: 'OD202307250002', shop: '利民街小展厅', device: '暗黑机甲22版', deviceType: 'VR设备', verifyMode: '会员码反扫', endReason: '正常完成', exceptionStatus: '正常', exceptionType: '', gameFilm: '机甲风暴', type: 'VR', duration: '20分钟', amount: 58.00, member: '138****1234', createTime: '2023-07-25 11:30', status: '已完成', paymentContent: '余额:58.00', settled: false, source: '点播系统', remark: '',
    details: [
      { item: '点播内容', content: '机甲风暴' },
      { item: '设备名称', content: '暗黑机甲22版' },
      { item: '体验人数', content: '1人' },
      { item: '支付方式', content: '会员消费' },
      { item: '支付金额', content: '¥58.00' },
    ], payMethod: '余额',
  },
  {
    orderNo: 'OD202307250003', shop: '利民街小展厅', device: '暗黑战场[主控端]', deviceType: '主机串流', verifyMode: '店员扫码点播', endReason: '进行中', exceptionStatus: '正常', exceptionType: '', gameFilm: '僵尸围城', type: 'VR', duration: '10分钟', amount: 38.00, member: '139****5678', createTime: '2023-07-25 10:47', status: '进行中', paymentContent: '预存次数:38.00', settled: false, source: '点播系统', remark: '',
    details: [
      { item: '点播内容', content: '僵尸围城' },
      { item: '设备名称', content: '暗黑战场[主控端]' },
      { item: '体验人数', content: '1人' },
      { item: '支付方式', content: '预存次数' },
      { item: '支付金额', content: '¥38.00' },
    ], payMethod: '预存次数',
  },
  {
    orderNo: 'OD202307250004', shop: '利民街小展厅', device: '悬浮骑兵', deviceType: 'VR设备', verifyMode: '会员码反扫', endReason: '正常完成', exceptionStatus: '正常', exceptionType: '', gameFilm: '极速飞车', type: 'VR', duration: '12分钟', amount: 28.00, member: '137****9012', createTime: '2023-07-25 10:33', status: '已完成', paymentContent: '套票抵扣:28.00', settled: true, source: '点播系统', remark: '',
    details: [
      { item: '点播内容', content: '极速飞车' },
      { item: '设备名称', content: '悬浮骑兵' },
      { item: '体验人数', content: '1人' },
      { item: '支付方式', content: '套票抵扣' },
      { item: '支付金额', content: '¥28.00' },
    ], payMethod: '套票抵扣',
  },
  {
    orderNo: 'OD202307250005', shop: '利民街小展厅', device: '幻影飞碟', deviceType: 'VR设备', verifyMode: '小程序主动扫码', endReason: '用户取消', exceptionStatus: '正常', exceptionType: '', gameFilm: '深海探险', type: '银幕', duration: '25分钟', amount: 68.00, member: '136****3456', createTime: '2023-07-25 09:15', status: '已取消', paymentContent: '微信支付:68.00', settled: false, source: '点播系统', remark: '',
    details: [
      { item: '点播内容', content: '深海探险' },
      { item: '设备名称', content: '幻影飞碟' },
      { item: '体验人数', content: '3人' },
      { item: '支付方式', content: '直接支付' },
      { item: '支付金额', content: '¥68.00' },
    ], payMethod: '微信支付',
  },
  {
    orderNo: 'OD202307250006', shop: '利民街小展厅', device: '暗黑机甲22版', deviceType: 'VR设备', verifyMode: '小程序主动扫码', endReason: '正常完成', exceptionStatus: '正常', exceptionType: '', gameFilm: '恐龙世界', type: 'VR', duration: '18分钟', amount: 52.00, member: '散客', createTime: '2023-07-25 08:40', status: '已完成', paymentContent: '微信支付:52.00', settled: true, source: '点播系统', remark: '',
    details: [
      { item: '点播内容', content: '恐龙世界' },
      { item: '设备名称', content: '暗黑机甲22版' },
      { item: '体验人数', content: '2人' },
      { item: '支付方式', content: '直接支付' },
      { item: '支付金额', content: '¥52.00' },
    ], payMethod: '微信支付',
  },
])

const filteredData = computed(() => {
  let data = rawData.value
  if (filterShop.value) data = data.filter(d => d.shop === filterShop.value)
  if (filterDevice.value) data = data.filter(d => d.device.includes(filterDevice.value))
  if (filterGameFilm.value) data = data.filter(d => d.gameFilm.includes(filterGameFilm.value))
  if (filterSettled.value) data = data.filter(d => (filterSettled.value === '已结算') === d.settled)
  return data
})

function resetFilter() {
  filterShop.value = null
  filterDevice.value = ''
  filterGameFilm.value = ''
  filterSettled.value = null
  dateRange.value = null
}

function exportData() {
  console.log('导出点播系统订单')
}
</script>

<style scoped>
.page-container {
  padding: 24px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.page-header h1 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}
.detail-section {
  margin-top: 16px;
}
.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}
.refund-reason {
  margin-top: 12px;
}

/* ===== 退款弹窗样式 ===== */
.refund-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 13px;
  margin-bottom: 16px;
  border: 1px solid;
  line-height: 1.5;
}
.refund-banner.original {
  background: #e6f4ff;
  border-color: #91caff;
  color: #0958d9;
}
.refund-banner.offline {
  background: #fff7e6;
  border-color: #ffd591;
  color: #d46b08;
}
.banner-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #1677ff;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  font-style: italic;
  flex-shrink: 0;
}
.refund-banner.offline .banner-icon {
  background: #fa8c16;
}
.banner-text { flex: 1; }
.banner-amount {
  font-weight: 600;
  margin: 0 2px;
}

.refund-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 16px;
}
.refund-info-cell {
  padding: 10px 14px;
  border-right: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
}
.refund-info-cell:nth-child(2n) { border-right: none; }
.refund-info-cell:nth-last-child(-n+2) { border-bottom: none; }
.cell-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}
.cell-value {
  font-size: 13px;
  color: #111827;
  font-weight: 500;
  word-break: break-all;
}
.cell-value.highlight { color: #1677ff; }
.cell-value.amount { color: #ef4444; font-size: 16px; font-weight: 600; }

.refund-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px;
}

.refund-path-table {
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 16px;
  background: #fff;
}
.path-row {
  display: grid;
  grid-template-columns: 130px 130px 110px 1fr;
  align-items: center;
  font-size: 13px;
  border-bottom: 1px solid #f0f0f0;
}
.path-row:last-child { border-bottom: none; }
.path-row.path-header {
  background: #fafafa;
  color: #374151;
  font-weight: 500;
  font-size: 12px;
}
.path-cell {
  padding: 8px 12px;
  text-align: center;
  border-right: 1px solid #f0f0f0;
}
.path-cell:last-child { border-right: none; }
.path-cell.method { font-weight: 500; }
.path-cell.remark { color: #6b7280; text-align: left; padding-left: 12px; }
.path-empty {
  padding: 16px;
  text-align: center;
  color: #9ca3af;
  font-size: 12px;
}

.refund-receipt-block {
  margin-bottom: 16px;
  padding: 10px 12px;
  background: #fffbe6;
  border: 1px dashed #ffe58f;
  border-radius: 4px;
}
.receipt-label {
  font-size: 13px;
  color: #374151;
  margin-bottom: 8px;
  font-weight: 500;
}
.receipt-label .required { color: #ef4444; margin-left: 2px; }
.receipt-hint {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 6px;
}

.refund-reason-block { margin-bottom: 16px; }
.refund-reason-label {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  margin-bottom: 8px;
}
.refund-reason-label .required { color: #ef4444; margin-left: 2px; }

.refund-summary {
  padding: 12px 16px;
  border-radius: 4px;
  border: 1px solid;
}
.refund-summary.original {
  background: #f0f7ff;
  border-color: #91caff;
}
.refund-summary.offline {
  background: #fffbe6;
  border-color: #ffe58f;
}
.summary-row {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #374151;
  margin-bottom: 6px;
  line-height: 1.6;
}
.summary-row:last-child { margin-bottom: 0; }
.summary-label { color: #6b7280; min-width: 110px; }
.summary-text { color: #111827; font-weight: 500; }
.summary-total { color: #ef4444; font-size: 16px; font-weight: 600; }
.summary-row.breakdown { gap: 12px; flex-wrap: wrap; }
.breakdown-item { font-size: 12px; }
</style>
