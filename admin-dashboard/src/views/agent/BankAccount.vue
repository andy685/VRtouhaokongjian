<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>提现账户</h1>
        <p class="header-desc">管理银行账户信息，用于接收分润结算款项（平台按期自动打款）</p>
      </div>
    </div>

    <!-- 提示信息 -->
    <n-alert type="info" :bordered="false" style="margin-bottom: 24px;">
      <template #header>结算说明</template>
      平台将按照配置的结算周期自动生成结算单并打款到此账户，无需手动申请提现。
      如需修改账户信息，请点击下方编辑按钮（修改后需经过冷却期才生效）。
    </n-alert>

    <!-- 冷却期提示 -->
    <div v-if="pendingChange" class="cooling-alert">
      <div class="cooling-header">
        <h4><n-icon :component="TimeOutline" /> 账户修改冷却期中</h4>
        <n-button type="warning" size="small" @click="handleRevoke" :loading="revoking">
          撤销修改
        </n-button>
      </div>
      <div class="cooling-body">
        <p>新账户：{{ pendingChange.bankNameText }} - {{ formatCardNo(pendingChange.cardNo) }}</p>
        <p>预计生效时间：{{ pendingChange.effectiveTime }}</p>
        <p>剩余时间：{{ formatRemainingTime(pendingChange.remainingSeconds) }}</p>
      </div>
    </div>

    <!-- 提现账户信息 -->
    <div class="bank-section">
      <div class="section-header">
        <h3>银行账户</h3>
        <n-button v-if="!isEditingBank && !pendingChange" text type="primary" @click="startEditBank">
          <template #icon><n-icon :component="CreateOutline" /></template>
          编辑
        </n-button>
      </div>

      <!-- 编辑表单 -->
      <n-form v-if="isEditingBank" label-placement="left" label-width="100" class="bank-form">
        <n-form-item label="开户银行" required>
          <n-select v-model:value="bankForm.bankName" :options="bankOptions" placeholder="请选择开户银行" />
        </n-form-item>
        <n-form-item label="银行卡号" required>
          <n-input v-model:value="bankForm.cardNo" placeholder="请输入银行卡号" maxlength="23" />
        </n-form-item>
        <n-form-item label="开户人姓名" required>
          <n-input v-model:value="bankForm.accountName" placeholder="请输入开户人姓名" />
        </n-form-item>
        <n-form-item label="身份证号" required>
          <n-input v-model:value="bankForm.idCard" placeholder="请输入身份证号" maxlength="18" />
        </n-form-item>
        <n-form-item>
          <n-space>
            <n-button type="primary" @click="saveBankInfo" :loading="saving">保存</n-button>
            <n-button @click="cancelEditBank">取消</n-button>
          </n-space>
        </n-form-item>
      </n-form>

      <!-- 已绑定账户展示 -->
      <n-descriptions v-else-if="bankInfo && !pendingChange" label-placement="left" :column="1" bordered class="bank-display">
        <n-descriptions-item label="开户银行">{{ bankInfo.bankNameText }}</n-descriptions-item>
        <n-descriptions-item label="银行卡号">{{ formatCardNo(bankInfo.cardNo) }}</n-descriptions-item>
        <n-descriptions-item label="开户人">{{ bankInfo.accountName }}</n-descriptions-item>
        <n-descriptions-item label="身份证号">{{ formatIDCard(bankInfo.idCard) }}</n-descriptions-item>
        <n-descriptions-item label="状态">
          <n-tag type="success" size="small">已绑定</n-tag>
        </n-descriptions-item>
      </n-descriptions>

      <n-empty v-else-if="!bankInfo && !pendingChange" description="未绑定银行账户，点击编辑按钮添加" />
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
import { ref, onMounted, onUnmounted } from 'vue'
import {
  NButton, NIcon, NTag, NForm, NFormItem, NInput, NSelect,
  NDescriptions, NDescriptionsItem, NEmpty, NAlert, NModal, NSpace,
  NCollapse, NCollapseItem, NTimeline, NTimelineItem, useMessage
} from 'naive-ui'
import {
  TimeOutline, CreateOutline
} from '@vicons/ionicons5'

const message = useMessage()

// 银行账户信息
const bankInfo = ref<{ bankName: string; bankNameText: string; cardNo: string; accountName: string; idCard: string } | null>({
  bankName: 'ICBC',
  bankNameText: '中国工商银行',
  cardNo: '6222021234567890123',
  accountName: '深圳未来科技',
  idCard: '440301199001011234'
})

const isEditingBank = ref(false)
const saving = ref(false)
const bankForm = ref({ bankName: '', cardNo: '', accountName: '', idCard: '' })

