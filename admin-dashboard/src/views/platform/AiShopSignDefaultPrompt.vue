<template>
  <main class="defaults-page">
    <header class="page-header">
      <div><h1>人物默认配置</h1><p>平台运营统一维护 AI 店招的对话内容，新设备和未单独配置的设备使用此模板。</p></div>
      <n-tag :type="dirty ? 'warning' : 'success'" :bordered="false">{{ dirty ? '有未保存修改' : '已保存' }}</n-tag>
    </header>
    <n-alert type="info" :show-icon="true" class="notice">当前为原型配置，保存在此浏览器中；设备已有的专属配置不会被覆盖。</n-alert>

    <section class="card">
      <div class="section-head"><span>01</span><div><h2>数字人名称</h2><p>新设备默认使用的数字人名称；设备专属人设可单独修改。</p></div></div>
      <n-form-item label="默认名称"><n-input v-model:value="form.digitalHumanName" placeholder="例如：派托" /></n-form-item>
    </section>

    <section class="card">
      <div class="section-head"><span>02</span><div><h2>AI 资源</h2><p>选择声音复刻中已完成的语音资源，作为新设备的默认播报音色。</p></div><n-button size="small" secondary @click="refreshResourceOptions">刷新资源列表</n-button></div>
      <n-form-item label="默认 voiceId"><n-select v-model:value="form.voiceId" :options="voiceIdOptions" placeholder="选择默认语音资源" filterable clearable tag /></n-form-item>
    </section>

    <section class="card">
      <div class="section-head"><span>03</span><div><h2>品牌知识库与业务路由</h2><p>设置平台品牌知识检索范围，以及默认开启的业务知识路由。</p></div></div>
      <div class="route-row">
        <div><strong>品牌知识路由</strong><p>启用后，AI 可从所选平台知识库检索品牌与项目资料。</p></div>
        <n-switch v-model:value="form.brandEnabled" />
      </div>
      <n-form-item label="关联品牌知识库（可多选）"><n-select v-model:value="form.brandKnowledgeIds" :options="knowledgeBaseOptions" multiple filterable tag :disabled="!form.brandEnabled" placeholder="选择平台品牌知识库" /></n-form-item>
    </section>

    <section class="card">
      <div class="section-head"><span>04</span><div><h2>系统提示词</h2><p>控制派托的身份、回答范围与语音长度。门店大屏回答优先 1–2 句，约 20 秒内。</p></div></div>
      <n-form-item label="默认系统提示词"><n-input v-model:value="form.systemPrompt" type="textarea" :autosize="{ minRows: 6, maxRows: 14 }" /></n-form-item>
    </section>

    <section class="card">
      <div class="section-head"><span>05</span><div><h2>问候语</h2><p>访客进入 AI 互动后，随机播放一条。</p></div><n-tag :bordered="false">{{ form.greetings.length }} 条</n-tag></div>
      <div v-for="(_, index) in form.greetings" :key="`g-${index}`" class="phrase-row"><span>{{ index + 1 }}.</span><n-input v-model:value="form.greetings[index]" :placeholder="`第 ${index + 1} 条问候语`" /><n-button text type="error" :disabled="form.greetings.length <= 1" @click="form.greetings.splice(index, 1)">删除</n-button></div>
      <n-button dashed @click="form.greetings.push('')">添加问候语</n-button>
    </section>

    <section class="card two-column">
      <div><div class="section-head"><span>06</span><div><h2>拒答策略</h2><p>约束无依据回答、动态业务信息与现场安全问题。</p></div></div><n-form-item label="默认拒答策略"><n-input v-model:value="form.refusalPolicy" type="textarea" :autosize="{ minRows: 8, maxRows: 16 }" /></n-form-item></div>
      <div><div class="section-head"><span>07</span><div><h2>能力清单</h2><p>列出可介绍和引导的业务主题。</p></div></div><n-form-item label="默认能力清单"><n-input v-model:value="form.capabilityList" type="textarea" :autosize="{ minRows: 8, maxRows: 16 }" /></n-form-item></div>
    </section>

    <section class="card">
      <div class="section-head"><span>08</span><div><h2>空闲自动搭话</h2><p>无人互动达到设定时长后，随机播放一条；不会开启持续收音。</p></div><n-tag :bordered="false">{{ form.idlePhrases.length }} 条</n-tag></div>
      <n-form-item label="无互动触发时间"><div class="interval"><n-input-number v-model:value="form.idleMinutes" :min="1" :max="120" /><span>分钟</span></div></n-form-item>
      <div v-for="(_, index) in form.idlePhrases" :key="`i-${index}`" class="phrase-row"><span>{{ index + 1 }}.</span><n-input v-model:value="form.idlePhrases[index]" :placeholder="`第 ${index + 1} 条搭话`" /><n-button text type="error" :disabled="form.idlePhrases.length <= 1" @click="form.idlePhrases.splice(index, 1)">删除</n-button></div>
      <n-button dashed @click="form.idlePhrases.push('')">添加搭话</n-button>
    </section>

    <section class="card">
      <div class="section-head"><span>09</span><div><h2>引导话题</h2><p>访客界面每次展示 3 条，从话题池轮换。</p></div><n-tag :bordered="false">{{ form.presetTopics.length }} 条</n-tag></div>
      <div class="toggle"><span>AI 自动推荐话题</span><n-switch v-model:value="form.aiTopicsEnabled" /></div>
      <div v-for="(_, index) in form.presetTopics" :key="`t-${index}`" class="phrase-row"><span>{{ index + 1 }}.</span><n-input v-model:value="form.presetTopics[index]" :placeholder="`第 ${index + 1} 条话题`" /><n-button text type="error" :disabled="form.presetTopics.length <= 1" @click="form.presetTopics.splice(index, 1)">删除</n-button></div>
      <n-button dashed @click="form.presetTopics.push('')">添加话题</n-button>
    </section>

    <n-alert v-if="error" type="error" :show-icon="true" class="notice">{{ error }}</n-alert>
    <footer class="actions"><span>{{ lastSaved ? `上次保存：${lastSaved}` : '当前使用产品预置文案' }}</span><n-space><n-button @click="restoreRecommended">恢复产品预置文案</n-button><n-button :disabled="!dirty" @click="discard">放弃修改</n-button><n-button type="primary" :disabled="!dirty" @click="save">保存默认配置</n-button></n-space></footer>
  </main>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useMessage } from 'naive-ui'
