<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>平台账号</h1>
        <p class="header-desc">管理后台运营人员账号及权限</p>
      </div>
      <n-space>
        <n-input v-model:value="searchText" placeholder="搜索账号/姓名..." size="small" style="width: 200px;">
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
        <n-select v-model:value="filterRole" placeholder="全部角色" :options="roleOptions" size="small" style="width: 130px;" clearable />
        <n-button type="primary" @click="showAddModal = true">
          <template #icon><n-icon :component="AddOutline" /></template> 新增账号
        </n-button>
      </n-space>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="PeopleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">账号总数</span>
          <span class="value">56</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="CheckmarkCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">正常启用</span>
          <span class="value">52</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #EF4444, #DC2626);">
          <n-icon :component="CloseCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">已禁用</span>
          <span class="value error">4</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
          <n-icon :component="ShieldOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">角色类型</span>
          <span class="value">6</span>
        </div>
      </div>
    </div>

    <div class="content-card">
      <n-data-table :columns="columns" :data="filteredData" :pagination="pagination" striped />
    </div>

    <!-- 新增/编辑账号弹窗 -->
    <n-modal v-model:show="showAddModal" preset="card" :title="isEdit ? '编辑账号' : '新增账号'" style="width: 480px;" :bordered="false">
      <n-form label-placement="left" label-width="90">
        <n-form-item label="账号名" required>
          <n-input v-model:value="form.name" placeholder="请输入账号名" />
        </n-form-item>
        <n-form-item label="真实姓名">
          <n-input v-model:value="form.realName" placeholder="请输入真实姓名" />
        </n-form-item>
        <n-form-item label="手机号" required>
          <n-input v-model:value="form.phone" placeholder="请输入手机号" />
        </n-form-item>
        <n-form-item label="邮箱">
          <n-input v-model:value="form.email" placeholder="请输入邮箱" />
        </n-form-item>
        <n-form-item label="角色" required>
          <n-select v-model:value="form.role" :options="roleOptions" placeholder="请选择角色" />
        </n-form-item>
        <n-form-item label="状态">
          <n-radio-group v-model:value="form.status">
            <n-radio value="active">启用</n-radio>
            <n-radio value="disabled">禁用</n-radio>
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
    <n-modal v-model:show="showDetailModal" preset="card" title="账号详情" style="width: 560px;" :bordered="false">
      <n-descriptions v-if="currentUser" label-placement="left" :column="2" bordered>
        <n-descriptions-item label="账号名">{{ currentUser.name }}</n-descriptions-item>
        <n-descriptions-item label="真实姓名">{{ currentUser.realName || '--' }}</n-descriptions-item>
        <n-descriptions-item label="手机号">{{ currentUser.phone }}</n-descriptions-item>
        <n-descriptions-item label="邮箱">{{ currentUser.email || '--' }}</n-descriptions-item>
        <n-descriptions-item label="角色">
          <n-tag :type="currentUser.roleType" size="small">{{ currentUser.role }}</n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="状态">
          <n-tag :type="currentUser.status === 'active' ? 'success' : 'default'" size="small">
            {{ currentUser.status === 'active' ? '启用' : '禁用' }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="最后登录">{{ currentUser.lastLogin }}</n-descriptions-item>
        <n-descriptions-item label="创建时间">{{ currentUser.createdAt }}</n-descriptions-item>
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
  NSelect, NRadioGroup, NRadio, NIcon, NDescriptions, NDescriptionsItem, useMessage
} from 'naive-ui'
import {
  SearchOutline, AddOutline, PeopleOutline, CheckmarkCircleOutline,
  CloseCircleOutline, ShieldOutline, EyeOutline, CreateOutline
} from '@vicons/ionicons5'

const message = useMessage()
const searchText = ref('')
const filterRole = ref<string | null>(null)

const roleOptions = [
  { label: '超级管理员', value: '超级管理员' },
  { label: '平台运营', value: '平台运营' },
  { label: '平台财务', value: '平台财务' },
  { label: '内容审核', value: '内容审核' },
  { label: '客服', value: '客服' },
]

