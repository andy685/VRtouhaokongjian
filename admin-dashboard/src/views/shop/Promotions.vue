<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>促销活动</h1>
      <n-space>
        <n-input placeholder="搜索活动名称..." size="small" style="width: 180px;">
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
        <n-button type="primary" @click="showAddModal = true">+ 创建活动</n-button>
      </n-space>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="FlameOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">进行中</span>
          <span class="value">3</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="EyeOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">参与人数</span>
          <span class="value success">856</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="CardOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">带动消费</span>
          <span class="value">¥28,600</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
          <n-icon :component="TrendingUpOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">转化率</span>
          <span class="value">12.8%</span>
        </div>
      </div>
    </div>

    <!-- 活动列表 -->
    <n-card class="table-card">
      <n-tabs type="line" v-model:value="activeTab">
        <n-tab name="all">全部</n-tab>
        <n-tab name="time">限时促销</n-tab>
        <n-tab name="member">会员专享</n-tab>
      </n-tabs>
      <n-data-table :columns="columns" :data="tableData" :pagination="pagination" />
    </n-card>

    <!-- 创建活动弹窗 -->
    <n-modal v-model:show="showAddModal" preset="card" title="创建促销活动" style="width: 600px;">
      <n-form :model="formData" label-placement="top">
        <n-form-item label="活动名称">
          <n-input v-model:value="formData.name" placeholder="如：周末限时特惠" />
        </n-form-item>
        <n-form-item label="活动类型">
          <n-select v-model:value="formData.type" :options="typeOptions" />
        </n-form-item>
        <n-form-item label="促销内容">
          <n-input v-model:value="formData.content" type="textarea" placeholder="描述活动内容..." />
        </n-form-item>
        <n-grid :cols="2" :x-gap="16">
          <n-gi>
            <n-form-item label="开始时间">
              <n-date-picker v-model:value="formData.startTime" type="datetime" style="width: 100%;" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="结束时间">
              <n-date-picker v-model:value="formData.endTime" type="datetime" style="width: 100%;" />
            </n-form-item>
          </n-gi>
        </n-grid>
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
  NFormItem, NSwitch, NTabs, NTab, NGrid, NGi, NTag, NDropdown,
  NDatePicker, NSelect
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import {
  SearchOutline, FlameOutline, EyeOutline, CardOutline,
  TrendingUpOutline, EllipsisHorizontalOutline
} from '@vicons/ionicons5'

const activeTab = ref('all')
const showAddModal = ref(false)
const formData = ref({
  name: '', type: 'time', content: '', startTime: null, endTime: null, status: true
})
const typeOptions = [
  { label: '限时促销', value: 'time' },
  { label: '会员专享', value: 'member' },
  { label: '节日活动', value: 'holiday' }
]
const pagination = { pageSize: 10 }

const columns: DataTableColumns = [
  { title: '活动名称', key: 'name', width: 200 },
  { title: '类型', key: 'type', width: 120, render: (row) => row.type === 'time' ? '限时促销' : row.type === 'member' ? '会员专享' : '节日活动' },
  { title: '参与人数', key: 'participants', width: 120 },
  { title: '带动消费', key: 'revenue', width: 120, render: (row) => `¥${row.revenue}` },
  { title: '转化率', key: 'rate', width: 100 },
  { title: '有效期', key: 'dateRange', width: 180, render: (row) => `${row.startDate} ~ ${row.endDate}` },
  { title: '状态', key: 'status', width: 100, render: (row) =>
    h(NTag, { type: row.status === 'active' ? 'success' : row.status === 'pending' ? 'info' : 'default', size: 'small' },
      { default: () => row.status === 'active' ? '进行中' : row.status === 'pending' ? '未开始' : '已结束' })
  },
  { title: '操作', key: 'actions', width: 100, render: () =>
    h(NButton, { quaternary: true, circle: true },
      { icon: () => h(NIcon, { component: EllipsisHorizontalOutline }) })
  }
]

const tableData = ref([
  { id: 1, name: '周末限时特惠', type: 'time', participants: 356, revenue: 12800, rate: '15.2%', startDate: '2026-04-01', endDate: '2026-04-30', status: 'active' },
  { id: 2, name: '会员日专享', type: 'member', participants: 280, revenue: 9200, rate: '12.8%', startDate: '2026-04-15', endDate: '2026-04-30', status: 'active' },
  { id: 3, name: '五一黄金周', type: 'holiday', participants: 520, revenue: 28600, rate: '18.5%', startDate: '2026-05-01', endDate: '2026-05-07', status: 'pending' },
  { id: 4, name: '春节特惠周', type: 'holiday', participants: 680, revenue: 35200, rate: '22.1%', startDate: '2026-01-25', endDate: '2026-02-05', status: 'ended' },
])

function handleSubmit() {
  showAddModal.value = false
}
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { font-size: 20px; font-weight: 600; color: #333; margin: 0; }
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: #fff; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-content { display: flex; flex-direction: column; gap: 4px; }
.stat-content .label { font-size: 13px; color: #666; }
.stat-content .value { font-size: 24px; font-weight: 600; color: #333; }
.stat-content .value.success { color: #10B981; }
.table-card { border-radius: 12px; }
</style>
