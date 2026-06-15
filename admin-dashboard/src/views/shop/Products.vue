<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>实物商品</h1>
      <n-button type="primary" @click="router.push('/shop/products/add')">+ 添加商品</n-button>
    </div>

    <!-- Tab切换 -->
    <n-tabs type="line" animated v-model:value="activeTab" @update:value="onTabChange">
      <n-tab-pane name="physical" tab="📦 商品">
        <div class="tab-content">
          <div class="physical-actions">
            <n-input v-model:value="searchText" placeholder="搜索商品名称..." size="small" style="width: 200px;">
              <template #prefix><n-icon :component="SearchOutline" /></template>
            </n-input>
            <n-select v-model:value="filterCategory" placeholder="商品分类" :options="categoryFilterOptions" size="small" style="width: 140px;" clearable />
            <n-select v-model:value="filterStock" placeholder="库存状态" :options="stockStatusOptions" size="small" style="width: 120px;" clearable />
            <n-select v-model:value="filterStatus" placeholder="上架状态" :options="statusOptions" size="small" style="width: 120px;" clearable />
            <n-button size="small" secondary @click="openCategoryManager">
              <template #icon><n-icon :component="SettingsOutline" /></template>
              分类管理
            </n-button>
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
              <n-button size="tiny" type="error" secondary @click="quickPurchase">立即采购</n-button>
            </div>
            <div class="stock-card">
              <span class="label">今日变动</span>
              <span class="value green">+15 / -8</span>
              <span class="sub">入库 / 出库</span>
            </div>
          </div>

          <div class="inventory-actions">
            <n-button size="small" type="primary" @click="openStockModal('in')">+ 入库</n-button>
            <n-button size="small" @click="openStockModal('out')">- 出库</n-button>
            <n-button size="small" secondary @click="openStockModal('check')">📋 库存盘点</n-button>
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

    <!-- 入库弹窗 -->
    <n-modal v-model:show="showStockIn" preset="card" title="商品入库" style="width: 480px;" :bordered="false">
      <n-form label-placement="left" label-width="80">
        <n-form-item label="选择商品" required>
          <n-select v-model:value="stockForm.product" :options="stockProductOptions" placeholder="请选择商品" filterable />
        </n-form-item>
        <n-form-item label="入库数量" required>
          <n-input-number v-model:value="stockForm.qty" :min="1" placeholder="请输入入库数量" style="width: 100%;" />
        </n-form-item>
        <n-form-item label="入库备注">
          <n-input v-model:value="stockForm.remark" placeholder="如：批量采购入库" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div style="display:flex;justify-content:flex-end;gap:12px;">
          <n-button @click="showStockIn = false">取消</n-button>
          <n-button type="primary" @click="confirmStockIn">确认入库</n-button>
        </div>
      </template>
    </n-modal>

    <!-- 出库弹窗 -->
    <n-modal v-model:show="showStockOut" preset="card" title="商品出库" style="width: 480px;" :bordered="false">
      <n-form label-placement="left" label-width="80">
        <n-form-item label="选择商品" required>
          <n-select v-model:value="stockForm.product" :options="stockProductOptions" placeholder="请选择商品" filterable />
        </n-form-item>
        <n-form-item label="出库数量" required>
          <n-input-number v-model:value="stockForm.qty" :min="1" placeholder="请输入出库数量" style="width: 100%;" />
        </n-form-item>
        <n-form-item label="出库原因">
          <n-select v-model:value="stockForm.reason" :options="outReasonOptions" placeholder="请选择出库原因" />
        </n-form-item>
        <n-form-item label="备注">
          <n-input v-model:value="stockForm.remark" placeholder="如：顾客购买" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div style="display:flex;justify-content:flex-end;gap:12px;">
          <n-button @click="showStockOut = false">取消</n-button>
          <n-button type="error" @click="confirmStockOut">确认出库</n-button>
        </div>
      </template>
    </n-modal>

    <!-- 库存盘点弹窗 -->
    <n-modal v-model:show="showStockCheck" preset="card" title="库存盘点" style="width: 600px;" :bordered="false">
      <div style="margin-bottom:12px;font-size:13px;color:#64748b;">核对实际库存数量，系统将自动记录盘盈/盘亏</div>
      <n-data-table :columns="checkColumns" :data="checkData" size="small" :pagination="false" bordered />
      <template #footer>
        <div style="display:flex;justify-content:flex-end;gap:12px;">
          <n-button @click="showStockCheck = false">取消</n-button>
          <n-button type="primary" @click="confirmStockCheck">确认盘点</n-button>
        </div>
      </template>
    </n-modal>

    <!-- 分类管理弹窗 -->
    <n-modal v-model:show="showCategoryManager" preset="card" title="商品分类管理" style="width: 520px;" :bordered="false">
      <div style="margin-bottom:16px;">
        <n-button size="small" type="primary" @click="openCategoryEdit(null)">+ 新建分类</n-button>
      </div>
      <n-data-table :columns="categoryColumns" :data="categories" size="small" :pagination="false" bordered />
      <template #footer>
        <n-button @click="showCategoryManager = false">关闭</n-button>
      </template>
    </n-modal>

    <!-- 新建/编辑分类弹窗 -->
    <n-modal v-model:show="showCategoryEdit" preset="card" :title="editingCategory ? '编辑分类' : '新建分类'" style="width: 400px;" :bordered="false">
      <n-form label-placement="left" label-width="80">
        <n-form-item label="分类名称" required>
          <n-input v-model:value="categoryForm.name" placeholder="请输入分类名称" />
        </n-form-item>
        <n-form-item label="分类图标">
          <n-input v-model:value="categoryForm.icon" placeholder="如：📦（emoji或文字）" />
        </n-form-item>
        <n-form-item label="排序">
          <n-input-number v-model:value="categoryForm.sort" :min="0" placeholder="数字越小越靠前" style="width: 100%;" />
        </n-form-item>
        <n-form-item label="状态">
          <n-select v-model:value="categoryForm.status" :options="[{ label: '启用', value: 'active' }, { label: '停用', value: 'disabled' }]" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div style="display:flex;justify-content:flex-end;gap:12px;">
          <n-button @click="showCategoryEdit = false">取消</n-button>
          <n-button type="primary" @click="confirmCategoryEdit">确认</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, h, computed, watch, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NButton, NTabs, NTabPane, NDataTable, NTag, NSpace, NInput,
  NSelect, NIcon, NModal, NInputNumber, NForm, NFormItem, useMessage
} from 'naive-ui'
import {
  SearchOutline, SettingsOutline
} from '@vicons/ionicons5'

