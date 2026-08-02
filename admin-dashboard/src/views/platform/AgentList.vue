<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>代理商管理</h1>
        <p class="header-desc">管理区域代理商及其下属店铺</p>
      </div>
      <n-space>
        <n-input v-model:value="searchText" placeholder="搜索代理商名称..." size="small" style="width: 200px;">
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
        <n-cascader v-model:value="regionFilter" :options="regionCascaderOptions" placeholder="筛选省/城市" clearable size="small" style="width: 180px;" :check-strategy="'child'" />
        <n-button type="primary" @click="openAdd">
          <template #icon><n-icon :component="AddOutline" /></template> 新增代理商
        </n-button>
      </n-space>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="PeopleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">代理商总数</span>
          <span class="value">28</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="StorefrontOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">管辖店铺</span>
          <span class="value">156</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="TrendingUpOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">上月分润</span>
          <span class="value">¥128,560</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
          <n-icon :component="LocationOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">覆盖区域</span>
          <span class="value">15</span>
        </div>
      </div>
    </div>

    <div class="content-card">
      <n-data-table :columns="columns" :data="filteredData" :pagination="pagination" striped />
    </div>

    <!-- 新增代理商弹窗 -->
    <n-modal :show="showAddModal" @update:show="(val: boolean) => showAddModal = val" preset="card" title="新增代理商" class="entity-manage-modal" style="width: 680px;" :bordered="false">
      <n-form ref="addFormRef" :model="addForm" :rules="addRules" label-placement="left" label-width="100">
        <n-tabs type="line">
          <n-tab-pane name="basic" tab="基本信息">
            <n-form-item label="代理商名称" path="name">
              <n-input v-model:value="addForm.name" placeholder="请输入代理商名称" />
            </n-form-item>
            <n-form-item label="联系人" path="contact">
              <n-input v-model:value="addForm.contact" placeholder="请输入联系人姓名" />
            </n-form-item>
            <n-form-item label="联系电话" path="phone">
              <n-input v-model:value="addForm.phone" placeholder="请输入联系电话" />
            </n-form-item>
            <n-form-item label="省/城市" path="region">
              <n-cascader v-model:value="addRegionPath" :options="regionCascaderOptions" placeholder="请选择省/城市" />
            </n-form-item>
            <n-form-item label="分润比例">
              <n-input-number v-model:value="addForm.commissionRate" :min="0" :max="50" style="width: 200px;" />
              <span style="margin-left: 8px; color: var(--text-muted);">（%，按扣除供应商成本后的采购额计算分润）</span>
            </n-form-item>
            <n-form-item label="手续费率">
              <n-input-number v-model:value="addForm.feeRate" :min="0" :max="1" :step="0.001" :precision="3" style="width: 200px;" />
              <span style="margin-left: 8px; color: var(--text-muted);">（例：0.005 = 0.5%，提现时扣除）</span>
            </n-form-item>
            <n-form-item label="代理商状态" path="status">
              <n-radio-group v-model:value="addForm.status">
                <n-radio value="active">正常</n-radio>
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
              这里维护拉卡拉“分账接收方”的结算账户和附件资料。请一次确认准确，提交拉卡拉后仅结算资料不可自行修改，确需变更由运营后台处理。
            </n-alert>
            <n-form-item label="账户类型">
              <n-radio-group v-model:value="addForm.accountKind" @update:value="refreshAddReceiverAttachmentStatus">
                <n-radio value="private">对私账户</n-radio>
                <n-radio value="public">对公账户</n-radio>
              </n-radio-group>
            </n-form-item>
            <n-form-item label="开户银行">
              <n-select v-model:value="addForm.bankName" :options="bankOptions" placeholder="请选择开户银行" />
            </n-form-item>
            <n-form-item label="银行卡号">
              <n-input v-model:value="addForm.cardNo" placeholder="请输入银行卡号" maxlength="23" />
            </n-form-item>
            <n-form-item label="开户人姓名">
              <n-input v-model:value="addForm.accountName" placeholder="请输入开户人姓名（需与身份证一致）" />
            </n-form-item>
            <n-form-item label="身份证号">
              <n-input v-model:value="addForm.idCard" placeholder="请输入身份证号" maxlength="18" />
            </n-form-item>
            <template v-if="addForm.accountKind === 'public'">
              <n-form-item label="营业执照号">
                <n-input v-model:value="addForm.licenseNo" placeholder="请输入营业执照号码" />
              </n-form-item>
              <n-form-item label="营业执照名称">
                <n-input v-model:value="addForm.licenseName" placeholder="请输入营业执照名称" />
              </n-form-item>
              <n-form-item label="法人姓名">
                <n-input v-model:value="addForm.legalPersonName" placeholder="请输入法人姓名" />
              </n-form-item>
              <n-form-item label="法人证件号">
                <n-input v-model:value="addForm.legalPersonCertificateNo" placeholder="请输入法人身份证号" maxlength="18" />
              </n-form-item>
            </template>
            <n-form-item label="附件状态">
              <n-tag :type="addForm.attachmentsReady ? 'success' : 'warning'" size="small">
                {{ addForm.attachmentsReady ? '已收齐' : '待补充' }}
              </n-tag>
            </n-form-item>
            <n-form-item label="分项附件">
              <div class="receiver-attachment-list">
                <div v-for="item in getRequiredAttachmentNames(addForm.accountKind)" :key="item" class="receiver-attachment-row">
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
              <n-radio-group v-model:value="addForm.profileConfirmed">
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

    <!-- 编辑代理商弹窗 -->
    <n-modal v-model:show="showEditModal" preset="card" title="编辑代理商" class="entity-manage-modal" style="width: 680px;" :bordered="false">
      <n-tabs v-if="currentAgent" type="line">
        <n-tab-pane name="basic" tab="基本信息">
          <n-form label-placement="left" label-width="100">
            <n-form-item label="代理商名称">
              <n-input v-model:value="editForm.name" />
            </n-form-item>
            <n-form-item label="联系人">
              <n-input v-model:value="editForm.contact" />
            </n-form-item>
            <n-form-item label="联系电话">
              <n-input v-model:value="editForm.phone" />
            </n-form-item>
            <n-form-item label="省/城市">
              <n-cascader v-model:value="editRegionPath" :options="regionCascaderOptions" />
            </n-form-item>
            <n-form-item label="分润比例">
              <n-input-number v-model:value="editForm.commissionRate" :min="0" :max="50" style="width: 200px;" />
              <span style="margin-left: 8px; color: var(--text-muted);">（%，按扣除供应商成本后的采购额计算分润）</span>
            </n-form-item>
            <n-form-item label="手续费率">
              <n-input-number v-model:value="editForm.feeRate" :min="0" :max="1" :step="0.001" :precision="3" style="width: 200px;" />
              <span style="margin-left: 8px; color: var(--text-muted);">（例：0.005 = 0.5%，提现时扣除）</span>
            </n-form-item>
            <n-form-item label="代理商状态">
              <n-radio-group v-model:value="editForm.status">
                <n-radio value="active">正常</n-radio>
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
                  ? '该结算账户和附件资料已确认或已提交拉卡拉接收方申请，不能直接修改；基本信息、状态、分润比例和手续费率等基础数据仍可编辑。确需变更结算资料，请到接收方与分账关系发起信息变更申请。'
                  : '这里仅维护结算账户和附件资料；确认后将作为拉卡拉分账接收方资料，后续变更需走申请。'
              }}
              <n-space v-if="editSettlementLocked" inline class="inline-action">
                <n-button size="tiny" secondary type="warning" @click="startAgentSettlementDraft">
                  {{ settlementDraftMode ? '正在填写草稿' : '填写变更草稿' }}
                </n-button>
                <n-button size="tiny" secondary type="primary" @click="goReceiverChangeFromAgent">
                  去提交变更申请
                </n-button>
              </n-space>
            </n-alert>
            <n-form-item label="账户类型">
              <n-radio-group v-model:value="editForm.accountKind" :disabled="settlementFieldsReadonly" @update:value="refreshEditReceiverAttachmentStatus">
                <n-radio value="private">对私账户</n-radio>
                <n-radio value="public">对公账户</n-radio>
              </n-radio-group>
            </n-form-item>
            <n-form-item label="开户银行">
              <n-select v-model:value="editForm.bankName" :options="bankOptions" :disabled="settlementFieldsReadonly" placeholder="请选择开户银行" />
            </n-form-item>
            <n-form-item label="银行卡号">
              <n-input v-model:value="editForm.cardNo" :disabled="settlementFieldsReadonly" placeholder="请输入银行卡号" maxlength="23" />
            </n-form-item>
            <n-form-item label="开户人姓名">
              <n-input v-model:value="editForm.accountName" :disabled="settlementFieldsReadonly" placeholder="请输入开户人姓名" />
            </n-form-item>
            <n-form-item label="身份证号">
              <n-input v-model:value="editForm.idCard" :disabled="settlementFieldsReadonly" placeholder="请输入身份证号" maxlength="18" />
            </n-form-item>
            <template v-if="editForm.accountKind === 'public'">
              <n-form-item label="营业执照号">
                <n-input v-model:value="editForm.licenseNo" :disabled="settlementFieldsReadonly" placeholder="请输入营业执照号码" />
              </n-form-item>
              <n-form-item label="营业执照名称">
                <n-input v-model:value="editForm.licenseName" :disabled="settlementFieldsReadonly" placeholder="请输入营业执照名称" />
              </n-form-item>
              <n-form-item label="法人姓名">
                <n-input v-model:value="editForm.legalPersonName" :disabled="settlementFieldsReadonly" placeholder="请输入法人姓名" />
              </n-form-item>
              <n-form-item label="法人证件号">
                <n-input v-model:value="editForm.legalPersonCertificateNo" :disabled="settlementFieldsReadonly" placeholder="请输入法人身份证号" maxlength="18" />
              </n-form-item>
            </template>
            <n-form-item label="附件状态">
              <n-tag :type="editForm.attachmentsReady ? 'success' : 'warning'" size="small">
                {{ editForm.attachmentsReady ? '已收齐' : '待补充' }}
              </n-tag>
            </n-form-item>
            <n-form-item label="分项附件">
              <div class="receiver-attachment-list">
                <div v-for="item in getRequiredAttachmentNames(editForm.accountKind)" :key="item" class="receiver-attachment-row">
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
              <n-radio-group v-model:value="editForm.profileConfirmed" :disabled="settlementFieldsReadonly">
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
    <n-modal :show="showDetailModal" @update:show="(val: boolean) => showDetailModal = val" preset="card" title="代理商详情" class="entity-manage-modal" style="width: 720px;" :bordered="false">
      <n-tabs v-if="currentAgent" type="line">
        <n-tab-pane name="basic" tab="基本信息">
          <n-descriptions label-placement="left" :column="2" bordered>
            <n-descriptions-item label="代理商名称">{{ currentAgent.name }}</n-descriptions-item>
            <n-descriptions-item label="代理商ID">AG{{ String(currentAgent.id).padStart(4, '0') }}</n-descriptions-item>
            <n-descriptions-item label="联系人">{{ currentAgent.contact }}</n-descriptions-item>
            <n-descriptions-item label="联系电话">{{ currentAgent.phone }}</n-descriptions-item>
            <n-descriptions-item label="省/城市">{{ currentAgent.region || '-' }}</n-descriptions-item>
            <n-descriptions-item label="分润比例">{{ currentAgent.commissionRate }}%</n-descriptions-item>
            <n-descriptions-item label="手续费率">{{ (currentAgent.feeRate * 100).toFixed(1) }}%</n-descriptions-item>
            <n-descriptions-item label="旗下商家">{{ currentAgent.merchantCount }} 家</n-descriptions-item>
            <n-descriptions-item label="管辖店铺">{{ currentAgent.storeCount }} 家</n-descriptions-item>
            <n-descriptions-item label="本月游戏豆充值">{{ currentAgent.monthRecharge }}</n-descriptions-item>
            <n-descriptions-item label="上月分润">{{ currentAgent.monthCommission }}</n-descriptions-item>
            <n-descriptions-item label="状态">
              <n-tag :type="currentAgent.status === 'active' ? 'success' : 'default'" size="small">
                {{ currentAgent.status === 'active' ? '正常' : '停用' }}
              </n-tag>
            </n-descriptions-item>
            <n-descriptions-item label="创建时间" :span="2">{{ currentAgent.createdAt }}</n-descriptions-item>
          </n-descriptions>
        </n-tab-pane>

        <n-tab-pane name="bank" tab="结算账户">
          <n-descriptions label-placement="left" :column="1" bordered v-if="currentAgent.bankName && currentAgent.cardNo">
            <n-descriptions-item label="资料状态">
              <n-tag :type="getReceiverProfileStatusTagType(getAgentReceiverStatus(currentAgent))" size="small">
                {{ getReceiverProfileStatusLabel(getAgentReceiverStatus(currentAgent)) }}
              </n-tag>
            </n-descriptions-item>
            <n-descriptions-item label="变更状态">
              <n-tag :type="getReceiverSettlementChangeStatusTagType(getAgentSettlementChangeState(currentAgent).status)" size="small">
                {{ getReceiverSettlementChangeStatusLabel(getAgentSettlementChangeState(currentAgent).status) }}
              </n-tag>
            </n-descriptions-item>
            <n-descriptions-item v-if="getAgentSettlementChangeState(currentAgent).remark" label="变更说明">
              {{ getAgentSettlementChangeState(currentAgent).remark }}
            </n-descriptions-item>
            <n-descriptions-item label="账户类型">{{ currentAgent.accountKind === 'public' ? '对公账户' : '对私账户' }}</n-descriptions-item>
            <n-descriptions-item label="开户银行">{{ getBankNameText(currentAgent.bankName) }}</n-descriptions-item>
            <n-descriptions-item label="银行卡号">{{ maskAccountNo(currentAgent.cardNo) }}</n-descriptions-item>
            <n-descriptions-item label="开户人姓名">{{ currentAgent.accountName }}</n-descriptions-item>
            <n-descriptions-item label="身份证号">{{ formatIDCard(currentAgent.idCard) }}</n-descriptions-item>
            <n-descriptions-item v-if="currentAgent.accountKind === 'public'" label="营业执照号">{{ currentAgent.licenseNo || '-' }}</n-descriptions-item>
            <n-descriptions-item v-if="currentAgent.accountKind === 'public'" label="营业执照名称">{{ currentAgent.licenseName || '-' }}</n-descriptions-item>
            <n-descriptions-item v-if="currentAgent.accountKind === 'public'" label="法人姓名">{{ currentAgent.legalPersonName || '-' }}</n-descriptions-item>
            <n-descriptions-item v-if="currentAgent.accountKind === 'public'" label="法人证件号">{{ formatIDCard(currentAgent.legalPersonCertificateNo) }}</n-descriptions-item>
            <n-descriptions-item label="必传附件">
              {{ currentAgent.attachmentsReady ? '已收齐' : '待补充' }}
            </n-descriptions-item>
            <n-descriptions-item label="附件文件">
              <div class="attachment-detail-list">
                <n-tag
                  v-for="item in getAgentAttachmentDisplayList(currentAgent)"
                  :key="item"
                  size="small"
                  :type="item === '待补充' ? 'warning' : 'success'"
                >
                  {{ item }}
                </n-tag>
              </div>
            </n-descriptions-item>
            <n-descriptions-item label="资料确认">
              {{ currentAgent.profileConfirmed ? '已确认，结算账户不可自行修改' : '未确认' }}
            </n-descriptions-item>
          </n-descriptions>
          <n-empty v-else description="该代理商尚未绑定结算账户" />
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
import { ref, computed, h, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import {
  NAlert, NButton, NDataTable, NTag, NSpace, NInput, NSelect, NModal,
  NForm, NFormItem, NRadioGroup, NRadio, NIcon, NDescriptions, NDescriptionsItem,
  useMessage, type FormInst, type FormRules, NInputNumber, NTabs, NTabPane, NEmpty, NCascader, NUpload
} from 'naive-ui'
import type { UploadFileInfo } from 'naive-ui'
import {
  SearchOutline, AddOutline, PeopleOutline, StorefrontOutline,
  TrendingUpOutline, LocationOutline, EyeOutline, CreateOutline,
  TrashOutline, InformationCircleOutline
} from '@vicons/ionicons5'
import { useDialog } from 'naive-ui'
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
const dialog = useDialog()
const searchText = ref('')
const regionFilter = ref<string[]>([])

const regionCascaderOptions = [
  { label: '北京市', value: '北京市' },
  { label: '天津市', value: '天津市' },
  { label: '上海市', value: '上海市' },
  { label: '重庆市', value: '重庆市' },
  { label: '广东省', value: '广东省', children: [
    { label: '广州市', value: '广州市' }, { label: '深圳市', value: '深圳市' }, { label: '东莞市', value: '东莞市' }, { label: '佛山市', value: '佛山市' },
    { label: '珠海市', value: '珠海市' }, { label: '中山市', value: '中山市' }, { label: '惠州市', value: '惠州市' },
  ]},
  { label: '浙江省', value: '浙江省', children: [
    { label: '杭州市', value: '杭州市' }, { label: '宁波市', value: '宁波市' }, { label: '温州市', value: '温州市' }, { label: '嘉兴市', value: '嘉兴市' },
    { label: '绍兴市', value: '绍兴市' }, { label: '金华市', value: '金华市' },
  ]},
  { label: '江苏省', value: '江苏省', children: [
    { label: '南京市', value: '南京市' }, { label: '苏州市', value: '苏州市' }, { label: '无锡市', value: '无锡市' }, { label: '常州市', value: '常州市' },
    { label: '南通市', value: '南通市' }, { label: '徐州市', value: '徐州市' },
  ]},
  { label: '山东省', value: '山东省', children: [
    { label: '济南市', value: '济南市' }, { label: '青岛市', value: '青岛市' }, { label: '烟台市', value: '烟台市' }, { label: '潍坊市', value: '潍坊市' },
  ]},
  { label: '四川省', value: '四川省', children: [
    { label: '成都市', value: '成都市' }, { label: '绵阳市', value: '绵阳市' }, { label: '德阳市', value: '德阳市' }, { label: '宜宾市', value: '宜宾市' },
  ]},
  { label: '湖北省', value: '湖北省', children: [
    { label: '武汉市', value: '武汉市' }, { label: '宜昌市', value: '宜昌市' }, { label: '襄阳市', value: '襄阳市' }, { label: '荆州市', value: '荆州市' },
  ]},
  { label: '湖南省', value: '湖南省', children: [
    { label: '长沙市', value: '长沙市' }, { label: '株洲市', value: '株洲市' }, { label: '湘潭市', value: '湘潭市' }, { label: '衡阳市', value: '衡阳市' },
  ]},
  { label: '福建省', value: '福建省', children: [
    { label: '福州市', value: '福州市' }, { label: '厦门市', value: '厦门市' }, { label: '泉州市', value: '泉州市' }, { label: '漳州市', value: '漳州市' },
  ]},
  { label: '河南省', value: '河南省', children: [
    { label: '郑州市', value: '郑州市' }, { label: '洛阳市', value: '洛阳市' }, { label: '开封市', value: '开封市' }, { label: '南阳市', value: '南阳市' },
  ]},
  { label: '河北省', value: '河北省', children: [
    { label: '石家庄市', value: '石家庄市' }, { label: '唐山市', value: '唐山市' }, { label: '保定市', value: '保定市' }, { label: '廊坊市', value: '廊坊市' },
  ]},
  { label: '安徽省', value: '安徽省', children: [
    { label: '合肥市', value: '合肥市' }, { label: '芜湖市', value: '芜湖市' }, { label: '蚌埠市', value: '蚌埠市' }, { label: '安庆市', value: '安庆市' },
  ]},
  { label: '辽宁省', value: '辽宁省', children: [
    { label: '沈阳市', value: '沈阳市' }, { label: '大连市', value: '大连市' }, { label: '鞍山市', value: '鞍山市' }, { label: '抚顺市', value: '抚顺市' },
  ]},
  { label: '陕西省', value: '陕西省', children: [
    { label: '西安市', value: '西安市' }, { label: '咸阳市', value: '咸阳市' }, { label: '宝鸡市', value: '宝鸡市' }, { label: '渭南市', value: '渭南市' },
  ]},
  { label: '江西省', value: '江西省', children: [
    { label: '南昌市', value: '南昌市' }, { label: '九江市', value: '九江市' }, { label: '赣州市', value: '赣州市' },
  ]},
  { label: '山西省', value: '山西省', children: [
    { label: '太原市', value: '太原市' }, { label: '大同市', value: '大同市' }, { label: '运城市', value: '运城市' },
  ]},
  { label: '云南省', value: '云南省', children: [
    { label: '昆明市', value: '昆明市' }, { label: '大理市', value: '大理市' }, { label: '丽江市', value: '丽江市' },
  ]},
  { label: '贵州省', value: '贵州省', children: [
    { label: '贵阳市', value: '贵阳市' }, { label: '遵义市', value: '遵义市' }, { label: '六盘水市', value: '六盘水市' },
  ]},
  { label: '黑龙江省', value: '黑龙江省', children: [
    { label: '哈尔滨市', value: '哈尔滨市' }, { label: '齐齐哈尔市', value: '齐齐哈尔市' }, { label: '大庆市', value: '大庆市' },
  ]},
  { label: '吉林省', value: '吉林省', children: [
    { label: '长春市', value: '长春市' }, { label: '吉林市', value: '吉林市' }, { label: '延边朝鲜族自治州', value: '延边朝鲜族自治州' },
  ]},
  { label: '海南省', value: '海南省', children: [
    { label: '海口市', value: '海口市' }, { label: '三亚市', value: '三亚市' }, { label: '儋州市', value: '儋州市' },
  ]},
  { label: '甘肃省', value: '甘肃省', children: [
    { label: '兰州市', value: '兰州市' }, { label: '天水市', value: '天水市' }, { label: '酒泉市', value: '酒泉市' },
  ]},
  { label: '青海省', value: '青海省', children: [
    { label: '西宁市', value: '西宁市' }, { label: '海东市', value: '海东市' },
  ]},
  { label: '广西壮族自治区', value: '广西壮族自治区', children: [
    { label: '南宁市', value: '南宁市' }, { label: '桂林市', value: '桂林市' }, { label: '柳州市', value: '柳州市' },
  ]},
  { label: '内蒙古自治区', value: '内蒙古自治区', children: [
    { label: '呼和浩特市', value: '呼和浩特市' }, { label: '包头市', value: '包头市' }, { label: '鄂尔多斯市', value: '鄂尔多斯市' },
  ]},
  { label: '宁夏回族自治区', value: '宁夏回族自治区', children: [
    { label: '银川市', value: '银川市' }, { label: '石嘴山市', value: '石嘴山市' },
  ]},
  { label: '新疆维吾尔自治区', value: '新疆维吾尔自治区', children: [
    { label: '乌鲁木齐市', value: '乌鲁木齐市' }, { label: '克拉玛依市', value: '克拉玛依市' },
  ]},
  { label: '西藏自治区', value: '西藏自治区', children: [
    { label: '拉萨市', value: '拉萨市' }, { label: '日喀则市', value: '日喀则市' },
  ]},
]

// Helper: join path array to display string
function joinRegionPath(path: string[]): string {
  return path.length ? path.join(' / ') : ''
}

// Cascader path refs for forms
const addRegionPath = ref<string[]>([])
const editRegionPath = ref<string[]>([])

const bankOptions = bankNameOptions

const columns = [
  { title: '代理商名称', key: 'name', width: 180 },
  { title: '联系人', key: 'contact', width: 100 },
  { title: '联系电话', key: 'phone', width: 130 },
  { title: '省/城市', key: 'region', width: 140 },
  { title: '旗下商家', key: 'merchantCount', width: 100 },
  { title: '分润比例', key: 'commissionRate', width: 100, render: (row: any) => `${row.commissionRate}%` },
  { title: '手续费率', key: 'feeRate', width: 90, render: (row: any) => `${(row.feeRate * 100).toFixed(1)}%` },
  { title: '管辖店铺', key: 'storeCount', width: 100 },
  { title: '本月游戏豆充值', key: 'monthRecharge', width: 150 },
  { title: '上月分润', key: 'monthCommission', width: 120 },
  {
    title: '状态',
    key: 'status',
    width: 90,
    render(row: any) {
      return h(NTag, { type: row.status === 'active' ? 'success' : 'default', size: 'small', bordered: true }, () => row.status === 'active' ? '正常' : '停用')
    }
  },
  { title: '分账资料', key: 'receiverProfileStatus', width: 120, render(row: any) {
    const status = getAgentReceiverStatus(row)
    return h(NTag, { type: getReceiverProfileStatusTagType(status), size: 'small', bordered: true }, () => getReceiverProfileStatusLabel(status))
  }},
  { title: '创建时间', key: 'createdAt', width: 120 },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    fixed: 'right',
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

const agentData = ref([
  { id: 1, name: '深圳未来科技', contact: '张伟', phone: '13800138001', region: '广东省 / 深圳市', commissionRate: 15, feeRate: 0.005, merchantCount: 5, storeCount: 36, monthRecharge: '¥856,200', monthCommission: '¥128,430', status: 'active', createdAt: '2023-06-01', accountKind: 'private', bankName: 'ICBC', cardNo: '6222021234567890123', accountName: '张伟', idCard: '440301199001011234', attachmentsReady: true, profileConfirmed: true },
  { id: 2, name: '北京梦想空间', contact: '李娜', phone: '13800138002', region: '北京市', commissionRate: 12, feeRate: 0.005, merchantCount: 3, storeCount: 8, monthRecharge: '¥623,400', monthCommission: '¥74,808', status: 'active', createdAt: '2023-07-15', accountKind: 'private', bankName: 'CCB', cardNo: '6227001234567890123', accountName: '李娜', idCard: '110101199002022345', attachmentsReady: true, profileConfirmed: true },
  { id: 3, name: '上海星际娱乐', contact: '王强', phone: '13800138003', region: '上海市', commissionRate: 18, feeRate: 0.006, merchantCount: 5, storeCount: 15, monthRecharge: '¥1,056,800', monthCommission: '¥190,224', status: 'active', createdAt: '2023-08-20', accountKind: 'private', bankName: '', cardNo: '', accountName: '', idCard: '', attachmentsReady: false, profileConfirmed: false },
  { id: 4, name: '成都虚拟现实', contact: '赵敏', phone: '13800138004', region: '四川省 / 成都市', commissionRate: 10, feeRate: 0.004, merchantCount: 2, storeCount: 6, monthRecharge: '¥312,500', monthCommission: '¥31,250', status: 'active', createdAt: '2023-09-10', accountKind: 'private', bankName: 'ABC', cardNo: '6228481234567890123', accountName: '赵敏', idCard: '510104199003033456', attachmentsReady: true, profileConfirmed: true },
  { id: 5, name: '武汉创新体验', contact: '刘洋', phone: '13800138005', region: '湖北省 / 武汉市', commissionRate: 14, feeRate: 0.005, merchantCount: 2, storeCount: 9, monthRecharge: '¥445,600', monthCommission: '¥62,384', status: 'inactive', createdAt: '2023-10-05', accountKind: 'private', bankName: '', cardNo: '', accountName: '', idCard: '', attachmentsReady: false, profileConfirmed: false },
])

const pagination = { pageSize: 10 }

const filteredData = computed(() => {
  let data = [...agentData.value]
  if (searchText.value) {
    const kw = searchText.value.toLowerCase()
    data = data.filter(d => d.name.toLowerCase().includes(kw) || d.contact.toLowerCase().includes(kw))
  }
  if (regionFilter.value.length > 0) {
    const filterStr = regionFilter.value.join(' / ')
    data = data.filter(d => d.region.startsWith(filterStr))
  }
  return data
})

function formatCardNo(cardNo: string) {
  if (!cardNo) return ''
  return cardNo.replace(/(\d{4})(?=\d)/g, '$1 ')
}

function formatIDCard(idCard: string) {
  if (!idCard) return ''
  return idCard.replace(/(\d{4})\d+(\d{4})/, '$1**********$2')
}

function getBankNameText(bankCode: string) {
  return getBankDisplayName(bankCode)
}

function getAgentReceiverStatus(agent: any) {
  return getReceiverProfileStatus({
    accountKind: agent.accountKind || 'private',
    accountName: agent.accountName,
    accountNo: agent.cardNo,
    bankName: agent.bankName,
    certificateNo: agent.idCard,
    contactMobile: agent.phone,
    licenseNo: agent.licenseNo,
    licenseName: agent.licenseName,
    legalPersonName: agent.legalPersonName,
    legalPersonCertificateNo: agent.legalPersonCertificateNo,
    attachmentsReady: agent.attachmentsReady,
    profileConfirmed: agent.profileConfirmed,
    receiverStatus: agent.receiverStatus,
  })
}

function getAgentAttachmentDisplayList(agent: any) {
  return getReceiverAttachmentDisplayList(agent.attachmentNames, agent.accountKind || 'private', agent.name, agent.attachmentsReady)
}

function getAgentSettlementChangeState(agent: any) {
  const storageKey = getReceiverSettlementChangeStorageKey('agent', agent.name)
  const saved = localStorage.getItem(storageKey)
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      localStorage.removeItem(storageKey)
    }
  }
  const draftStatus = agent.pendingSettlementDraft?.draftStatus
  return {
    status: draftStatus || 'none',
    remark: draftStatus ? '已保存结算账户变更草稿，尚未提交拉卡拉审核' : '',
  }
}

