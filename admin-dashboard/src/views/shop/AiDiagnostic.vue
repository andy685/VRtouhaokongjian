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
                  <div class="report-card-top"><span>{{ report.month }}</span><span v-if="reportUpdateStates[report.id]" class="updating-badge">报告更新中</span><span v-else-if="report.isNew" class="new-badge">新报告</span></div>
                  <p>生成于 {{ report.generatedAt }}</p>
                </div>
                <div class="status-orb" :class="healthInfo(report.score).className"><span>经营状态</span><strong>{{ healthInfo(report.score).label }}</strong></div>
              </div>
              <div class="report-card-actions"><n-button size="small" secondary @click="openReport(report.month)">查看报告</n-button><n-button size="small" secondary type="primary" @click="openGenerator(report.month)">补充经营背景</n-button></div>
            </article>
          </div>
        </section>
      </div>
      <div v-else class="empty-card"><h2>暂未生成诊断报告</h2><p>报告将由系统按月自动生成。你可以通过页面顶部入口提前补充本月经营背景。</p></div>
    </section>

    <section v-else class="shop-workspace report-shell">
      <div class="report-content">
    <div class="report-topbar"><n-button text class="back-button" @click="viewMode = 'list'">← 返回报告中心</n-button><n-space><n-button @click="openGenerator(activeReport?.month)">补充经营背景</n-button><n-button @click="message.success('已开始导出 PDF')">下载 PDF</n-button><n-button type="primary" @click="message.success('已开始导出 ZIP')">下载 ZIP</n-button></n-space></div>
    <template v-if="activeReport">
      <div v-if="reportUpdateStates[activeReport.id]" class="report-update-notice">报告更新中，当前展示的是上一版报告；更新完成后将自动替换为最新内容。</div>
      <section class="report-hero">
        <span class="hero-tag">AI 店铺经营诊断报告</span>
        <h1>{{ activeReport.store }} · {{ activeReport.month }}</h1>
        <p>基于已固化的经营数据快照、诊断资料与报告模板自动生成。</p>
        <div class="hero-meta"><div><span>所属商家</span><strong>{{ currentStore.merchant }}</strong></div><div><span>数据范围</span><strong>{{ activeReport.month }}</strong></div><div><span>生成时间</span><strong>{{ activeReport.generatedAt }}</strong></div></div>
      </section>
      <section class="report-section ai-summary-section"><div class="section-title"><div><h2>AI 总结</h2><p>先看本期结论与优先方向</p></div></div><div class="conclusion">{{ activeReport.conclusion }}</div></section>
      <section class="report-section score-section"><div class="section-title"><div><h2>经营健康度</h2><p>五维经营指标综合评估结果</p></div><span class="data-note">数据截止 {{ activeReport.snapshotAt }}</span></div><div class="score-layout">
        <div class="score-card shop-status-card" :class="healthInfo(activeReport.score).className"><span>经营健康度</span><strong>{{ healthInfo(activeReport.score).label }}</strong><small>{{ healthDescription(activeReport.score) }}</small></div>
        <div class="dimension-list"><div v-for="item in displayDimensions" :key="item.label" class="dimension"><n-tooltip v-if="item.desc" trigger="hover" placement="top"><template #trigger><span class="dim-label">{{ item.label }}<i class="dim-info">?</i></span></template>{{ item.desc }}</n-tooltip><span v-else>{{ item.label }}</span><div class="track"><i :style="{ width: item.score + '%' }"></i></div><strong>{{ item.score }}</strong></div></div>
      </div></section>
      <section class="report-section"><div class="section-title"><div><h2>核心经营指标</h2><p>与上一个完整周期对比</p></div></div><div class="metrics-grid"><div v-for="item in displayMetrics" :key="item.label" class="metric-card"><span>{{ item.label }}</span><strong>{{ item.value }}</strong><small :class="{ down: item.down }">{{ item.trend }}</small></div></div></section>
      <section class="report-section game-diagnosis"><div class="section-title"><div><h2>内容与游戏诊断</h2><p>以点播、完成和收入贡献识别内容机会与风险</p></div></div><div class="game-grid"><article><span>核心贡献</span><h3>《星际营救》《奇幻赛车》</h3><p>合计贡献 46% 点播收入，完成率稳定在 84% 以上，适合纳入亲子套餐与导购推荐。</p></article><article><span>重点关注</span><h3>《深海探险》</h3><p>启动率较高但完成率仅 58%，建议优先检查设备适配和新手引导。</p></article><article><span>内容结构</span><h3>热门内容集中度偏高</h3><p>TOP 3 游戏收入占比 61%，尾部游戏占比 18%，建议调整推荐位并降低低效内容资源投入。</p></article></div></section>
      <section class="report-section"><div class="section-title"><div><h2>游戏点播数据</h2><p>热门游戏表现与内容结构</p></div></div><div class="metrics-grid"><div v-for="item in gameSummary" :key="item.label" class="metric-card"><span>{{ item.label }}</span><strong>{{ item.value }}</strong><small :class="{ down: item.down }">{{ item.trend }}</small></div></div><n-data-table class="game-table" :columns="gameColumns" :data="activeGames" :pagination="false" :bordered="false" /></section>
      <section class="report-section insight-grid"><article class="insight problem"><span>01</span><h3>主要问题</h3><p v-for="item in activeReport.problems" :key="item">{{ item }}</p></article><article class="insight chance"><span>02</span><h3>增长机会</h3><p v-for="item in activeReport.opportunities" :key="item">{{ item }}</p></article></section>
      <section class="report-section"><div class="section-title"><div><h2>下月行动计划</h2><p>可用于门店执行与下期复盘</p></div></div><n-data-table :columns="actionColumns" :data="activeReport.actions" :pagination="false" :bordered="false" /></section>
      <section class="report-section manager-context"><div class="section-title"><div><h2>店长补充</h2><p>本期诊断依据，不修改原始经营数据</p></div></div><p>{{ activeReport.context || '本期店长未提交额外经营背景，AI 仅依据系统数据快照、规则和诊断资料生成报告。' }}</p></section>
    </template>
    <section v-else class="empty-card"><h2>该月份暂无报告</h2><p>报告将由系统按月自动生成。你可以在生成前补充本月经营背景，供 AI 作为分析依据。</p><n-button type="primary" @click="openGenerator">补充本月经营背景</n-button></section>
      </div>
    </section>

    <n-drawer v-model:show="showGenerator" placement="right" :width="620"><n-drawer-content :title="'补充' + generationMonthLabel + '经营背景'" closable>
      <div class="generator">
        <div class="generator-summary"><n-tag type="info">{{ contextTargetReport ? '将异步更新报告' : '下次自动生成时引用' }}</n-tag><h2>{{ currentStore.name }} · {{ generationMonthLabel }}</h2><p>{{ contextTargetReport ? '保存后将创建报告更新任务。现有报告继续保留，任务完成后才展示更新后的报告。' : '报告由系统按月自动生成。此处补充会作为该月份下一次生成报告的 AI 分析依据。' }}</p></div>
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
const stores = [{ id: 'futian', name: '深圳福田旗舰店', merchant: '卓远娱乐' }, { id: 'nanshan', name: '深圳南山科技园店', merchant: '卓远娱乐' }]
const selectedStoreId = ref('futian')
const defaultReportMonth = new Date(2026, 7, 1).getTime()
const selectedMonth = ref(defaultReportMonth)
const generationMonth = ref(defaultReportMonth)
const showGenerator = ref(false)
const reportUpdateStates = ref<Record<string, boolean>>({})
const viewMode = ref<'list' | 'detail'>('list')
const questions = ref(loadSupplementQuestions().map((item) => ({ ...item, answer: '' })))
const currentStore = computed(() => stores.find((item) => item.id === selectedStoreId.value) || stores[0])
const storeOptions = stores.map((item) => ({ label: item.name, value: item.id }))
const selectedMonthLabel = computed(() => formatMonth(selectedMonth.value || Date.now()))
const generationMonthLabel = computed(() => formatMonth(generationMonth.value || Date.now()))
const reports = ref([
  { id: 'futian-202608', storeId: 'futian', month: formatMonth(defaultReportMonth), store: '深圳福田旗舰店', generatedAt: '2026-09-01 03:12', snapshotAt: '2026-09-01 03:10', score: 82, level: '健康增长', isNew: true, context: '', conclusion: '本月营收与订单均高于上月，周末亲子客群和会员储值复购是主要增长来源。《星际营救》《奇幻赛车》贡献了主要内容收入，但《深海探险》完成率偏低，建议优先改善内容引导、设备保障和工作日晚间转化。', dimensions: [{ label: '营收增长力', score: 86 }, { label: '客流活跃度', score: 82 }, { label: '会员质量', score: 79 }, { label: '内容吸引力', score: 76 }, { label: '运营执行力', score: 81 }], metrics: [{ label: '营收', value: '¥826,500', trend: '+12.6%' }, { label: '订单数', value: '3,182', trend: '+8.4%' }, { label: '客单价', value: '¥259.7', trend: '+3.9%' }, { label: '设备可用率', value: '96.2%', trend: '-0.8%', down: true }], problems: ['工作日 18:00 后订单转化低于周末 31%', '两款尾部游戏点播占比不足 4%', '头显异常集中在高峰时段前后'], opportunities: ['将热门项目组合成亲子双人套餐', '用满减券或折扣券召回 30 天未消费会员', '将设备巡检前置到周五闭店前'], actions: [{ priority: 'P0', action: '周五闭店前完成头显巡检并登记异常', owner: '店长 / 设备负责人', metric: '高峰可用设备率 ≥ 96%' }, { priority: 'P1', action: '上线亲子双人套餐，主推 TOP3 游戏', owner: '店长', metric: '周末客单价提升 8%' }] },
  { id: 'futian-202607', storeId: 'futian', month: '2026年7月', store: '深圳福田旗舰店', generatedAt: '2026-08-01 03:06', snapshotAt: '2026-08-01 03:04', score: 74, level: '稳中待升', isNew: false, context: '暑期活动首周客流增加，但员工培训安排影响了高峰服务能力。', conclusion: '本月经营整体稳定，活动带来客流增长，但会员储值承接和高峰服务效率仍有改善空间。', dimensions: [{ label: '营收增长力', score: 75 }, { label: '客流活跃度', score: 78 }, { label: '会员质量', score: 70 }, { label: '内容吸引力', score: 69 }, { label: '运营执行力', score: 72 }], metrics: [{ label: '营收', value: '¥733,800', trend: '+4.2%' }, { label: '订单数', value: '2,840', trend: '+3.1%' }, { label: '客单价', value: '¥258.4', trend: '+1.0%' }, { label: '设备可用率', value: '97.0%', trend: '+0.4%' }], problems: ['新增会员转化低于暑期客流预期', '活动券核销集中在低客单项目'], opportunities: ['优化首充套餐露出', '复盘高绩效员工推荐话术'], actions: [{ priority: 'P0', action: '统一首充套餐推荐话术', owner: '店长', metric: '首充转化率提升 5%' }] },
  { id: 'futian-202606', storeId: 'futian', month: '2026年6月', store: '深圳福田旗舰店', generatedAt: '2026-07-01 03:08', snapshotAt: '2026-07-01 03:05', score: 63, level: '重点优化', isNew: false, context: '六一活动客流大增，但两台头显连续故障三天，新员工未完成上岗培训即顶班。', conclusion: '本月营收环比下滑，设备故障直接造成高峰时段订单流失，客诉率明显上升。建议优先恢复设备可用率，并补齐新人服务流程培训。', dimensions: [{ label: '营收增长力', score: 58 }, { label: '客流活跃度', score: 66 }, { label: '会员质量', score: 62 }, { label: '内容吸引力', score: 68 }, { label: '运营执行力', score: 60 }], metrics: [{ label: '营收', value: '¥618,200', trend: '-9.8%', down: true }, { label: '订单数', value: '2,405', trend: '-6.2%', down: true }, { label: '客单价', value: '¥257.1', trend: '-0.5%', down: true }, { label: '设备可用率', value: '88.4%', trend: '-8.6%', down: true }], problems: ['设备可用率跌至 88.4%，高峰时段排队流失明显', '六一活动期间客诉 12 起，集中在等待时长', '新员工独立上岗后服务评分下降'], opportunities: ['建立设备故障应急备机机制', '将高峰时段接待流程标准化并复训', '对六一流失客户发放回归补偿券'], actions: [{ priority: 'P0', action: '一周内完成全部头显检修并采购 2 台备机', owner: '设备负责人', metric: '设备可用率恢复至 95% 以上' }, { priority: 'P0', action: '完成 3 名新员工服务流程复训', owner: '店长', metric: '服务评分回升至 4.6 分' }, { priority: 'P1', action: '向活动期流失客户推送 20 元回归券', owner: '运营', metric: '回归券核销率 ≥ 15%' }] },
])
const activeReport = computed(() => reports.value.find((item) => item.storeId === selectedStoreId.value && item.month === selectedMonthLabel.value))
/* 维度标签以平台端配置为准；分数取报告生成时的快照 */
const displayDimensions = computed(() => {
  if (!activeReport.value) return []
  const configDims = loadDiagnosticDimensions()
  return activeReport.value.dimensions.map((item, index) => ({ label: configDims[index]?.label || item.label, score: item.score, desc: configDims[index]?.desc || '' }))
})
const displayMetrics = computed(() => [
  ...(activeReport.value?.metrics || []).filter((item) => item.label !== '设备可用率'),
  { label: '会员消费贡献率', value: '68.4%', trend: '+4.1%' },
])
/* 游戏点播数据：按报告快照给出演示数据 */
type GameRow = { name: string; plays: string; duration: string; revenueShare: string; trend: string; down?: boolean; tag: string; tagType: 'success' | 'warning' | 'error' }
const gameDataByReport: Record<string, GameRow[]> = {
  'futian-202608': [
    { name: '极速过山车 VR', plays: '1,120', duration: '560 小时', revenueShare: '24.5%', trend: '+18.2%', tag: '明星', tagType: 'success' },
    { name: '星际探险', plays: '860', duration: '420 小时', revenueShare: '18.9%', trend: '+9.6%', tag: '明星', tagType: 'success' },
    { name: '亲子动物园', plays: '640', duration: '380 小时', revenueShare: '15.2%', trend: '+6.8%', tag: '稳定', tagType: 'warning' },
    { name: '恐龙岛求生', plays: '285', duration: '160 小时', revenueShare: '6.1%', trend: '-12.4%', down: true, tag: '待优化', tagType: 'error' },
    { name: '极限运动', plays: '210', duration: '118 小时', revenueShare: '3.8%', trend: '-8.5%', down: true, tag: '待优化', tagType: 'error' },
  ],
  'futian-202607': [
    { name: '极速过山车 VR', plays: '948', duration: '474 小时', revenueShare: '22.8%', trend: '+7.2%', tag: '明星', tagType: 'success' },
    { name: '星际探险', plays: '705', duration: '352 小时', revenueShare: '17.1%', trend: '+4.8%', tag: '明星', tagType: 'success' },
    { name: '亲子动物园', plays: '598', duration: '356 小时', revenueShare: '14.6%', trend: '+3.2%', tag: '稳定', tagType: 'warning' },
    { name: '恐龙岛求生', plays: '324', duration: '182 小时', revenueShare: '7.0%', trend: '-6.5%', down: true, tag: '待优化', tagType: 'error' },
    { name: '极限运动', plays: '230', duration: '128 小时', revenueShare: '4.6%', trend: '-4.9%', down: true, tag: '待优化', tagType: 'error' },
  ],
  'futian-202606': [
    { name: '极速过山车 VR', plays: '884', duration: '442 小时', revenueShare: '21.2%', trend: '-5.8%', down: true, tag: '稳定', tagType: 'warning' },
    { name: '星际探险', plays: '655', duration: '326 小时', revenueShare: '15.4%', trend: '-7.2%', down: true, tag: '稳定', tagType: 'warning' },
    { name: '亲子动物园', plays: '552', duration: '328 小时', revenueShare: '13.5%', trend: '+1.8%', tag: '稳定', tagType: 'warning' },
    { name: '恐龙岛求生', plays: '296', duration: '166 小时', revenueShare: '6.8%', trend: '-15.4%', down: true, tag: '待优化', tagType: 'error' },
    { name: '极限运动', plays: '205', duration: '114 小时', revenueShare: '4.2%', trend: '-11.6%', down: true, tag: '待优化', tagType: 'error' },
  ],
}
const activeGames = computed(() => gameDataByReport[activeReport.value?.id || ''] || [])
const gameSummary = [
  { label: '点播总次数', value: '3,118', trend: '+8.4%' },
  { label: '点播总时长', value: '1,638 小时', trend: '+6.2%' },
  { label: '游戏营收占比', value: '68.5%', trend: '+2.1%' },
  { label: '人均游玩时长', value: '8.6 分钟', trend: '+3.5%' },
]
const gameColumns = [
  { title: '游戏名称', key: 'name', width: 180, align: 'left' as const },
  { title: '点播次数', key: 'plays', width: 110, align: 'left' as const },
  { title: '点播时长', key: 'duration', width: 110, align: 'left' as const },
  { title: '营收占比', key: 'revenueShare', width: 100, align: 'left' as const },
  { title: '环比', key: 'trend', width: 100, render: (row: GameRow) => h(NTag, { type: row.down ? 'error' : 'success', size: 'small', round: true }, { default: () => row.trend }) },
  { title: '表现', key: 'tag', width: 90, render: (row: GameRow) => h(NTag, { type: row.tagType, size: 'small' }, { default: () => row.tag }) },
]
const storeReports = computed(() => reports.value.filter((item) => item.storeId === selectedStoreId.value).sort((a, b) => b.month.localeCompare(a.month)))
const contextTargetReport = computed(() => reports.value.find((item) => item.storeId === currentStore.value.id && item.month === generationMonthLabel.value))
const reportsByYear = computed(() => {
  const groups = new Map<string, typeof storeReports.value>()
  storeReports.value.forEach((item) => { const year = item.month.slice(0, 4); groups.set(year, [...(groups.get(year) || []), item]) })
  return Array.from(groups, ([year, items]) => ({ year, items }))
})
const actionColumns = [{ title: '优先级', key: 'priority', width: 90, render: (row: any) => h(NTag, { type: row.priority === 'P0' ? 'error' : 'warning', size: 'small' }, { default: () => row.priority }) }, { title: '行动建议', key: 'action' }, { title: '建议负责人', key: 'owner', width: 180 }, { title: '验证指标', key: 'metric', width: 200 }]
function formatMonth(value: number) { const date = new Date(value); return date.getFullYear() + '年' + (date.getMonth() + 1) + '月' }
function selectHistoryReport(month: string) { const match = month.match(/(\d{4})年(\d+)月/); if (match) selectedMonth.value = new Date(Number(match[1]), Number(match[2]) - 1, 1).getTime() }
function healthInfo(score: number) { return score >= 80 ? { label: '健康增长', className: 'health-good', tagType: 'success' as const } : score >= 70 ? { label: '稳中待升', className: 'health-watch', tagType: 'warning' as const } : { label: '重点优化', className: 'health-risk', tagType: 'error' as const } }
function healthDescription(score: number) { return score >= 80 ? '本期经营表现良好' : score >= 70 ? '本期经营仍有提升空间' : '建议优先处理重点问题' }
function dimensionStatus(score: number) { return score >= 80 ? '良好' : score >= 70 ? '可提升' : '需关注' }
function dimensionClass(score: number) { return score >= 80 ? 'is-good' : score >= 70 ? 'is-watch' : 'is-risk' }
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
  const context = questions.value.filter((item) => item.answer.trim()).map((item) => item.title + '：' + item.answer.trim()).join('；')
  const report = contextTargetReport.value
  showGenerator.value = false
  if (!report) { message.success('经营背景已保存，将在系统生成 ' + generationMonthLabel.value + ' 报告时作为分析依据'); return }
  reportUpdateStates.value[report.id] = true
  message.info('经营背景已保存，报告正在更新中；当前报告内容暂不变更')
  window.setTimeout(() => {
    report.context = context
    reportUpdateStates.value[report.id] = false
    report.isNew = true
    report.generatedAt = '刚刚更新'
    message.success('报告更新完成，已展示最新内容')
  }, 1800)
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
.status-orb{display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:92px;height:64px;padding:0 10px;border-radius:12px;background:#F8FAFC;border:1px solid var(--ds-border);text-align:center}.status-orb span{font-size:10px;color:var(--ds-text-soft);margin-bottom:5px}.status-orb strong{font-size:14px;white-space:nowrap}.status-orb.health-good{background:#ECFDF5;color:#15803D;border-color:#BBF7D0}.status-orb.health-watch{background:#FFFBEB;color:#B45309;border-color:#FDE68A}.status-orb.health-risk{background:#FEF2F2;color:#B91C1C;border-color:#FECACA}
.report-card-actions{display:flex;align-items:center;gap:10px;min-height:28px}
.updating-badge{display:inline-flex;align-items:center;padding:2px 7px;border-radius:999px;background:#eff6ff;color:#2563eb;font-size:11px;font-weight:700}
.report-update-notice{padding:10px 14px;border:1px solid #bfdbfe;border-radius:8px;background:#eff6ff;color:#1d4ed8;font-size:13px;line-height:1.6}
.score-grid{grid-template-columns:1fr;gap:12px}.health-card{display:grid;grid-template-columns:220px minmax(0,1fr);align-items:center;min-height:112px;padding:20px 24px;gap:24px}.health-card .health-main{padding-right:24px;border-right:1px solid rgba(15,23,42,.10)}.health-card .health-main span{margin-bottom:8px}.health-card .health-main strong{font-size:30px;line-height:1.2}.health-card>small{max-width:560px;font-size:14px;line-height:1.75;color:inherit;opacity:.82}.dimension-card{padding:12px 24px;gap:0}.dimension{grid-template-columns:150px minmax(180px,1fr) 48px 68px;min-height:64px;padding:14px 0;gap:16px}.dimension-score{font-size:13px}.dimension-state{min-width:64px}.report-cover{min-height:156px;padding:30px}.report-cover h2{font-size:30px}.content-card{padding:24px}.metrics>div{min-height:122px;padding:18px}.conclusion{padding:22px 24px;font-size:15px}.context-card{padding:22px 24px}@media(max-width:760px){.health-card{grid-template-columns:1fr;gap:14px}.health-card .health-main{padding:0;border:0}.dimension{grid-template-columns:minmax(100px,1fr) 42px 60px;gap:10px}.dimension .n-progress{grid-column:1/-1;grid-row:2}.content-card{padding:18px}.report-cover h2{font-size:24px}}

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
.health-card strong{font-size:28px;line-height:1.25;letter-spacing:0;white-space:nowrap}
.health-card{display:flex;flex-direction:column;align-items:flex-start;justify-content:center;text-align:left;gap:6px}.health-card strong{font-size:26px}.health-card small{font-weight:400;line-height:1.6}.dimension{grid-template-columns:minmax(0,1fr) auto;min-height:44px;padding:10px 0;border-bottom:1px solid #eef2f7}.dimension:last-child{border-bottom:0}.dimension-state{display:inline-flex;align-items:center;justify-content:center;min-width:58px;padding:4px 8px;border-radius:999px;font-size:12px;font-weight:600}.dimension-state.is-good{background:#ecfdf5;color:#15803d}.dimension-state.is-watch{background:#fffbeb;color:#b45309}.dimension-state.is-risk{background:#fef2f2;color:#b91c1c}
.dimension{grid-template-columns:minmax(120px,1fr) minmax(140px,1fr) 46px 60px;gap:12px}.dimension-score{font-size:12px;font-weight:600;color:var(--ds-text-mid);white-space:nowrap}
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
.score-grid{grid-template-columns:1fr;gap:12px}
.health-card{display:grid;grid-template-columns:220px minmax(0,1fr);align-items:center;min-height:112px;padding:20px 24px;gap:24px}
.health-card .health-main{padding-right:24px;border-right:1px solid rgba(15,23,42,.10)}
.health-card .health-main span{margin-bottom:8px}
.health-card .health-main strong{font-size:30px;line-height:1.2;white-space:nowrap}
.health-card>small{max-width:560px;font-size:14px;line-height:1.75;color:inherit;opacity:.82}
.dimension-card{padding:12px 24px;gap:0}
.dimension{grid-template-columns:150px minmax(180px,1fr) 48px 68px;min-height:64px;padding:14px 0;gap:16px}
.dimension-score{font-size:13px}
.dimension-state{min-width:64px}
@media(max-width:760px){
  .health-card{grid-template-columns:1fr;gap:14px}
  .health-card .health-main{padding:0;border:0}
  .dimension{grid-template-columns:minmax(100px,1fr) 42px 60px;gap:10px}
  .dimension .n-progress{grid-column:1/-1;grid-row:2}
}
.ai-summary-card{border-color:#C7D7F8;background:linear-gradient(135deg,#F6F9FF,#EEF4FF)}
.ai-summary-card .section-title{margin-bottom:12px;padding-bottom:0;border-bottom:0}
.ai-summary-card .section-title h2{color:#1E40AF}
.ai-summary-card .conclusion{padding:0;background:transparent;border:0;color:#1E3A8A;font-size:16px;line-height:1.9}
.report-topbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}
.report-cover{min-height:0;padding:36px 38px;background:linear-gradient(135deg,#0F1D37 0%,#1D4ED8 100%)}
.report-cover::after{right:-70px;top:-70px;bottom:auto;width:330px;height:330px;background:radial-gradient(circle,rgba(96,165,250,.34),transparent 64%)}
.report-cover .hero-tag{display:inline-flex;padding:7px 13px;border:1px solid rgba(255,255,255,.25);border-radius:999px;font-size:13px;letter-spacing:0;color:#fff;background:rgba(255,255,255,.08)}
.report-cover h2{font-size:34px;margin:28px 0 12px;color:#fff}
.report-cover>p{max-width:640px;font-size:15px;color:rgba(255,255,255,.78)}
.hero-meta{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:28px;position:relative;z-index:1}
.hero-meta>div{padding:14px 16px;border-radius:10px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.12)}
.hero-meta span{display:block;margin-bottom:6px;font-size:12px;letter-spacing:0;color:rgba(255,255,255,.66)}
.hero-meta strong{font-size:15px;color:#fff}
@media(max-width:760px){.report-topbar{align-items:flex-start;gap:10px;flex-direction:column}.report-cover{padding:26px 22px}.report-cover h2{font-size:26px;margin:20px 0 10px}.hero-meta{grid-template-columns:1fr;gap:8px}}
.report-hero{padding:38px;border-radius:16px;color:#fff;background:linear-gradient(135deg,#0f172a,#1d4ed8);overflow:hidden;position:relative}
.report-hero::after{content:'';position:absolute;right:-70px;top:-70px;width:330px;height:330px;border:1px solid rgba(255,255,255,.12);border-radius:50%}
.report-hero .hero-tag{display:inline-block;padding:6px 12px;border:1px solid rgba(255,255,255,.25);border-radius:20px;font-size:13px;letter-spacing:0;background:transparent;color:#fff;position:relative;z-index:1}
.report-hero h1{font-size:36px;line-height:1.12;margin:20px 0 10px;color:#fff;position:relative;z-index:1}
.report-hero>p{margin:0;color:#dbeafe;position:relative;z-index:1}
.report-hero .hero-meta{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:28px;position:relative;z-index:1}
.report-content .content-card{border-radius:14px;padding:26px;background:#fff;border:1px solid #dbe4f0;box-shadow:none}
@media(max-width:760px){.report-hero{padding:24px}.report-hero h1{font-size:27px}.report-hero .hero-meta{grid-template-columns:1fr;gap:8px}}
.report-shell{max-width:1120px;background:#f8fafc;padding:28px;border-radius:16px}
.report-content{gap:18px}
.report-content .report-section{margin-top:0;padding:26px;background:#fff;border:1px solid #dbe4f0;border-radius:14px;box-shadow:none}
.report-content .section-title{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;padding:0;border:0}
.report-content .section-title h2{margin:0 0 5px;font-size:22px;color:#0f172a}
.report-content .section-title p,.report-content .data-note{margin:0;color:#64748b;font-size:13px}
.report-content .score-layout{display:grid;grid-template-columns:240px 1fr;gap:28px}
.report-content .score-card{padding:26px;border:1px solid #bbf7d0;border-radius:14px;background:#ecfdf5;text-align:center;color:#15803d}
.report-content .score-card span{display:block;font-size:14px}
.report-content .score-card strong{display:block;margin:12px 0;font-size:28px;line-height:1.2;white-space:nowrap}
.report-content .score-card small{font-size:13px}
.report-content .dimension-list{display:grid;gap:14px}
.report-content .dimension{display:grid;grid-template-columns:110px 1fr 36px;align-items:center;gap:12px;min-height:0;padding:0;border:0;font-size:13px;color:#0f172a}
.report-content .track{height:10px;background:#e5e7eb;border-radius:999px;overflow:hidden}
.report-content .track i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#2563eb,#22c55e)}
.report-content .dimension strong{color:#0f172a;text-align:right}
.report-content .metrics-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.report-content .game-table{margin-top:14px}
.report-content .metric-card{min-height:0;padding:18px;border:1px solid #dbe4f0;border-radius:12px;background:#f8fafc}
.report-content .metric-card span{display:block;color:#64748b;font-size:13px}
.report-content .metric-card strong{display:block;margin:8px 0;font-size:25px;color:#0f172a}
.report-content .metric-card small{color:#16a34a}.report-content .metric-card small.down{color:#dc2626}
.report-content .conclusion{padding:22px;border-radius:12px;background:#eff6ff;border:0;color:#1e3a8a;font-size:17px;line-height:1.8}
.report-content .insight-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;padding:0;border:0;background:transparent}
.report-content .insight{padding:20px;border-radius:12px;border:1px solid #dbe4f0}.report-content .insight span{font-weight:700;color:#2563eb}.report-content .insight h3{margin:12px 0 8px}.report-content .insight p{margin:0 0 8px;padding:0;color:#475569;line-height:1.7;font-size:14px}.report-content .insight p::before{display:none}
.report-content .manager-context{border-left:3px solid #60a5fa}.report-content .manager-context>p{margin:0;color:#334155;line-height:1.8}
@media(max-width:760px){.report-shell{padding:12px}.report-content .score-layout,.report-content .metrics-grid,.report-content .insight-grid{grid-template-columns:1fr}.report-content .dimension{grid-template-columns:100px 1fr 36px}}
.game-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.game-grid article{padding:18px;border:1px solid #dbe4f0;border-radius:12px;background:#f8fafc}.game-grid span{font-size:12px;color:#2563eb;font-weight:700}.game-grid h3{margin:10px 0 8px;font-size:16px}.game-grid p{margin:0;color:#475569;line-height:1.7;font-size:14px}@media(max-width:760px){.game-grid{grid-template-columns:1fr}}
</style>
