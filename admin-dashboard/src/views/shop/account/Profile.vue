<template>
  <div class="page-container">
    <n-breadcrumb class="page-breadcrumb">
      <n-breadcrumb-item>主页</n-breadcrumb-item>
      <n-breadcrumb-item>用户设置</n-breadcrumb-item>
      <n-breadcrumb-item>个人信息</n-breadcrumb-item>
    </n-breadcrumb>

    <div class="page-header">
      <h1 class="page-title">个人信息</h1>
    </div>

    <div class="profile-card">
      <div class="profile-content">
        <!-- 头像和基本信息 -->
        <div class="avatar-section">
          <n-avatar round size="100" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
            {{ formData.name ? formData.name.charAt(0) : '用' }}
          </n-avatar>
          <n-button size="small" secondary class="avatar-button">
            更换头像
          </n-button>
        </div>

        <!-- 编辑信息区域 -->
        <div class="info-section">
          <div class="info-item">
            <div class="info-label">用户名</div>
            <n-input
              v-model:value="formData.name"
              placeholder="请输入用户名"
              style="width: 300px;"
            />
          </div>

          <div class="info-item">
            <div class="info-label">性别</div>
            <n-select
              v-model:value="formData.gender"
              :options="genderOptions"
              placeholder="请选择性别"
              style="width: 300px;"
            />
          </div>

          <div class="info-item">
            <div class="info-label">手机号码</div>
            <div class="info-value">
              <span>{{ formData.phone }}</span>
              <n-button size="small" type="primary" @click="showPhoneModal = true" style="margin-left: 12px;">
                换绑
              </n-button>
            </div>
          </div>

          <div class="info-item">
            <div class="info-label">微信</div>
            <div class="info-value">
              <span v-if="wechatBound" class="status success">已绑定</span>
              <span v-else class="status">未绑定</span>
              <n-button size="small" :type="wechatBound ? 'error' : 'primary'" @click="wechatBound ? unbindWechat() : showWechatModal = true" style="margin-left: 12px;">
                {{ wechatBound ? '解绑' : '绑定' }}
              </n-button>
            </div>
          </div>

          <div class="info-item">
            <div class="info-label">邮箱</div>
            <div class="info-value">
              <span v-if="emailBound" class="status success">{{ formData.email }}</span>
              <span v-else class="status">未绑定</span>
              <n-button size="small" :type="emailBound ? 'error' : 'primary'" @click="emailBound ? unbindEmail() : showEmailModal = true" style="margin-left: 12px;">
                {{ emailBound ? '解绑' : '绑定' }}
              </n-button>
            </div>
          </div>

          <div class="form-actions">
            <n-button>
              取消
            </n-button>
            <n-button type="primary">
              保存修改
            </n-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 手机号换绑弹窗 -->
    <n-modal v-model:show="showPhoneModal" preset="card" title="换绑手机号" style="width: 500px;">
      <div class="bind-form">
        <div class="form-item">
          <n-input
            v-model:value="newPhone"
            label="新手机号"
            placeholder="请输入新手机号"
          />
          <n-input
            v-model:value="phoneCode"
            label="验证码"
            placeholder="请输入验证码"
          >
            <template #append>
              <n-button 
                type="primary" 
                size="small" 
                :disabled="isSendingPhone"
                @click="sendPhoneCode"
              >
                {{ isSendingPhone ? '发送中...' : '发送验证码' }}
              </n-button>
            </template>
          </n-input>
        </div>
      </div>
      <template #footer>
        <div class="modal-footer">
          <n-button @click="showPhoneModal = false">取消</n-button>
          <n-button type="primary" @click="changePhone">确认换绑</n-button>
        </div>
      </template>
    </n-modal>

    <!-- 微信绑定弹窗 -->
    <n-modal v-model:show="showWechatModal" preset="card" title="绑定微信" style="width: 500px;">
      <div class="wechat-bind-content">
        <div class="qrcode-section">
          <div class="qrcode">
            <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
              <rect width="200" height="200" fill="white" stroke="#e5e7eb" />
              <text x="100" y="105" font-size="14" text-anchor="middle" fill="#6b7280">微信扫码绑定</text>
            </svg>
          </div>
          <p class="qrcode-tip">请使用微信扫描二维码进行绑定</p>
        </div>
        <div class="wechat-info" v-if="wechatInfo.name">
          <div class="wechat-avatar">
            <n-avatar round size="60" :src="wechatInfo.avatar" />
          </div>
          <div class="wechat-details">
            <h4>{{ wechatInfo.name }}</h4>
            <p>确认绑定此微信账号</p>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="modal-footer">
          <n-button @click="showWechatModal = false">取消</n-button>
          <n-button type="primary" @click="bindWechat" v-if="wechatInfo.name">确认绑定</n-button>
        </div>
      </template>
    </n-modal>

    <!-- 邮箱绑定弹窗 -->
    <n-modal v-model:show="showEmailModal" preset="card" title="绑定邮箱" style="width: 500px;">
      <div class="bind-form">
        <div class="form-item">
          <n-input
            v-model:value="newEmail"
            label="邮箱地址"
            placeholder="请输入邮箱地址"
          />
          <n-input
            v-model:value="emailCode"
            label="验证码"
            placeholder="请输入验证码"
          >
            <template #append>
              <n-button 
                type="primary" 
                size="small" 
                :disabled="isSendingEmail"
                @click="sendEmailCode"
              >
                {{ isSendingEmail ? '发送中...' : '发送验证码' }}
              </n-button>
            </template>
          </n-input>
        </div>
      </div>
      <template #footer>
        <div class="modal-footer">
          <n-button @click="showEmailModal = false">取消</n-button>
          <n-button type="primary" @click="bindEmail">确认绑定</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NBreadcrumb, NBreadcrumbItem, NAvatar, NButton, NInput, NSelect, NModal } from 'naive-ui'

