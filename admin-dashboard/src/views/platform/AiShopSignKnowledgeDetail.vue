<template>
  <div class="knowledge-detail-page">
    <div class="page-head">
      <div>
        <n-button text type="primary" @click="router.push('/platform/ai-shop-sign/knowledge')">返回知识库</n-button>
        <h1>{{ knowledgeName }}</h1>
        <p>{{ knowledgeDescription || `知识库 ID：${indexId}` }}</p>
        <div class="id-line">
          <span>知识库 ID</span>
          <code>{{ indexId }}</code>
          <n-button text type="primary" size="tiny" @click="copyIndexId">复制</n-button>
        </div>
      </div>
      <n-space>
        <n-button :loading="loading" @click="loadDocuments">刷新文章</n-button>
        <n-button type="primary" :loading="uploading" @click="pickFile">上传文章</n-button>
      </n-space>
    </div>

    <n-alert v-if="error" type="error" :show-icon="true" class="section-gap">{{ error }}</n-alert>

    <div class="stats-row">
      <div>
        <span>文章数</span>
        <strong>{{ docs.length }}</strong>
      </div>
      <div>
        <span>处理中</span>
        <strong>{{ processingCount }}</strong>
      </div>
      <div>
        <span>异常</span>
        <strong>{{ failedCount }}</strong>
      </div>
    </div>

    <div class="content-card">
      <div class="card-title">
        <div>
          <h2>文章管理 <n-tag v-if="demoMode" type="warning" size="small" :bordered="false" style="margin-left:8px;vertical-align:2px;">演示数据</n-tag></h2>
          <p>查看知识库内已导入的文件，检查解析状态，并进入切片核对内容。</p>
        </div>
      </div>
      <n-data-table
        :columns="documentColumns"
        :data="docs"
        :bordered="false"
        :loading="loading"
        :pagination="{ pageSize: 10 }"
        size="small"
        :scroll-x="1120"
      />
    </div>

    <div class="content-card">
      <div class="card-title">
        <div>
          <h2>检索核对</h2>
          <p>用真实问题检查知识库命中情况，快速验证文章是否已经可用于问答。</p>
        </div>
      </div>
      <div class="retrieve-row">
        <n-input v-model:value="retrieveQuery" placeholder="输入问题，例如：会员充值规则是什么" />
        <n-button type="primary" :loading="retrieving" @click="runRetrieve">检索</n-button>
      </div>
      <div v-if="retrieveResults.length" class="result-list">
        <div v-for="(item, index) in retrieveResults" :key="index" class="chunk-item">
          <div class="chunk-title">
            {{ item.docName || item.title || '命中内容' }}
            <n-tag size="small" :bordered="false">相似度 {{ formatScore(item.score) }}</n-tag>
          </div>
          <div class="chunk-text">{{ item.text || item.content || '-' }}</div>
        </div>
      </div>
      <n-empty v-else description="输入问题后开始检索" />
    </div>

    <input ref="fileInput" type="file" class="hidden-input" @change="onFileChange" />

    <n-drawer v-model:show="chunkDrawer" :width="760">
      <n-drawer-content :title="activeDoc ? `切片核对：${activeDoc.name}` : '切片核对'" closable>
        <n-spin v-if="chunksLoading" size="small" />
        <n-alert v-else-if="!chunks.length" type="info" :show-icon="true">暂无切片，文章可能仍在解析或尚未成功导入。</n-alert>
        <div v-for="item in chunks" :key="item.chunkId || item.id || item.text" class="chunk-item">
          <div class="chunk-title">
            <span>{{ item.title || item.docName || '未命名切片' }}</span>
            <n-space size="small">
              <n-button text type="primary" size="small" @click="openEditChunk(item)">编辑</n-button>
              <n-button text type="error" size="small" @click="deleteChunk(item)">删除</n-button>
            </n-space>
          </div>
          <div class="chunk-text">{{ item.text || item.content || '-' }}</div>
        </div>
      </n-drawer-content>
    </n-drawer>

    <n-modal v-model:show="chunkEditModal" preset="card" title="编辑切片" style="width:640px">
      <n-form label-placement="top">
        <n-form-item label="切片标题"><n-input v-model:value="chunkEditForm.title" /></n-form-item>
        <n-form-item label="切片内容"><n-input v-model:value="chunkEditForm.content" type="textarea" :rows="8" /></n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="chunkEditModal=false">取消</n-button>
          <n-button type="primary" :loading="updatingChunk" @click="updateChunk">保存</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-drawer v-model:show="previewDrawer" :width="840">
      <n-drawer-content :title="activeDoc ? `在线查看：${activeDoc.name}` : '在线查看'" closable>
        <n-alert v-if="previewDownloadUrl" type="info" :show-icon="true" class="section-gap">
          阿里云百炼 OpenAPI 当前返回的是解析结果下载地址，不是原始源文件地址。
          <n-button text type="primary" @click="openPreviewUrl">打开链接</n-button>
        </n-alert>
        <n-spin v-if="previewLoading" size="small" />
        <n-alert v-else-if="!previewText" type="info" :show-icon="true">暂无可预览内容。阿里云百炼知识库 OpenAPI 可查看解析结果、切片和检索命中；源文件在线预览/源文件下载当前接口未提供。</n-alert>
        <pre v-else class="preview-text">{{ previewText }}</pre>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NTag, useMessage } from 'naive-ui'

