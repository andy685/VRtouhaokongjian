<template>
  <div class="page-container animate-fade-in">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>会员列表</h2>
      <n-space>
        <n-button secondary @click="handleExport">
          <template #icon><n-icon :component="DownloadOutline" /></template>
          导出
        </n-button>
        <n-button type="primary" @click="showFilterDrawer = true">
          <template #icon><n-icon :component="FilterOutline" /></template>
          筛选
        </n-button>
      </n-space>
    </div>

    <!-- 数据表格 -->
    <div class="table-wrapper">
      <n-data-table
        :columns="columns"
        :data="filteredTableData"
        :pagination="pagination"
        :row-key="(row: any) => row.id"
        striped
        size="small"
        :scroll-x="1600"
      />
    </div>

    <!-- 筛选抽屉 -->
    <n-drawer v-model:show="showFilterDrawer" width="380" placement="right" :trap-focus="false">
      <n-drawer-content title="筛选" closable>
        <n-form ref="filterFormRef" label-placement="left" :label-width="70" size="medium">
          <n-form-item label="门店">
            <n-select
              v-model:value="filterForm.storeId"
              placeholder="请选择"
              :options="storeOptions"
              clearable
            />
          </n-form-item>
          <n-form-item label="会员">
            <n-input
              v-model:value="filterForm.keyword"
              placeholder="请输入会员名/手机号"
              clearable
            >
              <template #prefix><n-icon :component="SearchOutline" /></template>
            </n-input>
          </n-form-item>
          <n-form-item label="会员等级">
            <n-select
              v-model:value="filterForm.level"
              placeholder="全部"
              :options="levelOptions"
              clearable
            />
          </n-form-item>
          <n-form-item label="会员状态">
            <n-select
              v-model:value="filterForm.status"
              placeholder="全部"
              :options="statusOptions"
              clearable
            />
          </n-form-item>
          <n-form-item label="绑定微信">
            <n-select
              v-model:value="filterForm.wechatBound"
              placeholder="全部"
              :options="wechatOptions"
              clearable
            />
          </n-form-item>
          <n-form-item label="累计消费">
            <div class="range-input">
              <n-select v-model:value="filterForm.totalSpentOp" :options="compareOptions" style="width: 70px;" />
              <n-input
                v-model:value="filterForm.totalSpentVal"
                placeholder="请输入累计消费额"
                clearable
                style="flex:1;"
              />
            </div>
          </n-form-item>
          <n-form-item label="账户余额">
            <div class="range-input">
              <n-select v-model:value="filterForm.balanceOp" :options="compareOptions" style="width: 70px;" />
              <n-input
                v-model:value="filterForm.balanceVal"
                placeholder="请输入账户余额"
                clearable
                style="flex:1;"
              />
            </div>
          </n-form-item>
          <n-form-item label="账户游戏币">
            <div class="range-input">
              <n-select v-model:value="filterForm.pointsOp" :options="compareOptions" style="width: 70px;" />
              <n-input
                v-model:value="filterForm.pointsVal"
                placeholder="请输入账户游戏币"
                clearable
                style="flex:1;"
              />
            </div>
          </n-form-item>
          <n-form-item label="预存次数">
            <div class="range-input">
              <n-select v-model:value="filterForm.prepaidTimesOp" :options="compareOptions" style="width: 70px;" />
              <n-input
                v-model:value="filterForm.prepaidTimesVal"
                placeholder="请输入预存次数"
                clearable
                style="flex:1;"
              />
            </div>
          </n-form-item>
          <n-form-item label="未消费天数">
            <n-input
              v-model:value="filterForm.inactiveDays"
              placeholder="请输入未消费天数"
              clearable
            />
          </n-form-item>
        </n-form>

        <template #footer>
          <n-button type="primary" block @click="handleSearch">搜索</n-button>
        </template>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useRouter } from 'vue-router'
import {
  NButton, NIcon, NDataTable, NTag, NDrawer, NDrawerContent,
  NForm, NFormItem, NSelect, NInput,
} from 'naive-ui'
import {
  FilterOutline, SearchOutline, DownloadOutline,
} from '@vicons/ionicons5'

