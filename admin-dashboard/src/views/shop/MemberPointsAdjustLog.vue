<template>
  <div class="page-container animate-fade-in">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>游戏币调整有效期查询</h2>
      <n-button type="primary" @click="showFilterDrawer = true">
        <template #icon><n-icon :component="FilterOutline" /></template>
        筛选
      </n-button>
    </div>

    <!-- 数据表格 -->
    <div class="table-wrapper">
      <n-data-table
        :columns="columns"
        :data="tableData"
        :pagination="pagination"
        :row-key="(row: any) => row.id"
        striped
        size="small"
        :scroll-x="1400"
      />
    </div>

    <!-- 底部统计 -->
    <div class="page-footer">
      <span class="total-text">共 {{ tableData.length }} 条</span>
    </div>

    <!-- 筛选抽屉 -->
    <n-drawer v-model:show="showFilterDrawer" width="340" placement="right">
      <n-drawer-content title="筛选条件" closable>
        <n-form label-placement="left" :label-width="90">
          <n-form-item label="店铺">
            <n-select placeholder="请选择店铺" :options="storeOptions" clearable />
          </n-form-item>
          <n-form-item label="会员搜索">
            <n-input placeholder="姓名/手机号" />
          </n-form-item>
          <n-form-item label="调整类型">
            <n-select placeholder="请选择调整类型" :options="adjustTypeOptions" clearable />
          </n-form-item>
          <n-form-item label="操作人">
            <n-input placeholder="请输入操作人" />
          </n-form-item>
          <n-form-item label="调整时间起">
            <n-date-picker type="date" style="width: 100%;" clearable />
          </n-form-item>
          <n-form-item label="调整时间止">
            <n-date-picker type="date" style="width: 100%;" clearable />
          </n-form-item>
        </n-form>
        <template #footer>
          <n-button type="primary" block @click="handleSearch">搜索</n-button>
        </template>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import {
  NButton, NIcon, NDataTable, NTag,
  NDrawer, NDrawerContent, NForm, NFormItem, NSelect, NInput,
  NDatePicker,
} from 'naive-ui'
import { FilterOutline } from '@vicons/ionicons5'

const showFilterDrawer = ref(false)

const storeOptions = [
  { label: '和民轩小黑厅', value: '1' },
]

const adjustTypeOptions = [
  { label: '延长有效期', value: 'extend' },
  { label: '缩短有效期', value: 'shorten' },
  { label: '重新设定', value: 'reset' },
  { label: '手动清空', value: 'clear' },
]

const columns = [
  {
    title: '会员',
    key: 'member',
    width: 130,
  },
  {
    title: '手机号',
    key: 'phone',
    width: 130,
  },
  {
    title: '发生店铺',
    key: 'storeName',
    width: 110,
  },
  {
    title: '调整类型',
    key: 'adjustType',
    width: 110,
    render(row: any) {
      const map: Record<string, { text: string; type: string }> = {
        extend: { text: '延长有效期', type: 'success' },
        shorten: { text: '缩短有效期', type: 'warning' },
        reset: { text: '重新设定', type: 'info' },
        clear: { text: '手动清空', type: 'error' },
      }
      const item = map[row.adjustType]
      return h(NTag, { type: (item?.type || 'default') as any, size: 'small', bordered: false }, () => item?.text)
    }
  },
  {
    title: '原生效日期',
    key: 'oldEffectiveDate',
    width: 105,
  },
  {
    title: '新生效日期',
    key: 'newEffectiveDate',
    width: 105,
  },
  {
    title: '原过期日期',
    key: 'oldExpireDate',
    width: 105,
  },
  {
    title: '新过期日期',
    key: 'newExpireDate',
    width: 105,
  },
  {
    title: '涉及数量',
    key: 'amount',
    width: 80,
    align: 'center' as const,
  },
  {
    title: '操作人',
    key: 'operator',
    width: 80,
  },
  {
    title: '调整时间',
    key: 'adjustTime',
    width: 160,
  },
  {
    title: '备注',
    key: 'remark',
    minWidth: 160,
    ellipsis: { tooltip: true },
  },
]

