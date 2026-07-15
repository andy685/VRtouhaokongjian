<template>
  <!-- 结算弹窗 -->
  <transition name="pm-fade">
    <div
      v-if="visible && !showScanner"
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
            <!-- 调试：强制支付失败 -->
            <button
              type="button"
              class="pm-debug-btn"
              :title="debugHint"
              @click="cycleDebugMode"
            >
              <span class="pm-debug-dot" :class="{ 'pm-debug-dot--on': debugFailMode > 0 }"></span>
              调试
            </button>
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

            <!-- 支付失败提示 -->
            <div v-if="paymentStatus === 'error' && paymentError" class="pm-error-banner">
              <div class="pm-error-icon">✕</div>
              <div class="pm-error-body">
                <strong>{{ paymentError.title }}</strong>
                <span>{{ paymentError.message }}</span>
              </div>
              <div class="pm-error-actions">
                <button type="button" class="pm-error-retry" @click="retryPayment">重试</button>
                <button type="button" class="pm-error-close-text" @click="clearPaymentError">关闭</button>
              </div>
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
              :class="{ 'pm-checkout-btn--processing': paymentStatus === 'processing' }"
              :disabled="confirmDisabled"
              @click="handleConfirm"
            >
              <span v-if="paymentStatus === 'processing'" class="pm-btn-spinner"></span>
              {{ checkoutButtonText }}
            </button>
          </div>
        </div>

        <!-- 支付处理中遮罩 -->
        <transition name="pm-fade">
          <div v-if="showProcessingOverlay" class="pm-processing-overlay">
            <div class="pm-processing-card">
              <span class="pm-processing-spinner"></span>
              <p>正在处理支付，请稍候...</p>
            </div>
          </div>
        </transition>
      </section>
    </div>
  </transition>

  <!-- 扫码支付弹窗 -->
  <transition name="sc-fade">
    <div
      v-if="visible && showScanner"
      class="sc-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="扫码支付"
    >
      <section class="sc-dialog">
        <!-- 头部 -->
        <header class="sc-header">
          <button
            type="button"
            class="sc-back-btn"
            @click="closeScanner"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            <span>返回</span>
          </button>
          <div class="sc-header-center">
            <span class="sc-pay-tag" :class="selectedMethod === 'offline_wechat' ? 'sc-tag-wechat' : 'sc-tag-alipay'">
              {{ selectedMethod === 'offline_wechat' ? '微信支付' : '支付宝' }}
            </span>
            <strong class="sc-amount">¥{{ externalAmount.toFixed(2) }}</strong>
          </div>
          <button type="button" class="sc-close-btn" @click="closeScanner">×</button>
        </header>

        <!-- 扫码区域 -->
        <div class="sc-body">
          <div class="sc-scan-frame" :class="{ 'sc-scanning': scannerState === 'scanning', 'sc-verifying': scannerState === 'verifying', 'sc-success': scannerState === 'success', 'sc-error': scannerState === 'error' }">
            <!-- 四角 -->
            <span class="sc-corner sc-corner--tl"></span>
            <span class="sc-corner sc-corner--tr"></span>
            <span class="sc-corner sc-corner--bl"></span>
            <span class="sc-corner sc-corner--br"></span>

            <!-- 扫描激光线 -->
            <div class="sc-laser"></div>

            <!-- 扫码状态 -->
            <div v-if="scannerState === 'scanning'" class="sc-status sc-status--scan">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="sc-scan-icon">
                <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2"/>
                <line x1="12" y1="8" x2="12" y2="16" class="sc-crosshair" />
                <line x1="8" y1="12" x2="16" y2="12" class="sc-crosshair" />
              </svg>
              <p class="sc-hint-title">请扫描玩家付款码</p>
              <p class="sc-hint-desc">将扫码枪对准玩家{{ selectedMethod === 'offline_wechat' ? '微信' : '支付宝' }}付款码</p>
            </div>

            <div v-else-if="scannerState === 'verifying'" class="sc-status sc-status--check">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" class="sc-spinner">
                <circle cx="12" cy="12" r="10" stroke="rgba(251, 191, 36, 0.3)" stroke-width="2" />
                <path d="M12 2a10 10 0 019.95 9" stroke="#FBBF24" stroke-width="2" stroke-linecap="round" />
              </svg>
              <p class="sc-hint-title">验证付款码中...</p>
              <p class="sc-hint-desc">正在校验付款码有效性</p>
            </div>

            <div v-else-if="scannerState === 'success'" class="sc-status sc-status--ok">
              <svg viewBox="0 0 24 24" width="56" height="56" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#10B981" stroke-width="2" />
                <path d="M8 12l3 3 5-5" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <p class="sc-hint-title">扫码成功</p>
              <p class="sc-hint-desc">正在处理支付...</p>
            </div>

            <div v-else-if="scannerState === 'error'" class="sc-status sc-status--err">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#EF4444" stroke-width="2" />
                <path d="M15 9l-6 6M9 9l6 6" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <p class="sc-hint-title">扫码失败</p>
              <p class="sc-hint-desc">{{ scannerError || '请重试' }}</p>
            </div>
          </div>

          <!-- 手动输入区域 -->
          <div class="sc-manual">
            <button
              v-if="!showManualInput"
              type="button"
              class="sc-manual-toggle"
              @click="toggleManualInput"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              <span>手动输入付款码</span>
            </button>

            <div v-else class="sc-manual-form">
              <div class="sc-manual-field">
                <input
                  ref="manualInputRef"
                  v-model="manualCode"
                  type="text"
                  class="sc-manual-input"
                  :class="{ 'sc-manual-input--error': manualError }"
                  :placeholder="manualError || '请输入18位付款码'"
                  maxlength="20"
                  @input="manualError = ''"
                  @keyup.enter="submitManualCode"
                />
                <button
                  type="button"
                  class="sc-manual-submit"
                  :disabled="manualCode.length < 15"
                  @click="submitManualCode"
                >确认</button>
              </div>
              <p v-if="manualError" class="sc-manual-error">{{ manualError }}</p>
              <p v-else class="sc-manual-hint">支持支付宝/微信 15~20 位数字付款码</p>
              <button type="button" class="sc-manual-cancel" @click="toggleManualInput">取消手动输入</button>
            </div>
          </div>

          <!-- 隐藏的扫码枪输入 -->
          <input
            ref="scanInputRef"
            v-model="scannerBuffer"
            class="sr-only"
            autofocus
            @keyup.enter.prevent="onScannerEnter"
            @input="onScannerInput"
          />
        </div>
      </section>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

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
const paymentStatus = ref('idle') // idle | processing | error
const paymentError = ref(null) // { title, message }
let paymentTimer = null
let lastPaymentPayload = null // 失败后重试用

