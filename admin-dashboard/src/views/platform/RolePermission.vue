<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>角色权限</h1>
        <p class="header-desc">配置平台角色及其对应的操作权限</p>
      </div>
      <n-button type="primary" @click="showAddModal = true">
        <template #icon><n-icon :component="AddOutline" /></template> 新增角色
      </n-button>
    </div>

    <div class="content-card">
      <n-data-table :columns="columns" :data="roleData" :pagination="pagination" striped />
    </div>

    <!-- 新增/编辑角色弹窗 -->
    <n-modal v-model:show="showAddModal" preset="card" :title="isEdit ? '编辑角色' : '新增角色'" style="width: 640px;" :bordered="false">
      <n-form label-placement="left" label-width="90">
        <n-form-item label="角色名称" required>
          <n-input v-model:value="form.name" placeholder="请输入角色名称" />
        </n-form-item>
        <n-form-item label="角色描述">
          <n-input v-model:value="form.description" placeholder="请输入角色描述" />
        </n-form-item>
        <n-form-item label="权限配置">
          <n-tree
            :data="permissionTree"
            checkable
            selectable
            :default-checked-keys="form.permissions"
            @update:checked-keys="handleCheck"
          />
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
    <n-modal v-model:show="showDetailModal" preset="card" title="角色详情" style="width: 560px;" :bordered="false">
      <n-descriptions v-if="currentRole" label-placement="left" :column="1" bordered>
        <n-descriptions-item label="角色名称">{{ currentRole.name }}</n-descriptions-item>
        <n-descriptions-item label="角色描述">{{ currentRole.description }}</n-descriptions-item>
        <n-descriptions-item label="账号数">{{ currentRole.count }} 人</n-descriptions-item>
        <n-descriptions-item label="权限范围">
          <n-space>
            <n-tag v-for="perm in currentRole.permissionList" :key="perm" size="small">{{ perm }}</n-tag>
          </n-space>
        </n-descriptions-item>
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
import { ref, h } from 'vue'
import {
  NButton, NDataTable, NTag, NSpace, NModal, NForm, NFormItem,
  NInput, NTree, NIcon, NDescriptions, NDescriptionsItem, useMessage
} from 'naive-ui'
import {
  AddOutline, EyeOutline, CreateOutline, TrashOutline
} from '@vicons/ionicons5'

const message = useMessage()

const columns = [
  { title: '角色名称', key: 'name', width: 140 },
  { title: '角色描述', key: 'description', ellipsis: { tooltip: true } },
  { title: '账号数', key: 'count', width: 90 },
  {
    title: '权限范围',
    key: 'permissions',
    render(row: any) {
      return h(NSpace, { size: 'small' }, {
        default: () => row.permissionList.slice(0, 3).map((perm: string) => h(NTag, { size: 'tiny', bordered: true }, () => perm))
      })
    }
  },
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

const roleData = ref([
  { id: 1, name: '超级管理员', description: '拥有系统所有权限，可进行任何操作', count: 2, permissions: ['all'], permissionList: ['全部权限'] },
  { id: 2, name: '平台运营', description: '负责日常运营管理，包括店铺、内容、营销活动', count: 5, permissions: ['dashboard', 'stores', 'content', 'marketing'], permissionList: ['数据中心', '店铺管理', '内容中心', '营销工具'] },
  { id: 3, name: '平台财务', description: '财务结算与对账，查看财务相关数据', count: 3, permissions: ['finance', 'reports'], permissionList: ['平台财务', '数据报表'] },
  { id: 4, name: '内容审核', description: '游戏内容审核管理，分发配置', count: 4, permissions: ['content', 'review'], permissionList: ['内容中心', '审核管理'] },
  { id: 5, name: '客服', description: '处理工单、用户反馈，查看基础数据', count: 8, permissions: ['support', 'reports'], permissionList: ['运维支持', '数据报表'] },
])

const pagination = { pageSize: 10 }

const permissionTree = [
  {
    label: '数据中心',
    key: 'dashboard',
    children: [
      { label: '大屏看板', key: 'dashboard_view' },
      { label: '数据报表', key: 'reports_view' },
    ]
  },
  {
    label: '店铺管理',
    key: 'stores',
    children: [
      { label: '店铺列表', key: 'stores_list' },
      { label: '店铺审核', key: 'stores_audit' },
      { label: '代理商', key: 'agents' },
    ]
  },
  {
    label: '内容中心',
    key: 'content',
    children: [
      { label: '游戏库', key: 'games' },
      { label: '内容分发', key: 'distribute' },
      { label: '审核管理', key: 'review' },
    ]
  },
  {
    label: '用户体系',
    key: 'users',
    children: [
      { label: '平台账号', key: 'user_list' },
      { label: '角色权限', key: 'roles' },
    ]
  },
  {
    label: '营销工具',
    key: 'marketing',
    children: [
      { label: '优惠券', key: 'coupons' },
      { label: '活动配置', key: 'activities' },
    ]
  },
  {
    label: '平台财务',
    key: 'finance',
    children: [
      { label: '财务总览', key: 'finance_overview' },
      { label: '结算管理', key: 'settlement' },
      { label: '异常订单', key: 'exception_orders' },
    ]
  },
  {
    label: '系统运维',
    key: 'system',
    children: [
      { label: '版本发布', key: 'versions' },
      { label: '告警中心', key: 'alerts' },
      { label: '操作日志', key: 'logs' },
    ]
  },
  {
    label: '运维支持',
    key: 'support',
    children: [
      { label: '工单系统', key: 'tickets' },
      { label: '帮助中心', key: 'help' },
    ]
  },
]

// 新增/编辑
const showAddModal = ref(false)
const isEdit = ref(false)
const currentRole = ref<any>(null)
const form = ref({ name: '', description: '', permissions: [] as string[] })

function handleCheck(keys: string[]) {
  form.value.permissions = keys
}

function openEdit(row: any) {
  isEdit.value = true
  currentRole.value = row
  form.value = { name: row.name, description: row.description, permissions: [...row.permissions] }
  showAddModal.value = true
}

function handleSave() {
  if (isEdit.value && currentRole.value) {
    const idx = roleData.value.findIndex(d => d.id === currentRole.value.id)
    if (idx !== -1) {
      roleData.value[idx] = { ...roleData.value[idx], ...form.value, permissionList: form.value.permissions.map(p => p) }
      message.success('角色权限已更新')
    }
  } else {
    roleData.value.push({
      id: Date.now(),
      name: form.value.name,
      description: form.value.description,
      count: 0,
      permissions: form.value.permissions,
      permissionList: form.value.permissions,
    })
    message.success('角色新增成功')
  }
  showAddModal.value = false
  form.value = { name: '', description: '', permissions: [] }
  isEdit.value = false
}

// 详情
const showDetailModal = ref(false)

function openDetail(row: any) {
  currentRole.value = row
  showDetailModal.value = true
}

function openEditFromDetail() {
  showDetailModal.value = false
  openEdit(currentRole.value)
}
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.header-desc { font-size: 13px; color: var(--text-muted); margin-top: 4px; display: block; }

.content-card { background: white; border-radius: 16px; padding: 24px; border: 1px solid var(--border-color); }
</style>
