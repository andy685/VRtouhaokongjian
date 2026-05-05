<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">设备配置管理</h1>
    </div>

    <n-tabs type="line" animated>
      <!-- ========== Tab 1: 设备类型 ========== -->
      <n-tab-pane name="types" tab="设备类型">
        <div class="section-toolbar">
          <n-button type="primary" size="small" @click="showTypeModal = true">
            <template #icon><n-icon :component="AddOutline" /></template>
            新增设备类型
          </n-button>
        </div>
        <n-data-table :columns="typeColumns" :data="deviceTypes" :bordered="false" size="small" striped />
      </n-tab-pane>

      <!-- ========== Tab 2: 设备分配（核心功能） ========== -->
      <n-tab-pane name="allocate" tab="📋 设备分配">
        <!-- 统计卡片 -->
        <div class="stats-row">
          <div class="stat-card"><span class="stat-num">{{ allDevices.length }}</span><span class="stat-lbl">设备总数</span></div>
          <div class="stat-card"><span class="stat-num">{{ allocatedCount }}</span><span class="stat-lbl">已分配</span></div>
          <div class="stat-card"><span class="stat-num">{{ unallocatedCount }}</span><span class="stat-lbl">待分配</span></div>
          <div class="stat-card"><span class="stat-num">{{ faultCount }}</span><span class="stat-lbl">故障/报废</span></div>
        </div>

        <!-- 筛选栏 -->
        <div class="filter-bar">
          <n-select v-model:value="allocFilterType" :options="[{label:'全部类型',value:''},...typeOpts]" placeholder="设备类型" style="width:140px;" clearable size="small" />
          <n-select v-model:value="allocFilterStatus" :options="statusOpts" placeholder="分配状态" style="width:130px;" clearable size="small" />
          <n-select v-model:value="allocFilterMerchant" :options="merchantOpts" placeholder="所属商家" style="width:150px;" clearable size="small" />
          <n-input v-model:value="allocFilterKeyword" placeholder="搜索设备编号/名称" style="width:200px;" clearable size="small" />
          <div class="filter-actions">
            <n-button size="small" @click="resetAllocFilter">重置</n-button>
          </div>
        </div>

        <!-- 操作栏 -->
        <div class="section-toolbar between">
          <n-space>
            <n-button type="primary" size="small" @click="showAddDeviceModal = true">
              <template #icon><n-icon :component="AddOutline" /></template>
              录入新设备
            </n-button>
            <n-button secondary size="small" :disabled="selectedIds.length === 0" @click="showBatchAllocModal = true">
              <template #icon><n-icon :component="ArrowForwardOutline" /></template>
              批量分配 ({{ selectedIds.length }})
            </n-button>
          </n-space>
        </div>

        <n-data-table
          :columns="deviceColumns"
          :data="filteredDevices"
          :bordered="false"
          size="small"
          striped
          :row-key="(row:any)=>row.id"
          @update:checked-row-keys="selectedIds = $event"
        />
      </n-tab-pane>

      <!-- ========== Tab 3: Token 管理 ========== -->
      <n-tab-pane name="tokens" tab="Token 管理">
        <div class="filter-bar">
          <n-select v-model:value="tokenFilterStatus" :options="[{label:'全部状态',value:''},{label:'有效',value:'active'},{label:'已过期',value:'expired'},{label:'已吊销',value:'revoked'}]" style="width:130px;" clearable size="small" />
          <n-input v-model:value="tokenFilterKeyword" placeholder="搜索设备名称/Token" style="width:240px;" clearable size="small" />
        </div>
        <n-data-table :columns="tokenColumns" :data="filteredTokens" :bordered="false" size="small" striped />
      </n-tab-pane>

      <!-- ========== Tab 4: OTA 升级 ========== -->
      <n-tab-pane name="ota" tab="OTA 升级">
        <div class="section-toolbar">
          <n-button type="primary" size="small" @click="showOtaModal = true">
            <template #icon><n-icon :component="CloudUploadOutline" /></template>
            上传升级包
          </n-button>
        </div>
        <n-data-table :columns="otaColumns" :data="otaPackages" :bordered="false" size="small" striped />
      </n-tab-pane>
    </n-tabs>

    <!-- ===== 弹窗：新增设备类型 ===== -->
    <n-modal v-model:show="showTypeModal" preset="card" title="新增设备类型" style="width:480px;" :bordered="false">
      <n-form ref="typeFormRef" :model="typeForm" :rules="typeRules" label-placement="left" label-width="100">
        <n-form-item label="类型名称" path="name"><n-input v-model:value="typeForm.name" placeholder="如：悬浮骑兵、暗黑行者" /></n-form-item>
        <n-form-item label="描述" path="desc"><n-input v-model:value="typeForm.desc" type="textarea" :rows="3" placeholder="设备类型描述" /></n-form-item>
        <n-form-item label="默认参数" path="params"><n-input v-model:value="typeForm.params" type="textarea" :rows="3" placeholder="默认硬件参数" /></n-form-item>
      </n-form>
      <template #footer><n-space justify="center"><n-button @click="showTypeModal=false">取消</n-button><n-button type="primary" @click="handleAddType">确定</n-button></n-space></template>
    </n-modal>

    <!-- ===== 弹窗：录入新设备 ===== -->
    <n-modal v-model:show="showAddDeviceModal" preset="card" title="录入新设备" style="width:520px;" :bordered="false">
      <n-form ref="addDeviceFormRef" :model="addDeviceForm" :rules="addDeviceRules" label-placement="left" label-width="110">
        <n-form-item label="设备类型" path="type">
          <n-select v-model:value="addDeviceForm.type" :options="typeOpts" placeholder="选择设备类型" />
        </n-form-item>
        <n-form-item label="设备编号" path="serialNo">
          <n-input v-model:value="addDeviceForm.serialNo" placeholder="出厂编号/序列号" />
        </n-form-item>
        <n-form-item label="设备名称" path="name">
          <n-input v-model:value="addDeviceForm.name" placeholder="自动生成或手动输入" />
        </n-form-item>
        <n-form-item label="硬件参数" path="params">
          <n-input v-model:value="addDeviceForm.params" placeholder="如：i7-9700/RTX2060/16G" />
        </n-form-item>
        <n-form-item label="备注" path="notes">
          <n-input v-model:value="addDeviceForm.notes" type="textarea" :rows="2" placeholder="选填" />
        </n-form-item>
      </n-form>
      <template #footer><n-space justify="center"><n-button @click="showAddDeviceModal=false">取消</n-button><n-button type="primary" @click="handleAddDevice">录入</n-button></n-space></template>
    </n-modal>

    <!-- ===== 弹窗：分配设备 ===== -->
    <n-modal v-model:show="showAllocModal" preset="card" title="分配设备" style="width:480px;" :bordered="false">
      <n-form ref="allocFormRef" :model="allocForm" :rules="allocRules" label-placement="left" label-width="100">
        <n-descriptions :column="1" bordered size="small">
          <n-descriptions-item label="设备">{{ allocForm.deviceName }}</n-descriptions-item>
          <n-descriptions-item label="类型">{{ allocForm.deviceType }}</n-descriptions-item>
        </n-descriptions>
        <div style="height:16px;" />
        <n-form-item label="分配商家" path="merchant">
          <n-select v-model:value="allocForm.merchant" :options="merchantOpts" placeholder="选择商家" filterable @update:value="allocForm.store=''" />
        </n-form-item>
        <n-form-item label="分配店铺" path="store">
          <n-select v-model:value="allocForm.store" :options="getStoreOpts(allocForm.merchant)" placeholder="先选商家 → 再选门店" filterable :disabled="!allocForm.merchant" />
        </n-form-item>
      </n-form>
      <template #footer><n-space justify="center"><n-button @click="showAllocModal=false">取消</n-button><n-button type="primary" @click="handleAlloc">确认分配</n-button></n-space></template>
    </n-modal>

    <!-- ===== 弹窗：批量分配 ===== -->
    <n-modal v-model:show="showBatchAllocModal" preset="card" title="批量分配设备" style="width:480px;" :bordered="false">
      <p style="font-size:13px;color:#64748b;margin-bottom:16px;">已选择 <strong>{{ selectedIds.length }}</strong> 台设备，将统一分配到同一店铺。</p>
      <n-form ref="batchAllocFormRef" :model="batchAllocForm" :rules="allocRules" label-placement="left" label-width="100">
        <n-form-item label="分配商家" path="merchant">
          <n-select v-model:value="batchAllocForm.merchant" :options="merchantOpts" placeholder="选择商家" filterable @update:value="batchAllocForm.store=''" />
        </n-form-item>
        <n-form-item label="分配店铺" path="store">
          <n-select v-model:value="batchAllocForm.store" :options="getStoreOpts(batchAllocForm.merchant)" placeholder="先选商家 → 再选门店" filterable :disabled="!batchAllocForm.merchant" />
        </n-form-item>
      </n-form>
      <template #footer><n-space justify="center"><n-button @click="showBatchAllocModal=false">取消</n-button><n-button type="primary" @click="handleBatchAlloc">批量分配</n-button></n-space></template>
    </n-modal>

    <!-- ===== 弹窗：上传 OTA 包 ===== -->
    <n-modal v-model:show="showOtaModal" preset="card" title="上传 OTA 升级包" style="width:520px;" :bordered="false">
      <n-form ref="otaFormRef" :model="otaForm" :rules="otaRules" label-placement="left" label-width="100">
        <n-form-item label="升级包名称" path="name"><n-input v-model:value="otaForm.name" placeholder="如：v2.1.0 固件升级" /></n-form-item>
        <n-form-item label="目标设备" path="targetType"><n-select v-model:value="otaForm.targetType" :options="typeOpts" placeholder="选择目标设备类型" /></n-form-item>
        <n-form-item label="版本号" path="version"><n-input v-model:value="otaForm.version" placeholder="如：v2.1.0" /></n-form-item>
        <n-form-item label="更新说明" path="notes"><n-input v-model:value="otaForm.notes" type="textarea" :rows="4" placeholder="更新内容和注意事项" /></n-form-item>
        <n-form-item label="升级文件" path="file"><n-upload :default-upload="false" :max="1" accept=".bin,.zip,.img"><n-button>选择文件</n-button></n-upload></n-form-item>
      </n-form>
      <template #footer><n-space justify="center"><n-button @click="showOtaModal=false">取消</n-button><n-button type="primary" @click="handleUploadOta">上传</n-button></n-space></template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NTabs, NTabPane, NDataTable, NButton, NIcon, NSpace, NInput,
  NModal, NForm, NFormItem, NSelect, NTag, NUpload, NDescriptions, NDescriptionsItem,
  type FormInst, type FormRules
} from 'naive-ui'
import {
  AddOutline, CloudUploadOutline, RefreshOutline,
  ArrowForwardOutline, CheckmarkCircleOutline, CloseCircleOutline
} from '@vicons/ionicons5'

