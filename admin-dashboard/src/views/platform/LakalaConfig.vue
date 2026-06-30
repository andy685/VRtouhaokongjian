<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>拉卡拉配置</h1>
        <p class="header-desc">配置拉卡拉分账账户信息，支持平台、商家、门店、代理商、游戏供应商五种归属类型</p>
      </div>
      <n-space>
        <n-button type="primary" size="small" @click="openAdd">
          <template #icon><n-icon :component="AddOutline" /></template>
          新增配置
        </n-button>
      </n-space>
    </div>

    <!-- 筛选 -->
    <n-space class="filter-bar" align="center">
      <n-select
        v-model:value="filterOwnerType"
        :options="ownerTypeOptions"
        placeholder="归属类型"
        clearable
        style="width: 160px;"
      />
      <n-input v-model:value="filterKeyword" placeholder="搜索商户号/终端号/机构号..." clearable style="width: 260px;" />
      <n-select
        v-model:value="filterStatus"
        :options="[{ label: '全部状态', value: null }, { label: '启用', value: 1 }, { label: '停用', value: 0 }]"
        style="width: 120px;"
      />
    </n-space>

    <!-- 数据表格 -->
    <n-data-table
      :columns="columns"
      :data="filteredData"
      :bordered="true"
      :single-line="false"
      size="small"
      :pagination="{ pageSize: 10 }"
      :scroll-x="1600"
    />

    <!-- 新增/编辑弹窗 -->
    <n-modal v-model:show="showForm" :title="formTitle" preset="card" style="width: 720px;" :bordered="false" :mask-closable="false">
      <n-form ref="formRef" :model="formData" :rules="formRules" label-placement="left" label-width="130">
        <n-grid :cols="2" :x-gap="16">
          <n-gi>
            <n-form-item label="归属类型" path="account_owner_type">
              <n-select v-model:value="formData.account_owner_type" :options="ownerTypeOptions" placeholder="请选择归属类型" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="归属对象" path="account_owner_id">
              <n-select
                v-model:value="formData.account_owner_id"
                :options="ownerObjectOptions"
                placeholder="选择对象"
                :disabled="ownerObjectOptions.length === 0"
              />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="拉卡拉商户号" path="merchant_no">
              <n-input v-model:value="formData.merchant_no" placeholder="商户号" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="拉卡拉终端号" path="term_no">
              <n-input v-model:value="formData.term_no" placeholder="终端号" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="拉卡拉机构号" path="org_no">
              <n-input v-model:value="formData.org_no" placeholder="机构号" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="虚拟终端号" path="vpos_id">
              <n-input v-model:value="formData.vpos_id" placeholder="聚合收银台虚拟终端号" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="渠道号" path="channel_id">
              <n-input v-model:value="formData.channel_id" placeholder="聚合收银台渠道号" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="分账接收方编号" path="ledger_receiver_no">
              <n-input v-model:value="formData.ledger_receiver_no" placeholder="分账接收方编号" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="行业钱包账户号" path="ewallet_account_no">
              <n-input v-model:value="formData.ewallet_account_no" placeholder="行业钱包账户号" />
            </n-form-item>
          </n-gi>
        </n-grid>
        <n-form-item label="状态" path="status">
          <n-radio-group v-model:value="formData.status">
            <n-radio :value="1">启用</n-radio>
            <n-radio :value="0">停用</n-radio>
          </n-radio-group>
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showForm = false">取消</n-button>
          <n-button type="primary" @click="handleSave">保存</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 删除确认 -->
    <n-modal v-model:show="showDeleteConfirm" preset="card" title="确认删除" style="width: 400px;" :bordered="false">
      <p>确认删除该拉卡拉配置吗？删除后将无法恢复。</p>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showDeleteConfirm = false">取消</n-button>
          <n-button type="error" @click="handleDelete">确认删除</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NDataTable, NButton, NIcon, NModal, NSpace, NSelect, NInput,
  NForm, NFormItem, NGrid, NGi, NTag, NRadio, NRadioGroup, useMessage,
} from 'naive-ui'
import type { DataTableColumns, FormInst, FormRules } from 'naive-ui'
import { AddOutline } from '@vicons/ionicons5'

