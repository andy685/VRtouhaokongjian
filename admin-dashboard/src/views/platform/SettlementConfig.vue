<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>结算配置</h1>
        <p class="header-desc">设置自动结算周期、提现手续费率和打款规则</p>
      </div>
    </div>

    <!-- 自动结算配置 -->
    <div class="config-section">
      <h3 class="section-title">自动结算配置</h3>
      <n-card class="config-card">
        <n-form label-placement="left" label-width="140">
          <n-form-item label="自动结算">
            <n-switch v-model:value="autoSettlement.enabled" />
            <span class="form-hint">开启后，系统将按设定周期自动生成结算单</span>
          </n-form-item>

          <n-form-item label="结算周期" v-if="autoSettlement.enabled">
            <n-select v-model:value="autoSettlement.period" :options="periodOptions" style="width: 200px;" />
          </n-form-item>

          <n-form-item label="结算日" v-if="autoSettlement.enabled">
            <n-select v-model:value="autoSettlement.settlementDay" :options="dayOptions" style="width: 200px;" />
            <span class="form-hint">根据结算周期类型显示对应选项（按周/按月）</span>
          </n-form-item>

          <n-form-item label="最低结算门槛">
            <n-input-number v-model:value="autoSettlement.minAmount" :min="0" :step="100" style="width: 200px;" />
            <span style="margin-left: 8px;">元（结算金额低于此值不生成结算单，累积至下期）</span>
          </n-form-item>

          <n-form-item label="自动打款">
            <n-switch v-model:value="autoSettlement.autoTransfer" />
            <span class="form-hint">开启后，审核通过的结算单将自动打款到商家银行卡</span>
          </n-form-item>
        </n-form>
      </n-card>
    </div>

    <!-- 提现手续费配置 -->
    <div class="config-section">
      <h3 class="section-title">提现手续费配置</h3>
      <n-card class="config-card">
        <n-form label-placement="left" label-width="140">
          <n-form-item label="提现手续费模式">
            <n-radio-group v-model:value="feeConfig.mode">
              <n-radio value="global">全局统一费率</n-radio>
              <n-radio value="custom">按商家自定义</n-radio>
            </n-radio-group>
          </n-form-item>

          <n-form-item label="全局提现手续费率" v-if="feeConfig.mode === 'global'">
            <n-input-number
              v-model:value="feeConfig.globalRate"
              :min="0"
              :max="1"
              :step="0.001"
              :precision="3"
              style="width: 200px;"
            />
            <span style="margin-left: 8px;">（例：0.005 = 0.5%）</span>
          </n-form-item>

          <n-form-item label="提现手续费说明">
            <n-input
              v-model:value="feeConfig.description"
              type="textarea"
              placeholder="提现手续费说明，将在结算单中显示"
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
            <span style="margin-left: 8px;">元（结算金额提现手续费低于此值时，按此值收取）</span>
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

    <!-- 打款配置 -->
    <div class="config-section">
      <h3 class="section-title">打款配置</h3>
      <n-card class="config-card">
        <n-form label-placement="left" label-width="140">
          <n-form-item label="打款备注">
            <n-input
              v-model:value="transferConfig.remark"
              placeholder="打款时的备注信息"
              style="width: 400px;"
            />
            <span class="form-hint">支持变量：{merchantName} - 商家名称，{period} - 结算周期</span>
          </n-form-item>

          <n-form-item label="打款通知">
            <n-switch v-model:value="transferConfig.notifyEnabled" />
            <span class="form-hint">开启后，打款成功将通知商家</span>
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
  NCard, NForm, NFormItem, NSwitch, NSelect, NInputNumber,
  NInput, NRadioGroup, NRadio, useMessage
} from 'naive-ui'

const message = useMessage()

// 自动结算配置
const autoSettlement = ref({
  enabled: true,
  period: 'monthly',
  settlementDay: 5,
  autoTransfer: true,
  minAmount: 100,
})

const periodOptions = [
  { label: '每周', value: 'weekly' },
  { label: '每两周', value: 'biweekly' },
  { label: '每月', value: 'monthly' },
]

// 根据结算周期动态切换结算日选项
const dayOptions = computed(() => {
  if (autoSettlement.value.period === 'monthly') {
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
  // weekly / biweekly
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
  mode: 'global',
  globalRate: 0.005,
  description: '结算金额将扣除提现手续费后打款',
  minFee: 1,
  maxFee: 0
})

// 打款配置
const transferConfig = ref({
  remark: '结算打款 - {merchantName} - {period}',
  notifyEnabled: true
})

function handleSave() {
  // 这里应该调用API保存配置
  message.success('配置保存成功')
  console.log('保存配置：', {
    autoSettlement: autoSettlement.value,
    feeConfig: feeConfig.value,
    transferConfig: transferConfig.value
  })
}
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.header-desc { font-size: 13px; color: var(--text-muted); margin-top: 4px; display: block; }

.config-section { margin-bottom: 24px; }
.section-title { font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 12px; }

.config-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
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
