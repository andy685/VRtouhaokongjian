<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>游戏供应商管理</h1>
        <p class="header-desc">管理游戏供应商及其在架游戏</p>
      </div>
      <n-space>
        <n-input v-model:value="searchText" placeholder="搜索供应商名称..." size="small" style="width: 200px;">
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
        <n-select v-model:value="filterStatus" :options="statusOptions" placeholder="全部状态" size="small" style="width: 130px;" clearable />
        <n-button type="primary" @click="openAdd">
          <template #icon><n-icon :component="AddOutline" /></template> 新增游戏供应商
        </n-button>
      </n-space>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="PeopleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">供应商总数</span>
          <span class="value">7</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="CheckmarkCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">正常运营</span>
          <span class="value">7</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
          <n-icon :component="GameControllerOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">在架游戏</span>
          <span class="value">48</span>
        </div>
      </div>
    </div>

    <div class="content-card">
      <n-data-table :columns="columns" :data="filteredData" :pagination="pagination" striped :row-props="rowProps" />
    </div>

    <!-- 新增/编辑供应商弹窗 -->
    <n-modal v-model:show="showModal" preset="card" :title="editingCp ? '编辑供应商' : '新增游戏供应商'" style="width: 680px;" :bordered="false">
      <n-form ref="formRef" :model="form" :rules="rules" label-placement="left" label-width="100">
        <n-tabs type="line">
          <n-tab-pane name="basic" tab="基本信息">
            <n-form-item label="公司名称" path="name">
              <n-input v-model:value="form.name" placeholder="营业执照上的公司全称" />
            </n-form-item>
            <n-form-item label="联系人" path="contact">
              <n-input v-model:value="form.contact" placeholder="请输入联系人姓名" />
            </n-form-item>
            <n-form-item label="联系电话" path="phone">
              <n-input v-model:value="form.phone" placeholder="请输入联系电话" />
            </n-form-item>
            <n-form-item label="手续费率" path="feeRate">
              <n-input-number v-model:value="form.feeRate" :min="0" :max="100" :step="0.1" :precision="1" style="width: 200px;">
                <template #suffix>%</template>
              </n-input-number>
              <span class="form-hint">平台从供应商结算金额中抽取的分成比例</span>
            </n-form-item>
          </n-tab-pane>

          <n-tab-pane name="account" tab="管理员账号">
            <n-form-item label="管理员账号" path="username">
              <n-input v-model:value="form.username" placeholder="请输入管理员登录账号" />
            </n-form-item>
            <n-form-item label="管理员密码" path="password">
              <n-input v-model:value="form.password" type="password" show-password-on="click" placeholder="请输入管理员登录密码" />
            </n-form-item>
          </n-tab-pane>

          <n-tab-pane name="bank" tab="结算账户">
            <div style="margin-bottom: 12px; padding: 12px; background: #EFF6FF; border-radius: 8px; font-size: 13px; color: #3B82F6;">
              <n-icon :component="InformationCircleOutline" style="vertical-align: middle; margin-right: 4px;" />
              结算账户用于接收平台定期打款的结算收益，请确保信息准确
            </div>
            <n-form-item label="开户银行">
              <n-select v-model:value="form.bankCode" :options="bankOptions" placeholder="请选择开户银行" />
            </n-form-item>
            <n-form-item label="银行卡号">
              <n-input v-model:value="form.bankAccount" placeholder="请输入银行卡号" maxlength="23" />
            </n-form-item>
            <n-form-item label="开户人姓名">
              <n-input v-model:value="form.accountName" placeholder="请输入开户人姓名（需与身份证一致）" />
            </n-form-item>
            <n-form-item label="身份证号">
              <n-input v-model:value="form.idCard" placeholder="请输入身份证号" maxlength="18" />
            </n-form-item>
          </n-tab-pane>
        </n-tabs>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" @click="handleSave">{{ editingCp ? '保存修改' : '确认新增' }}</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 详情弹窗 -->
    <n-modal v-model:show="showDetail" preset="card" title="供应商详情" style="width: 720px;" :bordered="false">
      <n-tabs v-if="detailCp" type="line">
        <n-tab-pane name="basic" tab="基本信息">
          <n-descriptions label-placement="left" :column="2" bordered>
            <n-descriptions-item label="公司名称">{{ detailCp.name }}</n-descriptions-item>
            <n-descriptions-item label="状态">
              <n-tag :type="detailCp.status === 'active' ? 'success' : 'error'" size="small">
                {{ detailCp.status === 'active' ? '正常' : '已封禁' }}
              </n-tag>
            </n-descriptions-item>
            <n-descriptions-item label="联系人">{{ detailCp.contact }}</n-descriptions-item>
            <n-descriptions-item label="联系电话">{{ detailCp.phone }}</n-descriptions-item>
            <n-descriptions-item label="管理员账号">{{ detailCp.username || '-' }}</n-descriptions-item>
            <n-descriptions-item label="在架游戏">{{ detailCp.gameCount }} 款</n-descriptions-item>
            <n-descriptions-item label="手续费率">{{ detailCp.feeRate }}%</n-descriptions-item>
            <n-descriptions-item label="累计结算额" :span="2">¥{{ detailCp.totalSettlement.toLocaleString() }}</n-descriptions-item>
            <n-descriptions-item label="创建时间" :span="2">{{ detailCp.joinTime }}</n-descriptions-item>
          </n-descriptions>
        </n-tab-pane>
        <n-tab-pane name="bank" tab="结算账户">
          <n-descriptions v-if="detailCp.bankCode" label-placement="left" :column="1" bordered>
            <n-descriptions-item label="开户银行">{{ getBankName(detailCp.bankCode) }}</n-descriptions-item>
            <n-descriptions-item label="银行卡号">{{ detailCp.bankAccount }}</n-descriptions-item>
            <n-descriptions-item label="开户人姓名">{{ detailCp.accountName }}</n-descriptions-item>
            <n-descriptions-item label="身份证号">{{ detailCp.idCard ? detailCp.idCard.replace(/(\d{4})\d+(\d{4})/, '$1**********$2') : '-' }}</n-descriptions-item>
            <n-descriptions-item label="账户状态">
              <n-tag type="success" size="small">已绑定</n-tag>
            </n-descriptions-item>
          </n-descriptions>
          <n-empty v-else description="该供应商尚未绑定结算账户" />
        </n-tab-pane>
      </n-tabs>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showDetail = false">关闭</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NButton, NInput, NInputNumber, NSelect, NTag, NIcon, NSpace, NModal, NForm, NFormItem,
  NDataTable, NDescriptions, NDescriptionsItem,
  NTabs, NTabPane, NEmpty,
  useMessage
} from 'naive-ui'
import type { FormRules, DataTableColumns } from 'naive-ui'
import {
  SearchOutline, AddOutline, PeopleOutline, CheckmarkCircleOutline,
  GameControllerOutline, CreateOutline, EyeOutline, BanOutline, InformationCircleOutline
} from '@vicons/ionicons5'

