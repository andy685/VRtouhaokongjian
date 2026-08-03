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
        <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
          <n-icon :component="StorefrontOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">上月营收</span>
          <span class="value">{{ lastMonthRevenue }}</span>
        </div>
      </div>
    </div>

    <div class="content-card">
      <n-data-table :columns="columns" :data="filteredData" :pagination="pagination" striped />
    </div>

    <!-- 新增商家弹窗 -->
    <n-modal v-model:show="showAddModal" preset="card" title="新增商家" class="entity-manage-modal" style="width: 680px;" :bordered="false">
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

          <n-tab-pane name="account" tab="管理员账号">
            <n-form-item label="管理员账号" path="username">
              <n-input v-model:value="addForm.username" placeholder="请输入管理员登录账号" />
            </n-form-item>
            <n-form-item label="管理员密码" path="password">
              <n-input v-model:value="addForm.password" type="password" show-password-on="click" placeholder="请输入管理员登录密码" />
            </n-form-item>
          </n-tab-pane>
          
          <n-tab-pane name="bank" tab="结算账户">
            <n-alert type="info" :bordered="false" class="receiver-profile-alert">
              此处资料用于创建拉卡拉分账接收方。请一次确认准确，提交拉卡拉后仅结算账户和附件资料不可自行修改；门店收款码仍在收银配置中维护。
            </n-alert>
            <n-form-item label="账户类型">
              <n-input value="对公账户" readonly />
            </n-form-item>
            <n-form-item label="开户银行">
              <n-select v-model:value="addForm.bankInfo.bankName" :options="bankOptions" placeholder="请选择开户银行" />
            </n-form-item>
            <n-form-item label="银行卡号">
              <n-input v-model:value="addForm.bankInfo.cardNo" placeholder="请输入银行卡号" maxlength="23" />
            </n-form-item>
            <n-form-item label="开户主体名称">
              <n-input v-model:value="addForm.bankInfo.accountName" placeholder="请输入企业开户主体名称" />
            </n-form-item>
            <n-form-item label="统一社会信用代码（账户证件号）">
              <n-input v-model:value="addForm.bankInfo.idCard" placeholder="请输入统一社会信用代码" maxlength="18" />
            </n-form-item>
            <template>
              <n-form-item label="营业执照号">
                <n-input v-model:value="addForm.bankInfo.licenseNo" placeholder="请输入营业执照号码" />
              </n-form-item>
              <n-form-item label="营业执照名称">
                <n-input v-model:value="addForm.bankInfo.licenseName" placeholder="请输入营业执照名称" />
              </n-form-item>
              <n-form-item label="法人姓名">
                <n-input v-model:value="addForm.bankInfo.legalPersonName" placeholder="请输入法人姓名" />
              </n-form-item>
              <n-form-item label="法人证件号">
                <n-input v-model:value="addForm.bankInfo.legalPersonCertificateNo" placeholder="请输入法人身份证号" maxlength="18" />
              </n-form-item>
            </template>
            <n-form-item label="附件状态">
              <n-tag :type="addForm.bankInfo.attachmentsReady ? 'success' : 'warning'" size="small">
                {{ addForm.bankInfo.attachmentsReady ? '已收齐' : '待补充' }}
              </n-tag>
            </n-form-item>
            <n-form-item label="分项附件">
              <div class="receiver-attachment-list">
                <div v-for="item in getRequiredAttachmentNames(addForm.bankInfo.accountKind)" :key="item" class="receiver-attachment-row">
                  <span>{{ item }}</span>
                  <n-upload
                    :file-list="getAddReceiverAttachmentFiles(item)"
                    :max="1"
                    :default-upload="false"
                    accept=".jpg,.jpeg,.png,.pdf"
                    @update:file-list="(files) => handleAddReceiverAttachmentFiles(item, files)"
                  >
                    <n-button size="small">上传</n-button>
                  </n-upload>
                </div>
              </div>
              <div class="upload-hint">每一项资料单独上传，全部必传项上传后才会标记为已收齐。</div>
            </n-form-item>
            <n-form-item label="资料确认">
              <n-radio-group v-model:value="addForm.bankInfo.profileConfirmed">
                <n-radio :value="true">已确认，提交后不可自行修改</n-radio>
                <n-radio :value="false">暂不提交</n-radio>
              </n-radio-group>
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
    <n-modal v-model:show="showEditModal" preset="card" title="编辑商家" class="entity-manage-modal" style="width: 680px;" :bordered="false">
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
        
        <n-tab-pane name="bank" tab="结算账户">
          <n-form label-placement="left" label-width="100">
            <n-alert :type="editSettlementLocked ? 'warning' : 'info'" :bordered="false" class="receiver-profile-alert">
              {{
                editSettlementLocked
                  ? '该结算账户和附件资料已确认或已提交拉卡拉接收方申请，不能直接修改；基本信息、状态、手续费率等基础数据仍可编辑。确需变更结算资料，请到接收方与分账关系发起信息变更申请。'
                  : '这里仅维护结算账户和附件资料；确认后将作为拉卡拉分账接收方资料，后续变更需走申请。'
              }}
              <n-space v-if="editSettlementLocked" inline class="inline-action">
                <n-button size="tiny" secondary type="warning" @click="startMerchantSettlementDraft">
                  {{ settlementDraftMode ? '正在填写草稿' : '填写变更草稿' }}
                </n-button>
                <n-button size="tiny" secondary type="primary" @click="goReceiverChangeFromMerchant">
                  去提交变更申请
                </n-button>
              </n-space>
            </n-alert>
            <n-form-item label="账户类型">
              <n-input value="对公账户" readonly :disabled="settlementFieldsReadonly" />
            </n-form-item>
            <n-form-item label="开户银行">
              <n-select v-model:value="editForm.bankInfo.bankName" :options="bankOptions" :disabled="settlementFieldsReadonly" placeholder="请选择开户银行" />
            </n-form-item>
            <n-form-item label="银行卡号">
              <n-input v-model:value="editForm.bankInfo.cardNo" :disabled="settlementFieldsReadonly" placeholder="请输入银行卡号" maxlength="23" />
            </n-form-item>
            <n-form-item label="开户主体名称">
              <n-input v-model:value="editForm.bankInfo.accountName" :disabled="settlementFieldsReadonly" placeholder="请输入企业开户主体名称" />
            </n-form-item>
            <n-form-item label="统一社会信用代码（账户证件号）">
              <n-input v-model:value="editForm.bankInfo.idCard" :disabled="settlementFieldsReadonly" placeholder="请输入统一社会信用代码" maxlength="18" />
            </n-form-item>
            <template>
              <n-form-item label="营业执照号">
                <n-input v-model:value="editForm.bankInfo.licenseNo" :disabled="settlementFieldsReadonly" placeholder="请输入营业执照号码" />
              </n-form-item>
              <n-form-item label="营业执照名称">
                <n-input v-model:value="editForm.bankInfo.licenseName" :disabled="settlementFieldsReadonly" placeholder="请输入营业执照名称" />
              </n-form-item>
              <n-form-item label="法人姓名">
                <n-input v-model:value="editForm.bankInfo.legalPersonName" :disabled="settlementFieldsReadonly" placeholder="请输入法人姓名" />
              </n-form-item>
              <n-form-item label="法人证件号">
                <n-input v-model:value="editForm.bankInfo.legalPersonCertificateNo" :disabled="settlementFieldsReadonly" placeholder="请输入法人身份证号" maxlength="18" />
              </n-form-item>
            </template>
            <n-form-item label="附件状态">
              <n-tag :type="editForm.bankInfo.attachmentsReady ? 'success' : 'warning'" size="small">
                {{ editForm.bankInfo.attachmentsReady ? '已收齐' : '待补充' }}
              </n-tag>
            </n-form-item>
            <n-form-item label="分项附件">
              <div class="receiver-attachment-list">
                <div v-for="item in getRequiredAttachmentNames(editForm.bankInfo.accountKind)" :key="item" class="receiver-attachment-row">
                  <span>{{ item }}</span>
                  <n-upload
                    :file-list="getEditReceiverAttachmentFiles(item)"
                    :max="1"
                    :default-upload="false"
                    :disabled="settlementFieldsReadonly"
                    accept=".jpg,.jpeg,.png,.pdf"
                    @update:file-list="(files) => handleEditReceiverAttachmentFiles(item, files)"
                  >
                    <n-button size="small" :disabled="settlementFieldsReadonly">上传</n-button>
                  </n-upload>
                </div>
              </div>
              <div class="upload-hint">{{ settlementFieldsReadonly ? '当前展示的是生效结算资料；如需更换，请先填写变更草稿。' : '每一项资料单独上传，全部必传项上传后才会标记为已收齐。' }}</div>
            </n-form-item>
            <n-form-item label="资料确认">
              <n-radio-group v-model:value="editForm.bankInfo.profileConfirmed" :disabled="settlementFieldsReadonly">
                <n-radio :value="true">已确认，提交后结算账户不可自行修改</n-radio>
                <n-radio :value="false">暂不提交</n-radio>
              </n-radio-group>
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
    <n-modal :show="showDetailModal" @update:show="(val: boolean) => showDetailModal = val" preset="card" title="商家详情" class="entity-manage-modal" style="width: 720px;" :bordered="false">
      <n-tabs v-if="currentMerchant" type="line">
        <n-tab-pane name="basic" tab="基本信息">
          <n-descriptions label-placement="left" :column="2" bordered>
            <n-descriptions-item label="商家名称">{{ currentMerchant.name }}</n-descriptions-item>
            <n-descriptions-item label="商家ID">MC{{ String(currentMerchant.id).padStart(5, '0') }}</n-descriptions-item>
            <n-descriptions-item label="联系人">{{ currentMerchant.contact }}</n-descriptions-item>
            <n-descriptions-item label="联系电话">{{ currentMerchant.phone }}</n-descriptions-item>
            <n-descriptions-item label="负责区域">{{ currentMerchant.region }}</n-descriptions-item>
            <n-descriptions-item label="对应代理商">{{ currentMerchant.agentName || '无' }}</n-descriptions-item>
            <n-descriptions-item label="管理员账号">{{ currentMerchant.username || '-' }}</n-descriptions-item>
            <n-descriptions-item label="管理员密码">{{ currentMerchant.password ? '已设置' : '未设置' }}</n-descriptions-item>
            <n-descriptions-item label="旗下店铺">{{ currentMerchant.storeCount }} 家</n-descriptions-item>
            <n-descriptions-item label="会员总数">{{ currentMerchant.memberCount }} 人</n-descriptions-item>
            <n-descriptions-item label="上月营收">{{ currentMerchant.lastMonthRevenue }}</n-descriptions-item>
            <n-descriptions-item label="手续费率">{{ (currentMerchant.feeRate * 100).toFixed(1) }}%</n-descriptions-item>
            <n-descriptions-item label="商家状态">
              <n-tag :type="statusType(currentMerchant.status)" size="small">{{ statusLabel(currentMerchant.status) }}</n-tag>
            </n-descriptions-item>
            <n-descriptions-item label="创建时间" :span="2">{{ currentMerchant.createdAt }}</n-descriptions-item>
          </n-descriptions>
        </n-tab-pane>
        
        <n-tab-pane name="bank" tab="结算账户">
          <n-descriptions label-placement="left" :column="1" bordered v-if="currentMerchant.bankInfo">
            <n-descriptions-item label="资料状态">
              <n-tag :type="getReceiverProfileStatusTagType(getMerchantReceiverStatus(currentMerchant))" size="small">
                {{ getReceiverProfileStatusLabel(getMerchantReceiverStatus(currentMerchant)) }}
              </n-tag>
            </n-descriptions-item>
            <n-descriptions-item label="变更状态">
              <n-tag :type="getReceiverSettlementChangeStatusTagType(getMerchantSettlementChangeState(currentMerchant).status)" size="small">
                {{ getReceiverSettlementChangeStatusLabel(getMerchantSettlementChangeState(currentMerchant).status) }}
              </n-tag>
            </n-descriptions-item>
            <n-descriptions-item v-if="getMerchantSettlementChangeState(currentMerchant).remark" label="变更说明">
              {{ getMerchantSettlementChangeState(currentMerchant).remark }}
            </n-descriptions-item>
            <n-descriptions-item label="账户类型">对公账户</n-descriptions-item>
            <n-descriptions-item label="开户银行">{{ getBankDisplayName(currentMerchant.bankInfo.bankName) }}</n-descriptions-item>
            <n-descriptions-item label="银行卡号">{{ maskAccountNo(currentMerchant.bankInfo.cardNo) }}</n-descriptions-item>
            <n-descriptions-item label="开户主体">{{ currentMerchant.bankInfo.accountName }}</n-descriptions-item>
            <n-descriptions-item label="统一社会信用代码">{{ formatIDCard(currentMerchant.bankInfo.idCard) }}</n-descriptions-item>
            <n-descriptions-item label="营业执照号">{{ currentMerchant.bankInfo.licenseNo || '-' }}</n-descriptions-item>
            <n-descriptions-item label="营业执照名称">{{ currentMerchant.bankInfo.licenseName || '-' }}</n-descriptions-item>
            <n-descriptions-item label="法人姓名">{{ currentMerchant.bankInfo.legalPersonName || '-' }}</n-descriptions-item>
            <n-descriptions-item label="法人证件号">{{ formatIDCard(currentMerchant.bankInfo.legalPersonCertificateNo) }}</n-descriptions-item>
            <n-descriptions-item label="必传附件">{{ currentMerchant.bankInfo.attachmentsReady ? '已收齐' : '待补充' }}</n-descriptions-item>
            <n-descriptions-item label="附件文件">
              <div class="attachment-detail-list">
                <n-tag
                  v-for="item in getMerchantAttachmentDisplayList(currentMerchant)"
                  :key="item"
                  size="small"
                  :type="item === '待补充' ? 'warning' : 'success'"
                >
                  {{ item }}
                </n-tag>
              </div>
            </n-descriptions-item>
            <n-descriptions-item label="资料确认">{{ currentMerchant.bankInfo.profileConfirmed ? '已确认，结算账户不可自行修改' : '未确认' }}</n-descriptions-item>
          </n-descriptions>
          <n-empty v-else description="未绑定结算账户" />
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
import { useRouter } from 'vue-router'
import {
  NAlert, NButton, NDataTable, NTag, NSpace, NInput, NSelect, NModal,
  NForm, NFormItem, NRadioGroup, NRadio, NIcon, NDescriptions, NDescriptionsItem, 
  useMessage, type FormInst, type FormRules, NInputNumber, NTabs, NTabPane, NEmpty, NUpload
} from 'naive-ui'
import type { UploadFileInfo } from 'naive-ui'
import {
  SearchOutline, AddOutline, BusinessOutline, CheckmarkCircleOutline,
  TimeOutline, StorefrontOutline, CreateOutline, TrashOutline, EyeOutline
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

const bankOptions = bankNameOptions

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
  { title: '上月营收', key: 'lastMonthRevenue', width: 130, render: (row: any) => h('span', { style: 'font-weight: 600; color: #3B82F6;' }, row.lastMonthRevenue) },
  {
    title: '分账资料', key: 'receiverProfileStatus', width: 120,
    render(row: any) {
      const status = getMerchantReceiverStatus(row)
      return h(NTag, { type: getReceiverProfileStatusTagType(status), size: 'small', bordered: true }, () => getReceiverProfileStatusLabel(status))
    }
  },
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
    status: 'active', storeCount: 8, memberCount: 3280, monthRevenue: '¥156,800', lastMonthRevenue: '¥142,500', feeRate: 0.005, createdAt: '2023-06-01',
    bankInfo: { accountKind: 'public', bankName: 'ICBC', cardNo: '6222021234567890123', accountName: '恒然集团有限公司', idCard: '91440300MA5HR0001X', licenseNo: '91440300MA5HR0001X', licenseName: '恒然集团有限公司', legalPersonName: '陈总', legalPersonCertificateNo: '440301198001011234', attachmentsReady: true, profileConfirmed: true }
  },
  { 
    id: 2, name: '幻影星空', contact: '林总', phone: '13800001102', region: '广州', agentId: 3, agentName: '上海星际娱乐', 
    status: 'active', storeCount: 5, memberCount: 1890, monthRevenue: '¥98,500', lastMonthRevenue: '¥91,200', feeRate: 0.005, createdAt: '2023-07-15',
    bankInfo: { accountKind: 'public', bankName: 'CCB', cardNo: '6217001234567890', accountName: '幻影星空科技有限公司', idCard: '91440100MA5HY0002X', licenseNo: '91440100MA5HY0002X', licenseName: '幻影星空科技有限公司', legalPersonName: '林总', legalPersonCertificateNo: '440101198502021234', attachmentsReady: true, profileConfirmed: true }
  },
  { 
    id: 3, name: '利民街商家', contact: '张总', phone: '13800001103', region: '北京', agentId: 2, agentName: '北京梦想空间', 
    status: 'active', storeCount: 3, memberCount: 2150, monthRevenue: '¥112,000', lastMonthRevenue: '¥105,400', feeRate: 0.006, createdAt: '2023-08-20',
    bankInfo: null
  },
  { 
    id: 4, name: '党建馆集团', contact: '李总', phone: '13800001104', region: '成都', agentId: 4, agentName: '成都虚拟现实', 
    status: 'active', storeCount: 2, memberCount: 980, monthRevenue: '¥56,800', lastMonthRevenue: '¥52,300', feeRate: 0.005, createdAt: '2023-09-10',
    bankInfo: { accountKind: 'public', bankName: 'ABC', cardNo: '6228481234567890', accountName: '党建馆集团有限公司', idCard: '91510100MA5DJ0004X', licenseNo: '91510100MA5DJ0004X', licenseName: '党建馆集团有限公司', legalPersonName: '李总', legalPersonCertificateNo: '510102197801011234', attachmentsReady: true, profileConfirmed: true }
  },
  { 
    id: 5, name: '华东展厅', contact: '王总', phone: '13800001105', region: '上海', agentId: 3, agentName: '上海星际娱乐', 
    status: 'pending', storeCount: 4, memberCount: 1560, monthRevenue: '¥89,200', lastMonthRevenue: '¥82,700', feeRate: 0.005, createdAt: '2023-10-05',
    bankInfo: null
  },
  { 
    id: 6, name: '南山科创', contact: '赵总', phone: '13800001106', region: '深圳', agentId: 1, agentName: '深圳未来科技', 
    status: 'active', storeCount: 6, memberCount: 2450, monthRevenue: '¥134,600', lastMonthRevenue: '¥128,000', feeRate: 0.004, createdAt: '2023-11-01',
    bankInfo: { accountKind: 'public', bankName: 'CMB', cardNo: '6214831234567890', accountName: '南山科创有限公司', idCard: '91440300MA5NS0006X', licenseNo: '91440300MA5NS0006X', licenseName: '南山科创有限公司', legalPersonName: '赵总', legalPersonCertificateNo: '440303198503031234', attachmentsReady: false, profileConfirmed: false }
  },
  { 
    id: 7, name: '天河娱乐', contact: '孙总', phone: '13800001107', region: '广州', agentId: null, agentName: '', 
    status: 'inactive', storeCount: 1, memberCount: 560, monthRevenue: '¥12,300', lastMonthRevenue: '¥15,600', feeRate: 0.005, createdAt: '2023-12-10',
    bankInfo: null
  },
  { 
    id: 8, name: '钱塘体验中心', contact: '周总', phone: '13800001108', region: '杭州', agentId: null, agentName: '', 
    status: 'active', storeCount: 3, memberCount: 1120, monthRevenue: '¥67,800', lastMonthRevenue: '¥63,100', feeRate: 0.005, createdAt: '2024-01-08',
    bankInfo: { accountKind: 'public', bankName: 'BOC', cardNo: '6217851234567890', accountName: '钱塘体验中心有限公司', idCard: '91330100MA5QT0008X', licenseNo: '91330100MA5QT0008X', licenseName: '钱塘体验中心有限公司', legalPersonName: '周总', legalPersonCertificateNo: '330102198204041234', attachmentsReady: true, profileConfirmed: true }
  },
])

