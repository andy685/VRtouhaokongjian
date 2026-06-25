<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>点播数据</h1>
      <n-button type="primary" size="small" @click="exportData">
        <template #icon><n-icon :component="DownloadOutline" /></template>
        导出
      </n-button>
    </div>

    <n-tabs v-model:value="activeTab" type="line" animated style="overflow:visible;">
      <!-- ===== Tab 1: 消费记录 ===== -->
      <n-tab-pane name="film-record" tab="消费记录" style="overflow:visible;">
        <div class="filter-bar">
          <n-select v-model:value="filterShop" :options="shopOptions" size="small" style="width:150px" clearable placeholder="全部店铺" />
          <n-input v-model:value="filterDevice" size="small" style="width:160px" clearable placeholder="搜索设备" />
          <n-input v-model:value="filterFilmGame" size="small" style="width:160px" clearable placeholder="搜索游戏" />
          <n-date-picker type="daterange" clearable size="small" v-model:value="dateRange" style="width:240px" />
        </div>
        <n-data-table
          :columns="filmColumns"
          :data="filteredFilmData"
          :pagination="pagination"
          :bordered="true"
          :single-line="false"
          size="small"
        />
      </n-tab-pane>

      <!-- ===== Tab 2: 游戏汇总 ===== -->
      <n-tab-pane name="game-summary" tab="游戏汇总" style="overflow:visible;">
        <!-- KPI 卡片 -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
              <n-icon :component="GridOutline" size="22" color="#fff" />
            </div>
            <div class="stat-info">
              <span class="stat-label">游戏数量</span>
              <span class="stat-value">{{ gameSummaryKpi.gameCount }}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
              <n-icon :component="PlayOutline" size="22" color="#fff" />
            </div>
            <div class="stat-info">
              <span class="stat-label">总点播次数</span>
              <span class="stat-value">{{ gameSummaryKpi.totalPlays }}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
              <n-icon :component="PeopleOutline" size="22" color="#fff" />
            </div>
            <div class="stat-info">
              <span class="stat-label">总人次</span>
              <span class="stat-value">{{ gameSummaryKpi.totalPeople }}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
              <n-icon :component="TrendingUpOutline" size="22" color="#fff" />
            </div>
            <div class="stat-info">
              <span class="stat-label">场均人次</span>
              <span class="stat-value">{{ gameSummaryKpi.avgPerPlay }}</span>
            </div>
          </div>
        </div>

        <div class="filter-bar">
          <n-select v-model:value="filterShop" :options="shopOptions" size="small" style="width:150px" clearable placeholder="全部店铺" />
          <n-input v-model:value="filterGameSummary" size="small" style="width:160px" clearable placeholder="搜索游戏" />
          <n-date-picker type="daterange" clearable size="small" v-model:value="dateRange" style="width:240px" />
        </div>
        <n-data-table
          :columns="gameSummaryColumns"
          :data="filteredGameSummaryData"
          :pagination="pagination"
          :bordered="true"
          :single-line="false"
          size="small"
        />
      </n-tab-pane>

      <!-- ===== Tab 3: 员工点播 ===== -->
      <n-tab-pane name="staff" tab="员工点播" style="overflow:visible;">
        <!-- KPI 卡片 -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
              <n-icon :component="PlayOutline" size="22" color="#fff" />
            </div>
            <div class="stat-info">
              <span class="stat-label">点播次数</span>
              <span class="stat-value">{{ staffKpi.count }}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
              <n-icon :component="TimeOutline" size="22" color="#fff" />
            </div>
            <div class="stat-info">
              <span class="stat-label">总时长</span>
              <span class="stat-value">{{ staffKpi.durationHours }}h</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
              <n-icon :component="CashOutline" size="22" color="#fff" />
            </div>
            <div class="stat-info">
              <span class="stat-label">消费金额</span>
              <span class="stat-value">¥{{ staffKpi.amount.toLocaleString() }}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
              <n-icon :component="PeopleOutline" size="22" color="#fff" />
            </div>
            <div class="stat-info">
              <span class="stat-label">参与员工</span>
              <span class="stat-value">{{ staffKpi.employees }}</span>
            </div>
          </div>
        </div>

        <div class="filter-bar">
          <n-select v-model:value="staffFilterShop" :options="allShopOptions" size="small" style="width:150px" clearable placeholder="全部店铺" />
          <n-select v-model:value="staffFilterEmployee" :options="employeeOptions" size="small" style="width:130px" clearable placeholder="全部员工" />
          <n-select v-model:value="staffDeviceType" :options="deviceTypeOptions" size="small" style="width:120px" placeholder="设备类型" />
          <n-input v-model:value="staffFilterGame" size="small" style="width:140px" clearable placeholder="搜索游戏" />
          <n-date-picker type="daterange" clearable size="small" v-model:value="staffDateRange" style="width:230px" />
        </div>

        <div class="table-card">
          <n-data-table :columns="staffColumns" :data="filteredStaffData" :pagination="pagination" :bordered="false" :single-line="false" size="small" striped />
        </div>
      </n-tab-pane>
    </n-tabs>

    <!-- 员工点播详情弹窗 -->
    <n-modal v-model:show="showStaffDetail" preset="card" title="点播详情" style="width: 520px;">
      <n-descriptions :column="2" bordered>
        <n-descriptions-item label="店铺">{{ currentStaffRecord?.shop }}</n-descriptions-item>
        <n-descriptions-item label="员工">{{ currentStaffRecord?.name }}（{{ currentStaffRecord?.employeeId }}）</n-descriptions-item>
        <n-descriptions-item label="设备">{{ currentStaffRecord?.device }}</n-descriptions-item>
        <n-descriptions-item label="游戏">{{ currentStaffRecord?.game }}</n-descriptions-item>
        <n-descriptions-item label="开始时间">{{ currentStaffRecord?.startTime }}</n-descriptions-item>
        <n-descriptions-item label="时长">{{ currentStaffRecord?.duration }}分钟</n-descriptions-item>
        <n-descriptions-item label="金额">¥{{ currentStaffRecord?.amount }}</n-descriptions-item>
        <n-descriptions-item label="状态">{{ currentStaffRecord?.status }}</n-descriptions-item>
      </n-descriptions>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showStaffDetail = false">关闭</n-button>
        </n-space>
      </template>
    </n-modal>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { NDataTable, NButton, NIcon, NModal, NSelect, NInput, NDatePicker, NSpace, NTabs, NTabPane, NTag, NDescriptions, NDescriptionsItem } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { DownloadOutline, PlayOutline, TimeOutline, CashOutline, PeopleOutline, GridOutline, TrendingUpOutline } from '@vicons/ionicons5'

