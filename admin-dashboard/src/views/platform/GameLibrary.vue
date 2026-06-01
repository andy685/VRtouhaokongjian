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
        <n-select v-model:value="filterCp" :options="cpOptions" placeholder="全部供应商" size="small" style="width: 140px;" clearable />
        <n-select v-model:value="sortField" :options="sortOptions" size="small" style="width: 140px;" />
        <n-button size="small" :type="sortAsc ? 'default' : 'primary'" secondary @click="sortAsc = !sortAsc">
          <template #icon><n-icon :component="sortAsc ? ArrowUpOutline : ArrowDownOutline" /></template>
        </n-button>
        <n-button type="primary" @click="$router.push('/platform/games/add')">
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
        <div class="stat-icon" style="background: linear-gradient(135deg, #6B7280, #4B5563);">
          <n-icon :component="PencilOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">草稿</span>
          <span class="value muted">3</span>
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
          <div v-if="game.recommended" class="rec-badge">推荐</div>
          <div class="cover-hover-actions">
            <n-button size="tiny" :type="game.recommended ? 'warning' : 'default'" dashed @click.stop="toggleRecommend(game)" class="quick-rec-btn">
              {{ game.recommended ? '取消推荐' : '设为推荐' }}
            </n-button>
          </div>
        </div>
        <div class="game-info">
          <div class="game-title-row">
            <h4>{{ game.name }}</h4>
            <span class="sort-order">#{{ game.sortOrder }}</span>
          </div>
          <div class="game-meta">
            <span>🕐 {{ game.duration }}分钟</span>
            <span>🎮 {{ game.playCount }}次体验</span>
            <span v-if="game.gameBeanCost">🫘 {{ game.gameBeanCost }}豆/次</span>
            <span class="cp-tag">{{ game.cpName }}</span>
          </div>
          <div class="game-rating">
            <n-rate :value="game.rating" size="small" readonly />
            <span>{{ game.rating }}</span>
          </div>
          <div class="game-meta-sub">
            <span class="sub-tag" :class="game.runPlatform === 'allInOne' ? 'tag-allinone' : 'tag-host'">
              {{ game.runPlatform === 'allInOne' ? '🥽 头显一体机' : '🖥️ 主机游戏' }}
            </span>
            <span class="sub-tag" :class="game.gameType === 'online' ? 'tag-online' : 'tag-standalone'">
              {{ game.gameType === 'online' ? '🌐 联机游戏' : '💿 单机游戏' }}
            </span>
            <span class="sub-tag" :class="game.payMode === 'multi' ? 'tag-multi' : 'tag-single'">
              {{ game.payMode === 'multi' ? '👥 多人付费' : '👤 单人付费' }}
            </span>
            <span v-if="game.timeLimitEnabled" class="sub-tag tag-time">⏱ {{ game.timeLimitMinutes }}分钟限制</span>
          </div>
          <div class="game-tags">
            <n-tag v-for="tag in game.tags" :key="tag" size="tiny" bordered>{{ tag }}</n-tag>
          </div>
          <div class="game-actions">
            <n-button size="tiny" quaternary @click="$router.push(`/platform/games/${game.id}`)">详情</n-button>
            <n-button size="tiny" type="primary" secondary @click="$router.push(`/platform/games/${game.id}?edit=1`)">编辑</n-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  NButton, NInput, NSelect, NTag, NRate, NIcon, NSpace, useMessage
} from 'naive-ui'
import {
  SearchOutline, AddOutline, GameControllerOutline, CheckmarkCircleOutline,
  PencilOutline, EyeOutline, ArrowUpOutline, ArrowDownOutline
} from '@vicons/ionicons5'

const message = useMessage()
const searchText = ref('')
const filterStatus = ref<string | null>(null)
const filterCp = ref<string | null>(null)
const sortField = ref('sortOrder')
const sortAsc = ref(true)

