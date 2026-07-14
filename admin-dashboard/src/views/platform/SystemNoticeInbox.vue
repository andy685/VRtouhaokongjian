<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1>系统通知</h1>
      </div>
      <n-space>
        <n-button type="primary" size="small" @click="markAllRead">全部已读</n-button>
      </n-space>
    </div>

    <!-- Tab 分类 -->
    <div class="notice-card">
      <n-tabs v-model:value="activeTab" type="line" animated>
        <n-tab-pane name="all" tab="全部">
          <NoticeList :items="allNotices" :highlight-id="highlightId" @read="markAsRead" @delete="removeNotice" />
        </n-tab-pane>

        <n-tab-pane name="unread" tab="未读">
          <NoticeList :items="unreadNotices" :forceUnread="true" :highlight-id="highlightId" @read="markAsRead" @delete="removeNotice" />
          <div v-if="!unreadNotices.length" class="empty-hint">暂无未读通知</div>
        </n-tab-pane>

        <n-tab-pane name="read" tab="已读">
          <NoticeList :items="readNotices" :highlight-id="highlightId" @read="markAsRead" @delete="removeNotice" />
          <div v-if="!readNotices.length" class="empty-hint">暂无已读通知</div>
        </n-tab-pane>
      </n-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { NButton, NTabs, NTabPane, useMessage } from 'naive-ui'
import NoticeList from './_components/NoticeList.vue'

const message = useMessage()
const route = useRoute()
const activeTab = ref('all')
const highlightId = ref<string | null>(null)  // 需要高亮的通知 detailId

interface SysNotice {
  id: number
  title: string
  content: string
  time: string
  read: boolean
  type: 'financial' | 'order' | 'security' | 'announcement'
  severity: 'info' | 'warning' | 'error' | 'success'
  sourceEvent?: string
  meta?: Record<string, any>
  detailId: string    // 与铃铛面板一一对应
}

