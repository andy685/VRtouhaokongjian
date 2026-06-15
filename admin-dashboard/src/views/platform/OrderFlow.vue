<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>{{ pageTitle }}</h1>
      <p class="header-desc">{{ pageDesc }}</p>
    </div>

    <!-- 筛选区 -->
    <div class="filter-bar">
      <n-space :size="12" align="center">
        <n-select v-model:value="filterMerchant" placeholder="全部商家" :options="merchantOptions" size="small" style="width: 150px;" clearable />
        <n-select v-model:value="filterStore" placeholder="全部店铺" :options="storeOptions" size="small" style="width: 150px;" clearable />
        <n-date-picker v-model:value="filterDateRange" type="daterange" size="small" style="width: 260px;" clearable />
        <n-input v-model:value="filterOrderNo" placeholder="搜索订单号" size="small" style="width: 180px;" clearable>
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
        <n-button size="small" secondary @click="refreshData">查询</n-button>
      </n-space>
    </div>

    <div class="table-card">
      <n-data-table :columns="currentColumns" :data="filteredData" :pagination="pagination" striped size="small" :scroll-x="1200" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useRoute } from 'vue-router'
import { NDataTable, NSelect, NSpace, NInput, NDatePicker, NButton, NIcon, NTag, useMessage } from 'naive-ui'
import { SearchOutline } from '@vicons/ionicons5'

const message = useMessage()

// 标记异常订单
function markAsException(row: any) {
  message.success(`订单 ${row.orderNo} 已标记为异常，请在对账中心处理`)
  // 实际项目中，这里应该：
  // 1. 调用API标记订单为异常
  // 2. 跳转到对账中心页面
  // 3. 或者打开一个弹窗填写异常原因
}

const route = useRoute()

// 根据路由确定当前订单类型
const routeTypeMap: Record<string, string | null> = {
  'PlatformOrderFlow': null, // 全部
  'PlatformOrderFlowCashier': '收银订单',
  'PlatformOrderFlowVod': '点播系统订单',
  'PlatformOrderFlowManual': '手动扣费订单',
  'PlatformOrderFlowBalance': '修改储值订单',
  'PlatformOrderFlowGamebean': '游戏币兑换订单',
  'PlatformOrderFlowPromo': '活动赠送订单',
}

const currentType = computed(() => routeTypeMap[route.name as string] ?? null)

const pageTitle = computed(() => currentType.value ? currentType.value : '全部订单')
const pageDesc = computed(() => {
  if (!currentType.value) return '查看全平台所有订单记录，支持按商家、店铺筛选'
  return `查看${currentType.value}记录`
})

// 筛选条件
const filterMerchant = ref<number | null>(null)
const filterStore = ref<number | null>(null)
const filterDateRange = ref<[number, number] | null>(null)
const filterOrderNo = ref('')

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

// 支付方式解析
function parsePayments(paymentContent: string) {
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
        : method.includes('现金') ? '#64748b'
        : method.includes('后台') ? '#94a3b8'
        : '#64748b'
      return { method, amount, color }
    }
    return null
  }).filter(Boolean)
}