const message = useMessage()
const formRef = ref<FormInst | null>(null)

// ===== 归属类型映射 =====
const ownerTypeOptions = [
  { label: '平台', value: 1 },
  { label: '商家', value: 2 },
  { label: '门店', value: 3 },
  { label: '代理商', value: 4 },
  { label: '游戏供应商', value: 5 },
]

const ownerTypeLabel: Record<number, string> = {
  1: '平台', 2: '商家', 3: '门店', 4: '代理商', 5: '游戏供应商',
}

const ownerTypeColor: Record<number, string> = {
  1: '#6366f1', 2: '#10b981', 3: '#f59e0b', 4: '#ef4444', 5: '#8b5cf6',
}

// ===== 归属对象 Mock 数据 =====
interface OwnerObject { id: number; name: string }
const merchantList: OwnerObject[] = [
  { id: 1001, name: '华东展厅' },
  { id: 1002, name: '幻影星空' },
  { id: 1003, name: '未来空间' },
]
const storeList: OwnerObject[] = [
  { id: 2001, name: '华东展厅-收银台A' },
  { id: 2002, name: '幻影星空-1号机' },
  { id: 2003, name: '未来空间-前台' },
]
const agentList: OwnerObject[] = [
  { id: 3001, name: '华北代理商' },
  { id: 3002, name: '华东代理商' },
]
const cpList: OwnerObject[] = [
  { id: 4001, name: '游戏CP-A' },
  { id: 4002, name: '内容供应商-B' },
]

const ownerListMap: Record<number, OwnerObject[]> = {
  2: merchantList,
  3: storeList,
  4: agentList,
  5: cpList,
}

// 动态归属对象选项（平台无归属对象，ID 固定为 0）
const isPlatform = computed(() => formData.value.account_owner_type === 1)

const ownerObjectOptions = computed(() => {
  if (isPlatform.value) {
    formData.value.account_owner_id = 0
    return []
  }
  const list = ownerListMap[formData.value.account_owner_type] || []
  return list.map(item => ({ label: item.name, value: item.id }))
})

// ===== 筛选 =====
const filterOwnerType = ref<number | null>(null)
const filterKeyword = ref('')
const filterStatus = ref<number | null>(null)

// ===== 表单 =====
const showForm = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)

const defaultFormData = () => ({
  account_owner_type: 2 as number,
  account_owner_id: 0 as number,
  merchant_no: '',
  term_no: '',
  vpos_id: '',
  channel_id: '',
  org_no: '',
  ledger_receiver_no: '',
  ewallet_account_no: '',
  status: 1 as number,
})

const formData = ref(defaultFormData())

const formRules: FormRules = {
  account_owner_type: [{ required: true, message: '请选择归属类型', trigger: 'change' }],
  merchant_no: [{ required: true, message: '请输入拉卡拉商户号', trigger: 'blur' }],
}

const formTitle = computed(() => isEditing.value ? '编辑拉卡拉配置' : '新增拉卡拉配置')

function openAdd() {
  isEditing.value = false
  editingId.value = null
  formData.value = defaultFormData()
  showForm.value = true
}

function openEdit(row: any) {
  isEditing.value = true
  editingId.value = row.id
  formData.value = {
    account_owner_type: row.account_owner_type,
    account_owner_id: row.account_owner_id,
    merchant_no: row.merchant_no || '',
    term_no: row.term_no || '',
    vpos_id: row.vpos_id || '',
    channel_id: row.channel_id || '',
    org_no: row.org_no || '',
    ledger_receiver_no: row.ledger_receiver_no || '',
    ewallet_account_no: row.ewallet_account_no || '',
    status: row.status,
  }
  showForm.value = true
}