// ─────────────────────────────────────────────
// 1. 设备类型管理
// ─────────────────────────────────────────────
interface DeviceType { id: number; name: string; desc: string; params: string; deviceCount: number; createdAt: string }

const deviceTypes = ref<DeviceType[]>([
  { id: 1, name: '悬浮骑兵', desc: '双人座VR骑乘设备', params: 'i7-9700/RTX2060/16G', deviceCount: 8, createdAt: '2023-05-01' },
  { id: 2, name: '暗黑行者', desc: '单人座VR步行射击设备', params: 'i9-10900/RTX3060/32G', deviceCount: 6, createdAt: '2023-05-15' },
  { id: 3, name: '暗黑机甲', desc: '双人座VR机甲对战设备', params: 'i9-11900/RTX3080/32G', deviceCount: 1, createdAt: '2023-06-01' },
  { id: 4, name: '幻影飞碟', desc: '六人座VR沉浸式飞碟', params: 'i9-12900/RTX4090/64G', deviceCount: 2, createdAt: '2024-01-10' },
])

const typeOpts = computed(() => deviceTypes.value.map(t => ({ label: t.name, value: t.name })))

const typeColumns = [
  { title: '类型名称', key: 'name', minWidth: 120 },
  { title: '描述', key: 'desc', minWidth: 180 },
  { title: '默认硬件参数', key: 'params', minWidth: 200 },
  { title: '设备数量', key: 'deviceCount', width: 90, align: 'center' as const },
  { title: '创建时间', key: 'createdAt', width: 120 },
  { title: '操作', key: 'actions', width: 120, align: 'center' as const, render: () => h(NButton, { size: 'tiny', text: true, type: 'primary' }, { default: () => '编辑' }) },
]

