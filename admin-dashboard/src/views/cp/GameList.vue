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
        <n-radio-group v-model:value="viewMode" size="small">
          <n-radio-button value="waterfall">瀑布流</n-radio-button>
          <n-radio-button value="list">列表</n-radio-button>
        </n-radio-group>
        <n-button type="primary" @click="$router.push('/cp/games/add')">
          <template #icon><n-icon :component="AddOutline" /></template> 上传新游戏
        </n-button>
      </n-space>
    </div>

    <div v-if="viewMode === 'waterfall'" class="game-waterfall">
      <div v-for="game in filteredGames" :key="game.id" class="waterfall-item">
        <div class="game-card" :class="{ dimmed: game.status === 'offline' }">
          <div class="game-cover" :style="{ background: game.gradient }">
            <span class="game-icon">{{ game.icon }}</span>
            <div class="game-badge" :class="game.status">{{ game.statusText }}</div>
          </div>
          <div class="game-info">
            <div class="game-title-row">
              <h4>{{ game.name }}</h4>
            </div>
            <div class="game-meta">
              <span class="meta-time">🕐 {{ game.duration }}分</span>
              <span>🎮 {{ game.playCount }}人玩</span>
              <span>🫘 {{ game.gameBeanCost ? `${game.gameBeanCost}豆/次` : '免费' }}</span>
            </div>
            <div class="game-meta-sub">
              <span class="sub-tag" :class="game.runPlatform === 'allInOne' ? 'tag-allinone' : 'tag-host'">
                {{ game.runPlatform === 'allInOne' ? '一体机' : '主机' }}
              </span>
              <span class="sub-tag" :class="game.gameType === 'online' ? 'tag-online' : 'tag-standalone'">
                {{ game.gameType === 'online' ? '联机' : '单机' }}
              </span>
              <span class="sub-tag" :class="game.payMode === 'multi' ? 'tag-multi' : 'tag-single'">
                {{ game.payMode === 'multi' ? '多人' : '单人' }}
              </span>
            </div>
            <div class="game-tags waterfall-tags">
              <n-tag v-for="cat in (game.categories || []).map(c => categoryLabelMap[c] || c)" :key="'wf-cat-'+cat" size="tiny" :bordered="false" class="sub-tag tag-category">{{ cat }}</n-tag>
              <n-tag v-for="tag in getWaterfallTags(game).tags" :key="tag" size="tiny" :bordered="false" class="sub-tag tag-custom">{{ tag }}</n-tag>
              <n-tag v-if="getWaterfallTags(game).overflow" size="tiny" :bordered="false" class="sub-tag more-tag" @click="$router.push(`/cp/games/${game.id}`)">更多</n-tag>
            </div>
            <div class="game-update">更新于 {{ game.updatedAt }}</div>
            <div class="game-actions">
              <template v-for="act in getActions(game.status)" :key="act.key">
                <n-button size="tiny" :type="act.type" :secondary="act.secondary" @click="act.action(game)">
                  {{ act.label }}
                </n-button>
              </template>
            </div>
          </div>
        </div>
      </div>
      <div v-if="!filteredGames.length" class="empty-state">暂无游戏，快去上传吧</div>
    </div>

    <div v-else class="game-list">
      <div v-for="game in filteredGames" :key="game.id" class="game-list-card" :class="{ dimmed: game.status === 'offline' }">
        <div class="list-cover" :style="{ background: game.gradient }">
          <span class="game-icon">{{ game.icon }}</span>
          <div class="game-badge" :class="game.status">{{ game.statusText }}</div>
        </div>
        <div class="list-main">
          <h4 class="game-name">{{ game.name }}</h4>
          <div class="game-meta">
            <span>🕐 {{ game.duration }}分</span>
            <span>🎮 {{ game.playCount }}人玩</span>
            <span>🫘 {{ game.gameBeanCost ? `${game.gameBeanCost}豆/次` : '免费' }}</span>
          </div>
          <div class="game-meta-sub">
            <span class="sub-tag" :class="game.runPlatform === 'allInOne' ? 'tag-allinone' : 'tag-host'">
              {{ game.runPlatform === 'allInOne' ? '一体机' : '主机' }}
            </span>
            <span class="sub-tag" :class="game.gameType === 'online' ? 'tag-online' : 'tag-standalone'">
              {{ game.gameType === 'online' ? '联机' : '单机' }}
            </span>
            <span class="sub-tag" :class="game.payMode === 'multi' ? 'tag-multi' : 'tag-single'">
              {{ game.payMode === 'multi' ? '多人' : '单人' }}
            </span>
          </div>
          <div class="game-tags">
            <n-tag v-for="cat in (game.categories || []).map(c => categoryLabelMap[c] || c)" :key="'cat-'+cat" size="tiny" :bordered="false" class="sub-tag tag-category">{{ cat }}</n-tag>
            <n-tag v-for="tag in game.tags" :key="tag" size="tiny" :bordered="false" class="sub-tag tag-custom">{{ tag }}</n-tag>
          </div>
          <div class="game-update">更新于 {{ game.updatedAt }}</div>
        </div>
        <div class="list-actions">
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
import { NButton, NInput, NSelect, NTag, NIcon, NSpace, NModal, useMessage, NRadioGroup, NRadioButton } from 'naive-ui'
import { SearchOutline, AddOutline } from '@vicons/ionicons5'

