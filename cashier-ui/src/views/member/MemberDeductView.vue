<template>
  <div class="deduct-view">
    <section class="deduct-left" aria-label="扣费项目">
      <!-- 未选择会员 -->
      <div v-if="!selectedMember" class="member-strip">
        <strong>未登入会员</strong>
        <div class="member-actions">
          <button class="mini-action" type="button" @click="showMemberSelect = true">
            <img class="mini-action-icon" src="/sale-icons/select-member.svg" alt="" />
            选择会员
          </button>
          <button class="mini-action" type="button" @click="showNewMember = true">
            <img class="mini-action-icon" src="/sale-icons/add-member.svg" alt="" />
            新增会员
          </button>
        </div>
      </div>

      <!-- 已选择会员 → 金色信息卡片 -->
      <div v-else class="member-card">
        <div class="mc-top-row">
          <div class="mc-profile">
            <img :src="selectedMemberAvatar" class="mc-avatar" :alt="selectedMember.name" @error="handleAvatarError" />
            <div class="mc-name-block">
              <span class="mc-name-line">
                <strong>{{ selectedMember.name }}</strong>
                <span v-if="selectedMember.level" class="mc-level-tag">{{ selectedMember.level }}</span>
              </span>
              <em>{{ selectedMember.phone }}</em>
            </div>
          </div>
          <div class="mc-btns">
            <button type="button" class="mc-btn" @click="showMemberSelect = true">切换会员</button>
            <button type="button" class="mc-btn" @click="handleLogout">退出登录</button>
          </div>
        </div>

        <div class="mc-stats">
          <div class="mc-stat-item">
            <strong>{{ selectedMember.balance ?? 0 }}</strong>
            <em>预存款</em>
          </div>
          <div class="mc-stat-item">
            <strong>{{ selectedMember.coins ?? 0 }}</strong>
            <em>游戏币</em>
            <span v-if="selectedMember.expireHint" class="mc-expire-hint">
              <el-icon><WarningFilled /></el-icon>
              {{ selectedMember.expireHint }}
            </span>
          </div>
          <div class="mc-stat-item">
            <strong>{{ selectedMember.tickets ?? 0 }}</strong>
            <em>套票</em>
          </div>
          <div class="mc-stat-item">
            <strong>{{ selectedMember.times ?? 0 }}</strong>
            <em>预存次数</em>
          </div>
        </div>
      </div>

      <!-- 扣费项目区域 -->
      <div class="catalog-panel">
        <header class="catalog-header">
          <strong class="catalog-title">扣费项目</strong>
          <span class="catalog-subtitle">选择需扣费的项目，确认后从会员账户扣除</span>
          <label class="search-box">
            <el-icon><Search /></el-icon>
            <input v-model="searchQuery" type="search" placeholder="搜索项目" />
          </label>
        </header>

        <div class="product-grid" role="list">
          <button
            v-for="item in filteredItems"
            :key="item.id"
            type="button"
            class="product-card"
            :class="{ active: isItemActive(item) }"
            role="listitem"
            @click="addToCart(item)"
          >
            <span class="product-thumb">
              <img :src="item.cover" :alt="item.name" />
            </span>
            <span class="product-copy">
              <strong>{{ item.name }}</strong>
              <em><span class="currency-symbol">¥</span>{{ item.price.toFixed(2) }}</em>
            </span>
            <span v-if="isItemActive(item)" class="product-badge">已选</span>
          </button>
        </div>
      </div>
    </section>

    <!-- 右侧：扣费结算面板 -->
    <aside class="checkout-panel" :aria-label="'扣费结算'">
      <header class="checkout-header">
        <strong>待扣费清单（{{ cartItems.length }}）</strong>
        <button type="button" @click="clearCart">清空</button>
      </header>

      <div class="cart-list">
        <article v-for="(item, index) in cartItems" :key="item.id" class="cart-item">
          <div class="cart-title-row">
            <strong>{{ item.name }}</strong>
            <em><span class="currency-symbol">¥</span>{{ (item.price * item.quantity).toFixed(2) }}</em>
          </div>
          <div class="cart-control-row">
            <button class="pill-btn" type="button" @click="removeFromCart(index)">删除</button>
            <div class="quantity-stepper" aria-label="调整数量">
              <button type="button" aria-label="减少数量" @click="decreaseQty(index)">
                <el-icon><Minus /></el-icon>
              </button>
              <input :value="item.quantity" readonly aria-label="当前数量" />
              <button class="add" type="button" aria-label="增加数量" @click="increaseQty(index)">
                <el-icon><Plus /></el-icon>
              </button>
            </div>
          </div>
        </article>

        <div v-if="cartItems.length === 0" class="cart-empty">
          <img src="/cart-empty-icon.png" alt="" class="cart-empty-icon" />
          <span class="cart-empty-text">请选择扣费项目</span>
          <span class="cart-empty-hint">点击左侧项目添加至扣费清单</span>
        </div>
      </div>

      <footer class="checkout-footer">
        <div class="summary-card">
          <div class="summary-line">
            <span>项目合计：</span>
            <strong><span class="currency-symbol">¥</span>{{ totalAmount.toFixed(2) }}</strong>
          </div>
          <div class="summary-line coupon-line">
            <div v-if="!selectedCoupon" class="coupon-trigger-wrap" @click="showCouponModal = true">
              <span>优惠券：</span>
              <button type="button">{{ availableCouponCount }} 张可用 &gt;</button>
            </div>
            <div v-else class="coupon-used-info">
              <div class="coupon-used-left">
                <span>促销优惠：</span>
                <em class="coupon-discount-amount">-¥{{ couponDiscount.toFixed(2) }}</em>
              </div>
              <div class="coupon-used-right">
                <span class="coupon-name-text">{{ selectedCoupon.name }}</span>
                <button type="button" class="coupon-remove-btn" @click.stop="removeCoupon" title="移除优惠券">
                  <el-icon><CircleCloseFilled /></el-icon>
                </button>
              </div>
            </div>
          </div>
          <div class="summary-total">
            <span>本次扣费</span>
            <strong><span class="currency-symbol">¥</span>{{ payableAmount.toFixed(2) }}</strong>
          </div>
          <div v-if="showBalanceDeductStatus" class="balance-status-card" :class="`balance-status-card--${balanceDeductTone}`">
            <div class="balance-status-copy">
              <strong>{{ balanceDeductTitle }}</strong>
              <span>{{ balanceDeductDescription }}</span>
            </div>
            <em>可用资产 ¥{{ memberTotalAssets.toFixed(2) }}</em>
          </div>
        </div>
        <button
          class="checkout-btn"
          type="button"
          :disabled="deductCheckoutDisabled"
          @click="handleDeduct"
        >
          <span>{{ deductCheckoutButtonText }}</span>
          <template v-if="showDeductCheckoutAmount">
            &nbsp;<span class="currency-symbol">¥</span>{{ payableAmount.toFixed(2) }}
          </template>
        </button>
        <div v-if="showGoRechargeAction" class="checkout-aux-actions">
          <button
            type="button"
            class="checkout-secondary-btn checkout-secondary-btn--accent"
            @click="goToRechargeTab"
          >
            去充值
          </button>
        </div>
      </footer>
    </aside>

    <!-- 弹窗 -->
    <MemberSelectModal
      :visible="showMemberSelect"
      :history-list="memberHistory"
      @close="showMemberSelect = false"
      @select="handleMemberSelected"
    />

    <NewMemberModal
      :visible="showNewMember"
      @close="showNewMember = false"
      @submit="handleNewMember"
    />

    <DeductionSuccessModal
      :visible="showDeductionSuccess"
      :count="deductionSuccessCount"
      :subtitle="'本次扣费如下'"
      :details="deductionSuccessDetails"
      :payment-lines="deductionPaymentLines"
      :asset-changes="deductionAssetChanges"
      @close="showDeductionSuccess = false"
    />

    <CouponSelectModal
      :visible="showCouponModal"
      :current-coupon-id="selectedCoupon?.id"
      :order-amount="totalAmount"
      :coupons="userCoupons"
      @close="showCouponModal = false"
      @select="handleCouponSelect"
    />

    <PaymentModal
      :visible="showConfirmModal"
      title="确认扣费"
      :items="confirmModalItems"
      :member="selectedMember"
      :total-amount="totalAmount"
      :coupon="selectedCoupon"
      :discount-amount="0"
      :payable-amount="payableAmount"
      :allowed-method-ids="[]"
      :default-method-id="''"
      :asset-deduction="confirmAssetDeduction"
      @close="showConfirmModal = false"
      @confirm="handleConfirmModal"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { CircleCloseFilled, Minus, Plus, Search, WarningFilled } from '@element-plus/icons-vue'
