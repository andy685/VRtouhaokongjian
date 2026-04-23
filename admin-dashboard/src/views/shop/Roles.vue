<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>角色列表</h1>
      <n-button type="primary" @click="showAddModal = true">+ 添加角色</n-button>
    </div>

    <n-card class="table-card">
      <n-data-table :columns="columns" :data="roleData" :pagination="pagination" />
    </n-card>

    <!-- 添加/编辑角色弹窗 -->
    <n-modal v-model:show="showAddModal" preset="card" :title="isEdit ? '编辑角色' : '添加角色'" style="width: 480px;" :bordered="false">
      <n-form label-placement="top">
        <n-form-item label="角色名称">
          <n-input v-model:value="form.name" placeholder="如：店长" />
        </n-form-item>
        <n-form-item label="角色编码">
          <n-input v-model:value="form.code" placeholder="如：manager" />
        </n-form-item>
        <n-form-item label="权限描述">
          <n-input v-model:value="form.desc" type="textarea" :rows="2" placeholder="请输入该角色的权限描述" />
        </n-form-item>
        <n-form-item label="状态">
          <n-switch v-model:value="form.status" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showAddModal = false">取消</n-button>
          <n-button type="primary" @click="handleSubmit">保存</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import {
  NCard, NDataTable, NButton, NIcon, NModal, NForm, NFormItem,
  NInput, NSwitch, NTag, NSpace
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { PencilOutline, TrashOutline } from '@vicons/ionicons5'

interface Role {
  id: number
  name: string
  code: string
  desc: string
  userCount: number
  status: boolean
}

const showAddModal = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)
const form = ref({ name: '', code: '', desc: '', status: true })
const pagination = { pageSize: 10 }

const roleData = ref<Role[]>([
  { id: 1, name: '管理员', code: 'admin', desc: '拥有所有权限', userCount: 2, status: true },
  { id: 2, name: '收银员', code: 'cashier', desc: '收银、退款、查询订单', userCount: 5, status: true },
  { id: 3, name: '接待员', code: 'reception', desc: '会员办理、预约管理', userCount: 3, status: true },
  { id: 4, name: '设备维护', code: 'maintenance', desc: '设备巡检、故障上报', userCount: 1, status: false },
  { id: 5, name: '财务', code: 'finance', desc: '查看报表、对账', userCount: 1, status: true },
])

const columns: DataTableColumns<Role> = [
  { title: '角色名称', key: 'name', minWidth: 120 },
  { title: '编码', key: 'code', minWidth: 120 },
  { title: '权限描述', key: 'desc', minWidth: 200 },
  { title: '关联用户', key: 'userCount', width: 100, align: 'center' },
  {
    title: '状态',
    key: 'status',
    width: 100,
    align: 'center',
    render: (row) =>
      h(NTag, { type: row.status ? 'success' : 'default', size: 'small' },
        { default: () => row.status ? '启用' : '禁用' })
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    align: 'center',
    render: (row) =>
      h(NSpace, { size: 4 }, {
        default: () => [
          h(NButton, {
            size: 'small', text: true, type: 'primary',
            onClick: () => openEdit(row)
          }, { default: () => '编辑', icon: () => h(NIcon, { component: PencilOutline, size: 14 }) }),
          h(NButton, {
            size: 'small', text: true, type: 'error',
            onClick: () => handleDelete(row)
          }, { default: () => '删除', icon: () => h(NIcon, { component: TrashOutline, size: 14 }) })
        ]
      })
  }
]

function openEdit(row: Role) {
  isEdit.value = true
  editingId.value = row.id
  form.value = { name: row.name, code: row.code, desc: row.desc, status: row.status }
  showAddModal.value = true
}

function handleDelete(row: Role) {
  const idx = roleData.value.findIndex(r => r.id === row.id)
  if (idx > -1) {
    roleData.value.splice(idx, 1)
    window.$message?.success('删除成功')
  }
}

function handleSubmit() {
  if (!form.value.name.trim()) {
    window.$message?.warning('请输入角色名称')
    return
  }
  if (isEdit.value && editingId.value !== null) {
    const idx = roleData.value.findIndex(r => r.id === editingId.value)
    if (idx > -1) {
      roleData.value[idx] = { ...roleData.value[idx], ...form.value }
    }
    window.$message?.success('修改成功')
  } else {
    const newId = roleData.value.length > 0 ? Math.max(...roleData.value.map(r => r.id)) + 1 : 1
    roleData.value.push({
      id: newId,
      name: form.value.name,
      code: form.value.code,
      desc: form.value.desc,
      status: form.value.status,
      userCount: 0,
    })
    window.$message?.success('添加成功')
  }
  showAddModal.value = false
  isEdit.value = false
  editingId.value = null
  form.value = { name: '', code: '', desc: '', status: true }
}
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { font-size: 20px; font-weight: 600; color: #333; margin: 0; }
.table-card { border-radius: 12px; }
</style>
