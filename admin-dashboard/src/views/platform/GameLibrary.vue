<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>游戏库</h1>
        <p class="header-desc">管理平台所有VR游戏内容</p>
      </div>
      <n-space>
        <n-input v-model:value="searchText" placeholder="搜索游戏名称..." size="small" style="width: 200px;">
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
        <n-select v-model:value="filterStatus" placeholder="全部状态" :options="statusOptions" size="small" style="width: 120px;" clearable />
        <n-button type="primary" @click="showAddModal = true">
          <template #icon><n-icon :component="AddOutline" /></template> 添加游戏
        </n-button>
      </n-space>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="GameControllerOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">游戏总数</span>
          <span class="value">48</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="CheckmarkCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">已上线</span>
          <span class="value">42</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="TimeOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">待更新</span>
          <span class="value warning">3</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
          <n-icon :component="EyeOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">累计体验</span>
          <span class="value">2.8M</span>
        </div>
      </div>
    </div>

    <!-- 游戏卡片网格 -->
    <div class="game-grid">
      <div v-for="game in filteredGames" :key="game.id" class="game-card" :class="{ disabled: game.status === 'offline' }">
        <div class="game-cover" :style="{ background: game.gradient }">
          <span class="game-icon">{{ game.icon }}</span>
          <div class="game-badge" :class="game.status">{{ game.statusText }}</div>
        </div>
        <div class="game-info">
          <h4>{{ game.name }}</h4>
          <div class="game-meta">
            <span>时长 {{ game.duration }}分钟</span>
            <span>{{ game.playCount }}次体验</span>
          </div>
          <div class="game-rating">
            <n-rate :value="game.rating" size="small" readonly />
            <span>{{ game.rating }}</span>
          </div>
          <div class="game-tags">
            <n-tag v-for="tag in game.tags" :key="tag" size="tiny" bordered>{{ tag }}</n-tag>
          </div>
          <div class="game-actions">
            <n-button size="tiny" secondary @click="openDetail(game)">详情</n-button>
            <n-button size="tiny" secondary @click="openEdit(game)">编辑</n-button>
            <n-button size="tiny" type="primary" quaternary @click="distributeGame(game)">分发</n-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑游戏弹窗 -->
    <n-modal v-model:show="showAddModal" preset="card" :title="isEdit ? '编辑游戏' : '添加游戏'" style="width: 560px;" :bordered="false">
      <n-form label-placement="left" label-width="100">
        <n-form-item label="游戏名称" required>
          <n-input v-model:value="form.name" placeholder="请输入游戏名称" />
        </n-form-item>
        <n-form-item label="游戏图标">
          <n-input v-model:value="form.icon" placeholder="请输入emoji图标，如：🎢" />
        </n-form-item>
        <n-form-item label="游戏时长">
          <n-input-number v-model:value="form.duration" :min="1" :max="120" style="width: 100%;">
            <template #suffix>分钟</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="标签">
          <n-dynamic-tags v-model:value="form.tags" />
        </n-form-item>
        <n-form-item label="状态">
          <n-radio-group v-model:value="form.status">
            <n-radio value="online">已上线</n-radio>
            <n-radio value="pending">待更新</n-radio>
            <n-radio value="offline">已下架</n-radio>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="封面渐变色">
          <n-input v-model:value="form.gradient" placeholder="如：linear-gradient(135deg, #667eea, #764ba2)" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showAddModal = false">取消</n-button>
          <n-button type="primary" @click="handleSave">保存</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 详情弹窗 -->
    <n-modal v-model:show="showDetailModal" preset="card" title="游戏详情" style="width: 600px;" :bordered="false">
      <div v-if="currentGame" class="detail-content">
        <div class="detail-cover" :style="{ background: currentGame.gradient }">
          <span class="detail-icon">{{ currentGame.icon }}</span>
        </div>
        <n-descriptions label-placement="left" :column="2" bordered style="margin-top: 20px;">
          <n-descriptions-item label="游戏名称">{{ currentGame.name }}</n-descriptions-item>
          <n-descriptions-item label="游戏ID">GM{{ String(currentGame.id).padStart(4, '0') }}</n-descriptions-item>
          <n-descriptions-item label="游戏时长">{{ currentGame.duration }} 分钟</n-descriptions-item>
          <n-descriptions-item label="体验次数">{{ currentGame.playCount }}</n-descriptions-item>
          <n-descriptions-item label="评分">{{ currentGame.rating }} / 5.0</n-descriptions-item>
          <n-descriptions-item label="状态">
            <n-tag :type="currentGame.status === 'online' ? 'success' : currentGame.status === 'pending' ? 'warning' : 'default'" size="small">
              {{ currentGame.statusText }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="标签" :span="2">
            <n-space>
              <n-tag v-for="tag in currentGame.tags" :key="tag" size="small">{{ tag }}</n-tag>
            </n-space>
          </n-descriptions-item>
        </n-descriptions>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showDetailModal = false">关闭</n-button>
          <n-button type="primary" @click="openEditFromDetail">编辑</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 分发弹窗 -->
    <n-modal v-model:show="showDistributeModal" preset="card" title="内容分发" style="width: 520px;" :bordered="false">
      <div v-if="currentGame" style="margin-bottom: 16px;">
        <p>正在为 <strong>{{ currentGame.name }}</strong> 选择分发店铺</p>
      </div>
      <n-transfer v-model:value="selectedStores" :options="storeOptions" source-title="未分发店铺" target-title="已选择店铺" />
      <template #footer>
        <n-space justify="end">
          <n-button @click="showDistributeModal = false">取消</n-button>
          <n-button type="primary" @click="confirmDistribute">确认分发</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  NButton, NInput, NSelect, NModal, NForm, NFormItem, NInputNumber,
  NRadioGroup, NRadio, NTag, NRate, NIcon, NTransfer, NDynamicTags,
  NDescriptions, NDescriptionsItem, NSpace, useMessage
} from 'naive-ui'
import {
  SearchOutline, AddOutline, GameControllerOutline, CheckmarkCircleOutline,
  TimeOutline, EyeOutline
} from '@vicons/ionicons5'

