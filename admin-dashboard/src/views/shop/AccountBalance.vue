<template>
  <div class="account-balance-page">
    <div class="page-header">
      <h2 class="page-title">账户</h2>
    </div>

    <n-tabs v-model:value="activeTab" type="line" class="account-tabs">
      <n-tab-pane name="operating" tab="运营账户">
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
      </n-tab-pane>

      <n-tab-pane name="basic" tab="基础账户">
        <div class="balance-card basic-account">
          <div class="basic-balance-layout">
            <div class="basic-balance-left">
              <div class="balance-amount">¥{{ basicBalance }}</div>
              <n-button text type="primary" class="view-bills" @click="viewBills('basic')">
                查看账单
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
          <!-- 商家游戏豆模式 -->
          <div class="game-bean-mode">
            <span class="mode-label">商家游戏豆模式：</span>
            <n-radio-group v-model:value="gameBeanMode" size="small">
              <n-radio value="dedicated">游戏豆专用</n-radio>
              <n-radio value="universal">游戏豆通用</n-radio>
            </n-radio-group>
            <span class="mode-hint">
              说明：游戏豆专用是各店铺游戏豆充值仅用于当前店铺点播，游戏豆通用是各店铺游戏豆充值可用于所有店铺点播
            </span>
          </div>

          <!-- 商家游戏豆余额 -->
          <div class="game-bean-total">
            <span class="total-label">商家游戏豆：</span>
            <span class="total-value">{{ merchantGameBean }}</span>
            <n-tag type="warning" size="small" class="total-tip" v-if="gameBeanMode === 'dedicated'">
              注意：商家游戏豆余额不等于各店铺游戏豆余额之和
            </n-tag>
            <n-tag type="info" size="small" class="total-tip" v-else>
              注意：全局游戏豆可在所有店铺使用
            </n-tag>
          </div>

          <!-- 店铺游戏豆表格 -->
          <div class="game-bean-table-section" v-if="gameBeanMode === 'dedicated'">
            <div class="table-title">店铺游戏豆：</div>
            <n-data-table
              :columns="gameBeanColumns"
              :data="gameBeanStoreList"
              :bordered="false"
              :single-line="true"
              size="small"
              class="game-bean-table"
            />
          </div>

          <!-- 全局游戏豆信息 -->
          <div class="game-bean-universal-info" v-else>
            <div class="universal-info-content">
              <p>全局游戏豆可在所有店铺使用，统一管理</p>
              <p>充值后游戏豆会自动添加到全局余额中</p>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="game-bean-actions">
            <n-button type="primary" ghost class="game-bean-btn" @click="handleTransfer" v-if="gameBeanMode === 'dedicated'">游戏豆转移</n-button>
            <n-button type="primary" class="game-bean-btn" @click="handleRecharge">去充值</n-button>
            <n-button type="primary" ghost class="game-bean-btn" @click="viewBills('game-bean')">查看账单</n-button>
          </div>
        </div>
      </n-tab-pane>

      <n-tab-pane name="bank" tab="提现账户">
        <div class="bank-card">
          <!-- 冷却期提示 -->
          <div v-if="pendingChange" class="cooling-alert" style="margin-bottom: 20px; padding: 16px; background: #fff7e6; border: 1px solid #ffd591; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <h4 style="margin: 0; color: #d46b08;">⏰ 提现账户修改冷却期中</h4>
              <n-button type="warning" size="small" @click="handleRevoke" :loading="revoking">
                撤销修改
              </n-button>
            </div>
            <div style="font-size: 14px; color: #666;">
              <p style="margin: 6px 0;">新账户：{{ pendingChange.bankNameText }} - {{ formatCardNo(pendingChange.cardNo) }}</p>
              <p style="margin: 6px 0;">预计生效时间：{{ pendingChange.effectiveTime }}</p>
              <p style="margin: 6px 0;">冷却期剩余：{{ formatRemainingTime(pendingChange.remainingSeconds) }}</p>
            </div>
          </div>

          <div class="bank-header">
            <h4>提现账户信息</h4>
            <n-button v-if="!isEditingBank && !pendingChange" text type="primary" @click="startEditBank">编辑</n-button>
          </div>
          
          <n-form v-if="isEditingBank" label-placement="left" label-width="100">
            <n-form-item label="开户银行">
              <n-select v-model:value="bankForm.bankName" :options="bankOptions" placeholder="请选择开户银行" />
            </n-form-item>
            <n-form-item label="银行卡号">
              <n-input v-model:value="bankForm.cardNo" placeholder="请输入银行卡号" maxlength="23" />
            </n-form-item>
            <n-form-item label="开户人姓名">
              <n-input v-model:value="bankForm.accountName" placeholder="请输入开户人姓名" />
            </n-form-item>
            <n-form-item label="身份证号">
              <n-input v-model:value="bankForm.idCard" placeholder="请输入身份证号" maxlength="18" />
            </n-form-item>
            <n-form-item>
              <n-space>
                <n-button type="primary" @click="saveBankInfo">保存</n-button>
                <n-button @click="cancelEditBank">取消</n-button>
              </n-space>
            </n-form-item>
          </n-form>
          
          <n-descriptions v-else-if="bankInfo && !pendingChange" label-placement="left" :column="1" bordered>
            <n-descriptions-item label="开户银行">{{ bankInfo.bankNameText }}</n-descriptions-item>
            <n-descriptions-item label="银行卡号">{{ formatCardNo(bankInfo.cardNo) }}</n-descriptions-item>
            <n-descriptions-item label="开户人">{{ bankInfo.accountName }}</n-descriptions-item>
            <n-descriptions-item label="身份证号">{{ formatIDCard(bankInfo.idCard) }}</n-descriptions-item>
            <n-descriptions-item label="状态">
              <n-tag type="success" size="small">已绑定</n-tag>
            </n-descriptions-item>
          </n-descriptions>
          
          <n-empty v-else-if="!bankInfo && !pendingChange" description="未绑定提现账户" />
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

    <!-- 冷却期提示弹窗 -->
    <n-modal
      v-model:show="coolingModalVisible"
      title="提现账户修改已提交"
      preset="success"
      :closable="false"
      :mask-closable="false"
      style="width: 500px;"
    >
      <div class="cooling-content">
        <n-result
          status="success"
          title="修改申请已提交"
          description="您的提现账户修改申请已进入24小时冷却期"
        >
          <template #footer>
            <div class="cooling-info">
              <n-alert type="warning" style="margin-bottom: 16px;">
                <template #header>
                  <span>⏰ 冷却期说明</span>
                </template>
                <ul style="margin: 8px 0; padding-left: 20px;">
                  <li>冷却期时长：24小时</li>
                  <li>冷却期内可撤销修改</li>
                  <li>冷却期结束后，新账户自动生效</li>
                  <li>修改期间会发送邮件和短信通知</li>
                </ul>
              </n-alert>
              <div class="cooling-timer">
                <n-statistic label="距离生效还剩" :value="coolingTimeRemaining" />
              </div>
            </div>
          </template>
        </n-result>
      </div>
      <template #footer>
        <div class="modal-footer">
          <n-button @click="revokeChange" :loading="revoking">
            撤销修改
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
  NTabs, NTabPane, NButton, NRadioGroup, NRadio, NTag, NDataTable, 
  NModal, NSelect, NInput, NForm, NFormItem, NEmpty, NDescriptions, 
  NDescriptionsItem, NInputGroup, NAlert, NResult, NStatistic, NCountdown,
  NTimeline, NTimelineItem, NCollapse, NCollapseItem,
  useMessage, type FormInst
} from 'naive-ui'

