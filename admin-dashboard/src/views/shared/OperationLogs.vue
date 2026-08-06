<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">操作日志</h1>
        <p class="page-desc">统计关键后台操作结果，便于追溯价格、退款、赠送、会员资产和权限配置等变更。</p>
      </div>
      <n-space>
        <n-input v-model:value="keyword" placeholder="搜索对象/操作人/备注" size="small" clearable style="width: 220px;">
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
        <n-select v-model:value="moduleFilter" :options="moduleOptions" placeholder="操作模块" size="small" clearable style="width: 140px;" />
        <n-select v-model:value="typeFilter" :options="typeOptions" placeholder="操作类型" size="small" clearable style="width: 150px;" />
        <n-select v-model:value="resultFilter" :options="resultOptions" placeholder="操作结果" size="small" clearable style="width: 120px;" />
        <n-button secondary size="small" @click="exportLogs">导出</n-button>
      </n-space>
    </div>

    <div class="content-card">
      <n-tabs v-model:value="activeTab" type="line" animated>
        <n-tab-pane name="all" tab="全部">
          <n-data-table :columns="columns" :data="filteredLogs" :pagination="{ pageSize: 12 }" striped />
        </n-tab-pane>
        <n-tab-pane name="financial" tab="资金/价格">
          <n-data-table :columns="columns" :data="tabLogs('financial')" :pagination="{ pageSize: 12 }" striped />
        </n-tab-pane>
        <n-tab-pane name="member" tab="会员权益">
          <n-data-table :columns="columns" :data="tabLogs('member')" :pagination="{ pageSize: 12 }" striped />
        </n-tab-pane>
        <n-tab-pane name="system" tab="配置/权限">
          <n-data-table :columns="columns" :data="tabLogs('system')" :pagination="{ pageSize: 12 }" striped />
        </n-tab-pane>
      </n-tabs>
    </div>

    <n-modal v-model:show="showDetail" preset="card" title="操作详情" style="width: 720px;" :bordered="false">
      <n-descriptions v-if="currentLog" :column="2" label-placement="left" bordered>
        <n-descriptions-item label="操作时间">{{ currentLog.time }}</n-descriptions-item>
        <n-descriptions-item label="操作结果">
          <n-tag :type="resultType(currentLog.result)" size="small" :bordered="false">{{ currentLog.result }}</n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="操作模块">{{ currentLog.module }}</n-descriptions-item>
        <n-descriptions-item label="操作类型">{{ currentLog.type }}</n-descriptions-item>
        <n-descriptions-item label="影响对象">{{ currentLog.target }}</n-descriptions-item>
        <n-descriptions-item label="操作人">{{ currentLog.operator }}</n-descriptions-item>
        <n-descriptions-item label="商家/店铺">{{ currentLog.merchant }} / {{ currentLog.store }}</n-descriptions-item>
        <n-descriptions-item label="来源">{{ currentLog.source }}</n-descriptions-item>
        <n-descriptions-item label="IP/终端">{{ currentLog.ip }} / {{ currentLog.terminal }}</n-descriptions-item>
        <n-descriptions-item label="关联单据">{{ currentLog.bizNo }}</n-descriptions-item>
        <n-descriptions-item label="变更前" :span="2">{{ currentLog.before }}</n-descriptions-item>
        <n-descriptions-item label="变更后" :span="2">{{ currentLog.after }}</n-descriptions-item>
        <n-descriptions-item label="备注" :span="2">{{ currentLog.remark }}</n-descriptions-item>
      </n-descriptions>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showDetail = false">关闭</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, h, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  NButton, NDataTable, NDescriptions, NDescriptionsItem, NIcon, NInput, NModal,
  NSelect, NSpace, NTabPane, NTabs, NTag, useMessage,
} from 'naive-ui'
import { SearchOutline } from '@vicons/ionicons5'

const route = useRoute()
const message = useMessage()

const keyword = ref('')
const activeTab = ref('all')
const moduleFilter = ref<string | null>(null)
const typeFilter = ref<string | null>(null)
const resultFilter = ref<string | null>(null)
const showDetail = ref(false)
const currentLog = ref<any>(null)

const isShopScope = computed(() => route.path.startsWith('/shop'))

const moduleOptions = [
  { label: '商品价格', value: '商品价格' },
  { label: '订单退款', value: '订单退款' },
  { label: '活动赠送', value: '活动赠送' },
  { label: '会员资产', value: '会员资产' },
  { label: '订单异常', value: '订单异常' },
  { label: '设备管理', value: '设备管理' },
  { label: '内容分发', value: '内容分发' },
  { label: '账号权限', value: '账号权限' },
  { label: '结算配置', value: '结算配置' },
]