const message = useMessage()
const searchText = ref('')
const filterStatus = ref<string | null>(null)

const statusOptions = [
  { label: '已上线', value: 'online' },
  { label: '待更新', value: 'pending' },
  { label: '已下架', value: 'offline' },
]

const games = ref([
  { id: 1, name: '过山车VR', icon: '🎢', duration: 10, playCount: '15.8k', rating: 4.9, gradient: 'linear-gradient(135deg, #667eea, #764ba2)', status: 'online', statusText: '已上线', tags: ['刺激', '热门', '全年龄'] },
  { id: 2, name: '恐怖医院', icon: '🏥', duration: 15, playCount: '12.3k', rating: 4.7, gradient: 'linear-gradient(135deg, #f093fb, #f5576c)', status: 'online', statusText: '已上线', tags: ['恐怖', '成人', '沉浸'] },
  { id: 3, name: '极速赛车', icon: '🏎️', duration: 8, playCount: '10.5k', rating: 4.8, gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)', status: 'online', statusText: '已上线', tags: ['竞速', '热门', '全年龄'] },
  { id: 4, name: '海洋世界', icon: '🐳', duration: 20, playCount: '8.9k', rating: 4.6, gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)', status: 'online', statusText: '已上线', tags: ['科普', '亲子', '放松'] },
  { id: 5, name: '恐龙王国', icon: '🦖', duration: 12, playCount: '7.2k', rating: 4.5, gradient: 'linear-gradient(135deg, #fa709a, #fee140)', status: 'pending', statusText: '待更新', tags: ['冒险', '亲子', '科普'] },
  { id: 6, name: 'CS对战', icon: '🔫', duration: 30, playCount: '6.8k', rating: 4.8, gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)', status: 'online', statusText: '已上线', tags: ['射击', '多人', '竞技'] },
  { id: 7, name: '音乐节VR', icon: '🎵', duration: 25, playCount: '5.4k', rating: 4.4, gradient: 'linear-gradient(135deg, #ff9a9e, #fecfef)', status: 'offline', statusText: '已下架', tags: ['音乐', '休闲', '放松'] },
  { id: 8, name: '太空漫步', icon: '🚀', duration: 18, playCount: '4.2k', rating: 4.3, gradient: 'linear-gradient(135deg, #0c3483, #a2b6df)', status: 'online', statusText: '已上线', tags: ['科幻', '探索', '沉浸'] },
])

