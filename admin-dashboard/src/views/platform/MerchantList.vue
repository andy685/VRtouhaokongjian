<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>商家管理</h1>
        <p class="header-desc">管理所有商家，每个商家可开设多家店铺</p>
      </div>
      <n-space>
        <n-input v-model:value="searchText" placeholder="搜索商家名称/联系人..." size="small" style="width: 220px;">
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
        <n-select v-model:value="filterStatus" placeholder="全部状态" :options="statusOptions" size="small" style="width: 120px;" clearable />
        <n-button type="primary" size="small" @click="showAddModal = true">
          <template #icon><n-icon :component="AddOutline" /></template>
          新建商家
        </n-button>
      </n-space>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="BusinessOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">商家总数</span>
          <span class="value">12</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="CheckmarkCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">正常营业</span>
          <span class="value">10</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="TimeOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">待了结算</span>
          <span class="value warning">36</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
          <n-icon :component="StorefrontOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">本月分润</span>
          <span class="value">¥128K</span>
        </div>
      </div>
    </div>

    <div class="content-card">
      <n-data-table :columns="columns" :data="filteredData" :pagination="pagination" striped />
    </div>

    <!-- 新增商家弹窗 -->
    <n-modal v-model:show="showAddModal" preset="card" title="新增商家" style="width: 680px;" :bordered="false">
      <n-form ref="addFormRef" :model="addForm" :rules="addRules" label-placement="left" label-width="100">
        <n-tabs type="line">
          <n-tab-pane name="basic" tab="基本信息">
            <n-form-item label="商家名称" path="name">
              <n-input v-model:value="addForm.name" placeholder="请输入商家名称" />
            </n-form-item>
            <n-form-item label="联系人" path="contact">
              <n-input v-model:value="addForm.contact" placeholder="请输入联系人姓名" />
            </n-form-item>
            <n-form-item label="联系电话" path="phone">
              <n-input v-model:value="addForm.phone" placeholder="请输入联系电话" />
            </n-form-item>
            <n-form-item label="负责区域" path="region">
              <n-select v-model:value="addForm.region" :options="regionOptions" placeholder="请选择负责区域" />
            </n-form-item>
            <n-form-item label="对应代理商" path="agentId">
              <n-select v-model:value="addForm.agentId" :options="agentOptions" placeholder="请选择代理商（选填）" clearable />
            </n-form-item>
            <n-form-item label="手续费率">
              <n-input-number v-model:value="addForm.feeRate" :min="0" :max="1" :step="0.001" :precision="3" style="width: 200px;" />
              <span style="margin-left: 8px; color: var(--text-muted);">（例：0.005 = 0.5%）</span>
            </n-form-item>
            <n-form-item label="商家状态" path="status">
              <n-radio-group v-model:value="addForm.status">
                <n-radio value="active">正常</n-radio>
                <n-radio value="pending">待审核</n-radio>
                <n-radio value="inactive">停用</n-radio>
              </n-radio-group>
            </n-form-item>
          </n-tab-pane>
          
          <n-tab-pane name="bank" tab="提现账户">
            <n-form-item label="开户银行">
              <n-select v-model:value="addForm.bankInfo.bankName" :options="bankOptions" placeholder="请选择开户银行" />
            </n-form-item>
            <n-form-item label="银行卡号">
              <n-input v-model:value="addForm.bankInfo.cardNo" placeholder="请输入银行卡号" maxlength="23" />
            </n-form-item>
            <n-form-item label="开户人姓名">
              <n-input v-model:value="addForm.bankInfo.accountName" placeholder="请输入开户人姓名" />
            </n-form-item>
            <n-form-item label="身份证号">
              <n-input v-model:value="addForm.bankInfo.idCard" placeholder="请输入身份证号" maxlength="18" />
            </n-form-item>
          </n-tab-pane>
        </n-tabs>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showAddModal = false">取消</n-button>
          <n-button type="primary" @click="handleAdd">确认新增</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 编辑商家弹窗 -->
    <n-modal v-model:show="showEditModal" preset="card" title="编辑商家" style="width: 680px;" :bordered="false">
      <n-tabs v-if="currentMerchant" type="line">
        <n-tab-pane name="basic" tab="基本信息">
          <n-form label-placement="left" label-width="100">
            <n-form-item label="商家名称">
              <n-input v-model:value="editForm.name" />
            </n-form-item>
            <n-form-item label="联系人">
              <n-input v-model:value="editForm.contact" />
            </n-form-item>
            <n-form-item label="联系电话">
              <n-input v-model:value="editForm.phone" />
            </n-form-item>
            <n-form-item label="负责区域">
              <n-select v-model:value="editForm.region" :options="regionOptions" />
            </n-form-item>
            <n-form-item label="对应代理商">
              <n-select v-model:value="editForm.agentId" :options="agentOptions" clearable />
            </n-form-item>
            <n-form-item label="手续费率">
              <n-input-number v-model:value="editForm.feeRate" :min="0" :max="1" :step="0.001" :precision="3" style="width: 200px;" />
              <span style="margin-left: 8px; color: var(--text-muted);">（例：0.005 = 0.5%）</span>
            </n-form-item>
            <n-form-item label="商家状态">
              <n-radio-group v-model:value="editForm.status">
                <n-radio value="active">正常</n-radio>
                <n-radio value="pending">待审核</n-radio>
                <n-radio value="inactive">停用</n-radio>
              </n-radio-group>
            </n-form-item>
          </n-form>
        </n-tab-pane>
        
        <n-tab-pane name="bank" tab="提现账户">
          <n-form label-placement="left" label-width="100">
            <n-form-item label="开户银行">
              <n-select v-model:value="editForm.bankInfo.bankName" :options="bankOptions" placeholder="请选择开户银行" />
            </n-form-item>
            <n-form-item label="银行卡号">
              <n-input v-model:value="editForm.bankInfo.cardNo" placeholder="请输入银行卡号" maxlength="23" />
            </n-form-item>
            <n-form-item label="开户人姓名">
              <n-input v-model:value="editForm.bankInfo.accountName" placeholder="请输入开户人姓名" />
            </n-form-item>
            <n-form-item label="身份证号">
              <n-input v-model:value="editForm.bankInfo.idCard" placeholder="请输入身份证号" maxlength="18" />
            </n-form-item>
          </n-form>
        </n-tab-pane>
      </n-tabs>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showEditModal = false">取消</n-button>
          <n-button type="primary" @click="handleEdit">保存</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 详情弹窗 -->
    <n-modal :show="showDetailModal" @update:show="(val: boolean) => showDetailModal = val" preset="card" title="商家详情" style="width: 720px;" :bordered="false">
      <n-tabs v-if="currentMerchant" type="line">
        <n-tab-pane name="basic" tab="基本信息">
          <n-descriptions label-placement="left" :column="2" bordered>
            <n-descriptions-item label="商家名称">{{ currentMerchant.name }}</n-descriptions-item>
            <n-descriptions-item label="商家ID">MC{{ String(currentMerchant.id).padStart(5, '0') }}</n-descriptions-item>
            <n-descriptions-item label="联系人">{{ currentMerchant.contact }}</n-descriptions-item>
            <n-descriptions-item label="联系电话">{{ currentMerchant.phone }}</n-descriptions-item>
            <n-descriptions-item label="负责区域">{{ currentMerchant.region }}</n-descriptions-item>
            <n-descriptions-item label="对应代理商">{{ currentMerchant.agentName || '无' }}</n-descriptions-item>
            <n-descriptions-item label="旗下店铺">{{ currentMerchant.storeCount }} 家</n-descriptions-item>
            <n-descriptions-item label="会员总数">{{ currentMerchant.memberCount }} 人</n-descriptions-item>
            <n-descriptions-item label="本月营收">{{ currentMerchant.monthRevenue }}</n-descriptions-item>
            <n-descriptions-item label="本月分润">{{ currentMerchant.monthCommission }}</n-descriptions-item>
            <n-descriptions-item label="手续费率">{{ (currentMerchant.feeRate * 100).toFixed(1) }}%</n-descriptions-item>
            <n-descriptions-item label="商家状态">
              <n-tag :type="statusType(currentMerchant.status)" size="small">{{ statusLabel(currentMerchant.status) }}</n-tag>
            </n-descriptions-item>
            <n-descriptions-item label="创建时间" :span="2">{{ currentMerchant.createdAt }}</n-descriptions-item>
          </n-descriptions>
        </n-tab-pane>
        
        <n-tab-pane name="bank" tab="提现账户">
          <n-descriptions label-placement="left" :column="1" bordered v-if="currentMerchant.bankInfo">
            <n-descriptions-item label="开户银行">{{ currentMerchant.bankInfo.bankName }}</n-descriptions-item>
            <n-descriptions-item label="银行卡号">{{ formatCardNo(currentMerchant.bankInfo.cardNo) }}</n-descriptions-item>
            <n-descriptions-item label="开户人">{{ currentMerchant.bankInfo.accountName }}</n-descriptions-item>
            <n-descriptions-item label="身份证号">{{ formatIDCard(currentMerchant.bankInfo.idCard) }}</n-descriptions-item>
            <n-descriptions-item label="状态">
              <n-tag type="success" size="small">已绑定</n-tag>
            </n-descriptions-item>
          </n-descriptions>
          <n-empty v-else description="未绑定提现账户" />
        </n-tab-pane>
      </n-tabs>
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
  NButton, NDataTable, NTag, NSpace, NInput, NSelect, NModal,
  NForm, NFormItem, NRadioGroup, NRadio, NIcon, NDescriptions, NDescriptionsItem, 
  useMessage, type FormInst, type FormRules, NInputNumber, NTabs, NTabPane, NEmpty
} from 'naive-ui'
import {
  SearchOutline, AddOutline, BusinessOutline, CheckmarkCircleOutline,
  TimeOutline, StorefrontOutline, CreateOutline, TrashOutline, EyeOutline
} from '@vicons/ionicons5'

