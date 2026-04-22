<template>
  <div class="page-container animate-fade-in">
    <!-- 顶部返回 -->
    <div class="page-header-bar">
      <n-button text @click="goBack">
        <template #icon><n-icon :component="ArrowBackOutline" /></template>
        返回
      </n-button>
      <h1>添加发送任务</h1>
    </div>

    <!-- 温馨提示 -->
    <n-alert type="info" :show-icon="false" style="margin-bottom: 24px; background: #f0f9ff; border: none;">
      <div class="tips-content">
        <p>温馨提示：</p>
        <p>1. 当前短信任务仅支持推广短信</p>
        <p>2. 发送结果有一定的延时，但不影响用户接收短信</p>
        <p>3. 费用先扣取，如果短信发送失败，将退还发送失败的短信费用，请注意查看店铺系统账单功能</p>
      </div>
    </n-alert>

    <div class="form-wrapper">
      <n-form :model="formData" label-placement="left" label-width="110px" :rules="formRules" ref="formRef">
        <!-- 任务名称 -->
        <n-form-item label="任务名称" path="name" required>
          <n-input
            v-model:value="formData.name"
            placeholder="请输入名称，不超过30个字符"
            :maxlength="30"
            show-count
            style="width: 420px;"
          />
        </n-form-item>

        <!-- 短信签名 -->
        <n-form-item label="短信签名">
          <span class="sign-text">幻彩星空</span>
        </n-form-item>

        <!-- 短信模板（级联） -->
        <n-form-item label="短信模板" path="template" required>
          <n-cascader
            v-model:value="formData.template"
            :options="templateOptions"
            placeholder="请选择"
            check-strategy="child"
            style="width: 420px;"
            @update:value="handleTemplateChange"
          />
        </n-form-item>

        <!-- 短信内容（只读） -->
        <n-form-item v-if="formData.content" label="短信内容">
          <div class="content-preview">
            <span class="sign-prefix">【幻彩星空】</span>{{ formData.content }}
          </div>
        </n-form-item>

        <!-- 接收号码 -->
        <n-form-item label="接收号码" required>
          <n-radio-group v-model:value="formData.receiveType">
            <n-space>
              <n-radio value="member">选择会员</n-radio>
              <n-radio value="import">导入接收号码文件</n-radio>
              <n-radio value="manual">手动输入接受号码</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>

        <!-- 选择会员 -->
        <div v-if="formData.receiveType === 'member'" class="member-select-box">
          <n-button size="small" @click="showMemberModal = true">选择会员</n-button>
          <span class="selected-count">已选择 {{ selectedMembers.length }} 个会员</span>
        </div>

        <!-- 导入文件 -->
        <div v-if="formData.receiveType === 'import'" class="upload-box">
          <n-upload
            accept=".xlsx,.xls,.csv,.txt"
            :max="1"
            @change="handleFileChange"
          >
            <n-button size="small">选择文件</n-button>
          </n-upload>
          <p class="upload-tip">支持 .xlsx、.xls、.csv、.txt 格式，每行一个手机号</p>
          <span v-if="importCount > 0" class="selected-count">已导入 {{ importCount }} 个号码</span>
        </div>

        <!-- 手动输入 -->
        <div v-if="formData.receiveType === 'manual'" class="manual-box">
          <n-input
            v-model:value="manualPhones"
            type="textarea"
            :rows="4"
            placeholder="请输入手机号，多个用逗号或换行分隔"
            style="width: 420px;"
          />
          <div class="phone-count">已输入 {{ manualPhoneCount }} 个手机号</div>
        </div>

        <!-- 定时发送 -->
        <n-form-item label="设置定时发送">
          <n-switch v-model:value="isTimerEnabled" />
        </n-form-item>
        <n-form-item v-if="isTimerEnabled" label=" " path="execTime">
          <n-date-picker v-model:value="formData.execTime" type="datetime" style="width: 420px;" placeholder="选择发送时间" />
        </n-form-item>
      </n-form>

      <!-- 费用信息 -->
      <div class="cost-summary">
        <div class="cost-item">
          <span class="cost-label">短信模板单价：</span>
          <span class="cost-value">¥{{ smsUnitPrice }}</span>
        </div>
        <div class="cost-item">
          <span class="cost-label">本次发送人数：</span>
          <span class="cost-value">{{ totalRecipients }}</span>
        </div>
        <div class="cost-item">
          <span class="cost-label">预计短信费用：</span>
          <span class="cost-value highlight">¥{{ estimatedCost.toFixed(2) }}</span>
          <span class="cost-balance">（当前运营账户余额：¥{{ accountBalance }}，请放心发送）</span>
          <n-button
            v-if="estimatedCost > accountBalance"
            text
            type="primary"
            size="small"
            style="margin-left: 8px;"
            @click="handleRecharge"
          >
            去充值
          </n-button>
        </div>
      </div>

      <div class="submit-bar">
        <n-button type="primary" size="large" @click="handleSubmit">立即提交</n-button>
      </div>
    </div>

    <!-- 会员选择弹窗 -->
    <n-modal
      v-model:show="showMemberModal"
      preset="card"
      title="选择会员"
      style="width: 900px;"
      :mask-closable="false"
    >
      <div class="member-modal-header">
        <n-input v-model:value="memberSearch" placeholder="搜索会员姓名/手机号" size="small" clearable style="width: 240px;" />
        <n-button size="small" @click="handleMemberSearch">查询</n-button>
        <n-button size="small" type="primary" @click="showAdvancedSearch = !showAdvancedSearch">
          {{ showAdvancedSearch ? '收起高级查询' : '高级查询' }}
        </n-button>
      </div>

      <!-- 高级查询面板 -->
      <div v-if="showAdvancedSearch" class="advanced-search-panel">
        <n-grid :cols="3" :x-gap="16" :y-gap="16">
          <n-gi>
            <div class="adv-item">
              <span class="adv-label">注册店铺：</span>
              <n-select v-model:value="advSearch.store" :options="storeOptions" placeholder="请选择" size="small" clearable style="width: 180px;" />
            </div>
          </n-gi>
          <n-gi>
            <div class="adv-item">
              <span class="adv-label">会员等级：</span>
              <n-select v-model:value="advSearch.level" :options="memberLevelOptions" placeholder="全部" size="small" clearable style="width: 180px;" />
            </div>
          </n-gi>
          <n-gi>
            <div class="adv-item">
              <span class="adv-label">会员状态：</span>
              <n-select v-model:value="advSearch.status" :options="memberStatusOptions" placeholder="正常" size="small" clearable style="width: 180px;" />
            </div>
          </n-gi>
          <n-gi>
            <div class="adv-item">
              <span class="adv-label">绑定微信：</span>
              <n-select v-model:value="advSearch.wechat" :options="wechatOptions" placeholder="全部" size="small" clearable style="width: 180px;" />
            </div>
          </n-gi>
          <n-gi>
            <div class="adv-item">
              <span class="adv-label">累计消费：</span>
              <n-select v-model:value="advSearch.consumeOp" :options="operatorOptions" size="small" style="width: 80px;" />
              <n-input v-model:value="advSearch.consumeVal" placeholder="" size="small" style="width: 90px;" />
            </div>
          </n-gi>
          <n-gi>
            <div class="adv-item">
              <span class="adv-label">账户余额：</span>
              <n-select v-model:value="advSearch.balanceOp" :options="operatorOptions" size="small" style="width: 80px;" />
              <n-input v-model:value="advSearch.balanceVal" placeholder="" size="small" style="width: 90px;" />
            </div>
          </n-gi>
          <n-gi>
            <div class="adv-item">
              <span class="adv-label">账户积分：</span>
              <n-select v-model:value="advSearch.pointsOp" :options="operatorOptions" size="small" style="width: 80px;" />
              <n-input v-model:value="advSearch.pointsVal" placeholder="" size="small" style="width: 90px;" />
            </div>
          </n-gi>
          <n-gi>
            <div class="adv-item">
              <n-input v-model:value="advSearch.noConsumeDays" placeholder="" size="small" style="width: 120px;" />
              <span class="adv-label" style="margin-left: 8px;">天未消费</span>
            </div>
          </n-gi>
        </n-grid>
        <div class="adv-actions">
          <n-button size="small" type="primary" @click="handleAdvancedSearch">查询</n-button>
          <n-button size="small" @click="resetAdvancedSearch">重置</n-button>
        </div>
      </div>

      <n-data-table
        :columns="memberColumns"
        :data="memberList"
        :pagination="memberPagination"
        :row-key="row => row.id"
        @update:checked-row-keys="handleCheck"
      />
      <template #footer>
        <n-space justify="center">
          <n-button @click="showMemberModal = false">取消</n-button>
          <n-button type="primary" @click="confirmMemberSelect">确定（已选 {{ selectedMembers.length }} 人）</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useRouter } from 'vue-router'
