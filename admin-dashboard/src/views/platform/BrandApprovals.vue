<template>
  <div class="page-container brand-page">
    <div class="page-header"><h1>门店品牌审核</h1><p>审核收银系统与 PC 点播系统的门店 Logo 变更申请。</p></div>
    <section class="content-card">
      <n-tabs v-model:value="statusFilter" type="line" class="status-tabs">
        <n-tab-pane name="all" tab="全部" />
        <n-tab-pane name="pending" tab="待审批" />
        <n-tab-pane name="approved" tab="已生效" />
        <n-tab-pane name="rejected" tab="已驳回" />
      </n-tabs>
      <div class="section-head"><div><h2>品牌申请列表</h2><p>共 {{ filteredRows.length }} 条申请，门店可直接提交，审核后生效。</p></div></div>
      <n-data-table :columns="columns" :data="filteredRows" :pagination="{ pageSize: 10 }" :bordered="false" />
    </section>
    <n-modal v-model:show="showDetail" preset="card" :title="selected ? selected.store + ' · 申请明细' : '申请明细'" style="width:min(760px, calc(100vw - 32px))" :bordered="false">
      <template v-if="selected">
      <div class="section-head"><div><h2>{{ selected.store }} · 申请明细</h2><p>{{ selected.merchant }}</p></div><n-space><n-button v-if="selected.status === 'pending'" type="error" secondary @click="openReject">驳回</n-button><n-button v-if="selected.status === 'pending'" type="success" @click="approve">审核通过并下发</n-button></n-space></div>
      <n-descriptions :column="2" bordered label-placement="left"><n-descriptions-item label="申请状态"><n-tag :type="statusKind(selected.status)">{{ statusText(selected.status) }}</n-tag></n-descriptions-item><n-descriptions-item label="所属商家">{{ selected.merchant }}</n-descriptions-item><n-descriptions-item label="申请门店">{{ selected.store }}</n-descriptions-item><n-descriptions-item label="申请动作">替换门店 Logo</n-descriptions-item><n-descriptions-item label="收银系统 Logo"><img :src="selected.cashierLogoUrl" class="detail-logo" alt="收银系统 Logo" /><a class="download-link" :href="selected.cashierLogoUrl" download="cashier-logo.svg">下载原图</a></n-descriptions-item><n-descriptions-item label="PC 点播系统 Logo"><img :src="selected.vodLogoUrl" class="detail-logo" alt="PC 点播系统 Logo" /><a class="download-link" :href="selected.vodLogoUrl" download="vod-logo.svg">下载原图</a></n-descriptions-item><n-descriptions-item label="申请说明" :span="2">{{ selected.note || '—' }}</n-descriptions-item><n-descriptions-item v-if="selected.reviewNote" label="驳回原因" :span="2"><span class="review-note">{{ selected.reviewNote }}</span></n-descriptions-item></n-descriptions>
      </template>
    </n-modal>
    <n-modal v-model:show="showRejectDialog" preset="card" title="驳回 Logo 替换申请" style="width:min(520px, calc(100vw - 32px))" :bordered="false"><p class="reject-hint">请说明驳回原因，商家将据此调整 Logo 后重新提交。</p><n-input v-model:value="rejectReason" type="textarea" :rows="4" placeholder="例如：Logo 尺寸不符合 800 × 240 px，或文字安全边距不足。" /><template #footer><n-space justify="end"><n-button @click="showRejectDialog = false">取消</n-button><n-button type="error" @click="confirmReject">确认驳回</n-button></n-space></template></n-modal>
  </div>
