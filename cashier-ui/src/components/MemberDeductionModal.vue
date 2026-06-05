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
          <button type="button" class="md-close-btn" @click="$emit('close')">×</button>
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

          <!-- 确认扣费按钮 -->
          <button
            type="button"
            class="md-submit-btn"
            :disabled="!selectedDeviceId || processing"
            @click="handleSubmit"
          >
            {{ processing ? '处理中...' : '确认扣费' }}
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
  member: { type: Object, default: null }
})

const emit = defineEmits(['close', 'confirm'])

const selectedDeviceId = ref('')
const deductCount = ref(1)
const processing = ref(false)

const devicePrice = computed(() => {
  if (!selectedDeviceId.value) return 0
  const d = props.devices.find(item => item.id === selectedDeviceId.value)
  return d ? Number(d.price || 0) : 0
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
