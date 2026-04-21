<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>会员级别</h1>
      <n-button type="primary" @click="showAddModal = true">+ 添加级别</n-button>
    </div>

    <!-- 级别列表 -->
    <div class="level-grid">
      <div v-for="level in levelData" :key="level.id" class="level-card" :class="level.class">
        <div class="level-header">
          <div class="level-icon">
            <n-icon :component="StarOutline" size="28" />
          </div>
          <div class="level-info">
            <span class="level-name">{{ level.name }}</span>
            <span class="level-desc">{{ level.description }}</span>
          </div>
          <n-tag :type="level.type" size="small">{{ level.count }}人</n-tag>
        </div>
        <div class="level-rules">
          <div class="rule-item">
            <span class="rule-label">升级条件</span>
            <span class="rule-value">{{ level.upgradeCondition }}</span>
          </div>
          <div class="rule-item">
            <span class="rule-label">折扣</span>
            <span class="rule-value highlight">{{ level.discount }}</span>
          </div>
          <div class="rule-item">
            <span class="rule-label">积分倍数</span>
            <span class="rule-value">{{ level.pointRate }}</span>
          </div>
        </div>
        <div class="level-actions">
          <n-button size="small" @click="handleEdit(level)">编辑</n-button>
          <n-button size="small" text type="error">删除</n-button>
        </div>
      </div>
    </div>

    <!-- 添加级别弹窗 -->
    <n-modal v-model:show="showAddModal" preset="card" title="添加会员级别" style="width: 500px;">
      <n-form :model="formData" label-placement="top">
        <n-form-item label="级别名称">
          <n-input v-model:value="formData.name" placeholder="如：银卡会员" />
        </n-form-item>
        <n-form-item label="级别描述">
          <n-input v-model:value="formData.description" placeholder="简要描述该级别" />
        </n-form-item>
        <n-form-item label="升级条件（累计消费）">
          <n-input-number v-model:value="formData.upgradeAmount" :min="0" style="width: 100%;">
            <template #prefix>累计消费满</template>
            <template #suffix>元</template>
          </n-input-number>
        </n-form-item>
        <n-grid :cols="2" :x-gap="16">
          <n-gi>
            <n-form-item label="会员折扣">
              <n-input-number v-model:value="formData.discount" :min="0" :max="10" :precision="1" style="width: 100%;">
                <template #suffix>折</template>
              </n-input-number>
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="积分倍数">
              <n-input-number v-model:value="formData.pointRate" :min="1" style="width: 100%;">
                <template #suffix>倍</template>
              </n-input-number>
            </n-form-item>
          </n-gi>
        </n-grid>
        <n-form-item label="享受权益">
          <n-checkbox-group v-model:value="formData.benefits">
            <n-space vertical>
              <n-checkbox value="discount" label="消费折扣" />
              <n-checkbox value="points" label="积分加速" />
              <n-checkbox value="gift" label="生日礼包" />
              <n-checkbox value="priority" label="优先体验" />
            </n-space>
          </n-checkbox-group>
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showAddModal = false">取消</n-button>
          <n-button type="primary" @click="handleSubmit">确定添加</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  NButton, NIcon, NTag, NModal, NForm, NFormItem, NInput, NInputNumber,
  NGrid, NGi, NCheckbox, NCheckboxGroup, NSpace
} from 'naive-ui'
import { StarOutline } from '@vicons/ionicons5'

const showAddModal = ref(false)
const formData = ref({
  name: '', description: '', upgradeAmount: 0, discount: 10, pointRate: 1, benefits: []
})

const levelData = ref([
  { id: 1, name: '普卡会员', description: '注册即送', upgradeCondition: '注册即可', discount: '无', pointRate: '1倍', count: 2856, type: 'default', class: 'level-normal' },
  { id: 2, name: '银卡会员', description: '消费满500', upgradeCondition: '累计消费满500元', discount: '9.5折', pointRate: '1.2倍', count: 628, type: 'info', class: 'level-silver' },
  { id: 3, name: '金卡会员', description: '消费满2000', upgradeCondition: '累计消费满2000元', discount: '9折', pointRate: '1.5倍', count: 286, type: 'warning', class: 'level-gold' },
  { id: 4, name: 'VIP会员', description: '消费满5000', upgradeCondition: '累计消费满5000元', discount: '8折', pointRate: '2倍', count: 86, type: 'error', class: 'level-vip' },
])

function handleEdit(level: any) {
  console.log(level)
}

function handleSubmit() {
  showAddModal.value = false
}
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { font-size: 20px; font-weight: 600; color: #333; margin: 0; }
.level-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.level-card { background: #fff; border-radius: 16px; padding: 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.level-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
.level-icon { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; }
.level-normal .level-icon { background: linear-gradient(135deg, #9CA3AF, #6B7280); }
.level-silver .level-icon { background: linear-gradient(135deg, #C0C0C0, #A8A8A8); }
.level-gold .level-icon { background: linear-gradient(135deg, #F59E0B, #D97706); }
.level-vip .level-icon { background: linear-gradient(135deg, #8B5CF6, #7C3AED); }
.level-info { flex: 1; }
.level-name { display: block; font-size: 18px; font-weight: 600; color: #333; }
.level-desc { display: block; font-size: 13px; color: #999; margin-top: 2px; }
.level-rules { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
.rule-item { display: flex; justify-content: space-between; align-items: center; }
.rule-label { font-size: 14px; color: #666; }
.rule-value { font-size: 14px; font-weight: 500; color: #333; }
.rule-value.highlight { color: #F59E0B; font-weight: 600; }
.level-actions { display: flex; gap: 12px; border-top: 1px solid #f0f0f0; padding-top: 16px; }
</style>