const message = useMessage()
const searchText = ref('')
const filterStatus = ref<string | null>(null)

const statusOptions = [
  { label: '正常', value: 'active' },
  { label: '待审核', value: 'pending' },
  { label: '停用', value: 'inactive' },
]

const regionOptions = [
  { label: '深圳', value: '深圳' },
  { label: '广州', value: '广州' },
  { label: '北京', value: '北京' },
  { label: '上海', value: '上海' },
  { label: '成都', value: '成都' },
  { label: '杭州', value: '杭州' },
  { label: '武汉', value: '武汉' },
]

const agentOptions = [
  { label: '深圳未来科技', value: 1 },
  { label: '北京梦想空间', value: 2 },
  { label: '上海星际娱乐', value: 3 },
  { label: '成都虚拟现实', value: 4 },
  { label: '武汉创新体验', value: 5 },
]

const bankOptions = [
  { label: '中国工商银行', value: 'ICBC' },
  { label: '中国建设银行', value: 'CCB' },
  { label: '中国农业银行', value: 'ABC' },
  { label: '中国银行', value: 'BOC' },
  { label: '交通银行', value: 'BOCOM' },
  { label: '招商银行', value: 'CMB' },
  { label: '中国邮政储蓄银行', value: 'PSBC' },
  { label: '兴业银行', value: 'CIB' },
  { label: '浦发银行', value: 'SPDB' },
  { label: '民生银行', value: 'CMBC' },
]

