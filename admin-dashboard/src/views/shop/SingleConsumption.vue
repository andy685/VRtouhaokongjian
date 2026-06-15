<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>单次消费项目</h1>
        <p class="header-desc">按游戏设置各门店售价，商家未自定义时使用预设价格</p>
      </div>
      <n-space>
        <n-select v-model:value="filterShop" :options="shopFilterOptions" placeholder="全部店铺" size="small" style="width: 160px;" clearable />
        <n-input placeholder="搜索游戏名称..." size="small" style="width: 180px;" v-model:value="filterKeyword">
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
        <n-button size="small" secondary @click="showBatchModal = true">批量设置价格</n-button>
      </n-space>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB)">
          <n-icon :component="GameControllerOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">游戏总数</span>
          <span class="value">{{ gameList.length }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669)">
          <n-icon :component="CheckmarkCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">已定价</span>
          <span class="value">{{ pricedCount }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706)">
          <n-icon :component="WarningOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">待定价</span>
          <span class="value warning">{{ unpricedCount }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #EF4444, #DC2626)">
          <n-icon :component="CloseCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">已失效</span>
          <span class="value error">{{ invalidCount }}</span>
        </div>
      </div>
    </div>

    <!-- 主表格 -->
    <n-card class="table-card">
      <n-tabs type="line" v-model:value="activeTab">
        <n-tab name="all">全部游戏</n-tab>
        <n-tab name="priced">已定价</n-tab>
        <n-tab name="unpriced">待定价</n-tab>
        <n-tab name="invalid">已失效</n-tab>
      </n-tabs>
      <n-data-table :columns="columns" :data="filteredData" :pagination="pagination" striped :row-class-name="getRowClass" />
    </n-card>

    <!-- 定价弹窗 -->
    <n-modal v-model:show="showPriceModal" preset="card" :title="priceModalTitle" style="width: 680px;" :bordered="false">
      <div class="price-modal-info">
        <div class="info-item">
          <span class="info-label">游戏预设价</span>
          <span class="info-value price-preset" v-if="priceForm.presetPrice">¥{{ priceForm.presetPrice?.toFixed(2) }}/次</span>
          <n-tag v-else type="warning" size="small" :bordered="false">未设置</n-tag>
        </div>
      </div>

      <div class="pricing-table">
        <div class="pricing-table-header">
          <span class="col-shop">店铺</span>
          <span class="col-price">销售单价</span>
          <span class="col-status">上架</span>
          <span class="col-quick">快捷操作</span>
        </div>
        <div v-for="shop in shopOptions" :key="shop.value" class="pricing-row" :class="{ 'has-price': priceForm.shopPrices[shop.value] !== null }">
          <span class="col-shop">{{ shop.label }}</span>
          <span class="col-price">
            <n-input-number
              v-model:value="priceForm.shopPrices[shop.value]"
              :min="0"
              :precision="2"
              size="small"
              style="width: 140px;"
              :placeholder="priceForm.presetPrice ? `预设 ¥${priceForm.presetPrice}` : '请输入价格'"
            >
              <template #suffix>元/次</template>
            </n-input-number>
          </span>
          <span class="col-status">
            <n-switch v-model:value="priceForm.shopActive[shop.value]" :disabled="priceForm.shopPrices[shop.value] === null" size="small" />
            <span class="status-text" :class="{ inactive: !priceForm.shopActive[shop.value] }">
              {{ priceForm.shopPrices[shop.value] === null ? '—' : (priceForm.shopActive[shop.value] ? '上架' : '下架') }}
            </span>
          </span>
          <span class="col-quick">
            <n-button size="tiny" text type="primary" @click.stop="priceForm.shopPrices[shop.value] = priceForm.presetPrice; priceForm.shopActive[shop.value] = true" :disabled="!priceForm.presetPrice">
              使用预设价
            </n-button>
          </span>
        </div>
      </div>

      <n-divider style="margin: 16px 0;" />

      <n-space>
        <n-button size="small" secondary @click="applyPresetToAll" :disabled="!priceForm.presetPrice">
          全部使用预设价
        </n-button>
        <n-button size="small" secondary @click="clearAllPrices">
          清空定价
        </n-button>
        <n-button size="small" text type="primary" @click="toggleAllActive(true)" :disabled="!hasAnyPrice">
          全部上架
        </n-button>
        <n-button size="small" text @click="toggleAllActive(false)" :disabled="!hasAnyPrice">
          全部下架
        </n-button>
      </n-space>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showPriceModal = false">取消</n-button>
          <n-button type="primary" @click="handlePriceSubmit">保存</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 批量定价弹窗 -->
    <n-modal v-model:show="showBatchModal" preset="card" title="统一设置价格" style="width: 640px;" :bordered="false">
      <n-form label-placement="left" label-width="100px">
        <n-form-item label="适用店铺">
          <n-checkbox-group v-model:value="batchShops">
            <n-space>
              <n-checkbox v-for="shop in shopOptions" :key="shop.value" :value="shop.value" :label="shop.label" />
            </n-space>
          </n-checkbox-group>
          <div style="margin-top: 4px;">
            <n-button text size="tiny" type="primary" @click="batchShops = shopOptions.map(s => s.value)">全选</n-button>
            <n-button text size="tiny" style="margin-left: 8px;" @click="batchShops = []">清空</n-button>
          </div>
        </n-form-item>
        <n-form-item label="适用游戏">
          <n-select v-model:value="batchGames" :options="batchGameOptions" multiple filterable placeholder="选择游戏（不选则全部适用）" />
        </n-form-item>
        <n-form-item label="价格策略">
          <n-radio-group v-model:value="batchPriceMode">
            <n-space vertical style="gap: 8px;">
              <n-radio value="fixed">统一售价 <n-input-number v-if="batchPriceMode === 'fixed'" v-model:value="batchFixedPrice" :min="0" :precision="2" size="small" style="width: 120px; margin-left: 8px;"><template #suffix>元/次</template></n-input-number></n-radio>
              <n-radio value="preset">使用游戏预设价格（未设预设的游戏将被跳过）</n-radio>
              <n-radio value="presetPlus">预设价格基础上调 <n-input-number v-if="batchPriceMode === 'presetPlus'" v-model:value="batchAdjustAmount" :min="-999" :max="999" :precision="2" size="small" style="width: 100px; margin-left: 8px;"><template #suffix>元</template></n-input-number></n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
      </n-form>
      <n-alert v-if="batchPreview.length" type="info" :bordered="false" style="margin-top: 12px;">
        <div v-for="item in batchPreview.slice(0, 5)" :key="item.name" style="font-size: 12px; line-height: 1.8;">
          {{ item.name }}：<strong>{{ item.oldPrice === null ? '未定价' : '¥' + item.oldPrice?.toFixed(2) }}</strong> → <strong style="color: #10b981;">¥{{ item.newPrice?.toFixed(2) }}</strong>
        </div>
        <span v-if="batchPreview.length > 5" style="font-size: 11px; color: #999;">...等共 {{ batchPreview.length }} 个游戏</span>
      </n-alert>
      <template #footer>
        <n-space justify="center">
          <n-button @click="showBatchModal = false">取消</n-button>
          <n-button type="primary" @click="handleBatchSubmit">批量应用</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NCard, NDataTable, NButton, NSpace, NInput, NIcon, NModal,
  NInputNumber, NTabs, NTab, NTag,
  NSelect, NCheckbox, NCheckboxGroup, NRadio, NRadioGroup, NAlert,
  NDivider, NSwitch
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import {
  SearchOutline, GameControllerOutline,
  CheckmarkCircleOutline, WarningOutline, CloseCircleOutline
} from '@vicons/ionicons5'

const activeTab = ref('all')
const showPriceModal = ref(false)
const showBatchModal = ref(false)
const isEdit = ref(false)
const filterShop = ref<string | null>(null)
const filterKeyword = ref('')

const priceModalTitle = ref('设置游戏价格')
const pagination = { pageSize: 10 }

// ----- 店铺数据 -----
const shopOptions = [
  { label: '卓远亚运城店', value: 'shop1' },
  { label: '卓远天河路店', value: 'shop2' },
  { label: '卓远北京路店', value: 'shop3' }
]
const shopFilterOptions = [
  { label: '全部店铺', value: '' },
  ...shopOptions
]

// ----- 设备数据 -----
const deviceOptions = [
  { id: 'dev1', name: 'VR过山车（A01）', shop: 'shop1', games: [1, 3, 6] },
  { id: 'dev2', name: '暗黑战车（A02）', shop: 'shop1', games: [2, 4, 6] },
  { id: 'dev3', name: '星际穿越（A03）', shop: 'shop2', games: [1, 2, 5] },
  { id: 'dev4', name: '梦幻海洋（B01）', shop: 'shop2', games: [3, 4, 7] },
  { id: 'dev5', name: '极速摩托（B02）', shop: 'shop3', games: [1, 2, 3] },
  { id: 'dev6', name: '太空舱（C01）', shop: 'shop3', games: [4, 6, 8] },
  { id: 'dev7', name: '深海探险（D01）', shop: 'shop1', games: [7, 8] },
  { id: 'dev8', name: '飞行影院（E01）', shop: 'shop2', games: [5, 8] },
]

// 获取某游戏在某店铺的设备列表
function getDevicesForGameShop(gameId: number, shopId: string) {
  return deviceOptions.filter(d => d.shop === shopId && d.games.includes(gameId))
}

// 获取某游戏的全局设备列表
function getDevicesForGame(gameId: number) {
  return deviceOptions.filter(d => d.games.includes(gameId))
}

// ----- 游戏库数据（来自平台游戏库） -----
const gameLibrary = ref([
  { id: 1, name: '过山车VR', cover: createGameCover('#0ea5e9', '#2563eb', '过山车'), presetPrice: 38, duration: 10, tags: ['刺激', '热门'], consumptionSortOrder: 1 },
  { id: 2, name: '恐怖医院', cover: createGameCover('#111827', '#374151', '恐怖'), presetPrice: 48, duration: 15, tags: ['恐怖', '成人'], consumptionSortOrder: 2 },
  { id: 3, name: '极速赛车', cover: createGameCover('#7c3aed', '#4f46e5', '赛车'), presetPrice: 30, duration: 8, tags: ['竞速', '热门'], consumptionSortOrder: 3 },
  { id: 4, name: '海洋世界', cover: createGameCover('#06b6d4', '#0891b2', '海洋'), presetPrice: 25, duration: 20, tags: ['科普', '亲子'], consumptionSortOrder: 4 },
  { id: 5, name: '恐龙王国', cover: createGameCover('#16a34a', '#15803d', '恐龙'), presetPrice: null, duration: 12, tags: ['冒险', '亲子'], consumptionSortOrder: 5 },
  { id: 6, name: 'CS对战', cover: createGameCover('#f97316', '#ea580c', 'CS'), presetPrice: 58, duration: 30, tags: ['射击', '竞技'], consumptionSortOrder: 6 },
  { id: 7, name: '音乐节VR', cover: createGameCover('#ec4899', '#be185d', '音乐'), presetPrice: 22, duration: 25, tags: ['音乐', '休闲'], consumptionSortOrder: 7 },
  { id: 8, name: '太空漫步', cover: createGameCover('#0c3483', '#a2b6df', '太空'), presetPrice: 35, duration: 18, tags: ['科幻', '探索'], consumptionSortOrder: 8 },
])

// ----- 商家定价数据（key: gameId_shopId） -----
const pricingMap = ref<Record<string, { price: number; active: boolean }>>({
  '1_shop1': { price: 38, active: true },
  '1_shop2': { price: 40, active: true },
  '1_shop3': { price: 38, active: true },
  '2_shop1': { price: 48, active: true },
  '2_shop2': { price: 50, active: true },
  '3_shop1': { price: 30, active: true },
  '3_shop3': { price: 28, active: true },
  '4_shop1': { price: 25, active: true },
  '4_shop2': { price: 25, active: true },
  '4_shop3': { price: 22, active: false },
  '6_shop1': { price: 58, active: true },
  '6_shop2': { price: 60, active: true },
  '8_shop3': { price: 35, active: true },
})

// 已失效的项目（游戏已移除，但之前设置过价格）
const invalidItems = ref([
  { id: 'old_1', gameId: 99, gameName: '深海探险（已下架）', shop: 'shop1', shopName: '卓远亚运城店', price: 20 },
  { id: 'old_2', gameId: 100, gameName: '飞行模拟（已移除）', shop: 'shop3', shopName: '卓远北京路店', price: 45 },
])

// ----- 计算属性 -----
const gameList = computed(() => {
  return gameLibrary.value.map(game => {
    const pricingEntries: { shop: string; shopName: string; price: number | null; active: boolean; devices: { id: string; name: string }[] }[] = []

    shopOptions.forEach(shop => {
      const key = `${game.id}_${shop.value}`
      const pricing = pricingMap.value[key]
      const devices = getDevicesForGameShop(game.id, shop.value)
      pricingEntries.push({
        shop: shop.value,
        shopName: shop.label,
        price: pricing?.price ?? null,
        active: pricing?.active ?? false,
        devices: devices.map(d => ({ id: d.id, name: d.name }))
      })
    })

    const effectivePrice = filterShop.value
      ? pricingEntries.find(e => e.shop === filterShop.value)?.price ?? game.presetPrice
      : null

    const allDevices = getDevicesForGame(game.id)

    return {
      ...game,
      pricingEntries,
      effectivePrice,
      allDevices,
      isPriced: pricingEntries.some(e => e.price !== null),
      isFullyPriced: pricingEntries.every(e => e.price !== null),
    }
  })
})

const pricedCount = computed(() => gameList.value.filter(g => g.isPriced).length)
const unpricedCount = computed(() => gameList.value.filter(g => !g.isPriced).length)
const invalidCount = computed(() => invalidItems.value.length)

const filteredData = computed(() => {
  if (activeTab.value === 'invalid') return invalidItems.value

  let data = gameList.value
  if (activeTab.value === 'priced') data = data.filter(g => g.isPriced)
  if (activeTab.value === 'unpriced') data = data.filter(g => !g.isPriced)
  if (filterKeyword.value) {
    const kw = filterKeyword.value.toLowerCase()
    data = data.filter(g => g.name.toLowerCase().includes(kw))
  }
  return data
})

// ----- 表格列定义 -----
const columns: DataTableColumns = computed(() => {
  if (activeTab.value === 'invalid') return invalidColumns

  const baseColumns: DataTableColumns = [
    {
      title: '封面', key: 'cover', width: 80, render: (row: any) => h('img', {
        src: row.cover,
        style: 'width:52px;height:52px;object-fit:cover;border-radius:8px;border:1px solid #e5e7eb;background:#f8fafc;'
      })
    },
    { title: '游戏名称', key: 'name', width: 140, sorter: (a: any, b: any) => a.name.localeCompare(b.name, 'zh'), render: (row: any) => h('div', { style: 'font-weight:600;' }, row.name) },
  ]

  // 如果筛选了店铺，显示该店铺价格
  if (filterShop.value) {
    baseColumns.push({
      title: '预设价格', key: 'presetPrice', width: 100, align: 'center',
      sorter: (a: any, b: any) => (a.presetPrice ?? -1) - (b.presetPrice ?? -1),
      render: (row: any) => row.presetPrice ? `¥${row.presetPrice.toFixed(2)}` : h(NTag, { type: 'warning', size: 'tiny' }, { default: () => '未设' })
    })
    baseColumns.push({
      title: '店铺售价', key: 'shopPrice', width: 120, align: 'center',
      sorter: (a: any, b: any) => {
        const ea = a.pricingEntries.find((e: any) => e.shop === filterShop.value)
        const eb = b.pricingEntries.find((e: any) => e.shop === filterShop.value)
        return (ea?.price ?? -1) - (eb?.price ?? -1)
      },
      render: (row: any) => {
        const entry = row.pricingEntries.find((e: any) => e.shop === filterShop.value)
        if (!entry || entry.price === null) {
          return h(NTag, { type: 'warning', size: 'small', bordered: true }, { default: () => '待定价' })
        }
        return h('span', { style: `font-weight:600;color:${entry.active ? '#10b981' : '#94a3b8'};` }, `¥${entry.price.toFixed(2)}`)
      }
    })
    baseColumns.push({
      title: '状态', key: 'shopStatus', width: 80, align: 'center',
      render: (row: any) => {
        const entry = row.pricingEntries.find((e: any) => e.shop === filterShop.value)
        if (!entry || entry.price === null) return '-'
        return h(NTag, { type: entry.active ? 'success' : 'warning', size: 'small' }, { default: () => entry.active ? '上架' : '下架' })
      }
    })
  } else {
    // 未筛选店铺时，显示各店铺定价状态
    baseColumns.push({
      title: '预设价格', key: 'presetPrice', width: 100, align: 'center',
      sorter: (a: any, b: any) => (a.presetPrice ?? -1) - (b.presetPrice ?? -1),
      render: (row: any) => row.presetPrice ? `¥${row.presetPrice.toFixed(2)}` : h(NTag, { type: 'warning', size: 'tiny' }, { default: () => '未设' })
    })
    baseColumns.push({
      title: '定价状态', key: 'priceStatus', width: 180,
      render: (row: any) => {
        const tags: any[] = []
        row.pricingEntries.forEach((entry: any) => {
          if (entry.price !== null) {
            tags.push(h(NTag, { type: entry.active ? 'success' : 'warning', size: 'tiny', style: 'margin:2px;' }, { default: () => `${entry.shopName.slice(2)} ¥${entry.price}` }))
          } else {
            tags.push(h(NTag, { type: 'default', size: 'tiny', style: 'margin:2px;' }, { default: () => `${entry.shopName.slice(2)} 未设` }))
          }
        })
        return h('div', { style: 'display:flex;flex-wrap:wrap;gap:2px;' }, tags)
      }
    })
  }

  // 关联设备
  baseColumns.push({
    title: '关联设备', key: 'devices', minWidth: 160,
    render: (row: any) => {
      if (row.allDevices.length === 0) return h('span', { style: 'color:#94a3b8;font-size:12px;' }, '暂无设备')
      const deviceTags = row.allDevices.map((d: any) =>
        h(NTag, { type: 'info', size: 'tiny', style: 'margin:2px;' }, { default: () => d.name })
      )
      return h('div', { style: 'display:flex;flex-wrap:wrap;gap:2px;' }, deviceTags)
    }
  })

  baseColumns.push({
    title: '排序号', key: 'consumptionSortOrder', width: 80, align: 'center',
    sorter: (a: any, b: any) => (a.consumptionSortOrder ?? 999) - (b.consumptionSortOrder ?? 999),
    render: (row: any) => {
      return h(NInputNumber, {
        value: row.consumptionSortOrder,
        min: 1,
        max: 999,
        size: 'tiny',
        style: 'width:70px;',
        placeholder: '序号',
        onUpdateValue: (v: number | null) => {
          if (v !== null) {
            const game = gameLibrary.value.find(g => g.id === row.id)
            if (game) (game as any).consumptionSortOrder = v
          }
        }
      })
    }
  })

  baseColumns.push({
    title: '操作', key: 'actions', width: 90, align: 'center', render: (row: any) => {
      return h(NButton, { size: 'tiny', quaternary: true, type: 'primary', onClick: () => openPriceModal(row) },
        { default: () => '设置价格' }
      )
    }
  })

  return baseColumns
})

const invalidColumns: DataTableColumns = [
  { title: '游戏名称', key: 'gameName', width: 180, render: (row: any) => h('span', { style: 'color:#ef4444;text-decoration:line-through;' }, row.gameName) },
  { title: '原定价店铺', key: 'shopName', width: 140 },
  { title: '原售价', key: 'price', width: 100, align: 'center', render: (row: any) => `¥${row.price.toFixed(2)}` },
  { title: '状态', key: 'status', width: 100, align: 'center', render: () => h(NTag, { type: 'error', size: 'small' }, { default: () => '已失效' }) },
  { title: '操作', key: 'actions', width: 80, align: 'center', render: (row: any) => {
    return h(NButton, { size: 'tiny', quaternary: true, type: 'error', onClick: () => removeInvalid(row.id) }, { default: () => '移除' })
  }}
]

// ----- 定价弹窗表单 -----
const priceForm = ref({
  gameId: null as number | null,
  gameName: '',
  presetPrice: null as number | null,
  shopPrices: {} as Record<string, number | null>,
  shopActive: {} as Record<string, boolean>,
})

const hasAnyPrice = computed(() =>
  Object.values(priceForm.value.shopPrices).some(v => v !== null)
)

function openPriceModal(game: any) {
  isEdit.value = true
  priceModalTitle.value = `店铺定价 - ${game.name}`

  const shopPrices: Record<string, number | null> = {}
  const shopActive: Record<string, boolean> = {}

  shopOptions.forEach(shop => {
    const entry = game.pricingEntries.find((e: any) => e.shop === shop.value)
    shopPrices[shop.value] = entry?.price ?? null
    shopActive[shop.value] = entry?.active ?? true
  })

  priceForm.value = {
    gameId: game.id,
    gameName: game.name,
    presetPrice: game.presetPrice,
    shopPrices,
    shopActive,
  }
  showPriceModal.value = true
}

function applyPresetToAll() {
  shopOptions.forEach(shop => {
    priceForm.value.shopPrices[shop.value] = priceForm.value.presetPrice
    priceForm.value.shopActive[shop.value] = true
  })
}

function clearAllPrices() {
  shopOptions.forEach(shop => {
    priceForm.value.shopPrices[shop.value] = null
  })
}

function toggleAllActive(active: boolean) {
  shopOptions.forEach(shop => {
    if (priceForm.value.shopPrices[shop.value] !== null) {
      priceForm.value.shopActive[shop.value] = active
    }
  })
}

function handlePriceSubmit() {
  const gameId = priceForm.value.gameId
  if (!gameId) return

  // 清除该游戏的所有旧定价
  shopOptions.forEach(shop => {
    const key = `${gameId}_${shop.value}`
    delete pricingMap.value[key]
  })

  // 设置新定价：只有填了价格的店铺才写入
  shopOptions.forEach(shop => {
    const price = priceForm.value.shopPrices[shop.value]
    if (price !== null && price !== undefined) {
      pricingMap.value[`${gameId}_${shop.value}`] = {
        price,
        active: priceForm.value.shopActive[shop.value] ?? true
      }
    }
  })

  showPriceModal.value = false
}

// ----- 批量定价逻辑 -----
const batchShops = ref<string[]>([...shopOptions.map(s => s.value)])
const batchGames = ref<number[]>([])
const batchPriceMode = ref('fixed')
const batchFixedPrice = ref<number | null>(null)
const batchAdjustAmount = ref(0)

const batchGameOptions = computed(() => gameLibrary.value.map(g => ({ label: g.name, value: g.id })))

const batchPreview = computed(() => {
  if (!batchShops.value.length) return []
  const targetGames = batchGames.value.length ? gameLibrary.value.filter(g => batchGames.value.includes(g.id)) : gameLibrary.value

  return targetGames.map(game => {
    const firstShop = batchShops.value[0]
    const oldEntry = pricingMap.value[`${game.id}_${firstShop}`]
    const oldPrice = oldEntry?.price ?? null

    let newPrice: number | null = null
    if (batchPriceMode.value === 'fixed' && batchFixedPrice.value !== null) {
      newPrice = batchFixedPrice.value
    } else if (batchPriceMode.value === 'preset') {
      newPrice = game.presetPrice
    } else if (batchPriceMode.value === 'presetPlus' && game.presetPrice !== null) {
      newPrice = game.presetPrice + batchAdjustAmount.value
    }
    return { name: game.name, oldPrice, newPrice }
  }).filter(item => item.newPrice !== null)
})

function handleBatchSubmit() {
  const targetGames = batchGames.value.length ? gameLibrary.value.filter(g => batchGames.value.includes(g.id)) : gameLibrary.value

  targetGames.forEach(game => {
    batchShops.value.forEach(shopId => {
      let newPrice: number | null = null
      if (batchPriceMode.value === 'fixed' && batchFixedPrice.value !== null) {
        newPrice = batchFixedPrice.value
      } else if (batchPriceMode.value === 'preset') {
        newPrice = game.presetPrice
      } else if (batchPriceMode.value === 'presetPlus' && game.presetPrice !== null) {
        newPrice = game.presetPrice + batchAdjustAmount.value
      }
      if (newPrice !== null) {
        pricingMap.value[`${game.id}_${shopId}`] = { price: newPrice, active: true }
      }
    })
  })

  showBatchModal.value = false
  batchGames.value = []
  batchFixedPrice.value = null
}

// ----- 操作 -----
function removeInvalid(id: string) {
  const idx = invalidItems.value.findIndex(item => item.id === id)
  if (idx > -1) invalidItems.value.splice(idx, 1)
}

function getRowClass(row: any) {
  if (activeTab.value === 'invalid') return ''
  if (row.isFullyPriced) return 'row-priced'
  if (!row.isPriced) return 'row-unpriced'
  return 'row-partial'
}

// ----- 封面生成工具 -----
function createGameCover(from: string, to: string, text: string) {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${from}"/><stop offset="100%" stop-color="${to}"/></linearGradient></defs><rect width="160" height="160" rx="12" fill="url(#g)"/><rect x="22" y="22" width="116" height="116" rx="14" fill="rgba(255,255,255,0.14)"/><text x="80" y="86" text-anchor="middle" font-size="20" font-weight="700" fill="#fff">${text}</text></svg>`)}`
}
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h1 { font-size: 20px; font-weight: 600; color: #333; margin: 0; }
.header-desc { font-size: 13px; color: #999; margin-top: 4px; display: block; }

/* 统计卡片 */
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: white; border-radius: 14px; padding: 18px; border: 1px solid #e8e8e8; display: flex; align-items: center; gap: 14px; }
.stat-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-content { display: flex; flex-direction: column; }
.stat-content .label { font-size: 12px; color: #999; }
.stat-content .value { font-family: 'Orbitron', sans-serif; font-size: 22px; font-weight: 700; color: #333; }
.stat-content .value.warning { color: #f59e0b; }
.stat-content .value.error { color: #ef4444; }

.table-card { border-radius: 12px; }

.price-preset { color: #3b82f6; font-weight: 600; }

/* 定价弹窗信息区 */
.price-modal-info {
  display: flex; gap: 32px; margin-bottom: 16px; padding: 12px 16px;
  background: #f8fafc; border-radius: 8px;
}
.info-item { display: flex; align-items: center; gap: 8px; }
.info-label { font-size: 13px; color: #666; }

/* 定价弹窗表格 */
.pricing-table {
  border: 1px solid #e8e8e8; border-radius: 8px; overflow: hidden;
}
.pricing-table-header {
  display: flex; align-items: center; padding: 10px 16px;
  background: #f8fafc; font-size: 12px; font-weight: 600; color: #888;
}
.pricing-row {
  display: flex; align-items: center; padding: 10px 16px;
  border-top: 1px solid #f0f0f0; transition: background 0.15s;
}
.pricing-row:hover { background: #fafafa; }
.pricing-row.has-price { background: #f0fdf4; }
.pricing-row.has-price:hover { background: #ecfdf5; }
.col-shop { flex: 0 0 140px; font-size: 13px; font-weight: 500; color: #333; }
.col-price { flex: 0 0 160px; }
.col-status { flex: 0 0 110px; display: flex; align-items: center; gap: 6px; }
.col-quick { flex: 1; }
.status-text { font-size: 12px; color: #10b981; }
.status-text.inactive { color: #999; }

/* 行样式 */
:deep(.row-unpriced td) { background: rgba(245, 158, 11, 0.03); }
:deep(.row-partial td) { background: rgba(59, 130, 246, 0.02); }
</style>
