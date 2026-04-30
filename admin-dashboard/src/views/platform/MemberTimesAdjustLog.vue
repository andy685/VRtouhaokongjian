<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">次数调整有效查询</h1>
      <n-space>
        <n-input placeholder="搜索会员姓名/手机号..." size="small" style="width: 200px;">
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
        <n-select v-model:value="merchantFilter" :options="merchantOptions" size="small" placeholder="筛选商家" clearable style="width: 160px;" />
        <n-select v-model:value="adjustTypeFilter" :options="adjustTypeOptions" size="small" placeholder="调整类型" clearable style="width: 130px;" />
        <n-date-picker type="daterange" clearable size="small" v-model:value="dateRange" />
        <n-button secondary size="small" @click="exportData">导出</n-button>
      </n-space>
    </div>

    <!-- 统计 -->
    <div class="summary-bar">
      <span>共 <strong>{{ tableData.length }}</strong> 条调整记录</span>
      <n-divider vertical />
      <span>延长：<strong class="extend">{{ extendCount }}</strong> 条</span>
      <n-divider vertical />
      <span>缩短：<strong class="shorten">{{ shortenCount }}</strong> 条</span>
      <n-divider vertical />
      <span>重设：<strong class="reset">{{ resetCount }}</strong> 条</span>
      <n-divider vertical />
      <span>清空：<strong class="clear">{{ clearCount }}</strong> 条</span>
    </div>

    <div class="table-card">
      <n-data-table :columns="columns" :data="tableData" :pagination="{ pageSize: 15 }" striped size="small" :scroll-x="1500" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { NDataTable, NTag, NSpace, NInput, NIcon, NSelect, NDatePicker, NDivider } from 'naive-ui'
import { SearchOutline } from '@vicons/ionicons5'

const merchantFilter = ref<string | null>(null)
const adjustTypeFilter = ref<string | null>(null)
const dateRange = ref<[number, number] | null>(null)

const merchantOptions = [
  { label: '恒然集团', value: '恒然集团' },
  { label: '幻影星空', value: '幻影星空' },
  { label: '利民街商家', value: '利民街商家' },
  { label: '党建馆集团', value: '党建馆集团' },
  { label: '华东展厅', value: '华东展厅' },
]
const adjustTypeOptions = [
  { label: '延长有效期', value: 'extend' },
  { label: '缩短有效期', value: 'shorten' },
  { label: '重新设定', value: 'reset' },
  { label: '手动清空', value: 'clear' },
]

const columns = [
  { title: '会员', key: 'member', width: 145 },
  { title: '手机号', key: 'phone', width: 125 },
  { title: '所属商家', key: 'merchant', width: 100, render: (row: any) => h(NTag, { size: 'small', bordered: false }, () => row.merchant) },
  { title: '发生店铺', key: 'storeName', width: 130 },
  { title: '调整类型', key: 'adjustType', width: 115, render: (row: any) => {
    const m: Record<string, string> = { extend: 'success', shorten: 'warning', reset: 'info', clear: 'error' }
    const t: Record<string, string> = { extend: '延长有效期', shorten: '缩短有效期', reset: '重新设定', clear: '手动清空' }
    return h(NTag, { type: (m[row.adjustType] || 'default') as any, size: 'small', bordered: false }, () => t[row.adjustType])
  }},
  { title: '原生效日期', key: 'oldEffectiveDate', width: 110 },
  { title: '新生效日期', key: 'newEffectiveDate', width: 110 },
  { title: '原过期日期', key: 'oldExpireDate', width: 110 },
  { title: '新过期日期', key: 'newExpireDate', width: 110 },
  { title: '涉及次数', key: 'times', width: 80, align: 'center' as const },
  { title: '操作人', key: 'operator', width: 80 },
  { title: '调整时间', key: 'adjustTime', width: 155 },
  { title: '备注', key: 'remark', minWidth: 180, ellipsis: { tooltip: true } as any },
]

