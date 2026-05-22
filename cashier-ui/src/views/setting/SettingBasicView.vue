<template>
  <div class="setting-form">
    <el-form :model="form" label-width="120px">
      <el-form-item label="店铺名称">
        <el-input v-model="form.shopName" />
      </el-form-item>
      <el-form-item label="店铺地址">
        <el-input v-model="form.address" />
      </el-form-item>
      <el-form-item label="联系电话">
        <el-input v-model="form.phone" />
      </el-form-item>
      <el-form-item label="营业时间">
        <el-time-picker v-model="form.openTime" format="HH:mm" /> -
        <el-time-picker v-model="form.closeTime" format="HH:mm" />
      </el-form-item>
      <el-form-item label="打印小票">
        <el-switch v-model="form.printEnabled" />
      </el-form-item>
      <el-form-item label="自动找零">
        <el-switch v-model="form.autoChange" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSave">保存设置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'

const form = reactive({
  shopName: '头号空间VR体验馆',
  address: '北京市朝阳区xxx路xxx号',
  phone: '010-12345678',
  openTime: new Date(2024, 0, 1, 9, 0),
  closeTime: new Date(2024, 0, 1, 22, 0),
  printEnabled: true,
  autoChange: true
})

const handleSave = () => {
  ElMessage.success('设置已保存')
}
</script>

<style scoped>
.setting-form {
  max-width: 600px;
}
</style>
