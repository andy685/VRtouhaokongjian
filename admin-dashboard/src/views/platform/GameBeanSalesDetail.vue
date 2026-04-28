<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">游戏豆销售明细</h1>
      <div class="page-actions">
        <n-button secondary size="small">导出报表</n-button>
      </div>
    </div>
    <div class="table-card">
      <n-data-table :columns="columns" :data="data" :bordered="false" :single-line="false" size="small" striped />
    </div>
  </div>
</template>

<script setup lang="ts">
import { NDataTable, NButton } from 'naive-ui'

const columns = [
  { title: '订单号', key: 'orderNo', minWidth: 160 },
  { title: '商家', key: 'merchant', minWidth: 140 },
  { title: '店铺', key: 'store', minWidth: 140 },
  { title: '购买数量', key: 'amount', width: 100 },
  { title: '金额', key: 'money', width: 100 },
  { title: '支付方式', key: 'payMethod', width: 100 },
  { title: '时间', key: 'time', minWidth: 160 },
]

const data = [
  { orderNo: 'GB202309160001', merchant: '恒然集团', store: '恒然分部展厅', amount: 5000, money: 5000, payMethod: '对公转账', time: '2023-09-16 15:30:22' },
  { orderNo: 'GB202309150002', merchant: '幻影星空', store: '幻影星空馆 NO.8088', amount: 3000, money: 3000, payMethod: '微信支付', time: '2023-09-15 10:20:15' },
  { orderNo: 'GB202309160003', merchant: '利民街商家', store: '利民街大展厅', amount: 8000, money: 8000, payMethod: '支付宝', time: '2023-09-16 12:10:05' },
  { orderNo: 'GB202309140004', merchant: '党建馆集团', store: '党建馆', amount: 2000, money: 2000, payMethod: '对公转账', time: '2023-09-14 09:30:00' },
  { orderNo: 'GB202309160005', merchant: '华东展厅', store: '华东展厅', amount: 6000, money: 6000, payMethod: '微信支付', time: '2023-09-16 14:20:30' },
]
</script>

<style scoped>
.page-container { padding: 20px 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-title { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.page-actions { display: flex; gap: 12px; }
.table-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid var(--border-color); }
</style>
