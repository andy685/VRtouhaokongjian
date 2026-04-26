<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>系统参数</h1>
    </div>

    <!-- 储值设置 -->
    <n-card class="settings-card">
      <template #header>
        <div class="card-title">储值设置</div>
      </template>

      <div class="section-title">储值扣费顺序</div>
      <n-button class="reset-btn" @click="resetOrder">
        重置为系统默认顺序
      </n-button>

      <n-data-table
        :columns="columns"
        :data="tableData"
        :bordered="false"
        :single-line="false"
        size="large"
        class="order-table"
      />
    </n-card>

    <!-- 保存按钮 -->
    <div class="actions">
      <n-button type="primary" size="large" @click="saveSettings">保存</n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import { NCard, NButton, NDataTable, NSpace, NIcon } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { MoveOutline } from '@vicons/ionicons5'

interface StorageItem {
  key: string
  type: string
  order: number
  remark: string
}

const columns: DataTableColumns<StorageItem> = [
  {
    title: '储值类型',
    key: 'type',
    align: 'center',
    width: 200,
  },
  {
    title: '扣费顺序（从上往下优先扣费）',
    key: 'order',
    align: 'center',
    render() {
      return h(NIcon, { component: MoveOutline, size: 20, style: 'color: #999; cursor: move;' })
    }
  },
  {
    title: '备注',
    key: 'remark',
    align: 'center',
  },
]

const defaultData: StorageItem[] = [
  { key: 'prepaid', type: '预存款', order: 1, remark: '' },
  { key: 'package', type: '套票', order: 2, remark: '扣费时优先扣先到期的套票' },
  { key: 'times', type: '预存次数', order: 3, remark: '扣费时优先扣先到期的次数（退款时先扣订单产生的次数，再扣先到期的次数）' },
  { key: 'coin', type: '游戏币', order: 4, remark: '扣费时优先扣先到期的游戏币（退款时先扣订单产生的游戏币，再扣先到期的游戏币）' },
]

const tableData = ref<StorageItem[]>([...defaultData])

function resetOrder() {
  tableData.value = [...defaultData]
}

function saveSettings() {
  console.log('保存储值扣费顺序', tableData.value)
}
</script>

<style scoped>
.page-container {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.settings-card {
  margin-bottom: 20px;
  border-radius: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.section-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
}

.reset-btn {
  margin-bottom: 16px;
  border-color: #d9d9d9;
  color: #666;
}

.order-table {
  margin-top: 8px;
}

.actions {
  display: flex;
  justify-content: flex-start;
  padding: 20px 0;
}
</style>
