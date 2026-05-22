<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <span>选择设备</span>
      </template>
      
      <div class="device-grid">
        <div
          v-for="device in devices"
          :key="device.id"
          class="device-card"
          :class="{ unavailable: !device.available }"
          @click="device.available && selectDevice(device)"
        >
          <div class="device-icon">
            <el-icon size="48"><Monitor /></el-icon>
          </div>
          <div class="device-name">{{ device.name }}</div>
          <div class="device-status">
            <el-tag :type="device.available ? 'success' : 'danger'">
              {{ device.available ? '空闲' : '使用中' }}
            </el-tag>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Monitor } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()

const devices = ref([
  { id: 1, name: 'VR设备 1号', available: true },
  { id: 2, name: 'VR设备 2号', available: false },
  { id: 3, name: 'VR设备 3号', available: true },
  { id: 4, name: 'VR设备 4号', available: true },
  { id: 5, name: 'VR设备 5号', available: false },
  { id: 6, name: 'VR设备 6号', available: true },
])

const selectDevice = (device) => {
  ElMessage.success(`已选择: ${device.name}`)
  router.push('/member/deduct')
}
</script>

<style scoped>
.device-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.device-card {
  background: #f5f7fa;
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.device-card:hover:not(.unavailable) {
  background: #e8f4ff;
  transform: translateY(-2px);
}

.device-card.unavailable {
  opacity: 0.6;
  cursor: not-allowed;
}

.device-icon {
  margin-bottom: 16px;
  color: #409eff;
}

.device-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
}
</style>
