<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>游戏审核</h1>
        <p class="header-desc">审核供应商提交的游戏，设置定价与成本，自动结算</p>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="TimeOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">待审核</span>
          <span class="value warning">6</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="CheckmarkCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">本月通过</span>
          <span class="value">12</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #EF4444, #DC2626);">
          <n-icon :component="CloseCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">本月拒绝</span>
          <span class="value error">3</span>
        </div>
      </div>
    </div>

    <!-- Tab切换 -->
    <n-tabs v-model:value="activeTab" type="line" style="margin-top: 24px;">
      <!-- 待审核列表 -->
      <n-tab-pane name="pending" tab="待审核">
        <div class="content-card">
          <n-data-table :columns="pendingColumns" :data="pendingData" :pagination="pagination" striped />
        </div>
      </n-tab-pane>

      <!-- 已审核列表 -->
      <n-tab-pane name="reviewed" tab="已审核">
        <div class="content-card">
          <div class="section-header">
            <n-space>
              <n-select v-model:value="reviewFilter" placeholder="审核结果" :options="reviewResultOptions" size="small" style="width: 140px;" clearable />
              <n-button size="small" secondary>刷新</n-button>
            </n-space>
          </div>
          <n-data-table :columns="reviewedColumns" :data="filteredReviewedData" :pagination="pagination" striped />
        </div>
      </n-tab-pane>

    </n-tabs>

    <!-- 审核弹窗 -->
    <n-modal v-model:show="showReviewModal" preset="card" title="游戏审核" style="width: 720px;" :bordered="false">
      <template #header>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span>游戏审核</span>
          <n-tag v-if="currentGame?.reviewType === 'update'" type="warning" size="small" :bordered="false">更新审核</n-tag>
          <n-tag v-else type="info" size="small" :bordered="false">新游审核</n-tag>
        </div>
      </template>
      <template v-if="currentGame">
        <!-- 游戏信息 -->
        <n-descriptions label-placement="left" :column="2" bordered size="small">
          <n-descriptions-item label="游戏名称">{{ currentGame.name }}</n-descriptions-item>
          <n-descriptions-item label="版本号">{{ currentGame.version }}</n-descriptions-item>
          <n-descriptions-item label="供应商">{{ currentGame.cpName }}</n-descriptions-item>
          <n-descriptions-item label="游戏题材">{{ currentGame.category }}</n-descriptions-item>
          <n-descriptions-item label="游戏大小">{{ currentGame.size }}</n-descriptions-item>
          <n-descriptions-item label="游戏时长">{{ currentGame.duration }}分钟</n-descriptions-item>
          <n-descriptions-item label="运行平台">{{ currentGame.platform }}</n-descriptions-item>
          <n-descriptions-item label="玩法模式">{{ currentGame.gameMode }}</n-descriptions-item>
          <n-descriptions-item label="提交时间">{{ currentGame.submitTime }}</n-descriptions-item>
          <n-descriptions-item label="游戏描述" :span="2">{{ currentGame.description }}</n-descriptions-item>
          <n-descriptions-item label="开发者备注" :span="2">{{ currentGame.devNote || '无' }}</n-descriptions-item>
        </n-descriptions>

        <!-- 审核操作区 -->
        <div class="review-section">
          <h4>审核配置</h4>
          <n-form label-placement="left" label-width="110">
            <n-form-item label="游戏豆定价" required>
              <n-input-number v-model:value="reviewForm.gameBeanCost" :min="1" placeholder="每次消耗游戏豆数量" style="width: 200px;" />
              <span style="margin-left: 8px; font-size: 12px; color: var(--text-muted);">豆/次</span>
            </n-form-item>
            <n-form-item label="单次成本" required>
              <n-input-number v-model:value="reviewForm.costPerPlay" :min="0" :step="0.01" placeholder="每次给供应商多少钱" style="width: 200px;" />
              <span style="margin-left: 8px; font-size: 12px; color: var(--text-muted);">元/次（给CP的分成）</span>
            </n-form-item>
            <n-form-item label="价格摘要">
              <span style="font-size: 13px; color: var(--text-muted);">
                用户每次消耗 <b style="color: var(--text-primary);">{{ reviewForm.gameBeanCost || 0 }}</b> 游戏豆，
                平台支付CP <b style="color: var(--text-primary);">¥{{ reviewForm.costPerPlay || 0 }}</b>/次
              </span>
            </n-form-item>
            <n-form-item label="审核意见">
              <n-input v-model:value="reviewForm.comment" type="textarea" :rows="2" placeholder="给CP的审核反馈（不通过时必填）" />
            </n-form-item>
          </n-form>
        </div>
      </template>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showReviewModal = false">取消</n-button>
          <n-button type="error" secondary @click="rejectGame">审核不通过</n-button>
          <n-button type="primary" @click="approveGame">审核通过</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NButton, NDataTable, NTag, NSelect, NIcon, NSpace, NTabs, NTabPane,
  NModal, NDescriptions, NDescriptionsItem, NForm, NFormItem, NInputNumber,
  NInput, useMessage
} from 'naive-ui'
import {
  TimeOutline, CheckmarkCircleOutline, CloseCircleOutline,
} from '@vicons/ionicons5'