type KnowledgeDocument = {
  fileId: string
  name: string
  format?: string
  status?: string
  sizeInBytes?: number
  createTime?: string | number
  url?: string
  parseResultDownloadUrl?: string
  errorMessage?: string
}

const route = useRoute()
const router = useRouter()
const message = useMessage()
const indexId = computed(() => String(route.params.id || ''))
const knowledgeName = computed(() => String(route.query.name || indexId.value))
const knowledgeDescription = computed(() => String(route.query.description || ''))

const docs = ref<KnowledgeDocument[]>([])
const loading = ref(false)
const uploading = ref(false)
const error = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const chunkDrawer = ref(false)
const chunksLoading = ref(false)
const activeDoc = ref<KnowledgeDocument | null>(null)
const chunks = ref<any[]>([])
const retrieveQuery = ref('')
const retrieveResults = ref<any[]>([])
const retrieving = ref(false)
const previewDrawer = ref(false)
const previewLoading = ref(false)
const previewText = ref('')
const previewDownloadUrl = ref('')
const chunkEditModal = ref(false)
const updatingChunk = ref(false)
const chunkEditForm = ref({ chunkId: '', title: '', content: '' })

const processingCount = computed(() => docs.value.filter((item) => {
  const status = String(item.status || '').toUpperCase()
  return status.includes('RUNNING') || status.includes('PENDING') || status.includes('PROCESS')
}).length)
const failedCount = computed(() => docs.value.filter((item) => String(item.status || '').toUpperCase().includes('FAIL')).length)

function cleanValue(value: unknown) {
  return String(value || '').trim()
}

function cleanEndpoint(value: unknown) {
  const raw = cleanValue(value)
  return raw.match(/\((https?:\/\/[^)]+)\)/)?.[1] || raw
}

function loadStoredKnowledgeApi() {
  try {
    const cached = JSON.parse(localStorage.getItem('touhao-ai-shop-sign') || '{}')
    const api = cached.knowledgeApi || {}
    return compactPayload({
      accessKeyId: api.accessKeyId,
      accessKeySecret: api.accessKeySecret,
      workspaceId: api.workspaceId,
      endpoint: cleanEndpoint(api.openapiEndpoint),
    })
  } catch {
    return {}
  }
}

function compactPayload(payload: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => cleanValue(value) !== ''))
}