const showTypeModal = ref(false)
const typeFormRef = ref<FormInst | null>(null)
const typeForm = ref({ name: '', desc: '', params: '' })
const typeRules: FormRules = { name: { required: true, message: '请输入类型名称', trigger: 'blur' } }

function handleAddType() {
  typeFormRef.value?.validate(e => {
    if (e) return
    deviceTypes.value.unshift({ id: Date.now(), name: typeForm.value.name, desc: typeForm.value.desc, params: typeForm.value.params, deviceCount: 0, createdAt: new Date().toISOString().slice(0, 10) })
    showTypeModal.value = false; typeForm.value = { name: '', desc: '', params: '' }
    window.$message?.success('设备类型已添加')
  })
}

// ─────────────────────────────────────────────
// 2. 设备分配（核心）
// ─────────────────────────────────────────────
type AllocStatus = 'unallocated' | 'allocated' | 'fault' | 'retired'

interface HardwareDevice {
  id: number
  serialNo: string      // 出厂编号
  name: string
  deviceType: string
  params: string
  status: AllocStatus
  merchant: string      // 所属商家
  store: string         // 所属门店
  token: string
  allocationDate: string
  createdAt: string
}

const storeNames = ['利民街小展厅', '恒然科技园店', '恒然分部展厅', '党建馆', '华东展厅', '卓远萝岗区店', '卓远萧山区店', '卓远亚运城店']
const merchantNames = ['恒然集团', '利民街商家', '党建馆集团', '华东展厅', '卓远科技']

