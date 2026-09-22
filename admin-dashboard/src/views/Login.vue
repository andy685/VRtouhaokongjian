<template>
  <div class="login-container" :style="loginContainerStyle">
    <img class="login-brand-strip" :src="loginBrandStrip" alt="飞天云动 · 头号空间 · 琥珀金源" />
    <div class="login-form-card">
      <div class="login-header">
        <img class="login-panel-title-image" :src="loginPanelTitle" alt="派托OS智能管理平台" />
        <h2 class="login-title">{{ loginSystemTitle }}</h2>
      </div>

      <div class="login-form">
        <n-form :model="loginForm" :rules="rules">
          <n-form-item label="用户名" path="username">
            <n-input
              v-model:value="loginForm.username"
              :placeholder="loginRole === 'shop' ? '请输入用户名' : '演示环境可不填'"
            />
          </n-form-item>
          <n-form-item label="密码" path="password">
            <n-input
              v-model:value="loginForm.password"
              type="password"
              :placeholder="loginRole === 'shop' ? '请输入密码' : '演示环境可不填'"
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
          <n-button type="primary" block attr-type="button" @click="handleLogin" :loading="isLoading">
            {{ loginButtonLabel }}
          </n-button>
        </n-form>

        <section v-if="demoAccountsEnabled && loginRole === 'shop'" class="demo-accounts" aria-label="演示账号">
          <div class="demo-accounts-header">
            <span>演示账号（点击填入）</span>
            <div class="demo-account-tools"><small>密码均为 123456</small></div>
          </div>
          <div class="demo-accounts-list">
            <button
              v-for="item in demoAccounts"
              :key="item.account"
              type="button"
              class="demo-account-card"
              :class="{
                'is-dual': item.systems.includes('shop') && item.systems.includes('cashier'),
                'is-shop-only': item.systems.includes('shop') && !item.systems.includes('cashier'),
                'is-cashier-only': item.systems.includes('cashier') && !item.systems.includes('shop'),
              }"
              @click="fillDemoAccount(item)"
            >
              <div class="demo-account-top">
                <strong>{{ item.role }} · {{ item.name }}</strong>
                <em>{{ item.note }}</em>
              </div>
              <div class="demo-account-row">账号 {{ item.account }}</div>
              <div class="demo-account-row">密码 {{ item.password }}</div>
              <div class="demo-account-systems">{{ item.systemsText }}</div>
            </button>
          </div>
        </section>

        <section class="system-switcher" aria-label="系统切换入口">
          <div class="system-switcher-header">
            <span>系统入口</span>
            <n-button text size="small" @click="showSystemEntries = !showSystemEntries">{{ showSystemEntries ? '收起' : '展开' }}</n-button>
          </div>
          <div v-if="showSystemEntries" class="system-switcher-links">
            <button
              v-for="entry in systemEntries"
              :key="entry.key"
              type="button"
              class="system-link-chip"
              :class="{ active: isSystemEntryActive(entry) }"
              :disabled="entry.type === 'cashier' && isResolvingCashier"
              @click="handleSystemEntry(entry)"
            >
              {{ entry.type === 'cashier' && isResolvingCashier ? '连接中…' : entry.label }}
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NForm, NFormItem, NInput, NButton, NCheckbox, NModal, useMessage } from 'naive-ui'
import { checkSystemLoginAccess, DEMO_LOGIN_ACCOUNTS } from '../constants/shopAccessSystems'
import loginHeroPoster from '../assets/login-hero-poster.jpg'
import loginRobotCity from '../assets/login-robot-city.png'
import loginBrandStrip from '../assets/login-brand-strip.png'
import loginPanelTitle from '../assets/login-panel-title.png'

const router = useRouter()
const route = useRoute()
const message = useMessage()

// 登录身份（存储键需在身份初始化前声明）
const LOGIN_ROLE_STORAGE_KEY = 'adminLoginRole'

const loginRole = ref<'shop' | 'agent' | 'platform' | 'cp'>('shop')

type LoginRole = 'shop' | 'agent' | 'platform' | 'cp'
type SystemEntry =
  | { key: 'cashier'; label: string; type: 'cashier'; path: string }
  | { key: LoginRole; label: string; type: 'role'; role: LoginRole }

