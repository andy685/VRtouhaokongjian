<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>分润中心</h1>
        <p class="header-desc">查看您从店铺游戏豆充值中的分润明细与结算记录</p>
      </div>
      <n-space>
        <n-select v-model:value="filterYear" :options="yearOptions" size="small" style="width: 100px;" />
        <n-select v-model:value="filterMonth" :options="monthOptions" size="small" style="width: 100px;" clearable placeholder="全部月份" />
        <n-button type="primary" @click="message.info('导出功能开发中')">
          <template #icon><n-icon :component="DownloadOutline" /></template> 导出明细
        </n-button>
      </n-space>
    </div>

    <!-- 分润概览 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="WalletOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">当月已产生</span>
          <span class="value">¥128,430</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="CheckmarkCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">已结算</span>
          <span class="value">¥89,200</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="TimeOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">待结算</span>
          <span class="value warning">¥39,230</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
          <n-icon :component="TrendingUpOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">年度累计</span>
          <span class="value">¥1.28M</span>
        </div>
      </div>
    </div>

    <!-- 分润明细表格 -->
    <div class="content-card">
      <n-data-table :columns="columns" :data="filteredData" :pagination="pagination" striped />
    </div>

    <!-- 分润规则说明 -->
    <div class="rule-card">
      <h3>分润规则说明</h3>
      <n-descriptions :column="2" bordered size="small">
        <n-descriptions-item label="分润基数">店铺向平台充值游戏豆的金额</n-descriptions-item>
        <n-descriptions-item label="分润比例">采用<n-text type="primary" strong>阶梯分润策略</n-text>，基础比例 15%，月采购额达标后自动上浮</n-descriptions-item>
        <n-descriptions-item label="阶梯规则（示例）">月采购 ≤50万 → 基础比例；50万~100万 → 基础+2%；＞100万 → 基础+5%</n-descriptions-item>
        <n-descriptions-item label="结算周期">通过拉卡拉自动打款，按配置周期结算</n-descriptions-item>
        <n-descriptions-item label="结算方式">银行转账至绑定账户（拉卡拉代发）</n-descriptions-item>
        <n-descriptions-item label="税费说明" :span="2">分润金额为税前，税费由代理商自行申报；发票事宜请联系平台财务线下处理</n-descriptions-item>
      </n-descriptions>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { NTag, NIcon, NDescriptions, NDescriptionsItem, NText, useMessage } from 'naive-ui'
import {
  WalletOutline, CheckmarkCircleOutline, TimeOutline, TrendingUpOutline, DownloadOutline
} from '@vicons/ionicons5'

const message = useMessage()

const filterYear = ref(2026)
const filterMonth = ref<number | null>(null)

const yearOptions = [
  { label: '2026年', value: 2026 },
  { label: '2025年', value: 2025 },
]
const monthOptions = Array.from({ length: 12 }, (_, i) => ({ label: `${i + 1}月`, value: i + 1 }))

const columns = [
  { title: '结算周期', key: 'period', width: 130 },
  { title: '商家名称', key: 'merchant', width: 160 },
  { title: '游戏豆充值金额', key: 'rechargeAmount', width: 150 },
  { title: '分润比例', key: 'rate', width: 90 },
  { title: '分润金额', key: 'amount', width: 120 },
  { title: '结算日期', key: 'settleDate', width: 120 },
  {
    title: '状态', key: 'status', width: 90,
    render: (row: any) => h(NTag, { type: row.status === '已结算' ? 'success' : 'warning', size: 'small' }, () => row.status)
  },
]

const commissionData = ref([
  { period: '2026-04', merchant: '恒然集团', rechargeAmount: '¥356,800', rate: '15%', amount: '¥53,520', settleDate: '2026-05-10', status: '已结算' },
  { period: '2026-04', merchant: '南山科创', rechargeAmount: '¥245,600', rate: '15%', amount: '¥36,840', settleDate: '2026-05-10', status: '已结算' },
  { period: '2026-04', merchant: '利民街商家', rechargeAmount: '¥189,200', rate: '12%', amount: '¥22,704', settleDate: '-', status: '待结算' },
  { period: '2026-04', merchant: '宝安体验中心', rechargeAmount: '¥98,700', rate: '15%', amount: '¥14,805', settleDate: '-', status: '待结算' },
  { period: '2026-03', merchant: '恒然集团', rechargeAmount: '¥328,400', rate: '15%', amount: '¥49,260', settleDate: '2026-04-10', status: '已结算' },
  { period: '2026-03', merchant: '南山科创', rechargeAmount: '¥221,800', rate: '15%', amount: '¥33,270', settleDate: '2026-04-10', status: '已结算' },
  { period: '2026-03', merchant: '利民街商家', rechargeAmount: '¥176,500', rate: '12%', amount: '¥21,180', settleDate: '2026-04-10', status: '已结算' },
  { period: '2026-02', merchant: '恒然集团', rechargeAmount: '¥298,600', rate: '15%', amount: '¥44,790', settleDate: '2026-03-10', status: '已结算' },
  { period: '2026-02', merchant: '南山科创', rechargeAmount: '¥198,300', rate: '15%', amount: '¥29,745', settleDate: '2026-03-10', status: '已结算' },
  { period: '2026-01', merchant: '恒然集团', rechargeAmount: '¥312,700', rate: '15%', amount: '¥46,905', settleDate: '2026-02-10', status: '已结算' },
])

const pagination = { pageSize: 10 }

const filteredData = computed(() => {
  let data = [...commissionData.value]
  if (filterMonth.value) {
    data = data.filter(d => {
      const m = parseInt(d.period.split('-')[1])
      return m === filterMonth.value
    })
  }
  if (filterYear.value) {
    data = data.filter(d => d.period.startsWith(String(filterYear.value)))
  }
  return data
})
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

.content-card { background: white; border-radius: 16px; padding: 24px; border: 1px solid var(--border-color); margin-bottom: 24px; }

.rule-card { background: white; border-radius: 16px; padding: 24px; border: 1px solid var(--border-color); }
.rule-card h3 { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0 0 16px; }
</style>
