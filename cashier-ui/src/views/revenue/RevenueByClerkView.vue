<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <span>营收统计 - 按收银员</span>
      </template>
      
      <el-table :data="clerkData" style="width: 100%" show-summary>
        <el-table-column prop="name" label="收银员" />
        <el-table-column prop="orderCount" label="订单数" />
        <el-table-column prop="recharge" label="储值收入">
          <template #default="{ row }">
            <span class="currency-symbol">¥</span>{{ row.recharge }}
          </template>
        </el-table-column>
        <el-table-column prop="consume" label="消费收入">
          <template #default="{ row }">
            <span class="currency-symbol">¥</span>{{ row.consume }}
          </template>
        </el-table-column>
        <el-table-column prop="total" label="合计">
          <template #default="{ row }">
            <span style="color: #ff6b6b; font-weight: 600"><span class="currency-symbol">¥</span>{{ row.total }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const clerkData = ref([
  { name: '张三', orderCount: 45, recharge: 3200, consume: 1860, total: 5060 },
  { name: '李四', orderCount: 38, recharge: 2100, consume: 1420, total: 3520 },
  { name: '王五', orderCount: 32, recharge: 2800, consume: 1680, total: 4480 },
])
</script>
