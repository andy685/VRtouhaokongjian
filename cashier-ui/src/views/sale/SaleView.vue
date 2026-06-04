<template>
  <div class="sale-view">
    <section class="sale-left" aria-label="销售项目">
      <!-- 未选择会员 → 简洁条 -->
      <div v-if="!selectedMember" class="member-strip">
        <strong>未登入会员</strong>
        <div class="member-actions">
          <button class="mini-action" type="button" @click="showMemberSelect = true">
            <el-icon><Search /></el-icon>
            选择会员
          </button>
          <button class="mini-action" type="button" @click="showNewMember = true">
            <el-icon><UserFilled /></el-icon>
            新增会员
          </button>
        </div>
      </div>

      <!-- 已选择会员 → 蓝色信息卡片 -->
      <div v-else class="member-card">
        <div class="mc-top-row">
          <div class="mc-profile">
            <img :src="selectedMember.avatar" class="mc-avatar" :alt="selectedMember.name" />
            <div class="mc-name-block">
              <span class="mc-name-line">
                <strong>{{ selectedMember.name }}</strong>
                <span v-if="selectedMember.level" class="mc-level-tag">{{ selectedMember.level }}</span>
              </span>
              <em>{{ selectedMember.phone }}</em>
            </div>
          </div>
          <div class="mc-btns">
            <button type="button" class="mc-btn" @click="showDeductionModal = true">去扣费</button>
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

      <div class="catalog-panel">
        <header class="catalog-header">
          <nav class="sale-tabs" aria-label="销售分类">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              type="button"
              class="sale-tab"
              :class="{ active: activeTab === tab.id }"
              @click="activeTab = tab.id"
            >
              {{ tab.name }}
            </button>
          </nav>

          <label class="search-box">
            <el-icon><Search /></el-icon>
            <input v-model="searchQuery" type="search" placeholder="搜索" />
          </label>
        </header>

        <div class="product-grid" role="list">
          <button
            v-for="product in filteredProducts"
            :key="product.id"
            type="button"
            class="product-card"
            :class="{ active: cartItems.some((item) => item.id === product.id) }"
            role="listitem"
            @click="addToCart(product)"
          >
            <span class="product-thumb">
              <img :src="product.cover" :alt="product.name" />
            </span>
            <span class="product-copy">
              <strong>{{ product.name }}</strong>
              <em><span class="currency-symbol">¥</span>{{ product.price.toFixed(2) }}</em>
            </span>
          </button>
        </div>
      </div>
    </section>

    <aside class="checkout-panel" aria-label="结账单">
      <header class="checkout-header">
        <strong>结账单（{{ cartItems.length }}）</strong>
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
          <span>购物车空空 咱也没有</span>
        </div>
      </div>

      <footer class="checkout-footer">
        <div class="summary-card">
          <!-- 合计 -->
          <div class="summary-line">
            <span>合计：</span>
            <strong><span class="currency-symbol">¥</span>{{ totalAmount.toFixed(2) }}</strong>
          </div>
          <!-- 优惠券区域 — 使用后展示折扣信息 -->
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
          <!-- 实付 -->
          <div class="summary-total">
            <span>实付</span>
            <strong><span class="currency-symbol">¥</span>{{ payableAmount.toFixed(2) }}</strong>
          </div>
        </div>
        <button class="checkout-btn" type="button" :disabled="cartItems.length === 0" @click="checkout">
          去结算&nbsp; <span class="currency-symbol">¥</span>{{ payableAmount.toFixed(2) }}
        </button>
      </footer>
    </aside>

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

    <CouponSelectModal
      :visible="showCouponModal"
      :current-coupon-id="selectedCoupon?.id"
      :order-amount="totalAmount"
      :coupons="userCoupons"
      @close="showCouponModal = false"
      @select="handleCouponSelect"
    />

    <PaymentModal
      :visible="showPaymentModal"
      :items="cartItems"
      :member="selectedMember"
      :total-amount="totalAmount"
      :coupon="selectedCoupon"
      :discount-amount="couponDiscount"
      :payable-amount="payableAmount"
      @close="showPaymentModal = false"
      @confirm="handlePaymentConfirm"
    />

    <MemberDeductionModal
      :visible="showDeductionModal"
      :devices="deductionDevices"
      :member="selectedMember"
      @close="showDeductionModal = false"
      @confirm="handleDeductionConfirm"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { CircleCloseFilled, Minus, Plus, Search, UserFilled, WarningFilled } from '@element-plus/icons-vue'