const router = useRouter()

const showFilterDrawer = ref(false)

// ===== 筛选表单 =====
const filterFormRef = ref()
const filterForm = ref({
  storeId: null as string | null,
  keyword: '',
  level: null as string | null,
  status: null as string | null,
  wechatBound: null as string | null,
  totalSpentOp: '>=',
  totalSpentVal: '',
  balanceOp: '>=',
  balanceVal: '',
  pointsOp: '>=',
  pointsVal: '',
  prepaidTimesOp: '>=',
  prepaidTimesVal: '',
  inactiveDays: '',
})

// 下拉选项
const storeOptions = [
  { label: '和民轩小黑厅', value: 'store1' },
  { label: '深圳福田旗舰店', value: 'store2' },
  { label: '南山科技园店', value: 'store3' },
  { label: '宝安中心店', value: 'store4' },
]

const levelOptions = [
  { label: '普通会员', value: 'normal' },
  { label: '青铜', value: 'bronze' },
  { label: '白银', value: 'silver' },
  { label: '黄金', value: 'gold' },
]

const statusOptions = [
  { label: '正常', value: 'active' },
  { label: '禁用', value: 'disabled' },
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
    title: '姓名',
    key: 'name',
    width: 100,
    fixed: 'left' as const,
    ellipsis: { tooltip: true },
  },
  {
    title: '昵称',
    key: 'nickname',
    width: 90,
    ellipsis: { tooltip: true },
  },
  {
    title: '开卡店铺',
    key: 'storeName',
    width: 120,
    ellipsis: { tooltip: true },
  },
  {
    title: '手机',
    key: 'phone',
    width: 110,
  },
  {
    title: '预存金额',
    key: 'prepaidAmount',
    width: 100,
    render(row: any) {
      return h('span', { style: 'color:#3B82F6;' }, Number(row.prepaidAmount).toFixed(2))
    }
  },
  {
    title: '预存次数',
    key: 'prepaidTimes',
    width: 80,
    align: 'center' as const,
  },
  {
    title: '游戏币',
    key: 'points',
    width: 80,
    render(row: any) {
      return h('span', {}, Number(row.points).toFixed(2))
    }
  },
  {
    title: '累计消费金额',
    key: 'totalSpent',
    width: 120,
    render(row: any) {
      return h('span', {}, Number(row.totalSpent).toFixed(2))
    }
  },
  {
    title: '绑定微信',
    key: 'wechatBound',
    width: 85,
    align: 'center' as const,
    render(row: any) {
      if (row.wechatBound === true || row.wechatBound === '是') {
        return h(NTag, { type: 'success', size: 'small', bordered: false }, () => '是')
      }
      return h(NTag, { type: 'error', size: 'small', bordered: false }, () => '否')
    }
  },
  {
    title: '最后消费时间',
    key: 'lastConsumeTime',
    width: 130,
  },
  {
    title: '开通时间',
    key: 'openTime',
    width: 150,
  },
  {
    title: '状态',
    key: 'status',
    width: 60,
    align: 'center' as const,
    render(row: any) {
      if (row.status === '正常') {
        return h(NTag, { type: 'success', size: 'small', bordered: false }, () => '正')
      }
      return h(NTag, { type: 'default', size: 'small', bordered: false }, () => row.status)
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    fixed: 'right' as const,
    render(row: any) {
      return h('div', { style: 'display:flex;gap:4px;' }, [
        h(NButton, { size: 'tiny', quaternary: true, type: 'info', onClick: () => handleSetDiscount(row) }, () => '设置会员折扣'),
        h(NButton, { size: 'tiny', quaternary: true, type: 'info', onClick: () => handleEditMember(row) }, () => '编辑会员信息'),
      ])
    }
  },
]

