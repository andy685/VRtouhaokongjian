<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">设备配置管理</h1>
    </div>

    <n-tabs type="line" style="overflow:visible;">
      <!-- ========== Tab 1: 设备类型 ========== -->
      <n-tab-pane name="types" tab="📦 设备类型">
        <div class="section-toolbar">
          <n-button type="primary" size="small" @click="isEditingType = false; editingTypeId = null; typeForm = { name: '', desc: '', params: '' }; showTypeModal = true">
            <template #icon><n-icon :component="AddOutline" /></template>新增设备类型
          </n-button>
        </div>
        <n-data-table :columns="typeColumns" :data="deviceTypes" :bordered="false" size="small" striped />
      </n-tab-pane>

      <!-- ========== Tab 2: 主机管理（含Token） ========== -->
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

      <!-- ========== Tab 4: OTA 升级 ========== -->
      <n-tab-pane name="ota" tab="📡 OTA 升级">
        <div class="filter-bar">
          <n-select v-model:value="otaFilterType" :options="otaFilterOpts" placeholder="设备类型" style="width:130px;" clearable size="small" />
        </div>
        <div class="section-toolbar">
          <n-button type="primary" size="small" @click="isEditingType = false; editingTypeId = null; typeForm = { name: '', desc: '', params: '' }; showOtaModal = true">
            <template #icon><n-icon :component="CloudUploadOutline" /></template>上传升级包
          </n-button>
        </div>
        <n-data-table :columns="otaColumns" :data="filteredOtaPackages" :bordered="false" size="small" striped :row-key="(row:any)=>row.id" />
      </n-tab-pane>
    </n-tabs>

    <!-- 弹窗：OTA 升级详情 -->
    <n-modal v-model:show="showOtaDetailModal" preset="card" :title="`OTA 升级包详情 - ${currentOtaPackage?.name}`" style="width:580px;" :bordered="false">
      <div v-if="currentOtaPackage" class="ota-detail">
        <n-descriptions :column="2" bordered size="small" style="margin-bottom:16px;">
          <n-descriptions-item label="升级包名称">{{ currentOtaPackage.name }}</n-descriptions-item>
          <n-descriptions-item label="版本号">{{ currentOtaPackage.version }}</n-descriptions-item>
          <n-descriptions-item label="目标设备">{{ currentOtaPackage.targetType }}</n-descriptions-item>
          <n-descriptions-item label="包大小">{{ currentOtaPackage.size }}</n-descriptions-item>
          <n-descriptions-item label="上传时间" :span="2">{{ currentOtaPackage.createdAt }}</n-descriptions-item>
          <n-descriptions-item label="更新说明" :span="2">{{ currentOtaPackage.notes }}</n-descriptions-item>
        </n-descriptions>
        <n-alert v-if="currentOtaPackage.status === 'unpublished'" type="info" style="margin-top:8px;">
          该升级包尚未发布，发布后设备将在联网时自动检测并下载升级。
        </n-alert>
        <n-alert v-if="currentOtaPackage.status === 'published'" type="success" style="margin-top:8px;">
          该升级包已于 {{ currentOtaPackage.publishedAt }} 发布，设备联网后将自动拉取升级。
        </n-alert>
      </div>
      <template #footer>
        <n-space justify="center">
          <n-button @click="showOtaDetailModal = false">关闭</n-button>
          <n-button v-if="currentOtaPackage?.status === 'unpublished'" type="primary" @click="publishOtaPackage">发布升级包</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 弹窗：新增/编辑设备类型 -->
    <n-modal v-model:show="showTypeModal" preset="card" :title="isEditingType ? '编辑设备类型' : '新增设备类型'" style="width:480px;" :bordered="false">
      <n-form ref="typeFormRef" :model="typeForm" :rules="typeRules" label-placement="left" label-width="100">
        <n-form-item label="类型名称" path="name"><n-input v-model:value="typeForm.name" placeholder="如：悬浮骑兵" /></n-form-item>
        <n-form-item label="描述" path="desc"><n-input v-model:value="typeForm.desc" type="textarea" :rows="3" /></n-form-item>
        <n-form-item label="默认参数" path="params"><n-input v-model:value="typeForm.params" type="textarea" :rows="3" /></n-form-item>
      </n-form>
      <template #footer><n-space justify="center"><n-button @click="showTypeModal=false">取消</n-button><n-button type="primary" @click="handleSaveType">确定</n-button></n-space></template>
    </n-modal>

    <!-- 弹窗：录入主机 -->
    <n-modal v-model:show="showAddHostModal" preset="card" title="录入主机" style="width:520px;" :bordered="false">
      <n-form ref="addHostFormRef" :model="addHostForm" :rules="hostRules" label-placement="left" label-width="110">
        <n-form-item label="主机编号" path="serialNo"><n-input v-model:value="addHostForm.serialNo" placeholder="如：PCT-001" /></n-form-item>
        <n-form-item label="主机名称" path="name"><n-input v-model:value="addHostForm.name" placeholder="如：大厅主机 #01" /></n-form-item>
        <n-form-item label="设备类型" path="deviceType"><n-select v-model:value="addHostForm.deviceType" :options="hostTypeOpts" placeholder="选择设备类型" /></n-form-item>
        <n-form-item label="硬件配置" path="specs"><n-input v-model:value="addHostForm.specs" placeholder="CPU/内存/存储/显卡" /></n-form-item>
        <n-form-item label="系统版本" path="osVersion"><n-input v-model:value="addHostForm.osVersion" placeholder="如：Windows 11 Kiosk v2.1" /></n-form-item>
        <n-form-item label="MAC 地址" path="macAddress"><n-input v-model:value="addHostForm.macAddress" placeholder="如：00:1A:2B:3C:4D:5E" /></n-form-item>
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
        <n-form-item label="MAC 地址"><n-input v-model:value="editHostForm.macAddress" placeholder="如：00:1A:2B:3C:4D:5E" /></n-form-item>
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
        <n-form-item label="目标设备" path="targetType"><n-select v-model:value="otaForm.targetType" :options="[{label:'主机',value:'host'},{label:'头显',value:'headset'}]" placeholder="选择目标设备类型" /></n-form-item>
        <n-form-item label="版本号" path="version"><n-input v-model:value="otaForm.version" placeholder="如：v2.1.0" /></n-form-item>
        <n-form-item label="更新说明" path="notes"><n-input v-model:value="otaForm.notes" type="textarea" :rows="4" /></n-form-item>
        <n-form-item label="升级文件" path="file"><n-upload :default-upload="false" :max="1" accept=".bin,.zip,.img"><n-button>选择文件</n-button></n-upload></n-form-item>
      </n-form>
      <template #footer><n-space justify="center"><n-button @click="showOtaModal=false">取消</n-button><n-button type="primary" @click="handleUploadOta">上传</n-button></n-space></template>
    </n-modal>

    <!-- 弹窗：编辑头显 -->
    <n-modal v-model:show="showEditHeadsetModal" preset="card" title="编辑头显" style="width:480px;" :bordered="false">
      <n-form label-placement="left" label-width="100">
        <n-form-item label="头显名称"><n-input v-model:value="editHeadsetForm.name" /></n-form-item>
        <n-form-item label="设备型号"><n-select v-model:value="editHeadsetForm.model" :options="headsetModelOpts" /></n-form-item>
        <n-form-item label="SN 码"><n-input v-model:value="editHeadsetForm.sn" /></n-form-item>
        <n-form-item label="固件版本"><n-input v-model:value="editHeadsetForm.firmware" /></n-form-item>
        <n-form-item label="状态">
          <n-space><n-tag size="small" :type="statusTagType(editHeadsetForm.status)">{{ statusTagLabel(editHeadsetForm.status) }}</n-tag><n-text depth="3" style="font-size:11px;margin-left:8px;">状态由设备实时上报</n-text></n-space>
        </n-form-item>
      </n-form>
      <template #footer><n-space justify="center"><n-button @click="showEditHeadsetModal=false">取消</n-button><n-button type="primary" @click="handleEditHeadset">保存</n-button></n-space></template>
    </n-modal>

    <!-- 弹窗：分配头显 -->
    <n-modal v-model:show="showAllocHeadsetModal" preset="card" title="分配头显" style="width:480px;" :bordered="false">
      <n-form ref="allocHeadsetFormRef" :model="allocHeadsetForm" :rules="allocHeadsetRules" label-placement="left" label-width="100">
        <n-descriptions :column="1" bordered size="small">
          <n-descriptions-item label="头显">{{ allocHeadsetForm.deviceName }}</n-descriptions-item>
          <n-descriptions-item label="SN码">{{ allocHeadsetForm.sn }}</n-descriptions-item>
        </n-descriptions>
        <div style="height:16px;" />
        <n-form-item label="分配商家" path="merchant"><n-select v-model:value="allocHeadsetForm.merchant" :options="merchantOpts" placeholder="选择商家" filterable @update:value="allocHeadsetForm.store=''" /></n-form-item>
        <n-form-item label="分配店铺" path="store"><n-select v-model:value="allocHeadsetForm.store" :options="getStoreOpts(allocHeadsetForm.merchant)" placeholder="先选商家 → 再选门店" filterable :disabled="!allocHeadsetForm.merchant" /></n-form-item>
      </n-form>
      <template #footer><n-space justify="center"><n-button @click="showAllocHeadsetModal=false">取消</n-button><n-button type="primary" @click="handleAllocHeadset">确认分配</n-button></n-space></template>
    </n-modal>

    <!-- 弹窗：绑定主机 -->
    <n-modal v-model:show="showBindHostModal" preset="card" title="绑定到主机" style="width:480px;" :bordered="false">
      <n-form label-placement="left" label-width="100">
        <n-descriptions :column="1" bordered size="small">
          <n-descriptions-item label="头显">{{ bindHostForm.headsetName }}</n-descriptions-item>
        </n-descriptions>
        <div style="height:16px;" />
        <n-form-item label="选择主机" path="hostId">
          <n-select v-model:value="bindHostForm.hostId" :options="hostOpts" placeholder="选择在线主机" filterable />
        </n-form-item>
      </n-form>
      <template #footer><n-space justify="center"><n-button @click="showBindHostModal=false">取消</n-button><n-button type="primary" @click="handleBindHost">确认绑定</n-button></n-space></template>
    </n-modal>

    <!-- 弹窗：取消分配头显确认 -->
    <n-modal v-model:show="showUnassignHeadsetModal" preset="card" title="确认取消分配" style="width:420px;" :bordered="false" :closable="false">
      <div style="display:flex;align-items:flex-start;gap:12px;padding:8px 0;">
        <div style="width:32px;height:32px;border-radius:50%;background:#fbbf24;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px;color:#fff;font-weight:bold;">!</div>
        <div>
          <div style="font-size:15px;font-weight:600;color:#333;margin-bottom:6px;">确认取消分配该头显？</div>
          <div style="font-size:13px;color:#64748b;line-height:1.6;">
            取消分配后，该头显将从当前商家/门店回收，需重新分配才能投入使用。<br>
            <strong>已绑定的主机连接将自动解除。</strong>
          </div>
        </div>
      </div>
      <template #footer>
        <div style="display:flex;justify-content:flex-end;gap:8px;">
          <n-button @click="showUnassignHeadsetModal=false">取消</n-button>
          <n-button type="warning" @click="confirmUnassignHeadset">确认取消分配</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NTabs, NTabPane, NDataTable, NButton, NIcon, NSpace, NInput,
  NModal, NForm, NFormItem, NSelect, NTag, NUpload, NDescriptions, NDescriptionsItem,
  NRadioGroup, NRadio, NText, NAlert,
  type FormInst, type FormRules
} from 'naive-ui'
import { AddOutline, CloudUploadOutline, ArrowForwardOutline, CheckmarkCircleOutline, CloseCircleOutline } from '@vicons/ionicons5'

