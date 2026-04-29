<template>
  <div class="shop-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ collapsed: isCollapsed }">
      <!-- Logo -->
      <div class="sidebar-header">
        <div class="logo-section">
          <div class="brand-icon">
            <svg viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="8" fill="url(#brandGrad)"/>
              <path d="M10 18L18 10L26 18L18 26Z" fill="white" opacity="0.9"/>
              <circle cx="18" cy="18" r="3.5" fill="white"/>
              <defs><linearGradient id="brandGrad" x1="0" y1="0" x2="36" y2="36"><stop stop-color="#3B82F6"/><stop offset="1" stop-color="#2563EB"/></linearGradient></defs>
            </svg>
          </div>
          <transition name="fade">
            <span v-show="!isCollapsed" class="logo-text">头号空间<span class="logo-sub">店铺管理</span></span>
          </transition>
        </div>
        <n-button v-if="!isCollapsed" quaternary circle size="small" @click="toggleCollapse">
          <template #icon><n-icon :component="ChevronBackOutline" /></template>
        </n-button>
        <n-button v-else quaternary circle size="small" @click="toggleCollapse" class="collapse-btn-centered">
          <template #icon><n-icon :component="ChevronForwardOutline" /></template>
        </n-button>
      </div>

      <!-- 导航菜单 -->
      <nav class="nav-menu">
        <n-menu
          :value="currentRoute"
          :options="menuOptions"
          :collapsed="isCollapsed"
          :collapsed-width="64"
          :render-label="renderMenuLabel"
          @update:value="handleMenuUpdate"
        />
      </nav>

      <!-- 角色切换 -->
      <div class="sidebar-footer">
        <div class="role-switch-card" @click="showRoleModal = true">
          <n-avatar round size="small" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">店</n-avatar>
          <div v-if="!isCollapsed" class="role-info">
            <div class="role-name">王小丫</div>
            <div class="role-desc">店长</div>
          </div>
          <n-icon :component="SwapHorizontalOutline" size="16" class="switch-icon" />
        </div>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 顶部导航 -->
      <header class="top-header">
        <div class="header-left">
          <n-breadcrumb>
            <n-breadcrumb-item
              v-for="(item, index) in breadcrumbs"
              :key="index"
              @click="item.path ? router.push(item.path) : undefined"
              :style="item.path ? 'cursor:pointer' : ''"
            >{{ item.label }}</n-breadcrumb-item>
          </n-breadcrumb>
        </div>
        
        <div class="header-right">
          <n-badge :value="5" :max="99">
            <n-button quaternary circle size="small" @click="goToMessageCenter">
              <template #icon><n-icon :component="NotificationsOutline" /></template>
            </n-button>
          </n-badge>
          
          <n-dropdown :options="userMenuOptions" @select="handleUserAction">
            <div class="user-dropdown-trigger">
              <n-avatar
                round
                size="small"
                style="background: linear-gradient(135deg, #3B82F6, #2563EB);"
              >王</n-avatar>
              <span class="user-name">王小丫</span>
              <n-icon :component="ChevronDownOutline" size="14" class="dropdown-arrow" />
            </div>
          </n-dropdown>
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
    <n-modal v-model:show="showRoleModal" preset="card" title="切换视图" style="width: 680px;" :bordered="false">
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
        
        <div class="role-card active" @click="switchToShop">
          <div class="role-card-icon shop">
            <n-icon :component="StorefrontOutline" size="32" />
          </div>
          <div class="role-card-title">商家后台</div>
          <div class="role-card-desc">商家运营 · 日常管理</div>
          <n-tag type="success" size="small" bordered>当前</n-tag>
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
  NSelect, NDropdown, NModal, NTag,
} from 'naive-ui'
import type { MenuOption } from 'naive-ui'
import {
  BarChartOutline, PeopleOutline, PeopleCircleOutline, HardwareChipOutline,
  StatsChartOutline, BagHandleOutline, GiftOutline,
  SettingsOutline, ChevronBackOutline, ChevronForwardOutline,
  SwapHorizontalOutline, NotificationsOutline,
  ServerOutline, StorefrontOutline, BusinessOutline, CashOutline,
  PersonAddOutline, LogOutOutline, PersonOutline,
  HelpCircleOutline, HomeOutline,
  MailOutline, ChatbubbleOutline, WalletOutline, ShieldCheckmarkOutline, BookOutline,
  ChevronDownOutline
} from '@vicons/ionicons5'

