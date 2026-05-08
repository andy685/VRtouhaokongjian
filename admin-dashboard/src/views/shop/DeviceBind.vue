<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>设备绑定管理</h1>
      <p class="header-desc">管理门店中主机与头显设备的绑定关系</p>
    </div>

    <!-- 统计概述 -->
    <div class="stats-row">
      <div class="stat-card"><div class="stat-num">{{ hosts.length }}</div><div class="stat-lbl">主机总数</div></div>
      <div class="stat-card"><div class="stat-num">{{ totalHeadsets }}</div><div class="stat-lbl">头显总数</div></div>
      <div class="stat-card"><div class="stat-num">{{ boundCount }}</div><div class="stat-lbl">已绑定</div></div>
      <div class="stat-card"><div class="stat-num">{{ unboundCount }}</div><div class="stat-lbl">待绑定</div></div>
    </div>

    <n-tabs type="line" animated>
      <!-- 按主机视角查看绑定 -->
      <n-tab-pane name="byHost" tab="🖥️ 按主机查看">
        <div class="host-bind-list">
          <div v-for="host in hosts" :key="host.id" class="bind-card">
            <div class="bind-card-header">
              <div class="bind-host-info">
                <span class="bind-host-icon">🖥️</span>
                <div>
                  <div class="bind-host-name">{{ host.name }} <n-tag size="tiny" :type="host.status === 'online' ? 'success' : 'default'">{{ host.status === 'online' ? '在线' : '离线' }}</n-tag></div>
                  <div class="bind-host-meta">编号: {{ host.serialNo }} · 门店: {{ host.store }}</div>
                </div>
              </div>
              <n-button size="tiny" secondary type="primary" @click="openBindDialog(host)">
                <template #icon><n-icon><LinkOutline /></n-icon></template>管理绑定
              </n-button>
            </div>
            <!-- 已绑定的头显列表 -->
            <div v-if="getBoundHeadsets(host.id).length" class="bound-list">
              <div v-for="hs in getBoundHeadsets(host.id)" :key="hs.id" class="bound-item">
                <span class="hs-icon">🥽</span>
                <span class="hs-name">{{ hs.name }}</span>
                <n-tag size="tiny" :type="hs.status === 'idle' ? 'info' : hs.status === 'in_use' ? 'success' : 'default'">
                  {{ hs.status === 'idle' ? '空闲' : hs.status === 'in_use' ? '使用中' : '离线' }}
                </n-tag>
                <span class="hs-sn">SN: {{ hs.sn }}</span>
                <span class="hs-battery">电量 {{ hs.batteryLevel }}%</span>
              </div>
            </div>
            <div v-else class="no-bound">
              <span>暂无绑定的头显设备</span>
            </div>
          </div>
        </div>
      </n-tab-pane>

      <!-- 按头显视角查看 -->
      <n-tab-pane name="byHeadset" tab="🥽 按头显查看">
        <div class="filter-bar">
          <n-select v-model:value="hsFilterStatus" :options="[{label:'全部状态',value:''},{label:'已绑定',value:'bound'},{label:'未绑定',value:'unbound'}]" style="width:130px;" clearable size="small" />
          <n-input v-model:value="hsFilterKeyword" placeholder="搜索头显名称/SN码" style="width:200px;" clearable size="small" />
        </div>
        <n-data-table :columns="hsBindColumns" :data="filteredHsBind" :bordered="false" size="small" striped :pagination="{pageSize:10}" />
      </n-tab-pane>
    </n-tabs>

    <!-- 绑定弹窗 -->
    <n-modal v-model:show="showBindModal" preset="card" :title="`绑定管理 - ${bindTarget?.name}`" style="width:600px;" :bordered="false">
      <div v-if="bindTarget" class="bind-modal-body">
        <n-alert type="info" :bordered="false" style="margin-bottom:16px;">
          当前主机可管理已绑定的头显设备，也可绑定新的空闲头显。
        </n-alert>
        <!-- 已绑定的头显 -->
        <div class="bind-section">
          <div class="bind-section-title">已绑定的头显 ({{ getBoundHeadsets(bindTarget.id).length }})</div>
          <div v-for="hs in getBoundHeadsets(bindTarget.id)" :key="hs.id" class="bind-row">
            <span>🥽 {{ hs.name }}</span>
            <n-tag size="tiny">{{ hs.sn }}</n-tag>
            <n-button size="tiny" text type="error" @click="unbindHeadset(hs)">解绑</n-button>
          </div>
          <div v-if="!getBoundHeadsets(bindTarget.id).length" class="bind-empty">暂无绑定</div>
        </div>
        <!-- 可绑定的头显 -->
        <div class="bind-section">
          <div class="bind-section-title">可绑定的头显 ({{ availableHeadsets.length }})</div>
          <div v-for="hs in availableHeadsets" :key="hs.id" class="bind-row">
            <span>🥽 {{ hs.name }}</span>
            <n-tag size="tiny">{{ hs.sn }}</n-tag>
            <n-button size="tiny" text type="primary" @click="bindHeadset(bindTarget.id, hs.id)">绑定</n-button>
          </div>
          <div v-if="!availableHeadsets.length" class="bind-empty">没有可绑定的空闲头显</div>
        </div>
      </div>
      <template #footer><n-space justify="center"><n-button @click="showBindModal=false">关闭</n-button></n-space></template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { NTabs, NTabPane, NDataTable, NButton, NIcon, NSpace, NModal, NTag, NInput, NSelect, NAlert, type DataTableColumns } from 'naive-ui'