// 调试模式：0=正常 1=网络超时 2=余额不足 3=支付被拒 4=系统繁忙
const debugFailMode = ref(0)
const debugHint = computed(() => {
  if (debugFailMode.value === 0) return '调试模式：正常（点此切换）'
  const names = ['', '网络超时', '余额不足', '支付被拒', '系统繁忙']
  return `调试模式：下次支付必定「${names[debugFailMode.value]}」`
})
const cycleDebugMode = () => {
  debugFailMode.value = (debugFailMode.value + 1) % 5
}

// ===== 扫码支付状态 =====
const showScanner = ref(false)
const scannerState = ref('scanning') // scanning | verifying | success | error
const scannerBuffer = ref('')
const scannerError = ref('')
const showManualInput = ref(false)
const manualCode = ref('')
const manualError = ref('')
const scanInputRef = ref(null)
const manualInputRef = ref(null)
let scannerTimer = null
let scanInputTimer = null

const needsScanner = computed(() => {
  return externalAmount.value > 0 && (selectedMethod.value === 'offline_pay' || selectedMethod.value === 'offline_wechat')
})

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
  if (paymentStatus.value === 'processing') return true
  if (props.gameCoinOnly && gameCoinInsufficient.value) return true
  if (externalAmount.value > 0 && !selectedMethod.value) return true
  return false
})

// 处理中遮罩（非扫码场景才显示）
const showProcessingOverlay = computed(() => {
  return paymentStatus.value === 'processing' && !showScanner.value
})

