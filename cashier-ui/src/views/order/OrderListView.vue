<template>
  <section class="order-record-page" aria-label="订单记录">
    <header class="ors-page-header">
      <div class="ors-page-copy">
        <strong>订单记录</strong>
        <span>按订单类型、会员和状态快速检索交易记录</span>
      </div>
      <div class="ors-header-actions">
        <button type="button" class="ors-header-btn" aria-label="刷新订单列表" @click="handleRefresh">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21.5 2v6h-6" />
            <path d="M2.5 22v-6h6" />
            <path d="M2 11.5a10 10 0 0 1 18.8-4.3" />
            <path d="M22 12.5a10 10 0 0 1-18.8 4.2" />
          </svg>
          <span>刷新</span>
        </button>
      </div>
    </header>

    <div class="ors-body">
      <section class="ors-filter-panel">
        <nav class="ors-tabs" aria-label="订单分类">
          <button
            v-for="tab in orderTabs"
            :key="tab.path"
            type="button"
            class="ors-tab"
            :class="{ active: tab.path === activeTab.path }"
            @click="switchTab(tab.path)"
          >
            {{ tab.label }}
          </button>
        </nav>

        <div class="ors-filter-grid">
          <label class="ors-field ors-field--date">
            <span>日期范围：</span>
            <el-date-picker
              v-model="filters.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </label>

          <label class="ors-field">
            <span>订单号：</span>
            <el-input v-model="filters.orderNo" placeholder="订单号" clearable />
          </label>

          <label class="ors-field">
            <span>会员：</span>
            <el-input v-model="filters.memberKeyword" placeholder="手机号/姓名/会员卡号" clearable />
          </label>

          <label class="ors-field">
            <span>订单来源：</span>
            <el-select v-model="filters.source" placeholder="全部" clearable>
              <el-option v-for="item in sourceOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </label>

          <label class="ors-field">
            <span>订单状态：</span>
            <el-select v-model="filters.status" placeholder="全部" clearable>
              <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </label>

          <button type="button" class="ors-search-btn" @click="currentPage = 1">查询</button>
        </div>
      </section>

      <section class="ors-table-panel">
        <div class="ors-table-scroll">
          <div class="ors-table-inner">
            <div class="ors-table-head">
              <span>订单号</span>
              <span>交易时间</span>
              <span>商品</span>
              <span>应付总额</span>
              <span>优惠金额</span>
              <span>实收总额</span>
              <span>支付内容</span>
              <span>订单状态</span>
              <span>会员/散客</span>
              <span>操作</span>
            </div>

            <div class="ors-table-body">
              <article v-for="row in pagedOrders" :key="row.id" class="ors-row">
                <div class="ors-cell ors-cell--order">
                  <span>{{ row.orderNo }}</span>
                  <button type="button" class="ors-copy-btn" aria-label="复制订单号" @click="copyOrderNo(row.orderNo)">
                    <el-icon><CopyDocument /></el-icon>
                  </button>
                </div>
                <div class="ors-cell">{{ row.tradeTime }}</div>
                <div class="ors-cell">{{ row.product }}</div>
                <div class="ors-cell ors-cell--money">{{ row.totalAmount.toFixed(2) }}</div>
                <div class="ors-cell ors-cell--money">{{ row.discountAmount.toFixed(2) }}</div>
                <div class="ors-cell ors-cell--money">{{ row.paidAmount.toFixed(2) }}</div>
                <div class="ors-cell ors-cell--payment">{{ row.paymentContent }}</div>
                <div class="ors-cell">
                  <span class="ors-status-tag" :class="`ors-status-tag--${row.statusTone}`">{{ row.status }}</span>
                </div>
                <div class="ors-cell">{{ row.member }}</div>
                <div class="ors-cell">
                  <button type="button" class="ors-detail-btn" @click="viewDetail(row)">详情</button>
                </div>
              </article>
            </div>
          </div>

          <div v-if="pagedOrders.length === 0" class="ors-empty">
            <span class="ors-empty-title">暂无订单记录</span>
            <span class="ors-empty-hint">调整筛选条件后再试试看</span>
          </div>
        </div>

        <div class="ors-pagination">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="filteredOrders.length"
            layout="prev, pager, next"
          />
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CopyDocument } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const orderTabs = [
  { path: '/order', label: '收银订单' },
  { path: '/order/vod', label: '点播系统订单' },
  { path: '/order/manual', label: '手动扣费订单' },
  { path: '/order/recharge-edit', label: '修改储值订单' },
  { path: '/order/coin-exchange', label: '积分兑换订单' },
  { path: '/order/gift', label: '活动赠送订单' }
]

