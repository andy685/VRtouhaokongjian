<template>
  <div class="page-container animate-fade-in">
    <!-- 角色列表 -->
    <template v-if="viewMode === 'list'">
      <div class="page-header">
        <h1>角色列表</h1>
        <n-button type="primary" @click="openCreate">+ 添加角色</n-button>
      </div>
      <n-card class="table-card">
        <n-data-table :columns="columns" :data="roleData" :pagination="pagination" />
      </n-card>
    </template>

    <!-- 权限设置视图 -->
    <template v-else>
      <div class="perm-page-header">
        <n-button text @click="viewMode = 'list'">
          <template #icon><n-icon :component="ArrowBackOutline" /></template>
          返回
        </n-button>
        <span class="perm-page-title">设置权限</span>
      </div>

      <n-card class="perm-card" :bordered="false">
        <div class="perm-layout">
          <!-- 左栏：角色 -->
          <div class="perm-col">
            <div class="perm-col-header">角色</div>
            <div class="perm-col-body">
              <div
                v-for="role in roleData"
                :key="role.id"
                :class="['perm-col-item', { active: selectedRoleId === role.id }]"
                @click="switchRole(role.id)"
              >
                {{ role.name }}
              </div>
            </div>
          </div>

          <!-- 中栏：终端 -->
          <div class="perm-col">
            <div class="perm-col-header">终端</div>
            <div class="perm-col-body">
              <div
                v-for="t in terminals"
                :key="t.key"
                :class="['perm-col-item', { active: selectedTerminal === t.key }]"
                @click="selectedTerminal = t.key"
              >
                {{ t.label }}
              </div>
            </div>
          </div>

          <!-- 右栏：权限分配 -->
          <div class="perm-col perm-col-wide">
            <div class="perm-col-header">权限分配</div>
            <div class="perm-col-body perm-tree-body">
              <div v-for="node in currentTerminalNodes" :key="node.key" class="perm-tree-node">
                <div class="perm-tree-header" @click="node.expanded = !node.expanded">
                  <n-icon
                    class="perm-tree-arrow"
                    :component="node.expanded ? ChevronDownOutline : ChevronForwardOutline"
                  />
                  <n-checkbox v-model:checked="node.checked" @click.stop="toggleNode(node)">
                    {{ node.label }}
                  </n-checkbox>
                </div>
                <div v-show="node.expanded && node.children?.length" class="perm-tree-children">
                  <div
                    v-for="child in node.children"
                    :key="child.key"
                    class="perm-tree-child"
                  >
                    <n-checkbox v-model:checked="child.checked" @update:checked="v => onChildCheck(node, v)">
                      {{ child.label }}
                    </n-checkbox>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="perm-footer">
          <n-space justify="center">
            <n-button style="width: 100px;" @click="viewMode = 'list'">取消</n-button>
            <n-button type="primary" style="width: 120px;" @click="savePermissions">保存</n-button>
          </n-space>
        </div>
      </n-card>
    </template>

    <!-- 添加/编辑角色弹窗 -->
    <n-modal v-model:show="showAddModal" preset="card" :title="isEdit ? '编辑角色' : '创建角色'" style="width: 480px;" :bordered="false">
      <n-form label-placement="left" label-width="100">
        <n-form-item label="商家">
          <n-input value="幻影星空商家 NO.8088" disabled />
        </n-form-item>
        <n-form-item label="角色名称" required>
          <n-input v-model:value="form.name" placeholder="请输入角色名称" />
        </n-form-item>
        <n-form-item label="描述">
          <n-input v-model:value="form.desc" type="textarea" :rows="4" :maxlength="50" show-count placeholder="请描述" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="center" style="width: 100%;">
          <n-button type="primary" style="width: 120px;" @click="handleSubmit">{{ isEdit ? '保存' : '创建' }}</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, h, computed, watch } from 'vue'
import {
  NCard, NDataTable, NButton, NIcon, NModal, NForm, NFormItem,
  NInput, NTag, NSpace, NCheckbox
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import {
  PencilOutline, TrashOutline, KeyOutline, ArrowBackOutline,
  ChevronForwardOutline, ChevronDownOutline
} from '@vicons/ionicons5'

interface PermNode {
  key: string
  label: string
  checked: boolean
  expanded: boolean
  children?: PermNode[]
}

interface TerminalPerm {
  key: string
  label: string
  nodes: PermNode[]
}

interface Role {
  id: number
  name: string
  desc: string
  userCount: number
  status: boolean
  permissions: string[]
}

const viewMode = ref<'list' | 'permission'>('list')
const showAddModal = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)
const form = ref({ name: '', desc: '', status: true })
const pagination = { pageSize: 10 }

