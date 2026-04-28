<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">订单流水透视</h1>
    </div>
    <div class="table-card">
      <n-data-table :columns="columns" :data="data" :bordered="false" :single-line="false" size="small" striped />
    </div>
  </div>
</template>

<script setup lang="ts">
import { NDataTable } from 'naive-ui'

const columns = [
  { title: '订单号', key: 'orderNo', minWidth: 160 },
  { title: '商家', key: 'merchant', minWidth: 140 },
  { title: '店铺', key: 'store', minWidth: 140 },
  { title: '订单类型', key: 'type', width: 110 },
  { title: '金额', key: 'amount', width: 100 },
  { title: '支付方式', key: 'payMethod', width: 100 },
  { title: '时间', key: 'time', minWidth: 160 },
]

const data = [
  { orderNo: 'CO202309160001', merchant: '恒然集团', store: '恒然分部展厅', type: '收银订单', amount: 128, payMethod: '微信支付', time: '2023-09-16 16:25:10' },
  { orderNo: 'OD202309160002', merchant: '幻影星空', store: '幻影星空馆 NO.8088', type: '点播订单', amount: 45, payMethod: '会员余额', time: '2023-09-16 16:20:33' },
  { orderNo: 'CO202309160003', merchant: '利民街商家', store: '利民街大展厅', type: '收银订单', amount: 256, payMethod: '支付宝', time: '2023-09-16 16:15:22' },
  { orderNo: 'OD202309160004', merchant: '党建馆集团', store: '党建馆', type: '点播订单', amount: 30, payMethod: '游戏豆', time: '2023-09-16 16:10:45' },
  { orderNo: 'CO202309160005', merchant: '华东展厅', store: '华东展厅', type: '收银订单', amount: 88, payMethod: '微信支付', time: '2023-09-16 16:05:18' },
  { orderNo: 'MD202309160006', merchant: '恒然集团', store: '恒然分部展厅', type: '手动扣费', amount: 20, payMethod: '现金', time: '2023-09-16 15:55:30' },
  { orderNo: 'GE202309160007', merchant: '幻影星空', store: '幻影星空馆 NO.8088', type: '游戏币兑换', amount: 50, payMethod: '微信支付', time: '2023-09-16 15:48:12' },
]
</script>

<style scoped>
.page-container { padding: 20px 24px; }
.page-header { margin-bottom: 24px; }
.page-title { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.table-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid var(--border-color); }
</style>
