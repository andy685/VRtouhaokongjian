<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>常见问题 FAQ</h1>
        <p class="header-desc">用户高频问题整理与管理</p>
      </div>
      <n-space>
        <n-button type="primary" @click="showAddModal = true">
          <template #icon><n-icon :component="CreateOutline" /></template> 新增 FAQ
        </n-button>
      </n-space>
    </div>

    <!-- 分类Tab -->
    <div class="content-card">
      <n-tabs type="line" animated v-model:value="activeCategory">
        <n-tab-pane name="all" tab="全部" />
        <n-tab-pane name="account" tab="账号相关" />
        <n-tab-pane name="payment" tab="支付结算" />
        <n-tab-pane name="device" tag="设备问题" />
        <n-tab-pane name="order" tab="订单问题" />
        <n-tab-pane name="other" tab="其他" />
      </n-tabs>

      <!-- FAQ列表 -->
      <div class="faq-list">
        <div v-for="item in filteredFaqs" :key="item.id" class="faq-item" :class="{ disabled: !item.enabled }">
          <div class="faq-header" @click="toggleExpand(item.id)">
            <div class="faq-title-row">
              <span class="faq-q">Q</span>
              <span class="faq-question">{{ item.question }}</span>
              <n-tag v-if="item.hot" type="error" size="tiny" bordered>热门</n-tag>
              <n-tag :type="getCategoryType(item.category)" size="tiny" bordered>{{ getCategoryLabel(item.category) }}</n-tag>
            </div>
            <div class="faq-actions">
              <n-switch size="small" :value="item.enabled" @click.stop @update-value="val => item.enabled = val" />
              <n-button text="" size="small" @click.stop="editFaq(item)">
                <template #icon><n-icon :component="PencilOutline" /></template>
              </n-button>
              <n-icon :component="expandedIds.includes(item.id) ? ChevronUpOutline : ChevronDownOutline" size="18" class="expand-icon" />
            </div>
          </div>
          <transition name="slide">
            <div v-show="expandedIds.includes(item.id)" class="faq-body">
              <div class="faq-a-label"><span>A</span></div>
              <div class="faq-answer">{{ item.answer }}</div>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <n-modal v-model:show="showAddModal" preset="card" :title="editingId ? '编辑FAQ' : '新增FAQ'" style="width: 640px;" :bordered="false">
      <n-form label-placement="top" style="margin-top: 16px;">
        <n-form-item label="问题">
          <n-input v-model:value="form.question" placeholder="请输入用户常见问题" />
        </n-form-item>
        <n-form-item label="回答">
          <n-input v-model:value="form.answer" type="textarea" :rows="6" placeholder="请输入答案内容" />
        </n-form-item>
        <n-form-item label="分类">
          <n-select v-model:value="form.category" :options="categoryOptions" placeholder="选择分类" />
        </n-form-item>
        <n-form-item label="标签">
          <n-checkbox v-model:checked="form.hot">设为热门问题</n-checkbox>
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showAddModal = false">取消</n-button>
          <n-button type="primary" @click="handleSave">保存</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { NTag, NSwitch, NButton, NIcon, NCheckbox, useMessage } from 'naive-ui'
import { CreateOutline, PencilOutline, ChevronUpOutline, ChevronDownOutline } from '@vicons/ionicons5'

const message = useMessage()
const activeCategory = ref('all')
const expandedIds = ref<number[]>([])
const showAddModal = ref(false)
const editingId = ref<number | null>(null)

const form = ref({
  question: '',
  answer: '',
  category: 'account',
  hot: false,
})

const categoryOptions = [
  { label: '账号相关', value: 'account' },
  { label: '支付结算', value: 'payment' },
  { label: '设备问题', value: 'device' },
  { label: '订单问题', value: 'order' },
  { label: '其他', value: 'other' },
]

function getCategoryLabel(cat: string): string {
  return categoryOptions.find(o => o.value === cat)?.label || cat
}
function getCategoryType(cat: string): 'success' | 'warning' | 'info' | 'error' | undefined {
  const map: Record<string, any> = { account: 'info', payment: 'warning', device: 'error', order: 'success' }
  return map[cat]
}