import MemberSelectModal from '../../components/MemberSelectModal.vue'
import NewMemberModal from '../../components/NewMemberModal.vue'
import DeductionSuccessModal from '../../components/DeductionSuccessModal.vue'
import CouponSelectModal from '../../components/CouponSelectModal.vue'
import PaymentModal from '../../components/PaymentModal.vue'

const router = useRouter()

const createCover = (accentA, accentB, glyph) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 152 152">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${accentA}" />
          <stop offset="100%" stop-color="${accentB}" />
        </linearGradient>
      </defs>
      <rect width="152" height="152" rx="18" fill="url(#bg)" />
      <circle cx="118" cy="34" r="22" fill="rgba(255,255,255,0.18)" />
      <circle cx="34" cy="120" r="28" fill="rgba(255,255,255,0.14)" />
      <path d="M30 104c14-28 34-45 58-52 15-4 24-2 34 3-12 2-21 8-29 19-8 11-15 22-33 30-10 4-20 4-30 0Z" fill="rgba(255,255,255,0.2)" />
      <text x="76" y="89" text-anchor="middle" font-size="52" font-weight="700" fill="white" font-family="Arial, sans-serif">${glyph}</text>
    </svg>
  `
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const histAvatar = (bg1, bg2) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><linearGradient id="h" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${bg1}"/><stop offset="100%" stop-color="${bg2}"/></linearGradient></defs><rect width="40" height="40" rx="20" fill="url(#h)"/><circle cx="20" cy="15" r="7" fill="rgba(255,255,255,0.9)"/><ellipse cx="20" cy="33" rx="12" ry="10" fill="rgba(255,255,255,0.85)"/></svg>`
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
}

