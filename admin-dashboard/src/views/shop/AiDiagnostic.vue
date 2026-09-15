<template>
  <div class="diagnostic-page">
    <section class="page-head">
      <div><n-tag type="info" size="small" round>AI 店铺增长官</n-tag><h1>AI 店铺经营诊断</h1><p>查看月度经营诊断，并补充系统无法获取的本月经营背景。</p></div>
      <n-space>
        <n-select v-if="stores.length > 1" v-model:value="selectedStoreId" :options="storeOptions" style="width:190px" />
      </n-space>
    </section>

    <section v-if="viewMode === 'list'" class="report-library">
      <div class="library-head"><div><h2>诊断报告</h2><p>选择一份报告查看完整经营分析；每份报告可独立补充经营背景。</p></div><span>{{ storeReports.length }} 份报告</span></div>
      <div v-if="storeReports.length">
        <section v-for="group in reportsByYear" :key="group.year" class="report-year-group">
          <h3>{{ group.year }} 年</h3>
          <div class="report-cards">
            <article v-for="report in group.items" :key="report.id" class="report-card" :class="healthInfo(report.score).className" @click="openReport(report.month)">
              <div class="report-card-main">
                <div class="report-copy">
                  <div class="report-card-top"><span>{{ report.month }}</span><span v-if="report.isNew" class="new-badge">新报告</span></div>
                  <n-tag :type="healthInfo(report.score).tagType" size="small" round>{{ healthInfo(report.score).label }}</n-tag>
                  <p>生成于 {{ report.generatedAt }}</p>
                </div>
                <div class="score-orb"><strong>{{ report.score }}</strong><span>健康分</span></div>
              </div>
              <div class="report-card-actions"><n-button size="small" secondary @click="openReport(report.month)">查看报告</n-button><n-button size="small" secondary type="primary" @click="openGenerator(report.month)">补充经营背景</n-button></div>
            </article>
          </div>
        </section>
      </div>
      <div v-else class="empty-card"><h2>暂未生成诊断报告</h2><p>报告将由系统按月自动生成。你可以通过页面顶部入口提前补充本月经营背景。</p></div>
    </section>

    <section v-else class="shop-workspace">
      <div class="report-content">
    <n-button text class="back-button" @click="viewMode = 'list'">← 返回报告中心</n-button>
    <template v-if="activeReport">
      <section class="report-cover">
        <div><span>AI 经营诊断报告</span><h2>{{ activeReport.store }} · {{ activeReport.month }}</h2><p>生成于 {{ activeReport.generatedAt }} · 数据截止 {{ activeReport.snapshotAt }}</p></div>
        <div class="cover-actions"><n-button @click="openGenerator(activeReport.month)">补充{{ activeReport.month }}经营背景</n-button><n-button @click="message.success('已开始导出 PDF')">下载 PDF</n-button><n-button @click="message.success('已开始导出 ZIP')">下载 ZIP</n-button></div>
      </section>
      <section class="score-grid">
        <div class="health-card" :class="healthInfo(activeReport.score).className"><span>经营健康分</span><strong>{{ activeReport.score }}</strong><small>{{ activeReport.level }}</small></div>
        <div class="dimension-card"><div v-for="item in displayDimensions" :key="item.label" class="dimension"><n-tooltip v-if="item.desc" trigger="hover" placement="top"><template #trigger><span class="dim-label">{{ item.label }}<i class="dim-info">?</i></span></template>{{ item.desc }}</n-tooltip><span v-else>{{ item.label }}</span><n-progress type="line" :percentage="item.score" :show-indicator="false" :height="8" :color="item.score >= 80 ? '#3B82F6' : item.score >= 70 ? '#F59E0B' : '#EF4444'" rail-color="#E2E8F0" /><strong>{{ item.score }}</strong></div></div>
      </section>
      <section class="content-card"><div class="section-title"><h2>关键指标快照</h2><span>与上月对比</span></div><div class="metrics"><div v-for="item in activeReport.metrics" :key="item.label"><span>{{ item.label }}</span><strong>{{ item.value }}</strong><small :class="item.down ? 'down' : 'up'">{{ item.trend }}</small></div></div></section>
      <section class="content-card"><div class="section-title"><h2>一页结论</h2></div><p class="conclusion">{{ activeReport.conclusion }}</p></section>
      <section class="content-card context-card"><div class="section-title"><h2>店长补充</h2><span>仅作为本期 AI 分析依据</span></div><p>{{ activeReport.context || '本期店长未提交额外经营背景，AI 仅依据系统数据快照、规则和诊断资料生成报告。' }}</p></section>
      <section class="content-card insight-grid"><article class="problem"><h2>主要问题</h2><p v-for="item in activeReport.problems" :key="item">{{ item }}</p></article><article class="chance"><h2>增长机会</h2><p v-for="item in activeReport.opportunities" :key="item">{{ item }}</p></article></section>
      <section class="content-card"><div class="section-title"><h2>下月行动计划</h2><span>建议门店按优先级执行</span></div><n-data-table :columns="actionColumns" :data="activeReport.actions" :pagination="false" :bordered="false" /></section>
    </template>
    <section v-else class="empty-card"><h2>该月份暂无报告</h2><p>报告将由系统按月自动生成。你可以在生成前补充本月经营背景，供 AI 作为分析依据。</p><n-button type="primary" @click="openGenerator">补充本月经营背景</n-button></section>
      </div>
    </section>

    <n-drawer v-model:show="showGenerator" placement="right" :width="620"><n-drawer-content :title="'补充' + generationMonthLabel + '经营背景'" closable>
      <div class="generator">
        <div class="generator-summary"><n-tag type="info">下次自动生成时引用</n-tag><h2>{{ currentStore.name }} · {{ generationMonthLabel }}</h2><p>报告由系统按月自动生成。此处补充仅作为下一次生成该月份报告的 AI 分析依据，不会立即生成或修改历史报告。</p></div>
        <div v-for="question in questions" :key="question.id" class="question"><strong>{{ question.title }}<i v-if="question.required" class="required-mark">*</i></strong><n-input v-model:value="question.answer" type="textarea" :rows="3" :placeholder="question.placeholder" /></div>
        <n-space justify="end"><n-button @click="showGenerator = false">取消</n-button><n-button type="primary" @click="saveContext">保存补充</n-button></n-space>
      </div>
    </n-drawer-content></n-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, h, ref, watch } from 'vue'
