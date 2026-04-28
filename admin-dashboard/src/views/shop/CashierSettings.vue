<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>支付设置</h1>
    </div>

    <div class="payment-layout">
      <!-- 左侧店铺选择 -->
      <div class="shop-sidebar">
        <div class="sidebar-title">店铺选择</div>
        <div class="shop-list">
          <div
            v-for="shop in shopList"
            :key="shop"
            class="shop-item"
            :class="{ active: currentShop === shop }"
            @click="currentShop = shop"
          >
            {{ shop }}
          </div>
        </div>
      </div>

      <!-- 右侧支付方式 -->
      <div class="payment-content">
        <div class="content-title">支付方式</div>
        <div class="payment-list">
          <div
            v-for="(item, index) in currentPayments"
            :key="item.id"
            class="payment-card"
            :class="{ enabled: item.enabled }"
          >
            <div class="payment-icon">
              <n-icon :component="getPaymentIcon(item.type)" size="28" />
            </div>
            <div class="payment-info">
              <div class="payment-name">{{ item.name }}</div>
              <div class="payment-desc">{{ item.desc }}</div>
            </div>
            <div class="payment-actions">
              <div class="sort-btns">
                <n-button text size="tiny" :disabled="index === 0" @click="moveUp(index)">
                  <n-icon :component="ChevronUpOutline" size="16" />
                </n-button>
                <n-button text size="tiny" :disabled="index === currentPayments.length - 1" @click="moveDown(index)">
                  <n-icon :component="ChevronDownOutline" size="16" />
                </n-button>
              </div>
              <div class="check-mark" :class="{ checked: item.enabled }" @click="toggleEnable(item)">
                <n-icon v-if="item.enabled" :component="CheckmarkOutline" size="16" color="#fff" />
              </div>
            </div>
          </div>
        </div>

        <div class="save-bar">
          <n-button type="primary" @click="saveSettings">保存</n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  NButton, NIcon
} from 'naive-ui'
import {
  ScanOutline, CashOutline, LogoAlipay, LogoWechat,
  CardOutline, ChevronUpOutline, ChevronDownOutline, CheckmarkOutline,
  GiftOutline
} from '@vicons/ionicons5'

interface PaymentMethod {
  id: number
  type: string
  name: string
  desc: string
  enabled: boolean
}

const currentShop = ref('利民街小展厅')

const shopList = ['党建馆', '华东展厅', '恒源分部展厅', '利民街小展厅', '卓远亚运城店', '卓远萧山区店', '卓远萝岗区店']

// 系统固定支付方式，所有店铺一致，默认全部启用
const basePayments: PaymentMethod[] = [
  { id: 1, type: 'scan', name: '扫码支付', desc: '扫码支付，支持微信支付宝支付，如未开通且有需要请联系卓远开通。', enabled: true },
  { id: 2, type: 'cash', name: '现金', desc: '平台提供数据，需要线下自主对账。', enabled: true },
  { id: 3, type: 'alipay', name: '线下支付宝', desc: '线下的方式，直接支付到店铺老板支付宝，平台提供数据，需要线下自主对账。', enabled: true },
  { id: 4, type: 'wechat', name: '线下微信', desc: '线下的方式，直接支付到店铺老板微信，平台提供数据，需要线下自主对账。', enabled: true },
  { id: 5, type: 'bank', name: '线下银行卡', desc: '线下的方式，直接支付到店铺老板银行卡，平台提供数据，需要线下自主对账。', enabled: true },
]

// 每个店铺独立保存自己的启用状态和排序（深拷贝）
const paymentsMap = ref<Record<string, PaymentMethod[]>>(
  Object.fromEntries(shopList.map(shop => [shop, JSON.parse(JSON.stringify(basePayments))]))
)

const currentPayments = computed(() => {
  return paymentsMap.value[currentShop.value] || []
})

function getPaymentIcon(type: string) {
  const map: Record<string, any> = {
    scan: ScanOutline,
    cash: CashOutline,
    alipay: LogoAlipay,
    wechat: LogoWechat,
    bank: CardOutline,
  }
  return map[type] || GiftOutline
}

function moveUp(index: number) {
  const list = paymentsMap.value[currentShop.value]
  if (index > 0) {
    const temp = list[index]
    list[index] = list[index - 1]
    list[index - 1] = temp
  }
}

function moveDown(index: number) {
  const list = paymentsMap.value[currentShop.value]
  if (index < list.length - 1) {
    const temp = list[index]
    list[index] = list[index + 1]
    list[index + 1] = temp
  }
}

function toggleEnable(item: PaymentMethod) {
  item.enabled = !item.enabled
}

function saveSettings() {
  window.$message?.success(`${currentShop.value} 的支付设置已保存`)
}
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { margin-bottom: 24px; }
.page-header h1 { font-size: 20px; font-weight: 600; color: #333; margin: 0; }

.payment-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

/* 左侧店铺 */
.shop-sidebar {
  width: 220px;
  flex-shrink: 0;
}
.sidebar-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
}
.shop-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.shop-item {
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  background: #fff;
  border: 1px solid #e8e8e8;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}
.shop-item:hover {
  border-color: #3B82F6;
  color: #3B82F6;
}
.shop-item.active {
  background: #3B82F6;
  color: #fff;
  border-color: #3B82F6;
}

/* 右侧支付方式 */
.payment-content {
  flex: 1;
  min-width: 0;
}
.content-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
}
.payment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.payment-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  background: #fff;
  transition: all 0.2s;
  position: relative;
}
.payment-card.enabled {
  background: #F0F7FF;
  border-color: #BFDBFE;
}
.payment-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  flex-shrink: 0;
}
.payment-card.enabled .payment-icon {
  background: #3B82F6;
  color: #fff;
}
.payment-info {
  flex: 1;
  min-width: 0;
}
.payment-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}
.payment-desc {
  font-size: 13px;
  color: #999;
}
.payment-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}
.sort-btns {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.check-mark {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid #d9d9d9;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.check-mark.checked {
  background: #3B82F6;
  border-color: #3B82F6;
}

.save-bar {
  margin-top: 20px;
  display: flex;
  justify-content: flex-start;
}

</style>
