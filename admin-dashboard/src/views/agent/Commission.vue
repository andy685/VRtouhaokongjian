<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>分润中心</h1>
        <p class="header-desc">查看合作商家的充值与结算明细</p>
      </div>
      <n-space>
        <n-select v-model:value="filterYear" :options="yearOptions" size="small" style="width: 100px;" />
        <n-select v-model:value="filterMonth" :options="monthOptions" size="small" style="width: 100px;" clearable placeholder="全部月份" />
        <n-button type="primary" @click="handleExport">
          <template #icon><n-icon :component="DownloadOutline" /></template> 导出明细
        </n-button>
      </n-space>
    </div>

    <!-- 分润明细表格 -->
    <div class="content-card">
      <n-data-table :columns="columns" :data="filteredData" :pagination="pagination" striped />
    </div>

    <!-- 分润规则说明（精简版） -->
    <div class="rule-card">
      <h3>
        <n-icon :component="InformationCircleOutline" /> 分润规则速查
      </h3>
      <n-descriptions :column="2" bordered size="small">
        <n-descriptions-item label="结算周期">T+1 月结，次月15日前打款</n-descriptions-item>
        <n-descriptions-item label="最低提现">¥100（不足累积下月）</n-descriptions-item>
        <n-descriptions-item label="结算口径" :span="2">平台按合作规则统一核算，明细以实际结算单为准</n-descriptions-item>
        <n-descriptions-item label="税费说明" :span="2">税前金额，自行申报；发票请联系平台财务线下处理</n-descriptions-item>
      </n-descriptions>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { NTag, NIcon, NDescriptions, NDescriptionsItem, useMessage } from 'naive-ui'
import {
  DownloadOutline, InformationCircleOutline
} from '@vicons/ionicons5'

const message = useMessage()

// 筛选
const filterYear = ref(2026)
const filterMonth = ref<number | null>(null)
const yearOptions = [{ label: '2026年', value: 2026 }, { label: '2025年', value: 2025 }]
const monthOptions = Array.from({ length: 12 }, (_, i) => ({ label: `${i + 1}月`, value: i + 1 }))

// ---- 分润明细表 ----
type RowStatus = '已结算' | '待结算'
const columns = [
  { title: '结算周期', key: 'period', width: 130 },
  { title: '商家名称', key: 'merchant', width: 160 },
  { title: '充值额', key: 'rechargeAmount', width: 130 },
  { title: '结算日期', key: 'settleDate', width: 120 },
  {
    title: '状态',
    key: 'status',
    width: 90,
    render: (row: any) => h(NTag, {
      type: (row.status as RowStatus) === '已结算' ? 'success' : 'warning',
      size: 'small',
      bordered: true,
    }, () => row.status),
  },
]

const commissionData = ref([
  { period: '2026-04', merchant: '恒然集团', rechargeAmount: '¥356,800', settleDate: '2026-05-10', status: '已结算' as RowStatus },
  { period: '2026-04', merchant: '南山科创', rechargeAmount: '¥245,600', settleDate: '2026-05-10', status: '已结算' as RowStatus },
  { period: '2026-04', merchant: '利民街商家', rechargeAmount: '¥189,200', settleDate: '-', status: '待结算' as RowStatus },
  { period: '2026-04', merchant: '宝安体验中心', rechargeAmount: '¥98,700', settleDate: '-', status: '待结算' as RowStatus },
  { period: '2026-03', merchant: '恒然集团', rechargeAmount: '¥328,400', settleDate: '2026-04-10', status: '已结算' as RowStatus },
  { period: '2026-03', merchant: '南山科创', rechargeAmount: '¥221,800', settleDate: '2026-04-10', status: '已结算' as RowStatus },
  { period: '2026-03', merchant: '利民街商家', rechargeAmount: '¥176,500', settleDate: '2026-04-10', status: '已结算' as RowStatus },
  { period: '2026-02', merchant: '恒然集团', rechargeAmount: '¥298,600', settleDate: '2026-03-10', status: '已结算' as RowStatus },
  { period: '2026-02', merchant: '南山科创', rechargeAmount: '¥198,300', settleDate: '2026-03-10', status: '已结算' as RowStatus },
  { period: '2026-01', merchant: '恒然集团', rechargeAmount: '¥312,700', settleDate: '2026-02-10', status: '已结算' as RowStatus },
])

const pagination = { pageSize: 10 }

const filteredData = computed(() => {
  let data = [...commissionData.value]
  if (filterMonth.value) data = data.filter(d => parseInt(d.period.split('-')[1]) === filterMonth.value)
  if (filterYear.value) data = data.filter(d => d.period.startsWith(String(filterYear.value)))
  return data
})

function handleExport() {
  message.success('导出功能开发中...')
}
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.header-desc { font-size: 13px; color: var(--text-muted); margin-top: 4px; display: block; }

.content-card { background: white; border-radius: 16px; padding: 24px; border: 1px solid var(--border-color); margin-bottom: 24px; }

.rule-card { background: white; border-radius: 16px; padding: 24px; border: 1px solid var(--border-color); }
.rule-card h3 { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0 0 16px; display: flex; align-items: center; gap: 8px; }
</style>
