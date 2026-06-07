<template>
  <transition name="ds-fade">
    <div
      v-if="visible"
      class="ds-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-modal-title"
      @click.self="$emit('close')"
    >
      <section class="ds-dialog" :class="`ds-dialog--${type}`">
        <div class="ds-header-actions">
          <button type="button" class="ds-close" :aria-label="`关闭${title}提示`" @click="$emit('close')">
            <el-icon><Close /></el-icon>
          </button>
        </div>

        <div class="ds-hero">
          <!-- 注册类型：人像图标 -->
          <template v-if="type === 'register'">
            <div class="ds-icon-wrap" aria-hidden="true">
              <div class="ds-register-icon">
                <el-icon class="ds-register-user"><UserFilled /></el-icon>
              </div>
              <div class="ds-check-icon ds-check-icon--register">
                <el-icon><Check /></el-icon>
              </div>
            </div>
          </template>
          <!-- 默认：¥ 金钱图标 -->
          <template v-else>
            <div class="ds-icon-wrap" aria-hidden="true">
              <div class="ds-money-icon">
                <span>¥</span>
              </div>
              <div class="ds-check-icon">
                <el-icon><Check /></el-icon>
              </div>
            </div>
          </template>
          <h2 id="success-modal-title">{{ title }}</h2>
        </div>

        <div class="ds-paper-assembly">
          <div class="ds-paper-slot" aria-hidden="true">
            <span class="ds-slot-shadow"></span>
            <span class="ds-slot-highlight"></span>
          </div>
          <div class="ds-detail-card">
            <h3>{{ subtitle }}</h3>
            <dl class="ds-detail-list">
              <div
                v-for="(item, idx) in displayDetails"
                :key="item.label"
                class="ds-detail-row"
                :class="{ 'ds-detail-row--summary': item.isSummary, 'ds-detail-row--first-summary': item.isSummary && !displayDetails[idx - 1]?.isSummary }"
              >
                <dt>
                  <span class="ds-detail-label">{{ item.label }}</span>
                  <span v-if="item.subvalue" class="ds-detail-subvalue">{{ item.subvalue }}</span>
                </dt>
                <dd :class="{ 'dd-accent': type === 'register' && item.label === '会员姓名' }">{{ item.value }}</dd>
              </div>
            </dl>

            <!-- §8.1 支付拆分区 -->
            <template v-if="paymentLines && paymentLines.length > 0">
              <div class="ds-divider"></div>
              <h3 class="ds-section-title ds-section-title--payment">支付明细</h3>
              <dl class="ds-detail-list">
                <div v-for="line in paymentLines" :key="line.label" class="ds-detail-row">
                  <dt>
                    <span class="ds-detail-label">{{ line.label }}</span>
                  </dt>
                  <dd :class="{ 'dd-green': line.isDiscount, 'dd-red': line.isPayment }">{{ line.value }}</dd>
                </div>
              </dl>
            </template>

            <!-- §8.1 会员资产变化区 -->
            <template v-if="assetChanges && assetChanges.length > 0">
              <div class="ds-divider"></div>
              <h3 class="ds-section-title ds-section-title--asset">会员资产</h3>
              <dl class="ds-detail-list">
                <div v-for="change in assetChanges" :key="change.label" class="ds-detail-row ds-detail-row--asset">
                  <dt>
                    <span class="ds-detail-label">{{ change.label }}</span>
                  </dt>
                  <dd>
                    <span class="ds-asset-before">{{ change.before }}</span>
                    <span class="ds-asset-arrow">→</span>
                    <span class="ds-asset-after">{{ change.after }}</span>
                  </dd>
                </div>
              </dl>
            </template>
          </div>
        </div>
      </section>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'
import { Check, Close, UserFilled } from '@element-plus/icons-vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  count: { type: Number, default: 1 },
  title: { type: String, default: '扣费成功' },
  subtitle: { type: String, default: '本次扣费如下' },
  details: { type: Array, default: () => [] },
  type: { type: String, default: 'default' },
  // §8.1 支付拆分行：[{label, value, isDiscount, isPayment}]
  paymentLines: { type: Array, default: () => [] },
  // §8.1 资产变化行：[{label, before, after}]
  assetChanges: { type: Array, default: () => [] }
})

defineEmits(['close'])

const displayDetails = computed(() => {
  if (props.details.length > 0) {
    return props.details
  }
  return [{ label: '预存次数：', value: props.count }]
})
</script>

<style scoped>
.ds-overlay {
  position: fixed;
  inset: 0;
  z-index: 70;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
  background: var(--pos-overlay-backdrop);
}

.ds-dialog {
  position: relative;
  width: min(92vw, 392px);
  min-height: 336px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 0;
}

.ds-header-actions {
  position: absolute;
  top: -24px;
  right: -30px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 2;
}

