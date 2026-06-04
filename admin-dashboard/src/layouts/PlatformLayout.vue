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
          
          <!-- 系统通知中心 -->
          <n-popover trigger="click" placement="bottom-end" :width="380" :style="{ padding: 0 }">
            <template #trigger>
              <n-badge :value="unreadCount" :max="99" :show="unreadCount > 0">
                <n-button quaternary circle size="small">
                  <template #icon><n-icon :component="NotificationsOutline" /></template>
                </n-button>
              </n-badge>
            </template>
            <div class="notice-panel">
              <div class="notice-panel-header">
                <span class="notice-panel-title">系统通知</span>
                <n-button text size="tiny" type="primary">全部已读</n-button>
              </div>
              <div class="notice-list">
                <div v-for="item in noticeList" :key="item.id" class="notice-item" :class="{ unread: !item.read }" @click="handleNoticeClick(item)">
                  <div class="notice-dot" :class="item.type"></div>
                  <div class="notice-body">
                    <div class="notice-text">{{ item.title }}</div>
                    <div class="notice-time">{{ item.time }}</div>
                  </div>
                </div>
                <div v-if="!noticeList.length" class="notice-empty">暂无新通知</div>
              </div>
              <div class="notice-panel-footer">
                <router-link to="/platform/notice/inbox" style="text-decoration:none;">查看全部通知 &rarr;</router-link>
              </div>
            </div>
          </n-popover>
          
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
        <router-view />
      </div>
    </main>

    <!-- 角色切换弹窗 -->
    <n-modal v-model:show="showRoleModal" preset="card" title="切换视图" style="width: 680px;" :bordered="false">
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
          @click="switchToAgent"
        >
          <div class="role-card-icon agent">
            <n-icon :component="BusinessOutline" size="32" />
          </div>
          <div class="role-card-title">代理商后台</div>
          <div class="role-card-desc">代理商管理 · 分润数据</div>
          <n-button size="tiny" secondary>进入</n-button>
        </div>

        <div
          class="role-card"
          @click="switchToShop"
        >
          <div class="role-card-icon shop">
            <n-icon :component="StorefrontOutline" size="32" />
          </div>
          <div class="role-card-title">商家后台</div>
          <div class="role-card-desc">商家运营 · 日常管理</div>
          <n-button size="tiny" secondary>进入</n-button>
        </div>
      </div>
      <div class="role-switch-grid" style="margin-top: 12px;">
        <div
          class="role-card"
          @click="switchToCP"
        >
          <div class="role-card-icon cp">
            <n-icon :component="GameControllerOutline" size="32" />
          </div>
          <div class="role-card-title">供应商后台</div>
          <div class="role-card-desc">游戏管理 · 收益数据</div>
          <n-button size="tiny" secondary>进入</n-button>
        </div>
        <div
          class="role-card"
          @click="switchToPayment"
        >
          <div class="role-card-icon payment">
            <n-icon :component="WalletOutline" size="32" />
          </div>
          <div class="role-card-title">支付系统</div>
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
  NInput, NDropdown, NModal, NTag, NPopover,
} from 'naive-ui'
import type { MenuOption } from 'naive-ui'
import {
  GridOutline, StorefrontOutline, BusinessOutline, GameControllerOutline, WalletOutline,
  SettingsOutline, ChevronBackOutline, ChevronForwardOutline,
  SwapHorizontalOutline, SearchOutline, NotificationsOutline,
  ServerOutline, LogOutOutline, PersonOutline, PeopleOutline,
  GiftOutline, ConstructOutline, ReceiptOutline,
  PulseOutline, HelpCircleOutline, MegaphoneOutline,
  ShieldCheckmarkOutline, ChatbubbleOutline
} from '@vicons/ionicons5'

const router = useRouter()
const route = useRoute()
const isCollapsed = ref(false)
const showRoleModal = ref(false)

// 稳定的 h() 引用，避免每次渲染重建 VNode
const icon = (comp: any) => () => h(NIcon, null, () => h(comp))

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

async function resolveCashierOrigin() {
  const currentPort = Number(window.location.port || 5175)
  const candidatePorts = Array.from(
    new Set([currentPort - 1, 5174, 5173].filter((port) => Number.isFinite(port) && port > 0))
  )

  for (const port of candidatePorts) {
    const origin = createOrigin(port)
    if (await probeOrigin(origin, '/sale')) {
      return origin
    }
  }

  return createOrigin(candidatePorts[0] || 5174)
}

