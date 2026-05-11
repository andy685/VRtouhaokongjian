<template>
  <div class="page-container animate-fade-in">
    <!-- 返回 + 标题 -->
    <div class="page-header">
      <n-button quaternary size="small" @click="goBack" style="margin-right: 16px;">
        <template #icon><n-icon :component="ArrowBackOutline" /></template>
        返回
      </n-button>
      <span class="page-title">设置会员折扣</span>
    </div>

    <!-- 表单区域 -->
    <div class="form-card">
      <n-form ref="formRef" :model="formData" :rules="formRules" label-placement="left" :label-width="80" size="large">
        <n-form-item label="会员名：">
          <n-input v-model:value="memberName" disabled placeholder="" />
        </n-form-item>

        <n-form-item label="折扣方式：" path="discountType">
          <n-radio-group v-model:value="formData.discountType" @update:value="handleTypeChange">
            <n-radio value="custom">自定义折扣</n-radio>
            <n-radio value="level">会员等级折扣</n-radio>
          </n-radio-group>
        </n-form-item>

        <!-- 自定义折扣 - 展开字段 -->
        <template v-if="formData.discountType === 'custom'">
          <n-form-item label="消费折扣：" path="consumeDiscount">
            <n-input-number
              v-model:value="formData.consumeDiscount"
              :min="0"
              :max="100"
              placeholder=""
              style="flex:1;"
            >
              <template #suffix>%</template>
            </n-input-number>
          </n-form-item>

          <n-form-item label="游戏币兑换折扣：" path="pointsDiscount">
            <n-input-number
              v-model:value="formData.pointsDiscount"
              :min="0"
              :max="100"
              placeholder=""
              style="flex:1;"
            >
              <template #suffix>%</template>
            </n-input-number>
          </n-form-item>
        </template>
      </n-form>

      <!-- 保存按钮 -->
      <div class="form-actions">
        <n-button type="primary" block size="large" @click="handleSave" :loading="saving">
          保存
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NButton, NIcon, NForm, NFormItem, NInput,
  NRadioGroup, NRadio, NInputNumber, useMessage,
} from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'
import { ArrowBackOutline } from '@vicons/ionicons5'

const router = useRouter()
const route = useRoute()
const message = useMessage()
const formRef = ref<FormInst | null>(null)
const saving = ref(false)

// 会员名称（从路由参数获取）
const memberName = ref((route.query.name as string) || '妍妍')

// 表单数据
const formData = reactive({
  discountType: 'level' as 'custom' | 'level',
  consumeDiscount: null as number | null,
  pointsDiscount: null as number | null,
})

const isCustomDiscount = computed(() => formData.discountType === 'custom')

// 校验规则
const formRules: FormRules = {
  discountType: { required: true, message: '请选择折扣方式', trigger: 'change' },
  consumeDiscount: {
    trigger: ['blur', 'change'],
    validator: () => {
      if (!isCustomDiscount.value) return true
      if (formData.consumeDiscount === null || formData.consumeDiscount === undefined) {
        return new Error('请输入消费折扣')
      }
      if (formData.consumeDiscount < 0 || formData.consumeDiscount > 100) {
        return new Error('消费折扣需在0到100之间')
      }
      return true
    },
  },
  pointsDiscount: {
    trigger: ['blur', 'change'],
    validator: () => {
      if (!isCustomDiscount.value) return true
      if (formData.pointsDiscount === null || formData.pointsDiscount === undefined) {
        return new Error('请输入游戏币兑换折扣')
      }
      if (formData.pointsDiscount < 0 || formData.pointsDiscount > 100) {
        return new Error('游戏币兑换折扣需在0到100之间')
      }
      return true
    },
  },
}

function goBack() {
  router.back()
}

function handleTypeChange(val: string) {
  if (val === 'level') {
    formData.consumeDiscount = null
    formData.pointsDiscount = null
    return
  }

  formData.consumeDiscount ??= 100
  formData.pointsDiscount ??= 100
}

async function handleSave() {
  try {
    await formRef.value?.validate()
    saving.value = true

    await new Promise((resolve) => setTimeout(resolve, 600))

    const discountSummary = formData.discountType === 'level'
      ? '已切换为会员等级折扣'
      : `自定义折扣已保存（消费${formData.consumeDiscount}% / 游戏币${formData.pointsDiscount}%）`

    message.success(discountSummary)
    goBack()
  } catch (e) {
    message.error('请先完善折扣配置')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.page-container {
  padding: 24px;
  max-width: 640px;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 32px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.form-card {
  background: white;
  border-radius: 12px;
  padding: 40px 36px;
  border: 1px solid var(--border-color);
}

.form-actions {
  margin-top: 40px;
  display: flex;
  justify-content: center;
}

.form-actions .n-button {
  width: 200px;
}

/* 左侧标签文字左对齐 */
::deep(.n-form-item-label) {
  text-align: left !important;
  justify-content: flex-start !important;
}
</style>
