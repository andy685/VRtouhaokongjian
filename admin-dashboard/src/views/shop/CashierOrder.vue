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
    <n-modal v-model:show="showRefund" preset="card" title="退货" style="width: 560px;" :bordered="false" :mask-closable="false">
      <div class="refund-section">
        <n-data-table
          :columns="refundColumns"
          :data="refundItems"
          :bordered="true"
          :single-line="false"
          size="small"
        />
      </div>
      <div class="refund-notice">
        <div class="notice-title">注意：</div>
        <ul class="notice-list">
          <li>组合支付的订单只能整单退</li>
          <li>预存款支付的金额只能原路退回</li>
        </ul>
        <n-button size="small" class="refund-all-btn" @click="refundAll">全退</n-button>
      </div>
      <div class="refund-points">
        <span>积分不足时允许退款：</span>
        <n-switch v-model:value="allowPointsRefund" size="small" />
      </div>
      <div class="refund-total">
        本次退款总额：<span class="total-amount">¥{{ refundTotalAmount.toFixed(2) }}</span>
      </div>
      <div class="refund-method">
        <div class="method-label">退款方式：</div>
        <span class="method-text">原路退款</span>
      </div>
      <div class="refund-detail" v-if="detailRow">
        <span v-for="(pay, idx) in paymentMethods" :key="idx">{{ pay.method }}：¥{{ pay.amount.toFixed(2) }}</span>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showRefund = false">取消</n-button>
          <n-button type="primary" @click="confirmRefund">退款</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 订单详情弹窗 -->
    <n-modal v-model:show="showDetail" preset="card" title="订单详情" style="width: 560px;" :bordered="false">
      <n-descriptions v-if="detailRow" :column="2" bordered label-placement="left" size="small">
        <n-descriptions-item label="订单号">{{ detailRow.orderNo }}</n-descriptions-item>
        <n-descriptions-item label="所属店铺">{{ detailRow.shop }}</n-descriptions-item>
        <n-descriptions-item label="会员">{{ detailRow.member || '散客' }}</n-descriptions-item>
        <n-descriptions-item label="订单状态">
          <n-tag type="info" size="small">{{ detailRow.status }}</n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="应收金额">¥{{ detailRow.amount.toFixed(2) }}</n-descriptions-item>
        <n-descriptions-item label="优惠金额">¥{{ detailRow.discount.toFixed(2) }}</n-descriptions-item>
        <n-descriptions-item label="实收金额">¥{{ detailRow.paid.toFixed(2) }}</n-descriptions-item>
        <n-descriptions-item label="已退金额">¥{{ detailRow.refunded.toFixed(2) }}</n-descriptions-item>
        <n-descriptions-item label="来源">{{ detailRow.source || '收银系统' }}</n-descriptions-item>
        <n-descriptions-item label="交易时间">{{ detailRow.createTime }}</n-descriptions-item>
        <n-descriptions-item label="订单备注" :span="2">{{ detailRow.remark || '--' }}</n-descriptions-item>
      </n-descriptions>
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
      <div v-if="detailRow?.discounts?.length" class="detail-section">
        <h3 class="section-title">优惠详情</h3>
        <n-data-table
          :columns="discountColumns"
          :data="detailRow.discounts"
          :bordered="true"
          :single-line="false"
          size="small"
        />
      </div>
      <template #footer>
        <n-space justify="center">
          <n-button v-if="detailRow?.status === '完成'" size="small" @click="openRefund">
            <template #icon><n-icon :component="RefreshOutline" /></template>
            退款
          </n-button>
          <n-button @click="showDetail = false">关闭</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NDataTable, NButton, NIcon, NModal, NForm, NFormItem,
  NSelect, NInput, NInputNumber, NDatePicker, NSpace, NTag, NEmpty,
  NRadioGroup, NRadio, NSwitch, NDescriptions, NDescriptionsItem
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { FilterOutline, DownloadOutline, PrintOutline, RefreshOutline } from '@vicons/ionicons5'

  const showFilter = ref(false)
const showDetail = ref(false)
const showRefund = ref(false)
const detailRow = ref<any>(null)
const refundRemark = ref('')

const filterShop = ref<string | null>(null)
const filterOrderNo = ref('')
const filterPhone = ref('')
const filterSource = ref<string | null>(null)
const filterStatus = ref<string | null>(null)
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

const refundAmount = ref<number | null>(null)
const refundItems = ref<any[]>([])
const refundMethod = ref('original')
const allowPointsRefund = ref(false)

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

const refundTotalAmount = computed(() => {
  return refundItems.value.reduce((sum, item) => sum + item.currentRefundQty * item.price, 0)
})

