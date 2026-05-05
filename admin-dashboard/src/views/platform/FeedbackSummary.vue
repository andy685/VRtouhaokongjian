<template>
  <div class="page-container">
    <div class="page-header"><h1 class="page-title">全平台反馈汇总</h1></div>
    <div class="stats-row">
      <div class="stat-card"><span class="stat-num">{{ totalCount }}</span><span class="stat-lbl">总反馈</span></div>
      <div class="stat-card"><span class="stat-num">{{ pendingCount }}</span><span class="stat-lbl">待处理</span></div>
      <div class="stat-card"><span class="stat-num">{{ todayCount }}</span><span class="stat-lbl">今日新增</span></div>
    </div>
    <div class="filter-bar">
      <n-select v-model:value="filterStatus" :options="[{label:'全部状态',value:''},{label:'待处理',value:'pending'},{label:'已处理',value:'processed'}]" style="width:130px;" clearable size="small" />
      <n-input v-model:value="filterKeyword" placeholder="搜索店铺/用户/内容" style="width:220px;" clearable size="small" />
    </div>
    <n-data-table :columns="columns" :data="filteredData" :bordered="false" striped size="small" :pagination="{ pageSize: 15 }" />
    <n-modal v-model:show="showDetailModal" preset="card" title="反馈详情" style="width:600px;" :bordered="false">
      <n-descriptions v-if="detailItem" :column="1" bordered size="small">
        <n-descriptions-item label="所属商家">{{ detailItem.merchant }}</n-descriptions-item>
        <n-descriptions-item label="所属店铺">{{ detailItem.shop }}</n-descriptions-item>
        <n-descriptions-item label="用户">{{ detailItem.user }}</n-descriptions-item>
        <n-descriptions-item label="类型">{{ detailItem.type }}</n-descriptions-item>
        <n-descriptions-item label="反馈内容">{{ detailItem.content }}</n-descriptions-item>
        <n-descriptions-item label="提交时间">{{ detailItem.time }}</n-descriptions-item>
        <n-descriptions-item v-if="detailItem.notes" label="客服处理记录">{{ detailItem.notes }}</n-descriptions-item>
      </n-descriptions>
    </n-modal>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { NDataTable, NButton, NSelect, NInput, NModal, NDescriptions, NDescriptionsItem, NTag, type DataTableColumns } from 'naive-ui'
const filterStatus = ref('')
const filterKeyword = ref('')
interface FeedbackItem { id:number; merchant:string; shop:string; user:string; type:string; content:string; status:'pending'|'processed'; notes?:string; time:string }
const data = ref<FeedbackItem[]>([
  { id:1, merchant:'利民街商家', shop:'利民街小展厅', user:'张**', type:'功能建议', content:'希望增加VR游戏的分类筛选功能，现在找游戏不太方便。', status:'pending', time:'2026-05-05 14:30' },
  { id:2, merchant:'利民街商家', shop:'利民街小展厅', user:'王**', type:'体验反馈', content:'3号VR头盔画面有闪烁，重启后仍然存在。', status:'pending', time:'2026-05-05 16:20' },
  { id:3, merchant:'恒然集团', shop:'恒然科技园店', user:'李**', type:'体验反馈', content:'过山车项目体验很好，建议增加更多刺激类游戏。', status:'processed', notes:'已记录建议，转运营团队评估', time:'2026-05-04 10:15' },
  { id:4, merchant:'利民街商家', shop:'利民街小展厅', user:'刘**', type:'投诉', content:'排队等待时间太长，建议优化排队流程。', status:'processed', notes:'已沟通用户表示理解', time:'2026-05-03 19:45' },
  { id:5, merchant:'卓远科技', shop:'卓远萧山区店', user:'陈**', type:'功能建议', content:'建议支持预约时间段选择，现在只能预约日期。', status:'pending', time:'2026-05-05 20:10' },
])
const filteredData = computed(() => {
  let list = data.value
  if (filterStatus.value) list = list.filter(i => i.status === filterStatus.value)
  if (filterKeyword.value) { const kw = filterKeyword.value.toLowerCase(); list = list.filter(i => i.shop.includes(kw) || i.user.includes(kw) || i.content.includes(kw)) }
  return list
})
const totalCount = computed(() => data.value.length)
const pendingCount = computed(() => data.value.filter(i => i.status === 'pending').length)
const todayCount = computed(() => data.value.filter(i => i.time.startsWith('2026-05-05')).length)
const showDetailModal = ref(false)
const detailItem = ref<FeedbackItem | null>(null)
const columns: DataTableColumns<FeedbackItem> = [
  { title:'商家', key:'merchant', minWidth:100 }, { title:'店铺', key:'shop', minWidth:120 }, { title:'用户', key:'user', width:70 },
  { title:'类型', key:'type', width:90 },
  { title:'内容', key:'content', minWidth:260, ellipsis:{ tooltip:true } },
  { title:'状态', key:'status', width:80, align:'center' as const, render:(r:FeedbackItem) => h(NTag, { size:'small', type:r.status==='pending'?'warning':'success' }, { default:()=>r.status==='pending'?'待处理':'已处理' }) },
  { title:'客服记录', key:'notes', minWidth:160, ellipsis:{ tooltip:true }, render:(r:FeedbackItem) => r.notes || '--' },
  { title:'提交时间', key:'time', width:140 },
  { title:'操作', key:'actions', width:80, align:'center' as const, render:(r:FeedbackItem) => h(NButton, { size:'tiny', text:true, type:'info', onClick:()=>{ detailItem.value=r; showDetailModal.value=true } }, { default:()=>'查看' }) },
]
</script>
<style scoped>
.page-container { padding:20px 24px; }
.page-header { margin-bottom:20px; }
.page-title { font-size:22px; font-weight:700; color:var(--text-primary); margin:0; }
.stats-row { display:flex; gap:16px; margin-bottom:20px; }
.stat-card { flex:1; background:white; border-radius:10px; padding:16px; border:1px solid var(--border-color); display:flex; flex-direction:column; align-items:center; }
.stat-num { font-family:'Orbitron',sans-serif; font-size:28px; font-weight:700; color:var(--text-primary); }
.stat-lbl { font-size:12px; color:var(--text-muted); margin-top:4px; }
.filter-bar { display:flex; align-items:center; gap:12px; margin-bottom:16px; }
</style>
