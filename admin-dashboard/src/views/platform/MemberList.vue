<template>
  <div class="page-container animate-fade-in">
    <!-- 页面标题 -->
    <div class="page-header">
      <div>
        <h1>会员列表</h1>
        <p class="header-desc">全平台会员数据，跨商家统一查看</p>
      </div>
      <n-space>
        <n-button secondary size="small" @click="handleExport">
          <template #icon><n-icon :component="DownloadOutline" /></template> 导出
        </n-button>
        <n-button size="small" secondary @click="showFilterDrawer = true">
          <template #icon><n-icon :component="FilterOutline" /></template> 筛选
        </n-button>
      </n-space>
    </div>

    <!-- 筛选区（快捷筛选） -->
    <div class="filter-bar">
      <n-space :size="12" align="center">
        <n-select v-model:value="filterMerchant" placeholder="全部商家" :options="merchantOptions" size="small" style="width: 150px;" clearable />
        <n-select v-model:value="filterStatus" placeholder="会员状态" :options="statusOptions" size="small" style="width: 130px;" clearable />
        <n-input v-model:value="filterKeyword" placeholder="姓名 / 手机号" size="small" style="width: 180px;" clearable>
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
        <n-date-picker v-model:value="filterDateRange" type="daterange" size="small" style="width: 260px;" clearable />
        <n-button size="small" type="primary" @click="handleSearch">查询</n-button>
        <n-button size="small" @click="handleReset">重置</n-button>
      </n-space>
    </div>

    <!-- 统计汇总 -->
    <div class="summary-bar">
      <span class="summary-item">共 <strong>{{ stats.totalCount }}</strong> 名会员</span>
      <n-divider vertical />
      <span class="summary-item">累计储值：<strong class="highlight">{{ stats.totalDeposit.toLocaleString() }}</strong></span>
      <n-divider vertical />
      <span class="summary-item">累计游戏币：<strong class="highlight coin">{{ stats.totalCoins.toLocaleString() }}</strong></span>
      <n-divider vertical />
      <span class="summary-item">累计消费：<strong class="highlight money">{{ stats.totalSpent.toLocaleString() }}</strong></span>
      <n-divider vertical />
      <span class="summary-item">活跃：<strong class="highlight active">{{ stats.activeCount }}</strong></span>
      <n-divider vertical />
      <span class="summary-item">流失：<strong class="highlight churned">{{ stats.churnedCount }}</strong></span>
    </div>

    <!-- 数据表格 -->
    <div class="table-card">
      <n-data-table
        :columns="columns"
        :data="filteredData"
        :pagination="{ pageSize: 10 }"
        striped
        size="small"
        :scroll-x="1500"
      />
    </div>

    <!-- 筛选抽屉 -->
    <n-drawer v-model:show="showFilterDrawer" width="380" placement="right" :trap-focus="false">
      <n-drawer-content title="高级筛选" closable>
        <n-form label-placement="left" :label-width="80" size="medium">
          <n-form-item label="所属商家">
            <n-select v-model:value="drawerFilter.merchant" placeholder="全部商家" :options="merchantOptions" clearable />
          </n-form-item>
          <n-form-item label="所属店铺">
            <n-select v-model:value="drawerFilter.store" placeholder="全部店铺" :options="storeOptions" clearable />
          </n-form-item>
          <n-form-item label="关键词">
            <n-input v-model:value="drawerFilter.keyword" placeholder="姓名 / 手机号" clearable />
          </n-form-item>
          <n-form-item label="会员状态">
            <n-select v-model:value="drawerFilter.status" placeholder="全部状态" :options="statusOptions" clearable />
          </n-form-item>
          <n-form-item label="绑定微信">
            <n-select v-model:value="drawerFilter.wechatBound" placeholder="全部" :options="wechatOptions" clearable />
          </n-form-item>
          <n-form-item label="注册时间">
            <n-date-picker v-model:value="drawerFilter.registerDateRange" type="daterange" clearable />
          </n-form-item>
          <n-form-item label="消费金额">
            <div class="range-input">
              <n-select v-model:value="drawerFilter.spentOp" :options="compareOptions" style="width: 70px;" />
              <n-input v-model:value="drawerFilter.spentVal" placeholder="金额" clearable style="flex:1;" />
            </div>
          </n-form-item>
        </n-form>
        <template #footer>
          <n-space justify="end">
            <n-button @click="handleDrawerReset">重置</n-button>
            <n-button type="primary" @click="applyDrawerFilter">搜索</n-button>
          </n-space>
        </template>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  NButton, NIcon, NDataTable, NSpace, NSelect, NInput,
  NDatePicker, NDivider, NTag, NDrawer, NDrawerContent,
  NForm, NFormItem, useMessage,
} from 'naive-ui'
import {
  FilterOutline, SearchOutline, DownloadOutline,
} from '@vicons/ionicons5'

