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
    <n-modal v-model:show="showModal" preset="card" :title="editingCp ? '编辑供应商' : '新增游戏供应商'" class="entity-manage-modal" style="width: 680px;" :bordered="false">
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
            <n-form-item label="手续费比例">
              <n-input-number v-model:value="form.feeRate" :min="0" :max="1" :step="0.001" :precision="3" style="width: 200px;" />
              <span class="form-hint">例：0.005 = 0.5%，属于基础数据</span>
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
            <n-alert :type="settlementLocked ? 'warning' : 'info'" :bordered="false" class="receiver-profile-alert">
              {{
                settlementLocked
                  ? '该结算账户和附件资料已确认或已提交拉卡拉接收方申请，不能直接修改；基本信息、状态、手续费比例仍可编辑。确需变更结算资料，请到接收方与分账关系发起信息变更申请。'
                  : '这里维护拉卡拉“分账接收方”的结算账户和附件资料。请一次确认准确，提交拉卡拉后仅结算资料不可自行修改；手续费比例属于基础数据，不在这里维护。'
              }}
              <n-space v-if="settlementLocked" inline class="inline-action">
                <n-button size="tiny" secondary type="warning" @click="startCpSettlementDraft">
                  {{ settlementDraftMode ? '正在填写草稿' : '填写变更草稿' }}
                </n-button>
                <n-button size="tiny" secondary type="primary" @click="goReceiverChangeFromCp">
                  去提交变更申请
                </n-button>
              </n-space>
            </n-alert>
            <n-form-item label="账户类型">
              <n-input value="对公账户" readonly :disabled="settlementFieldsReadonly" />
            </n-form-item>
            <n-form-item label="开户银行">
              <n-select v-model:value="form.bankCode" :options="bankOptions" :disabled="settlementFieldsReadonly" placeholder="请选择开户银行" />
            </n-form-item>
            <n-form-item label="银行卡号">
              <n-input v-model:value="form.bankAccount" :disabled="settlementFieldsReadonly" placeholder="请输入银行卡号" maxlength="23" />
            </n-form-item>
            <n-form-item label="开户主体名称">
              <n-input v-model:value="form.accountName" :disabled="settlementFieldsReadonly" placeholder="请输入企业开户主体名称" />
            </n-form-item>
            <n-form-item label="统一社会信用代码（账户证件号）">
              <n-input v-model:value="form.idCard" :disabled="settlementFieldsReadonly" placeholder="请输入统一社会信用代码" maxlength="18" />
            </n-form-item>
            <template>
              <n-form-item label="营业执照号">
                <n-input v-model:value="form.licenseNo" :disabled="settlementFieldsReadonly" placeholder="请输入营业执照号码" />
              </n-form-item>
              <n-form-item label="营业执照名称">
                <n-input v-model:value="form.licenseName" :disabled="settlementFieldsReadonly" placeholder="请输入营业执照名称" />
              </n-form-item>
              <n-form-item label="法人姓名">
                <n-input v-model:value="form.legalPersonName" :disabled="settlementFieldsReadonly" placeholder="请输入法人姓名" />
              </n-form-item>
              <n-form-item label="法人证件号">
                <n-input v-model:value="form.legalPersonCertificateNo" :disabled="settlementFieldsReadonly" placeholder="请输入法人身份证号" maxlength="18" />
              </n-form-item>
            </template>
            <n-form-item label="附件状态">
              <n-tag :type="form.attachmentsReady ? 'success' : 'warning'" size="small">
                {{ form.attachmentsReady ? '已收齐' : '待补充' }}
              </n-tag>
            </n-form-item>
            <n-form-item label="分项附件">
              <div class="receiver-attachment-list">
                <div v-for="item in getRequiredAttachmentNames(form.accountKind)" :key="item" class="receiver-attachment-row">
                  <span>{{ item }}</span>
                  <n-upload
                    :file-list="getReceiverAttachmentFiles(item)"
                    :max="1"
                    :default-upload="false"
                    :disabled="settlementFieldsReadonly"
                    accept=".jpg,.jpeg,.png,.pdf"
                    @update:file-list="(files) => handleReceiverAttachmentFiles(item, files)"
                  >
                    <n-button size="small" :disabled="settlementFieldsReadonly">上传</n-button>
                  </n-upload>
                </div>
              </div>
              <div class="upload-hint">{{ settlementFieldsReadonly ? '当前展示的是生效结算资料；如需更换，请先填写变更草稿。' : '每一项资料单独上传，全部必传项上传后才会标记为已收齐。' }}</div>
            </n-form-item>
            <n-form-item label="资料确认">
              <n-radio-group v-model:value="form.profileConfirmed" :disabled="settlementFieldsReadonly">
                <n-radio :value="true">已确认，提交后结算账户不可自行修改</n-radio>
                <n-radio :value="false">暂不提交</n-radio>
              </n-radio-group>
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
    <n-modal v-model:show="showDetail" preset="card" title="供应商详情" class="entity-manage-modal" style="width: 720px;" :bordered="false">
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
            <n-descriptions-item label="手续费比例">{{ detailCp.feeRate ? `${(detailCp.feeRate * 100).toFixed(1)}%` : '0.5%' }}</n-descriptions-item>
            <n-descriptions-item label="管理员账号">{{ detailCp.username || '-' }}</n-descriptions-item>
            <n-descriptions-item label="在架游戏">{{ detailCp.gameCount }} 款</n-descriptions-item>
            <n-descriptions-item label="累计结算额" :span="2">¥{{ detailCp.totalSettlement.toLocaleString() }}</n-descriptions-item>
            <n-descriptions-item label="创建时间" :span="2">{{ detailCp.joinTime }}</n-descriptions-item>
          </n-descriptions>
        </n-tab-pane>
        <n-tab-pane name="bank" tab="结算账户">
          <n-descriptions v-if="detailCp.bankCode" label-placement="left" :column="1" bordered>
            <n-descriptions-item label="资料状态">
              <n-tag :type="getReceiverProfileStatusTagType(getCpReceiverStatus(detailCp))" size="small">
                {{ getReceiverProfileStatusLabel(getCpReceiverStatus(detailCp)) }}
              </n-tag>
            </n-descriptions-item>
            <n-descriptions-item label="变更状态">
              <n-tag :type="getReceiverSettlementChangeStatusTagType(getCpSettlementChangeState(detailCp).status)" size="small">
                {{ getReceiverSettlementChangeStatusLabel(getCpSettlementChangeState(detailCp).status) }}
              </n-tag>
            </n-descriptions-item>
            <n-descriptions-item v-if="getCpSettlementChangeState(detailCp).remark" label="变更说明">
              {{ getCpSettlementChangeState(detailCp).remark }}
            </n-descriptions-item>
            <n-descriptions-item label="账户类型">对公账户</n-descriptions-item>
            <n-descriptions-item label="开户银行">{{ getBankName(detailCp.bankCode) }}</n-descriptions-item>
            <n-descriptions-item label="银行卡号">{{ maskAccountNo(detailCp.bankAccount) }}</n-descriptions-item>
            <n-descriptions-item label="开户主体名称">{{ detailCp.accountName }}</n-descriptions-item>
            <n-descriptions-item label="统一社会信用代码">{{ detailCp.idCard ? detailCp.idCard.replace(/(\d{4})\d+(\d{4})/, '$1**********$2') : '-' }}</n-descriptions-item>
            <n-descriptions-item label="营业执照号">{{ detailCp.licenseNo || '-' }}</n-descriptions-item>
            <n-descriptions-item label="营业执照名称">{{ detailCp.licenseName || '-' }}</n-descriptions-item>
            <n-descriptions-item label="法人姓名">{{ detailCp.legalPersonName || '-' }}</n-descriptions-item>
            <n-descriptions-item label="法人证件号">{{ detailCp.legalPersonCertificateNo ? detailCp.legalPersonCertificateNo.replace(/(\d{4})\d+(\d{4})/, '$1**********$2') : '-' }}</n-descriptions-item>
            <n-descriptions-item label="必传附件">{{ detailCp.attachmentsReady ? '已收齐' : '待补充' }}</n-descriptions-item>
            <n-descriptions-item label="附件文件">
              <div class="attachment-detail-list">
                <n-tag
                  v-for="item in getCpAttachmentDisplayList(detailCp)"
                  :key="item"
                  size="small"
                  :type="item === '待补充' ? 'warning' : 'success'"
                >
                  {{ item }}
                </n-tag>
              </div>
            </n-descriptions-item>
            <n-descriptions-item label="资料确认">{{ detailCp.profileConfirmed ? '已确认，结算账户不可自行修改' : '未确认' }}</n-descriptions-item>
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
import { useRouter } from 'vue-router'
import {
  NAlert, NButton, NInput, NInputNumber, NSelect, NTag, NIcon, NSpace, NModal, NForm, NFormItem,
  NDataTable, NDescriptions, NDescriptionsItem,
  NTabs, NTabPane, NEmpty, NRadioGroup, NRadio, NUpload,
  useMessage
} from 'naive-ui'
import type { FormRules, DataTableColumns, UploadFileInfo } from 'naive-ui'
import {
  SearchOutline, AddOutline, PeopleOutline, CheckmarkCircleOutline,
  GameControllerOutline, CreateOutline, EyeOutline, BanOutline, InformationCircleOutline
} from '@vicons/ionicons5'
import {
  bankNameOptions,
  getBankDisplayName,
  getReceiverAttachmentDisplayList,
  getReceiverProfileStatus,
  getReceiverProfileStatusLabel,
  getReceiverProfileStatusTagType,
  getReceiverSettlementChangeStatusLabel,
  getReceiverSettlementChangeStatusTagType,
  getReceiverSettlementChangeStorageKey,
  maskAccountNo,
} from './lakalaReceiverProfile'