const paymentMethods = computed(() => {
  if (!detailRow.value?.paymentContent) return []
  const parts = detailRow.value.paymentContent.split(/[,，]/)
  return parts.map((p: string) => {
    const match = p.match(/(.+?)[:：]\s*([\d.]+)/)
    if (match) {
      return { method: match[1], amount: parseFloat(match[2]) }
    }
    const numMatch = p.match(/([\d.]+)/)
    return { method: '现金', amount: parseFloat(numMatch?.[1] || '0') }
  })
})

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
  { title: '支付内容', key: 'paymentContent', minWidth: 140, align: 'center' },
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
  { title: '会员/散客', key: 'member', width: 150, align: 'center' },
  {
    title: '操作',
    key: 'actions',
    width: 70,
    align: 'center',
    render(row: any) {
      return h(NButton, { size: 'small', type: 'primary', text: true, onClick: () => openDetail(row) }, { default: () => '详情' })
    },
  },
]

const detailColumns: DataTableColumns = [
  { title: '售卖名称', key: 'name', minWidth: 120 },
  { title: '原单价', key: 'originalPrice', width: 90, align: 'center', render: (row: any) => `¥${row.originalPrice.toFixed(2)}` },
  { title: '现单价', key: 'price', width: 90, align: 'center', render: (row: any) => `¥${row.price.toFixed(2)}` },
  { title: '数量', key: 'quantity', width: 70, align: 'center' },
  { title: '小计', key: 'subtotal', width: 90, align: 'center', render: (row: any) => `¥${row.subtotal.toFixed(2)}` },
  { title: '备注', key: 'remark', minWidth: 100, render: (row: any) => row.remark || '--' },
  { title: '已退数量', key: 'refundedQty', width: 90, align: 'center', render: (row: any) => row.refundedQty || 0 },
  { title: '退款金额', key: 'refundAmount', width: 100, align: 'center', render: (row: any) => `¥${(row.refundAmount || 0).toFixed(2)}` },
]

const discountColumns: DataTableColumns = [
  { title: '类型', key: 'type', width: 120, align: 'center' },
  { title: '名称', key: 'name', minWidth: 150 },
  { title: '优惠金额', key: 'amount', width: 110, align: 'center', render: (row: any) => `¥${row.amount.toFixed(2)}` },
  { title: '操作', key: 'action', width: 80, align: 'center' },
]

