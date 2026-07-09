<template>
  <div class="page-container animate-fade-in">
    <!-- 页头说明 -->
    <div class="page-header">
      <div>
        <h1>分账管理</h1>
        <p class="header-desc">
          代理商分润按<strong class="highlight">扣除供应商成本后</strong>的采购额 × 分润比例计算应发分润，拉卡拉扣提现手续费后为<strong class="highlight">到账金额</strong>。
          分账及放款均在<strong class="highlight">拉卡拉侧</strong>完成，平台仅<strong>定时同步</strong>状态。
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
          <n-input v-model:value="searchKeyword" placeholder="搜索代理商名称/结算单号..." clearable style="width: 220px;">
            <template #prefix><n-icon :component="SearchOutline" /></template>
          </n-input>
          <n-select v-model:value="filterAgent" placeholder="全部代理商" :options="agentOptions" clearable style="width: 150px;" />
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
    <n-modal v-model:show="showDetailModal" preset="card" :title="`结算详情 - ${currentRecord?.settlementNo || ''}`" style="width: 780px;" :bordered="false">
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
              <n-descriptions-item label="结算单号">{{ currentRecord.settlementNo }}</n-descriptions-item>
              <n-descriptions-item label="代理商">{{ currentRecord.agentName }}</n-descriptions-item>
              <n-descriptions-item label="结算周期">{{ currentRecord.period }}</n-descriptions-item>
              <n-descriptions-item label="月游戏豆采购额">{{ `¥${currentRecord.monthlyFlow.toLocaleString()}` }}</n-descriptions-item>
              <n-descriptions-item label="供应商成本">
                <span style="color:#F59E0B;">¥{{ (currentRecord.supplierCost || 0).toLocaleString() }}</span>
              </n-descriptions-item>
              <n-descriptions-item label="分润计算基数">
                <span style="font-weight:600;">¥{{ ((currentRecord.monthlyFlow - (currentRecord.supplierCost || 0))).toLocaleString() }}</span>
                <span style="font-size:11px;color:#9CA3AF;margin-left:4px;">（采购额 − 供应商成本）</span>
              </n-descriptions-item>
              <n-descriptions-item label="应发分润">
                <span style="font-weight:700;font-size:16px;color:#4F46E5;">¥{{ currentRecord.commissionAmount.toLocaleString() }}</span>
              </n-descriptions-item>
              <n-descriptions-item label="拉卡拉提现手续费">¥{{ currentRecord.fee.toFixed(2) }}</n-descriptions-item>
              <n-descriptions-item label="提现手续费率">{{ (currentRecord.feeRate * 100).toFixed(1) }}%</n-descriptions-item>
              <n-descriptions-item label="预计实付">
                <span style="font-weight:700;color:#10B981;">¥{{ (currentRecord.commissionAmount - currentRecord.fee).toFixed(2) }}</span>
              </n-descriptions-item>
              <n-descriptions-item label="分账状态">
                <n-tag :type="statusType(currentRecord.status)" size="medium" round :bordered="false">{{ statusLabel(currentRecord.status) }}</n-tag>
              </n-descriptions-item>
              <n-descriptions-item label="收款银行">{{ currentRecord.bankName || '<span style=\'color:#EF4444\'>未绑定</span>' }}</n-descriptions-item>
              <n-descriptions-item label="收款账号">{{ currentRecord.cardNo ? formatCardNo(currentRecord.cardNo) : '<span style=\'color:#EF4444\'>未绑定</span>' }}</n-descriptions-item>
              <n-descriptions-item label="创建时间">{{ currentRecord.submitTime }}</n-descriptions-item>
              <n-descriptions-item label="到账时间">{{ currentRecord.paidTime || '-' }}</n-descriptions-item>
            </n-descriptions>
          </n-tab-pane>

          <!-- Tab 2: 分润明细 -->
          <n-tab-pane name="breakdown" tab="分润明细">
            <div v-if="currentRecord?.supplierCost != null" style="margin-bottom: 16px;">
              <div style="font-size:13px;font-weight:600;margin-bottom:10px;">成本扣除计算</div>
              <n-descriptions label-placement="left" :column="1" bordered size="small">
                <n-descriptions-item label="月采购额">¥{{ currentRecord.monthlyFlow.toLocaleString() }}</n-descriptions-item>
                <n-descriptions-item label="供应商成本">− ¥{{ currentRecord.supplierCost.toLocaleString() }}</n-descriptions-item>
                <n-descriptions-item label="分润基数">= ¥{{ (currentRecord.monthlyFlow - currentRecord.supplierCost).toLocaleString() }}</n-descriptions-item>
                <n-descriptions-item label="分润比例">{{ (currentRecord.commissionAmount / (currentRecord.monthlyFlow - currentRecord.supplierCost) * 100).toFixed(1) }}%</n-descriptions-item>
                <n-descriptions-item label="应发分润">
                  <span style="font-weight:700;color:#4F46E5;">¥{{ currentRecord.commissionAmount.toLocaleString() }}</span>
                </n-descriptions-item>
              </n-descriptions>
            </div>
            <div v-if="currentRecord?.merchantDetails?.length" style="margin-top: 16px;">
              <div style="font-size:13px;font-weight:600;margin-bottom:10px;">下属商家分润明细</div>
              <n-data-table :columns="merchantDetailColumns" :data="currentRecord.merchantDetails" :pagination="false" size="small" striped />
            </div>
            <n-empty v-if="currentRecord?.supplierCost == null && !currentRecord?.merchantDetails?.length" description="暂无分润明细数据" style="padding:40px 0;" />
          </n-tab-pane>

          <!-- Tab 3: 分账日志 + 打款凭证 -->
          <n-tab-pane name="log" tab="分账日志">
            <!-- 打款凭证（已到账时显示） -->
            <div v-if="currentRecord?.status === 'settled'" style="margin-bottom: 16px;">
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
                    <p style="margin: 8px 0 0 0; font-size: 14px; color: #666;">点击或拖拽上传拉卡拉打款回执凭证</p>
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
        <n-button @click="showDetailModal = false">关闭</n-button>
      </template>
    </n-modal>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NButton, NDataTable, NTag, NSpace, NModal, NTabs, NTabPane,
  NIcon, NDescriptions, NDescriptionsItem, NInput,
  NTimeline, NTimelineItem, NDatePicker, NAlert, NUpload,
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
const filterMonth = ref<number | null>(null)
const filterAgent = ref<string | null>(null)