import MemberSelectModal from '../../components/MemberSelectModal.vue'
import NewMemberModal from '../../components/NewMemberModal.vue'
import CouponSelectModal from '../../components/CouponSelectModal.vue'
import PaymentModal from '../../components/PaymentModal.vue'
import MemberDeductionModal from '../../components/MemberDeductionModal.vue'

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

const tabs = [
  { id: 'single', name: '单次消费' },
  { id: 'recharge', name: '充值活动' },
  { id: 'package', name: '套票' },
  { id: 'product', name: '商品' }
]

const selectedMember = ref(null)
const showMemberSelect = ref(false)
const showNewMember = ref(false)
const showCouponModal = ref(false)
const showPaymentModal = ref(false)
const showDeductionModal = ref(false)
const selectedCoupon = ref(null)

// 扣费设备列表（mock）
const deductionDevices = ref([
  { id: 'dev-01', name: 'VR体验设备A', price: 9.90 },
  { id: 'dev-02', name: 'VR体验设备B', price: 15.00 },
  { id: 'dev-03', name: 'VR游戏机', price: 20.00 }
])

// ===== 优惠券系统 =====
// 主券池
const COUPON_POOL = [
  {
    id: 1,
    name: '9.9元体验1次',
    tag: '特价券',
    type: 'discount',
    value: '1.50',
    originalPrice: '58.00',
    condition: '满20可用',
    validity: '2024/12/13 ~ 2025/01/15',
    minAmount: 20,
    code: 'CP-9901',
    stores: '卓远亚运城店、卓远天河路店、卓远白云万达',
    projects: '可兑换次，21个项目可选',
    dateRule: '无限制',
    otherRule: '暂无'
  },
  {
    id: 2,
    name: '10元优惠券',
    tag: '特享券',
    type: 'discount',
    value: '10.00',
    originalPrice: null,
    condition: '不限',
    validity: '2024/12/13 ~ 2025/01/15',
    minAmount: 0,
    code: 'CP-TX02',
    stores: '卓远设备项目、普德信乐、套餐充值、套票、商品',
    projects: '卓远天河路店、卓远亚运城店、佛山顺德店、幻影星空体验店 NO.14692',
    dateRule: '无限制',
    otherRule: '暂无'
  },
  {
    id: 3,
    name: '8.8折畅玩券',
    tag: '折扣券',
    type: 'rate',
    value: '8.8',
    originalPrice: null,
    condition: '全场可用',
    validity: '2025/06/15 ~ 2025/08/31',
    minAmount: 0,
    code: 'CP-DZ03',
    stores: '全门店通用',
    projects: '全场消费项目可用',
    dateRule: '仅限工作日使用',
    otherRule: '不可与其他优惠叠加'
  },
  {
    id: 4,
    name: '新人立减5元券',
    tag: '新人',
    type: 'discount',
    value: '5.00',
    originalPrice: null,
    condition: '满50可用',
    validity: '2025/01/01 ~ 2025/07/31',
    minAmount: 50,
    code: 'CP-NR04',
    stores: '全门店通用',
    projects: '单次消费类目可用',
    dateRule: '无限制',
    otherRule: '仅限首次到店会员'
  },
  {
    id: 6,
    name: '储值满300减30',
    tag: '特价券',
    type: 'discount',
    value: '30.00',
    originalPrice: null,
    condition: '满300可用',
    validity: '2025/06/01 ~ 2025/09/01',
    minAmount: 300,
    code: 'CP-CZ06',
    stores: '卓远亚运城店、卓远天河路店',
    projects: '储值活动专用',
    dateRule: '周末及节假日不可用',
    otherRule: '每用户限用1张'
  },
  {
    id: 7,
    name: '9折优惠券',
    tag: '折扣券',
    type: 'rate',
    value: '9.0',
    originalPrice: null,
    condition: '全场可用',
    validity: '长期有效',
    minAmount: 0,
    code: 'CP-ZK07',
    stores: '全门店通用',
    projects: '全场任意消费',
    dateRule: '无限制',
    otherRule: '可与会员折扣叠加'
  },
  {
    id: 8,
    name: '会员日立减8元',
    tag: '特享券',
    type: 'discount',
    value: '8.00',
    originalPrice: null,
    condition: '不限',
    validity: '2025/06/01 ~ 2025/12/31',
    minAmount: 0,
    code: 'CP-HY08',
    stores: '全门店通用',
    projects: '除储值外所有项目',
    dateRule: '每月18日会员日可用',
    otherRule: '需登录后领取'
  },
]

