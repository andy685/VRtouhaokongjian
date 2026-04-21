<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>收银设置</h1>
    </div>

    <div class="settings-grid">
      <!-- 基本设置 -->
      <n-card title="基本设置" size="small">
        <n-form label-placement="left" label-width="120">
          <n-form-item label="允许赊账">
            <n-switch v-model:value="settings.allowCredit" />
          </n-form-item>
          <n-form-item label="赊账上限">
            <n-input-number v-model:value="settings.creditLimit" :min="0" style="width: 150px">
              <template #suffix>元</template>
            </n-input-number>
          </n-form-item>
          <n-form-item label="允许抹零">
            <n-switch v-model:value="settings.allowRound" />
          </n-form-item>
          <n-form-item label="自动找零">
            <n-switch v-model:value="settings.autoChange" />
          </n-form-item>
        </n-form>
      </n-card>

      <!-- 支付方式 -->
      <n-card title="支付方式" size="small">
        <n-form label-placement="left" label-width="120">
          <n-form-item label="现金支付">
            <n-switch v-model:value="settings.payCash" />
          </n-form-item>
          <n-form-item label="微信支付">
            <n-switch v-model:value="settings.payWechat" />
          </n-form-item>
          <n-form-item label="支付宝">
            <n-switch v-model:value="settings.payAlipay" />
          </n-form-item>
          <n-form-item label="会员卡支付">
            <n-switch v-model:value="settings.payMember" />
          </n-form-item>
          <n-form-item label="银行卡支付">
            <n-switch v-model:value="settings.payBank" />
          </n-form-item>
        </n-form>
      </n-card>

      <!-- 小票设置 -->
      <n-card title="小票打印设置" size="small">
        <n-form label-placement="left" label-width="120">
          <n-form-item label="自动打印小票">
            <n-switch v-model:value="settings.autoPrint" />
          </n-form-item>
          <n-form-item label="打印联数">
            <n-input-number v-model:value="settings.printCopies" :min="1" :max="3" style="width: 100px">
              <template #suffix>联</template>
            </n-input-number>
          </n-form-item>
          <n-form-item label="小票抬头">
            <n-input v-model:value="settings.receiptTitle" placeholder="请输入小票抬头" style="width: 200px" />
          </n-form-item>
          <n-form-item label="商家电话">
            <n-input v-model:value="settings.shopPhone" placeholder="请输入联系电话" style="width: 150px" />
          </n-form-item>
        </n-form>
      </n-card>

      <!-- 快捷收款金额 -->
      <n-card title="快捷收款金额" size="small">
        <n-space>
          <n-tag v-for="amount in settings.quickAmounts" :key="amount" closable @close="removeAmount(amount)">
            ¥{{ amount }}
          </n-tag>
          <n-button size="small" @click="showAddAmount = true">+ 添加金额</n-button>
        </n-space>
      </n-card>
    </div>

    <div class="page-footer">
      <n-button type="primary" @click="saveSettings">保存设置</n-button>
      <n-button @click="resetSettings">重置</n-button>
    </div>

    <!-- 添加金额弹窗 -->
    <n-modal v-model:show="showAddAmount" preset="card" title="添加快捷金额" style="width: 300px;">
      <n-input-number v-model:value="newAmount" :min="1" placeholder="输入金额" style="width: 100%;">
        <template #suffix>元</template>
      </n-input-number>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showAddAmount = false">取消</n-button>
          <n-button type="primary" @click="addAmount">确定</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  NCard, NForm, NFormItem, NSwitch, NInputNumber, NInput,
  NButton, NSpace, NTag, NModal, useMessage
} from 'naive-ui'

const message = useMessage()
const showAddAmount = ref(false)
const newAmount = ref(100)

const settings = ref({
  allowCredit: false,
  creditLimit: 500,
  allowRound: true,
  autoChange: true,
  payCash: true,
  payWechat: true,
  payAlipay: true,
  payMember: true,
  payBank: false,
  autoPrint: true,
  printCopies: 2,
  receiptTitle: '头号空间VR体验馆',
  shopPhone: '0755-88888888',
  quickAmounts: [50, 100, 200, 300, 500, 1000],
})

function saveSettings() {
  message.success('收银设置已保存')
}

function resetSettings() {
  message.info('已重置为默认设置')
}

function addAmount() {
  if (!settings.value.quickAmounts.includes(newAmount.value)) {
    settings.value.quickAmounts.push(newAmount.value)
    settings.value.quickAmounts.sort((a, b) => a - b)
  }
  showAddAmount.value = false
}

function removeAmount(amount: number) {
  const idx = settings.value.quickAmounts.indexOf(amount)
  if (idx > -1) settings.value.quickAmounts.splice(idx, 1)
}
</script>

<style scoped>
.page-container { max-width: 900px; }

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.page-footer {
  display: flex;
  gap: 12px;
}

@media (max-width: 768px) {
  .settings-grid { grid-template-columns: 1fr; }
}
</style>
