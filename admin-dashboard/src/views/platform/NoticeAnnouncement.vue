<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>公告管理</h1>
        <p class="header-desc">向全平台或指定角色发布公告通知</p>
      </div>
      <n-space>
        <n-button type="primary" @click="openEditor()">
          <template #icon><n-icon :component="CreateOutline" /></template> 发布公告
        </n-button>
      </n-space>
    </div>

    <!-- 筛选 -->
    <div class="filter-card">
      <n-input v-model:value="searchKey" placeholder="搜索公告标题..." clearable style="width: 260px;" />
      <n-select v-model:value="statusFilter" :options="[{label:'全部',value:null},{label:'已发布',value:'published'},{label:'草稿',value:'draft'}]" placeholder="状态" clearable style="width: 140px;" />
      <n-select v-model:value="targetFilter" :options="targetOptions" placeholder="目标对象" clearable style="width: 150px;" />
      <n-button @click="handleFilter">查询</n-button>
    </div>

    <!-- 公告列表 -->
    <div class="content-card">
      <n-data-table
        :columns="columns"
        :data="filteredData"
        :pagination="{ pageSize: 10 }"
        striped
        :row-key="noticeRowKey"
      />
    </div>

    <!-- 发布/编辑公告弹窗 -->
    <n-modal v-model:show="showEditor" preset="card" :title="editId ? '编辑公告' : '发布公告'" style="width: 720px;" :bordered="false">
      <n-form label-placement="top" style="margin-top: 16px;">
        <n-form-item label="公告标题">
          <n-input v-model:value="form.title" placeholder="请输入公告标题" maxlength="100" show-count />
        </n-form-item>
        <n-form-item label="公告类型">
          <n-radio-group v-model:value="form.type">
            <n-radio-button value="normal">普通公告</n-radio-button>
            <n-radio-button value="urgent">紧急通知</n-radio-button>
            <n-radio-button value="maintain">维护公告</n-radio-button>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="目标对象">
          <n-checkbox-group v-model:value="form.targets">
            <n-checkbox value="all">全部用户</n-checkbox>
            <n-checkbox value="merchant">商家</n-checkbox>
            <n-checkbox value="agent">代理商</n-checkbox>
            <n-checkbox value="shop">店员</n-checkbox>
          </n-checkbox-group>
        </n-form-item>
        <n-form-item label="置顶">
          <n-switch v-model:value="form.pinned">
            <template #checked>置顶</template>
            <template #unchecked>不置顶</template>
          </n-switch>
        </n-form-item>
        <n-form-item label="正文内容">
          <n-input v-model:value="form.content" type="textarea" :rows="10" placeholder="请输入公告正文内容" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showEditor = false">取消</n-button>
          <n-button v-if="!editId" secondary @click="saveDraft">存为草稿</n-button>
          <n-button type="primary" @click="publish">{{ editId ? '保存修改' : '立即发布' }}</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 预览弹窗 -->
    <n-modal v-model:show="showPreview" preset="card" title="公告预览" style="width: 600px;" :bordered="false">
      <div class="preview-body">
        <h2>{{ previewData?.title }}</h2>
        <div class="preview-meta">
          <n-tag :type="getTypeColor(previewData?.type)" size="small">{{ getTypeLabel(previewData?.type) }}</n-tag>
          <span>{{ previewData?.author }} · {{ previewData?.createdAt }}</span>
        </div>
        <n-divider />
        <p style="white-space: pre-wrap;">{{ previewData?.content }}</p>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { NButton, NIcon, NTag, NSpace, useMessage } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { CreateOutline, EyeOutline, TrashOutline, PencilOutline, PinOutline } from '@vicons/ionicons5'

const message = useMessage()
const searchKey = ref('')
const statusFilter = ref<string | null>(null)
const targetFilter = ref<string | null>(null)
const showEditor = ref(false)
const showPreview = ref(false)
const editId = ref<number | null>(null)

const targetOptions = [
  { label: '全部用户', value: 'all' },
  { label: '商家', value: 'merchant' },
  { label: '代理商', value: 'agent' },
  { label: '店员', value: 'shop' },
]

const form = ref({
  title: '',
  type: 'normal',
  targets: ['all'] as string[],
  pinned: false,
  content: '',
})

interface NoticeItem {
  id: number
  title: string
  type: string
  targets: string[]
  pinned: boolean
  author: string
  createdAt: string
  status: string
  content: string
  reads: number
}

