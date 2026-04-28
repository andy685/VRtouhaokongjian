<template>
  <div class="agent-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ collapsed: isCollapsed }">
      <!-- Logo区域 -->
      <div class="sidebar-header">
        <div class="logo-section">
          <div class="brand-icon">
            <svg viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="8" fill="url(#agentGrad)"/>
              <path d="M10 18L18 10L26 18L18 26Z" fill="white" opacity="0.9"/>
              <circle cx="18" cy="18" r="3.5" fill="white"/>
              <defs><linearGradient id="agentGrad" x1="0" y1="0" x2="36" y2="36"><stop stop-color="#F59E0B"/><stop offset="1" stop-color="#D97706"/></linearGradient></defs>
            </svg>
          </div>
          <transition name="fade">
            <span v-show="!isCollapsed" class="logo-text">头号空间<span class="logo-sub">代理商后台</span></span>
          </transition>
        </div>
        <n-button v-if="!isCollapsed" quaternary circle size="small" @click="toggleCollapse" class="collapse-btn">
          <template #icon><n-icon :component="ChevronBackOutline" /></template>
        </n-button>
        <n-button v-else quaternary circle size="small" @click="toggleCollapse" class="collapse-btn centered">
          <template #icon><n-icon :component="ChevronForwardOutline" /></template>
        </n-button>
      </div>

      <!-- 代理商标识 -->
      <div v-if="!isCollapsed" class="agent-badge">
        <span class="badge-dot"></span> 代理商后台
      </div>

      <!-- 导航菜单 -->
      <nav class="nav-menu">
        <n-menu
          :value="currentRoute"
          :options="menuOptions"
          :collapsed="isCollapsed"
          :collapsed-width="64"
          :collapsed-icon-size="22"
          :render-label="renderMenuLabel"
          @update:value="handleMenuUpdate"
        />
      </nav>

      <!-- 底部角色切换 -->
      <div v-if="!isCollapsed" class="sidebar-footer">
        <div class="role-switch-card" @click="showRoleModal = true">
          <n-avatar round size="small" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
            代
          </n-avatar>
          <div class="role-info">
            <div class="role-name">{{ agentName }}</div>
            <div class="role-desc">代理商</div>
          </div>
          <n-icon :component="SwapHorizontalOutline" size="16" class="switch-icon" />
        </div>
      </div>

      <div v-else class="sidebar-footer-collapsed">
        <n-avatar
          round
          size="large"
          style="background: linear-gradient(135deg, #F59E0B, #D97706); cursor: pointer;"
          @click="showRoleModal = true"
        >代</n-avatar>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 顶部导航 -->
      <header class="top-header">
        <div class="header-left">
          <n-breadcrumb>
            <n-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">{{ item.label }}</n-breadcrumb-item>
          </n-breadcrumb>
        </div>

        <div class="header-right">
          <n-input placeholder="搜索..." size="small" round clearable style="width: 200px;">
            <template #prefix>
              <n-icon :component="SearchOutline" />
            </template>
          </n-input>

          <n-badge :value="2" :max="99">
            <n-button quaternary circle size="small">
              <template #icon><n-icon :component="NotificationsOutline" /></template>
            </n-button>
          </n-badge>

          <n-dropdown :options="userMenuOptions" @select="handleUserAction">
            <n-avatar
              round
              size="small"
              style="background: linear-gradient(135deg, #F59E0B, #D97706); cursor: pointer; margin-left: 12px;"
            >代</n-avatar>
          </n-dropdown>

          <span class="user-name">{{ agentName }}</span>
        </div>
      </header>

      <!-- 页面内容 -->
      <div class="page-wrapper animate-fade-in">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </div>
    </main>

    <!-- 角色切换弹窗 -->
    <n-modal v-model:show="showRoleModal" preset="card" title="切换视图" style="width: 480px;" :bordered="false">
      <div class="role-switch-grid">
        <div class="role-card" @click="switchToPlatform">
          <div class="role-card-icon platform">
            <n-icon :component="ServerOutline" size="32" />
          </div>
          <div class="role-card-title">总运营后台</div>
          <div class="role-card-desc">平台级管理 · 全局数据</div>
          <n-button size="tiny" secondary>进入</n-button>
        </div>

        <div class="role-card active" @click="switchToAgent">
          <div class="role-card-icon agent">
            <n-icon :component="BusinessOutline" size="32" />
          </div>
          <div class="role-card-title">代理商后台</div>
          <div class="role-card-desc">代理商管理 · 分润数据</div>
          <n-tag type="success" size="small" bordered>当前</n-tag>
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
import type { MenuOption } from 'naive-ui'
import {
  HomeOutline, PeopleOutline, StorefrontOutline, StatsChartOutline,
  WalletOutline, SettingsOutline, ChevronBackOutline, ChevronForwardOutline,
  SwapHorizontalOutline, SearchOutline, NotificationsOutline,
  ServerOutline, BusinessOutline, LogOutOutline, PersonOutline,
} from '@vicons/ionicons5'

