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
          <h2>付款结算</h2>
          <button type="button" class="pm-close-btn" @click="$emit('close')">×</button>
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

          <!-- 右栏：支付方式 + 结账 -->
          <div class="pm-right">
            <div class="pm-pay-header">
              <span>支付方式</span>
              <a href="javascript:void(0)" class="pm-note-link">订/询备注</a>
            </div>

            <div class="pm-method-list">
              <button
                v-for="m in payMethods"
                :key="m.id"
                type="button"
                class="pm-method-btn"
                :class="{ active: selectedMethod === m.id }"
                @click="selectedMethod = m.id"
              >
                <span class="pm-method-icon" v-html="m.icon"></span>
                <span>{{ m.name }}</span>
              </button>
            </div>

            <button
              type="button"
              class="pm-checkout-btn"
              :disabled="!selectedMethod || processing"
              @click="handleConfirm"
            >
              {{ processing ? '处理中...' : `结账 +¥${payableAmount.toFixed(2)}` }}
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
  payableAmount: { type: Number, default: 0 }
})

const emit = defineEmits(['close', 'confirm'])

const couponDiscount = computed(() => {
  if (!props.coupon) return 0
  return props.totalAmount - props.discountAmount - props.payableAmount
})

const selectedMethod = ref('cash')
const processing = ref(false)

const payMethods = [
  {
    id: 'cash',
    name: '现金',
    icon: '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="3" stroke="#2563EB" stroke-width="1.5"/><text x="12" y="16" text-anchor="middle" font-size="11" font-weight="700" fill="#2563EB">¥</text></svg>'
  },
  {
    id: 'offline_pay',
    name: '线下支付室',
    icon: '<svg viewBox="0 0 24 24" fill="none"><rect x="2" y="5" width="20" height="14" rx="3" stroke="#64748B" stroke-width="1.5"/><path d="M7 11h10M7 15h6" stroke="#64748B" stroke-width="1.8" stroke-linecap="round"/></svg>'
  },
  {
    id: 'offline_wechat',
    name: '线下微信',
    icon: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#07C160" stroke-width="1.5"/><path d="M8.5 9c-.8 0-1.5.55-1.5 1.25 0 .42.23.78.58 1l-.17.62.68-.32c.21.07.44.11.67.11h.14c-.04-.14-.05-.29-.05-.43 0-.77.76-1.4 1.72-1.4.11 0 .22 0 .33.02C10.36 9.41 9.49 9 8.5 9zm-.56.85a.28.28 0 110-.56.28.28 0 010 .56zm1.4 0a.28.28 0 110-.56.28.28 0 010 .56zM15 11.35c-1.04 0-1.88.66-1.88 1.48s.84 1.47 1.88 1.47c.21 0 .41-.03.6-.09l.64.27-.15-.53c.38-.26.59-.63.59-1.02 0-.82-.84-1.48-1.88-1.48zm-.62.98a.27.27 0 110-.54.27.27 0 010 .54zm1.24 0a.27.27 0 110-.54.27.27 0 010 .54z" fill="#07C160"/></svg>'
  }
]

watch(() => props.visible, (val) => {
  if (val) {
    selectedMethod.value = 'cash'
    processing.value = false
  }
})

const handleConfirm = () => {
  if (!selectedMethod.value || processing.value) return
  const m = payMethods.find(p => p.id === selectedMethod.value)
  emit('confirm', {
    paymentMethod: selectedMethod.value,
    paymentMethodName: m?.name || '',
    amount: props.payableAmount
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
  width: min(100%, 700px);
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e2e8f0;
}

/* ---- 头部 ---- */
.pm-header {
  flex-shrink: 0;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px 0 24px;
  border-bottom: 1px solid #e2e8f0;
}

.pm-header h2 {
  margin: 0;
  color: #1e293b;
  font-size: 16px;
  font-weight: 700;
}

.pm-close-btn {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  font-size: 22px;
  line-height: 1;
  transition: color 0.15s ease;
}

.pm-close-btn:hover {
  color: #1e293b;
}

/* ---- 主体左右两栏 ---- */
.pm-body {
  flex: 1;
  overflow-y: auto;
  display: flex;
}

/* ===== 左栏 ===== */
.pm-left {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e2e8f0;
  background: #f8fafc;
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
  font-size: 12px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.pm-table thead th:nth-child(2),
.pm-table thead th:nth-child(3) {
  text-align: right;
}

.pm-table tbody td {
  padding: 14px 20px;
  vertical-align: middle;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
  font-weight: 500;
}

.pm-table tbody tr:last-child td {
  border-bottom: 1px solid #e2e8f0;
}

.pm-td-name {
  font-weight: 600;
  color: #1e293b;
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
  color: #475569;
  font-weight: 500;
}

.pm-sum-row strong {
  color: #1e293b;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.pm-row-red strong {
  color: #ef4444;
}

.pm-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 8px 0 12px;
}

.pm-sum-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pm-sum-total span {
  color: #1e293b;
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
  flex: 0 0 260px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 20px 20px 24px;
  background: #fff;
}

.pm-pay-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pm-pay-header > span:first-child {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

.pm-note-link {
  font-size: 12px;
  color: #2563EB;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.15s ease;
}

.pm-note-link:hover {
  color: #1d4ed8;
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
  align-items: center;
  gap: 10px;
  height: 48px;
  padding: 0 16px;
  border: 1.5px solid #e2e8f0;
  border-radius: 4px;
  background: #fff;
  color: #475569;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  transition: border-color 0.15s ease, color 0.15s ease;
}

.pm-method-btn:hover {
  border-color: #93c5fd;
  color: #2563EB;
}

.pm-method-btn.active {
  border-color: #2563EB;
  color: #2563EB;
  background: #eff6ff;
}

.pm-method-icon {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pm-method-icon :deep(svg) {
  width: 24px;
  height: 24px;
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
