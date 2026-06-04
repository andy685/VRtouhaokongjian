<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>会员列表</span>
          <div class="header-actions">
            <el-input v-model="search" placeholder="搜索会员" style="width: 200px" />
            <el-button type="primary" @click="$router.push('/sale/new-member')">新增会员</el-button>
          </div>
        </div>
      </template>
      
      <el-table :data="filteredMembers" style="width: 100%" @row-click="goDetail">
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="level" label="会员等级">
          <template #default="{ row }">
            <el-tag :type="row.level === '钻石' ? 'warning' : 'success'">{{ row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="balance" label="余额">
          <template #default="{ row }">
            <span style="color: #ff6b6b"><span class="currency-symbol">¥</span>{{ row.balance }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="times" label="剩余次数" />
        <el-table-column prop="lastVisit" label="最近消费" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click.stop="$router.push(`/member/${row.id}`)">详情</el-button>
            <el-button size="small" type="warning" @click.stop="$router.push('/member/deduct')">扣费</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="10"
          :total="100"
          layout="prev, pager, next"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const search = ref('')
const currentPage = ref(1)

const members = ref([
  { id: 1, name: '李明', phone: '138****1234', level: '黄金', balance: 500, times: 5, lastVisit: '2024-01-15' },
  { id: 2, name: '王芳', phone: '139****5678', level: '钻石', balance: 1200, times: 12, lastVisit: '2024-01-14' },
  { id: 3, name: '张伟', phone: '137****9012', level: '白银', balance: 200, times: 2, lastVisit: '2024-01-10' },
  { id: 4, name: '刘洋', phone: '136****3456', level: '黄金', balance: 800, times: 8, lastVisit: '2024-01-12' },
])

const filteredMembers = computed(() => {
  if (!search.value) return members.value
  return members.value.filter(m => m.name.includes(search.value) || m.phone.includes(search.value))
})

const goDetail = (row) => {
  router.push(`/member/${row.id}`)
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
