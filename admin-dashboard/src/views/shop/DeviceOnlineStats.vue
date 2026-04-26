<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>设备在线统计</h1>
      <n-space>
        <n-select v-model:value="selectedShop" :options="shopOptions" size="small" style="width: 160px;" />
        <n-date-picker type="daterange" clearable size="small" v-model:value="dateRange" />
      </n-space>
    </div>

    <!-- 数据表格 -->
    <div class="content-card">
      <n-data-table :columns="columns" :data="statsData" :pagination="{ pageSize: 10 }" striped />
    </div>

    <!-- 详情弹窗 -->
    <n-modal v-model:show="showDetailModal" preset="card" :title="detailTitle" style="width: 560px;" :bordered="false">
      <n-data-table
        :columns="detailColumns"
        :data="detailData"
        :pagination="{ pageSize: 8 }"
        striped
        size="small"
      />
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NDataTable, NButton, NIcon, NTag, NDatePicker, NModal, NSpace, NSelect
} from 'naive-ui'
import { EyeOutline } from '@vicons/ionicons5'

const dateRange = ref<[number, number] | null>(null)
const showDetailModal = ref(false)
const currentDate = ref('')
const selectedShop = ref('all')

const shopOptions = [
  { label: '全部店铺', value: 'all' },
  { label: '利民街小展厅', value: '利民街小展厅' },
  { label: '卓远萝岗区店', value: '卓远萝岗区店' },
  { label: '卓远萧山区店', value: '卓远萧山区店' },
  { label: '卓远亚运城店', value: '卓远亚运城店' },
]

const deviceList = [
  { name: '悬浮骑兵-01', type: '悬浮骑兵' },
  { name: '暗黑行者-01', type: '暗黑行者' },
  { name: '暗黑机甲2G版', type: '暗黑机甲' },
  { name: '幻影飞碟（国外）', type: '幻影飞碟' },
  { name: '悬浮骑兵-A01', type: '悬浮骑兵' },
  { name: '暗黑行者-B02', type: '暗黑行者' },
  { name: '扭蛋', type: '第三方设备' },
  { name: '体感游戏机', type: '第三方设备' },
  { name: '悬浮骑兵-02', type: '悬浮骑兵' },
  { name: '暗黑行者-02', type: '暗黑行者' },
  { name: '暗黑行者-03', type: '暗黑行者' },
  { name: '幻影飞碟-C01', type: '幻影飞碟' },
  { name: '悬浮骑兵-03', type: '悬浮骑兵' },
  { name: '暗黑机甲-01', type: '暗黑机甲' },
  { name: '幻影飞碟-01', type: '幻影飞碟' },
]

// 为每个日期动态生成详情数据
function generateDetail(date: string, count: number): { name: string; type: string; onlineHours: number }[] {
  const devices = deviceList.slice(0, count)
  // 用日期做 seed 保证同一天数据一致
  const seed = date.split('-').map(Number).reduce((a, b) => a + b, 0)
  return devices.map((d, i) => {
    const base = 5 + ((seed + i * 7) % 55) / 10
    return { name: d.name, type: d.type, onlineHours: Math.round(base * 10) / 10 }
  })
}

const shopNames = ['利民街小展厅', '卓远萝岗区店', '卓远萧山区店', '卓远亚运城店']