// ===== 新增 =====
const showAddModal = ref(false)

function openAdd() {
  console.log('openAdd called')
  resetAddForm()
  showAddModal.value = true
  console.log('showAddModal set to', showAddModal.value)
}

const addFormRef = ref<FormInst | null>(null)
const addReceiverAttachmentFiles = ref<Record<string, UploadFileInfo[]>>({})
const addForm = ref({
  name: '', contact: '', phone: '', region: '', commissionRate: 10, feeRate: 0.005, status: 'active',
  username: '', password: '',
  accountKind: 'private', bankName: '', cardNo: '', accountName: '', idCard: '',
  licenseNo: '', licenseName: '', legalPersonName: '', legalPersonCertificateNo: '', attachmentsReady: false, profileConfirmed: false,
})
const addRules: FormRules = {
  name: { required: true, message: '请输入代理商名称', trigger: 'blur' },
  contact: { required: true, message: '请输入联系人', trigger: 'blur' },
  phone: { required: true, message: '请输入联系电话', trigger: 'blur' },
  region: { 
    required: true, 
    validator: () => addRegionPath.value.length > 0,
    message: '请选择省/城市', 
    trigger: 'change' 
  },
  username: { required: true, message: '请输入管理员账号', trigger: 'blur' },
  password: { required: true, message: '请输入管理员密码', trigger: 'blur' },
}

