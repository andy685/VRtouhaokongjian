<template>
  <div class="page-container">
    <n-breadcrumb class="page-breadcrumb">
      <n-breadcrumb-item>主页</n-breadcrumb-item>
      <n-breadcrumb-item>用户设置</n-breadcrumb-item>
      <n-breadcrumb-item>消息中心</n-breadcrumb-item>
    </n-breadcrumb>

    <div class="page-header">
      <h1 class="page-title">消息中心</h1>
      <div class="header-actions">
        <n-button type="primary" size="small">
          全部已读
        </n-button>
        <n-button size="small" secondary>
          清空消息
        </n-button>
      </div>
    </div>

    <div class="message-card">
      <div class="message-tabs">
        <n-tabs v-model:value="activeTab" type="line">
          <n-tab-pane name="all" tab="全部">
            <div class="message-list">
              <div v-for="message in allMessages" :key="message.id" class="message-item" :class="{ 'unread': !message.read }">
                <div class="message-content">
                  <div class="message-header">
                    <h4 class="message-title">{{ message.title }}</h4>
                    <span class="message-time">{{ message.time }}</span>
                  </div>
                  <p class="message-body">{{ message.content }}</p>
                  <div class="message-tags">
                    <n-tag v-if="message.type === 'system'" type="info" size="small">系统通知</n-tag>
                    <n-tag v-else-if="message.type === 'order'" type="success" size="small">订单通知</n-tag>
                    <n-tag v-else-if="message.type === 'activity'" type="warning" size="small">活动通知</n-tag>
                    <n-tag v-else-if="message.type === 'security'" type="error" size="small">安全通知</n-tag>
                  </div>
                </div>
                <div class="message-actions">
                  <n-button size="small" quaternary @click="markAsRead(message.id)">
                    {{ message.read ? '已读' : '标记已读' }}
                  </n-button>
                  <n-button size="small" quaternary @click="deleteMessage(message.id)">
                    删除
                  </n-button>
                </div>
              </div>
            </div>
          </n-tab-pane>
          <n-tab-pane name="unread" tab="未读">
            <div class="message-list">
              <div v-for="message in unreadMessages" :key="message.id" class="message-item unread">
                <div class="message-content">
                  <div class="message-header">
                    <h4 class="message-title">{{ message.title }}</h4>
                    <span class="message-time">{{ message.time }}</span>
                  </div>
                  <p class="message-body">{{ message.content }}</p>
                  <div class="message-tags">
                    <n-tag v-if="message.type === 'system'" type="info" size="small">系统通知</n-tag>
                    <n-tag v-else-if="message.type === 'order'" type="success" size="small">订单通知</n-tag>
                    <n-tag v-else-if="message.type === 'activity'" type="warning" size="small">活动通知</n-tag>
                    <n-tag v-else-if="message.type === 'security'" type="error" size="small">安全通知</n-tag>
                  </div>
                </div>
                <div class="message-actions">
                  <n-button size="small" quaternary @click="markAsRead(message.id)">
                    标记已读
                  </n-button>
                  <n-button size="small" quaternary @click="deleteMessage(message.id)">
                    删除
                  </n-button>
                </div>
              </div>
            </div>
          </n-tab-pane>
          <n-tab-pane name="system" tab="系统通知">
            <div class="message-list">
              <div v-for="message in systemMessages" :key="message.id" class="message-item" :class="{ 'unread': !message.read }">
                <div class="message-content">
                  <div class="message-header">
                    <h4 class="message-title">{{ message.title }}</h4>
                    <span class="message-time">{{ message.time }}</span>
                  </div>
                  <p class="message-body">{{ message.content }}</p>
                </div>
                <div class="message-actions">
                  <n-button size="small" quaternary @click="markAsRead(message.id)">
                    {{ message.read ? '已读' : '标记已读' }}
                  </n-button>
                  <n-button size="small" quaternary @click="deleteMessage(message.id)">
                    删除
                  </n-button>
                </div>
              </div>
            </div>
          </n-tab-pane>
          <n-tab-pane name="order" tab="订单通知">
            <div class="message-list">
              <div v-for="message in orderMessages" :key="message.id" class="message-item" :class="{ 'unread': !message.read }">
                <div class="message-content">
                  <div class="message-header">
                    <h4 class="message-title">{{ message.title }}</h4>
                    <span class="message-time">{{ message.time }}</span>
                  </div>
                  <p class="message-body">{{ message.content }}</p>
                </div>
                <div class="message-actions">
                  <n-button size="small" quaternary @click="markAsRead(message.id)">
                    {{ message.read ? '已读' : '标记已读' }}
                  </n-button>
                  <n-button size="small" quaternary @click="deleteMessage(message.id)">
                    删除
                  </n-button>
                </div>
              </div>
            </div>
          </n-tab-pane>
        </n-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NBreadcrumb, NBreadcrumbItem, NButton, NTabs, NTabPane, NTag } from 'naive-ui'

