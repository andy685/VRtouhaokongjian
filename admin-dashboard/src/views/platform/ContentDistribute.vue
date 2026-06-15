<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>内容分发</h1>
        <p class="header-desc">管理游戏内容向各店铺的分发配置</p>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="CloudUploadOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">分发总次数</span>
          <span class="value">1,256</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="CheckmarkCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">分发成功</span>
          <span class="value">1,198</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="TimeOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">分发中</span>
          <span class="value warning">42</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #EF4444, #DC2626);">
          <n-icon :component="CloseCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">分发失败</span>
          <span class="value error">16</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
          <n-icon :component="CloseCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">已撤回</span>
          <span class="value" style="color: #8B5CF6;">8</span>
        </div>
      </div>
    </div>

    <!-- Tabs 切换 -->
    <n-tabs v-model:value="activeTab" type="line" style="margin-top: 24px;">
      <n-tab-pane name="games" tab="游戏列表">
        <div class="content-card">
          <div class="section-header">
            <h3>全部游戏</h3>
            <n-space>
              <n-select v-model:value="filterGame" placeholder="筛选游戏" :options="gameOptions" size="small" style="width: 160px;" clearable />
              <n-button size="small" secondary @click="refreshData">刷新</n-button>
            </n-space>
          </div>
          <n-data-table :columns="gameColumns" :data="gameList" :pagination="pagination" striped />
        </div>
      </n-tab-pane>

      <n-tab-pane name="records" tab="分发记录">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <n-space>
            <n-select v-model:value="filterStatus" placeholder="分发状态" :options="statusOptions" size="small" style="width: 120px;" clearable />
          </n-space>
          <n-button type="primary" @click="showBatchModal = true">批量分发</n-button>
        </div>
        <div class="content-card">
          <n-data-table :columns="columns" :data="filteredData" :pagination="pagination" striped />
        </div>
      </n-tab-pane>
    </n-tabs>

    <!-- 批量分发弹窗 -->
    <n-modal v-model:show="showBatchModal" preset="card" :title="batchForm.games.length === 1 ? '游戏分发' : '批量分发'" style="width: 560px;" :bordered="false">
      <n-form label-placement="left" label-width="100">
        <n-form-item label="选择游戏" required>
          <n-select v-model:value="batchForm.games" :options="gameOptions" multiple placeholder="请选择要分发的游戏" />
        </n-form-item>
        <n-form-item label="目标店铺" required>
          <n-select v-model:value="batchForm.stores" :options="storeOptions" multiple placeholder="请选择目标店铺" />
        </n-form-item>
        <n-form-item label="分发版本">
          <n-input v-model:value="batchForm.version" placeholder="如：v2.3.1" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showBatchModal = false">取消</n-button>
          <n-button type="primary" @click="confirmBatch">确认分发</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 详情弹窗 -->
    <n-modal v-model:show="showDetailModal" preset="card" title="分发详情" style="width: 720px;" :bordered="false">
      <n-descriptions v-if="currentRecord" label-placement="left" :column="2" bordered>
        <n-descriptions-item label="游戏名称">{{ currentRecord.gameName }}</n-descriptions-item>
        <n-descriptions-item label="分发版本">{{ currentRecord.version }}</n-descriptions-item>
        <n-descriptions-item label="分发店铺">{{ currentRecord.storeCount }} 家</n-descriptions-item>
        <n-descriptions-item label="分发状态">
          <n-tag :type="statusType(currentRecord.status)" size="small">
            {{ currentRecord.statusText }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="分发时间">{{ currentRecord.time }}</n-descriptions-item>
        <n-descriptions-item label="操作人">{{ currentRecord.operator }}</n-descriptions-item>
      </n-descriptions>
      <div style="margin-top: 16px;" v-if="currentRecord && currentRecord.storeList">
        <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: var(--text-primary);">分发店铺列表</h4>
        <n-data-table :columns="storeColumns" :data="currentRecord.storeList" size="small" :bordered="true" />
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showDetailModal = false">关闭</n-button>
          <n-button
            v-if="currentRecord && (currentRecord.status === 'failed' || currentRecord.status === 'revoked')"
            type="warning"
            @click="retryFromDetail"
          >
            重新分发
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NButton, NDataTable, NTag, NSpace, NSelect, NModal, NForm, NFormItem,
  NInput, NIcon, NDescriptions, NDescriptionsItem, NTabs, NTabPane,
  useMessage, useDialog
} from 'naive-ui'
import {
  CloudUploadOutline, CheckmarkCircleOutline, TimeOutline, CloseCircleOutline,
  ReloadCircleOutline, SendOutline, EyeOutline
} from '@vicons/ionicons5'

