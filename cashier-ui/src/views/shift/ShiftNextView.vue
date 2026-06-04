<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <span>交班对账 - 现金清点</span>
      </template>
      
      <div class="cash-count">
        <h4>请清点现金并录入</h4>
        <el-form :model="form" label-width="100px" class="cash-form">
          <el-form-item label="100元">
            <el-input-number v-model="form.m100" :min="0" @change="calculate" /> 张 = <span class="currency-symbol">¥</span>{{ form.m100 * 100 }}
          </el-form-item>
          <el-form-item label="50元">
            <el-input-number v-model="form.m50" :min="0" @change="calculate" /> 张 = <span class="currency-symbol">¥</span>{{ form.m50 * 50 }}
          </el-form-item>
          <el-form-item label="20元">
            <el-input-number v-model="form.m20" :min="0" @change="calculate" /> 张 = <span class="currency-symbol">¥</span>{{ form.m20 * 20 }}
          </el-form-item>
          <el-form-item label="10元">
            <el-input-number v-model="form.m10" :min="0" @change="calculate" /> 张 = <span class="currency-symbol">¥</span>{{ form.m10 * 10 }}
          </el-form-item>
          <el-form-item label="5元">
            <el-input-number v-model="form.m5" :min="0" @change="calculate" /> 张 = <span class="currency-symbol">¥</span>{{ form.m5 * 5 }}
          </el-form-item>
          <el-form-item label="1元">
            <el-input-number v-model="form.m1" :min="0" @change="calculate" /> 张 = <span class="currency-symbol">¥</span>{{ form.m1 * 1 }}
          </el-form-item>
          <el-form-item label="硬币">
            <el-input-number v-model="form.coin" :min="0" :step="0.1" /> 元
          </el-form-item>
          <el-divider />
          <el-form-item label="实收现金">
            <span class="total-cash"><span class="currency-symbol">¥</span>{{ totalCash }}</span>
          </el-form-item>
          <el-form-item label="应收现金">
            <span class="expected-cash"><span class="currency-symbol">¥</span>1,680</span>
          </el-form-item>
          <el-form-item label="差额">
            <span :class="diff >= 0 ? 'positive' : 'negative'">{{ diff >= 0 ? '+' : '' }}{{ diff }}</span>
          </el-form-item>
        </el-form>
      </div>
      
      <div class="actions">
        <el-button @click="$router.back()">返回</el-button>
        <el-button type="primary" size="large" @click="completeShift">确认交班</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'

const form = reactive({
  m100: 10,
  m50: 5,
  m20: 8,
  m10: 10,
  m5: 5,
  m1: 10,
  coin: 5
})

const totalCash = computed(() => {
  return form.m100 * 100 + form.m50 * 50 + form.m20 * 20 + form.m10 * 10 + form.m5 * 5 + form.m1 * 1 + form.coin
})

const diff = computed(() => {
  return totalCash.value - 1680
})

const calculate = () => {}

const completeShift = () => {
  ElMessage.success('交班成功')
}
</script>

<style scoped>
.cash-count h4 {
  margin-bottom: 20px;
}

.cash-form {
  max-width: 400px;
}

.total-cash {
  font-size: 24px;
  font-weight: 700;
  color: #409eff;
}

.expected-cash {
  font-size: 18px;
  color: #666;
}

.positive {
  color: #67c23a;
  font-weight: 600;
}

.negative {
  color: #f56c6c;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 30px;
}

.actions .el-button {
  height: 50px;
  padding: 0 60px;
  font-size: 16px;
}
</style>
