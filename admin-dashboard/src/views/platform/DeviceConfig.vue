<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">设备配置管理</h1>
    </div>

    <n-tabs type="line" animated style="overflow:visible;">
      <!-- ========== Tab 1: 设备类型 ========== -->
      <n-tab-pane name="types" tab="📦 设备类型">
        <div class="section-toolbar">
          <n-button type="primary" size="small" @click="showTypeModal = true">
            <template #icon><n-icon :component="AddOutline" /></template>新增设备类型
          </n-button>
        </div>
        <n-data-table :columns="typeColumns" :data="deviceTypes" :bordered="false" size="small" striped />
      </n-tab-pane>

      <!-- ========== Tab 2: 主机管理 ========== -->
      <n-tab-pane name="hosts" tab="🖥️ 主机管理" style="overflow:visible;">
        <div class="stats-row">
          <div class="stat-card"><span class="stat-num">{{ hosts.length }}</span><span class="stat-lbl">主机总数</span></div>
          <div class="stat-card"><span class="stat-num">{{ hostOnlineCount }}</span><span class="stat-lbl">在线</span></div>
          <div class="stat-card"><span class="stat-num">{{ hostOfflineCount }}</span><span class="stat-lbl">离线</span></div>
          <div class="stat-card"><span class="stat-num">{{ hostFaultCount }}</span><span class="stat-lbl">故障</span></div>
        </div>
        <div class="filter-bar">
          <n-select v-model:value="hostFilterMerchant" :options="merchantOpts" placeholder="所属商家" style="width:150px;" clearable size="small" @update:value="hostFilterStore = null" />
          <n-select v-model:value="hostFilterStore" :options="hostStoreOpts" placeholder="所属店铺" style="width:150px;" size="small" :disabled="hostFilterMerchant === null" />
          <n-select v-model:value="hostFilterType" :options="hostTypeOpts" placeholder="设备类型" style="width:130px;" clearable size="small" />
          <n-select v-model:value="hostFilterStatus" :options="hostStatusOpts" placeholder="状态" style="width:120px;" clearable size="small" />
          <n-input v-model:value="hostFilterKeyword" placeholder="搜索主机编号/名称" style="width:180px;" clearable size="small" />
          <div class="filter-actions"><n-button size="small" @click="resetHostFilter">重置</n-button></div>
        </div>
        <div class="section-toolbar between">
          <n-space><n-button type="primary" size="small" @click="showAddHostModal = true"><template #icon><n-icon :component="AddOutline" /></template>录入主机</n-button></n-space>
        </div>
        <n-data-table :columns="hostColumns" :data="filteredHosts" :bordered="false" size="small" striped :row-key="(row:any)=>row.id" @update:checked-row-keys="selectedHostIds = $event" />
      </n-tab-pane>

      <!-- ========== Tab 3: 头显管理 ========== -->
      <n-tab-pane name="headsets" tab="🥽 头显管理" style="overflow:visible;">
        <div class="stats-row">
          <div class="stat-card"><span class="stat-num">{{ headsets.length }}</span><span class="stat-lbl">头显总数</span></div>
          <div class="stat-card"><span class="stat-num">{{ hsOnlineCount }}</span><span class="stat-lbl">在线</span></div>
          <div class="stat-card"><span class="stat-num">{{ hsIdleCount }}</span><span class="stat-lbl">空闲</span></div>
          <div class="stat-card"><span class="stat-num">{{ hsInUseCount }}</span><span class="stat-lbl">使用中</span></div>
        </div>
        <div class="filter-bar">
          <n-select v-model:value="hsFilterMerchant" :options="merchantOpts" placeholder="所属商家" style="width:150px;" clearable size="small" @update:value="hsFilterStore = null" />
          <n-select v-model:value="hsFilterStore" :options="hsStoreOpts" placeholder="所属店铺" style="width:150px;" size="small" :disabled="hsFilterMerchant === null" />
          <n-select v-model:value="hsFilterStatus" :options="hsStatusOpts" placeholder="状态" style="width:120px;" clearable size="small" />
          <n-input v-model:value="hsFilterKeyword" placeholder="搜索头显名称/SN码" style="width:220px;" clearable size="small" />
          <div class="filter-actions"><n-button size="small" @click="resetHsFilter">重置</n-button></div>
        </div>
        <div class="section-toolbar between">
          <n-space><n-button type="primary" size="small" @click="showAddHeadsetModal = true"><template #icon><n-icon :component="AddOutline" /></template>录入头显</n-button></n-space>
        </div>
        <n-data-table :columns="headsetColumns" :data="filteredHeadsets" :bordered="false" size="small" striped :row-key="(row:any)=>row.id" />
      </n-tab-pane>

      <!-- ========== Tab 4: Token 管理 ========== -->
      <n-tab-pane name="tokens" tab="🔑 Token 管理">
        <div class="filter-bar">
          <n-select v-model:value="tokenFilterStatus" :options="[{label:'全部状态',value:''},{label:'有效',value:'active'},{label:'已过期',value:'expired'},{label:'已吊销',value:'revoked'}]" style="width:130px;" clearable size="small" />
          <n-input v-model:value="tokenFilterKeyword" placeholder="搜索设备名称/Token" style="width:240px;" clearable size="small" />
        </div>
        <n-data-table :columns="tokenColumns" :data="filteredTokens" :bordered="false" size="small" striped />
      </n-tab-pane>

      <!-- ========== Tab 5: OTA 升级 ========== -->
      <n-tab-pane name="ota" tab="📡 OTA 升级">
        <div class="section-toolbar"><n-button type="primary" size="small" @click="showOtaModal = true"><template #icon><n-icon :component="CloudUploadOutline" /></template>上传升级包</n-button></div>
        <n-data-table :columns="otaColumns" :data="otaPackages" :bordered="false" size="small" striped />
      </n-tab-pane>
    </n-tabs>

    <!-- 弹窗：新增设备类型 -->
    <n-modal v-model:show="showTypeModal" preset="card" title="新增设备类型" style="width:480px;" :bordered="false">
      <n-form ref="typeFormRef" :model="typeForm" :rules="typeRules" label-placement="left" label-width="100">
        <n-form-item label="类型名称" path="name"><n-input v-model:value="typeForm.name" placeholder="如：悬浮骑兵" /></n-form-item>
        <n-form-item label="描述" path="desc"><n-input v-model:value="typeForm.desc" type="textarea" :rows="3" /></n-form-item>
        <n-form-item label="默认参数" path="params"><n-input v-model:value="typeForm.params" type="textarea" :rows="3" /></n-form-item>
      </n-form>
      <template #footer><n-space justify="center"><n-button @click="showTypeModal=false">取消</n-button><n-button type="primary" @click="handleAddType">确定</n-button></n-space></template>
    </n-modal>

    <!-- 弹窗：录入主机 -->
    <n-modal v-model:show="showAddHostModal" preset="card" title="录入主机" style="width:520px;" :bordered="false">
      <n-form ref="addHostFormRef" :model="addHostForm" :rules="hostRules" label-placement="left" label-width="110">
        <n-form-item label="主机编号" path="serialNo"><n-input v-model:value="addHostForm.serialNo" placeholder="如：PCT-001" /></n-form-item>
        <n-form-item label="主机名称" path="name"><n-input v-model:value="addHostForm.name" placeholder="如：大厅主机 #01" /></n-form-item>
        <n-form-item label="设备类型" path="deviceType"><n-select v-model:value="addHostForm.deviceType" :options="hostTypeOpts" placeholder="选择设备类型" /></n-form-item>
        <n-form-item label="硬件配置" path="specs"><n-input v-model:value="addHostForm.specs" placeholder="CPU/内存/存储/显卡" /></n-form-item>
        <n-form-item label="系统版本" path="osVersion"><n-input v-model:value="addHostForm.osVersion" placeholder="如：Windows 11 Kiosk v2.1" /></n-form-item>
        <n-form-item label="备注" path="notes"><n-input v-model:value="addHostForm.notes" type="textarea" :rows="2" /></n-form-item>
      </n-form>
      <template #footer><n-space justify="center"><n-button @click="showAddHostModal=false">取消</n-button><n-button type="primary" @click="handleAddHost">录入</n-button></n-space></template>
    </n-modal>

    <!-- 弹窗：录入头显 -->
    <n-modal v-model:show="showAddHeadsetModal" preset="card" title="录入头显设备" style="width:520px;" :bordered="false">
      <n-form ref="addHeadsetFormRef" :model="addHeadsetForm" :rules="headsetRules" label-placement="left" label-width="120">
        <n-form-item label="头显名称" path="name"><n-input v-model:value="addHeadsetForm.name" placeholder="如：Pico 4 #01" /></n-form-item>
        <n-form-item label="设备型号" path="model"><n-select v-model:value="addHeadsetForm.model" :options="headsetModelOpts" placeholder="选择型号" /></n-form-item>
        <n-form-item label="SN 码" path="sn"><n-input v-model:value="addHeadsetForm.sn" placeholder="设备唯一序列号" /></n-form-item>
        <n-form-item label="固件版本" path="firmware"><n-input v-model:value="addHeadsetForm.firmware" placeholder="如：v5.4.1" /></n-form-item>
        <n-form-item label="备注" path="notes"><n-input v-model:value="addHeadsetForm.notes" type="textarea" :rows="2" /></n-form-item>
      </n-form>
      <template #footer><n-space justify="center"><n-button @click="showAddHeadsetModal=false">取消</n-button><n-button type="primary" @click="handleAddHeadset">录入</n-button></n-space></template>
    </n-modal>

    <!-- 弹窗：编辑主机 -->
    <n-modal v-model:show="showEditHostModal" preset="card" title="编辑主机" style="width:520px;" :bordered="false">
      <n-form label-placement="left" label-width="100">
        <n-form-item label="主机编号"><n-input v-model:value="editHostForm.serialNo" /></n-form-item>
        <n-form-item label="主机名称"><n-input v-model:value="editHostForm.name" /></n-form-item>
        <n-form-item label="设备类型"><n-select v-model:value="editHostForm.deviceType" :options="hostTypeOpts" /></n-form-item>
        <n-form-item label="硬件配置"><n-input v-model:value="editHostForm.specs" /></n-form-item>
        <n-form-item label="系统版本"><n-input v-model:value="editHostForm.osVersion" /></n-form-item>
        <n-form-item label="状态">
          <n-radio-group v-model:value="editHostForm.status">
            <n-radio value="online">在线</n-radio>
            <n-radio value="offline">离线</n-radio>
            <n-radio value="fault" style="color:#f59e0b;">故障</n-radio>
          </n-radio-group>
          <n-text depth="3" style="font-size:11px;margin-top:4px;display:block;">
            在线/离线由心跳自动判定，故障需手动标记。标记故障后该主机不再分配游戏。
          </n-text>
        </n-form-item>
      </n-form>
      <template #footer><n-space justify="center"><n-button @click="showEditHostModal=false">取消</n-button><n-button type="primary" @click="handleEditHost">保存</n-button></n-space></template>
    </n-modal>

    <!-- 弹窗：取消分配确认 -->
    <n-modal v-model:show="showUnassignModal" preset="card" title="确认取消分配" style="width:420px;" :bordered="false" :closable="false">
      <div style="display:flex;align-items:flex-start;gap:12px;padding:8px 0;">
        <div style="width:32px;height:32px;border-radius:50%;background:#fbbf24;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px;color:#fff;font-weight:bold;">!</div>
        <div>
          <div style="font-size:15px;font-weight:600;color:#333;margin-bottom:6px;">确认取消分配该主机？</div>
          <div style="font-size:13px;color:#64748b;line-height:1.6;">
            取消分配后，该主机将从当前商家/门店回收，需重新分配才能投入使用。<br>
            <strong>已绑定的头显设备不受影响。</strong>
          </div>
        </div>
      </div>
      <template #footer>
        <div style="display:flex;justify-content:flex-end;gap:8px;">
          <n-button @click="showUnassignModal=false">取消</n-button>
          <n-button type="warning" @click="confirmUnassign">确认取消分配</n-button>
        </div>
      </template>
    </n-modal>

    <!-- 弹窗：分配主机 -->
    <n-modal v-model:show="showAllocHostModal" preset="card" title="分配主机" style="width:480px;" :bordered="false">
      <n-form ref="allocHostFormRef" :model="allocHostForm" :rules="allocRules" label-placement="left" label-width="100">
        <n-descriptions :column="1" bordered size="small">
          <n-descriptions-item label="主机">{{ allocHostForm.deviceName }}</n-descriptions-item>
          <n-descriptions-item label="编号">{{ allocHostForm.serialNo }}</n-descriptions-item>
        </n-descriptions>
        <div style="height:16px;" />
        <n-form-item label="分配商家" path="merchant"><n-select v-model:value="allocHostForm.merchant" :options="merchantOpts" placeholder="选择商家" filterable @update:value="allocHostForm.store=''" /></n-form-item>
        <n-form-item label="分配店铺" path="store"><n-select v-model:value="allocHostForm.store" :options="getStoreOpts(allocHostForm.merchant)" placeholder="先选商家 → 再选门店" filterable :disabled="!allocHostForm.merchant" /></n-form-item>
      </n-form>
      <template #footer><n-space justify="center"><n-button @click="showAllocHostModal=false">取消</n-button><n-button type="primary" @click="handleAllocHost">确认分配</n-button></n-space></template>
    </n-modal>

    <!-- 弹窗：上传 OTA -->
    <n-modal v-model:show="showOtaModal" preset="card" title="上传 OTA 升级包" style="width:520px;" :bordered="false">
      <n-form ref="otaFormRef" :model="otaForm" :rules="otaRules" label-placement="left" label-width="100">
        <n-form-item label="升级包名称" path="name"><n-input v-model:value="otaForm.name" placeholder="如：v2.1.0 固件升级" /></n-form-item>
        <n-form-item label="目标设备" path="targetType"><n-select v-model:value="otaForm.targetType" :options="[{label:'主机',value:'host'},{label:'头显',value:'headset'},{label:'全部',value:'all'}]" placeholder="选择目标" /></n-form-item>
        <n-form-item label="版本号" path="version"><n-input v-model:value="otaForm.version" placeholder="如：v2.1.0" /></n-form-item>
        <n-form-item label="更新说明" path="notes"><n-input v-model:value="otaForm.notes" type="textarea" :rows="4" /></n-form-item>
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
  NRadioGroup, NRadio, NText,
  type FormInst, type FormRules
} from 'naive-ui'
import { AddOutline, CloudUploadOutline, ArrowForwardOutline, CheckmarkCircleOutline, CloseCircleOutline } from '@vicons/ionicons5'

