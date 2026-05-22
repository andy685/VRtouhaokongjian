<template>
  <div class="setting-form">
    <el-form :model="form" label-width="120px">
      <el-form-item label="启用员工卡">
        <el-switch v-model="form.enabled" />
      </el-form-item>
      <el-form-item label="员工卡号">
        <el-input v-model="form.cardPrefix" style="width: 100px" /> +
        <el-input-number v-model="form.cardNumber" :min="1" :max="9999" style="width: 120px" />
      </el-form-item>
      <el-form-item label="折扣比例">
        <el-input-number v-model="form.discount" :min="0" :max="100" :step="5" /> %
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSave">保存设置</el-button>
        <el-button @click="addCard">添加员工卡</el-button>
      </el-form-item>
    </el-form>
    
    <h4>员工卡列表</h4>
    <el-table :data="cards" style="width: 100%; margin-top: 20px">
      <el-table-column prop="cardNo" label="卡号" />
      <el-table-column prop="name" label="员工姓名" />
      <el-table-column prop="discount" label="折扣">
        <template #default="{ row }">
          {{ row.discount }}%
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'info'">
            {{ row.status === 'active' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

const form = reactive({
  enabled: true,
  cardPrefix: 'STAFF',
  cardNumber: 1,
  discount: 80
})

const cards = ref([
  { cardNo: 'STAFF001', name: '张三', discount: 80, status: 'active' },
  { cardNo: 'STAFF002', name: '李四', discount: 85, status: 'active' },
])

const handleSave = () => {}
const addCard = () => {}
</script>

<style scoped>
h4 {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}
</style>