const message = useMessage()
const dialog = useDialog()

// 当前标签页
const activeTab = ref('games')

// 状态类型映射函数
function statusType(status: string) {
  const map: Record<string, string> = { done: 'success', pending: 'warning', failed: 'error', revoking: 'warning', revoked: 'default' }
  return map[status] || 'default'
}
const filterGame = ref<string | null>(null)
const filterStatus = ref<string | null>(null)

// 游戏分发状态类型
type DistributeStatus = '未分发' | '已分发' | '有更新' | '已撤回'

// 游戏列表数据（游戏中心视角）
const gameList = ref([
  {
    id: 1,
    gameName: '过山车VR',
    cover: 'https://picsum.photos/seed/coaster/90/120',
    currentVersion: 'v2.3.2',
    distributedVersion: 'v2.3.1',
    distributeStatus: '有更新' as DistributeStatus,
    storeCount: 156,
    lastDistributeTime: '2026-04-20 10:00',
    lastRecordId: 1,
  },
  {
    id: 2,
    gameName: '恐怖医院',
    cover: 'https://picsum.photos/seed/hospital/90/120',
    currentVersion: 'v1.8.5',
    distributedVersion: 'v1.8.5',
    distributeStatus: '已分发' as DistributeStatus,
    storeCount: 148,
    lastDistributeTime: '2026-04-19 15:30',
    lastRecordId: 2,
  },
  {
    id: 3,
    gameName: '极速赛车',
    cover: 'https://picsum.photos/seed/racing/90/120',
    currentVersion: 'v3.1.0',
    distributedVersion: 'v3.1.0',
    distributeStatus: '分发中' as any,
    storeCount: 142,
    lastDistributeTime: '2026-04-20 14:00',
    lastRecordId: 3,
  },
  {
    id: 4,
    gameName: '海洋世界',
    cover: 'https://picsum.photos/seed/ocean/90/120',
    currentVersion: 'v2.0.2',
    distributedVersion: '',
    distributeStatus: '失败' as any,
    storeCount: 138,
    lastDistributeTime: '2026-04-18 09:00',
    lastRecordId: 4,
  },
  {
    id: 5,
    gameName: '恐龙王国',
    cover: 'https://picsum.photos/seed/dino/90/120',
    currentVersion: 'v1.5.0',
    distributedVersion: 'v1.5.0',
    distributeStatus: '已撤回' as DistributeStatus,
    storeCount: 130,
    lastDistributeTime: '2026-04-17 11:20',
    lastRecordId: 5,
  },
  {
    id: 6,
    gameName: '太空探险',
    cover: 'https://picsum.photos/seed/space/90/120',
    currentVersion: 'v2.1.0',
    distributedVersion: '',
    distributeStatus: '未分发' as DistributeStatus,
    storeCount: 0,
    lastDistributeTime: '-',
    lastRecordId: null,
  },
])