// §6 按钮文案规范
const checkoutButtonText = computed(() => {
  if (paymentStatus.value === 'processing') return '支付处理中...'
  if (props.gameCoinOnly && gameCoinInsufficient.value) return '游戏币不足'
  if (props.gameCoinOnly) return '确认兑换'
  if (needsScanner.value) {
    const methodName = selectedMethod.value === 'offline_pay' ? '支付宝' : '微信'
    return `扫码支付（${methodName}）¥${externalAmount.value.toFixed(2)}`
  }
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
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 41.0009765625 37.1885986328125" fill="none"><path d="M26.4962 18.4452C31.6293 18.4452 35.7358 14.3463 35.7358 9.22261C35.7358 4.09894 31.6293 0 26.4962 0C21.3631 0 17 3.84276 17 8.96643C17 14.3463 21.3631 18.4452 26.4962 18.4452ZM23.673 9.73498C23.1597 9.73498 22.6464 9.4788 22.6464 8.96643C22.6464 8.45406 23.1597 8.19788 23.673 8.19788L25.2129 8.19788L23.673 6.66078C23.1597 6.14841 23.1597 5.63604 23.673 5.37986C24.1863 5.12367 24.443 5.12367 24.9563 5.37986L26.4962 6.91696L28.0361 5.37986C28.5495 4.86749 29.0628 4.86749 29.3194 5.37986C29.5761 5.89223 29.5761 6.14841 29.3194 6.66078L27.7795 8.19788L28.8061 8.19788C29.3194 8.19788 29.8327 8.45406 29.8327 8.96643C29.8327 9.4788 29.3194 9.73498 28.8061 9.73498L27.2662 9.73498L27.2662 10.5035L29.0628 10.5035C29.5761 10.5035 30.0894 10.7597 30.0894 11.2721C30.0894 11.7845 29.5761 12.0406 29.0628 12.0406L27.5228 12.0406L27.5228 13.0654C27.5228 13.5777 27.2662 14.0901 26.7529 14.0901C26.2396 14.0901 25.9829 13.5777 25.9829 13.0654L25.9829 12.2968L23.673 12.2968C23.1597 12.2968 22.6464 12.0406 22.6464 11.5283C22.6464 11.0159 23.1597 10.7597 23.673 10.7597L25.7263 10.7597L25.7263 9.73498L23.673 9.73498Z" fill="#8CC2F5"/><path d="M40.8081 23.4046C40.2948 22.3799 39.5248 21.8675 39.0115 21.8675L37.9849 21.8675L32.5951 24.4293C32.5951 26.2226 31.3118 27.7597 29.5153 27.7597L18.9924 27.7597C18.4791 27.7597 18.2225 27.2473 18.2225 26.9912C18.2225 26.4788 18.7358 26.2226 18.9924 26.2226L29.002 26.2226C29.7719 26.2226 30.0286 25.7102 30.2852 24.9417C30.2852 23.4046 29.002 22.1237 27.462 22.1237L21.559 22.1237C21.559 21.8675 21.3023 21.6113 21.3023 21.6113L20.2757 20.5866C18.9924 19.3057 17.4525 18.7933 15.3993 18.7933L8.21294 18.7933L8.21294 17.7686C8.21294 17.2562 7.95629 17 7.44298 17L0.769964 17C0.513309 17 0 17.2562 0 17.7686L0 31.6025C0 31.8587 0.256655 32.1148 0.769964 32.1148L7.69963 32.1148C8.21294 32.1148 8.4696 31.8587 8.4696 31.3463L8.4696 30.0654L21.559 36.9823C23.0989 37.4947 24.8955 36.9823 25.9221 36.2138L39.0115 26.9912L39.2681 26.735C40.8081 25.9664 41.3214 24.6855 40.8081 23.4046Z" fill="#32A2ED"/></svg>'
  },
  {
    id: 'offline_pay',
    name: '支付宝',
    note: '扫码枪扫描玩家支付宝付款码',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none"><path d="M37.4404 13.44C37.4404 13.4714 37.4411 13.5029 37.4426 13.5343C37.4441 13.5657 37.4464 13.5971 37.4494 13.6284C37.4525 13.6597 37.4563 13.6909 37.4609 13.722C37.4654 13.7531 37.4708 13.7841 37.4769 13.815C37.483 13.8458 37.4898 13.8765 37.4974 13.907C37.505 13.9375 37.5134 13.9678 37.5225 13.998C37.5316 14.0281 37.5414 14.0579 37.5519 14.0875C37.5625 14.1172 37.5738 14.1465 37.5858 14.1756C37.5978 14.2046 37.6105 14.2334 37.6239 14.2619C37.6374 14.2903 37.6515 14.3184 37.6663 14.3461C37.6811 14.3739 37.6966 14.4013 37.7127 14.4282C37.7288 14.4552 37.7456 14.4818 37.7631 14.508C37.7806 14.5341 37.7986 14.5599 37.8174 14.5851C37.8361 14.6104 37.8554 14.6352 37.8753 14.6596C37.8952 14.6839 37.9157 14.7077 37.9368 14.731C37.958 14.7543 37.9796 14.7771 38.0019 14.7994C38.0241 14.8216 38.0468 14.8433 38.0701 14.8644C38.0934 14.8856 38.1172 14.9061 38.1415 14.9261C38.1658 14.9461 38.1906 14.9654 38.2158 14.9842C38.2411 15.0029 38.2668 15.021 38.2929 15.0385C38.3191 15.056 38.3456 15.0728 38.3726 15.089C38.3996 15.1052 38.4269 15.1207 38.4546 15.1356C38.4823 15.1504 38.5104 15.1645 38.5389 15.178C38.5673 15.1915 38.596 15.2042 38.6251 15.2162C38.6541 15.2283 38.6834 15.2396 38.713 15.2502C38.7427 15.2608 38.7725 15.2707 38.8026 15.2798C38.8327 15.289 38.863 15.2974 38.8935 15.305C38.924 15.3127 38.9547 15.3196 38.9855 15.3257C39.0164 15.3318 39.0474 15.3372 39.0785 15.3418C39.1096 15.3464 39.1408 15.3503 39.1721 15.3534C39.2034 15.3565 39.2347 15.3588 39.2661 15.3603C39.2976 15.3619 39.329 15.3627 39.3604 15.3627C39.3919 15.3627 39.4233 15.3619 39.4547 15.3603C39.4861 15.3588 39.5175 15.3565 39.5488 15.3534C39.5801 15.3503 39.6113 15.3464 39.6424 15.3418C39.6735 15.3372 39.7045 15.3318 39.7353 15.3257C39.7662 15.3196 39.7969 15.3127 39.8274 15.305C39.8579 15.2974 39.8881 15.289 39.9182 15.2798C39.9483 15.2707 39.9782 15.2608 40.0078 15.2502C40.0374 15.2396 40.0667 15.2283 40.0958 15.2162C40.1248 15.2042 40.1536 15.1915 40.182 15.178C40.2104 15.1645 40.2385 15.1504 40.2662 15.1356C40.294 15.1207 40.3213 15.1052 40.3483 15.089C40.3752 15.0728 40.4018 15.056 40.428 15.0385C40.4541 15.021 40.4798 15.0029 40.505 14.9842C40.5303 14.9654 40.5551 14.9461 40.5794 14.9261C40.6037 14.9061 40.6274 14.8856 40.6508 14.8644C40.674 14.8433 40.6968 14.8216 40.719 14.7994C40.7412 14.7771 40.7629 14.7543 40.784 14.731C40.8051 14.7077 40.8256 14.6839 40.8456 14.6596C40.8655 14.6352 40.8848 14.6104 40.9035 14.5851C40.9222 14.5599 40.9403 14.5341 40.9578 14.508C40.9752 14.4818 40.992 14.4552 41.0082 14.4282C41.0243 14.4013 41.0398 14.3739 41.0546 14.3461C41.0694 14.3184 41.0835 14.2903 41.0969 14.2619C41.1103 14.2334 41.123 14.2046 41.135 14.1756C41.147 14.1465 41.1583 14.1172 41.1689 14.0875C41.1795 14.0579 41.1893 14.0281 41.1984 13.998C41.2075 13.9678 41.2158 13.9375 41.2234 13.907C41.231 13.8765 41.2379 13.8458 41.244 13.815C41.2501 13.7841 41.2554 13.7531 41.26 13.722C41.2646 13.6909 41.2684 13.6597 41.2714 13.6284C41.2745 13.5971 41.2767 13.5657 41.2782 13.5343C41.2797 13.5029 41.2805 13.4714 41.2804 13.44C41.2805 13.4086 41.2797 13.3771 41.2782 13.3457C41.2767 13.3143 41.2745 13.2829 41.2714 13.2516C41.2684 13.2203 41.2646 13.1891 41.26 13.158C41.2554 13.1269 41.2501 13.0959 41.244 13.0651C41.2379 13.0342 41.2311 13.0035 41.2234 12.973C41.2158 12.9425 41.2075 12.9122 41.1984 12.8821C41.1893 12.852 41.1795 12.8221 41.1689 12.7925C41.1583 12.7628 41.147 12.7335 41.135 12.7044C41.123 12.6754 41.1103 12.6466 41.0969 12.6182C41.0835 12.5897 41.0694 12.5616 41.0546 12.5339C41.0398 12.5061 41.0243 12.4788 41.0082 12.4518C40.992 12.4248 40.9752 12.3982 40.9578 12.3721C40.9403 12.3459 40.9222 12.3201 40.9035 12.2949C40.8848 12.2696 40.8655 12.2448 40.8456 12.2205C40.8256 12.1961 40.8051 12.1723 40.784 12.149C40.7629 12.1257 40.7412 12.1029 40.719 12.0806C40.6968 12.0584 40.674 12.0367 40.6508 12.0156C40.6274 11.9944 40.6037 11.9739 40.5794 11.9539C40.5551 11.934 40.5303 11.9146 40.505 11.8958C40.4798 11.8771 40.4541 11.859 40.428 11.8415C40.4018 11.824 40.3752 11.8072 40.3483 11.791C40.3213 11.7748 40.294 11.7593 40.2662 11.7444C40.2385 11.7296 40.2104 11.7155 40.182 11.702C40.1536 11.6886 40.1248 11.6758 40.0958 11.6638C40.0667 11.6517 40.0374 11.6404 40.0078 11.6298C39.9782 11.6192 39.9483 11.6093 39.9182 11.6002C39.8881 11.591 39.8579 11.5826 39.8274 11.575C39.7969 11.5673 39.7662 11.5604 39.7353 11.5543C39.7045 11.5482 39.6735 11.5428 39.6424 11.5382C39.6113 11.5336 39.5801 11.5297 39.5488 11.5266C39.5175 11.5235 39.4861 11.5212 39.4547 11.5197C39.4233 11.5181 39.3919 11.5173 39.3604 11.5173C39.329 11.5173 39.2976 11.5181 39.2661 11.5197C39.2347 11.5212 39.2034 11.5235 39.1721 11.5266C39.1408 11.5297 39.1096 11.5336 39.0785 11.5382C39.0474 11.5428 39.0164 11.5482 38.9855 11.5543C38.9547 11.5604 38.924 11.5673 38.8935 11.575C38.863 11.5826 38.8327 11.591 38.8026 11.6002C38.7725 11.6093 38.7427 11.6192 38.713 11.6298C38.6834 11.6404 38.6541 11.6517 38.6251 11.6638C38.596 11.6758 38.5673 11.6886 38.5389 11.702C38.5104 11.7155 38.4823 11.7296 38.4546 11.7444C38.4269 11.7593 38.3996 11.7748 38.3726 11.791C38.3456 11.8072 38.3191 11.824 38.2929 11.8415C38.2668 11.859 38.2411 11.8771 38.2158 11.8958C38.1906 11.9146 38.1658 11.934 38.1415 11.9539C38.1172 11.9739 38.0934 11.9944 38.0701 12.0156C38.0468 12.0367 38.0241 12.0584 38.0019 12.0806C37.9796 12.1029 37.958 12.1257 37.9369 12.149C37.9158 12.1723 37.8952 12.1961 37.8753 12.2205C37.8554 12.2448 37.8361 12.2696 37.8174 12.2949C37.7986 12.3201 37.7805 12.3459 37.7631 12.3721C37.7456 12.3982 37.7288 12.4248 37.7127 12.4518C37.6966 12.4788 37.6811 12.5061 37.6663 12.5339C37.6515 12.5616 37.6374 12.5897 37.6239 12.6182C37.6105 12.6466 37.5978 12.6754 37.5858 12.7044C37.5738 12.7335 37.5625 12.7628 37.5519 12.7925C37.5414 12.8221 37.5316 12.852 37.5225 12.8821C37.5134 12.9122 37.505 12.9425 37.4974 12.973C37.4898 13.0035 37.483 13.0342 37.4769 13.0651C37.4708 13.0959 37.4654 13.1269 37.4609 13.158C37.4563 13.1891 37.4525 13.2203 37.4494 13.2516C37.4464 13.2829 37.4441 13.3143 37.4426 13.3457C37.4411 13.3771 37.4404 13.4086 37.4404 13.44Z" fill="#DAE9FF"/><path d="M28.8001 29.184C28.8001 29.184 29.8561 27.264 31.008 23.712C31.488 22.272 31.776 21.024 31.9681 20.16L26.5921 20.16C26.5921 20.16 26.4001 21.696 25.6321 23.712C24.8641 25.824 24.2881 27.552 24.2881 27.552C24.2881 27.552 16.2241 24.288 11.9041 24.288C7.68006 24.288 2.30405 26.208 1.92005 31.872C1.53605 37.536 4.32004 40.704 8.64006 41.664C12.8641 42.72 16.6081 41.664 19.8721 39.744C23.2321 37.92 26.4961 33.6 26.4961 33.6L43.776 43.104C43.776 43.104 44.832 41.28 45.696 39.552C46.56 37.728 47.1361 35.808 47.1361 35.808L28.8001 29.184ZM11.4241 38.112C5.28004 38.112 3.93604 34.752 3.93604 32.448C3.93604 30.144 5.28004 27.456 10.5601 27.072C15.8401 26.592 23.0401 31.2 23.0401 31.2C23.0401 31.2 17.7601 38.112 11.4241 38.112Z" fill="#3988FF"/><path d="M31.8722 20.0639C32.1602 18.7199 32.1602 18.0479 32.1602 18.0479L23.0402 17.9519L23.0402 14.3039L34.1762 14.1119L34.1762 11.5199L23.0402 11.5199L23.0402 5.66394L17.6642 5.66394L17.6642 11.5199L7.2002 11.5199L7.2002 14.1119L17.5682 13.9199L17.5682 17.8559L9.31219 17.8559L9.31219 19.9679L26.5922 19.9679C26.4962 20.0639 30.3362 20.0639 31.8722 20.0639Z" fill="#AFCFFF"/></svg>'
  },
  {
    id: 'offline_wechat',
    name: '微信',
    note: '扫码枪扫描玩家微信付款码',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35 31" fill="none"><path d="M13.3433 19.52C11.2479 20.6405 10.9375 18.891 10.9375 18.891L8.31251 13.0137C7.30212 10.2208 9.18657 11.7538 9.18657 11.7538C9.18657 11.7538 10.803 12.9273 12.0308 13.6427C13.2567 14.358 14.6558 13.8526 14.6558 13.8526L31.8186 6.25274C28.6521 2.47136 23.4224 0 17.5 0C7.83449 0 0 6.57791 0 14.6935C0 19.3612 2.59369 23.5151 6.63433 26.2076L5.9067 30.2268C5.9067 30.2268 5.55119 31.4003 6.78171 30.8559C7.62078 30.4841 9.75949 29.1556 11.0324 28.3463C13.0338 29.0153 15.2139 29.3869 17.5 29.3869C27.1646 29.3869 35 22.809 35 14.6935C35 12.3429 34.3397 10.1224 33.17 8.15269C27.7016 11.3088 14.9819 18.6448 13.3433 19.52Z" fill="#00C800"/></svg>'
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
    paymentStatus.value = 'idle'
    paymentError.value = null
    lastPaymentPayload = null
    resetSelectedMethod()
    resetScanner()
  } else {
    cleanupPaymentTimer()
    paymentStatus.value = 'idle'
    paymentError.value = null
    lastPaymentPayload = null
  }
})

