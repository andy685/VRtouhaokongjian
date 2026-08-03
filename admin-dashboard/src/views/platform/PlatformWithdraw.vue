<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>平台提现</h1>
        <p class="header-desc">平台主体资金归集后，仅可提取未被商家待结算、代理商待分润、CP待结算和风险准备金占用的可提现余额</p>
      </div>
      <n-space>
        <n-button secondary @click="handleRefresh">
          <template #icon><n-icon :component="RefreshOutline" /></template>
          刷新余额
        </n-button>
        <n-button type="primary" :disabled="availableWithdrawableBalance <= 0" @click="openWithdrawModal">
          <template #icon><n-icon :component="ArrowUpOutline" /></template>
          发起提现
        </n-button>
      </n-space>
    </div>

    <div class="hero-card">
      <div class="hero-main">
        <span class="hero-label">当前可提现余额</span>
        <strong class="hero-value">¥{{ availableWithdrawableBalance.toLocaleString() }}</strong>
        <p class="hero-sub">商家退款已直接冲减待结算净额；提现处理中金额会继续占用额度，避免同一批资金被重复申请提现。</p>
      </div>
      <div class="hero-side">
        <div class="hero-side-item">
          <span>平台主体账户</span>
          <strong>头号空间运营平台</strong>
        </div>
        <div class="hero-side-item">
          <span>默认收款账户</span>
          <strong>招商银行 末尾 8821</strong>
        </div>
        <div class="hero-side-item">
          <span>最新成功提现</span>
          <strong>2026-08-02 16:40</strong>
        </div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card total">
        <span class="stat-label">主体账户余额</span>
        <strong class="stat-value">¥{{ funds.subjectBalance.toLocaleString() }}</strong>
        <span class="stat-desc">拉卡拉主体账户当前归集资金</span>
      </div>
      <div class="stat-card freeze">
        <span class="stat-label">商家待结算占用</span>
        <strong class="stat-value">¥{{ funds.autoSplitFrozen.toLocaleString() }}</strong>
        <span class="stat-desc">已扣除退款后的商家待结算净额</span>
      </div>
      <div class="stat-card freeze">
        <span class="stat-label">代理商待分润占用</span>
        <strong class="stat-value">¥{{ funds.agentCommissionFrozen.toLocaleString() }}</strong>
        <span class="stat-desc">已生成但未执行的代理商分润</span>
      </div>
      <div class="stat-card freeze">
        <span class="stat-label">待 CP 结算占用</span>
        <strong class="stat-value">¥{{ funds.cpSettlementFrozen.toLocaleString() }}</strong>
        <span class="stat-desc">按账期待执行的 CP 分账</span>
      </div>
      <div class="stat-card reserve">
        <span class="stat-label stat-label-with-tip">
          风险准备金
          <n-tooltip trigger="hover">
            <template #trigger>
              <n-icon class="hint-icon" :component="HelpCircleOutline" />
            </template>
            用于覆盖异常订单、手续费误差、补差追偿等平台侧安全垫。
            当前建议按较轻量的动态口径管理，不直接参与商家退款冻结。
          </n-tooltip>
        </span>
        <strong class="stat-value">¥{{ funds.riskReserve.toLocaleString() }}</strong>
        <span class="stat-desc">异常订单、补差和清算安全垫</span>
      </div>
      <div class="stat-card processing">
        <span class="stat-label">提现处理中占用</span>
        <strong class="stat-value">¥{{ processingWithdrawOccupied.toLocaleString() }}</strong>
        <span class="stat-desc">已发起但未到账的提现申请占额</span>
      </div>
      <div class="stat-card available">
        <span class="stat-label">可提现余额</span>
        <strong class="stat-value">¥{{ availableWithdrawableBalance.toLocaleString() }}</strong>
        <span class="stat-desc">已扣除处理中提现后的当前可申请上限</span>
      </div>
    </div>

    <div class="content-grid">
      <n-card class="formula-card" :bordered="false">
        <template #header>
          <div class="card-title">
            <span>余额口径</span>
            <n-tag type="success" size="small" :bordered="false">已收口</n-tag>
          </div>
        </template>
        <div class="formula-box">
          <code>可提现余额 = 主体账户余额 - 商家待结算占用 - 代理商待分润占用 - 待 CP 结算占用 - 风险准备金 - 提现处理中占用</code>
        </div>
        <div class="formula-list">
          <div class="formula-item">
            <span>主体账户余额</span>
            <strong>¥{{ funds.subjectBalance.toLocaleString() }}</strong>
          </div>
          <div class="formula-item minus">
            <span>商家待结算占用</span>
            <strong>-¥{{ funds.autoSplitFrozen.toLocaleString() }}</strong>
          </div>
          <div class="formula-item minus">
            <span>代理商待分润占用</span>
            <strong>-¥{{ funds.agentCommissionFrozen.toLocaleString() }}</strong>
          </div>
          <div class="formula-item minus">
            <span>待 CP 结算占用</span>
            <strong>-¥{{ funds.cpSettlementFrozen.toLocaleString() }}</strong>
          </div>
          <div class="formula-item minus">
            <span>风险准备金</span>
            <strong>-¥{{ funds.riskReserve.toLocaleString() }}</strong>
          </div>
          <div class="formula-item minus">
            <span>提现处理中占用</span>
            <strong>-¥{{ processingWithdrawOccupied.toLocaleString() }}</strong>
          </div>
          <div class="formula-item result">
            <span>可提现余额</span>
            <strong>¥{{ availableWithdrawableBalance.toLocaleString() }}</strong>
          </div>
        </div>
      </n-card>

      <n-card class="rule-card" :bordered="false">
        <template #header>
          <div class="card-title">
            <span>提现约束</span>
          </div>
        </template>
        <div class="rule-list">
          <div class="rule-item">
            <strong>先冻结，后提现</strong>
            <span>商家待结算净额、代理商待分润和 CP 账期结算金额都先占用，再计算平台可提现余额。</span>
          </div>
          <div class="rule-item">
            <strong>提现不影响分账</strong>
            <span>平台提现不能占用商家、代理商、CP 已占用的结算资金，避免后续出现分账失败或 CP 无法结算。</span>
          </div>
          <div class="rule-item">
            <strong>超额禁止提交</strong>
            <span>提现申请金额大于可提现余额时，系统直接拦截，不允许提交到财务审核。</span>
          </div>
          <div class="rule-item">
            <strong>退款已并入商家待结算</strong>
            <span>未结算前发生的退款直接冲减商家待结算金额；已结算订单由门店线下退款，不再额外占用平台主体余额。</span>
          </div>
          <div class="rule-item">
            <strong>审核后再出账</strong>
            <span>提现申请先进入平台审核，审核通过后才同步拉卡拉或线下出款流程。</span>
          </div>
          <div class="rule-item">
            <strong>处理中继续占额</strong>
            <span>只要提现记录还是“处理中”，对应金额就持续占用平台可提现额度，到账或驳回后才释放。</span>
          </div>
        </div>
      </n-card>
    </div>

    <n-card class="table-card" :bordered="false">
      <template #header>
        <div class="card-title">
          <span>提现记录</span>
          <n-space size="small">
            <n-tag type="warning" :bordered="false">处理中 {{ processingCount }} 笔</n-tag>
            <n-tag type="warning" :bordered="false">占额 ¥{{ processingWithdrawOccupied.toLocaleString() }}</n-tag>
            <n-tag type="success" :bordered="false">本月成功 {{ successCount }} 笔</n-tag>
          </n-space>
        </div>
      </template>
      <n-data-table
        :columns="columns"
        :data="withdrawRecords"
        :pagination="{ pageSize: 6 }"
        :row-key="(row: WithdrawRecord) => row.id"
        striped
      />
    </n-card>

    <n-modal v-model:show="showWithdrawModal" preset="card" title="发起平台提现" style="width: 640px;" :bordered="false">
      <n-form label-placement="top">
        <n-alert type="info" :bordered="false" class="withdraw-alert">
          当前可提现余额：<strong>¥{{ availableWithdrawableBalance.toLocaleString() }}</strong>
        </n-alert>
        <div class="withdraw-grid">
          <n-form-item label="提现主体">
            <n-input value="头号空间运营平台" readonly />
          </n-form-item>
          <n-form-item label="收款账户">
            <n-select v-model:value="withdrawForm.accountId" :options="accountOptions" />
          </n-form-item>
          <n-form-item label="提现金额" required>
            <div class="amount-input-row">
              <n-input-number v-model:value="withdrawForm.amount" :min="1000" :max="availableWithdrawableBalance" :step="1000" style="width: 100%;" />
              <n-button secondary size="small" @click="fillAllWithdrawable">全部</n-button>
            </div>
          </n-form-item>
          <n-form-item label="预计到账日期">
            <n-input value="T+1 工作日" readonly />
          </n-form-item>
          <n-form-item label="备注" class="grid-wide">
            <n-input v-model:value="withdrawForm.remark" type="textarea" maxlength="100" placeholder="例如：8月平台经营利润提取" />
          </n-form-item>
        </div>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showWithdrawModal = false">取消</n-button>
          <n-button type="primary" :disabled="availableWithdrawableBalance <= 0" @click="submitWithdraw">提交提现申请</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, h, reactive, ref } from 'vue'
