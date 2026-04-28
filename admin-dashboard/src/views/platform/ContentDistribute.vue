<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>内容分发</h1>
        <p class="header-desc">管理游戏内容向各店铺的分发配置</p>
      </div>
      <n-space>
        <n-select v-model:value="filterGame" placeholder="选择游戏" :options="gameOptions" size="small" style="width: 160px;" clearable />
        <n-select v-model:value="filterRegion" placeholder="选择区域" :options="regionOptions" size="small" style="width: 140px;" clearable />
        <n-button type="primary" @click="showBatchModal = true">批量分发</n-button>
      </n-space>
    </div>

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
    </div>

    <div class="content-card">
      <div class="section-header">
        <h3>分发记录</h3>
        <n-space>
          <n-select v-model:value="filterStatus" placeholder="分发状态" :options="statusOptions" size="small" style="width: 120px;" clearable />
          <n-button size="small" secondary @click="refreshData">刷新</n-button>
        </n-space>
      </div>
      <n-data-table :columns="columns" :data="filteredData" :pagination="pagination" striped />
    </div>

    <!-- 批量分发弹窗 -->
    <n-modal v-model:show="showBatchModal" preset="card" title="批量分发" style="width: 560px;" :bordered="false">
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
    <n-modal v-model:show="showDetailModal" preset="card" title="分发详情" style="width: 600px;" :bordered="false">
      <n-descriptions v-if="currentRecord" label-placement="left" :column="2" bordered>
        <n-descriptions-item label="游戏名称">{{ currentRecord.gameName }}</n-descriptions-item>
        <n-descriptions-item label="分发版本">{{ currentRecord.version }}</n-descriptions-item>
        <n-descriptions-item label="分发店铺">{{ currentRecord.storeCount }} 家</n-descriptions-item>
        <n-descriptions-item label="分发状态">
          <n-tag :type="currentRecord.status === 'done' ? 'success' : currentRecord.status === 'pending' ? 'warning' : 'error'" size="small">
            {{ currentRecord.statusText }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="分发时间">{{ currentRecord.time }}</n-descriptions-item>
        <n-descriptions-item label="操作人">{{ currentRecord.operator }}</n-descriptions-item>
      </n-descriptions>
      <template #footer>
        <n-button @click="showDetailModal = false">关闭</n-button>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NButton, NDataTable, NTag, NSpace, NSelect, NModal, NForm, NFormItem,
  NInput, NIcon, NDescriptions, NDescriptionsItem, useMessage
} from 'naive-ui'
import {
  CloudUploadOutline, CheckmarkCircleOutline, TimeOutline, CloseCircleOutline
} from '@vicons/ionicons5'

const message = useMessage()
const filterGame = ref<string | null>(null)
const filterRegion = ref<string | null>(null)
const filterStatus = ref<string | null>(null)

const gameOptions = [
  { label: '过山车VR', value: '过山车VR' },
  { label: '恐怖医院', value: '恐怖医院' },
  { label: '极速赛车', value: '极速赛车' },
  { label: '海洋世界', value: '海洋世界' },
]

const regionOptions = [
  { label: '深圳', value: '深圳' },
  { label: '广州', value: '广州' },
  { label: '北京', value: '北京' },
  { label: '上海', value: '上海' },
]

const statusOptions = [
  { label: '已完成', value: 'done' },
  { label: '分发中', value: 'pending' },
  { label: '失败', value: 'failed' },
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
      const typeMap: Record<string, string> = { done: 'success', pending: 'warning', failed: 'error' }
      return h(NTag, { type: typeMap[row.status] as any, size: 'small', bordered: true }, () => row.statusText)
    }
  },
  { title: '分发时间', key: 'time', width: 160 },
  { title: '操作人', key: 'operator', width: 100 },
  {
    title: '操作',
    key: 'action',
    width: 120,
    render(row: any) {
      return h(NButton, { size: 'tiny', secondary: true, onClick: () => openDetail(row) }, () => '详情')
    }
  },
]

const distributeData = ref([
  { id: 1, gameName: '过山车VR', storeCount: 156, version: 'v2.3.1', status: 'done', statusText: '已完成', time: '2026-04-20 10:00', operator: '管理员' },
  { id: 2, gameName: '恐怖医院', storeCount: 148, version: 'v1.8.5', status: 'done', statusText: '已完成', time: '2026-04-19 15:30', operator: '管理员' },
  { id: 3, gameName: '极速赛车', storeCount: 142, version: 'v3.1.0', status: 'pending', statusText: '分发中', time: '2026-04-20 14:00', operator: '管理员' },
  { id: 4, gameName: '海洋世界', storeCount: 138, version: 'v2.0.2', status: 'failed', statusText: '失败', time: '2026-04-18 09:00', operator: '管理员' },
  { id: 5, gameName: '恐龙王国', storeCount: 130, version: 'v1.5.0', status: 'done', statusText: '已完成', time: '2026-04-17 11:20', operator: '管理员' },
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
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.header-desc { font-size: 13px; color: var(--text-muted); margin-top: 4px; display: block; }

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
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
