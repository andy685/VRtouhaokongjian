<template>
  <div class="login-container">
    <div class="login-shell">
      <section class="visual-panel" aria-hidden="true">
        <div class="visual-brand">
          <img :src="`${BASE_URL}login-brand-logo.png`" alt="" />
        </div>
        <div class="visual-fill" :style="heroBgStyle"></div>
      </section>

      <nav class="quick-actions" aria-label="登录辅助入口">
        <div ref="menuRef" class="quick-actions-anchor">
          <button
            type="button"
            class="icon-action"
            :class="{ active: menuOpen }"
            aria-label="打开更多菜单"
            aria-haspopup="menu"
            :aria-expanded="menuOpen"
            @click="toggleMenu"
          >
            <el-icon><MoreFilled /></el-icon>
          </button>
          <button
            type="button"
            class="icon-action"
            aria-label="关闭页面"
            @click="handleClose"
          >
            <el-icon><Close /></el-icon>
          </button>

          <transition name="menu-fade">
            <div v-if="menuOpen" class="quick-actions-card" role="menu">
              <button type="button" class="quick-link" role="menuitem" @click="handleMenuAction(openSettingModal)">
                基础配置
              </button>
              <button type="button" class="quick-link" role="menuitem" @click="handleMenuAction(goUpgrade)">
                在线升级
              </button>
              <button type="button" class="quick-link" role="menuitem" @click="handleMenuAction(goBackend)">
                店铺后台
              </button>
            </div>
          </transition>
        </div>
      </nav>

      <section class="login-panel" aria-label="店员登录">
        <div class="login-box">
          <div class="login-heading">
            <h1>头号空间商户收银系统</h1>
            <p class="login-subtitle">WELCOME ALPHA SPACE</p>
          </div>

          <div v-if="kickHint" class="kick-hint" role="alert">
            <strong>登录已失效</strong>
            <p>{{ kickHint }}</p>
          </div>

          <el-form :model="form" class="login-form">
            <el-form-item>
              <el-input
                v-model="form.username"
                placeholder="请输入店员账号"
                size="large"
                class="login-input"
              >
                <template #prefix>
                  <el-icon class="login-input-icon"><User /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-input
                v-model="form.password"
                type="password"
                placeholder="请输入登录密码"
                size="large"
                show-password
                class="login-input"
              >
                <template #prefix>
                  <el-icon class="login-input-icon"><Lock /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="large" class="login-btn" @click="handleLogin">登录</el-button>
            </el-form-item>
          </el-form>

          <section class="demo-accounts" aria-label="演示账号">
            <div class="demo-accounts-header">
              <span>演示账号（点击填入）</span>
              <small>密码均为 123456</small>
            </div>
            <div class="demo-accounts-list">
              <button
                v-for="item in demoAccounts"
                :key="item.account"
                type="button"
                class="demo-account-card"
                :class="{
                  'is-dual': item.canCashier && item.canShop,
                  'is-ok': item.canCashier && !item.canShop,
                  'is-deny': !item.canCashier,
                }"
                @click="fillDemoAccount(item)"
              >
                <div class="demo-account-top">
                  <strong>{{ item.role }} · {{ item.name }}</strong>
                  <em>{{ item.canCashier ? '可登录收银' : '收银会拒绝' }}</em>
                </div>
                <div class="demo-account-row">账号 {{ item.account }}</div>
                <div class="demo-account-row">密码 {{ item.password }}</div>
                <div class="demo-account-systems">{{ item.systemsText }}</div>
              </button>
            </div>
          </section>

          <section class="system-portal" aria-label="系统切换入口">
            <div class="system-portal-header">
              <span>系统入口</span>
              <small>临时切换</small>
            </div>
            <div class="system-portal-links">
              <button
                v-for="entry in systemEntries"
                :key="entry.key"
                type="button"
                class="system-chip"
                :class="{ active: entry.key === 'cashier' }"
                @click="openSystemEntry(entry)"
              >
                {{ entry.label }}
              </button>
            </div>
          </section>
        </div>
      </section>
    </div>

    <transition name="modal-fade">
      <div
        v-if="settingDialogVisible"
        class="settings-modal-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="系统设置"
        @click.self="closeSettingModal"
      >
        <section class="settings-modal">
          <header class="settings-modal-header">
            <h2>系统设置</h2>
            <button type="button" class="settings-close" aria-label="关闭系统设置" @click="closeSettingModal">
              <el-icon><Close /></el-icon>
            </button>
          </header>

          <div class="settings-modal-body">
            <aside class="settings-sidebar">
              <button type="button" class="settings-tab active">基础设置</button>
            </aside>

            <div class="settings-content">
              <h3 class="settings-panel-title">设备绑定</h3>

              <div class="device-status-card" :class="deviceBound ? 'is-ok' : 'is-warn'">
                <div class="device-status-top">
                  <strong>{{ deviceBound ? '收银设备已绑定' : '收银设备未绑定' }}</strong>
                  <em>{{ deviceBound ? '可正常登录收银' : '无法登录收银' }}</em>
                </div>
                <div v-if="deviceBound" class="device-status-meta">
                  <span>设备：{{ localDevice?.deviceName || '—' }}</span>
                  <span>门店：{{ localDevice?.storeName || '—' }}</span>
                  <span>Token：{{ maskedDeviceToken }}</span>
                </div>
                <p class="device-status-tip">
                  {{ deviceStatusHint }}
                </p>
              </div>

              <div v-if="!deviceBound" class="token-row activate-row">
                <label class="token-label" for="cashier-token-input">Token：</label>
                <div class="token-panel">
                  <div class="token-edit-block">
                    <input
                      id="cashier-token-input"
                      v-model="tokenInput"
                      class="token-input"
                      type="text"
                      placeholder="粘贴商家后台的 Token"
                      autocomplete="off"
                    />
                    <div class="token-actions">
                      <button type="button" class="token-action primary" @click="handleBindToken">绑定本机</button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="device-test-panel">
                <div class="device-test-panel__header">
                  <strong>仅供测试</strong>
                  <span>不要用于正式演示</span>
                </div>
                <p class="device-test-note">
                  可直接切换测试场景，验证“可绑定 / 已被其他设备绑定 / 已禁用”等提示。
                </p>
                <div class="device-test-list">
                  <div v-for="item in testTokenOptions" :key="item.token" class="device-test-item">
                    <div class="device-test-item__info">
                      <strong>{{ item.name }} <em>{{ item.statusText }}</em></strong>
                      <span>{{ item.shop }}</span>
                      <code>{{ item.token }}</code>
                    </div>
                    <div class="device-test-item__actions">
                      <button type="button" class="token-action secondary" @click="fillTestToken(item.token)">
                        填入
                      </button>
                      <button type="button" class="token-action ghost" @click="setTestScenario(item.token, 'available')">
                        设为未使用
                      </button>
                      <button type="button" class="token-action ghost" @click="setTestScenario(item.token, 'bound-other')">
                        设为别机已绑定
                      </button>
                      <button type="button" class="token-action ghost" @click="setTestScenario(item.token, 'disabled')">
                        设为禁用
                      </button>
                    </div>
                  </div>
                </div>
                <div class="device-test-tools">
                  <button type="button" class="token-action secondary" @click="handleClearTokenTest">
                    清除 Token
                  </button>
                </div>
                <p class="device-test-note device-test-note--subtle">
                  存储位置：`localStorage.{{ tokenCatalogKey }}`
                </p>
              </div>

            </div>
          </div>
        </section>
      </div>
    </transition>

    <transition name="modal-fade">
      <div
        v-if="upgradeDialogVisible"
        class="settings-modal-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="在线升级"
        @click.self="closeUpgradeModal"
      >
        <section class="upgrade-modal">
          <button type="button" class="settings-close upgrade-close" aria-label="关闭在线升级" @click="closeUpgradeModal">
            <el-icon><Close /></el-icon>
          </button>

          <div class="upgrade-art" aria-hidden="true">
            <img :src="`${BASE_URL}upgrade-rocket.png`" alt="" />
          </div>

          <div class="upgrade-hero">
            <div class="upgrade-copy">
              <h2>有新版本发布！</h2>
              <p>请跟新到新版本 V4.13</p>
            </div>
          </div>

          <div class="upgrade-log">
            <p>一 更新了 1</p>
            <p>一 更新了 1</p>
            <p>一 更新了 1</p>
          </div>

          <div class="upgrade-progress">
            <div class="upgrade-track">
              <div class="upgrade-fill" :style="{ width: `${upgradeProgress}%` }"></div>
            </div>
            <div class="upgrade-progress-meta">
              <span>{{ upgradePaused ? '已暂停' : '下载更新中' }}</span>
              <strong>{{ upgradeProgress }}%</strong>
            </div>
          </div>

          <div class="upgrade-actions">
            <button type="button" class="upgrade-primary" @click="toggleUpgradePause">
              {{ upgradePaused ? '继续' : '暂停' }}
            </button>
          </div>
        </section>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { Close, Lock, MoreFilled, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  checkCashierLoginAccess,
  DEMO_LOGIN_ACCOUNTS,
  setCashierSession,
} from '../../utils/shopAccessSystems'
import {
  bindTokenToThisMachine,
  CASHIER_DEVICE_CATALOG_KEY,
  checkDeviceBinding,
  claimTokenSession,
  consumeKickHint,
  getLocalDevice,
  getTokenTestStatus,
  loadDeviceCatalog,
  setTokenTestScenario,
  unbindLocalDevice,
} from '../../utils/tokenSession'

