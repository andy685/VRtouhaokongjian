<template>
  <section class="log-page" aria-label="操作日志">
    <div class="log-body">
      <!-- 筛选面板 -->
      <section class="log-filter-panel">
        <div class="log-filter-grid">
          <label class="log-field log-field--date">
            <span>日期范围：</span>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </label>

          <label class="log-field">
            <span>操作人：</span>
            <el-input v-model="filters.user" placeholder="操作人" clearable />
          </label>

          <label class="log-field">
            <span>操作类型：</span>
            <el-select v-model="filters.action" placeholder="全部" clearable>
              <el-option v-for="item in actionOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </label>

          <label class="log-field">
            <span>关键词：</span>
            <el-input v-model="filters.keyword" placeholder="搜索日志详情" clearable />
          </label>

          <button type="button" class="log-search-btn" @click="currentPage = 1">查询</button>
        </div>
      </section>

      <!-- 表格面板 -->
      <section class="log-table-panel">
        <div class="log-table-scroll">
          <div class="log-table-inner">
            <!-- 表头 -->
            <div class="log-table-head">
              <span>时间</span>
              <span>操作人</span>
              <span>操作类型</span>
              <span>操作详情</span>
              <span>IP地址</span>
            </div>

            <!-- 表体 -->
            <div class="log-table-body">
              <article
                v-for="row in pagedLogs"
                :key="row.id"
                class="log-row"
              >
                <div class="log-cell">{{ row.time }}</div>
                <div class="log-cell">{{ row.user }}</div>
                <div class="log-cell">
                  <span class="log-action-tag" :class="`log-action-tag--${row.actionType}`">{{ row.action }}</span>
                </div>
                <div class="log-cell log-cell--detail">{{ row.detail }}</div>
                <div class="log-cell">{{ row.ip }}</div>
              </article>
            </div>
          </div>

          <div v-if="filteredLogs.length === 0" class="log-empty">
            <span class="log-empty-title">暂无日志记录</span>
            <span class="log-empty-hint">调整筛选条件后再试试看</span>
          </div>
        </div>

        <div class="log-pagination">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="filteredLogs.length"
            layout="prev, pager, next"
          />
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const dateRange = ref([])
const currentPage = ref(1)
const pageSize = ref(20)

const filters = reactive({
  user: '',
  action: '',
  keyword: ''
})

const actionOptions = ['交班', '退款', '消费', '充值', '登录', '登出', '修改订单', '删除订单']

const logs = ref([
  { id: 1, time: '2024-01-15 18:00:25', user: '张三', action: '交班', actionType: 'shift', detail: '交班给李四，现金1680元', ip: '192.168.1.100' },
  { id: 2, time: '2024-01-15 17:30:10', user: '张三', action: '退款', actionType: 'refund', detail: '订单ORDER20240115005退款68元', ip: '192.168.1.100' },
  { id: 3, time: '2024-01-15 16:45:30', user: '张三', action: '消费', actionType: 'consume', detail: '会员李明消费VR体验68元', ip: '192.168.1.100' },
  { id: 4, time: '2024-01-15 15:20:00', user: '李四', action: '充值', actionType: 'recharge', detail: '会员王芳充值500元，赠送50元', ip: '192.168.1.101' },
  { id: 5, time: '2024-01-15 14:10:00', user: '张三', action: '登录', actionType: 'login', detail: '用户登录系统', ip: '192.168.1.100' },
  { id: 6, time: '2024-01-15 13:05:30', user: '李四', action: '修改订单', actionType: 'edit', detail: '修改订单ORDER20240115003金额为128元', ip: '192.168.1.101' },
  { id: 7, time: '2024-01-15 12:00:00', user: '张三', action: '登出', actionType: 'logout', detail: '用户退出系统', ip: '192.168.1.100' },
  { id: 8, time: '2024-01-15 10:30:15', user: '李四', action: '消费', actionType: 'consume', detail: '散客消费VR射击游戏45元', ip: '192.168.1.101' },
])

const filteredLogs = computed(() => {
  return logs.value.filter(log => {
    if (filters.user && log.user !== filters.user) return false
    if (filters.action && log.action !== filters.action) return false
    if (filters.keyword && !log.detail.includes(filters.keyword)) return false
    // 日期筛选：暂时不做，实际场景通过后端接口过滤
    return true
  })
})

const pagedLogs = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredLogs.value.slice(start, end)
})
</script>

<style scoped>
/* ============================================
   统一字体规范 (Type Scale)
   H1: 18px  |  页面主标题
   H2: 15px  |  区块标题 / 表头
   Body: 14px  |  正文 / 表格内容
   Small: 12px  |  辅助文字 / 标签
   ============================================ */

.log-page {
  --fs-page: 13px;
  --fs-body: 13px;
  --fs-small: 12px;

  min-height: calc(100vh - 86px);
  min-width: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 12px 14px 16px;
  background: #eaf7ff;
  overflow: hidden;
}

