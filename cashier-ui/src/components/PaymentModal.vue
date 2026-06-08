<template>
  <transition name="pm-fade">
    <div
      v-if="visible"
      class="pm-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="付款结算"
      @click.self="$emit('close')"
    >
      <section class="pm-dialog">
        <!-- 头部 -->
        <header class="pm-header">
          <h2>{{ title }}</h2>
          <div class="pm-header-actions">
            <button type="button" class="pm-close-btn" @click="$emit('close')">×</button>
          </div>
        </header>

        <!-- 主体：左右两栏 -->
        <div class="pm-body">
          <!-- 左栏：订单明细表格 + 汇总 -->
          <div class="pm-left">
            <table class="pm-table">
              <thead>
                <tr>
                  <th>商品名称</th>
                  <th>数量</th>
                  <th>小计</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in items" :key="idx">
                  <td class="pm-td-name">{{ item.name }}</td>
                  <td class="pm-td-qty">x{{ item.quantity }}</td>
                  <td class="pm-td-price">
                    <span class="pm-price-now">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
                    <span v-if="item.originalPrice && item.originalPrice !== item.price * item.quantity" class="pm-price-old">¥{{ item.originalPrice.toFixed(2) }}</span>
                  </td>
                </tr>
              </tbody>
            </table>

            <div class="pm-summary">
              <div class="pm-sum-row">
                <span>原价总价</span>
                <strong>¥{{ totalAmount.toFixed(2) }}</strong>
              </div>
              <div v-if="discountAmount > 0" class="pm-sum-row pm-row-red">
                <span>促销折扣</span>
                <strong>-¥{{ discountAmount.toFixed(2) }}</strong>
              </div>
              <div v-if="coupon" class="pm-sum-row pm-row-red">
                <span>优惠券</span>
                <strong>-¥{{ couponDiscount.toFixed(2) }}</strong>
              </div>
              <div class="pm-divider"></div>
              <div class="pm-sum-total">
                <span>应付</span>
                <strong>¥{{ payableAmount.toFixed(2) }}</strong>
              </div>
            </div>
          </div>

          <!-- 右栏：会员资产抵扣 + 补差支付 -->
          <div class="pm-right">
            <div v-if="showAssetPlan" class="pm-asset-plan">
              <div class="pm-section-title">
                <span>会员资产抵扣</span>
                <em>系统按商户优先级自动处理</em>
              </div>
              <div class="pm-asset-grid">
                <div class="pm-asset-chip">
                  <span>预存款</span>
                  <strong>{{ prepaidDeduction > 0 ? '-' : '' }}¥{{ prepaidDeduction.toFixed(2) }}</strong>
                </div>
                <div class="pm-asset-chip">
                  <span>游戏币</span>
                  <strong>{{ coinDeduction > 0 ? '-' : '' }}{{ coinDeduction.toFixed(2) }}</strong>
                </div>
              </div>
              <p class="pm-asset-note">{{ assetPlanNote }}</p>
            </div>

            <div v-if="!gameCoinOnly" class="pm-pay-header">
              <span>{{ externalAmount > 0 ? '补差支付方式' : '无需补差支付' }}</span>
              <a href="javascript:void(0)" class="pm-note-link">订/询备注</a>
            </div>

            <div v-if="!gameCoinOnly && externalAmount > 0" class="pm-method-list">
              <button
                v-for="m in payMethods"
                :key="m.id"
                type="button"
                class="pm-method-btn"
                :class="{ active: selectedMethod === m.id }"
                @click="selectedMethod = m.id"
              >
                <span class="pm-method-icon" v-html="m.icon"></span>
                <span class="pm-method-copy">
                  <strong>{{ m.name }}</strong>
                  <em v-if="m.note">{{ m.note }}</em>
                </span>
              </button>
            </div>
            <div v-else-if="gameCoinOnly && gameCoinInsufficient" class="pm-no-external pm-no-external--warn">
              <strong>游戏币余额不足</strong>
              <span>当前仅支持游戏币支付，游戏币不足，不可外部补差。请联系会员充值或选择其他方式。</span>
            </div>
            <div v-else-if="!gameCoinOnly" class="pm-no-external">
              <strong>本单已由会员资产覆盖</strong>
              <span>确认后仅扣减预存款/游戏币，不产生现金或第三方支付流水。</span>
            </div>

            <button
              type="button"
              class="pm-checkout-btn"
              :disabled="confirmDisabled"
              @click="handleConfirm"
            >
              {{ checkoutButtonText }}
            </button>
          </div>
        </div>
      </section>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  items: { type: Array, default: () => [] },
  member: { type: Object, default: null },
  totalAmount: { type: Number, default: 0 },
  coupon: { type: Object, default: null },
  discountAmount: { type: Number, default: 0 },
  payableAmount: { type: Number, default: 0 },
  allowedMethodIds: { type: Array, default: () => [] },
  defaultMethodId: { type: String, default: '' },
  assetDeduction: { type: Object, default: null },
  // §3 仅游戏币模式：只能使用游戏币，不足时不可外部补差
  gameCoinOnly: { type: Boolean, default: false },
  title: { type: String, default: '付款结算' }
})