// 游戏列表列定义
const gameColumns = [
  {
    title: '游戏',
    key: 'gameName',
    width: 200,
    fixed: 'left',
    render(row: any) {
      return h('div', { style: 'display:flex;align-items:center;gap:10px;' }, [
        h('img', {
          src: row.cover,
          style: 'width:36px;height:48px;border-radius:6px;object-fit:cover;',
        }),
        h('span', { style: 'font-weight:500;' }, row.gameName),
      ])
    },
  },
  {
    title: '当前版本',
    key: 'currentVersion',
    width: 100,
  },
  {
    title: '已分发版本',
    key: 'distributedVersion',
    width: 100,
    render: (row: any) => row.distributedVersion || '-',
  },
  {
    title: '分发状态',
    key: 'distributeStatus',
    width: 100,
    render(row: any) {
      const typeMap: Record<string, string> = {
        '未分发': 'default',
        '已分发': 'success',
        '有更新': 'warning',
        '分发中': 'warning',
        '失败': 'error',
        '已撤回': 'default',
      }
      const type = typeMap[row.distributeStatus] || 'default'
      return h(NTag, { type, size: 'small', bordered: false }, () => row.distributeStatus)
    },
  },
  {
    title: '已分发店铺',
    key: 'storeCount',
    width: 100,
    render: (row: any) => row.storeCount ? `${row.storeCount} 家` : '-',
  },
  {
    title: '最近分发时间',
    key: 'lastDistributeTime',
    width: 160,
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    fixed: 'right',
    render(row: any) {
      const buttons = []
      // 未分发 -> 分发
      if (row.distributeStatus === '未分发') {
        buttons.push(
          h(NButton, { size: 'tiny', type: 'primary', onClick: () => openGameDistribute(row) }, () => '分发')
        )
      }
      // 有更新 -> 重新分发
      if (row.distributeStatus === '有更新') {
        buttons.push(
          h(NButton, { size: 'tiny', type: 'warning', onClick: () => openGameDistribute(row) }, () => '重新分发')
        )
      }
      // 已分发 -> 撤销 / 详情
      if (row.distributeStatus === '已分发') {
        buttons.push(
          h(NButton, { size: 'tiny', type: 'error', secondary: true, onClick: () => revokeByGame(row) }, () => '撤销')
        )
      }
      // 失败 / 已撤回 -> 重新分发
      if (row.distributeStatus === '失败' || row.distributeStatus === '已撤回') {
        buttons.push(
          h(NButton, { size: 'tiny', type: 'warning', onClick: () => openGameDistribute(row) }, () => '重新分发')
        )
      }
      // 详情（始终显示）
      buttons.push(
        h(NButton, { size: 'tiny', secondary: true, onClick: () => openGameDetail(row) }, () => '详情')
      )
      return h(NSpace, { size: 'small' }, () => buttons)
    },
  },
]

const gameOptions = [
  { label: '过山车VR', value: '过山车VR' },
  { label: '恐怖医院', value: '恐怖医院' },
  { label: '极速赛车', value: '极速赛车' },
  { label: '海洋世界', value: '海洋世界' },
]

const statusOptions = [
  { label: '已完成', value: 'done' },
  { label: '分发中', value: 'pending' },
  { label: '失败', value: 'failed' },
  { label: '撤回中', value: 'revoking' },
  { label: '已撤回', value: 'revoked' },
]

const storeOptions = [
  { label: '深圳福田旗舰店', value: '1' },
  { label: '南山科技园店', value: '2' },
  { label: '广州天河店', value: '3' },
  { label: '北京朝阳店', value: '4' },
  { label: '上海浦东店', value: '5' },
]

