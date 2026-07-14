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
              <strong>¥{{ consumeTotal.toFixed(1) }}</strong>
            </div>
            <div class="crm-summary-card">
              <span>消费订单笔数：</span>
              <strong>{{ consumeCount }}</strong>
            </div>
          </section>

          <p class="crm-note"><em>*</em>列表仅展示本店订单</p>

          <div class="crm-table-wrap">
            <table class="crm-table">
              <colgroup>
                <col style="width:18%">
                <col style="width:22%">
                <col style="width:10%">
                <col style="width:10%">
                <col style="width:20%">
                <col style="width:10%">
                <col style="width:10%">
              </colgroup>
              <thead>
                <tr>
                  <th>交易时间</th>
                  <th>商品</th>
                  <th>应付</th>
                  <th>实收</th>
                  <th>支付方式</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!consumptionRecords.length">
                  <td colspan="7" class="crm-empty-row">暂无消费记录</td>
                </tr>
                <tr v-for="row in pagedRecords" :key="row.id">
                  <td>{{ row.time }}</td>
                  <td class="crm-product-cell">{{ row.product }}</td>
                  <td class="crm-amount">¥{{ row.payableAmount || row.amount }}</td>
                  <td class="crm-amount crm-paid-amount" :class="{ 'crm-paid-zero': (row.paidAmount || row.amount) === '0' || (row.paidAmount || row.amount) === '0.00' }">¥{{ row.paidAmount || row.amount }}</td>
                  <td>
                    <div class="crm-payment-tags">
                      <template v-for="(pm, pi) in parsePaymentContent(row.paymentContent || row.payMethod)" :key="pi">
                        <span class="crm-pay-tag" :class="pm.colorClass">{{ pm.label }}<template v-if="pm.amount"> ¥{{ pm.amount }}</template></span>
                      </template>
                    </div>
                  </td>
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
                  <span class="crm-type-tag recharge">充值</span>
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

const consumptionRecords = computed(() => props.records.filter(r => r.type !== 'recharge'))

const pageCount = computed(() => Math.max(1, Math.ceil(consumptionRecords.value.length / pageSize)))

const pagedRecords = computed(() => {
  const start = (page.value - 1) * pageSize
  return consumptionRecords.value.slice(start, start + pageSize)
})

const consumeTotal = computed(() => {
  return consumptionRecords.value.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0)
})

const consumeCount = computed(() => consumptionRecords.value.length)

watch(() => props.records, () => { page.value = 1 })

const statusClass = (status) => {
  if (status === '完成') return 'status-done'
  if (status === '退款' || status === '已退款') return 'status-refund'
  if (status === '进行中') return 'status-pending'
  return ''
}

const PAY_COLORS = {
  '预存款': 'pay-balance',
  '余额抵扣': 'pay-balance',
  '余额': 'pay-balance',
  '微信支付': 'pay-wechat',
  '微信': 'pay-wechat',
  '支付宝': 'pay-alipay',
  '游戏币': 'pay-coin',
  '游戏币抵扣': 'pay-coin',
  '现金': 'pay-cash',
  '会员券': 'pay-coupon',
  '套票抵扣': 'pay-coupon'
}

const parsePaymentContent = (content) => {
  if (!content) return []
  const parts = String(content).split(/[,，]/)
  return parts.map((p) => {
    const m = p.trim().match(/^(.+?)[:：]\s*([\d.]+)$/)
    if (m) {
      const label = m[1].trim()
      const colorClass = PAY_COLORS[label] || 'pay-other'
      return { label, amount: m[2], colorClass }
    }
    const label = p.trim()
    const colorClass = PAY_COLORS[label] || 'pay-other'
    return { label, amount: '', colorClass }
  })
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
  width: min(100%, 860px);
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 16px 48px rgba(15, 23, 42, 0.18);
}

.crm-header {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid #f3f4f6;
}