watch(payMethods, () => {
  if (props.visible) {
    resetSelectedMethod()
  }
})

// ===== 扫码逻辑 =====
function resetScanner() {
  showScanner.value = false
  scannerState.value = 'scanning'
  scannerBuffer.value = ''
  scannerError.value = ''
  showManualInput.value = false
  manualCode.value = ''
  manualError.value = ''
  clearTimeout(scannerTimer)
  clearTimeout(scanInputTimer)
}

function openScanner() {
  resetScanner()
  showScanner.value = true
  nextTick(() => {
    scanInputRef.value?.focus()
  })
}

function closeScanner() {
  resetScanner()
  showScanner.value = false
}

// 扫码枪通常以极快的速度逐字符输入一组数字/字母并以回车结束
// 使用防抖机制：在用户停止输入后短暂延迟，自动识别整段条形码
function onScannerInput() {
  clearTimeout(scanInputTimer)
  // 扫码枪输入通常在 50ms 内完成；这里等待 80ms 没有新输入就判定为扫描完成
  scanInputTimer = setTimeout(() => {
    const code = scannerBuffer.value.trim()
    if (code.length >= 15) {
      onCodeReceived(code)
    }
  }, 80)
}

function onScannerEnter(e) {
  const code = scannerBuffer.value.trim()
  if (code.length >= 15) {
    onCodeReceived(code)
  }
}

