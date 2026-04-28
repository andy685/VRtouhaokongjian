<template>
  <div class="platform-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ collapsed: isCollapsed }">
      <!-- Logo区域 -->
      <div class="sidebar-header">
        <div class="logo-section">
          <div class="logo-icon">
            <svg viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="url(#logoGrad)"/>
              <path d="M12 20L20 12L28 20L20 28Z" fill="white" opacity="0.9"/>
              <circle cx="20" cy="20" r="4" fill="white"/>
              <defs><linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40"><stop stop-color="#3B82F6"/><stop offset="1" stop-color="#8B5CF6"/></linearGradient></defs>
            </svg>
          </div>
          <transition name="fade">
            <span v-show="!isCollapsed" class="logo-text">头号空间<span class="logo-sub">运营后台</span></span>
          </transition>
        </div>
        <n-button v-if="!isCollapsed" quaternary circle size="small" @click="toggleCollapse" class="collapse-btn">
          <template #icon><n-icon :component="ChevronBackOutline" /></template>
        </n-button>
        <n-button v-else quaternary circle size="small" @click="toggleCollapse" class="collapse-btn centered">
          <template #icon><n-icon :component="ChevronForwardOutline" /></template>
        </n-button>
      </div>

      <!-- 平台标识 -->
      <div v-if="!isCollapsed" class="platform-badge">
        <span class="badge-dot"></span> 总运营后台
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
          @update:expanded-keys="handleExpand"
        />
      </nav>

      <!-- 底部角色切换 -->
      <div v-if="!isCollapsed" class="sidebar-footer">
        <div class="role-switch-card" @click="showRoleModal = true">
          <div class="role-avatar">
            <n-avatar round size="small" style="background: linear-gradient(135deg, #3B82F6, #8B5CF6);">
              超
            </n-avatar>
          </div>
          <div class="role-info">
            <div class="role-name">平台超管</div>
            <div class="role-desc">全局管理权限</div>
          </div>
          <n-icon :component="SwapHorizontalOutline" size="16" class="switch-icon" />
        </div>
      </div>

      <div v-else class="sidebar-footer-collapsed">
        <n-avatar 
          round 
          size="large" 
          style="background: linear-gradient(135deg, #3B82F6, #8B5CF6); cursor: pointer;"
          @click="showRoleModal = true"
        >超</n-avatar>
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
          <!-- 搜索 -->
          <n-input placeholder="搜索..." size="small" round clearable style="width: 200px;">
            <template #prefix>
              <n-icon :component="SearchOutline" />
            </template>
          </n-input>
          
          <!-- 通知 -->
          <n-badge :value="3" :max="99">
            <n-button quaternary circle size="small">
              <template #icon><n-icon :component="NotificationsOutline" /></template>
            </n-button>
          </n-badge>
          
          <!-- 用户菜单 -->
          <n-dropdown :options="userMenuOptions" @select="handleUserAction">
            <n-avatar 
              round 
              size="small"
              style="background: linear-gradient(135deg, #3B82F6, #8B5CF6); cursor: pointer; margin-left: 12px;"
            >管</n-avatar>
          </n-dropdown>
          
          <span class="user-name">管理员</span>
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
        <div 
          class="role-card active" 
          @click="switchToPlatform"
        >
          <div class="role-card-icon platform">
            <n-icon :component="ServerOutline" size="32" />
          </div>
          <div class="role-card-title">总运营后台</div>
          <div class="role-card-desc">平台级管理 · 全局数据</div>
          <n-tag type="success" size="small" bordered>当前</n-tag>
        </div>
        
        <div 
          class="role-card" 
          @click="switchToShop"
        >
          <div class="role-card-icon shop">
            <n-icon :component="StorefrontOutline" size="32" />
          </div>
          <div class="role-card-title">店铺后台</div>
          <div class="role-card-desc">店铺运营 · 日常管理</div>
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
  NInput, NDropdown, NModal, NTag,
} from 'naive-ui'
import type { MenuOption } from 'naive-ui'
import {
  GridOutline, StorefrontOutline, GameControllerOutline, WalletOutline,
  SettingsOutline, ChevronBackOutline, ChevronForwardOutline,
  SwapHorizontalOutline, SearchOutline, NotificationsOutline,
  ServerOutline, LogOutOutline, PersonOutline, PeopleOutline,
  GiftOutline, ConstructOutline, TrendingUpOutline, ReceiptOutline,
  BarChartOutline, PulseOutline
} from '@vicons/ionicons5'

const router = useRouter()
const route = useRoute()
const isCollapsed = ref(false)
const showRoleModal = ref(false)