const emit = defineEmits(['close', 'confirm'])

const couponDiscount = computed(() => {
  if (!props.coupon) return 0
  return props.totalAmount - props.discountAmount - props.payableAmount
})

const selectedMethod = ref('cash')
const processing = ref(false)

const prepaidDeduction = computed(() => Number(props.assetDeduction?.prepaid ?? 0))
const coinDeduction = computed(() => Number(props.assetDeduction?.coins ?? 0))
const externalAmount = computed(() => Math.max(0, Number(props.assetDeduction?.external ?? props.payableAmount)))
const showAssetPlan = computed(() => prepaidDeduction.value > 0 || coinDeduction.value > 0)
const assetPlanNote = computed(() => {
  if (externalAmount.value > 0) {
    return `资产已抵扣 ¥${(prepaidDeduction.value + coinDeduction.value).toFixed(2)}，剩余 ¥${externalAmount.value.toFixed(2)} 需要补差。`
  }
  return '预存款优先，游戏币自动补足；收银员无需手动选择游戏币。'
})
const gameCoinInsufficient = computed(() => props.gameCoinOnly && coinDeduction.value < props.payableAmount)

const confirmDisabled = computed(() => {
  if (processing.value) return true
  if (props.gameCoinOnly && gameCoinInsufficient.value) return true
  if (externalAmount.value > 0 && !selectedMethod.value) return true
  return false
})

// §6 按钮文案规范
const checkoutButtonText = computed(() => {
  if (processing.value) return '处理中...'
  if (props.gameCoinOnly && gameCoinInsufficient.value) return '游戏币不足'
  if (props.gameCoinOnly) return '确认兑换'
  if (externalAmount.value > 0) return `确认并支付 ¥${externalAmount.value.toFixed(2)}`
  return '确认扣款'
})

const ALL_PAY_METHODS = [
  {
    id: 'member_balance',
    name: '会员资产',
    note: '预存款优先，游戏币自动补足',
    icon: '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="3" stroke="#F97316" stroke-width="1.5"/><path d="M7 10h10M7 14h6" stroke="#F97316" stroke-width="1.8" stroke-linecap="round"/><circle cx="17" cy="14" r="1.5" fill="#F97316"/></svg>'
  },
  {
    id: 'cash',
    name: '现金',
    note: '进入现金账，周期结算/应收抵扣',
    icon: '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="3" stroke="#2563EB" stroke-width="1.5"/><text x="12" y="16" text-anchor="middle" font-size="11" font-weight="700" fill="#2563EB">¥</text></svg>'
  },
  {
    id: 'offline_pay',
    name: '支付宝',
    note: '可进入拉卡拉支付/分账链路',
    icon: '<svg viewBox="0 0 24 24" fill="none"><rect x="2" y="5" width="20" height="14" rx="3" stroke="#64748B" stroke-width="1.5"/><path d="M7 11h10M7 15h6" stroke="#64748B" stroke-width="1.8" stroke-linecap="round"/></svg>'
  },
  {
    id: 'offline_wechat',
    name: '微信',
    note: '可进入拉卡拉支付/分账链路',
    icon: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#07C160" stroke-width="1.5"/><path d="M8.5 9c-.8 0-1.5.55-1.5 1.25 0 .42.23.78.58 1l-.17.62.68-.32c.21.07.44.11.67.11h.14c-.04-.14-.05-.29-.05-.43 0-.77.76-1.4 1.72-1.4.11 0 .22 0 .33.02C10.36 9.41 9.49 9 8.5 9zm-.56.85a.28.28 0 110-.56.28.28 0 010 .56zm1.4 0a.28.28 0 110-.56.28.28 0 010 .56zM15 11.35c-1.04 0-1.88.66-1.88 1.48s.84 1.47 1.88 1.47c.21 0 .41-.03.6-.09l.64.27-.15-.53c.38-.26.59-.63.59-1.02 0-.82-.84-1.48-1.88-1.48zm-.62.98a.27.27 0 110-.54.27.27 0 010 .54zm1.24 0a.27.27 0 110-.54.27.27 0 010 .54z" fill="#07C160"/></svg>'
  }
]