// Mock 数据：最近 15 天每日统计（包含今天）
const allStatsData = ref([
  { date: '2026-04-27', shop: '利民街小展厅', onlineCount: 12, avgHours: 6.5, totalHours: 78.0 },
  { date: '2026-04-27', shop: '卓远亚运城店', onlineCount: 8, avgHours: 5.8, totalHours: 46.4 },
  { date: '2026-04-27', shop: '卓远萧山区店', onlineCount: 6, avgHours: 5.2, totalHours: 31.2 },
  { date: '2026-04-27', shop: '卓远萝岗区店', onlineCount: 4, avgHours: 4.5, totalHours: 18.0 },
  { date: '2026-04-26', shop: '利民街小展厅', onlineCount: 13, avgHours: 7.0, totalHours: 91.0 },
  { date: '2026-04-26', shop: '卓远亚运城店', onlineCount: 9, avgHours: 6.2, totalHours: 55.8 },
  { date: '2026-04-26', shop: '卓远萧山区店', onlineCount: 7, avgHours: 5.5, totalHours: 38.5 },
  { date: '2026-04-26', shop: '卓远萝岗区店', onlineCount: 5, avgHours: 4.8, totalHours: 24.0 },
  { date: '2026-04-25', shop: '利民街小展厅', onlineCount: 13, avgHours: 7.2, totalHours: 93.6 },
  { date: '2026-04-25', shop: '卓远亚运城店', onlineCount: 8, avgHours: 6.0, totalHours: 48.0 },
  { date: '2026-04-25', shop: '卓远萧山区店', onlineCount: 6, avgHours: 5.5, totalHours: 33.0 },
  { date: '2026-04-25', shop: '卓远萝岗区店', onlineCount: 4, avgHours: 4.2, totalHours: 16.8 },
  { date: '2026-04-24', shop: '利民街小展厅', onlineCount: 12, avgHours: 6.8, totalHours: 81.6 },
  { date: '2026-04-24', shop: '卓远亚运城店', onlineCount: 9, avgHours: 6.5, totalHours: 58.5 },
  { date: '2026-04-24', shop: '卓远萧山区店', onlineCount: 5, avgHours: 4.8, totalHours: 24.0 },
  { date: '2026-04-24', shop: '卓远萝岗区店', onlineCount: 3, avgHours: 3.5, totalHours: 10.5 },
  { date: '2026-04-23', shop: '利民街小展厅', onlineCount: 14, avgHours: 7.5, totalHours: 105.0 },
  { date: '2026-04-23', shop: '卓远亚运城店', onlineCount: 10, avgHours: 7.0, totalHours: 70.0 },
  { date: '2026-04-23', shop: '卓远萧山区店', onlineCount: 7, avgHours: 6.0, totalHours: 42.0 },
  { date: '2026-04-23', shop: '卓远萝岗区店', onlineCount: 5, avgHours: 5.0, totalHours: 25.0 },
  { date: '2026-04-22', shop: '利民街小展厅', onlineCount: 11, avgHours: 6.5, totalHours: 71.5 },
  { date: '2026-04-22', shop: '卓远亚运城店', onlineCount: 8, avgHours: 5.8, totalHours: 46.4 },
  { date: '2026-04-22', shop: '卓远萧山区店', onlineCount: 6, avgHours: 5.0, totalHours: 30.0 },
  { date: '2026-04-22', shop: '卓远萝岗区店', onlineCount: 4, avgHours: 4.0, totalHours: 16.0 },
  { date: '2026-04-21', shop: '利民街小展厅', onlineCount: 13, avgHours: 7.0, totalHours: 91.0 },
  { date: '2026-04-21', shop: '卓远亚运城店', onlineCount: 9, avgHours: 6.2, totalHours: 55.8 },
  { date: '2026-04-21', shop: '卓远萧山区店', onlineCount: 6, avgHours: 5.2, totalHours: 31.2 },
  { date: '2026-04-21', shop: '卓远萝岗区店', onlineCount: 5, avgHours: 4.5, totalHours: 22.5 },
  { date: '2026-04-20', shop: '利民街小展厅', onlineCount: 12, avgHours: 6.9, totalHours: 82.8 },
  { date: '2026-04-20', shop: '卓远亚运城店', onlineCount: 8, avgHours: 5.5, totalHours: 44.0 },
  { date: '2026-04-20', shop: '卓远萧山区店', onlineCount: 5, avgHours: 4.8, totalHours: 24.0 },
  { date: '2026-04-20', shop: '卓远萝岗区店', onlineCount: 4, avgHours: 3.8, totalHours: 15.2 },
  { date: '2026-04-19', shop: '利民街小展厅', onlineCount: 14, avgHours: 7.8, totalHours: 109.2 },
  { date: '2026-04-19', shop: '卓远亚运城店', onlineCount: 10, avgHours: 7.2, totalHours: 72.0 },
  { date: '2026-04-19', shop: '卓远萧山区店', onlineCount: 8, avgHours: 6.5, totalHours: 52.0 },
  { date: '2026-04-19', shop: '卓远萝岗区店', onlineCount: 6, avgHours: 5.5, totalHours: 33.0 },
  { date: '2026-04-18', shop: '利民街小展厅', onlineCount: 10, avgHours: 5.5, totalHours: 55.0 },
  { date: '2026-04-18', shop: '卓远亚运城店', onlineCount: 7, avgHours: 5.0, totalHours: 35.0 },
  { date: '2026-04-18', shop: '卓远萧山区店', onlineCount: 5, avgHours: 4.2, totalHours: 21.0 },
  { date: '2026-04-18', shop: '卓远萝岗区店', onlineCount: 3, avgHours: 3.0, totalHours: 9.0 },
  { date: '2026-04-17', shop: '利民街小展厅', onlineCount: 12, avgHours: 7.0, totalHours: 84.0 },
  { date: '2026-04-17', shop: '卓远亚运城店', onlineCount: 8, avgHours: 6.0, totalHours: 48.0 },
  { date: '2026-04-17', shop: '卓远萧山区店', onlineCount: 6, avgHours: 5.0, totalHours: 30.0 },
  { date: '2026-04-17', shop: '卓远萝岗区店', onlineCount: 4, avgHours: 4.0, totalHours: 16.0 },
  { date: '2026-04-16', shop: '利民街小展厅', onlineCount: 13, avgHours: 7.3, totalHours: 94.9 },
  { date: '2026-04-16', shop: '卓远亚运城店', onlineCount: 9, avgHours: 6.5, totalHours: 58.5 },
  { date: '2026-04-16', shop: '卓远萧山区店', onlineCount: 7, avgHours: 5.8, totalHours: 40.6 },
  { date: '2026-04-16', shop: '卓远萝岗区店', onlineCount: 5, avgHours: 4.5, totalHours: 22.5 },
  { date: '2026-04-15', shop: '利民街小展厅', onlineCount: 11, avgHours: 6.2, totalHours: 68.2 },
  { date: '2026-04-15', shop: '卓远亚运城店', onlineCount: 7, avgHours: 5.5, totalHours: 38.5 },
  { date: '2026-04-15', shop: '卓远萧山区店', onlineCount: 5, avgHours: 4.5, totalHours: 22.5 },
  { date: '2026-04-15', shop: '卓远萝岗区店', onlineCount: 3, avgHours: 3.5, totalHours: 10.5 },
  { date: '2026-04-14', shop: '利民街小展厅', onlineCount: 12, avgHours: 6.8, totalHours: 81.6 },
  { date: '2026-04-14', shop: '卓远亚运城店', onlineCount: 8, avgHours: 5.8, totalHours: 46.4 },
  { date: '2026-04-14', shop: '卓远萧山区店', onlineCount: 6, avgHours: 5.0, totalHours: 30.0 },
  { date: '2026-04-14', shop: '卓远萝岗区店', onlineCount: 4, avgHours: 4.0, totalHours: 16.0 },
  { date: '2026-04-13', shop: '利民街小展厅', onlineCount: 13, avgHours: 7.1, totalHours: 92.3 },
  { date: '2026-04-13', shop: '卓远亚运城店', onlineCount: 9, avgHours: 6.0, totalHours: 54.0 },
  { date: '2026-04-13', shop: '卓远萧山区店', onlineCount: 7, avgHours: 5.5, totalHours: 38.5 },
  { date: '2026-04-13', shop: '卓远萝岗区店', onlineCount: 5, avgHours: 4.2, totalHours: 21.0 },
])