// 菜单配置 - 二级菜单结构
const menuOptions: MenuOption[] = [
  {
    label: '数据中心',
    key: 'dashboard-group',
    icon: () => h(NIcon, { component: GridOutline }),
    children: [
      { label: '大屏看板', key: '/platform/dashboard' },
      { label: '数据报表', key: '/platform/reports' },
      { label: '内容消费大盘', key: '/platform/content-consumption' },
      { label: '设备运行总览', key: '/platform/device-overview' },
    ]
  },
  {
    label: '店铺管理',
    key: 'stores-group',
    icon: () => h(NIcon, { component: StorefrontOutline }),
    children: [
      { label: '店铺列表', key: '/platform/stores' },
      { label: '店铺审核', key: '/platform/stores/audit' },
      { label: '代理商', key: '/platform/agents' },
    ]
  },
  {
    label: '内容中心',
    key: 'content-group',
    icon: () => h(NIcon, { component: GameControllerOutline }),
    children: [
      { label: '游戏库', key: '/platform/games' },
      { label: '内容分发', key: '/platform/content' },
      { label: '审核管理', key: '/platform/content/review' },
    ]
  },
  {
    label: '平台账号',
    key: 'users-group',
    icon: () => h(NIcon, { component: PeopleOutline }),
    children: [
      { label: '账号管理', key: '/platform/users' },
      { label: '角色权限', key: '/platform/users/roles' },
    ]
  },
  {
    label: '游戏豆销售',
    key: 'gamebean-group',
    icon: () => h(NIcon, { component: TrendingUpOutline }),
    children: [
      { label: '销售总览', key: '/platform/gamebean-sales' },
      { label: '销售明细', key: '/platform/gamebean-sales/detail' },
    ]
  },
  {
    label: '会员中心',
    key: 'member-group',
    icon: () => h(NIcon, { component: PeopleOutline }),
    children: [
      { label: '会员数据', key: '/platform/members' },
      { label: '会员增长', key: '/platform/members/growth' },
    ]
  },
  {
    label: '订单流水',
    key: 'order-group',
    icon: () => h(NIcon, { component: ReceiptOutline }),
    children: [
      { label: '订单透视', key: '/platform/order-flow' },
    ]
  },
  {
    label: '平台财务',
    key: 'finance-group',
    icon: () => h(NIcon, { component: WalletOutline }),
    children: [
      { label: '财务总览', key: '/platform/finance' },
      { label: '结算管理', key: '/platform/finance/settlement' },
      { label: '对账中心', key: '/platform/finance/reconciliation' },
    ]
  },
  {
    label: '系统运维',
    key: 'system-group',
    icon: () => h(NIcon, { component: SettingsOutline }),
    children: [
      { label: '版本发布', key: '/platform/system' },
      { label: '告警中心', key: '/platform/system/alerts' },
      { label: '操作日志', key: '/platform/system/logs' },
    ]
  },
  {
    label: '运维支持',
    key: 'support-group',
    icon: () => h(NIcon, { component: ConstructOutline }),
    children: [
      { label: '工单系统', key: '/platform/support/tickets' },
      { label: '帮助中心', key: '/platform/support/help' },
    ]
  }
]

const currentRoute = computed(() => route.path)

const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta?.title)
  return matched.map(m => ({ label: m.meta.title as string, path: m.path }))
})

const userMenuOptions = [
  { label: '个人中心', key: 'profile', icon: () => h(NIcon, null, { default: () => h(PersonOutline) }) },
  { type: 'divider', key: 'd1' },
  { label: '退出登录', key: 'logout', icon: () => h(NIcon, null, { default: () => h(LogOutOutline) }) },
]

function toggleCollapse() { isCollapsed.value = !isCollapsed.value }
function handleMenuUpdate(key: string) { router.push(key) }
function handleExpand() {}

function renderMenuLabel(option: MenuOption) {
  if (!option.label) return null
  return h('span', { class: 'menu-label' }, option.label as string)
}

function switchToShop() {
  showRoleModal.value = false
  router.push('/shop/workbench')
}

function switchToPlatform() {
  showRoleModal.value = false
}

function handleUserAction(key: string) {
  if (key === 'logout') {
    router.push('/login')
  }
}
</script>

<style scoped>
.platform-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* ===== 侧边栏 ===== */
.sidebar {
  width: 260px;
  background: var(--color-sidebar);
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

.logo-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.logo-icon svg {
  width: 100%;
  height: 100%;
}

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

.collapse-btn {
  color: rgba(255,255,255,0.5) !important;
}
.collapse-btn.centered {
  margin: 0 auto;
  display: block;
}
.collapse-btn:hover {
  color: rgba(255,255,255,0.9) !important;
}

/* 平台标识 */
.platform-badge {
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
  background: var(--gradient-brand);
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
  --n-item-color-active: rgba(59, 130, 246, 0.2) !important;
  --n-item-icon-color: rgba(255, 255, 255, 0.6) !important;
  --n-item-icon-color-active: #60A5FA !important;
  --n-item-text-color-hover: rgba(255,255,255,0.9) !important;
  --n-item-color-hover: rgba(255,255,255,0.06) !important;
  --n-border-color: transparent !important;
  padding: 0;
}

:deep(.n-menu-item-content) {
  border-radius: 10px !important;
  margin: 2px 0 !important;
}

.menu-item-custom {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
}

.menu-label {
  white-space: nowrap;
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
  border-color: rgba(59,130,246,0.3);
}

.role-info {
  flex: 1;
  min-width: 0;
}

.role-name {
  font-size: 13px;
  font-weight: 600;
  color: white;
}

.role-desc {
  font-size: 11px;
  color: rgba(255,255,255,0.4);
}

.switch-icon {
  color: rgba(255,255,255,0.3);
  transition: transform 0.25s;
}

.role-switch-card:hover .switch-icon {
  transform: rotate(180deg);
  color: var(--color-primary-light);
}

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

/* 顶部导航 */
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

/* 页面内容 */
.page-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

/* ===== 角色切换弹窗 ===== */
.role-switch-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
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
  border-color: var(--color-primary-light);
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(59, 130, 246, 0.12);
}

.role-card.active {
  border-color: var(--color-primary);
  background: var(--gradient-glow);
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

.role-card-icon.platform {
  background: linear-gradient(135deg, #3B82F6, #2563EB);
}

.role-card-icon.shop {
  background: linear-gradient(135deg, #10B981, #059669);
}

.role-card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.role-card-desc {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 12px;
}

/* 动画过渡 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