// 商家 → 店铺 关联关系（一个商家可拥有多家门店）
const merchantStoreMap: Record<string, string[]> = {
  '恒然集团': ['恒然科技园店', '恒然分部展厅'],
  '利民街商家': ['利民街小展厅'],
  '党建馆集团': ['党建馆'],
  '华东展厅': ['华东展厅'],
  '卓远科技': ['卓远萝岗区店', '卓远萧山区店', '卓远亚运城店'],
}
// 所有店铺去重列表
const allStoreNames = [...new Set(Object.values(merchantStoreMap).flat())]

const deviceTypesList = ['悬浮骑兵', '暗黑行者', '暗黑机甲', '幻影飞碟']

// 生成一批模拟设备，展示筛选用
function generateMockDevices(count: number): HardwareDevice[] {
  const result: HardwareDevice[] = []
  for (let i = 1; i <= count; i++) {
    const dt = deviceTypesList[i % deviceTypesList.length]
    const isAllocated = i > 5 // 前5台未分配，后面的已分配
    const isFault = i > 40 && i % 7 === 0 // 部分故障
    const isRetired = i > 50 && i % 11 === 0
    const status: AllocStatus = isRetired ? 'retired' : isFault ? 'fault' : isAllocated ? 'allocated' : 'unallocated'
    const merchantIdx = i % merchantNames.length
    const chosenMerchant = merchantNames[merchantIdx]
    const merchantStores = merchantStoreMap[chosenMerchant]
    const storeIdx = i % merchantStores.length
    const serialNo = `VR-${dt.substring(0, 2).toUpperCase()}-${String(i).padStart(4, '0')}`
    result.push({
      id: i,
      serialNo,
      name: `${dt} #${String(i).padStart(2, '0')}`,
      deviceType: dt,
      params: 'i7-9700/RTX2060/16G',
      status,
      merchant: isAllocated ? chosenMerchant : '--',
      store: isAllocated ? merchantStores[storeIdx] : '--',
      token: isAllocated ? `token_${Math.random().toString(36).slice(2, 10)}` : '--',
      allocationDate: isAllocated ? '2026-04-15' : '--',
      createdAt: '2026-03-10',
    })
  }
  return result
}