.ds-close {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 50%;
  background: rgba(116, 130, 153, 0.78);
  color: #edf4ff;
  cursor: pointer;
  font-size: 24px;
  box-shadow:
    0 12px 24px rgba(20, 31, 52, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.22);
  transition: transform 180ms ease, background-color 180ms ease, box-shadow 180ms ease;
}

.ds-close:hover {
  background: rgba(85, 99, 122, 0.92);
  transform: scale(1.04);
  box-shadow:
    0 16px 30px rgba(20, 31, 52, 0.32),
    inset 0 1px 0 rgba(255, 255, 255, 0.24);
}

/* ===== Hero ===== */
.ds-hero {
  width: 100%;
  min-height: 184px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 29px 26px 33px;
  border-radius: 34px;
  background: linear-gradient(135deg, #9edcff 0%, #b7f5ec 100%);
  box-shadow:
    0 24px 48px rgba(10, 77, 148, 0.28),
    0 8px 16px rgba(3, 102, 214, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.62),
    inset 0 -10px 18px rgba(32, 160, 255, 0.08);
}

/* Register hero — warm celebration gradient */
.ds-dialog--register .ds-hero {
  background: linear-gradient(145deg, #ffe8cc 0%, #ffd194 40%, #fccb7b 100%);
  box-shadow:
    0 24px 48px rgba(200, 100, 20, 0.22),
    0 8px 16px rgba(180, 80, 10, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.68),
    inset 0 -10px 18px rgba(220, 140, 50, 0.06);
}

.ds-icon-wrap {
  position: relative;
  width: 58px;
  height: 52px;
  margin-bottom: 8px;
}

/* ---- ¥ money icon (default) ---- */
.ds-money-icon {
  position: absolute;
  left: 6px;
  top: 5px;
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #1379ff;
  color: #d9f5ff;
  box-shadow:
    0 9px 16px rgba(0, 92, 214, 0.3),
    0 0 0 5px rgba(61, 169, 255, 0.23),
    inset 0 2px 0 rgba(255, 255, 255, 0.2),
    inset 0 -5px 10px rgba(0, 80, 210, 0.26);
}

.ds-money-icon span {
  margin-top: 2px;
  font-size: 27px;
  font-weight: 900;
  line-height: 1;
}

/* ---- Person icon (register) ---- */
.ds-register-icon {
  position: absolute;
  left: 6px;
  top: 5px;
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #f5933e;
  color: #fff7ed;
  box-shadow:
    0 9px 16px rgba(200, 90, 20, 0.3),
    0 0 0 5px rgba(245, 160, 70, 0.22),
    inset 0 2px 0 rgba(255, 255, 255, 0.24),
    inset 0 -5px 10px rgba(160, 60, 10, 0.22);
}

.ds-register-user {
  font-size: 26px;
}

/* ---- Check badge ---- */
.ds-check-icon {
  position: absolute;
  right: 2px;
  bottom: 0;
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #087dff;
  color: #d5fbff;
  font-size: 18px;
  box-shadow:
    0 8px 14px rgba(0, 92, 214, 0.26),
    0 0 0 4px rgba(73, 181, 255, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.24);
}

.ds-check-icon--register {
  background: #e07b28;
  color: #fff7ed;
  box-shadow:
    0 8px 14px rgba(200, 90, 20, 0.28),
    0 0 0 4px rgba(245, 160, 70, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.26);
}

/* ---- Hero title ---- */
.ds-hero h2 {
  margin: 0;
  color: #1a7cff;
  font-size: 16px;
  font-weight: 900;
  line-height: 1.2;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.55);
}

.ds-dialog--register .ds-hero h2 {
  color: #b5510a;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.6);
}

/* ===== Paper card ===== */
.ds-paper-assembly {
  position: relative;
  width: calc(100% - 40px);
  margin-top: -26px;
}

.ds-detail-card {
  position: relative;
  z-index: 5;
  width: calc(100% - 18px);
  min-height: 176px;
  margin-top: 8px;
  margin-left: auto;
  margin-right: auto;
  padding: 20px 34px 28px;
  border-radius: 0 0 10px 10px;
  background: #fff;
  box-shadow:
    0 22px 42px rgba(16, 47, 84, 0.22),
    0 8px 16px rgba(16, 47, 84, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.92);
}

.ds-dialog--register .ds-detail-card {
  box-shadow:
    0 22px 42px rgba(139, 80, 20, 0.16),
    0 8px 16px rgba(139, 80, 20, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.92);
}

.ds-detail-card::before {
  content: "";
  position: absolute;
  top: -2px;
  left: 0;
  right: 0;
  height: 6px;
  z-index: 6;
  border-radius: 0;
  background: linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
  box-shadow:
    0 2px 6px rgba(255, 255, 255, 0.72),
    inset 0 1px 0 rgba(255, 255, 255, 0.96),
    inset 0 -4px 7px rgba(175, 197, 224, 0.3);
}

.ds-dialog--register .ds-detail-card::before {
  background: linear-gradient(180deg, #ffffff 0%, #fffaf5 100%);
  box-shadow:
    0 2px 6px rgba(255, 255, 255, 0.72),
    inset 0 1px 0 rgba(255, 255, 255, 0.96),
    inset 0 -4px 7px rgba(210, 170, 120, 0.25);
}

/* Slot bar */
.ds-paper-slot {
  position: absolute;
  top: -5px;
  left: -2px;
  right: -2px;
  height: 22px;
  z-index: 3;
  border-radius: 999px;
  background: linear-gradient(180deg, #07234a 0%, #04162f 54%, #062149 100%);
  border: 3px solid #1a92ff;
  box-shadow:
    0 12px 18px rgba(1, 21, 54, 0.24),
    inset 0 1px 0 rgba(136, 215, 255, 0.3),
    inset 0 -3px 0 rgba(3, 10, 28, 0.42);
}

.ds-dialog--register .ds-paper-slot {
  background: linear-gradient(180deg, #4a2c10 0%, #2e1a06 54%, #3d2208 100%);
  border: 3px solid #e0913a;
  box-shadow:
    0 12px 18px rgba(80, 35, 10, 0.26),
    inset 0 1px 0 rgba(240, 200, 140, 0.28),
    inset 0 -3px 0 rgba(20, 8, 2, 0.42);
}

.ds-slot-shadow {
  position: absolute;
  left: 14px;
  right: 14px;
  top: 6px;
  height: 7px;
  border-radius: 999px;
  background: rgba(0, 5, 20, 0.72);
  filter: blur(1px);
}

.ds-dialog--register .ds-slot-shadow {
  background: rgba(30, 10, 0, 0.72);
}

.ds-slot-highlight {
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 2px;
  height: 3px;
  border-radius: 999px;
  background: rgba(103, 212, 255, 0.82);
  opacity: 0.9;
}

.ds-dialog--register .ds-slot-highlight {
  background: rgba(245, 185, 90, 0.78);
}

/* ===== Detail content ===== */
.ds-detail-card h3 {
  margin: 0;
  padding-top: 4px;
  color: #050505;
  text-align: center;
  font-size: 16px;
  font-weight: 900;
  line-height: 1.35;
}

/* Section divider — straight line between areas */
.ds-divider {
  margin: 18px 0 14px;
  border: none;
  border-top: 1px solid #e5e7eb;
}

/* Section titles inside unified card */
.ds-section-title {
  margin: 0;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.35;
}

.ds-section-title--payment {
  color: #059669;
}

.ds-section-title--asset {
  color: #1e40af;
}

/* Color-coded values */
.dd-green {
  color: #059669 !important;
}

.dd-red {
  color: #dc2626 !important;
}

/* Asset change row */
.ds-detail-row--asset dd {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.ds-asset-before {
  color: #64748b;
  font-weight: 700;
  text-decoration: line-through;
  font-size: 13px;
}

.ds-asset-arrow {
  color: #94a3b8;
  font-weight: 700;
  font-size: 12px;
}

.ds-asset-after {
  color: #1e293b;
  font-weight: 900;
  font-size: 15px;
}

.ds-detail-list {
  margin: 20px 0 0;
}

.ds-detail-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 18px;
}

.ds-detail-row + .ds-detail-row {
  margin-top: 12px;
}

.ds-detail-row dt,
.ds-detail-row dd {
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
}

.ds-detail-row dt {
  color: #8e8e8e;
  font-weight: 500;
  min-width: 0;
}

.ds-detail-label,
.ds-detail-subvalue {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ds-detail-label {
  color: #6b7280;
  font-weight: 700;
  white-space: nowrap;
}

.ds-detail-subvalue {
  margin-top: 2px;
  color: #9ca3af;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.ds-detail-row dd {
  min-width: 72px;
  color: #050505;
  text-align: right;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

/* Summary row: bolder, slightly larger, with separator above */
.ds-detail-row--first-summary {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px dashed #d1d5db;
}

.ds-detail-row--summary dt {
  font-weight: 800;
}

.ds-detail-row--summary .ds-detail-label {
  color: #374151;
}

.ds-detail-row--summary dd {
  font-size: 15px;
  color: #0f172a;
}

/* Register member name highlight */
.ds-dialog--register .dd-accent {
  color: #f5933e;
}

/* ===== Transitions ===== */
.ds-fade-enter-active,
.ds-fade-leave-active {
  transition: opacity 220ms ease;
}

.ds-fade-enter-active .ds-dialog {
  transition: transform 240ms ease, opacity 240ms ease;
}

.ds-fade-enter-from,
.ds-fade-leave-to {
  opacity: 0;
}

.ds-fade-enter-from .ds-dialog {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}

@media (max-width: 680px) {
  .ds-overlay {
    padding: 22px;
  }

  .ds-dialog {
    width: min(94vw, 356px);
  }

  .ds-header-actions {
    top: -24px;
    right: -8px;
  }

  .ds-hero {
    min-height: 176px;
    border-radius: 32px;
  }

  .ds-detail-card {
    padding-inline: 24px;
  }
}
</style>