const pagination = { pageSize: 10 }

function parseRevenue(val: string): number {
  return parseInt(val.replace(/[¥,]/g, '')) || 0
}

const lastMonthRevenue = computed(() => {
  const sum = merchantData.value.reduce((acc, d) => acc + parseRevenue(d.lastMonthRevenue), 0)
  if (sum >= 1000) {
    return '¥' + (sum / 1000).toFixed(1) + 'K'
  }
  return '¥' + sum.toLocaleString()
})

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
const addReceiverAttachmentFiles = ref<Record<string, UploadFileInfo[]>>({})
const addForm = ref({ 
  name: '', contact: '', phone: '', region: '', agentId: null as number | null, 
  status: 'active', feeRate: 0.005,
  username: '', password: '',
  bankInfo: { accountKind: 'public', bankName: '', cardNo: '', accountName: '', idCard: '', licenseNo: '', licenseName: '', legalPersonName: '', legalPersonCertificateNo: '', attachmentsReady: false, profileConfirmed: false }
})
const addRules: FormRules = {
  name: { required: true, message: '请输入商家名称', trigger: 'blur' },
  contact: { required: true, message: '请输入联系人', trigger: 'blur' },
  phone: { required: true, message: '请输入联系电话', trigger: 'blur' },
  region: { required: true, message: '请选择负责区域', trigger: 'change' },
  username: { required: true, message: '请输入管理员账号', trigger: 'blur' },
  password: { required: true, message: '请输入管理员密码', trigger: 'blur' },
}

