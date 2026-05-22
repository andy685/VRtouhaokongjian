<template>
  <div class="layout-container">
    <!-- BEGIN: Sidebar -->
    <aside class="sidebar">
      <!-- Logo -->
      <div class="logo">
        <img alt="Logo" class="logo-img" src="https://cdn-icons-png.flaticon.com/128/3127/3127139.png" />
      </div>
      
      <!-- Nav Items -->
      <nav class="nav-items">
        <!-- Sales - Active -->
        <router-link to="/sale" class="nav-item active" data-purpose="nav-item">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          </svg>
          <span class="nav-text">销售</span>
        </router-link>
        
        <!-- Member -->
        <a class="nav-item" data-purpose="nav-item" href="#">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          </svg>
          <span class="nav-text">会员</span>
        </a>
        
        <!-- Member Fees -->
        <a class="nav-item" data-purpose="nav-item" href="#">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          </svg>
          <span class="nav-text">会员扣费</span>
        </a>
        
        <!-- Orders -->
        <a class="nav-item" data-purpose="nav-item" href="#">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          </svg>
          <span class="nav-text">订单</span>
        </a>
        
        <!-- Logs -->
        <a class="nav-item" data-purpose="nav-item" href="#">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          </svg>
          <span class="nav-text">日志</span>
        </a>
        
        <!-- Revenue -->
        <a class="nav-item" data-purpose="nav-item" href="#">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          </svg>
          <span class="nav-text">营收</span>
        </a>
      </nav>
      
      <!-- Bottom Settings -->
      <div class="settings-btn">
        <a href="#">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          </svg>
          <span class="nav-text">设置</span>
        </a>
      </div>
    </aside>
    <!-- END: Sidebar -->
    
    <main class="main-content">
      <!-- BEGIN: Top Header -->
      <header class="top-header">
        <div class="header-left">
          <div class="header-info">
            <span class="header-label">门店:</span>
            <span class="header-value">门店名称</span>
          </div>
          <div class="header-info">
            <span class="header-label">收银员:</span>
            <div class="cashier-dropdown">
              <span class="header-value">王小丫</span>
              <svg class="dropdown-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M19 9l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <div class="header-right">
          <div class="datetime">
            <div class="date-text">11月23日 星期六</div>
            <div class="time-text">10:56</div>
          </div>
          <div class="header-actions">
            <button class="action-btn">
              <svg class="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
            </button>
            <button class="action-btn">
              <svg class="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M20 12H4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
            </button>
            <button class="action-btn close-btn">
              <svg class="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
            </button>
          </div>
        </div>
      </header>
      <!-- END: Top Header -->
      
      <!-- BEGIN: Content Area -->
      <router-view />
      <!-- END: Content Area -->
    </main>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const currentTime = ref('')
const currentDate = ref('')

const updateTime = () => {
  const now = new Date()
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  
  const month = months[now.getMonth()]
  const date = now.getDate()
  const weekday = weekdays[now.getDay()]
  
  currentDate.value = `${month}${date}日 ${weekday}`
  currentTime.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

let timer = null
onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
  background-color: #f0f7ff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

/* Sidebar */
.sidebar {
  width: 72px;
  background-color: #3b82f6;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
  flex-shrink: 0;
}

.logo {
  margin-bottom: 32px;
}

.logo-img {
  width: 40px;
  height: 40px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.nav-items {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  padding: 0 8px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
  color: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s;
}

.nav-item:hover {
  color: rgba(255, 255, 255, 0.8);
}

.nav-item.active {
  background-color: #ffffff;
  color: #3b82f6;
}

.nav-icon {
  width: 24px;
  height: 24px;
}

.nav-text {
  font-size: 12px;
  margin-top: 4px;
}

.settings-btn {
  margin-top: auto;
  padding-bottom: 16px;
}

.settings-btn a {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  color: rgba(255, 255, 255, 0.5);
  transition: color 0.2s;
}

.settings-btn a:hover {
  color: rgba(255, 255, 255, 0.8);
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Top Header */
.top-header {
  height: 64px;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  border-bottom: 1px solid #f3f4f6;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 48px;
}

.header-info {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.header-label {
  color: #6b7280;
  margin-right: 8px;
}

.header-value {
  font-weight: 500;
  color: #1f2937;
}

.cashier-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.dropdown-icon {
  width: 16px;
  height: 16px;
  margin-left: 4px;
  color: #9ca3af;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.datetime {
  text-align: right;
}

.date-text {
  font-size: 12px;
  color: #9ca3af;
}

.time-text {
  font-size: 20px;
  font-weight: bold;
  color: #374151;
  line-height: 1;
}

.header-actions {
  display: flex;
  gap: 16px;
}

.action-btn {
  color: #9ca3af;
  transition: color 0.2s;
}

.action-btn:hover {
  color: #6b7280;
}

.action-btn.close-btn:hover {
  color: #ef4444;
}

.action-icon {
  width: 24px;
  height: 24px;
}
</style>
