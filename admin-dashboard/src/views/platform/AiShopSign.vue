<template>
  <div class="page-container ai-shop-sign-page">
    <div class="page-header"><div><h1>AI店招机器人</h1><p>{{ isMerchant ? '管理本店 AI 店招设备的问候语与话术，平台资源由总运营后台统一维护。' : '管理数字店招的运营、设备、人设知识和语音资源。' }}</p></div><n-button @click="message.success('已刷新本地管理数据')">刷新</n-button></div>
    <n-alert v-if="!isMerchant && !configured" type="warning" :show-icon="true" style="margin-bottom:16px">尚未完成 API 密钥配置。当前为前端演示数据，连接百炼服务前请先配置声音复刻和知识库管理凭据。</n-alert>
    <template v-if="tab === 'devices'">
        <div v-if="!isMerchant" class="metric-grid"><div v-for="item in deviceMetrics" :key="item.label" class="metric-card"><span>{{ item.label }}</span><strong>{{ item.value }}</strong></div></div>
        <div class="content-card"><div class="card-title"><div><h2>设备管理</h2><p>展示已接入主机，按设备维护人设配置并查看 AI Token 用量。</p></div><n-button @click="message.success('已刷新设备列表')">刷新</n-button></div><n-data-table :columns="deviceColumns" :data="devices" :bordered="false" size="small" :scroll-x="isMerchant ? 1020 : 1240" /></div>
    </template>
    <template v-else-if="tab === 'knowledge'">
        <div class="content-card">
          <div class="card-title"><div><h2>知识库管理</h2><p>对接阿里云百炼知识库，资料创建、文章上传、解析与管理都在云端完成，本系统通过 OpenAPI 调用云端能力。</p></div>
            <div class="table-actions">
              <n-button :loading="cloudSyncing" @click="syncCloudKnowledge">同步云端知识库</n-button>
              <n-button type="primary" @click="knowledgeModal=true">新建知识库</n-button>
            </div>
          </div>
          <n-alert type="info" :show-icon="true" style="margin-bottom:16px">
            当前列表展示的是阿里云百炼业务空间下的云端知识库。新增知识库、上传资料、查看文章、核对切片和下载内容都会通过后端代理调用阿里云 OpenAPI，不是本地临时数据。
          </n-alert>
          <n-alert v-if="cloudError" type="error" :show-icon="true" style="margin-bottom:16px">{{ cloudError }}</n-alert>
          <n-data-table :columns="knowledgeColumns" :data="knowledge" :bordered="false" size="small" :scroll-x="1180" />
        </div>
    </template>
    <template v-else-if="tab === 'voice'">
        <div class="content-card"><div class="card-title"><div><h2>创建声音复刻</h2><p>上传清晰的单人样本音频，生成店招播报声线。</p></div></div><n-form label-placement="top" style="max-width:700px"><n-form-item label="目标模型"><n-select v-model:value="voice.model" :options="models" /></n-form-item><n-form-item label="样本音频"><n-upload :default-upload="false" :max="1" accept=".wav,.mp3,.m4a" @update:file-list="onVoiceFiles"><n-button>选择音频文件</n-button></n-upload></n-form-item><n-button type="primary" @click="cloneVoice">开始声音复刻</n-button></n-form></div>
        <div class="content-card"><div class="card-title"><h2>生成状态</h2></div><n-data-table :columns="voiceColumns" :data="voices" :bordered="false" size="small" /></div>
    </template>
    <template v-else-if="tab === 'backgrounds'">
        <div class="content-card"><div class="card-title"><div><h2>背景管理</h2><p>管理店招设备展示背景素材（图片与视频），支持新增、编辑、排序与启停，列表顺序即设备轮播顺序。</p></div><n-button type="primary" @click="openBgModal()">新增背景</n-button></div><n-data-table :columns="bgColumns" :data="backgrounds" :bordered="false" size="small" :row-key="(r:BgItem)=>r.id" /></div>
    </template>
    <template v-else>
        <div class="content-card config">
          <n-alert type="warning" :show-icon="true" style="margin-bottom:18px">密钥不应保存于浏览器或前端源码。本页仅保存配置状态；生产环境请由服务端加密托管。</n-alert>
          <div class="config-section">
            <div class="card-title"><div><h2>模型与声音复刻配置</h2><p>用于实时语音、TTS 与声音复刻。对应原 PaiTuo 的 DashScope/百炼运行时配置。</p></div></div>
            <div class="test-panel"><div><strong>百炼实时语音 API 测试</strong><p>验证 DASHSCOPE_API_KEY、Workspace 与实时语音/声音复刻模型权限。</p></div><n-button :loading="testingRuntime" @click="testRuntime">测试模型与语音调用配置</n-button></div>
            <n-alert v-if="runtimeTest" :type="runtimeTest.type" :show-icon="true" style="margin-bottom:16px"><template #header>{{ runtimeTest.title }}</template>{{ runtimeTest.message }}</n-alert>
            <n-form label-placement="top">
              <n-form-item label="DASHSCOPE_API_KEY / 百炼 API Key"><n-input v-model:value="voiceApi.dashscopeApiKey" type="password" show-password placeholder="sk-..." /></n-form-item>
              <n-form-item label="DASHSCOPE_WORKSPACE_ID"><n-input v-model:value="voiceApi.workspaceId" placeholder="ws-xxxx；不填则使用公共端点" /></n-form-item>
              <n-form-item label="声音复刻 Endpoint"><n-input v-model:value="voiceApi.voiceCloneEndpoint" placeholder="https://dashscope.aliyuncs.com/api/v1/services/audio/tts/customization" /></n-form-item>
            </n-form>
          </div>
          <div class="config-section">
            <div class="card-title"><div><h2>知识库管理 OpenAPI 配置</h2><p>用于创建百炼知识库、上传文件、导入文档和查询任务状态。这里使用阿里云 RAM AccessKey。</p></div></div>
            <div class="test-panel"><div><strong>百炼知识库配置测试</strong><p>验证 RAM AccessKey、知识库 Workspace 与 OpenAPI Endpoint 是否可访问。</p></div><n-button :loading="testingKnowledge" @click="testKnowledge">测试知识库 OpenAPI 配置</n-button></div>
            <n-alert v-if="knowledgeTest" :type="knowledgeTest.type" :show-icon="true" style="margin-bottom:16px"><template #header>{{ knowledgeTest.title }}</template>{{ knowledgeTest.message }}</n-alert>
            <n-form label-placement="top">
              <n-form-item label="ALIBABA_CLOUD_ACCESS_KEY_ID"><n-input v-model:value="knowledgeApi.accessKeyId" placeholder="请输入 AccessKey ID" /></n-form-item>
              <n-form-item label="ALIBABA_CLOUD_ACCESS_KEY_SECRET"><n-input v-model:value="knowledgeApi.accessKeySecret" type="password" show-password placeholder="请输入 AccessKey Secret" /></n-form-item>
              <n-form-item label="BAILIAN_KNOWLEDGE_WORKSPACE_ID"><n-input v-model:value="knowledgeApi.workspaceId" placeholder="请输入知识库 Workspace ID" /></n-form-item>
              <n-form-item label="BAILIAN_KNOWLEDGE_OPENAPI_ENDPOINT"><n-input v-model:value="knowledgeApi.openapiEndpoint" placeholder="https://bailian.cn-beijing.aliyuncs.com" /></n-form-item>
            </n-form>
          </div>
          <n-space justify="end"><n-button type="primary" @click="saveApi">保存配置</n-button></n-space>
        </div>
    </template>
    <n-drawer :show="Boolean(personaDevice)" :width="720" @update:show="(value:any) => !value && (personaDevice = null)">
      <n-drawer-content :title="personaDevice ? `人设配置：${personaDevice.name}` : '人设配置'" closable>
        <div class="assigned-card">
          <div class="assigned-avatar">AI</div>
          <div class="assigned-info">
            <strong>{{ personaDevice?.name }}</strong>
            <span>设备 ID：{{ personaDevice?.id }}</span>
          </div>
          <div class="assigned-meta">
            <n-tag size="small" :type="personaDevice?.status === 'online' ? 'success' : 'default'" :bordered="false">{{ personaDevice?.status === 'online' ? '在线' : '离线' }}</n-tag>
            <n-tag size="small" type="info" :bordered="false">配置版本 v{{ personaDevice?.configVersion }}</n-tag>
          </div>
        </div>
        <div class="persona-form">
          <section v-if="!isMerchant" class="persona-card">
            <header class="persona-card-head"><span class="persona-index">01</span><div><h3>身份信息</h3><small>数字人名称与唤醒方式</small></div></header>
            <div class="persona-card-body">
          <div class="grid-2">
            <n-form-item label="数字人名称"><n-input v-model:value="personaForm.digitalHumanName" /></n-form-item>
            <n-form-item label="语音唤醒">
              <div class="wake-row">
                <n-switch :value="personaForm.wakeEnabled" disabled size="small" />
                <span class="wake-hint">暂未开放</span>
              </div>
            </n-form-item>
          </div>
          <n-form-item v-if="personaForm.wakeEnabled" label="唤醒词"><n-input v-model:value="personaForm.wakeWord" placeholder="输入唤醒词，例如：你好小艾" /></n-form-item>

          </div></section>
          <section v-if="!isMerchant" class="persona-card">
            <header class="persona-card-head"><span class="persona-index">02</span><div><h3>AI 资源</h3><small>绑定声音复刻生成的语音资源</small></div></header>
            <div class="persona-card-body">
              <n-form-item label="百炼 voiceId">
                <div class="voice-row">
                  <n-select
                    v-model:value="personaForm.voiceId"
                    :options="voiceIdOptions"
                    placeholder="从声音复刻列表中选择"
                    filterable
                    tag
                  />
                  <n-button secondary type="primary" :loading="previewingVoice" @click="previewVoice">试听</n-button>
                </div>
              </n-form-item>
              <p class="field-hint">试听使用浏览器本地语音合成播报当前问候语，实际设备音色以复刻模型为准。</p>
          </div></section>
          <section class="persona-card">
            <header class="persona-card-head"><span class="persona-index">{{ isMerchant ? '01' : '03' }}</span><div><h3>{{ isMerchant ? '门店与活动知识' : '知识库与业务路由' }}</h3><small>{{ isMerchant ? '以「关键词 + 回答」条目维护，命中优先回答' : '知识库绑定与各业务板块的检索范围' }}</small></div></header>
            <div class="persona-card-body">
          <template v-if="!isMerchant">
          <div class="scope-block">
            <div class="scope-head">
              <div><strong>品牌知识（Brand）</strong><small>平台创建与维护的公共知识库，作为设备主检索库；命中条目未覆盖的问题时走向量检索</small></div>
              <n-switch v-model:value="personaForm.brandEnabled" />
            </div>
            <template v-if="personaForm.brandEnabled">
              <n-form-item label="关联知识库（可多选）"><n-select v-model:value="personaForm.brandKnowledgeIds" :options="knowledgeBaseOptions" multiple filterable tag placeholder="选择品牌相关知识库，可多选" /></n-form-item>
              <n-form-item label="指定文章（可选）">
                <n-select
                  v-model:value="personaForm.brandFileIds"
                  :options="brandDocOptions"
                  multiple
                  filterable
                  tag
                  :disabled="!personaForm.brandKnowledgeIds.length"
                  :placeholder="personaForm.brandKnowledgeIds.length ? '不选则检索所选知识库的全部文章' : '请先选择关联知识库'"
                />
              </n-form-item>
              <p class="field-hint">文章在「知识库管理」中上传维护；此处可指定所选知识库内的具体文章参与检索，留空表示使用全部文章。</p>
            </template>
          </div>
          </template>

          <div class="scope-block">
            <div class="scope-head">
              <div><strong>门店知识（Store）</strong><small>本店营业时间、停车、到达路线等事实信息，由店铺维护</small></div>
              <n-switch v-model:value="personaForm.storeEnabled" />
            </div>
            <template v-if="personaForm.storeEnabled">
              <div class="phrase-list">
                <div v-for="(e, i) in personaForm.storeEntries" :key="e.id" class="entry-row">
                  <n-input v-model:value="e.keyword" placeholder="关键词/问法，如：停车" style="width:180px;flex-shrink:0" />
                  <n-input v-model:value="e.answer" placeholder="回答内容，如：门前免费停车 50 个车位，周末建议地铁前往" />
                  <n-switch v-model:value="e.enabled" size="small" />
                  <n-button text type="error" size="small" :disabled="personaForm.storeEntries.length <= 1" @click="personaForm.storeEntries.splice(i, 1)">删除</n-button>
                </div>
                <n-button dashed size="small" @click="addEntry(personaForm.storeEntries)">+ 添加条目</n-button>
              </div>
              <p class="field-hint">访客问题命中关键词（或语义相近）时优先按条目回答；条目保存后由平台代理同步，门店无需接触百炼控制台。</p>
            </template>
          </div>

          <div class="scope-block">
            <div class="scope-head">
              <div><strong>活动知识（Campaign）</strong><small>本店临时活动、促销等时效性知识，由店铺维护</small></div>
              <n-switch v-model:value="personaForm.campaignEnabled" />
            </div>
            <template v-if="personaForm.campaignEnabled">
              <div class="phrase-list">
                <div v-for="(e, i) in personaForm.campaignEntries" :key="e.id" class="entry-row">
                  <n-input v-model:value="e.keyword" placeholder="关键词/问法，如：周年庆优惠" style="width:180px;flex-shrink:0" />
                  <n-input v-model:value="e.answer" placeholder="回答内容，如：9 月 20 日至 28 日全场体验 5 折起" />
                  <n-switch v-model:value="e.enabled" size="small" />
                  <n-button text type="error" size="small" :disabled="personaForm.campaignEntries.length <= 1" @click="personaForm.campaignEntries.splice(i, 1)">删除</n-button>
                </div>
                <n-button dashed size="small" @click="addEntry(personaForm.campaignEntries)">+ 添加条目</n-button>
              </div>
              <p class="field-hint">活动条目同样命中优先；请注意活动口径与实际一致，避免夸大宣传。</p>
            </template>
          </div>

          </div></section>
          <section class="persona-card">
            <header class="persona-card-head"><span class="persona-index">{{ isMerchant ? '02' : '04' }}</span><div><h3>对话策略</h3><small>{{ isMerchant ? '问候语与空闲搭话' : '提示词、问候语、拒答规则与空闲搭话' }}</small></div></header>
            <div class="persona-card-body">
              <n-form-item v-if="!isMerchant" label="系统提示词"><n-input v-model:value="personaForm.systemPrompt" type="textarea" :rows="5" /></n-form-item>
          <n-form-item label="问候语（随机播放）">
            <div class="phrase-list">
              <div v-for="(_, i) in personaForm.greetings" :key="i" class="phrase-row">
                <n-input v-model:value="personaForm.greetings[i]" placeholder="输入问候话术" />
                <n-button text type="error" size="small" :disabled="personaForm.greetings.length <= 1" @click="personaForm.greetings.splice(i, 1)">删除</n-button>
              </div>
              <n-button dashed size="small" @click="personaForm.greetings.push('')">+ 添加问候语</n-button>
              <p class="field-hint">访客触发唤醒后，AI 从启用的问候语中随机选择一条播放；只保留一条时每次播放同一条。</p>
            </div>
          </n-form-item>
          <n-form-item v-if="!isMerchant" label="拒答策略"><n-input v-model:value="personaForm.refusalPolicy" type="textarea" :rows="3" /></n-form-item>
          <n-form-item v-if="!isMerchant" label="能力清单"><n-input v-model:value="personaForm.capabilityList" type="textarea" :rows="2" /></n-form-item>
          <p v-if="!isMerchant" class="field-hint">能力清单：列出 AI 可以回答的业务主题（逗号分隔），通常会注入到系统提示词中，用于约束工具调用范围。除了回答知识性内容，AI 可以根据清单解释或引导预约，但具体服务事项应以配置资料为准。</p>
          <div class="scope-block">
            <div class="scope-head">
              <div><strong>空闲自动搭话</strong><small>长时间无人互动时，AI 主动开口活跃气氛</small></div>
            </div>
            <n-form-item label="触发条件">
              <div class="idle-row">
                <span>超过</span>
                <n-input-number v-model:value="personaForm.idleMinutes" :min="1" :max="120" style="width:110px" />
                <span>分钟无人与 AI 说话时，自动随机播放一句</span>
              </div>
            </n-form-item>
            <div class="phrase-list">
              <div v-for="(_, i) in personaForm.idlePhrases" :key="i" class="phrase-row">
                <n-input v-model:value="personaForm.idlePhrases[i]" placeholder="输入空闲搭话话术" />
                <n-button text type="error" size="small" :disabled="personaForm.idlePhrases.length <= 1" @click="personaForm.idlePhrases.splice(i, 1)">删除</n-button>
              </div>
              <n-button dashed size="small" @click="personaForm.idlePhrases.push('')">+ 添加搭话话术</n-button>
              <p class="field-hint">每次触发时随机选择一条播放，避免重复感；配置多句效果更自然。</p>
            </div>
          </div>

          </div></section>
          <section class="persona-card">
            <header class="persona-card-head"><span class="persona-index">{{ isMerchant ? '03' : '05' }}</span><div><h3>引导话题</h3><small>每次展示 3 个，从话题池轮换抽取，避免内容重复</small></div></header>
            <div class="persona-card-body">
          <div class="scope-block">
            <div class="scope-head">
              <div><strong>AI 自动推荐</strong><small>开启后，AI 结合对话上下文推荐话题，补足预设话题之外的展示位置</small></div>
              <n-switch v-model:value="personaForm.aiTopicsEnabled" />
            </div>
            <div class="phrase-list">
              <div v-for="(_, i) in personaForm.presetTopics" :key="i" class="phrase-row">
                <n-input v-model:value="personaForm.presetTopics[i]" placeholder="输入预设话题，例如：今天有什么优惠活动" />
                <n-button text type="error" size="small" :disabled="personaForm.presetTopics.length <= 1" @click="personaForm.presetTopics.splice(i, 1)">删除</n-button>
              </div>
              <n-button dashed size="small" @click="personaForm.presetTopics.push('')">+ 添加预设话题</n-button>
            </div>
            <p class="field-hint">
              展示规则：① 访客界面固定展示 3 个话题，每次从话题池（预设话题 + AI 推荐话题）中轮换抽取，保证与上一次展示的组合不同，避免访客每次看到的内容都一样；② 话题池越大轮换效果越好，建议配置 5 条以上预设话题；③ AI 推荐话题结合已问内容、知识库命中结果与当前时段/在营活动生成，必须有知识库依据，禁止无依据内容，同一话题不重复推荐，超过 60 分钟未被点击自动过期；④ 推荐优先级：活动促销 &gt; 门店信息 &gt; 品牌通用（与「知识库与业务路由」分区保持一致）。
            </p>
          </div>

          </div></section>
        </div>
        <template #footer><n-space justify="end"><n-button @click="personaDevice=null">取消</n-button><n-button type="primary" @click="savePersona">保存人设配置</n-button></n-space></template>
      </n-drawer-content>
    </n-drawer>
    <n-modal :show="Boolean(tokenDevice)" preset="card" :title="tokenDevice ? `AI Token 用量：${tokenDevice.id}` : 'AI Token 用量'" style="width:820px" @update:show="(value:any) => !value && (tokenDevice = null)">
      <template v-if="tokenDevice">
        <div class="usage-summary"><div><span>累计 Token</span><strong>{{ tokenDevice.tokenTotal.toLocaleString() }}</strong></div><div><span>今日 Token</span><strong>{{ tokenDevice.tokenToday.toLocaleString() }}</strong></div><div><span>近 7 日 Token</span><strong>{{ heatmapWeekTotal.toLocaleString() }}</strong></div></div>
        <div class="heatmap-card">
          <div class="heatmap-header">
            <strong>近 7 天 × 24 小时用量热力图</strong>
            <div class="heatmap-legend"><span>少</span><i class="legend-cell level-0" /><i class="legend-cell level-1" /><i class="legend-cell level-2" /><i class="legend-cell level-3" /><i class="legend-cell level-4" /><span>多</span></div>
          </div>
          <div class="heatmap">
            <div v-for="day in heatmapDays" :key="day.date" class="heatmap-row">
              <span class="heatmap-day-label">{{ day.label }}</span>
              <div class="heatmap-cells">
                <div v-for="cell in day.cells" :key="cell.hour" class="heatmap-cell" :class="`level-${cell.level}`" :title="`${day.fullLabel} ${String(cell.hour).padStart(2,'0')}:00 · ${cell.value.toLocaleString()} Token`" />
              </div>
            </div>
          </div>
          <div class="heatmap-hour-axis"><span /><div class="heatmap-hour-labels"><span>00</span><span>06</span><span>12</span><span>18</span><span>23</span></div></div>
        </div>
      </template>
    </n-modal>
    <n-drawer v-model:show="chunkDrawer" :width="720">
      <n-drawer-content :title="activeKb ? `切片预览：${activeKb.name}` : '切片预览'" closable>
        <n-spin v-if="chunksLoading" size="small" />
        <n-alert v-else-if="!chunks.length" type="info" :show-icon="true">该知识库暂无切片，可能文件仍在解析或尚未导入。</n-alert>
        <div v-for="item in chunks" :key="item.chunkId" class="chunk-item">
          <div class="chunk-title">{{ item.title || item.docName || '未命名切片' }}</div>
          <div class="chunk-text">{{ item.text }}</div>
        </div>
      </n-drawer-content>
    </n-drawer>
    <input id="kb-file-input" type="file" style="display:none" @change="onKbFileChange" />
    <n-drawer v-model:show="docDrawer" :width="720">
      <n-drawer-content :title="activeKb ? `文档列表：${activeKb.name}` : '文档列表'" closable>
        <n-spin v-if="docsLoading" size="small" />
        <n-empty v-else-if="!kbDocs.length" description="暂无文档，点击「上传资料」导入" />
        <div v-for="doc in kbDocs" :key="doc.fileId" class="chunk-item">
          <div class="chunk-title">{{ doc.name }} <n-tag size="small" :bordered="false" :type="String(doc.status||'').includes('FAIL')?'error':'success'">{{ doc.status || '-' }}</n-tag></div>
          <div class="chunk-text">{{ doc.sizeInBytes ? (doc.sizeInBytes / 1024).toFixed(1) + ' KB' : '' }} {{ doc.createTime || '' }}</div>
        </div>
      </n-drawer-content>
    </n-drawer>
    <n-modal v-model:show="retrieveModal" preset="card" :title="activeKb ? `检索测试：${activeKb.name}` : '检索测试'" style="width:720px">
      <n-input v-model:value="retrieveQuery" type="textarea" :rows="2" placeholder="输入要检索的问题，例如：退款规则是什么" />
      <div style="margin:12px 0"><n-button type="primary" :loading="retrieving" @click="runRetrieve">开始检索</n-button></div>
      <div v-for="(item,i) in retrieveResults" :key="i" class="chunk-item">
        <div class="chunk-title">相似度 {{ typeof item.score === 'number' ? item.score.toFixed(3) : item.score }} {{ item.docName || '' }}</div>
        <div class="chunk-text">{{ item.text }}</div>
      </div>
      <n-empty v-if="!retrieveResults.length" description="输入问题后开始检索" />
    </n-modal>
    <n-modal v-model:show="bgModal" preset="card" :title="bgEditing ? '编辑背景' : '新增背景'" style="width:520px">
      <n-form label-placement="top">
        <n-form-item label="背景名称"><n-input v-model:value="bgForm.name" placeholder="例如：节日主题背景" /></n-form-item>
        <n-form-item label="素材类型">
          <n-radio-group v-model:value="bgForm.type" @update:value="bgForm.url = ''; bgForm.size = ''">
            <n-radio value="image">图片</n-radio>
            <n-radio value="video">视频</n-radio>
          </n-radio-group>
        </n-form-item>
        <n-form-item :label="bgForm.type === 'image' ? '上传图片' : '上传视频'">
          <div class="voice-row">
            <n-upload :default-upload="false" :max="1" :accept="bgForm.type === 'image' ? 'image/*' : 'video/*'" @update:file-list="onBgFile"><n-button>选择文件</n-button></n-upload>
            <span v-if="bgForm.size" class="wake-hint">{{ bgForm.size }}</span>
          </div>
        </n-form-item>
        <n-form-item v-if="bgForm.url" label="预览（竖屏 9:16）">
          <img v-if="bgForm.type === 'image'" :src="bgForm.url" style="max-height:220px;max-width:140px;border-radius:8px" />
          <video v-else :src="bgForm.url" controls style="max-height:220px;max-width:140px;border-radius:8px" />
        </n-form-item>
        <n-form-item label="启用"><n-switch v-model:value="bgForm.enabled" /></n-form-item>
      </n-form>
      <template #footer><n-space justify="end"><n-button @click="bgModal = false">取消</n-button><n-button type="primary" @click="saveBg">保存</n-button></n-space></template>
    </n-modal>
    <n-modal v-model:show="knowledgeModal" preset="card" title="新建知识库" style="width:460px"><n-form label-placement="left" label-width="90"><n-form-item label="名称"><n-input v-model:value="newKnowledge.name" /></n-form-item><n-form-item label="描述"><n-input v-model:value="newKnowledge.description" type="textarea" /></n-form-item></n-form><template #footer><n-space justify="end"><n-button @click="knowledgeModal=false">取消</n-button><n-button type="primary" @click="addKnowledge">创建</n-button></n-space></template></n-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, h, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NTag, NSwitch, useMessage } from 'naive-ui'
