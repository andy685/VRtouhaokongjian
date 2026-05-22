<template>
  <div class="setting-form">
    <el-form :model="form" label-width="120px">
      <el-form-item label="会员积分">
        <el-switch v-model="form.enablePoints" />
      </el-form-item>
      <el-form-item label="积分规则" v-if="form.enablePoints">
        <el-input-number v-model="form.pointsPerYuan" :min="0" /> 元 = 1 积分
      </el-form-item>
      <el-form-item label="会员等级">
        <el-switch v-model="form.enableLevel" />
      </el-form-item>
      <el-form-item label="生日优惠">
        <el-switch v-model="form.birthdayGift" />
      </el-form-item>
      <el-form-item label="首次充值优惠">
        <el-switch v-model="form.firstRecharge" />
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
  enablePoints: true,
  pointsPerYuan: 1,
  enableLevel: true,
  birthdayGift: true,
  firstRecharge: true
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
