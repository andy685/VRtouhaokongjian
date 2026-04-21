<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>短信管理</h1>
      <n-space>
        <n-button type="primary" @click="showSendModal = true">发送短信</n-button>
        <n-button @click="showTemplateModal = true">模板管理</n-button>
      </n-space>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="MailOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">剩余条数</span>
          <span class="value">2,580</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="SendOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">本月发送</span>
          <span class="value success">856</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="CashOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">本月消费</span>
          <span class="value">¥256.80</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
          <n-icon :component="PeopleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">触达人数</span>
          <span class="value">780</span>
        </div>
      </div>
    </div>

    <!-- 发送记录 -->
    <n-card class="table-card">
      <template #header>
        <n-tabs type="line" v-model:value="activeTab">
          <n-tab name="send">发送记录</n-tab>
          <n-tab name="template">常用模板</n-tab>
        </n-tabs>
      </template>
      <n-data-table :columns="columns" :data="tableData" :pagination="pagination" />
    </n-card>

    <!-- 发送短信弹窗 -->
    <n-modal v-model:show="showSendModal" preset="card" title="发送短信" style="width: 560px;">
      <n-form :model="formData" label-placement="top">
        <n-form-item label="发送对象">
          <n-select v-model:value="formData.target" :options="targetOptions" />
        </n-form-item>
        <n-form-item label="选择模板">
          <n-select v-model:value="formData.template" :options="templateOptions" placeholder="或直接输入内容" />
        </n-form-item>
        <n-form-item label="短信内容">
          <n-input v-model:value="formData.content" type="textarea" :rows="4" placeholder="请输入短信内容..." show-count :maxlength="200" />
        </n-form-item>
        <div class="tip-text">注意：营销类短信需遵守相关法规，每条0.1元</div>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showSendModal = false">取消</n-button>
          <n-button type="primary" @click="handleSend">确认发送</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 模板管理弹窗 -->
    <n-modal v-model:show="showTemplateModal" preset="card" title="模板管理" style="width: 600px;">
      <n-data-table :columns="templateColumns" :data="templateData" />
      <template #footer>
        <n-button type="primary" @click="showTemplateModal = false">新增模板</n-button>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import {
  NCard, NDataTable, NButton, NSpace, NInput, NIcon, NModal, NForm,
  NFormItem, NTabs, NTab, NTag, NSelect, NSwitch
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import {
  MailOutline, SendOutline, CashOutline, PeopleOutline, AddOutline
} from '@vicons/ionicons5'

const activeTab = ref('send')
const showSendModal = ref(false)
const showTemplateModal = ref(false)
const formData = ref({
  target: 'members', template: null, content: ''
})
const targetOptions = [
  { label: '全部会员', value: 'members' },
  { label: '活跃会员', value: 'active' },
  { label: '沉睡会员', value: 'dormant' },
  { label: '指定会员', value: 'custom' }
]
const templateOptions = [
  { label: '促销活动通知', value: 'promotion' },
  { label: '会员生日祝福', value: 'birthday' },
  { label: '到期提醒', value: 'expire' }
]
const pagination = { pageSize: 10 }

const columns: DataTableColumns = [
  { title: '发送时间', key: 'sendTime', width: 180 },
  { title: '模板名称', key: 'template', width: 150 },
  { title: '发送数量', key: 'count', width: 100 },
  { title: '成功/失败', key: 'result', width: 120, render: (row) => `${row.success}/${row.failed}` },
  { title: '费用', key: 'fee', width: 80, render: (row) => `¥${row.fee}` },
  { title: '状态', key: 'status', width: 100, render: (row) =>
    h(NTag, { type: row.status === 'success' ? 'success' : row.status === 'failed' ? 'error' : 'warning', size: 'small' },
      { default: () => row.status === 'success' ? '已送达' : row.status === 'failed' ? '发送失败' : '处理中' })
  }
]

const templateColumns: DataTableColumns = [
  { title: '模板名称', key: 'name', width: 150 },
  { title: '内容预览', key: 'content', ellipsis: { tooltip: true } },
  { title: '启用', key: 'enabled', width: 80, render: (row) =>
    h(NSwitch, { value: row.enabled, size: 'small' })
  },
  { title: '操作', key: 'actions', width: 100, render: () =>
    h(NButton, { text: true, type: 'primary', size: 'small' }, { default: () => '编辑' })
  }
]

const tableData = ref([
  { id: 1, sendTime: '2026-04-20 10:30:00', template: '促销活动通知', count: 156, success: 152, failed: 4, fee: 15.60, status: 'success' },
  { id: 2, sendTime: '2026-04-18 15:20:00', template: '会员生日祝福', count: 28, success: 28, failed: 0, fee: 2.80, status: 'success' },
  { id: 3, sendTime: '2026-04-15 09:00:00', template: '到期提醒', count: 86, success: 84, failed: 2, fee: 8.60, status: 'success' },
])

const templateData = ref([
  { id: 1, name: '促销活动通知', content: '亲爱的会员，本店正在举办限时优惠活动，满100减20，快来体验吧！', enabled: true },
  { id: 2, name: '会员生日祝福', content: '生日快乐！为庆祝您的生日，我们准备了专属优惠券，祝您玩得开心！', enabled: true },
  { id: 3, name: '到期提醒', content: '您的会员卡即将到期，为避免影响使用，请及时续费。', enabled: false },
])

function handleSend() {
  showSendModal.value = false
}
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { font-size: 20px; font-weight: 600; color: #333; margin: 0; }
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: #fff; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-content { display: flex; flex-direction: column; gap: 4px; }
.stat-content .label { font-size: 13px; color: #666; }
.stat-content .value { font-size: 24px; font-weight: 600; color: #333; }
.stat-content .value.success { color: #10B981; }
.table-card { border-radius: 12px; }
.tip-text { font-size: 12px; color: #999; margin-top: -8px; }
</style>
