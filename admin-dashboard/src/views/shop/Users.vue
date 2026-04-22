<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>用户管理</h1>
      <n-button type="primary" @click="showAddModal = true">+ 添加用户</n-button>
    </div>

    <n-card>
      <n-tabs type="line" v-model:value="activeTab">
        <n-tab-pane name="all" tab="全部用户">
          <n-data-table
            :columns="columns"
            :data="allUsers"
            :pagination="pagination"
            :bordered="false"
          />
        </n-tab-pane>
        <n-tab-pane name="admin" tab="管理员">
          <n-data-table
            :columns="columns"
            :data="adminUsers"
            :pagination="pagination"
            :bordered="false"
          />
        </n-tab-pane>
        <n-tab-pane name="cashier" tab="收银员">
          <n-data-table
            :columns="columns"
            :data="cashierUsers"
            :pagination="pagination"
            :bordered="false"
          />
        </n-tab-pane>
      </n-tabs>
    </n-card>

    <!-- 添加/编辑用户弹窗 -->
    <n-modal v-model:show="showAddModal" preset="card" :title="editingUser ? '编辑用户' : '添加用户'" style="width: 500px;">
      <n-form :model="formData" label-placement="left" label-width="100">
        <n-form-item label="用户名">
          <n-input v-model:value="formData.username" placeholder="请输入用户名" />
        </n-form-item>
        <n-form-item label="真实姓名">
          <n-input v-model:value="formData.name" placeholder="请输入真实姓名" />
        </n-form-item>
        <n-form-item label="手机号">
          <n-input v-model:value="formData.phone" placeholder="请输入手机号" />
        </n-form-item>
        <n-form-item label="角色">
          <n-select v-model:value="formData.role" :options="roleOptions" placeholder="请选择角色" />
        </n-form-item>
        <n-form-item label="状态">
          <n-switch v-model:value="formData.status">
            <template #checked>启用</template>
            <template #unchecked>禁用</template>
          </n-switch>
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showAddModal = false">取消</n-button>
          <n-button type="primary" @click="saveUser">保存</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NCard, NButton, NDataTable, NTabs, NTabPane,
  NModal, NForm, NFormItem, NInput, NSelect, NSwitch, NSpace,
  NTag, NIcon, useMessage
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { CreateOutline, TrashOutline } from '@vicons/ionicons5'

const message = useMessage()
const activeTab = ref('all')
const showAddModal = ref(false)
const editingUser = ref<any>(null)

const roleOptions = [
  { label: '管理员', value: 'admin' },
  { label: '收银员', value: 'cashier' },
  { label: '接待员', value: 'reception' },
  { label: '设备维护', value: 'maintenance' },
]

const columns: DataTableColumns = [
  { title: '用户名', key: 'username', width: 120 },
  { title: '真实姓名', key: 'name', width: 100 },
  { title: '手机号', key: 'phone', width: 130 },
  { title: '角色', key: 'role', width: 100,
    render: (row) => {
      const roleMap: Record<string, string> = {
        admin: '管理员',
        cashier: '收银员',
        reception: '接待员',
        maintenance: '设备维护',
      }
      return roleMap[row.role] || row.role
    }
  },
  { title: '状态', key: 'status', width: 80,
    render: (row) => h(NTag, { type: row.status ? 'success' : 'default', size: 'small' }, 
      { default: () => row.status ? '启用' : '禁用' })
  },
  { title: '最后登录', key: 'lastLogin', width: 160 },
  { title: '操作', key: 'actions', width: 120,
    render: (row) => h(NSpace, { size: 8 }, {
      default: () => [
        h(NButton, { size: 'tiny', quaternary: true, onClick: () => editUser(row) }, 
          { icon: () => h(NIcon, null, { default: () => h(CreateOutline) }), default: () => '编辑' }),
        h(NButton, { size: 'tiny', quaternary: true, type: 'error', onClick: () => deleteUser(row) }, 
          { icon: () => h(NIcon, null, { default: () => h(TrashOutline) }) }),
      ]
    })
  },
]

const pagination = { pageSize: 10 }

const allUsers = ref([
  { username: 'admin', name: '王小丫', phone: '13808888888', role: 'admin', status: true, lastLogin: '2026-04-20 22:00' },
  { username: 'cashier01', name: '张丽', phone: '13906666666', role: 'cashier', status: true, lastLogin: '2026-04-20 21:30' },
  { username: 'cashier02', name: '李娜', phone: '13705555555', role: 'cashier', status: true, lastLogin: '2026-04-20 20:15' },
  { username: 'reception01', name: '王芳', phone: '13604444444', role: 'reception', status: true, lastLogin: '2026-04-20 18:45' },
  { username: 'maintenance01', name: '赵强', phone: '13503333333', role: 'maintenance', status: false, lastLogin: '2026-04-19 10:00' },
])

const adminUsers = computed(() => allUsers.value.filter(u => u.role === 'admin'))
const cashierUsers = computed(() => allUsers.value.filter(u => u.role === 'cashier'))

const formData = ref({
  username: '',
  name: '',
  phone: '',
  role: 'cashier',
  status: true,
})

function editUser(user: any) {
  editingUser.value = user
  formData.value = { ...user }
  showAddModal.value = true
}

function deleteUser(user: any) {
  const idx = allUsers.value.findIndex(u => u.username === user.username)
  if (idx > -1) allUsers.value.splice(idx, 1)
  message.success('用户已删除')
}

function saveUser() {
  if (editingUser.value) {
    Object.assign(editingUser.value, formData.value)
    message.success('用户已更新')
  } else {
    allUsers.value.unshift({
      ...formData.value,
      lastLogin: '-',
    })
    message.success('用户已添加')
  }
  showAddModal.value = false
  editingUser.value = null
}
</script>

<style scoped>
.page-container { max-width: 1200px; }

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}
</style>
