<template>
  <div class="account-balance-page">
    <div class="page-header">
      <h2 class="page-title">账户</h2>
    </div>

    <n-alert type="info" :bordered="false" style="margin-bottom: 16px;">
      结算账户资料已统一到拉卡拉分账通流程，请在“结算账户”中查看资料状态、附件和待平台处理进度。
      <n-button text type="primary" size="small" style="margin-left: 8px;" @click="activeTab = 'bank'">
        去结算账户
      </n-button>
    </n-alert>

    <n-tabs v-model:value="activeTab" type="line" class="account-tabs">
      <!-- 运营账户暂不启用（与短信管理关联） -->
      <!-- <n-tab-pane name="operating" tab="运营账户">
        <div class="balance-card">
          <div class="balance-label">可用余额（元）</div>
          <div class="balance-row">
            <div class="balance-amount">¥ {{ operatingBalance }}</div>
            <n-button text type="primary" class="view-bills" @click="viewBills('operating')">
              查看账单
            </n-button>
          </div>
          <div class="balance-actions">
            <n-button type="primary" class="action-btn" @click="handleRecharge">去充值</n-button>
          </div>
        </div>
      </n-tab-pane> -->

      <n-tab-pane name="basic" tab="基础账户">
        <div class="balance-card basic-account">
          <div class="basic-balance-layout">
            <div class="basic-balance-left">
              <div class="balance-amount">¥{{ basicBalance }}</div>
              <n-button text type="primary" class="view-bills" @click="viewBills('basic')">
                查看订单
              </n-button>
            </div>
            <div class="basic-balance-right">
              <div class="store-pay-hint">
                各店铺通过收银系统扫码支付及点播系统直接扫码支付的金额
              </div>
              <div v-for="store in basicStoreList" :key="store.name" class="store-balance-item">
                <span class="store-name">{{ store.name }}</span>
                <span class="store-amount">：{{ store.amount }}</span>
              </div>
            </div>
          </div>
        </div>
      </n-tab-pane>

      <n-tab-pane name="game-bean" tab="游戏豆账户">
        <div class="balance-card game-bean-card">
          <!-- 全局游戏豆（通用） -->
          <div class="game-bean-total">
            <div class="game-bean-total-header">
              <span class="total-label">商家全局游戏豆（通用）：</span>
              <span class="total-value">{{ merchantGameBean }}</span>
            </div>
            <n-tag type="info" size="small" class="total-tip">可在所有店铺点播使用，统一管理</n-tag>
          </div>

          <!-- 各店铺游戏豆（专用） -->
          <div class="game-bean-table-section">
            <div class="game-bean-table-header">
              <span class="table-title">各店铺游戏豆（专用）：</span>
              <n-tag type="warning" size="small" class="table-tip">仅限当前店铺点播使用，各店铺独立管理</n-tag>
            </div>
            <n-data-table
              :columns="gameBeanColumns"
              :data="gameBeanStoreList"
              :bordered="false"
              :single-line="true"
              size="small"
              class="game-bean-table"
            />
          </div>

          <!-- 操作按钮 -->
          <div class="game-bean-actions">
            <n-button type="primary" ghost class="game-bean-btn" @click="handleTransfer">游戏豆转移</n-button>
            <n-button type="primary" class="game-bean-btn" @click="handleRecharge">去充值</n-button>
            <n-button type="primary" ghost class="game-bean-btn" @click="viewBills('game-bean')">查看账单</n-button>
          </div>
        </div>
      </n-tab-pane>

      <n-tab-pane name="bank" tab="结算账户">
        <div class="bank-card">
          <n-alert type="info" :bordered="false" style="margin-bottom: 20px;">
            <template #header>分账通结算账户</template>
            这里用于补充拉卡拉分账接收方资料。提交后由平台统一提交拉卡拉审核，审核中和已生效资料不能自行直接修改。
            <n-space size="small" style="margin-top: 12px;">
              <n-button size="small" secondary type="warning" @click="resetFirstSettlementSubmissionTest">测试首次提交</n-button>
              <n-button size="small" quaternary @click="restoreSettlementDemo">恢复已生效演示</n-button>
            </n-space>
          </n-alert>

          <div class="settlement-summary">
            <div class="summary-item">
              <span class="summary-label">资料状态</span>
              <n-tag :type="settlementProfileStatusType" size="small">{{ settlementProfileStatus }}</n-tag>
            </div>
            <div class="summary-item">
              <span class="summary-label">账户类型</span>
              <strong>{{ getAccountKindLabel(bankInfo?.accountKind || bankForm.accountKind) }}</strong>
            </div>
            <div class="summary-item">
              <span class="summary-label">平台处理</span>
              <strong>{{ pendingChange ? '待平台提交拉卡拉审核' : '无需处理' }}</strong>
            </div>
          </div>

          <!-- 待平台处理提示 -->
          <div v-if="pendingChange" class="cooling-alert" style="margin-bottom: 20px; padding: 16px; background: #fff7e6; border: 1px solid #ffd591; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <h4 style="margin: 0; color: #d46b08;">结算账户资料待平台处理</h4>
              <n-button type="warning" size="small" @click="handleRevoke" :loading="revoking">
                撤销申请
              </n-button>
            </div>
            <div style="font-size: 14px; color: #666;">
              <p style="margin: 6px 0;">新账户：{{ pendingChange.bankNameText }} - {{ formatCardNo(pendingChange.cardNo) }}</p>
              <p style="margin: 6px 0;">提交时间：{{ pendingChange.effectiveTime }}</p>
              <p style="margin: 6px 0;">平台确认后会提交拉卡拉审核，审核通过后才会生效。</p>
            </div>
          </div>

          <n-descriptions v-if="pendingChange" label-placement="left" :column="1" bordered style="margin-bottom: 20px;">
            <n-descriptions-item label="提交状态">
              <n-tag type="warning" size="small">待平台处理</n-tag>
            </n-descriptions-item>
            <n-descriptions-item label="账户类型">{{ getAccountKindLabel(pendingChange.accountKind) }}</n-descriptions-item>
            <n-descriptions-item label="开户银行">{{ pendingChange.bankNameText }}</n-descriptions-item>
            <n-descriptions-item label="银行卡号">{{ formatCardNo(pendingChange.cardNo) }}</n-descriptions-item>
            <n-descriptions-item label="开户人">{{ pendingChange.accountName }}</n-descriptions-item>
            <n-descriptions-item label="身份证号">{{ formatIDCard(pendingChange.idCard) }}</n-descriptions-item>
            <n-descriptions-item v-if="pendingChange.accountKind === 'public'" label="营业执照号">{{ pendingChange.licenseNo || '-' }}</n-descriptions-item>
            <n-descriptions-item v-if="pendingChange.accountKind === 'public'" label="营业执照名称">{{ pendingChange.licenseName || '-' }}</n-descriptions-item>
            <n-descriptions-item v-if="pendingChange.accountKind === 'public'" label="法人姓名">{{ pendingChange.legalPersonName || '-' }}</n-descriptions-item>
            <n-descriptions-item v-if="pendingChange.accountKind === 'public'" label="法人证件号">{{ formatIDCard(pendingChange.legalPersonCertificateNo || '') }}</n-descriptions-item>
            <n-descriptions-item label="附件资料">
              <n-space>
                <n-tag v-for="item in getAttachmentDisplayList(pendingChange)" :key="item" size="small">{{ item }}</n-tag>
              </n-space>
            </n-descriptions-item>
          </n-descriptions>

          <div class="bank-header">
            <h4>结算账户信息</h4>
            <n-button v-if="!isEditingBank && !pendingChange && canEditSettlementAccount" text type="primary" @click="startEditBank">完善资料</n-button>
          </div>
          
          <n-form v-if="isEditingBank" label-placement="left" label-width="100">
            <n-alert type="warning" :bordered="false" style="margin-bottom: 16px;">
              提交后不会直接覆盖当前生效账户，平台确认并通过拉卡拉审核后才会生效。
            </n-alert>
            <n-form-item label="账户类型" required>
              <n-input value="对公账户" readonly />
            </n-form-item>
            <n-form-item label="开户银行">
              <n-select v-model:value="bankForm.bankName" :options="bankOptions" placeholder="请选择开户银行" />
            </n-form-item>
            <n-form-item label="银行卡号">
              <n-input v-model:value="bankForm.cardNo" placeholder="请输入银行卡号" maxlength="23" />
            </n-form-item>
            <n-form-item label="开户主体名称">
              <n-input v-model:value="bankForm.accountName" placeholder="请输入企业开户主体名称" />
            </n-form-item>
            <n-form-item label="统一社会信用代码（账户证件号）">
              <n-input v-model:value="bankForm.idCard" placeholder="请输入统一社会信用代码" maxlength="18" />
            </n-form-item>
            <template>
              <n-form-item label="营业执照号">
                <n-input v-model:value="bankForm.licenseNo" placeholder="请输入营业执照号码" />
              </n-form-item>
              <n-form-item label="营业执照名称">
                <n-input v-model:value="bankForm.licenseName" placeholder="请输入营业执照名称" />
              </n-form-item>
              <n-form-item label="法人姓名">
                <n-input v-model:value="bankForm.legalPersonName" placeholder="请输入法人姓名" />
              </n-form-item>
              <n-form-item label="法人证件号">
                <n-input v-model:value="bankForm.legalPersonCertificateNo" placeholder="请输入法人身份证号" maxlength="18" />
              </n-form-item>
            </template>
            <n-form-item label="附件状态">
              <n-tag :type="bankForm.attachmentsReady ? 'success' : 'warning'" size="small">
                {{ bankForm.attachmentsReady ? '已收齐' : '待补充' }}
              </n-tag>
            </n-form-item>
            <n-form-item label="分项附件">
              <div class="receiver-attachment-list">
                <div v-for="item in getRequiredAttachmentNames(bankForm.accountKind)" :key="item" class="receiver-attachment-row">
                  <span>{{ item }}</span>
                  <n-upload
                    :file-list="getReceiverAttachmentFiles(item)"
                    :max="1"
                    :default-upload="false"
                    accept=".jpg,.jpeg,.png,.pdf"
                    @update:file-list="(files) => handleReceiverAttachmentFiles(item, files)"
                  >
                    <n-button size="small">上传</n-button>
                  </n-upload>
                </div>
              </div>
              <div class="upload-hint">每一项资料单独上传，全部必传项上传后才会标记为已收齐。</div>
            </n-form-item>
            <n-form-item label="资料确认">
              <n-radio-group v-model:value="bankForm.profileConfirmed">
                <n-radio :value="true">已确认，提交后不可自行修改</n-radio>
                <n-radio :value="false">暂不提交</n-radio>
              </n-radio-group>
            </n-form-item>
            <n-form-item>
              <n-space>
                <n-button type="primary" @click="saveBankInfo">提交资料</n-button>
                <n-button @click="cancelEditBank">取消</n-button>
              </n-space>
            </n-form-item>
          </n-form>
          
          <n-descriptions v-else-if="bankInfo && !pendingChange" label-placement="left" :column="1" bordered>
            <n-descriptions-item label="资料来源">商家经营信息 + 结算账户</n-descriptions-item>
            <n-descriptions-item label="账户类型">{{ getAccountKindLabel(bankInfo.accountKind) }}</n-descriptions-item>
            <n-descriptions-item label="开户银行">{{ bankInfo.bankNameText }}</n-descriptions-item>
            <n-descriptions-item label="银行卡号">{{ formatCardNo(bankInfo.cardNo) }}</n-descriptions-item>
            <n-descriptions-item label="开户主体">{{ bankInfo.accountName }}</n-descriptions-item>
            <n-descriptions-item label="统一社会信用代码">{{ formatIDCard(bankInfo.idCard) }}</n-descriptions-item>
            <n-descriptions-item label="营业执照号">{{ bankInfo.licenseNo || '-' }}</n-descriptions-item>
            <n-descriptions-item label="营业执照名称">{{ bankInfo.licenseName || '-' }}</n-descriptions-item>
            <n-descriptions-item label="法人姓名">{{ bankInfo.legalPersonName || '-' }}</n-descriptions-item>
            <n-descriptions-item label="法人证件号">{{ formatIDCard(bankInfo.legalPersonCertificateNo || '') }}</n-descriptions-item>
            <n-descriptions-item label="附件资料">
              <n-space>
                <n-tag v-for="item in getAttachmentDisplayList(bankInfo)" :key="item" size="small">{{ item }}</n-tag>
              </n-space>
            </n-descriptions-item>
            <n-descriptions-item label="资料确认">{{ bankInfo.profileConfirmed ? '已确认，提交后不可自行修改' : '未确认' }}</n-descriptions-item>
            <n-descriptions-item label="状态">
              <n-tag type="success" size="small">已生效</n-tag>
            </n-descriptions-item>
          </n-descriptions>
          
          <n-empty v-else-if="!bankInfo && !pendingChange" description="未完善结算账户" />
        </div>

        <!-- 操作日志 -->
        <div class="operation-logs" style="margin-top: 24px;">
          <n-collapse>
            <n-collapse-item title="查看操作日志" name="logs">
              <n-timeline>
                <n-timeline-item 
                  v-for="log in operationLogs" 
                  :key="log.id"
                  :type="log.type"
                  :title="log.action"
                  :content="log.detail"
                  :time="log.time"
                />
              </n-timeline>
            </n-collapse-item>
          </n-collapse>
        </div>
      </n-tab-pane>
    </n-tabs>

    <!-- 游戏豆转移弹窗 -->
    <n-modal
      v-model:show="transferModalVisible"
      title="转移"
      preset="card"
      size="medium"
      style="width: 500px;"
    >
      <n-form>
        <n-form-item label="*转出方">
          <n-select
            v-model:value="transferFrom"
            :options="storeOptions"
            placeholder="选择转出方"
            @update:value="handleFromChange"
          />
        </n-form-item>
        <n-form-item label="*转入方">
          <n-select
            v-model:value="transferTo"
            :options="storeOptions"
            placeholder="选择转入方"
          />
        </n-form-item>
        <n-form-item label="可用游戏豆">
          <n-input
            v-model:value="availableGameBeans"
            disabled
          />
        </n-form-item>
        <n-form-item label="*转移游戏豆">
          <n-input
            v-model:value="transferAmount"
            placeholder="0"
            type="number"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="modal-footer">
          <n-button @click="handleTransferCancel">取消</n-button>
          <n-button type="primary" @click="handleTransferSubmit">确定</n-button>
        </div>
      </template>
    </n-modal>

    <!-- 验证码弹窗 -->
    <n-modal
      v-model:show="verifyModalVisible"
      title="验证身份"
      preset="card"
      size="medium"
      style="width: 450px;"
      :mask-closable="false"
    >
      <n-form>
        <n-form-item label="验证码已发送至">
          <span style="color: #666;">{{ maskedPhone }}</span>
        </n-form-item>
        <n-form-item label="*验证码">
          <n-input-group>
            <n-input 
              v-model:value="verifyCode" 
              placeholder="请输入6位验证码"
              maxlength="6"
              style="flex: 1;"
            />
            <n-button 
              :disabled="cooldown > 0" 
              @click="sendVerifyCode"
              style="width: 120px;"
            >
              {{ cooldown > 0 ? `${cooldown}s后重发` : '发送验证码' }}
            </n-button>
          </n-input-group>
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="modal-footer">
          <n-button @click="verifyModalVisible = false">取消</n-button>
          <n-button type="primary" @click="confirmVerifyCode" :loading="verifying">
            确认
          </n-button>
        </div>
      </template>
    </n-modal>

    <!-- 提交提示弹窗 -->
    <n-modal
      v-model:show="coolingModalVisible"
      title="结算账户资料已提交"
      preset="success"
      :closable="false"
      :mask-closable="false"
      style="width: 500px;"
    >
      <div class="cooling-content">
        <n-result
          status="success"
          title="资料已提交"
          description="平台确认后会统一提交拉卡拉审核，审核通过后才会生效"
        >
          <template #footer>
            <div class="cooling-info">
              <n-alert type="warning" style="margin-bottom: 16px;">
                <template #header>
                  <span>处理说明</span>
                </template>
                <ul style="margin: 8px 0; padding-left: 20px;">
                  <li>平台会核对资料完整性</li>
                  <li>需要变更已生效资料时，由平台提交拉卡拉接收方信息变更</li>
                  <li>拉卡拉审核通过前，原结算账户保持不变</li>
                  <li>如资料有误，可在平台处理前撤销后重新提交</li>
                </ul>
              </n-alert>
              <div class="cooling-timer">
                <n-statistic label="当前状态" value="待平台处理" />
              </div>
            </div>
          </template>
        </n-result>
      </div>
      <template #footer>
        <div class="modal-footer">
          <n-button @click="revokeChange" :loading="revoking">
            撤销申请
          </n-button>
          <n-button type="primary" @click="coolingModalVisible = false">
            我知道了
          </n-button>
        </div>
      </template>
    </n-modal>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  NTabs, NTabPane, NButton, NTag, NDataTable, 
  NModal, NSelect, NInput, NForm, NFormItem, NEmpty, NDescriptions, NSpace,
  NDescriptionsItem, NInputGroup, NAlert, NResult, NStatistic, NCountdown,
  NTimeline, NTimelineItem, NCollapse, NCollapseItem, NRadioGroup, NRadio, NUpload,
  useMessage, type FormInst
} from 'naive-ui'

