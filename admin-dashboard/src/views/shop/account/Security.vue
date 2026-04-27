<template>
  <div class="page-container">
    <n-breadcrumb class="page-breadcrumb">
      <n-breadcrumb-item>主页</n-breadcrumb-item>
      <n-breadcrumb-item>用户设置</n-breadcrumb-item>
      <n-breadcrumb-item>账户安全</n-breadcrumb-item>
    </n-breadcrumb>

    <div class="page-header">
      <h1 class="page-title">账户安全</h1>
    </div>

    <div class="security-card">
      <div class="security-section">
        <h3 class="section-title">安全状态</h3>
        <div class="security-status">
          <div class="status-item">
            <div class="status-icon success">
              <n-icon :component="CheckmarkCircleOutline" size="24" />
            </div>
            <div class="status-content">
              <h4>密码强度</h4>
              <p>强</p>
            </div>
          </div>
          <div class="status-item">
            <div class="status-icon success">
              <n-icon :component="CheckmarkCircleOutline" size="24" />
            </div>
            <div class="status-content">
              <h4>邮箱绑定</h4>
              <p>已绑定</p>
            </div>
          </div>
          <div class="status-item">
            <div class="status-icon success">
              <n-icon :component="CheckmarkCircleOutline" size="24" />
            </div>
            <div class="status-content">
              <h4>微信绑定</h4>
              <p>已绑定</p>
            </div>
          </div>
          <div class="status-item">
            <div class="status-icon warning">
              <n-icon :component="AlertCircleOutline" size="24" />
            </div>
            <div class="status-content">
              <h4>两步验证</h4>
              <p>未开启</p>
            </div>
          </div>
        </div>
      </div>

      <div class="security-section">
        <h3 class="section-title">密码管理</h3>
        <div class="security-item">
          <div class="item-content">
            <h4>修改密码</h4>
            <p>定期修改密码可以提高账户安全性</p>
          </div>
          <n-button type="primary" size="small">
            修改密码
          </n-button>
        </div>
      </div>

      <div class="security-section">
        <h3 class="section-title">登录设备管理</h3>
        <div class="device-list">
          <div class="device-item">
            <div class="device-info">
              <div class="device-type">
                <n-icon :component="LaptopOutline" size="24" />
                <span>MacBook Pro</span>
              </div>
              <div class="device-details">
                <p>浏览器：Chrome 96.0.4664.110</p>
                <p>IP地址：192.168.1.100</p>
                <p>登录时间：2023-09-16 15:30:22</p>
              </div>
            </div>
            <div class="device-actions">
              <n-button type="error" size="small" danger>
                下线
              </n-button>
            </div>
          </div>
          <div class="device-item">
            <div class="device-info">
              <div class="device-type">
                <n-icon :component="PhonePortraitOutline" size="24" />
                <span>iPhone 13</span>
              </div>
              <div class="device-details">
                <p>浏览器：Safari 15.1</p>
                <p>IP地址：192.168.1.101</p>
                <p>登录时间：2023-09-15 10:15:33</p>
              </div>
            </div>
            <div class="device-actions">
              <n-button type="error" size="small" danger>
                下线
              </n-button>
            </div>
          </div>
        </div>
      </div>

      <div class="security-section">
        <h3 class="section-title">登录日志</h3>
        <div class="log-table">
          <n-data-table
            :columns="logColumns"
            :data="loginLogs"
            :bordered="true"
            :scroll-x="800"
          />
        </div>
      </div>

      <div class="security-section">
        <h3 class="section-title">安全设置</h3>
        <div class="security-settings">
          <div class="setting-item">
            <div class="setting-content">
              <h4>登录保护</h4>
              <p>开启后，新设备登录需要验证码</p>
            </div>
            <n-switch v-model:value="loginProtection" />
          </div>
          <div class="setting-item">
            <div class="setting-content">
              <h4>异地登录提醒</h4>
              <p>开启后，异地登录会收到提醒</p>
            </div>
            <n-switch v-model:value="remoteLoginAlert" />
          </div>
          <div class="setting-item">
            <div class="setting-content">
              <h4>两步验证</h4>
              <p>开启后，登录需要输入验证码</p>
            </div>
            <n-switch v-model:value="twoFactorAuth" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NBreadcrumb, NBreadcrumbItem, NIcon, NButton, NDataTable, NSwitch } from 'naive-ui'
import { CheckmarkCircleOutline, AlertCircleOutline, LaptopOutline, PhonePortraitOutline } from '@vicons/ionicons5'

const loginProtection = ref(true)
const remoteLoginAlert = ref(true)
const twoFactorAuth = ref(false)

const logColumns = [
  {
    title: '登录时间',
    key: 'time',
    width: 200
  },
  {
    title: '登录设备',
    key: 'device',
    width: 150
  },
  {
    title: '浏览器',
    key: 'browser',
    width: 150
  },
  {
    title: 'IP地址',
    key: 'ip',
    width: 120
  },
  {
    title: '登录地点',
    key: 'location',
    width: 120
  },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render: (row: any) => {
      return row.status === '成功' 
        ? h('span', { style: 'color: #10B981;' }, row.status)
        : h('span', { style: 'color: #EF4444;' }, row.status)
    }
  }
]

const loginLogs = [
  { time: '2023-09-16 15:30:22', device: 'MacBook Pro', browser: 'Chrome 96.0.4664.110', ip: '192.168.1.100', location: '本地', status: '成功' },
  { time: '2023-09-15 10:15:33', device: 'iPhone 13', browser: 'Safari 15.1', ip: '192.168.1.101', location: '本地', status: '成功' },
  { time: '2023-09-14 18:45:12', device: 'Windows PC', browser: 'Edge 96.0.1054.43', ip: '192.168.1.102', location: '本地', status: '成功' },
  { time: '2023-09-13 09:20:45', device: 'Android', browser: 'Chrome 95.0.4638.69', ip: '101.200.150.123', location: '异地', status: '成功' },
  { time: '2023-09-12 21:10:33', device: 'iPad', browser: 'Safari 15.0', ip: '192.168.1.103', location: '本地', status: '成功' }
]

function h(tag: string, props: any, children: any) {
  return {
    tag,
    props,
    children
  }
}
</script>

<style scoped>
.page-container {
  padding: 20px 24px;
}

.page-breadcrumb {
  margin-bottom: 16px;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.security-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid var(--border-color);
}

.security-section {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}

.security-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 16px 0;
}

.security-status {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--color-bg-elevated);
  border-radius: 8px;
}

.status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  flex-shrink: 0;
}

.status-icon.success {
  background: rgba(16, 185, 129, 0.1);
  color: #10B981;
}

.status-icon.warning {
  background: rgba(245, 158, 11, 0.1);
  color: #F59E0B;
}

.status-content h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.status-content p {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0;
}

.security-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: var(--color-bg-elevated);
  border-radius: 8px;
}

.item-content h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.item-content p {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0;
}

.device-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.device-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: var(--color-bg-elevated);
  border-radius: 8px;
}

.device-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.device-type {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--text-primary);
}

.device-details p {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 4px 0;
}

.log-table {
  width: 100%;
}

.security-settings {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: var(--color-bg-elevated);
  border-radius: 8px;
}

.setting-content h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.setting-content p {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0;
}
</style>
