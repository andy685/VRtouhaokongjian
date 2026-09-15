<template>
  <div class="page-container ai-report-page">
    <div class="page-header">
      <div>
        <h1>AI 诊断报告</h1>
        <p class="header-desc">系统按月为各店铺生成 AI 经营诊断报告，默认以 HTML 在线查看。</p>
      </div>
    </div>
    <section class="filter-card" aria-label="报告筛选">
      <n-space :size="12" wrap>
        <n-input v-model:value="keyword" clearable placeholder="搜索报告名称" style="width: 220px" aria-label="搜索报告名称">
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
        <n-select v-model:value="selectedMerchant" clearable placeholder="全部商家" :options="merchantOptions" style="width: 160px" aria-label="筛选商家" />
        <n-select v-model:value="selectedStore" clearable placeholder="全部店铺" :options="storeOptions" style="width: 180px" aria-label="筛选店铺" />
        <n-select v-model:value="selectedMonth" clearable placeholder="全部月份" :options="monthOptions" style="width: 150px" aria-label="筛选报告月份" />
        <n-select v-model:value="selectedStatus" clearable placeholder="全部状态" :options="statusOptions" style="width: 130px" aria-label="筛选报告状态" />
        <n-select v-model:value="selectedMerchantVisibility" clearable placeholder="商户可见性" :options="merchantVisibilityOptions" style="width: 130px" aria-label="筛选商户可见性" />
      </n-space>
    </section>
    <section class="content-card">
      <div class="table-title">
        <div><h2>报告列表</h2><span>共 {{ filteredReports.length }} 份报告</span></div>
        <span class="format-note">默认格式：HTML</span>
      </div>
      <n-data-table :columns="columns" :data="filteredReports" :pagination="{ pageSize: 10 }" :bordered="false" :scroll-x="1480" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, h, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NDataTable, NDropdown, NIcon, NInput, NSelect, NSpace, NTag, useMessage } from 'naive-ui'
import { SearchOutline } from '@vicons/ionicons5'

