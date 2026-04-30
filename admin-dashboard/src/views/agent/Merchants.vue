<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>商家管理</h1>
        <p class="header-desc">管理您旗下的商家，协助商家开设店铺</p>
      </div>
      <n-space>
        <n-input v-model:value="searchText" placeholder="搜索商家名称..." size="small" style="width: 200px;">
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
      </n-space>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="PeopleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">旗下商家</span>
          <span class="value">12</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="CheckmarkCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">正常营业</span>
          <span class="value">10</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="StorefrontOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">旗下店铺</span>
          <span class="value">36</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
          <n-icon :component="TrendingUpOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">本月分润</span>
          <span class="value">¥128K</span>
        </div>
      </div>
    </div>

    <div class="content-card">
      <n-data-table :columns="columns" :data="filteredData" :pagination="pagination" striped />
    </div>

    <!-- 新增/编辑弹窗 -->

    <!-- 详情弹窗 -->
    <n-modal :show="showDetailModal" @update:show="(val: boolean) => showDetailModal = val" preset="card" title="商家详情" style="width: 640px;" :bordered="false">
      <n-descriptions v-if="currentMerchant" label-placement="left" :column="2" bordered>
        <n-descriptions-item label="商家名称">{{ currentMerchant.name }}</n-descriptions-item>
        <n-descriptions-item label="商家ID">MC{{ String(currentMerchant.id).padStart(5, '0') }}</n-descriptions-item>
        <n-descriptions-item label="联系人">{{ currentMerchant.contact }}</n-descriptions-item>
        <n-descriptions-item label="联系电话">{{ currentMerchant.phone }}</n-descriptions-item>
        <n-descriptions-item label="负责区域">{{ currentMerchant.region }}</n-descriptions-item>
        <n-descriptions-item label="商家状态">
          <n-tag :type="currentMerchant.status === 'active' ? 'success' : currentMerchant.status === 'pending' ? 'warning' : 'default'" size="small">
            {{ currentMerchant.status === 'active' ? '正常' : currentMerchant.status === 'pending' ? '待审核' : '停用' }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="旗下店铺">{{ currentMerchant.storeCount }} 家</n-descriptions-item>
        <n-descriptions-item label="会员总数">{{ currentMerchant.memberCount?.toLocaleString() }} 人</n-descriptions-item>
        <n-descriptions-item label="本月游戏豆充值">{{ currentMerchant.monthRecharge }}</n-descriptions-item>
        <n-descriptions-item label="合作时间">{{ currentMerchant.createdAt || '-' }}</n-descriptions-item>
      </n-descriptions>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showDetailModal = false">关闭</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { NButton, NDataTable, NTag, NSpace, NInput, NModal, NIcon, NDescriptions, NDescriptionsItem, useMessage } from 'naive-ui'
import { SearchOutline, PeopleOutline, StorefrontOutline, TrendingUpOutline, CheckmarkCircleOutline, EyeOutline } from '@vicons/ionicons5'

const message = useMessage()
const searchText = ref('')

const columns = [
  { title: '商家名称', key: 'name', width: 180 },
  { title: '联系人', key: 'contact', width: 100 },
  { title: '联系电话', key: 'phone', width: 130 },
  { title: '负责区域', key: 'region', width: 100 },
  {
    title: '状态', key: 'status', width: 90,
    render: (row: any) => h(NTag, { type: row.status === 'active' ? 'success' : row.status === 'pending' ? 'warning' : 'default', size: 'small' },
      () => row.status === 'active' ? '正常' : row.status === 'pending' ? '待审核' : '停用')
  },
  { title: '旗下店铺', key: 'storeCount', width: 100 },
  { title: '会员数', key: 'memberCount', width: 90 },
  { title: '本月游戏豆充值', key: 'monthRecharge', width: 150 },
  {
    title: '操作', key: 'actions', width: 80, fixed: 'right',
    render: (row: any) => h(NButton, { size: 'tiny', quaternary: true, type: 'info', onClick: () => openDetail(row) }, {
      default: () => '详情', icon: () => h(NIcon, { component: EyeOutline, size: 14 })
    })
  },
]

const merchantData = ref([
  { id: 1, name: '恒然集团', contact: '陈总', phone: '13800001101', region: '深圳', status: 'active', storeCount: 8, memberCount: 3280, monthRecharge: '¥156,800', createdAt: '2024-03-15' },
  { id: 2, name: '南山科创', contact: '赵总', phone: '13800001106', region: '深圳', status: 'active', storeCount: 6, memberCount: 2450, monthRecharge: '¥134,600', createdAt: '2024-05-20' },
  { id: 3, name: '宝安体验中心', contact: '钱总', phone: '13800001109', region: '深圳', status: 'active', storeCount: 2, memberCount: 560, monthRecharge: '¥45,600', createdAt: '2024-07-08' },
  { id: 4, name: '龙岗欢乐时光', contact: '孙总', phone: '13800001110', region: '深圳', status: 'active', storeCount: 1, memberCount: 320, monthRecharge: '¥23,400', createdAt: '2024-09-12' },
  { id: 5, name: '东莞松山湖店', contact: '周总', phone: '13800001111', region: '东莞', status: 'pending', storeCount: 1, memberCount: 0, monthRecharge: '¥0', createdAt: '2026-04-25' },
])

const pagination = { pageSize: 10 }

const filteredData = computed(() => {
  let data = [...merchantData.value]
  if (searchText.value) {
    const kw = searchText.value.toLowerCase()
    data = data.filter(d => d.name.toLowerCase().includes(kw) || d.contact.toLowerCase().includes(kw))
  }
  return data
})

function openDetail(row: any) {
  currentMerchant.value = row
  showDetailModal.value = true
}

const showDetailModal = ref(false)
const currentMerchant = ref<any>(null)
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
