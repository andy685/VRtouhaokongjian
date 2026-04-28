<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>交接班记录</h1>
      <n-space>
        <n-select v-model:value="filterShop" :options="shopOptions" size="small" style="width: 160px;" clearable placeholder="选择店铺" />
        <n-select v-model:value="filterCashier" :options="cashierOptions" size="small" style="width: 140px;" clearable placeholder="选择收银员" />
        <n-date-picker type="daterange" clearable size="small" v-model:value="dateRange" />
        <n-button secondary @click="exportData">导出</n-button>
      </n-space>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card highlight">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="CashOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">营收总额</span>
          <span class="value">¥{{ kpi.totalRevenue.toLocaleString() }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="WalletOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">现金收款</span>
          <span class="value">¥{{ kpi.cashTotal.toLocaleString() }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
          <n-icon :component="PhonePortraitOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">扫码支付</span>
          <span class="value">¥{{ kpi.scanTotal.toLocaleString() }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="CardOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">预存款消费</span>
          <span class="value">¥{{ kpi.prepaidTotal.toLocaleString() }}</span>
        </div>
      </div>
    </div>

    <!-- 当班记录 -->
    <n-card class="table-card">
      <n-data-table :columns="columns" :data="filteredTableData" :pagination="pagination" striped size="small" />
    </n-card>

    <!-- 当班详情弹窗 -->
    <n-modal v-model:show="showDetailModal" preset="card" :title="`当班详情 - ${currentRecord?.cashier}`" style="width: 560px;">
      <div class="detail-section">
        <div class="detail-header">
          <n-avatar round size="small" style="background: #3B82F6;">{{ currentRecord?.cashier?.charAt(0) }}</n-avatar>
          <div class="detail-info">
            <div class="detail-cashier">{{ currentRecord?.cashier }}</div>
            <div class="detail-shop">{{ currentRecord?.shop }}</div>
          </div>
          <span class="detail-time">{{ currentRecord?.startTime }} ~ {{ currentRecord?.endTime || '进行中' }}</span>
        </div>
      </div>

      <div class="payment-grid">
        <div class="payment-item total">
          <div class="payment-label">营收总额</div>
          <div class="payment-value">¥{{ currentRecord?.totalRevenue?.toLocaleString() }}</div>
        </div>
        <div class="payment-item">
          <div class="payment-label">
            <n-icon :component="WalletOutline" size="14" color="#10B981" />
            现金
          </div>
          <div class="payment-value">¥{{ currentRecord?.cash?.toLocaleString() }}</div>
        </div>
        <div class="payment-item">
          <div class="payment-label">
            <n-icon :component="PhonePortraitOutline" size="14" color="#8B5CF6" />
            扫码支付
          </div>
          <div class="payment-value">¥{{ currentRecord?.scanPay?.toLocaleString() }}</div>
        </div>
        <div class="payment-item">
          <div class="payment-label">
            <n-icon :component="LogoWechat" size="14" color="#22c55e" />
            线下微信
          </div>
          <div class="payment-value">¥{{ currentRecord?.wechat?.toLocaleString() }}</div>
        </div>
        <div class="payment-item">
          <div class="payment-label">
            <n-icon :component="LogoAlipay" size="14" color="#3B82F6" />
            线下支付宝
          </div>
          <div class="payment-value">¥{{ currentRecord?.alipay?.toLocaleString() }}</div>
        </div>
        <div class="payment-item">
          <div class="payment-label">
            <n-icon :component="CardOutline" size="14" color="#F59E0B" />
            预存款
          </div>
          <div class="payment-value">¥{{ currentRecord?.prepaid?.toLocaleString() }}</div>
        </div>
        <div class="payment-item">
          <div class="payment-label">其他支付</div>
          <div class="payment-value">¥{{ currentRecord?.other?.toLocaleString() }}</div>
        </div>
      </div>

      <div class="detail-footer" v-if="currentRecord?.remark">
        <div class="detail-remark">
          <span class="remark-label">备注：</span>
          {{ currentRecord.remark }}
        </div>
      </div>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showDetailModal = false">关闭</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NCard, NDataTable, NButton, NSpace, NIcon, NDatePicker,
  NSelect, NTag, NModal, NAvatar
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import {
  CashOutline, WalletOutline, PhonePortraitOutline,
  CardOutline, LogoWechat, LogoAlipay
} from '@vicons/ionicons5'

const filterShop = ref<string | null>(null)
const filterCashier = ref<string | null>(null)
const dateRange = ref<[number, number] | null>(getTodayRange())
const showDetailModal = ref(false)
const currentRecord = ref<any>(null)
const pagination = { pageSize: 10 }

function getTodayRange(): [number, number] {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
  return [start.getTime(), end.getTime()]
}

const shopOptions = [
  { label: '利民街小展厅', value: '利民街小展厅' },
  { label: '卓远萝岗区店', value: '卓远萝岗区店' },
  { label: '卓远萧山区店', value: '卓远萧山区店' },
  { label: '卓远亚运城店', value: '卓远亚运城店' },
  { label: '卓远文鼎路店', value: '卓远文鼎路店' },
]

const cashierOptions = [
  { label: '幻影', value: '幻影' },
  { label: '牛人', value: '牛人' },
  { label: '牛有道', value: '牛有道' },
  { label: '张小凡', value: '张小凡' },
  { label: '李小红', value: '李小红' },
]

const columns: DataTableColumns = [
  { title: '店铺', key: 'shop', width: 140 },
  { title: '收银员', key: 'cashier', width: 100 },
  { title: '开始时间', key: 'startTime', width: 170 },
  { title: '结束时间', key: 'endTime', width: 170, render: (row: any) => row.endTime || h(NTag, { type: 'success', size: 'small' }, { default: () => '进行中' }) },
  { title: '营收总额', key: 'totalRevenue', width: 130, render: (row: any) => h('span', { style: { color: '#3B82F6', fontWeight: 600 } }, `¥${row.totalRevenue.toLocaleString()}`) },
  { title: '现金', key: 'cash', width: 110, render: (row: any) => `¥${row.cash.toLocaleString()}` },
  { title: '扫码支付', key: 'scanPay', width: 110, render: (row: any) => `¥${row.scanPay.toLocaleString()}` },
  { title: '线下微信', key: 'wechat', width: 110, render: (row: any) => `¥${row.wechat.toLocaleString()}` },
  { title: '线下支付宝', key: 'alipay', width: 120, render: (row: any) => `¥${row.alipay.toLocaleString()}` },
  { title: '预存款', key: 'prepaid', width: 110, render: (row: any) => `¥${row.prepaid.toLocaleString()}` },
  { title: '状态', key: 'status', width: 90, render: (row: any) =>
    h(NTag, { type: row.status === '已交班' ? 'default' : 'success', size: 'small' },
      { default: () => row.status })
  },
  { title: '操作', key: 'actions', width: 100, render: (row: any) =>
    h(NButton, { size: 'small', text: true, type: 'primary', onClick: () => showDetail(row) },
      { default: () => '详情' })
  }
]

const rawData = ref([
  { id: 1, shop: '卓远亚运城店', cashier: '幻影', startTime: '2026-04-20 08:00:00', endTime: '2026-04-20 16:00:00', totalRevenue: 8560, cash: 2680, scanPay: 1200, wechat: 3100, alipay: 1080, prepaid: 500, other: 0, status: '已交班', remark: '无异常' },
  { id: 2, shop: '卓远亚运城店', cashier: '牛人', startTime: '2026-04-20 16:00:00', endTime: '2026-04-20 22:00:00', totalRevenue: 6280, cash: 1860, scanPay: 800, wechat: 2200, alipay: 920, prepaid: 500, other: 0, status: '已交班', remark: '' },
  { id: 3, shop: '卓远亚运城店', cashier: '牛有道', startTime: '2026-04-20 22:00:00', endTime: null, totalRevenue: 3200, cash: 800, scanPay: 400, wechat: 1200, alipay: 500, prepaid: 300, other: 0, status: '当班中', remark: '' },
  { id: 4, shop: '卓远萝岗区店', cashier: '张小凡', startTime: '2026-04-19 08:00:00', endTime: '2026-04-19 16:00:00', totalRevenue: 11200, cash: 3560, scanPay: 1800, wechat: 3800, alipay: 1540, prepaid: 500, other: 0, status: '已交班', remark: '备用金200' },
  { id: 5, shop: '卓远萝岗区店', cashier: '李小红', startTime: '2026-04-19 16:00:00', endTime: '2026-04-19 22:00:00', totalRevenue: 7800, cash: 2400, scanPay: 1000, wechat: 2800, alipay: 1100, prepaid: 500, other: 0, status: '已交班', remark: '' },
  { id: 6, shop: '卓远萧山区店', cashier: '幻影', startTime: '2026-04-20 08:00:00', endTime: '2026-04-20 16:00:00', totalRevenue: 6200, cash: 2000, scanPay: 900, wechat: 2100, alipay: 700, prepaid: 500, other: 0, status: '已交班', remark: '' },
  { id: 7, shop: '利民街小展厅', cashier: '牛人', startTime: '2026-04-20 16:00:00', endTime: '2026-04-20 22:00:00', totalRevenue: 4500, cash: 1500, scanPay: 600, wechat: 1600, alipay: 500, prepaid: 300, other: 0, status: '已交班', remark: '' },
])

const filteredTableData = computed(() => {
  let data = rawData.value
  if (filterShop.value) {
    data = data.filter(d => d.shop === filterShop.value)
  }
  if (filterCashier.value) {
    data = data.filter(d => d.cashier === filterCashier.value)
  }
  return data
})

const kpi = computed(() => {
  const data = filteredTableData.value
  return {
    totalRevenue: data.reduce((s, d) => s + d.totalRevenue, 0),
    cashTotal: data.reduce((s, d) => s + d.cash, 0),
    scanTotal: data.reduce((s, d) => s + d.scanPay, 0),
    prepaidTotal: data.reduce((s, d) => s + d.prepaid, 0),
  }
})

function showDetail(row: any) {
  currentRecord.value = row
  showDetailModal.value = true
}

function exportData() {
  console.log('导出数据')
}
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { font-size: 20px; font-weight: 600; color: #333; margin: 0; }

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: #fff; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.stat-card.highlight { border: 1px solid #3B82F6; }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-content { display: flex; flex-direction: column; gap: 4px; }
.stat-content .label { font-size: 13px; color: #666; }
.stat-content .value { font-size: 24px; font-weight: 600; color: #333; }
.table-card { border-radius: 12px; }

/* 详情弹窗 */
.detail-section { margin-bottom: 16px; }
.detail-header { display: flex; align-items: center; gap: 10px; padding-bottom: 12px; border-bottom: 1px solid #f0f0f0; }
.detail-info { display: flex; flex-direction: column; gap: 2px; }
.detail-cashier { font-size: 15px; font-weight: 600; color: #333; }
.detail-shop { font-size: 12px; color: #999; }
.detail-time { font-size: 13px; color: #999; margin-left: auto; }

.payment-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.payment-item { background: #f8fafc; border-radius: 10px; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; }
.payment-item.total { grid-column: 1 / -1; background: linear-gradient(135deg, #eff6ff, #dbeafe); }
.payment-label { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #666; }
.payment-value { font-size: 16px; font-weight: 600; color: #333; }
.payment-item.total .payment-value { color: #2563eb; font-size: 20px; }

.detail-footer { margin-top: 16px; padding-top: 12px; border-top: 1px solid #f0f0f0; }
.detail-remark { font-size: 13px; color: #666; }
.remark-label { color: #999; }

@media (max-width: 1200px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .stats-row { grid-template-columns: 1fr; }
  .payment-grid { grid-template-columns: 1fr; }
}
</style>