// 安全复制文本（兼容非 HTTPS 环境）
function copyText(text: string) {
  try {
    navigator.clipboard.writeText(text).then(() => $message.success('已复制'))
      .catch(() => fallbackCopy(text))
  } catch {
    fallbackCopy(text)
  }
}
function fallbackCopy(text: string) {
  const el = document.createElement('textarea')
  el.value = text; el.style.position = 'fixed'; el.style.left = '-9999px'
  document.body.appendChild(el); el.select()
  document.execCommand('copy'); document.body.removeChild(el)
  $message.success('已复制')
}
const $message = (window as any).$message

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
  { title: '操作', key: 'actions', width: 120, align: 'center' as const, render: (row: DeviceType) => h(NButton, { size: 'tiny', text: true, type: 'primary', onClick: () => openEditType(row) }, { default: () => '编辑' }) },
]
const showTypeModal = ref(false); const typeFormRef = ref<FormInst | null>(null)
const isEditingType = ref(false)
const editingTypeId = ref<number | null>(null)
const typeForm = ref({ name: '', desc: '', params: '' })
const typeRules: FormRules = { name: { required: true, message: '请输入类型名称', trigger: 'blur' } }

function openEditType(row: DeviceType) {
  isEditingType.value = true
  editingTypeId.value = row.id
  typeForm.value = { name: row.name, desc: row.desc, params: row.params }
  showTypeModal.value = true
}

