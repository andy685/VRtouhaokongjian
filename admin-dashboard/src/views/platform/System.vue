<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>系统运维中心</h1>
    </div>

    <!-- 系统状态概览 -->
    <div class="metrics-row">
      <div class="metric-card">
        <div class="metric-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="ServerOutline" size="22" color="#fff" />
        </div>
        <div class="metric-content">
          <span class="label">系统状态</span>
          <span class="value success">运行正常</span>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="HardwareChipOutline" size="22" color="#fff" />
        </div>
        <div class="metric-content">
          <span class="label">CPU使用率</span>
          <span class="value">32%</span>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="ServerOutline" size="22" color="#fff" />
        </div>
        <div class="metric-content">
          <span class="label">内存使用</span>
          <span class="value">48%</span>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
          <n-icon :component="CloudOutline" size="22" color="#fff" />
        </div>
        <div class="metric-content">
          <span class="label">API可用性</span>
          <span class="value">99.98%</span>
        </div>
      </div>
    </div>

    <!-- Tab切换 -->
    <n-tabs type="line" animated v-model:value="activeTab">
      <!-- 版本发布 -->
      <n-tab-pane name="versions" tab="🚀 版本发布">
        <div class="tab-content">
          <div class="release-header">
            <n-select placeholder="选择版本" :options="versionOptions" style="width: 200px;" />
            <n-button type="primary">新建发布</n-button>
          </div>

          <div class="section-card">
            <div class="section-header">
              <h3>版本列表</h3>
            </div>
            <n-data-table :columns="versionColumns" :data="versionData" :pagination="{ pageSize: 10 }" striped />
          </div>
        </div>
      </n-tab-pane>

      <!-- 告警中心 -->
      <n-tab-pane name="alerts" tab="🔔 告警中心">
        <div class="tab-content">
          <n-grid :cols="4" :x-gap="20" :y-gap="20" style="margin-bottom: 20px;">
            <n-gi>
              <div class="stat-card success"><span class="label">正常</span><span class="value">128</span></div>
            </n-gi>
            <n-gi>
              <div class="stat-card warning"><span class="label">警告</span><span class="value">8</span></div>
            </n-gi>
            <n-gi>
              <div class="stat-card error"><span class="label">严重</span><span class="value">2</span></div>
            </n-gi>
            <n-gi>
              <div class="stat-card"><span class="label">已恢复</span><span class="value">15</span></div>
            </n-gi>
          </n-grid>

          <div class="section-card">
            <div class="section-header">
              <h3>活跃告警</h3>
              <n-space>
                <n-select placeholder="告警级别" :options="alertLevelOptions" style="width: 100px;" />
                <n-button size="small">全部处理</n-button>
              </n-space>
            </div>
            <n-data-table :columns="alertColumns" :data="alertData" :pagination="{ pageSize: 10 }" striped />
          </div>
        </div>
      </n-tab-pane>

      <!-- 操作日志 -->
      <n-tab-pane name="logs" tab="📝 操作日志">
        <div class="tab-content">
          <div class="logs-header">
            <n-date-picker type="daterange" clearable size="small" v-model:value="dateRange" />
            <n-input placeholder="搜索操作人/操作内容..." size="small" style="width: 220px;">
              <template #prefix><n-icon :component="SearchOutline" /></template>
            </n-input>
            <n-select placeholder="操作类型" :options="logTypeOptions" style="width: 140px;" />
          </div>

          <div class="section-card">
            <n-data-table :columns="logColumns" :data="logData" :pagination="{ pageSize: 15 }" striped />
          </div>
        </div>
      </n-tab-pane>

      <!-- 工单系统 -->
      <n-tab-pane name="tickets" tab="🎫 工单系统">
        <div class="tab-content">
          <n-grid :cols="4" :x-gap="20" :y-gap="20" style="margin-bottom: 20px;">
            <n-gi>
              <div class="stat-card warning"><span class="label">待处理</span><span class="value">12</span></div>
            </n-gi>
            <n-gi>
              <div class="stat-card"><span class="label">处理中</span><span class="value">8</span></div>
            </n-gi>
            <n-gi>
              <div class="stat-card success"><span class="label">已完成</span><span class="value">156</span></div>
            </n-gi>
            <n-gi>
              <div class="stat-card error"><span class="label">紧急</span><span class="value">3</span></div>
            </n-gi>
          </n-grid>

          <div class="section-card">
            <div class="section-header">
              <h3>工单列表</h3>
              <n-button type="primary" size="small">创建工单</n-button>
            </div>
            <n-data-table :columns="ticketColumns" :data="ticketData" :pagination="{ pageSize: 10 }" striped />
          </div>
        </div>
      </n-tab-pane>

      <!-- 帮助中心 -->
      <n-tab-pane name="help" tab="❓ 帮助中心">
        <div class="tab-content">
          <div class="help-grid">
            <div class="help-card" v-for="item in helpItems" :key="item.title">
              <div class="help-icon" :style="{ background: item.gradient }">
                <n-icon :component="item.icon" size="28" color="#fff" />
              </div>
              <h4>{{ item.title }}</h4>
              <p>{{ item.desc }}</p>
              <n-button size="small" secondary>查看详情</n-button>
            </div>
          </div>
        </div>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import {
  NButton, NIcon, NSpace, NTabs, NTabPane, NGrid, NGi,
  NDataTable, NTag, NInput, NSelect, NDatePicker
} from 'naive-ui'
import {
  ServerOutline, HardwareChipOutline, CloudOutline,
  SearchOutline, DocumentTextOutline, ConstructOutline, CallOutline,
  BookOutline
} from '@vicons/ionicons5'