const message = useMessage()
const router = useRouter()
const activeTab = ref('basic')

// 结算账户相关
type SettlementAccountKind = 'public' | 'private'
interface ShopSettlementAccount {
  accountKind: SettlementAccountKind
  bankName: string
  bankNameText: string
  cardNo: string
  accountName: string
  idCard: string
  licenseNo?: string
  licenseName?: string
  legalPersonName?: string
  legalPersonCertificateNo?: string
  attachmentsReady?: boolean
  attachmentNames?: string[]
  profileConfirmed?: boolean
}

const bankInfo = ref<ShopSettlementAccount | null>({
  accountKind: 'public',
  bankName: 'ICBC',
  bankNameText: '中国工商银行',
  cardNo: '6222021234567890123',
  accountName: '恒然集团有限公司',
  idCard: '91440300MA5HR0001X',
  licenseNo: '91440300MA5HR0001X',
  licenseName: '恒然集团有限公司',
  legalPersonName: '陈总',
  legalPersonCertificateNo: '440301198001011234',
  attachmentsReady: true,
  attachmentNames: ['法人身份证正面', '法人身份证反面', '银行卡', '营业执照'],
  profileConfirmed: true,
})

const isEditingBank = ref(false)
const bankForm = ref<ShopSettlementAccount>({
  accountKind: 'public',
  bankName: '',
  bankNameText: '',
  cardNo: '',
  accountName: '',
  idCard: '',
  licenseNo: '',
  licenseName: '',
  legalPersonName: '',
  legalPersonCertificateNo: '',
  attachmentsReady: false,
  attachmentNames: [],
  profileConfirmed: false,
})
const receiverAttachmentFiles = ref<Record<string, any[]>>({})

