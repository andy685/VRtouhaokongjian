<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>商家管理</h1>
        <p class="header-desc">管理您旗下的商家，协助商家开设店铺</p>
      </div>
      <n-space>
        <n-input v-model:value="searchText" placeholder="搜索商家名称..." size="small" style="width: 200px;">
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
        <n-button type="primary" @click="showAddModal = true">
          <template #icon><n-icon :component="AddOutline" /></template> 新增商家
        </n-button>
      </n-space>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="PeopleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">旗下商家</span>
          <span class="value">12</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="CheckmarkCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">正常营业</span>
          <span class="value">10</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="StorefrontOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">旗下店铺</span>
          <span class="value">36</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
          <n-icon :component="TrendingUpOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">本月分润</span>
          <span class="value">¥128K</span>
        </div>
      </div>
    </div>

    <div class="content-card">
      <n-data-table :columns="columns" :data="filteredData" :pagination="pagination" striped />
    </div>

    <!-- 新增/编辑弹窗 -->
    <n-modal v-model:show="showAddModal" preset="card" :title="isEdit ? '编辑商家' : '新增商家'" style="width: 520px;" :bordered="false">
      <n-form ref="formRef" :model="form" :rules="formRules" label-placement="left" label-width="100">
        <n-form-item label="商家名称" path="name">
          <n-input v-model:value="form.name" placeholder="请输入商家名称" />
        </n-form-item>
        <n-form-item label="联系人" path="contact">
          <n-input v-model:value="form.contact" placeholder="请输入联系人姓名" />
        </n-form-item>
        <n-form-item label="联系电话" path="phone">
          <n-input v-model:value="form.phone" placeholder="请输入联系电话" />
        </n-form-item>
        <n-form-item label="负责区域">
          <n-select v-model:value="form.region" :options="regionOptions" placeholder="请选择区域" />
        </n-form-item>
        <n-form-item label="商家状态">
          <n-radio-group v-model:value="form.status">
            <n-radio value="active">正常</n-radio>
            <n-radio value="pending">待审核</n-radio>
            <n-radio value="inactive">停用</n-radio>
          </n-radio-group>
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showAddModal = false">取消</n-button>
          <n-button type="primary" @click="handleSave">保存</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { NButton, NDataTable, NTag, NSpace, NInput, NModal, NForm, NFormItem, NSelect, NRadioGroup, NRadio, NIcon, useMessage, type FormInst, type FormRules } from 'naive-ui'
import { SearchOutline, AddOutline, PeopleOutline, StorefrontOutline, TrendingUpOutline, CheckmarkCircleOutline, EyeOutline, CreateOutline } from '@vicons/ionicons5'

const message = useMessage()
const searchText = ref('')

const regionOptions = [
  { label: '深圳', value: '深圳' },
  { label: '广州', value: '广州' },
  { label: '东莞', value: '东莞' },
]

const columns = [
  { title: '商家名称', key: 'name', width: 180 },
  { title: '联系人', key: 'contact', width: 100 },
  { title: '联系电话', key: 'phone', width: 130 },
  { title: '负责区域', key: 'region', width: 100 },
  {
    title: '状态', key: 'status', width: 90,
    render: (row: any) => h(NTag, { type: row.status === 'active' ? 'success' : row.status === 'pending' ? 'warning' : 'default', size: 'small' },
      () => row.status === 'active' ? '正常' : row.status === 'pending' ? '待审核' : '停用')
  },
  { title: '旗下店铺', key: 'storeCount', width: 100 },
  { title: '会员数', key: 'memberCount', width: 90 },
  { title: '本月游戏豆充值', key: 'monthRecharge', width: 150 },
  {
    title: '操作', key: 'actions', width: 150, fixed: 'right',
    render: (row: any) => h(NSpace, { size: 'small' }, {
      default: () => [
        h(NButton, { size: 'tiny', quaternary: true, type: 'info', onClick: () => openDetail(row) }, {
          default: () => '详情', icon: () => h(NIcon, { component: EyeOutline, size: 14 })
        }),
        h(NButton, { size: 'tiny', quaternary: true, type: 'primary', onClick: () => openEdit(row) }, {
          default: () => '编辑', icon: () => h(NIcon, { component: CreateOutline, size: 14 })
        }),
      ]
    })
  },
]