function formatCardNo(cardNo: string) {
  if (!cardNo) return ''
  return cardNo.replace(/(\d{4})(?=\d)/g, '$1 ')
}

function formatIDCard(idCard: string) {
  if (!idCard) return ''
  return idCard.replace(/(\d{4})\d+(\d{4})/, '$1**********$2')
}

const columns = [
  { title: '商家名称', key: 'name', width: 160 },
  { title: '联系人', key: 'contact', width: 90 },
  { title: '联系电话', key: 'phone', width: 120 },
  { title: '负责区域', key: 'region', width: 90 },
  {
    title: '状态', key: 'status', width: 80,
    render(row: any) {
      return h(NTag, { type: statusType(row.status), size: 'small', bordered: true }, () => statusLabel(row.status))
    }
  },
  { title: '旗下店铺', key: 'storeCount', width: 90 },
  { title: '会员数', key: 'memberCount', width: 80 },
  { title: '本月游戏豆充值', key: 'monthRevenue', width: 130 },
  { title: '本月分润', key: 'monthCommission', width: 110, render: (row: any) => h('span', { style: 'font-weight: 600; color: #3B82F6;' }, row.monthCommission) },
  {
    title: '操作', key: 'actions', width: 180, fixed: 'right',
    render(row: any) {
      return h(NSpace, { size: 'small' }, {
        default: () => [
          h(NButton, { size: 'tiny', quaternary: true, type: 'info', onClick: () => openDetail(row) }, {
            default: () => '详情', icon: () => h(NIcon, { component: EyeOutline, size: 14 })
          }),
          h(NButton, { size: 'tiny', quaternary: true, type: 'primary', onClick: () => openEdit(row) }, {
            default: () => '编辑', icon: () => h(NIcon, { component: CreateOutline, size: 14 })
          }),
          h(NButton, { size: 'tiny', quaternary: true, type: 'error', onClick: () => handleDelete(row) }, {
            default: () => '删除', icon: () => h(NIcon, { component: TrashOutline, size: 14 })
          }),
        ]
      })
    }
  },
]

