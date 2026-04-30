<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>安全设置</h1>
    </div>

    <!-- 登录密码 -->
    <div class="section-card">
      <div class="section-row">
        <div class="section-info">
          <h3>登录密码</h3>
          <p>定期更换密码可以提高账户安全性</p>
        </div>
        <n-button type="primary" secondary @click="showPasswordModal = true">修改密码</n-button>
      </div>
    </div>

    <!-- 操作日志 -->
    <div class="section-card">
      <div class="section-title">
        <h3>最近登录记录</h3>
        <n-tag size="small" type="info" bordered>最近10条</n-tag>
      </div>
      <n-data-table :columns="columns" :data="loginLogs" :pagination="false" striped size="small" />
    </div>

    <!-- 修改密码弹窗 -->
    <n-modal v-model:show="showPasswordModal" preset="card" title="修改密码" style="width: 440px;">
      <n-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules">
        <n-form-item label="当前密码" path="oldPassword">
          <n-input v-model:value="passwordForm.oldPassword" type="password" show-password-on="click" placeholder="请输入当前密码" />
        </n-form-item>
        <n-form-item label="新密码" path="newPassword">
          <n-input v-model:value="passwordForm.newPassword" type="password" show-password-on="click" placeholder="请输入新密码（至少6位）" />
        </n-form-item>
        <n-form-item label="确认密码" path="confirmPassword">
          <n-input v-model:value="passwordForm.confirmPassword" type="password" show-password-on="click" placeholder="请再次输入新密码" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showPasswordModal = false">取消</n-button>
          <n-button type="primary" @click="handleChangePassword">确认修改</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { NButton, NDataTable, NTag, NSpace, NModal, NForm, NFormItem, NInput, useMessage } from 'naive-ui'

const message = useMessage()
const passwordFormRef = ref()
const showPasswordModal = ref(false)

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const passwordRules = {
  oldPassword: { required: true, message: '请输入当前密码', trigger: 'blur' },
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (_rule: any, value: string) => value === passwordForm.value.newPassword,
      message: '两次密码不一致',
      trigger: 'blur',
    },
  ],
}

function handleChangePassword() {
  // 模拟修改成功
  showPasswordModal.value = false
  passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
  message.success('密码修改成功')
}

// 登录记录表格
const columns = [
  { title: '登录时间', key: 'time', width: 170 },
  { title: 'IP地址', key: 'ip', width: 140 },
  { title: '登录地点', key: 'location' },
  {
    title: '设备',
    key: 'device',
    width: 160,
    render: (row: any) => h(NTag, { size: 'tiny', bordered: true }, () => row.device),
  },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render: (row: any) =>
      h(NTag, {
        type: row.status === '成功' ? 'success' : 'error',
        size: 'tiny',
        bordered: true,
      }, () => row.status),
  },
]

const loginLogs = ref([
  { time: '2026-04-30 10:25:33', ip: '113.88.xxx.xx', location: '广东深圳', device: 'Chrome / macOS', status: '成功' },
  { time: '2026-04-29 18:42:11', ip: '113.88.xxx.xx', location: '广东深圳', device: 'Chrome / macOS', status: '成功' },
  { time: '2026-04-29 09:15:44', ip: '113.88.xxx.xx', location: '广东深圳', device: 'Safari / iPhone', status: '成功' },
  { time: '2026-04-28 22:08:19', ip: '210.72.xxx.xx', location: '广东广州', device: 'Chrome / Windows', status: '成功' },
  { time: '2026-04-28 14:30:55', ip: '183.14.xxx.xx', location: '四川成都', device: '微信小程序', status: '失败' },
  { time: '2026-04-27 16:52:38', ip: '113.88.xxx.xx', location: '广东深圳', device: 'Chrome / macOS', status: '成功' },
  { time: '2026-04-27 09:08:21', ip: '113.88.xxx.xx', location: '广东深圳', device: 'Chrome / macOS', status: '成功' },
])
</script>

<style scoped>
.page-container { padding: 20px 24px; }
.page-header { margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }

.section-card { background: white; border-radius: 12px; padding: 24px; border: 1px solid var(--border-color); margin-bottom: 20px; }

.section-row { display: flex; justify-content: space-between; align-items: center; }
.section-info h3 { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0 0 4px 0; }
.section-info p { font-size: 13px; color: var(--text-muted); margin: 0; }

.section-title { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-title h3 { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0; }
</style>