const createFallbackAvatar = (name = '会') => histAvatar('#74b9ff', '#0984e3')

// ===== 状态 =====
const selectedMember = ref(null)
const showMemberSelect = ref(false)
const showNewMember = ref(false)
const showDeductionSuccess = ref(false)
const showCouponModal = ref(false)
const showConfirmModal = ref(false)
const searchQuery = ref('')
const avatarError = ref(false)
const deductionSuccessCount = ref(0)
const deductionSuccessDetails = ref([])
const deductionPaymentLines = ref([])
const deductionAssetChanges = ref([])

// ===== 优惠券系统 =====
const COUPON_POOL = [
  { id: 1, name: '9.9元体验1次', tag: '特价券', type: 'discount', value: '1.50', originalPrice: '58.00', condition: '满20可用', validity: '2024/12/13 ~ 2025/01/15', minAmount: 20, code: 'CP-9901', stores: '卓远亚运城店、卓远天河路店、卓远白云万达', projects: '可兑换1次 · 21个项目可选', projectList: ['VR过山车', '星际穿越', '海底探险', '时空穿梭', '密室逃脱VR', '射击战场VR', '极速滑雪VR', '飞行模拟VR', '恐龙世界VR', '太空漫步VR', '深海潜行VR', '魔法学院VR', '赛车狂飙VR', '僵尸围城VR', '地心历险VR', '奇幻漂流VR', '音乐节奏VR', '拳击对战VR', '西部枪战VR', '忍者训练VR', '末日求生VR'], dateRule: '无限制', otherRule: '暂无' },
  { id: 2, name: '10元优惠券', tag: '优惠券', type: 'discount', value: '10.00', originalPrice: '10.00', condition: '无门槛', validity: '2024/12/13 ~ 2025/06/30', minAmount: 0, code: 'CP-1001', stores: '全部门店通用', projects: '全部项目可用', projectList: ['全部项目可用'], dateRule: '无限制', otherRule: '单次仅可使用一张' },
  { id: 3, name: '8.8折畅玩券', tag: '折扣券', type: 'rate', value: '8.8', originalPrice: '无限制', condition: '无门槛', validity: '2024/12/13 ~ 2025/03/31', minAmount: 0, code: 'CP-8801', stores: '全部门店通用', projects: '全部项目可用', projectList: ['全部项目可用'], dateRule: '仅工作日可用', otherRule: '不可与其他优惠同享' },
  { id: 4, name: '新人立减5元券', tag: '新人券', type: 'discount', value: '5.00', originalPrice: '5.00', condition: '满50可用', validity: '2024/12/13 ~ 2025/12/31', minAmount: 50, code: 'CP-NEW5', stores: '全部门店通用', projects: '全部项目可用', projectList: ['全部项目可用'], dateRule: '无限制', otherRule: '仅限新注册会员使用' },
  { id: 5, name: '储值满300减30', tag: '储值券', type: 'discount', value: '30.00', originalPrice: '30.00', condition: '满300可用', validity: '2024/12/13 ~ 2025/06/30', minAmount: 300, code: 'CP-30030', stores: '全部门店通用', projects: '储值套餐专用', projectList: ['储值300送30', '储值500送80'], dateRule: '无限制', otherRule: '仅限储值类项目使用' },
  { id: 6, name: '9折优惠券', tag: '折扣券', type: 'rate', value: '9.0', originalPrice: '无限制', condition: '无门槛', validity: '2024/12/13 ~ 2025/09/30', minAmount: 0, code: 'CP-9001', stores: '全部门店通用', projects: '全部项目可用', projectList: ['全部项目可用'], dateRule: '无限制', otherRule: '可与其他优惠叠加使用' },
  { id: 7, name: '会员日立减8元', tag: '会员券', type: 'discount', value: '8.00', originalPrice: '8.00', condition: '无门槛', validity: '2024/12/13 ~ 2025/12/31', minAmount: 0, code: 'CP-MEM8', stores: '全部门店通用', projects: '全部项目可用', projectList: ['全部项目可用'], dateRule: '仅限每月15日使用', otherRule: '仅限会员日当天有效' },
]

const selectedCoupon = ref(null)
const userCoupons = ref([])

const pickRandomCoupons = (count) => {
  const pool = [...COUPON_POOL]
  const result = []
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length)
    result.push(pool.splice(idx, 1)[0])
  }
  return result
}

