<template>
  <transition name="modal-fade">
    <div
      v-if="visible"
      class="emm-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="编辑会员资料"
      @click.self="$emit('close')"
    >
      <section class="emm-dialog">
        <!-- 头部 -->
        <header class="emm-header">
          <h2>编辑资料</h2>
          <div class="emm-header-actions">
            <button type="button" class="emm-close" aria-label="关闭" @click="$emit('close')">
              <el-icon><Close /></el-icon>
            </button>
          </div>
        </header>

        <!-- 表单主体 -->
        <div class="emm-body">
          <!-- 第1行：用户名 + 手机 -->
          <div class="emm-row">
            <label class="emm-field">
              <span class="emm-label">用户名：</span>
              <div class="emm-readonly-value">{{ form.name }}</div>
            </label>
            <label class="emm-field">
              <span class="emm-label">手机：</span>
              <div class="emm-readonly-value">{{ form.phone }}</div>
            </label>
          </div>

          <!-- 第2行：性别 + 生日 -->
          <div class="emm-row">
            <label class="emm-field">
              <span class="emm-label">性别：</span>
              <div class="emm-readonly-value">{{ form.gender }}</div>
            </label>
            <label class="emm-field">
              <span class="emm-label">生日：</span>
              <div class="emm-readonly-value">{{ form.birthday || '-' }}</div>
            </label>
          </div>

          <!-- 第3行：会员卡号 + 消费折扣 -->
          <div class="emm-row">
            <label class="emm-field">
              <span class="emm-label">会员卡号：</span>
              <div class="emm-readonly-value">{{ form.cardNo || '-' }}</div>
            </label>
            <label class="emm-field">
              <span class="emm-label">消费折扣：</span>
              <div class="emm-readonly-value">{{ form.registerPercent }}%</div>
            </label>
          </div>

          <!-- 第4行：兑换折扣 + 会员等级 -->
          <div class="emm-row">
            <label class="emm-field">
              <span class="emm-label">兑换折扣：</span>
              <div class="emm-readonly-value">{{ form.birthdayPercent }}%</div>
            </label>
            <label class="emm-field">
              <span class="emm-label">会员等级：</span>
              <div class="emm-select-wrap">
                <select v-model="form.levelKey" class="emm-select">
                  <option v-for="lv in levels" :key="lv.key" :value="lv.key">{{ lv.label }}</option>
                </select>
                <svg class="emm-select-arrow" viewBox="0 0 24 24" fill="none"><path d="M7 10l5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
            </label>
          </div>

          <!-- 第5行：会员状态 + 注册门店 -->
          <div class="emm-row">
            <label class="emm-field">
              <span class="emm-label">会员状态：</span>
              <div class="emm-select-wrap">
                <select v-model="form.status" class="emm-select">
                  <option v-for="st in statusOptions" :key="st.key" :value="st.key">{{ st.label }}</option>
                </select>
                <svg class="emm-select-arrow" viewBox="0 0 24 24" fill="none"><path d="M7 10l5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
            </label>
            <label class="emm-field">
              <span class="emm-label">注册门店：</span>
              <div class="emm-readonly-value">{{ form.storeName }}</div>
            </label>
          </div>

          <!-- 第6行：注册时间 -->
          <div class="emm-row">
            <label class="emm-field">
              <span class="emm-label">注册时间：</span>
              <div class="emm-readonly-value">{{ form.registerStore || '-' }}</div>
            </label>
          </div>

          <!-- 第7行：备注（独占一行） -->
          <div class="emm-row">
            <label class="emm-field emm-field-full">
              <span class="emm-label">备注：</span>
              <div class="emm-textarea-wrap">
                <textarea v-model.trim="form.remark" rows="2" placeholder="非必填"></textarea>
              </div>
            </label>
          </div>
        </div>

        <!-- 底部按钮 -->
        <footer class="emm-footer">
          <button type="button" class="emm-cancel-btn" @click="$emit('close')">取消</button>
          <button type="button" class="emm-submit-btn" :disabled="!canSubmit" @click="handleSave">
            确认保存
          </button>
        </footer>
      </section>
    </div>
  </transition>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'