/* ========== 主体 ========== */
.log-body {
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.log-filter-panel,
.log-table-panel {
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(30, 64, 175, 0.06);
  width: 100%;
}

/* ========== 筛选面板 ========== */
.log-filter-panel {
  min-width: 0;
  padding: 16px 24px 20px;
  overflow: hidden;
}

.log-filter-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr 1fr auto;
  gap: 14px 20px;
  align-items: end;
}

.log-field {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.log-field > span {
  flex-shrink: 0;
  color: #334155;
  font-size: var(--fs-small);
  font-weight: 500;
  white-space: nowrap;
}

.log-field :deep(.el-input),
.log-field :deep(.el-select),
.log-field :deep(.el-date-editor) {
  width: 100%;
}

.log-field :deep(.el-input__wrapper),
.log-field :deep(.el-select__wrapper),
.log-field :deep(.el-date-editor.el-input__wrapper) {
  min-height: 32px;
  border-radius: 8px;
  box-shadow: 0 0 0 1px #e2e8f0 inset;
  padding: 0 10px;
}

.log-field :deep(.el-input__inner),
.log-field :deep(.el-select__placeholder) {
  font-size: var(--fs-small);
  color: #475569;
}

.log-field :deep(.el-date-editor .el-range-input) {
  font-size: var(--fs-small);
  color: #475569;
}

.log-field :deep(.el-date-editor .el-range-separator) {
  font-size: var(--fs-small);
  color: #94a3b8;
}

.log-field :deep(.el-input__wrapper:hover),
.log-field :deep(.el-select__wrapper:hover),
.log-field :deep(.el-date-editor.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #93c5fd inset;
}

.log-field :deep(.is-focus),
.log-field :deep(.el-input__wrapper.is-focus),
.log-field :deep(.el-select__wrapper.is-focused),
.log-field :deep(.el-date-editor.is-active) {
  box-shadow: 0 0 0 1px #3b82f6 inset !important;
}

.log-search-btn {
  height: 32px;
  padding: 0 20px;
  border: 0;
  border-radius: 8px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #fff;
  font-size: var(--fs-small);
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
  transition: box-shadow 0.2s ease, transform 0.15s ease;
}

.log-search-btn:hover {
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.35);
  transform: translateY(-1px);
}

.log-search-btn:active {
  transform: translateY(0);
}

/* ========== 表格 ========== */
.log-table-panel {
  min-height: 0;
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 20px 14px;
  overflow: hidden;
}

.log-table-scroll {
  min-height: 0;
  min-width: 0;
  flex: 1;
  overflow: auto;
  padding: 0;
}

/* 表格滚动条：黑色半透明 */
.log-table-scroll::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.log-table-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.log-table-scroll::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 3px;
}
.log-table-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.25);
}

.log-table-inner {
  min-width: 800px;
}

/* 表头与行统一 grid 列宽 */
.log-table-head,
.log-row {
  display: grid;
  grid-template-columns: 1.3fr 0.65fr 0.75fr 2fr 0.85fr;
  gap: 16px;
  align-items: stretch;
  padding: 0 16px;
}

.log-table-head {
  min-height: 42px;
  border-radius: 10px;
  margin: 12px 0 2px;
  background: #f8fafc;
  color: #475569;
  font-size: var(--fs-page);
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 1;
}

.log-table-head > span {
  display: flex;
  align-items: center;
  background: #f8fafc;
}

.log-table-body {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 12px;
}

.log-row {
  min-height: 48px;
  background: #fff;
  color: #334155;
  font-size: var(--fs-body);
  line-height: 1.45;
  transition: background 0.15s ease;
}

.log-row:hover {
  background: #f8fafc;
}

.log-row:hover .log-cell {
  background: #f8fafc;
}

.log-row:last-child .log-cell {
  border-bottom: 0;
}

.log-cell {
  min-width: 0;
  display: flex;
  align-items: center;
  line-height: 1.45;
  word-break: break-word;
  background: #fff;
  border-bottom: 1px solid #f1f5f9;
}

.log-cell--detail {
  color: #1e293b;
  font-weight: 500;
}

/* ========== 操作类型标签 ========== */
.log-action-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 6px;
  font-size: var(--fs-small);
  font-weight: 500;
  line-height: 1.6;
  white-space: nowrap;
}

.log-action-tag--shift {
  background: #eff6ff;
  color: #2563eb;
}
.log-action-tag--refund {
  background: #fef2f2;
  color: #dc2626;
}
.log-action-tag--consume {
  background: #f0fdf4;
  color: #16a34a;
}
.log-action-tag--recharge {
  background: #fefce8;
  color: #ca8a04;
}
.log-action-tag--login {
  background: #f5f3ff;
  color: #7c3aed;
}
.log-action-tag--logout {
  background: #f1f5f9;
  color: #64748b;
}
.log-action-tag--edit {
  background: #fff7ed;
  color: #ea580c;
}

/* ========== 空状态 ========== */
.log-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 60px 20px;
  color: #94a3b8;
}

.log-empty-title {
  font-size: 15px;
  font-weight: 600;
  color: #64748b;
}

.log-empty-hint {
  font-size: 13px;
}

/* ========== 分页 ========== */
.log-pagination {
  display: flex;
  justify-content: center;
  padding: 10px 0 4px;
}
</style>
