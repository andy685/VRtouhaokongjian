<template>
  <div class="page-container animate-fade-in">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>次数调整有效期查询</h2>
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
        :scroll-x="1600"
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
          <n-form-item label="门店">
            <n-select placeholder="请选择门店" :options="storeOptions" clearable />
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
  { label: '卓远亚运城店', value: '1' },
  { label: '卓远天河店', value: '2' },
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
    width: 140,
  },
  {
    title: '手机号',
    key: 'phone',
    width: 130,
  },
  {
    title: '发生门店',
    key: 'storeName',
    width: 120,
  },
  {
    title: '调整类型',
    key: 'adjustType',
    width: 115,
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
    width: 110,
  },
  {
    title: '新生效日期',
    key: 'newEffectiveDate',
    width: 110,
  },
  {
    title: '原过期日期',
    key: 'oldExpireDate',
    width: 110,
  },
  {
    title: '新过期日期',
    key: 'newExpireDate',
    width: 110,
  },
  {
    title: '涉及次数',
    key: 'times',
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
    minWidth: 180,
    ellipsis: { tooltip: true },
  },
]

// 示例数据
const tableData = ref([
  {
    id: 1,
    member: '奥特曼 (29)',
    phone: '13903019429',
    storeName: '卓远亚运城店',
    adjustType: 'extend',
    oldEffectiveDate: '2024-11-05',
    newEffectiveDate: '2024-11-05',
    oldExpireDate: '2024-11-11',
    newExpireDate: '2024-12-31',
    times: 1,
    operator: '张三',
    adjustTime: '2026-04-22 14:32:15',
    remark: '客户投诉，补偿延长',
  },
  {
    id: 2,
    member: '奥特曼 (29)',
    phone: '13903019429',
    storeName: '卓远亚运城店',
    adjustType: 'extend',
    oldEffectiveDate: '2024-11-05',
    newEffectiveDate: '2024-11-05',
    oldExpireDate: '2024-12-31',
    newExpireDate: '2025-06-30',
    times: 1,
    operator: '李四',
    adjustTime: '2026-04-22 16:20:33',
    remark: '赠送活动：年末活动顺延送1次',
  },
  {
    id: 3,
    member: '奥特曼 (29)',
    phone: '13903019429',
    storeName: '卓远亚运城店',
    adjustType: 'reset',
    oldEffectiveDate: '2024-11-05',
    newEffectiveDate: '2024-11-01',
    oldExpireDate: '2024-11-30',
    newExpireDate: '2025-03-01',
    times: 3,
    operator: '王五',
    adjustTime: '2026-04-21 11:08:45',
    remark: '充值套餐：100元3次(11月30日到期) - 重新设定',
  },
  {
    id: 4,
    member: '奥特曼 (29)',
    phone: '13903019429',
    storeName: '卓远亚运城店',
    adjustType: 'reset',
    oldEffectiveDate: '2024-11-05',
    newEffectiveDate: '2024-11-05',
    oldExpireDate: '2024-12-04',
    newExpireDate: '2025-02-28',
    times: 3,
    operator: '张三',
    adjustTime: '2026-04-20 09:55:12',
    remark: '充值套餐：100元3次(30天有效) - 延长至3个月',
  },
  {
    id: 5,
    member: '张十三 (99)',
    phone: '3612368799',
    storeName: '卓远天河店',
    adjustType: 'extend',
    oldEffectiveDate: '2024-11-05',
    newEffectiveDate: '2024-11-05',
    oldExpireDate: '永久有效',
    newExpireDate: '永久有效',
    times: 1,
    operator: '李四',
    adjustTime: '2026-04-19 13:42:28',
    remark: '赠送活动：永久有效，确认无误',
  },
  {
    id: 6,
    member: '李二 (136)',
    phone: '13612345621',
    storeName: '卓远天河店',
    adjustType: 'clear',
    oldEffectiveDate: '2024-08-15',
    newEffectiveDate: '--',
    oldExpireDate: '2024-10-15',
    newExpireDate: '--',
    times: 5,
    operator: '王五',
    adjustTime: '2026-04-18 10:18:56',
    remark: '账户异常，管理员手动清空',
  },
  {
    id: 7,
    member: '阮颖慧 (88)',
    phone: '15801121122',
    storeName: '卓远亚运城店',
    adjustType: 'shorten',
    oldEffectiveDate: '2024-09-01',
    newEffectiveDate: '2024-09-01',
    oldExpireDate: '2025-03-01',
    newExpireDate: '2024-12-01',
    times: 10,
    operator: '张三',
    adjustTime: '2026-04-17 15:27:40',
    remark: '系统修正，原设置有误',
  },
  {
    id: 8,
    member: 'syfrdhgo (77)',
    phone: '17709909900',
    storeName: '卓远天河店',
    adjustType: 'extend',
    oldEffectiveDate: '2024-07-01',
    newEffectiveDate: '2024-07-01',
    oldExpireDate: '2024-10-01',
    newExpireDate: '2025-01-01',
    times: 3,
    operator: '李四',
    adjustTime: '2026-04-16 08:35:22',
    remark: '系统批量调整+3个月',
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