function handleSaveType() {
  typeFormRef.value?.validate(e => { if (e) return })
  if (isEditingType.value && editingTypeId.value !== null) {
    const idx = deviceTypes.value.findIndex(t => t.id === editingTypeId.value)
    if (idx !== -1) {
      deviceTypes.value[idx] = { ...deviceTypes.value[idx], ...typeForm.value }
      ;(window as any).$message?.success('设备类型已更新')
    }
  } else {
    deviceTypes.value.unshift({ id: Date.now(), name: typeForm.value.name, desc: typeForm.value.desc, params: typeForm.value.params, deviceCount: 0, createdAt: new Date().toISOString().slice(0, 10) })
    ;(window as any).$message?.success('设备类型已添加')
  }
  showTypeModal.value = false
  typeForm.value = { name: '', desc: '', params: '' }
  isEditingType.value = false
  editingTypeId.value = null
}

// ─── 公共数据 ──────────────────────────────────────
const merchantNames = ['恒然集团', '利民街商家', '党建馆集团', '华东展厅', '卓远科技']
const merchantStoreMap: Record<string, string[]> = {
  '恒然集团': ['恒然科技园店', '恒然分部展厅'], '利民街商家': ['利民街小展厅'], '党建馆集团': ['党建馆'], '华东展厅': ['华东展厅'], '卓远科技': ['卓远萝岗区店', '卓远萧山区店', '卓远亚运城店'],
}
const merchantOpts = computed(() => merchantNames.map(m => ({ label: m, value: m })))
function getStoreOpts(merchant: string) { if (!merchant) return []; return (merchantStoreMap[merchant] || []).map(s => ({ label: s, value: s })) }

