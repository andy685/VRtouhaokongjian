<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>消息中心</h1>
      <div class="header-actions">
        <n-button type="primary" size="small" @click="markAllRead">
          全部已读
        </n-button>
      </div>
    </div>

    <div class="message-card">
      <n-tabs v-model:value="activeTab" type="line">
        <!-- 全部消息 -->
        <n-tab-pane name="all" tab="全部">
          <div class="message-list">
            <div v-for="msg in allMessages" :key="msg.id" class="message-item" :class="{ unread: !msg.read }">
              <div class="msg-dot" :class="msg.read ? '' : 'dot-unread'"></div>
              <div class="message-content">
                <div class="message-header">
                  <h4>{{ msg.title }}</h4>
                  <span class="msg-time">{{ msg.time }}</span>
                </div>
                <p :class="{ 'content-collapsed': msg.content.length > 80 && !expandedIds.includes(msg.id) }">{{ msg.content }}</p>
                <n-button v-if="msg.content.length > 80" text size="tiny" type="primary" @click.stop="toggleExpand(msg.id)" class="expand-btn">
                  {{ expandedIds.includes(msg.id) ? '收起' : '展开全文' }}
                </n-button>
                <div class="msg-tags">
                  <n-tag :type="msgTagType(msg.type)" size="small" bordered>{{ msgTagLabel(msg.type) }}</n-tag>
                </div>
              </div>
              <div class="msg-actions">
                <n-button size="tiny" quaternary type="primary" @click="markAsRead(msg.id)" v-if="!msg.read">标为已读</n-button>
                <n-button size="tiny" quaternary @click="deleteMsg(msg.id)">删除</n-button>
              </div>
            </div>
          </div>
        </n-tab-pane>

        <!-- 未读 -->
        <n-tab-pane name="unread" tab="未读">
          <div class="message-list">
            <div v-for="msg in unreadMessages" :key="msg.id" class="message-item unread">
              <div class="msg-dot dot-unread"></div>
              <div class="message-content">
                <div class="message-header">
                  <h4>{{ msg.title }}</h4>
                  <span class="msg-time">{{ msg.time }}</span>
                </div>
                <p :class="{ 'content-collapsed': msg.content.length > 80 && !expandedIds.includes(msg.id) }">{{ msg.content }}</p>
                <n-button v-if="msg.content.length > 80" text size="tiny" type="primary" @click.stop="toggleExpand(msg.id)" class="expand-btn">
                  {{ expandedIds.includes(msg.id) ? '收起' : '展开全文' }}
                </n-button>
                <div class="msg-tags">
                  <n-tag :type="msgTagType(msg.type)" size="small" bordered>{{ msgTagLabel(msg.type) }}</n-tag>
                </div>
              </div>
              <div class="msg-actions">
                <n-button size="tiny" quaternary type="primary" @click="markAsRead(msg.id)">标为已读</n-button>
                <n-button size="tiny" quaternary @click="deleteMsg(msg.id)">删除</n-button>
              </div>
            </div>
            <n-empty v-if="unreadMessages.length === 0" description="暂无未读消息" />
          </div>
        </n-tab-pane>

        <!-- 已读 -->
        <n-tab-pane name="read" tab="已读">
          <div class="message-list">
            <div v-for="msg in readMessages" :key="msg.id" class="message-item">
              <div class="msg-dot"></div>
              <div class="message-content">
                <div class="message-header">
                  <h4>{{ msg.title }}</h4>
                  <span class="msg-time">{{ msg.time }}</span>
                </div>
                <p :class="{ 'content-collapsed': msg.content.length > 80 && !expandedIds.includes(msg.id) }">{{ msg.content }}</p>
                <n-button v-if="msg.content.length > 80" text size="tiny" type="primary" @click.stop="toggleExpand(msg.id)" class="expand-btn">
                  {{ expandedIds.includes(msg.id) ? '收起' : '展开全文' }}
                </n-button>
                <div class="msg-tags">
                  <n-tag :type="msgTagType(msg.type)" size="small" bordered>{{ msgTagLabel(msg.type) }}</n-tag>
                </div>
              </div>
              <div class="msg-actions">
                <n-button size="tiny" quaternary @click="deleteMsg(msg.id)">删除</n-button>
              </div>
            </div>
            <n-empty v-if="readMessages.length === 0" description="暂无已读消息" />
          </div>
        </n-tab-pane>
      </n-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NButton, NTabs, NTabPane, NTag, NEmpty, useMessage } from 'naive-ui'
