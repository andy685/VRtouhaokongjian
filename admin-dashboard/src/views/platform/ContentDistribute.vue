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
              <n-select v-model:value="filterGame" placeholder="输入并模糊搜索游戏" :options="gameOptions" size="small" style="width: 180px;" clearable filterable :filter="fuzzyFilter" />
              <n-button size="small" secondary @click="refreshData">刷新</n-button>
              <n-button size="small" type="primary" @click="openBatchDistribute">批量分发</n-button>
            </n-space>
          </div>
          <n-data-table :columns="gameColumns" :data="gameList" :pagination="pagination" striped />
        </div>
      </n-tab-pane>

      <n-tab-pane name="groups" tab="游戏分组">
        <div class="content-card">
          <div class="section-header">
            <div>
              <h3>游戏分组</h3>
              <p class="section-desc">用于把游戏整理成运营分组；分发时仍通过“批量分发”选择游戏或分组。</p>
            </div>
            <n-button size="small" type="primary" @click="openGroupModal()">新增分组</n-button>
          </div>
          <div class="group-grid">
            <div v-for="group in gameGroups" :key="group.id" class="game-group-item">
              <div class="group-item-header">
                <div>
                  <h4>{{ group.name }}</h4>
                  <p>{{ group.description }}</p>
                </div>
                <n-tag size="small" type="info" :bordered="false">{{ group.games.length }} 款游戏</n-tag>
              </div>
              <div class="group-game-tags">
                <n-tag v-for="game in group.games" :key="game" size="small" :bordered="false">{{ game }}</n-tag>
              </div>
              <div class="group-item-footer">
                <span>更新时间：{{ group.updatedAt }}</span>
                <n-button text type="primary" size="small" @click="openGroupModal(group)">编辑分组</n-button>
              </div>
            </div>
          </div>
        </div>
      </n-tab-pane>

      <n-tab-pane name="store-games" tab="店铺游戏情况">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <n-space>
            <n-select v-model:value="sgpMerchant" placeholder="所属商家" :options="sgpMerchantOpts" size="small" style="width: 140px;" clearable @update:value="sgpStore = null" />
            <n-select v-model:value="sgpStore" placeholder="店铺" :options="sgpStoreOpts" size="small" style="width: 150px;" clearable />
            <n-select v-model:value="sgpGame" placeholder="拥有游戏" :options="gameOptions" size="small" style="width: 150px;" clearable />
            <n-select v-model:value="sgpCategory" placeholder="游戏分类" :options="sgpCategoryOpts" size="small" style="width: 130px;" clearable />
          </n-space>
          <span class="records-hint">按店铺维度查看名下游戏、版本与启用状态，展开行查看明细</span>
        </div>
        <div class="content-card">
          <n-data-table :columns="storeGameColumns" :data="filteredStoreGameRows" :row-key="(row: any) => row.id" striped />
        </div>
      </n-tab-pane>

      <n-tab-pane name="records" tab="分发记录">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <n-space>
            <n-select v-model:value="filterStatus" placeholder="分发状态" :options="statusOptions" size="small" style="width: 120px;" clearable />
            <n-select v-model:value="filterGame" placeholder="分发内容" :options="recordContentOptions" size="small" style="width: 160px;" clearable />
          </n-space>
          <span class="records-hint">按分发批次记录每次操作、对象、范围和执行结果</span>
        </div>
        <div class="content-card">
          <n-data-table :columns="columns" :data="filteredData" :pagination="pagination" striped />
        </div>
      </n-tab-pane>
    </n-tabs>

    <!-- 游戏分发弹窗 -->
    <n-modal v-model:show="showDistributeModal" preset="card" title="游戏分发" style="width: 560px;" :bordered="false">
      <n-form label-placement="left" label-width="100">
        <n-form-item label="分发对象" required>
          <n-radio-group v-model:value="distributeForm.targetType" name="targetType">
            <n-space>
              <n-radio value="game">单个游戏</n-radio>
              <n-radio value="group">游戏分组</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item v-if="distributeForm.targetType === 'game'" label="选择游戏" required>
          <n-select v-model:value="distributeForm.game" :options="gameOptions" placeholder="请选择要分发的游戏" />
        </n-form-item>
        <n-form-item v-else label="选择分组" required>
          <n-select v-model:value="distributeForm.group" :options="groupOptions" placeholder="请选择要分发的游戏分组" />
        </n-form-item>
        <n-form-item label="分发内容">
          <div class="release-preview">
            <div class="release-preview-main">
              <span class="release-preview-label">{{ distributeForm.targetType === 'group' ? '分组版本预览' : '可分发版本' }}</span>
              <strong>{{ distributeVersionDisplay }}</strong>
            </div>
            <div v-if="distributeForm.targetType === 'group' && selectedGroup" class="release-preview-games">
              <n-tag
                v-for="game in selectedGroupGames"
                :key="game.id"
                size="small"
                :type="game.latestReleaseVersion ? 'success' : 'default'"
                :bordered="false"
              >
                {{ game.gameName }} · {{ game.latestReleaseVersion || '暂无可分发版本' }}
              </n-tag>
            </div>
            <p class="release-preview-tip">{{ distributeVersionHint }}</p>
          </div>
        </n-form-item>
        <n-form-item label="目标店铺" required>
          <n-select v-model:value="distributeForm.stores" :options="storeOptions" multiple placeholder="请选择目标店铺" />
        </n-form-item>
        <n-form-item label="分发方式" required>
          <n-radio-group v-model:value="distributeForm.distributeMode" name="distributeMode">
            <n-space vertical>
              <n-radio value="smart">
                <div class="distribute-mode-option">
                  <span class="mode-label">智能分发</span>
                  <n-tag size="tiny" type="warning" :bordered="false">推荐</n-tag>
                </div>
                <span class="mode-desc">自动根据变更清单仅分发变更部分（L1），元数据变更不入分发队列（L0）</span>
              </n-radio>
              <n-radio value="full">
                <div class="distribute-mode-option">
                  <span class="mode-label">全量分发</span>
                </div>
                <span class="mode-desc">强制重新分发全部资源构件，用于首次分发或异常修复</span>
              </n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showDistributeModal = false">取消</n-button>
          <n-button type="primary" @click="confirmDistribute">确认分发</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 游戏分组编辑弹窗 -->
    <n-modal v-model:show="showGroupModal" preset="card" :title="groupModalTitle" style="width: 560px;" :bordered="false">
      <n-form label-placement="left" label-width="100">
        <n-form-item label="分组名称" required>
          <n-input v-model:value="groupForm.name" placeholder="请输入分组名称，例如：亲子轻松组" />
        </n-form-item>
        <n-form-item label="分组说明">
          <n-input
            v-model:value="groupForm.description"
            type="textarea"
            placeholder="请输入分组用途说明"
            :autosize="{ minRows: 2, maxRows: 4 }"
          />
        </n-form-item>
        <n-form-item label="包含游戏" required>
          <n-select
            v-model:value="groupForm.games"
            :options="gameOptions"
            multiple
            filterable
            placeholder="请选择游戏，可搜索"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showGroupModal = false">取消</n-button>
          <n-button type="primary" @click="saveGameGroup">保存</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 详情弹窗 -->
    <n-modal v-model:show="showDetailModal" preset="card" title="分发详情" style="width: 720px;" :bordered="false">
      <n-descriptions v-if="currentRecord" label-placement="left" :column="2" bordered>
        <n-descriptions-item label="批次号">{{ currentRecord.batchNo }}</n-descriptions-item>
        <n-descriptions-item label="分发对象">{{ currentRecord.targetType }}</n-descriptions-item>
        <n-descriptions-item label="分发内容">{{ currentRecord.targetName }}</n-descriptions-item>
        <n-descriptions-item label="内容版本">{{ getVersionSummary(currentRecord) }}</n-descriptions-item>
        <n-descriptions-item label="目标店铺">{{ currentRecord.storeCount }} 家</n-descriptions-item>
        <n-descriptions-item label="执行结果">{{ currentRecord.successCount }} 成功 / {{ currentRecord.failedCount }} 失败</n-descriptions-item>
        <n-descriptions-item label="分发状态">
          <n-tag :type="statusType(currentRecord.status)" size="small">
            {{ currentRecord.statusText }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="分发方式">{{ currentRecord.mode }}</n-descriptions-item>
        <n-descriptions-item label="分发时间">{{ currentRecord.time }}</n-descriptions-item>
        <n-descriptions-item label="操作人">{{ currentRecord.operator }}</n-descriptions-item>
      </n-descriptions>
      <div style="margin-top: 16px;" v-if="currentRecord && currentRecord.versionItems?.length">
        <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: var(--text-primary);">分发内容清单</h4>
        <div class="version-list">
          <n-tag
            v-for="item in currentRecord.versionItems"
            :key="`${item.name}-${item.version}`"
            size="small"
            type="info"
            :bordered="false"
          >
            {{ item.name }} · {{ item.version }}
          </n-tag>
        </div>
      </div>
      <div style="margin-top: 16px;" v-if="currentRecord && currentRecord.storeList">
        <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: var(--text-primary);">执行店铺明细</h4>
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
  NRadio, NRadioGroup, useMessage, useDialog
} from 'naive-ui'
import {
  CloudUploadOutline, CheckmarkCircleOutline, TimeOutline, CloseCircleOutline,
} from '@vicons/ionicons5'

