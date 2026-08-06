<template>
  <div class="page-container animate-fade-in">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>营收目标与完成率</h2>
      <n-button v-if="isManager" type="primary" @click="openCreateModal">
        <template #icon><n-icon :component="AddOutline" /></template>
        新建目标
      </n-button>
    </div>

    <!-- ==================== 一、目标列表 ==================== -->
    <div class="section-card">
      <div class="section-title">
        <span class="title-bar"></span>
        <span>目标列表</span>
        <span class="section-sub">点击行查看对应月份完成率</span>
      </div>

      <n-data-table
        :columns="listColumns"
        :data="listData"
        :bordered="false"
        :single-line="false"
        size="small"
        :row-props="(row: any) => ({ style: 'cursor:pointer', onClick: () => selectTarget(row) })"
        :row-class-name="(row: any) => row.month === activeMonth ? 'row-selected' : ''"
      />

      <n-empty v-if="targetList.length === 0" description="暂无目标数据，点击「新建目标」开始设置" style="padding: 40px 0" />
    </div>

    <!-- ==================== 二、完成率看板 ==================== -->
    <div v-if="activeTarget" class="section-card">
      <div class="section-title">
        <span class="title-bar"></span>
        <span>完成率看板</span>
        <span class="section-sub">{{ activeMonthLabel }}</span>
        <div class="header-actions">
          <n-button v-if="isManager" size="small" @click="openEditModal(activeTarget)">
            <template #icon><n-icon :component="CreateOutline" /></template>
            编辑
          </n-button>
          <n-popconfirm @positive-click="deleteTarget(activeTarget!.month)">
            <template #trigger>
              <n-button v-if="isManager" size="small" type="error" ghost>删除</n-button>
            </template>
            确定删除 {{ activeMonthLabel }} 的目标数据？
          </n-popconfirm>
        </div>
      </div>

      <!-- 完成率卡片 -->
      <div class="completion-cards">
        <div class="completion-card monthly">
          <div class="completion-ring">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#E8ECF1" stroke-width="10" />
              <circle
                cx="60" cy="60" r="52"
                fill="none"
                stroke="url(#monthGrad)"
                stroke-width="10"
                stroke-linecap="round"
                :stroke-dasharray="2 * Math.PI * 52"
                :stroke-dashoffset="2 * Math.PI * 52 * (1 - monthlyRate / 100)"
                transform="rotate(-90 60 60)"
                style="transition: stroke-dashoffset 0.8s ease"
              />
              <defs>
                <linearGradient id="monthGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#3B82F6" />
                  <stop offset="100%" stop-color="#8B5CF6" />
                </linearGradient>
              </defs>
            </svg>
            <div class="ring-text">
              <span class="ring-rate">{{ monthlyRate.toFixed(1) }}%</span>
              <span class="ring-label">本月完成率</span>
            </div>
          </div>
          <div class="completion-detail">
            <div class="detail-row">
              <span class="detail-label">本月目标</span>
              <span class="detail-value">¥{{ activeTarget.amount.toLocaleString() }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">已达成</span>
              <span class="detail-value achieved">¥{{ monthlyAchieved.toLocaleString() }}</span>
            </div>
            <div class="detail-row remaining">
              <span class="detail-label">待完成</span>
              <span class="detail-value">¥{{ (activeTarget.amount - monthlyAchieved).toLocaleString() }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">剩余天数</span>
              <span class="detail-value">{{ remainingDays }}天</span>
            </div>
          </div>
        </div>

        <div class="completion-card daily">
          <div class="completion-ring small">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#E8ECF1" stroke-width="8" />
              <circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke="url(#dayGrad)"
                stroke-width="8"
                stroke-linecap="round"
                :stroke-dasharray="2 * Math.PI * 42"
                :stroke-dashoffset="2 * Math.PI * 42 * (1 - todayRate / 100)"
                transform="rotate(-90 50 50)"
                style="transition: stroke-dashoffset 0.8s ease"
              />
              <defs>
                <linearGradient id="dayGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#10B981" />
                  <stop offset="100%" stop-color="#34D399" />
                </linearGradient>
              </defs>
            </svg>
            <div class="ring-text">
              <span class="ring-rate small">{{ todayRate.toFixed(1) }}%</span>
              <span class="ring-label">今日完成率</span>
            </div>
          </div>
          <div class="completion-detail">
            <div class="detail-row">
              <span class="detail-label">今日目标</span>
              <span class="detail-value">¥{{ todayTarget.toLocaleString() || '--' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">当前营收</span>
              <span class="detail-value achieved">¥{{ todayRevenue.toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 每日对比图表 -->
      <div class="chart-section">
        <div class="chart-header">
          <span>每日目标 vs 实际营收</span>
          <n-radio-group v-model:value="progressView" size="small">
            <n-radio-button value="bar">柱状图</n-radio-button>
            <n-radio-button value="table">表格</n-radio-button>
          </n-radio-group>
        </div>
        <div v-if="progressView === 'bar'" ref="chartRef" class="chart-container"></div>
        <n-data-table
          v-else
          :columns="detailTableColumns"
          :data="detailTableData"
          :bordered="false"
          :single-line="false"
          size="small"
          :max-height="500"
          class="target-table"
        />
      </div>
    </div>

    <!-- ==================== 新建/编辑弹窗 ==================== -->
    <n-modal
      v-model:show="showModal"
      preset="card"
      :title="modalTitle"
      style="width: 780px; max-width: 90vw"
      :bordered="false"
      :mask-closable="false"
    >
      <!-- 月份选择 + 月度目标 -->
      <div class="modal-row">
        <div class="modal-field">
          <span class="field-label">目标月份</span>
          <n-date-picker
            v-model:formatted-value="formMonth"
            type="month"
            :disabled="isEditing"
            clearable
            style="width: 180px"
          />
        </div>
        <div class="modal-field">
          <span class="field-label">月度营收目标</span>
          <n-input-number v-model:value="formMonthlyAmount" :min="0" :step="1000" placeholder="请输入" style="width: 220px">
            <template #prefix>¥</template>
          </n-input-number>
        </div>
      </div>

      <!-- 每日目标 -->
      <div class="modal-daily-section">
        <div class="modal-daily-header">
          <span class="field-label">每日目标</span>
          <div class="daily-actions">
            <span class="batch-label">批量设置：</span>
            <n-input-number
              v-model:value="batchAmount"
              :min="0"
              :step="100"
              size="small"
              placeholder="统一金额"
              style="width: 130px"
            >
              <template #prefix>¥</template>
            </n-input-number>
            <n-button size="small" @click="applyBatch">统一应用</n-button>
            <n-button size="small" @click="autoFill">均分月度</n-button>
          </div>
        </div>
        <div class="daily-grid">
          <div v-for="day in formDaysInMonth" :key="day" class="daily-item">
            <span class="day-label">{{ day }}日</span>
            <n-input-number
              v-model:value="formDailyTargets[day - 1]"
              :min="0"
              :step="100"
              size="small"
              placeholder="0"
              style="width: 110px"
            >
              <template #prefix>¥</template>
            </n-input-number>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="modal-footer">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" :loading="modalSaving" @click="handleSave">保存</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { h, ref, computed, onMounted, nextTick, watch } from 'vue'
import {
  NButton, NInputNumber, NDatePicker, NDataTable, NModal,
  NRadioGroup, NRadioButton, NPopconfirm, NEmpty, NIcon,
  useMessage,
} from 'naive-ui'
import { AddOutline, CreateOutline } from '@vicons/ionicons5'
import * as echarts from 'echarts/core'
import { BarChart } from 'echarts/charts'
import {
  TitleComponent, TooltipComponent, GridComponent, LegendComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([BarChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer])

const message = useMessage()
const isManager = ref(true)

// ============== 目标列表数据（mock） ==============
interface TargetRecord {
  month: string
  amount: number
  dailies: number[]
  createdAt: string
}

const targetList = ref<TargetRecord[]>([
  {
    month: '2026-08',
    amount: 90000,
    dailies: Array(31).fill(0).map((_, i) => i < 31 ? 2900 : 0),
    createdAt: '2026-08-01 10:30',
  },
  {
    month: '2026-07',
    amount: 85000,
    dailies: Array(31).fill(0).map((_, i) => i < 31 ? 2740 : 0),
    createdAt: '2026-07-01 09:15',
  },
])

const activeMonth = ref('2026-08')

const activeTarget = computed(() => targetList.value.find(t => t.month === activeMonth.value) || null)

const activeMonthLabel = computed(() => {
  const [y, m] = activeMonth.value.split('-')
  return `${y}年${parseInt(m)}月`
})

// 列表列定义
const listColumns = [
  { title: '月份', key: 'label', width: 120 },
  {
    title: '月度目标',
    key: 'amount',
    width: 150,
    render: (row: any) => `¥${row.amount.toLocaleString()}`,
  },
  {
    title: '日均目标',
    key: 'dailyAvg',
    width: 120,
    render: (row: any) => {
      const [y, m] = row.month.split('-')
      const days = new Date(parseInt(y), parseInt(m), 0).getDate()
      return `¥${Math.round(row.amount / days).toLocaleString()}`
    },
  },
  { title: '创建时间', key: 'createdAt', width: 160 },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row: any) => {
      const now = new Date()
      const [y, m] = row.month.split('-')
      const curMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      if (row.month === curMonth) return h('span', { style: { color: '#3B82F6' } }, '进行中')
      if (row.month < curMonth) return h('span', { style: { color: '#9CA3AF' } }, '已结束')
      return h('span', { style: { color: '#F59E0B' } }, '未开始')
    },
  },
]

const listData = computed(() =>
  targetList.value.map(t => {
    const [y, m] = t.month.split('-')
    return {
      ...t,
      label: `${y}年${parseInt(m)}月`,
    }
  })
)

function selectTarget(row: any) {
  activeMonth.value = row.month
  // 切换后刷新图表
  nextTick(() => {
    if (progressView.value === 'bar') {
      if (!chartInstance) initChart()
      else renderChart()
    }
  })
}

function deleteTarget(month: string) {
  targetList.value = targetList.value.filter(t => t.month !== month)
  if (activeMonth.value === month) {
    activeMonth.value = targetList.value[0]?.month || ''
  }
  message.success('已删除')
}

// ============== 新建/编辑 Modal ==============
const showModal = ref(false)
const isEditing = ref(false)
const editMonth = ref('')
const formMonth = ref('2026-08')
const formMonthlyAmount = ref(90000)
const formDailyTargets = ref<number[]>(Array(31).fill(0))
const batchAmount = ref<number | null>(null)
const modalSaving = ref(false)

const modalTitle = computed(() => isEditing.value ? '编辑目标' : '新建目标')

const formDaysInMonth = computed(() => {
  const [y, m] = formMonth.value.split('-')
  return new Date(parseInt(y), parseInt(m), 0).getDate()
})

// 监听月度金额变化，自动均分每日
watch(formMonthlyAmount, (val) => {
  const days = formDaysInMonth.value
  const avg = Math.round(val / days)
  formDailyTargets.value = Array(31).fill(0).map((_, i) => i < days ? avg : 0)
})

watch(formMonth, () => {
  const days = formDaysInMonth.value
  const avg = Math.round(formMonthlyAmount.value / days)
  formDailyTargets.value = Array(31).fill(0).map((_, i) => i < days ? avg : 0)
})

function applyBatch() {
  if (batchAmount.value == null || batchAmount.value < 0) return
  const days = formDaysInMonth.value
  for (let i = 0; i < days; i++) {
    formDailyTargets.value[i] = batchAmount.value
  }
  message.success(`已将全部 ${days} 天统一设置为 ¥${batchAmount.value.toLocaleString()}`)
}

function autoFill() {
  const days = formDaysInMonth.value
  const avg = Math.round(formMonthlyAmount.value / days)
  for (let i = 0; i < days; i++) {
    formDailyTargets.value[i] = avg
  }
  message.success(`已均分月度目标，每天 ¥${avg.toLocaleString()}`)
}

function openCreateModal() {
  isEditing.value = false
  editMonth.value = ''
  formMonth.value = '2026-08'
  formMonthlyAmount.value = 90000
  batchAmount.value = null
  const days = new Date(2026, 8, 0).getDate()
  const avg = Math.round(90000 / days)
  formDailyTargets.value = Array(31).fill(0).map((_, i) => i < days ? avg : 0)
  showModal.value = true
}

function openEditModal(record: TargetRecord) {
  isEditing.value = true
  editMonth.value = record.month
  formMonth.value = record.month
  formMonthlyAmount.value = record.amount
  batchAmount.value = null
  formDailyTargets.value = [...record.dailies]
  showModal.value = true
}

function handleSave() {
  if (!formMonth.value) {
    message.warning('请选择目标月份')
    return
  }
  if (!formMonthlyAmount.value || formMonthlyAmount.value <= 0) {
    message.warning('请输入月度营收目标')
    return
  }

  modalSaving.value = true
  setTimeout(() => {
    const days = formDaysInMonth.value
    const dailies = formDailyTargets.value.slice(0, 31).map((v, i) => i < days ? v : 0)

    if (isEditing.value) {
      // 编辑模式
      const idx = targetList.value.findIndex(t => t.month === editMonth.value)
      if (idx >= 0) {
        targetList.value[idx] = {
          ...targetList.value[idx],
          amount: formMonthlyAmount.value,
          dailies,
        }
      }
      message.success('目标已更新')
    } else {
      // 新建模式
      targetList.value.push({
        month: formMonth.value,
        amount: formMonthlyAmount.value,
        dailies,
        createdAt: new Date().toLocaleString('zh-CN').replace(/\//g, '-'),
      })
      activeMonth.value = formMonth.value
      message.success('目标创建成功')
    }

    modalSaving.value = false
    showModal.value = false

    nextTick(() => {
      if (progressView.value === 'bar') {
        initChart()
      }
    })
  }, 500)
}

// ============== 完成率计算 ==============
const today = new Date().getDate()

function getDaysOfMonth(month: string): number {
  const [y, m] = month.split('-')
  return new Date(parseInt(y), parseInt(m), 0).getDate()
}

// 模拟本月实际营收
const mockDailyRevenue = computed(() => {
  const target = activeTarget.value
  if (!target) return []
  const days = getDaysOfMonth(activeMonth.value)
  return Array.from({ length: days }, (_, i) => {
    const dayTarget = target.dailies[i] || 0
    if (i + 1 < today) {
      return Math.round(dayTarget * (0.5 + Math.random() * 0.9))
    } else if (i + 1 === today) {
      return Math.round(dayTarget * (Math.random() * 0.75))
    }
    return 0
  })
})

const monthlyAchieved = computed(() => mockDailyRevenue.value.reduce((s, v) => s + v, 0))

const monthlyRate = computed(() => {
  const t = activeTarget.value
  if (!t || !t.amount) return 0
  return Math.min((monthlyAchieved.value / t.amount) * 100, 100)
})

const todayTarget = computed(() => {
  const t = activeTarget.value
  return t?.dailies?.[today - 1] || 0
})
const todayRevenue = computed(() => mockDailyRevenue.value[today - 1] || 0)
const todayRate = computed(() => {
  if (!todayTarget.value) return 0
  return Math.min((todayRevenue.value / todayTarget.value) * 100, 100)
})

const remainingDays = computed(() => {
  return Math.max(getDaysOfMonth(activeMonth.value) - today, 0)
})

// ============== 图表 ==============
const progressView = ref<'bar' | 'table'>('bar')
const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

function initChart() {
  if (!chartRef.value) return
  if (chartInstance) chartInstance.dispose()
  chartInstance = echarts.init(chartRef.value)
  renderChart()
}

function renderChart() {
  if (!chartInstance) return
  const target = activeTarget.value
  if (!target) return

  const days = getDaysOfMonth(activeMonth.value)
  const dates = Array.from({ length: days }, (_, i) => `${i + 1}日`)
  const targetsData = target.dailies.slice(0, days)
  const actualsData = mockDailyRevenue.value

  chartInstance.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const idx = params[0]?.dataIndex ?? 0
        const t = targetsData[idx]
        const a = actualsData[idx]
        const rate = t > 0 ? ((a / t) * 100).toFixed(1) : '--'
        return `<b>${idx + 1}日</b><br/>
          📌 目标：¥${t.toLocaleString()}<br/>
          📊 实际：¥${a.toLocaleString()}<br/>
          🎯 完成率：${rate}%`
      },
    },
    legend: { data: ['目标', '实际营收'], top: 0 },
    grid: { left: 12, right: 12, top: 36, bottom: 8, containLabel: true },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: { fontSize: 11, color: '#6B7280' },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 11, color: '#6B7280',
        formatter: (v: number) => v >= 10000 ? `${(v / 10000).toFixed(1)}w` : `${v}`,
      },
      splitLine: { lineStyle: { color: '#F0F2F5', type: 'dashed' } },
    },
    series: [
      {
        name: '目标', type: 'bar', data: targetsData,
        itemStyle: { color: '#93C5FD', borderRadius: [4, 4, 0, 0] },
        barWidth: 16, z: 1,
      },
      {
        name: '实际营收', type: 'bar', data: actualsData,
        itemStyle: {
          color: (params: any) => {
            const t = targetsData[params.dataIndex]
            const a = actualsData[params.dataIndex]
            return t > 0 && a >= t ? '#10B981' : '#3B82F6'
          },
          borderRadius: [4, 4, 0, 0],
        },
        barWidth: 16, z: 2,
      },
    ],
  })
}

