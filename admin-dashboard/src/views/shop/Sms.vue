<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>短信服务</h1>
      <n-button type="primary" size="small" @click="router.push('/shop/sms/create')">
        <template #icon><n-icon :component="AddOutline" /></template>
        添加发送任务
      </n-button>
    </div>

    <!-- 提示信息 -->
    <n-alert type="info" :show-icon="false" style="margin-bottom: 20px; background: #f0f9ff; border: none;">
      <n-icon :component="InformationCircleOutline" style="color: #3B82F6; margin-right: 6px;" />
      短信服务，具体费用请见【添加发送任务】页面，短信发送前请先确保账户运营金额充足，扣费时先扣取，短信发送失败会返还
    </n-alert>

    <!-- 筛选区域 -->
    <n-card class="filter-card" style="margin-bottom: 20px;">
      <n-space align="center" :wrap="true" :size="12">
        <n-input v-model:value="searchFilters.name" placeholder="任务名称" size="small" clearable style="width: 160px;" />
        <n-select v-model:value="searchFilters.title" :options="templateOptions" placeholder="短信模板" size="small" clearable style="width: 160px;" />
        <n-select v-model:value="searchFilters.status" :options="statusOptions" placeholder="状态" size="small" clearable style="width: 120px;" />
        <n-date-picker v-model:value="searchFilters.execDateRange" type="daterange" clearable placeholder="执行时间" size="small" style="width: 240px;" />
        <n-button size="small" @click="resetFilters">重置</n-button>
      </n-space>
    </n-card>

    <!-- 任务列表 -->
    <n-card class="table-card">
      <n-data-table :columns="columns" :data="filteredTableData" :pagination="pagination" />
    </n-card>

    <!-- 任务详情弹窗 -->
    <n-modal v-model:show="showDetailModal" preset="card" title="任务详情" style="width: 600px;">
      <n-descriptions :column="1" bordered size="small">
        <n-descriptions-item label="任务名称">{{ currentRow?.name }}</n-descriptions-item>
        <n-descriptions-item label="短信标题">{{ currentRow?.title }}</n-descriptions-item>
        <n-descriptions-item label="短信内容">{{ currentRow?.content }}</n-descriptions-item>
        <n-descriptions-item label="发送号码数">{{ currentRow?.count }}</n-descriptions-item>
        <n-descriptions-item label="执行时间">{{ currentRow?.execTime }}</n-descriptions-item>
        <n-descriptions-item label="状态">
          <n-tag :type="currentRow?.status === 'ended' ? 'success' : 'info'" size="small">
            {{ currentRow?.status === 'ended' ? '已结束' : '执行中' }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="创建时间">{{ currentRow?.createTime }}</n-descriptions-item>
      </n-descriptions>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useRouter } from 'vue-router'
import {
  NCard, NDataTable, NButton, NSpace, NInput, NIcon, NModal, NTag,
  NSelect, NDatePicker, NAlert, NDescriptions, NDescriptionsItem
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import {
  AddOutline, InformationCircleOutline
} from '@vicons/ionicons5'

const router = useRouter()

const showDetailModal = ref(false)
const currentRow = ref<any>(null)

// 列表筛选条件
const searchFilters = ref({
  name: '',
  title: null,
  status: null,
  execDateRange: null
})

const statusOptions = [
  { label: '执行中', value: 'running' },
  { label: '已结束', value: 'ended' }
]

const filteredTableData = computed(() => {
  return tableData.value.filter(row => {
    if (searchFilters.value.name && !row.name.includes(searchFilters.value.name)) return false
    if (searchFilters.value.title && row.title !== searchFilters.value.title) return false
    if (searchFilters.value.status && row.status !== searchFilters.value.status) return false
    if (searchFilters.value.execDateRange && searchFilters.value.execDateRange.length === 2) {
      const [start, end] = searchFilters.value.execDateRange
      const execTimestamp = new Date(row.execTime).getTime()
      if (execTimestamp < start || execTimestamp > end) return false
    }
    return true
  })
})

function resetFilters() {
  searchFilters.value = {
    name: '',
    title: null,
    status: null,
    execDateRange: null
  }
}

const templateOptions = [
  { label: '520活动', value: '520活动' },
  { label: '520店庆', value: '520店庆' },
  { label: '优惠活动', value: '优惠活动' },
  { label: '生日祝福', value: '生日祝福' }
]

const pagination = { pageSize: 10 }

function showTaskDetail(row: any) {
  currentRow.value = row
  showDetailModal.value = true
}

function showSendDetail(row: any) {
  console.log('发送详情', row)
}

const columns: DataTableColumns = [
  { title: '任务名称', key: 'name', width: 120 },
  { title: '短信模板', key: 'title', width: 150 },
  { title: '发送号码数', key: 'count', width: 110 },
  { title: '执行时间', key: 'execTime', width: 170 },
  { title: '状态', key: 'status', width: 100, render: (row) =>
    h(NTag, {
      type: row.status === 'ended' ? 'success' : 'info',
      size: 'small',
      style: row.status === 'running' ? 'background: #3B82F6; color: #fff; border: none;' : undefined
    }, { default: () => row.status === 'ended' ? '已结束' : '执行中' })
  },
  { title: '创建时间', key: 'createTime', width: 170 },
  { title: '操作', key: 'actions', width: 140, render: (row) => h('div', {
    style: 'display: flex; flex-direction: column; gap: 4px;'
  }, [
    h(NButton, { text: true, type: 'primary', size: 'tiny', onClick: () => showTaskDetail(row) }, { default: () => '任务详情' }),
    h(NButton, { text: true, type: 'primary', size: 'tiny', onClick: () => showSendDetail(row) }, { default: () => '发送详情' })
  ]) }
]

const tableData = ref([
  { id: 1, name: '11', title: '520活动', count: 1, execTime: '2023-05-16 15:52', status: 'running', createTime: '2023-05-16 14:24', content: '520活动短信内容' },
  { id: 2, name: '22', title: '520店庆', count: 1, execTime: '2023-05-16 14:26', status: 'ended', createTime: '2023-05-16 14:20', content: '520店庆短信内容' },
  { id: 3, name: '短信', title: '520店庆', count: 2, execTime: '2023-05-16 14:17', status: 'ended', createTime: '2023-05-16 14:17', content: '520店庆短信内容' },
  { id: 4, name: '111', title: '优惠活动', count: 1, execTime: '2023-05-16 10:17', status: 'ended', createTime: '2023-05-16 10:17', content: '优惠活动短信内容' },
  { id: 5, name: '+c8+', title: '', count: 1, execTime: '2023-04-27 15:48', status: 'ended', createTime: '2023-04-27 15:48', content: '' },
  { id: 6, name: '1', title: '', count: 1, execTime: '2023-04-12 16:29', status: 'ended', createTime: '2023-04-12 16:29', content: '' }
])
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-header h1 { font-size: 18px; font-weight: 600; color: #333; margin: 0; }
.table-card { border-radius: 8px; }
</style>
