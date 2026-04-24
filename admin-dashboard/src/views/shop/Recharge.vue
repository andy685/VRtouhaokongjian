<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>充值套餐</h1>
      <n-space>
        <n-select v-model:value="filterShop" :options="shopOptions" placeholder="选择门店" size="small" style="width: 180px;" clearable />
        <n-input placeholder="搜索套餐名称..." size="small" style="width: 180px;" v-model:value="filterKeyword">
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
        <n-button type="primary" size="small" @click="handleAdd">+ 新建套餐</n-button>
      </n-space>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="CardOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">在售套餐</span>
          <span class="value">12</span>
        </div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="TrendingUpOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">本月办理</span>
          <span class="value success">386</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="CashOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">套餐收入</span>
          <span class="value">¥45,280</span>
        </div>
      </div>
    </div>

    <!-- 套餐列表 -->
    <n-card class="table-card">
      <n-tabs type="line" v-model:value="activeTab">
        <n-tab name="active">启用中</n-tab>
        <n-tab name="paused">暂停</n-tab>
        <n-tab name="all">全部</n-tab>
      </n-tabs>
      <n-data-table :columns="columns" :data="tableData" :pagination="pagination" />
    </n-card>

    <!-- 新增/编辑充值套餐弹窗 -->
    <n-modal v-model:show="showModal" preset="card" :title="modalTitle" style="width: 650px;">
      <n-form :model="formData" label-placement="left" label-width="110px" :rules="formRules">
        <n-form-item label="售卖门店" path="shop" required>
          <n-select v-model:value="formData.shop" :options="shopOptions" placeholder="选择售卖的门店" />
        </n-form-item>
        <n-form-item label="套餐名称" path="name" required>
          <n-input v-model:value="formData.name" placeholder="如：充300送100" />
        </n-form-item>
        <n-form-item label="售卖金额" path="amount" required>
          <n-input-number v-model:value="formData.amount" :min="0" placeholder="0.00" style="width: 100%;">
            <template #suffix>元</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="到账预存款" path="deposit" required>
          <n-input-number v-model:value="formData.deposit" :min="0" placeholder="0.00" style="width: 100%;">
            <template #suffix>元</template>
          </n-input-number>
          <template #feedback>
            <span class="form-hint">预存款没有限制有效期</span>
          </template>
        </n-form-item>
        
        <!-- 到账游戏币 -->
        <n-form-item label="到账游戏币" path="points" required>
          <n-input-number v-model:value="formData.points" :min="0" placeholder="0" style="width: 100%;">
            <template #suffix>游戏币</template>
          </n-input-number>
        </n-form-item>
        <!-- 游戏币有效期（填写游戏币后显示） -->
        <n-form-item v-if="formData.points > 0" label="游戏币有效期" path="pointsValidType" required>
          <n-radio-group v-model:value="formData.pointsValidType">
            <n-space>
              <n-radio value="forever">永久有效</n-radio>
              <n-radio value="duration">有效时长</n-radio>
              <n-radio value="date">限定日期</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item v-if="formData.points > 0 && formData.pointsValidType === 'duration'" label="游戏币有效时长" path="pointsValidDays" required>
          <n-input-number v-model:value="formData.pointsValidDays" :min="1" placeholder="365" style="width: 200px;">
            <template #suffix>天</template>
          </n-input-number>
          <span class="form-hint" style="margin-left: 8px;">* 自充值日起算</span>
        </n-form-item>
        <n-form-item v-if="formData.points > 0 && formData.pointsValidType === 'date'" label="游戏币截止日期" path="pointsValidDate" required>
          <n-date-picker v-model:value="formData.pointsValidDate" type="date" placeholder="选择截止日期" />
        </n-form-item>
        
        <!-- 到账次数 -->
        <n-form-item label="到账次数" path="times" required>
          <n-input-number v-model:value="formData.times" :min="0" placeholder="0" style="width: 100%;">
            <template #suffix>次</template>
          </n-input-number>
        </n-form-item>
        <!-- 次数有效期（填写次数后显示） -->
        <n-form-item v-if="formData.times > 0" label="次数有效期" path="timesValidType" required>
          <n-radio-group v-model:value="formData.timesValidType">
            <n-space>
              <n-radio value="forever">永久有效</n-radio>
              <n-radio value="duration">有效时长</n-radio>
              <n-radio value="date">限定日期</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item v-if="formData.times > 0 && formData.timesValidType === 'duration'" label="次数有效时长" path="timesValidDays" required>
          <n-input-number v-model:value="formData.timesValidDays" :min="1" placeholder="365" style="width: 200px;">
            <template #suffix>天</template>
          </n-input-number>
          <span class="form-hint" style="margin-left: 8px;">* 自充值日起算</span>
        </n-form-item>
        <n-form-item v-if="formData.times > 0 && formData.timesValidType === 'date'" label="次数截止日期" path="timesValidDate" required>
          <n-date-picker v-model:value="formData.timesValidDate" type="date" placeholder="选择截止日期" />
        </n-form-item>
        
        <n-form-item label="排序" path="sort">
          <n-input-number v-model:value="formData.sort" :min="0" placeholder="1" style="width: 200px;" />
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
  NSelect, NCheckbox, NCheckboxGroup, NRadio, NRadioGroup, NDatePicker
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import {
  SearchOutline, CardOutline, TrendingUpOutline, CashOutline,
  EllipsisHorizontalOutline
} from '@vicons/ionicons5'

