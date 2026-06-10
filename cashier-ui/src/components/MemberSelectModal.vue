<template>
  <transition name="modal-fade">
    <div
      v-if="visible"
      class="member-select-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="选择会员"
      @click.self="$emit('close')"
    >
      <section class="member-select-modal">
        <!-- 头部 -->
        <header class="msm-header">
          <h2>选择会员</h2>
          <div class="msm-header-actions">
            <button type="button" class="msm-refresh" aria-label="刷新" @click="$emit('refresh')"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6"/><path d="M2.5 22v-6h6"/><path d="M2 11.5a10 10 0 0 1 18.8-4.3"/><path d="M22 12.5a10 10 0 0 1-18.8 4.2"/></svg></button>
            <button type="button" class="msm-close" aria-label="关闭" @click="$emit('close')">
              <el-icon><Close /></el-icon>
            </button>
          </div>
        </header>

        <!-- 主体三栏布局 -->
        <div class="msm-body">
          <!-- 左侧导航栏 -->
          <aside class="msm-sidebar">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              type="button"
              class="msm-tab"
              :class="{ active: activeTab === tab.id }"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </aside>

          <!-- 中间内容区 -->
          <main class="msm-search-area">

            <!-- ===== 模糊搜索 tab ===== -->
            <template v-if="activeTab === 'search'">
              <div class="msm-search-bar">
                <div class="msm-input-wrap">
                  <el-icon class="msm-search-icon"><Search /></el-icon>
                  <input
                    v-model="keyword"
                    type="text"
                    placeholder="输入会员名/手机号/会员卡号"
                    class="msm-input"
                    @keyup.enter="handleSearch"
                  />
                </div>
                <button type="button" class="msm-search-btn" @click="handleSearch">搜索</button>
              </div>

              <!-- 搜索结果列表 -->
              <div class="msm-result-list">
                <template v-if="searchResults.length > 0">
                  <button
                    v-for="m in searchResults"
                    :key="m.id"
                    type="button"
                    class="msm-result-item"
                    @click="$emit('select', m)"
                  >
                    <img :src="m.avatar" class="msm-avatar-img" :alt="m.name" />
                    <span class="msm-result-info">
                      <strong>{{ m.name }}</strong>
                      <em>{{ m.phone }}</em>
                    </span>
                  </button>
                </template>
                <div v-else-if="hasSearched && keyword" class="msm-empty">
                  <span>未找到匹配的会员</span>
                </div>
              </div>
            </template>

            <!-- ===== 点击刷卡 tab ===== -->
            <template v-else-if="activeTab === 'swipe'">
              <div class="msm-device-view">
                <div class="msm-card-reader">
                  <img :src="`${BASE_URL}card-reader-enabled-icon-v5.svg.svg?v=1`" alt="刷会员卡" />
                </div>
                <p class="msm-device-hint">请刷会员卡</p>
              </div>
            </template>

            <!-- ===== 点击扫码 tab ===== -->
            <template v-else-if="activeTab === 'scan'">
              <div class="msm-device-view">
                <div class="msm-scan-illustration">
                  <img :src="`${BASE_URL}member-scan-illustration.png`" alt="扫码枪扫码会员码" />
                </div>
                <p class="msm-device-hint">使用扫码枪扫码会员码</p>
              </div>
            </template>

          </main>

          <!-- 右侧历史记录 -->
          <aside class="msm-history-panel">
            <h3>搜索历史</h3>
            <div class="msm-history-list">
              <template v-if="historyList.length > 0">
                <button
                  v-for="(m, idx) in historyList"
                  :key="'hist-' + idx"
                  type="button"
                  class="msm-history-item"
                  @click="$emit('select', m)"
                >
                  <img :src="m.avatar" class="msm-avatar-img small" :alt="m.name" />
                  <span class="msm-history-info">
                    <strong>{{ m.name }}</strong>
                    <em>{{ m.phone }}</em>
                  </span>
                </button>
              </template>
              <p v-else class="msm-no-history">暂无历史记录</p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue'
import { Close, Search } from '@element-plus/icons-vue'