const filteredGames = computed(() => {
  let data = [...games.value]
  if (searchText.value) {
    data = data.filter(g => g.name.includes(searchText.value))
  }
  if (filterStatus.value) {
    data = data.filter(g => g.status === filterStatus.value)
  }
  return data
})

// 新增/编辑
const showAddModal = ref(false)
const isEdit = ref(false)
const currentGame = ref<any>(null)
const form = ref({ name: '', icon: '', duration: 10, tags: [] as string[], status: 'online', gradient: '' })

function openEdit(game: any) {
  isEdit.value = true
  currentGame.value = game
  form.value = { ...game }
  showAddModal.value = true
}

function handleSave() {
  if (isEdit.value && currentGame.value) {
    const idx = games.value.findIndex(g => g.id === currentGame.value.id)
    if (idx !== -1) {
      const statusMap: Record<string, string> = { online: '已上线', pending: '待更新', offline: '已下架' }
      games.value[idx] = { ...games.value[idx], ...form.value, statusText: statusMap[form.value.status] }
      message.success('游戏信息已更新')
    }
  } else {
    const statusMap: Record<string, string> = { online: '已上线', pending: '待更新', offline: '已下架' }
    games.value.unshift({
      id: Date.now(),
      ...form.value,
      playCount: '0',
      rating: 5.0,
      statusText: statusMap[form.value.status],
    })
    message.success('游戏添加成功')
  }
  showAddModal.value = false
  form.value = { name: '', icon: '', duration: 10, tags: [], status: 'online', gradient: '' }
  isEdit.value = false
}

// 详情
const showDetailModal = ref(false)

function openDetail(game: any) {
  currentGame.value = game
  showDetailModal.value = true
}

function openEditFromDetail() {
  showDetailModal.value = false
  openEdit(currentGame.value)
}

// 分发
const showDistributeModal = ref(false)
const selectedStores = ref<string[]>([])
const storeOptions = [
  { label: '深圳福田旗舰店', value: '1' },
  { label: '南山科技园店', value: '2' },
  { label: '广州天河店', value: '3' },
  { label: '北京朝阳店', value: '4' },
  { label: '上海浦东店', value: '5' },
]

function distributeGame(game: any) {
  currentGame.value = game
  selectedStores.value = []
  showDistributeModal.value = true
}

function confirmDistribute() {
  message.success(`已将「${currentGame.value.name}」分发到 ${selectedStores.value.length} 家店铺`)
  showDistributeModal.value = false
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

.game-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.game-card { background: white; border-radius: 14px; overflow: hidden; border: 1px solid var(--border-color); transition: all 0.25s; }
.game-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.1); }
.game-card.disabled { opacity: 0.6; }

.game-cover { height: 120px; display: flex; align-items: center; justify-content: center; position: relative; }
.game-icon { font-size: 48px; }
.game-badge { position: absolute; top: 10px; right: 10px; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; color: white; }
.game-badge.online { background: rgba(16,185,129,0.9); }
.game-badge.pending { background: rgba(245,158,11,0.9); }
.game-badge.offline { background: rgba(100,116,139,0.9); }

.game-info { padding: 14px; }
.game-info h4 { font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px; }
.game-meta { display: flex; gap: 12px; font-size: 12px; color: var(--text-muted); margin-bottom: 8px; }
.game-rating { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-muted); margin-bottom: 8px; }
.game-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
.game-actions { display: flex; gap: 8px; }

.detail-cover { height: 160px; display: flex; align-items: center; justify-content: center; border-radius: 12px; }
.detail-icon { font-size: 64px; }

@media (max-width: 1200px) {
  .game-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 900px) {
  .game-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
