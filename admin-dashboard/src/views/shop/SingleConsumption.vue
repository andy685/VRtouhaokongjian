<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>单次消费项目</h1>
      <n-space>
        <n-select v-model:value="filterShop" :options="shopOptions" placeholder="选择门店" size="small" style="width: 180px;" clearable />
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
        <n-form-item label="关联设备" path="deviceId">
          <n-select v-model:value="formData.deviceId" :options="deviceOptions" placeholder="请选择关联设备（可选）" clearable />
        </n-form-item>
        <n-form-item label="单价" path="price" required>
          <n-input-number v-model:value="formData.price" :min="0" :precision="2" placeholder="0.00" style="width: 100%;">
            <template #suffix>元/次</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="适用门店" path="shops" required>
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
  SearchOutline, EllipsisHorizontalOutline
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
  deviceId: null as string | null,
  price: null as number | null,
  shops: [] as string[],
  sort: 1,
  status: true
})

const formRules = {
  name: { required: true, message: '请输入项目名称', trigger: 'blur' },
  price: { required: true, type: 'number' as const, message: '请输入单价', trigger: 'blur' },
  shops: { required: true, type: 'array' as const, message: '请选择适用门店', trigger: 'change' }
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

const rawData = ref([
  { id: 1, name: 'VR过山车', deviceId: 'dev1', deviceName: 'VR过山车（A01）', price: 38, shops: ['shop1'], shopNames: '卓远亚运城店', sort: 1, status: true },
  { id: 2, name: '暗黑战车', deviceId: 'dev2', deviceName: '暗黑战车（A02）', price: 48, shops: ['shop1', 'shop2'], shopNames: '卓远亚运城店、卓远天河路店', sort: 2, status: true },
  { id: 3, name: '星际穿越', deviceId: 'dev3', deviceName: '星际穿越（A03）', price: 58, shops: ['shop2'], shopNames: '卓远天河路店', sort: 3, status: true },
  { id: 4, name: '梦幻海洋', deviceId: 'dev4', deviceName: '梦幻海洋（B01）', price: 28, shops: ['shop1', 'shop2', 'shop3'], shopNames: '全部门店', sort: 4, status: false },
  { id: 5, name: '极速摩托', deviceId: 'dev5', deviceName: '极速摩托（B02）', price: 35, shops: ['shop3'], shopNames: '卓远北京路店', sort: 5, status: true },
  { id: 6, name: '恐龙世界', deviceId: null, deviceName: '-', price: 20, shops: ['shop1'], shopNames: '卓远亚运城店', sort: 6, status: true },
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
  { title: '排序', key: 'sort', width: 60, align: 'center' },
  { title: '项目名称', key: 'name', width: 140 },
  { title: '关联设备', key: 'deviceName', width: 160, render: (row: any) => row.deviceName || '-' },
  { title: '单价', key: 'price', width: 100, align: 'center', render: (row: any) => `¥${row.price.toFixed(2)}` },
  { title: '适用门店', key: 'shopNames', minWidth: 180 },
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
        deviceId: formData.value.deviceId,
        deviceName: deviceOptions.find(d => d.value === formData.value.deviceId)?.label || '-',
        price: formData.value.price || 0,
        shops: formData.value.shops,
        shopNames: formData.value.shops.length === shopOptions.length ? '全部门店' : formData.value.shops.map((s: string) => shopOptions.find(o => o.value === s)?.label).join('、'),
        sort: formData.value.sort || 1,
        status: formData.value.status
      }
    }
  } else {
    const newId = Math.max(...rawData.value.map(d => d.id), 0) + 1
    rawData.value.push({
      id: newId,
      name: formData.value.name,
      deviceId: formData.value.deviceId,
      deviceName: deviceOptions.find(d => d.value === formData.value.deviceId)?.label || '-',
      price: formData.value.price || 0,
      shops: formData.value.shops,
      shopNames: formData.value.shops.length === shopOptions.length ? '全部门店' : formData.value.shops.map((s: string) => shopOptions.find(o => o.value === s)?.label).join('、'),
      sort: formData.value.sort || 1,
      status: formData.value.status
    })
  }
  showModal.value = false
}
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { font-size: 20px; font-weight: 600; color: #333; margin: 0; }
.table-card { border-radius: 12px; }
</style>
