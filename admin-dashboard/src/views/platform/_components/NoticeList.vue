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
  return { settlement: '财务结算', order: '订单监控', security: '安全风控', system: '系统公告' }[t] || t
}
function eventLabel(e: string): string {
  return { evt_settlement_create: '结算单生成', evt_order_large: '大额订单', evt_login_anomaly: '异常登录' }[e] || e
}
</script>

<style scoped>
.notice-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.notice-item {
  display: flex;
  align-items: stretch;
  background: var(--color-bg-base, #fafbfc);
  border-radius: 10px;
  border: 1px solid var(--border-color, #eee);
  overflow: hidden;
  transition: all 0.2s;
}

.notice-item:hover {
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  border-color: rgba(59,130,246,0.2);
}

.notice-item.unread {
  background: rgba(59,130,246,0.03);
  border-left: 3px solid #3B82F6;
}

.notice-item.highlighted {
  background: rgba(59,130,246,0.06);
  border-color: #3B82F6;
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
  flex-shrink: 0;
}
.notice-color-bar.info     { background: #3B82F6; }
.notice-color-bar.success  { background: #10B981; }
.notice-color-bar.warning  { background: #F59E0B; }
.notice-color-bar.error    { background: #EF4444; }

/* 主体 */
.notice-body {
  flex: 1;
  padding: 14px 16px;
  min-width: 0;
}

.notice-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.notice-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.unread-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #3B82F6;
  flex-shrink: 0;
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.notice-time {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  flex-shrink: 0;
}

.notice-content {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--text-secondary, #666);
  line-height: 1.7;
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
  margin-top: 10px;
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
  justify-content: center;
  gap: 4px;
  padding: 14px 12px;
  border-left: 1px solid rgba(0,0,0,0.04);
  flex-shrink: 0;
}

.empty-hint {
  text-align: center;
  padding: 48px 0;
  color: var(--text-muted);
  font-size: 14px;
}
</style>