// 首帧前即按 URL / 会话恢复身份，避免背景与文案闪变（onMounted 中会再同步一次）
applyRoleFromQuery()

// 官方运营后台使用派托海报，其余身份（商家/代理商/供应商）使用城市主视觉
const loginContainerStyle = computed(() => {
  const heroImage = loginRole.value === 'platform' ? loginHeroPoster : loginRobotCity
  return {
    backgroundImage: `linear-gradient(90deg, rgba(2, 10, 30, .1) 0%, rgba(2, 10, 30, .02) 48%, rgba(2, 10, 30, .5) 100%), url(${heroImage})`
  }
})

// 登录表单
const loginForm = reactive({
  username: '',
  password: '',
  verificationCode: '',
  remember: false
})
const demoAccountsEnabled = false
const showSystemEntries = ref(false)
const isResolvingCashier = ref(false)

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

const cashierLoginPath = import.meta.env.PROD ? '/cashier/login' : '/login'

const systemEntries: SystemEntry[] = [
  { key: 'cashier', label: '收银工作台', type: 'cashier', path: cashierLoginPath },
  { key: 'shop', label: '商家后台', type: 'role', role: 'shop' },
  { key: 'agent', label: '代理商后台', type: 'role', role: 'agent' },
  { key: 'platform', label: '官方运营后台', type: 'role', role: 'platform' },
  { key: 'cp', label: '供应商后台', type: 'role', role: 'cp' }
]

const demoAccounts = DEMO_LOGIN_ACCOUNTS

function fillDemoAccount(item: (typeof DEMO_LOGIN_ACCOUNTS)[number]) {
  loginForm.username = item.account
  loginForm.password = item.password
  message.info(`已填入：${item.role} ${item.account}（${item.systemsText}）`)
}

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
  // 开发环境 cashier-ui 固定端口 9529（见 cashier-ui/vite.config.js）
  // 注意：9528 是 miniapp-payment，不能作为候选端口
  if (!window.location.port) {
    return window.location.origin
  }

  const currentPort = Number(window.location.port || 9527)
  const candidatePorts = Array.from(
    new Set(
      [9529, 5174, 5173]
        .filter((port) => Number.isFinite(port) && port > 0 && port !== currentPort)
    )
  )

  for (const port of candidatePorts) {
    const origin = createOrigin(port)
    if (await probeOrigin(origin, path)) {
      return origin
    }
  }

  // 所有候选端口均不可用：返回 null，由调用方提示，避免跳到打不开的地址
  return null
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

/** 登录按钮文案随所选系统变化，明确本次登录进入哪个后台 */
const loginButtonLabel = computed(() => ({
  shop: '登录商家后台',
  agent: '登录代理商后台',
  platform: '登录官方运营后台',
  cp: '登录供应商后台',
}[loginRole.value]))
const loginSystemTitle = computed(() => ({
  shop: '商家后台',
  agent: '代理商后台',
  platform: '官方运营后台',
  cp: '供应商后台',
}[loginRole.value]))

function syncLoginRole(role: LoginRole) {
  loginRole.value = role
  try { sessionStorage.setItem(LOGIN_ROLE_STORAGE_KEY, role) } catch { /* ignore */ }
  router.replace({
    path: '/login',
    query: { role }
  })
}

