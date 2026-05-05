<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>设备管理</h1>
    </div>

    <n-tabs type="line" animated>
      <!-- Tab 1: 平台分配设备 -->
      <n-tab-pane name="platform" tab="🔗 平台分配设备">
        <n-alert type="info" :bordered="false" style="margin-bottom:16px;">
          以下设备由总运营平台分配，仅可查看。如需修改请联系平台管理员。
        </n-alert>
        <n-data-table
          :columns="platformColumns"
          :data="platformDevices"
          :pagination="{ pageSize: 10 }"
          :bordered="false"
          striped
          size="small"
        />
      </n-tab-pane>

      <!-- Tab 2: 第三方外围设备 -->
      <n-tab-pane name="thirdparty" tab="🔌 第三方外围设备">
        <div style="margin-bottom:16px;display:flex;justify-content:flex-end;">
          <n-button type="primary" size="small" @click="showAddModal = true">
            <template #icon><n-icon :component="AddOutline" /></template>
            添加第三方设备
          </n-button>
        </div>
        <n-alert type="warning" :bordered="false" style="margin-bottom:16px;">
          第三方外围设备由商家自行管理，如扭蛋机、体感机等非核心VR设备。
        </n-alert>
        <n-data-table
          :columns="thirdPartyColumns"
          :data="thirdPartyDevices"
          :pagination="{ pageSize: 10 }"
          :bordered="false"
          striped
          size="small"
        />
      </n-tab-pane>
    </n-tabs>

    <!-- 详情弹窗（平台分配设备） -->
    <n-modal v-model:show="showDetailModal" preset="card" title="设备详情" style="width: 640px;" :bordered="false">
      <n-descriptions v-if="currentDevice" label-placement="left" :column="2" bordered>
        <n-descriptions-item label="设备编号">{{ currentDevice.serialNo }}</n-descriptions-item>
        <n-descriptions-item label="设备名称">{{ currentDevice.name }}</n-descriptions-item>
        <n-descriptions-item label="设备类型">{{ currentDevice.deviceType }}</n-descriptions-item>
        <n-descriptions-item label="硬件参数">{{ currentDevice.params }}</n-descriptions-item>
        <n-descriptions-item label="所属商家">{{ currentDevice.merchant }}</n-descriptions-item>
        <n-descriptions-item label="所属门店">{{ currentDevice.store }}</n-descriptions-item>
        <n-descriptions-item label="设备 Token" :span="2">
          <n-space align="center" size="small" style="display: inline-flex;">
            <n-input :value="currentDevice.token" readonly size="small" style="width: 240px; font-family: monospace;" />
            <n-button size="tiny" secondary @click="copyToken(currentDevice.token)">复制</n-button>
          </n-space>
        </n-descriptions-item>
        <n-descriptions-item label="设备状态">
          <n-tag :type="currentDevice.status === 'allocated' ? 'success' : 'warning'" size="small">
            {{ currentDevice.status === 'allocated' ? '运行中' : '--' }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="分配日期">{{ currentDevice.allocationDate }}</n-descriptions-item>
        <n-descriptions-item label="说明" :span="2">平台统一分配的核心VR设备，不支持商家自行编辑</n-descriptions-item>
      </n-descriptions>
    </n-modal>

    <!-- 添加第三方设备弹窗 -->
    <n-modal v-model:show="showAddModal" preset="card" title="增加第三方设备" style="width: 520px;" :bordered="false">
      <n-form ref="addFormRef" :model="addForm" :rules="addRules" label-placement="left" label-width="140">
        <n-form-item label="店铺选择" path="shop">
          <n-select v-model:value="addForm.shop" :options="shopOptions.filter(s => s.value !== 'all')" placeholder="请选择" />
        </n-form-item>
        <n-form-item label="设备名称" path="name">
          <n-input v-model:value="addForm.name" placeholder="请输入设备名称" />
        </n-form-item>
        <n-form-item label="播放影片单价" path="price">
          <n-input-number v-model:value="addForm.price" :min="0" :precision="2" placeholder="请输入单价" style="width: 100%;" />
        </n-form-item>
        <n-form-item label="播放影片游戏币" path="coins">
          <n-input-number v-model:value="addForm.coins" :min="0" placeholder="请输入游戏币" style="width: 100%;" />
        </n-form-item>
        <n-form-item label="设备状态" path="status">
          <n-radio-group v-model:value="addForm.status">
            <n-space>
              <n-radio value="disabled">禁用</n-radio>
              <n-radio value="enabled">启用</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="支付方式" path="payMethods">
          <n-checkbox-group v-model:value="addForm.payMethods">
            <n-space>
              <n-checkbox value="member">会员储值支付</n-checkbox>
              <n-checkbox value="wechat">平台支付（微信）</n-checkbox>
              <n-checkbox value="staff">员工扫码</n-checkbox>
            </n-space>
          </n-checkbox-group>
        </n-form-item>
        <n-form-item label="描述" path="desc">
          <n-input v-model:value="addForm.desc" type="textarea" placeholder="请描述" :maxlength="50" show-count :rows="4" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="center" style="width: 100%;">
          <n-button type="primary" style="width: 160px;" @click="handleAdd">增加</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 第三方设备：编辑弹窗 -->
    <n-modal v-model:show="showEditModal" preset="card" title="编辑第三方设备" style="width: 520px;" :bordered="false">
      <n-form v-if="currentThirdParty" label-placement="left" label-width="140">
        <n-form-item label="店铺选择">
          <n-select v-model:value="editForm.shop" :options="shopOptions.filter(s => s.value !== 'all')" placeholder="请选择" />
        </n-form-item>
        <n-form-item label="设备名称">
          <n-input v-model:value="editForm.name" placeholder="请输入设备名称" />
        </n-form-item>
        <n-form-item label="播放影片单价">
          <n-input-number v-model:value="editForm.price" :min="0" :precision="2" placeholder="请输入单价" style="width: 100%;" />
        </n-form-item>
        <n-form-item label="播放影片游戏币">
          <n-input-number v-model:value="editForm.points" :min="0" placeholder="请输入游戏币" style="width: 100%;" />
        </n-form-item>
        <n-form-item label="设备状态">
          <n-radio-group v-model:value="editForm.status">
            <n-space>
              <n-radio value="disabled">禁用</n-radio>
              <n-radio value="enabled">启用</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="支付方式">
          <n-checkbox-group v-model:value="editForm.payMethods">
            <n-space>
              <n-checkbox value="member">会员储值支付</n-checkbox>
              <n-checkbox value="wechat">平台支付（微信）</n-checkbox>
              <n-checkbox value="staff">员工扫码</n-checkbox>
            </n-space>
          </n-checkbox-group>
        </n-form-item>
        <n-form-item label="描述">
          <n-input v-model:value="editForm.desc" type="textarea" placeholder="请描述" :maxlength="50" show-count :rows="4" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showEditModal = false">取消</n-button>
          <n-button type="primary" @click="handleEdit">保存</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 删除确认弹窗 -->
    <n-modal v-model:show="showDeleteModal" preset="card" title="提示" style="width: 420px;" :bordered="false" :closable="false">
      <div style="display: flex; align-items: center; gap: 12px; padding: 8px 0;">
        <div style="width: 28px; height: 28px; border-radius: 50%; background: #FBBF24; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <span style="color: #fff; font-size: 16px; font-weight: bold;">!</span>
        </div>
        <span style="font-size: 15px; color: #333;">确定删除当前设备，是否继续？</span>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showDeleteModal = false">取消</n-button>
          <n-button type="primary" @click="confirmDelete">确定</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NDataTable, NButton, NIcon, NSpace, NSelect, NModal, NForm, NFormItem,
  NInput, NInputNumber, NTag, NDescriptions, NDescriptionsItem, NRadioGroup, NRadio,
  NCheckboxGroup, NCheckbox, NTabs, NTabPane, NAlert,
  type DataTableColumns, type FormInst, type FormRules
} from 'naive-ui'
import { AddOutline, PencilOutline, EyeOutline, TrashOutline } from '@vicons/ionicons5'

