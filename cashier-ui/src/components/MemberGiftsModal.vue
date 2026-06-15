<template>
  <transition name="modal-fade">
    <div
      v-if="visible"
      class="mgm-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="赠送活动"
      @click.self="$emit('close')"
    >
      <section class="mgm-dialog">
        <!-- 头部 -->
        <header class="mgm-header">
          <h2>赠送活动</h2>
          <div class="mgm-header-actions">
            <span class="mgm-count">{{ eligibleCount }} / {{ gifts.length }} 可发放</span>
            <button type="button" class="mgm-close" aria-label="关闭" @click="$emit('close')">
              <el-icon><Close /></el-icon>
            </button>
          </div>
        </header>

        <!-- 搜索栏 -->
        <div class="mgm-toolbar">
          <div class="mgm-search-box">
            <el-icon><Search /></el-icon>
            <input v-model="searchText" type="text" placeholder="搜索活动名称或门店" />
          </div>
          <div class="mgm-toolbar-right">
            <button type="button" class="mgm-search-btn" @click="toggleFilterAvailable">
              <template v-if="filterAvailable">全部活动</template>
              <template v-else>仅看可发放</template>
            </button>
          </div>
        </div>

        <!-- 活动列表 -->
        <div class="mgm-body">
          <article
            v-for="gift in filteredGifts"
            :key="gift.id"
            class="mgm-gift-card"
            :class="{
              'is-stopped': !gift.status,
              'is-confirming': confirmingId === gift.id,
              'is-issued': issuedIds.has(gift.id)
            }"
          >
            <div class="mgm-card-top">
              <!-- 左侧信息 -->
              <div class="mgm-card-left">
                <h3 class="mgm-card-title">{{ gift.name }}</h3>
                <div class="mgm-card-meta">
                  <span class="mgm-card-shop">{{ gift.shopName }}</span>
                  <span v-if="gift.count != null" class="mgm-meta-sep">·</span>
                  <span v-if="gift.count != null" class="mgm-card-count">已发 {{ gift.count }} 次</span>
                </div>
              </div>
              <!-- 右侧状态 -->
              <div class="mgm-card-badge-area">
                <span v-if="issuedIds.has(gift.id)" class="mgm-badge-issued">已赠送</span>
                <span v-else-if="!gift.status" class="mgm-badge-stopped">已停售</span>
                <span v-else-if="isGiftEligible(gift)" class="mgm-badge-ready">可发放</span>
                <span v-else class="mgm-badge-locked">不满足条件</span>
              </div>
            </div>

            <!-- 赠送内容 -->
            <div class="mgm-card-reward">
              <div class="mgm-reward-row">
                <template v-if="gift.giftPoints > 0">
                  <span class="mgm-reward-num">{{ gift.giftPoints.toLocaleString() }}</span>
                  <span class="mgm-reward-label">游戏币</span>
                  <span v-if="gift.pointsValidText" class="mgm-reward-valid">({{ gift.pointsValidText }})</span>
                </template>
                <template v-if="gift.giftTimes > 0">
                  <span v-if="gift.giftPoints > 0" class="mgm-reward-plus">+</span>
                  <span class="mgm-reward-num">{{ gift.giftTimes }}次</span>
                  <span class="mgm-reward-label">体验</span>
                  <span v-if="gift.timesValidText && gift.timesValidText !== '-'" class="mgm-reward-valid">({{ gift.timesValidText }})</span>
                </template>
              </div>
            </div>

            <!-- 发放条件/适用规则 -->
            <div class="mgm-card-info">
              <div class="mgm-info-row">
                <span class="mgm-info-label">条件</span>
                <span class="mgm-info-value">{{ conditionDesc(gift) }}</span>
              </div>
              <div v-if="gift.memberTypes && gift.memberTypes.length > 0" class="mgm-info-row">
                <span class="mgm-info-label">适用</span>
                <span class="mgm-info-value">{{ memberTypeDesc(gift.memberTypes) }}</span>
              </div>
            </div>

            <!-- 不满足原因 -->
            <div v-if="gift.status && !isGiftEligible(gift) && !issuedIds.has(gift.id)" class="mgm-card-reason">
              {{ ineligibleReason(gift) }}
            </div>

            <!-- 操作区域 -->
            <div class="mgm-card-action-area">
              <button
                v-if="gift.status && isGiftEligible(gift) && !issuedIds.has(gift.id) && confirmingId !== gift.id"
                type="button"
                class="mgm-issue-btn"
                @click.stop="startConfirm(gift.id)"
              >
                赠送
              </button>

              <span v-if="issuedIds.has(gift.id) && confirmingId !== gift.id" class="mgm-issued-msg">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                已成功赠送
              </span>

              <!-- 确认面板 -->
              <div v-if="confirmingId === gift.id" class="mgm-confirm-panel">
                <p class="mgm-confirm-text">确认向 <strong>{{ memberName }}</strong> 赠送「{{ gift.name }}」？</p>
                <div class="mgm-confirm-actions">
                  <button type="button" class="mgm-confirm-cancel" @click.stop="cancelConfirm">取消</button>
                  <button type="button" class="mgm-confirm-ok" @click.stop="issueGift(gift)">确认赠送</button>
                </div>
              </div>
            </div>
          </article>

          <div v-if="filteredGifts.length === 0" class="mgm-empty">
            <div class="mgm-empty-illustration">
              <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- 外圈 -->
                <circle cx="60" cy="60" r="58" stroke="#e2e6ed" stroke-width="2" stroke-dasharray="6 4" />
                <!-- 盒子主体 -->
                <rect x="32" y="52" width="56" height="44" rx="8" fill="#f1f5f9" stroke="#dde3ec" stroke-width="1.5" />
                <!-- 盒子盖 -->
                <path d="M28 48C28 44.6863 30.6863 42 34 42H86C89.3137 42 92 44.6863 92 48V52H28V48Z" fill="#f8fafc" stroke="#dde3ec" stroke-width="1.5" />
                <!-- 丝带竖 -->
                <line x1="60" y1="42" x2="60" y2="96" stroke="#cbd5e1" stroke-width="2" />
                <!-- 丝带横 -->
                <line x1="32" y1="68" x2="88" y2="68" stroke="#cbd5e1" stroke-width="2" />
                <!-- 蝴蝶结左 -->
                <ellipse cx="53" cy="45" rx="5" ry="8" fill="#e2e6ed" transform="rotate(-30 53 45)" />
                <!-- 蝴蝶结右 -->
                <ellipse cx="67" cy="45" rx="5" ry="8" fill="#e2e6ed" transform="rotate(30 67 45)" />
                <!-- 蝴蝶结中心 -->
                <circle cx="60" cy="46" r="4" fill="#cbd5e1" />
              </svg>
            </div>
            <p class="mgm-empty-title">{{ searchText ? '未找到匹配的活动' : '暂无赠送活动' }}</p>
            <p class="mgm-empty-desc">{{ searchText ? '换个关键词试试' : '当前没有可发放的赠送活动' }}</p>
          </div>
        </div>

        <!-- 底部 -->
        <footer class="mgm-footer">
          <button type="button" class="mgm-close-btn" @click="$emit('close')">关闭</button>
        </footer>
      </section>
    </div>
  </transition>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Close, Search } from '@element-plus/icons-vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  gifts: { type: Array, default: () => [] },
  memberLevelKey: { type: String, default: 'normal' },
  memberName: { type: String, default: '会员' },
  memberBirthday: { type: String, default: '' }
})

