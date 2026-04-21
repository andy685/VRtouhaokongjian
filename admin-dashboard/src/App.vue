<template>
  <n-config-provider :theme="darkTheme ? darkTheme : undefined" :locale="zhCN" :date-locale="dateZhCN">
    <n-message-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <n-loading-bar-provider>
            <router-view />
          </n-loading-bar-provider>
        </n-notification-provider>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { 
  NConfigProvider, NMessageProvider, NDialogProvider, 
  NNotificationProvider, NLoadingBarProvider,
  zhCN, dateZhCN
} from 'naive-ui'
import { ref } from 'vue'

const darkTheme = ref<any>(null)
</script>

<style scoped>
</style>