import {
  NAlert,
  NButton,
  NCard,
  NDataTable,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NInputNumber,
  NModal,
  NSpace,
  NSelect,
  NTag,
  NTooltip,
  useMessage,
} from 'naive-ui'
import {
  AlertCircleOutline,
  ArrowUpOutline,
  CheckmarkDoneOutline,
  HelpCircleOutline,
  RefreshOutline,
  TimeOutline,
  WarningOutline,
} from '@vicons/ionicons5'

const message = useMessage()

const funds = reactive({
  subjectBalance: 2856400,
  autoSplitFrozen: 926800,
  agentCommissionFrozen: 241600,
  cpSettlementFrozen: 684200,
  riskReserve: 485000,
})

type WithdrawStatus = 'processing' | 'success' | 'rejected'

interface WithdrawRecord {
  id: number
  orderNo: string
  amount: number
  accountName: string
  accountTailNo: string
  applicant: string
  appliedAt: string
  status: WithdrawStatus
  statusText: string
  remark: string
}

const withdrawRecords = ref<WithdrawRecord[]>([
  { id: 1, orderNo: 'WD20260802001', amount: 320000, accountName: '招商银行 - 头号空间平台运营账户', accountTailNo: '8821', applicant: '平台财务-李青', appliedAt: '2026-08-02 16:40', status: 'success', statusText: '已到账', remark: '7月平台利润提取' },
  { id: 2, orderNo: 'WD20260801001', amount: 180000, accountName: '招商银行 - 头号空间平台运营账户', accountTailNo: '8821', applicant: '平台财务-李青', appliedAt: '2026-08-01 10:20', status: 'success', statusText: '已到账', remark: '平台备用金回笼' },
  { id: 3, orderNo: 'WD20260731002', amount: 95000, accountName: '建设银行 - 平台结算二户', accountTailNo: '2148', applicant: '平台财务-赵楠', appliedAt: '2026-07-31 18:10', status: 'processing', statusText: '处理中', remark: '月末现金流调拨' },
  { id: 4, orderNo: 'WD20260730001', amount: 500000, accountName: '招商银行 - 头号空间平台运营账户', accountTailNo: '8821', applicant: '平台财务-李青', appliedAt: '2026-07-30 09:05', status: 'rejected', statusText: '已驳回', remark: '超出当日可提现余额' },
])