// 每日详情表格
const detailTableColumns = [
  { title: '日期', key: 'date', width: 80 },
  { title: '目标(¥)', key: 'target', width: 120 },
  { title: '实际(¥)', key: 'actual', width: 120 },
  {
    title: '完成率', key: 'rate', width: 120,
    render: (row: any) => {
      const color = row.rate >= 100 ? '#10B981' : row.rate >= 70 ? '#3B82F6' : '#EF4444'
      return h('span', { style: { color, fontWeight: 600 } }, `${row.rate.toFixed(1)}%`)
    },
  },
  {
    title: '达成', key: 'status', width: 80,
    render: (row: any) => {
      if (row.isFuture) return h('span', { style: { color: '#D1D5DB' } }, '未到')
      if (row.rate >= 100) return h('span', { style: { color: '#10B981', fontWeight: 600 } }, '✓ 达成')
      return h('span', { style: { color: '#F59E0B' } }, '差 ¥' + row.gap)
    },
  },
]

const detailTableData = computed(() => {
  const target = activeTarget.value
  if (!target) return []
  const days = getDaysOfMonth(activeMonth.value)
  const now = new Date()
  const curDay = (now.getFullYear() === parseInt(activeMonth.value.split('-')[0]) &&
    now.getMonth() + 1 === parseInt(activeMonth.value.split('-')[1]))
    ? now.getDate() : 0
  return Array.from({ length: days }, (_, i) => {
    const t = target.dailies[i] || 0
    const a = mockDailyRevenue.value[i] || 0
    const rate = t > 0 ? (a / t) * 100 : 0
    const isFuture = curDay > 0 && i + 1 > curDay
    const gap = t > 0 ? Math.max(t - a, 0).toLocaleString() : '0'
    return { date: `${i + 1}日`, target: t.toLocaleString(), actual: a.toLocaleString(), rate, isFuture, gap }
  })
})

