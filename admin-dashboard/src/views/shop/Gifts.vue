<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>活动赠送</h1>
      <n-space>
        <n-input placeholder="搜索活动..." size="small" style="width: 180px;">
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
        <n-button type="primary" @click="showAddModal = true">+ 新建赠送</n-button>
      </n-space>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="GiftOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">进行中</span>
          <span class="value">2</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="PeopleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">已赠送</span>
          <span class="value success">586</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="CardOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">赠送金额</span>
          <span class="value">¥5,860</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
          <n-icon :component="PricetagOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">成本</span>
          <span class="value">¥2,340</span>
        </div>
      </div>
    </div>

    <!-- 活动列表 -->
    <n-card class="table-card">
      <n-data-table :columns="columns" :data="tableData" :pagination="pagination" />
    </n-card>

    <!-- 新建赠送弹窗 -->
    <n-modal v-model:show="showAddModal" preset="card" title="新建赠送活动" style="width: 560px;">
      <n-form :model="formData" label-placement="top">
        <n-form-item label="活动名称">
          <n-input v-model:value="formData.name" placeholder="如：消费满额赠" />
        </n-form-item>
        <n-form-item label="触发条件">
          <n-select v-model:value="formData.condition" :options="conditionOptions" />
        </n-form-item>
        <n-form-item label="消费门槛">
          <n-input-number v-model:value="formData.threshold" :min="0" style="width: 100%;">
            <template #prefix>满</template>
            <template #suffix>元</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="赠送内容">
          <n-grid :cols="2" :x-gap="16">
            <n-gi>
              <n-input-number v-model:value="formData.giftAmount" :min="0" placeholder="赠送金额">
                <template #prefix>¥</template>
              </n-input-number>
            </n-gi>
            <n-gi>
              <n-input-number v-model:value="formData.giftPoints" :min="0" placeholder="赠送积分" />
            </n-gi>
          </n-grid>
        </n-form-item>
        <n-form-item label="有效期">
          <n-input-number v-model:value="formData.validity" :min="1" style="width: 100%;">
            <template #suffix>天</template>
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
  NFormItem, NInputNumber, NSwitch, NGrid, NGi, NTag, NDropdown,
  NSelect
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import {
  SearchOutline, GiftOutline, PeopleOutline, CardOutline,
  PricetagOutline, EllipsisHorizontalOutline
} from '@vicons/ionicons5'

const showAddModal = ref(false)
const formData = ref({
  name: '', condition: 'consume', threshold: 100, giftAmount: 10, giftPoints: 100, validity: 30, status: true
})
const conditionOptions = [
  { label: '消费满额', value: 'consume' },
  { label: '充值金额', value: 'recharge' },
  { label: '办理套餐', value: 'package' }
]
const pagination = { pageSize: 10 }

const columns: DataTableColumns = [
  { title: '活动名称', key: 'name', width: 180 },
  { title: '触发条件', key: 'condition', width: 120, render: (row) => row.condition === 'consume' ? '消费满额' : row.condition === 'recharge' ? '充值金额' : '办理套餐' },
  { title: '门槛', key: 'threshold', width: 100, render: (row) => `¥${row.threshold}` },
  { title: '赠送金额', key: 'giftAmount', width: 120, render: (row) => `¥${row.giftAmount}` },
  { title: '赠送积分', key: 'giftPoints', width: 120 },
  { title: '有效期', key: 'validity', width: 100, render: (row) => `${row.validity}天` },
  { title: '已赠送', key: 'count', width: 100 },
  { title: '状态', key: 'status', width: 100, render: (row) =>
    h(NTag, { type: row.status ? 'success' : 'warning', size: 'small' },
      { default: () => row.status ? '启用' : '停用' })
  },
  { title: '操作', key: 'actions', width: 100, render: () =>
    h(NButton, { quaternary: true, circle: true },
      { icon: () => h(NIcon, { component: EllipsisHorizontalOutline }) })
  }
]

const tableData = ref([
  { id: 1, name: '消费满100赠10元', condition: 'consume', threshold: 100, giftAmount: 10, giftPoints: 100, validity: 30, count: 256, status: true },
  { id: 2, name: '充值满500赠50', condition: 'recharge', threshold: 500, giftAmount: 50, giftPoints: 500, validity: 60, count: 128, status: true },
  { id: 3, name: '办理套餐赠积分', condition: 'package', threshold: 0, giftAmount: 0, giftPoints: 200, validity: 30, count: 86, status: false },
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
