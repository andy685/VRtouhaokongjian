<template>
  <div class="login-container">
    <div class="login-form-card">
      <div class="login-header">
        <h2 class="login-title">登录</h2>
        <p class="login-subtitle">欢迎回到头号空间管理系统</p>
      </div>

      <div class="login-tabs">
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'password' }" 
          @click="activeTab = 'password'"
        >
          账号密码登录
        </div>
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'wechat' }" 
          @click="activeTab = 'wechat'"
        >
          微信登录
        </div>
      </div>

      <!-- 账号密码登录 -->
      <div v-if="activeTab === 'password'" class="login-form">
        <n-form :model="loginForm" :rules="rules">
          <n-form-item label="用户名" path="username">
            <n-input v-model:value="loginForm.username" placeholder="请输入用户名" />
          </n-form-item>
          <n-form-item label="密码" path="password">
            <n-input 
              v-model:value="loginForm.password" 
              type="password" 
              placeholder="请输入密码" 
            />
          </n-form-item>
          <n-form-item v-if="showVerificationCode" path="verificationCode">
            <n-input 
              v-model:value="loginForm.verificationCode" 
              placeholder="请输入验证码" 
            >
              <template #append>
                <n-button 
                  type="primary" 
                  size="small" 
                  :disabled="isSendingCode"
                  @click="sendVerificationCode"
                >
                  {{ isSendingCode ? '发送中...' : '发送验证码' }}
                </n-button>
              </template>
            </n-input>
          </n-form-item>
          <div class="form-actions">
            <n-checkbox v-model:checked="loginForm.remember">记住我</n-checkbox>
            <n-button text @click="showForgotPassword = true">忘记密码？</n-button>
          </div>
          <n-button type="primary" block @click="handleLogin" :loading="isLoading">
            登录
          </n-button>
        </n-form>
      </div>

      <!-- 微信登录 -->
      <div v-else class="wechat-login">
        <div class="qrcode-section">
          <div class="qrcode">
            <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
              <rect width="200" height="200" fill="white" stroke="#e5e7eb" />
              <text x="100" y="105" font-size="14" text-anchor="middle" fill="#6b7280">微信扫码登录</text>
            </svg>
          </div>
          <p class="qrcode-tip">请使用微信扫描二维码进行登录</p>
          <p class="qrcode-expire">二维码将在 2 分钟后过期</p>
        </div>
      </div>
    </div>

    <!-- 忘记密码弹窗 -->
    <n-modal v-model:show="showForgotPassword" preset="card" title="找回密码" style="width: 500px;">
      <div class="forgot-password-form">
        <n-form :model="forgotForm" :rules="forgotRules">
          <n-form-item label="邮箱地址" path="email">
            <n-input v-model:value="forgotForm.email" placeholder="请输入绑定的邮箱" />
          </n-form-item>
          <n-form-item label="验证码" path="verificationCode">
            <n-input 
              v-model:value="forgotForm.verificationCode" 
              placeholder="请输入验证码" 
            >
              <template #append>
                <n-button 
                  type="primary" 
                  size="small" 
                  :disabled="isSendingForgotCode"
                  @click="sendForgotVerificationCode"
                >
                  {{ isSendingForgotCode ? '发送中...' : '发送验证码' }}
                </n-button>
              </template>
            </n-input>
          </n-form-item>
          <n-form-item label="新密码" path="newPassword">
            <n-input 
              v-model:value="forgotForm.newPassword" 
              type="password" 
              placeholder="请输入新密码" 
            />
          </n-form-item>
          <n-form-item label="确认密码" path="confirmPassword">
            <n-input 
              v-model:value="forgotForm.confirmPassword" 
              type="password" 
              placeholder="请确认新密码" 
            />
          </n-form-item>
        </n-form>
      </div>
      <template #footer>
        <div class="modal-footer">
          <n-button @click="showForgotPassword = false">取消</n-button>
          <n-button type="primary" @click="resetPassword">确认重置</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { NForm, NFormItem, NInput, NButton, NCheckbox, NModal } from 'naive-ui'

const router = useRouter()

// 激活的标签
const activeTab = ref('password')

// 登录表单
const loginForm = reactive({
  username: '',
  password: '',
  verificationCode: '',
  remember: false
})

// 忘记密码表单
const forgotForm = reactive({
  email: '',
  verificationCode: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单规则
const rules = {
  username: {
    required: true,
    message: '请输入用户名',
    trigger: 'blur'
  },
  password: {
    required: true,
    message: '请输入密码',
    trigger: 'blur'
  },
  verificationCode: {
    required: true,
    message: '请输入验证码',
    trigger: 'blur'
  }
}

const forgotRules = {
  email: {
    required: true,
    message: '请输入邮箱地址',
    trigger: 'blur'
  },
  verificationCode: {
    required: true,
    message: '请输入验证码',
    trigger: 'blur'
  },
  newPassword: {
    required: true,
    message: '请输入新密码',
    trigger: 'blur'
  },
  confirmPassword: {
    required: true,
    message: '请确认新密码',
    trigger: 'blur',
    validator: (rule: any, value: string) => {
      return value === forgotForm.newPassword
    },
    message: '两次输入的密码不一致'
  }
}

// 状态
const isLoading = ref(false)
const showVerificationCode = ref(false)
const isSendingCode = ref(false)
const isSendingForgotCode = ref(false)
const showForgotPassword = ref(false)

// 发送验证码
function sendVerificationCode() {
  if (!loginForm.username) return
  isSendingCode.value = true
  // 模拟发送验证码
  setTimeout(() => {
    isSendingCode.value = false
  }, 2000)
}

// 发送忘记密码验证码
function sendForgotVerificationCode() {
  if (!forgotForm.email) return
  isSendingForgotCode.value = true
  // 模拟发送验证码
  setTimeout(() => {
    isSendingForgotCode.value = false
  }, 2000)
}

// 处理登录
function handleLogin() {
  isLoading.value = true
  // 模拟登录请求
  setTimeout(() => {
    isLoading.value = false
    // 登录成功后跳转到店铺后台首页
    router.push('/shop/workbench')
  }, 1500)
}

// 重置密码
function resetPassword() {
  // 模拟重置密码
  showForgotPassword.value = false
  // 显示成功提示
}

// 检查是否需要验证码（新设备登录）
function checkNeedVerificationCode() {
  // 这里可以实现检查是否为新设备的逻辑
  // 模拟需要验证码
  showVerificationCode.value = true
}

// 页面加载时检查
checkNeedVerificationCode()
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-form-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  width: 400px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.login-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.login-tabs {
  display: flex;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border-color);
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.tab-item.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 8px 0 16px 0;
}

.wechat-login {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px 0;
}

.qrcode-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.qrcode {
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.qrcode-tip {
  font-size: 14px;
  color: var(--text-primary);
  margin: 0;
}

.qrcode-expire {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
}

.forgot-password-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* 响应式调整 */
@media (max-width: 480px) {
  .login-form-card {
    width: 90%;
    padding: 24px;
  }
}
</style>