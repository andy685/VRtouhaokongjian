<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-header-left">
        <n-button quaternary size="small" @click="goBack" style="margin-right: 12px;">
          <template #icon><n-icon :component="ArrowBackOutline" /></template>
          返回
        </n-button>
        <h1 class="page-title">{{ pageTitle }}</h1>
      </div>
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

    <div class="table-card">
      <n-data-table
        :columns="currentColumns"
        :data="tableData"
        :bordered="false"
        :single-line="false"
        :pagination="{ pageSize: 15, showSizePicker: false }"
        size="small"
        striped
      />
    </div>

    <!-- 筛选抽屉 -->
    <n-drawer v-model:show="showFilterDrawer" width="380" placement="right" :trap-focus="false">
      <n-drawer-content title="筛选" closable>
        <n-form ref="filterFormRef" label-placement="left" :label-width="70" size="medium">
          <n-form-item label="门店">
            <n-select
              v-model:value="filterStore"
              placeholder="请选择"
              :options="storeOptions"
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
          <n-form-item label="账单类型">
            <n-select
              v-model:value="filterType"
              placeholder="请选择"
              :options="currentBillTypeOptions"
              clearable
            />
          </n-form-item>
          <n-form-item label="设备">
            <n-select
              v-model:value="filterDevice"
              placeholder="请选择"
              :options="deviceOptions"
              clearable
            />
          </n-form-item>
          <n-form-item label="游戏">
            <n-input
              v-model:value="filterGame"
              placeholder="请输入游戏名"
              clearable
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
import { useRoute, useRouter } from 'vue-router'
import { NButton, NIcon, NSelect, NDatePicker, NInput, NDataTable, NDrawer, NDrawerContent, NForm, NFormItem } from 'naive-ui'
import { FilterOutline, DownloadOutline, ArrowBackOutline } from '@vicons/ionicons5'

const route = useRoute()
const router = useRouter()

// 筛选抽屉显示
const showFilterDrawer = ref(false)

// 筛选表单引用
const filterFormRef = ref<any>(null)

// 页面标题
const pageTitle = computed(() => {
  const type = route.query.type
  if (type === 'game-bean') return '游戏豆明细'
  if (type === 'operating') return '运营账户明细'
  if (type === 'basic') return '基础账户明细'
  return '账户明细'
})

// 筛选条件
const filterStore = ref('')
const filterDate = ref(null)
const filterType = ref('')
const filterDevice = ref('')
const filterGame = ref('')

// 门店选项
const storeOptions = [
  { value: '6288', label: '党建馆' },
  { value: '5764', label: '华东展厅' },
  { value: '5760', label: '恒然分部展厅' },
  { value: '5759', label: '利民街大展厅' },
  { value: '5077', label: '利民街小展厅' },
  { value: '8088', label: '幻影星空馆 NO.8088' },
]

// 账单类型选项
const billTypeOptions = [
  { value: '转入', label: '转入' },
  { value: '转出', label: '转出' },
  { value: '平台赠送', label: '平台赠送' },
  { value: '游戏消耗', label: '游戏消耗' },
  { value: '商户充值', label: '商户充值' },
  { value: '系统调整', label: '系统调整' },
  { value: '活动奖励', label: '活动奖励' },
]

// 设备选项
const deviceOptions = [
  { value: '设备1', label: '设备1' },
  { value: '设备2', label: '设备2' },
  { value: '设备3', label: '设备3' },
]

