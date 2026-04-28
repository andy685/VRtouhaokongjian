<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>审核管理</h1>
        <p class="header-desc">审核店铺提交的游戏内容和素材</p>
      </div>
      <n-space>
        <n-select v-model:value="filterType" placeholder="审核类型" :options="reviewTypeOptions" size="small" style="width: 120px;" clearable />
        <n-select v-model:value="filterStatus" placeholder="审核状态" :options="statusOptions" size="small" style="width: 120px;" clearable />
        <n-button type="primary" @click="refreshData">
          <template #icon><n-icon :component="RefreshOutline" /></template> 刷新
        </n-button>
      </n-space>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="TimeOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">待审核</span>
          <span class="value warning">8</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="CheckmarkCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">今日通过</span>
          <span class="value">15</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #EF4444, #DC2626);">
          <n-icon :component="CloseCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">今日驳回</span>
          <span class="value error">3</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="DocumentTextOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">累计审核</span>
          <span class="value">2,856</span>
        </div>
      </div>
    </div>

    <div class="content-card">
      <n-data-table :columns="columns" :data="filteredData" :pagination="pagination" striped />
    </div>

    <!-- 审核弹窗 -->
    <n-modal v-model:show="showAuditModal" preset="card" title="内容审核" style="width: 640px;" :bordered="false">
      <n-descriptions v-if="currentRecord" label-placement="left" :column="2" bordered>
        <n-descriptions-item label="提交方">{{ currentRecord.submitter }}</n-descriptions-item>
        <n-descriptions-item label="游戏名称">{{ currentRecord.gameName }}</n-descriptions-item>
        <n-descriptions-item label="审核类型">
          <n-tag :type="currentRecord.type === 'new' ? 'info' : 'warning'" size="small">{{ currentRecord.typeText }}</n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="版本号">{{ currentRecord.version }}</n-descriptions-item>
        <n-descriptions-item label="提交时间">{{ currentRecord.submitTime }}</n-descriptions-item>
        <n-descriptions-item label="提交说明" :span="2">{{ currentRecord.description || '暂无说明' }}</n-descriptions-item>
      </n-descriptions>
      <n-divider />
      <n-form label-placement="left" label-width="80">
        <n-form-item label="审核结果">
          <n-radio-group v-model:value="auditResult">
            <n-radio value="approve">通过</n-radio>
            <n-radio value="reject">驳回</n-radio>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="审核备注">
          <n-input v-model:value="auditRemark" type="textarea" placeholder="请输入审核备注或驳回原因" :rows="3" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showAuditModal = false">取消</n-button>
          <n-button type="primary" @click="confirmAudit">确认审核</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 详情弹窗 -->
    <n-modal v-model:show="showDetailModal" preset="card" title="审核详情" style="width: 600px;" :bordered="false">
      <n-descriptions v-if="currentRecord" label-placement="left" :column="2" bordered>
        <n-descriptions-item label="提交方">{{ currentRecord.submitter }}</n-descriptions-item>
        <n-descriptions-item label="游戏名称">{{ currentRecord.gameName }}</n-descriptions-item>
        <n-descriptions-item label="审核类型">
          <n-tag :type="currentRecord.type === 'new' ? 'info' : 'warning'" size="small">{{ currentRecord.typeText }}</n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="版本号">{{ currentRecord.version }}</n-descriptions-item>
        <n-descriptions-item label="提交时间">{{ currentRecord.submitTime }}</n-descriptions-item>
        <n-descriptions-item label="审核状态">
          <n-tag :type="currentRecord.status === 'pending' ? 'warning' : currentRecord.status === 'approved' ? 'success' : 'error'" size="small">
            {{ currentRecord.statusText }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="审核时间">{{ currentRecord.auditTime || '--' }}</n-descriptions-item>
        <n-descriptions-item label="审核人">{{ currentRecord.auditor || '--' }}</n-descriptions-item>
        <n-descriptions-item label="提交说明" :span="2">{{ currentRecord.description || '--' }}</n-descriptions-item>
        <n-descriptions-item label="审核备注" :span="2">{{ currentRecord.auditRemark || '--' }}</n-descriptions-item>
      </n-descriptions>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NButton, NDataTable, NTag, NSpace, NSelect, NModal, NForm, NFormItem,
  NRadioGroup, NRadio, NInput, NIcon, NDescriptions, NDescriptionsItem, NDivider, useMessage
} from 'naive-ui'
import {
  TimeOutline, CheckmarkCircleOutline, CloseCircleOutline,
  DocumentTextOutline, RefreshOutline, EyeOutline
} from '@vicons/ionicons5'

const message = useMessage()
const filterType = ref<string | null>(null)
const filterStatus = ref<string | null>(null)

const reviewTypeOptions = [
  { label: '新增游戏', value: 'new' },
  { label: '版本更新', value: 'update' },
  { label: '内容调整', value: 'modify' },
]

