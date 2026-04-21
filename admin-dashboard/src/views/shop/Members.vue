<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>会员管理</h1>
      <n-space>
        <n-input placeholder="搜索姓名/手机号..." size="small" style="width: 180px;">
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
        <n-button secondary @click="showImportModal = true">批量导入</n-button>
        <n-button type="primary" @click="showAddModal = true">+ 添加会员</n-button>
      </n-space>
    </div>
    
    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="PeopleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">总会员数</span>
          <span class="value">3,856</span>
        </div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="PersonAddOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">今日新增</span>
          <span class="value success">12</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="WalletOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">总余额</span>
          <span class="value">¥52,360</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
          <n-icon :component="StarOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">总积分</span>
          <span class="value">128,900</span>
        </div>
      </div>
    </div>

    <!-- Tab切换 -->
    <n-tabs type="line" animated v-model:value="activeTab">
      <n-tab-pane name="list" tab="会员列表">
        <div class="tab-content">
          <!-- 筛选栏 -->
          <div class="filter-bar">
            <n-select placeholder="会员等级" :options="levelOptions" size="small" style="width: 120px;" />
            <n-select placeholder="充值状态" :options="rechargeOptions" size="small" style="width: 120px;" />
            <n-date-picker type="daterange" clearable size="small" placeholder="注册时间" />
            <n-space>
              <n-button size="small" @click="resetFilter">重置</n-button>
              <n-button type="primary" size="small">筛选</n-button>
            </n-space>
          </div>

          <!-- 会员列表 -->
          <n-data-table :columns="columns" :data="memberData" :pagination="{ pageSize: 10 }" striped />
        </div>
      </n-tab-pane>

      <n-tab-pane name="recharges" tab="充值记录">
        <div class="tab-content">
          <div class="recharge-stats">
            <div class="recharge-stat">
              <span class="label">今日充值</span>
              <span class="value primary">¥3,280</span>
            </div>
            <div class="recharge-stat">
              <span class="label">本周充值</span>
              <span class="value">¥18,560</span>
            </div>
            <div class="recharge-stat">
              <span class="label">本月充值</span>
              <span class="value">¥52,360</span>
            </div>
          </div>
          <n-data-table :columns="rechargeColumns" :data="rechargeData" :pagination="{ pageSize: 10 }" striped />
        </div>
      </n-tab-pane>

      <n-tab-pane name="tags" tab="标签画像">
        <div class="tab-content">
          <n-grid :cols="4" :x-gap="20" :y-gap="20">
            <n-gi v-for="tag in tagGroups" :key="tag.name">
              <div class="tag-card">
                <div class="tag-header">
                  <span class="tag-name">{{ tag.name }}</span>
                  <n-tag size="small">{{ tag.count }}人</n-tag>
                </div>
                <div class="tag-members">
                  <n-avatar v-for="m in tag.members" :key="m" round size="small" :style="{ background: m.color }">{{ m.name[0] }}</n-avatar>
                  <span v-if="tag.members.length < tag.count" class="more">+{{ tag.count - tag.members.length }}</span>
                </div>
              </div>
            </n-gi>
          </n-grid>
        </div>
      </n-tab-pane>
    </n-tabs>

    <!-- 添加会员弹窗 -->
    <n-modal v-model:show="showAddModal" preset="card" title="添加会员" style="width: 500px;" :bordered="false">
      <n-form label-placement="left" :label-width="80">
        <n-form-item label="姓名">
          <n-input placeholder="请输入姓名" />
        </n-form-item>
        <n-form-item label="手机号">
          <n-input placeholder="请输入手机号" />
        </n-form-item>
        <n-form-item label="会员等级">
          <n-select placeholder="选择等级" :options="levelOptions" />
        </n-form-item>
        <n-form-item label="初始充值">
          <n-input placeholder="输入充值金额">
            <template #prefix>¥</template>
          </n-input>
        </n-form-item>
        <n-form-item label="备注">
          <n-input type="textarea" placeholder="备注信息" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showAddModal = false">取消</n-button>
          <n-button type="primary" @click="addMember">确认添加</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 批量导入弹窗 -->
    <n-modal v-model:show="showImportModal" preset="card" title="批量导入会员" style="width: 480px;" :bordered="false">
      <div class="import-area">
        <n-upload drag accept=".xlsx,.xls" :max="1">
          <n-space vertical>
            <n-icon :component="CloudUploadOutline" size="48" color="#3B82F6" />
            <span>点击或拖拽上传 Excel 文件</span>
            <span style="color: var(--text-muted); font-size: 12px;">支持 .xlsx, .xls 格式</span>
          </n-space>
        </n-upload>
        <n-button quaternary size="small" style="margin-top: 12px;" @click="downloadTemplate">下载导入模板</n-button>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showImportModal = false">取消</n-button>
          <n-button type="primary">开始导入</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import {
  NButton, NIcon, NSpace, NInput, NDataTable, NTag, NAvatar,
  NTabs, NTabPane, NSelect, NDatePicker, NGrid, NGi, NModal,
  NForm, NFormItem, NUpload
} from 'naive-ui'
import {
  SearchOutline, PeopleOutline, PersonAddOutline, WalletOutline,
  StarOutline, CloudUploadOutline
} from '@vicons/ionicons5'