import { msgTagType, msgTagLabel } from '@/constants/noticeTypes'

const message = useMessage()
const activeTab = ref('all')
const expandedIds = ref<number[]>([])

function toggleExpand(id: number) {
  const idx = expandedIds.value.indexOf(id)
  if (idx >= 0) expandedIds.value.splice(idx, 1)
  else expandedIds.value.push(id)
}

// 代理商视角的示例消息数据
const messages = ref([
  {
    id: 1,
    title: '4月份分润已到账',
    content: '您2026年4月的分润金额 ¥23,520.00 已到账，请注意查收。本月共产生分润记录 156 笔，涉及商家 8 家。',
    time: '2026-04-30 10:00:00',
    type: 'financial',
    read: false,
  },
  {
    id: 2,
    title: '新商家待审核',
    content: '您名下新增一家待审核商家「广州白云体验店」，请及时处理。',
    time: '2026-04-29 16:30:00',
    type: 'announcement',
    read: false,
  },
  {
    id: 3,
    title: '设备离线告警',
    content: '龙岗欢乐时光店 3台设备离线超过24小时，请联系店铺排查。',
    time: '2026-04-28 22:15:00',
    type: 'security',
    read: true,
  },
  {
    id: 4,
    title: '3月分润明细已生成',
    content: '2026年3月分润明细已生成，总金额 ¥19,800.00。点击查看详情。',
    time: '2026-04-01 09:00:00',
    type: 'commission',
    read: true,
  },
  {
    id: 5,
    title: '系统维护通知',
    content: '平台将于2026年5月1日 02:00-06:00 进行系统升级维护，期间部分功能可能不可用。',
    time: '2026-04-27 14:00:00',
    type: 'announcement',
    read: true,
  },
])

const allMessages = computed(() => messages.value)
const unreadMessages = computed(() => messages.value.filter(m => !m.read))
const readMessages = computed(() => messages.value.filter(m => m.read))

function markAsRead(id: number) {
  const m = messages.value.find(x => x.id === id)
  if (m) m.read = true
}
function deleteMsg(id: number) {
  messages.value = messages.value.filter(m => m.id !== id)
  message.success('已删除')
}
function markAllRead() {
  messages.value.forEach(m => (m.read = true))
  message.success('全部标记为已读')
}
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; gap: 12px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.header-desc { font-size: 13px; color: var(--text-muted); margin-top: 4px; flex: 1; }
.header-actions { display: flex; gap: 8px; flex-shrink: 0; }

.message-card { background: white; border-radius: 16px; padding: 20px 24px; border: 1px solid var(--border-color); }

.message-list { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; min-height: 200px; }

.message-item {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 16px; background: var(--color-bg-elevated);
  border-radius: 10px; transition: all 0.2s;
  border-left: 3px solid transparent;
}
.message-item:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
.message-item.unread { background: rgba(245,158,11,0.05); border-left-color: #F59E0B; }

.msg-dot {
  width: 8px; height: 8px; border-radius: 50%;
  flex-shrink: 0; margin-top: 7px;
  background: #E5E7EB;
}
.msg-dot.dot-unread { background: #F59E0B; }

.message-content { flex: 1; min-width: 0; }
.message-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.message-header h4 { font-size: 14px; font-weight: 600; color: var(--text-primary); margin: 0; }
.msg-time { font-size: 12px; color: var(--text-muted); flex-shrink: 0; margin-left: 12px; }
.message-content p { font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin: 4px 0 4px; white-space: pre-line; word-break: break-word; }
.message-content p.content-collapsed { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.expand-btn { margin-bottom: 4px; }
.msg-tags { display: flex; gap: 6px; }

.msg-actions { display: flex; flex-direction: column; gap: 4px; flex-shrink: 0; }
</style>
