<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>我的游戏</h1>
        <p class="header-desc">管理已提交的游戏内容</p>
      </div>
      <n-space>
        <n-input v-model:value="searchText" placeholder="搜索游戏名称..." size="small" style="width: 200px;">
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
        <n-select v-model:value="filterStatus" placeholder="全部状态" :options="statusOptions" size="small" style="width: 130px;" clearable />
        <n-button type="primary" @click="$router.push('/cp/games/add')">
          <template #icon><n-icon :component="AddOutline" /></template> 上传新游戏
        </n-button>
      </n-space>
    </div>

    <div class="game-grid">
      <div v-for="game in filteredGames" :key="game.id" class="game-card" :class="{ dimmed: game.status === 'offline' }">
        <div class="game-cover" :style="{ background: game.gradient }">
          <span class="game-icon">{{ game.icon }}</span>
          <n-tag :type="statusType(game.status)" size="tiny" class="status-badge" bordered>
            {{ game.statusText }}
          </n-tag>
        </div>
        <div class="game-info">
          <h4 class="game-name">{{ game.name }}</h4>
          <div class="game-meta">
            <span>📦 v{{ game.version }}</span>
            <span>🎮 {{ game.plays }}</span>
          </div>
          <div class="game-update">更新 {{ game.updatedAt }}</div>
          <div class="game-actions">
            <template v-for="act in getActions(game.status)" :key="act.key">
              <n-button size="tiny" :type="act.type" :secondary="act.secondary" @click="act.action(game)">
                {{ act.label }}
              </n-button>
            </template>
          </div>
        </div>
      </div>
      <div v-if="!filteredGames.length" class="empty-state">暂无游戏，快去上传吧</div>
    </div>

    <!-- 删除确认 -->
    <n-modal v-model:show="showDeleteModal" preset="dialog" title="确认删除" positive-text="删除" negative-text="取消" type="error"
      :content="`确定要删除「${deleteTarget?.name}」吗？此操作不可撤销。`"
      @positive-click="confirmDelete" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NButton, NInput, NSelect, NTag, NIcon, NSpace, NModal, useMessage } from 'naive-ui'
import { SearchOutline, AddOutline } from '@vicons/ionicons5'

const message = useMessage()
const searchText = ref('')
const filterStatus = ref<string | null>(null)

const statusOptions = [
  { label: '全部', value: '' },
  { label: '已上线', value: 'online' },
  { label: '审核中', value: 'pending' },
  { label: '审核不通过', value: 'rejected' },
  { label: '草稿', value: 'draft' },
  { label: '已下架', value: 'offline' },
]

function statusType(status: string) {
  const m: Record<string, string> = { online: 'success', pending: 'warning', rejected: 'error', draft: 'default', offline: 'default' }
  return m[status] || 'default'
}