function onCodeReceived(code) {
  scannerBuffer.value = code
  clearTimeout(scanInputTimer)
  manualError.value = ''

  // ===== 第1步：格式校验 =====
  if (code.length < 15) {
    scannerState.value = 'error'
    scannerError.value = `付款码位数不足（当前${code.length}位，至少15位）`
    scannerTimer = setTimeout(() => {
      scannerState.value = 'scanning'
      scannerError.value = ''
      scannerBuffer.value = ''
      nextTick(() => scanInputRef.value?.focus())
    }, 2500)
    return
  }
  if (!/^\d+$/.test(code)) {
    scannerState.value = 'error'
    scannerError.value = '付款码只能包含数字，请重新扫描'
    scannerTimer = setTimeout(() => {
      scannerState.value = 'scanning'
      scannerError.value = ''
      scannerBuffer.value = ''
      nextTick(() => scanInputRef.value?.focus())
    }, 2500)
    return
  }
  if (code.length > 20) {
    scannerState.value = 'error'
    scannerError.value = `付款码位数超长（当前${code.length}位，最多20位）`
    scannerTimer = setTimeout(() => {
      scannerState.value = 'scanning'
      scannerError.value = ''
      scannerBuffer.value = ''
      nextTick(() => scanInputRef.value?.focus())
    }, 2500)
    return
  }

  // ===== 第2步：模拟后端验证付款码有效性 =====
  scannerState.value = 'verifying'
  scannerTimer = setTimeout(() => {
    const isValid = simulateBackendVerification(code)
    if (isValid) {
      scannerState.value = 'success'
      scannerTimer = setTimeout(() => {
        doConfirm(code)
      }, 800)
    } else {
      scannerState.value = 'error'
      scannerError.value = '付款码无效或已过期，请重新扫描'
      manualError.value = '付款码无效或已过期'
      scannerTimer = setTimeout(() => {
        scannerState.value = 'scanning'
        scannerError.value = ''
        manualError.value = ''
        scannerBuffer.value = ''
        nextTick(() => scanInputRef.value?.focus())
      }, 3000)
    }
  }, 1200)
}

