<template>
  <n-modal v-model:show="visible" title="标记异常订单" preset="dialog" positive-text="确认标记" negative-text="取消"
    :positive-button-props="{ disabled: !type }" @positive-click="onConfirm" @negative-click="visible = false">
    <n-form label-placement="left" label-width="80">
      <n-form-item label="订单号">
        <n-text depth="2">{{ target.orderNo }}</n-text>
      </n-form-item>
      <n-form-item label="订单金额">
        <n-text depth="2">{{ target.amount }}</n-text>
      </n-form-item>
      <n-form-item label="异常类型" required>
        <n-radio-group v-model:value="type">
          <n-radio v-for="t in exceptionTypes" :key="t" :value="t">{{ t }}</n-radio>
        </n-radio-group>
      </n-form-item>
      <n-form-item label="异常说明">
        <n-input v-model:value="reason" type="textarea" placeholder="选填，补充异常原因" :autosize="{ minRows: 2, maxRows: 4 }" />
      </n-form-item>
    </n-form>
  </n-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NModal, NForm, NFormItem, NText, NRadioGroup, NRadio, NInput, useMessage } from 'naive-ui'
import { useExceptionOrders, exceptionTypes } from '@/composables/useExceptionOrders'

const { markDialogVisible, markTarget, markType, markReason, confirmMark } = useExceptionOrders()
const message = useMessage()

const visible = computed({
  get: () => markDialogVisible.value,
  set: (v) => { markDialogVisible.value = v },
})
const target = computed(() => markTarget.value)
const type = computed({
  get: () => markType.value,
  set: (v) => { markType.value = v },
})
const reason = computed({
  get: () => markReason.value,
  set: (v) => { markReason.value = v },
})

function onConfirm() {
  confirmMark()
  message.success(`订单 ${target.value.orderNo} 已标记为异常`)
}
</script>