// ─── 设备类型 ──────────────────────────────────────
interface DeviceType { id: number; name: string; desc: string; params: string; deviceCount: number; createdAt: string }
const deviceTypes = ref<DeviceType[]>([
  { id: 1, name: '悬浮骑兵', desc: '双人座VR骑乘设备', params: 'i7-9700/RTX2060/16G', deviceCount: 8, createdAt: '2023-05-01' },
  { id: 2, name: '暗黑行者', desc: '单人座VR步行射击设备', params: 'i9-10900/RTX3060/32G', deviceCount: 6, createdAt: '2023-05-15' },
  { id: 3, name: '暗黑机甲', desc: '双人座VR机甲对战设备', params: 'i9-11900/RTX3080/32G', deviceCount: 1, createdAt: '2023-06-01' },
  { id: 4, name: '幻影飞碟', desc: '六人座VR沉浸式飞碟', params: 'i9-12900/RTX4090/64G', deviceCount: 2, createdAt: '2024-01-10' },
])
const typeOpts = computed(() => deviceTypes.value.map(t => ({ label: t.name, value: t.name })))
const typeColumns = [
  { title: '类型名称', key: 'name', minWidth: 120 }, { title: '描述', key: 'desc', minWidth: 180 }, { title: '默认硬件参数', key: 'params', minWidth: 200 },
  { title: '设备数量', key: 'deviceCount', width: 90, align: 'center' as const }, { title: '创建时间', key: 'createdAt', width: 120 },
  { title: '操作', key: 'actions', width: 120, align: 'center' as const, render: () => h(NButton, { size: 'tiny', text: true, type: 'primary' }, { default: () => '编辑' }) },
]
const showTypeModal = ref(false); const typeFormRef = ref<FormInst | null>(null)
const typeForm = ref({ name: '', desc: '', params: '' })
const typeRules: FormRules = { name: { required: true, message: '请输入类型名称', trigger: 'blur' } }
function handleAddType() {
  typeFormRef.value?.validate(e => { if (e) return; deviceTypes.value.unshift({ id: Date.now(), name: typeForm.value.name, desc: typeForm.value.desc, params: typeForm.value.params, deviceCount: 0, createdAt: new Date().toISOString().slice(0, 10) }); showTypeModal.value = false; typeForm.value = { name: '', desc: '', params: '' }; (window as any).$message?.success('设备类型已添加') })
}