function handleAdd() {
  addFormRef.value?.validate((errors) => {
    if (errors) return
    const regionStr = addRegionPath.value.join(' / ')
    agentData.value.unshift({
      id: Date.now(),
      name: addForm.value.name,
      contact: addForm.value.contact,
      phone: addForm.value.phone,
      region: regionStr,
      commissionRate: addForm.value.commissionRate,
      feeRate: addForm.value.feeRate,
      status: addForm.value.status,
      merchantCount: 0,
      storeCount: 0,
      monthRecharge: '¥0',
      monthCommission: '¥0',
      username: addForm.value.username,
      password: addForm.value.password,
      accountKind: addForm.value.accountKind,
      bankName: addForm.value.bankName,
      cardNo: addForm.value.cardNo,
      accountName: addForm.value.accountName,
      idCard: addForm.value.idCard,
      licenseNo: addForm.value.licenseNo,
      licenseName: addForm.value.licenseName,
      legalPersonName: addForm.value.legalPersonName,
      legalPersonCertificateNo: addForm.value.legalPersonCertificateNo,
      attachmentsReady: addForm.value.attachmentsReady,
      profileConfirmed: addForm.value.profileConfirmed,
      attachmentNames: buildAttachmentNames(addReceiverAttachmentFiles.value),
      createdAt: new Date().toISOString().slice(0, 10),
    })
    message.success('代理商新增成功')
    showAddModal.value = false
    resetAddForm()
  })
}