const payMethods = computed(() => {
  if (!props.allowedMethodIds.length) return ALL_PAY_METHODS.filter(method => method.id !== 'member_balance')
  return props.allowedMethodIds
    .map(id => ALL_PAY_METHODS.find(method => method.id === id))
    .filter(Boolean)
})

const resetSelectedMethod = () => {
  const preferred = props.defaultMethodId && payMethods.value.some(method => method.id === props.defaultMethodId)
    ? props.defaultMethodId
    : payMethods.value[0]?.id || ''
  selectedMethod.value = preferred
}

watch(() => props.visible, (val) => {
  if (val) {
    processing.value = false
    resetSelectedMethod()
  }
})

watch(payMethods, () => {
  if (props.visible) {
    resetSelectedMethod()
  }
})

const handleConfirm = () => {
  if (confirmDisabled.value) return
  const m = payMethods.value.find(p => p.id === selectedMethod.value)

  // §10 结构化 payment_lines
  const paymentLines = []
  if (prepaidDeduction.value > 0) {
    paymentLines.push({ type: 'prepaid', amount: prepaidDeduction.value })
  }
  if (coinDeduction.value > 0) {
    paymentLines.push({ type: 'game_coin', amount: coinDeduction.value, exchange_rate: '1:1' })
  }
  if (externalAmount.value > 0) {
    const externalType = selectedMethod.value === 'cash' ? 'cash'
      : selectedMethod.value === 'offline_pay' ? 'alipay'
      : selectedMethod.value === 'offline_wechat' ? 'wechat'
      : 'external'
    paymentLines.push({ type: externalType, amount: externalAmount.value })
  }

  emit('confirm', {
    paymentMethod: externalAmount.value > 0 ? selectedMethod.value : 'member_asset',
    paymentMethodName: externalAmount.value > 0 ? (m?.name || '') : '会员资产自动抵扣',
    amount: externalAmount.value,
    assetDeduction: {
      prepaid: prepaidDeduction.value,
      coins: coinDeduction.value,
      external: externalAmount.value
    },
    paymentLines,
    gameCoinOnly: props.gameCoinOnly
  })
}
</script>

<style scoped>
/* ===== 遮罩 ===== */
.pm-overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--pos-overlay-backdrop);
}

/* ===== 弹窗 ===== */
.pm-dialog {
  width: min(100%, 840px);
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  background: #D9EBFC;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.24);
}

/* ---- 头部 ---- */
.pm-header {
  flex-shrink: 0;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px 0 22px;
  background: #edf3fa;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
}

.pm-header h2 {
  margin: 0;
  color: #1d2433;
  font-size: 16px;
  font-weight: 700;
}

.pm-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pm-close-btn {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #4f5d73;
  cursor: pointer;
  font-size: 22px;
  line-height: 1;
  transition: all 0.15s ease;
}

.pm-close-btn:hover {
  background: rgba(255, 255, 255, 0.55);
  color: #2f7eff;
}

/* ---- 主体左右两栏 ---- */
.pm-body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  gap: 16px;
  padding: 16px;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

.pm-body::-webkit-scrollbar {
  width: 6px;
}

.pm-body::-webkit-scrollbar-track {
  background: transparent;
}

.pm-body::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.pm-body::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.35);
}

/* ===== 左栏 ===== */
.pm-left {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

/* --- 表格 --- */
.pm-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.pm-table thead th {
  padding: 12px 20px 10px;
  text-align: left;
  font-weight: 600;
  color: #64748b;
  font-size: 13px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  background: transparent;
}

.pm-table thead th:nth-child(2),
.pm-table thead th:nth-child(3) {
  text-align: right;
}

.pm-table tbody td {
  padding: 14px 20px;
  vertical-align: middle;
  border-bottom: 1px solid rgba(15, 23, 42, 0.05);
  color: #1d2433;
  font-weight: 500;
}

.pm-table tbody tr:last-child td {
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
}

.pm-td-name {
  font-weight: 600;
  color: #1d2433;
}

.pm-td-qty {
  text-align: right;
  color: #64748b;
  font-variant-numeric: tabular-nums;
}

.pm-td-price {
  text-align: right;
}

.pm-price-now {
  color: #ef4444;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.pm-price-old {
  display: block;
  font-size: 11px;
  color: #94a3b8;
  text-decoration: line-through;
  font-variant-numeric: tabular-nums;
  margin-top: 2px;
}

/* --- 金额汇总 --- */
.pm-summary {
  margin-top: auto;
  padding: 16px 20px 20px;
}

.pm-sum-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  line-height: 2;
}