// ─── 公共数据 ──────────────────────────────────────
const merchantNames = ['恒然集团', '利民街商家', '党建馆集团', '华东展厅', '卓远科技']
const merchantStoreMap: Record<string, string[]> = {
  '恒然集团': ['恒然科技园店', '恒然分部展厅'], '利民街商家': ['利民街小展厅'], '党建馆集团': ['党建馆'], '华东展厅': ['华东展厅'], '卓远科技': ['卓远萝岗区店', '卓远萧山区店', '卓远亚运城店'],
}
const merchantOpts = computed(() => merchantNames.map(m => ({ label: m, value: m })))
function getStoreOpts(merchant: string) { if (!merchant) return []; return (merchantStoreMap[merchant] || []).map(s => ({ label: s, value: s })) }

// ─── 主机管理 ──────────────────────────────────────
interface HostDevice { id: number; serialNo: string; name: string; deviceType: string; specs: string; osVersion: string; status: 'online' | 'offline' | 'fault'; merchant: string; store: string; token: string; boundHeadsets: number[]; createdAt: string }
const hostTypeNames = ['悬浮骑兵', '暗黑行者', '暗黑机甲', '幻影飞碟', '通用主机']
function genHosts(): HostDevice[] {
  const r: HostDevice[] = []; const specs = ['i5-12400/16GB/512GB SSD', 'i7-12700/32GB/1TB SSD', 'i9-13900/64GB/2TB SSD']
  for (let i = 1; i <= 20; i++) {
    const s = (['online', 'online', 'online', 'offline', 'fault'] as const)[i % 5]
    const m = merchantNames[i % 5]
    const stores = merchantStoreMap[m] || []
    const ss = i > 5 && stores.length > 0 ? stores[i % stores.length] : '--'
    r.push({ id: i, serialNo: `PCT-${String(i).padStart(3,'0')}`, name: `主机 #${String(i).padStart(2,'0')}`, deviceType: hostTypeNames[i % hostTypeNames.length], specs: specs[i%3], osVersion: 'Windows 11 Kiosk v2.1', status: s, merchant: i > 5 ? m : '--', store: i > 5 ? ss : '--', token: i > 5 ? `tk_host_${i}` : '--', boundHeadsets: [], createdAt: '2026-03-10' })
  }
  return r
}
const hosts = ref<HostDevice[]>(genHosts())
const selectedHostIds = ref<number[]>([])
const hostOnlineCount = computed(() => hosts.value.filter(d => d.status === 'online').length)
const hostOfflineCount = computed(() => hosts.value.filter(d => d.status === 'offline').length)
const hostFaultCount = computed(() => hosts.value.filter(d => d.status === 'fault').length)
const hostFilterMerchant = ref<string | null>(null); const hostFilterStore = ref<string | null>(null); const hostFilterType = ref<string | null>(null); const hostFilterStatus = ref<string | null>(null); const hostFilterKeyword = ref('')
const hostStatusOpts = [{ label: '在线', value: 'online' }, { label: '离线', value: 'offline' }, { label: '故障', value: 'fault' }]
const hostTypeOpts = computed(() => hostTypeNames.map(n => ({ label: n, value: n })))
const hostStoreOpts = computed(() => {
  if (!hostFilterMerchant.value) return []
  return [...new Set(hosts.value.filter(d => d.merchant === hostFilterMerchant.value).map(d => d.store))].filter(Boolean).map(s => ({ label: s, value: s }))
})
const filteredHosts = computed(() => {
  let list = hosts.value
  if (hostFilterMerchant.value) list = list.filter(d => d.merchant === hostFilterMerchant.value)
  if (hostFilterStore.value) list = list.filter(d => d.store === hostFilterStore.value)
  if (hostFilterType.value) list = list.filter(d => d.deviceType === hostFilterType.value)
  if (hostFilterStatus.value) list = list.filter(d => d.status === hostFilterStatus.value)
  if (hostFilterKeyword.value) { const kw = hostFilterKeyword.value.toLowerCase(); list = list.filter(d => d.serialNo.toLowerCase().includes(kw) || d.name.toLowerCase().includes(kw)) }
  return list
})
function resetHostFilter() { hostFilterMerchant.value = null; hostFilterStore.value = null; hostFilterType.value = null; hostFilterStatus.value = null; hostFilterKeyword.value = '' }
const hostStatusRender = (s: string) => { const m: Record<string,any> = { online: {type:'success',label:'在线'}, offline: {type:'default',label:'离线'}, fault: {type:'warning',label:'故障'} }; return h(NTag, { size:'small', type: m[s]?.type }, { default: () => m[s]?.label }) }

