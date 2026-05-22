<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <span>手动扣费订单</span>
      </template>
      <el-table :data="orders" style="width: 100%">
        <el-table-column prop="orderNo" label="订单号" />
        <el-table-column prop="memberName" label="会员" />
        <el-table-column prop="item" label="扣费项目" />
        <el-table-column prop="quantity" label="数量" />
        <el-table-column prop="amount" label="金额" />
        <el-table-column prop="clerk" label="操作员" />
        <el-table-column prop="createTime" label="时间" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button size="small" type="danger">撤销</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const orders = ref([
  { orderNo: 'MAN20240115001', memberName: '李明', item: 'VR体验', quantity: 1, amount: 68, clerk: '张三', createTime: '2024-01-15 14:30:25' },
  { orderNo: 'MAN20240115002', memberName: '王芳', item: '游戏币', quantity: 10, amount: 10, clerk: '张三', createTime: '2024-01-15 14:25:10' },
])
</script>
