<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h2>会员等级</h2>
        <p class="header-desc">系统预设 5 个固定等级，名称和数量固定，可调整升级门槛和权益</p>
      </div>
      <n-button secondary @click="handleApply">
        <template #icon><n-icon :component="RefreshOutline" /></template>
        等级立刻生效
      </n-button>
    </div>

    <div class="table-wrapper">
      <n-data-table
        :columns="columns"
        :data="tableData"
        :pagination="false"
        :row-key="(row: any) => row.id"
        striped
        size="small"
        :scroll-x="900"
      />
    </div>

    <!-- 编辑弹窗 -->
    <n-modal v-model:show="showModal" preset="card" :title="`编辑 - ${editTarget?.displayName}`" style="width: 520px;" :bordered="false">
      <n-form ref="formRef" :model="formData" :rules="formRules" label-placement="left" :label-width="120">
        <n-form-item label="累计消费门槛" path="consumeAmount">
          <n-input-number v-model:value="formData.consumeAmount" :min="0" style="flex:1;">
            <template #prefix>¥</template>
          </n-input-number>
          <span class="form-hint">达到此消费金额自动升级</span>
        </n-form-item>
        <n-form-item label="消费折扣" path="consumeDiscount">
          <n-input-number v-model:value="formData.consumeDiscount" :min="0" :max="100" style="flex:1;">
            <template #suffix>%</template>
          </n-input-number>
          <span class="form-hint">如 85 表示 8.5 折</span>
        </n-form-item>
        <n-form-item label="游戏币兑换折扣" path="pointsDiscount">
          <n-input-number v-model:value="formData.pointsDiscount" :min="0" :max="100" style="flex:1;">
            <template #suffix>%</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="状态">
          <n-radio-group v-model:value="formData.status">
            <n-radio value="enabled">启用</n-radio>
            <n-radio value="disabled">禁用</n-radio>
          </n-radio-group>
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" @click="handleSubmit">保存</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import {
  NButton, NIcon, NDataTable, NTag,
  NModal, NForm, NFormItem, NInputNumber, NSpace,
  NRadioGroup, NRadio,
} from 'naive-ui'
import { RefreshOutline } from '@vicons/ionicons5'

const showModal = ref(false)
const formRef = ref()
const editTarget = ref<any>(null)

// 固定 5 个等级
const PRESET_LEVELS = [
  { id: 1, name: 'regular',    displayName: '普通会员', icon: '⭐', minConsume: 0,     color: '#999' },
  { id: 2, name: 'bronze',     displayName: '青铜会员', icon: '🥉', minConsume: 500,   color: '#CD7F32' },
  { id: 3, name: 'silver',     displayName: '白银会员', icon: '🥈', minConsume: 1000,  color: '#C0C0C0' },
  { id: 4, name: 'gold',       displayName: '黄金会员', icon: '🥇', minConsume: 3000,  color: '#FFD700' },
  { id: 5, name: 'diamond',    displayName: '钻石会员', icon: '💎', minConsume: 8000,  color: '#B9F2FF' },
]

const formData = ref({
  consumeAmount: 0,
  consumeDiscount: 100,
  pointsDiscount: 100,
  status: 'enabled',
})

const formRules = {
  consumeAmount: { required: true, type: 'number' as const, message: '请输入累计消费金额', trigger: 'blur' },
  consumeDiscount: { required: true, type: 'number' as const, message: '请输入消费折扣', trigger: 'blur' },
  pointsDiscount: { required: true, type: 'number' as const, message: '请输入游戏币兑换折扣', trigger: 'blur' },
}

const tableData = ref([
  { id: 1, name: 'regular',  consumeAmount: 0,    consumeDiscount: 100, pointsDiscount: 100, createTime: '2021-11-27 17:27', status: 'enabled' },
  { id: 2, name: 'bronze',   consumeAmount: 500,  consumeDiscount: 95,  pointsDiscount: 95,  createTime: '2021-11-27 17:27', status: 'enabled' },
  { id: 3, name: 'silver',   consumeAmount: 1000, consumeDiscount: 90,  pointsDiscount: 90,  createTime: '2021-11-27 17:26', status: 'enabled' },
  { id: 4, name: 'gold',     consumeAmount: 3000, consumeDiscount: 85,  pointsDiscount: 85,  createTime: '2021-11-27 17:25', status: 'enabled' },
  { id: 5, name: 'diamond',  consumeAmount: 8000, consumeDiscount: 80,  pointsDiscount: 80,  createTime: '2021-11-27 17:24', status: 'enabled' },
])

function getPreset(name: string) {
  return PRESET_LEVELS.find(p => p.name === name)!
}

const columns = [
  {
    title: '等级',
    key: 'name',
    width: 110,
    render(row: any) {
      const preset = getPreset(row.name)
      return h('span', { style: `font-size:14px;color:${preset.color};font-weight:600;` }, `${preset.icon} ${preset.displayName}`)
    },
  },
  {
    title: '累计消费门槛（¥）',
    key: 'consumeAmount',
    width: 160,
    render(row: any) {
      const preset = getPreset(row.name)
      return row.consumeAmount !== null ? `¥${row.consumeAmount.toLocaleString()}` : '¥0'
    },
  },
  {
    title: '消费折扣（%）',
    key: 'consumeDiscount',
    width: 130,
    render(row: any) {
      return row.consumeDiscount !== null ? `${row.consumeDiscount}%` : '100%'
    },
  },
  {
    title: '游戏币兑换折扣（%）',
    key: 'pointsDiscount',
    width: 160,
  },
  {
    title: '创建时间',
    key: 'createTime',
    width: 160,
  },
  {
    title: '状态',
    key: 'status',
    width: 70,
    align: 'center' as const,
    render(row: any) {
      return row.status === 'enabled'
        ? h(NTag, { type: 'success', size: 'small', bordered: false }, () => '启用')
        : h(NTag, { type: 'default', size: 'small', bordered: false }, () => '禁用')
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    render(row: any) {
      // 普通会员不可编辑门槛，其他可编辑
      if (row.name === 'regular') {
        return h('span', { style: 'color:#999;font-size:12px;' }, '默认等级')
      }
      return h(NButton, { size: 'tiny', quaternary: true, type: 'info', onClick: () => handleEdit(row) }, () => '编辑')
    },
  },
]

function handleEdit(row: any) {
  editTarget.value = row
  formData.value = {
    consumeAmount: row.consumeAmount,
    consumeDiscount: row.consumeDiscount,
    pointsDiscount: row.pointsDiscount,
    status: row.status || 'enabled',
  }
  showModal.value = true
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
    if (editTarget.value) {
      Object.assign(editTarget.value, { ...formData.value })
    }
    showModal.value = false
  } catch (_) {}
}

function handleApply() {
  // TODO: 调接口生效
}
</script>

<style scoped>
.page-container { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.page-header h2 { font-size: 18px; font-weight: 600; color: var(--text-primary); margin: 0 0 4px 0; }
.header-desc { font-size: 13px; color: #999; margin: 0; }
.table-wrapper { background: white; border-radius: 8px; border: 1px solid var(--border-color); }
.form-hint { margin-left: 10px; font-size: 12px; color: #999; white-space: nowrap; }
</style>
