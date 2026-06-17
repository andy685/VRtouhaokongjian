<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>优惠券管理</h1>
      <n-space>
        <n-select placeholder="状态筛选" :options="statusOptions" style="width: 120px;" />
        <n-button type="primary">
          <template #icon><n-icon :component="AddOutline" /></template> 新建优惠券
        </n-button>
      </n-space>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <n-icon :component="TicketOutline" size="24" color="#3B82F6" />
        <div><span class="num">156,280</span><span class="label">总发放量</span></div>
      </div>
      <div class="stat-card">
        <n-icon :component="CheckmarkCircleOutline" size="24" color="#10B981" />
        <div><span class="num">89,450</span><span class="label">已使用</span></div>
      </div>
      <div class="stat-card">
        <n-icon :component="TimeOutline" size="24" color="#F59E0B" />
        <div><span class="num">45,230</span><span class="label">待使用</span></div>
      </div>
      <div class="stat-card">
        <n-icon :component="TrendingUpOutline" size="24" color="#8B5CF6" />
        <div><span class="num">57.2%</span><span class="label">使用率</span></div>
      </div>
      <div class="stat-card">
        <n-icon :component="CashOutline" size="24" color="#EF4444" />
        <div><span class="num">¥89,450</span><span class="label">优惠总额</span></div>
      </div>
      <div class="stat-card">
        <n-icon :component="BarChartOutline" size="24" color="#06B6D4" />
        <div>
          <span class="num">¥586,200</span>
          <span class="label">带动GMV</span>
          <span class="hint">使用优惠券的订单成交总额</span>
        </div>
      </div>
    </div>

    <n-card class="main-card">
      <n-tabs type="line" animated v-model:value="activeTab">
        <n-tab-pane name="platform" tab="平台优惠券">
          <div class="tab-content">
            <n-data-table :columns="couponColumns" :data="coupons" :pagination="{ pageSize: 10 }" striped />
          </div>
        </n-tab-pane>
        <n-tab-pane name="shop" tab="店铺优惠券">
          <div class="tab-content">
            <n-alert type="info" :show-icon="true">
              店铺优惠券由各店铺自行创建，此处可查看汇总情况
            </n-alert>
            <n-data-table :columns="shopCouponColumns" :data="shopCoupons" :pagination="{ pageSize: 10 }" striped style="margin-top: 16px;" />
          </div>
        </n-tab-pane>
        <n-tab-pane name="templates" tab="券模板">
          <div class="tab-content">
            <div class="template-grid">
              <div v-for="tpl in templates" :key="tpl.id" class="template-card">
                <div class="tpl-preview" :style="{ background: tpl.gradient }">
                  <span class="tpl-value">{{ tpl.value }}</span>
                  <span class="tpl-type">{{ tpl.typeText }}</span>
                </div>
                <div class="tpl-info">
                  <h4>{{ tpl.name }}</h4>
                  <p>{{ tpl.desc }}</p>
                  <n-button size="small" secondary block @click="createFromTemplate(tpl)">使用此模板</n-button>
                </div>
              </div>
            </div>
          </div>
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import {
  NButton, NCard, NDataTable, NTag, NSpace, NTabs, NTabPane,
  NAlert, NIcon, NSelect
} from 'naive-ui'
import {
  TicketOutline, AddOutline, CheckmarkCircleOutline,
  TimeOutline, TrendingUpOutline, CashOutline, BarChartOutline
} from '@vicons/ionicons5'

const activeTab = ref('platform')
const statusOptions = [
  { label: '全部状态', value: 'all' },
  { label: '进行中', value: 'active' },
  { label: '未开始', value: 'pending' },
  { label: '已结束', value: 'ended' },
]

const couponColumns = [
  { title: '优惠券名称', key: 'name', width: 180 },
  { title: '类型', key: 'type', width: 100, render: (row: any) => h(NTag, { size: 'small', bordered: true }, () => row.type) },
  { title: '面额/折扣', key: 'value', width: 120, render: (row: any) => h('span', { style: 'font-weight: 600; color: #EF4444;' }, row.value) },
  { title: '发放数量', key: 'total', width: 100 },
  { title: '已使用', key: 'used', width: 100 },
  { title: '使用率', key: 'rate', width: 100, render: (row: any) => `${Math.round(row.used / row.total * 100)}%` },
  { title: '领取条件', key: 'condition', width: 120 },
  { title: '有效期', key: 'validity', width: 160 },
  { title: '状态', key: 'status', width: 100, render: (row: any) => h(NTag, { type: row.status === 'active' ? 'success' : row.status === 'pending' ? 'warning' : 'default', size: 'small', bordered: true }, () => row.statusText) },
  { title: '操作', key: 'actions', width: 140, render: () => h(NSpace, null, { default: () => [h(NButton, { size: 'tiny', secondary: true }, () => '编辑'), h(NButton, { size: 'tiny', tertiary: true }, () => '详情')] }) },
]

