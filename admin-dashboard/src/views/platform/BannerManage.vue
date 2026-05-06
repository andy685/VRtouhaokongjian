<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>小程序 Banner 管理</h1>
        <p class="header-desc">管理 C 端小程序首页轮播图，支持跳转到游戏详情页或自定义链接</p>
      </div>
      <n-button type="primary" @click="openAddDialog">
        <template #icon><n-icon :component="AddCircleOutline" /></template>
        新增 Banner
      </n-button>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="ImageOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">Banner 总数</span>
          <span class="value">{{ mockData.length }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="CheckmarkCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">已启用</span>
          <span class="value">{{ mockData.filter(b => b.status).length }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="EyeOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">展示中</span>
          <span class="value warning">{{ mockData.filter(b => b.status && b.isShowing).length }}</span>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <n-card style="margin-top: 20px;">
      <n-data-table
        :columns="columns"
        :data="mockData"
        :bordered="false"
        :single-line="false"
        :row-key="(row: BannerItem) => row.id"
        pagination
      />
    </n-card>
  </div>

  <!-- 新增/编辑 Banner 弹窗 -->
  <n-modal v-model:show="showModal" :title="editingId ? '编辑 Banner' : '新增 Banner'" preset="card" style="width: 680px;" :mask-closable="false">
    <n-form ref="formRef" :model="formData" :rules="rules" label-placement="top" style="margin-top: 8px;">
      <n-form-item label="Banner 标题" path="title">
        <n-input v-model:value="formData.title" placeholder="请输入 Banner 标题" />
      </n-form-item>
      <n-form-item label="Banner 图片" path="cover">
        <n-upload
          action=""
          :default-file-list="[]"
          list-type="image-card"
          :max="1"
          @change="handleUploadChange"
        >
          <n-button>上传图片</n-button>
        </n-upload>
      </n-form-item>
      <n-form-item label="跳转类型" path="jumpType">
        <n-radio-group v-model:value="formData.jumpType">
          <n-radio value="game">跳转到游戏详情页</n-radio>
          <n-radio value="link">跳转到自定义链接</n-radio>
        </n-radio-group>
      </n-form-item>
      <n-form-item v-if="formData.jumpType === 'game'" label="选择游戏" path="jumpTarget">
        <n-select
          v-model:value="formData.jumpTarget"
          :options="gameOptions"
          placeholder="请选择游戏"
          filterable
        />
      </n-form-item>
      <n-form-item v-if="formData.jumpType === 'link'" label="链接地址" path="jumpTarget">
        <n-input v-model:value="formData.jumpTarget" placeholder="请输入完整 URL，如 https://example.com/activity" />
      </n-form-item>
      <n-row :gutter="16">
        <n-col :span="12">
          <n-form-item label="排序权重" path="sortOrder">
            <n-input-number v-model:value="formData.sortOrder" :min="0" :max="999" placeholder="数字越小越靠前" />
          </n-form-item>
        </n-col>
        <n-col :span="12">
          <n-form-item label="状态">
            <n-switch v-model:value="formData.status" checked-label="启用" unchecked-label="停用" />
          </n-form-item>
        </n-col>
      </n-row>
    </n-form>
    <template #footer>
      <n-space justify="end">
        <n-button @click="showModal = false">取消</n-button>
        <n-button type="primary" @click="handleSubmit">保存</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import type { DataTableColumn, FormInst, FormRules, UploadFileInfo } from 'naive-ui'
import {
  NButton, NDataTable, NTag, NSpace, NModal, NForm, NFormItem,
  NInput, NIcon, NInputNumber, NSelect, NRadio, NRadioGroup,
  NSwitch, NUpload, NRow, NCol, NCard, useMessage, useDialog
} from 'naive-ui'
import {
  ImageOutline, CheckmarkCircleOutline, EyeOutline, AddCircleOutline,
  CreateOutline, TrashOutline
} from '@vicons/ionicons5'

interface BannerItem {
  id: number
  title: string
  cover: string
  jumpType: 'game' | 'link'
  jumpTarget: string
  sortOrder: number
  status: boolean
  isShowing: boolean
  createdAt: string
}

// 模拟数据
const mockData = ref<BannerItem[]>([
  { id: 1, title: '新店开业大促', cover: '', jumpType: 'link', jumpTarget: 'https://mp.weixin.qq.com/activity/1', sortOrder: 1, status: true, isShowing: true, createdAt: '2026-05-01' },
  { id: 2, title: '热门推荐 - 过山车VR', cover: '', jumpType: 'game', jumpTarget: '67', sortOrder: 2, status: true, isShowing: true, createdAt: '2026-04-28' },
  { id: 3, title: '亲子套餐特惠', cover: '', jumpType: 'link', jumpTarget: 'https://mp.weixin.qq.com/activity/2', sortOrder: 3, status: true, isShowing: true, createdAt: '2026-04-25' },
  { id: 4, title: '恐怖密室新上线', cover: '', jumpType: 'game', jumpTarget: '72', sortOrder: 4, status: false, isShowing: false, createdAt: '2026-04-20' },
  { id: 5, title: '五一限时特惠', cover: '', jumpType: 'link', jumpTarget: 'https://mp.weixin.qq.com/activity/3', sortOrder: 5, status: true, isShowing: false, createdAt: '2026-04-15' },
])

// 游戏选项
const gameOptions = [
  { label: '过山车VR', value: '67' },
  { label: '星际穿越', value: '68' },
  { label: '恐怖医院', value: '69' },
  { label: '极速赛车', value: '70' },
  { label: '海洋世界', value: '71' },
  { label: '恐龙世界', value: '72' },
  { label: '飞行模拟器', value: '73' },
  { label: '鬼屋惊魂', value: '74' },
]

const showModal = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInst | null>(null)
const message = useMessage()
const dialog = useDialog()

const formData = ref({
  title: '',
  cover: '' as string,
  jumpType: 'game' as 'game' | 'link',
  jumpTarget: '',
  sortOrder: 0,
  status: true,
})

const rules: FormRules = {
  title: { required: true, message: '请输入 Banner 标题', trigger: 'blur' },
  jumpType: { required: true, message: '请选择跳转类型', trigger: 'change' },
  jumpTarget: { required: true, message: '请选择游戏或输入链接', trigger: ['blur', 'change'] },
}

function getGameName(id: string) {
  return gameOptions.find(g => g.value === id)?.label || id
}

const columns: DataTableColumn<BannerItem>[] = [
  { title: '排序', key: 'sortOrder', width: 70, align: 'center' as const },
  { title: '标题', key: 'title', ellipsis: { tooltip: true } },
  {
    title: '跳转类型',
    key: 'jumpType',
    width: 170,
    render(row) {
      if (row.jumpType === 'game') {
        return h(NSpace, null, {
          default: () => [
            h(NTag, { size: 'small', type: 'info' }, { default: () => '游戏详情' }),
            getGameName(row.jumpTarget),
          ]
        })
      }
      return h(NSpace, null, {
        default: () => [
          h(NTag, { size: 'small', type: 'warning' }, { default: () => '自定义链接' }),
          row.jumpTarget,
        ]
      })
    }
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    align: 'center' as const,
    render(row) {
      return row.status
        ? h(NTag, { size: 'small', type: 'success' }, { default: () => '启用' })
        : h(NTag, { size: 'small', type: 'default' }, { default: () => '停用' })
    }
  },
  { title: '创建时间', key: 'createdAt', width: 120 },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render(row) {
      return h(NSpace, { justify: 'center' }, {
        default: () => [
          h(NButton, {
            size: 'small',
            quaternary: true,
            onClick: () => openEditDialog(row),
          }, { default: () => '编辑', icon: () => h(NIcon, null, { default: () => h(CreateOutline) }) }),
          h(NButton, {
            size: 'small',
            quaternary: true,
            type: 'error',
            onClick: () => handleDelete(row),
          }, { default: () => '删除', icon: () => h(NIcon, null, { default: () => h(TrashOutline) }) }),
        ]
      })
    }
  },
]

function handleUploadChange({ fileList }: { fileList: UploadFileInfo[] }) {
  if (fileList.length > 0) {
    formData.value.cover = fileList[0].name || 'uploaded.png'
  }
}

function openAddDialog() {
  editingId.value = null
  formData.value = { title: '', cover: '', jumpType: 'game', jumpTarget: '', sortOrder: mockData.value.length + 1, status: true }
  showModal.value = true
}

function openEditDialog(row: BannerItem) {
  editingId.value = row.id
  formData.value = {
    title: row.title,
    cover: row.cover,
    jumpType: row.jumpType,
    jumpTarget: row.jumpTarget,
    sortOrder: row.sortOrder,
    status: row.status,
  }
  showModal.value = true
}

function handleSubmit() {
  formRef.value?.validate((errors) => {
    if (errors) return
    if (editingId.value) {
      const idx = mockData.value.findIndex(b => b.id === editingId.value)
      if (idx > -1) {
        mockData.value[idx] = { ...mockData.value[idx], ...formData.value }
      }
      message.success('Banner 已更新')
    } else {
      mockData.value.unshift({
        id: Date.now(),
        ...formData.value,
        isShowing: formData.value.status,
        createdAt: new Date().toISOString().slice(0, 10),
      })
      message.success('Banner 已新增')
    }
    showModal.value = false
  })
}

function handleDelete(row: BannerItem) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除 "${row.title}" 吗？`,
    positiveText: '确认删除',
    negativeText: '取消',
    onPositiveClick: () => {
      mockData.value = mockData.value.filter(b => b.id !== row.id)
      message.success('Banner 已删除')
    }
  })
}
</script>

<style scoped>
.page-container {
  padding: 24px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}
.page-header h1 {
  font-size: 22px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}
.header-desc {
  color: #94a3b8;
  font-size: 13px;
  margin-top: 4px;
}
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 20px;
}
.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-content {
  display: flex;
  flex-direction: column;
}
.stat-content .label {
  font-size: 13px;
  color: #94a3b8;
}
.stat-content .value {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
}
.stat-content .value.warning { color: #f59e0b; }
.stat-content .value.error { color: #ef4444; }
</style>
