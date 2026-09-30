<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>积分任务</h1>
        <p class="header-desc">配置会员完成一次性、日常与节日任务后获得的积分奖励</p>
      </div>
      <n-space>
        <n-button secondary @click="openCreateSingle">新增单条对象任务</n-button>
      </n-space>
    </div>

    <n-alert type="info" :bordered="false" class="notice">
      每条对象任务单独配置一个游戏或大空间对象；充值金额、消费门槛、天数、积分和活动周期等也按单条任务配置。
    </n-alert>
    <div class="ordering-hint"><strong>固定分组顺序：</strong>一次性任务 → 日常任务 → 节日任务。同类有多条任务时，才显示“拖动”按钮供组内排序。</div>

    <div class="summary-row">
      <div class="summary-card">
        <span>启用任务</span>
        <strong>{{ enabledCount }}</strong>
      </div>
      <div class="summary-card">
        <span>今日发放积分</span>
        <strong>12,860</strong>
      </div>
      <div class="summary-card">
        <span>本月发放积分</span>
        <strong>286,540</strong>
      </div>
    </div>

    <n-card :bordered="false">
      <n-data-table :columns="columns" :data="orderedTasks" :row-props="taskRowProps" :pagination="false" :single-line="false" />
    </n-card>

    <n-modal v-model:show="showModal" preset="card" :title="modalTitle" style="width: min(620px, calc(100vw - 32px)); max-height: calc(100vh - 48px); overflow-y: auto" :bordered="false">
      <n-form label-placement="left" label-width="110">
        <n-form-item label="任务名称">
          <n-input v-model:value="form.name" :disabled="form.key !== 'winter_campaign' && (form.key !== 'object_target' || editingId === null)" placeholder="请输入任务名称" />
        </n-form-item>
        <n-form-item label="任务分类">
          <n-select v-if="form.key === 'object_target'" v-model:value="form.category" :options="objectTaskCategoryOptions" />
          <n-input v-else :value="categoryLabel(form.category)" disabled />
        </n-form-item>
        <n-form-item label="任务描述">
          <n-input :value="buildDescription(form)" type="textarea" :rows="2" disabled />
        </n-form-item>
        <template v-if="form.key === 'object_target'">
          <n-form-item label="任务对象类型">
            <n-select v-model:value="form.objectType" :options="objectTypeOptions" @update:value="changeSingleObjectType" />
          </n-form-item>
          <n-form-item label="指定对象">
            <n-select v-model:value="form.objectName" filterable tag :options="singleTargetOptions" :placeholder="'搜索或输入' + objectTypeLabel(form.objectType || 'game')" />
          </n-form-item>
          <n-form-item v-if="form.category === 'festival'" label="活动时间">
            <n-date-picker v-model:value="form.activityRange" type="daterange" clearable style="width: 320px" />
          </n-form-item>
        </template>
        <n-form-item v-if="form.key === 'rookie_first_recharge'" label="首充金额">
          <n-input-number v-model:value="form.rechargeAmount" :min="0" :precision="0" style="width: 220px">
            <template #suffix>元</template>
          </n-input-number>
        </n-form-item>
        <n-form-item v-if="form.key === 'rookie_first_recharge'" label="消费门槛">
          <n-input-number v-model:value="form.consumeAmount" :min="0" :precision="0" style="width: 220px">
            <template #suffix>元</template>
          </n-input-number>
        </n-form-item>
        <n-form-item v-if="form.key === 'continuous_cruise'" label="连续天数">
          <n-input-number v-model:value="form.continuousDays" :min="1" :precision="0" style="width: 220px">
            <template #suffix>天</template>
          </n-input-number>
        </n-form-item>
        <n-form-item v-if="form.key === 'ace_route' || form.key === 'paituo_coop'" label="指定游戏">
          <n-select v-model:value="form.gameName" filterable tag :options="gameOptions" placeholder="搜索或选择指定游戏" style="width: 320px" />
        </n-form-item>
        <n-form-item v-if="form.key === 'winter_campaign'" label="活动时间">
          <n-date-picker v-model:value="form.activityRange" type="daterange" clearable style="width: 320px" />
        </n-form-item>
        <n-form-item v-if="form.key === 'winter_campaign'" label="积分倍率">
          <n-input-number v-model:value="form.multiplier" :min="1" :precision="1" style="width: 220px">
            <template #suffix>倍</template>
          </n-input-number>
        </n-form-item>
        <n-form-item v-if="form.key !== 'winter_campaign'" label="奖励积分">
          <n-input-number v-model:value="form.rewardPoints" :min="0" :precision="0" style="width: 220px">
            <template #suffix>积分</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="任务状态">
          <n-switch v-model:value="form.enabled" />
          <span class="switch-tip">{{ form.enabled ? '启用中' : '已停用' }}</span>
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" @click="saveTask">保存</n-button>
        </n-space>
      </template>
    </n-modal>

  </div>
