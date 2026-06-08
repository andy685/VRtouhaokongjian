<template>
  <div class="pos-shell">
    <aside class="pos-sidebar" aria-label="收银系统主导航">
      <router-link class="brand-mark" to="/sale" aria-label="头号空间收银首页">
        <img src="/app-logo.png" alt="头号空间" />
      </router-link>

      <nav class="side-nav">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="side-nav-item"
          :class="{ active: isActive(item) }"
        >
          <span class="filled-nav-icon" :class="{ 'filled-nav-icon--custom': item.iconSrc }" aria-hidden="true">
            <img v-if="item.iconSrc" :src="item.iconSrc" alt="" class="custom-nav-icon" />
            <svg v-else viewBox="0 0 24 24" focusable="false">
              <path v-for="path in item.paths" :key="path" :d="path" />
            </svg>
          </span>
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="side-footer">
        <button type="button" class="footer-action" aria-label="设置" @click="openSettingModal">
          <span class="footer-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path v-for="path in filledIcons.setting" :key="path" :d="path" />
            </svg>
          </span>
        </button>
      </div>
    </aside>

    <section class="pos-main">
      <header class="pos-header">
        <div class="store-meta">
          <div class="meta-item">
            <span class="meta-label">门店：</span>
            <strong>门店名称</strong>
          </div>
          <span class="meta-divider" aria-hidden="true"></span>
          <div class="cashier-menu" ref="cashierMenuRef">
            <button class="cashier-selector" type="button" :aria-expanded="cashierPanelOpen" @click="toggleCashierPanel">
              <span class="meta-label">收银员：</span>
              <strong>王小丫</strong>
              <el-icon class="selector-arrow" :class="{ open: cashierPanelOpen }"><ArrowDown /></el-icon>
            </button>

            <section v-if="cashierPanelOpen" class="cashier-panel" aria-label="收银员操作面板">
              <div class="cashier-profile">
                <span class="identity-tag">收银员</span>
                <div class="cashier-profile-grid">
                  <div class="profile-line">
                    <span>收银员：</span>
                    <strong>王小丫</strong>
                  </div>
                  <div class="profile-line">
                    <span>门店：</span>
                    <strong>门店名称</strong>
                  </div>
                  <div class="profile-line wide">
                    <span>开始收银时间：</span>
                    <strong>2025-01-13 16:21:32</strong>
                  </div>
                </div>
              </div>

              <div class="shift-summary">
                <div>
                  <span>订单数</span>
                  <strong>45</strong>
                </div>
                <div>
                  <span>现金收款</span>
                  <strong><span class="currency-symbol">¥</span>1,680</strong>
                </div>
                <div>
                  <span>线上收款</span>
                  <strong><span class="currency-symbol">¥</span>3,380</strong>
                </div>
              </div>

              <button class="shift-settle-btn" type="button" @click="goShiftSettlement">
                <el-icon><Document /></el-icon>
                交班结算
              </button>
            </section>
          </div>
        </div>

        <div class="header-tools">
          <div class="clock">
            <span class="date-stack">
              <span>{{ currentMonthDay }}</span>
              <span>{{ currentWeekday }}</span>
            </span>
            <strong>{{ currentTime }}</strong>
          </div>
          <button class="window-btn" type="button" aria-label="刷新">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6"/><path d="M2.5 22v-6h6"/><path d="M2 11.5a10 10 0 0 1 18.8-4.3"/><path d="M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
          </button>
          <button class="window-btn" type="button" aria-label="最小化">
            <el-icon><Minus /></el-icon>
          </button>
          <button class="window-btn danger" type="button" aria-label="关闭">
            <el-icon><Close /></el-icon>
          </button>
        </div>
      </header>

      <main class="pos-content">
        <router-view />
      </main>
    </section>

    <transition name="modal-fade">
      <div
        v-if="shiftModalOpen"
        class="shift-modal-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="当班营收交班"
        @click.self="closeShiftModal"
      >
        <section class="shift-modal">
          <header class="shift-modal-header">
            <strong>当班营收交班</strong>
            <div class="shift-modal-actions">
              <button type="button" class="shift-header-btn" aria-label="刷新">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6"/><path d="M2.5 22v-6h6"/><path d="M2 11.5a10 10 0 0 1 18.8-4.3"/><path d="M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
              </button>
              <button type="button" class="shift-header-btn" aria-label="关闭交班结算" @click="closeShiftModal">
                <el-icon><Close /></el-icon>
              </button>
            </div>
          </header>

          <div class="shift-modal-subhead">
            <div class="shift-modal-meta">
              <span>收银员：</span>
              <strong>王小丫</strong>
            </div>
            <div class="shift-modal-meta shift-time-meta">
              <span>开始收银时间：</span>
              <strong>2025-01-19 16:23:31</strong>
            </div>
          </div>

          <div class="shift-modal-body">
            <section class="shift-metrics">
              <div class="shift-section">
                <h3>现金</h3>
                <div class="shift-cards shift-cards-3">
                  <article v-for="item in cashCards" :key="item.label" class="shift-stat-card">
                    <div>
                      <span>{{ item.label }}</span>
                      <strong>{{ item.value }}</strong>
                    </div>
                    <i class="stat-glyph" :class="item.kind" aria-hidden="true"></i>
                  </article>
                </div>
              </div>

              <div class="shift-section">
                <h3>各支付方式金额</h3>
                <div class="shift-cards shift-cards-3">
                  <article v-for="item in paymentCards" :key="item.label" class="shift-stat-card">
                    <div>
                      <span>{{ item.label }}</span>
                      <strong>{{ item.value }}</strong>
                    </div>
                    <i class="stat-glyph" :class="item.kind" aria-hidden="true"></i>
                  </article>
                </div>
              </div>
            </section>

            <aside class="shift-form-panel">
              <div class="shift-form-top">
                <span>打印小票：</span>
                <button
                  type="button"
                  class="print-toggle"
                  :class="{ active: printReceipt }"
                  :aria-pressed="printReceipt"
                  @click="printReceipt = !printReceipt"
                >
                  <span class="print-toggle-label">{{ printReceipt ? '是' : '否' }}</span>
                  <i class="print-toggle-knob"></i>
                </button>
              </div>

              <label class="shift-form-field">
                <span>备用金：</span>
                <input v-model="reserveCash" type="text" placeholder="请输入交班后留在收银台的现金" />
              </label>

              <label class="shift-form-field">
                <span>备注</span>
                <textarea
                  v-model="shiftRemark"
                  maxlength="100"
                  placeholder="请输入备注"
                ></textarea>
                <small>{{ shiftRemark.length }}/100</small>
              </label>

              <button type="button" class="shift-confirm-btn" @click="confirmShiftHandover">确认交班</button>
            </aside>
          </div>
        </section>
      </div>
    </transition>

    <!-- 系统设置弹窗 -->
    <transition name="modal-fade">
      <div
        v-if="settingModalOpen"
        class="settings-modal-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="系统设置"
        @click.self="closeSettingModal"
      >
        <section class="settings-modal">
          <header class="settings-modal-header">
            <h2>系统设置</h2>
            <button type="button" class="settings-close" aria-label="关闭系统设置" @click="closeSettingModal">
              <el-icon><Close /></el-icon>
            </button>
          </header>

          <div class="settings-modal-body">
            <aside class="settings-sidebar">
              <button
                v-for="tab in settingTabs"
                :key="tab.key"
                type="button"
                class="settings-sidebar-tab"
                :class="{ active: activeSettingTab === tab.key }"
                @click="activeSettingTab = tab.key"
              >
                {{ tab.label }}
              </button>
            </aside>

            <div class="settings-content">
              <!-- 会员设置 -->
              <div v-if="activeSettingTab === 'member'" class="settings-panel">
                <h3 class="settings-panel-title">会员设置</h3>
                <div class="setting-row">
                  <span class="setting-row-label">结算后是否登出会员</span>
                  <button
                    type="button"
                    class="st-toggle"
                    :class="{ active: settingForm.logoutAfterCheckout }"
                    @click="settingForm.logoutAfterCheckout = !settingForm.logoutAfterCheckout"
                  >
                    <span class="st-toggle-text">{{ settingForm.logoutAfterCheckout ? '是' : '否' }}</span>
                    <i class="st-toggle-knob"></i>
                  </button>
                </div>
              </div>

              <!-- 员工卡设置 - 列表视图 -->
              <div v-if="activeSettingTab === 'staff'" class="settings-panel">
                <h3 class="settings-panel-title">员工卡设置</h3>
                <!-- 绑定账号表单 -->
                <div v-if="staffView === 'bind'" class="staff-bind-form">
                  <div class="staff-bind-select">
                    <select v-model="staffBindForm.account" class="staff-select">
                      <option value="">188******4442（有管理权限的账号）</option>
                      <option value="a1">139****1111</option>
                      <option value="a2">158****2222</option>
                    </select>
                  </div>
                  <div class="staff-code-row">
                    <input
                      v-model="staffBindForm.code"
                      type="text"
                      class="staff-code-input"
                      placeholder="请输入验证码"
                    />
                    <button type="button" class="staff-code-btn" @click="sendStaffCode">获取验证码</button>
                  </div>
                  <button type="button" class="staff-confirm-btn" @click="confirmStaffBind">确定</button>
                </div>
                <!-- 卡片列表 -->
                <div v-else class="staff-table-wrap">
                  <table class="staff-table">
                    <thead>
                      <tr>
                        <th>姓名</th>
                        <th>月刷卡数</th>
                        <th>当前剩余刷卡数</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(card, idx) in staffCards" :key="idx">
                        <td>{{ card.name }}</td>
                        <td>{{ card.monthTotal }}</td>
                        <td>
                          <template v-if="card.editing">
                            <input
                              v-model.number="card.remainingDraft"
                              type="text"
                              class="staff-edit-input"
                            />
                          </template>
                          <span v-else>{{ card.remaining }}</span>
                        </td>
                        <td>
                          <template v-if="card.editing">
                            <button type="button" class="staff-action-btn save" @click="saveStaffCard(idx)">保存</button>
                          </template>
                          <button
                            v-else
                            type="button"
                            class="staff-action-btn edit"
                            @click="editStaffCard(idx)"
                          >编辑</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- 基础设置 / Token 设置 -->
              <div v-if="activeSettingTab === 'basic'" class="settings-panel">
                <h3 class="settings-panel-title">Token 设置</h3>
                <div class="token-row">
                  <label class="token-label" for="sm-cashier-token">收银 Token：</label>
                  <div class="token-panel" :class="{ editing: tokenEditing }">
                    <template v-if="tokenEditing">
                      <div class="token-edit-block">
                        <input
                          id="sm-cashier-token"
                          v-model="draftCashierToken"
                          class="token-input"
                          type="text"
                        />
                        <div class="token-actions">
                          <button type="button" class="token-action primary" @click="saveTokenEdit">保存</button>
                          <button type="button" class="token-action secondary" @click="cancelTokenEdit">取消</button>
                        </div>
                      </div>
                    </template>
                    <template v-else>
                      <div class="token-value" :title="cashierToken">{{ cashierToken }}</div>
                      <button type="button" class="token-action ghost" @click="startTokenEdit">编辑</button>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowDown,
  Close,
  Document,
  Minus,
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const cashierPanelOpen = ref(false)
const cashierMenuRef = ref(null)
const shiftModalOpen = ref(false)
const settingModalOpen = ref(false)
const activeSettingTab = ref('member')
const staffView = ref('list')
const tokenEditing = ref(false)
const printReceipt = ref(true)
const reserveCash = ref('')
const shiftRemark = ref('')