// ===== Mock 数据 =====
const allData = ref([
  // 收银订单 - 混合支付示例
  { id: 0, orderNo: 'MX202605070001', merchant: '利民街商家', store: '利民街大展厅', type: '收银订单', amount: 36.10, paymentContent: '预存款:26.10,微信支付:10.00', time: '2026-05-07 10:30:00', status: '已完成', items: '过山车VR×1' },
  // 收银订单
  { id: 1, orderNo: 'CO202309160001', merchant: '恒然集团', store: '恒然分部展厅', type: '收银订单', amount: 128, paymentContent: '微信支付:128.00', time: '2023-09-16 16:25:10', status: '已完成', items: 'VR体验×1, 饮料×2' },
  { id: 3, orderNo: 'CO202309160005', merchant: '华东展厅', store: '华东展厅', type: '收银订单', amount: 88, paymentContent: '微信支付:88.00', time: '2023-09-16 16:05:18', status: '已完成', items: '单次体验×1' },
  // 点播系统订单
  { id: 4, orderNo: 'OD202309160002', merchant: '幻影星空', store: '幻影星空馆 NO.8088', type: '点播系统订单', amount: 45, paymentContent: '余额:45.00', time: '2023-09-16 16:20:33', status: '已完成', vodName: '过山车VR' },
  { id: 5, orderNo: 'OD202309160004', merchant: '党建馆集团', store: '党建馆', type: '点播系统订单', amount: 30, paymentContent: '游戏币:30.00', time: '2023-09-16 16:10:45', status: '已完成', vodName: '恐怖医院' },
  // 点播系统订单 - 混合支付示例（预存款抵扣后微信支付）
  { id: 14, orderNo: 'MX202605070002', merchant: '利民街商家', store: '利民街大展厅', type: '点播系统订单', amount: 36.10, paymentContent: '预存款:26.10,微信支付:10.00', time: '2026-05-07 11:00:00', status: '已完成', vodName: '过山车VR' },
  // 手动扣费订单
  { id: 6, orderNo: 'MD202309160006', merchant: '恒然集团', store: '恒然分部展厅', type: '手动扣费订单', amount: 20, paymentContent: '现金:20.00', time: '2023-09-16 15:55:30', status: '已完成', operator: '店员A', reason: '设备损耗扣费' },
  { id: 7, orderNo: 'MD202309160008', merchant: '幻影星空', store: '幻影星空馆 NO.8088', type: '手动扣费订单', amount: 15, paymentContent: '余额:15.00', time: '2023-09-16 15:40:12', status: '已完成', operator: '店员B', reason: '超时扣费' },
  // 修改储值订单
  { id: 8, orderNo: 'MB202309160009', merchant: '恒然集团', store: '恒然分部展厅', type: '修改储值订单', amount: 200, paymentContent: '微信支付:200.00', time: '2023-09-16 15:30:00', status: '已完成', changeType: '充值', balanceBefore: 320, balanceAfter: 520 },
  { id: 9, orderNo: 'MB202309160010', merchant: '利民街商家', store: '利民街大展厅', type: '修改储值订单', amount: -50, paymentContent: '后台调整:-50.00', time: '2023-09-16 15:20:00', status: '已完成', changeType: '扣减', balanceBefore: 150, balanceAfter: 100 },
  // 游戏币兑换订单
  { id: 10, orderNo: 'GB202309160007', merchant: '幻影星空', store: '幻影星空馆 NO.8088', type: '游戏币兑换订单', amount: 50, paymentContent: '微信支付:50.00', time: '2023-09-16 15:48:12', status: '已完成', beanAmount: 500 },
  { id: 11, orderNo: 'GB202309160011', merchant: '华东展厅', store: '华东展厅', type: '游戏币兑换订单', amount: 100, paymentContent: '支付宝:100.00', time: '2023-09-16 15:10:00', status: '已完成', beanAmount: 1000 },
  // 活动赠送订单
  { id: 12, orderNo: 'PR202309160012', merchant: '恒然集团', store: '恒然分部展厅', type: '活动赠送订单', amount: 0, paymentContent: '赠送:0.00', time: '2023-09-16 14:00:00', status: '已完成', promoName: '新用户注册送', giftContent: '游戏币×100' },
])

