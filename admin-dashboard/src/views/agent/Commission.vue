<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>分润中心</h1>
        <p class="header-desc">查看您从店铺游戏豆充值中的分润明细（按扣除供应商成本后的采购额计算）</p>
      </div>
      <n-space>
        <n-select v-model:value="filterYear" :options="yearOptions" size="small" style="width: 100px;" />
        <n-select v-model:value="filterMonth" :options="monthOptions" size="small" style="width: 100px;" clearable placeholder="全部月份" />
        <n-button type="primary" @click="handleExport">
          <template #icon><n-icon :component="DownloadOutline" /></template> 导出明细
        </n-button>
      </n-space>
    </div>

    <!-- 分润概览卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="WalletOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">当月已产生</span>
          <span class="value">¥128,430</span>
          <span class="sub-text">扣除供应商成本后计算</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="CheckmarkCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">已结算到账</span>
          <span class="value success">¥89,200</span>
          <span class="sub-text">上月及以前</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="TimeOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">待结算</span>
          <span class="value warning">¥39,230</span>
          <span class="sub-text">次月15日前打款</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
          <n-icon :component="TrendingUpOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">年度累计</span>
          <span class="value">¥1.28M</span>
          <span class="sub-text">较去年 +23.5%</span>
        </div>
      </div>
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
        <n-descriptions-item label="分润基数">（店铺充值总额 − 供应商成本）× 分润比例</n-descriptions-item>
        <n-descriptions-item label="当前级别">{{ myLevel }}代理 / 基础 {{ myBaseRate }}%</n-descriptions-item>
        <n-descriptions-item label="结算周期">T+1 月结，次月15日前打款</n-descriptions-item>
        <n-descriptions-item label="最低提现">¥100（不足累积下月）</n-descriptions-item>
        <n-descriptions-item label="税费说明" :span="2">税前金额，自行申报；发票请联系平台财务线下处理</n-descriptions-item>
      </n-descriptions>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { NTag, NIcon, NDescriptions, NDescriptionsItem, useMessage } from 'naive-ui'
import {
  WalletOutline, CheckmarkCircleOutline, TimeOutline, TrendingUpOutline,
  DownloadOutline, InformationCircleOutline
} from '@vicons/ionicons5'

const message = useMessage()

// 筛选
const filterYear = ref(2026)
const filterMonth = ref<number | null>(null)
const yearOptions = [{ label: '2026年', value: 2026 }, { label: '2025年', value: 2025 }]
const monthOptions = Array.from({ length: 12 }, (_, i) => ({ label: `${i + 1}月`, value: i + 1 }))

// ---- 代理商分润基本参数 ----
const myLevel = ref('城市')
const myBaseRate = ref(5.0)

// ---- 分润明细表 ----
type RowStatus = '已结算' | '待结算'
const columns = [
  { title: '结算周期', key: 'period', width: 130 },
  { title: '商家名称', key: 'merchant', width: 160 },
  { title: '游戏豆充值额', key: 'rechargeAmount', width: 130 },
  { title: '供应商成本', key: 'supplierCost', width: 110 },
  { title: '分润基数', key: 'commissionBase', width: 110 },
  {
    title: '分润比例',
    key: 'rate',
    width: 90,
    render: (row: any) => row.rate,
  },
  { title: '分润金额', key: 'amount', width: 120, render: (row: any) => h('span', { style: 'font-weight:600;color:#4F46E5;' }, row.amount) },
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
  { period: '2026-04', merchant: '恒然集团', rechargeAmount: '¥356,800', supplierCost: '¥196,240', commissionBase: '¥160,560', rate: '15%', amount: '¥24,084', settleDate: '2026-05-10', status: '已结算' as RowStatus },
  { period: '2026-04', merchant: '南山科创', rechargeAmount: '¥245,600', supplierCost: '¥135,080', commissionBase: '¥110,520', rate: '15%', amount: '¥16,578', settleDate: '2026-05-10', status: '已结算' as RowStatus },
  { period: '2026-04', merchant: '利民街商家', rechargeAmount: '¥189,200', supplierCost: '¥104,060', commissionBase: '¥85,140', rate: '12%', amount: '¥10,217', settleDate: '-', status: '待结算' as RowStatus },
  { period: '2026-04', merchant: '宝安体验中心', rechargeAmount: '¥98,700', supplierCost: '¥54,285', commissionBase: '¥44,415', rate: '15%', amount: '¥6,662', settleDate: '-', status: '待结算' as RowStatus },
  { period: '2026-03', merchant: '恒然集团', rechargeAmount: '¥328,400', supplierCost: '¥180,620', commissionBase: '¥147,780', rate: '15%', amount: '¥22,167', settleDate: '2026-04-10', status: '已结算' as RowStatus },
  { period: '2026-03', merchant: '南山科创', rechargeAmount: '¥221,800', supplierCost: '¥121,990', commissionBase: '¥99,810', rate: '15%', amount: '¥14,972', settleDate: '2026-04-10', status: '已结算' as RowStatus },
  { period: '2026-03', merchant: '利民街商家', rechargeAmount: '¥176,500', supplierCost: '¥97,075', commissionBase: '¥79,425', rate: '12%', amount: '¥9,531', settleDate: '2026-04-10', status: '已结算' as RowStatus },
  { period: '2026-02', merchant: '恒然集团', rechargeAmount: '¥298,600', supplierCost: '¥164,230', commissionBase: '¥134,370', rate: '15%', amount: '¥20,156', settleDate: '2026-03-10', status: '已结算' as RowStatus },
  { period: '2026-02', merchant: '南山科创', rechargeAmount: '¥198,300', supplierCost: '¥109,065', commissionBase: '¥89,235', rate: '15%', amount: '¥13,385', settleDate: '2026-03-10', status: '已结算' as RowStatus },
  { period: '2026-01', merchant: '恒然集团', rechargeAmount: '¥312,700', supplierCost: '¥171,985', commissionBase: '¥140,715', rate: '15%', amount: '¥21,107', settleDate: '2026-02-10', status: '已结算' as RowStatus },
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

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: white; border-radius: 14px; padding: 20px; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 16px; }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-content { display: flex; flex-direction: column; }
.stat-content .label { font-size: 12px; color: var(--text-muted); }
.stat-content .value { font-family: 'Orbitron', sans-serif; font-size: 22px; font-weight: 700; color: var(--text-primary); }
.stat-content .value.warning { color: #F59E0B; }
.stat-content .value.success { color: #10B981; }
.stat-content .sub-text { font-size: 11px; color: var(--text-muted); }

.content-card { background: white; border-radius: 16px; padding: 24px; border: 1px solid var(--border-color); margin-bottom: 24px; }

.rule-card { background: white; border-radius: 16px; padding: 24px; border: 1px solid var(--border-color); }
.rule-card h3 { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0 0 16px; display: flex; align-items: center; gap: 8px; }
</style>
