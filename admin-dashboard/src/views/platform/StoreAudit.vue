<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>店铺审核</h1>
        <p class="header-desc">审核店铺入驻申请，管理店铺资质</p>
      </div>
      <n-space>
        <n-select v-model:value="filterStatus" placeholder="全部状态" :options="auditStatusOptions" size="small" style="width: 140px;" clearable />
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
          <span class="label">本月通过</span>
          <span class="value">23</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #EF4444, #DC2626);">
          <n-icon :component="CloseCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">本月驳回</span>
          <span class="value error">5</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="DocumentTextOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">审核通过率</span>
          <span class="value">82.1%</span>
        </div>
      </div>
    </div>

    <div class="content-card">
      <n-data-table :columns="columns" :data="filteredData" :pagination="pagination" striped />
    </div>

    <!-- 审核弹窗 -->
    <n-modal v-model:show="showAuditModal" preset="card" title="店铺入驻审核" style="width: 640px;" :bordered="false">
      <n-descriptions v-if="currentRecord" label-placement="left" :column="2" bordered>
        <n-descriptions-item label="申请店铺">{{ currentRecord.storeName }}</n-descriptions-item>
        <n-descriptions-item label="申请人">{{ currentRecord.applicant }}</n-descriptions-item>
        <n-descriptions-item label="联系电话">{{ currentRecord.phone }}</n-descriptions-item>
        <n-descriptions-item label="申请区域">{{ currentRecord.region }}</n-descriptions-item>
        <n-descriptions-item label="详细地址">{{ currentRecord.address }}</n-descriptions-item>
        <n-descriptions-item label="预计设备数">{{ currentRecord.deviceCount }} 台</n-descriptions-item>
        <n-descriptions-item label="营业执照">{{ currentRecord.businessLicense }}</n-descriptions-item>
        <n-descriptions-item label="申请时间">{{ currentRecord.applyTime }}</n-descriptions-item>
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
        <n-descriptions-item label="申请店铺">{{ currentRecord.storeName }}</n-descriptions-item>
        <n-descriptions-item label="申请人">{{ currentRecord.applicant }}</n-descriptions-item>
        <n-descriptions-item label="联系电话">{{ currentRecord.phone }}</n-descriptions-item>
        <n-descriptions-item label="申请区域">{{ currentRecord.region }}</n-descriptions-item>
        <n-descriptions-item label="详细地址" :span="2">{{ currentRecord.address }}</n-descriptions-item>
        <n-descriptions-item label="预计设备数">{{ currentRecord.deviceCount }} 台</n-descriptions-item>
        <n-descriptions-item label="营业执照">{{ currentRecord.businessLicense }}</n-descriptions-item>
        <n-descriptions-item label="申请时间">{{ currentRecord.applyTime }}</n-descriptions-item>
        <n-descriptions-item label="审核状态">
          <n-tag :type="currentRecord.status === 'pending' ? 'warning' : currentRecord.status === 'approved' ? 'success' : 'error'" size="small">
            {{ currentRecord.statusText }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="审核时间">{{ currentRecord.auditTime || '--' }}</n-descriptions-item>
        <n-descriptions-item label="审核备注" :span="2">{{ currentRecord.auditRemark || '--' }}</n-descriptions-item>
      </n-descriptions>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NButton, NDataTable, NTag, NSpace, NModal, NForm, NFormItem,
  NRadioGroup, NRadio, NInput, NIcon, NDescriptions, NDescriptionsItem, NDivider, useMessage
} from 'naive-ui'
import {
  TimeOutline, CheckmarkCircleOutline, CloseCircleOutline,
  DocumentTextOutline, RefreshOutline, EyeOutline, CreateOutline
} from '@vicons/ionicons5'

const message = useMessage()
const filterStatus = ref<string | null>(null)

const auditStatusOptions = [
  { label: '待审核', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已驳回', value: 'rejected' },
]

const columns = [
  { title: '申请店铺', key: 'storeName', width: 180 },
  { title: '申请人', key: 'applicant', width: 100 },
  { title: '联系电话', key: 'phone', width: 130 },
  { title: '区域', key: 'region', width: 100 },
  { title: '预计设备数', key: 'deviceCount', width: 100 },
  { title: '申请时间', key: 'applyTime', width: 150 },
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
    key: 'actions',
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

const auditData = ref([
  { id: 1, storeName: '重庆解放碑店', applicant: '陈明', phone: '13900139001', region: '重庆', address: '重庆市渝中区解放碑步行街1号', deviceCount: 8, businessLicense: '91500103MA1234567X', applyTime: '2026-04-20 14:30', status: 'pending', statusText: '待审核', auditTime: '', auditRemark: '' },
  { id: 2, storeName: '南京新街口店', applicant: '刘芳', phone: '13900139002', region: '南京', address: '南京市玄武区中山路18号', deviceCount: 12, businessLicense: '91320102MA7654321Y', applyTime: '2026-04-20 10:15', status: 'pending', statusText: '待审核', auditTime: '', auditRemark: '' },
  { id: 3, storeName: '西安钟楼店', applicant: '张伟', phone: '13900139003', region: '西安', address: '西安市碑林区东大街256号', deviceCount: 10, businessLicense: '91610103MAABCDEF0', applyTime: '2026-04-19 16:45', status: 'pending', statusText: '待审核', auditTime: '', auditRemark: '' },
  { id: 4, storeName: '长沙五一广场店', applicant: '李娜', phone: '13900139004', region: '长沙', address: '长沙市芙蓉区五一大道888号', deviceCount: 6, businessLicense: '91430102MAFEDCBA9', applyTime: '2026-04-19 09:30', status: 'approved', statusText: '已通过', auditTime: '2026-04-19 14:20', auditRemark: '资质齐全，审核通过' },
  { id: 5, storeName: '苏州观前街店', applicant: '王强', phone: '13900139005', region: '苏州', address: '苏州市姑苏区观前街168号', deviceCount: 14, businessLicense: '91320508MA1122334', applyTime: '2026-04-18 11:20', status: 'rejected', statusText: '已驳回', auditTime: '2026-04-18 16:00', auditRemark: '营业执照经营范围不符' },
  { id: 6, storeName: '天津滨江道店', applicant: '赵敏', phone: '13900139006', region: '天津', address: '天津市和平区滨江道200号', deviceCount: 9, businessLicense: '91120101MA5566778', applyTime: '2026-04-18 08:45', status: 'approved', statusText: '已通过', auditTime: '2026-04-18 12:30', auditRemark: '审核通过' },
])

const pagination = { pageSize: 10 }

const filteredData = computed(() => {
  let data = [...auditData.value]
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
  const idx = auditData.value.findIndex(d => d.id === currentRecord.value.id)
  if (idx !== -1) {
    auditData.value[idx].status = auditResult.value
    auditData.value[idx].statusText = auditResult.value === 'approve' ? '已通过' : '已驳回'
    auditData.value[idx].auditTime = new Date().toLocaleString('zh-CN')
    auditData.value[idx].auditRemark = auditRemark.value
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