const roleData = ref<Role[]>([
  { id: 1, name: '管理员', desc: '拥有所有权限', userCount: 2, status: true, permissions: ['*'] },
  { id: 2, name: '收银员', desc: '收银、退款、查询订单', userCount: 5, status: true, permissions: ['cashier-order', 'ondemand-order', 'manual-deduct-order', 'members', 'member-points-query', 'daily-sales'] },
  { id: 3, name: '接待员', desc: '会员办理、预约管理', userCount: 3, status: true, permissions: ['members', 'member-levels', 'member-ranking', 'guide-members'] },
  { id: 4, name: '设备维护', desc: '设备巡检、故障上报', userCount: 1, status: false, permissions: ['devices', 'on-demand-settings', 'on-demand-data', 'on-demand-device-summary'] },
  { id: 5, name: '财务', desc: '查看报表、对账', userCount: 1, status: true, permissions: ['daily-sales', 'historical-revenue', 'channel-revenue', 'product-sales', 'account-stats', 'shifts', 'film-revenue'] },
])

const columns: DataTableColumns<Role> = [
  { title: '角色名称', key: 'name', minWidth: 120 },
  { title: '权限描述', key: 'desc', minWidth: 200 },
  { title: '关联用户', key: 'userCount', width: 100, align: 'center' },
  {
    title: '状态',
    key: 'status',
    width: 100,
    align: 'center',
    render: (row) =>
      h(NTag, { type: row.status ? 'success' : 'default', size: 'small' },
        { default: () => row.status ? '启用' : '禁用' })
  },
  {
    title: '操作',
    key: 'actions',
    width: 220,
    align: 'center',
    render: (row) =>
      h(NSpace, { size: 4, justify: 'center' }, {
        default: () => [
          h(NButton, {
            size: 'small', text: true, type: 'primary',
            onClick: () => openEdit(row)
          }, { default: () => '编辑', icon: () => h(NIcon, { component: PencilOutline, size: 14 }) }),
          h(NButton, {
            size: 'small', text: true, type: 'info',
            onClick: () => openPermission(row)
          }, { default: () => '权限', icon: () => h(NIcon, { component: KeyOutline, size: 14 }) }),
          h(NButton, {
            size: 'small', text: true, type: 'error',
            onClick: () => handleDelete(row)
          }, { default: () => '删除', icon: () => h(NIcon, { component: TrashOutline, size: 14 }) })
        ]
      })
  }
]

function openCreate() {
  isEdit.value = false
  editingId.value = null
  form.value = { name: '', desc: '', status: true }
  showAddModal.value = true
}

function openEdit(row: Role) {
  isEdit.value = true
  editingId.value = row.id
  form.value = { name: row.name, desc: row.desc, status: row.status }
  showAddModal.value = true
}

function handleDelete(row: Role) {
  const d = window.confirm(`确认删除角色「${row.name}」吗？`)
  if (!d) return
  const idx = roleData.value.findIndex(r => r.id === row.id)
  if (idx > -1) {
    roleData.value.splice(idx, 1)
    window.$message?.success('删除成功')
  }
}

function handleSubmit() {
  if (!form.value.name.trim()) {
    window.$message?.warning('请输入角色名称')
    return
  }
  if (isEdit.value && editingId.value !== null) {
    const idx = roleData.value.findIndex(r => r.id === editingId.value)
    if (idx > -1) {
      roleData.value[idx] = { ...roleData.value[idx], ...form.value }
    }
    window.$message?.success('修改成功')
  } else {
    const newId = roleData.value.length > 0 ? Math.max(...roleData.value.map(r => r.id)) + 1 : 1
    roleData.value.push({
      id: newId,
      name: form.value.name,
      desc: form.value.desc,
      status: form.value.status,
      userCount: 0,
      permissions: [],
    })
    window.$message?.success('添加成功')
  }
  showAddModal.value = false
  isEdit.value = false
  editingId.value = null
  form.value = { name: '', desc: '', status: true }
}

// ========== 权限设置 ==========
const selectedRoleId = ref<number | null>(null)
const selectedTerminal = ref('shop')

const terminals = [
  { key: 'shop', label: '店铺系统' },
  { key: 'cashier', label: '收银系统' },
  { key: 'assistant', label: '商家助手' },
]