const statsData = computed(() => {
  if (selectedShop.value === 'all') return allStatsData.value
  return allStatsData.value.filter(d => d.shop === selectedShop.value)
})

const currentDetailShop = ref('')
const detailTitle = computed(() => `${currentDate.value} ${currentDetailShop.value} - 设备在线详情`)

const detailData = computed(() => {
  const row = statsData.value.find(d => d.date === currentDate.value)
  if (!row) return []
  return generateDetail(currentDate.value, row.onlineCount)
})

const columns = [
  { title: '日期', key: 'date', width: 120 },
  { title: '店铺', key: 'shop', width: 140 },
  { title: '在线设备数', key: 'onlineCount', width: 120, align: 'center' },
  { title: '平均在线时长', key: 'avgHours', width: 130, align: 'center', render: (row: any) => `${row.avgHours}h` },
  { title: '总在线时长', key: 'totalHours', width: 130, align: 'center', render: (row: any) => `${row.totalHours}h` },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    align: 'center',
    render: (row: any) => h(NButton, {
      size: 'small',
      text: true,
      type: 'primary',
      onClick: () => openDetail(row.date, row.shop)
    }, { default: () => '详情', icon: () => h(NIcon, { component: EyeOutline, size: 14 }) })
  },
]

const detailColumns = [
  { title: '设备名称', key: 'name', minWidth: 200 },
  { title: '设备类型', key: 'type', width: 120, render: (row: any) => h(NTag, { size: 'small', bordered: true }, () => row.type) },
  {
    title: '在线时长',
    key: 'onlineHours',
    width: 120,
    align: 'center',
    render: (row: any) => h(NTag, {
      size: 'small',
      type: row.onlineHours >= 8 ? 'success' : row.onlineHours >= 5 ? 'warning' : 'error',
      bordered: true
    }, () => `${row.onlineHours}h`)
  },
]

function openDetail(date: string, shop: string) {
  currentDate.value = date
  currentDetailShop.value = shop
  showDetailModal.value = true
}
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }

.content-card { background: white; border-radius: 16px; padding: 24px; border: 1px solid var(--border-color); }
</style>
