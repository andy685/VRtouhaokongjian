<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>消息通知</h1>
        <p class="header-desc">审核结果、结算到账及系统公告通知</p>
      </div>
      <n-space>
        <n-button size="small" @click="markAllRead">全部已读</n-button>
        <n-button size="small" secondary @click="clearAll">清空消息</n-button>
      </n-space>
    </div>

    <div class="message-card">
      <n-tabs v-model:value="activeTab" type="line">
        <n-tab-pane name="all" tab="全部">
          <div class="msg-list">
            <div v-for="msg in allMessages" :key="msg.id" class="msg-item" :class="{ unread: !msg.read }" @click="readMsg(msg)">
              <div class="msg-dot" v-if="!msg.read"></div>
              <div class="msg-content">
                <div class="msg-header">
                  <h4>{{ msg.title }}</h4>
                  <span class="msg-time">{{ msg.time }}</span>
                </div>
                <p class="msg-body">{{ msg.content }}</p>
                <n-tag :type="msgTagType(msg.type)" size="tiny" bordered>{{ msgTagLabel(msg.type) }}</n-tag>
              </div>
            </div>
          </div>
        </n-tab-pane>
        <n-tab-pane name="unread" tab="未读">
          <div class="msg-list">
            <div v-for="msg in unreadMessages" :key="msg.id" class="msg-item unread" @click="readMsg(msg)">
              <div class="msg-dot"></div>
              <div class="msg-content">
                <div class="msg-header">
                  <h4>{{ msg.title }}</h4>
                  <span class="msg-time">{{ msg.time }}</span>
                </div>
                <p class="msg-body">{{ msg.content }}</p>
                <n-tag :type="msgTagType(msg.type)" size="tiny" bordered>{{ msgTagLabel(msg.type) }}</n-tag>
              </div>
            </div>
          </div>
          <n-empty v-if="!unreadMessages.length" description="暂无未读消息" style="padding: 40px;" />
        </n-tab-pane>
        <n-tab-pane name="review" tab="审核通知">
          <div class="msg-list">
            <div v-for="msg in reviewMessages" :key="msg.id" class="msg-item" :class="{ unread: !msg.read }" @click="readMsg(msg)">
              <div class="msg-dot" v-if="!msg.read"></div>
              <div class="msg-content">
                <div class="msg-header">
                  <h4>{{ msg.title }}</h4>
                  <span class="msg-time">{{ msg.time }}</span>
                </div>
                <p class="msg-body">{{ msg.content }}</p>
              </div>
            </div>
          </div>
        </n-tab-pane>
        <n-tab-pane name="settlement" tab="结算通知">
          <div class="msg-list">
            <div v-for="msg in settlementMessages" :key="msg.id" class="msg-item" :class="{ unread: !msg.read }" @click="readMsg(msg)">
              <div class="msg-dot" v-if="!msg.read"></div>
              <div class="msg-content">
                <div class="msg-header">
                  <h4>{{ msg.title }}</h4>
                  <span class="msg-time">{{ msg.time }}</span>
                </div>
                <p class="msg-body">{{ msg.content }}</p>
              </div>
            </div>
          </div>
        </n-tab-pane>
        <n-tab-pane name="system" tab="系统公告">
          <div class="msg-list">
            <div v-for="msg in systemMessages" :key="msg.id" class="msg-item" :class="{ unread: !msg.read }" @click="readMsg(msg)">
              <div class="msg-dot" v-if="!msg.read"></div>
              <div class="msg-content">
                <div class="msg-header">
                  <h4>{{ msg.title }}</h4>
                  <span class="msg-time">{{ msg.time }}</span>
                </div>
                <p class="msg-body">{{ msg.content }}</p>
              </div>
            </div>
          </div>
        </n-tab-pane>
      </n-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NButton, NTabs, NTabPane, NTag, NSpace, NEmpty } from 'naive-ui'

const activeTab = ref('all')

interface CpMessage {
  id: number
  title: string
  content: string
  time: string
  type: 'review' | 'settlement' | 'system'
  read: boolean
}

