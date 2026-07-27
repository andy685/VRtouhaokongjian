<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>新增会员</span>
          <el-button @click="$router.back()">返回</el-button>
        </div>
      </template>

      <el-form label-width="100px" class="member-form" @submit.prevent="handleSubmit">
        <el-form-item label="手机号码" required>
          <el-input
            v-model="phone"
            maxlength="11"
            placeholder="请输入 11 位手机号"
            @input="onPhoneInput"
          />
        </el-form-item>
        <el-form-item v-if="statusText" label=" ">
          <span class="status" :class="statusTone">{{ statusText }}</span>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :disabled="!canSubmit" @click="handleSubmit">确认添加</el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  createOrLinkMemberToStore,
  lookupGlobalMemberByPhone,
  isValidPhone,
} from '../../stores/memberRegistry'

const router = useRouter()
const phone = ref('')

const lookup = computed(() => {
  if (!isValidPhone(phone.value)) return null
  return lookupGlobalMemberByPhone(phone.value)
})

const alreadyLinked = computed(() =>
  !!(lookup.value?.exists && lookup.value?.linkedToCurrentStore)
)

const canSubmit = computed(() => isValidPhone(phone.value) && !alreadyLinked.value)

const statusText = computed(() => {
  if (!phone.value) return ''
  if (!isValidPhone(phone.value)) {
    return phone.value.length >= 11 ? '请输入正确的 11 位手机号' : `已输入 ${phone.value.length}/11 位`
  }
  if (alreadyLinked.value) return '该手机号已是本店会员'
  if (lookup.value?.exists) return '系统将自动关联到本店'
  return '系统将自动添加为本店会员'
})

const statusTone = computed(() => {
  if (!isValidPhone(phone.value)) return 'muted'
  if (alreadyLinked.value) return 'warn'
  if (lookup.value?.exists) return 'info'
  return 'ok'
})

const onPhoneInput = () => {
  phone.value = phone.value.replace(/\D/g, '').slice(0, 11)
}

const handleSubmit = () => {
  if (!canSubmit.value) return
  const result = createOrLinkMemberToStore({ phone: phone.value })
  if (!result.ok) {
    ElMessage.warning(result.message)
    return
  }
  ElMessage.success(result.message)
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
  max-width: 420px;
}

.status {
  font-size: 13px;
}
.status.muted { color: #94a3b8; }
.status.ok { color: #059669; }
.status.info { color: #1d4ed8; }
.status.warn { color: #b45309; }
</style>
