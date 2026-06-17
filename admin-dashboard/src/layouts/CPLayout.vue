<template>
  <div class="cp-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ collapsed: isCollapsed }">
      <div class="sidebar-header">
        <div class="logo-section">
          <div class="brand-icon">
            <svg viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="8" fill="url(#cpGrad)"/>
              <path d="M10 18L18 10L26 18L18 26Z" fill="white" opacity="0.9"/>
              <circle cx="18" cy="18" r="3.5" fill="white"/>
              <defs><linearGradient id="cpGrad" x1="0" y1="0" x2="36" y2="36"><stop stop-color="#3B82F6"/><stop offset="1" stop-color="#2563EB"/></linearGradient></defs>
            </svg>
          </div>
          <transition name="fade">
            <span v-show="!isCollapsed" class="logo-text">头号空间<span class="logo-sub">供应商后台</span></span>
          </transition>
        </div>
        <n-button v-if="!isCollapsed" quaternary circle size="small" @click="toggleCollapse" class="collapse-btn">
          <template #icon><n-icon :component="ChevronBackOutline" /></template>
        </n-button>
        <n-button v-else quaternary circle size="small" @click="toggleCollapse" class="collapse-btn centered">
          <template #icon><n-icon :component="ChevronForwardOutline" /></template>
        </n-button>
      </div>

      <div v-if="!isCollapsed" class="cp-badge">
        <span class="badge-dot"></span> 游戏供应商后台
      </div>

      <nav class="nav-menu">
        <n-menu
          :value="currentRoute"
          :options="menuOptions"
          :collapsed="isCollapsed"
          :collapsed-width="64"
          :collapsed-icon-size="22"
          :render-label="renderMenuLabel"
          :theme-overrides="menuThemeOverrides"
          @update:value="handleMenuUpdate"
        />
      </nav>

      <div v-if="!isCollapsed" class="sidebar-footer">
        <div class="role-switch-card" @click="showRoleModal = true">
          <n-avatar round size="small" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
            供
          </n-avatar>
          <div class="role-info">
            <div class="role-name">{{ cpName }}</div>
            <div class="role-desc">游戏供应商</div>
          </div>
          <n-icon :component="SwapHorizontalOutline" size="16" class="switch-icon" />
        </div>
      </div>

      <div v-else class="sidebar-footer-collapsed">
        <n-avatar
          round
          size="large"
          style="background: linear-gradient(135deg, #3B82F6, #2563EB); cursor: pointer;"
          @click="showRoleModal = true"
        >供</n-avatar>
      </div>
    </aside>

    <main class="main-content">
      <header class="top-header">
        <div class="header-left">
          <n-breadcrumb>
            <n-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">{{ item.label }}</n-breadcrumb-item>
          </n-breadcrumb>
        </div>
        <div class="header-right">
          <n-badge :value="unreadCount" :max="99" :show="unreadCount > 0">
            <n-button quaternary circle size="small" @click="goToMessageCenter">
              <template #icon><n-icon :component="NotificationsOutline" /></template>
            </n-button>
          </n-badge>
          <n-dropdown :options="userMenuOptions" @select="handleUserAction" placement="bottom-end" trigger="click">
            <div class="user-dropdown-trigger">
              <n-avatar round size="small" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">供</n-avatar>
              <span class="user-name">{{ cpName }}</span>
              <n-icon :component="ChevronDownOutline" size="14" class="dropdown-arrow" />
            </div>
          </n-dropdown>
        </div>
      </header>

      <div class="page-wrapper animate-fade-in">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </div>
    </main>

    <!-- 角色切换弹窗 -->
    <n-modal v-model:show="showRoleModal" preset="card" title="切换视图" style="width: 668px;" :bordered="false">
      <div class="role-switch-grid">
        <div class="role-card" @click="switchToPlatform">
          <div class="role-card-icon platform">
            <n-icon :component="ServerOutline" size="32" />
          </div>
          <div class="role-card-title">总运营后台</div>
          <div class="role-card-desc">平台级管理 · 全局数据</div>
          <n-button size="tiny" secondary>进入</n-button>
        </div>
        <div class="role-card" @click="switchToAgent">
          <div class="role-card-icon agent">
            <n-icon :component="BusinessOutline" size="32" />
          </div>
          <div class="role-card-title">代理商后台</div>
          <div class="role-card-desc">代理商管理 · 分润数据</div>
          <n-button size="tiny" secondary>进入</n-button>
        </div>
        <div class="role-card" @click="switchToShop">
          <div class="role-card-icon shop">
            <n-icon :component="StorefrontOutline" size="32" />
          </div>
          <div class="role-card-title">商家后台</div>
          <div class="role-card-desc">商家运营 · 日常管理</div>
          <n-button size="tiny" secondary>进入</n-button>
        </div>
      </div>
      <div class="role-switch-grid" style="margin-top: 12px;">
        <div class="role-card active" @click="switchToCP">
          <div class="role-card-icon cp">
            <n-icon :component="GameControllerOutline" size="32" />
          </div>
          <div class="role-card-title">供应商后台</div>
          <div class="role-card-desc">游戏管理 · 收益数据</div>
          <n-tag type="success" size="small" bordered>当前</n-tag>
        </div>
        <div class="role-card" @click="switchToPayment">
          <div class="role-card-icon payment">
            <n-icon :component="WalletOutline" size="32" />
          </div>
          <div class="role-card-title">收银系统</div>
          <div class="role-card-desc">支付配置 · 渠道管理</div>
          <n-button size="tiny" secondary>进入</n-button>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NMenu, NButton, NIcon, NAvatar, NBadge, NBreadcrumb, NBreadcrumbItem,
  NDropdown, NModal, NTag,
} from 'naive-ui'
import {
  GameControllerOutline, WalletOutline,
  DocumentTextOutline, PersonOutline, SettingsOutline,
  ChevronBackOutline, ChevronForwardOutline,
  SwapHorizontalOutline, NotificationsOutline,
  ServerOutline, BusinessOutline, StorefrontOutline,
  LogOutOutline, ShieldCheckmarkOutline, ChevronDownOutline,
  AddCircleOutline, BarChartOutline,
} from '@vicons/ionicons5'

