<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>店铺概览</h1>
        <p class="header-desc">查看您旗下商家的所有商家运营状态</p>
      </div>
      <n-space>
        <n-input v-model:value="searchText" placeholder="搜索店铺名称..." size="small" style="width: 200px;">
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
        <n-select v-model:value="filterStatus" placeholder="全部状态" :options="statusOptions" size="small" style="width: 120px;" clearable />
      </n-space>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="StorefrontOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">店铺总数</span>
          <span class="value">36</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="CheckmarkCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">营业中</span>
          <span class="value">32</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="HardwareChipOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">在线设备</span>
          <span class="value">298</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
          <n-icon :component="TrendingUpOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">今日营收</span>
          <span class="value">¥52K</span>
        </div>
      </div>
    </div>

    <div class="content-card">
      <n-data-table :columns="columns" :data="filteredData" :pagination="pagination" striped />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { NButton, NDataTable, NTag, NSpace, NInput, NSelect, NIcon } from 'naive-ui'
import { SearchOutline, StorefrontOutline, CheckmarkCircleOutline, TrendingUpOutline, HardwareChipOutline } from '@vicons/ionicons5'

const searchText = ref('')
const filterStatus = ref<string | null>(null)

const statusOptions = [
  { label: '营业中', value: 'online' },
  { label: '维护中', value: 'maintain' },
  { label: '已关闭', value: 'offline' },
]

const columns = [
  { title: '店铺名称', key: 'name', width: 180 },
  { title: '所属商家', key: 'merchant', width: 140 },
  { title: '地区', key: 'region', width: 100 },
  {
    title: '状态', key: 'status', width: 90,
    render: (row: any) => h(NTag, { type: row.status === 'online' ? 'success' : row.status === 'maintain' ? 'warning' : 'default', size: 'small' },
      () => row.status === 'online' ? '营业中' : row.status === 'maintain' ? '维护中' : '已关闭')
  },
  { title: '设备数', key: 'devices', width: 80 },
  { title: '在线设备', key: 'onlineDevices', width: 100 },
  { title: '店长', key: 'manager', width: 100 },
  { title: '今日营收', key: 'todayRevenue', width: 120 },
  { title: '本月营收', key: 'monthRevenue', width: 120 },
  { title: '会员数', key: 'memberCount', width: 90 },
]

const storeData = ref([
  { id: 1, name: '深圳福田旗舰店', merchant: '恒然集团', region: '深圳', status: 'online', devices: 12, onlineDevices: 11, manager: '张三', todayRevenue: '¥15,680', monthRevenue: '¥356,800', memberCount: 1280 },
  { id: 2, name: '南山科技园店', merchant: '恒然集团', region: '深圳', status: 'online', devices: 8, onlineDevices: 8, manager: '李四', todayRevenue: '¥9,240', monthRevenue: '¥198,500', memberCount: 856 },
  { id: 3, name: '南山科创店', merchant: '南山科创', region: '深圳', status: 'online', devices: 10, onlineDevices: 9, manager: '周八', todayRevenue: '¥11,200', monthRevenue: '¥245,600', memberCount: 920 },
  { id: 4, name: '宝安体验中心', merchant: '宝安体验', region: '深圳', status: 'online', devices: 4, onlineDevices: 3, manager: '钱总', todayRevenue: '¥4,560', monthRevenue: '¥98,700', memberCount: 560 },
  { id: 5, name: '龙岗欢乐时光', merchant: '龙岗欢乐', region: '深圳', status: 'maintain', devices: 6, onlineDevices: 0, manager: '孙总', todayRevenue: '¥0', monthRevenue: '¥45,600', memberCount: 320 },
  { id: 6, name: '东莞松山湖店', merchant: '东莞松山湖', region: '东莞', status: 'online', devices: 5, onlineDevices: 5, manager: '周总', todayRevenue: '¥6,800', monthRevenue: '¥89,200', memberCount: 680 },
])

const pagination = { pageSize: 10 }

const filteredData = computed(() => {
  let data = [...storeData.value]
  if (searchText.value) {
    const kw = searchText.value.toLowerCase()
    data = data.filter(d => d.name.toLowerCase().includes(kw) || d.merchant.toLowerCase().includes(kw))
  }
  if (filterStatus.value) {
    data = data.filter(d => d.status === filterStatus.value)
  }
  return data
})
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.header-desc { font-size: 13px; color: var(--text-muted); margin-top: 4px; display: block; }
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: white; border-radius: 14px; padding: 20px; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 16px; }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-content { display: flex; flex-direction: column; }
.stat-content .label { font-size: 12px; color: var(--text-muted); }
.stat-content .value { font-family: 'Orbitron', sans-serif; font-size: 22px; font-weight: 700; color: var(--text-primary); }
.content-card { background: white; border-radius: 16px; padding: 24px; border: 1px solid var(--border-color); }
</style>
