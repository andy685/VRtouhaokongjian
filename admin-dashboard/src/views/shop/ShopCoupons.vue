<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>优惠券管理</h1>
      <n-space>
        <n-select v-model:value="filterShop" :options="shopOptions" placeholder="选择店铺" size="small" style="width: 180px;" clearable />
        <n-input placeholder="搜索优惠券名称..." size="small" style="width: 180px;" v-model:value="filterKeyword">
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
        <n-button type="primary" size="small" @click="handleAdd">+ 创建优惠券</n-button>
      </n-space>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card highlight">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="TicketOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">进行中活动</span>
          <span class="value">{{ activeCouponCount }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="DownloadOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">已领取</span>
          <span class="value">{{ totalClaimed }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="CheckmarkCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">已使用</span>
          <span class="value">{{ totalUsed }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #EF4444, #DC2626);">
          <n-icon :component="PricetagsOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">优惠总额</span>
          <span class="value">¥{{ totalDiscount }}</span>
        </div>
      </div>
    </div>

    <!-- 优惠券列表 -->
    <n-card class="table-card">
      <n-tabs type="line" v-model:value="activeTab">
        <n-tab name="all">全部</n-tab>
        <n-tab name="enabled">启用</n-tab>
        <n-tab name="disabled">暂停</n-tab>
      </n-tabs>
      <n-data-table :columns="columns" :data="filteredData" :pagination="pagination" />
    </n-card>

    <!-- 手动发券弹窗 -->
    <n-modal v-model:show="showManualSendModal" preset="card" title="手动发券" style="width: 520px;">
      <n-form label-placement="left" label-width="90px">
        <n-form-item label="优惠券">
          <n-input :value="manualSendCoupon?.name" disabled />
        </n-form-item>
        <n-form-item label="发放对象" required>
          <n-radio-group v-model:value="manualSendTargetType">
            <n-space>
              <n-radio value="member">指定会员</n-radio>
              <n-radio value="phone">输入手机号</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item v-if="manualSendTargetType === 'member'" label="选择会员" required>
          <n-select
            v-model:value="manualSendMembers"
            multiple
            filterable
            placeholder="搜索会员姓名/手机号"
            :options="memberOptions"
            :max-tag-count="3"
          />
        </n-form-item>
        <n-form-item v-if="manualSendTargetType === 'phone'" label="手机号" required>
          <n-input
            v-model:value="manualSendPhones"
            type="textarea"
            placeholder="输入手机号，多个用换行或逗号分隔"
            :rows="4"
          />
        </n-form-item>
        <n-form-item label="发放数量" required>
          <n-input-number v-model:value="manualSendCount" :min="1" :max="100" style="width: 150px;">
            <template #suffix>张/人</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="发放备注">
          <n-input v-model:value="manualSendRemark" placeholder="可选填备注信息" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="center">
          <n-button @click="showManualSendModal = false">取消</n-button>
          <n-button type="primary" @click="handleManualSendSubmit">确认发放</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 新增/编辑优惠券弹窗 -->
    <n-modal v-model:show="showModal" preset="card" :title="modalTitle" style="width: 650px;">
      <n-form :model="formData" label-placement="left" label-width="100px" :rules="formRules">
        <n-form-item label="售卖店铺" path="shop" required>
          <n-select v-model:value="formData.shop" :options="shopOptions" placeholder="选择售卖的店铺" />
        </n-form-item>
        <n-form-item label="优惠券名称" path="name" required>
          <n-input v-model:value="formData.name" placeholder="如：新人专享券" />
        </n-form-item>

        <!-- 优惠类型选择 -->
        <n-grid :cols="2" :x-gap="16">
          <n-gi>
            <n-form-item label="优惠类型" path="type" required>
              <n-select v-model:value="formData.type" :options="typeOptions" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <!-- 满减券：优惠金额 -->
            <n-form-item v-if="formData.type === 'discount'" label="优惠金额" path="value" required>
              <n-input-number v-model:value="formData.value" :min="1" style="width: 100%;">
                <template #suffix>元</template>
              </n-input-number>
            </n-form-item>
            <!-- 折扣券：折扣比例 -->
            <n-form-item v-if="formData.type === 'rate'" label="折扣比例" path="value" required>
              <n-input-number v-model:value="formData.value" :min="1" :max="99" style="width: 100%;">
                <template #suffix>折</template>
              </n-input-number>
            </n-form-item>
            <!-- 特价券：一口价 -->
            <n-form-item v-if="formData.type === 'special'" label="一口价" path="specialPrice" required>
              <n-input-number v-model:value="formData.specialPrice" :min="0.01" :precision="2" style="width: 100%;">
                <template #suffix>元</template>
              </n-input-number>
            </n-form-item>
            <!-- 特价券：适用项目 -->
            <n-form-item v-if="formData.type === 'special'" label="适用项目" path="specialItems" required>
              <n-select
                v-model:value="formData.specialItems"
                multiple
                filterable
                placeholder="选择适用的消费项目"
                :options="productOptions"
                :max-tag-count="2"
              />
            </n-form-item>
            <!-- 兑换券：兑换项目 -->
            <n-form-item v-if="formData.type === 'exchange'" label="兑换内容" path="exchangeItems" required>
              <n-select
                v-model:value="formData.exchangeItems"
                multiple
                filterable
                placeholder="选择可兑换的消费项目"
                :options="productOptions"
                :max-tag-count="2"
              />
            </n-form-item>
          </n-gi>
        </n-grid>

        <!-- 使用门槛 -->
        <n-form-item label="使用门槛" path="threshold">
          <n-input-number v-model:value="formData.threshold" :min="0" placeholder="满X元可用" style="width: 100%;">
            <template #prefix>满</template>
            <template #suffix>元</template>
          </n-input-number>
        </n-form-item>

        <!-- 发放设置 -->
        <n-grid :cols="2" :x-gap="16">
          <n-gi>
            <n-form-item label="发放数量">
              <n-input-number v-model:value="formData.total" :min="0" style="width: 100%;" placeholder="0表示不限量" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="每人限领">
              <n-input-number v-model:value="formData.limit" :min="1" style="width: 100%;" />
            </n-form-item>
          </n-gi>
        </n-grid>

        <!-- 使用有效期 -->
        <n-form-item label="使用有效期" path="validType" required>
          <n-radio-group v-model:value="formData.validType">
            <n-space>
              <n-radio value="days">领取后X天有效</n-radio>
              <n-radio value="date">截止到指定日期</n-radio>
              <n-radio value="forever">永久有效</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item v-if="formData.validType === 'days'" label="有效时长" path="validDays" required>
          <n-input-number v-model:value="formData.validDays" :min="1" style="width: 200px;" placeholder="30">
            <template #suffix>天</template>
          </n-input-number>
          <span class="form-hint" style="margin-left: 8px;">* 自领取之日起算</span>
        </n-form-item>
        <n-form-item v-if="formData.validType === 'date'" label="截止日期" path="validEndDate" required>
          <n-date-picker v-model:value="formData.validEndDate" type="date" style="width: 100%;" placeholder="选择截止日期" />
        </n-form-item>

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
import { ref, computed, h } from 'vue'
import {
  NCard, NDataTable, NButton, NSpace, NInput, NIcon, NModal, NForm,
  NFormItem, NInputNumber, NTabs, NTab, NGrid, NGi, NTag, NDropdown,
  NDatePicker, NSelect, NCheckbox, NCheckboxGroup, NRadio, NRadioGroup,
  useMessage
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import {
  SearchOutline, TicketOutline, DownloadOutline, CheckmarkCircleOutline,
  PricetagsOutline, EllipsisHorizontalOutline
} from '@vicons/ionicons5'

const message = useMessage()

const activeTab = ref('active')
const showModal = ref(false)
const isEdit = ref(false)
const modalTitle = ref('创建优惠券')
const filterShop = ref(null)
const filterKeyword = ref('')

// 手动发券
const showManualSendModal = ref(false)
const manualSendCoupon = ref<any>(null)
const manualSendTargetType = ref<'member' | 'phone'>('member')
const manualSendMembers = ref<string[]>([])
const manualSendPhones = ref('')
const manualSendCount = ref(1)
const manualSendRemark = ref('')

const memberOptions = [
  { label: '张小明 (138****1234)', value: 'm1' },
  { label: '李小红 (139****5678)', value: 'm2' },
  { label: '王小强 (137****9012)', value: 'm3' },
  { label: '陈小芳 (136****3456)', value: 'm4' },
  { label: '刘大伟 (135****7890)', value: 'm5' },
]

function openManualSend(row: any) {
  manualSendCoupon.value = row
  manualSendTargetType.value = 'member'
  manualSendMembers.value = []
  manualSendPhones.value = ''
  manualSendCount.value = 1
  manualSendRemark.value = ''
  showManualSendModal.value = true
}

function handleManualSendSubmit() {
  console.log('手动发券:', {
    coupon: manualSendCoupon.value?.name,
    targetType: manualSendTargetType.value,
    members: manualSendMembers.value,
    phones: manualSendPhones.value,
    count: manualSendCount.value,
    remark: manualSendRemark.value,
  })
  showManualSendModal.value = false
  message.success('手动发券成功')
}

const shopOptions = [
  { label: '卓远亚运城店', value: 'shop1' },
  { label: '卓远天河路店', value: 'shop2' },
  { label: '卓远北京路店', value: 'shop3' }
]

const productOptions = [
  { label: 'VR体验套餐A', value: 'product1' },
  { label: 'VR体验套餐B', value: 'product2' },
  { label: 'VR体验套餐C', value: 'product3' },
  { label: '可乐', value: 'product4' },
  { label: '薯片', value: 'product5' },
  { label: 'VR周边T恤', value: 'product6' },
]

function getDefaultFormData() {
  return {
    id: null as number | null,
    shop: null,
    name: '',
    type: 'discount',
    value: 10,
    specialPrice: 9.9,
    originalPrice: 48,
    specialItems: [] as string[],
    exchangeItems: [] as string[],
    threshold: 0,
    total: 0,
    limit: 1,
    validType: 'days',
    validDays: 30,
    validEndDate: null,
    memberTypes: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
    terminal: 'all',
    status: true
  }
}

const formData = ref(getDefaultFormData())

const formRules = {
  shop: { required: true, message: '请选择售卖的店铺', trigger: 'change' },
  name: { required: true, message: '请输入优惠券名称', trigger: 'blur' },
  type: { required: true, message: '请选择优惠类型', trigger: 'change' },
  value: { required: true, message: '请输入优惠内容', trigger: 'blur' }
}

const typeOptions = [
  { label: '满减券', value: 'discount' },
  { label: '折扣券', value: 'rate' },
  { label: '特价券', value: 'special' },
  { label: '兑换券', value: 'exchange' }
]

const terminalOptions = [
  { label: '全部可售', value: 'all' },
  { label: '仅收银台', value: 'cashier' },
  { label: '仅自助机', value: 'self' }
]
const pagination = { pageSize: 10 }

// 统计数据
const activeCouponCount = computed(() => tableData.value.filter(item => item.status === true).length)
const totalClaimed = computed(() => tableData.value.reduce((sum, item) => sum + item.claimed, 0))
const totalUsed = computed(() => tableData.value.reduce((sum, item) => sum + item.used, 0))
const totalDiscount = computed(() => {
  return tableData.value.reduce((sum, item) => {
    // 满减券直接加优惠金额
    if (item.type === 'discount') {
      return sum + item.value * item.used
    }
    // 折扣券按平均折扣估算
    if (item.type === 'rate') {
      return sum + Math.round(item.value * item.used * 0.1) // 假设平均消费100元
    }
    return sum
  }, 0)
})

const columns: DataTableColumns = [
  { title: '所属店铺', key: 'shopName', width: 150 },
  { title: '优惠券名称', key: 'name', width: 150 },
  { title: '类型', key: 'type', width: 100, render: (row) => {
    const map: Record<string, string> = { discount: '满减券', rate: '折扣券', special: '特价券', exchange: '兑换券' }
    return map[row.type] || row.type
  }},
  { title: '优惠内容', key: 'content', width: 160, render: (row) => {
    if (row.type === 'discount') return `减${row.value}元`
    if (row.type === 'rate') return `${row.value}折`
    if (row.type === 'special') {
      const items = row.specialItems?.map((id: string) => productOptions.find(p => p.value === id)?.label || id).join('、') || ''
      return h('div', null, [
        h('div', { style: 'font-weight: 600; color: #EF4444;' }, `¥${row.specialPrice}`),
        h('div', { style: 'font-size: 11px; color: #999; margin-top: 2px;' }, items)
      ])
    }
    if (row.type === 'exchange') {
      const items = row.exchangeItems?.map((id: string) => productOptions.find(p => p.value === id)?.label || id).join('、') || row.value
      return h('div', { style: 'font-size: 12px; color: #333;' }, items)
    }
    return row.value
  }},
  { title: '使用门槛', key: 'threshold', width: 100, render: (row) => row.threshold > 0 ? `满${row.threshold}元` : '无门槛' },
  { title: '已领/总量', key: 'claimed', width: 110, render: (row) => `${row.claimed}/${row.total || '∞'}` },
  { title: '已使用', key: 'used', width: 90 },
  { title: '有效期', key: 'validText', width: 160, render: (row) => {
    if (row.validType === 'days') return `领取后${row.validDays}天`
    if (row.validType === 'date') return `截止${row.validEndDate}`
    return '永久有效'
  }},
  { title: '状态', key: 'status', width: 90, render: (row) =>
    h(NTag, { type: row.status ? 'success' : 'warning', size: 'small' },
      { default: () => row.status ? '启用' : '暂停' })
  },
  { title: '操作', key: 'actions', width: 180, render: (row) => {
    return h(NSpace, { size: 4 }, {
      default: () => [
        h(NButton, { size: 'tiny', secondary: true, onClick: () => openManualSend(row) }, { default: () => '手动发券' }),
        h(NButton, { size: 'tiny', quaternary: true, onClick: () => handleEdit(row) }, { default: () => '编辑' }),
        h(NDropdown, {
          options: [
            { label: row.status ? '暂停' : '启用', key: 'toggle' },
            { type: 'divider', key: 'd1' },
            { label: '删除', key: 'delete' }
          ],
          onSelect: (key) => handleAction(key, row)
        }, {
          default: () => h(NButton, { quaternary: true, circle: true, size: 'tiny' },
            { icon: () => h(NIcon, { component: EllipsisHorizontalOutline }) })
        })
      ]
    })
  }}
]

const tableData = ref([
  { id: 1, shopName: '卓远亚运城店', name: '新人专享券', type: 'discount', value: 20, exchangeItems: [], threshold: 100, claimed: 520, total: 1000, used: 186, validType: 'days', validDays: 30, validEndDate: null, status: true },
  { id: 2, shopName: '卓远天河路店', name: '周末畅玩券', type: 'rate', value: 85, exchangeItems: [], threshold: 80, claimed: 320, total: 500, used: 245, validType: 'date', validDays: null, validEndDate: '2026-12-31', status: true },
  { id: 3, shopName: '卓远亚运城店', name: '会员专享券', type: 'exchange', value: 0, exchangeItems: ['product1'], threshold: 0, claimed: 180, total: 300, used: 120, validType: 'days', validDays: 7, validEndDate: null, status: false },
  { id: 4, shopName: '卓远北京路店', name: '节日特惠券', type: 'discount', value: 50, exchangeItems: [], threshold: 200, claimed: 266, total: 200, used: 266, validType: 'forever', validDays: null, validEndDate: null, status: false },
  { id: 5, shopName: '卓远亚运城店', name: '9.9元体验券', type: 'special', value: 0, specialPrice: 9.9, specialItems: ['product1', 'product2'], exchangeItems: [], threshold: 0, claimed: 350, total: 500, used: 128, validType: 'days', validDays: 30, validEndDate: null, status: true },
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
  modalTitle.value = '创建优惠券'
  formData.value = getDefaultFormData()
  showModal.value = true
}

function handleEdit(row: any) {
  isEdit.value = true
  modalTitle.value = '编辑优惠券'
  formData.value = {
    id: row.id,
    shop: 'shop1',
    name: row.name,
    type: row.type,
    value: row.value,
    specialPrice: row.specialPrice || 9.9,
    specialItems: row.specialItems || [],
    exchangeItems: row.exchangeItems || [],
    threshold: row.threshold,
    total: row.total,
    limit: row.limit || 1,
    validType: row.validType || 'days',
    validDays: row.validDays || 30,
    validEndDate: row.validEndDate || null,
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
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: #fff; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.stat-card.highlight { border: 1px solid #3B82F6; }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-content { display: flex; flex-direction: column; gap: 4px; }
.stat-content .label { font-size: 13px; color: #666; }
.stat-content .value { font-size: 24px; font-weight: 600; color: #333; }
.table-card { border-radius: 12px; }
.form-hint { font-size: 12px; color: #999; }
</style>
