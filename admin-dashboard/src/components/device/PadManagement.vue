<template>
  <div class="stats"><div v-for="s in stats" :key="s.label"><strong>{{ s.count }}</strong>{{ s.label }}</div></div>
  <n-space style="margin-bottom:16px" wrap>
    <n-select v-model:value="merchant" :options="merchants" placeholder="所属商家" clearable style="width:150px" @update:value="store=null" />
    <n-select v-model:value="store" :options="stores(merchant)" placeholder="所属店铺" clearable :disabled="!merchant" style="width:150px" />
    <n-select v-model:value="status" :options="statuses" placeholder="状态" clearable style="width:120px" />
    <n-select v-model:value="allocated" :options="[{label:'待分配',value:'no'},{label:'已分配',value:'yes'}]" placeholder="分配状态" clearable style="width:130px" />
    <n-input v-model:value="keyword" placeholder="搜索编号/名称/SN/MAC" clearable style="width:230px" />
    <n-button size="small" @click="reset">重置</n-button>
  </n-space>
  <n-button type="primary" size="small" style="margin-bottom:16px" @click="edit()">＋ 录入Pad</n-button>
  <n-data-table :columns="columns" :data="filtered" :row-key="(p: Pad) => p.id" size="small" striped :bordered="false" :scroll-x="1900" :pagination="{pageSize:10}" />
  <n-modal v-model:show="showForm" preset="card" :title="form.id ? '编辑Pad' : '录入Pad'" style="width:540px;max-width:95vw">
    <n-form ref="formRef" :model="form" :rules="rules" label-placement="left" label-width="100">
      <n-form-item v-for="f in fields" :key="f.key" :label="f.label" :path="f.key"><n-input v-model:value="form[f.key]" :placeholder="f.placeholder" :type="f.key === 'notes' ? 'textarea' : 'text'" /></n-form-item>
      <template v-if="form.id"><n-form-item label="运行状态"><n-text>{{ form.runtimeStatus === 'online' ? '在线' : '离线' }}（由设备心跳判定）</n-text></n-form-item><n-form-item label="故障标记"><n-switch v-model:value="form.isFault" /></n-form-item></template>
    </n-form>
    <template #footer><n-space justify="center"><n-button @click="showForm=false">取消</n-button><n-button type="primary" @click="save">{{ form.id ? '保存' : '录入' }}</n-button></n-space></template>
  </n-modal>
  <n-modal v-model:show="showAssign" preset="card" title="分配Pad" style="width:480px;max-width:95vw">
    <n-form ref="assignRef" :model="assignment" :rules="assignRules" label-placement="left" label-width="100">
      <n-form-item label="Pad设备">{{ selected?.name }}（{{ selected?.serialNo }}）</n-form-item>
      <n-form-item label="分配商家" path="merchant"><n-select v-model:value="assignment.merchant" :options="merchants" filterable placeholder="选择商家" @update:value="assignment.store=null" /></n-form-item>
      <n-form-item label="分配店铺" path="store"><n-select v-model:value="assignment.store" :options="stores(assignment.merchant)" filterable placeholder="选择店铺" :disabled="!assignment.merchant" /></n-form-item>
    </n-form>
    <template #footer><n-space justify="center"><n-button @click="showAssign=false">取消</n-button><n-button type="primary" @click="assign">确认分配</n-button></n-space></template>
  </n-modal>
  <n-modal v-model:show="showUnassign" preset="dialog" title="确认取消分配" :content="`确认将 ${selected?.name || '该Pad'} 从当前商家/门店回收？取消后需重新分配才能投入使用，Token 将自动吊销。`" positive-text="确认取消分配" negative-text="返回" @positive-click="unassign" />
</template>
<script setup lang="ts">
import { computed, h, ref } from 'vue'
import { usePadDevices, type Pad } from '../../composables/usePadDevices'
import { NButton, NTag, useMessage } from 'naive-ui'
import type { DataTableColumns, FormInst, FormRules } from 'naive-ui'
const props = defineProps<{merchantStoreMap:Record<string,string[]>}>()
const message = useMessage()
const fields = [
  {key:'serialNo',label:'Pad编号',placeholder:'如：PAD-001'}, {key:'name',label:'Pad名称',placeholder:'如：大厅控制Pad #01'},
  {key:'model',label:'设备型号',placeholder:'如：华为 MatePad 11'}, {key:'sn',label:'SN码',placeholder:'设备唯一序列号'},
  {key:'specs',label:'硬件配置',placeholder:'如：8GB / 128GB'}, {key:'osVersion',label:'系统版本',placeholder:'如：Android 14'},
  {key:'macAddress',label:'MAC地址',placeholder:'如：00:1A:2B:3C:4D:5E'}, {key:'notes',label:'备注',placeholder:'补充设备信息'},
] as const
const { pads, savePads } = usePadDevices()
function commit(next: Pad[]) {
  try { savePads(next); return true }
  catch { message.error('保存失败，请检查浏览器存储空间后重试'); return false }
}