const showWithdrawModal = ref(false)
const withdrawForm = reactive({
  accountId: 'cmb-main',
  amount: 100000,
  remark: '',
})

const accountOptions = [
  { label: '招商银行 - 头号空间平台运营账户（8821）', value: 'cmb-main' },
  { label: '建设银行 - 平台结算二户（2148）', value: 'ccb-second' },
]

const processingCount = computed(() => withdrawRecords.value.filter((item) => item.status === 'processing').length)
const successCount = computed(() => withdrawRecords.value.filter((item) => item.status === 'success').length)
const processingWithdrawOccupied = computed(() =>
  withdrawRecords.value
    .filter((item) => item.status === 'processing')
    .reduce((sum, item) => sum + item.amount, 0)
)
const baseWithdrawableBalance = computed(() => Math.max(
  funds.subjectBalance
  - funds.autoSplitFrozen
  - funds.agentCommissionFrozen
  - funds.cpSettlementFrozen
  - funds.riskReserve,
  0,
))
const availableWithdrawableBalance = computed(() => Math.max(
  baseWithdrawableBalance.value - processingWithdrawOccupied.value,
  0,
))

const columns = [
  { title: '申请单号', key: 'orderNo', width: 140, render: (row: WithdrawRecord) => h('span', { style: 'font-family: monospace; font-size: 12px;' }, row.orderNo) },
  { title: '提现金额', key: 'amount', width: 120, render: (row: WithdrawRecord) => h('strong', { style: 'color: #0f172a;' }, `¥${row.amount.toLocaleString()}`) },
  { title: '收款账户', key: 'accountName', minWidth: 220 },
  { title: '尾号', key: 'accountTailNo', width: 80 },
  { title: '申请人', key: 'applicant', width: 120 },
  { title: '申请时间', key: 'appliedAt', width: 150 },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row: WithdrawRecord) => h(
      NTag,
      {
        type: row.status === 'success' ? 'success' : row.status === 'processing' ? 'warning' : 'error',
        size: 'small',
        bordered: false,
      },
      () => row.statusText,
    ),
  },
  { title: '备注', key: 'remark', minWidth: 180, ellipsis: { tooltip: true } },
]

function handleRefresh() {
  message.success('平台主体余额已刷新')
}

function openWithdrawModal() {
  withdrawForm.accountId = 'cmb-main'
  withdrawForm.amount = Math.min(100000, availableWithdrawableBalance.value)
  withdrawForm.remark = ''
  showWithdrawModal.value = true
}

function fillAllWithdrawable() {
  withdrawForm.amount = availableWithdrawableBalance.value
}

