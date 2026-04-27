<template>
  <div class="login-container">
    <div class="login-form-card">
      <div class="login-header">
        <h2 class="login-title">登录</h2>
        <p class="login-subtitle">欢迎回到头号空间管理系统</p>
      </div>

      <div class="login-form">
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
          <n-form-item v-if="showVerificationCode" label="验证码" path="verificationCode">
            <div class="captcha-input">
              <n-input 
                v-model:value="loginForm.verificationCode" 
                placeholder="请输入验证码" 
                style="flex: 1;"
              />
              <div class="captcha-image" @click="refreshCaptcha" title="点击刷新">
                <canvas ref="captchaCanvas" width="120" height="42"></canvas>
              </div>
            </div>
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
    </div>

    <!-- 忘记密码弹窗 -->
    <n-modal v-model:show="showForgotPassword" preset="card" title="找回密码" style="width: 500px;">
      <div class="forgot-password-form">
        <n-form :model="forgotForm" :rules="forgotRules">
          <n-form-item label="邮箱地址" path="email">
            <n-input v-model:value="forgotForm.email" placeholder="请输入绑定的邮箱" />
          </n-form-item>
          <n-form-item label="验证码" path="verificationCode">
            <div style="display: flex; gap: 8px; width: 100%;">
              <n-input 
                v-model:value="forgotForm.verificationCode" 
                placeholder="请输入验证码" 
                style="flex: 1;"
              />
              <n-button 
                type="primary" 
                :disabled="isSendingForgotCode || !forgotForm.email"
                @click="sendForgotVerificationCode"
              >
                {{ isSendingForgotCode ? '发送中...' : '发送验证码' }}
              </n-button>
            </div>
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NForm, NFormItem, NInput, NButton, NCheckbox, NModal } from 'naive-ui'

const router = useRouter()

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
const isSendingForgotCode = ref(false)
const showForgotPassword = ref(false)
const captchaCanvas = ref<HTMLCanvasElement | null>(null)
const currentCaptcha = ref('')

// 生成随机验证码
function generateCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let captcha = ''
  for (let i = 0; i < 4; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return captcha
}

// 绘制验证码
function drawCaptcha() {
  if (!captchaCanvas.value) return
  const canvas = captchaCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  currentCaptcha.value = generateCaptcha()

  // 清空画布
  ctx.fillStyle = '#f0f0f0'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 添加干扰线
  for (let i = 0; i < 6; i++) {
    ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`
    ctx.beginPath()
    ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height)
    ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height)
    ctx.stroke()
  }

  // 绘制文字
  for (let i = 0; i < currentCaptcha.value.length; i++) {
    ctx.save()
    ctx.font = 'bold 24px Arial'
    ctx.fillStyle = `rgb(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100 + 155})`
    ctx.translate(20 + i * 25, 28)
    ctx.rotate((Math.random() - 0.5) * 0.4)
    ctx.fillText(currentCaptcha.value[i], 0, 0)
    ctx.restore()
  }

  // 添加干扰点
  for (let i = 0; i < 50; i++) {
    ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`
    ctx.beginPath()
    ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, 2 * Math.PI)
    ctx.fill()
  }
}

// 刷新验证码
function refreshCaptcha() {
  drawCaptcha()
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
  }, 500)
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
onMounted(() => {
  checkNeedVerificationCode()
  // 绘制初始验证码
  if (showVerificationCode.value) {
    setTimeout(() => drawCaptcha(), 100)
  }
})
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

.captcha-input {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.captcha-image {
  cursor: pointer;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  transition: opacity 0.2s;
}

.captcha-image:hover {
  opacity: 0.8;
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