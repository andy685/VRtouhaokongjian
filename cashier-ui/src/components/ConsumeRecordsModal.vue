<template>
  <transition name="crm-fade">
    <div
      v-if="visible"
      class="crm-overlay"
      role="dialog"
      aria-modal="true"
      :aria-label="`${memberName} - 累计消耗`"
      @click.self="$emit('close')"
    >
      <section class="crm-dialog">
        <header class="crm-header">
          <div class="crm-header-title">
            <span class="crm-header-avatar">{{ memberInitial }}</span>
            <h2>
              <template v-if="selectedRecord">订单详情</template>
              <template v-else>{{ memberName }} - 累计消耗</template>
            </h2>
          </div>
          <div class="crm-header-actions">
            <button v-if="!selectedRecord" type="button" class="crm-refresh-btn" aria-label="刷新" @click="$emit('refresh')">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6"/><path d="M2.5 22v-6h6"/><path d="M2 11.5a10 10 0 0 1 18.8-4.3"/><path d="M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
            </button>
            <button type="button" class="crm-close-btn" @click="selectedRecord ? (selectedRecord = null) : $emit('close')">×</button>
          </div>
        </header>

        <!-- 列表视图 -->
        <div v-if="!selectedRecord" class="crm-body">
          <section class="crm-summary">
            <div class="crm-summary-card">
              <span>累计消费金额：</span>
              <strong>¥{{ totalAmount.toFixed(1) }}</strong>
            </div>
            <div class="crm-summary-card">
              <span>订单笔数：</span>
              <strong>{{ records.length }}</strong>
            </div>
          </section>

          <p class="crm-note"><em>*</em>列表仅展示本店订单</p>

          <div class="crm-table-wrap">
            <table class="crm-table">
              <thead>
                <tr>
                  <th>交易时间</th>
                  <th>商品</th>
                  <th>实收总额</th>
                  <th>订单状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in pagedRecords" :key="row.id">
                  <td>{{ row.time }}</td>
                  <td>{{ row.product }}</td>
                  <td class="crm-amount">{{ row.amount }}</td>
                  <td><span class="crm-status" :class="statusClass(row.status)">{{ row.status }}</span></td>
                  <td><button type="button" class="crm-detail-btn" @click="openDetail(row)">详情</button></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="crm-pagination">
            <button type="button" class="crm-page-btn" :disabled="page <= 1" @click="page--">‹</button>
            <button
              v-for="pageNo in pageCount"
              :key="pageNo"
              type="button"
              class="crm-page-btn"
              :class="{ active: pageNo === page }"
              @click="page = pageNo"
            >
              {{ pageNo }}
            </button>
            <button type="button" class="crm-page-btn" :disabled="page >= pageCount" @click="page++">›</button>
          </div>
        </div>

        <!-- 详情视图 -->
        <div v-else class="crm-body crm-detail-body">
          <button type="button" class="crm-back-btn" @click="selectedRecord = null">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            返回列表
          </button>

          <div class="crm-detail-card">
            <!-- 充值订单详情 -->
            <template v-if="selectedRecord.type === 'recharge'">
              <h3 class="crm-detail-section-title">订单信息</h3>
              <div class="crm-detail-grid">
                <div class="crm-detail-item">
                  <label>订单编号</label>
                  <span class="crm-detail-mono">{{ selectedRecord.orderNo }}</span>
                </div>
                <div class="crm-detail-item">
                  <label>交易时间</label>
                  <span>{{ selectedRecord.time }}</span>
                </div>
                <div class="crm-detail-item">
                  <label>订单类型</label>
                  <span class="crm-type-tag recharge">充值充值</span>
                </div>
                <div class="crm-detail-item">
                  <label>订单状态</label>
                  <span class="crm-status" :class="statusClass(selectedRecord.status)">{{ selectedRecord.status }}</span>
                </div>
                <div class="crm-detail-item crm-detail-full">
                  <label>套餐名称</label>
                  <span class="crm-detail-strong">{{ selectedRecord.detail.packageName }}</span>
                </div>
                <div class="crm-detail-item crm-detail-full">
                  <label>套餐说明</label>
                  <span>{{ selectedRecord.detail.packageDesc }}</span>
                </div>
              </div>

              <h3 class="crm-detail-section-title">权益明细</h3>
              <div class="crm-detail-grid">
                <div class="crm-detail-item">
                  <label>实付金额</label>
                  <span class="crm-detail-strong">¥{{ selectedRecord.detail.paid }}</span>
                </div>
                <div class="crm-detail-item">
                  <label>获得预存款</label>
                  <span>¥{{ selectedRecord.detail.gotPrepaid }}</span>
                </div>
                <div class="crm-detail-item">
                  <label>获得游戏币</label>
                  <span>{{ selectedRecord.detail.gotCoins }} 币</span>
                </div>
                <div class="crm-detail-item" v-if="selectedRecord.detail.gotTickets !== '0'">
                  <label>获得套票</label>
                  <span>{{ selectedRecord.detail.gotTickets }} 张</span>
                </div>
              </div>

              <h3 class="crm-detail-section-title">交易信息</h3>
              <div class="crm-detail-grid">
                <div class="crm-detail-item">
                  <label>支付方式</label>
                  <span>{{ selectedRecord.payMethod }}</span>
                </div>
                <div class="crm-detail-item">
                  <label>操作门店</label>
                  <span>{{ selectedRecord.store }}</span>
                </div>
                <div class="crm-detail-item">
                  <label>操作人</label>
                  <span>{{ selectedRecord.operator }}</span>
                </div>
              </div>
            </template>

            <!-- 消费订单详情 -->
            <template v-else-if="selectedRecord.type === 'consumption'">
              <h3 class="crm-detail-section-title">订单信息</h3>
              <div class="crm-detail-grid">
                <div class="crm-detail-item">
                  <label>订单编号</label>
                  <span class="crm-detail-mono">{{ selectedRecord.orderNo }}</span>
                </div>
                <div class="crm-detail-item">
                  <label>交易时间</label>
                  <span>{{ selectedRecord.time }}</span>
                </div>
                <div class="crm-detail-item">
                  <label>订单类型</label>
                  <span class="crm-type-tag consumption">设备消费</span>
                </div>
                <div class="crm-detail-item">
                  <label>订单状态</label>
                  <span class="crm-status" :class="statusClass(selectedRecord.status)">{{ selectedRecord.status }}</span>
                </div>
                <div class="crm-detail-item crm-detail-full">
                  <label>项目名称</label>
                  <span class="crm-detail-strong">{{ selectedRecord.detail.projectName }}</span>
                </div>
              </div>

              <h3 class="crm-detail-section-title">消费明细</h3>
              <div class="crm-detail-grid">
                <div class="crm-detail-item">
                  <label>游玩时长</label>
                  <span>{{ selectedRecord.detail.duration }}</span>
                </div>
                <div class="crm-detail-item">
                  <label>单价</label>
                  <span>¥{{ selectedRecord.detail.unitPrice }}/{{ selectedRecord.detail.unit }}</span>
                </div>
                <div class="crm-detail-item">
                  <label>数量</label>
                  <span>{{ selectedRecord.detail.quantity }}</span>
                </div>
                <div class="crm-detail-item">
                  <label>实收金额</label>
                  <span class="crm-detail-strong">¥{{ selectedRecord.detail.paid }}</span>
                </div>
              </div>

              <h3 class="crm-detail-section-title">交易信息</h3>
              <div class="crm-detail-grid">
                <div class="crm-detail-item">
                  <label>支付来源</label>
                  <span>{{ selectedRecord.payMethod }}</span>
                </div>
                <div class="crm-detail-item">
                  <label>操作门店</label>
                  <span>{{ selectedRecord.store }}</span>
                </div>
              </div>
            </template>

            <!-- 购买商品详情 -->
            <template v-else-if="selectedRecord.type === 'purchase'">
              <h3 class="crm-detail-section-title">订单信息</h3>
              <div class="crm-detail-grid">
                <div class="crm-detail-item">
                  <label>订单编号</label>
                  <span class="crm-detail-mono">{{ selectedRecord.orderNo }}</span>
                </div>
                <div class="crm-detail-item">
                  <label>交易时间</label>
                  <span>{{ selectedRecord.time }}</span>
                </div>
                <div class="crm-detail-item">
                  <label>订单类型</label>
                  <span class="crm-type-tag purchase">商品购买</span>
                </div>
                <div class="crm-detail-item">
                  <label>订单状态</label>
                  <span class="crm-status" :class="statusClass(selectedRecord.status)">{{ selectedRecord.status }}</span>
                </div>
                <div class="crm-detail-item crm-detail-full">
                  <label>商品名称</label>
                  <span class="crm-detail-strong">{{ selectedRecord.detail.goodsName }}</span>
                </div>
              </div>

              <h3 class="crm-detail-section-title">购买明细</h3>
              <div class="crm-detail-grid">
                <div class="crm-detail-item">
                  <label>数量</label>
                  <span>{{ selectedRecord.detail.quantity }}</span>
                </div>
                <div class="crm-detail-item">
                  <label>单价</label>
                  <span>¥{{ selectedRecord.detail.unitPrice }}</span>
                </div>
                <div class="crm-detail-item">
                  <label>实付金额</label>
                  <span class="crm-detail-strong">¥{{ selectedRecord.detail.paid }}</span>
                </div>
              </div>

              <h3 class="crm-detail-section-title">交易信息</h3>
              <div class="crm-detail-grid">
                <div class="crm-detail-item">
                  <label>支付方式</label>
                  <span>{{ selectedRecord.payMethod }}</span>
                </div>
                <div class="crm-detail-item">
                  <label>操作门店</label>
                  <span>{{ selectedRecord.store }}</span>
                </div>
                <div class="crm-detail-item">
                  <label>操作人</label>
                  <span>{{ selectedRecord.operator }}</span>
                </div>
              </div>
            </template>

            <!-- 未知类型兜底 -->
            <template v-else>
              <h3 class="crm-detail-section-title">订单信息</h3>
              <div class="crm-detail-grid">
                <div class="crm-detail-item">
                  <label>订单编号</label>
                  <span class="crm-detail-mono">{{ selectedRecord.orderNo || '-' }}</span>
                </div>
                <div class="crm-detail-item">
                  <label>交易时间</label>
                  <span>{{ selectedRecord.time }}</span>
                </div>
                <div class="crm-detail-item">
                  <label>商品</label>
                  <span>{{ selectedRecord.product }}</span>
                </div>
                <div class="crm-detail-item">
                  <label>实收金额</label>
                  <span class="crm-detail-strong">¥{{ selectedRecord.amount }}</span>
                </div>
                <div class="crm-detail-item">
                  <label>订单状态</label>
                  <span class="crm-status" :class="statusClass(selectedRecord.status)">{{ selectedRecord.status }}</span>
                </div>
              </div>
            </template>
          </div>
        </div>
      </section>
    </div>
  </transition>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  memberName: { type: String, default: '会员名' },
  records: { type: Array, default: () => [] },
  totalAmount: { type: Number, default: 0 }
})

