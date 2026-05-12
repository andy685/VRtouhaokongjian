<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>短信模板</h1>
      <n-button type="primary" size="small" @click="openCreate">
        <template #icon><n-icon :component="AddOutline" /></template>
        新建模板
      </n-button>
    </div>

    <n-card class="table-card">
      <div class="template-tabs">
        <span v-for="tab in templateTabs" :key="tab.value"
          :class="['tab-item', { active: currentTab === tab.value }]"
          @click="currentTab = tab.value">
          {{ tab.label }}<span class="tab-count">({{ getTabCount(tab.value) }})</span>
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
        <n-alert v-if="isEdit && formData.approvalStatus === 'rejected'" type="warning" :bordered="false" style="margin-bottom:12px;">
          <template #header>上次驳回原因</template>
          {{ formData.rejectReason || '无' }}
        </n-alert>
      </n-form>
      <template #footer>
        <n-space justify="center">
          <n-button @click="showAddModal = false">取消</n-button>
          <n-button @click="saveDraft">存为草稿</n-button>
          <n-button type="primary" @click="submitForReview">提交审核</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NCard, NDataTable, NButton, NSpace, NInput, NIcon, NModal, NForm,
  NFormItem, NTag, NSelect, NAlert, useMessage
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { AddOutline } from '@vicons/ionicons5'

const message = useMessage()
const showAddModal = ref(false)
const isEdit = ref(false)
const currentTab = ref('all')

type ApprovalStatus = 'draft' | 'pending' | 'approved' | 'rejected'
interface TemplateItem {
  id: number; type: string; name: string; content: string
  approvalStatus: ApprovalStatus; rejectReason?: string
}

const templateTabs = [
  { label: '全部模板', value: 'all' },
  { label: '推广短信', value: 'promotion' },
  { label: '通知短信', value: 'notice' },
]

const typeOptions = [
  { label: '推广短信', value: 'promotion' },
  { label: '通知短信', value: 'notice' },
]

const formData = ref({
  id: null as number | null,
  type: null as string | null,
  name: '',
  content: '',
  approvalStatus: 'draft' as ApprovalStatus,
  rejectReason: '',
})

const formRules = {
  type: { required: true, message: '请选择模板类型', trigger: 'change' },
  name: { required: true, message: '请输入模板名称', trigger: 'blur' },
  content: { required: true, message: '请输入模板内容', trigger: 'blur' },
}

const pagination = { pageSize: 10 }

// 状态标签映射
const statusTag = (status: ApprovalStatus) => {
  const map: Record<ApprovalStatus, { label: string; type: 'default' | 'warning' | 'success' | 'error' }> = {
    draft: { label: '草稿', type: 'default' },
    pending: { label: '待审核', type: 'warning' },
    approved: { label: '已通过', type: 'success' },
    rejected: { label: '已驳回', type: 'error' },
  }
  return map[status]
}

const columns: DataTableColumns<TemplateItem> = [
  { title: '模板类型', key: 'type', width: 100,
    render: (row) => h(NTag, { type: row.type === 'promotion' ? 'info' : 'success', size: 'small' },
      () => row.type === 'promotion' ? '推广短信' : '通知短信')
  },
  { title: '模板名称', key: 'name', width: 150 },
  { title: '内容预览', key: 'content', ellipsis: { tooltip: true } },
  { title: '审核状态', key: 'approvalStatus', width: 100,
    render: (row) => {
      const s = statusTag(row.approvalStatus)
      return h('span', null, [
        h(NTag, { type: s.type, size: 'small' }, () => s.label),
        row.approvalStatus === 'rejected' && row.rejectReason
          ? h('span', { style: 'display:block;font-size:11px;color:#999;margin-top:2px;cursor:pointer;',
              title: row.rejectReason }, `ⓘ ${row.rejectReason.slice(0, 8)}...`)
          : null,
      ])
    }
  },
  { title: '操作', key: 'actions', width: 200,
    render: (row) => h(NSpace, { size: 'small' }, () => {
      const btns: any[] = []
      if (row.approvalStatus === 'draft' || row.approvalStatus === 'rejected') {
        btns.push(h(NButton, { size: 'tiny', secondary: true, onClick: () => handleEdit(row) }, () => '编辑'))
        btns.push(h(NButton, { size: 'tiny', type: 'primary', tertiary: true, onClick: () => submitTemplate(row) }, () => '提交审核'))
      }
      btns.push(h(NButton, { size: 'tiny', quaternary: true, type: 'error', onClick: () => handleDelete(row) }, () => '删除'))
      return btns
    })
  },
]

