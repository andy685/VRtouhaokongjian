<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>商品管理</h1>
      <n-button type="primary" @click="router.push('/shop/products/add')">+ 添加商品</n-button>
    </div>

    <!-- Tab切换 -->
    <n-tabs type="line" animated v-model:value="activeTab">
      <n-tab-pane name="physical" tab="📦 商品">
        <div class="tab-content">
          <div class="physical-actions">
            <n-input v-model:value="searchText" placeholder="搜索商品名称..." size="small" style="width: 200px;">
              <template #prefix><n-icon :component="SearchOutline" /></template>
            </n-input>
            <n-select v-model:value="filterCategory" placeholder="商品分类" :options="categoryOptions" size="small" style="width: 140px;" clearable />
            <n-select v-model:value="filterStock" placeholder="库存状态" :options="stockStatusOptions" size="small" style="width: 120px;" clearable />
            <n-select v-model:value="filterStatus" placeholder="上架状态" :options="statusOptions" size="small" style="width: 120px;" clearable />
          </div>

          <n-data-table :columns="physicalColumns" :data="filteredData" :pagination="{ pageSize: 8 }" striped />
        </div>
      </n-tab-pane>

      <n-tab-pane name="inventory" tab="📊 库存管理">
        <div class="tab-content">
          <div class="stock-overview">
            <div class="stock-card">
              <span class="label">总商品数</span>
              <span class="value">48件</span>
              <span class="sub">涉及 12 种商品</span>
            </div>
            <div class="stock-card">
              <span class="label">总库存价值</span>
              <span class="value">¥23,680</span>
              <span class="sub">按成本价计算</span>
            </div>
            <div class="stock-card warning">
              <span class="label">⚠ 低库存预警</span>
              <span class="value">3件</span>
              <n-button size="tiny" type="error" secondary>立即采购</n-button>
            </div>
            <div class="stock-card">
              <span class="label">今日变动</span>
              <span class="value green">+15 / -8</span>
              <span class="sub">入库 / 出库</span>
            </div>
          </div>

          <div class="inventory-actions">
            <n-button size="small" type="primary">+ 入库</n-button>
            <n-button size="small">- 出库</n-button>
            <n-button size="small" secondary>📋 库存盘点</n-button>
          </div>

          <n-data-table :columns="stockColumns" :data="stockData" :pagination="{ pageSize: 10 }" striped />
        </div>
      </n-tab-pane>
    </n-tabs>

    <!-- 补货弹窗 -->
    <n-modal v-model:show="showRestock" preset="card" title="商品补货" style="width: 420px;" :bordered="false">
      <div v-if="restockProduct" style="margin-bottom: 16px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
          <span style="font-size:24px;">{{ restockProduct.icon }}</span>
          <div>
            <div style="font-weight:600;">{{ restockProduct.name }}</div>
            <div style="font-size:12px;color:#94a3b8;">当前库存: {{ restockProduct.stock }}</div>
          </div>
        </div>
        <n-form label-placement="left" label-width="80">
          <n-form-item label="补货数量">
            <n-input-number v-model:value="restockQty" :min="1" placeholder="请输入补货数量" style="width: 100%;" />
          </n-form-item>
          <n-form-item label="补货备注">
            <n-input v-model:value="restockRemark" placeholder="如：供应商补货" />
          </n-form-item>
        </n-form>
      </div>
      <template #footer>
        <div style="display:flex;justify-content:flex-end;gap:12px;">
          <n-button @click="showRestock = false">取消</n-button>
          <n-button type="primary" @click="confirmRestock">确认补货</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, h, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  NButton, NTabs, NTabPane, NDataTable, NTag, NSpace, NInput,
  NSelect, NIcon, NModal, NInputNumber, NForm, NFormItem, useMessage
} from 'naive-ui'
import {
  SearchOutline
} from '@vicons/ionicons5'

const router = useRouter()
const message = useMessage()
const activeTab = ref('physical')

// 补货弹窗
const showRestock = ref(false)
const restockProduct = ref<any>(null)
const restockQty = ref(1)
const restockRemark = ref('')

function openRestock(row: any) {
  restockProduct.value = row
  restockQty.value = 1
  restockRemark.value = ''
  showRestock.value = true
}

function confirmRestock() {
  if (restockQty.value <= 0) {
    message.warning('补货数量必须大于0')
    return
  }
  const product = restockProduct.value
  const before = parseInt(product.stock)
  product.stock = String(before + restockQty.value)
  message.success(`已补货 ${restockQty.value} 件，库存更新为 ${product.stock}`)
  showRestock.value = false
}

function toggleStatus(row: any) {
  row.status = row.status === 'on' ? 'off' : 'on'
  message.success(row.status === 'on' ? '已上架' : '已下架')
}

const categoryOptions = [
  { label: '消耗品', value: 'consumable' },
  { label: '配件', value: 'accessory' },
  { label: '周边', value: 'merchandise' },
  { label: '饮品', value: 'drink' },
]

const stockStatusOptions = [
  { label: '低库存', value: 'low' },
  { label: '正常', value: 'normal' },
  { label: '充足', value: 'enough' },
]

const statusOptions = [
  { label: '已上架', value: 'on' },
  { label: '已下架', value: 'off' },
]

// 筛选条件
const searchText = ref('')
const filterCategory = ref<string | null>(null)
const filterStock = ref<string | null>(null)
const filterStatus = ref<string | null>(null)