const router = useRouter()
const route = useRoute()
const isCollapsed = ref(false)
const showRoleModal = ref(false)
const cpName = ref('极境互动科技')
const unreadCount = ref(3)

const renderIcon = (IconComp: any) => h(IconComp)

const menuThemeOverrides = {
  itemTextColor: '#e2e8f0',
  itemTextColorActive: '#ffffff',
  itemTextColorHover: '#ffffff',
  itemIconColor: 'rgba(255, 255, 255, 0.75)',
  itemIconColorActive: '#60A5FA',
  itemIconColorHover: '#ffffff',
}

const menuOptions: MenuOption[] = [
  {
    label: '数据中心',
    key: 'data-group',
    icon: renderIcon(BarChartOutline),
    children: [
      { label: '数据概览', key: '/cp/dashboard' },
      { label: '点播消费记录', key: '/cp/analytics/consumption' },
      { label: '点播游戏汇总', key: '/cp/analytics/game-summary' },
    ]
  },
  {
    label: '游戏管理',
    key: 'games-group',
    icon: renderIcon(GameControllerOutline),
    children: [
      { label: '我的游戏', key: '/cp/games' },
      { label: '上传新游戏', key: '/cp/games/add' },
    ]
  },
  {
    label: '收益管理',
    key: 'finance-group',
    icon: renderIcon(WalletOutline),
    children: [
      { label: '收益总览', key: '/cp/finance' },
      { label: '结算记录', key: '/cp/finance/detail' },
      { label: '收款账户', key: '/cp/bank-account' },
    ]
  },
]

const currentRoute = computed(() => route.path)
const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta?.title)
  return matched.map(m => ({ label: m.meta.title as string, path: m.path }))
})

