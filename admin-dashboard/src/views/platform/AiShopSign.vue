<template>
  <div class="page-container ai-shop-sign-page">
    <div class="page-header"><div><h1>AI店招机器人</h1><p>{{ isMerchant ? '管理本店 AI 店招设备的问候语与话术，平台资源由总运营后台统一维护。' : '管理数字店招的运营、设备、人设知识和语音资源。' }}</p></div><n-button @click="message.success('已刷新本地管理数据')">刷新</n-button></div>
    <template v-if="tab === 'devices'">
        <div v-if="!isMerchant" class="metric-grid"><div v-for="item in deviceMetrics" :key="item.label" class="metric-card"><span>{{ item.label }}</span><strong>{{ item.value }}</strong></div></div>
        <div class="content-card"><div class="card-title"><div><h2>设备管理</h2><p>展示已接入主机，按设备维护人设配置并查看 AI Token 用量。</p></div><n-button @click="message.success('已刷新设备列表')">刷新</n-button></div><n-data-table :columns="deviceColumns" :data="devices" :bordered="false" size="small" :scroll-x="isMerchant ? 1020 : 1240" /></div>
    </template>
    <template v-else-if="tab === 'knowledge'">
        <div class="content-card">
          <div class="card-title"><div><h2>知识库管理</h2><p>对接阿里云百炼知识库，资料创建、文章上传、解析与管理都在云端完成，本系统通过 OpenAPI 调用云端能力。</p></div>
            <div class="table-actions">
              <n-button :loading="cloudSyncing" @click="syncCloudKnowledge">刷新原型数据</n-button>
              <n-button type="primary" @click="knowledgeModal=true">新建知识库</n-button>
            </div>
          </div>
          <n-alert v-if="cloudError" type="error" :show-icon="true" style="margin-bottom:16px">{{ cloudError }}</n-alert>
          <n-data-table :columns="managementKnowledgeColumns" :data="knowledge" :bordered="false" size="small" :scroll-x="1100" />
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
            <div class="card-title"><div><h2>知识库服务状态</h2><p>RAM AccessKey、Workspace ID 与 Endpoint 仅能由服务端环境变量配置，浏览器不会保存或传输任何云端凭据。</p></div></div>
            <div class="test-panel"><div><strong>百炼知识库配置测试</strong><p>检查服务端代理是否已配置并可访问当前业务空间。</p></div><n-button :loading="testingKnowledge" @click="testKnowledgeService">测试知识库服务</n-button></div>
            <n-alert v-if="knowledgeTest" :type="knowledgeTest.type" :show-icon="true" style="margin-bottom:16px"><template #header>{{ knowledgeTest.title }}</template>{{ knowledgeTest.message }}</n-alert>
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
              <div><strong>品牌知识</strong><small>平台创建与维护的公共知识库，作为设备主检索库；命中条目未覆盖的问题时走向量检索</small></div>
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
              <div><strong>门店知识</strong><small>本店营业时间、停车、到达路线等事实信息，由店铺维护</small></div>
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
              <div><strong>活动知识</strong><small>本店临时活动、促销等时效性知识，由店铺维护</small></div>
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
        <template #footer><n-space justify="end"><n-button @click="personaDevice=null">取消</n-button><n-button v-if="!isMerchant" @click="router.push('/platform/ai-shop-sign/default-prompt')">管理平台默认配置</n-button><n-button type="primary" @click="savePersona">保存人设配置</n-button></n-space></template>
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
    <n-modal v-model:show="editKbModal" preset="card" title="编辑知识库" style="width:520px">
      <n-form label-placement="top">
        <n-form-item label="知识库名称" required><n-input v-model:value="editKbName" maxlength="30" show-count placeholder="请输入知识库名称" /></n-form-item>
        <n-form-item label="知识库描述" required><n-input v-model:value="editKbDesc" type="textarea" maxlength="200" show-count placeholder="请输入知识库描述" /></n-form-item>
      </n-form>
      <template #footer><n-space justify="end"><n-button @click="editKbModal=false">取消</n-button><n-button type="primary" @click="saveEditKb">保存</n-button></n-space></template>
    </n-modal>
    <n-modal v-model:show="knowledgeModal" preset="card" title="创建知识库" class="kb-modal" style="width:840px">
      <div class="kb-steps"><template v-for="(s,i) in ['基础信息','选择数据','索引设置']" :key="s"><i v-if="i" class="kb-line" :class="{on:kbStep>i}" /><div class="kb-step" :class="{active:kbStep===i+1,done:kbStep>i+1}"><b>{{ kbStep>i+1?'✓':i+1 }}</b><span>{{ s }}</span></div></template></div>
      <template v-if="kbStep===1">
        <div class="kb-create-form">
          <n-form label-placement="top" :show-feedback="false">
            <n-form-item label="知识库名称" required><n-input v-model:value="newKnowledge.name" maxlength="30" show-count placeholder="请输入知识库名称" /></n-form-item>
            <n-form-item required><template #label><span class="kb-field-label"><span>知识库描述</span><a class="kb-example" @click.prevent="fillDescriptionExample"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>示例</a></span></template><n-input v-model:value="newKnowledge.description" type="textarea" :rows="3" maxlength="200" show-count placeholder="请输入知识库描述" /></n-form-item>
          </n-form>
          <div class="kb-section">
            <p class="kb-section-label">知识库类型</p>
            <div class="kb-types">
              <div class="kb-type" :class="{on:kbType==='doc'}" @click="kbType='doc'"><div class="kb-type-head"><span class="kb-type-icon"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg></span><strong>文档搜索</strong><i class="kb-type-radio"></i></div><small>构建文档、文件、图片、Excel 混合型索引知识库，构建常规混合搜索知识库</small></div>
              <div class="kb-type" :class="{on:kbType==='data'}" @click="kbType='data'"><div class="kb-type-head"><span class="kb-type-icon"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg></span><strong>数据查询</strong><i class="kb-type-radio"></i></div><small>构建仅以数据表结构查询的数据索引体系，NL2SQL 思路，查询表头、列头，实现相对灵活的数据查询能力</small></div>
            </div>
          </div>
          <div v-if="kbType==='doc'" class="kb-section">
            <p class="kb-section-label">使用场景</p>
            <div class="kb-types kb-types-3">
              <div class="kb-type" :class="{on:kbScene==='basic-document-qa'}" @click="kbScene='basic-document-qa'"><div class="kb-type-head"><span class="kb-type-icon"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span><strong>基础文档问答</strong><i class="kb-type-radio"></i></div><small>根据用户的请求，搜索并召回文档切片信息，由模型直接生成答案</small></div>
              <div class="kb-type" :class="{on:kbScene==='visual-understanding'}" @click="kbScene='visual-understanding'"><div class="kb-type-head"><span class="kb-type-icon"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></span><strong>视觉理解</strong><i class="kb-type-radio"></i></div><small>无需文档切片，利用大模型直接理解视觉信息丰富的文档、图片等内容</small></div>
              <div class="kb-type" :class="{on:kbScene==='fast-qa'}" @click="kbScene='fast-qa'"><div class="kb-type-head"><span class="kb-type-icon"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></span><strong>极速问答</strong><i class="kb-type-radio"></i></div><small>面向高度结构化或简单文档类型，任务相对明确，提供极速低延时的问答体验</small></div>
            </div>
          </div>
        </div>
      </template>
      <template v-else-if="kbStep===2">
        <div class="kb-create-form">
          <div class="kb-ds-head"><p class="kb-section-label" style="margin:0">选择数据集</p><a class="kb-ds-link" @click="router.push('/platform/ai-shop-sign/datasets')">创建数据集 ↗</a></div>
          <p class="kb-ds-tip">从数据集内选择已解析的文件构建知识库索引，上传的文件将自动存储在数据集中。</p>
          <div class="kb-ds-row"><n-select v-model:value="kbSelDataset" :options="kbDsOptions" :render-label="kbRenderLabel" placeholder="请选择数据集"><template #action><div style="text-align:center;padding:4px 0"><a class="kb-ds-link" @click="router.push('/platform/ai-shop-sign/datasets')">创建数据集 ↗</a></div></template></n-select><n-button quaternary circle title="刷新" @click="message.info('数据集列表已刷新')"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/></svg></n-button></div>
          <p class="kb-section-label kb-mt">数据来源</p>
          <div class="kb-src">
            <template v-if="kbDsType==='file'">
              <div class="kb-type" :class="{on:kbSource==='file'}" @click="kbSource='file'"><div class="kb-type-head"><strong>选择文件</strong><i class="kb-type-radio"></i></div><small>选择应用数据类目下的文件构建索引，一次最大支持 50 个文件的导入</small></div>
              <div class="kb-type" :class="{on:kbSource==='category'}" @click="kbSource='category'"><div class="kb-type-head"><strong>选择类目</strong><i class="kb-type-radio"></i></div><small>选择数据集的文件类目，将类目下的所有文件导入并构建索引，支持自动同步</small></div>
            </template>
            <template v-else>
              <div class="kb-type" :class="{on:kbDataSrc==='upload'}" @click="kbDataSrc='upload'"><div class="kb-type-head"><strong>上传数据表</strong><i class="kb-type-radio"></i></div><small>直接上传文件并解析，支持多种文件格式，上传后的原始文件将存储在应用数据</small></div>
              <div class="kb-type" :class="{on:kbDataSrc==='select'}" @click="kbDataSrc='select'"><div class="kb-type-head"><strong>选择数据表</strong><i class="kb-type-radio"></i></div><small>选择数据中心的数据表</small></div>
            </template>
          </div>
          <p v-if="kbDsType==='file'" class="kb-section-label kb-mt">{{ kbSource==='file'?'选择文件':'选择类目' }}</p>
          <div v-if="kbDsType==='file'&&kbSource==='file'" class="kb-pick">
            <aside class="kb-pick-cats">
              <div class="kb-pick-title">类目 <em>({{ kbActiveDs.categories.length }})</em></div>
              <div v-for="c in kbActiveDs.categories" :key="c" class="kb-cat-item" :class="{active:c===kbActiveCat}" @click="kbActiveCat=c">{{ c }}</div>
            </aside>
            <div class="kb-pick-files">
              <div class="kb-pick-toolbar"><n-input v-model:value="kbFileKeyword" size="small" clearable placeholder="请输入文件名称" style="width:220px" /><span class="kb-pick-count">已选 {{ kbSelFiles.length }} / {{ kbFileRows.length }}</span></div>
              <n-data-table :columns="kbFileColumns" :data="kbFileRows" :row-key="(r:any)=>r.name" v-model:checked-row-keys="kbSelFiles" :bordered="false" size="small" :max-height="220" />
            </div>
          </div>
          <template v-else-if="kbDsType==='file'&&kbSource==='category'">
            <div class="kb-sync-row"><span class="kb-sync-label">自动同步知识库索引：</span><n-switch v-model:value="kbAutoSync" size="small" /></div>
            <p class="kb-sync-tip">开启后将自动同步数据集类目下所有文档文件，在类目下文件发生变化后，自动同步重建并更新索引</p>
            <div class="kb-pick">
              <aside class="kb-pick-cats">
                <div class="kb-pick-title">类目 <i class="kb-q">?</i></div>
                <div v-for="c in kbActiveDs.categories" :key="c" class="kb-cat-item" :class="{active:kbSelCats.includes(c)}" @click="toggleCat(c)">
                  <n-checkbox :checked="kbSelCats.includes(c)" size="small" @click.stop @update:checked="toggleCat(c)" />
                  <span class="kb-cat-name">{{ c }}</span>
                </div>
              </aside>
              <div class="kb-pick-files">
                <div class="kb-pick-toolbar"><strong class="kb-pick-head">文件列表预览</strong><span class="kb-pick-actions"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#6b7280;cursor:pointer" @click="message.info('文件列表已刷新')"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/></svg><a class="kb-ds-link" @click="message.info('请在数据集管理中导入数据')">+ 添加数据</a></span></div>
                <n-data-table :columns="kbPreviewColumns" :data="kbPreviewRows" :bordered="false" size="small" :max-height="200" />
                <div class="kb-pick-pager"><n-pagination :page="kbPreviewPage" :page-size="10" :item-count="kbPreviewRows.length" @update:page="(p:number)=>kbPreviewPage=p" /></div>
              </div>
            </div>
            <div class="kb-sel-cats">
              <p class="kb-sel-cats-label">已选类目（{{ kbSelCats.length }}/50）</p>
              <div><n-tag v-for="c in kbSelCats" :key="c" size="small" closable @close="toggleCat(c)" style="margin:0 8px 8px 0">{{ c }}</n-tag><span v-if="!kbSelCats.length" class="kb-sel-empty">尚未选择类目</span></div>
            </div>
          </template>
          <template v-else-if="kbDataSrc==='upload'">
            <p class="kb-section-label kb-mt"><i class="kb-req">*</i>数据表名称</p>
            <n-input v-model:value="kbTableName" maxlength="64" show-count placeholder="请输入数据表名称" />
            <p class="kb-section-label kb-mt"><i class="kb-req">*</i>上传数据表</p>
            <p class="kb-ds-tip">默认通过第一行数据识别列表结构 <a class="kb-ds-link" @click="message.info('通过表格第一行数据识别字段名称与类型')">查看详情</a></p>
            <n-upload :show-file-list="false" :default-upload="false" accept=".xlsx,.xls" :max-size="20" :max="1" @update:file-list="(l:any)=>{const f=l[0]?.file;if(f){kbUploadFileInfo={name:f.name,size:`${(f.size/1024).toFixed(1)} KB`};if(!kbTableName.value)kbTableName.value=f.name.replace(/\.(xlsx|xls)$/i,'')}else kbUploadFileInfo=null}">
              <n-upload-dragger><div class="kb-up-icon"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4"/><path d="M7 9l5-5 5 5"/><path d="M4 20h16"/></svg></div><p class="upload-hint">点击或拖拽上传文件</p><p class="upload-sub">上传一份 .xlsx,.xls 格式的文档，文件大小限制20MB以内。</p></n-upload-dragger>
            </n-upload>
            <div v-if="kbUploadFileInfo" class="kb-up-row"><span class="kb-up-badge">X</span><div class="kb-up-meta"><b>{{ kbUploadFileInfo.name }}</b><small>{{ kbUploadFileInfo.size }}</small></div><a class="kb-ds-link" @click="message.info('已按第一行数据识别表结构，可在下方调整')">预览</a><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="cursor:pointer" @click="kbUploadFileInfo=null;kbSchemaCols=defaultSchemaCols.map((c:any)=>({...c}))"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg></div>
            <template v-if="kbUploadFileInfo">
              <p class="kb-section-label kb-mt">表结构预览</p>
              <div class="kb-schema">
                <div class="kb-schema-head"><span>列名</span><span>描述</span><span>类型</span></div>
                <div v-for="(c,i) in kbSchemaCols" :key="i" class="kb-schema-row">
                  <n-input v-model:value="c.name" maxlength="20" />
                  <n-input v-model:value="c.desc" maxlength="20" show-count placeholder="请输入描述" />
                  <n-select v-model:value="c.type" :options="kbColTypes.map((t:string)=>({label:t,value:t}))" />
                </div>
              </div>
              <div class="kb-pick-pager"><n-pagination :page="1" :page-size="10" :item-count="kbSchemaCols.length" /></div>
            </template>
          </template>
          <template v-else>
            <p class="kb-section-label kb-mt"><i class="kb-req">*</i>选择表格</p>
            <div class="kb-pick">
              <aside class="kb-pick-cats">
                <div class="kb-pick-title">表 <n-popover trigger="hover" placement="top" :width="240" class="kb-dark-pop"><template #trigger><i class="kb-q">?</i></template><p class="kb-tip">每个节点代表一个结构化数据存储的“表”。每个知识库只能关联一个“表”</p></n-popover></div>
                <div v-for="t in kbDataTables" :key="t" class="kb-cat-item" :class="{active:t===kbSelTable}" @click="kbSelTable=t"><n-radio :checked="t===kbSelTable" size="small" @click.stop @update:checked="kbSelTable=t" /><span class="kb-cat-name">{{ t }}</span></div>
              </aside>
              <div class="kb-pick-files">
                <n-empty v-if="!kbSelTable" description="暂无数据" style="margin:70px 0" />
                <template v-else>
                  <n-data-table :columns="kbTablePreviewCols" :data="kbTableRowsPaged" :bordered="false" size="small" :max-height="240" :scroll-x="640" />
                  <div class="kb-pick-pager"><n-pagination v-model:page="kbTablePage" :page-size="8" :item-count="kbSchemaRows.length" /></div>
                </template>
              </div>
            </div>
          </template>
        </div>
      </template>
      <template v-else>
        <div class="kb-create-form">
          <template v-if="kbType==='doc'">
            <p class="kb-section-label"><i class="kb-req">*</i>切片方式</p>
            <div class="kb-chunk-grid">
              <div v-for="m in kbChunkModes" :key="m.value" class="kb-type" :class="{on:kbChunkMode===m.value}" @click="kbChunkMode=m.value"><div class="kb-type-head"><strong>{{ m.label }}</strong><i class="kb-type-radio"></i></div><small>{{ m.desc }}</small></div>
            </div>
            <div class="kb-chunk-panel">
              <template v-if="kbChunkMode==='length'">
                <div>
                  <p class="kb-slider-label"><i class="kb-req">*</i>分段预估长度</p>
                  <div class="kb-slider-row"><n-slider v-model:value="kbChunkMax" :min="10" :max="6000" :tooltip="false" /><n-input-number v-model:value="kbChunkMax" size="small" style="width:120px" /></div>
                  <div class="kb-slider-bounds"><span>10</span><span>6000</span></div>
                </div>
                <div>
                  <p class="kb-slider-label"><i class="kb-req">*</i>分段重叠长度 <i class="kb-q">?</i></p>
                  <div class="kb-slider-row"><n-slider v-model:value="kbChunkOverlap" :min="0" :max="1024" :tooltip="false" /><n-input-number v-model:value="kbChunkOverlap" size="small" style="width:120px" /></div>
                  <div class="kb-slider-bounds"><span>0</span><span>1024</span></div>
                </div>
              </template>
              <template v-else-if="kbChunkMode==='title'">
                <div>
                  <p class="kb-slider-label"><i class="kb-req">*</i>最大分段长度 <i class="kb-q">?</i></p>
                  <div class="kb-slider-row"><n-slider v-model:value="kbChunkMax" :min="10" :max="6000" :tooltip="false" /><n-input-number v-model:value="kbChunkMax" size="small" style="width:120px" /></div>
                  <div class="kb-slider-bounds"><span>10</span><span>6000</span></div>
                </div>
                <div>
                  <p class="kb-slider-label"><i class="kb-req">*</i>标题级数</p>
                  <div class="kb-slider-row"><n-slider v-model:value="kbTitleLevel" :min="1" :max="5" :tooltip="false" /><n-input-number v-model:value="kbTitleLevel" size="small" style="width:120px" /></div>
                  <div class="kb-slider-bounds"><span>1</span><span>5</span></div>
                </div>
              </template>
              <template v-else-if="kbChunkMode==='regex'">
                <div>
                  <p class="kb-slider-label"><i class="kb-req">*</i>输入正则表达式</p>
                  <n-input v-model:value="kbRegex" placeholder="" style="max-width:480px" />
                </div>
                <div>
                  <p class="kb-slider-label"><i class="kb-req">*</i>最大分段长度 <i class="kb-q">?</i></p>
                  <div class="kb-slider-row"><n-slider v-model:value="kbChunkMax" :min="10" :max="6000" :tooltip="false" /><n-input-number v-model:value="kbChunkMax" size="small" style="width:120px" /></div>
                  <div class="kb-slider-bounds"><span>10</span><span>6000</span></div>
                </div>
              </template>
              <template v-else-if="kbChunkMode==='symbol'">
                <div>
                  <p class="kb-slider-label"><i class="kb-req">*</i>标识符选择</p>
                  <n-select v-model:value="kbSymbol" :options="kbSymbolOptions" placeholder="" style="max-width:480px" clearable filterable />
                </div>
                <div>
                  <p class="kb-slider-label"><i class="kb-req">*</i>最大分段长度 <i class="kb-q">?</i></p>
                  <div class="kb-slider-row"><n-slider v-model:value="kbChunkMax" :min="10" :max="6000" :tooltip="false" /><n-input-number v-model:value="kbChunkMax" size="small" style="width:120px" /></div>
                  <div class="kb-slider-bounds"><span>10</span><span>6000</span></div>
                </div>
              </template>
              <template v-else>
                <div>
                  <p class="kb-slider-label"><i class="kb-req">*</i>最大分段长度 <i class="kb-q">?</i></p>
                  <div class="kb-slider-row"><n-slider v-model:value="kbChunkMax" :min="10" :max="6000" :tooltip="false" /><n-input-number v-model:value="kbChunkMax" size="small" style="width:120px" /></div>
                  <div class="kb-slider-bounds"><span>10</span><span>6000</span></div>
                </div>
              </template>
            </div>
            <div class="kb-switch-row"><span>Excel表头拼装 <n-popover trigger="hover" placement="top-start" :width="290"><template #trigger><i class="kb-q">?</i></template><p class="kb-tip">是否将Excel的首行数据，作为表头和每行数据进行拼装。例：首行两列分别为「姓名」「年龄」，第二行两列分别为「张三」「18」，那么开启此功能后，此Excel的切分为：“姓名：张三；年龄：“18”。<br>如果无表头，请勿开启此功能</p></n-popover></span><n-switch v-model:value="kbExcelHeader" size="small" /></div>
            <div class="kb-section"><p class="kb-section-label">向量模型</p><n-select v-model:value="kbEmbedModel" :options="kbEmbedOptions" :render-option="kbEmbedRenderOption" style="max-width:420px" /></div>
            <p class="kb-note">› 原检索参数配置入口（对应Retrieve接口，后续将下线），将通过知识检索页面配置</p>
          </template>
          <template v-else>
            <h3 class="kb-index-title">索引配置</h3>
            <p class="kb-ds-tip">针对数据表进行索引构建的配置。</p>
            <div class="kb-fields">
              <div class="kb-fields-head"><span class="kb-f-sort">排序 <i class="kb-q">?</i></span><span>字段名称</span><span>字段类型</span><span>参与检索 <i class="kb-q">?</i></span><span>参与回复 <i class="kb-q">?</i></span></div>
              <div v-for="c in kbActiveSchema" :key="c.name" class="kb-fields-row">
                <span class="kb-f-sort"><svg viewBox="0 0 10 16" width="10" height="16" fill="#c0c4cc"><circle cx="2" cy="2" r="1.4"/><circle cx="8" cy="2" r="1.4"/><circle cx="2" cy="8" r="1.4"/><circle cx="8" cy="8" r="1.4"/><circle cx="2" cy="14" r="1.4"/><circle cx="8" cy="14" r="1.4"/></svg></span>
                <span class="kb-f-name">{{ c.name }}</span>
                <span class="kb-f-type">{{ c.type }}</span>
                <n-switch :value="kbFieldSearch[c.name]!==false" size="small" @update:value="(v:boolean)=>kbFieldSearch[c.name]=v" />
                <n-switch :value="kbFieldReply[c.name]!==false" size="small" @update:value="(v:boolean)=>kbFieldReply[c.name]=v" />
              </div>
            </div>
            <div class="kb-section"><p class="kb-section-label">向量模型</p><n-select v-model:value="kbEmbedModel" :options="kbEmbedOptions" :render-option="kbEmbedRenderOption" style="max-width:420px" /></div>
            <p class="kb-note">› 原检索参数配置入口（对应Retrieve接口，后续将下线），将通过知识检索页面配置</p>
          </template>
        </div>
      </template>
      <template #footer><n-space justify="end"><n-button @click="knowledgeModal=false">取消</n-button><n-button v-if="kbStep>1" @click="kbStep--">上一步</n-button><n-button v-if="kbStep<3" type="primary" @click="kbNext">下一步</n-button><n-button v-else type="primary" @click="addPrototypeKnowledge">完成</n-button></n-space></template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, h, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NTag, NSwitch, NSpin, useMessage } from 'naive-ui'
