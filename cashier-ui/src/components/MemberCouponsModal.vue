<template>
  <transition name="modal-fade">
    <div
      v-if="visible"
      class="mcm-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="会员优惠券"
      @click.self="$emit('close')"
    >
      <section class="mcm-dialog">
        <!-- 头部 -->
        <header class="mcm-header">
          <h2>会员优惠券</h2>
          <div class="mcm-header-actions">
            <span class="mcm-coupon-count">共 {{ coupons.length }} 张</span>
            <button type="button" class="mcm-close" aria-label="关闭" @click="$emit('close')">
              <el-icon><Close /></el-icon>
            </button>
          </div>
        </header>

        <!-- 搜索栏 -->
        <div class="mcm-toolbar">
          <div class="mcm-search-box">
            <el-icon><Search /></el-icon>
            <input v-model="searchText" type="text" placeholder="搜索优惠券名称" />
          </div>
          <button type="button" class="mcm-search-btn" @click="searchText = ''" v-if="searchText">清除</button>
        </div>

        <!-- 券列表 -->
        <div class="mcm-body">
          <article
            v-for="coupon in filteredCoupons"
            :key="coupon.id"
            class="mcm-coupon-card"
          >
            <!-- 第一行：名称 + 标签 + 状态 -->
            <div class="mcm-card-head">
              <strong class="mcm-card-title">{{ coupon.name }}</strong>
              <span v-if="coupon.tag" class="mcm-card-tag" :data-tag="coupon.tag">{{ coupon.tag }}</span>
              <span class="mcm-card-status" :class="coupon.status || 'valid'">
                {{ statusLabel(coupon.status) }}
              </span>
            </div>

            <!-- 第二行：使用门槛 + 券面值 -->
            <div class="mcm-card-price-row">
              <span class="mcm-condition">{{ coupon.condition }}</span>
              <div class="mcm-card-discount-area">
                <template v-if="coupon.type === 'discount'">
                  <span class="mcm-currency">¥</span>
                  <strong class="mcm-final-price">{{ coupon.value }}</strong>
                  <small class="mcm-price-label">券面值</small>
                </template>
                <template v-else-if="coupon.type === 'rate'">
                  <strong class="mcm-final-price mcm-rate-text">{{ coupon.value }}</strong>
                  <span class="mcm-rate-suffix">折</span>
                  <small class="mcm-price-label">折扣率</small>
                </template>
              </div>
            </div>

            <!-- 有效期 -->
            <div v-if="coupon.validity" class="mcm-valid-row">
              可用时间：{{ coupon.validity }}
            </div>

            <!-- 使用规则 -->
            <ul v-if="coupon.stores" class="mcm-rules-list">
              <li v-if="coupon.stores">
                <label>可用门店：</label>{{ coupon.stores }}
              </li>
            </ul>
          </article>

          <p v-if="filteredCoupons.length === 0" class="mcm-empty">
            {{ searchText ? '未找到匹配的优惠券' : '暂无可用优惠券' }}
          </p>
        </div>

        <!-- 底部 -->
        <footer class="mcm-footer">
          <button type="button" class="mcm-close-btn" @click="$emit('close')">关闭</button>
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
  coupons: { type: Array, default: () => [] }
})

const emit = defineEmits(['close'])

const searchText = ref('')

const statusLabel = (status) => {
  const map = { valid: '有效', used: '已使用', expired: '已过期', frozen: '已冻结' }
  return map[status] || '有效'
}

const filteredCoupons = computed(() => {
  const keyword = searchText.value.trim()
  if (!keyword) return props.coupons
  const kw = keyword.toLowerCase()
  return props.coupons.filter(c =>
    c.name.toLowerCase().includes(kw) ||
    (c.code && c.code.toLowerCase().includes(kw))
  )
})

watch(() => props.visible, (val) => {
  if (val) {
    searchText.value = ''
  }
})
</script>

<style scoped>
/* ===== 遮罩层 ===== */
.mcm-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--pos-overlay-backdrop);
}

/* ===== 弹窗主体 ===== */
.mcm-dialog {
  width: min(100%, 640px);
  height: 680px;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  background: #D9EBFC;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.24);
}

/* ---- 头部 ---- */
.mcm-header {
  flex-shrink: 0;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px 0 22px;
  background: #edf3fa;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
}

.mcm-header h2 {
  margin: 0;
  color: #1d2433;
  font-size: 16px;
  font-weight: 700;
}

.mcm-header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mcm-coupon-count {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  background: rgba(55, 145, 255, 0.08);
  padding: 3px 10px;
  border-radius: 999px;
}

.mcm-close {
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

.mcm-close:hover {
  background: rgba(255, 255, 255, 0.55);
  color: #2f7eff;
}

.mcm-close .el-icon {
  font-size: 20px;
}

/* ---- 搜索栏 ---- */
.mcm-toolbar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.05);
}

