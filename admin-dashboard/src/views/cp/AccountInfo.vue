<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>供应商资料</h1>
    </div>

    <!-- 基本信息 -->
    <div class="section-card">
      <div class="section-header">
        <h3>基本信息</h3>
        <span class="section-badge">平台设定，不可修改</span>
      </div>
      <n-descriptions label-placement="left" :column="2" bordered>
        <n-descriptions-item label="公司名称">{{ info.companyName }}</n-descriptions-item>
        <n-descriptions-item label="状态">
          <n-tag type="success" size="small">正常</n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="手续费率">{{ info.feeRate }}%</n-descriptions-item>
        <n-descriptions-item label="在架游戏">{{ info.gameCount }} 款</n-descriptions-item>
        <n-descriptions-item label="累计结算额">¥{{ info.totalSettlement.toLocaleString() }}</n-descriptions-item>
        <n-descriptions-item label="创建时间" :span="2">{{ info.createTime }}</n-descriptions-item>
      </n-descriptions>
    </div>

    <!-- 联系人信息 -->
    <div class="section-card">
      <div class="section-header">
        <h3>联系人信息</h3>
      </div>
      <n-form label-placement="left" label-width="100" class="contact-form">
        <n-form-item label="联系人">
          <n-input v-model:value="contactForm.contact" placeholder="请输入联系人姓名" style="max-width: 360px;" />
        </n-form-item>
        <n-form-item label="联系电话">
          <n-input v-model:value="contactForm.phone" placeholder="请输入联系电话" style="max-width: 360px;" />
        </n-form-item>
        <n-form-item>
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
import { ref, reactive } from 'vue'
import {
  NTag, NInput, NButton, NSpace,
  NDescriptions, NDescriptionsItem, NForm, NFormItem,
  useMessage
} from 'naive-ui'

const message = useMessage()

const info = ref({
  companyName: '北京极境互动科技有限公司',
  feeRate: 8,
  gameCount: 12,
  totalSettlement: 528000,
  createTime: '2024-03-15',
})

const contactForm = reactive({
  contact: '张伟',
  phone: '13800001001',
})

function handleSave() {
  if (!contactForm.contact || !contactForm.phone) {
    message.warning('请填写完整信息')
    return
  }
  message.success('联系人信息已保存')
}

function resetContact() {
  contactForm.contact = '张伟'
  contactForm.phone = '13800001001'
}
</script>

<style scoped>
.page-container { max-width: 900px; }
.page-header { margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }

.section-card {
  background: white; border-radius: 12px; padding: 24px;
  border: 1px solid var(--border-color); margin-bottom: 24px;
}
.section-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px;
}
.section-header h3 { margin: 0; font-size: 16px; font-weight: 600; color: var(--text-primary); }
.section-badge { font-size: 12px; color: var(--text-muted); background: var(--color-bg-elevated); padding: 2px 10px; border-radius: 4px; }

.contact-form { padding-top: 4px; }
</style>