import { Close } from '@element-plus/icons-vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  member: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['close', 'save'])

const levels = [
  { key: 'normal',  label: '普通会员', registerPercent: 100, birthdayPercent: 100 },
  { key: 'silver',  label: '银卡会员', registerPercent: 95,  birthdayPercent: 98  },
  { key: 'gold',    label: '金卡会员', registerPercent: 88,  birthdayPercent: 92  },
  { key: 'diamond', label: '钻石会员', registerPercent: 80,  birthdayPercent: 85  }
]

const levelDiscountMap = Object.fromEntries(
  levels.map(l => [l.key, { registerPercent: l.registerPercent, birthdayPercent: l.birthdayPercent }])
)

const statusOptions = [
  { key: 'active', label: '正常' },
  { key: 'disabled', label: '停用' },
  { key: 'frozen', label: '冻结' }
]

const form = reactive({
  name: '',
  phone: '',
  gender: '男',
  birthday: '',
  cardNo: '',
  registerPercent: 80,
  birthdayPercent: 85,
  levelKey: 'diamond',
  status: 'active',
  storeName: '',
  registerStore: '',
  remark: ''
})

// 等级变化时，折扣自动跟随
watch(() => form.levelKey, (key) => {
  const dm = levelDiscountMap[key]
  if (dm) {
    form.registerPercent = dm.registerPercent
    form.birthdayPercent = dm.birthdayPercent
  }
})

// 打开时从 props 预填数据
watch(() => props.visible, (val) => {
  if (val && props.member) {
    form.name = props.member.name || ''
    form.phone = props.member.phone || ''
    form.gender = props.member.gender || '男'
    form.birthday = props.member.birthday || ''
    form.cardNo = props.member.cardNo || ''
    form.levelKey = props.member.levelKey || 'diamond'
    form.status = props.member.status || 'active'
    form.storeName = props.member.storeName || ''
    form.registerStore = props.member.registerStore || ''
    form.remark = props.member.remark || ''
  }
})

const canSubmit = computed(() => true)

const handleSave = () => {
  if (!canSubmit.value) return
  emit('save', { ...form })
}
</script>

<style scoped>
/* ===== 遮罩层 ===== */
.emm-overlay {
  position: fixed;
  inset: 0;
  z-index: 45;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
  background: var(--pos-overlay-backdrop);
}

/* ===== 弹窗主体 ===== */
.emm-dialog {
  width: min(100%, 780px);
  max-height: calc(100vh - 56px);
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(180deg, #dff0ff 0%, #f7f9ff 100%);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.24);
  height: auto;
}

/* ---- 头部 ---- */
.emm-header {
  flex-shrink: 0;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px 0 22px;
  background: #edf3fa;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
}

.emm-header h2 {
  margin: 0;
  color: #1d2433;
  font-size: 16px;
  font-weight: 700;
}

.emm-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.emm-close {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  color: #4f5d73;
  cursor: pointer;
  transition: all 0.15s ease;
}

.emm-close:hover {
  background: rgba(255, 255, 255, 0.55);
  color: #2f7eff;
}

.emm-close .el-icon {
  font-size: 20px;
}

/* ---- 表单主体 ---- */
.emm-body {
  overflow-y: auto;
  padding: 24px 28px 16px;
}

/* 行布局（2列） */
.emm-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 18px;
}