const emit = defineEmits(['close', 'issue'])

const searchText = ref('')
const confirmingId = ref(null)
const issuedIds = ref(new Set())
const filterAvailable = ref(false)

/* ===== eligibility ===== */
const isGiftEligible = (gift) => {
  if (!gift.status) return false
  // 检查会员等级
  if (gift.memberTypes && gift.memberTypes.length > 0) {
    if (!gift.memberTypes.includes(props.memberLevelKey)) return false
  }
  // 生日活动：校验是否在有效期内（生日当月）
  if (gift.condition === 'birthday') {
    if (!props.memberBirthday) return false
    const bd = props.memberBirthday
    const now = new Date()
    // 支持 '1993-12-12' 或 '12-12' 格式
    const parts = bd.split('-')
    let birthMonth
    if (parts.length === 3) {
      birthMonth = parseInt(parts[1], 10)
    } else if (parts.length === 2) {
      birthMonth = parseInt(parts[0], 10)
    } else {
      return false
    }
    if (gift.birthdayRange === 'month') {
      return now.getMonth() + 1 === birthMonth
    }
    return false
  }
  // consume / recharge / package 等由收银员根据实际情况判断
  // 只要等级满足即可发放
  return true
}

const ineligibleReason = (gift) => {
  // 等级不满足
  if (gift.memberTypes && gift.memberTypes.length > 0 && !gift.memberTypes.includes(props.memberLevelKey)) {
    return '当前会员等级不满足此活动要求'
  }
  // 生日不满足
  if (gift.condition === 'birthday') {
    if (!props.memberBirthday) return '未设置会员生日，无法发放'
    const bd = props.memberBirthday
    const parts = bd.split('-')
    const month = parts.length === 3 ? parseInt(parts[1], 10) : (parts.length === 2 ? parseInt(parts[0], 10) : 0)
    if (!month) return '会员生日信息格式有误'
    const monthNames = ['', '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    return `该活动仅限生日当月发放，当前非会员生日月（${monthNames[month]}）`
  }
  return ''
}

const eligibleCount = computed(() => {
  return props.gifts.filter(g => g.status && isGiftEligible(g)).length
})

/* ===== labels ===== */
const conditionDesc = (gift) => {
  const c = gift.condition
  if (c === 'consume') return `单笔消费满 ¥${gift.threshold} 即可获赠`
  if (c === 'recharge') return `单笔充值满 ¥${gift.threshold} 即可获赠`
  if (c === 'birthday') {
    const rangeMap = { birthday: '生日当天', week: '生日当周', month: '生日当月' }
    return `会员${rangeMap[gift.birthdayRange] || '生日当天'}可获赠`
  }
  return ''
}

const memberTypeDesc = (types) => {
  const map = { normal: '普通会员', bronze: '青铜会员', silver: '银卡会员', gold: '金卡会员', diamond: '钻石会员' }
  return types.map(t => map[t] || t).join('、')
}

/* ===== search & filter ===== */
const filteredGifts = computed(() => {
  // 已停售/失效的活动、已赠送的活动始终不显示
  let list = props.gifts.filter(g => g.status && !issuedIds.value.has(g.id))
  // 仅看可发放
  if (filterAvailable.value) {
    list = list.filter(g => isGiftEligible(g))
  }
  // 搜索
  const keyword = searchText.value.trim()
  if (!keyword) return list
  const kw = keyword.toLowerCase()
  return list.filter(g =>
    g.name.toLowerCase().includes(kw) ||
    (g.shopName && g.shopName.toLowerCase().includes(kw))
  )
})

const toggleFilterAvailable = () => {
  filterAvailable.value = !filterAvailable.value
}

/* ===== issue flow ===== */
const startConfirm = (id) => {
  confirmingId.value = id
}

const cancelConfirm = () => {
  confirmingId.value = null
}

const issueGift = (gift) => {
  const s = new Set(issuedIds.value)
  s.add(gift.id)
  issuedIds.value = s
  confirmingId.value = null
  emit('issue', gift)
}

/* ===== reset on open ===== */
watch(() => props.visible, (val) => {
  if (val) {
    searchText.value = ''
    confirmingId.value = null
    issuedIds.value = new Set()
    filterAvailable.value = false
  }
})
</script>

<style scoped>
/* ===== 遮罩层 ===== */
.mgm-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(10, 12, 18, 0.48);
  backdrop-filter: blur(4px);
}