</template>

<script setup lang="ts">
import { computed, h, ref } from 'vue'
import {
  NAlert, NButton, NCard, NDatePicker, NForm, NFormItem, NInput,
  NInputNumber, NModal, NSelect, NSpace, NSwitch, NTag, useMessage,
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'

type TaskCategory = 'once' | 'daily' | 'festival'
type ObjectTaskType = 'game' | 'large_space'
type TaskKey = 'rookie_first_recharge' | 'continuous_cruise' | 'ace_route' | 'paituo_coop' | 'winter_campaign' | 'object_target'
interface PointTask {
  id: number
  key: TaskKey
  name: string
  category: TaskCategory
  rechargeAmount?: number
  consumeAmount?: number
  continuousDays?: number
  gameName?: string
  objectType?: ObjectTaskType
  objectName?: string
  rewardPoints?: number
  multiplier?: number
  activityRange?: [number, number] | null
  enabled: boolean
  updatedAt: string
}
const message = useMessage()
const showModal = ref(false)
const editingId = ref<number | null>(null)
const form = ref<PointTask>(emptyTask())
const POINT_TASKS_STORAGE_KEY = 'platform:points-task-config'

const tasks = ref<PointTask[]>(loadTasks())

function defaultTasks(): PointTask[] {
  return [
  { id: 1, key: 'rookie_first_recharge', name: '新兵入伍礼', category: 'once', rechargeAmount: 100, consumeAmount: 30, rewardPoints: 500, enabled: true, updatedAt: '2026-09-21 10:30' },
  { id: 2, key: 'continuous_cruise', name: '连续巡航', category: 'daily', continuousDays: 2, rewardPoints: 200, enabled: true, updatedAt: '2026-09-21 10:30' },
  { id: 3, key: 'ace_route', name: '王牌航线', category: 'daily', gameName: '星际营救', rewardPoints: 150, enabled: true, updatedAt: '2026-09-21 10:30' },
  { id: 4, key: 'object_target', name: '派托合作任务', category: 'daily', objectType: 'large_space', objectName: '派托大空间', rewardPoints: 150, enabled: true, updatedAt: '2026-09-21 10:30' },
  { id: 5, key: 'winter_campaign', name: '冬日作战月', category: 'festival', multiplier: 2, activityRange: [new Date(2026, 11, 1).getTime(), new Date(2026, 11, 31).getTime()], enabled: true, updatedAt: '2026-09-21 10:30' },
  ]
}

function loadTasks(): PointTask[] {
  const raw = localStorage.getItem(POINT_TASKS_STORAGE_KEY)
  if (!raw) return defaultTasks()
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return defaultTasks()
    const tasks = (parsed as Array<{ key?: string; objectType?: string; name?: string }>).filter(task => !(task.key === 'object_target' && task.objectType === 'integration')) as PointTask[]
    let needsSave = tasks.length !== parsed.length
    const normalized = tasks.map(task => {
      if (task.key === 'object_target' && task.name.includes(' · ')) {
        needsSave = true
        return { ...task, name: objectTaskName(task.objectType || 'game') }
      }
      return task
    })
    if (needsSave) localStorage.setItem(POINT_TASKS_STORAGE_KEY, JSON.stringify(normalized))
    return normalized.length ? normalized : defaultTasks()
  } catch {
    return defaultTasks()
  }
}

