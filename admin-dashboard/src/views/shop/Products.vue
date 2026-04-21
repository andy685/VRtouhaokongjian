<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>商品管理</h1>
      <n-button type="primary">+ 添加商品</n-button>
    </div>

    <!-- Tab切换 -->
    <n-tabs type="line" animated v-model:value="activeTab">
      <n-tab-pane name="virtual" tab="🎫 虚拟商品">
        <div class="tab-content">
          <div class="tab-desc">
            <n-icon :component="InformationCircleOutline" size="16" />
            <span>虚拟商品 = 收银系统的「单次消费」+「充值活动」+「套票」三个Tab，支持多种定价模式和有效期设置</span>
          </div>
          
          <!-- 子分类 -->
          <n-tabs size="small" type="card" v-model:value="subTab">
            <n-tab-pane name="single" tab="按次体验券">
              <div class="sub-content">
                <div class="sub-header">
                  <span class="sub-title">按次体验券列表</span>
                  <n-button size="small" type="primary">+ 添加体验券</n-button>
                </div>
                <n-data-table :columns="virtualColumns" :data="singleData" :pagination="{ pageSize: 8 }" striped />
              </div>
            </n-tab-pane>
            <n-tab-pane name="recharge" tab="储值会员卡">
              <div class="sub-content">
                <div class="sub-header">
                  <span class="sub-title">储值会员卡列表</span>
                  <n-button size="small" type="primary">+ 添加储值卡</n-button>
                </div>
                <n-data-table :columns="rechargeColumns" :data="rechargeData" :pagination="{ pageSize: 8 }" striped />
              </div>
            </n-tab-pane>
            <n-tab-pane name="package" tab="次数套餐">
              <div class="sub-content">
                <div class="sub-header">
                  <span class="sub-title">次数套餐列表</span>
                  <n-button size="small" type="primary">+ 添加套餐</n-button>
                </div>
                <n-data-table :columns="packageColumns" :data="packageData" :pagination="{ pageSize: 8 }" striped />
              </div>
            </n-tab-pane>
            <n-tab-pane name="timecard" tab="时间卡">
              <div class="sub-content">
                <div class="sub-header">
                  <span class="sub-title">时间卡列表</span>
                  <n-button size="small" type="primary">+ 添加时间卡</n-button>
                </div>
                <n-data-table :columns="timecardColumns" :data="timecardData" :pagination="{ pageSize: 8 }" striped />
              </div>
            </n-tab-pane>
          </n-tabs>
        </div>
      </n-tab-pane>
      
      <n-tab-pane name="physical" tab="📦 实体商品">
        <div class="tab-content">
          <div class="tab-desc">
            <n-icon :component="InformationCircleOutline" size="16" />
            <span>实体商品 = 收销系统的「商品」Tab，支持库存管理和供应链设置</span>
          </div>
          
          <div class="physical-actions">
            <n-input placeholder="搜索商品名称..." size="small" style="width: 200px;">
              <template #prefix><n-icon :component="SearchOutline" /></template>
            </n-input>
            <n-select placeholder="商品分类" :options="categoryOptions" size="small" style="width: 140px;" />
            <n-select placeholder="库存状态" :options="stockStatusOptions" size="small" style="width: 120px;" />
            <n-button size="small">筛选</n-button>
          </div>

          <n-data-table :columns="physicalColumns" :data="physicalData" :pagination="{ pageSize: 8 }" striped />
        </div>
      </n-tab-pane>

      <n-tab-pane name="inventory" tab="📊 库存管理">
        <div class="tab-content">
          <div class="stock-overview">
            <div class="stock-card">
              <span class="label">总商品数</span>
              <span class="value">48件</span>
              <span class="sub">涉及 12 种商品</span>
            </div>
            <div class="stock-card">
              <span class="label">总库存价值</span>
              <span class="value">¥23,680</span>
              <span class="sub">按成本价计算</span>
            </div>
            <div class="stock-card warning">
              <span class="label">⚠ 低库存预警</span>
              <span class="value">3件</span>
              <n-button size="tiny" type="error" secondary>立即采购</n-button>
            </div>
            <div class="stock-card">
              <span class="label">今日变动</span>
              <span class="value green">+15 / -8</span>
              <span class="sub">入库 / 出库</span>
            </div>
          </div>

          <div class="inventory-actions">
            <n-button size="small" type="primary">+ 入库</n-button>
            <n-button size="small">- 出库</n-button>
            <n-button size="small" secondary>📋 库存盘点</n-button>
          </div>

          <n-data-table :columns="stockColumns" :data="stockData" :pagination="{ pageSize: 10 }" striped />
        </div>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import {
  NButton, NTabs, NTabPane, NDataTable, NTag, NSpace, NInput,
  NSelect, NIcon
} from 'naive-ui'
import {
  InformationCircleOutline, SearchOutline, AddOutline
} from '@vicons/ionicons5'

