<template>
  <div class="page-container animate-fade-in">
    <!-- 成功提示（示例） -->
    <n-alert v-if="showSuccessTip" type="success" closable @close="showSuccessTip = false" style="margin-bottom: 16px;">
      调整有效期成功
    </n-alert>

    <!-- 页面标题 -->
    <div class="page-header">
      <h2>会员积分查询</h2>
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
        :checked-row-keys="checkedRowKeys"
        @update:checked-row-keys="handleCheck"
        striped
        size="small"
        :scroll-x="1400"
      />
    </div>

    <!-- 底部按钮 -->
    <div class="page-footer">
      <n-button type="primary" @click="handleOpenAdjustModal">批量调整有效期</n-button>
      <span class="total-text">共 {{ tableData.length }} 条</span>
    </div>

    <!-- 筛选抽屉 -->
    <n-drawer v-model:show="showFilterDrawer" width="340" placement="right">
      <n-drawer-content title="筛选条件" closable>
        <n-form label-placement="left" :label-width="80">
          <n-form-item label="门店">
            <n-select placeholder="请选择门店" :options="storeOptions" clearable />
          </n-form-item>
          <n-form-item label="会员搜索">
            <n-input placeholder="姓名/手机号" />
          </n-form-item>
          <n-form-item label="状态">
            <n-select placeholder="请选择状态" :options="statusOptions" clearable />
          </n-form-item>
          <n-form-item label="生效日期">
            <n-date-picker type="date" style="width: 100%;" clearable />
          </n-form-item>
          <n-form-item label="过期日期">
            <n-date-picker type="date" style="width: 100%;" clearable />
          </n-form-item>
        </n-form>
        <template #footer>
          <n-button type="primary" block @click="handleSearch">搜索</n-button>
        </template>
      </n-drawer-content>
    </n-drawer>

    <!-- 调整有效期弹窗 -->
    <n-modal v-model:show="showAdjustModal" preset="card" title="调整有效期" style="width: 560px;" :bordered="false" closable>
      <div class="adjust-form">
        <div class="form-row" v-if="currentAdjustRow">
          <label class="form-label">当前会员：</label>
          <span class="form-value">{{ currentAdjustRow.member }}</span>
        </div>
        <div class="form-row" v-else>
          <label class="form-label">已选中条数：</label>
          <span class="form-value">{{ checkedRowKeys.length }}</span>
        </div>
        <div class="form-row">
          <label class="form-label">调整生效日期：</label>
          <n-date-picker v-model:value="adjustForm.effectiveDate" type="date" style="flex: 1;" clearable />
        </div>
        <div class="form-row">
          <label class="form-label">调整过期日期：</label>
          <n-date-picker v-model:value="adjustForm.expireDate" type="date" style="flex: 1;" clearable />
        </div>
        <div class="form-row form-row-top">
          <label class="form-label">备注：</label>
          <n-input
            v-model:value="adjustForm.remark"
            type="textarea"
            :rows="3"
            placeholder=""
            style="flex: 1;"
          />
        </div>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showAdjustModal = false">取消</n-button>
          <n-button type="primary" @click="handleSubmitAdjust">确定</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import {
  NButton, NIcon, NDataTable, NTag, NAlert,
  NDrawer, NDrawerContent, NForm, NFormItem, NSelect, NInput,
  NDatePicker, NSpace, NModal,
} from 'naive-ui'
import { FilterOutline } from '@vicons/ionicons5'

const showFilterDrawer = ref(false)
const showSuccessTip = ref(true)
const showAdjustModal = ref(false)
const checkedRowKeys = ref<number[]>([])

const storeOptions = [
  { label: '和民轩小黑厅', value: '1' },
]

const statusOptions = [
  { label: '已退数', value: 'refunded' },
  { label: '生效中', value: 'active' },
  { label: '已用完', value: 'used' },
  { label: '已过期', value: 'expired' },
]

// 调整有效期表单
const adjustForm = ref({
  effectiveDate: null as number | null,
  expireDate: null as number | null,
  remark: '',
})

