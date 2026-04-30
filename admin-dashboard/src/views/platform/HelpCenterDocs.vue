<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>帮助文档</h1>
        <p class="header-desc">平台使用指南与操作手册</p>
      </div>
      <n-space>
        <n-button type="primary" @click="showAddModal = true">
          <template #icon><n-icon :component="CreateOutline" /></template> 新增文档
        </n-button>
      </n-space>
    </div>

    <!-- 搜索筛选 -->
    <div class="filter-card">
      <n-input v-model:value="searchKeyword" placeholder="搜索文档标题..." clearable style="width: 280px;" />
      <n-select v-model:value="selectedCategory" :options="categoryOptions" placeholder="文档分类" clearable style="width: 180px;" />
      <n-button @click="handleSearch">查询</n-button>
    </div>

    <!-- 文档列表 -->
    <div class="content-card">
      <n-data-table
        :columns="columns"
        :data="filteredDocs"
        :pagination="{ pageSize: 10 }"
        striped
        :row-key="(row: any) => row.id"
      />
    </div>

    <!-- 新增/编辑弹窗 -->
    <n-modal v-model:show="showAddModal" preset="card" title="新增帮助文档" style="width: 680px;" :bordered="false">
      <n-form label-placement="left" label-width="80" style="margin-top: 16px;">
        <n-form-item label="标题">
          <n-input v-model:value="form.title" placeholder="请输入文档标题" />
        </n-form-item>
        <n-form-item label="分类">
          <n-select v-model:value="form.category" :options="categoryOptions" placeholder="选择分类" />
        </n-form-item>
        <n-form-item label="内容">
          <n-input v-model:value="form.content" type="textarea" :rows="12" placeholder="请输入文档内容（支持Markdown）" />
        </n-form-item>
        <n-form-item label="排序">
          <n-input-number v-model:value="form.sort" :min="0" style="width: 160px;" />
        </n-form-item>
        <n-form-item label="状态">
          <n-switch v-model:value="form.published">
            <template #checked>已发布</template>
            <template #unchecked>草稿</template>
          </n-switch>
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showAddModal = false">取消</n-button>
          <n-button type="primary" @click="handleSave">保存</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { NButton, NIcon, NTag, NSwitch, NSpace, useMessage } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { CreateOutline, EyeOutline, TrashOutline, PencilOutline } from '@vicons/ionicons5'

const message = useMessage()
const searchKeyword = ref('')
const selectedCategory = ref<string | null>(null)
const showAddModal = ref(false)

const categoryOptions = [
  { label: '快速入门', value: 'quick-start' },
  { label: '操作指南', value: 'guide' },
  { label: '常见问题', value: 'faq' },
  { label: 'API文档', value: 'api' },
]

const form = ref({
  title: '',
  category: null as string | null,
  content: '',
  sort: 0,
  published: true,
})

interface DocItem {
  id: number
  title: string
  category: string
  categoryName: string
  views: number
  author: string
  updatedAt: string
  status: boolean
}

const docsList = ref<DocItem[]>([
  { id: 1, title: '平台快速入门指南', category: 'quick-start', categoryName: '快速入门', views: 1523, author: '运营组', updatedAt: '2026-04-20', status: true },
  { id: 2, title: '店铺创建与设备接入流程', category: 'guide', categoryName: '操作指南', views: 890, author: '技术组', updatedAt: '2026-04-18', status: true },
  { id: 3, title: '结算规则说明', category: 'guide', categoryName: '操作指南', views: 2100, author: '财务组', updatedAt: '2026-04-15', status: true },
  { id: 4, title: '对账中心使用手册', category: 'guide', categoryName: '操作指南', views: 654, author: '财务组', updatedAt: '2026-04-28', status: true },
  { id: 5, title: 'API接口调用规范', category: 'api', categoryName: 'API文档', views: 320, author: '技术组', updatedAt: '2026-03-10', status: false },
])

const filteredDocs = computed(() => {
  let list = docsList.value
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    list = list.filter(d => d.title.toLowerCase().includes(kw))
  }
  if (selectedCategory.value) {
    list = list.filter(d => d.category === selectedCategory.value)
  }
  return list
})

const columns: DataTableColumns<DocItem> = [
  { title: 'ID', key: 'id', width: 60, sorter: (a, b) => a.id - b.id },
  { title: '文档标题', key: 'title', ellipsis: { tooltip: true } },
  {
    title: '分类',
    key: 'categoryName',
    width: 110,
    render(row) { return h(NTag, { size: 'small', bordered: false, type: 'info' }, () => row.categoryName) }
  },
  { title: '浏览量', key: 'views', width: 90, sorter: (a, b) => a.views - b.views },
  { title: '作者', key: 'author', width: 90 },
  { title: '更新时间', key: 'updatedAt', width: 120 },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render(row) {
      return h(NSwitch, {
        size: 'small',
        value: row.status,
        onUpdateValue(val: boolean) { row.status = val; message.success(val ? '已发布' : '已下线') },
      })
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    render(row) {
      return h(NSpace, null, () => [
        h(NButton, { text: '', size: 'small', type: 'primary' }, () => [h(NIcon, { component: EyeOutline })]),
        h(NButton, { text: '', size: 'small', type: 'warning' }, () => [h(NIcon, { component: PencilOutline })]),
        h(NButton, { text: '', size: 'small', type: 'error' }, () => [h(NIcon, { component: TrashOutline })]),
      ])
    }
  },
]

function handleSearch() {}
function handleSave() {
  showAddModal.value = false
  message.success('保存成功')
}
</script>

<style scoped>
.page-container { padding: 24px; background: var(--color-bg-base); min-height: calc(100vh - 64px); }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0 0 4px 0; }
.header-desc { font-size: 14px; color: var(--text-muted); margin: 0; }
.filter-card { display: flex; align-items: center; gap: 12px; padding: 16px 20px; background: white; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); margin-bottom: 16px; }
.content-card { background: white; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); padding: 20px; }
</style>