/* ===== 系统设置弹窗 ===== */
const settingTabs = [
  { key: 'member', label: '会员设置' },
  { key: 'staff',   label: '员工卡设置' },
  { key: 'basic',   label: '基础设置' },
]

const settingForm = reactive({
  logoutAfterCheckout: true,
})

const cashierToken = ref('REGRTRHRT2434534554645adFFF')
const draftCashierToken = ref(cashierToken.value)

const staffBindForm = reactive({
  account: '',
  code: '',
})

const staffCards = ref([
  { name: '雯雯', monthTotal: 9999, remaining: 9999, editing: false, remainingDraft: 9999 },
  { name: '雯雯', monthTotal: 9999, remaining: 9999, editing: false, remainingDraft: 9999 },
  { name: '雯雯', monthTotal: 9999, remaining: 9999, editing: false, remainingDraft: 9999 },
  { name: '雯雯', monthTotal: 9999, remaining: 9999, editing: false, remainingDraft: 9999 },
  { name: '雯雯', monthTotal: 9999, remaining: 9999, editing: false, remainingDraft: 9999 },
  { name: '雯雯', monthTotal: 9999, remaining: 9999, editing: false, remainingDraft: 9999 },
])

const openSettingModal = () => {
  settingModalOpen.value = true
}

const closeSettingModal = () => {
  settingModalOpen.value = false
  tokenEditing.value = false
  draftCashierToken.value = cashierToken.value
  // 重置编辑状态
  staffCards.value.forEach(c => { c.editing = false; c.remainingDraft = c.remaining })
}