const activeTab = ref('all')

const messages = ref([
  { id: 1, title: '系统更新通知', content: '系统将于2023-09-18 00:00-02:00进行维护更新，期间系统可能暂时无法访问，请提前做好准备。', time: '2023-09-16 10:00:00', type: 'system', read: false },
  { id: 2, title: '订单支付成功', content: '您的订单 #20230916001 已支付成功，感谢您的购买！', time: '2023-09-16 09:30:00', type: 'order', read: true },
  { id: 3, title: '活动开始通知', content: '国庆节活动已开始，全场商品8折优惠，快来抢购吧！', time: '2023-09-15 18:00:00', type: 'activity', read: false },
  { id: 4, title: '安全提醒', content: '您的账号于2023-09-15 10:15:33在新设备上登录，如非本人操作，请及时修改密码。', time: '2023-09-15 10:16:00', type: 'security', read: true },
  { id: 5, title: '库存预警', content: '商品 "VR眼镜" 库存不足，当前库存仅剩余5件，请及时补货。', time: '2023-09-14 15:00:00', type: 'system', read: true },
  { id: 6, title: '订单发货通知', content: '您的订单 #20230914001 已发货，物流单号：SF1234567890。', time: '2023-09-14 10:00:00', type: 'order', read: true },
  { id: 7, title: '会员等级提升', content: '恭喜您的会员等级已提升至VIP3，享受更多专属优惠！', time: '2023-09-13 20:00:00', type: 'activity', read: false },
  { id: 8, title: '系统公告', content: '新版后台管理系统已上线，新增了多项功能，欢迎体验！', time: '2023-09-13 09:00:00', type: 'system', read: true },
])

const allMessages = computed(() => messages.value)
const unreadMessages = computed(() => messages.value.filter(msg => !msg.read))
const systemMessages = computed(() => messages.value.filter(msg => msg.type === 'system'))
const orderMessages = computed(() => messages.value.filter(msg => msg.type === 'order'))

function markAsRead(id: number) {
  const message = messages.value.find(msg => msg.id === id)
  if (message) {
    message.read = true
  }
}

function deleteMessage(id: number) {
  const index = messages.value.findIndex(msg => msg.id === id)
  if (index !== -1) {
    messages.value.splice(index, 1)
  }
}
</script>

<style scoped>
.page-container {
  padding: 20px 24px;
}

.page-breadcrumb {
  margin-bottom: 16px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.message-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid var(--border-color);
}

.message-tabs {
  width: 100%;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.message-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px;
  background: var(--color-bg-elevated);
  border-radius: 8px;
  transition: all 0.2s;
}

.message-item:hover {
  background: var(--color-bg-elevated-hover);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.message-item.unread {
  background: rgba(59, 130, 246, 0.05);
  border-left: 4px solid #3B82F6;
}

.message-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-right: 16px;
}

.message-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.message-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.message-time {
  font-size: 12px;
  color: var(--text-muted);
}

.message-body {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

.message-tags {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.message-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
}
</style>
