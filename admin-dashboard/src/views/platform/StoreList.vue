<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>门店体系管理</h1>
      <n-button type="primary">+ 新增门店</n-button>
    </div>
    <div class="content-card">
      <n-data-table :columns="columns" :data="storeData" :pagination="{ pageSize: 10 }" striped />
    </div>
  </div>
</template>

<script setup lang="ts">
import { NButton, NDataTable, NTag } from 'naive-ui'
import { h } from 'vue'

const columns = [
  { title: '门店名称', key: 'name' },
  { title: '地区', key: 'region' },
  { 
    title: '状态', 
    key: 'status',
    render(row: any) {
      return h(NTag, { type: row.status === 'online' ? 'success' : 'warning', size: 'small', bordered: true }, () => row.statusText)
    }
  },
  { title: '设备数', key: 'devices' },
  { title: '店长', key: 'manager' },
  { title: '创建时间', key: 'createdAt' },
]

const storeData = [
  { name: '深圳福田旗舰店', region: '深圳', status: 'online', statusText: '营业中', devices: 12, manager: '张三', createdAt: '2024-01-15' },
  { name: '南山科技园店', region: '深圳', status: 'online', statusText: '营业中', devices: 8, manager: '李四', createdAt: '2024-02-20' },
  { name: '广州天河店', region: '广州', status: 'online', statusText: '营业中', devices: 16, manager: '王五', createdAt: '2024-03-05' },
  { name: '北京朝阳店', region: '北京', status: 'offline', statusText: '已打烊', devices: 14, manager: '赵六', createdAt: '2024-03-18' },
]
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); }
.content-card { background: white; border-radius: 16px; padding: 24px; border: 1px solid var(--border-color); }
</style>
