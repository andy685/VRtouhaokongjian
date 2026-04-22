<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>营销工具</h1>
      <n-button type="primary">+ 创建活动</n-button>
    </div>
    
    <!-- Tab切换 -->
    <n-tabs type="line" animated v-model:value="activeTab">
      <n-tab-pane name="coupon" tab="🎟️ 优惠券管理">
        <div class="tab-content">
          <div class="coupon-stats">
            <div class="stat-item">
              <span class="value primary">¥2,580</span>
              <span class="label">今日发放</span>
            </div>
            <div class="stat-item">
              <span class="value">¥1,890</span>
              <span class="label">今日核销</span>
            </div>
            <div class="stat-item">
              <span class="value">156</span>
              <span class="label">今日发放数</span>
            </div>
            <div class="stat-item">
              <span class="value success">89</span>
              <span class="label">今日核销数</span>
            </div>
          </div>

          <n-data-table :columns="couponColumns" :data="couponData" :pagination="{ pageSize: 10 }" striped />
        </div>
      </n-tab-pane>
      
      <n-tab-pane name="activity" tab="📢 活动配置">
        <div class="tab-content">
          <div class="activity-grid">
            <div v-for="activity in activities" :key="activity.id" class="activity-card" :class="{ disabled: activity.status === 'ended' }">
              <div class="activity-cover" :style="{ background: activity.gradient }">
                <span class="activity-icon">{{ activity.icon }}</span>
                <div class="activity-badge" :class="activity.status">{{ activity.statusText }}</div>
              </div>
              <div class="activity-info">
                <h4>{{ activity.name }}</h4>
                <p class="activity-desc">{{ activity.description }}</p>
                <div class="activity-stats">
                  <span><n-icon :component="PersonOutline" size="14" /> {{ activity.participants }}</span>
                  <span><n-icon :component="TicketOutline" size="14" /> {{ activity.used }}/{{ activity.total }}</span>
                </div>
                <div class="activity-time">
                  <n-icon :component="TimeOutline" size="12" /> {{ activity.timeRange }}
                </div>
                <div class="activity-actions">
                  <n-button size="small" secondary @click="editActivity(activity)">编辑</n-button>
                  <n-button size="small" quaternary @click="viewStats(activity)">数据</n-button>
                  <n-button size="small" quaternary type="error" @click="endActivity(activity)">结束</n-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </n-tab-pane>

      <n-tab-pane name="member" tab="👥 会员权益">
        <div class="tab-content">
          <div class="level-intro">
            <h3>会员等级权益设置</h3>
            <p>设置各等级会员的专属权益，提升用户粘性和消费动力</p>
          </div>

          <div class="level-grid">
            <div v-for="level in levels" :key="level.name" class="level-card">
              <div class="level-header" :style="{ background: level.gradient }">
                <span class="level-name">{{ level.name }}</span>
                <span class="level-badge">{{ level.ratio }}</span>
              </div>
              <div class="level-info">
                <div class="level-requirement">
                  <span class="label">升级条件</span>
                  <span class="value">累计消费 ¥{{ level.threshold }}</span>
                </div>
                <div class="level-benefits">
                  <div class="benefit-item" v-for="b in level.benefits" :key="b">
                    <n-icon :component="CheckmarkCircleOutline" size="14" color="#10B981" />
                    <span>{{ b }}</span>
                  </div>
                </div>
                <n-button block secondary size="small">编辑权益</n-button>
              </div>
            </div>
          </div>
        </div>
      </n-tab-pane>

      <n-tab-pane name="rules" tab="⚡ 自动化规则">
        <div class="tab-content">
          <div class="rules-header">
            <h3>自动化营销规则</h3>
            <n-button type="primary" size="small">+ 添加规则</n-button>
          </div>

          <div class="rules-list">
            <div v-for="rule in rules" :key="rule.id" class="rule-card" :class="{ disabled: !rule.enabled }">
              <div class="rule-icon" :style="{ background: rule.color }">
                <n-icon :component="rule.icon" size="20" color="#fff" />
              </div>
              <div class="rule-info">
                <h4>{{ rule.name }}</h4>
                <p>{{ rule.description }}</p>
                <span class="rule-trigger">{{ rule.trigger }}</span>
              </div>
              <div class="rule-status">
                <n-switch :value="rule.enabled" @update:value="toggleRule(rule)" />
                <span>{{ rule.enabled ? '已启用' : '已禁用' }}</span>
              </div>
              <div class="rule-actions">
                <n-button size="tiny" secondary>编辑</n-button>
                <n-button size="tiny" quaternary>日志</n-button>
              </div>
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
  NButton, NTabs, NTabPane, NDataTable, NTag, NSpace, NIcon,
  NSwitch
} from 'naive-ui'
import {
  PersonOutline, TicketOutline, TimeOutline, CheckmarkCircleOutline,
  GiftOutline, NotificationsOutline, PersonAddOutline, CardOutline
} from '@vicons/ionicons5'

