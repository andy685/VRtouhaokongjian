<template>
  <div class="page-container animate-fade-in">
    <!-- 页头说明 -->
    <div class="page-header">
      <div>
        <h1>游戏供应商结算</h1>
        <p class="header-desc">
          结算公式：<strong class="highlight">单次成本 × 游戏次数 = 结算额</strong>，
          拉卡拉扣2%手续费后为到账金额。CP结算及放款均在<strong class="highlight">拉卡拉侧</strong>完成，
          平台仅<strong>定时同步</strong>拉卡拉结算状态。
        </p>
      </div>
      <n-button @click="handleSyncLakala">
        <template #icon><n-icon :component="SyncOutline" /></template>
        同步拉卡拉状态
      </n-button>
    </div>

    <!-- 汇总统计卡片区 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="FlashOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">本月自动分润</span>
          <span class="value success">{{ autoSubmittedCount }}</span>
          <span class="sub-text">笔 · 到账 ¥{{ autoSubmittedAmount.toLocaleString() }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="SyncOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">拉卡拉分账中</span>
          <span class="value processing">{{ processingCount }}</span>
          <span class="sub-text">笔 · 到账 ¥{{ processingAmount.toLocaleString() }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #6366F1, #4F46E5);">
          <n-icon :component="CheckmarkDoneOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">本月已到账</span>
          <span class="value">{{ settledCount }}</span>
          <span class="sub-text">笔 · 到账 ¥{{ settledAmount.toLocaleString() }}</span>
        </div>
      </div>
      <div class="stat-card stat-card-alert">
        <div class="stat-icon" style="background: linear-gradient(135deg, #EF4444, #DC2626);">
          <n-icon :component="AlertCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">异常待处理</span>
          <span class="value alert">{{ exceptionCount }}</span>
          <span class="sub-text">笔 · 拉卡拉侧处理</span>
        </div>
      </div>
    </div>

    <!-- 自动化规则提示条 -->
    <n-alert type="info" :bordered="false" style="margin-bottom: 20px; border-radius: 12px;">
      <template #header>同步规则</template>
      平台<strong>每小时自动同步</strong>拉卡拉分账状态，点击右上角「同步拉卡拉状态」可手动触发。
      异常和失败记录由拉卡拉侧处理，平台仅展示最新状态。
    </n-alert>

    <!-- Tab 状态切换 + 筛选 -->
    <div class="content-card">
      <!-- 第一行：筛选条件 -->
      <div class="table-toolbar">
        <n-space align="center" :wrap="false">
          <n-input v-model:value="searchKeyword" placeholder="搜索供应商名称/结算单号..." clearable style="width: 220px;">
            <template #prefix><n-icon :component="SearchOutline" /></template>
          </n-input>
          <n-select v-model:value="filterCP" placeholder="全部供应商" :options="cpOptions" clearable style="width: 160px;" />
          <n-date-picker v-model:value="filterMonth" type="month" clearable style="width: 140px;" />
        </n-space>
      </div>
      <!-- 第二行：状态 Tab -->
      <n-tabs v-model:value="activeTab" type="segment" animated size="small" style="margin-bottom: 16px;">
        <n-tab-pane name="all" :tab="`全部 (${totalCount})`" />
        <n-tab-pane name="auto_submitted" :tab="`自动已提交 (${autoSubmittedCount})`" />
        <n-tab-pane name="processing" :tab="`分账中 (${processingCount})`" />
        <n-tab-pane name="settled" :tab="`已到账 (${settledCount})`" />
        <n-tab-pane name="failed" :tab="`分账失败 (${failedCount})`" />
        <n-tab-pane name="exception" :tab="`⚠ 异常待处 (${exceptionCount})`" />
      </n-tabs>

      <n-data-table
        :columns="columns"
        :data="filteredData"
        :pagination="pagination"
        :row-key="(row: any) => row.id"
        striped
        :row-class-name="rowClassName"
      />
    </div>

    <!-- 详情弹窗 -->
    <n-modal v-model:show="showDetailModal" preset="card" :title="`结算详情 - ${currentRecord?.no || ''}`" style="width: 780px;" :bordered="false">
      <template v-if="currentRecord">
        <div v-if="isException(currentRecord)" class="exception-banner">
          <n-icon :component="AlertCircleOutline" size="18" color="#DC2626" />
          <span><strong>异常拦截</strong> — {{ currentRecord.exceptionReason }}</span>
        </div>

        <n-descriptions label-placement="left" :column="2" bordered size="small">
          <n-descriptions-item label="结算单号">{{ currentRecord.no }}</n-descriptions-item>
          <n-descriptions-item label="供应商">{{ currentRecord.cpName }}</n-descriptions-item>
          <n-descriptions-item label="结算周期">{{ currentRecord.period }}</n-descriptions-item>
          <n-descriptions-item label="在架游戏">{{ currentRecord.gameCount }} 款</n-descriptions-item>
          <n-descriptions-item label="总体验次数">{{ currentRecord.totalPlays.toLocaleString() }} 次</n-descriptions-item>
          <n-descriptions-item label="单次成本">
            <span style="color:#6B7280;">¥{{ currentRecord.perPlayCost.toFixed(2) }}</span>
          </n-descriptions-item>
          <n-descriptions-item label="结算额（成本×次数）">
            <span style="font-weight:700;color:#4F46E5;">¥{{ currentRecord.settledAmount.toLocaleString() }}</span>
          </n-descriptions-item>
          <n-descriptions-item label="手续费（2%）">
            <span style="color:#9CA3AF;">-¥{{ currentRecord.feeAmount.toLocaleString() }}</span>
          </n-descriptions-item>
          <n-descriptions-item label="到账金额">
            <span style="font-weight:700;font-size:16px;color:#10B981;">¥{{ currentRecord.actualAmount.toLocaleString() }}</span>
          </n-descriptions-item>
          <n-descriptions-item label="分账状态">
            <n-tag :type="statusType(currentRecord.status)" size="medium" round :bordered="false">{{ statusLabel(currentRecord.status) }}</n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="拉卡拉流水号">{{ currentRecord.lakalaNo || '-' }}</n-descriptions-item>
          <n-descriptions-item label="收款银行">{{ currentRecord.bankName || '<span style=\'color:#EF4444\'>未绑定</span>' }}</n-descriptions-item>
          <n-descriptions-item label="收款账号">{{ currentRecord.cardNo ? maskCardNo(currentRecord.cardNo) : '<span style=\'color:#EF4444\'>未绑定</span>' }}</n-descriptions-item>
          <n-descriptions-item label="创建时间">{{ currentRecord.createTime }}</n-descriptions-item>
          <n-descriptions-item label="到账时间">{{ currentRecord.settledTime || '-' }}</n-descriptions-item>
        </n-descriptions>

        <!-- 分账日志 -->
        <div style="margin-top: 20px;">
          <div style="font-size:13px;font-weight:600;margin-bottom:10px;">操作时间线</div>
          <n-timeline size="medium">
            <n-timeline-item
              v-for="log in currentRecord.logs"
              :key="log.time"
              :type="log.type"
              :title="log.action"
              :time="log.time"
              :content="log.detail"
            />
          </n-timeline>
        </div>
      </template>

      <template #footer>
        <n-button @click="showDetailModal = false">关闭</n-button>
      </template>
    </n-modal>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NButton, NDataTable, NTag, NSpace, NModal, NTabs, NTabPane,
  NIcon, NDescriptions, NDescriptionsItem,
  NTimeline, NTimelineItem, NDatePicker, NAlert, NSelect,
  useMessage
} from 'naive-ui'
import {
  FlashOutline, SyncOutline, CheckmarkDoneOutline,
  SearchOutline, AlertCircleOutline,
} from '@vicons/ionicons5'

const message = useMessage()

// 筛选
const activeTab = ref('all')
const searchKeyword = ref('')
const filterCP = ref<string | null>(null)
const filterMonth = ref<number | null>(null)


type SettlementStatus = 'auto_submitted' | 'processing' | 'settled' | 'failed' | 'exception'

interface CPSettlement {
  id: number
  no: string
  cpName: string
  gameCount: number
  totalPlays: number
  perPlayCost: number       // 单次成本
  settledAmount: number     // 结算额 = perPlayCost × totalPlays
  feeAmount: number         // 手续费
  actualAmount: number      // 到账金额 = settledAmount - feeAmount
  period: string
  bankName: string
  cardNo: string
  status: SettlementStatus
  exceptionReason?: string
  lakalaNo?: string
  settledTime: string
  createTime: string
  logs: Array<{ action: string; time: string; detail: string; type: 'info' | 'success' | 'warning' | 'error' }>
}

const cpOptions = [
  { label: '极境互动科技', value: '极境互动科技' },
  { label: '闪耀游戏工作室', value: '闪耀游戏工作室' },
  { label: '乐游网络', value: '乐游网络' },
  { label: '星际科技', value: '星际科技' },
  { label: '未来幻境', value: '未来幻境' },
  { label: '幻视科技', value: '幻视科技' },
  { label: '星辰游戏', value: '星辰游戏' },
]

// Mock 数据 —— 覆盖各类场景
// 结算公式：单次成本 × 游戏次数 = 结算额，扣 2% 手续费 = 到账金额
const settlementData = ref<CPSettlement[]>([
  {
    id: 1, no: 'CPS202605001', cpName: '极境互动科技',
    period: '2026-05',
    gameCount: 4, totalPlays: 45800, perPlayCost: 2.40,
    settledAmount: 109920, feeAmount: 2198, actualAmount: 107722,
    bankName: '招商银行', cardNo: '6214838888888888888',
    status: 'auto_submitted',
    lakalaNo: 'LK20260530001', settledTime: '-', createTime: '2026-05-31 08:00',
    logs: [
      { action: '结算单生成', time: '2026-05-31 08:00', detail: '结算引擎根据5月体验数据自动计算：¥2.40×45,800次=¥109,920，扣手续费¥2,198，到账¥107,722', type: 'info' as const },
      { action: '自动校验通过', time: '2026-05-31 08:00:01', detail: '账户完整 · 金额≥¥100 · 无申诉', type: 'success' as const },
      { action: '已提交拉卡拉', time: '2026-05-31 08:00:02', detail: 'LK20260530001', type: 'info' as const },
    ],
  },
  {
    id: 2, no: 'CPS202605002', cpName: '闪耀游戏工作室',
    period: '2026-05',
    gameCount: 2, totalPlays: 22100, perPlayCost: 2.00,
    settledAmount: 44200, feeAmount: 884, actualAmount: 43316,
    bankName: '工商银行', cardNo: '6222021234567890123',
    status: 'processing',
    lakalaNo: 'LK20260530002', settledTime: '-', createTime: '2026-05-31 08:00',
    logs: [
      { action: '结算单生成', time: '2026-05-31 08:00', detail: '¥2.00×22,100次=¥44,200，扣手续费¥884，到账¥43,316', type: 'info' as const },
      { action: '自动校验通过', time: '2026-05-31 08:00:01', detail: '自动放行', type: 'success' as const },
      { action: '已提交拉卡拉', time: '2026-05-31 08:00:02', detail: 'LK20260530002', type: 'info' as const },
      { action: '拉卡拉受理', time: '2026-05-31 09:30', detail: '开票请求已受理，等待回调', type: 'warning' as const },
    ],
  },
  {
    id: 3, no: 'CPS202604003', cpName: '幻视科技',
    period: '2026-04',
    gameCount: 3, totalPlays: 32400, perPlayCost: 2.10,
    settledAmount: 68040, feeAmount: 1361, actualAmount: 66679,
    bankName: '建设银行', cardNo: '6227001234567890123',
    status: 'settled',
    lakalaNo: 'LK20260425003', settledTime: '2026-04-28 10:30', createTime: '2026-04-25 08:00',
    logs: [
      { action: '结算单生成', time: '2026-04-25 08:00', detail: '¥2.10×32,400次=¥68,040，扣手续费¥1,361，到账¥66,679', type: 'info' as const },
      { action: '自动校验通过', time: '2026-04-25 08:00:01', detail: '自动放行', type: 'success' as const },
      { action: '已提交拉卡拉', time: '2026-04-25 08:00:02', detail: 'LK20260425003', type: 'info' as const },
      { action: '拉卡拉受理', time: '2026-04-26 09:00', detail: '开票请求已受理', type: 'warning' as const },
      { action: '分账成功', time: '2026-04-28 10:30', detail: '拉卡拉异步回调：开票成功，到账¥66,679', type: 'success' as const },
    ],
  },
  {
    id: 4, no: 'CPS202605004', cpName: '乐游网络',
    period: '2026-05',
    gameCount: 1, totalPlays: 8500, perPlayCost: 1.80,
    settledAmount: 15300, feeAmount: 306, actualAmount: 14994,
    bankName: '-', cardNo: '-',
    status: 'exception',
    exceptionReason: '收款银行账户未绑定',
    settledTime: '-', createTime: '2026-05-31 08:00',
    logs: [
      { action: '结算单生成', time: '2026-05-31 08:00', detail: '¥1.80×8,500次=¥15,300，扣手续费¥306，到账¥14,994', type: 'info' as const },
      { action: '异常拦截', time: '2026-05-31 08:00:01', detail: '收款银行账户未绑定，不符合自动分账条件', type: 'error' as const },
    ],
  },
  {
    id: 5, no: 'CPS202605005', cpName: '星际科技',
    period: '2026-05',
    gameCount: 1, totalPlays: 3200, perPlayCost: 2.10,
    settledAmount: 6720, feeAmount: 134, actualAmount: 6586,
    bankName: '交通银行', cardNo: '6222589999999999999',
    status: 'failed',
    exceptionReason: '拉卡拉返回：收款账户名与开户名不一致(ERROR_CODE: BANK_NAME_MISMATCH)',
    lakalaNo: 'LK20260530005', settledTime: '-', createTime: '2026-05-31 08:00',
    logs: [
      { action: '结算单生成', time: '2026-05-31 08:00', detail: '¥2.10×3,200次=¥6,720，扣手续费¥134，到账¥6,586', type: 'info' as const },
      { action: '自动校验通过', time: '2026-05-31 08:00:01', detail: '自动放行', type: 'success' as const },
      { action: '已提交拉卡拉', time: '2026-05-31 08:00:02', detail: 'LK20260530005', type: 'info' as const },
      { action: '开票失败', time: '2026-05-31 08:05', detail: '拉卡拉返回：账户名与开户名不一致(BANK_NAME_MISMATCH)', type: 'error' as const },
    ],
  },
  {
    id: 6, no: 'CPS202605006', cpName: '星辰游戏',
    period: '2026-05',
    gameCount: 2, totalPlays: 15600, perPlayCost: 2.10,
    settledAmount: 32760, feeAmount: 655, actualAmount: 32105,
    bankName: '农业银行', cardNo: '6228481234567890123',
    status: 'auto_submitted',
    lakalaNo: 'LK20260530006', settledTime: '-', createTime: '2026-05-31 08:00',
    logs: [
      { action: '结算单生成', time: '2026-05-31 08:00', detail: '¥2.10×15,600次=¥32,760，扣手续费¥655，到账¥32,105', type: 'info' as const },
      { action: '自动校验通过', time: '2026-05-31 08:00:01', detail: '账户完整 · 金额≥¥100 · 无申诉', type: 'success' as const },
      { action: '已提交拉卡拉', time: '2026-05-31 08:00:02', detail: 'LK20260530006', type: 'info' as const },
    ],
  },
  {
    id: 7, no: 'CPS202605007', cpName: '未来幻境',
    period: '2026-05',
    gameCount: 1, totalPlays: 1200, perPlayCost: 2.10,
    settledAmount: 2520, feeAmount: 50, actualAmount: 2470,
    bankName: '中国银行', cardNo: '6216601234567890123',
    status: 'exception',
    exceptionReason: '结算金额未达最低门槛（¥100）',
    settledTime: '-', createTime: '2026-05-31 08:00',
    logs: [
      { action: '结算单生成', time: '2026-05-31 08:00', detail: '¥2.10×1,200次=¥2,520，扣手续费¥50，到账¥2,470', type: 'info' as const },
      { action: '异常拦截', time: '2026-05-31 08:00:01', detail: '结算金额¥2,520，未达最低门槛¥100，暂不自动分账', type: 'error' as const },
    ],
  },
])

// ========== 统计 ==========
const autoSubmittedCount = computed(() => settlementData.value.filter(d => d.status === 'auto_submitted').length)
const processingCount = computed(() => settlementData.value.filter(d => d.status === 'processing').length)
const settledCount = computed(() => settlementData.value.filter(d => d.status === 'settled').length)
const failedCount = computed(() => settlementData.value.filter(d => d.status === 'failed').length)
const exceptionCount = computed(() => settlementData.value.filter(d => d.status === 'exception').length)
const totalCount = computed(() => settlementData.value.length)

const sumBy = (status: SettlementStatus, field: 'settledAmount' | 'actualAmount' | 'feeAmount') =>
  settlementData.value.filter(d => d.status === status).reduce((s, d) => s + d[field], 0)

const autoSubmittedAmount = computed(() => sumBy('auto_submitted', 'actualAmount'))
const autoSubmittedFee = computed(() => sumBy('auto_submitted', 'feeAmount'))
const processingAmount = computed(() => sumBy('processing', 'actualAmount'))
const processingFee = computed(() => sumBy('processing', 'feeAmount'))
const settledAmount = computed(() => sumBy('settled', 'actualAmount'))
const settledFee = computed(() => sumBy('settled', 'feeAmount'))

// ========== 表格列 ==========
const columns = [
  {
    title: '结算单号', key: 'no', width: 140, ellipsis: { tooltip: true },
    render: (row: any) => h('span', { style: 'font-family:monospace;font-size:12px;' }, row.no)
  },
  { title: '供应商', key: 'cpName', width: 150 },
  { title: '游戏数', key: 'gameCount', width: 70, align: 'center',
    render: (row: any) => `${row.gameCount}款`
  },
  { title: '周期', key: 'period', width: 100 },
  { title: '游戏次数', key: 'totalPlays', width: 100, align: 'right',
    render: (row: any) => row.totalPlays.toLocaleString()
  },
  {
    title: '单次成本(¥)', key: 'perPlayCost', width: 105, align: 'right',
    render: (row: any) => h('span', { style: 'color:#6B7280;' }, row.perPlayCost.toFixed(2))
  },
  {
    title: '结算额(¥)', key: 'settledAmount', width: 110, align: 'right',
    render: (row: any) => h('span', { style: 'font-weight:600;color:#4F46E5;' }, `¥${row.settledAmount.toLocaleString()}`)
  },
  {
    title: '手续费(¥)', key: 'feeAmount', width: 90, align: 'right',
    render: (row: any) => h('span', { style: 'color:#9CA3AF;font-size:12px;' }, `-¥${row.feeAmount.toLocaleString()}`)
  },
  {
    title: '到账金额(¥)', key: 'actualAmount', width: 110, align: 'right',
    render: (row: any) => h('span', { style: 'font-weight:700;color:#10B981;' }, `¥${row.actualAmount.toLocaleString()}`)
  },
  {
    title: '状态', key: 'status', width: 120, align: 'center',
    render: (row: any) => h(NSpace, { size: 2, align: 'center' }, () =>
      row.status === 'exception' || row.status === 'failed'
        ? [h(NTag, { type: statusType(row.status), size: 'small', round: true, bordered: false }, () => statusLabel(row.status)),
           h(NIcon, { component: AlertCircleOutline, size: 14, color: '#EF4444' })]
        : [h(NTag, { type: statusType(row.status), size: 'small', round: true, bordered: false }, () => statusLabel(row.status))]
    )
  },
  { title: '拉卡拉流水号', key: 'lakalaNo', width: 155, ellipsis: { tooltip: true },
    render: (row: any) => row.lakalaNo ? h('span', { style: 'font-family:monospace;font-size:11px;color:#6B7280;' }, row.lakalaNo) : '-'
  },
  {
    title: '操作', key: 'actions', width: 75, fixed: 'right' as const,
    render: (row: any) => h(NButton, { size: 'tiny', secondary: true, type: 'primary', onClick: () => openDetail(row) }, () => '详情'),
  },
]

// ========== 过滤 ==========
const filteredData = computed(() => {
  let data = [...settlementData.value]
  if (activeTab.value !== 'all') data = data.filter(d => d.status === activeTab.value)
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    data = data.filter(d => d.cpName.toLowerCase().includes(kw) || d.no.toLowerCase().includes(kw))
  }
  if (filterCP.value) data = data.filter(d => d.cpName === filterCP.value)
  return data
})