function handleAdd() {
  addFormRef.value?.validate((errors) => {
    if (errors) return
    const agentName = agentOptions.find(a => a.value === addForm.value.agentId)?.label || ''
    const bankInfo = addForm.value.bankInfo.bankName
      ? { ...addForm.value.bankInfo, attachmentNames: buildAttachmentNames(addReceiverAttachmentFiles.value) }
      : null
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
      lastMonthRevenue: '¥0',
      feeRate: addForm.value.feeRate,
      username: addForm.value.username,
      password: addForm.value.password,
      bankInfo,
      createdAt: new Date().toISOString().slice(0, 10),
    })
    message.success('商家新增成功')
    showAddModal.value = false
    addForm.value = { 
      name: '', contact: '', phone: '', region: '', agentId: null, 
      status: 'active', feeRate: 0.005,
      username: '', password: '',
      bankInfo: { accountKind: 'public', bankName: '', cardNo: '', accountName: '', idCard: '', licenseNo: '', licenseName: '', legalPersonName: '', legalPersonCertificateNo: '', attachmentsReady: false, profileConfirmed: false }
    }
    addReceiverAttachmentFiles.value = {}
  })
}

function getRequiredAttachmentNames(accountKind: string) {
  return ['法人身份证正面', '法人身份证反面', '银行卡', '营业执照']
}

