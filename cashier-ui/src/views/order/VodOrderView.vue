<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <span>点播系统订单</span>
      </template>
      <el-table :data="orders" style="width: 100%">
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="memberName" label="会员" />
        <el-table-column prop="device" label="设备" />
        <el-table-column prop="game" label="游戏" />
        <el-table-column prop="duration" label="时长" />
        <el-table-column prop="amount" label="金额" />
        <el-table-column prop="createTime" label="下单时间" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const orders = ref([
  { orderNo: 'VOD20240115001', memberName: '李明', device: 'VR-01', game: '节奏光剑', duration: '45分钟', amount: 68, createTime: '2024-01-15 14:30:25' },
  { orderNo: 'VOD20240115002', memberName: '王芳', device: 'VR-02', game: '半条命', duration: '60分钟', amount: 88, createTime: '2024-01-15 14:20:10' },
])
</script>
