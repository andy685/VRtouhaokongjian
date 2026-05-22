<template>
  <div class="page-container animate-fade-in">
    <!-- 返回 + 标题 -->
    <div class="page-header">
      <n-button quaternary size="small" @click="goBack" style="margin-right: 16px;">
        <template #icon><n-icon :component="ArrowBackOutline" /></template>
        返回
      </n-button>
      <span class="page-title">编辑会员信息</span>
    </div>

    <!-- 表单区域 -->
    <div class="form-card">
      <n-form ref="formRef" :model="formData" :rules="formRules" label-placement="left" :label-width="80" size="large">
        <!-- 基础信息只读提示 -->
        <div class="readonly-hint">
          <n-icon :component="InformationCircleOutline" size="16" />
          <span>以下为基础信息，全局通用，不可修改</span>
        </div>

        <n-form-item label="会员名：">
          <n-input v-model:value="formData.name" disabled />
        </n-form-item>

        <n-form-item label="手机号：" path="phone">
          <n-input v-model:value="formData.phone" disabled />
        </n-form-item>

        <n-form-item label="昵称：">
          <n-input v-model:value="formData.nickname" disabled />
        </n-form-item>

        <n-form-item label="性别：" path="gender">
          <n-select v-model:value="formData.gender" placeholder="请选择" :options="genderOptions" disabled />
        </n-form-item>

        <n-form-item label="开卡店铺：">
          <n-input v-model:value="formData.storeName" disabled />
        </n-form-item>

        <n-form-item label="会员等级：" path="level">
          <n-select v-model:value="formData.level" placeholder="请选择" :options="levelOptions" />
        </n-form-item>

        <n-form-item label="状态：" path="status">
          <n-radio-group v-model:value="formData.status">
            <n-radio value="active">正常</n-radio>
            <n-radio value="disabled">禁用</n-radio>
          </n-radio-group>
        </n-form-item>

        <n-divider style="margin: 24px 0 16px;" />

        <n-form-item label="预存金额：">
          <n-input-number v-model:value="formData.prepaidAmount" :min="0" :precision="2" style="flex:1;" disabled>
            <template #prefix>¥</template>
          </n-input-number>
        </n-form-item>

        <n-form-item label="预存次数：">
          <n-input-number v-model:value="formData.prepaidTimes" :min="0" style="flex:1;" disabled />
        </n-form-item>

        <n-form-item label="当前游戏币：">
          <n-input-number :value="formData.points" :precision="2" style="flex:1;" disabled>
            <template #suffix>分</template>
          </n-input-number>
        </n-form-item>

        <n-form-item label="调整类型：">
          <n-radio-group v-model:value="formData.pointAdjustType">
            <n-radio value="add">增加</n-radio>
            <n-radio value="deduct">减少</n-radio>
          </n-radio-group>
        </n-form-item>

        <n-form-item label="调整数量：">
          <n-input-number
            v-model:value="formData.pointAdjustAmount"
            :min="0"
            :precision="2"
            :disabled="!formData.pointAdjustType"
            style="flex:1;"
          >
            <template #suffix>分</template>
          </n-input-number>
        </n-form-item>

        <n-form-item label="调整后：">
          <n-input-number :value="adjustedPoints" :precision="2" style="flex:1;" disabled>
            <template #suffix>分</template>
          </n-input-number>
        </n-form-item>

        <n-divider style="margin: 24px 0 16px;" />

        <n-form-item label="备注：">
          <n-input v-model:value="formData.remark" type="textarea" placeholder="请输入备注信息" :rows="3" />
        </n-form-item>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NButton, NIcon, NForm, NFormItem, NInput,
  NRadioGroup, NRadio, NSelect, NInputNumber,NDivider,
} from 'naive-ui'
import { ArrowBackOutline, InformationCircleOutline } from '@vicons/ionicons5'

const router = useRouter()
const route = useRoute()
const formRef = ref()
const saving = ref(false)

// 下拉选项
const genderOptions = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
]

const levelOptions = [
  { label: '普通会员', value: 'normal' },
  { label: '青铜', value: 'bronze' },
  { label: '白银', value: 'silver' },
  { label: '黄金', value: 'gold' },
]

// 表单数据
const formData = reactive({
  name: '',
  phone: '',
  nickname: '',
  gender: null as string | null,
  storeName: '',
  level: null as string | null,
  status: 'active' as string,
  prepaidAmount: null as number | null,
  prepaidTimes: null as number | null,
  points: null as number | null,
  pointAdjustType: null as 'add' | 'deduct' | null,
  pointAdjustAmount: null as number | null,
  remark: '',
})

// 调整后的游戏币
const adjustedPoints = computed(() => {
  const current = formData.points ?? 0
  const amount = formData.pointAdjustAmount ?? 0
  if (!formData.pointAdjustType) return current
  if (formData.pointAdjustType === 'add') {
    return current + amount
  } else {
    return Math.max(0, current - amount)
  }
})

// 校验规则
const formRules = {
  level: { required: true, message: '请选择会员等级', trigger: 'change' },
}

// 模拟数据加载
onMounted(() => {
  // 从路由参数获取会员ID，实际应调用API获取详情
  const id = route.query.id
  if (id) {
    // 模拟加载数据
    Object.assign(formData, {
      name: (route.query.name as string) || '妍妍',
      phone: '13808888888',
      nickname: '黄金',
      gender: 'female',
      storeName: '和民轩小黑厅',
      level: 'gold',
      status: 'active',
      prepaidAmount: 20000.00,
      prepaidTimes: 0,
      points: 1000.00,
      remark: '',
    })
  }
})

function goBack() {
  router.back()
}

async function handleSave() {
  try {
    await formRef.value?.validate()
    saving.value = true
    // 计算最终游戏币值
    const finalPoints = adjustedPoints.value
    const saveData = {
      level: formData.level,
      status: formData.status,
      remark: formData.remark,
      points: finalPoints,
      pointAdjustType: formData.pointAdjustType,
      pointAdjustAmount: formData.pointAdjustAmount,
    }
    console.log('保存数据:', saveData)
    setTimeout(() => {
      saving.value = false
      goBack()
    }, 600)
  } catch (e) {
    // 校验失败
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

.readonly-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  margin-bottom: 20px;
  background: var(--warning-color-suppl, #fff8e1);
  border-radius: 8px;
  font-size: 13px;
  color: var(--text-secondary, #666);
  border: 1px solid var(--warning-color-suppl, #ffe082);
}

.readonly-hint .n-icon {
  color: var(--warning-color, #f0a020);
  flex-shrink: 0;
}

.form-card {
  background: white;
  border-radius: 12px;
  padding: 40px 36px;
  border: 1px solid var(--border-color);
}

.form-actions {
  margin-top: 32px;
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