const typeOptions = [
  { label: '改价格', value: '改价格' },
  { label: '退款', value: '退款' },
  { label: '赠送', value: '赠送' },
  { label: '储值调整', value: '储值调整' },
  { label: '游戏币调整', value: '游戏币调整' },
  { label: '次数调整', value: '次数调整' },
  { label: '撤销/作废', value: '撤销/作废' },
  { label: '设备绑定', value: '设备绑定' },
  { label: '内容分发', value: '内容分发' },
  { label: '权限变更', value: '权限变更' },
  { label: '结算参数变更', value: '结算参数变更' },
]

const resultOptions = [
  { label: '成功', value: '成功' },
  { label: '失败', value: '失败' },
  { label: '已驳回', value: '已驳回' },
  { label: '处理中', value: '处理中' },
]

const logs = ref([
  { id: 1, scope: 'both', time: '2026-08-05 16:10:26', module: '商品价格', type: '改价格', group: 'financial', target: '单次消费项目：过山车VR', merchant: '幻影星空', store: '深圳福田旗舰店', operator: '店长-王小丫', result: '成功', amount: 20, before: '原价 ¥88，会员价 ¥78', after: '原价 ¥108，会员价 ¥88', source: '商家后台', ip: '113.88.12.45', terminal: 'Mac Chrome', bizNo: 'PRICE-202608051610', remark: '暑期档价格调整' },
  { id: 2, scope: 'both', time: '2026-08-05 15:46:12', module: '订单退款', type: '退款', group: 'financial', target: '收银订单 SO202608050932', merchant: '幻影星空', store: '深圳福田旗舰店', operator: '店员-小李', result: '成功', amount: 168, before: '订单已支付 ¥168', after: '原路退款 ¥168，订单状态：已退款', source: '商家后台', ip: '113.88.12.46', terminal: '收银台 POS-02', bizNo: 'RF202608051546', remark: '设备故障，客户未体验' },
  { id: 3, scope: 'both', time: '2026-08-05 15:20:03', module: '活动赠送', type: '赠送', group: 'member', target: '会员：张浩理 138****7890', merchant: '幻影星空', store: '深圳福田旗舰店', operator: '店长-王小丫', result: '成功', amount: 50, before: '游戏币 120', after: '游戏币 170', source: '商家后台', ip: '113.88.12.45', terminal: 'Mac Chrome', bizNo: 'GIFT-202608051520', remark: '生日活动赠送 50 游戏币' },
  { id: 4, scope: 'both', time: '2026-08-05 14:52:48', module: '会员资产', type: '储值调整', group: 'member', target: '会员：阳恩 159****3344', merchant: '恒然集团', store: '南山科技园店', operator: '平台超管', result: '成功', amount: -200, before: '预存剩余金额 ¥2,200', after: '预存剩余金额 ¥2,000', source: '总运营后台', ip: '120.229.66.18', terminal: 'Windows Edge', bizNo: 'ADJ-202608051452', remark: '异常充值回滚' },
  { id: 5, scope: 'platform', time: '2026-08-05 14:30:18', module: '内容分发', type: '内容分发', group: 'system', target: '游戏：过山车VR v2.3.2', merchant: '全平台', store: '156 家店铺', operator: '平台超管', result: '处理中', amount: 0, before: '已分发 v2.3.1', after: '分发 v2.3.2', source: '总运营后台', ip: '120.229.66.18', terminal: 'Windows Edge', bizNo: 'DIST-202608051430', remark: '一键全发任务' },
  { id: 6, scope: 'platform', time: '2026-08-05 13:45:09', module: '结算配置', type: '结算参数变更', group: 'system', target: '商家分账：幻影星空', merchant: '幻影星空', store: '全部店铺', operator: '财务管理员', result: '成功', amount: 0, before: '平台抽成 8%', after: '平台抽成 10%', source: '总运营后台', ip: '120.229.66.20', terminal: 'Mac Safari', bizNo: 'SETTLE-202608051345', remark: '合同续签后调整' },
  { id: 7, scope: 'both', time: '2026-08-05 12:28:33', module: '订单异常', type: '撤销/作废', group: 'financial', target: '修改储值订单 BO202608051128', merchant: '幻影星空', store: '深圳福田旗舰店', operator: '店长-王小丫', result: '已驳回', amount: 500, before: '待作废，预存 +¥500', after: '审核驳回，订单保持有效', source: '商家后台', ip: '113.88.12.45', terminal: 'Mac Chrome', bizNo: 'VOID-202608051228', remark: '缺少客户确认凭证' },
  { id: 8, scope: 'both', time: '2026-08-05 11:59:41', module: '设备管理', type: '设备绑定', group: 'system', target: 'VR-03 绑定收银终端 POS-02', merchant: '幻影星空', store: '深圳福田旗舰店', operator: '店员-小李', result: '失败', amount: 0, before: 'VR-03 未绑定', after: '绑定失败', source: '商家后台', ip: '113.88.12.46', terminal: '店铺后台', bizNo: 'DEV-202608051159', remark: '设备在线校验失败' },
  { id: 9, scope: 'both', time: '2026-08-04 18:12:05', module: '会员资产', type: '次数调整', group: 'member', target: '会员：李明远 136****3456', merchant: '幻影星空', store: '深圳福田旗舰店', operator: '店长-王小丫', result: '成功', amount: 3, before: '剩余次数 0', after: '剩余次数 3', source: '商家后台', ip: '113.88.12.45', terminal: 'Mac Chrome', bizNo: 'TIMES-202608041812', remark: '投诉补偿' },
  { id: 10, scope: 'platform', time: '2026-08-04 16:40:22', module: '账号权限', type: '权限变更', group: 'system', target: '角色：店长', merchant: '全平台', store: '全部店铺', operator: '平台超管', result: '成功', amount: 0, before: '无退款审核权限', after: '增加退款审核权限', source: '总运营后台', ip: '120.229.66.18', terminal: 'Windows Edge', bizNo: 'ROLE-202608041640', remark: '统一权限模板更新' },
])

