<template>
  <div class="notice-list">
    <div
      v-for="item in items"
      :key="item.id"
      class="notice-item"
      :class="{ unread: !item.read || forceUnread, highlighted: highlightId === item.detailId }"
      :data-notice-id="(item as any).detailId"
    >
      <!-- 左侧色条 -->
      <div class="notice-color-bar" :class="item.severity"></div>

      <!-- 内容区 -->
      <div class="notice-body">
        <div class="notice-header">
          <h4 class="notice-title">
            <span v-if="!item.read" class="unread-dot"></span>
            {{ item.title }}
          </h4>
          <span class="notice-time">{{ item.time }}</span>
        </div>

        <p class="notice-content" :class="{ 'content-collapsed': !expandedIds.includes(item.id) }">{{ item.content }}</p>

        <n-button
          v-if="item.content.length > 80"
          text size="tiny"
          type="primary"
          @click="toggleExpand(item.id)"
        >
          {{ expandedIds.includes(item.id) ? '收起' : '展开全文' }}
        </n-button>

        <div class="notice-meta-row">
          <n-tag :type="severityType(item.severity)" size="small" :bordered="false">
            {{ severityLabel(item.severity) }}
          </n-tag>
          <n-tag type="info" size="small" :bordered="false">
            {{ typeLabel(item.type) }}
          </n-tag>
          <span v-if="item.sourceEvent" class="source-hint">来源：{{ eventLabel(item.sourceEvent) }}</span>
        </div>
      </div>

      <!-- 操作 -->
      <div class="notice-actions">
        <n-button
          v-if="!item.read"
          size="small"
          quaternary
          type="primary"
          @click="$emit('read', item.id)"
        >标记已读</n-button>
        <n-button
          size="small"
          quaternary
          type="error"
          @click="$emit('delete', item.id)"
        >删除</n-button>
      </div>
    </div>
    <div v-if="!items.length" class="empty-hint">暂无通知</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { NButton, NTag } from 'naive-ui'
import { categoryLabel } from '../../../constants/noticeTypes'

interface SysNotice {
  id: number; title: string; content: string; time: string
  read: boolean; type: string; severity: string; sourceEvent?: string
  detailId?: string
}

const props = defineProps<{
  items: SysNotice[]
  forceUnread?: boolean
  highlightId?: string | null
}>()

defineEmits<{
  (e: 'read', id: number): void
  (e: 'delete', id: number): void
}>()

const expandedIds = ref<number[]>([])

// 高亮时自动展开对应通知
watch(() => props.highlightId, (val) => {
  if (val) {
    const target = props.items.find(n => n.detailId === val)
    if (target && !expandedIds.value.includes(target.id)) {
      expandedIds.value.push(target.id)
    }
  }
}, { immediate: true })

function toggleExpand(id: number) {
  const idx = expandedIds.value.indexOf(id)
  if (idx >= 0) expandedIds.value.splice(idx, 1)
  else expandedIds.value.push(id)
}

function severityType(s: string): 'info' | 'success' | 'warning' | 'error' {
  return { info: 'info', success: 'success', warning: 'warning', error: 'error' }[s] || 'default' as any
}
function severityLabel(s: string): string {
  return { info: '信息', success: '正常', warning: '警告', error: '异常' }[s] || s
}
function typeLabel(t: string): string {
  return categoryLabel(t)
}
function eventLabel(e: string): string {
  return { evt_settlement_create: '结算单生成', evt_order_large: '大额订单', evt_login_anomaly: '异常登录', evt_system_upgrade: '版本更新' }[e] || e
}
</script>

<style scoped>
.notice-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
}

.notice-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: var(--color-bg-elevated);
  border-radius: 10px;
  transition: all 0.2s;
}

.notice-item:hover {
  background: var(--color-bg-elevated-hover);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.notice-item.unread {
  background: rgba(59,130,246,0.04);
  border-left: 3px solid #3B82F6;
}

.notice-item.highlighted {
  background: rgba(59,130,246,0.08);
  box-shadow: 0 0 0 2px rgba(59,130,246,0.15), 0 4px 16px rgba(59,130,246,0.12);
  animation: highlight-pulse 3s ease-out;
}

@keyframes highlight-pulse {
  0% { box-shadow: 0 0 0 4px rgba(59,130,246,0.3), 0 4px 16px rgba(59,130,246,0.2); }
  100% { box-shadow: 0 0 0 2px rgba(59,130,246,0.15), 0 4px 16px rgba(59,130,246,0.12); }
}

/* 左侧色条 */
.notice-color-bar {
  width: 4px;
  border-radius: 4px 0 0 4px;
  flex-shrink: 0;
  align-self: stretch;
}
.notice-color-bar.info     { background: #3B82F6; }
.notice-color-bar.success  { background: #10B981; }
.notice-color-bar.warning  { background: #F59E0B; }
.notice-color-bar.error    { background: #EF4444; }

/* 主体 */
.notice-body {
  flex: 1;
  padding: 16px 0;
  min-width: 0;
}

.notice-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 4px;
}

.notice-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3B82F6;
  flex-shrink: 0;
}

.notice-time {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  flex-shrink: 0;
  margin-left: 12px;
}

.notice-content {
  margin: 4px 0 4px;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
  white-space: pre-line;
  word-break: break-word;
}

.content-collapsed {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notice-meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.source-hint {
  font-size: 11px;
  color: var(--text-muted, #999);
}

/* 操作 */
.notice-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 0 16px 16px;
  flex-shrink: 0;
}

.empty-hint {
  text-align: center;
  padding: 48px 0;
  color: var(--text-muted);
  font-size: 14px;
}
</style>
