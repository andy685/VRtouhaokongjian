<template>
  <div class="shop-info-container">
    <n-card title="商家信息" class="shop-info-card">
      <n-tabs type="line">
        <n-tab-pane name="basic" tab="基本信息">
          <n-form>
            <n-form-item label="商家名称">
              <n-input v-model:value="shopInfo.name" placeholder="请输入商家名称" />
            </n-form-item>
            <n-form-item label="商家地址">
              <n-input v-model:value="shopInfo.address" placeholder="请输入商家地址" />
            </n-form-item>
            <n-form-item label="联系电话">
              <n-input v-model:value="shopInfo.phone" placeholder="请输入联系电话" />
            </n-form-item>
            <n-form-item label="邮箱地址">
              <n-input v-model:value="shopInfo.email" placeholder="请输入邮箱地址" />
            </n-form-item>
            <n-form-item label="商家简介">
              <n-input
                v-model:value="shopInfo.description"
                type="textarea"
                placeholder="请输入商家简介"
                :autosize="{ minRows: 3, maxRows: 5 }"
              />
            </n-form-item>
            <n-form-item>
              <n-button type="primary" @click="saveBasicInfo">保存修改</n-button>
            </n-form-item>
          </n-form>
        </n-tab-pane>
        <n-tab-pane name="business" tab="经营信息">
          <n-form>
            <n-form-item label="经营范围">
              <n-input
                v-model:value="shopInfo.businessScope"
                type="textarea"
                placeholder="请输入经营范围"
                :autosize="{ minRows: 3, maxRows: 5 }"
              />
            </n-form-item>
            <n-form-item label="营业执照号">
              <n-input v-model:value="shopInfo.businessLicense" placeholder="请输入营业执照号" />
            </n-form-item>
            <n-form-item label="法人姓名">
              <n-input v-model:value="shopInfo.legalPerson" placeholder="请输入法人姓名" />
            </n-form-item>
            <n-form-item label="注册资本">
              <n-input v-model:value="shopInfo.registeredCapital" placeholder="请输入注册资本" />
            </n-form-item>
            <n-form-item>
              <n-button type="primary" @click="saveBusinessInfo">保存修改</n-button>
            </n-form-item>
          </n-form>
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 商家信息数据
const shopInfo = ref({
  name: '头号空间商家',
  address: '北京市朝阳区某某大厦1001室',
  phone: '13800138000',
  email: 'contact@example.com',
  description: '专业的VR体验商家，提供多种VR游戏和体验项目',
  businessScope: 'VR游戏体验、VR设备销售、VR内容制作',
  businessLicense: '91110000XXXXXXXXXX',
  legalPerson: '张三',
  registeredCapital: '500万元'
})

// 保存基本信息
const saveBasicInfo = () => {
  // 这里可以添加保存逻辑，比如调用API
  console.log('保存基本信息:', shopInfo.value)
  // 显示保存成功提示
}

// 保存经营信息
const saveBusinessInfo = () => {
  // 这里可以添加保存逻辑，比如调用API
  console.log('保存经营信息:', shopInfo.value)
  // 显示保存成功提示
}
</script>

<style scoped>
.shop-info-container {
  padding: 20px;
}

.shop-info-card {
  max-width: 800px;
  margin: 0 auto;
}
</style>