const scopedLogs = computed(() => logs.value.filter(item => !isShopScope.value || item.scope === 'both'))

const filteredLogs = computed(() => filterLogs(scopedLogs.value))

const columns = [
  { title: '操作时间', key: 'time', width: 165, sorter: (a: any, b: any) => a.time.localeCompare(b.time) },
  { title: '模块', key: 'module', width: 105, render: (row: any) => h(NTag, { size: 'small', bordered: false, type: moduleTagType(row.group) }, () => row.module) },
  { title: '操作类型', key: 'type', width: 120 },
  { title: '影响对象', key: 'target', minWidth: 190, ellipsis: { tooltip: true } },
  ...(isShopScope.value ? [] : [{ title: '商家/店铺', key: 'merchant', width: 180, render: (row: any) => `${row.merchant} / ${row.store}` }]),
  { title: '操作人', key: 'operator', width: 110 },
  { title: '结果', key: 'result', width: 90, render: (row: any) => h(NTag, { size: 'small', bordered: false, type: resultType(row.result) }, () => row.result) },
  { title: '变更摘要', key: 'summary', minWidth: 220, render: (row: any) => `${row.before} → ${row.after}` },
  { title: '操作', key: 'action', width: 80, fixed: 'right' as const, render: (row: any) => h(NButton, { size: 'tiny', secondary: true, onClick: () => openDetail(row) }, () => '详情') },
]

function filterLogs(list: any[]) {
  return list.filter(item => {
    if (moduleFilter.value && item.module !== moduleFilter.value) return false
    if (typeFilter.value && item.type !== typeFilter.value) return false
    if (resultFilter.value && item.result !== resultFilter.value) return false
    if (keyword.value) {
      const text = `${item.target}${item.operator}${item.remark}${item.bizNo}${item.merchant}${item.store}`
      if (!text.includes(keyword.value)) return false
    }
    return true
  })
}

function tabLogs(group: string) {
  return filterLogs(scopedLogs.value.filter(item => item.group === group))
}

function moduleTagType(group: string) {
  const map: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
    financial: 'warning',
    member: 'info',
    system: 'default',
  }
  return map[group] || 'default'
}

function resultType(result: string) {
  const map: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
    成功: 'success',
    失败: 'error',
    已驳回: 'error',
    处理中: 'warning',
  }
  return map[result] || 'default'
}

function openDetail(row: any) {
  currentLog.value = row
  showDetail.value = true
}

function exportLogs() {
  message.success(`已导出 ${filteredLogs.value.length} 条操作日志`)
}
</script>

<style scoped>
.page-container { padding: 20px 24px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 18px; }
.page-title { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.page-desc { font-size: 13px; color: var(--text-muted); margin: 6px 0 0; }
.content-card { background: white; border: 1px solid var(--border-color); border-radius: 12px; padding: 18px 20px; }
@media (max-width: 1100px) {
  .page-header { flex-direction: column; }
}
</style>