const activeTab = ref('list')
const showAddModal = ref(false)
const showImportModal = ref(false)

const levelOptions = [
  { label: '全部等级', value: 'all' },
  { label: '普通会员', value: 'normal' },
  { label: '银卡会员', value: 'silver' },
  { label: '金卡会员', value: 'gold' },
  { label: '钻石会员', value: 'diamond' },
]

const rechargeOptions = [
  { label: '全部', value: 'all' },
  { label: '有余额', value: 'has' },
  { label: '已用完', value: 'empty' },
]

const columns = [
  { title: '会员', key: 'info', render(row: any) {
    return h('div', { style: 'display:flex;align-items:center;gap:10px;' }, [
      h(NAvatar, { round: true, size: 'small', style: `background:linear-gradient(135deg, ${row.color})` }, () => row.name[0]),
      h('div', {}, [
        h('div', { style: 'font-weight:500' }, row.name),
        h('div', { style: 'font-size:11px;color:#94a3b8' }, row.phone)
      ])
    ])
  }},
  { title: '等级', key: 'level', width: 100, render(row: any) {
    const colors: Record<string, string> = { gold: '#F59E0B', silver: '#94A3B8', diamond: '#8B5CF6', normal: '#64748B' }
    return h(NTag, { type: 'default', size: 'small', bordered: true, style: `color:${colors[row.level]};border-color:${colors[row.level]}` }, () => row.levelText)
  }},
  { title: '余额', key: 'balance', width: 100 },
  { title: '积分', key: 'points', width: 100 },
  { title: '累计消费', key: 'totalSpent', width: 110 },
  { title: '最后消费', key: 'lastVisit', width: 100 },
  { title: '注册时间', key: 'registerTime', width: 120 },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    render() {
      return h(NSpace, null, () => [
        h(NButton, { size: 'tiny', secondary: true }, () => '详情'),
        h(NButton, { size: 'tiny', secondary: true }, () => '充值'),
        h(NButton, { size: 'tiny', quaternary: true, type: 'error' }, () => '删除'),
      ])
    }
  }
]

const memberData = ref([
  { name: '张三', phone: '138****1234', level: 'gold', levelText: '金卡', balance: '¥1,280', points: '8,900', totalSpent: '¥12,600', lastVisit: '今天', registerTime: '2025-06-15', color: '#3B82F6,#2563EB' },
  { name: '李四', phone: '139****5678', level: 'silver', levelText: '银卡', balance: '¥520', points: '2,360', totalSpent: '¥3,280', lastVisit: '昨天', registerTime: '2025-08-22', color: '#10B981,#059669' },
  { name: '王五', phone: '137****9012', level: 'normal', levelText: '普通', balance: '¥200', points: '800', totalSpent: '¥980', lastVisit: '3天前', registerTime: '2026-01-10', color: '#F59E0B,#D97706' },
  { name: '赵六', phone: '136****3456', level: 'diamond', levelText: '钻石', balance: '¥5,680', points: '28,500', totalSpent: '¥35,200', lastVisit: '今天', registerTime: '2024-11-05', color: '#8B5CF6,#7C3AED' },
  { name: '孙七', phone: '135****7890', level: 'gold', levelText: '金卡', balance: '¥890', points: '5,200', totalSpent: '¥8,900', lastVisit: '昨天', registerTime: '2025-03-18', color: '#EC4899,#DB2777' },
])