const startTokenEdit = () => {
  draftCashierToken.value = cashierToken.value
  tokenEditing.value = true
}

const saveTokenEdit = () => {
  cashierToken.value = draftCashierToken.value.trim() || cashierToken.value
  tokenEditing.value = false
}

const cancelTokenEdit = () => {
  tokenEditing.value = false
  draftCashierToken.value = cashierToken.value
}

const editStaffCard = (idx) => {
  const card = staffCards.value[idx]
  card.editing = true
  card.remainingDraft = card.remaining
}

const saveStaffCard = (idx) => {
  const card = staffCards.value[idx]
  card.remaining = Number(card.remainingDraft) || card.remaining
  card.editing = false
}

const sendStaffCode = () => {}

const confirmStaffBind = () => {}

const cashCards = [
  { label: '备用金', value: '0.00', kind: 'reserve' },
  { label: '营收现金', value: '80.00', kind: 'income' },
  { label: '柜台现金', value: '80.00', kind: 'counter' }
]

const paymentCards = [
  { label: '营收总额', value: '1400.00', kind: 'total' },
  { label: '扫码支付', value: '0.00', kind: 'scan' },
  { label: '现金', value: '80.00', kind: 'cash' },
  { label: '线下支付宝', value: '20.00', kind: 'alipay' },
  { label: '线下微信', value: '130.00', kind: 'wechat' },
  { label: '其他支付', value: '0.00', kind: 'other' },
  { label: '预存款', value: '0.00', kind: 'deposit' }
]