const activeTab = ref('versions')
const dateRange = ref(null)

const versionOptions = [
  { label: '全部版本', value: 'all' },
  { label: 'v2.5.0', value: '2.5.0' },
  { label: 'v2.4.0', value: '2.4.0' },
]

const alertLevelOptions = [
  { label: '全部', value: 'all' },
  { label: '严重', value: 'critical' },
  { label: '警告', value: 'warning' },
]

const logTypeOptions = [
  { label: '全部', value: 'all' },
  { label: '登录', value: 'login' },
  { label: '配置变更', value: 'config' },
  { label: '数据操作', value: 'data' },
]

// 版本列表
const versionColumns = [
  { title: '版本号', key: 'version', render: (row: any) => h(NTag, { type: row.current ? 'success' : 'default', size: 'small' }, () => row.version + (row.current ? ' (当前)' : '')) },
  { title: '发布类型', key: 'type', render: (row: any) => h(NTag, { type: row.type === 'major' ? 'error' : row.type === 'minor' ? 'warning' : 'info', size: 'small' }, () => row.typeText) },
  { title: '更新说明', key: 'desc' },
  { title: '发布状态', key: 'status', render: (row: any) => h(NTag, { type: row.status === 'released' ? 'success' : row.status === 'testing' ? 'warning' : 'info', size: 'small' }, () => row.statusText) },
  { title: '发布时间', key: 'time' },
  { title: '操作', key: 'action', render: () => h(NButton, { size: 'tiny', secondary: true }, () => '详情') },
]

const versionData = [
  { version: 'v2.5.0', current: true, type: 'major', typeText: '大版本', desc: '新增多语言支持、优化UI组件库、修复若干Bug', status: 'released', statusText: '已发布', time: '2026-04-15' },
  { version: 'v2.4.2', current: false, type: 'patch', typeText: '补丁', desc: '修复财务报表导出问题、优化加载速度', status: 'released', statusText: '已发布', time: '2026-04-10' },
  { version: 'v2.4.1', current: false, type: 'patch', typeText: '补丁', desc: '修复设备列表显示异常', status: 'released', statusText: '已发布', time: '2026-04-05' },
  { version: 'v2.5.1', current: false, type: 'minor', typeText: '小版本', desc: '新增数据导出功能、优化搜索性能', status: 'testing', statusText: '测试中', time: '-' },
]

