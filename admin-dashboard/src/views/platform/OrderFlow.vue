<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>{{ pageTitle }}</h1>
        <p class="header-desc">{{ pageDesc }}</p>
      </div>
      <n-space>
        <n-button type="primary" size="small" @click="showFilter = true">
          <template #icon><n-icon :component="FilterOutline" /></template>
          筛选
        </n-button>
        <n-button type="primary" size="small" @click="exportData">
          <template #icon><n-icon :component="DownloadOutline" /></template>
          导出
        </n-button>
      </n-space>
    </div>

    <n-data-table
      :columns="currentColumns"
      :data="filteredData"
      :pagination="pagination"
      :bordered="true"
      :single-line="false"
      size="small"
      :scroll-x="1800"
    />

    <!-- 筛选弹窗 -->
    <n-modal v-model:show="showFilter" preset="card" title="筛选条件" style="width: 420px;" :bordered="false">
      <n-form label-placement="left" label-width="80">
        <n-form-item label="商家">
          <n-select v-model:value="filterMerchant" :options="merchantOptions" placeholder="选择商家" clearable />
        </n-form-item>
        <n-form-item label="店铺">
          <n-select v-model:value="filterStore" :options="storeOptions" placeholder="选择店铺" clearable />
        </n-form-item>
        <n-form-item label="订单号">
          <n-input v-model:value="filterOrderNo" placeholder="输入订单号..." />
        </n-form-item>
        <template v-if="currentType === '点播系统订单'">
          <n-form-item label="设备">
            <n-input v-model:value="filterVodDevice" placeholder="输入设备名称..." clearable />
          </n-form-item>
          <n-form-item label="异常">
            <n-select v-model:value="filterVodException" :options="vodExceptionOptions" placeholder="全部异常状态" clearable />
          </n-form-item>
        </template>
        <n-form-item label="日期范围">
          <n-date-picker type="daterange" clearable v-model:value="filterDateRange" style="width: 100%;" />
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
      <template v-if="detailRow">
        <!-- 收银订单详情 -->
        <template v-if="detailRow.type === '收银订单'">
          <n-descriptions :column="2" bordered label-placement="left" size="small">
            <n-descriptions-item label="订单号">{{ detailRow.orderNo }}</n-descriptions-item>
            <n-descriptions-item label="商家">{{ detailRow.merchant }}</n-descriptions-item>
            <n-descriptions-item label="店铺">{{ detailRow.store }}</n-descriptions-item>
            <n-descriptions-item label="金额">¥{{ detailRow.amount.toFixed(2) }}</n-descriptions-item>
            <n-descriptions-item label="订单状态">
              <n-tag :type="isRefunded(detailRow) ? 'error' : 'success'" size="small">{{ detailRow.status }}</n-tag>
            </n-descriptions-item>
            <n-descriptions-item label="交易时间">{{ detailRow.time }}</n-descriptions-item>
            <n-descriptions-item label="操作人">{{ detailRow.operator }}</n-descriptions-item>
            <n-descriptions-item label="来源">{{ detailRow.source || '收银系统' }}</n-descriptions-item>
            <n-descriptions-item label="备注" :span="2">{{ detailRow.remark || '--' }}</n-descriptions-item>
          </n-descriptions>
          <div class="detail-section">
            <h3 class="section-title">支付方式</h3>
            <n-data-table :columns="paymentColumns" :data="parseOrderPayments(detailRow)" :bordered="true" :single-line="false" size="small" />
          </div>
          <div v-if="detailRow.orderItems?.length" class="detail-section">
            <h3 class="section-title">售卖详情</h3>
            <n-data-table :columns="cashierItemColumns" :data="detailRow.orderItems" :bordered="true" :single-line="false" size="small" />
          </div>
        </template>
        <!-- 点播系统订单详情 -->
        <template v-else-if="detailRow.type === '点播系统订单'">
          <n-descriptions :column="2" bordered label-placement="left" size="small">
            <n-descriptions-item label="订单号">{{ detailRow.orderNo }}</n-descriptions-item>
            <n-descriptions-item label="商家">{{ detailRow.merchant }}</n-descriptions-item>
            <n-descriptions-item label="店铺">{{ detailRow.store }}</n-descriptions-item>
            <n-descriptions-item label="金额">¥{{ detailRow.amount.toFixed(2) }}</n-descriptions-item>
            <n-descriptions-item label="订单状态">
              <n-tag :type="isRefunded(detailRow) ? 'error' : 'success'" size="small">{{ detailRow.status }}</n-tag>
            </n-descriptions-item>
            <n-descriptions-item label="交易时间">{{ detailRow.time }}</n-descriptions-item>
            <n-descriptions-item label="操作人">{{ detailRow.operator || '--' }}</n-descriptions-item>
            <n-descriptions-item label="来源">{{ detailRow.source || '点播系统' }}</n-descriptions-item>
            <n-descriptions-item label="设备">{{ detailRow.vodDevice || '--' }}</n-descriptions-item>
            <n-descriptions-item label="设备类型">{{ detailRow.vodDeviceType || '--' }}</n-descriptions-item>
            <n-descriptions-item label="核销方式">{{ detailRow.vodVerifyMode || '--' }}</n-descriptions-item>
            <n-descriptions-item label="结束原因">{{ detailRow.vodEndReason || '正常完成' }}</n-descriptions-item>
            <n-descriptions-item label="异常状态">
              <n-tag :type="detailRow.vodExceptionStatus === '正常' ? 'success' : 'warning'" size="small">{{ detailRow.vodExceptionStatus || '正常' }}</n-tag>
            </n-descriptions-item>
            <n-descriptions-item label="异常类型">{{ detailRow.vodExceptionType || '--' }}</n-descriptions-item>
            <n-descriptions-item label="备注" :span="2">{{ detailRow.remark || '--' }}</n-descriptions-item>
          </n-descriptions>
          <div class="detail-section">
            <h3 class="section-title">支付方式</h3>
            <n-data-table :columns="paymentColumns" :data="parseOrderPayments(detailRow)" :bordered="true" :single-line="false" size="small" />
          </div>
          <div class="detail-section">
            <h3 class="section-title">点播明细</h3>
            <n-data-table :columns="vodDetailColumns" :data="[{ content: detailRow.vodName, device: detailRow.vodDevice || '-', verifyMode: detailRow.vodVerifyMode || '-', duration: detailRow.vodDuration || '-', endReason: detailRow.vodEndReason || '正常完成', exceptionType: detailRow.vodExceptionType || '无', price: '¥' + detailRow.amount.toFixed(2) }]" :bordered="true" :single-line="false" size="small" />
          </div>
        </template>
        <!-- 手动扣费订单详情 -->
        <template v-else-if="detailRow.type === '手动扣费订单'">
          <n-descriptions :column="2" bordered label-placement="left" size="small">
            <n-descriptions-item label="订单号">{{ detailRow.orderNo }}</n-descriptions-item>
            <n-descriptions-item label="商家">{{ detailRow.merchant }}</n-descriptions-item>
            <n-descriptions-item label="店铺">{{ detailRow.store }}</n-descriptions-item>
            <n-descriptions-item label="扣费金额">¥{{ detailRow.amount.toFixed(2) }}</n-descriptions-item>
            <n-descriptions-item label="扣费原因" :span="2">{{ detailRow.reason }}</n-descriptions-item>
            <n-descriptions-item label="操作人">{{ detailRow.operator }}</n-descriptions-item>
            <n-descriptions-item label="时间">{{ detailRow.time }}</n-descriptions-item>
            <n-descriptions-item label="状态">
              <n-tag type="success" size="small">{{ detailRow.status }}</n-tag>
            </n-descriptions-item>
            <n-descriptions-item label="支付方式">{{ detailRow.paymentContent || '--' }}</n-descriptions-item>
          </n-descriptions>
        </template>
        <!-- 修改储值订单详情 -->
        <template v-else-if="detailRow.type === '修改储值订单'">
          <n-descriptions :column="2" bordered label-placement="left" size="small">
            <n-descriptions-item label="订单号">{{ detailRow.orderNo }}</n-descriptions-item>
            <n-descriptions-item label="商家">{{ detailRow.merchant }}</n-descriptions-item>
            <n-descriptions-item label="店铺">{{ detailRow.store }}</n-descriptions-item>
            <n-descriptions-item label="变更类型">
              <n-tag :type="detailRow.changeType === '充值' ? 'success' : 'error'" size="small">{{ detailRow.changeType }}</n-tag>
            </n-descriptions-item>
            <n-descriptions-item label="变更前余额">¥{{ detailRow.balanceBefore.toFixed(2) }}</n-descriptions-item>
            <n-descriptions-item label="变更后余额">¥{{ detailRow.balanceAfter.toFixed(2) }}</n-descriptions-item>
            <n-descriptions-item label="金额">¥{{ detailRow.amount.toFixed(2) }}</n-descriptions-item>
            <n-descriptions-item label="支付方式">{{ detailRow.paymentContent }}</n-descriptions-item>
            <n-descriptions-item label="操作人">{{ detailRow.operator }}</n-descriptions-item>
            <n-descriptions-item label="时间">{{ detailRow.time }}</n-descriptions-item>
            <n-descriptions-item label="状态">
              <n-tag type="success" size="small">{{ detailRow.status }}</n-tag>
            </n-descriptions-item>
          </n-descriptions>
        </template>
        <!-- 游戏币兑换订单详情 -->
        <template v-else-if="detailRow.type === '游戏币兑换订单'">
          <n-descriptions :column="2" bordered label-placement="left" size="small">
            <n-descriptions-item label="订单号">{{ detailRow.orderNo }}</n-descriptions-item>
            <n-descriptions-item label="商家">{{ detailRow.merchant }}</n-descriptions-item>
            <n-descriptions-item label="店铺">{{ detailRow.store }}</n-descriptions-item>
            <n-descriptions-item label="兑换游戏币">{{ detailRow.beanAmount }} 币</n-descriptions-item>
            <n-descriptions-item label="金额">¥{{ detailRow.amount.toFixed(2) }}</n-descriptions-item>
            <n-descriptions-item label="支付方式">{{ detailRow.paymentContent }}</n-descriptions-item>
            <n-descriptions-item label="状态">
              <n-tag type="success" size="small">{{ detailRow.status }}</n-tag>
            </n-descriptions-item>
            <n-descriptions-item label="时间">{{ detailRow.time }}</n-descriptions-item>
          </n-descriptions>
        </template>
        <!-- 活动赠送记录详情 -->
        <template v-else-if="detailRow.type === '活动赠送记录'">
          <n-descriptions :column="2" bordered label-placement="left" size="small">
            <n-descriptions-item label="订单号">{{ detailRow.orderNo }}</n-descriptions-item>
            <n-descriptions-item label="商家">{{ detailRow.merchant }}</n-descriptions-item>
            <n-descriptions-item label="店铺">{{ detailRow.store }}</n-descriptions-item>
            <n-descriptions-item label="活动名称">{{ detailRow.promoName }}</n-descriptions-item>
            <n-descriptions-item label="赠送内容" :span="2">{{ detailRow.giftContent }}</n-descriptions-item>
            <n-descriptions-item label="状态">
              <n-tag type="success" size="small">{{ detailRow.status }}</n-tag>
            </n-descriptions-item>
            <n-descriptions-item label="时间">{{ detailRow.time }}</n-descriptions-item>
          </n-descriptions>
        </template>
      </template>
      <template #footer>
        <n-space justify="center">
          <n-button @click="showDetail = false">关闭</n-button>
        </n-space>
      </template>
    </n-modal>

    <MarkExceptionDialog />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useRoute } from 'vue-router'