// ===== 扣费项目 =====
const deductionItems = ref([
  { id: 1, name: 'VR体验 30分钟', price: 9.90, desc: '单人设备', cover: createCover('#FF7A1A', '#FF6B00', 'VR') },
  { id: 2, name: 'VR体验 双人', price: 18.00, desc: '双人设备', cover: createCover('#FF8C33', '#FF7A1A', 'VR') },
  { id: 3, name: '赛车模拟 15分钟', price: 20.00, desc: '单人竞速', cover: createCover('#FFAB66', '#FF8C33', 'R') },
  { id: 4, name: '亲子互动区', price: 25.00, desc: '亲子娱乐', cover: createCover('#FFCC99', '#FFAB66', 'K') },
  { id: 5, name: '多人派对包厢', price: 80.00, desc: '四人起订', cover: createCover('#FF8C33', '#E85D00', 'P') },
  { id: 6, name: '游戏币 10枚', price: 10.00, desc: '即买即用', cover: createCover('#FFB3B3', '#FF8080', '10') },
  { id: 7, name: '游戏币 20枚', price: 20.00, desc: '即买即用', cover: createCover('#B3D4FF', '#80B0FF', '20') },
  { id: 8, name: '游戏币 50枚', price: 50.00, desc: '即买即用', cover: createCover('#B3E6B3', '#80D980', '50') },
  { id: 9, name: '套票扣次', price: 30.00, desc: '观影/体验', cover: createCover('#FFE0B3', '#FFB84D', 'T') },
  { id: 10, name: '观影体验', price: 35.00, desc: '影院场次', cover: createCover('#FFD9BF', '#F97316', 'M') },
])

const cartItems = ref([])

// ===== 历史会员 =====
const memberHistory = ref([
  { id: 101, name: '会员名', phone: '17600110765', avatar: histAvatar('#74b9ff', '#0984e3') },
  { id: 102, name: '会员名', phone: '17600110765', avatar: histAvatar('#fd79a8', '#e84393') },
  { id: 103, name: '会员名', phone: '17600110765', avatar: histAvatar('#55efc4', '#00b894') },
  { id: 104, name: '会员名', phone: '17600110765', avatar: histAvatar('#ffeaa7', '#fdcb6e') },
])

// ===== 计算属性 =====
const filteredItems = computed(() => {
  const keyword = searchQuery.value.trim()
  if (!keyword) return deductionItems.value
  const kw = keyword.toLowerCase()
  return deductionItems.value.filter(item =>
    item.name.toLowerCase().includes(kw) || item.desc.toLowerCase().includes(kw)
  )
})

const totalAmount = computed(() =>
  cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
)

const isCouponAvailable = (coupon, amount) => {
  if (!coupon) return false
  if (coupon.validity && coupon.validity.includes('过期')) return false
  const minAmount = Number(coupon.minAmount ?? 0)
  return Number(amount) > 0 && Number(amount) >= minAmount
}

const availableCouponCount = computed(() =>
  userCoupons.value.filter(coupon => isCouponAvailable(coupon, totalAmount.value)).length
)

const couponDiscount = computed(() => {
  if (!selectedCoupon.value) return 0
  const v = selectedCoupon.value.value
  if (selectedCoupon.value.type === 'rate') {
    return totalAmount.value - (totalAmount.value * parseFloat(v) / 10)
  }
  return parseFloat(v)
})

const payableAmount = computed(() => Math.max(0, (totalAmount.value - couponDiscount.value)))
watch(totalAmount, (amount) => {
  if (selectedCoupon.value && !isCouponAvailable(selectedCoupon.value, amount)) {
    selectedCoupon.value = null
  }
})
const memberBalance = computed(() => Number(selectedMember.value?.balance ?? 0))
const memberCoins = computed(() => Number(selectedMember.value?.coins ?? 0))
const memberTotalAssets = computed(() => Number((memberBalance.value + memberCoins.value).toFixed(2)))
const assetDeduction = computed(() => {
  let remaining = payableAmount.value
  const fromBalance = Math.min(remaining, memberBalance.value)
  remaining -= fromBalance
  const fromCoins = Math.min(remaining, memberCoins.value)
  remaining -= fromCoins
  return { fromBalance: Number(fromBalance.toFixed(2)), fromCoins: Number(fromCoins.toFixed(2)), external: Number(remaining.toFixed(2)) }
})
const canUseAssetsDeduct = computed(() =>
  !!selectedMember.value &&
  cartItems.value.length > 0 &&
  memberTotalAssets.value >= payableAmount.value
)
const showBalanceDeductStatus = computed(() =>
  !!selectedMember.value &&
  cartItems.value.length > 0
)
const balanceDeductTone = computed(() => canUseAssetsDeduct.value ? 'ready' : 'warning')
const balanceDeductTitle = computed(() => canUseAssetsDeduct.value ? '会员资产可覆盖' : '资产不足')
const balanceDeductDescription = computed(() => {
  if (!canUseAssetsDeduct.value) {
    const shortage = Number((payableAmount.value - memberTotalAssets.value).toFixed(2))
    return `还差 ¥${shortage}，请先充值后再扣费`
  }
  const d = assetDeduction.value
  const parts = []
  if (d.fromBalance > 0) parts.push(`预存款 ¥${d.fromBalance.toFixed(2)}`)
  if (d.fromCoins > 0) parts.push(`游戏币 ¥${d.fromCoins.toFixed(2)}`)
  return parts.length > 0 ? `本单将消耗：${parts.join(' + ')}` : `本单将从会员资产扣除 ¥${payableAmount.value.toFixed(2)}`
})
const deductCheckoutDisabled = computed(() => {
  if (!selectedMember.value || cartItems.value.length === 0) return true
  return !canUseAssetsDeduct.value
})
const deductCheckoutButtonText = computed(() => {
  if (!selectedMember.value || cartItems.value.length === 0) return '确认扣费'
  return canUseAssetsDeduct.value ? '确认扣费' : '资产不足'
})
const showDeductCheckoutAmount = computed(() =>
  !!selectedMember.value &&
  cartItems.value.length > 0 &&
  canUseAssetsDeduct.value
)
const showGoRechargeAction = computed(() =>
  !!selectedMember.value &&
  cartItems.value.length > 0 &&
  !canUseAssetsDeduct.value
)