import { LinkOutline } from '@vicons/ionicons5'

// ── 模拟数据 ──────────────────────────────────────
interface HostBind { id: number; serialNo: string; name: string; status: string; store: string }
interface HeadsetBind { id: number; name: string; sn: string; model: string; status: string; batteryLevel: number; boundHostId: number | null }

const hosts = ref<HostBind[]>([
  { id: 1, serialNo: 'PCT-001', name: '主机 #01', status: 'online', store: '恒然科技园店' },
  { id: 2, serialNo: 'PCT-002', name: '主机 #02', status: 'online', store: '恒然科技园店' },
  { id: 3, serialNo: 'PCT-003', name: '主机 #03', status: 'online', store: '恒然分部展厅' },
  { id: 4, serialNo: 'PCT-005', name: '主机 #05', status: 'online', store: '利民街小展厅' },
])

const headsets = ref<HeadsetBind[]>([
  { id: 101, name: 'Pico 4 Pro #01', sn: 'SN100001A', model: 'Pico 4 Pro', status: 'idle', batteryLevel: 85, boundHostId: 1 },
  { id: 102, name: 'Pico 4 Pro #02', sn: 'SN100002B', model: 'Pico 4 Pro', status: 'idle', batteryLevel: 65, boundHostId: 1 },
  { id: 103, name: 'Meta Quest 3 #01', sn: 'SN200001A', model: 'Meta Quest 3', status: 'idle', batteryLevel: 30, boundHostId: 2 },
  { id: 104, name: 'Pico 4 #01', sn: 'SN100003C', model: 'Pico 4', status: 'in_use', batteryLevel: 72, boundHostId: 3 },
  { id: 105, name: 'Pico Neo 3 #01', sn: 'SN300001A', model: 'Pico Neo 3', status: 'idle', batteryLevel: 0, boundHostId: null },
  { id: 106, name: 'Pico 4 #02', sn: 'SN100004D', model: 'Pico 4', status: 'idle', batteryLevel: 92, boundHostId: null },
  { id: 107, name: 'Pico 4 Ultra #01', sn: 'SN400001A', model: 'Pico 4 Ultra', status: 'idle', batteryLevel: 78, boundHostId: null },
])

const totalHeadsets = computed(() => headsets.value.length)
const boundCount = computed(() => headsets.value.filter(h => h.boundHostId !== null).length)
const unboundCount = computed(() => headsets.value.filter(h => h.boundHostId === null).length)

function getBoundHeadsets(hostId: number) { return headsets.value.filter(h => h.boundHostId === hostId) }

// 绑定弹窗
const showBindModal = ref(false)
const bindTarget = ref<HostBind | null>(null)
const availableHeadsets = computed(() => headsets.value.filter(h => h.boundHostId === null && h.status !== 'fault'))

function openBindDialog(host: HostBind) { bindTarget.value = host; showBindModal.value = true }
function bindHeadset(hostId: number, hsId: number) { const hs = headsets.value.find(h => h.id === hsId); if (hs) hs.boundHostId = hostId }
function unbindHeadset(hs: HeadsetBind) { hs.boundHostId = null }