const statusOptions = [
  { label: '待审核', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已驳回', value: 'rejected' },
]

const columns = [
  { title: '提交方', key: 'submitter', width: 160 },
  { title: '游戏名称', key: 'gameName', width: 140 },
  {
    title: '类型',
    key: 'type',
    width: 100,
    render(row: any) {
      return h(NTag, { type: row.type === 'new' ? 'info' : 'warning', size: 'small', bordered: true }, () => row.typeText)
    }
  },
  { title: '版本', key: 'version', width: 100 },
  { title: '提交时间', key: 'submitTime', width: 150 },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render(row: any) {
      const typeMap: Record<string, string> = { pending: 'warning', approved: 'success', rejected: 'error' }
      return h(NTag, { type: typeMap[row.status] as any, size: 'small', bordered: true }, () => row.statusText)
    }
  },
  { title: '审核时间', key: 'auditTime', width: 150 },
  {
    title: '操作',
    key: 'action',
    width: 160,
    fixed: 'right',
    render(row: any) {
      if (row.status === 'pending') {
        return h(NSpace, { size: 'small' }, {
          default: () => [
            h(NButton, { size: 'tiny', type: 'primary', onClick: () => openAudit(row) }, () => '审核'),
            h(NButton, { size: 'tiny', quaternary: true, type: 'info', onClick: () => openDetail(row) }, {
              default: () => '详情',
              icon: () => h(NIcon, { component: EyeOutline, size: 14 })
            }),
          ]
        })
      }
      return h(NButton, { size: 'tiny', quaternary: true, type: 'info', onClick: () => openDetail(row) }, {
        default: () => '详情',
        icon: () => h(NIcon, { component: EyeOutline, size: 14 })
      })
    }
  },
]

const reviewData = ref([
  { id: 1, submitter: '深圳福田旗舰店', gameName: '丛林探险', type: 'new', typeText: '新增游戏', version: 'v1.0.0', submitTime: '2026-04-20 14:30', status: 'pending', statusText: '待审核', auditTime: '', auditor: '', auditRemark: '', description: '新开发丛林探险主题VR游戏，申请上架' },
  { id: 2, submitter: '南山科技园店', gameName: '过山车VR', type: 'update', typeText: '版本更新', version: 'v2.4.0', submitTime: '2026-04-20 13:45', status: 'pending', statusText: '待审核', auditTime: '', auditor: '', auditRemark: '', description: '优化画面渲染，增加新的过山车场景' },
  { id: 3, submitter: '广州天河店', gameName: '极速赛车', type: 'modify', typeText: '内容调整', version: 'v3.0.5', submitTime: '2026-04-20 11:20', status: 'pending', statusText: '待审核', auditTime: '', auditor: '', auditRemark: '', description: '调整赛车操控灵敏度，修复已知bug' },
  { id: 4, submitter: '北京朝阳店', gameName: '恐怖医院', type: 'update', typeText: '版本更新', version: 'v1.9.0', submitTime: '2026-04-19 16:00', status: 'approved', statusText: '已通过', auditTime: '2026-04-19 18:30', auditor: '管理员', auditRemark: '审核通过，内容合规', description: '新增隐藏关卡和结局' },
  { id: 5, submitter: '上海浦东店', gameName: '海洋世界', type: 'modify', typeText: '内容调整', version: 'v2.1.3', submitTime: '2026-04-18 10:15', status: 'rejected', statusText: '已驳回', auditTime: '2026-04-18 14:20', auditor: '管理员', auditRemark: '素材版权存疑，请补充授权证明', description: '更换部分海洋生物模型' },
])

const pagination = { pageSize: 10 }

const filteredData = computed(() => {
  let data = [...reviewData.value]
  if (filterType.value) {
    data = data.filter(d => d.type === filterType.value)
  }
  if (filterStatus.value) {
    data = data.filter(d => d.status === filterStatus.value)
  }
  return data
})

function refreshData() {
  message.success('数据已刷新')
}

// 审核
const showAuditModal = ref(false)
const currentRecord = ref<any>(null)
const auditResult = ref('approve')
const auditRemark = ref('')

function openAudit(row: any) {
  currentRecord.value = row
  auditResult.value = 'approve'
  auditRemark.value = ''
  showAuditModal.value = true
}

function confirmAudit() {
  const idx = reviewData.value.findIndex(d => d.id === currentRecord.value.id)
  if (idx !== -1) {
    reviewData.value[idx].status = auditResult.value
    reviewData.value[idx].statusText = auditResult.value === 'approve' ? '已通过' : '已驳回'
    reviewData.value[idx].auditTime = new Date().toLocaleString('zh-CN')
    reviewData.value[idx].auditor = '管理员'
    reviewData.value[idx].auditRemark = auditRemark.value
    message.success(auditResult.value === 'approve' ? '审核已通过' : '审核已驳回')
  }
  showAuditModal.value = false
}

// 详情
const showDetailModal = ref(false)

function openDetail(row: any) {
  currentRecord.value = row
  showDetailModal.value = true
}
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.header-desc { font-size: 13px; color: var(--text-muted); margin-top: 4px; display: block; }

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: white; border-radius: 14px; padding: 20px; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 16px; }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-content { display: flex; flex-direction: column; }
.stat-content .label { font-size: 12px; color: var(--text-muted); }
.stat-content .value { font-family: 'Orbitron', sans-serif; font-size: 22px; font-weight: 700; color: var(--text-primary); }
.stat-content .value.warning { color: #F59E0B; }
.stat-content .value.error { color: #EF4444; }

.content-card { background: white; border-radius: 16px; padding: 24px; border: 1px solid var(--border-color); }
</style>