const columns = [
  { title: '账号', key: 'name', width: 120 },
  { title: '真实姓名', key: 'realName', width: 100 },
  { title: '角色', key: 'role', width: 120, render: (row: any) => h(NTag, { type: row.roleType, size: 'small', bordered: true }, () => row.role) },
  { title: '手机号', key: 'phone', width: 130 },
  { title: '邮箱', key: 'email', width: 180 },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render(row: any) {
      return h(NTag, { type: row.status === 'active' ? 'success' : 'default', size: 'small', bordered: true }, () => row.status === 'active' ? '启用' : '禁用')
    }
  },
  { title: '最后登录', key: 'lastLogin', width: 160 },
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
          h(NButton, { size: 'tiny', quaternary: true, type: row.status === 'active' ? 'warning' : 'success', onClick: () => toggleStatus(row) }, () => row.status === 'active' ? '禁用' : '启用'),
        ]
      })
    }
  },
]

const userData = ref([
  { id: 1, name: 'admin', realName: '张三', role: '超级管理员', roleType: 'error', phone: '138****1234', email: 'admin@vrtouhao.com', status: 'active', lastLogin: '2026-04-20 15:35:22', createdAt: '2023-01-01' },
  { id: 2, name: 'op01', realName: '李四', role: '平台运营', roleType: 'warning', phone: '139****5678', email: 'op01@vrtouhao.com', status: 'active', lastLogin: '2026-04-20 14:20:08', createdAt: '2023-03-15' },
  { id: 3, name: 'finance01', realName: '王五', role: '平台财务', roleType: 'info', phone: '137****9012', email: 'finance01@vrtouhao.com', status: 'active', lastLogin: '2026-04-19 16:50:33', createdAt: '2023-05-20' },
  { id: 4, name: 'review01', realName: '赵六', role: '内容审核', roleType: 'success', phone: '136****3456', email: 'review01@vrtouhao.com', status: 'active', lastLogin: '2026-04-18 11:25:00', createdAt: '2023-06-10' },
  { id: 5, name: 'cs01', realName: '孙七', role: '客服', roleType: 'default', phone: '135****7890', email: 'cs01@vrtouhao.com', status: 'disabled', lastLogin: '2026-04-10 09:15:00', createdAt: '2023-08-01' },
])

const pagination = { pageSize: 10 }

const filteredData = computed(() => {
  let data = [...userData.value]
  if (searchText.value) {
    const kw = searchText.value.toLowerCase()
    data = data.filter(d => d.name.toLowerCase().includes(kw) || (d.realName && d.realName.includes(kw)))
  }
  if (filterRole.value) {
    data = data.filter(d => d.role === filterRole.value)
  }
  return data
})

// 新增/编辑
const showAddModal = ref(false)
const isEdit = ref(false)
const currentUser = ref<any>(null)
const form = ref({ name: '', realName: '', phone: '', email: '', role: '', status: 'active' })

function openEdit(row: any) {
  isEdit.value = true
  currentUser.value = row
  form.value = { name: row.name, realName: row.realName || '', phone: row.phone, email: row.email || '', role: row.role, status: row.status }
  showAddModal.value = true
}

function handleSave() {
  if (isEdit.value && currentUser.value) {
    const idx = userData.value.findIndex(d => d.id === currentUser.value.id)
    if (idx !== -1) {
      userData.value[idx] = { ...userData.value[idx], ...form.value }
      message.success('账号信息已更新')
    }
  } else {
    const roleTypeMap: Record<string, string> = { '超级管理员': 'error', '平台运营': 'warning', '平台财务': 'info', '内容审核': 'success', '客服': 'default' }
    userData.value.unshift({
      id: Date.now(),
      ...form.value,
      roleType: roleTypeMap[form.value.role] || 'default',
      lastLogin: '--',
      createdAt: new Date().toISOString().slice(0, 10),
    })
    message.success('账号新增成功')
  }
  showAddModal.value = false
  form.value = { name: '', realName: '', phone: '', email: '', role: '', status: 'active' }
  isEdit.value = false
}

function toggleStatus(row: any) {
  row.status = row.status === 'active' ? 'disabled' : 'active'
  message.success(row.status === 'active' ? '账号已启用' : '账号已禁用')
}

// 详情
const showDetailModal = ref(false)

function openDetail(row: any) {
  currentUser.value = row
  showDetailModal.value = true
}

function openEditFromDetail() {
  showDetailModal.value = false
  openEdit(currentUser.value)
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
.stat-content .value.error { color: #EF4444; }

.content-card { background: white; border-radius: 16px; padding: 24px; border: 1px solid var(--border-color); }
</style>