/* ===== 弹窗主体 ===== */
.mgm-dialog {
  width: min(100%, 600px);
  height: 660px;
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  overflow: hidden;
  background: #f8f9fb;
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.04),
    0 16px 40px rgba(0, 0, 0, 0.12),
    0 40px 80px rgba(0, 0, 0, 0.16);
}

/* ---- 头部 ---- */
.mgm-header {
  flex-shrink: 0;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px 0 24px;
  background: #fff;
  border-bottom: 1px solid #eef1f5;
}

.mgm-header h2 {
  margin: 0;
  color: #1a1a2e;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.2px;
}

.mgm-header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mgm-count {
  font-size: 12px;
  font-weight: 600;
  color: #5b677b;
  background: #f2f4f8;
  padding: 4px 12px;
  border-radius: 6px;
  letter-spacing: 0.2px;
}

.mgm-close {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.18s ease;
}

.mgm-close:hover {
  background: #f1f5f9;
  color: #475569;
}

.mgm-close .el-icon {
  font-size: 20px;
}

/* ---- 搜索栏 ---- */
.mgm-toolbar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border-bottom: 1px solid #eef1f5;
  background: #fff;
}

.mgm-search-box {
  flex: 1;
  height: 38px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  border: 1px solid #e2e6ed;
  border-radius: 8px;
  background: #f8f9fb;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.mgm-search-box:focus-within {
  border-color: #c4ccd8;
  box-shadow: 0 0 0 3px rgba(100, 116, 139, 0.06);
  background: #fff;
}