const activeTab = ref('film-record')

// ==================== 公共筛选 ====================
const filterShop = ref<string | null>(null)
const filterDevice = ref('')
const filterGameSummary = ref('')
const dateRange = ref<[number, number] | null>(null)

const shopOptions = [
  { label: '利民街小展厅', value: '利民街小展厅' },
]

const pagination = { pageSize: 15 }

// ==================== Tab 1: 消费记录 ====================
const filmColumns: DataTableColumns = [
  { title: '店铺', key: 'shop', width: 130, align: 'center' },
  { title: '设备', key: 'device', width: 140, align: 'center' },
  { title: '游戏', key: 'game', minWidth: 180 },
  { title: '人数', key: 'people', width: 70, align: 'center' },
  { title: '消费时间', key: 'time', width: 160, align: 'center' },
]

const filmRawData = ref([
  { shop: '利民街小展厅', device: '幻影飞碟', game: '阿拉丁历险记4K高清版(飞碟)', people: 2, time: '2023-07-25 12:54', allowRenewal: true },
  { shop: '利民街小展厅', device: '幻影飞碟', game: '勇闯恐龙谷(飞碟)', people: 1, time: '2023-07-25 12:50', allowRenewal: false },
  { shop: '利民街小展厅', device: '幻影飞碟', game: '荒岛逃生(飞碟)', people: 1, time: '2023-07-25 12:45', allowRenewal: false },
  { shop: '利民街小展厅', device: '暗黑机甲22版', game: '幻影突袭', people: 1, time: '2023-07-25 11:30', allowRenewal: true },
  { shop: '利民街小展厅', device: '暗黑战场[主控端]', game: '幻影突袭', people: 1, time: '2023-07-25 10:47', allowRenewal: true },
  { shop: '利民街小展厅', device: '暗黑战场[主控端]', game: '破甲风暴', people: 2, time: '2023-07-25 10:38', allowRenewal: false },
  { shop: '利民街小展厅', device: '悬浮骑兵', game: '节奏光剑', people: 1, time: '2023-07-25 10:33', allowRenewal: true },
  { shop: '利民街小展厅', device: '悬浮骑兵', game: '节奏光剑', people: 1, time: '2023-07-25 10:30', allowRenewal: true },
  { shop: '利民街小展厅', device: '幻影飞碟', game: '急速森林(飞碟)', people: 5, time: '2023-07-25 11:39', allowRenewal: false },
  { shop: '利民街小展厅', device: '幻影飞碟', game: '恐怖森林(飞碟)', people: 1, time: '2023-07-25 11:23', allowRenewal: false },
  { shop: '利民街小展厅', device: '幻影飞碟', game: '阿拉丁历险记4K高清版(飞碟)', people: 2, time: '2023-07-25 11:17', allowRenewal: true },
  { shop: '利民街小展厅', device: '暗黑机甲22版', game: '幻影突袭', people: 1, time: '2023-07-25 11:05', allowRenewal: true },
])

