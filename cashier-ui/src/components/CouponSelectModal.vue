<template>
  <transition name="modal-fade">
    <div
      v-if="visible"
      class="csm-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="选择优惠券"
      @click.self="$emit('close')"
    >
      <section class="csm-dialog">
        <!-- 头部 -->
        <header class="csm-header">
          <h2>选择优惠券</h2>
          <button type="button" class="csm-close" aria-label="关闭" @click="$emit('close')">
            <el-icon><Close /></el-icon>
          </button>
        </header>

        <!-- 搜索栏 -->
        <div class="csm-toolbar">
          <span class="csm-toolbar-label">变换类型:</span>
          <div class="csm-search-box">
            <el-icon><Search /></el-icon>
            <input v-model="searchText" type="text" placeholder="请输入优惠券码" />
          </div>
          <button type="button" class="csm-search-btn">搜索</button>
          <button type="button" class="csm-confirm-btn-inline" @click="handleConfirm">确定</button>
        </div>

        <!-- 券列表 -->
        <div class="csm-body">
          <article
            v-for="(coupon, idx) in filteredCoupons"
            :key="coupon.id"
            class="csm-coupon-card"
            :class="{ selected: selectedCoupon === idx }"
            @click="toggleSelect(idx)"
          >
            <!-- 第一行：名称 + 标签 -->
            <div class="csm-card-head">
              <strong class="csm-card-title">{{ coupon.name }}</strong>
              <span v-if="coupon.tag" class="csm-card-tag">{{ coupon.tag }}</span>
              <!-- 选中勾 -->
              <transition name="check-pop">
                <span v-if="selectedCoupon === idx" class="csm-check-badge">
                  <el-icon><Check /></el-icon>已选
                </span>
              </transition>
            </div>

            <!-- 第二行：使用门槛 + 券面值 -->
            <div class="csm-card-price-row">
              <span class="csm-condition">{{ coupon.condition }}</span>
              <div class="csm-card-discount-area">
                <template v-if="coupon.type === 'discount'">
                  <span class="csm-currency">¥</span>
                  <strong class="csm-final-price">{{ coupon.value }}</strong>
                  <small class="csm-price-label">券面值</small>
                </template>
                <template v-else-if="coupon.type === 'rate'">
                  <strong class="csm-final-price csm-rate-text">{{ coupon.value }}</strong>
                  <span class="csm-rate-suffix">折</span>
                  <small class="csm-price-label">折扣率</small>
                </template>
              </div>
            </div>

            <!-- 第三行：原价 -->
            <div v-if="coupon.originalPrice" class="csm-original-row">
              <span class="csm-original-price">原价：<em>¥{{ coupon.originalPrice }}</em></span>
            </div>

            <!-- 第四行：有效期 -->
            <div v-if="coupon.validity && !coupon.validity.includes('过期')" class="csm-valid-row">
              可用时间：{{ coupon.validity }}
            </div>

            <!-- 使用规则 -->
            <ul class="csm-rules-list">
              <li v-if="coupon.stores">
                <label>可用门店：</label>{{ coupon.stores }}
              </li>
              <li v-if="coupon.projects">
                <label>可兑换项目：</label>{{ coupon.projects }}
                <a href="javascript:void(0)" class="csm-link" @click.stop="toggleProjects(coupon.id)">
                  {{ expandedIds.has(coupon.id) ? '收起' : '查看可兑换项目' }}
                </a>
                <div v-if="expandedIds.has(coupon.id)" class="csm-projects-detail">
                  <p>{{ coupon.projects }}</p>
                </div>
              </li>
              <li>
                <label>可用日期：</label>{{ coupon.dateRule || '无限制' }}
              </li>
              <li>
                <label>其它规则：</label>{{ coupon.otherRule || '暂无' }}
              </li>
            </ul>

          </article>

          <p v-if="filteredCoupons.length === 0" class="csm-empty">暂无匹配的优惠券</p>
        </div>
      </section>
    </div>
  </transition>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Close, Check, Search } from '@element-plus/icons-vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  currentCouponId: { type: [Number, String], default: null },
  orderAmount: { type: Number, default: 0 },
  coupons: { type: Array, default: () => [] }
})

const emit = defineEmits(['close', 'select'])

const coupons = ref([])
const selectedCoupon = ref(-1)
const searchText = ref('')
const expandedIds = ref(new Set())

