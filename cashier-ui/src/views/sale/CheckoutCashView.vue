<template>
  <div class="checkout-page">
    <el-card class="checkout-card">
      <div class="checkout-header">
        <h2>现金收款</h2>
      </div>
      
      <div class="order-info">
        <div class="info-row">
          <span class="label">商品数量</span>
          <span class="value">3 件</span>
        </div>
        <div class="info-row">
          <span class="label">商品合计</span>
          <span class="value"><span class="currency-symbol">¥</span>{{ 68 * 3 }}</span>
        </div>
        <div class="info-row discount">
          <span class="label">优惠</span>
          <span class="value">-<span class="currency-symbol">¥</span>0</span>
        </div>
        <div class="info-row total">
          <span class="label">应付金额</span>
          <span class="value price"><span class="currency-symbol">¥</span>204</span>
        </div>
      </div>

      <div class="payment-section">
        <div class="payment-methods">
          <div class="method-item active">
            <el-icon size="32"><Money /></el-icon>
            <span>现金</span>
          </div>
          <div class="method-item">
            <el-icon size="32"><CreditCard /></el-icon>
            <span>支付宝</span>
          </div>
          <div class="method-item">
            <el-icon size="32"><Wallet /></el-icon>
            <span>微信</span>
          </div>
        </div>
      </div>

      <div class="amount-section">
        <div class="amount-row">
          <span>实收金额</span>
          <el-input-number v-model="receivedAmount" :min="0" :step="10" size="large" />
        </div>
        <div class="amount-row change">
          <span>找零</span>
          <span class="change-value"><span class="currency-symbol">¥</span>{{ Math.max(0, receivedAmount - 204) }}</span>
        </div>
      </div>

      <div class="actions">
        <el-button size="large" @click="$router.back()">返回</el-button>
        <el-button type="primary" size="large" @click="handleComplete">确认收款</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Money, CreditCard, Wallet } from '@element-plus/icons-vue'

const router = useRouter()
const receivedAmount = ref(204)

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
}

.checkout-header {
  text-align: center;
  margin-bottom: 30px;
}

.checkout-header h2 {
  font-size: 24px;
}

.order-info {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 16px;
}

.info-row.discount {
  color: #67c23a;
}

.info-row.total {
  font-size: 18px;
  font-weight: 600;
  border-top: 1px solid #ddd;
  padding-top: 12px;
  margin-top: 8px;
}

.price {
  font-size: 24px;
  color: #ff6b6b;
}

.payment-methods {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.method-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.method-item:hover {
  background: #e8f4ff;
}

.method-item.active {
  border-color: #409eff;
  background: #ecf5ff;
}

.amount-section {
  margin-bottom: 30px;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: 16px;
}

.amount-row.change {
  font-size: 20px;
  font-weight: 600;
  color: #67c23a;
}

.change-value {
  font-size: 28px;
  color: #67c23a;
}

.actions {
  display: flex;
  gap: 16px;
}

.actions .el-button {
  flex: 1;
  height: 50px;
  font-size: 16px;
}
</style>