const activeTab = ref('coupon')

const couponColumns = [
  { title: '券名称', key: 'name' },
  { title: '类型', key: 'type', render: (row: any) => h(NTag, { size: 'tiny', bordered: true }, () => row.type) },
  { title: '面额/折扣', key: 'value' },
  { title: '已发放', key: 'issued' },
  { title: '已使用', key: 'used', render: (row: any) => h('span', { style: 'color:#10B981;font-weight:600;' }, row.used) },
  { title: '核销率', key: 'rate', render: (row: any) => `${Math.round(row.used / row.issued * 100)}%` },
  { title: '有效期', key: 'expire' },
  { title: '状态', key: 'status', render: (row: any) => h(NTag, { type: row.status === 'active' ? 'success' : 'default', size: 'small' }, () => row.status === 'active' ? '生效中' : '已结束') },
  {
    title: '操作',
    key: 'actions',
    render: () => h(NSpace, null, { default: () => [h(NButton, { size: 'tiny', secondary: true }, () => '编辑'), h(NButton, { size: 'tiny', tertiary: true }, () => '暂停')] })
  }
]

const couponData = [
  { name: '新用户专享券', type: '满减券', value: '满100减20', issued: 156, used: 89, expire: '2026-12-31', status: 'active' },
  { name: '周末畅玩券', type: '体验券', value: '免费体验10分钟', issued: 320, used: 201, expire: '2026-06-30', status: 'active' },
  { name: '生日特权券', type: '赠品券', value: '免费VR体验1次', issued: 45, used: 32, expire: '2026-12-31', status: 'active' },
  { name: '老客回馈券', type: '折扣券', value: '8折', issued: 200, used: 156, expire: '2026-04-30', status: 'active' },
]

const activities = ref([
  { id: 1, name: '周末特惠活动', icon: '🎉', description: '周末到店享受全场8折优惠，周六周日可用', gradient: 'linear-gradient(135deg, #f97316, #ea580c)', status: 'running', statusText: '进行中', participants: '456人', used: 128, total: 200, timeRange: '每周六日 10:00-22:00' },
  { id: 2, name: '会员日专享', icon: '👑', description: '每月8号为会员日，专享双倍积分和专属折扣', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', status: 'running', statusText: '进行中', participants: '1,258人', used: 456, total: '不限', timeRange: '每月8号 全天' },
  { id: 3, name: '开学季促销', icon: '🎒', description: '学生凭学生证享受7折优惠，体验VR魅力', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)', status: 'ended', statusText: '已结束', participants: '892人', used: 568, total: 1000, timeRange: '2026-02-01 ~ 2026-03-31' },
  { id: 4, name: '充值返利活动', icon: '💰', description: '充值满500元返50元，满1000元返150元', gradient: 'linear-gradient(135deg, #10b981, #059669)', status: 'running', statusText: '进行中', participants: '2,156人', used: 1234, total: '不限', timeRange: '长期有效' },
])

const levels = ref([
  { 
    name: '普通会员', gradient: 'linear-gradient(135deg, #94A3B8, #64748B)', ratio: '55%', threshold: '0',
    benefits: ['享受会员价', '生日赠券', '积分抵现']
  },
  { 
    name: '青铜', gradient: 'linear-gradient(135deg, #CD7F32, #B87333)', ratio: '25%', threshold: '500',
    benefits: ['95折优惠', '积分1.5倍', '专属客服']
  },
  { 
    name: '白银', gradient: 'linear-gradient(135deg, #C0C0C0, #A8A8A8)', ratio: '15%', threshold: '800',
    benefits: ['90折优惠', '积分2倍', '专属客服', '优先预约']
  },
  { 
    name: '黄金', gradient: 'linear-gradient(135deg, #F59E0B, #D97706)', ratio: '5%', threshold: '1000',
    benefits: ['85折优惠', '积分3倍', '免费体验券', '专属休息区']
  },
])

const rules = ref([
  { id: 1, name: '新用户欢迎', description: '新会员注册自动发放新人礼包', icon: PersonAddOutline, color: '#3B82F6', trigger: '触发: 新用户注册', enabled: true },
  { id: 2, name: '生日提醒', description: '会员生日当天自动发送祝福和优惠券', icon: GiftOutline, color: '#F59E0B', trigger: '触发: 生日当天', enabled: true },
  { id: 3, name: '沉睡召回', description: '30天未消费会员发送召回优惠券', icon: NotificationsOutline, color: '#EF4444', trigger: '触发: 30天未消费', enabled: false },
  { id: 4, name: '充值提醒', description: '余额低于50元时提醒会员充值', icon: CardOutline, color: '#10B981', trigger: '触发: 余额<50元', enabled: true },
])

function editActivity(activity: any) { console.log('编辑活动', activity) }
function viewStats(activity: any) { console.log('查看数据', activity) }
function endActivity(activity: any) { console.log('结束活动', activity) }
function toggleRule(rule: any) { rule.enabled = !rule.enabled }
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); }

