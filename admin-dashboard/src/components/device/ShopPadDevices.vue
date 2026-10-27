<template>
  <n-alert type="info" :bordered="false" style="margin-bottom:16px">以下Pad由总运营平台分配，本页仅作查看。Token用于Pad客户端配置，由总运营后台统一生成或吊销。</n-alert>
  <div class="filter-bar">
    <n-select v-model:value="store" :options="storeOptions" placeholder="全部店铺" clearable size="small" style="width:150px" />
    <n-select v-model:value="status" :options="statuses" placeholder="全部状态" clearable size="small" style="width:120px" />
    <n-input v-model:value="keyword" placeholder="搜索Pad名称/编号/SN码" clearable size="small" style="width:230px" />
  </div>
  <n-data-table :columns="columns" :data="filtered" :row-key="(p: Pad) => p.id" :pagination="{pageSize:10}" :bordered="false" striped size="small" :scroll-x="1600" />
  <n-empty v-if="!assigned.length" description="暂无已分配的Pad，请先在总运营后台录入并分配到商家和门店。" style="margin-top:20px" />
</template>
<script setup lang="ts">
import { computed, h, ref } from 'vue'
import { NButton, NTag, useMessage, type DataTableColumns } from 'naive-ui'
import { usePadDevices, type Pad } from '../../composables/usePadDevices'
const { pads } = usePadDevices()
const message = useMessage()
// 与本页主机、头显保持一致：当前原型未接入登录商家身份，展示平台已分配的设备。
const assigned = computed(() => pads.value.filter(p => p.merchant && p.merchant !== '--' && p.store && p.store !== '--'))
const store = ref<string | null>(null), status = ref<string | null>(null), keyword = ref('')
const statuses = [{label:'在线',value:'online'},{label:'离线',value:'offline'},{label:'故障',value:'fault'}]
const getStatus = (p: Pad) => p.isFault ? 'fault' : p.runtimeStatus
const storeOptions = computed(() => [...new Set(assigned.value.map(p => p.store))].map(value => ({label:value,value})))
const filtered = computed(() => assigned.value.filter(p => (!store.value || p.store === store.value) && (!status.value || getStatus(p) === status.value) && [p.name,p.serialNo,p.sn].some(value => value.toLowerCase().includes(keyword.value.trim().toLowerCase()))))
async function copyToken(p: Pad) {
  const current = pads.value.find(row => row.id === p.id)
  if (!current?.merchant || current.tokenStatus !== 'active' || !current.token) return
  try { await navigator.clipboard.writeText(current.token); message.success(`已复制 ${p.name} 的Token`) }
  catch { message.error('复制失败，请检查浏览器剪贴板权限') }
}
const columns: DataTableColumns<Pad> = [
  {title:'Pad编号',key:'serialNo',width:130}, {title:'名称',key:'name',width:160},
  {title:'设备型号',key:'model',width:150}, {title:'SN码',key:'sn',width:150},
  {title:'MAC地址',key:'macAddress',width:165},
  {title:'Pad客户端 Token',key:'token',width:220,render:p => p.tokenStatus === 'active' && p.token
    ? h('div',{style:'display:flex;align-items:center;gap:8px'},[
      h('code',{style:'font-size:11px;color:#475569;background:#f8fafc;padding:2px 6px;border-radius:6px'},`${p.token.slice(0,8)}...${p.token.slice(-4)}`),
      h(NButton,{size:'tiny',quaternary:true,type:'primary',onClick:()=>copyToken(p)},{default:()=>'复制'}),
    ]) : h(NTag,{size:'small',type:'default'},{default:()=>'未配置'})},
  ...[{title:'硬件配置',key:'specs',width:180},{title:'系统版本',key:'osVersion',width:140},{title:'所属商家',key:'merchant',width:130},{title:'所属门店',key:'store',width:150}].map(c => ({...c,render:(p: Pad) => p[c.key as keyof Pad] as string || '--'})),
  {title:'状态',key:'status',width:80,render:p => h(NTag,{size:'small',type:p.isFault ? 'error' : p.runtimeStatus === 'online' ? 'success' : 'default'},{default:()=>statuses.find(s=>s.value === getStatus(p))!.label})},
]
</script>
<style scoped>
.filter-bar {display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap}
</style>
