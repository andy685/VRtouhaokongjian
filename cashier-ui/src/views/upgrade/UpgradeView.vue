<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <span>系统升级</span>
      </template>
      
      <div class="upgrade-content">
        <div class="current-version">
          <div class="version-label">当前版本</div>
          <div class="version-number">v2.1.0</div>
          <div class="version-date">2024-01-10</div>
        </div>
        
        <div class="upgrade-info">
          <h4>最新版本: v2.2.0</h4>
          <ul>
            <li>新增会员积分兑换功能</li>
            <li>优化收银界面交互</li>
            <li>修复若干已知问题</li>
          </ul>
        </div>
        
        <div class="actions">
          <el-button type="primary" size="large">检查更新</el-button>
          <el-button size="large" @click="$router.back()">返回</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
</script>

<style scoped>
.upgrade-content {
  text-align: center;
  padding: 40px;
}

.current-version {
  background: #f5f7fa;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 40px;
}

.version-label {
  font-size: 14px;
  color: #999;
  margin-bottom: 8px;
}

.version-number {
  font-size: 36px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.version-date {
  font-size: 14px;
  color: #999;
}

.upgrade-info {
  background: #ecf5ff;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 40px;
  text-align: left;
}

.upgrade-info h4 {
  margin-bottom: 16px;
  color: #409eff;
}

.upgrade-info ul {
  padding-left: 20px;
}

.upgrade-info li {
  line-height: 2;
  color: #666;
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
