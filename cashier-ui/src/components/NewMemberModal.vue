<template>
  <transition name="modal-fade">
    <div
      v-if="visible"
      class="nmm-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="新增会员"
      @click.self="$emit('close')"
    >
      <section v-if="!showSuccess" class="nmm-dialog nmm-dialog--compact">
        <!-- 头部 -->
        <header class="nmm-header">
          <h2>新增会员</h2>
          <div class="nmm-header-actions">
            <button type="button" class="nmm-refresh" aria-label="刷新" @click="$emit('refresh')">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6"/><path d="M2.5 22v-6h6"/><path d="M2 11.5a10 10 0 0 1 18.8-4.3"/><path d="M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
            </button>
            <button type="button" class="nmm-close" aria-label="关闭" @click="$emit('close')">
              <el-icon><Close /></el-icon>
            </button>
          </div>
        </header>

        <!-- 表单主体：仅手机号 -->
        <div class="nmm-body">
          <div class="nmm-phone-block">
            <label class="nmm-field nmm-field-phone">
              <span class="nmm-label"><em>*</em>手机号：</span>
              <div class="nmm-input-wrap">
                <input
                  ref="phoneInputRef"
                  v-model.trim="phone"
                  type="tel"
                  inputmode="numeric"
                  maxlength="11"
                  placeholder="请输入 11 位手机号"
                  autocomplete="off"
                  @input="onPhoneInput"
                  @keyup.enter="handleSubmit"
                />
              </div>
            </label>
            <p v-if="statusText" class="nmm-status" :class="statusTone">{{ statusText }}</p>
          </div>

          <!-- 底部套餐区：有数据才渲染 -->
          <section v-if="hasAnyPkgData && canSubmit" class="nmm-pkg-section">
            <nav v-if="visibleTabs.length > 1" class="nmm-pkg-tabs">
              <button
                v-for="t in visibleTabs"
                :key="t"
                type="button"
                class="nmm-pkg-tab"
                :class="{ active: activePkg === t }"
                @click="switchPkgTab(t)"
              >{{ t }}</button>
            </nav>
            <div v-else class="nmm-pkg-tabs-placeholder"></div>

            <div class="nmm-pkg-scroll-wrap">
              <button
                v-if="canScrollLeft"
                type="button"
                class="nmm-scroll-arrow nmm-scroll-left"
                aria-label="向左滑动"
                @click="scrollPkg(-1)"
              >
                <el-icon><ArrowLeft /></el-icon>
              </button>
              <div ref="pkgListRef" class="nmm-pkg-list">
                <button
                  v-for="(p, i) in packages"
                  :key="i"
                  type="button"
                  class="nmm-pkg-card"
                  :class="{ selected: selectedPkg === i }"
                  @click="selectedPkg = i"
                >
                  <strong>{{ p.name }}</strong>
                  <em><span class="currency-symbol">&yen;</span>{{ p.price.toFixed(2) }}</em>
                </button>
              </div>
              <button
                v-if="canScrollRight"
                type="button"
                class="nmm-scroll-arrow nmm-scroll-right"
                aria-label="向右滑动"
                @click="scrollPkg(1)"
              >
                <el-icon><ArrowRight /></el-icon>
              </button>
            </div>
          </section>
        </div>

        <!-- 底部按钮 -->
        <footer class="nmm-footer">
          <button type="button" class="nmm-submit-btn" :disabled="!canSubmit" @click="handleSubmit">
            {{ submitButtonText }}
          </button>
        </footer>
      </section>

      <PaymentModal
        :visible="showPayment"
        :items="paymentItems"
        :total-amount="packagePrice"
        :payable-amount="packagePrice"
        @close="showPayment = false"
        @confirm="handlePaymentConfirm"
      />

      <DeductionSuccessModal
        :visible="showSuccess"
        :title="successTitle"
        :subtitle="successSubtitle"
        type="register"
        :details="successDetails"
        @close="handleSuccessClose"
      />
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { Close, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import PaymentModal from './PaymentModal.vue'
import DeductionSuccessModal from './DeductionSuccessModal.vue'
import {
  lookupGlobalMemberByPhone,
  createOrLinkMemberToStore,
  isValidPhone,
  normalizePhone,
  maskPhone,
} from '../stores/memberRegistry'

const props = defineProps({
  visible: { type: Boolean, default: false }
})
const emit = defineEmits(['close', 'submit', 'refresh'])

const phone = ref('')
const phoneInputRef = ref(null)
const lookupState = ref(null) // null | lookup result
const lastSubmitResult = ref(null)

const activePkg = ref('充值活动')
const selectedPkg = ref(-1)
const showPayment = ref(false)
const showSuccess = ref(false)

const rechargePackages = [
  { name: '充200送100', price: 300 },
  { name: '充500送300', price: 800 },
  { name: '充1000送800', price: 1800 },
  { name: '充2000送2000', price: 4000 },
  { name: '充3000送3500', price: 6500 },
  { name: '充5000送6500', price: 11500 },
  { name: '充8000送12000', price: 20000 }
]
const ticketPackages = []

const hasRechargeData = computed(() => rechargePackages.length > 0)
const hasTicketData = computed(() => ticketPackages.length > 0)
const hasAnyPkgData = computed(() => hasRechargeData.value || hasTicketData.value)

const visibleTabs = computed(() => {
  const tabs = []
  if (hasRechargeData.value) tabs.push('充值活动')
  if (hasTicketData.value) tabs.push('套票')
  return tabs
})

const packages = computed(() =>
  activePkg.value === '套票' ? ticketPackages : rechargePackages
)

const pkgListRef = ref(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

const updateScrollState = () => {
  const el = pkgListRef.value
  if (!el) return
  canScrollLeft.value = el.scrollLeft > 2
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 2
}

const scrollPkg = (dir) => {
  const el = pkgListRef.value
  if (!el) return
  el.scrollBy({ left: dir * 260, behavior: 'smooth' })
  setTimeout(updateScrollState, 320)
}

const hasSelectedPkg = computed(() => selectedPkg.value >= 0)
const selectedPackage = computed(() =>
  hasSelectedPkg.value ? packages.value[selectedPkg.value] : null
)
const packagePrice = computed(() => selectedPackage.value?.price || 0)
const paymentItems = computed(() => {
  if (!selectedPackage.value) return []
  return [{ name: selectedPackage.value.name, price: selectedPackage.value.price, quantity: 1 }]
})

const alreadyLinked = computed(() =>
  !!(lookupState.value?.exists && lookupState.value?.linkedToCurrentStore)
)

const canSubmit = computed(() =>
  isValidPhone(phone.value) && !alreadyLinked.value
)

const statusText = computed(() => {
  if (!phone.value) return ''
  if (!isValidPhone(phone.value)) {
    return phone.value.length >= 11 ? '请输入正确的 11 位手机号' : `已输入 ${phone.value.length}/11 位`
  }
  const s = lookupState.value
  if (!s) return ''
  if (s.exists && s.linkedToCurrentStore) {
    return `该手机号已是本店会员${s.profile?.name ? `（${s.profile.name}）` : ''}`
  }
  if (s.exists) {
    return '系统将自动关联到本店'
  }
  return '系统将自动添加为本店会员'
})

const statusTone = computed(() => {
  if (!isValidPhone(phone.value)) return 'is-muted'
  if (alreadyLinked.value) return 'is-warn'
  if (lookupState.value?.exists) return 'is-info'
  return 'is-ok'
})

const submitButtonText = computed(() => {
  if (alreadyLinked.value) return '已是本店会员'
  if (hasSelectedPkg.value) {
    return `确认并支付 ¥${selectedPackage.value.price.toFixed(2)}`
  }
  return '确认添加'
})

const successTitle = computed(() =>
  lastSubmitResult.value?.mode === 'link_only' ? '关联成功' : '添加成功'
)
const successSubtitle = computed(() =>
  lastSubmitResult.value?.mode === 'link_only'
    ? '已关联到本店'
    : '本店会员已添加'
)

const successDetails = computed(() => {
  const m = lastSubmitResult.value?.member
  const pkg = selectedPackage.value
  const items = [
    { label: '手机号', value: m?.phone || phone.value },
    {
      label: '会员',
      value: m?.name || maskPhone(phone.value),
    },
    {
      label: '处理结果',
      value: lastSubmitResult.value?.mode === 'link_only' ? '关联本店' : '新建本店会员',
    },
  ]
  if (pkg) {
    items.push({ label: '购买套餐', value: pkg.name })
    items.push({ label: '支付金额', value: `¥${pkg.price.toFixed(2)}` })
  }
  return items
})

const switchPkgTab = (t) => {
  activePkg.value = t
  selectedPkg.value = -1
  nextTick(updateScrollState)
}

const refreshLookup = () => {
  if (!isValidPhone(phone.value)) {
    lookupState.value = null
    return
  }
  lookupState.value = lookupGlobalMemberByPhone(phone.value)
}

const onPhoneInput = () => {
  phone.value = phone.value.replace(/\D/g, '').slice(0, 11)
  refreshLookup()
}

const finalizeMember = (pkg) => {
  const result = createOrLinkMemberToStore({ phone: phone.value })
  if (!result.ok) {
    ElMessage.warning(result.message)
    refreshLookup()
    return false
  }
  lastSubmitResult.value = result
  emit('submit', {
    phone: result.member.phone,
    name: result.member.name,
    gender: result.member.gender,
    birthday: result.member.birthday,
    remark: result.member.remark,
    package: pkg || null,
    mode: result.mode,
    member: result.member,
    message: result.message,
  })
  return true
}

const handleSubmit = () => {
  if (!canSubmit.value) return
  refreshLookup()
  if (alreadyLinked.value) {
    ElMessage.warning('该手机号已是本店会员')
    return
  }
  if (hasSelectedPkg.value) {
    showPayment.value = true
  } else if (finalizeMember(null)) {
    showSuccess.value = true
  }
}

const handlePaymentConfirm = () => {
  if (!finalizeMember(selectedPackage.value)) {
    showPayment.value = false
    return
  }
  showPayment.value = false
  showSuccess.value = true
}

const handleSuccessClose = () => {
  showSuccess.value = false
  emit('close')
}

watch(() => props.visible, (val) => {
  if (val) {
    phone.value = ''
    lookupState.value = null
    lastSubmitResult.value = null
    selectedPkg.value = -1
    showPayment.value = false
    showSuccess.value = false
    const tabs = visibleTabs.value
    activePkg.value = tabs.length > 0 ? tabs[0] : '充值活动'
    nextTick(() => phoneInputRef.value?.focus())
  }
})

onMounted(() => {
  watch(pkgListRef, (el) => {
    if (el) {
      el.addEventListener('scroll', updateScrollState, { passive: true })
      nextTick(updateScrollState)
    }
  })
})

onBeforeUnmount(() => {
  pkgListRef.value?.removeEventListener('scroll', updateScrollState)
})
</script>

<style scoped>
.nmm-overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
  background: var(--pos-overlay-backdrop);
}

.nmm-dialog {
  width: min(100%, 560px);
  max-height: calc(100vh - 56px);
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(180deg, #dff0ff 0%, #f7f9ff 100%);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.24);
  height: auto;
}

.nmm-dialog--compact {
  width: min(100%, 520px);
}

.nmm-header {
  flex-shrink: 0;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px 0 22px;
  background: #edf3fa;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
}

.nmm-header h2 {
  margin: 0;
  color: #1d2433;
  font-size: 16px;
  font-weight: 700;
}

.nmm-close,
.nmm-refresh {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  color: #4f5d73;
  cursor: pointer;
  transition: all 0.15s ease;
}

.nmm-close:hover,
.nmm-refresh:hover {
  background: rgba(255, 255, 255, 0.55);
  color: #2f7eff;
}

.nmm-close .el-icon {
  font-size: 20px;
}

.nmm-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nmm-body {
  overflow-y: auto;
  padding: 20px 28px 16px;
}

.nmm-phone-block {
  margin-bottom: 8px;
}

.nmm-field-phone {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.nmm-label {
  flex-shrink: 0;
  width: 72px;
  font-size: 13px;
  font-weight: 700;
  color: #334155;
  white-space: nowrap;
  text-align: right;
}

.nmm-label em {
  font-style: normal;
  color: #ef4444;
  margin-right: 2px;
}

.nmm-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0 14px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #d5eaf9;
  box-shadow: 0 2px 6px rgba(21, 88, 150, 0.05);
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.nmm-input-wrap:focus-within {
  border-color: #1191ff;
  box-shadow: 0 0 0 3px rgba(17, 145, 255, 0.12);
}

.nmm-input-wrap input {
  flex: 1;
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #171b24;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.nmm-input-wrap input::placeholder {
  color: #a2a3a6;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0;
}

.nmm-status {
  margin: 10px 0 0 80px;
  font-size: 12px;
  line-height: 1.4;
}

.nmm-status.is-muted { color: #94a3b8; }
.nmm-status.is-ok { color: #059669; }
.nmm-status.is-info { color: #1d4ed8; }
.nmm-status.is-warn { color: #b45309; }

.nmm-pkg-section {
  margin-top: 16px;
  padding: 16px 12px;
  border-radius: 12px;
  background: rgba(210, 230, 252, 0.35);
  border: 1px solid rgba(185, 221, 246, 0.5);
}

.nmm-pkg-tabs {
  display: flex;
  gap: 26px;
  margin-bottom: 14px;
  border-bottom: 1px solid rgba(147, 197, 253, 0.35);
  padding-bottom: 10px;
}

.nmm-pkg-tabs-placeholder {
  height: 8px;
  margin-bottom: 8px;
}

.nmm-pkg-tab {
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 700;
  color: #94a3b8;
  cursor: pointer;
  padding: 0 2px 4px;
  position: relative;
}

.nmm-pkg-tab.active {
  color: #3791ff;
}

.nmm-pkg-tab.active::after {
  content: '';
  position: absolute;
  bottom: -11px;
  left: 0;
  right: 0;
  height: 2px;
  background: #3791ff;
  border-radius: 1px;
}

.nmm-pkg-scroll-wrap {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
}

.nmm-scroll-arrow {
  flex: 0 0 auto;
  width: 24px;
  height: 36px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(147, 197, 253, 0.3);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.65);
  color: #6899d8;
  cursor: pointer;
}

.nmm-scroll-left { margin-right: 6px; }
.nmm-scroll-right { margin-left: 6px; }

.nmm-pkg-list {
  flex: 1;
  min-width: 0;
  display: flex;
  gap: 10px;
  align-items: center;
  height: 76px;
  overflow-x: auto;
  scrollbar-width: none;
}

.nmm-pkg-list::-webkit-scrollbar { display: none; }

.nmm-pkg-card {
  flex: 0 0 auto;
  width: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 72px;
  border: 1.5px solid rgba(216, 239, 255, 0.85);
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  transition: all 0.18s ease;
}

.nmm-pkg-card.selected {
  border-color: #3791ff;
  background: linear-gradient(180deg, #f0f7ff 0%, #e8f2ff 100%);
  box-shadow: 0 4px 16px rgba(47, 126, 255, 0.12);
}

.nmm-pkg-card strong {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
}

.nmm-pkg-card em {
  font-style: normal;
  font-size: 18px;
  font-weight: 900;
  color: #fc630a;
}

.currency-symbol {
  font-size: 13px;
  font-weight: 700;
  margin-right: 1px;
}

.nmm-footer {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  padding: 16px 24px 20px;
}

.nmm-submit-btn {
  width: 200px;
  height: 42px;
  border: 0;
  border-radius: 8px;
  background: linear-gradient(90deg, #3791ff 0%, #2c6eff 100%);
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(47, 126, 255, 0.25);
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.nmm-submit-btn:hover:not(:disabled) {
  opacity: 0.92;
  transform: translateY(-1px);
}

.nmm-submit-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
