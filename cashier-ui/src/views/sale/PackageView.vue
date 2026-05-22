<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <span>套票列表</span>
      </template>
      <div class="package-grid">
        <div v-for="pkg in packages" :key="pkg.id" class="package-card">
          <div class="package-header">
            <span class="package-name">{{ pkg.name }}</span>
            <el-tag :type="pkg.type === 'hot' ? 'danger' : 'info'">{{ pkg.tag }}</el-tag>
          </div>
          <div class="package-price">
            <span class="price">¥{{ pkg.price }}</span>
            <span class="original">¥{{ pkg.original }}</span>
          </div>
          <div class="package-desc">{{ pkg.desc }}</div>
          <div class="package-features">
            <div v-for="(f, i) in pkg.features" :key="i" class="feature">
              <el-icon><Check /></el-icon>
              {{ f }}
            </div>
          </div>
          <el-button type="primary" class="buy-btn" @click="buyPackage(pkg)">立即购买</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const packages = [
  { id: 1, name: '体验卡', tag: '体验', type: 'info', price: 99, original: 199, desc: '单次VR体验', features: ['单次体验60分钟', '不限游戏类型'] },
  { id: 2, name: '月卡', tag: '热门', type: 'hot', price: 299, original: 599, desc: '30天不限次体验', features: ['30天无限次', '优先体验新游戏', '专属休息区'] },
  { id: 3, name: '季卡', tag: '推荐', type: 'info', price: 799, original: 1599, desc: '90天不限次体验', features: ['90天无限次', '免费携带1名好友', '专属储物柜'] },
  { id: 4, name: '年卡', tag: '超值', type: 'info', price: 2599, original: 5999, desc: '365天不限次体验', features: ['全年无限次', '免费携带2名好友', '专属储物柜', '生日专属福利'] },
]

const buyPackage = (pkg) => {
  ElMessage.success(`已选择: ${pkg.name}`)
}
</script>

<style scoped>
.package-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.package-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.package-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.package-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.package-name {
  font-size: 20px;
  font-weight: 600;
}

.package-price {
  margin-bottom: 12px;
}

.price {
  font-size: 32px;
  font-weight: 700;
  color: #ff6b6b;
}

.original {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
  margin-left: 8px;
}

.package-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.package-features {
  margin-bottom: 20px;
}

.feature {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.feature .el-icon {
  color: #67c23a;
}

.buy-btn {
  width: 100%;
}
</style>
