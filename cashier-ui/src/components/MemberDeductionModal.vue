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
            <button type="button" class="md-refresh-btn" aria-label="刷新" @click="$emit('refresh')"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6"/><path d="M2.5 22v-6h6"/><path d="M2 11.5a10 10 0 0 1 18.8-4.3"/><path d="M22 12.5a10 10 0 0 1-18.8 4.2"/></svg></button>
            <button type="button" class="md-close-btn" @click="$emit('close')">×</button>
          </div>
        </header>

        <!-- 表单主体 -->
        <div class="md-body">
          <!-- 选择设备 -->
          <div class="md-field">
            <label class="md-label">选择设备</label>
            <select v-model="selectedDeviceId" class="md-select" placeholder="请搜索或者选择设备">
              <option value="" disabled>请搜索或者选择设备</option>
              <option v-for="d in devices" :key="d.id" :value="d.id">{{ d.name }}</option>
            </select>
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
import { ref, computed, watch } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  devices: { type: Array, default: () => [] },
  member: { type: Object, default: null },
  // §5.2 会员资产用于预览消耗明细
  memberAssets: { type: Object, default: null }
})

const emit = defineEmits(['close', 'confirm', 'refresh'])

const selectedDeviceId = ref('')
const deductCount = ref(1)
const processing = ref(false)

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
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e2e8f0;
}

/* ---- 头部 ---- */
.md-header {
  flex-shrink: 0;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px 0 24px;
  border-bottom: 1px solid #e2e8f0;
}

.md-header h2 {
  margin: 0;
  color: #1e293b;
  font-size: 16px;
  font-weight: 700;
}

.md-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.md-close-btn {
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

.md-close-btn:hover {
  color: #1e293b;
}

.md-refresh-btn {
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
  font-size: 18px;
  line-height: 1;
  transition: color 0.15s ease;
}

.md-refresh-btn:hover {
  color: #3b82f6;
}

/* ---- 表单主体 ---- */
.md-body {
  padding: 28px 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: #fff;
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
  color: #374151;
}

/* --- 下拉选择 --- */
.md-select {
  height: 42px;
  padding: 0 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 4px;
  background: #fff;
  color: #1e293b;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s ease;
}

.md-select:hover {
  border-color: #93c5fd;
}

.md-select:focus {
  border-color: #2563EB;
}

.md-select option {
  color: #1e293b;
}

/* --- 输入框 --- */
.md-input {
  height: 42px;
  padding: 0 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 4px;
  background: #f8fafc;
  color: #1e293b;
  font-size: 15px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s ease;
}

.md-input:focus {
  border-color: #2563EB;
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
  border: 1.5px solid #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.md-step-btn {
  width: 40px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-right: 1.5px solid #e2e8f0;
  background: #fff;
  color: #2563EB;
  cursor: pointer;
  font-size: 18px;
  font-weight: 400;
  line-height: 1;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.md-step-btn:last-child {
  border-right: 0;
  border-left: 1.5px solid #e2e8f0;
}

.md-step-btn:hover:not(:disabled) {
  background: #eff6ff;
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
  color: #1e293b;
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
  border-radius: 4px;
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