const merchantData = ref([
  { id: 1, name: '恒然集团', contact: '陈总', phone: '13800001101', region: '深圳', status: 'active', storeCount: 8, memberCount: 3280, monthRecharge: '¥156,800' },
  { id: 2, name: '南山科创', contact: '赵总', phone: '13800001106', region: '深圳', status: 'active', storeCount: 6, memberCount: 2450, monthRecharge: '¥134,600' },
  { id: 3, name: '宝安体验中心', contact: '钱总', phone: '13800001109', region: '深圳', status: 'active', storeCount: 2, memberCount: 560, monthRecharge: '¥45,600' },
  { id: 4, name: '龙岗欢乐时光', contact: '孙总', phone: '13800001110', region: '深圳', status: 'active', storeCount: 1, memberCount: 320, monthRecharge: '¥23,400' },
  { id: 5, name: '东莞松山湖店', contact: '周总', phone: '13800001111', region: '东莞', status: 'pending', storeCount: 1, memberCount: 0, monthRecharge: '¥0' },
])

const pagination = { pageSize: 10 }

const filteredData = computed(() => {
  let data = [...merchantData.value]
  if (searchText.value) {
    const kw = searchText.value.toLowerCase()
    data = data.filter(d => d.name.toLowerCase().includes(kw) || d.contact.toLowerCase().includes(kw))
  }
  return data
})

// 新增/编辑
const showAddModal = ref(false)
const isEdit = ref(false)
const currentId = ref<number | null>(null)
const formRef = ref<FormInst | null>(null)
const form = ref({ name: '', contact: '', phone: '', region: '', status: 'active' })
const formRules: FormRules = {
  name: { required: true, message: '请输入商家名称', trigger: 'blur' },
  contact: { required: true, message: '请输入联系人', trigger: 'blur' },
  phone: { required: true, message: '请输入联系电话', trigger: 'blur' },
}

function openEdit(row: any) {
  isEdit.value = true
  currentId.value = row.id
  form.value = { name: row.name, contact: row.contact, phone: row.phone, region: row.region, status: row.status }
  showAddModal.value = true
}

function openDetail(row: any) {
  message.info(`查看商家详情：${row.name}（待实现）`)
}

function handleSave() {
  formRef.value?.validate((errors) => {
    if (errors) return
    if (isEdit.value && currentId.value) {
      const idx = merchantData.value.findIndex(d => d.id === currentId.value)
      if (idx !== -1) {
        merchantData.value[idx] = { ...merchantData.value[idx], ...form.value }
        message.success('商家信息已更新')
      }
    } else {
      merchantData.value.unshift({
        id: Date.now(),
        ...form.value,
        storeCount: 0,
        memberCount: 0,
        monthRecharge: '¥0',
      })
      message.success('商家新增成功')
    }
    showAddModal.value = false
    isEdit.value = false
    currentId.value = null
    form.value = { name: '', contact: '', phone: '', region: '', status: 'active' }
  })
}
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.header-desc { font-size: 13px; color: var(--text-muted); margin-top: 4px; display: block; }
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: white; border-radius: 14px; padding: 20px; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 16px; }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-content { display: flex; flex-direction: column; }
.stat-content .label { font-size: 12px; color: var(--text-muted); }
.stat-content .value { font-family: 'Orbitron', sans-serif; font-size: 22px; font-weight: 700; color: var(--text-primary); }
.content-card { background: white; border-radius: 16px; padding: 24px; border: 1px solid var(--border-color); }
</style>