// ─── 主机管理 ──────────────────────────────────────
interface HostDevice { id: number; serialNo: string; name: string; deviceType: string; specs: string; macAddress: string; osVersion: string; status: 'online' | 'offline' | 'fault'; merchant: string; store: string; token: string; tokenStatus: 'active' | 'none'; boundHeadsets: number[]; createdAt: string }
const hostTypeNames = ['悬浮骑兵', '暗黑行者', '暗黑机甲', '幻影飞碟', '通用主机']
function genHosts(): HostDevice[] {
  const r: HostDevice[] = []; const specs = ['i5-12400/16GB/512GB SSD', 'i7-12700/32GB/1TB SSD', 'i9-13900/64GB/2TB SSD']
  for (let i = 1; i <= 20; i++) {
    const s = (['online', 'online', 'online', 'offline', 'fault'] as const)[i % 5]
    const m = merchantNames[i % 5]
    const stores = merchantStoreMap[m] || []
    const ss = i > 5 && stores.length > 0 ? stores[i % stores.length] : '--'
    const mac = `00:1A:2B:${String(i).padStart(3,'0').slice(0,2)}:${String(i*7).padStart(2,'0')}:${String(i*13).padStart(2,'0')}`
    r.push({ id: i, serialNo: `PCT-${String(i).padStart(3,'0')}`, name: `主机 #${String(i).padStart(2,'0')}`, deviceType: hostTypeNames[i % hostTypeNames.length], specs: specs[i%3], macAddress: mac, osVersion: 'Windows 11 Kiosk v2.1', status: s, merchant: i > 5 ? m : '--', store: i > 5 ? ss : '--', token: i > 5 ? `tk_host_${i}` : '--', tokenStatus: i > 5 ? 'active' : 'none', boundHeadsets: [], createdAt: '2026-03-10' })
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
  if (hostFilterKeyword.value) { const kw = hostFilterKeyword.value.toLowerCase(); list = list.filter(d => d.serialNo.toLowerCase().includes(kw) || d.name.toLowerCase().includes(kw) || d.macAddress.toLowerCase().includes(kw)) }
  return list
})
function resetHostFilter() { hostFilterMerchant.value = null; hostFilterStore.value = null; hostFilterType.value = null; hostFilterStatus.value = null; hostFilterKeyword.value = '' }

const statusTagMap: Record<string, { type: any; label: string }> = {
  online: { type: 'success', label: '在线' },
  offline: { type: 'default', label: '离线' },
  fault: { type: 'warning', label: '故障' },
  idle: { type: 'info', label: '空闲' },
  in_use: { type: 'success', label: '使用中' },
  charging: { type: 'warning', label: '充电中' },
}
function statusTagType(s: string) { return statusTagMap[s]?.type || 'default' }
function statusTagLabel(s: string) { return statusTagMap[s]?.label || s }
const hostStatusRender = (s: string) => { const m = statusTagMap[s]; return h(NTag, { size:'small', type: m?.type || 'default' }, { default: () => m?.label || s }) }

function genToken() { return `tk_host_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}` }

