<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>设备列表</h1>
      <n-space align="center">
        <span style="color: #666; font-size: 14px;">请选择门店：</span>
        <n-select v-model:value="selectedShop" :options="shopOptions" size="small" style="width: 180px;" />
        <n-button type="primary" @click="showAddModal = true">
          <template #icon><n-icon :component="AddOutline" /></template>
          添加第三方设备
        </n-button>
      </n-space>
    </div>

    <n-data-table
      :columns="columns"
      :data="filteredData"
      :pagination="pagination"
      :bordered="false"
      striped
      size="medium"
    />

    <!-- 添加第三方设备弹窗 -->
    <n-modal v-model:show="showAddModal" preset="card" title="增加第三方设备" style="width: 520px;" :bordered="false">
      <n-form ref="addFormRef" :model="addForm" :rules="addRules" label-placement="left" label-width="120">
        <n-form-item label="门店选择" path="shop">
          <n-select v-model:value="addForm.shop" :options="shopOptions.filter(s => s.value !== 'all')" placeholder="请选择" />
        </n-form-item>
        <n-form-item label="设备名称" path="name">
          <n-input v-model:value="addForm.name" placeholder="请输入设备名称" />
        </n-form-item>
        <n-form-item label="播放影片单价" path="price">
          <n-input-number v-model:value="addForm.price" :min="0" :precision="2" placeholder="请输入单价" style="width: 100%;" />
        </n-form-item>
        <n-form-item label="播放影片币数" path="coins">
          <n-input-number v-model:value="addForm.coins" :min="0" placeholder="请输入币数" style="width: 100%;" />
        </n-form-item>
        <n-form-item label="描述" path="desc">
          <n-input
            v-model:value="addForm.desc"
            type="textarea"
            placeholder="请描述"
            :maxlength="50"
            show-count
            :rows="4"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="center" style="width: 100%;">
          <n-button type="primary" style="width: 160px;" @click="handleAdd">增加</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 详情弹窗 -->
    <n-modal v-model:show="showDetailModal" preset="card" title="设备详情" style="width: 520px;" :bordered="false">
      <n-descriptions v-if="currentDevice" label-placement="left" :column="2" bordered>
        <n-descriptions-item label="门店">{{ currentDevice.shop }}</n-descriptions-item>
        <n-descriptions-item label="设备类型">{{ currentDevice.type }}</n-descriptions-item>
        <n-descriptions-item label="设备名称">{{ currentDevice.name }}</n-descriptions-item>
        <n-descriptions-item label="设备Token">{{ currentDevice.token }}</n-descriptions-item>
        <n-descriptions-item label="状态">
          <n-tag :type="currentDevice.status === 'enabled' ? 'success' : 'error'" size="small">
            {{ currentDevice.status === 'enabled' ? '启用' : '禁用' }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="第三方设备">
          <n-tag :type="currentDevice.isThirdParty ? 'error' : 'default'" size="small">
            {{ currentDevice.isThirdParty ? '是' : '否' }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="是否过保">
          <n-tag :type="currentDevice.isExpired ? 'success' : 'default'" size="small">
            {{ currentDevice.isExpired ? '是' : '否' }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="试用状态">{{ currentDevice.trialStatus || '--' }}</n-descriptions-item>
      </n-descriptions>
    </n-modal>

    <!-- 编辑弹窗 -->
    <n-modal v-model:show="showEditModal" preset="card" title="编辑设备" style="width: 480px;" :bordered="false">
      <n-form v-if="currentDevice" label-placement="left" label-width="100">
        <n-form-item label="设备名称">
          <n-input v-model:value="editForm.name" />
        </n-form-item>
        <n-form-item label="设备类型">
          <n-input v-model:value="editForm.type" />
        </n-form-item>
        <n-form-item label="状态">
          <n-radio-group v-model:value="editForm.status">
            <n-space>
              <n-radio value="enabled">启用</n-radio>
              <n-radio value="disabled">禁用</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="第三方设备">
          <n-switch v-model:value="editForm.isThirdParty" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showEditModal = false">取消</n-button>
          <n-button type="primary" @click="handleEdit">保存</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NDataTable, NButton, NIcon, NSpace, NSelect, NModal, NForm, NFormItem,
  NInput, NInputNumber, NTag, NDescriptions, NDescriptionsItem, NRadioGroup, NRadio, NSwitch,
  type DataTableColumns, type FormInst, type FormRules
} from 'naive-ui'
import { AddOutline, PencilOutline, EyeOutline, TrashOutline, FilmOutline } from '@vicons/ionicons5'

interface Device {
  id: number
  shop: string
  type: string
  name: string
  token: string
  status: 'enabled' | 'disabled'
  isThirdParty: boolean
  isExpired: boolean
  trialStatus: string
}

const selectedShop = ref('all')
const showAddModal = ref(false)
const showDetailModal = ref(false)
const showEditModal = ref(false)
const currentDevice = ref<Device | null>(null)
const addFormRef = ref<FormInst | null>(null)

const addForm = ref({ name: '', shop: '', price: 20.00, coins: 3, desc: '' })
const editForm = ref<Partial<Device>>({})

const addRules: FormRules = {
  shop: { required: true, message: '请选择门店', trigger: 'change' },
  name: { required: true, message: '请输入设备名称', trigger: 'blur' },
  price: { required: true, type: 'number', message: '请输入播放影片单价', trigger: 'blur' },
}

const shopOptions = [
  { label: '全部门店', value: 'all' },
  { label: '利民街小展厅', value: '利民街小展厅' },
  { label: '卓远萝岗区店', value: '卓远萝岗区店' },
  { label: '卓远萧山区店', value: '卓远萧山区店' },
  { label: '卓远亚运城店', value: '卓远亚运城店' },
]

const deviceData = ref<Device[]>([
  { id: 1, shop: '利民街小展厅', type: '第三方设备', name: '扭蛋', token: 'token_abc123', status: 'enabled', isThirdParty: true, isExpired: false, trialStatus: '--' },
  { id: 2, shop: '利民街小展厅', type: '悬浮骑兵', name: '悬浮骑兵', token: 'token_def456', status: 'enabled', isThirdParty: false, isExpired: true, trialStatus: '是' },
  { id: 3, shop: '利民街小展厅', type: '悬浮骑兵', name: '悬浮骑兵', token: 'token_ghi789', status: 'enabled', isThirdParty: false, isExpired: true, trialStatus: '是' },
  { id: 4, shop: '利民街小展厅', type: '悬浮骑兵', name: '悬浮骑兵', token: 'token_jkl012', status: 'enabled', isThirdParty: false, isExpired: true, trialStatus: '是' },
  { id: 5, shop: '利民街小展厅', type: '悬浮骑兵', name: '悬浮骑兵', token: 'token_mno345', status: 'enabled', isThirdParty: false, isExpired: true, trialStatus: '是' },
  { id: 6, shop: '利民街小展厅', type: '暗黑行者', name: '暗黑行者', token: 'token_pqr678', status: 'disabled', isThirdParty: false, isExpired: true, trialStatus: '是' },
  { id: 7, shop: '利民街小展厅', type: '暗黑行者', name: '暗黑行者', token: 'token_stu901', status: 'disabled', isThirdParty: false, isExpired: true, trialStatus: '是' },
  { id: 8, shop: '利民街小展厅', type: '暗黑机甲', name: '暗黑机甲2G版', token: 'token_vwx234', status: 'enabled', isThirdParty: false, isExpired: true, trialStatus: '是' },
  { id: 9, shop: '利民街小展厅', type: '暗黑行者', name: '暗黑行者', token: 'token_yza567', status: 'enabled', isThirdParty: false, isExpired: true, trialStatus: '是' },
  { id: 10, shop: '利民街小展厅', type: '暗黑行者', name: '暗黑行者', token: 'token_bcd890', status: 'enabled', isThirdParty: false, isExpired: true, trialStatus: '是' },
  { id: 11, shop: '利民街小展厅', type: '幻影飞碟', name: '幻影飞碟（国外）', token: 'token_efg123', status: 'enabled', isThirdParty: false, isExpired: true, trialStatus: '是' },
  { id: 12, shop: '卓远亚运城店', type: '悬浮骑兵', name: '悬浮骑兵-A01', token: 'token_hij456', status: 'enabled', isThirdParty: false, isExpired: false, trialStatus: '--' },
  { id: 13, shop: '卓远亚运城店', type: '暗黑行者', name: '暗黑行者-B02', token: 'token_klm789', status: 'enabled', isThirdParty: false, isExpired: false, trialStatus: '--' },
  { id: 14, shop: '卓远萧山区店', type: '幻影飞碟', name: '幻影飞碟-C01', token: 'token_nop012', status: 'enabled', isThirdParty: false, isExpired: true, trialStatus: '是' },
  { id: 15, shop: '卓远萝岗区店', type: '第三方设备', name: '体感游戏机', token: 'token_qrs345', status: 'enabled', isThirdParty: true, isExpired: false, trialStatus: '--' },
])

const filteredData = computed(() => {
  if (selectedShop.value === 'all') return deviceData.value
  return deviceData.value.filter(d => d.shop === selectedShop.value)
})

const columns: DataTableColumns<Device> = [
  { title: '门店', key: 'shop', minWidth: 140 },
  { title: '设备类型', key: 'type', minWidth: 120 },
  {
    title: 'token/状态/设备名',
    key: 'name',
    minWidth: 180,
    render(row) {
      return h(NSpace, { align: 'center', size: 8 }, {
        default: () => [
          h(NTag, { size: 'tiny', type: 'info', bordered: true }, () => 'token'),
          h('span', { style: 'font-weight: 500; color: #333;' }, row.name)
        ]
      })
    }
  },
  {
    title: '状态',
    key: 'status',
    width: 90,
    align: 'center',
    render(row) {
      return h(NTag, {
        size: 'small',
        type: row.status === 'enabled' ? 'success' : 'error',
        bordered: true
      }, () => row.status === 'enabled' ? '启用' : '禁用')
    }
  },
  {
    title: '第三方设备',
    key: 'isThirdParty',
    width: 100,
    align: 'center',
    render(row) {
      return h(NTag, {
        size: 'small',
        type: row.isThirdParty ? 'error' : 'default',
        bordered: true
      }, () => row.isThirdParty ? '是' : '否')
    }
  },
  {
    title: '是否过保',
    key: 'isExpired',
    width: 90,
    align: 'center',
    render(row) {
      return h(NTag, {
        size: 'small',
        type: row.isExpired ? 'success' : 'default',
        bordered: true
      }, () => row.isExpired ? '是' : '否')
    }
  },
  {
    title: '试用状态',
    key: 'trialStatus',
    width: 90,
    align: 'center',
    render(row) {
      return h('span', { style: 'color: #999;' }, row.trialStatus || '--')
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 160,
    fixed: 'right',
    align: 'center',
    render(row) {
      return h(NSpace, { justify: 'center', size: 4 }, {
        default: () => [
          h(NButton, {
            size: 'tiny',
            text: true,
            type: 'primary',
            onClick: () => openEdit(row)
          }, { default: () => '编辑', icon: () => h(NIcon, { component: PencilOutline, size: 14 }) }),
          h(NButton, {
            size: 'tiny',
            text: true,
            type: 'info',
            onClick: () => openDetail(row)
          }, { default: () => '详情', icon: () => h(NIcon, { component: EyeOutline, size: 14 }) }),
          row.isThirdParty
            ? h(NButton, {
                size: 'tiny',
                text: true,
                type: 'error',
                onClick: () => handleDelete(row)
              }, { default: () => '删除', icon: () => h(NIcon, { component: TrashOutline, size: 14 }) })
            : h(NButton, {
                size: 'tiny',
                text: true,
                type: 'primary',
                onClick: () => handleFilms(row)
              }, { default: () => '已购影片', icon: () => h(NIcon, { component: FilmOutline, size: 14 }) })
        ]
      })
    }
  }
]

const pagination = {
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
}

function openDetail(row: Device) {
  currentDevice.value = row
  showDetailModal.value = true
}

function openEdit(row: Device) {
  currentDevice.value = row
  editForm.value = { ...row }
  showEditModal.value = true
}

function handleEdit() {
  if (currentDevice.value && editForm.value) {
    const idx = deviceData.value.findIndex(d => d.id === currentDevice.value!.id)
    if (idx !== -1) {
      deviceData.value[idx] = { ...deviceData.value[idx], ...editForm.value } as Device
    }
  }
  showEditModal.value = false
}

function handleAdd() {
  addFormRef.value?.validate((errors) => {
    if (errors) return
    deviceData.value.unshift({
      id: Date.now(),
      shop: addForm.value.shop,
      type: '第三方设备',
      name: addForm.value.name,
      token: `token_${Math.random().toString(36).slice(2, 10)}`,
      status: 'enabled',
      isThirdParty: true,
      isExpired: false,
      trialStatus: '--'
    })
    showAddModal.value = false
    addForm.value = { name: '', shop: '', price: 20.00, coins: 3, desc: '' }
  })
}

function handleDelete(row: Device) {
  const idx = deviceData.value.findIndex(d => d.id === row.id)
  if (idx !== -1) deviceData.value.splice(idx, 1)
}

function handleFilms(row: Device) {
  console.log('查看已购影片', row.name)
}
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.page-header h1 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}
</style>
