<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>新增会员</span>
          <el-button @click="$router.back()">返回</el-button>
        </div>
      </template>
      
      <el-form :model="form" label-width="100px" class="member-form">
        <el-form-item label="会员姓名">
          <el-input v-model="form.name" placeholder="请输入会员姓名" />
        </el-form-item>
        <el-form-item label="手机号码">
          <el-input v-model="form.phone" placeholder="请输入手机号码" />
        </el-form-item>
        <el-form-item label="会员性别">
          <el-radio-group v-model="form.gender">
            <el-radio label="male">男</el-radio>
            <el-radio label="female">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="出生日期">
          <el-date-picker v-model="form.birthday" type="date" placeholder="选择日期" />
        </el-form-item>
        <el-form-item label="初始储值">
          <el-input-number v-model="form.balance" :min="0" :step="100" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" rows="3" placeholder="备注信息" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">确认开通</el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const form = reactive({
  name: '',
  phone: '',
  gender: 'male',
  birthday: '',
  balance: 0,
  remark: ''
})

const handleSubmit = () => {
  ElMessage.success('会员开通成功')
  router.push('/member')
}
</script>

<style scoped>
.page-container {
  max-width: 600px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.member-form {
  max-width: 400px;
}
</style>
