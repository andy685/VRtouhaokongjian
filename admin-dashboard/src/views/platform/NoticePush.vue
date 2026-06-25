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

    <!-- 消息列表 -->
    <div class="content-card">
      <div class="filter-bar">
        <n-input v-model:value="searchKey" placeholder="搜索消息内容..." clearable style="width: 240px;" />
        <n-select v-model:value="categoryFilter" :options="[{label:'全部分类',value:null},...MESSAGE_CATEGORIES]" placeholder="消息分类" clearable style="width: 140px;" />
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

        <!-- 消息分类 -->
        <n-form-item label="消息分类" required>
          <n-select v-model:value="form.category" :options="MESSAGE_CATEGORIES" placeholder="选择消息分类" />
        </n-form-item>

        <!-- 目标对象 -->
        <n-form-item label="目标对象">
          <n-radio-group v-model:value="form.targetType" @update-value="onTargetTypeChange">
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

    <!-- ===== 消息详情弹窗 ===== -->
    <n-modal v-model:show="showMsgDetailModal" preset="card" title="消息详情" style="width: 640px; max-width: 90vw;" :bordered="false">
      <div class="msg-detail" v-if="msgDetail">
        <n-descriptions :column="1" bordered size="small">
          <n-descriptions-item label="标题">
            <span class="wrap-text">{{ msgDetail.title }}</span>
          </n-descriptions-item>
          <n-descriptions-item label="消息分类">
            <n-tag :type="categoryTagType(msgDetail.category)" size="small">{{ categoryLabel(msgDetail.category) }}</n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="推送渠道">{{ msgDetail.channels?.join('、') }}</n-descriptions-item>
          <n-descriptions-item label="目标对象">{{ targetLabel(msgDetail.targetType) }}{{ msgDetail.targetDetail ? ' · ' + msgDetail.targetDetail : '' }}</n-descriptions-item>
          <n-descriptions-item label="状态">
            <n-tag :type="statusMap[msgDetail.status]?.type || 'default'" size="small">{{ statusMap[msgDetail.status]?.label || msgDetail.status }}</n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="阅读率">{{ msgDetail.readRate }}%</n-descriptions-item>
          <n-descriptions-item label="发送时间">{{ msgDetail.sentAt }}</n-descriptions-item>
          <n-descriptions-item v-if="msgDetail.failReason" label="失败原因">
            <span class="wrap-text">{{ msgDetail.failReason }}</span>
          </n-descriptions-item>
        </n-descriptions>
        <!-- 内容区域独立展示，支持多行 -->
        <div class="msg-content-section">
          <div class="msg-content-label">消息内容</div>
          <div class="msg-content-box">{{ msgDetail.content }}</div>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { NButton, NIcon, NTag, NSpace, useMessage } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { PaperPlaneOutline, EyeOutline, RefreshOutline, TrashOutline } from '@vicons/ionicons5'
import { MESSAGE_CATEGORIES, categoryLabel, categoryTagType } from '../../constants/noticeTypes'

const message = useMessage()

// ========== 筛选 ==========
const searchKey = ref('')
const categoryFilter = ref<string | null>(null)
const channelFilter = ref<string | null>(null)
const statusFlt = ref<string | null>(null)

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
  category: null as string | null,
  targetType: 'role',
  roles: [] as string[],
  customType: 'merchant',
  selectedMerchants: [] as number[],
  selectedAgents: [] as number[],
  selectedShops: [] as number[],
  selectedPersons: [] as number[],
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
  { label: '供应商', value: 'supplier' },
  { label: '平台运营', value: 'platform_ops' },
]

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
  form.value = { channels: ['site'], category: null, targetType: 'role', roles: [], customType: 'merchant', selectedMerchants: [], selectedAgents: [], selectedShops: [], selectedPersons: [], title: '', content: '', scheduled: false, sendAt: null }
  showSendModal.value = true
}