async function callBailian(path: string, extra: Record<string, unknown> = {}) {
  const response = await fetch(`/api/bailian/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...loadStoredKnowledgeApi(), ...extra }),
  })
  const data = await response.json().catch(() => ({ success: false }))
  if (!response.ok || !data.success) {
    throw new Error(data.detail || data.message || '请求本地代理服务失败')
  }
  return data
}

// ===== 演示数据（未对接 API 时自动降级使用） =====
const demoMode = ref(false)
const DEMO_DOCS: KnowledgeDocument[] = [
  { fileId: 'demo-doc-001', name: '门店营业时间与服务项目.docx', format: 'DOCX', status: 'FINISH', sizeInBytes: 49 * 1024, createTime: '2026-09-10 14:32' },
  { fileId: 'demo-doc-002', name: '会员充值与退卡规则.pdf', format: 'PDF', status: 'FINISH', sizeInBytes: 328 * 1024, createTime: '2026-09-12 09:15' },
  { fileId: 'demo-doc-003', name: '周年庆活动说明.pptx', format: 'PPTX', status: 'RUNNING', sizeInBytes: 2.4 * 1024 * 1024, createTime: '2026-09-16 18:47' },
  { fileId: 'demo-doc-004', name: '常见问答FAQ汇总.md', format: 'MD', status: 'FAIL', sizeInBytes: 86 * 1024, createTime: '2026-09-15 11:02', errorMessage: '文件解析超时，请重新上传' },
]
const DEMO_CHUNKS: Record<string, any[]> = {
  'demo-doc-001': [
    { chunkId: 'demo-chunk-001', title: '营业时间', text: '门店营业时间为周一至周五 09:00-21:00，周六、周日及法定节假日 09:00-22:00。每日闭店前 30 分钟停止入场。' },
    { chunkId: 'demo-chunk-002', title: '服务项目', text: '门店提供 VR 游戏体验、生日派对包场、企业团建活动三大类服务。其中 VR 游戏支持单人次与双人协作模式，生日派对需提前 3 天预约。' },
    { chunkId: 'demo-chunk-003', title: '场地与设施', text: '门店共两层，一层为接待区与收银台，二层设有 8 个 VR 体验舱和 2 间派对室。全场覆盖免费 Wi-Fi，存储柜免费使用。' },
  ],
  'demo-doc-002': [
    { chunkId: 'demo-chunk-004', title: '会员充值', text: '会员充值套餐：充 300 送 30，充 500 送 80，充 1000 送 200。充值金额永久有效，赠送金额有效期为 12 个月，自充值之日起计算。' },
    { chunkId: 'demo-chunk-005', title: '退卡规则', text: '会员卡支持余额退卡：实付金额部分全额退还，赠送金额不予退还。已消费项目按单次原价从退款中扣除。退卡需持本人有效证件至前台办理，3 个工作日内原路退回。' },
    { chunkId: 'demo-chunk-006', title: '积分规则', text: '每消费 1 元累计 1 积分，积分可兑换游戏币（100 积分 = 10 币）或抵扣现金（100 积分 = 1 元）。积分有效期为 24 个月。' },
  ],
  'demo-doc-003': [
    { chunkId: 'demo-chunk-007', title: '周年庆活动', text: '9 月 20 日至 9 月 28 日周年庆期间，全场 VR 游戏体验 5 折起，充值套餐赠送金额翻倍，每日前 50 名到店顾客赠送精美礼品一份。' },
  ],
  'demo-doc-004': [],
}
const DEMO_RETRIEVE = [
  { score: 0.912, docName: '门店营业时间与服务项目.docx', text: '门店营业时间为周一至周五 09:00-21:00，周六、周日及法定节假日 09:00-22:00。每日闭店前 30 分钟停止入场。' },
  { score: 0.854, docName: '会员充值与退卡规则.pdf', text: '会员充值套餐：充 300 送 30，充 500 送 80，充 1000 送 200。充值金额永久有效，赠送金额有效期为 12 个月。' },
  { score: 0.723, docName: '门店营业时间与服务项目.docx', text: '门店提供 VR 游戏体验、生日派对包场、企业团建活动三大类服务。生日派对需提前 3 天预约。' },
]

async function loadDocuments() {
  loading.value = true
  error.value = ''
  try {
    const data = await callBailian('documents/details', { indexId: indexId.value, pageSize: 100 })
    demoMode.value = false
    docs.value = (data.data?.items || []).map((item: KnowledgeDocument) => ({
      ...item,
      format: item.format || inferFormat(item.name),
    }))
  } catch (err: any) {
    // API 未对接或代理服务未启动时，降级为演示数据
    demoMode.value = true
    docs.value = DEMO_DOCS.map((item) => ({ ...item }))
    message.info('API 未连接，当前展示演示数据')
  } finally {
    loading.value = false
  }
}

function pickFile() {
  fileInput.value?.click()
}

async function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  uploading.value = true
  try {
    const form = new FormData()
    form.append('file', file)
    Object.entries(loadStoredKnowledgeApi()).forEach(([key, value]) => form.append(key, String(value)))
    form.append('indexId', indexId.value)
    const response = await fetch('/api/bailian/files/upload', { method: 'POST', body: form })
    const data = await response.json().catch(() => ({ success: false }))
    if (!response.ok || !data.success) throw new Error(data.detail || data.message || '上传失败')
    message.success('文章已上传，百炼正在解析')
    await loadDocuments()
  } catch (err: any) {
    // 演示模式：本地模拟上传与解析
    const demoDoc: KnowledgeDocument = {
      fileId: `demo-doc-${Date.now()}`,
      name: file.name,
      format: inferFormat(file.name),
      status: 'RUNNING',
      sizeInBytes: file.size,
      createTime: new Date().toLocaleString('zh-CN', { hour12: false }),
    }
    demoMode.value = true
    docs.value.unshift(demoDoc)
    message.info('API 未连接，已加入演示列表，正在模拟解析')
    setTimeout(() => {
      const target = docs.value.find((item) => item.fileId === demoDoc.fileId)
      if (target) {
        target.status = 'FINISH'
        message.success('「' + file.name + '」解析完成')
      }
    }, 2000)
  } finally {
    uploading.value = false
  }
}

async function openChunks(row: KnowledgeDocument) {
  activeDoc.value = row
  chunkDrawer.value = true
  chunksLoading.value = true
  chunks.value = []
  try {
    const data = await callBailian('chunks', { indexId: indexId.value, fileId: row.fileId, pageSize: 50 })
    chunks.value = data.data?.items || []
  } catch {
    // 演示数据
    chunks.value = (DEMO_CHUNKS[row.fileId] || []).map((item) => ({ ...item }))
  } finally {
    chunksLoading.value = false
  }
}

async function fetchChunks(row: KnowledgeDocument) {
  try {
    const data = await callBailian('chunks', { indexId: indexId.value, fileId: row.fileId, pageSize: 100 })
    return data.data?.items || []
  } catch {
    return (DEMO_CHUNKS[row.fileId] || []).map((item) => ({ ...item }))
  }
}

function openEditChunk(item: any) {
  const chunkId = item.chunkId || item.id || ''
  if (!chunkId) {
    message.warning('该切片缺少 chunkId，无法编辑')
    return
  }
  chunkEditForm.value = {
    chunkId,
    title: item.title || item.docName || '',
    content: item.text || item.content || '',
  }
  chunkEditModal.value = true
}

async function updateChunk() {
  if (!chunkEditForm.value.chunkId) return
  updatingChunk.value = true
  try {
    await callBailian('chunks/update', {
      indexId: indexId.value,
      chunkId: chunkEditForm.value.chunkId,
      title: chunkEditForm.value.title,
      content: chunkEditForm.value.content,
    })
    message.success('切片已更新')
    chunkEditModal.value = false
    if (activeDoc.value) await openChunks(activeDoc.value)
  } catch (err: any) {
    // 演示模式：本地更新切片
    const target = chunks.value.find((item) => (item.chunkId || item.id) === chunkEditForm.value.chunkId)
    if (target) {
      target.title = chunkEditForm.value.title
      target.text = chunkEditForm.value.content
      message.success('切片已更新（演示数据）')
      chunkEditModal.value = false
    } else {
      message.error(`切片更新失败：${err?.message || ''}`)
    }
    message.error(`切片更新失败：${err?.message || ''}`)
  } finally {
    updatingChunk.value = false
  }
}

async function deleteChunk(item: any) {
  const chunkId = item.chunkId || item.id || ''
  if (!chunkId) {
    message.warning('该切片缺少 chunkId，无法删除')
    return
  }
  if (!window.confirm('确认删除这个切片？删除后将不再参与知识库检索。')) return
  if (demoMode.value) {
    chunks.value = chunks.value.filter((item) => (item.chunkId || item.id) !== chunkId)
    message.success('切片已删除（演示数据）')
    return
  }
  try {
    await callBailian('chunks/delete', { indexId: indexId.value, chunkIds: [chunkId] })
    message.success('切片已删除')
    if (activeDoc.value) await openChunks(activeDoc.value)
  } catch (err: any) {
    message.error(`切片删除失败：${err?.message || ''}`)
  }
}

async function describeDocument(row: KnowledgeDocument) {
  try {
    const data = await callBailian('files/describe', { fileId: row.fileId })
    return data.data || {}
  } catch {
    return {}
  }
}

async function previewDocument(row: KnowledgeDocument) {
  activeDoc.value = row
  previewDrawer.value = true
  previewLoading.value = true
  previewText.value = ''
  previewDownloadUrl.value = ''
  try {
    const detail = await describeDocument(row)
    previewDownloadUrl.value = row.parseResultDownloadUrl || detail.parseResultDownloadUrl || row.url || ''
    if (!previewDownloadUrl.value) {
      message.info('百炼 OpenAPI 未提供源文件预览地址，正在展示解析切片内容')
    }
    const items = await fetchChunks(row)
    previewText.value = items.map((item: any, index: number) => {
      const title = item.title || item.docName || `片段 ${index + 1}`
      const text = item.text || item.content || ''
      return `# ${title}\n${text}`
    }).join('\n\n')
  } catch (err: any) {
    message.error(`在线查看失败：${err?.message || ''}`)
  } finally {
    previewLoading.value = false
  }
}

