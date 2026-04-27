<template>
  <div class="account-recharge-page">
    <div class="recharge-header">
      <div class="back-button">
        <n-button text @click="router.back()">
          <n-icon><ChevronBack /></n-icon>
          返回
        </n-button>
      </div>
    </div>



    <div class="recharge-card">
      <div class="recharge-section">
        <div class="section-label">充值对象</div>
        <div class="recharge-object">
          <select v-model="rechargeObject" class="recharge-select" style="width: 300px; padding: 8px; border: 1px solid #d9d9d9; border-radius: 4px;">
            <option value="">选择充值对象</option>
            <option value="universal">头号空间商家名称（通用账户）</option>
            <option value="6288">党建馆专属</option>
            <option value="5764">华东展厅专属</option>
            <option value="5760">恒然分部展厅专属</option>
            <option value="5759">利民街大展厅专属</option>
            <option value="5077">利民街小展厅专属</option>
          </select>
        </div>
      </div>

      <div class="recharge-section">
        <div class="section-label">游戏豆账户</div>
        <div class="game-bean-account">0</div>
      </div>

      <div class="recharge-section">
        <div class="section-label">充值金额</div>
        <div class="amount-input">
          <n-input
            v-model:value="customAmount"
            placeholder="3000"
            class="amount-input-field"
          >
            <template #prefix>¥</template>
            <template #suffix>元（1元=10游戏豆）</template>
          </n-input>
        </div>
        <div class="recharge-activities">
          <div
            v-for="activity in rechargeActivities"
            :key="activity.amount"
            class="activity-option"
            :class="{ active: selectedAmount === activity.amount }"
            @click="selectActivity(activity)"
          >
            <div class="activity-amount">{{ activity.amount }}</div>
            <div class="activity-desc">{{ activity.description }}</div>
          </div>
        </div>
      </div>

      <div class="recharge-section">
        <div class="section-label">支付金额</div>
        <div class="payment-amount-info">
          <span class="payment-amount">{{ finalAmount }}元</span>
          <span class="payment-info">到账游戏豆{{ finalAmount * 10 }}游戏豆</span>
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

      <div class="recharge-actions">
        <n-button type="primary" size="large" class="submit-btn" :disabled="!finalAmount || !rechargeObject" @click="handleSubmit">
          立即充值
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { NBreadcrumb, NBreadcrumbItem, NButton, NInput, NIcon, NSelect } from 'naive-ui'
import { LogoAlipay, LogoWechat, ChevronBack } from '@vicons/ionicons5'

const router = useRouter()

const rechargeObject = ref('')

const rechargeOptions = [
  { value: 'universal', label: '游戏豆通用账户' },
  { value: '6288', label: '党建馆专属' },
  { value: '5764', label: '华东展厅专属' },
  { value: '5760', label: '恒然分部展厅专属' },
  { value: '5759', label: '利民街大展厅专属' },
  { value: '5077', label: '利民街小展厅专属' },
]

const amountOptions = [20, 200, 500, 1000, 3000, 5000]
const selectedAmount = ref<number | null>(3000)
const customAmount = ref('3000')
const isCustomAmount = ref(false)

const rechargeActivities = [
  { amount: 3000, description: '特惠赠送1800游戏豆+限时加赠2200游戏豆' },
  { amount: 1000, description: '特惠赠送300游戏豆+限时加赠700游戏豆' },
  { amount: 500, description: '特惠赠送100游戏豆+限时加赠100游戏豆' },
  { amount: 200, description: '' },
  { amount: 20, description: '' },
]

function selectActivity(activity: { amount: number; description: string }) {
  selectedAmount.value = activity.amount
  customAmount.value = activity.amount.toString()
  isCustomAmount.value = false
}

const paymentMethods = [
  { key: 'alipay', label: '支付宝', icon: LogoAlipay },
  { key: 'wechat', label: '微信支付', icon: LogoWechat },
]
const selectedPayment = ref('wechat')

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
  const rechargeData = {
    accountType: 'game-bean',
    amount: finalAmount.value,
    payment: selectedPayment.value,
    object: rechargeObject.value,
    gameBeans: finalAmount.value * 10
  }
  
  console.log('充值', rechargeData)
  
  // 这里可以添加实际的充值逻辑
  // 例如：调用API进行充值
  
  // 充值成功后返回上一页
  setTimeout(() => {
    router.back()
  }, 1000)
}
</script>

<style scoped>
.account-recharge-page {
  padding: 20px 24px;
  background: white;
  min-height: calc(100vh - 64px);
}

.recharge-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.back-button {
  display: flex;
  align-items: center;
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
  width: 100%;
  max-width: 800px;
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

.amount-input {
  margin-bottom: 16px;
}

.amount-input-field {
  width: 200px;
}

.recharge-activities {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.activity-option {
  padding: 20px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.activity-option:hover {
  border-color: var(--color-primary-light);
}

.activity-option.active {
  border-color: var(--color-primary);
  background: rgba(59, 130, 246, 0.06);
  color: var(--color-primary);
}

.activity-amount {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.activity-desc {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.object-select {
  width: 200px;
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

/* 游戏豆充值样式 */
.game-bean-account {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.amount-input {
  margin-bottom: 16px;
}

.amount-input-field {
  width: 200px;
}

.recharge-activities {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.activity-option {
  padding: 20px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.activity-option:hover {
  border-color: var(--color-primary-light);
}

.activity-option.active {
  border-color: var(--color-primary);
  background: rgba(59, 130, 246, 0.06);
  color: var(--color-primary);
}

.activity-amount {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.activity-desc {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.object-select {
  width: 200px;
}

.payment-amount-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.payment-amount {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.payment-info {
  font-size: 14px;
  color: var(--text-secondary);
}
</style>
