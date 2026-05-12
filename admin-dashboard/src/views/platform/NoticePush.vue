<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>消息推送</h1>
        <p class="header-desc">向商家/代理商/店员发送站内消息和短信通知</p>
      </div>
      <n-space>
        <n-button type="primary" @click="openEditor()">
          <template #icon><n-icon :component="PaperPlaneOutline" /></template> 发送消息
        </n-button>
      </n-space>
    </div>

    <!-- Tab: 手动推送 / 自动通知 -->
    <div class="content-card">
      <n-tabs v-model:value="activeTab" type="line">
        <!-- ===== Tab1: 手动推送 ===== -->
        <n-tab-pane name="manual" tab="手动推送">
          <div class="filter-bar">
            <n-input v-model:value="searchKey" placeholder="搜索消息内容..." clearable style="width: 240px;" />
            <n-select v-model:value="channelFilter" :options="channelOptions" placeholder="渠道" clearable style="width: 120px;" />
            <n-select v-model:value="statusFlt" :options="statusOpts" placeholder="状态" clearable style="width: 110px;" />
            <n-button @click="handleFilter">查询</n-button>
          </div>
          <n-data-table
            :columns="columns"
            :data="filteredMessages"
            :pagination="{ pageSize: 10 }"
            striped
            :row-key="rowKey"
          />
        </n-tab-pane>

        <!-- ===== Tab2: 自动通知 ===== -->
        <n-tab-pane name="auto" tab="自动通知">
          <p class="section-desc">配置<strong>系统完全自主感知</strong>的事件触发规则，无需人工操作即可自动发送通知。<span class="hint">注：依赖外部渠道的操作（如银行打款成功）不在本列表中，因为系统无法主动获知该结果。</span></p>
          <n-data-table
            :columns="autoColumns"
            :data="autoRules"
            :pagination="{ pageSize: 8 }"
            striped
            :row-key="rowKey"
          />
        </n-tab-pane>
      </n-tabs>
    </div>

    <!-- ===== 发送消息弹窗 ===== -->
    <n-modal v-model:show="showSendModal" preset="card" title="发送新消息" style="width: 680px;" :bordered="false">
      <n-form label-placement="top" style="margin-top: 16px;">
        <!-- 推送渠道 -->
        <n-form-item label="推送渠道">
          <n-checkbox-group v-model:value="form.channels">
            <n-checkbox value="site">站内消息</n-checkbox>
            <n-checkbox value="sms">短信通知</n-checkbox>
          </n-checkbox-group>
        </n-form-item>

        <!-- 目标对象 -->
        <n-form-item label="目标对象">
          <n-radio-group v-model:value="form.targetType" @update-value="onTargetTypeChange">
            <n-radio value="all">全部用户</n-radio>
            <n-radio value="role">按角色筛选</n-radio>
            <n-radio value="custom">指定对象</n-radio>
          </n-radio-group>
        </n-form-item>

        <!-- 按角色 -->
        <n-form-item v-if="form.targetType === 'role'" label="选择角色">
          <n-select v-model:value="form.roles" multiple :options="roleOptions" placeholder="请选择目标角色" />
        </n-form-item>

        <!-- 指定对象 -->
        <template v-if="form.targetType === 'custom'">
          <n-form-item label="对象类型">
            <n-radio-group v-model:value="form.customType" @update-value="onCustomTypeChange">
              <n-radio value="merchant">指定商家</n-radio>
              <n-radio value="agent">指定代理商</n-radio>
              <n-radio value="shop">指定店铺</n-radio>
              <n-radio value="person">指定个人</n-radio>
            </n-radio-group>
          </n-form-item>
          <!-- 商家选择 -->
          <n-form-item v-if="form.customType === 'merchant'" label="选择商家">
            <n-select
              v-model:value="form.selectedMerchants"
              multiple
              filterable
              remote
              :options="filteredMerchantOptions"
              :loading="merchantLoading"
              :on-search="onMerchantSearch"
              placeholder="输入商家名称搜索..."
              clearable
            />
          </n-form-item>
          <!-- 代理商选择 -->
          <n-form-item v-if="form.customType === 'agent'" label="选择代理商">
            <n-select
              v-model:value="form.selectedAgents"
              multiple
              filterable
              remote
              :options="filteredAgentOptions"
              :loading="agentLoading"
              :on-search="onAgentSearch"
              placeholder="输入代理商名称搜索..."
              clearable
            />
          </n-form-item>
          <!-- 店铺选择 -->
          <n-form-item v-if="form.customType === 'shop'" label="选择店铺">
            <n-select
              v-model:value="form.selectedShops"
              multiple
              filterable
              remote
              :options="filteredShopOptions"
              :loading="shopLoading"
              :on-search="onShopSearch"
              placeholder="输入店铺名称搜索..."
              clearable
            />
          </n-form-item>
          <!-- 个人选择 -->
          <n-form-item v-if="form.customType === 'person'" label="选择人员">
            <n-select
              v-model:value="form.selectedPersons"
              multiple
              filterable
              remote
              :options="filteredPersonOptions"
              :loading="personLoading"
              :on-search="onPersonSearch"
              placeholder="输入姓名或手机号搜索..."
              clearable
            />
          </n-form-item>
        </template>

        <!-- 消息模板 -->
        <n-form-item label="消息模板（可选）">
          <n-select v-model:value="form.template" :options="templateOptions" placeholder="选择模板后自动填充内容" clearable @update:value="onTemplateSelect" />
        </n-form-item>
        <n-form-item v-if="form.template && templatePreview.title" label="模板预览">
          <div class="tpl-preview">
            <strong>{{ templatePreview.title }}</strong>
            <p>{{ templatePreview.content }}</p>
          </div>
        </n-form-item>

        <!-- 标题 & 内容 -->
        <n-form-item label="消息标题">
          <n-input v-model:value="form.title" placeholder="请输入消息标题" maxlength="60" show-count />
        </n-form-item>
        <n-form-item label="消息内容">
          <n-input v-model:value="form.content" type="textarea" :rows="6" placeholder="请输入消息正文" maxlength="500" show-count />
        </n-form-item>

        <!-- 定时发送 -->
        <n-form-item label="定时发送">
          <n-switch v-model:value="form.scheduled">
            <template #checked>定时发送</template>
            <template #unchecked>立即发送</template>
          </n-switch>
          <n-date-picker v-if="form.scheduled" v-model:value="form.sendAt" type="datetime" style="margin-left: 12px;" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showSendModal = false">取消</n-button>
          <n-button type="primary" @click="handleSend">立即发送</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- ===== 自动规则编辑弹窗 ===== -->
    <n-modal v-model:show="showRuleModal" preset="card" :title="editRuleId ? '编辑通知规则' : '新增通知规则'" style="width: 600px;" :bordered="false">
      <n-form label-placement="top" style="margin-top: 16px;">
        <n-form-item label="触发事件">
          <n-select v-model:value="ruleForm.event" :options="eventOptions" placeholder="选择触发的事件类型" @update:value="onRuleEventSelect" />
          <div v-if="selectedEventDesc" class="evt-desc">{{ selectedEventDesc }}</div>
        </n-form-item>
        <n-form-item label="通知标题模板">
          <n-input v-model:value="ruleForm.titleTpl" placeholder="支持变量：{shopName} {amount} {date} 等" />
        </n-form-item>
        <n-form-item label="通知内容模板">
          <n-input v-model:value="ruleForm.contentTpl" type="textarea" :rows="4" placeholder="支持变量：{shopName} {amount} {date} {orderNo}" />
        </n-form-item>
        <n-form-item label="推送渠道">
          <n-checkbox-group v-model:value="ruleForm.channels">
            <n-checkbox value="site">站内消息</n-checkbox>
            <n-checkbox value="sms">短信</n-checkbox>
          </n-checkbox-group>
        </n-form-item>
        <n-form-item label="目标角色">
          <n-select v-model:value="ruleForm.targets" multiple :options="ruleRoleOptions" placeholder="选择接收角色" />
        </n-form-item>
        <n-form-item label="启用状态">
          <n-switch v-model:value="ruleForm.enabled" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showRuleModal = false">取消</n-button>
          <n-button type="primary" @click="saveRule">保存</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { NButton, NIcon, NTag, NSpace, NSwitch, useMessage } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import {
  PaperPlaneOutline, EyeOutline, RefreshOutline, TrashOutline,
  PencilOutline, AddOutline,
} from '@vicons/ionicons5'