function getRequiredAttachmentNames(accountKind: string) {
  return accountKind === 'public'
    ? ['法人身份证正面', '法人身份证反面', '银行卡', '营业执照']
    : ['身份证正面', '身份证反面', '银行卡']
}

function buildAttachmentNames(filesMap: Record<string, UploadFileInfo[]>) {
  return Object.entries(filesMap).flatMap(([type, files]) => files.map((file) => `${type}：${file.name}`))
}

function getAddReceiverAttachmentFiles(type: string) {
  return addReceiverAttachmentFiles.value[type] || []
}

function refreshAddReceiverAttachmentStatus() {
  addForm.value.attachmentsReady = getRequiredAttachmentNames(addForm.value.accountKind).every((type) => Boolean(addReceiverAttachmentFiles.value[type]?.length))
}

function handleAddReceiverAttachmentFiles(type: string, files: UploadFileInfo[]) {
  addReceiverAttachmentFiles.value[type] = files.slice(0, 1)
  refreshAddReceiverAttachmentStatus()
}

function resetAddForm() {
  addForm.value = { name: '', contact: '', phone: '', region: '', commissionRate: 10, feeRate: 0.005, status: 'active', username: '', password: '', accountKind: 'private', bankName: '', cardNo: '', accountName: '', idCard: '', licenseNo: '', licenseName: '', legalPersonName: '', legalPersonCertificateNo: '', attachmentsReady: false, profileConfirmed: false }
  addReceiverAttachmentFiles.value = {}
  addRegionPath.value = []
}