const BASE_URL = import.meta.env.BASE_URL

defineProps({
  visible: { type: Boolean, default: false },
  historyList: { type: Array, default: () => [] }
})

defineEmits(['close', 'select', 'refresh'])

const tabs = [
  { id: 'search', label: '模糊搜索' },
  { id: 'swipe', label: '点击刷卡' },
  { id: 'scan', label: '点击扫码' }
]

const activeTab = ref('search')
const keyword = ref('')
const hasSearched = ref(false)

// 生成头像 SVG
const createAvatar = (bg1, bg2, initial) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><linearGradient id="av" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${bg1}"/><stop offset="100%" stop-color="${bg2}"/></linearGradient></defs><rect width="40" height="40" rx="20" fill="url(#av)"/><circle cx="20" cy="15" r="7" fill="rgba(255,255,255,0.9)"/><ellipse cx="20" cy="33" rx="12" ry="10" fill="rgba(255,255,255,0.85)"/></svg>`
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
}

// 模拟会员数据（实际应从 API 获取）
const allMembers = [
  { id: 1, name: '李明', phone: '17600110765', level: '钻石', balance: 300, coins: 2704, tickets: 0, times: 6, avatar: createAvatar('#74b9ff', '#0984e3', '李'), expireHint: '近3日即将过期' },
  { id: 2, name: '王芳', phone: '139****5678', level: '铂金', balance: 1200, coins: 1500, tickets: 3, times: 10, avatar: createAvatar('#fd79a8', '#e84393', '王') },
  { id: 3, name: '张伟', phone: '13790123456', level: '黄金', balance: 200, coins: 500, tickets: 1, times: 4, avatar: createAvatar('#55efc4', '#00b894', '张') },
  { id: 4, name: '刘洋', phone: '13634567890', level: '黄金', balance: 800, coins: 900, tickets: 2, times: 8, avatar: createAvatar('#ffeaa7', '#fdcb6e', '刘') },
  { id: 5, name: '陈静', phone: '15812345678', level: '铂金', balance: 1500, coins: 3200, tickets: 5, times: 12, avatar: createAvatar('#a29bfe', '#6c5ce7', '陈') },
  { id: 6, name: '周磊', phone: '15987654321', level: '白银', balance: 350, coins: 120, tickets: 0, times: 2, avatar: createAvatar('#fab1a0', '#e17055', '周') }
]

// 打开弹窗即展示全部会员
const searchResults = ref([...allMembers])

const handleSearch = () => {
  hasSearched.value = true
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) {
    searchResults.value = []
    return
  }
  searchResults.value = allMembers.filter(
    (m) =>
      m.name.toLowerCase().includes(kw) ||
      m.phone.includes(kw) ||
      String(m.id).includes(kw)
  )
}
</script>

<style scoped>
/* ---- 遮罩层 ---- */
.member-select-overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
  background: var(--pos-overlay-backdrop);
}

/* ---- 弹窗主体 ---- */
.member-select-modal {
  width: min(100%, 900px);
  height: 560px;
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(180deg, #dff0ff 0%, #f7f9ff 100%);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.24);
  display: flex;
  flex-direction: column;
}

/* ---- 头部 ---- */
.msm-header {
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px 0 22px;
  background: #edf3fa;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  flex-shrink: 0;
}

.msm-header h2 {
  margin: 0;
  color: #1d2433;
  font-size: 16px;
  font-weight: 700;
}

.msm-close {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  color: #4f5d73;
  cursor: pointer;
}

.msm-close .el-icon {
  font-size: 20px;
}

.msm-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.msm-refresh {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  color: #4f5d73;
  cursor: pointer;
}

.msm-refresh:hover {
  color: #2f7eff;
}

/* ---- 主体三栏布局 ---- */
.msm-body {
  flex: 1;
  display: grid;
  grid-template-columns: 130px 1fr 220px;
  min-height: 0;
}

/* ---- 左侧导航 ---- */
.msm-sidebar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 22px 12px;
  background: rgba(191, 220, 248, 0.55);
}

