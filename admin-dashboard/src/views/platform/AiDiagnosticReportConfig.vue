<template>
  <div class="page-container config-page">
    <div class="page-header">
      <div><h1>AI 诊断报告配置</h1><p class="header-desc">统一管理报告模板、生成任务、内容规则与诊断资料；配置保存后在下一个生成周期生效。</p><p class="save-status">最后保存：{{ lastSavedAt }}</p></div>
      <n-button type="primary" @click="saveAll">保存配置</n-button>
    </div>
    <n-tabs type="line" class="config-tabs" default-value="task" animated>
      <n-tab-pane name="task" tab="生成任务">
    <section class="content-card">
      <div class="section-head"><div><h2>报告模板</h2><p>当前模板将用于后续所有 AI 诊断报告的生成。</p></div><n-button secondary @click="showTemplateSelector = true">选择模板</n-button></div>
      <div class="current-template"><span>当前模板</span><strong>{{ activeTemplate.name }}</strong><n-tag type="success" size="small">已启用</n-tag></div>
    </section>
    <section class="content-card">
      <div class="section-head"><div><h2>生成规则</h2><p>只配置生成任务需要的时间和数据边界，复杂的模型逻辑由后端统一处理。</p></div></div>
      <div class="rule-form">
        <n-form-item label="数据范围"><n-select :value="generationConfig.dataRange" :options="dataRangeOptions" @update:value="handleDataRangeChange" /></n-form-item>
        <n-form-item label="生成日期"><n-select :key="generationConfig.dataRange" v-model:value="generationConfig.generateDay" :options="generateDayOptions" /></n-form-item>
        <n-form-item label="生成时间"><n-time-picker v-model:value="generationConfig.generateTime" format="HH:mm" /></n-form-item>
        <n-form-item label="同步方式"><div><n-radio-group v-model:value="generationConfig.deliveryMode"><n-space><n-radio value="auto">生成成功后自动同步商户后台</n-radio><n-radio value="manual">仅运营后台可见</n-radio></n-space></n-radio-group><p class="sync-note">{{ deliveryNote }}</p></div></n-form-item>
        <n-form-item label="失败重试次数"><n-select v-model:value="generationConfig.retryLimit" :options="retryOptions" /></n-form-item>
      </div>
    </section>
      </n-tab-pane>
      <n-tab-pane name="rules" tab="内容规则">
    <section class="content-card">
      <div class="section-head"><div><h2>健康分段位</h2><p>配置经营健康分的段位名称、门槛分数与标识色；保存后商户端报告卡、健康分卡与五维诊断按此分段着色。</p></div></div>
      <div class="tier-table">
        <div class="tier-row tier-head"><span>段位名称</span><span>分数下限（含）</span><span>标识色</span><span>分段预览</span><span></span></div>
        <div v-for="(tier, index) in healthTiers" :key="tier.key" class="tier-row">
          <n-input v-model:value="tier.label" placeholder="段位名称" />
          <n-input-number v-model:value="tier.min" :min="0" :max="100" :disabled="index === healthTiers.length - 1" style="width:100%" />
          <n-color-picker v-model:value="tier.color" :show-alpha="false" :modes="['hex']" size="small" />
          <div class="tier-preview" :style="{ background: tier.color + '1a', color: tier.color, borderColor: tier.color + '55' }">{{ tierPreview(index) }}</div>
          <n-button text type="error" :disabled="healthTiers.length <= 2" @click="removeTier(index)">删除</n-button>
        </div>
        <n-space justify="space-between" align="center">
          <n-button secondary size="small" :disabled="healthTiers.length >= 6" @click="addTier">新增段位</n-button>
          <span class="tier-count">{{ healthTiers.length }} / 6 段</span>
        </n-space>
        <p class="form-hint">分段规则：从上到下依次为「≥ 下限」的区间，低于次末段下限的分数归入末段；上一段的分数下限必须大于下一段，否则无法保存。末段下限固定为 0；支持 2~6 个段位。</p>
      </div>
    </section>
    <section class="content-card">
      <div class="section-head"><div><h2>诊断维度与权重</h2><p>调整各维度在健康分中的影响占比；简单平均时不使用权重，按权重加权时权重合计必须为 100%。</p></div><span class="dim-total" :class="{ invalid: scoreMode === 'weighted' && weightTotal !== 100, muted: scoreMode === 'average' }">{{ scoreMode === 'weighted' ? weightTotal + '%' : '不使用权重' }}</span></div>
      <div class="dim-table">
        <div class="score-mode-panel"><div><strong>健康分计算方式</strong><span>{{ scoreModeNote }}</span></div><n-radio-group v-model:value="scoreMode"><n-space><n-radio value="average">简单平均</n-radio><n-radio value="weighted">按权重加权</n-radio></n-space></n-radio-group></div>
        <div class="dim-row dim-head"><span>诊断维度</span><span>权重</span><span>占比预览</span><span></span></div>
        <div v-for="dim in diagnosticDimensions" :key="dim.key" class="dim-block">
          <div class="dim-row">
            <n-input v-model:value="dim.label" placeholder="维度名称" />
            <n-input-number v-model:value="dim.weight" :min="0" :max="100" :disabled="scoreMode === 'average'" style="width:100%" />
            <n-progress type="line" :percentage="scoreMode === 'weighted' ? dim.weight : 20" :height="8" :show-indicator="false" :color="scoreMode === 'weighted' ? '#3B82F6' : '#94A3B8'" rail-color="#E2E8F0" />
            <span class="dim-locked">结构锁定</span>
          </div>
          <div class="dim-desc-row"><span>说明</span><n-input v-model:value="dim.desc" type="textarea" :rows="1" placeholder="例如：引用本期营收、环比与客单价等指标" /></div>
        </div>
        <p class="form-hint dim-helper">维度结构和指标口径由产品/研发统一维护；运营侧仅调整名称、权重与商家侧说明。</p>
      </div>
    </section>
    <section class="content-card benchmark-card">
      <div class="section-head"><div><h2>评分基准策略</h2><p>按门店运营阶段计算评分基准，不引用商家自主设置的经营目标。</p></div></div>
      <div class="benchmark-grid">
        <div v-for="(stage, index) in benchmarkStages" :key="stage.key" class="benchmark-stage">
          <div class="benchmark-stage-head"><strong>{{ stage.label }}</strong><span>{{ stagePeriodLabel(stage, index) }}</span></div>
          <div class="benchmark-duration"><div class="benchmark-open-end"><span>开始运营月数</span><strong>{{ stageStartMonth(index) }} 月</strong></div><label v-if="stage.maxCycles !== null"><span>结束运营月数</span><n-input-number v-model:value="stage.maxCycles" :min="stageStartMonth(index)" :max="120" style="width:100%" /><em>月</em></label><div v-else class="benchmark-open-end"><span>结束运营月数</span><strong>无上限</strong></div></div>
          <div v-if="stage.key === 'observe'" class="benchmark-observe">
            <div class="observe-head"><strong>初始评分基准</strong><span>只配置会进入公式的基础基准值</span></div>
            <div class="observe-thresholds">
              <div v-for="item in initialBenchmarks" :key="item.key" class="observe-threshold-item">
                <label><span>{{ item.label }}</span><n-input-number v-model:value="item.value" :min="0" :max="999999" style="width:100%" /><em>{{ item.unit }}</em></label>
                <div class="threshold-usage"><strong>用于：{{ item.usage }}</strong><span>{{ item.formula }}</span></div>
              </div>
            </div>
            <div class="missing-policy"><strong>口径说明</strong><span>这里不是商家经营目标，而是规则引擎的评分基准。百分比类指标按固定区间评分；缺少子指标时重归一化，但五个维度仍保留。</span></div>
          </div>
          <div v-else class="benchmark-fields"><label><span>本店历史占比</span><n-input-number v-model:value="stage.storeWeight" :min="0" :max="100" style="width:100%" /><em>%</em></label><label><span>同类门店占比</span><n-input-number v-model:value="stage.peerWeight" :min="0" :max="100" style="width:100%" /><em>%</em></label><label><span>基准调整</span><n-input-number v-model:value="stage.adjustment" :min="-30" :max="30" style="width:100%" /><em>%</em></label></div>
          <div v-if="stage.key !== 'observe'" class="benchmark-scope"><label><span>中位数取值范围</span><n-select v-model:value="stage.scope" :options="benchmarkScopeOptions" /></label><label><span>样本不足时扩展至</span><n-select v-model:value="stage.fallbackScope" :options="fallbackScopeOptions(stage.scope)" /></label></div>
          <p>{{ stage.note }}</p>
          <div v-if="stage.key !== 'observe'" class="benchmark-formula">评分基准 =（本店历史中位数 × {{ stage.storeWeight }}% + 同类门店中位数 × {{ stage.peerWeight }}%）×（1 + {{ stage.adjustment }}%）</div>
        </div>
      </div>
      <div class="benchmark-note"><strong>评分说明</strong><span>本规则由平台统一维护，但会按每家店自身运营时长自动匹配观察期、成长期或稳定期，无需逐店手工设置。观察期使用上方初始评分基准输出完整健康分；成长期和稳定期使用本店历史与同类门店中位数。中位数范围可选同城、同省、全国或全部同店型门店；样本不足时按配置逐级扩展。每个范围均只纳入相近店型、相近营业时长门店；最低样本数为 5 家。</span></div>
    </section>
    <section class="content-card">
      <div class="section-head"><div><h2>店长补充问题</h2><p>配置商家端「补充经营背景」抽屉中的问题清单（2~6 个），店长回答将作为 AI 分析依据。</p></div></div>
      <div class="question-table">
        <div class="question-row question-head"><span>问题标题</span><span>输入提示</span><span>必填</span><span></span></div>
        <div v-for="(q, index) in supplementQuestions" :key="q.id" class="question-row">
          <n-input v-model:value="q.title" placeholder="问题标题" />
          <n-input v-model:value="q.placeholder" placeholder="例如：暑期亲子活动延长至 22:00" />
          <n-checkbox v-model:checked="q.required" />
          <n-button text type="error" :disabled="supplementQuestions.length <= 2" @click="removeQuestion(index)">删除</n-button>
        </div>
        <n-button secondary size="small" :disabled="supplementQuestions.length >= 6" @click="addQuestion">新增问题</n-button>
      </div>
    </section>
      </n-tab-pane>
      <n-tab-pane name="knowledge" tab="诊断资料">
    <section class="content-card">
      <div class="section-head"><div><h2>诊断资料</h2><p>AI 生成报告时引用的知识库：平台会结合这些资料，为店铺生成「用平台什么功能、做什么活动」的具体建议。建议围绕以下类别维护资料。</p></div><n-button secondary @click="openKnowledgeEditor()">新增资料</n-button></div>
      <div class="knowledge-guide">
        <div><strong>平台功能引导</strong><span>介绍平台线上功能的玩法与转化路径，引导店铺通过功能实现经营提升。例如：优惠券召回沉睡会员、会员储值锁定复购、套票提升客单价、活动赠送拉新、短信服务触达客户。</span></div>
        <div><strong>线下活动建议</strong><span>结合门店场景输出可落地的活动方案。例如：暑期亲子主题活动、企业团建包场、节日主题派对、周末竞技赛事、异业联动引流。</span></div>
        <div><strong>活动与玩法推荐</strong><span>推荐经过验证的营销玩法与组合策略。例如：满减券 + 储值赠额组合、次卡产品定价、高峰时段限时优惠、新游戏首发引流活动。</span></div>
        <div><strong>规范与约束</strong><span>运营 SOP、指标解释、设备维护规则、优秀门店案例、禁用话术等，用于约束 AI 的分析口径与表达。</span></div>
      </div>
      <n-data-table :columns="knowledgeColumns" :data="knowledgeRows" :pagination="{ pageSize: 10 }" :bordered="false" />
    </section>
      </n-tab-pane>
    </n-tabs>
    <n-modal v-model:show="showTemplateUpload" preset="card" title="上传报告模板" style="width: min(560px, calc(100vw - 32px))" :bordered="false">
      <n-form-item label="模板名称"><n-input v-model:value="newTemplate.name" placeholder="例如：月度 AI 经营诊断报告" /></n-form-item>
      <n-form-item label="模板包"><n-upload :default-upload="false" :max="1" accept=".zip" @change="handleTemplateFile"><n-button>选择 ZIP 模板包</n-button></n-upload></n-form-item>
      <div class="validation-box" :class="templateValidation.status">
        <strong>模板校验</strong>
        <span>{{ templateValidation.message }}</span>
      </div>
      <p class="form-hint">校验要求：ZIP 包内须包含 <code>index.html</code>、<code>manifest.json</code> 和资源文件目录；服务端会继续校验 JSON 结构及安全性。</p>
      <template #footer><n-space justify="end"><n-button @click="showTemplateUpload = false">取消</n-button><n-button :disabled="templateValidation.status !== 'passed'" type="primary" @click="uploadTemplate">上传并保存</n-button></n-space></template>
    </n-modal>
    <n-modal v-model:show="showTemplateSelector" preset="card" title="选择报告模板" style="width: min(560px, calc(100vw - 32px))" :bordered="false">
      <n-radio-group v-model:value="selectedTemplateId" class="template-options">
        <div v-for="template in templateRows" :key="template.id" class="template-option">
          <div class="template-option-main"><n-radio :value="template.id">{{ template.name }}</n-radio><n-button :disabled="template.id === activeTemplateId" text type="error" size="small" @click="deleteTemplate(template)">删除</n-button></div>
          <small>v{{ template.version }} · {{ template.packageName }}</small>
        </div>
      </n-radio-group>
      <template #footer><n-space justify="space-between"><n-button @click="showTemplateUpload = true; showTemplateSelector = false">上传新模板</n-button><n-space><n-button @click="showTemplateSelector = false">取消</n-button><n-button type="primary" @click="confirmTemplateSelection">确认选择</n-button></n-space></n-space></template>
    </n-modal>
    <n-modal v-model:show="showKnowledgeEditor" preset="card" :title="editingKnowledgeIndex === -1 ? '新增诊断资料' : '编辑诊断资料'" style="width: min(560px, calc(100vw - 32px))" :bordered="false">
      <n-form-item label="资料名称"><n-input v-model:value="editingKnowledge.name" /></n-form-item>
      <n-form-item label="资料类型"><div class="type-select-row"><n-select v-model:value="editingKnowledge.type" :options="knowledgeTypeOptions" /><n-button @click="showTypeEditor = true">编辑类型</n-button></div></n-form-item>
      <n-form-item label="资料内容"><n-input v-model:value="editingKnowledge.content" type="textarea" :rows="6" placeholder="可填写：平台功能引导（如优惠券召回沉睡会员、储值锁定复购）、线下活动建议（如亲子活动、团建包场）、活动玩法推荐（如满减+储值组合）、运营规范与约束等，AI 生成报告时会引用这些内容给出具体建议" /></n-form-item>
      <template #footer><n-space justify="end"><n-button @click="showKnowledgeEditor = false">取消</n-button><n-button type="primary" @click="saveKnowledge">保存资料</n-button></n-space></template>
    </n-modal>
    <n-modal v-model:show="showTypeEditor" preset="card" title="编辑资料类型" style="width: min(480px, calc(100vw - 32px))" :bordered="false">
      <n-space :wrap="false" style="width:100%;margin-bottom:16px"><n-input v-model:value="newTypeName" placeholder="输入新类型名称" /><n-button type="primary" @click="addKnowledgeType">新增</n-button></n-space>
      <div class="type-list"><div v-for="type in knowledgeTypes" :key="type"><n-space align="center"><span>{{ type }}</span><n-tag v-if="type === defaultKnowledgeType" size="small" type="info">默认</n-tag></n-space><n-button text type="error" :disabled="type === defaultKnowledgeType || isTypeInUse(type)" @click="deleteKnowledgeType(type)">删除</n-button></div></div>
      <p class="form-hint">默认类型及已有资料正在使用的类型不可删除。</p>
      <template #footer><n-space justify="end"><n-button type="primary" @click="showTypeEditor = false">完成</n-button></n-space></template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, h, reactive, ref } from 'vue'
