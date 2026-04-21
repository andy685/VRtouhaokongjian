<template>
  <div class="shop-workbench">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>首页</h1>
    </div>

    <!-- 顶部三个统计卡片 -->
    <div class="stats-row">
      <div class="stat-card stat-revenue">
        <div class="stat-icon">
          <n-icon :component="CashOutline" size="24" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="stat-label">营收总额</span>
          <span class="stat-value">¥89,520</span>
          <span class="stat-compared">上周同日 ¥76,320</span>
        </div>
      </div>
      <div class="stat-card stat-members">
        <div class="stat-icon">
          <n-icon :component="PeopleOutline" size="24" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="stat-label">来店会员</span>
          <span class="stat-value">236人</span>
          <span class="stat-compared">上周同日 218人</span>
        </div>
      </div>
      <div class="stat-card stat-new">
        <div class="stat-icon">
          <n-icon :component="PersonAddOutline" size="24" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="stat-label">新增会员</span>
          <span class="stat-value">28人</span>
          <span class="stat-compared">上周同日 21人</span>
        </div>
      </div>
    </div>

    <!-- 中间区域：营收趋势图 + 会员消费排行 -->
    <div class="main-grid">
      <!-- 15日内营收金额柱状图 -->
      <div class="chart-card">
        <div class="card-header">
          <h3>15日内营收金额</h3>
        </div>
        <div class="bar-chart-container">
          <!-- Y轴（左侧外侧） -->
          <div class="chart-y-axis">
            <span v-for="(label, i) in yAxisLabels" :key="i">{{ label }}</span>
          </div>
          <!-- 图表主体 -->
          <div class="chart-main">
            <div class="chart-body">
              <!-- 网格线 -->
              <div class="grid-lines">
                <div class="grid-line" v-for="i in 5" :key="i"></div>
              </div>
              <!-- 柱子 -->
              <div class="bars-wrapper" @mousemove="onChartMouseMove" @mouseleave="onChartMouseLeave">
                <div 
                  v-for="(item, idx) in revenueTrend" 
                  :key="idx" 
                  class="bar-item"
                  :class="{ 'is-today': item.today }"
                  @mouseenter="hoveredBar = idx"
                >
                  <div class="bar-fill" :style="{ height: (item.value / maxValue * 100) + '%' }"></div>
                </div>
              </div>
              <!-- 跟随鼠标的悬浮提示 -->
              <div v-if="hoveredBar !== null && tooltipPos.x > 0" class="chart-tooltip" :style="{ left: tooltipPos.x + 'px', top: tooltipPos.y + 'px' }">
                <div class="tooltip-label">{{ revenueTrend[hoveredBar]?.date }}</div>
                <div class="tooltip-num">¥{{ revenueTrend[hoveredBar]?.value.toLocaleString() }}</div>
              </div>
            </div>
            <!-- X轴标签 -->
            <div class="chart-x-labels">
              <span v-for="(item, idx) in revenueTrend" :key="idx" class="x-label" :class="{ 'is-today': item.today }">{{ item.date }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 当日会员消费排行榜 -->
      <div class="rank-card">
        <div class="card-header">
          <h3>当日会员消费排行</h3>
        </div>
        <div class="rank-list-scroll">
          <div v-for="(member, idx) in memberRanking" :key="idx" class="rank-item">
            <span class="rank-num" :class="{ 'top1': idx === 0, 'top2': idx === 1, 'top3': idx === 2 }">
              {{ idx + 1 }}
            </span>
            <div class="rank-info">
              <span class="rank-name">{{ member.name }}</span>
              <span class="rank-phone">{{ member.phone }}</span>
            </div>
            <span class="rank-amount">¥{{ member.amount.toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部区域：两个横向柱图 -->
    <div class="bottom-grid">
      <!-- 售品销售额占比 - 横向柱图 -->
      <div class="h-bar-card">
        <div class="card-header">
          <h3>售品销售额占比 <span class="top-tag">TOP10</span></h3>
        </div>
        <div class="h-bar-chart" @mousemove="onHBarMouseMove" @mouseleave="onHBarMouseLeave" style="position: relative;">
          <div v-for="(item, idx) in productSales" :key="idx" class="h-bar-item" @mouseenter="hoveredHBar = 'sales-' + idx">
            <div class="h-bar-label">
              <span class="h-bar-name">{{ item.name }}</span>
              <span class="h-bar-percent">{{ item.percent }}%</span>
            </div>
            <div class="h-bar-track">
              <div class="h-bar-fill" :style="{ width: item.percent + '%', background: item.color }"></div>
            </div>
          </div>
          <!-- 跟随鼠标的提示 -->
          <div v-if="hoveredHBar?.startsWith('sales') && hTooltipPos.x > 0" class="chart-tooltip" :style="{ left: hTooltipPos.x + 'px', top: hTooltipPos.y + 'px' }">
            <div class="tooltip-label">{{ productSales[parseInt(hoveredHBar?.split('-')[1])]?.name }}</div>
            <div class="tooltip-num">¥{{ productSales[parseInt(hoveredHBar?.split('-')[1])]?.amount?.toLocaleString() }}（{{ productSales[parseInt(hoveredHBar?.split('-')[1])]?.percent }}%）</div>
          </div>
        </div>
      </div>

      <!-- 项目启动次数占比 - 横向柱图 -->
      <div class="h-bar-card">
        <div class="card-header">
          <h3>项目启动次数 <span class="top-tag">TOP10</span></h3>
        </div>
        <div class="h-bar-chart" @mousemove="onHBarMouseMove" @mouseleave="onHBarMouseLeave" style="position: relative;">
          <div v-for="(item, idx) in projectStarts" :key="idx" class="h-bar-item" @mouseenter="hoveredHBar = 'projects-' + idx">
            <div class="h-bar-label">
              <span class="h-bar-name">{{ item.name }}</span>
              <span class="h-bar-percent">{{ item.percent }}%</span>
            </div>
            <div class="h-bar-track">
              <div class="h-bar-fill" :style="{ width: item.percent + '%', background: item.color }"></div>
            </div>
          </div>
          <!-- 跟随鼠标的提示 -->
          <div v-if="hoveredHBar?.startsWith('projects') && hTooltipPos.x > 0" class="chart-tooltip" :style="{ left: hTooltipPos.x + 'px', top: hTooltipPos.y + 'px' }">
            <div class="tooltip-label">{{ projectStarts[parseInt(hoveredHBar?.split('-')[1])]?.name }}</div>
            <div class="tooltip-num">{{ projectStarts[parseInt(hoveredHBar?.split('-')[1])]?.count }}次（{{ projectStarts[parseInt(hoveredHBar?.split('-')[1])]?.percent }}%）</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NIcon, NButton, NSpace } from 'naive-ui'
import { CashOutline, PeopleOutline, PersonAddOutline } from '@vicons/ionicons5'

const currentDate = ref(new Date().toLocaleDateString('zh-CN', { 
  year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' 
}))

// 悬浮提示
const hoveredBar = ref<number | null>(null)
const tooltipPos = ref({ x: 0, y: 0 })

function onChartMouseMove(e: MouseEvent) {
  tooltipPos.value = { x: e.offsetX + 12, y: e.offsetY - 10 }
}

function onChartMouseLeave() {
  hoveredBar.value = null
  tooltipPos.value = { x: 0, y: 0 }
}

// 15日营收趋势
const revenueTrend = ref([
  { date: '04-06', value: 17580, today: false },
  { date: '04-07', value: 9520, today: false },
  { date: '04-08', value: 6890, today: false },
  { date: '04-09', value: 11240, today: false },
  { date: '04-10', value: 9380, today: false },
  { date: '04-11', value: 12650, today: false },
  { date: '04-12', value: 9850, today: false },
  { date: '04-13', value: 420, today: false },
  { date: '04-14', value: 380, today: false },
  { date: '04-15', value: 520, today: false },
  { date: '04-16', value: 680, today: false },
  { date: '04-17', value: 890, today: false },
  { date: '04-18', value: 1150, today: false },
  { date: '04-19', value: 1420, today: false },
  { date: '04-20', value: 8952, today: true },
])

// 动态计算最大值和Y轴刻度（整数平均分段）
const maxValue = computed(() => {
  const max = Math.max(...revenueTrend.value.map(d => d.value))
  // 向上取整到好看的整数
  const step = Math.pow(10, Math.floor(Math.log10(max)))
  return Math.ceil(max / step) * step
})

const yAxisSteps = computed(() => {
  const mv = maxValue.value
  const step = mv / 4
  return [mv, mv - step, mv - step * 2, mv - step * 3, 0]
})

const yAxisLabels = computed(() => {
  return yAxisSteps.value.map(v => {
    if (v >= 10000) return (v / 10000).toFixed(1) + '万'
    if (v >= 1000) return (v / 1000).toFixed(1) + 'k'
    return v.toString()
  })
})

// 会员消费排行
const memberRanking = ref([
  { name: '张伟', phone: '138****8888', amount: 2580 },
  { name: '李娜', phone: '139****6666', amount: 1860 },
  { name: '王芳', phone: '137****5555', amount: 1580 },
  { name: '赵强', phone: '136****4444', amount: 1320 },
  { name: '陈静', phone: '135****3333', amount: 980 },
  { name: '刘洋', phone: '134****2222', amount: 860 },
  { name: '周涛', phone: '133****1111', amount: 720 },
  { name: '吴敏', phone: '132****0000', amount: 580 },
])

// 售品销售额占比 TOP10
const productSales = ref([
  { name: 'VR体验-过山车', percent: 18, amount: 16820, color: '#3B82F6' },
  { name: 'VR体验-恐怖医院', percent: 15, amount: 14010, color: '#6366F1' },
  { name: 'VR体验-极速赛车', percent: 12, amount: 11210, color: '#8B5CF6' },
  { name: '套票-季度会员', percent: 10, amount: 9340, color: '#A78BFA' },
  { name: '套票-年度会员', percent: 9, amount: 8410, color: '#10B981' },
  { name: '会员充值-500', percent: 8, amount: 7470, color: '#34D399' },
  { name: '商品-一次性眼罩', percent: 7, amount: 6540, color: '#F59E0B' },
  { name: '商品-VR手柄', percent: 6, amount: 5600, color: '#FBBF24' },
  { name: '会员充值-1000', percent: 5, amount: 4670, color: '#EF4444' },
  { name: '其他', percent: 10, amount: 9340, color: '#94A3B8' },
])

// 项目启动次数占比 TOP10
const projectStarts = ref([
  { name: '过山车VR', percent: 22, count: 156, color: '#3B82F6' },
  { name: '恐怖医院', percent: 18, count: 128, color: '#6366F1' },
  { name: '极速赛车', percent: 15, count: 107, color: '#8B5CF6' },
  { name: '太空漫步', percent: 12, count: 85, color: '#A78BFA' },
  { name: '海洋世界', percent: 10, count: 71, color: '#10B981' },
  { name: '恐龙王国', percent: 8, count: 57, color: '#34D399' },
  { name: 'CS对战', percent: 6, count: 43, color: '#F59E0B' },
  { name: '音乐节VR', percent: 4, count: 28, color: '#FBBF24' },
  { name: '潜水探险', percent: 3, count: 21, color: '#EF4444' },
  { name: '其他项目', percent: 2, count: 14, color: '#94A3B8' },
])

// 横向柱图悬浮
const hoveredHBar = ref<string | null>(null)
const hTooltipPos = ref({ x: 0, y: 0 })

function onHBarMouseMove(e: MouseEvent) {
  hTooltipPos.value = { x: e.offsetX + 12, y: e.offsetY - 10 }
}

function onHBarMouseLeave() {
  hoveredHBar.value = null
  hTooltipPos.value = { x: 0, y: 0 }
}
</script>

<style scoped>
.shop-workbench { max-width: 1440px; }

/* ===== 页面头 ===== */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.header-time {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 4px;
  display: block;
}

/* ===== 统计卡片行 ===== */
.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  border: 1px solid var(--border-color);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-revenue .stat-icon { background: linear-gradient(135deg, #3B82F6, #2563EB); }
.stat-members .stat-icon { background: linear-gradient(135deg, #10B981, #059669); }
.stat-new .stat-icon { background: linear-gradient(135deg, #F59E0B, #D97706); }

.stat-content { display: flex; flex-direction: column; }

.stat-label {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.stat-value {
  font-family: 'Orbitron', sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-compared {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}

/* ===== 主布局 ===== */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 20px;
  margin-bottom: 20px;
}

.chart-card, .rank-card, .h-bar-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid var(--border-color);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-header h3 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.top-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  background: linear-gradient(135deg, #3B82F6, #8B5CF6);
  color: white;
  border-radius: 10px;
}

/* ===== 柱状图 ===== */
.bar-chart-container {
  display: flex;
  height: 340px;
}

.chart-y-axis {
  width: 48px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-bottom: 28px;
  font-size: 11px;
  color: var(--text-muted);
  text-align: right;
  padding-right: 10px;
  flex-shrink: 0;
}

.chart-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chart-body {
  flex: 1;
  position: relative;
  border-left: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  overflow: hidden;
}

.grid-lines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
}

.grid-line {
  border-top: 1px dashed #e2e8f0;
}

.grid-line:first-child {
  border-top: none;
}

.bars-wrapper {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  height: 100%;
  padding: 0 8px;
}

.bar-item {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  height: 100%;
  cursor: pointer;
  position: relative;
}

.bar-fill {
  width: 24px;
  background: linear-gradient(180deg, #60A5FA, #3B82F6);
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease, filter 0.2s ease;
  min-height: 4px;
}

.bar-item.is-today .bar-fill {
  background: linear-gradient(180deg, #A78BFA, #8B5CF6);
}

.bar-item:hover .bar-fill {
  filter: brightness(1.15);
}

/* 统一悬浮提示 */
.chart-tooltip {
  position: absolute;
  z-index: 20;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 14px;
  border-radius: 8px;
  pointer-events: none;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.tooltip-label {
  font-size: 12px;
  opacity: 0.75;
}

.tooltip-num {
  font-weight: 600;
  font-size: 14px;
  margin-top: 2px;
}

.chart-x-labels {
  display: flex;
  padding: 8px 8px 0;
}

.x-label {
  flex: 1;
  text-align: center;
  font-size: 10px;
  color: var(--text-muted);
}

.x-label.is-today {
  color: #8B5CF6;
  font-weight: 600;
}

/* ===== 会员排行 ===== */
.rank-list-scroll {
  max-height: 320px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-right: 8px;
}

.rank-list-scroll::-webkit-scrollbar {
  width: 4px;
}

.rank-list-scroll::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 2px;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.rank-num {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-muted);
  flex-shrink: 0;
}

.rank-num.top1 { background: linear-gradient(135deg, #FEF3C7, #FDE68A); color: #D97706; }
.rank-num.top2 { background: linear-gradient(135deg, #F1F5F9, #E2E8F0); color: #64748B; }
.rank-num.top3 { background: linear-gradient(135deg, #FFEDD5, #FED7AA); color: #C27D3B; }

.rank-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.rank-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.rank-phone {
  font-size: 12px;
  color: var(--text-muted);
}

.rank-amount {
  font-family: 'Orbitron', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #10B981;
}

/* ===== 底部横向柱图 ===== */
.bottom-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.h-bar-chart {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.h-bar-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.h-bar-name {
  font-size: 13px;
  color: var(--text-primary);
}

.h-bar-percent {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}

.h-bar-track {
  height: 20px;
  background: #f1f5f9;
  border-radius: 10px;
  overflow: hidden;
}

.h-bar-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.5s ease;
}

.h-bar-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* ===== 响应式 ===== */
@media (max-width: 1100px) {
  .main-grid { grid-template-columns: 1fr; }
  .bottom-grid { grid-template-columns: 1fr; }
  .stats-row { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .stats-row { grid-template-columns: 1fr; }
}
</style>