const message = useMessage()
const router = useRouter()
const activeTab = ref('operating')

// 提现账户相关
const bankInfo = ref<{ bankName: string; bankNameText: string; cardNo: string; accountName: string; idCard: string } | null>({
  bankName: 'ICBC',
  bankNameText: '中国工商银行',
  cardNo: '6222021234567890123',
  accountName: '张三',
  idCard: '440301199001011234'
})

const isEditingBank = ref(false)
const bankForm = ref({ bankName: '', cardNo: '', accountName: '', idCard: '' })

// 验证相关
const verifyModalVisible = ref(false)
const verifyCode = ref('')
const cooldown = ref(0)
const verifying = ref(false)
const maskedPhone = ref('138****8000') // 模拟手机号

// 冷却期相关
const coolingModalVisible = ref(false)
const pendingChange = ref<{
  bankName: string;
  bankNameText: string;
  cardNo: string;
  accountName: string;
  idCard: string;
  effectiveTime: string;
  remainingSeconds: number;
} | null>(null)
const coolingTimeRemaining = ref('')
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

function startEditBank() {
  if (bankInfo.value) {
    bankForm.value = { ...bankInfo.value, bankNameText: '' }
  } else {
    bankForm.value = { bankName: '', cardNo: '', accountName: '', idCard: '' }
  }
  isEditingBank.value = true
}