const showAllocHostModal = ref(false); const allocHostFormRef = ref<FormInst | null>(null)
const allocHostForm = ref({ deviceId: 0, deviceName: '', serialNo: '', merchant: '', store: '' })
const allocRules: FormRules = { merchant: { required: true, message: '请选择商家', trigger: 'change' }, store: { required: true, message: '请选择门店', trigger: 'change' } }

const hostColumns = [
  { type: 'selection' as const, width: 40 }, { title: '主机编号', key: 'serialNo', width: 110 }, { title: '名称', key: 'name', minWidth: 120 },
  { title: '设备类型', key: 'deviceType', width: 100, render: (row: HostDevice) => h(NTag, { size:'small', type:'info', bordered:false }, { default: () => row.deviceType }) },
  { title: '硬件配置', key: 'specs', minWidth: 180 }, { title: '系统版本', key: 'osVersion', minWidth: 160 },
  { title: '所属商家', key: 'merchant', minWidth: 100 }, { title: '所属门店', key: 'store', minWidth: 120 },
  { title: '状态', key: 'status', width: 70, align:'center' as const, render: (row: HostDevice) => hostStatusRender(row.status) },
  { title: '绑定头显', key: 'boundHeadsets', width: 80, align:'center' as const, render: (row: HostDevice) => h(NTag, { size:'small', type:'info' }, { default: () => `${row.boundHeadsets.length}台` }) },
  {
    title: '操作', key: 'actions', width: 160, align:'center' as const,
    render: (row: HostDevice) => {
      const btns: any[] = [
        h(NButton, { size:'tiny', text:true, type:'primary', style:'margin-right:8px;', onClick: () => openEditHost(row) }, { default: () => '编辑' })
      ]
      if (row.merchant === '--') {
        btns.push(h(NButton, { size:'tiny', text:true, type:'info', onClick: () => { allocHostForm.value = { deviceId:row.id, deviceName:row.name, serialNo:row.serialNo, merchant:'', store:'' }; showAllocHostModal.value = true } }, { default: () => '分配' }))
      } else {
        btns.push(h(NButton, { size:'tiny', text:true, type:'warning', onClick: () => { unassignTarget.value = row; showUnassignModal.value = true } }, { default: () => '取消分配' }))
      }
      return btns
    }
  },
]