const message = useMessage()
const activeTab = ref('manual')

// ========== 筛选 ==========
const searchKey = ref('')
const channelFilter = ref<string | null>(null)
const statusFlt = ref<string | null>(null)

// ========== 统计 ==========
const todaySent = ref(128)
const totalSent = ref(15680)
const pendingCount = ref(3)
const failedCount = ref(2)

const channelOptions = [
  { label: '站内消息', value: 'site' },
  { label: '短信', value: 'sms' },
]
const statusOpts = [
  { label: '全部', value: null as any },
  { label: '已发送', value: 'sent' },
  { label: '失败', value: 'failed' },
  { label: '待发送', value: 'pending' },
]

// ========== 发送弹窗表单 ==========
const showSendModal = ref(false)
const form = ref({
  channels: ['site'] as string[],
  targetType: 'all',
  roles: [] as string[],
  customType: 'merchant',
  selectedMerchants: [] as number[],
  selectedAgents: [] as number[],
  selectedShops: [] as number[],
  selectedPersons: [] as number[],
  template: null as string | null,
  title: '',
  content: '',
  scheduled: false,
  sendAt: null as number | null,
})

// 角色
const roleOptions = [
  { label: '商家管理员', value: 'merchant_admin' },
  { label: '商家员工（店长/店员）', value: 'merchant_staff' },
  { label: '代理商管理员', value: 'agent_admin' },
  { label: '平台运营', value: 'platform_ops' },
]