const router = useRouter()
const route = useRoute()
const isCollapsed = ref(false)
const showRoleModal = ref(false)
const selectedShop = ref('futian')

// 当前店铺信息
const currentShop = computed(() => ({
  name: '深圳福田旗舰店',
  status: 'online',
  statusText: '营业中'
}))

const shopOptions = [
  { label: '深圳福田旗舰店', value: 'futian' },
  { label: '南山科技园店', value: 'nanshan' },
  { label: '宝安中心店', value: 'baoan' },
]

// 菜单配置 - 新结构
const menuOptions: MenuOption[] = [
  {
    label: '首页',
    key: '/shop/workbench',
    icon: () => h(NIcon, { component: HomeOutline }),
  },
  {
    label: '商品管理',
    key: 'products-group',
    icon: () => h(NIcon, { component: BagHandleOutline }),
    children: [
      { label: '单次消费项目', key: '/shop/single-consumption' },
      { label: '实物商品', key: '/shop/products' },
    ]
  },
  {
    label: '运营管理',
    key: 'marketing-group',
    icon: () => h(NIcon, { component: GiftOutline }),
    children: [
      { label: '充值套餐', key: '/shop/recharge' },
      { label: '套票', key: '/shop/packages' },
      { label: '优惠券', key: '/shop/coupons' },
      { label: '促销', key: '/shop/promotions' },
      { label: '活动赠送', key: '/shop/gifts' },
      {
        label: '短信管理',
        key: 'sms-group',
        children: [
          { label: '短信模板', key: '/shop/sms-templates' },
          { label: '短信服务', key: '/shop/sms' },
        ]
      },
    ]
  },
  {
    label: '会员管理',
    key: 'members-group',
    icon: () => h(NIcon, { component: PeopleOutline }),
    children: [
      { label: '会员列表', key: '/shop/members' },
      { label: '会员级别', key: '/shop/member-levels' },
      { label: '会员消费排行', key: '/shop/member-ranking' },
      { label: '会员储值变更', key: '/shop/member-balance' },
      { label: '会员游戏币查询', key: '/shop/member-points-query' },
      { label: '游戏币调整有效期查询', key: '/shop/member-points-adjust-log' },
      { label: '会员预存次数查询', key: '/shop/member-prepaid-times-query' },
      { label: '次数调整有效查询', key: '/shop/times-adjust-log' },
    ]
  },
  {
    label: '数据报表',
    key: 'reports-group',
    icon: () => h(NIcon, { component: StatsChartOutline }),
    children: [
      { label: '店铺销售日报', key: '/shop/daily-sales' },
      { label: '历史营收统计', key: '/shop/historical-revenue' },
      { label: '渠道营收统计', key: '/shop/channel-revenue' },
      { label: '售品销售报表', key: '/shop/product-sales' },
      { label: '账户金额统计', key: '/shop/account-stats' },
      { label: '交接班记录', key: '/shop/shifts' },
      { label: '员工点播', key: '/shop/staff-orders' },
      {
        label: '点播数据',
        key: 'on-demand-group',
        children: [
          { label: '点播游戏记录', key: '/shop/on-demand-game-record' },
          { label: '点播消费记录', key: '/shop/on-demand-film-record' },
          { label: '点播设备汇总', key: '/shop/on-demand-device-summary' },
          { label: '点播游戏汇总', key: '/shop/on-demand-game-summary' },
        ]
      },
      {
        label: '订单查询',
        key: 'order-group',
        children: [
          { label: '收银订单', key: '/shop/cashier-order' },
          { label: '点播系统订单', key: '/shop/ondemand-order' },
          { label: '手动扣费订单', key: '/shop/manual-deduct-order' },
          { label: '修改储值订单', key: '/shop/edit-balance-order' },
          { label: '游戏币兑换订单', key: '/shop/points-exchange-order' },
          { label: '活动赠送订单', key: '/shop/gift-order' },
        ]
      },
      { label: '影片分成明细', key: '/shop/film-revenue' },
      { label: '结算记录', key: '/shop/settlement' },
    ]
  },
  {
    label: '系统设置',
    key: 'settings-group',
    icon: () => h(NIcon, { component: SettingsOutline }),
    children: [
      { label: '店铺列表', key: '/shop/store-list' },
      { label: '点播设置', key: '/shop/on-demand-settings' },
      { label: '设备列表', key: '/shop/devices' },
      { label: '设备在线统计', key: '/shop/devices/online-stats' },
      { label: '影片题材', key: '/shop/film-genres' },
      {
        label: '收银设置',
        key: 'cashier-settings-group',
        children: [
          { label: '收银终端', key: '/shop/cashier-terminal' },
          { label: '支付设置', key: '/shop/cashier-settings' },
          { label: '小票设置', key: '/shop/cashier-receipt' },
        ]
      },
      { label: '游戏币设置', key: '/shop/points-settings' },
      { label: '系统参数', key: '/shop/system-params' },
      {
        label: '用户管理',
        key: 'users-group',
        children: [
          { label: '用户列表', key: '/shop/users' },
          { label: '角色列表', key: '/shop/roles' },
        ]
      },
    ]
  },
]