.crm-header-title {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.crm-header-avatar {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #3b82f6;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
}

.crm-header h2 {
  margin: 0;
  color: #111827;
  font-size: 15px;
  font-weight: 700;
}

.crm-header-actions {
  display: flex;
  align-items: center;
  gap: 2px;
}

.crm-close-btn {
  width: 30px;
  height: 30px;
  border: 0;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  font-size: 20px;
  line-height: 30px;
  border-radius: 6px;
  transition: all 0.15s;
}

.crm-close-btn:hover {
  color: #475569;
  background: #f1f5f9;
}

.crm-refresh-btn {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.15s;
}

.crm-refresh-btn:hover {
  color: #3b82f6;
  background: #eff6ff;
}

.crm-body {
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 16px 16px;
}

.crm-detail-body {
  overflow-y: auto;
}

.crm-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.crm-summary-card {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 10px;
  background: #f8fafc;
  color: #64748b;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid #f1f5f9;
}

.crm-summary-card strong {
  font-size: 18px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: #0f172a;
}

.crm-note {
  margin: 0 2px;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 500;
}

.crm-note em {
  margin-right: 2px;
  color: #f87171;
  font-style: normal;
}

.crm-table-wrap {
  min-height: 0;
  flex: 1;
  overflow: auto;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #f1f5f9;
}

.crm-table {
  width: 100%;
  border-collapse: collapse;
}

.crm-table thead th {
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 10px 12px;
  text-align: left;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 600;
  border-bottom: 1px solid #f1f5f9;
  background: #fff;
  white-space: nowrap;
}

.crm-table tbody td {
  padding: 12px;
  color: #1f2937;
  font-size: 13px;
  font-weight: 500;
  border-bottom: 1px solid #f8fafc;
  vertical-align: middle;
}

.crm-table tbody tr:hover td {
  background: #fafafa;
}

.crm-table tbody tr:last-child td {
  border-bottom: 0;
}

.crm-amount {
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  color: #1e293b;
  font-weight: 500;
}

.crm-paid-amount {
  font-weight: 700;
  color: #0f172a;
}

.crm-paid-zero {
  color: #cbd5e1;
  font-weight: 400;
}

.crm-product-cell {
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.crm-payment-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.crm-pay-tag {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.crm-pay-tag.pay-balance {
  background: #ede9fe;
  color: #7c3aed;
}

.crm-pay-tag.pay-wechat {
  background: #dcfce7;
  color: #15803d;
}

.crm-pay-tag.pay-alipay {
  background: #dbeafe;
  color: #1d4ed8;
}

.crm-pay-tag.pay-coin {
  background: #fef3c7;
  color: #b45309;
}

.crm-pay-tag.pay-cash {
  background: #f3f4f6;
  color: #4b5563;
}

.crm-pay-tag.pay-coupon {
  background: #fce7f3;
  color: #be185d;
}

.crm-pay-tag.pay-other {
  background: #f3f4f6;
  color: #4b5563;
}

.crm-empty-row {
  text-align: center !important;
  padding: 48px 20px !important;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 500;
}

.crm-status {
  width: fit-content;
  height: 22px;
  display: inline-flex;
  align-items: center;
  padding: 0 10px;
  border-radius: 11px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
  background: #eff6ff;
  color: #2563eb;
}

.crm-status.status-done {
  background: #dcfce7;
  color: #15803d;
}

.crm-status.status-refund {
  background: #fee2e2;
  color: #dc2626;
}

.crm-status.status-pending {
  background: #fef3c7;
  color: #b45309;
}

.crm-detail-btn {
  border: 0;
  background: transparent;
  color: #3b82f6;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.15s;
}

.crm-detail-btn:hover {
  color: #1d4ed8;
}

.crm-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding-top: 4px;
}

.crm-page-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  min-width: 32px;
  padding: 0 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #fff;
  color: #475569;
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  transition: all 0.15s;
  box-sizing: border-box;
}

.crm-page-btn:hover:not(:disabled):not(.active) {
  border-color: #93c5fd;
  color: #2563eb;
}

.crm-page-btn.active {
  border-color: #3b82f6;
  background: #3b82f6;
  color: #fff;
}

.crm-page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* ===== 详情视图样式 ===== */
.crm-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  align-self: flex-start;
  border: 0;
  background: transparent;
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.15s;
}

.crm-back-btn:hover {
  color: #3b82f6;
}

.crm-detail-card {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  background: #fff;
  border-radius: 10px;
  padding: 20px 24px 24px;
  border: 1px solid #f1f5f9;
}

.crm-detail-section-title {
  margin: 0 0 12px;
  padding-bottom: 8px;
  color: #0f172a;
  font-size: 14px;
  font-weight: 700;
  border-bottom: 1px solid #f1f5f9;
}

.crm-detail-section-title + .crm-detail-section-title {
  margin-top: 20px;
}

.crm-detail-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0 16px;
}

.crm-detail-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 0;
}

.crm-detail-item.crm-detail-full {
  grid-column: 1 / -1;
}

.crm-detail-item label {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 500;
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
  font-size: 12px !important;
}

.crm-detail-strong {
  font-weight: 700 !important;
  font-size: 15px !important;
  color: #0f172a;
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

.crm-detail-item .crm-status {
  font-size: 12px;
}

.crm-detail-item .crm-type-tag {
  font-size: 11px;
}

.crm-type-tag.recharge {
  background: #ede9fe;
  color: #6d28d9;
}

.crm-type-tag.consumption {
  background: #dbeafe;
  color: #1d4ed8;
}

.crm-type-tag.purchase {
  background: #fef3c7;
  color: #b45309;
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