const message = useMessage()

// ===== 快捷筛选 =====
const filterMerchant = ref<number | null>(null)
const filterStatus = ref<string | null>(null)
const filterKeyword = ref('')
const filterDateRange = ref<[number, number] | null>(null)

const merchantOptions = [
  { label: '恒然集团', value: 1 },
  { label: '幻影星空', value: 2 },
  { label: '利民街商家', value: 3 },
  { label: '党建馆集团', value: 4 },
  { label: '华东展厅', value: 5 },
]

const statusOptions = [
  { label: '活跃', value: 'active' },
  { label: '沉睡', value: 'sleeping' },
  { label: '流失', value: 'churned' },
]

// ===== 抽屉筛选 =====
const showFilterDrawer = ref(false)
const drawerFilter = ref({
  merchant: null as number | null,
  store: null as string | null,
  keyword: '',
  status: null as string | null,
  wechatBound: null as string | null,
  registerDateRange: null as [number, number] | null,
  spentOp: '>=',
  spentVal: '',
})

const storeOptions = [
  { label: '恒然分部展厅', value: '恒然分部展厅' },
  { label: '幻影星空馆 NO.8088', value: '幻影星空馆 NO.8088' },
  { label: '利民街大展厅', value: '利民街大展厅' },
  { label: '党建馆', value: '党建馆' },
  { label: '华东展厅', value: '华东展厅' },
]

const wechatOptions = [
  { label: '已绑定', value: 'yes' },
  { label: '未绑定', value: 'no' },
]

const compareOptions = [
  { label: '>=', value: '>=' },
  { label: '<=', value: '<=' },
  { label: '=', value: '=' },
]

// ===== 表格配置 =====
const columns = [
  {
    title: '会员信息',
    key: 'name',
    minWidth: 160,
    fixed: 'left' as const,
    render(row: any) {
      return h('div', { style: 'line-height:1.6;' }, [
        h('div', { style: 'font-weight:600;color:var(--text-primary);' }, row.name),
        h('div', { style: 'font-size:12px;color:var(--text-muted);' }, row.phone),
      ])
    }
  },
  {
    title: '所属商家',
    key: 'merchant',
    minWidth: 120,
  },
  {
    title: '开卡店铺',
    key: 'store',
    minWidth: 140,
  },
  {
    title: '会员等级',
    key: 'level',
    width: 90,
    render(row: any) {
      const map: Record<string, { color: string; text: string }> = {
        normal: { color: '#6B7280', text: '普通' },
        bronze: { color: '#CD7F32', text: '青铜' },
        silver: { color: '#9CA3AF', text: '白银' },
        gold: { color: '#F59E0B', text: '黄金' },
        diamond: { color: '#3B82F6', text: '钻石' },
      }
      const item = map[row.level] || map.normal
      return h(NTag, { type: 'info', size: 'small', bordered: false }, () => item.text)
    }
  },
  {
    title: '储值余额',
    key: 'deposit',
    width: 100,
    render(row: any) {
      return h('span', { style: 'color:#3B82F6;font-weight:500;' }, Number(row.deposit).toLocaleString())
    }
  },
  {
    title: '游戏币',
    key: 'coins',
    width: 90,
    render(row: any) {
      return h('span', { style: 'color:#F59E0B;font-weight:500;' }, Number(row.coins).toLocaleString())
    }
  },
  {
    title: '累计消费',
    key: 'totalSpent',
    width: 110,
    render(row: any) {
      return h('span', {}, Number(row.totalSpent).toLocaleString())
    }
  },
  {
    title: '订单数',
    key: 'orderCount',
    width: 80,
    align: 'center' as const,
  },
  {
    title: '状态',
    key: 'memberStatus',
    width: 80,
    align: 'center' as const,
    render(row: any) {
      const map: Record<string, { type: string; text: string }> = {
        active: { type: 'success', text: '活跃' },
        sleeping: { type: 'warning', text: '沉睡' },
        churned: { type: 'error', text: '流失' },
      }
      const s = map[row.memberStatus] || { type: 'default', text: row.memberStatus }
      return h(NTag, { type: s.type as any, size: 'small', bordered: false }, () => s.text)
    }
  },
  {
    title: '绑定微信',
    key: 'wechatBound',
    width: 85,
    align: 'center' as const,
    render(row: any) {
      if (row.wechatBound) {
        return h(NTag, { type: 'success', size: 'small', bordered: false }, () => '已绑定')
      }
      return h(NTag, { type: 'default', size: 'small', bordered: false }, () => '未绑定')
    }
  },
  {
    title: '最后消费',
    key: 'lastConsumeTime',
    minWidth: 140,
  },
  {
    title: '注册时间',
    key: 'registerTime',
    minWidth: 150,
  },
]