import { NButton, NCheckbox, NColorPicker, NDataTable, NFormItem, NInput, NInputNumber, NModal, NProgress, NRadio, NRadioGroup, NSelect, NSpace, NTabPane, NTabs, NTag, NTimePicker, NUpload, useMessage } from 'naive-ui'
import {
  loadDiagnosticDimensions, saveDiagnosticDimensions,
  loadDiagnosticScoreMode, saveDiagnosticScoreMode,
  loadSupplementQuestions, saveSupplementQuestions,
  type DiagnosticDimension, type DiagnosticScoreMode, type SupplementQuestion,
} from '../../constants/aiDiagnosticConfig'
type TemplateRow = { id: number; name: string; packageName: string; version: string; updatedAt: string; status: '启用' | '停用' }
const message = useMessage()
const lastSavedAt = ref('未保存')
const showTemplateUpload = ref(false)
const showTemplateSelector = ref(false)
const showKnowledgeEditor = ref(false)
const showTypeEditor = ref(false)
const selectedPackageName = ref('')
const templateValidation = reactive({ status: 'idle' as 'idle' | 'checking' | 'passed' | 'failed', message: '选择模板包后将自动校验。' })
const editingKnowledgeIndex = ref(-1)
const generationConfig = reactive({
  dataRange: 'monthly',
  generateDay: 'month_1',
  generateTime: new Date(2000, 0, 1, 3, 0).getTime(),
  deliveryMode: 'auto',
  retryLimit: 3,
})
const dataRangeOptions = [
  { label: '按月（自动取上月完整数据）', value: 'monthly' },
  { label: '按周（自动取上周完整数据）', value: 'weekly' },
  { label: '按季度（自动取上季度完整数据）', value: 'quarterly' },
]
const deliveryNote = computed(() => generationConfig.deliveryMode === 'auto'
  ? '开启后，仅本次保存配置之后新生成成功的报告会自动同步到商户后台；历史报告不会自动同步。'
  : '关闭自动同步后，新生成报告仅运营后台可见；需要同步的历史报告可在“报告记录”中逐份处理。')
