<template>
  <div class="sale-view">
    <section class="sale-left" aria-label="销售项目">
      <!-- 未选择会员 → 简洁条 -->
      <div v-if="!selectedMember" class="member-strip">
        <strong>未登入会员</strong>
        <div class="member-actions">
          <button class="mini-action" type="button" @click="showMemberSelect = true">
            <img class="mini-action-icon" :src="`${BASE_URL}sale-icons/select-member.svg`" alt="" />
            选择会员
          </button>
          <button class="mini-action" type="button" @click="showNewMember = true">
            <img class="mini-action-icon" :src="`${BASE_URL}sale-icons/add-member.svg`" alt="" />
            新增会员
          </button>
        </div>
      </div>

      <!-- 已选择会员 → 蓝色信息卡片 -->
      <div v-else class="member-card">
        <div class="mc-top-row">
          <div class="mc-profile">
            <img :src="selectedMemberAvatar" class="mc-avatar" :alt="selectedMember.name" @error="handleMemberAvatarError" />
            <div class="mc-name-block">
              <span class="mc-name-line">
                <strong>{{ selectedMember.name }}</strong>
                <span v-if="selectedMember.level" class="mc-level-tag">{{ selectedMember.level }}</span>
              </span>
              <em>{{ selectedMember.phone }}</em>
            </div>
          </div>
          <div class="mc-btns">
            <button type="button" class="mc-btn" @click="goToDeduct">去扣费</button>
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
          <!-- 套票暂不启用 -->
          <!-- <div class="mc-stat-item">
            <strong>{{ selectedMember.tickets ?? 0 }}</strong>
            <em>套票</em>
          </div> -->
          <div class="mc-stat-item">
            <strong>{{ userCoupons.length }}</strong>
            <em>优惠券</em>
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

          <div v-if="activeTab === 'single'" class="device-filter">
            <el-select v-model="deviceFilter" placeholder="全部设备" clearable class="filter-select">
              <template #prefix><el-icon :size="16"><Monitor /></el-icon></template>
              <el-option v-for="d in allDevices" :key="d.id" :label="d.name" :value="d.id" />
            </el-select>
            <el-select v-model="sortBy" placeholder="默认排序" class="filter-select">
              <template #prefix><el-icon :size="16"><Sort /></el-icon></template>
              <el-option v-for="s in sortOptions" :key="s.value" :label="s.label" :value="s.value" />
            </el-select>
          </div>

          <label class="search-box">
            <el-icon><Search /></el-icon>
            <input v-model="searchQuery" type="search" placeholder="搜索" />
          </label>
        </header>

        <div v-if="isRechargeTab" class="custom-recharge-card" :class="{ active: isCustomRechargeActive }">
          <div class="custom-recharge-copy">
            <strong>自定义充值</strong>
            <em>预存款</em>
          </div>
          <label class="custom-recharge-field">
            <div class="custom-recharge-input">
              <b>¥</b>
              <input
                v-model="customRechargeAmount"
                type="number"
                min="0"
                step="1"
                inputmode="decimal"
                placeholder="请输入金额"
                @focus="selectCustomRecharge"
                @input="selectCustomRecharge"
              />
            </div>
          </label>
        </div>

        <div class="product-grid" role="list">
          <button
            v-for="(product, idx) in filteredProducts"
            :key="product.id"
            type="button"
            class="product-card"
            :class="{ active: isProductActive(product), 'has-detail': !!product.detail }"
            role="listitem"
            @mouseenter="handleProductHover(product, $event)"
            @mouseleave="handleProductLeave()"
            @click="handleProductSelect(product)"
          >
            <span class="product-thumb">
              <img :src="product.cover" :alt="product.name" />
            </span>
            <span class="product-copy">
              <strong>{{ product.name }}</strong>
              <em><span class="currency-symbol">¥</span>{{ product.price.toFixed(2) }}</em>
              <span v-if="product.devices && product.devices.length && !deviceFilter" class="product-device-tags">
                <span v-for="did in product.devices.slice(0, 3)" :key="did" class="device-tag">{{ allDevices.find(d => d.id === did)?.name?.split('（')[0] }}</span>
                <span v-if="product.devices.length > 3" class="device-tag device-tag-more">+{{ product.devices.length - 3 }}</span>
              </span>
            </span>
          </button>

          <!-- 悬浮详情面板 -->
          <transition name="detail-fade">
            <div
              v-if="hoveredDetail && hoveredDetail.detail"
              class="product-detail-panel"
              :style="{ top: hoveredPos.y + 'px', left: hoveredPos.x + 'px' }"
            >
              <header class="detail-panel-head">
                <span class="detail-panel-title">{{ hoveredDetail.panelTitle || '套餐详情' }}</span>
              </header>
              <dl class="detail-panel-list">
                <div v-for="row in hoveredDetail.detail" :key="row.label" class="detail-row">
                  <dt>{{ row.label }}</dt>
                  <dd :class="{ highlight: row.highlight }">{{ row.value }}</dd>
                </div>
              </dl>
            </div>
          </transition>
        </div>
      </div>
    </section>

    <aside
      class="checkout-panel"
      :class="{ 'checkout-panel--recharge': isRechargeTab }"
      :aria-label="isRechargeTab ? '充值信息' : '结账单'"
    >
      <template v-if="isRechargeTab">
        <header class="checkout-header recharge-header">
          <div class="recharge-header-copy">
            <strong>充值信息</strong>
            <span>充值与消费分开结算</span>
          </div>
          <button type="button" @click="clearRechargeSelection">清空</button>
        </header>

        <div class="recharge-body">
          <section class="recharge-card recharge-impact-card">
            <span class="recharge-card-label">账户变化</span>
            <template v-if="selectedMember">
              <div class="recharge-impact-main">
                <span>当前预存款</span>
                <strong>¥{{ memberBalance.toFixed(2) }}</strong>
              </div>
              <div class="recharge-impact-flow">
                <div>
                  <span>本次储值</span>
                  <strong>¥{{ rechargeAmount.toFixed(2) }}</strong>
                </div>
                <div>
                  <span>赠送金币</span>
                  <strong>{{ rechargeBonusCoins }}</strong>
                </div>
              </div>
              <div class="recharge-impact-result">
                <div>
                  <span>充值后预存款</span>
                  <strong>¥{{ projectedBalance.toFixed(2) }}</strong>
                </div>
              </div>
            </template>
            <div v-else class="recharge-empty">
              <strong>先选会员，再充值</strong>
              <span>充值会直接记入当前会员账户</span>
              <button type="button" class="recharge-inline-btn" @click="showMemberSelect = true">选择会员</button>
            </div>
          </section>

          <section class="recharge-card recharge-plan-card">
            <span class="recharge-card-label">充值方案</span>
            <template v-if="selectedRechargePlan">
              <div class="recharge-plan-main">
                <div>
                  <strong>{{ selectedRechargePlan.name }}</strong>
                  <span>{{ selectedRechargePlan.desc }}</span>
                </div>
                <em><span class="currency-symbol">¥</span>{{ selectedRechargePlan.price.toFixed(2) }}</em>
              </div>
              <dl class="recharge-plan-lines">
                <div>
                  <dt>充值金额</dt>
                  <dd>¥{{ selectedRechargePlan.price.toFixed(2) }}</dd>
                </div>
                <div>
                  <dt>到账说明</dt>
                  <dd>{{ selectedRechargePlan.arrivalText }}</dd>
                </div>
              </dl>
            </template>
            <div v-else class="recharge-empty recharge-empty--soft">
              <strong>请选择一个充值活动</strong>
              <span>右侧只展示充值确认，不放入购物车</span>
            </div>
          </section>

          <section v-if="cartItems.length > 0" class="recharge-card recharge-notice">
            <span class="recharge-card-label">消费单提醒</span>
            <p>当前购物车还有 {{ cartItems.length }} 项消费内容，充值完成后仍需单独结算。</p>
          </section>
        </div>

        <footer class="checkout-footer recharge-footer">
          <div class="summary-card recharge-summary-card">
            <div class="summary-line">
              <span>充值金额</span>
              <strong><span class="currency-symbol">¥</span>{{ rechargeAmount.toFixed(2) }}</strong>
            </div>
            <div class="summary-total">
              <span>应收</span>
              <strong><span class="currency-symbol">¥</span>{{ rechargeAmount.toFixed(2) }}</strong>
            </div>
          </div>
          <button
            class="checkout-btn"
            type="button"
            :disabled="!selectedMember || !selectedRechargePlan"
            @click="checkoutRecharge"
          >
            立即充值&nbsp; <span class="currency-symbol">¥</span>{{ rechargeAmount.toFixed(2) }}
          </button>
        </footer>
      </template>

      <template v-else>
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
            <img :src="`${BASE_URL}cart-empty-icon.png`" alt="" class="cart-empty-icon" />
            <span>购物车空空 咱也没有</span>
          </div>
        </div>

        <footer class="checkout-footer">
          <div class="summary-card">
            <div class="summary-line">
              <span>合计：</span>
              <strong><span class="currency-symbol">¥</span>{{ totalAmount.toFixed(2) }}</strong>
            </div>
            <div v-if="showMemberDiscount" class="summary-line member-discount-line">
              <span>会员折扣（{{ memberDiscountLabel }}）：</span>
              <strong class="member-discount-amount">-<span class="currency-symbol">¥</span>{{ memberDiscountAmount.toFixed(2) }}</strong>
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
              <span>实付</span>
              <strong><span class="currency-symbol">¥</span>{{ payableAmount.toFixed(2) }}</strong>
            </div>
            <!-- 套票暂不启用 -->
            <!-- <div v-if="isPackageOnly && selectedMember" class="package-cash-notice">
              <span>套票仅支持现金/扫码支付，不可使用预存款或游戏币抵扣</span>
            </div> -->
            <div v-if="showAssetSettlementStatus" class="asset-status-card" :class="`asset-status-card--${assetSettlementTone}`">
              <div class="asset-status-head">
                <div class="asset-status-copy">
                  <strong>{{ assetSettlementTitle }}</strong>
                  <span>{{ assetSettlementDescription }}</span>
                </div>
                <em>{{ assetSettlementBadge }}</em>
              </div>
              <div class="asset-status-lines">
                <div>
                  <span>预存款抵扣</span>
                  <strong>¥{{ assetDeductionPreview.prepaid.toFixed(2) }}</strong>
                </div>
                <div>
                  <span>游戏币抵扣</span>
                  <strong>{{ assetDeductionPreview.coins.toFixed(2) }}</strong>
                </div>
                <div>
                  <span>仍需补差</span>
                  <strong>¥{{ assetDeductionPreview.external.toFixed(2) }}</strong>
                </div>
              </div>
            </div>
          </div>
          <button class="checkout-btn" type="button" :disabled="saleCheckoutDisabled" @click="checkout">
            <span>{{ saleCheckoutButtonText }}</span>
            <template v-if="showSaleCheckoutAmount">
              &nbsp;<span class="currency-symbol">¥</span>{{ payableAmount.toFixed(2) }}
            </template>
          </button>
          <div v-if="showSaleAuxiliaryActions" class="checkout-aux-actions">
            <button
              v-if="showGoRechargeAction"
              type="button"
              class="checkout-secondary-btn checkout-secondary-btn--accent"
              @click="goToRechargeTab"
            >
              去充值
            </button>
          </div>
        </footer>
      </template>
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
      :items="paymentItems"
      :member="selectedMember"
      :total-amount="paymentTotalAmount"
      :coupon="paymentCoupon"
      :discount-amount="paymentDiscountAmount"
      :payable-amount="paymentPayableAmount"
      :allowed-method-ids="paymentAllowedMethodIds"
      :default-method-id="paymentDefaultMethodId"
      :asset-deduction="paymentAssetDeduction"
      @close="handlePaymentClose"
      @confirm="handlePaymentConfirm"
    />

    <MemberDeductionModal
      :visible="showDeductionModal"
      :devices="deductionDevices"
      :member="selectedMember"
      :member-assets="selectedMember ? { balance: selectedMember.balance, coins: selectedMember.coins } : null"
      @close="showDeductionModal = false"
      @confirm="handleDeductionConfirm"
    />

    <DeductionSuccessModal
      :visible="showDeductionSuccess"
      :count="lastDeductionCount"
      :details="lastDeductionDetails"
      :asset-changes="lastDeductionAssetChanges"
      @close="showDeductionSuccess = false"
    />

    <DeductionSuccessModal
      :visible="showRechargeSuccess"
      title="充值成功"
      subtitle="本次充值如下"
      :details="lastRechargeDetails"
      :asset-changes="lastRechargeAssetChanges"
      @close="showRechargeSuccess = false"
    />

    <DeductionSuccessModal
      :visible="showSaleSuccess"
      :title="lastSaleTitle"
      :subtitle="lastSaleSubtitle"
      :details="lastSaleDetails"
      :payment-lines="lastSalePaymentLines"
      :asset-changes="lastSaleAssetChanges"
      @close="showSaleSuccess = false"
    />

    <DeductionSuccessModal
      :visible="showRegisterSuccess"
      type="register"
      title="注册成功"
      subtitle="会员注册信息"
      :details="lastRegisterDetails"
      @close="handleRegisterSuccessClose"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CircleCloseFilled, Close, Minus, Monitor, Plus, Search, Sort, WarningFilled } from '@element-plus/icons-vue'