// 菜单配置 - 二级菜单结构
const menuOptions: MenuOption[] = [
  {
    label: '数据中心',
    key: 'dashboard-group',
    icon: icon(GridOutline),
    children: [
      { label: '大屏看板', key: '/platform/dashboard' },
      { label: '数据报表', key: '/platform/reports' },
      { label: '内容消费大盘', key: '/platform/content-consumption' },
      { label: '设备运行总览', key: '/platform/device-overview' },
      { label: '设备配置管理', key: '/platform/device-config' },
    ]
  },
  {
    label: '店铺管理',
    key: 'stores-group',
    icon: icon(StorefrontOutline),
    children: [
      { label: '商家管理', key: '/platform/merchants' },
      { label: '店铺列表', key: '/platform/stores' },
    ]
  },
  {
    label: '代理商管理',
    key: 'agents-group',
    icon: icon(BusinessOutline),
    children: [
      { label: '代理商列表', key: '/platform/agents' },
    ]
  },
  {
    label: '游戏供应商管理',
    key: 'cps-group',
    icon: icon(GameControllerOutline),
    children: [
      { label: '供应商列表', key: '/platform/cps' },
    ]
  },
  {
    label: '内容中心',
    key: 'content-group',
    icon: icon(GameControllerOutline),
    children: [
      { label: '游戏库', key: '/platform/games' },
      { label: '游戏题材', key: '/platform/game-categories' },
      { label: '游戏审核', key: '/platform/games/review' },
      { label: '内容分发', key: '/platform/content' },
      { label: '小程序Banner', key: '/platform/banners' },
      { label: '生日会主题资源', key: '/platform/birthday-theme' },
    ]
  },
  {
    label: '会员中心',
    key: 'member-group',
    icon: icon(PeopleOutline),
    children: [
      { label: '会员数据', key: '/platform/members' },
      { label: '会员列表', key: '/platform/members/list' },
      { label: '会员增长', key: '/platform/members/growth' },
      { label: '会员消费排行', key: '/platform/members/ranking' },
      { label: '会员储值变更', key: '/platform/members/deposit-log' },
      { label: '会员游戏币查询', key: '/platform/members/coins-query' },
      { label: '游戏币调整有效期查询', key: '/platform/members/coin-adjust-log' },
      { label: '会员预存次数查询', key: '/platform/members/prepaid-times-query' },
      { label: '次数调整有效查询', key: '/platform/members/times-adjust-log' },
    ]
  },
  {
    label: '订单流水',
    key: 'order-flow-group',
    icon: icon(ReceiptOutline),
    children: [
      { label: '收银订单', key: '/platform/order-flow/cashier' },
      { label: '点播系统订单', key: '/platform/order-flow/vod' },
      { label: '手动扣费订单', key: '/platform/order-flow/manual' },
      { label: '修改储值订单', key: '/platform/order-flow/balance' },
      { label: '游戏币兑换订单', key: '/platform/order-flow/gamebean' },
      { label: '活动赠送订单', key: '/platform/order-flow/promo' },
    ]
  },
  {
    label: '平台财务',
    key: 'finance-group',
    icon: icon(WalletOutline),
    children: [
      { label: '营收总览', key: '/platform/finance' },
      {
        label: '游戏豆销售',
        key: 'gamebean-sales-group',
        children: [
          { label: '销售总览', key: '/platform/gamebean-sales' },
          { label: '销售明细', key: '/platform/gamebean-sales/detail' },
        ]
      },
      {
        label: '商家结算',
        key: 'merchant-settlement-group',
        children: [
          { label: '商家分账管理', key: '/platform/finance/settlement' },
          { label: '结算配置', key: '/platform/finance/settlement-config' },
          { label: '对账中心', key: '/platform/finance/reconciliation' },
        ]
      },
      {
        label: '代理商分润',
        key: 'agent-settlement-group',
        children: [
          { label: '代理商分账管理', key: '/platform/finance/payouts' },
          { label: '结算配置', key: '/platform/finance/agent-settlement-config' },
          { label: '阶梯策略配置', key: '/platform/finance/tier-config' },
        ]
      },
      {
        label: '游戏供应商结算',
        key: 'cp-settlement-group',
        children: [
          { label: 'CP结算管理', key: '/platform/finance/cp-settlement' },
          { label: 'CP结算配置', key: '/platform/finance/cp-settlement-config' },
          { label: 'CP对账中心', key: '/platform/finance/cp-reconciliation' },
        ]
      },
    ],
  },
  {
    label: '平台账号',
    key: 'users-group',
    icon: icon(PeopleOutline),
    children: [
      { label: '账号管理', key: '/platform/users' },
      { label: '角色权限', key: '/platform/users/roles' },
    ]
  },
  {
    label: '帮助中心系统',
    key: 'help-center-group',
    icon: icon(HelpCircleOutline),
    children: [
      { label: '帮助文档', key: '/platform/help-center/docs' },
      { label: 'FAQ', key: '/platform/help-center/faq' },
    ]
  },
  {
    label: '平台通知系统',
    key: 'notice-group',
    icon: icon(MegaphoneOutline),
    children: [
      { label: '公告管理', key: '/platform/notice/announcement' },
      { label: '消息推送', key: '/platform/notice/push' },
    ]
  },
  {
    label: '全平台反馈',
    key: 'feedback-group',
    icon: icon(ChatbubbleOutline),
    children: [
      { label: '反馈汇总', key: '/platform/feedback-summary' },
    ]
  },
  {
    label: '短信管理',
    key: 'sms-group',
    icon: icon(ChatbubbleOutline),
    children: [
      { label: '短信模板审核', key: '/platform/sms-template-audit' },
    ]
  },
]

