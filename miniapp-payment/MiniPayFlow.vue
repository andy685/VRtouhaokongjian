<template>
  <div class="mp-shell" :class="`mp-state--${state}`">
    <!-- ═══════════════════════════════════════════════════════════════
         状态0: 加载中
    -->
    <template v-if="state === 'loading'">
      <div class="mp-page-loading">
        <div class="mp-loading-ring">
          <svg viewBox="0 0 48 48" width="64" height="64">
            <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(124,58,237,0.15)" stroke-width="3"/>
            <circle cx="24" cy="24" r="20" fill="none" stroke="url(#mp-grad-load)" stroke-width="3" stroke-linecap="round" stroke-dasharray="94 32" class="mp-spin"/>
            <defs><linearGradient id="mp-grad-load" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#7C3AED"/><stop offset="100%" stop-color="#A855F7"/></linearGradient></defs>
          </svg>
        </div>
        <p class="mp-loading-text">正在加载订单…</p>
      </div>
    </template>

    <!-- ═══════════════════════════════════════════════════════════════
         状态2: 订单确认页
    -->
    <template v-if="state === 'confirm'">
      <div class="mp-page-confirm">
        <header class="mp-nav-bar">
          <button class="mp-nav-back" aria-label="返回" @click="$emit('back')">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <h1>付款结算</h1>
          <div class="mp-nav-icons">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
        </header>

        <!-- 会员卡片 -->
        <section class="mp-member-card" :class="{ 'mp-member-card--warn': shortage > 0 }">
          <div class="mp-member-header">
            <div class="mp-avatar">
              <img :src="member.avatar" alt="" />
            </div>
            <div class="mp-member-info">
              <span class="mp-member-name">{{ member.name }}</span>
              <div class="mp-member-meta">
                <span class="mp-member-level">{{ member.level }}</span>
                <span class="mp-member-discount">享{{ member.discount }}折优惠</span>
              </div>
            </div>
          </div>
          <div v-if="shortage > 0" class="mp-balance-warn">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span>预存款+游戏币不足，需微信补差</span>
          </div>
          <div class="mp-stats-grid">
            <div class="mp-stat-item mp-stat--balance">
              <span class="mp-stat-value">¥{{ member.balance }}</span>
              <span class="mp-stat-label">预存款</span>
            </div>
            <div class="mp-stat-item mp-stat--coins">
              <span class="mp-stat-value">{{ member.coins }}</span>
              <span class="mp-stat-label">游戏币</span>
            </div>
            <div class="mp-stat-item mp-stat--ticket">
              <span class="mp-stat-value">{{ member.tickets }}张</span>
              <span class="mp-stat-label">套票</span>
            </div>
            <div class="mp-stat-item mp-stat--times">
              <span class="mp-stat-value">{{ member.times }}次</span>
              <span class="mp-stat-label">预存次数</span>
            </div>
          </div>
        </section>

        <!-- 消费项目 -->
        <section class="mp-section">
          <h3 class="mp-section-title">订单内容</h3>
          <div v-if="product" class="mp-product-item mp-product-item--confirmed">
            <div class="mp-prod-icon" :style="{ background: product.color }">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="product.iconSvg" />
            </div>
            <div class="mp-prod-info">
              <span class="mp-prod-name">{{ product.name }}</span>
              <span class="mp-prod-desc">时长 {{ product.duration }}分钟 · {{ product.tag }}</span>
            </div>
            <span class="mp-prod-price">¥{{ originalPrice.toFixed(2) }}</span>
          </div>
        </section>

        <!-- 费用明细 -->
        <section class="mp-section">
          <h3 class="mp-section-title">支付明细</h3>
          <dl class="mp-fee-list">
            <div class="mp-fee-row">
              <dt>原价</dt>
              <dd>¥{{ originalPrice.toFixed(2) }}</dd>
            </div>
            <div class="mp-fee-row" v-if="couponDiscountAmount > 0">
              <dt>优惠券</dt>
              <dd class="discount">-¥{{ couponDiscountAmount.toFixed(2) }}</dd>
            </div>
            <div class="mp-fee-row" v-if="member.discount < 10">
              <dt>会员折扣({{ member.discount }}折)</dt>
              <dd class="discount">-¥{{ memberDiscountSaved.toFixed(2) }}</dd>
            </div>
            <div class="mp-fee-row">
              <dt>{{ payableLabel }}</dt>
              <dd>¥{{ priceAfterDiscount.toFixed(2) }}</dd>
            </div>
            <div class="mp-divider-dash"></div>
            <div class="mp-fee-row" v-if="prepaidDeduction > 0">
              <dt>预存款抵扣</dt>
              <dd class="deduction">-¥{{ prepaidDeduction.toFixed(2) }}</dd>
            </div>
            <div class="mp-fee-sub" v-if="prepaidDeduction > 0">
              <span>· 可用预存款 ¥{{ member.balance }}</span>
              <span>-¥{{ prepaidDeduction.toFixed(2) }}</span>
            </div>
            <div class="mp-fee-row" v-if="coinDeduction > 0">
              <dt>游戏币抵扣</dt>
              <dd class="deduction">-¥{{ coinValue.toFixed(2) }}</dd>
            </div>
            <div class="mp-fee-sub" v-if="coinDeduction > 0">
              <span>· 消耗 {{ coinDeduction }} 游戏币 ( 1元=1币 )</span>
              <span>-¥{{ coinValue.toFixed(2) }}</span>
            </div>
            <div class="mp-divider-solid"></div>
            <div class="mp-fee-row mp-fee-row--total" :class="{ 'mp-fee-row--warn': shortage > 0 }">
              <dt>应付</dt>
              <dd>¥{{ remainingPay.toFixed(2) }}</dd>
            </div>
          </dl>
        </section>

        <!-- 底部按钮 -->
        <div class="mp-actions-bottom">
          <button class="mp-btn-pay" :class="{ 'mp-btn-pay--warn': shortage > 0 }" :disabled="confirming" @click="handleConfirm">
            <template v-if="shortage > 0 && !confirming">微信补差 ¥{{ shortage.toFixed(2) }}</template>
            <template v-else-if="!confirming">确认并支付 ¥{{ remainingPay.toFixed(2) }}</template>
            <template v-else><span class="mp-btn-spinner"></span> 处理中...</template>
          </button>
        </div>
      </div>
    </template>

    <!-- ═══════════════════════════════════════════════════════════════
         状态3: 支付处理中
    -->
    <template v-if="state === 'processing'">
      <div class="mp-page-processing">
        <header class="mp-nav-bar">
          <button class="mp-nav-back" aria-label="返回">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <h1>支付中</h1>
          <div class="mp-nav-spacer"></div>
        </header>

        <div class="mp-processing-body">
          <div class="mp-loading-ring mp-loading-ring--lg">
            <svg viewBox="0 0 48 48" width="80" height="80">
              <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(124,58,237,0.15)" stroke-width="3"/>
              <circle cx="24" cy="24" r="20" fill="none" stroke="url(#mp-grad-p)" stroke-width="3" stroke-linecap="round" stroke-dasharray="94 32" class="mp-spin"/>
              <defs><linearGradient id="mp-grad-p" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#7C3AED"/><stop offset="100%" stop-color="#A855F7"/></linearGradient></defs>
            </svg>
          </div>
          <h2 class="mp-processing-title">正在付款...</h2>
          <p class="mp-processing-hint">请勿退出，支付成功后将自动返回体验凭证</p>
          <div class="mp-processing-amount">
            <span class="mp-amount-symbol">¥</span>
            <span class="mp-amount-num">{{ remainingPay.toFixed(2) }}</span>
          </div>
          <p class="mp-processing-target">{{ product?.name || '' }} · {{ deviceLabel }}</p>
        </div>
      </div>
    </template>

    <!-- ═══════════════════════════════════════════════════════════════
         状态4: 支付成功
    -->
    <template v-if="state === 'success'">
      <div class="mp-page-result mp-page-result--success" :class="'mp-success-mode--' + successMode">
        <header class="mp-nav-bar">
          <button class="mp-nav-back" aria-label="返回">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <h1>支付结果</h1>
          <div class="mp-nav-spacer"></div>
        </header>

        <div class="mp-result-body">
          <!-- 顶部图标 + 标题 -->
          <div class="mp-result-icon mp-result-icon--ok">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2 class="mp-result-title">{{ successTitle }}</h2>
          <p class="mp-result-subtitle">请前往 {{ deviceLabel }} 开始体验</p>

          <!-- 一级标题：支付方式 -->
          <section class="mp-success-section">
            <h3 class="mp-success-h3">支付方式</h3>
            <div class="mp-success-tags">
              <span v-if="prepaidDeduction > 0" class="mp-success-tag mp-success-tag--prepaid">预存款 ¥{{ prepaidDeduction.toFixed(2) }}</span>
              <span v-if="coinDeduction > 0" class="mp-success-tag mp-success-tag--coin">{{ coinDeduction }} 游戏币</span>
              <span v-if="remainingPay > 0" class="mp-success-tag mp-success-tag--wechat">微信支付 ¥{{ remainingPay.toFixed(2) }}</span>
            </div>
          </section>

          <!-- 一级标题：订单详情 -->
          <section class="mp-success-section">
            <h3 class="mp-success-h3">订单详情</h3>
            <div class="mp-receipt">
              <dl class="mp-receipt-list">
                <div class="mp-receipt-row"><dt>游戏</dt><dd>{{ product?.name || '-' }}</dd></div>
                <div class="mp-receipt-row"><dt>时长</dt><dd>{{ product ? product.duration + '分钟' : '-' }}</dd></div>
                <div class="mp-receipt-row"><dt>订单号</dt><dd>{{ orderNo }}</dd></div>
              </dl>
            </div>
          </section>

          <p class="mp-result-tip" v-if="product">{{ deviceLabel }} 已准备就绪，请前往开始体验</p>

          <button class="mp-btn-pay mp-btn-pay--outline" @click="$emit('done')">完成</button>
        </div>
      </div>
    </template>

    <!-- ═══════════════════════════════════════════════════════════════
         状态5: 支付失败
    -->
    <template v-if="state === 'failed'">
      <div class="mp-page-result mp-page-result--fail">
        <header class="mp-nav-bar">
          <button class="mp-nav-back" aria-label="返回">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <h1>支付结果</h1>
          <div class="mp-nav-spacer"></div>
        </header>

        <div class="mp-result-body">
          <div class="mp-result-icon mp-result-icon--err">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </div>
          <h2 class="mp-result-title">{{ failTitle }}</h2>

          <!-- 错误详情卡片 -->
          <div class="mp-error-card">
            <p class="mp-error-title">{{ failTitle === '订单已失效' ? '订单已超时或已被使用' : '支付未完成，请重新发起' }}</p>
            <ul class="mp-error-list">
              <li>请返回设备端重新展示最新付款码</li>
              <li>确认网络正常后再次发起支付</li>
              <li>如已扣款，请稍后在订单中心查看结果</li>
            </ul>
          </div>

          <div class="mp-action-stack">
            <button class="mp-btn-pay" @click="handleRetry">
              <template v-if="!retrying">重新发起</template>
              <template v-else><span class="mp-btn-spinner"></span> 重试中…</template>
            </button>
            <button class="mp-btn-pay mp-btn-pay--ghost" @click="$emit('done')">返回首页</button>
          </div>
        </div>
      </div>
    </template>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  state: {
    type: String,
    default: 'loading' // loading | confirm | processing | success | failed
  },
  /* 会员数据 */
  member: {
    type: Object,
    default: () => ({
      name: '张小明',
      avatar: '',
      level: '黄金会员',
      discount: 9,
      balance: 256,
      coins: 100,
      points: 1280,
      tickets: 2,
      times: 5
    })
  },
  /* 订单商品（名称、时长、标签、图标色和svg） */
  product: {
    type: Object,
    default: () => ({
      name: '过山车VR',
      duration: 10,
      tag: '防眩晕体验',
      color: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
      iconSvg: '<polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/><line x1="12" y1="22" x2="12" y2="15.5"/><polyline points="22 8.5 12 15.5 2 8.5"/>'
    })
  },
  /* 折前原价 */
  unitPrice: { type: Number, default: 38 },
  /* 优惠券抵扣金额 */
  couponDiscountAmount: { type: Number, default: 0 },
  /* 失败标题 */
  failTitle: { type: String, default: '支付失败' },
  orderNo: { type: String, default: 'VR202606070001' },
  deviceLabel: { type: String, default: '03号设备' },
  storeName: { type: String, default: '幻影星空馆 NO.8088' },
  qrStatusHint: { type: String, default: '设备端已创建待支付订单' }
})