const BASE_URL = import.meta.env.BASE_URL

const router = useRouter()

const heroBgStyle = computed(() => ({
  background: `url('${BASE_URL}login-hero-body.jpg') center center / cover no-repeat`
}))

const menuOpen = ref(false)
const menuRef = ref(null)
const settingDialogVisible = ref(false)
const upgradeDialogVisible = ref(false)
const localDevice = ref(getLocalDevice())
const testDeviceCatalog = ref(loadDeviceCatalog())
const tokenInput = ref('')
const kickHint = ref('')
const upgradeProgress = ref(31)
const upgradePaused = ref(false)
const form = reactive({
  username: '',
  password: ''
})

const deviceBound = computed(() => !!localDevice.value?.bound)
const maskedDeviceToken = computed(() => maskToken(localDevice.value?.token))
const tokenCatalogKey = CASHIER_DEVICE_CATALOG_KEY
const testTokenOptions = computed(() => testDeviceCatalog.value.map((item) => ({
  name: item.name || '未命名设备',
  shop: item.shop || '未分配门店',
  token: item.token || '',
  statusText: getTokenTestStatus(item),
})))
const deviceStatusHint = computed(() => (
  deviceBound.value
    ? '设备名称由门店自定义，仅作备注；设备身份以 Token 为准。如需更换设备，请在商家后台换发 Token 后重新绑定。'
    : '从商家后台「收银终端」复制 Token，粘贴后绑定本机。设备名称由门店自定义，仅作备注；设备身份以 Token 为准。'
))

