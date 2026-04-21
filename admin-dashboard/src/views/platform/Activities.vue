<template>
  <div class="page-container">
    <div class="page-header">
      <h2>活动配置</h2>
      <n-button type="primary">创建活动</n-button>
    </div>
    <n-grid :cols="3" :x-gap="20" :y-gap="20">
      <n-gi v-for="activity in activities" :key="activity.id">
        <n-card hoverable>
          <template #cover>
            <div class="activity-cover" :style="{ background: activity.gradient }">
              <span class="activity-icon">{{ activity.icon }}</span>
            </div>
          </template>
          <n-tag :type="activity.status === 'running' ? 'success' : 'default'" size="small">
            {{ activity.status === 'running' ? '进行中' : '已结束' }}
          </n-tag>
          <h3>{{ activity.name }}</h3>
          <p class="activity-desc">{{ activity.description }}</p>
          <div class="activity-stats">
            <span>参与: {{ activity.participants }}</span>
            <span>转化: {{ activity.conversion }}</span>
          </div>
          <template #footer>
            <n-space>
              <n-button size="small">编辑</n-button>
              <n-button size="small" tertiary>数据</n-button>
            </n-space>
          </template>
        </n-card>
      </n-gi>
    </n-grid>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NGrid, NGi, NCard, NTag, NButton, NSpace } from 'naive-ui'

const activities = ref([
  { id: 1, name: '新年嘉年华', icon: '🎉', description: '春节期间限时活动，满减优惠', gradient: 'linear-gradient(135deg, #f97316, #ea580c)', status: 'running', participants: '12,345', conversion: '8.2%' },
  { id: 2, name: '会员日特惠', icon: '👑', description: '每月8号会员专享折扣', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', status: 'running', participants: '5,678', conversion: '12.5%' },
  { id: 3, name: '开学季促销', icon: '🎒', description: '学生凭学生证享受优惠', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)', status: 'ended', participants: '8,901', conversion: '6.8%' },
])
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 24px; 
}
.page-header h2 { font-size: 20px; font-weight: 600; }
.activity-cover {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.activity-icon { font-size: 48px; }
h3 { margin: 12px 0 8px; font-size: 16px; font-weight: 600; }
.activity-desc { color: var(--text-muted); font-size: 13px; margin-bottom: 12px; }
.activity-stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--text-secondary);
}
</style>
