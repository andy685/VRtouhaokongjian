<template>
  <div class="account-recharge-page">
    <n-breadcrumb class="page-breadcrumb">
      <n-breadcrumb-item>主页</n-breadcrumb-item>
      <n-breadcrumb-item>用户设置</n-breadcrumb-item>
      <n-breadcrumb-item>账户余额</n-breadcrumb-item>
      <n-breadcrumb-item>充值</n-breadcrumb-item>
    </n-breadcrumb>

    <div class="page-header">
      <h2 class="page-title">账户充值</h2>
    </div>

    <div class="recharge-card">
      <div class="recharge-section">
        <div class="section-label">充值账户</div>
        <div class="account-type">运营账户</div>
      </div>

      <div class="recharge-section">
        <div class="section-label">充值金额</div>
        <div class="amount-options">
          <div
            v-for="amount in amountOptions"
            :key="amount"
            class="amount-option"
            :class="{ active: selectedAmount === amount }"
            @click="selectedAmount = amount"
          >
            ¥{{ amount }}
          </div>
          <div class="amount-option custom" :class="{ active: isCustomAmount }">
            <n-input
              v-model:value="customAmount"
              placeholder="自定义"
              @focus="isCustomAmount = true; selectedAmount = null"
              @blur="handleCustomBlur"
            >
              <template #prefix>¥</template>
            </n-input>
          </div>
        </div>
      </div>

      <div class="recharge-section">
        <div class="section-label">支付方式</div>
        <div class="payment-options">
          <div
            v-for="method in paymentMethods"
            :key="method.key"
            class="payment-option"
            :class="{ active: selectedPayment === method.key }"
            @click="selectedPayment = method.key"
          >
            <n-icon :component="method.icon" size="24" />
            <span>{{ method.label }}</span>
          </div>
        </div>
      </div>

      <div class="recharge-summary">
        <div class="summary-row">
          <span>充值金额</span>
          <span class="summary-value">¥ {{ finalAmount }}</span>
        </div>
      </div>

      <div class="recharge-actions">
        <n-button type="primary" size="large" class="submit-btn" :disabled="!finalAmount" @click="handleSubmit">
          立即充值
        </n-button>
        <n-button size="large" class="submit-btn" @click="router.back()">
          返回
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { NBreadcrumb, NBreadcrumbItem, NButton, NInput, NIcon } from 'naive-ui'
import { LogoAlipay, LogoWechat } from '@vicons/ionicons5'

const router = useRouter()

const amountOptions = [100, 200, 500, 1000, 2000, 5000]
const selectedAmount = ref<number | null>(100)
const customAmount = ref('')
const isCustomAmount = ref(false)

const paymentMethods = [
  { key: 'alipay', label: '支付宝', icon: LogoAlipay },
  { key: 'wechat', label: '微信支付', icon: LogoWechat },
]
const selectedPayment = ref('alipay')

const finalAmount = computed(() => {
  if (isCustomAmount.value && customAmount.value) {
    return parseFloat(customAmount.value) || 0
  }
  return selectedAmount.value || 0
})

function handleCustomBlur() {
  if (!customAmount.value) {
    isCustomAmount.value = false
    selectedAmount.value = amountOptions[0]
  }
}

function handleSubmit() {
  console.log('充值', finalAmount.value, selectedPayment.value)
}
</script>

<style scoped>
.account-recharge-page {
  padding: 20px 24px;
}

.page-breadcrumb {
  margin-bottom: 16px;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.recharge-card {
  background: white;
  border-radius: 12px;
  padding: 32px;
  max-width: 640px;
}

.recharge-section {
  margin-bottom: 28px;
}

.section-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.account-type {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.amount-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.amount-option {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  transition: all 0.2s;
}

.amount-option:hover {
  border-color: var(--color-primary-light);
}

.amount-option.active {
  border-color: var(--color-primary);
  background: rgba(59, 130, 246, 0.06);
  color: var(--color-primary);
}

.amount-option.custom {
  padding: 0 8px;
}

.amount-option.custom :deep(.n-input) {
  --n-border: none !important;
  --n-border-focus: none !important;
  --n-border-hover: none !important;
  background: transparent;
}

.payment-options {
  display: flex;
  gap: 12px;
}

.payment-option {
  flex: 1;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-primary);
  transition: all 0.2s;
}

.payment-option:hover {
  border-color: var(--color-primary-light);
}

.payment-option.active {
  border-color: var(--color-primary);
  background: rgba(59, 130, 246, 0.06);
  color: var(--color-primary);
}

.recharge-summary {
  padding: 16px 0;
  border-top: 1px solid var(--border-color);
  margin-bottom: 24px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--text-secondary);
}

.summary-value {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

.recharge-actions {
  display: flex;
  gap: 16px;
}

.submit-btn {
  min-width: 140px;
}
</style>