</template>
<script setup lang="ts">
import { computed, h, ref } from 'vue'
import { NButton, NDataTable, NDescriptions, NDescriptionsItem, NInput, NModal, NSpace, NTabPane, NTabs, NTag, useMessage } from 'naive-ui'
type Row = { id:number; merchant:string; store:string; status:string; cashierLogoUrl:string; vodLogoUrl:string; note:string; reviewNote?:string; requestAction?:'replace'|'restore_default' }
const KEY = 'store-brand-config:hengran'; const message = useMessage()
const current = { authorized:true, status:'draft', cashierLogoUrl:'', vodLogoUrl:'', note:'', ...(JSON.parse(localStorage.getItem(KEY) || '{}')) }
const makeLogo = (name:string, color:string) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="240" viewBox="0 0 800 240"><rect width="800" height="240" rx="24" fill="${color}"/><circle cx="112" cy="120" r="54" fill="white" fill-opacity=".18"/><path d="M92 120h40M112 100v40" stroke="white" stroke-width="10" stroke-linecap="round"/><text x="190" y="110" fill="white" font-family="Arial,Microsoft YaHei" font-size="38" font-weight="700">${name}</text><text x="190" y="154" fill="white" fill-opacity=".75" font-family="Arial" font-size="20">STORE BRAND LOGO</text></svg>`)}`
const cashierDemoLogo = makeLogo('卓远萝岗区店', '#155E75'); const vodDemoLogo = makeLogo('卓远萝岗区店', '#7C3AED'); const hangzhouCashierLogo = makeLogo('杭州滨江店', '#9A3412'); const hangzhouVodLogo = makeLogo('杭州滨江店', '#166534')
const rows = ref<Row[]>([
  { id:1, merchant:'恒然集团', store:'深圳福田旗舰店', ...current, cashierLogoUrl:current.cashierLogoUrl || makeLogo('深圳福田旗舰店', '#0F766E'), vodLogoUrl:current.vodLogoUrl || makeLogo('深圳福田旗舰店', '#1D4ED8') },
  { id:2, merchant:'卓远娱乐', store:'广州萝岗区店', status:'pending', cashierLogoUrl:cashierDemoLogo, vodLogoUrl:vodDemoLogo, note:'门店春季品牌焕新，申请同步替换收银与 PC 点播系统 Logo。' },
  { id:3, merchant:'沉浸世界', store:'成都春熙路店', status:'rejected', cashierLogoUrl:makeLogo('成都春熙路店', '#B45309'), vodLogoUrl:makeLogo('成都春熙路店', '#BE123C'), note:'门店夏季活动品牌素材替换。', reviewNote:'图片边缘存在明显锯齿，且文字安全边距不足。请按 800 × 240 px 规范重新导出后提交。' },
  { id:4, merchant:'幻境空间', store:'杭州滨江店', status:'approved', cashierLogoUrl:hangzhouCashierLogo, vodLogoUrl:hangzhouVodLogo, note:'门店 Logo v2 已生效。' },
])
const statusFilter = ref('all'); const selected = ref<Row | null>(null); const showDetail = ref(false); const showRejectDialog = ref(false); const rejectReason = ref('')
const filteredRows = computed(() => rows.value.filter(row => row.status !== 'draft' && (statusFilter.value === 'all' || row.status === statusFilter.value)))
function statusText(status:string) { return ({ draft:'待提交', pending:'待审批', approved:'已生效', rejected:'已驳回' }[status] || status) }
function statusKind(status:string) { return ({ draft:'info', pending:'warning', approved:'success', rejected:'error' }[status] || 'default') as any }
function saveCurrent() { if (selected.value?.id === 1) localStorage.setItem(KEY, JSON.stringify({ ...current, ...selected.value })) }
function approve() { if (!selected.value) return; selected.value.status = 'approved'; if (selected.value.id === 1 && selected.value.requestAction === 'restore_default') localStorage.setItem(KEY, JSON.stringify({ ...current, ...selected.value, effectiveCashierLogoUrl:'', effectiveVodLogoUrl:'' })); else saveCurrent(); message.success(selected.value.requestAction === 'restore_default' ? '审核通过，已恢复平台默认 Logo' : '审核通过，已下发至对应终端') }
function openReject() { rejectReason.value = ''; showRejectDialog.value = true }
function confirmReject() { if (!selected.value) return; if (!rejectReason.value.trim()) return message.warning('请填写驳回原因'); selected.value.status = 'rejected'; selected.value.reviewNote = rejectReason.value.trim(); showRejectDialog.value = false; saveCurrent(); message.warning('申请已驳回，驳回原因已通知商家') }
const columns = [
  { title:'商家', key:'merchant', width:150 },
  { title:'申请状态', key:'status', width:110, render:(row:Row) => h(NTag,{type:statusKind(row.status),size:'small'},{default:()=>statusText(row.status)}) },
  { title:'申请终端', key:'scope', render:(row:Row) => [row.cashierLogoUrl?'收银系统':'',row.vodLogoUrl?'PC 点播系统':''].filter(Boolean).join('、') || '—' },
  { title:'操作', key:'action', width:90, render:(row:Row) => h(NButton,{text:true,type:'primary',onClick:()=>{selected.value=row;showDetail.value=true}},{default:()=> '查看'}) },
]
</script>
<style scoped>.brand-page{max-width:1180px;padding:24px}.page-header{margin-bottom:20px}.page-header h1{margin:0;font-size:22px}.page-header p,.section-head p{margin:6px 0 0;color:var(--text-muted);font-size:13px}.content-card{padding:22px;background:#fff;border:1px solid var(--border-color);border-radius:12px}.status-tabs{margin-bottom:18px}.section-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:18px}.section-head h2{margin:0;font-size:16px}.detail-card{margin-top:18px}.detail-logo{width:100%;max-width:220px;height:72px;object-fit:contain;padding:8px;background:#0f172a;border-radius:8px}.download-link{display:inline-block;margin-top:8px;color:#2563eb;font-size:13px;text-decoration:none}.download-link:hover{text-decoration:underline}.review-note{color:#b91c1c;line-height:1.7}.reject-hint{margin:0 0 12px;color:#64748b;font-size:13px}</style>