// 模板
const templateOptions = [
  // 财务结算（1个）
  { label: '💰 结算单生成通知', value: 'tpl_settlement_create' },
  // 订单监控（1个）
  { label: '📋 大额订单提醒', value: 'tpl_order_large' },
  // ── 安全风控 ──
  { label: '🔒 异常登录告警', value: 'tpl_login_anomaly' },
]
const tplData: Record<string, { title: string; content: string }> = {
  // ── 财务结算 ──
  tpl_settlement_create:   { title: '结算单生成通知', content: '{shopName}您好，{period}结算单已生成：总金额 ¥{totalAmount}，笔数 {count} 笔，预计 {payDate} 打款。请登录对账中心核对。' },
  // ── 订单监控 ──
  tpl_order_large:         { title: '大额订单提醒', content: '检测到大额消费订单：订单号 {orderNo}，金额 ¥{amount}，时间 {time}，店铺 {shopName}，请关注核实。' },
  // ── 安全风控 ──
  tpl_login_anomaly:       { title: '异常登录告警', content: '检测到账号 {accountName} 在 {loginTime} 从非常用地（IP：{ip}，地区：{location}）尝试登录，若非本人操作请立即修改密码。' },
}
const templatePreview = computed(() => (form.value.template ? tplData[form.value.template] || {} : {}))

function onTemplateSelect(val: string | null) {
  if (!val || !tplData[val]) return
  form.value.title = tplData[val].title
  form.value.content = tplData[val].content
}

// ---------- 对象选择数据 ----------
interface OptionItem {
  label: string
  value: number
}

const merchantSearch = ref('')
const merchantLoading = ref(false)
const allMerchants = ref<OptionItem[]>([
  { label: '深圳福田旗舰店', value: 101 },
  { label: '南山科技园店', value: 102 },
  { label: '宝安中心店', value: 103 },
  { label: '龙岗万科店', value: 104 },
  { label: '罗湖东门店', value: 105 },
  { label: '龙华天虹店', value: 106 },
])
const filteredMerchantOptions = computed(() => {
  if (!merchantSearch.value) return allMerchants.value
  const kw = merchantSearch.value.toLowerCase()
  return allMerchants.value.filter(m => m.label.toLowerCase().includes(kw))
})

const agentSearch = ref('')
const agentLoading = ref(false)
const allAgents = ref<OptionItem[]>([
  { label: '广东代理商A', value: 201 },
  { label: '浙江代理商B', value: 202 },
  { label: '江苏代理商C', value: 203 },
  { label: '四川代理商D', value: 204 },
])
const filteredAgentOptions = computed(() => {
  if (!agentSearch.value) return allAgents.value
  const kw = agentSearch.value.toLowerCase()
  return allAgents.value.filter(a => a.label.toLowerCase().includes(kw))
})