import { NButton, NDataTable, NDrawer, NDrawerContent, NInput, NProgress, NSelect, NSpace, NTag, NTooltip, useMessage } from 'naive-ui'
import { loadDiagnosticDimensions, loadSupplementQuestions } from '../../constants/aiDiagnosticConfig'
const message = useMessage()
const stores = [{ id: 'futian', name: '深圳福田旗舰店' }, { id: 'nanshan', name: '深圳南山科技园店' }]
const selectedStoreId = ref('futian')
const defaultReportMonth = new Date(2026, 7, 1).getTime()
const selectedMonth = ref(defaultReportMonth)
const generationMonth = ref(defaultReportMonth)
const showGenerator = ref(false)
const viewMode = ref<'list' | 'detail'>('list')
const questions = ref(loadSupplementQuestions().map((item) => ({ ...item, answer: '' })))
const currentStore = computed(() => stores.find((item) => item.id === selectedStoreId.value) || stores[0])
const storeOptions = stores.map((item) => ({ label: item.name, value: item.id }))
const selectedMonthLabel = computed(() => formatMonth(selectedMonth.value || Date.now()))
const generationMonthLabel = computed(() => formatMonth(generationMonth.value || Date.now()))
const reports = ref([
  { id: 'futian-202608', storeId: 'futian', month: formatMonth(defaultReportMonth), store: '深圳福田旗舰店', generatedAt: '2026-09-01 03:12', snapshotAt: '2026-09-01 03:10', score: 82, level: '健康增长', isNew: true, context: '', conclusion: '本月营收与订单均高于上月。主要增长来自周末亲子客群和会员储值复购，但工作日晚间转化偏弱，建议优先改善高峰前设备保障和套餐组合。', dimensions: [{ label: '营收增长力', score: 86 }, { label: '客流活跃度', score: 82 }, { label: '会员质量', score: 79 }, { label: '设备效率', score: 84 }, { label: '内容吸引力', score: 76 }, { label: '运营执行力', score: 81 }], metrics: [{ label: '营收', value: '¥826,500', trend: '+12.6%' }, { label: '订单数', value: '3,182', trend: '+8.4%' }, { label: '客单价', value: '¥259.7', trend: '+3.9%' }, { label: '设备可用率', value: '96.2%', trend: '-0.8%', down: true }], problems: ['工作日 18:00 后订单转化低于周末 31%', '两款尾部游戏点播占比不足 4%', '头显异常集中在高峰时段前后'], opportunities: ['将热门项目组合成亲子双人套餐', '用满减券或折扣券召回 30 天未消费会员', '将设备巡检前置到周五闭店前'], actions: [{ priority: 'P0', action: '周五闭店前完成头显巡检并登记异常', owner: '店长 / 设备负责人', metric: '高峰可用设备率 ≥ 96%' }, { priority: 'P1', action: '上线亲子双人套餐，主推 TOP3 游戏', owner: '店长', metric: '周末客单价提升 8%' }] },
  { id: 'futian-202607', storeId: 'futian', month: '2026年7月', store: '深圳福田旗舰店', generatedAt: '2026-08-01 03:06', snapshotAt: '2026-08-01 03:04', score: 74, level: '稳中待升', isNew: false, context: '暑期活动首周客流增加，但员工培训安排影响了高峰服务能力。', conclusion: '本月经营整体稳定，活动带来客流增长，但会员储值承接和高峰服务效率仍有改善空间。', dimensions: [{ label: '营收增长力', score: 75 }, { label: '客流活跃度', score: 78 }, { label: '会员质量', score: 70 }, { label: '设备效率', score: 80 }, { label: '内容吸引力', score: 69 }, { label: '运营执行力', score: 72 }], metrics: [{ label: '营收', value: '¥733,800', trend: '+4.2%' }, { label: '订单数', value: '2,840', trend: '+3.1%' }, { label: '客单价', value: '¥258.4', trend: '+1.0%' }, { label: '设备可用率', value: '97.0%', trend: '+0.4%' }], problems: ['新增会员转化低于暑期客流预期', '活动券核销集中在低客单项目'], opportunities: ['优化首充套餐露出', '复盘高绩效员工推荐话术'], actions: [{ priority: 'P0', action: '统一首充套餐推荐话术', owner: '店长', metric: '首充转化率提升 5%' }] },
  { id: 'futian-202606', storeId: 'futian', month: '2026年6月', store: '深圳福田旗舰店', generatedAt: '2026-07-01 03:08', snapshotAt: '2026-07-01 03:05', score: 63, level: '重点优化', isNew: false, context: '六一活动客流大增，但两台头显连续故障三天，新员工未完成上岗培训即顶班。', conclusion: '本月营收环比下滑，设备故障直接造成高峰时段订单流失，客诉率明显上升。建议优先恢复设备可用率，并补齐新人服务流程培训。', dimensions: [{ label: '营收增长力', score: 58 }, { label: '客流活跃度', score: 66 }, { label: '会员质量', score: 62 }, { label: '设备效率', score: 51 }, { label: '内容吸引力', score: 68 }, { label: '运营执行力', score: 60 }], metrics: [{ label: '营收', value: '¥618,200', trend: '-9.8%', down: true }, { label: '订单数', value: '2,405', trend: '-6.2%', down: true }, { label: '客单价', value: '¥257.1', trend: '-0.5%', down: true }, { label: '设备可用率', value: '88.4%', trend: '-8.6%', down: true }], problems: ['设备可用率跌至 88.4%，高峰时段排队流失明显', '六一活动期间客诉 12 起，集中在等待时长', '新员工独立上岗后服务评分下降'], opportunities: ['建立设备故障应急备机机制', '将高峰时段接待流程标准化并复训', '对六一流失客户发放回归补偿券'], actions: [{ priority: 'P0', action: '一周内完成全部头显检修并采购 2 台备机', owner: '设备负责人', metric: '设备可用率恢复至 95% 以上' }, { priority: 'P0', action: '完成 3 名新员工服务流程复训', owner: '店长', metric: '服务评分回升至 4.6 分' }, { priority: 'P1', action: '向活动期流失客户推送 20 元回归券', owner: '运营', metric: '回归券核销率 ≥ 15%' }] },
])
const activeReport = computed(() => reports.value.find((item) => item.storeId === selectedStoreId.value && item.month === selectedMonthLabel.value))
/* 维度标签以平台端配置为准；分数取报告生成时的快照 */
const displayDimensions = computed(() => {
  if (!activeReport.value) return []
  const configDims = loadDiagnosticDimensions()
  return activeReport.value.dimensions.map((item, index) => ({ label: configDims[index]?.label || item.label, score: item.score, desc: configDims[index]?.desc || '' }))
})
const storeReports = computed(() => reports.value.filter((item) => item.storeId === selectedStoreId.value).sort((a, b) => b.month.localeCompare(a.month)))
const reportsByYear = computed(() => {
  const groups = new Map<string, typeof storeReports.value>()
  storeReports.value.forEach((item) => { const year = item.month.slice(0, 4); groups.set(year, [...(groups.get(year) || []), item]) })
  return Array.from(groups, ([year, items]) => ({ year, items }))
})
const actionColumns = [{ title: '优先级', key: 'priority', width: 90, render: (row: any) => h(NTag, { type: row.priority === 'P0' ? 'error' : 'warning', size: 'small' }, { default: () => row.priority }) }, { title: '行动建议', key: 'action' }, { title: '建议负责人', key: 'owner', width: 180 }, { title: '验证指标', key: 'metric', width: 200 }]
function formatMonth(value: number) { const date = new Date(value); return date.getFullYear() + '年' + (date.getMonth() + 1) + '月' }
function selectHistoryReport(month: string) { const match = month.match(/(\d{4})年(\d+)月/); if (match) selectedMonth.value = new Date(Number(match[1]), Number(match[2]) - 1, 1).getTime() }
function healthInfo(score: number) { return score >= 80 ? { label: '健康增长', className: 'health-good', tagType: 'success' as const } : score >= 70 ? { label: '稳中待升', className: 'health-watch', tagType: 'warning' as const } : { label: '重点优化', className: 'health-risk', tagType: 'error' as const } }
function openReport(month: string) { const report = reports.value.find((item) => item.storeId === selectedStoreId.value && item.month === month); if (report) report.isNew = false; selectHistoryReport(month); viewMode.value = 'detail' }
function openGenerator(month?: string) {
  if (month) selectHistoryReport(month)
  generationMonth.value = month ? selectedMonth.value : Date.now()
  questions.value.forEach((item) => item.answer = '')
  showGenerator.value = true
}
function saveContext() {
  const missing = questions.value.find((item) => item.required && !item.answer.trim())
  if (missing) { message.warning('请回答必填问题：' + missing.title); return }
  showGenerator.value = false; message.success('经营背景已保存，将在系统生成 ' + generationMonthLabel.value + ' 报告时作为分析依据')
}
watch(selectedStoreId, () => { if (!activeReport.value) selectedMonth.value = defaultReportMonth })
</script>

