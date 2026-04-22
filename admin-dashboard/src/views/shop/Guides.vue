<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>导购管理</h1>
      <n-space>
        <n-input placeholder="搜索导购姓名..." size="small" style="width: 180px;">
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
        <n-button type="primary" @click="showAddModal = true">+ 添加导购</n-button>
      </n-space>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="PeopleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">导购总数</span>
          <span class="value">12</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="PersonAddOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">本月新增会员</span>
          <span class="value success">86</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="TrophyOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">本月业绩</span>
          <span class="value">¥28,600</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
          <n-icon :component="MedalOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">排行榜</span>
          <span class="value">TOP 1</span>
        </div>
      </div>
    </div>

    <!-- 导购列表 -->
    <n-card class="table-card">
      <n-data-table :columns="columns" :data="tableData" :pagination="pagination" />
    </n-card>

    <!-- 添加导购弹窗 -->
    <n-modal v-model:show="showAddModal" preset="card" title="添加导购" style="width: 480px;">
      <n-form :model="formData" label-placement="top">
        <n-form-item label="姓名">
          <n-input v-model:value="formData.name" placeholder="请输入姓名" />
        </n-form-item>
        <n-form-item label="手机号">
          <n-input v-model:value="formData.phone" placeholder="请输入手机号" />
        </n-form-item>
        <n-form-item label="工号">
          <n-input v-model:value="formData.employeeId" placeholder="请输入工号" />
        </n-form-item>
        <n-form-item label="状态">
          <n-switch v-model:value="formData.status" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showAddModal = false">取消</n-button>
          <n-button type="primary" @click="handleSubmit">确定添加</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import {
  NCard, NDataTable, NButton, NSpace, NInput, NIcon, NModal, NForm,
  NFormItem, NSwitch, NTag, NDropdown, NSelect
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import {
  SearchOutline, PeopleOutline, PersonAddOutline, TrophyOutline,
  MedalOutline, EllipsisHorizontalOutline, CallOutline
} from '@vicons/ionicons5'

const showAddModal = ref(false)
const formData = ref({ name: '', phone: '', employeeId: '', status: true })
const pagination = { pageSize: 10 }

const columns: DataTableColumns = [
  { title: '姓名', key: 'name', width: 120 },
  { title: '工号', key: 'employeeId', width: 100 },
  { title: '手机号', key: 'phone', width: 130 },
  { title: '本月新增', key: 'newMembers', width: 100 },
  { title: '本月业绩', key: 'performance', width: 120, render: (row) => `¥${row.performance}` },
  { title: '累计会员', key: 'totalMembers', width: 100 },
  { title: '排名', key: 'rank', width: 80, render: (row) =>
    h(NTag, { type: row.rank <= 3 ? 'error' : 'default', size: 'small' },
      { default: () => `TOP ${row.rank}` })
  },
  { title: '状态', key: 'status', width: 80, render: (row) =>
    h(NTag, { type: row.status ? 'success' : 'warning', size: 'small' },
      { default: () => row.status ? '在职' : '离职' })
  },
  { title: '操作', key: 'actions', width: 120, render: (row) =>
    h(NSpace, { size: 'small' },
      { default: () => [
        h(NButton, { size: 'small', text: true, type: 'primary' }, { default: () => '编辑' }),
        h(NButton, { size: 'small', text: true, circle: true },
          { icon: () => h(NIcon, { component: CallOutline }) })
      ]})
  }
]

const tableData = ref([
  { id: 1, name: '张三', employeeId: 'A001', phone: '13801231234', newMembers: 28, performance: 28600, totalMembers: 328, rank: 1, status: true },
  { id: 2, name: '李四', employeeId: 'A002', phone: '13905675678', newMembers: 22, performance: 22800, totalMembers: 286, rank: 2, status: true },
  { id: 3, name: '王五', employeeId: 'A003', phone: '13709019012', newMembers: 18, performance: 18600, totalMembers: 245, rank: 3, status: true },
  { id: 4, name: '赵六', employeeId: 'A004', phone: '13603453456', newMembers: 12, performance: 12500, totalMembers: 168, rank: 4, status: true },
  { id: 5, name: '钱七', employeeId: 'A005', phone: '13507897890', newMembers: 6, performance: 6800, totalMembers: 92, rank: 5, status: false },
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