const filledIcons = {
  sale: [
    'M7 4.5A2.5 2.5 0 0 1 9.5 2h5A2.5 2.5 0 0 1 17 4.5V6h1.3a2 2 0 0 1 1.97 2.36l-1.55 8.5A3 3 0 0 1 15.77 19H8.23a3 3 0 0 1-2.95-2.14l-1.55-8.5A2 2 0 0 1 5.7 6H7V4.5Zm2 0V6h6V4.5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0-.5.5ZM9 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm6 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z'
  ],
  member: [
    'M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.42 0-8 2.24-8 5v1.2c0 1 .8 1.8 1.8 1.8h12.4c1 0 1.8-.8 1.8-1.8V19c0-2.76-3.58-5-8-5Z'
  ],
  deduct: [
    'M4 5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v2H4V5Zm0 4h16v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V9Zm10.5 4.25a2.75 2.75 0 1 0 0 5.5 2.75 2.75 0 0 0 0-5.5ZM7 13a1 1 0 1 0 0 2h3a1 1 0 1 0 0-2H7Z'
  ],
  order: [
    'M7 2h10a2 2 0 0 1 2 2v17a1 1 0 0 1-1.45.9L15.5 20.88l-2.05 1.02a1 1 0 0 1-.9 0L10.5 20.88 8.45 21.9A1 1 0 0 1 7 21V4a2 2 0 0 1 2-2Zm3 5a1 1 0 1 0 0 2h5a1 1 0 1 0 0-2h-5Zm0 4a1 1 0 1 0 0 2h5a1 1 0 1 0 0-2h-5Zm0 4a1 1 0 1 0 0 2h3a1 1 0 1 0 0-2h-3Z'
  ],
  log: [
    'M10.5 3a7.5 7.5 0 0 1 5.92 12.1l3.24 3.24a1.4 1.4 0 0 1-1.98 1.98l-3.24-3.24A7.5 7.5 0 1 1 10.5 3Zm0 3a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z'
  ],
  revenue: [
    'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 5v1.15c1.44.33 2.5 1.23 2.5 2.35a1 1 0 1 1-2 0c0-.28-.58-.65-1.5-.65s-1.5.37-1.5.65.45.56 1.97.9c1.39.31 3.03.9 3.03 2.75 0 1.28-1.03 2.29-2.5 2.68V19h-2v-1.12c-1.62-.31-2.75-1.28-2.75-2.63a1 1 0 1 1 2 0c0 .35.67.75 1.75.75s1.5-.41 1.5-.75c0-.29-.32-.57-1.47-.84-1.46-.34-3.53-.82-3.53-2.91 0-1.23 1.02-2.23 2.5-2.6V7h2Z'
  ],
  shift: [
    'M6 2h9l4 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm8 1.5V7h3.5L14 3.5ZM8 10a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2H8Zm0 4a1 1 0 1 0 0 2h5a1 1 0 1 0 0-2H8Z'
  ],
  setting: [
    'M19.43 12.98c.04-.32.07-.65.07-.98s-.02-.66-.07-.98l2.11-1.65a.5.5 0 0 0 .12-.64l-2-3.46a.5.5 0 0 0-.6-.22l-2.49 1a7.28 7.28 0 0 0-1.69-.98L14.5 2.42A.5.5 0 0 0 14 2h-4a.5.5 0 0 0-.49.42l-.38 2.65c-.61.24-1.18.56-1.69.98l-2.49-1a.5.5 0 0 0-.6.22l-2 3.46a.5.5 0 0 0 .12.64l2.11 1.65a7.93 7.93 0 0 0 0 1.96l-2.11 1.65a.5.5 0 0 0-.12.64l2 3.46c.13.22.39.31.6.22l2.49-1c.51.4 1.08.74 1.69.98l.38 2.65c.04.24.25.42.49.42h4c.24 0 .45-.18.49-.42l.38-2.65c.61-.24 1.18-.56 1.69-.98l2.49 1c.22.09.48 0 .6-.22l2-3.46a.5.5 0 0 0-.12-.64l-2.11-1.65ZM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5Z'
  ],
  upgrade: [
    'M12 2a1 1 0 0 1 .72.3l5 5a1 1 0 0 1-1.44 1.4L13 5.42V15a1 1 0 1 1-2 0V5.42L7.72 8.7a1 1 0 0 1-1.44-1.4l5-5A1 1 0 0 1 12 2Zm-7 13a1 1 0 0 1 1 1v2h12v-2a1 1 0 1 1 2 0v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a1 1 0 0 1 1-1Z'
  ]
}

const navItems = [
  { to: '/sale', label: '销售', iconSrc: '/sale-icons/sale.svg', match: ['/sale', '/result'] },
  { to: '/member', label: '会员', iconSrc: '/nav-icons/member.svg', match: ['/member'], exclude: ['/member/deduct'] },
  { to: '/member/deduct', label: '会员扣费', iconSrc: '/nav-icons/member-deduct.svg', match: ['/member/deduct'] },
  { to: '/order', label: '订单', iconSrc: '/nav-icons/order.svg', match: ['/order'] },
  { to: '/log', label: '日志', iconSrc: '/nav-icons/log.svg', match: ['/log'] },
  { to: '/revenue', label: '营收', iconSrc: '/nav-icons/revenue.svg', match: ['/revenue'] },
]

const isActive = (item) => {
  if (item.exclude?.some((prefix) => route.path.startsWith(prefix))) return false
  return item.match.some((prefix) => route.path.startsWith(prefix))
}

const now = ref(new Date())
const currentTime = computed(() => {
  const value = now.value
  return `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`
})
const currentMonthDay = computed(() => {
  const value = now.value
  return `${value.getMonth() + 1}月${value.getDate()}日`
})
const currentWeekday = computed(() => {
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  return weekdays[now.value.getDay()]
})

const toggleCashierPanel = () => {
  cashierPanelOpen.value = !cashierPanelOpen.value
}

const closeCashierPanel = (event) => {
  if (!cashierMenuRef.value?.contains(event.target)) {
    cashierPanelOpen.value = false
  }
}

const goShiftSettlement = () => {
  cashierPanelOpen.value = false
  shiftModalOpen.value = true
}

const closeShiftModal = () => {
  shiftModalOpen.value = false
}

const confirmShiftHandover = () => {
  shiftModalOpen.value = false
  cashierPanelOpen.value = false
  router.push('/login')
}

let timer = null
onMounted(() => {
  timer = window.setInterval(() => {
    now.value = new Date()
  }, 1000)
  document.addEventListener('click', closeCashierPanel)
})

onUnmounted(() => {
  if (timer) window.clearInterval(timer)
  document.removeEventListener('click', closeCashierPanel)
})
</script>

<style scoped>
.pos-shell {
  --sidebar-width: 76px;
  display: flex;
  width: 100%;
  height: 100dvh;
  min-width: 1024px;
  overflow: hidden;
  background: #eaf7ff;
  color: #171b24;
}

