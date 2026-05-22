<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <span>活动赠送订单</span>
      </template>
      <el-table :data="orders" style="width: 100%">
        <el-table-column prop="orderNo" label="订单号" />
        <el-table-column prop="memberName" label="会员" />
        <el-table-column prop="activity" label="活动名称" />
        <el-table-column prop="gift" label="赠送内容" />
        <el-table-column prop="clerk" label="操作员" />
        <el-table-column prop="createTime" label="时间" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const orders = ref([
  { orderNo: 'GIFT20240115001', memberName: '李明', activity: '生日赠礼', gift: '游戏币x10', clerk: '张三', createTime: '2024-01-15 14:30:25' },
])
</script>