// 验证相关
const verifyModalVisible = ref(false)
const verifyCode = ref('')
const cooldown = ref(0)
const verifying = ref(false)
const maskedPhone = ref('138****8000') // 模拟手机号

// 待平台处理的结算账户变更
const coolingModalVisible = ref(false)
const pendingChange = ref<{
  accountKind: SettlementAccountKind;
  bankName: string;
  bankNameText: string;
  cardNo: string;
  accountName: string;
  idCard: string;
  licenseNo?: string;
  licenseName?: string;
  legalPersonName?: string;
  legalPersonCertificateNo?: string;
  attachmentsReady?: boolean;
  attachmentNames?: string[];
  profileConfirmed?: boolean;
  effectiveTime: string;
  remainingSeconds: number;
} | null>(null)
const coolingTimeRemaining = ref('')
const revoking = ref(false)
let coolingTimer: number | null = null

const settlementProfileStatus = computed(() => {
  if (pendingChange.value) return '待平台处理'
  return bankInfo.value ? '已生效' : '待完善资料'
})
const settlementProfileStatusType = computed(() => {
  if (pendingChange.value) return 'warning'
  return bankInfo.value ? 'success' : 'default'
})
const canEditSettlementAccount = computed(() => !bankInfo.value || !bankInfo.value.profileConfirmed || !bankInfo.value.attachmentsReady)

