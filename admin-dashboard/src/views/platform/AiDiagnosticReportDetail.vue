<template>
  <div class="report-page">
    <header class="report-topbar">
      <n-button text @click="router.push('/platform/ai-diagnostic')">← 返回报告记录</n-button>
      <n-space>
        <n-button @click="showRegenerate = true">生成新版本</n-button>
        <n-button v-if="!report.merchantVisible" @click="syncToMerchant">同步至商户</n-button>
        <n-dropdown :options="downloadOptions" @select="exportReport"><n-button type="primary">下载</n-button></n-dropdown>
      </n-space>
    </header>
    <main class="report-shell">
      <section class="report-hero" :style="heroStyle">
        <span class="hero-tag">AI 店铺经营诊断报告</span>
        <h1>{{ report.store }} · {{ report.period }}</h1>
        <p>基于已固化的经营数据快照、诊断资料与报告模板自动生成。</p>
        <div class="hero-meta">
          <div><span>所属商家</span><strong>{{ report.merchant }}</strong></div>
          <div><span>数据范围</span><strong>{{ report.period }}</strong></div>
          <div><span>生成时间</span><strong>{{ report.generatedAt }}</strong></div>
        </div>
      </section>
      <n-alert v-if="selectedVersion !== baseReport.version" type="warning" :show-icon="false" class="version-banner">当前正在查看历史版本 {{ selectedVersion }}。该版本只读，不会被后续数据或新版本覆盖。</n-alert>

      <section class="report-section ai-summary-section">
        <div class="section-title"><div><h2><n-icon class="section-icon" :component="SparklesOutline" />AI 总结</h2><p>先看本期结论与优先方向</p></div></div>
        <div class="conclusion">{{ report.conclusion }}</div>
      </section>

      <section class="report-section score-section">
        <div class="section-title"><div><h2><n-icon class="section-icon" :component="PulseOutline" />经营健康度</h2><p>五维经营指标综合评估结果</p></div><span class="data-note">数据截止 {{ report.dataCutoff }}</span></div>
        <div class="score-layout">
          <div class="score-card" :class="healthClass(report.score)"><span>经营状态</span><strong>{{ report.level }}</strong><small>{{ healthDescription(report.score) }}</small></div>
          <div class="dimension-list">
            <div v-for="item in dimensions" :key="item.name" class="dimension"><span>{{ item.name }}</span><div class="track"><i :style="{ width: item.score + '%', background: barColor(item.score) }"></i></div><strong>{{ item.score }}</strong></div>
          </div>
        </div>
      </section>

      <section class="report-section">
        <div class="section-title"><div><h2><n-icon class="section-icon" :component="BarChartOutline" />核心经营指标</h2><p>与上一个完整周期对比</p></div></div>
        <div class="metrics-grid">
          <div v-for="item in metrics" :key="item.label" class="metric-card"><span>{{ item.label }}</span><strong>{{ item.value }}</strong><small :class="{ down: item.down }">{{ item.trend }}</small></div>
        </div>
      </section>

      <section class="report-section game-diagnosis">
        <div class="section-title"><div><h2><n-icon class="section-icon" :component="GameControllerOutline" />内容与游戏诊断</h2><p>以点播、完成和收入贡献识别内容机会与风险</p></div></div>
        <div class="game-grid"><article><span>核心贡献</span><h3>《星际营救》《奇幻赛车》</h3><p>合计贡献 46% 点播收入，完成率稳定在 84% 以上，适合纳入亲子套餐与导购推荐。</p></article><article><span>重点关注</span><h3>《深海探险》</h3><p>启动率较高但完成率仅 58%，建议优先检查设备适配和新手引导。</p></article><article><span>内容结构</span><h3>热门内容集中度偏高</h3><p>TOP 3 游戏收入占比 61%，尾部游戏占比 18%，建议调整推荐位并降低低效内容资源投入。</p></article></div>
      </section>

      <section class="report-section">
        <div class="section-title"><div><h2>游戏点播数据</h2><p>热门游戏表现与内容结构，支撑内容运营与采购建议</p></div></div>
        <div class="metrics-grid">
          <div v-for="item in gameMetrics" :key="item.label" class="metric-card"><span>{{ item.label }}</span><strong>{{ item.value }}</strong><small :class="{ down: item.down }">{{ item.trend }}</small></div>
        </div>
        <n-data-table class="game-table" :columns="gameColumns" :data="games" :pagination="false" :bordered="false" />
      </section>

      <section class="report-section">
        <div class="section-title"><div><h2>问题、机会与建议</h2><p>以下结论均基于本期数据快照</p></div></div>
        <div class="insight-grid">
          <article class="insight problem"><span>01</span><h3>主要问题</h3><p>工作日 18:00 后订单转化低于周末 31%，设备异常集中在高峰时段前后，影响客流承接。</p></article>
          <article class="insight chance"><span>02</span><h3>增长机会</h3><p>亲子客群的客单价和复购表现突出，可将 TOP3 游戏组合为双人套餐，并用会员券提升转化。</p></article>
          <article class="insight action"><span>03</span><h3>优先动作</h3><p>将设备巡检前置至周五闭店前，并针对 30 天未消费会员投放定向满减券。</p></article>
        </div>
      </section>

      <section class="report-section">
        <div class="section-title"><div><h2>下期行动计划</h2><p>可用于门店执行与下期复盘</p></div></div>
        <n-data-table :columns="actionColumns" :data="actions" :pagination="false" :bordered="false" />
      </section>

      <section class="report-section manager-context">
        <div class="section-title"><div><h2>店长补充</h2><p>本期报告 {{ report.version }} 的诊断依据，不修改原始经营数据。</p></div></div>
        <p>{{ report.managerContext || '本期店长未提交额外经营背景，AI 仅依据系统数据快照、规则和诊断资料生成报告。' }}</p>
      </section>

      <section class="report-section">
        <div class="section-title"><div><h2>报告版本历史</h2><p>重新生成会新增版本，历史版本保持可追溯。</p></div></div>
        <n-data-table :columns="versionColumns" :data="versionHistory" :pagination="false" :bordered="false" />
      </section>

      <footer class="report-footer">报告版本 {{ report.version }} · 模板 {{ report.template }} · 数据快照 {{ report.snapshot }} · 由 AI 自动生成</footer>
    </main>
    <n-modal v-model:show="showRegenerate" preset="card" title="生成报告新版本" style="width: min(560px, calc(100vw - 32px))" :bordered="false">
      <p class="regenerate-hint">将保留历史版本，生成完成后最新版本默认展示。</p>
      <n-form-item label="生成原因"><n-select v-model:value="regenerateReason" :options="regenerateReasonOptions" /></n-form-item>
      <n-form-item label="更新说明" :required="requiresReasonNote"><n-input v-model:value="regenerateNote" type="textarea" :rows="3" placeholder="可选；选择“其他”时需填写说明" /></n-form-item>
      <template #footer><n-space justify="end"><n-button @click="showRegenerate = false">取消</n-button><n-button type="primary" @click="submitRegenerate">确认生成新版本</n-button></n-space></template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, h, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NDataTable, NDropdown, NFormItem, NIcon, NInput, NModal, NSelect, NSpace, NTag, useMessage } from 'naive-ui'
