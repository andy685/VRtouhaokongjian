<template>
  <div class="account-balance-page">
    <n-breadcrumb class="page-breadcrumb">
      <n-breadcrumb-item>主页</n-breadcrumb-item>
      <n-breadcrumb-item>用户设置</n-breadcrumb-item>
      <n-breadcrumb-item>账户余额</n-breadcrumb-item>
    </n-breadcrumb>

    <div class="page-header">
      <h2 class="page-title">账户</h2>
    </div>

    <n-tabs v-model:value="activeTab" type="line" class="account-tabs">
      <n-tab-pane name="operating" tab="运营账户">
        <div class="balance-card">
          <div class="balance-label">可用余额（元）</div>
          <div class="balance-row">
            <div class="balance-amount">¥ {{ operatingBalance }}</div>
            <n-button text type="primary" class="view-bills" @click="viewBills('operating')">
              查看账单
            </n-button>
          </div>
          <div class="balance-actions">
            <n-button type="primary" ghost class="action-btn" @click="handleWithdraw">去提现</n-button>
            <n-button type="primary" class="action-btn" @click="handleRecharge">去充值</n-button>
          </div>
        </div>
      </n-tab-pane>

      <n-tab-pane name="basic" tab="基础账户">
        <div class="balance-card basic-account">
          <div class="basic-balance-layout">
            <div class="basic-balance-left">
              <div class="balance-amount">¥{{ basicBalance }}</div>
              <n-button text type="primary" class="view-bills" @click="viewBills('basic')">
                查看账单
              </n-button>
            </div>
            <div class="basic-balance-right">
              <div class="store-pay-hint">
                各门店通过收银系统扫码支付及点播系统直接扫码支付的金额
              </div>
              <div v-for="store in basicStoreList" :key="store.name" class="store-balance-item">
                <span class="store-name">{{ store.name }}</span>
                <span class="store-amount">：{{ store.amount }}</span>
              </div>
            </div>
          </div>
        </div>
      </n-tab-pane>

      <n-tab-pane name="game-bean" tab="游戏豆账户">
        <div class="balance-card game-bean-card">
          <!-- 商家游戏豆模式 -->
          <div class="game-bean-mode">
            <span class="mode-label">商家游戏豆模式：</span>
            <n-radio-group v-model:value="gameBeanMode" size="small">
              <n-radio value="dedicated">游戏豆专用</n-radio>
              <n-radio value="universal">游戏豆通用</n-radio>
            </n-radio-group>
            <span class="mode-hint">
              说明：游戏豆专用是各门店游戏豆充值仅用于当前门店点播，游戏豆通用是各门店游戏豆充值可用于所有门店点播
            </span>
          </div>

          <!-- 商家游戏豆余额 -->
          <div class="game-bean-total">
            <span class="total-label">商家游戏豆：</span>
            <span class="total-value">{{ merchantGameBean }}</span>
            <n-tag type="warning" size="small" class="total-tip" v-if="gameBeanMode === 'dedicated'">
              注意：商家游戏豆余额不等于各门店游戏豆余额之和
            </n-tag>
            <n-tag type="info" size="small" class="total-tip" v-else>
              注意：全局游戏豆可在所有门店使用
            </n-tag>
          </div>

          <!-- 店铺游戏豆表格 -->
          <div class="game-bean-table-section" v-if="gameBeanMode === 'dedicated'">
            <div class="table-title">店铺游戏豆：</div>
            <n-data-table
              :columns="gameBeanColumns"
              :data="gameBeanStoreList"
              :bordered="false"
              :single-line="true"
              size="small"
              class="game-bean-table"
            />
          </div>

          <!-- 全局游戏豆信息 -->
          <div class="game-bean-universal-info" v-else>
            <div class="universal-info-content">
              <p>全局游戏豆可在所有门店使用，统一管理</p>
              <p>充值后游戏豆会自动添加到全局余额中</p>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="game-bean-actions">
            <n-button type="primary" ghost class="game-bean-btn" @click="handleTransfer" v-if="gameBeanMode === 'dedicated'">游戏豆转移</n-button>
            <n-button type="primary" class="game-bean-btn" @click="handleRecharge">去充值</n-button>
            <n-button type="primary" ghost class="game-bean-btn" @click="viewBills('game-bean')">查看账单</n-button>
          </div>
        </div>
      </n-tab-pane>
    </n-tabs>

    <!-- 游戏豆转移弹窗 -->
    <n-modal
      v-model:show="transferModalVisible"
      title="转移"
      preset="card"
      size="medium"
      style="width: 500px;"
    >
      <n-form>
        <n-form-item label="*转出方">
          <n-select
            v-model:value="transferFrom"
            :options="storeOptions"
            placeholder="选择转出方"
            @update:value="handleFromChange"
          />
        </n-form-item>
        <n-form-item label="*转入方">
          <n-select
            v-model:value="transferTo"
            :options="storeOptions"
            placeholder="选择转入方"
          />
        </n-form-item>
        <n-form-item label="可用游戏豆">
          <n-input
            v-model:value="availableGameBeans"
            disabled
          />
        </n-form-item>
        <n-form-item label="*转移游戏豆">
          <n-input
            v-model:value="transferAmount"
            placeholder="0"
            type="number"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="modal-footer">
          <n-button @click="handleTransferCancel">取消</n-button>
          <n-button type="primary" @click="handleTransferSubmit">确定</n-button>
        </div>
      </template>
    </n-modal>


  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { NBreadcrumb, NBreadcrumbItem, NTabs, NTabPane, NButton, NRadioGroup, NRadio, NTag, NDataTable, NModal, NSelect, NInput, NForm, NFormItem } from 'naive-ui'