const orderDataMap = {
  '/order': [
    {
      id: 1,
      orderNo: '3433454655768775678678678567856',
      tradeTime: '2025-01-11 11:34',
      product: '机器名称',
      totalAmount: 80,
      discountAmount: 0,
      paidAmount: 80,
      paymentContent: '预存款:40.00元\n微信支付:40.00元',
      status: '完成',
      statusTone: 'done',
      member: '散客（未知）',
      source: '收银系统'
    },
    {
      id: 2,
      orderNo: '3433454655768775678678678567857',
      tradeTime: '2025-01-11 11:34',
      product: '充1000送1000（一年有效）',
      totalAmount: 1000,
      discountAmount: 0,
      paidAmount: 1000,
      paymentContent: '线下微信:1000.00元',
      status: '完成',
      statusTone: 'done',
      member: '13945223451',
      source: '收银系统'
    },
    {
      id: 3,
      orderNo: '3433454655768775678678678567858',
      tradeTime: '2025-01-11 11:20',
      product: 'VR体验 30分钟',
      totalAmount: 68,
      discountAmount: 8,
      paidAmount: 60,
      paymentContent: '会员券:8.00元\n支付宝:60.00元',
      status: '已退款',
      statusTone: 'refund',
      member: '李明（13900001234）',
      source: '小程序'
    }
  ],
  '/order/vod': [
    {
      id: 4,
      orderNo: 'VOD202501110001',
      tradeTime: '2025-01-11 13:06',
      product: '星际穿越 VR 双人',
      totalAmount: 128,
      discountAmount: 20,
      paidAmount: 108,
      paymentContent: '微信支付:108.00元',
      status: '完成',
      statusTone: 'done',
      member: '王芳（13800005566）',
      source: '点播系统'
    },
    {
      id: 5,
      orderNo: 'VOD202501110002',
      tradeTime: '2025-01-11 12:48',
      product: '深海大冒险 45分钟',
      totalAmount: 88,
      discountAmount: 0,
      paidAmount: 88,
      paymentContent: '抖音团购:88.00元',
      status: '完成',
      statusTone: 'done',
      member: '散客（未知）',
      source: '抖音'
    }
  ],
  '/order/manual': [
    {
      id: 6,
      orderNo: 'MAN202501110001',
      tradeTime: '2025-01-11 10:18',
      product: '会员扣费 VR体验',
      totalAmount: 68,
      discountAmount: 0,
      paidAmount: 68,
      paymentContent: '预存款:68.00元',
      status: '完成',
      statusTone: 'done',
      member: '李明（13900001234）',
      source: '收银系统'
    },
    {
      id: 7,
      orderNo: 'MAN202501110002',
      tradeTime: '2025-01-11 09:42',
      product: '游戏币 10枚',
      totalAmount: 10,
      discountAmount: 0,
      paidAmount: 10,
      paymentContent: '余额:10.00元',
      status: '待支付',
      statusTone: 'pending',
      member: '王芳（13800005566）',
      source: '收银系统'
    }
  ],
  '/order/recharge-edit': [
    {
      id: 8,
      orderNo: 'REC202501110001',
      tradeTime: '2025-01-11 11:02',
      product: '储值修改单 500→800',
      totalAmount: 800,
      discountAmount: 0,
      paidAmount: 800,
      paymentContent: '线下微信:800.00元',
      status: '完成',
      statusTone: 'done',
      member: '李明（13900001234）',
      source: '收银系统'
    }
  ],
  '/order/coin-exchange': [
    {
      id: 9,
      orderNo: 'COIN202501110001',
      tradeTime: '2025-01-11 16:11',
      product: '积分兑换 游戏币x50',
      totalAmount: 45,
      discountAmount: 5,
      paidAmount: 40,
      paymentContent: '积分抵扣:5.00元\n微信支付:40.00元',
      status: '完成',
      statusTone: 'done',
      member: '陈小雨（13712341234）',
      source: '小程序'
    }
  ],
  '/order/gift': [
    {
      id: 10,
      orderNo: 'GIFT202501110001',
      tradeTime: '2025-01-11 18:30',
      product: '活动赠送 生日礼券',
      totalAmount: 0,
      discountAmount: 0,
      paidAmount: 0,
      paymentContent: '系统发放',
      status: '完成',
      statusTone: 'done',
      member: '赵琪（13611112222）',
      source: '收银系统'
    }
  ]
}