// 示例数据
const tableData = ref([
  {
    id: 1,
    name: '烂漫的痕迹重',
    nickname: '普通会员',
    storeName: '和民轩小黑厅',
    phone: '13801231234',
    prepaidAmount: 0.00,
    prepaidTimes: 0,
    points: 0.00,
    totalSpent: 0.00,
    wechatBound: false,
    lastConsumeTime: '',
    openTime: '2023-08-14 20:39',
    status: '正常',
  },
  {
    id: 2,
    name: '无脚的空战勋章',
    nickname: '普通会员',
    storeName: '和民轩小黑厅',
    phone: '13905675678',
    prepaidAmount: 0.00,
    prepaidTimes: 0,
    points: 0.00,
    totalSpent: 1280.00,
    wechatBound: false,
    lastConsumeTime: '2026-04-20 15:30',
    openTime: '2023-08-13 17:11',
    status: '正常',
  },
  {
    id: 3,
    name: '连你的长城都逃',
    nickname: '普通会员',
    storeName: '和民轩小黑厅',
    phone: '13709019012',
    prepaidAmount: 0.00,
    prepaidTimes: 0,
    points: 0.00,
    totalSpent: 560.00,
    wechatBound: false,
    lastConsumeTime: '2026-04-18 14:22',
    openTime: '2023-08-12 11:43',
    status: '正常',
  },
  {
    id: 4,
    name: '寂寞的雪山飞车',
    nickname: '普通会员',
    storeName: '和民轩小黑厅',
    phone: '13603453456',
    prepaidAmount: 0.00,
    prepaidTimes: 0,
    points: 0.00,
    totalSpent: 3200.00,
    wechatBound: true,
    lastConsumeTime: '2026-04-21 10:05',
    openTime: '2023-05-11 11:16',
    status: '正常',
  },
  {
    id: 5,
    name: '张浩理',
    nickname: '普通会员',
    storeName: '和民轩小黑厅',
    phone: '13507897890',
    prepaidAmount: 20000.00,
    prepaidTimes: 0,
    points: 0.00,
    totalSpent: 8800.00,
    wechatBound: false,
    lastConsumeTime: '2026-04-19 16:40',
    openTime: '2023-08-09 14:10',
    status: '正常',
  },
  {
    id: 6,
    name: '阮颖慧',
    nickname: '普通会员',
    storeName: '和民轩小黑厅',
    phone: '15801121122',
    prepaidAmount: 20000.00,
    prepaidTimes: 0,
    points: 0.00,
    totalSpent: 6500.00,
    wechatBound: false,
    lastConsumeTime: '2026-03-28 11:18',
    openTime: '2023-08-09 14:09',
    status: '正常',
  },
  {
    id: 7,
    name: '阳恩',
    nickname: '黄金',
    storeName: '和民轩小黑厅',
    phone: '15903343344',
    prepaidAmount: 20000.00,
    prepaidTimes: 0,
    points: 1000.00,
    totalSpent: 15680.00,
    wechatBound: false,
    lastConsumeTime: '2026-04-20 09:33',
    openTime: '2023-05-09 14:06',
    status: '正常',
  },
  {
    id: 8,
    name: '认真的海底两万里',
    nickname: '普通会员',
    storeName: '和民轩小黑厅',
    phone: '18605565566',
    prepaidAmount: 0.00,
    prepaidTimes: 0,
    points: 0.00,
    totalSpent: 420.00,
    wechatBound: true,
    lastConsumeTime: '2026-01-15 20:10',
    openTime: '2023-05-07 18:05',
    status: '正常',
  },
  {
    id: 9,
    name: '潇潇默潇',
    nickname: '普通会员',
    storeName: '和民轩小黑厅',
    phone: '18807787788',
    prepaidAmount: 0.00,
    prepaidTimes: 0,
    points: 0.00,
    totalSpent: 1890.00,
    wechatBound: true,
    lastConsumeTime: '2026-02-22 13:55',
    openTime: '2023-05-07 12:09',
    status: '正常',
  },
  {
    id: 10,
    name: 'syfrdhgo',
    nickname: '普通会员',
    storeName: '和民轩小黑厅',
    phone: '17709909900',
    prepaidAmount: 0.00,
    prepaidTimes: 0,
    points: 0.00,
    totalSpent: 750.00,
    wechatBound: true,
    lastConsumeTime: '2026-04-10 17:42',
    openTime: '2023-05-07 11:30',
    status: '正常',
  },
  {
    id: 11,
    name: '现代的这地跳脱',
    nickname: '普通会员',
    storeName: '和民轩小黑厅',
    phone: '18302233223',
    prepaidAmount: 0.00,
    prepaidTimes: 0,
    points: 0.00,
    totalSpent: 2100.00,
    wechatBound: true,
    lastConsumeTime: '2026-03-05 15:28',
    openTime: '2023-05-07 10:43',
    status: '正常',
  },
  {
    id: 12,
    name: '小巧玲珑璐',
    nickname: '普通会员',
    storeName: '和民轩小黑厅',
    phone: '19904454455',
    prepaidAmount: 0.00,
    prepaidTimes: 0,
    points: 0.00,
    totalSpent: 0.00,
    wechatBound: false,
    lastConsumeTime: '',
    openTime: '2025-01-01 12:09',
    status: '正常',
  },
])

