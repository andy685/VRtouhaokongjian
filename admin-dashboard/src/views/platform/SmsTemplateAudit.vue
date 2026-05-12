<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>短信模板审核</h1>
        <p class="header-desc">审核商家提交的短信模板，审核通过后方可使用</p>
      </div>
      <n-space>
        <n-select v-model:value="filterShop" :options="shopOptions" placeholder="全部店铺" clearable style="width: 160px;" />
        <n-select v-model:value="filterStatus" :options="statusOptions" placeholder="全部状态" clearable style="width: 130px;" />
      </n-space>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-num warning">{{ stats.pending }}</div>
        <div class="stat-label">待审核</div>
      </div>
      <div class="stat-card">
        <div class="stat-num success">{{ stats.approved }}</div>
        <div class="stat-label">已通过</div>
      </div>
      <div class="stat-card">
        <div class="stat-num error">{{ stats.rejected }}</div>
        <div class="stat-label">已驳回</div>
      </div>
      <div class="stat-card">
        <div class="stat-num primary">{{ stats.total }}</div>
        <div class="stat-label">总计</div>
      </div>
    </div>

    <!-- 模板列表 -->
    <n-card class="table-card">
      <n-data-table :columns="columns" :data="filteredList" :pagination="{ pageSize: 10 }" striped />
    </n-card>

    <!-- 审核弹窗 -->
    <n-modal v-model:show="showAuditModal" preset="card" title="审核模板" style="width: 600px;" :bordered="false">
      <template v-if="auditTarget">
        <div class="audit-info">
          <div class="info-row"><span class="label">店铺：</span>{{ auditTarget.shopName }}</div>
          <div class="info-row"><span class="label">模板类型：</span>
            <n-tag :type="auditTarget.type === 'promotion' ? 'info' : 'success'" size="small">{{ auditTarget.type === 'promotion' ? '推广短信' : '通知短信' }}</n-tag>
          </div>
          <div class="info-row"><span class="label">模板名称：</span>{{ auditTarget.name }}</div>
          <div class="info-row"><span class="label">提交时间：</span>{{ auditTarget.submittedAt }}</div>
          <div class="info-row content-row"><span class="label">模板内容：</span>
            <div class="content-box">{{ auditTarget.content }}</div>
          </div>
        </div>
        <n-divider />
        <n-form label-placement="top">
          <n-form-item label="审核结果">
            <n-radio-group v-model:value="auditAction">
              <n-radio value="approve" style="color:#10B981;">通过</n-radio>
              <n-radio value="reject" style="color:#EF4444;">驳回</n-radio>
            </n-radio-group>
          </n-form-item>
          <n-form-item v-if="auditAction === 'reject'" label="驳回原因">
            <n-input v-model:value="rejectReason" type="textarea" :rows="3" placeholder="请说明驳回原因，商家将根据此修改后重新提交" />
          </n-form-item>
        </n-form>
      </template>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showAuditModal = false">取消</n-button>
          <n-button v-if="auditAction === 'reject'" type="error" :disabled="!rejectReason" @click="confirmReject">驳回</n-button>
          <n-button v-else type="primary" @click="confirmApprove">审核通过</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { NCard, NDataTable, NButton, NSpace, NIcon, NTag, NModal, NForm, NFormItem, NInput, NSelect, NRadioGroup, NRadio, NDivider, useMessage } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { CheckmarkOutline, CloseOutline } from '@vicons/ionicons5'

const message = useMessage()

type ApprovalStatus = 'pending' | 'approved' | 'rejected'
interface AuditItem {
  id: number; shopName: string; type: string; name: string; content: string
  approvalStatus: ApprovalStatus; rejectReason?: string; submittedAt: string
}

const filterShop = ref<string | null>(null)
const filterStatus = ref<string | null>(null)
const showAuditModal = ref(false)
const auditTarget = ref<AuditItem | null>(null)
const auditAction = ref<'approve' | 'reject'>('approve')
const rejectReason = ref('')

const shopOptions = [
  { label: '卓远亚运城店', value: '卓远亚运城店' },
  { label: '卓远文鼎路店', value: '卓远文鼎路店' },
  { label: '利民街小展厅', value: '利民街小展厅' },
]

