<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>反馈管理</h1>
      <n-space align="center">
        <span style="color:#666;font-size:14px;">店铺：</span>
        <n-select v-model:value="filterShop" :options="shopOptions" style="width:160px;" clearable size="small" />
        <n-select v-model:value="filterStatus" :options="statusOpts" style="width:120px;" clearable size="small" />
      </n-space>
    </div>
    <n-alert type="info" :bordered="false" style="margin-bottom:16px;">
      反馈来源于C端微信小程序，客服线下处理后在此标记状态和记录处理动作。
    </n-alert>
    <n-data-table :columns="columns" :data="filteredData" :bordered="false" striped size="small" :pagination="{ pageSize: 10 }" />
    <!-- 处理弹窗 -->
    <n-modal v-model:show="showProcessModal" preset="card" title="处理反馈" style="width:520px;" :bordered="false">
      <n-descriptions v-if="currentItem" :column="1" bordered size="small">
        <n-descriptions-item label="用户">{{ currentItem.user }}</n-descriptions-item>
        <n-descriptions-item label="类型">{{ currentItem.type }}</n-descriptions-item>
        <n-descriptions-item label="反馈内容">{{ currentItem.content }}</n-descriptions-item>
        <n-descriptions-item label="提交时间">{{ currentItem.time }}</n-descriptions-item>
        <n-descriptions-item v-if="currentItem.notes" label="客服记录">{{ currentItem.notes }}</n-descriptions-item>
      </n-descriptions>
      <div style="height:16px;" />
      <n-form label-placement="top">
        <n-form-item label="客服处理记录">
          <n-input v-model:value="processNotes" type="textarea" :rows="3" placeholder="记录线下处理动作，如：已联系用户确认问题、已转交技术排查" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showProcessModal=false">取消</n-button>
          <n-button type="primary" @click="handleProcess">标记已处理</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { NDataTable, NButton, NSpace, NSelect, NModal, NForm, NFormItem, NInput, NDescriptions, NDescriptionsItem, NTag, NAlert, type DataTableColumns } from 'naive-ui'
const filterShop = ref<string | null>(null)
const filterStatus = ref<string | null>(null)
const shopOptions = [{ label:'全部店铺',value:'' },{ label:'利民街小展厅',value:'利民街小展厅' },{ label:'恒然科技园店',value:'恒然科技园店' }]
const statusOpts = [{ label:'全部状态',value:'' },{ label:'待处理',value:'pending' },{ label:'已处理',value:'processed' }]
interface FeedbackItem { id:number; shop:string; user:string; type:string; content:string; status:'pending'|'processed'; notes?:string; time:string }
const data = ref<FeedbackItem[]>([
  { id:1, shop:'利民街小展厅', user:'张**', type:'功能建议', content:'希望增加VR游戏的分类筛选功能，现在找游戏不太方便。', status:'pending', time:'2026-05-05 14:30' },
  { id:2, shop:'利民街小展厅', user:'王**', type:'体验反馈', content:'3号VR头盔画面有闪烁，重启后仍然存在。', status:'pending', time:'2026-05-05 16:20' },
  { id:3, shop:'恒然科技园店', user:'李**', type:'体验反馈', content:'过山车项目体验很好，建议增加更多刺激类游戏。', status:'processed', notes:'已记录建议，转运营团队评估', time:'2026-05-04 10:15' },
  { id:4, shop:'利民街小展厅', user:'刘**', type:'投诉', content:'排队等待时间太长，建议优化排队流程。', status:'processed', notes:'已沟通用户表示理解，后续关注高峰分流', time:'2026-05-03 19:45' },
])
const filteredData = computed(() => {
  let list = data.value
  if (filterShop.value) list = list.filter(i => i.shop === filterShop.value)
  if (filterStatus.value) list = list.filter(i => i.status === filterStatus.value)
  return list
})
const showProcessModal = ref(false)
const currentItem = ref<FeedbackItem | null>(null)
const processNotes = ref('')
const columns: DataTableColumns<FeedbackItem> = [
  { title:'店铺', key:'shop', minWidth:120 },
  { title:'用户', key:'user', width:80 },
  { title:'类型', key:'type', width:100 },
  { title:'反馈内容', key:'content', minWidth:260, ellipsis:{ tooltip:true } },
  { title:'状态', key:'status', width:80, align:'center' as const, render:(r:FeedbackItem) => h(NTag, { size:'small', type:r.status==='pending'?'warning':'success' }, { default:()=>r.status==='pending'?'待处理':'已处理' }) },
  { title:'客服记录', key:'notes', minWidth:160, ellipsis:{ tooltip:true }, render:(r:FeedbackItem) => r.notes || '--' },
  { title:'提交时间', key:'time', width:150 },
  { title:'操作', key:'actions', width:80, align:'center' as const, render:(r:FeedbackItem) => {
    if (r.status === 'pending') return h(NButton, { size:'tiny', text:true, type:'primary', onClick:()=>{ currentItem.value=r; processNotes.value=''; showProcessModal.value=true } }, { default:()=>'处理' })
    return h(NButton, { size:'tiny', text:true, type:'info', onClick:()=>{ currentItem.value=r; processNotes.value=r.notes||''; showProcessModal.value=true } }, { default:()=>'查看' })
  }},
]
function handleProcess() {
  if (currentItem.value) {
    currentItem.value.notes = processNotes.value || '已线下处理'
    currentItem.value.status = 'processed'
  }
  showProcessModal.value = false
  window.$message?.success('已标记为已处理')
}
</script>
<style scoped>
.page-container { padding:24px; }
.page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
.page-header h1 { font-size:20px; font-weight:600; color:#333; margin:0; }
</style>