// 示例数据
const tableData = ref([
  {
    id: 1,
    member: '妍妍 (9)',
    phone: '13905675678',
    storeName: '和民轩小黑厅',
    adjustType: 'extend',
    oldEffectiveDate: '2023-11-10',
    newEffectiveDate: '2023-11-10',
    oldExpireDate: '2024-01-31',
    newExpireDate: '2024-06-30',
    amount: 200,
    operator: '张三',
    adjustTime: '2026-04-20 14:32:15',
    remark: '客户投诉，补偿延长5个月',
  },
  {
    id: 2,
    member: '烂漫的痕迹重',
    phone: '13801231234',
    storeName: '和民轩小黑厅',
    adjustType: 'reset',
    oldEffectiveDate: '2023-08-14',
    newEffectiveDate: '2026-01-01',
    oldExpireDate: '',
    newExpireDate: '2027-01-01',
    amount: 0,
    operator: '李四',
    adjustTime: '2026-04-19 16:20:33',
    remark: '重新开通会员，设定一年有效期',
  },
  {
    id: 3,
    member: '阳恩',
    phone: '15903343344',
    storeName: '和民轩小黑厅',
    adjustType: 'extend',
    oldEffectiveDate: '2023-05-09',
    newEffectiveDate: '2023-05-09',
    oldExpireDate: '2024-12-31',
    newExpireDate: '2025-12-31',
    amount: 20000,
    operator: '王五',
    adjustTime: '2026-04-18 11:08:45',
    remark: 'VIP客户续费赠送一年有效期',
  },
  {
    id: 4,
    member: '张浩理',
    phone: '13507897890',
    storeName: '和民轩小黑厅',
    adjustType: 'shorten',
    oldEffectiveDate: '2023-08-09',
    newEffectiveDate: '2023-08-09',
    oldExpireDate: '2027-08-09',
    newExpireDate: '2025-08-09',
    amount: 20000,
    operator: '张三',
    adjustTime: '2026-04-17 09:55:12',
    remark: '系统修正，原设置有误',
  },
  {
    id: 5,
    member: '寂寞的雪山飞车',
    phone: '13603453456',
    storeName: '和民轩小黑厅',
    adjustType: 'clear',
    oldEffectiveDate: '2023-05-11',
    newEffectiveDate: '--',
    oldExpireDate: '2024-05-11',
    newExpireDate: '--',
    amount: 300,
    operator: '李四',
    adjustTime: '2026-04-15 13:42:28',
    remark: '账户异常，管理员手动清空',
  },
  {
    id: 6,
    member: '潇潇默潇',
    phone: '18807787788',
    storeName: '和民轩小黑厅',
    adjustType: 'extend',
    oldEffectiveDate: '2023-05-07',
    newEffectiveDate: '2023-05-07',
    oldExpireDate: '2024-03-31',
    newExpireDate: '2024-09-30',
    amount: 500,
    operator: '王五',
    adjustTime: '2026-04-14 10:18:56',
    remark: '活动奖励延期半年',
  },
  {
    id: 7,
    member: '阮颖慧',
    phone: '15801121122',
    storeName: '和民轩小黑厅',
    adjustType: 'reset',
    oldEffectiveDate: '2023-08-09',
    newEffectiveDate: '2026-02-01',
    oldExpireDate: '2025-08-09',
    newExpireDate: '2027-02-01',
    amount: 20000,
    operator: '张三',
    adjustTime: '2026-04-12 15:27:40',
    remark: '客户申请变更，重新设定有效期',
  },
  {
    id: 8,
    member: 'syfrdhgo',
    phone: '17709909900',
    storeName: '和民轩小黑厅',
    adjustType: 'extend',
    oldEffectiveDate: '2023-05-07',
    newEffectiveDate: '2023-05-07',
    oldExpireDate: '2024-01-31',
    newExpireDate: '2024-07-31',
    amount: 150,
    operator: '李四',
    adjustTime: '2026-04-10 08:35:22',
    remark: '系统批量调整+6个月',
  },
])

const pagination = ref({
  pageSize: 15,
  showSizePicker: false,
})

function handleSearch() {
  showFilterDrawer.value = false
}
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.table-wrapper {
  background: white;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.page-footer {
  display: flex;
  align-items: center;
  margin-top: 16px;
  gap: 12px;
}

.total-text {
  font-size: 13px;
  color: var(--text-muted);
  margin-left: auto;
}
</style>
