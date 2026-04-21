<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>套票管理</h1>
      <n-space>
        <n-input placeholder="搜索套票名称..." size="small" style="width: 180px;">
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
        <n-button type="primary" @click="showAddModal = true">+ 新建套票</n-button>
      </n-space>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="TicketOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">在售套票</span>
          <span class="value">8</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="BagOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">本月销售</span>
          <span class="value success">156</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="CashOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">套票收入</span>
          <span class="value">¥28,600</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
          <n-icon :component="TimeOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">即将过期</span>
          <span class="value">12</span>
        </div>
      </div>
    </div>

    <!-- 套票列表 -->
    <n-card class="table-card">
      <n-tabs type="line" v-model:value="activeTab">
        <n-tab name="all">全部</n-tab>
        <n-tab name="time">计时票</n-tab>
        <n-tab name="count">计次票</n-tab>
      </n-tabs>
      <n-data-table :columns="columns" :data="tableData" :pagination="pagination" />
    </n-card>

    <!-- 新建套票弹窗 -->
    <n-modal v-model:show="showAddModal" preset="card" title="新建套票" style="width: 600px;">
      <n-form :model="formData" label-placement="top">
        <n-form-item label="套票名称">
          <n-input v-model:value="formData.name" placeholder="如：10次游戏卡" />
        </n-form-item>
        <n-grid :cols="2" :x-gap="16">
          <n-gi>
            <n-form-item label="套票类型">
              <n-select v-model:value="formData.type" :options="typeOptions" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="售价">
              <n-input-number v-model:value="formData.price" :min="0" style="width: 100%;">
                <template #prefix>¥</template>
              </n-input-number>
            </n-form-item>
          </n-gi>
        </n-grid>
        <n-grid :cols="2" :x-gap="16">
          <n-gi>
            <n-form-item label="时长/次数">
              <n-input-number v-model:value="formData.value" :min="1" style="width: 100%;" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="有效期">
              <n-input-number v-model:value="formData.validity" :min="1" style="width: 100%;">
                <template #suffix>天</template>
              </n-input-number>
            </n-form-item>
          </n-gi>
        </n-grid>
        <n-form-item label="适用设备">
          <n-checkbox-group v-model:value="formData.devices">
            <n-space>
              <n-checkbox value="vr" label="VR设备" />
              <n-checkbox value="screen" label="银幕互动" />
              <n-checkbox value="ar" label="AR体验" />
            </n-space>
          </n-checkbox-group>
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
  NFormItem, NInputNumber, NSwitch, NTabs, NTab, NGrid, NGi, NTag, NDropdown,
  NCheckbox, NCheckboxGroup, NSelect
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import {
  SearchOutline, TicketOutline, BagOutline, CashOutline,
  TimeOutline, EllipsisHorizontalOutline, TrashOutline
} from '@vicons/ionicons5'

const activeTab = ref('all')
const showAddModal = ref(false)
const formData = ref({
  name: '', type: 'time', price: 0, value: 1, validity: 30,
  devices: ['vr'], status: true
})
const typeOptions = [
  { label: '计时票', value: 'time' },
  { label: '计次票', value: 'count' }
]
const pagination = { pageSize: 10 }

const columns: DataTableColumns = [
  { title: '套票名称', key: 'name', width: 180 },
  { title: '类型', key: 'type', width: 100, render: (row) => row.type === 'time' ? '计时票' : '计次票' },
  { title: '时长/次数', key: 'value', width: 120, render: (row) => row.type === 'time' ? `${row.value}小时` : `${row.value}次` },
  { title: '售价', key: 'price', width: 100, render: (row) => `¥${row.price}` },
  { title: '有效期', key: 'validity', width: 100, render: (row) => `${row.validity}天` },
  { title: '已售', key: 'sold', width: 80 },
  { title: '状态', key: 'status', width: 100, render: (row) =>
    h(NTag, { type: row.status ? 'success' : 'warning', size: 'small' },
      { default: () => row.status ? '启用' : '停售' })
  },
  { title: '操作', key: 'actions', width: 100, render: () =>
    h(NButton, { quaternary: true, circle: true },
      { icon: () => h(NIcon, { component: EllipsisHorizontalOutline }) })
  }
]

const tableData = ref([
  { id: 1, name: '1小时体验票', type: 'time', value: 1, price: 68, validity: 30, sold: 520, status: true },
  { id: 2, name: '2小时畅玩票', type: 'time', value: 2, price: 118, validity: 30, sold: 380, status: true },
  { id: 3, name: '10次卡', type: 'count', value: 10, price: 580, validity: 180, sold: 156, status: true },
  { id: 4, name: '30次卡', type: 'count', value: 30, price: 1580, validity: 365, sold: 48, status: true },
  { id: 5, name: '亲子套票', type: 'time', value: 2, price: 198, validity: 30, sold: 86, status: false },
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