const filterFilmGame = ref('')

const filteredFilmData = computed(() => {
  let data = filmRawData.value
  if (filterShop.value) data = data.filter(d => d.shop === filterShop.value)
  if (filterDevice.value) data = data.filter(d => d.device.includes(filterDevice.value))
  if (filterFilmGame.value) data = data.filter(d => d.game.includes(filterFilmGame.value))
  return data
})

function resetFilmFilter() {
  filterShop.value = null
  filterDevice.value = ''
  filterFilmGame.value = ''
  dateRange.value = null
}

// ==================== Tab 2: 游戏汇总 ====================
const gameSummaryColumns: DataTableColumns = [
  { title: '店铺', key: 'shop', width: 130, align: 'center' },
  { title: '游戏', key: 'game', minWidth: 200 },
  { title: '点播次数', key: 'plays', width: 100, align: 'center' },
  { title: '游戏人数', key: 'people', width: 100, align: 'center' },
  { title: '点播次数占比(%)', key: 'playPercent', width: 140, align: 'center', render: (row: any) => row.playPercent.toFixed(2) },
  { title: '游戏人数占比(%)', key: 'peoplePercent', width: 140, align: 'center', render: (row: any) => row.peoplePercent.toFixed(2) },
]

const gameSummaryRawData = ref([
  { shop: '利民街小展厅', game: '勇闯恐龙谷(飞碟)', plays: 1, people: 5, playPercent: 3.70, peoplePercent: 9.80, allowRenewal: false },
  { shop: '利民街小展厅', game: '匿者', plays: 1, people: 1, playPercent: 3.70, peoplePercent: 1.96, allowRenewal: false },
  { shop: '利民街小展厅', game: '阿拉丁历险记4K高清版(飞碟)', plays: 2, people: 10, playPercent: 7.41, peoplePercent: 19.61, allowRenewal: true },
  { shop: '利民街小展厅', game: '荒岛逃生(飞碟)', plays: 1, people: 5, playPercent: 3.70, peoplePercent: 9.80, allowRenewal: false },
  { shop: '利民街小展厅', game: '恐怖森林(飞碟)', plays: 2, people: 6, playPercent: 7.41, peoplePercent: 11.76, allowRenewal: false },
  { shop: '利民街小展厅', game: '急速森林(飞碟)', plays: 5, people: 9, playPercent: 18.52, peoplePercent: 17.65, allowRenewal: false },
  { shop: '利民街小展厅', game: '幻影突袭', plays: 11, people: 11, playPercent: 40.74, peoplePercent: 21.57, allowRenewal: true },
  { shop: '利民街小展厅', game: '节奏光剑', plays: 3, people: 3, playPercent: 11.11, peoplePercent: 5.88, allowRenewal: true },
  { shop: '利民街小展厅', game: '破甲风暴', plays: 1, people: 1, playPercent: 3.70, peoplePercent: 1.96, allowRenewal: false },
])