function buildAttachmentNames(filesMap: Record<string, UploadFileInfo[]>) {
  return Object.entries(filesMap).flatMap(([type, files]) => files.map((file) => `${type}：${file.name}`))
}

function getAddReceiverAttachmentFiles(type: string) {
  return addReceiverAttachmentFiles.value[type] || []
}

function refreshAddReceiverAttachmentStatus() {
  addForm.value.bankInfo.attachmentsReady = getRequiredAttachmentNames(addForm.value.bankInfo.accountKind).every((type) => Boolean(addReceiverAttachmentFiles.value[type]?.length))
}

function handleAddReceiverAttachmentFiles(type: string, files: UploadFileInfo[]) {
  addReceiverAttachmentFiles.value[type] = files.slice(0, 1)
  refreshAddReceiverAttachmentStatus()
}

// 编辑
const showEditModal = ref(false)
const currentMerchant = ref<any>(null)
const editReceiverAttachmentFiles = ref<Record<string, UploadFileInfo[]>>({})
const editSettlementLocked = computed(() => isMerchantSettlementLocked(currentMerchant.value))
const settlementDraftMode = ref(false)
const settlementFieldsReadonly = computed(() => editSettlementLocked.value && !settlementDraftMode.value)
const editForm = ref({ 
  name: '', contact: '', phone: '', region: '', agentId: null as number | null, 
  status: 'active', feeRate: 0.005,
  bankInfo: { accountKind: 'public', bankName: '', cardNo: '', accountName: '', idCard: '', licenseNo: '', licenseName: '', legalPersonName: '', legalPersonCertificateNo: '', attachmentsReady: false, profileConfirmed: false }
})

