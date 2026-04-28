<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>店铺列表</h1>
        <p class="header-desc">管理所有已入驻和待审核的店铺</p>
      </div>
      <n-space>
        <n-input v-model:value="searchText" placeholder="搜索店铺名称/店长..." size="small" style="width: 220px;">
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
        <n-select v-model:value="filterRegion" placeholder="全部区域" :options="regionOptions" size="small" style="width: 140px;" clearable />
        <n-select v-model:value="filterStatus" placeholder="全部状态" :options="statusOptions" size="small" style="width: 120px;" clearable />
        <n-button type="primary" @click="showAddModal = true">
          <template #icon><n-icon :component="AddOutline" /></template> 新增店铺
        </n-button>
      </n-space>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="StorefrontOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">总店铺数</span>
          <span class="value">168</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="CheckmarkCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">营业中</span>
          <span class="value">156</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="TimeOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">待审核</span>
          <span class="value warning">8</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
          <n-icon :component="LocationOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">覆盖城市</span>
          <span class="value">32</span>
        </div>
      </div>
    </div>

    <div class="content-card">
      <n-data-table :columns="columns" :data="filteredData" :pagination="pagination" striped />
    </div>

    <!-- 新增店铺弹窗 -->
    <n-modal v-model:show="showAddModal" preset="card" title="新增店铺" style="width: 560px;" :bordered="false">
      <n-form ref="addFormRef" :model="addForm" :rules="addRules" label-placement="left" label-width="100">
        <n-form-item label="店铺名称" path="name">
          <n-input v-model:value="addForm.name" placeholder="请输入店铺名称" />
        </n-form-item>
        <n-form-item label="所属区域" path="region">
          <n-select v-model:value="addForm.region" :options="regionOptions" placeholder="请选择区域" />
        </n-form-item>
        <n-form-item label="详细地址" path="address">
          <n-input v-model:value="addForm.address" placeholder="请输入详细地址" />
        </n-form-item>
        <n-form-item label="店长姓名" path="manager">
          <n-input v-model:value="addForm.manager" placeholder="请输入店长姓名" />
        </n-form-item>
        <n-form-item label="联系电话" path="phone">
          <n-input v-model:value="addForm.phone" placeholder="请输入联系电话" />
        </n-form-item>
        <n-form-item label="设备数量" path="deviceCount">
          <n-input-number v-model:value="addForm.deviceCount" :min="1" :max="100" style="width: 100%;" />
        </n-form-item>
        <n-form-item label="店铺状态" path="status">
          <n-radio-group v-model:value="addForm.status">
            <n-radio value="online">营业中</n-radio>
            <n-radio value="offline">已打烊</n-radio>
            <n-radio value="maintain">维护中</n-radio>
          </n-radio-group>
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showAddModal = false">取消</n-button>
          <n-button type="primary" @click="handleAdd">确认新增</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 编辑店铺弹窗 -->
    <n-modal v-model:show="showEditModal" preset="card" title="编辑店铺" style="width: 560px;" :bordered="false">
      <n-form v-if="currentStore" label-placement="left" label-width="100">
        <n-form-item label="店铺名称">
          <n-input v-model:value="editForm.name" />
        </n-form-item>
        <n-form-item label="所属区域">
          <n-select v-model:value="editForm.region" :options="regionOptions" />
        </n-form-item>
        <n-form-item label="详细地址">
          <n-input v-model:value="editForm.address" />
        </n-form-item>
        <n-form-item label="店长姓名">
          <n-input v-model:value="editForm.manager" />
        </n-form-item>
        <n-form-item label="联系电话">
          <n-input v-model:value="editForm.phone" />
        </n-form-item>
        <n-form-item label="设备数量">
          <n-input-number v-model:value="editForm.deviceCount" :min="1" :max="100" style="width: 100%;" />
        </n-form-item>
        <n-form-item label="店铺状态">
          <n-radio-group v-model:value="editForm.status">
            <n-radio value="online">营业中</n-radio>
            <n-radio value="offline">已打烊</n-radio>
            <n-radio value="maintain">维护中</n-radio>
          </n-radio-group>
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showEditModal = false">取消</n-button>
          <n-button type="primary" @click="handleEdit">保存</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 详情弹窗 -->
    <n-modal v-model:show="showDetailModal" preset="card" title="店铺详情" style="width: 640px;" :bordered="false">
      <n-descriptions v-if="currentStore" label-placement="left" :column="2" bordered>
        <n-descriptions-item label="店铺名称">{{ currentStore.name }}</n-descriptions-item>
        <n-descriptions-item label="店铺ID">ST{{ String(currentStore.id).padStart(5, '0') }}</n-descriptions-item>
        <n-descriptions-item label="所属区域">{{ currentStore.region }}</n-descriptions-item>
        <n-descriptions-item label="详细地址">{{ currentStore.address }}</n-descriptions-item>
        <n-descriptions-item label="店长">{{ currentStore.manager }}</n-descriptions-item>
        <n-descriptions-item label="联系电话">{{ currentStore.phone }}</n-descriptions-item>
        <n-descriptions-item label="设备数量">{{ currentStore.devices }} 台</n-descriptions-item>
        <n-descriptions-item label="店铺状态">
          <n-tag :type="currentStore.status === 'online' ? 'success' : currentStore.status === 'maintain' ? 'warning' : 'default'" size="small">
            {{ currentStore.statusText }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="创建时间">{{ currentStore.createdAt }}</n-descriptions-item>
        <n-descriptions-item label="今日营收">{{ currentStore.todayRevenue }}</n-descriptions-item>
        <n-descriptions-item label="本月营收">{{ currentStore.monthRevenue }}</n-descriptions-item>
        <n-descriptions-item label="会员数">{{ currentStore.memberCount }} 人</n-descriptions-item>
      </n-descriptions>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showDetailModal = false">关闭</n-button>
          <n-button type="primary" @click="openEditFromDetail">编辑店铺</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 删除确认 -->
    <n-modal v-model:show="showDeleteModal" preset="card" title="确认删除" style="width: 400px;" :bordered="false">
      <p style="color: #666;">确定要删除店铺「{{ deleteTarget?.name }}」吗？此操作不可恢复。</p>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showDeleteModal = false">取消</n-button>
          <n-button type="error" @click="confirmDelete">确认删除</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useRouter } from 'vue-router'