/**
 * 模拟后端验证付款码
 * 真实场景中这里会调用后端 API 校验付款码是否有效
 * 这里模拟常见无效付款码的特征：
 * - 连续相同数字（如 111111111111111111）
 * - 简单递增/递减序列（如 123456789012345678）
 * - 明显不合法的前缀
 */
function simulateBackendVerification(code) {
  // 连续相同数字（至少连续8个相同）
  if (/(\d)\1{7,}/.test(code)) {
    return false
  }
  // 连续递增序列（长度 >= 6）
  if (hasSequence(code, 1, 6)) {
    return false
  }
  // 连续递减序列（长度 >= 6）
  if (hasSequence(code, -1, 6)) {
    return false
  }
  return true
}

/** 检测是否存在长度为 minLen 的步进为 step 的连续序列 */
function hasSequence(code, step, minLen) {
  let count = 1
  for (let i = 1; i < code.length; i++) {
    if (Number(code[i]) - Number(code[i - 1]) === step) {
      count++
      if (count >= minLen) return true
    } else {
      count = 1
    }
  }
  return false
}

function toggleManualInput() {
  showManualInput.value = !showManualInput.value
  manualCode.value = ''
  manualError.value = ''
  if (showManualInput.value) {
    nextTick(() => manualInputRef.value?.focus())
  } else {
    nextTick(() => scanInputRef.value?.focus())
  }
}

function submitManualCode() {
  const code = manualCode.value.trim()
  manualError.value = ''
  if (code.length === 0) {
    manualError.value = '请输入付款码'
    return
  }
  if (code.length < 15) {
    manualError.value = `付款码至少需要15位，当前仅${code.length}位`
    return
  }
  if (!/^\d+$/.test(code)) {
    manualError.value = '付款码只能包含数字'
    return
  }
  onCodeReceived(code)
}

// ===== 确认支付 =====
const handleConfirm = () => {
  if (confirmDisabled.value) return

  // 支付宝/微信需要先扫码
  if (needsScanner.value) {
    openScanner()
    return
  }

  // 现金/会员资产进入支付处理
  doConfirm()
}

// ===== 支付失败模拟 =====
const PAYMENT_FAILURES = [
  { title: '网络超时', message: '网络连接超时，请检查网络后重试' },
  { title: '余额不足', message: '支付账户余额不足，请更换支付方式后重试' },
  { title: '支付被拒', message: '银行拒绝该笔交易，请联系发卡行或更换支付方式' },
  { title: '系统繁忙', message: '支付系统繁忙，请稍后重试' },
]