const message = useMessage()
const searchText = ref('')
const filterStatus = ref<string | null>(null)
const showModal = ref(false)
const showDetail = ref(false)
const editingCp = ref<any>(null)
const detailCp = ref<any>(null)
const formRef = ref()

const statusOptions = [
  { label: '全部', value: null },
  { label: '正常', value: 'active' },
  { label: '已封禁', value: 'banned' },
]

const form = ref({
  name: '',
  contact: '',
  phone: '',
  bankCode: '',
  bankAccount: '',
  accountName: '',
  idCard: '',
  feeRate: 5,
  status: 'active',
  username: '',
  password: '',
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入公司名称' }],
  contact: [{ required: true, message: '请输入联系人' }],
  phone: [{ required: true, message: '请输入联系电话' }],
  username: [{ required: true, message: '请输入管理员账号' }],
  password: [{ required: true, message: '请输入管理员密码' }],
}

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

const cpList = ref([
  { id: 1, name: '极境互动科技', contact: '张伟', phone: '13800001001', bankCode: 'CMB', bankAccount: '6222****1234', accountName: '张伟', idCard: '110101199001011234', bankName: '招商银行北京望京支行', gameCount: 12, feeRate: 8, totalSettlement: 528000, status: 'active', joinTime: '2024-03-15', username: 'jijing', password: '' },
  { id: 2, name: '闪耀游戏工作室', contact: '李明', phone: '13800001002', bankCode: 'ICBC', bankAccount: '6217****5678', accountName: '李明', idCard: '310101199102022345', bankName: '工商银行上海张江支行', gameCount: 8, feeRate: 5, totalSettlement: 356000, status: 'active', joinTime: '2024-05-20', username: 'shanyao', password: '' },
  { id: 3, name: '乐游网络', contact: '王芳', phone: '13800001003', bankCode: 'CCB', bankAccount: '6214****9012', accountName: '王芳', idCard: '440301199203033456', bankName: '建设银行深圳南山支行', gameCount: 10, feeRate: 6, totalSettlement: 412000, status: 'active', joinTime: '2024-02-28', username: 'leyou', password: '' },
  { id: 4, name: '星际科技', contact: '赵磊', phone: '13800001004', bankCode: 'ABC', bankAccount: '6228****3456', accountName: '赵磊', idCard: '330101199304044567', bankName: '农业银行杭州滨江支行', gameCount: 5, feeRate: 10, totalSettlement: 185000, status: 'active', joinTime: '2024-06-10', username: 'xingji', password: '' },
  { id: 5, name: '未来幻境', contact: '陈静', phone: '13800001005', bankCode: 'BOC', bankAccount: '6230****7890', accountName: '陈静', idCard: '510101199405055678', bankName: '中国银行成都高新支行', gameCount: 7, feeRate: 6, totalSettlement: 298000, status: 'active', joinTime: '2024-04-05', username: 'weilai', password: '' },
  { id: 6, name: '幻视科技', contact: '刘洋', phone: '13800001006', bankCode: 'BOCOM', bankAccount: '6225****2345', accountName: '刘洋', idCard: '320101199506066789', bankName: '交通银行南京江宁支行', gameCount: 6, feeRate: 7, totalSettlement: 267000, status: 'active', joinTime: '2024-07-18', username: 'huanshi', password: '' },
  { id: 7, name: '星辰游戏', contact: '周婷', phone: '13800001007', bankCode: 'SPDB', bankAccount: '6216****6789', accountName: '周婷', idCard: '420101199607077890', bankName: '浦发银行武汉光谷支行', gameCount: 3, feeRate: 10, totalSettlement: 52000, status: 'active', joinTime: '2025-04-01', username: 'xingchen', password: '' },
])

const pagination = { pageSize: 10 }

const columns: DataTableColumns<any> = [
  { title: '公司名称', key: 'name', width: 160, sorter: true, render: (row) => h('span', { style: { fontWeight: 600 } }, row.name) },
  { title: '状态', key: 'status', width: 80, render: (row) => {
    const map: Record<string, { type: any, label: string }> = { active: { type: 'success', label: '正常' }, banned: { type: 'error', label: '已封禁' } }
    return h(NTag, { type: map[row.status]?.type, size: 'small', bordered: true }, { default: () => map[row.status]?.label })
  }},
  { title: '联系人', key: 'contact', width: 80 },
  { title: '联系电话', key: 'phone', width: 120 },
  { title: '在架游戏', key: 'gameCount', width: 80, align: 'center' },
  { title: '手续费率', key: 'feeRate', width: 90, align: 'center', render: (row) => `${row.feeRate}%` },
  { title: '累计结算额(¥)', key: 'totalSettlement', width: 130, align: 'right', sorter: true, render: (row) => `¥${row.totalSettlement.toLocaleString()}` },
  { title: '创建时间', key: 'joinTime', width: 110, sorter: true },
  { title: '结算账户', key: 'bankCode', width: 90, render: (row: any) => {
    return row.bankCode
      ? h(NTag, { type: 'success', size: 'small', bordered: true }, () => '已绑定')
      : h(NTag, { type: 'warning', size: 'small', bordered: true }, () => '未绑定')
  }},
  {
    title: '操作', key: 'actions', width: 150, fixed: 'right',
    render: (row) => h(NSpace, { size: 4 }, {
      default: () => [
        h(NButton, { size: 'tiny', quaternary: true, onClick: () => viewDetail(row) }, { default: () => '详情' }),
        editingCp.value?.id === row.id
          ? h(NButton, { size: 'tiny', type: 'primary', secondary: true, onClick: () => openEdit(row) }, { default: () => '编辑' })
          : h(NButton, { size: 'tiny', type: 'primary', secondary: true, onClick: () => openEdit(row) }, { default: () => '编辑' }),
        row.status === 'active'
          ? h(NButton, { size: 'tiny', quaternary: true, type: 'error', onClick: () => banCp(row) }, { default: () => '封禁' })
          : h(NButton, { size: 'tiny', quaternary: true, type: 'success', onClick: () => unbanCp(row) }, { default: () => '解封' }),
      ]
    })
  },
]

const filteredData = computed(() => {
  let data = [...cpList.value]
  if (searchText.value) data = data.filter(c => c.name.includes(searchText.value) || c.contact.includes(searchText.value))
  if (filterStatus.value) data = data.filter(c => c.status === filterStatus.value)
  return data
})

function rowProps(row: any) {
  return { style: row.status === 'banned' ? 'opacity:0.5' : '' }
}

function getBankName(code: string) {
  const map: Record<string, string> = {
    ICBC: '中国工商银行', CCB: '中国建设银行', ABC: '中国农业银行',
    BOC: '中国银行', BOCOM: '交通银行', CMB: '招商银行',
    PSBC: '中国邮政储蓄银行', CIB: '兴业银行', SPDB: '浦发银行', CMBC: '民生银行'
  }
  return map[code] || code
}

function openAdd() {
  editingCp.value = null
  form.value = { name: '', contact: '', phone: '', bankCode: '', bankAccount: '', accountName: '', idCard: '', feeRate: 5, status: 'active', username: '', password: '' }
  showModal.value = true
}
function openEdit(row: any) {
  editingCp.value = row
  form.value = {
    name: row.name, contact: row.contact, phone: row.phone,
    bankCode: row.bankCode || '', bankAccount: row.bankAccount || '',
    accountName: row.accountName || '', idCard: row.idCard || '',
    feeRate: row.feeRate, status: row.status,
    username: row.username || '', password: '',
  }
  showModal.value = true
}
function viewDetail(row: any) {
  detailCp.value = row
  showDetail.value = true
}
function handleSave() {
  if (editingCp.value) {
    Object.assign(editingCp.value, form.value)
    // 更新 bankName 显示用
    editingCp.value.bankName = form.value.bankCode ? getBankName(form.value.bankCode) + ' ' + (form.value.bankAccount || '') : ''
    message.success('供应商信息已更新')
  } else {
    const newCp = {
      ...form.value,
      id: Date.now(), gameCount: 0, totalSettlement: 0,
      joinTime: new Date().toISOString().slice(0, 10),
      bankName: form.value.bankCode ? getBankName(form.value.bankCode) + ' ' + (form.value.bankAccount || '') : '',
    }
    cpList.value.push(newCp)
    message.success('供应商已添加')
  }
  showModal.value = false
}
function banCp(row: any) { row.status = 'banned'; message.warning(`「${row.name}」已封禁`) }
function unbanCp(row: any) { row.status = 'active'; message.success(`「${row.name}」已解封`) }
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.header-desc { font-size: 13px; color: var(--text-muted); margin-top: 4px; }
.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: white; border-radius: 14px; padding: 20px; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 16px; }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-content { display: flex; flex-direction: column; }
.stat-content .label { font-size: 12px; color: var(--text-muted); }
.stat-content .value { font-family: 'Orbitron', sans-serif; font-size: 22px; font-weight: 700; color: var(--text-primary); }
.content-card { background: white; border-radius: 16px; padding: 24px; border: 1px solid var(--border-color); }
.form-hint { margin-left: 8px; font-size: 12px; color: var(--text-muted); }
</style>