// 账单数据（按时间倒序排列，转入转出成对且时间一致）
const gameBeanBillsData = [
  { id: 1, store: '利民街大展厅', type: '商户充值', device: '', film: '', people: 0, before: 0, amount: 500, after: 500, time: '2023-09-16 16:30:22' },
  { id: 2, store: '党建馆', type: '游戏消耗', device: '设备1', film: '过山车VR', people: 2, before: 100, amount: -20, after: 80, time: '2023-09-16 16:25:15' },
  { id: 3, store: '华东展厅', type: '游戏消耗', device: '设备2', film: '恐怖医院', people: 1, before: 50, amount: -15, after: 35, time: '2023-09-16 16:20:45' },
  { id: 4, store: '利民街小展厅', type: '商户充值', device: '', film: '', people: 0, before: 100, amount: 300, after: 400, time: '2023-09-16 15:45:30' },
  { id: 5, store: '恒然分部展厅', type: '活动奖励', device: '', film: '', people: 0, before: 200, amount: 50, after: 250, time: '2023-09-16 15:50:12' },
  { id: 6, store: '利民街大展厅', type: '游戏消耗', device: '设备3', film: '极速赛车', people: 3, before: 500, amount: -45, after: 455, time: '2023-09-16 15:30:20' },
  { id: 7, store: '利民街大展厅', type: '转入', device: '', film: '', people: 0, before: 0, amount: 100, after: 100, time: '2023-09-16 15:23:54' },
  { id: 8, store: '利民街小展厅', type: '转出', device: '', film: '', people: 200, before: 200, amount: -100, after: 100, time: '2023-09-16 15:23:54' },
  { id: 9, store: '利民街小展厅', type: '转入', device: '', film: '', people: 0, before: 0, amount: 200, after: 200, time: '2023-09-16 15:23:36' },
  { id: 10, store: '---', type: '转出', device: '', film: '', people: 1028, before: 1028, amount: -200, after: 828, time: '2023-09-16 15:23:36' },
  { id: 11, store: '---', type: '转入', device: '', film: '', people: 1022, before: 1022, amount: 6, after: 1028, time: '2023-09-16 15:09:17' },
  { id: 12, store: '利民街小展厅', type: '转出', device: '', film: '', people: 6, before: 6, amount: -6, after: 0, time: '2023-09-16 15:09:17' },
  { id: 13, store: '---', type: '转入', device: '', film: '', people: 1020, before: 1020, amount: 2, after: 1022, time: '2023-09-16 15:09:08' },
  { id: 14, store: '利民街大展厅', type: '转出', device: '', film: '', people: 2, before: 2, amount: -2, after: 0, time: '2023-09-16 15:09:08' },
  { id: 15, store: '---', type: '平台赠送', device: '', film: '', people: 20, before: 20, amount: 1000, after: 1020, time: '2023-09-16 14:54:28' },
  { id: 16, store: '党建馆', type: '系统调整', device: '', film: '', people: 0, before: 80, amount: 10, after: 90, time: '2023-09-16 14:45:18' },
  { id: 17, store: '华东展厅', type: '游戏消耗', device: '设备1', film: '海洋世界', people: 2, before: 35, amount: -12, after: 23, time: '2023-09-16 14:30:45' },
  { id: 18, store: '恒然分部展厅', type: '转入', device: '', film: '', people: 0, before: 200, amount: 50, after: 250, time: '2023-09-16 14:15:30' },
  { id: 19, store: '华东展厅', type: '转出', device: '', film: '', people: 50, before: 50, amount: -50, after: 0, time: '2023-09-16 14:15:30' },
  { id: 20, store: '幻影星空馆 NO.8088', type: '游戏消耗', device: '设备1', film: '星际穿越', people: 2, before: 300, amount: -30, after: 270, time: '2023-09-16 13:50:10' },
  { id: 21, store: '党建馆', type: '游戏消耗', device: '设备2', film: '恐龙世界', people: 3, before: 90, amount: -18, after: 72, time: '2023-09-16 13:35:28' },
  { id: 22, store: '华东展厅', type: '游戏消耗', device: '设备3', film: '海底探险', people: 1, before: 23, amount: -8, after: 15, time: '2023-09-16 13:20:15' },
  { id: 23, store: '恒然分部展厅', type: '游戏消耗', device: '设备1', film: '飞行模拟器', people: 2, before: 300, amount: -24, after: 276, time: '2023-09-16 13:05:42' },
  { id: 24, store: '利民街大展厅', type: '游戏消耗', device: '设备2', film: '鬼屋惊魂', people: 4, before: 455, amount: -40, after: 415, time: '2023-09-16 12:48:33' },
  { id: 25, store: '幻影星空馆 NO.8088', type: '游戏消耗', device: '设备3', film: '赛车漂移', people: 1, before: 270, amount: -15, after: 255, time: '2023-09-16 12:30:18' },
  { id: 26, store: '党建馆', type: '游戏消耗', device: '设备1', film: '太空漫步', people: 2, before: 72, amount: -20, after: 52, time: '2023-09-16 12:15:05' },
  { id: 27, store: '华东展厅', type: '游戏消耗', device: '设备2', film: '丛林冒险', people: 3, before: 15, amount: -21, after: -6, time: '2023-09-16 11:58:47' },
  { id: 28, store: '恒然分部展厅', type: '游戏消耗', device: '设备3', film: '过山车VR', people: 2, before: 276, amount: -16, after: 260, time: '2023-09-16 11:42:22' },
  { id: 29, store: '利民街小展厅', type: '游戏消耗', device: '设备1', film: '恐怖医院', people: 1, before: 300, amount: -12, after: 288, time: '2023-09-16 11:25:10' },
  { id: 30, store: '利民街小展厅', type: '转入', device: '', film: '', people: 0, before: 0, amount: 6, after: 6, time: '2023-09-16 10:17:44' },
  { id: 31, store: '---', type: '转出', device: '', film: '', people: 26, before: 26, amount: -6, after: 20, time: '2023-09-16 10:17:44' },
  { id: 32, store: '利民街大展厅', type: '转入', device: '', film: '', people: 0, before: 0, amount: 2, after: 2, time: '2023-09-16 10:17:33' },
  { id: 33, store: '---', type: '转出', device: '', film: '', people: 28, before: 28, amount: -2, after: 26, time: '2023-09-16 10:17:33' },
  { id: 34, store: '---', type: '转入', device: '', film: '', people: 0, before: 0, amount: 28, after: 28, time: '2023-09-16 10:16:48' },
  { id: 35, store: '利民街小展厅', type: '转出', device: '', film: '', people: 28, before: 28, amount: -28, after: 0, time: '2023-09-16 10:16:48' },
]