function handleSave() {
  formRef.value?.validate((errors) => {
    if (errors) return
    const data = formData.value
    if (isEditing.value) {
      const idx = mockData.value.findIndex((d: any) => d.id === editingId.value)
      if (idx >= 0) {
        mockData.value[idx] = { ...mockData.value[idx], ...data, update_time: formatNow() }
      }
      message.success('配置已更新')
    } else {
      const newId = Math.max(0, ...mockData.value.map((d: any) => d.id)) + 1
      mockData.value.unshift({
        id: newId,
        ...data,
        create_time: formatNow(),
        update_time: formatNow(),
        deleted: 0,
      })
      message.success('配置已添加')
    }
    showForm.value = false
  })
}

// ===== 删除 =====
const showDeleteConfirm = ref(false)
const deleteTarget = ref<any>(null)

function confirmDelete(row: any) {
  deleteTarget.value = row
  showDeleteConfirm.value = true
}

function handleDelete() {
  if (deleteTarget.value) {
    const idx = mockData.value.findIndex((d: any) => d.id === deleteTarget.value.id)
    if (idx >= 0) mockData.value.splice(idx, 1)
    message.success('配置已删除')
  }
  showDeleteConfirm.value = false
  deleteTarget.value = null
}

function resolveOwnerName(type: number, id: number): string {
  if (type === 1) return '平台'
  const list = ownerListMap[type] || []
  const item = list.find(o => o.id === id)
  return item ? item.name : `ID:${id}`
}

function formatNow() {
  return new Date().toISOString().replace('T', ' ').substring(0, 19)
}

// ===== 表格列 =====
const columns: DataTableColumns = [
  { title: 'ID', key: 'id', width: 60, align: 'center' },
  {
    title: '归属类型', key: 'account_owner_type', width: 110, align: 'center',
    render: (row: any) => h(NTag, {
      size: 'small',
      type: 'info',
      bordered: false,
      style: `background:${ownerTypeColor[row.account_owner_type]}1a;color:${ownerTypeColor[row.account_owner_type]};border:none;`,
    }, () => ownerTypeLabel[row.account_owner_type] || '-'),
  },
  { title: '归属对象', key: 'account_owner_id', width: 120, align: 'center',
    render: (row: any) => resolveOwnerName(row.account_owner_type, row.account_owner_id),
  },
  { title: '商户号', key: 'merchant_no', width: 150, align: 'center' },
  { title: '终端号', key: 'term_no', width: 130, align: 'center' },
  { title: '虚拟终端号', key: 'vpos_id', width: 160, align: 'center' },
  { title: '渠道号', key: 'channel_id', width: 140, align: 'center' },
  { title: '机构号', key: 'org_no', width: 130, align: 'center' },
  { title: '分账接收方', key: 'ledger_receiver_no', width: 140, align: 'center' },
  { title: '钱包账户号', key: 'ewallet_account_no', width: 140, align: 'center' },
  {
    title: '状态', key: 'status', width: 90, align: 'center',
    render: (row: any) => h(NTag, {
      size: 'small',
      type: row.status === 1 ? 'success' : 'default',
      round: true,
      bordered: false,
    }, () => row.status === 1 ? '✅ 启用' : '⛔ 停用'),
  },
  { title: '创建时间', key: 'create_time', width: 170, align: 'center' },
  { title: '更新时间', key: 'update_time', width: 170, align: 'center' },
  {
    title: '操作', key: 'action', width: 120, align: 'center', fixed: 'right' as const,
    render: (row: any) => h(NSpace, { size: 4 }, () => [
      h(NButton, { size: 'tiny', text: true, type: 'primary', onClick: () => openEdit(row) }, () => '编辑'),
      h(NButton, { size: 'tiny', text: true, type: 'error', onClick: () => confirmDelete(row) }, () => '删除'),
    ]),
  },
]

