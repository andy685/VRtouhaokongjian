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
        <n-descriptions-item label="所属店铺">{{ currentOrder.shop }}</n-descriptions-item>
        <n-descriptions-item label="会员">{{ currentOrder.member }}</n-descriptions-item>
        <n-descriptions-item label="金额">¥{{ currentOrder.amount.toFixed(2) }}</n-descriptions-item>
        <n-descriptions-item label="订单状态">
          <n-tag :type="statusType(currentOrder.status)" size="small">{{ currentOrder.status }}</n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="交易时间">{{ currentOrder.createTime }}</n-descriptions-item>
        <n-descriptions-item label="点播内容">{{ currentOrder.gameFilm }}</n-descriptions-item>
        <n-descriptions-item label="时长">{{ currentOrder.duration }}</n-descriptions-item>
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
        <n-data-table :columns="detailColumns" :data="currentOrder.details" :bordered="true" :single-line="false" size="small" />
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
    <n-modal v-model:show="showRefund" preset="card" :title="isSettled ? '线下退款' : '退款'" style="width: 520px;" :bordered="false" :mask-closable="false">
      <n-alert v-if="!isSettled" type="info" :bordered="false" style="margin-bottom:12px;">
        该订单<strong>未结算</strong>，将自动通过拉卡拉原路退回。
      </n-alert>
      <n-alert v-else type="warning" :bordered="false" style="margin-bottom:12px;">
        该订单<strong>已结算</strong>，款项已到商家账户。请商家线下退款给用户后，上传凭证并确认。
      </n-alert>
      <n-descriptions :column="2" bordered label-placement="left" size="small">
        <n-descriptions-item label="订单号">{{ currentOrder?.orderNo }}</n-descriptions-item>
        <n-descriptions-item label="点播内容">{{ currentOrder?.gameFilm }}</n-descriptions-item>
        <n-descriptions-item label="退款金额">
          <span style="font-size:16px;font-weight:600;color:#EF4444;">¥{{ currentOrder?.amount?.toFixed(2) || '0.00' }}</span>
        </n-descriptions-item>
        <n-descriptions-item label="退款方式">
          {{ isSettled ? '线下退款（现金/转账）' : '拉卡拉原路退回' }}
        </n-descriptions-item>
      </n-descriptions>
      <div class="refund-reason" style="margin-top:16px;">
        <div style="margin-bottom:6px;font-weight:500;">退款原因 <span style="color:#EF4444;">*</span></div>
        <n-select v-model:value="refundReason" :options="refundReasonOptions" placeholder="请选择退款原因" style="margin-bottom:8px;" />
        <n-input v-if="refundReason === '其他'" v-model:value="refundReasonCustom" type="textarea" :rows="2" placeholder="请详细描述退款原因" />
      </div>
      <div v-if="isSettled" style="margin-top:12px;">
        <div style="margin-bottom:6px;font-weight:500;">线下退款凭证（选填）</div>
        <n-upload action="/api/upload" accept=".jpg,.png,.jpeg" :max="1" v-model:file-list="refundReceiptFiles" list-type="image-card">
          <n-button size="tiny">📎 上传转账截图</n-button>
        </n-upload>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showRefund = false">取消</n-button>
          <n-button :type="isSettled ? 'warning' : 'primary'" @click="confirmRefund">
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
  NDescriptions, NDescriptionsItem, NAlert, NUpload,
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { FilterOutline, DownloadOutline } from '@vicons/ionicons5'
import { useExceptionOrders } from '@/composables/useExceptionOrders'
import MarkExceptionDialog from '@/components/MarkExceptionDialog.vue'