const bankOptions = [
  { label: '中国工商银行', value: 'ICBC' },
  { label: '中国建设银行', value: 'CCB' },
  { label: '中国农业银行', value: 'ABC' },
  { label: '中国银行', value: 'BOC' },
  { label: '交通银行', value: 'BOCOM' },
  { label: '招商银行', value: 'CMB' },
]

// 冷却期相关
const pendingChange = ref<{
  bankName: string;
  bankNameText: string;
  cardNo: string;
  accountName: string;
  idCard: string;
  effectiveTime: string;
  remainingSeconds: number;
} | null>(null)
const revoking = ref(false)
let coolingTimer: number | null = null

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

function formatIDCard(idCard: string) {
  if (!idCard) return ''
  return idCard.replace(/(\d{4})\d+(\d{4})/, '$1********$2')
}

function startEditBank() {
  if (bankInfo.value) {
    bankForm.value = { ...bankInfo.value, bankNameText: '' }
  } else {
    bankForm.value = { bankName: '', cardNo: '', accountName: '', idCard: '' }
  }
  isEditingBank.value = true
}

async function saveBankInfo() {
  if (!bankForm.value.bankName || !bankForm.value.cardNo || !bankForm.value.accountName || !bankForm.value.idCard) {
    message.warning('请填写完整信息')
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

      // 创建冷却期修改
      const effectiveTime = new Date(Date.now() + 10 * 60 * 1000)
      pendingChange.value = {
        ...bankForm.value,
        bankNameText: bankOptions.find(b => b.value === bankForm.value.bankName)?.label || '',
        effectiveTime: effectiveTime.toLocaleString('zh-CN'),
        remainingSeconds: 600
      }

      isEditingBank.value = false
      localStorage.setItem('agentPendingBankChange', JSON.stringify(pendingChange.value))

      addOperationLog('warning', '账户修改申请已提交', `新账户：${pendingChange.value.bankNameText} - ${formatCardNo(bankForm.value.cardNo)}，进入10分钟冷却期`)
      message.info('修改已进入冷却期，10分钟后生效')

      startCoolingTimer()
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
  if (pendingChange.value) {
    bankInfo.value = {
      bankName: pendingChange.value.bankName,
      bankNameText: pendingChange.value.bankNameText,
      cardNo: pendingChange.value.cardNo,
      accountName: pendingChange.value.accountName,
      idCard: pendingChange.value.idCard
    }

    addOperationLog('success', '账户修改已生效', `新账户：${pendingChange.value.bankNameText} - ${formatCardNo(pendingChange.value.cardNo)}`)

    pendingChange.value = null
    localStorage.removeItem('agentPendingBankChange')

    message.success('银行账户修改已生效')

    if (coolingTimer) {
      clearInterval(coolingTimer)
      coolingTimer = null
    }
  }
}

async function handleRevoke() {
  revoking.value = true

  setTimeout(() => {
    revoking.value = false

    if (pendingChange.value) {
      addOperationLog('info', '账户修改已撤销', '用户主动撤销修改申请')
    }

    pendingChange.value = null
    localStorage.removeItem('agentPendingBankChange')

    if (coolingTimer) {
      clearInterval(coolingTimer)
      coolingTimer = null
    }

    message.success('修改已撤销')
  }, 1000)
}

function cancelEditBank() {
  isEditingBank.value = false
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

  localStorage.setItem('agentBankOperationLogs', JSON.stringify(operationLogs.value))
}

function loadPendingChange() {
  const saved = localStorage.getItem('agentPendingBankChange')
  if (saved) {
    try {
      pendingChange.value = JSON.parse(saved)
      startCoolingTimer()
    } catch (e) {
      localStorage.removeItem('agentPendingBankChange')
    }
  }
}

function loadOperationLogs() {
  const saved = localStorage.getItem('agentBankOperationLogs')
  if (saved) {
    try {
      operationLogs.value = JSON.parse(saved)
    } catch (e) {
      localStorage.removeItem('agentBankOperationLogs')
    }
  }

  if (operationLogs.value.length === 0 && bankInfo.value) {
    addOperationLog('success', '银行账户已绑定', `${bankInfo.value.bankNameText} - ${formatCardNo(bankInfo.value.cardNo)}`)
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
</script>

<style scoped>
.page-container { max-width: 900px; }
.page-header { margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.header-desc { font-size: 13px; color: var(--text-muted); margin-top: 4px; display: block; }

/* 冷却期 */
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

/* 操作日志 */
.logs-section { background: white; border-radius: 14px; padding: 16px; border: 1px solid var(--border-color); }

.modal-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
</style>
