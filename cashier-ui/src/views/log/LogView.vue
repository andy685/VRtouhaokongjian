<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>操作日志</span>
          <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
        </div>
      </template>
      
      <el-table :data="logs" style="width: 100%">
        <el-table-column prop="time" label="时间" width="180" />
        <el-table-column prop="user" label="操作人" width="100" />
        <el-table-column prop="action" label="操作类型" width="120" />
        <el-table-column prop="detail" label="操作详情" />
        <el-table-column prop="ip" label="IP地址" width="140" />
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

const dateRange = ref([])
const currentPage = ref(1)

const logs = ref([
  { time: '2024-01-15 18:00:25', user: '张三', action: '交班', detail: '交班给李四，现金1680元', ip: '192.168.1.100' },
  { time: '2024-01-15 17:30:10', user: '张三', action: '退款', detail: '订单ORDER20240115005退款68元', ip: '192.168.1.100' },
  { time: '2024-01-15 16:45:30', user: '张三', action: '消费', detail: '会员李明消费VR体验68元', ip: '192.168.1.100' },
  { time: '2024-01-15 15:20:00', user: '李四', action: '充值', detail: '会员王芳充值500元，赠送50元', ip: '192.168.1.101' },
])
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