const { openMarkDialog, isMarked, unmarkOrder } = useExceptionOrders()

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
    window.$message?.warning('请选择退款原因')
    return
  }
  if (currentOrder.value) {
    currentOrder.value.refundReason = reason
    currentOrder.value.refundTime = new Date().toLocaleString()
    if (isSettled.value) {
      currentOrder.value.status = '已退款'
      currentOrder.value.refundMethod = '线下退款'
      currentOrder.value.refundReceipt = refundReceiptFiles.value.length > 0 ? refundReceiptFiles.value[0].name : ''
      window.$message?.success(`已标记线下退款，退款金额 ¥${currentOrder.value.amount.toFixed(2)}`)
    } else {
      currentOrder.value.status = '退款中'
      currentOrder.value.refundMethod = '拉卡拉原路退回'
      setTimeout(() => {
        if (currentOrder.value) {
          currentOrder.value.status = '已退款'
          currentOrder.value.refundNo = 'RF' + Date.now()
          window.$message?.success(`拉卡拉退款成功，退款单号 ${currentOrder.value.refundNo}`)
        }
      }, 2000)
      window.$message?.info('退款请求已提交，等待拉卡拉处理...')
    }
    showRefund.value = false
    showDetail.value = false
  }
}

function parsePayments(paymentContent: string) {
  if (!paymentContent) return []
  const parts = paymentContent.split(/[,，]/)
  return parts.map((p: string) => {
    const match = p.match(/(.+?)[:：]\s*([\d.]+)/)
    if (match) {
      const method = match[1]; const amount = parseFloat(match[2])
      const color = method.includes('预存款') || method.includes('余额') ? '#6366f1'
        : method.includes('微信') ? '#07c160' : method.includes('支付宝') ? '#1677ff'
        : method.includes('游戏币') ? '#f59e0b' : method.includes('现金') ? '#64748b' : '#64748b'
      return { method, amount, color }
    }
    return null
  }).filter(Boolean)
}

const onDemandPayments = computed(() => parsePayments(currentOrder.value?.paymentContent || ''))

const paymentColumns: DataTableColumns = [
  { title: '支付方式', key: 'method', width: 140, align: 'center', render: (row: any) => h('span', { style: `color:${row.color};font-weight:500;` }, row.method) },
  { title: '金额', key: 'amount', width: 120, align: 'center', render: (row: any) => `¥${row.amount.toFixed(2)}` },
]

const filterShop = ref<string | null>(null)
const filterDevice = ref('')
const filterGameFilm = ref('')
const dateRange = ref<[number, number] | null>(null)

const shopOptions = [
  { label: '利民街小展厅', value: '利民街小展厅' },
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
  { title: '操作', key: 'action', width: 160, align: 'center', render: (row: any) => h(NSpace, { size: 4 }, { default: () => [h(NButton, { type: 'primary', size: 'small', text: true, onClick: () => openDetail(row) }, { default: () => '详情' }), isMarked(row.orderNo) ? h(NButton, { type: 'warning', size: 'small', text: true, onClick: () => { unmarkOrder(row.orderNo); window.$message?.info('已取消标记') } }, { default: () => '取消标记' }) : h(NButton, { type: 'warning', size: 'small', text: true, onClick: () => { if (!openMarkDialog({ orderNo: row.orderNo, store: row.shop, amount: `¥${row.amount.toFixed(2)}` })) window.$message?.warning('该订单已在异常列表中') } }, { default: () => '标记异常' })] }) },
]

const detailColumns: DataTableColumns = [
  { title: '项目', key: 'item', align: 'center' },
  { title: '内容', key: 'content', align: 'center' },
]