import {
  NButton, NIcon, NInput, NForm, NFormItem, NRadio, NRadioGroup,
  NSpace, NAlert, NCascader, NSwitch, NDatePicker, NModal,
  NDataTable, NUpload, NSelect, NGrid, NGi, type UploadFileInfo
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { ArrowBackOutline } from '@vicons/ionicons5'

const router = useRouter()
const formRef = ref<any>(null)

// 表单数据
const formData = ref({
  name: '',
  template: null as string | null,
  content: '',
  receiveType: 'member',
  execTime: null as number | null
})

const isTimerEnabled = ref(false)
const smsUnitPrice = 0.1
const accountBalance = 35.99

// 短信模板级联选项
const templateOptions = [
  {
    label: '推广短信',
    value: 'promotion',
    children: [
      { label: '520活动', value: '520活动' },
      { label: '优惠活动', value: '优惠活动' }
    ]
  },
  {
    label: '通知短信',
    value: 'notice',
    children: [
      { label: '520店庆', value: '520店庆' },
      { label: '生日祝福', value: '生日祝福' }
    ]
  }
]

function handleTemplateChange(value: string) {
  const map: Record<string, string> = {
    '520活动': '520活动短信内容',
    '优惠活动': '优惠活动短信内容',
    '520店庆': '520店庆短信内容',
    '生日祝福': '生日祝福短信内容'
  }
  formData.value.content = map[value] || ''
}

// 手动输入
const manualPhones = ref('')
const manualPhoneCount = computed(() => {
  if (!manualPhones.value) return 0
  return manualPhones.value.split(/[,，\n]/).filter(p => p.trim()).length
})

// 导入文件
const importCount = ref(0)
function handleFileChange(data: { fileList: UploadFileInfo[] }) {
  // 模拟解析结果
  importCount.value = Math.floor(Math.random() * 200) + 10
}

// 会员选择
const showMemberModal = ref(false)
const showAdvancedSearch = ref(false)
const memberSearch = ref('')
const checkedRowKeys = ref<string[]>([])
const selectedMembers = ref<any[]>([])

// 高级查询条件
const advSearch = ref({
  store: null,
  level: null,
  status: null,
  wechat: null,
  consumeOp: '>=',
  consumeVal: '',
  balanceOp: '>=',
  balanceVal: '',
  pointsOp: '>=',
  pointsVal: '',
  noConsumeDays: ''
})

const storeOptions = [
  { label: '深圳福田旗舰店', value: 'futian' },
  { label: '南山科技园店', value: 'nanshan' },
  { label: '宝安中心店', value: 'baoan' }
]

const memberLevelOptions = [
  { label: '全部', value: '' },
  { label: '普通会员', value: 'normal' },
  { label: '青铜', value: 'bronze' },
  { label: '白银', value: 'silver' },
  { label: '黄金', value: 'gold' },
]

const memberStatusOptions = [
  { label: '正常', value: 'normal' },
  { label: '停用', value: 'disabled' }
]

const wechatOptions = [
  { label: '全部', value: '' },
  { label: '已绑定', value: 'bound' },
  { label: '未绑定', value: 'unbound' }
]

const operatorOptions = [
  { label: '>=', value: '>=' },
  { label: '<=', value: '<=' },
  { label: '=', value: '=' }
]

function handleAdvancedSearch() {
  console.log('高级查询', advSearch.value)
  // 模拟筛选
  showAdvancedSearch.value = false
}

function resetAdvancedSearch() {
  advSearch.value = {
    store: null,
    level: null,
    status: null,
    wechat: null,
    consumeOp: '>=',
    consumeVal: '',
    balanceOp: '>=',
    balanceVal: '',
    pointsOp: '>=',
    pointsVal: '',
    noConsumeDays: ''
  }
}

const memberList = ref([
  { id: '1', name: '张三', phone: '13800138001', level: '黄金', totalConsume: 2560 },
  { id: '2', name: '李四', phone: '13800138002', level: '白银', totalConsume: 1280 },
  { id: '3', name: '王五', phone: '13800138003', level: '青铜', totalConsume: 360 },
  { id: '4', name: '赵六', phone: '13800138004', level: '普通会员', totalConsume: 180 },
  { id: '5', name: '孙七', phone: '13800138005', level: '白银', totalConsume: 920 },
])

const memberPagination = { pageSize: 10 }

const memberColumns: DataTableColumns = [
  { type: 'selection', options: ['all', 'none'] },
  { title: '会员姓名', key: 'name', width: 120 },
  { title: '手机号', key: 'phone', width: 140 },
  { title: '会员等级', key: 'level', width: 100 },
  { title: '累计消费', key: 'totalConsume', width: 120 }
]

function handleCheck(rowKeys: string[]) {
  checkedRowKeys.value = rowKeys
}

function confirmMemberSelect() {
  selectedMembers.value = memberList.value.filter(m => checkedRowKeys.value.includes(m.id))
  showMemberModal.value = false
}

function handleMemberSearch() {
  // 模拟搜索
  console.log('搜索会员', memberSearch.value)
}

// 费用计算
const totalRecipients = computed(() => {
  if (formData.value.receiveType === 'member') return selectedMembers.value.length
  if (formData.value.receiveType === 'import') return importCount.value
  if (formData.value.receiveType === 'manual') return manualPhoneCount.value
  return 0
})

const estimatedCost = computed(() => totalRecipients.value * smsUnitPrice)

const formRules = {
  name: { required: true, message: '请输入任务名称', trigger: 'blur' },
  template: { required: true, message: '请选择短信模板', trigger: 'change' }
}

function goBack() {
  router.push('/shop/sms')
}

function handleRecharge() {
  // TODO: 跳转充值页面
  console.log('跳转充值')
}

function handleSubmit() {
  formRef.value?.validate((errors: any) => {
    if (errors) return
    if (totalRecipients.value === 0) {
      window.$message?.warning('请至少选择一个接收号码')
      return
    }
    console.log('提交任务', formData.value)
    router.push('/shop/sms')
  })
}
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}
.page-header-bar h1 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.tips-content p {
  margin: 4px 0;
  font-size: 13px;
  color: #666;
}
.tips-content p:first-child {
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.form-wrapper {
  background: white;
  border-radius: 8px;
  padding: 24px 32px;
}

.sign-text {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.member-select-box {
  margin: 0 0 20px 110px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.upload-box {
  margin: 0 0 20px 110px;
}
.upload-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}
.manual-box {
  margin: 0 0 20px 110px;
}
.phone-count {
  margin-top: 8px;
  color: #666;
  font-size: 13px;
}
.selected-count {
  color: #3B82F6;
  font-size: 13px;
}

.cost-summary {
  margin: 24px 0 24px 110px;
  padding: 16px 20px;
  background: #f8fafc;
  border-radius: 8px;
}
.cost-item {
  margin: 6px 0;
  font-size: 14px;
}
.cost-label {
  color: #666;
}
.cost-value {
  color: #333;
  font-weight: 600;
}
.cost-value.highlight {
  color: #3B82F6;
  font-size: 16px;
}
.cost-balance {
  color: #999;
  font-size: 13px;
  margin-left: 4px;
}

.submit-bar {
  margin-left: 110px;
}

.member-modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.advanced-search-panel {
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 16px;
}
.adv-item {
  display: flex;
  align-items: center;
}
.adv-label {
  font-size: 13px;
  color: #666;
  white-space: nowrap;
  margin-right: 8px;
}
.adv-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}

.content-preview {
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  max-width: 500px;
  white-space: pre-wrap;
}
.sign-prefix {
  color: #3B82F6;
  font-weight: 500;
  margin-right: 4px;
}
</style>
