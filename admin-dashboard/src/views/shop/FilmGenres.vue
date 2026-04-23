<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>影片题材</h1>
      <n-button type="primary" @click="openAdd">+ 添加题材</n-button>
    </div>

    <!-- 题材列表 -->
    <n-card class="table-card">
      <n-data-table :columns="columns" :data="tableData" :pagination="pagination" />
    </n-card>

    <!-- 添加/编辑题材弹窗 -->
    <n-modal v-model:show="showModal" preset="card" :title="isEdit ? '编辑影片题材' : '添加影片题材'" style="width: 480px;" :bordered="false">
      <n-form :model="formData" label-placement="top">
        <n-form-item label="题材名称">
          <n-input v-model:value="formData.name" placeholder="如：科幻冒险" />
        </n-form-item>
        <n-form-item label="题材编码">
          <n-input v-model:value="formData.code" placeholder="如：scifi" />
        </n-form-item>
        <n-form-item label="题材图标">
          <n-input v-model:value="formData.icon" placeholder="图标名称或URL" />
        </n-form-item>
        <n-form-item label="排序">
          <n-input-number v-model:value="formData.sort" :min="0" style="width: 100%;" />
        </n-form-item>
        <n-form-item label="状态">
          <n-switch v-model:value="formData.status" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" @click="handleSubmit">{{ isEdit ? '保存' : '确定添加' }}</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 删除确认弹窗 -->
    <n-modal v-model:show="showDeleteModal" preset="card" title="提示" style="width: 420px;" :bordered="false" :closable="false">
      <div style="display: flex; align-items: center; gap: 12px; padding: 8px 0;">
        <div style="width: 28px; height: 28px; border-radius: 50%; background: #FBBF24; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <span style="color: #fff; font-size: 16px; font-weight: bold;">!</span>
        </div>
        <span style="font-size: 15px; color: #333;">确定删除当前题材，是否继续？</span>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showDeleteModal = false">取消</n-button>
          <n-button type="primary" @click="confirmDelete">确定</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import {
  NCard, NDataTable, NButton, NIcon, NModal, NForm, NFormItem,
  NInput, NInputNumber, NSwitch, NTag, NSpace
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { PencilOutline, TrashOutline } from '@vicons/ionicons5'

interface Genre {
  id: number
  sort: number
  name: string
  code: string
  icon: string
  count: number
  plays: number
  status: boolean
}

const showModal = ref(false)
const showDeleteModal = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)
const deleteTarget = ref<Genre | null>(null)

const formData = ref({
  name: '',
  code: '',
  icon: '',
  sort: 0,
  status: true
})

const pagination = { pageSize: 10 }

const tableData = ref<Genre[]>([
  { id: 1, sort: 1, name: '科幻冒险', code: 'scifi', icon: '', count: 28, plays: 5860, status: true },
  { id: 2, sort: 2, name: '极限运动', code: 'extreme', icon: '', count: 18, plays: 4280, status: true },
  { id: 3, sort: 3, name: '海洋探索', code: 'ocean', icon: '', count: 15, plays: 3560, status: true },
  { id: 4, sort: 4, name: '亲子娱乐', code: 'family', icon: '', count: 22, plays: 5120, status: true },
  { id: 5, sort: 5, name: '恐怖惊悚', code: 'horror', icon: '', count: 12, plays: 2860, status: false },
  { id: 6, sort: 6, name: '音乐节奏', code: 'rhythm', icon: '', count: 8, plays: 1580, status: true },
])

const columns: DataTableColumns<Genre> = [
  { title: '排序', key: 'sort', width: 80 },
  { title: '题材名称', key: 'name', width: 150 },
  { title: '编码', key: 'code', width: 120 },
  { title: '影片数量', key: 'count', width: 120 },
  { title: '播放量', key: 'plays', width: 120 },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) =>
      h(NTag, { type: row.status ? 'success' : 'default', size: 'small' },
        { default: () => row.status ? '启用' : '禁用' })
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render: (row) =>
      h(NSpace, { size: 4 }, {
        default: () => [
          h(NButton, {
            size: 'small',
            text: true,
            type: 'primary',
            onClick: () => openEdit(row)
          }, { default: () => '编辑', icon: () => h(NIcon, { component: PencilOutline, size: 14 }) }),
          h(NButton, {
            size: 'small',
            text: true,
            type: 'error',
            onClick: () => handleDelete(row)
          }, { default: () => '删除', icon: () => h(NIcon, { component: TrashOutline, size: 14 }) })
        ]
      })
  }
]

function openAdd() {
  isEdit.value = false
  editingId.value = null
  formData.value = { name: '', code: '', icon: '', sort: tableData.value.length + 1, status: true }
  showModal.value = true
}

function openEdit(row: Genre) {
  isEdit.value = true
  editingId.value = row.id
  formData.value = {
    name: row.name,
    code: row.code,
    icon: row.icon,
    sort: row.sort,
    status: row.status
  }
  showModal.value = true
}

function handleSubmit() {
  if (!formData.value.name.trim()) {
    window.$message?.warning('请输入题材名称')
    return
  }
  if (!formData.value.code.trim()) {
    window.$message?.warning('请输入题材编码')
    return
  }

  if (isEdit.value && editingId.value !== null) {
    const idx = tableData.value.findIndex(item => item.id === editingId.value)
    if (idx !== -1) {
      tableData.value[idx] = {
        ...tableData.value[idx],
        name: formData.value.name,
        code: formData.value.code,
        icon: formData.value.icon,
        sort: formData.value.sort,
        status: formData.value.status
      }
    }
    window.$message?.success('修改成功')
  } else {
    const newId = tableData.value.length > 0 ? Math.max(...tableData.value.map(d => d.id)) + 1 : 1
    tableData.value.push({
      id: newId,
      sort: formData.value.sort,
      name: formData.value.name,
      code: formData.value.code,
      icon: formData.value.icon,
      count: 0,
      plays: 0,
      status: formData.value.status
    })
    window.$message?.success('添加成功')
  }
  showModal.value = false
}

function handleDelete(row: Genre) {
  deleteTarget.value = row
  showDeleteModal.value = true
}

function confirmDelete() {
  if (deleteTarget.value) {
    const idx = tableData.value.findIndex(item => item.id === deleteTarget.value!.id)
    if (idx !== -1) {
      tableData.value.splice(idx, 1)
    }
    window.$message?.success('删除成功')
  }
  showDeleteModal.value = false
  deleteTarget.value = null
}
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { font-size: 20px; font-weight: 600; color: #333; margin: 0; }
.table-card { border-radius: 12px; }
</style>
