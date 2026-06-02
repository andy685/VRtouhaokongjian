<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>代理商结算配置</h1>
        <p class="header-desc">设置代理商分润的结算周期、提现手续费率和打款规则</p>
      </div>
    </div>

    <!-- 分润结算配置 -->
    <div class="config-section">
      <h3 class="section-title">分润结算配置</h3>
      <n-card class="config-card">
        <n-form label-placement="left" label-width="150">
          <n-form-item label="自动结算">
            <n-switch v-model:value="autoSettlement.enabled" />
            <span class="form-hint">开启后，系统将按设定周期自动为代理商生成分润结算单</span>
          </n-form-item>

          <n-form-item label="结算周期" v-if="autoSettlement.enabled">
            <n-select v-model:value="autoSettlement.period" :options="periodOptions" style="width: 220px;" />
          </n-form-item>

          <n-form-item label="结算日" v-if="autoSettlement.enabled">
            <n-select v-model:value="autoSettlement.settlementDay" :options="dayOptions" style="width: 220px;" />
            <span class="form-hint">每周期结束后第几天进行结算</span>
          </n-form-item>

          <n-form-item label="最低结算门槛">
            <n-input-number v-model:value="autoSettlement.minAmount" :min="0" :step="100" style="width: 200px;" />
            <span style="margin-left: 8px;">元（分润金额低于此值不生成结算单，累积至下期）</span>
          </n-form-item>

          <n-form-item label="自动打款">
            <n-switch v-model:value="autoSettlement.autoTransfer" />
            <span class="form-hint">开启后，审核通过的结算单将通过拉卡拉自动分账到代理商银行卡</span>
          </n-form-item>
        </n-form>
      </n-card>
    </div>

    <!-- 提现手续费配置 -->
    <div class="config-section">
      <h3 class="section-title">提现手续费配置</h3>
      <n-card class="config-card">
        <n-form label-placement="left" label-width="150">
          <n-form-item label="提现手续费模式">
            <n-radio-group v-model:value="feeConfig.mode">
              <n-radio value="global">全局统一费率</n-radio>
              <n-radio value="individual">按代理商单独设置</n-radio>
            </n-radio-group>
          </n-form-item>

          <n-form-item label="默认提现手续费率" v-if="feeConfig.mode === 'global'">
            <n-input-number
              v-model:value="feeConfig.globalRate"
              :min="0"
              :max="1"
              :step="0.001"
              :precision="3"
              style="width: 200px;"
            />
            <span style="margin-left: 8px;">（例：0.005 = 0.5%，代理商提现时扣除）</span>
          </n-form-item>

          <div v-if="feeConfig.mode === 'individual'">
            <n-alert type="info" style="margin-bottom: 16px;">
              按代理商单独设置的提现手续费率将覆盖默认费率。可在代理商管理页面中单独调整。
            </n-alert>
            <n-data-table
              :columns="agentFeeColumns"
              :data="agentFeeData"
              :pagination="false"
              size="small"
              striped
            />
          </div>

          <n-form-item label="提现手续费说明">
            <n-input
              v-model:value="feeConfig.description"
              type="textarea"
              placeholder="将在代理商结算单中显示的提现手续费说明"
              :autosize="{ minRows: 2, maxRows: 4 }"
            />
          </n-form-item>

          <n-form-item label="最低提现手续费">
            <n-input-number v-model:value="feeConfig.minFee" :min="0" :step="1" style="width: 200px;" />
            <span style="margin-left: 8px;">元（低于此值按此标准收取）</span>
          </n-form-item>

          <n-form-item label="最高提现手续费">
            <n-input-number v-model:value="feeConfig.maxFee" :min="0" :step="1" style="width: 200px;" />
            <span style="margin-left: 8px;">元（0表示不封顶）</span>
          </n-form-item>
        </n-form>
      </n-card>
    </div>

    <!-- 打款配置 -->
    <div class="config-section">
      <h3 class="section-title">打款配置</h3>
      <n-card class="config-card">
        <n-form label-placement="left" label-width="150">
          <n-form-item label="打款备注模板">
            <n-input
              v-model:value="transferConfig.remark"
              placeholder="打款时的备注信息"
              style="width: 420px;"
            />
            <span class="form-hint">支持变量：{agentName} - 代理商名称，{period} - 结算周期</span>
          </n-form-item>

          <n-form-item label="打款通知">
            <n-switch v-model:value="transferConfig.notifyEnabled" />
            <span class="form-hint">开启后，分账成功将通知代理商</span>
          </n-form-item>

          <n-form-item label="打款延迟天数">
            <n-input-number v-model:value="transferConfig.delayDays" :min="0" :max="30" :step="1" style="width: 120px;" />
            <span style="margin-left: 8px;">天（结算日后延迟几天执行自动打款）</span>
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
import { ref, h } from 'vue'
import {
  NCard, NForm, NFormItem, NSwitch, NSelect, NInputNumber,
  NInput, NRadioGroup, NRadio, NDataTable, NAlert, useMessage
} from 'naive-ui'