const pagination = { pageSize: 10 }

function rowClassName(row: any): string {
  if (row.status === 'exception') return 'row-exception'
  if (row.status === 'failed') return 'row-failed'
  return ''
}

function isException(record: CPSettlement): boolean {
  return record.status === 'exception' || record.status === 'failed'
}

function statusType(s: SettlementStatus): string {
  const map: Record<SettlementStatus, string> = {
    auto_submitted: 'success', processing: 'warning', settled: 'default',
    failed: 'error', exception: 'error'
  }
  return map[s] || 'default'
}
function statusLabel(s: SettlementStatus): string {
  const map: Record<SettlementStatus, string> = {
    auto_submitted: '已自动提交', processing: '拉卡拉分账中', settled: '已到账',
    failed: '分账失败', exception: '异常待处理'
  }
  return map[s] || s
}
function maskCardNo(no: string): string {
  if (!no) return ''
  return no.replace(/(\d{4})(?=\d)/g, '$1 ')
}

// ========== 详情弹窗 ==========
const showDetailModal = ref(false)
const currentRecord = ref<CPSettlement | null>(null)
function openDetail(row: CPSettlement) {
  currentRecord.value = row
  showDetailModal.value = true
}

// ========== 同步拉卡拉状态 ==========
function handleSyncLakala() {
  message.info('正在同步拉卡拉分账状态...')
  setTimeout(() => { message.success('拉卡拉分账状态已同步（共更新 0 条）') }, 1500)
}
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.header-desc { font-size: 13px; color: var(--text-muted); margin-top: 4px; display: block; line-height: 1.6; max-width: 600px; }
.header-desc .highlight { color: #10B981; font-weight: 600; }

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
.stat-card { background: white; border-radius: 14px; padding: 20px; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 16px; }
.stat-card-alert { border: 2px solid #FEE2E2; background: linear-gradient(135deg, #FEFEFE, #FEF2F2); }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-content { display: flex; flex-direction: column; }
.stat-content .label { font-size: 12px; color: var(--text-muted); }
.stat-content .value { font-family: 'Orbitron', sans-serif; font-size: 22px; font-weight: 700; color: var(--text-primary); }
.stat-content .value.processing { color: #F59E0B; }
.stat-content .value.success { color: #10B981; }
.stat-content .value.alert { color: #EF4444; }
.stat-content .sub-text { font-size: 11px; color: var(--text-muted); }

.content-card { background: white; border-radius: 16px; padding: 24px; border: 1px solid var(--border-color); }
.table-toolbar { display: flex; justify-content: flex-end; align-items: center; margin-bottom: 8px; }

.exception-banner {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 16px; background: #FEF2F2;
  border: 1px solid #FECACA; border-radius: 8px;
  color: #991B1B; font-size: 13px; margin-bottom: 16px;
}

:deep(.row-exception td) { background: #FFFBEB !important; }
:deep(.row-exception td:first-child) { border-left: 3px solid #F59E0B; }
:deep(.row-failed td) { background: #FEF2F2 !important; }
:deep(.row-failed td:first-child) { border-left: 3px solid #EF4444; }
</style>