const emit = defineEmits(['confirm', 'cancel', 'retry', 'done', 'back', 'manualInput'])

/* ---- 内部状态 ---- */
const confirming = ref(false)
const retrying = ref(false)

/* ---- 计算属性 ---- */
const originalPrice = computed(() => props.unitPrice)

const discountRate = computed(() => props.member.discount / 10) // 0.9 = 9折

// ═══ 抵扣链: 优惠券(减面值) → 会员折扣 → 预存款 → 游戏币 → 外部补差 ═══

// ① 优惠券后价格
const amountAfterCoupon = computed(() => {
  return Math.max(0, Math.round((originalPrice.value - props.couponDiscountAmount) * 100) / 100)
})

// ② 会员折后应付价
const priceAfterDiscount = computed(() => {
  return Math.round((amountAfterCoupon.value * discountRate.value) * 100) / 100
})

// ②b 应付标签：有折扣显示"折后应付"，无折扣显示"应付"
const payableLabel = computed(() => {
  return props.member.discount < 10 ? '折后应付' : '应付'
})

// ③ 会员折扣节省额
const memberDiscountSaved = computed(() => {
  return Math.round((amountAfterCoupon.value - priceAfterDiscount.value) * 100) / 100
})

// ④ 预存款抵扣（最多用到折后应付）
const prepaidDeduction = computed(() => {
  return Math.min(props.member.balance, priceAfterDiscount.value)
})