const columns = [
  { title: '游戏名称', key: 'gameName', width: 160 },
  { title: '分发店铺', key: 'storeCount', width: 120, render: (row: any) => `${row.storeCount} 家` },
  { title: '版本号', key: 'version', width: 120 },
  {
    title: '分发状态',
    key: 'status',
    width: 120,
    render(row: any) {
      const typeMap: Record<string, string> = { done: 'success', pending: 'warning', failed: 'error', revoking: 'warning', revoked: 'default' }
      return h(NTag, { type: typeMap[row.status] as any, size: 'small', bordered: true }, () => row.statusText)
    }
  },
  { title: '分发时间', key: 'time', width: 160 },
  { title: '操作人', key: 'operator', width: 100 },
  {
    title: '操作',
    key: 'action',
    width: 200,
    fixed: 'right',
    render(row: any) {
      const buttons = []
      if (row.status === 'done') {
        buttons.push(
          h(NButton, { size: 'tiny', type: 'error', secondary: true, onClick: () => revokeDistribute(row) }, () => '撤销')
        )
      }
      if (row.status === 'failed') {
        buttons.push(
          h(NButton, { size: 'tiny', type: 'warning', secondary: true, onClick: () => retryDistribute(row) }, () => '重试')
        )
      }
      buttons.push(
        h(NButton, { size: 'tiny', secondary: true, onClick: () => openDetail(row) }, () => '详情')
      )
      return h(NSpace, { size: 'small' }, () => buttons)
    }
  },
]

const storeColumns = [
  { title: '店铺名称', key: 'storeName', width: 200 },
  { title: '区域', key: 'region', width: 100 },
  {
    title: '分发状态',
    key: 'status',
    width: 100,
    render(row: any) {
      const typeMap: Record<string, string> = { done: 'success', pending: 'warning', failed: 'error', revoking: 'warning', revoked: 'default' }
      const labelMap: Record<string, string> = { done: '已完成', pending: '分发中', failed: '失败', revoking: '撤回中', revoked: '已撤回' }
      return h(NTag, { type: typeMap[row.status] as any, size: 'small' }, () => labelMap[row.status] || row.statusText)
    }
  },
  { title: '完成时间', key: 'finishTime', width: 160 },
  {
    title: '操作',
    key: 'action',
    width: 100,
    render(row: any) {
      if (row.status === 'done') {
        return h(NButton, { size: 'tiny', type: 'error', secondary: true, onClick: () => revokeStore(row) }, () => '撤销')
      }
      return '-'
    }
  },
]

