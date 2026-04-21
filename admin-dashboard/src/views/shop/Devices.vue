<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>设备管理</h1>
      <n-space>
        <n-button secondary @click="$router.push('/shop/workbench')">
          <template #icon><n-icon :component="ArrowBackOutline" /></template> 返回工作台
        </n-button>
        <n-button type="primary">+ 添加设备</n-button>
      </n-space>
    </div>
    
    <!-- 设备统计 -->
    <div class="stats-row">
      <div class="stat-card running">
        <div class="stat-icon">🟢</div>
        <div class="stat-info">
          <span class="num">{{ stats.running }}</span>
          <span class="label">运行中</span>
        </div>
      </div>
      <div class="stat-card idle">
        <div class="stat-icon">🔵</div>
        <div class="stat-info">
          <span class="num">{{ stats.idle }}</span>
          <span class="label">空闲</span>
        </div>
      </div>
      <div class="stat-card fault">
        <div class="stat-icon">🔴</div>
        <div class="stat-info">
          <span class="num">{{ stats.fault }}</span>
          <span class="label">故障</span>
        </div>
      </div>
      <div class="stat-card offline">
        <div class="stat-icon">⚪</div>
        <div class="stat-info">
          <span class="num">{{ stats.offline }}</span>
          <span class="label">离线</span>
        </div>
      </div>
      <div class="stat-card online-rate">
        <div class="stat-icon">📶</div>
        <div class="stat-info">
          <span class="num">{{ onlineRate }}%</span>
          <span class="label">在线率</span>
        </div>
      </div>
    </div>

    <!-- Tab切换 -->
    <n-tabs type="line" animated v-model:value="activeTab">
      <n-tab-pane name="grid" tab="📱 设备网格">
        <div class="tab-content">
          <div class="filter-bar">
            <n-select placeholder="区域筛选" :options="zoneOptions" size="small" style="width: 120px;" />
            <n-select placeholder="状态筛选" :options="statusOptions" size="small" style="width: 120px;" />
            <n-input placeholder="搜索设备ID..." size="small" style="width: 160px;">
              <template #prefix><n-icon :component="SearchOutline" /></template>
            </n-input>
          </div>

          <div class="device-grid">
            <div 
              v-for="device in devices" 
              :key="device.id"
              class="device-card"
              :class="[`status-${device.status}`]"
              @click="showDeviceModal(device)"
            >
              <div class="device-status-dot"></div>
              <div class="device-id">{{ device.id }}</div>
              
              <template v-if="device.status === 'running'">
                <div class="device-game">{{ device.currentGame }}</div>
                <div class="device-timer">{{ device.timeLeft }}</div>
                <div class="device-progress">
                  <div class="progress-bar" :style="{ width: device.progress + '%' }"></div>
                </div>
                <div class="device-member">{{ device.member }}</div>
              </template>
              
              <template v-else-if="device.status === 'idle'">
                <div class="device-state-text idle">空闲中</div>
              </template>
              
              <template v-else-if="device.status === 'fault'">
                <div class="device-state-text fault">{{ device.faultReason }}</div>
              </template>
              
              <template v-else>
                <div class="device-state-text offline">离线</div>
              </template>
            </div>
          </div>
        </div>
      </n-tab-pane>

      <n-tab-pane name="list" tab="📋 设备列表">
        <div class="tab-content">
          <n-data-table :columns="columns" :data="deviceListData" :pagination="{ pageSize: 12 }" striped />
        </div>
      </n-tab-pane>

      <n-tab-pane name="control" tab="🎮 远程控制">
        <div class="tab-content">
          <div class="control-info">
            <n-alert type="info" :show-icon="true">
              选择左侧设备卡片进入远程控制模式，可执行远程重启、语音喊话、强制结束等操作
            </n-alert>
          </div>

          <div class="control-grid" v-if="selectedDevice">
            <div class="control-card">
              <div class="control-device-header">
                <span class="device-id">{{ selectedDevice.id }}</span>
                <n-tag :type="statusMap[selectedDevice.status].type" size="small">{{ statusMap[selectedDevice.status].label }}</n-tag>
              </div>
              
              <div class="control-info-grid">
                <div class="info-item">
                  <span class="label">当前游戏</span>
                  <span class="value">{{ selectedDevice.currentGame || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">剩余时间</span>
                  <span class="value">{{ selectedDevice.timeLeft || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">当前会员</span>
                  <span class="value">{{ selectedDevice.member || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">设备温度</span>
                  <span class="value">{{ selectedDevice.temp || '38.5' }}°C</span>
                </div>
              </div>

              <div class="control-actions">
                <h4>远程控制</h4>
                <n-grid :cols="3" :x-gap="12" :y-gap="12">
                  <n-gi>
                    <n-button block type="warning" secondary @click="remoteRestart">
                      <template #icon><n-icon :component="RefreshOutline" /></template>
                      远程重启
                    </n-button>
                  </n-gi>
                  <n-gi>
                    <n-button block type="error" secondary @click="forceStop">
                      <template #icon><n-icon :component="StopOutline" /></template>
                      强制结束
                    </n-button>
                  </n-gi>
                  <n-gi>
                    <n-button block type="info" secondary @click="voiceBroadcast">
                      <template #icon><n-icon :component="MegaphoneOutline" /></template>
                      语音喊话
                    </n-button>
                  </n-gi>
                </n-grid>
              </div>

              <div class="voice-modal" v-if="showVoiceModal">
                <n-input v-model:value="voiceText" type="textarea" placeholder="输入要广播的内容..." />
                <n-space justify="end" style="margin-top: 12px;">
                  <n-button @click="showVoiceModal = false">取消</n-button>
                  <n-button type="primary" @click="sendVoice">发送广播</n-button>
                </n-space>
              </div>
            </div>
          </div>

          <div class="control-empty" v-else>
            <n-icon :component="GameControllerOutline" size="64" color="#e2e8f0" />
            <p>请从上方「设备网格」选择一个设备</p>
          </div>
        </div>
      </n-tab-pane>
    </n-tabs>

    <!-- 设备详情弹窗 -->
    <n-modal v-model:show="showModal" preset="card" :title="`设备 ${selectedDevice?.id || ''} 详情`" style="width: 540px;" :bordered="false">
      <template v-if="selectedDevice">
        <n-descriptions label-placement="left" :column="2" bordered>
          <n-descriptions-item label="设备ID">{{ selectedDevice.id }}</n-descriptions-item>
          <n-descriptions-item label="当前状态">
            <n-tag :type="statusMap[selectedDevice.status].type" size="small">{{ statusMap[selectedDevice.status].label }}</n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="区域">{{ selectedDevice.zone }}</n-descriptions-item>
          <n-descriptions-item label="今日使用次数">{{ selectedDevice.todayUsage }}</n-descriptions-item>
          <n-descriptions-item v-if="selectedDevice.currentGame" label="运行游戏">{{ selectedDevice.currentGame }}</n-descriptions-item>
          <n-descriptions-item v-if="selectedDevice.member" label="当前会员">{{ selectedDevice.member }}</n-descriptions-item>
          <n-descriptions-item v-if="selectedDevice.timeLeft" label="剩余时间">{{ selectedDevice.timeLeft }}</n-descriptions-item>
          <n-descriptions-item v-if="selectedDevice.faultReason" label="故障原因">{{ selectedDevice.faultReason }}</n-descriptions-item>
        </n-descriptions>
        
        <n-space justify="center" style="margin-top: 20px;">
          <n-button type="warning" secondary @click="remoteRestart">远程重启</n-button>
          <n-button type="error" secondary @click="forceStop">结束体验</n-button>
          <n-button type="info" secondary @click="voiceBroadcast">语音喊话</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NButton, NIcon, NSpace, NTabs, NTabPane, NDataTable, NTag,
  NModal, NDescriptions, NDescriptionsItem, NGrid, NGi, NInput,
  NAlert, NSelect
} from 'naive-ui'
import {
  ArrowBackOutline, SearchOutline, RefreshOutline, StopOutline,
  MegaphoneOutline, GameControllerOutline
} from '@vicons/ionicons5'

const activeTab = ref('grid')
const showModal = ref(false)
const showVoiceModal = ref(false)
const selectedDevice = ref<any>(null)
const voiceText = ref('')

const zoneOptions = [
  { label: '全部区域', value: 'all' },
  { label: 'A区', value: 'A' },
  { label: 'B区', value: 'B' },
  { label: 'C区', value: 'C' },
]

const statusOptions = [
  { label: '全部状态', value: 'all' },
  { label: '运行中', value: 'running' },
  { label: '空闲', value: 'idle' },
  { label: '故障', value: 'fault' },
  { label: '离线', value: 'offline' },
]

const statusMap: Record<string, { type: string, label: string }> = {
  running: { type: 'success', label: '运行中' },
  idle: { type: 'info', label: '空闲' },
  fault: { type: 'error', label: '故障' },
  offline: { type: 'default', label: '离线' }
}

const devices = ref([
  { id: 'A01', zone: 'A区', status: 'running', currentGame: '过山车VR', timeLeft: '05:23', progress: 45, member: '张三 (金卡)', faultReason: '', todayUsage: 28, temp: '36.8' },
  { id: 'A02', zone: 'A区', status: 'running', currentGame: '恐怖医院', timeLeft: '12:45', progress: 72, member: '李四 (银卡)', faultReason: '', todayUsage: 22, temp: '38.2' },
  { id: 'A03', zone: 'A区', status: 'running', currentGame: '极速赛车', timeLeft: '03:12', progress: 28, member: '散客', faultReason: '', todayUsage: 18, temp: '35.9' },
  { id: 'A04', zone: 'A区', status: 'idle', currentGame: '', timeLeft: '', progress: 0, member: '', faultReason: '', todayUsage: 25, temp: '34.5' },
  { id: 'A05', zone: 'A区', status: 'fault', currentGame: '', timeLeft: '', progress: 0, member: '', faultReason: '控制器异常', todayUsage: 12, temp: '42.1' },
  { id: 'A06', zone: 'B区', status: 'running', currentGame: '海洋世界', timeLeft: '08:56', progress: 58, member: '王五 (普通)', faultReason: '', todayUsage: 30, temp: '37.2' },
  { id: 'A07', zone: 'B区', status: 'running', currentGame: '恐龙王国', timeLeft: '06:34', progress: 48, member: '赵六 (钻石)', faultReason: '', todayUsage: 26, temp: '36.5' },
  { id: 'A08', zone: 'B区', status: 'idle', currentGame: '', timeLeft: '', progress: 0, member: '', faultReason: '', todayUsage: 20, temp: '33.8' },
  { id: 'A09', zone: 'B区', status: 'running', currentGame: '太空漫步', timeLeft: '04:21', progress: 35, member: '孙七 (金卡)', faultReason: '', todayUsage: 24, temp: '37.8' },
  { id: 'A10', zone: 'B区', status: 'running', currentGame: 'CS对战', timeLeft: '02:58', progress: 22, member: '散客', faultReason: '', todayUsage: 32, temp: '39.1' },
  { id: 'A11', zone: 'C区', status: 'running', currentGame: '音乐节VR', timeLeft: '11:33', progress: 68, member: '钱八 (银卡)', faultReason: '', todayUsage: 15, temp: '36.2' },
  { id: 'A12', zone: 'C区', status: 'idle', currentGame: '', timeLeft: '', progress: 0, member: '', faultReason: '', todayUsage: 18, temp: '34.0' },
])

const stats = computed(() => ({
  running: devices.value.filter(d => d.status === 'running').length,
  idle: devices.value.filter(d => d.status === 'idle').length,
  fault: devices.value.filter(d => d.status === 'fault').length,
  offline: devices.value.filter(d => d.status === 'offline').length,
}))

const onlineRate = computed(() => Math.round((stats.value.running + stats.value.idle) / devices.value.length * 100))

const columns = [
  { title: '设备ID', key: 'id', width: 100 },
  { title: '区域', key: 'zone', width: 80 },
  { title: '状态', key: 'status', width: 100, render(row: any) {
    return h(NTag, { type: statusMap[row.status].type, size: 'small', bordered: true }, () => statusMap[row.status].label)
  }},
  { title: '当前游戏', key: 'currentGame', render(row: any) { return row.currentGame || '-'; } },
  { title: '当前会员', key: 'member', render(row: any) { return row.member || '-'; } },
  { title: '今日使用', key: 'todayUsage', width: 100 },
  { title: '操作', key: 'actions', width: 140, render: () => h(NSpace, null, { default: () => [h(NButton, { size: 'tiny', secondary: true }, () => '详情'), h(NButton, { size: 'tiny', quaternary: true }, () => '控制')] }) },
]

const deviceListData = devices.value

function showDeviceModal(device: any) {
  selectedDevice.value = device
  showModal.value = true
}

function remoteRestart() { console.log('远程重启', selectedDevice.value?.id) }
function forceStop() { console.log('强制结束', selectedDevice.value?.id) }
function voiceBroadcast() { showVoiceModal.value = true }
function sendVoice() {
  console.log('发送语音广播:', voiceText.value)
  showVoiceModal.value = false
  voiceText.value = ''
}
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); }

.stats-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: white; border-radius: 14px; padding: 18px; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 14px; }
.stat-icon { font-size: 28px; }
.stat-info .num { font-family: 'Orbitron', sans-serif; font-size: 26px; font-weight: 700; display: block; }
.stat-info .label { font-size: 12px; color: var(--text-muted); }
.stat-card.running .num { color: #10B981; }
.stat-card.idle .num { color: #3B82F6; }
.stat-card.fault .num { color: #EF4444; }
.stat-card.offline .num { color: #94A3B8; }
.stat-card.online-rate .num { color: #8B5CF6; }

.tab-content { padding-top: 16px; }

.filter-bar { display: flex; gap: 12px; margin-bottom: 16px; }

.device-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; }
.device-card { background: white; border-radius: 14px; padding: 16px; border: 2px solid transparent; cursor: pointer; transition: all 0.25s; text-align: center; position: relative; }
.device-card:hover { transform: translateY(-4px); box-shadow: 0 8px 30px rgba(0,0,0,0.1); }
.device-card.status-running { border-color: rgba(16,185,129,0.3); background: linear-gradient(180deg, rgba(16,185,129,0.04), white); }
.device-card.status-idle { border-color: rgba(59,130,246,0.2); }
.device-card.status-fault { border-color: rgba(239,68,68,0.3); background: linear-gradient(180deg, rgba(239,68,68,0.04), white); }
.device-card.status-offline { opacity: 0.5; }

.device-status-dot { width: 10px; height: 10px; border-radius: 50%; position: absolute; top: 12px; right: 12px; }
.status-running .device-status-dot { background: #10B981; box-shadow: 0 0 8px rgba(16,185,129,0.5); }
.status-idle .device-status-dot { background: #3B82F6; }
.status-fault .device-status-dot { background: #EF4444; animation: pulse 1.5s infinite; }
.status-offline .device-status-dot { background: #94A3B8; }

.device-id { font-family: 'Orbitron', sans-serif; font-size: 18px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; }
.device-game { font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; }
.device-timer { font-family: 'Orbitron', sans-serif; font-size: 20px; font-weight: 700; color: #10B981; }
.device-progress { height: 4px; background: #e2e8f0; border-radius: 2px; overflow: hidden; margin: 8px 0; }
.progress-bar { height: 100%; background: linear-gradient(90deg, #10B981, #34D399); }
.device-member { font-size: 11px; color: var(--text-muted); }
.device-state-text { font-size: 14px; font-weight: 500; margin-top: 16px; }
.device-state-text.idle { color: #3B82F6; }
.device-state-text.fault { color: #EF4444; }
.device-state-text.offline { color: #94A3B8; }

.control-info { margin-bottom: 20px; }
.control-grid { max-width: 500px; }
.control-card { background: white; border-radius: 16px; padding: 24px; border: 1px solid var(--border-color); }
.control-device-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9; }
.control-device-header .device-id { font-family: 'Orbitron', sans-serif; font-size: 20px; font-weight: 700; color: var(--text-primary); margin: 0; }
.control-info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px; }
.info-item .label { font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px; }
.info-item .value { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.control-actions h4 { font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 12px; }
.voice-modal { background: #f8fafc; padding: 16px; border-radius: 10px; margin-top: 16px; }
.control-empty { text-align: center; padding: 80px 0; }
.control-empty p { color: var(--text-muted); margin-top: 16px; }
</style>