// 运营账户明细数据（短信发送 + 运营充值）
const operatingBillsData = [
  { id: 101, store: '利民街大展厅', type: '运营充值', device: '', film: '', people: 0, before: 200, amount: 500, after: 700, time: '2023-09-16 16:30:22' },
  { id: 102, store: '党建馆', type: '短信发送', device: '', film: '会员生日祝福', people: 500, before: 700, amount: -25, after: 675, time: '2023-09-16 16:25:15' },
  { id: 103, store: '华东展厅', type: '短信发送', device: '', film: '促销活动通知', people: 1200, before: 675, amount: -60, after: 615, time: '2023-09-16 16:20:45' },
  { id: 104, store: '利民街小展厅', type: '运营充值', device: '', film: '', people: 0, before: 100, amount: 300, after: 400, time: '2023-09-16 15:45:30' },
  { id: 105, store: '恒然分部展厅', type: '短信发送', device: '', film: '充值到账提醒', people: 800, before: 400, amount: -40, after: 360, time: '2023-09-16 15:50:12' },
  { id: 106, store: '幻影星空馆 NO.8088', type: '系统调整', device: '', film: '', people: 0, before: 360, amount: 50, after: 410, time: '2023-09-16 15:30:20' },
  { id: 107, store: '利民街大展厅', type: '转入', device: '', film: '', people: 0, before: 410, amount: 100, after: 510, time: '2023-09-16 15:23:54' },
  { id: 108, store: '利民街小展厅', type: '转出', device: '', film: '', people: 0, before: 510, amount: -100, after: 410, time: '2023-09-16 15:23:54' },
  { id: 109, store: '党建馆', type: '短信发送', device: '', film: '活动到期提醒', people: 300, before: 410, amount: -15, after: 395, time: '2023-09-16 15:23:36' },
  { id: 110, store: '华东展厅', type: '短信发送', device: '', film: '节假日祝福', people: 2000, before: 395, amount: -100, after: 295, time: '2023-09-16 15:09:17' },
  { id: 111, store: '恒然分部展厅', type: '运营充值', device: '', film: '', people: 0, before: 295, amount: 200, after: 495, time: '2023-09-16 15:09:08' },
  { id: 112, store: '幻影星空馆 NO.8088', type: '短信发送', device: '', film: '新会员欢迎', people: 400, before: 495, amount: -20, after: 475, time: '2023-09-16 14:54:28' },
  { id: 113, store: '利民街大展厅', type: '短信发送', device: '', film: '消费回访', people: 600, before: 475, amount: -30, after: 445, time: '2023-09-16 14:45:18' },
  { id: 114, store: '利民街小展厅', type: '转入', device: '', film: '', people: 0, before: 445, amount: 50, after: 495, time: '2023-09-16 14:30:45' },
  { id: 115, store: '党建馆', type: '转出', device: '', film: '', people: 0, before: 495, amount: -50, after: 445, time: '2023-09-16 14:30:45' },
  { id: 116, store: '华东展厅', type: '短信发送', device: '', film: '积分兑换通知', people: 350, before: 445, amount: -17, after: 428, time: '2023-09-16 13:50:10' },
  { id: 117, store: '恒然分部展厅', type: '短信发送', device: '', film: '优惠券到期提醒', people: 900, before: 428, amount: -45, after: 383, time: '2023-09-16 13:35:28' },
  { id: 118, store: '幻影星空馆 NO.8088', type: '短信发送', device: '', film: '会员等级变更', people: 250, before: 383, amount: -12, after: 371, time: '2023-09-16 13:20:15' },
  { id: 119, store: '利民街大展厅', type: '短信发送', device: '', film: '预约确认', people: 500, before: 371, amount: -25, after: 346, time: '2023-09-16 13:05:42' },
  { id: 120, store: '利民街小展厅', type: '短信发送', device: '', film: '账单提醒', people: 700, before: 346, amount: -35, after: 311, time: '2023-09-16 12:48:33' },
]