import { h } from 'vue'

// 模拟数据
const data = [
  { id: 1, name: '张浩理', phone: '138****7890', merchant: '恒然集团', store: '恒然分部展厅', level: 'gold', deposit: 20000, coins: 5000, totalSpent: 8800, orderCount: 56, memberStatus: 'active', wechatBound: true, lastConsumeTime: '2026-04-21 16:40', registerTime: '2023-08-09 14:10', merchantId: 1 },
  { id: 2, name: '阮颖慧', phone: '158****1122', merchant: '恒然集团', store: '恒然分部展厅', level: 'silver', deposit: 20000, coins: 3200, totalSpent: 6500, orderCount: 42, memberStatus: 'active', wechatBound: false, lastConsumeTime: '2026-03-28 11:18', registerTime: '2023-08-09 14:09', merchantId: 1 },
  { id: 3, name: '阳恩', phone: '159****3344', merchant: '恒然集团', store: '恒然分部展厅', level: 'gold', deposit: 20000, coins: 8800, totalSpent: 15680, orderCount: 89, memberStatus: 'active', wechatBound: false, lastConsumeTime: '2026-04-20 09:33', registerTime: '2023-05-09 14:06', merchantId: 1 },
  { id: 4, name: '李明远', phone: '136****3456', merchant: '幻影星空', store: '幻影星空馆 NO.8088', level: 'silver', deposit: 5000, coins: 6600, totalSpent: 12800, orderCount: 67, memberStatus: 'active', wechatBound: true, lastConsumeTime: '2026-04-21 10:05', registerTime: '2023-05-11 11:16', merchantId: 2 },
  { id: 5, name: '王思琪', phone: '137****9012', merchant: '幻影星空', store: '幻影星空馆 NO.8088', level: 'normal', deposit: 0, coins: 1200, totalSpent: 560, orderCount: 12, memberStatus: 'sleeping', wechatBound: false, lastConsumeTime: '2026-03-15 14:22', registerTime: '2023-08-12 11:43', merchantId: 2 },
  { id: 6, name: '陈晓峰', phone: '186****5566', merchant: '利民街商家', store: '利民街大展厅', level: 'bronze', deposit: 1000, coins: 2800, totalSpent: 3200, orderCount: 28, memberStatus: 'active', wechatBound: true, lastConsumeTime: '2026-04-19 14:20', registerTime: '2023-07-18 09:30', merchantId: 3 },
  { id: 7, name: '刘芳华', phone: '188****7788', merchant: '党建馆集团', store: '党建馆', level: 'normal', deposit: 0, coins: 300, totalSpent: 1890, orderCount: 9, memberStatus: 'churned', wechatBound: true, lastConsumeTime: '2026-01-20 13:55', registerTime: '2023-05-07 12:09', merchantId: 4 },
  { id: 8, name: '赵天宇', phone: '177****9900', merchant: '华东展厅', store: '华东展厅', level: 'diamond', deposit: 50000, coins: 15000, totalSpent: 25600, orderCount: 134, memberStatus: 'active', wechatBound: true, lastConsumeTime: '2026-04-21 17:30', registerTime: '2023-02-14 10:00', merchantId: 5 },
  { id: 9, name: '周小敏', phone: '183****2233', merchant: '利民街商家', store: '利民街大展厅', level: 'normal', deposit: 0, coins: 500, totalSpent: 420, orderCount: 5, memberStatus: 'sleeping', wechatBound: false, lastConsumeTime: '2026-03-08 15:28', registerTime: '2023-05-07 10:43', merchantId: 3 },
  { id: 10, name: '孙浩然', phone: '199****4455', merchant: '党建馆集团', store: '党建馆', level: 'bronze', deposit: 3000, coins: 4500, totalSpent: 7500, orderCount: 45, memberStatus: 'active', wechatBound: false, lastConsumeTime: '2026-04-18 09:15', registerTime: '2023-06-20 16:45', merchantId: 4 },
  { id: 11, name: '郑雨萱', phone: '135****6677', merchant: '华东展厅', store: '华东展厅', level: 'silver', deposit: 8000, coins: 7200, totalSpent: 10200, orderCount: 58, memberStatus: 'active', wechatBound: true, lastConsumeTime: '2026-04-20 11:50', registerTime: '2023-04-10 14:30', merchantId: 5 },
  { id: 12, name: '吴佳琪', phone: '158****8899', merchant: '幻影星空', store: '幻影星空馆 NO.8088', level: 'normal', deposit: 0, coins: 0, totalSpent: 0, orderCount: 0, memberStatus: 'churned', wechatBound: false, lastConsumeTime: '-', registerTime: '2025-01-01 12:09', merchantId: 2 },
]