const cpOptions = [
  { label: '极境互动科技', value: '极境互动科技' },
  { label: '闪耀游戏工作室', value: '闪耀游戏工作室' },
  { label: '乐游网络', value: '乐游网络' },
  { label: '星际科技', value: '星际科技' },
  { label: '未来幻境', value: '未来幻境' },
  { label: '幻视科技', value: '幻视科技' },
  { label: '星辰游戏', value: '星辰游戏' },
]

const sortOptions = [
  { label: '排序号', value: 'sortOrder' },
  { label: '游戏名称', value: 'name' },
  { label: '体验次数', value: 'playCountNum' },
  { label: '评分', value: 'rating' },
  { label: '上架时间', value: 'id' },
]

const statusOptions = [
  { label: '全部', value: null },
  { label: '已上线', value: 'online' },
  { label: '草稿', value: 'draft' },
  { label: '待审核', value: 'pending' },
  { label: '已下架', value: 'offline' },
]

const games = ref([
  { id: 1, name: '过山车VR', icon: '🎢', duration: 10, playCount: '15.8k', playCountNum: 15800, rating: 4.9, sortOrder: 1, recommended: true, gradient: 'linear-gradient(135deg, #667eea, #764ba2)', status: 'online', statusText: '已上线', tags: ['刺激', '热门', '全年龄'], runPlatform: 'host', gameBeanCost: 20, gameType: 'standalone', payMode: 'single', timeLimitEnabled: true, timeLimitMinutes: 10, cpName: '极境互动科技' },
  { id: 2, name: '恐怖医院', icon: '🏥', duration: 15, playCount: '12.3k', playCountNum: 12300, rating: 4.7, sortOrder: 3, recommended: true, gradient: 'linear-gradient(135deg, #f093fb, #f5576c)', status: 'online', statusText: '已上线', tags: ['恐怖', '成人', '沉浸'], runPlatform: 'host', gameBeanCost: 25, gameType: 'standalone', payMode: 'single', timeLimitEnabled: true, timeLimitMinutes: 15, cpName: '闪耀游戏工作室' },
  { id: 3, name: '极速赛车', icon: '🏎️', duration: 8, playCount: '10.5k', playCountNum: 10500, rating: 4.8, sortOrder: 2, recommended: false, gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)', status: 'online', statusText: '已上线', tags: ['竞速', '热门', '全年龄'], runPlatform: 'host', gameBeanCost: 15, gameType: 'standalone', payMode: 'single', timeLimitEnabled: true, timeLimitMinutes: 8, cpName: '乐游网络' },
  { id: 4, name: '海洋世界', icon: '🐳', duration: 20, playCount: '8.9k', playCountNum: 8900, rating: 4.6, sortOrder: 4, recommended: false, gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)', status: 'online', statusText: '已上线', tags: ['科普', '亲子', '放松'], runPlatform: 'allInOne', gameBeanCost: 10, gameType: 'standalone', payMode: 'single', timeLimitEnabled: false, timeLimitMinutes: 20, cpName: '星际科技' },
  { id: 5, name: '恐龙王国', icon: '🦖', duration: 12, playCount: '7.2k', playCountNum: 7200, rating: 4.5, sortOrder: 5, recommended: false, gradient: 'linear-gradient(135deg, #fa709a, #fee140)', status: 'draft', statusText: '草稿', tags: ['冒险', '亲子', '科普'], runPlatform: 'allInOne', gameBeanCost: 0, gameType: 'standalone', payMode: 'single', timeLimitEnabled: false, timeLimitMinutes: 12, cpName: '未来幻境' },
  { id: 6, name: 'CS对战', icon: '🔫', duration: 30, playCount: '6.8k', playCountNum: 6800, rating: 4.8, sortOrder: 6, recommended: false, gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)', status: 'online', statusText: '已上线', tags: ['射击', '多人', '竞技'], runPlatform: 'host', gameBeanCost: 35, gameType: 'standalone', payMode: 'multi', timeLimitEnabled: true, timeLimitMinutes: 30, cpName: '幻视科技' },
  { id: 7, name: '音乐节VR', icon: '🎵', duration: 25, playCount: '5.4k', playCountNum: 5400, rating: 4.4, sortOrder: 7, recommended: false, gradient: 'linear-gradient(135deg, #ff9a9e, #fecfef)', status: 'offline', statusText: '已下架', tags: ['音乐', '休闲', '放松'], runPlatform: 'allInOne', gameBeanCost: 0, gameType: 'online', payMode: 'single', timeLimitEnabled: false, timeLimitMinutes: 25, cpName: '极境互动科技' },
  { id: 8, name: '太空漫步', icon: '🚀', duration: 18, playCount: '4.2k', playCountNum: 4200, rating: 4.3, sortOrder: 8, recommended: false, gradient: 'linear-gradient(135deg, #0c3483, #a2b6df)', status: 'online', statusText: '已上线', tags: ['科幻', '探索', '沉浸'], runPlatform: 'allInOne', gameBeanCost: 18, gameType: 'online', payMode: 'multi', timeLimitEnabled: true, timeLimitMinutes: 18, cpName: '闪耀游戏工作室' },
])