// 当前用户拥有的券
const userCoupons = ref([])

// 当前用户可用券数量
const availableCouponCount = computed(() => userCoupons.value.length)

// 随机抽取 n 张不重复的券
const pickRandomCoupons = (count) => {
  const pool = [...COUPON_POOL]
  const result = []
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length)
    result.push(pool.splice(idx, 1)[0])
  }
  return result
}

const histAvatar = (bg1, bg2, initial) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><linearGradient id="h" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${bg1}"/><stop offset="100%" stop-color="${bg2}"/></linearGradient></defs><rect width="40" height="40" rx="20" fill="url(#h)"/><circle cx="20" cy="15" r="7" fill="rgba(255,255,255,0.9)"/><ellipse cx="20" cy="33" rx="12" ry="10" fill="rgba(255,255,255,0.85)"/></svg>`
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
}

const memberHistory = ref([
  { id: 101, name: '会员名', phone: '17600110765', avatar: histAvatar('#74b9ff', '#0984e3', '会') },
  { id: 102, name: '会员名', phone: '17600110765', avatar: histAvatar('#fd79a8', '#e84393', '会') },
  { id: 103, name: '会员名', phone: '17600110765', avatar: histAvatar('#55efc4', '#00b894', '会') },
  { id: 104, name: '会员名', phone: '17600110765', avatar: histAvatar('#ffeaa7', '#fdcb6e', '会') }
])
const activeTab = ref('single')
const searchQuery = ref('')

const products = ref([
  { id: 1, name: 'VR 体验 30分钟', price: 20, category: 'single', desc: '单人设备体验', cover: createCover('#42b3ff', '#235dff', 'VR') },
  { id: 2, name: '赛车模拟 30分钟', price: 35, category: 'single', desc: '热门设备', cover: createCover('#47c4ff', '#1677c8', 'R') },
  { id: 3, name: '亲子互动区', price: 25, category: 'single', desc: '亲子娱乐', cover: createCover('#ffb648', '#ff7a18', 'K') },
  { id: 4, name: '多人派对包厢', price: 80, category: 'single', desc: '四人起订', cover: createCover('#9b7bff', '#5f55f7', 'P') },
  { id: 5, name: '储值 300 送 30', price: 300, category: 'recharge', desc: '会员储值活动', cover: createCover('#2bc6c8', '#149d9f', 'C') },
  { id: 6, name: '储值 500 送 80', price: 500, category: 'recharge', desc: '门店热销', cover: createCover('#36c486', '#0d9860', 'V') },
  { id: 7, name: '畅玩 5 次套票', price: 88, category: 'package', desc: '有效期 30 天', cover: createCover('#7a87ff', '#4f5ef2', '5') },
  { id: 8, name: '畅玩 10 次套票', price: 168, category: 'package', desc: '有效期 90 天', cover: createCover('#6eb9ff', '#3f7dff', '10') },
  { id: 9, name: '游戏币 20 枚', price: 20, category: 'product', desc: '即买即用', cover: createCover('#ff8e56', '#f25f43', '20') },
  { id: 10, name: '饮品套餐', price: 18, category: 'product', desc: '吧台商品', cover: createCover('#ff9dc2', '#ff5f9d', 'D') }
])

const cartItems = ref([])

const filteredProducts = computed(() => {
  const keyword = searchQuery.value.trim()
  return products.value.filter((product) => {
    const inTab = product.category === activeTab.value
    const inSearch = !keyword || product.name.includes(keyword) || product.desc.includes(keyword)
    return inTab && inSearch
  })
})

const totalAmount = computed(() => cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0))

// 优惠券折扣金额
const couponDiscount = computed(() => {
  if (!selectedCoupon.value) return 0
  const v = selectedCoupon.value.value
  if (selectedCoupon.value.type === 'rate') {
    return totalAmount.value - (totalAmount.value * parseFloat(v) / 10)
  }
  return parseFloat(v)
})

// 实付金额（合计 - 折扣）
const payableAmount = computed(() => Math.max(0, (totalAmount.value - couponDiscount.value)))

const addToCart = (product) => {
  const existing = cartItems.value.find((item) => item.id === product.id)
  if (existing) {
    return
  }
  cartItems.value.push({ ...product, quantity: 1 })
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
}

const checkout = () => {
  if (cartItems.value.length === 0) return
  showPaymentModal.value = true
}