const tableData = ref<TemplateItem[]>([
  { id: 1, type: 'promotion', name: '520活动', content: '亲爱的会员，本店520活动火热进行中，满100减20，快来体验VR新世界！', approvalStatus: 'approved' },
  { id: 2, type: 'promotion', name: '优惠活动', content: '限时优惠！新会员首次体验立减50元，邀好友同行享更多福利！', approvalStatus: 'approved' },
  { id: 3, type: 'notice', name: '520店庆', content: '【幻彩星空】亲爱的会员，感谢您一直以来的支持！', approvalStatus: 'approved' },
  { id: 4, type: 'notice', name: '生日祝福', content: '【幻彩星空】生日快乐！为庆祝您的生日，我们准备了专属优惠券！', approvalStatus: 'approved' },
  { id: 5, type: 'notice', name: '到期提醒', content: '【幻彩星空】您的会员卡即将到期，为避免影响使用，请及时续费。', approvalStatus: 'rejected', rejectReason: '模板内容缺少退订提示，请在末尾加上"回T退订"' },
  { id: 6, type: 'notice', name: '消费确认', content: '【幻彩星空】您本次消费{amount}元，余额{balance}元，感谢您的光临！', approvalStatus: 'pending' },
])

const filteredData = computed(() => {
  if (currentTab.value === 'all') return tableData.value
  return tableData.value.filter(item => item.type === currentTab.value)
})

function getTabCount(type: string) {
  if (type === 'all') return tableData.value.length
  return tableData.value.filter(item => item.type === type).length
}

function openCreate() {
  isEdit.value = false
  formData.value = { id: null, type: null, name: '', content: '', approvalStatus: 'draft', rejectReason: '' }
  showAddModal.value = true
}

function handleEdit(row: TemplateItem) {
  isEdit.value = true
  formData.value = {
    id: row.id, type: row.type, name: row.name, content: row.content,
    approvalStatus: row.approvalStatus, rejectReason: row.rejectReason || '',
  }
  showAddModal.value = true
}

function saveDraft() {
  if (isEdit.value) {
    const row = tableData.value.find(item => item.id === formData.value.id)
    if (row) Object.assign(row, formData.value, { approvalStatus: 'draft' as const })
  } else {
    tableData.value.unshift({
      id: Date.now(), type: formData.value.type!, name: formData.value.name,
      content: formData.value.content, approvalStatus: 'draft',
    })
  }
  showAddModal.value = false
  message.success('已存为草稿')
}

function submitForReview() {
  if (!formData.value.type || !formData.value.name || !formData.value.content) {
    message.warning('请填写完整的模板信息')
    return
  }
  if (isEdit.value) {
    const row = tableData.value.find(item => item.id === formData.value.id)
    if (row) Object.assign(row, formData.value, { approvalStatus: 'pending' as const, rejectReason: '' })
  } else {
    tableData.value.unshift({
      id: Date.now(), type: formData.value.type!, name: formData.value.name,
      content: formData.value.content, approvalStatus: 'pending',
    })
  }
  showAddModal.value = false
  message.success('已提交审核，请等待平台审核')
}

function submitTemplate(row: TemplateItem) {
  row.approvalStatus = 'pending'
  row.rejectReason = undefined
  message.success('已提交审核')
}

function handleDelete(row: TemplateItem) {
  const idx = tableData.value.findIndex(item => item.id === row.id)
  if (idx > -1) tableData.value.splice(idx, 1)
}
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-header h1 { font-size: 18px; font-weight: 600; color: #333; margin: 0; }
.table-card { border-radius: 8px; }
.template-tabs { display: flex; gap: 24px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #f0f0f0; }
.tab-item { cursor: pointer; font-size: 14px; color: #666; padding: 4px 0; transition: all 0.2s; }
.tab-item:hover { color: #3B82F6; }
.tab-item.active { color: #3B82F6; font-weight: 600; border-bottom: 2px solid #3B82F6; }
.tab-count { font-weight: 400; color: #999; margin-left: 2px; }
</style>
