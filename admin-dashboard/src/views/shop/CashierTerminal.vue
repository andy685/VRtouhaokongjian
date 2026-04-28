<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>收银终端</h1>
      <n-space align="center">
        <span style="color: #666; font-size: 14px;">请选择店铺：</span>
        <n-select v-model:value="selectedShop" :options="shopOptions" size="small" style="width: 180px;" clearable placeholder="请选择" />
        <n-button type="primary" @click="openAdd">
          <template #icon><n-icon :component="AddOutline" /></template>
          增加
        </n-button>
      </n-space>
    </div>

    <n-card class="table-card">
      <n-data-table
        :columns="columns"
        :data="filteredData"
        :pagination="pagination"
        :bordered="true"
        :single-line="false"
        size="small"
      />
    </n-card>

    <!-- 增加收银终端弹窗 -->
    <n-modal v-model:show="showAddModal" preset="card" title="增加新的收银token" style="width: 480px;" :bordered="false">
      <n-form label-placement="top">
        <n-form-item label="店铺选择">
          <n-select v-model:value="form.shop" :options="shopOptions.filter(s => s.value)" placeholder="请选择店铺" />
        </n-form-item>
        <n-form-item label="收银终端名称">
          <n-input v-model:value="form.name" placeholder="请输入终端名称" />
        </n-form-item>
        <n-form-item label="Token">
          <n-input v-model:value="form.token" placeholder="自动生成或手动输入" />
        </n-form-item>
        <n-form-item label="状态">
          <n-switch v-model:value="form.status" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showAddModal = false">取消</n-button>
          <n-button type="primary" @click="handleAdd">确定</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 编辑弹窗 -->
    <n-modal v-model:show="showEditModal" preset="card" title="编辑收银终端" style="width: 480px;" :bordered="false">
      <n-form label-placement="top">
        <n-form-item label="店铺">
          <n-select v-model:value="editForm.shop" :options="shopOptions.filter(s => s.value)" placeholder="请选择店铺" />
        </n-form-item>
        <n-form-item label="收银终端名称">
          <n-input v-model:value="editForm.name" placeholder="请输入终端名称" />
        </n-form-item>
        <n-form-item label="Token">
          <n-input v-model:value="editForm.token" disabled />
        </n-form-item>
        <n-form-item label="状态">
          <n-switch v-model:value="editForm.status" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showEditModal = false">取消</n-button>
          <n-button type="primary" @click="handleEdit">保存</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NCard, NDataTable, NButton, NIcon, NModal, NForm, NFormItem,
  NInput, NSelect, NSwitch, NTag, NSpace
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { AddOutline, CreateOutline } from '@vicons/ionicons5'

interface Terminal {
  id: number
  shop: string
  name: string
  token: string
  status: boolean
  createTime: string
}

const selectedShop = ref<string | null>(null)
const showAddModal = ref(false)
const showEditModal = ref(false)
const editingId = ref<number | null>(null)

const form = ref({ name: '', shop: '', token: '', status: true })
const editForm = ref({ name: '', shop: '', token: '', status: true })

const shopOptions = [
  { label: '全部', value: '' },
  { label: '卓远天河路店（测试）', value: '卓远天河路店（测试）' },
  { label: '卓远文桥路店（测试）', value: '卓远文桥路店（测试）' },
  { label: '卓远亚运城店（测试）', value: '卓远亚运城店（测试）' },
]

