<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <span>交班对账</span>
      </template>
      
      <div class="shift-info">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="交班人">张三</el-descriptions-item>
          <el-descriptions-item label="接班人">李四</el-descriptions-item>
          <el-descriptions-item label="上班时间">2024-01-15 09:00:00</el-descriptions-item>
          <el-descriptions-item label="当前时间">2024-01-15 18:00:00</el-descriptions-item>
        </el-descriptions>
        
        <div class="summary">
          <h4>收款汇总</h4>
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="summary-item">
                <div class="label">订单数</div>
                <div class="value">45</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="summary-item">
                <div class="label">收款总额</div>
                <div class="value"><span class="currency-symbol">¥</span>5,060</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="summary-item">
                <div class="label">现金收款</div>
                <div class="value"><span class="currency-symbol">¥</span>1,680</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="summary-item">
                <div class="label">线上收款</div>
                <div class="value"><span class="currency-symbol">¥</span>3,380</div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
      
      <div class="actions">
        <el-button @click="$router.back()">取消</el-button>
        <el-button type="primary" size="large" @click="$router.push('/shift/next')">下一步</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
</script>

<style scoped>
.shift-info {
  margin-bottom: 30px;
}

.summary {
  margin-top: 30px;
}

.summary h4 {
  margin-bottom: 16px;
}

.summary-item {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.summary-item .label {
  font-size: 14px;
  color: #999;
  margin-bottom: 8px;
}

.summary-item .value {
  font-size: 24px;
  font-weight: 700;
  color: #333;
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
