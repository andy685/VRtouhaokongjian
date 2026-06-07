<template>
  <div class="demo-root" :class="{ 'demo-root--full': isFullScreen }">
    <!-- 页面 × 场景层级导航 -->
    <div class="demo-pages" v-if="!isFullScreen">
      <div class="demo-page-group" v-for="pg in pageGroups" :key="pg.key">
        <h3 class="demo-page-title">{{ pg.label }}</h3>
        <div class="demo-page-scenarios">
          <button
            v-for="sc in pg.scenarios"
            :key="sc.id"
            class="demo-scenario-btn"
            :class="{ active: activeScenario === sc.id && currentState === pg.key }"
            @click="jumpToPage(pg.key, sc)"
          >
            <span class="demo-scenario-num">{{ String(sc.id).padStart(2,'0') }}</span>
            <span class="demo-scenario-label">{{ sc.label }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 视图切换 + 小程序工具条 -->
    <div class="demo-toolbar">
      <button class="demo-btn--mode" @click="isFullScreen = !isFullScreen">
        <template v-if="isFullScreen">📱 手机预览</template>
        <template v-else>📲 小程序全屏</template>
      </button>
      <span v-if="isFullScreen" class="demo-toolbar-scene">{{ activeScenarioLabel }}</span>
    </div>

    <!-- 全屏模式：直接渲染 MiniPayFlow -->
    <template v-if="isFullScreen">
      <MiniPayFlow
        class="demo-fullscreen-flow"
        :state="currentState"
        :member="demoMember"
        :product="demoProduct"
        :unit-price="demoUnitPrice"
        :coupon-discount-amount="demoCouponDiscountAmount"
        :fail-title="failTitle"
        :order-no="orderNo"
        :device-label="deviceLabel"
        :store-name="storeName"
        :qr-status-hint="qrStatusHint"
        @confirm="onConfirm"
        @cancel="onCancel"
        @retry="onRetry"
        @done="onDone"
        @back="onBack"
        @manual-input="onManualInput"
      />
    </template>

    <!-- 手机框模式 -->
    <template v-else>
    <!-- 手机模拟框 -->
    <div class="demo-phone">
      <div class="demo-statusbar">
        <span>9:41</span>
        <div class="demo-status-icons">
          <svg viewBox="0 0 24 16" width="34" height="12" fill="currentColor"><rect x="0" y="4" width="4" height="8" rx="1"/><rect x="6" y="2" width="4" height="10" rx="1"/><rect x="12" y="0" width="4" height="14" rx="1"/><rect x="18" y="5" width="4" height="7" rx="1"/></svg>
          <span>Wi-Fi</span>
          <svg viewBox="0 0 24 14" width="22" height="11" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="0" y="0" width="22" height="14" rx="2"/><rect x="3" y="3" width="16" height="8" rx="1" fill="currentColor"/><rect x="20" y="5" width="1" height="4" rx="0.5" fill="#111"/></svg>
        </div>
      </div>
      <div class="demo-screen">
        <MiniPayFlow
          :state="currentState"
          :member="demoMember"
          :product="demoProduct"
          :unit-price="demoUnitPrice"
          :coupon-discount-amount="demoCouponDiscountAmount"
          :fail-title="failTitle"
          :order-no="orderNo"
          :device-label="deviceLabel"
          :store-name="storeName"
          :qr-status-hint="qrStatusHint"
          @confirm="onConfirm"
          @cancel="onCancel"
          @retry="onRetry"
          @done="onDone"
          @back="onBack"
          @manual-input="onManualInput"
        />
      </div>
    </div>

    <!-- 事件日志 -->
    <aside class="demo-log">
      <h4>事件日志</h4>
      <div v-if="log.length === 0" class="demo-empty">— 点击按钮触发事件 —</div>
      <div v-for="(e, i) in log" :key="i" class="demo-entry">
        <span class="demo-time">{{ e.time }}</span>
        <span class="demo-msg">{{ e.msg }}</span>
      </div>
    </aside>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import MiniPayFlow from './MiniPayFlow.vue'

/* ---- 状态列表（6个） ---- */
const allStates = [
  { key: 'loading', label: '⏳ 加载中' },
  { key: 'confirm', label: '🧾 付款结算' },
  { key: 'processing', label: '🔄 支付中' },
  { key: 'success', label: '💚 支付成功' },
  { key: 'failed', label: '❌ 支付失败' },
]

const currentState = ref('confirm')

/* ---- 场景预设（8种） ---- */
const scenarios = [
  { id: 1,  label: '纯预存款全覆盖',           unitPrice: 38,  coupon: 0,  discount: 9,  balance: 100, coins: 0 },
  { id: 2,  label: '纯游戏币全覆盖',         unitPrice: 38,  coupon: 0,  discount: 9,  balance: 0,   coins: 50 },
  { id: 3,  label: '预存款+游戏币全覆盖',       unitPrice: 38,  coupon: 0,  discount: 9,  balance: 20,  coins: 30 },
  { id: 4,  label: '预存款不足→外付补差',      unitPrice: 38,  coupon: 0,  discount: 9,  balance: 10,  coins: 0 },
  { id: 5,  label: '游戏币不足→外付补差',    unitPrice: 38,  coupon: 0,  discount: 9,  balance: 0,   coins: 20 },
  { id: 6,  label: '预存款+币均不足→补差',     unitPrice: 38,  coupon: 0,  discount: 9,  balance: 10,  coins: 10 },
  { id: 7,  label: '优惠券+折扣+全额覆盖',   unitPrice: 38,  coupon: 5,  discount: 8.5, balance: 100, coins: 30 },
  { id: 8,  label: '优惠券+折扣+不足→补差',  unitPrice: 38,  coupon: 5,  discount: 8.5, balance: 10,  coins: 0 },
]

/* ---- 页面 × 场景分组（一级标题=页面，二级标题=场景） ---- */
const activeScenario = ref(1) // 默认选中第1个场景

const pageGroups = computed(() => [
  {
    key: 'confirm',
    label: '付款结算',
    scenarios: scenarios.map(s => ({ ...s }))
  },
  {
    key: 'success',
    label: '支付成功',
    scenarios: scenarios.map(s => ({ ...s }))
  },
  {
    key: 'failed',
    label: '支付失败',
    scenarios: [
      { id: 1, label: '订单已失效' },
      { id: 2, label: '支付超时' },
      { id: 3, label: '余额不足' }
    ]
  }
])

/* ---- 跳转到指定页面+场景 ---- */
function jumpToPage(pageKey, sc) {
  // 支付失败有独立页面
  if (pageKey === 'failed') {
    failTitle.value = sc.label
    currentState.value = 'failed'
    activeScenario.value = 0
    addLog(`跳转: 支付失败 · ${sc.label}`)
    return
  }

  // 对于 confirm / success，先应用场景数据
  if (sc.unitPrice !== undefined) {
    applyScenario(sc)
  }

  // 切换到目标页面
  if (pageKey === 'confirm') {
    currentState.value = 'confirm'
  } else if (pageKey === 'success') {
    // 直接跳到 success 状态
    currentState.value = 'success'
    addLog(`跳转: 支付成功 · ${sc.label}`)
  }
}

/* ---- 全屏/小程序模式 ---- */
const isFullScreen = ref(false)

const activeScenarioLabel = computed(() => {
  if (currentState.value === 'failed') return `支付失败 · ${failTitle.value}`
  const s = scenarios.find(x => x.id === activeScenario.value)
  return s ? s.label : ''
})

/* ---- Demo 数据 ---- */
const orderNo = ref('VR202606070001')
const deviceLabel = ref('03号设备')
const storeName = ref('幻影星空馆 NO.8088')
const qrStatusHint = ref('设备端已创建待支付订单')

const demoMember = ref({
  name: '张小明',
  avatar: '',
  level: '黄金会员',
  discount: 9,
  balance: 256,
  coins: 100,
  points: 1280,
  tickets: 2,
  times: 5
})

const demoProduct = ref({
  name: '过山车VR',
  duration: 10,
  tag: '防眩晕体验',
  color: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
  iconSvg: '<polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/><line x1="12" y1="22" x2="12" y2="15.5"/><polyline points="22 8.5 12 15.5 2 8.5"/>'
})

const demoUnitPrice = ref(38)
const demoCouponDiscountAmount = ref(0)

const failTitle = ref('订单已失效')

/* ---- 应用场景预设 ---- */
function applyScenario(s) {
  activeScenario.value = s.id
  demoUnitPrice.value = s.unitPrice
  demoCouponDiscountAmount.value = s.coupon

  demoMember.value = {
    ...demoMember.value,
    discount: s.discount,
    balance: s.balance,
    coins: s.coins
  }
  currentState.value = 'confirm'
  addLog(`切换场景: ${s.label}`)
}

/* ---- Log ---- */
const log = ref([])
function addLog(msg) {
  const now = new Date()
  const t = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`
  log.value.unshift({ time: t, msg })
  if (log.value.length > 30) log.value.pop()
}

/* ---- 状态切换逻辑 ---- */
function switchState(key) {
  currentState.value = key
}

/* ---- 事件处理（自动流转） ---- */
function onConfirm(payload) {
  const scenario = payload?.scenario || 'normal'

  if (scenario === 'insufficient') {
    addLog(`确认并支付 (场景=预存款不足)`)
    setTimeout(() => { currentState.value = 'processing'; addLog('→ 跳转支付处理中') }, 400)
    setTimeout(() => { currentState.value = 'success'; addLog('→ 支付成功!') }, 2800)
  } else {
    addLog('确认并支付')
    setTimeout(() => { currentState.value = 'processing'; addLog('→ 跳转支付处理中') }, 400)
    setTimeout(() => { currentState.value = 'success'; addLog('→ 支付成功!') }, 2500)
  }
}
function onCancel() { addLog('用户取消') }
function onRetry() { addLog('点击重新扫描'); setTimeout(() => { currentState.value = 'loading' }, 300); setTimeout(() => { currentState.value = 'confirm'; addLog('→ 返回付款结算') }, 1500) }
function onDone() { addLog('用户点击完成'); setTimeout(() => { currentState.value = 'loading' }, 500) }
function onBack() { addLog('返回上一页'); currentState.value = 'loading' }
function onManualInput() { addLog('手动输入会员号') }
</script>

<style scoped>
.demo-root {
  min-height: 100vh;
  background: #080B12;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;
}

/* 全屏模式：去掉所有外边距，MiniPayFlow 占满视口 */
.demo-root--full {
  padding: 0;
  gap: 0;
  background: #0B0E17;
}

/* 工具栏 */
.demo-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 600px;
  justify-content: center;
}

.demo-root--full .demo-toolbar {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 100;
  width: auto;
  max-width: none;
}

.demo-btn--mode {
  padding: 7px 16px;
  font-size: 12px;
  font-weight: 700;
  background: rgba(124,58,237,0.15);
  border: 1px solid rgba(124,58,237,0.25);
  color: rgba(194,165,255,0.9);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 999px;
  cursor: pointer;
  transition: all 160ms ease;
  font-family: inherit;
}
.demo-btn--mode:hover {
  background: rgba(124,58,237,0.25);
}

.demo-toolbar-scene {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255,255,255,0.35);
  pointer-events: none;
}

/* 全屏下的 MiniPayFlow 撑满整个视口 */
.demo-fullscreen-flow {
  position: fixed;
  inset: 0;
  z-index: 1;
  overflow: hidden;
}

/* 只有需要滚动的页面才开放纵向滚动 */
.demo-fullscreen-flow :deep(.mp-page-confirm) {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

/* ===== 页面×场景层级导航 ===== */
.demo-pages {
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.demo-page-group {
  /* 一级标题区块 */
}

.demo-page-title {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 800;
  color: #c4b5fd;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding-left: 12px;
  border-left: 3px solid rgba(124,58,237,0.45);
}

.demo-page-scenarios {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding-left: 4px;
}

.demo-scenario-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px 4px 8px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.03);
  color: rgba(255,255,255,0.38);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 160ms ease;
  font-family: inherit;
  white-space: nowrap;
}
.demo-scenario-btn:hover {
  color: rgba(255,255,255,0.7);
  background: rgba(255,255,255,0.06);
}

.demo-scenario-btn.active {
  color: #fff;
  background: rgba(124,58,237,0.22);
  border-color: rgba(124,58,237,0.4);
  box-shadow: 0 0 12px rgba(124,58,237,0.12);
}

.demo-scenario-num {
  font-size: 10px;
  font-weight: 800;
  color: rgba(124,58,237,0.5);
  background: rgba(124,58,237,0.08);
  border-radius: 4px;
  padding: 1px 5px;
}
.demo-scenario-btn.active .demo-scenario-num {
  color: #A78BFA;
  background: rgba(124,58,237,0.18);
}

.demo-scenario-label {
  /* 场景名称 */
}

/* Phone frame */
.demo-phone {
  width: 375px;
  height: 720px;
  border-radius: 36px;
  overflow: hidden;
  background: #0B0E17;
  border: 2px solid #1e293b;
  box-shadow:
    0 0 0 1px #0f172a,
    0 24px 60px rgba(0,0,0,0.55),
    0 0 100px rgba(124,58,237,0.06);
  display: flex;
  flex-direction: column;
  position: relative;
}

.demo-statusbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 22px 6px;
  color: rgba(255,255,255,0.55);
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
  z-index: 20;
}

.demo-status-icons {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 600;
}

.demo-screen {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
}
.demo-screen::-webkit-scrollbar { width: 0; }

/* 加载/处理/失败状态：禁止滚动；成功状态允许滚动查看费用明细 */
.demo-screen:has(:deep(.mp-state--loading)),
.demo-screen:has(:deep(.mp-state--processing)),
.demo-screen:has(:deep(.mp-state--failed)) {
  overflow: hidden;
}

/* 全屏模式：成功页允许滚动 */
.demo-fullscreen-flow :deep(.mp-page-result) {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

/* Override shell inside phone */
.demo-screen :deep(.mp-shell) {
  min-height: auto;
  flex: 1;
  padding: 0;
}
.demo-screen :deep(.mp-shell::after) { display: none; }

/* Log panel */
.demo-log {
  width: 100%;
  max-width: 480px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 14px;
  padding: 14px 18px;
}

.demo-log h4 {
  margin: 0 0 10px;
  color: rgba(255,255,255,0.35);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.demo-empty {
  color: rgba(255,255,255,0.15);
  font-size: 12px;
  text-align: center;
  padding: 12px 0;
}

.demo-entry {
  display: flex;
  gap: 10px;
  padding: 4px 0;
  font-size: 12px;
  line-height: 1.45;
}

.demo-time {
  color: rgba(124,58,237,0.5);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

.demo-msg {
  color: rgba(255,255,255,0.4);
}
</style>