const distributeData = ref([
  {
    id: 1,
    gameName: '过山车VR',
    storeCount: 156,
    version: 'v2.3.1',
    status: 'done',
    statusText: '已完成',
    time: '2026-04-20 10:00',
    operator: '管理员',
    storeList: [
      { storeName: '深圳福田旗舰店', region: '深圳', status: 'done', statusText: '已完成', finishTime: '2026-04-20 10:05' },
      { storeName: '南山科技园店', region: '深圳', status: 'done', statusText: '已完成', finishTime: '2026-04-20 10:06' },
      { storeName: '广州天河店', region: '广州', status: 'done', statusText: '已完成', finishTime: '2026-04-20 10:08' },
      { storeName: '北京朝阳店', region: '北京', status: 'done', statusText: '已完成', finishTime: '2026-04-20 10:10' },
      { storeName: '上海浦东店', region: '上海', status: 'done', statusText: '已完成', finishTime: '2026-04-20 10:12' },
    ]
  },
  {
    id: 2,
    gameName: '恐怖医院',
    storeCount: 148,
    version: 'v1.8.5',
    status: 'done',
    statusText: '已完成',
    time: '2026-04-19 15:30',
    operator: '管理员',
    storeList: [
      { storeName: '深圳福田旗舰店', region: '深圳', status: 'done', statusText: '已完成', finishTime: '2026-04-19 15:35' },
      { storeName: '南山科技园店', region: '深圳', status: 'done', statusText: '已完成', finishTime: '2026-04-19 15:36' },
      { storeName: '广州天河店', region: '广州', status: 'done', statusText: '已完成', finishTime: '2026-04-19 15:38' },
    ]
  },
  {
    id: 3,
    gameName: '极速赛车',
    storeCount: 142,
    version: 'v3.1.0',
    status: 'pending',
    statusText: '分发中',
    time: '2026-04-20 14:00',
    operator: '管理员',
    storeList: [
      { storeName: '深圳福田旗舰店', region: '深圳', status: 'done', statusText: '已完成', finishTime: '2026-04-20 14:05' },
      { storeName: '南山科技园店', region: '深圳', status: 'pending', statusText: '分发中', finishTime: '-' },
      { storeName: '广州天河店', region: '广州', status: 'pending', statusText: '分发中', finishTime: '-' },
      { storeName: '北京朝阳店', region: '北京', status: 'done', statusText: '已完成', finishTime: '2026-04-20 14:08' },
    ]
  },
  {
    id: 4,
    gameName: '海洋世界',
    storeCount: 138,
    version: 'v2.0.2',
    status: 'failed',
    statusText: '失败',
    time: '2026-04-18 09:00',
    operator: '管理员',
    storeList: [
      { storeName: '深圳福田旗舰店', region: '深圳', status: 'failed', statusText: '失败', finishTime: '2026-04-18 09:05' },
      { storeName: '南山科技园店', region: '深圳', status: 'done', statusText: '已完成', finishTime: '2026-04-18 09:06' },
    ]
  },
  {
    id: 5,
    gameName: '恐龙王国',
    storeCount: 130,
    version: 'v1.5.0',
    status: 'revoked',
    statusText: '已撤回',
    time: '2026-04-17 11:20',
    operator: '管理员',
    storeList: [
      { storeName: '深圳福田旗舰店', region: '深圳', status: 'revoked', statusText: '已撤回', finishTime: '2026-04-17 11:25' },
      { storeName: '广州天河店', region: '广州', status: 'revoked', statusText: '已撤回', finishTime: '2026-04-17 11:28' },
    ]
  },
  {
    id: 6,
    gameName: '太空探险',
    storeCount: 120,
    version: 'v2.1.0',
    status: 'revoking',
    statusText: '撤回中',
    time: '2026-04-21 09:00',
    operator: '管理员',
    storeList: [
      { storeName: '深圳福田旗舰店', region: '深圳', status: 'revoked', statusText: '已撤回', finishTime: '-' },
      { storeName: '南山科技园店', region: '深圳', status: 'revoking', statusText: '撤回中', finishTime: '-' },
      { storeName: '广州天河店', region: '广州', status: 'revoking', statusText: '撤回中', finishTime: '-' },
    ]
  },
])

const pagination = { pageSize: 10 }

const filteredData = computed(() => {
  let data = [...distributeData.value]
  if (filterGame.value) {
    data = data.filter(d => d.gameName === filterGame.value)
  }
  if (filterStatus.value) {
    data = data.filter(d => d.status === filterStatus.value)
  }
  return data
})

function refreshData() {
  message.success('数据已刷新')
}

// 批量分发
const showBatchModal = ref(false)
const batchForm = ref({ games: [] as string[], stores: [] as string[], version: '' })

function confirmBatch() {
  if (batchForm.value.games.length === 0 || batchForm.value.stores.length === 0) {
    message.warning('请选择游戏和目标店铺')
    return
  }
  message.success(`已成功分发 ${batchForm.value.games.length} 个游戏到 ${batchForm.value.stores.length} 家店铺`)
  showBatchModal.value = false
  batchForm.value = { games: [], stores: [], version: '' }
}

// 详情
const showDetailModal = ref(false)
const currentRecord = ref<any>(null)

function openDetail(row: any) {
  currentRecord.value = row
  showDetailModal.value = true
}

// 单个游戏分发
function openDistribute(row: any) {
  batchForm.value = {
    games: [row.gameName],
    stores: [],
    version: row.version || '',
  }
  showBatchModal.value = true
}

// 重试分发（从列表）
function retryDistribute(row: any) {
  // 将失败的店铺名称映射到 storeOptions 的 value
  const failedStoreNames = row.storeList?.filter((s: any) => s.status === 'failed').map((s: any) => s.storeName) || []
  const storeValueMap = new Map(storeOptions.map((opt: any) => [opt.label, opt.value]))
  const failedStoreValues = failedStoreNames.map((name: string) => storeValueMap.get(name)).filter(Boolean)
  
  batchForm.value = {
    games: [row.gameName],
    stores: failedStoreValues,
    version: row.version || '',
  }
  showBatchModal.value = true
  message.info(`正在重新分发：${row.gameName}，已预选失败的店铺`)
}

