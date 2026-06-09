<template>
  <div class="login-container">
    <div class="login-shell">
      <section class="visual-panel" aria-hidden="true">
        <div class="visual-brand">
          <img src="/login-brand-logo.png" alt="" />
        </div>
        <div class="visual-fill"></div>
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
              <h3 class="settings-panel-title">Token 设置</h3>
              <div class="token-row">
                <label class="token-label" for="cashier-token">收银 Token：</label>
                <div class="token-panel" :class="{ editing: tokenEditing }">
                  <template v-if="tokenEditing">
                    <div class="token-edit-block">
                      <input
                        id="cashier-token"
                        v-model="draftCashierToken"
                        class="token-input"
                        type="text"
                      />
                      <div class="token-actions">
                        <button type="button" class="token-action primary" @click="saveTokenEdit">保存</button>
                        <button type="button" class="token-action secondary" @click="cancelTokenEdit">取消</button>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div class="token-value" :title="cashierToken">{{ cashierToken }}</div>
                    <button type="button" class="token-action ghost" @click="startTokenEdit">编辑</button>
                  </template>
                </div>
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
            <img src="/upgrade-rocket.png" alt="" />
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
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const menuOpen = ref(false)
const menuRef = ref(null)
const settingDialogVisible = ref(false)
const upgradeDialogVisible = ref(false)
const tokenEditing = ref(false)
const cashierToken = ref('REGRTRHRT2434534554645adFFF')
const draftCashierToken = ref(cashierToken.value)
const upgradeProgress = ref(31)
const upgradePaused = ref(false)
const form = reactive({
  username: '',
  password: ''
})

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
  router.push('/sale')
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
  tokenEditing.value = false
  draftCashierToken.value = cashierToken.value
  settingDialogVisible.value = true
}

const closeSettingModal = () => {
  settingDialogVisible.value = false
  tokenEditing.value = false
  draftCashierToken.value = cashierToken.value
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

const startTokenEdit = () => {
  draftCashierToken.value = cashierToken.value
  tokenEditing.value = true
}

const cancelTokenEdit = () => {
  tokenEditing.value = false
  draftCashierToken.value = cashierToken.value
}

const saveTokenEdit = () => {
  cashierToken.value = draftCashierToken.value.trim() || cashierToken.value
  tokenEditing.value = false
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
  background: url('/login-hero-body.jpg') center center / cover no-repeat;
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
  width: 360px;
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

.system-portal {
  margin-top: 34px;
  padding-top: 20px;
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
