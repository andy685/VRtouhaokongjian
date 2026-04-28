<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>代理商管理</h1>
        <p class="header-desc">管理区域代理商及其下属店铺</p>
      </div>
      <n-space>
        <n-input v-model:value="searchText" placeholder="搜索代理商名称..." size="small" style="width: 200px;">
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
        <n-button type="primary" @click="showAddModal = true">
          <template #icon><n-icon :component="AddOutline" /></template> 新增代理商
        </n-button>
      </n-space>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="PeopleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">代理商总数</span>
          <span class="value">28</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="StorefrontOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">管辖店铺</span>
          <span class="value">156</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="TrendingUpOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">本月分润</span>
          <span class="value">¥128,560</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
          <n-icon :component="LocationOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">覆盖区域</span>
          <span class="value">15</span>
        </div>
      </div>
    </div>

    <div class="content-card">
      <n-data-table :columns="columns" :data="filteredData" :pagination="pagination" striped />
    </div>

    <!-- 新增/编辑弹窗 -->
    <n-modal v-model:show="showAddModal" preset="card" :title="isEdit ? '编辑代理商' : '新增代理商'" style="width: 520px;" :bordered="false">
      <n-form label-placement="left" label-width="100">
        <n-form-item label="代理商名称" required>
          <n-input v-model:value="form.name" placeholder="请输入代理商名称" />
        </n-form-item>
        <n-form-item label="联系人">
          <n-input v-model:value="form.contact" placeholder="请输入联系人姓名" />
        </n-form-item>
        <n-form-item label="联系电话">
          <n-input v-model:value="form.phone" placeholder="请输入联系电话" />
        </n-form-item>
        <n-form-item label="负责区域">
          <n-select v-model:value="form.region" :options="regionOptions" placeholder="请选择负责区域" />
        </n-form-item>
        <n-form-item label="分润比例">
          <n-input-number v-model:value="form.commissionRate" :min="0" :max="50" style="width: 100%;">
            <template #suffix>%</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="状态">
          <n-radio-group v-model:value="form.status">
            <n-radio value="active">正常</n-radio>
            <n-radio value="inactive">停用</n-radio>
          </n-radio-group>
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showAddModal = false">取消</n-button>
          <n-button type="primary" @click="handleSave">保存</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 详情弹窗 -->
    <n-modal v-model:show="showDetailModal" preset="card" title="代理商详情" style="width: 640px;" :bordered="false">
      <n-descriptions v-if="currentAgent" label-placement="left" :column="2" bordered>
        <n-descriptions-item label="代理商名称">{{ currentAgent.name }}</n-descriptions-item>
        <n-descriptions-item label="代理商ID">AG{{ String(currentAgent.id).padStart(4, '0') }}</n-descriptions-item>
        <n-descriptions-item label="联系人">{{ currentAgent.contact }}</n-descriptions-item>
        <n-descriptions-item label="联系电话">{{ currentAgent.phone }}</n-descriptions-item>
        <n-descriptions-item label="负责区域">{{ currentAgent.region }}</n-descriptions-item>
        <n-descriptions-item label="分润比例">{{ currentAgent.commissionRate }}%</n-descriptions-item>
        <n-descriptions-item label="旗下商家">{{ currentAgent.merchantCount }} 家</n-descriptions-item>
        <n-descriptions-item label="管辖店铺">{{ currentAgent.storeCount }} 家</n-descriptions-item>
        <n-descriptions-item label="本月游戏豆充值">{{ currentAgent.monthRecharge }}</n-descriptions-item>
        <n-descriptions-item label="本月分润">{{ currentAgent.monthCommission }}</n-descriptions-item>
        <n-descriptions-item label="状态">
          <n-tag :type="currentAgent.status === 'active' ? 'success' : 'default'" size="small">
            {{ currentAgent.status === 'active' ? '正常' : '停用' }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="创建时间" :span="2">{{ currentAgent.createdAt }}</n-descriptions-item>
      </n-descriptions>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showDetailModal = false">关闭</n-button>
          <n-button type="primary" @click="openEditFromDetail">编辑</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NButton, NDataTable, NTag, NSpace, NInput, NModal, NForm, NFormItem,
  NSelect, NRadioGroup, NRadio, NInputNumber, NIcon, NDescriptions, NDescriptionsItem, useMessage
} from 'naive-ui'
import {
  SearchOutline, AddOutline, PeopleOutline, StorefrontOutline,
  TrendingUpOutline, LocationOutline, EyeOutline, CreateOutline
} from '@vicons/ionicons5'

const message = useMessage()
const searchText = ref('')

const regionOptions = [
  { label: '华南区', value: '华南区' },
  { label: '华北区', value: '华北区' },
  { label: '华东区', value: '华东区' },
  { label: '西南区', value: '西南区' },
  { label: '华中区', value: '华中区' },
]