const filteredGameSummaryData = computed(() => {
  let list = filterShop.value ? gameSummaryRawData.value.filter(d => d.shop === filterShop.value) : [...gameSummaryRawData.value]
  if (filterGameSummary.value) list = list.filter(d => d.game.includes(filterGameSummary.value))
  return list
})

const gameSummaryKpi = computed(() => {
  const data = filteredGameSummaryData.value
  const totalPlays = data.reduce((s, d) => s + d.plays, 0)
  const totalPeople = data.reduce((s, d) => s + d.people, 0)
  return {
    gameCount: data.length,
    totalPlays,
    totalPeople,
    avgPerPlay: totalPlays > 0 ? (totalPeople / totalPlays).toFixed(1) : '0',
  }
})

function resetGameFilter() {
  filterShop.value = null
  filterGameSummary.value = ''
  dateRange.value = null
}

// ==================== Tab 3: 员工点播 ====================
const staffFilterShop = ref<string | null>(null)
const staffFilterEmployee = ref<string | null>(null)
const staffDeviceType = ref<string | null>(null)
const staffFilterGame = ref('')
const deviceTypeOptions = [
  { label: '全部设备', value: null },
  { label: 'VR设备', value: 'vr' },
  { label: '银幕互动', value: 'screen' },
]

function getTodayRange(): [number, number] {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
  return [start.getTime(), end.getTime()]
}
const staffDateRange = ref<[number, number] | null>(getTodayRange())

const allShopOptions = [
  { label: '利民街小展厅', value: '利民街小展厅' },
  { label: '卓远萝岗区店', value: '卓远萝岗区店' },
  { label: '卓远萧山区店', value: '卓远萧山区店' },
  { label: '卓远亚运城店', value: '卓远亚运城店' },
  { label: '卓远文鼎路店', value: '卓远文鼎路店' },
]

const employeeOptions = [
  { label: '张三', value: '张三' },
  { label: '李四', value: '李四' },
  { label: '王五', value: '王五' },
  { label: '赵六', value: '赵六' },
  { label: '钱七', value: '钱七' },
]

const staffColumns: DataTableColumns = [
  { title: '店铺', key: 'shop', width: 140, align: 'center' },
  { title: '员工姓名', key: 'name', width: 100, align: 'center' },
  { title: '工号', key: 'employeeId', width: 80, align: 'center' },
  { title: '设备', key: 'device', width: 110, align: 'center' },
  { title: '游戏名称', key: 'game', minWidth: 160 },
  { title: '开始时间', key: 'startTime', width: 170, align: 'center' },
  { title: '时长', key: 'duration', width: 90, align: 'center', render: (row: any) => `${row.duration}分钟` },
  { title: '金额', key: 'amount', width: 100, align: 'center', render: (row: any) => h('span', { style: { color: '#3B82F6', fontWeight: 600 } }, `¥${row.amount}`) },
  { title: '状态', key: 'status', width: 80, align: 'center', render: (row: any) =>
    h(NTag, { type: row.status === '完成' ? 'success' : row.status === '进行中' ? 'info' : 'warning', size: 'small', bordered: true },
      { default: () => row.status })
  },
  { title: '操作', key: 'actions', width: 80, align: 'center', render: (row: any) =>
    h(NButton, { size: 'small', text: true, type: 'primary', onClick: () => showStaffDetailFn(row) },
      { default: () => '详情' })
  },
]