// 操作日志
const operationLogs = ref<Array<{
  id: number;
  type: 'success' | 'warning' | 'info';
  action: string;
  detail: string;
  time: string;
}>>([])

const bankOptions = [
  { label: '中国工商银行', value: 'ICBC' },
  { label: '中国建设银行', value: 'CCB' },
  { label: '中国农业银行', value: 'ABC' },
  { label: '中国银行', value: 'BOC' },
  { label: '交通银行', value: 'BOCOM' },
  { label: '招商银行', value: 'CMB' },
]

function formatCardNo(cardNo: string) {
  if (!cardNo) return ''
  return cardNo.replace(/(\d{4})(?=\d)/g, '$1 ')
}

function formatIDCard(idCard: string) {
  if (!idCard) return ''
  return idCard.replace(/(\d{4})\d+(\d{4})/, '$1********$2')
}

function getAccountKindLabel(accountKind?: SettlementAccountKind) {
  return '对公账户'
}

function getRequiredAttachmentNames(accountKind: SettlementAccountKind = 'public') {
  return ['法人身份证正面', '法人身份证反面', '银行卡', '营业执照']
}

function getAttachmentDisplayList(account: ShopSettlementAccount) {
  if (account.attachmentNames?.length) return account.attachmentNames
  return account.attachmentsReady ? getRequiredAttachmentNames(account.accountKind) : ['待补充']
}

