<template>
  <div class="success-page">
    <div class="success-content">
      <div class="success-icon">
        <el-icon><CircleCheckFilled /></el-icon>
      </div>
      <h2>支付成功</h2>
      <div class="amount"><span class="currency-symbol">¥</span>500</div>
      <div class="gift">赠送 <span class="currency-symbol">¥</span>50</div>
      <div class="balance">当前余额: <span class="currency-symbol">¥</span>550</div>
      <div class="actions">
        <el-button type="primary" size="large" @click="$router.push('/sale')">继续收款</el-button>
        <el-button size="large" @click="$router.push('/member')">返回会员</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { CircleCheckFilled } from '@element-plus/icons-vue'
</script>

<style scoped>
.success-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 140px);
}

.success-content {
  text-align: center;
  background: #fff;
  border-radius: 16px;
  padding: 60px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.success-icon {
  font-size: 80px;
  color: #67c23a;
  margin-bottom: 20px;
}

h2 {
  font-size: 28px;
  margin-bottom: 20px;
}

.amount {
  font-size: 48px;
  font-weight: 700;
  color: #ff6b6b;
  margin-bottom: 10px;
}

.gift {
  font-size: 18px;
  color: #67c23a;
  margin-bottom: 10px;
}

.balance {
  font-size: 16px;
  color: #999;
  margin-bottom: 40px;
}

.actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.actions .el-button {
  height: 50px;
  padding: 0 40px;
  font-size: 16px;
}
</style>
