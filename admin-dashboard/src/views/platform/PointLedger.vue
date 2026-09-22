<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>积分流水</h1>
        <p class="header-desc">查看会员积分余额和积分变动记录</p>
      </div>
    </div>

    <div class="summary-row">
      <div class="summary-card"><span>会员积分总余额</span><strong>286,540</strong><small>积分</small></div>
      <div class="summary-card"><span>今日发放</span><strong>12,860</strong><small>积分</small></div>
      <div class="summary-card"><span>今日扣减</span><strong class="deduct">1,200</strong><small>积分</small></div>
    </div>

    <n-card title="会员积分余额" :bordered="false" class="section-card">
      <template #header-extra><n-input v-model:value="memberKeyword" clearable placeholder="搜索会员姓名/手机号" style="width: 230px" /></template>
      <n-data-table :columns="memberColumns" :data="filteredMembers" :pagination="{ pageSize: 6 }" :single-line="false" />
    </n-card>

    <n-card title="积分变动明细" :bordered="false" class="section-card">
      <template #header-extra>
        <n-space>
          <n-select v-model:value="sourceFilter" :options="sourceOptions" clearable placeholder="全部来源" style="width: 140px" />
          <n-select v-model:value="changeFilter" :options="changeOptions" clearable placeholder="全部变动" style="width: 120px" />
        </n-space>
      </template>
      <n-data-table :columns="ledgerColumns" :data="filteredLedger" :pagination="{ pageSize: 8 }" :single-line="false" />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { computed, h, ref } from 'vue'
import { NCard, NDataTable, NInput, NSelect, NSpace, NTag } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'

interface MemberBalance { id: number; name: string; phone: string; points: number; earned: number; used: number; updatedAt: string }
interface LedgerItem { id: number; member: string; phone: string; change: number; balance: number; source: string; taskCategory: string; orderNo: string; remark: string; createdAt: string }

const memberKeyword = ref('')
const sourceFilter = ref<string | null>(null)
const changeFilter = ref<string | null>(null)
const sourceOptions = [
  { label: '新兵入伍礼', value: '新兵入伍礼' },
  { label: '连续巡航', value: '连续巡航' },
  { label: '王牌航线', value: '王牌航线' },
  { label: '派托合作任务', value: '派托合作任务' },
  { label: '冬日作战月', value: '冬日作战月' },
  { label: '兑换扣减', value: '兑换扣减' },
]
const changeOptions = [{ label: '增加', value: 'increase' }, { label: '扣减', value: 'deduct' }]

const members = ref<MemberBalance[]>([
  { id: 1, name: '张小明', phone: '138****1234', points: 1680, earned: 2260, used: 580, updatedAt: '2026-09-21 14:32' },
  { id: 2, name: '李小红', phone: '139****5678', points: 1060, earned: 1400, used: 340, updatedAt: '2026-09-21 13:18' },
  { id: 3, name: '王小强', phone: '137****9012', points: 650, earned: 650, used: 0, updatedAt: '2026-09-21 11:05' },
  { id: 4, name: '陈小芳', phone: '136****3456', points: 2490, earned: 2950, used: 460, updatedAt: '2026-09-20 18:40' },
])
const ledger = ref<LedgerItem[]>([
  { id: 1, member: '张小明', phone: '138****1234', change: 500, balance: 1680, source: '新兵入伍礼', taskCategory: '一次性任务', orderNo: 'CZ202609210001', remark: '注册当日首充≥100 元，消费≥30 元', createdAt: '2026-09-21 14:32' },
  { id: 2, member: '李小红', phone: '139****5678', change: 200, balance: 1060, source: '连续巡航', taskCategory: '日常任务', orderNo: 'XF202609210018', remark: '连续 2 天同店消费达成', createdAt: '2026-09-21 13:18' },
  { id: 3, member: '王小强', phone: '137****9012', change: 150, balance: 650, source: '王牌航线', taskCategory: '日常任务', orderNo: 'YX202609210009', remark: '完成指定游戏“星际营救”1 局', createdAt: '2026-09-21 11:05' },
  { id: 4, member: '陈小芳', phone: '136****3456', change: 150, balance: 2490, source: '派托合作任务', taskCategory: '日常任务', orderNo: 'PT202609200016', remark: '为“派托大空间”多人局买单', createdAt: '2026-09-20 18:40' },
  { id: 5, member: '张小明', phone: '138****1234', change: 150, balance: 1830, source: '冬日作战月', taskCategory: '节日任务', orderNo: 'HD202612010001', remark: '活动期间积分获取 ×2，结算自动翻倍', createdAt: '2026-12-01 15:20' },
  { id: 6, member: '张小明', phone: '138****1234', change: -300, balance: 1380, source: '兑换扣减', taskCategory: '扣减', orderNo: 'EX202609210006', remark: '积分兑换游戏币', createdAt: '2026-09-21 12:20' },
])

const filteredMembers = computed(() => {
  const keyword = memberKeyword.value.trim().toLowerCase()
  if (!keyword) return members.value
  return members.value.filter(member => `${member.name}${member.phone}`.toLowerCase().includes(keyword))
})
const filteredLedger = computed(() => ledger.value.filter(item => {
  if (sourceFilter.value && item.source !== sourceFilter.value) return false
  if (changeFilter.value === 'increase' && item.change < 0) return false
  if (changeFilter.value === 'deduct' && item.change >= 0) return false
  return true
}))

const memberColumns: DataTableColumns<MemberBalance> = [
  { title: '会员', key: 'name', width: 120 },
  { title: '手机号', key: 'phone', width: 130 },
  { title: '当前积分', key: 'points', width: 110, render: row => h('strong', { style: 'color:#2563eb;' }, row.points.toLocaleString()) },
  { title: '累计获得', key: 'earned', width: 110 },
  { title: '累计使用', key: 'used', width: 110 },
  { title: '最近变动', key: 'updatedAt', width: 160 },
]
const ledgerColumns: DataTableColumns<LedgerItem> = [
  { title: '会员', key: 'member', width: 110 },
  { title: '手机号', key: 'phone', width: 130 },
  { title: '变动积分', key: 'change', width: 110, render: row => h('span', { style: `font-weight:600;color:${row.change > 0 ? '#16a34a' : '#dc2626'}` }, `${row.change > 0 ? '+' : ''}${row.change}`) },
  { title: '变动后余额', key: 'balance', width: 110 },
  { title: '任务分类', key: 'taskCategory', width: 110 },
  { title: '来源任务', key: 'source', width: 130, render: row => h(NTag, { size: 'small', bordered: false, type: row.change > 0 ? 'success' : 'warning' }, () => row.source) },
  { title: '触发说明', key: 'remark', minWidth: 220, ellipsis: { tooltip: true } },
  { title: '关联订单', key: 'orderNo', width: 160 },
  { title: '时间', key: 'createdAt', width: 160 },
]
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { margin-bottom: 16px; }
.page-header h1 { margin: 0; color: #1f2937; font-size: 20px; }
.header-desc { margin: 6px 0 0; color: #8b95a5; font-size: 13px; }
.summary-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
.summary-card { padding: 16px 18px; background: #fff; border: 1px solid #edf0f5; border-radius: 6px; }
.summary-card span, .summary-card small { display: block; color: #8b95a5; font-size: 13px; }
.summary-card strong { display: inline-block; margin: 8px 6px 3px 0; color: #2563eb; font-size: 24px; }
.summary-card strong.deduct { color: #dc2626; }
.section-card { margin-bottom: 16px; }
@media (max-width: 760px) { .summary-row { grid-template-columns: 1fr; } }
</style>