const tableData = ref([
  { id: 1, member: '赵天宇 (VIP)', phone: '177****9900', merchant: '华东展厅', storeName: '华东展厅', adjustType: 'extend', oldEffectiveDate: '2026-04-15', newEffectiveDate: '2026-04-15', oldExpireDate: '2026-05-15', newExpireDate: '2026-06-15', times: 5, operator: '管理员', adjustTime: '2026-04-22 14:32', remark: '客户投诉，补偿延长一个月' },
  { id: 2, member: '赵天宇 (VIP)', phone: '177****9900', merchant: '华东展厅', storeName: '华东展厅', adjustType: 'extend', oldEffectiveDate: '2026-04-15', newEffectiveDate: '2026-04-15', oldExpireDate: '2026-06-15', newExpireDate: '2026-09-15', times: 5, operator: '店员-李四', adjustTime: '2026-04-22 16:20', remark: '赠送活动：年末顺延送1次' },
  { id: 3, member: '阳恩', phone: '159****3344', merchant: '恒然集团', storeName: '恒然分部展厅', adjustType: 'reset', oldEffectiveDate: '2026-04-10', newEffectiveDate: '2026-03-01', oldExpireDate: '2026-12-31', newExpireDate: '2027-03-01', times: 2, operator: '运营-王五', adjustTime: '2026-04-21 11:08', remark: '充值套餐重新设定有效期' },
  { id: 4, member: '张浩理', phone: '138****7890', merchant: '恒然集团', storeName: '恒然分部展厅', adjustType: 'extend', oldEffectiveDate: '2026-04-05', newEffectiveDate: '2026-04-05', oldExpireDate: '2026-05-05', newExpireDate: '2026-06-05', times: 3, operator: '店员-张三', adjustTime: '2026-04-20 09:55', remark: '充值套餐延长至2个月' },
  { id: 5, member: '李明远', phone: '136****3456', merchant: '幻影星空', storeName: '幻影星空馆 NO.8088', adjustType: 'extend', oldEffectiveDate: '2026-03-28', newEffectiveDate: '2026-03-28', oldExpireDate: '永久有效', newExpireDate: '永久有效', times: 3, operator: '店员-李四', adjustTime: '2026-04-19 13:42', remark: '赠送活动：永久有效确认' },
  { id: 6, member: '王思琪', phone: '137****9012', merchant: '幻影星空', storeName: '幻影星空馆 NO.8088', adjustType: 'clear', oldEffectiveDate: '2026-02-15', newEffectiveDate: '--', oldExpireDate: '2026-03-15', newExpireDate: '--', times: 1, operator: '管理员', adjustTime: '2026-04-18 10:18', remark: '账户异常，手动清空' },
  { id: 7, member: '陈晓峰', phone: '186****5566', merchant: '利民街商家', storeName: '利民街大展厅', adjustType: 'shorten', oldEffectiveDate: '2026-02-10', newEffectiveDate: '2026-02-10', oldExpireDate: '2026-05-10', newExpireDate: '2026-04-10', times: 2, operator: '运营-张三', adjustTime: '2026-04-17 15:27', remark: '系统修正，原设置有误' },
  { id: 8, member: '孙浩然', phone: '199****4455', merchant: '党建馆集团', storeName: '党建馆', adjustType: 'extend', oldEffectiveDate: '2026-01-20', newEffectiveDate: '2026-01-20', oldExpireDate: '2026-02-20', newExpireDate: '2026-05-20', times: 3, operator: '店员-李四', adjustTime: '2026-04-16 08:35', remark: '系统批量调整+3个月' },
])

const extendCount = computed(() => tableData.value.filter(r => r.adjustType === 'extend').length)
const shortenCount = computed(() => tableData.value.filter(r => r.adjustType === 'shorten').length)
const resetCount = computed(() => tableData.value.filter(r => r.adjustType === 'reset').length)
const clearCount = computed(() => tableData.value.filter(r => r.adjustType === 'clear').length)

function exportData() {}
</script>

<style scoped>
.page-container { padding: 20px 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 8px; }
.page-title { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }

.summary-bar { display: flex; align-items: center; background: white; border-radius: 10px; padding: 12px 20px; border: 1px solid var(--border-color); margin-bottom: 16px; font-size: 13px; color: var(--text-muted); flex-wrap: wrap; gap: 4px; }
.summary-bar strong { color: var(--text-primary); }
.summary-bar strong.extend { color: #10B981; }
.summary-bar strong.shorten { color: #F59E0B; }
.summary-bar strong.reset { color: #3B82F6; }
.summary-bar strong.clear { color: #EF4444; }

.table-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid var(--border-color); }
</style>