<style scoped>
/* ============ Design tokens (Data-Dense Dashboard) ============ */
.diagnostic-page{
  --ds-primary:#1E40AF; --ds-primary-soft:#3B82F6; --ds-accent:#F59E0B;
  --ds-bg:#F8FAFC; --ds-card:#FFFFFF; --ds-border:#E2E8F0;
  --ds-text:#0F172A; --ds-text-mid:#475569; --ds-text-soft:#64748B;
  --ds-green:#16A34A; --ds-red:#DC2626;
  --ds-radius:14px; --ds-shadow:0 1px 3px rgba(15,23,42,.06);
  --ds-shadow-hover:0 10px 28px -8px rgba(30,64,175,.18), 0 2px 6px rgba(15,23,42,.05);
  display:flex;flex-direction:column;gap:16px;
}
.diagnostic-page :deep(.n-button){transition:all .2s ease}
.diagnostic-page :deep(.n-button:focus-visible){outline:2px solid var(--ds-primary-soft);outline-offset:2px}

/* ============ 页面头部 ============ */
.page-head{
  position:relative;overflow:hidden;display:flex;justify-content:space-between;gap:16px;align-items:flex-start;
  background:linear-gradient(120deg,#F8FAFC 0%,#EFF4FF 60%,#E4EDFF 100%);
  border:1px solid #DBEAFE;border-radius:var(--ds-radius);padding:24px 28px;
}
.page-head::before{content:'';position:absolute;right:-70px;top:-90px;width:260px;height:260px;border-radius:50%;
  background:radial-gradient(circle,rgba(59,130,246,.16),transparent 65%);pointer-events:none}
.page-head h1{margin:8px 0 4px;font-size:23px;font-weight:700;letter-spacing:-.02em;color:var(--ds-text)}
.page-head p,.section-title span,.report-cover p,.context-card p{margin:0;color:var(--ds-text-mid)}

/* ============ 报告中心 ============ */
.report-library{background:var(--ds-card);border:1px solid var(--ds-border);border-radius:var(--ds-radius);padding:24px;box-shadow:var(--ds-shadow)}
.library-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:18px;padding-bottom:14px;border-bottom:1px dashed var(--ds-border)}
.library-head h2{margin:0 0 6px;font-size:18px;color:var(--ds-text)}
.library-head p,.library-head>span{margin:0;color:var(--ds-text-soft);font-size:13px}
.library-head>span{white-space:nowrap;padding:2px 10px;border-radius:999px;background:#F1F5F9;font-variant-numeric:tabular-nums}
.report-year-group+.report-year-group{margin-top:26px}
.report-year-group>h3{margin:0 0 10px;font-size:13px;font-weight:600;color:var(--ds-text-soft);display:flex;align-items:center;gap:8px}
.report-year-group>h3::before{content:'';width:8px;height:8px;border-radius:2px;background:var(--ds-primary-soft)}
.report-cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
.report-card{
  position:relative;padding:18px;border:1px solid var(--ds-border);border-radius:12px;background:var(--ds-bg);
  border-top:3px solid #CBD5E1;cursor:pointer;
  transition:transform .2s ease,box-shadow .2s ease,background .2s ease,border-color .2s ease;
}
.report-card:hover{transform:translateY(-3px);background:#fff;box-shadow:var(--ds-shadow-hover);border-color:#C7D7F8}
.report-card.health-good{border-top-color:#22C55E}
.report-card.health-watch{border-top-color:#F59E0B}
.report-card.health-risk{border-top-color:#EF4444}
.report-card>div>span,.report-card p{color:var(--ds-text-soft);font-size:13px}
.report-card p{margin:8px 0 0}
.report-card-main{display:flex;justify-content:space-between;gap:12px;margin-bottom:14px}
.report-copy{display:flex;flex-direction:column;align-items:flex-start;gap:8px;min-width:0}
.report-card-top{display:flex;align-items:center;justify-content:space-between;width:100%;gap:8px}
.report-card-top>span:first-child{font-size:15px;font-weight:700;color:var(--ds-text)}
.new-badge{display:inline-flex;align-items:center;padding:1px 8px;border-radius:999px;background:#FEF2F2;color:#DC2626;font-size:11px;font-weight:600;border:1px solid #FECACA}
.score-orb{
  flex-shrink:0;display:flex;flex-direction:column;align-items:center;justify-content:center;
  width:64px;height:64px;border-radius:50%;background:#fff;border:3px solid #E2E8F0;
  box-shadow:0 2px 8px rgba(15,23,42,.08);transition:border-color .2s ease;
}
.report-card.health-good:hover .score-orb{border-color:#22C55E}
.report-card.health-watch:hover .score-orb{border-color:#F59E0B}
.report-card.health-risk:hover .score-orb{border-color:#EF4444}
.score-orb strong{font-size:22px;line-height:1;color:var(--ds-text);font-variant-numeric:tabular-nums}
.score-orb span{font-size:10px;color:var(--ds-text-soft);margin-top:3px}
.report-card-actions{display:flex;align-items:center;gap:10px;min-height:28px}

/* ============ 空状态 ============ */
.empty-card{
  background:var(--ds-card);border:1px dashed #CBD5E1;border-radius:var(--ds-radius);
  min-height:280px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;
  text-align:center;padding:72px 32px;
}
.empty-card h2{margin:0;font-size:19px;color:var(--ds-text)}
.empty-card p{max-width:420px;margin:0;color:var(--ds-text-soft);line-height:1.8}

/* ============ 报告详情 ============ */
.shop-workspace{max-width:1160px;width:100%;margin:0 auto}
.back-button{align-self:flex-start;color:var(--ds-text-mid)}
.report-content{min-width:0;display:flex;flex-direction:column;gap:16px}
.report-cover{
  position:relative;overflow:hidden;display:flex;justify-content:space-between;gap:16px;
  padding:30px 32px;border-radius:var(--ds-radius);
  background:linear-gradient(120deg,#0B1220 0%,#1E3A8A 55%,#1E40AF 100%);color:#fff;
}
.report-cover::after{content:'';position:absolute;right:-60px;bottom:-90px;width:280px;height:280px;border-radius:50%;
  background:radial-gradient(circle,rgba(245,158,11,.28),transparent 62%);pointer-events:none}
.report-cover>div:first-child{position:relative;z-index:1}
.report-cover span{font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#93C5FD}
.report-cover h2{margin:10px 0 6px;font-size:28px;font-weight:700;letter-spacing:-.01em}
.report-cover p{color:#BFDBFE}
.cover-actions{position:relative;z-index:1;display:flex;gap:8px;align-items:flex-start}
.cover-actions .n-button{--n-color:rgba(255,255,255,.12)!important;--n-text-color:#fff!important;--n-border:1px solid rgba(255,255,255,.35)!important}
.cover-actions .n-button:hover{--n-color:rgba(255,255,255,.22)!important}

.score-grid{display:grid;grid-template-columns:230px 1fr;gap:16px}
.health-card,.dimension-card{background:var(--ds-card);border:1px solid var(--ds-border);border-radius:var(--ds-radius);padding:22px;box-shadow:var(--ds-shadow)}
.health-card{text-align:center}
.health-card span{display:block;font-size:13px;color:var(--ds-text-soft)}
.health-card strong{display:block;font-size:62px;line-height:1;margin:14px 0 8px;font-variant-numeric:tabular-nums;letter-spacing:-.03em}
.health-card small{font-size:13px;font-weight:600}
.health-card.health-good{background:linear-gradient(160deg,#ECFDF5,#F0FDF4);color:#15803D;border-color:#BBF7D0}
.health-card.health-watch{background:linear-gradient(160deg,#FFFBEB,#FEFCE8);color:#B45309;border-color:#FDE68A}
.health-card.health-risk{background:linear-gradient(160deg,#FEF2F2,#FFF1F2);color:#B91C1C;border-color:#FECACA}
.dimension-card{display:grid;gap:14px;align-content:start}
.dimension{display:grid;grid-template-columns:110px 1fr 34px;gap:12px;align-items:center;font-size:13px;color:var(--ds-text-mid)}
.dim-label{display:inline-flex;align-items:center;gap:4px;cursor:help}
.dim-info{display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;border-radius:50%;background:#E2E8F0;color:#64748B;font-size:10px;font-style:normal;font-weight:600;transition:background .2s ease,color .2s ease}
.dim-label:hover .dim-info{background:#3B82F6;color:#fff}
.dimension strong{color:var(--ds-text);font-variant-numeric:tabular-nums;text-align:right}

/* ============ 内容卡片 ============ */
.content-card{background:var(--ds-card);border:1px solid var(--ds-border);border-radius:var(--ds-radius);padding:24px;box-shadow:var(--ds-shadow)}
.section-title{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #F1F5F9}
.section-title h2{font-size:17px;margin:0;color:var(--ds-text)}
.section-title span{font-size:13px}

.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.metrics>div{padding:16px 18px;background:var(--ds-bg);border:1px solid var(--ds-border);border-radius:10px;transition:border-color .2s ease,box-shadow .2s ease}
.metrics>div:hover{border-color:#C7D7F8;box-shadow:0 4px 12px rgba(30,64,175,.08)}
.metrics span{display:block;color:var(--ds-text-soft);font-size:13px}
.metrics strong{display:block;font-size:24px;margin:8px 0 10px;color:var(--ds-text);font-variant-numeric:tabular-nums;letter-spacing:-.01em}
.metrics small{display:inline-flex;align-items:center;padding:2px 10px;border-radius:999px;font-weight:600;font-size:12px;font-variant-numeric:tabular-nums}
.metrics small.up{color:#15803D;background:#F0FDF4;border:1px solid #BBF7D0}
.metrics small.down{color:#B91C1C;background:#FEF2F2;border:1px solid #FECACA}

.conclusion{padding:18px 20px;background:#F0F5FF;border:1px solid #DBEAFE;border-radius:10px;color:#1E3A8A;line-height:1.9;font-size:14.5px}

.context-card{border-left:3px solid #60A5FA}
.context-card p{line-height:1.8}

.insight-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;background:transparent;border:none;box-shadow:none;padding:0}
.insight-grid article{padding:20px 22px;border-radius:var(--ds-radius);border:1px solid var(--ds-border)}
.insight-grid h2{margin:0 0 14px;font-size:16px;display:flex;align-items:center;gap:8px}
.insight-grid h2::before{content:'';width:8px;height:8px;border-radius:50%}
.insight-grid p{line-height:1.8;margin:0 0 8px;padding-left:14px;position:relative;color:var(--ds-text-mid)}
.insight-grid p::before{content:'';position:absolute;left:0;top:11px;width:5px;height:5px;border-radius:50%;background:currentColor;opacity:.45}
.insight-grid p:last-child{margin-bottom:0}
.problem{background:#FFF9F3;border-color:#FED7AA}
.problem h2{color:#9A3412}.problem h2::before{background:#F97316}
.chance{background:#F4FBF6;border-color:#BBF7D0}
.chance h2{color:#166534}.chance h2::before{background:#22C55E}

/* ============ 补充背景抽屉 ============ */
.generator{display:flex;flex-direction:column;gap:20px}
.generator-summary{background:var(--ds-bg);border:1px solid var(--ds-border);border-radius:12px;padding:18px 20px}
.generator-summary h2{font-size:17px;margin:10px 0 6px;color:var(--ds-text)}
.generator-summary p{color:var(--ds-text-soft);line-height:1.7;margin:0;font-size:13px}
.question{display:flex;flex-direction:column;gap:8px}
.question strong{font-size:14px;color:var(--ds-text)}
.required-mark{color:#DC2626;margin-left:2px;font-style:normal}

/* ============ 响应式 ============ */
@media(max-width:900px){
  .page-head,.report-cover{flex-direction:column}
  .report-cards,.score-grid,.metrics,.insight-grid{grid-template-columns:1fr}
  .cover-actions{width:100%}
  .health-card{padding:18px}
}
@media(prefers-reduced-motion:reduce){
  .report-card,.metrics>div,.diagnostic-page :deep(.n-button){transition:none}
  .report-card:hover{transform:none}
}
</style>