// 基本信息表单
const formData = ref({
  name: '王小丫',
  phone: '138****8888',
  email: 'wangxiaoya@touhaokongjian.com',
  gender: 'female'
})

// 性别选项
const genderOptions = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
  { label: '其他', value: 'other' }
]

// 绑定状态
const wechatBound = ref(true)
const emailBound = ref(true)

// 微信信息
const wechatInfo = ref({
  name: '王小丫',
  avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=王小丫'
})

// 弹窗状态
const showPhoneModal = ref(false)
const showWechatModal = ref(false)
const showEmailModal = ref(false)

// 换绑手机号
const newPhone = ref('')
const phoneCode = ref('')
const isSendingPhone = ref(false)

// 绑定邮箱
const newEmail = ref('')
const emailCode = ref('')
const isSendingEmail = ref(false)

// 发送手机验证码
function sendPhoneCode() {
  if (!newPhone.value) return
  isSendingPhone.value = true
  // 模拟发送验证码
  setTimeout(() => {
    isSendingPhone.value = false
  }, 2000)
}

// 换绑手机号
function changePhone() {
  // 模拟换绑
  formData.value.phone = newPhone.value
  showPhoneModal.value = false
  // 重置表单
  newPhone.value = ''
  phoneCode.value = ''
}

// 发送邮箱验证码
function sendEmailCode() {
  if (!newEmail.value) return
  isSendingEmail.value = true
  // 模拟发送验证码
  setTimeout(() => {
    isSendingEmail.value = false
  }, 2000)
}

// 绑定邮箱
function bindEmail() {
  // 模拟绑定
  formData.value.email = newEmail.value
  emailBound.value = true
  showEmailModal.value = false
  // 重置表单
  newEmail.value = ''
  emailCode.value = ''
}

// 绑定微信
function bindWechat() {
  // 模拟绑定
  wechatBound.value = true
  showWechatModal.value = false
}

// 解绑微信
function unbindWechat() {
  // 模拟解绑
  wechatBound.value = false
}

// 解绑邮箱
function unbindEmail() {
  // 模拟解绑
  emailBound.value = false
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

.profile-card {
  background: white;
  border-radius: 12px;
  padding: 32px;
  border: 1px solid var(--border-color);
}

.profile-content {
  display: flex;
  align-items: flex-start;
  gap: 48px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.avatar-button {
  width: 120px;
}

.info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 24px;
}

.info-label {
  width: 100px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  flex-shrink: 0;
}

.info-value {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.status {
  font-size: 14px;
  color: var(--text-secondary);
}

.status.success {
  color: #10B981;
}

.form-actions {
  display: flex;
  justify-content: flex-start;
  gap: 12px;
  margin-top: 16px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.bind-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.wechat-bind-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.qrcode-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.qrcode {
  padding: 12px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.qrcode-tip {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.wechat-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--color-bg-elevated);
  border-radius: 8px;
  width: 100%;
}

.wechat-avatar {
  flex-shrink: 0;
}

.wechat-details {
  flex: 1;
}

.wechat-details h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.wechat-details p {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .profile-content {
    flex-direction: column;
    align-items: center;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .info-label {
    width: 100%;
  }
}
</style>