const showEditHostModal = ref(false); const editHostForm = ref({ id: 0, serialNo: '', name: '', deviceType: '', specs: '', osVersion: '', status: 'online' as 'online' | 'offline' | 'fault' })
const showUnassignModal = ref(false); const unassignTarget = ref<HostDevice | null>(null)
function confirmUnassign() {
  const row = unassignTarget.value; if (!row) return
  row.merchant = '--'; row.store = '--'; row.token = '--'
  selectedHostIds.value = selectedHostIds.value.filter(id => id !== row.id)
  showUnassignModal.value = false; unassignTarget.value = null
  ;(window as any).$message?.info(`已取消分配：${row.name}`)
}
function openEditHost(row: HostDevice) { editHostForm.value = { id: row.id, serialNo: row.serialNo, name: row.name, deviceType: row.deviceType, specs: row.specs, osVersion: row.osVersion, status: row.status }; showEditHostModal.value = true }
function handleEditHost() {
  const idx = hosts.value.findIndex(d => d.id === editHostForm.value.id)
  if (idx !== -1) { hosts.value[idx] = { ...hosts.value[idx], ...editHostForm.value }; (window as any).$message?.success('主机信息已更新') }
  showEditHostModal.value = false
}
const showAddHostModal = ref(false); const addHostFormRef = ref<FormInst | null>(null)
const addHostForm = ref({ serialNo: '', name: '', deviceType: '', specs: '', osVersion: '', notes: '' })
const hostRules: FormRules = { serialNo: { required: true, message: '请输入主机编号', trigger: 'blur' }, name: { required: true, message: '请输入主机名称', trigger: 'blur' }, deviceType: { required: true, message: '请选择设备类型', trigger: 'change' } }
function handleAddHost() {
  addHostFormRef.value?.validate(e => { if (e) return; hosts.value.unshift({ id: Date.now(), serialNo: addHostForm.value.serialNo, name: addHostForm.value.name, deviceType: addHostForm.value.deviceType, specs: addHostForm.value.specs || '--', osVersion: addHostForm.value.osVersion || '--', status: 'online', merchant: '--', store: '--', token: '--', boundHeadsets: [], createdAt: new Date().toISOString().slice(0,10) }); showAddHostModal.value = false; addHostForm.value = { serialNo:'', name:'', deviceType:'', specs:'', osVersion:'', notes:'' }; (window as any).$message?.success('主机已录入') })
}
function handleAllocHost() {
  allocHostFormRef.value?.validate(e => { if (e) return; const d = hosts.value.find(d => d.id === allocHostForm.value.deviceId); if (d) { d.merchant = allocHostForm.value.merchant; d.store = allocHostForm.value.store; d.token = `tk_host_${Date.now().toString(36)}` }; showAllocHostModal.value = false; (window as any).$message?.success(`主机已分配给 ${allocHostForm.value.store}`) })
}

