<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">会员消费排行</h1>
      <n-space>
        <n-date-picker type="daterange" clearable size="small" v-model:value="dateRange" />
        <n-select v-model:value="timeRange" :options="timeOptions" size="small" style="width: 120px;" />
        <n-select v-model:value="merchantFilter" :options="merchantOptions" size="small" placeholder="筛选商家" clearable style="width: 160px;" />
        <n-button secondary size="small" @click="exportData">导出Excel</n-button>
      </n-space>
    </div>

    <!-- TOP3 排行卡片 -->
    <div class="ranking-cards">
      <div v-for="(member, index) in topMembers" :key="member.id" :class="['ranking-card', 'rank-' + (index + 1)]">
        <div class="rank-badge">
          <n-icon v-if="index === 0" :component="TrophyOutline" size="24" />
          <span v-else class="rank-num">{{ index + 1 }}</span>
        </div>
        <div class="member-info">
          <span class="member-name">{{ member.name }}</span>
          <span class="member-phone">{{ member.phone }}</span>
          <n-tag size="tiny" :type="index === 0 ? 'warning' : index === 1 ? 'default' : 'info'">{{ member.merchant }}</n-tag>
        </div>
        <div class="member-stats">
          <div class="stat-item"><span class="stat-label">消费金额</span><span class="stat-value">¥{{ member.totalConsume.toLocaleString() }}</span></div>
          <div class="stat-item"><span class="stat-label">消费次数</span><span class="stat-value">{{ member.visitCount }}次</span></div>
        </div>
      </div>
    </div>

    <!-- 完整排行列表 -->
    <div class="table-card">
      <n-data-table :columns="columns" :data="filteredData" :pagination="{ pageSize: 10 }" striped />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { NDataTable, NTag, NSpace, NDatePicker, NSelect, NIcon } from 'naive-ui'
import { TrophyOutline } from '@vicons/ionicons5'

const dateRange = ref<[number, number] | null>(null)
const timeRange = ref('month')
const timeOptions = [
  { label: '本月', value: 'month' },
  { label: '上月', value: 'lastMonth' },
  { label: '本季度', value: 'quarter' },
  { label: '本年', value: 'year' },
]
const merchantFilter = ref<string | null>(null)
const merchantOptions = [
  { label: '恒然集团', value: '恒然集团' },
  { label: '幻影星空', value: '幻影星空' },
  { label: '利民街商家', value: '利民街商家' },
  { label: '党建馆集团', value: '党建馆集团' },
  { label: '华东展厅', value: '华东展厅' },
]

const topMembers = ref([
  { id: 1, name: '赵天宇', phone: '177****9900', merchant: '华东展厅', totalConsume: 25600, visitCount: 134 },
  { id: 2, name: '阳恩', phone: '159****3344', merchant: '恒然集团', totalConsume: 15680, visitCount: 89 },
  { id: 3, name: '李明远', phone: '136****3456', merchant: '幻影星空', totalConsume: 12800, visitCount: 67 },
])

const columns = [
  { title: '排名', key: 'rank', width: 70, render: (_: any, row: any) =>
    h('span', { style: `font-weight:700;color:${row.rank <= 3 ? '#F59E0B' : 'var(--text-secondary)'}` }, row.rank)
  },
  { title: '会员姓名', key: 'name', width: 110 },
  { title: '手机号', key: 'phone', width: 130 },
  { title: '所属商家', key: 'merchant', width: 110, render: (row: any) => h(NTag, { size: 'small', bordered: false }, () => row.merchant) },
  { title: '店铺', key: 'store', width: 140 },
  { title: '会员等级', key: 'level', width: 80, render: (row: any) => {
    const map: Record<string, string> = { diamond: 'error', gold: 'warning', silver: 'info', bronze: '', normal: '' }
    return h(NTag, { type: (map[row.level] || 'default') as any, size: 'small' }, () => ({ diamond: '钻石', gold: '黄金', silver: '白银', bronze: '青铜', normal: '普通' }[row.level]))
  }},
  { title: '累计消费', key: 'totalConsume', width: 120, render: (row: any) => `¥${row.totalConsume.toLocaleString()}` },
  { title: '消费次数', key: 'visitCount', width: 90 },
  { title: '最近消费时间', key: 'lastConsume', width: 150 },
]