const shopSearch = ref('')
const shopLoading = ref(false)
const allShops = ref<OptionItem[]>([
  { label: '深圳福田店', value: 301 },
  { label: '南山店', value: 302 },
  { label: '宝安店', value: 303 },
  { label: '广州天河店', value: 304 },
  { label: '杭州西湖店', value: 305 },
])
const filteredShopOptions = computed(() => {
  if (!shopSearch.value) return allShops.value
  const kw = shopSearch.value.toLowerCase()
  return allShops.value.filter(s => s.label.toLowerCase().includes(kw))
})

const personSearch = ref('')
const personLoading = ref(false)
const allPersons = ref<OptionItem[]>([
  { label: '王小丫（138****1234）- 福田店店长', value: 401 },
  { label: '张三（139****5678）- 南山店员工', value: 402 },
  { label: '李四（137****9012）- 宝安店店长', value: 403 },
  { label: '赵五（136****3456）- 运营专员', value: 404 },
  { label: '孙六（135****7890）- 财务', value: 405 },
])
const filteredPersonOptions = computed(() => {
  if (!personSearch.value) return allPersons.value
  const kw = personSearch.value.toLowerCase()
  return allPersons.value.filter(p => p.label.toLowerCase().includes(kw))
})

// 稳定的 on-search 回调引用（避免内联箭头函数导致 n-select 重渲染）
const onMerchantSearch = (q: string) => { merchantSearch.value = q }
const onAgentSearch = (q: string) => { agentSearch.value = q }
const onShopSearch = (q: string) => { shopSearch.value = q }
const onPersonSearch = (q: string) => { personSearch.value = q }

function onTargetTypeChange() {
  form.value.roles = []
  form.value.selectedMerchants = []
  form.value.selectedAgents = []
  form.value.selectedShops = []
  form.value.selectedPersons = []
}
function onCustomTypeChange() {
  form.value.selectedMerchants = []
  form.value.selectedAgents = []
  form.value.selectedShops = []
  form.value.selectedPersons = []
}
function openEditor() {
  form.value = { channels: ['site'], targetType: 'all', roles: [], customType: 'merchant', selectedMerchants: [], selectedAgents: [], selectedShops: [], selectedPersons: [], template: null, title: '', content: '', scheduled: false, sendAt: null }
  showSendModal.value = true
}

// ========== 消息列表 ==========
interface MsgItem {
  id: number; title: string; content: string; channels: string[]
  targetType: string; targetDetail?: string
  status: string; sentAt: string; readRate: number; failReason?: string
}
const msgList = ref<MsgItem[]>([
  { id: 1, title: '系统升级维护通知', content: '计划于5月2日02:00-06:00进行系统升级维护', channels: ['site','sms'], targetType: 'all', status: 'sent', sentAt: '2026-04-29 09:00', readRate: 87.5 },
  { id: 2, title: '对账中心上线通知', content: '对账中心模块已正式上线，欢迎使用', channels: ['site'], targetType: 'merchant_admin', status: 'sent', sentAt: '2026-04-28 15:00', readRate: 62.3 },
  { id: 3, title: '结算周期变更提醒', content: '结算周期从T+7调整为T+5', channels: ['sms'], targetType: 'merchant_admin', status: 'failed', sentAt: '2026-04-27 11:00', readRate: 0, failReason: '短信服务商接口超时' },
  { id: 4, title: '五一活动预热', content: '五一假期即将来临，请提前做好门店活动准备', channels: ['site','sms'], targetType: 'merchant_staff', status: 'pending', sentAt: '-', readRate: 0 },
  { id: 5, title: '结算到账通知', content: '深圳福田旗舰店您好，您2026年4月的结算金额 ¥52,380.00 已到账', channels: ['site'], targetType: 'custom', targetDetail: '深圳福田旗舰店', status: 'sent', sentAt: '2026-04-26 08:30', readRate: 95.1 },
  { id: 6, title: '设备离线告警', content: '设备「VR-03号机」(SN:HKB23001)已离线超过30分钟', channels: ['site','sms'], targetType: 'custom', targetDetail: '深圳福田旗舰店-王小丫', status: 'sent', sentAt: '2026-04-25 14:20', readRate: 100 },
])

const filteredMessages = computed(() => {
  let list = msgList.value
  if (searchKey.value) {
    const kw = searchKey.value.toLowerCase()
    list = list.filter(m => m.title.toLowerCase().includes(kw) || m.content.toLowerCase().includes(kw))
  }
  if (channelFilter.value) list = list.filter(m => m.channels.includes(channelFilter.value))
  if (statusFlt.value) list = list.filter(m => m.status === statusFlt.value)
  return list
})

