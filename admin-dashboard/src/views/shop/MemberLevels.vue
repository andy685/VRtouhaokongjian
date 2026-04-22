<template>
  <div class="page-container animate-fade-in">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>会员等级</h2>
      <n-space>
        <n-button type="primary" @click="handleAdd">
          <template #icon><n-icon :component="AddOutline" /></template>
          添加
        </n-button>
        <n-button secondary @click="handleApply">
          <template #icon><n-icon :component="RefreshOutline" /></template>
          等级立刻生效
        </n-button>
      </n-space>
    </div>

    <!-- 数据表格 -->
    <div class="table-wrapper">
      <n-data-table
        :columns="columns"
        :data="tableData"
        :pagination="{ pageSize: 15 }"
        :row-key="(row: any) => row.id"
        striped
        size="small"
        :scroll-x="900"
      />
    </div>

    <!-- 新增/编辑弹窗 -->
    <n-modal v-model:show="showModal" preset="card" :title="modalTitle" style="width: 520px;" :bordered="false">
      <n-form ref="formRef" :model="formData" :rules="formRules" label-placement="left" :label-width="110">
        <n-form-item label="等级名称：" path="name">
          <n-input v-model:value="formData.name" placeholder="请输入等级名称" />
        </n-form-item>
        <n-form-item label="累计消费金额：" path="consumeAmount">
          <n-input-number v-model:value="formData.consumeAmount" :min="0" placeholder="" style="flex:1;">
            <template #prefix>¥</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="消费折扣：" path="consumeDiscount">
          <n-input-number v-model:value="formData.consumeDiscount" :min="0" :max="100" placeholder="" style="flex:1;">
            <template #suffix>%</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="积分兑换折扣：" path="pointsDiscount">
          <n-input-number v-model:value="formData.pointsDiscount" :min="0" :max="100" placeholder="" style="flex:1;">
            <template #suffix>%</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="状态：" path="status">
          <n-radio-group v-model:value="formData.status">
            <n-radio value="enabled">启用</n-radio>
            <n-radio value="disabled">禁用</n-radio>
          </n-radio-group>
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" @click="handleSubmit">确定</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NButton, NIcon, NDataTable, NTag,
  NModal, NForm, NFormItem, NInput, NInputNumber, NSpace,
  NRadioGroup, NRadio, NPopconfirm,
} from 'naive-ui'
import { AddOutline, RefreshOutline } from '@vicons/ionicons5'

const showModal = ref(false)
const formRef = ref()
const isEditing = ref(false)
const editId = ref<number | null>(null)

// 表单数据
const formData = ref({
  name: '',
  consumeAmount: null as number | null,
  consumeDiscount: null as number | null,
  pointsDiscount: null as number | null,
  status: 'enabled' as string,
})

// 校验规则
const formRules = {
  name: { required: true, message: '请输入等级名称', trigger: 'blur' },
  consumeAmount: { required: true, type: 'number' as const, message: '请输入累计消费金额', trigger: 'blur' },
  consumeDiscount: { required: true, type: 'number' as const, message: '请输入消费折扣', trigger: 'blur' },
  pointsDiscount: { required: true, type: 'number' as const, message: '请输入积分兑换折扣', trigger: 'blur' },
}

const modalTitle = computed(() => isEditing.value ? '编辑会员等级' : '添加会员等级')

// 表格列配置
const columns = [
  {
    title: '',
    key: 'checkbox',
    width: 50,
    render(row: any) {
      return h('span')
    }
  },
  {
    title: '等级名',
    key: 'name',
    width: 120,
  },
  {
    title: '累计消费金额（¥）',
    key: 'consumeAmount',
    width: 160,
    render(row: any) {
      return row.consumeAmount !== null ? row.consumeAmount : 0
    }
  },
  {
    title: '消费折扣（%）',
    key: 'consumeDiscount',
    width: 130,
  },
  {
    title: '积分兑换折扣（%）',
    key: 'pointsDiscount',
    width: 150,
  },
  {
    title: '创建时间',
    key: 'createTime',
    width: 160,
    render(row: any) {
      return row.createTime || '--'
    }
  },
  {
    title: '状态',
    key: 'status',
    width: 70,
    align: 'center' as const,
    render(row: any) {
      if (row.status === 'enabled') {
        return h(NTag, { type: 'success', size: 'small', bordered: false }, () => '启用')
      }
      if (row.status === 'disabled') {
        return h(NTag, { type: 'default', size: 'small', bordered: false }, () => '禁用')
      }
      return h(NTag, { size: 'small', bordered: false }, () => '--')
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    render(row: any) {
      if (row.name === '普通会员') {
        return h('span', {}, '--')
      }
      return h('div', { style: { display: 'inline-flex', gap: '4px' } }, [
        h(NButton, { size: 'tiny', quaternary: true, type: 'info', onClick: () => handleEdit(row) }, () => '编辑'),
        h(NPopconfirm, {
          onPositiveClick: () => handleDelete(row.id),
        }, {
          trigger: () => h(NButton, { size: 'tiny', quaternary: true, type: 'error' }, () => '删除'),
          default: () => '确认删除该等级？'
        }),
      ])
    }
  },
]

// 示例数据
const tableData = ref([
  {
    id: 1,
    name: '黄金',
    consumeAmount: 1000,
    consumeDiscount: 85,
    pointsDiscount: 85,
    createTime: '2021-11-27 17:27',
    status: 'enabled',
  },
  {
    id: 2,
    name: '白银',
    consumeAmount: 800,
    consumeDiscount: 90,
    pointsDiscount: 90,
    createTime: '2021-11-27 17:27',
    status: 'enabled',
  },
  {
    id: 3,
    name: '青铜',
    consumeAmount: 500,
    consumeDiscount: 95,
    pointsDiscount: 95,
    createTime: '2021-11-27 17:26',
    status: 'enabled',
  },
  {
    id: 4,
    name: '普通会员',
    consumeAmount: 0,
    consumeDiscount: 100,
    pointsDiscount: 100,
    createTime: '',
    status: 'enabled',
  },
])

function resetForm() {
  formData.value = {
    name: '',
    consumeAmount: null,
    consumeDiscount: null,
    pointsDiscount: null,
    status: 'enabled',
  }
}

function handleAdd() {
  isEditing.value = false
  editId.value = null
  resetForm()
  showModal.value = true
}

function handleEdit(row: any) {
  isEditing.value = true
  editId.value = row.id
  formData.value = {
    name: row.name,
    consumeAmount: row.consumeAmount,
    consumeDiscount: row.consumeDiscount,
    pointsDiscount: row.pointsDiscount,
    status: row.status || 'enabled',
  }
  showModal.value = true
}

function handleApply() {
  console.log('等级立刻生效')
}

function handleDelete(id: number) {
  const idx = tableData.value.findIndex(r => r.id === id)
  if (idx >= 0) {
    tableData.value.splice(idx, 1)
  }
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
    if (isEditing.value && editId.value) {
      const idx = tableData.value.findIndex(r => r.id === editId.value)
      if (idx >= 0) {
        Object.assign(tableData.value[idx], formData.value)
      }
    } else {
      tableData.value.push({
        id: Date.now(),
        ...formData.value,
        createTime: new Date().toLocaleString(),
        status: 'enabled',
      })
    }
    showModal.value = false
  } catch (e) {
    // 校验失败
  }
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
</style>