/**
 * 状态定义：
 * auto_submitted - 正常单，系统自动提交拉卡拉（无需人工）
 * processing     - 拉卡拉分账中，等待回调
 * settled        - 拉卡拉开票成功，款项已到账
 * failed         - 拉卡拉分账失败（账户异常/超时等），可修复后重试
 * exception      - 异常拦截（不满足自动条件），需人工处理后放行
 */
type SettlementStatus = 'auto_submitted' | 'processing' | 'settled' | 'failed' | 'exception'

interface SettlementRecord {
  id: number
  settlementNo: string
  agentName: string
  agentLevel?: string
  agentId: number
  period: string
  monthlyFlow: number
  supplierCost: number        // 供应商成本（扣除后计算分润基数）
  commissionAmount: number    // 应发分润 = (monthlyFlow - supplierCost) × commissionRate
  fee: number
  feeRate: number             // 提现手续费率（如 0.005 = 0.5%）
  bankName: string
  cardNo: string
  status: SettlementStatus
  exceptionReason?: string    // 仅 exception/failed 有值
  lakalaNo?: string           // 拉卡拉流水号
  submitTime: string
  paidTime: string
  remark: string
  logs: Array<{ action: string; time: string; detail: string; type: 'info' | 'success' | 'warning' | 'error' }>
  merchantDetails: Array<{ merchant: string; purchaseAmount: number; commission: number; fee: number }>
  voucher?: string            // 打款凭证图片(base64)
}

