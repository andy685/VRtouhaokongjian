<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>活动赠送</h1>
      <n-space>
        <n-select v-model:value="filterShop" :options="shopOptions" placeholder="选择店铺" size="small" style="width: 180px;" clearable />
        <n-input placeholder="搜索活动..." size="small" style="width: 180px;" v-model:value="filterKeyword">
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
        <n-button type="primary" size="small" @click="handleAdd">+ 新建赠送</n-button>
      </n-space>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card highlight">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="GiftOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">进行中活动</span>
          <span class="value">{{ activeCount }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="PeopleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">已赠送次数</span>
          <span class="value">{{ totalCount }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="CardOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">已发放游戏币</span>
          <span class="value">{{ totalPoints }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
          <n-icon :component="WalletOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">已赠送预存款</span>
          <span class="value">¥{{ totalDeposit }}</span>
        </div>
      </div>
    </div>

    <!-- 活动列表 -->
    <n-card class="table-card">
      <n-tabs type="line" v-model:value="activeTab">
        <n-tab name="all">全部</n-tab>
        <n-tab name="active">启用中</n-tab>
        <n-tab name="paused">停售</n-tab>
      </n-tabs>
      <n-data-table :columns="columns" :data="tableData" :pagination="pagination" />
    </n-card>

    <!-- 手动赠送弹窗 -->
    <n-modal v-model:show="showManualGiftModal" preset="card" title="手动赠送" style="width: 520px;">
      <n-form label-placement="left" label-width="90px">
        <n-form-item label="活动名称">
          <n-input :value="manualGiftActivity?.name" disabled />
        </n-form-item>
        <n-form-item label="赠送内容">
          <div class="gift-preview">
            <n-tag v-if="manualGiftActivity?.giftDeposit > 0" size="small" type="success">预存款 ¥{{ manualGiftActivity?.giftDeposit }}</n-tag>
            <n-tag v-if="manualGiftActivity?.giftPoints > 0" size="small" type="info">游戏币 {{ manualGiftActivity?.giftPoints }}</n-tag>
            <n-tag v-if="manualGiftActivity?.giftTimes > 0" size="small" type="warning">次数 {{ manualGiftActivity?.giftTimes }}</n-tag>
          </div>
        </n-form-item>
        <n-form-item label="发放对象" required>
          <n-radio-group v-model:value="manualGiftTargetType">
            <n-space>
              <n-radio value="member">指定会员</n-radio>
              <n-radio value="phone">输入手机号</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item v-if="manualGiftTargetType === 'member'" label="选择会员" required>
          <n-select
            v-model:value="manualGiftMembers"
            multiple
            filterable
            placeholder="搜索会员姓名/手机号"
            :options="memberOptions"
            :max-tag-count="3"
          />
        </n-form-item>
        <n-form-item v-if="manualGiftTargetType === 'phone'" label="手机号" required>
          <n-input
            v-model:value="manualGiftPhones"
            type="textarea"
            placeholder="输入手机号，多个用换行或逗号分隔"
            :rows="4"
          />
        </n-form-item>
        <n-form-item label="发放备注">
          <n-input v-model:value="manualGiftRemark" placeholder="可选填备注信息" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="center">
          <n-button @click="showManualGiftModal = false">取消</n-button>
          <n-button type="primary" @click="handleManualGiftSubmit">确认赠送</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 新增/编辑赠送活动弹窗 -->
    <n-modal v-model:show="showModal" preset="card" :title="modalTitle" style="width: 650px;">
      <n-form :model="formData" label-placement="left" label-width="100px" :rules="formRules">
        <n-form-item label="售卖店铺" path="shop" required>
          <n-select v-model:value="formData.shop" :options="shopOptions" placeholder="选择参与的店铺" />
        </n-form-item>
        <n-form-item label="活动名称" path="name" required>
          <n-input v-model:value="formData.name" placeholder="如：消费满额赠" />
        </n-form-item>
        <n-form-item label="触发条件" path="condition" required>
          <n-select v-model:value="formData.condition" :options="conditionOptions" />
        </n-form-item>
        
        <!-- 消费满额时显示门槛 -->
        <n-form-item v-if="formData.condition === 'consume'" label="消费门槛" path="threshold" required>
          <n-input-number v-model:value="formData.threshold" :min="0" placeholder="0.00" style="width: 100%;">
            <template #suffix>元</template>
          </n-input-number>
          <template #feedback>
            <span class="form-hint">单笔消费满此金额触发</span>
          </template>
        </n-form-item>
        
        <!-- 充值金额时显示门槛 -->
        <n-form-item v-if="formData.condition === 'recharge'" label="充值门槛" path="threshold" required>
          <n-input-number v-model:value="formData.threshold" :min="0" placeholder="0.00" style="width: 100%;">
            <template #suffix>元</template>
          </n-input-number>
          <template #feedback>
            <span class="form-hint">单笔充值满此金额触发</span>
          </template>
        </n-form-item>
        
        <!-- 办理套餐时显示说明 -->
        <n-form-item v-if="formData.condition === 'package'" label="触发说明" path="threshold">
          <div class="condition-desc">办理任意充值套餐即触发赠送</div>
        </n-form-item>
        
        <!-- 生日时显示生日设置 -->
        <n-form-item v-if="formData.condition === 'birthday'" label="生日范围" path="birthdayRange" required>
          <n-select v-model:value="formData.birthdayRange" :options="birthdayRangeOptions" style="width: 100%;" />
          <template #feedback>
            <span class="form-hint">会员生日当月/当周/当天可享受此优惠</span>
          </template>
        </n-form-item>
        
        <!-- 赠送预存款 -->
        <n-form-item label="赠送预存款" path="giftDeposit">
          <n-input-number v-model:value="formData.giftDeposit" :min="0" placeholder="0.00" style="width: 100%;">
            <template #suffix>元</template>
          </n-input-number>
        </n-form-item>
        
        <!-- 赠送游戏币 -->
        <n-form-item label="赠送游戏币" path="giftPoints">
          <n-input-number v-model:value="formData.giftPoints" :min="0" placeholder="0" style="width: 100%;">
            <template #suffix>游戏币</template>
          </n-input-number>
        </n-form-item>
        <!-- 游戏币有效期（填写游戏币后显示） -->
        <n-form-item v-if="formData.giftPoints > 0" label="游戏币有效期" path="pointsValidType" required>
          <n-radio-group v-model:value="formData.pointsValidType">
            <n-space>
              <n-radio value="forever">永久有效</n-radio>
              <n-radio value="duration">有效时长</n-radio>
              <n-radio value="date">限定日期</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item v-if="formData.giftPoints > 0 && formData.pointsValidType === 'duration'" label="游戏币有效时长" path="pointsValidDays" required>
          <n-input-number v-model:value="formData.pointsValidDays" :min="1" placeholder="365" style="width: 200px;">
            <template #suffix>天</template>
          </n-input-number>
          <span class="form-hint" style="margin-left: 8px;">* 自获取日起算</span>
        </n-form-item>
        <n-form-item v-if="formData.giftPoints > 0 && formData.pointsValidType === 'date'" label="游戏币截止日期" path="pointsValidDate" required>
          <n-date-picker v-model:value="formData.pointsValidDate" type="date" placeholder="选择截止日期" />
        </n-form-item>
        
        <!-- 赠送次数 -->
        <n-form-item label="赠送次数" path="giftTimes">
          <n-input-number v-model:value="formData.giftTimes" :min="0" placeholder="0" style="width: 100%;">
            <template #suffix>次</template>
          </n-input-number>
        </n-form-item>
        <!-- 次数有效期（填写次数后显示） -->
        <n-form-item v-if="formData.giftTimes > 0" label="次数有效期" path="timesValidType" required>
          <n-radio-group v-model:value="formData.timesValidType">
            <n-space>
              <n-radio value="forever">永久有效</n-radio>
              <n-radio value="duration">有效时长</n-radio>
              <n-radio value="date">限定日期</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item v-if="formData.giftTimes > 0 && formData.timesValidType === 'duration'" label="次数有效时长" path="timesValidDays" required>
          <n-input-number v-model:value="formData.timesValidDays" :min="1" placeholder="365" style="width: 200px;">
            <template #suffix>天</template>
          </n-input-number>
          <span class="form-hint" style="margin-left: 8px;">* 自获取日起算</span>
        </n-form-item>
        <n-form-item v-if="formData.giftTimes > 0 && formData.timesValidType === 'date'" label="次数截止日期" path="timesValidDate" required>
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
        <n-form-item label="活动状态" path="status" required>
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
  NFormItem, NInputNumber, NSwitch, NTabs, NTab, NTag, NDropdown,
  NSelect, NCheckbox, NCheckboxGroup, NRadio, NRadioGroup, NDatePicker,
  useMessage
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import {
  SearchOutline, GiftOutline, PeopleOutline, CardOutline,
  EllipsisHorizontalOutline, WalletOutline
} from '@vicons/ionicons5'

const message = useMessage()

const activeTab = ref('all')
const showModal = ref(false)
const isEdit = ref(false)
const modalTitle = ref('新增赠送活动')
const filterShop = ref(null)
const filterKeyword = ref('')

// 手动赠送
const showManualGiftModal = ref(false)
const manualGiftActivity = ref<any>(null)
const manualGiftTargetType = ref<'member' | 'phone'>('member')
const manualGiftMembers = ref<string[]>([])
const manualGiftPhones = ref('')
const manualGiftRemark = ref('')

const memberOptions = [
  { label: '张小明 (138****1234)', value: 'm1' },
  { label: '李小红 (139****5678)', value: 'm2' },
  { label: '王小强 (137****9012)', value: 'm3' },
  { label: '陈小芳 (136****3456)', value: 'm4' },
  { label: '刘大伟 (135****7890)', value: 'm5' },
]

function openManualGift(row: any) {
  manualGiftActivity.value = row
  manualGiftTargetType.value = 'member'
  manualGiftMembers.value = []
  manualGiftPhones.value = ''
  manualGiftRemark.value = ''
  showManualGiftModal.value = true
}

function handleManualGiftSubmit() {
  console.log('手动赠送:', {
    activity: manualGiftActivity.value?.name,
    targetType: manualGiftTargetType.value,
    members: manualGiftMembers.value,
    phones: manualGiftPhones.value,
    remark: manualGiftRemark.value,
  })
  showManualGiftModal.value = false
  message.success('手动赠送成功')
}

const formData = ref(getDefaultFormData())

function getDefaultFormData() {
  return {
    id: null as number | null,
    shop: null,
    name: '',
    condition: 'consume',
    threshold: 0,
    birthdayRange: 'birthday',
    giftDeposit: 0,
    giftPoints: 0,
    pointsValidType: 'forever',
    pointsValidDays: 365,
    pointsValidDate: null,
    giftTimes: 0,
    timesValidType: 'forever',
    timesValidDays: 365,
    timesValidDate: null,
    sort: 1,
    memberTypes: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
    terminal: 'all',
    status: true
  }
}

const formRules = {
  shop: { required: true, message: '请选择参与的店铺', trigger: 'change' },
  name: { required: true, message: '请输入活动名称', trigger: 'blur' },
  condition: { required: true, message: '请选择触发条件', trigger: 'change' },
  memberTypes: { required: true, type: 'array' as const, message: '请选择可购会员', trigger: 'change' }
}

const conditionOptions = [
  { label: '消费满额', value: 'consume' },
  { label: '充值金额', value: 'recharge' },
  { label: '办理套餐', value: 'package' },
  { label: '生日', value: 'birthday' }
]

const birthdayRangeOptions = [
  { label: '生日当天', value: 'birthday' },
  { label: '生日当周', value: 'week' },
  { label: '生日当月', value: 'month' }
]

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

// 统计数据
const activeCount = computed(() => tableData.value.filter(item => item.status).length)
const totalCount = computed(() => tableData.value.reduce((sum, item) => sum + (item.count || 0), 0))
const totalPoints = computed(() => tableData.value.reduce((sum, item) => sum + item.giftPoints, 0))
const totalDeposit = computed(() => tableData.value.reduce((sum, item) => sum + item.giftDeposit, 0))

const columns: DataTableColumns = [
  { title: '所属店铺', key: 'shopName', width: 150 },
  { title: '活动名称', key: 'name', width: 150 },
  { title: '触发条件', key: 'condition', width: 100, render: (row) => {
    const map: Record<string, string> = { consume: '消费满额', recharge: '充值金额', package: '办理套餐', birthday: '生日' }
    return map[row.condition] || row.condition
  }},
  { title: '门槛', key: 'threshold', width: 90, render: (row) => {
    if (row.condition === 'consume' || row.condition === 'recharge') {
      return `满${row.threshold}元`
    } else if (row.condition === 'birthday') {
      const map: Record<string, string> = { birthday: '当天', week: '当周', month: '当月' }
      return map[row.birthdayRange] || '当天'
    }
    return '-'
  }},
  { title: '赠送预存款', key: 'giftDeposit', width: 110, render: (row) => row.giftDeposit > 0 ? `¥${row.giftDeposit}` : '-' },
  { title: '赠送游戏币', key: 'giftPoints', width: 100, render: (row) => row.giftPoints > 0 ? `${row.giftPoints}` : '-' },
  { title: '游戏币有效期', key: 'pointsValidText', width: 120 },
  { title: '赠送次数', key: 'giftTimes', width: 90, render: (row) => row.giftTimes > 0 ? `${row.giftTimes}次` : '-' },
  { title: '次数有效期', key: 'timesValidText', width: 120 },
  { title: '状态', key: 'status', width: 80, render: (row) =>
    h(NTag, { type: row.status ? 'success' : 'warning', size: 'small' },
      { default: () => row.status ? '启用' : '停售' })
  },
  { title: '操作', key: 'actions', width: 180, render: (row) => {
    return h(NSpace, { size: 4 }, {
      default: () => [
        h(NButton, { size: 'tiny', secondary: true, onClick: () => openManualGift(row) }, { default: () => '手动赠送' }),
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
  { id: 1, shopName: '卓远亚运城店', name: '消费满100赠10元+100币', condition: 'consume', threshold: 100, birthdayRange: 'birthday', giftDeposit: 10, giftPoints: 100, pointsValidText: '永久有效', giftTimes: 0, timesValidText: '-', count: 256, status: true },
  { id: 2, shopName: '卓远天河路店', name: '充值满500赠50元+500币', condition: 'recharge', threshold: 500, birthdayRange: 'birthday', giftDeposit: 50, giftPoints: 500, pointsValidText: '365天', giftTimes: 0, timesValidText: '-', count: 128, status: true },
  { id: 3, shopName: '卓远亚运城店', name: '办理套餐赠200币+1次体验', condition: 'package', threshold: 0, birthdayRange: 'birthday', giftDeposit: 0, giftPoints: 200, pointsValidText: '30天', giftTimes: 1, timesValidText: '30天', count: 86, status: false },
  { id: 4, shopName: '卓远北京路店', name: '生日当月赠20元+500币+2次', condition: 'birthday', threshold: 0, birthdayRange: 'month', giftDeposit: 20, giftPoints: 500, pointsValidText: '永久有效', giftTimes: 2, timesValidText: '30天', count: 45, status: true },
])

function handleAdd() {
  isEdit.value = false
  modalTitle.value = '新增赠送活动'
  formData.value = getDefaultFormData()
  showModal.value = true
}

function handleEdit(row: any) {
  isEdit.value = true
  modalTitle.value = '编辑赠送活动'
  formData.value = {
    id: row.id,
    shop: 'shop1',
    name: row.name,
    condition: row.condition,
    threshold: row.threshold || 0,
    birthdayRange: row.birthdayRange || 'birthday',
    giftDeposit: row.giftDeposit,
    giftPoints: row.giftPoints,
    pointsValidType: 'forever',
    pointsValidDays: 365,
    pointsValidDate: null,
    giftTimes: row.giftTimes,
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
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: #fff; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.stat-card.highlight { border: 1px solid #10B981; }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-content { display: flex; flex-direction: column; gap: 4px; }
.stat-content .label { font-size: 13px; color: #666; }
.stat-content .value { font-size: 24px; font-weight: 600; color: #333; }
.stat-content .value.success { color: #10B981; }
.table-card { border-radius: 12px; }
.form-hint { font-size: 12px; color: #999; }
.condition-desc { color: #666; font-size: 14px; padding: 8px 0; }
.gift-preview { display: flex; gap: 8px; flex-wrap: wrap; }
</style>
