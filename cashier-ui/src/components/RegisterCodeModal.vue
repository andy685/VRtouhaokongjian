<template>
  <transition name="rcm-fade">
    <div
      v-if="visible"
      class="rcm-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="注册码"
      @click.self="$emit('close')"
    >
      <section class="rcm-dialog">
        <!-- 头部 -->
        <header class="rcm-header">
          <h2>会员扫码注册</h2>
          <div class="rcm-header-actions">
            <button type="button" class="rcm-refresh" aria-label="刷新" @click="$emit('refresh')"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6"/><path d="M2.5 22v-6h6"/><path d="M2 11.5a10 10 0 0 1 18.8-4.3"/><path d="M22 12.5a10 10 0 0 1-18.8 4.2"/></svg></button>
            <button type="button" class="rcm-close" aria-label="关闭" @click="$emit('close')">
              <el-icon><Close /></el-icon>
            </button>
          </div>
        </header>

        <!-- 图片区域 -->
        <div class="rcm-body">
          <img
            src="/register-qr-poster.png"
            alt="扫码注册会员二维码"
            class="rcm-poster-img"
          />
          <p class="rcm-hint">用户扫描上方二维码，3 秒完成注册</p>
        </div>
      </section>
    </div>
  </transition>
</template>

<script setup>
import { Close } from '@element-plus/icons-vue'

defineProps({
  visible: { type: Boolean, default: false }
})
defineEmits(['close', 'refresh'])
</script>

<style scoped>
/* ===== 遮罩层 ===== */
.rcm-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
  background: rgba(8, 12, 28, 0.65);
}

/* ===== 弹窗主体 — 渐变光感底 ===== */
.rcm-dialog {
  width: min(100%, 520px);
  max-height: calc(100vh - 56px);
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(160deg, #fdfbff 0%, #f3eeff 30%, #faf8ff 60%, #fff 100%);
  box-shadow:
    0 30px 80px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

/* ---- 头部 ---- */
.rcm-header {
  flex-shrink: 0;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px 0 22px;
  background: linear-gradient(135deg, #1a0540 0%, #2d0f66 50%, #1a0540 100%);
}

.rcm-header h2 {
  margin: 0;
  color: #c9aaff;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 1px;
}

.rcm-close {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  color: #b39ddb;
  cursor: pointer;
  transition: all 0.15s ease;
}

.rcm-close:hover {
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
}

.rcm-close .el-icon {
  font-size: 20px;
}

.rcm-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.rcm-refresh {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  color: #b39ddb;
  cursor: pointer;
  transition: all 0.15s ease;
}

.rcm-refresh:hover {
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
}

/* ---- 内容区 — 玻璃光感 ---- */
.rcm-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 20px 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  /* 玻璃质感 */
  background:
    radial-gradient(ellipse 80% 60% at 50% 0%, rgba(171, 140, 255, 0.08) 0%, transparent 60%),
    radial-gradient(ellipse 50% 40% at 80% 90%, rgba(120, 210, 255, 0.06) 0%, transparent 60%),
    linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(248, 244, 255, 0.25) 100%);
  border-top: 1px solid rgba(255, 255, 255, 0.5);
  position: relative;
}

/* 微妙光泽叠加层 */
.rcm-body::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
  background:
    linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(255,255,255,0.15) 100%);
  z-index: 0;
}

/* 确保内容在光泽层之上 */
.rcm-body > * {
  position: relative;
  z-index: 1;
}

/* 海报图片 — 光感玻璃边框 */
.rcm-poster-img {
  width: 100%;
  max-width: 480px;
  border-radius: 12px;
  box-shadow:
    0 6px 30px rgba(58, 20, 120, 0.15),
    0 1px 3px rgba(0, 0, 0, 0.06),
    inset 0 0 0 1px rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(171, 140, 255, 0.12);
  transition: box-shadow 0.3s ease;
}

.rcm-hint {
  margin: 0;
  font-size: 13px;
  color: #9a8abf;
  text-align: center;
  font-weight: 500;
  letter-spacing: 0.3px;
}

/* ===== 过渡动画 ===== */
.rcm-fade-enter-active,
.rcm-fade-leave-active {
  transition: opacity 0.25s ease;
}
.rcm-fade-enter-from,
.rcm-fade-leave-to {
  opacity: 0;
}
</style>