.mgm-search-box .el-icon {
  font-size: 15px;
  color: #94a3b8;
  flex-shrink: 0;
}

.mgm-search-box input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  font-size: 13px;
  color: #1e293b;
  background: transparent;
}

.mgm-search-box input::placeholder {
  color: #b0b8c4;
  font-weight: 400;
}

.mgm-toolbar-right {
  flex-shrink: 0;
}

.mgm-search-btn {
  height: 38px;
  padding: 0 16px;
  border: 1px solid #e2e6ed;
  border-radius: 8px;
  background: #fff;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
  white-space: nowrap;
}

.mgm-search-btn:hover {
  border-color: #c4ccd8;
  background: #f8f9fb;
  color: #475569;
}

/* ---- 列表主体 ---- */
.mgm-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ===== 活动卡片 ===== */
.mgm-gift-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 18px 20px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid #eef1f5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.mgm-gift-card:hover {
  border-color: #dde3ec;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.mgm-gift-card.is-stopped {
  opacity: 0.5;
  pointer-events: none;
}

.mgm-gift-card.is-stopped:hover {
  border-color: #eef1f5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.mgm-gift-card.is-issued {
  border-color: #e2e8f0;
}

/* ---- 卡片顶部信息行 ---- */
.mgm-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.mgm-card-left {
  flex: 1;
  min-width: 0;
}

.mgm-card-title {
  margin: 0 0 5px;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.35;
  letter-spacing: -0.2px;
}

.mgm-card-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}

.mgm-card-shop {
  color: #94a3b8;
}

.mgm-meta-sep {
  margin: 0 4px;
  color: #cbd5e1;
}

.mgm-card-count {
  color: #b0b8c4;
}

/* ---- 状态标识 ---- */
.mgm-card-badge-area {
  flex-shrink: 0;
}

.mgm-badge-ready,
.mgm-badge-issued,
.mgm-badge-stopped,
.mgm-badge-locked {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  letter-spacing: 0.2px;
}

.mgm-badge-ready {
  background: #ecfdf3;
  color: #0d8a3e;
  border: 1px solid rgba(13, 138, 62, 0.12);
}

.mgm-badge-issued {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.mgm-badge-stopped {
  background: #f8fafc;
  color: #b0b8c4;
  border: 1px solid #e2e8f0;
}

.mgm-badge-locked {
  background: #fff;
  color: #c0c8d4;
  border: 1px solid #eef1f5;
}

/* ---- 赠送内容 ---- */
.mgm-card-reward {
  margin-bottom: 10px;
}

.mgm-reward-row {
  display: flex;
  align-items: baseline;
  gap: 5px;
  flex-wrap: wrap;
  padding: 10px 16px;
  border-radius: 10px;
  background: #f8f9fb;
}

.mgm-reward-num {
  font-size: 20px;
  font-weight: 900;
  color: #0f172a;
  line-height: 1;
  letter-spacing: -0.4px;
  font-variant-numeric: tabular-nums;
}

.mgm-reward-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  letter-spacing: 0.2px;
}