const noticeList = ref<NoticeItem[]>([
  { id: 1, title: '关于系统升级维护的通知', type: 'maintain', targets: ['all'], pinned: true, author: '运维团队', createdAt: '2026-04-29', status: 'published', content: '计划于2026年5月2日02:00-06:00进行系统升级维护，期间部分功能将不可用，请提前做好准备。', reads: 3420 },
  { id: 2, title: '新版结算规则上线说明', type: 'normal', targets: ['merchant', 'agent'], pinned: false, author: '产品组', createdAt: '2026-04-25', status: 'published', content: '自2026年5月1日起，新的结算规则正式生效：T+7改为T+5，分润比例调整详见附件。', reads: 1890 },
  { id: 3, title: '紧急：支付通道临时故障排查中', type: 'urgent', targets: ['merchant'], pinned: true, author: '技术支持', createdAt: '2026-04-23', status: 'published', content: '支付宝渠道出现偶发性支付失败，正在紧急排查修复，预计30分钟内恢复。', reads: 5670 },
  { id: 4, title: '五一假期活动安排公告', type: 'normal', targets: ['all'], pinned: false, author: '运营组', createdAt: '2026-04-20', status: 'draft', content: '五一期间各门店活动安排及促销方案...', reads: 0 },
])

const previewData = ref<NoticeItem | null>(null)

const filteredData = computed(() => {
  let list = noticeList.value
  if (searchKey.value) {
    const kw = searchKey.value.toLowerCase()
    list = list.filter(n => n.title.toLowerCase().includes(kw))
  }
  if (statusFilter.value) list = list.filter(n => n.status === statusFilter.value)
  if (targetFilter.value) list = list.filter(n => n.targets.includes(targetFilter.value))
  return list
})

function getTypeLabel(type?: string) { return { normal: '普通', urgent: '紧急', maintain: '维护' }[type || 'normal'] || '普通' }
function getTypeColor(type?: string) { return { normal: 'default', urgent: 'error', maintain: 'warning' }[type || 'normal'] || 'default' }

const columns: DataTableColumns<NoticeItem> = [
  { title: 'ID', key: 'id', width: 50 },
  {
    title: '标题',
    key: 'title',
    ellipsis: { tooltip: true },
    render(row) {
      return h('span', {}, [
        row.pinned ? h(NIcon, { component: PinOutline, size: 14, style: 'margin-right:4px;vertical-align:-2px;color:#F59E0B;' }) : null,
        row.title,
      ])
    }
  },
  {
    title: '类型', key: 'type', width: 90,
    render(row) { return h(NTag, { size: 'small', type: getTypeColor(row.type), bordered: false }, () => getTypeLabel(row.type)) }
  },
  { title: '目标', key: 'targets', width: 120, ellipsis: true },
  {
    title: '状态', key: 'status', width: 80,
    render(row) { return h(NTag, { size: 'small', type: row.status === 'published' ? 'success' : 'default', bordered: false }, () => row.status === 'published' ? '已发布' : '草稿') }
  },
  { title: '阅读量', key: 'reads', width: 80, sorter: (a, b) => a.reads - b.reads },
  { title: '发布时间', key: 'createdAt', width: 120 },
  {
    title: '操作', key: 'actions', width: 200,
    render(row) {
      return h(NSpace, null, () => [
        h(NButton, { text: '', size: 'small', type: 'primary', onClick: () => { previewData.value = row; showPreview.value = true } }, () => [h(NIcon, { component: EyeOutline }), ' 预览']),
        h(NButton, { text: '', size: 'small', type: 'warning', onClick: () => openEditor(row) }, () => [h(NIcon, { component: PencilOutline })]),
        h(NButton, { text: '', size: 'small', type: 'error' }, () => [h(NIcon, { component: TrashOutline })]),
      ])
    }
  },
]

function openEditor(data?: NoticeItem) {
  if (data) {
    editId.value = data.id
    form.value = { title: data.title, type: data.type, targets: data.targets, pinned: data.pinned, content: data.content }
  } else {
    editId.value = null
    form.value = { title: '', type: 'normal', targets: ['all'], pinned: false, content: '' }
  }
  showEditor.value = true
}
function handleFilter() {}
function saveDraft() { showEditor.value = false; message.success('已存为草稿') }
function publish() { showEditor.value = false; message.success(editId.value ? '修改成功' : '发布成功') }
const noticeRowKey = (row: any) => row.id
</script>

<style scoped>
.page-container { padding: 24px; background: var(--color-bg-base); min-height: calc(100vh - 64px); }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0 0 4px 0; }
.header-desc { font-size: 14px; color: var(--text-muted); margin: 0; }
.filter-card { display: flex; align-items: center; gap: 12px; padding: 16px 20px; background: white; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); margin-bottom: 16px; }
.content-card { background: white; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); padding: 20px; }
.preview-body h2 { margin: 0 0 10px; font-size: 18px; }
.preview-meta { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--text-muted); }
</style>