const generateDayOptions = computed(() => {
  if (generationConfig.dataRange === 'weekly') return [
    { label: '每周一', value: 'monday' }, { label: '每周二', value: 'tuesday' }, { label: '每周三', value: 'wednesday' },
  ]
  if (generationConfig.dataRange === 'quarterly') return [
    { label: '每季首月 1 日', value: 'quarter_1' }, { label: '每季首月 2 日', value: 'quarter_2' }, { label: '每季首月 3 日', value: 'quarter_3' },
  ]
  return [
    { label: '每月 1 日', value: 'month_1' }, { label: '每月 2 日', value: 'month_2' }, { label: '每月 3 日', value: 'month_3' },
  ]
})
function handleDataRangeChange(range: string) {
  generationConfig.dataRange = range
  generationConfig.generateDay = range === 'weekly' ? 'monday' : range === 'quarterly' ? 'quarter_1' : 'month_1'
}
const retryOptions = [{ label: '不重试', value: 0 }, { label: '重试 1 次', value: 1 }, { label: '重试 2 次', value: 2 }, { label: '重试 3 次', value: 3 }]
type HealthTier = { key: string; label: string; min: number; color: string }
const healthTiers = reactive<HealthTier[]>([
  { key: 'good', label: '健康增长', min: 80, color: '#22C55E' },
  { key: 'watch', label: '稳中待升', min: 70, color: '#F59E0B' },
  { key: 'risk', label: '重点优化', min: 0, color: '#EF4444' },
])
function tierPreview(index: number) {
  if (index === 0) return healthTiers[0].min + ' 分及以上'
  if (index === healthTiers.length - 1) return '低于 ' + healthTiers[healthTiers.length - 2].min + ' 分'
  return healthTiers[index].min + ' ~ ' + (healthTiers[index - 1].min - 1) + ' 分'
}
let tierSeq = 0
function addTier() {
  if (healthTiers.length >= 6) return
  const prev = healthTiers[healthTiers.length - 2]
  const min = Math.max(1, prev.min - 10)
  healthTiers.splice(healthTiers.length - 1, 0, { key: 'tier-' + Date.now() + '-' + (tierSeq++), label: '自定义段位', min, color: '#3B82F6' })
}
function removeTier(index: number) {
  if (healthTiers.length <= 2) return
  healthTiers.splice(index, 1)
}