const message = useMessage()
const activeTab = ref('pending')
const reviewFilter = ref<string | null>(null)
const pagination = { pageSize: 10 }

const reviewResultOptions = [
  { label: '全部', value: '' },
  { label: '已通过', value: 'passed' },
  { label: '未通过', value: 'rejected' },
]

// ========== 待审核数据 ==========
const pendingData = ref([
  { id: 1, name: '深海探险VR', cpName: '极境互动科技', version: '1.0.0', category: '冒险', size: '1.8GB', duration: 15, platform: '头显一体机', gameMode: '单机', reviewType: 'new', submitTime: '2026-05-28 14:30', description: '潜入深海世界，探索未知海域，与海洋生物互动。支持体感控制。', devNote: '这是我们首款海洋题材VR游戏，画面精美，适合全年龄段' },
  { id: 2, name: '赛博朋克2079', cpName: '闪耀游戏工作室', version: '0.5.0', category: '射击', size: '3.2GB', duration: 20, platform: '主机游戏', gameMode: '联机', reviewType: 'new', submitTime: '2026-05-28 10:15', description: '未来都市背景的多人在线射击游戏，支持4人对战。', devNote: '目前是早期版本，后续会持续更新内容' },
  { id: 3, name: '棋牌乐园', cpName: '乐游网络', version: '2.0.0', category: '休闲', size: '500MB', duration: 30, platform: '头显一体机', gameMode: '联机', reviewType: 'new', submitTime: '2026-05-29 09:00', description: '包含斗地主、麻将等多款经典棋牌游戏，支持语音交流。', devNote: '已在线下棋牌室验证，用户粘性强' },
  { id: 4, name: '极限滑雪', cpName: '极境互动科技', version: '1.2.0', category: '体育', size: '2.1GB', duration: 12, platform: '头显一体机', gameMode: '单机', reviewType: 'new', submitTime: '2026-05-29 11:20', description: '模拟真实滑雪体验，多种赛道可选，支持体感控制。', devNote: '' },
  { id: 5, name: '太空站', cpName: '星际科技', version: '1.0.0', category: '冒险', size: '4.5GB', duration: 25, platform: '主机游戏', gameMode: '单机', reviewType: 'new', submitTime: '2026-05-29 16:00', description: '在国际空间站中完成各种任务，体验宇航员生活。', devNote: '与航天局合作素材，画面真实度极高' },
  { id: 6, name: '过山车VR', cpName: '极境互动科技', version: 'v2.4.0', category: '冒险', size: '280M', duration: 10, platform: '主机游戏', gameMode: '单机', reviewType: 'update', submitTime: '2026-05-30 09:15', description: '更新版本：新增两条赛道，优化画面渲染性能，修复联机掉线问题。', devNote: '根据用户反馈优化了晕动症适配参数' },
])

const pendingColumns = [
  { title: '游戏名称', key: 'name', width: 150 },
  { title: '供应商', key: 'cpName', width: 130 },
  { title: '版本', key: 'version', width: 90 },
  { title: '题材', key: 'category', width: 80 },
  { title: '类型', key: 'reviewType', width: 90,
    render(row: any) {
      return h(NTag, { type: row.reviewType === 'update' ? 'warning' : 'info', size: 'small', bordered: false }, () => row.reviewType === 'update' ? '更新审核' : '新游审核')
    }
  },
  { title: '大小', key: 'size', width: 80 },
  { title: '提交时间', key: 'submitTime', width: 150 },
  {
    title: '操作', key: 'action', width: 80, fixed: 'right',
    render(row: any) {
      return h(NButton, { size: 'tiny', type: 'primary', onClick: () => openReview(row) }, () => '审核')
    }
  },
]