// ========== 消息列表 ==========
interface MsgItem {
  id: number; title: string; content: string; category: string; channels: string[]
  targetType: string; targetDetail?: string
  status: string; sentAt: string; readRate: number; failReason?: string
}
const msgList = ref<MsgItem[]>([
  { id: 1, title: '系统升级维护通知', content: '计划于5月2日02:00-06:00进行系统升级维护', category: 'announcement', channels: ['site','sms'], targetType: 'all', status: 'sent', sentAt: '2026-04-29 09:00', readRate: 87.5 },
  { id: 2, title: '对账中心上线通知', content: '对账中心模块已正式上线，欢迎使用', category: 'announcement', channels: ['site'], targetType: 'merchant_admin', status: 'sent', sentAt: '2026-04-28 15:00', readRate: 62.3 },
  { id: 3, title: '结算周期变更提醒', content: '结算周期从T+7调整为T+5', category: 'financial', channels: ['sms'], targetType: 'merchant_admin', status: 'failed', sentAt: '2026-04-27 11:00', readRate: 0, failReason: '短信服务商接口超时' },
  { id: 4, title: '五一活动预热', content: '五一假期即将来临，请提前做好门店活动准备', category: 'announcement', channels: ['site','sms'], targetType: 'merchant_staff', status: 'pending', sentAt: '-', readRate: 0 },
  { id: 5, title: '结算到账通知', content: '深圳福田旗舰店您好，您2026年4月的结算金额 ¥52,380.00 已到账', category: 'financial', channels: ['site'], targetType: 'custom', targetDetail: '深圳福田旗舰店', status: 'sent', sentAt: '2026-04-26 08:30', readRate: 95.1 },
  { id: 6, title: '设备离线告警', content: '设备「VR-03号机」(SN:HKB23001)已离线超过30分钟', category: 'security', channels: ['site','sms'], targetType: 'custom', targetDetail: '深圳福田旗舰店-王小丫', status: 'sent', sentAt: '2026-04-25 14:20', readRate: 100 },
  { id: 8, title: '异常大额订单提醒 — ¥3,500', content: '订单 ORD-202604290088 金额 ¥3,500.00 超过监控阈值，请关注核实', category: 'order', channels: ['site','sms'], targetType: 'merchant_admin', status: 'sent', sentAt: '2026-04-29 16:22', readRate: 92.0 },
  { id: 7, title: '端午节运营指南公告', content: `各位商家朋友：

端午佳节即将到来，为帮助大家做好节日运营，现将相关注意事项通知如下：

一、活动时间安排
2026年6月7日 — 2026年6月10日
建议提前3天完成活动配置与物料准备。

二、推荐玩法
1. 限时折扣 + 满减叠加：设置「端午特惠专区」，提升客单价
2. 会员专属券：针对老用户发放节日专属优惠券，激活沉默用户
3. 到店打卡活动：结合VR设备体验，增加门店客流

三、注意事项
• 活动期间请确保设备正常运行，提前做好检修
• 节日期间客服响应时效调整为30分钟内
• 如遇突发问题，请拨打应急热线 400-XXX-XXXX

祝各位商家端午安康，生意兴隆！`, category: 'announcement', channels: ['site','sms'], targetType: 'merchant_admin', status: 'sent', sentAt: '2026-06-05 10:00', readRate: 78.4 },
])

const showMsgDetailModal = ref(false)
const msgDetail = ref<MsgItem | null>(null)
function showMsgDetail(row: MsgItem) {
  msgDetail.value = row
  showMsgDetailModal.value = true
}

const filteredMessages = computed(() => {
  let list = msgList.value
  if (searchKey.value) {
    const kw = searchKey.value.toLowerCase()
    list = list.filter(m => m.title.toLowerCase().includes(kw) || m.content.toLowerCase().includes(kw))
  }
  if (categoryFilter.value) list = list.filter(m => m.category === categoryFilter.value)
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
    title: '消息分类', key: 'category', width: 100,
    render(row) { return h(NTag, { size: 'small', type: categoryTagType(row.category), bordered: false }, () => categoryLabel(row.category)) }
  },
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
        h(NButton, { text: '', size: 'small', type: 'primary', onClick: () => showMsgDetail(row) }, () => [h(NIcon, { component: EyeOutline }), ' 详情']),
        row.status === 'failed' ? h(NButton, { text: '', size: 'small', type: 'warning' }, () => [h(NIcon, { component: RefreshOutline }), ' 重试']) : null,
        h(NButton, { text: '', size: 'small', type: 'error' }, () => [h(NIcon, { component: TrashOutline })]),
      ])
    }
  },
]
const targetMap: Record<string, string> = { all: '全部', merchant_admin: '商家管理', merchant_staff: '店员', agent_admin: '代理商管理', supplier: '供应商', platform_ops: '平台运营', custom: '指定' }
function targetLabel(v: string) { return targetMap[v] || v }
const statusMap: Record<string, {label: string; type: 'success'|'error'|'warning'}> = {
  sent: { label: '已发送', type: 'success' },
  failed: { label: '失败', type: 'error' },
  pending: { label: '待发送', type: 'warning' },
}

// ========== 通用 ==========
function handleFilter() {}
function handleSend() {
  if (!form.value.category) { message.warning('请选择消息分类'); return }
  if (!form.value.title.trim()) { message.warning('请输入消息标题'); return }
  showSendModal.value = false; message.success('消息发送任务已创建')
}
const rowKey = (row: any) => row.id
</script>

<style scoped>
.page-container { padding: 24px; background: var(--color-bg-base); min-height: calc(100vh - 64px); }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0 0 4px 0; }
.header-desc { font-size: 14px; color: var(--text-muted); margin: 0; }

.content-card { background: white; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); padding: 20px; }
.filter-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
/* ===== 消息详情 ===== */
.wrap-text { white-space: pre-wrap; word-break: break-word; }
.msg-content-section { margin-top: 16px; }
.msg-content-label { font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px; }
.msg-content-box {
  white-space: pre-wrap;
  word-break: break-word;
  background: var(--color-bg-card, #f9fafb);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  padding: 14px 16px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-primary);
  max-height: 320px;
  overflow-y: auto;
}
</style>