const sourceOptions = ['收银系统', '小程序', '点播系统', '抖音']
const statusOptions = ['完成', '已退款', '待支付']

const pageSize = 8
const currentPage = ref(1)
const filters = reactive({
  dateRange: [],
  orderNo: '',
  memberKeyword: '',
  source: '',
  status: ''
})

const activeTab = computed(() => orderTabs.find(tab => tab.path === route.path) ?? orderTabs[0])
const activeOrders = computed(() => orderDataMap[activeTab.value.path] ?? [])

const filteredOrders = computed(() => {
  const keyword = filters.orderNo.trim().toLowerCase()
  const memberKeyword = filters.memberKeyword.trim().toLowerCase()

  return activeOrders.value.filter(order => {
    if (keyword && !order.orderNo.toLowerCase().includes(keyword)) return false
    if (memberKeyword && !order.member.toLowerCase().includes(memberKeyword)) return false
    if (filters.source && order.source !== filters.source) return false
    if (filters.status && order.status !== filters.status) return false
    return true
  })
})

const pagedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredOrders.value.slice(start, start + pageSize)
})

watch(
  () => route.path,
  () => {
    currentPage.value = 1
  }
)

const switchTab = (path) => {
  if (path === route.path) return
  router.push(path)
}

const handleRefresh = () => {
  filters.dateRange = []
  filters.orderNo = ''
  filters.memberKeyword = ''
  filters.source = ''
  filters.status = ''
  currentPage.value = 1
}

const copyOrderNo = async (orderNo) => {
  try {
    await navigator.clipboard.writeText(orderNo)
  } catch (error) {
    console.warn('复制订单号失败', error)
  }
}

const viewDetail = (row) => {
  console.log('查看订单详情:', row)
}
</script>

<style scoped>
.order-record-page {
  min-height: calc(100vh - 86px);
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 14px 16px 18px;
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0) 34%),
    linear-gradient(180deg, #d7ebff 0%, #e9f4ff 100%);
}

.ors-page-header {
  min-height: 78px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 14px 36px rgba(72, 112, 170, 0.08);
}