.pos-sidebar {
  width: var(--sidebar-width);
  flex: 0 0 var(--sidebar-width);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 14px 8px;
  background: #4ea6ed;
  box-shadow: inset -1px 0 rgba(21, 88, 150, 0.08);
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  margin-bottom: 22px;
}

.brand-mark img {
  width: 42px;
  height: 50px;
  object-fit: contain;
}

.side-nav,
.side-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.side-nav {
  gap: 16px;
  margin-top: 18px;
}

.side-footer {
  margin-top: auto;
  gap: 14px;
  padding-bottom: 10px;
}

.side-nav-item {
  width: 60px;
  min-height: 62px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 12px;
  color: #155896;
  text-decoration: none;
  font-size: 12px;
  font-weight: 700;
  transition: background-color 180ms ease, color 180ms ease, transform 180ms ease;
}

.filled-nav-icon {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.55);
  color: #4ea6ed;
}

.filled-nav-icon svg {
  width: 20px;
  height: 20px;
  display: block;
  fill: currentColor;
}

.custom-nav-icon {
  width: 18px;
  height: 18px;
  display: block;
  object-fit: contain;
}

.side-nav-item.active .filled-nav-icon--custom .custom-nav-icon {
  filter: saturate(2.5) hue-rotate(-3deg) brightness(0.78) contrast(1.05);
}

.side-nav-item.active {
  color: #fff;
}

.side-nav-item.active .filled-nav-icon {
  background: #fff;
  color: #0F8BFF;
}

.side-nav-item:hover {
  transform: translateY(-1px);
  color: #dff2ff;
}

.side-nav-item:hover .filled-nav-icon {
  background: rgba(255, 255, 255, 0.82);
  color: #2f86ea;
}

.footer-action {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: #155896;
  cursor: pointer;
  transition: color 180ms ease, transform 180ms ease;
}

.footer-action:hover {
  transform: scale(1.15);
}

.footer-action.active {
  background: transparent;
  color: #dff2ff;
}

.footer-icon {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
}

.footer-icon svg {
  width: 26px;
  height: 26px;
  display: block;
  fill: currentColor;
}

.pos-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.pos-header {
  height: 64px;
  flex: 0 0 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  background: #fff;
  border-bottom: 1px solid #d8efff;
}

.store-meta,
.header-tools {
  display: flex;
  align-items: center;
}

.store-meta {
  min-height: 64px;
  gap: 24px;
  font-size: 13px;
}

.meta-item,
.cashier-selector {
  min-height: 44px;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}

.meta-label {
  color: #171b24;
  font-weight: 400;
}

.cashier-menu {
  position: relative;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}

.cashier-selector {
  min-width: 154px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #171b24;
  cursor: pointer;
  font-size: 13px;
  padding: 0 10px;
  transition: background-color 160ms ease;
}

.cashier-selector:hover,
.cashier-selector[aria-expanded="true"] {
  background: #edf7ff;
}

.selector-arrow {
  margin-left: 2px;
  transition: transform 160ms ease;
}

.selector-arrow.open {
  transform: rotate(180deg);
}

.meta-divider {
  width: 1px;
  height: 38px;
  background: #e7eef5;
}

.cashier-panel {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  z-index: 30;
  width: 340px;
  padding: 14px;
  border: 1px solid #d8efff;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 18px 36px rgba(21, 88, 150, 0.18);
}

.cashier-panel::before {
  content: "";
  position: absolute;
  top: -6px;
  left: 34px;
  width: 12px;
  height: 12px;
  border-left: 1px solid #d8efff;
  border-top: 1px solid #d8efff;
  background: #fff;
  transform: rotate(45deg);
}

.cashier-profile {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid #edf5fb;
}

.identity-tag {
  position: absolute;
  top: 0;
  right: 0;
  min-width: 54px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  border-radius: 999px;
  background: #eaf5ff;
  color: #1191ff;
  font-size: 12px;
  font-weight: 800;
}

.cashier-profile-grid {
  display: grid;
  gap: 8px;
  padding-right: 70px;
}

.profile-line {
  display: flex;
  align-items: center;
  gap: 4px;
  min-height: 22px;
  color: #6f7785;
  font-size: 13px;
  white-space: nowrap;
}

.profile-line.wide {
  align-items: center;
}

.profile-line strong {
  color: #171b24;
  font-size: 13px;
  font-weight: 800;
}

.shift-summary {
  display: grid;
  gap: 8px;
  padding: 12px 0;
}

.shift-summary div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 28px;
  color: #6f7785;
  font-size: 13px;
}

.shift-summary strong {
  color: #171b24;
  font-size: 14px;
  font-variant-numeric: tabular-nums;
}

.shift-settle-btn {
  width: 100%;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: 8px;
  background: linear-gradient(90deg, #1191ff 0%, #075bff 100%);
  color: #fff;
  cursor: pointer;
  font-weight: 900;
}

.header-tools {
  gap: 16px;
}

.clock {
  min-width: 128px;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 10px;
  color: #171b24;
}

.date-stack {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  line-height: 1.1;
  white-space: nowrap;
}

.date-stack span:first-child {
  font-size: 12px;
}

.date-stack span:last-child {
  font-size: 11px;
}

.clock strong {
  font-size: 20px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.window-btn {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #171b24;
  cursor: pointer;
  font-size: 22px;
  transition: background-color 160ms ease, color 160ms ease;
}

.window-btn:hover {
  background: #edf7ff;
  color: #1191ff;
}

.window-btn.danger:hover {
  background: #fff1f0;
  color: #f04438;
}

.pos-content {
  flex: 1;
  min-height: 0;
  overflow: auto;
  background: #eaf7ff;
}

.shift-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
  background: var(--pos-overlay-backdrop);
}

.shift-modal {
  width: min(100%, 928px);
  border-radius: 18px;
  overflow: hidden;
  background: #d8ebff;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.24);
}

.shift-modal-header {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: #edf3fa;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
}

.shift-modal-header strong {
  font-size: 15px;
  font-weight: 700;
}

.shift-modal-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.shift-header-btn {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  color: #4f5d73;
  cursor: pointer;
}

.shift-modal-subhead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 18px 24px;
  border-bottom: 1px solid rgba(17, 59, 110, 0.12);
}