const columns: DataTableColumns<MsgItem> = [
  { title: 'ID', key: 'id', width: 50 },
  { title: '标题', key: 'title', ellipsis: { tooltip: true }, render(row) {
    return h('span', {}, [row.title])
  }},
  {
    title: '渠道', key: 'channels', width: 110,
    render(row) { return h(NSpace, { wrap: false }, () => row.channels.map(c => h(NTag, { size: 'small', bordered: false, type: c === 'sms' ? 'warning' : 'info' }, () => c === 'sms' ? '短信' : '站内'))) }
  },
  { title: '目标', key: 'targetType', width: 130,
    render(row) { return row.targetDetail ? `${targetLabel(row.targetType)} · ${row.targetDetail}` : targetLabel(row.targetType) }
  },
  {
    title: '状态', key: 'status', width: 85,
    render(row) { return h(NTag, { size: 'small', type: statusMap[row.status]?.type || 'default', bordered: false }, () => statusMap[row.status]?.label || row.status) }
  },
  { title: '阅读率', key: 'readRate', width: 85, render(row) { return `${row.readRate}%` } },
  { title: '发送时间', key: 'sentAt', width: 145 },
  {
    title: '操作', key: 'actions', width: 170,
    render(row) {
      return h(NSpace, null, () => [
        h(NButton, { text: '', size: 'small', type: 'primary' }, () => [h(NIcon, { component: EyeOutline }), ' 详情']),
        row.status === 'failed' ? h(NButton, { text: '', size: 'small', type: 'warning' }, () => [h(NIcon, { component: RefreshOutline }), ' 重试']) : null,
        h(NButton, { text: '', size: 'small', type: 'error' }, () => [h(NIcon, { component: TrashOutline })]),
      ])
    }
  },
]
const targetMap: Record<string, string> = { all: '全部', merchant_admin: '商家管理', merchant_staff: '店员', agent_admin: '代理商管理', platform_ops: '平台运营', custom: '指定' }
function targetLabel(v: string) { return targetMap[v] || v }
const statusMap: Record<string, {label: string; type: 'success'|'error'|'warning'}> = {
  sent: { label: '已发送', type: 'success' },
  failed: { label: '失败', type: 'error' },
  pending: { label: '待发送', type: 'warning' },
}

// ========== 自动通知规则 ==========
const showRuleModal = ref(false)
const editRuleId = ref<number | null>(null)
const ruleForm = ref({ event: '', titleTpl: '', contentTpl: '', channels: ['site'] as string[], targets: [] as string[], enabled: true })

const eventOptions = [
  // ── 纯自动（低频重要，系统自主触发） ──
  { label: '【财务结算】结算单生成', value: 'evt_settlement_create', desc: '系统按周期跑批生成结算单时自动触发，无需人工干预' },
  { label: '【订单监控】大额订单', value: 'evt_order_large', desc: '收银订单金额 ≥ 阈值（如¥500）时即时触发' },
  { label: '【安全风控】异常登录', value: 'evt_login_anomaly', desc: '检测到异地/IP异常/频繁失败等可疑登录行为时自动触发' },
]
const ruleRoleOptions = [
  { label: '商家管理员', value: 'merchant_admin' },
  { label: '商家员工（含店长）', value: 'merchant_staff' },
  { label: '代理商管理员', value: 'agent_admin' },
  { label: '平台运营', value: 'platform_ops' },
]

const selectedEventDesc = computed(() => {
  const opt = eventOptions.find(o => o.value === ruleForm.value.event)
  return (opt as any)?.desc || ''
})
function onRuleEventSelect() { /* desc由computed自动更新 */ }

interface AutoRule { id: number; event: string; eventLabel: string; targets: string[]; channels: string[]; enabled: boolean; lastTriggered: string; triggerCount: number }

const autoRules = ref<AutoRule[]>([
  { id: 1, event: 'evt_settlement_create', eventLabel: '结算单生成', targets: ['merchant_admin'], channels: ['site','sms'], enabled: true, lastTriggered: '2026-04-26 02:00', triggerCount: 156 },
  { id: 5, event: 'evt_order_large', eventLabel: '大额订单', targets: ['merchant_admin','platform_ops'], channels: ['site'], enabled: true, lastTriggered: '2026-04-24 18:45', triggerCount: 34 },
  { id: 8, event: 'evt_login_anomaly', eventLabel: '异常登录', targets: ['merchant_admin'], channels: ['sms'], enabled: true, lastTriggered: '2026-04-20 03:12', triggerCount: 5 },
])