// ========== 已审核数据 ==========
const reviewedData = ref([
  { id: 101, name: '恐怖医院', cpName: '极境互动科技', version: '1.8.5', result: 'passed', gameBeanCost: 25, costPerPlay: 8.75, reviewer: '管理员', reviewTime: '2026-05-18 15:30', comment: '内容质量优秀，通过' },
  { id: 102, name: '末日求生', cpName: '极境互动科技', version: '0.9.1', result: 'rejected', gameBeanCost: 0, costPerPlay: 0, reviewer: '管理员', reviewTime: '2026-05-27 10:00', comment: '游戏描述与内容不符，请修改后重新提交' },
  { id: 103, name: '极速赛车', cpName: '闪耀游戏工作室', version: '3.1.0', result: 'passed', gameBeanCost: 15, costPerPlay: 4.50, reviewer: '运营主管', reviewTime: '2026-05-15 14:00', comment: '品质优秀，定价15豆' },
  { id: 104, name: '过山车VR', cpName: '极境互动科技', version: '2.3.2', result: 'passed', gameBeanCost: 20, costPerPlay: 6.00, reviewer: '管理员', reviewTime: '2026-05-20 11:30', comment: '热门游戏更新版本，保持原定价' },
])

const filteredReviewedData = computed(() => {
  if (!reviewFilter.value) return reviewedData.value
  return reviewedData.value.filter(d => d.result === reviewFilter.value)
})

const reviewedColumns = [
  { title: '游戏名称', key: 'name', width: 140 },
  { title: '供应商', key: 'cpName', width: 140 },
  { title: '版本', key: 'version', width: 90 },
  {
    title: '审核结果', key: 'result', width: 100,
    render(row: any) {
      return h(NTag, { type: row.result === 'passed' ? 'success' : 'error', size: 'small', bordered: false }, () => row.result === 'passed' ? '通过' : '不通过')
    }
  },
  { title: '游戏豆定价', key: 'gameBeanCost', width: 100, render: (row: any) => row.gameBeanCost ? `${row.gameBeanCost} 豆/次` : '-' },
  { title: '分成成本', key: 'costPerPlay', width: 100, render: (row: any) => row.costPerPlay ? `¥${row.costPerPlay}/次` : '-' },
  { title: '审核人', key: 'reviewer', width: 90 },
  { title: '审核时间', key: 'reviewTime', width: 150 },
  { title: '审核意见', key: 'comment', width: 200, ellipsis: { tooltip: true } },
]

// ========== 审核弹窗 ==========
const showReviewModal = ref(false)
const currentGame = ref<any>(null)
const reviewForm = ref({ gameBeanCost: 20, costPerPlay: 6, comment: '' })

function openReview(game: any) {
  currentGame.value = game
  reviewForm.value = { gameBeanCost: 20, costPerPlay: 6, comment: '' }
  showReviewModal.value = true
}

function approveGame() {
  if (!reviewForm.value.gameBeanCost || !reviewForm.value.costPerPlay) {
    message.warning('请设置游戏豆定价和单次成本')
    return
  }
  // 从待审核移除，加入已审核
  const idx = pendingData.value.findIndex(g => g.id === currentGame.value.id)
  if (idx > -1) {
    const game = pendingData.value.splice(idx, 1)[0]
    reviewedData.value.unshift({
      id: game.id,
      name: game.name,
      cpName: game.cpName,
      version: game.version,
      result: 'passed',
      gameBeanCost: reviewForm.value.gameBeanCost,
      costPerPlay: reviewForm.value.costPerPlay,
      reviewer: '管理员',
      reviewTime: new Date().toLocaleString('zh-CN'),
      comment: reviewForm.value.comment || '审核通过',
    })
  }
  message.success(`「${currentGame.value.name}」审核通过，定价 ${reviewForm.value.gameBeanCost} 豆/次，成本 ¥${reviewForm.value.costPerPlay}/次`)
  showReviewModal.value = false
}

function rejectGame() {
  if (!reviewForm.value.comment) {
    message.warning('审核不通过时请填写审核意见')
    return
  }
  const idx = pendingData.value.findIndex(g => g.id === currentGame.value.id)
  if (idx > -1) {
    const game = pendingData.value.splice(idx, 1)[0]
    reviewedData.value.unshift({
      id: game.id,
      name: game.name,
      cpName: game.cpName,
      version: game.version,
      result: 'rejected',
      gameBeanCost: 0,
      costPerPlay: 0,
      reviewer: '管理员',
      reviewTime: new Date().toLocaleString('zh-CN'),
      comment: reviewForm.value.comment,
    })
  }
  message.info(`已拒绝「${currentGame.value.name}」的审核申请`)
  showReviewModal.value = false
}

</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.header-desc { font-size: 13px; color: var(--text-muted); margin-top: 4px; }

.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
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

.review-section {
  margin-top: 20px; padding-top: 20px;
  border-top: 1px solid var(--border-color);
}
.review-section h4 { font-size: 14px; font-weight: 600; color: var(--text-primary); margin: 0 0 16px; }
</style>
