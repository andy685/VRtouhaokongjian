<template>
  <transition name="md-fade">
    <div
      v-if="visible"
      class="md-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="会员扣费"
      @click.self="$emit('close')"
    >
      <section class="md-dialog">
        <!-- 头部 -->
        <header class="md-header">
          <h2>会员扣费</h2>
          <div class="md-header-actions">
            <button type="button" class="md-close-btn" @click="$emit('close')">×</button>
          </div>
        </header>

        <!-- 表单主体 -->
        <div class="md-body">
          <!-- 选择设备 -->
          <div class="md-field" ref="deviceFieldRef">
            <label class="md-label">选择设备</label>
            <div class="md-dropdown" :class="{ 'md-dropdown-open': deviceDropdownOpen }">
              <button
                type="button"
                class="md-dropdown-trigger"
                @click="toggleDeviceDropdown"
                @blur="onDeviceDropdownBlur"
              >
                <span class="md-dropdown-text" :class="{ 'md-dropdown-placeholder': !selectedDeviceId }">
                  {{ selectedDeviceLabel || '请搜索或者选择设备' }}
                </span>
                <svg class="md-dropdown-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>
              <transition name="md-drop-fade">
                <ul v-if="deviceDropdownOpen" class="md-dropdown-menu">
                  <li
                    v-for="d in devices"
                    :key="d.id"
                    class="md-dropdown-item"
                    :class="{ 'md-dropdown-item-active': selectedDeviceId === d.id }"
                    @mousedown.prevent="selectDevice(d)"
                  >
                    {{ d.name }}
                  </li>
                  <li v-if="devices.length === 0" class="md-dropdown-item md-dropdown-item-empty">
                    暂无设备
                  </li>
                </ul>
              </transition>
            </div>
          </div>

          <!-- 设备单价 -->
          <div class="md-field">
            <label class="md-label">设备单价</label>
            <input
              type="number"
              class="md-input"
              :value="devicePrice.toFixed(2)"
              min="0"
              step="0.01"
              readonly
            />
          </div>

          <!-- 扣费人数 -->
          <div class="md-field md-field-stepper">
            <label class="md-label">扣费人数：</label>
            <div class="md-stepper">
              <button type="button" class="md-step-btn" :disabled="deductCount <= 1" @click="deductCount--">−</button>
              <input type="text" class="md-step-input" :value="deductCount" readonly />
              <button type="button" class="md-step-btn" @click="deductCount++">＋</button>
            </div>
          </div>

          <!-- §5.2 资产消耗预览 -->
          <div v-if="showAssetPreview" class="md-asset-preview">
            <div class="md-asset-preview-title">本次将消耗</div>
            <div class="md-asset-preview-grid">
              <div class="md-asset-chip">
                <span>扣费金额</span>
                <strong>¥{{ totalDeductAmount.toFixed(2) }}</strong>
              </div>
              <div class="md-asset-chip">
                <span>扣费来源</span>
                <strong>{{ assetSourceLabel }}</strong>
              </div>
            </div>
            <p v-if="!assetInsufficient" class="md-asset-note">
              扣费后预存款余额 <em>¥{{ afterDeductionBalance.toFixed(2) }}</em>
            </p>
            <p v-else class="md-asset-warn">
              余额不足！当前可用资产 ¥{{ totalMemberAssets.toFixed(2) }}，还差 ¥{{ shortageAmount.toFixed(2) }}
            </p>
          </div>

          <!-- 确认扣费按钮 -->
          <button
            type="button"
            class="md-submit-btn"
            :disabled="submitDisabled"
            @click="handleSubmit"
          >
            {{ submitButtonText }}
          </button>
        </div>
      </section>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  devices: { type: Array, default: () => [] },
  member: { type: Object, default: null },
  // §5.2 会员资产用于预览消耗明细
  memberAssets: { type: Object, default: null }
})

const emit = defineEmits(['close', 'confirm'])

const selectedDeviceId = ref('')
const deductCount = ref(1)
const processing = ref(false)

// --- 自定义下拉 ---
const deviceDropdownOpen = ref(false)
const deviceFieldRef = ref(null)

const selectedDeviceLabel = computed(() => {
  if (!selectedDeviceId.value) return ''
  const d = props.devices.find(item => item.id === selectedDeviceId.value)
  return d ? d.name : ''
})

const toggleDeviceDropdown = () => {
  deviceDropdownOpen.value = !deviceDropdownOpen.value
}

const selectDevice = (d) => {
  selectedDeviceId.value = d.id
  deviceDropdownOpen.value = false
}