function parseTime(timeStr: string): number {
  if (!timeStr || timeStr === '-') return 0
  return new Date(timeStr.replace(/-/g, '/')).getTime()
}

// 筛选后的数据
const filteredData = computed(() => {
  let result = [...data]
  const f = { merchant: filterMerchant.value, status: filterStatus.value, keyword: filterKeyword.value }

  // 商家
  if (f.merchant !== null) {
    result = result.filter(item => item.merchantId === f.merchant)
  }

  // 状态
  if (f.status) {
    result = result.filter(item => item.memberStatus === f.status)
  }

  // 关键词
  if (f.keyword.trim()) {
    const kw = f.keyword.trim().toLowerCase()
    result = result.filter(item =>
      item.name.toLowerCase().includes(kw) ||
      item.phone.includes(kw)
    )
  }

  // 时间范围（按注册时间）
  if (filterDateRange.value && filterDateRange.value[0] && filterDateRange.value[1]) {
    const start = filterDateRange.value[0]
    const end = filterDateRange.value[1]
    result = result.filter(item => {
      const t = parseTime(item.registerTime)
      return t >= start && t <= end + 86399999
    })
  }

  return result
})

// 统计
const stats = computed(() => {
  const d = filteredData.value
  return {
    totalCount: d.length,
    totalDeposit: d.reduce((sum, item) => sum + item.deposit, 0),
    totalCoins: d.reduce((sum, item) => sum + item.coins, 0),
    totalSpent: d.reduce((sum, item) => sum + item.totalSpent, 0),
    activeCount: d.filter(item => item.memberStatus === 'active').length,
    churnedCount: d.filter(item => item.memberStatus === 'churned').length,
  }
})

// 操作方法
function handleSearch() {
  message.success('查询完成')
}

function handleReset() {
  filterMerchant.value = null
  filterStatus.value = null
  filterKeyword.value = ''
  filterDateRange.value = null
}

function handleExport() {
  const headers = ['姓名', '手机', '商家', '店铺', '等级', '储值余额', '游戏币', '累计消费', '订单数', '状态', '绑定微信', '最后消费', '注册时间']
  const rows = filteredData.value.map(r => [
    r.name, r.phone, r.merchant, r.store, r.level, r.deposit, r.coins, r.totalSpent, r.orderCount, r.memberStatus, r.wechatBound ? '是' : '否', r.lastConsumeTime, r.registerTime,
  ])
  const csvContent = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n')
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `平台会员列表_${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  message.success('导出成功')
}

function applyDrawerFilter() {
  // 将抽屉筛选项同步到快捷筛选
  if (drawerFilter.value.merchant !== null) filterMerchant.value = drawerFilter.value.merchant
  if (drawerFilter.value.status !== null) filterStatus.value = drawerFilter.value.status
  if (drawerFilter.value.keyword) filterKeyword.value = drawerFilter.value.keyword
  showFilterDrawer.value = false
  message.success('筛选条件已应用')
}

function handleDrawerReset() {
  drawerFilter.value = {
    merchant: null, store: null, keyword: '', status: null,
    wechatBound: null, registerDateRange: null, spentOp: '>=', spentVal: '',
  }
}
</script>

<style scoped>
.page-container { padding: 20px 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.header-desc { font-size: 13px; color: var(--text-muted); margin-top: 4px; }

.filter-bar {
  background: white;
  border-radius: 12px;
  padding: 14px 18px;
  margin-bottom: 12px;
  border: 1px solid var(--border-color);
}

.summary-bar {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border-radius: 8px;
  padding: 10px 18px;
  margin-bottom: 16px;
  font-size: 13px;
  color: var(--text-muted);
  flex-wrap: wrap;
  gap: 4px;
}
.summary-item { display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }
.summary-item strong { font-weight: 600; color: var(--text-primary); }
.summary-item .highlight { color: #18a058; }
.summary-item .highlight.money { color: #d03050; }
.summary-item .highlight.coin { color: #F59E0B; }
.summary-item .highlight.active { color: #18a058; }
.summary-item .highlight.churned { color: #d03050; }

.table-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid var(--border-color); }
.range-input { display: flex; gap: 6px; align-items: center; width: 100%; }
</style>
