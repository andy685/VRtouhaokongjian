<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>小票设置</h1>
    </div>

    <n-card style="max-width: 700px; border-radius: 12px;">
      <n-form label-placement="left" label-width="140">
        <n-form-item label="自动打印小票">
          <n-switch v-model:value="settings.autoPrint" />
        </n-form-item>
        <n-form-item label="打印联数">
          <n-space align="center">
            <n-input-number v-model:value="settings.printCopies" :min="1" :max="3" style="width: 120px">
              <template #suffix>联</template>
            </n-input-number>
            <n-popover trigger="click" style="max-width: 280px;">
              <template #trigger>
                <n-icon :component="HelpCircleOutline" size="18" style="color: #3B82F6; cursor: pointer;" />
              </template>
              <div style="font-size: 13px; line-height: 1.6;">
                <div style="font-weight: 600; margin-bottom: 6px;">常见用法</div>
                <div>1联：只给顾客1张</div>
                <div>2联：顾客1张 + 商家留存1张</div>
                <div>3联：顾客1张 + 商家1张 + 财务对账1张</div>
              </div>
            </n-popover>
          </n-space>
        </n-form-item>
        <n-form-item label="小票抬头">
          <n-input v-model:value="settings.receiptTitle" placeholder="请输入小票抬头" style="width: 280px" />
        </n-form-item>
        <n-form-item label="商家电话">
          <n-input v-model:value="settings.shopPhone" placeholder="请输入联系电话" style="width: 200px" />
        </n-form-item>
        <n-form-item label="小票底部备注">
          <n-input v-model:value="settings.footerText" type="textarea" :rows="2" placeholder="如：谢谢惠顾，欢迎下次光临" style="width: 280px" />
        </n-form-item>
        <n-form-item label="打印Logo">
          <n-switch v-model:value="settings.printLogo" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space>
          <n-button type="primary" @click="saveSettings">保存设置</n-button>
          <n-button @click="resetSettings">重置</n-button>
        </n-space>
      </template>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  NCard, NForm, NFormItem, NSwitch, NInputNumber, NInput,
  NButton, NSpace, NPopover, NIcon
} from 'naive-ui'
import { HelpCircleOutline } from '@vicons/ionicons5'

const settings = ref({
  autoPrint: true,
  printCopies: 2,
  receiptTitle: '头号空间VR体验馆',
  shopPhone: '0755-88888888',
  footerText: '谢谢惠顾，欢迎下次光临',
  printLogo: true,
})

function saveSettings() {
  window.$message?.success('小票设置已保存')
}

function resetSettings() {
  settings.value = {
    autoPrint: true,
    printCopies: 2,
    receiptTitle: '头号空间VR体验馆',
    shopPhone: '0755-88888888',
    footerText: '谢谢惠顾，欢迎下次光临',
    printLogo: true,
  }
  window.$message?.info('已重置为默认设置')
}
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { margin-bottom: 24px; }
.page-header h1 { font-size: 20px; font-weight: 600; color: #333; margin: 0; }
</style>
