<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商品列表</span>
          <el-input v-model="search" placeholder="搜索商品" style="width: 200px" />
        </div>
      </template>
      <el-table :data="filteredGoods" style="width: 100%">
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="price" label="售价" width="100">
          <template #default="{ row }">
            ¥{{ row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" @click="addToCart(row)">加入购物车</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const search = ref('')
const goods = ref([
  { id: 1, name: '游戏币x10', category: '游戏币', price: 10, stock: 500 },
  { id: 2, name: '游戏币x50', category: '游戏币', price: 45, stock: 200 },
  { id: 3, name: '游戏币x100', category: '游戏币', price: 85, stock: 100 },
  { id: 4, name: '可乐', category: '饮料', price: 8, stock: 50 },
  { id: 5, name: '雪碧', category: '饮料', price: 8, stock: 50 },
  { id: 6, name: '薯片', category: '零食', price: 15, stock: 30 },
])

const filteredGoods = computed(() => {
  if (!search.value) return goods.value
  return goods.value.filter(g => g.name.includes(search.value))
})

const addToCart = (item) => {
  ElMessage.success(`已加入: ${item.name}`)
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