const selectedMemberAvatar = computed(() => {
  if (avatarError.value) return createFallbackAvatar(selectedMember.value?.name)
  const avatar = selectedMember.value?.avatar
  if (typeof avatar === 'string' && avatar.trim()) return avatar
  return createFallbackAvatar(selectedMember.value?.name)
})

const deductionDetails = computed(() =>
  cartItems.value.map(item => ({
    label: item.name,
    subvalue: `${item.quantity} × ¥${item.price.toFixed(2)}`,
    value: `¥${(item.price * item.quantity).toFixed(2)}`
  }))
)

// ===== 方法 =====
const isItemActive = (item) => cartItems.value.some(ci => ci.id === item.id)

const addToCart = (item) => {
  if (isItemActive(item)) return
  cartItems.value.push({ ...item, quantity: 1 })
}

const removeFromCart = (index) => {
  cartItems.value.splice(index, 1)
}

const increaseQty = (index) => {
  cartItems.value[index].quantity += 1
}

const decreaseQty = (index) => {
  if (cartItems.value[index].quantity <= 1) {
    removeFromCart(index)
    return
  }
  cartItems.value[index].quantity -= 1
}

const clearCart = () => {
  cartItems.value = []
  showConfirmModal.value = false
}

const handleMemberSelected = (member) => {
  selectedMember.value = { ...member }
  showMemberSelect.value = false
  showConfirmModal.value = false
  const idx = memberHistory.value.findIndex(m => m.id === member.id)
  if (idx > -1) memberHistory.value.splice(idx, 1)
  memberHistory.value.unshift({
    id: member.id,
    name: member.name,
    phone: member.phone,
    avatar: member.avatar,
    level: member.level,
    balance: member.balance,
    coins: member.coins,
    tickets: member.tickets,
    times: member.times,
    expireHint: member.expireHint
  })
  const count = Math.floor(Math.random() * 5)
  userCoupons.value = pickRandomCoupons(count)
  selectedCoupon.value = null
  avatarError.value = false
}

const handleNewMember = (data) => {
  selectedMember.value = {
    id: Date.now(),
    name: data.name,
    phone: data.phone,
    avatar: createFallbackAvatar(data.name),
    level: '普通会员',
    gender: data.gender,
    birthday: data.birthday,
    balance: data.package && !data.package.name.includes('套票') ? data.package.price : 0,
    coins: 0,
    cardNo: data.cardNo || ''
  }
  showNewMember.value = false
  userCoupons.value = []
  selectedCoupon.value = null
}

const handleLogout = () => {
  selectedMember.value = null
  cartItems.value = []
  userCoupons.value = []
  selectedCoupon.value = null
  showConfirmModal.value = false
}

const handleAvatarError = () => {
  avatarError.value = true
}

const handleCouponSelect = (coupon) => {
  selectedCoupon.value = coupon
  showConfirmModal.value = false
}

const removeCoupon = () => {
  selectedCoupon.value = null
  showConfirmModal.value = false
}

const goToRechargeTab = () => {
  if (!selectedMember.value) return
  sessionStorage.setItem('sale:selected-member', JSON.stringify(selectedMember.value))
  router.push({ path: '/sale', query: { tab: 'recharge', member: '1' } })
}

// ===== PaymentModal 数据 =====
const confirmModalItems = computed(() =>
  cartItems.value.map(item => ({
    name: item.name,
    quantity: item.quantity,
    price: item.price
  }))
)
const confirmAssetDeduction = computed(() => ({
  prepaid: assetDeduction.value.fromBalance,
  coins: assetDeduction.value.fromCoins,
  external: assetDeduction.value.external
}))

const handleDeduct = () => {
  if (!canUseAssetsDeduct.value) return
  showConfirmModal.value = true
}

const handleConfirmModal = () => {
  showConfirmModal.value = false
  executeDeduct()
}