const message = useMessage()

// ==================== 分润结算配置 ====================
const autoSettlement = ref({
  enabled: true,
  period: 'monthly',
  settlementDay: 5,
  minAmount: 100,
  autoTransfer: true,
})

const periodOptions = [
  { label: '每周', value: 'weekly' },
  { label: '每两周', value: 'biweekly' },
  { label: '每月', value: 'monthly' },
]

const dayOptions = [
  { label: '每周一', value: 1 },
  { label: '每周二', value: 2 },
  { label: '每周三', value: 3 },
  { label: '每周四', value: 4 },
  { label: '每周五', value: 5 },
  { label: '每月1号', value: 1 },
  { label: '每月5号', value: 5 },
  { label: '每月10号', value: 10 },
  { label: '每月15号', value: 15 },
  { label: '每月20号', value: 20 },
  { label: '每月25号', value: 25 },
  { label: '每月月末', value: 0 },
]

// ==================== 提现手续费配置 ====================
const feeConfig = ref({
  mode: 'global' as 'global' | 'individual',
  globalRate: 0.005,
  description: '分润结算金额将扣除提现手续费后打款到银行卡',
  minFee: 1,
  maxFee: 0,
})

const agentFeeColumns = [
  { title: '代理商', key: 'agentName', width: 150 },
  { title: '分润比例', key: 'commissionRate', width: 100, render: (row: any) => `${row.commissionRate}%` },
  { title: '提现手续费率', key: 'feeRate', width: 110, render: (row: any) => `${(row.feeRate * 100).toFixed(1)}%` },
  { title: '状态', key: 'customized', width: 80, render: (row: any) => h('span', { style: row.customized ? 'color:#EF4444' : '#999' }, row.customized ? '自定义' : '默认') },
]

const agentFeeData = ref([
  { agentId: 1, agentName: '深圳未来科技', commissionRate: 15, feeRate: 0.005, customized: false },
  { agentId: 2, agentName: '北京梦想空间', commissionRate: 12, feeRate: 0.005, customized: false },
  { agentId: 3, agentName: '上海星际娱乐', commissionRate: 18, feeRate: 0.006, customized: true },
  { agentId: 4, agentName: '成都虚拟现实', commissionRate: 10, feeRate: 0.004, customized: true },
  { agentId: 5, agentName: '武汉创新体验', commissionRate: 14, feeRate: 0.005, customized: false },
])

// ==================== 打款配置 ====================
const transferConfig = ref({
  remark: '分润结算 - {agentName} - {period}',
  notifyEnabled: true,
  delayDays: 1,
})

// ==================== 保存 ====================
function handleSave() {
  message.success('代理商结算配置保存成功')
  console.log('保存配置：', {
    autoSettlement: autoSettlement.value,
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