const activeTab = ref('active')
const showModal = ref(false)
const isEdit = ref(false)
const modalTitle = ref('新增充值套餐')
const filterShop = ref(null)
const filterKeyword = ref('')

const formData = ref({
  id: null as number | null,
  shop: null,
  name: '',
  amount: null as number | null,
  deposit: null as number | null,
  points: 0,
  pointsValidType: 'forever',
  pointsValidDays: 365,
  pointsValidDate: null,
  times: 0,
  timesValidType: 'forever',
  timesValidDays: 365,
  timesValidDate: null,
  sort: 1,
  memberTypes: ['bronze', 'silver', 'gold', 'normal'],
  terminal: 'all',
  status: true
})

const formRules = {
  shop: { required: true, message: '请选择售卖门店', trigger: 'change' },
  name: { required: true, message: '请输入套餐名称', trigger: 'blur' },
  amount: { required: true, type: 'number' as const, message: '请输入售卖金额', trigger: 'blur' },
  deposit: { required: true, type: 'number' as const, message: '请输入到账预存款', trigger: 'blur' },
  points: { required: true, type: 'number' as const, message: '请输入到账游戏币', trigger: 'blur' },
  times: { required: true, type: 'number' as const, message: '请输入到账次数', trigger: 'blur' },
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

const columns: DataTableColumns = [
  { title: '所属门店', key: 'shopName', width: 150 },
  { title: '套餐名称', key: 'name', width: 150 },
  { title: '售卖金额', key: 'amount', width: 100, render: (row) => `¥${row.amount}` },
  { title: '到账预存款', key: 'deposit', width: 120, render: (row) => `¥${row.deposit}` },
  { title: '到账游戏币', key: 'points', width: 100 },
  { title: '游戏币有效期', key: 'pointsValidText', width: 140 },
  { title: '到账次数', key: 'times', width: 100 },
  { title: '次数有效期', key: 'timesValidText', width: 140 },
  { title: '状态', key: 'status', width: 80, render: (row) =>
    h(NTag, { type: row.status ? 'success' : 'warning', size: 'small' },
      { default: () => row.status ? '启用' : '暂停' })
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
  { id: 1, shopName: '卓远亚运城店', name: '充100送20', amount: 100, deposit: 120, points: 100, pointsValidText: '永久有效', times: 0, timesValidText: '-', status: true },
  { id: 2, shopName: '卓远天河路店', name: '充300送100', amount: 300, deposit: 400, points: 300, pointsValidText: '365天', times: 0, timesValidText: '-', status: true },
  { id: 3, shopName: '卓远亚运城店', name: '充500送200', amount: 500, deposit: 700, points: 500, pointsValidText: '永久有效', times: 1, timesValidText: '365天', status: true },
  { id: 4, shopName: '卓远北京路店', name: '充1000送500', amount: 1000, deposit: 1500, points: 1000, pointsValidText: '2026-12-31', times: 2, timesValidText: '永久有效', status: true },
  { id: 5, shopName: '卓远天河路店', name: '月度会员卡', amount: 200, deposit: 220, points: 200, pointsValidText: '永久有效', times: 30, timesValidText: '30天', status: true },
])

function handleAdd() {
  isEdit.value = false
  modalTitle.value = '新增充值套餐'
  formData.value = {
    id: null,
    shop: null,
    name: '',
    amount: null,
    deposit: null,
    points: 0,
    pointsValidType: 'forever',
    pointsValidDays: 365,
    pointsValidDate: null,
    times: 0,
    timesValidType: 'forever',
    timesValidDays: 365,
    timesValidDate: null,
    sort: 1,
    memberTypes: ['bronze', 'silver', 'gold', 'normal'],
    terminal: 'all',
    status: true
  }
  showModal.value = true
}

function handleEdit(row: any) {
  isEdit.value = true
  modalTitle.value = '编辑充值套餐'
  formData.value = {
    id: row.id,
    shop: 'shop1',
    name: row.name,
    amount: row.amount,
    deposit: row.deposit,
    points: row.points,
    pointsValidType: 'forever',
    pointsValidDays: 365,
    pointsValidDate: null,
    times: row.times,
    timesValidType: 'forever',
    timesValidDays: 365,
    timesValidDate: null,
    sort: 1,
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
  console.log(formData.value)
  showModal.value = false
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
</style>
