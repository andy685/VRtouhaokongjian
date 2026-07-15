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
      <section v-if="!showSuccess" class="nmm-dialog">
        <!-- 头部 -->
        <header class="nmm-header">
          <h2>新增会员</h2>
          <div class="nmm-header-actions">
            <button type="button" class="nmm-refresh" aria-label="刷新" @click="$emit('refresh')"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6"/><path d="M2.5 22v-6h6"/><path d="M2 11.5a10 10 0 0 1 18.8-4.3"/><path d="M22 12.5a10 10 0 0 1-18.8 4.2"/></svg></button>
            <button type="button" class="nmm-close" aria-label="关闭" @click="$emit('close')">
              <el-icon><Close /></el-icon>
            </button>
          </div>
        </header>

        <!-- 表单主体 -->
        <div class="nmm-body">
          <!-- 第1行：用户名 + 手机 -->
          <div class="nmm-row">
            <label class="nmm-field">
              <span class="nmm-label"><em>*</em>用户名：</span>
              <div class="nmm-input-wrap">
                <input v-model.trim="form.name" type="text" placeholder="请输入会员姓名" />
              </div>
            </label>
            <label class="nmm-field">
              <span class="nmm-label"><em>*</em>手机：</span>
              <div class="nmm-input-wrap">
                <input v-model.trim="form.phone" type="text" placeholder="请输入会员手机号" />
              </div>
            </label>
          </div>

          <!-- 第2行：性别 + 生日 -->
          <div class="nmm-row">
            <label class="nmm-field">
              <span class="nmm-label">性别：</span>
              <div class="nmm-gender-btns">
                <button
                  v-for="g in genders"
                  :key="g"
                  type="button"
                  :class="{ active: form.gender === g }"
                  @click="form.gender = g"
                >{{ g }}</button>
              </div>
            </label>
            <label class="nmm-field">
              <span class="nmm-label">生日：</span>
              <el-date-picker
                v-model="form.birthday"
                type="date"
                placeholder="请选择日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                class="nmm-date-picker"
                popper-class="pos-date-popper"
              />
            </label>
          </div>

          <!-- 第3行：备注 -->
          <div class="nmm-row nmm-row-tall">
            <label class="nmm-field nmm-field-full">
              <span class="nmm-label">备注：</span>
              <div class="nmm-textarea-wrap">
                <textarea v-model.trim="form.remark" rows="3" placeholder="非必填"></textarea>
              </div>
            </label>
          </div>

          <!-- 底部套餐区：有数据才渲染 -->
          <section v-if="hasAnyPkgData" class="nmm-pkg-section">
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
            <!-- 单tab时占位，保持高度一致 -->
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
            {{ hasSelectedPkg ? `确认并支付 ¥${selectedPackage.price.toFixed(2)}` : '确认新增' }}
          </button>
        </footer>
      </section>

      <!-- 支付弹窗 — 选套餐后触发 -->
      <PaymentModal
        :visible="showPayment"
        :items="paymentItems"
        :total-amount="packagePrice"
        :payable-amount="packagePrice"
        @close="showPayment = false"
        @confirm="handlePaymentConfirm"
      />

      <!-- 注册成功弹窗 -->
      <DeductionSuccessModal
        :visible="showSuccess"
        title="注册成功"
        subtitle="新会员注册完成"
        type="register"
        :details="successDetails"
        @close="handleSuccessClose"
      />
    </div>
  </transition>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { Close, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import PaymentModal from './PaymentModal.vue'
import DeductionSuccessModal from './DeductionSuccessModal.vue'

const props = defineProps({
  visible: { type: Boolean, default: false }
})
const emit = defineEmits(['close', 'submit', 'refresh'])

const genders = ['男', '女']

const form = reactive({
  name: '',
  phone: '',
  gender: '男',
  birthday: '',
  bindIC: false,
  remark: ''
})

const activePkg = ref('充值活动')
const selectedPkg = ref(-1)
const showPayment = ref(false)
const showSuccess = ref(false)

// ===== 套餐数据（可根据实际情况替换为空数组） =====
const rechargePackages = [
  { name: '充200送100', price: 300 },
  { name: '充500送300', price: 800 },
  { name: '充1000送800', price: 1800 },
  { name: '充2000送2000', price: 4000 },
  { name: '充3000送3500', price: 6500 },
  { name: '充5000送6500', price: 11500 },
  { name: '充8000送12000', price: 20000 }
]

// 套票暂不启用
// const ticketPackages = [
//   { name: '5次套票', price: 198 },
//   { name: '10次套票', price: 360 },
//   { name: '20次套票', price: 660 },
//   { name: '月卡畅玩', price: 880 }
// ]
const ticketPackages = []

// ===== 可见性判断 =====
const hasRechargeData = computed(() => rechargePackages.length > 0)
const hasTicketData = computed(() => ticketPackages.length > 0)
const hasAnyPkgData = computed(() => hasRechargeData.value || hasTicketData.value)

const visibleTabs = computed(() => {
  const tabs = []
  if (hasRechargeData.value) tabs.push('充值活动')
  if (hasTicketData.value) tabs.push('套票')
  return tabs
})

const packages = computed(() => {
  return activePkg.value === '套票' ? ticketPackages : rechargePackages
})

// ===== 横向滚动箭头 =====
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
  const cardWidth = 120 + 10 // card width + gap
  el.scrollBy({ left: dir * cardWidth * 2, behavior: 'smooth' })
  setTimeout(updateScrollState, 320)
}