const columns = [
  {
    type: 'selection',
    width: 50,
  },
  {
    title: '会员',
    key: 'member',
    width: 100,
    render(row: any) {
      return h('div', {}, [row.member])
    }
  },
  {
    title: '发生门店',
    key: 'storeName',
    width: 110,
  },
  {
    title: '创建时间',
    key: 'createTime',
    width: 160,
  },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render(row: any) {
      const map: Record<string, string> = {
        refunded: 'default',
        active: 'info',
        used: 'warning',
        expired: 'error',
      }
      return h(NTag, { type: map[row.status] || 'default', size: 'small', bordered: false }, () => row.statusText)
    }
  },
  {
    title: '生效日期',
    key: 'effectiveDate',
    width: 105,
  },
  {
    title: '过期日期',
    key: 'expireDate',
    width: 105,
  },
  {
    title: '总数量',
    key: 'totalAmount',
    width: 70,
    align: 'center' as const,
  },
  {
    title: '剩余数量',
    key: 'remainAmount',
    width: 80,
    align: 'center' as const,
  },
  {
    title: '已用已退款量',
    key: 'usedRefundAmount',
    width: 115,
    align: 'center' as const,
  },
  {
    title: '清空数量',
    key: 'clearedAmount',
    width: 75,
    align: 'center' as const,
  },
  {
    title: '备注',
    key: 'remark',
    minWidth: 150,
    ellipsis: { tooltip: true },
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    fixed: 'right' as const,
    render(row: any) {
      return h(NButton, { size: 'small', type: 'primary', secondary: true, onClick: () => handleRowAdjust(row) }, () => '调整有效期')
    }
  },
]

// 示例数据（与图片一致）
const tableData = ref([
  {
    id: 1,
    member: '妍妍\n(9)',
    storeName: '和民轩小黑厅',
    createTime: '2023-11-10 11:03',
    status: 'refunded',
    statusText: '已退数',
    effectiveDate: '2023-11-10',
    expireDate: '2023-11-29',
    totalAmount: 200,
    remainAmount: 0,
    usedRefundAmount: 200,
    clearedAmount: 0,
    remark: '充值新帐：充',
  },
  {
    id: 2,
    member: '妍妍\n(9)',
    storeName: '和民轩小黑厅',
    createTime: '2023-11-10 10:54',
    status: 'active',
    statusText: '生效中',
    effectiveDate: '2023-11-10',
    expireDate: '2024-01-31',
    totalAmount: 200,
    remainAmount: 180,
    usedRefundAmount: 0,
    clearedAmount: 0,
    remark: '充值新帐：充',
  },
  {
    id: 3,
    member: '妍妍\n(9)',
    storeName: '和民轩小黑厅',
    createTime: '2023-11-10 10:54',
    status: 'active',
    statusText: '生效中',
    effectiveDate: '2023-11-10',
    expireDate: '2024-01-31',
    totalAmount: 300,
    remainAmount: 300,
    usedRefundAmount: 0,
    clearedAmount: 0,
    remark: '',
  },
  {
    id: 4,
    member: '妍妍\n(9)',
    storeName: '和民轩小黑厅',
    createTime: '2023-11-10 10:37',
    status: 'used',
    statusText: '已用完',
    effectiveDate: '2023-11-10',
    expireDate: '2023-12-09',
    totalAmount: 200,
    remainAmount: 0,
    usedRefundAmount: 0,
    clearedAmount: 0,
    remark: '手动增加赚赚元',
  },
  {
    id: 5,
    member: '妍妍\n(9)',
    storeName: '和民轩小黑厅',
    createTime: '2023-10-28 09:42',
    status: 'expired',
    statusText: '已过期',
    effectiveDate: '2023-10-28',
    expireDate: '2023-11-09',
    totalAmount: 300,
    remainAmount: 270,
    usedRefundAmount: 0,
    clearedAmount: 0,
    remark: '充值新帐：充 元（一年有效期）',
  },
])

const pagination = ref({
  pageSize: 15,
  showSizePicker: false,
})

function handleCheck(keys: number[]) {
  checkedRowKeys.value = keys
}

function handleSearch() {
  showFilterDrawer.value = false
}

function handleOpenAdjustModal() {
  if (checkedRowKeys.value.length === 0) return
  adjustForm.value = {
    effectiveDate: null,
    expireDate: null,
    remark: '',
  }
  showAdjustModal.value = true
}

// 单条调整有效期
const currentAdjustRow = ref<any>(null)
function handleRowAdjust(row: any) {
  currentAdjustRow.value = row
  adjustForm.value = {
    effectiveDate: null,
    expireDate: null,
    remark: '',
  }
  showAdjustModal.value = true
}

function handleSubmitAdjust() {
  console.log('提交调整有效期', {
    selectedIds: checkedRowKeys.value,
    singleRowId: currentAdjustRow.value?.id,
    ...adjustForm.value,
  })
  showAdjustModal.value = false
  currentAdjustRow.value = null
  showSuccessTip.value = true
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

/* 调整有效期弹窗表单 */
.adjust-form {
  padding: 8px 0;
}

.form-row {
  display: flex;
  align-items: center;
  padding: 12px 0;
  gap: 8px;
}

.form-row-top {
  align-items: flex-start;
}

.form-label {
  font-size: 14px;
  color: var(--text-secondary);
  white-space: nowrap;
  min-width: 110px;
}

.form-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}
</style>
