<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <span>游戏币兑换订单</span>
      </template>
      <el-table :data="orders" style="width: 100%">
        <el-table-column prop="orderNo" label="订单号" />
        <el-table-column prop="memberName" label="会员" />
        <el-table-column prop="coins" label="兑换游戏币" />
        <el-table-column prop="amount" label="支付金额" />
        <el-table-column prop="payment" label="支付方式" />
        <el-table-column prop="createTime" label="时间" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const orders = ref([
  { orderNo: 'COIN20240115001', memberName: '李明', coins: '游戏币x50', amount: 45, payment: '余额', createTime: '2024-01-15 14:30:25' },
  { orderNo: 'COIN20240115002', memberName: '王芳', coins: '游戏币x100', amount: 85, payment: '微信', createTime: '2024-01-15 14:20:10' },
])
</script>