function doConfirm(scannedCode) {
  paymentStatus.value = 'processing'
  paymentError.value = null

  // 扫码成功 → 关闭扫码弹窗，回到主界面显示处理状态
  if (showScanner.value) {
    showScanner.value = false
  }

  // 构建支付数据（失败重试用）
  const m = payMethods.value.find(p => p.id === selectedMethod.value)
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

  lastPaymentPayload = {
    paymentMethod: externalAmount.value > 0 ? selectedMethod.value : 'member_asset',
    paymentMethodName: externalAmount.value > 0 ? (m?.name || '') : '会员资产自动抵扣',
    amount: externalAmount.value,
    assetDeduction: {
      prepaid: prepaidDeduction.value,
      coins: coinDeduction.value,
      external: externalAmount.value
    },
    paymentLines,
    gameCoinOnly: props.gameCoinOnly,
    scannedCode: scannedCode || null
  }

  // 模拟支付处理（1-2秒）
  const delay = 800 + Math.random() * 1200
  paymentTimer = setTimeout(() => {
    // 支付失败判断：调试模式强制失败，否则约15%随机失败
    let shouldFail = false
    let failureIdx = -1
    if (debugFailMode.value > 0) {
      shouldFail = true
      failureIdx = debugFailMode.value - 1
    } else if (Math.random() < 0.15) {
      shouldFail = true
      failureIdx = Math.floor(Math.random() * PAYMENT_FAILURES.length)
    }

    if (shouldFail) {
      paymentError.value = PAYMENT_FAILURES[failureIdx]
      paymentStatus.value = 'error'
      return
    }

    // 支付成功
    paymentStatus.value = 'idle'
    paymentError.value = null
    emit('confirm', lastPaymentPayload)
    lastPaymentPayload = null
  }, delay)
}

// 重试支付
const retryPayment = () => {
  if (!lastPaymentPayload) return
  paymentError.value = null
  paymentStatus.value = 'processing'

  const delay = 800 + Math.random() * 1200
  paymentTimer = setTimeout(() => {
    // 重试时：调试模式优先，否则约8%随机失败
    let shouldFail = false
    let failureIdx = -1
    if (debugFailMode.value > 0) {
      shouldFail = true
      failureIdx = debugFailMode.value - 1
    } else if (Math.random() < 0.08) {
      shouldFail = true
      failureIdx = Math.floor(Math.random() * PAYMENT_FAILURES.length)
    }

    if (shouldFail) {
      paymentError.value = PAYMENT_FAILURES[failureIdx]
      paymentStatus.value = 'error'
      return
    }

    paymentStatus.value = 'idle'
    paymentError.value = null
    emit('confirm', lastPaymentPayload)
    lastPaymentPayload = null
  }, delay)
}

// 清除支付错误（关闭错误横幅）
const clearPaymentError = () => {
  paymentStatus.value = 'idle'
  paymentError.value = null
  lastPaymentPayload = null
}

// 关闭弹窗时清理计时器
const cleanupPaymentTimer = () => {
  if (paymentTimer) {
    clearTimeout(paymentTimer)
    paymentTimer = null
  }
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
  position: relative;
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

/* 调试按钮 */
.pm-debug-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: 1px dashed #cbd5e1;
  border-radius: 6px;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  font-size: 12px;
  font-family: inherit;
  transition: all 0.15s;
}

.pm-debug-btn:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
  color: #64748b;
}

.pm-debug-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #cbd5e1;
  transition: background 0.15s;
}

.pm-debug-dot--on {
  background: #ef4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.25);
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  align-self: center;
}

.pm-method-icon :deep(svg) {
  width: 24px;
  height: 24px;
  display: block;
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

.pm-checkout-btn--processing {
  pointer-events: none;
}

/* 按钮内加载动画 */
.pm-btn-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 8px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  vertical-align: -3px;
  animation: pm-spin 0.7s linear infinite;
}

@keyframes pm-spin {
  to { transform: rotate(360deg); }
}

/* ---- 支付错误横幅 ---- */
.pm-error-banner {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  margin-bottom: 10px;
  border-radius: 8px;
  background: #fef2f2;
  border: 1px solid #fecaca;
}

.pm-error-icon {
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #ef4444;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 1px;
}

.pm-error-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.pm-error-body strong {
  font-size: 13px;
  color: #991b1b;
  font-weight: 700;
}

.pm-error-body span {
  font-size: 12px;
  color: #b91c1c;
  line-height: 1.5;
}

.pm-error-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  margin-top: 2px;
}

.pm-error-retry {
  padding: 5px 14px;
  border: 0;
  border-radius: 6px;
  background: #ef4444;
  color: #fff;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  transition: background 0.15s;
}

.pm-error-retry:hover {
  background: #dc2626;
}

.pm-error-close-text {
  padding: 5px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  color: #6b7280;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  transition: all 0.15s;
}

.pm-error-close-text:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

/* ---- 支付处理中遮罩 ---- */
.pm-processing-overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(217, 235, 252, 0.85);
  backdrop-filter: blur(2px);
  border-radius: 16px;
}

.pm-processing-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 36px 48px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.pm-processing-card p {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #374151;
}

.pm-processing-spinner {
  display: block;
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #F97316;
  border-radius: 50%;
  animation: pm-spin 0.8s linear infinite;
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

/* ===== 扫码支付遮罩 & 弹窗 ===== */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
  opacity: 0;
}

.sc-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(6px);
}

.sc-dialog {
  width: min(100%, 480px);
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.28);
}

/* ---- 头部 ---- */
.sc-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: #f8fafc;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
}

.sc-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px 6px 8px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #475569;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  transition: all 0.15s ease;
}

.sc-back-btn:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.sc-header-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.sc-pay-tag {
  padding: 2px 10px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.sc-tag-wechat {
  background: #dcfce7;
  color: #166534;
}

.sc-tag-alipay {
  background: #e8f0fe;
  color: #1a56db;
}

.sc-amount {
  font-size: 20px;
  font-weight: 900;
  color: #0f172a;
  font-variant-numeric: tabular-nums;
}

.sc-close-btn {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  font-size: 22px;
  line-height: 1;
  transition: all 0.15s ease;
}

.sc-close-btn:hover {
  background: rgba(0, 0, 0, 0.06);
  color: #0f172a;
}

/* ---- 扫码主体 ---- */
.sc-body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 24px 24px;
  gap: 28px;
}