const currentRoute = computed(() => route.path)

const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta?.title)
  return matched.map(m => ({ label: m.meta.title as string, path: m.path }))
})

const userMenuOptions = [
  { label: '个人信息', key: 'profile', icon: icon(PersonOutline) },
  { label: '安全设置', key: 'security', icon: icon(ShieldCheckmarkOutline) },
  { type: 'divider', key: 'd1' },
  { label: '退出登录', key: 'logout', icon: icon(LogOutOutline) },
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

function switchToAgent() {
  showRoleModal.value = false
  router.push('/agent/dashboard')
}

function switchToPlatform() {
  showRoleModal.value = false
}

function switchToCP() {
  showRoleModal.value = false
  router.push('/cp/dashboard')
}

async function switchToPayment() {
  showRoleModal.value = false
  const cashierOrigin = await resolveCashierOrigin()
  window.location.href = `${cashierOrigin}/sale`
}

function handleUserAction(key: string) {
  if (key === 'logout') {
    router.push('/login')
  } else if (key === 'profile') {
    router.push('/platform/account/profile')
  } else if (key === 'security') {
    router.push('/platform/account/security')
  }
}

// ========== 系统通知 ==========
interface NoticeItem { id: number; title: string; time: string; read: boolean; type: 'warning' | 'error' | 'info' | 'success'; detailId: string }
const noticeList = ref<NoticeItem[]>([
  { id: 1, title: '【结算】4月份商家结算单已全部生成，共 1,286 笔，待审核打款', time: '10 分钟前', read: false, type: 'info', detailId: 'n-settlement-202604' },
  { id: 2, title: '【订单】今日大额订单 12 笔（¥9,760），较昨日 +25%', time: '30 分钟前', read: false, type: 'warning', detailId: 'n-order-large-today' },
  { id: 3, title: '【设备】深圳福田旗舰店 VR-03 已离线超 2 小时，请关注', time: '1 小时前', read: false, type: 'error', detailId: 'n-device-offline-vr03' },
  { id: 4, title: '【安全】检测到 3 次异常登录尝试（IP：103.24.*），已拦截', time: '2 小时前', read: true, type: 'error', detailId: 'n-login-anomaly-ip103' },
  { id: 5, title: '【系统】五一假期运维安排公告已发布，请查看', time: '今天 09:00', read: true, type: 'success', detailId: 'n-announce-may1' },
])
const unreadCount = computed(() => noticeList.value.filter(n => !n.read).length)

function handleNoticeClick(item: NoticeItem) {
  router.push({ path: '/platform/notice/inbox', query: { id: item.detailId } })
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

.role-card-icon.agent {
  background: linear-gradient(135deg, #F59E0B, #D97706);
}

.role-card-icon.shop {
  background: linear-gradient(135deg, #10B981, #059669);
}

.role-card-icon.cp {
  background: linear-gradient(135deg, #8B5CF6, #6D28D9);
}

.role-card-icon.payment {
  background: linear-gradient(135deg, #0EA5E9, #0369A1);
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

/* 系统通知面板 */
.notice-panel { padding: 0; }
.notice-panel-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px; border-bottom: 1px solid var(--border-color);
}
.notice-panel-title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.notice-list { max-height: 320px; overflow-y: auto; }
.notice-item {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 12px 16px;
  cursor: pointer; transition: background 0.15s;
  border-bottom: 1px solid rgba(0,0,0,0.03);
}
.notice-item:hover { background: rgba(59,130,246,0.04); }
.notice-item.unread { background: rgba(59,130,246,0.03); }
.notice-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 5px;
}
.notice-dot.warning { background: #F59E0B; }
.notice-dot.error { background: #EF4444; }
.notice-dot.info { background: #3B82F6; }
.notice-dot.success { background: #10B981; }
.notice-body { flex: 1; min-width: 0; }
.notice-text { font-size: 13px; color: var(--text-primary); line-height: 1.5; }
.notice-item.unread .notice-text { font-weight: 500; }
.notice-time { font-size: 11px; color: var(--text-muted); margin-top: 3px; }
.notice-empty { text-align: center; padding: 32px 0; color: var(--text-muted); font-size: 13px; }
.notice-panel-footer {
  padding: 10px 16px; border-top: 1px solid var(--border-color);
  text-align: center; font-size: 12px; color: var(--color-primary);
}
</style>