// Mock 数据 —— 展示新流程的各类状态（分润 = (采购额 - 供应商成本) × 分润比例）
const payoutData = ref<SettlementRecord[]>([
  {
    // 场景1：正常单 - 系统自动提交拉卡拉
    id: 201, settlementNo: 'ST-202604-001', agentName: '广东省级总代-A', agentLevel: '省级',
    agentId: 1, period: '2026-04', monthlyFlow: 1850000, supplierCost: 1110000,
    commissionAmount: 111000, fee: 555.0, feeRate: 0.005,
    bankName: '招商银行', cardNo: '6214838888888888888',
    status: 'auto_submitted',
    lakalaNo: 'LK202604280930001',
    submitTime: '2026-04-28 09:00', paidTime: '', remark: '',
    merchantDetails: [
      { merchant: '恒然集团VR旗舰店', purchaseAmount: 856200, commission: 51372, fee: 256.86 },
      { merchant: '南山科创体验中心', purchaseAmount: 534600, commission: 32076, fee: 160.38 },
      { merchant: '利民街商家', purchaseAmount: 459200, commission: 27552, fee: 137.76 },
    ],
    logs: [
      { action: '结算单生成', time: '2026-04-28 09:00', detail: '扣除供应商成本后按比例自动计算', type: 'info' as const },
      { action: '自动校验通过', time: '2026-04-28 09:00:01', detail: '账户完整 · 金额≥¥100 · 无申诉', type: 'success' as const },
      { action: '已提交拉卡拉', time: '2026-04-28 09:00:03', detail: '开票+分账请求已发送 LK202604280930001', type: 'info' as const },
    ],
  },
  {
    // 场景2：正常单 - 拉卡拉正在分账中
    id: 202, settlementNo: 'ST-202604-002', agentName: '华东区域代理-B', agentLevel: '区域',
    agentId: 2, period: '2026-04', monthlyFlow: 680000, supplierCost: 374000,
    commissionAmount: 21420, fee: 128.52, feeRate: 0.006,
    bankName: '工商银行', cardNo: '6222021234567890123',
    status: 'processing',
    lakalaNo: 'LK202604280931002',
    submitTime: '2026-04-27 14:30', paidTime: '', remark: '',
    merchantDetails: [
      { merchant: '幻影星空VR体验馆', purchaseAmount: 385000, commission: 12128, fee: 72.77 },
      { merchant: '华东展厅', purchaseAmount: 295000, commission: 9293, fee: 55.76 },
    ],
    logs: [
      { action: '结算单生成', time: '2026-04-27 14:30', detail: '扣除供应商成本后按比例自动计算', type: 'info' as const },
      { action: '自动校验通过', time: '2026-04-27 14:30:01', detail: '账户完整 · 金额≥¥100 · 无申诉', type: 'success' as const },
      { action: '已提交拉卡拉', time: '2026-04-27 14:30:02', detail: 'LK202604280931002', type: 'info' as const },
      { action: '拉卡拉受理', time: '2026-04-28 09:30', detail: '分账请求已受理，等待打款结果回调', type: 'warning' as const },
    ],
  },
  {
    // 场景3：正常单 - 已经到账
    id: 203, settlementNo: 'ST-202603-004', agentName: '广州城市代理-D', agentLevel: '城市',
    agentId: 4, period: '2026-03', monthlyFlow: 45000, supplierCost: 22500,
    commissionAmount: 1125, fee: 5.63, feeRate: 0.005,
    bankName: '农业银行', cardNo: '6228481234567890123',
    status: 'settled',
    lakalaNo: 'LK20260402080003',
    submitTime: '2026-04-02 08:00', paidTime: '2026-04-05 10:20', remark: '',
    logs: [
      { action: '结算单生成', time: '2026-04-02 08:00', detail: '扣除供应商成本后按比例自动计算', type: 'info' as const },
      { action: '自动校验通过', time: '2026-04-02 08:00:01', detail: '自动放行', type: 'success' as const },
      { action: '已提交拉卡拉', time: '2026-04-02 08:00:02', detail: 'LK20260402080003', type: 'info' as const },
      { action: '拉卡拉受理', time: '2026-04-03 09:00', detail: '分账请求已受理', type: 'warning' as const },
      { action: '分账成功', time: '2026-04-05 10:20', detail: '拉卡拉异步回调：开票成功 + 打款到账', type: 'success' as const },
    ],
    merchantDetails: [
      { merchant: '天河城VR店', purchaseAmount: 28000, commission: 700, fee: 3.50 },
      { merchant: '番禺体验中心', purchaseAmount: 17000, commission: 425, fee: 2.13 },
    ],
  },
  {
    // 场景4：异常 - 账户未绑定
    id: 204, settlementNo: 'ST-202604-005', agentName: '成都城市代理-E', agentLevel: '城市',
    agentId: 5, period: '2026-04', monthlyFlow: 89000, supplierCost: 53400,
    commissionAmount: 1780, fee: 8.9, feeRate: 0.005,
    bankName: '-', cardNo: '-',
    status: 'exception',
    exceptionReason: '收款银行账户未绑定',
    submitTime: '2026-04-28 09:00', paidTime: '', remark: '',
    logs: [
      { action: '结算单生成', time: '2026-04-28 09:00', detail: '扣除供应商成本后按比例自动计算', type: 'info' as const },
      { action: '异常拦截', time: '2026-04-28 09:00:01', detail: '收款银行账户未绑定，不符合自动分账条件', type: 'error' as const },
    ],
    merchantDetails: [],
  },
  {
    // 场景5：异常 - 金额为0（无采购）
    id: 205, settlementNo: 'ST-202604-006', agentName: '武汉城市代理-F', agentLevel: '城市',
    agentId: 6, period: '2026-04', monthlyFlow: 0, supplierCost: 0,
    commissionAmount: 0, fee: 0, feeRate: 0,
    bankName: '中国银行', cardNo: '6217850000000000000',
    status: 'exception',
    exceptionReason: '本月游戏豆采购额为 ¥0，低于最低分润门槛(¥100)',
    submitTime: '2026-04-28 09:00', paidTime: '', remark: '',
    logs: [
      { action: '结算单生成', time: '2026-04-28 09:00', detail: '扣除供应商成本后按比例自动计算', type: 'info' as const },
      { action: '异常拦截', time: '2026-04-28 09:00:01', detail: '采购额 ¥0，低于最低分润门槛，累积至下月', type: 'error' as const },
    ],
    merchantDetails: [],
  },
  {
    // 场景6：失败 - 拉卡拉返回账户异常
    id: 206, settlementNo: 'ST-202604-007', agentName: '杭州城市代理-G', agentLevel: '城市',
    agentId: 7, period: '2026-04', monthlyFlow: 230000, supplierCost: 126500,
    commissionAmount: 5175, fee: 25.88, feeRate: 0.005,
    bankName: '交通银行', cardNo: '6222581234567890123',
    status: 'failed',
    exceptionReason: '拉卡拉返回：收款账户名与开户名不一致',
    lakalaNo: 'LK20260428100007',
    submitTime: '2026-04-28 10:00', paidTime: '', remark: '',
    logs: [
      { action: '结算单生成', time: '2026-04-28 10:00', detail: '扣除供应商成本后按比例自动计算', type: 'info' as const },
      { action: '自动校验通过', time: '2026-04-28 10:00:01', detail: '自动放行', type: 'success' as const },
      { action: '已提交拉卡拉', time: '2026-04-28 10:00:02', detail: 'LK20260428100007', type: 'info' as const },
      { action: '分账失败', time: '2026-04-28 10:05', detail: '拉卡拉开票失败：收款账户名与开户名不一致(ERROR_CODE: BANK_NAME_MISMATCH)', type: 'error' as const },
    ],
    merchantDetails: [
      { merchant: '杭州西湖体验馆', purchaseAmount: 138000, commission: 3105, fee: 15.53 },
      { merchant: '滨江店', purchaseAmount: 92000, commission: 2070, fee: 10.35 },
    ],
  },
  {
    // 场景7：异常 - 代理商发起申诉，被临时冻结
    id: 207, settlementNo: 'ST-202604-008', agentName: '南京城市代理-H', agentLevel: '城市',
    agentId: 8, period: '2026-04', monthlyFlow: 560000, supplierCost: 308000,
    commissionAmount: 12600, fee: 63, feeRate: 0.005,
    bankName: '民生银行', cardNo: '6226221234567890123',
    status: 'exception',
    exceptionReason: '代理商已发起分润申诉，分润暂冻结，等待财务复核',
    submitTime: '2026-04-28 09:00', paidTime: '', remark: '代理商称本月有3家商家退款导致采购额虚高',
    logs: [
      { action: '结算单生成', time: '2026-04-28 09:00', detail: '扣除供应商成本后按比例自动计算', type: 'info' as const },
      { action: '自动校验通过', time: '2026-04-28 09:00:01', detail: '账户完整 · 金额≥¥100 · 无申诉', type: 'success' as const },
      { action: '申诉冻结', time: '2026-04-28 11:30', detail: '代理商发起申诉，分润暂冻结', type: 'error' as const },
    ],
    merchantDetails: [
      { merchant: '南京新街口店', purchaseAmount: 320000, commission: 7200, fee: 36.00 },
      { merchant: '江宁体验馆', purchaseAmount: 240000, commission: 5400, fee: 27.00 },
    ],
  },
])

