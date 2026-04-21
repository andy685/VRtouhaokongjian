<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>优惠券管理</h1>
      <n-space>
        <n-input placeholder="搜索优惠券名称..." size="small" style="width: 180px;">
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
        <n-button type="primary" @click="showAddModal = true">+ 创建优惠券</n-button>
      </n-space>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="TicketOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">活动中</span>
          <span class="value">5</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="DownloadOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">已领取</span>
          <span class="value success">1,286</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="CheckmarkCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">已使用</span>
          <span class="value">856</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #EF4444, #DC2626);">
          <n-icon :component="PricetagsOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">优惠金额</span>
          <span class="value">¥8,560</span>
        </div>
      </div>
    </div>

    <!-- 优惠券列表 -->
    <n-card class="table-card">
      <n-tabs type="line" v-model:value="activeTab">
        <n-tab name="active">进行中</n-tab>
        <n-tab name="pending">未开始</n-tab>
        <n-tab name="ended">已结束</n-tab>
      </n-tabs>
      <n-data-table :columns="columns" :data="tableData" :pagination="pagination" />
    </n-card>

    <!-- 创建优惠券弹窗 -->
    <n-modal v-model:show="showAddModal" preset="card" title="创建优惠券" style="width: 560px;">
      <n-form :model="formData" label-placement="top">
        <n-form-item label="优惠券名称">
          <n-input v-model:value="formData.name" placeholder="如：新人专享券" />
        </n-form-item>
        <n-grid :cols="2" :x-gap="16">
          <n-gi>
            <n-form-item label="优惠类型">
              <n-select v-model:value="formData.type" :options="typeOptions" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="优惠金额">
              <n-input-number v-model:value="formData.value" :min="1" style="width: 100%;">
                <template #prefix>¥</template>
              </n-input-number>
            </n-form-item>
          </n-gi>
        </n-grid>
        <n-form-item label="使用门槛">
          <n-input placeholder="满X元可用">
            <template #prefix>满</template>
            <template #suffix>元</template>
          </n-input>
        </n-form-item>
        <n-grid :cols="2" :x-gap="16">
          <n-gi>
            <n-form-item label="发放数量">
              <n-input-number v-model:value="formData.total" :min="1" style="width: 100%;" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="每人限领">
              <n-input-number v-model:value="formData.limit" :min="1" style="width: 100%;" />
            </n-form-item>
          </n-gi>
        </n-grid>
        <n-form-item label="有效期">
          <n-date-picker v-model:value="formData.dateRange" type="daterange" style="width: 100%;" />
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
  NFormItem, NInputNumber, NTabs, NTab, NGrid, NGi, NTag, NDropdown,
  NDatePicker, NSelect
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import {
  SearchOutline, TicketOutline, DownloadOutline, CheckmarkCircleOutline,
  PricetagsOutline, EllipsisHorizontalOutline
} from '@vicons/ionicons5'

const activeTab = ref('active')
const showAddModal = ref(false)
const formData = ref({
  name: '', type: 'discount', value: 10, threshold: 100, total: 100, limit: 1, dateRange: null
})
const typeOptions = [
  { label: '满减券', value: 'discount' },
  { label: '兑换券', value: 'exchange' }
]
const pagination = { pageSize: 10 }

const columns: DataTableColumns = [
  { title: '优惠券名称', key: 'name', width: 180 },
  { title: '类型', key: 'type', width: 100, render: (row) => row.type === 'discount' ? '满减券' : '兑换券' },
  { title: '优惠内容', key: 'value', width: 120, render: (row) => `¥${row.value}` },
  { title: '使用门槛', key: 'threshold', width: 120, render: (row) => `满${row.threshold}元` },
  { title: '已领/总量', key: 'claimed', width: 120, render: (row) => `${row.claimed}/${row.total}` },
  { title: '已使用', key: 'used', width: 100 },
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
  { id: 1, name: '新人专享券', type: 'discount', value: 20, threshold: 100, claimed: 520, total: 1000, used: 186, startDate: '2026-04-01', endDate: '2026-04-30', status: 'active' },
  { id: 2, name: '周末畅玩券', type: 'discount', value: 15, threshold: 80, claimed: 320, total: 500, used: 245, startDate: '2026-04-01', endDate: '2026-04-30', status: 'active' },
  { id: 3, name: '会员专享券', type: 'discount', value: 30, threshold: 150, claimed: 180, total: 300, used: 120, startDate: '2026-05-01', endDate: '2026-05-31', status: 'pending' },
  { id: 4, name: '节日特惠券', type: 'discount', value: 50, threshold: 200, claimed: 266, total: 200, used: 266, startDate: '2026-03-01', endDate: '2026-03-31', status: 'ended' },
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
