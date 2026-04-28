<template>
  <div class="dashboard-container animate-fade-in">
    <!-- 欢迎区 -->
    <div class="welcome-section">
      <div class="welcome-text">
        <h1>欢迎回来，{{ agentName }}！</h1>
        <p class="welcome-sub">以下是您旗下商家的运营数据概览</p>
      </div>
      <div class="welcome-actions">
        <n-button type="primary" @click="router.push('/agent/merchants')">
          <template #icon><n-icon :component="PeopleOutline" /></template>
          商家管理
        </n-button>
        <n-button @click="router.push('/agent/commission')">
          <template #icon><n-icon :component="WalletOutline" /></template>
          分润明细
        </n-button>
      </div>
    </div>

    <!-- 核心指标卡片 -->
    <div class="stats-grid">
      <div class="stat-card" v-for="stat in coreStats" :key="stat.label">
        <div class="stat-icon" :style="{ background: stat.gradient }">
          <n-icon :component="stat.icon" size="22" color="#fff" />
        </div>
        <div class="stat-info">
          <span class="stat-label">{{ stat.label }}</span>
          <span class="stat-value">{{ stat.value }}</span>
        </div>
        <div class="stat-trend" :class="stat.trendType">
          <n-icon :component="stat.trendIcon" size="14" />
          {{ stat.trend }}
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-grid">
      <div class="chart-card">
        <div class="chart-header">
          <h3>旗下店铺游戏豆充值趋势（近7天）</h3>
        </div>
        <div class="chart-placeholder">
          <div class="bar-chart">
            <div class="bar-group" v-for="(day, idx) in revenueChart" :key="idx">
              <div class="bar" :style="{ height: day.percent + '%', background: 'linear-gradient(180deg, #F59E0B, #D97706)' }">
                <span class="bar-tooltip">¥{{ day.value.toLocaleString() }}</span>
              </div>
              <span class="bar-label">{{ day.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <h3>商家游戏豆充值排行</h3>
          <n-button text size="small">查看全部</n-button>
        </div>
        <div class="rank-list">
          <div class="rank-item" v-for="(item, idx) in merchantRank" :key="idx">
            <div class="rank-no" :class="{ top3: idx < 3 }">{{ idx + 1 }}</div>
            <div class="rank-info">
              <span class="rank-name">{{ item.name }}</span>
              <span class="rank-desc">{{ item.stores }} 家店铺</span>
            </div>
            <div class="rank-value">¥{{ item.revenue.toLocaleString() }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 店铺设备状态 -->
    <div class="bottom-grid">
      <div class="table-card">
        <div class="card-header">
          <h3>店铺设备状态</h3>
          <n-button text size="small" @click="router.push('/agent/stores')">查看全部</n-button>
        </div>
        <n-data-table :columns="deviceColumns" :data="deviceData" :pagination="false" striped size="small" />
      </div>

      <div class="table-card">
        <div class="card-header">
          <h3>最近分润记录</h3>
          <n-button text size="small" @click="router.push('/agent/commission')">查看全部</n-button>
        </div>
        <n-data-table :columns="commissionColumns" :data="commissionData" :pagination="false" striped size="small" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import { useRouter } from 'vue-router'
import { NIcon, NTag, NButton, NDataTable } from 'naive-ui'
import {
  PeopleOutline, StorefrontOutline, TrendingUpOutline, WalletOutline,
  ChevronUpOutline, ChevronDownOutline
} from '@vicons/ionicons5'

const router = useRouter()
const agentName = ref('深圳未来科技')

const coreStats = ref([
  {
    label: '旗下商家',
    value: '12 家',
    gradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
    icon: PeopleOutline,
    trend: '+2 本月新增',
    trendType: 'up',
    trendIcon: ChevronUpOutline,
  },
  {
    label: '管辖店铺',
    value: '36 家',
    gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)',
    icon: StorefrontOutline,
    trend: '+5 本月新增',
    trendType: 'up',
    trendIcon: ChevronUpOutline,
  },
  {
    label: '本月游戏豆充值',
    value: '¥856,200',
    gradient: 'linear-gradient(135deg, #10B981, #059669)',
    icon: TrendingUpOutline,
    trend: '+12.5%',
    trendType: 'up',
    trendIcon: ChevronUpOutline,
  },
  {
    label: '本月分润',
    value: '¥128,430',
    gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
    icon: WalletOutline,
    trend: '+8.3%',
    trendType: 'up',
    trendIcon: ChevronUpOutline,
  },
])

const revenueChart = ref([
  { label: '周一', value: 98000, percent: 65 },
  { label: '周二', value: 112000, percent: 75 },
  { label: '周三', value: 89000, percent: 60 },
  { label: '周四', value: 125000, percent: 83 },
  { label: '周五', value: 156000, percent: 100 },
  { label: '周六', value: 148000, percent: 95 },
  { label: '周日', value: 128000, percent: 82 },
])

const merchantRank = ref([
  { name: '恒然集团', stores: 8, revenue: 356800 },
  { name: '南山科创', stores: 6, revenue: 245600 },
  { name: '利民街商家', stores: 3, revenue: 189200 },
  { name: '宝安体验中心', stores: 2, revenue: 98700 },
  { name: '龙岗欢乐时光', stores: 1, revenue: 45600 },
])

const deviceColumns = [
  { title: '店铺名称', key: 'storeName', width: 160 },
  { title: '商家', key: 'merchant', width: 120 },
  { title: '设备总数', key: 'totalDevices', width: 90 },
  {
    title: '在线', key: 'online', width: 80,
    render: (row: any) => h(NTag, { type: 'success', size: 'small', bordered: false }, () => row.online)
  },
  {
    title: '离线', key: 'offline', width: 80,
    render: (row: any) => h(NTag, { type: 'default', size: 'small', bordered: false }, () => row.offline)
  },
  { title: '今日营收', key: 'todayRevenue', width: 120 },
]

const deviceData = ref([
  { storeName: '深圳福田旗舰店', merchant: '恒然集团', totalDevices: 12, online: 11, offline: 1, todayRevenue: '¥15,680' },
  { storeName: '南山科技园店', merchant: '恒然集团', totalDevices: 8, online: 8, offline: 0, todayRevenue: '¥9,240' },
  { storeName: '南山科创店', merchant: '南山科创', totalDevices: 10, online: 9, offline: 1, todayRevenue: '¥11,200' },
  { storeName: '利民街店', merchant: '利民街商家', totalDevices: 6, online: 6, offline: 0, todayRevenue: '¥7,860' },
  { storeName: '宝安体验中心', merchant: '宝安体验', totalDevices: 4, online: 3, offline: 1, todayRevenue: '¥4,560' },
])

const commissionColumns = [
  { title: '结算周期', key: 'period', width: 130 },
  { title: '商家', key: 'merchant', width: 120 },
  { title: '游戏豆充值金额', key: 'rechargeAmount', width: 150 },
  { title: '分润比例', key: 'rate', width: 90 },
  { title: '分润金额', key: 'amount', width: 120 },
  {
    title: '状态', key: 'status', width: 90,
    render: (row: any) => h(NTag, { type: row.status === '已结算' ? 'success' : 'warning', size: 'small' }, () => row.status)
  },
]

const commissionData = ref([
  { period: '2026-04', merchant: '恒然集团', rechargeAmount: '¥356,800', rate: '15%', amount: '¥53,520', status: '已结算' },
  { period: '2026-04', merchant: '南山科创', rechargeAmount: '¥245,600', rate: '15%', amount: '¥36,840', status: '已结算' },
  { period: '2026-04', merchant: '利民街商家', rechargeAmount: '¥189,200', rate: '12%', amount: '¥22,704', status: '待结算' },
  { period: '2026-03', merchant: '恒然集团', rechargeAmount: '¥328,400', rate: '15%', amount: '¥49,260', status: '已结算' },
  { period: '2026-03', merchant: '南山科创', rechargeAmount: '¥221,800', rate: '15%', amount: '¥33,270', status: '已结算' },
])
</script>

<style scoped>
.dashboard-container { padding: 24px; max-width: 1400px; margin: 0 auto; }

/* 欢迎区 */
.welcome-section {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 28px; padding: 28px 32px;
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
  border-radius: 20px; color: white;
}
.welcome-text h1 { font-size: 24px; font-weight: 700; margin: 0 0 6px; color: white; }
.welcome-sub { font-size: 14px; opacity: 0.85; margin: 0; }
.welcome-actions { display: flex; gap: 12px; }
.welcome-actions .n-button { background: rgba(255,255,255,0.2); color: white; border-color: rgba(255,255,255,0.3); }
.welcome-actions .n-button:hover { background: rgba(255,255,255,0.3); }
.welcome-actions .n-button:first-child { background: white; color: #D97706; }

/* 核心指标 */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 28px; }
.stat-card {
  background: white; border-radius: 16px; padding: 22px 24px;
  border: 1px solid var(--border-color);
  display: flex; align-items: center; gap: 16px;
  transition: all 0.25s; position: relative; overflow: hidden;
}
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.08); }
.stat-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-info { display: flex; flex-direction: column; flex: 1; }
.stat-label { font-size: 13px; color: var(--text-muted); }
.stat-value { font-family: 'Orbitron', sans-serif; font-size: 20px; font-weight: 700; color: var(--text-primary); }
.stat-trend { position: absolute; top: 16px; right: 20px; font-size: 12px; display: flex; align-items: center; gap: 2px; }
.stat-trend.up { color: #10B981; }
.stat-trend.down { color: #EF4444; }

/* 图表区域 */
.charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; }
.chart-card { background: white; border-radius: 16px; padding: 24px; border: 1px solid var(--border-color); }
.chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.chart-header h3 { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0; }

/* 柱状图 */
.chart-placeholder { height: 240px; display: flex; align-items: flex-end; }
.bar-chart { display: flex; align-items: flex-end; gap: 12px; width: 100%; height: 100%; padding-bottom: 28px; }
.bar-group { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; }
.bar { width: 100%; max-width: 48px; border-radius: 6px 6px 0 0; position: relative; transition: height 0.3s; min-height: 4px; }
.bar-tooltip { position: absolute; top: -24px; left: 50%; transform: translateX(-50%); font-size: 11px; color: var(--text-muted); white-space: nowrap; }
.bar-label { font-size: 11px; color: var(--text-muted); margin-top: 6px; }

/* 排行列表 */
.rank-list { display: flex; flex-direction: column; gap: 4px; }
.rank-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; transition: background 0.2s; }
.rank-item:hover { background: var(--color-bg-elevated); }
.rank-no { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: var(--text-muted); background: var(--color-bg-elevated); }
.rank-no.top3 { background: linear-gradient(135deg, #F59E0B, #D97706); color: white; }
.rank-info { flex: 1; }
.rank-name { font-size: 14px; font-weight: 500; color: var(--text-primary); display: block; }
.rank-desc { font-size: 12px; color: var(--text-muted); }
.rank-value { font-family: 'Orbitron', sans-serif; font-size: 15px; font-weight: 600; color: var(--text-primary); }

/* 底部表格 */
.bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.table-card { background: white; border-radius: 16px; padding: 24px; border: 1px solid var(--border-color); }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.card-header h3 { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0; }

@media (max-width: 1200px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .charts-grid { grid-template-columns: 1fr; }
  .bottom-grid { grid-template-columns: 1fr; }
}
</style>