const rechargeColumns = [
  { title: '时间', key: 'time', width: 160 },
  { title: '会员', key: 'member', render(row: any) {
    return h('div', { style: 'display:flex;align-items:center;gap:8px;' }, [
      h(NAvatar, { round: true, size: 'small', style: `background:${row.color}` }, () => row.name[0]),
      h('span', {}, row.name)
    ])
  }},
  { title: '充值金额', key: 'amount', width: 120, render(row: any) {
    return h('span', { style: 'font-weight:600;color:#10B981;' }, `+¥${row.amount}`)
  }},
  { title: '赠送金额', key: 'gift', width: 100, render(row: any) {
    return row.gift > 0 ? h('span', { style: 'color:#F59E0B;' }, `+¥${row.gift}`) : '-'
  }},
  { title: '支付方式', key: 'payment', width: 100 },
  { title: '充值后余额', key: 'balance', width: 120 },
  { title: '操作人', key: 'operator', width: 100 },
]

const rechargeData = ref([
  { time: '2026-04-20 15:30:25', name: '张三', amount: 500, gift: 50, payment: '微信', balance: '¥1,280', operator: '收银员-王小丫', color: '#3B82F6' },
  { time: '2026-04-20 14:20:10', name: '李四', amount: 1000, gift: 120, payment: '支付宝', balance: '¥1,520', operator: '收银员-王小丫', color: '#10B981' },
  { time: '2026-04-20 11:15:33', name: '孙七', amount: 300, gift: 0, payment: '现金', balance: '¥890', operator: '收银员-王小丫', color: '#EC4899' },
  { time: '2026-04-19 18:45:20', name: '赵六', amount: 2000, gift: 300, payment: '微信', balance: '¥5,680', operator: '收银员-王小丫', color: '#8B5CF6' },
])

const tagGroups = ref([
  { name: '高价值会员', count: 45, members: [{ name: '张三', color: '#3B82F6' }, { name: '赵六', color: '#10B981' }, { name: '钱八', color: '#F59E0B' }] },
  { name: '活跃会员', count: 128, members: [{ name: '李四', color: '#10B981' }, { name: '孙七', color: '#EC4899' }] },
  { name: '沉睡会员', count: 86, members: [{ name: '王五', color: '#F59E0B' }, { name: '周九', color: '#8B5CF6' }] },
  { name: '新会员', count: 32, members: [{ name: '吴十', color: '#3B82F6' }] },
])

function resetFilter() { console.log('重置筛选') }
function addMember() {
  console.log('添加会员')
  showAddModal.value = false
}
function downloadTemplate() { console.log('下载模板') }
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); }

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: white; border-radius: 14px; padding: 18px 20px; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 14px; }
.stat-card.highlight { background: linear-gradient(135deg, rgba(16,185,129,0.04), white); border-color: rgba(16,185,129,0.15); }
.stat-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-content { display: flex; flex-direction: column; }
.stat-content .label { font-size: 12px; color: var(--text-muted); }
.stat-content .value { font-family: 'Orbitron', sans-serif; font-size: 22px; font-weight: 700; color: var(--text-primary); }
.stat-content .value.success { color: #10B981; }

.tab-content { padding-top: 16px; }

.filter-bar { display: flex; gap: 12px; margin-bottom: 16px; align-items: center; background: #f8fafc; padding: 12px 16px; border-radius: 10px; }

.recharge-stats { display: flex; gap: 24px; margin-bottom: 20px; background: linear-gradient(135deg, rgba(59,130,246,0.04), rgba(139,92,246,0.04)); padding: 20px 24px; border-radius: 12px; }
.recharge-stat { text-align: center; }
.recharge-stat .label { font-size: 12px; color: var(--text-muted); display: block; }
.recharge-stat .value { font-family: 'Orbitron', sans-serif; font-size: 24px; font-weight: 700; color: var(--text-primary); display: block; margin-top: 4px; }
.recharge-stat .value.primary { color: #3B82F6; }

.tag-card { background: white; border-radius: 12px; padding: 16px; border: 1px solid var(--border-color); }
.tag-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.tag-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.tag-members { display: flex; align-items: center; gap: -8px; }
.tag-members :deep(.n-avatar) { border: 2px solid white; margin-left: -8px; }
.tag-members :deep(.n-avatar:first-child) { margin-left: 0; }
.tag-members .more { font-size: 12px; color: var(--text-muted); margin-left: 8px; }

.import-area { padding: 40px; text-align: center; background: #f8fafc; border-radius: 12px; border: 2px dashed #e2e8f0; }
</style>
