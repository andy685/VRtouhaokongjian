<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>生日会主题资源</h1>
        <p class="header-desc">管理线下生日会活动的音频、视频等主题资源，支持通用配置和寿星专属内容</p>
      </div>
    </div>

    <!-- Tab 切换 -->
    <n-tabs v-model:value="activeTab" type="line" animated>
      <n-tab-pane name="general" tab="通用配置管控" />
      <n-tab-pane name="exclusive" tab="小寿星专属资源" />
    </n-tabs>

    <!-- ==================== Tab 1: 通用配置管控 ==================== -->
    <template v-if="activeTab === 'general'">
      <div class="toolbar">
        <n-space>
          <n-input v-model:value="generalFilters.theme" placeholder="搜索主题" clearable style="width: 180px;">
            <template #prefix><n-icon :component="SearchOutline" /></template>
          </n-input>
          <n-input v-model:value="generalFilters.materialName" placeholder="搜索素材名称" clearable style="width: 180px;" />
          <n-button type="primary" @click="openGeneralAdd()">
            <template #icon><n-icon :component="AddOutline" /></template>
            新增资源
          </n-button>
        </n-space>
      </div>

      <div class="table-card">
        <n-data-table
          :columns="generalColumns"
          :data="filteredGeneralData"
          :bordered="false"
          :single-line="false"
          size="small"
          striped
          :pagination="{ pageSize: 10 }"
          :row-key="(row: GeneralItem) => row.id"
        />
      </div>

      <!-- 新增通用资源弹窗 -->
      <n-modal v-model:show="showGeneralModal" preset="card" :title="editingGeneralId ? '编辑通用资源' : '新增通用资源'" style="width: 520px;" :mask-closable="false">
        <n-form ref="generalFormRef" :model="generalForm" :rules="generalRules" label-placement="left" label-width="80">
          <n-form-item label="主题" path="theme">
            <n-input v-model:value="generalForm.theme" placeholder="请输入主题名称" />
          </n-form-item>
          <n-form-item label="顺序" path="sort">
            <n-input-number v-model:value="generalForm.sort" :min="1" placeholder="数字越小越靠前" style="width: 100%;" />
          </n-form-item>
          <n-form-item label="素材类型" path="type">
            <n-radio-group v-model:value="generalForm.type">
              <n-space>
                <n-radio value="video">新增视频</n-radio>
                <n-radio value="audio">新增音频</n-radio>
              </n-space>
            </n-radio-group>
          </n-form-item>
          <n-form-item label="素材名称" path="materialName">
            <n-input v-model:value="generalForm.materialName" placeholder="请输入素材名称" />
          </n-form-item>
          <n-form-item :label="generalForm.type === 'video' ? '上传视频' : '上传音频'" path="file">
            <n-upload
              action=""
              :default-file-list="[]"
              list-type="text"
              :max="1"
              :accept="generalForm.type === 'video' ? '.mp4,.mov,.avi' : '.mp3,.wav,.aac,.flac'"
              @change="handleGeneralFileChange"
            >
              <n-button>{{ generalForm.type === 'video' ? '选择视频文件' : '选择音频文件' }}</n-button>
            </n-upload>
          </n-form-item>
        </n-form>
        <template #footer>
          <n-space justify="end">
            <n-button @click="showGeneralModal = false">取消</n-button>
            <n-button type="primary" @click="handleGeneralSubmit">确认{{ editingGeneralId ? '保存' : '新增' }}</n-button>
          </n-space>
        </template>
      </n-modal>
    </template>

    <!-- ==================== Tab 2: 小寿星专属资源 ==================== -->
    <template v-if="activeTab === 'exclusive'">
      <div class="toolbar">
        <n-space>
          <n-select
            v-model:value="exclusiveFilters.merchant"
            :options="merchantOptions"
            placeholder="选择商家"
            clearable
            style="width: 160px;"
          />
          <n-select
            v-model:value="exclusiveFilters.storeName"
            :options="filteredStoreOptions"
            placeholder="选择店铺"
            clearable
            style="width: 180px;"
          />
          <n-input v-model:value="exclusiveFilters.starName" placeholder="搜索寿星姓名" clearable style="width: 160px;" />
          <n-button type="primary" @click="openExclusiveAdd()">
            <template #icon><n-icon :component="AddOutline" /></template>
            新增资源
          </n-button>
        </n-space>
      </div>

      <div class="table-card">
        <n-data-table
          :columns="exclusiveColumns"
          :data="filteredExclusiveData"
          :bordered="false"
          :single-line="false"
          size="small"
          striped
          :pagination="{ pageSize: 10 }"
          :row-key="(row: ExclusiveItem) => row.id"
        />
      </div>

      <!-- 新增/编辑专属资源弹窗 -->
      <n-modal v-model:show="showExclusiveModal" :title="editingExclusiveId ? '编辑专属资源' : '新增专属资源'" preset="card" style="width: 520px;" :mask-closable="false">
        <n-form ref="exclusiveFormRef" :model="exclusiveForm" :rules="exclusiveRules" label-placement="left" label-width="80">
          <n-form-item label="所属商家" path="merchant">
            <n-select
              v-model:value="exclusiveForm.merchant"
              :options="merchantOptions"
              placeholder="请选择商家"
              clearable
              @update:value="exclusiveForm.storeName = ''"
            />
          </n-form-item>
          <n-form-item label="所属店铺" path="storeName">
            <n-select
              v-model:value="exclusiveForm.storeName"
              :options="formStoreOptions"
              placeholder="请先选择商家"
              clearable
            />
          </n-form-item>
          <n-form-item label="寿星姓名" path="starName">
            <n-input v-model:value="exclusiveForm.starName" placeholder="请输入寿星姓名" />
          </n-form-item>
          <n-form-item label="上传音频" path="file">
            <n-upload
              action=""
              :default-file-list="exclusiveForm.file ? [{ id: 'f1', name: exclusiveForm.file, status: 'finished' }] : []"
              list-type="text"
              :max="1"
              accept=".mp3,.wav,.aac,.flac"
              @change="handleExclusiveFileChange"
            >
              <n-button>选择音频文件</n-button>
            </n-upload>
          </n-form-item>
        </n-form>
        <template #footer>
          <n-space justify="end">
            <n-button @click="showExclusiveModal = false">取消</n-button>
            <n-button type="primary" @click="handleExclusiveSubmit">确认{{ editingExclusiveId ? '保存' : '新增' }}</n-button>
          </n-space>
        </template>
      </n-modal>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NButton, NIcon, NDataTable, NTag, NSpace, NInput, NModal, NForm,
  NFormItem, NRadioGroup, NRadio, NInputNumber, NUpload, NTabs, NTabPane,
  NSelect, useMessage, type FormInst, type FormRules,
} from 'naive-ui'
import { SearchOutline, AddOutline, CreateOutline, TrashOutline } from '@vicons/ionicons5'
import { useExclusiveData, merchantStoreMap, storeRegionMap, type ExclusiveItem } from '../../composables/useBirthdayTheme'