import { DEFAULT_PERSONA_COPY, readPersonaDefaults, savePersonaDefaults } from './aiShopSignPrompt'

type Form = { digitalHumanName:string; voiceId:string; brandEnabled:boolean; brandKnowledgeIds:string[]; systemPrompt:string; greetings:string[]; refusalPolicy:string; capabilityList:string; idleMinutes:number; idlePhrases:string[]; presetTopics:string[]; aiTopicsEnabled:boolean }
const fields = ['digitalHumanName','voiceId','brandEnabled','brandKnowledgeIds','systemPrompt','greetings','refusalPolicy','capabilityList','idleMinutes','idlePhrases','presetTopics','aiTopicsEnabled'] as const
const message = useMessage()
const saved = readPersonaDefaults()
const AI_SHOP_SIGN_KEY = 'touhao-ai-shop-sign'
const resourceRevision = ref(0)
function refreshResourceOptions(){resourceRevision.value++}
function readAiShopSignData(){try{return JSON.parse(localStorage.getItem(AI_SHOP_SIGN_KEY)||'{}')}catch{return {}}}
const knowledgeBaseOptions = computed(()=>{
  void resourceRevision.value
  const data=readAiShopSignData()
  const knowledge=Array.isArray(data.knowledge)&&data.knowledge.length?data.knowledge:[
    {id:'kb-store-guide',name:'门店服务资料',knowledgeType:'document-search'},
    {id:'kb-store-data',name:'门店经营数据查询',knowledgeType:'data-query'},
  ]
  return knowledge.filter((item:any)=>item?.id).map((item:any)=>({label:`${item.name||item.id}（${item.id}） · ${item.knowledgeType==='data-query'?'数据查询':'文档搜索'}`,value:String(item.id)}))
})
function makeForm(source:Record<string,unknown>):Form {
  const defaults = DEFAULT_PERSONA_COPY
  return {
    digitalHumanName:typeof source.digitalHumanName==='string'?source.digitalHumanName:defaults.digitalHumanName,
    voiceId:typeof source.voiceId==='string'?source.voiceId:defaults.voiceId,
    brandEnabled:typeof source.brandEnabled==='boolean'?source.brandEnabled:defaults.brandEnabled,
    brandKnowledgeIds:Array.isArray(source.brandKnowledgeIds)?[...source.brandKnowledgeIds as string[]]:[...defaults.brandKnowledgeIds],
    systemPrompt:typeof source.systemPrompt==='string'?source.systemPrompt:defaults.systemPrompt,
    greetings:Array.isArray(source.greetings)?[...source.greetings]:[...defaults.greetings],
    refusalPolicy:typeof source.refusalPolicy==='string'?source.refusalPolicy:defaults.refusalPolicy,
    capabilityList:typeof source.capabilityList==='string'?source.capabilityList:defaults.capabilityList,
    idleMinutes:typeof source.idleMinutes==='number'?source.idleMinutes:defaults.idleMinutes,
    idlePhrases:Array.isArray(source.idlePhrases)?[...source.idlePhrases]:[...defaults.idlePhrases],
    presetTopics:Array.isArray(source.presetTopics)?[...source.presetTopics]:[...defaults.presetTopics],
    aiTopicsEnabled:typeof source.aiTopicsEnabled==='boolean'?source.aiTopicsEnabled:defaults.aiTopicsEnabled,
  }
}
const form = reactive<Form>(makeForm(saved))
const voiceIdOptions = computed(()=>{
  void resourceRevision.value
  const data=readAiShopSignData()
  const voices=Array.isArray(data.voices)&&data.voices.length?data.voices:[
    {voiceId:'voice-futian-01',sample:'福田店接待样本-女声.wav',status:'success'},
    {voiceId:'voice-cashier-03',sample:'收银台提示音样本.wav',status:'success'},
    {voiceId:'voice-xiaoshan-04',sample:'萧山区店节假日播报.m4a',status:'success'},
  ]
  const options=voices.filter((voice:any)=>voice.status==='success'&&voice.voiceId&&voice.voiceId!=='—').map((voice:any)=>({label:`${voice.voiceId}（${voice.sample||'声音复刻资源'}）`,value:String(voice.voiceId)}))
  if(form.voiceId&&!options.some((option:any)=>option.value===form.voiceId))options.unshift({label:`${form.voiceId}（当前默认资源）`,value:form.voiceId})
  return options
})
const persisted = ref(JSON.stringify(makeForm(saved)))
const savedAt = ref(typeof saved.updatedAt==='string'?saved.updatedAt:'')
const error = ref('')
const dirty = computed(()=>JSON.stringify(form)!==persisted.value)
const lastSaved = computed(()=>savedAt.value?new Date(savedAt.value).toLocaleString('zh-CN',{hour12:false}):'')
function restoreRecommended(){
  if(dirty.value&&!window.confirm('恢复产品预置文案会覆盖当前未保存的修改，确定继续吗？'))return
  Object.assign(form,makeForm(DEFAULT_PERSONA_COPY));error.value=''
}
function discard(){Object.assign(form,JSON.parse(persisted.value));error.value=''}
function save(){
  const textFields = [form.systemPrompt,form.refusalPolicy,form.capabilityList]
  if(textFields.some(x=>!x.trim())||[form.greetings,form.idlePhrases,form.presetTopics].some(list=>!list.length||list.some(x=>!String(x).trim()))){error.value='请填写所有文本项，并移除空白话术后再保存';return}
  error.value=''
  const payload = Object.fromEntries(fields.map(key=>[key,form[key]]))
  savePersonaDefaults(payload)
  persisted.value=JSON.stringify(makeForm(payload))
  savedAt.value=new Date().toISOString()
  message.success('人物默认配置已保存')
}
</script>