const games = ref([
  { id: 1, name: '过山车VR', icon: '🎢', version: '2.3.2', plays: '15.8K次', revenue: 125000, status: 'online', statusText: '已上线', updatedAt: '2026-05-20', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
  { id: 2, name: '恐怖医院', icon: '🏥', version: '1.8.5', plays: '12.3K次', revenue: 98000, status: 'online', statusText: '已上线', updatedAt: '2026-05-18', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)' },
  { id: 3, name: '深海探险VR', icon: '🌊', version: '1.0.0', plays: '-', revenue: 0, status: 'pending', statusText: '审核中', updatedAt: '2026-05-28', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
  { id: 4, name: '末日求生', icon: '🧟', version: '0.9.1', plays: '-', revenue: 0, status: 'rejected', statusText: '审核不通过', updatedAt: '2026-05-27', gradient: 'linear-gradient(135deg, #fa709a, #fee140)' },
  { id: 5, name: '极速赛车', icon: '🏎️', version: '3.1.0', plays: '10.5K次', revenue: 85000, status: 'online', statusText: '已上线', updatedAt: '2026-05-15', gradient: 'linear-gradient(135deg, #30cfd0, #330867)' },
  { id: 6, name: '赛博朋克2079', icon: '🤖', version: '0.5.0', plays: '-', revenue: 0, status: 'draft', statusText: '草稿', updatedAt: '2026-05-29', gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)' },
  { id: 7, name: '海洋世界', icon: '🐠', version: '2.0.2', plays: '8.2K次', revenue: 62000, status: 'offline', statusText: '已下架', updatedAt: '2026-04-10', gradient: 'linear-gradient(135deg, #89f7fe, #66a6ff)' },
])

const filteredGames = computed(() => {
  let data = [...games.value]
  if (searchText.value) data = data.filter(g => g.name.includes(searchText.value))
  if (filterStatus.value) data = data.filter(g => g.status === filterStatus.value)
  return data
})

function getActions(status: string) {
  const router = useRouter()
  const actions: Record<string, any[]> = {
    online: [
      { key: 'data', label: '数据', type: 'default' as const, secondary: true, action: (g: any) => router.push(`/cp/games/${g.id}/data`) },
      { key: 'update', label: '提交更新', type: 'primary' as const, secondary: false, action: (g: any) => router.push(`/cp/games/${g.id}?mode=update`) },
    ],
    pending: [
      { key: 'view', label: '查看', type: 'default' as const, secondary: true, action: (g: any) => router.push(`/cp/games/${g.id}`) },
      { key: 'revoke', label: '撤回', type: 'error' as const, secondary: true, action: (g: any) => revokeReview(g) },
    ],
    rejected: [
      { key: 'reason', label: '查看原因', type: 'default' as const, secondary: true, action: (g: any) => viewReason(g) },
      { key: 'edit', label: '重新编辑', type: 'primary' as const, secondary: false, action: (g: any) => router.push(`/cp/games/${g.id}`) },
    ],
    draft: [
      { key: 'edit', label: '编辑', type: 'primary' as const, secondary: false, action: (g: any) => router.push(`/cp/games/${g.id}`) },
      { key: 'submit', label: '提交审核', type: 'success' as const, secondary: false, action: (g: any) => submitReview(g) },
      { key: 'delete', label: '删除', type: 'error' as const, secondary: true, action: (g: any) => openDelete(g) },
    ],
    offline: [
      { key: 'data', label: '查看', type: 'default' as const, secondary: true, action: (g: any) => router.push(`/cp/games/${g.id}/data`) },
      { key: 'resubmit', label: '重新提交', type: 'warning' as const, secondary: false, action: (g: any) => resubmit(g) },
    ],
  }
  return actions[status] || []
}

import { useRouter } from 'vue-router'

const showDeleteModal = ref(false)
const deleteTarget = ref<any>(null)
function openDelete(game: any) { deleteTarget.value = game; showDeleteModal.value = true }
function confirmDelete() { message.success(`已删除「${deleteTarget.value?.name}」`); deleteTarget.value = null }

function submitReview(game: any) { game.status = 'pending'; game.statusText = '审核中'; message.success(`「${game.name}」已提交审核`) }
function revokeReview(game: any) { game.status = 'draft'; game.statusText = '草稿'; message.info(`已撤回「${game.name}」的审核`) }
function resubmit(game: any) { game.status = 'draft'; game.statusText = '草稿'; message.info(`「${game.name}」已转为草稿，请编辑后重新提交`) }
function viewReason(game: any) { message.warning(`「${game.name}」审核不通过原因：游戏描述与内容不符，请修改后重新提交`) }
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.header-desc { font-size: 13px; color: var(--text-muted); margin-top: 4px; }

.game-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.game-card { background: white; border-radius: 14px; border: 1px solid var(--border-color); overflow: hidden; transition: all 0.25s; }
.game-card:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.08); }
.game-card.dimmed { opacity: 0.6; }

.game-cover {
  aspect-ratio: 3 / 4; display: flex; align-items: center; justify-content: center;
  position: relative;
}
.game-icon { font-size: 48px; }
.status-badge { position: absolute; top: 10px; right: 10px; }

.game-info { padding: 16px; }
.game-name { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0 0 8px; }
.game-meta { display: flex; gap: 12px; font-size: 12px; color: var(--text-muted); margin-bottom: 4px; }
.game-update { font-size: 11px; color: var(--text-muted); margin-bottom: 12px; }
.game-actions { display: flex; gap: 6px; flex-wrap: wrap; }

.empty-state { text-align: center; padding: 48px 0; color: var(--text-muted); font-size: 14px; grid-column: 1 / -1; }
</style>