// ===== 选中套餐 =====
const hasSelectedPkg = computed(() => selectedPkg.value >= 0)

const selectedPackage = computed(() => {
  if (!hasSelectedPkg.value) return null
  return packages.value[selectedPkg.value]
})

const packagePrice = computed(() => {
  return selectedPackage.value ? selectedPackage.value.price : 0
})

const paymentItems = computed(() => {
  if (!selectedPackage.value) return []
  return [{ name: selectedPackage.value.name, price: selectedPackage.value.price, quantity: 1 }]
})

// ===== 成功弹窗详情 =====
const successDetails = computed(() => {
  const pkg = selectedPackage.value
  const items = [
    { label: '会员姓名', value: form.name },
    { label: '手机号', value: form.phone },
    { label: '性别', value: form.gender }
  ]
  if (form.birthday) items.push({ label: '生日', value: form.birthday })
  if (pkg) {
    items.push({ label: '购买套餐', value: pkg.name })
    items.push({ label: '支付金额', value: `¥${pkg.price.toFixed(2)}` })
  }
  return items
})

// 切换套餐 tab，重置选中项
const switchPkgTab = (t) => {
  activePkg.value = t
  selectedPkg.value = -1
  nextTick(updateScrollState)
}

// 表单校验
const canSubmit = computed(() => {
  return form.name.trim().length > 0 && form.phone.trim().length > 0
})

// 打开时重置，自动选中第一个有数据的 tab
watch(() => props.visible, (val) => {
  if (val) {
    Object.assign(form, {
      name: '', phone: '', gender: '男', birthday: '',
      bindIC: false, remark: ''
    })
    selectedPkg.value = -1
    showPayment.value = false
    showSuccess.value = false
    const tabs = visibleTabs.value
    activePkg.value = tabs.length > 0 ? tabs[0] : '充值活动'
  }
})

// 注册滚动监听
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

// 点击提交
const handleSubmit = () => {
  if (!canSubmit.value) return
  if (hasSelectedPkg.value) {
    // 选了套餐 → 打开支付弹窗
    showPayment.value = true
  } else {
    // 没选套餐 → 直接提交
    emit('submit', { ...form, package: null })
    emit('close')
  }
}

// 支付确认
const handlePaymentConfirm = () => {
  showPayment.value = false
  showSuccess.value = true
}

// 成功弹窗关闭 → 正式提交并关闭
const handleSuccessClose = () => {
  showSuccess.value = false
  emit('submit', { ...form, package: selectedPackage.value })
  emit('close')
}
</script>

<style scoped>
/* ===== 遮罩层 — 与 MemberSelectModal 一致 ===== */
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

