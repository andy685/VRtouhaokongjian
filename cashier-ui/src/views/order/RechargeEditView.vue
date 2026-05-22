<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <span>修改储值订单</span>
      </template>
      
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单号">REC20240115001</el-descriptions-item>
        <el-descriptions-item label="会员">李明</el-descriptions-item>
        <el-descriptions-item label="原充值金额">¥500</el-descriptions-item>
        <el-descriptions-item label="赠送金额">¥50</el-descriptions-item>
        <el-descriptions-item label="实际到账">¥550</el-descriptions-item>
        <el-descriptions-item label="支付方式">微信支付</el-descriptions-item>
        <el-descriptions-item label="收银员">张三</el-descriptions-item>
        <el-descriptions-item label="下单时间">2024-01-15 14:30:25</el-descriptions-item>
      </el-descriptions>
      
      <div class="edit-section">
        <h4>修改充值金额</h4>
        <el-form :model="form" label-width="120px">
          <el-form-item label="新充值金额">
            <el-input-number v-model="form.amount" :min="0" :step="100" />
          </el-form-item>
          <el-form-item label="新赠送金额">
            <el-input-number v-model="form.gift" :min="0" :step="10" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSave">保存修改</el-button>
            <el-button @click="$router.back()">返回</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const form = reactive({
  amount: 500,
  gift: 50
})

const handleSave = () => {
  console.log('保存修改')
}
</script>

<style scoped>
.edit-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.edit-section h4 {
  margin-bottom: 16px;
}
</style>