const noticeList = ref<SysNotice[]>([
  // ── 财务结算 ──
  {
    id: 1,
    title: '4月份商家结算单已全部生成',
    content: '系统已按 T+5 周期完成4月份商家结算单的批量生成。本次共生成结算单 1,286 笔，涉及商家 892 家，总金额 ¥8,234,560.00。当前状态：待审核打款。请登录「异常订单」页面核对异常后提交打款申请。',
    time: '2026-04-29 02:00',
    read: false,
    type: 'financial',
    severity: 'info',
    sourceEvent: 'evt_settlement_create',
    meta: { count: 1286, merchantCount: 892, totalAmount: 8234560 },
    detailId: 'n-settlement-202604',
  },
  {
    id: 7,
    title: '3月份结算异常汇总 — 3笔需人工复核',
    content: '3月份结算跑批完成后发现 3 笔异常订单需要人工介入：\n1. 深圳福田旗舰店 #ORD-2026032890 — 退款与扣款时间重叠\n2. 南山科技园店 #ORD-2026033012 — 金额 ¥-12.30 负数订单\n3. 广州天河店 #ORD-2026033156 — 渠道分润比例超出配置范围\n请前往结算管理页面处理。',
    time: '2026-04-26 02:15',
    read: true,
    type: 'financial',
    severity: 'warning',
    detailId: 'n-settlement-err-mar',
  },

  // ── 订单监控 ──
  {
    id: 2,
    title: '今日大额订单汇总 — 共 12 笔，较昨日 +25%',
    content: '截至当前，今日大额消费订单（≥¥500）共 12 笔：\n• 最大单笔：¥2,380（深圳福田店，14:32）\n• 总金额：¥9,760\n• 分布：深圳区域 7 笔 / 广州区域 3 笔 / 杭州区域 2 笔\n较昨日同期的 9 笔增长 33%，趋势正常。',
    time: '2026-04-29 18:45',
    read: false,
    type: 'order',
    severity: 'warning',
    sourceEvent: 'evt_order_large',
    meta: { count: 12, totalAmount: 9760, maxAmount: 2380 },
    detailId: 'n-order-large-today',
  },
  {
    id: 8,
    title: '大额订单告警 — 单笔 ¥3,500 超过阈值',
    content: '检测到一笔超常规大额订单：\n• 订单号：ORD-202604290088\n• 金额：¥3,500.00\n• 店铺：深圳福田旗舰店\n• 时间：2026-04-29 16:20\n• 支付方式：会员储值扣款\n该金额超过单日阈值（¥2000），请关注核实是否为正常业务。',
    time: '2026-04-29 16:22',
    read: false,
    type: 'order',
    severity: 'error',
    sourceEvent: 'evt_order_large',
    meta: { orderNo: 'ORD-202604290088', amount: 3500 },
    detailId: 'n-order-large-3500',
  },

  // ── 安全风控 ──
  {
    id: 3,
    title: '设备长时间离线告警 — 深圳福田旗舰店 VR-03',
    content: '设备信息：\n• 设备名：VR-03号机\n• SN：HKB23001\n• 所属：深圳福田旗舰店\n• 离线开始时间：2026-04-29 13:50\n• 已持续离线：2 小时 10 分钟\n可能原因：网络中断 / 设备断电 / 电源故障\n建议联系门店确认设备状态。',
    time: '2026-04-29 16:00',
    read: false,
    type: 'security',
    severity: 'error',
    meta: { deviceName: 'VR-03号机', sn: 'HKB23001', shop: '深圳福田旗舰店' },
    detailId: 'n-device-offline-vr03',
  },
  {
    id: 4,
    title: '异常登录检测 — 3 次来自可疑 IP 的登录尝试',
    content: '安全系统拦截了以下可疑登录行为：\n\n1. 时间：02:12 | IP：103.24.88.* | 地区：未知境外 | 尝试账号：admin01 | 状态：已拦截\n2. 时间：02:14 | IP：103.24.88.* | 地区：未知境外 | 尝试账号：ops_wang | 状态：已拦截\n3. 时间：02:17 | IP：185.220.*.* | 地区：荷兰 | 尝试账号：admin01 | 状态：已拦截\n\n该 IP 已被临时拉黑（24小时）。如非本人操作，建议相关账号立即修改密码。',
    time: '2026-04-29 03:20',
    read: true,
    type: 'security',
    severity: 'error',
    sourceEvent: 'evt_login_anomaly',
    meta: { ip: '103.24.88.*', attemptCount: 3 },
    detailId: 'n-login-anomaly-ip103',
  },
  {
    id: 9,
    title: '异常登录提醒 — 运营账号 ops_zhang 异地登录',
    content: '检测到运营账号「ops_zhang」在非常规地点登录：\n• 登录时间：2026-04-29 11:30\n• 登录 IP：120.86.*.*\n• 登录地区：四川成都\n• 常用地区：广东深圳\n若为本人出差使用可忽略；否则请立即修改密码并联系管理员。',
    time: '2026-04-29 11:31',
    read: false,
    type: 'security',
    severity: 'warning',
    sourceEvent: 'evt_login_anomaly',
    meta: { account: 'ops_zhang', ip: '120.86.*.*', location: '四川成都' },
    detailId: 'n-login-anomaly-opszhang',
  },

  // ── 系统公告 ──
  {
    id: 5,
    title: '【系统公告】五一假期运维安排已发布',
    content: '五一假期（5月1日-5月5日）运维安排如下：\n\n• 5月2日 02:00-06:00 计划性系统升级维护\n• 假期期间客服热线：400-xxx-xxxx（09:00-18:00）\n• 紧急技术支持：值班手机 138****0001\n• 结算打款顺延至 5月6日\n\n请各运营人员提前做好相关工作安排。',
    time: '2026-04-29 09:00',
    read: true,
    type: 'announcement',
    severity: 'success',
    detailId: 'n-announce-may1',
  },
  {
    id: 6,
    title: '【版本更新】后台管理系统 v2.4.0 已上线',
    content: '新版本更新内容：\n✅ 新增：异常订单模块\n✅ 新增：帮助中心 & 平台通知系统\n✅ 优化：结算规则从 T+7 调整为 T+5\n🐛 修复：设备在线状态显示延迟问题\n\n详细变更日志请查看公告管理页面。',
    time: '2026-04-27 10:00',
    read: true,
    type: 'announcement',
    severity: 'info',
    detailId: 'n-announce-v240',
  },
])

// ====== Tab 过滤 ======
const allNotices = computed(() => noticeList.value)
const unreadNotices = computed(() => noticeList.value.filter(n => !n.read))
const readNotices = computed(() => noticeList.value.filter(n => n.read))

function markAsRead(id: number) {
  const item = noticeList.value.find(n => n.id === id)
  if (item) item.read = true
}
function markAllRead() {
  noticeList.value.forEach(n => n.read = true)
  message.success('已全部标记为已读')
}
function removeNotice(id: number) {
  const idx = noticeList.value.findIndex(n => n.id === id)
  if (idx !== -1) noticeList.value.splice(idx, 1)
  message.success('通知已删除')
}

// ====== 从铃铛面板跳转时自动定位 ======
onMounted(() => {
  const queryId = route.query.id as string | undefined
  if (!queryId) return
  highlightId.value = queryId
  const target = noticeList.value.find(n => n.detailId === queryId)
  if (target) {
    // 统一跳转到「全部」tab，通过标签区分分类
    activeTab.value = 'all'
    // 标记为已读
    target.read = true
    // 等 DOM 渲染后滚动到高亮项
    nextTick(() => {
      const el = document.querySelector(`[data-notice-id="${queryId}"]`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // 3秒后取消高亮
      setTimeout(() => { highlightId.value = null }, 3000)
    })
  }
})
</script>

<style scoped>
.page-container { padding: 24px; min-height: calc(100vh - 64px); }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }

.notice-card {
  background: white;
  border-radius: 14px;
  border: 1px solid var(--border-color);
  padding: 24px;
}

.empty-hint {
  text-align: center; padding: 48px 0;
  color: var(--text-muted); font-size: 14px;
}
</style>
