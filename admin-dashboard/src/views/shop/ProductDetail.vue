<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div class="header-left">
        <n-button quaternary @click="goBack">
          <template #icon><n-icon :component="ArrowBackOutline" /></template>
        </n-button>
        <h1>{{ isEdit ? '编辑商品' : '添加商品' }}</h1>
      </div>
      <div class="header-right">
        <n-button @click="goBack">取消</n-button>
        <n-button type="primary" @click="handleSave">保存</n-button>
      </div>
    </div>

    <div class="detail-body">
      <div class="form-main">
        <n-card title="基本信息" :bordered="false" class="form-card">
          <n-form ref="formRef" :model="formData" label-placement="left" label-width="100">
            <n-form-item label="商品名称" path="name">
              <n-input v-model:value="formData.name" placeholder="请输入商品名称" />
            </n-form-item>
            <n-form-item label="商品分类" path="category">
              <n-select v-model:value="formData.category" :options="categoryOptions" placeholder="请选择分类" />
            </n-form-item>
            <n-form-item label="商品封面" path="coverUrl">
              <div class="cover-upload">
                <div class="cover-wrap" @click="triggerUpload">
                  <img v-if="formData.coverUrl" :src="formData.coverUrl" class="cover-img" />
                  <img v-else :src="defaultCover" class="cover-img cover-default" />
                  <div class="cover-overlay">
                    <n-icon :component="AddOutline" size="22" color="#fff" />
                    <span>点击上传</span>
                  </div>
                </div>
                <div v-if="formData.coverUrl" class="cover-btns">
                  <n-button size="tiny" @click.stop="triggerUpload">更换</n-button>
                  <n-button size="tiny" quaternary type="error" @click.stop="removeCover">删除</n-button>
                </div>
                <input ref="fileInputRef" type="file" accept="image/jpeg,image/png,image/webp" class="hidden-input" @change="handleFileChange" />
              </div>
            </n-form-item>
            <n-form-item label="商品描述" path="description">
              <n-input v-model:value="formData.description" type="textarea" :rows="3" placeholder="请输入商品描述" />
            </n-form-item>
            <n-form-item label="上架状态" path="status">
              <n-switch v-model:value="formData.statusOn" />
              <span class="switch-label">{{ formData.statusOn ? '上架' : '下架' }}</span>
            </n-form-item>
          </n-form>
        </n-card>

        <n-card title="价格与库存" :bordered="false" class="form-card">
          <n-form :model="formData" label-placement="left" label-width="100">
            <n-form-item label="成本价" path="cost">
              <n-input-number v-model:value="formData.cost" :min="0" :precision="2" placeholder="0.00">
                <template #prefix>¥</template>
              </n-input-number>
            </n-form-item>
            <n-form-item label="售价" path="price">
              <n-input-number v-model:value="formData.price" :min="0" :precision="2" placeholder="0.00">
                <template #prefix>¥</template>
              </n-input-number>
            </n-form-item>
            <n-form-item label="库存数量" path="stock">
              <n-input-number v-model:value="formData.stock" :min="0" placeholder="0" />
            </n-form-item>
            <n-form-item label="低库存预警" path="stockAlert">
              <n-input-number v-model:value="formData.stockAlert" :min="0" placeholder="库存低于此值时预警" />
            </n-form-item>
          </n-form>
        </n-card>
      </div>

      <div class="form-side">
        <n-card title="商品预览" :bordered="false" class="form-card preview-card">
          <div class="preview-box">
            <div v-if="formData.coverUrl" class="preview-cover">
              <img :src="formData.coverUrl" />
            </div>
            <div v-else class="preview-icon">📦</div>
            <div class="preview-name">{{ formData.name || '商品名称' }}</div>
            <div class="preview-category">{{ formData.category ? categoryMap[formData.category] || formData.category : '未分类' }}</div>
            <div class="preview-price">¥{{ formData.price?.toFixed(2) || '0.00' }}</div>
            <div class="preview-stock">
              <n-tag :type="formData.stock > (formData.stockAlert || 10) ? 'success' : 'error'" size="small">
                库存: {{ formData.stock || 0 }}
              </n-tag>
              <n-tag :type="formData.statusOn ? 'success' : 'default'" size="small">
                {{ formData.statusOn ? '上架' : '下架' }}
              </n-tag>
            </div>
          </div>
        </n-card>

        <n-card v-if="isEdit" title="销售数据" :bordered="false" class="form-card">
          <div class="stat-row">
            <span class="stat-label">累计销量</span>
            <span class="stat-value">{{ productData?.sales || 0 }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">累计营收</span>
            <span class="stat-value">¥{{ ((productData?.sales || 0) * (productData?.price || 0)).toFixed(2) }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">创建时间</span>
            <span class="stat-value">2026-01-15</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">最后修改</span>
            <span class="stat-value">2026-04-20</span>
          </div>
        </n-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NButton, NIcon, NCard, NForm, NFormItem, NInput, NInputNumber,
  NSelect, NSwitch, NTag, useMessage
} from 'naive-ui'
import { ArrowBackOutline, AddOutline } from '@vicons/ionicons5'

const router = useRouter()
const route = useRoute()
const message = useMessage()

const isEdit = computed(() => route.name === 'ShopProductDetail')
const productId = computed(() => route.params.id as string)

const categoryOptions = [
  { label: '消耗品', value: 'consumable' },
  { label: '配件', value: 'accessory' },
  { label: '周边', value: 'merchandise' },
  { label: '饮品', value: 'drink' },
]

const categoryMap: Record<string, string> = {
  consumable: '消耗品',
  accessory: '配件',
  merchandise: '周边',
  drink: '饮品',
}

const productData = ref<any>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

// 默认占位图
const defaultCover = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#f1f5f9"/><rect x="160" y="120" width="80" height="60" rx="6" fill="#cbd5e1"/><circle cx="185" cy="145" r="10" fill="#94a3b8"/><polygon points="165,175 200,150 235,175" fill="#94a3b8"/><rect x="140" y="200" width="120" height="8" rx="4" fill="#cbd5e1"/><rect x="155" y="220" width="90" height="8" rx="4" fill="#e2e8f0"/><circle cx="200" cy="290" r="24" fill="#e2e8f0"/><path d="M190 290 L210 290 M200 280 L200 300" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/></svg>')}`

const formData = ref({
  name: '',
  category: null as string | null,
  coverUrl: '',
  description: '',
  cost: 0,
  price: 0,
  stock: 0,
  stockAlert: 10,
  statusOn: true,
})

// 模拟商品数据
const mockProducts: Record<string, any> = {
  '1': { name: '一次性眼罩', icon: '😷', coverUrl: '', category: 'consumable', cost: 0.8, price: 3.0, stock: 200, sales: 1256, status: 'on' },
  '2': { name: 'VR手柄保护套', icon: '🧤', coverUrl: '', category: 'accessory', cost: 12, price: 29.0, stock: 15, sales: 328, status: 'on' },
  '3': { name: '恐怖医院限定玩偶', icon: '🧸', coverUrl: '', category: 'merchandise', cost: 35, price: 68.0, stock: 52, sales: 156, status: 'on' },
  '4': { name: '恐龙王国钥匙扣', icon: '🔑', coverUrl: '', category: 'merchandise', cost: 8, price: 18.0, stock: 3, sales: 289, status: 'on' },
  '5': { name: '可乐330ml', icon: '🥤', coverUrl: '', category: 'drink', cost: 2, price: 5.0, stock: 30, sales: 856, status: 'on' },
}

onMounted(() => {
  if (isEdit.value && productId.value) {
    const data = mockProducts[productId.value]
    if (data) {
      productData.value = data
      formData.value = {
        name: data.name,
        category: data.category,
        coverUrl: data.coverUrl || '',
        description: '',
        cost: data.cost,
        price: parseFloat(data.price),
        stock: parseInt(data.stock),
        stockAlert: 10,
        statusOn: data.status === 'on',
      }
    }
  }
})

function goBack() {
  router.push('/shop/products')
}

function triggerUpload() {
  fileInputRef.value?.click()
}

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    message.warning('图片大小不能超过 5MB')
    return
  }
  const reader = new FileReader()
  reader.onload = (ev) => {
    formData.value.coverUrl = ev.target?.result as string
  }
  reader.readAsDataURL(file)
  // 清空 input 以便重复选择同一文件
  target.value = ''
}