import { BarChartOutline, GameControllerOutline, PulseOutline, SparklesOutline } from '@vicons/ionicons5'
import reportHeroBackground from '../../assets/ai-report/vr-space-report-hero.png'
const route = useRoute()
const router = useRouter()
const message = useMessage()
const heroStyle = {
  backgroundImage: 'linear-gradient(90deg, rgba(7,21,45,.98) 0%, rgba(10,31,72,.90) 42%, rgba(15,48,119,.28) 100%), url(' + reportHeroBackground + ')',
  backgroundPosition: 'center',
  backgroundSize: 'cover',
}
const showRegenerate = ref(false)
const regenerateReason = ref('data_update')
const regenerateNote = ref('')
const regenerateReasonOptions = [
  { label: '数据更新', value: 'data_update' },
  { label: '报告内容优化', value: 'content_optimization' },
  { label: '运营调整', value: 'operation_adjustment' },
  { label: '其他', value: 'other' },
]
const requiresReasonNote = computed(() => regenerateReason.value === 'other')
const baseReport = Number(route.params.id) === 3
  ? { store: '杭州滨江店', merchant: '幻境空间', period: '2026年8月', generatedAt: '2026-09-01 03:20', dataCutoff: '2026-09-01 03:18', score: 58, level: '重点优化', merchantVisible: false, managerContext: '', conclusion: '本期设备异常与退款指标同时升高，建议先检查高峰前设备可用性和退款原因，再评估内容及套餐策略。', version: 'v1.0', template: '月度 AI 经营诊断报告', snapshot: '2026-09-01 03:18' }
  : { store: '深圳福田旗舰店', merchant: '卓远娱乐', period: '2026年8月', generatedAt: '2026-09-05 10:24', dataCutoff: '2026-09-01 03:10', score: 82, level: '健康增长', merchantVisible: true, managerContext: '暑期亲子活动延长至 22:00；本月有两台头显维修三天，高峰期曾出现短时设备不足。店长希望优先改善工作日晚间转化。', conclusion: '本月营收与订单均高于上月，周末亲子客群及会员储值复购是主要增长来源。《星际营救》《奇幻赛车》贡献了主要内容收入，但《深海探险》完成率偏低，应优先改善工作日晚间转化、设备保障和内容引导。', version: 'v2.0', template: '月度 AI 经营诊断报告', snapshot: '2026-09-01 03:10' }