const currentRoute = computed(() => route.path)
const breadcrumbs = computed<{ label: string; path?: string }[]>(() => {
  const meta = route.meta as any
  if (meta?.breadcrumb && Array.isArray(meta.breadcrumb)) {
    return meta.breadcrumb
  }
  // 降级：用 matched 的 title
  return route.matched
    .filter(item => item.meta?.title)
    .map(m => ({ label: m.meta.title as string, path: m.path }))
})

const userMenuOptions = [
  { label: '商家信息', key: 'shop-info', icon: () => h(NIcon, { component: StorefrontOutline }) },
  { label: '个人信息', key: 'profile', icon: () => h(NIcon, { component: PersonOutline }) },
  { label: '账户余额', key: 'balance', icon: () => h(NIcon, { component: WalletOutline }) },
  { label: '安全设置', key: 'security', icon: () => h(NIcon, { component: ShieldCheckmarkOutline }) },
  { type: 'divider', key: 'd1' },
  { label: '退出', key: 'logout', icon: () => h(NIcon, { component: LogOutOutline }) },
]

function toggleCollapse() { isCollapsed.value = !isCollapsed.value }
function handleMenuUpdate(key: string) {
  if (key.startsWith('/')) {
    router.push(key)
  }
}

function switchToPlatform() {
  showRoleModal.value = false
  router.push('/platform/dashboard')
}
function switchToAgent() {
  showRoleModal.value = false
  router.push('/agent/dashboard')
}
function switchToShop() { showRoleModal.value = false }
function quickAction(action: string) {
  if (action === 'cashier') console.log('打开收银')
  else if (action === 'member') router.push('/shop/members')
}
function handleUserAction(key: string) {
  if (key === 'logout') {
    router.push('/login')
  } else if (key === 'balance') router.push('/shop/account/balance')
  else if (key === 'profile') router.push('/shop/account/profile')
  else if (key === 'security') router.push('/shop/account/security')
  else if (key === 'shop-info') router.push('/shop/account/shop-info')
  else if (key === 'bind-wechat') router.push('/shop/account/profile')
  else if (key === 'bind-email') router.push('/shop/account/profile')
}

function goToMessageCenter() {
  router.push('/shop/account/message')
}

function renderMenuLabel(option: MenuOption) {
  if (!option.label) return null
  return h('span', { class: 'menu-label' }, option.label as string)
}
</script>