/* 字段 — 标签与输入框在同一行 */
.emm-field {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.emm-field-full {
  grid-column: 1 / -1;
}

.emm-label {
  flex-shrink: 0;
  width: 72px;
  font-size: 13px;
  font-weight: 700;
  color: #334155;
  white-space: nowrap;
  text-align: right;
}

.emm-label em {
  font-style: normal;
  color: #ef4444;
  margin-right: 2px;
}

/* 输入框容器 */
.emm-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 13px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #d5eaf9;
  box-shadow: 0 2px 6px rgba(21, 88, 150, 0.05);
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.emm-input-wrap:focus-within {
  border-color: #1191ff;
  box-shadow: 0 0 0 3px rgba(17, 145, 255, 0.12);
}

.emm-input-wrap input {
  flex: 1;
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #171b24;
  font-size: 13px;
  /* hide number spin */
  -moz-appearance: textfield;
}

.emm-input-wrap input::-webkit-outer-spin-button,
.emm-input-wrap input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.emm-input-wrap input::placeholder {
  color: #a2a3a6;
}

.emm-input-percent {
  position: relative;
}

.emm-percent-suffix {
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 700;
  color: #6e737a;
  margin-left: 4px;
}

/* 下拉选择 */
.emm-select-wrap {
  flex: 1;
  position: relative;
}

.emm-select {
  width: 100%;
  height: 40px;
  padding: 0 36px 0 13px;
  border: 1px solid #d5eaf9;
  border-radius: 8px;
  background: #fff;
  font-size: 13px;
  color: #171b24;
  outline: none;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  box-shadow: 0 2px 6px rgba(21, 88, 150, 0.05);
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.emm-select:focus {
  border-color: #1191ff;
  box-shadow: 0 0 0 3px rgba(17, 145, 255, 0.12);
}

.emm-select-arrow {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #3791ff;
  pointer-events: none;
}

/* el-date-picker 适配 */
.emm-date-picker {
  flex: 1;
}

.emm-date-picker :deep(.el-input__wrapper) {
  height: 40px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #d5eaf9;
  box-shadow: 0 2px 6px rgba(21, 88, 150, 0.05);
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.emm-date-picker :deep(.el-input__wrapper:hover) {
  border-color: #91cdfa;
}

.emm-date-picker :deep(.el-input__wrapper.is-focus) {
  border-color: #1191ff;
  box-shadow: 0 0 0 3px rgba(17, 145, 255, 0.12);
}

.emm-date-picker :deep(.el-input__inner) {
  font-size: 13px;
  color: #171b24;
}

.emm-date-picker :deep(.el-input__inner::placeholder) {
  color: #a2a3a6;
}

.emm-date-picker :deep(.el-input__prefix),
.emm-date-picker :deep(.el-input__suffix) {
  color: #3791ff;
}

/* 文本域 */
.emm-textarea-wrap {
  flex: 1;
}

.emm-textarea-wrap textarea {
  width: 100%;
  padding: 9px 13px;
  border: 1px solid #d5eaf9;
  border-radius: 8px;
  background: #fff;
  font-size: 13px;
  color: #171b24;
  outline: none;
  resize: vertical;
  min-height: 52px;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
  font-family: inherit;
  box-sizing: border-box;
}

.emm-textarea-wrap textarea:focus {
  border-color: #1191ff;
  box-shadow: 0 0 0 3px rgba(17, 145, 255, 0.12);
}

.emm-textarea-wrap textarea::placeholder {
  color: #a2a3a6;
}

/* 只读字段展示 */
.emm-readonly-value {
  flex: 1;
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 13px;
  border-radius: 8px;
  background: #f3f6fc;
  border: 1px solid #e5ecf5;
  color: #6e737a;
  font-size: 13px;
}

/* 性别按钮组 */
.emm-gender-btns {
  display: inline-flex;
  gap: 8px;
}

.emm-gender-btns button {
  height: 32px;
  padding: 0 22px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #4f6380;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
}

.emm-gender-btns button:hover {
  color: #2f7eff;
  background: rgba(255, 255, 255, 0.55);
}

.emm-gender-btns button.active {
  color: #fff;
  background: linear-gradient(90deg, #3791ff 0%, #2c6eff 100%);
  box-shadow: 0 6px 14px rgba(47, 126, 255, 0.2);
}

/* ===== 底部按钮栏 ===== */
.emm-footer {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 16px 24px 20px;
}

.emm-cancel-btn {
  width: 120px;
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

.emm-cancel-btn:hover {
  background: #f0f7ff;
  border-color: #91cdfa;
  color: #3791ff;
}

.emm-submit-btn {
  width: 180px;
  height: 42px;
  border: 0;
  border-radius: 8px;
  background: linear-gradient(90deg, #3791ff 0%, #2c6eff 100%);
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(47, 126, 255, 0.25);
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.emm-submit-btn:hover:not(:disabled) {
  opacity: 0.92;
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(47, 126, 255, 0.35);
}

.emm-submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.emm-submit-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
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