.mcm-search-box {
  flex: 1;
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

.mcm-search-box:focus-within {
  border-color: #3791ff;
  box-shadow: 0 0 0 2px rgba(55, 145, 255, 0.12);
}

.mcm-search-box .el-icon {
  font-size: 14px;
  color: #94a3b8;
  flex-shrink: 0;
}

.mcm-search-box input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  font-size: 13px;
  color: #171b24;
  background: transparent;
}

.mcm-search-box input::placeholder {
  color: #c0c4cc;
}

.mcm-search-btn {
  height: 34px;
  padding: 0 14px;
  border: 1px solid #d5eaf9;
  border-radius: 6px;
  background: #fff;
  color: #6b7280;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.mcm-search-btn:hover {
  border-color: #3791ff;
  color: #3791ff;
}

/* ---- 列表主体 ---- */
.mcm-body {
  flex: 1;
  overflow-y: auto;
  padding: 14px 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

.mcm-body::-webkit-scrollbar {
  width: 6px;
}

.mcm-body::-webkit-scrollbar-track {
  background: transparent;
}

.mcm-body::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.mcm-body::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.35);
}

/* ===== 优惠券卡片 ===== */
.mcm-coupon-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 16px 18px 14px;
  border: 1.5px solid #d5eaf9;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(21, 88, 150, 0.04);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.mcm-coupon-card:hover {
  border-color: #7cb8e6;
  box-shadow: 0 6px 20px rgba(17, 145, 255, 0.08);
}

/* ---- 卡片头部 ---- */
.mcm-card-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.mcm-card-title {
  font-size: 15px;
  font-weight: 800;
  color: #111827;
  line-height: 1.3;
}

.mcm-card-tag {
  display: inline-flex;
  align-items: center;
  padding: 1px 9px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  letter-spacing: 0.3px;
}

.mcm-card-tag[data-tag="特享"],
.mcm-card-tag[data-tag="特享券"] {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  color: #1565c0;
  border: 1px solid rgba(21, 101, 192, 0.15);
}

.mcm-card-tag[data-tag="新人"] {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  color: #2e7d32;
  border: 1px solid rgba(46, 125, 50, 0.15);
}

.mcm-card-tag[data-tag="折扣"],
.mcm-card-tag[data-tag="折扣券"] {
  background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
  color: #7b1fa2;
  border: 1px solid rgba(123, 31, 162, 0.15);
}

.mcm-card-tag:not([data-tag]) {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  color: #e65100;
  border: 1px solid rgba(230, 81, 0, 0.15);
}

/* 状态标签 */
.mcm-card-status {
  margin-left: auto;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

.mcm-card-status.valid { background: #e8f5e9; color: #2e7d32; }
.mcm-card-status.used { background: #f5f5f5; color: #9e9e9e; }
.mcm-card-status.expired { background: #fce4ec; color: #c62828; }
.mcm-card-status.frozen { background: #fff3e0; color: #e65100; }

/* ---- 价格行 ---- */
.mcm-card-price-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
}

.mcm-condition {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.mcm-card-discount-area {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.mcm-currency {
  font-size: 18px;
  font-style: normal;
  font-weight: 800;
  color: #111827;
}

.mcm-final-price {
  font-size: 32px;
  font-weight: 900;
  color: #111827;
  line-height: 1;
  letter-spacing: -0.5px;
}

.mcm-rate-text { font-size: 32px; }

.mcm-rate-suffix {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.mcm-price-label {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 500;
  margin-left: 4px;
}

/* ---- 有效期行 ---- */
.mcm-valid-row {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 8px;
}

/* ---- 使用规则列表 ---- */
.mcm-rules-list {
  list-style: none;
  margin: 0;
  padding: 10px 14px 0;
  border-top: 1px dashed #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.mcm-rules-list li {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.6;
  position: relative;
  padding-left: 12px;
}

.mcm-rules-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #9ca3af;
  font-weight: bold;
}

.mcm-rules-list label {
  color: #6b7280;
  font-weight: 500;
}

/* ---- 空状态 ---- */
.mcm-empty {
  flex: 1;
  text-align: center;
  color: #a2a3a6;
  font-size: 14px;
  font-weight: 600;
  display: grid;
  place-items: center;
  min-height: 200px;
}

/* ---- 底部 ---- */
.mcm-footer {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  padding: 16px 24px 20px;
}

.mcm-close-btn {
  width: 160px;
  height: 42px;
  border: 1.5px solid #d5eaf9;
  border-radius: 8px;
  background: #fff;
  color: #4f5d73;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.mcm-close-btn:hover {
  background: #f0f7ff;
  border-color: #91cdfa;
  color: #3791ff;
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
