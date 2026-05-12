<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>游戏币设置</h1>
    </div>

    <n-card class="settings-card">
      <n-empty description="游戏币赠送规则已整合到充值套餐中，每个套餐可独立配置到账游戏币数量和有效期。">
        <template #extra>
          <n-button type="primary" @click="router.push('/shop/recharge')">前往充值套餐</n-button>
        </template>
      </n-empty>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { NCard, NButton, NEmpty } from 'naive-ui'
const router = useRouter()
</script>

<style scoped>
.page-container { padding: 24px; }
.settings-card { border-radius: 12px; padding: 40px; }
</style>