const handleMemberSelected = (member) => {
  selectedMember.value = member
  showMemberSelect.value = false
  // 更新历史记录（去重后置顶）
  const idx = memberHistory.value.findIndex((m) => m.id === member.id)
  if (idx > -1) memberHistory.value.splice(idx, 1)
  memberHistory.value.unshift({ id: member.id, name: member.name, phone: member.phone, avatar: member.avatar })
  // 随机分配 0-4 张优惠券
  const count = Math.floor(Math.random() * 5) // 0-4
  userCoupons.value = pickRandomCoupons(count)
  selectedCoupon.value = null
}

const handleLogout = () => {
  selectedMember.value = null
  userCoupons.value = []
  selectedCoupon.value = null
}

const handleNewMember = (data) => {
  console.log('新增会员：', data)
}

const handleCouponSelect = (coupon) => {
  selectedCoupon.value = coupon
}

const removeCoupon = () => {
  selectedCoupon.value = null
}

const handlePaymentConfirm = (payload) => {
  console.log('支付确认:', payload)
  showPaymentModal.value = false
  // TODO: 调用实际支付接口
}

const handleDeductionConfirm = (payload) => {
  console.log('扣费确认:', payload)
  showDeductionModal.value = false
  // TODO: 调用实际扣费接口
}
</script>

<style scoped>
.sale-view {
  --product-card-radius: 8px;
  height: 100%;
  max-height: 100%;
  display: grid;
  grid-template-columns: minmax(620px, 1fr) 388px;
  gap: 14px;
  padding: 14px 14px 0;
  background: #eaf7ff;
  overflow: hidden;
}

.sale-left,
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
  background: #cfeaff;
}

.member-strip > strong {
  font-size: 13px;
  font-weight: 800;
  color: #171b24;
}

/* ---- 已登录会员蓝色信息卡片 ---- */
.member-card {
  background: linear-gradient(135deg, #4a90ff 0%, #2563eb 50%, #1d4ed8 100%);
  border-radius: 12px;
  padding: 16px 18px 14px;
  color: #fff;
  box-shadow: 0 6px 24px rgba(37,99,235,0.3);
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
  border: 2.5px solid rgba(255,255,255,0.7);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
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
  background: rgba(255,255,255,0.22);
  backdrop-filter: blur(4px);
  letter-spacing: 0.5px;
}

.mc-name-block em {
  color: rgba(255,255,255,0.75);
  font-style: normal;
  font-size: 12px;
  font-weight: 600;
}

/* 右侧操作按钮 */
.mc-btns {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.mc-btn {
  height: 30px;
  padding: 0 14px;
  border: 1.5px solid rgba(255,255,255,0.4);
  border-radius: 6px;
  background: rgba(255,255,255,0.18);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.mc-btn:hover {
  background: rgba(255,255,255,0.32);
  border-color: rgba(255,255,255,0.6);
}

/* 四列统计数据 */
.mc-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin-top: 14px;
  padding: 12px 4px 0;
  border-top: 1px solid rgba(255,255,255,0.15);
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
  color: rgba(255,255,255,0.65);
  font-style: normal;
  font-size: 13px;
  font-weight: 600;
  margin-top: 2px;
}

/* 游戏币过期提示 — 放在"游戏币"文字下方 */
.mc-expire-hint {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-top: 3px;
  padding: 1px 7px;
  font-size: 10px;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.15);
  background: #f59e0b;
  border-radius: 999px;
  white-space: nowrap;
}

.mc-expire-hint .el-icon {
  font-size: 11px;
  text-shadow: 0 1px 2px rgba(0,0,0,0.15);
}

.member-actions {
  display: flex;
  gap: 12px;
}

.mini-action {
  min-width: 118px;
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 8px;
  background: #fff;
  color: #171b24;
  text-decoration: none;
  font-size: 12px;
  font-weight: 800;
  border: 0;
  cursor: pointer;
}

.mini-action .el-icon {
  color: #1191ff;
}

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
  justify-content: space-between;
  gap: 20px;
  padding: 0 4px 12px;
}

.sale-tabs {
  flex: 1;
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(72px, max-content));
  align-items: center;
  justify-content: start;
  column-gap: 36px;
}

.sale-tab {
  min-height: 44px;
  border: 0;
  border-bottom: 3px solid transparent;
  background: transparent;
  color: #171b24;
  cursor: pointer;
  font-size: 14px;
  font-weight: 800;
  text-align: center;
}

.sale-tab.active {
  color: #1191ff;
  border-bottom-color: #1191ff;
}

.search-box {
  width: 210px;
  height: 40px;
  flex: 0 0 210px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 18px;
  border: 1px solid #d5eaf9;
  border-radius: 8px;
  background: #fff;
  color: #a2a3a6;
  font-size: 13px;
}

