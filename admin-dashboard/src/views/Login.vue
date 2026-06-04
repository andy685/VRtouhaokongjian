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

        <section class="system-switcher" aria-label="系统切换入口">
          <div class="system-switcher-header">
            <span>系统入口</span>
            <small>临时切换</small>
          </div>
          <div class="system-switcher-links">
            <button
              v-for="entry in systemEntries"
              :key="entry.key"
              type="button"
              class="system-link-chip"
              :class="{ active: isSystemEntryActive(entry) }"
              @click="handleSystemEntry(entry)"
            >
              {{ entry.label }}
            </button>
          </div>
        </section>
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
import { useRoute, useRouter } from 'vue-router'
import { NForm, NFormItem, NInput, NButton, NCheckbox, NModal } from 'naive-ui'

const router = useRouter()
const route = useRoute()

// 登录身份
const loginRole = ref<'shop' | 'agent' | 'platform' | 'cp'>('shop')

type LoginRole = 'shop' | 'agent' | 'platform' | 'cp'
type SystemEntry =
  | { key: 'cashier'; label: string; type: 'cashier'; path: string }
  | { key: LoginRole; label: string; type: 'role'; role: LoginRole }

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

const createOrigin = (port: number) => {
  const { protocol, hostname } = window.location
  return `${protocol}//${hostname}:${port}`
}

const systemEntries: SystemEntry[] = [
  { key: 'cashier', label: '收银工作台', type: 'cashier', path: '/cashier/login' },
  { key: 'shop', label: '商家后台', type: 'role', role: 'shop' },
  { key: 'agent', label: '代理商后台', type: 'role', role: 'agent' },
  { key: 'platform', label: '平台超管', type: 'role', role: 'platform' },
  { key: 'cp', label: '供应商后台', type: 'role', role: 'cp' }
]

async function probeOrigin(origin: string, path: string) {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), 1200)

  try {
    await fetch(`${origin}${path}`, {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal,
    })
    return true
  } catch {
    return false
  } finally {
    window.clearTimeout(timer)
  }
}

async function resolveCashierOrigin(path: string) {
  if (import.meta.env.PROD) {
    return window.location.origin
  }

  if (!window.location.port) {
    return window.location.origin
  }

  const currentPort = Number(window.location.port || 5174)
  const candidatePorts = Array.from(
    new Set([currentPort + 1, currentPort - 1, 9528, 5173, 5174].filter((port) => Number.isFinite(port) && port > 0))
  )

  for (const port of candidatePorts) {
    const origin = createOrigin(port)
    if (await probeOrigin(origin, path)) {
      return origin
    }
  }

  return createOrigin(candidatePorts[0] || 9528)
}

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
    trigger: 'blur',
    validator: (_rule: unknown, value: string) => {
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

function syncLoginRole(role: LoginRole) {
  loginRole.value = role
  router.replace({
    path: '/login',
    query: { role }
  })
}

async function handleSystemEntry(entry: SystemEntry) {
  if (entry.type === 'cashier') {
    const cashierOrigin = await resolveCashierOrigin(entry.path)
    window.location.href = `${cashierOrigin}${entry.path}`
    return
  }
  syncLoginRole(entry.role)
}

function isSystemEntryActive(entry: SystemEntry) {
  if (entry.type === 'external') return false
  return loginRole.value === entry.role
}

// 处理登录
function handleLogin() {
  isLoading.value = true
  // 模拟登录请求
  setTimeout(() => {
    isLoading.value = false
    // 根据选择的身份跳转到对应后台
    const redirectMap = {
      platform: '/platform/dashboard',
      agent: '/agent/dashboard',
      shop: '/shop/workbench',
      cp: '/cp/dashboard',
    }
    router.push(redirectMap[loginRole.value])
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

function applyRoleFromQuery() {
  const role = route.query.role
  if (role === 'shop' || role === 'agent' || role === 'platform' || role === 'cp') {
    loginRole.value = role
  }
}

// 页面加载时检查
onMounted(() => {
  applyRoleFromQuery()
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

.system-switcher {
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid rgba(103, 116, 158, 0.18);
}

.system-switcher-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.system-switcher-header span {
  color: #4f5e96;
  font-size: 13px;
  font-weight: 700;
}

.system-switcher-header small {
  color: #8c95ad;
  font-size: 12px;
}

.system-switcher-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.system-link-chip {
  min-width: 92px;
  height: 34px;
  padding: 0 14px;
  border: 1px solid #d8def0;
  border-radius: 999px;
  background: rgba(102, 126, 234, 0.06);
  color: #56647d;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.system-link-chip:hover {
  border-color: #b8c3ea;
  background: rgba(102, 126, 234, 0.1);
  color: #3f4d75;
}

.system-link-chip.active {
  border-color: #7d8fea;
  background: rgba(102, 126, 234, 0.16);
  color: #32406d;
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
