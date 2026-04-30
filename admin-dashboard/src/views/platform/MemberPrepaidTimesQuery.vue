<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">会员预存次数查询</h1>
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
      <span>总次数：<strong class="total">{{ totalCount.toLocaleString() }}</strong></span>
      <n-divider vertical />
      <span>剩余总量：<strong class="remain">{{ remainCount.toLocaleString() }}</strong></span>
      <n-divider vertical />
      <span>已用/退：<strong class="used">{{ usedCount.toLocaleString() }}</strong></span>
    </div>

    <div class="table-card">
      <n-data-table :columns="columns" :data="tableData" :pagination="{ pageSize: 15 }" striped size="small" :scroll-x="1500" />
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
  { label: '永久有效', value: 'forever' },
]

const columns = [
  { title: '会员', key: 'member', width: 140 },
  { title: '手机号', key: 'phone', width: 125 },
  { title: '所属商家', key: 'merchant', width: 100, render: (row: any) => h(NTag, { size: 'small', bordered: false }, () => row.merchant) },
  { title: '发生店铺', key: 'storeName', width: 130 },
  { title: '创建时间', key: 'createTime', width: 155 },
  { title: '状态', key: 'status', width: 85, render: (row: any) => {
    const m: Record<string, string> = { active: 'info', expired: 'error', forever: 'success' }
    const t: Record<string, string> = { active: '生效中', expired: '已过期', forever: '永久有效' }
    return h(NTag, { type: (m[row.status] || 'default') as any, size: 'small', bordered: false }, () => t[row.status])
  }},
  { title: '生效日期', key: 'effectiveDate', width: 105 },
  { title: '过期日期', key: 'expireDate', width: 105 },
  { title: '总次数', key: 'totalTimes', width: 70, align: 'center' as const },
  { title: '剩余次数', key: 'remainTimes', width: 80, align: 'center' as const,
    render: (row: any) => h('span', { style: `color:${row.remainTimes > 0 ? '#3B82F6' : 'var(--text-muted)'};font-weight:600` }, row.remainTimes)
  },
  { title: '已用/退次', key: 'usedRefundTimes', width: 95, align: 'center' as const },
  { title: '清空次数', key: 'clearedTimes', width: 80, align: 'center' as const },
  { title: '备注', key: 'remark', minWidth: 170, ellipsis: { tooltip: true } as any },
]

const tableData = ref([
  { id: 1, member: '赵天宇 (VIP)', phone: '177****9900', merchant: '华东展厅', storeName: '华东展厅', createTime: '2026-04-15 14:30', status: 'active', effectiveDate: '2026-04-15', expireDate: '2026-05-15', totalTimes: 5, remainTimes: 5, usedRefundTimes: 0, clearedTimes: 0, remark: '充值套餐：500元5次(30天有效)' },
  { id: 2, member: '阳恩', phone: '159****3344', merchant: '恒然集团', storeName: '恒然分部展厅', createTime: '2026-04-10 10:20', status: 'active', effectiveDate: '2026-04-10', expireDate: '2026-12-31', totalTimes: 10, remainTimes: 8, usedRefundTimes: 2, clearedTimes: 0, remark: '充值套餐：200元10次(年度有效)' },
  { id: 3, member: '张浩理', phone: '138****7890', merchant: '恒然集团', storeName: '恒然分部展厅', createTime: '2026-04-05 09:15', status: 'active', effectiveDate: '2026-04-05', expireDate: '2026-05-05', totalTimes: 3, remainTimes: 3, usedRefundTimes: 0, clearedTimes: 0, remark: '兑换赠送：100元3次(30天有效)' },
  { id: 4, member: '李明远', phone: '136****3456', merchant: '幻影星空', storeName: '幻影星空馆 NO.8088', createTime: '2026-03-28 16:40', status: 'active', effectiveDate: '2026-03-28', expireDate: '2026-06-28', totalTimes: 8, remainTimes: 3, usedRefundTimes: 5, clearedTimes: 0, remark: '充值套餐：300元8次(90天有效)' },
  { id: 5, member: '郑雨萱', phone: '135****6677', merchant: '华东展厅', storeName: '华东展厅', createTime: '2026-03-20 11:30', status: 'forever', effectiveDate: '2026-03-20', expireDate: '永久有效', totalTimes: 1, remainTimes: 1, usedRefundTimes: 0, clearedTimes: 0, remark: '赠送活动：永久有效' },
  { id: 6, member: '王思琪', phone: '137****9012', merchant: '幻影星空', storeName: '幻影星空馆 NO.8088', createTime: '2026-02-15 14:22', status: 'expired', effectiveDate: '2026-02-15', expireDate: '2026-03-15', totalTimes: 2, remainTimes: 0, usedRefundTimes: 1, clearedTimes: 1, remark: '充值套餐：50元2次(30天有效)-已过期' },
  { id: 7, member: '陈晓峰', phone: '186****5566', merchant: '利民街商家', storeName: '利民街大展厅', createTime: '2026-02-10 08:50', status: 'active', effectiveDate: '2026-02-10', expireDate: '2026-05-10', totalTimes: 5, remainTimes: 4, usedRefundTimes: 1, clearedTimes: 0, remark: '充值套餐：100元5次(90天有效)' },
  { id: 8, member: '孙浩然', phone: '199****4455', merchant: '党建馆集团', storeName: '党建馆', createTime: '2026-01-20 13:55', status: 'expired', effectiveDate: '2026-01-20', expireDate: '2026-02-20', totalTimes: 3, remainTimes: 0, usedRefundTimes: 0, clearedTimes: 3, remark: '异常处理：手动清空' },
])

const totalCount = computed(() => tableData.value.reduce((s, r) => s + r.totalTimes, 0))
const remainCount = computed(() => tableData.value.reduce((s, r) => s + r.remainTimes, 0))
const usedCount = computed(() => tableData.value.reduce((s, r) => s + r.usedRefundTimes, 0))

function exportData() {}
</script>

<style scoped>
.page-container { padding: 20px 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 8px; }
.page-title { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }

.summary-bar { display: flex; align-items: center; background: white; border-radius: 10px; padding: 12px 20px; border: 1px solid var(--border-color); margin-bottom: 16px; font-size: 13px; color: var(--text-muted); flex-wrap: wrap; gap: 4px; }
.summary-bar strong { color: var(--text-primary); }
.summary-bar strong.total { color: #8B5CF6; }
.summary-bar strong.remain { color: #3B82F6; }
.summary-bar strong.used { color: #EF4444; }

.table-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid var(--border-color); }
</style>