import MemberSelectModal from '../../components/MemberSelectModal.vue'
import NewMemberModal from '../../components/NewMemberModal.vue'
import CouponSelectModal from '../../components/CouponSelectModal.vue'
import PaymentModal from '../../components/PaymentModal.vue'
import MemberDeductionModal from '../../components/MemberDeductionModal.vue'
import DeductionSuccessModal from '../../components/DeductionSuccessModal.vue'

const BASE_URL = import.meta.env.BASE_URL

const route = useRoute()
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

// 游戏专用封面生成（竖屏 3:4，匹配上传规格 300×400）
const createGameCover = (accentA, accentB, text) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400">
      <defs>
        <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${accentA}" />
          <stop offset="100%" stop-color="${accentB}" />
        </linearGradient>
      </defs>
      <rect width="300" height="400" rx="24" fill="url(#bg2)" />
      <rect x="20" y="20" width="260" height="360" rx="16" fill="rgba(255,255,255,0.12)" />
      <text x="150" y="232" text-anchor="middle" font-size="90" font-weight="700" fill="white" font-family="Arial, sans-serif">${text}</text>
    </svg>
  `
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const tabs = [
  { id: 'single', name: '单次消费' },
  { id: 'recharge', name: '充值活动' },
  // 套票暂不启用
  // { id: 'package', name: '套票' },
  { id: 'product', name: '商品' }
]

const selectedMember = ref(null)
const showMemberSelect = ref(false)
const showNewMember = ref(false)
const showCouponModal = ref(false)
const showPaymentModal = ref(false)
const showDeductionModal = ref(false)
const showDeductionSuccess = ref(false)
const showRechargeSuccess = ref(false)
const showSaleSuccess = ref(false)
const showRegisterSuccess = ref(false)
const lastDeductionCount = ref(1)
const lastDeductionDetails = ref([])
const lastDeductionAssetChanges = ref([])
const lastRechargeDetails = ref([])
const lastRechargeAssetChanges = ref([])
const lastSaleTitle = ref('支付成功')
const lastSaleSubtitle = ref('本次消费如下')
const lastSaleDetails = ref([])
const lastSalePaymentLines = ref([])
const lastSaleAssetChanges = ref([])
const lastRegisterDetails = ref([])
const selectedCoupon = ref(null)
const pendingNewMember = ref(null)

// 悬浮详情面板
const hoveredDetail = ref(null)
const hoveredPos = ref({ x: 0, y: 0 })

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
    tag: '优惠券',
    type: 'discount',
    value: '1.50',
    condition: '满20可用',
    validity: '2024/12/13 ~ 2025/01/15',
    minAmount: 20,
    code: 'CP-9901',
    stores: '卓远亚运城店、卓远天河路店、卓远白云万达',
    projects: '可兑换1次 · 21个项目可选',
    projectList: [
      'VR过山车', '星际穿越', '深海探险', '极速飞车', '密室逃脱VR',
      '射击对抗', '飞行模拟', '恐怖医院', '太空漫步', '赛车竞速',
      '蹦极模拟', '僵尸围城', '龙卷风体验', '幻影星空', '城市漫游',
      '海底世界', '恐龙时代', '火山探险', '雪域飞驰', '奇幻森林',
      '未来战士'
    ],
    dateRule: '无限制',
    otherRule: '暂无'
  },
  {
    id: 2,
    name: '10元优惠券',
    tag: '特享券',
    type: 'discount',
    value: '10.00',
    condition: '不限',
    validity: '2024/12/13 ~ 2025/01/15',
    minAmount: 0,
    code: 'CP-TX02',
    stores: '卓远亚运城店、卓远天河路店、佛山顺德店、幻影星空体验店',
    projects: '指定门店设备项目可选',
    projectList: [
      'VR过山车', '星际穿越', '深海探险', '极速飞车', '射击对抗',
      '飞行模拟', '太空漫步', '赛车竞速', '蹦极模拟', '僵尸围城'
    ],
    dateRule: '无限制',
    otherRule: '暂无'
  },
  {
    id: 3,
    name: '8.8折畅玩券',
    tag: '折扣券',
    type: 'rate',
    value: '8.8',
    condition: '满39可用',
    validity: '2025/06/15 ~ 2025/08/31',
    minAmount: 39,
    code: 'CP-DZ03',
    stores: '全门店通用',
    projects: '全场消费项目可用',
    projectList: [
      '全部VR体验项目', '全部竞技类项目', '全部模拟器项目',
      '全部恐怖主题', '全部休闲探索', '全部儿童专区'
    ],
    dateRule: '仅限工作日使用',
    otherRule: '不可与其他优惠叠加'
  },
  {
    id: 4,
    name: '新人立减5元券',
    tag: '新人',
    type: 'discount',
    value: '5.00',
    condition: '满50可用',
    validity: '2025/01/01 ~ 2025/07/31',
    minAmount: 50,
    code: 'CP-NR04',
    stores: '全门店通用',
    projects: '单次消费类目可用',
    projectList: [
      'VR过山车', '星际穿越', '深海探险', '极速飞车', '密室逃脱VR',
      '射击对抗', '飞行模拟', '恐怖医院', '太空漫步', '赛车竞速',
      '蹦极模拟', '僵尸围城', '龙卷风体验', '幻影星空'
    ],
    dateRule: '无限制',
    otherRule: '仅限首次到店会员'
  },
  {
    id: 6,
    name: '储值满300减30',
    tag: '储值券',
    type: 'discount',
    value: '30.00',
    condition: '满300可用',
    validity: '2025/06/01 ~ 2025/09/01',
    minAmount: 300,
    code: 'CP-CZ06',
    stores: '卓远亚运城店、卓远天河路店',
    projects: '储值活动专用',
    projectList: ['账户储值充值（满300元可用）'],
    dateRule: '周末及节假日不可用',
    otherRule: '每用户限用1张'
  },
  {
    id: 7,
    name: '9折优惠券',
    tag: '折扣券',
    type: 'rate',
    value: '9.0',
    condition: '满39可用',
    validity: '长期有效',
    minAmount: 39,
    code: 'CP-ZK07',
    stores: '全门店通用',
    projects: '全场任意消费',
    projectList: [
      '全部VR体验项目', '全部竞技类项目', '全部模拟器项目',
      '全部商品类目', '全部套餐活动'
    ],
    dateRule: '无限制',
    otherRule: '可与会员折扣叠加'
  },
  {
    id: 8,
    name: '会员日立减8元',
    tag: '特享券',
    type: 'discount',
    value: '8.00',
    condition: '不限',
    validity: '2025/06/01 ~ 2025/12/31',
    minAmount: 0,
    code: 'CP-HY08',
    stores: '全门店通用',
    projects: '除储值外所有项目',
    projectList: [
      '全部VR体验项目', '全部竞技类项目', '全部模拟器项目',
      '全部恐怖主题', '全部休闲探索', '全部儿童专区',
      '全部商品类目', '全部套餐活动'
    ],
    dateRule: '每月18日会员日可用',
    otherRule: '需登录后领取'
  },
]

// 当前用户拥有的券
const userCoupons = ref([])

const isCouponAvailable = (coupon, amount) => {
  if (!coupon) return false
  if (coupon.validity && coupon.validity.includes('过期')) return false
  const minAmount = Number(coupon.minAmount ?? 0)
  return Number(amount) > 0 && Number(amount) >= minAmount
}

// 当前用户可用券数量
const availableCouponCount = computed(() =>
  userCoupons.value.filter(coupon => isCouponAvailable(coupon, totalAmount.value)).length
)

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
  { id: 101, name: '李明', phone: '17600110765', level: '钻石', avatar: histAvatar('#74b9ff', '#0984e3', '李') },
  { id: 102, name: '王芳', phone: '139****5678', level: '铂金', avatar: histAvatar('#fd79a8', '#e84393', '王') },
  { id: 103, name: '张伟', phone: '13790123456', level: '黄金', avatar: histAvatar('#55efc4', '#00b894', '张') },
  { id: 104, name: '周磊', phone: '15987654321', level: '白银', avatar: histAvatar('#fab1a0', '#e17055', '周') }
])
const activeTab = ref('single')
const searchQuery = ref('')
const deviceFilter = ref('')
const sortBy = ref('default')
const sortOptions = [
  { label: '默认排序', value: 'default' },
  { label: '价格从低到高', value: 'price-asc' },
  { label: '价格从高到低', value: 'price-desc' },
  { label: '名称 A-Z', value: 'name-asc' },
  { label: '名称 Z-A', value: 'name-desc' },
]
const selectedRechargeProduct = ref(null)
const customRechargeAmount = ref('')
const paymentItems = ref([])
const paymentTotalAmount = ref(0)
const paymentCoupon = ref(null)
const paymentDiscountAmount = ref(0)
const paymentPayableAmount = ref(0)
const paymentMode = ref('sale')
const paymentAllowedMethodIds = ref([])
const paymentDefaultMethodId = ref('')
const paymentAssetDeduction = ref(null)
const SALE_OTHER_METHOD_IDS = ['cash', 'offline_pay', 'offline_wechat']

const persistSaleMemberSession = (member) => {
  if (!member) return
  sessionStorage.setItem('sale:selected-member', JSON.stringify(member))
}

const clearSaleMemberSession = () => {
  sessionStorage.removeItem('sale:selected-member')
}

const goToDeduct = () => {
  if (!selectedMember.value) return
  persistSaleMemberSession(selectedMember.value)
  router.push({ path: '/member/deduct', query: { member: '1' } })
}

const syncSaleEntryContext = () => {
  const targetTab = typeof route.query.tab === 'string' ? route.query.tab : ''
  if (tabs.some((tab) => tab.id === targetTab)) {
    activeTab.value = targetTab
  }

  const shouldRestoreMember = route.query.member === '1' || !selectedMember.value
  if (!shouldRestoreMember) return

  const raw = sessionStorage.getItem('sale:selected-member')
  if (!raw) return

  try {
    selectedMember.value = JSON.parse(raw)
  } catch {
    clearSaleMemberSession()
  }
}

watch(() => route.query, syncSaleEntryContext, { immediate: true })

// 设备列表
const allDevices = ref([
  { id: 'dev1', name: '动感平台（A01）' },
  { id: 'dev2', name: '4D座舱（A02）' },
  { id: 'dev3', name: '万向跑步机（A03）' },
  { id: 'dev4', name: '飞行模拟器（B01）' },
  { id: 'dev5', name: '赛车支架（B02）' },
  { id: 'dev6', name: 'VR蛋椅（C01）' },
  { id: 'dev7', name: '体感座椅（D01）' },
])

const products = ref([
  { id: 1, name: '过山车VR', price: 38, category: 'single', desc: '极境互动科技', consumptionSortOrder: 1, cover: createGameCover('#0ea5e9', '#2563eb', '过山车'), devices: ['dev1', 'dev3', 'dev5'], panelTitle: '游戏详情', detail: [
    { label: '游戏名称', value: '过山车VR' },
    { label: '单价', value: '¥38.00/次', highlight: true },
    { label: '游戏时长', value: '约10分钟' },
    { label: '适用设备', value: '动感平台、万向跑步机、赛车支架' },
    { label: '标签', value: '刺激 · 热门 · 全年龄' },
    { label: '游戏类型', value: '单机 · 单人付费' }
  ]},
  { id: 2, name: '恐怖医院', price: 48, category: 'single', desc: '闪耀游戏工作室', consumptionSortOrder: 2, cover: createGameCover('#111827', '#374151', '恐怖'), devices: ['dev2', 'dev3', 'dev5'], panelTitle: '游戏详情', detail: [
    { label: '游戏名称', value: '恐怖医院' },
    { label: '单价', value: '¥48.00/次', highlight: true },
    { label: '游戏时长', value: '约15分钟' },
    { label: '适用设备', value: '4D座舱、万向跑步机、赛车支架' },
    { label: '标签', value: '恐怖 · 成人 · 沉浸' },
    { label: '游戏类型', value: '单机 · 单人付费' }
  ]},
  { id: 3, name: '极速赛车', price: 30, category: 'single', desc: '乐游网络', consumptionSortOrder: 3, cover: createGameCover('#7c3aed', '#4f46e5', '赛车'), devices: ['dev1', 'dev4', 'dev5'], panelTitle: '游戏详情', detail: [
    { label: '游戏名称', value: '极速赛车' },
    { label: '单价', value: '¥30.00/次', highlight: true },
    { label: '游戏时长', value: '约8分钟' },
    { label: '适用设备', value: '动感平台、飞行模拟器、赛车支架' },
    { label: '标签', value: '竞速 · 热门 · 全年龄' },
    { label: '游戏类型', value: '单机 · 单人付费' }
  ]},
  { id: 4, name: '海洋世界', price: 25, category: 'single', desc: '星际科技', consumptionSortOrder: 4, cover: createGameCover('#06b6d4', '#0891b2', '海洋'), devices: ['dev2', 'dev4', 'dev6'], panelTitle: '游戏详情', detail: [
    { label: '游戏名称', value: '海洋世界' },
    { label: '单价', value: '¥25.00/次', highlight: true },
    { label: '游戏时长', value: '约20分钟' },
    { label: '适用设备', value: '4D座舱、飞行模拟器、VR蛋椅' },
    { label: '标签', value: '科普 · 亲子 · 放松' },
    { label: '游戏类型', value: '单机 · 单人付费' }
  ]},
  { id: 6, name: 'CS对战', price: 58, category: 'single', desc: '幻视科技', consumptionSortOrder: 5, cover: createGameCover('#f97316', '#ea580c', 'CS'), devices: ['dev1', 'dev2', 'dev6'], panelTitle: '游戏详情', detail: [
    { label: '游戏名称', value: 'CS对战' },
    { label: '单价', value: '¥58.00/次', highlight: true },
    { label: '游戏时长', value: '约30分钟' },
    { label: '适用设备', value: '动感平台、4D座舱、VR蛋椅' },
    { label: '标签', value: '射击 · 多人 · 竞技' },
    { label: '游戏类型', value: '联机 · 多人付费' }
  ]},
  { id: 8, name: '太空漫步', price: 35, category: 'single', desc: '闪耀游戏工作室', consumptionSortOrder: 6, cover: createGameCover('#0c3483', '#a2b6df', '太空'), devices: ['dev6', 'dev7', 'dev8'], panelTitle: '游戏详情', detail: [
    { label: '游戏名称', value: '太空漫步' },
    { label: '单价', value: '¥35.00/次', highlight: true },
    { label: '游戏时长', value: '约18分钟' },
    { label: '适用设备', value: 'VR蛋椅、体感座椅、360旋转舱' },
    { label: '标签', value: '科幻 · 探索 · 沉浸' },
    { label: '游戏类型', value: '联机 · 多人付费' }
  ]},
  { id: 5, name: '储值 300 送 30', price: 300, category: 'recharge', desc: '会员储值活动', cover: createCover('#2bc6c8', '#149d9f', 'C'), panelTitle: '充值详情', detail: [
    { label: '套餐名称', value: '储值300送30元（一年有效）' },
    { label: '单价', value: '¥300.00', highlight: true },
    { label: '到账预存款', value: '¥300.00' },
    { label: '到账游戏币', value: '30' },
    { label: '游戏币有效期', value: '365天（2024-06-01 至 2025-06-01）' },
    { label: '到账次数', value: '0' },
    { label: '可购会员', value: '钻石、黄金、白银、青铜、普通会员' }
  ]},
  { id: 6, name: '储值 500 送 80', price: 500, category: 'recharge', desc: '门店热销', cover: createCover('#36c486', '#0d9860', 'V'), panelTitle: '充值详情', detail: [
    { label: '套餐名称', value: '储值500送80元（一年有效）' },
    { label: '单价', value: '¥500.00', highlight: true },
    { label: '到账预存款', value: '¥500.00' },
    { label: '到账游戏币', value: '80' },
    { label: '游戏币有效期', value: '365天（2024-06-01 至 2025-06-01）' },
    { label: '到账次数', value: '0' },
    { label: '可购会员', value: '钻石、黄金、白银、青铜、普通会员' }
  ]},
  // 套票暂不启用
  // { id: 7, name: '畅玩 5 次套票', price: 88, category: 'package', desc: '有效期 30 天', cover: createCover('#7a87ff', '#4f5ef2', '5') },
  // { id: 8, name: '畅玩 10 次套票', price: 168, category: 'package', desc: '有效期 90 天', cover: createCover('#6eb9ff', '#3f7dff', '10') },
  { id: 9, name: 'VR眼罩卫生包', price: 20, category: 'product', desc: '一次性用品', cover: createCover('#ff8e56', '#f25f43', 'H'), panelTitle: '商品详情', detail: [
    { label: '商品名称', value: 'VR眼罩卫生包' },
    { label: '售价', value: '¥20.00', highlight: true },
    { label: '商品分类', value: '消耗品' },
    { label: '商品描述', value: '一次性VR眼罩+清洁湿巾，卫生安全，即拆即用' }
  ]},
  { id: 10, name: '饮品套餐', price: 18, category: 'product', desc: '吧台商品', cover: createCover('#ff9dc2', '#ff5f9d', 'D'), panelTitle: '商品详情', detail: [
    { label: '商品名称', value: '饮品套餐（可乐+爆米花）' },
    { label: '售价', value: '¥18.00', highlight: true },
    { label: '商品分类', value: '饮品' },
    { label: '商品描述', value: '休闲饮品搭配，观影游戏两不误' }
  ]}
])

const cartItems = ref([])
const isRechargeTab = computed(() => activeTab.value === 'recharge')

const filteredProducts = computed(() => {
  const keyword = searchQuery.value.trim()
  let list = products.value.filter((product) => {
    const inTab = product.category === activeTab.value
    const inSearch = !keyword || product.name.includes(keyword) || product.desc.includes(keyword)
    const inDevice = !deviceFilter.value || (product.devices && product.devices.includes(deviceFilter.value))
    return inTab && inSearch && inDevice
  })

  // 排序
  switch (sortBy.value) {
    case 'price-asc':
      list = [...list].sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      list = [...list].sort((a, b) => b.price - a.price)
      break
    case 'name-asc':
      list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'zh'))
      break
    case 'name-desc':
      list = [...list].sort((a, b) => b.name.localeCompare(a.name, 'zh'))
      break
    default:
      list = [...list].sort((a, b) => (a.consumptionSortOrder ?? 999) - (b.consumptionSortOrder ?? 999))
      break
  }
  return list
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

// 实付金额（合计 - 会员折扣 - 优惠券折扣）
const payableAmount = computed(() => Math.max(0, (totalAmount.value - memberDiscountAmount.value - couponDiscount.value)))
const customRechargeValue = computed(() => {
  const value = Number(customRechargeAmount.value)
  return Number.isFinite(value) && value > 0 ? value : 0
})

watch(totalAmount, (amount) => {
  if (selectedCoupon.value && !isCouponAvailable(selectedCoupon.value, amount)) {
    selectedCoupon.value = null
  }
})
const isCustomRechargeActive = computed(() => !selectedRechargeProduct.value && customRechargeValue.value > 0)
const selectedRechargePlan = computed(() => {
  if (selectedRechargeProduct.value) {
    return {
      ...selectedRechargeProduct.value,
      arrivalText: selectedRechargeProduct.value.name
    }
  }
  if (!isCustomRechargeActive.value) return null
  return {
    id: 'custom-prepaid-recharge',
    name: '自定义预存款充值',
    desc: '按输入金额直接储值',
    price: customRechargeValue.value,
    category: 'recharge',
    quantity: 1,
    arrivalText: `预存款到账 ¥${customRechargeValue.value.toFixed(2)}`
  }
})
const rechargeAmount = computed(() => selectedRechargePlan.value?.price ?? 0)
const rechargeBonusCoins = computed(() => {
  const match = selectedRechargePlan.value?.name.match(/送\s*(\d+(?:\.\d+)?)/)
  return match ? Number(match[1]) : 0
})
const memberBalance = computed(() => Number(selectedMember.value?.balance ?? 0))
const memberCoins = computed(() => Number(selectedMember.value?.coins ?? 0))
const projectedBalance = computed(() => memberBalance.value + rechargeAmount.value)

// ===== 会员等级折扣体系 =====
const LEVEL_DISCOUNT_MAP = {
  '钻石': { rate: 0.80, label: '钻石会员8折' },
  '铂金': { rate: 0.85, label: '铂金会员8.5折' },
  '黄金': { rate: 0.90, label: '黄金会员9折' },
  '白银': { rate: 0.95, label: '白银会员9.5折' },
}
const LEVEL_DISCOUNT_DEFAULT = { rate: 1.00, label: '' }

const memberDiscountInfo = computed(() => {
  if (!selectedMember.value?.level) return LEVEL_DISCOUNT_DEFAULT
  return LEVEL_DISCOUNT_MAP[selectedMember.value.level] || LEVEL_DISCOUNT_DEFAULT
})
const memberDiscountRate = computed(() => memberDiscountInfo.value.rate)
const memberDiscountLabel = computed(() => memberDiscountInfo.value.label)
const memberDiscountAmount = computed(() => {
  if (memberDiscountRate.value >= 1) return 0
  return Math.round((totalAmount.value * (1 - memberDiscountRate.value)) * 100) / 100
})
const showMemberDiscount = computed(() =>
  !!selectedMember.value && memberDiscountRate.value < 1 && cartItems.value.length > 0 && !isRechargeTab.value
)
const buildAssetDeduction = () => {
  if (!selectedMember.value) {
    return { prepaid: 0, coins: 0, external: payableAmount.value }
  }
  const prepaid = Math.min(memberBalance.value, payableAmount.value)
  const remainingAfterPrepaid = Math.max(0, payableAmount.value - prepaid)
  const coins = Math.min(memberCoins.value, remainingAfterPrepaid)
  const external = Math.max(0, remainingAfterPrepaid - coins)
  return {
    prepaid: Number(prepaid.toFixed(2)),
    coins: Number(coins.toFixed(2)),
    external: Number(external.toFixed(2))
  }
}
const assetDeductionPreview = computed(buildAssetDeduction)
const canCoverWithMemberAssets = computed(() =>
  !!selectedMember.value &&
  cartItems.value.length > 0 &&
  !isRechargeTab.value &&
  assetDeductionPreview.value.external <= 0
)
const showAssetSettlementStatus = computed(() =>
  !!selectedMember.value &&
  cartItems.value.length > 0 &&
  !isRechargeTab.value &&
  !isPackageOnly.value
)
const isPackageOnly = computed(() =>
  cartItems.value.length > 0 && cartItems.value.every(item => item.category === 'package')
)
const assetSettlementTone = computed(() => canCoverWithMemberAssets.value ? 'ready' : 'warning')
const assetSettlementTitle = computed(() => canCoverWithMemberAssets.value ? '会员资产可覆盖' : '会员资产不足，可补差')
const assetSettlementDescription = computed(() => {
  if (canCoverWithMemberAssets.value) {
    return '预存款优先，游戏币自动补足；无需选择游戏币。'
  }
  return `预存款和游戏币先自动抵扣，剩余 ¥${assetDeductionPreview.value.external.toFixed(2)} 可用现金/微信/支付宝补差。`
})
const assetSettlementBadge = computed(() => {
  if (canCoverWithMemberAssets.value) return '全额抵扣'
  return `补差 ¥${assetDeductionPreview.value.external.toFixed(2)}`
})
const saleCheckoutDisabled = computed(() => {
  if (cartItems.value.length === 0) return true
  return false
})
const saleCheckoutButtonText = computed(() => {
  if (cartItems.value.length === 0) return '去结算'
  if (selectedMember.value) {
    return '确认结算'
  }
  return '去结算'
})
const showSaleCheckoutAmount = computed(() =>
  cartItems.value.length > 0
)
const showSaleAuxiliaryActions = computed(() =>
  !!selectedMember.value &&
  cartItems.value.length > 0 &&
  !isRechargeTab.value &&
  assetDeductionPreview.value.external > 0
)
const showGoRechargeAction = computed(() =>
  !!selectedMember.value &&
  cartItems.value.length > 0 &&
  !isRechargeTab.value &&
  assetDeductionPreview.value.external > 0
)
const memberAvatarLoadError = ref(false)
const createFallbackMemberAvatar = (name = '会') => histAvatar('#74b9ff', '#0984e3', (name || '会').charAt(0))
const selectedMemberAvatar = computed(() => {
  if (memberAvatarLoadError.value) {
    return createFallbackMemberAvatar(selectedMember.value?.name)
  }
  const avatar = selectedMember.value?.avatar
  if (typeof avatar === 'string' && avatar.trim()) {
    return avatar
  }
  return createFallbackMemberAvatar(selectedMember.value?.name)
})

watch(selectedMember, () => {
  memberAvatarLoadError.value = false
})

const handleMemberAvatarError = () => {
  memberAvatarLoadError.value = true
}

const addToCart = (product) => {
  const existing = cartItems.value.find((item) => item.id === product.id)
  if (existing) {
    return
  }
  cartItems.value.push({ ...product, quantity: 1 })
}

const handleProductSelect = (product) => {
  if (product.category === 'recharge') {
    selectedRechargeProduct.value = selectedRechargeProduct.value?.id === product.id ? null : product
    if (selectedRechargeProduct.value) {
      customRechargeAmount.value = ''
    }
    return
  }
  addToCart(product)
}

const selectCustomRecharge = () => {
  if (customRechargeValue.value > 0) {
    selectedRechargeProduct.value = null
  }
}

const isProductActive = (product) => {
  if (product.category === 'recharge') {
    return selectedRechargeProduct.value?.id === product.id
  }
  return cartItems.value.some((item) => item.id === product.id)
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

const clearRechargeSelection = () => {
  selectedRechargeProduct.value = null
  customRechargeAmount.value = ''
}

const syncSelectedMemberSnapshot = () => {
  if (!selectedMember.value) return
  persistSaleMemberSession(selectedMember.value)
  const historyIndex = memberHistory.value.findIndex(member => member.id === selectedMember.value.id)
  if (historyIndex > -1) {
    memberHistory.value[historyIndex] = {
      ...memberHistory.value[historyIndex],
      balance: selectedMember.value.balance,
      coins: selectedMember.value.coins,
      tickets: selectedMember.value.tickets
    }
  }
}

const checkout = () => {
  if (cartItems.value.length === 0) return
  // 套票只能现金支付，不支持会员资产（预存款/游戏币）抵扣
  paymentMode.value = 'sale'
  paymentItems.value = cartItems.value.map((item) => ({ ...item }))
  paymentTotalAmount.value = totalAmount.value
  paymentCoupon.value = selectedCoupon.value
  // 合并会员折扣+优惠券折扣传递给付款弹窗
  paymentDiscountAmount.value = memberDiscountAmount.value + couponDiscount.value
  paymentPayableAmount.value = payableAmount.value
  paymentAssetDeduction.value = isPackageOnly.value ? null : (selectedMember.value ? { ...assetDeductionPreview.value } : null)
  paymentAllowedMethodIds.value = SALE_OTHER_METHOD_IDS
  paymentDefaultMethodId.value = isPackageOnly.value ? SALE_OTHER_METHOD_IDS[0] : (paymentAssetDeduction.value?.external <= 0 ? '' : SALE_OTHER_METHOD_IDS[0])
  showPaymentModal.value = true
}

const checkoutRecharge = () => {
  if (!selectedMember.value || !selectedRechargePlan.value) return
  paymentMode.value = 'recharge'
  paymentItems.value = [{ ...selectedRechargePlan.value, quantity: 1 }]
  paymentTotalAmount.value = rechargeAmount.value
  paymentCoupon.value = null
  paymentDiscountAmount.value = 0
  paymentPayableAmount.value = rechargeAmount.value
  paymentAssetDeduction.value = null
  paymentAllowedMethodIds.value = SALE_OTHER_METHOD_IDS
  paymentDefaultMethodId.value = SALE_OTHER_METHOD_IDS[0]
  showPaymentModal.value = true
}

const checkoutWithOtherMethods = () => {
  if (cartItems.value.length === 0) return
  paymentMode.value = 'sale'
  paymentItems.value = cartItems.value.map((item) => ({ ...item }))
  paymentTotalAmount.value = totalAmount.value
  paymentCoupon.value = selectedCoupon.value
  paymentDiscountAmount.value = couponDiscount.value
  paymentPayableAmount.value = payableAmount.value
  paymentAssetDeduction.value = null
  paymentAllowedMethodIds.value = SALE_OTHER_METHOD_IDS
  paymentDefaultMethodId.value = SALE_OTHER_METHOD_IDS[0]
  showPaymentModal.value = true
}

const goToRechargeTab = () => {
  activeTab.value = 'recharge'
}

const handleMemberSelected = (member) => {
  selectedMember.value = { ...member }
  syncSelectedMemberSnapshot()
  showMemberSelect.value = false
  // 更新历史记录（去重后置顶，保留等级信息）
  const idx = memberHistory.value.findIndex((m) => m.id === member.id)
  if (idx > -1) memberHistory.value.splice(idx, 1)
  memberHistory.value.unshift({ id: member.id, name: member.name, phone: member.phone, avatar: member.avatar, level: member.level })
  // 随机分配 1-4 张优惠券
  const count = Math.floor(Math.random() * 4) + 1 // 1-4
  userCoupons.value = pickRandomCoupons(count)
  selectedCoupon.value = null
}

const handleLogout = () => {
  selectedMember.value = null
  clearSaleMemberSession()
  userCoupons.value = []
  selectedCoupon.value = null
}

const handleNewMember = (data) => {
  console.log('新增会员：', data)
  // 支付和注册成功提示已由 NewMemberModal 内部处理
  // 这里直接登入新会员
  selectedMember.value = {
    id: Date.now(),
    name: data.name,
    phone: data.phone,
    avatar: createFallbackMemberAvatar(data.name),
    level: '普通会员',
    gender: data.gender,
    birthday: data.birthday,
    balance: data.package && !data.package.name.includes('套票') && !data.package.name.includes('次套票') ? data.package.price : 0,
    coins: 0,
    cardNo: data.cardNo || ''
  }
  persistSaleMemberSession(selectedMember.value)
  userCoupons.value = []
  selectedCoupon.value = null
}

const handleRegisterSuccessClose = () => {
  showRegisterSuccess.value = false
}

const handlePaymentClose = () => {
  showPaymentModal.value = false
  paymentAllowedMethodIds.value = []
  paymentDefaultMethodId.value = ''
  paymentAssetDeduction.value = null
  // 取消支付时清理注册暂存数据
  pendingNewMember.value = null
}

const handleCouponSelect = (coupon) => {
  selectedCoupon.value = coupon
}

const removeCoupon = () => {
  selectedCoupon.value = null
}

const handlePaymentConfirm = (payload) => {
  console.log('支付确认:', payload)
  let shouldShowRechargeSuccess = false
  let shouldShowSaleSuccess = false
  const completedRechargePlan = selectedRechargePlan.value
  if (paymentMode.value === 'recharge' && selectedMember.value && completedRechargePlan) {
    // §8.1 充值前资产快照
    const assetBefore = {
      balance: Number(selectedMember.value.balance ?? 0),
      coins: Number(selectedMember.value.coins ?? 0)
    }
    lastRechargeDetails.value = [
      { label: '到账预存款', value: `¥${rechargeAmount.value.toFixed(2)}` }
    ]
    if (rechargeBonusCoins.value > 0) {
      lastRechargeDetails.value.push({ label: '赠送金币', value: rechargeBonusCoins.value })
    }
    selectedMember.value = {
      ...selectedMember.value,
      balance: Number(selectedMember.value.balance ?? 0) + rechargeAmount.value,
      coins: Number(selectedMember.value.coins ?? 0) + rechargeBonusCoins.value
    }
    // §8.1 充值后资产变化
    lastRechargeAssetChanges.value = [
      { label: '预存款', before: `¥${assetBefore.balance.toFixed(2)}`, after: `¥${selectedMember.value.balance.toFixed(2)}` },
      ...(rechargeBonusCoins.value > 0 ? [{ label: '游戏币', before: `${assetBefore.coins}`, after: `${selectedMember.value.coins}` }] : [])
    ]
    syncSelectedMemberSnapshot()
    selectedRechargeProduct.value = null
    customRechargeAmount.value = ''
    shouldShowRechargeSuccess = true
  }

  // 消费结算成功（单次消费 / 商品购买）
  if (paymentMode.value === 'sale') {
    const saleItems = paymentItems.value
    const categories = [...new Set(saleItems.map(item => item.category))]
    const isAllSingle = categories.length === 1 && categories[0] === 'single'
    const isAllPackage = categories.length === 1 && categories[0] === 'package'
    const isAllProduct = categories.length === 1 && categories[0] === 'product'

    const assetDeduction = payload.assetDeduction || { prepaid: 0, coins: 0, external: paymentPayableAmount.value }
    const usedMemberAssets = assetDeduction.prepaid > 0 || assetDeduction.coins > 0

    // §8.1 消费前资产快照
    const assetBefore = selectedMember.value ? {
      balance: Number(selectedMember.value.balance ?? 0),
      coins: Number(selectedMember.value.coins ?? 0)
    } : null

    lastSaleTitle.value = usedMemberAssets ? '会员资产结算成功' : '支付成功'
    if (isAllSingle) {
      lastSaleSubtitle.value = '本次消费如下'
    // 套票暂不启用
    // } else if (isAllPackage) {
    //   lastSaleSubtitle.value = '套票购买详情'
    } else if (isAllProduct) {
      lastSaleSubtitle.value = '商品购买详情'
    } else {
      lastSaleSubtitle.value = '本次消费如下'
    }

    const saleLineDetails = saleItems.map((item) => ({
      label: item.name,
      subvalue: `${item.quantity} × ¥${item.price.toFixed(2)}`,
      value: `¥${(item.price * item.quantity).toFixed(2)}`
    }))

    if (usedMemberAssets && selectedMember.value) {
      selectedMember.value = {
        ...selectedMember.value,
        balance: Math.max(0, Number((Number(selectedMember.value.balance ?? 0) - assetDeduction.prepaid).toFixed(2))),
        coins: Math.max(0, Number((Number(selectedMember.value.coins ?? 0) - assetDeduction.coins).toFixed(2)))
      }
      syncSelectedMemberSnapshot()
    }

    // §8.1 消费后资产变化
    if (assetBefore) {
      const changes = []
      if (assetDeduction.prepaid > 0) {
        changes.push({ label: '预存款', before: `¥${assetBefore.balance.toFixed(2)}`, after: `¥${(assetBefore.balance - assetDeduction.prepaid).toFixed(2)}` })
      }
      if (assetDeduction.coins > 0) {
        changes.push({ label: '游戏币', before: `${assetBefore.coins}`, after: `${assetBefore.coins - assetDeduction.coins}` })
      }
      lastSaleAssetChanges.value = changes
    } else {
      lastSaleAssetChanges.value = []
    }

    // §10 结构化支付拆分行（展示在成功弹窗中）
    const paymentDisplayLines = []
    if (memberDiscountAmount.value > 0) {
      paymentDisplayLines.push({ label: `会员折扣（${memberDiscountLabel.value}）`, value: `-¥${memberDiscountAmount.value.toFixed(2)}`, isDiscount: true })
    }
    if (paymentCoupon.value) {
      paymentDisplayLines.push({ label: '优惠券', value: `-¥${couponDiscount.value.toFixed(2)}`, isDiscount: true })
    }
    if (assetDeduction.prepaid > 0) {
      paymentDisplayLines.push({ label: '预存款抵扣', value: `¥${assetDeduction.prepaid.toFixed(2)}`, isPayment: true })
    }
    if (assetDeduction.coins > 0) {
      paymentDisplayLines.push({ label: '游戏币抵扣', value: `${assetDeduction.coins.toFixed(2)}`, isPayment: true })
    }
    if (assetDeduction.external > 0) {
      const externalLabel = payload.paymentMethod === 'cash' ? '现金支付'
        : payload.paymentMethod === 'offline_wechat' ? '微信支付'
        : payload.paymentMethod === 'offline_pay' ? '支付宝支付'
        : '外部支付'
      paymentDisplayLines.push({ label: externalLabel, value: `¥${assetDeduction.external.toFixed(2)}`, isPayment: true })
    }
    lastSalePaymentLines.value = paymentDisplayLines

    const saleSummaryDetails = [
      { label: '商品合计', value: `¥${paymentTotalAmount.value.toFixed(2)}`, isSummary: true },
      ...(memberDiscountAmount.value > 0 ? [{ label: `会员折扣（${memberDiscountLabel.value}）`, value: `-¥${memberDiscountAmount.value.toFixed(2)}`, isSummary: true }] : []),
      ...(paymentCoupon.value ? [{ label: '优惠券', value: paymentCoupon.value.name, isSummary: true }] : []),
      ...(couponDiscount.value > 0 ? [{ label: '优惠券抵扣', value: `-¥${couponDiscount.value.toFixed(2)}`, isSummary: true }] : []),
      { label: '应付总计', value: `¥${paymentPayableAmount.value.toFixed(2)}`, isSummary: true },
      ...(assetDeduction.prepaid > 0 ? [{ label: '预存款抵扣', value: `-¥${assetDeduction.prepaid.toFixed(2)}`, isSummary: true }] : []),
      ...(assetDeduction.coins > 0 ? [{ label: '游戏币抵扣', value: `-${assetDeduction.coins.toFixed(2)}`, isSummary: true }] : []),
      ...(assetDeduction.external > 0 ? [{ label: '补差支付', value: `¥${assetDeduction.external.toFixed(2)}`, isSummary: true }] : []),
      { label: '支付方式', value: payload.paymentMethodName || '未记录', isSummary: true },
      ...(payload.paymentMethod === 'cash' && assetDeduction.external > 0
        ? [{ label: '对账提示', value: '现金入现金账，周期结算', isSummary: true }]
        : [])
    ]

    lastSaleDetails.value = [...saleLineDetails, ...saleSummaryDetails]

    // 清空购物车和优惠券
    cartItems.value = []
    selectedCoupon.value = null
    shouldShowSaleSuccess = true
  }

  // 新会员注册支付成功
  let shouldShowRegisterSuccess = false
  if (paymentMode.value === 'register' && pendingNewMember.value) {
    const m = pendingNewMember.value
    const pkg = m.package
    // 生成新会员对象并自动登入
    selectedMember.value = {
      id: Date.now(),
      name: m.name,
      phone: m.phone,
      avatar: `https://placehold.co/80x80/3791ff/fff?text=${m.name.charAt(0)}`,
      level: '普通会员',
      gender: m.gender,
      birthday: m.birthday,
      balance: pkg.name.includes('套票') || pkg.name.includes('次套票') ? 0 : pkg.price,
      coins: 0,
      cardNo: m.cardNo || ''
    }

    lastRegisterDetails.value = [
      { label: '会员姓名', value: m.name },
      { label: '手机号', value: m.phone },
      { label: '性别', value: m.gender },
      { label: '购买套餐', value: pkg.name },
      { label: '支付金额', value: `¥${pkg.price.toFixed(2)}` }
    ]
    if (m.birthday) {
      lastRegisterDetails.value.splice(3, 0, { label: '生日', value: m.birthday })
    }

    pendingNewMember.value = null
    shouldShowRegisterSuccess = true
  }

  showPaymentModal.value = false
  paymentAllowedMethodIds.value = []
  paymentDefaultMethodId.value = ''
  paymentAssetDeduction.value = null
  if (shouldShowRechargeSuccess) {
    setTimeout(() => {
      showRechargeSuccess.value = true
    }, 0)
  }
  if (shouldShowSaleSuccess) {
    setTimeout(() => {
      showSaleSuccess.value = true
    }, 0)
  }
  if (shouldShowRegisterSuccess) {
    setTimeout(() => {
      showRegisterSuccess.value = true
    }, 0)
  }
  // TODO: 调用实际支付接口
}