async function handleSystemEntry(entry: SystemEntry) {
  if (entry.type === 'cashier') {
    isResolvingCashier.value = true
    try {
      const cashierOrigin = await resolveCashierOrigin(entry.path)
      if (!cashierOrigin) {
        message.error('未检测到收银工作台服务，请先在 cashier-ui 目录执行 npm run dev（默认端口 9529）')
        return
      }
      window.location.href = `${cashierOrigin}${entry.path}`
    } finally {
      isResolvingCashier.value = false
    }
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
  if (!loginForm.username.trim()) {
    message.warning('请输入用户名')
    return
  }
  if (!loginForm.password.trim()) {
    message.warning('请输入密码')
    return
  }

  // 商家后台：按角色可用系统校验是否可登录「商家运营后台」
  if (loginRole.value === 'shop') {
    const access = checkSystemLoginAccess(loginForm.username, 'shop')
    if (!access.ok) {
      message.error(access.message || '无权登录商家运营后台')
      return
    }
  }

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
    try { sessionStorage.setItem(LOGIN_ROLE_STORAGE_KEY, role) } catch { /* ignore */ }
    return
  }
  // 无 role 参数时恢复上次选择的系统入口，避免刷新/回退后身份丢失
  try {
    const stored = sessionStorage.getItem(LOGIN_ROLE_STORAGE_KEY)
    if (stored === 'shop' || stored === 'agent' || stored === 'platform' || stored === 'cp') {
      loginRole.value = stored
    }
  } catch { /* ignore */ }
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
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-height: 100vh;
  padding: 40px clamp(32px, 9vw, 160px);
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}

.login-brand-strip { position: absolute; top: 1.5vh; left: 1.5vw; height: 7.5vh; max-height: 84px; width: auto; max-width: 70vw; object-fit: contain; object-position: left center; }

.login-form-card {
  background: white;
  border-radius: 14px;
  padding: 22px 24px;
  width: min(384px, calc(100vw - 32px));
  max-height: calc(100vh - 56px);
  overflow-y: auto;
  box-shadow: 0 18px 48px rgba(2, 8, 28, .28);
}

.demo-accounts {
  margin-top: 4px;
  padding: 12px 10px 10px;
  border-radius: 10px;
  background: #f5f7fc;
  border: 1px solid #e4e9f5;
}

.demo-accounts-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.demo-accounts-header span {
  font-size: 13px;
  font-weight: 700;
  color: #3f4d75;
}

.demo-accounts-header small {
  font-size: 12px;
  color: #8c95ad;
}

.demo-account-tools { display:flex; align-items:center; gap:8px; }

.demo-accounts-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 240px;
  overflow-y: auto;
}

.demo-account-card {
  width: 100%;
  text-align: left;
  border: 1px solid #dce3f3;
  border-radius: 10px;
  background: #fff;
  padding: 10px 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.demo-account-card:hover {
  border-color: #9eb0ea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.12);
}

.demo-account-card.is-dual {
  border-left: 3px solid #6366f1;
}

.demo-account-card.is-shop-only {
  border-left: 3px solid #0ea5e9;
}

.demo-account-card.is-cashier-only {
  border-left: 3px solid #f59e0b;
}

.demo-account-top {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.demo-account-top strong {
  font-size: 13px;
  color: #1e293b;
}

.demo-account-top em {
  font-style: normal;
  font-size: 11px;
  color: #64748b;
  white-space: nowrap;
}

.demo-account-row {
  font-size: 12px;
  color: #475569;
  line-height: 1.5;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.demo-account-systems {
  margin-top: 4px;
  font-size: 11px;
  color: #667eea;
  font-weight: 600;
}

.login-header {
  text-align: center;
  margin-bottom: 18px;
}

.login-title {
  font-size: 19px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.login-panel-title-image { display:block; width:min(100%, 232px); height: auto; margin:0 auto 6px; }


.login-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.system-switcher {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid rgba(103, 116, 158, 0.18);
}

.system-switcher-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.system-switcher-header span {
  color: #4f5e96;
  font-size: 12px;
  font-weight: 700;
}

.system-switcher-header small {
  color: #8c95ad;
  font-size: 12px;
}

.system-switcher-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.system-link-chip {
  min-width: 76px;
  height: 30px;
  padding: 0 12px;
  border: 1px solid #d8def0;
  border-radius: 999px;
  background: rgba(102, 126, 234, 0.06);
  color: #56647d;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.system-link-chip:hover {
  border-color: #b8c3ea;
  background: rgba(102, 126, 234, 0.1);
  color: #3f4d75;
}

.system-link-chip:disabled {
  opacity: 0.6;
  cursor: wait;
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
  margin: 2px 0 12px 0;
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
  .login-container { justify-content: center; padding: 20px; }
  .login-form-card {
    width: 90%;
    padding: 24px;
  }
}
</style>