function persistTasks() {
  localStorage.setItem(POINT_TASKS_STORAGE_KEY, JSON.stringify(tasks.value))
}

const gameOptions = [
  { label: '星际营救', value: '星际营救' },
  { label: '奇幻赛车', value: '奇幻赛车' },
  { label: '深海探险', value: '深海探险' },
  { label: '恐龙岛求生', value: '恐龙岛求生' },
]
const largeSpaceOptions = [
  { label: '派托大空间', value: '派托大空间' },
]
const objectTypeOptions = [
  { label: '指定游戏', value: 'game' },
  { label: '大空间', value: 'large_space' },
]
const objectTaskCategoryOptions = [
  { label: '日常任务', value: 'daily' },
  { label: '节日任务', value: 'festival' },
]

const enabledCount = computed(() => tasks.value.filter(task => task.enabled).length)
const orderedTasks = computed(() => {
  const priority: Record<TaskCategory, number> = { once: 0, daily: 1, festival: 2 }
  return tasks.value
    .map((task, index) => ({ task, index }))
    .sort((a, b) => priority[a.task.category] - priority[b.task.category] || a.index - b.index)
    .map(({ task }) => task)
})
const modalTitle = computed(() => editingId.value ? '编辑积分任务' : '新增单条对象任务')
const singleTargetOptions = computed(() => targetOptions(form.value.objectType || 'game'))
const draggedTaskId = ref<number | null>(null)
const dragOverTaskId = ref<number | null>(null)

const columns: DataTableColumns<PointTask> = [
  {
    title: '同组拖动', key: 'dragHandle', width: 104, sorter: false,
    render: row => renderDragHandle(row),
  },
  { title: '任务名称', key: 'name', width: 150, sorter: false },
  { title: '任务分类', key: 'category', width: 110, sorter: false, render: row => categoryLabel(row.category) },
  { title: '任务描述', key: 'description', minWidth: 360, sorter: false, render: row => buildDescription(row) },
  { title: '奖励配置', key: 'reward', width: 150, sorter: false, render: row => rewardSummary(row) },
  {
    title: '状态', key: 'enabled', width: 90, sorter: false, render: row => h(NTag, {
      size: 'small', bordered: false, type: row.enabled ? 'success' : 'default',
    }, () => row.enabled ? '启用' : '停用'),
  },
  { title: '更新时间', key: 'updatedAt', width: 150, sorter: false },
  {
    title: '操作', key: 'action', width: 100,
    render: row => h(NButton, { size: 'tiny', text: true, type: 'primary', onClick: () => openEdit(row) }, () => '编辑'),
  },
]

function renderDragHandle(task: PointTask) {
  const groupSize = orderedTasks.value.filter(item => item.category === task.category).length
  if (groupSize < 2) return h('span', { class: 'drag-unavailable', 'aria-label': '同类任务只有一条，暂时无需排序' }, '—')
  return h('button', {
    type: 'button',
    class: 'drag-handle',
    draggable: true,
    title: '拖动调整顺序，也可用方向键微调',
    'aria-label': `调整${task.name}顺序`,
    onDragstart: (event: DragEvent) => startTaskDrag(event, task),
    onDragend: finishTaskDrag,
    onKeydown: (event: KeyboardEvent) => handleReorderKey(event, task),
    onClick: (event: MouseEvent) => event.stopPropagation(),
  }, [h('span', { class: 'drag-grip', 'aria-hidden': 'true' }, '⠿'), h('span', { class: 'drag-label' }, '拖动')])
}

function startTaskDrag(event: DragEvent, task: PointTask) {
  draggedTaskId.value = task.id
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(task.id))
  }
}

function finishTaskDrag() {
  draggedTaskId.value = null
  dragOverTaskId.value = null
}

