<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <span>充值活动</span>
      </template>
      <div class="activity-grid">
        <div v-for="activity in activities" :key="activity.id" class="activity-card">
          <div class="activity-info">
            <div class="activity-title">{{ activity.title }}</div>
            <div class="activity-subtitle">{{ activity.subtitle }}</div>
          </div>
          <div class="activity-bonus">
            <span class="bonus-tag">送</span>
            <span class="bonus-value"><span class="currency-symbol">¥</span>{{ activity.bonus }}</span>
          </div>
          <el-button type="primary" @click="handleRecharge(activity)">立即充值</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'

const activities = [
  { id: 1, title: '首次充值', subtitle: '充多少送多少，最高50元', bonus: 50 },
  { id: 2, title: '充值满200', subtitle: '赠送30元', bonus: 30 },
  { id: 3, title: '充值满500', subtitle: '赠送100元', bonus: 100 },
  { id: 4, title: '充值满1000', subtitle: '赠送300元', bonus: 300 },
]

const handleRecharge = (activity) => {
  ElMessage.success(`选择充值活动: ${activity.title}`)
}
</script>

<style scoped>
.activity-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.activity-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 24px;
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-title {
  font-size: 20px;
  font-weight: 600;
}

.activity-subtitle {
  font-size: 14px;
  opacity: 0.9;
}

.activity-bonus {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.bonus-tag {
  font-size: 14px;
}

.bonus-value {
  font-size: 36px;
  font-weight: 700;
}

.activity-card .el-button {
  width: fit-content;
  background: rgba(255, 255, 255, 0.2);
  border: none;
}

.activity-card .el-button:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