.pm-sum-row span {
  color: #6b7280;
  font-weight: 500;
}

.pm-sum-row strong {
  color: #1d2433;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.pm-row-red strong {
  color: #ef4444;
}

.pm-divider {
  height: 1px;
  background: rgba(15, 23, 42, 0.08);
  margin: 8px 0 12px;
}

.pm-sum-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pm-sum-total span {
  color: #1d2433;
  font-size: 14px;
  font-weight: 800;
}

.pm-sum-total strong {
  color: #F97316 !important;
  font-size: 22px !important;
  font-weight: 900 !important;
}

/* ===== 右栏 ===== */
.pm-right {
  flex: 0 0 300px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 4px 4px 0 0;
  background: transparent;
}

.pm-asset-plan {
  padding: 14px;
  border: 1px solid #fed7aa;
  border-radius: 12px;
  background: linear-gradient(180deg, #fff7ed 0%, #fff 100%);
}

.pm-section-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.pm-section-title span {
  color: #1d2433;
  font-size: 14px;
  font-weight: 800;
}

.pm-section-title em {
  color: #9a5a28;
  font-size: 11px;
  font-style: normal;
  font-weight: 700;
}

.pm-asset-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.pm-asset-chip {
  min-width: 0;
  padding: 10px;
  border-radius: 10px;
  background: #fff;
  box-shadow: inset 0 0 0 1px rgba(251, 146, 60, 0.18);
}

.pm-asset-chip span,
.pm-asset-chip strong {
  display: block;
}

.pm-asset-chip span {
  color: #9a5a28;
  font-size: 11px;
  font-weight: 700;
}

.pm-asset-chip strong {
  margin-top: 3px;
  color: #ea580c;
  font-size: 15px;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
}

.pm-asset-note {
  margin: 10px 0 0;
  color: #7c4a22;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.45;
}

.pm-pay-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pm-pay-header > span:first-child {
  font-size: 14px;
  font-weight: 700;
  color: #1d2433;
}

.pm-note-link {
  font-size: 12px;
  color: #3791ff;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.15s ease;
}

.pm-note-link:hover {
  color: #2563eb;
  text-decoration: underline;
}

/* --- 支付方式按钮组 --- */
.pm-method-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pm-method-btn {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-height: 58px;
  padding: 10px 14px;
  border: 1.5px solid rgba(15, 23, 42, 0.08);
  border-radius: 10px;
  background: #fff;
  color: #4f5d73;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  transition: border-color 0.15s ease, color 0.15s ease;
}

.pm-method-btn:hover {
  border-color: #7cb8e6;
  color: #3791ff;
}

.pm-method-btn.active {
  border-color: #3791ff;
  color: #3791ff;
  background: #f0f7ff;
}

.pm-method-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
  text-align: left;
}

.pm-method-copy strong {
  color: inherit;
  font-size: 14px;
  font-weight: 800;
}

.pm-method-copy em {
  color: #64748b;
  font-size: 11px;
  font-style: normal;
  font-weight: 600;
  line-height: 1.25;
}

.pm-method-icon {
  width: 24px;
  height: 24px;
  margin-top: 2px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pm-method-icon :deep(svg) {
  width: 24px;
  height: 24px;
}

.pm-no-external {
  padding: 14px;
  border-radius: 12px;
  background: #effbf4;
  border: 1px solid #b7ebc6;
}

.pm-no-external--warn {
  background: #fef3c7;
  border-color: #fcd34d;
}

.pm-no-external--warn strong {
  color: #92400e !important;
}

.pm-no-external--warn span {
  color: #a16207 !important;
}

.pm-no-external strong,
.pm-no-external span {
  display: block;
}

.pm-no-external strong {
  color: #166534;
  font-size: 13px;
  font-weight: 900;
}

.pm-no-external span {
  margin-top: 5px;
  color: #3f6d4b;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
}

/* --- 结账按钮 --- */
.pm-checkout-btn {
  margin-top: auto;
  width: 100%;
  height: 48px;
  border: 0;
  border-radius: 4px;
  background: #F97316;
  color: #fff;
  cursor: pointer;
  font-size: 16px;
  font-weight: 800;
  font-family: inherit;
  letter-spacing: 0.3px;
  transition: background-color 0.15s ease, opacity 0.15s ease;
}

.pm-checkout-btn:hover:not(:disabled) {
  background: #ea580c;
}

.pm-checkout-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* ===== 过渡动画 ===== */
.pm-fade-enter-active,
.pm-fade-leave-active {
  transition: opacity 0.2s ease;
}

.pm-fade-enter-from,
.pm-fade-leave-to {
  opacity: 0;
}
</style>