const selectedVersion = ref(baseReport.version)
const report = computed(() => selectedVersion.value === 'v1.0' && baseReport.version === 'v2.0'
  ? { ...baseReport, generatedAt: '2026-09-01 03:12', score: 78, level: '稳中待升', version: 'v1.0', managerContext: '', conclusion: '本月营收与订单稳步增长，亲子客群和会员复购带来主要增量。建议继续观察晚间转化与设备高峰承接情况。' }
  : baseReport)
const dimensions = [{ name: '营收增长力', score: 86 }, { name: '客流活跃度', score: 82 }, { name: '会员质量', score: 79 }, { name: '内容吸引力', score: 76 }, { name: '运营执行力', score: 81 }]
/* 与商户端一致的段位视觉：≥80 绿 / 70~79 琥珀 / <70 红 */
function healthClass(score: number) { return score >= 80 ? 'health-good' : score >= 70 ? 'health-watch' : 'health-risk' }
function healthDescription(score: number) { return score >= 80 ? '本期经营表现良好' : score >= 70 ? '本期经营仍有提升空间' : '建议优先处理重点问题' }
/* 游戏点播数据：按报告健康度给出两套演示数据 */
const gameMetricsGood = [
  { label: '点播总次数', value: '3,118', trend: '+8.4%' },
  { label: '点播总时长', value: '1,638 小时', trend: '+6.2%' },
  { label: '游戏营收占比', value: '68.5%', trend: '+2.1%' },
  { label: '人均游玩时长', value: '8.6 分钟', trend: '+3.5%' },
]
const gameMetricsRisk = [
  { label: '点播总次数', value: '2,304', trend: '-9.2%', down: true },
  { label: '点播总时长', value: '1,214 小时', trend: '-7.8%', down: true },
  { label: '游戏营收占比', value: '59.6%', trend: '-3.4%', down: true },
  { label: '人均游玩时长', value: '7.1 分钟', trend: '-2.6%', down: true },
]
const gameMetrics = computed(() => (report.value.score < 70 ? gameMetricsRisk : gameMetricsGood))
const gamesGood = [
  { name: '极速过山车 VR', plays: '1,120', duration: '560 小时', revenueShare: '24.5%', trend: '+18.2%', tag: '明星', tagType: 'success' },
  { name: '星际探险', plays: '860', duration: '420 小时', revenueShare: '18.9%', trend: '+9.6%', tag: '明星', tagType: 'success' },
  { name: '亲子动物园', plays: '640', duration: '380 小时', revenueShare: '15.2%', trend: '+6.8%', tag: '稳定', tagType: 'warning' },
  { name: '恐龙岛求生', plays: '285', duration: '160 小时', revenueShare: '6.1%', trend: '-12.4%', down: true, tag: '待优化', tagType: 'error' },
  { name: '极限运动', plays: '210', duration: '118 小时', revenueShare: '3.8%', trend: '-8.5%', down: true, tag: '待优化', tagType: 'error' },
]
const gamesRisk = [
  { name: '极速过山车 VR', plays: '620', duration: '310 小时', revenueShare: '19.8%', trend: '-6.4%', down: true, tag: '稳定', tagType: 'warning' },
  { name: '星际探险', plays: '480', duration: '236 小时', revenueShare: '14.2%', trend: '-4.1%', down: true, tag: '稳定', tagType: 'warning' },
  { name: '亲子动物园', plays: '395', duration: '228 小时', revenueShare: '11.6%', trend: '+2.4%', tag: '稳定', tagType: 'warning' },
  { name: '恐龙岛求生', plays: '186', duration: '104 小时', revenueShare: '5.4%', trend: '-18.6%', down: true, tag: '待优化', tagType: 'error' },
  { name: '极限运动', plays: '132', duration: '72 小时', revenueShare: '3.1%', trend: '-14.2%', down: true, tag: '待优化', tagType: 'error' },
]
const games = computed(() => (report.value.score < 70 ? gamesRisk : gamesGood))
const gameColumns = [
  { title: '游戏名称', key: 'name', width: 180, align: 'left' as const },
  { title: '点播次数', key: 'plays', width: 110, align: 'left' as const },
  { title: '点播时长', key: 'duration', width: 110, align: 'left' as const },
  { title: '营收占比', key: 'revenueShare', width: 100, align: 'left' as const },
  { title: '环比', key: 'trend', width: 100, render: (row: any) => h(NTag, { type: row.down ? 'error' : 'success', size: 'small', round: true }, { default: () => row.trend }) },
  { title: '表现', key: 'tag', width: 90, render: (row: any) => h(NTag, { type: row.tagType, size: 'small' }, { default: () => row.tag }) },
]
function barColor(score: number) { return score >= 80 ? '#3B82F6' : score >= 70 ? '#F59E0B' : '#EF4444' }
const metrics = [{ label: '营收', value: '¥826,500', trend: '+12.6%' }, { label: '支付订单', value: '3,182', trend: '+8.4%' }, { label: '客单价', value: '¥259.7', trend: '+3.9%' }, { label: '会员消费贡献率', value: '68.4%', trend: '+4.1%' }]
const actions = [{ priority: 'P0', action: '周五闭店前完成头显巡检并登记异常', owner: '店长 / 设备负责人', metric: '高峰可用设备率 ≥ 96%' }, { priority: 'P1', action: '上线亲子双人套餐，主推 TOP3 游戏', owner: '店长', metric: '周末客单价提升 8%' }, { priority: 'P1', action: '对 30 天未消费会员定向发放满减券', owner: '店长 / 导购', metric: '沉睡会员回流 60 人' }]
const versionHistory = ref(baseReport.version === 'v2.0'
  ? [{ version: 'v2.0', generatedAt: '2026-09-05 10:24', reason: '数据更新', note: '已补充本期会员复购数据后更新报告。', status: '当前版本' }, { version: 'v1.0', generatedAt: '2026-09-01 03:12', reason: '首次生成', note: '', status: '历史版本' }]
  : [{ version: 'v1.0', generatedAt: baseReport.generatedAt, reason: '首次生成', note: '', status: '当前版本' }])