const router = useRouter()
const route = useRoute()
const isCollapsed = ref(false)
const showRoleModal = ref(false)
const agentName = ref('深圳未来科技')

// 代理商菜单配置
const menuOptions: MenuOption[] = [
  {
    label: '首页概览',
    key: '/agent/dashboard',
    icon: () => h(NIcon, { component: HomeOutline }),
  },
  {
    label: '商家管理',
    key: 'merchants-group',
    icon: () => h(NIcon, { component: PeopleOutline }),
    children: [
      { label: '商家列表', key: '/agent/merchants' },
    ]
  },
  {
    label: '店铺概览',
    key: 'stores-group',
    icon: () => h(NIcon, { component: StorefrontOutline }),
    children: [
      { label: '店铺列表', key: '/agent/stores' },
      { label: '设备统计', key: '/agent/stores/devices' },
    ]
  },
  {
    label: '分润中心',
    key: 'commission-group',
    icon: () => h(NIcon, { component: WalletOutline }),
    children: [
      { label: '分润明细', key: '/agent/commission' },
      { label: '结算记录', key: '/agent/settlement' },
    ]
  },
  {
    label: '数据报表',
    key: 'reports-group',
    icon: () => h(NIcon, { component: StatsChartOutline }),
    children: [
      { label: '营收统计', key: '/agent/reports/revenue' },
      { label: '会员统计', key: '/agent/reports/members' },
    ]
  },
  {
    label: '账户设置',
    key: 'settings-group',
    icon: () => h(NIcon, { component: SettingsOutline }),
    children: [
      { label: '账户信息', key: '/agent/account' },
      { label: '安全设置', key: '/agent/account/security' },
    ]
  },
]

const currentRoute = computed(() => route.path)

const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta?.title)
  return matched.map(m => ({ label: m.meta.title as string, path: m.path }))
})

const userMenuOptions = [
  { label: '账户信息', key: 'account', icon: () => h(NIcon, null, { default: () => h(PersonOutline) }) },
  { type: 'divider', key: 'd1' },
  { label: '退出登录', key: 'logout', icon: () => h(NIcon, null, { default: () => h(LogOutOutline) }) },
]

function toggleCollapse() { isCollapsed.value = !isCollapsed.value }
function handleMenuUpdate(key: string) { router.push(key) }
function renderMenuLabel(option: MenuOption) {
  if (!option.label) return null
  return h('span', { class: 'menu-label' }, option.label as string)
}

function switchToPlatform() {
  showRoleModal.value = false
  router.push('/platform/dashboard')
}
function switchToAgent() {
  showRoleModal.value = false
}
function switchToShop() {
  showRoleModal.value = false
  router.push('/shop/workbench')
}
function handleUserAction(key: string) {
  if (key === 'logout') router.push('/login')
  if (key === 'account') router.push('/agent/account')
}
</script>