function removeCover() {
  formData.value.coverUrl = ''
}

function handleSave() {
  if (!formData.value.name) {
    message.warning('请输入商品名称')
    return
  }
  message.success(isEdit.value ? '商品已更新' : '商品已添加')
  router.push('/shop/products')
}
</script>

<style scoped>
.page-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 24px;
}
.header-left {
  display: flex; align-items: center; gap: 12px;
}
.header-left h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); }
.header-right { display: flex; gap: 12px; }

.detail-body {
  display: flex; gap: 24px; align-items: flex-start;
}
.form-main { flex: 1; display: flex; flex-direction: column; gap: 20px; }
.form-side { width: 320px; display: flex; flex-direction: column; gap: 20px; }

.form-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.icon-preview {
  font-size: 28px; margin-left: 12px;
}

/* 封面上传 */
.cover-upload {
  width: 100%;
}
.cover-wrap {
  width: 200px; height: 200px; border-radius: 12px; overflow: hidden;
  border: 2px dashed #d1d5db; cursor: pointer; position: relative;
  transition: all 0.2s;
}
.cover-wrap:hover {
  border-color: #3B82F6;
}
.cover-wrap:hover .cover-overlay {
  opacity: 1;
}
.cover-img {
  width: 100%; height: 100%; object-fit: cover; display: block;
}
.cover-default {
  opacity: 0.7;
}
.cover-overlay {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 4px; background: rgba(0,0,0,0.45); opacity: 0;
  transition: opacity 0.2s; color: white; font-size: 13px;
}
.cover-btns {
  display: flex; gap: 8px; margin-top: 8px;
}
.hidden-input {
  display: none;
}

/* 预览区封面图 */
.preview-cover {
  width: 120px; height: 120px; border-radius: 12px; overflow: hidden;
  margin: 0 auto 12px; border: 1px solid var(--border-color);
}
.preview-cover img {
  width: 100%; height: 100%; object-fit: cover;
}

.switch-label {
  margin-left: 8px; font-size: 13px; color: var(--text-secondary);
}

.preview-box {
  text-align: center; padding: 16px 0;
}
.preview-icon {
  font-size: 48px; margin-bottom: 12px;
}
.preview-name {
  font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px;
}
.preview-category {
  font-size: 12px; color: var(--text-muted); margin-bottom: 12px;
}
.preview-price {
  font-size: 24px; font-weight: 700; color: #3B82F6; margin-bottom: 12px;
}
.preview-stock {
  display: flex; gap: 8px; justify-content: center;
}

.stat-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 0; border-bottom: 1px solid var(--border-color);
}
.stat-row:last-child { border-bottom: none; }
.stat-label { font-size: 13px; color: var(--text-muted); }
.stat-value { font-size: 14px; font-weight: 600; color: var(--text-primary); }
</style>
