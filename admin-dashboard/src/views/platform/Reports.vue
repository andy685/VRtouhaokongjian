<template>
  <div class="page-container">
    <div class="page-header">
      <h1>数据报表</h1>
      <n-space>
        <n-date-picker type="daterange" clearable size="small" v-model:value="dateRange" />
        <n-button secondary size="small" @click="exportData">
          <template #icon><n-icon :component="DownloadOutline" /></template> 导出Excel
        </n-button>
      </n-space>
    </div>

    <!-- 运营日报表 -->
    <div class="data-table">
      <n-data-table :columns="columns" :data="tableData" :pagination="{ pageSize: 15 }" striped size="small" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NButton, NSpace, NIcon, NDatePicker, NDataTable } from 'naive-ui'
import { DownloadOutline } from '@vicons/ionicons5'

const dateRange = ref(null)

const columns = [
  { title: '日期', key: 'date', width: 100, fixed: 'left' as const },
  { title: '游戏豆销售', key: 'revenue', render: (row: any) => `¥${row.revenue.toLocaleString()}` },
  { title: '游戏豆消耗', key: 'consume', render: (row: any) => row.consume.toLocaleString() },
  { title: '活跃门店', key: 'activeStores' },
  { title: '新增商家', key: 'newMerchants' },
  { title: '新增门店', key: 'newStores' },
  { title: '新增会员', key: 'newMembers' },
  { title: '设备在线率', key: 'deviceRate', render: (row: any) => `${row.deviceRate}%` },
]

const tableData = ref([
  { date: '2026-05-11', revenue: 89010, consume: 68500, activeStores: 142, newMerchants: 1, newStores: 2, newMembers: 186, deviceRate: 93.5 },
  { date: '2026-05-10', revenue: 92880, consume: 71200, activeStores: 148, newMerchants: 2, newStores: 3, newMembers: 205, deviceRate: 92.1 },
  { date: '2026-05-09', revenue: 62260, consume: 48500, activeStores: 126, newMerchants: 1, newStores: 2, newMembers: 98, deviceRate: 91.8 },
  { date: '2026-05-08', revenue: 81340, consume: 63500, activeStores: 138, newMerchants: 3, newStores: 4, newMembers: 178, deviceRate: 93.2 },
  { date: '2026-05-07', revenue: 68960, consume: 52800, activeStores: 131, newMerchants: 0, newStores: 1, newMembers: 132, deviceRate: 92.5 },
  { date: '2026-05-06', revenue: 77230, consume: 59600, activeStores: 135, newMerchants: 1, newStores: 2, newMembers: 145, deviceRate: 93.8 },
  { date: '2026-05-05', revenue: 86580, consume: 66800, activeStores: 140, newMerchants: 2, newStores: 3, newMembers: 168, deviceRate: 94.2 },
  { date: '2026-05-04', revenue: 75600, consume: 58200, activeStores: 128, newMerchants: 0, newStores: 1, newMembers: 112, deviceRate: 91.2 },
  { date: '2026-05-03', revenue: 68120, consume: 51200, activeStores: 120, newMerchants: 1, newStores: 2, newMembers: 95, deviceRate: 90.8 },
  { date: '2026-05-02', revenue: 58450, consume: 43500, activeStores: 115, newMerchants: 0, newStores: 0, newMembers: 78, deviceRate: 89.5 },
  { date: '2026-05-01', revenue: 72300, consume: 55800, activeStores: 132, newMerchants: 2, newStores: 3, newMembers: 156, deviceRate: 92.8 },
  { date: '2026-04-30', revenue: 79800, consume: 61500, activeStores: 136, newMerchants: 1, newStores: 2, newMembers: 142, deviceRate: 93.1 },
  { date: '2026-04-29', revenue: 82300, consume: 63800, activeStores: 139, newMerchants: 3, newStores: 4, newMembers: 185, deviceRate: 93.6 },
  { date: '2026-04-28', revenue: 76500, consume: 58900, activeStores: 134, newMerchants: 1, newStores: 1, newMembers: 128, deviceRate: 92.3 },
  { date: '2026-04-27', revenue: 72300, consume: 55200, activeStores: 130, newMerchants: 0, newStores: 2, newMembers: 108, deviceRate: 91.5 },
])

function exportData() { console.log('导出Excel') }
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { font-size: 20px; font-weight: 600; margin: 0; }
.data-table { background: white; border-radius: 16px; padding: 22px; border: 1px solid var(--border-color); }
</style>