.shift-modal-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #1d2433;
  font-size: 15px;
  white-space: nowrap;
}

.shift-modal-meta span {
  font-weight: 700;
}

.shift-modal-meta strong {
  font-weight: 500;
}

.shift-time-meta {
  justify-content: flex-end;
}

.shift-modal-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 304px;
  gap: 24px;
  padding: 16px 24px 26px;
}

.shift-section + .shift-section {
  margin-top: 14px;
}

.shift-section h3 {
  margin: 0 0 12px;
  color: #1d2433;
  font-size: 14px;
  font-weight: 700;
}

.shift-cards {
  display: grid;
  gap: 8px;
}

.shift-cards-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.shift-stat-card {
  min-height: 68px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 14px 14px 16px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.84);
}

.shift-stat-card span {
  display: block;
  margin-bottom: 4px;
  color: #1d2433;
  font-size: 13px;
}

.shift-stat-card strong {
  color: #111827;
  font-size: 15px;
  font-weight: 700;
}

.stat-glyph {
  position: relative;
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
}

.stat-glyph::before,
.stat-glyph::after {
  content: '';
  position: absolute;
  box-sizing: border-box;
}

.stat-glyph.reserve::before {
  left: 4px;
  right: 4px;
  top: 3px;
  height: 4px;
  border-radius: 999px;
  background: #8a56e8;
  box-shadow: 0 5px 0 #8a56e8, 0 10px 0 #8a56e8;
}

.stat-glyph.reserve::after {
  right: 0;
  bottom: 1px;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  border: 2px solid #8a56e8;
  background: #fff;
  box-shadow: inset 0 0 0 2px #fff;
}

.stat-glyph.income::before,
.stat-glyph.total::before {
  left: 3px;
  right: 3px;
  bottom: 3px;
  height: 3px;
  border-radius: 999px;
  background: currentColor;
}

.stat-glyph.income::after,
.stat-glyph.total::after {
  inset: 4px 4px 5px;
  background:
    linear-gradient(currentColor, currentColor) 1px calc(100% - 8px) / 3px 8px no-repeat,
    linear-gradient(currentColor, currentColor) calc(50% - 1px) calc(100% - 12px) / 3px 12px no-repeat,
    linear-gradient(currentColor, currentColor) calc(100% - 4px) calc(100% - 16px) / 3px 16px no-repeat,
    linear-gradient(135deg, transparent 46%, currentColor 46% 54%, transparent 54%) right 1px top 1px / 12px 12px no-repeat;
}

.stat-glyph.counter::before {
  left: 1px;
  right: 1px;
  top: 7px;
  height: 7px;
  border-radius: 3px;
  background: #f06b2b;
}

.stat-glyph.counter::after {
  left: 3px;
  right: 3px;
  top: 2px;
  height: 8px;
  border-radius: 999px;
  border: 2px solid #f06b2b;
  border-bottom: 0;
}