const rawData = ref([
  // 混合支付示例（预存款+微信支付）
  {
    orderNo: 'MX202605070003', shop: '利民街小展厅', device: '幻影飞碟', gameFilm: '过山车VR', type: 'VR', duration: '10分钟', amount: 36.10, member: '张小明(139****5678)', createTime: '2026-05-07 11:00', status: '已完成', paymentContent: '预存款:26.10,微信支付:10.00', settled: false, source: '小程序', remark: '金卡95折',
    details: [
      { item: '支付方式', content: '预存款+微信支付' },
      { item: '优惠', content: '金卡95折, 游戏币抵扣260币' },
      { item: '实付', content: '微信支付 ¥10.00' },
    ], payMethod: '混合支付',
  },
  {
    orderNo: 'OD202307250001', shop: '利民街小展厅', device: '幻影飞碟', gameFilm: '星际穿越', type: 'VR', duration: '15分钟', amount: 48.00, member: '散客', createTime: '2023-07-25 12:54', status: '已完成', paymentContent: '微信支付:48.00', settled: true, source: '点播系统', remark: '',
    details: [
      { item: '点播内容', content: '星际穿越' },
      { item: '设备名称', content: '幻影飞碟' },
      { item: '体验人数', content: '2人' },
      { item: '支付方式', content: '直接支付' },
      { item: '支付金额', content: '¥48.00' },
    ], payMethod: '微信支付',
  },
  {
    orderNo: 'OD202307250002', shop: '利民街小展厅', device: '暗黑机甲22版', gameFilm: '机甲风暴', type: 'VR', duration: '20分钟', amount: 58.00, member: '138****1234', createTime: '2023-07-25 11:30', status: '已完成', paymentContent: '余额:58.00', settled: false, source: '点播系统', remark: '',
    details: [
      { item: '点播内容', content: '机甲风暴' },
      { item: '设备名称', content: '暗黑机甲22版' },
      { item: '体验人数', content: '1人' },
      { item: '支付方式', content: '会员消费' },
      { item: '支付金额', content: '¥58.00' },
    ], payMethod: '余额',
  },
  {
    orderNo: 'OD202307250003', shop: '利民街小展厅', device: '暗黑战场[主控端]', gameFilm: '僵尸围城', type: 'VR', duration: '10分钟', amount: 38.00, member: '139****5678', createTime: '2023-07-25 10:47', status: '进行中', paymentContent: '预存次数:38.00', settled: false, source: '点播系统', remark: '',
    details: [
      { item: '点播内容', content: '僵尸围城' },
      { item: '设备名称', content: '暗黑战场[主控端]' },
      { item: '体验人数', content: '1人' },
      { item: '支付方式', content: '预存次数' },
      { item: '支付金额', content: '¥38.00' },
    ], payMethod: '预存次数',
  },
  {
    orderNo: 'OD202307250004', shop: '利民街小展厅', device: '悬浮骑兵', gameFilm: '极速飞车', type: 'VR', duration: '12分钟', amount: 28.00, member: '137****9012', createTime: '2023-07-25 10:33', status: '已完成', paymentContent: '套票抵扣:28.00', settled: true, source: '点播系统', remark: '',
    details: [
      { item: '点播内容', content: '极速飞车' },
      { item: '设备名称', content: '悬浮骑兵' },
      { item: '体验人数', content: '1人' },
      { item: '支付方式', content: '套票抵扣' },
      { item: '支付金额', content: '¥28.00' },
    ], payMethod: '套票抵扣',
  },
  {
    orderNo: 'OD202307250005', shop: '利民街小展厅', device: '幻影飞碟', gameFilm: '深海探险', type: '银幕', duration: '25分钟', amount: 68.00, member: '136****3456', createTime: '2023-07-25 09:15', status: '已取消', paymentContent: '微信支付:68.00', settled: false, source: '点播系统', remark: '',
    details: [
      { item: '点播内容', content: '深海探险' },
      { item: '设备名称', content: '幻影飞碟' },
      { item: '体验人数', content: '3人' },
      { item: '支付方式', content: '直接支付' },
      { item: '支付金额', content: '¥68.00' },
    ], payMethod: '微信支付',
  },
  {
    orderNo: 'OD202307250006', shop: '利民街小展厅', device: '暗黑机甲22版', gameFilm: '恐龙世界', type: 'VR', duration: '18分钟', amount: 52.00, member: '散客', createTime: '2023-07-25 08:40', status: '已完成', paymentContent: '微信支付:52.00', settled: true, source: '点播系统', remark: '',
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
  return data
})

function resetFilter() {
  filterShop.value = null
  filterDevice.value = ''
  filterGameFilm.value = ''
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
</style>