const statusOptions = [
  { label: '待审核', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已驳回', value: 'rejected' },
]

const list = ref<AuditItem[]>([
  { id: 1, shopName: '卓远亚运城店', type: 'promotion', name: '暑期大促', content: '暑期特惠！全场VR体验8折起，新会员送50元体验券，快来门店畅玩吧！回T退订', approvalStatus: 'pending', submittedAt: '2026-05-11 14:30' },
  { id: 2, shopName: '卓远亚运城店', type: 'notice', name: '消费确认', content: '【幻彩星空】您本次消费{amount}元，感谢您的光临！', approvalStatus: 'pending', submittedAt: '2026-05-11 10:20' },
  { id: 3, shopName: '卓远文鼎路店', type: 'promotion', name: '新店开业', content: '卓远文鼎路店盛大开业！到店体验即送游戏币50枚，充值满100送30，限时一周！回T退订', approvalStatus: 'pending', submittedAt: '2026-05-10 16:00' },
  { id: 4, shopName: '利民街小展厅', type: 'notice', name: '到期提醒', content: '【幻彩星空】您的会员卡即将到期，请及时续费。回T退订', approvalStatus: 'approved', submittedAt: '2026-05-09 09:15' },
  { id: 5, shopName: '卓远亚运城店', type: 'notice', name: '生日祝福', content: '生日快乐！生日当周体验享8折优惠！', approvalStatus: 'rejected', rejectReason: '模板末尾缺少退订提示"回T退订"', submittedAt: '2026-05-08 11:00' },
  { id: 6, shopName: '卓远文鼎路店', type: 'promotion', name: '会员日活动', content: '每月15日会员日，充值满200送50游戏币，还有双倍游戏豆等你来！回T退订', approvalStatus: 'approved', submittedAt: '2026-05-07 14:00' },
])

const stats = computed(() => ({
  pending: list.value.filter(i => i.approvalStatus === 'pending').length,
  approved: list.value.filter(i => i.approvalStatus === 'approved').length,
  rejected: list.value.filter(i => i.approvalStatus === 'rejected').length,
  total: list.value.length,
}))

const filteredList = computed(() => {
  let data = list.value
  if (filterShop.value) data = data.filter(i => i.shopName === filterShop.value)
  if (filterStatus.value) data = data.filter(i => i.approvalStatus === filterStatus.value)
  // 待审核排最前，按时间倒序
  return data.sort((a, b) => {
    if (a.approvalStatus === 'pending' && b.approvalStatus !== 'pending') return -1
    if (a.approvalStatus !== 'pending' && b.approvalStatus === 'pending') return 1
    return b.id - a.id
  })
})

const columns: DataTableColumns<AuditItem> = [
  { title: '店铺', key: 'shopName', width: 140 },
  { title: '模板类型', key: 'type', width: 100,
    render: (row) => h(NTag, { type: row.type === 'promotion' ? 'info' : 'success', size: 'small' }, () => row.type === 'promotion' ? '推广' : '通知')
  },
  { title: '模板名称', key: 'name', width: 130 },
  { title: '内容预览', key: 'content', ellipsis: { tooltip: true } },
  { title: '状态', key: 'approvalStatus', width: 90,
    render: (row) => h(NTag, {
      type: row.approvalStatus === 'approved' ? 'success' : row.approvalStatus === 'rejected' ? 'error' : 'warning',
      size: 'small'
    }, () => row.approvalStatus === 'approved' ? '已通过' : row.approvalStatus === 'rejected' ? '已驳回' : '待审核')
  },
  { title: '提交时间', key: 'submittedAt', width: 150 },
  { title: '操作', key: 'actions', width: 120,
    render: (row) => {
      if (row.approvalStatus !== 'pending') return null
      return h(NButton, { size: 'tiny', type: 'primary', onClick: () => openAudit(row) }, () => '审核')
    }
  },
]

function openAudit(row: AuditItem) {
  auditTarget.value = row
  auditAction.value = 'approve'
  rejectReason.value = ''
  showAuditModal.value = true
}

function confirmApprove() {
  if (!auditTarget.value) return
  auditTarget.value.approvalStatus = 'approved'
  showAuditModal.value = false
  message.success(`已通过「${auditTarget.value.name}」`)
}

function confirmReject() {
  if (!auditTarget.value || !rejectReason.value) return
  auditTarget.value.approvalStatus = 'rejected'
  auditTarget.value.rejectReason = rejectReason.value
  showAuditModal.value = false
  message.warning(`已驳回「${auditTarget.value.name}」`)
}
</script>

<style scoped>
.page-container { padding: 24px; background: var(--color-bg-base); min-height: calc(100vh - 64px); }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
.page-header h1 { font-size: 20px; font-weight: 600; color: #333; margin: 0 0 4px 0; }
.header-desc { font-size: 13px; color: #999; margin: 0; }
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
.stat-card { background: white; border-radius: 12px; padding: 20px; text-align: center; border: 1px solid #f0f0f0; }
.stat-num { font-size: 28px; font-weight: 700; font-family: 'Orbitron', sans-serif; }
.stat-num.warning { color: #F59E0B; }
.stat-num.success { color: #10B981; }
.stat-num.error { color: #EF4444; }
.stat-num.primary { color: #3B82F6; }
.stat-label { font-size: 13px; color: #999; margin-top: 4px; }
.table-card { border-radius: 12px; }
.audit-info { padding: 8px 0; }
.info-row { display: flex; align-items: flex-start; gap: 8px; padding: 6px 0; font-size: 14px; color: #333; }
.info-row .label { color: #999; width: 80px; flex-shrink: 0; text-align: right; }
.content-row { align-items: flex-start; }
.content-box { background: #f8f9fa; padding: 10px 14px; border-radius: 8px; font-size: 13px; color: #555; line-height: 1.6; white-space: pre-wrap; flex: 1; }
</style>
