<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">游戏豆销售明细</h1>
      <div class="page-actions">
        <n-button secondary size="small">导出报表</n-button>
      </div>
    </div>

    <!-- 筛选区 -->
    <div class="filter-bar">
      <n-space :size="12" align="center">
        <n-select v-model:value="filterMerchant" placeholder="全部商家" :options="merchantOptions" size="small" style="width: 150px;" clearable />
        <n-select v-model:value="filterPayMethod" placeholder="支付方式" :options="payMethodOptions" size="small" style="width: 130px;" clearable />
        <n-date-picker v-model:value="filterDateRange" type="daterange" size="small" style="width: 260px;" clearable />
        <n-button size="small" secondary @click="handleSearch">查询</n-button>
        <n-button size="small" @click="handleReset">重置</n-button>
      </n-space>
    </div>

    <!-- 统计汇总 -->
    <div class="summary-bar">
      <span class="summary-item">共 <strong>{{ stats.totalCount }}</strong> 条记录</span>
      <n-divider vertical />
      <span class="summary-item">购买数量：<strong class="highlight">{{ stats.totalAmount.toLocaleString() }}</strong> 豆</span>
      <n-divider vertical />
      <span class="summary-item">合计金额：<strong class="highlight money">¥{{ stats.totalMoney.toLocaleString() }}</strong></span>
    </div>

    <div class="table-card">
      <n-data-table :columns="columns" :data="filteredData" :bordered="false" :single-line="false" size="small" striped :pagination="{ pageSize: 10 }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NDataTable, NButton, NSpace, NSelect, NDatePicker, NDivider, useMessage } from 'naive-ui'

const message = useMessage()

// 筛选条件
const filterMerchant = ref<number | null>(null)
const filterPayMethod = ref<string | null>(null)
const filterDateRange = ref<[number, number] | null>(null)

const merchantOptions = [
  { label: '恒然集团', value: 1 },
  { label: '幻影星空', value: 2 },
  { label: '利民街商家', value: 3 },
  { label: '党建馆集团', value: 4 },
  { label: '华东展厅', value: 5 },
]

const payMethodOptions = [
  { label: '对公转账', value: '对公转账' },
  { label: '微信支付', value: '微信支付' },
  { label: '支付宝', value: '支付宝' },
]

const columns = [
  { title: '订单号', key: 'orderNo', minWidth: 160 },
  { title: '商家', key: 'merchant', minWidth: 140 },
  { title: '店铺', key: 'store', minWidth: 140 },
  { title: '购买数量', key: 'amount', width: 100 },
  { title: '金额', key: 'money', width: 100 },
  { title: '支付方式', key: 'payMethod', width: 100 },
  { title: '时间', key: 'time', minWidth: 160 },
]

const data = [
  { orderNo: 'GB202309160001', merchant: '恒然集团', store: '恒然分部展厅', amount: 5000, money: 5000, payMethod: '对公转账', time: '2023-09-16 15:30:22', merchantId: 1 },
  { orderNo: 'GB202309150002', merchant: '幻影星空', store: '幻影星空馆 NO.8088', amount: 3000, money: 3000, payMethod: '微信支付', time: '2023-09-15 10:20:15', merchantId: 2 },
  { orderNo: 'GB202309160003', merchant: '利民街商家', store: '利民街大展厅', amount: 8000, money: 8000, payMethod: '支付宝', time: '2023-09-16 12:10:05', merchantId: 3 },
  { orderNo: 'GB202309140004', merchant: '党建馆集团', store: '党建馆', amount: 2000, money: 2000, payMethod: '对公转账', time: '2023-09-14 09:30:00', merchantId: 4 },
  { orderNo: 'GB202309160005', merchant: '华东展厅', store: '华东展厅', amount: 6000, money: 6000, payMethod: '微信支付', time: '2023-09-16 14:20:30', merchantId: 5 },
]

// 时间戳转换辅助函数
function parseTime(timeStr: string): number {
  return new Date(timeStr.replace(/-/g, '/')).getTime()
}

// 筛选后的数据
const filteredData = computed(() => {
  let result = [...data]
  if (filterMerchant.value !== null) {
    result = result.filter(item => item.merchantId === filterMerchant.value)
  }
  if (filterPayMethod.value !== null) {
    result = result.filter(item => item.payMethod === filterPayMethod.value)
  }
  if (filterDateRange.value && filterDateRange.value[0] && filterDateRange.value[1]) {
    const start = filterDateRange.value[0]
    const end = filterDateRange.value[1]
    result = result.filter(item => {
      const t = parseTime(item.time)
      // daterange 的 end 是当天 23:59:59，需要加上 86399999ms（24h - 1ms）
      return t >= start && t <= end + 86399999
    })
  }
  return result
})

// 筛选结果统计
const stats = computed(() => ({
  totalCount: filteredData.value.length,
  totalAmount: filteredData.value.reduce((sum, item) => sum + item.amount, 0),
  totalMoney: filteredData.value.reduce((sum, item) => sum + item.money, 0),
}))

function handleSearch() {
  message.success('查询完成')
}

function handleReset() {
  filterMerchant.value = null
  filterPayMethod.value = null
  filterDateRange.value = null
  message.info('已重置筛选条件')
}
</script>

<style scoped>
.page-container { padding: 20px 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-title { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.page-actions { display: flex; gap: 12px; }

.filter-bar {
  background: white;
  border-radius: 12px;
  padding: 14px 18px;
  margin-bottom: 16px;
  border: 1px solid var(--border-color);
}

.summary-bar {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px 20px;
  margin-bottom: 16px;
  font-size: 13px;
  color: var(--text-muted);
}
.summary-item { display: inline-flex; align-items: center; gap: 4px; }
.summary-item strong { font-weight: 600; color: var(--text-primary); }
.summary-item .highlight { color: #18a058; }
.summary-item .highlight.money { color: #d03050; }

.table-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid var(--border-color); }
</style>
