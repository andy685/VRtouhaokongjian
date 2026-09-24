<template>
  <main class="page">
    <template v-if="view==='list'">
      <header><div><h1>数据集管理</h1><p>资料文件先进入数据集，再由知识库引用；支持文件与表格两种数据集类型。</p></div><n-space :size="10"><n-button @click="message.info('数据集列表已刷新')">刷新</n-button><n-button type="primary" @click="showCreate=true">新建数据集</n-button></n-space></header>
      <n-alert type="info" :show-icon="true">文件类型按类目管理文档资料；表格类型在“数据表管理”中创建数据表并导入数据。</n-alert>
      <div class="guide"><div><b>1</b><strong>创建数据集</strong><span>建立资料容器</span></div><div><b>2</b><strong>上传资料</strong><span>集中管理文件与解析状态</span></div><div><b>3</b><strong>知识库引用</strong><span>选择数据集中的资料构建知识库</span></div></div>
      <div class="filter"><n-select v-model:value="typeFilter" :options="typeOptions" style="width:160px" /><n-input v-model:value="keyword" placeholder="搜索数据集名称" clearable style="width:280px" /></div>
      <div class="grid"><article v-for="item in filtered" :key="item.id" class="card"><div class="card-top"><n-tag :type="item.type==='table'?'success':'info'" :bordered="false">{{ typeLabels[item.type] }}</n-tag><n-button text type="primary" @click="open(item)">管理</n-button></div><h2>{{ item.name }}</h2><p>数据集 ID：{{ item.id }}</p><p>创建时间：{{ item.createdAt }}</p><div class="tags"><n-tag size="small" :bordered="false">平台托管</n-tag><n-tag size="small" :bordered="false">{{ item.type==='table'?`${item.categories.length} 个数据表`:`${item.files.length} 个文件` }}</n-tag></div></article></div>
    </template>
    <template v-else-if="active">
      <header class="detail-header">
        <div class="detail-title">
          <n-button quaternary circle @click="back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </n-button>
          <span class="ds-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg></span>
          <h1>{{ active.name }}</h1>
        </div>
        <div class="detail-actions"><n-button type="primary" @click="openEdit">编辑</n-button></div>
      </header>
      <section class="info-card">
        <div class="info-grid">
          <div><label>数据集类型</label><p>{{ typeLabels[active.type] }}</p></div>
          <div><label>业务空间存储配额</label><p>已使用 0%</p></div>
          <div><label>创建时间</label><p>{{ active.createdAt }}</p></div>
          <div><label>数据集 ID</label><p class="id-line"><span class="id-text">{{ active.id }}</span><svg class="mini-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" @click="copyId"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></p></div>
          <div><label>描述</label><p>{{ active.description || '—' }}</p></div>
        </div>
      </section>
      <section class="detail-body">
          <aside class="cat-panel">
            <template v-if="active.type!=='table'">
              <div class="cat-head"><span>类目 <em>({{ activeCats.length }}/2000)</em></span><span class="cat-tools"><svg class="mini-icon" :class="{on:catSearching}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" @click="catSearching=!catSearching"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg><svg class="mini-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" @click="openNewCat"><path d="M12 5v14M5 12h14"/></svg></span></div>
              <n-input v-if="catSearching" v-model:value="catKeyword" placeholder="搜索类目" size="small" clearable style="margin-top:10px" />
              <div v-for="c in catList" :key="c" class="cat-item" :class="{active:c===activeCat}" @click="activeCat=c">{{ c }}</div>
              <p v-if="!catList.length" class="cat-empty">未找到匹配类目</p>
            </template>
            <template v-else>
              <div class="cat-head"><span>数据表管理 <em>({{ activeCats.length }}/10000)</em></span><span class="cat-tools"><svg class="mini-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" @click="openNewTable"><path d="M12 5v14M5 12h14"/></svg></span></div>
              <div v-for="c in catList" :key="c" class="cat-item" :class="{active:c===activeCat}" @click="activeCat=c">{{ c }}</div>
              <p v-if="!catList.length" class="cat-empty">暂无数据</p>
            </template>
          </aside>
          <div class="file-panel">
            <template v-if="active.type!=='table'">
              <div class="file-head"><strong>{{ active.name }}</strong><span class="file-count">{{ active.files.length }} 文件数</span></div>
              <div class="file-toolbar">
                <n-input v-model:value="fileKeyword" placeholder="支持模糊搜索" clearable size="small" style="width:200px" />
                <n-space :size="8"><n-button size="small" type="primary" @click="openFileImport">+ 导入数据</n-button></n-space>
              </div>
              <n-data-table :columns="fileColumns" :data="fileRows" :bordered="false" size="small" />
            </template>
            <template v-else>
              <div class="tbl-toolbar">
                <span class="tbl-meta">
                  <svg class="tbl-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>数据：{{ gridRows.length }}
                  <n-tooltip trigger="hover"><template #trigger><span class="tbl-info"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/></svg>描述</span></template>{{ active.schemas[activeCat]?.desc||'—' }}</n-tooltip>
                  <n-tooltip trigger="hover"><template #trigger><span class="tbl-info" @click="copyTableId"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 15a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4"/><circle cx="12" cy="8" r="1.6"/></svg>ID</span></template><span class="tbl-id-tip">{{ active.schemas[activeCat]?.id||'—' }} <svg v-if="active.schemas[activeCat]?.id" class="mini-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" @click.stop="copyTableId"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></span></n-tooltip>
                  <n-tag :type="tblStatus==='导入成功'?'success':'warning'" size="small" :bordered="false">✓ {{ tblStatus }}</n-tag>
                </span>
                <n-space :size="8">
                  <n-button circle size="small" @click="refreshTables"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/></svg></n-button>
                  <n-button circle size="small" @click="downloadTable"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg></n-button>
                  <n-button size="small" @click="openSchema">表结构</n-button>
                  <n-button size="small" type="primary" @click="openImport">导入数据</n-button>
                </n-space>
              </div>
              <div v-if="!gridColumns.length" class="tbl-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5"/><path d="M12 13v9"/></svg><p>暂无数据</p></div>
              <n-data-table v-else :columns="gridColumns" :data="gridRows" :bordered="false" size="small" class="grid-table" />
            </template>
          </div>
        </section>
    </template>
    <n-modal v-model:show="showCreate" preset="card" title="新建数据集" style="width:680px">
      <n-form label-placement="top">
        <n-form-item label="数据集名称" required><n-input v-model:value="newName" maxlength="20" show-count placeholder="请输入名称" /></n-form-item>
        <n-form-item label="描述" required><n-input v-model:value="newDescription" type="textarea" maxlength="200" show-count placeholder="请输入描述，说明资料将用于哪些店招回答" /></n-form-item>
        <n-form-item label="数据集类型" required><n-radio-group v-model:value="dataType" class="type-cards"><n-radio value="file"><strong>文件</strong><small>文档、PDF、Word、PPT 等运营资料</small></n-radio><n-radio value="table"><strong>表格</strong><small>上传 Excel、CSV 等表格文件</small></n-radio></n-radio-group></n-form-item>
      </n-form>
      <template #footer><n-space justify="end"><n-button @click="showCreate=false">取消</n-button><n-button type="primary" @click="create">创建</n-button></n-space></template>
    </n-modal>
    <n-modal v-model:show="showEdit" preset="card" title="编辑数据集" style="width:560px">
      <n-form label-placement="top">
        <n-form-item label="数据集名称" required><n-input v-model:value="editName" maxlength="20" show-count placeholder="请输入名称" /></n-form-item>
        <n-form-item label="描述" required><n-input v-model:value="editDescription" type="textarea" maxlength="200" show-count placeholder="请输入描述" /></n-form-item>
      </n-form>
      <template #footer><n-space justify="end"><n-button @click="showEdit=false">取消</n-button><n-button type="primary" @click="saveEdit">保存</n-button></n-space></template>
    </n-modal>
    <n-modal v-model:show="showFileDetail" preset="card" style="width:960px">
      <template #header><span class="doc-title">{{ docTitle }}</span><n-tag v-if="detailFile&&hasExt" size="small" :bordered="false">{{ fileExt }}</n-tag></template>
      <div class="doc-toolbar"><span class="doc-hint">(注意 最多只有10000个字符)</span><n-button text type="primary" @click="downloadFile">下载原文</n-button></div>
      <div class="doc-body">{{ docContent }}</div>
    </n-modal>
    <n-modal v-model:show="showFileImport" preset="card" style="width:620px">
      <template #header><div class="nt-head"><svg class="nt-back" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" @click="showFileImport=false"><path d="M15 18l-6-6 6-6"/></svg>导入文件数据</div></template>
      <n-form label-placement="top">
        <n-form-item label="导入类目">
          <n-select v-model:value="impCat" :options="impCatOptions" placeholder="请选择类目" :disabled="impLocked" @update:value="impLocked=true">
            <template #action><div style="text-align:center;padding:4px 0">
              <a v-if="!impNewCat" class="kb-ds-link" @click="impNewCat=true;impNewCatName=''">+ 新增类目</a>
              <div v-else style="display:flex;align-items:center;gap:10px;padding:0 12px">
                <n-input v-model:value="impNewCatName" size="small" placeholder="请输入类目名称" @keyup.enter="addImpCat" />
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#18a058" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="cursor:pointer;flex:none" @click="addImpCat"><path d="M4 12.5l5 5L20 6.5"/></svg>
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#e5484d" stroke-width="2.5" stroke-linecap="round" style="cursor:pointer;flex:none" @click="impNewCat=false;impNewCatName=''"><path d="M5 5l14 14M19 5L5 19"/></svg>
              </div>
            </div></template>
          </n-select>
        </n-form-item>
      </n-form>
      <n-upload v-model:file-list="fileImportList" :accept="uploadAccept" :max-size="50" multiple>
        <n-upload-dragger><p class="upload-hint">点击或拖拽上传文档</p><p class="upload-sub">支持图片、视频、音频等多种文档格式，<n-popover trigger="hover" placement="top" :width="330" class="fmt-pop"><template #trigger><a style="color:#2563eb;cursor:pointer">查看格式要求</a></template><div class="fmt-req"><p>单图片：大小≤20MB，最短边 &gt; 15px，长边 &lt; 8192px，长宽比 &lt; 50，格式支持.png,.jpg,.jpeg,.bmp,.gif等</p><p>表格：建议10MB以内，10万行以内，格式支持xls、.xlsx</p><p>单文档：大小≤150MB或1000页，格式支持.doc,.docx,.ppt,.pptx,.pdf</p><p>纯文本：建议不要超过10MB，格式支持.md,.txt,.html</p><p>单音频：大小≤2GB，格式支持.aac,.amr,.flac,.flv,.m4a,.mp3,.mpeg,.ogg,.opus,.wav,.webm,.wma</p><p>单视频：大小≤2GB，格式支持.mp4,.mkv,.avi,.mov,.wmv</p><p>最多支持{{ fileImportList.length }}/50个</p></div></n-popover></p></n-upload-dragger>
      </n-upload>
      <template #footer><n-space justify="start"><n-button type="primary" @click="confirmFileImport">确认</n-button><n-button @click="showFileImport=false">取消</n-button></n-space></template>
    </n-modal>
    <n-modal v-model:show="showImport" preset="card" style="width:720px">
      <template #header><div class="nt-head"><svg class="nt-back" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" @click="showImport=false"><path d="M15 18l-6-6 6-6"/></svg>导入表格数据</div></template>
      <n-form label-placement="top">
        <n-form-item label="导入数据表"><span class="nt-table-name">{{ activeCat }}</span></n-form-item>
        <n-form-item label="导入类型" required><n-radio-group v-model:value="importMode"><n-radio value="cover">覆盖上传</n-radio><n-radio value="append">增量上传</n-radio></n-radio-group></n-form-item>
        <n-form-item label="导入 Excel" required>
          <n-upload v-model:file-list="importFileList" accept=".xlsx,.xls" :max-size="10" :default-upload="false" :max="1" style="width:100%">
            <n-upload-dragger><p class="upload-hint">点击或拖拽上传文档</p><p class="upload-sub">支持 .xlsx、.xls 等格式 · 单文档最大限制10MB</p></n-upload-dragger>
          </n-upload>
        </n-form-item>
      </n-form>
      <div v-if="schemaCols.length" class="tpl-panel">
        <div class="tpl-head"><span class="tpl-title">模板表结构预览（仅展示表头）：</span><n-button text type="primary" size="tiny" @click="downloadTable"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>下载模板</n-button></div>
        <n-data-table :columns="tplColumns" :data="tplRows" size="small" :single-line="false" class="tpl-table" />
      </div>
      <template #footer><n-space justify="start"><n-button type="primary" @click="confirmImport">确认</n-button><n-button @click="showImport=false">取消</n-button></n-space></template>
    </n-modal>
    <n-modal v-model:show="showNewTable" preset="card" style="width:720px">
      <template #header><div class="nt-head"><svg class="nt-back" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" @click="showNewTable=false"><path d="M15 18l-6-6 6-6"/></svg>新增数据表</div></template>
      <n-form label-placement="top">
        <n-form-item label="数据表名称" required><n-input v-model:value="newTableName" maxlength="64" show-count placeholder="请输入名称" /></n-form-item>
        <n-form-item label="描述"><n-input v-model:value="newTableDesc" type="textarea" maxlength="200" show-count placeholder="请输入描述" /></n-form-item>
        <n-form-item label="数据表类型" required>
          <div class="nt-type-card" :class="{on:newTableType==='local'}" @click="newTableType='local'">
            <span class="nt-type-icon"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16"/></svg></span>
            <div class="nt-type-txt"><strong>本地数据表</strong><small>支持用户上传本地文件至平台，数据存储在平台共享区域</small></div>
            <i class="nt-type-dot"></i>
          </div>
        </n-form-item>
        <n-form-item label="配置数据表" required>
          <n-radio-group v-model:value="tableCfg"><n-radio value="excel">直接上传Excel</n-radio><n-radio value="custom">自定义表头</n-radio></n-radio-group>
        </n-form-item>
        <n-form-item v-if="tableCfg==='excel'" label="导入数据" required>
          <div class="nt-upload">
            <p class="nt-hint">默认通过第一行数据识别表结构 <n-button v-if="parsedPreview.length" text type="primary" size="tiny" @click="previewVisible=!previewVisible">{{ previewVisible?'收起结构':'查看结构' }}</n-button></p>
            <n-upload v-model:file-list="tableFileList" accept=".xlsx,.xls" :max-size="10" :default-upload="false" :max="1">
              <n-upload-dragger><p class="upload-hint">点击或拖拽上传文档</p><p class="upload-sub">上传一份.xlsx、.xls格式的文档，文件大小限10MB以内。</p></n-upload-dragger>
            </n-upload>
            <template v-if="parsedPreview.length&&previewVisible">
              <p class="nt-schema-title">表结构预览</p>
              <p class="nt-hint">手动输入数据表结构，新上传文件的表头要和表结构对齐</p>
              <n-data-table :columns="previewColumns" :data="parsedPreview" :bordered="false" size="small" :pagination="{pageSize:5}" />
            </template>
          </div>
        </n-form-item>
        <n-form-item v-else label="表结构" required>
          <div class="nt-cols">
            <p class="nt-hint">手动输入数据表结构，新上传文件的表头要和表结构对齐</p>
            <n-data-table :columns="customColumns" :data="newCols" size="small" class="nt-cols-table" />
            <n-button text type="primary" size="small" :disabled="newCols.length>=100" @click="addField">+ 添加字段（{{ newCols.length }}/100）</n-button>
          </div>
        </n-form-item>
      </n-form>
      <template #footer><n-space justify="end"><n-button @click="showNewTable=false">取消</n-button><n-button type="primary" @click="createTable">创建</n-button></n-space></template>
    </n-modal>
    <n-modal v-model:show="showSchema" preset="card" title="表结构" style="width:760px">
      <n-data-table :columns="schemaColumns" :data="schemaCols" :bordered="false" size="small" :pagination="{pageSize:10}" />
      <template #footer><n-space justify="end"><n-button @click="showSchema=false">关闭</n-button></n-space></template>
    </n-modal>
    <n-modal v-model:show="showNewCat" preset="card" title="新建类目" style="width:420px">
      <n-form label-placement="top">
        <n-form-item label="类目名称" required><n-input v-model:value="newCatName" maxlength="30" show-count placeholder="请输入类目名称" @keyup.enter="createCat" /></n-form-item>
      </n-form>
      <template #footer><n-space justify="end"><n-button @click="showNewCat=false">取消</n-button><n-button type="primary" @click="createCat">确定</n-button></n-space></template>
    </n-modal>
    <n-modal v-model:show="showSuccess" :mask-closable="false">
      <div class="success-card">
        <div class="success-head"><svg class="success-icon" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#18a058" stroke-width="2"/><path d="M8 12.5l2.6 2.6L16 9.5" stroke="#18a058" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><strong>数据集创建成功</strong></div>
        <p class="success-sub">是否立即开始导入数据</p>
        <div class="success-actions"><n-button @click="skipImport">暂不导入</n-button><n-button type="primary" @click="importNow">立即导入</n-button></div>
      </div>
    </n-modal>
  </main>
