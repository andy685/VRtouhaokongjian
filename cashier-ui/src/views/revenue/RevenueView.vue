<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>营收概览</span>
          <div class="header-actions">
            <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
            <el-button @click="$router.push('/revenue/by-clerk')">按收银员</el-button>
            <el-button @click="$router.push('/revenue/by-payment')">按支付方式</el-button>
          </div>
        </div>
      </template>
      
      <el-row :gutter="20" class="stat-cards">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon blue"><el-icon><Money /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">¥12,580</div>
              <div class="stat-label">今日营收</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon green"><el-icon><TrendCharts /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">¥8,320</div>
              <div class="stat-label">储值收入</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon orange"><el-icon><ShoppingCart /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">¥4,260</div>
              <div class="stat-label">消费收入</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon purple"><el-icon><User /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">86</div>
              <div class="stat-label">消费人次</div>
            </div>
          </div>
        </el-col>
      </el-row>
      
      <div class="chart-section">
        <h4>近7天营收趋势</h4>
        <div class="chart-placeholder">
          <el-icon size="48"><DataLine /></el-icon>
          <p>图表区域</p>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Money, TrendCharts, ShoppingCart, User, DataLine } from '@element-plus/icons-vue'

const dateRange = ref([])
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.stat-cards {
  margin-bottom: 30px;
}

.stat-card {
  background: #f5f7fa;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
}

.stat-icon.blue { background: linear-gradient(135deg, #667eea, #764ba2); }
.stat-icon.green { background: linear-gradient(135deg, #11998e, #38ef7d); }
.stat-icon.orange { background: linear-gradient(135deg, #f093fb, #f5576c); }
.stat-icon.purple { background: linear-gradient(135deg, #4facfe, #00f2fe); }

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #999;
}

.chart-section {
  margin-top: 30px;
}

.chart-section h4 {
  margin-bottom: 16px;
}

.chart-placeholder {
  background: #f5f7fa;
  border-radius: 12px;
  padding: 60px;
  text-align: center;
  color: #999;
}
</style>
