<template>
  <main class="page">
    <header v-if="isData"><div><n-button text type="primary" @click="router.push('/platform/ai-shop-sign/knowledge')">返回知识库</n-button><div class="title"><h1>{{ name }}</h1><n-tag type="info" :bordered="false">{{ version }}</n-tag><n-tag type="success" :bordered="false">表格数据集</n-tag><n-tag v-if="building" type="warning" :bordered="false"><template #icon><n-spin :size="10" /></template>索引构建中</n-tag><n-tag v-else-if="buildingDone" type="success" :bordered="false">索引构建完成</n-tag></div></div><n-space><n-button :disabled="building" @click="openEdit">编辑</n-button></n-space></header>
    <section v-if="isData" class="card">
      <n-alert v-if="building" type="info" :show-icon="true" style="margin-bottom:14px">索引构建中，内容暂未生成，暂不可操作</n-alert>
      <div class="ck-bar">
        <div class="ck-bar-left"><span class="ck-crumb"><svg viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>{{ name }}<n-button text type="primary" @click="router.push('/platform/ai-shop-sign/datasets')">查看数据集 ↗</n-button></span><small class="ck-updated">更新于{{ updatedAt }}</small></div>
        <div class="ck-bar-right"><span class="ck-count">共{{ building?0:dataRows.length }}个切片</span><n-button type="primary" :disabled="building" @click="openRowCreate">+ 创建切片</n-button><n-button :disabled="building" @click="idxOpen=true">查看索引</n-button></div>
      </div>
      <n-data-table :columns="dataColumns" :data="building?[]:pagedRows" :bordered="false" size="small" :scroll-x="1100" />
      <div class="ck-page"><n-pagination v-model:page="dataPage" :page-size="9" :item-count="building?0:dataRows.length" /></div>
    </section>
    <template v-if="!isData">
    <header><div><n-button text type="primary" @click="router.push('/platform/ai-shop-sign/knowledge')">返回知识库</n-button><div class="title"><h1>{{ name }}</h1><n-tag type="info" :bordered="false">{{ version }}</n-tag><n-tag :type="knowledgeType==='数据查询'?'success':'info'" :bordered="false">{{ knowledgeType }}</n-tag><n-tag v-if="building" type="warning" :bordered="false"><template #icon><n-spin :size="10" /></template>索引构建中</n-tag><n-tag v-else-if="buildingDone" type="success" :bordered="false">索引构建完成</n-tag></div></div><n-space><n-button :disabled="building" @click="openEdit">编辑</n-button></n-space></header>
    <n-alert v-if="building" type="info" :show-icon="true" style="margin-bottom:14px">索引构建中，内容暂未生成，暂不可操作</n-alert>
    <div class="view-tabs"><button class="vt" :class="{on:viewTab==='docs'}" @click="viewTab='docs'">文档列表</button><button class="vt" :class="{on:viewTab==='chunks'}" @click="viewTab='chunks'">切片详情</button></div>
    <section v-if="viewTab==='docs'" class="card"><div class="cardhead"><div><h2>文档列表</h2><p>复刻知识库 → 文档 → 切片的管理层级，并保留类目与解析状态。</p></div><n-space><n-button :disabled="building" @click="catDrawer=true">类目管理</n-button><template v-if="batchMode"><n-button type="primary" :disabled="building||!selected.length" @click="batchRetry">批量重试解析</n-button><n-button type="error" :disabled="building||!selected.length" @click="batchDel">批量删除</n-button><n-button @click="toggleBatch">退出批量操作</n-button></template><n-button v-else :disabled="building" @click="toggleBatch">批量操作</n-button><n-button type="primary" :disabled="building" @click="openImp">上传数据</n-button></n-space></div><div class="filters"><n-select v-model:value="status" :options="statusOptions" style="width:140px"/><n-select v-model:value="format" :options="formatOptions" style="width:140px"/><n-input v-model:value="keyword" placeholder="搜索文件名称" clearable style="width:250px"/></div><n-data-table :columns="columns" :data="building?[]:filtered" :bordered="false" size="small" :pagination="building?false:{pageSize:8}" :scroll-x="980" :row-key="(x:Doc)=>x.id" :checked-row-keys="selected" @update:checked-row-keys="(k:any)=>selected=k"/></section>
    <section v-else class="card">
      <div class="ck-bar">
        <div class="ck-bar-left"><n-select v-model:value="chunkDoc" :options="chunkDocOptions" :disabled="building" style="width:240px"/><n-input v-model:value="chunkKw" placeholder="搜索切片" clearable :disabled="building" style="width:240px"/></div>
        <div class="ck-bar-right"><span class="ck-count">共 {{ building?0:chunkList.length }} 个切片</span><n-button type="primary" :disabled="building" @click="openCreateChunk">+ 创建切片</n-button></div>
      </div>
      <div v-if="!building&&chunkList.length" class="ck-list">
        <article v-for="(x,i) in chunkList" :key="x.c.id" class="ck-item">
          <div class="ck-actions">
            <n-button size="small" quaternary type="primary" @click="openChunk(x,i)">≡ 切片详情</n-button>
            <n-button size="small" quaternary type="primary" @click="delChunk(x)">删除</n-button>
            <n-switch size="small" :value="x.c.enabled!==false" @update:value="(v:boolean)=>{x.c.enabled=v;message.success(v?'切片已开启':'切片已关闭')}" />
          </div>
          <b class="ck-num">{{ i+1 }}</b>
          <div class="ck-body">
            <small class="ck-len">{{ x.c.text.length }} 字符</small>
            <h3>{{ x.c.title }}</h3>
            <p>{{ x.c.text }}</p>
            <div class="ck-foot"><span>创建时间：{{ x.d.indexed }}</span><span>文档 ID：{{ x.d.id }}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" @click="copyDocId(x.d.id)"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></span></div>
          </div>
        </article>
      </div>
      <n-empty v-else :description="building?'索引构建中，暂无切片':'暂无切片'"/>
    </section>
    </template>
    <n-drawer v-model:show="chunkDetailModal" :width="520">
      <n-drawer-content title="切片详情" closable>
        <template v-if="chunkActive">
          <div class="ck-d-top"><b class="ck-num">{{ chunkIndex+1 }}</b><small class="ck-len">{{ chunkActive.c.text.length }}字符</small></div>
          <div class="ck-d-doc"><span class="ck-d-name"><svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>{{ chunkActive.d.name }}</span><span class="ck-d-id" @click="copyDocId(chunkActive.d.id)">文档 ID <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></span></div>
          <n-form label-placement="top" class="ck-d-form">
            <n-form-item label="切片标题"><n-input v-model:value="editTitle" maxlength="50" show-count placeholder="请输入切片标题" /></n-form-item>
            <n-form-item label="图片">
              <n-upload :default-upload="false" :max="1" accept=".png,.jpg,.jpeg,.bmp,.gif" style="width:100%">
                <n-upload-dragger><p class="upload-hint">点击或拖拽上传图片</p><p class="upload-sub">单图片大小≤20MB，格式支持 .png、.jpg、.jpeg、.bmp、.gif 等</p></n-upload-dragger>
              </n-upload>
            </n-form-item>
            <n-form-item label="切片内容" required><n-input v-model:value="editContent" type="textarea" :maxlength="6000" show-count :autosize="{minRows:10,maxRows:18}" placeholder="请输入切片内容" /></n-form-item>
          </n-form>
        </template>
        <template #footer><n-space justify="end"><n-button @click="chunkDetailModal=false">取消</n-button><n-button type="primary" @click="confirmChunk">确认</n-button></n-space></template>
      </n-drawer-content>
    </n-drawer>
    <n-drawer v-model:show="createChunkOpen" :width="520">
      <n-drawer-content title="创建切片" closable>
        <n-form label-placement="top" class="ck-d-form">
          <n-form-item label="所属文档" required><n-select v-model:value="ccDoc" :options="chunkDocOptions.filter(o=>o.value!=='all')" placeholder="请选择所属文档" /></n-form-item>
          <n-form-item label="切片标题"><n-input v-model:value="ccTitle" maxlength="50" show-count placeholder="请输入切片标题" /></n-form-item>
          <n-form-item label="图片">
            <n-upload :default-upload="false" :max="1" accept=".png,.jpg,.jpeg,.bmp,.gif" style="width:100%">
              <n-upload-dragger><p class="upload-hint">点击或拖拽上传图片</p><p class="upload-sub">单图片大小≤20MB，格式支持 .png、.jpg、.jpeg、.bmp、.gif 等</p></n-upload-dragger>
            </n-upload>
          </n-form-item>
          <n-form-item label="切片内容" required><n-input v-model:value="ccContent" type="textarea" :maxlength="6000" show-count :autosize="{minRows:10,maxRows:18}" placeholder="请输入切片内容" /></n-form-item>
        </n-form>
        <template #footer><n-space justify="end"><n-button @click="createChunkOpen=false">取消</n-button><n-button type="primary" @click="confirmCreateChunk">确认</n-button></n-space></template>
      </n-drawer-content>
    </n-drawer>
    <n-drawer v-model:show="rowDrawer" :width="520">
      <n-drawer-content :title="rowMode==='create'?'创建切片':'切片详情'" closable>
        <div v-if="rowMode==='edit'&&rowTarget" class="ck-d-top"><span class="ck-d-name">{{ name }}</span><span class="ck-d-id" @click="copyDocId(docId)">文档 ID <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></span></div>
        <n-form label-placement="top" class="ck-d-form">
          <n-form-item v-for="(c,i) in DATA_COLS" :key="c.name">
            <template #label><span class="row-label">{{ c.name }}<i class="req">*</i><em class="type-tag">{{ c.type }}</em></span></template>
            <n-input v-model:value="rowVals[i]" type="textarea" :maxlength="6000" show-count :autosize="{minRows:1,maxRows:8}" :placeholder="rowMode==='create'?'请输入':''" />
          </n-form-item>
        </n-form>
        <template #footer><n-space justify="end"><n-button @click="rowDrawer=false">取消</n-button><n-button type="primary" @click="saveRow">确认</n-button></n-space></template>
      </n-drawer-content>
    </n-drawer>
    <n-drawer v-model:show="catDrawer" :width="440"><n-drawer-content title="类目管理" closable><p>类目用于整理资料库文件，一个文档当前归属一个主类目。</p><div v-for="x in categories" :key="x.name" class="row"><div><b>{{ x.name }}</b><small>{{ x.count }} 个文件</small></div><n-tag size="small" type="success">启用</n-tag></div><n-button dashed block @click="addCategory">+ 新增类目</n-button></n-drawer-content></n-drawer>
    <n-modal v-model:show="upload" preset="card" title="上传数据（原型）" style="width:500px"><n-form label-placement="top"><n-form-item label="文件名称"><n-input v-model:value="uploadName" placeholder="国庆主题活动方案.docx"/></n-form-item><n-form-item label="归属类目"><n-select v-model:value="uploadCategory" :options="categoryOptions"/></n-form-item><n-alert type="warning" :show-icon="true">提交后只在当前原型新增一条“解析中”的文档。</n-alert></n-form><template #footer><n-space justify="end"><n-button @click="upload=false">取消</n-button><n-button type="primary" @click="addDoc">提交解析</n-button></n-space></template></n-modal>
    <n-modal v-model:show="editOpen" preset="card" title="编辑知识库" style="width:520px">
      <n-form label-placement="top">
        <n-form-item label="知识库名称" required><n-input v-model:value="editName" maxlength="30" show-count placeholder="请输入知识库名称" /></n-form-item>
        <n-form-item label="知识库描述" required><n-input v-model:value="editDesc" type="textarea" maxlength="200" show-count placeholder="请输入知识库描述" /></n-form-item>
      </n-form>
      <template #footer><n-space justify="end"><n-button @click="editOpen=false">取消</n-button><n-button type="primary" @click="saveEdit">保存</n-button></n-space></template>
    </n-modal>
    <n-modal v-model:show="impOpen" preset="card" title="导入数据" class="kb-modal" style="width:840px">
      <div class="kb-steps"><template v-for="(s,i) in ['选择数据','索引设置']" :key="s"><i v-if="i" class="kb-line" :class="{on:impStep>i}" /><div class="kb-step" :class="{active:impStep===i+1,done:impStep>i+1}"><b>{{ impStep>i+1?'✓':i+1 }}</b><span>{{ s }}</span></div></template></div>
      <template v-if="impStep===1">
        <div class="kb-form-body">
          <div class="kb-ds-head"><p class="kb-section-label" style="margin:0">选择数据集</p><a class="kb-ds-link" @click="router.push('/platform/ai-shop-sign/datasets')">创建数据集 ↗</a></div>
          <p class="kb-ds-tip">从数据集内选择已解析的文件文档构建知识库索引，或直接上传文件解析并构建索引，上传的文件将自动存储在数据集。</p>
          <div class="kb-ds-row"><n-select v-model:value="impDataset" :options="impOptions" :render-label="impRenderLabel" placeholder="请选择数据集" /><n-button quaternary circle title="刷新" @click="message.info('数据集列表已刷新')"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/></svg></n-button></div>
          <p class="kb-section-label kb-mt">数据来源</p>
          <div class="kb-src">
            <div class="kb-type" :class="{on:impSource==='file'}" @click="impSource='file'"><div class="kb-type-head"><strong>选择文件</strong><i class="kb-type-radio"></i></div><small>选择应用数据类目下的文件构建索引，一次最大支持 50 个文件的导入</small></div>
            <div class="kb-type" :class="{on:impSource==='category'}" @click="impSource='category'"><div class="kb-type-head"><strong>选择类目</strong><i class="kb-type-radio"></i></div><small>选择数据集的文件类目，将类目下的所有文件导入并构建索引，支持自动同步</small></div>
          </div>
          <p class="kb-section-label kb-mt">{{ impSource==='file'?'选择文件':'选择类目' }}</p>
          <div v-if="impSource==='file'" class="kb-pick">
            <aside class="kb-pick-cats">
              <div class="kb-pick-title">类目 <em>({{ impDs.categories.length }})</em></div>
              <div v-for="c in impDs.categories" :key="c" class="kb-cat-item" :class="{active:c===impActiveCat}" @click="impActiveCat=c">{{ c }}</div>
            </aside>
            <div class="kb-pick-files">
              <div class="kb-pick-toolbar"><n-input v-model:value="impKw" size="small" clearable placeholder="请输入文件名称" style="width:220px" /><span class="kb-pick-count">已选 {{ impSelFiles.length }} / {{ impRows.length }}</span></div>
              <n-data-table :columns="impFileCols" :data="impRows" :row-key="(r:any)=>r.name" v-model:checked-row-keys="impSelFiles" :bordered="false" size="small" :max-height="220" />
            </div>
          </div>
          <template v-else>
            <div class="kb-sync-row"><span class="kb-sync-label">自动同步知识库索引：</span><n-switch v-model:value="impAutoSync" size="small" /></div>
            <p class="kb-sync-tip">开启后将自动同步数据集类目下所有文档文件，在类目下文件发生变化后，自动同步重建并更新索引</p>
            <div class="kb-pick">
              <aside class="kb-pick-cats">
                <div class="kb-pick-title">类目 <i class="kb-q">?</i></div>
                <div v-for="c in impDs.categories" :key="c" class="kb-cat-item" :class="{active:impSelCats.includes(c)}" @click="toggleImpCat(c)">
                  <n-checkbox :checked="impSelCats.includes(c)" size="small" @click.stop @update:checked="toggleImpCat(c)" />
                  <span class="kb-cat-name">{{ c }}</span>
                </div>
              </aside>
              <div class="kb-pick-files">
                <div class="kb-pick-toolbar"><strong class="kb-pick-head">文件列表预览</strong><span class="kb-pick-actions"><a class="kb-ds-link" @click="message.info('请在数据集管理中导入数据')">+ 添加数据</a></span></div>
                <n-data-table :columns="impPreviewCols" :data="impPreviewRows" :bordered="false" size="small" :max-height="200" />
              </div>
            </div>
            <div class="kb-sel-cats"><p class="kb-sel-cats-label">已选类目（{{ impSelCats.length }}/50）</p><div><n-tag v-for="c in impSelCats" :key="c" size="small" closable @close="toggleImpCat(c)" style="margin:0 8px 8px 0">{{ c }}</n-tag><span v-if="!impSelCats.length" class="kb-sel-empty">尚未选择类目</span></div></div>
          </template>
        </div>
      </template>
      <template v-else>
        <div class="kb-form-body">
          <p class="kb-section-label"><i class="kb-req">*</i>切片方式</p>
          <div class="kb-chunk-grid">
            <div v-for="m in impChunkModes" :key="m.value" class="kb-type" :class="{on:impChunkMode===m.value}" @click="impChunkMode=m.value"><div class="kb-type-head"><strong>{{ m.label }}</strong><i class="kb-type-radio"></i></div><small>{{ m.desc }}</small></div>
          </div>
          <div class="kb-chunk-panel">
            <template v-if="impChunkMode==='length'">
              <div>
                <p class="kb-slider-label"><i class="kb-req">*</i>分段预估长度</p>
                <div class="kb-slider-row"><n-slider v-model:value="impChunkMax" :min="10" :max="6000" :tooltip="false" /><n-input-number v-model:value="impChunkMax" size="small" style="width:120px" /></div>
                <div class="kb-slider-bounds"><span>10</span><span>6000</span></div>
              </div>
              <div>
                <p class="kb-slider-label"><i class="kb-req">*</i>分段重叠长度 <i class="kb-q">?</i></p>
                <div class="kb-slider-row"><n-slider v-model:value="impChunkOverlap" :min="0" :max="1024" :tooltip="false" /><n-input-number v-model:value="impChunkOverlap" size="small" style="width:120px" /></div>
                <div class="kb-slider-bounds"><span>0</span><span>1024</span></div>
              </div>
            </template>
            <template v-else-if="impChunkMode==='title'">
              <div>
                <p class="kb-slider-label"><i class="kb-req">*</i>最大分段长度 <i class="kb-q">?</i></p>
                <div class="kb-slider-row"><n-slider v-model:value="impChunkMax" :min="10" :max="6000" :tooltip="false" /><n-input-number v-model:value="impChunkMax" size="small" style="width:120px" /></div>
                <div class="kb-slider-bounds"><span>10</span><span>6000</span></div>
              </div>
              <div>
                <p class="kb-slider-label"><i class="kb-req">*</i>标题级数</p>
                <div class="kb-slider-row"><n-slider v-model:value="impTitleLevel" :min="1" :max="5" :tooltip="false" /><n-input-number v-model:value="impTitleLevel" size="small" style="width:120px" /></div>
                <div class="kb-slider-bounds"><span>1</span><span>5</span></div>
              </div>
            </template>
            <template v-else-if="impChunkMode==='regex'">
              <div>
                <p class="kb-slider-label"><i class="kb-req">*</i>输入正则表达式</p>
                <n-input v-model:value="impRegex" style="max-width:480px" />
              </div>
              <div>
                <p class="kb-slider-label"><i class="kb-req">*</i>最大分段长度 <i class="kb-q">?</i></p>
                <div class="kb-slider-row"><n-slider v-model:value="impChunkMax" :min="10" :max="6000" :tooltip="false" /><n-input-number v-model:value="impChunkMax" size="small" style="width:120px" /></div>
                <div class="kb-slider-bounds"><span>10</span><span>6000</span></div>
              </div>
            </template>
            <template v-else-if="impChunkMode==='symbol'">
              <div>
                <p class="kb-slider-label"><i class="kb-req">*</i>标识符选择</p>
                <n-select v-model:value="impSymbol" :options="impSymbolOptions" style="max-width:480px" clearable filterable />
              </div>
              <div>
                <p class="kb-slider-label"><i class="kb-req">*</i>最大分段长度 <i class="kb-q">?</i></p>
                <div class="kb-slider-row"><n-slider v-model:value="impChunkMax" :min="10" :max="6000" :tooltip="false" /><n-input-number v-model:value="impChunkMax" size="small" style="width:120px" /></div>
                <div class="kb-slider-bounds"><span>10</span><span>6000</span></div>
              </div>
            </template>
            <template v-else>
              <div>
                <p class="kb-slider-label"><i class="kb-req">*</i>最大分段长度 <i class="kb-q">?</i></p>
                <div class="kb-slider-row"><n-slider v-model:value="impChunkMax" :min="10" :max="6000" :tooltip="false" /><n-input-number v-model:value="impChunkMax" size="small" style="width:120px" /></div>
                <div class="kb-slider-bounds"><span>10</span><span>6000</span></div>
              </div>
            </template>
          </div>
          <div class="kb-switch-row"><span>Excel表头拼装 <n-popover trigger="hover" placement="top-start" :width="290"><template #trigger><i class="kb-q">?</i></template><p class="kb-tip">是否将Excel的首行数据，作为表头和每行数据进行拼装。例：首行两列分别为「姓名」「年龄」，第二行两列分别为「张三」「18」，那么开启此功能后，此Excel的切分为：“姓名：张三；年龄：“18”。<br>如果无表头，请勿开启此功能</p></n-popover></span><n-switch v-model:value="impExcelHeader" size="small" /></div>
          <div class="kb-section"><p class="kb-section-label">向量模型</p><n-select v-model:value="impEmbedModel" :options="impEmbedOptions" :render-option="impEmbedRenderOption" style="max-width:420px" /></div>
        </div>
      </template>
      <template #footer><n-space justify="end"><n-button @click="impOpen=false">取消</n-button><n-button v-if="impStep>1" @click="impStep--">上一步</n-button><n-button v-if="impStep<2" type="primary" @click="impNext">下一步</n-button><n-button v-else type="primary" @click="impConfirm">完成</n-button></n-space></template>
    </n-modal>
    <n-modal v-model:show="idxOpen" preset="card" title="索引配置" style="width:680px">
      <n-data-table :columns="idxColumns" :data="idxRows" :bordered="false" size="small" />
      <template #footer><n-space justify="end"><n-button @click="idxOpen=false">关闭</n-button></n-space></template>
    </n-modal>
  </main>