</template>
<script setup lang="ts">
import { computed,h,ref,watch } from 'vue'; import { useRouter } from 'vue-router'; import { NButton,NInput,NSelect,NSpin,NTag,useDialog,useMessage } from 'naive-ui'; import type { UploadFileInfo } from 'naive-ui'; import * as XLSX from 'xlsx'
type FileItem={name:string;size:string;status:string;parse:string;source:string;updatedAt:string;cat:string;content:string};type TableCol={name:string;desc:string;type:string};type TableSchema={id:string;desc:string;columns:TableCol[];rows:string[][]};type DatasetType='file'|'table';type Dataset={id:string;name:string;description:string;createdAt:string;type:DatasetType;tags:string[];categories:string[];schemas:Record<string,TableSchema>;files:FileItem[]}
const message=useMessage(),dialog=useDialog(),router=useRouter(),keyword=ref(''),typeFilter=ref<'all'|DatasetType>('all'),view=ref<'list'|'detail'>('list'),showCreate=ref(false),showSuccess=ref(false),lastCreated=ref<Dataset|null>(null),newName=ref(''),newDescription=ref(''),dataType=ref<DatasetType>('file'),fileList=ref<UploadFileInfo[]>([]),newTags=ref<string[]>([]),fileKeyword=ref(''),active=ref<Dataset|null>(null),catSearching=ref(false),catKeyword=ref(''),activeCat=ref('默认类目'),showNewCat=ref(false),newCatName=ref(''),showFileDetail=ref(false),detailFile=ref<FileItem|null>(null),showEdit=ref(false),editName=ref(''),editDescription=ref(''),showNewTable=ref(false),newTableName=ref(''),newTableDesc=ref(''),tableCfg=ref<'excel'|'custom'>('excel'),tableFileList=ref<UploadFileInfo[]>([]),newCols=ref<TableCol[]>([]),showSchema=ref(false),parsedPreview=ref<TableCol[]>([]),parsedRows=ref<string[][]>([]),parsedHeads=ref<string[]>([]),previewVisible=ref(false),showImport=ref(false),importMode=ref<'cover'|'append'>('cover'),importFileList=ref<UploadFileInfo[]>([]),sets=ref<Dataset[]>([{id:'ds-brand-files',name:'品牌服务资料集',description:'品牌介绍、会员规则等店招回答资料',createdAt:'2026-09-22 17:30',type:'file',tags:['品牌'],categories:['默认类目'],schemas:{},files:[{name:'品牌介绍与 VR 项目说明.docx',size:'128 KB',status:'解析完成',parse:'智能解析',source:'本地上传',updatedAt:'2026-09-22 17:48',cat:'默认类目',content:'# 品牌介绍与 VR 项目说明\n\n## 品牌总览\n\n- 品牌：头号空间 VR 点播体验\n- 核心业务：VR 游戏、VR 短剧、VR 大空间等沉浸式内容\n- 门店定位：面向年轻客群与亲子家庭的一站式 VR 体验空间\n\n## 店招回答使用范围\n\n本资料供店招 AI 回答顾客咨询使用，内容需保持更新，涉及价格与活动以最新版本为准。'},{name:'会员充值与退卡规则.pdf',size:'328 KB',status:'解析完成',parse:'智能解析',source:'本地上传',updatedAt:'2026-09-22 17:45',cat:'默认类目',content:'# 会员充值与退卡规则\n\n## 充值规则\n\n- 充值 500 元赠送 50 元\n- 充值 1000 元赠送 150 元\n- 次卡自购买日起 180 天内有效\n\n## 退卡规则\n\n- 未开封次卡支持 7 天无理由退款\n- 已开封次卡按剩余次数折算退回\n- 退款 3 个工作日内原路退回'},{name:'VR 项目设备清单.md',size:'42 KB',status:'解析中',parse:'智能解析',source:'本地上传',updatedAt:'2026-09-22 18:15',cat:'默认类目',content:'（文件解析中，暂无可预览内容）'},{name:'门店运营手册.docx',size:'1.6 MB',status:'上传中',parse:'智能解析',source:'本地上传',updatedAt:'2026-09-22 18:24',cat:'默认类目',content:''},{name:'损坏的扫描件资料.pdf',size:'5.2 MB',status:'失败',parse:'智能解析',source:'本地上传',updatedAt:'2026-09-21 11:20',cat:'默认类目',content:''}]},{id:'ds-campaign-files',name:'活动营销资料集',description:'节假日活动与营销话术资料',createdAt:'2026-09-21 10:10',type:'file',tags:['活动'],categories:['默认类目'],schemas:{},files:[{name:'国庆主题活动说明.pptx',size:'2.4 MB',status:'解析中',parse:'智能解析',source:'本地上传',updatedAt:'2026-09-22 18:10',cat:'默认类目',content:'# 国庆主题活动说明\n\n- 活动时间：10 月 1 日至 10 月 7 日\n- 活动内容：全场 VR 体验 8 折，充值满赠翻倍\n- 话术要点：向顾客主动介绍国庆限时优惠，引导充值\n\n（文件解析中，以上为解析预览）'},{name:'中秋活动旧版说明.pdf',size:'96 KB',status:'失败',parse:'智能解析',source:'本地上传',updatedAt:'2026-09-21 15:40',cat:'默认类目',content:''},{name:'门店巡检话术清单.docx',size:'64 KB',status:'上传中',parse:'智能解析',source:'本地上传',updatedAt:'2026-09-22 18:26',cat:'默认类目',content:''},{name:'活动执行SOP手册.docx',size:'210 KB',status:'解析完成',parse:'智能解析',source:'本地上传',updatedAt:'2026-09-20 09:30',cat:'默认类目',content:'# 活动执行 SOP 手册\n\n- 活动前 3 天：物料布置、店员培训\n- 活动中：每小时播报优惠信息\n- 活动后：统计体验人数并回收物料'}]},{id:'ds-store-table',name:'门店经营数据集',description:'门店经营与会员流水表格数据',createdAt:'2026-09-20 14:05',type:'table',tags:['经营'],categories:['各门店月度营收明细','会员充值流水汇总'],schemas:{'各门店月度营收明细':{id:'table_f91bdc94db0948a792a01',desc:'各门店月度营收与体验人次统计',columns:[{name:'门店名称',desc:'',type:'string'},{name:'月份',desc:'',type:'string'},{name:'体验人次',desc:'',type:'number'},{name:'营收（元）',desc:'',type:'number'}],rows:[['头号空间·旗舰店','2026-08','1280','156000'],['头号空间·高新店','2026-08','960','118000'],['头号空间·万象城店','2026-08','1450','182300']]},'会员充值流水汇总':{id:'table_f91bdc94db0948a792a02',desc:'会员充值流水明细汇总',columns:[{name:'流水号',desc:'',type:'string'},{name:'门店',desc:'',type:'string'},{name:'会员',desc:'',type:'string'},{name:'金额（元）',desc:'',type:'number'},{name:'充值时间',desc:'',type:'string'}],rows:[['R20260922001','旗舰店','张先生','1000','2026-09-22 14:32'],['R20260922002','高新店','李女士','500','2026-09-22 15:08']]}},files:[{name:'各门店月度营收明细.xlsx',size:'856 KB',status:'解析完成',parse:'智能解析',source:'本地上传',updatedAt:'2026-09-22 16:20',cat:'各门店月度营收明细',content:''},{name:'会员充值流水汇总.csv',size:'1.2 MB',status:'解析完成',parse:'智能解析',source:'本地上传',updatedAt:'2026-09-22 16:35',cat:'会员充值流水汇总',content:''},{name:'月度营收汇总_错误格式.csv',size:'38 KB',status:'失败',parse:'智能解析',source:'本地上传',updatedAt:'2026-09-21 14:02',cat:'各门店月度营收明细',content:''},{name:'会员流水导入中.csv',size:'640 KB',status:'解析中',parse:'智能解析',source:'本地上传',updatedAt:'2026-09-22 18:20',cat:'会员充值流水汇总',content:'（文件解析中，暂无可预览内容）'},{name:'待同步营收表.xlsx',size:'72 KB',status:'上传中',parse:'智能解析',source:'本地上传',updatedAt:'2026-09-22 18:28',cat:'各门店月度营收明细',content:''}]}]);
const showFileImport=ref(false),fileImportList=ref<UploadFileInfo[]>([]),impCat=ref('默认类目'),impNewCat=ref(false),impNewCatName=ref(''),impLocked=ref(true),newTableType=ref<'local'>('local');
const impCatOptions=computed(()=>activeCats.value.map(c=>({label:c,value:c})));
function addImpCat(){const n=impNewCatName.value.trim();if(!n)return message.warning('请输入类目名称');if(active.value&&!active.value.categories.includes(n))active.value.categories.push(n);impCat.value=n;impNewCat.value=false;impNewCatName.value='';message.success(`类目「${n}」已创建`)}
const typeLabels:Record<DatasetType,string>={file:'文件',table:'表格'};
// 百炼文档状态枚举：上传中 / 解析中 / 解析完成 / 失败
const statusTypes:Record<string,'success'|'warning'|'info'|'error'>={导入成功:'info',解析完成:'success',解析中:'warning',上传中:'info',失败:'error'};
const typeOptions=[{label:'全部类型',value:'all'},{label:'文件',value:'file'},{label:'表格',value:'table'}];
const uploadAccept=computed(()=>dataType.value==='table'?'.xlsx,.xls,.csv':'.pdf,.doc,.docx,.ppt,.pptx,.txt,.md');
const uploadHint=computed(()=>dataType.value==='table'?'支持 Excel、CSV，单文件不超过 50MB':'支持 PDF、Word、PPT、TXT、Markdown，单文件不超过 50MB');
const filtered=computed(()=>sets.value.filter(x=>x.name.includes(keyword.value)&&(typeFilter.value==='all'||x.type===typeFilter.value)));
const fileRows=computed(()=>{const kw=fileKeyword.value.trim();return (active.value?.files||[]).filter(x=>x.cat===activeCat.value&&(!kw||x.name.includes(kw)))});
const fileColumns=[
  {title:'文件名称',key:'name',minWidth:220},
  {title:'文件大小',key:'size',width:100},
  {title:'状态',key:'status',width:110,render:(x:FileItem)=>h(NTag,{type:statusTypes[x.status]||'default',size:'small',bordered:false},{...(x.status==='解析中'||x.status==='上传中'?{icon:()=>h(NSpin,{size:11,style:'margin-right:4px'})}:{}),default:()=>x.status})},
  {title:'上传时间',key:'updatedAt',width:170},
  {title:'操作',key:'op',width:130,render:(x:FileItem)=>h('div',{style:'display:flex;align-items:center;justify-content:center;gap:28px'},[h(NButton,{text:true,type:'primary',size:'small',onClick:()=>showDetail(x)},{default:()=>'详情'}),h(NButton,{text:true,type:'error',size:'small',onClick:()=>delFile(x)},{default:()=>'删除'})])}
];
const activeCats=computed(()=>active.value?.categories||[]);
const catList=computed(()=>{const kw=catKeyword.value.trim();return kw?activeCats.value.filter(c=>c.includes(kw)):activeCats.value});
function open(item:Dataset){active.value=item;fileKeyword.value='';catKeyword.value='';catSearching.value=false;activeCat.value=item.categories[0]||'默认类目';view.value='detail'}
function back(){view.value='list';active.value=null}
function copyId(){if(!active.value)return;navigator.clipboard?.writeText(active.value.id).then(()=>message.success('数据集 ID 已复制')).catch(()=>message.info(`数据集 ID：${active.value!.id}`))}
function openEdit(){if(!active.value)return;editName.value=active.value.name;editDescription.value=active.value.description;showEdit.value=true}
function saveEdit(){if(!active.value)return;if(!editName.value.trim()||!editDescription.value.trim())return message.warning('请填写数据集名称和描述');active.value.name=editName.value.trim();active.value.description=editDescription.value.trim();showEdit.value=false;message.success('数据集已更新')}
function fmtSize(bytes?:number){if(!bytes)return '—';return bytes>=1024*1024?`${(bytes/1024/1024).toFixed(1)} MB`:`${Math.max(1,Math.round(bytes/1024))} KB`}
function resetCreate(){newName.value='';newDescription.value='';dataType.value='file';fileList.value=[];newTags.value=[]}
function create(){if(!newName.value.trim()||!newDescription.value.trim())return message.warning('请填写数据集名称和描述');const now=new Date().toLocaleString('zh-CN');const ds:Dataset={id:`ds-${Date.now().toString(36)}`,name:newName.value.trim(),description:newDescription.value.trim(),createdAt:now,type:dataType.value,tags:[...newTags.value],categories:dataType.value==='table'?[]:['默认类目'],schemas:{},files:fileList.value.filter(x=>x.file).map((x)=>({name:x.name,size:fmtSize(x.file!.size),status:'解析中',parse:'智能解析',source:'本地上传',updatedAt:now,cat:'默认类目',content:''}))};sets.value.unshift(ds);lastCreated.value=ds;resetCreate();showCreate.value=false;showSuccess.value=true}
function importNow(){if(!lastCreated.value)return;open(lastCreated.value);showSuccess.value=false;if(lastCreated.value.type==='file'){fileImportList.value=[];showFileImport.value=true;message.success('请选择要导入的文档')}else{openNewTable();message.success('请新建数据表并导入数据')}}
function skipImport(){router.push('/platform/ai-shop-sign/datasets');view.value='list';showSuccess.value=false;message.success('数据集已创建，可稍后在列表中导入数据')}
function delFile(x:FileItem){dialog.warning({title:'删除文件',content:`确定删除「${x.name}」吗？删除后不可恢复。`,positiveText:'删除',negativeText:'取消',onPositiveClick:()=>{const i=active.value?.files.indexOf(x)??-1;if(i>=0)active.value!.files.splice(i,1);message.success('文件已删除')}})}
function showDetail(x:FileItem){detailFile.value=x;showFileDetail.value=true}
function refreshTables(){message.success('数据已刷新')}
function downloadTable(){if(!active.value)return;const s=active.value.schemas?.[activeCat.value];if(!s||!s.columns.length)return message.warning('当前数据表暂无数据可下载');const esc=(v:string)=>`"${String(v??'').replace(/"/g,'""')}"`;const csv=[s.columns.map(c=>esc(c.name)).join(','),...s.rows.map(r=>s.columns.map((_,i)=>esc(r[i]??'')).join(','))].join('\r\n');const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`${activeCat.value}.csv`;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(a.href);message.success(`已下载「${activeCat.value}」`)}
function openNewCat(){newCatName.value='';showNewCat.value=true}
function createCat(){const n=newCatName.value.trim();if(!n)return message.warning('请输入类目名称');if(!active.value)return;if(active.value.categories.includes(n))return message.warning('该类目已存在');if(active.value.categories.length>=2000)return message.warning('类目数量已达上限（2000）');active.value.categories.push(n);activeCat.value=n;showNewCat.value=false;message.success('类目已创建')}
function openFileImport(){fileImportList.value=[];impCat.value=active.value?.categories[0]||'默认类目';impNewCat.value=false;impNewCatName.value='';impLocked.value=true;showFileImport.value=true}
function confirmFileImport(){if(!active.value)return;if(!fileImportList.value.length)return message.warning('请先选择要上传的文档');const cat=impCat.value||activeCat.value;if(cat&&!active.value.categories.includes(cat))active.value.categories.push(cat);const names=fileImportList.value.map(x=>x.file?.name||x.name);const items=names.map(n=>({name:n,size:'—',status:'导入成功',parse:'智能解析',source:'本地上传',updatedAt:new Date().toLocaleString('zh-CN'),cat,content:''}));items.forEach(i=>active.value!.files.unshift(i));showFileImport.value=false;message.success(`已上传 ${names.length} 个文档至「${cat}」，导入成功`);setTimeout(()=>items.forEach(i=>{i.status='解析中'}),1500);setTimeout(()=>items.forEach(i=>{if(i.status==='解析中')i.status='解析完成'}),4500)}
const colTypeOptions=[{label:'string',value:'string'},{label:'double',value:'double'},{label:'long',value:'long'},{label:'datetime',value:'datetime'},{label:'image_url',value:'image_url'}];
const customColumns=[
  {title:'列名',key:'name',minWidth:200,render:(x:TableCol)=>h(NInput,{value:x.name,placeholder:'请输入名称',maxlength:15,showCount:true,size:'small',onUpdateValue:(v:string)=>{x.name=v}})},
  {title:'描述',key:'desc',minWidth:200,render:(x:TableCol)=>h(NInput,{value:x.desc,placeholder:'请输入描述',maxlength:15,showCount:true,size:'small',onUpdateValue:(v:string)=>{x.desc=v}})},
  {title:'类型',key:'type',width:160,render:(x:TableCol)=>h(NSelect,{value:x.type||null,placeholder:'请选择',size:'small',options:colTypeOptions,onUpdateValue:(v:string|null)=>{x.type=v||''}})},
  {title:'操作',key:'op',width:90,render:(_:TableCol,idx:number)=>h(NButton,{text:true,type:'error',size:'small',onClick:()=>newCols.value.splice(idx,1)},{default:()=>'删除'})}
];
function addField(){if(newCols.value.length>=100)return message.warning('最多支持 100 个字段');newCols.value.push({name:'',desc:'',type:''})}
const gridRows=computed(()=>active.value?.schemas?.[activeCat.value]?.rows||[]);
const gridColumns=computed(()=>{const s=active.value?.schemas?.[activeCat.value];if(!s)return[];return s.columns.map((c,i)=>({title:c.name,key:String(i),minWidth:160,render:(row:string[])=>row[i]??''}))});
const schemaCols=computed(()=>active.value?.schemas?.[activeCat.value]?.columns||[]);
const tblStatus=computed(()=>(active.value?.schemas?.[activeCat.value]?.columns.length||0)>0?'导入成功':'导入中');
function copyTableId(){const id=active.value?.schemas?.[activeCat.value]?.id;if(!id)return message.info('当前数据表暂无 ID');navigator.clipboard?.writeText(id).then(()=>message.success('数据表 ID 已复制')).catch(()=>message.info(`数据表 ID：${id}`))}
const schemaColumns=[{title:'列名',key:'name',minWidth:200},{title:'描述',key:'desc',minWidth:180,render:(x:TableCol)=>x.desc||'—'},{title:'类型',key:'type',width:120}];
function openNewTable(){newTableName.value='';newTableDesc.value='';newTableType.value='local';tableCfg.value='excel';tableFileList.value=[];newCols.value=Array.from({length:5},()=>({name:'',desc:'',type:''}));parsedPreview.value=[];parsedRows.value=[];parsedHeads.value=[];previewVisible.value=false;showNewTable.value=true}
const previewColumns=[
  {title:'列名',key:'name',minWidth:220,render:(x:TableCol,idx:number)=>h(NInput,{value:x.name,placeholder:parsedHeads.value[idx]||'',maxlength:15,showCount:true,size:'small',onUpdateValue:(v:string)=>{x.name=v}})},
  {title:'描述',key:'desc',minWidth:200,render:(x:TableCol)=>h(NInput,{value:x.desc,placeholder:'请输入描述',maxlength:15,showCount:true,size:'small',onUpdateValue:(v:string)=>{x.desc=v}})},
  {title:'类型',key:'type',width:150,render:(x:TableCol)=>h(NSelect,{value:x.type||'string',size:'small',options:colTypeOptions,onUpdateValue:(v:string)=>{x.type=v}})}
];
function parseExcel(file:File){const reader=new FileReader();reader.onload=e=>{try{const wb=XLSX.read(new Uint8Array(e.target?.result as ArrayBuffer),{type:'array'});const ws=wb.Sheets[wb.SheetNames[0]];if(!ws)return message.error('文件中无工作表');const all=XLSX.utils.sheet_to_json<string[]>(ws,{header:1,raw:false,defval:''});const head=(all[0]||[]).map(v=>String(v??'').trim()).filter(Boolean);if(!head.length)return message.error('未能识别表头，请确认第一行为列名');parsedHeads.value=head;parsedPreview.value=head.map(()=>({name:'',desc:'',type:'string'}));parsedRows.value=all.slice(1,51).map(r=>head.map((_,i)=>String(r?.[i]??'')));previewVisible.value=true;message.success(`表结构识别成功，共 ${head.length} 列`)}catch{message.error('文件解析失败，请检查文件格式')}};reader.readAsArrayBuffer(file)}
watch(tableFileList,l=>{const f=l&&l[0]&&l[0].file;if(!f){parsedPreview.value=[];parsedRows.value=[];parsedHeads.value=[];return}parseExcel(f)});
function createTable(){const n=newTableName.value.trim();if(!n)return message.warning('请输入数据表名称');if(!active.value)return;if(active.value.categories.includes(n))return message.warning('已存在同名数据表');let cols:TableCol[]=[];let rows:string[][]=[];if(tableCfg.value==='custom'){const filled=newCols.value.filter(c=>c.name.trim()||c.desc.trim()||c.type);if(!filled.length)return message.warning('请至少填写一个字段');const missing=filled.find(c=>!c.name.trim()||!c.desc.trim()||!c.type);if(missing)return message.warning('列名、描述、类型均为必填项，请补全后再创建');cols=filled.map(c=>({name:c.name.trim(),desc:c.desc.trim(),type:c.type}))}else{if(!tableFileList.value.length)return message.warning('请上传 Excel 文件');if(!parsedPreview.value.length)return message.warning('表结构尚未识别完成，请重新上传文件');cols=parsedPreview.value.map((c,i)=>({name:(c.name.trim()||parsedHeads.value[i]||'').trim(),desc:c.desc,type:c.type})).filter(c=>c.name);rows=parsedRows.value.map(r=>[...r])}active.value.categories.push(n);active.value.schemas[n]={id:`table_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`,desc:newTableDesc.value.trim(),columns:cols,rows};activeCat.value=n;showNewTable.value=false;message.success(tableCfg.value==='excel'?'数据导入成功，表结构已生成':'数据表已创建')}
function openSchema(){if(!gridColumns.value.length)return message.info('当前数据表暂无表结构');showSchema.value=true}
const tplColumns=computed(()=>(active.value?.schemas?.[activeCat.value]?.columns||[]).map((c,i)=>({title:c.name,key:String(i),minWidth:120})));
const tplRows=computed(()=>{const s=active.value?.schemas?.[activeCat.value];if(!s)return[];return Array.from({length:2},()=>s.columns.map(()=>''))});
function openImport(){importMode.value='cover';importFileList.value=[];showImport.value=true}
function confirmImport(){const s=active.value?.schemas?.[activeCat.value];if(!s)return message.warning('当前数据表暂无表结构');const f=importFileList.value[0]?.file;if(!f)return message.warning('请上传 Excel 文件');const reader=new FileReader();reader.onload=e=>{try{const wb=XLSX.read(new Uint8Array(e.target?.result as ArrayBuffer),{type:'array'});const ws=wb.Sheets[wb.SheetNames[0]];const all=XLSX.utils.sheet_to_json<string[]>(ws,{header:1,raw:false,defval:''});const head=(all[0]||[]).map(v=>String(v??'').trim()).filter(Boolean);const expected=s.columns.map(c=>c.name);const misaligned=head.length!==expected.length||head.some((h,i)=>h!==expected[i]);if(misaligned){const item=importFileList.value[0];if(item)item.status='error';return message.error('文件和表结构未对齐')}const dataRows=all.slice(1).filter(r=>r.some(v=>String(v??'').trim()!=='')).map(r=>s.columns.map((_,i)=>String(r?.[i]??'')));if(!dataRows.length)return message.error('文件中没有可导入的数据行');if(importMode.value==='cover')s.rows=dataRows;else s.rows.push(...dataRows);showImport.value=false;message.success(`导入成功，共 ${dataRows.length} 行（${importMode.value==='cover'?'覆盖':'增量'}）`)}catch{message.error('文件解析失败，请检查文件格式')}};reader.readAsArrayBuffer(f)}
const fileExt=computed(()=>{const n=detailFile.value?.name||'';const i=n.lastIndexOf('.');return i>=0?n.slice(i+1).toUpperCase():'文件'});
const hasExt=computed(()=>{const n=detailFile.value?.name||'';return n.lastIndexOf('.')>=0&&n.lastIndexOf('.')<n.length-1});
const docTitle=computed(()=>{const n=detailFile.value?.name||'';return hasExt.value?n.slice(0,n.lastIndexOf('.')):n});
const docContent=computed(()=>detailFile.value?.content||'该文件暂不支持在线预览，可点击右上角“下载原文”。');
function downloadFile(){const f=detailFile.value;if(!f)return;const blob=new Blob([f.content||''],{type:'text/plain;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=f.name;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(a.href);message.success('已开始下载原文')}
watch(showCreate,v=>{if(!v)resetCreate()});
</script>
<style scoped>.page{padding:24px;display:flex;flex-direction:column;gap:18px}header,.card-top{display:flex;justify-content:space-between;align-items:flex-start;gap:16px}h1,h2{margin:0}header p,.card p{color:var(--text-secondary);font-size:13px}.guide{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;padding:18px;background:#f8fafc;border:1px solid var(--border-color);border-radius:12px}.guide div{display:grid;grid-template-columns:28px 1fr;column-gap:10px}.guide b{grid-row:span 2;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;background:#2563eb;color:#fff}.guide span{font-size:12px;color:var(--text-secondary);margin-top:4px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px}.card{padding:18px;border:1px solid var(--border-color);border-radius:12px;background:#fff}.card h2{font-size:16px;margin:16px 0 10px}.tags{display:flex;gap:8px;margin-top:16px}.filter{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.type-cards{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;width:100%}.type-cards :deep(.n-radio){margin:0;padding:14px;border:1px solid var(--border-color);border-radius:9px;align-items:flex-start}.type-cards strong,.type-cards small{display:block}.type-cards small{margin-top:6px;color:var(--text-secondary);line-height:1.5}.success-card{width:420px;padding:28px 28px 24px;background:#fff;border-radius:16px;box-shadow:0 12px 40px rgba(15,23,42,.12)}.success-head{display:flex;align-items:center;gap:12px}.success-head strong{font-size:16px}.success-icon{width:24px;height:24px;flex:none}.success-sub{margin:10px 0 0 36px;font-size:14px;color:var(--text-secondary)}.success-actions{display:flex;justify-content:flex-end;gap:12px;margin-top:24px}.upload-hint{margin:0;font-size:14px}.upload-sub{margin:6px 0 0;font-size:12px;color:var(--text-secondary)}.tag-tip{margin-left:10px;font-size:12px;color:var(--text-secondary)}.detail-header{align-items:center}.detail-title{display:flex;align-items:center;gap:10px}.detail-title h1{font-size:18px}.detail-title svg{width:20px;height:20px}.ds-icon{width:34px;height:34px;border-radius:9px;background:#eff6ff;display:grid;place-items:center}.ds-icon svg{width:18px;height:18px}.detail-actions{display:flex;gap:10px}.info-card{padding:20px 24px;background:#f8fafc;border:1px solid var(--border-color);border-radius:12px}.info-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:18px 20px}.info-grid label{display:block;font-size:12px;color:var(--text-secondary);margin-bottom:6px}.info-grid p{margin:0;font-size:13px;display:flex;align-items:center;gap:6px}.id-line{min-width:0}.id-text{max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mini-icon{width:14px;height:14px;flex:none;cursor:pointer;color:var(--text-secondary)}.mini-icon:hover{color:#2563eb}.detail-tabs{width:280px}.detail-body{display:flex;gap:16px;align-items:stretch;min-height:480px}.cat-panel{width:200px;flex:none;padding:14px;border:1px solid var(--border-color);border-radius:12px;background:#fff}.cat-head{display:flex;justify-content:space-between;align-items:center;font-size:13px;font-weight:600}.cat-head em{font-style:normal;font-weight:400;color:var(--text-secondary);font-size:12px}.cat-tools{display:flex;gap:8px}.mini-icon.on{color:#2563eb}.cat-item{margin-top:8px;padding:8px 10px;border-radius:8px;font-size:13px;cursor:pointer;color:var(--text-secondary)}.cat-item.active{background:#eff6ff;color:#2563eb;font-weight:600}.cat-empty{margin:14px 0 0;font-size:12px;color:var(--text-secondary);text-align:center}.tbl-toolbar{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}.tbl-meta{display:flex;align-items:center;gap:14px;font-size:13px;color:var(--text-secondary)}.tbl-info{display:flex;align-items:center;gap:4px;cursor:pointer;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.tbl-info svg{width:14px;height:14px}.tbl-info:hover{color:#2563eb}.tbl-id-tip{display:inline-flex;align-items:center;gap:6px;word-break:break-all}.tbl-icon{width:15px;height:15px;color:#2563eb}.btn-icon{width:14px;height:14px}.tbl-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;color:#c2c9d4;padding:80px 0}.tbl-empty svg{width:46px;height:46px}.tbl-empty p{margin:0;font-size:13px}.grid-table{flex:1}.nt-head{display:flex;align-items:center;gap:10px}.nt-back{width:18px;height:18px;cursor:pointer;color:var(--text-secondary)}.nt-back:hover{color:#2563eb}.nt-upload{width:100%}.nt-hint{margin:0 0 8px;font-size:12px;color:var(--text-secondary)}.nt-schema-title{margin:14px 0 2px;font-size:13px;font-weight:600}.nt-cols{display:flex;flex-direction:column;gap:8px;width:100%}.nt-cols-table{width:100%}.nt-cols-table :deep(th){background:#fafafa}.nt-table-name{font-size:13px}.tpl-panel{margin-top:4px;background:#f7f8fa;border-radius:10px;padding:14px 16px}.tpl-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}.tpl-head .btn-icon{margin-right:4px;width:13px;height:13px}.tpl-title{font-size:12px;color:#8a94a6}.tpl-table{background:#fff;border-radius:8px}.tpl-table :deep(th){background:#fff;color:#6b7280;font-weight:500;font-size:12px;border-color:#eceef1}.tpl-table :deep(td){border-color:#f0f2f5;height:40px}.tpl-table :deep(td),.tpl-table :deep(th){padding-left:14px;padding-right:14px}.doc-title{font-size:15px}.doc-toolbar{display:flex;justify-content:space-between;align-items:center;margin:2px 0 12px}.doc-hint{font-size:12px;color:#64748b}.doc-body{background:#f7f8fa;border-radius:8px;padding:18px 20px;max-height:62vh;overflow:auto;white-space:pre-wrap;word-break:break-word;font-size:13px;line-height:2;color:#1f2937}.file-panel{flex:1;min-width:0;padding:16px;border:1px solid var(--border-color);border-radius:12px;background:#fff;display:flex;flex-direction:column;gap:12px}.file-head{display:flex;align-items:center;gap:10px;font-size:14px}.file-count{font-size:12px;color:var(--text-secondary)}.file-toolbar{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}@media(max-width:760px){.page{padding:16px}.guide{grid-template-columns:1fr}.info-grid{grid-template-columns:repeat(2,1fr)}.detail-body{flex-direction:column}.cat-panel{width:auto}}</style>
<style>
.n-popover.fmt-pop{background:#1f2937;color:#fff;--n-color:#1f2937;--n-text-color:#fff;--n-arrow-color:#1f2937;--n-arrow-color-hover:#1f2937}
.fmt-req p{margin:0 0 6px;font-size:12px;line-height:1.7;color:#fff}
.fmt-req p:last-child{margin-bottom:0}
</style>
<style scoped>
.nt-type-cards{width:100%}
.nt-type-card{display:flex;align-items:center;gap:12px;border:1px solid #e5e7eb;border-radius:10px;padding:14px 18px;cursor:pointer;max-width:460px;transition:border-color .2s}
.nt-type-card.on{border-color:#2563eb}
.nt-type-icon{width:38px;height:38px;border-radius:8px;background:#eff6ff;display:grid;place-items:center;flex:none}
.nt-type-txt{display:flex;flex-direction:column;gap:3px}
.nt-type-txt strong{font-size:14px;color:#1f2937}
.nt-type-txt small{font-size:12px;color:var(--text-secondary)}
.nt-type-dot{margin-left:auto;width:16px;height:16px;border-radius:50%;border:1.5px solid #d1d5db;position:relative;flex:none;background:#fff}
.nt-type-card.on .nt-type-dot{border-color:#2563eb}
.nt-type-card.on .nt-type-dot::after{content:'';position:absolute;inset:2.5px;border-radius:50%;background:#2563eb}
</style>