// ⑤ 预存款抵扣后剩余
const afterPrepaid = computed(() => {
  return Math.max(0, Math.round((priceAfterDiscount.value - prepaidDeduction.value) * 100) / 100)
})

// ⑥ 游戏币抵扣量（1元 = 1币）
const coinsNeeded = computed(() => Math.ceil(afterPrepaid.value))
const coinDeduction = computed(() => {
  return Math.min(props.member.coins, coinsNeeded.value)
})

// ⑦ 游戏币抵扣金额（1元=1币）
const coinValue = computed(() => coinDeduction.value)

// ⑧ 外部应付
const remainingPay = computed(() => {
  return Math.max(0, Math.round((afterPrepaid.value - coinValue.value) * 100) / 100)
})

// ⑨ 缺口（= 应付，用于 insufficient 判断）
const shortage = computed(() => remainingPay.value)

// 成功页：支付方式模式
const successMode = computed(() => {
  const hasPrepaid = prepaidDeduction.value > 0
  const hasCoin = coinDeduction.value > 0
  const hasWechat = remainingPay.value > 0
  if (hasPrepaid && !hasCoin && !hasWechat) return 'prepaid'
  if (!hasPrepaid && hasCoin && !hasWechat) return 'coin'
  if (hasWechat) return 'wechat'
  return 'prepaid'
})