// ===== 编辑 =====
const showEditModal = ref(false)
const currentAgent = ref<any>(null)
const editReceiverAttachmentFiles = ref<Record<string, UploadFileInfo[]>>({})
const editSettlementLocked = computed(() => isAgentSettlementLocked(currentAgent.value))
const settlementDraftMode = ref(false)
const settlementFieldsReadonly = computed(() => editSettlementLocked.value && !settlementDraftMode.value)
const editForm = ref({
  name: '', contact: '', phone: '', region: '', commissionRate: 10, feeRate: 0.005, status: 'active',
  accountKind: 'private', bankName: '', cardNo: '', accountName: '', idCard: '',
  licenseNo: '', licenseName: '', legalPersonName: '', legalPersonCertificateNo: '', attachmentsReady: false, profileConfirmed: false,
})

function openEdit(row: any) {
  currentAgent.value = row
  settlementDraftMode.value = false
  const settlementSource = row.pendingSettlementDraft || row
  editForm.value = {
    name: row.name, contact: row.contact || '', phone: row.phone || '',
    region: row.region || '', commissionRate: row.commissionRate || 10,
    feeRate: row.feeRate || 0.005,
    status: row.status || 'active',
    accountKind: settlementSource.accountKind || 'private',
    bankName: settlementSource.bankName || '', cardNo: settlementSource.cardNo || '',
    accountName: settlementSource.accountName || '', idCard: settlementSource.idCard || '',
    licenseNo: settlementSource.licenseNo || '',
    licenseName: settlementSource.licenseName || '',
    legalPersonName: settlementSource.legalPersonName || '',
    legalPersonCertificateNo: settlementSource.legalPersonCertificateNo || '',
    attachmentsReady: settlementSource.attachmentsReady || false,
    profileConfirmed: settlementSource.profileConfirmed || false,
  }
  editReceiverAttachmentFiles.value = parseAttachmentNames(settlementSource.attachmentNames || [])
  if (!isAgentSettlementLocked(row)) {
    refreshEditReceiverAttachmentStatus()
  }
  // Parse "广东省 / 深圳市" → ['广东省', '深圳市']
  editRegionPath.value = row.region ? row.region.split(' / ') : []
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
  editForm.value.attachmentsReady = getRequiredAttachmentNames(editForm.value.accountKind).every((type) => Boolean(editReceiverAttachmentFiles.value[type]?.length))
}