const handleProductHover = (product, event) => {
  if (!product.detail) return
  const cardRect = event.currentTarget.getBoundingClientRect()
  const gridEl = event.currentTarget.closest('.product-grid')
  if (!gridEl) return
  const gridRect = gridEl.getBoundingClientRect()
  hoveredDetail.value = product
  // 面板顶部对齐卡片垂直中轴线偏下，确保视觉居中
  const offsetY = cardRect.top - gridRect.top + cardRect.height * 0.55
  hoveredPos.value = {
    x: cardRect.right - gridRect.left + 14,
    y: Math.max(0, offsetY)
  }
}

const handleProductLeave = () => {
  hoveredDetail.value = null
}

const handleDeductionConfirm = (payload) => {
  console.log('扣费确认:', payload)
  // §5.2 扣费前资产快照
  const assetBefore = selectedMember.value ? {
    balance: Number(selectedMember.value.balance ?? 0),
    coins: Number(selectedMember.value.coins ?? 0)
  } : null
  // 使用折扣后实际扣费金额
  const totalAmount = payload.actualAmount || payload.totalAmount || 0

  // 防御性校验：余额不足则阻止扣费
  if (assetBefore) {
    const totalAssets = assetBefore.balance + assetBefore.coins
    if (totalAmount > totalAssets) {
      console.warn('扣费失败：会员资产不足', { totalAmount, totalAssets })
      return
    }
  }

  const deviceName = payload.device?.name || '未知设备'

  lastDeductionCount.value = payload.count || 1
  const deductionDetailLines = [
    { label: '设备', value: deviceName },
    { label: '单价', value: `¥${(payload.price || 0).toFixed(2)}` },
    { label: '人数', value: `${payload.count || 1}` },
    { label: '原价', value: `¥${((payload.price || 0) * (payload.count || 1)).toFixed(2)}` }
  ]
  if (payload.memberDiscountLabel) {
    deductionDetailLines.push({ label: `会员折扣（${payload.memberDiscountLabel}）`, value: `-¥${(((payload.price || 0) * (payload.count || 1)) - totalAmount).toFixed(2)}` })
  }
  deductionDetailLines.push({ label: '实扣金额', value: `¥${totalAmount.toFixed(2)}` })
  lastDeductionDetails.value = deductionDetailLines

  // 扣费后更新资产并记录变化
  if (selectedMember.value && assetBefore) {
    let remaining = totalAmount
    const fromBalance = Math.min(remaining, assetBefore.balance)
    remaining -= fromBalance
    const fromCoins = Math.min(remaining, assetBefore.coins)

    selectedMember.value = {
      ...selectedMember.value,
      balance: Math.max(0, Number((assetBefore.balance - fromBalance).toFixed(2))),
      coins: Math.max(0, Number((assetBefore.coins - fromCoins).toFixed(2)))
    }
    syncSelectedMemberSnapshot()

    const changes = []
    if (fromBalance > 0) {
      changes.push({ label: '预存款', before: `¥${assetBefore.balance.toFixed(2)}`, after: `¥${selectedMember.value.balance.toFixed(2)}` })
    }
    if (fromCoins > 0) {
      changes.push({ label: '游戏币', before: `${assetBefore.coins}`, after: `${selectedMember.value.coins}` })
    }
    lastDeductionAssetChanges.value = changes
  } else {
    lastDeductionAssetChanges.value = []
  }

  showDeductionModal.value = false
  showDeductionSuccess.value = true
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
  grid-template-columns: repeat(3, 1fr);
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
  min-width: 124px;
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 12px;
  border-radius: 9px;
  background: #fff;
  color: #171b24;
  text-decoration: none;
  font-size: 12px;
  font-weight: 800;
  border: 0;
  cursor: pointer;
}