const message = useMessage()
const dialog = useDialog()

type GameDistributionRow = {
  id: number
  gameName: string
  cover: string
  currentVersion: string
  latestReleaseVersion: string
  distributedVersion: string
  distributeStatus: DistributeStatus | string
  storeCount: number
  lastDistributeTime: string
  lastRecordId: number | null
}

type GameGroup = {
  id: number
  name: string
  description: string
  games: string[]
  updatedAt: string
}

// 当前标签页
const activeTab = ref('games')

// 状态类型映射函数
function statusType(status: string) {
  const map: Record<string, 'success' | 'warning' | 'error' | 'default'> = { done: 'success', pending: 'warning', failed: 'error', revoking: 'warning', revoked: 'default' }
  return map[status] || 'default'
}
const filterGame = ref<string | null>(null)
const filterStatus = ref<string | null>(null)

// 游戏分发状态类型
type DistributeStatus = '未分发' | '已分发' | '有更新' | '已撤回'
type DistributeTargetType = 'game' | 'group'

// 游戏列表数据（游戏中心视角）
const gameList = ref<GameDistributionRow[]>([
  {
    id: 1,
    gameName: '过山车VR',
    cover: 'https://picsum.photos/seed/coaster/90/120',
    currentVersion: 'v2.3.2',
    latestReleaseVersion: 'v2.3.2',
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
    latestReleaseVersion: 'v1.8.5',
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
    latestReleaseVersion: 'v3.1.0',
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
    latestReleaseVersion: 'v2.0.2',
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
    latestReleaseVersion: 'v1.5.0',
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
    latestReleaseVersion: 'v2.1.0',
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
    fixed: 'left' as const,
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
    title: '内容版本',
    key: 'currentVersion',
    width: 100,
  },
  {
    title: '可分发版本',
    key: 'latestReleaseVersion',
    width: 110,
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
      const typeMap: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
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
    fixed: 'right' as const,
    render(row: any) {
      const buttons: any[] = []
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

// 模糊搜索：输入的每个字符按顺序出现在游戏名中即命中（忽略大小写），如"过v"匹配"过山车VR"
function fuzzyFilter(pattern: string, option: any) {
  const p = String(pattern).toLowerCase().replace(/\s+/g, '')
  if (!p) return true
  const label = String(option.label).toLowerCase()
  let i = 0
  for (const ch of p) {
    i = label.indexOf(ch, i)
    if (i === -1) return false
    i += 1
  }
  return true
}

const gameOptions = [
  { label: '过山车VR', value: '过山车VR' },
  { label: '恐怖医院', value: '恐怖医院' },
  { label: '极速赛车', value: '极速赛车' },
  { label: '海洋世界', value: '海洋世界' },
  { label: '恐龙王国', value: '恐龙王国' },
  { label: '太空探险', value: '太空探险' },
]

const gameGroups = ref<GameGroup[]>([
  {
    id: 1,
    name: '亲子轻松组',
    description: '适合亲子、低刺激、轻体验门店优先分发',
    games: ['海洋世界', '恐龙王国', '太空探险'],
    updatedAt: '2026-04-21',
  },
  {
    id: 2,
    name: '高刺激爆款组',
    description: '适合核心玩家、刺激体验、热门内容运营',
    games: ['过山车VR', '恐怖医院', '极速赛车'],
    updatedAt: '2026-04-20',
  },
  {
    id: 3,
    name: '新店开业组',
    description: '新店默认上架内容组合，用于快速初始化内容池',
    games: ['过山车VR', '海洋世界', '太空探险'],
    updatedAt: '2026-04-18',
  },
])

const groupOptions = computed(() =>
  gameGroups.value.map(group => ({ label: group.name, value: group.id }))
)
const recordContentOptions = computed(() => [
  ...gameOptions,
  ...gameGroups.value.map(group => ({ label: group.name, value: group.name })),
])

const showGroupModal = ref(false)
const editingGroupId = ref<number | null>(null)
const groupForm = ref({
  name: '',
  description: '',
  games: [] as string[],
})
const groupModalTitle = computed(() => editingGroupId.value ? '编辑游戏分组' : '新增游戏分组')

function formatToday() {
  const date = new Date()
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function openGroupModal(group?: GameGroup) {
  if (group) {
    editingGroupId.value = group.id
    groupForm.value = {
      name: group.name,
      description: group.description,
      games: [...group.games],
    }
  } else {
    editingGroupId.value = null
    groupForm.value = {
      name: '',
      description: '',
      games: [],
    }
  }
  showGroupModal.value = true
}

function saveGameGroup() {
  const name = groupForm.value.name.trim()
  const description = groupForm.value.description.trim()
  if (!name) {
    message.warning('请输入分组名称')
    return
  }
  if (groupForm.value.games.length === 0) {
    message.warning('请选择至少一款游戏')
    return
  }

  if (editingGroupId.value) {
    const target = gameGroups.value.find(group => group.id === editingGroupId.value)
    if (target) {
      target.name = name
      target.description = description || '暂无说明'
      target.games = [...groupForm.value.games]
      target.updatedAt = formatToday()
    }
    message.success(`已更新游戏分组「${name}」`)
  } else {
    const nextId = Math.max(0, ...gameGroups.value.map(group => group.id)) + 1
    gameGroups.value.unshift({
      id: nextId,
      name,
      description: description || '暂无说明',
      games: [...groupForm.value.games],
      updatedAt: formatToday(),
    })
    message.success(`已新增游戏分组「${name}」`)
  }
  showGroupModal.value = false
}

const statusOptions = [
  { label: '已完成', value: 'done' },
  { label: '分发中', value: 'pending' },
  { label: '失败', value: 'failed' },
  { label: '撤回中', value: 'revoking' },
  { label: '已撤回', value: 'revoked' },
]

// ========== 店铺游戏情况（店铺维度分发情况） ==========
type StoreGame = { name: string; version: string; state: '已启用' | '已停用' | '分发中'; time: string }
type StoreGameRow = { id: number; storeName: string; merchant: string; region: string; games: StoreGame[]; lastUpdate: string }

const storeGameRows = ref<StoreGameRow[]>([
  { id: 1, storeName: '深圳福田旗舰店', merchant: '利民街商家', region: '深圳', lastUpdate: '2026-04-20 10:05', games: [
    { name: '过山车VR', version: 'v2.3.2', state: '已启用', time: '2026-04-20 10:05' },
    { name: '恐怖医院', version: 'v1.8.5', state: '已启用', time: '2026-04-19 15:35' },
    { name: '极速赛车', version: 'v3.1.0', state: '分发中', time: '2026-04-20 14:05' },
    { name: '海洋世界', version: 'v2.0.2', state: '已启用', time: '2026-04-18 09:06' },
  ]},
  { id: 2, storeName: '南山科技园店', merchant: '恒然集团', region: '深圳', lastUpdate: '2026-04-20 14:08', games: [
    { name: '过山车VR', version: 'v2.3.1', state: '已启用', time: '2026-04-20 10:06' },
    { name: '太空探险', version: 'v2.1.0', state: '已启用', time: '2026-04-18 09:10' },
    { name: '极速赛车', version: 'v3.1.0', state: '分发中', time: '2026-04-20 14:06' },
  ]},
  { id: 3, storeName: '广州天河店', merchant: '卓远科技', region: '广州', lastUpdate: '2026-04-19 15:38', games: [
    { name: '恐怖医院', version: 'v1.8.5', state: '已启用', time: '2026-04-19 15:38' },
    { name: '极速赛车', version: 'v3.1.0', state: '分发中', time: '2026-04-20 14:07' },
  ]},
  { id: 4, storeName: '北京朝阳店', merchant: '卓远科技', region: '北京', lastUpdate: '2026-04-20 14:08', games: [
    { name: '过山车VR', version: 'v2.3.2', state: '已启用', time: '2026-04-20 14:08' },
    { name: '恐龙王国', version: 'v1.5.0', state: '已停用', time: '2026-04-17 11:25' },
    { name: '海洋世界', version: 'v2.0.2', state: '已启用', time: '2026-04-18 09:12' },
    { name: '太空探险', version: 'v2.1.0', state: '已启用', time: '2026-04-18 09:15' },
  ]},
  { id: 5, storeName: '上海浦东店', merchant: '利民街商家', region: '上海', lastUpdate: '2026-04-20 10:12', games: [
    { name: '过山车VR', version: 'v2.3.2', state: '已启用', time: '2026-04-20 10:12' },
    { name: '恐怖医院', version: 'v1.8.5', state: '已停用', time: '2026-04-17 11:30' },
  ]},
])

const sgpMerchant = ref<string | null>(null)
const sgpStore = ref<string | null>(null)
const sgpGame = ref<string | null>(null)
const sgpCategory = ref<string | null>(null)

const sgpMerchantOpts = [...new Set(storeGameRows.value.map(r => r.merchant))].map(m => ({ label: m, value: m }))
const sgpStoreOpts = computed(() => {
  const rows = sgpMerchant.value ? storeGameRows.value.filter(r => r.merchant === sgpMerchant.value) : storeGameRows.value
  return rows.map(r => ({ label: r.storeName, value: r.storeName }))
})
const gameCategoryMap: Record<string, string[]> = {
  '过山车VR': ['extreme'],
  '恐怖医院': ['horror'],
  '极速赛车': ['extreme'],
  '海洋世界': ['ocean', 'family'],
  '恐龙王国': ['family', 'scifi'],
  '太空探险': ['scifi'],
}
const categoryLabelMap: Record<string, string> = {
  scifi: '科幻冒险',
  extreme: '极限运动',
  ocean: '海洋探索',
  family: '亲子娱乐',
  horror: '恐怖惊悚',
  rhythm: '音乐节奏',
}
const sgpCategoryOpts = Object.entries(categoryLabelMap).map(([value, label]) => ({ label, value }))

function storeHasGame(row: StoreGameRow, gameName: string | null) {
  return gameName ? row.games.some(g => g.name === gameName) : true
}
function storeHasCategory(row: StoreGameRow, category: string | null) {
  if (!category) return true
  return row.games.some(g => (gameCategoryMap[g.name] || []).includes(category))
}

const filteredStoreGameRows = computed(() => {
  return storeGameRows.value.filter(row =>
    (!sgpMerchant.value || row.merchant === sgpMerchant.value) &&
    (!sgpStore.value || row.storeName === sgpStore.value) &&
    storeHasGame(row, sgpGame.value) &&
    storeHasCategory(row, sgpCategory.value)
  )
})

const storeGameInnerColumns = [
  { title: '游戏名称', key: 'name', minWidth: 140 },
  { title: '内容版本', key: 'version', width: 110 },
  { title: '状态', key: 'state', width: 100, render: (g: StoreGame) => {
      const typeMap: Record<string, 'success' | 'warning' | 'default'> = { '已启用': 'success', '分发中': 'warning', '已停用': 'default' }
      return h(NTag, { type: typeMap[g.state] || 'default', size: 'small', bordered: false }, () => g.state)
    } },
  { title: '最近分发时间', key: 'time', width: 160 },
]

const storeGameColumns = [
  { type: 'expand' as const, renderExpand: (row: StoreGameRow) => h(NDataTable, {
      columns: storeGameInnerColumns,
      data: row.games,
      size: 'small',
      bordered: false,
    }) },
  { title: '店铺名称', key: 'storeName', width: 170 },
  { title: '所属商家', key: 'merchant', width: 130 },
  { title: '区域', key: 'region', width: 90 },
  { title: '游戏数量', key: 'gameCount', width: 90, align: 'center' as const, render: (row: StoreGameRow) => `${row.games.length} 款` },
  { title: '已启用', key: 'enabledCount', width: 90, align: 'center' as const, render: (row: StoreGameRow) => {
      const enabled = row.games.filter(g => g.state === '已启用').length
      return h('span', { style: enabled ? 'color:#10B981;font-weight:500;' : 'color:var(--text-muted);' }, `${enabled} 款`)
    } },
  { title: '最近内容更新', key: 'lastUpdate', width: 160 },
]

const storeOptions = [
  { label: '深圳福田旗舰店', value: '1' },
  { label: '南山科技园店', value: '2' },
  { label: '广州天河店', value: '3' },
  { label: '北京朝阳店', value: '4' },
  { label: '上海浦东店', value: '5' },
]

const columns = [
  { title: '批次号', key: 'batchNo', width: 150 },
  { title: '分发对象', key: 'targetType', width: 100, render: (row: any) =>
    h(NTag, { type: row.targetType === '游戏分组' ? 'info' : 'default', size: 'small', bordered: false }, () => row.targetType)
  },
  { title: '分发内容', key: 'targetName', minWidth: 180, render: (row: any) => h('div', { class: 'record-target' }, [
    h('span', { class: 'record-target-name' }, row.targetName),
    row.versionItems?.length ? h('span', { class: 'record-target-count' }, `${row.versionItems.length} 款游戏`) : null,
  ]) },
  { title: '内容版本', key: 'version', width: 180, ellipsis: { tooltip: true }, render: (row: any) => getVersionSummary(row) },
  { title: '目标店铺', key: 'storeCount', width: 100, render: (row: any) => `${row.storeCount} 家` },
  { title: '执行结果', key: 'result', width: 130, render: (row: any) => `${row.successCount}/${row.storeCount} 成功` },
  { title: '分发方式', key: 'mode', width: 120 },
  {
    title: '分发状态',
    key: 'status',
    width: 120,
    render(row: any) {
      const typeMap: Record<string, 'success' | 'warning' | 'error' | 'default'> = { done: 'success', pending: 'warning', failed: 'error', revoking: 'warning', revoked: 'default' }
      return h(NTag, { type: typeMap[row.status] || 'default', size: 'small', bordered: true }, () => row.statusText)
    }
  },
  { title: '发起时间', key: 'time', width: 160 },
  { title: '操作人', key: 'operator', width: 100 },
  {
    title: '操作',
    key: 'action',
    width: 200,
    fixed: 'right' as const,
    render(row: any) {
      const buttons: any[] = []
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
      const typeMap: Record<string, 'success' | 'warning' | 'error' | 'default'> = { done: 'success', pending: 'warning', failed: 'error', revoking: 'warning', revoked: 'default' }
      const labelMap: Record<string, string> = { done: '已完成', pending: '分发中', failed: '失败', revoking: '撤回中', revoked: '已撤回' }
      return h(NTag, { type: typeMap[row.status] || 'default', size: 'small' }, () => labelMap[row.status] || row.statusText)
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
    batchNo: 'DIST202604200001',
    targetType: '单个游戏',
    targetName: '过山车VR',
    gameName: '过山车VR',
    storeCount: 156,
    successCount: 156,
    failedCount: 0,
    mode: '智能分发',
    version: 'v2.3.2',
    versionItems: [{ name: '过山车VR', version: 'v2.3.2' }],
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
    batchNo: 'DIST202604200002',
    targetType: '游戏分组',
    targetName: '高刺激爆款组',
    gameName: '高刺激爆款组',
    storeCount: 148,
    successCount: 148,
    failedCount: 0,
    mode: '智能分发',
    version: '过山车VR v2.3.2 / 恐怖医院 v1.8.5 / 极速赛车 v3.1.0',
    versionItems: [
      { name: '过山车VR', version: 'v2.3.2' },
      { name: '恐怖医院', version: 'v1.8.5' },
      { name: '极速赛车', version: 'v3.1.0' },
    ],
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
    batchNo: 'DIST202604200003',
    targetType: '单个游戏',
    targetName: '极速赛车',
    gameName: '极速赛车',
    storeCount: 142,
    successCount: 96,
    failedCount: 0,
    mode: '智能分发',
    version: 'v3.1.0',
    versionItems: [{ name: '极速赛车', version: 'v3.1.0' }],
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
    batchNo: 'DIST202604180001',
    targetType: '游戏分组',
    targetName: '亲子轻松组',
    gameName: '亲子轻松组',
    storeCount: 138,
    successCount: 136,
    failedCount: 2,
    mode: '全量分发',
    version: '海洋世界 v2.0.2 / 恐龙王国 v1.5.0 / 太空探险 v2.1.0',
    versionItems: [
      { name: '海洋世界', version: 'v2.0.2' },
      { name: '恐龙王国', version: 'v1.5.0' },
      { name: '太空探险', version: 'v2.1.0' },
    ],
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
    batchNo: 'DIST202604170001',
    targetType: '单个游戏',
    targetName: '恐龙王国',
    gameName: '恐龙王国',
    storeCount: 130,
    successCount: 130,
    failedCount: 0,
    mode: '撤回',
    version: 'v1.5.0',
    versionItems: [{ name: '恐龙王国', version: 'v1.5.0' }],
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
    batchNo: 'DIST202604210001',
    targetType: '游戏分组',
    targetName: '新店开业组',
    gameName: '新店开业组',
    storeCount: 120,
    successCount: 1,
    failedCount: 0,
    mode: '撤回',
    version: '过山车VR v2.3.2 / 海洋世界 v2.0.2 / 太空探险 v2.1.0',
    versionItems: [
      { name: '过山车VR', version: 'v2.3.2' },
      { name: '海洋世界', version: 'v2.0.2' },
      { name: '太空探险', version: 'v2.1.0' },
    ],
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
    data = data.filter(d => d.targetName === filterGame.value || String(d.version).includes(filterGame.value || ''))
  }
  if (filterStatus.value) {
    data = data.filter(d => d.status === filterStatus.value)
  }
  return data
})

function refreshData() {
  message.success('数据已刷新')
}

function getVersionSummary(row: any) {
  const items = row.versionItems || []
  if (!items.length) return row.version || '-'
  if (items.length === 1) return items[0].version
  const preview = items.slice(0, 2).map((item: any) => `${item.name} ${item.version}`).join(' / ')
  const restCount = items.length - 2
  return restCount > 0 ? `${preview} 等 ${items.length} 款` : preview
}

// 游戏分发
const showDistributeModal = ref(false)
const defaultDistributeForm = () => ({
  targetType: 'game' as DistributeTargetType,
  game: '',
  group: null as number | null,
  stores: [] as string[],
  version: '',
  distributeMode: 'smart' as 'smart' | 'full',
})
const distributeForm = ref(defaultDistributeForm())

const selectedGame = computed(() => gameList.value.find(g => g.gameName === distributeForm.value.game))
const selectedGroup = computed(() => gameGroups.value.find(g => g.id === distributeForm.value.group) || null)
const selectedGroupGames = computed(() => {
  if (!selectedGroup.value) return []
  return gameList.value.filter(game => selectedGroup.value?.games.includes(game.gameName))
})
const selectedDistributableGroupGames = computed(() =>
  selectedGroupGames.value.filter(game => game.latestReleaseVersion)
)

const distributeVersionDisplay = computed(() => {
  if (distributeForm.value.targetType === 'group') {
    if (!selectedGroup.value) return '请先选择游戏分组'
    return `组内 ${selectedDistributableGroupGames.value.length}/${selectedGroupGames.value.length} 款游戏可分发`
  }
  if (!selectedGame.value) return '请先选择游戏'
  return selectedGame.value.latestReleaseVersion || '暂无可分发版本'
})

const distributeVersionHint = computed(() => {
  if (distributeForm.value.targetType === 'group') {
    return '分组分发会按组内每款游戏当前已审核通过的发布版本执行；没有可分发版本的游戏会被跳过。'
  }
  if (!selectedGame.value) return '分发版本由系统根据已审核通过的发布版本自动带出。'
  return '分发页不再手填版本号，只能分发该游戏当前已审核通过的发布版本。'
})

function confirmDistribute() {
  if (distributeForm.value.targetType === 'game' && !distributeForm.value.game) {
    message.warning('请选择游戏')
    return
  }
  if (distributeForm.value.targetType === 'group' && !selectedGroup.value) {
    message.warning('请选择游戏分组')
    return
  }
  if (distributeForm.value.stores.length === 0) {
    message.warning('请选择目标店铺')
    return
  }
  if (distributeForm.value.targetType === 'game' && !selectedGame.value?.latestReleaseVersion) {
    message.warning('该游戏尚未审核通过，当前不可分发')
    return
  }
  if (distributeForm.value.targetType === 'group' && selectedDistributableGroupGames.value.length === 0) {
    message.warning('该分组内暂无可分发游戏')
    return
  }
  const modeText = distributeForm.value.distributeMode === 'smart' ? '智能分发（仅变更部分）' : '全量分发'
  if (distributeForm.value.targetType === 'group') {
    message.success(`已成功${modeText}「${selectedGroup.value?.name}」分组内 ${selectedDistributableGroupGames.value.length} 款游戏到 ${distributeForm.value.stores.length} 家店铺`)
  } else {
    message.success(`已成功${modeText}「${distributeForm.value.game}」（${selectedGame.value?.latestReleaseVersion}）到 ${distributeForm.value.stores.length} 家店铺`)
  }
  showDistributeModal.value = false
  distributeForm.value = defaultDistributeForm()
}

function openBatchDistribute() {
  distributeForm.value = defaultDistributeForm()
  showDistributeModal.value = true
}

// 详情
const showDetailModal = ref(false)
const currentRecord = ref<any>(null)

function openDetail(row: any) {
  currentRecord.value = row
  showDetailModal.value = true
}

// 重试分发（从列表）
function retryDistribute(row: any) {
  const failedStoreNames = row.storeList?.filter((s: any) => s.status === 'failed').map((s: any) => s.storeName) || []
  const storeValueMap = new Map(storeOptions.map((opt: any) => [opt.label, opt.value]))
  const failedStoreValues = failedStoreNames.map((name: string) => storeValueMap.get(name)).filter(Boolean)
  const group = gameGroups.value.find(item => item.name === row.targetName)
  
  distributeForm.value = {
    targetType: group ? 'group' : 'game',
    game: group ? '' : row.targetName || row.gameName,
    group: group?.id || null,
    stores: failedStoreValues,
    version: row.latestReleaseVersion || row.version || '',
    distributeMode: 'full',
  }
  showDistributeModal.value = true
  message.info(`正在重新分发批次 ${row.batchNo}，已预选失败的店铺（全量分发模式）`)
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
    content: `确认撤销分发批次「${row.batchNo}」？撤销后目标店铺将无法访问本批次分发内容。`,
    positiveText: '确认撤销',
    negativeText: '取消',
    onPositiveClick: () => {
      row.status = 'revoking'
      row.statusText = '撤回中'
      row.mode = '撤回'
      message.info(`正在撤销分发批次「${row.batchNo}」...`)
      // 模拟异步撤回
      setTimeout(() => {
        row.status = 'revoked'
        row.statusText = '已撤回'
        message.success(`分发批次「${row.batchNo}」已成功撤销`)
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
  const mode = (row.distributeStatus === '有更新' || row.distributeStatus === '未分发') ? 'smart' : 'full'
  distributeForm.value = {
    targetType: 'game',
    game: row.gameName,
    group: null,
    stores: [],
    version: row.latestReleaseVersion || row.currentVersion || '',
    distributeMode: mode,
  }
  showDistributeModal.value = true
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
.group-card { margin-bottom: 16px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-header h3 { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0; }
.section-desc { margin: 6px 0 0; font-size: 12px; color: var(--text-muted); }

.group-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.game-group-item {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 14px;
  background: #fbfcff;
}

.group-item-header {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: flex-start;
}

.group-item-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.group-item-header p {
  margin: 5px 0 0;
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.5;
}

.group-game-tags,
.release-preview-games {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.group-game-tags {
  margin-top: 12px;
}

.group-item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--border-color);
  font-size: 12px;
  color: var(--text-muted);
}

/* 分发方式选项 */
.distribute-mode-option {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.mode-label {
  font-weight: 600;
  font-size: 13px;
  color: var(--text-primary);
}

.mode-desc {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.5;
}

.release-preview {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #f8fafc;
}

.release-preview-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.release-preview-label {
  font-size: 12px;
  color: var(--text-muted);
}

.release-preview-main strong {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  text-align: right;
}

.release-preview-games {
  margin-top: 10px;
}

.release-preview-tip {
  margin: 10px 0 0;
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.5;
}

.records-hint {
  color: var(--text-muted);
  font-size: 12px;
}

.record-target {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.record-target-name {
  font-weight: 600;
  color: var(--text-primary);
}

.record-target-count {
  font-size: 12px;
  color: var(--text-muted);
}

.version-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: #f8fafc;
  max-height: 180px;
  overflow-y: auto;
}
</style>