function taskRowProps(task: PointTask) {
  const firstInCategory = orderedTasks.value.find(item => item.category === task.category)?.id === task.id
  const rowClasses = [
    firstInCategory ? 'task-category-start' : '',
    dragOverTaskId.value === task.id ? 'task-drop-target' : '',
  ].filter(Boolean).join(' ')
  return {
    class: rowClasses || undefined,
    onDragover: (event: DragEvent) => {
      const source = tasks.value.find(item => item.id === draggedTaskId.value)
      if (!source || source.id === task.id || source.category !== task.category) return
      event.preventDefault()
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
      dragOverTaskId.value = task.id
    },
    onDragleave: (event: DragEvent) => {
      const currentTarget = event.currentTarget as HTMLElement
      if (event.relatedTarget instanceof Node && currentTarget.contains(event.relatedTarget)) return
      if (dragOverTaskId.value === task.id) dragOverTaskId.value = null
    },
    onDrop: (event: DragEvent) => {
      event.preventDefault()
      const sourceId = draggedTaskId.value
      const source = tasks.value.find(item => item.id === sourceId)
      if (!source || source.category !== task.category) return finishTaskDrag()
      const row = event.currentTarget as HTMLElement
      const placeAfter = event.clientY > row.getBoundingClientRect().top + row.getBoundingClientRect().height / 2
      reorderTaskWithinCategory(source.id, task.id, placeAfter)
      finishTaskDrag()
    },
  }
}

function handleReorderKey(event: KeyboardEvent, task: PointTask) {
  if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
  event.preventDefault()
  const group = orderedTasks.value.filter(item => item.category === task.category)
  const index = group.findIndex(item => item.id === task.id)
  const target = group[index + (event.key === 'ArrowUp' ? -1 : 1)]
  if (target) reorderTaskWithinCategory(task.id, target.id, event.key === 'ArrowDown')
}

function reorderTaskWithinCategory(sourceId: number, targetId: number, placeAfter = false) {
  if (sourceId === targetId) return
  const source = tasks.value.find(task => task.id === sourceId)
  const target = tasks.value.find(task => task.id === targetId)
  if (!source || !target || source.category !== target.category) return

  const group = tasks.value.filter(task => task.category === source.category)
  const sourceIndex = group.findIndex(task => task.id === sourceId)
  const [moving] = group.splice(sourceIndex, 1)
  const targetIndex = group.findIndex(task => task.id === targetId)
  group.splice(targetIndex + (placeAfter ? 1 : 0), 0, moving)

  let groupIndex = 0
  tasks.value = tasks.value.map(task => task.category === source.category ? group[groupIndex++] : task)
  persistTasks()
}

function openCreateSingle() {
  editingId.value = null
  form.value = emptyTask()
  showModal.value = true
}

function openEdit(task: PointTask) {
  editingId.value = task.id
  form.value = { ...task }
  showModal.value = true
}

