<template>
  <div class="page-container animate-fade-in cashier-terminal-page">
    <!-- 页头 -->
    <div class="page-header">
      <div class="page-header-left">
        <h1>收银终端</h1>
        <p class="page-desc">管理门店收银电脑的 Token。Token 一次性绑定一台设备，列表可查看是否已使用。</p>
      </div>
      <n-button type="primary" @click="openAdd">
        <template #icon><n-icon :component="AddOutline" /></template>
        新建收银设备
      </n-button>
    </div>

    <!-- 筛选 -->
    <n-card class="filter-card" :bordered="false" size="small">
      <div class="filter-row">
        <div class="filter-item">
          <span class="filter-label">店铺</span>
          <n-select
            v-model:value="selectedShop"
            :options="shopFilterOptions"
            size="small"
            style="width: 200px"
            clearable
            placeholder="全部店铺"
          />
        </div>
        <div class="filter-item">
          <span class="filter-label">使用状态</span>
          <n-select
            v-model:value="filterUsed"
            :options="usedFilterOptions"
            size="small"
            style="width: 140px"
            clearable
            placeholder="全部"
          />
        </div>
        <div class="filter-item">
          <span class="filter-label">启用状态</span>
          <n-select
            v-model:value="filterEnabled"
            :options="enabledFilterOptions"
            size="small"
            style="width: 140px"
            clearable
            placeholder="全部"
          />
        </div>
        <n-button size="small" quaternary @click="resetFilters">重置</n-button>
        <div class="filter-stats">
          共 <b>{{ filteredData.length }}</b> 台
          <span class="dot">·</span>
          未使用 <b class="c-warn">{{ unusedCount }}</b>
          <span class="dot">·</span>
          已使用 <b class="c-ok">{{ usedCount }}</b>
        </div>
      </div>
    </n-card>

    <!-- 规则摘要（紧凑） -->
    <div class="rule-strip">
      <span class="rule-chip"><b>Token</b> 一次性，绑定后其他电脑不可用</span>
      <span class="rule-chip"><b>登录</b> 设备已绑定 + 店员账号密码</span>
      <span class="rule-chip"><b>换机</b> 新建/换发 Token；旧机可继续用至禁用</span>
      <span class="rule-chip"><b>互踢</b> 不做</span>
    </div>

    <!-- 表格 -->
    <n-card class="table-card" :bordered="false">
      <n-data-table
        :columns="columns"
        :data="filteredData"
        :pagination="pagination"
        :bordered="false"
        striped
        size="medium"
        :scroll-x="980"
      />
    </n-card>

    <!-- 新建 -->
    <n-modal
      v-model:show="showAddModal"
      preset="card"
      title="新建收银设备"
      class="device-modal"
      style="width: 560px"
      :bordered="false"
      :segmented="{ content: true, footer: 'soft' }"
    >
      <div class="modal-body">
        <div class="tip-card tip-card--info">
          <div class="tip-title">Token 与设备绑定</div>
          <ol class="tip-list">
            <li>创建后生成唯一 Token，状态为 <b>未使用</b></li>
            <li>在目标收银电脑粘贴 Token 完成绑定 → 变为 <b>已使用</b></li>
            <li>其他电脑再使用同一 Token 将被拒绝</li>
            <li>换机请新建或「换发 Token」；旧机可继续用直到店长禁用</li>
          </ol>
        </div>

        <n-form
          class="device-form"
          label-placement="left"
          label-width="110"
          require-mark-placement="right-hanging"
        >
          <n-form-item label="店铺" required>
            <n-select
              v-model:value="form.shop"
              :options="shopOptions"
              placeholder="请选择店铺"
            />
          </n-form-item>
          <n-form-item label="终端名称" required>
            <n-input v-model:value="form.name" placeholder="如：前台1号收银机" maxlength="30" show-count />
          </n-form-item>
          <n-form-item label="Token">
            <div class="token-field">
              <div class="token-box">
                <code class="token-text">{{ form.token }}</code>
                <div class="token-actions">
                  <n-button size="tiny" quaternary type="primary" @click="copyToken(form.token)">复制</n-button>
                  <n-button size="tiny" quaternary @click="form.token = generateToken()">重新生成</n-button>
                </div>
              </div>
              <p class="field-hint">创建后请复制到目标收银机绑定；绑定前为「未使用」。</p>
            </div>
          </n-form-item>
          <n-form-item label="启用">
            <div class="switch-row">
              <n-switch v-model:value="form.enabled" />
              <span class="field-hint">关闭后该 Token 无法登录收银</span>
            </div>
          </n-form-item>
        </n-form>
      </div>
      <template #footer>
        <div class="modal-footer">
          <n-button @click="showAddModal = false">取消</n-button>
          <n-button type="primary" @click="handleAdd">创建</n-button>
        </div>
      </template>
    </n-modal>

    <!-- 编辑 -->
    <n-modal
      v-model:show="showEditModal"
      preset="card"
      title="编辑收银设备"
      class="device-modal"
      style="width: 560px"
      :bordered="false"
      :segmented="{ content: true, footer: 'soft' }"
    >
      <div class="modal-body">
        <div class="status-bar">
          <div class="status-item">
            <span class="status-label">使用状态</span>
            <n-tag size="small" :type="editForm.used ? 'success' : 'warning'" round>
              {{ editForm.used ? '已使用（已绑定电脑）' : '未使用' }}
            </n-tag>
          </div>
          <div class="status-item">
            <span class="status-label">启用状态</span>
            <n-tag size="small" :type="editForm.enabled ? 'success' : 'error'" round>
              {{ editForm.enabled ? '启用' : '禁用' }}
            </n-tag>
          </div>
        </div>

        <n-form
          class="device-form"
          label-placement="left"
          label-width="110"
          require-mark-placement="right-hanging"
        >
          <n-form-item label="店铺">
            <n-select v-model:value="editForm.shop" :options="shopOptions" />
          </n-form-item>
          <n-form-item label="终端名称" required>
            <n-input v-model:value="editForm.name" maxlength="30" show-count />
          </n-form-item>
          <n-form-item label="Token">
            <div class="token-field">
              <div class="token-box">
                <code class="token-text">{{ editForm.token }}</code>
                <div class="token-actions">
                  <n-button size="tiny" quaternary type="primary" @click="copyToken(editForm.token)">复制</n-button>
                </div>
              </div>
              <p class="field-hint">
                Token 不可手改。换机请使用下方「换发 Token」。
              </p>
            </div>
          </n-form-item>
          <n-form-item label="启用">
            <div class="switch-row">
              <n-switch v-model:value="editForm.enabled" />
              <span class="field-hint">禁用后旧机立即无法登录；不会自动释放给其他电脑</span>
            </div>
          </n-form-item>
        </n-form>

        <div class="tip-card tip-card--warn">
          <div class="tip-title">换机说明</div>
          <p class="tip-text">
            「换发 Token」会生成新 Token 并回到未使用，原 Token 立即失效（含已绑定旧机）。
            若只想停用旧机、不换发，关闭上方「启用」即可。
          </p>
        </div>
      </div>
      <template #footer>
        <div class="modal-footer modal-footer--split">
          <n-button type="warning" secondary @click="handleReissue">换发 Token</n-button>
          <div class="modal-footer-right">
            <n-button @click="showEditModal = false">取消</n-button>
            <n-button type="primary" @click="handleEdit">保存</n-button>
          </div>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h, onMounted } from 'vue'
