<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>点播设置</h1>
    </div>

    <!-- 基本设置 -->
    <n-card class="settings-card">
      <template #header>
        <div class="card-title">基本设置</div>
      </template>
      <n-form label-placement="left" label-width="140">
        <n-form-item label="启用点播功能">
          <n-switch v-model:value="settings.enableOnDemand" />
        </n-form-item>
        <n-form-item label="默认计费方式">
          <n-select v-model:value="settings.billingType" :options="billingOptions" style="width: 300px;" />
        </n-form-item>
        <n-form-item label="最低消费金额">
          <n-input-number v-model:value="settings.minAmount" :min="0" style="width: 200px;">
            <template #suffix>元</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="超时自动暂停">
          <n-switch v-model:value="settings.autoPause" />
          <span style="margin-left: 12px; color: #999; font-size: 13px;">超时</span>
          <n-input-number v-model:value="settings.timeout" :min="1" style="width: 80px; margin: 0 4px;" />
          <span style="color: #999; font-size: 13px;">分钟后自动暂停</span>
        </n-form-item>
      </n-form>
    </n-card>

    <!-- 价格设置 -->
    <n-card class="settings-card">
      <template #header>
        <div class="card-title">价格设置</div>
      </template>
      <n-form label-placement="left" label-width="140">
        <n-form-item label="VR设备基础价">
          <n-input-number v-model:value="settings.vrBasePrice" :min="0" style="width: 200px;">
            <template #suffix>元/小时</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="银幕互动基础价">
          <n-input-number v-model:value="settings.screenBasePrice" :min="0" style="width: 200px;">
            <template #suffix>元/小时</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="AR体验基础价">
          <n-input-number v-model:value="settings.arBasePrice" :min="0" style="width: 200px;">
            <template #suffix>元/小时</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="启用节假日价格">
          <n-switch v-model:value="settings.enableHolidayPrice" />
        </n-form-item>
      </n-form>
    </n-card>

    <!-- 分成设置 -->
    <n-card class="settings-card">
      <template #header>
        <div class="card-title">分成设置</div>
      </template>
      <n-form label-placement="left" label-width="140">
        <n-form-item label="平台分成比例">
          <n-input-number v-model:value="settings.platformRatio" :min="0" :max="100" style="width: 200px;">
            <template #suffix>%</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="片方分成比例">
          <n-input-number v-model:value="settings.studioRatio" :min="0" :max="100" style="width: 200px;">
            <template #suffix>%</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="门店分成比例">
          <n-input-number :value="100 - settings.platformRatio - settings.studioRatio" disabled style="width: 200px;">
            <template #suffix>%</template>
          </n-input-number>
        </n-form-item>
      </n-form>
    </n-card>

    <!-- 保存按钮 -->
    <div class="actions">
      <n-space>
        <n-button @click="resetSettings">重置</n-button>
        <n-button type="primary" @click="saveSettings">保存设置</n-button>
      </n-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NCard, NForm, NFormItem, NSwitch, NInputNumber, NSelect, NSpace, NButton, NInput } from 'naive-ui'

const settings = ref({
  enableOnDemand: true,
  billingType: 'time',
  minAmount: 0,
  autoPause: true,
  timeout: 30,
  vrBasePrice: 68,
  screenBasePrice: 38,
  arBasePrice: 48,
  enableHolidayPrice: true,
  platformRatio: 20,
  studioRatio: 30
})

const billingOptions = [
  { label: '按时长计费', value: 'time' },
  { label: '按次计费', value: 'count' },
  { label: '套餐计费', value: 'package' }
]

function saveSettings() {
  console.log('保存设置', settings.value)
}

function resetSettings() {
  settings.value = {
    enableOnDemand: true,
    billingType: 'time',
    minAmount: 0,
    autoPause: true,
    timeout: 30,
    vrBasePrice: 68,
    screenBasePrice: 38,
    arBasePrice: 48,
    enableHolidayPrice: true,
    platformRatio: 20,
    studioRatio: 30
  }
}
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { margin-bottom: 24px; }
.page-header h1 { font-size: 20px; font-weight: 600; color: #333; margin: 0; }
.settings-card { margin-bottom: 20px; border-radius: 12px; }
.card-title { font-size: 16px; font-weight: 600; color: #333; }
.actions { display: flex; justify-content: flex-end; padding: 20px 0; }
</style>