const toggleProjects = (id) => {
  const s = new Set(expandedIds.value)
  if (s.has(id)) {
    s.delete(id)
  } else {
    s.add(id)
  }
  expandedIds.value = s
}

// 搜索过滤
const filteredCoupons = computed(() => {
  const keyword = searchText.value.trim()
  if (!keyword) return coupons.value
  const kw = keyword.toLowerCase()
  return coupons.value.filter(c =>
    c.name.toLowerCase().includes(kw) ||
    (c.code && c.code.toLowerCase().includes(kw))
  )
})

watch(() => props.visible, (val) => {
  if (val) {
    // 所有券默认可用
    coupons.value = (props.coupons || []).map(c => ({ ...c }))
    searchText.value = ''
    expandedIds.value = new Set()
    if (props.currentCouponId) {
      const idx = coupons.value.findIndex((c) => c.id === props.currentCouponId)
      selectedCoupon.value = idx >= 0 ? idx : -1
    } else {
      selectedCoupon.value = -1
    }
  }
})

const toggleSelect = (idx) => {
  if (selectedCoupon.value === idx) {
    selectedCoupon.value = -1
  } else {
    selectedCoupon.value = idx
  }
}

const handleConfirm = () => {
  const coupon = selectedCoupon.value >= 0 ? coupons.value[selectedCoupon.value] : null
  emit('select', coupon)
  emit('close')
}
</script>

<style scoped>
/* ===== 遮罩层 — 与其他弹窗一致 ===== */
.csm-overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.62);
}

/* ===== 弹窗主体 ===== */
.csm-dialog {
  width: min(100%, 620px);
  height: 640px;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(180deg, #dff0ff 0%, #f7f9ff 100%);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.24);
}

/* ---- 头部 ---- */
.csm-header {
  flex-shrink: 0;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px 0 22px;
  background: #edf3fa;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
}

.csm-header h2 {
  margin: 0;
  color: #1d2433;
  font-size: 16px;
  font-weight: 700;
}

.csm-close {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #4f5d73;
  cursor: pointer;
  transition: all 0.15s ease;
}

.csm-close:hover {
  background: rgba(255, 255, 255, 0.55);
  color: #2f7eff;
}

.csm-close .el-icon {
  font-size: 20px;
}

/* ---- 工具栏（搜索区）---- */
.csm-toolbar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.05);
}

.csm-toolbar-label {
  font-size: 13px;
  font-weight: 700;
  color: #333;
  white-space: nowrap;
}

.csm-search-box {
  flex: 1;
  min-width: 160px;
  height: 34px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  border: 1px solid #d5eaf9;
  border-radius: 6px;
  background: #fff;
  color: #a2a3a6;
  transition: border-color 0.15s ease;
}

.csm-search-box:focus-within {
  border-color: #3791ff;
  box-shadow: 0 0 0 2px rgba(55, 145, 255, 0.12);
}

.csm-search-box .el-icon {
  font-size: 14px;
  color: #94a3b8;
  flex-shrink: 0;
}

.csm-search-box input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  font-size: 13px;
  color: #171b24;
  background: transparent;
}

.csm-search-box input::placeholder {
  color: #c0c4cc;
}