const onDeviceDropdownBlur = (e) => {
  // 延迟关闭，让 mousedown 先执行
  nextTick(() => {
    const el = deviceFieldRef.value
    if (el && !el.contains(document.activeElement)) {
      deviceDropdownOpen.value = false
    }
  })
}

const devicePrice = computed(() => {
  if (!selectedDeviceId.value) return 0
  const d = props.devices.find(item => item.id === selectedDeviceId.value)
  return d ? Number(d.price || 0) : 0
})

const totalDeductAmount = computed(() => devicePrice.value * deductCount.value)

// §5.2 资产消耗预览
const showAssetPreview = computed(() => !!selectedDeviceId.value && !!props.memberAssets)

const totalMemberAssets = computed(() => {
  const balance = Number(props.memberAssets?.balance ?? 0)
  const coins = Number(props.memberAssets?.coins ?? 0)
  return Number((balance + coins).toFixed(2))
})

// 是否余额不足
const assetInsufficient = computed(() =>
  !!props.memberAssets && totalDeductAmount.value > totalMemberAssets.value
)

// 差额
const shortageAmount = computed(() =>
  Math.max(0, Number((totalDeductAmount.value - totalMemberAssets.value).toFixed(2)))
)

const assetSourceLabel = computed(() => {
  const balance = Number(props.memberAssets?.balance ?? 0)
  if (balance >= totalDeductAmount.value) return '预存款'
  if (balance > 0) return '预存款 + 游戏币'
  return '游戏币'
})

const afterDeductionBalance = computed(() => {
  const balance = Number(props.memberAssets?.balance ?? 0)
  const coins = Number(props.memberAssets?.coins ?? 0)
  let remainingBalance = balance
  let remainingAmount = totalDeductAmount.value
  const fromBalance = Math.min(remainingAmount, remainingBalance)
  remainingAmount -= fromBalance
  remainingBalance -= fromBalance
  if (remainingAmount > 0) {
    remainingBalance -= remainingAmount
  }
  return Math.max(0, Number(remainingBalance.toFixed(2)))
})

// 按钮是否禁用
const submitDisabled = computed(() =>
  !selectedDeviceId.value || processing.value || assetInsufficient.value
)

// 按钮文案
const submitButtonText = computed(() => {
  if (processing.value) return '处理中...'
  if (assetInsufficient.value) return '余额不足'
  return '确认扣费'
})

watch(() => props.visible, (val) => {
  if (val) {
    selectedDeviceId.value = ''
    deductCount.value = 1
    processing.value = false
    deviceDropdownOpen.value = false
  }
})

const handleSubmit = () => {
  if (!selectedDeviceId.value || processing.value) return
  const device = props.devices.find(d => d.id === selectedDeviceId.value)
  emit('confirm', {
    device,
    deviceId: selectedDeviceId.value,
    price: devicePrice.value,
    count: deductCount.value,
    totalAmount: devicePrice.value * deductCount.value
  })
}
</script>

<style scoped>
/* ===== 遮罩 ===== */
.md-overlay {
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
.md-dialog {
  width: min(100%, 400px);
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  background: #D9EBFC;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.24);
}

/* ---- 头部 ---- */
.md-header {
  flex-shrink: 0;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px 0 22px;
  background: #edf3fa;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
}

.md-header h2 {
  margin: 0;
  color: #1d2433;
  font-size: 16px;
  font-weight: 700;
}

.md-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.md-close-btn {
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

.md-close-btn:hover {
  background: rgba(255, 255, 255, 0.55);
  color: #2f7eff;
}

/* ---- 表单主体 ---- */
.md-body {
  padding: 24px 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: transparent;
}

/* --- 表单行 --- */
.md-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.md-label {
  font-size: 14px;
  font-weight: 600;
  color: #4f5d73;
}

/* --- 自定义下拉选择 --- */
.md-dropdown {
  position: relative;
  isolation: isolate;
}

.md-dropdown-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  height: 42px;
  padding: 0 12px 0 12px;
  border: 1.5px solid rgba(15, 23, 42, 0.08);
  border-radius: 10px;
  background: #fff;
  color: #1d2433;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s ease, border-radius 0.15s ease;
}

.md-dropdown-trigger:hover {
  border-color: #7cb8e6;
}

.md-dropdown-open .md-dropdown-trigger {
  border-color: #3791ff;
  border-radius: 10px 10px 0 0;
  border-bottom-color: rgba(15, 23, 42, 0.04);
}

.md-dropdown-text {
  flex: 1;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.md-dropdown-placeholder {
  color: #94a3b8;
}

.md-dropdown-chevron {
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.md-dropdown-open .md-dropdown-chevron {
  transform: rotate(180deg);
}

.md-dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 10;
  margin: 0;
  padding: 4px 0;
  list-style: none;
  border: 1.5px solid #3791ff;
  border-top: 0;
  border-radius: 0 0 10px 10px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.1);
  max-height: 196px;
  overflow-y: auto;
}

.md-dropdown-item {
  display: flex;
  align-items: center;
  height: 38px;
  padding: 0 12px;
  color: #4f5d73;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.12s ease, color 0.12s ease;
}

.md-dropdown-item:hover {
  background: #f0f7ff;
  color: #1d2433;
}

.md-dropdown-item-active {
  background: #e8f4fd;
  color: #2563eb;
  font-weight: 700;
}

.md-dropdown-item-empty {
  color: #94a3b8;
  cursor: default;
}

/* --- 下拉过渡 --- */
.md-drop-fade-enter-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.md-drop-fade-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}