<style scoped>
.defaults-page{max-width:1120px;padding:20px;font-size:13px}.page-header,.section-head,.actions{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}.page-header{margin-bottom:14px}.page-header h1,.section-head h2{margin:0;color:var(--text-primary)}.page-header h1{font-size:22px;line-height:1.35}.section-head h2{font-size:16px;line-height:1.4}.page-header p,.section-head p,.actions span{margin:4px 0 0;color:var(--text-secondary);font-size:12px;line-height:1.55}.notice{margin-bottom:12px}.card{padding:18px;margin-bottom:12px;background:#fff;border:1px solid var(--border-color);border-radius:10px}.section-head{justify-content:flex-start;align-items:center;margin-bottom:14px}.section-head>span:first-child{width:26px;height:26px;flex:none;display:grid;place-items:center;border-radius:7px;background:#eff6ff;color:#2563eb;font-size:11px;font-weight:700}.section-head>div:nth-child(2){flex:1}.section-head :deep(.n-tag){flex:none;width:auto}.phrase-row{display:flex;align-items:center;gap:10px;margin-bottom:8px}.phrase-row>span{width:22px;text-align:right;color:var(--text-secondary)}.phrase-row .n-input{flex:1}.two-column{display:grid;grid-template-columns:1fr 1fr;gap:20px}.interval,.toggle{display:flex;align-items:center;gap:10px}.interval{width:180px}.toggle{justify-content:space-between;max-width:300px;margin-bottom:14px}.actions{align-items:center;padding:14px 18px;background:#fff;border:1px solid var(--border-color);border-radius:10px}.card :deep(.n-input__textarea-el){font-size:13px;line-height:1.6}.card :deep(.n-input__input-el){font-size:13px}.card :deep(.n-form-item-label){font-size:13px}@media(max-width:760px){.defaults-page{padding:16px}.card{padding:16px}.two-column{grid-template-columns:1fr}.actions,.page-header{flex-direction:column}.phrase-row{gap:8px}}
.route-row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 14px;margin:0 0 12px;border:1px solid var(--border-color);border-radius:8px;background:#fafbfc}.route-row strong{font-size:13px;color:var(--text-primary)}.route-row p{margin:4px 0 0;color:var(--text-secondary);font-size:12px;line-height:1.55}
</style>