type Report = { id: number; title: string; store: string; merchant: string; month: string; version: string; score: number | null; status: string; merchantVisible: boolean; generatedAt: string; dataCutoff: string; summary: string; highlights: string[]; failureReason?: string }
const message = useMessage()
const router = useRouter()
const keyword = ref('')
const selectedMerchant = ref<string | null>(null)
const selectedStore = ref<string | null>(null)
const selectedMonth = ref<string | null>(null)
const selectedStatus = ref<string | null>(null)
const selectedMerchantVisibility = ref<string | null>(null)
const reports = ref<Report[]>([
  { id: 1, title: '深圳福田旗舰店 · 2026年8月 AI 经营诊断报告', store: '深圳福田旗舰店', merchant: '卓远娱乐', month: '2026-08', version: 'v2.0', score: 82, status: '已生成', merchantVisible: true, generatedAt: '2026-09-05 10:24', dataCutoff: '2026-09-01 03:10', summary: '本月经营整体健康，营收与订单均高于上月。工作日晚间转化偏弱，建议优先改善高峰前设备巡检与套餐组合。', highlights: ['工作日 18:00 后订单转化低于周末 31%', '亲子双人套餐具备增长空间', '头显异常集中在高峰时段前后'] },
  { id: 2, title: '广州萝岗区店 · 2026年8月 AI 经营诊断报告', store: '广州萝岗区店', merchant: '卓远娱乐', month: '2026-08', version: 'v1.0', score: 76, status: '已生成', merchantVisible: true, generatedAt: '2026-09-01 03:18', dataCutoff: '2026-09-01 03:15', summary: '营收保持稳定，但尾部游戏占用资源较多。建议优化内容陈列并以会员券推动复购。', highlights: ['两款尾部游戏点播占比不足 4%', '会员 30 天复购率有提升空间'] },
  { id: 3, title: '杭州滨江店 · 2026年8月 AI 经营诊断报告', store: '杭州滨江店', merchant: '幻境空间', month: '2026-08', version: 'v1.0', score: 58, status: '已生成', merchantVisible: false, generatedAt: '2026-09-01 03:20', dataCutoff: '2026-09-01 03:18', summary: '设备异常与退款指标同时升高，建议优先检查设备状态和退款原因。', highlights: ['设备异常率高于区域均值', '退款金额环比上升'] },
  { id: 4, title: '成都春熙路店 · 2026年7月 AI 经营诊断报告', store: '成都春熙路店', merchant: '沉浸世界', month: '2026-07', version: 'v1.0', score: 88, status: '已生成', merchantVisible: false, generatedAt: '2026-08-01 03:08', dataCutoff: '2026-08-01 03:05', summary: '营收、设备利用率和会员质量均表现良好，可沉淀套餐打法供同区域门店复用。', highlights: ['周末客单价高于区域均值', '设备可用率保持在 97%'] },
  { id: 5, title: '武汉光谷店 · 2026年8月 AI 经营诊断报告', store: '武汉光谷店', merchant: '沉浸世界', month: '2026-08', version: '—', score: null, status: '生成失败', merchantVisible: false, generatedAt: '2026-09-01 03:26', dataCutoff: '2026-09-01 03:22', summary: '', highlights: [], failureReason: '设备利用率指标快照缺失，无法完成报告生成。' },
])
const monthOptions = [{ label: '2026年8月', value: '2026-08' }, { label: '2026年7月', value: '2026-07' }]
const statusOptions = [{ label: '已生成', value: '已生成' }, { label: '生成中', value: '生成中' }, { label: '生成失败', value: '生成失败' }]
const merchantVisibilityOptions = [{ label: '已同步', value: 'synced' }, { label: '未同步', value: 'unsynced' }]
const downloadOptions = [{ label: '下载 PDF', key: 'PDF' }, { label: '下载 ZIP', key: 'ZIP' }]
const merchantOptions = Array.from(new Set(reports.value.map((item) => item.merchant))).map((name) => ({ label: name, value: name }))
const storeOptions = Array.from(new Set(reports.value.map((item) => item.store))).map((name) => ({ label: name, value: name }))
const filteredReports = computed(() => reports.value.filter((item) => {
  const term = keyword.value.trim().toLowerCase()
  return (!term || item.title.toLowerCase().includes(term))
    && (!selectedMerchant.value || item.merchant === selectedMerchant.value)
    && (!selectedStore.value || item.store === selectedStore.value)
    && (!selectedMonth.value || item.month === selectedMonth.value)
    && (!selectedStatus.value || item.status === selectedStatus.value)
    && (!selectedMerchantVisibility.value || (selectedMerchantVisibility.value === 'synced' ? item.merchantVisible : !item.merchantVisible))
}))
function statusTag(status: string) { return status === '已生成' ? 'success' : status === '生成失败' ? 'error' : 'info' }
/* 与商户端统一的经营状态段位：≥80 健康增长 / 70~79 稳中待升 / <70 重点优化 */
function healthStatus(score: number | null) {
  if (score === null) return null
  return score >= 80 ? { label: '健康增长', type: 'success' as const } : score >= 70 ? { label: '稳中待升', type: 'warning' as const } : { label: '重点优化', type: 'error' as const }
}
function showReport(report: Report) { router.push('/platform/ai-diagnostic/report/' + report.id) }
function retryReport(report: Report) { report.status = '生成中'; message.success('已重新发起报告生成任务') }
function exportReport(report: Report | null, type: 'PDF' | 'ZIP') { if (report) message.success(`${report.store} ${report.month} 报告已开始导出 ${type} 文件`) }
const columns = [
  { title: '报告名称', key: 'title', width: 360, align: 'left' as const, titleAlign: 'left' as const, ellipsis: { tooltip: true } },
  { title: '店铺', key: 'store', width: 150, align: 'left' as const, titleAlign: 'left' as const, ellipsis: { tooltip: true } },
  { title: '商家', key: 'merchant', width: 120, align: 'left' as const, titleAlign: 'left' as const, ellipsis: { tooltip: true } },
  { title: '报告月份', key: 'month', width: 110, align: 'left' as const, titleAlign: 'left' as const, render: (row: Report) => row.month.replace('-', '年') + '月' },
  { title: '当前版本', key: 'version', width: 90, align: 'left' as const, titleAlign: 'left' as const, render: (row: Report) => row.version === '—' ? '—' : h(NTag, { type: row.version === 'v2.0' ? 'info' : 'default', size: 'small' }, { default: () => row.version }) },
  { title: '经营状态', key: 'score', width: 110, align: 'left' as const, titleAlign: 'left' as const, render: (row: Report) => { const s = healthStatus(row.score); return s ? h(NTag, { type: s.type, size: 'small', round: true }, { default: () => s.label }) : '—' } },
  { title: '状态', key: 'status', width: 150, align: 'left' as const, titleAlign: 'left' as const, render: (row: Report) => h('div', { class: 'status-stack' }, [h(NTag, { type: statusTag(row.status), size: 'small' }, { default: () => row.status }), row.failureReason ? h('small', { title: row.failureReason }, row.failureReason) : null]) },
  { title: '商户可见', key: 'merchantVisible', width: 100, align: 'left' as const, titleAlign: 'left' as const, render: (row: Report) => h(NTag, { type: row.merchantVisible ? 'success' : 'default', size: 'small' }, { default: () => row.merchantVisible ? '已同步' : '未同步' }) },
  { title: '生成时间', key: 'generatedAt', width: 155, align: 'left' as const, titleAlign: 'left' as const },
  { title: '操作', key: 'actions', width: 150, fixed: 'right' as const, align: 'left' as const, titleAlign: 'left' as const, render: (row: Report) => row.status === '生成失败' ? h(NButton, { text: true, type: 'primary', size: 'small', onClick: () => retryReport(row) }, { default: () => '重试生成' }) : h('div', { class: 'operation-actions', style: { display: 'inline-flex', alignItems: 'center', gap: '16px', whiteSpace: 'nowrap' } }, [h(NButton, { text: true, size: 'small', onClick: () => showReport(row) }, { default: () => '查看' }), h(NDropdown, { options: downloadOptions, onSelect: (key: string) => exportReport(row, key as 'PDF' | 'ZIP') }, { default: () => h(NButton, { text: true, size: 'small' }, { default: () => '下载' }) })]) },
]
</script>

<style scoped>
.ai-report-page { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 20px; }
.page-header h1 { margin: 0 0 8px; font-size: 22px; }.header-desc { margin: 0; color: var(--text-secondary); }
.filter-card,.content-card { background:#fff; border:1px solid var(--border-color); border-radius:12px; padding:16px 18px; }
.filter-card { margin-bottom:16px; }.table-title { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }.table-title h2 { margin:0 0 4px; font-size:16px; }.table-title span { color:var(--text-secondary); font-size:13px; }.format-note { background:#f0f7ff; color:#1677ff !important; padding:4px 8px; border-radius:4px; }
.operation-actions{display:flex;align-items:center;gap:12px;white-space:nowrap}
.status-stack{display:flex;flex-direction:column;align-items:flex-start;gap:4px;line-height:1.2}.status-stack small{max-width:130px;color:#dc2626;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.content-card{min-width:0;overflow:hidden}
:deep(.n-data-table-th),:deep(.n-data-table-td){vertical-align:middle}:deep(.n-data-table-th__title){white-space:nowrap}
@media (max-width: 760px) { .ai-report-page{padding:16px}.page-header{flex-direction:column} }
</style>