const executeDeduct = () => {
  if (!canUseAssetsDeduct.value) return
  const finalAmount = payableAmount.value
  const d = assetDeduction.value

  // §8.1 扣费前资产快照
  const assetBefore = {
    balance: memberBalance.value,
    coins: memberCoins.value
  }

  deductionSuccessCount.value = cartItems.value.length
  deductionSuccessDetails.value = [
    ...deductionDetails.value,
    { label: '商品合计', value: `¥${totalAmount.value.toFixed(2)}`, isSummary: true },
    ...(selectedCoupon.value ? [{ label: '优惠券', value: selectedCoupon.value.name, isSummary: true }] : []),
    ...(couponDiscount.value > 0 ? [{ label: '优惠合计', value: `-¥${couponDiscount.value.toFixed(2)}`, isSummary: true }] : []),
    ...(d.fromBalance > 0 ? [{ label: '预存款抵扣', value: `-¥${d.fromBalance.toFixed(2)}`, isSummary: true }] : []),
    ...(d.fromCoins > 0 ? [{ label: '游戏币抵扣', value: `-${d.fromCoins.toFixed(2)}`, isSummary: true }] : []),
    { label: '实扣金额', value: `¥${finalAmount.toFixed(2)}`, isSummary: true }
  ]

  // §10 结构化支付拆分行（展示在成功弹窗中）
  const paymentLines = []
  if (couponDiscount.value > 0) {
    paymentLines.push({ label: '优惠券', value: `-¥${couponDiscount.value.toFixed(2)}`, isDiscount: true })
  }
  if (d.fromBalance > 0) {
    paymentLines.push({ label: '预存款抵扣', value: `¥${d.fromBalance.toFixed(2)}`, isPayment: true })
  }
  if (d.fromCoins > 0) {
    paymentLines.push({ label: '游戏币抵扣', value: `${d.fromCoins.toFixed(2)}`, isPayment: true })
  }
  deductionPaymentLines.value = paymentLines

  selectedMember.value = {
    ...selectedMember.value,
    balance: Math.max(0, Number((assetBefore.balance - d.fromBalance).toFixed(2))),
    coins: Math.max(0, Number((assetBefore.coins - d.fromCoins).toFixed(2)))
  }

  // §8.1 扣费后资产变化
  const changes = []
  if (d.fromBalance > 0) {
    changes.push({ label: '预存款', before: `¥${assetBefore.balance.toFixed(2)}`, after: `¥${selectedMember.value.balance.toFixed(2)}` })
  }
  if (d.fromCoins > 0) {
    changes.push({ label: '游戏币', before: `${assetBefore.coins}`, after: `${selectedMember.value.coins}` })
  }
  deductionAssetChanges.value = changes

  const historyIndex = memberHistory.value.findIndex(member => member.id === selectedMember.value.id)
  if (historyIndex > -1) {
    memberHistory.value[historyIndex] = {
      ...memberHistory.value[historyIndex],
      balance: selectedMember.value.balance,
      coins: selectedMember.value.coins
    }
  }

  clearCart()
  selectedCoupon.value = null
  showDeductionSuccess.value = true
}
</script>

<style scoped>
.deduct-view {
  --card-radius: 8px;
  /* 设计稿配色：暖白底 + 橙色强调 */
  --bg-page: #FFFBF0;
  --bg-warm: #FFF5E6;
  --bg-card: #FFFFFF;
  --accent: #FF6B00;
  --accent-hover: #E85D00;
  --accent-light: #FFF0E0;
  --border: #EEE8E2;
  --border-active: #F8C97A;
  --text-primary: #333333;
  --text-secondary: #777777;
  --text-muted: #AAAAAA;
  --price-color: #FF6B00;

  height: 100%;
  max-height: 100%;
  display: grid;
  grid-template-columns: minmax(620px, 1fr) 388px;
  gap: 14px;
  padding: 14px 14px 0;
  background: var(--bg-page);
  overflow: hidden;
}

.deduct-left,
.checkout-panel {
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* ---- 未登录会员条 ---- */
.member-strip {
  min-height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 14px;
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0) 42%),
    linear-gradient(135deg, #ffe6b8 0%, #ffd99a 100%);
  box-shadow: none;
  overflow: hidden;
}

.member-strip > strong {
  font-size: 13px;
  font-weight: 800;
  color: #171b24;
}

