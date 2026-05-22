<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <span>会员扣费</span>
      </template>
      
      <div class="deduct-form">
        <el-form :model="form" label-width="100px">
          <el-form-item label="会员信息">
            <el-input v-model="memberInfo" placeholder="请选择会员" readonly @click="showMemberSelect = true">
              <template #append>
                <el-button @click="showMemberSelect = true">选择</el-button>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item label="扣费项目">
            <el-select v-model="form.item" placeholder="请选择扣费项目" style="width: 100%">
              <el-option label="VR体验(单次)" value="vr_single" />
              <el-option label="VR体验(双人)" value="vr_double" />
              <el-option label="游戏币" value="coin" />
              <el-option label="套票扣次" value="package" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="扣费数量">
            <el-input-number v-model="form.quantity" :min="1" style="width: 100%" />
          </el-form-item>
          
          <el-form-item label="设备选择">
            <el-select v-model="form.device" placeholder="请选择设备" style="width: 100%">
              <el-option label="VR设备 1号" value="vr1" />
              <el-option label="VR设备 2号" value="vr2" />
              <el-option label="VR设备 3号" value="vr3" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="备注">
            <el-input v-model="form.remark" type="textarea" rows="2" />
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="handleDeduct">确认扣费</el-button>
            <el-button @click="$router.back()">取消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    
    <!-- 选择会员弹窗 -->
    <el-dialog v-model="showMemberSelect" title="选择会员" width="600px">
      <el-input v-model="search" placeholder="输入姓名/手机号搜索" />
      <el-table :data="members" style="width: 100%; margin-top: 16px" @row-click="selectMember">
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="balance" label="余额" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const memberInfo = ref('')
const showMemberSelect = ref(false)
const search = ref('')

const form = reactive({
  item: '',
  quantity: 1,
  device: '',
  remark: ''
})

const members = ref([
  { id: 1, name: '李明', phone: '138****1234', balance: 500 },
  { id: 2, name: '王芳', phone: '139****5678', balance: 1200 },
])

const selectMember = (row) => {
  memberInfo.value = `${row.name} - ${row.phone} - 余额: ¥${row.balance}`
  showMemberSelect.value = false
}

const handleDeduct = () => {
  ElMessage.success('扣费成功')
  router.push('/settlement/deduct-success')
}
</script>