const message = useMessage()
const searchText = ref('')
const filterStatus = ref<string | null>(null)
const viewMode = ref<'waterfall' | 'list'>('waterfall')

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
  { id: 1, name: '过山车VR', icon: '🎢', duration: 10, playCount: '15.8k', rating: 4.5, sortOrder: 1, status: 'online', statusText: '已上线', updatedAt: '2026-05-20', gradient: 'linear-gradient(135deg, #667eea, #764ba2)', categories: ['scifi'], tags: ['刺激', '热门', '全年龄'], runPlatform: 'host', gameBeanCost: 20, gameType: 'standalone', payMode: 'multi' },
  { id: 2, name: '恐怖医院', icon: '🏥', duration: 15, playCount: '12.3k', rating: 4.2, sortOrder: 2, status: 'online', statusText: '已上线', updatedAt: '2026-05-18', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)', categories: ['horror'], tags: ['恐怖', '成人', '沉浸'], runPlatform: 'allInOne', gameBeanCost: 25, gameType: 'standalone', payMode: 'multi' },
  { id: 3, name: '深海探险VR', icon: '🌊', duration: 20, playCount: '-', rating: 0, sortOrder: 3, status: 'pending', statusText: '审核中', updatedAt: '2026-05-28', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)', categories: ['ocean', 'family'], tags: ['科普', '亲子', '放松', '治愈'], runPlatform: 'allInOne', gameBeanCost: 30, gameType: 'online', payMode: 'single' },
  { id: 4, name: '末日求生', icon: '🧟', duration: 12, playCount: '-', rating: 0, sortOrder: 4, status: 'rejected', statusText: '审核不通过', updatedAt: '2026-05-27', gradient: 'linear-gradient(135deg, #fa709a, #fee140)', categories: ['horror'], tags: ['生存', '射击', '硬核'], runPlatform: 'host', gameBeanCost: 35, gameType: 'online', payMode: 'multi' },
  { id: 5, name: '极速赛车', icon: '🏎️', duration: 8, playCount: '10.5k', rating: 4.6, sortOrder: 5, status: 'online', statusText: '已上线', updatedAt: '2026-05-15', gradient: 'linear-gradient(135deg, #30cfd0, #330867)', categories: ['extreme'], tags: ['热门', '竞技', '刺激'], runPlatform: 'allInOne', gameBeanCost: 15, gameType: 'online', payMode: 'multi' },
  { id: 6, name: '赛博朋克2079', icon: '🤖', duration: 30, playCount: '-', rating: 0, sortOrder: 6, status: 'draft', statusText: '草稿', updatedAt: '2026-05-29', gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)', categories: ['scifi'], tags: ['科幻', '开放世界', '未来'], runPlatform: 'host', gameBeanCost: 40, gameType: 'standalone', payMode: 'single' },
  { id: 7, name: '海洋世界', icon: '🐠', duration: 25, playCount: '8.2k', rating: 4.3, sortOrder: 7, status: 'offline', statusText: '已下架', updatedAt: '2026-04-10', gradient: 'linear-gradient(135deg, #89f7fe, #66a6ff)', categories: ['ocean', 'family'], tags: ['科普', '亲子', '放松'], runPlatform: 'allInOne', gameBeanCost: 18, gameType: 'online', payMode: 'multi' },
  { id: 8, name: '恐龙王国', icon: '🦖', duration: 22, playCount: '6.5k', rating: 4.1, sortOrder: 8, status: 'online', statusText: '已上线', updatedAt: '2026-05-22', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)', categories: ['family', 'ocean'], tags: ['冒险', '亲子', '科普'], runPlatform: 'allInOne', gameBeanCost: 22, gameType: 'standalone', payMode: 'single' },
])

