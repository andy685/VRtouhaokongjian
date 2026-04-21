<template>
  <div class="page-container">
    <div class="page-header">
      <h2>平台账号管理</h2>
    </div>
    <n-card>
      <n-tabs type="line">
        <n-tab-pane name="users" tab="账号列表">
          <n-data-table :columns="columns" :data="data" :pagination="pagination" />
        </n-tab-pane>
        <n-tab-pane name="roles" tab="角色权限">
          <div class="roles-grid">
            <n-card v-for="role in roles" :key="role.id" :title="role.name" hoverable>
              <template #header-extra>
                <n-tag :type="role.type">{{ role.count }}人</n-tag>
              </template>
              <p>{{ role.description }}</p>
              <template #footer>
                <n-space>
                  <n-button size="small">编辑权限</n-button>
                  <n-button size="small">查看账号</n-button>
                </n-space>
              </template>
            </n-card>
          </div>
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import { NCard, NDataTable, NTag, NButton, NTabs, NTabPane, NSpace } from 'naive-ui'

const columns = [
  { title: '账号', key: 'name' },
  { title: '角色', key: 'role' },
  { title: '手机号', key: 'phone' },
  { title: '状态', key: 'status', render: (row: any) => h(NTag, { type: row.status === 'active' ? 'success' : 'default' }, () => row.status === 'active' ? '启用' : '禁用') },
  { title: '最后登录', key: 'lastLogin' },
  { title: '操作', key: 'actions', render: () => h(NSpace, null, { default: () => [h(NButton, { size: 'small' }, () => '编辑'), h(NButton, { size: 'small', tertiary: true }, () => '禁用')] }) }
]

const data = ref([
  { id: 1, name: '张三', role: '平台超管', phone: '138****1234', status: 'active', lastLogin: '2024-01-20 10:30' },
  { id: 2, name: '李四', role: '运营专员', phone: '139****5678', status: 'active', lastLogin: '2024-01-20 09:15' },
  { id: 3, name: '王五', role: '财务专员', phone: '137****9012', status: 'active', lastLogin: '2024-01-19 18:45' },
])

const pagination = { pageSize: 10 }

const roles = ref([
  { id: 1, name: '超级管理员', description: '拥有系统所有权限', count: 2, type: 'error' },
  { id: 2, name: '平台运营', description: '负责日常运营管理', count: 5, type: 'warning' },
  { id: 3, name: '平台财务', description: '财务结算与对账', count: 3, type: 'info' },
  { id: 4, name: '内容审核', description: '游戏内容审核管理', count: 4, type: 'success' },
  { id: 5, name: '代理商', description: '区域代理管理', count: 12, type: 'default' },
])
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { margin-bottom: 24px; }
.page-header h2 { font-size: 20px; font-weight: 600; }
.roles-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
</style>