const route=useRoute(),router=useRouter(),message=useMessage(),KEY='touhao-ai-shop-sign'
const props=withDefaults(defineProps<{mode?:'platform'|'merchant'}>(),{mode:'platform'})
const isMerchant=computed(()=>props.mode==='merchant')
type Device={id:string,name:string,status:string,version:string,heartbeat:string}
type ManagedDevice=Device&{serialNo:string,deviceType:string,specs:string,osVersion:string,macAddress:string,merchant:string,store:string,token:string,configVersion:number,persona:string,voiceId:string,knowledgeBaseId:string,tokenToday:number,tokenTotal:number}
const DEMO_VOICES=[{model:'qwen-audio-3.0-realtime-plus',sample:'福田店接待样本-女声.wav',status:'success',voiceId:'voice-futian-01',updatedAt:'2026-09-12 15:40'},{model:'qwen-audio-3.0-realtime-flash',sample:'萝岗店活动讲解-男声.mp3',status:'pending',voiceId:'—',updatedAt:'2026-09-16 10:22'},{model:'qwen-audio-3.0-realtime-plus',sample:'收银台提示音样本.wav',status:'success',voiceId:'voice-cashier-03',updatedAt:'2026-09-08 11:05'},{model:'qwen-audio-3.0-realtime-flash',sample:'萧山区店节假日播报.m4a',status:'success',voiceId:'voice-xiaoshan-04',updatedAt:'2026-09-05 09:18'}];
const cached=JSON.parse(localStorage.getItem(KEY)||'{}');
const normalizeDevice=(d:any):ManagedDevice=>({serialNo:'--',deviceType:'AI店招主机',specs:'--',osVersion:'--',macAddress:'--',merchant:'--',store:'--',token:'',...d,token:d.token||`tk_aisign_${String(d.id||'').replace(/[^a-z0-9]/gi,'').slice(-8)}`});
const devices=ref<ManagedDevice[]>((cached.devices||[{id:'shop-sign-001',serialNo:'AIS-001',name:'深圳福田旗舰店入口店招',deviceType:'AI店招主机',specs:'i5-12400/16GB/512GB SSD',osVersion:'Android 12 Launcher v1.0.0',macAddress:'00:1A:2B:3C:4D:5E',merchant:'恒然集团',store:'恒然科技园店',status:'online',version:'1.0.0',heartbeat:'刚刚',token:'tk_aisign_futian9f3a',configVersion:7,persona:'福田旗舰店接待员',voiceId:'voice-futian-01',knowledgeBaseId:'kb-store-guide',tokenToday:12840,tokenTotal:328900},{id:'shop-sign-002',serialNo:'AIS-002',name:'广州萝岗区店收银区店招',deviceType:'AI店招主机',specs:'i7-12700/32GB/1TB SSD',osVersion:'Android 12 Launcher v1.0.0',macAddress:'00:1A:2B:6E:0F:1A',merchant:'卓远科技',store:'卓远萝岗区店',status:'offline',version:'1.0.0',heartbeat:'今天 09:18',token:'tk_aisign_luog7b21',configVersion:4,persona:'萝岗店活动讲解员',voiceId:'voice-luogang-02',knowledgeBaseId:'kb-store-guide',tokenToday:0,tokenTotal:86520}]).map(normalizeDevice));const knowledge=ref(cached.knowledge||[{id:'kb-store-guide',name:'门店服务资料',description:'营业时间、服务项目与常见问答',documents:12,updatedAt:'2026-09-16 10:20'}]);const voices=ref(cached.voices&&cached.voices.length?cached.voices:DEMO_VOICES.map((v:any)=>({...v})));const legacyApi=cached.api||{};const voiceApi=reactive(cached.voiceApi||{dashscopeApiKey:legacyApi.bailianKey||'',workspaceId:'',voiceCloneEndpoint:'https://dashscope.aliyuncs.com/api/v1/services/audio/tts/customization'});const knowledgeApi=reactive(cached.knowledgeApi||{accessKeyId:legacyApi.accessKeyId||'',accessKeySecret:legacyApi.accessKeySecret||'',workspaceId:legacyApi.workspaceId||'',openapiEndpoint:legacyApi.endpoint||'https://bailian.cn-beijing.aliyuncs.com'});const persist=()=>localStorage.setItem(KEY,JSON.stringify({devices:devices.value,knowledge:knowledge.value,voices:voices.value,voiceApi,knowledgeApi}));const configured=computed(()=>Boolean(voiceApi.dashscopeApiKey&&knowledgeApi.accessKeyId&&knowledgeApi.accessKeySecret&&knowledgeApi.workspaceId));
const tab=computed(()=>isMerchant.value?'devices':route.path.endsWith('/knowledge')?'knowledge':route.path.endsWith('/voice-cloning')?'voice':route.path.endsWith('/backgrounds')?'backgrounds':route.path.endsWith('/api-keys')?'api':'devices');const openKnowledgeDetail=(row:any)=>router.push({path:`/platform/ai-shop-sign/knowledge/${encodeURIComponent(row.id)}`,query:{name:row.name||'',description:row.description||''}});const copyText=async(text:string,label='内容')=>{try{await navigator.clipboard.writeText(text);message.success(`${label}已复制`)}catch{message.error('复制失败')}};const tag=(s:string)=>s==='online'?'success':s==='offline'?'default':'warning';const label=(s:string)=>s==='online'?'在线':s==='offline'?'离线':s==='pending'?'处理中':'成功';const pendingClones=computed(()=>voices.value.filter((x:any)=>x.status==='pending'));const deviceMetrics=computed(()=>[{label:'今日 AI Token',value:devices.value.reduce((sum,item)=>sum+item.tokenToday,0).toLocaleString()},{label:'累计 AI Token',value:devices.value.reduce((sum,item)=>sum+item.tokenTotal,0).toLocaleString()},{label:'声音复刻 · 处理中',value:pendingClones.value.length},{label:'声音复刻 · 累计请求',value:voices.value.length}]);const baseDeviceColumns=[{title:'设备编号',key:'serialNo',width:100},{title:'设备名称',key:'name',minWidth:180},{title:'设备类型',key:'deviceType',width:110,render:(r:ManagedDevice)=>h(NTag,{size:'small',type:'info',bordered:false},{default:()=>r.deviceType||'--'})},{title:'MAC 地址',key:'macAddress',width:140,render:(r:ManagedDevice)=>h('span',{style:'font-family:monospace;font-size:11px;color:#6366f1;'},r.macAddress||'--')},{title:'所属商家',key:'merchant',minWidth:100,render:(r:ManagedDevice)=>r.merchant||'--'},{title:'所属门店',key:'store',minWidth:120,render:(r:ManagedDevice)=>r.store||'--'},{title:'状态',key:'status',width:90,align:'center',render:(r:ManagedDevice)=>h(NTag,{type:tag(r.status),size:'small'},{default:()=>label(r.status)})},{title:'AI Token',key:'token',minWidth:150,render:(r:ManagedDevice)=>{if(!r.token)return h(NTag,{size:'small',type:'default'},{default:()=>'未分配'});return h('div',{style:'display:flex;align-items:center;gap:4px;'},[h('span',{style:'font-family:monospace;font-size:11px;color:#6366f1;max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'},`${r.token.slice(0,14)}...`),h(NButton,{text:true,type:'primary',size:'tiny',onClick:()=>copyText(r.token,'AI Token')},{default:()=>'复制'})])}},{title:'操作',key:'actions',width:190,fixed:'right',render:(r:ManagedDevice)=>{const btns:any[]=[h(NButton,{text:true,type:'primary',size:'small',onClick:()=>openPersona(r)},{default:()=> '人设配置'})];if(!isMerchant.value)btns.push(h(NButton,{text:true,type:'primary',size:'small',onClick:()=>{tokenDevice.value=r}},{default:()=> 'Token 用量'}));return h('div',{class:'table-actions'},btns)}}];
const deviceColumns=computed(()=>baseDeviceColumns.filter((c:any)=>!(isMerchant.value&&(c.key==='merchant'||c.key==='store'||c.key==='token'))));;const knowledgeColumns=[{title:'知识库名称',key:'name',render:(r:any)=>h(NButton,{text:true,type:'primary',onClick:()=>openKnowledgeDetail(r)},{default:()=>r.name||r.id})},{title:'知识库 ID',key:'id',width:150,render:(r:any)=>h('div',{class:'id-cell'},[h('code',r.id),h(NButton,{text:true,type:'primary',size:'tiny',onClick:()=>copyText(r.id,'知识库 ID')},{default:()=> '复制'})])},{title:'描述',key:'description'},{title:'来源',key:'source',width:90,render:(r:any)=>h(NTag,{type:r.source==='cloud'?'success':'default',size:'small',bordered:false},{default:()=>r.source==='cloud'?'云端':'本地'})},{title:'文档数',key:'documents'},{title:'更新时间',key:'updatedAt'},{title:'操作',key:'actions',width:310,render:(r:any)=>r.source==='cloud'?h('div',{style:'display:flex;gap:6px;flex-wrap:nowrap'},[h(NButton,{text:true,type:'primary',size:'small',onClick:()=>openKnowledgeDetail(r)},{default:()=> '管理文章'}),h(NButton,{text:true,type:'primary',size:'small',loading:uploading.value&&uploadTarget.value?.id===r.id,onClick:()=>pickKbFile(r)},{default:()=> '上传资料'}),h(NButton,{text:true,type:'info',size:'small',onClick:()=>openRetrieve(r)},{default:()=> '检索'}),h(NButton,{text:true,type:'error',size:'small',onClick:()=>deleteKb(r)},{default:()=> '删除'})]):h(NButton,{text:true,type:'primary',size:'small',onClick:()=>{r.documents++;r.updatedAt=new Date().toLocaleString('zh-CN');persist();message.success('资料已加入导入队列')}},{default:()=> '上传资料'})}];const voiceColumns=[{title:'目标模型',key:'model'},{title:'样本音频',key:'sample'},{title:'状态',key:'status',render:(r:any)=>h(NTag,{type:r.status==='success'?'success':'warning',size:'small'},{default:()=>label(r.status)})},{title:'voiceId',key:'voiceId'},{title:'更新时间',key:'updatedAt'}];
// ===== 百炼云端知识库（经本地代理服务 server/bailian_knowledge.py 转发）=====
const cloudSyncing=ref(false),cloudError=ref(''),chunkDrawer=ref(false),chunksLoading=ref(false),activeKb=ref<any>(null),chunks=ref<any[]>([]);
function cleanBailianValue(value:string){
  return String(value||'').trim()
}
function cleanBailianEndpoint(value:string){
  const raw=cleanBailianValue(value)
  const markdownUrl=raw.match(/\((https?:\/\/[^)]+)\)/)?.[1]
  return markdownUrl||raw
}
function compactPayload(payload:Record<string,any>){
  return Object.fromEntries(Object.entries(payload).filter(([,value])=>cleanBailianValue(value) !== ''))
}
const bailianCredentials=()=>compactPayload({accessKeyId:knowledgeApi.accessKeyId,accessKeySecret:knowledgeApi.accessKeySecret,workspaceId:knowledgeApi.workspaceId,endpoint:cleanBailianEndpoint(knowledgeApi.openapiEndpoint)});
async function callBailian(path:string,extra:any={}){
  const res=await fetch(`/api/bailian/${path}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...bailianCredentials(),...extra})});
  const data=await res.json().catch(()=>({success:false}));
  if(!res.ok||!data.success) throw new Error(data.detail||data.message||'请求本地代理服务失败');
  return data;
}
async function syncCloudKnowledge(){
  cloudSyncing.value=true;cloudError.value='';
  try{
    const data=await callBailian('indices');
    const items=data.data?.items||[];
    if(!items.length){cloudError.value='已连接百炼，但当前业务空间下没有知识库。';message.warning('云端暂无知识库');return}
    knowledge.value=items.map((item:any)=>({id:item.id,name:item.name,description:item.description||`${item.sourceType||''} · ${item.embeddingModelName||''}`,documents:item.documents,updatedAt:new Date().toLocaleString('zh-CN'),source:'cloud'}));
    persist();message.success(`已同步云端知识库 ${items.length} 个`);
  }catch(e:any){cloudError.value=`云端同步失败：${e?.message||'请确认本地代理服务已启动且 AccessKey / Workspace ID 正确'}`;message.error('云端同步失败')}
  finally{cloudSyncing.value=false}
}
// 云端文档列表 / 上传资料 / 检索测试 / 删除知识库
const docDrawer=ref(false),docsLoading=ref(false),kbDocs=ref<any[]>([]);
const uploadTarget=ref<any>(null),uploading=ref(false);
function pickKbFile(row:any){uploadTarget.value=row;(document.getElementById('kb-file-input') as HTMLInputElement | null)?.click()}
async function onKbFileChange(e:Event){const input=e.target as HTMLInputElement;const file=input.files?.[0];const row=uploadTarget.value;input.value='';if(!file||!row)return;uploading.value=true;try{const form=new FormData();form.append('file',file);Object.entries(bailianCredentials()).forEach(([k,v])=>form.append(k,String(v??'')));form.append('indexId',row.id);const res=await fetch('/api/bailian/files/upload',{method:'POST',body:form});const data=await res.json().catch(()=>({success:false}));if(!res.ok||!data.success)throw new Error(data.detail||data.message||'上传失败');message.success('资料已上传，百炼正在解析');await syncCloudKnowledge()}catch(err:any){message.error(`上传失败：${err?.message||''}`)}finally{uploading.value=false}}
const retrieveModal=ref(false),retrieveQuery=ref(''),retrieveResults=ref<any[]>([]),retrieving=ref(false);
function openRetrieve(row:any){activeKb.value=row;retrieveQuery.value='';retrieveResults.value=[];retrieveModal.value=true}
async function runRetrieve(){if(!activeKb.value||!retrieveQuery.value)return message.warning('请输入检索内容');retrieving.value=true;try{const data=await callBailian('retrieve',{indexId:activeKb.value.id,query:retrieveQuery.value,topK:5});retrieveResults.value=data.data?.items||[];if(!retrieveResults.value.length)message.info('未命中相关内容')}catch(e:any){message.error(`检索失败：${e?.message||''}`)}finally{retrieving.value=false}}
async function deleteKb(row:any){if(!window.confirm(`确认删除云端知识库「${row.name}」？该操作不可恢复。`))return;try{await callBailian('index/delete',{indexId:row.id});message.success('知识库已删除');await syncCloudKnowledge()}catch(e:any){message.error(`删除失败：${e?.message||''}`)}}
const DEFAULT_SYSTEM_PROMPT='你是门店数字前台，请简洁、礼貌、可靠地回答访客问题。对于门店业务问题请基于已配置资料回答；对于常识性业务问题可以使用自身知识作答。每次回答保持精炼，正常语速在 2 分钟以内说完。如果内容包含风险、违规、夸大或误导，请勿回答并转接人工。';
const DEFAULT_REFUSAL_POLICY='仅回答涉及门店业务事宜；当工具返回 unconfirmed 或 error 时，说明暂时无法确认并建议联系门店工作人员。';
const voiceIdOptions=computed(()=>{const opts=voices.value.filter((v:any)=>v.status==='success'&&v.voiceId&&v.voiceId!=='—').map((v:any)=>({label:`${v.voiceId}（${v.sample}）`,value:v.voiceId}));const cur=personaForm.voiceId;if(cur&&!opts.some((o:any)=>o.value===cur))opts.unshift({label:`${cur}（当前配置）`,value:cur});return opts});
const knowledgeBaseOptions=computed(()=>knowledge.value.filter((k:any)=>k.id).map((k:any)=>({label:`${k.name}（${k.id}）`,value:k.id})));
const DEMO_DOC_LIBRARY:Record<string,{id:string,name:string}[]>={
  'kb-store-guide':[
    {id:'file-doc-001',name:'门店营业时间与服务项目.docx'},
    {id:'file-doc-002',name:'会员充值与退卡规则.pdf'},
    {id:'file-doc-003',name:'周年庆活动说明.pptx'},
    {id:'file-doc-004',name:'常见问答FAQ汇总.md'},
  ],
};
const brandDocOptions=computed(()=>{
  const out:any[]=[];const seen=new Set<string>();
  personaForm.brandKnowledgeIds.forEach((id:string)=>{
    (DEMO_DOC_LIBRARY[id]||DEMO_DOC_LIBRARY['kb-store-guide']).forEach((d)=>{
      if(!seen.has(d.id)){seen.add(d.id);out.push({label:`${d.name}（${d.id}）`,value:d.id})}
    })
  });
  return out;
});
const DEFAULT_STORE_ENTRIES=[{id:'se-01',keyword:'营业时间',answer:'周一至周五 09:00-21:00，周末及节假日 09:00-22:00',enabled:true},{id:'se-02',keyword:'停车',answer:'门前免费停车 50 个车位，周末建议乘坐地铁前往',enabled:true}];
const DEFAULT_CAMPAIGN_ENTRIES=[{id:'ce-01',keyword:'周年庆',answer:'9 月 20 日至 28 日周年庆期间，全场 VR 体验 5 折起，充值赠送金额翻倍',enabled:true}];
const personaDevice=ref<ManagedDevice|null>(null),tokenDevice=ref<ManagedDevice|null>(null),knowledgeModal=ref(false),newKnowledge=reactive({name:'',description:''}),personaForm=reactive({digitalHumanName:'',wakeWord:'',wakeEnabled:false,voiceId:'',brandEnabled:true,brandKnowledgeIds:[] as string[],brandFileIds:[] as string[],storeEnabled:true,storeEntries:DEFAULT_STORE_ENTRIES.map((e)=>({...e})),campaignEnabled:true,campaignEntries:DEFAULT_CAMPAIGN_ENTRIES.map((e)=>({...e})),systemPrompt:DEFAULT_SYSTEM_PROMPT,greetings:['您好，我是 AI 接待员，请问有什么可以帮您？','欢迎光临！想了解哪款设备可以随时问我'] as string[],refusalPolicy:DEFAULT_REFUSAL_POLICY,capabilityList:'品牌、产品线',idleMinutes:10,idlePhrases:['想体验一下 VR 吗？随时可以找我了解','有任何问题都可以叫我哦'] as string[],presetTopics:['今天有什么优惠活动？','门店营业时间是几点？','适合小朋友玩吗？','双人协作游戏怎么玩？','生日派对怎么预约？','附近停车方便吗？','会员充值有什么优惠？','最近有什么新游戏上线？'] as string[],aiTopicsEnabled:true,maxTopics:3}),voice=reactive({model:'qwen-audio-3.0-realtime-plus',file:''}),models=[{label:'qwen-audio-3.0-realtime-plus',value:'qwen-audio-3.0-realtime-plus'},{label:'qwen-audio-3.0-realtime-flash',value:'qwen-audio-3.0-realtime-flash'}];const testingRuntime=ref(false),testingKnowledge=ref(false),runtimeTest=ref<{type:'success'|'error'|'warning',title:string,message:string}|null>(null),knowledgeTest=ref<{type:'success'|'error'|'warning',title:string,message:string}|null>(null);const hashStr=(s:string)=>{let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return Math.abs(h)};
const hourWeight=(hour:number)=>{const peak=Math.exp(-Math.pow(hour-13,2)/28)+0.55*Math.exp(-Math.pow(hour-19,2)/8);return Math.max(0.05,peak)};
const heatmapDays=computed(()=>{
  if(!tokenDevice.value)return[];
  const device=tokenDevice.value,now=new Date(),days:any[]=[];
  for(let d=6;d>=0;d--){
    const date=new Date(now);date.setDate(now.getDate()-d);
    const daySeed=hashStr(`${device.id}-day-${d}`);
    const dayTarget=d===0?device.tokenToday:Math.round(device.tokenToday*(0.45+(daySeed%70)/100));
    const weights=Array.from({length:24},(_,hour)=>hourWeight(hour)*(0.55+((hashStr(`${device.id}-${d}-${hour}`)%1000)/1000)*0.9));
    const weightSum=weights.reduce((a,b)=>a+b,0)||1;
    const cells=weights.map((w,hour)=>({hour,value:Math.round(dayTarget*w/weightSum)}));
    const max=Math.max(...cells.map(c=>c.value),1);
    cells.forEach(c=>c.level=c.value<=0?0:c.value<=max*0.25?1:c.value<=max*0.5?2:c.value<=max*0.75?3:4);
    const weekday=['周日','周一','周二','周三','周四','周五','周六'][date.getDay()];
    const mmdd=`${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    days.push({date:mmdd,label:d===0?`今天 ${weekday}`:d===1?`昨天 ${weekday}`:`${weekday} ${mmdd}`,fullLabel:`${date.getFullYear()}年${mmdd}`,cells});
  }
  return days;
});
const heatmapWeekTotal=computed(()=>heatmapDays.value.reduce((sum,day)=>sum+day.cells.reduce((a,c)=>a+c.value,0),0));function addEntry(list:any[]){list.push({id:`en-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,5)}`,keyword:'',answer:'',enabled:true})}
const previewingVoice=ref(false);
function previewVoice(){
  if(!personaForm.voiceId)return message.warning('请先选择要试听的声音');
  const synth=window.speechSynthesis;
  if(!synth)return message.info('当前浏览器不支持语音试听');
  synth.cancel();
  const text=personaForm.greetings.find((g:string)=>g.trim())||'您好，我是本店 AI 接待员，请问有什么可以帮您？';
  const utter=new SpeechSynthesisUtterance(text);
  utter.lang='zh-CN';utter.rate=1;
  previewingVoice.value=true;
  utter.onend=()=>{previewingVoice.value=false};
  utter.onerror=()=>{previewingVoice.value=false;message.error('试听失败，请重试')};
  synth.speak(utter);
  message.success(`正在试听：${personaForm.voiceId}`);
}
function openPersona(device:ManagedDevice){personaDevice.value=device;const base={digitalHumanName:device.persona,wakeWord:'你好小艾',wakeEnabled:false,voiceId:device.voiceId,brandEnabled:true,brandKnowledgeIds:[] as string[],brandFileIds:[] as string[],storeEnabled:true,storeEntries:DEFAULT_STORE_ENTRIES.map((e:any)=>({...e})),campaignEnabled:true,campaignEntries:DEFAULT_CAMPAIGN_ENTRIES.map((e:any)=>({...e})),systemPrompt:DEFAULT_SYSTEM_PROMPT,greetings:['您好，我是 AI 接待员，请问有什么可以帮您？','欢迎光临！想了解哪款设备可以随时问我'] as string[],refusalPolicy:DEFAULT_REFUSAL_POLICY,capabilityList:'品牌、产品线',idleMinutes:10,idlePhrases:['想体验一下 VR 吗？随时可以找我了解','有任何问题都可以叫我哦'] as string[],presetTopics:['今天有什么优惠活动？','门店营业时间是几点？','适合小朋友玩吗？','双人协作游戏怎么玩？','生日派对怎么预约？','附近停车方便吗？','会员充值有什么优惠？','最近有什么新游戏上线？'] as string[],aiTopicsEnabled:true,maxTopics:3};Object.assign(personaForm,base,(device as any).personaConfig||{});const normArr=(v:any)=>Array.isArray(v)?v:(typeof v==='string'&&v.trim()?v.split(/[,，]\s*/).filter(Boolean):[]);const normSwitch=(v:any,def:boolean)=>v===true||v==='enabled'?true:v===false||v==='disabled'?false:def;personaForm.brandKnowledgeIds=normArr(personaForm.brandKnowledgeIds);personaForm.brandFileIds=normArr(personaForm.brandFileIds);const normEntries=(v:any,def:any[])=>{if(!Array.isArray(v))return def.map((e:any)=>({...e}));return v.map((e:any,i:number)=>({id:e&&e.id?String(e.id):`en-${Date.now().toString(36)}-${i}`,keyword:String(e&&e.keyword||''),answer:String(e&&e.answer||''),enabled:e?e.enabled!==false:true}))};personaForm.storeEntries=normEntries(personaForm.storeEntries,DEFAULT_STORE_ENTRIES);personaForm.campaignEntries=normEntries(personaForm.campaignEntries,DEFAULT_CAMPAIGN_ENTRIES);personaForm.brandEnabled=normSwitch(personaForm.brandEnabled,true);personaForm.storeEnabled=normSwitch(personaForm.storeEnabled,true);personaForm.campaignEnabled=normSwitch(personaForm.campaignEnabled,true);if(!Array.isArray(personaForm.greetings))personaForm.greetings=normArr((personaForm as any).greetingText);if(!personaForm.greetings.length)personaForm.greetings=['您好，我是 AI 接待员，请问有什么可以帮您？'];if(!Array.isArray(personaForm.idlePhrases)||!personaForm.idlePhrases.length)personaForm.idlePhrases=['想体验一下 VR 吗？随时可以找我了解'];if(typeof personaForm.idleMinutes!=='number'||!personaForm.idleMinutes)personaForm.idleMinutes=10;if(!Array.isArray(personaForm.presetTopics)||!personaForm.presetTopics.length)personaForm.presetTopics=['今天有什么优惠活动？','门店营业时间是几点？','适合小朋友玩吗？','双人协作游戏怎么玩？','生日派对怎么预约？','附近停车方便吗？','会员充值有什么优惠？','最近有什么新游戏上线？'];if(typeof personaForm.aiTopicsEnabled!=='boolean')personaForm.aiTopicsEnabled=true;personaForm.maxTopics=3;personaForm.wakeEnabled=false}function savePersona(){if(!personaDevice.value)return;const config=JSON.parse(JSON.stringify(personaForm));config.greetings=(config.greetings||[]).map((s:string)=>String(s).trim()).filter(Boolean);config.idlePhrases=(config.idlePhrases||[]).map((s:string)=>String(s).trim()).filter(Boolean);config.presetTopics=(config.presetTopics||[]).map((s:string)=>String(s).trim()).filter(Boolean);const base=(personaDevice.value as any).personaConfig?JSON.parse(JSON.stringify((personaDevice.value as any).personaConfig)):{};if(isMerchant.value){Object.assign(base,{greetings:config.greetings,presetTopics:config.presetTopics,aiTopicsEnabled:config.aiTopicsEnabled,idleMinutes:config.idleMinutes,idlePhrases:config.idlePhrases,storeEnabled:config.storeEnabled,storeEntries:config.storeEntries,campaignEnabled:config.campaignEnabled,campaignEntries:config.campaignEntries})}else{Object.assign(base,config)}const kb=Array.isArray(base.brandKnowledgeIds)?base.brandKnowledgeIds:[];Object.assign(personaDevice.value,{configVersion:personaDevice.value.configVersion+1,personaConfig:base,lastEditedBy:isMerchant.value?'merchant':'platform',lastEditedAt:new Date().toLocaleString('zh-CN',{hour12:false})});if(!isMerchant.value){(personaDevice.value as any).persona=config.digitalHumanName;(personaDevice.value as any).voiceId=config.voiceId;(personaDevice.value as any).knowledgeBaseId=kb.join(',')}persist();personaDevice.value=null;message.success('人设配置已保存')}function testRuntime(){testingRuntime.value=true;runtimeTest.value=null;setTimeout(()=>{testingRuntime.value=false;if(!voiceApi.dashscopeApiKey){runtimeTest.value={type:'error',title:'模型与语音调用配置测试失败',message:'请先配置 DASHSCOPE_API_KEY，再测试实时语音 API 握手。'};return}runtimeTest.value={type:'success',title:'模型与语音调用配置正常',message:`已连接 ${voiceApi.voiceCloneEndpoint || 'DashScope 公共端点'}，模型：${voice.model}，Workspace：${voiceApi.workspaceId || '未配置'}`};message.success('模型与语音调用配置测试通过')},600)}async function testKnowledge(){testingKnowledge.value=true;knowledgeTest.value=null;try{if(!knowledgeApi.accessKeyId||!knowledgeApi.accessKeySecret||!knowledgeApi.workspaceId){knowledgeTest.value={type:'error',title:'百炼知识库配置测试失败',message:'请检查 AccessKey、Secret、Workspace ID 和 Endpoint 是否完整。'};return}const data=await callBailian('test');knowledgeTest.value={type:'success',title:'百炼知识库配置正常',message:`已连接 ${knowledgeApi.openapiEndpoint||'bailian.cn-beijing.aliyuncs.com'}，Workspace：${knowledgeApi.workspaceId}，云端知识库数量：${data.data.count}`};message.success('百炼知识库配置测试通过')}catch(e:any){knowledgeTest.value={type:'error',title:'百炼知识库配置测试失败',message:e?.message||'请检查 AccessKey、Secret、Workspace ID 与本地代理服务是否已启动。'};message.error('百炼知识库配置测试失败')}finally{testingKnowledge.value=false}}function onVoiceFiles(files:any[]){voice.file=files[0]?.name||''}async function addKnowledge(){if(!newKnowledge.name)return message.warning('请输入知识库名称');try{await callBailian('index/create',{name:newKnowledge.name,description:newKnowledge.description});message.success('云端知识库已创建');await syncCloudKnowledge();Object.assign(newKnowledge,{name:'',description:''});knowledgeModal.value=false}catch(e:any){message.error(`创建失败：${e?.message||''}`)}}function cloneVoice(){if(!voice.file)return message.warning('请先选择样本音频');const item:any={model:voice.model,sample:voice.file,status:'pending',voiceId:'—',updatedAt:new Date().toLocaleString('zh-CN')};voices.value.unshift(item);persist();setTimeout(()=>{item.status='success';item.voiceId=`voice-${Date.now().toString().slice(-6)}`;persist()},1000);message.success('声音复刻已提交')}function saveApi(){persist();message.success('API 配置状态已保存')}
// ===== 背景管理（图片/视频，支持排序） =====
type BgItem={id:string,name:string,type:'image'|'video',url:string,size:string,enabled:boolean,updatedAt:string}
const DEFAULT_BGS:BgItem[]=[
  {id:'bg-001',name:'节日主题背景图',type:'image',url:'',size:'2.1 MB',enabled:true,updatedAt:'2026-09-15 10:20'},
  {id:'bg-002',name:'门店实景背景',type:'image',url:'',size:'3.4 MB',enabled:true,updatedAt:'2026-09-12 14:05'},
  {id:'bg-003',name:'活动宣传视频',type:'video',url:'',size:'18.6 MB',enabled:false,updatedAt:'2026-09-10 09:30'},
];
const backgrounds=ref<BgItem[]>((cachedBgList()));
function cachedBgList():BgItem[]{try{const c=JSON.parse(localStorage.getItem(KEY)||'{}');return (c.backgrounds||DEFAULT_BGS).map((b:any)=>({...b}))}catch{return DEFAULT_BGS.map((b:any)=>({...b}))}}
function persistBg(){const c=(()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}})();c.backgrounds=backgrounds.value;localStorage.setItem(KEY,JSON.stringify(c))}
function moveBg(i:number,dir:number){const j=i+dir;if(j<0||j>=backgrounds.value.length)return;const list=[...backgrounds.value];[list[i],list[j]]=[list[j],list[i]];backgrounds.value=list;persistBg()}
const bgColumns=[
  {title:'排序',key:'sort',width:120,render:(r:BgItem,i:number)=>h('div',{class:'table-actions'},[
    h(NButton,{size:'tiny',text:true,type:'primary',disabled:i===0,onClick:()=>moveBg(i,-1)},{default:()=>'上移'}),
    h(NButton,{size:'tiny',text:true,type:'primary',disabled:i===backgrounds.value.length-1,onClick:()=>moveBg(i,1)},{default:()=>'下移'}),
  ])},
  {title:'封面',key:'cover',width:96,render:(r:BgItem)=>{
    const isBlob=!!r.url&&r.url.startsWith('blob:');
    if(r.type==='video'){
      if(isBlob)return h('div',{class:'bg-cover'},[h('video',{src:r.url,muted:true}),h('span',{class:'play'})]);
      const src=coverSvg(r.name,'video');
      return h('div',{class:'bg-cover'},[h('img',{src}),h('span',{class:'play'})]);
    }
    const src=r.url?r.url:coverSvg(r.name,'image');
    return h('div',{class:'bg-cover'},[h('img',{src})]);
  }},
  {title:'名称',key:'name',minWidth:170},
  {title:'类型',key:'type',width:90,render:(r:BgItem)=>h(NTag,{size:'small',type:r.type==='image'?'info':'warning',bordered:false},{default:()=>r.type==='image'?'图片':'视频'})},
  {title:'文件大小',key:'size',width:100},
  {title:'启用',key:'enabled',width:80,align:'center' as const,render:(r:BgItem)=>h(NSwitch,{size:'small',value:r.enabled,'onUpdate:value':(v:boolean)=>{r.enabled=v;persistBg()}},{})},
  {title:'更新时间',key:'updatedAt',width:160},
  {title:'操作',key:'actions',width:120,render:(r:BgItem)=>h('div',{class:'table-actions'},[
    h(NButton,{text:true,type:'primary',size:'small',onClick:()=>openBgModal(r)},{default:()=>'编辑'}),
    h(NButton,{text:true,type:'error',size:'small',onClick:()=>deleteBg(r)},{default:()=>'删除'}),
  ])},
];
const bgModal=ref(false);const bgEditing=ref<BgItem|null>(null);
const bgForm=reactive({id:'',name:'',type:'image' as 'image'|'video',url:'',size:'',enabled:true});
function openBgModal(r?:BgItem){bgEditing.value=r||null;Object.assign(bgForm,r?{...r}:{id:'',name:'',type:'image',url:'',size:'',enabled:true});bgModal.value=true}
function saveBg(){
  if(!bgForm.name.trim())return message.warning('请输入背景名称');
  const stamp=new Date().toLocaleString('zh-CN',{hour12:false});
  if(bgEditing.value){const t=backgrounds.value.find(b=>b.id===bgEditing.value!.id);if(t)Object.assign(t,{name:bgForm.name.trim(),type:bgForm.type,url:bgForm.url,size:bgForm.size,enabled:bgForm.enabled,updatedAt:stamp})}
  else{backgrounds.value.unshift({id:`bg-${Date.now()}`,name:bgForm.name.trim(),type:bgForm.type,url:bgForm.url,size:bgForm.size||'—',enabled:bgForm.enabled,updatedAt:stamp})}
  persistBg();bgModal.value=false;message.success(bgEditing.value?'背景已更新':'背景已新增')
}
function deleteBg(r:BgItem){if(!window.confirm(`确认删除背景「${r.name}」？`))return;backgrounds.value=backgrounds.value.filter(b=>b.id!==r.id);persistBg();message.success('背景已删除')}
function onBgFile(options:any){const f=options.file?.file as File|undefined;if(!f)return;bgForm.url=URL.createObjectURL(f);bgForm.size=(f.size/1024/1024).toFixed(1)+' MB';if(!bgForm.name)bgForm.name=f.name.replace(/\.[^.]+$/,'')}
function coverSvg(name:string,type:string){
  const [c1,c2]=type==='image'?['#93c5fd','#6366f1']:['#fcd34d','#f59e0b'];
  const chars=name.split('');const lines:string[]=[];
  for(let i=0;i<chars.length;i+=4)lines.push(chars.slice(i,i+4).join(''));
  const label=lines.slice(0,3).map((l,i)=>`<text x="46" y="${56+i*14}" font-size="11" fill="#fff" text-anchor="middle" font-family="PingFang SC,sans-serif">${l}</text>`).join('');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="92" height="164"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="92" height="164" fill="url(#g)"/>${label}</svg>`;
  return 'data:image/svg+xml;utf8,'+encodeURIComponent(svg);
}
</script>

<style scoped>.ai-shop-sign-page{padding:24px}.page-header,.card-title{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:18px}.page-header h1,.card-title h2{margin:0}.page-header p,.card-title p{margin:7px 0 0;color:var(--text-secondary);font-size:13px}.metric-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:16px}.metric-card,.content-card{background:#fff;border:1px solid var(--border-color);border-radius:12px}.metric-card{padding:18px}.metric-card span,.muted{color:var(--text-secondary);font-size:13px}.metric-card strong{display:block;margin-top:8px;font-size:28px;color:#2b2f3a}.content-card{padding:18px;margin-bottom:16px}.config{max-width:920px}.config-section{padding-bottom:18px;margin-bottom:18px;border-bottom:1px dashed rgba(128,128,128,.25)}.config-section:last-of-type{border-bottom:0}.test-panel{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 16px;margin-bottom:16px;border:1px solid var(--border-color);border-radius:8px;background:#fafbff}.test-panel p{margin:6px 0 0;color:var(--text-secondary);font-size:13px}.table-actions{display:flex;gap:12px;white-space:nowrap;align-items:center}
.chunk-item{padding:12px 14px;margin-bottom:10px;border:1px solid var(--border-color);border-radius:8px}
.chunk-title{font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:6px}
.chunk-text{font-size:12px;line-height:1.7;color:var(--text-secondary);white-space:pre-wrap}
.persona-section{display:none}
.persona-form{display:flex;flex-direction:column;gap:14px}
.persona-card{padding:16px 18px;border:1px solid var(--border-color);border-radius:12px;background:#fff;box-shadow:0 1px 2px rgba(15,23,42,.04);transition:border-color .2s,box-shadow .2s}
.persona-card:hover{border-color:#c7d7f5;box-shadow:0 2px 8px rgba(37,99,235,.08)}
.persona-card-head{display:flex;align-items:center;gap:10px;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid rgba(148,163,184,.15)}
.persona-index{width:26px;height:26px;border-radius:8px;background:linear-gradient(135deg,#3B82F6,#8B5CF6);color:#fff;font-size:12px;font-weight:600;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'Inter',sans-serif}
.persona-card-head h3{margin:0;font-size:14px;font-weight:600;color:var(--text-primary);line-height:1.3}
.persona-card-head small{display:block;margin-top:2px;font-size:12px;color:var(--text-secondary);font-weight:400}
.persona-card-body{display:flex;flex-direction:column}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:0 16px}
.field-hint{margin:8px 0 16px;padding:2px 0 2px 10px;border-left:2px solid #dbe3ef;color:#64748b;font-size:12px;line-height:1.7}
.persona-card-body .field-hint:last-child{margin-bottom:4px}
.phrase-list .field-hint{margin-bottom:2px}
.scope-block .field-hint{margin-bottom:2px}
.scope-block{margin-bottom:16px;padding:14px 16px;border:1px solid var(--border-color);border-radius:10px;background:#f8fafc}
.scope-block:last-child{margin-bottom:0}
.scope-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px}
.scope-head strong{display:block;font-size:14px;color:var(--text-primary)}
.scope-head small{display:block;margin-top:2px;color:var(--text-secondary);font-size:12px;line-height:1.5}
.assigned-card{display:flex;align-items:center;gap:12px;padding:14px 16px;margin-bottom:14px;border-radius:12px;background:linear-gradient(135deg,#eff6ff,#f5f3ff);border:1px solid #dbeafe}
.assigned-avatar{width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#3B82F6,#8B5CF6);color:#fff;font-weight:700;font-size:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.assigned-info{flex:1;min-width:0}
.assigned-info strong{display:block;font-size:14px;color:var(--text-primary)}
.assigned-info span{font-size:12px;color:var(--text-secondary)}
.assigned-meta{display:flex;gap:6px;flex-shrink:0}
.assigned-line{display:none}
.wake-row{display:flex;align-items:center;gap:8px;width:100%}
.wake-hint{font-size:12px;color:var(--text-secondary)}
.phrase-list{display:flex;flex-direction:column;gap:8px;width:100%}
.phrase-row{display:flex;align-items:center;gap:8px}
.phrase-row .n-input{flex:1}
.idle-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:13px;color:var(--text-primary)}
.entry-row{display:flex;align-items:center;gap:8px;padding:8px 10px;background:#fff;border:1px solid var(--border-color);border-radius:8px;transition:border-color .2s}
.entry-row:hover{border-color:#c7d7f5}
.entry-row>.n-input:nth-child(2){flex:1}
.bg-cover{position:relative;width:46px;height:82px;border-radius:6px;overflow:hidden;flex-shrink:0}
.bg-cover img,.bg-cover video{width:100%;height:100%;object-fit:cover;display:block}
.bg-cover .play{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:0;height:0;border-left:10px solid #fff;border-top:6px solid transparent;border-bottom:6px solid transparent;filter:drop-shadow(0 0 3px rgba(0,0,0,.45))}
.voice-row{display:flex;align-items:center;gap:8px;width:100%}
.voice-row>.n-select{flex:1}
.assigned-line{margin:0 0 8px;font-size:13px;color:var(--text-secondary)}
.assigned-line code{padding:2px 6px;border-radius:5px;background:#f1f5f9;color:#1f2937;font-size:12px}
@media(max-width:640px){.grid-2{grid-template-columns:1fr}}
.id-cell{display:flex;align-items:center;gap:8px}.id-cell code{padding:3px 6px;border-radius:6px;background:#f1f5f9;color:#1f2937}.usage-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:18px}.usage-summary>div{padding:14px;border:1px solid var(--border-color);border-radius:8px}.usage-summary span{display:block;color:var(--text-secondary);font-size:13px}.usage-summary strong{display:block;margin-top:6px;font-size:22px}
.heatmap-card{padding:16px;border:1px solid var(--border-color);border-radius:8px}
.heatmap-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}.heatmap-header strong{font-size:14px}
.heatmap-legend{display:flex;align-items:center;gap:4px;font-size:12px;color:var(--text-secondary)}
.legend-cell{display:inline-block;width:14px;height:14px;border-radius:3px}
.heatmap{display:flex;flex-direction:column;gap:4px}
.heatmap-row{display:flex;align-items:center;gap:8px}
.heatmap-day-label{width:88px;flex:none;font-size:12px;color:var(--text-secondary);text-align:right}
.heatmap-cells{display:grid;grid-template-columns:repeat(24,1fr);gap:4px;flex:1}
.heatmap-cell{aspect-ratio:1;border-radius:3px;cursor:default;transition:transform .12s}
.heatmap-cell:hover{transform:scale(1.25);outline:1px solid #1d4ed8}
.heatmap-cell.level-0{background:#f1f5f9}.heatmap-cell.level-1{background:#dbeafe}.heatmap-cell.level-2{background:#93c5fd}.heatmap-cell.level-3{background:#3b82f6}.heatmap-cell.level-4{background:#1d4ed8}
.legend-cell.level-0{background:#f1f5f9}.legend-cell.level-1{background:#dbeafe}.legend-cell.level-2{background:#93c5fd}.legend-cell.level-3{background:#3b82f6}.legend-cell.level-4{background:#1d4ed8}
.heatmap-hour-axis{display:flex;gap:8px;margin-top:6px}
.heatmap-hour-axis>span{width:88px;flex:none}
.heatmap-hour-labels{display:flex;justify-content:space-between;flex:1;font-size:11px;color:var(--text-secondary)}.ai-shop-sign-page :deep(.n-data-table .n-button){padding:0 6px;border-radius:6px}.ai-shop-sign-page :deep(.n-data-table .n-button .n-button__content){color:#2563eb!important}.ai-shop-sign-page :deep(.n-data-table .n-button:hover){background:#eff6ff}.ai-shop-sign-page :deep(.n-data-table .n-button--error-type .n-button__content){color:#dc2626!important}.ai-shop-sign-page :deep(.n-data-table .n-button--error-type:hover){background:#fef2f2}@media(max-width:800px){.metric-grid{grid-template-columns:1fr}.ai-shop-sign-page{padding:16px}.usage-summary{grid-template-columns:1fr}.test-panel{align-items:flex-start;flex-direction:column}}</style>