// 基础账户明细数据
const basicBillsData = [
  { id: 201, store: '利民街大展厅', type: '基础充值', device: '', film: '', people: 0, before: 0, amount: 1000, after: 1000, time: '2023-09-16 16:30:22' },
  { id: 202, store: '党建馆', type: '系统扣费', device: '', film: '月租费', people: 0, before: 1000, amount: -100, after: 900, time: '2023-09-16 16:25:15' },
  { id: 203, store: '华东展厅', type: '基础充值', device: '', film: '', people: 0, before: 500, amount: 500, after: 1000, time: '2023-09-16 15:45:30' },
  { id: 204, store: '恒然分部展厅', type: '系统扣费', device: '', film: '服务费', people: 0, before: 800, amount: -80, after: 720, time: '2023-09-16 15:23:54' },
  { id: 205, store: '幻影星空馆 NO.8088', type: '基础充值', device: '', film: '', people: 0, before: 300, amount: 700, after: 1000, time: '2023-09-16 14:54:28' },
  { id: 206, store: '利民街小展厅', type: '系统扣费', device: '', film: '月租费', people: 0, before: 1000, amount: -100, after: 900, time: '2023-09-16 14:30:45' },
  { id: 207, store: '利民街大展厅', type: '转入', device: '', film: '', people: 0, before: 900, amount: 200, after: 1100, time: '2023-09-16 13:50:10' },
  { id: 208, store: '党建馆', type: '转出', device: '', film: '', people: 0, before: 900, amount: -200, after: 700, time: '2023-09-16 13:50:10' },
  { id: 209, store: '华东展厅', type: '系统调整', device: '', film: '', people: 0, before: 700, amount: 50, after: 750, time: '2023-09-16 13:20:15' },
  { id: 210, store: '恒然分部展厅', type: '基础充值', device: '', film: '', people: 0, before: 720, amount: 300, after: 1020, time: '2023-09-16 12:48:33' },
]