function saveBankInfo() {
  // 先验证表单
  if (!bankForm.value.bankName || !bankForm.value.cardNo || !bankForm.value.accountName || !bankForm.value.idCard) {
    message.warning('请填写完整信息')
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
      
      // 创建待生效的修改（冷却期）- 改为10分钟方便测试
      const effectiveTime = new Date(Date.now() + 10 * 60 * 1000) // 10分钟后生效
      const remainingSeconds = 10 * 60 // 10分钟 = 600秒
      
      pendingChange.value = {
        ...bankForm.value,
        bankNameText: bankOptions.find(b => b.value === bankForm.value.bankName)?.label || '',
        effectiveTime: effectiveTime.toLocaleString('zh-CN'),
        remainingSeconds
      }
      
      isEditingBank.value = false
      
      // 保存到localStorage（模拟后端存储）
      localStorage.setItem('pendingBankChange', JSON.stringify(pendingChange.value))
      
      // 添加操作日志
      addOperationLog('warning', '提现账户修改申请已提交', `新账户：${pendingChange.value.bankNameText} - ${formatCardNo(bankForm.value.cardNo)}，进入10分钟冷却期`)
      
      // 发送通知（模拟）
      message.info('已发送邮件和短信通知')
      message.success('修改已进入冷却期，10分钟后生效')
      
      // 开始倒计时
      startCoolingTimer()
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
  // 冷却期结束，应用修改
  if (pendingChange.value) {
    bankInfo.value = {
      bankName: pendingChange.value.bankName,
      bankNameText: pendingChange.value.bankNameText,
      cardNo: pendingChange.value.cardNo,
      accountName: pendingChange.value.accountName,
      idCard: pendingChange.value.idCard
    }
    
    addOperationLog('success', '提现账户修改已生效', `新账户：${pendingChange.value.bankNameText} - ${formatCardNo(pendingChange.value.cardNo)}`)
    
    pendingChange.value = null
    localStorage.removeItem('pendingBankChange')
    
    message.success('提现账户修改已生效')
    
    if (coolingTimer) {
      clearInterval(coolingTimer)
      coolingTimer = null
    }
  }
}

async function revokeChange() {
  revoking.value = true
  
  // 模拟撤销
  setTimeout(() => {
    revoking.value = false
    
    if (pendingChange.value) {
      addOperationLog('info', '提现账户修改已撤销', '用户主动撤销修改申请')
    }
    
    pendingChange.value = null
    localStorage.removeItem('pendingBankChange')
    
    coolingModalVisible.value = false
    
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
      startCoolingTimer()
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
    addOperationLog('success', '提现账户已绑定', `${bankInfo.value.bankNameText} - ${formatCardNo(bankInfo.value.cardNo)}`)
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
const gameBeanMode = ref('dedicated')
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
  } else {
    router.push('/shop/account/recharge')
  }
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

.game-bean-mode {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.mode-label {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

.mode-hint {
  font-size: 12px;
  color: var(--text-muted);
  background: #f0f9ff;
  padding: 4px 10px;
  border-radius: 4px;
  line-height: 1.5;
}

.game-bean-total {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
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

.table-title {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
  margin-bottom: 8px;
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

/* 通用游戏豆信息 */
.game-bean-universal-info {
  margin: 16px 0;
  padding: 16px;
  background: #f0f9ff;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.universal-info-content p {
  margin: 8px 0;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* 游戏豆转移弹窗 */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}



/* 提现账户 */
.bank-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 600px;
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

/* 冷却期相关样式 */
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