// 从详情弹窗重试
function retryFromDetail() {
  if (!currentRecord.value) return
  showDetailModal.value = false
  retryDistribute(currentRecord.value)
}

// 撤销整条分发记录（列表页）
function revokeDistribute(row: any) {
  dialog.warning({
    title: '确认撤销',
    content: `确认撤销「${row.gameName}」的分发？撤销后各店铺将无法访问该版本。`,
    positiveText: '确认撤销',
    negativeText: '取消',
    onPositiveClick: () => {
      row.status = 'revoking'
      row.statusText = '撤回中'
      message.info(`正在撤销「${row.gameName}」的分发...`)
      // 模拟异步撤回
      setTimeout(() => {
        row.status = 'revoked'
        row.statusText = '已撤回'
        message.success(`「${row.gameName}」已成功撤销分发`)
      }, 1500)
    }
  })
}

// 撤销单个店铺的分发（详情弹窗）
function revokeStore(store: any) {
  dialog.warning({
    title: '确认撤销',
    content: `确认撤销「${store.storeName}」的分发？`,
    positiveText: '确认撤销',
    negativeText: '取消',
    onPositiveClick: () => {
      store.status = 'revoking'
      store.statusText = '撤回中'
      message.info(`正在撤销「${store.storeName}」的分发...`)
      // 模拟异步撤回
      setTimeout(() => {
        store.status = 'revoked'
        store.statusText = '已撤回'
        // 同步更新主记录状态
        if (currentRecord.value) {
          const allRevoked = currentRecord.value.storeList.every((s: any) => s.status === 'revoked')
          const anyRevoking = currentRecord.value.storeList.some((s: any) => s.status === 'revoking')
          if (allRevoked) {
            currentRecord.value.status = 'revoked'
            currentRecord.value.statusText = '已撤回'
          } else if (anyRevoking) {
            currentRecord.value.status = 'revoking'
            currentRecord.value.statusText = '撤回中'
          }
        }
        message.success(`「${store.storeName}」已成功撤销分发`)
      }, 1500)
    }
  })
}

// ========== 游戏列表操作 ==========

// 打开游戏分发弹窗（从游戏列表）
function openGameDistribute(row: any) {
  batchForm.value = {
    games: [row.gameName],
    stores: [],
    version: row.currentVersion || '',
  }
  showBatchModal.value = true
}

// 查看游戏分发详情（从游戏列表）
function openGameDetail(row: any) {
  if (row.lastRecordId) {
    const record = distributeData.value.find((d: any) => d.id === row.lastRecordId)
    if (record) {
      currentRecord.value = record
      showDetailModal.value = true
      return
    }
  }
  message.info(`「${row.gameName}」暂无分发记录`)
}

// 撤销游戏的最新分发（从游戏列表）
function revokeByGame(row: any) {
  if (!row.lastRecordId) {
    message.warning(`「${row.gameName}」暂无分发记录可撤销`)
    return
  }
  const record = distributeData.value.find((d: any) => d.id === row.lastRecordId)
  if (record) {
    revokeDistribute(record)
  }
}
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.header-desc { font-size: 13px; color: var(--text-muted); margin-top: 4px; display: block; }

.stats-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: white; border-radius: 14px; padding: 20px; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 16px; }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-content { display: flex; flex-direction: column; }
.stat-content .label { font-size: 12px; color: var(--text-muted); }
.stat-content .value { font-family: 'Orbitron', sans-serif; font-size: 22px; font-weight: 700; color: var(--text-primary); }
.stat-content .value.warning { color: #F59E0B; }
.stat-content .value.error { color: #EF4444; }

.content-card { background: white; border-radius: 16px; padding: 24px; border: 1px solid var(--border-color); }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-header h3 { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0; }
</style>
