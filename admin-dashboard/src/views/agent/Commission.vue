<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>分润中心</h1>
        <p class="header-desc">查看您从店铺游戏豆充值中的分润明细，支持阶梯策略可视化分析</p>
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
          <span class="sub-text">基于阶梯规则计算</span>
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

    <!-- ★ 阶梯策略可视化面板 -->
    <div class="tier-panel">
      <div class="tier-header" @click="showTierDetail = !showTierDetail">
        <div class="tier-header-left">
          <n-icon :component="AnalyticsOutline" size="18" color="#4F46E5" />
          <span class="tier-title">我的阶梯分润规则</span>
          <n-tag type="info" size="small" :bordered="false">{{ myLevel }}代理 · 基础比例 {{ myBaseRate }}%</n-tag>
        </div>
        <n-icon :component="showTierDetail ? ChevronUpOutline : ChevronDownOutline" size="16" color="#9CA3AF" />
      </div>

      <transition name="collapse">
        <div v-if="showTierDetail" class="tier-body">
          <!-- 阶梯系数条形图 -->
          <div class="tier-visual">
            <div v-for="(t, idx) in tierRules" :key="idx" class="tier-bar-item">
              <div class="tier-bar-label">{{ t.rangeLabel }}</div>
              <div class="tier-bar-track">
                <div
                  class="tier-bar-fill"
                  :style="{ width: `${(t.factor / 2) * 100}%`, background: tierBarColor(t.factor) }"
                >
                  <span class="tier-bar-factor">×{{ t.factor.toFixed(1) }}</span>
                </div>
              </div>
              <div class="tier-bar-name">{{ t.name }}</div>
            </div>
          </div>

          <!-- 本月计算演示（全额按档位） -->
          <div class="tier-demo">
            <h4 class="demo-title">本月游戏豆采购额 ¥120,000 → 落在成长档(×1.2)：</h4>
            <div class="demo-table-wrap">
              <table class="demo-table">
                <thead>
                  <tr><th>计算方式</th><th>采购总额</th><th>基础率</th><th>系数</th><th>分润金额</th></tr>
                </thead>
                <tbody>
                  <tr class="highlight-row">
                    <td>全额按×1.2档计算</td><td>¥120,000</td><td>5%</td><td>×1.2</td>
                    <td class="amount-col total-amount">¥7,200</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p class="demo-hint">注：采购额落在哪个档位区间，全额按该档系数计算，不是分段累进。实际结算以平台财务审核后的最终数据为准。</p>
          </div>
        </div>
      </transition>
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
        <n-descriptions-item label="分润基数">店铺向平台充值游戏豆的金额</n-descriptions-item>
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
  DownloadOutline, AnalyticsOutline, ChevronUpOutline, ChevronDownOutline,
  InformationCircleOutline
} from '@vicons/ionicons5'

const message = useMessage()

// 筛选
const filterYear = ref(2026)
const filterMonth = ref<number | null>(null)
const yearOptions = [{ label: '2026年', value: 2026 }, { label: '2025年', value: 2025 }]
const monthOptions = Array.from({ length: 12 }, (_, i) => ({ label: `${i + 1}月`, value: i + 1 }))

// ---- 阶梯策略面板 ----
const showTierDetail = ref(true)

const myLevel = ref('城市')
const myBaseRate = ref(5.0)

interface TierRule {
  rangeLabel: string
  factor: number
  name: string
}

const tierRules = ref<TierRule[]>([
  { rangeLabel: '¥0 - 5万', factor: 0.8, name: '起步' },
  { rangeLabel: '5万 - 10万', factor: 1.0, name: '基准' },
  { rangeLabel: '10万 - 20万', factor: 1.2, name: '成长' },
  { rangeLabel: '20万+', factor: 1.5, name: '奖励' },
])

function tierBarColor(f: number): string {
  if (f <= 0.85) return '#D1D5DB'
  if (f <= 1.05) return '#3B82F6'
  if (f <= 1.25) return '#F59E0B'
  return '#10B981'
}

// 本月计算演示数据（全额按档位，模拟数据硬编码，实时应从API获取）
// 采购额¥120,000 → 落在¥100,000~199,999档(系数×1.2)
// 分润 = ¥120,000 × 5% × 1.2 = ¥7,200