function createDefaultTerminalPerms(): TerminalPerm[] {
  return [
    {
      key: 'shop',
      label: '店铺系统',
      nodes: [
        {
          key: 'products-module', label: '商品管理', checked: false, expanded: false,
          children: [
            { key: 'single-consumption', label: '单次消费项目', checked: false, expanded: false },
            { key: 'products', label: '实物商品', checked: false, expanded: false },
            { key: 'products-inventory', label: '库存管理', checked: false, expanded: false },
          ]
        },
        {
          key: 'marketing-module', label: '运营管理', checked: false, expanded: false,
          children: [
            { key: 'recharge', label: '充值套餐', checked: false, expanded: false },
            { key: 'packages', label: '套票', checked: false, expanded: false },
            { key: 'coupons', label: '优惠券', checked: false, expanded: false },
            { key: 'promotions', label: '促销', checked: false, expanded: false },
            { key: 'gifts', label: '活动赠送', checked: false, expanded: false },
            { key: 'sms-templates', label: '短信模板', checked: false, expanded: false },
            { key: 'sms', label: '短信服务', checked: false, expanded: false },
          ]
        },
        {
          key: 'members-module', label: '会员管理', checked: false, expanded: false,
          children: [
            { key: 'members', label: '会员列表', checked: false, expanded: false },
            { key: 'member-discount', label: '会员折扣', checked: false, expanded: false },
            { key: 'member-levels', label: '会员级别', checked: false, expanded: false },
            { key: 'member-ranking', label: '消费排行', checked: false, expanded: false },
            { key: 'member-balance', label: '储值变更', checked: false, expanded: false },
            { key: 'member-points-query', label: '游戏币查询', checked: false, expanded: false },
            { key: 'member-points-adjust-log', label: '游戏币有效期', checked: false, expanded: false },
            { key: 'member-prepaid-times-query', label: '预存次数', checked: false, expanded: false },
            { key: 'times-adjust-log', label: '次数有效期', checked: false, expanded: false },
          ]
        },
        {
          key: 'settings-module', label: '系统设置', checked: false, expanded: false,
          children: [
            { key: 'store-list', label: '店铺列表', checked: false, expanded: false },
            { key: 'on-demand-settings', label: '待机画面', checked: false, expanded: false },
            { key: 'devices', label: '设备列表', checked: false, expanded: false },
            { key: 'users', label: '用户列表', checked: false, expanded: false },
            { key: 'roles', label: '角色列表', checked: false, expanded: false },
          ]
        },
      ]
    },
    {
      key: 'cashier',
      label: '收银系统',
      nodes: [
        {
          key: 'cashier-order-module', label: '收银订单', checked: false, expanded: false,
          children: [
            { key: 'cashier-order', label: '收银订单查询', checked: false, expanded: false },
            { key: 'ondemand-order', label: '点播订单', checked: false, expanded: false },
            { key: 'manual-deduct-order', label: '手动扣费', checked: false, expanded: false },
            { key: 'edit-balance-order', label: '修改储值', checked: false, expanded: false },
            { key: 'points-exchange-order', label: '游戏币兑换', checked: false, expanded: false },
            { key: 'gift-order', label: '赠送订单', checked: false, expanded: false },
          ]
        },
        {
          key: 'shifts-module', label: '交接班', checked: false, expanded: false,
          children: [
            { key: 'shifts', label: '交接班记录', checked: false, expanded: false },
          ]
        },
        {
          key: 'cashier-settings-module', label: '收银设置', checked: false, expanded: false,
          children: [
            { key: 'cashier-terminal', label: '收银终端', checked: false, expanded: false },
            { key: 'cashier-settings', label: '支付设置', checked: false, expanded: false },
            { key: 'cashier-receipt', label: '小票设置', checked: false, expanded: false },
          ]
        },
      ]
    },
    {
      key: 'assistant',
      label: '商家助手',
      nodes: [
        {
          key: 'workbench-module', label: '首页', checked: false, expanded: false,
          children: [
            { key: 'workbench', label: '今日概况', checked: false, expanded: false },
            { key: 'workbench-devices', label: '设备监控', checked: false, expanded: false },
            { key: 'workbench-revenue', label: '营收概览', checked: false, expanded: false },
          ]
        },
        {
          key: 'guide-module', label: '导购管理', checked: false, expanded: false,
          children: [
            { key: 'guide-members', label: '会员管理(导购)', checked: false, expanded: false },
            { key: 'guides', label: '导购管理', checked: false, expanded: false },
          ]
        },
        {
          key: 'order-search-module', label: '订单查询', checked: false, expanded: false,
          children: [
            { key: 'order-search', label: '订单查询', checked: false, expanded: false },
          ]
        },
        {
          key: 'report-module', label: '数据报表', checked: false, expanded: false,
          children: [
            { key: 'daily-sales', label: '销售日报', checked: false, expanded: false },
            { key: 'historical-revenue', label: '历史营收', checked: false, expanded: false },
            { key: 'channel-revenue', label: '渠道营收', checked: false, expanded: false },
            { key: 'product-sales', label: '售品报表', checked: false, expanded: false },
            { key: 'account-stats', label: '账户统计', checked: false, expanded: false },
          ]
        },
      ]
    },
  ]
}

