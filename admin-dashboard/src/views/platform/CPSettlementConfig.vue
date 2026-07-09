<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>供应商结算配置</h1>
        <p class="header-desc">统一设置 CP 供应商的结算周期、提现手续费和打款通知规则</p>
      </div>
    </div>

    <!-- 结算配置 -->
    <div class="config-section">
      <h3 class="section-title">结算规则</h3>
      <n-card class="config-card">
        <n-form label-placement="left" label-width="140">
          <n-form-item label="结算周期">
            <n-select v-model:value="settlementConfig.period" :options="periodOptions" style="width: 200px;" />
            <span class="form-hint">系统将按此周期自动生成供应商结算单</span>
          </n-form-item>

          <n-form-item label="结算日" v-if="settlementConfig.period !== 't1'">
            <n-select v-model:value="settlementConfig.settlementDay" :options="dayOptions" style="width: 200px;" />
            <span class="form-hint">每周周几/每月几号执行结算</span>
          </n-form-item>

          <n-form-item label="最低结算门槛">
            <n-input-number v-model:value="settlementConfig.minAmount" :min="0" :step="100" style="width: 200px;" />
            <span style="margin-left: 8px;">元（结算额低于此值不生成结算单，累积至下期）</span>
          </n-form-item>
        </n-form>
      </n-card>
    </div>

    <!-- 提现手续费配置 -->
    <div class="config-section">
      <h3 class="section-title">提现手续费</h3>
      <n-card class="config-card">
        <n-alert type="info" :bordered="false" style="margin-bottom: 16px;">
          供应商提现手续费率在<strong>创建/编辑供应商时单独设置</strong>（供应商管理 → 结算账户 → 提现手续费比例）。此处配置的是全局手续费上下限和说明文案。
        </n-alert>
        <n-form label-placement="left" label-width="140">
          <n-form-item label="提现手续费说明">
            <n-input
              v-model:value="feeConfig.description"
              type="textarea"
              placeholder="将在供应商结算单中显示的提现手续费说明"
              :autosize="{ minRows: 2, maxRows: 4 }"
            />
          </n-form-item>

          <n-form-item label="最低提现手续费">
            <n-input-number
              v-model:value="feeConfig.minFee"
              :min="0"
              :step="1"
              style="width: 200px;"
            />
            <span style="margin-left: 8px;">元（低于此值按此标准收取）</span>
          </n-form-item>

          <n-form-item label="最高提现手续费">
            <n-input-number
              v-model:value="feeConfig.maxFee"
              :min="0"
              :step="1"
              style="width: 200px;"
            />
            <span style="margin-left: 8px;">元（0表示不封顶）</span>
          </n-form-item>
        </n-form>
      </n-card>
    </div>

    <!-- 打款通知配置 -->
    <div class="config-section">
      <h3 class="section-title">打款通知</h3>
      <n-card class="config-card">
        <n-form label-placement="left" label-width="140">
          <n-form-item label="通知模版">
            <n-input
              v-model:value="transferConfig.remark"
              type="textarea"
              placeholder="结算成功后的通知内容"
              :autosize="{ minRows: 3, maxRows: 5 }"
              style="width: 500px;"
            />
            <span class="form-hint">支持变量：{cpName} - 供应商名称，{period} - 结算周期，{amount} - 到账金额</span>
          </n-form-item>
        </n-form>
      </n-card>
    </div>

    <!-- 保存按钮 -->
    <div class="save-section">
      <n-button type="primary" size="large" @click="handleSave">保存配置</n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  NCard, NForm, NFormItem, NSelect, NInputNumber,
  NInput, NAlert, useMessage
} from 'naive-ui'

const message = useMessage()

// 结算配置
const settlementConfig = ref({
  period: 'monthly',
  settlementDay: 5,
  minAmount: 100,
})

const periodOptions = [
  { label: '每周', value: 'weekly' },
  { label: '每月', value: 'monthly' },
  { label: 'T+1（次日）', value: 't1' },
]

const dayOptions = computed(() => {
  if (settlementConfig.value.period === 't1') {
    return [{ label: '次日自动结算', value: 0 }]
  }
  if (settlementConfig.value.period === 'monthly') {
    return [
      { label: '每月1号', value: 1 },
      { label: '每月5号', value: 5 },
      { label: '每月10号', value: 10 },
      { label: '每月15号', value: 15 },
      { label: '每月20号', value: 20 },
      { label: '每月25号', value: 25 },
      { label: '每月月末', value: 0 },
    ]
  }
  return [
    { label: '每周一', value: 1 },
    { label: '每周二', value: 2 },
    { label: '每周三', value: 3 },
    { label: '每周四', value: 4 },
    { label: '每周五', value: 5 },
  ]
})

// 提现手续费配置
const feeConfig = ref({
  description: '结算金额将扣除提现手续费后打款',
  minFee: 1,
  maxFee: 0,
})

// 打款通知配置
const transferConfig = ref({
  remark: '【头号空间】供应商结算通知\n供应商：{cpName}\n结算周期：{period}\n到账金额：¥{amount}\n如有疑问请联系平台客服。',
})

function handleSave() {
  message.success('供应商结算配置保存成功')
  console.log('保存配置：', {
    settlementConfig: settlementConfig.value,
    feeConfig: feeConfig.value,
    transferConfig: transferConfig.value,
  })
}
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.header-desc { font-size: 13px; color: var(--text-muted); margin-top: 4px; display: block; }

.config-section { margin-bottom: 28px; }
.section-title { font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 14px; }

.config-card {
  background: white;
  border-radius: 16px;
  padding: 26px;
  border: 1px solid var(--border-color);
}

.form-hint {
  margin-left: 12px;
  font-size: 12px;
  color: var(--text-muted);
}

.save-section {
  display: flex;
  justify-content: flex-end;
  margin-top: 32px;
}
</style>