const hostColumns = [
  { type: 'selection' as const, width: 40 }, { title: '主机编号', key: 'serialNo', width: 110 }, { title: '名称', key: 'name', minWidth: 120 },
  { title: '设备类型', key: 'deviceType', width: 100, render: (row: HostDevice) => h(NTag, { size:'small', type:'info', bordered:false }, { default: () => row.deviceType }) },
  { title: '硬件配置', key: 'specs', minWidth: 180 }, { title: '系统版本', key: 'osVersion', minWidth: 160 },
  { title: 'MAC 地址', key: 'macAddress', width: 140, render: (row: HostDevice) => h('span', { style: 'font-family:monospace;font-size:11px;color:#6366f1;' }, row.macAddress) },
  { title: '所属商家', key: 'merchant', minWidth: 100 }, { title: '所属门店', key: 'store', minWidth: 120 },
  { title: '状态', key: 'status', width: 70, align:'center' as const, render: (row: HostDevice) => hostStatusRender(row.status) },
  { title: '绑定头显', key: 'boundHeadsets', width: 80, align:'center' as const, render: (row: HostDevice) => h(NTag, { size:'small', type:'info' }, { default: () => `${row.boundHeadsets.length}台` }) },
  {
    title: 'Token', key: 'token', minWidth: 140,
    render: (row: HostDevice) => {
      if (row.tokenStatus === 'none' || !row.token) return h(NTag, { size:'small', type:'default' }, { default: () => '未分配' })
      // 用 div 替代 NSpace，避免循环引用
      return h('div', { style: 'display:flex;align-items:center;gap:4px;' }, [
        h('span', { style: 'font-family:monospace;font-size:11px;color:#6366f1;max-width:100px;overflow:hidden;text-overflow:ellipsis;' }, `${row.token.slice(0, 12)}...`),
        h(NButton, { size:'tiny', text:true, type:'primary', onClick: () => copyText(row.token) }, { default: () => '复制' }),
      ])
    }
  },
  {
    title: '操作', key: 'actions', width: 260, align:'center' as const,
    render: (row: HostDevice) => {
      const btns: any[] = [
        h(NButton, { size:'tiny', text:true, type:'primary', onClick: () => openEditHost(row) }, { default: () => '编辑' })
      ]
      if (row.merchant === '--') {
        btns.push(h(NButton, { size:'tiny', text:true, type:'info', onClick: () => { allocHostForm.value = { deviceId:row.id, deviceName:row.name, serialNo:row.serialNo, merchant:'', store:'' }; showAllocHostModal.value = true } }, { default: () => '分配' }))
      } else {
        btns.push(h(NButton, { size:'tiny', text:true, type:'warning', onClick: () => { unassignTarget.value = row; showUnassignModal.value = true } }, { default: () => '取消分配' }))
      }
      if (row.tokenStatus === 'active') {
        btns.push(h('span', { style:'margin:0 2px;color:#ddd;' }, '|'))
        btns.push(h(NButton, { size:'tiny', text:true, type:'error', onClick: () => { row.tokenStatus = 'none'; row.token = '--'; (window as any).$message?.warning(`Token 已吊销：${row.name}`) } }, { default: () => '吊销Token' }))
      } else if (row.merchant !== '--') {
        btns.push(h('span', { style:'margin:0 2px;color:#ddd;' }, '|'))
        btns.push(h(NButton, { size:'tiny', text:true, type:'primary', onClick: () => { row.token = genToken(); row.tokenStatus = 'active'; (window as any).$message?.success('Token 已重新生成') } }, { default: () => '生成Token' }))
      }
      return h('div', { style:'display:flex;align-items:center;gap:4px;justify-content:center;' }, btns)
    }
  },
]

