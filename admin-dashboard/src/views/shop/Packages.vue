<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>套票管理</h1>
      <n-space>
        <n-select v-model:value="filterShop" :options="shopOptions" placeholder="选择店铺" size="small" style="width: 180px;" clearable />
        <n-input placeholder="搜索套票名称..." size="small" style="width: 180px;" v-model:value="filterKeyword">
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
        <n-button type="primary" size="small" @click="handleAdd">+ 新建套票</n-button>
      </n-space>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="TicketOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">在售套票</span>
          <span class="value">8</span>
        </div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="BagOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">本月销售</span>
          <span class="value success">156</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="CashOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">套票收入</span>
          <span class="value">¥28,600</span>
        </div>
      </div>
    </div>

    <!-- 套票列表 -->
    <n-card class="table-card">
      <n-tabs type="line" v-model:value="activeTab">
        <n-tab name="all">全部</n-tab>
        <n-tab name="time">计时票</n-tab>
        <n-tab name="count">计次票</n-tab>
      </n-tabs>
      <n-data-table :columns="columns" :data="tableData" :pagination="pagination" />
    </n-card>

    <!-- 新增/编辑套票弹窗 -->
    <n-modal v-model:show="showModal" preset="card" :title="modalTitle" style="width: 650px;">
      <n-form :model="formData" label-placement="left" label-width="100px" :rules="formRules">
        <n-form-item label="套票封面" path="coverUrl">
          <div class="cover-upload">
            <div class="cover-wrap" @click="triggerCoverUpload">
              <img v-if="formData.coverUrl" :src="formData.coverUrl" class="cover-img" />
              <div v-else class="cover-placeholder">
                <span>上传封面</span>
                <small>用于套票列表展示</small>
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
        <n-form-item label="售卖店铺" path="shop" required>
          <n-select v-model:value="formData.shop" :options="shopOptions" placeholder="选择售卖的店铺" />
        </n-form-item>
        <n-form-item label="套票名称" path="name" required>
          <n-input v-model:value="formData.name" placeholder="如：10次游戏卡" />
        </n-form-item>
        <n-form-item label="套票类型" path="type" required>
          <n-radio-group v-model:value="formData.type">
            <n-space>
              <n-radio value="time">计时票</n-radio>
              <n-radio value="count">计次票</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="售价" path="price" required>
          <n-input-number v-model:value="formData.price" :min="0" placeholder="0.00" style="width: 100%;">
            <template #suffix>元</template>
          </n-input-number>
        </n-form-item>
        
        <!-- 计时票时显示时长 -->
        <n-form-item v-if="formData.type === 'time'" label="到账时长" path="hours" required>
          <n-input-number v-model:value="formData.hours" :min="0" placeholder="0" style="width: 100%;">
            <template #suffix>小时</template>
          </n-input-number>
        </n-form-item>
        
        <!-- 计次票时显示次数 -->
        <n-form-item v-if="formData.type === 'count'" label="到账次数" path="times" required>
          <n-input-number v-model:value="formData.times" :min="0" placeholder="0" style="width: 100%;">
            <template #suffix>次</template>
          </n-input-number>
        </n-form-item>
        
        <!-- 有效期 -->
        <n-form-item label="有效期" path="validType" required>
          <n-radio-group v-model:value="formData.validType">
            <n-space>
              <n-radio value="forever">永久有效</n-radio>
              <n-radio value="duration">有效时长</n-radio>
              <n-radio value="date">限定日期</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item v-if="formData.validType === 'duration'" label="有效时长" path="validDays" required>
          <n-input-number v-model:value="formData.validDays" :min="1" placeholder="30" style="width: 200px;">
            <template #suffix>天</template>
          </n-input-number>
          <span class="form-hint" style="margin-left: 8px;">* 自购买日起算</span>
        </n-form-item>
        <n-form-item v-if="formData.validType === 'date'" label="截止日期" path="validDate" required>
          <n-date-picker v-model:value="formData.validDate" type="date" placeholder="选择截止日期" />
        </n-form-item>
        
        <n-form-item label="排序" path="sort">
          <n-input-number v-model:value="formData.sort" :min="0" placeholder="1" style="width: 200px;" />
        </n-form-item>
        <n-form-item label="适用项目" path="projects" required>
          <n-checkbox-group v-model:value="formData.projects">
            <n-space>
              <n-checkbox value="vr_shooting" label="VR射击" />
              <n-checkbox value="vr_racing" label="VR赛车" />
              <n-checkbox value="vr_horror" label="VR恐怖" />
              <n-checkbox value="screen_interact" label="银幕互动" />
              <n-checkbox value="ar_explore" label="AR探索" />
            </n-space>
          </n-checkbox-group>
        </n-form-item>
        <n-form-item label="可购会员" path="memberTypes" required>
          <n-checkbox-group v-model:value="formData.memberTypes">
            <n-space>
              <n-checkbox value="bronze" label="青铜" />
              <n-checkbox value="silver" label="白银" />
              <n-checkbox value="gold" label="黄金" />
              <n-checkbox value="normal" label="普通会员" />
            </n-space>
          </n-checkbox-group>
        </n-form-item>
        <n-form-item label="可售终端" path="terminal">
          <n-select v-model:value="formData.terminal" :options="terminalOptions" style="width: 200px;" />
        </n-form-item>
        <n-form-item label="售卖状态" path="status" required>
          <n-radio-group v-model:value="formData.status">
            <n-space>
              <n-radio :value="true">启用</n-radio>
              <n-radio :value="false">禁用</n-radio>
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
import { ref, h } from 'vue'
import {
  NCard, NDataTable, NButton, NSpace, NInput, NIcon, NModal, NForm,
  NFormItem, NInputNumber, NSwitch, NTabs, NTab, NGrid, NGi, NTag, NDropdown,
  NCheckbox, NCheckboxGroup, NSelect, NRadio, NRadioGroup, NDatePicker
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import {
  SearchOutline, TicketOutline, BagOutline, CashOutline,
  EllipsisHorizontalOutline, AddOutline
} from '@vicons/ionicons5'

const activeTab = ref('all')
const showModal = ref(false)
const isEdit = ref(false)
const modalTitle = ref('新增套票')
const filterShop = ref(null)
const filterKeyword = ref('')

const formData = ref({
  id: null as number | null,
  shop: null,
  name: '',
  coverUrl: '',
  type: 'time',
  price: null as number | null,
  hours: 0,
  times: 0,
  validType: 'forever',
  validDays: 30,
  validDate: null,
  sort: 1,
  projects: ['vr_shooting'],
  memberTypes: ['bronze', 'silver', 'gold', 'normal'],
  terminal: 'all',
  status: true
})

const formRules = {
  shop: { required: true, message: '请选择售卖店铺', trigger: 'change' },
  name: { required: true, message: '请输入套票名称', trigger: 'blur' },
  type: { required: true, message: '请选择套票类型', trigger: 'change' },
  price: { required: true, type: 'number' as const, message: '请输入售价', trigger: 'blur' },
  projects: { required: true, type: 'array' as const, message: '请选择适用项目', trigger: 'change' },
  memberTypes: { required: true, type: 'array' as const, message: '请选择可购会员', trigger: 'change' }
}

const shopOptions = [
  { label: '卓远亚运城店（测试）', value: 'shop1' },
  { label: '卓远天河路店（测试）', value: 'shop2' },
  { label: '卓远北京路店', value: 'shop3' }
]

const terminalOptions = [
  { label: '全部可售', value: 'all' },
  { label: '仅收银台', value: 'cashier' },
  { label: '仅自助机', value: 'self' }
]

const pagination = { pageSize: 10 }

const coverInputRef = ref<HTMLInputElement | null>(null)

const defaultCover = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180"><rect width="180" height="180" rx="12" fill="#ede9fe"/><rect x="24" y="24" width="132" height="132" rx="16" fill="#ddd6fe"/><rect x="48" y="54" width="34" height="34" rx="8" fill="#8b5cf6"/><rect x="92" y="60" width="48" height="10" rx="5" fill="#6d28d9"/><rect x="92" y="78" width="32" height="8" rx="4" fill="#7c3aed"/><text x="90" y="144" text-anchor="middle" font-size="13" fill="#5b21b6">套票</text></svg>')}`

function createCover(text: string, from: string, to: string) {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${from}"/><stop offset="100%" stop-color="${to}"/></linearGradient></defs><rect width="180" height="180" rx="12" fill="url(#g)"/><rect x="24" y="24" width="132" height="132" rx="16" fill="rgba(255,255,255,0.14)"/><text x="90" y="96" text-anchor="middle" font-size="20" font-weight="700" fill="#fff">${text}</text></svg>`)}`
}

const columns: DataTableColumns = [
  { title: '封面', key: 'coverUrl', width: 92, render: (row) => h('img', {
    src: row.coverUrl || defaultCover,
    style: 'width:56px;height:56px;object-fit:cover;border-radius:8px;border:1px solid #e5e7eb;background:#f8fafc;'
  }) },
  { title: '所属店铺', key: 'shopName', width: 150 },
  { title: '套票名称', key: 'name', width: 140 },
  { title: '类型', key: 'type', width: 90, render: (row) => row.type === 'time' ? '计时票' : '计次票' },
  { title: '售价', key: 'price', width: 90, render: (row) => `¥${row.price}` },
  { title: '到账时长/次数', key: 'valueText', width: 130 },
  { title: '有效期', key: 'validText', width: 120 },
  { title: '可购会员', key: 'memberTypesText', width: 150 },
  { title: '状态', key: 'status', width: 80, render: (row) =>
    h(NTag, { type: row.status ? 'success' : 'warning', size: 'small' },
      { default: () => row.status ? '启用' : '停售' })
  },
  { title: '操作', key: 'actions', width: 100, render: (row) => {
    const options = [
      { label: '编辑', key: 'edit' },
      { label: row.status ? '暂停' : '启用', key: 'toggle' },
      { type: 'divider', key: 'd1' },
      { label: '删除', key: 'delete' }
    ]
    return h(NDropdown, { options, onSelect: (key) => handleAction(key, row) },
      { default: () => h(NButton, { quaternary: true, circle: true },
        { icon: () => h(NIcon, { component: EllipsisHorizontalOutline }) })
      })
  }}
]

const tableData = ref([
  { id: 1, shopName: '卓远亚运城店', name: '1小时体验票', coverUrl: createCover('1H', '#3b82f6', '#2563eb'), type: 'time', price: 68, hours: 1, times: 0, valueText: '1小时', validText: '30天', memberTypesText: '全部会员', sold: 520, status: true },
  { id: 2, shopName: '卓远天河路店', name: '2小时畅玩票', coverUrl: createCover('2H', '#10b981', '#059669'), type: 'time', price: 118, hours: 2, times: 0, valueText: '2小时', validText: '永久有效', memberTypesText: '黄金及以上', sold: 380, status: true },
  { id: 3, shopName: '卓远亚运城店', name: '10次卡', coverUrl: createCover('10次', '#7c3aed', '#5b21b6'), type: 'count', price: 580, hours: 0, times: 10, valueText: '10次', validText: '180天', memberTypesText: '全部会员', sold: 156, status: true },
  { id: 4, shopName: '卓远北京路店', name: '30次卡', coverUrl: createCover('30次', '#f59e0b', '#d97706'), type: 'count', price: 1580, hours: 0, times: 30, valueText: '30次', validText: '365天', memberTypesText: '铂金及以上', sold: 48, status: true },
  { id: 5, shopName: '卓远天河路店', name: '亲子套票', coverUrl: createCover('亲子', '#ec4899', '#db2777'), type: 'time', price: 198, hours: 2, times: 0, valueText: '2小时', validText: '永久有效', memberTypesText: '全部会员', sold: 86, status: false },
])

function getShopName(shop: string | null) {
  return (shopOptions.find(item => item.value === shop)?.label || '-').replace('（测试）', '')
}

function resolveShopValue(shopName: string) {
  const option = shopOptions.find(item => item.label.replace('（测试）', '') === shopName)
  return option?.value || null
}

function formatDateValue(value: number | null) {
  if (!value) return '-'
  const d = new Date(value)
  const month = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

function resolveValueText(type: string, hours: number, times: number) {
  return type === 'time' ? `${hours}小时` : `${times}次`
}

function resolveValidText(type: string, days: number, date: number | null) {
  if (type === 'duration') return `${days}天`
  if (type === 'date') return formatDateValue(date)
  return '永久有效'
}

function resolveMemberTypesText(memberTypes: string[]) {
  if (memberTypes.length === 4) return '全部会员'
  return memberTypes.map(type => {
    if (type === 'bronze') return '青铜'
    if (type === 'silver') return '白银'
    if (type === 'gold') return '黄金'
    return '普通会员'
  }).join('、')
}

function handleAdd() {
  isEdit.value = false
  modalTitle.value = '新增套票'
  formData.value = {
    id: null,
    shop: null,
    name: '',
    coverUrl: '',
    type: 'time',
    price: null,
    hours: 0,
    times: 0,
    validType: 'forever',
    validDays: 30,
    validDate: null,
    sort: 1,
    projects: ['vr_shooting'],
    memberTypes: ['bronze', 'silver', 'gold', 'normal'],
    terminal: 'all',
    status: true
  }
  showModal.value = true
}

function handleEdit(row: any) {
  isEdit.value = true
  modalTitle.value = '编辑套票'
  formData.value = {
    id: row.id,
    shop: resolveShopValue(row.shopName),
    name: row.name,
    coverUrl: row.coverUrl || '',
    type: row.type,
    price: row.price,
    hours: row.hours,
    times: row.times,
    validType: 'forever',
    validDays: 30,
    validDate: null,
    sort: 1,
    projects: ['vr_shooting'],
    memberTypes: ['bronze', 'silver', 'gold', 'normal'],
    terminal: 'all',
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
    const index = tableData.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      tableData.value.splice(index, 1)
    }
  }
}

function handleSubmit() {
  const payload = {
    shopName: getShopName(formData.value.shop),
    name: formData.value.name,
    coverUrl: formData.value.coverUrl,
    type: formData.value.type,
    price: formData.value.price || 0,
    hours: formData.value.type === 'time' ? (formData.value.hours || 0) : 0,
    times: formData.value.type === 'count' ? (formData.value.times || 0) : 0,
    valueText: resolveValueText(formData.value.type, formData.value.hours || 0, formData.value.times || 0),
    validText: resolveValidText(formData.value.validType, formData.value.validDays, formData.value.validDate),
    memberTypesText: resolveMemberTypesText(formData.value.memberTypes),
    sold: 0,
    status: formData.value.status
  }

  if (isEdit.value && formData.value.id) {
    const index = tableData.value.findIndex(item => item.id === formData.value.id)
    if (index > -1) {
      tableData.value[index] = {
        ...tableData.value[index],
        ...payload,
        sold: tableData.value[index].sold
      }
    }
  } else {
    const nextId = Math.max(...tableData.value.map(item => item.id), 0) + 1
    tableData.value.unshift({
      id: nextId,
      ...payload,
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
  if (file.size > 5 * 1024 * 1024) return
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
.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: #fff; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.stat-card.highlight { border: 1px solid #10B981; }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-content { display: flex; flex-direction: column; gap: 4px; }
.stat-content .label { font-size: 13px; color: #666; }
.stat-content .value { font-size: 24px; font-weight: 600; color: #333; }
.stat-content .value.success { color: #10B981; }
.table-card { border-radius: 12px; }
.form-hint { font-size: 12px; color: #999; }
.cover-upload { display: flex; flex-direction: column; gap: 10px; }
.cover-wrap { width: 180px; height: 180px; position: relative; border-radius: 12px; overflow: hidden; border: 1px dashed #cbd5e1; background: #f8fafc; cursor: pointer; }
.cover-wrap:hover .cover-overlay { opacity: 1; }
.cover-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.cover-placeholder { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; color: #64748b; font-size: 13px; }
.cover-placeholder small { font-size: 11px; color: #94a3b8; }
.cover-overlay { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; background: rgba(15, 23, 42, 0.45); color: #fff; opacity: 0; transition: opacity 0.2s; font-size: 12px; }
.cover-actions { display: flex; gap: 8px; }
.hidden-input { display: none; }
</style>