// 头显查看表格
const hsFilterStatus = ref(''); const hsFilterKeyword = ref('')
const filteredHsBind = computed(() => {
  let list = headsets.value
  if (hsFilterStatus.value === 'bound') list = list.filter(h => h.boundHostId !== null)
  if (hsFilterStatus.value === 'unbound') list = list.filter(h => h.boundHostId === null)
  if (hsFilterKeyword.value) { const kw = hsFilterKeyword.value.toLowerCase(); list = list.filter(h => h.name.toLowerCase().includes(kw) || h.sn.toLowerCase().includes(kw)) }
  return list
})

const hsBindColumns: DataTableColumns<HeadsetBind> = [
  { title: '头显名称', key: 'name', minWidth: 140 }, { title: 'SN 码', key: 'sn', width: 110 }, { title: '型号', key: 'model', width: 110 },
  { title: '状态', key: 'status', width: 80, align:'center' as const, render: (row: HeadsetBind) => { const m: Record<string,any> = { idle:{type:'info',label:'空闲'}, in_use:{type:'success',label:'使用中'}, offline:{type:'default',label:'离线'} }; return h(NTag, { size:'small', type: m[row.status]?.type }, { default: () => m[row.status]?.label }) } },
  { title: '绑定主机', key: 'boundHostId', width: 100, align:'center' as const, render: (row: HeadsetBind) => row.boundHostId ? h(NTag, { size:'small', type:'success' }, { default: () => `主机 #${String(row.boundHostId).padStart(2,'0')}` }) : h(NTag, { size:'small', type:'default' }, { default: () => '未绑定' }) },
  { title: '操作', key: 'actions', width: 100, align:'center' as const, render: (row: HeadsetBind) => row.boundHostId ? h(NButton, { size:'tiny', text:true, type:'error', onClick: () => { row.boundHostId = null; (window as any).$message?.info(`已解绑 ${row.name}`) } }, { default: () => '解绑' }) : null },
]
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { margin-bottom: 20px; }
.page-header h1 { font-size: 20px; font-weight: 600; color: #333; margin: 0; }
.header-desc { font-size: 13px; color: var(--text-muted); margin-top: 4px; display: block; }
.stats-row { display: flex; gap: 16px; margin-bottom: 20px; }
.stat-card { flex: 1; background: white; border-radius: 10px; padding: 16px 20px; border: 1px solid var(--border-color); display: flex; flex-direction: column; align-items: center; }
.stat-num { font-family: 'Orbitron', sans-serif; font-size: 28px; font-weight: 700; color: var(--text-primary); }
.stat-lbl { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
.filter-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.host-bind-list { display: flex; flex-direction: column; gap: 16px; }
.bind-card { background: white; border-radius: 12px; border: 1px solid var(--border-color); overflow: hidden; }
.bind-card-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 18px; border-bottom: 1px solid #eee; }
.bind-host-info { display: flex; align-items: center; gap: 10px; }
.bind-host-icon { font-size: 22px; }
.bind-host-name { font-size: 14px; font-weight: 600; color: #333; display: flex; align-items: center; gap: 6px; }
.bind-host-meta { font-size: 11px; color: #94a3b8; margin-top: 2px; }
.bound-list { padding: 10px 18px; }
.bound-item { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 6px; margin-bottom: 4px; background: #f8fafc; }
.bound-item:hover { background: #f1f5f9; }
.hs-icon { font-size: 16px; }
.hs-name { font-size: 13px; font-weight: 500; color: #333; min-width: 120px; }
.hs-sn { font-size: 11px; color: #94a3b8; font-family: monospace; margin-left: auto; }
.hs-battery { font-size: 11px; color: #64748b; min-width: 50px; text-align: right; }
.no-bound { padding: 20px; text-align: center; font-size: 13px; color: #94a3b8; }
.bind-modal-body { padding: 4px 0; }
.bind-section { margin-bottom: 16px; }
.bind-section-title { font-size: 13px; font-weight: 600; color: #333; margin-bottom: 8px; }
.bind-row { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 6px; margin-bottom: 4px; background: #f8fafc; }
.bind-row:hover { background: #f1f5f9; }
.bind-empty { padding: 12px; text-align: center; font-size: 12px; color: #94a3b8; background: #fafafa; border-radius: 6px; }
</style>