defineEmits(['close', 'refresh'])

const page = ref(1)
const pageSize = 4
const selectedRecord = ref(null)
const memberInitial = computed(() => (props.memberName || '会').charAt(0))

const pageCount = computed(() => Math.max(1, Math.ceil(props.records.length / pageSize)))

const pagedRecords = computed(() => {
  const start = (page.value - 1) * pageSize
  return props.records.slice(start, start + pageSize)
})

const statusClass = (status) => {
  if (status === '完成') return 'status-done'
  if (status === '退款' || status === '已退款') return 'status-refund'
  if (status === '进行中') return 'status-pending'
  return ''
}

const openDetail = (row) => {
  selectedRecord.value = row
}

watch(() => props.visible, (val) => {
  if (val) {
    page.value = 1
    selectedRecord.value = null
  }
})
</script>

<style scoped>
.crm-overlay {
  position: fixed;
  inset: 0;
  z-index: 55;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--pos-overlay-backdrop, rgba(15, 23, 42, 0.45));
}

.crm-dialog {
  width: min(100%, 1040px);
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 16px;
  background: #dff0ff;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.24);
}

.crm-header {
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 22px 0 24px;
  background: #fff;
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
}

.crm-header-title {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.crm-header-avatar {
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: linear-gradient(135deg, #9bd6ff 0%, #2a8fff 100%);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
}

.crm-header h2 {
  margin: 0;
  color: #111827;
  font-size: 16px;
  font-weight: 700;
}

.crm-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.crm-close-btn {
  width: 32px;
  height: 32px;
  border: 0;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  font-size: 22px;
  line-height: 1;
}

.crm-refresh-btn {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
}

.crm-refresh-btn:hover {
  color: #3b82f6;
}

.crm-body {
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 20px 14px 22px;
}

.crm-detail-body {
  overflow-y: auto;
}

.crm-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.crm-summary-card {
  min-height: 62px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 18px;
  background: #fff;
  color: #111827;
  font-size: 14px;
  font-weight: 600;
}

.crm-summary-card strong {
  font-size: 16px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.crm-note {
  margin: 0 2px;
  color: #374151;
  font-size: 13px;
  font-weight: 500;
}

.crm-note em {
  margin-right: 2px;
  color: #ef4444;
  font-style: normal;
}

.crm-table-wrap {
  min-height: 0;
  flex: 1;
  overflow: auto;
  border-radius: 18px;
  background: #fff;
}

.crm-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.crm-table thead th {
  padding: 18px 20px;
  text-align: left;
  color: #111827;
  font-size: 14px;
  font-weight: 700;
  border-bottom: 1px solid #edf2f7;
  background: #fff;
}

.crm-table tbody td {
  padding: 20px;
  color: #1f2937;
  font-size: 14px;
  font-weight: 500;
  border-bottom: 1px solid #edf2f7;
}

.crm-table tbody tr:last-child td {
  border-bottom: 0;
}

.crm-amount {
  font-variant-numeric: tabular-nums;
}

.crm-status {
  width: fit-content;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  border-radius: 4px;
  border: 1px solid rgba(96, 165, 250, 0.55);
  background: rgba(239, 246, 255, 0.92);
  color: #3b82f6;
  font-size: 12px;
  font-weight: 600;
}

.crm-status.status-done {
  border-color: rgba(34, 197, 94, 0.45);
  background: rgba(240, 253, 244, 0.92);
  color: #16a34a;
}

.crm-status.status-refund {
  border-color: rgba(239, 68, 68, 0.45);
  background: rgba(254, 242, 242, 0.92);
  color: #dc2626;
}

.crm-status.status-pending {
  border-color: rgba(245, 158, 11, 0.45);
  background: rgba(255, 251, 235, 0.92);
  color: #d97706;
}

.crm-detail-btn {
  border: 0;
  background: transparent;
  color: #3b82f6;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;
}

.crm-detail-btn:hover {
  opacity: 0.75;
}

.crm-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.crm-page-btn {
  width: 34px;
  height: 32px;
  border: 1px solid #d7dfeb;
  border-radius: 4px;
  background: #fff;
  color: #64748b;
  font-size: 14px;
  cursor: pointer;
}

.crm-page-btn.active {
  border-color: #60a5fa;
  background: #60a5fa;
  color: #fff;
}

.crm-page-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* ===== 详情视图样式 ===== */
.crm-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  border: 0;
  background: transparent;
  color: #3b82f6;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 6px;
  transition: background 0.15s;
}

.crm-back-btn:hover {
  background: rgba(59, 130, 246, 0.08);
}

.crm-detail-card {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  background: #fff;
  border-radius: 18px;
  padding: 28px 32px 32px;
}

.crm-detail-section-title {
  margin: 0 0 16px;
  padding-bottom: 10px;
  color: #111827;
  font-size: 15px;
  font-weight: 700;
  border-bottom: 1px solid #edf2f7;
}

.crm-detail-section-title + .crm-detail-section-title {
  margin-top: 28px;
}

.crm-detail-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0 24px;
}

.crm-detail-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 0;
}

.crm-detail-item.crm-detail-full {
  grid-column: 1 / -1;
}

.crm-detail-item label {
  color: #6b7280;
  font-size: 12px;
  font-weight: 600;
  text-transform: none;
}

.crm-detail-item span {
  color: #1f2937;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  word-break: break-all;
}

.crm-detail-mono {
  font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
  font-size: 13px !important;
  letter-spacing: 0.02em;
}

.crm-detail-strong {
  font-weight: 700 !important;
  font-size: 15px !important;
}

.crm-type-tag {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 7px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  align-self: flex-start;
}

.crm-type-tag.recharge {
  background: #ede9fe;
  color: #7c3aed;
}

.crm-type-tag.consumption {
  background: #dbeafe;
  color: #2563eb;
}

.crm-type-tag.purchase {
  background: #fef3c7;
  color: #d97706;
}

/* ===== 过渡动画 ===== */
.crm-fade-enter-active,
.crm-fade-leave-active {
  transition: opacity 0.2s ease;
}

.crm-fade-enter-from,
.crm-fade-leave-to {
  opacity: 0;
}
</style>