const refreshDevice = () => {
  localDevice.value = getLocalDevice()
}

const refreshTestDeviceCatalog = () => {
  testDeviceCatalog.value = loadDeviceCatalog()
}

const maskToken = (token) => {
  const value = String(token || '').trim()
  if (!value) return '—'
  if (value.length <= 8) return value
  return `${value.slice(0, 6)}...${value.slice(-4)}`
}

const demoAccounts = DEMO_LOGIN_ACCOUNTS

const fillDemoAccount = (item) => {
  form.username = item.account
  form.password = item.password
  ElMessage.info(`已填入：${item.role} ${item.account}（${item.systemsText}）`)
}

const createOrigin = (port) => {
  const { protocol, hostname } = window.location
  return `${protocol}//${hostname}:${port}`
}

const systemEntries = [
  { key: 'cashier', label: '收银工作台', path: '/login', external: false },
  { key: 'shop', label: '商家后台', path: '/login?role=shop', external: true },
  { key: 'agent', label: '代理商后台', path: '/login?role=agent', external: true },
  { key: 'platform', label: '平台超管', path: '/login?role=platform', external: true },
  { key: 'cp', label: '供应商后台', path: '/login?role=cp', external: true }
]

const resolveAdminOrigin = async () => {
  // 生产环境：同源部署，通过路径区分角色
  if (import.meta.env.PROD) {
    return window.location.origin
  }

  // 开发环境：直接使用 admin-dashboard 固定端口
  return createOrigin(9527)
}