const coupons = ref([
  { id: 1, name: '新年立减券', type: '满减券', value: '满100减20', total: 5000, used: 3280, condition: '无门槛', validity: '2026-01-01 ~ 2026-04-30', status: 'active', statusText: '进行中' },
  { id: 2, name: '新人体验券', type: '满减券', value: '减¥20', total: 10000, used: 4521, condition: '新人自动发放', validity: '长期有效', status: 'active', statusText: '进行中' },
  { id: 3, name: '会员专享8折', type: '折扣券', value: '8折', total: 2000, used: 890, condition: '银卡及以上', validity: '2026-01-01 ~ 2026-06-30', status: 'active', statusText: '进行中' },
  { id: 4, name: '周末畅玩券', type: '满减券', value: '减¥15', total: 3000, used: 1560, condition: '周末使用', validity: '2026-04-01 ~ 2026-04-30', status: 'active', statusText: '进行中' },
  { id: 5, name: '五一促销券', type: '满减券', value: '满200减50', total: 8000, used: 0, condition: '无门槛', validity: '2026-05-01 ~ 2026-05-07', status: 'pending', statusText: '未开始' },
])

const shopCouponColumns = [
  { title: '店铺', key: 'store', width: 180 },
  { title: '券名称', key: 'name' },
  { title: '类型', key: 'type', render: (row: any) => h(NTag, { size: 'small', bordered: true }, () => row.type) },
  { title: '面额', key: 'value' },
  { title: '已使用/发放', key: 'usage', render: (row: any) => `${row.used}/${row.total}` },
  { title: '有效期', key: 'validity' },
  { title: '状态', key: 'status', render: (row: any) => h(NTag, { type: row.status === 'active' ? 'success' : 'default', size: 'small', bordered: true }, () => row.statusText) },
]

const shopCoupons = ref([
  { store: '深圳福田旗舰店', name: '店铺专属8折券', type: '折扣券', value: '8折', used: 156, total: 500, validity: '长期有效', status: 'active' },
  { store: '南山科技园店', name: '周末优惠券', type: '满减券', value: '满50减10', used: 89, total: 200, validity: '长期有效', status: 'active' },
  { store: '广州天河店', name: '会员日专享', type: '满减券', value: '满100减15', used: 45, total: 100, validity: '每月8号', status: 'active' },
])

const templates = ref([
  { id: 1, name: '新人注册券', type: 'cash', typeText: '满减券', value: '¥20', desc: '适用于新用户注册奖励', gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)' },
  { id: 2, name: '会员专享券', type: 'discount', typeText: '折扣券', value: '8折', desc: '会员等级专享折扣', gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' },
])

function createFromTemplate(tpl: any) { console.log('使用模板创建', tpl) }
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); }

.stats-row { display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: white; border-radius: 14px; padding: 20px; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 16px; }
.stat-card .num { font-family: 'Orbitron', sans-serif; font-size: 24px; font-weight: 700; color: var(--text-primary); display: block; }
.stat-card .label { font-size: 12px; color: var(--text-muted); margin-left: 4px; }
.stat-card .hint { display: block; font-size: 11px; color: #999; margin-top: 2px; }

.main-card { border-radius: 16px; border: 1px solid var(--border-color); }

.tab-content { padding-top: 16px; }

.template-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.template-card { background: white; border-radius: 14px; overflow: hidden; border: 1px solid var(--border-color); }
.tpl-preview { height: 100px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; }
.tpl-value { font-family: 'Orbitron', sans-serif; font-size: 28px; font-weight: 700; }
.tpl-type { font-size: 12px; opacity: 0.9; }
.tpl-info { padding: 16px; }
.tpl-info h4 { font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px; }
.tpl-info p { font-size: 12px; color: var(--text-muted); margin-bottom: 12px; }
</style>