.tab-content { padding-top: 16px; }

.coupon-stats { display: flex; gap: 24px; margin-bottom: 20px; background: #f8fafc; padding: 16px 24px; border-radius: 12px; }
.stat-item { text-align: center; }
.stat-item .value { font-family: 'Orbitron', sans-serif; font-size: 24px; font-weight: 700; color: var(--text-primary); display: block; }
.stat-item .value.primary { color: #3B82F6; }
.stat-item .value.success { color: #10B981; }
.stat-item .label { font-size: 12px; color: var(--text-muted); }

.activity-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.activity-card { background: white; border-radius: 16px; overflow: hidden; border: 1px solid var(--border-color); transition: all 0.25s; }
.activity-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.1); }
.activity-card.disabled { opacity: 0.7; }

.activity-cover { height: 100px; display: flex; align-items: center; justify-content: center; position: relative; }
.activity-icon { font-size: 48px; }
.activity-badge { position: absolute; top: 10px; right: 10px; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; color: white; }
.activity-badge.running { background: rgba(16,185,129,0.9); }
.activity-badge.ended { background: rgba(100,116,139,0.9); }

.activity-info { padding: 16px; }
.activity-info h4 { font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px; }
.activity-desc { font-size: 13px; color: var(--text-muted); margin-bottom: 12px; }
.activity-stats { display: flex; gap: 16px; font-size: 12px; color: var(--text-secondary); margin-bottom: 8px; }
.activity-stats span { display: flex; align-items: center; gap: 4px; }
.activity-time { font-size: 12px; color: var(--text-muted); margin-bottom: 12px; display: flex; align-items: center; gap: 4px; }
.activity-actions { display: flex; gap: 8px; }

.level-intro { margin-bottom: 20px; }
.level-intro h3 { font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
.level-intro p { font-size: 13px; color: var(--text-muted); }

.level-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
.level-card { background: white; border-radius: 14px; overflow: hidden; border: 1px solid var(--border-color); }
.level-header { padding: 16px; text-align: center; color: white; }
.level-name { font-size: 14px; font-weight: 600; display: block; }
.level-badge { font-size: 11px; opacity: 0.9; }
.level-info { padding: 16px; }
.level-requirement { margin-bottom: 12px; }
.level-requirement .label { font-size: 11px; color: var(--text-muted); display: block; }
.level-requirement .value { font-size: 13px; font-weight: 600; color: var(--text-primary); }
.level-benefits { margin-bottom: 12px; }
.benefit-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; }

.rules-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.rules-header h3 { font-size: 16px; font-weight: 600; color: var(--text-primary); }

.rules-list { display: flex; flex-direction: column; gap: 12px; }
.rule-card { background: white; border-radius: 12px; padding: 16px 20px; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 16px; }
.rule-card.disabled { opacity: 0.6; }
.rule-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.rule-info { flex: 1; }
.rule-info h4 { font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
.rule-info p { font-size: 12px; color: var(--text-muted); margin-bottom: 4px; }
.rule-trigger { font-size: 11px; color: #3B82F6; background: #EFF6FF; padding: 2px 8px; border-radius: 4px; }
.rule-status { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.rule-status span { font-size: 11px; color: var(--text-muted); }
.rule-actions { display: flex; gap: 8px; }
</style>
