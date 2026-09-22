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

    <!-- 紧凑游戏网格：一行两个 -->
    <div class="game-grid">
      <div v-for="game in filteredGames" :key="game.id" class="game-item" :class="{ disabled: game.status === 'offline' }">
        <div class="game-thumb" :style="{ background: game.gradient }">
          <span class="game-icon">{{ game.icon }}</span>
          <div class="game-badge" :class="game.status">{{ game.statusText }}</div>
        </div>
        <div class="game-item-main">
          <h4 class="game-name" :title="game.name">{{ game.name }}</h4>
          <div class="game-rating" v-if="game.rating">
            <n-rate :value="game.rating" size="small" readonly allow-half />
            <span>{{ game.rating }}</span>
          </div>
          <div class="game-bean">
            {{ game.gameBeanCost ? `${game.gameBeanCost} 豆/次` : '免费' }}
          </div>
          <div class="game-cats">
            <n-tag v-for="cat in (game.categories || []).map(c => categoryLabelMap[c] || c)" :key="cat" size="tiny" :bordered="false" class="sub-tag tag-category">{{ cat }}</n-tag>
          </div>
        </div>
        <div class="game-item-actions">
          <template v-for="act in getActions(game.status)" :key="act.key">
            <n-button size="tiny" :type="act.type" :secondary="act.secondary" @click="act.action(game)">
              {{ act.label }}
            </n-button>
          </template>
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
import { useRouter } from 'vue-router'
import { NButton, NInput, NSelect, NTag, NIcon, NSpace, NModal, NRate, useMessage } from 'naive-ui'
import { SearchOutline, AddOutline } from '@vicons/ionicons5'

const message = useMessage()
const router = useRouter()
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

const games = ref([
  { id: 1, name: '过山车VR', icon: '🎢', duration: 10, playCount: '15.8k', rating: 4.5, status: 'online', statusText: '已上线', updatedAt: '2026-05-20', gradient: 'linear-gradient(135deg, #667eea, #764ba2)', categories: ['scifi'], tags: ['刺激', '热门', '全年龄'], runPlatform: 'host', gameBeanCost: 20, gameType: 'standalone', payMode: 'multi' },
  { id: 2, name: '恐怖医院', icon: '🏥', duration: 15, playCount: '12.3k', rating: 4.2, status: 'online', statusText: '已上线', updatedAt: '2026-05-18', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)', categories: ['horror'], tags: ['恐怖', '成人', '沉浸'], runPlatform: 'allInOne', gameBeanCost: 25, gameType: 'standalone', payMode: 'multi' },
  { id: 3, name: '深海探险VR', icon: '🌊', duration: 20, playCount: '-', rating: 0, status: 'pending', statusText: '审核中', updatedAt: '2026-05-28', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)', categories: ['ocean', 'family'], tags: ['科普', '亲子', '放松', '治愈'], runPlatform: 'allInOne', gameBeanCost: 30, gameType: 'online', payMode: 'single' },
  { id: 4, name: '末日求生', icon: '🧟', duration: 12, playCount: '-', rating: 0, status: 'rejected', statusText: '审核不通过', updatedAt: '2026-05-27', gradient: 'linear-gradient(135deg, #fa709a, #fee140)', categories: ['horror'], tags: ['生存', '射击', '硬核'], runPlatform: 'host', gameBeanCost: 35, gameType: 'online', payMode: 'multi' },
  { id: 5, name: '极速赛车', icon: '🏎️', duration: 8, playCount: '10.5k', rating: 4.6, status: 'online', statusText: '已上线', updatedAt: '2026-05-15', gradient: 'linear-gradient(135deg, #30cfd0, #330867)', categories: ['extreme'], tags: ['热门', '竞技', '刺激'], runPlatform: 'allInOne', gameBeanCost: 15, gameType: 'online', payMode: 'multi' },
  { id: 6, name: '赛博朋克2079', icon: '🤖', duration: 30, playCount: '-', rating: 0, status: 'draft', statusText: '草稿', updatedAt: '2026-05-29', gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)', categories: ['scifi'], tags: ['科幻', '开放世界', '未来'], runPlatform: 'host', gameBeanCost: 40, gameType: 'standalone', payMode: 'single' },
  { id: 7, name: '海洋世界', icon: '🐠', duration: 25, playCount: '8.2k', rating: 4.3, status: 'offline', statusText: '已下架', updatedAt: '2026-04-10', gradient: 'linear-gradient(135deg, #89f7fe, #66a6ff)', categories: ['ocean', 'family'], tags: ['科普', '亲子', '放松'], runPlatform: 'allInOne', gameBeanCost: 18, gameType: 'online', payMode: 'multi' },
  { id: 8, name: '恐龙王国', icon: '🦖', duration: 22, playCount: '6.5k', rating: 4.1, status: 'online', statusText: '已上线', updatedAt: '2026-05-22', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)', categories: ['family', 'ocean'], tags: ['冒险', '亲子', '科普'], runPlatform: 'allInOne', gameBeanCost: 22, gameType: 'standalone', payMode: 'single' },
])