import {
  NButton, NDataTable, NTag, NSpace, NInput, NSelect, NModal,
  NForm, NFormItem, NInputNumber, NRadioGroup, NRadio,
  NIcon, NDescriptions, NDescriptionsItem, useMessage, type FormInst, type FormRules
} from 'naive-ui'
import {
  SearchOutline, AddOutline, StorefrontOutline, CheckmarkCircleOutline,
  TimeOutline, LocationOutline, CreateOutline, TrashOutline, EyeOutline
} from '@vicons/ionicons5'

const router = useRouter()
const message = useMessage()

const searchText = ref('')
const filterRegion = ref<string | null>(null)
const filterStatus = ref<string | null>(null)

const regionOptions = [
  { label: '深圳', value: '深圳' },
  { label: '广州', value: '广州' },
  { label: '北京', value: '北京' },
  { label: '上海', value: '上海' },
  { label: '成都', value: '成都' },
  { label: '杭州', value: '杭州' },
  { label: '武汉', value: '武汉' },
]

const statusOptions = [
  { label: '营业中', value: 'online' },
  { label: '已打烊', value: 'offline' },
  { label: '维护中', value: 'maintain' },
]

const columns = [
  { title: '店铺名称', key: 'name', width: 180 },
  { title: '地区', key: 'region', width: 100 },
  { title: '详细地址', key: 'address', ellipsis: { tooltip: true } },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render(row: any) {
      const typeMap: Record<string, string> = { online: 'success', offline: 'default', maintain: 'warning' }
      return h(NTag, { type: typeMap[row.status] as any, size: 'small', bordered: true }, () => row.statusText)
    }
  },
  { title: '设备数', key: 'devices', width: 80 },
  { title: '店长', key: 'manager', width: 100 },
  { title: '联系电话', key: 'phone', width: 130 },
  { title: '今日营收', key: 'todayRevenue', width: 120 },
  { title: '本月营收', key: 'monthRevenue', width: 120 },
  { title: '会员数', key: 'memberCount', width: 90 },
  { title: '创建时间', key: 'createdAt', width: 120 },
  {
    title: '操作',
    key: 'actions',
    width: 180,
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
          h(NButton, { size: 'tiny', quaternary: true, type: 'error', onClick: () => handleDelete(row) }, {
            default: () => '删除',
            icon: () => h(NIcon, { component: TrashOutline, size: 14 })
          }),
        ]
      })
    }
  },
]