function getWaterfallTags(game: any) {
  const catLabels = (game.categories || []).map((c: string) => categoryLabelMap[c] || c)
  const catChars = catLabels.reduce((sum: number, c: string) => sum + c.length, 0)
  const maxChars = 14
  const remaining = maxChars - catChars
  if (remaining <= 0) return { tags: [] as string[], overflow: game.tags.length > 0 }
  let used = 0
  const visible: string[] = []
  for (const tag of game.tags) {
    if (used + tag.length <= remaining) {
      visible.push(tag)
      used += tag.length
    } else {
      visible.pop()
      return { tags: visible, overflow: true }
    }
  }
  return { tags: visible, overflow: false }
}

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
  const router = useRouter()
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

.game-waterfall { display: grid; grid-template-columns: repeat(auto-fill, 250px); gap: 20px; justify-content: start; }
.waterfall-item { min-width: 0; }
.game-list { display: flex; flex-direction: column; gap: 16px; }
.game-card { background: white; border-radius: 14px; border: 1px solid var(--border-color); transition: all 0.25s; }
.game-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.1); }
.game-card.dimmed { opacity: 0.6; }
.game-list-card { display: grid; grid-template-columns: 132px minmax(0, 1fr) 170px; gap: 18px; align-items: center; background: white; border-radius: 14px; border: 1px solid var(--border-color); padding: 16px; transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.game-list-card:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(0,0,0,0.10); border-color: #c7d2fe; }
.game-list-card.dimmed { opacity: 0.55; }

.game-cover { aspect-ratio: 3 / 4; display: flex; align-items: center; justify-content: center; position: relative; border-radius: 14px 14px 0 0; overflow: hidden; }
.list-cover { aspect-ratio: 3 / 4; border-radius: 12px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
.game-icon { font-size: 48px; }
.game-badge { position: absolute; top: 10px; right: 10px; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; color: white; }
.game-badge.online { background: rgba(16,185,129,0.9); }
.game-badge.draft { background: rgba(107,114,128,0.9); }
.game-badge.pending { background: rgba(245,158,11,0.9); }
.game-badge.offline { background: rgba(100,116,139,0.9); }
.game-badge.rejected { background: rgba(239,68,68,0.9); }

.game-info { padding: 14px; }
.list-main { min-width: 0; display: flex; flex-direction: column; justify-content: center; }
.list-actions { display: flex; flex-direction: column; justify-content: center; gap: 8px; }
.game-title-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.game-title-row h4 { font-size: 14px; font-weight: 600; color: var(--text-primary); margin: 0; flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.4; }
.game-name { font-size: 14px; font-weight: 600; color: var(--text-primary); margin: 0 0 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.game-meta { display: flex; gap: 8px; font-size: 11px; color: var(--text-muted); margin-bottom: 8px; flex-wrap: wrap; }
.game-meta span { white-space: nowrap; }
.meta-time { color: #6366f1; font-weight: 500; }
.game-meta-sub { display: flex; gap: 5px; flex-wrap: nowrap; margin-bottom: 8px; overflow: hidden; }
.sub-tag { display: inline-block; padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: 500; background: #f0f0f0; color: #666; }
.more-tag { cursor: pointer; }
.sub-tag.tag-host { background: #e8f4fd; color: #0284c7; }
.sub-tag.tag-allinone { background: #f0fdf4; color: #15803d; }
.sub-tag.tag-standalone { background: #fef3c7; color: #b45309; }
.sub-tag.tag-online { background: #fdf2f8; color: #be185d; }
.sub-tag.tag-single { background: #f0fdf4; color: #15803d; }
.sub-tag.tag-multi { background: #fdf2f8; color: #be185d; }
.sub-tag.tag-category { background: #eff6ff; color: #1d4ed8; }
.sub-tag.tag-custom { background: #fff7ed; color: #c2410c; }
.game-tags { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; margin-bottom: 10px; }
.waterfall-tags { flex-wrap: nowrap; }
.game-update { font-size: 10px; color: var(--text-muted); margin-bottom: 10px; }
.game-actions { display: flex; gap: 6px; flex-wrap: wrap; }

.empty-state { text-align: center; padding: 48px 0; color: var(--text-muted); font-size: 14px; grid-column: 1 / -1; }

@media (max-width: 1100px) {
  .game-list-card { grid-template-columns: 120px minmax(0, 1fr); }
  .list-actions { grid-column: 1 / -1; flex-direction: row; justify-content: flex-start; }
}

@media (max-width: 720px) {
  .game-list-card { grid-template-columns: 1fr; }
  .list-cover { max-width: 160px; }
  .list-actions { grid-column: auto; }
}
</style>