.mini-action-icon {
  width: 18px;
  height: 18px;
  display: block;
  object-fit: contain;
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

/* 筛选下拉框 — 与搜索框等高、同圆角 */
.device-filter {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
}

.filter-select {
  width: 140px;
  height: 40px;
}
.filter-select :deep(.el-select__wrapper),
.filter-select :deep(.el-input__wrapper) {
  --el-input-border-color: #d5eaf9;
  height: 40px;
  border: 1px solid #d5eaf9;
  border-radius: 8px;
  background: #fff;
  box-shadow: none;
  padding: 0 6px;
}
.filter-select :deep(.el-select__wrapper:hover),
.filter-select :deep(.el-input__wrapper:hover) {
  --el-input-border-color: #d5eaf9;
  border-color: #d5eaf9;
}
.filter-select :deep(.el-select__wrapper.is-focus),
.filter-select :deep(.el-input__wrapper.is-focus) {
  --el-input-border-color: #d5eaf9;
  border-color: #d5eaf9;
  box-shadow: 0 0 0 1px #d5eaf9;
}
.filter-select :deep(.el-input__inner) {
  font-size: 11px;
  color: #334155;
  height: 38px;
  line-height: 38px;
}
.filter-select :deep(.el-input__inner::placeholder) {
  font-size: 11px;
  color: #a2a3a6;
}
.filter-select :deep(.el-input__prefix) {
  color: #a2a3a6;
}
.filter-select :deep(.el-input__suffix) {
  color: #c0c4cc;
}
.filter-select :deep(.el-input__clear) {
  color: #c0c4cc;
}

/* 产品卡片设备标签 */
.product-device-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  margin-top: 4px;
}

