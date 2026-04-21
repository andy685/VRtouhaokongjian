<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>店铺列表</h1>
      <n-button type="primary">添加店铺</n-button>
    </div>

    <!-- 店铺列表 -->
    <div class="store-grid">
      <div v-for="store in storeData" :key="store.id" class="store-card">
        <div class="store-header">
          <div class="store-logo">
            <n-icon :component="StorefrontOutline" size="32" color="#fff" />
          </div>
          <div class="store-info">
            <span class="store-name">{{ store.name }}</span>
            <n-tag :type="store.status === '营业中' ? 'success' : 'warning'" size="small">
              {{ store.status }}
            </n-tag>
          </div>
          <n-button quaternary circle @click="handleEdit(store)">
            <template #icon><n-icon :component="SettingsOutline" /></template>
          </n-button>
        </div>
        <div class="store-stats">
          <div class="stat-item">
            <span class="stat-value">{{ store.devices }}</span>
            <span class="stat-label">设备</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ store.members }}</span>
            <span class="stat-label">会员</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">¥{{ store.todayRevenue }}</span>
            <span class="stat-label">今日营收</span>
          </div>
        </div>
        <div class="store-actions">
          <n-button size="small" type="primary" @click="handleManage(store)">管理</n-button>
          <n-button size="small" @click="handleSwitch(store)">切换</n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NButton, NIcon, NTag, NModal, NForm, NFormItem, NInput } from 'naive-ui'
import { StorefrontOutline, SettingsOutline } from '@vicons/ionicons5'

const storeData = ref([
  { id: 1, name: '深圳福田旗舰店', address: '福田区深南大道10000号', devices: 12, members: 3856, todayRevenue: 15680, status: '营业中' },
  { id: 2, name: '南山科技园店', address: '南山区科技园南区A栋', devices: 8, members: 2680, todayRevenue: 12860, status: '营业中' },
  { id: 3, name: '宝安中心店', address: '宝安区宝安大道888号', devices: 6, members: 1856, todayRevenue: 9680, status: '休息中' },
])

function handleEdit(store: any) {
  console.log(store)
}

function handleManage(store: any) {
  console.log('管理店铺', store)
}

function handleSwitch(store: any) {
  console.log('切换店铺', store)
}
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { font-size: 20px; font-weight: 600; color: #333; margin: 0; }
.store-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.store-card { background: #fff; border-radius: 16px; padding: 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.store-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.store-logo { width: 56px; height: 56px; border-radius: 12px; background: linear-gradient(135deg, #3B82F6, #2563EB); display: flex; align-items: center; justify-content: center; }
.store-info { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.store-name { font-size: 16px; font-weight: 600; color: #333; }
.store-stats { display: flex; justify-content: space-around; padding: 16px 0; border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0; margin-bottom: 16px; }
.stat-item { text-align: center; }
.stat-value { display: block; font-size: 18px; font-weight: 600; color: #333; }
.stat-label { display: block; font-size: 12px; color: #999; margin-top: 2px; }
.store-actions { display: flex; gap: 12px; }
.store-actions .n-button { flex: 1; }
</style>