.member-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.mini-action {
  min-width: 124px;
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 12px;
  border-radius: 9px;
  background: rgba(255, 248, 238, 0.88);
  color: #171b24;
  text-decoration: none;
  font-size: 12px;
  font-weight: 800;
  border: 1px solid rgba(255, 255, 255, 0.75);
  box-shadow: 0 2px 10px rgba(184, 106, 0, 0.08);
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.mini-action:hover {
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 4px 12px rgba(184, 106, 0, 0.12);
}

.mini-action-icon {
  width: 18px;
  height: 18px;
  display: block;
}

/* ---- 已登录会员信息卡片（蓝调） ---- */
.member-card {
  background: linear-gradient(135deg, #4a90ff 0%, #2563eb 50%, #1d4ed8 100%);
  border-radius: 12px;
  padding: 16px 18px 14px;
  color: #fff;
  box-shadow: 0 6px 24px rgba(37, 99, 235, 0.3);
}

.mc-top-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.mc-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.mc-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 2.5px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}

.mc-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.mc-name-line {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.mc-name-line strong {
  font-size: 15px;
  font-weight: 800;
  white-space: nowrap;
}

.mc-level-tag {
  font-size: 11px;
  font-weight: 700;
  padding: 1px 9px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(4px);
  letter-spacing: 0.5px;
}

.mc-name-block em {
  color: rgba(255, 255, 255, 0.75);
  font-style: normal;
  font-size: 12px;
  font-weight: 600;
}

.mc-btns {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.mc-btn {
  height: 30px;
  padding: 0 14px;
  border: 1.5px solid rgba(255, 255, 255, 0.4);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.mc-btn:hover {
  background: rgba(255, 255, 255, 0.32);
  border-color: rgba(255, 255, 255, 0.6);
}

/* 四列统计数据 */
.mc-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin-top: 14px;
  padding: 12px 4px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.mc-stat-item {
  text-align: center;
}

.mc-stat-item strong {
  display: block;
  font-size: 20px;
  font-weight: 900;
  line-height: 1.2;
  letter-spacing: -0.5px;
}

.mc-stat-item em {
  display: block;
  color: rgba(255, 255, 255, 0.65);
  font-style: normal;
  font-size: 13px;
  font-weight: 600;
  margin-top: 2px;
}

.mc-expire-hint {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-top: 3px;
  padding: 1px 7px;
  font-size: 10px;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
  background: #f59e0b;
  border-radius: 999px;
  white-space: nowrap;
}

.mc-expire-hint .el-icon {
  font-size: 11px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
}

/* ---- 项目目录 ---- */
.catalog-panel {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 14px 0 0;
}

.catalog-header {
  min-height: 58px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 4px 12px;
}

.catalog-title {
  font-size: 15px;
  font-weight: 900;
  color: var(--text-primary);
  white-space: nowrap;
}

.catalog-subtitle {
  flex: 1;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-box {
  width: 210px;
  height: 40px;
  flex: 0 0 210px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 18px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 13px;
}

.search-box input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  color: var(--text-primary);
  background: transparent;
}

/* ---- 项目网格 ---- */
.product-grid {
  min-height: 0;
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, minmax(260px, 1fr));
  align-content: start;
  gap: 14px;
  overflow-y: auto;
  padding: 2px 10px 10px 2px;
}

.product-card {
  min-height: 112px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: var(--card-radius);
  background: var(--bg-card);
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
  position: relative;
}

.product-card.active {
  border-color: var(--border-active);
  background: var(--accent-light);
  box-shadow: inset 0 0 0 1px var(--border-active);
}

.product-card:hover {
  border-color: var(--border-active);
  box-shadow: 0 8px 20px rgba(255, 107, 0, 0.08);
  transform: translateY(-1px);
}

.product-thumb {
  width: 76px;
  height: 76px;
  flex: 0 0 76px;
  display: block;
  overflow: hidden;
  border-radius: var(--card-radius);
  background: var(--bg-warm);
}

.product-thumb img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.product-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-self: center;
  justify-content: center;
  gap: 8px;
  margin-top: 2px;
}

.product-copy strong {
  font-size: 14px;
  font-weight: 800;
}

.product-copy em {
  color: var(--price-color);
  font-style: normal;
  font-weight: 900;
  font-size: 14px;
  font-variant-numeric: tabular-nums;
}

.product-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--accent);
  color: #fff;
  letter-spacing: 0.3px;
}

/* ---- 右侧结算面板 ---- */
.checkout-panel {
  border-radius: 8px 8px 0 0;
  background: linear-gradient(180deg, #FFF8EC 0%, #FFF0DC 40%, #FFE8CE 100%);
  overflow: hidden;
}

.checkout-header {
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
}

.checkout-header strong {
  font-size: 13px;
  font-weight: 900;
  color: var(--text-primary);
}

.checkout-header button {
  min-width: 70px;
  min-height: 34px;
  border: 0;
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-primary);
  cursor: pointer;
  font-weight: 800;
  font-size: 12px;
  transition: background 0.15s;
}

.checkout-header button:hover {
  background: var(--accent-light);
}

/* ---- 清单列表 ---- */
.cart-list {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 0 14px;
  gap: 12px;
}

.cart-item {
  padding: 18px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
}

.cart-title-row,
.cart-control-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.cart-title-row {
  margin-bottom: 18px;
}

.cart-title-row strong {
  font-size: 13px;
  color: var(--text-primary);
}

.cart-title-row em {
  color: var(--price-color);
  font-style: normal;
  font-weight: 900;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.pill-btn {
  min-width: 64px;
  min-height: 34px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--bg-card);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: background 0.15s;
}

.pill-btn:hover {
  background: var(--bg-warm);
  color: var(--accent);
}

.quantity-stepper {
  display: flex;
  align-items: center;
  gap: 6px;
}

.quantity-stepper button,
.quantity-stepper input {
  width: 34px;
  height: 34px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg-card);
  color: var(--text-primary);
  text-align: center;
}

.quantity-stepper button {
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: background 0.15s;
}

.quantity-stepper button:hover {
  background: var(--bg-warm);
}

.quantity-stepper .add {
  border-color: var(--accent);
  background: var(--accent);
  color: #fff;
}