.mgm-reward-plus {
  font-size: 13px;
  font-weight: 700;
  color: #c0c8d4;
  margin: 0 4px;
}

.mgm-reward-valid {
  font-size: 11px;
  color: #b0b8c4;
  font-weight: 500;
}

/* ---- 条件/规则信息 ---- */
.mgm-card-info {
  margin-bottom: 4px;
}

.mgm-info-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 12px;
  line-height: 1.7;
}

.mgm-info-label {
  flex-shrink: 0;
  width: 32px;
  color: #b0b8c4;
  font-weight: 500;
}

.mgm-info-value {
  color: #94a3b8;
}

/* ---- 提示信息 ---- */
.mgm-card-reason {
  margin-top: 8px;
  padding: 8px 14px;
  border-radius: 8px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
  line-height: 1.5;
}

/* ---- 操作区域 ---- */
.mgm-card-action-area {
  margin-top: 12px;
}

.mgm-issue-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  height: 36px;
  padding: 0 20px;
  border: 0;
  border-radius: 8px;
  background: #0f172a;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s ease;
  letter-spacing: 0.3px;
}

.mgm-issue-btn:hover {
  background: #1e293b;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
  transform: translateY(-1px);
}

.mgm-issue-btn:active {
  transform: translateY(0);
  box-shadow: none;
}

/* 已赠送反馈 */
.mgm-issued-msg {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #0d8a3e;
}

.mgm-issued-msg svg {
  color: #0d8a3e;
}

/* ---- 确认面板 ---- */
.mgm-confirm-panel {
  padding: 14px 16px;
  border-radius: 10px;
  background: #fafbfd;
  border: 1px solid #eef1f5;
}

.mgm-confirm-text {
  margin: 0 0 12px;
  font-size: 13px;
  color: #475569;
  line-height: 1.6;
}

.mgm-confirm-text strong {
  color: #0f172a;
  font-weight: 700;
}

.mgm-confirm-actions {
  display: flex;
  gap: 10px;
}

.mgm-confirm-cancel,
.mgm-confirm-ok {
  flex: 1;
  height: 36px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s ease;
  letter-spacing: 0.2px;
}

.mgm-confirm-cancel {
  border: 1px solid #e2e6ed;
  background: #fff;
  color: #64748b;
}

.mgm-confirm-cancel:hover {
  border-color: #c4ccd8;
  background: #f8f9fb;
  color: #475569;
}

.mgm-confirm-ok {
  border: 0;
  background: #0f172a;
  color: #fff;
}

.mgm-confirm-ok:hover {
  background: #1e293b;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.18);
}

/* ---- 空状态 ---- */
.mgm-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  padding: 40px 20px;
}

.mgm-empty-illustration {
  margin-bottom: 24px;
  opacity: 0.6;
}

.mgm-empty-illustration svg {
  width: 120px;
  height: 120px;
}

.mgm-empty-title {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: -0.1px;
}

.mgm-empty-desc {
  margin: 0;
  font-size: 13px;
  color: #b0b8c4;
  font-weight: 500;
}

/* ---- 底部 ---- */
.mgm-footer {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  padding: 16px 24px 20px;
  background: #fff;
  border-top: 1px solid #eef1f5;
}

.mgm-close-btn {
  width: 160px;
  height: 42px;
  border: 1px solid #e2e6ed;
  border-radius: 10px;
  background: #fff;
  color: #64748b;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s ease;
  letter-spacing: 0.2px;
}

.mgm-close-btn:hover {
  background: #f8f9fb;
  border-color: #c4ccd8;
  color: #475569;
}

/* ===== 过渡动画 ===== */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.22s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