function handleEditReceiverAttachmentFiles(type: string, files: UploadFileInfo[]) {
  editReceiverAttachmentFiles.value[type] = files.slice(0, 1)
  refreshEditReceiverAttachmentStatus()
}

function handleEdit() {
  if (!currentAgent.value) return
  const idx = agentData.value.findIndex(d => d.id === currentAgent.value.id)
  if (idx !== -1) {
    const lockedSettlement = pickAgentSettlementFields(agentData.value[idx])
    const nextSettlementDraft = settlementDraftMode.value
      ? {
          ...pickAgentSettlementFields(editForm.value),
          attachmentNames: buildAttachmentNames(editReceiverAttachmentFiles.value),
          draftStatus: 'draft',
        }
      : agentData.value[idx].pendingSettlementDraft
    agentData.value[idx] = {
      ...agentData.value[idx],
      ...editForm.value,
      attachmentNames: buildAttachmentNames(editReceiverAttachmentFiles.value),
      region: editRegionPath.value.join(' / '),
      ...(editSettlementLocked.value ? { ...lockedSettlement, pendingSettlementDraft: nextSettlementDraft } : {}),
    }
    message.success(settlementDraftMode.value ? '结算账户变更草稿已保存，当前生效资料未覆盖' : '代理商信息已更新')
  }
  showEditModal.value = false
}