const physicalColumns = [
  { title: '商品', key: 'info', render(row: any) {
    return h('div', { style: 'display:flex;align-items:center;gap:10px;' }, [
      h('div', { style: 'width:40px;height:40px;background:#f1f5f9;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px;' }, row.icon),
      h('div', {}, [
        h('div', { style: 'font-weight:500' }, row.name),
        h('div', { style: 'font-size:11px;color:#94a3b8' }, `成本: ¥${row.cost}`)
      ])
    ])
  }},
  { title: '分类', key: 'category' },
  { title: '售价', key: 'price', render: (row: any) => `¥${row.price}` },
  { title: '库存', key: 'stock', render: (row: any) => h('span', { style: `font-weight:600;` }, row.stock) },
  { title: '库存状态', key: 'stockStatus', render: (row: any) => {
    const num = parseInt(row.stock)
    if (num <= 10) return h(NTag, { type: 'error', size: 'small', bordered: true }, () => '低库存')
    if (num <= 50) return h(NTag, { type: 'warning', size: 'small', bordered: true }, () => '正常')
    return h(NTag, { type: 'success', size: 'small', bordered: true }, () => '充足')
  }},
  { title: '销量', key: 'sales' },
  { title: '状态', key: 'status', render: (row: any) => h(NTag, { type: row.status === 'on' ? 'success' : 'default', size: 'small', bordered: true }, () => row.status === 'on' ? '上架' : '下架') },
  { title: '操作', key: 'actions', width: 200, render: (row: any) => h(NSpace, null, { default: () => [
    h(NButton, { size: 'tiny', secondary: true, onClick: () => router.push(`/shop/products/${row.id}`) }, () => '编辑'),
    h(NButton, { size: 'tiny', type: 'primary', quaternary: true, onClick: () => openRestock(row) }, () => '补货'),
    h(NButton, { size: 'tiny', quaternary: true, type: row.status === 'on' ? 'warning' : 'success', onClick: () => toggleStatus(row) }, () => row.status === 'on' ? '下架' : '上架')
  ] }) },
]

const physicalData = [
  { id: '1', name: '一次性眼罩', icon: '😷', category: '消耗品', cost: '0.8', price: '3.0', stock: '200', sales: 1256, status: 'on' },
  { id: '2', name: 'VR手柄保护套', icon: '🧤', category: '配件', cost: '12', price: '29.0', stock: '15', sales: 328, status: 'on' },
  { id: '3', name: '恐怖医院限定玩偶', icon: '🧸', category: '周边', cost: '35', price: '68.0', stock: '52', sales: 156, status: 'on' },
  { id: '4', name: '恐龙王国钥匙扣', icon: '🔑', category: '周边', cost: '8', price: '18.0', stock: '3', sales: 289, status: 'off' },
  { id: '5', name: '可乐330ml', icon: '🥤', category: '饮品', cost: '2', price: '5.0', stock: '30', sales: 856, status: 'on' },
]

const categoryValueMap: Record<string, string> = { consumable: '消耗品', accessory: '配件', merchandise: '周边', drink: '饮品' }

const filteredData = computed(() => {
  return physicalData.filter(item => {
    if (searchText.value && !item.name.includes(searchText.value)) return false
    if (filterCategory.value && categoryValueMap[filterCategory.value] !== item.category) return false
    if (filterStock.value) {
      const num = parseInt(item.stock)
      if (filterStock.value === 'low' && num > 10) return false
      if (filterStock.value === 'normal' && (num <= 10 || num > 50)) return false
      if (filterStock.value === 'enough' && num <= 50) return false
    }
    if (filterStatus.value && item.status !== filterStatus.value) return false
    return true
  })
})

const stockColumns = [
  { title: '时间', key: 'time', width: 160 },
  { title: '操作类型', key: 'action', width: 100, render: (row: any) => h(NTag, { type: row.action === '入库' ? 'success' : 'error', size: 'tiny' }, () => row.action) },
  { title: '商品', key: 'product' },
  { title: '数量', key: 'qty', render: (row: any) => h('span', { style: `font-weight:600;color:${row.action === '入库' ? '#10B981' : '#EF4444'};` }, row.qty) },
  { title: '前后库存', key: 'beforeAfter', render: (row: any) => `${row.before} → ${row.after}` },
  { title: '操作人', key: 'operator' },
  { title: '备注', key: 'remark' },
]

const stockData = [
  { time: '2026-04-20 14:32:05', action: '入库', product: '一次性眼罩', qty: '+200', before: 20, after: 220, operator: '管理员', remark: '批量采购入库' },
  { time: '2026-04-20 13:20:18', action: '出库', product: '恐龙钥匙扣', qty: '-7', before: 10, after: 3, operator: '销售', remark: '顾客购买' },
  { time: '2026-04-20 11:05:42', action: '盘点', product: 'VR手柄保护套', qty: '+2', before: 13, after: 15, operator: '店长', remark: '库存盘点调整' },
  { time: '2026-04-19 16:30:00', action: '入库', product: '恐怖医院限定玩偶', qty: '+50', before: 2, after: 52, operator: '管理员', remark: '供应商补货' },
]
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); }

.tab-content { padding-top: 16px; }

.physical-actions { display: flex; gap: 12px; margin-bottom: 16px; align-items: center; }

.stock-overview { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
.stock-card { background: white; border-radius: 12px; padding: 20px; text-align: center; border: 1px solid var(--border-color); }
.stock-card .label { font-size: 12px; color: var(--text-muted); display: block; }
.stock-card .value { font-family: 'Orbitron', sans-serif; font-size: 26px; font-weight: 700; color: var(--text-primary); display: block; margin: 8px 0; }
.stock-card .sub { font-size: 11px; color: var(--text-muted); }
.stock-card.warning { border-color: rgba(239,68,68,0.3); background: linear-gradient(180deg, #fef2f2, white); }
.stock-card .value.green { color: #10B981; }

.inventory-actions { display: flex; gap: 12px; margin-bottom: 16px; }
</style>