/* ---- 扫码框 ---- */
.sc-scan-frame {
  position: relative;
  width: 260px;
  height: 260px;
  border-radius: 16px;
  background: #1e293b;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: background 0.4s ease;
}

.sc-scan-frame.sc-success {
  background: #022c22;
}

.sc-scan-frame.sc-verifying {
  background: #1e1b0a;
}

.sc-scan-frame.sc-error {
  background: #450a0a;
}

/* 四角 */
.sc-corner {
  position: absolute;
  width: 28px;
  height: 28px;
  border-color: rgba(255, 255, 255, 0.7);
  border-style: solid;
  transition: border-color 0.3s ease;
}

.sc-corner--tl { top: 12px; left: 12px; border-width: 2px 0 0 2px; border-radius: 4px 0 0 0; }
.sc-corner--tr { top: 12px; right: 12px; border-width: 2px 2px 0 0; border-radius: 0 4px 0 0; }
.sc-corner--bl { bottom: 12px; left: 12px; border-width: 0 0 2px 2px; border-radius: 0 0 0 4px; }
.sc-corner--br { bottom: 12px; right: 12px; border-width: 0 2px 2px 0; border-radius: 0 0 4px 0; }

.sc-success .sc-corner { border-color: #34d399; }
.sc-verifying .sc-corner { border-color: #fbbf24; }
.sc-error .sc-corner { border-color: #f87171; }

/* 扫描激光线 */
.sc-laser {
  position: absolute;
  left: 20px;
  right: 20px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #22c55e, #4ade80, #22c55e, transparent);
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
  opacity: 0;
}

.sc-scanning .sc-laser {
  opacity: 1;
  animation: sc-laser-sweep 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

.sc-success .sc-laser,
.sc-error .sc-laser {
  opacity: 0;
  animation: none;
}

@keyframes sc-laser-sweep {
  0% { top: 20%; }
  50% { top: 80%; }
  100% { top: 20%; }
}

/* 扫码图标呼吸动画 */
.sc-scan-icon {
  color: rgba(255, 255, 255, 0.5);
}

.sc-scanning .sc-scan-icon {
  animation: sc-breathe 2s ease-in-out infinite;
}

.sc-scanning .sc-crosshair {
  opacity: 0.7;
}

@keyframes sc-breathe {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}

@keyframes sc-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.sc-spinner {
  animation: sc-spin 1.2s linear infinite;
  transform-origin: center;
}

/* 状态文字 */
.sc-status {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.sc-hint-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}

.sc-hint-desc {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.4;
  max-width: 200px;
}

.sc-status--ok .sc-hint-title { color: #6ee7b7; }
.sc-status--check .sc-hint-title { color: #fde68a; }
.sc-status--check .sc-hint-desc { color: rgba(253, 230, 138, 0.7); }
.sc-status--err .sc-hint-title { color: #fca5a5; }
.sc-status--err .sc-hint-desc { color: rgba(252, 165, 165, 0.8); }

/* ---- 手动输入 ---- */
.sc-manual {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.sc-manual-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border: 1px dashed #cbd5e1;
  border-radius: 10px;
  background: #f8fafc;
  color: #64748b;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  transition: all 0.15s ease;
}

.sc-manual-toggle:hover {
  border-color: #94a3b8;
  color: #475569;
  background: #f1f5f9;
}

.sc-manual-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.sc-manual-field {
  width: 100%;
  display: flex;
  gap: 8px;
}

.sc-manual-input {
  flex: 1;
  height: 44px;
  padding: 0 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
  color: #0f172a;
  font-size: 15px;
  font-weight: 600;
  font-family: 'SF Mono', 'Menlo', monospace;
  letter-spacing: 1px;
  outline: none;
  transition: border-color 0.15s ease;
}

.sc-manual-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.sc-manual-input--error {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
  color: #dc2626;
}

.sc-manual-input--error::placeholder {
  color: #fca5a5;
}

.sc-manual-input::placeholder {
  color: #94a3b8;
  font-weight: 500;
  letter-spacing: 0;
}

.sc-manual-submit {
  height: 44px;
  padding: 0 20px;
  border: 0;
  border-radius: 10px;
  background: #3b82f6;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  font-family: inherit;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.sc-manual-submit:hover:not(:disabled) {
  background: #2563eb;
}

.sc-manual-submit:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.sc-manual-cancel {
  border: 0;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  padding: 4px 8px;
}

.sc-manual-cancel:hover {
  color: #64748b;
}

.sc-manual-error {
  margin: 0;
  width: 100%;
  padding: 6px 12px;
  border-radius: 8px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  font-size: 12px;
  font-weight: 600;
  text-align: left;
  line-height: 1.4;
}

.sc-manual-hint {
  margin: 0;
  width: 100%;
  padding: 6px 12px;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 500;
  text-align: left;
}

/* ---- 过渡动画 ---- */
.sc-fade-enter-active,
.sc-fade-leave-active {
  transition: opacity 0.25s ease;
}

.sc-fade-enter-from,
.sc-fade-leave-to {
  opacity: 0;
}
</style>
