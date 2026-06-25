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
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
          <n-icon :component="TrendingUpOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">带动GMV</span>
          <span class="kpi-hint">使用该券的订单成交总额</span>
          <span class="value">¥{{ totalGMV }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #06B6D4, #0891B2);">
          <n-icon :component="BarChartOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">投入产出比</span>
          <span class="kpi-hint">GMV ÷ 优惠总额</span>
          <span class="value">{{ roiRatio }}</span>
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
    <n-modal v-model:show="showManualSendModal" preset="card" title="手动发券" style="width: 560px;">
      <n-form label-placement="left" label-width="90px">
        <n-form-item label="优惠券">
          <n-input :value="manualSendCoupon?.name" disabled />
        </n-form-item>
        <n-form-item label="发放对象" required>
          <n-radio-group v-model:value="manualSendTargetType">
            <n-space vertical style="gap: 8px;">
              <n-radio value="member">指定会员</n-radio>
              <n-radio value="phone">输入手机号</n-radio>
              <n-radio value="filter">全店筛选发放</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>

        <!-- 指定会员 -->
        <n-form-item v-if="manualSendTargetType === 'member'" label="选择会员" required>
          <n-select
            v-model:value="manualSendMembers"
            multiple
            filterable
            placeholder="搜索会员姓名/手机号"
            :options="allMemberOptions"
            :max-tag-count="3"
          />
        </n-form-item>

        <!-- 输入手机号 -->
        <n-form-item v-if="manualSendTargetType === 'phone'" label="手机号" required>
          <n-input
            v-model:value="manualSendPhones"
            type="textarea"
            placeholder="输入手机号，多个用换行或逗号分隔"
            :rows="4"
          />
        </n-form-item>

        <!-- 全店筛选发放 -->
        <template v-if="manualSendTargetType === 'filter'">
          <n-alert type="info" :bordered="false" style="margin-bottom: 16px;">
            此方式将向符合筛选条件的全体会员批量发放优惠券，请确认优惠券预算后再操作。
          </n-alert>
          <n-form-item label="会员等级">
            <n-checkbox-group v-model:value="manualSendFilterLevels">
              <n-space>
                <n-checkbox value="normal">普通会员</n-checkbox>
                <n-checkbox value="bronze">青铜</n-checkbox>
                <n-checkbox value="silver">白银</n-checkbox>
                <n-checkbox value="gold">黄金</n-checkbox>
                <n-checkbox value="diamond">钻石</n-checkbox>
              </n-space>
            </n-checkbox-group>
            <div style="margin-top: 4px;">
              <n-button text size="tiny" type="primary" @click="manualSendFilterLevels = ['normal','bronze','silver','gold','diamond']">全选</n-button>
              <n-button text size="tiny" style="margin-left: 8px;" @click="manualSendFilterLevels = []">清空</n-button>
            </div>
          </n-form-item>
          <n-form-item label="活跃状态">
            <n-checkbox-group v-model:value="manualSendFilterStatuses">
              <n-space>
                <n-checkbox value="active">活跃（30天有消费）</n-checkbox>
                <n-checkbox value="dormant">沉睡（30-60天）</n-checkbox>
                <n-checkbox value="lost">流失（60天以上）</n-checkbox>
                <n-checkbox value="inactive">未消费用户</n-checkbox>
              </n-space>
            </n-checkbox-group>
            <div style="margin-top: 4px;">
              <n-button text size="tiny" type="primary" @click="manualSendFilterStatuses = ['active','dormant','lost','inactive']">全选</n-button>
              <n-button text size="tiny" style="margin-left: 8px;" @click="manualSendFilterStatuses = []">清空</n-button>
            </div>
          </n-form-item>
          <!-- 筛选结果预览 -->
          <n-form-item label="符合条件">
            <div class="filter-preview">
              <span class="filter-count">{{ filteredMemberCount }}</span>
              <span class="filter-unit">人</span>
              <span v-if="filteredMemberCount === 0" class="filter-empty-hint">请至少选择一项筛选条件</span>
            </div>
          </n-form-item>
        </template>

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
          <n-button
            type="primary"
            :disabled="!canManualSend"
            @click="handleManualSendSubmit"
          >
            {{ manualSendTargetType === 'filter' ? `确认发放（${filteredMemberCount}人）` : '确认发放' }}
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 新增/编辑优惠券弹窗 -->
    <n-modal v-model:show="showModal" preset="card" :title="modalTitle" style="width: 650px;">
      <n-form :model="formData" label-placement="left" label-width="100px" :rules="formRules">
        <!-- 编辑已发放券的警告 -->
        <n-alert v-if="isEdit && editingClaimed > 0" type="warning" :bordered="false" style="margin-bottom: 16px;">
          该券已发放 <strong>{{ editingClaimed }}</strong> 张，优惠类型、金额、门槛、有效期不可修改，以免影响已领取用户。
        </n-alert>

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
              <n-select v-model:value="formData.type" :options="typeOptions" :disabled="isEdit && editingClaimed > 0" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <!-- 满减券：优惠金额 -->
            <n-form-item v-if="formData.type === 'discount'" label="优惠金额" path="value" required>
              <n-input-number v-model:value="formData.value" :min="1" style="width: 100%;" :disabled="isEdit && editingClaimed > 0">
                <template #suffix>元</template>
              </n-input-number>
            </n-form-item>
            <!-- 折扣券：折扣比例 -->
            <n-form-item v-if="formData.type === 'rate'" label="折扣比例" path="value" required>
              <n-input-number v-model:value="formData.value" :min="1" :max="99" style="width: 100%;" :disabled="isEdit && editingClaimed > 0">
                <template #suffix>折</template>
              </n-input-number>
            </n-form-item>
          </n-gi>
        </n-grid>

        <!-- 自动发放 -->
        <n-form-item label="自动发放">
          <n-switch v-model:value="formData.autoDistribute" />
          <span style="margin-left: 10px; font-size: 13px; color: #666;">用户满足筛选条件时自动发放优惠券</span>
        </n-form-item>
        <template v-if="formData.autoDistribute">
          <n-alert type="info" :bordered="false" style="margin-bottom: 16px;">
            满足以下<strong>全部</strong>筛选条件的用户，将在条件首次满足时自动获得此优惠券，无需手动发放。
          </n-alert>
          <n-form-item label="会员等级">
            <n-checkbox-group v-model:value="formData.autoDistributeLevels">
              <n-space>
                <n-checkbox value="normal">普通会员</n-checkbox>
                <n-checkbox value="bronze">青铜</n-checkbox>
                <n-checkbox value="silver">白银</n-checkbox>
                <n-checkbox value="gold">黄金</n-checkbox>
                <n-checkbox value="diamond">钻石</n-checkbox>
              </n-space>
            </n-checkbox-group>
            <div style="margin-top: 4px;">
              <n-button text size="tiny" type="primary" @click="formData.autoDistributeLevels = ['normal','bronze','silver','gold','diamond']">全选</n-button>
              <n-button text size="tiny" style="margin-left: 8px;" @click="formData.autoDistributeLevels = []">清空</n-button>
            </div>
          </n-form-item>
          <n-form-item label="活跃状态">
            <n-checkbox-group v-model:value="formData.autoDistributeStatuses">
              <n-space>
                <n-checkbox value="active">活跃（30天有消费）</n-checkbox>
                <n-checkbox value="dormant">沉睡（30-60天）</n-checkbox>
                <n-checkbox value="lost">流失（60天以上）</n-checkbox>
                <n-checkbox value="inactive">未消费用户</n-checkbox>
              </n-space>
            </n-checkbox-group>
            <div style="margin-top: 4px;">
              <n-button text size="tiny" type="primary" @click="formData.autoDistributeStatuses = ['active','dormant','lost','inactive']">全选</n-button>
              <n-button text size="tiny" style="margin-left: 8px;" @click="formData.autoDistributeStatuses = []">清空</n-button>
            </div>
          </n-form-item>
          <n-form-item label="发放时机">
            <n-radio-group v-model:value="formData.autoDistributeTiming">
              <n-space vertical style="gap: 6px;">
                <n-radio value="onMeet">用户首次满足条件时立即发放</n-radio>
                <n-radio value="onRegister">新用户注册后立即发放（需勾选「未消费用户」状态）</n-radio>
              </n-space>
            </n-radio-group>
          </n-form-item>
        </template>

        <!-- 使用门槛 -->
        <n-form-item label="使用门槛" path="threshold">
          <n-input-number v-model:value="formData.threshold" :min="0" placeholder="满X元可用" style="width: 100%;" :disabled="isEdit && editingClaimed > 0">
            <template #prefix>满</template>
            <template #suffix>元</template>
          </n-input-number>
        </n-form-item>

        <!-- 发放设置 -->
        <n-grid :cols="2" :x-gap="16">
          <n-gi>
            <n-form-item label="发放数量">
              <n-input-number v-model:value="formData.total" :min="editingClaimed" style="width: 100%;" placeholder="0表示不限量" />
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
          <n-radio-group v-model:value="formData.validType" :disabled="isEdit && editingClaimed > 0">
            <n-space>
              <n-radio value="days">领取后X天有效</n-radio>
              <n-radio value="date">截止到指定日期</n-radio>
              <n-radio value="forever">永久有效</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item v-if="formData.validType === 'days'" label="有效时长" path="validDays" required>
          <n-input-number v-model:value="formData.validDays" :min="1" style="width: 200px;" placeholder="30" :disabled="isEdit && editingClaimed > 0">
            <template #suffix>天</template>
          </n-input-number>
          <span class="form-hint" style="margin-left: 8px;">* 自领取之日起算</span>
        </n-form-item>
        <n-form-item v-if="formData.validType === 'date'" label="截止日期" path="validEndDate" required>
          <n-date-picker v-model:value="formData.validEndDate" type="date" style="width: 100%;" placeholder="选择截止日期" :disabled="isEdit && editingClaimed > 0" />
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
  NAlert, NSwitch,
  useMessage
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import {
  SearchOutline, TicketOutline, DownloadOutline, CheckmarkCircleOutline,
  PricetagsOutline, EllipsisHorizontalOutline, TrendingUpOutline, BarChartOutline
} from '@vicons/ionicons5'

const message = useMessage()

const activeTab = ref('active')
const showModal = ref(false)
const isEdit = ref(false)
const editingClaimed = ref(0)
const modalTitle = ref('创建优惠券')
const filterShop = ref(null)
const filterKeyword = ref('')

// 手动发券
const showManualSendModal = ref(false)
const manualSendCoupon = ref<any>(null)
const manualSendTargetType = ref<'member' | 'phone' | 'filter'>('member')
const manualSendMembers = ref<string[]>([])
const manualSendPhones = ref('')
const manualSendCount = ref(1)
const manualSendRemark = ref('')
const manualSendFilterLevels = ref<string[]>(['normal', 'bronze', 'silver', 'gold', 'diamond'])
const manualSendFilterStatuses = ref<string[]>(['active', 'dormant', 'lost', 'inactive'])

// 扩展会员数据（包含等级和活跃状态）
const allMembers = ref([
  { id: 'm1', name: '张小明', phone: '138****1234', level: 'gold', levelLabel: '黄金', status: 'active', statusLabel: '活跃' },
  { id: 'm2', name: '李小红', phone: '139****5678', level: 'silver', levelLabel: '白银', status: 'active', statusLabel: '活跃' },
  { id: 'm3', name: '王小强', phone: '137****9012', level: 'bronze', levelLabel: '青铜', status: 'dormant', statusLabel: '沉睡' },
  { id: 'm4', name: '陈小芳', phone: '136****3456', level: 'diamond', levelLabel: '钻石', status: 'active', statusLabel: '活跃' },
  { id: 'm5', name: '刘大伟', phone: '135****7890', level: 'normal', levelLabel: '普通会员', status: 'lost', statusLabel: '流失' },
  { id: 'm6', name: '赵小雪', phone: '134****1122', level: 'gold', levelLabel: '黄金', status: 'active', statusLabel: '活跃' },
  { id: 'm7', name: '孙建国', phone: '133****3344', level: 'bronze', levelLabel: '青铜', status: 'inactive', statusLabel: '未消费' },
  { id: 'm8', name: '周美玲', phone: '132****5566', level: 'silver', levelLabel: '白银', status: 'active', statusLabel: '活跃' },
  { id: 'm9', name: '吴志远', phone: '131****7788', level: 'gold', levelLabel: '黄金', status: 'dormant', statusLabel: '沉睡' },
  { id: 'm10', name: '郑晓燕', phone: '130****9900', level: 'diamond', levelLabel: '钻石', status: 'active', statusLabel: '活跃' },
  { id: 'm11', name: '钱一鸣', phone: '129****2233', level: 'normal', levelLabel: '普通会员', status: 'inactive', statusLabel: '未消费' },
  { id: 'm12', name: '韩美丽', phone: '128****4455', level: 'silver', levelLabel: '白银', status: 'active', statusLabel: '活跃' },
])

const allMemberOptions = computed(() =>
  allMembers.value.map(m => ({
    label: `${m.name} (${m.phone}) [${m.levelLabel}]`,
    value: m.id
  }))
)

// 筛选结果人数预览
const filteredMemberCount = computed(() => {
  if (manualSendTargetType.value !== 'filter') return 0
  const levels = manualSendFilterLevels.value
  const statuses = manualSendFilterStatuses.value
  if (levels.length === 0 && statuses.length === 0) return 0
  return allMembers.value.filter(m => {
    const levelMatch = levels.length === 0 || levels.includes(m.level)
    const statusMatch = statuses.length === 0 || statuses.includes(m.status)
    return levelMatch && statusMatch
  }).length
})

// 是否可以提交发放
const canManualSend = computed(() => {
  if (manualSendTargetType.value === 'member') return manualSendMembers.value.length > 0
  if (manualSendTargetType.value === 'phone') return manualSendPhones.value.trim().length > 0
  if (manualSendTargetType.value === 'filter') return filteredMemberCount.value > 0
  return false
})

function openManualSend(row: any) {
  manualSendCoupon.value = row
  manualSendTargetType.value = 'member'
  manualSendMembers.value = []
  manualSendPhones.value = ''
  manualSendCount.value = 1
  manualSendRemark.value = ''
  manualSendFilterLevels.value = ['normal', 'bronze', 'silver', 'gold', 'diamond']
  manualSendFilterStatuses.value = ['active', 'dormant', 'lost', 'inactive']
  showManualSendModal.value = true
}

function handleManualSendSubmit() {
  let targetCount = 0
  if (manualSendTargetType.value === 'member') {
    targetCount = manualSendMembers.value.length
  } else if (manualSendTargetType.value === 'phone') {
    targetCount = manualSendPhones.value.split(/[\n,]+/).filter(s => s.trim()).length
  } else if (manualSendTargetType.value === 'filter') {
    targetCount = filteredMemberCount.value
  }
  console.log('手动发券:', {
    coupon: manualSendCoupon.value?.name,
    targetType: manualSendTargetType.value,
    members: manualSendMembers.value,
    phones: manualSendPhones.value,
    filterLevels: manualSendFilterLevels.value,
    filterStatuses: manualSendFilterStatuses.value,
    targetCount,
    count: manualSendCount.value,
    totalSent: targetCount * manualSendCount.value,
    remark: manualSendRemark.value,
  })
  showManualSendModal.value = false
  message.success(`发券成功！共发放 ${targetCount * manualSendCount.value} 张优惠券给 ${targetCount} 人`)
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
    originalPrice: 48,
    threshold: 0,
    total: 0,
    limit: 1,
    validType: 'days',
    validDays: 30,
    validEndDate: null,
    memberTypes: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
    terminal: 'all',
    status: true,
    autoDistribute: false,
    autoDistributeLevels: ['normal', 'bronze', 'silver', 'gold', 'diamond'],
    autoDistributeStatuses: ['active', 'dormant', 'lost', 'inactive'],
    autoDistributeTiming: 'onMeet',
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
  { label: '折扣券', value: 'rate' }
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
    // 满减券：直接加优惠金额
    if (item.type === 'discount') {
      return sum + item.value * item.used
    }
    // 折扣券按平均折扣估算
    if (item.type === 'rate') {
      return sum + Math.round(item.value * item.used * 0.1)
    }
    return sum
  }, 0)
})