const activeTab = ref('virtual')
const subTab = ref('single')

const categoryOptions = [
  { label: '全部分类', value: 'all' },
  { label: '消耗品', value: 'consumable' },
  { label: '配件', value: 'accessory' },
  { label: '周边', value: 'merchandise' },
  { label: '饮品', value: 'drink' },
]

const stockStatusOptions = [
  { label: '全部', value: 'all' },
  { label: '低库存', value: 'low' },
  { label: '正常', value: 'normal' },
  { label: '充足', value: 'enough' },
]

const virtualColumns = [
  { title: '商品名称', key: 'name' },
  { title: '游戏', key: 'game' },
  { title: '原价', key: 'originalPrice', render: (row: any) => row.originalPrice ? `¥${row.originalPrice}` : '-' },
  { title: '售价', key: 'price', render: (row: any) => `¥${row.price}` },
  { title: '有效期', key: 'validity' },
  { title: '销量', key: 'sales' },
  { title: '状态', key: 'status', render: (row: any) => h(NTag, { type: row.status === 'active' ? 'success' : 'default', size: 'small', bordered: true }, () => row.status === 'active' ? '上架' : '下架') },
  { title: '操作', key: 'actions', render: () => h(NSpace, null, { default: () => [h(NButton, { size: 'tiny', secondary: true }, () => '编辑'), h(NButton, { size: 'tiny', quaternary: true }, () => '禁用')] }) },
]

const singleData = [
  { name: '单次VR体验券 - 过山车', game: '过山车VR', originalPrice: 49, price: 39, validity: '永久', sales: 1256, status: 'active' },
  { name: '单次VR体验券 - 恐怖医院', game: '恐怖医院', originalPrice: 59, price: 49, validity: '永久', sales: 892, status: 'active' },
  { name: '单次VR体验券 - 极速赛车', game: '极速赛车', originalPrice: 45, price: 35, validity: '永久', sales: 756, status: 'active' },
  { name: '单次VR体验券 - 海洋世界', game: '海洋世界', originalPrice: 55, price: 45, validity: '永久', sales: 543, status: 'active' },
]

const rechargeColumns = [
  { title: '卡名称', key: 'name' },
  { title: '充值金额', key: 'amount', render: (row: any) => `¥${row.amount}` },
  { title: '赠送金额', key: 'gift', render: (row: any) => row.gift > 0 ? `+¥${row.gift}` : '-' },
  { title: '有效期', key: 'validity' },
  { title: '销量', key: 'sales' },
  { title: '状态', key: 'status', render: (row: any) => h(NTag, { type: row.status === 'active' ? 'success' : 'default', size: 'small', bordered: true }, () => row.status === 'active' ? '上架' : '下架') },
  { title: '操作', key: 'actions', render: () => h(NSpace, null, { default: () => [h(NButton, { size: 'tiny', secondary: true }, () => '编辑')] }) },
]

