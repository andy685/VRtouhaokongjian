<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>积分任务</h1>
        <p class="header-desc">配置会员完成充值或消费后获得的积分奖励</p>
      </div>
    </div>

    <n-alert type="info" :bordered="false" class="notice">
      仅支付成功的充值订单和已完成的消费订单参与奖励；充值订单只使用“充值奖励”，消费订单只使用“消费奖励”。
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
          <n-input v-model:value="form.name" disabled />
        </n-form-item>
        <n-form-item label="任务类型">
          <n-radio-group v-model:value="form.type" disabled>
            <n-space>
              <n-radio value="recharge">充值送积分</n-radio>
              <n-radio value="consumption">消费送积分</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="奖励方式">
          <n-radio-group v-model:value="form.rewardMode">
            <n-space>
              <n-radio value="amount">按金额</n-radio>
              <n-radio value="count">按次数</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item v-if="form.rewardMode === 'amount'" label="金额兑换比例">
          <n-input-number v-model:value="form.amountUnit" :min="0.01" :precision="2" style="width: 220px">
            <template #suffix>元 = {{ form.pointsPerUnit }} 积分</template>
          </n-input-number>
        </n-form-item>
        <n-form-item v-if="form.rewardMode === 'amount'" label="每日上限">
          <n-input-number v-model:value="form.dailyLimit" :min="0" :precision="0" style="width: 220px">
            <template #suffix>积分</template>
          </n-input-number>
        </n-form-item>
        <n-form-item v-if="form.rewardMode === 'count'" label="每次奖励积分">
          <n-input-number v-model:value="form.pointsPerAction" :min="0" :precision="0" style="width: 220px">
            <template #suffix>积分 / 次</template>
          </n-input-number>
        </n-form-item>
        <n-form-item v-if="form.rewardMode === 'count'" label="每日上限">
          <n-input-number v-model:value="form.dailyLimit" :min="0" :precision="0" style="width: 220px">
            <template #suffix>次</template>
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
  NAlert, NButton, NCard, NDataTable, NForm, NFormItem, NInput,
  NInputNumber, NModal, NRadio, NRadioGroup, NSpace, NSwitch, NTag, useMessage,
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'

type TaskType = 'recharge' | 'consumption'
type RewardMode = 'amount' | 'count'
interface PointTask {
  id: number
  name: string
  type: TaskType
  rewardMode: RewardMode
  amountUnit: number
  pointsPerUnit: number
  pointsPerAction: number
  dailyLimit: number
  enabled: boolean
  updatedAt: string
}

const message = useMessage()
const showModal = ref(false)
const editingId = ref<number | null>(null)
const form = ref({
  name: '', type: 'recharge' as TaskType, rewardMode: 'amount' as RewardMode,
  amountUnit: 10, pointsPerUnit: 1, pointsPerAction: 10, dailyLimit: 1000,
  enabled: true,
})

const tasks = ref<PointTask[]>([
  { id: 1, name: '充值奖励', type: 'recharge', rewardMode: 'amount', amountUnit: 10, pointsPerUnit: 1, pointsPerAction: 20, dailyLimit: 1000, enabled: true, updatedAt: '2026-04-20 10:30' },
  { id: 2, name: '消费奖励', type: 'consumption', rewardMode: 'amount', amountUnit: 10, pointsPerUnit: 1, pointsPerAction: 10, dailyLimit: 500, enabled: true, updatedAt: '2026-04-20 10:30' },
])

const enabledCount = computed(() => tasks.value.filter(task => task.enabled).length)
const modalTitle = computed(() => editingId.value ? '编辑积分任务' : '新增积分任务')

const columns: DataTableColumns<PointTask> = [
  { title: '任务名称', key: 'name', width: 150 },
  { title: '任务类型', key: 'type', width: 120, render: row => row.type === 'recharge' ? '充值送积分' : '消费送积分' },
  { title: '奖励方式', key: 'rewardMode', width: 100, render: row => row.rewardMode === 'amount' ? '按金额' : '按次数' },
  { title: '奖励规则', key: 'rewardRule', width: 180, render: row => row.rewardMode === 'amount' ? `${row.amountUnit} 元 = ${row.pointsPerUnit} 积分` : `每次 ${row.pointsPerAction} 积分` },
  { title: '每日上限', key: 'dailyLimit', width: 110, render: row => row.rewardMode === 'amount' ? `${row.dailyLimit.toLocaleString()} 积分` : `${row.dailyLimit} 次` },
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
  form.value = { name: task.name, type: task.type, rewardMode: task.rewardMode, amountUnit: task.amountUnit, pointsPerUnit: task.pointsPerUnit, pointsPerAction: task.pointsPerAction, dailyLimit: task.dailyLimit, enabled: task.enabled }
  showModal.value = true
}

function saveTask() {
  if (!form.value.name.trim()) {
    message.warning('请输入任务名称')
    return
  }
  const data = { ...form.value, updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '-') }
  const index = tasks.value.findIndex(task => task.id === editingId.value)
  if (index >= 0) tasks.value[index] = { ...tasks.value[index], ...data }
  message.success('任务已更新')
  showModal.value = false
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