const allDevices = ref<HardwareDevice[]>(generateMockDevices(60))

const selectedIds = ref<number[]>([])

// 统计
const allocatedCount = computed(() => allDevices.value.filter(d => d.status === 'allocated').length)
const unallocatedCount = computed(() => allDevices.value.filter(d => d.status === 'unallocated').length)
const faultCount = computed(() => allDevices.value.filter(d => d.status === 'fault' || d.status === 'retired').length)

// 筛选条件
const allocFilterType = ref('')
const allocFilterStatus = ref('')
const allocFilterMerchant = ref('')
const allocFilterKeyword = ref('')

const statusOpts = [
  { label: '全部状态', value: '' },
  { label: '待分配', value: 'unallocated' },
  { label: '已分配', value: 'allocated' },
  { label: '故障', value: 'fault' },
  { label: '报废', value: 'retired' },
]

const merchantOpts = computed(() => [
  { label: '全部商家', value: '' },
  ...merchantNames.map(m => ({ label: m, value: m }))
])

// 根据筛选的商家，动态计算可用的店铺选项
const storeOptsForFilter = computed(() => {
  if (!allocFilterMerchant.value) return allStoreNames.map(s => ({ label: s, value: s }))
  return (merchantStoreMap[allocFilterMerchant.value] || []).map(s => ({ label: s, value: s }))
})

// 分配弹窗用的店铺选项（依赖当前选中的商家）
function getStoreOpts(merchant: string) {
  if (!merchant) return []
  return (merchantStoreMap[merchant] || []).map(s => ({ label: s, value: s }))
}

const filteredDevices = computed(() => {
  let list = allDevices.value
  if (allocFilterType.value) list = list.filter(d => d.deviceType === allocFilterType.value)
  if (allocFilterStatus.value) list = list.filter(d => d.status === allocFilterStatus.value)
  if (allocFilterMerchant.value) list = list.filter(d => d.merchant === allocFilterMerchant.value)
  if (allocFilterKeyword.value) {
    const kw = allocFilterKeyword.value.toLowerCase()
    list = list.filter(d => d.serialNo.toLowerCase().includes(kw) || d.name.toLowerCase().includes(kw))
  }
  return list
})

function resetAllocFilter() {
  allocFilterType.value = ''
  allocFilterStatus.value = ''
  allocFilterMerchant.value = ''
  allocFilterKeyword.value = ''
}

const statusRender = (status: AllocStatus) => {
  const map: Record<string, { type: 'success' | 'info' | 'warning' | 'error' | 'default', label: string }> = {
    allocated: { type: 'success', label: '已分配' },
    unallocated: { type: 'info', label: '待分配' },
    fault: { type: 'warning', label: '故障' },
    retired: { type: 'error', label: '报废' },
  }
  return h(NTag, { size: 'small', type: map[status].type }, { default: () => map[status].label })
}

const deviceColumns = [
  { type: 'selection' as const, width: 40 },
  { title: '设备编号', key: 'serialNo', width: 130 },
  { title: '设备名称', key: 'name', minWidth: 140 },
  { title: '设备类型', key: 'deviceType', width: 100 },
  { title: '硬件参数', key: 'params', minWidth: 160 },
  { title: '所属商家', key: 'merchant', minWidth: 100 },
  { title: '所属门店', key: 'store', minWidth: 120 },
  {
    title: '状态', key: 'status', width: 80, align: 'center' as const,
    render: (row: HardwareDevice) => statusRender(row.status)
  },
  { title: '分配日期', key: 'allocationDate', width: 100 },
  {
    title: '操作', key: 'actions', width: 100, align: 'center' as const,
    render: (row: HardwareDevice) => {
      if (row.status === 'unallocated') {
        return h(NButton, {
          size: 'tiny', text: true, type: 'primary',
          onClick: () => openAllocDialog(row)
        }, { default: () => '分配' })
      }
      if (row.status === 'allocated') {
        return h(NButton, {
          size: 'tiny', text: true, type: 'warning',
          onClick: () => {
            row.status = 'unallocated'; row.merchant = '--'; row.store = '--'; row.token = '--'; row.allocationDate = '--'
            selectedIds.value = selectedIds.value.filter(id => id !== row.id)
            window.$message?.info(`已取消分配：${row.name}`)
          }
        }, { default: () => '取消分配' })
      }
      return null
    }
  },
]

