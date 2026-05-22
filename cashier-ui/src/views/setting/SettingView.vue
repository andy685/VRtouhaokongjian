<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <span>系统设置</span>
      </template>
      
      <el-menu :default-active="activeMenu" router>
        <el-menu-item index="/setting/basic">
          <el-icon><Setting /></el-icon>
          <span>基础设置</span>
        </el-menu-item>
        <el-menu-item index="/setting/member">
          <el-icon><User /></el-icon>
          <span>会员设置</span>
        </el-menu-item>
        <el-menu-item index="/setting/staff-card">
          <el-icon><Postcard /></el-icon>
          <span>员工卡设置</span>
        </el-menu-item>
      </el-menu>
      
      <div class="setting-content">
        <router-view />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Setting, User, Postcard } from '@element-plus/icons-vue'

const activeMenu = ref('/setting/basic')
</script>

<style scoped>
.el-card {
  min-height: calc(100vh - 140px);
}

.setting-content {
  margin-top: 20px;
  padding: 20px 0;
}
</style>