<style scoped>
.agent-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* ===== 侧边栏 ===== */
.sidebar {
  width: 260px;
  background: linear-gradient(180deg, #1A0E00 0%, #0D1F3C 100%);
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 100;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
}

.sidebar.collapsed {
  width: 80px;
}

.sidebar-header {
  padding: 20px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}
.brand-icon svg { width: 100%; height: 100%; }

.logo-text {
  font-family: 'Orbitron', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: white;
  letter-spacing: 1px;
  white-space: nowrap;
}

.logo-sub {
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 11px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.45);
  letter-spacing: 0.5px;
  margin-top: 2px;
}

.collapse-btn { color: rgba(255,255,255,0.5) !important; }
.collapse-btn.centered { margin: 0 auto; display: block; }
.collapse-btn:hover { color: rgba(255,255,255,0.9) !important; }

/* 代理商标识 */
.agent-badge {
  margin: 16px 20px 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: rgba(255,255,255,0.45);
  text-transform: uppercase;
  letter-spacing: 1.5px;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #F59E0B;
  animation: pulse-glow 2s infinite;
}

/* 导航菜单 */
.nav-menu {
  flex: 1;
  padding: 8px 12px;
  overflow-y: auto;
}

:deep(.n-menu) {
  --n-item-text-color: rgba(255, 255, 255, 0.75) !important;
  --n-item-text-color-active: #fff !important;
  --n-item-color-active: rgba(245, 158, 11, 0.2) !important;
  --n-item-icon-color: rgba(255, 255, 255, 0.6) !important;
  --n-item-icon-color-active: #FBBF24 !important;
  --n-item-text-color-hover: rgba(255,255,255,0.9) !important;
  --n-item-color-hover: rgba(255,255,255,0.06) !important;
  --n-border-color: transparent !important;
  padding: 0;
}

:deep(.n-menu-item-content) {
  border-radius: 10px !important;
  margin: 2px 0 !important;
}

/* 底部角色卡片 */
.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(255,255,255,0.06);
}

.role-switch-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(255,255,255,0.04);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s;
  border: 1px solid rgba(255,255,255,0.06);
}

.role-switch-card:hover {
  background: rgba(255,255,255,0.08);
  border-color: rgba(245, 158, 11, 0.3);
}

.role-info { flex: 1; min-width: 0; }
.role-name { font-size: 13px; font-weight: 600; color: white; }
.role-desc { font-size: 11px; color: rgba(255,255,255,0.4); }

.switch-icon { color: rgba(255,255,255,0.3); transition: transform 0.25s; }
.role-switch-card:hover .switch-icon { transform: rotate(180deg); color: #FBBF24; }

.sidebar-footer-collapsed {
  padding: 16px;
  display: flex;
  justify-content: center;
  border-top: 1px solid rgba(255,255,255,0.06);
}

/* ===== 主内容区 ===== */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-bg-base);
}

.top-header {
  height: 64px;
  background: white;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.page-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

/* ===== 角色切换弹窗 ===== */
.role-switch-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  padding: 8px 0;
}

.role-card {
  padding: 24px 20px;
  border-radius: 16px;
  border: 2px solid var(--border-color);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  background: white;
}

.role-card:hover {
  border-color: #F59E0B;
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(245, 158, 11, 0.12);
}

.role-card.active {
  border-color: #F59E0B;
  background: linear-gradient(180deg, rgba(245,158,11,0.08), transparent);
}

.role-card-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  color: white;
}

.role-card-icon.platform { background: linear-gradient(135deg, #3B82F6, #2563EB); }
.role-card-icon.agent { background: linear-gradient(135deg, #F59E0B, #D97706); }
.role-card-icon.shop { background: linear-gradient(135deg, #10B981, #059669); }

.role-card-title { font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
.role-card-desc { font-size: 12px; color: var(--text-muted); margin-bottom: 12px; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@keyframes pulse-glow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