function openEdit(row: any) {
  currentMerchant.value = row
  settlementDraftMode.value = false
  const bankInfo = row.bankInfo?.pendingSettlementDraft || row.bankInfo
  editForm.value = { 
    ...row,
    bankInfo: bankInfo ? { accountKind: 'public', attachmentsReady: false, profileConfirmed: false, ...bankInfo } : { accountKind: 'public', bankName: '', cardNo: '', accountName: '', idCard: '', licenseNo: '', licenseName: '', legalPersonName: '', legalPersonCertificateNo: '', attachmentsReady: false, profileConfirmed: false }
  }
  editReceiverAttachmentFiles.value = parseAttachmentNames(bankInfo?.attachmentNames || [])
  if (!isMerchantSettlementLocked(row)) {
    refreshEditReceiverAttachmentStatus()
  }
  showEditModal.value = true
}

function parseAttachmentNames(names: string[]) {
  return names.reduce((acc, item) => {
    const [type, name] = item.includes('：') ? item.split('：') : ['其他资料', item]
    acc[type] = [{ id: item, name, status: 'finished' }]
    return acc
  }, {} as Record<string, UploadFileInfo[]>)
}

function getEditReceiverAttachmentFiles(type: string) {
  return editReceiverAttachmentFiles.value[type] || []
}

