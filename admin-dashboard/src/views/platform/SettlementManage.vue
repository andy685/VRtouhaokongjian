<template>
  <div class="page-container animate-fade-in">
    <!-- 页头说明 -->
    <div class="page-header">
      <div>
        <h1>商家分账管理</h1>
        <p class="header-desc">
          商家结算额扣除手续费后为<strong class="highlight">实缴金额</strong>。
          优先走<strong class="highlight">自动分账</strong>，第三方不支持或分账失败时由财务<strong>人工打款</strong>并留存凭证。
        </p>
      </div>
      <n-button @click="handleSyncLakala">
        <template #icon><n-icon :component="SyncOutline" /></template>
        同步打款状态
      </n-button>
    </div>

    <!-- 汇总统计卡片区 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="FlashOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">自动分账</span>
          <span class="value success">{{ autoFlowCount }}</span>
          <span class="sub-text">笔 · 实缴 ¥{{ autoFlowAmount.toLocaleString() }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="SyncOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">人工打款</span>
          <span class="value processing">{{ manualFlowCount }}</span>
          <span class="sub-text">笔 · 实缴 ¥{{ manualFlowAmount.toLocaleString() }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #6366F1, #4F46E5);">
          <n-icon :component="CheckmarkDoneOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">已完成</span>
          <span class="value">{{ completedCount }}</span>
          <span class="sub-text">笔 · 实缴 ¥{{ completedAmount.toLocaleString() }}</span>
        </div>
      </div>
      <div class="stat-card stat-card-alert">
        <div class="stat-icon" style="background: linear-gradient(135deg, #EF4444, #DC2626);">
          <n-icon :component="AlertCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">异常处理</span>
          <span class="value alert">{{ exceptionFlowCount }}</span>
          <span class="sub-text">笔 · 可转人工打款</span>
        </div>
      </div>
    </div>

    <!-- 自动化规则提示条 -->
    <n-alert type="info" :bordered="false" style="margin-bottom: 20px; border-radius: 12px;">
      <template #header>处理规则</template>
      系统按结算周期自动生成结算单，结算状态用于确认应付金额。
      打款方式决定资金处理路径：拉卡拉自动分账由平台同步状态，人工打款由财务确认并可上传凭证。
    </n-alert>

    <!-- Tab 状态切换 + 筛选 -->
    <div class="content-card">
      <!-- 第一行：筛选条件 -->
      <div class="table-toolbar">
        <n-space align="center" :wrap="false">
          <n-input v-model:value="searchKeyword" placeholder="搜索商家名称/结算单号..." clearable style="width: 220px;">
            <template #prefix><n-icon :component="SearchOutline" /></template>
          </n-input>
          <n-select v-model:value="filterMerchant" placeholder="全部商家" :options="merchantOptions" clearable style="width: 150px;" />
          <n-date-picker v-model:value="filterMonth" type="month" clearable style="width: 140px;" />
        </n-space>
      </div>
      <!-- 第二行：处理渠道 Tab -->
      <n-tabs v-model:value="activeTab" type="segment" animated size="small" style="margin-bottom: 16px;">
        <n-tab-pane name="all" :tab="`全部 (${totalCount})`" />
        <n-tab-pane name="auto" :tab="`自动分账 (${autoFlowCount})`" />
        <n-tab-pane name="manual" :tab="`人工打款 (${manualFlowCount})`" />
        <n-tab-pane name="exception" :tab="`异常处理 (${exceptionFlowCount})`" />
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
        <!-- 异常标识（始终显示） -->
        <div v-if="isException(currentRecord)" class="exception-banner" style="margin-bottom: 12px;">
          <n-icon :component="AlertCircleOutline" size="18" color="#DC2626" />
          <span><strong>异常拦截</strong> — {{ currentRecord.exceptionReason }}</span>
        </div>

        <n-tabs v-model:value="detailTab" type="line" animated size="small">
          <!-- Tab 1: 基本信息 -->
          <n-tab-pane name="info" tab="基本信息">
            <n-descriptions label-placement="left" :column="2" bordered size="small">
              <n-descriptions-item label="结算单号">{{ currentRecord.no }}</n-descriptions-item>
              <n-descriptions-item label="商家">{{ currentRecord.merchant }}</n-descriptions-item>
              <n-descriptions-item label="结算周期">{{ currentRecord.period }}</n-descriptions-item>
              <n-descriptions-item label="店铺数量">{{ currentRecord.storeDetails?.length || 0 }} 家</n-descriptions-item>
              <n-descriptions-item label="结算总额">
                <span style="font-weight:700;font-size:16px;color:#4F46E5;">¥{{ currentRecord.amount.toLocaleString() }}</span>
              </n-descriptions-item>
              <n-descriptions-item label="手续费率">{{ (currentRecord.feeRate * 100).toFixed(1) }}%</n-descriptions-item>
              <n-descriptions-item label="手续费">¥{{ currentRecord.fee.toFixed(2) }}</n-descriptions-item>
              <n-descriptions-item label="实缴金额">
                <span style="font-weight:700;color:#10B981;">¥{{ (currentRecord.amount - currentRecord.fee).toFixed(2) }}</span>
              </n-descriptions-item>
              <n-descriptions-item label="结算状态">
                <n-tag type="success" size="medium" round :bordered="false">已生成结算单</n-tag>
              </n-descriptions-item>
              <n-descriptions-item label="打款方式">{{ paymentMethodLabel(currentRecord) }}</n-descriptions-item>
              <n-descriptions-item label="打款状态">
                <n-tag :type="statusType(currentRecord.status)" size="medium" round :bordered="false">{{ statusLabel(currentRecord.status) }}</n-tag>
              </n-descriptions-item>
              <n-descriptions-item label="收款银行">{{ currentRecord.bankName || '<span style=\'color:#EF4444\'>未绑定</span>' }}</n-descriptions-item>
              <n-descriptions-item label="收款账号">{{ currentRecord.cardNo ? maskCardNo(currentRecord.cardNo) : '<span style=\'color:#EF4444\'>未绑定</span>' }}</n-descriptions-item>
              <n-descriptions-item label="打款时间">{{ currentRecord.time || '-' }}</n-descriptions-item>
              <n-descriptions-item label="创建时间">{{ currentRecord.createTime }}</n-descriptions-item>
            </n-descriptions>
          </n-tab-pane>

          <!-- Tab 2: 店铺明细 -->
          <n-tab-pane name="stores" tab="店铺明细">
            <div v-if="currentRecord?.storeDetails?.length">
              <n-data-table :columns="storeDetailColumns" :data="currentRecord.storeDetails" :pagination="false" size="small" striped />
            </div>
            <n-empty v-else description="暂无店铺明细数据" style="padding:40px 0;" />
          </n-tab-pane>

          <!-- Tab 3: 分账日志 + 打款凭证 -->
          <n-tab-pane name="log" tab="分账日志">
            <!-- 打款凭证 -->
            <div v-if="canManageVoucher(currentRecord)" style="margin-bottom: 16px;">
              <div style="font-size:13px;font-weight:600;margin-bottom:10px;">打款凭证</div>
              <div v-if="currentRecord.voucher">
                <n-image :src="currentRecord.voucher" width="200" style="border-radius: 8px;" />
                <div style="margin-top: 8px;">
                  <n-button size="small" @click="currentRecord.voucher = undefined; message.success('凭证已删除')">删除凭证</n-button>
                </div>
              </div>
              <n-upload v-else accept="image/*" :max="1" :custom-request="handleVoucherUpload">
                <n-upload-dragger>
                  <div style="padding: 20px 0;">
                    <n-icon size="32" :depth="3"><CloudUploadOutline /></n-icon>
                    <p style="margin: 8px 0 0 0; font-size: 14px; color: #666;">点击或拖拽上传打款凭证（选填）</p>
                  </div>
                </n-upload-dragger>
              </n-upload>
            </div>

            <!-- 时间线日志 -->
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
          </n-tab-pane>
        </n-tabs>
      </template>

      <template #footer>
        <n-space justify="end">
          <n-button v-if="canManualPay(currentRecord)" type="primary" @click="markManualPaid">标记已人工打款</n-button>
          <n-button @click="showDetailModal = false">关闭</n-button>
        </n-space>
      </template>
    </n-modal>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NButton, NDataTable, NTag, NSpace, NModal, NTabs, NTabPane,
  NIcon, NDescriptions, NDescriptionsItem, NInput,
  NTimeline, NTimelineItem, NDatePicker, NAlert, NSelect, NUpload,
  NUploadDragger, NImage, useMessage
} from 'naive-ui'
import {
  FlashOutline, SyncOutline, CheckmarkDoneOutline,
  SearchOutline, AlertCircleOutline, CloudUploadOutline
} from '@vicons/ionicons5'

const message = useMessage()

// 筛选
const activeTab = ref('all')
const searchKeyword = ref('')
const filterMerchant = ref<string | null>(null)
const filterMonth = ref<number | null>(null)

/**
 * 状态定义（与代理商分账一致）：
 * auto_submitted - 正常单，系统自动提交拉卡拉
 * processing     - 拉卡拉开票中，等待回调
 * settled        - 自动分账到账
 * manual_pending - 打款方式配置为人工打款，待财务处理
 * manual_paid    - 财务人工打款完成
 * failed         - 拉卡拉开票失败，可转人工打款
 * exception      - 异常拦截，需人工处理
 */
type SettlementStatus = 'auto_submitted' | 'processing' | 'settled' | 'manual_pending' | 'manual_paid' | 'failed' | 'exception'

interface MerchantSettlement {
  id: number
  no: string
  merchant: string
  period: string
  amount: number
  feeRate: number
  fee: number
  bankName: string
  cardNo: string
  status: SettlementStatus
  statusText: string
  exceptionReason?: string
  lakalaNo?: string
  time: string
  createTime: string
  voucher?: string
  storeDetails: Array<{ store: string; amount: number; fee: number }>
  logs: Array<{ action: string; time: string; detail: string; type: 'info' | 'success' | 'warning' | 'error' }>
}

const merchantOptions = [
  { label: '深圳XX科技公司', value: '深圳XX科技公司' },
  { label: '广州YY传媒公司', value: '广州YY传媒公司' },
  { label: '北京ZZ娱乐公司', value: '北京ZZ娱乐公司' },
  { label: '上海WW投资公司', value: '上海WW投资公司' },
]

// Mock 数据 —— 覆盖商家分账各类场景
const settlementData = ref<MerchantSettlement[]>([
  {
    // 场景1：正常单 - 自动提交拉卡拉
    id: 1, no: 'MS2026042001', merchant: '深圳XX科技公司',
    period: '2026-04-13 ~ 2026-04-19', amount: 137963, feeRate: 0.03, fee: 4138.89,
    bankName: '招商银行', cardNo: '6214838888888888888',
    status: 'auto_submitted', statusText: '自动已提交',
    lakalaNo: 'LK20260428090001', time: '-', createTime: '2026-04-20 08:00',
    storeDetails: [
      { store: '深圳福田旗舰店', amount: 85623, fee: 2568.69 },
      { store: '南山科技园店', amount: 52340, fee: 1570.20 },
    ],
    logs: [
      { action: '结算单生成', time: '2026-04-20 08:00', detail: '结算引擎自动计算', type: 'info' as const },
      { action: '自动校验通过', time: '2026-04-20 08:00:01', detail: '账户完整 · 金额≥¥100 · 无申诉', type: 'success' as const },
      { action: '已提交拉卡拉', time: '2026-04-20 08:00:02', detail: 'LK20260428090001', type: 'info' as const },
    ],
  },
  {
    // 场景2：正常单 - 拉卡拉分账中
    id: 2, no: 'MS2026042002', merchant: '广州YY传媒公司',
    period: '2026-04-13 ~ 2026-04-19', amount: 78230, feeRate: 0.03, fee: 2346.90,
    bankName: '工商银行', cardNo: '6222021234567890123',
    status: 'processing', statusText: '拉卡拉分账中',
    lakalaNo: 'LK20260427143002', time: '-', createTime: '2026-04-20 08:00',
    storeDetails: [{ store: '广州天河店', amount: 78230, fee: 2346.90 }],
    logs: [
      { action: '结算单生成', time: '2026-04-20 08:00', detail: '结算引擎自动计算', type: 'info' as const },
      { action: '自动校验通过', time: '2026-04-20 08:00:01', detail: '自动放行', type: 'success' as const },
      { action: '已提交拉卡拉', time: '2026-04-27 14:30', detail: 'LK20260427143002', type: 'info' as const },
      { action: '拉卡拉受理', time: '2026-04-28 09:30', detail: '开票请求已受理，等待回调', type: 'warning' as const },
    ],
  },
  {
    // 场景3：已到账
    id: 3, no: 'MS2026041301', merchant: '北京ZZ娱乐公司',
    period: '2026-04-06 ~ 2026-04-12', amount: 45680, feeRate: 0.03, fee: 1370.40,
    bankName: '建设银行', cardNo: '6227001234567890123',
    status: 'settled', statusText: '已到账',
    lakalaNo: 'LK20260405080003', time: '2026-04-05 10:20', createTime: '2026-04-06 08:00',
    storeDetails: [{ store: '北京朝阳店', amount: 45680, fee: 1370.40 }],
    logs: [
      { action: '结算单生成', time: '2026-04-06 08:00', detail: '结算引擎自动计算', type: 'info' as const },
      { action: '自动校验通过', time: '2026-04-06 08:00:01', detail: '自动放行', type: 'success' as const },
      { action: '已提交拉卡拉', time: '2026-04-06 08:00:02', detail: 'LK20260405080003', type: 'info' as const },
      { action: '拉卡拉受理', time: '2026-04-07 09:00', detail: '开票请求已受理', type: 'warning' as const },
      { action: '分账成功', time: '2026-04-05 10:20', detail: '拉卡拉异步回调：开票成功，款项已到账', type: 'success' as const },
    ],
  },
  {
    // 场景4：异常 - 账户未绑定
    id: 4, no: 'MS2026042004', merchant: '上海WW投资公司',
    period: '2026-04-13 ~ 2026-04-19', amount: 97850, feeRate: 0.03, fee: 2935.50,
    bankName: '-', cardNo: '-',
    status: 'exception', statusText: '异常待处理',
    exceptionReason: '收款银行账户未绑定',
    time: '-', createTime: '2026-04-20 08:00',
    storeDetails: [{ store: '上海浦东店', amount: 97850, fee: 2935.50 }],
    logs: [
      { action: '结算单生成', time: '2026-04-20 08:00', detail: '结算引擎自动计算', type: 'info' as const },
      { action: '异常拦截', time: '2026-04-20 08:00:01', detail: '收款银行账户未绑定，不符合自动分账条件', type: 'error' as const },
    ],
  },
  {
    // 场景5：失败 - 拉卡拉开票失败
    id: 5, no: 'MS2026041302', merchant: '成都新锐科技公司',
    period: '2026-04-06 ~ 2026-04-12', amount: 32000, feeRate: 0.03, fee: 960,
    bankName: '交通银行', cardNo: '6222589999999999999',
    status: 'failed', statusText: '分账失败',
    exceptionReason: '拉卡拉返回：收款账户名与开户名不一致(ERROR_CODE: BANK_NAME_MISMATCH)',
    lakalaNo: 'LK20260428100005', time: '-', createTime: '2026-04-06 08:00',
    storeDetails: [{ store: '成都高新区店', amount: 32000, fee: 960 }],
    logs: [
      { action: '结算单生成', time: '2026-04-06 08:00', detail: '结算引擎自动计算', type: 'info' as const },
      { action: '自动校验通过', time: '2026-04-06 08:00:01', detail: '自动放行', type: 'success' as const },
      { action: '已提交拉卡拉', time: '2026-04-28 10:00', detail: 'LK20260428100005', type: 'info' as const },
      { action: '开票失败', time: '2026-04-28 10:05', detail: '拉卡拉返回：账户名与开户名不一致(BANK_NAME_MISMATCH)', type: 'error' as const },
    ],
  },
  {
    // 场景6：商家打款方式配置为人工打款，待财务处理
    id: 6, no: 'MS2026040601', merchant: '杭州未来娱乐公司',
    period: '2026-03-30 ~ 2026-04-05', amount: 56800, feeRate: 0.03, fee: 1704,
    bankName: '中国银行', cardNo: '6216618888888888888',
    status: 'manual_pending', statusText: '待人工打款',
    exceptionReason: '该商家打款方式配置为人工打款',
    time: '-', createTime: '2026-04-06 08:00',
    storeDetails: [{ store: '杭州滨江店', amount: 56800, fee: 1704 }],
    logs: [
      { action: '结算单生成', time: '2026-04-06 08:00', detail: '结算引擎自动计算', type: 'info' as const },
      { action: '进入人工打款', time: '2026-04-06 08:00:02', detail: '商家打款方式为人工打款，等待财务处理', type: 'warning' as const },
    ],
  },
  {
    // 场景7：人工打款完成，已上传凭证
    id: 7, no: 'MS2026040602', merchant: '南京蓝海运动馆',
    period: '2026-03-30 ~ 2026-04-05', amount: 42450, feeRate: 0.03, fee: 1273.50,
    bankName: '浦发银行', cardNo: '6225216666666666666',
    status: 'manual_paid', statusText: '已人工打款',
    exceptionReason: '该商家打款方式配置为人工打款',
    time: '2026-04-07 15:30', createTime: '2026-04-06 08:00',
    voucher: 'https://dummyimage.com/640x360/f8fafc/334155&text=Manual+Payment+Voucher',
    storeDetails: [{ store: '南京新街口店', amount: 42450, fee: 1273.50 }],
    logs: [
      { action: '结算单生成', time: '2026-04-06 08:00', detail: '结算引擎自动计算', type: 'info' as const },
      { action: '进入人工打款', time: '2026-04-06 08:00:02', detail: '商家打款方式为人工打款，等待财务处理', type: 'warning' as const },
      { action: '已人工打款', time: '2026-04-07 15:30', detail: '财务确认线下转账完成，实缴金额 ¥41,176.50', type: 'success' as const },
      { action: '凭证上传', time: '2026-04-07 15:35', detail: '已上传银行回单凭证', type: 'success' as const },
    ],
  },
  {
    // 场景8：人工打款处理中，需补充线下凭证
    id: 8, no: 'MS2026040603', merchant: '苏州星河互动空间',
    period: '2026-03-30 ~ 2026-04-05', amount: 31600, feeRate: 0.03, fee: 948,
    bankName: '农业银行', cardNo: '6228487777777777777',
    status: 'manual_pending', statusText: '待人工打款',
    exceptionReason: '财务已发起线下转账，等待银行回单确认',
    time: '-', createTime: '2026-04-06 08:00',
    storeDetails: [{ store: '苏州园区店', amount: 31600, fee: 948 }],
    logs: [
      { action: '结算单生成', time: '2026-04-06 08:00', detail: '结算引擎自动计算', type: 'info' as const },
      { action: '进入人工打款', time: '2026-04-06 08:00:02', detail: '商家打款方式为人工打款，等待财务处理', type: 'warning' as const },
      { action: '线下转账处理中', time: '2026-04-07 11:20', detail: '财务已发起企业网银转账，待补充回单凭证', type: 'warning' as const },
    ],
  },
])

// ========== 统计 ==========
const autoStatuses: SettlementStatus[] = ['auto_submitted', 'processing', 'settled']
const manualStatuses: SettlementStatus[] = ['manual_pending', 'manual_paid']
const exceptionStatuses: SettlementStatus[] = ['failed', 'exception']

const netAmount = (record: MerchantSettlement) => Math.max(0, record.amount - record.fee)
const sumByStatuses = (statuses: SettlementStatus[]) =>
  settlementData.value.filter(d => statuses.includes(d.status)).reduce((sum, item) => sum + netAmount(item), 0)

const autoFlowCount = computed(() => settlementData.value.filter(d => autoStatuses.includes(d.status)).length)
const manualFlowCount = computed(() => settlementData.value.filter(d => manualStatuses.includes(d.status)).length)
const exceptionFlowCount = computed(() => settlementData.value.filter(d => exceptionStatuses.includes(d.status)).length)
const completedCount = computed(() => settlementData.value.filter(d => ['settled', 'manual_paid'].includes(d.status)).length)
const totalCount = computed(() => settlementData.value.length)

const autoFlowAmount = computed(() => sumByStatuses(autoStatuses))
const manualFlowAmount = computed(() => sumByStatuses(manualStatuses))
const completedAmount = computed(() => sumByStatuses(['settled', 'manual_paid']))

// ========== 表格列 ==========
const columns = [
  {
    title: '结算单号', key: 'no', width: 150, ellipsis: { tooltip: true },
    render: (row: any) => h('span', { style: 'font-family:monospace;font-size:12px;' }, row.no)
  },
  { title: '商家', key: 'merchant', width: 160 },
  { title: '店铺数', key: 'storeCount', width: 70, align: 'center',
    render: (row: any) => `${row.storeDetails?.length || 0}家`
  },
  { title: '周期', key: 'period', width: 160, ellipsis: { tooltip: true } },
  {
    title: '结算额(¥)', key: 'amount', width: 110,
    render: (row: any) => h('span', { style: 'font-weight:600;color:#4F46E5;' }, `¥${row.amount.toLocaleString()}`)
  },
  {
    title: '手续费(¥)', key: 'fee', width: 90,
    render: (row: any) => row.fee > 0
      ? `¥${row.fee.toFixed(2)}`
      : h('span', { style: 'color:#9CA3AF;' }, '-')
  },
  {
    title: '费率', key: 'feeRate', width: 65, align: 'center',
    render: (row: any) => `${(row.feeRate * 100).toFixed(1)}%`
  },
  {
    title: '打款方式', key: 'paymentMethod', width: 120, align: 'center',
    render: (row: any) => h(NTag, { type: ['manual_pending', 'manual_paid'].includes(row.status) ? 'warning' : 'info', size: 'small', bordered: false }, () => paymentMethodLabel(row))
  },
  {
    title: '实缴金额(¥)', key: 'actualAmount', width: 110, align: 'right',
    render: (row: any) => {
      const net = row.amount - row.fee
      return h('span', { style: `font-weight:700;${net > 0 ? 'color:#10B981;' : 'color:#9CA3AF;'}` }, net > 0 ? `¥${net.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-')
    }
  },
  {
    title: '打款状态', key: 'status', width: 110, align: 'center',
    render: (row: any) => h(NSpace, { size: 2, align: 'center' }, () =>
      row.status === 'exception' || row.status === 'failed'
        ? [h(NTag, { type: statusType(row.status), size: 'small', round: true, bordered: false }, () => statusLabel(row.status)),
           h(NIcon, { component: AlertCircleOutline, size: 14, color: '#EF4444' })]
        : [h(NTag, { type: statusType(row.status), size: 'small', round: true, bordered: false }, () => statusLabel(row.status))]
    )
  },
  { title: '创建时间', key: 'createTime', width: 160, ellipsis: { tooltip: true },
    render: (row: any) => row.createTime
  },
  {
    title: '操作', key: 'actions', width: 85, fixed: 'right' as const,
    render: (row: any) => h(NButton, { size: 'tiny', secondary: true, type: 'primary', onClick: () => openDetail(row) }, () => '详情'),
  },
]

// 店铺明细表格列
const storeDetailColumns = [
  { title: '店铺名称', key: 'store', width: 280 },
  { title: '结算额(¥)', key: 'amount', width: 140, render: (r: any) => `¥${r.amount.toLocaleString()}` },
]

// ========== 过滤 ==========
const filteredData = computed(() => {
  let data = [...settlementData.value]
  if (activeTab.value === 'auto') data = data.filter(d => autoStatuses.includes(d.status))
  if (activeTab.value === 'manual') data = data.filter(d => manualStatuses.includes(d.status))
  if (activeTab.value === 'exception') data = data.filter(d => exceptionStatuses.includes(d.status))
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    data = data.filter(d => d.merchant.toLowerCase().includes(kw) || d.no.toLowerCase().includes(kw))
  }
  if (filterMerchant.value) data = data.filter(d => d.merchant === filterMerchant.value)
  return data
})

const pagination = { pageSize: 10 }

function rowClassName(row: any): string {
  if (row.status === 'exception') return 'row-exception'
  if (row.status === 'failed') return 'row-failed'
  if (row.status === 'manual_pending') return 'row-manual-pending'
  if (row.status === 'manual_paid') return 'row-manual-paid'
  return ''
}

function isException(record: MerchantSettlement): boolean {
  return record.status === 'exception' || record.status === 'failed'
}

function canManualPay(record: MerchantSettlement | null): boolean {
  return !!record && ['manual_pending', 'failed', 'exception'].includes(record.status)
}

function canManageVoucher(record: MerchantSettlement | null): boolean {
  return !!record && ['settled', 'manual_paid'].includes(record.status)
}

function paymentMethodLabel(record: MerchantSettlement): string {
  return ['manual_pending', 'manual_paid'].includes(record.status) ? '人工打款' : '拉卡拉自动分账'
}

function statusType(s: SettlementStatus): string {
  const map: Record<SettlementStatus, string> = {
    auto_submitted: 'success', processing: 'warning', settled: 'success', manual_pending: 'warning', manual_paid: 'warning',
    failed: 'error', exception: 'error'
  }
  return map[s] || 'default'
}
function statusLabel(s: SettlementStatus): string {
  const map: Record<SettlementStatus, string> = {
    auto_submitted: '已自动提交', processing: '拉卡拉分账中', settled: '自动分账成功', manual_pending: '待人工打款', manual_paid: '已人工打款',
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
const detailTab = ref('info')
const currentRecord = ref<MerchantSettlement | null>(null)
function openDetail(row: MerchantSettlement) {
  currentRecord.value = row
  showDetailModal.value = true
}

// ========== 同步打款状态 ==========
function handleSyncLakala() {
  message.info('正在同步打款状态...')
  setTimeout(() => { message.success('打款状态已同步（共更新 0 条）') }, 1500)
}

// ========== 打款凭证上传 ==========
function markManualPaid() {
  if (!currentRecord.value) return
  const idx = settlementData.value.findIndex(d => d.id === currentRecord.value!.id)
  if (idx === -1) return

  const now = new Date().toLocaleString('zh-CN', { hour12: false })
  const record = settlementData.value[idx]
  record.status = 'manual_paid'
  record.statusText = '已人工打款'
  record.time = now
  record.logs.push({
    action: '已人工打款',
    time: now,
    detail: `财务确认线下转账完成，实缴金额 ¥${(record.amount - record.fee).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    type: 'success'
  })
  currentRecord.value = record
  detailTab.value = 'log'
  message.success('已标记为人工打款，可选填上传打款凭证')
}

function removeVoucher() {
  if (!currentRecord.value) return
  const idx = settlementData.value.findIndex(d => d.id === currentRecord.value!.id)
  if (idx === -1) return
  settlementData.value[idx].voucher = undefined
  currentRecord.value = settlementData.value[idx]
  message.success('凭证已删除')
}

function handleVoucherUpload({ file, onFinish }: any) {
  if (!currentRecord.value) return
  const reader = new FileReader()
  reader.onload = (e) => {
    const idx = settlementData.value.findIndex(d => d.id === currentRecord.value!.id)
    if (idx !== -1) {
      settlementData.value[idx].voucher = e.target?.result as string
      currentRecord.value = settlementData.value[idx]
      message.success('凭证上传成功')
    }
    onFinish()
  }
  reader.readAsDataURL(file.file)
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

:::deep(.row-exception td) { background: #FFFBEB !important; }
:::deep(.row-exception td:first-child) { border-left: 3px solid #F59E0B; }
:::deep(.row-failed td) { background: #FEF2F2 !important; }
:::deep(.row-failed td:first-child) { border-left: 3px solid #EF4444; }
:::deep(.row-manual-paid td) { background: #FFFBEB !important; }
:::deep(.row-manual-paid td:first-child) { border-left: 3px solid #F59E0B; }
</style>