function submitWithdraw() {
  if (!withdrawForm.accountId) {
    message.warning('请选择收款账户')
    return
  }
  if (!withdrawForm.amount || withdrawForm.amount <= 0) {
    message.warning('请输入提现金额')
    return
  }
  if (withdrawForm.amount > availableWithdrawableBalance.value) {
    message.error('提现金额不能超过可提现余额')
    return
  }

  const account = accountOptions.find((item) => item.value === withdrawForm.accountId)
  withdrawRecords.value.unshift({
    id: Date.now(),
    orderNo: `WD${new Date().toISOString().slice(0, 10).replaceAll('-', '')}${String(Date.now()).slice(-3)}`,
    amount: withdrawForm.amount,
    accountName: account?.label || '未知账户',
    accountTailNo: account?.label.includes('2148') ? '2148' : '8821',
    applicant: '平台财务-当前账号',
    appliedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    status: 'processing',
    statusText: '处理中',
    remark: withdrawForm.remark || '平台提现申请',
  })
  message.success('平台提现申请已提交')
  showWithdrawModal.value = false
}
</script>

<style scoped>
.page-container {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.header-desc {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 6px;
  display: block;
  max-width: 720px;
}

.hero-card {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.8fr);
  gap: 18px;
  margin-bottom: 24px;
  padding: 26px 28px;
  border-radius: 22px;
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.22), transparent 36%),
    radial-gradient(circle at bottom right, rgba(16, 185, 129, 0.18), transparent 34%),
    linear-gradient(135deg, #0f172a 0%, #172554 55%, #1e3a8a 100%);
  color: #e2e8f0;
}

.hero-main {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-label {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(226, 232, 240, 0.76);
}

.hero-value {
  margin-top: 10px;
  font-family: 'Orbitron', sans-serif;
  font-size: 42px;
  line-height: 1.1;
  color: #f8fafc;
}

.hero-sub {
  margin-top: 10px;
  font-size: 13px;
  line-height: 1.7;
  color: rgba(226, 232, 240, 0.82);
  max-width: 560px;
}

.hero-side {
  display: grid;
  gap: 12px;
  align-content: center;
}

.hero-side-item {
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.hero-side-item span {
  display: block;
  font-size: 12px;
  color: rgba(226, 232, 240, 0.7);
}

.hero-side-item strong {
  display: block;
  margin-top: 6px;
  font-size: 15px;
  color: #fff;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  padding: 20px 22px;
  border-radius: 18px;
  background: white;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-card.total { border-top: 4px solid #3b82f6; }
.stat-card.freeze { border-top: 4px solid #f59e0b; }
.stat-card.reserve { border-top: 4px solid #ef4444; }
.stat-card.processing { border-top: 4px solid #8b5cf6; }
.stat-card.available { border-top: 4px solid #10b981; }

.stat-label {
  font-size: 12px;
  color: var(--text-muted);
}

.stat-label-with-tip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.hint-icon {
  font-size: 14px;
  color: #94a3b8;
  cursor: help;
}

.stat-value {
  font-family: 'Orbitron', sans-serif;
  font-size: 26px;
  color: var(--text-primary);
}

.stat-desc {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.6;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
  gap: 18px;
  margin-bottom: 24px;
}

.formula-card,
.rule-card,
.table-card {
  border-radius: 18px;
  background: white;
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.04);
}

.card-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
}

.formula-box {
  padding: 14px 16px;
  border-radius: 14px;
  background: #eff6ff;
  color: #1d4ed8;
  margin-bottom: 16px;
  overflow-x: auto;
}

.formula-box code {
  font-size: 13px;
  white-space: nowrap;
}

.formula-list {
  display: grid;
  gap: 10px;
}

.formula-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #f8fafc;
}

.formula-item span {
  font-size: 13px;
  color: var(--text-muted);
}

.formula-item strong {
  font-size: 15px;
  color: var(--text-primary);
}

.formula-item.minus strong {
  color: #d97706;
}

.formula-item.result {
  background: #ecfdf5;
}

.formula-item.result strong {
  color: #047857;
}

.rule-list {
  display: grid;
  gap: 14px;
}

.rule-item {
  padding: 14px 16px;
  border-radius: 14px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
}

.rule-item strong {
  display: block;
  font-size: 14px;
  color: var(--text-primary);
}

.rule-item span {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.7;
  color: var(--text-muted);
}

.withdraw-alert {
  margin-bottom: 16px;
}

.withdraw-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 14px;
}

.amount-input-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.grid-wide {
  grid-column: 1 / -1;
}

@media (max-width: 1200px) {
  .stats-grid,
  .content-grid {
    grid-template-columns: 1fr;
  }

  .hero-card {
    grid-template-columns: 1fr;
  }
}
</style>