import { DEFAULT_SYSTEM_PROMPT, DEFAULT_REFUSAL_POLICY, DEFAULT_PERSONA_COPY, PERSONA_DEFAULT_KEY } from './aiShopSignPrompt'
const route=useRoute(),router=useRouter(),message=useMessage(),KEY='touhao-ai-shop-sign'
const props=withDefaults(defineProps<{mode?:'platform'|'merchant'}>(),{mode:'platform'})
const isMerchant=computed(()=>props.mode==='merchant')
type Device={id:string,name:string,status:string,version:string,heartbeat:string}
type ManagedDevice=Device&{serialNo:string,deviceType:string,specs:string,osVersion:string,macAddress:string,merchant:string,store:string,token:string,configVersion:number,persona:string,voiceId:string,knowledgeBaseId:string,tokenToday:number,tokenTotal:number}
const DEMO_VOICES=[{model:'qwen-audio-3.0-realtime-plus',sample:'福田店接待样本-女声.wav',status:'success',voiceId:'voice-futian-01',updatedAt:'2026-09-12 15:40'},{model:'qwen-audio-3.0-realtime-flash',sample:'萝岗店活动讲解-男声.mp3',status:'pending',voiceId:'—',updatedAt:'2026-09-16 10:22'},{model:'qwen-audio-3.0-realtime-plus',sample:'收银台提示音样本.wav',status:'success',voiceId:'voice-cashier-03',updatedAt:'2026-09-08 11:05'},{model:'qwen-audio-3.0-realtime-flash',sample:'萧山区店节假日播报.m4a',status:'success',voiceId:'voice-xiaoshan-04',updatedAt:'2026-09-05 09:18'}];
const cached=JSON.parse(localStorage.getItem(KEY)||'{}');
// Remove credentials written by older versions before any later persistence.
delete cached.knowledgeApi;
delete cached.api;
const normalizeDevice=(d:any):ManagedDevice=>({serialNo:'--',deviceType:'AI店招主机',specs:'--',osVersion:'--',macAddress:'--',merchant:'--',store:'--',token:'',...d,token:d.token||`tk_aisign_${String(d.id||'').replace(/[^a-z0-9]/gi,'').slice(-8)}`});
const devices=ref<ManagedDevice[]>((cached.devices||[{id:'shop-sign-001',serialNo:'AIS-001',name:'深圳福田旗舰店入口店招',deviceType:'AI店招主机',specs:'i5-12400/16GB/512GB SSD',osVersion:'Android 12 Launcher v1.0.0',macAddress:'00:1A:2B:3C:4D:5E',merchant:'恒然集团',store:'恒然科技园店',status:'online',version:'1.0.0',heartbeat:'刚刚',token:'tk_aisign_futian9f3a',configVersion:7,persona:'福田旗舰店接待员',voiceId:'voice-futian-01',knowledgeBaseId:'kb-store-guide',tokenToday:12840,tokenTotal:328900},{id:'shop-sign-002',serialNo:'AIS-002',name:'广州萝岗区店收银区店招',deviceType:'AI店招主机',specs:'i7-12700/32GB/1TB SSD',osVersion:'Android 12 Launcher v1.0.0',macAddress:'00:1A:2B:6E:0F:1A',merchant:'卓远科技',store:'卓远萝岗区店',status:'offline',version:'1.0.0',heartbeat:'今天 09:18',token:'tk_aisign_luog7b21',configVersion:4,persona:'萝岗店活动讲解员',voiceId:'voice-luogang-02',knowledgeBaseId:'kb-store-guide',tokenToday:0,tokenTotal:86520}]).map(normalizeDevice));const knowledge=ref(cached.knowledge&&cached.knowledge.length?cached.knowledge:[{id:'kb-store-guide',name:'门店服务资料',description:'营业时间、服务项目与常见问答',version:'标准版',documents:12,updatedAt:'2026-09-16 10:20',knowledgeType:'document-search',scene:'basic-document-qa'},{id:'kb-store-data',name:'门店经营数据查询',description:'门店月度营收与会员充值流水的灵活数据查询',version:'标准版',documents:2,updatedAt:'2026-09-22 16:35',knowledgeType:'data-query',scene:'nl2sql'}]);
if(!knowledge.value.some((x:any)=>x.id==='kb-store-data'))knowledge.value.push({id:'kb-store-data',name:'门店经营数据查询',description:'门店月度营收与会员充值流水的灵活数据查询',version:'标准版',documents:2,updatedAt:'2026-09-22 16:35',knowledgeType:'data-query',scene:'nl2sql'});const voices=ref(cached.voices&&cached.voices.length?cached.voices:DEMO_VOICES.map((v:any)=>({...v})));const legacyApi=cached.api||{};const voiceApi=reactive(cached.voiceApi||{dashscopeApiKey:legacyApi.bailianKey||'',workspaceId:'',voiceCloneEndpoint:'https://dashscope.aliyuncs.com/api/v1/services/audio/tts/customization'});const knowledgeApi=reactive(cached.knowledgeApi||{accessKeyId:legacyApi.accessKeyId||'',accessKeySecret:legacyApi.accessKeySecret||'',workspaceId:legacyApi.workspaceId||'',openapiEndpoint:legacyApi.endpoint||'https://bailian.cn-beijing.aliyuncs.com'});const persist=()=>localStorage.setItem(KEY,JSON.stringify({devices:devices.value,knowledge:knowledge.value,voices:voices.value,voiceApi,knowledgeApi}));const configured=computed(()=>Boolean(voiceApi.dashscopeApiKey&&knowledgeApi.accessKeyId&&knowledgeApi.accessKeySecret&&knowledgeApi.workspaceId));
const tab=computed(()=>isMerchant.value?'devices':route.path.endsWith('/knowledge')?'knowledge':route.path.endsWith('/voice-cloning')?'voice':route.path.endsWith('/backgrounds')?'backgrounds':route.path.endsWith('/api-keys')?'api':'devices');const openKnowledgeDetail=(row:any)=>router.push({path:`/platform/ai-shop-sign/knowledge/${encodeURIComponent(row.id)}`,query:{name:row.name||'',description:row.description||'',version:row.version||'标准版',knowledgeType:row.knowledgeType||'document-search',updatedAt:row.updatedAt||''}});const copyText=async(text:string,label='内容')=>{try{await navigator.clipboard.writeText(text);message.success(`${label}已复制`)}catch{message.error('复制失败')}};const tag=(s:string)=>s==='online'?'success':s==='offline'?'default':'warning';const label=(s:string)=>s==='online'?'在线':s==='offline'?'离线':s==='pending'?'处理中':'成功';const pendingClones=computed(()=>voices.value.filter((x:any)=>x.status==='pending'));const deviceMetrics=computed(()=>[{label:'今日 AI Token',value:devices.value.reduce((sum,item)=>sum+item.tokenToday,0).toLocaleString()},{label:'累计 AI Token',value:devices.value.reduce((sum,item)=>sum+item.tokenTotal,0).toLocaleString()},{label:'声音复刻 · 处理中',value:pendingClones.value.length},{label:'声音复刻 · 累计请求',value:voices.value.length}]);const baseDeviceColumns=[{title:'设备编号',key:'serialNo',width:100},{title:'设备名称',key:'name',minWidth:180},{title:'设备类型',key:'deviceType',width:110,render:(r:ManagedDevice)=>h(NTag,{size:'small',type:'info',bordered:false},{default:()=>r.deviceType||'--'})},{title:'MAC 地址',key:'macAddress',width:140,render:(r:ManagedDevice)=>h('span',{style:'font-family:monospace;font-size:11px;color:#6366f1;'},r.macAddress||'--')},{title:'所属商家',key:'merchant',minWidth:100,render:(r:ManagedDevice)=>r.merchant||'--'},{title:'所属门店',key:'store',minWidth:120,render:(r:ManagedDevice)=>r.store||'--'},{title:'状态',key:'status',width:90,align:'center',render:(r:ManagedDevice)=>h(NTag,{type:tag(r.status),size:'small'},{default:()=>label(r.status)})},{title:'AI Token',key:'token',minWidth:150,render:(r:ManagedDevice)=>{if(!r.token)return h(NTag,{size:'small',type:'default'},{default:()=>'未分配'});return h('div',{style:'display:flex;align-items:center;gap:4px;'},[h('span',{style:'font-family:monospace;font-size:11px;color:#6366f1;max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'},`${r.token.slice(0,14)}...`),h(NButton,{text:true,type:'primary',size:'tiny',onClick:()=>copyText(r.token,'AI Token')},{default:()=>'复制'})])}},{title:'操作',key:'actions',width:190,fixed:'right',render:(r:ManagedDevice)=>{const btns:any[]=[h(NButton,{text:true,type:'primary',size:'small',onClick:()=>openPersona(r)},{default:()=> '人设配置'})];if(!isMerchant.value)btns.push(h(NButton,{text:true,type:'primary',size:'small',onClick:()=>{tokenDevice.value=r}},{default:()=> 'Token 用量'}));return h('div',{class:'table-actions'},btns)}}];
const deviceColumns=computed(()=>baseDeviceColumns.filter((c:any)=>!(isMerchant.value&&(c.key==='merchant'||c.key==='store'||c.key==='token'))));;const knowledgeColumns=[{title:'知识库名称',key:'name',render:(r:any)=>h(NButton,{text:true,type:'primary',onClick:()=>openKnowledgeDetail(r)},{default:()=>r.name||r.id})},{title:'知识库 ID',key:'id',width:150,render:(r:any)=>h('div',{class:'id-cell'},[h('code',r.id),h(NButton,{text:true,type:'primary',size:'tiny',onClick:()=>copyText(r.id,'知识库 ID')},{default:()=> '复制'})])},{title:'描述',key:'description'},{title:'来源',key:'source',width:90,render:(r:any)=>h(NTag,{type:r.source==='cloud'?'success':'default',size:'small',bordered:false},{default:()=>r.source==='cloud'?'云端':'本地'})},{title:'文档数',key:'documents'},{title:'更新时间',key:'updatedAt'},{title:'操作',key:'actions',width:310,render:(r:any)=>r.source==='cloud'?h('div',{style:'display:flex;gap:6px;flex-wrap:nowrap'},[h(NButton,{text:true,type:'primary',size:'small',onClick:()=>openKnowledgeDetail(r)},{default:()=> '管理文章'}),h(NButton,{text:true,type:'primary',size:'small',loading:uploading.value&&uploadTarget.value?.id===r.id,onClick:()=>pickKbFile(r)},{default:()=> '上传资料'}),h(NButton,{text:true,type:'info',size:'small',onClick:()=>openRetrieve(r)},{default:()=> '检索'}),h(NButton,{text:true,type:'error',size:'small',onClick:()=>deleteKb(r)},{default:()=> '删除'})]):h(NButton,{text:true,type:'primary',size:'small',onClick:()=>{r.documents++;r.updatedAt=new Date().toLocaleString('zh-CN');persist();message.success('资料已加入导入队列')}},{default:()=> '上传资料'})}];const voiceColumns=[{title:'目标模型',key:'model'},{title:'样本音频',key:'sample'},{title:'状态',key:'status',render:(r:any)=>h(NTag,{type:r.status==='success'?'success':'warning',size:'small'},{default:()=>label(r.status)})},{title:'voiceId',key:'voiceId'},{title:'更新时间',key:'updatedAt'}];
const kbTypeIcon=(t?:string)=>t==='data-query'
  ?h('svg',{viewBox:'0 0 24 24',width:'24',height:'24',fill:'none',stroke:'#059669','stroke-width':2,'stroke-linecap':'round','stroke-linejoin':'round'},[h('ellipse',{cx:'12',cy:'5',rx:'9',ry:'3'}),h('path',{d:'M21 12c0 1.66-4 3-9 3s-9-1.34-9-3'}),h('path',{d:'M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5'}),h('path',{d:'M3 12v7'})])
  :h('svg',{viewBox:'0 0 24 24',width:'24',height:'24',fill:'none',stroke:'#2563eb','stroke-width':2,'stroke-linecap':'round','stroke-linejoin':'round'},[h('path',{d:'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'}),h('path',{d:'M14 2v6h6'})]);
