<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>订单列表</span>
          <div class="header-actions">
            <el-select v-model="status" placeholder="订单状态" style="width: 120px">
              <el-option label="全部" value="" />
              <el-option label="已完成" value="completed" />
              <el-option label="进行中" value="processing" />
              <el-option label="已退款" value="refunded" />
            </el-select>
            <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
            <el-button @click="exportOrders">导出</el-button>
          </div>
        </div>
      </template>
      
      <el-table :data="orders" style="width: 100%">
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="memberName" label="会员" width="100" />
        <el-table-column prop="items" label="消费项目" />
        <el-table-column prop="amount" label="金额" width="100">
          <template #default="{ row }">
            <span style="color: #ff6b6b">¥{{ row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="payment" label="支付方式" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ row.payment }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="clerk" label="收银员" width="100" />
        <el-table-column prop="createTime" label="下单时间" width="160" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="viewDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="20"
          :total="100"
          layout="total, prev, pager, next"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const status = ref('')
const dateRange = ref([])
const currentPage = ref(1)

const orders = ref([
  { orderNo: 'ORDER20240115001', memberName: '李明', items: 'VR体验', amount: 68, payment: '微信', clerk: '张三', createTime: '2024-01-15 14:30:25' },
  { orderNo: 'ORDER20240115002', memberName: '-', items: '游戏币x10', amount: 10, payment: '现金', clerk: '张三', createTime: '2024-01-15 14:25:10' },
  { orderNo: 'ORDER20240115003', memberName: '王芳', items: '月卡', amount: 299, payment: '支付宝', clerk: '李四', createTime: '2024-01-15 14:20:00' },
])

const viewDetail = (order) => {
  console.log('查看订单详情:', order)
}

const exportOrders = () => {
  console.log('导出订单')
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
