<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>收款账户</h1>
        <p class="header-desc">补充分账通收款账户资料，用于接收游戏收益结算款项</p>
      </div>
    </div>

    <!-- 提示信息 -->
    <n-alert type="info" :bordered="false" style="margin-bottom: 24px;">
      <template #header>结算说明</template>
      账户资料提交后由平台统一提交拉卡拉审核，审核中和已生效资料不能自行直接修改。
      如需变更已生效资料，请联系平台处理。
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
        <strong>{{ getAccountKindLabel(bankAccount?.accountKind || bankForm.accountKind) }}</strong>
      </div>
      <div class="summary-item">
        <span class="summary-label">平台处理</span>
        <strong>{{ pendingChange ? '待平台提交拉卡拉审核' : '无需处理' }}</strong>
      </div>
    </div>

    <!-- 待平台处理提示 -->
    <div v-if="pendingChange" class="cooling-alert">
      <div class="cooling-header">
        <h4><n-icon :component="TimeOutline" /> 收款账户资料待平台处理</h4>
        <n-button type="warning" size="small" @click="handleRevoke" :loading="revoking">
          撤销申请
        </n-button>
      </div>
      <div class="cooling-body">
        <p>新账户：{{ pendingChange.bankNameText }} - {{ formatCardNo(pendingChange.cardNo) }}</p>
        <p>提交时间：{{ pendingChange.effectiveTime }}</p>
        <p>平台确认后会提交拉卡拉审核，审核通过后才会生效。</p>
      </div>
    </div>

    <!-- 收款账户信息 -->
    <div class="bank-section">
      <div class="section-header">
        <h3>{{ pendingChange ? '已提交资料' : '银行账户' }}</h3>
        <n-button v-if="!isEditing && !pendingChange && canEditSettlementAccount" text type="primary" @click="startEdit">
          <template #icon><n-icon :component="CreateOutline" /></template>
          完善资料
        </n-button>
      </div>

      <!-- 编辑表单 -->
      <n-form v-if="isEditing" label-placement="left" label-width="100" class="bank-form">
        <n-alert type="warning" :bordered="false" style="margin-bottom: 16px;">
          提交后不会直接覆盖当前生效账户，平台确认并通过拉卡拉审核后才会生效。
        </n-alert>
        <n-form-item label="账户类型" required>
          <n-radio-group v-model:value="bankForm.accountKind" @update:value="refreshReceiverAttachmentStatus">
            <n-radio value="public">对公账户</n-radio>
            <n-radio value="private">对私账户</n-radio>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="开户银行" required>
          <n-select v-model:value="bankForm.bankName" :options="bankOptions" placeholder="请选择开户银行" />
        </n-form-item>
        <n-form-item label="银行卡号" required>
          <n-input v-model:value="bankForm.cardNo" placeholder="请输入银行卡号" maxlength="23" />
        </n-form-item>
        <n-form-item label="开户名" required>
          <n-input v-model:value="bankForm.holderName" placeholder="请输入企业开户名" />
        </n-form-item>
        <n-form-item label="身份证号" required>
          <n-input v-model:value="bankForm.idCard" placeholder="请输入身份证号或统一社会信用代码" maxlength="18" />
        </n-form-item>
        <template v-if="bankForm.accountKind === 'public'">
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
            <n-button type="primary" @click="saveBankInfo" :loading="saving">提交资料</n-button>
            <n-button @click="cancelEdit">取消</n-button>
          </n-space>
        </n-form-item>
      </n-form>

      <n-descriptions v-else-if="pendingChange" label-placement="left" :column="1" bordered class="bank-display pending-display">
        <n-descriptions-item label="提交状态">
          <n-tag type="warning" size="small">待平台处理</n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="账户类型">{{ getAccountKindLabel(pendingChange.accountKind) }}</n-descriptions-item>
        <n-descriptions-item label="开户银行">{{ pendingChange.bankNameText }}</n-descriptions-item>
        <n-descriptions-item label="银行卡号">{{ formatCardNo(pendingChange.cardNo) }}</n-descriptions-item>
        <n-descriptions-item label="开户名">{{ pendingChange.holderName }}</n-descriptions-item>
        <n-descriptions-item label="身份证号">{{ maskCertificateNo(pendingChange.idCard) }}</n-descriptions-item>
        <n-descriptions-item v-if="pendingChange.accountKind === 'public'" label="营业执照号">{{ pendingChange.licenseNo || '-' }}</n-descriptions-item>
        <n-descriptions-item v-if="pendingChange.accountKind === 'public'" label="营业执照名称">{{ pendingChange.licenseName || '-' }}</n-descriptions-item>
        <n-descriptions-item v-if="pendingChange.accountKind === 'public'" label="法人姓名">{{ pendingChange.legalPersonName || '-' }}</n-descriptions-item>
        <n-descriptions-item v-if="pendingChange.accountKind === 'public'" label="法人证件号">{{ maskCertificateNo(pendingChange.legalPersonCertificateNo || '') }}</n-descriptions-item>
        <n-descriptions-item label="附件资料">
          <n-space>
            <n-tag v-for="item in getAttachmentDisplayList(pendingChange)" :key="item" size="small">{{ item }}</n-tag>
          </n-space>
        </n-descriptions-item>
      </n-descriptions>

      <!-- 已绑定账户展示 -->
      <n-descriptions v-else-if="bankAccount && !pendingChange" label-placement="left" :column="1" bordered class="bank-display">
        <n-descriptions-item label="资料来源">供应商信息 + 收款账户</n-descriptions-item>
        <n-descriptions-item label="账户类型">{{ getAccountKindLabel(bankAccount.accountKind) }}</n-descriptions-item>
        <n-descriptions-item label="开户银行">{{ bankAccount.bankNameText }}</n-descriptions-item>
        <n-descriptions-item label="银行卡号">{{ formatCardNo(bankAccount.cardNo) }}</n-descriptions-item>
        <n-descriptions-item label="开户名">{{ bankAccount.holderName }}</n-descriptions-item>
        <n-descriptions-item label="身份证号">{{ maskCertificateNo(bankAccount.idCard) }}</n-descriptions-item>
        <n-descriptions-item v-if="bankAccount.accountKind === 'public'" label="营业执照号">{{ bankAccount.licenseNo || '-' }}</n-descriptions-item>
        <n-descriptions-item v-if="bankAccount.accountKind === 'public'" label="营业执照名称">{{ bankAccount.licenseName || '-' }}</n-descriptions-item>
        <n-descriptions-item v-if="bankAccount.accountKind === 'public'" label="法人姓名">{{ bankAccount.legalPersonName || '-' }}</n-descriptions-item>
        <n-descriptions-item v-if="bankAccount.accountKind === 'public'" label="法人证件号">{{ maskCertificateNo(bankAccount.legalPersonCertificateNo || '') }}</n-descriptions-item>
        <n-descriptions-item label="附件资料">
          <n-space>
            <n-tag v-for="item in getAttachmentDisplayList(bankAccount)" :key="item" size="small">{{ item }}</n-tag>
          </n-space>
        </n-descriptions-item>
        <n-descriptions-item label="资料确认">{{ bankAccount.profileConfirmed ? '已确认，提交后不可自行修改' : '未确认' }}</n-descriptions-item>
        <n-descriptions-item label="状态">
          <n-tag type="success" size="small">已生效</n-tag>
        </n-descriptions-item>
      </n-descriptions>

      <n-empty v-else-if="!bankAccount && !pendingChange" description="未完善收款账户" />
    </div>

    <!-- 操作日志 -->
    <div class="logs-section">
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

    <!-- 验证码弹窗 -->
    <n-modal v-model:show="verifyModalVisible" title="验证身份" preset="card" size="medium" style="width: 450px;" :mask-closable="false">
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
          <n-button type="primary" @click="confirmVerifyCode" :loading="verifying">确认</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import {
  NButton, NIcon, NTag, NForm, NFormItem, NInput, NSelect,
  NDescriptions, NDescriptionsItem, NEmpty, NAlert, NModal, NSpace,
  NCollapse, NCollapseItem, NTimeline, NTimelineItem, NRadioGroup, NRadio, NUpload, useMessage
} from 'naive-ui'
import { TimeOutline, CreateOutline } from '@vicons/ionicons5'