.md-drop-fade-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}

.md-drop-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* --- 旧的 select 样式已移除 --- */

/* --- 输入框 --- */
.md-input {
  height: 42px;
  padding: 0 14px;
  border: 1.5px solid rgba(15, 23, 42, 0.08);
  border-radius: 10px;
  background: #f8fbff;
  color: #1d2433;
  font-size: 15px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}

.md-input:focus {
  border-color: #3791ff;
  background: #fff;
}

/* --- 步进器区域 --- */
.md-field-stepper {
  flex-direction: row !important;
  align-items: center;
  gap: 10px !important;
}

.md-stepper {
  display: inline-flex;
  align-items: center;
  border: 1.5px solid rgba(15, 23, 42, 0.08);
  border-radius: 10px;
  overflow: hidden;
}

.md-step-btn {
  width: 40px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-right: 1.5px solid rgba(15, 23, 42, 0.08);
  background: #fff;
  color: #3791ff;
  cursor: pointer;
  font-size: 18px;
  font-weight: 400;
  line-height: 1;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.md-step-btn:last-child {
  border-right: 0;
  border-left: 1.5px solid rgba(15, 23, 42, 0.08);
}

.md-step-btn:hover:not(:disabled) {
  background: #f0f7ff;
}

.md-step-btn:disabled {
  color: #cbd5e1;
  cursor: not-allowed;
}

.md-step-input {
  width: 52px;
  height: 38px;
  text-align: center;
  border: 0;
  background: #fff;
  color: #1d2433;
  font-size: 16px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  font-family: inherit;
  outline: none;
}

/* --- 资产消耗预览 --- */
.md-asset-preview {
  padding: 14px;
  border: 1px solid #fed7aa;
  border-radius: 12px;
  background: linear-gradient(180deg, #fff7ed 0%, #fff 100%);
}

.md-asset-preview-title {
  color: #9a5a28;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 10px;
}

.md-asset-preview-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.md-asset-chip {
  padding: 8px 10px;
  border-radius: 8px;
  background: #fff;
  box-shadow: inset 0 0 0 1px rgba(251, 146, 60, 0.15);
}

.md-asset-chip span,
.md-asset-chip strong {
  display: block;
}

.md-asset-chip span {
  color: #9a5a28;
  font-size: 11px;
  font-weight: 700;
}

.md-asset-chip strong {
  margin-top: 3px;
  color: #ea580c;
  font-size: 14px;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
}

.md-asset-note {
  margin: 8px 0 0;
  color: #7c4a22;
  font-size: 11px;
  font-weight: 600;
}

.md-asset-note em {
  font-style: normal;
  font-weight: 800;
  color: #ea580c;
}

/* 余额不足警告 */
.md-asset-warn {
  margin: 8px 0 0;
  color: #dc2626;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.5;
}

/* --- 提交按钮 --- */
.md-submit-btn {
  margin-top: 4px;
  width: 100%;
  height: 46px;
  border: 0;
  border-radius: 12px;
  background: #F97316;
  color: #fff;
  cursor: pointer;
  font-size: 16px;
  font-weight: 800;
  font-family: inherit;
  letter-spacing: 0.5px;
  transition: background-color 0.15s ease, opacity 0.15s ease;
}

.md-submit-btn:hover:not(:disabled) {
  background: #ea580c;
}

.md-submit-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* ===== 过渡动画 ===== */
.md-fade-enter-active,
.md-fade-leave-active {
  transition: opacity 0.2s ease;
}

.md-fade-enter-from,
.md-fade-leave-to {
  opacity: 0;
}
</style>
