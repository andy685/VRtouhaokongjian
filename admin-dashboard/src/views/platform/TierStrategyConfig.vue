<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>阶梯分润策略配置</h1>
        <p class="header-desc">管理全平台代理商阶梯分润规则（当前版本 v{{ currentVersion }}）</p>
      </div>
      <n-space>
        <n-tag :type="isActive ? 'success' : 'warning'" size="small" round :bordered="false">
          {{ isActive ? '已生效' : '草稿' }}
        </n-tag>
        <n-button type="primary" @click="handleSaveDraft">保存草稿</n-button>
        <n-button type="error" @click="showPublishConfirm = true">确认发布</n-button>
      </n-space>
    </div>

    <!-- 三级代理商 Tab 切换 -->
    <n-tabs v-model:value="activeLevel" type="line" animated>
      <n-tab-pane name="city" tab="城市代理">
        <div class="level-badge">
          基础比例：<n-input-number v-model:value="tiers.city.baseRate" :min="1" :max="10" :step="0.5" :precision="1" size="small" style="width:100px;" /> %
        </div>

        <!-- 阶梯区间矩阵 -->
        <div class="config-section" style="margin-top: 16px;">
          <h3 class="section-title">阶梯区间系数矩阵</h3>
          <n-card class="config-card">
            <n-data-table
              :columns="tierColumns"
              :data="currentTierData"
              :pagination="false"
              striped
              size="small"
            />

            <!-- 可视化滑块 -->
            <div class="visual-slider-area" style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #f0f0f0;">
              <h4 style="font-size: 13px; font-weight: 600; margin-bottom: 12px;">系数可视化调整</h4>
              <div v-for="(row, idx) in currentTierData" :key="idx" style="display:flex; align-items:center; padding:8px 0;">
                <span style="width:150px; font-size:12px; color:#666;">{{ formatRange(row) }}</span>
                <n-slider
                  v-model:value="row.factor"
                  :min="0.5"
                  :max="2"
                  :step="0.1"
                  :tooltip="true"
                  style="flex:1; margin:0 12px;"
                />
                <span style="width:50px; text-align:center; font-weight:700;">x{{ row.factor.toFixed(1) }}</span>
              </div>
            </div>
          </n-card>
        </div>
      </n-tab-pane>

      <n-tab-pane name="region" tab="区域代理">
        <div class="level-badge">
          基础比例：<n-input-number v-model:value="tiers.region.baseRate" :min="3" :max="12" :step="0.5" :precision="1" size="small" style="width:100px;" /> %
        </div>
      </n-tab-pane>

      <n-tab-pane name="province" tab="省级总代">
        <div class="level-badge">
          基础比例：<n-input-number v-model:value="tiers.province.baseRate" :min="5" :max="15" :step="0.5" :precision="1" size="small" style="width:100px;" /> %
        </div>
      </n-tab-pane>
    </n-tabs>

    <!-- 模拟计算器 -->
    <div class="config-section">
      <h3 class="section-title">模拟计算器</h3>
      <n-card class="config-card">
        <div style="display:flex; align-items:center; gap:12px;">
          <span>输入月游戏豆采购额：</span>
          <n-input-number
            v-model:value="simulateAmount"
            :min="0"
            :max="10000000"
            :step="10000"
            :precision="0"
            style="width:200px;"
          >
            <template #prefix>¥</template>
          </n-input-number>
          <n-button secondary type="primary" @click="runSimulate">计算</n-button>
        </div>

        <div v-if="simulateResult" style="margin-top: 12px;">
          <n-divider>计算结果预览</n-divider>
          <div v-for="(item, idx) in simulateResult.breakdown" :key="idx" style="padding:8px 16px; background:#f8fafc; border-radius:6px; margin-bottom:6px; font-size:13px; display:flex; gap:16px; align-items:center;">
            <span style="font-weight:600; width:160px;">{{ item.rangeLabel }}</span>
            <span style="color:#666; flex:1;">{{ item.baseRate }}% × {{ item.factor }} × ¥{{ item.amount.toLocaleString() }}</span>
            <span style="font-weight:700; color:#3B82F6;">= ¥{{ item.commission.toLocaleString() }}</span>
          </div>
          <div style="padding:14px 20px; background:#eef2ff; border-radius:8px; margin-top:10px; display:flex; align-items:center; gap:12px; font-weight:600;">
            <span>总采购额：¥{{ simulateAmount.toLocaleString() }} → 总分润：</span>
            <span style="font-size:20px; color:#4F46E5;">¥{{ simulateResult.total.toLocaleString() }}</span>
            <span style="font-size:12px; color:#6366F1;">有效费率：{{ ((simulateResult.total / simulateAmount) * 100).toFixed(2) }}%</span>
          </div>
        </div>
      </n-card>
    </div>

    <!-- 版本历史 -->
    <div class="config-section">
      <h3 class="section-title">版本历史</h3>
      <n-card class="config-card">
        <n-timeline>
          <n-timeline-item
            v-for="ver in versionHistory"
            :key="ver.id"
            :type="ver.id === currentVersionId ? 'success' : 'default'"
            :title="'v' + ver.version + (ver.id === currentVersionId ? '(当前生效)' : '(已归档)')"
            :time="ver.createdAt"
          >
            <div style="font-size:13px; color:#64748B;">
              <p>操作人：<strong>{{ ver.operator }}</strong></p>
              <p>原因：{{ ver.reason }}</p>
              <p>变更摘要：{{ ver.summary }}</p>
              <n-button v-if="ver.id !== currentVersionId" text type="primary" size="tiny" @click="handleRollback(ver)">
                回滚至此版本
              </n-button>
            </div>
          </n-timeline-item>
        </n-timeline>
      </n-card>
    </div>

    <!-- 发布确认弹窗 -->
    <n-modal v-model:show="showPublishConfirm" preset="dialog" type="warning" title="确认发布新版本策略？">
      <p>发布后将在 <strong>{{ publishEffectiveDate }}</strong> 生效，所有代理商将按新规则计算分润。</p>
      <n-form label-placement="left" label-width="100" style="margin-top: 12px;">
        <n-form-item label="生效时间">
          <n-select v-model:value="publishMode" :options="publishModeOptions" style="width:220px;" />
        </n-form-item>
        <n-form-item label="变更原因" required>
          <n-input v-model:value="publishReason" placeholder="请填写变更原因" type="textarea" :autosize="{ minRows: 2 }" />
        </n-form-item>
      </n-form>
      <template #action>
        <n-space justify="end">
          <n-button @click="showPublishConfirm = false">取消</n-button>
          <n-button type="error" :loading="publishLoading" @click="confirmPublish">确认发布</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NCard, NTabs, NTabPane, NInputNumber, NDataTable, NSlider,
  NButton, NIcon, NTag, NModal, NDivider, NTimeline,
  NTimelineItem, NSelect, NForm, NFormItem, NInput, NSpace,
  useMessage, useDialog
} from 'naive-ui'