import {
  NCard, NDataTable, NButton, NIcon, NModal, NForm, NFormItem,
  NInput, NSelect, NSwitch, NTag, NSpace,
  useMessage, useDialog,
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { AddOutline, CreateOutline, CopyOutline } from '@vicons/ionicons5'
import {
  type CashierDeviceRecord,
  createCashierDevice,
  generateToken,
  loadCashierDevices,
  reissueCashierDeviceToken,
  saveCashierDevices,
  updateCashierDevice,
} from '../../constants/cashierDevices'

const message = useMessage()
const dialog = useDialog()

const selectedShop = ref<string | null>(null)
const filterUsed = ref<string | null>(null)
const filterEnabled = ref<string | null>(null)
const showAddModal = ref(false)
const showEditModal = ref(false)
const editingId = ref<number | null>(null)
const terminalData = ref<CashierDeviceRecord[]>([])

const form = ref({ name: '', shop: '', token: '', enabled: true })
const editForm = ref({ name: '', shop: '', token: '', enabled: true, used: false })

const shopOptions = [
  { label: '演示门店', value: '演示门店' },
  { label: '卓远天河路店（测试）', value: '卓远天河路店（测试）' },
  { label: '卓远文桥路店（测试）', value: '卓远文桥路店（测试）' },
  { label: '卓远亚运城店（测试）', value: '卓远亚运城店（测试）' },
]

const shopFilterOptions = [
  { label: '全部店铺', value: '' },
  ...shopOptions,
]

const usedFilterOptions = [
  { label: '未使用', value: 'unused' },
  { label: '已使用', value: 'used' },
]

const enabledFilterOptions = [
  { label: '启用', value: 'on' },
  { label: '禁用', value: 'off' },
]

const filteredData = computed(() => {
  return terminalData.value.filter((d) => {
    if (selectedShop.value && d.shop !== selectedShop.value) return false
    if (filterUsed.value === 'used' && !d.used) return false
    if (filterUsed.value === 'unused' && d.used) return false
    if (filterEnabled.value === 'on' && !d.enabled) return false
    if (filterEnabled.value === 'off' && d.enabled) return false
    return true
  })
})

const usedCount = computed(() => terminalData.value.filter((d) => d.used).length)
const unusedCount = computed(() => terminalData.value.filter((d) => !d.used).length)

const pagination = {
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
}

function refresh() {
  terminalData.value = loadCashierDevices()
}

function resetFilters() {
  selectedShop.value = null
  filterUsed.value = null
  filterEnabled.value = null
}

function copyToken(token: string) {
  navigator.clipboard.writeText(token).then(() => message.success('Token 已复制'))
}

function maskToken(token: string) {
  const t = String(token || '')
  if (t.length <= 14) return t
  return `${t.slice(0, 8)}…${t.slice(-6)}`
}

const columns: DataTableColumns<CashierDeviceRecord> = [
  {
    title: '店铺',
    key: 'shop',
    minWidth: 150,
    ellipsis: { tooltip: true },
  },
  {
    title: '终端名称',
    key: 'name',
    minWidth: 140,
    ellipsis: { tooltip: true },
  },
  {
    title: 'Token',
    key: 'token',
    minWidth: 260,
    render(row) {
      return h('div', { class: 'token-cell' }, [
        h('code', { class: 'token-cell-code', title: row.token }, maskToken(row.token)),
        h(
          NButton,
          {
            size: 'tiny',
            quaternary: true,
            type: 'primary',
            onClick: () => copyToken(row.token),
          },
          {
            default: () => '复制',
            icon: () => h(NIcon, { component: CopyOutline, size: 14 }),
          },
        ),
      ])
    },
  },
  {
    title: '是否已使用',
    key: 'used',
    width: 110,
    align: 'center',
    render(row) {
      return h(
        NTag,
        {
          size: 'small',
          type: row.used ? 'success' : 'warning',
          round: true,
          bordered: false,
        },
        () => (row.used ? '已使用' : '未使用'),
      )
    },
  },
  {
    title: '启用',
    key: 'enabled',
    width: 90,
    align: 'center',
    render(row) {
      return h(
        NTag,
        {
          size: 'small',
          type: row.enabled ? 'success' : 'error',
          round: true,
          bordered: false,
        },
        () => (row.enabled ? '启用' : '禁用'),
      )
    },
  },
  {
    title: '创建时间',
    key: 'createTime',
    width: 170,
  },
  {
    title: '操作',
    key: 'actions',
    width: 88,
    align: 'center',
    fixed: 'right',
    render(row) {
      return h(
        NButton,
        {
          size: 'small',
          text: true,
          type: 'primary',
          onClick: () => openEdit(row),
        },
        {
          default: () => '编辑',
          icon: () => h(NIcon, { component: CreateOutline, size: 14 }),
        },
      )
    },
  },
]

function openAdd() {
  form.value = {
    name: '',
    shop: selectedShop.value || shopOptions[0].value,
    token: generateToken(),
    enabled: true,
  }
  showAddModal.value = true
}

function openEdit(row: CashierDeviceRecord) {
  editingId.value = row.id
  editForm.value = {
    name: row.name,
    shop: row.shop,
    token: row.token,
    enabled: row.enabled,
    used: row.used,
  }
  showEditModal.value = true
}

function handleAdd() {
  if (!form.value.shop) {
    message.warning('请选择店铺')
    return
  }
  if (!form.value.name.trim()) {
    message.warning('请输入终端名称')
    return
  }
  try {
    createCashierDevice({
      shop: form.value.shop,
      name: form.value.name,
      token: form.value.token,
      enabled: form.value.enabled,
    })
    refresh()
    showAddModal.value = false
    message.success('已创建。请将 Token 复制到目标收银机绑定。')
  } catch (e: any) {
    message.error(e?.message || '创建失败')
  }
}

function handleEdit() {
  if (editingId.value == null) return
  if (!editForm.value.name.trim()) {
    message.warning('请输入终端名称')
    return
  }
  updateCashierDevice(editingId.value, {
    name: editForm.value.name.trim(),
    shop: editForm.value.shop,
    enabled: editForm.value.enabled,
  })
  refresh()
  showEditModal.value = false
  message.success(editForm.value.enabled ? '已保存' : '已保存（设备已禁用，旧机无法登录）')
}

function handleReissue() {
  if (editingId.value == null) return
  dialog.warning({
    title: '换发 Token',
    content: '将生成新 Token，状态回到「未使用」，可绑定新电脑。原 Token 立即失效（含已绑定的旧机）。确认？',
    positiveText: '换发',
    negativeText: '取消',
    onPositiveClick: () => {
      const row = reissueCashierDeviceToken(editingId.value!)
      refresh()
      editForm.value.token = row.token
      editForm.value.used = false
      editForm.value.enabled = true
      message.success('已换发新 Token，请复制到新收银机绑定')
    },
  })
}

onMounted(() => {
  const list = loadCashierDevices()
  if (!list.length) saveCashierDevices([])
  refresh()
})
</script>

<style scoped>
.cashier-terminal-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.page-header h1 {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.3;
}

.page-desc {
  margin: 0;
  max-width: 560px;
  color: #64748b;
  font-size: 13px;
  line-height: 1.55;
}

.filter-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 16px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  color: #64748b;
  font-size: 13px;
  white-space: nowrap;
}