const staffRawData = ref([
  { id: 1, shop: '卓远亚运城店', name: '张三', employeeId: 'A001', device: 'VR-01', deviceType: 'vr', game: '星际探险', startTime: '2026-04-23 14:30:00', duration: 45, amount: 68, operator: '扫码', status: '完成' },
  { id: 2, shop: '卓远亚运城店', name: '李四', employeeId: 'A002', device: 'VR-02', deviceType: 'vr', game: '深海潜水', startTime: '2026-04-23 15:00:00', duration: 60, amount: 88, operator: '扫码', status: '完成' },
  { id: 3, shop: '卓远亚运城店', name: '王五', employeeId: 'A003', device: '银幕-01', deviceType: 'screen', game: '节奏大师', startTime: '2026-04-23 16:30:00', duration: 30, amount: 38, operator: '手动', status: '进行中' },
  { id: 4, shop: '卓远萝岗区店', name: '赵六', employeeId: 'A004', device: 'VR-03', deviceType: 'vr', game: '极限滑雪', startTime: '2026-04-23 10:00:00', duration: 50, amount: 78, operator: '扫码', status: '完成' },
  { id: 5, shop: '卓远萝岗区店', name: '钱七', employeeId: 'A005', device: 'VR-01', deviceType: 'vr', game: '星际探险', startTime: '2026-04-23 18:00:00', duration: 45, amount: 68, operator: '扫码', status: '完成' },
  { id: 6, shop: '卓远萧山区店', name: '张三', employeeId: 'A001', device: '银幕-02', deviceType: 'screen', game: '动感飞车', startTime: '2026-04-23 11:00:00', duration: 40, amount: 58, operator: '手动', status: '完成' },
  { id: 7, shop: '利民街小展厅', name: '李四', employeeId: 'A002', device: 'VR-04', deviceType: 'vr', game: '恐怖医院', startTime: '2026-04-23 20:00:00', duration: 35, amount: 48, operator: '扫码', status: '完成' },
])

const filteredStaffData = computed(() => {
  let data = staffRawData.value
  if (staffFilterShop.value) data = data.filter(d => d.shop === staffFilterShop.value)
  if (staffFilterEmployee.value) data = data.filter(d => d.name === staffFilterEmployee.value)
  if (staffDeviceType.value) data = data.filter(d => d.deviceType === staffDeviceType.value)
  if (staffFilterGame.value) data = data.filter(d => d.game.includes(staffFilterGame.value))
  return data
})

const staffKpi = computed(() => {
  const data = filteredStaffData.value
  const totalDuration = data.reduce((s, d) => s + d.duration, 0)
  return {
    count: data.length,
    durationHours: Math.round(totalDuration / 60 * 10) / 10,
    amount: data.reduce((s, d) => s + d.amount, 0),
    employees: new Set(data.map(d => d.name)).size,
  }
})

const showStaffDetail = ref(false)
const currentStaffRecord = ref<any>(null)

function showStaffDetailFn(row: any) {
  currentStaffRecord.value = row
  showStaffDetail.value = true
}

function resetStaffFilter() {
  staffFilterShop.value = null
  staffFilterEmployee.value = null
  staffDeviceType.value = null
  staffFilterGame.value = ''
  staffDateRange.value = getTodayRange()
}

// ==================== 公共导出 ====================

function exportData() {
  const tabNames: Record<string, string> = { 'film-record': '消费记录', 'game-summary': '游戏汇总', 'staff': '员工点播' }
  console.log('导出点播数据: ' + tabNames[activeTab.value])
}
</script>

<style scoped>
/* ===== 页面布局 ===== */
.page-container { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }

/* ===== 筛选栏（统一） ===== */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

/* ===== 指标卡片（员工点播） ===== */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}
.stat-card {
  background: var(--color-bg-white);
  border-radius: 16px;
  padding: 22px 24px;
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.25s;
  position: relative;
  overflow: hidden;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
.stat-card:hover::before {
  opacity: 1;
}
.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--gradient-brand);
  opacity: 0;
  transition: opacity 0.3s;
}
.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.stat-label {
  font-size: 13px;
  color: var(--text-muted);
}
.stat-value {
  font-family: 'Orbitron', sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
}

/* ===== 表格卡片（员工点播） ===== */
.table-card {
  background: var(--color-bg-white);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid var(--border-color);
}

/* ===== Tabs ===== */
::deep(.n-tabs-nav) { margin-bottom: 16px; }

/* ===== 响应式 ===== */
@media (max-width: 1200px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