const showEditHostModal = ref(false); const editHostForm = ref({ id: 0, serialNo: '', name: '', deviceType: '', specs: '', osVersion: '', macAddress: '', status: 'online' as 'online' | 'offline' | 'fault' })
const showUnassignModal = ref(false); const unassignTarget = ref<HostDevice | null>(null)
function confirmUnassign() {
  const row = unassignTarget.value; if (!row) return
  row.merchant = '--'; row.store = '--'; row.token = '--'; row.tokenStatus = 'none'
  selectedHostIds.value = selectedHostIds.value.filter(id => id !== row.id)
  showUnassignModal.value = false; unassignTarget.value = null
  ;(window as any).$message?.info(`已取消分配：${row.name}，Token 已自动吊销`)
}
function openEditHost(row: HostDevice) { editHostForm.value = { id: row.id, serialNo: row.serialNo, name: row.name, deviceType: row.deviceType, specs: row.specs, osVersion: row.osVersion, macAddress: row.macAddress, status: row.status }; showEditHostModal.value = true }
function handleEditHost() {
  const idx = hosts.value.findIndex(d => d.id === editHostForm.value.id)
  if (idx !== -1) { hosts.value[idx] = { ...hosts.value[idx], ...editHostForm.value }; (window as any).$message?.success('主机信息已更新') }
  showEditHostModal.value = false
}
const showAddHostModal = ref(false); const addHostFormRef = ref<FormInst | null>(null)
const addHostForm = ref({ serialNo: '', name: '', deviceType: '', specs: '', osVersion: '', macAddress: '', notes: '' })
const hostRules: FormRules = { serialNo: { required: true, message: '请输入主机编号', trigger: 'blur' }, name: { required: true, message: '请输入主机名称', trigger: 'blur' }, deviceType: { required: true, message: '请选择设备类型', trigger: 'change' }, macAddress: { required: true, message: '请输入 MAC 地址', trigger: 'blur' } }
function handleAddHost() {
  addHostFormRef.value?.validate(e => { if (e) return; hosts.value.unshift({ id: Date.now(), serialNo: addHostForm.value.serialNo, name: addHostForm.value.name, deviceType: addHostForm.value.deviceType, specs: addHostForm.value.specs || '--', macAddress: addHostForm.value.macAddress, osVersion: addHostForm.value.osVersion || '--', status: 'online', merchant: '--', store: '--', token: '--', tokenStatus: 'none', boundHeadsets: [], createdAt: new Date().toISOString().slice(0,10) }); showAddHostModal.value = false; addHostForm.value = { serialNo:'', name:'', deviceType:'', specs:'', osVersion:'', macAddress:'', notes:'' }; (window as any).$message?.success('主机已录入') })
}
const showAllocHostModal = ref(false); const allocHostFormRef = ref<FormInst | null>(null)
const allocHostForm = ref({ deviceId: 0, deviceName: '', serialNo: '', merchant: '', store: '' })
const allocRules: FormRules = { merchant: { required: true, message: '请选择商家', trigger: 'change' }, store: { required: true, message: '请选择门店', trigger: 'change' } }
function handleAllocHost() {
  allocHostFormRef.value?.validate(e => { if (e) return; const d = hosts.value.find(d => d.id === allocHostForm.value.deviceId); if (d) { d.merchant = allocHostForm.value.merchant; d.store = allocHostForm.value.store; d.token = `tk_host_${Date.now().toString(36)}`; d.tokenStatus = 'active' }; showAllocHostModal.value = false; (window as any).$message?.success(`主机已分配给 ${allocHostForm.value.store}`) })
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
  const m = statusTagMap[s] || { type:'default', label:'未知' }
  return h(NTag, { size:'small', type: m.type }, { default: () => m.label })
}

const headsetColumns = [
  { title: '头显名称', key: 'name', minWidth: 150 }, { title: 'SN 码', key: 'sn', width: 130 },
  { title: '型号', key: 'model', width: 130 }, { title: '固件版本', key: 'firmware', width: 90 },
  { title: '所属商家', key: 'merchant', minWidth: 100 }, { title: '所属门店', key: 'store', minWidth: 120 },
  { title: '绑定主机', key: 'boundHostId', width: 90, align:'center' as const, render: (row: HeadsetDevice) => row.boundHostId ? h(NTag, { size:'small', type:'success' }, { default: () => `M-${String(row.boundHostId).padStart(2,'0')}` }) : h(NTag, { size:'small', type:'default' }, { default: () => '未绑定' }) },
  { title: '状态', key: 'status', width: 80, align:'center' as const, render: (row: HeadsetDevice) => hsStatusRender(row.status) },
  { title: '电量', key: 'batteryLevel', width: 70, align:'center' as const, render: (row: HeadsetDevice) => h(NTag, { size:'small', type: row.batteryLevel > 50 ? 'success' : row.batteryLevel > 20 ? 'warning' : 'error' }, { default: () => `${row.batteryLevel}%` }) },
  {
    title: '操作', key: 'actions', width: 200, align:'center' as const,
    render: (row: HeadsetDevice) => {
      const btns: any[] = [
        h(NButton, { size:'tiny', text:true, type:'primary', onClick: () => openEditHeadset(row) }, { default: () => '编辑' })
      ]
      if (row.merchant === '--') {
        btns.push(h(NButton, { size:'tiny', text:true, type:'info', onClick: () => { allocHeadsetForm.value = { deviceId: row.id, deviceName: row.name, sn: row.sn, merchant: '', store: '' }; showAllocHeadsetModal.value = true } }, { default: () => '分配' }))
      } else {
        btns.push(h(NButton, { size:'tiny', text:true, type:'warning', onClick: () => { unassignHeadsetTarget.value = row; showUnassignHeadsetModal.value = true } }, { default: () => '取消分配' }))
        if (!row.boundHostId) {
          btns.push(h(NButton, { size:'tiny', text:true, type:'success', onClick: () => { bindHostForm.value = { headsetId: row.id, headsetName: row.name, hostId: null }; showBindHostModal.value = true } }, { default: () => '绑定' }))
        } else {
          btns.push(h(NButton, { size:'tiny', text:true, type:'error', onClick: () => { row.boundHostId = null; (window as any).$message?.info('已解除绑定') } }, { default: () => '解绑' }))
        }
      }
      return h('div', { style:'display:flex;align-items:center;gap:4px;justify-content:center;' }, btns)
    }
  },
]