const router = useRouter()
const route = useRoute()
const message = useMessage()
const activeTab = ref(route.path.includes('inventory') ? 'inventory' : 'physical')

watch(() => route.path, (path) => {
  activeTab.value = path.includes('inventory') ? 'inventory' : 'physical'
})

function onTabChange(tab: string) {
  if (tab === 'inventory') {
    router.push('/shop/products/inventory')
  } else {
    router.push('/shop/products')
  }
}

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

// ===== 入库/出库/盘点弹窗 =====
const showStockIn = ref(false)
const showStockOut = ref(false)
const showStockCheck = ref(false)

const stockForm = ref({
  product: null as string | null,
  qty: 1,
  remark: '',
  reason: null as string | null,
})

const outReasonOptions = [
  { label: '顾客购买', value: 'sale' },
  { label: '损耗/过期', value: 'damaged' },
  { label: '调拨出库', value: 'transfer' },
  { label: '其他', value: 'other' },
]

const stockProductOptions = computed(() =>
  physicalData.map(p => ({ label: `${p.icon} ${p.name}（库存: ${p.stock}）`, value: p.name }))
)

function quickPurchase() {
  stockForm.value = { product: null, qty: 50, remark: '低库存紧急采购', reason: null }
  showStockIn.value = true
}

function openStockModal(type: 'in' | 'out' | 'check') {
  stockForm.value = { product: null, qty: 1, remark: '', reason: null }
  if (type === 'in') showStockIn.value = true
  else if (type === 'out') showStockOut.value = true
  else {
    // 盘点：初始化每件商品的实际库存为系统库存
    checkData.value = physicalData.map(p => ({
      name: p.icon + ' ' + p.name,
      systemStock: parseInt(p.stock),
      actualStock: parseInt(p.stock),
    }))
    showStockCheck.value = true
  }
}

function confirmStockIn() {
  if (!stockForm.value.product || stockForm.value.qty <= 0) {
    message.warning('请选择商品并输入入库数量')
    return
  }
  const product = physicalData.find(p => p.name === stockForm.value.product)
  if (product) {
    const before = parseInt(product.stock)
    product.stock = String(before + stockForm.value.qty)
    // 新增记录
    stockData.unshift({
      time: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\//g, '-'),
      action: '入库',
      product: product.name,
      qty: `+${stockForm.value.qty}`,
      before,
      after: before + stockForm.value.qty,
      operator: '管理员',
      remark: stockForm.value.remark || '入库',
    })
  }
  message.success(`入库成功：${stockForm.value.product} +${stockForm.value.qty}`)
  showStockIn.value = false
}