const tableData = ref([
  { rank: 1, name: '赵天宇', phone: '177****9900', merchant: '华东展厅', store: '华东展厅', level: 'diamond', totalConsume: 25600, visitCount: 134, lastConsume: '2026-04-21 17:30' },
  { rank: 2, name: '阳恩', phone: '159****3344', merchant: '恒然集团', store: '恒然分部展厅', level: 'gold', totalConsume: 15680, visitCount: 89, lastConsume: '2026-04-20 09:33' },
  { rank: 3, name: '李明远', phone: '136****3456', merchant: '幻影星空', store: '幻影星空馆 NO.8088', level: 'silver', totalConsume: 12800, visitCount: 67, lastConsume: '2026-04-21 10:05' },
  { rank: 4, name: '张浩理', phone: '138****7890', merchant: '恒然集团', store: '恒然分部展厅', level: 'gold', totalConsume: 8800, visitCount: 56, lastConsume: '2026-04-21 16:40' },
  { rank: 5, name: '郑雨萱', phone: '135****6677', merchant: '华东展厅', store: '华东展厅', level: 'silver', totalConsume: 10200, visitCount: 58, lastConsume: '2026-04-20 11:50' },
  { rank: 6, name: '阮颖慧', phone: '158****1122', merchant: '恒然集团', store: '恒然分部展厅', level: 'silver', totalConsume: 6500, visitCount: 42, lastConsume: '2026-03-28 11:18' },
  { rank: 7, name: '陈晓峰', phone: '186****5566', merchant: '利民街商家', store: '利民街大展厅', level: 'bronze', totalConsume: 3200, visitCount: 28, lastConsume: '2026-04-19 14:20' },
  { rank: 8, name: '孙浩然', phone: '199****4455', merchant: '党建馆集团', store: '党建馆', level: 'bronze', totalConsume: 7500, visitCount: 45, lastConsume: '2026-04-18 09:15' },
  { rank: 9, name: '王思琪', phone: '137****9012', merchant: '幻影星空', store: '幻影星空馆 NO.8088', level: 'normal', totalConsume: 560, visitCount: 12, lastConsume: '2026-03-15 14:22' },
  { rank: 10, name: '刘芳华', phone: '188****7788', merchant: '党建馆集团', store: '党建馆', level: 'normal', totalConsume: 1890, visitCount: 9, lastConsume: '2026-01-20 13:55' },
])

const filteredData = computed(() => {
  if (!merchantFilter.value) return tableData.value
  return tableData.value.filter(d => d.merchant === merchantFilter.value)
})

function exportData() {}
</script>

<style scoped>
.page-container { padding: 20px 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-title { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }

.ranking-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
.ranking-card { background: white; border-radius: 14px; padding: 18px 20px; display: flex; align-items: center; gap: 14px; border: 1px solid var(--border-color); position: relative; overflow: hidden; }
.ranking-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; }
.rank-1::before { background: linear-gradient(90deg, #F59E0B, #FBBF24); }
.rank-2::before { background: linear-gradient(90deg, #9CA3AF, #D1D5DB); }
.rank-3::before { background: linear-gradient(90deg, #CD7F32, #D4A574); }

.rank-badge { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0; }
.rank-1 .rank-badge { background: linear-gradient(135deg, #F59E0B, #D97706); }
.rank-2 .rank-badge { background: linear-gradient(135deg, #9CA3AF, #6B7280); }
.rank-3 .rank-badge { background: linear-gradient(135deg, #CD7F32, #A0522D); }
.rank-num { font-size: 18px; font-weight: 700; }

.member-info { flex: 1; min-width: 0; }
.member-name { display: block; font-size: 15px; font-weight: 600; color: var(--text-primary); }
.member-phone { display: block; font-size: 12px; color: var(--text-muted); margin-top: 2px; }

.member-stats { display: flex; gap: 20px; }
.stat-item { text-align: center; }
.stat-label { display: block; font-size: 11px; color: var(--text-muted); }
.stat-value { display: block; font-size: 15px; font-weight: 600; color: var(--text-primary); margin-top: 2px; }

.table-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid var(--border-color); }
</style>
