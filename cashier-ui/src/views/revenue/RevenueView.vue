<template>
  <section class="revenue-page" aria-label="营收">
    <!-- Tab 切换 — 胶囊式设计 -->
    <div class="rev-tab-bar">
      <button
        type="button"
        class="rev-tab-pill"
        :class="{ active: activeTab === 'shift' }"
        @click="activeTab = 'shift'"
      >当班营收</button>
      <button
        type="button"
        class="rev-tab-pill"
        :class="{ active: activeTab === 'store' }"
        @click="activeTab = 'store'"
      >门店营收</button>
    </div>

    <!-- ==================== 当班营收 ==================== -->
    <div v-if="activeTab === 'shift'" class="rev-shift-body">
      <!-- 顶部卡片行：营收总额 + 柜台现金 -->
      <div class="rev-top-row">
        <!-- 营收总额 · 蓝紫渐变 -->
        <div class="rev-total-card">
          <div class="rtc-label-row">
            <span class="rtc-title">营收总额</span>
            <span class="rtc-unit">单位：元</span>
          </div>
          <div class="rtc-body">
            <p class="rtc-note">不含预存款消费</p>
            <p class="rtc-value">¥{{ shiftData.totalAmount.toFixed(2) }}</p>
          </div>
        </div>

        <!-- 柜台现金 · 主金额 + 拆分明细一体卡片 -->
        <div class="rev-cash-card">
          <div class="rcc-main">
            <span class="rcc-label">柜台现金额</span>
            <span class="rcc-value">¥{{ shiftData.counterCash.toFixed(2) }}</span>
          </div>
          <div class="rcc-divider"></div>
          <div class="rcc-split">
            <div class="rcc-split-label">备用金</div>
            <div class="rcc-split-val">{{ shiftData.reserveCash.toFixed(2) }}</div>
            <span class="rcc-plus">+</span>
            <div class="rcc-split-label">营收现金</div>
            <div class="rcc-split-val">{{ shiftData.revenueCash.toFixed(2) }}</div>
          </div>
        </div>
      </div>

      <!-- 底部行：业务售费情况（宽） + 各支付方式金额（窄） -->
      <div class="rev-bottom-row">
        <!-- 业务售费情况 -->
        <div class="rev-biz-panel">
          <div class="rbp-head">
            <div class="rbp-head-left">
              <h3 class="section-title">业务售费情况</h3>
              <span class="section-badge">元</span>
            </div>
            <span class="rbp-head-tip">含收银台预存款消费</span>
          </div>
          <div class="rbp-grid">
            <!-- 收入列 -->
            <div class="rbp-col">
              <div v-for="item in shiftData.businessIncome" :key="item.label" class="biz-chip biz-chip--income">
                <span class="biz-chip-label">{{ item.label }}</span>
                <span class="biz-chip-val">{{ item.value.toFixed(2) }}</span>
              </div>
            </div>
            <!-- 支出列 -->
            <div class="rbp-col rbp-col--expense">
              <div v-for="item in shiftData.businessExpense" :key="item.label" class="biz-chip biz-chip--expense">
                <span class="biz-chip-label">{{ item.label }}</span>
                <span class="biz-chip-val">{{ item.value.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 各支付方式金额 -->
        <div class="rev-pay-panel">
          <div class="rpp-head">
            <h3 class="section-title">各支付方式金额</h3>
            <span class="section-badge">元</span>
          </div>
          <div class="rpp-list">
            <div v-for="item in shiftData.payments" :key="item.label" class="rpp-row">
              <span class="rpp-icon" :class="`rpp-icon--${item.type}`">
                <component :is="getPayIcon(item.type)" />
              </span>
              <span class="rpp-name">{{ item.label }}</span>
              <span class="rpp-amount">{{ item.amount.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 门店营收 ==================== -->
    <div v-if="activeTab === 'store'" class="rev-store-body">
      <!-- 筛选栏 -->
      <div class="store-bar">
        <div class="store-bar-info">
          <div class="sbi-chip">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="#64748b" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span class="sbi-label">门店</span>
            <span class="sbi-value">{{ storeData.storeName }}</span>
          </div>
          <div class="sbi-total">
            <span class="sbi-label">门店营收总额</span>
            <span class="sbi-amount">¥{{ storeData.totalAmount.toFixed(2) }}</span>
          </div>
        </div>
        <div class="store-bar-controls">
          <el-date-picker
            v-model="storeData.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            size="default"
          />
          <button class="btn-refresh" @click="refreshStore">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            刷新
          </button>
        </div>
      </div>

      <!-- 收款统计面板 -->
      <div class="store-stats">
        <div class="sts-head">
          <h3 class="section-title">收款统计</h3>
          <div class="sts-toggle">
            <button class="stg-btn" :class="{ active: storeViewMode === 'clerk' }" @click="storeViewMode = 'clerk'">按收银员</button>
            <button class="stg-btn" :class="{ active: storeViewMode === 'payment' }" @click="storeViewMode = 'payment'">按支付方式</button>
          </div>
        </div>

        <!-- 按收银员 -->
        <div v-if="storeViewMode === 'clerk'" class="clerk-grid">
          <div v-for="(clerk, i) in storeData.clerks" :key="clerk.name" class="clerk-card">
            <div class="clerk-top">
              <span class="clerk-avatar">&#8203;</span>
              <div>
                <p class="clerk-name">{{ clerk.name }}</p>
                <p class="clerk-sub">收银员 {{ i + 1 }}</p>
              </div>
            </div>
            <div class="clerk-pays">
              <div v-for="pay in clerk.paymentBreakdown" :key="pay.label" class="clerk-pay">
                <span class="clerk-pay-label">{{ pay.label }}</span>
                <span class="clerk-pay-val">¥{{ pay.amount.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 按支付方式 -->
        <div v-if="storeViewMode === 'payment'" class="pay-row">
          <div v-for="item in storeData.paymentSummary" :key="item.label" class="pay-card">
            <span class="pay-icon" :class="`pay-icon--${item.type || item.label}`">
              <component :is="getStorePayIcon(item.type || item.label)" />
            </span>
            <span class="pay-name">{{ item.label }}</span>
            <span class="pay-amount">¥{{ item.amount.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive } from 'vue'
import {
  CreditCard,
  Wallet,
  Link,
  ChatDotRound
} from '@element-plus/icons-vue'

const activeTab = ref('shift')
const storeViewMode = ref('clerk')

const getPayIcon = (type) => {
  const map = { scan: CreditCard, cash: Wallet, alipay: Link, wechat: ChatDotRound, deposit: Wallet }
  return map[type] || Wallet
}

const getStorePayIcon = (type) => {
  const map = {
    '扫码支付': CreditCard, '现金': Wallet, '线下支付宝': Link, '线下微信': ChatDotRound, '预存款': Wallet,
    scan: CreditCard, cash: Wallet, alipay: Link, wechat: ChatDotRound, deposit: Wallet
  }
  return map[type] || Wallet
}

// ---------- 当班营收 ----------
const shiftData = reactive({
  totalAmount: 1400.00,
  counterCash: 80.00,
  reserveCash: 0.00,
  revenueCash: 80.00,

  businessIncome: [
    { label: '预存充值', value: 1300.00 },
    { label: '开套票', value: 0.00 },
    { label: '购买项目', value: 100.00 },
    { label: '购买商品', value: 0.00 },
    { label: '其他收入', value: 0.00 }
  ],

  businessExpense: [
    { label: '预存充值退款', value: 0.00 },
    { label: '套票退款', value: 0.00 },
    { label: '项目退款', value: 0.00 },
    { label: '商品退款', value: 0.00 },
    { label: '其他支出', value: 0.00 }
  ],

  payments: [
    { label: '扫码支付',  amount: 0.00, type: 'scan' },
    { label: '现金',       amount: 80.00, type: 'cash' },
    { label: '线下支付宝', amount: 20.00, type: 'alipay' },
    { label: '线下微信',   amount: 130.00, type: 'wechat' },
    { label: '预存款',     amount: 0.00, type: 'deposit' }
  ]
})

// ---------- 门店营收 ----------
const storeData = reactive({
  storeName: '北京头号空间',
  totalAmount: 3288.02,
  dateRange: [],

  clerks: [
    {
      name: '店员名称1',
      paymentBreakdown: [
        { label: '现金', amount: 280.00 },
        { label: '线下微信', amount: 1300.00 },
        { label: '线下支付宝', amount: 120.00 }
      ]
    },
    {
      name: '店员名称2',
      paymentBreakdown: [
        { label: '现金', amount: 280.00 },
        { label: '线下微信', amount: 1300.00 },
        { label: '线下支付宝', amount: 120.00 }
      ]
    },
    {
      name: '店员名称3',
      paymentBreakdown: [
        { label: '现金', amount: 280.00 },
        { label: '线下微信', amount: 1300.00 },
        { label: '线下支付宝', amount: 120.00 }
      ]
    }
  ],

  paymentSummary: [
    { label: '扫码支付',     amount: 800.00,  type: 'scan' },
    { label: '现金',         amount: 280.00,  type: 'cash' },
    { label: '线下支付宝',   amount: 1300.00, type: 'alipay' },
    { label: '线下微信',     amount: 120.00,  type: 'wechat' },
    { label: '预存款',       amount: 0.00,    type: 'deposit' }
  ]
})

const refreshStore = () => {}
</script>

<style scoped>
/* ============================================================
   DESIGN TOKENS
   ============================================================ */
.revenue-page {
  --c-bg:           #eaf7ff;
  --c-white:        #ffffff;
  --c-card-muted:   #f5f8fc;
  --c-stripe:       #f8fafc;
  --c-border:       #e8edf2;
  --c-blue-600:     #2563eb;
  --c-blue-700:     #1d4ed8;
  --c-blue-light:   #eff6ff;
  --c-text:         #0f172a;
  --c-text-secondary: #475569;
  --c-text-muted:   #94a3b8;
  --c-divider:      #ecf1f6;

  --r: 16px;
  --r-sm: 12px;
  --r-xs: 8px;
  --r-icon: 10px;

  --shadow-card: 0 1px 2px rgba(30,64,175,.04), 0 4px 16px rgba(30,64,175,.05);
  --shadow-blue: 0 4px 20px rgba(37,99,235,.30);

  --fs-hero: 40px;
  --fs-xxl:  34px;
  --fs-xl:   18px;
  --fs-lg:   15px;
  --fs-base: 13px;
  --fs-sm:   11px;

  --gap: 16px;
  --gap-inner: 12px;

  min-height: calc(100vh - 86px);
  min-width: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--gap);
  padding: 16px 18px 20px;
  background: var(--c-bg);
  overflow-y: auto;
}

/* ============================================================
   TAB BAR — 胶囊式
   ============================================================ */
.rev-tab-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--c-white);
  border-radius: var(--r-xs);
  padding: 4px;
  width: fit-content;
  box-shadow: var(--shadow-card);
}

.rev-tab-pill {
  border: 0;
  border-radius: 7px;
  padding: 7px 20px;
  font-size: var(--fs-base);
  font-weight: 500;
  color: var(--c-text-secondary);
  background: transparent;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.18s ease;
}

.rev-tab-pill:hover {
  color: var(--c-blue-600);
}

.rev-tab-pill.active {
  background: var(--c-blue-600);
  color: #fff;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(37,99,235,.35);
}

/* ============================================================
   面板通用 section-title + badge
   ============================================================ */
.section-title {
  font-size: var(--fs-base);
  font-weight: 600;
  color: var(--c-text);
  margin: 0;
  line-height: 1.3;
}

.section-badge {
  display: inline-block;
  padding: 1px 7px;
  border-radius: 4px;
  background: var(--c-blue-light);
  color: var(--c-blue-600);
  font-size: var(--fs-sm);
  font-weight: 500;
  line-height: 18px;
}

/* ============================================================
   当班营收
   ============================================================ */
.rev-shift-body {
  display: flex;
  flex-direction: column;
  gap: var(--gap);
}

/* ---- 顶部行 ---- */
.rev-top-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--gap);
  align-items: stretch;
}

/* -- 营收总额蓝紫卡片 -- */
.rev-total-card {
  background: linear-gradient(138deg, #4f6cf7 0%, #2563eb 40%, #1d4ed8 100%);
  border-radius: var(--r);
  padding: 22px 24px;
  color: #fff;
  box-shadow: var(--shadow-blue);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 160px;
}

.rtc-label-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.rtc-title { font-size: var(--fs-lg); font-weight: 600; }
.rtc-unit  { font-size: var(--fs-sm); opacity: .75; }

.rtc-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rtc-note  { font-size: var(--fs-sm); opacity: .72; }
.rtc-value { font-size: var(--fs-hero); font-weight: 700; line-height: 1.1; letter-spacing: -.02em; }

/* -- 柜台现金 · 一体卡片 -- */
.rev-cash-card {
  background: var(--c-white);
  border-radius: var(--r);
  padding: 22px 24px;
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rcc-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rcc-label { font-size: var(--fs-sm); color: var(--c-text-secondary); font-weight: 500; }
.rcc-value { font-size: var(--fs-xxl); font-weight: 700; color: var(--c-text); line-height: 1.15; }

.rcc-divider {
  height: 1px;
  background: var(--c-divider);
}

.rcc-split {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.rcc-split-label { font-size: var(--fs-sm); color: var(--c-text-muted); }
.rcc-split-val   { font-size: var(--fs-xl); font-weight: 600; color: #334155; }

.rcc-plus {
  font-size: 20px;
  font-weight: 300;
  color: var(--c-text-muted);
  margin: 0 2px;
}



/* ---- 底部行 ---- */
.rev-bottom-row {
  display: grid;
  grid-template-columns: 1fr 290px;
  gap: var(--gap);
}

/* -- 业务售费情况 -- */
.rev-biz-panel {
  background: var(--c-white);
  border-radius: var(--r);
  padding: 20px 24px;
  box-shadow: var(--shadow-card);
}

.rbp-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.rbp-head-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rbp-head-tip {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  background: #fef3c7;
  color: #b45309;
  font-size: var(--fs-sm);
  font-weight: 500;
}
.rbp-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 40px;
}

.rbp-col {
  display: flex;
  flex-direction: column;
}

/* -- 业务色块 -- */
.biz-chip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-radius: var(--r-xs);
  font-size: var(--fs-base);
  margin-bottom: 8px;
}

.biz-chip:last-child { margin-bottom: 0; }

.biz-chip--income {
  background: #f3fef8;
}

.biz-chip--income .biz-chip-label { color: #059669; font-weight: 500; }
.biz-chip--income .biz-chip-val   { color: #047857; font-weight: 700; }

.biz-chip--expense {
  background: #fef9f9;
}

.biz-chip--expense .biz-chip-label { color: #dc2626; font-weight: 500; }
.biz-chip--expense .biz-chip-val   { color: #b91c1c; font-weight: 700; }

.biz-chip-val {
  font-variant-numeric: tabular-nums;
}

/* -- 各支付方式金额 -- */
.rev-pay-panel {
  background: var(--c-white);
  border-radius: var(--r);
  padding: 20px 18px;
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
}

.rpp-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.rpp-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.rpp-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 8px;
  border-radius: var(--r-icon);
  transition: background .12s ease;
  cursor: default;
}

.rpp-row:hover { background: var(--c-stripe); }

.rpp-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--r-icon);
  flex-shrink: 0;
}

.rpp-icon--scan    { background: #dcfce7; color: #16a34a; }
.rpp-icon--cash    { background: #dbeafe; color: #2563eb; }
.rpp-icon--alipay  { background: #e8f4fd; color: #1677ff; }
.rpp-icon--wechat  { background: #e6f9ef; color: #059669; }
.rpp-icon--deposit { background: #fff7ed; color: #ea580c; }

.rpp-name {
  flex: 1;
  font-size: var(--fs-base);
  color: var(--c-text-secondary);
  font-weight: 500;
}

.rpp-amount {
  font-size: var(--fs-base);
  font-weight: 600;
  color: var(--c-text);
  font-variant-numeric: tabular-nums;
}

/* ============================================================
   门店营收
   ============================================================ */
.rev-store-body {
  display: flex;
  flex-direction: column;
  gap: var(--gap);
}

/* ---- 筛选栏 ---- */
.store-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--c-white);
  border-radius: var(--r);
  padding: 14px 22px;
  box-shadow: var(--shadow-card);
}

.store-bar-info {
  display: flex;
  align-items: center;
  gap: 24px;
}

.sbi-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--c-stripe);
  border-radius: var(--r-xs);
  padding: 6px 14px;
}

.sbi-label { font-size: var(--fs-sm); color: var(--c-text-secondary); line-height: 1.3; }
.sbi-value { font-size: var(--fs-base); color: var(--c-text); font-weight: 600; line-height: 1.3; }

.sbi-total {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sbi-amount {
  font-size: var(--fs-xl);
  font-weight: 700;
  color: var(--c-blue-600);
  line-height: 1.3;
}

.store-bar-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.store-bar-controls :deep(.el-date-editor) { width: 240px; }
.store-bar-controls :deep(.el-input__wrapper) {
  min-height: 34px;
  border-radius: var(--r-xs);
  box-shadow: 0 0 0 1px var(--c-border) inset;
  padding: 0 10px;
}

.btn-refresh {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 14px;
  border: 1px solid var(--c-border);
  border-radius: var(--r-xs);
  background: var(--c-white);
  color: var(--c-text-secondary);
  font-size: var(--fs-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all .15s ease;
}

.btn-refresh:hover {
  border-color: #93c5fd;
  color: var(--c-blue-600);
  background: #f5f9ff;
}

/* ---- 收款统计 ---- */
.store-stats {
  background: var(--c-white);
  border-radius: var(--r);
  padding: 20px 24px;
  box-shadow: var(--shadow-card);
}

.sts-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.sts-toggle {
  display: flex;
  background: #eef1f5;
  border-radius: var(--r-xs);
  padding: 3px;
}

.stg-btn {
  border: 0;
  border-radius: 6px;
  padding: 6px 16px;
  font-size: var(--fs-sm);
  font-weight: 500;
  color: var(--c-text-muted);
  background: transparent;
  cursor: pointer;
  transition: all .15s ease;
  line-height: 1.3;
}

.stg-btn.active {
  background: var(--c-white);
  color: var(--c-blue-600);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0,0,0,.06);
}

/* 按收银员 */
.clerk-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.clerk-card {
  background: var(--c-card-muted);
  border-radius: var(--r-sm);
  padding: 16px 18px;
  border: 1px solid var(--c-divider);
  transition: border-color .15s ease, box-shadow .15s ease;
}

.clerk-card:hover {
  border-color: #bfdbfe;
  box-shadow: 0 2px 10px rgba(30,64,175,.05);
}

.clerk-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--c-divider);
}

.clerk-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  flex-shrink: 0;
  position: relative;
}

.clerk-avatar::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%232563eb"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7"/></svg>') center/14px no-repeat;
}

.clerk-name { font-size: var(--fs-base); font-weight: 600; color: var(--c-text); margin: 0; line-height: 1.3; }
.clerk-sub  { font-size: var(--fs-sm);  color: var(--c-text-muted); margin: 2px 0 0; line-height: 1.3; }

.clerk-pays {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.clerk-pay {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.clerk-pay-label { font-size: var(--fs-sm); color: var(--c-text-muted); line-height: 1.3; }
.clerk-pay-val   { font-size: var(--fs-base); color: var(--c-text); font-weight: 600; line-height: 1.3; font-variant-numeric: tabular-nums; }

/* 按支付方式 */
.pay-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--gap);
}

.pay-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--c-card-muted);
  border-radius: var(--r-sm);
  padding: 14px 20px;
  border: 1px solid transparent;
  transition: border-color .15s ease, box-shadow .15s ease;
  overflow: hidden;
  min-width: 0;
}

.pay-card:hover {
  border-color: #bfdbfe;
  box-shadow: 0 2px 12px rgba(30,64,175,.06);
}

.pay-icon {
  width: 34px;
  height: 34px;
  border-radius: var(--r-icon);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pay-icon--scan    { background: #dcfce7; color: #16a34a; }
.pay-icon--现金,
.pay-icon--cash    { background: #dbeafe; color: #2563eb; }
.pay-icon--线下支付宝,
.pay-icon--alipay  { background: #e8f4fd; color: #1677ff; }
.pay-icon--线下微信,
.pay-icon--wechat  { background: #e6f9ef; color: #059669; }
.pay-icon--预存款,
.pay-icon--deposit { background: #fff7ed; color: #ea580c; }

.pay-icon :deep(svg) { width: 20px; height: 20px; }

.pay-name {
  font-size: var(--fs-base);
  color: var(--c-text-secondary);
  font-weight: 500;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.pay-amount {
  margin-left: auto;
  font-size: var(--fs-xl);
  font-weight: 700;
  color: var(--c-text);
  font-variant-numeric: tabular-nums;
  line-height: 1.3;
  white-space: nowrap;
  flex-shrink: 0;
}
</style>