// 成功页：标题文案
const successTitle = computed(() => {
  if (successMode.value === 'prepaid') return '支付成功'
  if (successMode.value === 'coin') return '支付成功'
  if (successMode.value === 'wechat') return '支付成功'
  return '支付成功'
})

/* ---- 方法 ---- */
async function handleConfirm() {
  confirming.value = true
  const scenario = shortage.value > 0 ? 'insufficient' : 'normal'
  emit('confirm', { scenario, prepaidDeduction: prepaidDeduction.value, coinDeduction: coinDeduction.value, remainingPay: remainingPay.value })
  setTimeout(() => { confirming.value = false }, 2000)
}


async function handleRetry() {
  retrying.value = true
  emit('retry')
  setTimeout(() => { retrying.value = false }, 2000)
}
</script>

<style scoped>
/* ===================================================================
   DESIGN TOKENS — 基于 Figma 截图的深色紫调主题
   Primary:   #7C3AED → #A855F7 (violet gradient)
   Surface:   #0B0E17 (deep dark)
   Card BG:   rgba(255,255,255,0.05) frosted glass
   Text:      #E2E8F0 / #94A3B8 / #64748B
   Green:     #10B981 (success)
   Red:       #EF4444 (error/warn)
   Orange:    #F59E0B (warning)
   =================================================================== */

.mp-shell {
  --mp-primary: #7C3AED;
  --mp-primary-light: #A855F7;
  --mp-bg: #0B0E17;
  --mp-bg-elevated: #111827;
  --mp-card: rgba(255,255,255,0.04);
  --mp-card-border: rgba(255,255,255,0.08);
  --mp-text: #E2E8F0;
  --mp-text-secondary: #94A3B8;
  --mp-text-muted: #64748B;
  --mp-green: #10B981;
  --mp-red: #EF4444;
  --mp-orange: #F59E0B;
  --mp-nav-top: 0px; /* 由小程序注入状态栏高度 */

  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--mp-bg);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: var(--mp-text);
  position: relative;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  -webkit-user-select: none;
}