// 录入新设备
const showAddDeviceModal = ref(false)
const addDeviceFormRef = ref<FormInst | null>(null)
const addDeviceForm = ref({ type: '', serialNo: '', name: '', params: '', notes: '' })
const addDeviceRules: FormRules = {
  type: { required: true, message: '请选择设备类型', trigger: 'change' },
  serialNo: { required: true, message: '请输入设备编号', trigger: 'blur' },
}

function handleAddDevice() {
  addDeviceFormRef.value?.validate(e => {
    if (e) return
    const type = addDeviceForm.value.type
    const serialNo = addDeviceForm.value.serialNo
    allDevices.value.unshift({
      id: Date.now(),
      serialNo,
      name: addDeviceForm.value.name || `${type} ${serialNo}`,
      deviceType: type,
      params: addDeviceForm.value.params || '--',
      status: 'unallocated',
      merchant: '--',
      store: '--',
      token: '--',
      allocationDate: '--',
      createdAt: new Date().toISOString().slice(0, 10),
    })
    const dt = deviceTypes.value.find(t => t.name === type)
    if (dt) dt.deviceCount++
    showAddDeviceModal.value = false
    addDeviceForm.value = { type: '', serialNo: '', name: '', params: '', notes: '' }
    window.$message?.success('设备已录入，请前往分配')
  })
}

// 单个分配
const showAllocModal = ref(false)
const allocFormRef = ref<FormInst | null>(null)
const allocForm = ref({ deviceId: 0, deviceName: '', deviceType: '', merchant: '', store: '' })
const allocRules: FormRules = {
  merchant: { required: true, message: '请选择商家', trigger: 'change' },
  store: { required: true, message: '请选择门店', trigger: 'change' },
}

function openAllocDialog(device: HardwareDevice) {
  allocForm.value = { deviceId: device.id, deviceName: device.name, deviceType: device.deviceType, merchant: '', store: '' }
  showAllocModal.value = true
}

function handleAlloc() {
  allocFormRef.value?.validate(e => {
    if (e) return
    const device = allDevices.value.find(d => d.id === allocForm.value.deviceId)
    if (device) {
      device.status = 'allocated'
      device.merchant = allocForm.value.merchant
      device.store = allocForm.value.store
      device.token = `token_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`
      device.allocationDate = new Date().toISOString().slice(0, 10)
    }
    showAllocModal.value = false
    window.$message?.success(`设备已分配给 ${allocForm.value.store}`)
  })
}

// 批量分配
const showBatchAllocModal = ref(false)
const batchAllocFormRef = ref<FormInst | null>(null)
const batchAllocForm = ref({ merchant: '', store: '' })

function handleBatchAlloc() {
  batchAllocFormRef.value?.validate(e => {
    if (e) return
    const now = new Date().toISOString().slice(0, 10)
    let count = 0
    allDevices.value.forEach(d => {
      if (selectedIds.value.includes(d.id) && d.status === 'unallocated') {
        d.status = 'allocated'
        d.merchant = batchAllocForm.value.merchant
        d.store = batchAllocForm.value.store
        d.token = `token_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`
        d.allocationDate = now
        count++
      }
    })
    showBatchAllocModal.value = false
    selectedIds.value = []
    window.$message?.success(`成功批量分配 ${count} 台设备到 ${batchAllocForm.value.store}`)
  })
}

// ─────────────────────────────────────────────
// 3. Token 管理
// ─────────────────────────────────────────────
interface TokenItem { id: number; deviceName: string; deviceType: string; store: string; token: string; status: 'active' | 'expired' | 'revoked'; createdAt: string; lastUsed: string }