const message = useMessage()
const dialog = useDialog()

const activeLevel = ref<'city' | 'region' | 'province'>('city')
const isActive = ref(true)
const currentVersion = ref('2.1')
const currentVersionId = ref(3)

interface TierRow {
  min: number
  max: number | null
  factor: number
}

const tiers = ref({
  city: {
    baseRate: 5.0,
    tiers: [
      { min: 0, max: 50000, factor: 0.8 },
      { min: 50000, max: 100000, factor: 1.0 },
      { min: 100000, max: 200000, factor: 1.2 },
      { min: 200000, max: null, factor: 1.5 },
    ] as TierRow[],
  },
  region: {
    baseRate: 7.0,
    tiers: [
      { min: 0, max: 80000, factor: 0.8 },
      { min: 80000, max: 200000, factor: 1.0 },
      { min: 200000, max: 500000, factor: 1.2 },
      { min: 500000, max: null, factor: 1.5 },
    ] as TierRow[],
  },
  province: {
    baseRate: 10.0,
    tiers: [
      { min: 0, max: 150000, factor: 0.8 },
      { min: 150000, max: 400000, factor: 1.0 },
      { min: 400000, max: 800000, factor: 1.2 },
      { min: 800000, max: null, factor: 1.5 },
    ] as TierRow[],
  },
})

const currentTierData = computed(() => tiers.value[activeLevel.value].tiers)
const currentBaseRate = computed(() => tiers.value[activeLevel.value].baseRate)