/* 加载/处理态：禁止页面拖动（成功/失败页允许滚动） */
.mp-state--loading,
.mp-state--processing,
.mp-state--failed {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
}

/* Subtle radial glow behind content */
.mp-shell::after {
  content: '';
  position: fixed;
  top: -120px;
  left: 50%;
  transform: translateX(-50%);
  width: 320px;
  height: 320px;
  background: radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

/* ===== NAV BAR ===== */
.mp-nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  padding-top: calc(12px + var(--mp-nav-top));
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(11,14,23,0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.mp-nav-bar h1 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.mp-nav-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 10px;
  background: rgba(255,255,255,0.06);
  color: var(--mp-text-secondary);
  cursor: pointer;
  transition: background 150ms ease;
  touch-action: manipulation;
}
@media (hover: hover) { .mp-nav-back:hover { background: rgba(255,255,255,0.1); } }
.mp-nav-back:active { background: rgba(255,255,255,0.14); }

.mp-nav-spacer { width: 36px; }

.mp-nav-icons {
  display: flex;
  gap: 10px;
  align-items: center;
  color: var(--mp-text-secondary);
}

/* ===== MEMBER CARD ===== */
.mp-member-card {
  margin: 12px 16px 0;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  background: linear-gradient(145deg, #7C3AED 0%, #5B21B6 40%, #4C1D95 100%);
  box-shadow:
    0 8px 32px rgba(124,58,237,0.25),
    inset 0 1px 0 rgba(255,255,255,0.12);
}

.mp-member-card--warn {
  background: linear-gradient(145deg, #5B21B6 0%, #4C1D95 60%, #3730A3 100%);
  box-shadow:
    0 8px 32px rgba(124,58,237,0.2),
    inset 0 1px 0 rgba(255,255,255,0.08);
}

.mp-member-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 18px 14px;
}

.mp-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #A78BFA, #C4B5FD);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 2px solid rgba(255,255,255,0.2);
}
.mp-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
/* Default avatar placeholder */
.mp-avatar:empty::after {
  content: '';
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255,255,255,0.4);
}

.mp-member-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mp-member-name {
  font-size: 17px;
  font-weight: 800;
  color: #fff;
  letter-spacing: 0.02em;
}

.mp-member-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mp-member-level {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 6px;
  background: rgba(255,255,255,0.18);
  color: #FDE68A;
  font-size: 11px;
  font-weight: 700;
  backdrop-filter: blur(4px);
}

.mp-member-discount {
  font-size: 11px;
  color: rgba(255,255,255,0.65);
  font-weight: 500;
}

.mp-coin-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 18px 4px;
  color: rgba(255,255,255,0.5);
  font-size: 12px;
  font-weight: 600;
}
.mp-coin-row svg {
  color: #FBBF24;
  flex-shrink: 0;
}

/* ===== STATS GRID (4 cols) ===== */
.mp-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  padding: 0 10px 16px;
}

.mp-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 4px 8px;
  border-radius: 10px;
  background: rgba(255,255,255,0.09);
  margin: 0 3px;
  backdrop-filter: blur(4px);
}

.mp-stat-value {
  font-size: 14px;
  font-weight: 800;
  color: #fff;
  font-variant-numeric: tabular-nums;
}

.mp-stat-label {
  font-size: 10px;
  font-weight: 600;
  color: rgba(255,255,255,0.55);
  letter-spacing: 0.03em;
}