function openPreviewUrl() {
  if (!previewDownloadUrl.value) return
  window.open(previewDownloadUrl.value, '_blank', 'noopener,noreferrer')
}

async function downloadDocument(row: KnowledgeDocument) {
  try {
    const detail = await describeDocument(row)
    const downloadUrl = row.parseResultDownloadUrl || detail.parseResultDownloadUrl || row.url
    if (downloadUrl) {
      message.info('将打开百炼解析结果下载地址，不是原始源文件')
      window.open(downloadUrl, '_blank', 'noopener,noreferrer')
      return
    }
    const items = await fetchChunks(row)
    const content = items.map((item: any, index: number) => {
      const title = item.title || item.docName || `片段 ${index + 1}`
      const text = item.text || item.content || ''
      return `# ${title}\n${text}`
    }).join('\n\n')
    if (!content.trim()) {
      message.warning('百炼 OpenAPI 未提供源文件下载地址，也暂无解析内容可导出')
      return
    }
    downloadText(`${safeFileName(row.name)}-解析内容.txt`, content)
  } catch (err: any) {
    message.error(`下载失败：${err?.message || ''}`)
  }
}

async function deleteDocument(row: KnowledgeDocument) {
  if (!window.confirm(`确认从知识库中删除文章「${row.name}」？`)) return
  if (demoMode.value) {
    docs.value = docs.value.filter((item) => item.fileId !== row.fileId)
    message.success('文章已删除（演示数据）')
    return
  }
  try {
    await callBailian('documents/delete', { indexId: indexId.value, documentIds: [row.fileId] })
    message.success('文章已删除')
    await loadDocuments()
  } catch (err: any) {
    message.error(`删除失败：${err?.message || ''}`)
  }
}

