<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">个人信息</h1>
    </div>

    <div class="profile-card">
      <div class="profile-content">
        <!-- 头像和基本信息 -->
        <div class="avatar-section">
          <n-avatar round :size="100" :src="formData.avatar" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
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
            <n-input
              v-model:value="formData.phone"
              placeholder="请输入手机号码"
              style="width: 300px;"
            />
          </div>

          <div class="info-item">
            <div class="info-label">邮箱</div>
            <div class="info-value">
              <span class="status" :class="{ success: formData.email }">
                {{ formData.email || '未绑定' }}
              </span>
              <n-button v-if="!formData.email" size="small" type="primary" @click="showBindEmailModal = true">
                绑定
              </n-button>
              <n-dropdown
                v-else
                :options="emailOptions"
                @select="handleEmailAction"
                placement="bottom-start"
              >
                <n-button size="small">
                  管理
                </n-button>
              </n-dropdown>
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

    <!-- 绑定邮箱弹窗 -->
    <n-modal v-model:show="showBindEmailModal" preset="card" title="绑定邮箱" style="width: 450px;">
      <n-form :model="bindEmailForm" :rules="bindEmailRules">
        <n-form-item label="邮箱地址" path="email">
          <n-input v-model:value="bindEmailForm.email" placeholder="请输入邮箱地址" />
        </n-form-item>
        <n-form-item label="验证码" path="code">
          <div style="display: flex; gap: 8px; width: 100%;">
            <n-input v-model:value="bindEmailForm.code" placeholder="请输入验证码" style="flex: 1;" />
            <n-button
              type="primary"
              :disabled="isSendingEmailCode || !bindEmailForm.email"
              @click="sendEmailVerificationCode"
            >
              {{ isSendingEmailCode ? '发送中...' : '发送验证码' }}
            </n-button>
          </div>
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="modal-footer">
          <n-button @click="showBindEmailModal = false">取消</n-button>
          <n-button type="primary" @click="handleBindEmail">确认绑定</n-button>
        </div>
      </template>
    </n-modal>

    <!-- 换绑邮箱弹窗 -->
    <n-modal v-model:show="showChangeEmailModal" preset="card" title="换绑邮箱" style="width: 450px;">
      <div class="change-email-form">
        <n-alert type="info" :bordered="false" style="margin-bottom: 16px;">
          当前绑定邮箱：{{ formData.email }}
        </n-alert>
        <n-form :model="changeEmailForm" :rules="changeEmailRules">
          <n-form-item label="新邮箱地址" path="newEmail">
            <n-input v-model:value="changeEmailForm.newEmail" placeholder="请输入新的邮箱地址" />
          </n-form-item>
          <n-form-item label="验证码" path="code">
            <div style="display: flex; gap: 8px; width: 100%;">
              <n-input v-model:value="changeEmailForm.code" placeholder="请输入验证码" style="flex: 1;" />
              <n-button
                type="primary"
                :disabled="isSendingChangeCode || !changeEmailForm.newEmail"
                @click="sendChangeEmailVerificationCode"
              >
                {{ isSendingChangeCode ? '发送中...' : '发送验证码' }}
              </n-button>
            </div>
          </n-form-item>
        </n-form>
      </div>
      <template #footer>
        <div class="modal-footer">
          <n-button @click="showChangeEmailModal = false">取消</n-button>
          <n-button type="primary" @click="handleChangeEmail">确认换绑</n-button>
        </div>
      </template>
    </n-modal>

    <!-- 解绑邮箱弹窗 -->
    <n-modal v-model:show="showUnbindEmailModal" preset="card" title="解绑邮箱" style="width: 400px;">
      <div class="unbind-confirm">
        <n-alert type="warning" :bordered="false" style="margin-bottom: 16px;">
          解绑邮箱后将无法通过邮箱找回密码，确定要继续吗？
        </n-alert>
        <n-form :model="unbindEmailForm" :rules="unbindEmailRules">
          <n-form-item label="验证码" path="code">
            <div style="display: flex; gap: 8px; width: 100%;">
              <n-input v-model:value="unbindEmailForm.code" placeholder="请输入验证码" style="flex: 1;" />
              <n-button
                type="primary"
                :disabled="isSendingUnbindCode"
                @click="sendUnbindVerificationCode"
              >
                {{ isSendingUnbindCode ? '发送中...' : '发送验证码' }}
              </n-button>
            </div>
          </n-form-item>
        </n-form>
      </div>
      <template #footer>
        <div class="modal-footer">
          <n-button @click="showUnbindEmailModal = false">取消</n-button>
          <n-button type="primary" @click="handleUnbindEmail">确认解绑</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { NAvatar, NButton, NInput, NSelect, NModal, NForm, NFormItem, NDropdown } from 'naive-ui'

