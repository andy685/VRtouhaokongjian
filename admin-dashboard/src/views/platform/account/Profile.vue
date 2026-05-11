<template>
  <div class="page-container">
    <div class="page-header">
      <h1>个人信息</h1>
      <p class="header-desc">管理您的平台运营账号基本信息</p>
    </div>

    <div class="profile-card">
      <!-- 头像区 -->
      <div class="avatar-section">
        <n-avatar round :size="96" style="background: linear-gradient(135deg, #3B82F6, #8B5CF6); font-size: 36px;">
          {{ formData.name.charAt(0) }}
        </n-avatar>
        <div class="avatar-info">
          <span class="role-tag">平台超管</span>
          <span class="account-id">账号 ID: {{ formData.accountId }}</span>
        </div>
      </div>

      <!-- 表单 -->
      <n-form label-placement="left" label-width="80" style="max-width: 520px; margin-top: 24px;">
        <n-form-item label="姓名">
          <n-input v-model:value="formData.name" placeholder="请输入姓名" style="width: 360px;" />
        </n-form-item>
        <n-form-item label="手机号">
          <n-input v-model:value="formData.phone" placeholder="请输入手机号" style="width: 360px;" />
        </n-form-item>
        <n-form-item label="邮箱">
          <div class="email-row">
            <span :class="{ 'bound': formData.email, 'unbound': !formData.email }">
              {{ formData.email || '未绑定' }}
            </span>
            <n-button v-if="!formData.email" size="small" type="primary">绑定邮箱</n-button>
            <n-button v-else size="small" quaternary type="primary">更换</n-button>
          </div>
        </n-form-item>
        <n-form-item label="所属部门">
          <n-input v-model:value="formData.department" placeholder="请输入部门" style="width: 360px;" />
        </n-form-item>

        <n-form-item label="">
          <n-space>
            <n-button type="primary" @click="handleSave">保存修改</n-button>
            <n-button @click="resetForm">重置</n-button>
          </n-space>
        </n-form-item>
      </n-form>

      <!-- 账号信息 -->
      <div class="info-divider"></div>
      <h3 class="section-title">账号信息</h3>
      <div class="info-grid">
        <div class="info-cell">
          <span class="info-label">角色</span>
          <span class="info-value">平台超级管理员</span>
        </div>
        <div class="info-cell">
          <span class="info-label">权限级别</span>
          <span class="info-value"><n-tag type="error" size="small" bordered>最高权限</n-tag></span>
        </div>
        <div class="info-cell">
          <span class="info-label">创建时间</span>
          <span class="info-value">{{ formData.createdAt }}</span>
        </div>
        <div class="info-cell">
          <span class="info-label">最近登录</span>
          <span class="info-value">{{ formData.lastLogin }}</span>
        </div>
        <div class="info-cell">
          <span class="info-label">登录 IP</span>
          <span class="info-value">{{ formData.lastIp }}</span>
        </div>
        <div class="info-cell">
          <span class="info-label">状态</span>
          <span class="info-value"><n-tag type="success" size="small" bordered>正常</n-tag></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NAvatar, NForm, NFormItem, NInput, NButton, NSpace, NTag, useMessage } from 'naive-ui'

const message = useMessage()

const formData = ref({
  name: '管理员',
  accountId: 'PLT-00001',

  phone: '138****0001',
  email: 'admin@platform.com',
  department: '平台运营部',
  createdAt: '2025-06-15 10:00:00',
  lastLogin: '2026-04-29 23:20:00',
  lastIp: '192.168.1.*',
})

const originalData = { ...formData.value }

function handleSave() {
  message.success('个人信息已更新')
}
function resetForm() {
  formData.value = { ...originalData }
}
</script>

<style scoped>
.page-container { padding: 24px; background: var(--color-bg-base); min-height: calc(100vh - 64px); }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0 0 4px; }
.header-desc { font-size: 14px; color: var(--text-muted); margin: 0; }

.profile-card {
  background: white;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  padding: 28px;
  box-shadow: var(--shadow-sm);
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 16px;
}
.avatar-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.role-tag {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}
.account-id {
  font-size: 12px;
  color: var(--text-muted);
}

.email-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 360px;
}
.email-row .bound { color: var(--text-secondary); font-size: 13px; }
.email-row .unbound { color: #9CA3AF; font-size: 13px; }

.info-divider { height: 1px; background: var(--border-color); margin: 28px 0 16px; }
.section-title { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0 0 16px; }

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.info-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  background: var(--color-bg-base);
  border-radius: 8px;
}
.info-cell .info-label { font-size: 12px; color: var(--text-muted); }
.info-cell .info-value { font-size: 13px; color: var(--text-primary); font-weight: 500; }
</style>
