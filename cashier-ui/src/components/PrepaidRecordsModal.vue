<template>
  <transition name="prm-fade">
    <div
      v-if="visible"
      class="prm-overlay"
      role="dialog"
      aria-modal="true"
      :aria-label="`${memberName} - 会员日志`"
      @click.self="$emit('close')"
    >
      <section class="prm-dialog">
        <header class="prm-header">
          <div class="prm-header-title">
            <span class="prm-header-avatar">{{ memberInitial }}</span>
            <h2>{{ memberName }} - 会员日志</h2>
          </div>
          <div class="prm-header-actions">
            <button type="button" class="prm-refresh-btn" aria-label="刷新" @click="$emit('refresh')"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6"/><path d="M2.5 22v-6h6"/><path d="M2 11.5a10 10 0 0 1 18.8-4.3"/><path d="M22 12.5a10 10 0 0 1-18.8 4.2"/></svg></button>
            <button type="button" class="prm-close-btn" @click="$emit('close')">×</button>
          </div>
        </header>

        <div class="prm-body">
          <section class="prm-filter-card">
            <nav class="prm-tabs" aria-label="会员日志分类">
              <button
                v-for="tab in tabs"
                :key="tab.key"
                type="button"
                class="prm-tab"
                :class="{ active: activeTab === tab.key }"
                @click="activeTab = tab.key"
              >
                {{ tab.label }}
              </button>
            </nav>

            <div v-if="activeTab === 'coins'" class="prm-coins-summary">
              <div class="prm-coins-item">
                <span>当前游戏币总数：</span>
                <strong>{{ coinSummary.total.toFixed(2) }}</strong>
              </div>
              <div class="prm-coins-item">
                <span>可用币数：</span>
                <strong>{{ coinSummary.available.toFixed(2) }}</strong>
              </div>
              <div class="prm-coins-item">
                <span>未生效：</span>
                <strong>{{ coinSummary.pending }}</strong>
              </div>
            </div>

            <div v-if="activeTab !== 'coins'" class="prm-filters">
              <!-- 套票：汇总与筛选项同行 -->
              <template v-if="activeTab === 'tickets'">
                <div class="prm-filter-group">
                  <span>当前套票总数：<strong>{{ ticketSummary.total }}</strong></span>
                </div>
                <div class="prm-filter-divider"></div>
              </template>
              <div class="prm-filter-group">
                <label>变动时间：</label>
                <div class="prm-date-range">
                  <input v-model="dateRange.start" type="date" class="prm-date-input" />
                  <span>~</span>
                  <input v-model="dateRange.end" type="date" class="prm-date-input" />
                </div>
              </div>

              <div v-if="showTypeFilter" class="prm-filter-group">
                <label>变动类型：</label>
                <select v-model="selectedType" class="prm-select">
                  <option value="all">全部</option>
                  <option v-for="item in activeTypeOptions" :key="item" :value="item">{{ item }}</option>
                </select>
              </div>

              <button type="button" class="prm-query-btn" @click="page = 1">查询</button>
            </div>
          </section>

          <div class="prm-table-card">
            <table class="prm-table" :class="{ 'prm-table-game': activeTab === 'games', 'prm-table-coins': activeTab === 'coins', 'prm-table-tickets': activeTab === 'tickets', 'prm-table-times': activeTab === 'times' }">
              <thead>
                <tr v-if="activeTab === 'games'">
                  <th>发生门店</th>
                  <th>游戏名称</th>
                  <th>操作人</th>
                  <th>开始时间</th>
                </tr>
                <tr v-else-if="activeTab === 'coins'">
                  <th>发生门店</th>
                  <th>创建时间</th>
                  <th>状态</th>
                  <th>生效日期</th>
                  <th>过期日期</th>
                  <th>变更数量</th>
                  <th>剩余数量</th>
                  <th>已用/已退数量</th>
                  <th>备注</th>
                </tr>
                <tr v-else-if="activeTab === 'tickets'">
                  <th>变更原因</th>
                  <th>发生门店</th>
                  <th>套票名称</th>
                  <th>状态</th>
                  <th>过期日期</th>
                  <th>变更数量</th>
                  <th>剩余数量</th>
                  <th>操作人</th>
                  <th>更改时间</th>
                </tr>
                <tr v-else>
                  <th>变更原因</th>
                  <th>门店</th>
                  <th>变更金额</th>
                  <th>变更后金额</th>
                  <th>备注</th>
                  <th>操作人</th>
                  <th>变更时间</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in pagedRecords" :key="row.id" :class="{ 'prm-row-game': activeTab === 'games' }">
                  <template v-if="activeTab === 'games'">
                    <td>{{ row.store }}</td>
                    <td class="prm-amount">{{ row.gameName }}</td>
                    <td>{{ row.operator }}</td>
                    <td>{{ row.changedAt }}</td>
                  </template>
                  <template v-else-if="activeTab === 'coins'">
                    <td>{{ row.store }}</td>
                    <td>{{ row.createdAt }}</td>
                    <td>{{ row.statusLabel }}</td>
                    <td>{{ row.effectiveDate }}</td>
                    <td>{{ row.expireDate }}</td>
                    <td class="prm-amount">{{ row.changeQty }}</td>
                    <td class="prm-amount">{{ row.remainQty }}</td>
                    <td class="prm-amount">{{ row.usedQty }}</td>
                    <td class="prm-note-cell">{{ row.note || '--' }}</td>
                  </template>
                  <template v-else-if="activeTab === 'tickets'">
                    <td>{{ row.reason }}</td>
                    <td>{{ row.store }}</td>
                    <td>{{ row.ticketName }}</td>
                    <td>{{ row.statusLabel }}</td>
                    <td>{{ row.expireDate }}</td>
                    <td class="prm-amount" :class="{ income: String(row.changeQty).startsWith('+'), expense: String(row.changeQty).startsWith('-') }">
                      {{ row.changeQty }}
                    </td>
                    <td class="prm-amount">{{ row.remainQty }}</td>
                    <td>{{ row.operator }}</td>
                    <td>{{ row.changedAt }}</td>
                  </template>
                  <template v-else>
                  <td>{{ row.reason }}</td>
                  <td>{{ row.store }}</td>
                  <td class="prm-amount" :class="{ income: row.changeAmount.startsWith('+'), expense: row.changeAmount.startsWith('-') }">
                    {{ row.changeAmount }}
                  </td>
                  <td class="prm-amount">{{ row.afterAmount }}</td>
                  <td class="prm-note-cell">{{ row.note || '--' }}</td>
                  <td>{{ row.operator }}</td>
                  <td>{{ row.changedAt }}</td>
                  </template>
                </tr>
              </tbody>
            </table>

            <div class="prm-pagination">
              <button type="button" class="prm-page-btn" :disabled="page <= 1" @click="page--">‹</button>
              <button
                v-for="pageNo in pageCount"
                :key="pageNo"
                type="button"
                class="prm-page-btn"
                :class="{ active: pageNo === page }"
                @click="page = pageNo"
              >
                {{ pageNo }}
              </button>
              <button type="button" class="prm-page-btn" :disabled="page >= pageCount" @click="page++">›</button>
            </div>
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
  initialTab: { type: String, default: 'prepaid' },
  coinSummary: {
    type: Object,
    default: () => ({ total: 0, available: 0, pending: 0 })
  },
  ticketSummary: {
    type: Object,
    default: () => ({ total: 0 })
  },
  records: { type: Array, default: () => [] }
})