// ── 平台分配设备（只读） ──────────────────────────
interface PlatformDevice {
  id: number
  serialNo: string
  name: string
  deviceType: string
  params: string
  merchant: string
  store: string
  token: string
  status: 'allocated'
  allocationDate: string
  createdAt: string
}

const platformDevices = ref<PlatformDevice[]>([
  { id: 1, serialNo: 'VR-XF-0001', name: '悬浮骑兵 #01', deviceType: '悬浮骑兵', params: 'i7-9700/RTX2060/16G', merchant: '利民街商家', store: '利民街小展厅', token: 'token_abc123_def456', status: 'allocated', allocationDate: '2026-04-15', createdAt: '2026-03-10' },
  { id: 2, serialNo: 'VR-XF-0002', name: '悬浮骑兵 #02', deviceType: '悬浮骑兵', params: 'i7-9700/RTX2060/16G', merchant: '利民街商家', store: '利民街小展厅', token: 'token_def456_ghi789', status: 'allocated', allocationDate: '2026-04-15', createdAt: '2026-03-10' },
  { id: 3, serialNo: 'VR-AX-0003', name: '暗黑行者 #01', deviceType: '暗黑行者', params: 'i9-10900/RTX3060/32G', merchant: '利民街商家', store: '利民街小展厅', token: 'token_pqr678_stu012', status: 'allocated', allocationDate: '2026-04-15', createdAt: '2026-03-10' },
  { id: 4, serialNo: 'VR-AJ-0004', name: '暗黑机甲', deviceType: '暗黑机甲', params: 'i9-11900/RTX3080/32G', merchant: '利民街商家', store: '利民街小展厅', token: 'token_vwx234_yza567', status: 'allocated', allocationDate: '2026-04-15', createdAt: '2026-03-10' },
  { id: 5, serialNo: 'VR-HY-0005', name: '幻影飞碟', deviceType: '幻影飞碟', params: 'i9-12900/RTX4090/64G', merchant: '卓远科技', store: '卓远萧山区店', token: 'token_nop012_qrs345', status: 'allocated', allocationDate: '2026-04-15', createdAt: '2026-03-10' },
  { id: 6, serialNo: 'VR-XF-0006', name: '悬浮骑兵 #03', deviceType: '悬浮骑兵', params: 'i7-9700/RTX2060/16G', merchant: '恒然集团', store: '恒然科技园店', token: 'token_bcd890_efg123', status: 'allocated', allocationDate: '2026-04-20', createdAt: '2026-03-15' },
])

