<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>内容管理中心</h1>
      <n-space>
        <n-input placeholder="搜索游戏/内容..." size="small" style="width: 200px;">
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
        <n-button type="primary">+ 添加游戏</n-button>
      </n-space>
    </div>

    <!-- 内容统计 -->
    <div class="stats-row">
      <div class="stat-card">
        <n-icon :component="GameControllerOutline" size="24" color="#3B82F6" />
        <div><span class="num">48</span><span class="label">游戏总数</span></div>
      </div>
      <div class="stat-card">
        <n-icon :component="CloudUploadOutline" size="24" color="#10B981" />
        <div><span class="num">126</span><span class="label">分发门店</span></div>
      </div>
      <div class="stat-card">
        <n-icon :component="EyeOutline" size="24" color="#F59E0B" />
        <div><span class="num">2.8M</span><span class="label">累计体验</span></div>
      </div>
      <div class="stat-card">
        <n-icon :component="StarOutline" size="24" color="#8B5CF6" />
        <div><span class="num">4.8</span><span class="label">平均评分</span></div>
      </div>
    </div>

    <!-- Tab切换 -->
    <n-tabs type="line" animated v-model:value="activeTab">
      <!-- 游戏库 -->
      <n-tab-pane name="games" tab="🎮 游戏库">
        <div class="tab-content">
          <n-grid :cols="4" :x-gap="20" :y-gap="20">
            <n-gi v-for="game in games" :key="game.id">
              <div class="game-card" :class="{ disabled: game.status === 'offline' }">
                <div class="game-cover" :style="{ background: game.gradient }">
                  <span class="game-icon">{{ game.icon }}</span>
                  <div class="game-badge" :class="game.status">{{ game.statusText }}</div>
                </div>
                <div class="game-info">
                  <h4>{{ game.name }}</h4>
                  <div class="game-meta">
                    <span>🕐 {{ game.duration }}分钟</span>
                    <span>👥 {{ game.playCount }}</span>
                  </div>
                  <div class="game-rating">
                    <n-rate :value="game.rating" size="small" readonly />
                    <span>{{ game.rating }}</span>
                  </div>
                  <div class="game-actions">
                    <n-button size="tiny" secondary @click="editGame(game)">编辑</n-button>
                    <n-button size="tiny" secondary @click="distributeGame(game)">分发</n-button>
                  </div>
                </div>
              </div>
            </n-gi>
          </n-grid>
        </div>
      </n-tab-pane>

      <!-- 内容分发 -->
      <n-tab-pane name="distribute" tab="📤 内容分发">
        <div class="tab-content">
          <div class="distribute-header">
            <n-select placeholder="选择游戏" :options="gameOptions" style="width: 200px;" />
            <n-select placeholder="选择区域" :options="regionOptions" multiple style="width: 280px;" />
            <n-button type="primary">批量分发</n-button>
          </div>

          <div class="section-card">
            <div class="section-header">
              <h3>分发记录</h3>
            </div>
            <n-data-table :columns="distributeColumns" :data="distributeData" :pagination="{ pageSize: 10 }" striped />
          </div>
        </div>
      </n-tab-pane>

      <!-- 审核管理 -->
      <n-tab-pane name="review" tab="✅ 审核管理">
        <div class="tab-content">
          <n-grid :cols="3" :x-gap="20" :y-gap="20" style="margin-bottom: 20px;">
            <n-gi>
              <div class="stat-card warning"><span class="label">待审核</span><span class="value">8</span></div>
            </n-gi>
            <n-gi>
              <div class="stat-card success"><span class="label">今日通过</span><span class="value">15</span></div>
            </n-gi>
            <n-gi>
              <div class="stat-card error"><span class="label">今日驳回</span><span class="value">3</span></div>
            </n-gi>
          </n-grid>

          <div class="section-card">
            <div class="section-header">
              <h3>待审核列表</h3>
              <n-space>
                <n-select placeholder="审核类型" :options="reviewTypeOptions" style="width: 120px;" />
                <n-button size="small" @click="batchApprove">批量通过</n-button>
              </n-space>
            </div>
            <n-data-table :columns="reviewColumns" :data="reviewData" :pagination="{ pageSize: 10 }" striped />
          </div>
        </div>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import {
  NButton, NIcon, NSpace, NTabs, NTabPane, NGrid, NGi,
  NDataTable, NTag, NInput, NSelect, NRate
} from 'naive-ui'
import {
  SearchOutline, GameControllerOutline, CloudUploadOutline,
  EyeOutline, StarOutline
} from '@vicons/ionicons5'

const activeTab = ref('games')

const games = ref([
  { id: 1, name: '过山车VR', icon: '🎢', duration: 10, playCount: '15.8k', rating: 4.9, gradient: 'linear-gradient(135deg, #667eea, #764ba2)', status: 'online', statusText: '已上线' },
  { id: 2, name: '恐怖医院', icon: '🏥', duration: 15, playCount: '12.3k', rating: 4.7, gradient: 'linear-gradient(135deg, #f093fb, #f5576c)', status: 'online', statusText: '已上线' },
  { id: 3, name: '极速赛车', icon: '🏎️', duration: 8, playCount: '10.5k', rating: 4.8, gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)', status: 'online', statusText: '已上线' },
  { id: 4, name: '海洋世界', icon: '🐳', duration: 20, playCount: '8.9k', rating: 4.6, gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)', status: 'online', statusText: '已上线' },
  { id: 5, name: '恐龙王国', icon: '🦖', duration: 12, playCount: '7.2k', rating: 4.5, gradient: 'linear-gradient(135deg, #fa709a, #fee140)', status: 'pending', statusText: '待更新' },
  { id: 6, name: 'CS对战', icon: '🔫', duration: 30, playCount: '6.8k', rating: 4.8, gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)', status: 'online', statusText: '已上线' },
  { id: 7, name: '音乐节VR', icon: '🎵', duration: 25, playCount: '5.4k', rating: 4.4, gradient: 'linear-gradient(135deg, #ff9a9e, #fecfef)', status: 'offline', statusText: '已下架' },
  { id: 8, name: '太空漫步', icon: '🚀', duration: 18, playCount: '4.2k', rating: 4.3, gradient: 'linear-gradient(135deg, #0c3483, #a2b6df)', status: 'online', statusText: '已上线' },
])

