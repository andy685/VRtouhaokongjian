<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">内容消费大盘</h1>
    </div>
    <div class="table-card">
      <n-data-table
        :columns="columns"
        :data="data"
        :bordered="false"
        :single-line="false"
        size="small"
        striped
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { h, ref } from 'vue'
import { NDataTable, NTag, NTooltip, NIcon } from 'naive-ui'
import { InformationCircleOutline } from '@vicons/ionicons5'

// 模拟数据：每个内容的按天点播数据（最近14天，前7天 + 后7天）
const dailyData: Record<string, number[]> = {
  '过山车VR': [1100, 1150, 1080, 1200, 1250, 1180, 1220, 1250, 1280, 1300, 1320, 1280, 1310, 1350],
  '星际穿越': [850, 870, 830, 900, 880, 860, 890, 880, 890, 870, 885, 880, 890, 895],
  '恐怖医院': [700, 720, 680, 750, 730, 710, 740, 800, 790, 810, 800, 820, 830, 840],
  '极速赛车': [950, 930, 900, 880, 860, 840, 830, 800, 790, 780, 770, 765, 760, 755],
  '海洋世界': [680, 690, 670, 700, 695, 685, 690, 700, 710, 705, 715, 710, 720, 725],
  '恐龙世界': [500, 520, 540, 560, 580, 570, 575, 600, 620, 640, 660, 680, 700, 720],
  '飞行模拟器': [450, 470, 480, 500, 490, 485, 495, 520, 540, 560, 580, 600, 620, 640],
  '鬼屋惊魂': [650, 630, 610, 590, 570, 560, 550, 520, 510, 500, 490, 480, 470, 465],
}

// 计算趋势：对比最近7天 vs 前7天
const calculateTrend = (name: string) => {
  const d = dailyData[name]
  if (!d || d.length < 14) return { label: '→ 平稳', color: 'default' as const, rate: 0 }

  const recent7 = d.slice(7).reduce((a, b) => a + b, 0)
  const previous7 = d.slice(0, 7).reduce((a, b) => a + b, 0)
  const growth = ((recent7 - previous7) / previous7) * 100

  if (growth > 5) return { label: `↗ 上升 ${growth.toFixed(1)}%`, color: 'success' as const, rate: growth }
  if (growth < -5) return { label: `↘ 下降 ${Math.abs(growth).toFixed(1)}%`, color: 'error' as const, rate: growth }
  return { label: '→ 平稳', color: 'default' as const, rate: growth }
}

const data = ref(
  [
    { name: '过山车VR', type: '游戏', totalPlays: 12580, totalBeans: 251600, storeCount: 45, avgCost: 20 },
    { name: '星际穿越', type: '影片', totalPlays: 8920, totalBeans: 133800, storeCount: 38, avgCost: 15 },
    { name: '恐怖医院', type: '游戏', totalPlays: 8200, totalBeans: 123000, storeCount: 35, avgCost: 15 },
    { name: '极速赛车', type: '游戏', totalPlays: 7600, totalBeans: 114000, storeCount: 32, avgCost: 15 },
    { name: '海洋世界', type: '影片', totalPlays: 6500, totalBeans: 78000, storeCount: 30, avgCost: 12 },
    { name: '恐龙世界', type: '影片', totalPlays: 5400, totalBeans: 64800, storeCount: 28, avgCost: 12 },
    { name: '飞行模拟器', type: '游戏', totalPlays: 4800, totalBeans: 67200, storeCount: 25, avgCost: 14 },
    { name: '鬼屋惊魂', type: '游戏', totalPlays: 4200, totalBeans: 58800, storeCount: 22, avgCost: 14 },
  ].map(item => ({
    ...item,
    trend: calculateTrend(item.name)
  }))
)

// 趋势说明
const trendExplanation = '趋势计算逻辑：\n对比最近7天 vs 前7天的点播次数总和\n\n• 增长率 > 5%：↗ 上升（绿色）\n• 增长率 < -5%：↘ 下降（红色）\n• 其余情况：→ 平稳（灰色）'

const columns = [
  { title: '内容名称', key: 'name', minWidth: 160 },
  { title: '类型', key: 'type', width: 90 },
  { title: '总点播次数', key: 'totalPlays', width: 110 },
  { title: '总消耗游戏豆', key: 'totalBeans', width: 120 },
  { title: '覆盖店铺数', key: 'storeCount', width: 110 },
  { title: '平均单次消耗', key: 'avgCost', width: 120 },
  {
    title: () => h('div', { style: 'display:inline-flex;align-items:center;gap:4px;' }, [
      h('span', '趋势'),
      h(NTooltip, { placement: 'top-start', keepAliveOnHover: true }, {
        trigger: () => h(NIcon, {
          component: InformationCircleOutline,
          size: 14,
          style: 'cursor:pointer;opacity:0.45;transition:opacity 0.2s;',
          onMouseenter: (e: any) => (e.target.style.opacity = '0.85'),
          onMouseleave: (e: any) => (e.target.style.opacity = '0.45'),
        }),
        default: () => h('div', {
          style: 'white-space:pre-line;font-size:12px;line-height:1.7;padding:4px 0;'
        }, trendExplanation)
      })
    ]),
    key: 'trend',
    width: 170,
    render: (row: any) => h(NTag, {
      type: row.trend.color,
      size: 'small',
      bordered: false,
      style: 'font-weight:600;letter-spacing:0.5px;'
    }, { default: () => row.trend.label })
  },
]
</script>

<style scoped>
.page-container { padding: 20px 24px; }
.page-header { margin-bottom: 24px; }
.page-title { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.table-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid var(--border-color);
  overflow-x: auto;
}
</style>