// ─── 头显管理 ──────────────────────────────────────
interface HeadsetDevice { id: number; name: string; model: string; sn: string; firmware: string; status: 'idle' | 'in_use' | 'charging' | 'offline' | 'fault'; merchant: string; store: string; boundHostId: number | null; batteryLevel: number; ipd: number; createdAt: string }
const headsetModels = ['Pico Neo 3', 'Pico 4', 'Pico 4 Pro', 'Pico 4 Ultra', 'Meta Quest 3', 'Meta Quest 3S', 'HTC Vive XR Elite']
const headsetModelOpts = headsetModels.map(m => ({ label: m, value: m }))
function genHeadsets(): HeadsetDevice[] {
  const r: HeadsetDevice[] = []; const statuses = ['idle','in_use','idle','charging','offline','in_use','fault'] as const
  for (let i = 1; i <= 30; i++) {
    const m = headsetModels[i % headsetModels.length]
    const s = statuses[i % statuses.length]
    const mName = merchantNames[i % 5]; const hsStores = merchantStoreMap[mName] || []; const ss = i > 10 && hsStores.length > 0 ? hsStores[i % hsStores.length] : '--'
    r.push({ id: i, name: `${m} #${String(i).padStart(2,'0')}`, model: m, sn: `SN${String(100000 + i)}${String.fromCharCode(65 + i%26)}`, firmware: 'v5.4.1', status: s, merchant: i > 10 ? mName : '--', store: i > 10 ? ss : '--', boundHostId: i > 15 ? (i % 5 + 1) : null, batteryLevel: 30 + (i * 3) % 70, ipd: 60 + (i % 13), createdAt: '2026-03-10' })
  }
  return r
}
const headsets = ref<HeadsetDevice[]>(genHeadsets())
const hsOnlineCount = computed(() => headsets.value.filter(d => d.status !== 'offline' && d.status !== 'fault').length)
const hsIdleCount = computed(() => headsets.value.filter(d => d.status === 'idle').length)
const hsInUseCount = computed(() => headsets.value.filter(d => d.status === 'in_use').length)
const hsFilterMerchant = ref<string | null>(null); const hsFilterStore = ref<string | null>(null); const hsFilterStatus = ref<string | null>(null); const hsFilterKeyword = ref('')
const hsStatusOpts = [{ label: '空闲', value: 'idle' }, { label: '使用中', value: 'in_use' }, { label: '充电中', value: 'charging' }, { label: '离线', value: 'offline' }, { label: '故障', value: 'fault' }]
const hsStoreOpts = computed(() => {
  if (!hsFilterMerchant.value) return []
  return [...new Set(headsets.value.filter(d => d.merchant === hsFilterMerchant.value).map(d => d.store))].filter(Boolean).map(s => ({ label: s, value: s }))
})
const filteredHeadsets = computed(() => {
  let list = headsets.value
  if (hsFilterMerchant.value) list = list.filter(d => d.merchant === hsFilterMerchant.value)
  if (hsFilterStore.value) list = list.filter(d => d.store === hsFilterStore.value)
  if (hsFilterStatus.value) list = list.filter(d => d.status === hsFilterStatus.value)
  if (hsFilterKeyword.value) { const kw = hsFilterKeyword.value.toLowerCase(); list = list.filter(d => d.name.toLowerCase().includes(kw) || d.sn.toLowerCase().includes(kw)) }
  return list
})
function resetHsFilter() { hsFilterMerchant.value = null; hsFilterStore.value = null; hsFilterStatus.value = null; hsFilterKeyword.value = '' }
const hsStatusRender = (s: string) => {
  const m: Record<string,any> = { idle: {type:'info',label:'空闲'}, in_use: {type:'success',label:'使用中'}, charging: {type:'warning',label:'充电中'}, offline: {type:'default',label:'离线'}, fault: {type:'error',label:'故障'} }
  return h(NTag, { size:'small', type: m[s]?.type }, { default: () => m[s]?.label })
}

