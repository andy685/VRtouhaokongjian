<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>影片题材</h1>
      <n-button type="primary" @click="showAddModal = true">+ 添加题材</n-button>
    </div>

    <!-- 题材列表 -->
    <n-card class="table-card">
      <n-data-table :columns="columns" :data="tableData" :pagination="pagination" />
    </n-card>

    <!-- 添加题材弹窗 -->
    <n-modal v-model:show="showAddModal" preset="card" title="添加影片题材" style="width: 480px;">
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
          <n-button @click="showAddModal = false">取消</n-button>
          <n-button type="primary" @click="handleSubmit">确定添加</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import {
  NCard, NDataTable, NButton, NIcon, NModal, NForm, NFormItem,
  NInput, NInputNumber, NSwitch, NTag
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { RocketOutline, GameControllerOutline, HeartOutline, StarOutline } from '@vicons/ionicons5'

const showAddModal = ref(false)
const formData = ref({ name: '', code: '', icon: '', sort: 0, status: true })
const pagination = { pageSize: 10 }

const columns: DataTableColumns = [
  { title: '排序', key: 'sort', width: 80 },
  { title: '题材名称', key: 'name', width: 150 },
  { title: '编码', key: 'code', width: 120 },
  { title: '影片数量', key: 'count', width: 120 },
  { title: '播放量', key: 'plays', width: 120 },
  { title: '状态', key: 'status', width: 100, render: (row) =>
    h(NTag, { type: row.status ? 'success' : 'default', size: 'small' },
      { default: () => row.status ? '启用' : '禁用' })
  },
  { title: '操作', key: 'actions', width: 150, render: () =>
    h('div', {},
      h(NButton, { size: 'small', text: true, type: 'primary' }, { default: () => '编辑' }),
      h(NButton, { size: 'small', text: true, style: { marginLeft: '8px' } }, { default: () => '删除' }))
  }
]

const tableData = ref([
  { id: 1, sort: 1, name: '科幻冒险', code: 'scifi', count: 28, plays: 5860, status: true },
  { id: 2, sort: 2, name: '极限运动', code: 'extreme', count: 18, plays: 4280, status: true },
  { id: 3, sort: 3, name: '海洋探索', code: 'ocean', count: 15, plays: 3560, status: true },
  { id: 4, sort: 4, name: '亲子娱乐', code: 'family', count: 22, plays: 5120, status: true },
  { id: 5, sort: 5, name: '恐怖惊悚', code: 'horror', count: 12, plays: 2860, status: false },
  { id: 6, sort: 6, name: '音乐节奏', code: 'rhythm', count: 8, plays: 1580, status: true },
])

function handleSubmit() {
  showAddModal.value = false
}
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { font-size: 20px; font-weight: 600; color: #333; margin: 0; }
.table-card { border-radius: 12px; }
</style>