function toggleRecommend(game: any) {
  game.recommended = !game.recommended
  message.success(game.recommended ? `「${game.name}」已设为推荐` : `「${game.name}」已取消推荐`)
}

const filteredGames = computed(() => {
  let data = [...games.value]
  if (searchText.value) {
    data = data.filter(g => g.name.includes(searchText.value))
  }
  if (filterStatus.value) {
    data = data.filter(g => g.status === filterStatus.value)
  }
  if (filterCp.value) {
    data = data.filter(g => g.cpName === filterCp.value)
  }
  // Sort: recommended always first, then by selected field
  data.sort((a, b) => {
    if (a.recommended !== b.recommended) return a.recommended ? -1 : 1
    const dir = sortAsc.value ? 1 : -1
    const field = sortField.value as keyof typeof a
    const av = a[field], bv = b[field]
    if (typeof av === 'string' && typeof bv === 'string') return dir * av.localeCompare(bv)
    return dir * ((av as number) - (bv as number))
  })
  return data
})


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
.game-badge.draft { background: rgba(107,114,128,0.9); }
.game-badge.pending { background: rgba(245,158,11,0.9); }
.game-badge.offline { background: rgba(100,116,139,0.9); }

.game-info { padding: 14px; }
.game-title-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.game-info h4 { font-size: 14px; font-weight: 600; color: var(--text-primary); margin: 0; }
.sort-order { font-size: 11px; color: var(--text-muted); font-family: monospace; }
.rec-badge { position: absolute; top: 10px; left: 10px; background: #f59e0b; color: #fff; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 700; letter-spacing: 0.5px; box-shadow: 0 2px 6px rgba(245,158,11,0.4); }
.cover-hover-actions { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; background: rgba(0,0,0,0.5); }
.game-cover:hover .cover-hover-actions { opacity: 1; }
.quick-rec-btn { font-size: 11px; }
.game-meta { display: flex; gap: 12px; font-size: 12px; color: var(--text-muted); margin-bottom: 6px; flex-wrap: wrap; align-items: center; }
.cp-tag { font-size: 11px; color: #3B82F6; background: #EFF6FF; padding: 1px 8px; border-radius: 10px; font-weight: 500; white-space: nowrap; }
.game-meta-sub { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 6px; }
.sub-tag { display: inline-block; padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: 500; background: #f0f0f0; color: #666; }
.sub-tag.tag-host { background: #e8f4fd; color: #0284c7; }
.sub-tag.tag-allinone { background: #f0fdf4; color: #15803d; }
.sub-tag.tag-standalone { background: #fef3c7; color: #b45309; }
.sub-tag.tag-online { background: #fdf2f8; color: #be185d; }
.sub-tag.tag-single { background: #f0fdf4; color: #15803d; }
.sub-tag.tag-multi { background: #fdf2f8; color: #be185d; }
.sub-tag.tag-time { background: #f5f3ff; color: #6d28d9; }
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