const rawData = ref([
  {
    orderNo: '585317365644510507768770', shop: '利民街小展厅', member: '散客（未知）', product: '暗黑战场', amount: 80, discount: 0, paid: 80, paymentContent: '现金:80.00元', createTime: '2025-01-11 11:00', status: '完成',
    refunded: 0, remark: '', source: '收银系统',
    items: [
      { name: '暗黑战场', originalPrice: 20.00, price: 20.00, quantity: 4, subtotal: 80.00, remark: '', refundedQty: 0, refundAmount: 0 },
    ],
    discounts: [],
  },
  {
    orderNo: '585317365644330507765412', shop: '利民街小展厅', member: '奥特曼（13903019429）', product: '充1000送1000,充300送100（一年有效）', amount: 1300, discount: 0, paid: 1300, paymentContent: '线下微信:1300.00元', createTime: '2025-01-11 11:00', status: '完成',
    refunded: 0, remark: '', source: '收银系统',
    items: [
      { name: '充1000送1000,充300送100', originalPrice: 1300.00, price: 1300.00, quantity: 1, subtotal: 1300.00, remark: '', refundedQty: 0, refundAmount: 0 },
    ],
    discounts: [],
  },
  {
    orderNo: '585317365644180507785875', shop: '利民街小展厅', member: '散客（未知）', product: '幻影时空', amount: 20, discount: 0, paid: 20, paymentContent: '线下支付宝:20.00元', createTime: '2025-01-11 11:00', status: '已退款',
    refunded: 20, remark: '客户要求退款', source: '收银系统',
    items: [
      { name: '幻影时空', originalPrice: 20.00, price: 20.00, quantity: 1, subtotal: 20.00, remark: '', refundedQty: 1, refundAmount: 20 },
    ],
    discounts: [],
  },
  {
    orderNo: '585317359562270507729610', shop: '利民街小展厅', member: '奥特曼（13903019429）', product: '充200送100', amount: 200, discount: 0, paid: 200, paymentContent: '现金:200.00元', createTime: '2025-01-04 10:03', status: '完成',
    refunded: 0, remark: '', source: '收银系统',
    items: [
      { name: '充200送100', originalPrice: 200.00, price: 200.00, quantity: 1, subtotal: 200.00, remark: '', refundedQty: 0, refundAmount: 0 },
    ],
    discounts: [],
  },
  {
    orderNo: '585317350083850507752054', shop: '利民街小展厅', member: '侯女士（13903019225）', product: '100元5次（1年有效）', amount: 100, discount: 0, paid: 0, paymentContent: '待支付', createTime: '2024-12-24 10:46', status: '待支付',
    refunded: 0, remark: '', source: '收银系统',
    items: [
      { name: '100元5次（1年有效）', originalPrice: 100.00, price: 100.00, quantity: 1, subtotal: 100.00, remark: '', refundedQty: 0, refundAmount: 0 },
    ],
    discounts: [],
  },
  {
    orderNo: '5853173398878940507723026', shop: '利民街小展厅', member: '散客（未知）', product: '幻影飞碟', amount: 48, discount: 0, paid: 48, paymentContent: '线下支付宝:48.00元', createTime: '2024-12-12 15:18', status: '完成',
    refunded: 0, remark: '', source: '收银系统',
    items: [
      { name: '幻影飞碟', originalPrice: 48.00, price: 48.00, quantity: 1, subtotal: 48.00, remark: '', refundedQty: 0, refundAmount: 0 },
    ],
    discounts: [],
  },
  {
    orderNo: '585317339722770507787072', shop: '利民街小展厅', member: '散客（未知）', product: '暗黑双子星', amount: 20, discount: 0, paid: 20, paymentContent: '线下支付宝:20.00元', createTime: '2024-12-12 10:57', status: '完成',
    refunded: 0, remark: '', source: '收银系统',
    items: [
      { name: '暗黑双子星', originalPrice: 20.00, price: 20.00, quantity: 1, subtotal: 20.00, remark: '', refundedQty: 0, refundAmount: 0 },
    ],
    discounts: [],
  },
  {
    orderNo: '585317339722430507710651', shop: '利民街小展厅', member: '散客（未知）', product: '暗黑双子星', amount: 20, discount: 0, paid: 20, paymentContent: '线下支付宝:20.00元', createTime: '2024-12-12 10:57', status: '完成',
    refunded: 0, remark: '', source: '收银系统',
    items: [
      { name: '暗黑双子星', originalPrice: 20.00, price: 20.00, quantity: 1, subtotal: 20.00, remark: '', refundedQty: 0, refundAmount: 0 },
    ],
    discounts: [],
  },
  {
    orderNo: '585317339722140507740638', shop: '利民街小展厅', member: '散客（未知）', product: '幻影时空', amount: 20, discount: 0, paid: 20, paymentContent: '线下支付宝:20.00元', createTime: '2024-12-12 10:56', status: '完成',
    refunded: 0, remark: '', source: '收银系统',
    items: [
      { name: '幻影时空', originalPrice: 20.00, price: 20.00, quantity: 1, subtotal: 20.00, remark: '', refundedQty: 0, refundAmount: 0 },
    ],
    discounts: [],
  },
  {
    orderNo: '585317330011220507331122', shop: '利民街小展厅', member: '张伟（13800138000）', product: '亲子套票+幻影飞碟', amount: 346, discount: 48, paid: 298, paymentContent: '微信:298.00元', createTime: '2025-01-15 14:30', status: '完成',
    refunded: 0, remark: '会员日活动', source: '收银系统',
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
    refunded: 0, remark: '新客首充', source: '小程序',
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
    refunded: 299, remark: '设备故障退款', source: '收银系统',
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
  return data
})

function resetFilter() {
  filterShop.value = null
  filterOrderNo.value = ''
  filterPhone.value = ''
  filterSource.value = null
  filterStatus.value = null
  dateRange.value = null
}

function exportData() {
  console.log('导出收银订单')
}

function openRefund() {
  refundMethod.value = 'original'
  allowPointsRefund.value = false
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
  refundItems.value = refundItems.value.map((item: any) => ({
    ...item,
    currentRefundQty: item.quantity - item.refundedQty,
  }))
}

function confirmRefund() {
  const totalQty = refundItems.value.reduce((sum, item) => sum + item.currentRefundQty, 0)
  if (totalQty <= 0) return
  const total = refundTotalAmount.value
  console.log('退款金额:', total)
  if (detailRow.value) {
    detailRow.value.status = '已退款'
    detailRow.value.refunded = total
    detailRow.value.items.forEach((item: any, idx: number) => {
      const refundQty = refundItems.value[idx]?.currentRefundQty || 0
      item.refundedQty += refundQty
      item.refundAmount += refundQty * item.price
    })
  }
  showRefund.value = false
  showDetail.value = false
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
</style>
