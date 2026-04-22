<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>促销活动</h1>
      <n-space>
        <n-select v-model:value="filterShop" :options="shopOptions" placeholder="选择门店" size="small" style="width: 180px;" clearable />
        <n-input placeholder="搜索活动名称..." size="small" style="width: 180px;" v-model:value="filterKeyword">
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
        <n-button type="primary" size="small" @click="handleAdd">+ 创建活动</n-button>
      </n-space>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card highlight">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="FlameOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">进行中活动</span>
          <span class="value">{{ activePromotionCount }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="EyeOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">参与人数</span>
          <span class="value">{{ totalParticipants }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="CardOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">带动消费</span>
          <span class="value">¥{{ totalRevenue.toLocaleString() }}</span>
        </div>
      </div>
    </div>

    <!-- 活动列表 -->
    <n-card class="table-card">
      <n-tabs type="line" v-model:value="activeTab">
        <n-tab name="all">全部</n-tab>
        <n-tab name="enabled">启用</n-tab>
        <n-tab name="disabled">停售</n-tab>
      </n-tabs>
      <n-data-table :columns="columns" :data="filteredData" :pagination="pagination" />
    </n-card>

    <!-- 创建/编辑活动弹窗 -->
    <n-modal v-model:show="showModal" preset="card" :title="modalTitle" style="width: 700px;">
      <n-form :model="formData" label-placement="left" label-width="100px" :rules="formRules">
        <n-form-item label="售卖门店" path="shop" required>
          <n-select v-model:value="formData.shop" :options="shopOptions" placeholder="选择售卖的门店" />
        </n-form-item>
        <n-form-item label="活动名称" path="name" required>
          <n-input v-model:value="formData.name" placeholder="如：周末限时特惠" />
        </n-form-item>
        <n-form-item label="促销类型" path="type" required>
          <n-select v-model:value="formData.type" :options="promoTypeOptions" />
        </n-form-item>

        <!-- 套餐促销：选择套餐 -->
        <n-form-item v-if="formData.type === 'package'" label="选择套餐" path="targetId" required>
          <n-select v-model:value="formData.targetId" :options="packageOptions" placeholder="选择要促销的套餐" />
        </n-form-item>
        <n-grid v-if="formData.type === 'package'" :cols="2" :x-gap="16">
          <n-gi>
            <n-form-item label="原价" path="originalPrice" required>
              <n-input-number v-model:value="formData.originalPrice" :min="0" style="width: 100%;">
                <template #suffix>元</template>
              </n-input-number>
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="促销价" path="promoPrice" required>
              <n-input-number v-model:value="formData.promoPrice" :min="0" style="width: 100%;">
                <template #suffix>元</template>
              </n-input-number>
            </n-form-item>
          </n-gi>
        </n-grid>

        <!-- 全场打折：折扣比例 -->
        <n-form-item v-if="formData.type === 'discount'" label="折扣比例" path="discountRate" required>
          <n-input-number v-model:value="formData.discountRate" :min="1" :max="99" style="width: 150px;">
            <template #suffix>折</template>
          </n-input-number>
          <span class="form-hint" style="margin-left: 8px;">* 8.5折则输入85</span>
        </n-form-item>

        <!-- 满额立减：消费门槛 -->
        <n-grid v-if="formData.type === 'threshold'" :cols="2" :x-gap="16">
          <n-gi>
            <n-form-item label="消费门槛" path="threshold" required>
              <n-input-number v-model:value="formData.threshold" :min="0" style="width: 100%;" placeholder="0表示无门槛">
                <template #suffix>元</template>
              </n-input-number>
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="立减金额" path="thresholdDiscount" required>
              <n-input-number v-model:value="formData.thresholdDiscount" :min="1" style="width: 100%;">
                <template #suffix>元</template>
              </n-input-number>
            </n-form-item>
          </n-gi>
        </n-grid>

        <n-grid :cols="2" :x-gap="16">
          <n-gi>
            <n-form-item label="开始时间" path="startTime" required>
              <n-date-picker v-model:value="formData.startTime" type="datetime" style="width: 100%;" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="结束时间" path="endTime" required>
              <n-date-picker v-model:value="formData.endTime" type="datetime" style="width: 100%;" />
            </n-form-item>
          </n-gi>
        </n-grid>
        <n-form-item label="可购会员">
          <n-checkbox-group v-model:value="formData.memberTypes">
            <n-space>
              <n-checkbox value="bronze" label="青铜" />
              <n-checkbox value="silver" label="白银" />
              <n-checkbox value="gold" label="黄金" />
              <n-checkbox value="normal" label="普通会员" />
            </n-space>
          </n-checkbox-group>
        </n-form-item>
        <n-form-item label="可售终端">
          <n-select v-model:value="formData.terminal" :options="terminalOptions" style="width: 200px;" />
        </n-form-item>
        <n-form-item label="活动状态">
          <n-radio-group v-model:value="formData.status">
            <n-space>
              <n-radio :value="true">启用</n-radio>
              <n-radio :value="false">暂停</n-radio>
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
  NFormItem, NTabs, NTab, NGrid, NGi, NTag, NDropdown,
  NDatePicker, NSelect, NCheckbox, NCheckboxGroup, NRadio, NRadioGroup, NInputNumber
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import {
  SearchOutline, FlameOutline, EyeOutline, CardOutline,
  EllipsisHorizontalOutline
} from '@vicons/ionicons5'

const activeTab = ref('all')
const showModal = ref(false)
const isEdit = ref(false)
const modalTitle = ref('创建促销活动')
const filterShop = ref(null)
const filterKeyword = ref('')

const shopOptions = [
  { label: '卓远亚运城店', value: 'shop1' },
  { label: '卓远天河路店', value: 'shop2' },
  { label: '卓远北京路店', value: 'shop3' }
]

const terminalOptions = [
  { label: '全部可售', value: 'all' },
  { label: '仅收银台', value: 'cashier' },
  { label: '仅自助机', value: 'self' }
]

const packageOptions = [
  { label: '30分钟体验套餐', value: 'pkg1' },
  { label: '60分钟畅玩套餐', value: 'pkg2' },
  { label: '90分钟尊享套餐', value: 'pkg3' }
]

const promoTypeOptions = [
  { label: '套餐促销', value: 'package' },
  { label: '全场打折', value: 'discount' },
  { label: '满额立减', value: 'threshold' }
]

function getDefaultFormData() {
  return {
    id: null as number | null,
    shop: null,
    name: '',
    type: 'package',
    targetId: null,
    originalPrice: 0,
    promoPrice: 0,
    discountRate: 85,
    threshold: 0,
    thresholdDiscount: 0,
    startTime: null,
    endTime: null,
    memberTypes: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
    terminal: 'all',
    status: true
  }
}

const formData = ref(getDefaultFormData())

const formRules = {
  shop: { required: true, message: '请选择售卖的门店', trigger: 'change' },
  name: { required: true, message: '请输入活动名称', trigger: 'blur' },
  type: { required: true, message: '请选择促销类型', trigger: 'change' },
  startTime: { required: true, message: '请选择开始时间', trigger: 'change' },
  endTime: { required: true, message: '请选择结束时间', trigger: 'change' }
}

const pagination = { pageSize: 10 }

// 统计数据
const activePromotionCount = computed(() => tableData.value.filter(item => item.status === true).length)
const totalParticipants = computed(() => tableData.value.reduce((sum, item) => sum + item.participants, 0))
const totalRevenue = computed(() => tableData.value.reduce((sum, item) => sum + item.revenue, 0))


// 计算促销内容描述
function getPromoContent(row: any): string {
  if (row.type === 'package') {
    return `¥${row.originalPrice} → ¥${row.promoPrice}`
  }
  if (row.type === 'discount') {
    return `${row.discountRate}折`
  }
  if (row.type === 'threshold') {
    if (row.threshold > 0) {
      return `满${row.threshold}减${row.thresholdDiscount}`
    }
    return `立减${row.thresholdDiscount}元`
  }
  return '-'
}

const columns: DataTableColumns = [
  { title: '所属门店', key: 'shopName', width: 150 },
  { title: '活动名称', key: 'name', width: 160 },
  { title: '促销类型', key: 'type', width: 110, render: (row) => {
    const map: Record<string, string> = { package: '套餐促销', discount: '全场打折', threshold: '满额立减' }
    return map[row.type] || '-'
  }},
  { title: '促销内容', key: 'content', width: 140, render: (row) => getPromoContent(row) },
  { title: '参与人数', key: 'participants', width: 100 },
  { title: '带动消费', key: 'revenue', width: 120, render: (row) => `¥${row.revenue.toLocaleString()}` },
  { title: '有效期', key: 'dateRange', width: 180, render: (row) => `${row.startDate} ~ ${row.endDate}` },
  { title: '状态', key: 'status', width: 90, render: (row) =>
    h(NTag, { type: row.status ? 'success' : 'warning', size: 'small' },
      { default: () => row.status ? '启用' : '停售' })
  },
  { title: '操作', key: 'actions', width: 120, render: (row) => {
    const options = [
      { label: '编辑', key: 'edit' },
      { label: row.status ? '停售' : '启用', key: 'toggle' },
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
  { id: 1, shopName: '卓远亚运城店', name: '周末限时特惠', type: 'package', targetId: 'pkg1', originalPrice: 100, promoPrice: 80, discountRate: 0, threshold: 0, thresholdDiscount: 0, participants: 356, revenue: 12800, startDate: '2026-04-01', endDate: '2026-04-30', status: true },
  { id: 2, shopName: '卓远天河路店', name: '会员日专享', type: 'discount', targetId: null, originalPrice: 0, promoPrice: 0, discountRate: 80, threshold: 0, thresholdDiscount: 0, participants: 280, revenue: 9200, startDate: '2026-04-15', endDate: '2026-04-30', status: true },
  { id: 3, shopName: '卓远亚运城店', name: '消费满200减50', type: 'threshold', targetId: null, originalPrice: 0, promoPrice: 0, discountRate: 0, threshold: 200, thresholdDiscount: 50, participants: 520, revenue: 28600, startDate: '2026-05-01', endDate: '2026-05-07', status: false },
  { id: 4, shopName: '卓远北京路店', name: '新客全场立减20', type: 'threshold', targetId: null, originalPrice: 0, promoPrice: 0, discountRate: 0, threshold: 0, thresholdDiscount: 20, participants: 680, revenue: 35200, startDate: '2026-01-25', endDate: '2026-02-05', status: false },
])

// 根据tab筛选数据
const filteredData = computed(() => {
  let data = tableData.value
  if (filterShop.value) {
    const shopMap: Record<string, string> = { shop1: '卓远亚运城店', shop2: '卓远天河路店', shop3: '卓远北京路店' }
    data = data.filter(item => item.shopName === shopMap[filterShop.value])
  }
  if (filterKeyword.value) {
    data = data.filter(item => item.name.includes(filterKeyword.value))
  }
  if (activeTab.value === 'enabled') {
    data = data.filter(item => item.status === true)
  } else if (activeTab.value === 'disabled') {
    data = data.filter(item => item.status === false)
  }
  return data
})

function handleAdd() {
  isEdit.value = false
  modalTitle.value = '创建促销活动'
  formData.value = getDefaultFormData()
  showModal.value = true
}

function handleEdit(row: any) {
  isEdit.value = true
  modalTitle.value = '编辑促销活动'
  formData.value = {
    id: row.id,
    shop: 'shop1',
    name: row.name,
    type: row.type,
    targetId: row.targetId,
    originalPrice: row.originalPrice,
    promoPrice: row.promoPrice,
    discountRate: row.discountRate || 85,
    threshold: row.threshold || 0,
    thresholdDiscount: row.thresholdDiscount || 0,
    startTime: null,
    endTime: null,
    memberTypes: ['bronze', 'silver', 'gold', 'normal'],
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
.stat-card.highlight { border: 1px solid #3B82F6; }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-content { display: flex; flex-direction: column; gap: 4px; }
.stat-content .label { font-size: 13px; color: #666; }
.stat-content .value { font-size: 24px; font-weight: 600; color: #333; }
.table-card { border-radius: 12px; }
.form-hint { font-size: 12px; color: #999; }
</style>