const tierColumns = [
  { title: '采购额区间下限(¥)', key: 'min', width: 140,
    render(row: TierRow) { return `¥${row.min.toLocaleString()}` } },
  { title: '采购额区间上限(¥)', key: 'max', width: 140,
    render(row: TierRow) { return row.max === null ? '∞ 无上限' : `¥${row.max.toLocaleString()}` } },
  { title: '阶梯系数', key: 'factor', width: 120,
    render(row: TierRow) {
      const c = row.factor <= 0.85 ? '#9CA3AF' : row.factor <= 1.05 ? '#3B82F6' : row.factor <= 1.25 ? '#F59E0B' : '#10B981'
      return h('span', { style: `font-weight:600;color:${c};font-size:15px;` }, `×${row.factor.toFixed(1)}`)
    }},
  { title: '说明', key: 'label',
    render(row: TierRow) {
      const labels: Record<number, string> = { 0.8: '起步', 1.0: '基准', 1.2: '成长', 1.5: '奖励' }
      return h(NTag, { type: 'default', size: 'small', bordered: true }, () => labels[row.factor] || '自定义')
    }},
]

function formatRange(row: TierRow): string {
  const maxStr = row.max === null ? '∞' : `${(row.max! / 10000).toFixed(0)}万`
  return `¥${(row.min / 10000).toFixed(0)}万 - ${maxStr}`
}

// ---- 模拟计算器 ----
const simulateAmount = ref(120000)
const simulateResult = ref<any>(null)

function runSimulate() {
  const amount = simulateAmount.value
  const rate = currentBaseRate.value
  const tierList = [...currentTierData.value]

  // 查找金额所在的档位（全额按档位计算）
  let matchedTier = tierList[tierList.length - 1] // 默认最后一档
  for (const t of tierList) {
    if (t.max !== null && amount > t.max) continue
    matchedTier = t
    break
  }

  const commission = amount * (rate / 100) * matchedTier.factor
  simulateResult.value = {
    breakdown: [{
      rangeLabel: `${formatRange(matchedTier)}（全额按该档计算）`,
      baseRate: rate,
      factor: matchedTier.factor,
      amount: amount,
      commission: Math.round(commission * 100) / 100,
    }],
    total: Math.round(commission * 100) / 100,
    matchedTierLabel: matchedTier.factor === 0.8 ? '起步' : matchedTier.factor === 1.0 ? '基准' : matchedTier.factor === 1.2 ? '成长' : '奖励',
  }
}

// ---- 版本历史 ----
const versionHistory = ref([
  { id: 3, version: '2.1', operator: '张超管', reason: 'Q2激励政策，提升高产出代理商标杆系数', summary: '省级总代奖励档从×1.3→×1.5', createdAt: '2026-03-01 10:30' },
  { id: 2, version: '2.0', operator: '李运营', reason: '年初常规调整', summary: '新增成长档位×1.2，优化起步门槛', createdAt: '2026-01-05 14:20' },
  { id: 1, version: '1.0', operator: '王超管', reason: '系统上线初始版', summary: '三级阶梯体系初始化', createdAt: '2025-06-01 09:00' },
])

function handleRollback(ver: any) {
  dialog.warning({
    title: '确认回滚',
    content: `确定回滚至 v${ver.version} 吗？`,
    positiveText: '确认回滚',
    negativeText: '取消',
    onPositiveClick: () => message.success(`已回滚至 v${ver.version}（模拟操作）`),
  })
}

// ---- 发布 ----
const showPublishConfirm = ref(false)
const publishLoading = ref(false)
const publishMode = ref('immediate')
const publishReason = ref('')
const publishEffectiveDate = computed(() => publishMode.value === 'immediate' ? '立即' : '2026年06月01日')
const publishModeOptions = [
  { label: '立即生效', value: 'immediate' },
  { label: '指定月份生效（次月1日）', value: 'next_month' },
]

async function confirmPublish() {
  if (!publishReason.value.trim()) { message.warning('请填写变更原因'); return }
  publishLoading.value = true
  setTimeout(() => {
    publishLoading.value = false
    showPublishConfirm.value = false
    message.success(`v${(parseFloat(currentVersion.value) + 0.1).toFixed(1)} 已发布`)
  }, 800)
}

function handleSaveDraft() {
  message.success('草稿保存成功')
}
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.header-desc { font-size: 13px; color: var(--text-muted); margin-top: 4px; display: block; }
.level-badge { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; background: #F8FAFC; border-radius: 8px; font-size: 13px; color: var(--text-muted); }
.config-section { margin-bottom: 28px; }
.section-title { font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 14px; }
.config-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid var(--border-color); }
</style>