const accountType = computed(() => (route.query.type as string) || '')

const tableData = computed(() => {
  if (accountType.value === 'operating') return operatingBillsData
  if (accountType.value === 'basic') return basicBillsData
  return gameBeanBillsData
})

const amountColumnTitle = computed(() => {
  if (accountType.value === 'operating') return '运营额度'
  if (accountType.value === 'basic') return '基础额度'
  return '游戏豆'
})

const currentBillTypeOptions = computed(() => {
  if (accountType.value === 'operating') {
    return [
      { value: '转入', label: '转入' },
      { value: '转出', label: '转出' },
      { value: '短信发送', label: '短信发送' },
      { value: '运营充值', label: '运营充值' },
      { value: '系统调整', label: '系统调整' },
    ]
  }
  if (accountType.value === 'basic') {
    return [
      { value: '转入', label: '转入' },
      { value: '转出', label: '转出' },
      { value: '基础充值', label: '基础充值' },
      { value: '系统扣费', label: '系统扣费' },
      { value: '系统调整', label: '系统调整' },
    ]
  }
  return billTypeOptions
})

// 账单列定义
const currentColumns = computed(() => {
  const isOperating = accountType.value === 'operating'
  const isBasic = accountType.value === 'basic'
  const noShowTypes = isOperating
    ? ['转入', '转出', '运营充值', '系统调整']
    : isBasic
      ? ['转入', '转出', '基础充值', '系统调整', '系统扣费']
      : ['转入', '转出', '平台赠送']

  const columns: any[] = [
    { title: '门店', key: 'store', minWidth: 130 },
    { title: '账单类型', key: 'type', width: 110 },
  ]

  if (!isOperating && !isBasic) {
    columns.push(
      { title: '设备', key: 'device', width: 90 },
      { title: '影片', key: 'film', width: 120 },
    )
  } else if (isOperating) {
    columns.push(
      { title: '短信内容', key: 'film', width: 140 },
    )
  } else if (isBasic) {
    columns.push(
      { title: '费用项', key: 'film', width: 120 },
    )
  }

  columns.push(
    {
      title: isOperating ? '发送量' : '人数',
      key: 'people',
      width: isOperating ? 80 : 70,
      render: (row: any) => {
        return noShowTypes.includes(row.type) ? h('span', {}, '') : h('span', {}, row.people || '')
      }
    },
    { title: '变动前', key: 'before', width: 90 },
    {
      title: amountColumnTitle.value,
      key: 'amount',
      width: 100,
      render: (row: any) => h('span', {
        style: { color: row.amount >= 0 ? '#10B981' : '#EF4444', fontWeight: 500 }
      }, (row.amount >= 0 ? '+' : '') + row.amount)
    },
    { title: '变动后', key: 'after', width: 90 },
    { title: '时间', key: 'time', minWidth: 160 },
  )

  return columns
})

function handleFilter() {
  console.log('筛选条件', {
    store: filterStore.value,
    date: filterDate.value,
    type: filterType.value,
    device: filterDevice.value,
    game: filterGame.value
  })
  showFilterDrawer.value = false
}

function resetFilter() {
  filterStore.value = ''
  filterDate.value = null
  filterType.value = ''
  filterDevice.value = ''
  filterGame.value = ''
}

function handleExport() {
  console.log('导出账单')
}

function goBack() {
  router.back()
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
  margin-bottom: 24px;
}

.page-header-left {
  display: flex;
  align-items: center;
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
