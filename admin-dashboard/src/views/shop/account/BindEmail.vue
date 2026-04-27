<template>
  <div class="page-container">
    <n-breadcrumb class="page-breadcrumb">
      <n-breadcrumb-item>主页</n-breadcrumb-item>
      <n-breadcrumb-item>用户设置</n-breadcrumb-item>
      <n-breadcrumb-item>绑定邮箱</n-breadcrumb-item>
    </n-breadcrumb>

    <div class="page-header">
      <h1 class="page-title">绑定邮箱</h1>
    </div>

    <div class="bind-card">
      <div class="bind-section">
        <h3 class="section-title">邮箱绑定</h3>
        <div class="bind-content">
          <div class="bind-status" v-if="isBound">
            <div class="status-icon success">
              <n-icon :component="CheckmarkCircleOutline" size="48" />
            </div>
            <div class="status-text">
              <h4>已绑定邮箱</h4>
              <p class="email-info">当前邮箱：wangxiaoya@touhaokongjian.com</p>
              <n-button type="error" size="small" class="unbind-btn">
                解除绑定
              </n-button>
            </div>
          </div>
          <div class="bind-status" v-else>
            <div class="status-icon">
              <n-icon :component="AlertCircleOutline" size="48" />
            </div>
            <div class="status-text">
              <h4>未绑定邮箱</h4>
              <p class="bind-tip">绑定邮箱后，您可以通过邮箱重置密码，接收系统邮件通知</p>
              <div class="bind-form">
                <div class="form-item">
                  <n-input
                    v-model:value="email"
                    label="邮箱地址"
                    placeholder="请输入邮箱地址"
                    :validate-event="false"
                  />
                  <n-input
                    v-model:value="verificationCode"
                    label="验证码"
                    placeholder="请输入验证码"
                    :validate-event="false"
                  >
                    <template #append>
                      <n-button 
                        type="primary" 
                        size="small" 
                        :disabled="isSending"
                        @click="sendVerificationCode"
                      >
                        {{ isSending ? '发送中...' : '发送验证码' }}
                      </n-button>
                    </template>
                  </n-input>
                </div>
                <div class="form-actions">
                  <n-button type="primary" @click="bindEmail">
                    绑定邮箱
                  </n-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bind-section">
        <h3 class="section-title">绑定说明</h3>
        <div class="bind-guide">
          <div class="guide-item">
            <div class="guide-number">1</div>
            <div class="guide-content">
              <h4>输入邮箱</h4>
              <p>输入您要绑定的邮箱地址</p>
            </div>
          </div>
          <div class="guide-item">
            <div class="guide-number">2</div>
            <div class="guide-content">
              <h4>获取验证码</h4>
              <p>点击发送验证码，系统会向您的邮箱发送验证码</p>
            </div>
          </div>
          <div class="guide-item">
            <div class="guide-number">3</div>
            <div class="guide-content">
              <h4>输入验证码</h4>
              <p>输入邮箱收到的验证码，点击绑定邮箱</p>
            </div>
          </div>
        </div>
      </div>

      <div class="bind-section">
        <h3 class="section-title">绑定优势</h3>
        <div class="advantages-grid">
          <div class="advantage-item">
            <div class="advantage-icon">
              <n-icon :component="LockClosedOutline" size="24" />
            </div>
            <div class="advantage-content">
              <h4>密码重置</h4>
              <p>忘记密码时，可通过邮箱重置密码</p>
            </div>
          </div>
          <div class="advantage-item">
            <div class="advantage-icon">
              <n-icon :component="MailOutline" size="24" />
            </div>
            <div class="advantage-content">
              <h4>邮件通知</h4>
              <p>重要系统通知通过邮件发送，及时了解系统动态</p>
            </div>
          </div>
          <div class="advantage-item">
            <div class="advantage-icon">
              <n-icon :component="ShieldCheckmarkOutline" size="24" />
            </div>
            <div class="advantage-content">
              <h4>账号安全</h4>
              <p>邮箱验证，提高账号安全性</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NBreadcrumb, NBreadcrumbItem, NIcon, NButton, NInput } from 'naive-ui'
import { CheckmarkCircleOutline, AlertCircleOutline, LockClosedOutline, MailOutline, ShieldCheckmarkOutline } from '@vicons/ionicons5'

const isBound = ref(true)
const email = ref('')
const verificationCode = ref('')
const isSending = ref(false)

function sendVerificationCode() {
  if (!email.value) return
  isSending.value = true
  // 模拟发送验证码
  setTimeout(() => {
    isSending.value = false
  }, 2000)
}

function bindEmail() {
  // 模拟绑定邮箱
  isBound.value = true
}
</script>

<style scoped>
.page-container {
  padding: 20px 24px;
}

.page-breadcrumb {
  margin-bottom: 16px;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.bind-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid var(--border-color);
}

.bind-section {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}

.bind-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 16px 0;
}

.bind-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.bind-status {
  display: flex;
  align-items: center;
  gap: 24px;
  width: 100%;
  max-width: 600px;
  padding: 24px;
  background: var(--color-bg-elevated);
  border-radius: 12px;
}

.status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--color-bg-elevated);
  color: var(--text-secondary);
}

.status-icon.success {
  background: rgba(16, 185, 129, 0.1);
  color: #10B981;
}

.status-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-text h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.email-info {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.unbind-btn {
  margin-top: 8px;
  align-self: flex-start;
}

.bind-tip {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0 0 16px 0;
}

.bind-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.bind-guide {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.guide-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: var(--color-bg-elevated);
  border-radius: 8px;
}

.guide-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #3B82F6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
  margin-top: 2px;
}

.guide-content h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.guide-content p {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.advantages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.advantage-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--color-bg-elevated);
  border-radius: 8px;
}

.advantage-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(59, 130, 246, 0.1);
  color: #3B82F6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.advantage-content h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.advantage-content p {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0;
}
</style>