import {
  NDataTable, NButton, NIcon, NModal, NForm, NFormItem,
  NSelect, NInput, NDatePicker, NSpace, NTag,
  NDescriptions, NDescriptionsItem, useMessage,
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { FilterOutline, DownloadOutline } from '@vicons/ionicons5'
import { useExceptionOrders } from '@/composables/useExceptionOrders'
import MarkExceptionDialog from '@/components/MarkExceptionDialog.vue'

const message = useMessage()
const { openMarkDialog, isMarked, unmarkOrder } = useExceptionOrders()
const route = useRoute()

// 标记异常 - 弹出类型选择弹窗
function markAsException(row: any) {
  const storeName = row.store || ''
  const amount = row.type === '活动赠送记录' ? '¥0.00' : `¥${(row.amount || 0).toFixed(2)}`
  const defaultType = row.type === '点播系统订单' ? row.vodExceptionType : ''
  const defaultReason = row.type === '点播系统订单' && row.vodDevice
    ? `${row.vodDevice} / ${row.vodName || '点播内容'} / ${row.vodVerifyMode || '未知核销方式'}`
    : ''
  if (!openMarkDialog({ orderNo: row.orderNo, store: storeName, amount, source: '平台巡检', defaultType, defaultReason })) {
    message.warning('该订单已在异常列表中')
  }
}
function openDetail(row: any) {
  detailRow.value = row
  showDetail.value = true
}

// ===== 路由类型映射 =====
const routeTypeMap: Record<string, string | null> = {
  'PlatformOrderFlow': null,
  'PlatformOrderFlowCashier': '收银订单',
  'PlatformOrderFlowVod': '点播系统订单',
  'PlatformOrderFlowManual': '手动扣费订单',
  'PlatformOrderFlowBalance': '修改储值订单',
  'PlatformOrderFlowGamebean': '游戏币兑换订单',
  'PlatformOrderFlowPromo': '活动赠送记录',
}

const currentType = computed(() => routeTypeMap[route.name as string] ?? null)

const pageTitle = computed(() => currentType.value ? currentType.value : '全部订单')
const pageDesc = computed(() => {
  if (!currentType.value) return '查看全平台所有订单记录，支持按商家、店铺筛选'
  if (currentType.value === '活动赠送记录') return '查看活动赠送游戏币的记录，支持按商家、店铺、活动名称筛选'
  return `查看全平台${currentType.value}记录，支持按商家、店铺、订单号筛选`
})

// ===== 筛选状态 =====
const showFilter = ref(false)
const showDetail = ref(false)
const detailRow = ref<any>(null)

function isRefunded(row: any) {
  return row?.status === '已退款' || row?.status === '退款中'
}

function isExceptionMarked(row: any) {
  return row?.vodExceptionStatus === '异常' || isMarked(row.orderNo)
}

function cancelExceptionMark(row: any) {
  const removed = isMarked(row.orderNo) ? unmarkOrder(row.orderNo) : false
  if (row.vodExceptionStatus === '异常') {
    row.vodExceptionStatus = '正常'
    row.vodExceptionType = ''
  }
  if (removed || row.vodExceptionStatus === '正常') {
    message.info('已取消标记')
  }
}

const filterMerchant = ref<number | null>(null)
const filterStore = ref<number | null>(null)
const filterOrderNo = ref('')
const filterDateRange = ref<[number, number] | null>(null)
const filterVodDevice = ref('')
const filterVodException = ref<string | null>(null)

const merchantOptions = [
  { label: '恒然集团', value: 1 },
  { label: '幻影星空', value: 2 },
  { label: '利民街商家', value: 3 },
  { label: '党建馆集团', value: 4 },
  { label: '华东展厅', value: 5 },
]

const storeOptions = [
  { label: '恒然分部展厅', value: 1 },
  { label: '幻影星空馆 NO.8088', value: 2 },
  { label: '利民街大展厅', value: 3 },
  { label: '党建馆', value: 4 },
  { label: '华东展厅', value: 5 },
]

const vodExceptionOptions = [
  { label: '正常', value: '正常' },
  { label: '异常', value: '异常' },
]

interface PaymentItem {
  method: string
  amount: number
  color: string
}

// 支付方式解析
function parsePayments(paymentContent: string): PaymentItem[] {
  if (!paymentContent || paymentContent === '待支付') return []
  const parts = paymentContent.split(/[,，]/)
  return parts.reduce<PaymentItem[]>((result, p: string) => {
    const match = p.match(/(.+?)[:：]\s*([\d.]+)/)
    if (match) {
      const method = match[1]
      const amount = parseFloat(match[2])
      const color = method.includes('预存款') || method.includes('余额') ? '#6366f1'
        : method.includes('微信') ? '#07c160'
        : method.includes('支付宝') ? '#1677ff'
        : method.includes('游戏币') ? '#f59e0b'
        : method.includes('现金') ? '#64748b'
        : method.includes('后台') ? '#94a3b8'
        : '#64748b'
      result.push({ method, amount, color })
    }
    return result
  }, [])
}

function parseOrderPayments(row: any) {
  return parsePayments(row.paymentContent || '')
}

// 支付方式表格列
const paymentColumns: DataTableColumns = [
  { title: '支付方式', key: 'method', width: 140, align: 'center', render: (row: any) => h('span', { style: `color:${row.color};font-weight:500;` }, row.method) },
  { title: '金额', key: 'amount', width: 120, align: 'center', render: (row: any) => `¥${row.amount.toFixed(2)}` },
]

// 售卖详情表格列
const cashierItemColumns: DataTableColumns = [
  { title: '商品名称', key: 'name', minWidth: 140 },
  { title: '单价', key: 'price', width: 90, align: 'center' },
  { title: '数量', key: 'quantity', width: 70, align: 'center' },
  { title: '小计', key: 'subtotal', width: 100, align: 'center' },
]

// ===== Mock 数据 =====
const allData = ref([
  // === 收银订单 ===
  { id: 1, orderNo: 'CO202309160001', merchant: '恒然集团', store: '恒然分部展厅', type: '收银订单', amount: 128.00, paymentContent: '微信支付:128.00', time: '2023-09-16 16:25:10', status: '已完成', operator: '王建国', settled: false, source: '收银系统', remark: '', orderItems: [{ name: 'VR体验', price: '¥98.00', quantity: 1, subtotal: '¥98.00' }, { name: '饮料', price: '¥15.00', quantity: 2, subtotal: '¥30.00' }] },
  { id: 3, orderNo: 'CO202309160005', merchant: '华东展厅', store: '华东展厅', type: '收银订单', amount: 88.00, paymentContent: '微信支付:88.00', time: '2023-09-16 16:05:18', status: '已完成', operator: '张运营', settled: true, source: '收银系统', remark: '', orderItems: [{ name: '单次体验', price: '¥88.00', quantity: 1, subtotal: '¥88.00' }] },
  { id: 0, orderNo: 'MX202605070001', merchant: '利民街商家', store: '利民街大展厅', type: '收银订单', amount: 36.10, paymentContent: '预存款:26.10,微信支付:10.00', time: '2026-05-07 10:30:00', status: '已完成', operator: '李小红', settled: false, source: '小程序', remark: '会员95折', orderItems: [{ name: '过山车VR', price: '¥36.10', quantity: 1, subtotal: '¥36.10' }] },
  { id: 20, orderNo: 'CO20260415020', merchant: '幻影星空', store: '幻影星空馆 NO.8088', type: '收银订单', amount: 298.00, paymentContent: '支付宝:298.00', time: '2026-04-15 14:22:00', status: '已完成', operator: '赵前台', settled: true, source: '收银系统', remark: '会员日活动', orderItems: [{ name: '亲子套票', price: '¥298.00', quantity: 1, subtotal: '¥298.00' }] },
  // === 点播系统订单 ===
  { id: 4, orderNo: 'OD202309160002', merchant: '幻影星空', store: '幻影星空馆 NO.8088', type: '点播系统订单', amount: 45.00, paymentContent: '余额:45.00', time: '2023-09-16 16:20:33', status: '已完成', operator: '系统自动', settled: false, source: '点播系统', remark: '', vodName: '过山车VR', vodDevice: '暗黑机甲22版', vodDeviceType: 'VR设备', vodVerifyMode: '会员码反扫', vodEndReason: '正常完成', vodExceptionStatus: '正常', vodExceptionType: '', vodDuration: '10分钟' },
  { id: 5, orderNo: 'OD202309160004', merchant: '党建馆集团', store: '党建馆', type: '点播系统订单', amount: 30.00, paymentContent: '游戏币:30.00', time: '2023-09-16 16:10:45', status: '已完成', operator: '系统自动', settled: true, source: '点播系统', remark: '', vodName: '恐怖医院', vodDevice: '幻影飞碟', vodDeviceType: 'VR设备', vodVerifyMode: '小程序主动扫码', vodEndReason: '正常完成', vodExceptionStatus: '正常', vodExceptionType: '', vodDuration: '15分钟' },
  { id: 14, orderNo: 'MX202605070002', merchant: '利民街商家', store: '利民街大展厅', type: '点播系统订单', amount: 36.10, paymentContent: '预存款:26.10,微信支付:10.00', time: '2026-05-07 11:00:00', status: '已完成', operator: '系统自动', settled: false, source: '点播系统', remark: '', vodName: '过山车VR', vodDevice: '暗黑战场[主控端]', vodDeviceType: '主机串流', vodVerifyMode: '店员扫码点播', vodEndReason: '正常完成', vodExceptionStatus: '正常', vodExceptionType: '', vodDuration: '12分钟' },
  { id: 24, orderNo: 'OD202604230018', merchant: '利民街商家', store: '利民街大展厅', type: '点播系统订单', amount: 68.00, paymentContent: '微信支付:68.00', time: '2026-04-23 15:42:00', status: '已完成', operator: '系统自动', settled: false, source: '点播系统', remark: '已记录异常，待门店复核是否补开局', vodName: '急速森林(飞碟)', vodDevice: '幻影飞碟', vodDeviceType: 'VR设备', vodVerifyMode: '小程序主动扫码', vodEndReason: '未开局', vodExceptionStatus: '异常', vodExceptionType: '支付成功未开局', vodDuration: '0分钟' },
  { id: 25, orderNo: 'OD202604230033', merchant: '卓远科技', store: '卓远萧山区店', type: '点播系统订单', amount: 78.00, paymentContent: '会员余额:78.00', time: '2026-04-23 16:40:00', status: '已完成', operator: '系统自动', settled: false, source: '点播系统', remark: '玩家中途退出，按规则不退款', vodName: '极限滑雪', vodDevice: 'Pico 4 Pro #03', vodDeviceType: 'VR头显', vodVerifyMode: '会员码反扫', vodEndReason: '中途退出不退款', vodExceptionStatus: '正常', vodExceptionType: '', vodDuration: '6分钟' },
  { id: 26, orderNo: 'OD202604230041', merchant: '恒然集团', store: '恒然科技园店', type: '点播系统订单', amount: 88.00, paymentContent: '微信支付:88.00', time: '2026-04-23 18:20:00', status: '已完成', operator: '系统自动', settled: true, source: '点播系统', remark: '员工现场人工强停', vodName: '星际探险', vodDevice: 'Pico 4 Pro #01', vodDeviceType: 'VR头显', vodVerifyMode: '店员扫码点播', vodEndReason: '人工强停', vodExceptionStatus: '异常', vodExceptionType: '人工强停', vodDuration: '8分钟' },
  // === 手动扣费订单 ===
  { id: 6, orderNo: 'MD202309160006', merchant: '恒然集团', store: '恒然分部展厅', type: '手动扣费订单', amount: 20.00, paymentContent: '现金:20.00', time: '2023-09-16 15:55:30', status: '已完成', operator: '店员A', reason: '设备损耗扣费' },
  { id: 7, orderNo: 'MD202309160008', merchant: '幻影星空', store: '幻影星空馆 NO.8088', type: '手动扣费订单', amount: 15.00, paymentContent: '余额:15.00', time: '2023-09-16 15:40:12', status: '已完成', operator: '店员B', reason: '超时扣费' },
  { id: 21, orderNo: 'MD20260415021', merchant: '利民街商家', store: '利民街大展厅', type: '手动扣费订单', amount: 30.00, paymentContent: '余额:30.00', time: '2026-04-15 09:10:00', status: '已完成', operator: '李小红', reason: '会员余额不足补扣' },
  // === 修改储值订单 ===
  { id: 8, orderNo: 'MB202309160009', merchant: '恒然集团', store: '恒然分部展厅', type: '修改储值订单', amount: 200.00, paymentContent: '微信支付:200.00', time: '2023-09-16 15:30:00', status: '已完成', changeType: '充值', balanceBefore: 320.00, balanceAfter: 520.00, operator: '王建国' },
  { id: 9, orderNo: 'MB202309160010', merchant: '利民街商家', store: '利民街大展厅', type: '修改储值订单', amount: -50.00, paymentContent: '后台调整:-50.00', time: '2023-09-16 15:20:00', status: '已完成', changeType: '扣减', balanceBefore: 150.00, balanceAfter: 100.00, operator: '李小红' },
  { id: 22, orderNo: 'MB20260415022', merchant: '华东展厅', store: '华东展厅', type: '修改储值订单', amount: 500.00, paymentContent: '支付宝:500.00', time: '2026-04-15 11:00:00', status: '已完成', changeType: '充值', balanceBefore: 800.00, balanceAfter: 1300.00, operator: '张运营' },
  // === 游戏币兑换订单 ===
  { id: 10, orderNo: 'GB202309160007', merchant: '幻影星空', store: '幻影星空馆 NO.8088', type: '游戏币兑换订单', amount: 50.00, paymentContent: '微信支付:50.00', time: '2023-09-16 15:48:12', status: '已完成', beanAmount: 500 },
  { id: 11, orderNo: 'GB202309160011', merchant: '华东展厅', store: '华东展厅', type: '游戏币兑换订单', amount: 100.00, paymentContent: '支付宝:100.00', time: '2023-09-16 15:10:00', status: '已完成', beanAmount: 1000 },
  { id: 23, orderNo: 'GB20260415023', merchant: '党建馆集团', store: '党建馆', type: '游戏币兑换订单', amount: 30.00, paymentContent: '微信支付:30.00', time: '2026-04-15 16:30:00', status: '已完成', beanAmount: 300 },
  // === 活动赠送记录 ===
  { id: 12, orderNo: 'PR202309160012', merchant: '恒然集团', store: '恒然分部展厅', type: '活动赠送记录', amount: 0, paymentContent: '', time: '2023-09-16 14:00:00', status: '已完成', promoName: '新用户注册送', giftContent: '游戏币×100' },
  { id: 13, orderNo: 'PR202309170001', merchant: '幻影星空', store: '幻影星空馆 NO.8088', type: '活动赠送记录', amount: 0, paymentContent: '', time: '2023-09-17 09:30:00', status: '已完成', promoName: '中秋签到活动', giftContent: '游戏币×50' },
  { id: 15, orderNo: 'PR202309180002', merchant: '利民街商家', store: '利民街大展厅', type: '活动赠送记录', amount: 0, paymentContent: '', time: '2023-09-18 16:00:00', status: '已完成', promoName: '会员日特惠', giftContent: '游戏币×200' },
])

// ===== 各类型基础列定义 =====
const baseColumns: DataTableColumns = [
  { title: '订单号', key: 'orderNo', width: 170, align: 'center', fixed: 'left' as const },
  { title: '商家', key: 'merchant', width: 130, align: 'center' },
  { title: '店铺', key: 'store', width: 150, align: 'center' },
  { title: '金额', key: 'amount', width: 100, align: 'center', render: (row: any) => row.type === '活动赠送记录' ? '--' : `¥${(row.amount || 0).toFixed(2)}` },
  {
    title: '支付方式', key: 'paymentContent', width: 140, align: 'center',
    render: (row: any) => {
      if (row.type === '活动赠送记录') return '--'
      const pays = parsePayments(row.paymentContent)
      if (pays.length === 0) return '--'
      if (pays.length === 1) {
        return h('span', { style: `color:${pays[0].color};font-size:12px;font-weight:500;` }, pays[0].method)
      }
      return h('div', { style: 'display:flex;flex-direction:column;gap:1px;align-items:center;' },
        pays.map((p: any) => h('span', { style: `color:${p.color};font-size:11px;font-weight:500;` }, `${p.method} ¥${p.amount.toFixed(2)}`))
      )
    },
  },
  { title: '状态', key: 'status', width: 90, align: 'center', render: (row: any) => h(NTag, { size: 'small' as const, type: 'success' as const, bordered: false }, () => row.status) },
  { title: '时间', key: 'time', width: 160, align: 'center' },
]

// 各类型特有的业务列
const typeExtraCols: Record<string, DataTableColumns> = {
  '收银订单': [
    { title: '商品清单', key: 'items', minWidth: 180 },
    { title: '操作人', key: 'operator', width: 90, align: 'center' },
  ],
  '点播系统订单': [
    { title: '点播内容', key: 'vodName', width: 130, align: 'center' },
    { title: '设备', key: 'vodDevice', width: 140, align: 'center' },
    { title: '核销方式', key: 'vodVerifyMode', width: 120, align: 'center' },
    {
      title: '异常状态',
      key: 'vodExceptionStatus',
      width: 100,
      align: 'center',
      render: (row: any) => h(NTag, { type: row.vodExceptionStatus === '异常' ? 'warning' : 'success', size: 'small', bordered: false }, () => row.vodExceptionStatus || '正常'),
    },
    { title: '异常类型', key: 'vodExceptionType', minWidth: 140, render: (row: any) => row.vodExceptionType || '--' },
  ],
  '手动扣费订单': [
    { title: '操作人', key: 'operator', width: 80, align: 'center' },
    { title: '扣费原因', key: 'reason', minWidth: 160 },
  ],
  '修改储值订单': [
    { title: '变更类型', key: 'changeType', width: 80, align: 'center', render: (row: any) => h(NTag, { type: row.changeType === '充值' ? 'success' : 'error', size: 'small' }, () => row.changeType) },
    { title: '变更前', key: 'balanceBefore', width: 100, align: 'center', render: (row: any) => `¥${(row.balanceBefore || 0).toFixed(2)}` },
    { title: '变更后', key: 'balanceAfter', width: 100, align: 'center', render: (row: any) => `¥${(row.balanceAfter || 0).toFixed(2)}` },
    { title: '操作人', key: 'operator', width: 80, align: 'center' },
  ],
  '游戏币兑换订单': [
    { title: '兑换游戏币', key: 'beanAmount', width: 110, align: 'center', render: (row: any) => `${row.beanAmount} 币` },
  ],
  '活动赠送记录': [
    { title: '活动名称', key: 'promoName', width: 150, align: 'center' },
    { title: '赠送内容', key: 'giftContent', minWidth: 160 },
  ],
}

const actionCol: DataTableColumns = [
  {
    title: '操作', key: 'action', width: 140, align: 'center', fixed: 'right' as const,
    render: (row: any) => {
      const actions = [
        h(NButton, { size: 'small', type: 'primary', text: true, onClick: () => openDetail(row) }, { default: () => '详情' }),
      ]

      if (isExceptionMarked(row)) {
        actions.push(h(NButton, { size: 'small', type: 'warning', text: true, onClick: () => cancelExceptionMark(row) }, { default: () => '取消标记' }))
      } else {
        actions.push(h(NButton, { size: 'small', type: 'warning', text: true, onClick: () => markAsException(row) }, { default: () => '标记异常' }))
      }

      return h(NSpace, { size: 4 }, { default: () => actions })
    },
  },
]

const currentColumns = computed(() => {
  if (!currentType.value) {
    // 全部订单：只显示基础列 + 操作（去掉金额和支付方式列，因为活动赠送没有）
    const allCols = baseColumns.filter((c: any) => c.key !== 'amount' && c.key !== 'paymentContent')
    return [...allCols, ...actionCol]
  }
  const extra = typeExtraCols[currentType.value] || []
  // 活动赠送记录不显示金额和支付方式
  if (currentType.value === '活动赠送记录') {
    const cols = baseColumns.filter((c: any) => c.key !== 'amount' && c.key !== 'paymentContent')
    return [...cols, ...extra, ...actionCol]
  }
  return [...baseColumns, ...extra, ...actionCol]
})

// 点播详情表
const vodDetailColumns: DataTableColumns = [
  { title: '点播内容', key: 'content', minWidth: 120 },
  { title: '设备', key: 'device', width: 130, align: 'center' },
  { title: '核销方式', key: 'verifyMode', width: 120, align: 'center' },
  { title: '时长', key: 'duration', width: 90, align: 'center' },
  { title: '结束原因', key: 'endReason', width: 130, align: 'center' },
  { title: '异常类型', key: 'exceptionType', width: 130, align: 'center' },
  { title: '价格', key: 'price', width: 100, align: 'center' },
]

// ===== 筛选逻辑 =====
const filteredData = computed(() => {
  let data = [...allData.value]
  if (currentType.value) {
    data = data.filter(d => d.type === currentType.value)
  }
  if (filterMerchant.value) {
    const name = merchantOptions.find(m => m.value === filterMerchant.value)?.label
    if (name) data = data.filter(d => d.merchant === name)
  }
  if (filterStore.value) {
    const name = storeOptions.find(s => s.value === filterStore.value)?.label
    if (name) data = data.filter(d => d.store === name)
  }
  if (filterOrderNo.value) {
    data = data.filter(d => d.orderNo.toLowerCase().includes(filterOrderNo.value.toLowerCase()))
  }
  if (currentType.value === '点播系统订单') {
    if (filterVodDevice.value) {
      const kw = filterVodDevice.value.toLowerCase()
      data = data.filter(d => (d.vodDevice || '').toLowerCase().includes(kw))
    }
    if (filterVodException.value) {
      data = data.filter(d => (d.vodExceptionStatus || '正常') === filterVodException.value)
    }
  }
  if (filterDateRange.value) {
    const start = new Date(filterDateRange.value[0])
    const end = new Date(filterDateRange.value[1])
    const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`
    const endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`
    data = data.filter(d => {
      const datePart = d.time.split(' ')[0]
      return datePart >= startStr && datePart <= endStr
    })
  }
  return data
})

const pagination = { pageSize: 15 }

function resetFilter() {
  filterMerchant.value = null
  filterStore.value = null
  filterOrderNo.value = ''
  filterDateRange.value = null
  filterVodDevice.value = ''
  filterVodException.value = null
}

function exportData() {
  message.success(`正在导出${pageTitle.value}数据...`)
}
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.page-header h1 { font-size: 18px; font-weight: 600; color: #333; margin: 0; }
.header-desc { font-size: 13px; color: #999; margin: 4px 0 0 0; }
.detail-section { margin-top: 16px; }
.section-title { font-size: 14px; font-weight: 600; color: #333; margin-bottom: 8px; }
</style>
