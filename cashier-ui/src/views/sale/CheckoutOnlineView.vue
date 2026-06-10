<template>
  <div class="checkout-page">
    <el-card class="checkout-card">
      <div class="checkout-header">
        <h2>扫码支付</h2>
      </div>
      
      <div class="qr-section">
        <div class="qr-code">
          <img :src="`${BASE_URL}qr-placeholder.svg`" alt="支付二维码" />
        </div>
        <div class="qr-info">
          <p>请使用支付宝或微信扫码支付</p>
          <p class="amount"><span class="currency-symbol">¥</span>204.00</p>
        </div>
      </div>

      <div class="payment-methods">
        <div class="method-item active">
          <el-icon size="32"><CreditCard /></el-icon>
          <span>支付宝</span>
        </div>
        <div class="method-item">
          <el-icon size="32"><Wallet /></el-icon>
          <span>微信</span>
        </div>
      </div>

      <div class="countdown">
        <p>支付剩余时间</p>
        <div class="time">{{ formattedTime }}</div>
      </div>

      <div class="actions">
        <el-button size="large" @click="$router.back()">返回</el-button>
        <el-button type="primary" size="large" @click="handleComplete">已完成支付</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { CreditCard, Wallet } from '@element-plus/icons-vue'

const BASE_URL = import.meta.env.BASE_URL

const router = useRouter()
const remainingSeconds = ref(300) // 5分钟

const formattedTime = computed(() => {
  const mins = Math.floor(remainingSeconds.value / 60)
  const secs = remainingSeconds.value % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
})

const handleComplete = () => {
  router.push('/result/recharge-success')
}
</script>

<style scoped>
.checkout-page {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.checkout-card {
  width: 500px;
  text-align: center;
}

.checkout-header {
  margin-bottom: 30px;
}

.checkout-header h2 {
  font-size: 24px;
}

.qr-section {
  margin-bottom: 30px;
}

.qr-code {
  width: 200px;
  height: 200px;
  background: #f5f7fa;
  border-radius: 8px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-info p {
  margin-bottom: 8px;
  color: #666;
}

.amount {
  font-size: 32px;
  font-weight: 700;
  color: #ff6b6b;
}

.payment-methods {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 30px;
}

.method-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 32px;
  background: #f5f7fa;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid transparent;
}

.method-item:hover,
.method-item.active {
  border-color: #409eff;
  background: #ecf5ff;
}

.countdown {
  margin-bottom: 30px;
}

.countdown p {
  color: #999;
  margin-bottom: 8px;
}

.time {
  font-size: 36px;
  font-weight: 700;
  color: #409eff;
}

.actions {
  display: flex;
  gap: 16px;
}

.actions .el-button {
  flex: 1;
  height: 50px;
}
</style>
