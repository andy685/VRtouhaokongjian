<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">账户安全</h1>
    </div>

    <div class="security-card">
      <div class="security-section">
        <h3 class="section-title">密码管理</h3>
        <div class="security-item">
          <div class="item-content">
            <h4>修改密码</h4>
            <p>定期修改密码可以提高账户安全性</p>
          </div>
          <n-button type="primary" size="small" @click="showPwdModal = true">
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
    </div>

    <!-- 修改密码弹窗 -->
    <n-modal v-model:show="showPwdModal" preset="card" title="修改密码" style="width: 460px;" :bordered="false">
      <n-form ref="pwdFormRef" :model="pwdForm" :rules="pwdRules" label-placement="left" label-width="100">
        <n-form-item label="当前密码" path="oldPwd">
          <n-input v-model:value="pwdForm.oldPwd" type="password" show-password-on="click" placeholder="请输入当前密码" />
        </n-form-item>
        <n-form-item label="新密码" path="newPwd">
          <n-input v-model:value="pwdForm.newPwd" type="password" show-password-on="click" placeholder="请输入新密码（6-20位）" />
        </n-form-item>
        <n-form-item label="确认新密码" path="confirmPwd">
          <n-input v-model:value="pwdForm.confirmPwd" type="password" show-password-on="click" placeholder="请再次输入新密码" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showPwdModal = false">取消</n-button>
          <n-button type="primary" @click="handleChangePwd">确认修改</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import { NIcon, NButton, NDataTable, NModal, NForm, NFormItem, NInput, NSpace, useMessage, type FormInst, type FormRules } from 'naive-ui'
import { LaptopOutline, PhonePortraitOutline } from '@vicons/ionicons5'

const message = useMessage()

// 修改密码
const showPwdModal = ref(false)
const pwdFormRef = ref<FormInst | null>(null)
const pwdForm = ref({ oldPwd: '', newPwd: '', confirmPwd: '' })

const pwdRules: FormRules = {
  oldPwd: { required: true, message: '请输入当前密码', trigger: 'blur' },
  newPwd: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20位', trigger: 'blur' },
  ],
  confirmPwd: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (_rule: any, value: string) => value === pwdForm.value.newPwd,
      message: '两次输入的密码不一致',
      trigger: 'blur',
    },
  ],
}

function handleChangePwd() {
  pwdFormRef.value?.validate((errors) => {
    if (errors) return
    message.success('密码修改成功，请重新登录')
    showPwdModal.value = false
    pwdForm.value = { oldPwd: '', newPwd: '', confirmPwd: '' }
  })
}

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
</script>

<style scoped>
.page-container {
  padding: 20px 24px;
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
</style>
