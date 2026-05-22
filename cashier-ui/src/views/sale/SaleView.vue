<template>
  <div class="sale-view">
    <!-- BEGIN: Main Content Area -->
    <div class="content-area">
      <!-- Left Column: Product Selection -->
      <div class="left-column">
        <!-- Member Login Header -->
        <div class="member-bar">
          <span class="member-status">未登入会员</span>
          <div class="member-actions">
            <button class="btn-outline">
              <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
              选择会员
            </button>
            <button class="btn-primary">
              <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
              新增会员
            </button>
          </div>
        </div>
        
        <!-- Product Categories & Search -->
        <div class="product-section">
          <div class="section-header">
            <div class="tab-nav">
              <button 
                v-for="tab in tabs" 
                :key="tab.id"
                :class="['tab-item', { active: activeTab === tab.id }]"
                @click="activeTab = tab.id"
              >
                {{ tab.name }}
              </button>
            </div>
            <div class="search-bar">
              <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
              <input class="search-input" placeholder="搜索" type="text" v-model="searchQuery" />
            </div>
          </div>
          
          <!-- Product Grid -->
          <div class="product-grid custom-scrollbar">
            <div 
              v-for="product in filteredProducts" 
              :key="product.id"
              class="product-card"
              @click="addToCart(product)"
            >
              <div class="product-image"></div>
              <div class="product-info">
                <h3 class="product-name">{{ product.name }}</h3>
                <p class="product-price">¥{{ product.price.toFixed(2) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Right Column: Cart / Checkout -->
      <div class="right-column">
        <!-- Cart Items List -->
        <div class="cart-section">
          <div class="cart-header">
            <h2 class="cart-title">结账单 ({{ cartItems.length }})</h2>
            <button class="clear-btn" @click="clearCart">清空</button>
          </div>
          
          <div class="cart-items custom-scrollbar">
            <div 
              v-for="(item, index) in cartItems" 
              :key="index"
              class="cart-item"
            >
              <div class="item-top">
                <h3 class="item-name">{{ item.name }}</h3>
                <span class="item-price">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
              </div>
              <div class="item-bottom">
                <button class="delete-btn" @click="removeFromCart(index)">删除</button>
                <div class="quantity-stepper">
                  <button class="qty-btn" @click="decreaseQty(index)">
                    <svg class="qty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M20 12H4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                    </svg>
                  </button>
                  <input class="qty-input" readonly type="text" v-model="item.quantity" />
                  <button class="qty-btn qty-btn-add" @click="increaseQty(index)">
                    <svg class="qty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 4v16m8-8H4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Checkout Footer -->
        <div class="checkout-section">
          <div class="checkout-summary">
            <div class="summary-row">
              <span class="summary-label">合计:</span>
              <span class="summary-value">¥{{ totalAmount.toFixed(2) }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">优惠券:</span>
              <button class="coupon-btn">0 张可用 &gt;</button>
            </div>
            <div class="summary-row total-row">
              <span class="total-label">实付</span>
              <span class="total-value">¥{{ totalAmount.toFixed(2) }}</span>
            </div>
          </div>
          <button class="checkout-btn" @click="checkout">
            去结算 ¥{{ totalAmount.toFixed(2) }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const tabs = [
  { id: 'single', name: '单次消费' },
  { id: 'recharge', name: '充值活动' },
  { id: 'package', name: '套票' },
  { id: 'product', name: '商品' }
]

const activeTab = ref('single')
const searchQuery = ref('')

const products = ref([
  { id: 1, name: '游戏/设备名称', price: 20.00, category: 'single' },
  { id: 2, name: 'VR体验', price: 35.00, category: 'single' },
  { id: 3, name: '儿童区畅玩', price: 25.00, category: 'single' },
  { id: 4, name: '私人影院', price: 50.00, category: 'single' },
  { id: 5, name: '台球时光', price: 30.00, category: 'single' },
  { id: 6, name: '棋牌娱乐', price: 20.00, category: 'single' },
  { id: 7, name: '派对包厢', price: 80.00, category: 'single' },
  { id: 8, name: '会员储值卡', price: 500.00, category: 'recharge' }
])

const cartItems = ref([])

const filteredProducts = computed(() => {
  let filtered = products.value.filter(p => p.category === activeTab.value)
  if (searchQuery.value) {
    filtered = filtered.filter(p => p.name.includes(searchQuery.value))
  }
  return filtered
})

const totalAmount = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
})

const addToCart = (product) => {
  const existing = cartItems.value.find(item => item.id === product.id)
  if (existing) {
    existing.quantity++
  } else {
    cartItems.value.push({ ...product, quantity: 1 })
  }
}

const removeFromCart = (index) => {
  cartItems.value.splice(index, 1)
}

const increaseQty = (index) => {
  cartItems.value[index].quantity++
}

const decreaseQty = (index) => {
  if (cartItems.value[index].quantity > 1) {
    cartItems.value[index].quantity--
  } else {
    removeFromCart(index)
  }
}

const clearCart = () => {
  cartItems.value = []
}

const checkout = () => {
  if (cartItems.value.length === 0) return
  alert(`结算金额: ¥${totalAmount.value.toFixed(2)}`)
}
</script>

<style scoped>
.sale-view {
  flex: 1;
  display: flex;
  overflow: hidden;
  padding: 16px;
  gap: 16px;
}

/* Content Area */
.content-area {
  flex: 1;
  display: flex;
  gap: 16px;
  overflow: hidden;
}

/* Left Column */
.left-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
}

/* Member Bar */
.member-bar {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.member-status {
  color: #6b7280;
  font-weight: 500;
}

.member-actions {
  display: flex;
  gap: 12px;
}

.btn-outline,
.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-outline {
  border: 1px solid #3b82f6;
  color: #3b82f6;
  background: transparent;
}

.btn-outline:hover {
  background-color: #eff6ff;
}

.btn-primary {
  background-color: #3b82f6;
  color: #ffffff;
  border: none;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

/* Product Section */
.product-section {
  flex: 1;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 8px;
  margin-bottom: 16px;
}

.tab-nav {
  display: flex;
  gap: 32px;
}

.tab-item {
  font-size: 14px;
  font-weight: 500;
  color: #9ca3af;
  padding-bottom: 8px;
  border: none;
  background: none;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
}

.tab-item:hover {
  color: #6b7280;
}

.tab-item.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

/* Search Bar */
.search-bar {
  position: relative;
  width: 256px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding: 6px 12px 6px 36px;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 9999px;
  font-size: 14px;
  outline: none;
}

.search-input:focus {
  border-color: #3b82f6;
  ring: 2px solid #3b82f6;
}

/* Product Grid */
.product-grid {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #bfdbfe;
  border-radius: 10px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.product-card {
  border: 1px solid #f3f4f6;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.product-card:hover {
  border-color: #93c5fd;
}

.product-image {
  width: 96px;
  height: 96px;
  background-color: #f3f4f6;
  border-radius: 8px;
  flex-shrink: 0;
}

.product-info {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 4px 0;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.product-price {
  color: #f97316;
  font-weight: bold;
}

/* Right Column - Cart */
.right-column {
  width: 384px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
}

.cart-section {
  flex: 1;
  background-color: #ffffff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.cart-header {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #fafafa;
}

.cart-title {
  font-weight: bold;
  color: #4b5563;
}

.clear-btn {
  font-size: 12px;
  color: #9ca3af;
  padding: 4px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: none;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  background-color: #f9fafb;
}

.cart-items {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.cart-item {
  background-color: rgba(249, 250, 252, 0.5);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #dbeafe;
  margin-bottom: 12px;
}

.cart-item:last-child {
  margin-bottom: 0;
}

.item-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.item-name {
  font-weight: 500;
  color: #1f2937;
}

.item-price {
  color: #f97316;
  font-weight: bold;
}

.item-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.delete-btn {
  font-size: 12px;
  color: #9ca3af;
  padding: 4px 16px;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-btn:hover {
  color: #ef4444;
  border-color: #fecaca;
}

/* Quantity Stepper */
.quantity-stepper {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.qty-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  transition: all 0.2s;
}

.qty-btn:hover {
  background-color: #f9fafb;
}

.qty-btn-add {
  background-color: #3b82f6;
  color: #ffffff;
}

.qty-btn-add:hover {
  background-color: #2563eb;
}

.qty-icon {
  width: 16px;
  height: 16px;
}

.qty-input {
  width: 40px;
  height: 32px;
  border-left: 1px solid #e5e7eb;
  border-right: 1px solid #e5e7eb;
  text-align: center;
  font-size: 14px;
  outline: none;
  background: #ffffff;
}

/* Checkout Section */
.checkout-section {
  padding: 16px;
  background-color: #ffffff;
  border-top: 1px solid #fafafa;
}

.checkout-summary {
  margin-bottom: 24px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.summary-label {
  color: #6b7280;
  font-size: 14px;
}

.summary-value {
  font-weight: bold;
  color: #1f2937;
}

.coupon-btn {
  color: #60a5fa;
  font-size: 14px;
  background: none;
  border: none;
  cursor: pointer;
}

.total-row {
  padding-top: 8px;
  border-top: 1px solid #f3f4f6;
  margin-bottom: 0;
}

.total-label {
  font-size: 18px;
  font-weight: bold;
  color: #1f2937;
}

.total-value {
  font-size: 24px;
  font-weight: bold;
  color: #f97316;
}

.checkout-btn {
  width: 100%;
  background-color: #3b82f6;
  color: #ffffff;
  padding: 16px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.2);
  transition: all 0.2s;
}

.checkout-btn:hover {
  background-color: #2563eb;
}

.checkout-btn:active {
  transform: scale(0.98);
}
</style>