const handleLogin = () => {
  if (!form.username.trim()) {
    ElMessage.warning('请输入店员账号')
    return
  }
  if (!form.password.trim()) {
    ElMessage.warning('请输入登录密码')
    return
  }

  // 1) 本机必须已激活为门店收银设备
  const binding = checkDeviceBinding()
  if (!binding.ok) {
    ElMessage.error(binding.message || '本机未激活，无法登录')
    settingDialogVisible.value = true
    return
  }

  // 2) 账号角色须有收银权限
  const access = checkCashierLoginAccess(form.username)
  if (!access.ok) {
    ElMessage.error(access.message || '无权登录收银系统')
    return
  }

  const staff = access.staff || {
    account: form.username.trim(),
    name: form.username.trim(),
    role: '收银员',
  }

  try {
    setCashierSession(staff)
    claimTokenSession(staff)
    kickHint.value = ''
    ElMessage.success('登录成功')
    router.push('/sale')
  } catch (err) {
    ElMessage.error(err?.message || '登录失败')
  }
}

const handleBindToken = () => {
  const result = bindTokenToThisMachine(tokenInput.value)
  if (!result.ok) {
    ElMessage.error(result.message)
    return
  }
  refreshDevice()
  refreshTestDeviceCatalog()
  tokenInput.value = ''
  ElMessage.success(result.message)
}

const fillTestToken = (token) => {
  tokenInput.value = token || ''
  ElMessage.info('已填入测试 Token')
}

const setTestScenario = (token, scenario) => {
  const result = setTokenTestScenario(token, scenario)
  refreshDevice()
  refreshTestDeviceCatalog()
  if (!result.ok) {
    ElMessage.error(result.message || '设置测试场景失败')
    return
  }
  ElMessage.success(result.message)
}

const handleClearTokenTest = () => {
  const result = unbindLocalDevice()
  refreshDevice()
  refreshTestDeviceCatalog()
  tokenInput.value = ''
  ElMessage.success(result.message || '已清除本机 Token')
}



const handleClose = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push('/sale')
}

const openSystemEntry = async (entry) => {
  if (entry.external) {
    const adminOrigin = await resolveAdminOrigin()
    window.location.href = `${adminOrigin}${entry.path}`
    return
  }
  router.push(entry.path)
}

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const openSettingModal = () => {
  menuOpen.value = false
  refreshDevice()
  refreshTestDeviceCatalog()
  settingDialogVisible.value = true
}

const closeSettingModal = () => {
  settingDialogVisible.value = false
}

const openUpgradeModal = () => {
  menuOpen.value = false
  upgradePaused.value = false
  upgradeDialogVisible.value = true
}

const closeUpgradeModal = () => {
  upgradeDialogVisible.value = false
  upgradePaused.value = false
}

const toggleUpgradePause = () => {
  upgradePaused.value = !upgradePaused.value
}

const handleMenuAction = async (action) => {
  menuOpen.value = false
  await action()
}

const handleDocumentClick = (event) => {
  if (!menuRef.value?.contains(event.target)) {
    menuOpen.value = false
  }
}

const goSetting = () => router.push('/setting/basic')
const goUpgrade = () => openUpgradeModal()
const goBackend = async () => {
  const adminOrigin = await resolveAdminOrigin()
  window.location.href = `${adminOrigin}/login?role=shop`
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
  refreshDevice()
  refreshTestDeviceCatalog()

  const hint = consumeKickHint()
  if (hint?.message) {
    kickHint.value = hint.message
    ElMessage.warning(hint.message)
  }
  if (hint?.lastAccount && !form.username) {
    form.username = hint.lastAccount
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
})
</script>

<style scoped>
.login-container {
  min-width: 1024px;
  min-height: 100dvh;
  background:
    radial-gradient(circle at 82% 22%, rgba(69, 151, 255, 0.08), transparent 22%),
    radial-gradient(circle at 15% 78%, rgba(53, 196, 255, 0.08), transparent 28%),
    #ffffff;
  color: #171b24;
}

.login-shell {
  position: relative;
  min-height: 100dvh;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 648px;
  align-items: center;
}

.login-panel {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 72px 42px;
}

.visual-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  min-height: 100dvh;
  padding-right: 0;
}