.msm-tab {
  width: 100%;
  height: 42px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #4f6380;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
}

.msm-tab:hover {
  color: #2f7eff;
  background: rgba(255, 255, 255, 0.55);
}

.msm-tab.active {
  color: #fff;
  background: linear-gradient(90deg, #3791ff 0%, #2c6eff 100%);
  box-shadow: 0 10px 18px rgba(47, 126, 255, 0.2);
}

/* ---- 中间搜索区 ---- */
.msm-search-area {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 24px;
  background: rgba(210, 230, 252, 0.45);
  overflow-y: auto;
}

/* 搜索栏 */
.msm-search-bar {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-shrink: 0;
}

.msm-input-wrap {
  flex: 1;
  height: 42px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #d5eaf9;
  box-shadow: 0 2px 6px rgba(21, 88, 150, 0.05);
}

.msm-input-wrap:focus-within {
  border-color: #1191ff;
  box-shadow: 0 0 0 3px rgba(17, 145, 255, 0.12);
}

.msm-search-icon {
  color: #a2a3a6;
  font-size: 16px;
  flex-shrink: 0;
}

.msm-input {
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: #171b24;
  font-size: 14px;
}

.msm-input::placeholder {
  color: #a2a3a6;
}

.msm-search-btn {
  height: 42px;
  padding: 0 20px;
  border: 0;
  border-radius: 8px;
  background: linear-gradient(90deg, #3791ff 0%, #2c6eff 100%);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 8px 16px rgba(47, 126, 255, 0.2);
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.msm-search-btn:hover {
  opacity: 0.92;
  transform: translateY(-1px);
}

/* 结果列表 */
.msm-result-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
}

.msm-result-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid rgba(216, 239, 255, 0.85);
  text-align: left;
  cursor: pointer;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.15s ease;
}

.msm-result-item:hover {
  border-color: #1191ff;
  box-shadow: 0 6px 16px rgba(17, 145, 255, 0.1);
  transform: translateY(-1px);
}

/* 右侧历史记录面板 */
.msm-history-panel {
  padding: 18px 14px;
  background: rgba(210, 230, 252, 0.35);
  border-left: 1px solid rgba(185, 221, 246, 0.6);
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
}

.msm-history-panel h3 {
  margin: 0;
  color: #1d2433;
  font-size: 14px;
  font-weight: 700;
}

.msm-history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
}

.msm-history-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid rgba(216, 239, 255, 0.75);
  text-align: left;
  cursor: pointer;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.msm-history-item:hover {
  border-color: #91cdfa;
  box-shadow: 0 4px 10px rgba(17, 145, 255, 0.08);
}

/* 通用：头像图片 */
.msm-avatar-img {
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  border-radius: 50%;
  object-fit: cover;
  background: #dcecf8;
}

.msm-avatar-img.small {
  width: 30px;
  height: 30px;
  flex: 0 0 30px;
}

/* 通用：信息文字 */
.msm-result-info,
.msm-history-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.msm-result-info strong,
.msm-history-info strong {
  color: #171b24;
  font-size: 13px;
  font-weight: 700;
}

.msm-result-info em,
.msm-history-info em {
  color: #6f7785;
  font-style: normal;
  font-size: 12px;
}

/* 空状态 */
.msm-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6f7785;
  font-size: 13px;
}

.msm-no-history {
  margin: 0;
  color: #a2a3a6;
  font-size: 12px;
  text-align: center;
  line-height: 2;
}

/* ---- 设备视图（刷卡 / 扫码共用） ---- */
.msm-device-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.msm-device-hint {
  margin: 0;
  color: #4f5d73;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
}

/* ---- 刷卡器 ---- */
.msm-card-reader {
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.msm-card-reader img {
  width: auto;
  height: 100%;
  display: block;
  object-fit: contain;
}

/* ---- 扫码插图 ---- */
.msm-scan-illustration {
  width: min(360px, 70%);
  aspect-ratio: 793 / 379;
  display: flex;
  align-items: center;
  justify-content: center;
}

.msm-scan-illustration img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
  border-radius: 12px;
}

/* 动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