const showEditHeadsetModal = ref(false); const editHeadsetForm = ref({ id: 0, name: '', model: '', sn: '', firmware: '', status: 'idle' as HeadsetDevice['status'] })
const showAllocHeadsetModal = ref(false); const allocHeadsetFormRef = ref<FormInst | null>(null)
const allocHeadsetForm = ref({ deviceId: 0, deviceName: '', sn: '', merchant: '', store: '' })
const allocHeadsetRules: FormRules = { merchant: { required: true, message: '请选择商家', trigger: 'change' }, store: { required: true, message: '请选择门店', trigger: 'change' } }
const showBindHostModal = ref(false); const bindHostForm = ref({ headsetId: 0, headsetName: '', hostId: null as number | null })
const hostOpts = computed(() => hosts.value.filter(h => h.merchant !== '--' && h.status === 'online').map(h => ({ label: `${h.name} (${h.serialNo}) - ${h.store}`, value: h.id })))
const showUnassignHeadsetModal = ref(false); const unassignHeadsetTarget = ref<HeadsetDevice | null>(null)

function openEditHeadset(row: HeadsetDevice) { editHeadsetForm.value = { id: row.id, name: row.name, model: row.model, sn: row.sn, firmware: row.firmware, status: row.status }; showEditHeadsetModal.value = true }
function handleEditHeadset() {
  const idx = headsets.value.findIndex(d => d.id === editHeadsetForm.value.id)
  if (idx !== -1) { headsets.value[idx] = { ...headsets.value[idx], ...editHeadsetForm.value }; (window as any).$message?.success('头显信息已更新') }
  showEditHeadsetModal.value = false
}
function handleAllocHeadset() {
  allocHeadsetFormRef.value?.validate(e => { if (e) return; const d = headsets.value.find(d => d.id === allocHeadsetForm.value.deviceId); if (d) { d.merchant = allocHeadsetForm.value.merchant; d.store = allocHeadsetForm.value.store } }); showAllocHeadsetModal.value = false; (window as any).$message?.success(`头显已分配给 ${allocHeadsetForm.value.store}`) }
function confirmUnassignHeadset() {
  const row = unassignHeadsetTarget.value; if (!row) return
  row.merchant = '--'; row.store = '--'; row.boundHostId = null
  showUnassignHeadsetModal.value = false; unassignHeadsetTarget.value = null
  ;(window as any).$message?.info(`已取消分配：${row.name}`)
}
function handleBindHost() {
  const d = headsets.value.find(d => d.id === bindHostForm.value.headsetId)
  if (d) { d.boundHostId = bindHostForm.value.hostId; (window as any).$message?.success(`已绑定到主机 M-${String(bindHostForm.value.hostId).padStart(2,'0')}`) }
  showBindHostModal.value = false
}

const showAddHeadsetModal = ref(false); const addHeadsetFormRef = ref<FormInst | null>(null)
const addHeadsetForm = ref({ name: '', model: '', sn: '', firmware: '', notes: '' })
const headsetRules: FormRules = { name: { required: true, message: '请输入头显名称', trigger: 'blur' }, model: { required: true, message: '请选择型号', trigger: 'change' }, sn: { required: true, message: '请输入 SN 码', trigger: 'blur' } }
function handleAddHeadset() {
  addHeadsetFormRef.value?.validate(e => { if (e) return; headsets.value.unshift({ id: Date.now(), name: addHeadsetForm.value.name, model: addHeadsetForm.value.model, sn: addHeadsetForm.value.sn, firmware: addHeadsetForm.value.firmware || '--', status: 'offline', merchant: '--', store: '--', boundHostId: null, batteryLevel: 0, ipd: 63, createdAt: new Date().toISOString().slice(0,10) }); showAddHeadsetModal.value = false; addHeadsetForm.value = { name:'', model:'', sn:'', firmware:'', notes:'' }; (window as any).$message?.success('头显已录入') })
}