const downloadOptions = [{ label: '下载 PDF', key: 'PDF' }, { label: '下载 ZIP', key: 'ZIP' }]
const actionColumns = [{ title: '优先级', key: 'priority', width: 90, render: (row: any) => h(NTag, { type: row.priority === 'P0' ? 'error' : 'warning', size: 'small' }, { default: () => row.priority }) }, { title: '行动建议', key: 'action' }, { title: '建议负责人', key: 'owner', width: 180 }, { title: '验证指标', key: 'metric', width: 210 }]
const versionColumns = [{ title: '版本', key: 'version', width: 90 }, { title: '生成时间', key: 'generatedAt', width: 170 }, { title: '更新类型', key: 'reason', width: 110 }, { title: '更新说明', key: 'note', ellipsis: { tooltip: true }, render: (row: any) => row.note || '—' }, { title: '状态', key: 'status', width: 100, render: (row: any) => h(NTag, { type: row.status === '当前版本' ? 'success' : row.status === '生成中' ? 'info' : 'default', size: 'small' }, { default: () => row.status }) }, { title: '操作', key: 'actions', width: 90, render: (row: any) => h(NButton, { text: true, type: 'primary', size: 'small', disabled: selectedVersion.value === row.version || row.status === '生成中', onClick: () => viewVersion(row.version) }, { default: () => selectedVersion.value === row.version ? '正在查看' : row.status === '生成中' ? '生成中' : '查看' }) }]
function viewVersion(version: string) { selectedVersion.value = version }
function submitRegenerate() {
  if (requiresReasonNote.value && !regenerateNote.value.trim()) { message.warning('选择“其他”时请填写更新说明'); return }
  const reason = regenerateReasonOptions.find((item) => item.value === regenerateReason.value)
  const nextVersion = 'v' + (versionHistory.value.length + 1) + '.0'
  versionHistory.value.unshift({ version: nextVersion, generatedAt: '刚刚', reason: reason?.label || '报告更新', note: regenerateNote.value.trim(), status: '生成中' })
  showRegenerate.value = false
  message.success('已记录生成原因并发起新版本任务，生成完成后将显示为最新版本')
}
function syncToMerchant() { baseReport.merchantVisible = true; message.success('报告已同步至商户后台') }
function exportReport(type: string) { message.success('已开始导出 ' + type + ' 文件') }
</script>