// 基本信息表单
const formData = ref({
  name: '王小丫',
  phone: '138****8888',
  email: 'wangxiaoya@touhaokongjian.com',
  gender: 'female',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=王小丫'
})

// 性别选项
const genderOptions = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
  { label: '其他', value: 'other' }
]

// 弹窗控制
const showBindEmailModal = ref(false)
const showChangeEmailModal = ref(false)
const showUnbindEmailModal = ref(false)

// 邮箱操作选项
const emailOptions = [
  {
    label: '换绑邮箱',
    key: 'change',
    icon: () => '🔄'
  },
  {
    label: '解绑邮箱',
    key: 'unbind',
    icon: () => '🔗'
  }
]

// 处理邮箱操作
function handleEmailAction(key: string) {
  if (key === 'change') {
    showChangeEmailModal.value = true
  } else if (key === 'unbind') {
    showUnbindEmailModal.value = true
  }
}

// 绑定邮箱表单
const bindEmailForm = reactive({
  email: '',
  code: ''
})

const bindEmailRules = {
  email: {
    required: true,
    message: '请输入邮箱地址',
    trigger: 'blur'
  },
  code: {
    required: true,
    message: '请输入验证码',
    trigger: 'blur'
  }
}

// 换绑邮箱表单
const changeEmailForm = reactive({
  newEmail: '',
  code: ''
})

const changeEmailRules = {
  newEmail: {
    required: true,
    message: '请输入新的邮箱地址',
    trigger: 'blur'
  },
  code: {
    required: true,
    message: '请输入验证码',
    trigger: 'blur'
  }
}

// 解绑邮箱表单
const unbindEmailForm = reactive({
  code: ''
})

const unbindEmailRules = {
  code: {
    required: true,
    message: '请输入验证码',
    trigger: 'blur'
  }
}

// 发送验证码状态
const isSendingEmailCode = ref(false)
const isSendingChangeCode = ref(false)
const isSendingUnbindCode = ref(false)

// 发送绑定邮箱验证码
function sendEmailVerificationCode() {
  if (!bindEmailForm.email) return
  isSendingEmailCode.value = true
  // 模拟发送验证码
  setTimeout(() => {
    isSendingEmailCode.value = false
  }, 1500)
}

// 发送换绑邮箱验证码
function sendChangeEmailVerificationCode() {
  if (!changeEmailForm.newEmail) return
  isSendingChangeCode.value = true
  // 模拟发送验证码
  setTimeout(() => {
    isSendingChangeCode.value = false
  }, 1500)
}

// 发送解绑邮箱验证码
function sendUnbindVerificationCode() {
  isSendingUnbindCode.value = true
  // 模拟发送验证码
  setTimeout(() => {
    isSendingUnbindCode.value = false
  }, 1500)
}

// 绑定邮箱
function handleBindEmail() {
  // 模拟绑定成功
  formData.value.email = bindEmailForm.email
  showBindEmailModal.value = false
  // 重置表单
  bindEmailForm.email = ''
  bindEmailForm.code = ''
}

// 换绑邮箱
function handleChangeEmail() {
  // 模拟换绑成功
  formData.value.email = changeEmailForm.newEmail
  showChangeEmailModal.value = false
  // 重置表单
  changeEmailForm.newEmail = ''
  changeEmailForm.code = ''
}

// 解绑邮箱
function handleUnbindEmail() {
  // 模拟解绑成功
  formData.value.email = ''
  showUnbindEmailModal.value = false
  // 重置表单
  unbindEmailForm.code = ''
}
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

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.unbind-confirm {
  margin-bottom: 16px;
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
