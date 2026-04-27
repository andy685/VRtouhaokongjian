<template>
  <div class="page-container">
    <n-breadcrumb class="page-breadcrumb">
      <n-breadcrumb-item>主页</n-breadcrumb-item>
      <n-breadcrumb-item>用户设置</n-breadcrumb-item>
      <n-breadcrumb-item>绑定微信</n-breadcrumb-item>
    </n-breadcrumb>

    <div class="page-header">
      <h1 class="page-title">绑定微信</h1>
    </div>

    <div class="bind-card">
      <div class="bind-section">
        <h3 class="section-title">微信绑定</h3>
        <div class="bind-content">
          <div class="bind-status" v-if="isBound">
            <div class="status-icon success">
              <n-icon :component="CheckmarkCircleOutline" size="48" />
            </div>
            <div class="status-text">
              <h4>已绑定微信</h4>
              <p class="wechat-info">微信昵称：王小丫</p>
              <p class="wechat-info">微信头像：</p>
              <n-avatar round size="60" :src="wechatAvatar" style="margin: 8px 0;"></n-avatar>
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
              <h4>未绑定微信</h4>
              <p class="bind-tip">绑定微信后，您可以使用微信登录系统，接收微信通知</p>
              <div class="qrcode-section">
                <div class="qrcode">
                  <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
                    <rect width="200" height="200" fill="white" stroke="#e5e7eb" />
                    <text x="100" y="105" font-size="14" text-anchor="middle" fill="#6b7280">微信扫码绑定</text>
                  </svg>
                </div>
                <p class="qrcode-tip">请使用微信扫描二维码进行绑定</p>
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
              <h4>打开微信</h4>
              <p>打开微信应用，点击右上角的「+」号，选择「扫一扫」</p>
            </div>
          </div>
          <div class="guide-item">
            <div class="guide-number">2</div>
            <div class="guide-content">
              <h4>扫描二维码</h4>
              <p>使用微信扫描页面上的二维码</p>
            </div>
          </div>
          <div class="guide-item">
            <div class="guide-number">3</div>
            <div class="guide-content">
              <h4>确认绑定</h4>
              <p>在微信中确认绑定操作，完成绑定过程</p>
            </div>
          </div>
        </div>
      </div>

      <div class="bind-section">
        <h3 class="section-title">绑定优势</h3>
        <div class="advantages-grid">
          <div class="advantage-item">
            <div class="advantage-icon">
              <n-icon :component="LogInOutline" size="24" />
            </div>
            <div class="advantage-content">
              <h4>快速登录</h4>
              <p>使用微信一键登录，无需输入账号密码</p>
            </div>
          </div>
          <div class="advantage-item">
            <div class="advantage-icon">
              <n-icon :component="NotificationsOutline" size="24" />
            </div>
            <div class="advantage-content">
              <h4>消息通知</h4>
              <p>重要消息通过微信推送，及时了解系统动态</p>
            </div>
          </div>
          <div class="advantage-item">
            <div class="advantage-icon">
              <n-icon :component="ShieldCheckmarkOutline" size="24" />
            </div>
            <div class="advantage-content">
              <h4>账号安全</h4>
              <p>微信身份验证，提高账号安全性</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NBreadcrumb, NBreadcrumbItem, NIcon, NAvatar, NButton } from 'naive-ui'
import { CheckmarkCircleOutline, AlertCircleOutline, LogInOutline, NotificationsOutline, ShieldCheckmarkOutline } from '@vicons/ionicons5'

const isBound = ref(true)
const wechatAvatar = ref('https://api.dicebear.com/7.x/initials/svg?seed=王小丫')
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

.wechat-info {
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

.qrcode-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.qrcode {
  padding: 12px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.qrcode-tip {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
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