const message = useMessage()
const activeTab = ref('general')

// ==================== 通用配置管控 ====================
interface GeneralItem {
  id: number
  theme: string
  sort: number
  materialName: string
  type: string
}

const generalFilters = ref({ theme: '', materialName: '' })

const generalData = ref<GeneralItem[]>([
  { id: 1, theme: '欢乐生日', sort: 1, materialName: 'happy_birthday_bg.mp4', type: '视频' },
  { id: 2, theme: '梦幻公主', sort: 2, materialName: 'princess_theme.mp3', type: '音频' },
  { id: 3, theme: '超级英雄', sort: 3, materialName: 'super_hero_intro.mp4', type: '视频' },
  { id: 4, theme: '海洋世界', sort: 4, materialName: 'ocean_world_bgm.mp3', type: '音频' },
  { id: 5, theme: '太空探险', sort: 5, materialName: 'space_adventure.mp4', type: '视频' },
])

const filteredGeneralData = computed(() => {
  let data = [...generalData.value]
  const f = generalFilters.value
  if (f.theme.trim()) data = data.filter(r => r.theme.includes(f.theme.trim()))
  if (f.materialName.trim()) data = data.filter(r => r.materialName.includes(f.materialName.trim()))
  return data
})

const generalColumns = [
  { title: 'ID', key: 'id', width: 70, align: 'center' as const },
  { title: '主题', key: 'theme', width: 150, ellipsis: { tooltip: true } },
  { title: '顺序', key: 'sort', width: 80, align: 'center' as const },
  { title: '素材名称', key: 'materialName', width: 220, ellipsis: { tooltip: true } },
  {
    title: '类型', key: 'type', width: 80, align: 'center' as const,
    render(row: GeneralItem) {
      return h(NTag, { type: row.type === '视频' ? 'info' : 'warning', size: 'small', bordered: false }, () => row.type)
    }
  },
  {
    title: '操作', key: 'actions', width: 140, fixed: 'right' as const,
    render(row: GeneralItem) {
      return h('div', { style: 'display:flex;gap:6px;' }, [
        h(NButton, { size: 'tiny', quaternary: true, type: 'info', onClick: () => openGeneralEdit(row) }, () => '编辑'),
        h(NButton, { size: 'tiny', quaternary: true, type: 'error', onClick: () => handleGeneralDelete(row) }, () => '删除'),
      ])
    }
  },
]

