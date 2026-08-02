<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>供应商信息</h1>
    </div>

    <div class="merchant-hero">
      <div>
        <span class="hero-label">当前供应商</span>
        <strong>{{ info.companyName }}</strong>
        <p>由总运营后台创建和维护，供应商侧仅维护联系人信息。</p>
      </div>
      <n-tag type="success" size="small">正常</n-tag>
    </div>

    <div class="section-card">
      <div class="section-header">
        <h3>基本信息</h3>
        <span class="section-badge">平台设定，不可修改</span>
      </div>
      <div class="info-grid">
        <div class="readonly-item">
          <span>公司名称</span>
          <strong>{{ info.companyName }}</strong>
        </div>
        <div class="readonly-item">
          <span>联系人</span>
          <strong>{{ info.contact }}</strong>
        </div>
        <div class="readonly-item">
          <span>联系电话</span>
          <strong>{{ info.phone }}</strong>
        </div>
      </div>
      <n-alert type="info" :bordered="false" class="section-hint">
        基础信息来自总运营后台“新增游戏供应商”的基本信息。收款账户资料请在“收款账户”中补充。
      </n-alert>
    </div>

    <div class="section-card">
      <div class="section-header">
        <h3>联系人信息</h3>
      </div>
      <n-alert type="info" :bordered="false" class="section-hint contact-hint">
        联系人、电话和邮箱允许供应商自助维护；公司名称仍由总运营后台维护。
      </n-alert>
      <n-form label-placement="top" class="contact-form">
        <div class="form-grid">
          <n-form-item label="联系人">
            <n-input v-model:value="contactForm.contact" placeholder="请输入联系人姓名" />
          </n-form-item>
          <n-form-item label="联系电话">
            <n-input v-model:value="contactForm.phone" placeholder="请输入联系电话" />
          </n-form-item>
          <n-form-item label="联系邮箱">
            <n-input v-model:value="contactForm.email" placeholder="请输入联系邮箱" />
          </n-form-item>
        </div>
        <n-form-item class="form-actions">
          <n-space>
            <n-button type="primary" @click="handleSave">保存修改</n-button>
            <n-button @click="resetContact">取消</n-button>
          </n-space>
        </n-form-item>
      </n-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import {
  NAlert,
  NButton,
  NForm,
  NFormItem,
  NInput,
  NSpace,
  NTag,
  useMessage,
} from 'naive-ui'

const message = useMessage()

const info = ref({
  companyName: '北京极境互动科技有限公司',
  contact: '张伟',
  phone: '13800001001',
})

const initialContact = {
  contact: '张伟',
  phone: '13800001001',
  email: 'cp@touhaokongjian.com',
}

const contactForm = reactive({ ...initialContact })

function handleSave() {
  if (!contactForm.contact || !contactForm.phone) {
    message.warning('请填写联系人和联系电话')
    return
  }
  message.success('联系人信息已保存')
}

function resetContact() {
  Object.assign(contactForm, initialContact)
}
</script>

<style scoped>
.page-container { max-width: 960px; padding: 20px 24px; }
.page-header { margin-bottom: 24px; }
.page-header h1 { margin: 0; color: var(--text-primary); font-size: 22px; font-weight: 700; }

.merchant-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 22px 24px;
  border: 1px solid #dbeafe;
  border-radius: 16px;
  background: linear-gradient(135deg, #eff6ff 0%, #ffffff 60%);
}

.merchant-hero strong,
.merchant-hero p,
.hero-label {
  display: block;
}

.hero-label {
  margin-bottom: 6px;
  color: #64748b;
  font-size: 12px;
}

.merchant-hero strong {
  color: #1e293b;
  font-size: 20px;
}

.merchant-hero p {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 13px;
}

.section-card {
  margin-bottom: 24px;
  padding: 24px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: #fff;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;
}

.section-badge {
  padding: 2px 10px;
  border-radius: 4px;
  background: var(--color-bg-elevated);
  color: var(--text-muted);
  font-size: 12px;
}

.info-grid,
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.readonly-item {
  min-height: 72px;
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
}

.readonly-item span,
.readonly-item strong {
  display: block;
}

.readonly-item span {
  margin-bottom: 8px;
  color: #64748b;
  font-size: 12px;
}

.readonly-item strong {
  color: #1f2937;
  font-size: 14px;
  line-height: 1.5;
}

.section-hint {
  margin-top: 16px;
}

.contact-form { padding-top: 4px; }

.form-actions {
  grid-column: 1 / -1;
}

@media (max-width: 720px) {
  .merchant-hero {
    flex-direction: column;
    gap: 12px;
  }

  .info-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