.quantity-stepper .add:hover {
  background: var(--accent-hover);
  border-color: var(--accent-hover);
}

/* ---- 结算底部 ---- */
.checkout-footer {
  flex-shrink: 0;
  padding: 14px;
  background: transparent;
}

.summary-card {
  padding: 18px;
  border-radius: 16px;
  background: var(--bg-card);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06), 0 -2px 12px rgba(255, 107, 0, 0.05);
}

.summary-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 28px;
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 600;
}

.summary-line strong {
  color: var(--text-primary);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.summary-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  padding-top: 14px;
  border-top: 1px solid var(--border);
  font-size: 14px;
  font-weight: 900;
  color: var(--text-primary);
}

.summary-total strong {
  color: var(--price-color);
  font-size: 18px;
  font-weight: 900;
}

.balance-status-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid transparent;
}

.balance-status-card--ready {
  background: #effbf4;
  border-color: #b7ebc6;
}

.balance-status-card--warning {
  background: #fff6e8;
  border-color: #ffd8a8;
}

.balance-status-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.balance-status-copy strong {
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 800;
}

.balance-status-copy span {
  color: #5b6472;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
}

.balance-status-card em {
  flex-shrink: 0;
  color: var(--text-primary);
  font-style: normal;
  font-size: 12px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

/* ===== 优惠券区域 ===== */
.coupon-line {
  flex-wrap: wrap !important;
}

.coupon-trigger-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  width: 100%;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.coupon-trigger-wrap:hover {
  opacity: 0.8;
}

.coupon-trigger-wrap button {
  min-height: 28px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #4ea6ed;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.coupon-trigger-wrap button:hover {
  background: #f0f7ff;
  color: #3791ff;
}

.coupon-used-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 0;
  border-radius: 8px;
  background: var(--bg-card);
  width: 100%;
  flex: 1;
  animation: couponSlideIn 0.3s ease-out;
}

@keyframes couponSlideIn {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

.coupon-used-left {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.coupon-used-left span {
  font-size: 13px;
  color: var(--price-color);
  font-weight: 700;
}

.coupon-discount-amount {
  color: var(--price-color) !important;
  font-style: normal !important;
  font-weight: 900 !important;
  font-variant-numeric: tabular-nums;
}

.coupon-used-right {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.coupon-name-text {
  font-size: 11px;
  color: var(--price-color);
  font-weight: 600;
}

.summary-line .coupon-remove-btn {
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--price-color);
  cursor: pointer;
  padding: 0;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.summary-line .coupon-remove-btn .el-icon {
  font-size: 16px;
  color: currentColor;
}

.summary-line .coupon-remove-btn:hover {
  color: var(--price-color);
  transform: scale(1.1);
}

.summary-line .coupon-remove-btn:active {
  transform: scale(0.95);
}

/* ---- 结算按钮 ---- */
.checkout-btn {
  width: 100%;
  min-height: 48px;
  margin-top: 12px;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(90deg, #FF7A1A 0%, #FF5722 100%);
  color: #fff;
  cursor: pointer;
  font-size: 15px;
  font-weight: 800;
  box-shadow: 0 8px 20px rgba(255, 87, 34, 0.3);
  transition: opacity 0.2s, box-shadow 0.2s;
}

.checkout-btn:hover:not(:disabled) {
  box-shadow: 0 12px 28px rgba(255, 87, 34, 0.4);
}

.checkout-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
  box-shadow: none;
}

.checkout-aux-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.checkout-secondary-btn {
  flex: 1;
  min-height: 40px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  color: #9a3412;
  cursor: pointer;
  font-size: 13px;
  font-weight: 800;
  transition: border-color 0.15s ease, background-color 0.15s ease, color 0.15s ease;
}

.checkout-secondary-btn:hover {
  border-color: #fb923c;
  background: #fff7ed;
}

.checkout-secondary-btn--accent {
  border-color: #fed7aa;
  background: #fff7ed;
  color: #c2410c;
}

/* ---- 空购物车 ---- */
.cart-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 40px 20px;
}

.cart-empty .cart-empty-icon {
  width: 88px;
  height: 88px;
  object-fit: contain;
  opacity: 0.92;
}

.cart-empty-text {
  font-size: 15px;
  font-weight: 800;
  color: #667788;
  letter-spacing: 0.2px;
}

.cart-empty-hint {
  font-size: 12px;
  color: #9aa8b6;
  font-weight: 600;
}
</style>

<!-- 覆盖 element-plus 下拉样式 -->
<style>
.deduct-view .el-select .el-input__wrapper {
  border-color: #EEE8E2;
  box-shadow: none;
}

.deduct-view .el-select .el-input__wrapper:hover {
  border-color: #F5A623;
}

.deduct-view .el-select .el-input__wrapper.is-focus {
  border-color: #F5A623;
  box-shadow: 0 0 0 1px #F5A623;
}

/* 统一滚动条：黑色半透明 15% */
.deduct-view ::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.deduct-view ::-webkit-scrollbar-track {
  background: transparent;
}
.deduct-view ::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 3px;
}
.deduct-view ::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.25);
}
</style>