const messages = ref<CpMessage[]>([
  { id: 1, title: '结算到账通知', content: '2026-05 结算周期已到账 ¥107,722（扣除手续费 ¥2,198），请查看结算记录。', time: '2026-05-28 10:30', type: 'settlement', read: false },
  { id: 2, title: '游戏审核通过', content: '您提交的游戏「过山车VR 2.0」已通过平台审核，游戏豆定价 ¥8/次，单次成本 ¥2.40，即日起上线运营。', time: '2026-05-20 14:15', type: 'review', read: false },
  { id: 3, title: '游戏审核不通过', content: '您提交的游戏「末日求生」未通过审核，原因：游戏内容与描述不符，请修改后重新提交。', time: '2026-05-18 09:20', type: 'review', read: true },
  { id: 4, title: '结算到账通知', content: '2026-04 结算周期已到账 ¥66,679（扣除手续费 ¥1,361），请查看结算记录。', time: '2026-04-28 09:15', type: 'settlement', read: true },
  { id: 5, title: '系统维护通知', content: '头号空间平台将于2026-06-15 02:00-04:00进行系统维护升级，届时CP后台可能短暂不可用，请提前做好安排。', time: '2026-05-30 18:00', type: 'system', read: true },
  { id: 6, title: '合作协议更新', content: '《头号空间CP合作协议》已更新至 v2.3 版本，主要修订了结算费率条款，请在账户设置中查看并确认。', time: '2026-05-25 11:00', type: 'system', read: false },
  { id: 7, title: '供应商资质审核通过', content: '您的供应商资质（营业执照、法人身份）已通过平台审核，可正常上传游戏内容。', time: '2026-05-10 16:00', type: 'review', read: true },
  { id: 8, title: '新年活动邀请', content: '头号空间春节VR游戏专题活动即将开启，诚邀您参与活动报名，优质内容可获得首页推荐位。', time: '2026-05-08 10:00', type: 'system', read: true },
])

const allMessages = computed(() => messages.value)
const unreadMessages = computed(() => messages.value.filter(m => !m.read))
const reviewMessages = computed(() => messages.value.filter(m => m.type === 'review'))
const settlementMessages = computed(() => messages.value.filter(m => m.type === 'settlement'))
const systemMessages = computed(() => messages.value.filter(m => m.type === 'system'))

function msgTagType(type: string) {
  const m: Record<string, any> = { review: 'warning', settlement: 'success', system: 'info' }
  return m[type] || 'default'
}
function msgTagLabel(type: string) {
  const m: Record<string, string> = { review: '审核通知', settlement: '结算通知', system: '系统公告' }
  return m[type] || type
}

function readMsg(msg: CpMessage) { msg.read = true }
function markAllRead() { messages.value.forEach(m => m.read = true) }
function clearAll() { messages.value = [] }
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.header-desc { font-size: 13px; color: var(--text-muted); margin-top: 4px; }

.message-card { background: white; border-radius: 14px; padding: 24px; border: 1px solid var(--border-color); }

.msg-list { display: flex; flex-direction: column; gap: 10px; margin-top: 8px; }
.msg-item {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 16px; background: var(--color-bg-elevated); border-radius: 10px;
  cursor: pointer; transition: all 0.2s;
}
.msg-item:hover { background: var(--color-bg-elevated-hover); box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.msg-item.unread { background: rgba(16,185,129,0.04); border-left: 3px solid #10B981; }

.msg-dot { width: 8px; height: 8px; border-radius: 50%; background: #10B981; flex-shrink: 0; margin-top: 6px; }

.msg-content { flex: 1; min-width: 0; }
.msg-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
.msg-header h4 { font-size: 14px; font-weight: 600; color: var(--text-primary); margin: 0; }
.msg-time { font-size: 12px; color: var(--text-muted); white-space: nowrap; margin-left: 12px; }
.msg-body { font-size: 13px; color: var(--text-secondary); margin: 4px 0 8px; line-height: 1.5; }
</style>