// ===== Mock 数据 =====
const mockData = ref([
  {
    id: 1, account_owner_type: 1, account_owner_id: 0,
    merchant_no: 'LK888000000001', term_no: 'TERM-001',
    vpos_id: 'VPOS-0001', channel_id: 'CH-0001',
    org_no: 'ORG-1001', ledger_receiver_no: 'LR-00001',
    ewallet_account_no: 'EW-00001', status: 1,
    create_time: '2024-01-15 10:30:00', update_time: '2025-03-20 14:00:00', deleted: 0,
  },
  {
    id: 2, account_owner_type: 2, account_owner_id: 1001,
    merchant_no: 'LK888000000101', term_no: 'TERM-101',
    vpos_id: 'VPOS-1001', channel_id: 'CH-1001',
    org_no: 'ORG-1001', ledger_receiver_no: 'LR-00002',
    ewallet_account_no: 'EW-00002', status: 1,
    create_time: '2024-03-10 09:00:00', update_time: '2025-06-01 11:00:00', deleted: 0,
  },
  {
    id: 3, account_owner_type: 3, account_owner_id: 2001,
    merchant_no: 'LK888000000201', term_no: 'TERM-201',
    vpos_id: 'VPOS-2001', channel_id: 'CH-2001',
    org_no: 'ORG-1002', ledger_receiver_no: 'LR-00003',
    ewallet_account_no: 'EW-00003', status: 0,
    create_time: '2024-05-20 16:00:00', update_time: '2025-01-10 08:30:00', deleted: 0,
  },
  {
    id: 4, account_owner_type: 4, account_owner_id: 3001,
    merchant_no: 'LK888000000301', term_no: 'TERM-301',
    vpos_id: 'VPOS-3001', channel_id: 'CH-3001',
    org_no: 'ORG-1003', ledger_receiver_no: 'LR-00004',
    ewallet_account_no: '', status: 1,
    create_time: '2024-08-01 12:00:00', update_time: '2025-04-15 10:00:00', deleted: 0,
  },
  {
    id: 5, account_owner_type: 5, account_owner_id: 4001,
    merchant_no: 'LK888000000401', term_no: 'TERM-401',
    vpos_id: 'VPOS-4001', channel_id: 'CH-4001',
    org_no: 'ORG-1004', ledger_receiver_no: 'LR-00005',
    ewallet_account_no: 'EW-00005', status: 1,
    create_time: '2024-11-12 08:00:00', update_time: '2025-05-20 16:30:00', deleted: 0,
  },
  {
    id: 6, account_owner_type: 2, account_owner_id: 1002,
    merchant_no: 'LK888000000501', term_no: 'TERM-501',
    vpos_id: 'VPOS-5001', channel_id: 'CH-5001',
    org_no: 'ORG-1005', ledger_receiver_no: 'LR-00006',
    ewallet_account_no: 'EW-00006', status: 1,
    create_time: '2025-02-01 10:00:00', update_time: '2025-05-30 09:00:00', deleted: 0,
  },
])

// ===== 筛选逻辑 =====
const filteredData = computed(() => {
  let data = mockData.value.filter((d: any) => d.deleted === 0)
  if (filterOwnerType.value) {
    data = data.filter((d: any) => d.account_owner_type === filterOwnerType.value)
  }
  if (filterStatus.value !== null && filterStatus.value !== undefined) {
    data = data.filter((d: any) => d.status === filterStatus.value)
  }
  if (filterKeyword.value) {
    const kw = filterKeyword.value.toLowerCase()
    data = data.filter((d: any) =>
      (d.merchant_no || '').toLowerCase().includes(kw) ||
      (d.term_no || '').toLowerCase().includes(kw) ||
      (d.org_no || '').toLowerCase().includes(kw) ||
      (d.vpos_id || '').toLowerCase().includes(kw) ||
      (d.channel_id || '').toLowerCase().includes(kw)
    )
  }
  return data
})
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}
.page-header h1 { font-size: 18px; font-weight: 600; color: #333; margin: 0; }
.header-desc { font-size: 13px; color: #999; margin: 4px 0 0 0; }
.filter-bar { margin-bottom: 12px; }
</style>
