<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <span>结算 - 现金支付</span>
      </template>
      <div class="settlement-info">
        <div class="info-row">
          <span>应付金额</span>
          <span class="amount">¥204.00</span>
        </div>
        <div class="info-row">
          <span>实收金额</span>
          <el-input-number v-model="received" :min="0" :step="10" size="large" />
        </div>
        <div class="info-row change">
          <span>找零</span>
          <span class="change-value">¥{{ Math.max(0, received - 204) }}</span>
        </div>
      </div>
      <div class="actions">
        <el-button @click="$router.back()">返回</el-button>
        <el-button type="primary" size="large" @click="complete">确认收款</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const received = ref(204)

const complete = () => {
  router.push('/settlement/recharge-success')
}
</script>

<style scoped>
.settlement-info {
  background: #f5f7fa;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  font-size: 18px;
}

.info-row span:first-child {
  color: #666;
}

.amount {
  font-size: 32px;
  font-weight: 700;
  color: #ff6b6b;
}

.change-value {
  font-size: 28px;
  font-weight: 600;
  color: #67c23a;
}

.actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.actions .el-button {
  height: 50px;
  padding: 0 60px;
  font-size: 16px;
}
</style>