.visual-brand {
  position: absolute;
  top: 18px;
  left: 24px;
  z-index: 2;
  width: 296px;
  pointer-events: none;
}

.visual-brand img {
  display: block;
  width: 100%;
  height: auto;
}

.visual-fill {
  flex: 1 1 auto;
  position: relative;
  width: 100%;
  overflow: hidden;
}

.visual-fill::before,
.visual-fill::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  filter: blur(4px);
}

.visual-fill::before {
  display: none;
}

.visual-fill::after {
  display: none;
}

.login-box {
  width: 400px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  padding-right: 24px;
}

.login-heading {
  min-height: 74px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  margin-bottom: 28px;
}

.login-box h1 {
  margin: 0;
  color: #1d2433;
  font-size: 30px;
  line-height: 1.2;
  font-weight: 700;
  white-space: nowrap;
}

.login-subtitle {
  margin: 0;
  color: #8f9fb6;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.login-heading + .login-form {
  margin-top: 0;
}

.kick-hint {
  margin: 0 0 14px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #f5c2c7;
  background: #fff5f5;
  color: #842029;
}

.kick-hint strong {
  display: block;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 4px;
}

.kick-hint p {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: #a94452;
}

.login-form {
  width: 100%;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.login-form :deep(.el-input__wrapper) {
  min-height: 48px;
  padding: 0 16px;
  border-radius: 999px;
  box-shadow: none;
  border: 1px solid #eef2f7;
  background: #f8fafc;
  transition: border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
}

.login-form :deep(.el-input__wrapper.is-focus) {
  border-color: #8ebeff;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(94, 157, 255, 0.12);
}

.login-form :deep(.el-input__inner) {
  color: #1d2433;
  font-size: 14px;
}

.login-form :deep(.el-input__inner::placeholder) {
  color: #a7b4c4;
}

.login-input-icon {
  color: #9aa6b5;
  font-size: 16px;
}

.login-btn {
  width: 100%;
  height: 48px;
  margin-top: 6px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(90deg, #2f7eff 0%, #54a2ff 100%);
  box-shadow: 0 12px 24px rgba(73, 140, 255, 0.24);
  font-size: 15px;
  font-weight: 700;
}

.login-btn:hover {
  background: linear-gradient(90deg, #2a75ef 0%, #4d9bf6 100%);
}

.demo-accounts {
  margin-top: 8px;
  padding: 12px;
  border-radius: 12px;
  background: #f5f8fc;
  border: 1px solid #e6edf6;
}

.demo-accounts-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.demo-accounts-header span {
  font-size: 12px;
  font-weight: 700;
  color: #4b5b72;
}

.demo-accounts-header small {
  font-size: 11px;
  color: #94a3b8;
}

.demo-accounts-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 220px;
  overflow-y: auto;
}

.demo-account-card {
  width: 100%;
  text-align: left;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
  padding: 9px 11px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.demo-account-card:hover {
  border-color: #93c5fd;
  box-shadow: 0 4px 12px rgba(47, 126, 255, 0.1);
}

.demo-account-card.is-dual {
  border-left: 3px solid #6366f1;
}

.demo-account-card.is-ok {
  border-left: 3px solid #10b981;
}

.demo-account-card.is-deny {
  border-left: 3px solid #f59e0b;
}

.demo-account-top {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 3px;
}

.demo-account-top strong {
  font-size: 12px;
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
  line-height: 1.45;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.demo-account-systems {
  margin-top: 3px;
  font-size: 11px;
  color: #2f7eff;
  font-weight: 600;
}

.system-portal {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
}

.system-portal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.system-portal-header span {
  color: #6f7f93;
  font-size: 12px;
  font-weight: 700;
}

.system-portal-header small {
  color: #a7b4c4;
  font-size: 12px;
}

.system-portal-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.system-chip {
  min-width: 92px;
  height: 32px;
  padding: 0 14px;
  border: 1px solid #e8edf5;
  border-radius: 999px;
  background: #ffffff;
  color: #6b7890;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.system-chip:hover {
  border-color: #c7d8f8;
  color: #4f79be;
  background: #f8fbff;
}

.system-chip.active {
  border-color: #92bbff;
  color: #2f7eff;
  background: rgba(67, 133, 255, 0.08);
}

.quick-actions {
  position: absolute;
  top: 20px;
  right: 32px;
}

.quick-actions-anchor {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-action {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(18, 31, 53, 0.1);
  border-radius: 50%;
  background: transparent;
  color: #5f6d83;
  box-shadow: none;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, color 0.18s ease, border-color 0.18s ease;
}

.icon-action:hover,
.icon-action.active {
  color: #2f7eff;
  border-color: rgba(47, 126, 255, 0.22);
  transform: translateY(-1px);
}

.icon-action :deep(.el-icon) {
  font-size: 18px;
}

.quick-actions-card {
  position: absolute;
  top: 52px;
  right: 0;
  min-width: 148px;
  padding: 8px;
  border: 1px solid rgba(18, 31, 53, 0.08);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 18px 42px rgba(18, 31, 53, 0.12);
  backdrop-filter: blur(12px);
}

.quick-link {
  width: 100%;
  height: 36px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: #48566d;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.quick-link:hover {
  background: #f4f8ff;
  color: #2f7eff;
  transform: translateX(1px);
}

.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}

.settings-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
  background: var(--pos-overlay-backdrop);
}

.settings-modal {
  width: min(100%, 700px);
  min-height: 430px;
  border-radius: 16px;
  overflow: hidden;
  background: #d9ebff;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.24);
}

.settings-modal-header {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px 0 28px;
  background: #edf3fa;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
}

.settings-modal-header h2 {
  margin: 0;
  color: #1d2433;
  font-size: 18px;
  font-weight: 700;
}

.settings-close {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  color: #4f5d73;
  cursor: pointer;
}

.settings-close :deep(.el-icon) {
  font-size: 20px;
}

.settings-modal-body {
  display: grid;
  grid-template-columns: 108px 1fr;
  min-height: 378px;
}

.settings-sidebar {
  padding: 24px 14px;
  background: rgba(191, 220, 248, 0.72);
}

.settings-tab {
  width: 100%;
  height: 40px;
  border: 0;
  border-radius: 7px;
  background: linear-gradient(90deg, #3791ff 0%, #2c6eff 100%);
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  cursor: default;
  box-shadow: 0 10px 18px rgba(47, 126, 255, 0.2);
}

.settings-content {
  padding: 28px 32px;
  background: rgba(210, 230, 252, 0.82);
}

.settings-panel-title {
  margin: 0 0 24px;
  color: #111827;
  font-size: 18px;
  font-weight: 700;
}

.token-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 18px;
}

.device-status-card {
  margin-bottom: 16px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid transparent;
}

.device-status-card.is-ok {
  border-color: rgba(16, 185, 129, 0.35);
  background: rgba(236, 253, 245, 0.9);
}

.device-status-card.is-warn {
  border-color: rgba(245, 158, 11, 0.4);
  background: rgba(255, 251, 235, 0.95);
}

.device-status-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.device-status-top strong {
  font-size: 14px;
  color: #111827;
}

.device-status-top em {
  font-style: normal;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

.device-status-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
  font-size: 12px;
  color: #475569;
}

.device-status-tip {
  margin: 8px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: #92400e;
}

.device-test-panel {
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px dashed rgba(245, 158, 11, 0.45);
  background: rgba(255, 251, 235, 0.82);
}

.device-test-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.device-test-panel__header strong {
  font-size: 13px;
  color: #92400e;
}

.device-test-panel__header span {
  font-size: 11px;
  color: #b45309;
}

.device-test-tools {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.device-test-note {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: #64748b;
}

.device-test-note--subtle {
  margin-top: 10px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  color: #94a3b8;
}

.device-test-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
}

.device-test-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(245, 158, 11, 0.18);
}

.device-test-item__info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.device-test-item__info strong {
  font-size: 12px;
  color: #1f2937;
}

.device-test-item__info strong em {
  margin-left: 6px;
  font-style: normal;
  font-size: 11px;
  color: #b45309;
}

.device-test-item__info span,
.device-test-item__info code {
  font-size: 12px;
  color: #6b7280;
  word-break: break-all;
}

.device-test-item__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.activate-row .token-label {
  padding-top: 11px;
}

.token-label {
  padding-top: 11px;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.token-panel {
  display: flex;
  align-items: center;
  gap: 12px;
}

.token-panel.editing {
  align-items: flex-start;
}

.token-edit-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.token-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.token-value {
  width: 320px;
  min-height: 40px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.94);
  color: #374151;
  font-size: 14px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.token-input {
  width: 320px;
  height: 40px;
  padding: 0 14px;
  border: 1px solid rgba(47, 126, 255, 0.22);
  border-radius: 8px;
  background: #ffffff;
  color: #374151;
  font-size: 14px;
  outline: none;
  transition: border-color .18s ease, box-shadow .18s ease;
}

.token-input:focus {
  border-color: rgba(47, 126, 255, 0.52);
  box-shadow: 0 0 0 3px rgba(47, 126, 255, 0.12);
}

.token-action {
  height: 38px;
  padding: 0 16px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: #6b7890;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all .18s ease;
}

.token-action.ghost {
  height: auto;
  padding: 0;
  border: 0;
  color: #2f7eff;
  font-size: 14px;
}

.token-action.primary {
  min-width: 72px;
  border-color: rgba(47, 126, 255, 0.18);
  background: linear-gradient(90deg, #3791ff 0%, #2c6eff 100%);
  color: #ffffff;
}

.token-action.secondary {
  border-color: rgba(156, 163, 175, 0.2);
  background: rgba(255, 255, 255, 0.8);
  color: #374151;
}

.token-action.secondary:hover {
  border-color: rgba(156, 163, 175, 0.3);
  background: rgba(255, 255, 255, 0.96);
}

.token-action.primary:hover {
  background: linear-gradient(90deg, #3186ef 0%, #2666ee 100%);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.upgrade-modal {
  position: relative;
  width: min(100%, 720px);
  padding: 36px 40px 40px;
  border-radius: 22px;
  background:
    linear-gradient(180deg, rgba(198, 227, 255, 0.9) 0%, rgba(220, 239, 255, 0.72) 18%, rgba(247, 249, 255, 0.12) 42%, rgba(247, 249, 255, 0) 58%),
    radial-gradient(circle at 24% 18%, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.56) 34%, transparent 68%),
    linear-gradient(180deg, #dff0ff 0%, #f7f9ff 100%);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.24);
  overflow: hidden;
}

.upgrade-close {
  position: absolute;
  top: 18px;
  right: 18px;
}

.upgrade-hero {
  display: flex;
  align-items: center;
  gap: 28px;
  margin-bottom: 26px;
  position: relative;
  z-index: 1;
}

.upgrade-art {
  position: relative;
  position: absolute;
  left: -12px;
  top: 37px;
  width: 226px;
  height: 265px;
  pointer-events: none;
  z-index: 0;
}

.upgrade-art img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}

.upgrade-copy {
  position: relative;
  z-index: 1;
  margin-left: 118px;
  min-height: 104px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.upgrade-copy h2 {
  margin: 0 0 10px;
  color: #2c3444;
  font-size: 18px;
  font-weight: 700;
}

.upgrade-copy p {
  margin: 0;
  color: #7b8797;
  font-size: 14px;
}

.upgrade-log {
  position: relative;
  z-index: 1;
  min-height: 146px;
  margin-bottom: 28px;
  padding: 22px 24px;
  border-radius: 16px;
  background: rgba(231, 236, 249, 0.82);
  color: #6c7280;
  font-size: 14px;
  line-height: 1.65;
}

.upgrade-log p {
  margin: 0;
}

.upgrade-progress {
  position: relative;
  z-index: 1;
  margin-bottom: 22px;
}

.upgrade-track {
  height: 10px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(159, 168, 184, 0.45);
}

.upgrade-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #3f9cff 0%, #2d6dff 100%);
}

.upgrade-progress-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  color: #969fb0;
  font-size: 14px;
}

.upgrade-progress-meta strong {
  color: #9aa3b2;
  font-weight: 500;
}

.upgrade-actions {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
}

.upgrade-primary {
  min-width: 204px;
  height: 44px;
  border: 0;
  border-radius: 8px;
  background: linear-gradient(90deg, #3f9cff 0%, #2d4eff 100%);
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(47, 110, 255, 0.22);
}
</style>