const pagination = { pageSize: 15 }

// 筛选后的表格数据
const filteredTableData = computed(() => {
  let data = [...tableData.value]
  const f = filterForm.value

  // 关键词筛选（姓名/昵称/手机号）
  if (f.keyword.trim()) {
    const kw = f.keyword.trim().toLowerCase()
    data = data.filter(row =>
      row.name.toLowerCase().includes(kw) ||
      row.nickname.toLowerCase().includes(kw) ||
      row.phone.includes(kw)
    )
  }

  // 会员等级筛选
  if (f.level) {
    data = data.filter(row => row.nickname.includes(
      f.level === 'normal' ? '普通会员' : f.level === 'bronze' ? '青铜' : f.level === 'silver' ? '白银' : '黄金'
    ))
  }

  // 状态筛选
  if (f.status) {
    data = data.filter(row =>
      f.status === 'active' ? row.status === '正常' : row.status !== '正常'
    )
  }

  // 绑定微信筛选
  if (f.wechatBound) {
    const bound = f.wechatBound === 'yes'
    data = data.filter(row => row.wechatBound === bound)
  }

  // 数值比较筛选
  function compare(val: number, op: string, target: string): boolean {
    if (!target) return true
    const t = parseFloat(target)
    if (isNaN(t)) return true
    switch (op) {
      case '>=': return val >= t
      case '<=': return val <= t
      case '=': return Math.abs(val - t) < 0.001
      default: return true
    }
  }

  if (f.totalSpentVal) {
    data = data.filter(row => compare(Number(row.totalSpent), f.totalSpentOp!, f.totalSpentVal!))
  }
  if (f.balanceVal) {
    data = data.filter(row => compare(Number(row.prepaidAmount), f.balanceOp!, f.balanceVal!))
  }
  if (f.pointsVal) {
    data = data.filter(row => compare(Number(row.points), f.pointsOp!, f.pointsVal!))
  }
  if (f.prepaidTimesVal) {
    data = data.filter(row => compare(Number(row.prepaidTimes), f.prepaidTimesOp!, f.prepaidTimesVal!))
  }

  return data
})

// 操作方法
function handleSearch() {
  showFilterDrawer.value = false
}

function handleExport() {
  const headers = ['姓名', '昵称', '开卡店铺', '手机', '预存金额', '预存次数', '游戏币', '累计消费金额', '绑定微信', '最后消费时间', '开通时间', '状态']
  const rows = filteredTableData.value.map(row => [
    row.name, row.nickname, row.storeName, row.phone,
    row.prepaidAmount, row.prepaidTimes, row.points, row.totalSpent,
    row.wechatBound ? '是' : '否', row.lastConsumeTime, row.openTime, row.status,
  ])
  const csvContent = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n')
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `会员列表_${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function handleSetDiscount(row: any) {
  router.push({ path: '/shop/member-discount', query: { id: String(row.id), name: row.name } })
}

function handleEditMember(row: any) {
  router.push({ path: '/shop/member-edit', query: { id: String(row.id), name: row.name } })
}
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.table-wrapper {
  background: white;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.range-input {
  display: flex;
  gap: 6px;
  align-items: center;
  width: 100%;
}
</style>
