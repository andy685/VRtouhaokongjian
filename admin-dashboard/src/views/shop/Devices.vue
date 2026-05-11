<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>设备管理</h1>
    </div>

    <n-tabs type="line" animated style="overflow:visible;">
      <!-- Tab 1: 主机设备 -->
      <n-tab-pane name="hosts" tab="🖥️ 主机设备" style="overflow:visible;">
        <n-alert type="info" :bordered="false" style="margin-bottom:16px;">以下主机由总运营平台分配。可在此绑定头显设备，输入头显 SN 码即可完成绑定。</n-alert>
        <div class="filter-bar">
          <n-select v-model:value="hostFilterStore" :options="hostStoreOpts" placeholder="全部店铺" style="width:150px;" clearable size="small" />
          <n-select v-model:value="hostFilterStatus" :options="hostStatusOpts" placeholder="全部状态" style="width:120px;" clearable size="small" />
          <n-input v-model:value="hostFilterKeyword" placeholder="搜索主机名称/编号" style="width:200px;" clearable size="small" />
        </div>
        <n-data-table :columns="hostColumns" :data="filteredHostDevices" :pagination="{pageSize:10}" :bordered="false" striped size="small" />
      </n-tab-pane>

      <!-- Tab 2: 头显设备 -->
      <n-tab-pane name="headsets" tab="🥽 头显设备" style="overflow:visible;">
        <n-alert type="info" :bordered="false" style="margin-bottom:16px;">以下头显由总运营平台分配。SN 码为设备唯一序列号，可在此绑定到指定的主机。</n-alert>
        <div class="filter-bar">
          <n-select v-model:value="hsFilterStore" :options="hsStoreOpts" placeholder="全部店铺" style="width:150px;" clearable size="small" />
          <n-select v-model:value="hsFilterStatus" :options="hsStatusOpts" placeholder="全部状态" style="width:120px;" clearable size="small" />
          <n-input v-model:value="hsFilterKeyword" placeholder="搜索头显名称/SN码" style="width:200px;" clearable size="small" />
        </div>
        <n-data-table :columns="headsetColumns" :data="filteredHsDevices" :pagination="{pageSize:10}" :bordered="false" striped size="small" />
      </n-tab-pane>

      <!-- Tab 3: 第三方外围设备 -->
      <n-tab-pane name="thirdparty" tab="🔌 第三方外围设备">
        <div style="margin-bottom:16px;display:flex;justify-content:flex-end;">
          <n-button type="primary" size="small" @click="openAddThirdParty"><template #icon><n-icon :component="AddOutline" /></template>添加第三方设备</n-button>
        </div>
        <n-alert type="warning" :bordered="false" style="margin-bottom:16px;">第三方外围设备由商家自行管理，如扭蛋机、体感机等非核心VR设备。</n-alert>
        <n-data-table :columns="thirdPartyColumns" :data="filteredThirdParty" :pagination="{pageSize:10}" :bordered="false" striped size="small" />
      </n-tab-pane>
    </n-tabs>

    <!-- 主机绑定头显弹窗 -->
    <n-modal v-model:show="showHostBindModal" preset="card" :title="`绑定头显 - ${bindHost?.name}`" style="width:480px;" :bordered="false">
      <div style="padding:8px 0;">
        <n-alert type="info" :bordered="false" style="margin-bottom:16px;">输入头显的 SN 码，系统将自动匹配并完成绑定。</n-alert>
        <div style="display:flex;gap:8px;margin-bottom:12px;">
          <n-input v-model:value="bindSnInput" placeholder="输入头显 SN 码，如 SN100001A" size="large" style="flex:1;" @keyup.enter="searchHeadsetBySn" />
          <n-button type="primary" size="large" @click="searchHeadsetBySn">搜索</n-button>
        </div>

        <!-- 搜索到的头显 -->
        <div v-if="foundHeadset" class="bind-result-card">
          <div class="bind-result-header">
            <span>🥽 {{ foundHeadset.name }}</span>
            <n-tag size="small" type="info">{{ foundHeadset.sn }}</n-tag>
          </div>
          <div class="bind-result-body">
            <span>型号: {{ foundHeadset.model }}</span>
            <span>所属店铺: {{ foundHeadset.store }}</span>
            <span>状态: <n-tag size="tiny" :type="foundHeadset.status === 'idle' ? 'success' : 'default'">{{ foundHeadset.status === 'idle' ? '空闲' : '使用中' }}</n-tag></span>
          </div>
          <div v-if="foundHeadset.boundHostName" class="bind-result-warn">
            ⚠️ 该头显已绑定到「{{ foundHeadset.boundHostName }}」，重新绑定将覆盖原关系
          </div>
          <div v-if="storeMismatch" class="bind-result-error">
            ❌ 该头显属于「{{ foundHeadset.store }}」，与主机「{{ bindHost?.store }}」不是同一店铺，无法绑定
          </div>
          <div style="margin-top:12px;text-align:center;">
            <n-button type="primary" style="width:100%;" :disabled="storeMismatch" @click="confirmHostBind">确认绑定到「{{ bindHost?.name }}」</n-button>
          </div>
        </div>
        <div v-else-if="bindSearchDone" style="text-align:center;padding:30px;color:#94a3b8;">
          未找到匹配的头显，请检查 SN 码是否正确
        </div>
      </div>
      <template #footer><n-space justify="center"><n-button @click="closeHostBind">关闭</n-button></n-space></template>
    </n-modal>

    <!-- 头显绑定主机弹窗 -->
    <n-modal v-model:show="showHsBindModal" preset="card" :title="`绑定主机 - ${bindHeadset?.name}`" style="width:480px;" :bordered="false">
      <div style="padding:8px 0;">
        <n-alert type="info" :bordered="false" style="margin-bottom:16px;">
          选择要绑定的主机。仅显示与头显同店铺（<strong>{{ bindHeadset?.store }}</strong>）的主机。
        </n-alert>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;font-size:12px;color:#64748b;">
          <span>头显店铺: <n-tag size="tiny">{{ bindHeadset?.store }}</n-tag></span>
          <span>可选主机: <n-tag size="tiny" type="info">{{ filteredHostBindOpts.length }} 台</n-tag></span>
        </div>
        <n-select v-model:value="hsBindHostId" :options="filteredHostBindOpts" placeholder="选择同店铺主机" size="large" filterable />
        <div v-if="bindHeadset?.boundHostName" style="margin-top:8px;padding:8px 12px;background:#fef3c7;border-radius:6px;font-size:12px;color:#92400e;">
          ⚠️ 该头显已绑定到「{{ bindHeadset.boundHostName }}」，重新绑定将覆盖原关系
        </div>
        <div v-if="filteredHostBindOpts.length === 0" style="margin-top:8px;padding:8px 12px;background:#fee2e2;border-radius:6px;font-size:12px;color:#991b1b;">
          ❌ 该店铺下没有可绑定的主机，请先在总运营后台为该店铺分配主机
        </div>
        <div style="margin-top:16px;text-align:center;">
          <n-button type="primary" style="width:100%;" :disabled="!hsBindHostId || filteredHostBindOpts.length === 0" @click="confirmHsBind">确认绑定</n-button>
        </div>
      </div>
      <template #footer><n-space justify="center"><n-button @click="closeHsBind">关闭</n-button></n-space></template>
    </n-modal>

    <!-- 头显详情弹窗 -->
    <n-modal v-model:show="showDetailModal" preset="card" title="头显设备详情" style="width:640px;" :bordered="false">
      <n-descriptions v-if="currentDevice" label-placement="left" :column="2" bordered>
        <n-descriptions-item label="设备名称">{{ currentDevice.name }}</n-descriptions-item>
        <n-descriptions-item label="SN 码"><n-tag size="small" type="primary">{{ currentDevice.sn }}</n-tag></n-descriptions-item>
        <n-descriptions-item label="设备型号">{{ currentDevice.model }}</n-descriptions-item>
        <n-descriptions-item label="固件版本">{{ currentDevice.firmware }}</n-descriptions-item>
        <n-descriptions-item label="所属商家">{{ currentDevice.merchant }}</n-descriptions-item>
        <n-descriptions-item label="所属门店">{{ currentDevice.store }}</n-descriptions-item>
        <n-descriptions-item label="绑定主机">{{ currentDevice.boundHostName || '未绑定' }}</n-descriptions-item>
        <n-descriptions-item label="设备状态">
          <n-tag :type="currentDevice.status === 'idle' ? 'info' : currentDevice.status === 'in_use' ? 'success' : 'default'" size="small">
            {{ currentDevice.status === 'idle' ? '空闲' : currentDevice.status === 'in_use' ? '使用中' : '离线' }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="电量">{{ currentDevice.batteryLevel ? currentDevice.batteryLevel + '%' : '--' }}</n-descriptions-item>
        <n-descriptions-item label="瞳距(IPD)">{{ currentDevice.ipd ? currentDevice.ipd + 'mm' : '--' }}</n-descriptions-item>
        <n-descriptions-item label="说明" :span="2">头显设备 SN 码为出厂唯一标识，绑定主机后在 PC 终端的「头显管理」中可远程管理。</n-descriptions-item>
      </n-descriptions>
    </n-modal>

    <!-- 第三方设备弹窗 -->
    <n-modal v-model:show="showAddModal" preset="card" :title="isEditThirdParty ? '编辑第三方设备' : '增加第三方设备'" style="width:520px;" :bordered="false">
      <n-form ref="addFormRef" :model="addForm" :rules="addRules" label-placement="left" label-width="140">
        <n-form-item label="店铺选择" path="shop"><n-select v-model:value="addForm.shop" :options="shopOptions.filter(s=>s.value!=='all')" placeholder="请选择" /></n-form-item>
        <n-form-item label="设备名称" path="name"><n-input v-model:value="addForm.name" placeholder="请输入" /></n-form-item>
        <n-form-item label="播放影片单价" path="price"><n-input-number v-model:value="addForm.price" :min="0" :precision="2" style="width:100%;" /></n-form-item>
        <n-form-item label="播放影片游戏币" path="coins"><n-input-number v-model:value="addForm.coins" :min="0" style="width:100%;" /></n-form-item>
        <n-form-item label="设备状态" path="status"><n-radio-group v-model:value="addForm.status"><n-space><n-radio value="disabled">禁用</n-radio><n-radio value="enabled">启用</n-radio></n-space></n-radio-group></n-form-item>
        <n-form-item label="支付方式" path="payMethods"><n-checkbox-group v-model:value="addForm.payMethods"><n-space><n-checkbox value="member">会员储值支付</n-checkbox><n-checkbox value="wechat">平台支付（微信）</n-checkbox><n-checkbox value="staff">员工扫码</n-checkbox></n-space></n-checkbox-group></n-form-item>
        <n-form-item label="描述" path="desc"><n-input v-model:value="addForm.desc" type="textarea" :maxlength="50" show-count :rows="4" /></n-form-item>
      </n-form>
      <template #footer><n-space justify="center" style="width:100%;"><n-button type="primary" style="width:160px;" @click="handleThirdPartySubmit">{{ isEditThirdParty ? '保存修改' : '增加' }}</n-button></n-space></template>
    </n-modal>
    <n-modal v-model:show="showDeleteModal" preset="card" title="提示" style="width:420px;" :bordered="false" :closable="false">
      <div style="display:flex;align-items:center;gap:12px;padding:8px 0;"><div style="width:28px;height:28px;border-radius:50%;background:#FBBF24;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><span style="color:#fff;font-size:16px;font-weight:bold;">!</span></div><span style="font-size:15px;color:#333;">确定删除第三方设备「{{ deleteTarget?.name }}」，是否继续？</span></div>
      <template #footer><n-space justify="end"><n-button @click="showDeleteModal=false">取消</n-button><n-button type="primary" @click="confirmDelete">确定</n-button></n-space></template>
    </n-modal>

    <!-- 修改点播系统密码弹窗 -->
    <n-modal v-model:show="showPwdModal" preset="card" :title="`修改点播系统密码 - ${pwdHost?.name}`" style="width:420px;" :bordered="false">
      <div style="padding:8px 0;">
        <n-alert type="info" :bordered="false" style="margin-bottom:16px;">密码默认为空，设置后点播系统需输入密码验证身份。</n-alert>
        <n-form label-placement="top">
          <n-form-item label="新密码">
            <n-input v-model:value="pwdNew" type="password" placeholder="请输入新密码（留空则不设密码）" show-password-on="mousedown" clearable />
          </n-form-item>
          <n-form-item label="确认新密码">
            <n-input v-model:value="pwdConfirm" type="password" placeholder="请再次输入新密码" show-password-on="mousedown" clearable />
          </n-form-item>
        </n-form>
        <div v-if="pwdError" style="padding:8px 12px;background:#fee2e2;border-radius:6px;font-size:12px;color:#991b1b;">{{ pwdError }}</div>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="closePwdModal">取消</n-button>
          <n-button type="primary" @click="confirmPwd">保存并应用</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { NDataTable, NButton, NIcon, NSpace, NSelect, NModal, NForm, NFormItem, NInput, NInputNumber, NTag, NDescriptions, NDescriptionsItem, NRadioGroup, NRadio, NCheckboxGroup, NCheckbox, NTabs, NTabPane, NAlert, type DataTableColumns, type FormInst, type FormRules } from 'naive-ui'
import { AddOutline } from '@vicons/ionicons5'

// ── 主机设备 ──────────────────────────────────────
const hostFilterStore = ref<string | null>(null); const hostFilterStatus = ref<string | null>(null); const hostFilterKeyword = ref('')
const hostStatusOpts = [{ label: '在线', value: 'online' }, { label: '离线', value: 'offline' }, { label: '故障', value: 'fault' }]
const hostStoreOpts = computed(() => [...new Set(hostDevices.value.map(d => d.store))].filter(Boolean).map(s => ({ label: s, value: s })))
const filteredHostDevices = computed(() => {
  let list = hostDevices.value
  if (hostFilterStore.value) list = list.filter(d => d.store === hostFilterStore.value)
  if (hostFilterStatus.value) list = list.filter(d => d.status === hostFilterStatus.value)
  if (hostFilterKeyword.value) { const kw = hostFilterKeyword.value.toLowerCase(); list = list.filter(d => d.name.toLowerCase().includes(kw) || d.serialNo.toLowerCase().includes(kw)) }
  return list
})

interface ShopHost { id: number; serialNo: string; name: string; specs: string; osVersion: string; status: string; merchant: string; store: string; boundHeadsetCount: number; boundHeadsetIds: number[]; createdAt: string; vodPassword: string }
const hostDevices = ref<ShopHost[]>([
  { id: 1, serialNo: 'PCT-001', name: '主机 #01', specs: 'i5-12400/16GB/512GB SSD', osVersion: 'Windows 11 Kiosk v2.1', status: 'online', merchant: '恒然集团', store: '恒然科技园店', boundHeadsetCount: 3, boundHeadsetIds: [101, 102, 103], createdAt: '2026-03-10', vodPassword: '' },
  { id: 2, serialNo: 'PCT-002', name: '主机 #02', specs: 'i7-12700/32GB/1TB SSD', osVersion: 'Windows 11 Kiosk v2.1', status: 'online', merchant: '恒然集团', store: '恒然科技园店', boundHeadsetCount: 2, boundHeadsetIds: [], createdAt: '2026-03-10', vodPassword: '' },
  { id: 3, serialNo: 'PCT-003', name: '主机 #03', specs: 'i5-12400/16GB/512GB SSD', osVersion: 'Windows 11 Kiosk v2.1', status: 'online', merchant: '恒然集团', store: '恒然分部展厅', boundHeadsetCount: 2, boundHeadsetIds: [], createdAt: '2026-03-15', vodPassword: '' },
  { id: 4, serialNo: 'PCT-004', name: '主机 #04', specs: 'i7-12700/32GB/1TB SSD', osVersion: 'Windows 11 Kiosk v2.1', status: 'offline', merchant: '利民街商家', store: '利民街小展厅', boundHeadsetCount: 0, boundHeadsetIds: [], createdAt: '2026-03-20', vodPassword: '' },
  { id: 5, serialNo: 'PCT-005', name: '主机 #05', specs: 'i5-12400/16GB/512GB SSD', osVersion: 'Windows 11 Kiosk v2.1', status: 'online', merchant: '利民街商家', store: '利民街小展厅', boundHeadsetCount: 1, boundHeadsetIds: [], createdAt: '2026-04-01', vodPassword: '123456' },
])

const hostColumns: DataTableColumns<ShopHost> = [
  { title: '主机编号', key: 'serialNo', width: 100 }, { title: '名称', key: 'name', minWidth: 100 },
  { title: '硬件配置', key: 'specs', minWidth: 180 }, { title: '系统版本', key: 'osVersion', minWidth: 150 },
  { title: '所属商家', key: 'merchant', minWidth: 100 }, { title: '所属门店', key: 'store', minWidth: 120 },
  { title: '状态', key: 'status', width: 70, align:'center' as const, render: (row: ShopHost) => h(NTag, { size:'small', type: row.status === 'online' ? 'success' : 'default' }, { default: () => row.status === 'online' ? '在线' : '离线' }) },
  { title: '绑定头显', key: 'boundHeadsetCount', width: 80, align:'center' as const, render: (row: ShopHost) => h(NTag, { size:'small', type:'info' }, { default: () => `${row.boundHeadsetCount}台` }) },
  { title: '操作', key: 'actions', width: 200, align:'center' as const, render: (row: ShopHost) => h(NSpace, { size:4 }, { default: () => [
    h(NButton, { size:'tiny', text:true, type:'primary', onClick: () => openHostBind(row) }, { default: () => '绑定头显' }),
    h(NButton, { size:'tiny', text:true, type:'warning', onClick: () => openPwdModal(row) }, { default: () => '修改点播系统密码' }),
  ]}) },
]

// ── 头显设备 ──────────────────────────────────────
const hsFilterStore = ref<string | null>(null); const hsFilterStatus = ref<string | null>(null); const hsFilterKeyword = ref('')
const hsStatusOpts = [{ label: '空闲', value: 'idle' }, { label: '使用中', value: 'in_use' }, { label: '充电', value: 'charging' }, { label: '离线', value: 'offline' }, { label: '故障', value: 'fault' }]
const hsStoreOpts = computed(() => [...new Set(headsetDevices.value.map(d => d.store))].filter(Boolean).map(s => ({ label: s, value: s })))
const filteredHsDevices = computed(() => {
  let list = headsetDevices.value
  if (hsFilterStore.value) list = list.filter(d => d.store === hsFilterStore.value)
  if (hsFilterStatus.value) list = list.filter(d => d.status === hsFilterStatus.value)
  if (hsFilterKeyword.value) { const kw = hsFilterKeyword.value.toLowerCase(); list = list.filter(d => d.name.toLowerCase().includes(kw) || d.sn.toLowerCase().includes(kw)) }
  return list
})

interface ShopHeadset { id: number; name: string; model: string; sn: string; firmware: string; status: string; merchant: string; store: string; boundHostName: string | null; boundHostId: number | null; batteryLevel: number; ipd: number; createdAt: string }
const headsetDevices = ref<ShopHeadset[]>([
  { id: 101, name: 'Pico 4 Pro #01', model: 'Pico 4 Pro', sn: 'SN100001A', firmware: 'v5.4.1', status: 'in_use', merchant: '恒然集团', store: '恒然科技园店', boundHostName: '主机 #01', boundHostId: 1, batteryLevel: 85, ipd: 64.5, createdAt: '2026-03-10' },
  { id: 102, name: 'Pico 4 Pro #02', model: 'Pico 4 Pro', sn: 'SN100002B', firmware: 'v5.4.1', status: 'idle', merchant: '恒然集团', store: '恒然科技园店', boundHostName: '主机 #01', boundHostId: 1, batteryLevel: 65, ipd: 63.0, createdAt: '2026-03-10' },
  { id: 103, name: 'Meta Quest 3 #01', model: 'Meta Quest 3', sn: 'SN200001A', firmware: 'v72.0', status: 'idle', merchant: '恒然集团', store: '恒然科技园店', boundHostName: '主机 #02', boundHostId: 2, batteryLevel: 30, ipd: 65.0, createdAt: '2026-03-15' },
  { id: 104, name: 'Pico 4 #01', model: 'Pico 4', sn: 'SN100003C', firmware: 'v5.4.1', status: 'in_use', merchant: '恒然集团', store: '恒然分部展厅', boundHostName: '主机 #03', boundHostId: 3, batteryLevel: 72, ipd: 62.0, createdAt: '2026-03-15' },
  { id: 105, name: 'Pico Neo 3 #01', model: 'Pico Neo 3', sn: 'SN300001A', firmware: 'v4.8.0', status: 'offline', merchant: '利民街商家', store: '利民街小展厅', boundHostName: null, boundHostId: null, batteryLevel: 0, ipd: 63.5, createdAt: '2026-03-20' },
  { id: 106, name: 'Pico 4 #02', model: 'Pico 4', sn: 'SN100004D', firmware: 'v5.3.0', status: 'idle', merchant: '利民街商家', store: '利民街小展厅', boundHostName: '主机 #05', boundHostId: 5, batteryLevel: 92, ipd: 64.0, createdAt: '2026-04-01' },
  { id: 107, name: 'Pico 4 Pro #03', model: 'Pico 4 Pro', sn: 'SN100005E', firmware: 'v5.4.1', status: 'offline', merchant: '卓远科技', store: '卓远萧山区店', boundHostName: null, boundHostId: null, batteryLevel: 0, ipd: 64.5, createdAt: '2026-04-15' },
  { id: 108, name: 'Pico 4 Ultra #01', model: 'Pico 4 Ultra', sn: 'SN400001A', firmware: 'v1.2.0', status: 'idle', merchant: '利民街商家', store: '利民街小展厅', boundHostName: null, boundHostId: null, batteryLevel: 90, ipd: 64.0, createdAt: '2026-04-20' },
])
const showDetailModal = ref(false); const currentDevice = ref<ShopHeadset | null>(null)

const headsetColumns: DataTableColumns<ShopHeadset> = [
  { title: '头显名称', key: 'name', minWidth: 140 }, { title: 'SN 码', key: 'sn', width: 110 },
  { title: '型号', key: 'model', width: 110 }, { title: '固件', key: 'firmware', width: 80 },
  { title: '所属商家', key: 'merchant', minWidth: 100 }, { title: '所属门店', key: 'store', minWidth: 120 },
  { title: '状态', key: 'status', width: 80, align:'center' as const, render: (row: ShopHeadset) => { const m: Record<string,any> = { idle:{type:'info',label:'空闲'}, in_use:{type:'success',label:'使用中'}, charging:{type:'warning',label:'充电'}, offline:{type:'default',label:'离线'}, fault:{type:'error',label:'故障'} }; return h(NTag, { size:'small', type: m[row.status]?.type }, { default: () => m[row.status]?.label }) } },
  { title: '绑定主机', key: 'boundHostName', width: 100, align:'center' as const, render: (row: ShopHeadset) => row.boundHostName ? h(NTag, { size:'small', type:'success' }, { default: () => row.boundHostName }) : h(NTag, { size:'small', type:'default' }, { default: () => '未绑定' }) },
  { title: '电量', key: 'batteryLevel', width: 70, align:'center' as const, render: (row: ShopHeadset) => row.batteryLevel ? h(NTag, { size:'small', type: row.batteryLevel > 50 ? 'success' : row.batteryLevel > 20 ? 'warning' : 'error' }, { default: () => `${row.batteryLevel}%` }) : h('span', { style:'color:#94a3b8' }, '--') },
  { title: '操作', key: 'actions', width: 120, align:'center' as const, render: (row: ShopHeadset) => h(NSpace, { size:4 }, { default: () => [
    h(NButton, { size:'tiny', text:true, type:'primary', onClick: () => openHsBind(row) }, { default: () => '绑定主机' }),
    h(NButton, { size:'tiny', text:true, type:'info', onClick: () => { currentDevice.value = row; showDetailModal.value = true } }, { default: () => '详情' }),
  ]}) },
]

// ── 主机绑定头显 ──────────────────────────────────
const showHostBindModal = ref(false)
const bindHost = ref<ShopHost | null>(null)
const bindSnInput = ref('')
const foundHeadset = ref<ShopHeadset | null>(null)
const bindSearchDone = ref(false)

function openHostBind(host: ShopHost) {
  bindHost.value = host; bindSnInput.value = ''; foundHeadset.value = null; bindSearchDone.value = false
  showHostBindModal.value = true
}
function closeHostBind() { showHostBindModal.value = false; bindHost.value = null; foundHeadset.value = null; bindSearchDone.value = false }

const storeMismatch = computed(() => {
  if (!bindHost.value || !foundHeadset.value) return false
  return bindHost.value.store !== foundHeadset.value.store
})

function searchHeadsetBySn() {
  bindSearchDone.value = true; foundHeadset.value = null
  const sn = bindSnInput.value.trim().toUpperCase()
  if (!sn) return
  const hs = headsetDevices.value.find(h => h.sn.toUpperCase() === sn)
  if (hs) foundHeadset.value = hs
}

function confirmHostBind() {
  if (!bindHost.value || !foundHeadset.value || storeMismatch.value) return
  const hs = foundHeadset.value
  // 如果头显原来绑定到其他主机，减少旧主机的计数
  if (hs.boundHostId) {
    const oldHost = hostDevices.value.find(h => h.id === hs.boundHostId)
    if (oldHost) oldHost.boundHeadsetCount = Math.max(0, oldHost.boundHeadsetCount - 1)
  }
  // 绑定到新主机
  hs.boundHostName = bindHost.value.name
  hs.boundHostId = bindHost.value.id
  bindHost.value.boundHeadsetCount = headsetDevices.value.filter(h => h.boundHostId === bindHost.value!.id).length + 1
  ;(window as any).$message?.success(`头显 ${hs.name} 已绑定到 ${bindHost.value.name}`)
  closeHostBind()
}

// ── 头显绑定主机 ──────────────────────────────────
const showHsBindModal = ref(false)
const bindHeadset = ref<ShopHeadset | null>(null)
const hsBindHostId = ref<number | null>(null)

const hostBindOpts = computed(() => hostDevices.value.map(h => ({ label: `${h.name} (${h.serialNo} · ${h.store})`, value: h.id, store: h.store })))
const filteredHostBindOpts = computed(() => {
  if (!bindHeadset.value) return []
  return hostBindOpts.value.filter(o => o.store === bindHeadset.value!.store)
})

function openHsBind(headset: ShopHeadset) {
  bindHeadset.value = headset; hsBindHostId.value = null
  showHsBindModal.value = true
}
function closeHsBind() { showHsBindModal.value = false; bindHeadset.value = null; hsBindHostId.value = null }

function confirmHsBind() {
  if (!bindHeadset.value || !hsBindHostId.value) return
  const host = hostDevices.value.find(h => h.id === hsBindHostId.value)
  const hs = bindHeadset.value
  if (!host) return
  // 同店铺校验
  if (host.store !== hs.store) {
    ;(window as any).$message?.error(`绑定失败：头显（${hs.store}）与主机（${host.store}）不在同一店铺`)
    return
  }
  // 如果头显原来绑定到其他主机，减少旧主机的计数
  if (hs.boundHostId) {
    const oldHost = hostDevices.value.find(h => h.id === hs.boundHostId)
    if (oldHost) oldHost.boundHeadsetCount = Math.max(0, oldHost.boundHeadsetCount - 1)
  }
  hs.boundHostName = host.name; hs.boundHostId = host.id
  host.boundHeadsetCount = headsetDevices.value.filter(h => h.boundHostId === host.id).length + 1
  ;(window as any).$message?.success(`${hs.name} 已绑定到 ${host.name}`)
  closeHsBind()
}

// ── 第三方设备 ──────────────────────────────────
interface ThirdPartyDevice { id: number; shop: string; name: string; token: string; status: 'enabled' | 'disabled'; onlineStatus: 'online' | 'offline'; price: number; points: number; payMethods: string[]; desc: string }
const shopOptions = [{ label: '全部店铺', value: 'all' }, { label: '利民街小展厅', value: '利民街小展厅' }]
const selectedShop = ref('all')
const thirdPartyDevices = ref<ThirdPartyDevice[]>([
  { id: 101, shop: '利民街小展厅', name: '扭蛋机', token: `tp_${Math.random().toString(36).slice(2,8)}`, status: 'enabled', onlineStatus: 'online', price: 20, points: 3, payMethods: ['member'], desc: '第三方扭蛋设备' },
  { id: 102, shop: '利民街小展厅', name: '体感游戏机', token: `tp_${Math.random().toString(36).slice(2,8)}`, status: 'enabled', onlineStatus: 'online', price: 15, points: 2, payMethods: ['member'], desc: '第三方体感设备' },
])
const filteredThirdParty = computed(() => selectedShop.value === 'all' ? thirdPartyDevices.value : thirdPartyDevices.value.filter(d => d.shop === selectedShop.value))
const thirdPartyColumns: DataTableColumns<ThirdPartyDevice> = [
  { title: '店铺', key: 'shop', minWidth: 140 }, { title: '设备名称', key: 'name', minWidth: 140 },
  { title: '启用状态', key: 'status', width: 90, align:'center' as const, render: (row: ThirdPartyDevice) => h(NTag, { size:'small', type: row.status === 'enabled' ? 'success' : 'error' }, { default: () => row.status === 'enabled' ? '启用' : '禁用' }) },
  { title: '在线状态', key: 'onlineStatus', width: 90, align:'center' as const, render: (row: ThirdPartyDevice) => h(NTag, { size:'small', type: row.onlineStatus === 'online' ? 'success' : 'error' }, { default: () => row.onlineStatus === 'online' ? '在线' : '离线' }) },
  { title: '单价', key: 'price', width: 80, align:'center' as const }, { title: '游戏币', key: 'points', width: 70, align:'center' as const },
  { title: '操作', key: 'actions', width: 120, align:'center' as const, render: (row: ThirdPartyDevice) => h(NSpace, { size:4 }, { default: () => [
    h(NButton, { size:'tiny', text:true, type:'primary', onClick: () => openEditThirdParty(row) }, { default: () => '编辑' }),
    h(NButton, { size:'tiny', text:true, type:'error', onClick: () => handleThirdPartyDelete(row) }, { default: () => '删除' }),
  ]}) },
]

// ── 第三方 CRUD ────────────────────────────────
const showAddModal = ref(false); const showDeleteModal = ref(false); const addFormRef = ref<FormInst | null>(null)
const isEditThirdParty = ref(false)
const editThirdPartyId = ref<number | null>(null)
const addForm = ref({ name: '', shop: '', price: 20.00, coins: 3, status: 'enabled' as 'enabled'|'disabled', payMethods: ['member'] as string[], desc: '' })
const addRules: FormRules = { shop: { required: true, message: '请选择店铺', trigger: 'change' }, name: { required: true, message: '请输入设备名称', trigger: 'blur' } }
const deleteTarget = ref<ThirdPartyDevice | null>(null)

function openAddThirdParty() {
  isEditThirdParty.value = false; editThirdPartyId.value = null
  addForm.value = { name:'', shop:'', price:20.00, coins:3, status:'enabled', payMethods:['member'], desc:'' }
  showAddModal.value = true
}

function openEditThirdParty(row: ThirdPartyDevice) {
  isEditThirdParty.value = true; editThirdPartyId.value = row.id
  addForm.value = {
    name: row.name, shop: row.shop, price: row.price, coins: row.points,
    status: row.status, payMethods: [...row.payMethods], desc: row.desc
  }
  showAddModal.value = true
}

function handleThirdPartySubmit() {
  addFormRef.value?.validate(e => {
    if (e) return
    if (isEditThirdParty.value && editThirdPartyId.value !== null) {
      const idx = thirdPartyDevices.value.findIndex(d => d.id === editThirdPartyId.value)
      if (idx !== -1) {
        thirdPartyDevices.value[idx] = {
          ...thirdPartyDevices.value[idx],
          name: addForm.value.name, shop: addForm.value.shop,
          price: addForm.value.price, points: addForm.value.coins,
          status: addForm.value.status, payMethods: [...addForm.value.payMethods],
          desc: addForm.value.desc
        }
      }
      ;(window as any).$message?.success(`设备「${addForm.value.name}」已更新`)
    } else {
      thirdPartyDevices.value.unshift({
        id: Date.now(), shop: addForm.value.shop, name: addForm.value.name,
        token: `tp_${Math.random().toString(36).slice(2,10)}`,
        status: addForm.value.status, onlineStatus: 'online',
        price: addForm.value.price, points: addForm.value.coins,
        payMethods: [...addForm.value.payMethods], desc: addForm.value.desc
      })
      ;(window as any).$message?.success(`设备「${addForm.value.name}」已添加`)
    }
    showAddModal.value = false
    addForm.value = { name:'', shop:'', price:20.00, coins:3, status:'enabled', payMethods:['member'], desc:'' }
  })
}
function handleThirdPartyDelete(row: ThirdPartyDevice) { deleteTarget.value = row; showDeleteModal.value = true }
function confirmDelete() {
  if (deleteTarget.value) {
    const idx = thirdPartyDevices.value.findIndex(d => d.id === deleteTarget.value!.id)
    if (idx !== -1) thirdPartyDevices.value.splice(idx, 1)
    ;(window as any).$message?.success(`设备「${deleteTarget.value.name}」已删除`)
  }
  showDeleteModal.value = false; deleteTarget.value = null
}

// ── 修改点播系统密码 ─────────────────────────────
const showPwdModal = ref(false)
const pwdHost = ref<ShopHost | null>(null)
const pwdNew = ref('')
const pwdConfirm = ref('')
const pwdError = ref('')

function openPwdModal(host: ShopHost) {
  pwdHost.value = host
  pwdNew.value = ''
  pwdConfirm.value = ''
  pwdError.value = ''
  showPwdModal.value = true
}

function closePwdModal() {
  showPwdModal.value = false
  pwdHost.value = null
  pwdNew.value = ''
  pwdConfirm.value = ''
  pwdError.value = ''
}

function confirmPwd() {
  if (!pwdHost.value) return

  // 密码一致性校验
  if (pwdNew.value !== pwdConfirm.value) {
    pwdError.value = '两次输入的密码不一致，请重新输入'
    return
  }

  // 保存密码（空字符串表示不设密码）
  pwdHost.value.vodPassword = pwdNew.value

  const label = pwdNew.value ? `已设置为「${pwdNew.value}」` : '已清除密码（不设密码）'
  ;(window as any).$message?.success(`主机「${pwdHost.value.name}」点播系统密码修改成功，${label}`)
  closePwdModal()
}
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
.page-header h1 { font-size:20px; font-weight:600; color:#333; margin:0; }
.filter-bar { display:flex; align-items:center; gap:12px; margin-bottom:16px; flex-wrap:wrap; position:relative; z-index:1; }
.bind-result-card { background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:14px; }
.bind-result-header { display:flex; align-items:center; gap:8px; margin-bottom:8px; font-weight:600; font-size:14px; }
.bind-result-body { display:flex; gap:16px; font-size:12px; color:#64748b; }
.bind-result-warn { margin-top:8px; padding:6px 10px; background:#fef3c7; border-radius:6px; font-size:12px; color:#92400e; }
.bind-result-error { margin-top:8px; padding:6px 10px; background:#fee2e2; border-radius:6px; font-size:12px; color:#991b1b; }
</style>
