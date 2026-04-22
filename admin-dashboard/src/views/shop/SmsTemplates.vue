<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>短信模板</h1>
      <n-button type="primary" size="small" @click="showAddModal = true">
        <template #icon><n-icon :component="AddOutline" /></template>
        新建模板
      </n-button>
    </div>

    <n-card class="table-card">
      <!-- 模板分类Tab -->
      <div class="template-tabs">
        <span
          v-for="tab in templateTabs"
          :key="tab.value"
          :class="['tab-item', { active: currentTab === tab.value }]"
          @click="currentTab = tab.value"
        >
          {{ tab.label }}
          <span class="tab-count">({{ getTabCount(tab.value) }})</span>
        </span>
      </div>

      <n-data-table :columns="columns" :data="filteredData" :pagination="pagination" />
    </n-card>

    <!-- 新建/编辑模板弹窗 -->
    <n-modal v-model:show="showAddModal" preset="card" :title="isEdit ? '编辑模板' : '新建模板'" style="width: 560px;">
      <n-form :model="formData" label-placement="left" label-width="80px" :rules="formRules">
        <n-form-item label="模板类型" path="type" required>
          <n-select v-model:value="formData.type" :options="typeOptions" placeholder="请选择模板类型" />
        </n-form-item>
        <n-form-item label="模板名称" path="name" required>
          <n-input v-model:value="formData.name" placeholder="如：促销活动通知" />
        </n-form-item>
        <n-form-item label="模板内容" path="content" required>
          <n-input v-model:value="formData.content" type="textarea" :rows="5" placeholder="请输入短信模板内容..." show-count :maxlength="500" />
        </n-form-item>
        <n-form-item label="状态">
          <n-radio-group v-model:value="formData.status">
            <n-space>
              <n-radio :value="true">启用</n-radio>
              <n-radio :value="false">停用</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="center">
          <n-button @click="showAddModal = false">取消</n-button>
          <n-button type="primary" @click="handleSubmit">确定</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NCard, NDataTable, NButton, NSpace, NInput, NIcon, NModal, NForm,
  NFormItem, NTag, NRadio, NRadioGroup, NSelect
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { AddOutline } from '@vicons/ionicons5'

const showAddModal = ref(false)
const isEdit = ref(false)
const currentTab = ref('all')

const templateTabs = [
  { label: '全部模板', value: 'all' },
  { label: '推广短信', value: 'promotion' },
  { label: '通知短信', value: 'notice' }
]

const typeOptions = [
  { label: '推广短信', value: 'promotion' },
  { label: '通知短信', value: 'notice' }
]

const formData = ref({
  id: null as number | null,
  type: null as string | null,
  name: '',
  content: '',
  status: true
})

const formRules = {
  type: { required: true, message: '请选择模板类型', trigger: 'change' },
  name: { required: true, message: '请输入模板名称', trigger: 'blur' },
  content: { required: true, message: '请输入模板内容', trigger: 'blur' }
}

const pagination = { pageSize: 10 }

const columns: DataTableColumns = [
  { title: '模板类型', key: 'type', width: 100, render: (row) =>
    h(NTag, { type: row.type === 'promotion' ? 'info' : 'success', size: 'small' },
      { default: () => row.type === 'promotion' ? '推广短信' : '通知短信' })
  },
  { title: '模板名称', key: 'name', width: 150 },
  { title: '内容预览', key: 'content', ellipsis: { tooltip: true } },
  { title: '状态', key: 'status', width: 90, render: (row) =>
    h(NTag, { type: row.status ? 'success' : 'warning', size: 'small' },
      { default: () => row.status ? '启用' : '停用' })
  },
  { title: '操作', key: 'actions', width: 140, render: (row) => h(NSpace, { size: 'small' }, { default: () => [
    h(NButton, { size: 'tiny', secondary: true, onClick: () => handleEdit(row) }, () => '编辑'),
    h(NButton, { size: 'tiny', type: row.status ? 'warning' : 'success', tertiary: true, onClick: () => handleToggle(row) }, () => row.status ? '停用' : '启用'),
    h(NButton, { size: 'tiny', quaternary: true, type: 'error', onClick: () => handleDelete(row) }, () => '删除')
  ] }) }
]

const tableData = ref([
  { id: 1, type: 'promotion', name: '520活动', content: '亲爱的会员，本店520活动火热进行中，满100减20，快来体验VR新世界！', status: true },
  { id: 2, type: 'promotion', name: '优惠活动', content: '限时优惠！新会员首次体验立减50元，邀好友同行享更多福利！', status: true },
  { id: 3, type: 'notice', name: '520店庆', content: '【幻彩星空】亲爱的会员，感谢您一直以来的支持，期待与您共度美好时光！', status: true },
  { id: 4, type: 'notice', name: '生日祝福', content: '【幻彩星空】生日快乐！为庆祝您的生日，我们准备了专属优惠券，生日当周体验享8折！', status: true },
  { id: 5, type: 'notice', name: '到期提醒', content: '【幻彩星空】您的会员卡即将到期，为避免影响使用，请及时续费。', status: false },
  { id: 6, type: 'notice', name: '消费确认', content: '【幻彩星空】您本次消费{amount}元，余额{balance}元，感谢您的光临！', status: true }
])

const filteredData = computed(() => {
  if (currentTab.value === 'all') return tableData.value
  return tableData.value.filter(item => item.type === currentTab.value)
})

function getTabCount(type: string) {
  if (type === 'all') return tableData.value.length
  return tableData.value.filter(item => item.type === type).length
}

function handleEdit(row: any) {
  isEdit.value = true
  formData.value = { id: row.id, type: row.type, name: row.name, content: row.content, status: row.status }
  showAddModal.value = true
}

function handleToggle(row: any) {
  row.status = !row.status
}

function handleDelete(row: any) {
  const index = tableData.value.findIndex(item => item.id === row.id)
  if (index > -1) {
    tableData.value.splice(index, 1)
  }
}

function handleSubmit() {
  if (isEdit.value) {
    const row = tableData.value.find(item => item.id === formData.value.id)
    if (row) {
      row.type = formData.value.type
      row.name = formData.value.name
      row.content = formData.value.content
      row.status = formData.value.status
    }
  } else {
    tableData.value.unshift({
      id: Date.now(),
      type: formData.value.type,
      name: formData.value.name,
      content: formData.value.content,
      status: formData.value.status
    })
  }
  showAddModal.value = false
  formData.value = { id: null, type: null, name: '', content: '', status: true }
  isEdit.value = false
}
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-header h1 { font-size: 18px; font-weight: 600; color: #333; margin: 0; }
.table-card { border-radius: 8px; }

.template-tabs {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}
.tab-item {
  cursor: pointer;
  font-size: 14px;
  color: #666;
  padding: 4px 0;
  transition: all 0.2s;
}
.tab-item:hover {
  color: #3B82F6;
}
.tab-item.active {
  color: #3B82F6;
  font-weight: 600;
  border-bottom: 2px solid #3B82F6;
}
.tab-count {
  font-weight: 400;
  color: #999;
  margin-left: 2px;
}
</style>