const showGeneralModal = ref(false)
const editingGeneralId = ref<number | null>(null)
const generalFormRef = ref<FormInst>()
const generalForm = ref({ theme: '', sort: 1, type: 'video', materialName: '', file: '' })

const generalRules: FormRules = {
  theme: { required: true, message: '请输入主题', trigger: 'blur' },
  sort: { required: true, type: 'number', message: '请输入顺序', trigger: 'blur' },
  type: { required: true, message: '请选择素材类型', trigger: 'change' },
  materialName: { required: true, message: '请输入素材名称', trigger: 'blur' },
  file: { required: true, message: '请上传素材文件', trigger: 'change' },
}

function handleGeneralFileChange(options: { fileList: Array<{ name: string }> }) {
  if (options.fileList.length > 0) {
    generalForm.value.file = options.fileList[0].name
  } else {
    generalForm.value.file = ''
  }
}

function openGeneralAdd() {
  editingGeneralId.value = null
  generalForm.value = { theme: '', sort: Math.max(0, ...generalData.value.map(r => r.sort)) + 1, type: 'video', materialName: '', file: '' }
  showGeneralModal.value = true
}

function openGeneralEdit(row: GeneralItem) {
  editingGeneralId.value = row.id
  generalForm.value = {
    theme: row.theme,
    sort: row.sort,
    type: row.type === '视频' ? 'video' : 'audio',
    materialName: row.materialName,
    file: '',
  }
  showGeneralModal.value = true
}

function handleGeneralSubmit() {
  generalFormRef.value?.validate((errors) => {
    if (errors) return

    if (editingGeneralId.value) {
      const item = generalData.value.find(r => r.id === editingGeneralId.value)
      if (item) {
        item.theme = generalForm.value.theme
        item.sort = generalForm.value.sort
        item.materialName = generalForm.value.materialName
        item.type = generalForm.value.type === 'video' ? '视频' : '音频'
      }
      message.success('保存成功')
    } else {
      const nextId = Math.max(0, ...generalData.value.map(r => r.id)) + 1
      generalData.value.push({
        id: nextId,
        theme: generalForm.value.theme,
        sort: generalForm.value.sort,
        materialName: generalForm.value.materialName,
        type: generalForm.value.type === 'video' ? '视频' : '音频',
      })
      message.success('新增成功')
    }

    showGeneralModal.value = false
    const nextSort = Math.max(0, ...generalData.value.map(r => r.sort)) + 1
    generalForm.value = { theme: '', sort: nextSort, type: 'video', materialName: '', file: '' }
  })
}

function handleGeneralDelete(row: GeneralItem) {
  generalData.value = generalData.value.filter(r => r.id !== row.id)
  message.success('删除成功')
}

// ==================== 小寿星专属资源 ====================
const { exclusiveData, add: addExclusive, update: updateExclusive, remove: removeExclusive } = useExclusiveData()

const exclusiveFilters = ref({ merchant: '', storeName: '', starName: '' })

// 所有商家列表（下拉选项）
const merchantOptions = computed(() => {
  return Object.keys(merchantStoreMap).map(m => ({ label: m, value: m }))
})