const userMenuOptions = [
  { label: '供应商资料', key: 'profile' },
  { label: '安全设置', key: 'security' },
  { label: '消息通知', key: 'message' },
  { type: 'divider', key: 'd1' },
  { label: '退出登录', key: 'logout' },
]

const createOrigin = (port: number) => {
  const { protocol, hostname } = window.location
  return `${protocol}//${hostname}:${port}`
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

const cashierLoginPath = import.meta.env.PROD ? '/cashier/login' : '/login'

async function resolveCashierOrigin(path = cashierLoginPath) {
  if (import.meta.env.PROD || !window.location.port) {
    return window.location.origin
  }

  const currentPort = Number(window.location.port || 5175)
  const candidatePorts = Array.from(
    new Set([9529, currentPort - 1, 5174, 5173].filter((port) => Number.isFinite(port) && port > 0))
  )

  for (const port of candidatePorts) {
    const origin = createOrigin(port)
    if (await probeOrigin(origin, path)) {
      return origin
    }
  }

  return createOrigin(candidatePorts[0] || 5174)
}

function toggleCollapse() { isCollapsed.value = !isCollapsed.value }
function handleMenuUpdate(key: string) { router.push(key) }
function renderMenuLabel(option: MenuOption) {
  if (!option.label) return null
  return h('span', { class: 'menu-label' }, option.label as string)
}

function switchToPlatform() { showRoleModal.value = false; router.push('/platform/dashboard') }
function switchToAgent() { showRoleModal.value = false; router.push('/agent/dashboard') }
function switchToShop() { showRoleModal.value = false; router.push('/shop/workbench') }
function switchToCP() { showRoleModal.value = false }
async function switchToPayment() {
  showRoleModal.value = false
  const cashierOrigin = await resolveCashierOrigin(cashierLoginPath)
  window.location.href = `${cashierOrigin}${cashierLoginPath}`
}

function handleUserAction(key: string) {
  if (key === 'logout') router.push('/login')
  if (key === 'profile') router.push('/cp/account/info')
  if (key === 'security') router.push('/cp/account/security')
  if (key === 'message') router.push('/cp/account/message')
}
function goToMessageCenter() { router.push('/cp/account/message') }
</script>

<style scoped>
.cp-layout { display: flex; height: 100vh; overflow: hidden; }

.sidebar {
  width: 260px;
  background: linear-gradient(180deg, #0D1F3C 0%, #0A1528 100%);
  display: flex; flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative; z-index: 100;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
}
.sidebar.collapsed { width: 80px; }

.sidebar-header {
  padding: 20px 16px; display: flex; align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.logo-section { display: flex; align-items: center; gap: 12px; }
.brand-icon { width: 40px; height: 40px; flex-shrink: 0; }
.brand-icon svg { width: 100%; height: 100%; }
.logo-text {
  font-family: 'Orbitron', sans-serif; font-size: 18px; font-weight: 700;
  color: white; letter-spacing: 1px; white-space: nowrap;
}
.logo-sub {
  display: block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 11px; font-weight: 400; color: rgba(255,255,255,0.45);
  letter-spacing: 0.5px; margin-top: 2px;
}
.collapse-btn { color: rgba(255,255,255,0.5) !important; }
.collapse-btn.centered { margin: 0 auto; display: block; }
.collapse-btn:hover { color: rgba(255,255,255,0.9) !important; }

.cp-badge {
  margin: 16px 20px 8px; display: flex; align-items: center; gap: 8px;
  font-size: 11px; color: rgba(255,255,255,0.45);
  text-transform: uppercase; letter-spacing: 1.5px;
}
.badge-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #3B82F6; animation: pulse-glow 2s infinite;
}

.nav-menu { flex: 1; padding: 8px 12px; overflow-y: auto; }
:::deep(.n-menu) {
  --n-item-text-color: rgba(255, 255, 255, 0.88) !important;
  --n-item-text-color-active: #fff !important;
  --n-item-color-active: rgba(59, 130, 246, 0.2) !important;
  --n-item-icon-color: rgba(255, 255, 255, 0.7) !important;
  --n-item-icon-color-active: #60A5FA !important;
  --n-item-text-color-hover: #fff !important;
  --n-item-color-hover: rgba(255,255,255,0.08) !important;
  --n-border-color: transparent !important;
  padding: 0;
}
:::deep(.n-menu-item-content) {
  border-radius: 10px !important;
  margin: 2px 0 !important;
}
/* 子菜单项文字提亮 */
::deep(.n-submenu-children .n-menu-item-content .menu-label),
::deep(.n-menu-item-content--child-active .menu-label) {
  color: rgba(255, 255, 255, 0.85) !important;
}
::deep(.n-submenu-children .n-menu-item-content:hover .menu-label) {
  color: #fff !important;
}

.sidebar-footer { padding: 16px; border-top: 1px solid rgba(255,255,255,0.06); }
.role-switch-card {
  display: flex; align-items: center; gap: 12px; padding: 10px 14px;
  background: rgba(255,255,255,0.04); border-radius: 12px;
  cursor: pointer; transition: all 0.25s;
  border: 1px solid rgba(255,255,255,0.06);
}
.role-switch-card:hover {
  background: rgba(255,255,255,0.08);
  border-color: rgba(59, 130, 246, 0.3);
}
.role-info { flex: 1; min-width: 0; }
.role-name { font-size: 13px; font-weight: 600; color: white; }
.role-desc { font-size: 11px; color: rgba(255,255,255,0.4); }
.switch-icon { color: rgba(255,255,255,0.3); transition: transform 0.25s; }
.role-switch-card:hover .switch-icon { transform: rotate(180deg); color: #60A5FA; }
.sidebar-footer-collapsed {
  padding: 16px; display: flex; justify-content: center;
  border-top: 1px solid rgba(255,255,255,0.06);
}

.main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: var(--color-bg-base); }
.top-header {
  height: 64px; background: white; border-bottom: 1px solid var(--border-color);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 24px; flex-shrink: 0; box-shadow: var(--shadow-sm);
}
.header-right { display: flex; align-items: center; gap: 8px; }
.user-name { font-size: 13px; font-weight: 500; color: var(--text-secondary); }
.user-dropdown-trigger {
  display: flex; align-items: center; gap: 8px; cursor: pointer;
  padding: 4px 8px; margin-left: 4px; border-radius: 8px; transition: background 0.2s;
}
.user-dropdown-trigger:hover { background: var(--color-bg-elevated); }
.dropdown-arrow { color: var(--text-muted); }
.page-wrapper { flex: 1; overflow-y: auto; padding: 24px; }

.role-switch-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; padding: 8px 0; }
.role-card {
  padding: 24px 20px; border-radius: 16px; border: 2px solid var(--border-color);
  cursor: pointer; transition: all 0.3s; text-align: center; background: white;
}
.role-card:hover {
  border-color: #10B981; transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(16, 185, 129, 0.12);
}
.role-card.active {
  border-color: #3B82F6;
  background: linear-gradient(180deg, rgba(59,130,246,0.08), transparent);
}
.role-card-icon {
  width: 64px; height: 64px; border-radius: 16px; display: inline-flex;
  align-items: center; justify-content: center; margin-bottom: 12px; color: white;
}
.role-card-icon.platform { background: linear-gradient(135deg, #3B82F6, #2563EB); }
.role-card-icon.agent { background: linear-gradient(135deg, #F59E0B, #D97706); }
.role-card-icon.shop { background: linear-gradient(135deg, #10B981, #059669); }
.role-card-icon.cp { background: linear-gradient(135deg, #8B5CF6, #6D28D9); }
.role-card-icon.payment { background: linear-gradient(135deg, #0EA5E9, #0369A1); }

.role-card-title { font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
.role-card-desc { font-size: 12px; color: var(--text-muted); margin-bottom: 12px; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
@keyframes pulse-glow { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
</style>
