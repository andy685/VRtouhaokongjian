<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>单次消费项目</h1>
      <n-space>
        <n-select v-model:value="filterShop" :options="shopOptions" placeholder="选择店铺" size="small" style="width: 180px;" clearable />
        <n-input placeholder="搜索项目名称..." size="small" style="width: 180px;" v-model:value="filterKeyword">
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
        <n-button type="primary" size="small" @click="handleAdd">+ 新建项目</n-button>
      </n-space>
    </div>

    <!-- 项目列表 -->
    <n-card class="table-card">
      <n-tabs type="line" v-model:value="activeTab">
        <n-tab name="active">上架中</n-tab>
        <n-tab name="inactive">已下架</n-tab>
        <n-tab name="all">全部</n-tab>
      </n-tabs>
      <n-data-table :columns="columns" :data="filteredData" :pagination="pagination" striped />
    </n-card>

    <!-- 新增/编辑弹窗 -->
    <n-modal v-model:show="showModal" preset="card" :title="modalTitle" style="width: 560px;" :bordered="false">
      <n-form :model="formData" label-placement="left" label-width="100px" :rules="formRules">
        <n-form-item label="项目名称" path="name" required>
          <n-input v-model:value="formData.name" placeholder="如：VR过山车" />
        </n-form-item>
        <n-form-item label="项目封面" path="coverUrl">
          <div class="cover-upload">
            <div class="cover-wrap" @click="triggerCoverUpload">
              <img v-if="formData.coverUrl" :src="formData.coverUrl" class="cover-img" />
              <div v-else class="cover-placeholder">
                <span>上传封面</span>
                <small>建议 4:3 比例</small>
              </div>
              <div class="cover-overlay">
                <n-icon :component="AddOutline" size="20" color="#fff" />
                <span>{{ formData.coverUrl ? '更换封面' : '点击上传' }}</span>
              </div>
            </div>
            <div class="cover-actions">
              <n-button size="tiny" secondary @click.stop="triggerCoverUpload">选择图片</n-button>
              <n-button v-if="formData.coverUrl" size="tiny" quaternary type="error" @click.stop="removeCover">删除</n-button>
            </div>
            <input ref="coverInputRef" type="file" accept="image/jpeg,image/png,image/webp" class="hidden-input" @change="handleCoverChange" />
          </div>
        </n-form-item>
        <n-form-item label="关联设备" path="deviceId">
          <n-select v-model:value="formData.deviceId" :options="deviceOptions" placeholder="请选择关联设备（可选）" clearable />
        </n-form-item>
        <n-form-item label="单价" path="price" required>
          <n-input-number v-model:value="formData.price" :min="0" :precision="2" placeholder="0.00" style="width: 100%;">
            <template #suffix>元/次</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="适用店铺" path="shops" required>
          <n-checkbox-group v-model:value="formData.shops">
            <n-space>
              <n-checkbox v-for="shop in shopOptions" :key="shop.value" :value="shop.value" :label="shop.label" />
            </n-space>
          </n-checkbox-group>
        </n-form-item>
        <n-form-item label="排序" path="sort">
          <n-input-number v-model:value="formData.sort" :min="0" placeholder="数字越小越靠前" style="width: 200px;" />
        </n-form-item>
        <n-form-item label="状态" path="status" required>
          <n-radio-group v-model:value="formData.status">
            <n-space>
              <n-radio :value="true">上架</n-radio>
              <n-radio :value="false">下架</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="center">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" @click="handleSubmit">确定</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NCard, NDataTable, NButton, NSpace, NInput, NIcon, NModal, NForm,
  NFormItem, NInputNumber, NTabs, NTab, NTag, NDropdown,
  NSelect, NCheckbox, NCheckboxGroup, NRadio, NRadioGroup
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import {
  SearchOutline, EllipsisHorizontalOutline, AddOutline
} from '@vicons/ionicons5'

const activeTab = ref('active')
const showModal = ref(false)
const isEdit = ref(false)
const modalTitle = ref('新建单次消费项目')
const filterShop = ref<string | null>(null)
const filterKeyword = ref('')

const formData = ref({
  id: null as number | null,
  name: '',
  coverUrl: '',
  deviceId: null as string | null,
  price: null as number | null,
  shops: [] as string[],
  sort: 1,
  status: true
})

const formRules = {
  name: { required: true, message: '请输入项目名称', trigger: 'blur' },
  price: { required: true, type: 'number' as const, message: '请输入单价', trigger: 'blur' },
  shops: { required: true, type: 'array' as const, message: '请选择适用店铺', trigger: 'change' }
}

