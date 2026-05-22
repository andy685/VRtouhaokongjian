<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <span>营收统计 - 按支付方式</span>
      </template>
      
      <el-table :data="paymentData" style="width: 100%" show-summary>
        <el-table-column prop="method" label="支付方式" />
        <el-table-column prop="count" label="笔数" />
        <el-table-column prop="amount" label="金额">
          <template #default="{ row }">
            <span style="color: #ff6b6b; font-weight: 600">¥{{ row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="ratio" label="占比">
          <template #default="{ row }">
            {{ row.ratio }}%
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const paymentData = ref([
  { method: '微信支付', count: 52, amount: 4860, ratio: 38.6 },
  { method: '支付宝', count: 41, amount: 3580, ratio: 28.5 },
  { method: '现金', count: 18, amount: 1680, ratio: 13.4 },
  { method: '会员余额', count: 35, amount: 2460, ratio: 19.5 },
])
</script>
