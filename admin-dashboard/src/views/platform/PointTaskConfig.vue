<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>积分任务</h1>
        <p class="header-desc">配置会员完成一次性、日常与节日任务后获得的积分奖励</p>
      </div>
    </div>

    <n-alert type="info" :bordered="false" class="notice">
      任务配置原则：涉及数值的内容可自定义，包括充值金额、消费金额、奖励积分、连续天数、指定游戏和奖励周期等；具体参数根据任务描述生成。
    </n-alert>

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
      <n-data-table :columns="columns" :data="tasks" :pagination="false" :single-line="false" />
    </n-card>

    <n-modal v-model:show="showModal" preset="card" :title="modalTitle" style="width: 620px" :bordered="false">
      <n-form label-placement="left" label-width="110">
        <n-form-item label="任务名称">
          <n-input v-model:value="form.name" :disabled="form.key !== 'winter_campaign'" />
        </n-form-item>
        <n-form-item label="任务分类">
          <n-input :value="categoryLabel(form.category)" disabled />
        </n-form-item>
        <n-form-item label="任务描述">
          <n-input :value="buildDescription(form)" type="textarea" :rows="2" disabled />
        </n-form-item>
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
  NAlert, NButton, NCard, NDataTable, NDatePicker, NForm, NFormItem, NInput,
  NInputNumber, NModal, NSelect, NSpace, NSwitch, NTag, useMessage,
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'

type TaskCategory = 'once' | 'daily' | 'festival'
type TaskKey = 'rookie_first_recharge' | 'continuous_cruise' | 'ace_route' | 'paituo_coop' | 'winter_campaign'
interface PointTask {
  id: number
  key: TaskKey
  name: string
  category: TaskCategory
  rechargeAmount?: number
  consumeAmount?: number
  continuousDays?: number
  gameName?: string
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

const tasks = ref<PointTask[]>([
  { id: 1, key: 'rookie_first_recharge', name: '新兵入伍礼', category: 'once', rechargeAmount: 100, consumeAmount: 30, rewardPoints: 500, enabled: true, updatedAt: '2026-09-21 10:30' },
  { id: 2, key: 'continuous_cruise', name: '连续巡航', category: 'daily', continuousDays: 2, rewardPoints: 200, enabled: true, updatedAt: '2026-09-21 10:30' },
  { id: 3, key: 'ace_route', name: '王牌航线', category: 'daily', gameName: '星际营救', rewardPoints: 150, enabled: true, updatedAt: '2026-09-21 10:30' },
  { id: 4, key: 'paituo_coop', name: '派托合作任务', category: 'daily', gameName: '派托大空间', rewardPoints: 150, enabled: true, updatedAt: '2026-09-21 10:30' },
  { id: 5, key: 'winter_campaign', name: '冬日作战月', category: 'festival', multiplier: 2, activityRange: [new Date(2026, 11, 1).getTime(), new Date(2026, 11, 31).getTime()], enabled: true, updatedAt: '2026-09-21 10:30' },
])

const gameOptions = [
  { label: '星际营救', value: '星际营救' },
  { label: '奇幻赛车', value: '奇幻赛车' },
  { label: '深海探险', value: '深海探险' },
  { label: '派托大空间', value: '派托大空间' },
  { label: '恐龙岛求生', value: '恐龙岛求生' },
]

const enabledCount = computed(() => tasks.value.filter(task => task.enabled).length)
const modalTitle = computed(() => editingId.value ? '编辑积分任务' : '新增积分任务')

const columns: DataTableColumns<PointTask> = [
  { title: '任务名称', key: 'name', width: 150 },
  { title: '任务分类', key: 'category', width: 110, render: row => categoryLabel(row.category) },
  { title: '任务描述', key: 'description', minWidth: 360, render: row => buildDescription(row) },
  { title: '奖励配置', key: 'reward', width: 150, render: row => rewardSummary(row) },
  {
    title: '状态', key: 'enabled', width: 90, render: row => h(NTag, {
      size: 'small', bordered: false, type: row.enabled ? 'success' : 'default',
    }, () => row.enabled ? '启用' : '停用'),
  },
  { title: '更新时间', key: 'updatedAt', width: 150 },
  {
    title: '操作', key: 'action', width: 100,
    render: row => h(NButton, { size: 'tiny', text: true, type: 'primary', onClick: () => openEdit(row) }, () => '编辑'),
  },
]

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
  const data = { ...form.value, updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-') }
  const index = tasks.value.findIndex(task => task.id === editingId.value)
  if (index >= 0) tasks.value[index] = { ...tasks.value[index], ...data }
  message.success('任务已更新')
  showModal.value = false
}

function emptyTask(): PointTask {
  return { id: 0, key: 'rookie_first_recharge', name: '', category: 'once', rewardPoints: 0, enabled: true, updatedAt: '' }
}
function categoryLabel(category: TaskCategory) {
  return category === 'once' ? '一次性任务' : category === 'daily' ? '日常任务' : '节日任务'
}
function buildDescription(task: PointTask) {
  if (task.key === 'rookie_first_recharge') return `注册当天充值满 ${task.rechargeAmount ?? 0} 元，且游戏点播消费满 ${task.consumeAmount ?? 0} 元。`
  if (task.key === 'continuous_cruise') return `同一家店连续 ${task.continuousDays ?? 0} 天点播游戏`
  if (task.key === 'ace_route') return `点播“${task.gameName || 'xxx'}”游戏（每日计 1 次）`
  if (task.key === 'paituo_coop') return `点播“${task.gameName || 'xxx'}”游戏的大空间多人局（每日计 1 次）`
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
@media (max-width: 760px) { .summary-row { grid-template-columns: 1fr; } }
</style>