defineEmits(['close', 'refresh'])

const tabs = [
  { key: 'games', label: '游戏记录' },
  { key: 'prepaid', label: '预存款记录' },
  { key: 'coins', label: '游戏币记录' },
  // 套票暂不启用
  // { key: 'tickets', label: '套票记录' },
]

const tabTypeMap = {
  games: ['单次消费', '购买商品'],
  prepaid: ['收银台充值', '充值活动', '单次消费', '购买商品', '退款返还', '手动调整'],
  coins: ['收银台充值', '单次消费'],
  tickets: ['购买套票', '套票消费', '退款退还', '手动调整', '过期作废']
}

const activeTab = ref('prepaid')
const selectedType = ref('all')
const page = ref(1)
const pageSize = 6
const dateRange = ref({
  start: '2024-11-17',
  end: '2024-11-17'
})

const memberInitial = computed(() => (props.memberName || '会').charAt(0))
const showTypeFilter = computed(() => activeTab.value !== 'games')

const activeTypeOptions = computed(() => tabTypeMap[activeTab.value] || [])

const filteredRecords = computed(() => {
  return props.records.filter((row) => {
    const matchedTab = row.tab === activeTab.value
    const matchedType = selectedType.value === 'all' || row.type === selectedType.value
    const matchedStart = !dateRange.value.start || row.dateKey >= dateRange.value.start
    const matchedEnd = !dateRange.value.end || row.dateKey <= dateRange.value.end
    return matchedTab && matchedType && matchedStart && matchedEnd
  })
})

const pageCount = computed(() => Math.max(1, Math.ceil(filteredRecords.value.length / pageSize)))

const pagedRecords = computed(() => {
  const start = (page.value - 1) * pageSize
  return filteredRecords.value.slice(start, start + pageSize)
})