const showDetailModal = ref(false)
const currentDevice = ref<PlatformDevice | null>(null)

const platformColumns: DataTableColumns<PlatformDevice> = [
  { title: '设备编号', key: 'serialNo', width: 130 },
  { title: '设备名称', key: 'name', minWidth: 140 },
  { title: '设备类型', key: 'deviceType', width: 100 },
  { title: '硬件参数', key: 'params', minWidth: 160 },
  { title: '所属商家', key: 'merchant', minWidth: 100 },
  { title: '所属门店', key: 'store', minWidth: 120 },
  {
    title: 'Token', key: 'token', minWidth: 220,
    render: (row: PlatformDevice) => h(NSpace, { align: 'center', size: 4 }, {
      default: () => [
        h('span', { style: 'font-family: monospace; font-size: 12px;' }, row.token),
        h(NButton, { size: 'tiny', text: true, type: 'primary', onClick: () => copyToken(row.token) }, { default: () => '复制' })
      ]
    })
  },
  { title: '分配日期', key: 'allocationDate', width: 100 },
  {
    title: '操作', key: 'actions', width: 80, align: 'center' as const,
    render: (row: PlatformDevice) => h(NButton, {
      size: 'tiny', text: true, type: 'info',
      onClick: () => { currentDevice.value = row; showDetailModal.value = true }
    }, { default: () => '详情' })
  },
]

// ── 第三方外围设备（商家自管理） ──────────────────
interface ThirdPartyDevice {
  id: number
  shop: string
  name: string
  token: string
  status: 'enabled' | 'disabled'
  onlineStatus: 'online' | 'offline'
  price: number
  points: number
  payMethods: string[]
  desc: string
}

const shopOptions = [
  { label: '全部店铺', value: 'all' },
  { label: '利民街小展厅', value: '利民街小展厅' },
]

const selectedShop = ref('all')

const thirdPartyDevices = ref<ThirdPartyDevice[]>([
  { id: 101, shop: '利民街小展厅', name: '扭蛋机', token: `tp_${Math.random().toString(36).slice(2, 8)}`, status: 'enabled', onlineStatus: 'online', price: 20, points: 3, payMethods: ['member'], desc: '第三方扭蛋设备' },
  { id: 102, shop: '利民街小展厅', name: '体感游戏机', token: `tp_${Math.random().toString(36).slice(2, 8)}`, status: 'enabled', onlineStatus: 'online', price: 15, points: 2, payMethods: ['member'], desc: '第三方体感设备' },
])

const filteredThirdParty = computed(() => {
  if (selectedShop.value === 'all') return thirdPartyDevices.value
  return thirdPartyDevices.value.filter(d => d.shop === selectedShop.value)
})

