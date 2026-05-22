<template>
  <div class="login-container">
    <div class="login-left">
      <div class="brand">
        <img src="/logo.svg" alt="Alpha Space" class="logo" />
        <div class="slogan">Welcome ALPHA SPACE</div>
      </div>
    </div>
    <div class="login-right">
      <div class="login-box">
        <h2>店员登录</h2>
        <el-form :model="form" class="login-form">
          <el-form-item>
            <el-input
              v-model="form.username"
              placeholder="请输入店员账号"
              prefix-icon="User"
              size="large"
            />
          </el-form-item>
          <el-form-item>
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入登录密码"
              prefix-icon="Lock"
              size="large"
              show-password
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="large" class="login-btn" @click="handleLogin">
              登录
            </el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="quick-actions">
        <el-button text @click="goSetting">基础配置</el-button>
        <el-button text @click="goUpgrade">在线升级</el-button>
        <el-button text @click="goBackend">店铺后台</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const form = reactive({
  username: '',
  password: ''
})

const handleLogin = () => {
  router.push('/sale')
}

const goSetting = () => router.push('/setting/basic')
const goUpgrade = () => router.push('/upgrade')
const goBackend = () => window.open('https://alpha.space')
</script>

<style scoped>
.login-container {
  display: flex;
  height: 100vh;
}

.login-left {
  flex: 1;
  background: linear-gradient(135deg, #1a1a2e 0%, #2d2d5a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.login-left::before {
  content: '';
  position: absolute;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(77, 77, 77, 0.3) 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.brand {
  text-align: center;
  z-index: 1;
}

.logo {
  width: 120px;
  height: 120px;
  margin-bottom: 20px;
}

.slogan {
  color: #fff;
  font-size: 28px;
  font-weight: 600;
  letter-spacing: 2px;
}

.login-right {
  width: 500px;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-box {
  width: 100%;
  max-width: 360px;
}

.login-box h2 {
  font-size: 28px;
  color: #333;
  margin-bottom: 40px;
  text-align: center;
}

.login-form {
  width: 100%;
}

.login-btn {
  width: 100%;
  height: 50px;
  font-size: 18px;
  border-radius: 8px;
}

.quick-actions {
  position: absolute;
  bottom: 40px;
  display: flex;
  gap: 30px;
}

.quick-actions .el-button {
  color: #666;
  font-size: 16px;
}
</style>