.ors-page-copy {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ors-page-header strong {
  font-size: 20px;
  font-weight: 800;
  color: #111827;
  letter-spacing: 0.3px;
}

.ors-page-copy span {
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
}

.ors-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ors-header-btn {
  min-width: 92px;
  height: 44px;
  padding: 0 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid rgba(147, 197, 253, 0.7);
  border-radius: 12px;
  background: linear-gradient(180deg, #ffffff 0%, #f5faff 100%);
  color: #2563eb;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.18s ease, color 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.ors-header-btn:hover {
  border-color: rgba(96, 165, 250, 0.88);
  background: linear-gradient(180deg, #ffffff 0%, #edf6ff 100%);
  color: #1d4ed8;
  box-shadow: 0 10px 22px rgba(59, 130, 246, 0.14);
}

.ors-body {
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.ors-filter-panel,
.ors-table-panel {
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 14px 36px rgba(72, 112, 170, 0.08);
}

.ors-filter-panel {
  padding: 14px 28px 26px;
}

.ors-tabs {
  display: flex;
  align-items: center;
  gap: 22px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.22);
  padding: 2px 0 18px;
  overflow-x: auto;
}

.ors-tab {
  position: relative;
  min-height: 44px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #1f2937;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.ors-tab.active {
  color: #2f8fff;
}

.ors-tab.active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -18px;
  height: 4px;
  border-radius: 999px;
  background: linear-gradient(90deg, #3fa0ff 0%, #2f80ff 100%);
}

.ors-filter-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(240px, 1fr));
  gap: 18px 28px;
  padding-top: 20px;
  align-items: end;
}

.ors-field {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.ors-field > span {
  flex-shrink: 0;
  color: #1f2937;
  font-size: 16px;
  font-weight: 700;
}

.ors-field :deep(.el-input),
.ors-field :deep(.el-select),
.ors-field :deep(.el-date-editor) {
  width: 100%;
}

.ors-field :deep(.el-input__wrapper),
.ors-field :deep(.el-select__wrapper),
.ors-field :deep(.el-date-editor.el-input__wrapper) {
  min-height: 44px;
  border-radius: 12px;
  box-shadow: 0 0 0 1px rgba(209, 219, 230, 0.95) inset;
  padding: 0 16px;
}

.ors-field :deep(.el-input__wrapper:hover),
.ors-field :deep(.el-select__wrapper:hover),
.ors-field :deep(.el-date-editor.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(96, 165, 250, 0.88) inset;
}

.ors-field :deep(.is-focus),
.ors-field :deep(.el-input__wrapper.is-focus),
.ors-field :deep(.el-select__wrapper.is-focused),
.ors-field :deep(.el-date-editor.is-active) {
  box-shadow: 0 0 0 1px #4ea6ed inset !important;
}

.ors-search-btn {
  width: 82px;
  height: 42px;
  align-self: center;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(90deg, #3093ff 0%, #156ef6 100%);
  color: #fff;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 10px 22px rgba(47, 122, 255, 0.18);
}

.ors-table-panel {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 10px 0 18px;
}

.ors-table-scroll {
  min-height: 0;
  flex: 1;
  overflow: auto;
  padding: 0 18px;
}

.ors-table-inner {
  min-width: 1460px;
}

.ors-table-head,
.ors-row {
  display: grid;
  grid-template-columns: minmax(380px, 2.55fr) minmax(170px, 1.2fr) minmax(180px, 1.15fr) minmax(110px, 0.8fr) minmax(110px, 0.8fr) minmax(110px, 0.8fr) minmax(220px, 1.3fr) minmax(120px, 0.8fr) minmax(170px, 1fr) minmax(84px, 0.55fr);
  gap: 18px;
  align-items: center;
  padding: 0 18px;
}

.ors-table-head {
  min-height: 64px;
  border-radius: 18px;
  margin: 0 0 2px;
  background: #f8fafc;
  color: #111827;
  font-size: 16px;
  font-weight: 800;
  position: sticky;
  top: 0;
  z-index: 1;
}

.ors-table-body {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 20px;
}

.ors-row {
  min-height: 82px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.82);
  color: #374151;
  font-size: 15px;
}

.ors-cell {
  min-width: 0;
  line-height: 1.5;
  word-break: break-word;
}

.ors-cell--order {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ors-copy-btn {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #b0b8c7;
  cursor: pointer;
  transition: background-color 0.18s ease, color 0.18s ease;
}

.ors-copy-btn:hover {
  background: #eef6ff;
  color: #3b82f6;
}

.ors-cell--money {
  font-variant-numeric: tabular-nums;
  color: #111827;
}

.ors-cell--payment {
  white-space: pre-line;
}

.ors-status-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
}

.ors-status-tag--done {
  background: #e9f7ee;
  color: #1f9d55;
}

.ors-status-tag--refund {
  background: #fff1f2;
  color: #e11d48;
}

.ors-status-tag--pending {
  background: #fff7e6;
  color: #d97706;
}

.ors-detail-btn {
  border: 0;
  background: transparent;
  color: #3b82f6;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.ors-empty {
  min-height: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #94a3b8;
}

.ors-empty-title {
  font-size: 18px;
  font-weight: 700;
  color: #64748b;
}

.ors-empty-hint {
  font-size: 13px;
  font-weight: 600;
}

.ors-pagination {
  display: flex;
  justify-content: center;
  padding-top: 18px;
}

.ors-pagination :deep(.btn-prev),
.ors-pagination :deep(.btn-next),
.ors-pagination :deep(.el-pager li) {
  min-width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #fff;
  color: #94a3b8;
  border: 1px solid #d9e1ea;
}

.ors-pagination :deep(.el-pager li.is-active) {
  background: linear-gradient(180deg, #72b6ff 0%, #529dff 100%);
  color: #fff;
  border-color: transparent;
}

.ors-pagination :deep(.btn-prev:disabled),
.ors-pagination :deep(.btn-next:disabled) {
  opacity: 0.45;
}

@media (max-width: 1440px) {
  .ors-filter-grid {
    grid-template-columns: repeat(2, minmax(280px, 1fr));
  }
}

@media (max-width: 1100px) {
  .order-record-page {
    min-height: auto;
    padding: 12px;
  }

  .ors-page-header {
    align-items: flex-start;
    gap: 16px;
    padding: 18px 20px;
  }

  .ors-filter-grid {
    grid-template-columns: 1fr;
  }

  .ors-filter-panel {
    padding: 12px 18px 20px;
  }
}

@media (max-width: 760px) {
  .ors-page-header {
    flex-direction: column;
  }

  .ors-header-actions,
  .ors-header-btn {
    width: 100%;
  }
}
</style>