/* ===== 诊断维度与权重 ===== */
const diagnosticDimensions = ref<DiagnosticDimension[]>(loadDiagnosticDimensions())
const scoreMode = ref<DiagnosticScoreMode>(loadDiagnosticScoreMode())
const weightTotal = computed(() => diagnosticDimensions.value.reduce((sum, item) => sum + (Number(item.weight) || 0), 0))
const scoreModeNote = computed(() => scoreMode.value === 'average'
  ? '简单平均时五个维度按相同占比合成健康分，上方权重不参与计算。'
  : '按权重加权时使用上方权重合成健康分，权重合计必须为 100%。')
const benchmarkStages = ref([
  { key: 'observe', label: '观察期', minCycles: 0, maxCycles: 2, storeWeight: 0, peerWeight: 0, adjustment: 0, scope: 'city', fallbackScope: 'province', note: '运营不足 3 个月，按初始评分基准输出健康分，同时建立本店基础数据。' },
  { key: 'growth', label: '成长期', minCycles: 3, maxCycles: 12, storeWeight: 40, peerWeight: 60, adjustment: 0, scope: 'city', fallbackScope: 'province', note: '运营 3–12 个月，结合本店历史与同城同店型中位数。' },
  { key: 'stable', label: '稳定期', minCycles: 13, maxCycles: null, storeWeight: 70, peerWeight: 30, adjustment: 0, scope: 'city', fallbackScope: 'province', note: '运营超过 12 个月，以本店长期表现为主。' },
])
const initialBenchmarks = ref([
  { key: 'revenue', label: '月实收营收基准', value: 200000, unit: '元', usage: '营收增长力 / 营收基准分', formula: '营收基准分 = C(100 × 本期实收营收 ÷ 月实收营收基准)' },
  { key: 'traffic', label: '月支付订单基准', value: 800, unit: '单', usage: '客流活跃度 / 日均订单分', formula: '基准日均订单 = 月支付订单基准 ÷ 当月天数，再参与日均订单分计算' },
])
function stageStartMonth(index: number) {
  if (index === 0) return 0
  return (benchmarkStages.value[index - 1].maxCycles ?? 0) + 1
}
function stagePeriodLabel(stage: { maxCycles: number | null }, index: number) {
  const start = stageStartMonth(index)
  return stage.maxCycles === null ? '运营 ' + start + ' 个月及以上' : '运营 ' + start + '–' + stage.maxCycles + ' 个月'
}
const benchmarkScopeOptions = [
  { label: '同城同店型', value: 'city' },
  { label: '同省同店型', value: 'province' },
  { label: '全国同店型', value: 'national' },
  { label: '全部同店型门店', value: 'all' },
]
function fallbackScopeOptions(scope: string) {
  const order = ['city', 'province', 'national', 'all']
  const index = order.indexOf(scope)
  return benchmarkScopeOptions.filter((option) => order.indexOf(option.value) > index)
}