.device-tag {
  display: inline-block;
  padding: 1px 6px;
  border-radius: 4px;
  background: #eff6ff;
  color: #3b82f6;
  font-size: 10px;
  line-height: 1.6;
  white-space: nowrap;
}

.device-tag-more {
  background: #f3f4f6;
  color: #9ca3af;
}

.custom-recharge-card {
  flex-shrink: 0;
  min-height: 76px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 10px 12px 2px;
  padding: 12px;
  border: 1px solid #bfe2fb;
  border-radius: var(--product-card-radius);
  background: linear-gradient(135deg, #ffffff 0%, #f5fbff 58%, #e4f5ff 100%);
  box-shadow: 0 8px 20px rgba(21, 88, 150, 0.08);
  transition: border-color 180ms ease, box-shadow 180ms ease;
}

.custom-recharge-card.active {
  border-color: #1191ff;
  box-shadow: inset 0 0 0 1px #1191ff, 0 12px 24px rgba(17, 145, 255, 0.12);
}

.custom-recharge-copy {
  flex: 0 0 116px;
  min-width: 96px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
}

.custom-recharge-copy strong {
  color: #171b24;
  font-size: 15px;
  font-weight: 900;
  line-height: 1.25;
  white-space: nowrap;
}

.custom-recharge-copy em {
  color: #1191ff;
  font-size: 12px;
  font-style: normal;
  font-weight: 800;
  line-height: 1.2;
}

.custom-recharge-field {
  flex: 1 1 260px;
  min-width: 0;
  display: flex;
}

.custom-recharge-input {
  width: 100%;
  height: 48px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  border: 1.5px solid #d2e8f8;
  border-radius: 8px;
  background: #fff;
}

.custom-recharge-input:focus-within {
  border-color: #1191ff;
  box-shadow: 0 0 0 3px rgba(17, 145, 255, 0.12);
}

.custom-recharge-input b {
  color: #fc630a;
  font-size: 20px;
  font-weight: 900;
  line-height: 1;
}

.custom-recharge-input input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  color: #171b24;
  font-size: 20px;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
}