.stat-glyph.scan::before {
  inset: 1px;
  background:
    linear-gradient(#45c28f, #45c28f) left top / 7px 2px no-repeat,
    linear-gradient(#45c28f, #45c28f) left top / 2px 7px no-repeat,
    linear-gradient(#45c28f, #45c28f) right top / 7px 2px no-repeat,
    linear-gradient(#45c28f, #45c28f) right top / 2px 7px no-repeat,
    linear-gradient(#45c28f, #45c28f) left bottom / 7px 2px no-repeat,
    linear-gradient(#45c28f, #45c28f) left bottom / 2px 7px no-repeat,
    linear-gradient(#45c28f, #45c28f) right bottom / 7px 2px no-repeat,
    linear-gradient(#45c28f, #45c28f) right bottom / 2px 7px no-repeat;
}

.stat-glyph.cash::before {
  left: 1px;
  right: 2px;
  top: 8px;
  bottom: 4px;
  border-radius: 10px;
  background: #4d9cff;
}

.stat-glyph.cash::after {
  right: -1px;
  top: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #78b9ff;
  box-shadow: -10px 10px 0 -2px #4d9cff;
}

.stat-glyph.alipay::before {
  inset: 3px 5px 5px;
  border-bottom: 2px solid currentColor;
  border-left: 2px solid currentColor;
  transform: skew(-18deg);
}

.stat-glyph.alipay::after {
  left: 6px;
  right: 3px;
  top: 3px;
  height: 9px;
  border-top: 2px solid currentColor;
  border-right: 2px solid currentColor;
  border-radius: 999px;
}

.stat-glyph.wechat::before {
  left: 2px;
  top: 5px;
  width: 13px;
  height: 10px;
  border-radius: 8px;
  background: currentColor;
}

.stat-glyph.wechat::after {
  right: 1px;
  top: 2px;
  width: 11px;
  height: 9px;
  border-radius: 8px;
  background: currentColor;
  opacity: 0.92;
}

.stat-glyph.other::before {
  left: 4px;
  top: 3px;
  width: 16px;
  height: 18px;
  border: 2px solid currentColor;
  border-radius: 3px;
  transform: perspective(20px) rotateX(8deg);
}

.stat-glyph.other::after {
  left: 8px;
  top: 7px;
  width: 8px;
  height: 8px;
  border-top: 2px solid currentColor;
  border-left: 2px solid currentColor;
}

.stat-glyph.deposit::before {
  left: 2px;
  right: 2px;
  top: 5px;
  height: 12px;
  border-radius: 3px;
  background: currentColor;
}

.stat-glyph.alipay { color: #4a85ff; }
.stat-glyph.wechat { color: #47c474; }
.stat-glyph.other { color: #f56a63; }
.stat-glyph.deposit { color: #ff9a4d; }

.stat-glyph.total { color: #315fff; }
.stat-glyph.income { color: #4677ff; }
.stat-glyph.scan { color: #45c28f; }
.stat-glyph.cash { color: #4d9cff; }

.shift-form-panel {
  padding: 18px 18px 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.82);
}

.shift-form-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  color: #1d2433;
  font-size: 14px;
}

.print-toggle {
  position: relative;
  width: 74px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 4px;
  border: 0;
  border-radius: 999px;
  background: #d8e0ea;
  color: #6f7f93;
  cursor: pointer;
  transition: background-color 0.18s ease, color 0.18s ease;
}

.print-toggle.active {
  background: linear-gradient(90deg, #3f9cff 0%, #2d6dff 100%);
  color: #fff;
}

.print-toggle-label {
  width: 100%;
  padding: 0 30px 0 10px;
  text-align: left;
  font-size: 12px;
  font-weight: 700;
  transition: padding 0.18s ease, text-align 0.18s ease;
}

.print-toggle.active .print-toggle-label {
  padding: 0 30px 0 12px;
}

.print-toggle-knob {
  position: absolute;
  margin-left: 0;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.18);
  transform: translateX(-42px);
  transition: transform 0.18s ease;
}

.print-toggle.active .print-toggle-knob {
  transform: translateX(0);
}

.shift-form-field {
  display: block;
  margin-bottom: 16px;
}

.shift-form-field > span {
  display: block;
  margin-bottom: 8px;
  color: #1d2433;
  font-size: 14px;
}

.shift-form-field input,
.shift-form-field textarea {
  width: 100%;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 6px;
  background: #fff;
  color: #1d2433;
  outline: none;
  font-size: 13px;
}

.shift-form-field input {
  height: 42px;
  padding: 0 12px;
}

.shift-form-field textarea {
  min-height: 90px;
  padding: 12px;
  resize: none;
}

.shift-form-field input:focus,
.shift-form-field textarea:focus {
  border-color: rgba(47, 126, 255, 0.42);
  box-shadow: 0 0 0 3px rgba(47, 126, 255, 0.12);
}

.shift-form-field small {
  display: block;
  margin-top: 6px;
  color: #6f7f93;
  font-size: 12px;
  text-align: right;
}

.shift-confirm-btn {
  min-width: 112px;
  height: 36px;
  display: block;
  margin: 8px auto 0;
  border: 0;
  border-radius: 8px;
  background: linear-gradient(90deg, #3f9cff 0%, #2d6dff 100%);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(47, 110, 255, 0.18);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.18s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* ========== 系统设置弹窗（复用登录页样式） ========== */
.settings-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
  background: var(--pos-overlay-backdrop, rgba(0, 0, 0, 0.76));
}

.settings-modal {
  width: min(100%, 700px);
  height: 520px;
  border-radius: 16px;
  overflow: hidden;
  background: #d9ebff;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.24);
  display: flex;
  flex-direction: column;
}

.settings-modal-header {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px 0 28px;
  background: #edf3fa;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  flex-shrink: 0;
}

.settings-modal-header h2 {
  margin: 0;
  color: #1d2433;
  font-size: 18px;
  font-weight: 700;
}

.settings-close {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  color: #4f5d73;
  cursor: pointer;
}

.settings-close :deep(.el-icon) {
  font-size: 20px;
}

.settings-modal-body {
  display: grid;
  grid-template-columns: 108px 1fr;
  flex: 1;
  min-height: 0;
}

.settings-sidebar {
  padding: 24px 14px;
  background: rgba(191, 220, 248, 0.72);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.settings-sidebar-tab {
  width: 100%;
  height: 40px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: #5a6b82;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all .18s ease;
}

.settings-sidebar-tab:hover {
  color: #3791ff;
  background: rgba(55, 145, 255, 0.08);
}

.settings-sidebar-tab.active {
  background: linear-gradient(90deg, #3791ff 0%, #2c6eff 100%);
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 10px 18px rgba(47, 126, 255, 0.2);
}

.settings-content {
  padding: 28px 32px;
  background: rgba(210, 230, 252, 0.82);
  overflow-y: auto;
}

.settings-panel-title {
  margin: 0 0 24px;
  color: #111827;
  font-size: 18px;
  font-weight: 700;
}

/* --- 设置行 + Toggle --- */
.setting-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.setting-row-label {
  color: #1f2937;
  font-size: 15px;
  white-space: nowrap;
}

.st-toggle {
  position: relative;
  width: 74px; height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 4px;
  border: 0;
  border-radius: 999px;
  background: #d8e0ea;
  color: #6f7f93;
  cursor: pointer;
  transition: background-color .18s ease, color .18s ease;
}

.st-toggle.active {
  background: linear-gradient(90deg, #3f9cff 0%, #2d6dff 100%);
  color: #fff;
}

.st-toggle-text {
  width: 100%;
  padding: 0 30px 0 10px;
  text-align: left;
  font-size: 13px;
  font-weight: 700;
  transition: padding .18s ease, text-align .18s ease;
}

.st-toggle.active .st-toggle-text {
  padding: 0 30px 0 12px;
}

.st-toggle-knob {
  position: absolute;
  right: 4px;
  width: 24px; height: 24px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.18);
  transform: translateX(-42px);
  transition: transform .18s ease;
}

.st-toggle.active .st-toggle-knob {
  transform: translateX(0);
}

/* --- 员工卡绑定表单 --- */
.staff-bind-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 420px;
}

.staff-select {
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 8px;
  background: #fff;
  color: #4b5563;
  font-size: 14px;
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
}

.staff-code-row {
  display: flex;
  gap: 10px;
}

.staff-code-input {
  flex: 1;
  min-width: 0;
  height: 44px;
  padding: 0 14px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 8px;
  background: #fff;
  color: #1d2433;
  font-size: 14px;
  outline: none;
}

.staff-code-input:focus,
.staff-select:focus {
  border-color: rgba(47, 126, 255, 0.42);
  box-shadow: 0 0 0 3px rgba(47, 126, 255, 0.12);
}

.staff-code-btn {
  height: 44px;
  padding: 0 18px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: #2f7eff;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: all .18s ease;
}

.staff-code-btn:hover {
  background: rgba(47, 126, 255, 0.06);
}

.staff-confirm-btn {
  width: 100%;
  height: 48px;
  border: 0;
  border-radius: 8px;
  background: linear-gradient(90deg, #3791ff 0%, #2c6eff 100%);
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(47, 110, 255, 0.18);
  transition: background .18s ease;
}

.staff-confirm-btn:hover {
  background: linear-gradient(90deg, #3186ef 0%, #2666ee 100%);
}

/* --- 员工卡表格 --- */
.staff-table-wrap {
  overflow-y: auto;
}

.staff-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 10px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.88);
}

.staff-table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  background: #f8fafc;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  white-space: nowrap;
}

.staff-table td {
  padding: 12px 16px;
  font-size: 14px;
  color: #1f2937;
  border-bottom: 1px solid rgba(15, 23, 42, 0.04);
}

.staff-table tbody tr:last-child td {
  border-bottom: 0;
}

.staff-edit-input {
  width: 90px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid rgba(47, 126, 255, 0.35);
  border-radius: 6px;
  background: #fff;
  color: #1f2937;
  font-size: 14px;
  text-align: center;
  outline: none;
  font-variant-numeric: tabular-nums;
}

.staff-edit-input:focus {
  border-color: rgba(47, 126, 255, 0.65);
  box-shadow: 0 0 0 3px rgba(47, 126, 255, 0.1);
}

.staff-action-btn {
  height: 30px;
  padding: 0 14px;
  border: 0;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all .15s ease;
}

.staff-action-btn.edit {
  background: transparent;
  color: #2f7eff;
}

.staff-action-btn.edit:hover {
  background: rgba(47, 126, 255, 0.06);
}

.staff-action-btn.save {
  background: linear-gradient(90deg, #4ea2ff 0%, #3b85ee 100%);
  color: #fff;
}

.staff-action-btn.save:hover {
  background: linear-gradient(90deg, #3b95ef 0%, #2a78dd 100%);
}

/* --- Token 行（复用登录页样式） --- */
.token-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.token-label {
  padding-top: 11px;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.token-panel {
  display: flex;
  align-items: center;
  gap: 12px;
}

.token-panel.editing {
  align-items: flex-start;
}

.token-edit-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.token-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.token-value {
  width: 320px;
  min-height: 40px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.94);
  color: #374151;
  font-size: 14px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.token-input {
  width: 320px;
  height: 40px;
  padding: 0 14px;
  border: 1px solid rgba(47, 126, 255, 0.22);
  border-radius: 8px;
  background: #ffffff;
  color: #374151;
  font-size: 14px;
  outline: none;
  transition: border-color .18s ease, box-shadow .18s ease;
}

.token-input:focus {
  border-color: rgba(47, 126, 255, 0.52);
  box-shadow: 0 0 0 3px rgba(47, 126, 255, 0.12);
}

.token-action {
  height: 38px;
  padding: 0 16px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: #6b7890;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all .18s ease;
}

.token-action.ghost {
  height: auto;
  padding: 0;
  border: 0;
  color: #2f7eff;
  font-size: 14px;
}

.token-action.primary {
  min-width: 72px;
  border-color: rgba(47, 126, 255, 0.18);
  background: linear-gradient(90deg, #3791ff 0%, #2c6eff 100%);
  color: #ffffff;
}

.token-action.secondary {
  border-color: rgba(156, 163, 175, 0.2);
  background: rgba(255, 255, 255, 0.8);
  color: #374151;
}

.token-action.secondary:hover {
  border-color: rgba(156, 163, 175, 0.3);
  background: rgba(255, 255, 255, 0.96);
}

.token-action.primary:hover {
  background: linear-gradient(90deg, #3186ef 0%, #2666ee 100%);
}

.setting-row-label {
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}
</style>