// ---- 分润明细表 ----
type RowStatus = '已结算' | '待结算'
const columns = [
  { title: '结算周期', key: 'period', width: 130 },
  { title: '商家名称', key: 'merchant', width: 160 },
  { title: '游戏豆充值额', key: 'rechargeAmount', width: 150 },
  {
    title: '分润比例',
    key: 'rate',
    width: 90,
    render: (row: any) => h(NTag, { size: 'small', type: row.tierBoost ? 'success' : 'default', bordered: false }, () =>
      row.tierBoost ? `${row.baseRate}%+` : `${row.rate}`
    ),
  },
  { title: '阶梯系数', key: 'tierFactor', width: 85, render: (row: any) => `×${row.tierFactor || 1.0}` },
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
  { period: '2026-04', merchant: '恒然集团', rechargeAmount: '¥356,800', rate: '15%', tierFactor: 1.2, amount: '¥53,520', settleDate: '2026-05-10', status: '已结算' as RowStatus, baseRate: '15%', tierBoost: true },
  { period: '2026-04', merchant: '南山科创', rechargeAmount: '¥245,600', rate: '15%', tierFactor: 1.2, amount: '¥36,840', settleDate: '2026-05-10', status: '已结算' as RowStatus, baseRate: '15%', tierBoost: true },
  { period: '2026-04', merchant: '利民街商家', rechargeAmount: '¥189,200', rate: '12%', tierFactor: 1.0, amount: '¥22,704', settleDate: '-', status: '待结算' as RowStatus, baseRate: '12%', tierBoost: false },
  { period: '2026-04', merchant: '宝安体验中心', rechargeAmount: '¥98,700', rate: '15%', tierFactor: 1.0, amount: '¥14,805', settleDate: '-', status: '待结算' as RowStatus, baseRate: '15%', tierBoost: false },
  { period: '2026-03', merchant: '恒然集团', rechargeAmount: '¥328,400', rate: '15%', tierFactor: 1.2, amount: '¥49,260', settleDate: '2026-04-10', status: '已结算' as RowStatus, baseRate: '15%', tierBoost: true },
  { period: '2026-03', merchant: '南山科创', rechargeAmount: '¥221,800', rate: '15%', tierFactor: 1.0, amount: '¥33,270', settleDate: '2026-04-10', status: '已结算' as RowStatus, baseRate: '15%', tierBoost: false },
  { period: '2026-03', merchant: '利民街商家', rechargeAmount: '¥176,500', rate: '12%', tierFactor: 1.0, amount: '¥21,180', settleDate: '2026-04-10', status: '已结算' as RowStatus, baseRate: '12%', tierBoost: false },
  { period: '2026-02', merchant: '恒然集团', rechargeAmount: '¥298,600', rate: '15%', tierFactor: 1.0, amount: '¥44,790', settleDate: '2026-03-10', status: '已结算' as RowStatus, baseRate: '15%', tierBoost: false },
  { period: '2026-02', merchant: '南山科创', rechargeAmount: '¥198,300', rate: '15%', tierFactor: 1.0, amount: '¥29,745', settleDate: '2026-03-10', status: '已结算' as RowStatus, baseRate: '15%', tierBoost: false },
  { period: '2026-01', merchant: '恒然集团', rechargeAmount: '¥312,700', rate: '15%', tierFactor: 1.0, amount: '¥46,905', settleDate: '2026-02-10', status: '已结算' as RowStatus, baseRate: '15%', tierBoost: false },
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

/* 阶梯策略面板 */
.tier-panel {
  background: white;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  margin-bottom: 24px;
  overflow: hidden;
}
.tier-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 22px;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
}
.tier-header:hover { background: #F8FAFC; }
.tier-header-left { display: flex; align-items: center; gap: 10px; }
.tier-title { font-size: 15px; font-weight: 600; color: var(--text-primary); }

.collapse-enter-active, .collapse-leave-active { transition: all 0.3s ease; overflow: hidden; }
.collapse-enter-from, .collapse-leave-to { opacity: 0; max-height: 0; }
.collapse-enter-to, .collapse-leave-from { opacity: 1; max-height: 600px; }

.tier-body { padding: 0 22px 22px; }

/* 条形图 */
.tier-visual { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
.tier-bar-item { display: flex; align-items: center; gap: 12px; }
.tier-bar-label { width: 110px; font-size: 13px; color: #64748B; font-family: monospace; text-align: right; }
.tier-bar-track { flex: 1; height: 28px; background: #F1F5F9; border-radius: 6px; overflow: hidden; position: relative; }
.tier-bar-fill {
  height: 100%;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 10px;
  min-width: 60px;
  transition: width 0.5s ease;
}
.tier-bar-factor { font-size: 13px; font-weight: 700; color: white; }
.tier-bar-name { width: 50px; font-size: 12px; color: #94A3B8; }

/* 计算演示 */
.tier-demo { background: #FDFBF7; border-radius: 12px; padding: 18px; }
.demo-title { font-size: 14px; font-weight: 600; color: #334155; margin: 0 0 12px; }
.demo-table-wrap { overflow-x: auto; }
.demo-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.demo-table th { background: #EEF2FF; color: #4338CA; padding: 8px 12px; text-align: left; font-weight: 600; }
.demo-table td { padding: 8px 12px; border-bottom: 1px solid #EDE9FE; color: #374151; }
.total-row { background: #EDE9FE; }
.total-row td { font-weight: 600; color: #4338CA !important; border-bottom: none; }
.amount-col { text-align: right; font-family: monospace; font-weight: 600; }
.total-amount { color: #4F46E5; font-size: 15px; }
.demo-hint { margin: 10px 0 0; font-size: 12px; color: #9CA3AF; }

.content-card { background: white; border-radius: 16px; padding: 24px; border: 1px solid var(--border-color); margin-bottom: 24px; }

.rule-card { background: white; border-radius: 16px; padding: 24px; border: 1px solid var(--border-color); }
.rule-card h3 { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0 0 16px; display: flex; align-items: center; gap: 8px; }
</style>