// 告警列表
const alertColumns = [
  { title: '告警级别', key: 'level', render: (row: any) => h(NTag, { type: row.level === 'critical' ? 'error' : 'warning', size: 'small' }, () => row.levelText) },
  { title: '告警类型', key: 'type' },
  { title: '告警内容', key: 'content' },
  { title: '触发时间', key: 'time' },
  { title: '持续时间', key: 'duration' },
  { title: '状态', key: 'status', render: (row: any) => h(NTag, { type: row.status === 'active' ? 'error' : 'success', size: 'small' }, () => row.statusText) },
  { title: '操作', key: 'action', render: () => h(NButton, { size: 'tiny', secondary: true }, () => '处理') },
]

const alertData = [
  { level: 'critical', levelText: '严重', type: '服务异常', content: '深圳福田店 - 收银API响应超时', time: '2026-04-20 15:30', duration: '5分钟', status: 'active', statusText: '活跃' },
  { level: 'critical', levelText: '严重', type: '数据异常', content: '数据库连接数接近上限', time: '2026-04-20 14:20', duration: '1小时15分', status: 'active', statusText: '活跃' },
  { level: 'warning', levelText: '警告', type: '性能预警', content: 'API平均响应时间 > 500ms', time: '2026-04-20 12:00', duration: '3小时', status: 'resolved', statusText: '已恢复' },
  { level: 'warning', levelText: '警告', type: '容量预警', content: '文件存储使用率 > 80%', time: '2026-04-19 10:00', duration: '1天', status: 'resolved', statusText: '已恢复' },
]

// 操作日志
const logColumns = [
  { title: '时间', key: 'time', width: 160 },
  { title: '操作人', key: 'operator' },
  { title: '操作类型', key: 'type', render: (row: any) => h(NTag, { type: row.type === 'login' ? 'info' : row.type === 'config' ? 'warning' : 'default', size: 'small' }, () => row.typeText) },
  { title: '操作内容', key: 'content' },
  { title: 'IP地址', key: 'ip' },
  { title: '结果', key: 'result', render: (row: any) => h(NTag, { type: row.result === 'success' ? 'success' : 'error', size: 'small' }, () => row.resultText) },
]

const logData = [
  { time: '2026-04-20 15:35:22', operator: '张三 (admin)', type: 'config', typeText: '配置变更', content: '修改门店「深圳福田店」结算周期为T+1', ip: '192.168.1.100', result: 'success', resultText: '成功' },
  { time: '2026-04-20 15:20:08', operator: '李四 (admin)', type: 'login', typeText: '登录', content: '后台登录成功', ip: '192.168.1.105', result: 'success', resultText: '成功' },
  { time: '2026-04-20 14:50:33', operator: '王五 (finance)', type: 'data', typeText: '数据操作', content: '导出2026年3月财务报表', ip: '192.168.1.110', result: 'success', resultText: '成功' },
  { time: '2026-04-20 14:30:15', operator: '赵六 (operator)', type: 'config', typeText: '配置变更', content: '新增游戏「丛林探险」到游戏库', ip: '192.168.1.120', result: 'success', resultText: '成功' },
  { time: '2026-04-20 11:25:00', operator: '系统', type: 'system', typeText: '系统', content: '自动执行数据库备份', ip: '127.0.0.1', result: 'success', resultText: '成功' },
]

