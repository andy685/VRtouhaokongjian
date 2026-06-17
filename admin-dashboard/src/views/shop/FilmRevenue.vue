<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>内容消耗明细</h1>
      <n-space>
        <n-select v-model:value="filterShop" :options="shopOptions" size="small" style="width: 140px;" placeholder="所属店铺" clearable />
        <n-select v-model:value="gameType" :options="gameOptions" size="small" style="width: 120px;" />
        <n-date-picker type="daterange" clearable size="small" v-model:value="dateRange" />
        <n-button secondary @click="exportData">导出</n-button>
      </n-space>
    </div>

    <!-- 口径说明 -->
    <n-alert type="info" :show-icon="false" class="notice-bar">
      本页展示游戏运营数据（标价、游玩次数、总应收等），供游戏受欢迎程度及营收贡献分析使用。<br/>
      总应收 = 游玩次数 × C端标价（不含优惠券抵扣、会员折扣等，实际收入请查看
      <router-link to="/shop/channel-revenue" style="color:#3B82F6;font-weight:500;">渠道营收统计</router-link>
      和
      <router-link to="/shop/historical-revenue" style="color:#3B82F6;font-weight:500;">历史营收统计</router-link>）。
    </n-alert>

    <!-- 游戏汇总 -->
    <n-card class="table-card" title="游戏汇总" style="margin-bottom: 24px;">
      <n-data-table :columns="columns" :data="filteredData" :pagination="pagination" />
    </n-card>

    <!-- 游玩明细 -->
    <div class="section-header">
      <h2>游玩明细</h2>
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

    <!-- 游玩明细详情弹窗 -->
    <n-modal v-model:show="showDetailModal" preset="card" title="游玩明细详情" style="width: 420px;" :bordered="false">
      <n-descriptions :column="1" label-placement="left" label-style="width: 100px; font-weight: 500;">
        <n-descriptions-item label="所属店铺">{{ detailRecord?.shop }}</n-descriptions-item>
        <n-descriptions-item label="游戏名称">{{ detailRecord?.game }}</n-descriptions-item>
        <n-descriptions-item label="类型">
          <n-tag :type="detailRecord?.type === 'VR游戏' ? 'info' : 'success'" size="small">
            {{ detailRecord?.type }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="设备">{{ detailRecord?.device }}</n-descriptions-item>
        <n-descriptions-item label="会员">{{ detailRecord?.member }}</n-descriptions-item>
        <n-descriptions-item label="游玩时间">{{ detailRecord?.playTime }}</n-descriptions-item>
        <n-descriptions-item label="消耗游戏豆">{{ detailRecord?.pointsConsumed }}</n-descriptions-item>
        <n-descriptions-item label="C端标价">¥{{ detailRecord?.salePrice?.toFixed(2) }}</n-descriptions-item>
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
  NCard, NDataTable, NButton, NSpace, NDatePicker, NSelect, NTag,
  NModal, NDescriptions, NDescriptionsItem, NAlert
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'

interface GameItem {
  id: number
  name: string
  type: string
  pointPrice: number       // 游戏豆/次
  plays: number            // 游玩次数
  pointsConsumed: number   // 消耗游戏豆合计
  salePrice: number        // C端标价
  totalRevenue: number     // 总应收 = plays × salePrice
  shop: string
}

interface PlayRecord {
  id: number
  shop: string
  game: string
  type: string
  device: string
  member: string
  playTime: string
  pointsConsumed: number
  salePrice: number        // C端标价
}

const shopOptions = [
  { label: '利民街小展厅', value: '利民街小展厅' },
  { label: '卓远萝岗区店', value: '卓远萝岗区店' },
  { label: '卓远萧山区店', value: '卓远萧山区店' },
  { label: '卓远亚运城店', value: '卓远亚运城店' },
  { label: '卓远文鼎路店', value: '卓远文鼎路店' },
]

const filterShop = ref<string | null>(null)
const gameType = ref<string | null>(null)
const gameOptions = [
  { label: '全部类型', value: null },
  { label: 'VR游戏', value: 'VR游戏' },
  { label: '互动游戏', value: '互动游戏' }
]
const dateRange = ref<[number, number] | null>(null)
const pagination = { pageSize: 10 }

// ==================== 游戏汇总 ====================

const columns: DataTableColumns<GameItem> = [
  { title: '所属店铺', key: 'shop', width: 140, align: 'center' },
  { title: '游戏名称', key: 'name', width: 180 },
  { title: '类型', key: 'type', width: 100, align: 'center', render: (row) =>
    h(NTag, { type: row.type === 'VR游戏' ? 'info' : 'success', size: 'small' },
      { default: () => row.type })
  },
  { title: '单价（豆/次）', key: 'pointPrice', width: 120, align: 'center' },
  { title: '游玩次数', key: 'plays', width: 100, align: 'center' },
  { title: '消耗游戏豆', key: 'pointsConsumed', width: 120, align: 'center', render: (row) => `${row.pointsConsumed.toLocaleString()}` },
  { title: 'C端标价', key: 'salePrice', width: 100, align: 'center', render: (row) => `¥${row.salePrice.toFixed(2)}` },
  { title: '总应收', key: 'totalRevenue', width: 120, align: 'center', render: (row) =>
    h('span', { style: 'color: #10B981; font-weight: 500;' }, `¥${row.totalRevenue.toLocaleString()}`)
  },
]

// 游戏运营数据：总应收 = plays × salePrice
const rawData = ref<GameItem[]>([
  { id: 1, shop: '利民街小展厅', name: '节奏光剑', type: 'VR游戏', pointPrice: 10, plays: 286, pointsConsumed: 2860, salePrice: 35.00, totalRevenue: 286 * 35 },
  { id: 2, shop: '利民街小展厅', name: '半衰期：爱莉克斯', type: 'VR游戏', pointPrice: 8, plays: 256, pointsConsumed: 2048, salePrice: 30.00, totalRevenue: 256 * 30 },
  { id: 3, shop: '卓远萝岗区店', name: '超级热', type: 'VR游戏', pointPrice: 12, plays: 228, pointsConsumed: 2736, salePrice: 40.00, totalRevenue: 228 * 40 },
  { id: 4, shop: '卓远萧山区店', name: '渔夫的故事', type: '互动游戏', pointPrice: 15, plays: 186, pointsConsumed: 2790, salePrice: 45.00, totalRevenue: 186 * 45 },
  { id: 5, shop: '卓远亚运城店', name: '亚利桑那阳光', type: 'VR游戏', pointPrice: 8, plays: 168, pointsConsumed: 1344, salePrice: 28.00, totalRevenue: 168 * 28 },
  { id: 6, shop: '卓远文鼎路店', name: '工作模拟器', type: 'VR游戏', pointPrice: 10, plays: 312, pointsConsumed: 3120, salePrice: 38.00, totalRevenue: 312 * 38 },
  { id: 7, shop: '利民街小展厅', name: '虚拟虚拟现实', type: '互动游戏', pointPrice: 12, plays: 145, pointsConsumed: 1740, salePrice: 32.00, totalRevenue: 145 * 32 },
  { id: 8, shop: '卓远萝岗区店', name: '行尸走肉：圣徒与罪人', type: 'VR游戏', pointPrice: 9, plays: 198, pointsConsumed: 1782, salePrice: 28.00, totalRevenue: 198 * 28 },
])

// ==================== 游玩明细 ====================

const detailColumns: DataTableColumns<PlayRecord> = [
  { title: '所属店铺', key: 'shop', width: 140, align: 'center' },
  { title: '游戏名称', key: 'game', minWidth: 160 },
  { title: '类型', key: 'type', width: 100, align: 'center', render: (row) =>
    h(NTag, { type: row.type === 'VR游戏' ? 'info' : 'success', size: 'small' },
      { default: () => row.type })
  },
  { title: '设备', key: 'device', width: 150, align: 'center' },
  { title: '会员', key: 'member', width: 140, align: 'center' },
  { title: '游玩时间', key: 'playTime', width: 160, align: 'center' },
  { title: '消耗游戏豆', key: 'pointsConsumed', width: 110, align: 'center' },
  { title: 'C端标价', key: 'salePrice', width: 100, align: 'center', render: (row) => `¥${row.salePrice.toFixed(2)}` },
]

// 单次游玩记录
const detailData = ref<PlayRecord[]>([
  { id: 1, shop: '利民街小展厅', game: '节奏光剑', type: 'VR游戏', device: '幻影飞碟', member: '散客', playTime: '2025-04-23 14:32:00', pointsConsumed: 10, salePrice: 35.00 },
  { id: 2, shop: '利民街小展厅', game: '节奏光剑', type: 'VR游戏', device: '幻影飞碟', member: '138****1234', playTime: '2025-04-23 14:28:00', pointsConsumed: 10, salePrice: 35.00 },
  { id: 3, shop: '利民街小展厅', game: '半衰期：爱莉克斯', type: 'VR游戏', device: '暗黑机甲22版', member: '散客', playTime: '2025-04-23 13:15:00', pointsConsumed: 8, salePrice: 30.00 },
  { id: 4, shop: '卓远萝岗区店', game: '超级热', type: 'VR游戏', device: '暗黑战场[主控端]', member: '139****5678', playTime: '2025-04-23 11:48:00', pointsConsumed: 12, salePrice: 40.00 },
  { id: 5, shop: '卓远萧山区店', game: '渔夫的故事', type: '互动游戏', device: '悬浮骑兵', member: '散客', playTime: '2025-04-23 10:22:00', pointsConsumed: 15, salePrice: 45.00 },
  { id: 6, shop: '卓远亚运城店', game: '亚利桑那阳光', type: 'VR游戏', device: '幻影飞碟', member: '137****9012', playTime: '2025-04-23 09:55:00', pointsConsumed: 8, salePrice: 28.00 },
  { id: 7, shop: '卓远文鼎路店', game: '工作模拟器', type: 'VR游戏', device: '暗黑机甲22版', member: '散客', playTime: '2025-04-22 16:45:00', pointsConsumed: 10, salePrice: 38.00 },
  { id: 8, shop: '卓远文鼎路店', game: '工作模拟器', type: 'VR游戏', device: '暗黑机甲22版', member: '136****3456', playTime: '2025-04-22 14:30:00', pointsConsumed: 10, salePrice: 38.00 },
  { id: 9, shop: '利民街小展厅', game: '虚拟虚拟现实', type: '互动游戏', device: '悬浮骑兵', member: '散客', playTime: '2025-04-22 11:20:00', pointsConsumed: 12, salePrice: 32.00 },
  { id: 10, shop: '卓远萝岗区店', game: '行尸走肉：圣徒与罪人', type: 'VR游戏', device: '幻影飞碟', member: '138****7890', playTime: '2025-04-22 10:15:00', pointsConsumed: 9, salePrice: 28.00 },
  { id: 11, shop: '利民街小展厅', game: '节奏光剑', type: 'VR游戏', device: '幻影飞碟', member: '139****1111', playTime: '2025-04-21 15:30:00', pointsConsumed: 10, salePrice: 35.00 },
  { id: 12, shop: '卓远萧山区店', game: '渔夫的故事', type: '互动游戏', device: '悬浮骑兵', member: '散客', playTime: '2025-04-21 13:10:00', pointsConsumed: 15, salePrice: 45.00 },
  { id: 13, shop: '卓远亚运城店', game: '亚利桑那阳光', type: 'VR游戏', device: '暗黑战场[主控端]', member: '135****2222', playTime: '2025-04-21 09:45:00', pointsConsumed: 8, salePrice: 28.00 },
  { id: 14, shop: '卓远文鼎路店', game: '工作模拟器', type: 'VR游戏', device: '暗黑机甲22版', member: '散客', playTime: '2025-04-20 16:00:00', pointsConsumed: 10, salePrice: 38.00 },
  { id: 15, shop: '利民街小展厅', game: '半衰期：爱莉克斯', type: 'VR游戏', device: '幻影飞碟', member: '137****3333', playTime: '2025-04-20 10:30:00', pointsConsumed: 8, salePrice: 30.00 },
])

// ==================== 筛选 & 交互 ====================

const filteredData = computed(() => {
  let data = rawData.value
  if (filterShop.value) data = data.filter(d => d.shop === filterShop.value)
  if (gameType.value) data = data.filter(d => d.type === gameType.value)
  return data
})

const filteredDetailData = computed(() => {
  let data = detailData.value
  if (filterShop.value) data = data.filter(d => d.shop === filterShop.value)
  if (gameType.value) data = data.filter(d => d.type === gameType.value)
  return data
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
.notice-bar { margin-bottom: 20px; font-size: 13px; line-height: 1.8; }
.table-card { border-radius: 12px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-header h2 { font-size: 16px; font-weight: 600; color: #333; margin: 0; }
</style>