const tokenData = ref<TokenItem[]>([
  { id: 1, deviceName: '悬浮骑兵 #01', deviceType: '悬浮骑兵', store: '利民街小展厅', token: 'token_abc123_def456', status: 'active', createdAt: '2023-06-01', lastUsed: '2026-05-05 16:30:00' },
  { id: 2, deviceName: '悬浮骑兵 #02', deviceType: '悬浮骑兵', store: '利民街小展厅', token: 'token_def456_ghi789', status: 'active', createdAt: '2023-06-01', lastUsed: '2026-05-05 15:22:10' },
  { id: 3, deviceName: '暗黑行者 #01', deviceType: '暗黑行者', store: '利民街小展厅', token: 'token_pqr678_stu012', status: 'active', createdAt: '2023-09-10', lastUsed: '2026-05-04 18:45:30' },
  { id: 4, deviceName: '暗黑机甲', deviceType: '暗黑机甲', store: '利民街小展厅', token: 'token_vwx234_yza567', status: 'active', createdAt: '2023-02-01', lastUsed: '2026-05-05 14:12:00' },
  { id: 5, deviceName: '幻影飞碟', deviceType: '幻影飞碟', store: '卓远萧山区店', token: 'token_nop012_qrs345', status: 'revoked', createdAt: '2024-02-15', lastUsed: '2026-04-28 09:30:00' },
  { id: 6, deviceName: '悬浮骑兵 #10', deviceType: '悬浮骑兵', store: '恒然科技园店', token: 'token_bcd890_efg123', status: 'expired', createdAt: '2023-06-01', lastUsed: '2026-03-15 11:20:00' },
])

const tokenFilterStatus = ref('')
const tokenFilterKeyword = ref('')

const filteredTokens = computed(() => {
  let list = tokenData.value
  if (tokenFilterStatus.value) list = list.filter(t => t.status === tokenFilterStatus.value)
  if (tokenFilterKeyword.value) {
    const kw = tokenFilterKeyword.value.toLowerCase()
    list = list.filter(t => t.deviceName.toLowerCase().includes(kw) || t.token.toLowerCase().includes(kw))
  }
  return list
})

const tokenColumns = [
  { title: '设备名称', key: 'deviceName', minWidth: 140 },
  { title: '设备类型', key: 'deviceType', width: 100 },
  { title: '所属店铺', key: 'store', minWidth: 120 },
  {
    title: 'Token', key: 'token', minWidth: 280,
    render: (row: TokenItem) => h(NSpace, { align: 'center', size: 4 }, {
      default: () => [
        h('span', { style: 'font-family: monospace; font-size: 12px;' }, row.token),
        h(NButton, { size: 'tiny', text: true, type: 'primary', onClick: () => navigator.clipboard.writeText(row.token).then(() => window.$message?.success('已复制')) }, { default: () => '复制' })
      ]
    })
  },
  {
    title: '状态', key: 'status', width: 80, align: 'center' as const,
    render: (row: TokenItem) => {
      const m = { active: { type: 'success' as const, label: '有效' }, expired: { type: 'warning' as const, label: '已过期' }, revoked: { type: 'error' as const, label: '已吊销' } }
      return h(NTag, { size: 'small', type: m[row.status].type }, { default: () => m[row.status].label })
    }
  },
  { title: '创建时间', key: 'createdAt', width: 100 },
  { title: '最后使用', key: 'lastUsed', minWidth: 150 },
  {
    title: '操作', key: 'actions', width: 80, align: 'center' as const,
    render: (row: TokenItem) => row.status !== 'active' ? null : h(NButton, {
      size: 'tiny', text: true, type: 'error',
      onClick: () => { row.status = 'revoked'; window.$message?.warning(`Token 已吊销，设备 ${row.deviceName} 需重新获取`) }
    }, { default: () => '吊销' })
  },
]

// ─────────────────────────────────────────────
// 4. OTA 升级
// ─────────────────────────────────────────────
interface OtaPackage { id: number; name: string; targetType: string; version: string; size: string; status: 'pending' | 'publishing' | 'done' | 'failed'; notes: string; createdAt: string }