.csm-search-btn,
.csm-confirm-btn-inline {
  height: 34px;
  padding: 0 16px;
  border: 0;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.csm-search-btn {
  background: linear-gradient(90deg, #3791ff 0%, #2c6eff 100%);
  color: #fff;
  box-shadow: 0 4px 10px rgba(47, 126, 255, 0.25);
}

.csm-search-btn:hover {
  opacity: 0.92;
  transform: translateY(-0.5px);
}

.csm-confirm-btn-inline {
  background: transparent;
  border: 1.5px solid #3791ff;
  color: #3791ff;
}

.csm-confirm-btn-inline:hover {
  background: rgba(55, 145, 255, 0.06);
}

/* ---- 列表主体 ---- */
.csm-body {
  flex: 1;
  overflow-y: auto;
  padding: 14px 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ===== 优惠券卡片 — 参考图信息密集型布局 ===== */
.csm-coupon-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 16px 18px 14px;
  border: 1.5px solid #d5eaf9;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(21, 88, 150, 0.04);
}

.csm-coupon-card:hover {
  border-color: #7cb8e6;
  box-shadow: 0 6px 20px rgba(17, 145, 255, 0.1);
}

.csm-coupon-card.selected {
  border-color: #3791ff;
  border-width: 2px;
  box-shadow: 0 4px 18px rgba(47, 126, 255, 0.15), inset 0 0 0 1px rgba(55, 145, 255, 0.03);
  background: linear-gradient(to bottom, #fafdff 0%, #fff 60%);
}

/* ---- 卡片头部：标题 + 标签 ---- */
.csm-card-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.csm-card-title {
  font-size: 15px;
  font-weight: 800;
  color: #111827;
  line-height: 1.3;
}

.csm-card-tag {
  display: inline-flex;
  align-items: center;
  padding: 1px 9px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  letter-spacing: 0.3px;
}

/* 特价券 — 橙色 */
.csm-card-tag[data-tag="特价"],
.csm-card-tag[data-tag="特价券"] {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  color: #e65100;
  border: 1px solid rgba(230, 81, 0, 0.15);
}

/* 特享券 — 蓝色 */
.csm-card-tag[data-tag="特享"],
.csm-card-tag[data-tag="特享券"] {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  color: #1565c0;
  border: 1px solid rgba(21, 101, 192, 0.15);
}

/* 新人券 — 绿色 */
.csm-card-tag[data-tag="新人"] {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  color: #2e7d32;
  border: 1px solid rgba(46, 125, 50, 0.15);
}

/* 折扣券 — 紫色 */
.csm-card-tag[data-tag="折扣"],
.csm-card-tag[data-tag="折扣券"] {
  background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
  color: #7b1fa2;
  border: 1px solid rgba(123, 31, 162, 0.15);
}

/* 默认 fallback */
.csm-card-tag:not([data-tag]) {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  color: #e65100;
  border: 1px solid rgba(230, 81, 0, 0.15);
}

/* 选中徽章 */
.csm-check-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-left: auto;
  padding: 2px 10px;
  border-radius: 999px;
  background: linear-gradient(90deg, #3791ff 0%, #2c6eff 100%);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
}

.csm-check-badge .el-icon {
  font-size: 12px;
}

.check-pop-enter-active {
  animation: checkPopIn 0.28s cubic-bezier(.34, 1.56, .64, 1);
}

@keyframes checkPopIn {
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

/* ---- 价格行：门槛 + 券面值 ---- */
.csm-card-price-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
}

.csm-condition {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

/* ---- 原价行 ---- */
.csm-original-row {
  margin-bottom: 6px;
}

.csm-original-price {
  font-size: 12px;
  color: #94a3b8;
}

.csm-original-price em {
  font-style: normal;
  text-decoration: line-through;
  color: #b0b8c4;
  font-weight: 600;
}

.csm-card-discount-area {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.csm-currency {
  font-size: 18px;
  font-style: normal;
  font-weight: 800;
  color: #111827;
}

.csm-final-price {
  font-size: 32px;
  font-weight: 900;
  color: #111827;
  line-height: 1;
  letter-spacing: -0.5px;
}

.csm-rate-text {
  font-size: 32px;
}

.csm-rate-suffix {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.csm-price-label {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 500;
  margin-left: 4px;
}

/* ---- 有效期行 ---- */
.csm-valid-row {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 8px;
}

/* ---- 使用规则列表 ---- */
.csm-rules-list {
  list-style: none;
  margin: 0;
  padding: 10px 14px 0;
  border-top: 1px dashed #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.csm-rules-list li {
  font-size: 11.5px;
  color: #6b7280;
  line-height: 1.6;
  position: relative;
  padding-left: 12px;
}

.csm-rules-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #9ca3af;
  font-weight: bold;
}

.csm-rules-list label {
  color: #6b7280;
  font-weight: 500;
}

.csm-link {
  color: #3791ff;
  font-weight: 600;
  text-decoration: none;
  margin-left: 2px;
  transition: color 0.15s ease;
}

.csm-link:hover {
  color: #2563eb;
  text-decoration: underline;
}

/* ---- 可兑换项目展开详情 ---- */
.csm-projects-detail {
  margin-top: 6px;
  padding: 8px 12px;
  background: #f0f6ff;
  border-radius: 6px;
  border: 1px solid #d5eaf9;
  font-size: 12px;
  color: #374151;
  line-height: 1.7;
}

.csm-projects-detail p {
  margin: 0;
}

/* ---- 空状态 ---- */
.csm-empty {
  flex: 1;
  text-align: center;
  color: #a2a3a6;
  font-size: 14px;
  font-weight: 600;
  display: grid;
  place-items: center;
  min-height: 200px;
}

/* ===== 过渡动画 ===== */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