const columns = [
  { title: '代理商名称', key: 'name', width: 180 },
  { title: '联系人', key: 'contact', width: 100 },
  { title: '联系电话', key: 'phone', width: 130 },
  { title: '负责区域', key: 'region', width: 100 },
  { title: '旗下商家', key: 'merchantCount', width: 100 },
  { title: '分润比例', key: 'commissionRate', width: 100, render: (row: any) => `${row.commissionRate}%` },
  { title: '管辖店铺', key: 'storeCount', width: 100 },
  { title: '本月游戏豆充值', key: 'monthRecharge', width: 150 },
  { title: '本月分润', key: 'monthCommission', width: 120 },
  {
    title: '状态',
    key: 'status',
    width: 90,
    render(row: any) {
      return h(NTag, { type: row.status === 'active' ? 'success' : 'default', size: 'small', bordered: true }, () => row.status === 'active' ? '正常' : '停用')
    }
  },
  { title: '创建时间', key: 'createdAt', width: 120 },
  {
    title: '操作',
    key: 'actions',
    width: 160,
    fixed: 'right',
    render(row: any) {
      return h(NSpace, { size: 'small' }, {
        default: () => [
          h(NButton, { size: 'tiny', quaternary: true, type: 'info', onClick: () => openDetail(row) }, {
            default: () => '详情',
            icon: () => h(NIcon, { component: EyeOutline, size: 14 })
          }),
          h(NButton, { size: 'tiny', quaternary: true, type: 'primary', onClick: () => openEdit(row) }, {
            default: () => '编辑',
            icon: () => h(NIcon, { component: CreateOutline, size: 14 })
          }),
        ]
      })
    }
  },
]

const agentData = ref([
  { id: 1, name: '深圳未来科技', contact: '张伟', phone: '13800138001', region: '华南区', commissionRate: 15, merchantCount: 4, storeCount: 12, monthRecharge: '¥856,200', monthCommission: '¥128,430', status: 'active', createdAt: '2023-06-01' },
  { id: 2, name: '北京梦想空间', contact: '李娜', phone: '13800138002', region: '华北区', commissionRate: 12, merchantCount: 3, storeCount: 8, monthRecharge: '¥623,400', monthCommission: '¥74,808', status: 'active', createdAt: '2023-07-15' },
  { id: 3, name: '上海星际娱乐', contact: '王强', phone: '13800138003', region: '华东区', commissionRate: 18, merchantCount: 5, storeCount: 15, monthRecharge: '¥1,056,800', monthCommission: '¥190,224', status: 'active', createdAt: '2023-08-20' },
  { id: 4, name: '成都虚拟现实', contact: '赵敏', phone: '13800138004', region: '西南区', commissionRate: 10, merchantCount: 2, storeCount: 6, monthRecharge: '¥312,500', monthCommission: '¥31,250', status: 'active', createdAt: '2023-09-10' },
  { id: 5, name: '武汉创新体验', contact: '刘洋', phone: '13800138005', region: '华中区', commissionRate: 14, merchantCount: 2, storeCount: 9, monthRecharge: '¥445,600', monthCommission: '¥62,384', status: 'inactive', createdAt: '2023-10-05' },
])

const pagination = { pageSize: 10 }

const filteredData = computed(() => {
  let data = [...agentData.value]
  if (searchText.value) {
    const kw = searchText.value.toLowerCase()
    data = data.filter(d => d.name.toLowerCase().includes(kw) || d.contact.toLowerCase().includes(kw))
  }
  return data
})

// 新增/编辑
const showAddModal = ref(false)
const isEdit = ref(false)
const currentAgent = ref<any>(null)
const form = ref({ name: '', contact: '', phone: '', region: '', commissionRate: 10, status: 'active' })

function openEdit(row: any) {
  isEdit.value = true
  currentAgent.value = row
  form.value = { ...row }
  showAddModal.value = true
}

function handleSave() {
  if (isEdit.value && currentAgent.value) {
    const idx = agentData.value.findIndex(d => d.id === currentAgent.value.id)
    if (idx !== -1) {
      agentData.value[idx] = { ...agentData.value[idx], ...form.value }
      message.success('代理商信息已更新')
    }
  } else {
    agentData.value.unshift({
      id: Date.now(),
      ...form.value,
      storeCount: 0,
      monthRevenue: '¥0',
      monthCommission: '¥0',
      createdAt: new Date().toISOString().slice(0, 10),
    })
    message.success('代理商新增成功')
  }
  showAddModal.value = false
  form.value = { name: '', contact: '', phone: '', region: '', commissionRate: 10, status: 'active' }
  isEdit.value = false
}

// 详情
const showDetailModal = ref(false)

function openDetail(row: any) {
  currentAgent.value = row
  showDetailModal.value = true
}

function openEditFromDetail() {
  showDetailModal.value = false
  openEdit(currentAgent.value)
}
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
