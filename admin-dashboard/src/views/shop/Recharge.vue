<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>充值套餐</h1>
      <n-space>
        <n-input placeholder="搜索套餐名称..." size="small" style="width: 180px;">
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
        <n-button type="primary" @click="showAddModal = true">+ 新建套餐</n-button>
      </n-space>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="CardOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">在售套餐</span>
          <span class="value">12</span>
        </div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="TrendingUpOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">本月办理</span>
          <span class="value success">386</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="CashOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">套餐收入</span>
          <span class="value">¥45,280</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
          <n-icon :component="PeopleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">新增会员</span>
          <span class="value">52</span>
        </div>
      </div>
    </div>

    <!-- 套餐列表 -->
    <n-card class="table-card">
      <n-tabs type="line" v-model:value="activeTab">
        <n-tab name="active">启用中</n-tab>
        <n-tab name="paused">已暂停</n-tab>
        <n-tab name="all">全部</n-tab>
      </n-tabs>
      <n-data-table :columns="columns" :data="tableData" :pagination="pagination" />
    </n-card>

    <!-- 新建套餐弹窗 -->
    <n-modal v-model:show="showAddModal" preset="card" title="新建充值套餐" style="width: 560px;">
      <n-form :model="formData" label-placement="top">
        <n-form-item label="套餐名称">
          <n-input v-model:value="formData.name" placeholder="如：首次充值特惠" />
        </n-form-item>
        <n-grid :cols="2" :x-gap="16">
          <n-gi>
            <n-form-item label="充值金额">
              <n-input-number v-model:value="formData.amount" :min="0" placeholder="0.00">
                <template #prefix>¥</template>
              </n-input-number>
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="赠送金额">
              <n-input-number v-model:value="formData.bonus" :min="0" placeholder="0.00">
                <template #prefix>¥</template>
              </n-input-number>
            </n-form-item>
          </n-gi>
        </n-grid>
        <n-form-item label="赠送积分">
          <n-input-number v-model:value="formData.points" :min="0" placeholder="0" style="width: 100%;">
            <template #suffix>积分</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="状态">
          <n-switch v-model:value="formData.status" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showAddModal = false">取消</n-button>
          <n-button type="primary" @click="handleSubmit">确定创建</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import {
  NCard, NDataTable, NButton, NSpace, NInput, NIcon, NModal, NForm,
  NFormItem, NInputNumber, NSwitch, NTabs, NTab, NGrid, NGi, NTag, NDropdown
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import {
  SearchOutline, CardOutline, TrendingUpOutline, CashOutline,
  PeopleOutline, EllipsisHorizontalOutline, PauseOutline, PlayOutline, TrashOutline
} from '@vicons/ionicons5'

const activeTab = ref('active')
const showAddModal = ref(false)
const formData = ref({
  name: '', amount: 0, bonus: 0, points: 0, status: true
})

const pagination = { pageSize: 10 }

const columns: DataTableColumns = [
  { title: '套餐名称', key: 'name', width: 200 },
  { title: '充值金额', key: 'amount', width: 120, render: (row) => `¥${row.amount}` },
  { title: '赠送金额', key: 'bonus', width: 120, render: (row) => `¥${row.bonus}` },
  { title: '赠送积分', key: 'points', width: 100 },
  { title: '办理次数', key: 'count', width: 100 },
  { title: '状态', key: 'status', width: 100, render: (row) =>
    h(NTag, { type: row.status ? 'success' : 'warning', size: 'small' },
      { default: () => row.status ? '启用' : '暂停' })
  },
  { title: '操作', key: 'actions', width: 120, render: (row) => {
    const options = [
      { label: '编辑', key: 'edit' },
      { label: row.status ? '暂停' : '启用', key: 'toggle' },
      { type: 'divider', key: 'd1' },
      { label: '删除', key: 'delete' }
    ]
    return h(NDropdown, { options, onSelect: (key) => handleAction(key, row) },
      { default: () => h(NButton, { quaternary: true, circle: true },
        { icon: () => h(NIcon, { component: EllipsisHorizontalOutline }) })
      })
  }}
]

const tableData = ref([
  { id: 1, name: '首次充值特惠', amount: 100, bonus: 20, points: 200, count: 128, status: true },
  { id: 2, name: '月度会员卡', amount: 500, bonus: 80, points: 1000, count: 86, status: true },
  { id: 3, name: '季度会员卡', amount: 1200, bonus: 300, points: 3000, count: 42, status: true },
  { id: 4, name: '年度会员卡', amount: 3600, bonus: 1200, points: 10000, count: 18, status: true },
  { id: 5, name: '儿童专区卡', amount: 200, bonus: 30, points: 500, count: 65, status: false },
])

function handleAction(key: string, row: any) {
  console.log(key, row)
}

function handleSubmit() {
  console.log(formData.value)
  showAddModal.value = false
}
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { font-size: 20px; font-weight: 600; color: #333; margin: 0; }
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: #fff; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.stat-card.highlight { border: 1px solid #10B981; }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-content { display: flex; flex-direction: column; gap: 4px; }
.stat-content .label { font-size: 13px; color: #666; }
.stat-content .value { font-size: 24px; font-weight: 600; color: #333; }
.stat-content .value.success { color: #10B981; }
.table-card { border-radius: 12px; }
</style>