function confirmStockOut() {
  if (!stockForm.value.product || stockForm.value.qty <= 0) {
    message.warning('请选择商品并输入出库数量')
    return
  }
  const product = physicalData.find(p => p.name === stockForm.value.product)
  if (product) {
    const before = parseInt(product.stock)
    if (stockForm.value.qty > before) {
      message.warning('出库数量不能大于当前库存')
      return
    }
    product.stock = String(before - stockForm.value.qty)
    stockData.unshift({
      time: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\//g, '-'),
      action: '出库',
      product: product.name,
      qty: `-${stockForm.value.qty}`,
      before,
      after: before - stockForm.value.qty,
      operator: '管理员',
      remark: stockForm.value.remark || '出库',
    })
  }
  message.success(`出库成功：${stockForm.value.product} -${stockForm.value.qty}`)
  showStockOut.value = false
}

// 盘点
const checkColumns = [
  { title: '商品', key: 'name' },
  { title: '系统库存', key: 'systemStock', width: 100 },
  { title: '实际库存', key: 'actualStock', width: 140, render(row: any) {
    return h(NInputNumber, {
      value: row.actualStock,
      min: 0,
      size: 'small',
      style: 'width: 100%',
      'onUpdate:value': (val: number) => { row.actualStock = val }
    })
  }},
  { title: '差异', key: 'diff', width: 80, render(row: any) {
    const diff = row.actualStock - row.systemStock
    const color = diff > 0 ? '#10B981' : diff < 0 ? '#EF4444' : '#94a3b8'
    const prefix = diff > 0 ? '+' : ''
    return h('span', { style: `font-weight:600;color:${color};` }, `${prefix}${diff}`)
  }},
]

const checkData = ref<any[]>([])

function confirmStockCheck() {
  let changes = 0
  checkData.value.forEach(item => {
    const diff = item.actualStock - item.systemStock
    if (diff !== 0) {
      changes++
      const product = physicalData.find(p => p.name.includes(item.name.split(' ').pop()))
      if (product) {
        const before = parseInt(product.stock)
        product.stock = String(item.actualStock)
        stockData.unshift({
          time: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\//g, '-'),
          action: '盘点',
          product: item.name.split(' ').pop(),
          qty: diff > 0 ? `+${diff}` : `${diff}`,
          before,
          after: item.actualStock,
          operator: '管理员',
          remark: '库存盘点调整',
        })
      }
    }
  })
  message.success(changes > 0 ? `盘点完成，${changes} 项库存已调整` : '盘点完成，库存无差异')
  showStockCheck.value = false
}

// ===== 商品分类管理 =====
const categories = ref([
  { id: 1, name: '消耗品', icon: '🧴', sort: 1, status: 'active' },
  { id: 2, name: '配件', icon: '🔧', sort: 2, status: 'active' },
  { id: 3, name: '周边', icon: '🎁', sort: 3, status: 'active' },
  { id: 4, name: '饮品', icon: '🥤', sort: 4, status: 'active' },
])
let nextCategoryId = 5

const categoryFilterOptions = computed(() =>
  categories.value
    .filter(c => c.status === 'active')
    .sort((a, b) => a.sort - b.sort)
    .map(c => ({ label: `${c.icon} ${c.name}`, value: c.name }))
)

const showCategoryManager = ref(false)
const showCategoryEdit = ref(false)
const editingCategory = ref<any>(null)
const categoryForm = ref({ name: '', icon: '', sort: 0, status: 'active' })

function openCategoryManager() {
  showCategoryManager.value = true
}

function openCategoryEdit(cat: any) {
  if (cat) {
    editingCategory.value = cat
    categoryForm.value = { name: cat.name, icon: cat.icon, sort: cat.sort, status: cat.status }
  } else {
    editingCategory.value = null
    categoryForm.value = { name: '', icon: '', sort: categories.value.length + 1, status: 'active' }
  }
  showCategoryEdit.value = true
}

function confirmCategoryEdit() {
  if (!categoryForm.value.name.trim()) {
    message.warning('分类名称不能为空')
    return
  }
  if (editingCategory.value) {
    // 编辑
    const oldName = editingCategory.value.name
    const cat = categories.value.find(c => c.id === editingCategory.value.id)
    if (cat) {
      cat.name = categoryForm.value.name.trim()
      cat.icon = categoryForm.value.icon.trim() || '📦'
      cat.sort = categoryForm.value.sort
      cat.status = categoryForm.value.status
      // 同步商品的分类名称
      if (oldName !== cat.name) {
        physicalData.forEach(p => {
          if (p.category === oldName) p.category = cat.name
        })
      }
    }
    message.success('分类已更新')
  } else {
    // 新建
    categories.value.push({
      id: nextCategoryId++,
      name: categoryForm.value.name.trim(),
      icon: categoryForm.value.icon.trim() || '📦',
      sort: categoryForm.value.sort,
      status: categoryForm.value.status,
    })
    message.success('分类已创建')
  }
  showCategoryEdit.value = false
}