const merchants = computed(()=>Object.keys(props.merchantStoreMap).map(value=>({label:value,value})))
const stores = (merchant:string|null)=>(props.merchantStoreMap[merchant || ''] || []).map(value=>({label:value,value}))
const statuses = [{label:'在线',value:'online'},{label:'离线',value:'offline'},{label:'故障',value:'fault'}]
const getStatus = (p:Pad)=>p.isFault ? 'fault' : p.runtimeStatus
const stats = computed(()=>[{label:'Pad总数',count:pads.value.length},...statuses.map(s=>({label:s.label,count:pads.value.filter(p=>getStatus(p)===s.value).length}))])
const merchant=ref<string|null>(null),store=ref<string|null>(null),status=ref<string|null>(null),allocated=ref<string|null>(null),keyword=ref('')
function reset() { merchant.value=store.value=status.value=allocated.value=null;keyword.value='' }
const filtered=computed(()=>pads.value.filter(p=>(!merchant.value || p.merchant===merchant.value) && (!store.value || p.store===store.value) && (!status.value || getStatus(p)===status.value) && (!allocated.value || (allocated.value==='yes' ? !!p.merchant : !p.merchant)) && [p.name,p.serialNo,p.sn,p.macAddress].some(v=>v.toLowerCase().includes(keyword.value.trim().toLowerCase()))))
const empty=():Pad=>({token:'',tokenStatus:'none',id:'',serialNo:'',name:'',model:'',sn:'',specs:'',osVersion:'',macAddress:'',notes:'',runtimeStatus:'offline',isFault:false,merchant:'',store:'',createdAt:''})
const form=ref(empty()),formRef=ref<FormInst|null>(null),showForm=ref(false)
const rules:FormRules=Object.fromEntries(['serialNo','name','model','sn','macAddress'].map(key=>[key,{required:true,trigger:['input','blur'],validator:(_rule:unknown,value:string)=>{
  const label=fields.find(f=>f.key===key)!.label
  if (!value?.trim()) return new Error(`请输入${label}`)
  if (key==='macAddress' && !/^([\da-f]{2}:){5}[\da-f]{2}$/i.test(value.trim()) && !/^([\da-f]{2}-){5}[\da-f]{2}$/i.test(value.trim())) return new Error('请输入有效的MAC地址')
  const normalize=(v:string)=>key==='macAddress' ? v.replace(/[:-]/g,'').toLowerCase() : v.toLowerCase()
  if (['serialNo','sn','macAddress'].includes(key) && pads.value.some(p=>p.id!==form.value.id && normalize(p[key as 'serialNo'|'sn'|'macAddress'])===normalize(value.trim()))) return new Error(`${label}已存在`)
  return true
}}]))
function edit(p?:Pad) {form.value=p ? {...p} : empty();showForm.value=true}
async function save() {
  try {await formRef.value?.validate()} catch {return}
  const p={...form.value};for (const f of fields) p[f.key]=p[f.key].trim()
  const editing=!!p.id
  if (!editing) {p.id=crypto.randomUUID();p.createdAt=new Date().toLocaleDateString('sv-SE')}
  if (!commit(editing ? pads.value.map(row=>row.id===p.id ? p : row) : [p,...pads.value])) return
  showForm.value=false;if (!editing) reset();message.success(editing ? 'Pad信息已更新' : 'Pad已录入')
}
const selected=ref<Pad|null>(null),showAssign=ref(false),showUnassign=ref(false),assignRef=ref<FormInst|null>(null)
const assignment=ref<{merchant:string|null;store:string|null}>({merchant:null,store:null})
const assignRules:FormRules={merchant:{required:true,message:'请选择商家',trigger:'change'},store:{required:true,message:'请选择店铺',trigger:'change'}}
async function assign() {
  try {await assignRef.value?.validate()} catch {return}
  if (!selected.value || !assignment.value.merchant || !assignment.value.store) return
  if (!commit(pads.value.map(p=>p.id===selected.value!.id ? {...p,merchant:assignment.value.merchant!,store:assignment.value.store!,token:genToken(),tokenStatus:'active'} : p))) return
  showAssign.value=false;message.success('Pad已分配，Token 已自动生成')
}
function unassign() {
  if (!selected.value) return false
  if (!commit(pads.value.map(p=>p.id===selected.value!.id ? {...p,merchant:'',store:'',token:'',tokenStatus:'none'} : p))) return false
  message.success('Pad已取消分配，Token 已自动吊销')
}
function genToken() { return `tk_pad_${crypto.randomUUID().replace(/-/g, '')}` }
function changeToken(p: Pad) {
  const current = pads.value.find(row => row.id === p.id)
  if (!current?.merchant) return
  const revoke = current.tokenStatus === 'active'
  if (!commit(pads.value.map(row => row.id === p.id ? {...row, token: revoke ? '' : genToken(), tokenStatus: revoke ? 'none' : 'active'} : row))) return
  message.success(revoke ? 'Token 已吊销' : 'Token 已重新生成')
}
async function copyToken(token: string) {
  try { await navigator.clipboard.writeText(token); message.success('已复制') }
  catch { message.error('复制失败，请检查浏览器剪贴板权限') }
}
const columns:DataTableColumns<Pad>=[
  {type:'selection',width:40},
  ...[{title:'Pad编号',key:'serialNo',width:130},{title:'Pad名称',key:'name',width:160},{title:'设备型号',key:'model',width:150},{title:'SN码',key:'sn',width:140},{title:'硬件配置',key:'specs',width:180},{title:'MAC地址',key:'macAddress',width:165},{title:'系统版本',key:'osVersion',width:130},{title:'所属商家',key:'merchant',width:130},{title:'所属门店',key:'store',width:150}].map(c=>({...c,render:(p:Pad)=>p[c.key as keyof Pad] as string || '--'})),
  {title:'状态',key:'status',width:90,render:p=>h(NTag,{size:'small',type:p.isFault ? 'error' : p.runtimeStatus==='online' ? 'success' : 'default'},{default:()=>statuses.find(s=>s.value===getStatus(p))!.label})},
  {title:'点播系统 Token',key:'token',width:190,render:p=>p.tokenStatus !== 'active' || !p.token
    ? h(NTag,{size:'small',type:'default'},{default:()=>'未分配'})
    : h('div',{style:'display:flex;align-items:center;gap:4px'},[
      h('span',{title:p.token,style:'font-family:monospace;font-size:11px;color:#6366f1'},`${p.token.slice(0,12)}...`),
      h(NButton,{size:'tiny',text:true,type:'primary',onClick:()=>copyToken(p.token)},{default:()=>'复制'}),
    ])},
  {title:'录入时间',key:'createdAt',width:120},
  {title:'操作',key:'actions',width:260,fixed:'right',render:p=>h('div',{style:'display:flex;gap:12px'},[
    h(NButton,{size:'tiny',text:true,type:'primary',onClick:()=>edit(p)},{default:()=>'编辑'}),
    h(NButton,{size:'tiny',text:true,type:p.merchant ? 'warning' : 'info',onClick:()=>{selected.value=p;if(p.merchant) showUnassign.value=true;else {assignment.value={merchant:null,store:null};showAssign.value=true}}},{default:()=>p.merchant ? '取消分配' : '分配'}),
    ...(p.merchant ? [h('span',{style:'color:#ddd'},'|'),h(NButton,{size:'tiny',text:true,type:p.tokenStatus === 'active' ? 'error' : 'primary',onClick:()=>changeToken(p)},{default:()=>p.tokenStatus === 'active' ? '吊销Token' : '生成Token'})] : []),
  ])},
]
</script>
<style scoped>
.stats {display:flex;gap:16px;margin-bottom:20px;flex-wrap:wrap}
.stats>div {flex:1;min-width:120px;background:white;border:1px solid var(--border-color);border-radius:10px;padding:16px 20px;display:flex;flex-direction:column;align-items:center;font-size:12px;color:var(--text-muted)}
.stats strong {font-family:'Orbitron',sans-serif;font-size:28px;color:var(--text-primary);margin-bottom:4px}
</style>