// ===== 表格列定义 =====
const baseColumns = [
  { title: '订单号', key: 'orderNo', minWidth: 170, fixed: 'left' as const },
  { title: '商家', key: 'merchant', minWidth: 130 },
  { title: '店铺', key: 'store', minWidth: 170 },
  { title: '金额', key: 'amount', width: 90, render: (row: any) => `¥${row.amount}` },
  {
    title: '支付方式',
    key: 'paymentContent',
    width: 150,
    render: (row: any) => {
      const pays = parsePayments(row.paymentContent)
      if (pays.length === 0) return '--'
      if (pays.length === 1) {
        const p = pays[0]
        return h('span', { style: `color:${p.color};font-weight:500;font-size:12px;` }, p.method)
      }
      return h('div', { style: 'display:flex;flex-direction:column;gap:1px;' },
        pays.map((p: any) => h('span', { style: `color:${p.color};font-size:11px;font-weight:500;` }, `${p.method} ¥${p.amount.toFixed(2)}`))
      )
    },
  },
  { title: '状态', key: 'status', width: 90, render: (row: any) => h(NTag, { size: 'small' as const, type: 'success' as const, bordered: false }, () => row.status) },
  { title: '时间', key: 'time', minWidth: 160 },
  { 
    title: '操作', 
    key: 'action', 
    width: 120, 
    fixed: 'right' as const,
    render: (row: any) => h(NButton, { size: 'tiny', type: 'warning', secondary: true, onClick: () => markAsException(row) }, () => '标记异常')
  },
]

// 各类型特殊列
const typeExtraColumns: Record<string, any[]> = {
  '收银订单': [
    { title: '商品清单', key: 'items', minWidth: 200 },
  ],
  '点播系统订单': [
    { title: '点播内容', key: 'vodName', width: 130 },
  ],
  '手动扣费订单': [
    { title: '操作人', key: 'operator', width: 100 },
    { title: '扣费原因', key: 'reason', minWidth: 150 },
  ],
  '修改储值订单': [
    { title: '变更类型', key: 'changeType', width: 100 },
    { title: '变更前余额', key: 'balanceBefore', width: 110, render: (row: any) => `¥${row.balanceBefore}` },
    { title: '变更后余额', key: 'balanceAfter', width: 110, render: (row: any) => `¥${row.balanceAfter}` },
  ],
  '游戏币兑换订单': [
    { title: '兑换游戏币', key: 'beanAmount', width: 110, render: (row: any) => `${row.beanAmount} 币` },
  ],
  '活动赠送订单': [
    { title: '活动名称', key: 'promoName', width: 140 },
    { title: '赠送内容', key: 'giftContent', minWidth: 160 },
  ],
}

// 当前表格列
const currentColumns = computed(() => {
  const type = currentType.value
  if (!type) return baseColumns
  const extra = typeExtraColumns[type] || []
  const timeColIdx = baseColumns.findIndex(c => c.key === 'time')
  return [
    ...baseColumns.slice(0, timeColIdx),
    ...extra,
    ...baseColumns.slice(timeColIdx),
  ]
})

// 筛选数据
const filteredData = computed(() => {
  let data = [...allData.value]
  // 按订单类型筛选（根据路由）
  if (currentType.value) {
    data = data.filter(d => d.type === currentType.value)
  }
  // 按商家筛选
  if (filterMerchant.value) {
    const merchantName = merchantOptions.find(m => m.value === filterMerchant.value)?.label
    if (merchantName) data = data.filter(d => d.merchant === merchantName)
  }
  // 按店铺筛选
  if (filterStore.value) {
    const storeName = storeOptions.find(s => s.value === filterStore.value)?.label
    if (storeName) data = data.filter(d => d.store === storeName)
  }
  // 按订单号搜索
  if (filterOrderNo.value) {
    data = data.filter(d => d.orderNo.toLowerCase().includes(filterOrderNo.value.toLowerCase()))
  }
  return data
})

const pagination = { pageSize: 10 }

function refreshData() {
  console.log('刷新数据，筛选条件：', {
    type: currentType.value,
    merchant: filterMerchant.value,
    store: filterStore.value,
    dateRange: filterDateRange.value,
    orderNo: filterOrderNo.value,
  })
}
</script>

<style scoped>
.page-container { padding: 20px 24px; }
.page-header { margin-bottom: 20px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0 0 4px 0; }
.header-desc { font-size: 13px; color: var(--text-muted); margin: 0; }
.filter-bar { background: white; border-radius: 12px; padding: 16px 20px; border: 1px solid var(--border-color); margin-bottom: 16px; }
.table-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid var(--border-color); }
</style>