<style scoped>
.report-page{min-height:100%;background:#edf2f7;padding:20px}.report-topbar,.report-shell{max-width:1120px;margin:0 auto}.report-topbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.report-shell{background:#f8fafc;padding:28px;border-radius:16px}.report-hero{padding:38px;border-radius:16px;color:#fff;background:linear-gradient(135deg,#0f172a,#1d4ed8);overflow:hidden}.version-banner{margin-top:16px}.regenerate-hint{margin:0 0 14px;color:#64748b;font-size:13px}.hero-tag{display:inline-block;padding:6px 12px;border:1px solid rgba(255,255,255,.25);border-radius:20px;font-size:13px}.report-hero h1{font-size:36px;margin:20px 0 10px}.report-hero>p{color:#dbeafe;margin:0}.hero-meta{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:28px}.hero-meta div{padding:14px;background:rgba(255,255,255,.1);border-radius:10px}.hero-meta span{display:block;font-size:12px;color:#bfdbfe;margin-bottom:6px}.report-section{margin-top:18px;padding:26px;background:#fff;border:1px solid #dbe4f0;border-radius:14px}.section-title{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px}.section-title h2{margin:0 0 5px;font-size:22px}.section-title p,.data-note{margin:0;color:#64748b;font-size:13px}.manager-context{border-left:3px solid #60a5fa}.manager-context>p{margin:0;color:#334155;line-height:1.8}.score-layout{display:grid;grid-template-columns:240px 1fr;gap:28px}.score-card{padding:26px;border:1px solid #bbf7d0;border-radius:14px;background:#ecfdf5;text-align:center;color:#15803d}.score-card.health-watch{border-color:#fde68a;background:linear-gradient(160deg,#FFFBEB,#FEFCE8);color:#b45309}.score-card.health-risk{border-color:#fecaca;background:linear-gradient(160deg,#FEF2F2,#FFF1F2);color:#b91c1c}.score-card span{display:block;font-size:14px}.score-card strong{display:block;margin:12px 0;font-size:28px;line-height:1.2;white-space:nowrap}.score-card small{font-size:13px}.dimension-list{display:grid;gap:14px}.dimension{display:grid;grid-template-columns:100px 1fr 36px;align-items:center;gap:12px;font-size:13px}.track{height:10px;background:#e5e7eb;border-radius:99px;overflow:hidden}.track i{display:block;height:100%;border-radius:99px;background:#3B82F6}.metrics-grid,.insight-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.metric-card{padding:18px;border:1px solid #dbe4f0;border-radius:12px;background:#f8fafc}.metric-card span{display:block;color:#64748b;font-size:13px}.metric-card strong{display:block;font-size:25px;margin:8px 0 10px}.metric-card small{display:inline-flex;padding:2px 10px;border-radius:999px;font-weight:600;font-size:12px;color:#15803d;background:#f0fdf4;border:1px solid #bbf7d0}.metric-card small.down{color:#b91c1c;background:#fef2f2;border-color:#fecaca}.conclusion{padding:22px;border-radius:12px;background:#eff6ff;color:#1e3a8a;font-size:17px;line-height:1.8}.insight-grid{grid-template-columns:repeat(3,1fr)}.insight{padding:20px;border-radius:12px;border:1px solid #dbe4f0}.insight span{font-weight:700;color:#2563eb}.insight h3{margin:12px 0 8px}.insight p{margin:0;color:#475569;line-height:1.7;font-size:14px}.insight.problem{background:#fff7ed;border-color:#fed7aa}.game-table{margin-top:14px}.insight.chance{background:#f0fdf4;border-color:#bbf7d0}.report-footer{padding:24px 0 4px;text-align:center;color:#94a3b8;font-size:12px}@media(max-width:760px){.report-page{padding:12px}.report-topbar{align-items:flex-start;gap:12px;flex-direction:column}.report-shell{padding:12px}.hero-meta,.score-layout,.metrics-grid,.insight-grid{grid-template-columns:1fr}.report-hero{padding:24px}.report-hero h1{font-size:27px}}
.game-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.game-grid article{padding:18px;border:1px solid #dbe4f0;border-radius:12px;background:#f8fafc}.game-grid span{font-size:12px;color:#2563eb;font-weight:700}.game-grid h3{margin:10px 0 8px;font-size:16px}.game-grid p{margin:0;color:#475569;line-height:1.7;font-size:14px}@media(max-width:760px){.game-grid{grid-template-columns:1fr}}
.section-icon{margin-right:8px;color:#2563eb;vertical-align:-3px}
</style>