// 工单列表
const ticketColumns = [
  { title: '工单号', key: 'no', width: 140 },
  { title: '类型', key: 'type', render: (row: any) => h(NTag, { type: row.type === 'bug' ? 'error' : row.type === 'suggestion' ? 'info' : 'warning', size: 'small' }, () => row.typeText) },
  { title: '标题', key: 'title' },
  { title: '提交人', key: 'submitter' },
  { title: '提交时间', key: 'time' },
  { title: '优先级', key: 'priority', render: (row: any) => h(NTag, { type: row.priority === 'urgent' ? 'error' : row.priority === 'high' ? 'warning' : 'default', size: 'small' }, () => row.priorityText) },
  { title: '状态', key: 'status', render: (row: any) => h(NTag, { type: row.status === 'pending' ? 'warning' : row.status === 'processing' ? 'info' : 'success', size: 'small' }, () => row.statusText) },
  { title: '操作', key: 'action', render: () => h(NButton, { size: 'tiny', secondary: true }, () => '处理') },
]

const ticketData = [
  { no: 'TK202604001', type: 'bug', typeText: 'Bug反馈', title: '财务报表数据与实际不符', submitter: '深圳福田店', time: '2026-04-20 14:30', priority: 'urgent', priorityText: '紧急', status: 'pending', statusText: '待处理' },
  { no: 'TK202604002', type: 'suggestion', typeText: '功能建议', title: '希望增加批量导出功能', submitter: '南山科技园店', time: '2026-04-20 11:20', priority: 'normal', priorityText: '普通', status: 'pending', statusText: '待处理' },
  { no: 'TK202604003', type: 'consult', typeText: '问题咨询', title: 'Token配置相关问题咨询', submitter: '广州天河店', time: '2026-04-20 10:15', priority: 'high', priorityText: '高', status: 'processing', statusText: '处理中' },
]

// 帮助中心
const helpItems = [
  { title: '使用文档', desc: '系统功能详细说明', icon: BookOutline, gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)' },
  { title: '运维指南', desc: '日常运维操作手册', icon: DocumentTextOutline, gradient: 'linear-gradient(135deg, #10B981, #059669)' },
  { title: '常见问题', desc: 'FAQ问题解答', icon: CallOutline, gradient: 'linear-gradient(135deg, #F59E0B, #D97706)' },
  { title: '技术支持', desc: '联系技术支持团队', icon: ConstructOutline, gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' },
]
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); }

.metrics-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.metric-card { background: white; border-radius: 14px; padding: 20px; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 16px; }
.metric-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.metric-content { display: flex; flex-direction: column; }
.metric-content .label { font-size: 12px; color: var(--text-muted); }
.metric-content .value { font-size: 18px; font-weight: 700; color: var(--text-primary); }
.metric-content .value.success { color: #10B981; }

.tab-content { padding-top: 16px; }

.release-header { display: flex; justify-content: space-between; margin-bottom: 20px; }

.section-card { background: white; border-radius: 16px; padding: 22px; border: 1px solid var(--border-color); }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-header h3 { font-size: 15px; font-weight: 600; color: var(--text-primary); }

.stat-card { background: white; border-radius: 12px; padding: 20px; text-align: center; border: 1px solid var(--border-color); }
.stat-card .label { font-size: 12px; color: var(--text-muted); display: block; }
.stat-card .value { font-family: 'Orbitron', sans-serif; font-size: 26px; font-weight: 700; color: var(--text-primary); display: block; margin: 8px 0; }
.stat-card.success { border-color: rgba(16,185,129,0.3); background: linear-gradient(180deg, rgba(16,185,129,0.05), white); }
.stat-card.warning { border-color: rgba(245,158,11,0.3); background: linear-gradient(180deg, rgba(245,158,11,0.05), white); }
.stat-card.error { border-color: rgba(239,68,68,0.3); background: linear-gradient(180deg, rgba(239,68,68,0.05), white); }

.logs-header { display: flex; gap: 12px; margin-bottom: 20px; align-items: center; }

.help-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.help-card { background: white; border-radius: 16px; padding: 28px; text-align: center; border: 1px solid var(--border-color); }
.help-icon { width: 60px; height: 60px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
.help-card h4 { font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px; }
.help-card p { font-size: 13px; color: var(--text-muted); margin-bottom: 16px; }
</style>