function statusType(status: string) {
  const map: Record<string, string> = { active: 'success', pending: 'warning', inactive: 'default' }
  return map[status] || 'default'
}
function statusLabel(status: string) {
  const map: Record<string, string> = { active: '正常', pending: '待审核', inactive: '停用' }
  return map[status] || status
}

const merchantData = ref([
  { 
    id: 1, name: '恒然集团', contact: '陈总', phone: '13800001101', region: '深圳', agentId: 1, agentName: '深圳未来科技', 
    status: 'active', storeCount: 8, memberCount: 3280, monthRevenue: '¥156,800', monthCommission: '¥23,520', feeRate: 0.005, createdAt: '2023-06-01',
    bankInfo: { bankName: 'ICBC', cardNo: '6222021234567890123', accountName: '陈总', idCard: '440301198001011234' }
  },
  { 
    id: 2, name: '幻影星空', contact: '林总', phone: '13800001102', region: '广州', agentId: 3, agentName: '上海星际娱乐', 
    status: 'active', storeCount: 5, memberCount: 1890, monthRevenue: '¥98,500', monthCommission: '¥17,730', feeRate: 0.005, createdAt: '2023-07-15',
    bankInfo: { bankName: 'CCB', cardNo: '6217001234567890', accountName: '林总', idCard: '440101198502021234' }
  },
  { 
    id: 3, name: '利民街商家', contact: '张总', phone: '13800001103', region: '北京', agentId: 2, agentName: '北京梦想空间', 
    status: 'active', storeCount: 3, memberCount: 2150, monthRevenue: '¥112,000', monthCommission: '¥13,440', feeRate: 0.006, createdAt: '2023-08-20',
    bankInfo: null
  },
  { 
    id: 4, name: '党建馆集团', contact: '李总', phone: '13800001104', region: '成都', agentId: 4, agentName: '成都虚拟现实', 
    status: 'active', storeCount: 2, memberCount: 980, monthRevenue: '¥56,800', monthCommission: '¥5,680', feeRate: 0.005, createdAt: '2023-09-10',
    bankInfo: { bankName: 'ABC', cardNo: '6228481234567890', accountName: '李总', idCard: '510102197801011234' }
  },
  { 
    id: 5, name: '华东展厅', contact: '王总', phone: '13800001105', region: '上海', agentId: 3, agentName: '上海星际娱乐', 
    status: 'pending', storeCount: 4, memberCount: 1560, monthRevenue: '¥89,200', monthCommission: '¥16,056', feeRate: 0.005, createdAt: '2023-10-05',
    bankInfo: null
  },
  { 
    id: 6, name: '南山科创', contact: '赵总', phone: '13800001106', region: '深圳', agentId: 1, agentName: '深圳未来科技', 
    status: 'active', storeCount: 6, memberCount: 2450, monthRevenue: '¥134,600', monthCommission: '¥20,190', feeRate: 0.004, createdAt: '2023-11-01',
    bankInfo: { bankName: 'CMB', cardNo: '6214831234567890', accountName: '赵总', idCard: '440303198503031234' }
  },
  { 
    id: 7, name: '天河娱乐', contact: '孙总', phone: '13800001107', region: '广州', agentId: null, agentName: '', 
    status: 'inactive', storeCount: 1, memberCount: 560, monthRevenue: '¥12,300', monthCommission: '-', feeRate: 0.005, createdAt: '2023-12-10',
    bankInfo: null
  },
  { 
    id: 8, name: '钱塘体验中心', contact: '周总', phone: '13800001108', region: '杭州', agentId: null, agentName: '', 
    status: 'active', storeCount: 3, memberCount: 1120, monthRevenue: '¥67,800', monthCommission: '-', feeRate: 0.005, createdAt: '2024-01-08',
    bankInfo: { bankName: 'BOC', cardNo: '6217851234567890', accountName: '周总', idCard: '330102198204041234' }
  },
])