</template>
<script setup lang="ts">
import { computed,h,ref,onMounted,watch } from 'vue'; import { useRoute,useRouter } from 'vue-router'; import { NButton,NTag,NTooltip,NSpin,NSwitch,useDialog,useMessage } from 'naive-ui';
type Chunk={id:string;title:string;text:string;pos:string;tokens:number;enabled?:boolean}; type Doc={id:string;name:string;format:string;status:string;size:string;category:string;indexed:string;chunks:Chunk[]};
const route=useRoute(),router=useRouter(),message=useMessage(),dialog=useDialog(),name=computed(()=>String(route.query.name||'门店服务资料')),description=computed(()=>String(route.query.description||'品牌、门店服务与运营活动的标准知识资料')),version=computed(()=>String(route.query.version||'标准版')),knowledgeType=computed(()=>String(route.query.knowledgeType||'文档搜索')==='data-query'?'数据查询':'文档搜索'),updatedAt=computed(()=>String(route.query.updatedAt||'—'));
const isData=computed(()=>knowledgeType.value==='数据查询');
const building=ref(String(route.query.status||'')==='building'),buildingDone=ref(false);
onMounted(()=>{if(building.value)setTimeout(()=>{building.value=false;buildingDone.value=true;message.success('索引构建完成')},8000)});
const DATA_COLS=[{name:'序号',type:'number'},{name:'性别',type:'string'},{name:'模型名称',type:'string'},{name:'视频链接',type:'string'},{name:'角色名字',type:'string'},{name:'角色描述',type:'string'},{name:'打招呼用语',type:'string'}];
const makeDataRows=()=>[['1','女','video.mp4','苏小棉','一个性格温柔的女孩子，平时喜欢安静地待在角落看书画画，虽然话不多…','嗨，今天辛苦呀？如果你愿意，我可以陪你聊心里的事情和憧憬。'],['2','女','1-video(5).mp4','林晓雨','活泼开朗的女孩子，总是带着灿烂的笑容，她喜欢尝试各种新鲜事物，对世界充满好奇。','嗨，你来了！我刚好在等你，今天想先聊点开心的，还是让我来猜猜你的心情？'],['3','女','1-video(4).mp4','陈思琪','安静优雅的女孩子，喜欢绘画和写作。她有着细腻的情感和丰富的内心世界。','嗨，我一点也不觉得很难过，现在的心情开始也可以。'],['4','女','1-video(6).mp4','周雨萱','一个性格独立，做事干脆利落的女孩子。她有着不服输的韧性，面对挑战从不退缩…','嗨，今天的你看起来像是遇到的什么挑战需要加打气，还是想轻松聊聊？'],['5','男','video(24).mp4','陆子轩','一个阳光帅气的男孩，喜欢打篮球和玩游戏。他性格开朗，人缘很好，总是能带…','嘿，看到你来了我挺开心的。今天又怎么着？想聊聊近况，还是让我给你打个…'],['6','女','video(22).mp4','叶诗涵','一个气质出众的女孩子，有独特的时尚品味。她喜欢拍照和逛街，经常在小红书…','你的来，不用急着说得我完整，先从现在的心情开始也可以。'],['7','女','1-video(2).mp4','沈梦瑶','一个爱笑的元气少女，像个小太阳一样温暖着身边的人。她喜欢记录美景、梦…','来了呀，今天睡得还挺快的，还是想把心里面这段反反复复的情绪说出来？'],['8','女','1-video(7).mp4','方正晴','一个聪明伶俐的女孩子，学习成绩优异，是班里里的学霸。她不仅学习好，还多才…','你好，我在整理思路，你带着什么问题来都可以，我们可以一点一点拆开。'],['9','男','video(23).mp4','韩逸飞','他外表冷漠，但内心火热，对朋友非常…','我想陪你把节奏找回来。']].map((v,i)=>({key:i+1,enabled:true,values:[...v]}));
const dataRows=ref<{key:number;enabled:boolean;values:string[]}[]>(isData.value?makeDataRows():[]);
const dataPage=ref(1);
const pagedRows=computed(()=>{const start=(dataPage.value-1)*9;return dataRows.value.slice(start,start+9)});
const dataColumns=computed(()=>[
  ...DATA_COLS.map((c,i)=>({title:`${c.name} (${c.type})`,key:`c${i}`,minWidth:i>=4?220:130,ellipsis:{tooltip:true},render:(r:any)=>r.values[i]||''})),
  {title:'操作',key:'op',width:120,fixed:'right' as const,render:(r:any)=>h('div',{style:'display:flex;gap:14px;align-items:center'},[h(NButton,{text:true,type:'primary',size:'small',onClick:()=>openRowEdit(r)},{default:()=>'编辑'}),h(NButton,{text:true,type:'primary',size:'small',onClick:()=>delRow(r)},{default:()=>'删除'})])}
]);
const rowDrawer=ref(false),rowMode=ref<'create'|'edit'>('create'),rowIdx=ref(-1),rowVals=ref<string[]>([]),rowTarget=ref<any>(null);
const docId=computed(()=>String(route.params.id||''));
function openRowCreate(){rowMode.value='create';rowVals.value=DATA_COLS.map(()=>'');rowDrawer.value=true}
function openRowEdit(r:any){rowMode.value='edit';rowTarget.value=r;rowIdx.value=dataRows.value.indexOf(r);rowVals.value=[...r.values];rowDrawer.value=true}
function saveRow(){if(rowVals.value.some(v=>!v.trim()))return message.warning('请填写完整各列内容');if(rowMode.value==='create'){dataRows.value.push({key:dataRows.value.length+1,enabled:true,values:[...rowVals.value]})}else{const r=dataRows.value[rowIdx.value];if(r)r.values=[...rowVals.value]}rowDrawer.value=false;message.success(rowMode.value==='create'?'切片已创建':'切片已保存')}
function delRow(r:any){dialog.warning({title:'删除切片',content:`确定删除序号为 ${r.key} 的切片吗？删除后不可恢复。`,positiveText:'删除',negativeText:'取消',onPositiveClick:()=>{const i=dataRows.value.indexOf(r);if(i>=0)dataRows.value.splice(i,1);dataRows.value.forEach((x,idx)=>x.key=idx+1);message.success('切片已删除')}})}
const makeDocs=():Doc[]=>[{id:'doc-001',name:'门店营业时间与服务项目.docx',format:'DOCX',status:'解析完成',size:'49.0 KB',category:'门店服务',indexed:'2026-09-22 17:48',chunks:[{id:'ck-001',title:'营业时间',text:'门店营业时间为周一至周五 09:00–21:00，周末及法定节假日 09:00–22:00。闭店前 30 分钟停止入场。',pos:'第 1 段',tokens:71},{id:'ck-002',title:'服务项目',text:'门店提供 VR 游戏体验、生日派对包场和企业团建活动三类服务。生日派对需至少提前 3 天预约。',pos:'第 2 段',tokens:68}]},{id:'doc-002',name:'会员充值与退卡规则.pdf',format:'PDF',status:'解析完成',size:'328.0 KB',category:'会员规则',indexed:'2026-09-22 17:45',chunks:[{id:'ck-003',title:'会员充值',text:'会员充值套餐为充 300 送 30、充 500 送 80、充 1000 送 200；赠送金额有效期为 12 个月。',pos:'第 3 页',tokens:60},{id:'ck-004',title:'退卡规则',text:'实付金额可按规则原路退还，赠送金额不予退还；已消费项目按单次原价核算。',pos:'第 4 页',tokens:49}]},{id:'doc-003',name:'国庆主题活动说明.pptx',format:'PPTX',status:'解析中',size:'2.4 MB',category:'活动营销',indexed:'—',chunks:[]},{id:'doc-004',name:'常见问答 FAQ 汇总.md',format:'MD',status:'解析失败',size:'86.0 KB',category:'门店服务',indexed:'2026-09-21 11:02',chunks:[]},{id:'doc-005',name:'门店活动排期表.xlsx',format:'XLSX',status:'索引构建中',size:'128.0 KB',category:'活动营销',indexed:'—',chunks:[]}];
const docs=ref(makeDocs()),categories=ref([{name:'门店服务',count:2},{name:'会员规则',count:1},{name:'活动营销',count:1}]),status=ref('all'),format=ref('all'),keyword=ref(''),viewTab=ref<'docs'|'chunks'>('docs'),chunkKw=ref(''),catDrawer=ref(false),upload=ref(false),uploadName=ref(''),uploadCategory=ref('门店服务');
const statusOptions=[{label:'全部状态',value:'all'},{label:'上传中',value:'上传中'},{label:'待解析',value:'待解析'},{label:'解析中',value:'解析中'},{label:'解析完成',value:'解析完成'},{label:'解析失败',value:'解析失败'},{label:'索引构建中',value:'索引构建中'},{label:'索引构建完成',value:'索引构建完成'},{label:'索引构建失败',value:'索引构建失败'}],formatOptions=[{label:'全部格式',value:'all'},{label:'DOCX',value:'DOCX'},{label:'PDF',value:'PDF'},{label:'PPTX',value:'PPTX'},{label:'MD',value:'MD'}];
const categoryOptions=computed(()=>categories.value.map(x=>({label:x.name,value:x.name}))),filtered=computed(()=>docs.value.filter(x=>(status.value==='all'||x.status===status.value)&&(format.value==='all'||x.format===format.value)&&x.name.toLowerCase().includes(keyword.value.toLowerCase())));
// 百炼文档状态流：上传文件 → 解析文件 → 构建索引
const statusTypes:Record<string,'success'|'warning'|'info'|'error'|'default'>={'上传中':'info','待解析':'default','解析中':'warning','解析完成':'success','解析失败':'error','索引构建中':'info','索引构建完成':'success','索引构建失败':'error'};
const type=(x:string)=>statusTypes[x]||'warning';
const chunkDoc=ref('all'),chunkDocOptions=computed(()=>[{label:'全部文档',value:'all'},...docs.value.map(d=>({label:d.name,value:d.id}))]);
const chunkList=computed(()=>{const kw=chunkKw.value.trim().toLowerCase();return docs.value.flatMap(d=>d.chunks.map(c=>({d,c}))).filter(x=>(chunkDoc.value==='all'||x.d.id===chunkDoc.value)&&(!kw||x.c.title.toLowerCase().includes(kw)||x.c.text.toLowerCase().includes(kw)||x.d.name.toLowerCase().includes(kw)))});
function goChunks(x:Doc){viewTab.value='chunks';chunkDoc.value=x.id;chunkKw.value=''}
const createChunkOpen=ref(false),ccDoc=ref(''),ccTitle=ref(''),ccContent=ref('');
function openCreateChunk(){if(!docs.value.length)return message.warning('当前知识库暂无文档，请先在文档列表导入');ccDoc.value=chunkDoc.value!=='all'?chunkDoc.value:docs.value[0].id;ccTitle.value='';ccContent.value='';createChunkOpen.value=true}
function confirmCreateChunk(){const target=docs.value.find(d=>d.id===ccDoc.value);if(!target)return message.warning('请选择所属文档');if(!ccContent.value.trim())return message.warning('请输入切片内容');target.chunks.push({id:`ck-${Date.now().toString(36)}`,title:ccTitle.value.trim()||'新建切片',text:ccContent.value,pos:'—',tokens:Math.round(ccContent.value.length/1.6),enabled:true});createChunkOpen.value=false;message.success(`已在「${target.name}」创建切片`)}
function copyDocId(id:string){navigator.clipboard?.writeText(id).then(()=>message.success('文档 ID 已复制')).catch(()=>message.info(`文档 ID：${id}`))}
const chunkDetailModal=ref(false),chunkActive=ref<{d:Doc;c:Chunk}|null>(null),chunkIndex=ref(0),editTitle=ref(''),editContent=ref('');
function openChunk(x:{d:Doc;c:Chunk},idx:number){chunkActive.value=x;chunkIndex.value=idx;editTitle.value=x.c.title;editContent.value=x.c.text;chunkDetailModal.value=true}
function confirmChunk(){const t=chunkActive.value;if(!t)return;if(!editContent.value.trim())return message.warning('请输入切片内容');t.c.title=editTitle.value.trim()||t.c.title;t.c.text=editContent.value;t.c.tokens=Math.round(editContent.value.length/1.6);chunkDetailModal.value=false;message.success('切片已保存')}
function delChunk(x:{d:Doc;c:Chunk}){dialog.warning({title:'删除切片',content:`确定删除切片「${x.c.title}」吗？删除后不可恢复。`,positiveText:'删除',negativeText:'取消',onPositiveClick:()=>{const i=x.d.chunks.indexOf(x.c);if(i>=0)x.d.chunks.splice(i,1);message.success('切片已删除')}})}
const batchMode=ref(false),selected=ref<string[]>([]);
function toggleBatch(){batchMode.value=!batchMode.value;selected.value=[]}
function batchRetry(){const failed=docs.value.filter(x=>selected.value.includes(x.id)&&x.status==='解析失败');if(!failed.length)return message.info('所选文档中没有解析失败的文档');failed.forEach(x=>{x.status='解析中';x.indexed='—'});message.success(`已对 ${failed.length} 个文档重新发起解析`)}
// ===== 导入数据向导（复用创建知识库第二步/第三步交互，步骤为 选择数据 → 索引设置） =====
type ImpFile={name:string;format:string;status:string;source:string;cat:string}
const IMP_DATASETS=[{id:'ds-brand-files',name:'品牌服务资料集',categories:['默认类目'],files:[{name:'品牌介绍与 VR 项目说明.docx',format:'docx',status:'解析完成',source:'本地上传',cat:'默认类目'},{name:'会员充值与退卡规则.pdf',format:'pdf',status:'解析完成',source:'本地上传',cat:'默认类目'},{name:'VR 项目设备清单.md',format:'md',status:'解析中',source:'本地上传',cat:'默认类目'},{name:'门店运营手册.docx',format:'docx',status:'上传中',source:'本地上传',cat:'默认类目'},{name:'损坏的扫描件资料.pdf',format:'pdf',status:'失败',source:'本地上传',cat:'默认类目'}]},{id:'ds-campaign-files',name:'活动营销资料集',categories:['默认类目'],files:[{name:'国庆主题活动说明.pptx',format:'pptx',status:'解析中',source:'本地上传',cat:'默认类目'},{name:'中秋活动旧版说明.pdf',format:'pdf',status:'失败',source:'本地上传',cat:'默认类目'},{name:'门店巡检话术清单.docx',format:'docx',status:'上传中',source:'本地上传',cat:'默认类目'},{name:'活动执行SOP手册.docx',format:'docx',status:'解析完成',source:'本地上传',cat:'默认类目'}]}];
const impStatusTypes:Record<string,'success'|'warning'|'info'|'error'>={'解析完成':'success','解析中':'warning','上传中':'info','失败':'error'};
const IMPORTED_KEY='touhao-kb-imported-files';
const importedNames=ref<string[]>(JSON.parse(localStorage.getItem(IMPORTED_KEY)||'[]'));
const markImported=(names:string[])=>{names.forEach(n=>{if(!importedNames.value.includes(n))importedNames.value.push(n)});localStorage.setItem(IMPORTED_KEY,JSON.stringify(importedNames.value))};
const impOpen=ref(false),impStep=ref(1),impDataset=ref('ds-brand-files'),impSource=ref<'file'|'category'>('file'),impSelFiles=ref<string[]>([]),impSelCats=ref<string[]>([]),impActiveCat=ref('默认类目'),impKw=ref(''),impAutoSync=ref(true);
const impChunkModes=[{value:'smart',label:'智能切分',desc:'在通用文档上的较优chunk切分方法，经过评测可在多数文档上获得较佳的检索效果'},{value:'length',label:'按长度切分',desc:'适合对 Token 数量有严格要求的场景，比如使用上下文长度较小的模型时。'},{value:'page',label:'按页切分',desc:'适合每页传达独立主题的文档，要求不同页面的内容不会混杂在同一文本切片中。'},{value:'title',label:'按标题切分',desc:'适合于用标题划分并传达独立主题的文档，要求不同级标题下的内容不会混杂在同一文本切片中。'},{value:'regex',label:'按照正则切分',desc:'依据设置的正则表达式，对知识库中的文本进行切分。'},{value:'symbol',label:'按照符号切分',desc:'适用于根据特定标识符区分内容的文档，根据文档文件中特殊标识符进行切分。'}];
const impChunkMode=ref('smart'),impChunkMax=ref(2000),impChunkOverlap=ref(16),impTitleLevel=ref(1),impRegex=ref(''),impSymbol=ref<string|null>(null),impExcelHeader=ref(true),impEmbedModel=ref('text-embedding-v4');
const impSymbolOptions=[...new Map([{label:'换行',value:'\\n'},{label:'中文句号',value:'。'},{label:'英文句号',value:'.'},{label:'中文叹号',value:'！'},{label:'英文叹号',value:'!'},{label:'中文逗号',value:'，'},{label:'英文逗号',value:','},{label:'中文分号',value:'；'},{label:'英文分号',value:';'},{label:'中文问号',value:'？'},{label:'英文问号',value:'?'}].map(o=>[o.value,o])).values()];
const impEmbedOptions=[{label:'text-embedding-v3',value:'text-embedding-v3',desc:'DashScope text-embedding-v3，商业化向量模型，除了中英双语，支持多语种，向量结果默认归一化处理'},{label:'text-embedding-v4',value:'text-embedding-v4',desc:'DashScope text-embedding-v4，商业化向量模型，除了中英双语，支持多语种，向量结果默认归一化处理'}];
const impEmbedRenderOption=(o:any)=>h('div',{style:'display:flex;flex-direction:column;gap:2px;padding:4px 0'},{default:()=>[h('span',{style:'font-size:13px;font-weight:500;color:#1f2937'},o.label),h('span',{style:'font-size:12px;color:#9ca3af;line-height:1.5'},o.desc)]});
const impDs=computed(()=>IMP_DATASETS.find(d=>d.id===impDataset.value)||IMP_DATASETS[0]);
const impOptions=IMP_DATASETS.map(d=>({label:d.name,value:d.id}));
const impRenderLabel=(o:any)=>h('span',{style:'display:inline-flex;align-items:center;gap:8px'},[o.label,h(NTag,{size:'small',bordered:false,style:'background:#f3f4f6;color:#6b7280;font-size:11px;padding:0 6px'},{default:()=>'文件'})]);
watch(impDataset,()=>{impActiveCat.value=impDs.value.categories[0]||'';impSelFiles.value=[];impSelCats.value=[]});
const impRows=computed(()=>{const kw=impKw.value.trim();return impDs.value.files.filter(f=>(!impActiveCat.value||f.cat===impActiveCat.value)&&(!kw||f.name.includes(kw)))});
const impFileCols=[{type:'selection' as const},{title:'文件名称',key:'name',minWidth:190},{title:'格式',key:'format',width:90,render:(r:ImpFile)=>h('span',{style:'display:inline-flex;align-items:center;gap:6px;font-size:12px;color:#6b7280'},[h('i',{style:'width:14px;height:14px;border-radius:3px;background:#dbeafe;display:inline-block;flex:none'}),r.format])},{title:'状态',key:'status',width:110,render:(r:ImpFile)=>{const done=importedNames.value.includes(r.name);return done?h(NTag,{type:'success',size:'small',bordered:false},{default:()=>'导入完成'}):h(NTag,{type:impStatusTypes[r.status]||'default',size:'small',bordered:false},{...(r.status==='解析中'||r.status==='上传中'?{icon:()=>h(NSpin,{size:11,style:'margin-right:4px'})}:{}),default:()=>r.status})}},{title:'数据来源',key:'source',width:110,render:(r:ImpFile)=>h(NTag,{size:'small',bordered:false},{default:()=>r.source})}];
const toggleImpCat=(c:string)=>{const i=impSelCats.value.indexOf(c);if(i>=0)impSelCats.value.splice(i,1);else if(impSelCats.value.length<50)impSelCats.value.push(c)};
const impPreviewRows=computed(()=>impDs.value.files.filter(f=>impSelCats.value.includes(f.cat)));
const impPreviewCols=computed(()=>impFileCols.filter((c:any)=>c.type!=='selection'));
function openImp(){impOpen.value=true;impStep.value=1;impDataset.value='ds-brand-files';impSource.value='file';impSelFiles.value=[];impSelCats.value=[];impActiveCat.value='默认类目';impKw.value='';impChunkMode.value='smart';impChunkMax.value=2000;impChunkOverlap.value=16;impTitleLevel.value=1;impRegex.value='';impSymbol.value=null;impExcelHeader.value=true;impEmbedModel.value='text-embedding-v4'}
// ===== 索引配置弹窗（数据查询知识库 · 查看索引） =====
const idxOpen=ref(false),idxSearch=ref<Record<string,boolean>>({}),idxReply=ref<Record<string,boolean>>({});
const idxRows=DATA_COLS.map(c=>({name:c.name,type:c.type}));
const idxColumns=[
  {title:'字段名称',key:'name'},
  {title:'字段类型',key:'type',width:120},
  {title:'是否参与检索',key:'search',width:160,render:(r:any)=>h(NSwitch,{value:idxSearch.value[r.name]!==false,size:'medium',onUpdateValue:(v:boolean)=>idxSearch.value[r.name]=v})},
  {title:'是否参与模型回复',key:'reply',width:180,render:(r:any)=>h(NSwitch,{value:idxReply.value[r.name]!==false,size:'medium',onUpdateValue:(v:boolean)=>idxReply.value[r.name]=v})}
];
function impNext(){if(impStep.value===1){if(!impDataset.value)return message.warning('请选择数据集');if(impSource.value==='file'&&!impSelFiles.value.length)return message.warning('请至少选择一个文件');if(impSource.value==='category'&&!impSelCats.value.length)return message.warning('请至少选择一个类目')}impStep.value++}
function impConfirm(){
  const files=impSource.value==='file'?impDs.value.files.filter(f=>impSelFiles.value.includes(f.name)):impDs.value.files.filter(f=>impSelCats.value.includes(f.cat));
  markImported(files.map(f=>f.name));
  const added=files.map(f=>({id:`doc-${Date.now().toString().slice(-5)}-${Math.random().toString(36).slice(2,5)}`,name:f.name,format:(f.name.split('.').pop()||'FILE').toUpperCase(),status:'索引构建中',size:'—',category:f.cat,indexed:'—',chunks:[] as never[]}));
  docs.value.unshift(...added);impOpen.value=false;
  message.success(`已导入 ${added.length} 个文件，索引构建中`);
  setTimeout(()=>{docs.value.forEach(d=>{if(added.some(a=>a.id===d.id)){d.status='索引构建完成';d.indexed=new Date().toLocaleString('zh-CN')}});message.success('索引构建完成')},8000)
}
function batchDel(){if(!selected.value.length)return;dialog.warning({title:'批量删除',content:`确定将选中的 ${selected.value.length} 个文档从当前知识库移除吗？文档仍会保留在所属数据集中。`,positiveText:'移除',negativeText:'取消',onPositiveClick:()=>{docs.value=docs.value.filter(x=>{if(selected.value.includes(x.id)){const cat=categories.value.find(c=>c.name===x.category);if(cat&&cat.count>0)cat.count--;return false}return true});message.success(`已移除 ${selected.value.length} 个文档，文档仍保留在数据集中`);selected.value=[]}})}
const columns=computed(()=>[...(batchMode.value?[{type:'selection' as const}]:[]),{title:'数据名称',key:'name',minWidth:240,render:(x:Doc)=>h('div',[h('b',x.name),h('div',{class:'subtle'},`文档 ID：${x.id}`)])},{title:'大小',key:'size',width:100},{key:'status',width:130,title:()=>h('span',{style:'display:inline-flex;align-items:center;gap:4px'},['状态',h(NTooltip,{width:250},{trigger:()=>h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor','stroke-width':2,'stroke-linecap':'round',style:'width:13px;height:13px;color:#94a3b8;cursor:help'},[h('circle',{cx:'12',cy:'12',r:'10'}),h('path',{d:'M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3'}),h('path',{d:'M12 17h.01'})]),default:()=>h('div',{style:'font-size:12px;line-height:1.8'},[h('b',{style:'display:block;margin-bottom:4px'},'知识库文档操作流与状态'),h('div','1 上传文件 → 2 解析文件 → 3 构建索引'),h('div',{style:'color:#94a3b8;margin-top:4px'},'状态：上传中 / 待解析 / 解析中 / 解析完成 / 解析失败 / 索引构建中 / 索引构建完成 / 索引构建失败')])})]),render:(x:Doc)=>h(NTag,{type:type(x.status),size:'small',bordered:false},{default:()=>x.status})},{title:'所属类目',key:'category',width:130,title:()=>h('span',{style:'display:inline-flex;align-items:center;gap:4px'},['所属类目',h(NTooltip,null,{trigger:()=>h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor','stroke-width':2,'stroke-linecap':'round',style:'width:13px;height:13px;color:#94a3b8;cursor:help'},[h('circle',{cx:'12',cy:'12',r:'10'}),h('path',{d:'M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3'}),h('path',{d:'M12 17h.01'})]),default:()=>'数据集的文件类目，文档在数据集中按该类目管理'})])},{title:'索引时间',key:'indexed',width:160},{title:'操作',key:'action',width:150,fixed:'right' as const,render:(x:Doc)=>h('div',{style:'display:flex;gap:16px;align-items:center'},[h(NButton,{text:true,type:'primary',onClick:()=>goChunks(x)},{default:()=>'查看切片'}),h(NButton,{text:true,type:'error',onClick:()=>delDoc(x)},{default:()=>'删除'})])}]);
function addCategory(){const name=`自定义类目 ${categories.value.length+1}`;categories.value.push({name,count:0});message.success(`已新增「${name}」`)} function addDoc(){if(!uploadName.value.trim())return message.warning('请填写文件名称');docs.value.unshift({id:`doc-${Date.now().toString().slice(-5)}`,name:uploadName.value.trim(),format:(uploadName.value.split('.').pop()||'FILE').toUpperCase(),status:'解析中',size:'—',category:uploadCategory.value,indexed:'—',chunks:[]});upload.value=false;uploadName.value='';message.success('已加入原型解析队列')}
 function delDoc(x:Doc){dialog.warning({title:'移出知识库',content:`确定将「${x.name}」从当前知识库移除吗？文档仍会保留在所属数据集中。`,positiveText:'移除',negativeText:'取消',onPositiveClick:()=>{const i=docs.value.indexOf(x);if(i>=0)docs.value.splice(i,1);const cat=categories.value.find(c=>c.name===x.category);if(cat&&cat.count>0)cat.count--;message.success('已从当前知识库移除，文档仍保留在数据集中')}})}
 const editOpen=ref(false),editName=ref(''),editDesc=ref('');
 function openEdit(){editName.value=name.value;editDesc.value=description.value;editOpen.value=true}
 function saveEdit(){if(!editName.value.trim())return message.warning('请输入知识库名称');if(!editDesc.value.trim())return message.warning('请输入知识库描述');router.replace({query:{...route.query,name:editName.value.trim(),description:editDesc.value.trim()}});editOpen.value=false;message.success('知识库已更新')}
</script>
<style scoped>.page{padding:24px;display:flex;flex-direction:column;gap:16px}header,.cardhead{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}.title{display:flex;gap:10px;align-items:center;margin:8px 0}.title h1,.card h2{margin:0}p,small,.subtle{color:var(--text-secondary);font-size:13px}header p,.cardhead p{margin:0 0 8px}.card{padding:16px 18px;background:#fff;border:1px solid var(--border-color);border-radius:12px}.filters{display:flex;gap:10px;margin-bottom:16px}.view-tabs{display:flex;gap:6px;background:#f1f5f9;border-radius:10px;padding:4px;width:fit-content}.vt{border:0;background:transparent;padding:7px 18px;border-radius:8px;font-size:13px;cursor:pointer;color:var(--text-secondary)}.vt.on{background:#fff;color:#2563eb;font-weight:600;box-shadow:0 1px 3px rgba(15,23,42,.08)}.ck-bar{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:6px}.ck-bar-left{display:flex;gap:10px}.ck-bar-right{display:flex;align-items:center;gap:14px}.ck-count{font-size:13px;color:var(--text-secondary)}.ck-list{border-top:1px solid var(--border-color)}.ck-item{position:relative;display:flex;gap:14px;padding:16px 4px;border-bottom:1px solid var(--border-color);transition:background .15s}.ck-item:hover{background:#f8fafc}.ck-actions{position:absolute;top:10px;right:0;display:none;align-items:center;gap:6px;z-index:2}.ck-item:hover .ck-actions{display:flex}.ck-d-top{display:flex;align-items:center;gap:10px}.ck-d-doc{display:flex;justify-content:space-between;align-items:center;margin:10px 0 4px;padding-bottom:12px;border-bottom:1px solid var(--border-color);font-size:13px;color:var(--text-primary)}.ck-d-name{display:inline-flex;align-items:center;gap:6px}.ck-d-name svg{width:13px;height:13px;flex:none}.ck-d-id{display:inline-flex;align-items:center;gap:4px;cursor:pointer;color:var(--text-secondary)}.ck-d-id:hover{color:#2563eb}.ck-d-id svg{width:12px;height:12px}.ck-d-form{margin-top:12px}.row-label{display:inline-flex;align-items:center}.req{color:#e02020;font-style:normal;margin:0 2px 0 3px}.type-tag{font-style:normal;font-size:11px;color:#8a94a6;background:#f1f5f9;border-radius:4px;padding:1px 6px;margin-left:6px}.ck-crumb{display:inline-flex;align-items:center;gap:8px;font-size:14px;font-weight:600}.ck-crumb svg{width:14px;height:14px}.ck-updated{font-size:12px;color:var(--text-secondary)}.ck-page{display:flex;justify-content:flex-end;margin-top:12px}.ok-dot{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;background:#ecfdf5;color:#059669;font-size:11px}.ck-num{color:#94a3b8;font-size:14px;font-weight:600;min-width:20px;padding-top:2px}.ck-body{flex:1;min-width:0}.ck-len{font-size:12px;color:#94a3b8}.ck-body h3{margin:6px 0 8px;font-size:14px;font-weight:600}.ck-body p{margin:0 0 10px;line-height:1.8;font-size:13px;color:var(--text-primary)}.ck-foot{display:flex;gap:16px;align-items:center}.ck-foot span{display:inline-flex;align-items:center;gap:4px;font-size:12px;color:var(--text-secondary)}.ck-foot svg{width:12px;height:12px;cursor:pointer}.ck-foot svg:hover{color:#2563eb}.chunk>div,.row{display:flex;justify-content:space-between;gap:8px;align-items:center}.chunk p{line-height:1.7;margin:8px 0}.row{padding:12px 0;border-bottom:1px solid var(--border-color)}.row small{display:block}@media(max-width:800px){.page{padding:16px}header,.cardhead{flex-direction:column}.stats{grid-template-columns:repeat(2,1fr)}.filters{flex-wrap:wrap}}</style>
<style scoped>
/* ===== 导入数据向导（与创建知识库弹窗同一套样式） ===== */
.kb-modal{max-height:86vh;display:flex;flex-direction:column}.kb-modal :deep(.n-card__content){padding-top:10px;padding-bottom:32px;flex:1 1 0;min-height:0;overflow-y:auto}
.kb-steps{display:flex;align-items:center;justify-content:center;gap:14px;margin:8px 0 34px}.kb-step{display:flex;align-items:center;gap:10px;font-size:14px;color:var(--text-secondary)}.kb-step b{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:#f3f4f6;color:#9ca3af;font-size:13px;font-style:normal;font-weight:600;transition:background .2s,color .2s}.kb-step.active{color:#2563eb;font-weight:600}.kb-step.active b{background:#2563eb;color:#fff;box-shadow:0 0 0 4px #eff6ff}.kb-step.done{color:var(--text-primary)}.kb-step.done b{background:#eff6ff;color:#2563eb}.kb-line{width:96px;height:2px;border-radius:1px;background:#e5e7eb}.kb-line.on{background:#2563eb}
.kb-section{margin-top:26px}.kb-section-label{margin:0 0 12px;font-size:13px;font-weight:500;color:#374151}.kb-mt{margin-top:26px}.kb-req{color:#e5484d;font-style:normal;margin-right:4px}
.kb-ds-head{display:flex;align-items:center;justify-content:space-between}.kb-ds-link{font-size:13px;color:#2563eb;cursor:pointer}.kb-ds-link:hover{text-decoration:underline}.kb-ds-tip{margin:0 0 10px;font-size:12.5px;color:var(--text-secondary)}.kb-ds-row{display:flex;align-items:center;gap:10px}.kb-ds-row .n-select{flex:1}
.kb-src{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
.kb-type{display:flex;flex-direction:column;background:#fff;padding:14px 16px;border:1px solid #e5e7eb;border-radius:10px;cursor:pointer;transition:border-color .2s,box-shadow .2s}.kb-type:hover{border-color:#93c5fd}.kb-type.on{border-color:#2563eb;box-shadow:0 1px 4px rgba(37,99,235,.12)}.kb-type-head{display:flex;align-items:center;gap:10px;margin-bottom:8px}.kb-type strong{font-size:14px}.kb-type small{flex:1;display:block;font-size:12.5px;line-height:1.65;color:var(--text-secondary)}.kb-type-radio{margin-left:auto;width:16px;height:16px;border-radius:50%;border:1.5px solid #d1d5db;position:relative;flex:none;background:#fff}.kb-type.on .kb-type-radio{border-color:#2563eb}.kb-type.on .kb-type-radio::after{content:'';position:absolute;inset:2.5px;border-radius:50%;background:#2563eb}
.kb-pick{display:flex;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden}.kb-pick-cats{width:180px;flex:none;background:#fafafa;border-right:1px solid #e5e7eb;padding:12px}.kb-pick-title{font-size:13px;font-weight:600;margin-bottom:8px}.kb-pick-title em{font-style:normal;font-weight:400;font-size:12px;color:#9ca3af}.kb-cat-item{display:flex;align-items:center;padding:8px 10px;border-radius:6px;font-size:13px;cursor:pointer;color:#374151;transition:background .15s}.kb-cat-item:hover{background:#f3f4f6}.kb-cat-item.active{background:#eff6ff;color:#2563eb;font-weight:500}.kb-cat-name{margin-left:8px}.kb-pick-files{flex:1;min-width:0;padding:12px 14px}.kb-pick-toolbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}.kb-pick-head{font-size:13px}.kb-pick-count{font-size:12px;color:#9ca3af}.kb-pick-actions{display:inline-flex;align-items:center;gap:14px}
.kb-sync-row{display:flex;align-items:center;gap:8px;margin-top:4px}.kb-sync-label{font-size:13px;font-weight:500;color:#374151}.kb-sync-tip{margin:8px 0 12px;font-size:12px;color:#9ca3af}
.kb-q{width:14px;height:14px;border-radius:50%;border:1px solid #d1d5db;color:#9ca3af;font-size:10px;font-style:normal;display:inline-grid;place-items:center;margin-left:2px;cursor:help}
.kb-sel-cats{margin-top:14px}.kb-sel-cats-label{margin:0 0 8px;font-size:13px;font-weight:500;color:#374151}.kb-sel-empty{font-size:12px;color:#9ca3af}
.kb-chunk-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.kb-chunk-grid .kb-type small{font-size:12px;line-height:1.6;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.kb-chunk-panel{margin-top:14px;background:#f7f8fa;border-radius:10px;padding:18px 20px;display:flex;flex-direction:column;gap:18px}.kb-slider-label{margin:0 0 8px;font-size:13px;font-weight:500;color:#374151;display:flex;align-items:center;gap:4px}.kb-slider-row{display:flex;align-items:center;gap:16px}.kb-slider-row .n-slider{flex:1}.kb-slider-bounds{display:flex;justify-content:space-between;font-size:12px;color:#9ca3af;margin-top:4px;max-width:calc(100% - 136px)}
.kb-switch-row{display:flex;align-items:center;gap:10px;margin-top:22px;font-size:13.5px;color:#374151}.kb-tip{margin:0;font-size:12px;line-height:1.8;color:#374151}
</style>