const shopOptions = [
  { label: '卓远亚运城店', value: 'shop1' },
  { label: '卓远天河路店', value: 'shop2' },
  { label: '卓远北京路店', value: 'shop3' }
]

const deviceOptions = [
  { label: 'VR过山车（A01）', value: 'dev1' },
  { label: '暗黑战车（A02）', value: 'dev2' },
  { label: '星际穿越（A03）', value: 'dev3' },
  { label: '梦幻海洋（B01）', value: 'dev4' },
  { label: '极速摩托（B02）', value: 'dev5' }
]

const pagination = { pageSize: 10 }

const coverInputRef = ref<HTMLInputElement | null>(null)

const defaultCover = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="160" height="160" rx="12" fill="#e2e8f0"/><rect x="22" y="22" width="116" height="116" rx="14" fill="#cbd5e1"/><circle cx="58" cy="64" r="10" fill="#94a3b8"/><path d="M36 118L66 88L92 104L116 76L136 92V136H24V118Z" fill="#94a3b8" opacity="0.85"/><text x="80" y="148" text-anchor="middle" font-size="12" fill="#64748b">单次消费</text></svg>')}`

function createCover(text: string, from: string, to: string) {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${from}"/><stop offset="100%" stop-color="${to}"/></linearGradient></defs><rect width="160" height="160" rx="12" fill="url(#g)"/><rect x="22" y="22" width="116" height="116" rx="14" fill="rgba(255,255,255,0.14)"/><text x="80" y="86" text-anchor="middle" font-size="20" font-weight="700" fill="#fff">${text}</text></svg>`)}`
}

const rawData = ref([
  { id: 1, name: 'VR过山车', coverUrl: createCover('VR', '#0ea5e9', '#2563eb'), deviceId: 'dev1', deviceName: 'VR过山车（A01）', price: 38, shops: ['shop1'], shopNames: '卓远亚运城店', sort: 1, status: true },
  { id: 2, name: '暗黑战车', coverUrl: createCover('战车', '#111827', '#374151'), deviceId: 'dev2', deviceName: '暗黑战车（A02）', price: 48, shops: ['shop1', 'shop2'], shopNames: '卓远亚运城店、卓远天河路店', sort: 2, status: true },
  { id: 3, name: '星际穿越', coverUrl: createCover('星际', '#7c3aed', '#4f46e5'), deviceId: 'dev3', deviceName: '星际穿越（A03）', price: 58, shops: ['shop2'], shopNames: '卓远天河路店', sort: 3, status: true },
  { id: 4, name: '梦幻海洋', coverUrl: createCover('海洋', '#06b6d4', '#0891b2'), deviceId: 'dev4', deviceName: '梦幻海洋（B01）', price: 28, shops: ['shop1', 'shop2', 'shop3'], shopNames: '全部店铺', sort: 4, status: false },
  { id: 5, name: '极速摩托', coverUrl: createCover('摩托', '#f97316', '#ea580c'), deviceId: 'dev5', deviceName: '极速摩托（B02）', price: 35, shops: ['shop3'], shopNames: '卓远北京路店', sort: 5, status: true },
  { id: 6, name: '恐龙世界', coverUrl: createCover('恐龙', '#16a34a', '#15803d'), deviceId: null, deviceName: '-', price: 20, shops: ['shop1'], shopNames: '卓远亚运城店', sort: 6, status: true },
])

const filteredData = computed(() => {
  let data = rawData.value
  if (activeTab.value === 'active') data = data.filter(d => d.status)
  if (activeTab.value === 'inactive') data = data.filter(d => !d.status)
  if (filterShop.value) data = data.filter(d => d.shops.includes(filterShop.value))
  if (filterKeyword.value) {
    const kw = filterKeyword.value.toLowerCase()
    data = data.filter(d => d.name.toLowerCase().includes(kw) || d.deviceName.toLowerCase().includes(kw))
  }
  return data.sort((a, b) => a.sort - b.sort)
})

const columns: DataTableColumns = [
  { title: '封面', key: 'coverUrl', width: 84, render: (row: any) => h('img', {
    src: row.coverUrl || defaultCover,
    style: 'width:56px;height:56px;object-fit:cover;border-radius:8px;border:1px solid #e5e7eb;background:#f8fafc;'
  }) },
  { title: '排序', key: 'sort', width: 60, align: 'center' },
  { title: '项目名称', key: 'name', width: 140 },
  { title: '关联设备', key: 'deviceName', width: 160, render: (row: any) => row.deviceName || '-' },
  { title: '单价', key: 'price', width: 100, align: 'center', render: (row: any) => `¥${row.price.toFixed(2)}` },
  { title: '适用店铺', key: 'shopNames', minWidth: 180 },
  { title: '状态', key: 'status', width: 90, align: 'center', render: (row: any) =>
    h(NTag, { type: row.status ? 'success' : 'warning', size: 'small' },
      { default: () => row.status ? '上架' : '下架' })
  },
  { title: '操作', key: 'actions', width: 100, align: 'center', render: (row: any) => {
    const options = [
      { label: '编辑', key: 'edit' },
      { label: row.status ? '下架' : '上架', key: 'toggle' },
      { type: 'divider', key: 'd1' },
      { label: '删除', key: 'delete' }
    ]
    return h(NDropdown, { options, onSelect: (key: string) => handleAction(key, row) },
      { default: () => h(NButton, { quaternary: true, circle: true },
        { icon: () => h(NIcon, { component: EllipsisHorizontalOutline }) })
      })
  }}
]

function handleAdd() {
  isEdit.value = false
  modalTitle.value = '新建单次消费项目'
  formData.value = {
    id: null,
    name: '',
    coverUrl: '',
    deviceId: null,
    price: null,
    shops: [],
    sort: rawData.value.length + 1,
    status: true
  }
  showModal.value = true
}

function handleEdit(row: any) {
  isEdit.value = true
  modalTitle.value = '编辑单次消费项目'
  formData.value = {
    id: row.id,
    name: row.name,
    coverUrl: row.coverUrl || '',
    deviceId: row.deviceId,
    price: row.price,
    shops: [...row.shops],
    sort: row.sort,
    status: row.status
  }
  showModal.value = true
}

function handleAction(key: string, row: any) {
  if (key === 'edit') {
    handleEdit(row)
  } else if (key === 'toggle') {
    row.status = !row.status
  } else if (key === 'delete') {
    const index = rawData.value.findIndex(item => item.id === row.id)
    if (index > -1) rawData.value.splice(index, 1)
  }
}

function handleSubmit() {
  if (isEdit.value && formData.value.id) {
    const idx = rawData.value.findIndex(item => item.id === formData.value.id)
    if (idx > -1) {
      rawData.value[idx] = {
        ...rawData.value[idx],
        name: formData.value.name,
        coverUrl: formData.value.coverUrl,
        deviceId: formData.value.deviceId,
        deviceName: deviceOptions.find(d => d.value === formData.value.deviceId)?.label || '-',
        price: formData.value.price || 0,
        shops: formData.value.shops,
        shopNames: formData.value.shops.length === shopOptions.length ? '全部店铺' : formData.value.shops.map((s: string) => shopOptions.find(o => o.value === s)?.label).join('、'),
        sort: formData.value.sort || 1,
        status: formData.value.status
      }
    }
  } else {
    const newId = Math.max(...rawData.value.map(d => d.id), 0) + 1
    rawData.value.push({
      id: newId,
      name: formData.value.name,
      coverUrl: formData.value.coverUrl,
      deviceId: formData.value.deviceId,
      deviceName: deviceOptions.find(d => d.value === formData.value.deviceId)?.label || '-',
      price: formData.value.price || 0,
      shops: formData.value.shops,
      shopNames: formData.value.shops.length === shopOptions.length ? '全部店铺' : formData.value.shops.map((s: string) => shopOptions.find(o => o.value === s)?.label).join('、'),
      sort: formData.value.sort || 1,
      status: formData.value.status
    })
  }
  showModal.value = false
}

function triggerCoverUpload() {
  coverInputRef.value?.click()
}

function handleCoverChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    return
  }
  const reader = new FileReader()
  reader.onload = (ev) => {
    formData.value.coverUrl = ev.target?.result as string
  }
  reader.readAsDataURL(file)
  target.value = ''
}

function removeCover() {
  formData.value.coverUrl = ''
}
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { font-size: 20px; font-weight: 600; color: #333; margin: 0; }
.table-card { border-radius: 12px; }
.cover-upload { display: flex; flex-direction: column; gap: 10px; }
.cover-wrap { width: 160px; height: 160px; position: relative; border-radius: 12px; overflow: hidden; border: 1px dashed #cbd5e1; background: #f8fafc; cursor: pointer; }
.cover-wrap:hover .cover-overlay { opacity: 1; }
.cover-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.cover-placeholder { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; color: #64748b; font-size: 13px; }
.cover-placeholder small { font-size: 11px; color: #94a3b8; }
.cover-overlay { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; background: rgba(15, 23, 42, 0.45); color: #fff; opacity: 0; transition: opacity 0.2s; font-size: 12px; }
.cover-actions { display: flex; gap: 8px; }
.hidden-input { display: none; }
</style>