const autoColumns: DataTableColumns<AutoRule> = [
  { title: 'ID', key: 'id', width: 50 },
  { title: '触发事件', key: 'eventLabel', ellipsis: { tooltip: true }},
  {
    title: '接收角色', key: 'targets', width: 200,
    render(row) { return h(NSpace, { wrap: true }, () => row.targets.map(t => h(NTag, { size: 'small', bordered: false, type: 'info' }, () => ({ merchant_admin:'商家管理', merchant_staff:'店员', agent_admin:'代理商', platform_ops:'运营' }[t] || t)))) }
  },
  {
    title: '渠道', key: 'channels', width: 110,
    render(row) { return h(NSpace, { wrap: false }, () => row.channels.map(c => h(NTag, { size: 'small', bordered: false, type: c === 'sms' ? 'warning' : 'info' }, () => c === 'sms' ? '短信' : '站内'))) }
  },
  {
    title: '状态', key: 'enabled', width: 75,
    render(row) { return h(NSwitch, { size: 'small', value: row.enabled }) }
  },
  { title: '最近触发', key: 'lastTriggered', width: 140 },
  { title: '累计次数', key: 'triggerCount', width: 85 },
  {
    title: '操作', key: 'actions', width: 140,
    render(row) {
      return h(NSpace, null, () => [
        h(NButton, { text: '', size: 'small', type: 'warning', onClick: () => editRule(row) }, () => [h(NIcon, { component: PencilOutline }), ' 编辑']),
        h(NButton, { text: '', size: 'small', type: 'error' }, () => [h(NIcon, { component: TrashOutline })]),
      ])
    }
  },
]

function editRule(rule?: AutoRule) {
  if (rule) {
    editRuleId.value = rule.id
    ruleForm.value = { ...rule, targets: [...rule.targets], channels: [...rule.channels] } as any
  } else {
    editRuleId.value = null
    ruleForm.value = { event: '', titleTpl: '', contentTpl: '', channels: ['site'], targets: [], enabled: true }
  }
  showRuleModal.value = true
}
function saveRule() { showRuleModal.value = false; message.success(editRuleId.value ? '规则修改成功' : '规则创建成功') }

// ========== 通用 ==========
function handleFilter() {}
function handleSend() { showSendModal.value = false; message.success('消息发送任务已创建') }
const rowKey = (row: any) => row.id
</script>

<style scoped>
.page-container { padding: 24px; background: var(--color-bg-base); min-height: calc(100vh - 64px); }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0 0 4px 0; }
.header-desc { font-size: 14px; color: var(--text-muted); margin: 0; }

.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 16px; }
.stat-box { background: white; border-radius: 12px; border: 1px solid var(--border-color); padding: 20px; text-align: center; box-shadow: var(--shadow-sm); }
.stat-num { font-family: 'Orbitron', sans-serif; font-size: 28px; font-weight: 700; }
.stat-num.success { color: #10B981; }
.stat-num.primary { color: #3B82F6; }
.stat-num.warning { color: #F59E0B; }
.stat-num.error { color: #EF4444; }
.stat-label { font-size: 13px; color: var(--text-muted); margin-top: 4px; }

.content-card { background: white; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); padding: 20px; }
.filter-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.section-desc { font-size: 13px; color: var(--text-muted); margin-bottom: 12px; line-height: 1.6; }
.section-desc strong { color: var(--text-primary); }
.section-desc .hint { display: block; margin-top: 4px; font-size: 12px; color: #F59E0B; background: rgba(245,158,11,0.08); padding: 4px 8px; border-radius: 6px; }

.tpl-preview { background: rgba(59,130,246,0.05); border: 1px solid rgba(59,130,246,0.15); border-radius: 8px; padding: 10px 14px; }
.tpl-preview strong { font-size: 13px; color: #2563EB; }
.tpl-preview p { margin: 4px 0 0; font-size: 12px; color: var(--text-secondary); }
.evt-desc { font-size: 12px; color: #6B7280; background: rgba(59,130,246,0.06); padding: 6px 10px; border-radius: 6px; margin-top: 4px; line-height: 1.5; }
</style>