/* ===== 店长补充问题 ===== */
const supplementQuestions = ref<SupplementQuestion[]>(loadSupplementQuestions())
function addQuestion() {
  if (supplementQuestions.value.length >= 6) return
  supplementQuestions.value.push({ id: Date.now(), title: '', placeholder: '', required: false })
}
function removeQuestion(index: number) {
  if (supplementQuestions.value.length <= 2) return
  supplementQuestions.value.splice(index, 1)
}
const newTemplate = reactive({ name: '' })
const templateRows = ref<TemplateRow[]>([{ id: 1, name: '月度 AI 经营诊断报告', packageName: 'monthly-diagnostic-v1.zip', version: 'v1.0', updatedAt: '2026-08-28 14:30', status: '启用' }])
const selectedTemplateId = ref(1)
const activeTemplateId = ref(1)
const activeTemplate = computed(() => templateRows.value.find((item) => item.id === activeTemplateId.value) || templateRows.value[0])
const knowledgeRows = ref([
  { name: '会员复购运营 SOP', type: '会员运营', content: '重点关注 30 天未消费会员，优先使用满减券或折扣券完成召回，并在活动后跟踪复购。', version: 'v1.2', status: '已生效' },
  { name: 'VR 设备周巡检规则', type: '设备维护', content: '每周五闭店前完成头显、手柄、定位器巡检；异常设备须登记并在高峰前完成处理。', version: 'v1.0', status: '已生效' },
  { name: '暑期亲子套餐优秀案例', type: '优秀案例', content: '将热门双人游戏组合为亲子套餐，配合会员储值权益，引导周末客单价提升。', version: 'v1.1', status: '已生效' },
])
const editingKnowledge = reactive({ name: '', type: '', content: '', version: 'v1.0', status: '已生效' })
const defaultKnowledgeType = '默认类型'
const knowledgeTypes = ref([defaultKnowledgeType, '会员运营', '设备维护', '优秀案例', '禁用话术'])
const newTypeName = ref('')
const knowledgeTypeOptions = computed(() => knowledgeTypes.value.map((item) => ({ label: item, value: item })))
const knowledgeColumns = [
  { title: '资料名称', key: 'name', width: 220 }, { title: '类型', key: 'type', width: 130 }, { title: '内容摘要', key: 'content', ellipsis: { tooltip: true } }, { title: '版本', key: 'version', width: 90 },
  { title: '状态', key: 'status', width: 100, render: (row: any) => h(NTag, { type: 'success', size: 'small' }, { default: () => row.status }) },
  { title: '操作', key: 'actions', width: 90, render: (_row: any, index: number) => h(NButton, { text: true, type: 'primary', onClick: () => openKnowledgeEditor(index) }, { default: () => '编辑' }) },
]
function handleTemplateFile(options: any) {
  selectedPackageName.value = options.file?.name || ''
  templateValidation.status = 'checking'
  templateValidation.message = '正在校验模板包…'
  window.setTimeout(() => {
    if (!selectedPackageName.value.toLowerCase().endsWith('.zip')) {
      templateValidation.status = 'failed'
      templateValidation.message = '校验失败：请上传 ZIP 格式的模板包。'
      return
    }
    templateValidation.status = 'passed'
    templateValidation.message = '基础校验通过：将由服务端进一步校验 index.html、manifest.json、资源声明和安全性。'
  }, 250)
}
function uploadTemplate() {
  if (!newTemplate.name.trim() || !selectedPackageName.value || templateValidation.status !== 'passed') { message.warning('请填写模板名称并通过模板包校验'); return }
  const id = Date.now()
  templateRows.value.push({ id, name: newTemplate.name.trim(), packageName: selectedPackageName.value, version: 'v1.0', updatedAt: '刚刚', status: '停用' })
  newTemplate.name = ''; selectedPackageName.value = ''; templateValidation.status = 'idle'; templateValidation.message = '选择模板包后将自动校验。'; showTemplateUpload.value = false; selectedTemplateId.value = id; showTemplateSelector.value = true; message.success('模板已上传并通过校验，请确认是否设为当前模板')
}
function deleteTemplate(template: TemplateRow) {
  if (template.id === activeTemplateId.value) { message.warning('当前启用的模板不能删除，请先选择其他模板'); return }
  templateRows.value = templateRows.value.filter((item) => item.id !== template.id)
  message.success('模板已删除')
}
function confirmTemplateSelection() {
  activeTemplateId.value = selectedTemplateId.value
  templateRows.value.forEach((item) => { item.status = item.id === selectedTemplateId.value ? '启用' : '停用' })
  showTemplateSelector.value = false; message.success('报告模板已设置为「' + activeTemplate.value.name + '」')
}
function openKnowledgeEditor(index = -1) {
  editingKnowledgeIndex.value = index
  Object.assign(editingKnowledge, index === -1 ? { name: '', type: '会员运营', content: '', version: 'v1.0', status: '已生效' } : knowledgeRows.value[index])
  showKnowledgeEditor.value = true
}
function saveKnowledge() {
  if (!editingKnowledge.name.trim() || !editingKnowledge.content.trim()) { message.warning('请填写资料名称和资料内容'); return }
  if (editingKnowledgeIndex.value === -1) knowledgeRows.value.unshift({ ...editingKnowledge })
  else Object.assign(knowledgeRows.value[editingKnowledgeIndex.value], editingKnowledge)
  showKnowledgeEditor.value = false; message.success('诊断资料已保存')
}
function isTypeInUse(type: string) { return knowledgeRows.value.some((item) => item.type === type) }
function addKnowledgeType() {
  const name = newTypeName.value.trim()
  if (!name) { message.warning('请输入类型名称'); return }
  if (knowledgeTypes.value.includes(name)) { message.warning('该类型已存在'); return }
  knowledgeTypes.value.push(name); newTypeName.value = ''; message.success('资料类型已新增')
}
function deleteKnowledgeType(type: string) {
  if (type === defaultKnowledgeType) { message.warning('默认类型不可删除'); return }
  if (isTypeInUse(type)) { message.warning('已有资料正在使用该类型，不能删除'); return }
  knowledgeTypes.value = knowledgeTypes.value.filter((item) => item !== type); message.success('资料类型已删除')
}
function saveAll() {
  if (healthTiers.some((tier) => !tier.label.trim())) { message.warning('健康分段位名称不能为空'); return }
  const labels = healthTiers.map((tier) => tier.label.trim())
  if (new Set(labels).size !== labels.length) { message.warning('健康分段位名称不能重复'); return }
  for (let i = 0; i < healthTiers.length - 1; i++) {
    if (healthTiers[i].min <= healthTiers[i + 1].min) { message.warning('分段配置无效：上一段的分数下限必须大于下一段'); return }
  }
  if (diagnosticDimensions.value.some((dim) => !dim.label.trim())) { message.warning('诊断维度名称不能为空'); return }
  const dimLabels = diagnosticDimensions.value.map((dim) => dim.label.trim())
  if (new Set(dimLabels).size !== dimLabels.length) { message.warning('诊断维度名称不能重复'); return }
  for (let i = 0; i < benchmarkStages.value.length; i++) {
    const stage = benchmarkStages.value[i]
    if (stage.maxCycles !== null && stage.maxCycles < stageStartMonth(i)) { message.warning(stage.label + '的结束运营月数不能小于开始月数'); return }
    if (stage.key !== 'observe' && stage.storeWeight + stage.peerWeight !== 100) { message.warning(stage.label + '的本店历史与同类门店占比合计必须为 100%'); return }
  }
  if (initialBenchmarks.value.some((item) => item.value === null || Number(item.value) < 0)) { message.warning('观察期初始评分基准不能小于 0'); return }
  if (scoreMode.value === 'weighted' && weightTotal.value !== 100) { message.warning('按权重加权模式下，权重合计必须为 100%'); return }
  if (supplementQuestions.value.some((q) => !q.title.trim())) { message.warning('店长补充问题标题不能为空'); return }
  saveDiagnosticDimensions(diagnosticDimensions.value)
  saveDiagnosticScoreMode(scoreMode.value)
  saveSupplementQuestions(supplementQuestions.value)
  lastSavedAt.value = new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date())
  message.success('报告配置已保存，将在下一个生成周期生效')
}
</script>