const message = useMessage()

type SettlementAccountKind = 'public' | 'private'
interface CpSettlementAccount {
  accountKind: SettlementAccountKind
  bankName: string
  bankNameText: string
  cardNo: string
  holderName: string
  idCard: string
  licenseNo?: string
  licenseName?: string
  legalPersonName?: string
  legalPersonCertificateNo?: string
  attachmentsReady?: boolean
  attachmentNames?: string[]
  profileConfirmed?: boolean
}

// 收款账户信息
const bankAccount = ref<CpSettlementAccount | null>({
  accountKind: 'public',
  bankName: 'CMB',
  bankNameText: '招商银行',
  cardNo: '6214838888888888888',
  holderName: '北京极境互动科技有限公司',
  idCard: '91440300MA5CP0001X',
  licenseNo: '91440300MA5CP0001X',
  licenseName: '北京极境互动科技有限公司',
  legalPersonName: '张伟',
  legalPersonCertificateNo: '110101199001011234',
  attachmentsReady: true,
  attachmentNames: ['法人身份证正面', '法人身份证反面', '银行卡', '营业执照'],
  profileConfirmed: true,
})

const isEditing = ref(false)
const saving = ref(false)
const bankForm = ref<CpSettlementAccount>({
  accountKind: 'public',
  bankName: '',
  bankNameText: '',
  cardNo: '',
  holderName: '',
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

const bankOptions = [
  { label: '招商银行', value: 'CMB' },
  { label: '工商银行', value: 'ICBC' },
  { label: '建设银行', value: 'CCB' },
  { label: '农业银行', value: 'ABC' },
  { label: '中国银行', value: 'BOC' },
  { label: '交通银行', value: 'BOCOM' },
]

// 待平台处理的收款账户变更
const pendingChange = ref<{
  accountKind: SettlementAccountKind;
  bankName: string;
  bankNameText: string;
  cardNo: string;
  holderName: string;
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
const revoking = ref(false)
let coolingTimer: number | null = null

const settlementProfileStatus = computed(() => {
  if (pendingChange.value) return '待平台处理'
  return bankAccount.value ? '已生效' : '待完善资料'
})
const settlementProfileStatusType = computed(() => {
  if (pendingChange.value) return 'warning'
  return bankAccount.value ? 'success' : 'default'
})
const canEditSettlementAccount = computed(() => !bankAccount.value || !bankAccount.value.profileConfirmed || !bankAccount.value.attachmentsReady)

// 操作日志
const operationLogs = ref<Array<{
  id: number;
  type: 'success' | 'warning' | 'info';
  action: string;
  detail: string;
  time: string;
}>>([])

// 验证相关
const verifyModalVisible = ref(false)
const verifyCode = ref('')
const cooldown = ref(0)
const verifying = ref(false)
const maskedPhone = ref('138****8000')

function formatCardNo(cardNo: string) {
  if (!cardNo) return ''
  return cardNo.replace(/(\d{4})(?=\d)/g, '$1 ')
}

function maskCertificateNo(certificateNo: string) {
  if (!certificateNo) return '-'
  return certificateNo.replace(/(.{4}).+(.{4})/, '$1********$2')
}

function getAccountKindLabel(accountKind?: SettlementAccountKind) {
  return accountKind === 'public' ? '对公账户' : '对私账户'
}

function getRequiredAttachmentNames(accountKind: SettlementAccountKind = 'private') {
  return accountKind === 'public'
    ? ['法人身份证正面', '法人身份证反面', '银行卡', '营业执照']
    : ['身份证正面', '身份证反面', '银行卡']
}

function getAttachmentDisplayList(account: CpSettlementAccount) {
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

function seedReceiverAttachmentFiles(account: CpSettlementAccount | null) {
  receiverAttachmentFiles.value = {}
  if (!account?.attachmentsReady) return
  receiverAttachmentFiles.value = Object.fromEntries(
    getRequiredAttachmentNames(account.accountKind).map((type) => [
      type,
      [{ id: type, name: `${type}.${type === '营业执照' ? 'pdf' : 'jpg'}`, status: 'finished' }],
    ])
  )
}

function startEdit() {
  if (bankAccount.value) {
    bankForm.value = { ...bankAccount.value }
    seedReceiverAttachmentFiles(bankAccount.value)
  } else {
    bankForm.value = {
      accountKind: 'public',
      bankName: '',
      bankNameText: '',
      cardNo: '',
      holderName: '',
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
  isEditing.value = true
}

async function saveBankInfo() {
  if (!bankForm.value.bankName || !bankForm.value.cardNo || !bankForm.value.holderName || !bankForm.value.idCard) {
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

  verifyModalVisible.value = true
  verifyCode.value = ''
  sendVerifyCode()
}

async function sendVerifyCode() {
  message.success('验证码已发送，测试验证码为：123456')
  cooldown.value = 60
  const timer = setInterval(() => {
    cooldown.value--
    if (cooldown.value <= 0) clearInterval(timer)
  }, 1000)
}

async function confirmVerifyCode() {
  if (!verifyCode.value || verifyCode.value.length !== 6) {
    message.warning('请输入6位验证码')
    return
  }

  verifying.value = true

  setTimeout(() => {
    verifying.value = false

    if (verifyCode.value === '123456') {
      verifyModalVisible.value = false
      message.success('验证成功')

      const submittedAt = new Date()
      const bankNameText = bankOptions.find(b => b.value === bankForm.value.bankName)?.label || ''
      pendingChange.value = {
        ...bankForm.value,
        bankNameText,
        effectiveTime: submittedAt.toLocaleString('zh-CN'),
        remainingSeconds: 0
      }

      isEditing.value = false
      localStorage.setItem('cpPendingBankChange', JSON.stringify(pendingChange.value))

      addOperationLog('warning', '收款账户资料已提交', `提交账户：${bankNameText} - ${formatCardNo(bankForm.value.cardNo)}，等待平台提交拉卡拉审核`)
      message.info('已通知平台处理')
      message.success('收款账户资料已提交，等待平台处理')
    } else {
      message.error('验证码错误，请输入123456')
    }
  }, 500)
}

function startCoolingTimer() {
  if (coolingTimer) clearInterval(coolingTimer)

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
    message.info('收款账户资料需由平台提交拉卡拉审核后生效')
  }
}

async function handleRevoke() {
  revoking.value = true

  setTimeout(() => {
    revoking.value = false

    if (pendingChange.value) {
      addOperationLog('info', '收款账户资料提交已撤销', '用户主动撤销待平台处理的资料')
    }

    pendingChange.value = null
    localStorage.removeItem('cpPendingBankChange')

    if (coolingTimer) {
      clearInterval(coolingTimer)
      coolingTimer = null
    }

    message.success('申请已撤销')
  }, 1000)
}

function cancelEdit() {
  isEditing.value = false
}

function resetFirstSettlementSubmissionTest() {
  bankAccount.value = null
  pendingChange.value = null
  receiverAttachmentFiles.value = {}
  isEditing.value = false
  localStorage.removeItem('cpPendingBankChange')
  operationLogs.value = []
  addOperationLog('info', '进入首次提交测试', '当前演示账号已切换为未完善收款账户，可点击“完善资料”测试首次提交')
  message.success('已切换到首次提交测试，请点击“完善资料”')
}

function restoreSettlementDemo() {
  pendingChange.value = null
  receiverAttachmentFiles.value = {}
  bankAccount.value = {
    accountKind: 'public',
    bankName: 'CMB',
    bankNameText: '招商银行',
    cardNo: '6214838888888888888',
    holderName: '北京极境互动科技有限公司',
    idCard: '91440300MA5CP0001X',
    licenseNo: '91440300MA5CP0001X',
    licenseName: '北京极境互动科技有限公司',
    legalPersonName: '张伟',
    legalPersonCertificateNo: '110101199001011234',
    attachmentsReady: true,
    attachmentNames: ['法人身份证正面', '法人身份证反面', '银行卡', '营业执照'],
    profileConfirmed: true,
  }
  isEditing.value = false
  localStorage.removeItem('cpPendingBankChange')
  operationLogs.value = []
  addOperationLog('success', '收款账户已生效', `${bankAccount.value.bankNameText} - ${formatCardNo(bankAccount.value.cardNo)}`)
  message.success('已恢复已生效演示数据')
}

function formatRemainingTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) return `${hours}小时${minutes}分${secs}秒`
  if (minutes > 0) return `${minutes}分${secs}秒`
  return `${secs}秒`
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

  localStorage.setItem('cpBankOperationLogs', JSON.stringify(operationLogs.value))
}

function loadPendingChange() {
  const saved = localStorage.getItem('cpPendingBankChange')
  if (saved) {
    try {
      pendingChange.value = JSON.parse(saved)
    } catch {
      localStorage.removeItem('cpPendingBankChange')
    }
  }
}

function loadOperationLogs() {
  const saved = localStorage.getItem('cpBankOperationLogs')
  if (saved) {
    try {
      operationLogs.value = JSON.parse(saved)
    } catch {
      localStorage.removeItem('cpBankOperationLogs')
    }
  }

  if (operationLogs.value.length === 0 && bankAccount.value) {
    addOperationLog('success', '收款账户已生效', `${bankAccount.value.bankNameText} - ${formatCardNo(bankAccount.value.cardNo)}`)
  }
}

onMounted(() => {
  loadPendingChange()
  loadOperationLogs()
})

onUnmounted(() => {
  if (coolingTimer) {
    clearInterval(coolingTimer)
    coolingTimer = null
  }
})
</script>

<style scoped>
.page-container { max-width: 900px; }
.page-header { margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.header-desc { font-size: 13px; color: var(--text-muted); margin-top: 4px; display: block; }

.settlement-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 24px;
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

/* 待平台处理提示 */
.cooling-alert {
  margin-bottom: 24px; padding: 16px 20px; background: #fff7e6;
  border: 1px solid #ffd591; border-radius: 10px;
}
.cooling-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.cooling-header h4 { margin: 0; color: #d46b08; display: flex; align-items: center; gap: 6px; }
.cooling-body p { margin: 4px 0; font-size: 14px; color: #666; }

/* 银行卡区域 */
.bank-section { background: white; border-radius: 14px; padding: 24px; border: 1px solid var(--border-color); margin-bottom: 24px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.section-header h3 { margin: 0; font-size: 16px; font-weight: 600; color: var(--text-primary); }
.bank-form { max-width: 480px; }
.bank-display { max-width: 560px; }

.pending-display {
  max-width: 640px;
  border-color: #facc15;
}

/* 操作日志 */
.logs-section { background: white; border-radius: 14px; padding: 16px; border: 1px solid var(--border-color); }

.modal-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
</style>