const categoryLabelMap: Record<string, string> = {
  scifi: '科幻冒险',
  extreme: '极限运动',
  ocean: '海洋探索',
  family: '亲子娱乐',
  horror: '恐怖惊悚',
  rhythm: '音乐节奏',
}

const filteredGames = computed(() => {
  let data = [...games.value]
  if (searchText.value) data = data.filter(g => g.name.includes(searchText.value))
  if (filterStatus.value) data = data.filter(g => g.status === filterStatus.value)
  return data
})

function getActions(status: string) {
  const actions: Record<string, any[]> = {
    online: [
      { key: 'detail', label: '详情', type: 'default' as const, secondary: true, action: (g: any) => router.push(`/cp/games/${g.id}`) },
      { key: 'data', label: '数据', type: 'default' as const, secondary: true, action: (g: any) => router.push(`/cp/games/${g.id}/data`) },
      { key: 'update', label: '更新版本', type: 'primary' as const, secondary: false, action: (g: any) => router.push(`/cp/games/${g.id}?mode=update`) },
    ],
    pending: [
      { key: 'detail', label: '详情', type: 'default' as const, secondary: true, action: (g: any) => router.push(`/cp/games/${g.id}`) },
      { key: 'revoke', label: '撤回', type: 'error' as const, secondary: true, action: (g: any) => revokeReview(g) },
    ],
    rejected: [
      { key: 'reason', label: '查看原因', type: 'default' as const, secondary: true, action: (g: any) => viewReason(g) },
      { key: 'edit', label: '编辑资料', type: 'primary' as const, secondary: false, action: (g: any) => router.push(`/cp/games/${g.id}`) },
    ],
    draft: [
      { key: 'detail', label: '详情', type: 'default' as const, secondary: true, action: (g: any) => router.push(`/cp/games/${g.id}`) },
      { key: 'edit', label: '编辑资料', type: 'primary' as const, secondary: false, action: (g: any) => router.push(`/cp/games/${g.id}`) },
      { key: 'submit', label: '提交审核', type: 'success' as const, secondary: false, action: (g: any) => submitReview(g) },
      { key: 'delete', label: '删除', type: 'error' as const, secondary: true, action: (g: any) => openDelete(g) },
    ],
    offline: [
      { key: 'detail', label: '详情', type: 'default' as const, secondary: true, action: (g: any) => router.push(`/cp/games/${g.id}`) },
      { key: 'data', label: '数据', type: 'default' as const, secondary: true, action: (g: any) => router.push(`/cp/games/${g.id}/data`) },
      { key: 'resubmit', label: '重新提交', type: 'warning' as const, secondary: false, action: (g: any) => resubmit(g) },
    ],
  }
  return actions[status] || []
}

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

/* 紧凑游戏网格：一行两个 */
.game-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.game-item { display: flex; gap: 14px; background: white; border-radius: 12px; border: 1px solid var(--border-color); padding: 12px; transition: border-color .2s, box-shadow .2s; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
.game-item:hover { border-color: #c7d2fe; box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
.game-item.disabled { opacity: 0.55; }
.game-thumb { width: 84px; height: 112px; border-radius: 8px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
.game-thumb .game-icon { font-size: 32px; }
.game-item-main { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; gap: 6px; }
.game-name { font-size: 14px; font-weight: 600; color: var(--text-primary); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.game-rating { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-muted); }
.game-bean { font-size: 12px; color: #b45309; font-weight: 600; }
.game-cats { display: flex; gap: 4px; flex-wrap: wrap; }
.game-item-actions { display: flex; flex-direction: column; justify-content: center; gap: 6px; flex-shrink: 0; }
.game-item-actions .n-button { justify-content: center; }

.game-badge { position: absolute; top: 10px; right: 10px; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; color: white; }
.game-badge.online { background: rgba(16,185,129,0.9); }
.game-badge.draft { background: rgba(107,114,128,0.9); }
.game-badge.pending { background: rgba(245,158,11,0.9); }
.game-badge.offline { background: rgba(100,116,139,0.9); }
.game-badge.rejected { background: rgba(239,68,68,0.9); }
.game-icon { font-size: 48px; }

.sub-tag { display: inline-block; padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: 500; background: #f0f0f0; color: #666; }
.sub-tag.tag-category { background: #eff6ff; color: #1d4ed8; }

.empty-state { text-align: center; padding: 48px 0; color: var(--text-muted); font-size: 14px; grid-column: 1 / -1; }

@media (max-width: 900px) {
  .game-grid { grid-template-columns: 1fr; }
}
</style>