<style scoped>
.config-page{padding:24px;display:flex;flex-direction:column;gap:16px}.page-header,.section-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}.page-header{margin-bottom:4px}.page-header h1{font-size:22px;margin:0 0 8px}.header-desc,.section-head p,.form-hint{margin:0;color:var(--text-secondary);line-height:1.6}.save-status{margin:6px 0 0;color:#94a3b8;font-size:12px}.config-tabs :deep(.n-tab-pane){display:flex;flex-direction:column;gap:16px;padding-top:16px}.content-card{background:#fff;border:1px solid var(--border-color);border-radius:12px;padding:20px}.section-head{margin-bottom:16px}.section-head h2{font-size:17px;margin:0 0 5px}.current-template{display:flex;align-items:center;gap:12px;padding:14px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px}.current-template span{color:var(--text-secondary);font-size:13px}.current-template strong{color:#1e293b}.rule-form{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0 16px}.form-hint,.sync-note{font-size:13px;color:var(--text-secondary)}.sync-note{line-height:1.6;margin:8px 0 0}.validation-box{display:flex;flex-direction:column;gap:4px;padding:10px 12px;margin:0 0 12px;border-radius:6px;background:#f8fafc;color:#64748b;font-size:13px}.validation-box.passed{background:#f0fdf4;color:#15803d}.validation-box.failed{background:#fef2f2;color:#b91c1c}.tier-table{display:flex;flex-direction:column;gap:10px}.tier-row{display:grid;grid-template-columns:180px 140px 110px minmax(0,1fr) auto;gap:12px;align-items:center}.tier-row.tier-head{font-size:12px;font-weight:600;color:var(--text-secondary);padding:0 2px}.tier-preview{padding:8px 12px;border:1px solid;border-radius:6px;font-size:13px;font-weight:600;text-align:center}.tier-count{font-size:12px;color:#94a3b8}.dim-table,.question-table{display:flex;flex-direction:column;gap:10px}.dim-row{display:grid;grid-template-columns:200px 120px minmax(0,1fr) auto;gap:12px;align-items:center}.dim-row.dim-head,.question-row.question-head{font-size:12px;font-weight:600;color:var(--text-secondary);padding:0 2px}.dim-locked{font-size:12px;color:#94a3b8;white-space:nowrap}.dim-total{font-size:13px;font-weight:600;color:#16a34a}.dim-total.invalid{color:#dc2626}.question-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) auto auto;gap:12px;align-items:center}.template-options{display:flex;flex-direction:column;gap:10px}.template-option{display:flex;flex-direction:column;gap:6px;padding:12px;border:1px solid #e2e8f0;border-radius:8px}.template-option-main{display:flex;justify-content:space-between;align-items:center}.template-option small{padding-left:28px;color:var(--text-secondary)}.knowledge-guide{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}.knowledge-guide>div{display:flex;flex-direction:column;gap:4px;padding:12px 14px;background:#F8FAFC;border:1px solid var(--border-color);border-radius:8px}.knowledge-guide strong{font-size:13px;color:#1E40AF}.knowledge-guide span{font-size:12.5px;color:var(--text-secondary);line-height:1.7}.type-select-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;width:100%}.type-list{display:flex;flex-direction:column;gap:8px}.type-list>div{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:#f8fafc;border-radius:6px}@media(max-width:760px){.config-page{padding:16px}.page-header,.section-head{flex-direction:column}.rule-form{grid-template-columns:1fr}}
.dim-block{padding:14px 16px;border:1px solid #e6edf5;border-radius:10px;background:#fbfcfe}.dim-desc-row{display:grid;grid-template-columns:42px minmax(0,1fr);gap:10px;align-items:center;margin-top:10px;color:#94a3b8;font-size:12px}.dim-desc-row .n-input{min-width:0}.dim-helper{margin:2px 0 0}.dim-total{display:inline-flex;align-items:center;padding:5px 10px;border-radius:999px;background:#ecfdf5;color:#15803d;font-size:13px;font-weight:700}.dim-total.invalid{background:#fef2f2;color:#dc2626}.score-mode-panel{display:flex;justify-content:space-between;gap:18px;align-items:center;padding:14px 16px;border-radius:10px;background:#f6f9fd;border:1px solid #e2e8f0}.score-mode-panel strong,.score-mode-panel span{display:block}.score-mode-panel strong{margin-bottom:4px;font-size:14px}.score-mode-panel span{color:var(--text-secondary);font-size:12px}@media(max-width:760px){.score-mode-panel{flex-direction:column;align-items:flex-start}.dim-row{grid-template-columns:1fr}.dim-row.dim-head{display:none}.dim-locked{display:none}}
.benchmark-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.benchmark-stage{padding:16px;border:1px solid #e2e8f0;border-radius:10px;background:#fbfcfe}.benchmark-stage-head{display:flex;justify-content:space-between;gap:8px;align-items:baseline}.benchmark-stage-head strong{font-size:15px}.benchmark-stage-head span{color:#64748b;font-size:12px}.benchmark-fields{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr) auto;gap:6px;align-items:center;margin:14px 0 10px;color:#64748b;font-size:12px}.benchmark-stage p{margin:0;color:#64748b;font-size:12px;line-height:1.7}.benchmark-note{display:flex;gap:10px;margin-top:12px;padding:12px 14px;border-radius:8px;background:#f4f8ff;color:#52657e;font-size:12px;line-height:1.7}.benchmark-note strong{white-space:nowrap;color:#1d4ed8}@media(max-width:760px){.benchmark-grid{grid-template-columns:1fr}.benchmark-note{flex-direction:column;gap:2px}}
.benchmark-fields{grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.benchmark-fields label{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px;align-items:center}.benchmark-fields label>span{grid-column:1/-1;margin-bottom:2px;color:#64748b;font-size:12px}.benchmark-fields label>em{font-style:normal;color:#94a3b8;font-size:12px}.benchmark-formula{margin-top:10px;padding:9px 10px;border-radius:6px;background:#f1f5fb;color:#51627c;font-size:12px;line-height:1.6}
.benchmark-scope{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:10px 0}.benchmark-scope label>span{display:block;margin-bottom:5px;color:#64748b;font-size:12px}
.benchmark-duration{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 0}.benchmark-duration label{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px;align-items:center}.benchmark-duration label>span,.benchmark-open-end span{grid-column:1/-1;margin-bottom:2px;color:#64748b;font-size:12px}.benchmark-duration label>em{font-style:normal;color:#94a3b8;font-size:12px}.benchmark-open-end{display:flex;flex-direction:column;justify-content:center;padding:0 10px;border:1px dashed #cbd5e1;border-radius:8px}.benchmark-open-end strong{font-size:13px;color:#475569}
.benchmark-observe{display:flex;flex-direction:column;gap:10px;margin:12px 0;padding:12px;border-radius:8px;background:#f1f5fb;color:#51627c;font-size:12px;line-height:1.6}.observe-head{display:flex;justify-content:space-between;gap:8px;align-items:center}.observe-head strong{color:#1e3a8a}.observe-head span{color:#64748b}.observe-thresholds{display:grid;grid-template-columns:1fr;gap:10px}.observe-threshold-item{display:flex;flex-direction:column;gap:8px;padding:10px;border-radius:8px;background:#fff;border:1px solid #dbeafe}.observe-thresholds label{display:grid;grid-template-columns:minmax(100px,1fr) minmax(0,1.15fr) auto;gap:8px;align-items:center}.observe-thresholds label>span{color:#475569;font-weight:600}.observe-thresholds label>em{font-style:normal;color:#94a3b8}.threshold-usage{padding-top:8px;border-top:1px dashed #dbeafe}.threshold-usage strong,.threshold-usage span{display:block}.threshold-usage strong{color:#1d4ed8}.threshold-usage span{margin-top:2px;color:#64748b}.missing-policy{padding:10px;border-radius:7px;background:#fff;border:1px solid #dbeafe}.missing-policy strong,.missing-policy span{display:block}.missing-policy strong{margin-bottom:3px;color:#1d4ed8}.missing-policy span{color:#52657e}
</style>