.custom-recharge-input input::placeholder {
  color: #b7c5d2;
  font-size: 16px;
  font-weight: 700;
}

@media (max-width: 1280px) {
  .custom-recharge-card {
    flex-wrap: wrap;
    align-items: stretch;
  }

  .custom-recharge-copy {
    flex: 1 0 100%;
    flex-direction: row;
    align-items: baseline;
    justify-content: flex-start;
    gap: 8px;
  }

  .custom-recharge-field {
    flex-basis: 100%;
  }
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
  min-height: 130px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
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
  width: 72px;
  height: 96px;
  flex: 0 0 72px;
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

.checkout-panel--recharge {
  background: linear-gradient(180deg, #d9efff 0%, #c9e8ff 100%);
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

.recharge-header {
  align-items: flex-start;
  padding-top: 18px;
}

.recharge-header-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.recharge-header-copy span {
  color: #5f7f9f;
  font-size: 12px;
  font-weight: 600;
}

.recharge-body {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 14px;
  overflow-y: auto;
}

.recharge-card {
  padding: 16px;
  border: 1px solid rgba(174, 215, 245, 0.92);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 8px 20px rgba(21, 88, 150, 0.08);
}

.recharge-card-label {
  display: inline-flex;
  margin-bottom: 14px;
  color: #6b8aa8;
  font-size: 11px;
  font-weight: 800;
}

.recharge-impact-main,
.recharge-impact-result {
  padding: 14px;
  border-radius: 10px;
  background: #f3f9ff;
}

.recharge-impact-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.recharge-impact-flow {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin: 10px 0;
}

.recharge-impact-flow div,
.recharge-plan-lines div {
  padding: 12px;
  border-radius: 10px;
  background: #f3f9ff;
}

.recharge-impact-main span,
.recharge-impact-flow span,
.recharge-impact-result span,
.recharge-plan-lines dt {
  display: block;
  color: #7891aa;
  font-size: 11px;
  font-weight: 700;
}

.recharge-impact-main strong,
.recharge-impact-flow strong,
.recharge-impact-result strong,
.recharge-plan-lines dd {
  margin: 6px 0 0;
  color: #171b24;
  font-size: 15px;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
}

.recharge-impact-main strong,
.recharge-impact-result strong {
  margin-top: 0;
  font-size: 18px;
}

.recharge-impact-result {
  border: 1px solid rgba(17, 145, 255, 0.18);
  background: linear-gradient(180deg, #eef8ff 0%, #ffffff 100%);
}

.recharge-impact-result strong {
  display: block;
  margin-top: 8px;
  color: #1191ff;
  font-size: 22px;
}

.recharge-empty {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 4px 0;
}

.recharge-empty strong {
  color: #171b24;
  font-size: 14px;
  font-weight: 800;
}

.recharge-empty span {
  color: #7b8da0;
  font-size: 12px;
  line-height: 1.6;
}

.recharge-empty--soft {
  min-height: 132px;
  justify-content: center;
}

.recharge-inline-btn {
  min-height: 34px;
  padding: 0 14px;
  border: 0;
  border-radius: 8px;
  background: #1191ff;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 800;
  box-shadow: 0 10px 18px rgba(17, 145, 255, 0.2);
}

.recharge-plan-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.recharge-plan-main > div {
  min-width: 0;
}

.recharge-plan-main strong {
  display: block;
  color: #171b24;
  font-size: 15px;
  font-weight: 800;
}

.recharge-plan-main span {
  display: block;
  margin-top: 6px;
  color: #70849a;
  font-size: 12px;
  font-weight: 600;
}

.recharge-plan-main em {
  flex-shrink: 0;
  display: inline-flex;
  align-items: baseline;
  gap: 2px;
  color: #fc630a;
  font-style: normal;
  font-size: 18px;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
  white-space: nowrap;
}

.recharge-plan-main em .currency-symbol {
  color: inherit;
}

.recharge-plan-lines {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 14px 0 0;
}

.recharge-plan-lines div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.recharge-plan-lines dd {
  margin-top: 0;
}

.recharge-notice p {
  margin: 0;
  color: #4f6780;
  font-size: 12px;
  line-height: 1.7;
  font-weight: 600;
}

.recharge-footer {
  padding-top: 12px;
}

.recharge-summary-card {
  background: linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
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

.asset-status-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid transparent;
}

.package-cash-notice {
  margin-top: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  background: #fff8e1;
  border: 1px solid #ffe082;
  font-size: 13px;
  color: #e65100;
  text-align: center;
}

.asset-status-card--ready {
  background: #effbf4;
  border-color: #b7ebc6;
}

.asset-status-card--warning {
  background: #fff6e8;
  border-color: #ffd8a8;
}

.asset-status-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.asset-status-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.asset-status-copy strong {
  color: #171b24;
  font-size: 13px;
  font-weight: 800;
}

.asset-status-copy span {
  color: #5b6472;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
}

.asset-status-head em {
  flex-shrink: 0;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.74);
  color: #171b24;
  font-style: normal;
  font-size: 12px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.asset-status-lines {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.asset-status-lines div {
  min-width: 0;
  padding: 8px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.7);
}

.asset-status-lines span,
.asset-status-lines strong {
  display: block;
}

.asset-status-lines span {
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
}

.asset-status-lines strong {
  margin-top: 3px;
  color: #171b24;
  font-size: 13px;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
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

.checkout-aux-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.checkout-secondary-btn {
  flex: 1;
  min-height: 40px;
  border: 1px solid #d5eaf9;
  border-radius: 10px;
  background: #fff;
  color: #2f6fa9;
  cursor: pointer;
  font-size: 13px;
  font-weight: 800;
  transition: border-color 0.15s ease, background-color 0.15s ease, color 0.15s ease;
}

.checkout-secondary-btn:hover {
  border-color: #93c5fd;
  background: #f5fbff;
}

.checkout-secondary-btn--accent {
  border-color: #fed7aa;
  background: #fff7ed;
  color: #c2410c;
}

.checkout-secondary-btn--accent:hover {
  border-color: #fb923c;
  background: #ffedd5;
}

/* ===== 会员折扣行 ===== */
.member-discount-line {
  padding: 8px 0;
  border-bottom: 1px dashed #e8d5f5;
}
.member-discount-line span {
  color: #7c3aed;
  font-size: 13px;
  font-weight: 700;
}
.member-discount-amount {
  color: #7c3aed !important;
  font-style: normal !important;
  font-weight: 900 !important;
  font-variant-numeric: tabular-nums;
}
.member-discount-amount .currency-symbol {
  color: #7c3aed !important;
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

/* ===== 商品悬浮详情面板 ===== */
.product-card.has-detail {
  position: relative;
}

.product-detail-panel {
  position: absolute;
  z-index: 60;
  width: 320px;
  border-radius: 10px;
  background: #fff;
  box-shadow:
    0 16px 40px rgba(16, 47, 84, 0.18),
    0 6px 14px rgba(16, 47, 84, 0.1),
    inset 0 0 0 1px rgba(17, 145, 255, 0.12);
  overflow: hidden;
}

.detail-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 46px;
  padding: 0 18px;
  border-bottom: 1px solid #eef3f8;
}

.detail-panel-title {
  font-size: 14px;
  font-weight: 800;
  color: #171b24;
}

.detail-panel-list {
  margin: 0;
  padding: 14px 22px 20px;
  max-height: 520px;
  overflow-y: auto;
  scroll-behavior: smooth;
}
.detail-panel-list::-webkit-scrollbar {
  width: 4px;
}
.detail-panel-list::-webkit-scrollbar-thumb {
  background: #d5e5f5;
  border-radius: 2px;
}

.detail-row {
  display: flex;
  align-items: baseline;
  gap: 24px;
  line-height: 1.55;
}

.detail-row + .detail-row {
  margin-top: 10px;
}

.detail-row dt {
  flex-shrink: 0;
  min-width: 88px;
  font-size: 13px;
  font-weight: 600;
  color: #6b7c93;
}

.detail-row dd {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 500;
  color: #1a2332;
  word-break: break-all;
}

.detail-row dd.highlight {
  color: #F97316;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
}

/* 面板过渡动画 */
.detail-fade-enter-active {
  transition: opacity 180ms ease, transform 200ms ease;
}

.detail-fade-leave-active {
  transition: opacity 120ms ease, transform 140ms ease;
}

.detail-fade-enter-from,
.detail-fade-leave-to {
  opacity: 0;
  transform: translateX(-8px) scale(0.98);
}
</style>

