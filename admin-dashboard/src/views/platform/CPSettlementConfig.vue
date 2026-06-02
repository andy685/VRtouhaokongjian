<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>CP 结算配置</h1>
        <p class="header-desc">设置 CP 供应商自动结算周期、提现手续费率和最低结算门槛</p>
      </div>
    </div>

    <!-- 单次成本基准配置 -->
    <div class="config-section">
      <h3 class="section-title">结算基准配置</h3>
      <n-card class="config-card">
        <n-form label-placement="left" label-width="150">
          <n-form-item label="默认单次成本">
            <n-input-number v-model:value="baseConfig.defaultPerPlayCost" :min="0.1" :step="0.1" :precision="2" style="width: 200px;" />
            <span class="form-hint">元/次（新入驻 CP 的默认结算单价，可逐个调整）</span>
          </n-form-item>
          <n-form-item label="最低结算门槛">
            <n-input-number v-model:value="baseConfig.minSettlement" :min="0" :step="100" style="width: 200px;" />
            <span class="form-hint">元（月结算额低于此值累积至下期）</span>
          </n-form-item>
          <n-form-item label="最高结算上限">
            <n-input-number v-model:value="baseConfig.maxSettlement" :min="0" :step="1000" style="width: 200px;" />
            <span class="form-hint">元（单次结算上限，0 为不限制）</span>
          </n-form-item>
        </n-form>
      </n-card>
    </div>

    <!-- 提现手续费配置 -->
    <div class="config-section">
      <h3 class="section-title">提现手续费配置</h3>
      <n-card class="config-card">
        <n-form label-placement="left" label-width="150">
          <n-form-item label="提现手续费承担方">
            <n-radio-group v-model:value="feeConfig.bearer">
              <n-radio-button value="cp" label="CP承担">CP 供应商承担</n-radio-button>
              <n-radio-button value="platform" label="平台承担">平台承担</n-radio-button>
            </n-radio-group>
          </n-form-item>
          <n-form-item label="提现手续费率">
            <n-input-number v-model:value="feeConfig.rate" :min="0" :max="10" :step="0.1" :precision="1" style="width: 200px;">
              <template #suffix>%</template>
            </n-input-number>
            <span class="form-hint">提现时支付渠道（拉卡拉）扣取的手续费率</span>
          </n-form-item>
          <n-form-item label="提现手续费上限">
            <n-input-number v-model:value="feeConfig.maxFee" :min="0" :step="10" style="width: 200px;">
              <template #suffix>元/笔</template>
            </n-input-number>
            <span class="form-hint">单笔提现手续费封顶，0 为不限制</span>
          </n-form-item>
        </n-form>
      </n-card>
    </div>

    <!-- 自动结算配置 -->
    <div class="config-section">
      <h3 class="section-title">自动结算配置</h3>
      <n-card class="config-card">
        <n-form label-placement="left" label-width="150">
          <n-form-item label="自动结算">
            <n-switch v-model:value="settlementConfig.enabled" />
            <span class="form-hint">开启后，系统按月自动生成 CP 结算单</span>
          </n-form-item>
          <n-form-item label="结算日" v-if="settlementConfig.enabled">
            <n-select v-model:value="settlementConfig.settlementDay" :options="dayOptions" style="width: 200px;" />
            <span class="form-hint">每月固定日期生成上月结算单</span>
          </n-form-item>
          <n-form-item label="自动分账" v-if="settlementConfig.enabled">
            <n-switch v-model:value="settlementConfig.autoTransfer" />
            <span class="form-hint">开启后，审核通过的结算单自动提交拉卡拉分账</span>
          </n-form-item>
          <n-form-item label="分账延迟" v-if="settlementConfig.autoTransfer">
            <n-input-number v-model:value="settlementConfig.transferDelay" :min="0" :max="30" style="width: 200px;">
              <template #suffix>天</template>
            </n-input-number>
            <span class="form-hint">结算单生成后延迟 X 天提交分账（缓冲期用于核对）</span>
          </n-form-item>
        </n-form>
      </n-card>
    </div>

    <div class="action-bar">
      <n-button type="primary" size="large" @click="handleSave" :loading="saving">保存配置</n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  NButton, NSwitch, NSelect, NInputNumber, NRadioGroup, NRadioButton,
  NCard, NForm, NFormItem, useMessage
} from 'naive-ui'

const message = useMessage()
const saving = ref(false)

const baseConfig = ref({
  defaultPerPlayCost: 2.00,
  minSettlement: 100,
  maxSettlement: 0,
})

const feeConfig = ref({
  bearer: 'cp',
  rate: 2.0,
  maxFee: 0,
})

const settlementConfig = ref({
  enabled: true,
  settlementDay: 5,
  autoTransfer: true,
  transferDelay: 3,
})

const dayOptions = Array.from({ length: 28 }, (_, i) => ({ label: `每月 ${i + 1} 日`, value: i + 1 }))

function handleSave() {
  saving.value = true
  setTimeout(() => {
    saving.value = false
    message.success('CP 结算配置已保存')
  }, 800)
}
</script>

<style scoped>
.page-container { padding: 24px; max-width: 900px; }
.page-header { margin-bottom: 28px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.header-desc { font-size: 13px; color: var(--text-muted); margin-top: 4px; }
.config-section { margin-bottom: 24px; }
.section-title { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0 0 12px; padding-left: 4px; border-left: 3px solid #3B82F6; }
.config-card { border-radius: 14px; }
.form-hint { margin-left: 8px; font-size: 12px; color: var(--text-muted); }
.action-bar { margin-top: 32px; display: flex; justify-content: flex-end; }
</style>
