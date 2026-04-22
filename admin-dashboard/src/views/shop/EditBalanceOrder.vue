<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>修改储值订单</h1>
      <n-space>
        <n-button type="primary" size="small" @click="showFilter = true">
          <template #icon>
            <n-icon :component="FilterOutline" />
          </template>
          筛选
        </n-button>
        <n-button type="primary" size="small" @click="handleExport">
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
        <n-form-item label="会员手机">
          <n-input v-model:value="filterPhone" placeholder="输入会员手机号..." />
        </n-form-item>
        <n-form-item label="修改类型">
          <n-select v-model:value="filterChangeType" :options="changeTypeOptions" placeholder="选择修改类型" clearable />
        </n-form-item>
        <n-form-item label="类型">
          <n-select v-model:value="filterCategory" :options="categoryFilterOptions" placeholder="选择类型" clearable />
        </n-form-item>
        <n-form-item label="操作人">
          <n-input v-model:value="filterOperator" placeholder="输入操作人..." />
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
    <n-modal v-model:show="showDetail" preset="card" title="订单详情" style="width: 560px;" :bordered="false">
      <div class="detail-content" v-if="detailRow">
        <div class="detail-product-name">这里显示商品名称</div>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NDataTable, NButton, NIcon, NModal, NForm, NFormItem, NSelect, NInput,
  NDatePicker, NSpace, NTag
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { FilterOutline, DownloadOutline } from '@vicons/ionicons5'

const showFilter = ref(false)
const showDetail = ref(false)
const detailRow = ref<any>(null)

const filterShop = ref<string | null>(null)
const filterPhone = ref('')
const filterChangeType = ref<string | null>(null)
const filterCategory = ref<string | null>(null)
const filterOperator = ref('')
const dateRange = ref<[number, number] | null>(null)

const shopOptions = [
  { label: '利民街小展厅', value: '利民街小展厅' },
]

const changeTypeOptions = [
  { label: '增加', value: '增加' },
  { label: '减少', value: '减少' },
]

const categoryFilterOptions = [
  { label: '充值活动', value: '充值活动' },
  { label: '单次消费', value: '单次消费' },
  { label: '购买商品', value: '购买商品' },
  { label: '套票', value: '套票' },
  { label: '商品', value: '商品' },
]

const pagination = { pageSize: 10 }

const itemColumns: DataTableColumns<BalanceItem> = [
  { title: '项目名称', key: 'name', minWidth: 120 },
  { title: '数量', key: 'quantity', width: 70, align: 'center' },
  { title: '单价', key: 'price', width: 90, align: 'right', render: (row: BalanceItem) => `¥${row.price.toFixed(2)}` },
  { title: '小计', key: 'subtotal', width: 90, align: 'right', render: (row: BalanceItem) => `¥${row.subtotal.toFixed(2)}` },
]

interface BalanceItem {
  name: string
  quantity: number
  price: number
  subtotal: number
}

interface BalanceOrder {
  id: number
  orderNo: string
  member: string
  type: string
  category: string
  amount: number
  beforeBalance: number
  afterBalance: number
  operator: string
  remark: string
  createTime: string
  items: BalanceItem[]
  shop: string
}

const categoryMap: Record<string, { label: string; color: string }> = {
  '充值活动': { label: '充值活动', color: '#1890ff' },
  '单次消费': { label: '单次消费', color: '#faad14' },
  '购买商品': { label: '购买商品', color: '#52c41a' },
  '套票': { label: '套票', color: '#722ed1' },
  '商品': { label: '商品', color: '#eb2f96' },
}