const rechargeData = [
  { name: '充值 ¥100', amount: 100, gift: 0, validity: '永久', sales: 2580, status: 'active' },
  { name: '充值 ¥300', amount: 300, gift: 30, validity: '永久', sales: 1865, status: 'active' },
  { name: '充值 ¥500', amount: 500, gift: 80, validity: '永久', sales: 1234, status: 'active' },
  { name: '充值 ¥1000', amount: 1000, gift: 200, validity: '永久', sales: 568, status: 'active' },
]

const packageColumns = [
  { title: '套餐名称', key: 'name' },
  { title: '次数', key: 'count' },
  { title: '原价', key: 'originalPrice', render: (row: any) => `¥${row.originalPrice}` },
  { title: '售价', key: 'price', render: (row: any) => `¥${row.price}` },
  { title: '有效期', key: 'validity' },
  { title: '销量', key: 'sales' },
  { title: '状态', key: 'status', render: (row: any) => h(NTag, { type: row.status === 'active' ? 'success' : 'default', size: 'small', bordered: true }, () => row.status === 'active' ? '上架' : '下架') },
  { title: '操作', key: 'actions', render: () => h(NSpace, null, { default: () => [h(NButton, { size: 'tiny', secondary: true }, () => '编辑')] }) },
]

const packageData = [
  { name: '3次VR畅玩卡', count: 3, originalPrice: 150, price: 99, validity: '30天', sales: 856, status: 'active' },
  { name: '5次VR畅玩卡', count: 5, originalPrice: 250, price: 149, validity: '30天', sales: 632, status: 'active' },
  { name: '10次VR畅玩卡', count: 10, originalPrice: 500, price: 299, validity: '60天', sales: 328, status: 'active' },
]

const timecardColumns = [
  { title: '卡名称', key: 'name' },
  { title: '时长', key: 'duration' },
  { title: '原价', key: 'originalPrice', render: (row: any) => `¥${row.originalPrice}` },
  { title: '售价', key: 'price', render: (row: any) => `¥${row.price}` },
  { title: '有效期', key: 'validity' },
  { title: '销量', key: 'sales' },
  { title: '状态', key: 'status', render: (row: any) => h(NTag, { type: row.status === 'active' ? 'success' : 'default', size: 'small', bordered: true }, () => row.status === 'active' ? '上架' : '下架') },
  { title: '操作', key: 'actions', render: () => h(NSpace, null, { default: () => [h(NButton, { size: 'tiny', secondary: true }, () => '编辑')] }) },
]

const timecardData = [
  { name: '月卡 - 无限畅玩', duration: '30天', originalPrice: 299, price: 199, validity: '30天', sales: 245, status: 'active' },
  { name: '季卡 - 无限畅玩', duration: '90天', originalPrice: 799, price: 499, validity: '90天', sales: 128, status: 'active' },
  { name: '年卡 - 无限畅玩', duration: '365天', originalPrice: 2599, price: 1599, validity: '365天', sales: 56, status: 'active' },
]

const physicalColumns = [
  { title: '商品', key: 'info', render(row: any) {
    return h('div', { style: 'display:flex;align-items:center;gap:10px;' }, [
      h('div', { style: 'width:40px;height:40px;background:#f1f5f9;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px;' }, row.icon),
      h('div', {}, [
        h('div', { style: 'font-weight:500' }, row.name),
        h('div', { style: 'font-size:11px;color:#94a3b8' }, `成本: ¥${row.cost}`)
      ])
    ])
  }},
  { title: '分类', key: 'category' },
  { title: '售价', key: 'price', render: (row: any) => `¥${row.price}` },
  { title: '库存', key: 'stock', render: (row: any) => h('span', { style: `font-weight:600;` }, row.stock) },
  { title: '库存状态', key: 'stockStatus', render: (row: any) => {
    const num = parseInt(row.stock)
    if (num <= 10) return h(NTag, { type: 'error', size: 'small', bordered: true }, () => '低库存')
    if (num <= 50) return h(NTag, { type: 'warning', size: 'small', bordered: true }, () => '正常')
    return h(NTag, { type: 'success', size: 'small', bordered: true }, () => '充足')
  }},
  { title: '销量', key: 'sales' },
  { title: '状态', key: 'status', render: (row: any) => h(NTag, { type: row.status === 'on' ? 'success' : 'default', size: 'small', bordered: true }, () => row.status === 'on' ? '上架' : '下架') },
  { title: '操作', key: 'actions', render: () => h(NSpace, null, { default: () => [h(NButton, { size: 'tiny', secondary: true }, () => '编辑'), h(NButton, { size: 'tiny', quaternary: true }, () => '补货')] }) },
]