// ========== 统计 ==========
const autoSubmittedCount = computed(() => payoutData.value.filter(d => d.status === 'auto_submitted').length)
const processingCount = computed(() => payoutData.value.filter(d => d.status === 'processing').length)
const settledCount = computed(() => payoutData.value.filter(d => d.status === 'settled').length)
const failedCount = computed(() => payoutData.value.filter(d => d.status === 'failed').length)
const exceptionCount = computed(() => payoutData.value.filter(d => d.status === 'exception').length)
const totalCount = computed(() => payoutData.value.length)

const sumByNet = (status: SettlementStatus) =>
  payoutData.value.filter(d => d.status === status).reduce((s, d) => s + Math.max(0, d.commissionAmount - d.fee), 0)

const autoSubmittedAmount = computed(() => sumByNet('auto_submitted'))
const processingAmount = computed(() => sumByNet('processing'))
const settledAmount = computed(() => sumByNet('settled'))

// ========== 表格列 ==========
const columns = [
  {
    title: '结算单号', key: 'settlementNo', width: 155, ellipsis: { tooltip: true },
    render: (row: any) => h('span', { style: 'font-family:monospace;font-size:12px;' }, row.settlementNo)
  },
  { title: '代理商', key: 'agentName', width: 140 },
  { title: '周期', key: 'period', width: 85, align: 'center' },
  {
    title: '采购额(¥)', key: 'monthlyFlow', width: 115,
    render: (row: any) => row.monthlyFlow > 0 ? `¥${row.monthlyFlow.toLocaleString()}` : h('span', { style: 'color:#9CA3AF;' }, '¥0')
  },
  {
    title: '分润比例', key: 'shareRatio', width: 90, align: 'center',
    render: (row: any) => {
      const base = row.monthlyFlow - row.supplierCost
      if (base <= 0 || row.commissionAmount <= 0) return h('span', { style: 'color:#9CA3AF;' }, '-')
      const ratio = (row.commissionAmount / base * 100).toFixed(1)
      return h('span', { style: 'font-weight:500;color:#6366F1;' }, `${ratio}%`)
    }
  },
  {
    title: '应发分润(¥)', key: 'commissionAmount', width: 120,
    render: (row: any) => h('span', {
      style: `font-weight:600;${row.commissionAmount > 0 ? 'color:#4F46E5;' : 'color:#9CA3AF;'}`
    }, row.commissionAmount > 0 ? `¥${row.commissionAmount.toLocaleString()}` : '-')
  },
  {
    title: '提现手续费(¥)', key: 'fee', width: 90,
    render: (row: any) => row.fee > 0
      ? `¥${row.fee.toFixed(2)}`
      : h('span', { style: 'color:#9CA3AF;' }, '-')
  },
  {
    title: '费率', key: 'feeRate', width: 65, align: 'center',
    render: (row: any) => row.feeRate > 0
      ? `${(row.feeRate * 100).toFixed(1)}%`
      : h('span', { style: 'color:#9CA3AF;' }, '-')
  },
  {
    title: '到账金额(¥)', key: 'actualAmount', width: 110, align: 'right',
    render: (row: any) => {
      const net = row.commissionAmount - row.fee
      return h('span', { style: `font-weight:700;${net > 0 ? 'color:#10B981;' : 'color:#9CA3AF;'}` }, net > 0 ? `¥${net.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-')
    }
  },
  {
    title: '状态', key: 'status', width: 110, align: 'center',
    render: (row: any) => h(NSpace, { size: 2, align: 'center' }, () =>
      row.status === 'exception' || row.status === 'failed'
        ? [h(NTag, { type: statusType(row.status), size: 'small', round: true, bordered: false }, () => statusLabel(row.status)),
           h(NIcon, { component: AlertCircleOutline, size: 14, color: '#EF4444' })]
        : [h(NTag, { type: statusType(row.status), size: 'small', round: true, bordered: false }, () => statusLabel(row.status))]
    )
  },
  { title: '创建时间', key: 'submitTime', width: 160, ellipsis: { tooltip: true },
    render: (row: any) => row.submitTime
  },
  {
    title: '操作', key: 'actions', width: 85, fixed: 'right' as const,
    render: (row: any) => h(NButton, {
      size: 'tiny', secondary: true, type: 'primary', onClick: () => openDetail(row),
    }, () => '详情'),
  },
]

// 下属商家分润明细（从 AgentSettlementManage 合并）
const merchantDetailColumns = [
  { title: '下属商家', key: 'merchant', width: 180 },
  { title: '采购额(¥)', key: 'purchaseAmount', width: 120, render: (r: any) => `¥${r.purchaseAmount.toLocaleString()}` },
  { title: '分润(¥)', key: 'commission', width: 110, render: (r: any) => h('span', { style: 'font-weight:600;color:#3B82F6;' }, `¥${r.commission.toLocaleString()}`) },
  { title: '提现手续费(¥)', key: 'fee', width: 100, render: (r: any) => `¥${r.fee.toFixed(2)}` },
]

// ========== 过滤 ==========
const agentOptions = computed(() => {
  const names = [...new Set(payoutData.value.map(d => d.agentName))]
  return names.map(n => ({ label: n, value: n }))
})

const filteredData = computed(() => {
  let data = [...payoutData.value]
  if (activeTab.value !== 'all') data = data.filter(d => d.status === activeTab.value)
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    data = data.filter(d => d.agentName.toLowerCase().includes(kw) || d.settlementNo.toLowerCase().includes(kw))
  }
  if (filterAgent.value) data = data.filter(d => d.agentName === filterAgent.value)
  if (filterMonth.value) {
    const monthStr = String(filterMonth.value).slice(0, 7) // '2026-04'
    data = data.filter(d => d.period === monthStr)
  }
  return data
})

const pagination = { pageSize: 10 }

// 行样式
function rowClassName(row: any): string {
  if (row.status === 'exception') return 'row-exception'
  if (row.status === 'failed') return 'row-failed'
  return ''
}

function isException(record: SettlementRecord): boolean {
  return record.status === 'exception' || record.status === 'failed'
}

// 状态映射
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
function formatCardNo(no: string): string {
  if (!no) return ''
  return no.replace(/(\d{4})(?=\d)/g, '$1 ')
}

// ========== 详情弹窗 ==========
const showDetailModal = ref(false)
const detailTab = ref('info')
const currentRecord = ref<SettlementRecord | null>(null)
function openDetail(row: SettlementRecord) {
  currentRecord.value = row
  showDetailModal.value = true
}

// ========== 同步拉卡拉状态 ==========
function handleSyncLakala() {
  message.info('正在同步拉卡拉分账状态...')
  setTimeout(() => {
    message.success('拉卡拉分账状态已同步（共更新 0 条）')
  }, 1500)
}

// ========== 打款凭证上传（从 AgentSettlementManage 合并）==========
function handleVoucherUpload({ file, onFinish }: any) {
  if (!currentRecord.value) return
  const reader = new FileReader()
  reader.onload = (e) => {
    const idx = payoutData.value.findIndex(d => d.id === currentRecord.value!.id)
    if (idx !== -1) {
      payoutData.value[idx].voucher = e.target?.result as string
      currentRecord.value = payoutData.value[idx]
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

/* 异常标识横幅 */
.exception-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: 8px;
  color: #991B1B;
  font-size: 13px;
  margin-bottom: 16px;
}

::deep(.row-exception td) { background: #FFFBEB !important; }
::deep(.row-exception td:first-child) { border-left: 3px solid #F59E0B; }
::deep(.row-failed td) { background: #FEF2F2 !important; }
::deep(.row-failed td:first-child) { border-left: 3px solid #EF4444; }
</style>
