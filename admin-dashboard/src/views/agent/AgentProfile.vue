<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>代理商信息</h1>
    </div>

    <!-- 基本信息 -->
    <div class="profile-card">
      <div class="profile-content">
        <div class="avatar-section">
          <n-avatar round :size="100" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
            代
          </n-avatar>
          <n-button size="small" secondary>更换头像</n-button>
        </div>
        <div class="info-section">
          <div class="info-item">
            <div class="info-label">代理商名称</div>
            <n-input v-model:value="formData.name" placeholder="请输入代理商名称" style="width: 300px;" />
          </div>
          <div class="info-item">
            <div class="info-label">联系人</div>
            <n-input v-model:value="formData.contact" placeholder="请输入联系人姓名" style="width: 300px;" />
          </div>
          <div class="info-item">
            <div class="info-label">联系电话</div>
            <n-input v-model:value="formData.phone" placeholder="请输入联系电话" style="width: 300px;" />
          </div>
          <div class="info-item">
            <div class="info-label">联系邮箱</div>
            <div class="info-value">
              <span class="status" :class="{ success: formData.email }">{{ formData.email || '未绑定' }}</span>
              <n-button v-if="!formData.email" size="small" type="primary" @click="showBindEmailModal = true">绑定</n-button>
              <n-button v-else size="small" @click="showBindEmailModal = true">修改</n-button>
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">代理区域</div>
            <span class="status success">{{ formData.region }}</span>
          </div>
          <div class="info-item">
            <div class="info-label">合作时间</div>
            <span class="status">{{ formData.sinceDate }}</span>
          </div>
          <div class="form-actions">
            <n-button>取消</n-button>
            <n-button type="primary" @click="handleSave">保存修改</n-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 绑定邮箱弹窗 -->
    <n-modal v-model:show="showBindEmailModal" preset="card" title="绑定邮箱" style="width: 450px;">
      <n-form>
        <n-form-item label="邮箱地址">
          <n-input v-model:value="bindEmail" placeholder="请输入邮箱地址" />
        </n-form-item>
        <n-form-item label="验证码">
          <div style="display:flex;gap:8px;width:100%;">
            <n-input v-model:value="emailCode" placeholder="请输入验证码" style="flex:1;" />
            <n-button type="primary" :disabled="!bindEmail">发送验证码</n-button>
          </div>
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showBindEmailModal = false">取消</n-button>
          <n-button type="primary" @click="confirmBindEmail">确认绑定</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NAvatar, NButton, NInput, NModal, NForm, NFormItem, NSpace, useMessage } from 'naive-ui'

const message = useMessage()

const formData = ref({
  name: '深圳未来科技',
  contact: '张经理',
  phone: '138****6688',
  email: 'agent@touhaokongjian.com',
  region: '广东省深圳市',
  sinceDate: '2024-06-15',
})

const showBindEmailModal = ref(false)
const bindEmail = ref('')
const emailCode = ref('')

function handleSave() {
  message.success('保存成功')
}

function confirmBindEmail() {
  if (bindEmail.value) {
    formData.value.email = bindEmail.value
    showBindEmailModal.value = false
    message.success('邮箱绑定成功')
    bindEmail.value = ''
    emailCode.value = ''
  }
}
</script>

<style scoped>
.page-container { padding: 20px 24px; }
.page-header { margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }

.profile-card { background: white; border-radius: 12px; padding: 32px; border: 1px solid var(--border-color); }
.profile-content { display: flex; align-items: flex-start; gap: 48px; }

.avatar-section { display: flex; flex-direction: column; align-items: center; gap: 16px; flex-shrink: 0; }
.avatar-section .n-button { width: 120px; }

.info-section { flex: 1; display: flex; flex-direction: column; gap: 24px; }
.info-item { display: flex; align-items: center; gap: 24px; }
.info-label { width: 100px; font-size: 14px; font-weight: 500; color: var(--text-primary); flex-shrink: 0; }
.info-value { display: flex; align-items: center; gap: 12px; flex: 1; }
.status { font-size: 14px; color: var(--text-secondary); }
.status.success { color: #10B981; }

.form-actions { display: flex; justify-content: flex-start; gap: 12px; margin-top: 16px; padding-top: 20px; border-top: 1px solid var(--border-color); }

@media (max-width: 768px) {
  .profile-content { flex-direction: column; align-items: center; }
  .info-item { flex-direction: column; align-items: flex-start; gap: 8px; }
  .info-label { width: 100%; }
}
</style>