const thirdPartyColumns: DataTableColumns<ThirdPartyDevice> = [
  { title: '店铺', key: 'shop', minWidth: 140 },
  { title: '设备名称', key: 'name', minWidth: 140 },
  {
    title: '启用状态', key: 'status', width: 90, align: 'center' as const,
    render: (row: ThirdPartyDevice) => h(NTag, { size: 'small', type: row.status === 'enabled' ? 'success' : 'error' }, { default: () => row.status === 'enabled' ? '启用' : '禁用' })
  },
  {
    title: '在线状态', key: 'onlineStatus', width: 90, align: 'center' as const,
    render: (row: ThirdPartyDevice) => h(NTag, { size: 'small', type: row.onlineStatus === 'online' ? 'success' : 'error' }, { default: () => row.onlineStatus === 'online' ? '在线' : '离线' })
  },
  { title: '单价', key: 'price', width: 80, align: 'center' as const },
  { title: '游戏币', key: 'points', width: 70, align: 'center' as const },
  {
    title: '操作', key: 'actions', width: 140, align: 'center' as const,
    render: (row: ThirdPartyDevice) => h(NSpace, { justify: 'center', size: 4 }, {
      default: () => [
        h(NButton, { size: 'tiny', text: true, type: 'primary', onClick: () => openEdit(row) }, { default: () => '编辑' }),
        h(NButton, { size: 'tiny', text: true, type: 'error', onClick: () => handleDelete(row) }, { default: () => '删除' }),
      ]
    })
  },
]

// ── 第三方设备 CRUD ──────────────────────────────
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const addFormRef = ref<FormInst | null>(null)
const currentThirdParty = ref<ThirdPartyDevice | null>(null)
const deleteTarget = ref<ThirdPartyDevice | null>(null)

const addForm = ref({
  name: '', shop: '', price: 20.00, coins: 3, status: 'enabled' as 'enabled' | 'disabled',
  payMethods: ['member'] as string[], desc: ''
})

const editForm = ref<Partial<ThirdPartyDevice>>({})

const addRules: FormRules = {
  shop: { required: true, message: '请选择店铺', trigger: 'change' },
  name: { required: true, message: '请输入设备名称', trigger: 'blur' },
  price: { required: true, type: 'number', message: '请输入播放影片单价', trigger: 'blur' },
}

function handleAdd() {
  addFormRef.value?.validate((errors) => {
    if (errors) return
    thirdPartyDevices.value.unshift({
      id: Date.now(),
      shop: addForm.value.shop,
      name: addForm.value.name,
      token: `tp_${Math.random().toString(36).slice(2, 10)}`,
      status: addForm.value.status,
      onlineStatus: 'online',
      price: addForm.value.price,
      points: addForm.value.coins,
      payMethods: addForm.value.payMethods,
      desc: addForm.value.desc,
    })
    showAddModal.value = false
    addForm.value = { name: '', shop: '', price: 20.00, coins: 3, status: 'enabled', payMethods: ['member'], desc: '' }
  })
}

function openEdit(row: ThirdPartyDevice) {
  currentThirdParty.value = row
  editForm.value = { shop: row.shop, name: row.name, price: row.price, points: row.points, status: row.status, payMethods: [...row.payMethods], desc: row.desc }
  showEditModal.value = true
}

function handleEdit() {
  if (currentThirdParty.value && editForm.value) {
    const idx = thirdPartyDevices.value.findIndex(d => d.id === currentThirdParty.value!.id)
    if (idx !== -1) thirdPartyDevices.value[idx] = { ...thirdPartyDevices.value[idx], ...editForm.value } as ThirdPartyDevice
  }
  showEditModal.value = false
}

function handleDelete(row: ThirdPartyDevice) {
  deleteTarget.value = row
  showDeleteModal.value = true
}

function confirmDelete() {
  if (deleteTarget.value) {
    const idx = thirdPartyDevices.value.findIndex(d => d.id === deleteTarget.value!.id)
    if (idx !== -1) thirdPartyDevices.value.splice(idx, 1)
  }
  showDeleteModal.value = false
  deleteTarget.value = null
}

function copyToken(token: string) {
  navigator.clipboard.writeText(token).then(() => window.$message?.success('Token 已复制到剪贴板'))
}
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
}
.page-header h1 {
  font-size: 20px; font-weight: 600; color: #333; margin: 0;
}
</style>
