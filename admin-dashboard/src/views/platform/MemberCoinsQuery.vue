<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">会员游戏币查询</h1>
      <n-space>
        <n-input placeholder="搜索会员姓名/手机号..." size="small" style="width: 200px;">
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
        <n-select v-model:value="merchantFilter" :options="merchantOptions" size="small" placeholder="筛选商家" clearable style="width: 160px;" />
        <n-select v-model:value="statusFilter" :options="statusOptions" size="small" placeholder="状态筛选" clearable style="width: 130px;" />
        <n-date-picker type="daterange" clearable size="small" v-model:value="dateRange" />
        <n-button secondary size="small" @click="exportData">导出</n-button>
      </n-space>
    </div>

    <!-- 统计条 -->
    <div class="summary-bar">
      <span>共 <strong>{{ tableData.length }}</strong> 条记录</span>
      <n-divider vertical />
      <span>总数量：<strong class="coin">{{ totalCount.toLocaleString() }}</strong></span>
      <n-divider vertical />
      <span>剩余总量：<strong class="remain">{{ remainCount.toLocaleString() }}</strong></span>
      <n-divider vertical />
      <span>已用/退：<strong class="used">{{ usedCount.toLocaleString() }}</strong></span>
    </div>

    <div class="table-card">
      <n-data-table :columns="columns" :data="tableData" :pagination="{ pageSize: 15 }" striped size="small" :scroll-x="1400" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { NDataTable, NTag, NSpace, NInput, NIcon, NSelect, NDatePicker, NDivider } from 'naive-ui'
import { SearchOutline } from '@vicons/ionicons5'

const merchantFilter = ref<string | null>(null)
const statusFilter = ref<string | null>(null)
const dateRange = ref<[number, number] | null>(null)

const merchantOptions = [
  { label: '恒然集团', value: '恒然集团' },
  { label: '幻影星空', value: '幻影星空' },
  { label: '利民街商家', value: '利民街商家' },
  { label: '党建馆集团', value: '党建馆集团' },
  { label: '华东展厅', value: '华东展厅' },
]
const statusOptions = [
  { label: '生效中', value: 'active' },
  { label: '已过期', value: 'expired' },
  { label: '已用完', value: 'used' },
  { label: '已退款', value: 'refunded' },
]

const columns = [
  { title: '会员', key: 'member', width: 120 },
  { title: '手机号', key: 'phone', width: 125 },
  { title: '所属商家', key: 'merchant', width: 100, render: (row: any) => h(NTag, { size: 'small', bordered: false }, () => row.merchant) },
  { title: '发生店铺', key: 'storeName', width: 130 },
  { title: '创建时间', key: 'createTime', width: 155 },
  { title: '状态', key: 'status', width: 80, render: (row: any) => {
    const m: Record<string, string> = { refunded: 'default', active: 'info', used: 'warning', expired: 'error' }
    const t: Record<string, string> = { refunded: '已退款', active: '生效中', used: '已用完', expired: '已过期' }
    return h(NTag, { type: (m[row.status] || 'default') as any, size: 'small', bordered: false }, () => t[row.status])
  }},
  { title: '生效日期', key: 'effectiveDate', width: 105 },
  { title: '过期日期', key: 'expireDate', width: 105 },
  { title: '总数量', key: 'totalAmount', width: 75, align: 'center' as const },
  { title: '剩余数量', key: 'remainAmount', width: 80, align: 'center' as const,
    render: (row: any) => h('span', { style: `color:${row.remainAmount > 0 ? '#F59E0B' : 'var(--text-muted)'};font-weight:600` }, row.remainAmount)
  },
  { title: '已用/退款量', key: 'usedRefundAmount', width: 105, align: 'center' as const },
  { title: '备注', key: 'remark', minWidth: 140, ellipsis: { tooltip: true } as any },
]

const tableData = ref([
  { id: 1, member: '赵天宇', phone: '177****9900', merchant: '华东展厅', storeName: '华东展厅', createTime: '2026-04-15 14:30', status: 'active', effectiveDate: '2026-04-15', expireDate: '2027-04-15', totalAmount: 15000, remainAmount: 14200, usedRefundAmount: 800, remark: '充值赠送' },
  { id: 2, member: '阳恩', phone: '159****3344', merchant: '恒然集团', storeName: '恒然分部展厅', createTime: '2026-04-10 10:20', status: 'active', effectiveDate: '2026-04-10', expireDate: '2026-10-10', totalAmount: 8800, remainAmount: 5200, usedRefundAmount: 3600, remark: '充值新帐' },
  { id: 3, member: '张浩理', phone: '138****7890', merchant: '恒然集团', storeName: '恒然分部展厅', createTime: '2026-04-05 09:15', status: 'active', effectiveDate: '2026-04-05', expireDate: '2027-01-05', totalAmount: 5000, remainAmount: 4800, usedRefundAmount: 200, remark: '会员充值' },
  { id: 4, member: '李明远', phone: '136****3456', merchant: '幻影星空', storeName: '幻影星空馆 NO.8088', createTime: '2026-03-28 16:40', status: 'used', effectiveDate: '2026-03-28', expireDate: '2026-06-28', totalAmount: 6600, remainAmount: 0, usedRefundAmount: 6600, remark: '已全部消耗' },
  { id: 5, member: '郑雨萱', phone: '135****6677', merchant: '华东展厅', storeName: '华东展厅', createTime: '2026-03-20 11:30', status: 'active', effectiveDate: '2026-03-20', expireDate: '2027-03-20', totalAmount: 7200, remainAmount: 7100, usedRefundAmount: 100, remark: '' },
  { id: 6, member: '王思琪', phone: '137****9012', merchant: '幻影星空', storeName: '幻影星空馆 NO.8088', createTime: '2026-02-15 14:22', status: 'expired', effectiveDate: '2026-02-15', expireDate: '2026-04-15', totalAmount: 1200, remainAmount: 270, usedRefundAmount: 0, remark: '已过期未使用完' },
  { id: 7, member: '陈晓峰', phone: '186****5566', merchant: '利民街商家', storeName: '利民街大展厅', createTime: '2026-02-10 08:50', status: 'refunded', effectiveDate: '2026-02-10', expireDate: '2027-02-10', totalAmount: 2800, remainAmount: 0, usedRefundAmount: 2800, remark: '用户申请退款' },
  { id: 8, member: '刘芳华', phone: '188****7788', merchant: '党建馆集团', storeName: '党建馆', createTime: '2026-01-20 13:55', status: 'expired', effectiveDate: '2026-01-20', expireDate: '2026-03-20', totalAmount: 300, remainAmount: 0, usedRefundAmount: 300, remark: '' },
])

const totalCount = computed(() => tableData.value.reduce((s, r) => s + r.totalAmount, 0))
const remainCount = computed(() => tableData.value.reduce((s, r) => s + r.remainAmount, 0))
const usedCount = computed(() => tableData.value.reduce((s, r) => s + r.usedRefundAmount, 0))

function exportData() {}
</script>

<style scoped>
.page-container { padding: 20px 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 8px; }
.page-title { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }

.summary-bar { display: flex; align-items: center; background: white; border-radius: 10px; padding: 12px 20px; border: 1px solid var(--border-color); margin-bottom: 16px; font-size: 13px; color: var(--text-muted); flex-wrap: wrap; gap: 4px; }
.summary-bar strong { color: var(--text-primary); }
.summary-bar strong.coin { color: #F59E0B; }
.summary-bar strong.remain { color: #3B82F6; }
.summary-bar strong.used { color: #EF4444; }

.table-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid var(--border-color); }
</style>