const message = useMessage()
const router = useRouter()
const searchText = ref('')
const filterStatus = ref<string | null>(null)
const showModal = ref(false)
const showDetail = ref(false)
const editingCp = ref<any>(null)
const detailCp = ref<any>(null)
const formRef = ref()
const receiverAttachmentFiles = ref<Record<string, UploadFileInfo[]>>({})
const settlementLocked = computed(() => isCpSettlementLocked(editingCp.value))
const settlementDraftMode = ref(false)
const settlementFieldsReadonly = computed(() => settlementLocked.value && !settlementDraftMode.value)

const statusOptions = [
  { label: '全部', value: null },
  { label: '正常', value: 'active' },
  { label: '已封禁', value: 'banned' },
]

const form = ref({
  name: '',
  contact: '',
  phone: '',
  accountKind: 'public',
  bankCode: '',
  bankAccount: '',
  accountName: '',
  idCard: '',
  licenseNo: '',
  licenseName: '',
  legalPersonName: '',
  legalPersonCertificateNo: '',
  attachmentsReady: false,
  profileConfirmed: false,
  feeRate: 0.005,
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

const bankOptions = bankNameOptions

const cpList = ref([
  { id: 1, name: '极境互动科技', contact: '张伟', phone: '13800001001', accountKind: 'public', bankCode: 'CMB', bankAccount: '6222123412341234', accountName: '极境互动科技有限公司', idCard: '91440300MA5CP0001X', licenseNo: '91440300MA5CP0001X', licenseName: '极境互动科技有限公司', legalPersonName: '张伟', legalPersonCertificateNo: '110101199001011234', attachmentsReady: true, profileConfirmed: true, feeRate: 0.005, bankName: '招商银行北京望京支行', gameCount: 12, totalSettlement: 528000, status: 'active', joinTime: '2024-03-15', username: 'jijing', password: '' },
  { id: 2, name: '闪耀游戏工作室', contact: '李明', phone: '13800001002', accountKind: 'public', bankCode: 'ICBC', bankAccount: '6217123456785678', accountName: '上海闪耀游戏科技有限公司', idCard: '91310101MA1SH0002X', licenseNo: '91310101MA1SH0002X', licenseName: '上海闪耀游戏科技有限公司', legalPersonName: '李明', legalPersonCertificateNo: '310101199102022345', attachmentsReady: true, profileConfirmed: true, feeRate: 0.005, bankName: '工商银行上海张江支行', gameCount: 8, totalSettlement: 356000, status: 'active', joinTime: '2024-05-20', username: 'shanyao', password: '' },
  { id: 3, name: '乐游网络', contact: '王芳', phone: '13800001003', accountKind: 'public', bankCode: 'CCB', bankAccount: '6214123490129012', accountName: '乐游网络有限公司', idCard: '91440300MA5CP0003X', licenseNo: '91440300MA5CP0003X', licenseName: '乐游网络有限公司', legalPersonName: '王芳', legalPersonCertificateNo: '440301199203033456', attachmentsReady: true, profileConfirmed: true, feeRate: 0.005, bankName: '建设银行深圳南山支行', gameCount: 10, totalSettlement: 412000, status: 'active', joinTime: '2024-02-28', username: 'leyou', password: '' },
  { id: 4, name: '星际科技', contact: '赵磊', phone: '13800001004', accountKind: 'public', bankCode: 'ABC', bankAccount: '6228123434563456', accountName: '星际科技有限公司', idCard: '91330100MA5CP0004X', licenseNo: '91330100MA5CP0004X', licenseName: '星际科技有限公司', legalPersonName: '赵磊', legalPersonCertificateNo: '330101199304044567', attachmentsReady: false, profileConfirmed: false, feeRate: 0.006, bankName: '农业银行杭州滨江支行', gameCount: 5, totalSettlement: 185000, status: 'active', joinTime: '2024-06-10', username: 'xingji', password: '' },
  { id: 5, name: '未来幻境', contact: '陈静', phone: '13800001005', accountKind: 'public', bankCode: 'BOC', bankAccount: '6230123478907890', accountName: '成都未来幻境数字科技有限公司', idCard: '91510100MA6WH0005X', licenseNo: '91510100MA6WH0005X', licenseName: '成都未来幻境数字科技有限公司', legalPersonName: '陈静', legalPersonCertificateNo: '510101199405055678', attachmentsReady: true, profileConfirmed: true, feeRate: 0.005, bankName: '中国银行成都高新支行', gameCount: 7, totalSettlement: 298000, status: 'active', joinTime: '2024-04-05', username: 'weilai', password: '' },
  { id: 6, name: '幻视科技', contact: '刘洋', phone: '13800001006', accountKind: 'public', bankCode: 'BOCOM', bankAccount: '6225123423452345', accountName: '幻视科技有限公司', idCard: '91320100MA5CP0006X', licenseNo: '91320100MA5CP0006X', licenseName: '幻视科技有限公司', legalPersonName: '刘洋', legalPersonCertificateNo: '320101199506066789', attachmentsReady: true, profileConfirmed: true, feeRate: 0.004, bankName: '交通银行南京江宁支行', gameCount: 6, totalSettlement: 267000, status: 'active', joinTime: '2024-07-18', username: 'huanshi', password: '' },
  { id: 7, name: '星辰游戏', contact: '周婷', phone: '13800001007', accountKind: 'public', bankCode: 'SPDB', bankAccount: '6216123467896789', accountName: '武汉星辰游戏科技有限公司', idCard: '91420100MA6XC0007X', licenseNo: '91420100MA6XC0007X', licenseName: '武汉星辰游戏科技有限公司', legalPersonName: '周婷', legalPersonCertificateNo: '420101199607077890', attachmentsReady: true, profileConfirmed: true, feeRate: 0.005, bankName: '浦发银行武汉光谷支行', gameCount: 3, totalSettlement: 52000, status: 'active', joinTime: '2025-04-01', username: 'xingchen', password: '' },
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
  { title: '累计结算额(¥)', key: 'totalSettlement', width: 130, align: 'right', sorter: true, render: (row) => `¥${row.totalSettlement.toLocaleString()}` },
  { title: '创建时间', key: 'joinTime', width: 110, sorter: true },
  { title: '分账资料', key: 'receiverProfileStatus', width: 120, render: (row: any) => {
    const status = getCpReceiverStatus(row)
    return h(NTag, { type: getReceiverProfileStatusTagType(status), size: 'small', bordered: true }, () => getReceiverProfileStatusLabel(status))
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
  return getBankDisplayName(code)
}

function getCpReceiverStatus(cp: any) {
  return getReceiverProfileStatus({
    accountKind: cp.accountKind || 'public',
    accountName: cp.accountName,
    accountNo: cp.bankAccount,
    bankName: cp.bankCode,
    certificateNo: cp.idCard,
    contactMobile: cp.phone,
    licenseNo: cp.licenseNo,
    licenseName: cp.licenseName,
    legalPersonName: cp.legalPersonName,
    legalPersonCertificateNo: cp.legalPersonCertificateNo,
    attachmentsReady: cp.attachmentsReady,
    profileConfirmed: cp.profileConfirmed,
    receiverStatus: cp.receiverStatus,
  })
}

function getCpAttachmentDisplayList(cp: any) {
  return getReceiverAttachmentDisplayList(cp.attachmentNames, cp.accountKind || 'public', cp.name, cp.attachmentsReady)
}

function getCpSettlementChangeState(cp: any) {
  const storageKey = getReceiverSettlementChangeStorageKey('cp', cp.name)
  const saved = localStorage.getItem(storageKey)
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      localStorage.removeItem(storageKey)
    }
  }
  const draftStatus = cp.pendingSettlementDraft?.draftStatus
  return {
    status: draftStatus || 'none',
    remark: draftStatus ? '已保存结算账户变更草稿，尚未提交拉卡拉审核' : '',
  }
}

function openAdd() {
  editingCp.value = null
  settlementDraftMode.value = false
  form.value = { name: '', contact: '', phone: '', accountKind: 'public', bankCode: '', bankAccount: '', accountName: '', idCard: '', licenseNo: '', licenseName: '', legalPersonName: '', legalPersonCertificateNo: '', attachmentsReady: false, profileConfirmed: false, feeRate: 0.005, status: 'active', username: '', password: '' }
  receiverAttachmentFiles.value = {}
  showModal.value = true
}
function openEdit(row: any) {
  editingCp.value = row
  settlementDraftMode.value = false
  const settlementSource = row.pendingSettlementDraft || row
  form.value = {
    name: row.name, contact: row.contact, phone: row.phone,
    accountKind: settlementSource.accountKind || 'public',
    bankCode: settlementSource.bankCode || '', bankAccount: settlementSource.bankAccount || '',
    accountName: settlementSource.accountName || '', idCard: settlementSource.idCard || '',
    licenseNo: settlementSource.licenseNo || '',
    licenseName: settlementSource.licenseName || '',
    legalPersonName: settlementSource.legalPersonName || '',
    legalPersonCertificateNo: settlementSource.legalPersonCertificateNo || '',
    attachmentsReady: settlementSource.attachmentsReady || false,
    profileConfirmed: settlementSource.profileConfirmed || false,
    feeRate: row.feeRate ?? 0.005,
    status: row.status,
    username: row.username || '', password: '',
  }
  receiverAttachmentFiles.value = parseAttachmentNames(settlementSource.attachmentNames || [])
  if (!isCpSettlementLocked(row)) {
    refreshReceiverAttachmentStatus()
  }
  showModal.value = true
}
function viewDetail(row: any) {
  detailCp.value = row
  showDetail.value = true
}
function getRequiredAttachmentNames(accountKind: string) {
  return accountKind === 'public'
    ? ['法人身份证正面', '法人身份证反面', '银行卡', '营业执照']
    : ['身份证正面', '身份证反面', '银行卡']
}

function buildAttachmentNames(filesMap: Record<string, UploadFileInfo[]>) {
  return Object.entries(filesMap).flatMap(([type, files]) => files.map((file) => `${type}：${file.name}`))
}

function parseAttachmentNames(names: string[]) {
  return names.reduce((acc, item) => {
    const [type, name] = item.includes('：') ? item.split('：') : ['其他资料', item]
    acc[type] = [{ id: item, name, status: 'finished' }]
    return acc
  }, {} as Record<string, UploadFileInfo[]>)
}

function getReceiverAttachmentFiles(type: string) {
  return receiverAttachmentFiles.value[type] || []
}

function refreshReceiverAttachmentStatus() {
  form.value.attachmentsReady = getRequiredAttachmentNames(form.value.accountKind).every((type) => Boolean(receiverAttachmentFiles.value[type]?.length))
}

function handleReceiverAttachmentFiles(type: string, files: UploadFileInfo[]) {
  receiverAttachmentFiles.value[type] = files.slice(0, 1)
  refreshReceiverAttachmentStatus()
}
function handleSave() {
  if (editingCp.value) {
    const lockedSettlement = pickCpSettlementFields(editingCp.value)
    const nextSettlementDraft = settlementDraftMode.value
      ? {
          ...pickCpSettlementFields(form.value),
          attachmentNames: buildAttachmentNames(receiverAttachmentFiles.value),
          bankName: form.value.bankCode ? getBankName(form.value.bankCode) + ' ' + (form.value.bankAccount || '') : '',
          draftStatus: 'draft',
        }
      : editingCp.value.pendingSettlementDraft
    Object.assign(
      editingCp.value,
      form.value,
      { attachmentNames: buildAttachmentNames(receiverAttachmentFiles.value) },
      settlementLocked.value ? { ...lockedSettlement, pendingSettlementDraft: nextSettlementDraft } : {}
    )
    // 更新 bankName 显示用
    if (!settlementLocked.value) {
      editingCp.value.bankName = form.value.bankCode ? getBankName(form.value.bankCode) + ' ' + (form.value.bankAccount || '') : ''
    }
    message.success(settlementDraftMode.value ? '结算账户变更草稿已保存，当前生效资料未覆盖' : '供应商信息已更新')
  } else {
    const newCp = {
      ...form.value,
      id: Date.now(), gameCount: 0, totalSettlement: 0,
      joinTime: new Date().toISOString().slice(0, 10),
      bankName: form.value.bankCode ? getBankName(form.value.bankCode) + ' ' + (form.value.bankAccount || '') : '',
      attachmentNames: buildAttachmentNames(receiverAttachmentFiles.value),
    }
    cpList.value.push(newCp)
    message.success('供应商已添加')
  }
  showModal.value = false
}
function isCpSettlementLocked(cp: any) {
  return Boolean(
    cp?.profileConfirmed
    || ['reviewing', 'active', 'supplement'].includes(cp?.receiverStatus)
  )
}
function pickCpSettlementFields(cp: any) {
  return {
    accountKind: cp.accountKind,
    bankCode: cp.bankCode,
    bankAccount: cp.bankAccount,
    accountName: cp.accountName,
    idCard: cp.idCard,
    licenseNo: cp.licenseNo,
    licenseName: cp.licenseName,
    legalPersonName: cp.legalPersonName,
    legalPersonCertificateNo: cp.legalPersonCertificateNo,
    attachmentsReady: cp.attachmentsReady,
    profileConfirmed: cp.profileConfirmed,
    receiverStatus: cp.receiverStatus,
    attachmentNames: cp.attachmentNames,
    bankName: cp.bankName,
  }
}
function startCpSettlementDraft() {
  if (!editingCp.value) return
  settlementDraftMode.value = true
  const draft = editingCp.value.pendingSettlementDraft || editingCp.value
  Object.assign(form.value, pickCpSettlementFields(draft))
  receiverAttachmentFiles.value = parseAttachmentNames(draft.attachmentNames || [])
}
function goReceiverChangeFromCp() {
  if (!editingCp.value) return
  if (isCpSettlementLocked(editingCp.value) && !editingCp.value.pendingSettlementDraft) {
    message.warning('请先填写并保存结算账户变更草稿，再提交拉卡拉变更申请')
    return
  }
  showModal.value = false
  router.push({
    path: '/platform/finance/lakala-merchant-split',
    query: {
      receiverOwnerType: 'cp',
      receiverOwnerId: String(editingCp.value.id),
      receiverOwnerName: editingCp.value.name,
      action: 'receiver-change',
    },
  })
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
.receiver-profile-alert { margin-bottom: 14px; }
.inline-action { margin-left: 10px; }
.upload-hint { width: 100%; margin-top: 6px; color: var(--text-muted); font-size: 12px; }
.receiver-attachment-list { width: 100%; display: grid; gap: 10px; }
.receiver-attachment-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 10px 12px; border: 1px solid var(--border-color); border-radius: 8px; background: #fafbfc; }
.attachment-detail-list { display: flex; flex-wrap: wrap; gap: 8px; }

:global(.entity-manage-modal.n-card) {
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}

:global(.entity-manage-modal .n-card-content) {
  min-height: 0;
  overflow-y: auto;
}

:global(.entity-manage-modal .n-card__footer) {
  flex-shrink: 0;
}
</style>