function isAgentSettlementLocked(agent: any) {
  return Boolean(
    agent?.profileConfirmed
    || ['reviewing', 'active', 'supplement'].includes(agent?.receiverStatus)
  )
}

function pickAgentSettlementFields(agent: any) {
  return {
    accountKind: agent.accountKind,
    bankName: agent.bankName,
    cardNo: agent.cardNo,
    accountName: agent.accountName,
    idCard: agent.idCard,
    licenseNo: agent.licenseNo,
    licenseName: agent.licenseName,
    legalPersonName: agent.legalPersonName,
    legalPersonCertificateNo: agent.legalPersonCertificateNo,
    attachmentsReady: agent.attachmentsReady,
    profileConfirmed: agent.profileConfirmed,
    receiverStatus: agent.receiverStatus,
    attachmentNames: agent.attachmentNames,
  }
}

function startAgentSettlementDraft() {
  if (!currentAgent.value) return
  settlementDraftMode.value = true
  const draft = currentAgent.value.pendingSettlementDraft || currentAgent.value
  Object.assign(editForm.value, pickAgentSettlementFields(draft))
  editReceiverAttachmentFiles.value = parseAttachmentNames(draft.attachmentNames || [])
}

function goReceiverChangeFromAgent() {
  if (!currentAgent.value) return
  if (isAgentSettlementLocked(currentAgent.value) && !currentAgent.value.pendingSettlementDraft) {
    message.warning('请先填写并保存结算账户变更草稿，再提交拉卡拉变更申请')
    return
  }
  showEditModal.value = false
  router.push({
    path: '/platform/finance/lakala-merchant-split',
    query: {
      receiverOwnerType: 'agent',
      receiverOwnerId: String(currentAgent.value.id),
      receiverOwnerName: currentAgent.value.name,
      action: 'receiver-change',
    },
  })
}

// ===== 详情 =====
const showDetailModal = ref(false)

function openDetail(row: any) {
  currentAgent.value = row
  showDetailModal.value = true
}

function openEditFromDetail() {
  showDetailModal.value = false
  openEdit(currentAgent.value)
}

// ===== 删除（含二次确认）=====
function handleDelete(row: any) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除代理商「${row.name}」吗？删除后不可恢复。`,
    positiveText: '确认删除',
    negativeText: '取消',
    onPositiveClick: () => {
      agentData.value = agentData.value.filter(d => d.id !== row.id)
      message.success('代理商已删除')
    },
  })
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