const router = useRouter()
const activeTab = ref('operating')

const operatingBalance = ref('0.69')
const basicBalance = ref('0')
const gameBeanBalance = ref('5200')
const gameBeanMode = ref('dedicated')
const merchantGameBean = ref('28')

const basicStoreList = [
  { name: '党建馆', amount: '0.00', cashierPay: '0.00', onDemandPay: '0.00' },
  { name: '华东展厅', amount: '0.00', cashierPay: '0.00', onDemandPay: '0.00' },
  { name: '恒然分部展厅', amount: '0.00', cashierPay: '0.00', onDemandPay: '0.00' },
  { name: '利民街大展厅', amount: '0.00', cashierPay: '0.00', onDemandPay: '0.00' },
  { name: '利民街小展厅', amount: '0.00', cashierPay: '0.00', onDemandPay: '0.00' },
]

const gameBeanColumns = [
  { title: 'id', key: 'id', width: 80 },
  { title: '店铺', key: 'name' },
  { title: '游戏豆', key: 'amount', width: 100 },
]

const gameBeanStoreList = [
  { id: '6288', name: '党建馆', amount: '0' },
  { id: '5764', name: '华东展厅', amount: '0' },
  { id: '5760', name: '恒然分部展厅', amount: '0' },
  { id: '5759', name: '利民街大展厅', amount: '0' },
  { id: '5077', name: '利民街小展厅', amount: '0' },
]

// 游戏豆转移弹窗
const transferModalVisible = ref(false)
const transferFrom = ref('')
const transferTo = ref('')
const availableGameBeans = ref('0')
const transferAmount = ref('0')

const storeOptions = [
  { value: '6288', label: '党建馆' },
  { value: '5764', label: '华东展厅' },
  { value: '5760', label: '恒然分部展厅' },
  { value: '5759', label: '利民街大展厅' },
  { value: '5077', label: '利民街小展厅' },
  { value: '8088', label: '幻影星空馆 NO.8088' },
]



function viewBills(type: string) {
  router.push({
    path: '/shop/account/bills',
    query: { type }
  })
}

function handleWithdraw() {
  console.log('去提现')
}

function handleRecharge() {
  if (activeTab.value === 'game-bean') {
    router.push('/shop/account/game-bean/recharge')
  } else {
    router.push('/shop/account/recharge')
  }
}

function handleTransfer() {
  transferModalVisible.value = true
}

function handleTransferSubmit() {
  console.log('转移游戏豆', {
    from: transferFrom.value,
    to: transferTo.value,
    amount: transferAmount.value
  })
  transferModalVisible.value = false
}

function handleTransferCancel() {
  transferModalVisible.value = false
}

function handleFromChange(value: string) {
  transferFrom.value = value
  // 模拟获取可用游戏豆
  if (value === '8088') {
    availableGameBeans.value = '1028'
  } else {
    availableGameBeans.value = '0'
  }
}
</script>

<style scoped>
.account-balance-page {
  padding: 20px 24px;
}

.page-breadcrumb {
  margin-bottom: 16px;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.account-tabs :deep(.n-tabs-nav) {
  margin-bottom: 16px;
}

.balance-card {
  background: white;
  border-radius: 12px;
  padding: 32px 24px;
  max-width: 600px;
}

.balance-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.balance-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.balance-amount {
  font-size: 32px;
  font-weight: 600;
  color: var(--text-primary);
}

.view-bills {
  font-size: 13px;
}

.balance-actions {
  display: flex;
  gap: 16px;
}

.action-btn {
  min-width: 120px;
}

/* 基础账户 */
.basic-balance-layout {
  display: flex;
  align-items: stretch;
}

.basic-balance-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  min-width: 140px;
  padding-right: 24px;
}

.basic-balance-left .balance-amount {
  margin-bottom: 4px;
  font-size: 36px;
}

.basic-balance-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  padding-left: 24px;
  border-left: 1px solid var(--border-color);
}

.store-pay-hint {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 12px;
  line-height: 1.5;
}

.store-balance-item {
  font-size: 14px;
  color: var(--text-secondary);
}

.store-name {
  color: var(--text-primary);
}

.store-amount {
  color: var(--text-secondary);
}

/* 游戏豆账户 */
.game-bean-card {
  max-width: 680px;
}

.game-bean-mode {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.mode-label {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

.mode-hint {
  font-size: 12px;
  color: var(--text-muted);
  background: #f0f9ff;
  padding: 4px 10px;
  border-radius: 4px;
  line-height: 1.5;
}

.game-bean-total {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.total-label {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

.total-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.total-tip {
  font-size: 12px;
}

.game-bean-table-section {
  margin-bottom: 24px;
}

.table-title {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
  margin-bottom: 8px;
}

.game-bean-table :deep(.n-data-table-th) {
  background: #f8fafc;
  font-weight: 500;
}

.game-bean-actions {
  display: flex;
  gap: 16px;
}

.game-bean-btn {
  min-width: 120px;
}

/* 通用游戏豆信息 */
.game-bean-universal-info {
  margin: 16px 0;
  padding: 16px;
  background: #f0f9ff;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.universal-info-content p {
  margin: 8px 0;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* 游戏豆转移弹窗 */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}


</style>