const physicalData = [
  { name: '一次性眼罩', icon: '😷', category: '消耗品', cost: '0.8', price: '3.0', stock: '200', sales: 1256, status: 'on' },
  { name: 'VR手柄保护套', icon: '🧤', category: '配件', cost: '12', price: '29.0', stock: '15', sales: 328, status: 'on' },
  { name: '恐怖医院限定玩偶', icon: '🧸', category: '周边', cost: '35', price: '68.0', stock: '52', sales: 156, status: 'on' },
  { name: '恐龙王国钥匙扣', icon: '🔑', category: '周边', cost: '8', price: '18.0', stock: '3', sales: 289, status: 'on' },
  { name: '可乐330ml', icon: '🥤', category: '饮品', cost: '2', price: '5.0', stock: '30', sales: 856, status: 'on' },
]

const stockColumns = [
  { title: '时间', key: 'time', width: 160 },
  { title: '操作类型', key: 'action', width: 100, render: (row: any) => h(NTag, { type: row.action === '入库' ? 'success' : 'error', size: 'tiny' }, () => row.action) },
  { title: '商品', key: 'product' },
  { title: '数量', key: 'qty', render: (row: any) => h('span', { style: `font-weight:600;color:${row.action === '入库' ? '#10B981' : '#EF4444'};` }, row.qty) },
  { title: '前后库存', key: 'beforeAfter', render: (row: any) => `${row.before} → ${row.after}` },
  { title: '操作人', key: 'operator' },
  { title: '备注', key: 'remark' },
]

const stockData = [
  { time: '2026-04-20 14:32:05', action: '入库', product: '一次性眼罩', qty: '+200', before: 20, after: 220, operator: '管理员', remark: '批量采购入库' },
  { time: '2026-04-20 13:20:18', action: '出库', product: '恐龙钥匙扣', qty: '-7', before: 10, after: 3, operator: '销售', remark: '顾客购买' },
  { time: '2026-04-20 11:05:42', action: '盘点', product: 'VR手柄保护套', qty: '+2', before: 13, after: 15, operator: '店长', remark: '库存盘点调整' },
  { time: '2026-04-19 16:30:00', action: '入库', product: '恐怖医院限定玩偶', qty: '+50', before: 2, after: 52, operator: '管理员', remark: '供应商补货' },
]
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); }

.tab-content { padding-top: 16px; }

.tab-desc {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: #3B82F6;
  background: #EFF6FF; padding: 12px 16px; border-radius: 8px;
  margin-bottom: 16px; border-left: 3px solid #3B82F6;
}

.sub-content { background: white; border-radius: 12px; padding: 20px; border: 1px solid var(--border-color); }
.sub-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.sub-title { font-size: 14px; font-weight: 600; color: var(--text-primary); }

.physical-actions { display: flex; gap: 12px; margin-bottom: 16px; align-items: center; }

.stock-overview { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
.stock-card { background: white; border-radius: 12px; padding: 20px; text-align: center; border: 1px solid var(--border-color); }
.stock-card .label { font-size: 12px; color: var(--text-muted); display: block; }
.stock-card .value { font-family: 'Orbitron', sans-serif; font-size: 26px; font-weight: 700; color: var(--text-primary); display: block; margin: 8px 0; }
.stock-card .sub { font-size: 11px; color: var(--text-muted); }
.stock-card.warning { border-color: rgba(239,68,68,0.3); background: linear-gradient(180deg, #fef2f2, white); }
.stock-card .value.green { color: #10B981; }

.inventory-actions { display: flex; gap: 12px; margin-bottom: 16px; }
</style>