watch(activeMonth, () => {
  nextTick(() => {
    if (progressView.value === 'bar') initChart()
  })
})

onMounted(() => {
  nextTick(() => {
    if (progressView.value === 'bar') initChart()
  })
})

window.addEventListener('resize', () => chartInstance?.resize())
</script>

<style scoped>
.page-container { padding: 24px; }

.page-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 24px;
}

.page-header h2 { margin: 0; font-size: 22px; font-weight: 700; color: #1F2937; }

/* 通用卡片 */
.section-card {
  background: #fff; border-radius: 12px; padding: 24px;
  margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.section-title {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 20px; font-size: 16px; font-weight: 600; color: #1F2937;
}

.title-bar { display: inline-block; width: 3px; height: 16px; background: #3B82F6; border-radius: 2px; }

.section-sub { font-size: 13px; font-weight: 400; color: #9CA3AF; margin-left: 4px; }

.header-actions { margin-left: auto; display: flex; gap: 8px; }

/* 列表选中行 */
:deep(.row-selected td) { background: #EFF6FF !important; }

/* ===== Modal 内容 ===== */
.modal-row {
  display: flex; align-items: flex-end; gap: 20px;
  margin-bottom: 24px; flex-wrap: wrap;
}

.modal-field { display: flex; flex-direction: column; gap: 6px; }

.field-label { font-size: 13px; color: #6B7280; font-weight: 500; }

.modal-daily-section {
  border-top: 1px solid #F0F2F5; padding-top: 16px;
}

.modal-daily-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 14px;
}

.daily-actions { display: flex; align-items: center; gap: 8px; }

.batch-label { font-size: 13px; color: #6B7280; }

.daily-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 10px;
}

.daily-item {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 10px; background: #F9FAFB; border-radius: 8px;
}

.day-label { font-size: 13px; font-weight: 500; color: #6B7280; min-width: 40px; }

.modal-footer { display: flex; justify-content: flex-end; gap: 12px; }

/* ===== 完成率看板 ===== */
.completion-cards {
  display: grid; grid-template-columns: 2fr 1fr; gap: 20px;
  margin-bottom: 24px;
}

.completion-card {
  display: flex; align-items: center; gap: 24px;
  padding: 24px; border-radius: 12px;
}

.completion-card.monthly { background: linear-gradient(135deg, #EFF6FF 0%, #F5F3FF 100%); }
.completion-card.daily { background: linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%); }

.completion-ring { position: relative; width: 120px; height: 120px; flex-shrink: 0; }
.completion-ring.small { width: 100px; height: 100px; }
.completion-ring svg { width: 100%; height: 100%; }

.ring-text {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%); text-align: center;
  display: flex; flex-direction: column; align-items: center;
}

.ring-rate { font-size: 26px; font-weight: 700; color: #1F2937; line-height: 1.2; }
.ring-rate.small { font-size: 22px; }
.ring-label { font-size: 12px; color: #6B7280; white-space: nowrap; }

.completion-detail { flex: 1; display: flex; flex-direction: column; gap: 10px; }

.detail-row { display: flex; justify-content: space-between; align-items: center; }
.detail-label { font-size: 13px; color: #6B7280; }
.detail-value { font-size: 15px; font-weight: 600; color: #1F2937; }
.detail-value.achieved { color: #3B82F6; }
.detail-row.remaining .detail-value { color: #F59E0B; }

/* ===== 图表 ===== */
.chart-section { border-top: 1px solid #F0F2F5; padding-top: 20px; }
.chart-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px; font-size: 14px; font-weight: 600; color: #374151;
}
.chart-container { width: 100%; height: 360px; }
.target-table { margin-top: 4px; }

@media (max-width: 900px) {
  .completion-cards { grid-template-columns: 1fr; }
}
</style>
