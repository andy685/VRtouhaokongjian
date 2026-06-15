<template>
  <div class="recharge-page">
    <div class="recharge-header">
      <n-button text @click="router.back()">
        <template #icon><n-icon><ChevronBack /></n-icon></template>
        返回
      </n-button>
    </div>

    <div class="recharge-card">
      <!-- 充值对象 -->
      <div class="section">
        <div class="section-label">充值对象</div>
        <n-select
          v-model:value="rechargeObject"
          :options="rechargeObjectOptions"
          placeholder="选择充值对象"
          style="max-width: 320px;"
        />
      </div>

      <!-- 账户余额 -->
      <div class="section section-balance">
        <div class="section-label">游戏豆余额</div>
        <div class="balance-display">
          <span class="balance-value">0</span>
          <span class="balance-unit">游戏豆</span>
        </div>
      </div>

      <!-- 充值金额选择 -->
      <div class="section">
        <div class="section-label">选择充值金额</div>
        <div class="amount-grid">
          <div
            v-for="amount in amountOptions"
            :key="amount"
            class="amount-card"
            :class="{ active: selectedAmount === amount }"
            @click="selectAmount(amount)"
          >
            <div class="card-amount">¥{{ amount.toLocaleString() }}</div>
            <div class="card-beans">{{ amount.toLocaleString() }} 游戏豆</div>
          </div>
        </div>
      </div>

      <!-- 自定义金额 -->
      <div class="section">
        <div class="section-label">自定义金额</div>
        <n-input-number
          v-model:value="customAmount"
          :min="1"
          :step="100"
          placeholder="输入任意金额"
          style="max-width: 260px;"
        >
          <template #prefix>¥</template>
          <template #suffix>元</template>
        </n-input-number>
        <span class="form-hint">1元 = 1游戏豆，最低充值 ¥1</span>
      </div>

      <!-- 支付信息汇总 -->
      <div class="section">
        <div class="section-label">支付汇总</div>
        <div class="summary-box">
          <div class="summary-row">
            <span>充值金额</span>
            <span class="sum-value">¥{{ finalAmount.toLocaleString() }}</span>
          </div>
          <div class="summary-row">
            <span>到账游戏豆</span>
            <span class="sum-value sum-beans">{{ finalAmount.toLocaleString() }} 豆</span>
          </div>
        </div>
      </div>

      <!-- 支付方式 -->
      <div class="section">
        <div class="section-label">支付方式</div>
        <div class="payment-methods">
          <div
            v-for="m in paymentMethods"
            :key="m.key"
            class="pay-option"
            :class="{ active: selectedPayment === m.key }"
            @click="selectedPayment = m.key"
          >
            <n-icon :component="m.icon" size="22" />
            <span>{{ m.label }}</span>
          </div>
        </div>
      </div>

      <!-- 提交 -->
      <div class="section section-submit">
        <n-button
          type="primary"
          size="large"
          :disabled="!finalAmount || !rechargeObject"
          :loading="submitting"
          @click="handleSubmit"
          style="min-width: 200px;"
        >
          立即充值 ¥{{ finalAmount.toLocaleString() || '—' }}
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NInputNumber, NIcon, NSelect, useMessage } from 'naive-ui'
import { LogoAlipay, LogoWechat, ChevronBack } from '@vicons/ionicons5'

const router = useRouter()
const message = useMessage()
const submitting = ref(false)

// 充值对象
const rechargeObject = ref<string | null>(null)
const rechargeObjectOptions = [
  { label: '头号空间商家名称（通用账户）', value: 'universal' },
  { label: '党建馆专属', value: '6288' },
  { label: '华东展厅专属', value: '5764' },
  { label: '恒然分部展厅专属', value: '5760' },
  { label: '利民街大展厅专属', value: '5759' },
  { label: '利民街小展厅专属', value: '5077' },
]

// 充值档位（1元 = 1游戏豆，无赠送）
const amountOptions = [200, 500, 1000, 2000, 5000, 10000]

const selectedAmount = ref<number | null>(null)
const customAmount = ref<number | null>(null)

function selectAmount(amount: number) {
  selectedAmount.value = amount
  customAmount.value = amount
}

const finalAmount = computed(() => customAmount.value || selectedAmount.value || 0)

// 支付方式
const paymentMethods = [
  { key: 'alipay', label: '支付宝', icon: LogoAlipay },
  { key: 'wechat', label: '微信支付', icon: LogoWechat },
]
const selectedPayment = ref('wechat')

function handleSubmit() {
  submitting.value = true
  setTimeout(() => {
    submitting.value = false
    message.success(`成功充值 ¥${finalAmount.value}，到账 ${finalAmount.value} 游戏豆`)
    router.back()
  }, 1000)
}
</script>

<style scoped>
.recharge-page {
  padding: 20px 24px;
  background: #f5f7fa;
  min-height: calc(100vh - 64px);
}
.recharge-header {
  margin-bottom: 20px;
}

.recharge-card {
  background: white;
  border-radius: 16px;
  padding: 36px 40px;
  max-width: 780px;
}

.section {
  margin-bottom: 28px;
}
.section-balance {
  display: flex;
  align-items: center;
  gap: 20px;
}
.section-submit {
  padding-top: 24px;
  border-top: 1px solid var(--border-color, #eee);
  text-align: center;
}

.section-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary, #666);
  margin-bottom: 10px;
  flex-shrink: 0;
}

/* 余额 */
.balance-display {
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.balance-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary, #1a1a1a);
}
.balance-unit {
  font-size: 14px;
  color: var(--text-muted, #999);
}

/* 金额卡片网格 */
.amount-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
.amount-card {
  position: relative;
  padding: 24px 16px 20px;
  border: 1.5px solid var(--border-color, #e5e5e5);
  border-radius: 12px;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
  background: #fafbfc;
}
.amount-card:hover {
  border-color: #93c5fd;
  background: #f0f7ff;
}
.amount-card.active {
  border-color: #3B82F6;
  background: #eff6ff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, .12);
}
.card-amount {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary, #1a1a1a);
  margin-bottom: 6px;
}
.amount-card.active .card-amount {
  color: #3B82F6;
}
.card-beans {
  font-size: 13px;
  color: var(--text-secondary, #555);
}

/* 自定义金额 */
.form-hint {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-muted, #999);
}

/* 支付汇总 */
.summary-box {
  background: #f8fafc;
  border-radius: 10px;
  padding: 18px 24px;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: var(--text-secondary, #555);
  padding: 4px 0;
}
.summary-row + .summary-row {
  border-top: 1px dashed #e2e8f0;
  margin-top: 4px;
  padding-top: 10px;
}
.sum-value {
  font-weight: 600;
  color: var(--text-primary, #1a1a1a);
}
.sum-beans {
  font-size: 18px;
  color: #3B82F6;
}

/* 支付方式 */
.payment-methods {
  display: flex;
  gap: 12px;
  max-width: 360px;
}
.pay-option {
  flex: 1;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1.5px solid var(--border-color, #e5e5e5);
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-primary, #1a1a1a);
  transition: all 0.2s;
  background: #fafbfc;
}
.pay-option:hover {
  border-color: #93c5fd;
}
.pay-option.active {
  border-color: #3B82F6;
  background: #eff6ff;
  color: #3B82F6;
  font-weight: 500;
}
</style>