const headsetColumns = [
  { title: '头显名称', key: 'name', minWidth: 150 }, { title: 'SN 码', key: 'sn', width: 130 },
  { title: '型号', key: 'model', width: 130 }, { title: '固件版本', key: 'firmware', width: 90 },
  { title: '所属商家', key: 'merchant', minWidth: 100 }, { title: '所属门店', key: 'store', minWidth: 120 },
  { title: '绑定主机', key: 'boundHostId', width: 90, align:'center' as const, render: (row: HeadsetDevice) => row.boundHostId ? h(NTag, { size:'small', type:'success' }, { default: () => `M-${String(row.boundHostId).padStart(2,'0')}` }) : h(NTag, { size:'small', type:'default' }, { default: () => '未绑定' }) },
  { title: '状态', key: 'status', width: 80, align:'center' as const, render: (row: HeadsetDevice) => hsStatusRender(row.status) },
  { title: '电量', key: 'batteryLevel', width: 70, align:'center' as const, render: (row: HeadsetDevice) => h(NTag, { size:'small', type: row.batteryLevel > 50 ? 'success' : row.batteryLevel > 20 ? 'warning' : 'error' }, { default: () => `${row.batteryLevel}%` }) },
  { title: 'IPD', key: 'ipd', width: 60, align:'center' as const },
]

const showAddHeadsetModal = ref(false); const addHeadsetFormRef = ref<FormInst | null>(null)
const addHeadsetForm = ref({ name: '', model: '', sn: '', firmware: '', notes: '' })
const headsetRules: FormRules = { name: { required: true, message: '请输入头显名称', trigger: 'blur' }, model: { required: true, message: '请选择型号', trigger: 'change' }, sn: { required: true, message: '请输入 SN 码', trigger: 'blur' } }
function handleAddHeadset() {
  addHeadsetFormRef.value?.validate(e => { if (e) return; headsets.value.unshift({ id: Date.now(), name: addHeadsetForm.value.name, model: addHeadsetForm.value.model, sn: addHeadsetForm.value.sn, firmware: addHeadsetForm.value.firmware || '--', status: 'offline', merchant: '--', store: '--', boundHostId: null, batteryLevel: 0, ipd: 63, createdAt: new Date().toISOString().slice(0,10) }); showAddHeadsetModal.value = false; addHeadsetForm.value = { name:'', model:'', sn:'', firmware:'', notes:'' }; (window as any).$message?.success('头显已录入') })
}