.filter-stats {
  margin-left: auto;
  color: #64748b;
  font-size: 13px;
}

.filter-stats b {
  color: #0f172a;
  font-weight: 700;
}

.filter-stats .dot {
  margin: 0 6px;
  color: #cbd5e1;
}

.filter-stats .c-warn {
  color: #d97706;
}

.filter-stats .c-ok {
  color: #059669;
}

.rule-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.rule-chip {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
  font-size: 12px;
  line-height: 1.4;
}

.rule-chip b {
  margin-right: 4px;
  color: #0f172a;
}

.table-card {
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

:deep(.token-cell) {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

:deep(.token-cell-code) {
  display: inline-block;
  max-width: 200px;
  overflow: hidden;
  padding: 2px 8px;
  border-radius: 6px;
  background: #f8fafc;
  color: #334155;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  line-height: 1.6;
  white-space: nowrap;
  text-overflow: ellipsis;
  border: 1px solid #e2e8f0;
}

/* 弹窗 */
.modal-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tip-card {
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid transparent;
}

.tip-card--info {
  background: #f0f7ff;
  border-color: #dbeafe;
}

.tip-card--warn {
  background: #fffbeb;
  border-color: #fde68a;
}

.tip-title {
  margin-bottom: 6px;
  color: #0f172a;
  font-size: 13px;
  font-weight: 700;
}

.tip-list {
  margin: 0;
  padding-left: 18px;
  color: #475569;
  font-size: 12px;
  line-height: 1.7;
}

.tip-text {
  margin: 0;
  color: #475569;
  font-size: 12px;
  line-height: 1.65;
}

.device-form :deep(.n-form-item) {
  margin-bottom: 18px;
}

.device-form :deep(.n-form-item:last-child) {
  margin-bottom: 0;
}

.token-field {
  width: 100%;
}

.token-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.token-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: #0f172a;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  line-height: 1.5;
  word-break: break-all;
}

.token-actions {
  display: flex;
  flex-shrink: 0;
  gap: 2px;
}

.field-hint {
  margin: 6px 0 0;
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.5;
}

.switch-row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 34px;
}

.switch-row .field-hint {
  margin: 0;
}

.status-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
  padding: 12px 14px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #eef2f7;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-label {
  color: #64748b;
  font-size: 12px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.modal-footer--split {
  justify-content: space-between;
  align-items: center;
}

.modal-footer-right {
  display: flex;
  gap: 10px;
}

@media (max-width: 720px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-stats {
    margin-left: 0;
    width: 100%;
  }

  .modal-footer--split {
    flex-direction: column;
    align-items: stretch;
  }

  .modal-footer-right {
    justify-content: flex-end;
  }
}
</style>