function refreshEditReceiverAttachmentStatus() {
  editForm.value.bankInfo.attachmentsReady = getRequiredAttachmentNames(editForm.value.bankInfo.accountKind).every((type) => Boolean(editReceiverAttachmentFiles.value[type]?.length))
}

function handleEditReceiverAttachmentFiles(type: string, files: UploadFileInfo[]) {
  editReceiverAttachmentFiles.value[type] = files.slice(0, 1)
  refreshEditReceiverAttachmentStatus()
}

function handleEdit() {
  if (!currentMerchant.value) return
  const idx = merchantData.value.findIndex(d => d.id === currentMerchant.value.id)
  if (idx !== -1) {
    const agentName = agentOptions.find(a => a.value === editForm.value.agentId)?.label || ''
    let bankInfo = currentMerchant.value.bankInfo
    if (editSettlementLocked.value && settlementDraftMode.value) {
      const { pendingSettlementDraft: _pendingSettlementDraft, ...draftSource } = editForm.value.bankInfo as any
      bankInfo = {
        ...currentMerchant.value.bankInfo,
        pendingSettlementDraft: {
          ...draftSource,
          attachmentNames: buildAttachmentNames(editReceiverAttachmentFiles.value),
          draftStatus: 'draft',
        },
      }
    } else if (!editSettlementLocked.value) {
      bankInfo = editForm.value.bankInfo.bankName
        ? { ...editForm.value.bankInfo, attachmentNames: buildAttachmentNames(editReceiverAttachmentFiles.value) }
        : null
    }
    merchantData.value[idx] = { 
      ...merchantData.value[idx], 
      ...editForm.value, 
      agentName,
      bankInfo
    }
    message.success(settlementDraftMode.value ? '结算账户变更草稿已保存，当前生效资料未覆盖' : '商家信息已更新')
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

function getMerchantReceiverStatus(merchant: any) {
  const bankInfo = merchant.bankInfo
  return getReceiverProfileStatus(bankInfo ? {
    accountKind: bankInfo.accountKind || 'public',
    accountName: bankInfo.accountName,
    accountNo: bankInfo.cardNo,
    bankName: bankInfo.bankName,
    certificateNo: bankInfo.idCard,
    contactMobile: merchant.phone,
    licenseNo: bankInfo.licenseNo,
    licenseName: bankInfo.licenseName,
    legalPersonName: bankInfo.legalPersonName,
    legalPersonCertificateNo: bankInfo.legalPersonCertificateNo,
    attachmentsReady: bankInfo.attachmentsReady,
    profileConfirmed: bankInfo.profileConfirmed,
    receiverStatus: bankInfo.receiverStatus,
  } : null)
}

function getMerchantAttachmentDisplayList(merchant: any) {
  const bankInfo = merchant.bankInfo || {}
  return getReceiverAttachmentDisplayList(bankInfo.attachmentNames, bankInfo.accountKind || 'public', merchant.name, bankInfo.attachmentsReady)
}

function getMerchantSettlementChangeState(merchant: any) {
  const storageKey = getReceiverSettlementChangeStorageKey('merchant', merchant.name)
  const saved = localStorage.getItem(storageKey)
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      localStorage.removeItem(storageKey)
    }
  }
  const draftStatus = merchant.bankInfo?.pendingSettlementDraft?.draftStatus
  return {
    status: draftStatus || 'none',
    remark: draftStatus ? '已保存结算账户变更草稿，尚未提交拉卡拉审核' : '',
  }
}