// ─── Token 管理 ────────────────────────────────────
interface TokenItem { id: number; deviceName: string; deviceType: string; store: string; token: string; status: 'active' | 'expired' | 'revoked'; createdAt: string; lastUsed: string }
const tokenData = ref<TokenItem[]>([
  { id: 1, deviceName: '主机 #01', deviceType: '主机', store: '利民街小展厅', token: 'tk_host_abc123', status: 'active', createdAt: '2026-03-01', lastUsed: '2026-05-08 09:30:00' },
  { id: 2, deviceName: 'Pico 4 Pro #01', deviceType: '头显', store: '利民街小展厅', token: 'tk_hs_def456', status: 'active', createdAt: '2026-03-15', lastUsed: '2026-05-07 18:22:00' },
  { id: 3, deviceName: '主机 #02', deviceType: '主机', store: '恒然科技园店', token: 'tk_host_ghi789', status: 'active', createdAt: '2026-03-10', lastUsed: '2026-05-08 08:15:00' },
  { id: 4, deviceName: 'Pico 4 #03', deviceType: '头显', store: '恒然分部展厅', token: 'tk_hs_jkl012', status: 'expired', createdAt: '2026-02-01', lastUsed: '2026-04-30 12:00:00' },
  { id: 5, deviceName: 'Meta Quest 3 #01', deviceType: '头显', store: '卓远萧山区店', token: 'tk_hs_mno345', status: 'revoked', createdAt: '2026-01-10', lastUsed: '2026-04-25 10:30:00' },
])
const tokenFilterStatus = ref(''); const tokenFilterKeyword = ref('')
const filteredTokens = computed(() => { let list = tokenData.value; if (tokenFilterStatus.value) list = list.filter(t => t.status === tokenFilterStatus.value); if (tokenFilterKeyword.value) { const kw = tokenFilterKeyword.value.toLowerCase(); list = list.filter(t => t.deviceName.toLowerCase().includes(kw) || t.token.toLowerCase().includes(kw)) }; return list })
const tokenColumns = [
  { title: '设备名称', key: 'deviceName', minWidth: 140 }, { title: '设备类型', key: 'deviceType', width: 80 }, { title: '所属店铺', key: 'store', minWidth: 120 },
  { title: 'Token', key: 'token', minWidth: 200, render: (row: TokenItem) => h(NSpace, { align:'center', size:4 }, { default: () => [h('span', { style: 'font-family: monospace; font-size:12px;' }, row.token), h(NButton, { size:'tiny', text:true, type:'primary', onClick: () => navigator.clipboard.writeText(row.token) }, { default: () => '复制' })] }) },
  { title: '状态', key: 'status', width: 80, align:'center' as const, render: (row: TokenItem) => { const m: Record<string,any> = { active:{type:'success' as const,label:'有效'}, expired:{type:'warning' as const,label:'已过期'}, revoked:{type:'error' as const,label:'已吊销'} }; return h(NTag, { size:'small', type: m[row.status]?.type }, { default: () => m[row.status]?.label }) } },
]

// ─── OTA 升级 ──────────────────────────────────────
interface OtaPackage { id: number; name: string; targetType: string; version: string; size: string; status: 'pending' | 'publishing' | 'done' | 'failed'; notes: string; createdAt: string }
const otaPackages = ref<OtaPackage[]>([
  { id: 1, name: '主机 Kiosk v2.1.0', targetType: '主机', version: 'v2.1.0', size: '128MB', status: 'done', notes: '修复电机抖动问题，优化性能', createdAt: '2026-04-20' },
  { id: 2, name: 'Pico 固件 v5.5.0', targetType: '头显', version: 'v5.5.0', size: '96MB', status: 'publishing', notes: '新增摇杆校准功能，修复蓝牙断连', createdAt: '2026-05-01' },
  { id: 3, name: '安全补丁 v3.0.1', targetType: '全部', version: 'v3.0.1', size: '52MB', status: 'pending', notes: '安全漏洞修复', createdAt: '2026-05-03' },
])
const otaColumns = [
  { title: '升级包名称', key: 'name', minWidth: 180 }, { title: '目标', key: 'targetType', width: 80 }, { title: '版本', key: 'version', width: 80 },
  { title: '大小', key: 'size', width: 80, align:'center' as const },
  { title: '状态', key: 'status', width: 90, align:'center' as const, render: (row: OtaPackage) => { const m: Record<string,any> = { pending:{type:'info',label:'待发布'}, publishing:{type:'warning',label:'发布中'}, done:{type:'success',label:'已完成'}, failed:{type:'error',label:'失败'} }; return h(NTag, { size:'small', type: m[row.status]?.type }, { default: () => m[row.status]?.label }) } },
]
const showOtaModal = ref(false); const otaFormRef = ref<FormInst | null>(null)
const otaForm = ref({ name: '', targetType: '', version: '', notes: '', file: null as any })
const otaRules: FormRules = { name: { required: true, message: '请输入升级包名称', trigger: 'blur' }, targetType: { required: true, message: '请选择目标设备', trigger: 'change' }, version: { required: true, message: '请输入版本号', trigger: 'blur' } }
function handleUploadOta() { otaFormRef.value?.validate(e => { if (e) return; otaPackages.value.unshift({ id: Date.now(), name: otaForm.value.name, targetType: otaForm.value.targetType, version: otaForm.value.version, size: '--', status: 'pending', notes: otaForm.value.notes, createdAt: new Date().toISOString().slice(0,10) }); showOtaModal.value = false; otaForm.value = { name:'', targetType:'', version:'', notes:'', file:null }; (window as any).$message?.success('升级包已上传') }) }
</script>

<style scoped>
.page-container { padding: 20px 24px; }
.page-header { margin-bottom: 20px; }
.page-title { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.section-toolbar { margin-bottom: 16px; display: flex; justify-content: flex-end; }
.section-toolbar.between { justify-content: space-between; }
.filter-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; position:relative; z-index:1; }
.filter-actions { margin-left: auto; }
.stats-row { display: flex; gap: 16px; margin-bottom: 20px; }
.stat-card { flex:1; background:white; border-radius:10px; padding:16px 20px; border:1px solid var(--border-color); display:flex; flex-direction:column; align-items:center; }
.stat-num { font-family:'Orbitron',sans-serif; font-size:28px; font-weight:700; color:var(--text-primary); }
.stat-lbl { font-size:12px; color:var(--text-muted); margin-top:4px; }
</style>