const managementKnowledgeColumns=computed(()=>knowledgeColumns.filter((column:any)=>column.key!=='source'&&column.key!=='updatedAt').flatMap((column:any)=>{
  if(column.key==='name')return[{...column,minWidth:220,render:(row:any)=>h('span',{style:'display:inline-flex;align-items:center;gap:7px;cursor:pointer;color:#2563eb;vertical-align:middle',onClick:()=>openKnowledgeDetail(row)},[kbTypeIcon(row.knowledgeType),h('span',{style:'line-height:24px'},row.name||row.id)])}];
  if(column.key==='id')return[{...column,width:170},{title:'知识库类型',key:'knowledgeType',width:90,render:(row:any)=>row.knowledgeType==='data-query'?'数据查询':'文档搜索'}];
  if(column.key==='description')return[{...column,minWidth:240,ellipsis:{tooltip:true}},{title:'版本',key:'version',width:80,render:(row:any)=>row.version||'标准版'}];
  if(column.key==='documents')return[{...column,title:'文章数',width:80}];
  if(column.key==='actions')return[{...column,width:110,render:(row:any)=>h('div',{class:'table-actions'},[h(NButton,{text:true,type:'primary',size:'small',onClick:()=>openKnowledgeDetail(row)},{default:()=> '管理'}),h(NButton,{text:true,type:'primary',size:'small',onClick:()=>openEditKb(row)},{default:()=> '编辑'})])}];
  return[column]
}));
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
// The proxy reads all RAM credentials and the workspace ID from server/.env.
// Never serialize those values in a browser request.
const bailianCredentials=()=>({});
const PROTOTYPE_MODE = true
async function callBailian(path:string,extra:any={}){
  if (PROTOTYPE_MODE) {
    const items = knowledge.value.map((item:any) => ({ ...item, source: 'prototype' }))
    if (path === 'indices') return { success: true, data: { items, count: items.length } }
    if (path === 'retrieve') return { success: true, data: { items: [] } }
    return { success: true, data: {} }
  }
  const res=await fetch(`/api/bailian/${path}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...bailianCredentials(),...extra})});
  const data=await res.json().catch(()=>({success:false}));
  if(!res.ok||!data.success) throw new Error(data.detail||data.message||'请求本地代理服务失败');
  return data;
}
async function testKnowledgeService(){
  testingKnowledge.value=true;knowledgeTest.value=null;
  try{const data=await callBailian('test');knowledgeTest.value={type:'success',title:'百炼知识库服务正常',message:`服务端代理已连接当前业务空间，云端知识库数量：${data.data.count}`};message.success('百炼知识库服务测试通过')}
  catch(e:any){knowledgeTest.value={type:'error',title:'百炼知识库服务不可用',message:e?.message||'请检查服务端 .env 与本地代理服务。'};message.error('百炼知识库服务测试失败')}
  finally{testingKnowledge.value=false}
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
const kbStep=ref(1),kbType=ref<'doc'|'data'>('doc'),kbScene=ref('basic-document-qa'),kbQueryMode=ref('nl2sql'),kbVersion=ref('标准版');
// ===== 第三步（索引设置）：切片方式与差异化配置，参照百炼 =====
const kbChunkModes=[{value:'smart',label:'智能切分',desc:'在通用文档上的较优chunk切分方法，经过评测可在多数文档上获得较佳的检索效果'},{value:'length',label:'按长度切分',desc:'适合对 Token 数量有严格要求的场景，比如使用上下文长度较小的模型时。'},{value:'page',label:'按页切分',desc:'适合每页传达独立主题的文档，要求不同页面的内容不会混杂在同一文本切片中。'},{value:'title',label:'按标题切分',desc:'适合于用标题划分并传达独立主题的文档，要求不同级标题下的内容不会混杂在同一文本切片中。'},{value:'regex',label:'按照正则切分',desc:'依据设置的正则表达式，对知识库中的文本进行切分。'},{value:'symbol',label:'按照符号切分',desc:'适用于根据特定标识符区分内容的文档，根据文档文件中特殊标识符进行切分。'}];
const kbChunkMode=ref('smart'),kbChunkMax=ref(2000),kbChunkOverlap=ref(16),kbTitleLevel=ref(1),kbRegex=ref(''),kbSymbol=ref<string|null>(null),kbMetadata=ref(false),kbExcelHeader=ref(true),kbEmbedModel=ref('text-embedding-v4'),kbVecStore=ref<'platform'|'adbpg'>('platform');
const kbSymbolOptions=[...new Map([
  {label:'换行',value:'\\n'},
  {label:'中文句号',value:'。'},
  {label:'英文句号',value:'.'},
  {label:'中文叹号',value:'！'},
  {label:'英文叹号',value:'!'},
  {label:'中文逗号',value:'，'},
  {label:'英文逗号',value:','},
  {label:'中文分号',value:'；'},
  {label:'英文分号',value:';'},
  {label:'中文问号',value:'？'},
  {label:'英文问号',value:'?'}
].map(o=>[o.value,o])).values()];
const kbEmbedOptions=[{label:'text-embedding-v3',value:'text-embedding-v3',desc:'DashScope text-embedding-v3，商业化向量模型，除了中英双语，支持多语种，向量结果默认归一化处理'},{label:'text-embedding-v4',value:'text-embedding-v4',desc:'DashScope text-embedding-v4，商业化向量模型，除了中英双语，支持多语种，向量结果默认归一化处理'}];
const kbEmbedRenderOption=(o:any)=>h('div',{style:'display:flex;flex-direction:column;gap:2px;padding:4px 0'},{default:()=>[h('span',{style:'font-size:13px;font-weight:500;color:#1f2937'},o.label),h('span',{style:'font-size:12px;color:#9ca3af;line-height:1.5'},o.desc)]});
// ===== 数据查询（表格）第二步/第三步 =====
const kbDataSrc=ref<'upload'|'select'>('upload');
const kbTableName=ref(''),kbUploadFileInfo=ref<{name:string;size:string}|null>(null);
const defaultSchemaCols=[{name:'总运营后台',desc:'',type:'string'},{name:'按产品原型菜单结构',desc:'',type:'string'},{name:'功能模块',desc:'',type:'string'},{name:'任务描述',desc:'',type:'string'},{name:'里程碑',desc:'',type:'string'},{name:'备注',desc:'',type:'string'},{name:'验收分类',desc:'',type:'string'},{name:'完成情况',desc:'',type:'string'}];
const kbSchemaCols=ref(defaultSchemaCols.map((c:any)=>({...c})));
const kbColTypes=['string','double','long','datetime','image_url'];
const kbSelTable=ref(''),kbTablePage=ref(1);
const kbFieldSearch=ref<Record<string,boolean>>({}),kbFieldReply=ref<Record<string,boolean>>({});
const kbDataTables=computed(()=>{const arr:string[]=[];const n=kbTableName.value.trim();if(n)arr.push(n);arr.push(...(KB_DATASETS.find(d=>d.id==='ds-store-table')?.categories||[]));return arr});
const kbActiveSchema=computed<{name:string;desc:string;type:string}[]>(()=>{if(kbSelTable.value&&kbSelTable.value===kbTableName.value.trim())return kbSchemaCols.value;const ds=KB_DATASETS.find(d=>d.id==='ds-store-table');return ds?.schemas?.[kbSelTable.value]?.columns||kbSchemaCols.value});
const kbSchemaRows=computed<string[][]>(()=>{if(kbSelTable.value&&kbSelTable.value===kbTableName.value.trim())return[['PC 点播系统','点播','支付'],['PC 点播系统','点播','支付后启动游戏'],['PC 点播系统','商店','商店列表'],['PC 点播系统','游戏详情页/下载/安装/卸载','支付后启动游戏'],['PC 点播系统','管理','设备管理'],['PC 点播系统','管理','会员管理'],['PC 点播系统','管理','订单管理'],['PC 点播系统','管理','库存管理'],['PC 点播系统','管理','报表管理'],['PC 点播系统','管理','门店管理'],['PC 点播系统','管理','员工管理'],['PC 点播系统','管理','权限管理']];const ds=KB_DATASETS.find(d=>d.id==='ds-store-table');return ds?.schemas?.[kbSelTable.value]?.rows||[]});
const kbTablePreviewCols=computed(()=>kbActiveSchema.value.map(c=>({title:`${c.name} (${c.type})`,key:c.name})));
const kbTableRowsPaged=computed(()=>kbSchemaRows.value.slice((kbTablePage.value-1)*8,kbTablePage.value*8).map(r=>Object.fromEntries(kbActiveSchema.value.map((c,i)=>[c.name,r[i]??'']))));
watch([kbDataSrc],()=>{kbSelTable.value='';kbTablePage.value=1});
// ===== 创建知识库 · 第二步（选择数据）：数据结构与状态枚举复用 AiShopSignDatasets.vue =====
type KbFile={name:string;format:string;status:string;source:string;cat:string}
type KbDs={id:string;name:string;type:'file'|'table';categories:string[];files:KbFile[]}
const KB_DATASETS:KbDs[]=[
  {id:'ds-brand-files',name:'品牌服务资料集',type:'file',categories:['默认类目'],files:[
    {name:'品牌介绍与 VR 项目说明.docx',format:'docx',status:'解析完成',source:'本地上传',cat:'默认类目'},
    {name:'会员充值与退卡规则.pdf',format:'pdf',status:'解析完成',source:'本地上传',cat:'默认类目'},
    {name:'VR 项目设备清单.md',format:'md',status:'解析中',source:'本地上传',cat:'默认类目'},
    {name:'门店运营手册.docx',format:'docx',status:'上传中',source:'本地上传',cat:'默认类目'},
    {name:'损坏的扫描件资料.pdf',format:'pdf',status:'失败',source:'本地上传',cat:'默认类目'}]},
  {id:'ds-campaign-files',name:'活动营销资料集',type:'file',categories:['默认类目'],files:[
    {name:'国庆主题活动说明.pptx',format:'pptx',status:'解析中',source:'本地上传',cat:'默认类目'},
    {name:'中秋活动旧版说明.pdf',format:'pdf',status:'失败',source:'本地上传',cat:'默认类目'},
    {name:'门店巡检话术清单.docx',format:'docx',status:'上传中',source:'本地上传',cat:'默认类目'},
    {name:'活动执行SOP手册.docx',format:'docx',status:'解析完成',source:'本地上传',cat:'默认类目'}]},
  {id:'ds-store-table',name:'门店经营数据集',type:'table',categories:['各门店月度营收明细','会员充值流水汇总'],files:[
    {name:'各门店月度营收明细.xlsx',format:'xlsx',status:'解析完成',source:'本地上传',cat:'各门店月度营收明细'},
    {name:'会员充值流水汇总.csv',format:'csv',status:'解析完成',source:'本地上传',cat:'会员充值流水汇总'},
    {name:'月度营收汇总_错误格式.csv',format:'csv',status:'失败',source:'本地上传',cat:'各门店月度营收明细'},
    {name:'会员流水导入中.csv',format:'csv',status:'解析中',source:'本地上传',cat:'会员充值流水汇总'},
    {name:'待同步营收表.xlsx',format:'xlsx',status:'上传中',source:'本地上传',cat:'各门店月度营收明细'}]}
];
const kbStatusTypes:Record<string,'success'|'warning'|'info'|'error'>={'解析完成':'success','解析中':'warning','上传中':'info','失败':'error'};
// 已导入知识库的文件（跨页面共享，选择数据窗口显示"导入完成"）
const IMPORTED_KEY='touhao-kb-imported-files';
const importedNames=ref<string[]>(JSON.parse(localStorage.getItem(IMPORTED_KEY)||'[]'));
const markImported=(names:string[])=>{names.forEach(n=>{if(!importedNames.value.includes(n))importedNames.value.push(n)});localStorage.setItem(IMPORTED_KEY,JSON.stringify(importedNames.value))};
const kbDsType=computed(()=>kbType.value==='doc'?'file':'table');
const kbDsOptions=computed(()=>KB_DATASETS.filter(d=>d.type===kbDsType.value).map(d=>({label:d.name,value:d.id,type:d.type})));
const kbRenderLabel=(o:any)=>h('span',{style:'display:inline-flex;align-items:center;gap:8px'},[o.label,h(NTag,{size:'small',bordered:false,style:'background:#f3f4f6;color:#6b7280;font-size:11px;padding:0 6px'},{default:()=>o.type==='file'?'文件':'表格'})]);
const kbSelDataset=ref('ds-brand-files'),kbSource=ref<'file'|'category'>('file'),kbSelFiles=ref<string[]>([]),kbSelCats=ref<string[]>([]),kbActiveCat=ref('默认类目'),kbFileKeyword=ref(''),kbAutoSync=ref(false),kbPreviewPage=ref(1);
const toggleCat=(c:string)=>{const i=kbSelCats.value.indexOf(c);if(i>=0)kbSelCats.value.splice(i,1);else if(kbSelCats.value.length<50)kbSelCats.value.push(c)};
const kbPreviewRows=computed(()=>kbActiveDs.value.files.filter(f=>kbSelCats.value.includes(f.cat)));
const kbPreviewColumns=computed(()=>kbFileColumns.filter((c:any)=>c.type!=='selection'));
const kbActiveDs=computed(()=>KB_DATASETS.find(d=>d.id===kbSelDataset.value)||KB_DATASETS[0]);
watch(kbType,()=>{kbSelDataset.value=kbDsOptions.value[0]?.value||'';kbSource.value='file';kbSelFiles.value=[];kbSelCats.value=[];kbFileKeyword.value='';kbActiveCat.value=kbActiveDs.value.categories[0]||''});
watch(kbSelDataset,()=>{kbActiveCat.value=kbActiveDs.value.categories[0]||'';kbSelFiles.value=[];kbSelCats.value=[];kbPreviewPage.value=1});
const kbFileRows=computed(()=>{const kw=kbFileKeyword.value.trim();return kbActiveDs.value.files.filter(f=>(!kbActiveCat.value||f.cat===kbActiveCat.value)&&(!kw||f.name.includes(kw)))});
const kbFileColumns=[
  {type:'selection' as const},
  {title:'文件名称',key:'name',minWidth:190},
  {title:'格式',key:'format',width:90,render:(r:KbFile)=>h('span',{style:'display:inline-flex;align-items:center;gap:6px;font-size:12px;color:#6b7280'},[h('i',{style:'width:14px;height:14px;border-radius:3px;background:#dbeafe;display:inline-block;flex:none'}),r.format])},
  {title:'状态',key:'status',width:110,render:(r:KbFile)=>{const done=importedNames.value.includes(r.name);return done?h(NTag,{type:'success',size:'small',bordered:false},{default:()=>'导入完成'}):h(NTag,{type:kbStatusTypes[r.status]||'default',size:'small',bordered:false},{...(r.status==='解析中'||r.status==='上传中'?{icon:()=>h(NSpin,{size:11,style:'margin-right:4px'})}:{}),default:()=>r.status})}},
  {title:'数据来源',key:'source',width:110,render:(r:KbFile)=>h(NTag,{size:'small',bordered:false},{default:()=>r.source})}
];
const editKbModal=ref(false),editKbTarget=ref<any>(null),editKbName=ref(''),editKbDesc=ref('');
function openEditKb(row:any){editKbTarget.value=row;editKbName.value=row.name||'';editKbDesc.value=row.description||'';editKbModal.value=true}
function saveEditKb(){const row=editKbTarget.value;if(!row)return;if(!editKbName.value.trim())return message.warning('请输入知识库名称');if(!editKbDesc.value.trim())return message.warning('请输入知识库描述');row.name=editKbName.value.trim();row.description=editKbDesc.value.trim();row.updatedAt=new Date().toLocaleString('zh-CN');editKbModal.value=false;persist();message.success('知识库已更新')}
function fillDescriptionExample(){newKnowledge.description=kbType.value==='doc'?'包含门店营业时间、服务项目说明、设备玩法介绍与常见活动问答等资料，用于回答顾客日常咨询':'包含门店月度营收、订单明细与会员充值流水等数据表，用于按表头结构灵活查询经营数据'}
function kbNext(){
  if(kbStep.value===1){
    if(!newKnowledge.name.trim())return message.warning('请输入知识库名称');
    if(!newKnowledge.description.trim())return message.warning('请输入知识库描述');
  }
  if(kbStep.value===2){
    if(!kbSelDataset.value)return message.warning('请选择数据集');
    if(kbDsType.value==='file'){
      if(kbSource.value==='file'&&!kbSelFiles.value.length)return message.warning('请至少选择一个文件');
      if(kbSource.value==='category'&&!kbSelCats.value.length)return message.warning('请至少选择一个类目');
    }else if(kbDataSrc.value==='upload'){
      if(!kbTableName.value.trim())return message.warning('请输入数据表名称');
      if(!kbUploadFileInfo.value)return message.warning('请上传数据表文件');
    }else if(!kbSelTable.value)return message.warning('请选择数据表');
  }
  kbStep.value++
}
function addPrototypeKnowledge(){
  const isDoc=kbType.value==='doc';
  const needFiles=isDoc&&kbSource.value==='file';
  const docCount=isDoc?(needFiles?kbSelFiles.value.length:kbActiveDs.value.files.filter(f=>kbSelCats.value.includes(f.cat)).length):kbActiveSchema.value.length;
  if(isDoc)markImported(needFiles?kbSelFiles.value:kbActiveDs.value.files.filter(f=>kbSelCats.value.includes(f.cat)).map(f=>f.name));
  const newKb={id:`kb-${Date.now().toString(36)}`,name:newKnowledge.name.trim(),description:newKnowledge.description.trim(),version:kbVersion.value,documents:docCount,updatedAt:new Date().toLocaleString('zh-CN'),source:'prototype',knowledgeType:isDoc?'document-search':'data-query',scene:isDoc?kbScene.value:'nl2sql',kbDatasets:[kbSelDataset.value],kbSelFiles:[...kbSelFiles.value],kbSelCats:[...kbSelCats.value],kbConfig:{chunkMode:kbChunkMode.value,chunkMax:kbChunkMax.value,chunkOverlap:kbChunkOverlap.value,titleLevel:kbTitleLevel.value,regex:kbRegex.value,symbol:kbSymbol.value,metadata:kbMetadata.value,excelHeader:kbExcelHeader.value,embedModel:kbEmbedModel.value,vecStore:kbVecStore.value,queryMode:kbQueryMode.value,dataSrc:isDoc?undefined:kbDataSrc.value,tableName:isDoc?undefined:(kbDataSrc.value==='upload'?kbTableName.value.trim():kbSelTable.value),fields:isDoc?undefined:kbActiveSchema.value.map(c=>({name:c.name,type:c.type,search:kbFieldSearch.value[c.name]!==false,reply:kbFieldReply.value[c.name]!==false}))}};
  knowledge.value.unshift(newKb);
  Object.assign(newKnowledge,{name:'',description:''});kbStep.value=1;kbType.value='doc';kbScene.value='basic-document-qa';kbSelDataset.value='ds-brand-files';kbSource.value='file';kbSelFiles.value=[];kbSelCats.value=[];kbActiveCat.value='默认类目';kbFileKeyword.value='';kbAutoSync.value=false;kbPreviewPage.value=1;kbVersion.value='标准版';kbChunkMode.value='smart';kbChunkMax.value=2000;kbChunkOverlap.value=16;kbTitleLevel.value=1;kbRegex.value='';kbSymbol.value=null;kbMetadata.value=false;kbExcelHeader.value=true;kbEmbedModel.value='text-embedding-v4';kbVecStore.value='platform';kbQueryMode.value='nl2sql';kbDataSrc.value='upload';kbTableName.value='';kbUploadFileInfo.value=null;kbSchemaCols.value=defaultSchemaCols.map((c:any)=>({...c}));kbSelTable.value='';kbTablePage.value=1;kbFieldSearch.value={};kbFieldReply.value={};knowledgeModal.value=false;persist();
  message.success('知识库已创建，索引构建中');
  router.push({path:`/platform/ai-shop-sign/knowledge/${newKb.id}`,query:{name:newKb.name,description:newKb.description,version:newKb.version,knowledgeType:newKb.knowledgeType,updatedAt:newKb.updatedAt,status:'building'}})
}
// 云端文档列表 / 上传资料 / 检索测试 / 删除知识库
const docDrawer=ref(false),docsLoading=ref(false),kbDocs=ref<any[]>([]);
const uploadTarget=ref<any>(null),uploading=ref(false);
function pickKbFile(row:any){uploadTarget.value=row;(document.getElementById('kb-file-input') as HTMLInputElement | null)?.click()}
async function onKbFileChange(e:Event){const input=e.target as HTMLInputElement;const file=input.files?.[0];const row=uploadTarget.value;input.value='';if(!file||!row)return;uploading.value=true;try{const form=new FormData();form.append('file',file);form.append('indexId',row.id);const res=await fetch('/api/bailian/files/upload',{method:'POST',body:form});const data=await res.json().catch(()=>({success:false}));if(!res.ok||!data.success)throw new Error(data.detail||data.message||'上传失败');message.success('资料已上传，百炼正在解析');await syncCloudKnowledge()}catch(err:any){message.error(`上传失败：${err?.message||''}`)}finally{uploading.value=false}}
const retrieveModal=ref(false),retrieveQuery=ref(''),retrieveResults=ref<any[]>([]),retrieving=ref(false);
function openRetrieve(row:any){activeKb.value=row;retrieveQuery.value='';retrieveResults.value=[];retrieveModal.value=true}
async function runRetrieve(){if(!activeKb.value||!retrieveQuery.value)return message.warning('请输入检索内容');retrieving.value=true;try{const data=await callBailian('retrieve',{indexId:activeKb.value.id,query:retrieveQuery.value,topK:5});retrieveResults.value=data.data?.items||[];if(!retrieveResults.value.length)message.info('未命中相关内容')}catch(e:any){message.error(`检索失败：${e?.message||''}`)}finally{retrieving.value=false}}
async function deleteKb(row:any){if(!window.confirm(`确认删除云端知识库「${row.name}」？该操作不可恢复。`))return;try{await callBailian('index/delete',{indexId:row.id});message.success('知识库已删除');await syncCloudKnowledge()}catch(e:any){message.error(`删除失败：${e?.message||''}`)}}
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
const personaDevice=ref<ManagedDevice|null>(null),tokenDevice=ref<ManagedDevice|null>(null),knowledgeModal=ref(false),newKnowledge=reactive({name:'',description:''}),personaForm=reactive({digitalHumanName:'',wakeWord:'',wakeEnabled:false,voiceId:'',brandEnabled:true,brandKnowledgeIds:[] as string[],brandFileIds:[] as string[],storeEnabled:false,storeEntries:DEFAULT_STORE_ENTRIES.map((e)=>({...e})),campaignEnabled:false,campaignEntries:DEFAULT_CAMPAIGN_ENTRIES.map((e)=>({...e})),systemPrompt:DEFAULT_SYSTEM_PROMPT,greetings:['您好，欢迎来到头号空间 VR 体验馆！','您好，我是本店 AI 接待员，请问有什么可以帮您？','欢迎光临！想了解哪款设备可以随时问我','您好呀～今天想体验点什么？我可以帮您推荐','首次到店的话，我可以先为您介绍各项目的玩法和时长'] as string[],refusalPolicy:DEFAULT_REFUSAL_POLICY,capabilityList:'品牌、产品线',idleMinutes:10,idlePhrases:['想体验一下 VR 吗？随时可以找我了解','最近上新了几款热门游戏，要不要听听介绍？','坐着休息一下也没关系，有需要随时叫我','今天是工作日，现在到店体验不用排队哦','喜欢刺激一点的项目，还是轻松休闲的呢？'] as string[],presetTopics:['今天有什么优惠活动？','门店营业时间是几点？','适合小朋友玩吗？','双人协作游戏怎么玩？','生日派对怎么预约？','附近停车方便吗？','会员充值有什么优惠？','最近有什么新游戏上线？'] as string[],aiTopicsEnabled:true,maxTopics:3}),voice=reactive({model:'qwen-audio-3.0-realtime-plus',file:''}),models=[{label:'qwen-audio-3.0-realtime-plus',value:'qwen-audio-3.0-realtime-plus'},{label:'qwen-audio-3.0-realtime-flash',value:'qwen-audio-3.0-realtime-flash'}];const testingRuntime=ref(false),testingKnowledge=ref(false),runtimeTest=ref<{type:'success'|'error'|'warning',title:string,message:string}|null>(null),knowledgeTest=ref<{type:'success'|'error'|'warning',title:string,message:string}|null>(null);const hashStr=(s:string)=>{let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return Math.abs(h)};
Object.assign(personaForm,DEFAULT_PERSONA_COPY);
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
function loadPersonaDefault(){try{return {...DEFAULT_PERSONA_COPY,...(JSON.parse(localStorage.getItem(PERSONA_DEFAULT_KEY)||'null')||{})}}catch{return {...DEFAULT_PERSONA_COPY}}}
// Keep the legacy normalization call in openPersona working until that one-line
// handler is split into smaller functions.
let constnormSwitch:unknown;
void constnormSwitch;
const normSwitch=(value:unknown,fallback:boolean)=>value===true||value==='enabled'?true:value===false||value==='disabled'?false:fallback;
function openPersona(device:ManagedDevice){personaDevice.value=device;const base={digitalHumanName:device.persona,wakeWord:'你好小艾',wakeEnabled:false,voiceId:device.voiceId,brandEnabled:true,brandKnowledgeIds:[] as string[],brandFileIds:[] as string[],storeEnabled:false,storeEntries:DEFAULT_STORE_ENTRIES.map((e:any)=>({...e})),campaignEnabled:false,campaignEntries:DEFAULT_CAMPAIGN_ENTRIES.map((e:any)=>({...e})),systemPrompt:DEFAULT_SYSTEM_PROMPT,greetings:['您好，欢迎来到头号空间 VR 体验馆！','您好，我是本店 AI 接待员，请问有什么可以帮您？','欢迎光临！想了解哪款设备可以随时问我','您好呀～今天想体验点什么？我可以帮您推荐','首次到店的话，我可以先为您介绍各项目的玩法和时长'] as string[],refusalPolicy:DEFAULT_REFUSAL_POLICY,capabilityList:'品牌、产品线',idleMinutes:10,idlePhrases:['想体验一下 VR 吗？随时可以找我了解','最近上新了几款热门游戏，要不要听听介绍？','坐着休息一下也没关系，有需要随时叫我','今天是工作日，现在到店体验不用排队哦','喜欢刺激一点的项目，还是轻松休闲的呢？'] as string[],presetTopics:['今天有什么优惠活动？','门店营业时间是几点？','适合小朋友玩吗？','双人协作游戏怎么玩？','生日派对怎么预约？','附近停车方便吗？','会员充值有什么优惠？','最近有什么新游戏上线？'] as string[],aiTopicsEnabled:true,maxTopics:3};Object.assign(personaForm,base,loadPersonaDefault()||{},(device as any).personaConfig||{});const normArr=(v:any)=>Array.isArray(v)?v:(typeof v==='string'&&v.trim()?v.split(/[,，]\s*/).filter(Boolean):[]);constnormSwitch=(v:any,def:boolean)=>v===true||v==='enabled'?true:v===false||v==='disabled'?false:def;personaForm.brandKnowledgeIds=normArr(personaForm.brandKnowledgeIds);personaForm.brandFileIds=normArr(personaForm.brandFileIds);const normEntries=(v:any,def:any[])=>{if(!Array.isArray(v))return def.map((e:any)=>({...e}));return v.map((e:any,i:number)=>({id:e&&e.id?String(e.id):`en-${Date.now().toString(36)}-${i}`,keyword:String(e&&e.keyword||''),answer:String(e&&e.answer||''),enabled:e?e.enabled!==false:true}))};personaForm.storeEntries=normEntries(personaForm.storeEntries,DEFAULT_STORE_ENTRIES);personaForm.campaignEntries=normEntries(personaForm.campaignEntries,DEFAULT_CAMPAIGN_ENTRIES);personaForm.brandEnabled=normSwitch(personaForm.brandEnabled,true);personaForm.storeEnabled=normSwitch(personaForm.storeEnabled,false);personaForm.campaignEnabled=normSwitch(personaForm.campaignEnabled,false);if(!Array.isArray(personaForm.greetings))personaForm.greetings=normArr((personaForm as any).greetingText);if(!personaForm.greetings.length)personaForm.greetings=['您好，我是 AI 接待员，请问有什么可以帮您？'];if(!Array.isArray(personaForm.idlePhrases)||!personaForm.idlePhrases.length)personaForm.idlePhrases=['想体验一下 VR 吗？随时可以找我了解'];if(typeof personaForm.idleMinutes!=='number'||!personaForm.idleMinutes)personaForm.idleMinutes=10;if(!Array.isArray(personaForm.presetTopics)||!personaForm.presetTopics.length)personaForm.presetTopics=['今天有什么优惠活动？','门店营业时间是几点？','适合小朋友玩吗？','双人协作游戏怎么玩？','生日派对怎么预约？','附近停车方便吗？','会员充值有什么优惠？','最近有什么新游戏上线？'];if(typeof personaForm.aiTopicsEnabled!=='boolean')personaForm.aiTopicsEnabled=true;personaForm.maxTopics=3;personaForm.wakeEnabled=false}function savePersona(){if(!personaDevice.value)return;const config=JSON.parse(JSON.stringify(personaForm));config.greetings=(config.greetings||[]).map((s:string)=>String(s).trim()).filter(Boolean);config.idlePhrases=(config.idlePhrases||[]).map((s:string)=>String(s).trim()).filter(Boolean);config.presetTopics=(config.presetTopics||[]).map((s:string)=>String(s).trim()).filter(Boolean);const base=(personaDevice.value as any).personaConfig?JSON.parse(JSON.stringify((personaDevice.value as any).personaConfig)):{};if(isMerchant.value){Object.assign(base,{greetings:config.greetings,presetTopics:config.presetTopics,aiTopicsEnabled:config.aiTopicsEnabled,idleMinutes:config.idleMinutes,idlePhrases:config.idlePhrases,storeEnabled:config.storeEnabled,storeEntries:config.storeEntries,campaignEnabled:config.campaignEnabled,campaignEntries:config.campaignEntries})}else{Object.assign(base,config)}const kb=Array.isArray(base.brandKnowledgeIds)?base.brandKnowledgeIds:[];Object.assign(personaDevice.value,{configVersion:personaDevice.value.configVersion+1,personaConfig:base,lastEditedBy:isMerchant.value?'merchant':'platform',lastEditedAt:new Date().toLocaleString('zh-CN',{hour12:false})});if(!isMerchant.value){(personaDevice.value as any).persona=config.digitalHumanName;(personaDevice.value as any).voiceId=config.voiceId;(personaDevice.value as any).knowledgeBaseId=kb.join(',')}persist();personaDevice.value=null;message.success('人设配置已保存')}function testRuntime(){testingRuntime.value=true;runtimeTest.value=null;setTimeout(()=>{testingRuntime.value=false;if(!voiceApi.dashscopeApiKey){runtimeTest.value={type:'error',title:'模型与语音调用配置测试失败',message:'请先配置 DASHSCOPE_API_KEY，再测试实时语音 API 握手。'};return}runtimeTest.value={type:'success',title:'模型与语音调用配置正常',message:`已连接 ${voiceApi.voiceCloneEndpoint || 'DashScope 公共端点'}，模型：${voice.model}，Workspace：${voiceApi.workspaceId || '未配置'}`};message.success('模型与语音调用配置测试通过')},600)}async function testKnowledge(){testingKnowledge.value=true;knowledgeTest.value=null;try{if(!knowledgeApi.accessKeyId||!knowledgeApi.accessKeySecret||!knowledgeApi.workspaceId){knowledgeTest.value={type:'error',title:'百炼知识库配置测试失败',message:'请检查 AccessKey、Secret、Workspace ID 和 Endpoint 是否完整。'};return}const data=await callBailian('test');knowledgeTest.value={type:'success',title:'百炼知识库配置正常',message:`已连接 ${knowledgeApi.openapiEndpoint||'bailian.cn-beijing.aliyuncs.com'}，Workspace：${knowledgeApi.workspaceId}，云端知识库数量：${data.data.count}`};message.success('百炼知识库配置测试通过')}catch(e:any){knowledgeTest.value={type:'error',title:'百炼知识库配置测试失败',message:e?.message||'请检查 AccessKey、Secret、Workspace ID 与本地代理服务是否已启动。'};message.error('百炼知识库配置测试失败')}finally{testingKnowledge.value=false}}function onVoiceFiles(files:any[]){voice.file=files[0]?.name||''}async function addKnowledge(){if(!newKnowledge.name)return message.warning('请输入知识库名称');try{await callBailian('index/create',{name:newKnowledge.name,description:newKnowledge.description});message.success('云端知识库已创建');await syncCloudKnowledge();Object.assign(newKnowledge,{name:'',description:''});knowledgeModal.value=false}catch(e:any){message.error(`创建失败：${e?.message||''}`)}}function cloneVoice(){if(!voice.file)return message.warning('请先选择样本音频');const item:any={model:voice.model,sample:voice.file,status:'pending',voiceId:'—',updatedAt:new Date().toLocaleString('zh-CN')};voices.value.unshift(item);persist();setTimeout(()=>{item.status='success';item.voiceId=`voice-${Date.now().toString().slice(-6)}`;persist()},1000);message.success('声音复刻已提交')}function saveApi(){persist();message.success('API 配置状态已保存')}
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

<style scoped>.kb-modal{max-height:86vh;display:flex;flex-direction:column}.kb-modal :deep(.n-card__content){padding-top:10px;padding-bottom:32px;flex:1 1 0;min-height:0;overflow-y:auto}.kb-modal :deep(.n-card__footer){padding-top:20px}
.kb-steps{display:flex;align-items:center;justify-content:center;gap:14px;margin:8px 0 34px}.kb-step{display:flex;align-items:center;gap:10px;font-size:14px;color:var(--text-secondary)}.kb-step b{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:#f3f4f6;color:#9ca3af;font-size:13px;font-style:normal;font-weight:600;transition:background .2s,color .2s}.kb-step.active{color:#2563eb;font-weight:600}.kb-step.active b{background:#2563eb;color:#fff;box-shadow:0 0 0 4px #eff6ff}.kb-step.done{color:var(--text-primary)}.kb-step.done b{background:#eff6ff;color:#2563eb}.kb-line{width:96px;height:2px;border-radius:1px;background:#e5e7eb}.kb-line.on{background:#2563eb}.kb-label{margin:2px 0 12px;font-size:13px;font-weight:600}.kb-create-form :deep(.n-form-item){margin-bottom:24px}.kb-create-form :deep(.n-form-item-label){padding-bottom:8px;font-size:13px}.kb-section{margin-top:26px}.kb-section-label{margin:0 0 12px;font-size:13px;font-weight:500;color:#374151}.kb-mt{margin-top:26px}.kb-ds-head{display:flex;align-items:center;justify-content:space-between}.kb-ds-link{font-size:13px;color:#2563eb;cursor:pointer}.kb-ds-link:hover{text-decoration:underline}.kb-ds-tip{margin:0 0 10px;font-size:12.5px;color:var(--text-secondary)}.kb-ds-row{display:flex;align-items:center;gap:10px}.kb-ds-row .n-select{flex:1}.kb-src{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}.kb-src .kb-type{padding:14px 16px}.kb-src .kb-type small{font-size:12.5px}.kb-pick{display:flex;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden}.kb-pick-cats{width:180px;flex:none;background:#fafafa;border-right:1px solid #e5e7eb;padding:12px}.kb-pick-title{font-size:13px;font-weight:600;margin-bottom:8px}.kb-pick-title em{font-style:normal;font-weight:400;font-size:12px;color:#9ca3af}.kb-cat-item{padding:8px 10px;border-radius:6px;font-size:13px;cursor:pointer;color:#374151;transition:background .15s}.kb-cat-item:hover{background:#f3f4f6}.kb-cat-item.active{background:#eff6ff;color:#2563eb;font-weight:500}.kb-pick-files{flex:1;min-width:0;padding:12px 14px}.kb-pick-toolbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}.kb-pick-count{font-size:12px;color:#9ca3af}.kb-cat-checks{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.kb-cat-check{border:1px solid #e5e7eb;border-radius:8px;padding:12px 14px}.kb-sync-row{display:flex;align-items:center;gap:8px;margin-top:26px}.kb-sync-label{font-size:13px;font-weight:500;color:#374151}.kb-sync-tip{margin:8px 0 0;font-size:12px;color:#9ca3af}.kb-pick-head{font-size:13px}.kb-pick-actions{display:inline-flex;align-items:center;gap:14px}.kb-pick-pager{display:flex;justify-content:flex-end;padding-top:10px}.kb-cat-item{display:flex;align-items:center}.kb-cat-name{margin-left:8px}.kb-q{width:14px;height:14px;border-radius:50%;border:1px solid #d1d5db;color:#9ca3af;font-size:10px;font-style:normal;display:inline-grid;place-items:center;margin-left:4px}.kb-sel-cats{margin-top:14px}.kb-sel-cats-label{margin:0 0 8px;font-size:13px;font-weight:500;color:#374151}.kb-sel-empty{font-size:12px;color:#9ca3af}.kb-chunk-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.kb-chunk-grid .kb-type{padding:14px 16px}.kb-chunk-grid .kb-type small{font-size:12px;line-height:1.6;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.kb-chunk-panel{margin-top:14px;background:#f7f8fa;border-radius:10px;padding:18px 20px;display:flex;flex-direction:column;gap:18px}.kb-slider-label{margin:0 0 8px;font-size:13px;font-weight:500;color:#374151;display:flex;align-items:center;gap:4px}.kb-slider-row{display:flex;align-items:center;gap:16px}.kb-slider-row .n-slider{flex:1}.kb-slider-bounds{display:flex;justify-content:space-between;font-size:12px;color:#9ca3af;margin-top:4px;max-width:calc(100% - 136px)}.kb-switch-row{display:flex;align-items:center;gap:10px;margin-top:22px;font-size:13.5px;color:#374151}.kb-req{color:#e5484d;font-style:normal;margin-right:4px}.kb-note{margin-top:18px;font-size:12px;color:#c0c4cc}.kb-tip{margin:0;font-size:12px;line-height:1.8;color:#374151}.kb-up-icon{display:grid;place-items:center;margin-bottom:8px}.kb-up-row{display:flex;align-items:center;gap:10px;margin-top:10px;border:1px solid #e5e7eb;border-radius:8px;padding:10px 14px}.kb-up-badge{width:26px;height:26px;border-radius:6px;background:#22c55e;color:#fff;font-size:13px;font-weight:700;display:grid;place-items:center;flex:none}.kb-up-meta{flex:1;display:flex;flex-direction:column;gap:2px}.kb-up-meta b{font-size:13px}.kb-up-meta small{font-size:12px;color:#9ca3af}.kb-schema{border:1px solid #e5e7eb;border-radius:10px;overflow:hidden}.kb-schema-head,.kb-schema-row{display:grid;grid-template-columns:1fr 1.2fr 140px;gap:12px;padding:10px 14px}.kb-schema-head{background:#f7f8fa;font-size:13px;font-weight:600;color:#374151}.kb-schema-row+.kb-schema-row{border-top:1px solid #f1f5f9}.kb-index-title{margin:0 0 4px;font-size:15px}.kb-fields{border:1px solid #e5e7eb;border-radius:10px;overflow:hidden}.kb-fields-head,.kb-fields-row{display:grid;grid-template-columns:80px 1.4fr 1fr 140px 140px;gap:12px;align-items:center;padding:11px 16px}.kb-fields-head{background:#f7f8fa;font-size:13px;font-weight:600;color:#374151}.kb-fields-row+.kb-fields-row{border-top:1px solid #f1f5f9}.kb-f-sort{display:inline-flex;align-items:center;gap:4px;cursor:grab;color:#9ca3af;font-size:13px;font-weight:500}.kb-f-name,.kb-f-type{font-size:13px;color:#374151}.kb-field-label{display:flex;align-items:center;justify-content:space-between;width:100%}.kb-example{display:inline-flex;align-items:center;gap:4px;color:#374151;font-size:13px;font-weight:400;cursor:pointer}.kb-example:hover{color:#2563eb}.kb-types{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}.kb-types-3{grid-template-columns:repeat(3,1fr)}.kb-type{display:flex;flex-direction:column;background:#fff;padding:16px 18px;border:1px solid #e5e7eb;border-radius:10px;cursor:pointer;transition:border-color .2s,box-shadow .2s}.kb-type:hover{border-color:#93c5fd}.kb-type.on{border-color:#2563eb;box-shadow:0 1px 4px rgba(37,99,235,.12)}.kb-type-head{display:flex;align-items:center;gap:10px;margin-bottom:10px}.kb-type-icon{width:30px;height:30px;border-radius:8px;display:grid;place-items:center;flex:none;background:#eff6ff}.kb-type strong{font-size:14px}.kb-type small{flex:1;display:block;font-size:12px;line-height:1.65;color:var(--text-secondary)}.kb-type-radio{margin-left:auto;width:16px;height:16px;border-radius:50%;border:1.5px solid #d1d5db;position:relative;flex:none;background:#fff}.kb-type.on .kb-type-radio{border-color:#2563eb}.kb-type.on .kb-type-radio::after{content:'';position:absolute;inset:2.5px;border-radius:50%;background:#2563eb}.kb-type-head svg{width:18px;height:18px;flex:none}.kb-type-head strong{font-size:14px}.kb-type small{display:block;color:var(--text-secondary);font-size:12px;line-height:1.7}.kb-ds-list{display:flex;flex-direction:column;gap:8px}.kb-ds-item{padding:10px 12px;border:1px solid var(--border-color);border-radius:8px}.kb-ds-item:hover{border-color:#93c5fd}.kb-radios{display:flex;gap:18px;flex-wrap:wrap}.ai-shop-sign-page{padding:24px}.page-header,.card-title{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:18px}.page-header h1,.card-title h2{margin:0}.page-header p,.card-title p{margin:7px 0 0;color:var(--text-secondary);font-size:13px}.metric-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:16px}.metric-card,.content-card{background:#fff;border:1px solid var(--border-color);border-radius:12px}.metric-card{padding:18px}.metric-card span,.muted{color:var(--text-secondary);font-size:13px}.metric-card strong{display:block;margin-top:8px;font-size:28px;color:#2b2f3a}.content-card{padding:18px;margin-bottom:16px}.config{max-width:920px}.config-section{padding-bottom:18px;margin-bottom:18px;border-bottom:1px dashed rgba(128,128,128,.25)}.config-section:last-of-type{border-bottom:0}.test-panel{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 16px;margin-bottom:16px;border:1px solid var(--border-color);border-radius:8px;background:#fafbff}.test-panel p{margin:6px 0 0;color:var(--text-secondary);font-size:13px}.table-actions{display:flex;gap:12px;white-space:nowrap;align-items:center}
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
<style>
/* 说明气泡：黑底白字（内容 teleport 到 body，需全局样式） */
.n-popover.kb-dark-pop{background:#1f2937;color:#fff;--n-color:#1f2937;--n-text-color:#fff;--n-arrow-color:#1f2937;--n-arrow-color-hover:#1f2937}
.n-popover.kb-dark-pop .kb-tip{color:#fff}
</style>
