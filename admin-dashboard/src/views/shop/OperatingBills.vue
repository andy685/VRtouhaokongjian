<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">运营账户账单</h1>
      <div class="page-actions">
        <n-button type="primary" @click="showFilterDrawer = true">
          <template #icon><n-icon :component="FilterOutline" /></template>
          筛选
        </n-button>
        <n-button secondary @click="handleExport">
          <template #icon><n-icon :component="DownloadOutline" /></template>
          导出
        </n-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stat-cards">
      <div class="stat-card">
        <div class="stat-label">本月短信消耗（元）</div>
        <div class="stat-value expense">-{{ monthlySmsExpense }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">本月充值（元）</div>
        <div class="stat-value income">+{{ monthlyRecharge }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">当前余额（元）</div>
        <div class="stat-value">{{ currentBalance }}</div>
      </div>
    </div>

    <!-- Tab切换：全部 / 短信消耗 / 充值记录 -->
    <div class="table-card">
      <n-tabs v-model:value="activeTab" type="line" animated>
        <n-tab-pane name="all" tab="全部">
          <n-data-table
            :columns="allColumns"
            :data="filteredData"
            :bordered="false"
            :single-line="false"
            :pagination="{ pageSize: 15, showSizePicker: false }"
            size="small"
            striped
          />
        </n-tab-pane>
        <n-tab-pane name="sms" tab="短信消耗">
          <n-data-table
            :columns="smsColumns"
            :data="smsData"
            :bordered="false"
            :single-line="false"
            :pagination="{ pageSize: 15, showSizePicker: false }"
            size="small"
            striped
          />
        </n-tab-pane>
        <n-tab-pane name="recharge" tab="充值记录">
          <n-data-table
            :columns="rechargeColumns"
            :data="rechargeData"
            :bordered="false"
            :single-line="false"
            :pagination="{ pageSize: 15, showSizePicker: false }"
            size="small"
            striped
          />
        </n-tab-pane>
      </n-tabs>
    </div>

    <!-- 筛选抽屉 -->
    <n-drawer v-model:show="showFilterDrawer" width="380" placement="right" :trap-focus="false">
      <n-drawer-content title="筛选" closable>
        <n-form label-placement="left" :label-width="80" size="medium">
          <n-form-item label="账单类型">
            <n-select
              v-model:value="filterType"
              placeholder="请选择"
              :options="typeOptions"
              clearable
            />
          </n-form-item>
          <n-form-item label="日期范围">
            <n-date-picker
              v-model:value="filterDate"
              type="daterange"
              clearable
              style="width: 100%;"
            />
          </n-form-item>
        </n-form>
        <template #footer>
          <div class="drawer-footer">
            <n-button @click="resetFilter">重置</n-button>
            <n-button type="primary" @click="handleFilter">搜索</n-button>
          </div>
        </template>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { NButton, NIcon, NTabs, NTabPane, NDataTable, NDrawer, NDrawerContent, NForm, NFormItem, NSelect, NDatePicker } from 'naive-ui'
import { FilterOutline, DownloadOutline } from '@vicons/ionicons5'

const activeTab = ref('all')
const showFilterDrawer = ref(false)
const filterType = ref('')
const filterDate = ref(null)

// 统计数据
const monthlySmsExpense = ref('12.40')
const monthlyRecharge = ref('100.00')
const currentBalance = ref('0.69')

const typeOptions = [
  { value: '短信消耗', label: '短信消耗' },
  { value: '充值', label: '充值' },
]

// 全部账单数据
const allBillsData = [
  { id: 1, type: '充值', desc: '运营账户充值', amount: 100.00, before: 0.00, after: 100.00, remark: '微信支付', time: '2023-09-16 10:00:00' },
  { id: 2, type: '短信消耗', desc: '会员短信通知', amount: -0.05, before: 100.00, after: 99.95, remark: '发送1条，单价0.05元', time: '2023-09-16 10:15:22' },
  { id: 3, type: '短信消耗', desc: '营销短信群发', amount: -2.50, before: 99.95, after: 97.45, remark: '发送50条，单价0.05元', time: '2023-09-16 11:30:45' },
  { id: 4, type: '短信消耗', desc: '会员短信通知', amount: -0.10, before: 97.45, after: 97.35, remark: '发送2条，单价0.05元', time: '2023-09-16 13:22:10' },
  { id: 5, type: '短信消耗', desc: '营销短信群发', amount: -1.50, before: 97.35, after: 95.85, remark: '发送30条，单价0.05元', time: '2023-09-16 14:05:33' },
  { id: 6, type: '短信消耗', desc: '会员短信通知', amount: -0.15, before: 95.85, after: 95.70, remark: '发送3条，单价0.05元', time: '2023-09-16 15:10:08' },
  { id: 7, type: '充值', desc: '运营账户充值', amount: 50.00, before: 95.70, after: 145.70, remark: '支付宝支付', time: '2023-09-17 09:00:00' },
  { id: 8, type: '短信消耗', desc: '营销短信群发', amount: -4.00, before: 145.70, after: 141.70, remark: '发送80条，单价0.05元', time: '2023-09-17 10:20:15' },
  { id: 9, type: '短信消耗', desc: '会员短信通知', amount: -0.05, before: 141.70, after: 141.65, remark: '发送1条，单价0.05元', time: '2023-09-17 11:45:30' },
  { id: 10, type: '短信消耗', desc: '营销短信群发', amount: -3.50, before: 141.65, after: 138.15, remark: '发送70条，单价0.05元', time: '2023-09-18 14:30:00' },
]

// 短信消耗数据
const smsData = computed(() => allBillsData.filter(r => r.type === '短信消耗'))

// 充值记录数据
const rechargeData = computed(() => allBillsData.filter(r => r.type === '充值'))

// 筛选后的全部数据
const filteredData = computed(() => {
  return allBillsData.filter(r => {
    if (filterType.value && r.type !== filterType.value) return false
    return true
  })
})

// 金额渲染
function renderAmount(amount: number) {
  return h('span', {
    style: { color: amount >= 0 ? '#10B981' : '#EF4444', fontWeight: 500 }
  }, (amount >= 0 ? '+' : '') + amount.toFixed(2))
}

// 全部账单列
const allColumns = [
  { title: '账单类型', key: 'type', width: 110 },
  { title: '说明', key: 'desc', minWidth: 150 },
  {
    title: '变动金额（元）',
    key: 'amount',
    width: 130,
    render: (row: any) => renderAmount(row.amount)
  },
  { title: '变动前（元）', key: 'before', width: 110 },
  { title: '变动后（元）', key: 'after', width: 110 },
  { title: '备注', key: 'remark', minWidth: 180 },
  { title: '时间', key: 'time', minWidth: 170 },
]

// 短信消耗列
const smsColumns = [
  { title: '说明', key: 'desc', minWidth: 150 },
  {
    title: '消耗金额（元）',
    key: 'amount',
    width: 130,
    render: (row: any) => renderAmount(row.amount)
  },
  { title: '变动前（元）', key: 'before', width: 110 },
  { title: '变动后（元）', key: 'after', width: 110 },
  { title: '备注', key: 'remark', minWidth: 180 },
  { title: '时间', key: 'time', minWidth: 170 },
]

// 充值记录列
const rechargeColumns = [
  { title: '说明', key: 'desc', minWidth: 150 },
  {
    title: '充值金额（元）',
    key: 'amount',
    width: 130,
    render: (row: any) => renderAmount(row.amount)
  },
  { title: '变动前（元）', key: 'before', width: 110 },
  { title: '变动后（元）', key: 'after', width: 110 },
  { title: '支付方式', key: 'remark', minWidth: 120 },
  { title: '时间', key: 'time', minWidth: 170 },
]

function handleFilter() {
  showFilterDrawer.value = false
}

function resetFilter() {
  filterType.value = ''
  filterDate.value = null
}

function handleExport() {
  console.log('导出运营账单')
}
</script>

<style scoped>
.page-container {
  padding: 20px 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.page-actions {
  display: flex;
  gap: 12px;
}

.stat-cards {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  flex: 1;
  background: white;
  border-radius: 10px;
  padding: 20px 24px;
  border: 1px solid var(--border-color);
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-value.expense {
  color: #EF4444;
}

.stat-value.income {
  color: #10B981;
}

.table-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid var(--border-color);
}

.drawer-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
</style>