const terminalPerms = ref<TerminalPerm[]>(JSON.parse(JSON.stringify(createDefaultTerminalPerms())))

const currentTerminalNodes = computed<PermNode[]>(() => {
  const t = terminalPerms.value.find(x => x.key === selectedTerminal.value)
  return t ? t.nodes : []
})

function applyRolePermissions(role: Role) {
  const perms = role.permissions || []
  const all = perms.includes('*')
  terminalPerms.value.forEach(tp => {
    tp.nodes.forEach(node => {
      node.checked = all || perms.includes(node.key)
      node.children?.forEach(child => {
        child.checked = all || perms.includes(child.key)
      })
    })
  })
}

function openPermission(row: Role) {
  selectedRoleId.value = row.id
  selectedTerminal.value = 'shop'
  applyRolePermissions(row)
  viewMode.value = 'permission'
}

function switchRole(roleId: number) {
  selectedRoleId.value = roleId
  const role = roleData.value.find(r => r.id === roleId)
  if (role) applyRolePermissions(role)
}

function toggleNode(node: PermNode) {
  const checked = node.checked
  if (node.children) {
    node.children.forEach(c => (c.checked = checked))
  }
}

function onChildCheck(node: PermNode, val: boolean) {
  if (node.children) {
    node.checked = node.children.every(c => c.checked)
  }
}

function savePermissions() {
  const role = roleData.value.find(r => r.id === selectedRoleId.value)
  if (!role) return
  const selected: string[] = []
  let allCount = 0
  let checkedCount = 0
  terminalPerms.value.forEach(tp => {
    tp.nodes.forEach(node => {
      allCount++
      if (node.checked) checkedCount++
      node.children?.forEach(child => {
        allCount++
        if (child.checked) {
          checkedCount++
          selected.push(child.key)
        }
      })
      if (node.checked && !node.children?.length) {
        selected.push(node.key)
      }
    })
  })
  role.permissions = checkedCount === allCount ? ['*'] : selected
  window.$message?.success('权限已保存')
  viewMode.value = 'list'
}
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { font-size: 20px; font-weight: 600; color: #333; margin: 0; }
.table-card { border-radius: 12px; }

/* 权限设置页面头部 */
.perm-page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}
.perm-page-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

/* 权限卡片 */
.perm-card {
  border-radius: 12px;
  padding: 0;
}
.perm-layout {
  display: flex;
  height: 520px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

/* 三栏通用 */
.perm-col {
  flex: 0 0 180px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #f0f0f0;
}
.perm-col-wide {
  flex: 1;
  border-right: none;
}
.perm-col-header {
  padding: 14px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}
.perm-col-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}
.perm-col-item {
  padding: 10px 16px;
  font-size: 14px;
  color: #555;
  cursor: pointer;
  transition: all 0.2s;
}
.perm-col-item:hover {
  background: #f5f7fa;
}
.perm-col-item.active {
  color: #409eff;
  background: #ecf5ff;
}

/* 权限树 */
.perm-tree-body {
  padding: 8px 16px;
}
.perm-tree-node {
  margin-bottom: 4px;
}
.perm-tree-header {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 0;
  cursor: pointer;
  user-select: none;
}
.perm-tree-arrow {
  font-size: 14px;
  color: #999;
  transition: transform 0.2s;
}
.perm-tree-children {
  padding-left: 22px;
}
.perm-tree-child {
  padding: 5px 0;
}

/* 底部 */
.perm-footer {
  padding: 16px 0 0;
  border-top: 1px solid #f0f0f0;
  margin-top: 16px;
}
</style>