.mp-stat--balance .mp-stat-value { color: #FDE68A; }
.mp-stat--coins .mp-stat-value { color: #A78BFA; }
.mp-stat--ticket .mp-stat-value { color: #34D399; }
.mp-stat--times .mp-stat-value { color: #FBBF24; }

/* ===== SECTIONS ===== */
.mp-section {
  margin: 24px 16px 0;
  padding-left: 14px;
  border-left: 3px solid rgba(124,58,237,0.45);
}

.mp-section-title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 800;
  color: #c4b5fd;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.mp-entry-banner,
.mp-order-card {
  background: var(--mp-card);
  border: 1px solid var(--mp-card-border);
  border-radius: 14px;
}

.mp-entry-banner {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
}

.mp-entry-banner strong {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
}

.mp-entry-banner span {
  font-size: 12px;
  color: var(--mp-text-secondary);
}

.mp-order-card {
  padding: 6px 14px;
}

.mp-order-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.mp-order-row:last-child {
  border-bottom: none;
}

.mp-order-row dt,
.mp-order-row dd {
  margin: 0;
}

.mp-order-row dt {
  font-size: 12px;
  color: var(--mp-text-muted);
}

.mp-order-row dd {
  font-size: 13px;
  font-weight: 600;
  color: var(--mp-text);
  text-align: right;
}

/* ===== PRODUCT ITEM ===== */
.mp-product-list { display: flex; flex-direction: column; gap: 8px; }

.mp-product-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 14px;
  border-radius: 14px;
  background: var(--mp-card);
  border: 1.5px solid transparent;
  cursor: pointer;
  transition: all 180ms ease;
  touch-action: manipulation;
}
@media (hover: hover) { .mp-product-item:hover { background: rgba(255,255,255,0.07); } }
.mp-product-item:active { background: rgba(255,255,255,0.07); }
.mp-product-item.active {
  border-color: var(--mp-primary);
  background: rgba(124,58,237,0.08);
  box-shadow: 0 0 0 1px rgba(124,58,237,0.2);
}

.mp-product-item--confirmed {
  cursor: default;
  border-color: var(--mp-card-border);
}

.mp-prod-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.mp-prod-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.mp-prod-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--mp-text);
}

.mp-prod-desc {
  font-size: 11px;
  font-weight: 500;
  color: var(--mp-text-muted);
}

.mp-prod-price {
  font-size: 16px;
  font-weight: 800;
  color: var(--mp-text);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.mp-prod-check {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid var(--mp-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 180ms ease;
  color: transparent;
}
.mp-prod-check.on {
  background: var(--mp-primary);
  border-color: var(--mp-primary);
  color: #fff;
}

/* ===== ADJUST GRID (select page test controls) ===== */
.mp-adjust-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mp-adjust-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.mp-adjust-item label {
  font-size: 13px;
  font-weight: 600;
  color: var(--mp-text-secondary);
  white-space: nowrap;
}

.mp-stepper {
  display: flex;
  align-items: center;
  gap: 0;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--mp-card-border);
  background: rgba(255,255,255,0.04);
}
.mp-stepper button {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255,255,255,0.06);
  color: var(--mp-text);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: background 120ms ease;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: manipulation;
}
@media (hover: hover) { .mp-stepper button:hover { background: rgba(255,255,255,0.12); } }
.mp-stepper button:active { background: rgba(255,255,255,0.12); }
.mp-stepper span {
  padding: 0 12px;
  font-size: 13px;
  font-weight: 700;
  color: var(--mp-text);
  min-width: 52px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.mp-select {
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid var(--mp-card-border);
  background: rgba(255,255,255,0.04);
  color: var(--mp-text);
  font-size: 13px;
  font-weight: 600;
  outline: none;
  cursor: pointer;
  font-family: inherit;
}
.mp-select option { background: #1e293b; }

/* ===== FEE LIST ===== */
.mp-fees-preview {
  margin-top: 16px;
}

.mp-fee-list { display: flex; flex-direction: column; }

.mp-fee-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 0;
  font-size: 14px;
}
.mp-fee-row dt {
  color: var(--mp-text-secondary);
  font-weight: 500;
  font-size: 13px;
}
.mp-fee-row dd {
  color: var(--mp-text);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  font-size: 14px;
}

.mp-fee-row .discount { color: var(--mp-green); }
.mp-fee-row .deduction { color: var(--mp-orange); }

.mp-fee-row--total {
  padding-top: 12px;
  border-top: none;
  margin-top: 4px;
}
.mp-fee-row--total dt {
  font-size: 14px;
  font-weight: 700;
  color: var(--mp-text);
}
.mp-fee-row--total dd {
  font-size: 22px !important;
  font-weight: 900 !important;
  color: #A78BFA !important;
}

.mp-fee-row--warn dd {
  color: var(--mp-red) !important;
}

.mp-fee-sub {
  display: flex;
  justify-content: space-between;
  padding: 3px 0 3px 12px;
  font-size: 11px;
  color: var(--mp-text-muted);
}
.mp-fee-sub span:last-child {
  color: var(--mp-orange);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.mp-divider-dash {
  border: none;
  border-top: 1px dashed rgba(255,255,255,0.1);
  margin: 2px 0;
}

.mp-divider-solid {
  border: none;
  border-top: 1px solid rgba(255,255,255,0.08);
  margin: 8px 0 4px;
}

/* ===== ACTIONS BOTTOM ===== */
.mp-actions-bottom {
  position: sticky;
  bottom: 0;
  padding: 14px 16px;
  padding-bottom: calc(14px + env(safe-area-inset-bottom));
  background: linear-gradient(to top, var(--mp-bg) 60%, transparent);
  z-index: 10;
}

/* ===== PAGE SCROLL CONTAINERS ===== */
.mp-page-confirm {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.mp-btn-pay {
  width: 100%;
  padding: 15px 0;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--mp-primary) 0%, var(--mp-primary-light) 100%);
  color: #fff;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: 0.03em;
  cursor: pointer;
  box-shadow:
    0 4px 20px rgba(124,58,237,0.35),
    inset 0 1px 0 rgba(255,255,255,0.18);
  transition: transform 120ms ease, box-shadow 180ms ease, opacity 150ms ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.mp-btn-pay:active:not(:disabled) { transform: scale(0.97); }
@media (hover: hover) {
  .mp-btn-pay:hover:not(:disabled) {
    box-shadow: 0 6px 26px rgba(124,58,237,0.45), inset 0 1px 0 rgba(255,255,255,0.22);
  }
}
.mp-btn-pay:disabled { opacity: 0.45; cursor: not-allowed; }

.mp-btn-pay--outline {
  background: transparent;
  border: 1.5px solid var(--mp-primary);
  color: var(--mp-primary-light);
  box-shadow: none;
}
@media (hover: hover) { .mp-btn-pay--outline:hover { background: rgba(124,58,237,0.08); } }
.mp-btn-pay--outline:active { background: rgba(124,58,237,0.08); }

.mp-btn-pay--warn {
  background: linear-gradient(135deg, #DC2626 0%, #EF4444 100%);
  box-shadow:
    0 4px 20px rgba(220,38,38,0.3),
    inset 0 1px 0 rgba(255,255,255,0.15);
}
@media (hover: hover) {
  .mp-btn-pay--warn:hover:not(:disabled) {
    box-shadow: 0 6px 26px rgba(220,38,38,0.4), inset 0 1px 0 rgba(255,255,255,0.2);
  }
}

.mp-btn-pay--ghost {
  background: rgba(255,255,255,0.05);
  color: var(--mp-text-secondary);
  box-shadow: none;
  border: 1px solid var(--mp-card-border);
}
@media (hover: hover) { .mp-btn-pay--ghost:hover { background: rgba(255,255,255,0.08); } }
.mp-btn-pay--ghost:active { background: rgba(255,255,255,0.08); }

.mp-btn-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: mp-spin 0.7s linear infinite;
}

@keyframes mp-spin {
  to { transform: rotate(360deg); }
}

/* ===== LOADING PAGE ===== */
.mp-page-loading,
.mp-page-processing {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.mp-page-result {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

.mp-page-loading {
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 24px;
  touch-action: none;
  pointer-events: auto;
}

.mp-loading-ring {
  position: relative;
}
.mp-loading-ring--lg { margin-bottom: 8px; }

.mp-loading-text {
  margin: 0;
  color: var(--mp-text-muted);
  font-size: 14px;
  font-weight: 500;
}

.mp-spin {
  animation: mp-spin 1s linear infinite;
  transform-origin: 24px 24px;
}

/* ===== PROCESSING PAGE ===== */
.mp-processing-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 40px 24px;
}

.mp-processing-title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: var(--mp-text);
}

.mp-processing-hint {
  margin: 0;
  color: var(--mp-text-muted);
  font-size: 13px;
}

.mp-processing-amount {
  display: flex;
  align-items: baseline;
  gap: 2px;
  margin-top: 4px;
}
.mp-amount-symbol {
  font-size: 24px;
  font-weight: 700;
  color: #A78BFA;
}
.mp-amount-num {
  font-size: 44px;
  font-weight: 900;
  color: #A78BFA;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

.mp-processing-target {
  margin: 0;
  color: var(--mp-text-muted);
  font-size: 13px;
}

/* ===== RESULT PAGES ===== */
.mp-result-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 20px 40px;
  gap: 12px;
}

.mp-result-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  animation: mp-pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.mp-result-icon--ok {
  background: linear-gradient(135deg, #059669 0%, #10B981 100%);
  color: #fff;
  box-shadow: 0 6px 24px rgba(16,185,129,0.3), inset 0 1px 0 rgba(255,255,255,0.2);
}

.mp-result-icon--err {
  background: linear-gradient(135deg, #DC2626 0%, #EF4444 100%);
  color: #fff;
  box-shadow: 0 6px 24px rgba(239,68,68,0.3), inset 0 1px 0 rgba(255,255,255,0.2);
}

@keyframes mp-pop-in {
  0% { transform: scale(0.3); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.mp-result-title {
  margin: 0;
  font-size: 22px;
  font-weight: 900;
  color: var(--mp-text);
}

.mp-result-subtitle {
  margin: 0;
  color: var(--mp-text-muted);
  font-size: 14px;
}

/* Receipt card in success */
.mp-receipt {
  width: 100%;
  padding: 18px 16px;
  border-radius: 14px;
  background: var(--mp-card);
  border: 1px solid var(--mp-card-border);
}

.mp-receipt-list {
  display: flex;
  flex-direction: column;
}

.mp-receipt-row {
  display: flex;
  justify-content: space-between;
  padding: 7px 0;
  font-size: 13px;
}
.mp-receipt-row dt { color: var(--mp-text-muted); font-weight: 500; }
.mp-receipt-row dd {
  color: var(--mp-text);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.mp-receipt-row dd.green { color: var(--mp-green); }
.mp-receipt-row dd.bold { font-weight: 800; }

/* Payment method tags */
/* Success section headings (一级标题) */
.mp-success-section {
  width: 100%;
  max-width: 340px;
  margin-top: 28px;
  padding-left: 14px;
  border-left: 3px solid rgba(124,58,237,0.45);
}

.mp-success-h3 {
  font-size: 14px;
  font-weight: 800;
  color: #c4b5fd;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 12px;
  padding: 0;
  border: none;
}

.mp-success-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 0;
}

.mp-success-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.mp-success-tag--prepaid {
  background: rgba(124,58,237,0.12);
  color: #A78BFA;
  border: 1px solid rgba(124,58,237,0.2);
}

.mp-success-tag--coin {
  background: rgba(245,158,11,0.12);
  color: #FBBF24;
  border: 1px solid rgba(245,158,11,0.2);
}

.mp-success-tag--wechat {
  background: rgba(7,193,96,0.12);
  color: #34D399;
  border: 1px solid rgba(7,193,96,0.2);
}

/* Success page color modes */
.mp-success-mode--prepaid .mp-result-icon--ok {
  background: linear-gradient(135deg, #7C3AED 0%, #A855F7 100%);
  box-shadow: 0 6px 24px rgba(124,58,237,0.3), inset 0 1px 0 rgba(255,255,255,0.2);
}

.mp-success-mode--coin .mp-result-icon--ok {
  background: linear-gradient(135deg, #D97706 0%, #F59E0B 100%);
  box-shadow: 0 6px 24px rgba(245,158,11,0.3), inset 0 1px 0 rgba(255,255,255,0.2);
}

.mp-success-mode--wechat .mp-result-icon--ok {
  background: linear-gradient(135deg, #059669 0%, #10B981 100%);
  box-shadow: 0 6px 24px rgba(16,185,129,0.3), inset 0 1px 0 rgba(255,255,255,0.2);
}

.mp-result-tip {
  margin: 12px 0 0;
  padding: 10px 18px;
  border-radius: 10px;
  background: rgba(124,58,237,0.1);
  border: 1px solid rgba(124,58,237,0.15);
  color: #C4B5FD;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
}

/* Error card in failed */
.mp-error-card {
  width: 100%;
  max-width: 340px;
  padding: 16px 18px;
  border-radius: 14px;
  background: rgba(239,68,68,0.06);
  border: 1px solid rgba(239,68,68,0.15);
  text-align: left;
}

.mp-error-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 700;
  color: var(--mp-text);
}

.mp-error-list {
  margin: 0;
  padding-left: 18px;
  color: var(--mp-text-muted);
  font-size: 12px;
  line-height: 1.8;
}
.mp-error-list li { color: var(--mp-text-muted); }

.mp-action-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 340px;
  margin-top: 8px;
}

/* ===== BALANCE WARN BANNER (insufficient) ===== */
.mp-balance-warn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: rgba(245,158,11,0.1);
  color: #FCD34D;
  font-size: 12px;
  font-weight: 600;
}

</style>