const totalGMV = computed(() => {
  return tableData.value.reduce((sum, item) => sum + (item.gmv || 0), 0)
})

const roiRatio = computed(() => {
  const discount = totalDiscount.value
  const gmv = totalGMV.value
  if (discount === 0) return '—'
  return `${(gmv / discount).toFixed(1)} : 1`
})

const columns: DataTableColumns = [
  { title: '所属店铺', key: 'shopName', width: 140 },
  { title: '优惠券名称', key: 'name', width: 150 },
  { title: '类型', key: 'type', width: 110, render: (row) => {
    const map: Record<string, string> = { discount: '满减券', rate: '折扣券' }
    const typeLabel = map[row.type] || row.type
    if (row.autoDistribute) {
      return h(NTag, { type: 'info', size: 'small', bordered: true }, { default: () => typeLabel + '·自动' })
    }
    return typeLabel
  }},
  { title: '优惠内容', key: 'content', width: 140, render: (row) => {
    if (row.type === 'discount') return `减${row.value}元`
    if (row.type === 'rate') return `${row.value}折`
    return row.value
  }},
  { title: '使用门槛', key: 'threshold', width: 100, render: (row) => {
    return row.threshold > 0 ? `满${row.threshold}元` : '无门槛'
  }},
  { title: '发放方式', key: 'distMethod', width: 90, render: (row) => {
    if (row.autoDistribute) return h(NTag, { type: 'info', size: 'tiny' }, { default: () => '自动' })
    return h(NTag, { type: 'default', size: 'tiny' }, { default: () => '手动' })
  }},
  { title: '已领/总量', key: 'claimed', width: 110, render: (row) => `${row.claimed}/${row.total || '∞'}` },
  { title: '已使用', key: 'used', width: 90 },
  { title: '带动GMV', key: 'gmv', width: 140, render: (row) => {
    const amount = (row.gmv || 0).toLocaleString()
    return h('span', { title: '使用该券的订单成交总额' }, `¥${amount}`)
  }},
  { title: '有效期', key: 'validText', width: 140, render: (row) => {
    if (row.validType === 'days') return `领取后${row.validDays}天`
    if (row.validType === 'date') return `截止${row.validEndDate}`
    return '永久有效'
  }},
  { title: '状态', key: 'status', width: 80, render: (row) =>
    h(NTag, { type: row.status ? 'success' : 'warning', size: 'small' },
      { default: () => row.status ? '启用' : '暂停' })
  },
  { title: '操作', key: 'actions', width: 160, render: (row) => {
    const buttons = []
    // 自动发放的券不显示手动发券
    if (!row.autoDistribute) {
      buttons.push(h(NButton, { size: 'tiny', secondary: true, onClick: () => openManualSend(row) }, { default: () => '手动发券' }))
    }
    buttons.push(h(NButton, { size: 'tiny', quaternary: true, onClick: () => handleEdit(row) }, { default: () => '编辑' }))
    buttons.push(h(NDropdown, {
      options: [
        { label: row.status ? '暂停' : '启用', key: 'toggle' },
        { type: 'divider', key: 'd1' },
        { label: '删除', key: 'delete' }
      ],
      onSelect: (key) => handleAction(key, row)
    }, {
      default: () => h(NButton, { quaternary: true, circle: true, size: 'tiny' },
        { icon: () => h(NIcon, { component: EllipsisHorizontalOutline }) })
    }))
    return h(NSpace, { size: 4 }, { default: () => buttons })
  }}
]

