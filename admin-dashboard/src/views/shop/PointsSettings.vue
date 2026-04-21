<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>积分设置</h1>
    </div>

    <!-- 基本设置 -->
    <n-card class="settings-card">
      <template #header>
        <div class="card-title">积分规则</div>
      </template>
      <n-form label-placement="left" label-width="160">
        <n-form-item label="启用积分功能">
          <n-switch v-model:value="settings.enablePoints" />
        </n-form-item>
        <n-form-item label="积分名称">
          <n-input v-model:value="settings.pointsName" placeholder="如：成长值" style="width: 200px;" />
        </n-form-item>
        <n-form-item label="消费1元兑换积分">
          <n-input-number v-model:value="settings.consumeRate" :min="0" :precision="1" style="width: 150px;">
            <template #suffix>积分</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="100积分抵用金额">
          <n-input-number v-model:value="settings.exchangeRate" :min="0" :precision="2" style="width: 150px;">
            <template #prefix>¥</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="积分有效期">
          <n-input-number v-model:value="settings.validityDays" :min="0" style="width: 150px;">
            <template #suffix>天</template>
          </n-input-number>
          <span style="margin-left: 8px; color: #999; font-size: 13px;">0表示永久有效</span>
        </n-form-item>
      </n-form>
    </n-card>

    <!-- 积分获取规则 -->
    <n-card class="settings-card">
      <template #header>
        <div class="card-title">积分获取规则</div>
      </template>
      <n-form label-placement="left" label-width="160">
        <n-form-item label="VR消费">
          <n-input-number v-model:value="settings.vrPoints" :min="0" style="width: 150px;">
            <template #suffix>积分/小时</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="银幕互动">
          <n-input-number v-model:value="settings.screenPoints" :min="0" style="width: 150px;">
            <template #suffix>积分/小时</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="充值赠送">
          <n-input-number v-model:value="settings.rechargeBonus" :min="0" style="width: 150px;">
            <template #suffix>积分/元</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="生日双倍积分">
          <n-switch v-model:value="settings.birthdayDouble" />
        </n-form-item>
        <n-form-item label="会员日双倍积分">
          <n-switch v-model:value="settings.memberDayDouble" />
        </n-form-item>
      </n-form>
    </n-card>

    <!-- 积分使用规则 -->
    <n-card class="settings-card">
      <template #header>
        <div class="card-title">积分使用规则</div>
      </template>
      <n-form label-placement="left" label-width="160">
        <n-form-item label="最低兑换积分">
          <n-input-number v-model:value="settings.minExchange" :min="0" style="width: 150px;">
            <template #suffix>积分</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="每日兑换上限">
          <n-input-number v-model:value="settings.dailyLimit" :min="0" style="width: 150px;">
            <template #suffix>积分</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="允许兑换优惠券">
          <n-switch v-model:value="settings.allowCouponExchange" />
        </n-form-item>
        <n-form-item label="允许兑换商品">
          <n-switch v-model:value="settings.allowProductExchange" />
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
import { NCard, NForm, NFormItem, NSwitch, NInputNumber, NSpace, NButton, NInput } from 'naive-ui'

const settings = ref({
  enablePoints: true,
  pointsName: '积分',
  consumeRate: 1,
  exchangeRate: 0.01,
  validityDays: 365,
  vrPoints: 10,
  screenPoints: 5,
  rechargeBonus: 0.5,
  birthdayDouble: true,
  memberDayDouble: true,
  minExchange: 100,
  dailyLimit: 5000,
  allowCouponExchange: true,
  allowProductExchange: true
})

function saveSettings() {
  console.log('保存设置', settings.value)
}

function resetSettings() {
  settings.value = {
    enablePoints: true,
    pointsName: '积分',
    consumeRate: 1,
    exchangeRate: 0.01,
    validityDays: 365,
    vrPoints: 10,
    screenPoints: 5,
    rechargeBonus: 0.5,
    birthdayDouble: true,
    memberDayDouble: true,
    minExchange: 100,
    dailyLimit: 5000,
    allowCouponExchange: true,
    allowProductExchange: true
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