const otaPackages = ref<OtaPackage[]>([
  { id: 1, name: '悬浮骑兵 v2.1.0 固件', targetType: '悬浮骑兵', version: 'v2.1.0', size: '128MB', status: 'done', notes: '修复电机抖动问题，优化性能', createdAt: '2026-04-20' },
  { id: 2, name: '暗黑行者 v1.8.0 固件', targetType: '暗黑行者', version: 'v1.8.0', size: '96MB', status: 'publishing', notes: '新增摇杆校准功能，修复蓝牙断连', createdAt: '2026-05-01' },
  { id: 3, name: '幻影飞碟安全补丁', targetType: '幻影飞碟', version: 'v3.0.1', size: '52MB', status: 'pending', notes: '安全漏洞修复，建议立即升级', createdAt: '2026-05-03' },
])

const otaColumns = [
  { title: '升级包名称', key: 'name', minWidth: 180 },
  { title: '目标设备', key: 'targetType', width: 100 },
  { title: '版本', key: 'version', width: 80 },
  { title: '大小', key: 'size', width: 80, align: 'center' as const },
  {
    title: '状态', key: 'status', width: 90, align: 'center' as const,
    render: (row: OtaPackage) => {
      const map: Record<string, { type: 'info' | 'warning' | 'success' | 'error', label: string }> = { pending: { type: 'info', label: '待发布' }, publishing: { type: 'warning', label: '发布中' }, done: { type: 'success', label: '已完成' }, failed: { type: 'error', label: '失败' } }
      return h(NTag, { size: 'small', type: map[row.status].type }, { default: () => map[row.status].label })
    }
  },
  { title: '更新说明', key: 'notes', minWidth: 200 },
  { title: '创建时间', key: 'createdAt', width: 100 },
  {
    title: '操作', key: 'actions', width: 120, align: 'center' as const,
    render: (row: OtaPackage) => {
      if (row.status === 'pending') return h(NSpace, { size: 4 }, { default: () => [h(NButton, { size: 'tiny', text: true, type: 'primary' }, { default: () => '发布' }), h(NButton, { size: 'tiny', text: true, type: 'error' }, { default: () => '删除' })] })
      if (row.status === 'publishing') return h(NButton, { size: 'tiny', text: true, type: 'warning' }, { default: () => '查看进度' })
      return h(NButton, { size: 'tiny', text: true, type: 'info' }, { default: () => '查看' })
    }
  },
]

const showOtaModal = ref(false)
const otaFormRef = ref<FormInst | null>(null)
const otaForm = ref({ name: '', targetType: '', version: '', notes: '', file: null as any })
const otaRules: FormRules = { name: { required: true, message: '请输入升级包名称', trigger: 'blur' }, targetType: { required: true, message: '请选择目标设备类型', trigger: 'change' }, version: { required: true, message: '请输入版本号', trigger: 'blur' } }

function handleUploadOta() {
  otaFormRef.value?.validate(e => {
    if (e) return
    otaPackages.value.unshift({ id: Date.now(), name: otaForm.value.name, targetType: otaForm.value.targetType, version: otaForm.value.version, size: '--', status: 'pending', notes: otaForm.value.notes, createdAt: new Date().toISOString().slice(0, 10) })
    showOtaModal.value = false; otaForm.value = { name: '', targetType: '', version: '', notes: '', file: null }
    window.$message?.success('升级包已上传，待发布')
  })
}
</script>

<style scoped>
.page-container { padding: 20px 24px; }
.page-header { margin-bottom: 20px; }
.page-title { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.section-toolbar { margin-bottom: 16px; display: flex; justify-content: flex-end; }
.section-toolbar.between { justify-content: space-between; }
.filter-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.filter-actions { margin-left: auto; }
.stats-row { display: flex; gap: 16px; margin-bottom: 20px; }
.stat-card {
  flex: 1; background: white; border-radius: 10px; padding: 16px 20px;
  border: 1px solid var(--border-color); display: flex; flex-direction: column; align-items: center;
}
.stat-num { font-family: 'Orbitron', sans-serif; font-size: 28px; font-weight: 700; color: var(--text-primary); }
.stat-lbl { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
</style>