.search-box input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  color: #171b24;
}

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
  border: 1px solid #d8efff;
  border-radius: var(--product-card-radius);
  background: #fff;
  color: #171b24;
  text-align: left;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(21, 88, 150, 0.05);
  transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
}

.product-card.active {
  border-color: #1191ff;
  background: #dff0ff;
  box-shadow: inset 0 0 0 1px #1191ff;
}

.product-card:hover {
  border-color: #1191ff;
  box-shadow: 0 12px 24px rgba(17, 145, 255, 0.12);
  transform: translateY(-1px);
}

.product-thumb {
  width: 76px;
  height: 76px;
  flex: 0 0 76px;
  display: block;
  overflow: hidden;
  border-radius: var(--product-card-radius);
  background: #dcecf8;
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

.product-copy em,
.cart-title-row em,
.summary-total strong {
  color: #fc630a;
  font-style: normal;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
}

.product-copy em {
  font-size: 14px;
}

.checkout-panel {
  border-radius: 8px 8px 0 0;
  background: #cfeaff;
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
}

.checkout-header button,
.summary-line button {
  min-height: 40px;
  border: 0;
  border-radius: 8px;
  background: #fff;
  color: #171b24;
  cursor: pointer;
  font-weight: 800;
}

.checkout-header button {
  min-width: 70px;
  min-height: 34px;
  font-size: 12px;
}

.cart-list {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 0 14px;
}

.cart-item {
  padding: 18px;
  border: 1px solid #d8efff;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 6px 14px rgba(21, 88, 150, 0.08);
}

.cart-item + .cart-item {
  margin-top: 12px;
}

.cart-title-row,
.cart-control-row,
.summary-line,
.summary-total {
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
}

.cart-title-row em {
  font-size: 13px;
}

.pill-btn {
  min-width: 64px;
  min-height: 34px;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  background: #fff;
  color: #8c8585;
  cursor: pointer;
  font-size: 12px;
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
  border: 1px solid #e0e7ef;
  border-radius: 4px;
  background: #fff;
  color: #171b24;
  text-align: center;
}

.quantity-stepper button {
  display: grid;
  place-items: center;
  cursor: pointer;
}

.quantity-stepper .add {
  border-color: #1191ff;
  background: #1191ff;
  color: #fff;
}

.cart-empty {
  flex: 1;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #7cb8e6;
  font-size: 13px;
  font-weight: 600;
}

.cart-empty .cart-empty-icon {
  width: 88px;
  height: 88px;
  object-fit: contain;
}

.checkout-footer {
  flex-shrink: 0;
  padding: 14px;
  background: transparent;
}

.summary-card {
  padding: 18px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08), 0 -2px 12px rgba(17, 145, 255, 0.1);
}

.summary-line {
  min-height: 28px;
  font-size: 14px;
}

.summary-line strong {
  color: #171b24;
  font-variant-numeric: tabular-nums;
}

.summary-line button {
  min-height: 28px;
  padding: 0;
  color: #4ea6ed;
}

.summary-total {
  margin-top: 10px;
  padding-top: 14px;
  border-top: 1px solid #edf2f7;
  font-size: 14px;
  font-weight: 900;
}

.summary-total span {
  color: #000;
  font-weight: 900;
}

.summary-total strong {
  color: #fc630a;
  font-size: 18px;
}

.summary-total strong .currency-symbol {
  color: #fc630a;
}

.checkout-btn {
  width: 100%;
  min-height: 48px;
  margin-top: 12px;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(90deg, #1191ff 0%, #075bff 100%);
  color: #fff;
  cursor: pointer;
  font-size: 15px;
  font-weight: 800;
  box-shadow: 0 14px 28px rgba(17, 145, 255, 0.28);
}

.checkout-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  box-shadow: none;
}

/* ===== 购物车优惠券区域 ===== */
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

.coupon-trigger-wrap button:hover {
  background: #f0f7ff;
  color: #3791ff;
}

/* 已使用优惠券信息 */
.coupon-used-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 0;
  border-radius: 8px;
  background: #fff;
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
  color: #FC630A;
  font-weight: 700;
}

.coupon-discount-amount {
  color: #FC630A !important;
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
  color: #FC630A;
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
  color: #FC630A;
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
  color: #FC630A;
  transform: scale(1.1);
}

.summary-line .coupon-remove-btn:active {
  transform: scale(0.95);
}
</style>