watch(activeTab, () => {
  selectedType.value = 'all'
  page.value = 1
})

watch(
  () => props.visible,
  (val) => {
    if (!val) return
    activeTab.value = props.initialTab
    selectedType.value = 'all'
    page.value = 1
  }
)
</script>

<style scoped>
.prm-overlay {
  position: fixed;
  inset: 0;
  z-index: 55;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--pos-overlay-backdrop);
}

.prm-dialog {
  width: min(100%, 1260px);
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 18px;
  background: #dff0ff;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.24);
}

.prm-header {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 22px 0 18px;
  background: #fff;
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
}

.prm-header-title {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.prm-header-avatar {
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

.prm-header h2 {
  margin: 0;
  color: #111827;
  font-size: 16px;
  font-weight: 700;
}

.prm-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.prm-close-btn {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  font-size: 24px;
  line-height: 1;
}

.prm-refresh-btn {
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

.prm-refresh-btn:hover {
  color: #3b82f6;
}

.prm-body {
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px 20px 20px;
}

.prm-filter-card,
.prm-table-card {
  border-radius: 18px;
  background: #fff;
}

.prm-filter-card {
  padding: 12px 18px 14px;
}

.prm-tabs {
  display: flex;
  align-items: center;
  gap: 32px;
  padding-bottom: 12px;
  border-bottom: 1px solid #edf2f7;
}

.prm-tab {
  position: relative;
  border: 0;
  background: transparent;
  color: #3c4658;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 0 0 8px;
}

.prm-tab.active {
  color: #3b82f6;
}

.prm-tab.active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  border-radius: 999px;
  background: #3b82f6;
}

.prm-filters {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 14px;
  flex-wrap: nowrap;
}

.prm-coins-summary {
  display: flex;
  align-items: center;
  gap: 0;
  padding-top: 18px;
}

.prm-coins-item {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 0 34px;
  color: #111827;
  font-size: 14px;
  font-weight: 600;
}

.prm-coins-item:first-child {
  padding-left: 4px;
}

.prm-coins-item + .prm-coins-item {
  border-left: 1px solid #d7dfeb;
}

.prm-coins-item strong {
  font-size: 16px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.prm-filter-group {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  white-space: nowrap;
}

.prm-filter-group label {
  color: #111827;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.prm-filter-group span {
  color: #111827;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.prm-filter-group span strong {
  font-size: 15px;
  font-weight: 800;
}

.prm-filter-divider {
  width: 1px;
  height: 24px;
  background: #d7dfeb;
  flex-shrink: 0;
}

.prm-date-range {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 36px;
  padding: 0 10px;
  border: 1px solid #8bc0ff;
  border-radius: 8px;
  background: #fff;
}

.prm-date-range span {
  color: #94a3b8;
  font-size: 13px;
  flex-shrink: 0;
}

.prm-date-input,
.prm-select {
  height: 34px;
  border: 0;
  background: transparent;
  color: #64748b;
  font-size: 13px;
  outline: none;
}

.prm-date-input {
  width: 134px;
  flex-shrink: 0;
}

.prm-select {
  min-width: 140px;
  padding: 0 28px 0 12px;
  border: 1px solid #dbe6f3;
  border-radius: 8px;
  background: #fff;
}

.prm-query-btn {
  height: 34px;
  padding: 0 14px;
  border: 0;
  border-radius: 8px;
  background: linear-gradient(135deg, #3b9cff 0%, #245cff 100%);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}

.prm-table-card {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.prm-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.prm-table thead th {
  padding: 18px 18px;
  text-align: left;
  color: #111827;
  font-size: 14px;
  font-weight: 700;
  border-bottom: 1px solid #edf2f7;
  background: #fff;
}

.prm-table tbody td {
  padding: 18px 18px;
  color: #1f2937;
  font-size: 14px;
  font-weight: 500;
  border-bottom: 1px solid #edf2f7;
  vertical-align: top;
}

.prm-table tbody tr:last-child td {
  border-bottom: 0;
}

.prm-row-game td {
  vertical-align: middle;
  font-size: 12px;
}

.prm-row-game td:nth-child(4) {
  white-space: nowrap;
}

.prm-table th:nth-child(1),
.prm-table td:nth-child(1) {
  width: 14%;
}

.prm-table th:nth-child(2),
.prm-table td:nth-child(2) {
  width: 12%;
}

.prm-table th:nth-child(3),
.prm-table td:nth-child(3) {
  width: 14%;
}

.prm-table th:nth-child(4),
.prm-table td:nth-child(4) {
  width: 14%;
}

.prm-table th:nth-child(5),
.prm-table td:nth-child(5) {
  width: 20%;
}

.prm-table th:nth-child(6),
.prm-table td:nth-child(6) {
  width: 12%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.prm-table th:nth-child(7),
.prm-table td:nth-child(7) {
  width: 14%;
}

.prm-table-game th:nth-child(1),
.prm-table-game td:nth-child(1) {
  width: 32%;
}

.prm-table-game th:nth-child(2),
.prm-table-game td:nth-child(2) {
  width: 30%;
}

.prm-table-game th:nth-child(3),
.prm-table-game td:nth-child(3) {
  width: 18%;
}

.prm-table-game th:nth-child(4),
.prm-table-game td:nth-child(4) {
  width: 20%;
}

.prm-table-coins {
  min-width: 1200px;
}

.prm-table-coins thead th {
  padding: 14px 12px;
}

.prm-table-coins tbody td {
  padding: 13px 12px;
}

/* ---- 游戏币记录：9 列专属宽度 ---- */
.prm-table-coins th:nth-child(1),
.prm-table-coins td:nth-child(1) {
  width: 10%;
}

.prm-table-coins th:nth-child(2),
.prm-table-coins td:nth-child(2) {
  width: 14%;
}

.prm-table-coins th:nth-child(3),
.prm-table-coins td:nth-child(3) {
  width: 7%;
}

.prm-table-coins th:nth-child(4),
.prm-table-coins td:nth-child(4) {
  width: 9%;
}

.prm-table-coins th:nth-child(5),
.prm-table-coins td:nth-child(5) {
  width: 8%;
}

.prm-table-coins th:nth-child(6),
.prm-table-coins td:nth-child(6) {
  width: 10%;
}

.prm-table-coins th:nth-child(7),
.prm-table-coins td:nth-child(7) {
  width: 10%;
}

.prm-table-coins th:nth-child(8),
.prm-table-coins td:nth-child(8) {
  width: 11%;
}

.prm-table-coins th:nth-child(9),
.prm-table-coins td:nth-child(9) {
  width: 21%;
}

/* ---- 套票记录：9 列专属宽度 ---- */
.prm-table-tickets {
  min-width: 1100px;
}

.prm-table-tickets thead th {
  padding: 14px 12px;
}

.prm-table-tickets tbody td {
  padding: 13px 12px;
}

.prm-table-tickets th:nth-child(1),
.prm-table-tickets td:nth-child(1) {
  width: 10%;
}

.prm-table-tickets th:nth-child(2),
.prm-table-tickets td:nth-child(2) {
  width: 11%;
}

.prm-table-tickets th:nth-child(3),
.prm-table-tickets td:nth-child(3) {
  width: 18%;
}

.prm-table-tickets th:nth-child(4),
.prm-table-tickets td:nth-child(4) {
  width: 8%;
}

.prm-table-tickets th:nth-child(5),
.prm-table-tickets td:nth-child(5) {
  width: 10%;
}

.prm-table-tickets th:nth-child(6),
.prm-table-tickets td:nth-child(6) {
  width: 9%;
}

.prm-table-tickets th:nth-child(7),
.prm-table-tickets td:nth-child(7) {
  width: 9%;
}

.prm-table-tickets th:nth-child(8),
.prm-table-tickets td:nth-child(8) {
  width: 9%;
}

.prm-table-tickets th:nth-child(9),
.prm-table-tickets td:nth-child(9) {
  width: 16%;
}

.prm-amount {
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.prm-amount.income {
  color: #0f172a;
}

.prm-amount.expense {
  color: #0f172a;
}

.prm-note-cell {
  color: #475569;
  line-height: 1.5;
}

.prm-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 0 28px;
  border-top: 1px solid #edf2f7;
}

.prm-page-btn {
  width: 34px;
  height: 32px;
  border: 1px solid #d7dfeb;
  border-radius: 4px;
  background: #fff;
  color: #64748b;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.18s ease;
}

.prm-page-btn.active {
  border-color: #60a5fa;
  background: #60a5fa;
  color: #fff;
}

.prm-page-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.prm-fade-enter-active,
.prm-fade-leave-active {
  transition: opacity 0.2s ease;
}

.prm-fade-enter-from,
.prm-fade-leave-to {
  opacity: 0;
}

@media (max-width: 960px) {
  .prm-body {
    padding: 14px;
  }

  .prm-filters {
    gap: 12px;
  }

  .prm-filter-group {
    width: 100%;
    flex-wrap: wrap;
  }

  .prm-date-range,
  .prm-select {
    width: 100%;
  }

  .prm-table-card {
    overflow: auto;
  }

  .prm-table {
    min-width: 900px;
  }
}
</style>
