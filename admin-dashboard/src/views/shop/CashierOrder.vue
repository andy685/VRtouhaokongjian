<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>收银订单</h1>
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
        <n-form-item label="订单号">
          <n-input v-model:value="filterOrderNo" placeholder="输入订单号..." />
        </n-form-item>
        <n-form-item label="会员手机">
          <n-input v-model:value="filterPhone" placeholder="输入会员手机号..." />
        </n-form-item>
        <n-form-item label="订单来源">
          <n-select v-model:value="filterSource" :options="sourceOptions" placeholder="选择订单来源" clearable />
        </n-form-item>
        <n-form-item label="订单状态">
          <n-select v-model:value="filterStatus" :options="statusOptions" placeholder="选择订单状态" clearable />
        </n-form-item>
        <n-form-item label="结算状态">
          <n-select v-model:value="filterSettled" :options="settledFilterOptions" placeholder="选择结算状态" clearable />
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
          <div class="cell-value">{{ detailRow?.orderNo }}</div>
        </div>
        <div class="refund-info-cell">
          <div class="cell-label">退款内容</div>
          <div class="cell-value highlight">{{ detailRow?.product || '--' }}</div>
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
        <n-upload action="/api/upload" accept=".jpg,.png,.jpeg" :max="1" v-model:file-list="receiptFileList" list-type="image-card">
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
        <div v-if="paymentMethods.length" class="summary-row breakdown">
          <span v-for="(p, idx) in paymentMethods" :key="idx" class="breakdown-item" :style="{ color: p.color }">
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

    <!-- 订单详情弹窗 -->
    <n-modal v-model:show="showDetail" preset="card" title="订单详情" style="width: 620px;" :bordered="false">
      <n-descriptions v-if="detailRow" :column="2" bordered label-placement="left" size="small">
        <n-descriptions-item label="订单号">{{ detailRow.orderNo }}</n-descriptions-item>
        <n-descriptions-item label="所属店铺">{{ detailRow.shop }}</n-descriptions-item>
        <n-descriptions-item label="会员">{{ detailRow.member || '散客' }}</n-descriptions-item>
        <n-descriptions-item label="金额">¥{{ detailRow.paid.toFixed(2) }}</n-descriptions-item>
        <n-descriptions-item label="订单状态">
          <n-tag :type="detailRow.status === '已退款' ? 'error' : detailRow.status === '退款中' ? 'warning' : 'success'" size="small">{{ detailRow.status }}</n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="交易时间">{{ detailRow.createTime }}</n-descriptions-item>
        <n-descriptions-item label="结算状态">
          <n-tag :type="detailRow.settled ? 'warning' : 'success'" size="small">
            {{ detailRow.settled ? '已结算' : '未结算' }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="来源">{{ detailRow.source || '收银系统' }}</n-descriptions-item>
        <n-descriptions-item label="操作人">{{ detailRow.operator || '--' }}</n-descriptions-item>
        <n-descriptions-item label="--"></n-descriptions-item>
        <n-descriptions-item label="备注" :span="2">{{ detailRow.remark || '--' }}</n-descriptions-item>
        <template v-if="detailRow.status === '已退款'">
          <n-descriptions-item label="退款原因">
            <span style="color:#EF4444;">{{ detailRow.refundReason || '--' }}</span>
          </n-descriptions-item>
          <n-descriptions-item label="退款操作人">{{ detailRow.refundOperator || '--' }}</n-descriptions-item>
        </template>
      </n-descriptions>
      <div class="detail-section">
        <h3 class="section-title">支付方式</h3>
        <n-data-table :columns="paymentColumns" :data="getPaymentDetail(detailRow?.paymentContent || '')" :bordered="true" :single-line="false" size="small" />
      </div>
      <div v-if="detailRow?.items?.length" class="detail-section">
        <h3 class="section-title">售卖详情</h3>
        <n-data-table
          :columns="detailColumns"
          :data="detailRow.items"
          :bordered="true"
          :single-line="false"
          size="small"
        />
      </div>
      <template #footer>
        <n-space justify="center">
          <n-button v-if="detailRow?.status === '完成'" type="warning" size="small" @click="openRefund">
            退款
          </n-button>
          <n-button @click="showDetail = false">关闭</n-button>
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
  NSelect, NInput, NInputNumber, NDatePicker, NSpace, NTag, NEmpty,
  NRadioGroup, NRadio, NSwitch, NDescriptions, NDescriptionsItem,
  NAlert, NUpload,
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { FilterOutline, DownloadOutline, PrintOutline, RefreshOutline } from '@vicons/ionicons5'
import { useExceptionOrders } from '@/composables/useExceptionOrders'
import MarkExceptionDialog from '@/components/MarkExceptionDialog.vue'

const { openMarkDialog, isMarked, unmarkOrder } = useExceptionOrders()

const showFilter = ref(false)
const showDetail = ref(false)
const showRefund = ref(false)
const detailRow = ref<any>(null)
const refundRemark = ref('')

const isSettled = computed(() => detailRow.value?.settled === true)
const receiptFileList = ref<any[]>([])

function getPaymentDetail(paymentContent: string) {
  if (!paymentContent || paymentContent === '待支付') return []
  const parts = paymentContent.split(/[,，]/)
  return parts.map((p: string) => {
    const match = p.match(/(.+?)[:：]\s*([\d.]+)/)
    if (match) {
      const method = match[1]
      const amount = parseFloat(match[2])
      const color = method.includes('预存款') || method.includes('余额') ? '#6366f1'
        : method.includes('微信') ? '#07c160'
        : method.includes('支付宝') ? '#1677ff'
        : method.includes('游戏币') ? '#f59e0b'
        : '#64748b'
      return { method, amount, color }
    }
    return null
  }).filter(Boolean)
}

const filterShop = ref<string | null>(null)
const filterOrderNo = ref('')
const filterPhone = ref('')
const filterSource = ref<string | null>(null)
const filterStatus = ref<string | null>(null)
const filterSettled = ref<string | null>(null)
const dateRange = ref<[number, number] | null>(null)

const shopOptions = [
  { label: '利民街小展厅', value: '利民街小展厅' },
]

const sourceOptions = [
  { label: '收银系统', value: '收银系统' },
  { label: '小程序', value: '小程序' },
]

const statusOptions = [
  { label: '完成', value: '完成' },
  { label: '已退款', value: '已退款' },
  { label: '待支付', value: '待支付' },
]

const settledFilterOptions = [
  { label: '已结算', value: '已结算' },
  { label: '未结算', value: '未结算' },
]

const refundAmount = ref<number | null>(null)
const refundItems = ref<any[]>([])
const refundMethod = ref('original')
const allowPointsRefund = ref(false)
const refundReason = ref<string | null>(null)
const refundReasonCustom = ref('')

const refundReasonOptions = [
  { label: '客户不想要了', value: '客户不想要了' },
  { label: '游戏体验异常', value: '游戏体验异常' },
  { label: '操作错误（买错项目）', value: '操作错误' },
  { label: '设备故障', value: '设备故障' },
  { label: '重复付款', value: '重复付款' },
  { label: '其他', value: '其他' },
]

const paymentColumns: DataTableColumns = [
  { title: '支付方式', key: 'method', width: 140, align: 'center', render: (row: any) => h('span', { style: `color:${row.color};font-weight:500;` }, row.method) },
  { title: '金额', key: 'amount', width: 120, align: 'center', render: (row: any) => `¥${row.amount.toFixed(2)}` },
]

const refundColumns: DataTableColumns = [
  { title: '商品名称', key: 'name', minWidth: 120 },
  { title: '现单价', key: 'price', width: 80, align: 'center', render: (row: any) => `¥${row.price.toFixed(2)}` },
  { title: '已购数', key: 'quantity', width: 70, align: 'center' },
  { title: '已退数', key: 'refundedQty', width: 70, align: 'center' },
  { title: '可退数', key: 'refundable', width: 70, align: 'center', render: (row: any) => row.quantity - row.refundedQty },
  {
    title: '本次退货数',
    key: 'currentRefundQty',
    width: 100,
    align: 'center',
    render(row: any, index: number) {
      return h(NInputNumber, {
        value: row.currentRefundQty,
        min: 0,
        max: row.quantity - row.refundedQty,
        precision: 0,
        size: 'small',
        style: 'width: 80px;',
        'onUpdate:value': (val: number | null) => {
          refundItems.value[index].currentRefundQty = val || 0
        },
      })
    },
  },
]

// 整单退款：退款总额 = 实付金额（paid）
const refundTotalAmount = computed(() => {
  if (!detailRow.value) return 0
  // 已退过款的话，按"实付 - 已退"算；否则直接实付
  const paid = detailRow.value.paid || 0
  const refunded = detailRow.value.refunded || 0
  return Math.max(0, paid - refunded)
})

const paymentMethods = computed(() => {
  return getPaymentDetail(detailRow.value?.paymentContent || '')
})

// 退款路径：每一笔支付 → 退款渠道
const refundPathList = computed(() => {
  if (!detailRow.value) return []
  const pays = paymentMethods.value
  if (pays.length === 0) {
    return [{
      method: '现金',
      channel: isSettled.value ? '线下账户' : '原路退回',
      amount: refundTotalAmount.value,
      remark: isSettled.value ? '商家线下退款' : '原路退回至现金账户',
      color: '#64748b',
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
  return '用户支付账户'
}

const pagination = { pageSize: 15 }

  const statusMap: Record<string, { type: 'success' | 'warning' | 'error' | 'default', label: string }> = {
  '完成': { type: 'success', label: '完成' },
  '已退款': { type: 'error', label: '已退款' },
  '待支付': { type: 'warning', label: '待支付' },
}

function openDetail(row: any) {
  detailRow.value = row
  showDetail.value = true
}

const columns: DataTableColumns = [
  { title: '订单号', key: 'orderNo', width: 200, align: 'center' },
  { title: '所属店铺', key: 'shop', width: 120, align: 'center' },
  { title: '交易时间', key: 'createTime', width: 140, align: 'center' },
  { title: '商品', key: 'product', minWidth: 180, align: 'center' },
  { title: '应付总额', key: 'amount', width: 100, align: 'center', render: (row: any) => row.amount },
  { title: '优惠金额', key: 'discount', width: 100, align: 'center', render: (row: any) => row.discount },
  { title: '实收总额', key: 'paid', width: 100, align: 'center', render: (row: any) => row.paid },
  {
    title: '支付方式',
    key: 'paymentContent',
    minWidth: 160,
    align: 'center',
    render(row: any) {
      if (!row.paymentContent || row.paymentContent === '待支付') return h('span', { style: 'color:#999;' }, row.paymentContent || '--')
      const parts = row.paymentContent.split(/[,，]/)
      const tags = parts.map((p: string) => {
        const match = p.match(/(.+?)[:：]\s*([\d.]+)/)
        if (match) {
          const method = match[1]
          const amount = parseFloat(match[2])
          const color = method.includes('预存款') || method.includes('余额') ? '#6366f1'
            : method.includes('微信') ? '#07c160'
            : method.includes('支付宝') ? '#1677ff'
            : method.includes('游戏币') ? '#f59e0b'
            : '#64748b'
          return { method, amount, color }
        }
        return null
      }).filter(Boolean)
      return h('div', { style: 'display:flex;flex-direction:column;gap:2px;align-items:center;' },
        tags.map((t: any) =>
          h('span', { style: `font-size:11px;color:${t.color};font-weight:500;` }, `${t.method} ¥${t.amount.toFixed(2)}`)
        )
      )
    },
  },
  {
    title: '订单状态',
    key: 'status',
    width: 80,
    align: 'center',
    render(row: any) {
      const s = statusMap[row.status] || { type: 'default', label: row.status }
      return h(NTag, { type: s.type, size: 'small', bordered: false }, { default: () => s.label })
    },
  },
  {
    title: '会员/商家结算',
    key: 'settled',
    width: 100,
    align: 'center',
    render(row: any) {
      return h(NTag, { type: row.settled ? 'warning' : 'success', size: 'small', bordered: false }, { default: () => row.settled ? '已结算' : '未结算' })
    },
  },
  { title: '会员/散客', key: 'member', width: 150, align: 'center' },
  { title: '操作人', key: 'operator', width: 80, align: 'center' },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    align: 'center',
    render(row: any) {
      return h(NSpace, { size: 4 }, {
        default: () => [
          h(NButton, { size: 'small', type: 'primary', text: true, onClick: () => openDetail(row) }, { default: () => '详情' }),
          isMarked(row.orderNo)
            ? h(NButton, { size: 'small', type: 'warning', text: true, onClick: () => { unmarkOrder(row.orderNo); window.$message?.info('已取消标记') } }, { default: () => '取消标记' })
            : h(NButton, { size: 'small', type: 'warning', text: true, onClick: () => { if (!openMarkDialog({ orderNo: row.orderNo, store: row.shop, amount: `¥${row.amount.toFixed(2)}` })) window.$message?.warning('该订单已在异常列表中') } }, { default: () => '标记异常' }),
        ]
      })
    },
  },
]

const detailColumns: DataTableColumns = [
  { title: '商品名称', key: 'name', minWidth: 140 },
  { title: '单价', key: 'price', width: 90, align: 'center', render: (row: any) => `¥${row.price.toFixed(2)}` },
  { title: '数量', key: 'quantity', width: 70, align: 'center' },
  { title: '小计', key: 'subtotal', width: 100, align: 'center', render: (row: any) => `¥${row.subtotal.toFixed(2)}` },
  { title: '备注', key: 'remark', minWidth: 100, render: (row: any) => row.remark || '--' },
]

const rawData = ref([
  // 混合支付示例：预存款 + 微信支付
  {
    orderNo: 'MX202605070001', shop: '利民街小展厅', member: '张小明（13912345678）', product: '过山车VR', amount: 38, discount: 1.90, paid: 36.10, paymentContent: '预存款:26.10,微信支付:10.00', createTime: '2026-05-07 10:30', status: '完成',
    refunded: 0, remark: '会员95折+游戏币抵扣', source: '小程序',     settled: false, operator: '李小红',
    items: [
      { name: '过山车VR', originalPrice: 38.00, price: 36.10, quantity: 1, subtotal: 36.10, remark: '金卡95折', refundedQty: 0, refundAmount: 0 },
    ],
    discounts: [
      { type: '会员折扣', name: '金卡95折', amount: 1.90, action: '自动抵扣' },
    ],
  },
  {
    orderNo: '585317365644510507768770', shop: '利民街小展厅', member: '散客（未知）', product: '暗黑战场', amount: 80, discount: 0, paid: 80, paymentContent: '现金:80.00元', createTime: '2025-01-11 11:00', status: '完成',
    refunded: 0, remark: '', source: '收银系统', settled: true, operator: '王建国',
    items: [
      { name: '暗黑战场', originalPrice: 20.00, price: 20.00, quantity: 4, subtotal: 80.00, remark: '', refundedQty: 0, refundAmount: 0 },
    ],
    discounts: [],
  },
  {
    orderNo: '585317365644330507765412', shop: '利民街小展厅', member: '奥特曼（13903019429）', product: '充1000送1000,充300送100（一年有效）', amount: 1300, discount: 0, paid: 1300, paymentContent: '线下微信:1300.00元', createTime: '2025-01-11 11:00', status: '完成',
    refunded: 0, remark: '', source: '收银系统', settled: true, operator: '李小红',
    items: [
      { name: '充1000送1000,充300送100', originalPrice: 1300.00, price: 1300.00, quantity: 1, subtotal: 1300.00, remark: '', refundedQty: 0, refundAmount: 0 },
    ],
    discounts: [],
  },
  {
    orderNo: '585317365644180507785875', shop: '利民街小展厅', member: '散客（未知）', product: '幻影时空', amount: 20, discount: 0, paid: 20, paymentContent: '线下支付宝:20.00元', createTime: '2025-01-11 11:00', status: '已退款',
    refunded: 20, remark: '客户要求退款', source: '收银系统', settled: false, operator: '系统自动',
    items: [
      { name: '幻影时空', originalPrice: 20.00, price: 20.00, quantity: 1, subtotal: 20.00, remark: '', refundedQty: 1, refundAmount: 20 },
    ],
    discounts: [],
  },
  {
    orderNo: '585317359562270507729610', shop: '利民街小展厅', member: '奥特曼（13903019429）', product: '充200送100', amount: 200, discount: 0, paid: 200, paymentContent: '现金:200.00元', createTime: '2025-01-04 10:03', status: '完成',
    refunded: 0, remark: '', source: '收银系统', settled: true, operator: '王建国',
    items: [
      { name: '充200送100', originalPrice: 200.00, price: 200.00, quantity: 1, subtotal: 200.00, remark: '', refundedQty: 0, refundAmount: 0 },
    ],
    discounts: [],
  },
  {
    orderNo: '585317350083850507752054', shop: '利民街小展厅', member: '侯女士（13903019225）', product: '100元5次（1年有效）', amount: 100, discount: 0, paid: 0, paymentContent: '待支付', createTime: '2024-12-24 10:46', status: '待支付',
    refunded: 0, remark: '', source: '收银系统', settled: false, operator: '李小红',
    items: [
      { name: '100元5次（1年有效）', originalPrice: 100.00, price: 100.00, quantity: 1, subtotal: 100.00, remark: '', refundedQty: 0, refundAmount: 0 },
    ],
    discounts: [],
  },
  {
    orderNo: '5853173398878940507723026', shop: '利民街小展厅', member: '散客（未知）', product: '幻影飞碟', amount: 48, discount: 0, paid: 48, paymentContent: '线下支付宝:48.00元', createTime: '2024-12-12 15:18', status: '完成',
    refunded: 0, remark: '', source: '收银系统', settled: false, operator: '王建国',
    items: [
      { name: '幻影飞碟', originalPrice: 48.00, price: 48.00, quantity: 1, subtotal: 48.00, remark: '', refundedQty: 0, refundAmount: 0 },
    ],
    discounts: [],
  },
  {
    orderNo: '585317339722770507787072', shop: '利民街小展厅', member: '散客（未知）', product: '暗黑双子星', amount: 20, discount: 0, paid: 20, paymentContent: '线下支付宝:20.00元', createTime: '2024-12-12 10:57', status: '完成',
    refunded: 0, remark: '', source: '收银系统', settled: true, operator: '李小红',
    items: [
      { name: '暗黑双子星', originalPrice: 20.00, price: 20.00, quantity: 1, subtotal: 20.00, remark: '', refundedQty: 0, refundAmount: 0 },
    ],
    discounts: [],
  },
  {
    orderNo: '585317339722430507710651', shop: '利民街小展厅', member: '散客（未知）', product: '暗黑双子星', amount: 20, discount: 0, paid: 20, paymentContent: '线下支付宝:20.00元', createTime: '2024-12-12 10:57', status: '完成',
    refunded: 0, remark: '', source: '收银系统', settled: true, operator: '王建国',
    items: [
      { name: '暗黑双子星', originalPrice: 20.00, price: 20.00, quantity: 1, subtotal: 20.00, remark: '', refundedQty: 0, refundAmount: 0 },
    ],
    discounts: [],
  },
  {
    orderNo: '585317339722140507740638', shop: '利民街小展厅', member: '散客（未知）', product: '幻影时空', amount: 20, discount: 0, paid: 20, paymentContent: '线下支付宝:20.00元', createTime: '2024-12-12 10:56', status: '完成',
    refunded: 0, remark: '', source: '收银系统', settled: true, operator: '李小红',
    items: [
      { name: '幻影时空', originalPrice: 20.00, price: 20.00, quantity: 1, subtotal: 20.00, remark: '', refundedQty: 0, refundAmount: 0 },
    ],
    discounts: [],
  },
  {
    orderNo: '585317330011220507331122', shop: '利民街小展厅', member: '张伟（13800138000）', product: '亲子套票+幻影飞碟', amount: 346, discount: 48, paid: 298, paymentContent: '微信:298.00元', createTime: '2025-01-15 14:30', status: '完成',
    refunded: 0, remark: '会员日活动', source: '收银系统', settled: true, operator: '李小红',
    items: [
      { name: '亲子套票', originalPrice: 298.00, price: 268.00, quantity: 1, subtotal: 268.00, remark: '会员价', refundedQty: 0, refundAmount: 0 },
      { name: '幻影飞碟', originalPrice: 48.00, price: 30.00, quantity: 1, subtotal: 30.00, remark: '搭配优惠', refundedQty: 0, refundAmount: 0 },
    ],
    discounts: [
      { type: '会员折扣', name: '金卡会员9折', amount: 30.00, action: '自动抵扣' },
      { type: '满减优惠', name: '满300减18', amount: 18.00, action: '自动抵扣' },
    ],
  },
  {
    orderNo: '585317330022330507442233', shop: '利民街小展厅', member: '李娜（13900139000）', product: '充500送200+暗黑战场', amount: 580, discount: 80, paid: 500, paymentContent: '支付宝:500.00元', createTime: '2025-01-16 10:15', status: '完成',
    refunded: 0, remark: '新客首充', source: '小程序', settled: false, operator: '小程序用户',
    items: [
      { name: '充500送200', originalPrice: 500.00, price: 500.00, quantity: 1, subtotal: 500.00, remark: '首充优惠', refundedQty: 0, refundAmount: 0 },
      { name: '暗黑战场', originalPrice: 80.00, price: 0.00, quantity: 1, subtotal: 0.00, remark: '首充赠送', refundedQty: 0, refundAmount: 0 },
    ],
    discounts: [
      { type: '首充赠送', name: '新客首充赠券', amount: 80.00, action: '赠送' },
    ],
  },
  {
    orderNo: '585317330033440507553344', shop: '利民街小展厅', member: '散客（未知）', product: 'VR全家桶套餐', amount: 399, discount: 100, paid: 299, paymentContent: '现金:299.00元', createTime: '2025-01-17 16:45', status: '已退款',
    refunded: 299, remark: '设备故障退款', source: '收银系统', settled: false, operator: '王建国',
    items: [
      { name: 'VR全家桶套餐', originalPrice: 399.00, price: 299.00, quantity: 1, subtotal: 299.00, remark: '限时特价', refundedQty: 1, refundAmount: 299 },
    ],
    discounts: [
      { type: '限时特惠', name: '春节早鸟价', amount: 100.00, action: '立减' },
    ],
  },
])

const filteredData = computed(() => {
  let data = rawData.value
  if (filterShop.value) data = data.filter(d => d.shop === filterShop.value)
  if (filterOrderNo.value) data = data.filter(d => d.orderNo.includes(filterOrderNo.value))
  if (filterPhone.value) data = data.filter(d => d.member.includes(filterPhone.value))
  if (filterSource.value) data = data.filter(d => d.source === filterSource.value)
  if (filterStatus.value) data = data.filter(d => d.status === filterStatus.value)
  if (filterSettled.value) data = data.filter(d => (filterSettled.value === '已结算') === d.settled)
  return data
})

function resetFilter() {
  filterShop.value = null
  filterOrderNo.value = ''
  filterPhone.value = ''
  filterSource.value = null
  filterStatus.value = null
  filterSettled.value = null
  dateRange.value = null
}

function exportData() {
  console.log('导出收银订单')
}

function openRefund() {
  refundMethod.value = 'original'
  allowPointsRefund.value = false
  refundReason.value = null
  refundReasonCustom.value = ''
  receiptFileList.value = []
  // 整单退款：不再维护每件商品的"本次退货数"
  if (detailRow.value?.items) {
    refundItems.value = detailRow.value.items.map((item: any) => ({
      ...item,
      currentRefundQty: 0,
    }))
  } else {
    refundItems.value = []
  }
  showRefund.value = true
}

function refundAll() {
  // 整单退：已结算时直接按实付金额退（不需要逐件勾选）
  if (isSettled.value) {
    window.$message?.info('已结算订单请直接确认退款')
  }
}

function confirmRefund() {
  // 整单退款：不再校验退货数，直接按 refundTotalAmount 处理
  const total = refundTotalAmount.value
  if (total <= 0) {
    window.$message?.warning('该订单已无金额可退')
    return
  }

  const reason = refundReason.value === '其他' ? refundReasonCustom.value : refundReason.value
  if (!reason) {
    window.$message?.warning('请选择退款原因')
    return
  }

  // 已结算订单必须上传凭证
  if (isSettled.value && receiptFileList.value.length === 0) {
    window.$message?.warning('请上传线下退款凭证')
    return
  }

  if (detailRow.value) {
    detailRow.value.refundReason = reason
    detailRow.value.refundOperator = '当前收银员' // TODO: 对接真实登录用户
    detailRow.value.refundTime = new Date().toLocaleString()

    if (isSettled.value) {
      // 已结算 → 线下退款，标记待确认
      detailRow.value.status = '已退款'
      detailRow.value.refundMethod = '线下退款'
      detailRow.value.refundReceipt = receiptFileList.value.length > 0 ? receiptFileList.value[0].name : ''
      detailRow.value.refunded = total
      // 整单退：所有商品标记为已退
      if (detailRow.value.items) {
        detailRow.value.items.forEach((item: any) => {
          item.refundedQty = item.quantity
          item.refundAmount = item.subtotal || item.price * item.quantity
        })
      }
      showRefund.value = false
      showDetail.value = false
      window.$message?.success(`已标记线下退款，退款金额 ¥${total.toFixed(2)}`)
    } else {
      // 未结算 → 调拉卡拉退款
      detailRow.value.status = '退款中'
      detailRow.value.refundMethod = '拉卡拉原路退回'

      // 模拟异步回调：2秒后自动更新为已退款
      setTimeout(() => {
        if (detailRow.value) {
          detailRow.value.status = '已退款'
          detailRow.value.refunded = total
          detailRow.value.refundNo = 'RF' + Date.now() // 拉卡拉退款单号
          if (detailRow.value.items) {
            detailRow.value.items.forEach((item: any) => {
              item.refundedQty = item.quantity
              item.refundAmount = item.subtotal || item.price * item.quantity
            })
          }
          window.$message?.success(`拉卡拉退款成功，退款单号 ${detailRow.value.refundNo}`)
        }
      }, 2000)

      showRefund.value = false
      showDetail.value = false
      window.$message?.info('退款请求已提交，等待拉卡拉处理...')
    }
  }
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
.detail-content {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}
.detail-amounts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  background: linear-gradient(135deg, #3B82F6, #2563EB);
  border-radius: 12px;
  padding: 16px;
  color: white;
  min-width: 200px;
}
.amount-box {
  text-align: center;
}
.amount-value {
  font-size: 20px;
  font-weight: 600;
}
.amount-label {
  font-size: 12px;
  opacity: 0.9;
  margin-top: 4px;
}
.detail-info {
  flex: 1;
}
.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
}
.info-label {
  color: #666;
  min-width: 70px;
}
.detail-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
.refund-section {
  margin-bottom: 16px;
}
.refund-notice {
  position: relative;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
}
.notice-title {
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
}
.notice-list {
  margin: 0;
  padding-left: 16px;
  font-size: 12px;
  color: #888;
  line-height: 1.8;
}
.refund-all-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
}
.refund-points {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #333;
}
.refund-total {
  font-size: 14px;
  color: #333;
  margin-bottom: 12px;
}
.total-amount {
  color: #e74c3c;
  font-size: 18px;
  font-weight: 600;
}
.refund-method {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}
.method-label {
  font-size: 13px;
  color: #333;
}
.refund-reason {
  margin-bottom: 16px;
  padding: 12px;
  background: #fff8e1;
  border-radius: 8px;
}
.refund-receipt {
  margin-bottom: 16px;
  padding: 12px;
  background: #f0fdf4;
  border-radius: 8px;
}
.receipt-label {
  font-size: 13px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 500;
}
.receipt-hint {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}
.refund-method.offline {
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 6px;
}
.reason-label {
  font-size: 13px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 500;
}
.refund-detail {
  font-size: 13px;
  color: #666;
  padding-left: 8px;
  margin-bottom: 8px;
}
.refund-detail span {
  display: block;
  margin-bottom: 4px;
}
.method-text {
  font-size: 13px;
  color: #333;
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