const gameOptions = games.value.map(g => ({ label: g.name, value: g.id }))
const regionOptions = [
  { label: '深圳', value: 'sz' },
  { label: '广州', value: 'gz' },
  { label: '北京', value: 'bj' },
  { label: '上海', value: 'sh' },
]

const reviewTypeOptions = [
  { label: '全部', value: 'all' },
  { label: '新增游戏', value: 'new' },
  { label: '版本更新', value: 'update' },
  { label: '内容调整', value: 'modify' },
]

// 分发记录
const distributeColumns = [
  { title: '游戏名称', key: 'gameName' },
  { title: '分发门店', key: 'storeCount', render: (row: any) => `${row.storeCount} 家` },
  { title: '版本号', key: 'version' },
  { title: '分发状态', key: 'status', render: (row: any) => h(NTag, { type: row.status === 'done' ? 'success' : row.status === 'pending' ? 'warning' : 'error', size: 'small' }, () => row.statusText) },
  { title: '分发时间', key: 'time' },
  { title: '操作', key: 'action', render: () => h(NButton, { size: 'tiny', secondary: true }, () => '详情') },
]

const distributeData = [
  { gameName: '过山车VR', storeCount: 156, version: 'v2.3.1', status: 'done', statusText: '已完成', time: '2026-04-20 10:00' },
  { gameName: '恐怖医院', storeCount: 148, version: 'v1.8.5', status: 'done', statusText: '已完成', time: '2026-04-19 15:30' },
  { gameName: '极速赛车', storeCount: 142, version: 'v3.1.0', status: 'pending', statusText: '分发中', time: '2026-04-20 14:00' },
]

// 审核列表
const reviewColumns = [
  { title: '提交方', key: 'submitter' },
  { title: '游戏名称', key: 'gameName' },
  { title: '类型', key: 'type', render: (row: any) => h(NTag, { type: row.type === 'new' ? 'info' : 'warning', size: 'small' }, () => row.typeText) },
  { title: '版本', key: 'version' },
  { title: '提交时间', key: 'submitTime' },
  { title: '状态', key: 'status', render: (row: any) => h(NTag, { type: 'warning', size: 'small' }, () => '待审核') },
  { title: '操作', key: 'action', render: () => h(NSpace, null, { default: () => [h(NButton, { size: 'tiny', type: 'primary' }, () => '通过'), h(NButton, { size: 'tiny', type: 'error', secondary: true }, () => '驳回')] }) },
]

const reviewData = [
  { submitter: '深圳福田旗舰店', gameName: '丛林探险', type: 'new', typeText: '新增游戏', version: 'v1.0.0', submitTime: '2026-04-20 14:30' },
  { submitter: '南山科技园店', gameName: '过山车VR', type: 'update', typeText: '版本更新', version: 'v2.4.0', submitTime: '2026-04-20 13:45' },
  { submitter: '广州天河店', gameName: '极速赛车', type: 'modify', typeText: '内容调整', version: 'v3.0.5', submitTime: '2026-04-20 11:20' },
]

function editGame(game: any) { console.log('编辑', game) }
function distributeGame(game: any) { console.log('分发', game) }
function batchApprove() { console.log('批量通过') }
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); }

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: white; border-radius: 14px; padding: 20px; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 16px; }
.stat-card .num { font-family: 'Orbitron', sans-serif; font-size: 24px; font-weight: 700; color: var(--text-primary); display: block; }
.stat-card .label { font-size: 12px; color: var(--text-muted); margin-left: 4px; }

.tab-content { padding-top: 16px; }

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
.game-rating { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-muted); margin-bottom: 10px; }
.game-actions { display: flex; gap: 8px; }

.distribute-header { display: flex; gap: 12px; margin-bottom: 20px; align-items: center; }

.section-card { background: white; border-radius: 16px; padding: 22px; border: 1px solid var(--border-color); }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-header h3 { font-size: 15px; font-weight: 600; color: var(--text-primary); }

.stat-card .label { font-size: 12px; color: var(--text-muted); display: block; }
.stat-card .value { font-family: 'Orbitron', sans-serif; font-size: 26px; font-weight: 700; color: var(--text-primary); display: block; margin: 8px 0; }
.stat-card.success { border-color: rgba(16,185,129,0.3); background: linear-gradient(180deg, rgba(16,185,129,0.05), white); }
.stat-card.warning { border-color: rgba(245,158,11,0.3); background: linear-gradient(180deg, rgba(245,158,11,0.05), white); }
.stat-card.error { border-color: rgba(239,68,68,0.3); background: linear-gradient(180deg, rgba(239,68,68,0.05), white); }
</style>