const rawData = ref<BalanceOrder[]>([
  {
    id: 1,
    orderNo: 'BAL202604230001',
    shop: '利民街小展厅',
    member: '妍妍 (13905675678)',
    type: '增加',
    category: '充值活动',
    amount: 200.00,
    beforeBalance: 150.00,
    afterBalance: 350.00,
    operator: '张三',
    remark: '充200送50活动',
    createTime: '2026-04-23 14:32:15',
    items: [{ name: '储值金', quantity: 1, price: 200.00, subtotal: 200.00 }],
  },
  {
    id: 2,
    orderNo: 'BAL202604220002',
    shop: '利民街小展厅',
    member: '烂漫的痕迹重 (13801231234)',
    type: '减少',
    category: '单次消费',
    amount: 50.00,
    beforeBalance: 300.00,
    afterBalance: 250.00,
    operator: '李四',
    remark: '暗黑战场单次体验',
    createTime: '2026-04-22 16:20:33',
    items: [{ name: '暗黑战场', quantity: 1, price: 50.00, subtotal: 50.00 }],
  },
  {
    id: 3,
    orderNo: 'BAL202604210003',
    shop: '利民街小展厅',
    member: '阳恩 (15903343344)',
    type: '增加',
    category: '充值活动',
    amount: 500.00,
    beforeBalance: 0.00,
    afterBalance: 500.00,
    operator: '王五',
    remark: '新会员首充活动',
    createTime: '2026-04-21 11:08:45',
    items: [{ name: '储值金', quantity: 1, price: 500.00, subtotal: 500.00 }],
  },
  {
    id: 4,
    orderNo: 'BAL202604200004',
    shop: '利民街小展厅',
    member: '张浩理 (13507897890)',
    type: '减少',
    category: '购买商品',
    amount: 120.00,
    beforeBalance: 800.00,
    afterBalance: 680.00,
    operator: '张三',
    remark: '购买VR眼镜+手柄',
    createTime: '2026-04-20 09:55:12',
    items: [
      { name: 'VR眼镜', quantity: 1, price: 80.00, subtotal: 80.00 },
      { name: 'VR手柄', quantity: 1, price: 40.00, subtotal: 40.00 },
    ],
  },
  {
    id: 5,
    orderNo: 'BAL202604190005',
    shop: '利民街小展厅',
    member: '寂寞的雪山飞车 (13603453456)',
    type: '增加',
    category: '充值活动',
    amount: 1000.00,
    beforeBalance: 200.00,
    afterBalance: 1200.00,
    operator: '李四',
    remark: 'VIP充值充1000送300',
    createTime: '2026-04-19 13:42:28',
    items: [{ name: '储值金', quantity: 1, price: 1000.00, subtotal: 1000.00 }],
  },
  {
    id: 6,
    orderNo: 'BAL202604180006',
    shop: '利民街小展厅',
    member: '潇潇默潇 (18807787788)',
    type: '减少',
    category: '单次消费',
    amount: 88.00,
    beforeBalance: 500.00,
    afterBalance: 412.00,
    operator: '王五',
    remark: '幻影飞碟+幻影时空套餐',
    createTime: '2026-04-18 10:18:56',
    items: [
      { name: '幻影飞碟', quantity: 1, price: 48.00, subtotal: 48.00 },
      { name: '幻影时空', quantity: 1, price: 40.00, subtotal: 40.00 },
    ],
  },
  {
    id: 7,
    orderNo: 'BAL202604170007',
    shop: '利民街小展厅',
    member: '小明 (13700137000)',
    type: '减少',
    category: '套票',
    amount: 298.00,
    beforeBalance: 600.00,
    afterBalance: 302.00,
    operator: '张三',
    remark: '购买亲子套票',
    createTime: '2026-04-17 15:20:00',
    items: [
      { name: '亲子套票', quantity: 1, price: 298.00, subtotal: 298.00 },
    ],
  },
  {
    id: 8,
    orderNo: 'BAL202604160008',
    shop: '利民街小展厅',
    member: '小红 (13600136000)',
    type: '减少',
    category: '商品',
    amount: 156.00,
    beforeBalance: 400.00,
    afterBalance: 244.00,
    operator: '李四',
    remark: '购买VR周边商品',
    createTime: '2026-04-16 11:45:00',
    items: [
      { name: 'VR眼罩', quantity: 2, price: 38.00, subtotal: 76.00 },
      { name: '防滑手套', quantity: 2, price: 40.00, subtotal: 80.00 },
    ],
  },
])

const filteredData = computed(() => {
  let data = rawData.value
  if (filterShop.value) data = data.filter(d => d.shop === filterShop.value)
  if (filterPhone.value) data = data.filter(d => d.member.includes(filterPhone.value))
  if (filterChangeType.value) data = data.filter(d => d.type === filterChangeType.value)
  if (filterCategory.value) data = data.filter(d => d.category === filterCategory.value)
  if (filterOperator.value) data = data.filter(d => d.operator.includes(filterOperator.value))
  return data
})

const columns: DataTableColumns<BalanceOrder> = [
  { title: '订单号', key: 'orderNo', width: 170, align: 'center' },
  { title: '所属店铺', key: 'shop', width: 120, align: 'center' },
  { title: '会员', key: 'member', minWidth: 160 },
  {
    title: '修改类型',
    key: 'type',
    width: 80,
    align: 'center',
    render: (row: BalanceOrder) =>
      h(NTag, { type: row.type === '增加' ? 'success' : 'error', size: 'small' }, { default: () => row.type })
  },
  {
    title: '类型',
    key: 'category',
    width: 100,
    align: 'center',
    render: (row: BalanceOrder) => {
      const cfg = categoryMap[row.category]
      return h(NTag, { color: { color: cfg?.color || '#999', textColor: '#fff' }, size: 'small' }, { default: () => cfg?.label || row.category })
    }
  },
  {
    title: '详情',
    key: 'remark',
    minWidth: 180,
    ellipsis: { tooltip: true },
    render: (row: BalanceOrder) => h('span', { style: 'font-size: 12px;' }, row.remark)
  },
  {
    title: '修改金额',
    key: 'amount',
    width: 100,
    align: 'right',
    render: (row: BalanceOrder) => `¥${row.amount.toFixed(2)}`
  },
  {
    title: '修改前储值',
    key: 'beforeBalance',
    width: 110,
    align: 'right',
    render: (row: BalanceOrder) => `¥${row.beforeBalance.toFixed(2)}`
  },
  {
    title: '修改后储值',
    key: 'afterBalance',
    width: 110,
    align: 'right',
    render: (row: BalanceOrder) => `¥${row.afterBalance.toFixed(2)}`
  },
  { title: '操作人', key: 'operator', width: 80, align: 'center' },
  { title: '创建时间', key: 'createTime', width: 150, align: 'center' },
  {
    title: '操作',
    key: 'actions',
    width: 80,
    align: 'center',
    render: (row: BalanceOrder) =>
      h(NButton, { size: 'small', type: 'primary', onClick: () => openDetail(row) }, { default: () => '详情' })
  },
]

function openDetail(row: BalanceOrder) {
  detailRow.value = row
  showDetail.value = true
}

function resetFilter() {
  filterShop.value = null
  filterPhone.value = ''
  filterChangeType.value = null
  filterCategory.value = null
  filterOperator.value = ''
  dateRange.value = null
}

function handleExport() {
  window.$message?.success('导出成功')
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
.detail-items-section {
  margin-top: 16px;
}
.detail-product-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  text-align: center;
  padding: 40px 0;
}
</style>