const pagination = { pageSize: 10 }

const filteredData = computed(() => {
  let data = [...merchantData.value]
  if (searchText.value) {
    const kw = searchText.value.toLowerCase()
    data = data.filter(d => d.name.toLowerCase().includes(kw) || d.contact.toLowerCase().includes(kw) || d.phone.includes(kw))
  }
  if (filterStatus.value) {
    data = data.filter(d => d.status === filterStatus.value)
  }
  return data
})

// 新增
const showAddModal = ref(false)
const addFormRef = ref<FormInst | null>(null)
const addForm = ref({ 
  name: '', contact: '', phone: '', region: '', agentId: null as number | null, 
  status: 'active', feeRate: 0.005,
  bankInfo: { bankName: '', cardNo: '', accountName: '', idCard: '' }
})
const addRules: FormRules = {
  name: { required: true, message: '请输入商家名称', trigger: 'blur' },
  contact: { required: true, message: '请输入联系人', trigger: 'blur' },
  phone: { required: true, message: '请输入联系电话', trigger: 'blur' },
  region: { required: true, message: '请选择负责区域', trigger: 'change' },
}

function handleAdd() {
  addFormRef.value?.validate((errors) => {
    if (errors) return
    const agentName = agentOptions.find(a => a.value === addForm.value.agentId)?.label || ''
    const bankInfo = addForm.value.bankInfo.bankName ? { ...addForm.value.bankInfo } : null
    merchantData.value.unshift({
      id: Date.now(),
      name: addForm.value.name,
      contact: addForm.value.contact,
      phone: addForm.value.phone,
      region: addForm.value.region,
      agentId: addForm.value.agentId,
      agentName,
      status: addForm.value.status,
      storeCount: 0,
      memberCount: 0,
      monthRevenue: '¥0',
      monthCommission: '¥0',
      feeRate: addForm.value.feeRate,
      bankInfo,
      createdAt: new Date().toISOString().slice(0, 10),
    })
    message.success('商家新增成功')
    showAddModal.value = false
    addForm.value = { 
      name: '', contact: '', phone: '', region: '', agentId: null, 
      status: 'active', feeRate: 0.005,
      bankInfo: { bankName: '', cardNo: '', accountName: '', idCard: '' }
    }
  })
}

// 编辑
const showEditModal = ref(false)
const currentMerchant = ref<any>(null)
const editForm = ref({ 
  name: '', contact: '', phone: '', region: '', agentId: null as number | null, 
  status: 'active', feeRate: 0.005,
  bankInfo: { bankName: '', cardNo: '', accountName: '', idCard: '' }
})

function openEdit(row: any) {
  currentMerchant.value = row
  editForm.value = { 
    ...row,
    bankInfo: row.bankInfo ? { ...row.bankInfo } : { bankName: '', cardNo: '', accountName: '', idCard: '' }
  }
  showEditModal.value = true
}

function handleEdit() {
  if (!currentMerchant.value) return
  const idx = merchantData.value.findIndex(d => d.id === currentMerchant.value.id)
  if (idx !== -1) {
    const agentName = agentOptions.find(a => a.value === editForm.value.agentId)?.label || ''
    const bankInfo = editForm.value.bankInfo.bankName ? { ...editForm.value.bankInfo } : null
    merchantData.value[idx] = { 
      ...merchantData.value[idx], 
      ...editForm.value, 
      agentName,
      bankInfo
    }
    message.success('商家信息已更新')
  }
  showEditModal.value = false
}

// 详情
const showDetailModal = ref(false)

function openDetail(row: any) {
  currentMerchant.value = row
  showDetailModal.value = true
}

function openEditFromDetail() {
  showDetailModal.value = false
  openEdit(currentMerchant.value)
}

// 删除
function handleDelete(row: any) {
  merchantData.value = merchantData.value.filter(d => d.id !== row.id)
  message.success('商家已删除')
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
.stat-content .value.warning { color: #F59E0B; }

.content-card { background: white; border-radius: 16px; padding: 24px; border: 1px solid var(--border-color); }
</style>