function saveTask() {
  if (!form.value.name.trim()) {
    message.warning('请输入任务名称')
    return
  }
  if ((form.value.key === 'ace_route' || form.value.key === 'paituo_coop') && !form.value.gameName?.trim()) {
    message.warning('请输入指定游戏名称')
    return
  }
  if (form.value.key === 'object_target' && !form.value.objectName?.trim()) {
    message.warning('请选择或输入任务对象')
    return
  }
  if (form.value.key === 'object_target' && form.value.category === 'festival' && !form.value.activityRange) {
    message.warning('请选择节日任务的活动时间')
    return
  }
  const data = { ...form.value, updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-') }
  const index = tasks.value.findIndex(task => task.id === editingId.value)
  if (index >= 0) {
    tasks.value[index] = { ...tasks.value[index], ...data }
    message.success('任务已更新')
  } else {
    tasks.value.unshift({ ...data, id: Date.now() })
    message.success('已创建 1 条独立任务')
  }
  persistTasks()
  showModal.value = false
}

function emptyTask(): PointTask {
  return { id: 0, key: 'object_target', name: objectTaskName('game'), category: 'daily', objectType: 'game', objectName: '', rewardPoints: 150, enabled: true, updatedAt: '' }
}
function targetOptions(type: ObjectTaskType) {
  return type === 'game' ? gameOptions : largeSpaceOptions
}
function objectTypeLabel(type: ObjectTaskType) {
  return type === 'game' ? '指定游戏' : '大空间'
}
function objectTaskName(type: ObjectTaskType) {
  return type === 'game' ? '王牌航线' : '派托合作任务'
}
function changeSingleObjectType(type: ObjectTaskType) {
  form.value.objectType = type
  form.value.objectName = ''
  form.value.name = objectTaskName(type)
}
function categoryLabel(category: TaskCategory) {
  return category === 'once' ? '一次性任务' : category === 'daily' ? '日常任务' : '节日任务'
}
function buildDescription(task: PointTask) {
  if (task.key === 'rookie_first_recharge') return `注册当天充值满 ${task.rechargeAmount ?? 0} 元，且游戏点播消费满 ${task.consumeAmount ?? 0} 元。`
  if (task.key === 'continuous_cruise') return `同一家店连续 ${task.continuousDays ?? 0} 天点播游戏`
  if (task.key === 'ace_route') return `点播“${task.gameName || 'xxx'}”游戏（每日计 1 次）`
  if (task.key === 'paituo_coop') return `点播“${task.gameName || 'xxx'}”游戏的大空间多人局（每日计 1 次）`
  if (task.key === 'object_target') {
    const objectName = task.objectName || '待指定对象'
    const activity = task.category === 'festival' && task.activityRange
      ? `活动期间 ${formatDate(task.activityRange[0])} 至 ${formatDate(task.activityRange[1])}，`
      : ''
    const action = task.objectType === 'large_space'
      ? `在“大空间：${objectName}”完成一次多人体验`
      : `点播指定游戏“${objectName}”1 局`
    return `${activity}${action}（${task.category === 'daily' ? '每日计 1 次' : '活动期内计 1 次'}）`
  }
  return `活动期间所有积分获取 ×${task.multiplier ?? 1}`
}
function rewardSummary(task: PointTask) {
  if (task.key === 'winter_campaign') return `积分 ×${task.multiplier ?? 1}`
  return `${task.rewardPoints ?? 0} 积分`
}
function formatDate(value: number) {
  const date = new Date(value)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.page-header h1 { margin: 0; color: #1f2937; font-size: 20px; }
.header-desc { margin: 6px 0 0; color: #8b95a5; font-size: 13px; }
.notice { margin-bottom: 16px; }
.summary-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
.summary-card { padding: 16px 18px; background: #fff; border: 1px solid #edf0f5; border-radius: 6px; }
.summary-card span { display: block; color: #8b95a5; font-size: 13px; }
.summary-card strong { display: block; margin-top: 8px; color: #2563eb; font-size: 24px; }
.switch-tip { margin-left: 10px; color: #8b95a5; font-size: 12px; }
.ordering-hint { margin: 0 0 12px; padding: 10px 14px; border: 1px solid #dbeafe; border-radius: 8px; background: #f8fbff; color: #475569; font-size: 13px; }
.ordering-hint strong { color: #1e3a8a; }
.drag-handle { display: inline-flex; align-items: center; justify-content: center; gap: 5px; min-width: 82px; min-height: 32px; padding: 0 8px; border: 1px solid #cbd5e1; border-radius: 6px; background: #fff; color: #475569; cursor: grab; font-size: 12px; }
.drag-handle:hover { border-color: #60a5fa; background: #eff6ff; color: #1d4ed8; }
.drag-handle:active { cursor: grabbing; }
.drag-handle:focus-visible { outline: 2px solid #2563eb; outline-offset: 2px; }
.drag-unavailable { color: #cbd5e1; }
:deep(.task-category-start td) { border-top: 2px solid #cbd5e1; }
:deep(.task-drop-target td) { box-shadow: inset 0 2px 0 #3b82f6; }
@media (max-width: 760px) { .summary-row { grid-template-columns: 1fr; } }
</style>