const storeData = ref([
  { id: 1, name: '深圳福田旗舰店', region: '深圳', address: '深圳市福田区华强北路101号', status: 'online', statusText: '营业中', devices: 12, manager: '张三', phone: '13800138001', todayRevenue: '¥15,680', monthRevenue: '¥356,800', memberCount: 1280, createdAt: '2024-01-15' },
  { id: 2, name: '南山科技园店', region: '深圳', address: '深圳市南山区科技园南路88号', status: 'online', statusText: '营业中', devices: 8, manager: '李四', phone: '13800138002', todayRevenue: '¥9,240', monthRevenue: '¥198,500', memberCount: 856, createdAt: '2024-02-20' },
  { id: 3, name: '广州天河店', region: '广州', address: '广州市天河区天河路368号', status: 'online', statusText: '营业中', devices: 16, manager: '王五', phone: '13800138003', todayRevenue: '¥21,350', monthRevenue: '¥462,100', memberCount: 1520, createdAt: '2024-03-05' },
  { id: 4, name: '北京朝阳店', region: '北京', address: '北京市朝阳区建国路88号', status: 'offline', statusText: '已打烊', devices: 14, manager: '赵六', phone: '13800138004', todayRevenue: '¥0', monthRevenue: '¥389,200', memberCount: 1100, createdAt: '2024-03-18' },
  { id: 5, name: '上海浦东店', region: '上海', address: '上海市浦东新区陆家嘴环路1000号', status: 'online', statusText: '营业中', devices: 20, manager: '孙七', phone: '13800138005', todayRevenue: '¥26,800', monthRevenue: '¥578,900', memberCount: 1890, createdAt: '2024-04-01' },
  { id: 6, name: '成都太古里店', region: '成都', address: '成都市锦江区中纱帽街8号', status: 'online', statusText: '营业中', devices: 10, manager: '周八', phone: '13800138006', todayRevenue: '¥11,200', monthRevenue: '¥245,600', memberCount: 920, createdAt: '2024-04-15' },
  { id: 7, name: '杭州西湖店', region: '杭州', address: '杭州市西湖区南山路15号', status: 'maintain', statusText: '维护中', devices: 8, manager: '吴九', phone: '13800138007', todayRevenue: '¥0', monthRevenue: '¥168,300', memberCount: 680, createdAt: '2024-05-01' },
  { id: 8, name: '武汉光谷店', region: '武汉', address: '武汉市洪山区光谷步行街1号', status: 'online', statusText: '营业中', devices: 11, manager: '郑十', phone: '13800138008', todayRevenue: '¥13,500', monthRevenue: '¥298,700', memberCount: 1050, createdAt: '2024-05-20' },
])

const pagination = { pageSize: 10 }

const filteredData = computed(() => {
  let data = [...storeData.value]
  if (searchText.value) {
    const kw = searchText.value.toLowerCase()
    data = data.filter(d => d.name.toLowerCase().includes(kw) || d.manager.toLowerCase().includes(kw) || d.phone.includes(kw))
  }
  if (filterRegion.value) {
    data = data.filter(d => d.region === filterRegion.value)
  }
  if (filterStatus.value) {
    data = data.filter(d => d.status === filterStatus.value)
  }
  return data
})

// 新增
const showAddModal = ref(false)
const addFormRef = ref<FormInst | null>(null)
const addForm = ref({ name: '', region: '', address: '', manager: '', phone: '', deviceCount: 1, status: 'online' })
const addRules: FormRules = {
  name: { required: true, message: '请输入店铺名称', trigger: 'blur' },
  region: { required: true, message: '请选择区域', trigger: 'change' },
  manager: { required: true, message: '请输入店长姓名', trigger: 'blur' },
  phone: { required: true, message: '请输入联系电话', trigger: 'blur' },
}

function handleAdd() {
  addFormRef.value?.validate((errors) => {
    if (errors) return
    const statusMap: Record<string, string> = { online: '营业中', offline: '已打烊', maintain: '维护中' }
    storeData.value.unshift({
      id: Date.now(),
      name: addForm.value.name,
      region: addForm.value.region,
      address: addForm.value.address,
      status: addForm.value.status,
      statusText: statusMap[addForm.value.status],
      devices: addForm.value.deviceCount,
      manager: addForm.value.manager,
      phone: addForm.value.phone,
      todayRevenue: '¥0',
      monthRevenue: '¥0',
      memberCount: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    })
    message.success('店铺新增成功')
    showAddModal.value = false
    addForm.value = { name: '', region: '', address: '', manager: '', phone: '', deviceCount: 1, status: 'online' }
  })
}

// 编辑
const showEditModal = ref(false)
const currentStore = ref<any>(null)
const editForm = ref({ name: '', region: '', address: '', manager: '', phone: '', deviceCount: 1, status: 'online' })

function openEdit(row: any) {
  currentStore.value = row
  editForm.value = { ...row, deviceCount: row.devices }
  showEditModal.value = true
}

function handleEdit() {
  const statusMap: Record<string, string> = { online: '营业中', offline: '已打烊', maintain: '维护中' }
  const idx = storeData.value.findIndex(d => d.id === currentStore.value.id)
  if (idx !== -1) {
    storeData.value[idx] = {
      ...storeData.value[idx],
      ...editForm.value,
      devices: editForm.value.deviceCount,
      statusText: statusMap[editForm.value.status],
    }
    message.success('店铺信息已更新')
  }
  showEditModal.value = false
}

// 详情
const showDetailModal = ref(false)

function openDetail(row: any) {
  currentStore.value = row
  showDetailModal.value = true
}

function openEditFromDetail() {
  showDetailModal.value = false
  openEdit(currentStore.value)
}

// 删除
const showDeleteModal = ref(false)
const deleteTarget = ref<any>(null)

function handleDelete(row: any) {
  deleteTarget.value = row
  showDeleteModal.value = true
}

function confirmDelete() {
  if (deleteTarget.value) {
    storeData.value = storeData.value.filter(d => d.id !== deleteTarget.value.id)
    message.success('店铺已删除')
  }
  showDeleteModal.value = false
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
.stat-content .value.warning { color: #F59E0B; }

.content-card { background: white; border-radius: 16px; padding: 24px; border: 1px solid var(--border-color); }
</style>