const tableData = ref([
  { id: 1, shopName: '卓远亚运城店', name: '新人注册欢迎券', type: 'discount', value: 20, threshold: 50, claimed: 520, total: 0, used: 186, gmv: 12600, validType: 'days', validDays: 30, validEndDate: null, status: true, autoDistribute: true },
  { id: 2, shopName: '卓远天河路店', name: '周末畅玩券', type: 'rate', value: 85, threshold: 80, claimed: 320, total: 500, used: 245, gmv: 21800, validType: 'date', validDays: null, validEndDate: '2026-12-31', status: true },
  { id: 3, shopName: '卓远亚运城店', name: '会员专享券', type: 'discount', value: 15, threshold: 0, claimed: 180, total: 300, used: 120, gmv: 5800, validType: 'days', validDays: 7, validEndDate: null, status: false },
  { id: 4, shopName: '卓远北京路店', name: '节日特惠券', type: 'discount', value: 50, threshold: 200, claimed: 266, total: 200, used: 266, gmv: 58600, validType: 'forever', validDays: null, validEndDate: null, status: false },
  { id: 5, shopName: '卓远亚运城店', name: '9.9元体验券', type: 'discount', value: 10, threshold: 0, claimed: 350, total: 500, used: 128, gmv: 4500, validType: 'days', validDays: 30, validEndDate: null, status: true },
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
  editingClaimed.value = 0
  modalTitle.value = '创建优惠券'
  formData.value = getDefaultFormData()
  showModal.value = true
}

function handleEdit(row: any) {
  isEdit.value = true
  editingClaimed.value = row.claimed || 0
  modalTitle.value = '编辑优惠券'
  formData.value = {
    id: row.id,
    shop: 'shop1',
    name: row.name,
    type: row.type,
    value: row.value,
    threshold: row.threshold,
    total: row.total,
    limit: row.limit || 1,
    validType: row.validType || 'days',
    validDays: row.validDays || 30,
    validEndDate: row.validEndDate || null,
    memberTypes: ['bronze', 'silver', 'gold', 'normal'],
    autoDistribute: row.autoDistribute || false,
    autoDistributeLevels: row.autoDistributeLevels || ['normal', 'bronze', 'silver', 'gold', 'diamond'],
    autoDistributeStatuses: row.autoDistributeStatuses || ['active', 'dormant', 'lost', 'inactive'],
    autoDistributeTiming: row.autoDistributeTiming || 'onMeet',
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
.stats-row { display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: #fff; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.stat-card.highlight { border: 1px solid #3B82F6; }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-content { display: flex; flex-direction: column; gap: 4px; }
.stat-content .label { font-size: 13px; color: #666; }
.stat-content .value { font-size: 24px; font-weight: 600; color: #333; }
.stat-content .kpi-hint { font-size: 11px; color: #999; margin-top: -2px; line-height: 1.4; }
.table-card { border-radius: 12px; }
.form-hint { font-size: 12px; color: #999; }
.filter-preview { display: flex; align-items: baseline; gap: 4px; }
.filter-count { font-size: 24px; font-weight: 700; color: #3B82F6; }
.filter-unit { font-size: 14px; color: #666; }
.filter-empty-hint { font-size: 13px; color: #999; margin-left: 4px; }
</style>