function getReceiverAttachmentFiles(type: string) {
  return receiverAttachmentFiles.value[type] || []
}

function handleReceiverAttachmentFiles(type: string, files: any[]) {
  receiverAttachmentFiles.value = { ...receiverAttachmentFiles.value, [type]: files }
  refreshReceiverAttachmentStatus()
}

function refreshReceiverAttachmentStatus() {
  const required = getRequiredAttachmentNames(bankForm.value.accountKind)
  bankForm.value.attachmentsReady = required.every((type) => Boolean(receiverAttachmentFiles.value[type]?.length))
  bankForm.value.attachmentNames = required.filter((type) => Boolean(receiverAttachmentFiles.value[type]?.length))
}

function seedReceiverAttachmentFiles(account: ShopSettlementAccount | null) {
  receiverAttachmentFiles.value = {}
  if (!account?.attachmentsReady) return
  receiverAttachmentFiles.value = Object.fromEntries(
    getRequiredAttachmentNames(account.accountKind).map((type) => [
      type,
      [{ id: type, name: `${type}.${type === '营业执照' ? 'pdf' : 'jpg'}`, status: 'finished' }],
    ])
  )
}

function startEditBank() {
  if (bankInfo.value) {
    bankForm.value = { ...bankInfo.value }
    seedReceiverAttachmentFiles(bankInfo.value)
  } else {
    bankForm.value = {
      accountKind: 'public',
      bankName: '',
      bankNameText: '',
      cardNo: '',
      accountName: '',
      idCard: '',
      licenseNo: '',
      licenseName: '',
      legalPersonName: '',
      legalPersonCertificateNo: '',
      attachmentsReady: false,
      attachmentNames: [],
      profileConfirmed: false,
    }
    receiverAttachmentFiles.value = {}
  }
  isEditingBank.value = true
}