async function runRetrieve() {
  if (!retrieveQuery.value.trim()) {
    message.warning('请输入检索内容')
    return
  }
  retrieving.value = true
  try {
    const data = await callBailian('retrieve', { indexId: indexId.value, query: retrieveQuery.value, topK: 5 })
    retrieveResults.value = data.data?.items || []
    if (!retrieveResults.value.length) message.info('未命中相关内容')
  } catch {
    // 演示数据：模拟命中
    await new Promise((resolve) => setTimeout(resolve, 600))
    retrieveResults.value = DEMO_RETRIEVE.map((item) => ({ ...item }))
    message.info('API 未连接，当前展示演示检索结果')
  } finally {
    retrieving.value = false
  }
}

function formatSize(value?: number) {
  if (!value) return '-'
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / 1024 / 1024).toFixed(1)} MB`
}

function inferFormat(name?: string) {
  const suffix = String(name || '').split('.').pop()
  if (!suffix || suffix === name) return '未知'
  return suffix.toUpperCase()
}

function formatDocumentType(row: KnowledgeDocument) {
  return (row.format || inferFormat(row.name) || '未知').toString().toUpperCase()
}

function formatTime(value?: string | number) {
  if (!value) return '-'
  if (typeof value === 'number') {
    const millis = value > 10_000_000_000 ? value : value * 1000
    return new Date(millis).toLocaleString('zh-CN')
  }
  return value
}

function safeFileName(name: string) {
  return (name || '文档').replace(/[\\/:*?"<>|]/g, '_')
}

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function statusType(status?: string) {
  const value = String(status || '').toUpperCase()
  if (value.includes('FAIL')) return 'error'
  if (value.includes('RUNNING') || value.includes('PENDING') || value.includes('PROCESS')) return 'warning'
  return 'success'
}

function formatScore(score: unknown) {
  return typeof score === 'number' ? score.toFixed(3) : (score || '-')
}

async function copyIndexId() {
  try {
    await navigator.clipboard.writeText(indexId.value)
    message.success('知识库 ID 已复制')
  } catch {
    message.error('复制失败')
  }
}

const documentColumns = [
  { title: '文章名称', key: 'name', minWidth: 240 },
  { title: '格式', key: 'format', width: 100, render: (row: KnowledgeDocument) => h(NTag, { size: 'small', bordered: false }, { default: () => formatDocumentType(row) }) },
  {
    title: '解析状态',
    key: 'status',
    width: 120,
    render: (row: KnowledgeDocument) => h(NTag, { type: statusType(row.status), size: 'small', bordered: false }, { default: () => row.status || '-' }),
  },
  { title: '大小', key: 'sizeInBytes', width: 110, render: (row: KnowledgeDocument) => formatSize(row.sizeInBytes) },
  { title: '创建时间', key: 'createTime', width: 180, render: (row: KnowledgeDocument) => formatTime(row.createTime) },
  {
    title: '操作',
    key: 'actions',
    width: 460,
    fixed: 'right',
    render: (row: KnowledgeDocument) => h('div', { class: 'table-actions doc-actions' }, [
      h(NButton, { text: true, type: 'primary', size: 'small', style: 'margin-right: 22px', onClick: () => previewDocument(row) }, { default: () => '查看解析' }),
      h(NButton, { text: true, type: 'primary', size: 'small', style: 'margin-right: 22px', onClick: () => downloadDocument(row) }, { default: () => '下载解析' }),
      h(NButton, { text: true, type: 'primary', size: 'small', style: 'margin-right: 22px', onClick: () => openChunks(row) }, { default: () => '核对切片' }),
      h(NButton, { text: true, type: 'error', size: 'small', onClick: () => deleteDocument(row) }, { default: () => '删除' }),
    ]),
  },
]

onMounted(loadDocuments)
</script>

<style scoped>
.knowledge-detail-page{padding:24px;display:flex;flex-direction:column;gap:16px}.page-head,.card-title{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}.page-head h1,.card-title h2{margin:8px 0 6px}.page-head p,.card-title p{margin:0;color:var(--text-secondary);font-size:13px}.id-line{display:flex;align-items:center;gap:8px;margin-top:10px;color:var(--text-secondary);font-size:13px}.id-line code{padding:3px 6px;border-radius:6px;background:#f1f5f9;color:#1f2937}.content-card,.stats-row>div{background:#fff;border:1px solid var(--border-color);border-radius:12px}.content-card{padding:18px}.stats-row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.stats-row>div{padding:16px}.stats-row span{display:block;color:var(--text-secondary);font-size:13px}.stats-row strong{display:block;margin-top:8px;font-size:26px;color:#1f2937}.api-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.api-grid>div{padding:14px;border:1px solid var(--border-color);border-radius:10px;background:#fbfdff}.api-grid strong{display:block;margin-bottom:6px;color:var(--text-primary)}.api-grid p{margin:0 0 10px;color:var(--text-secondary);font-size:13px;line-height:1.6}.inline-row{display:flex;gap:10px;align-items:center;margin-bottom:10px}.mini-pre{max-height:220px;overflow:auto;margin:10px 0 0;padding:12px;border-radius:8px;background:#0f172a;color:#e5e7eb;font-size:12px;line-height:1.6}.compact-list{display:flex;flex-direction:column;gap:6px;max-height:180px;overflow:auto;color:var(--text-secondary);font-size:13px}.retrieve-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;margin-bottom:14px}.result-list{display:flex;flex-direction:column;gap:10px}.chunk-item{padding:12px 14px;margin-bottom:10px;border:1px solid var(--border-color);border-radius:8px}.chunk-title{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:6px;font-size:13px;font-weight:600;color:var(--text-primary)}.chunk-text{font-size:12px;line-height:1.7;color:var(--text-secondary);white-space:pre-wrap}.preview-text{margin:0;padding:14px;border-radius:8px;background:#0f172a;color:#e5e7eb;white-space:pre-wrap;line-height:1.7;font-size:13px}.table-actions{display:flex;white-space:nowrap}.doc-actions{align-items:center;justify-content:flex-start;min-width:280px}.hidden-input{display:none}.section-gap{margin-bottom:12px}@media(max-width:800px){.knowledge-detail-page{padding:16px}.page-head,.card-title{flex-direction:column}.stats-row,.api-grid{grid-template-columns:1fr}.retrieve-row{grid-template-columns:1fr}.inline-row{flex-direction:column;align-items:stretch}}
</style>