interface FaqItem {
  id: number
  question: string
  answer: string
  category: string
  hot: boolean
  enabled: boolean
}

const faqList = ref<FaqItem[]>([
  { id: 1, question: '如何注册成为商家？', answer: '访问平台首页，点击「商家入驻」按钮，填写企业信息、营业执照、联系人等资料，提交审核通过后即可开通商家后台。', category: 'account', hot: true, enabled: true },
  { id: 2, question: '支付渠道如何配置？', answer: '进入系统设置→收银设置→支付配置，填写微信/支付宝商户号、密钥等信息，完成绑定后即可支持对应渠道收款。', category: 'payment', hot: true, enabled: true },
  { id: 3, question: '设备离线怎么办？', answer: '首先检查设备网络连接，确认路由器正常工作；其次检查设备电源是否稳定。若持续离线，可在设备管理页面发起远程诊断或联系技术支持。', category: 'device', hot: false, enabled: true },
  { id: 4, question: '对账异常如何处理？', answer: '在对账中心的异常订单列表中找到对应记录，点击「处理」，根据实际情况选择「已解决」「退款」或「忽略」，填写备注后提交即可。', category: 'payment', hot: true, enabled: true },
  { id: 5, question: '结算周期是多久？', answer: '默认为T+7结算周期，即订单完成后第7个工作日打款到商家账户。具体周期可在财务管理→结算配置中进行调整。', category: 'payment', hot: false, enabled: true },
  { id: 6, question: '会员充值未到账怎么处理？', answer: '先在会员储值变更记录中查询该笔充值是否显示，如已有记录但余额未更新，可联系客服核实；如无记录则需检查支付流水是否成功扣款。', category: 'order', hot: false, enabled: true },
  { id: 7, question: '如何修改店铺营业时间？', answer: '进入系统设置→店铺列表→编辑店铺，修改「营业时间」字段保存即可。修改后会在收银端和用户端同步生效。', category: 'other', hot: false, enabled: false },
])

const filteredFaqs = computed(() => {
  if (activeCategory.value === 'all') return faqList.value
  return faqList.value.filter(f => f.category === activeCategory.value)
})

function toggleExpand(id: number) {
  const idx = expandedIds.value.indexOf(id)
  if (idx >= 0) expandedIds.value.splice(idx, 1)
  else expandedIds.value.push(id)
}
function editFaq(item: FaqItem) {
  editingId.value = item.id
  form.value = { ...item }
  showAddModal.value = true
}
function handleSave() {
  showAddModal.value = false
  message.success(editingId.value ? '修改成功' : '添加成功')
  editingId.value = null
}
</script>

<style scoped>
.page-container { padding: 24px; background: var(--color-bg-base); min-height: calc(100vh - 64px); }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0 0 4px 0; }
.header-desc { font-size: 14px; color: var(--text-muted); margin: 0; }

.content-card { background: white; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); padding: 20px; }
.faq-list { margin-top: 8px; }
.faq-item { border: 1px solid var(--border-color); border-radius: 10px; margin-bottom: 10px; overflow: hidden; transition: all 0.25s; }
.faq-item:hover { border-color: rgba(59,130,246,0.35); box-shadow: 0 2px 12px rgba(59,130,246,0.08); }
.faq-item.disabled { opacity: 0.55; }
.faq-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; cursor: pointer; user-select: none; }
.faq-title-row { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
.faq-q { width: 26px; height: 26px; border-radius: 50%; background: linear-gradient(135deg, #3B82F6, #2563EB); color: white; font-size: 13px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
.faq-question { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.faq-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.expand-icon { color: var(--text-muted); transition: transform 0.25s; }
.faq-body { display: flex; gap: 12px; padding: 0 18px 16px 36px; }
.faq-a-label span { width: 22px; height: 22px; border-radius: 50%; background: linear-gradient(135deg, #10B981, #059669); color: white; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
.faq-answer { font-size: 13px; line-height: 1.75; color: var(--text-secondary); }

.slide-enter-active, .slide-leave-active { transition: all 0.3s ease; overflow: hidden; }
.slide-enter-from, .slide-leave-to { max-height: 0; opacity: 0; padding-top: 0; padding-bottom: 0; }
</style>