const terminalData = ref<Terminal[]>([
  { id: 1, shop: '卓远天河路店（测试）', name: '家用电脑', token: '049F3FE3A9CF218C5E1B8D4A7F3E2901', status: true, createTime: '2024-09-03 19:07:05' },
  { id: 2, shop: '卓远天河路店（测试）', name: '幻影', token: 'B3C7A8D2E1F405693B8C7A2D1E4F5067', status: true, createTime: '2024-07-31 16:53:36' },
  { id: 3, shop: '卓远天河路店（测试）', name: 'ly', token: 'B05D1A3C8E7F204B9A6D3C1E8F7B204A', status: true, createTime: '2024-07-31 01:42:32' },
  { id: 4, shop: '卓远天河路店（测试）', name: '外购2', token: '74E1A2B3C4D5E6F7A8B9C0D1E2F3A4B5', status: true, createTime: '2024-07-27 14:38:36' },
  { id: 5, shop: '卓远天河路店（测试）', name: '外购1', token: '4097B2C3D4E5F6A7B8C9D0E1F2A3B4C5', status: true, createTime: '2024-07-27 14:38:25' },
  { id: 6, shop: '卓远文桥路店（测试）', name: '333', token: 'D2B9A1C3E5F7A8B9C0D1E2F3A4B5C6D7', status: true, createTime: '2024-05-16 13:57:14' },
  { id: 7, shop: '卓远亚运城店（测试）', name: '222', token: '641A2B3C4D5E6F7A8B9C0D1E2F3A4B5C', status: true, createTime: '2024-04-14 15:09:05' },
  { id: 8, shop: '卓远天河路店（测试）', name: '张秋裕', token: '19A3B4C5D6E7F8A9B0C1D2E3F4A5B6C7', status: true, createTime: '2024-03-04 10:32:15' },
  { id: 9, shop: '卓远文桥路店（测试）', name: '系统自动生成', token: '7EC1A2B3C4D5E6F7A8B9C0D1E2F3A4B5', status: true, createTime: '2024-01-24 00:06:45' },
  { id: 10, shop: '卓远天河路店（测试）', name: '系统自动生成', token: '52A1B2C3D4E5F6A7B8C9D0E1F2A3B4C5', status: true, createTime: '2024-01-24 00:04:14' },
])

const filteredData = computed(() => {
  if (!selectedShop.value) return terminalData.value
  return terminalData.value.filter(d => d.shop === selectedShop.value)
})

const pagination = { pageSize: 10 }

const columns: DataTableColumns<Terminal> = [
  { title: '店铺', key: 'shop', minWidth: 180 },
  { title: '收银终端名称', key: 'name', minWidth: 140 },
  {
    title: 'Token',
    key: 'token',
    minWidth: 280,
    render(row) {
      return h('span', {
        style: 'font-family: monospace; font-size: 13px; color: #333; background: #f5f5f5; padding: 2px 8px; border-radius: 4px;'
      }, row.token)
    }
  },
  {
    title: '状态',
    key: 'status',
    width: 80,
    align: 'center',
    render(row) {
      return h(NTag, {
        size: 'small',
        type: row.status ? 'success' : 'default',
        bordered: true
      }, () => row.status ? '启用' : '禁用')
    }
  },
  { title: '创建时间', key: 'createTime', minWidth: 160 },
  {
    title: '操作',
    key: 'actions',
    width: 80,
    align: 'center',
    fixed: 'right',
    render(row) {
      return h(NButton, {
        size: 'tiny',
        text: true,
        type: 'primary',
        onClick: () => openEdit(row)
      }, { default: () => '编辑', icon: () => h(NIcon, { component: CreateOutline, size: 14 }) })
    }
  }
]

function openAdd() {
  form.value = { name: '', shop: selectedShop.value || '', token: generateToken(), status: true }
  showAddModal.value = true
}

function openEdit(row: Terminal) {
  editingId.value = row.id
  editForm.value = { name: row.name, shop: row.shop, token: row.token, status: row.status }
  showEditModal.value = true
}

function handleAdd() {
  if (!form.value.name.trim()) {
    window.$message?.warning('请输入终端名称')
    return
  }
  const newId = terminalData.value.length > 0 ? Math.max(...terminalData.value.map(d => d.id)) + 1 : 1
  terminalData.value.unshift({
    id: newId,
    shop: form.value.shop || '卓远天河路店（测试）',
    name: form.value.name,
    token: form.value.token || generateToken(),
    status: form.value.status,
    createTime: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\//g, '-')
  })
  window.$message?.success('添加成功')
  showAddModal.value = false
}

function handleEdit() {
  if (editingId.value !== null) {
    const idx = terminalData.value.findIndex(d => d.id === editingId.value)
    if (idx !== -1) {
      terminalData.value[idx] = {
        ...terminalData.value[idx],
        name: editForm.value.name,
        shop: editForm.value.shop,
        status: editForm.value.status
      }
    }
    window.$message?.success('修改成功')
  }
  showEditModal.value = false
}

function generateToken() {
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16).toUpperCase()).join('')
}
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.page-header h1 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}
.table-card { border-radius: 12px; }
</style>