/* ===== 弹窗主体 — 高度自适应 ===== */
.nmm-dialog {
  width: min(100%, 780px);
  max-height: calc(100vh - 56px);
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(180deg, #dff0ff 0%, #f7f9ff 100%);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.24);
  /* 自动高度，不超过 max-height 时撑开内容 */
  height: auto;
}

/* ---- 头部 — 与 MSM 一致 ---- */
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

.nmm-close {
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

.nmm-close:hover {
  background: rgba(255,255,255,0.55);
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

.nmm-refresh:hover {
  background: rgba(255,255,255,0.55);
  color: #2f7eff;
}

/* ---- 表单主体 ---- */
.nmm-body {
  overflow-y: auto;
  padding: 20px 28px 16px;
}

/* 行布局（2列） */
.nmm-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 16px;
}

.nmm-row-tall {
  align-items: start;
}

/* 字段 — 标签与输入框在同一行 */
.nmm-field {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.nmm-field-full {
  grid-column: 1 / -1;
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

/* 输入框容器 — 与 MSM 搜索框风格统一 */
.nmm-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 13px;
  border-radius: 8px;
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
  font-size: 13px;
}

.nmm-input-wrap input::placeholder {
  color: #a2a3a6;
}

/* el-date-picker 在弹窗内的风格适配 */
.nmm-date-picker {
  flex: 1;
}

.nmm-date-picker :deep(.el-input__wrapper) {
  height: 40px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #d5eaf9;
  box-shadow: 0 2px 6px rgba(21, 88, 150, 0.05);
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.nmm-date-picker :deep(.el-input__wrapper:hover) {
  border-color: #91cdfa;
}

.nmm-date-picker :deep(.el-input__wrapper.is-focus) {
  border-color: #1191ff;
  box-shadow: 0 0 0 3px rgba(17, 145, 255, 0.12);
}

.nmm-date-picker :deep(.el-input__inner) {
  font-size: 13px;
  color: #171b24;
}

.nmm-date-picker :deep(.el-input__inner::placeholder) {
  color: #a2a3a6;
}

.nmm-date-picker :deep(.el-input__prefix),
.nmm-date-picker :deep(.el-input__suffix) {
  color: #3791ff;
}

/* 文本域容器 */
.nmm-textarea-wrap {
  flex: 1;
}

.nmm-textarea-wrap textarea {
  width: 100%;
  padding: 9px 13px;
  border: 1px solid #d5eaf9;
  border-radius: 8px;
  background: #fff;
  font-size: 13px;
  color: #171b24;
  outline: none;
  resize: vertical;
  min-height: 72px;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
  font-family: inherit;
  box-sizing: border-box;
}

.nmm-textarea-wrap textarea:focus {
  border-color: #1191ff;
  box-shadow: 0 0 0 3px rgba(17, 145, 255, 0.12);
}

.nmm-textarea-wrap textarea::placeholder {
  color: #a2a3a6;
}

/* 性别按钮组 — 与 MSM tab 风格统一 */
.nmm-gender-btns {
  display: inline-flex;
  gap: 8px;
}

.nmm-gender-btns button {
  height: 32px;
  padding: 0 22px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #4f6380;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
}

.nmm-gender-btns button:hover {
  color: #2f7eff;
  background: rgba(255,255,255,0.55);
}

.nmm-gender-btns button.active {
  color: #fff;
  background: linear-gradient(90deg, #3791ff 0%, #2c6eff 100%);
  box-shadow: 0 6px 14px rgba(47, 126, 255, 0.2);
}

/* 开关组件 */
.nmm-switch {
  position: relative;
  display: inline-flex;
  vertical-align: middle;
  cursor: pointer;
}

.nmm-switch input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.nmm-track {
  position: relative;
  width: 42px;
  height: 24px;
  border-radius: 12px;
  background: #cfd8e3;
  transition: background 0.25s ease;
}

.nmm-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,.18);
  transition: transform 0.25s ease;
}

.nmm-switch input:checked + .nmm-track {
  background: linear-gradient(90deg, #3791ff 0%, #2c6eff 100%);
}

.nmm-switch input:checked + .nmm-track .nmm-thumb {
  transform: translateX(18px);
}

/* ===== 底部套餐区 ===== */
.nmm-pkg-section {
  margin-top: 6px;
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
  height: 38px; /* ≈ tab nav 实际高度（padding + border + tab） */
  margin-bottom: 14px;
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
  transition: color 0.15s ease;
}

.nmm-pkg-tab:hover {
  color: #4f6380;
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

/* 滚动容器 + 箭头 */
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
  transition: all 0.18s ease;
}

.nmm-scroll-arrow:hover {
  background: rgba(55, 145, 255, 0.1);
  border-color: rgba(55, 145, 255, 0.4);
  color: #3791ff;
}

.nmm-scroll-arrow .el-icon {
  font-size: 16px;
}

.nmm-scroll-left {
  margin-right: 6px;
}

.nmm-scroll-right {
  margin-left: 6px;
}

/* 套餐卡片列表 — 横向滚动，固定高度防抖动，隐藏滚动条 */
.nmm-pkg-list {
  flex: 1;
  min-width: 0;
  display: flex;
  gap: 10px;
  align-items: center;
  height: 76px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  /* 隐藏滚动条但可滑动 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

.nmm-pkg-list::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

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

.nmm-pkg-card:hover {
  border-color: #91cdfa;
  box-shadow: 0 4px 14px rgba(17, 145, 255, 0.08);
  transform: translateY(-1px);
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

/* ===== 底部提交栏 ===== */
.nmm-footer {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  padding: 16px 24px 20px;
}

.nmm-submit-btn {
  width: 180px;
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
  box-shadow: 0 10px 24px rgba(47, 126, 255, 0.35);
}

.nmm-submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.nmm-submit-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* ===== 过渡动画 — 与 MSM 一致 ===== */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