function deleteCategory(cat: any) {
  const inUse = physicalData.some(p => p.category === cat.name)
  if (inUse) {
    message.warning(`分类"${cat.name}"下有商品，无法删除`)
    return
  }
  categories.value = categories.value.filter(c => c.id !== cat.id)
  message.success('分类已删除')
}

const categoryColumns = [
  { title: '图标', key: 'icon', width: 60, render: (row: any) => h('span', { style: 'font-size:20px;' }, row.icon) },
  { title: '分类名称', key: 'name' },
  { title: '排序', key: 'sort', width: 70 },
  { title: '状态', key: 'status', width: 80, render: (row: any) => h(NTag, { type: row.status === 'active' ? 'success' : 'default', size: 'small' }, () => row.status === 'active' ? '启用' : '停用') },
  { title: '商品数', key: 'count', width: 80, render: (row: any) => physicalData.filter(p => p.category === row.name).length },
  { title: '操作', key: 'actions', width: 120, render: (row: any) => h(NSpace, { size: 'small' }, { default: () => [
    h(NButton, { size: 'tiny', secondary: true, onClick: () => openCategoryEdit(row) }, () => '编辑'),
    h(NButton, { size: 'tiny', type: 'error', quaternary: true, onClick: () => deleteCategory(row) }, () => '删除'),
  ] }) },
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
const PRODUCT_STORAGE_KEY = 'shopPhysicalProducts'

const defaultCover = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" rx="12" fill="#e2e8f0"/><rect x="22" y="20" width="76" height="56" rx="10" fill="#cbd5e1"/><rect x="32" y="34" width="56" height="8" rx="4" fill="#94a3b8"/><rect x="32" y="48" width="38" height="8" rx="4" fill="#94a3b8"/><text x="60" y="98" text-anchor="middle" font-size="11" fill="#64748b">商品封面</text></svg>')}`

function createCover(text: string, from: string, to: string) {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${from}"/><stop offset="100%" stop-color="${to}"/></linearGradient></defs><rect width="120" height="120" rx="12" fill="url(#g)"/><rect x="16" y="18" width="88" height="62" rx="10" fill="rgba(255,255,255,0.14)"/><text x="60" y="66" text-anchor="middle" font-size="16" font-weight="700" fill="#fff">${text}</text></svg>`)}`
}

function createDefaultPhysicalData() {
  return [
    { id: '1', name: '一次性眼罩', coverUrl: createCover('眼罩', '#0ea5e9', '#0284c7'), icon: '😷', category: '消耗品', price: '3.0', stock: '200', sales: 1256, status: 'on' },
    { id: '2', name: 'VR手柄保护套', coverUrl: createCover('手柄', '#14b8a6', '#0f766e'), icon: '🧤', category: '配件', price: '29.0', stock: '15', sales: 328, status: 'on' },
    { id: '3', name: '恐怖医院限定玩偶', coverUrl: createCover('玩偶', '#8b5cf6', '#6d28d9'), icon: '🧸', category: '周边', price: '68.0', stock: '52', sales: 156, status: 'on' },
    { id: '4', name: '恐龙王国钥匙扣', coverUrl: createCover('钥匙扣', '#f97316', '#ea580c'), icon: '🔑', category: '周边', price: '18.0', stock: '3', sales: 289, status: 'off' },
    { id: '5', name: '可乐330ml', coverUrl: createCover('饮品', '#ef4444', '#b91c1c'), icon: '🥤', category: '饮品', price: '5.0', stock: '30', sales: 856, status: 'on' },
  ]
}

function loadPhysicalData() {
  try {
    const saved = localStorage.getItem(PRODUCT_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // ignore
  }
  return createDefaultPhysicalData()
}

const physicalColumns = [
  { title: '封面', key: 'cover', width: 82, render(row: any) {
    return h('img', {
      src: row.coverUrl || defaultCover,
      style: 'width:56px;height:56px;border-radius:10px;object-fit:cover;border:1px solid #e2e8f0;background:#f8fafc;'
    })
  }},
  { title: '商品', key: 'info', render(row: any) {
    return h('div', { style: 'display:flex;align-items:center;gap:10px;' }, [
      h('div', { style: 'width:40px;height:40px;background:#f1f5f9;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px;' }, row.icon),
      h('div', {}, [
        h('div', { style: 'font-weight:500' }, row.name)
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

const physicalData = reactive(loadPhysicalData())

watch(physicalData, (value) => {
  try {
    localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(value))
  } catch {
    // ignore
  }
}, { deep: true })


const filteredData = computed(() => {
  return physicalData.filter(item => {
    if (searchText.value && !item.name.includes(searchText.value)) return false
    if (filterCategory.value && item.category !== filterCategory.value) return false
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
