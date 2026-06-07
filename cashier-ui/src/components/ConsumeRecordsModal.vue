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
            <h2>{{ memberName }} - 累计消耗</h2>
          </div>
          <div class="crm-header-actions">
            <button type="button" class="crm-refresh-btn" aria-label="刷新" @click="$emit('refresh')"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6"/><path d="M2.5 22v-6h6"/><path d="M2 11.5a10 10 0 0 1 18.8-4.3"/><path d="M22 12.5a10 10 0 0 1-18.8 4.2"/></svg></button>
            <button type="button" class="crm-close-btn" @click="$emit('close')">×</button>
          </div>
        </header>

        <div class="crm-body">
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
                  <td><span class="crm-status">{{ row.status }}</span></td>
                  <td><button type="button" class="crm-detail-btn">详情</button></td>
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
const memberInitial = computed(() => (props.memberName || '会').charAt(0))

const pageCount = computed(() => Math.max(1, Math.ceil(props.records.length / pageSize)))

const pagedRecords = computed(() => {
  const start = (page.value - 1) * pageSize
  return props.records.slice(start, start + pageSize)
})

watch(() => props.visible, (val) => {
  if (val) page.value = 1
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
  background: var(--pos-overlay-backdrop);
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
  min-width: 48px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  border-radius: 6px;
  border: 1px solid rgba(96, 165, 250, 0.55);
  background: rgba(239, 246, 255, 0.92);
  color: #3b82f6;
  font-size: 13px;
  font-weight: 600;
}

.crm-detail-btn {
  border: 0;
  background: transparent;
  color: #3b82f6;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
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

.crm-fade-enter-active,
.crm-fade-leave-active {
  transition: opacity 0.2s ease;
}

.crm-fade-enter-from,
.crm-fade-leave-to {
  opacity: 0;
}
</style>