// ─── OTA 升级 ──────────────────────────────────────
interface OtaPackage {
  id: number; name: string; targetType: string; version: string; size: string;
  status: 'unpublished' | 'published';
  notes: string; createdAt: string; publishedAt?: string;
}
const otaPackages = ref<OtaPackage[]>([
  { id: 1, name: '主机 Kiosk v2.1.0', targetType: '主机', version: 'v2.1.0', size: '128MB', status: 'published', notes: '修复电机抖动问题，优化性能', createdAt: '2026-04-20', publishedAt: '2026-04-20 10:30' },
  { id: 2, name: 'Pico 固件 v5.5.0', targetType: '头显', version: 'v5.5.0', size: '96MB', status: 'unpublished', notes: '新增摇杆校准功能，修复蓝牙断连', createdAt: '2026-05-01' },
])

const otaFilterType = ref<string | null>(null)
const otaFilterOpts = [{ label: '主机', value: '主机' }, { label: '头显', value: '头显' }]
const filteredOtaPackages = computed(() => {
  if (!otaFilterType.value) return otaPackages.value
  return otaPackages.value.filter(p => p.targetType === otaFilterType.value)
})

const otaStatusMap: Record<string, { type: any; label: string }> = { unpublished: { type: 'info', label: '未发布' }, published: { type: 'success', label: '已发布' } }

const otaColumns = [
  { title: '升级包名称', key: 'name', minWidth: 180 }, { title: '目标', key: 'targetType', width: 80 }, { title: '版本', key: 'version', width: 80 },
  { title: '大小', key: 'size', width: 80, align:'center' as const },
  { title: '状态', key: 'status', width: 100, align:'center' as const, render: (row: OtaPackage) => {
    const m = otaStatusMap[row.status] || otaStatusMap.unpublished
    return h(NTag, { size:'small', type: m.type }, { default: () => m.label })
  }},
  { title: '发布时间', key: 'publishedAt', width: 140, render: (row: OtaPackage) => row.publishedAt || '--' },
  { title: '创建时间', key: 'createdAt', width: 110 },
  { title: '操作', key: 'actions', width: 90, align:'center' as const, render: (row: OtaPackage) => {
    if (row.status === 'unpublished') return h(NButton, { size:'tiny', text:true, type:'primary', onClick: () => openOtaDetail(row) }, { default: () => '发布' })
    return h(NButton, { size:'tiny', text:true, type:'info', onClick: () => openOtaDetail(row) }, { default: () => '详情' })
  }},
]

const showOtaModal = ref(false); const otaFormRef = ref<FormInst | null>(null)
const otaForm = ref({ name: '', targetType: '', version: '', notes: '', file: null as any })
const otaRules: FormRules = { name: { required: true, message: '请输入升级包名称', trigger: 'blur' }, targetType: { required: true, message: '请选择目标设备', trigger: 'change' }, version: { required: true, message: '请输入版本号', trigger: 'blur' } }
function handleUploadOta() { otaFormRef.value?.validate(e => { if (e) return; otaPackages.value.unshift({ id: Date.now(), name: otaForm.value.name, targetType: otaForm.value.targetType, version: otaForm.value.version, size: '--', status: 'unpublished', notes: otaForm.value.notes, createdAt: new Date().toISOString().slice(0,10) }); showOtaModal.value = false; otaForm.value = { name:'', targetType:'', version:'', notes:'', file:null }; (window as any).$message?.success('升级包已上传') }) }

// OTA 详情相关
const showOtaDetailModal = ref(false)
const currentOtaPackage = ref<OtaPackage | null>(null)

function openOtaDetail(row: OtaPackage) {
  currentOtaPackage.value = row
  showOtaDetailModal.value = true
}

function publishOtaPackage() {
  if (!currentOtaPackage.value) return
  currentOtaPackage.value.status = 'published'
  currentOtaPackage.value.publishedAt = new Date().toLocaleString('zh-CN', { hour12: false })
  ;(window as any).$message?.success('升级包已发布，设备联网后将自动拉取升级')
}
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

/* OTA 升级详情 */
.ota-detail { min-height: 120px; }
.ota-detail .n-descriptions { margin-bottom: 16px; }
</style>