function saveBankInfo() {
  // 先验证表单
  if (!bankForm.value.bankName || !bankForm.value.cardNo || !bankForm.value.accountName || !bankForm.value.idCard) {
    message.warning('请填写完整信息')
    return
  }
  if (bankForm.value.accountKind === 'public' && (!bankForm.value.licenseNo || !bankForm.value.licenseName || !bankForm.value.legalPersonName || !bankForm.value.legalPersonCertificateNo)) {
    message.warning('请填写完整的营业执照和法人信息')
    return
  }
  if (!bankForm.value.attachmentsReady) {
    message.warning(`请上传必传附件：${getRequiredAttachmentNames(bankForm.value.accountKind).join('、')}`)
    return
  }
  if (!bankForm.value.profileConfirmed) {
    message.warning('请确认资料提交后不可自行修改')
    return
  }
  
  // 显示验证码弹窗
  verifyModalVisible.value = true
  verifyCode.value = ''
  sendVerifyCode()
}

async function sendVerifyCode() {
  // 模拟发送验证码
  message.success('验证码已发送，测试验证码为：123456')
  cooldown.value = 60
  
  const timer = setInterval(() => {
    cooldown.value--
    if (cooldown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

async function confirmVerifyCode() {
  if (!verifyCode.value || verifyCode.value.length !== 6) {
    message.warning('请输入6位验证码')
    return
  }
  
  verifying.value = true
  
  // 模拟验证
  setTimeout(() => {
    verifying.value = false
    
    if (verifyCode.value === '123456') {
      verifyModalVisible.value = false
      message.success('验证成功')
      
      const submittedAt = new Date()
      
      pendingChange.value = {
        ...bankForm.value,
        bankNameText: bankOptions.find(b => b.value === bankForm.value.bankName)?.label || '',
        effectiveTime: submittedAt.toLocaleString('zh-CN'),
        remainingSeconds: 0,
      }
      
      isEditingBank.value = false
      
      // 保存到localStorage（模拟后端存储）
      localStorage.setItem('pendingBankChange', JSON.stringify(pendingChange.value))
      
      addOperationLog('warning', '结算账户资料已提交', `提交账户：${pendingChange.value.bankNameText} - ${formatCardNo(bankForm.value.cardNo)}，等待平台提交拉卡拉审核`)
      
      message.info('已通知平台处理')
      message.success('结算账户资料已提交，等待平台处理')
      coolingModalVisible.value = true
    } else {
      message.error('验证码错误，请输入123456')
    }
  }, 500)
}

function startCoolingTimer() {
  if (coolingTimer) {
    clearInterval(coolingTimer)
  }
  
  coolingTimer = window.setInterval(() => {
    if (pendingChange.value) {
      pendingChange.value.remainingSeconds--
      
      if (pendingChange.value.remainingSeconds <= 0) {
        handleCoolingFinish()
      }
    }
  }, 1000)
}

function handleCoolingFinish() {
  // 分账通场景不在用户侧自动生效；真实生效由平台提交拉卡拉审核通过后回写。
  if (pendingChange.value) {
    message.info('结算账户资料需由平台提交拉卡拉审核后生效')
  }
}

async function revokeChange() {
  revoking.value = true
  
  // 模拟撤销
  setTimeout(() => {
    revoking.value = false
    
    if (pendingChange.value) {
      addOperationLog('info', '结算账户资料提交已撤销', '用户主动撤销待平台处理的资料')
    }
    
    pendingChange.value = null
    localStorage.removeItem('pendingBankChange')
    
    coolingModalVisible.value = false
    
    if (coolingTimer) {
      clearInterval(coolingTimer)
      coolingTimer = null
    }
    
    message.success('申请已撤销')
  }, 1000)
}

function cancelEditBank() {
  isEditingBank.value = false
}

function resetFirstSettlementSubmissionTest() {
  activeTab.value = 'bank'
  bankInfo.value = null
  pendingChange.value = null
  receiverAttachmentFiles.value = {}
  isEditingBank.value = false
  localStorage.removeItem('pendingBankChange')
  operationLogs.value = []
  addOperationLog('info', '进入首次提交测试', '当前演示账号已切换为未完善结算账户，可点击“完善资料”测试首次提交')
  message.success('已切换到首次提交测试，请点击“完善资料”')
}

function restoreSettlementDemo() {
  activeTab.value = 'bank'
  pendingChange.value = null
  receiverAttachmentFiles.value = {}
  bankInfo.value = {
    accountKind: 'public',
    bankName: 'ICBC',
    bankNameText: '中国工商银行',
    cardNo: '6222021234567890123',
    accountName: '恒然集团有限公司',
    idCard: '91440300MA5HR0001X',
    licenseNo: '91440300MA5HR0001X',
    licenseName: '恒然集团有限公司',
    legalPersonName: '陈总',
    legalPersonCertificateNo: '440301198001011234',
    attachmentsReady: true,
    attachmentNames: ['法人身份证正面', '法人身份证反面', '银行卡', '营业执照'],
    profileConfirmed: true,
  }
  isEditingBank.value = false
  localStorage.removeItem('pendingBankChange')
  operationLogs.value = []
  addOperationLog('success', '结算账户已生效', `${bankInfo.value.bankNameText} - ${formatCardNo(bankInfo.value.cardNo)}`)
  message.success('已恢复已生效演示数据')
}

function formatRemainingTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}小时${minutes}分${secs}秒`
  } else if (minutes > 0) {
    return `${minutes}分${secs}秒`
  } else {
    return `${secs}秒`
  }
}

function handleRevoke() {
  revokeChange()
}

function addOperationLog(type: 'success' | 'warning' | 'info', action: string, detail: string) {
  const now = new Date()
  const time = now.toLocaleString('zh-CN')
  
  operationLogs.value.unshift({
    id: Date.now(),
    type,
    action,
    detail,
    time
  })
  
  // 保存到localStorage
  localStorage.setItem('bankOperationLogs', JSON.stringify(operationLogs.value))
}

function loadPendingChange() {
  const saved = localStorage.getItem('pendingBankChange')
  if (saved) {
    try {
      pendingChange.value = JSON.parse(saved)
    } catch (e) {
      localStorage.removeItem('pendingBankChange')
    }
  }
}

function loadOperationLogs() {
  const saved = localStorage.getItem('bankOperationLogs')
  if (saved) {
    try {
      operationLogs.value = JSON.parse(saved)
    } catch (e) {
      localStorage.removeItem('bankOperationLogs')
    }
  }
  
  // 添加初始日志（如果为空）
  if (operationLogs.value.length === 0 && bankInfo.value) {
    addOperationLog('success', '结算账户已生效', `${bankInfo.value.bankNameText} - ${formatCardNo(bankInfo.value.cardNo)}`)
  }
}

onMounted(() => {
  loadPendingChange()
  loadOperationLogs()
})

onUnmounted(() => {
  if (coolingTimer) {
    clearInterval(coolingTimer)
  }
})

const operatingBalance = ref('0.69')
const basicBalance = ref('0')
const gameBeanBalance = ref('5200')
const merchantGameBean = ref('28')

const basicStoreList = [
  { name: '党建馆', amount: '0.00', cashierPay: '0.00', onDemandPay: '0.00' },
  { name: '华东展厅', amount: '0.00', cashierPay: '0.00', onDemandPay: '0.00' },
  { name: '恒然分部展厅', amount: '0.00', cashierPay: '0.00', onDemandPay: '0.00' },
  { name: '利民街大展厅', amount: '0.00', cashierPay: '0.00', onDemandPay: '0.00' },
  { name: '利民街小展厅', amount: '0.00', cashierPay: '0.00', onDemandPay: '0.00' },
]

const gameBeanColumns = [
  { title: 'id', key: 'id', width: 80 },
  { title: '店铺', key: 'name' },
  { title: '游戏豆', key: 'amount', width: 100 },
]

const gameBeanStoreList = [
  { id: '6288', name: '党建馆', amount: '0' },
  { id: '5764', name: '华东展厅', amount: '0' },
  { id: '5760', name: '恒然分部展厅', amount: '0' },
  { id: '5759', name: '利民街大展厅', amount: '0' },
  { id: '5077', name: '利民街小展厅', amount: '0' },
]

// 游戏豆转移弹窗
const transferModalVisible = ref(false)
const transferFrom = ref('')
const transferTo = ref('')
const availableGameBeans = ref('0')
const transferAmount = ref('0')

const storeOptions = [
  { value: '6288', label: '党建馆' },
  { value: '5764', label: '华东展厅' },
  { value: '5760', label: '恒然分部展厅' },
  { value: '5759', label: '利民街大展厅' },
  { value: '5077', label: '利民街小展厅' },
  { value: '8088', label: '幻影星空馆 NO.8088' },
]



function viewBills(type: string) {
  if (type === 'basic') {
    window.open('http://localhost:9527/shop/cashier-order', '_blank')
  } else {
    router.push({
      path: '/shop/account/bills',
      query: { type }
    })
  }
}

function handleWithdraw() {
  console.log('去提现')
}

function handleRecharge() {
  if (activeTab.value === 'game-bean') {
    router.push('/shop/account/game-bean/recharge')
  }
  // 运营账户已隐藏，不再跳转运营账户充值
}

function handleTransfer() {
  transferModalVisible.value = true
}

function handleTransferSubmit() {
  console.log('转移游戏豆', {
    from: transferFrom.value,
    to: transferTo.value,
    amount: transferAmount.value
  })
  transferModalVisible.value = false
}

function handleTransferCancel() {
  transferModalVisible.value = false
}

function handleFromChange(value: string) {
  transferFrom.value = value
  // 模拟获取可用游戏豆
  if (value === '8088') {
    availableGameBeans.value = '1028'
  } else {
    availableGameBeans.value = '0'
  }
}
</script>

<style scoped>
.account-balance-page {
  padding: 20px 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.account-tabs :deep(.n-tabs-nav) {
  margin-bottom: 16px;
}

.balance-card {
  background: white;
  border-radius: 12px;
  padding: 32px 24px;
  max-width: 600px;
}

.balance-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.balance-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.balance-amount {
  font-size: 32px;
  font-weight: 600;
  color: var(--text-primary);
}

.view-bills {
  font-size: 13px;
}

.balance-actions {
  display: flex;
  gap: 16px;
}

.action-btn {
  min-width: 120px;
}

/* 基础账户 */
.basic-balance-layout {
  display: flex;
  align-items: stretch;
}

.basic-balance-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  min-width: 140px;
  padding-right: 24px;
}

.basic-balance-left .balance-amount {
  margin-bottom: 4px;
  font-size: 36px;
}

.basic-balance-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  padding-left: 24px;
  border-left: 1px solid var(--border-color);
}

.store-pay-hint {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 12px;
  line-height: 1.5;
}

.store-balance-item {
  font-size: 14px;
  color: var(--text-secondary);
}

.store-name {
  color: var(--text-primary);
}

.store-amount {
  color: var(--text-secondary);
}

/* 游戏豆账户 */
.game-bean-card {
  max-width: 680px;
}

.game-bean-total {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.game-bean-total-header {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.total-tip {
  margin-top: 6px;
}

.total-label {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

.total-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.total-tip {
  font-size: 12px;
}

.game-bean-table-section {
  margin-bottom: 24px;
}

.game-bean-table-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.table-title {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

.game-bean-table :deep(.n-data-table-th) {
  background: #f8fafc;
  font-weight: 500;
}

.game-bean-actions {
  display: flex;
  gap: 16px;
}

.game-bean-btn {
  min-width: 120px;
}

/* 操作按钮 */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}



/* 结算账户 */
.bank-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 600px;
}

.settlement-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.summary-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 14px;
}

.summary-label {
  display: block;
  color: #64748b;
  font-size: 12px;
  margin-bottom: 8px;
}

.receiver-attachment-list {
  display: grid;
  gap: 10px;
  width: 100%;
}

.receiver-attachment-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
}

.upload-hint {
  margin-top: 8px;
  color: #64748b;
  font-size: 12px;
}

.bank-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.bank-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

/* 待平台处理提示样式 */
.cooling-content {
  text-align: center;
}

.cooling-info {
  text-align: left;
  margin-top: 16px;
}

.cooling-timer {
  margin-top: 16px;
  padding: 16px;
  background: #f0f9ff;
  border-radius: 8px;
}

/* 操作日志样式 */
.operation-logs {
  background: white;
  border-radius: 12px;
  padding: 16px;
}

.operation-logs .n-collapse {
  margin: 0;
}

.operation-logs .n-timeline {
  margin-top: 12px;
}
</style>
