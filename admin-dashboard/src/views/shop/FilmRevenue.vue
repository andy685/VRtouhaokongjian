<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>影片分成明细</h1>
      <n-space>
        <n-select v-model:value="filterShop" :options="shopOptions" size="small" style="width: 140px;" placeholder="所属店铺" clearable />
        <n-select v-model:value="filmType" :options="filmOptions" size="small" style="width: 120px;" />
        <n-date-picker type="daterange" clearable size="small" v-model:value="dateRange" />
        <n-button secondary @click="exportData">导出</n-button>
      </n-space>
    </div>

    <!-- 影片汇总 -->
    <n-card class="table-card" title="影片汇总" style="margin-bottom: 24px;">
      <n-data-table :columns="columns" :data="filteredData" :pagination="pagination" />
    </n-card>

    <!-- 播放明细 -->
    <div class="section-header">
      <h2>播放明细</h2>
    </div>
    <n-data-table
      :columns="detailColumns"
      :data="filteredDetailData"
      :pagination="{ pageSize: 15 }"
      :bordered="true"
      :single-line="false"
      size="small"
      @update:page="() => {}"
      :row-props="(row: PlayRecord) => ({ style: 'cursor: pointer;', onClick: () => openDetail(row) })"
    />

    <!-- 播放明细详情弹窗 -->
    <n-modal v-model:show="showDetailModal" preset="card" title="播放明细详情" style="width: 480px;" :bordered="false">
      <n-descriptions :column="1" label-placement="left" label-style="width: 100px; font-weight: 500;">
        <n-descriptions-item label="所属店铺">{{ detailRecord?.shop }}</n-descriptions-item>
        <n-descriptions-item label="影片名称">{{ detailRecord?.film }}</n-descriptions-item>
        <n-descriptions-item label="类型">
          <n-tag :type="detailRecord?.type === 'VR影片' ? 'info' : 'success'" size="small">
            {{ detailRecord?.type }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="设备">{{ detailRecord?.device }}</n-descriptions-item>
        <n-descriptions-item label="会员">{{ detailRecord?.member }}</n-descriptions-item>
        <n-descriptions-item label="播放时间">{{ detailRecord?.playTime }}</n-descriptions-item>
        <n-descriptions-item label="消耗游戏点">{{ detailRecord?.pointsConsumed }}</n-descriptions-item>
        <n-descriptions-item label="C端售价">¥{{ detailRecord?.salePrice?.toFixed(2) }}</n-descriptions-item>
        <n-descriptions-item label="利润">
          <span style="color: #10B981; font-weight: 500;">¥{{ detailRecord?.profit?.toFixed(2) }}</span>
        </n-descriptions-item>
      </n-descriptions>
      <template #footer>
        <n-space justify="center">
          <n-button @click="showDetailModal = false">关闭</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NCard, NDataTable, NButton, NSpace, NIcon, NDatePicker, NSelect, NTag,
  NModal, NDescriptions, NDescriptionsItem
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { FilmOutline, PlayCircleOutline, CashOutline, GameControllerOutline } from '@vicons/ionicons5'

interface FilmItem {
  id: number
  name: string
  type: string
  pointPrice: number
  plays: number
  pointsConsumed: number
  salePrice: number
  revenue: number
  profit: number
  status: string
  shop: string
}

interface PlayRecord {
  id: number
  shop: string
  film: string
  type: string
  device: string
  member: string
  playTime: string
  pointsConsumed: number
  salePrice: number
  profit: number
}

const shopOptions = [
  { label: '利民街小展厅', value: '利民街小展厅' },
  { label: '卓远萝岗区店', value: '卓远萝岗区店' },
  { label: '卓远萧山区店', value: '卓远萧山区店' },
  { label: '卓远亚运城店', value: '卓远亚运城店' },
  { label: '卓远文鼎路店', value: '卓远文鼎路店' },
]

const filterShop = ref<string | null>(null)
const filmType = ref<string | null>(null)
const filmOptions = [
  { label: '全部类型', value: null },
  { label: 'VR影片', value: 'VR影片' },
  { label: '互动影片', value: '互动影片' }
]
const dateRange = ref<[number, number] | null>(null)
const pagination = { pageSize: 10 }

// 影片汇总列
const columns: DataTableColumns<FilmItem> = [
  { title: '所属店铺', key: 'shop', width: 140, align: 'center' },
  { title: '影片名称', key: 'name', width: 180 },
  { title: '类型', key: 'type', width: 120, align: 'center', render: (row) =>
    h(NTag, { type: row.type === 'VR影片' ? 'info' : 'success', size: 'small' },
      { default: () => row.type })
  },
  { title: '单价（游戏点/次）', key: 'pointPrice', width: 140, align: 'center', render: (row) => `${row.pointPrice}` },
  { title: '播放次数', key: 'plays', width: 100, align: 'center' },
  { title: '消耗游戏点', key: 'pointsConsumed', width: 120, align: 'center', render: (row) => `${row.pointsConsumed.toLocaleString()}` },
  { title: 'C端售价', key: 'salePrice', width: 110, align: 'center', render: (row) => `¥${row.salePrice.toFixed(2)}` },
  { title: '商户收入', key: 'revenue', width: 120, align: 'center', render: (row) => `¥${row.revenue.toLocaleString()}` },
  { title: '利润', key: 'profit', width: 120, align: 'center', render: (row) =>
    h('span', { style: 'color: #10B981; font-weight: 500;' }, `¥${row.profit.toLocaleString()}`)
  },
  { title: '状态', key: 'status', width: 100, align: 'center', render: (row) =>
    h(NTag, { type: row.status === '上映中' ? 'success' : 'warning', size: 'small' },
      { default: () => row.status })
  }
]

// 播放明细列
const detailColumns: DataTableColumns<PlayRecord> = [
  { title: '所属店铺', key: 'shop', width: 140, align: 'center' },
  { title: '影片名称', key: 'film', minWidth: 160 },
  { title: '类型', key: 'type', width: 100, align: 'center', render: (row) =>
    h(NTag, { type: row.type === 'VR影片' ? 'info' : 'success', size: 'small' },
      { default: () => row.type })
  },
  { title: '设备', key: 'device', width: 150, align: 'center' },
  { title: '会员', key: 'member', width: 140, align: 'center' },
  { title: '播放时间', key: 'playTime', width: 160, align: 'center' },
  { title: '消耗游戏点', key: 'pointsConsumed', width: 110, align: 'center' },
  { title: 'C端售价', key: 'salePrice', width: 100, align: 'center', render: (row) => `¥${row.salePrice.toFixed(2)}` },
  { title: '利润', key: 'profit', width: 100, align: 'center', render: (row) =>
    h('span', { style: 'color: #10B981; font-weight: 500;' }, `¥${row.profit.toFixed(2)}`)
  },
]

// 影片汇总数据
const rawData = ref<FilmItem[]>([
  { id: 1, shop: '利民街小展厅', name: '星际探险家', type: 'VR影片', pointPrice: 10, plays: 286, pointsConsumed: 2860, salePrice: 35.00, revenue: 10010, profit: 7140, status: '上映中' },
  { id: 2, shop: '利民街小展厅', name: '深海大冒险', type: 'VR影片', pointPrice: 8, plays: 256, pointsConsumed: 2048, salePrice: 30.00, revenue: 7680, profit: 5208, status: '上映中' },
  { id: 3, shop: '卓远萝岗区店', name: '极限挑战', type: 'VR影片', pointPrice: 12, plays: 228, pointsConsumed: 2736, salePrice: 40.00, revenue: 9120, profit: 6384, status: '上映中' },
  { id: 4, shop: '卓远萧山区店', name: '太空漫游', type: '互动影片', pointPrice: 15, plays: 186, pointsConsumed: 2790, salePrice: 45.00, revenue: 8370, profit: 5580, status: '上映中' },
  { id: 5, shop: '卓远亚运城店', name: '丛林探秘', type: 'VR影片', pointPrice: 8, plays: 168, pointsConsumed: 1344, salePrice: 28.00, revenue: 4704, profit: 3360, status: '即将下映' },
  { id: 6, shop: '卓远文鼎路店', name: '恐龙世界', type: 'VR影片', pointPrice: 10, plays: 312, pointsConsumed: 3120, salePrice: 38.00, revenue: 11856, profit: 8736, status: '上映中' },
  { id: 7, shop: '利民街小展厅', name: '极速飞车', type: '互动影片', pointPrice: 12, plays: 145, pointsConsumed: 1740, salePrice: 32.00, revenue: 4640, profit: 2900, status: '上映中' },
  { id: 8, shop: '卓远萝岗区店', name: '深海探险', type: 'VR影片', pointPrice: 9, plays: 198, pointsConsumed: 1782, salePrice: 28.00, revenue: 5544, profit: 3762, status: '上映中' },
])

// 播放明细数据
const detailData = ref<PlayRecord[]>([
  { id: 1, shop: '利民街小展厅', film: '星际探险家', type: 'VR影片', device: '幻影飞碟', member: '散客', playTime: '2025-04-23 14:32:00', pointsConsumed: 10, salePrice: 35.00, profit: 25.00 },
  { id: 2, shop: '利民街小展厅', film: '星际探险家', type: 'VR影片', device: '幻影飞碟', member: '138****1234', playTime: '2025-04-23 14:28:00', pointsConsumed: 10, salePrice: 35.00, profit: 25.00 },
  { id: 3, shop: '利民街小展厅', film: '深海大冒险', type: 'VR影片', device: '暗黑机甲22版', member: '散客', playTime: '2025-04-23 13:15:00', pointsConsumed: 8, salePrice: 30.00, profit: 22.00 },
  { id: 4, shop: '卓远萝岗区店', film: '极限挑战', type: 'VR影片', device: '暗黑战场[主控端]', member: '139****5678', playTime: '2025-04-23 11:48:00', pointsConsumed: 12, salePrice: 40.00, profit: 28.00 },
  { id: 5, shop: '卓远萧山区店', film: '太空漫游', type: '互动影片', device: '悬浮骑兵', member: '散客', playTime: '2025-04-23 10:22:00', pointsConsumed: 15, salePrice: 45.00, profit: 30.00 },
  { id: 6, shop: '卓远亚运城店', film: '丛林探秘', type: 'VR影片', device: '幻影飞碟', member: '137****9012', playTime: '2025-04-23 09:55:00', pointsConsumed: 8, salePrice: 28.00, profit: 20.00 },
  { id: 7, shop: '卓远文鼎路店', film: '恐龙世界', type: 'VR影片', device: '暗黑机甲22版', member: '散客', playTime: '2025-04-22 16:45:00', pointsConsumed: 10, salePrice: 38.00, profit: 28.00 },
  { id: 8, shop: '卓远文鼎路店', film: '恐龙世界', type: 'VR影片', device: '暗黑机甲22版', member: '136****3456', playTime: '2025-04-22 14:30:00', pointsConsumed: 10, salePrice: 38.00, profit: 28.00 },
  { id: 9, shop: '利民街小展厅', film: '极速飞车', type: '互动影片', device: '悬浮骑兵', member: '散客', playTime: '2025-04-22 11:20:00', pointsConsumed: 12, salePrice: 32.00, profit: 20.00 },
  { id: 10, shop: '卓远萝岗区店', film: '深海探险', type: 'VR影片', device: '幻影飞碟', member: '138****7890', playTime: '2025-04-22 10:15:00', pointsConsumed: 9, salePrice: 28.00, profit: 19.00 },
  { id: 11, shop: '利民街小展厅', film: '星际探险家', type: 'VR影片', device: '幻影飞碟', member: '139****1111', playTime: '2025-04-21 15:30:00', pointsConsumed: 10, salePrice: 35.00, profit: 25.00 },
  { id: 12, shop: '卓远萧山区店', film: '太空漫游', type: '互动影片', device: '悬浮骑兵', member: '散客', playTime: '2025-04-21 13:10:00', pointsConsumed: 15, salePrice: 45.00, profit: 30.00 },
  { id: 13, shop: '卓远亚运城店', film: '丛林探秘', type: 'VR影片', device: '暗黑战场[主控端]', member: '135****2222', playTime: '2025-04-21 09:45:00', pointsConsumed: 8, salePrice: 28.00, profit: 20.00 },
  { id: 14, shop: '卓远文鼎路店', film: '恐龙世界', type: 'VR影片', device: '暗黑机甲22版', member: '散客', playTime: '2025-04-20 16:00:00', pointsConsumed: 10, salePrice: 38.00, profit: 28.00 },
  { id: 15, shop: '利民街小展厅', film: '深海大冒险', type: 'VR影片', device: '幻影飞碟', member: '137****3333', playTime: '2025-04-20 10:30:00', pointsConsumed: 8, salePrice: 30.00, profit: 22.00 },
])

const filteredData = computed(() => {
  let data = rawData.value
  if (filterShop.value) {
    data = data.filter(d => d.shop === filterShop.value)
  }
  if (filmType.value) {
    data = data.filter(d => d.type === filmType.value)
  }
  return data
})

const filteredDetailData = computed(() => {
  let data = detailData.value
  if (filterShop.value) {
    data = data.filter(d => d.shop === filterShop.value)
  }
  if (filmType.value) {
    data = data.filter(d => d.type === filmType.value)
  }
  return data
})

const stats = computed(() => {
  const data = filteredDetailData.value
  const filmSet = new Set(data.map(d => d.film))
  return {
    filmCount: filmSet.size,
    plays: data.length,
    pointsConsumed: data.reduce((sum, d) => sum + d.pointsConsumed, 0),
    profit: data.reduce((sum, d) => sum + d.profit, 0),
  }
})

const showDetailModal = ref(false)
const detailRecord = ref<PlayRecord | null>(null)

function openDetail(row: PlayRecord) {
  detailRecord.value = row
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
.stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-content { display: flex; flex-direction: column; gap: 4px; }
.stat-content .label { font-size: 13px; color: #666; }
.stat-content .value { font-size: 24px; font-weight: 600; color: #333; }
.stat-content .value.success { color: #10B981; }
.table-card { border-radius: 12px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-header h2 { font-size: 16px; font-weight: 600; color: #333; margin: 0; }
</style>