function isMerchantSettlementLocked(merchant: any) {
  const bankInfo = merchant?.bankInfo
  return Boolean(
    bankInfo?.profileConfirmed
    || ['reviewing', 'active', 'supplement'].includes(bankInfo?.receiverStatus)
  )
}

function startMerchantSettlementDraft() {
  if (!currentMerchant.value?.bankInfo) return
  settlementDraftMode.value = true
  const draft = currentMerchant.value.bankInfo.pendingSettlementDraft || currentMerchant.value.bankInfo
  editForm.value.bankInfo = { accountKind: 'public', attachmentsReady: false, profileConfirmed: false, ...draft }
  editReceiverAttachmentFiles.value = parseAttachmentNames(draft.attachmentNames || [])
}

function goReceiverChangeFromMerchant() {
  if (!currentMerchant.value) return
  if (isMerchantSettlementLocked(currentMerchant.value) && !currentMerchant.value.bankInfo?.pendingSettlementDraft) {
    message.warning('请先填写并保存结算账户变更草稿，再提交拉卡拉变更申请')
    return
  }
  showEditModal.value = false
  router.push({
    path: '/platform/finance/lakala-merchant-split',
    query: {
      receiverOwnerType: 'merchant',
      receiverOwnerId: String(currentMerchant.value.id),
      receiverOwnerName: currentMerchant.value.name,
      action: 'receiver-change',
    },
  })
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

.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: white; border-radius: 14px; padding: 20px; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 16px; }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-content { display: flex; flex-direction: column; }
.stat-content .label { font-size: 12px; color: var(--text-muted); }
.stat-content .value { font-family: 'Orbitron', sans-serif; font-size: 22px; font-weight: 700; color: var(--text-primary); }
.stat-content .value.warning { color: #F59E0B; }

.content-card { background: white; border-radius: 16px; padding: 24px; border: 1px solid var(--border-color); }
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