<style scoped>
.shop-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* ===== 侧边栏 - 店铺风格 ===== */
.sidebar {
  width: 260px;
  background: linear-gradient(180deg, #0D1F3C 0%, #0A1528 100%);
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

.collapse-btn-centered {
  margin: 0 auto;
  display: block;
  color: rgba(255,255,255,0.5) !important;
}

/* 店铺标识 */
.shop-badge {
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
  width: 6px; height: 6px;
  border-radius: 50%;
  animation: pulse-glow 2s infinite;
}
.badge-dot.online { background: #3B82F6; }

/* 导航菜单 */
.nav-menu {
  flex: 1;
  padding: 8px 12px;
  overflow-y: auto;
}

:deep(.n-menu) {
  --n-item-text-color: rgba(255, 255, 255, 0.75) !important;
  --n-item-text-color-active: #fff !important;
  --n-item-color-active: rgba(16, 185, 129, 0.2) !important;
  --n-item-icon-color: rgba(255, 255, 255, 0.6) !important;
  --n-item-icon-color-active: #60A5FA !important;
  --n-item-icon-color-hover: #ffffff !important;
  --n-item-text-color-hover: rgba(255,255,255,0.9) !important;
  --n-item-color-hover: rgba(255,255,255,0.06) !important;
  --n-border-color: transparent !important;
  --n-arrow-color: #666 !important;
  padding: 0;
}

:deep(.n-menu-item-content) {
  border-radius: 10px !important;
  margin: 2px 0 !important;
}

:deep(.n-menu-item-content__arrow) {
  color: #666 !important;
}

.menu-item-custom {
  display: flex; align-items: center; gap: 12px;
  font-size: 14px; font-weight: 500;
}

/* 快捷统计 */
.quick-stats {
  padding: 16px;
  background: rgba(255,255,255,0.03);
  border-top: 1px solid rgba(255,255,255,0.06);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 8px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 11px;
  color: rgba(255,255,255,0.4);
  display: block;
  margin-bottom: 2px;
}

.stat-value {
  font-family: 'Orbitron', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: white;
}

.stat-value.success { color: #60A5FA; }

.stat-divider {
  width: 1px;
  background: rgba(255,255,255,0.08);
}

/* 底部角色 */
.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(255,255,255,0.06);
}

.role-switch-card {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 14px; background: rgba(255,255,255,0.04);
  border-radius: 12px; cursor: pointer;
  transition: all 0.25s;
  border: 1px solid rgba(255,255,255,0.06);
}

.role-switch-card:hover {
  background: rgba(255,255,255,0.08);
  border-color: rgba(59,130,246,0.3);
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

/* ===== 主内容区 ===== */
.main-content {
  flex: 1; display: flex; flex-direction: column; overflow: hidden;
  background: var(--color-bg-base);
}

.top-header {
  height: 64px; background: white; border-bottom: 1px solid var(--border-color);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 24px; flex-shrink: 0; box-shadow: var(--shadow-sm);
}

.header-left, .header-right { display: flex; align-items: center; gap: 8px; }

.user-dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  margin-left: 4px;
  border-radius: 8px;
  transition: background 0.2s;
}
.user-dropdown-trigger:hover {
  background: var(--color-bg-elevated);
}
.user-name { font-size: 13px; font-weight: 500; color: var(--text-secondary); }
.dropdown-arrow { color: var(--text-muted); }

.page-wrapper {
  flex: 1; overflow-y: auto; padding: 24px;
}

/* ===== 角色切换弹窗 ===== */
.role-switch-grid {
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; padding: 8px 0;
}

.role-card {
  padding: 24px 20px; border-radius: 16px; border: 2px solid var(--border-color);
  cursor: pointer; transition: all 0.3s; text-align: center; background: white;
}
.role-card:hover { border-color: #3B82F6; transform: translateY(-2px); box-shadow: 0 8px 30px rgba(59,130,246,0.12); }
.role-card.active { border-color: #10B981; background: linear-gradient(180deg, rgba(16,185,129,0.08), transparent); }

.role-card-icon {
  width: 64px; height: 64px; border-radius: 16px;
  display: inline-flex; align-items: center; justify-content: center;
  margin-bottom: 12px; color: white;
}
.role-card-icon.platform { background: linear-gradient(135deg, #3B82F6, #2563EB); }
.role-card-icon.agent { background: linear-gradient(135deg, #F59E0B, #D97706); }
.role-card-icon.shop { background: linear-gradient(135deg, #10B981, #059669); }

.role-card-title { font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
.role-card-desc { font-size: 12px; color: var(--text-muted); margin-bottom: 12px; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