// 根据已选商家筛选店铺列表（联动）
const filteredStoreOptions = computed(() => {
  const merchant = exclusiveFilters.value.merchant
  if (!merchant) {
    // 未选商家时显示所有店铺
    return Object.values(merchantStoreMap).flat().map(s => ({ label: s, value: s }))
  }
  return (merchantStoreMap[merchant] || []).map(s => ({ label: s, value: s }))
})

// 弹窗内店铺选项（基于弹窗表单已选商家）
const formStoreOptions = computed(() => {
  const merchant = exclusiveForm.value.merchant
  if (!merchant) return []
  return (merchantStoreMap[merchant] || []).map(s => ({ label: s, value: s }))
})

const filteredExclusiveData = computed(() => {
  let data = [...exclusiveData.value]
  const f = exclusiveFilters.value
  if (f.merchant) data = data.filter(r => r.merchant === f.merchant)
  if (f.storeName) data = data.filter(r => r.storeName === f.storeName)
  if (f.starName.trim()) data = data.filter(r => r.starName.includes(f.starName.trim()))
  return data
})

const exclusiveColumns = [
  { title: '所属店铺名称', key: 'storeName', width: 150, ellipsis: { tooltip: true } },
  { title: '所属商家', key: 'merchant', width: 120, ellipsis: { tooltip: true } },
  { title: '地区', key: 'region', width: 80 },
  { title: '寿星名称', key: 'starName', width: 100, ellipsis: { tooltip: true } },
  { title: '创建时间', key: 'createdAt', width: 160 },
  { title: '更新时间', key: 'updatedAt', width: 160 },
  {
    title: '操作', key: 'actions', width: 140, fixed: 'right' as const,
    render(row: ExclusiveItem) {
      return h('div', { style: 'display:flex;gap:6px;' }, [
        h(NButton, { size: 'tiny', quaternary: true, type: 'info', onClick: () => openExclusiveEdit(row) }, () => '编辑'),
        h(NButton, { size: 'tiny', quaternary: true, type: 'error', onClick: () => handleExclusiveDelete(row) }, () => '删除'),
      ])
    }
  },
]

const showExclusiveModal = ref(false)
const editingExclusiveId = ref<number | null>(null)
const exclusiveFormRef = ref<FormInst>()
const exclusiveForm = ref({ merchant: '', storeName: '', starName: '', file: '' })

const exclusiveRules: FormRules = {
  merchant: { required: true, message: '请选择商家', trigger: 'change' },
  storeName: { required: true, message: '请选择店铺', trigger: 'change' },
  starName: { required: true, message: '请输入寿星姓名', trigger: 'blur' },
  file: { required: true, message: '请上传音频资源', trigger: 'change' },
}

function handleExclusiveFileChange(options: { fileList: Array<{ name: string }> }) {
  if (options.fileList.length > 0) {
    exclusiveForm.value.file = options.fileList[0].name
  } else {
    exclusiveForm.value.file = ''
  }
}

function openExclusiveAdd() {
  editingExclusiveId.value = null
  exclusiveForm.value = { merchant: '', storeName: '', starName: '', file: '' }
  showExclusiveModal.value = true
}

function openExclusiveEdit(row: ExclusiveItem) {
  editingExclusiveId.value = row.id
  exclusiveForm.value = { merchant: row.merchant, storeName: row.storeName, starName: row.starName, file: row.audioFile }
  showExclusiveModal.value = true
}

function handleExclusiveSubmit() {
  exclusiveFormRef.value?.validate((errors) => {
    if (errors) return
    const payload = {
      merchant: exclusiveForm.value.merchant,
      storeName: exclusiveForm.value.storeName,
      starName: exclusiveForm.value.starName,
      audioFile: exclusiveForm.value.file,
    }
    if (editingExclusiveId.value) {
      updateExclusive(editingExclusiveId.value, payload)
      message.success('保存成功')
    } else {
      addExclusive(payload)
      message.success('新增成功')
    }
    showExclusiveModal.value = false
  })
}

function handleExclusiveDelete(row: ExclusiveItem) {
  removeExclusive(row.id)
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
