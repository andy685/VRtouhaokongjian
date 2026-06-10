<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>奇幻派对主题资源</h1>
        <p class="header-desc">管理小寿星专属音频资源，为线下奇幻派对提供个性化祝福</p>
      </div>
    </div>

    <div class="toolbar">
      <n-space>
        <n-select
          v-model:value="filters.storeName"
          :options="storeFilterOptions"
          placeholder="选择店铺"
          clearable
          style="width: 200px;"
        />
        <n-input v-model:value="filters.starName" placeholder="搜索寿星姓名" clearable style="width: 160px;">
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
        <n-button type="primary" @click="openAdd()">
          <template #icon><n-icon :component="AddOutline" /></template>
          新增资源
        </n-button>
      </n-space>
    </div>

    <div class="table-card">
      <n-data-table
        :columns="columns"
        :data="filteredData"
        :bordered="false"
        :single-line="false"
        size="small"
        striped
        :pagination="{ pageSize: 10 }"
        :row-key="(row: ExclusiveItem) => row.id"
      />
    </div>

    <!-- 新增/编辑弹窗 -->
    <n-modal v-model:show="showModal" :title="editingId ? '编辑专属资源' : '新增专属资源'" preset="card" style="width: 520px;" :mask-closable="false">
      <n-form ref="formRef" :model="form" :rules="rules" label-placement="left" label-width="80">
        <n-form-item label="所属店铺" path="storeName">
          <n-select
            v-model:value="form.storeName"
            :options="formStoreOptions"
            placeholder="请选择店铺"
            clearable
          />
        </n-form-item>
        <n-form-item label="寿星姓名" path="starName">
          <n-input v-model:value="form.starName" placeholder="请输入寿星姓名" />
        </n-form-item>
        <n-form-item label="上传音频" path="file">
          <n-upload
            action=""
            :default-file-list="form.file ? [{ id: 'f1', name: form.file, status: 'finished' }] : []"
            list-type="text"
            :max="1"
            accept=".mp3,.wav,.aac,.flac"
            @change="handleFileChange"
          >
            <n-button>选择音频文件</n-button>
          </n-upload>
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" @click="handleSubmit">确认{{ editingId ? '保存' : '新增' }}</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NButton, NIcon, NDataTable, NTag, NSpace, NInput, NModal, NForm,
  NFormItem, NUpload, NSelect, useMessage, type FormInst, type FormRules,
} from 'naive-ui'
import { SearchOutline, AddOutline } from '@vicons/ionicons5'
import { useExclusiveData, merchantStoreMap, type ExclusiveItem } from '../../composables/useBirthdayTheme'

const message = useMessage()
const { exclusiveData, add, update, remove } = useExclusiveData()

// ---- 当前商家（mock：恒然集团） ----
const currentMerchant = '恒然集团'
const myStores = merchantStoreMap[currentMerchant] || []

// ---- 筛选 ----
const filters = ref({ storeName: '', starName: '' })

const storeFilterOptions = computed(() =>
  myStores.map(s => ({ label: s, value: s }))
)

// 只显示当前商家的数据
const filteredData = computed(() => {
  let data = exclusiveData.value.filter(r => r.merchant === currentMerchant)
  const f = filters.value
  if (f.storeName) data = data.filter(r => r.storeName === f.storeName)
  if (f.starName.trim()) data = data.filter(r => r.starName.includes(f.starName.trim()))
  return data
})

// ---- 表格列 ----
const columns = [
  { title: '所属店铺名称', key: 'storeName', width: 160, ellipsis: { tooltip: true } },
  { title: '地区', key: 'region', width: 80 },
  { title: '寿星名称', key: 'starName', width: 100, ellipsis: { tooltip: true } },
  { title: '创建时间', key: 'createdAt', width: 160 },
  { title: '更新时间', key: 'updatedAt', width: 160 },
  {
    title: '操作', key: 'actions', width: 140, fixed: 'right' as const,
    render(row: ExclusiveItem) {
      return h('div', { style: 'display:flex;gap:6px;' }, [
        h(NButton, { size: 'tiny', quaternary: true, type: 'info', onClick: () => openEdit(row) }, () => '编辑'),
        h(NButton, { size: 'tiny', quaternary: true, type: 'error', onClick: () => handleDelete(row) }, () => '删除'),
      ])
    }
  },
]

// ---- 弹窗 ----
const showModal = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInst>()
const form = ref({ storeName: '', starName: '', file: '' })

const formStoreOptions = computed(() =>
  myStores.map(s => ({ label: s, value: s }))
)

const rules: FormRules = {
  storeName: { required: true, message: '请选择店铺', trigger: 'change' },
  starName: { required: true, message: '请输入寿星姓名', trigger: 'blur' },
  file: { required: true, message: '请上传音频资源', trigger: 'change' },
}

function handleFileChange(options: { fileList: Array<{ name: string }> }) {
  form.value.file = options.fileList.length > 0 ? options.fileList[0].name : ''
}

function openAdd() {
  editingId.value = null
  form.value = { storeName: '', starName: '', file: '' }
  showModal.value = true
}

function openEdit(row: ExclusiveItem) {
  editingId.value = row.id
  form.value = { storeName: row.storeName, starName: row.starName, file: row.audioFile }
  showModal.value = true
}

function handleSubmit() {
  formRef.value?.validate((errors) => {
    if (errors) return
    const payload = {
      merchant: currentMerchant,
      storeName: form.value.storeName,
      starName: form.value.starName,
      audioFile: form.value.file,
    }
    if (editingId.value) {
      update(editingId.value, payload)
      message.success('保存成功')
    } else {
      add(payload)
      message.success('新增成功')
    }
    showModal.value = false
    form.value = { storeName: '', starName: '', file: '' }
  })
}

function handleDelete(row: ExclusiveItem) {
  remove(row.id)
  message.success('删除成功')
}
</script>

<style scoped>
.page-container { padding: 20px 24px; }
.page-header { margin-bottom: 16px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0 0 4px; }
.header-desc { font-size: 13px; color: var(--text-muted); margin: 0; }
.toolbar { margin: 16px 0; }
.table-card {
  background: white;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  padding: 4px;
}
</style>
