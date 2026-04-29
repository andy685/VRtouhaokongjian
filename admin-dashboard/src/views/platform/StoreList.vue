<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>店铺列表</h1>
        <p class="header-desc">管理所有已入驻的店铺</p>
      </div>
      <n-space>
        <n-input v-model:value="searchText" placeholder="搜索店铺名称/店长..." size="small" style="width: 220px;">
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
        <n-select v-model:value="filterRegion" placeholder="全部区域" :options="regionOptions" size="small" style="width: 140px;" clearable />
        <n-select v-model:value="filterStatus" placeholder="全部状态" :options="statusOptions" size="small" style="width: 120px;" clearable />
        <n-button type="primary" @click="showAddModal = true">
          <template #icon><n-icon :component="AddOutline" /></template> 新增店铺
        </n-button>
      </n-space>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #2563EB);">
          <n-icon :component="StorefrontOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">总店铺数</span>
          <span class="value">168</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="CheckmarkCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">营业中</span>
          <span class="value">156</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="TimeOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">维护中</span>
          <span class="value warning">1</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
          <n-icon :component="LocationOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">覆盖城市</span>
          <span class="value">32</span>
        </div>
      </div>
    </div>

    <div class="content-card">
      <n-data-table :columns="columns" :data="filteredData" :pagination="pagination" striped />
    </div>

    <!-- 新增店铺弹窗 -->
    <n-modal v-model:show="showAddModal" preset="card" title="新增店铺" style="width: 580px;" :bordered="false">
      <n-form ref="addFormRef" :model="addForm" :rules="addRules" label-placement="left" label-width="100">
        <n-form-item label="店铺名称" path="name">
          <n-input v-model:value="addForm.name" placeholder="请输入店铺名称" />
        </n-form-item>
        <n-form-item label="所属商家" path="merchant">
          <n-select v-model:value="addForm.merchant" :options="merchantOptions" placeholder="请选择所属商家" />
        </n-form-item>
        <n-form-item label="所属区域" path="region">
          <n-select v-model:value="addForm.region" :options="regionOptions" placeholder="请选择区域" />
        </n-form-item>
        <n-form-item label="详细地址" path="address">
          <n-input v-model:value="addForm.address" placeholder="请输入详细地址" />
        </n-form-item>
        <n-form-item label="店长姓名" path="manager">
          <n-input v-model:value="addForm.manager" placeholder="请输入店长姓名" />
        </n-form-item>
        <n-form-item label="联系电话" path="phone">
          <n-input v-model:value="addForm.phone" placeholder="请输入联系电话" />
        </n-form-item>
        <n-form-item label="设备数量" path="deviceCount">
          <n-input-number v-model:value="addForm.deviceCount" :min="1" :max="100" style="width: 100%;" />
        </n-form-item>
        <n-form-item label="店铺状态" path="status">
          <n-radio-group v-model:value="addForm.status">
            <n-radio value="online">营业中</n-radio>
            <n-radio value="offline">已打烊</n-radio>
            <n-radio value="maintain">维护中</n-radio>
          </n-radio-group>
        </n-form-item>
        <n-divider title-placement="left" style="margin: 12px 0;">支付与注册</n-divider>
        <n-form-item label="开通支付">
          <n-switch v-model:value="addForm.enablePay" />
          <span style="margin-left: 8px; font-size: 12px; color: #999;">开启后生成拉卡拉支付码</span>
        </n-form-item>
        <n-form-item label="注册码">
          <n-input :value="addForm.regCode" readonly style="max-width: 240px;" />
          <n-button size="tiny" style="margin-left: 8px;" @click="regenerateCode('add')">重新生成</n-button>
          <span style="margin-left: 8px; font-size: 12px; color: #999;">用户扫码注册为该企业会员</span>
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showAddModal = false">取消</n-button>
          <n-button type="primary" @click="handleAdd">确认新增</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 编辑店铺弹窗 -->
    <n-modal v-model:show="showEditModal" preset="card" title="编辑店铺" style="width: 580px;" :bordered="false">
      <n-form v-if="currentStore" label-placement="left" label-width="100">
        <n-form-item label="店铺名称">
          <n-input v-model:value="editForm.name" />
        </n-form-item>
        <n-form-item label="所属商家">
          <n-select v-model:value="editForm.merchant" :options="merchantOptions" />
        </n-form-item>
        <n-form-item label="所属区域">
          <n-select v-model:value="editForm.region" :options="regionOptions" />
        </n-form-item>
        <n-form-item label="详细地址">
          <n-input v-model:value="editForm.address" />
        </n-form-item>
        <n-form-item label="店长姓名">
          <n-input v-model:value="editForm.manager" />
        </n-form-item>
        <n-form-item label="联系电话">
          <n-input v-model:value="editForm.phone" />
        </n-form-item>
        <n-form-item label="设备数量">
          <n-input-number v-model:value="editForm.deviceCount" :min="1" :max="100" style="width: 100%;" />
        </n-form-item>
        <n-form-item label="店铺状态">
          <n-radio-group v-model:value="editForm.status">
            <n-radio value="online">营业中</n-radio>
            <n-radio value="offline">已打烊</n-radio>
            <n-radio value="maintain">维护中</n-radio>
          </n-radio-group>
        </n-form-item>
        <n-divider title-placement="left" style="margin: 12px 0;">支付与注册</n-divider>
        <n-form-item label="支付业务">
          <n-switch v-model:value="editForm.enablePay" @update:value="onPaySwitchChange" />
          <span style="margin-left: 8px; font-size: 12px; color: #999;">{{ editForm.enablePay ? '已开通' : '未开通' }}</span>
        </n-form-item>
        <n-form-item label="注册码">
          <n-input :value="editForm.regCode" readonly style="max-width: 240px;" />
          <n-button size="tiny" style="margin-left: 8px;" @click="regenerateCode('edit')">重新生成</n-button>
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showEditModal = false">取消</n-button>
          <n-button type="primary" @click="handleEdit">保存</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 详情弹窗 -->
    <n-modal v-model:show="showDetailModal" preset="card" title="店铺详情" style="width: 640px;" :bordered="false">
      <n-descriptions v-if="currentStore" label-placement="left" :column="2" bordered>
        <n-descriptions-item label="店铺名称">{{ currentStore.name }}</n-descriptions-item>
        <n-descriptions-item label="店铺ID">ST{{ String(currentStore.id).padStart(5, '0') }}</n-descriptions-item>
        <n-descriptions-item label="所属商家">{{ currentStore.merchant }}</n-descriptions-item>
        <n-descriptions-item label="所属区域">{{ currentStore.region }}</n-descriptions-item>
        <n-descriptions-item label="详细地址" :span="2">{{ currentStore.address }}</n-descriptions-item>
        <n-descriptions-item label="店长">{{ currentStore.manager }}</n-descriptions-item>
        <n-descriptions-item label="联系电话">{{ currentStore.phone }}</n-descriptions-item>
        <n-descriptions-item label="设备数量">{{ currentStore.devices }} 台</n-descriptions-item>
        <n-descriptions-item label="店铺状态">
          <n-tag :type="currentStore.status === 'online' ? 'success' : currentStore.status === 'maintain' ? 'warning' : 'default'" size="small">
            {{ currentStore.statusText }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="创建时间">{{ currentStore.createdAt }}</n-descriptions-item>
        <n-descriptions-item label="今日营收">{{ currentStore.todayRevenue }}</n-descriptions-item>
        <n-descriptions-item label="本月营收">{{ currentStore.monthRevenue }}</n-descriptions-item>
        <n-descriptions-item label="会员数">{{ currentStore.memberCount }} 人</n-descriptions-item>
      </n-descriptions>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showDetailModal = false">关闭</n-button>
          <n-button type="primary" @click="openEditFromDetail">编辑店铺</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 删除确认 -->
    <n-modal v-model:show="showDeleteModal" preset="card" title="确认删除" style="width: 400px;" :bordered="false">
      <p style="color: #666;">确定要删除店铺「{{ deleteTarget?.name }}」吗？此操作不可恢复。</p>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showDeleteModal = false">取消</n-button>
          <n-button type="error" @click="confirmDelete">确认删除</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 支付码弹窗 -->
    <n-modal v-model:show="showPayCodeModal" preset="card" :title="`拉卡拉支付码 - ${currentStore?.name}`" style="width: 420px;" :bordered="false">
      <div class="qr-card">
        <div class="qr-header">LAKALA PAY</div>
        <div class="qr-title">扫一扫付款</div>
        <div class="qr-code">
          <div class="qr-placeholder">
            <n-icon :component="QrCodeOutline" size="120" color="#333" />
          </div>
          <div class="qr-store">{{ currentStore?.name }}</div>
          <div class="qr-hint">顾客扫码向该店铺付款</div>
        </div>
      </div>
      <n-button type="primary" block style="margin-top: 16px;" @click="downloadPayCode">下载支付码</n-button>
    </n-modal>

    <!-- 注册码弹窗 -->
    <n-modal v-model:show="showRegCodeModal" preset="card" :title="`会员注册码 - ${currentStore?.name}`" style="width: 420px;" :bordered="false">
      <div class="qr-card">
        <div class="qr-header">WELCOME TO FUNIN VR</div>
        <div class="qr-title">扫码注册会员</div>
        <div class="qr-code">
          <div class="qr-placeholder">
            <n-icon :component="QrCodeOutline" size="120" color="#333" />
          </div>
          <div class="qr-store">{{ currentStore?.name }}</div>
          <div class="qr-hint">用户扫码注册为该店铺会员</div>
        </div>
        <div class="qr-reg-code">注册码：{{ currentStore?.regCode }}</div>
      </div>
      <n-button type="primary" block style="margin-top: 16px;" @click="downloadRegCode">下载注册码</n-button>
    </n-modal>

    <!-- 注册规则弹窗 -->
    <n-modal v-model:show="showRegRulesModal" preset="card" title="注册规则设置" style="width: 560px;" :bordered="false">
      <n-form :model="rulesForm" label-placement="left" label-width="120px">
        <n-form-item label="注册方式">
          <n-radio-group v-model:value="rulesForm.registerMode">
            <n-space>
              <n-radio value="phone">手机号注册</n-radio>
              <n-radio value="wechat">微信授权注册</n-radio>
              <n-radio value="both">两者皆可</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="必填信息">
          <n-checkbox-group v-model:value="rulesForm.requiredFields">
            <n-space>
              <n-checkbox value="name">真实姓名</n-checkbox>
              <n-checkbox value="birthday">生日</n-checkbox>
              <n-checkbox value="gender">性别</n-checkbox>
            </n-space>
          </n-checkbox-group>
        </n-form-item>
        <n-form-item label="注册赠送">
          <n-space align="center">
            <n-switch v-model:value="rulesForm.enableGift" />
            <span v-if="rulesForm.enableGift" style="font-size: 12px; color: #999;">开启后新注册用户自动获得赠送</span>
          </n-space>
        </n-form-item>
        <template v-if="rulesForm.enableGift">
          <n-form-item label="赠送游戏币">
            <n-input-number v-model:value="rulesForm.giftPoints" :min="0" style="width: 150px;">
              <template #suffix>分</template>
            </n-input-number>
          </n-form-item>
          <n-form-item label="赠送预存款">
            <n-input-number v-model:value="rulesForm.giftBalance" :min="0" :precision="2" style="width: 150px;">
              <template #suffix>元</template>
            </n-input-number>
          </n-form-item>
        </template>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showRegRulesModal = false">取消</n-button>
          <n-button type="primary" @click="handleRulesSubmit">保存</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  NButton, NDataTable, NTag, NSpace, NInput, NSelect, NModal,
  NForm, NFormItem, NInputNumber, NRadioGroup, NRadio,
  NIcon, NDescriptions, NDescriptionsItem, useMessage,
  type FormInst, type FormRules, NDivider, NSwitch,
  NCheckbox, NCheckboxGroup, NDropdown
} from 'naive-ui'
import {
  SearchOutline, AddOutline, StorefrontOutline, CheckmarkCircleOutline,
  TimeOutline, LocationOutline, CreateOutline, TrashOutline, EyeOutline,
  QrCodeOutline, CloseCircleOutline, TicketOutline, SettingsOutline
} from '@vicons/ionicons5'

const router = useRouter()
const message = useMessage()

const searchText = ref('')
const filterRegion = ref<string | null>(null)
const filterStatus = ref<string | null>(null)

const regionOptions = [
  { label: '深圳', value: '深圳' },
  { label: '广州', value: '广州' },
  { label: '北京', value: '北京' },
  { label: '上海', value: '上海' },
  { label: '成都', value: '成都' },
  { label: '杭州', value: '杭州' },
  { label: '武汉', value: '武汉' },
]

const merchantOptions = [
  { label: '恒然集团', value: '恒然集团' },
  { label: '幻影星空', value: '幻影星空' },
  { label: '利民街商家', value: '利民街商家' },
]

const statusOptions = [
  { label: '营业中', value: 'online' },
  { label: '已打烊', value: 'offline' },
  { label: '维护中', value: 'maintain' },
]

const columns = [
  { title: '店铺名称', key: 'name', width: 170 },
  { title: '所属商家', key: 'merchant', width: 130 },
  { title: '地区', key: 'region', width: 90 },
  {
    title: '店铺状态',
    key: 'status',
    width: 100,
    render(row: any) {
      const typeMap: Record<string, string> = { online: 'success', offline: 'default', maintain: 'warning' }
      return h(NTag, { type: typeMap[row.status] as any, size: 'small', bordered: true }, () => row.statusText)
    }
  },
  { title: '设备数', key: 'devices', width: 80 },
  { title: '店长', key: 'manager', width: 90 },
  { title: '联系电话', key: 'phone', width: 130 },
  {
    title: '支付业务',
    key: 'payStatus',
    width: 110,
    render(row: any) {
      return h(NTag, {
        type: row.payStatus === '已开通' ? 'success' : 'warning',
        size: 'small',
        bordered: true,
      }, () => row.payStatus)
    }
  },
  { title: '今日营收', key: 'todayRevenue', width: 110 },
  { title: '会员数', key: 'memberCount', width: 90 },
  { title: '创建时间', key: 'createdAt', width: 120 },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    fixed: 'right',
    render(row: any) {
      const isPayEnabled = row.payStatus === '已开通'
      const moreOptions = [
        {
          label: isPayEnabled ? '关闭知付' : '开通知付',
          key: 'pay',
          icon: () => h(NIcon, null, { default: () => h(isPayEnabled ? CloseCircleOutline : CheckmarkCircleOutline) }),
          props: { onClick: () => togglePayStatus(row) }
        },
        {
          label: '支付码',
          key: 'payCode',
          disabled: !isPayEnabled,
          icon: () => h(NIcon, null, { default: () => h(QrCodeOutline) }),
          props: { onClick: () => openPayCode(row) }
        },
        {
          label: '注册码',
          key: 'regCode',
          icon: () => h(NIcon, null, { default: () => h(TicketOutline) }),
          props: { onClick: () => openRegCode(row) }
        },
        {
          label: '注册规则',
          key: 'regRules',
          icon: () => h(NIcon, null, { default: () => h(SettingsOutline) }),
          props: { onClick: () => openRegRules(row) }
        },
        { type: 'divider' as const },
        {
          label: '删除',
          key: 'delete',
          icon: () => h(NIcon, null, { default: () => h(TrashOutline) }),
          props: {
            onClick: () => handleDelete(row),
            style: 'color: #d03050;'
          }
        }
      ]
      return h(NSpace, { size: 4, align: 'center', justify: 'center' }, {
        default: () => [
          h(NButton, {
            size: 'tiny', quaternary: true, type: 'info',
            onClick: () => openDetail(row)
          }, () => '详情'),
          h(NButton, {
            size: 'tiny', quaternary: true, type: 'primary',
            onClick: () => openEdit(row)
          }, () => '编辑'),
          h(NDropdown, {
            options: moreOptions,
            trigger: 'click',
            placement: 'bottom-end'
          }, {
            default: () => h(NButton, {
              size: 'tiny', quaternary: true,
              onClick: (e: MouseEvent) => e.stopPropagation()
            }, () => '更多')
          })
        ]
      })
    }
  },
]

const storeData = ref([
  { id: 1, name: '深圳福田旗舰店', merchant: '恒然集团', region: '深圳', address: '深圳市福田区华强北路101号', status: 'online', statusText: '营业中', devices: 12, manager: '张三', phone: '13800138001', todayRevenue: '¥15,680', monthRevenue: '¥356,800', memberCount: 1280, createdAt: '2024-01-15', payStatus: '已开通', regCode: 'REG-0001-3F7A', regRules: { registerMode: 'phone', requiredFields: ['name'], enableGift: true, giftPoints: 100, giftBalance: 0 } },
  { id: 2, name: '南山科技园店', merchant: '恒然集团', region: '深圳', address: '深圳市南山区科技园南路88号', status: 'online', statusText: '营业中', devices: 8, manager: '李四', phone: '13800138002', todayRevenue: '¥9,240', monthRevenue: '¥198,500', memberCount: 856, createdAt: '2024-02-20', payStatus: '已开通', regCode: 'REG-0002-8B2C', regRules: { registerMode: 'phone', requiredFields: ['name'], enableGift: false, giftPoints: 0, giftBalance: 0 } },
  { id: 3, name: '广州天河店', merchant: '幻影星空', region: '广州', address: '广州市天河区天河路368号', status: 'online', statusText: '营业中', devices: 16, manager: '王五', phone: '13800138003', todayRevenue: '¥21,350', monthRevenue: '¥462,100', memberCount: 1520, createdAt: '2024-03-05', payStatus: '已开通', regCode: 'REG-0003-1D9E', regRules: { registerMode: 'both', requiredFields: ['name', 'birthday'], enableGift: true, giftPoints: 200, giftBalance: 5 } },
  { id: 4, name: '北京朝阳店', merchant: '利民街商家', region: '北京', address: '北京市朝阳区建国路88号', status: 'offline', statusText: '已打烊', devices: 14, manager: '赵六', phone: '13800138004', todayRevenue: '¥0', monthRevenue: '¥389,200', memberCount: 1100, createdAt: '2024-03-18', payStatus: '未开通', regCode: 'REG-0004-5A0F', regRules: { registerMode: 'phone', requiredFields: ['name'], enableGift: false, giftPoints: 0, giftBalance: 0 } },
  { id: 5, name: '上海浦东店', merchant: '幻影星空', region: '上海', address: '上海市浦东新区陆家嘴环路1000号', status: 'online', statusText: '营业中', devices: 20, manager: '孙七', phone: '13800138005', todayRevenue: '¥26,800', monthRevenue: '¥578,900', memberCount: 1890, createdAt: '2024-04-01', payStatus: '已开通', regCode: 'REG-0005-7C3D', regRules: { registerMode: 'phone', requiredFields: ['name'], enableGift: true, giftPoints: 100, giftBalance: 0 } },
  { id: 6, name: '成都太古里店', merchant: '恒然集团', region: '成都', address: '成都市锦江区中纱帽街8号', status: 'online', statusText: '营业中', devices: 10, manager: '周八', phone: '13800138006', todayRevenue: '¥11,200', monthRevenue: '¥245,600', memberCount: 920, createdAt: '2024-04-15', payStatus: '未开通', regCode: 'REG-0006-2E6B', regRules: { registerMode: 'phone', requiredFields: ['name'], enableGift: false, giftPoints: 0, giftBalance: 0 } },
  { id: 7, name: '杭州西湖店', merchant: '利民街商家', region: '杭州', address: '杭州市西湖区南山路15号', status: 'maintain', statusText: '维护中', devices: 8, manager: '吴九', phone: '13800138007', todayRevenue: '¥0', monthRevenue: '¥168,300', memberCount: 680, createdAt: '2024-05-01', payStatus: '未开通', regCode: 'REG-0007-9F1A', regRules: { registerMode: 'wechat', requiredFields: [], enableGift: false, giftPoints: 0, giftBalance: 0 } },
  { id: 8, name: '武汉光谷店', merchant: '幻影星空', region: '武汉', address: '武汉市洪山区光谷步行街1号', status: 'online', statusText: '营业中', devices: 11, manager: '郑十', phone: '13800138008', todayRevenue: '¥13,500', monthRevenue: '¥298,700', memberCount: 1050, createdAt: '2024-05-20', payStatus: '已开通', regCode: 'REG-0008-4D8C', regRules: { registerMode: 'both', requiredFields: ['name'], enableGift: true, giftPoints: 150, giftBalance: 0 } },
])

/** 生成注册码 REG-XXXX-XXXX */
function generateRegCode(id: number): string {
  const hex = Math.random().toString(16).slice(2, 6).toUpperCase()
  return `REG-${String(id).padStart(4, '0')}-${hex}`
}

const pagination = { pageSize: 10 }

const filteredData = computed(() => {
  let data = [...storeData.value]
  if (searchText.value) {
    const kw = searchText.value.toLowerCase()
    data = data.filter(d =>
      d.name.toLowerCase().includes(kw) ||
      d.merchant.toLowerCase().includes(kw) ||
      d.manager.toLowerCase().includes(kw) ||
      d.phone.includes(kw)
    )
  }
  if (filterRegion.value) {
    data = data.filter(d => d.region === filterRegion.value)
  }
  if (filterStatus.value) {
    data = data.filter(d => d.status === filterStatus.value)
  }
  return data
})

// 新增
const showAddModal = ref(false)
watch(showAddModal, (val) => { if (val) onAddModalOpen() })
const addFormRef = ref<FormInst | null>(null)
const addForm = ref({ name: '', merchant: '', region: '', address: '', manager: '', phone: '', deviceCount: 1, status: 'online', enablePay: false, regCode: '' })
const addRules: FormRules = {
  name: { required: true, message: '请输入店铺名称', trigger: 'blur' },
  merchant: { required: true, message: '请选择所属商家', trigger: 'change' },
  region: { required: true, message: '请选择区域', trigger: 'change' },
  manager: { required: true, message: '请输入店长姓名', trigger: 'blur' },
  phone: { required: true, message: '请输入联系电话', trigger: 'blur' },
}

/** 弹窗打开时自动生成注册码 */
function onAddModalOpen() {
  addForm.value.regCode = generateRegCode(Math.floor(Math.random() * 9000) + 1000)
}

function handleAdd() {
  addFormRef.value?.validate((errors) => {
    if (errors) return
    const statusMap: Record<string, string> = { online: '营业中', offline: '已打烊', maintain: '维护中' }
    const newId = Date.now()
    storeData.value.unshift({
      id: newId,
      name: addForm.value.name,
      merchant: addForm.value.merchant,
      region: addForm.value.region,
      address: addForm.value.address,
      status: addForm.value.status,
      statusText: statusMap[addForm.value.status],
      devices: addForm.value.deviceCount,
      manager: addForm.value.manager,
      phone: addForm.value.phone,
      todayRevenue: '¥0',
      monthRevenue: '¥0',
      memberCount: 0,
      createdAt: new Date().toISOString().slice(0, 10),
      payStatus: addForm.value.enablePay ? '已开通' : '未开通',
      regCode: addForm.value.regCode,
      regRules: { registerMode: 'phone', requiredFields: ['name'], enableGift: false, giftPoints: 0, giftBalance: 0 },
    })
    message.success('店铺新增成功')
    showAddModal.value = false
    addForm.value = { name: '', merchant: '', region: '', address: '', manager: '', phone: '', deviceCount: 1, status: 'online', enablePay: false, regCode: '' }
  })
}

// 编辑
const showEditModal = ref(false)
const currentStore = ref<any>(null)
const editForm = ref({ name: '', merchant: '', region: '', address: '', manager: '', phone: '', deviceCount: 1, status: 'online', enablePay: false, regCode: '' })

function openEdit(row: any) {
  currentStore.value = row
  editForm.value = {
    name: row.name, merchant: row.merchant || '', region: row.region || '',
    address: row.address || '', manager: row.manager || '', phone: row.phone || '',
    deviceCount: row.devices, status: row.status,
    enablePay: row.payStatus === '已开通', regCode: row.regCode || '',
  }
  showEditModal.value = true
}

function handleEdit() {
  const statusMap: Record<string, string> = { online: '营业中', offline: '已打烊', maintain: '维护中' }
  const idx = storeData.value.findIndex(d => d.id === currentStore.value.id)
  if (idx !== -1) {
    const s = storeData.value[idx]
    Object.assign(s, {
      name: editForm.value.name, merchant: editForm.value.merchant, region: editForm.value.region,
      address: editForm.value.address, manager: editForm.value.manager, phone: editForm.value.phone,
      devices: editForm.value.deviceCount, status: editForm.value.status,
      statusText: statusMap[editForm.value.status],
      payStatus: editForm.value.enablePay ? '已开通' : '未开通',
      regCode: editForm.value.regCode,
    })
    message.success('店铺信息已更新')
  }
  showEditModal.value = false
}

// 支付业务开关
function togglePayStatus(row: any) {
  const newStatus = row.payStatus === '已开通' ? '未开通' : '已开通'
  row.payStatus = newStatus
  message.success(`已${newStatus === '已开通' ? '开通' : '关闭'}「${row.name}」的支付业务`)
}

// 支付码弹窗
const showPayCodeModal = ref(false)
function openPayCode(row: any) {
  currentStore.value = row; showPayCodeModal.value = true
}
function downloadPayCode() {
  message.success('支付码已下载')
}

// 注册码弹窗
const showRegCodeModal = ref(false)
function openRegCode(row: any) {
  currentStore.value = row; showRegCodeModal.value = true
}
function regenerateCode(mode: 'add' | 'edit') {
  const code = generateRegCode(Math.floor(Math.random() * 9000) + 1000)
  if (mode === 'add') addForm.value.regCode = code
  else editForm.value.regCode = code
  message.success('注册码已重新生成')
}
function downloadRegCode() {
  message.success('注册码已下载')
}

// 注册规则弹窗
const showRegRulesModal = ref(false)
const rulesForm = ref({
  registerMode: 'phone' as 'phone' | 'wechat' | 'both',
  requiredFields: ['name'] as string[],
  enableGift: false,
  giftPoints: 0,
  giftBalance: 0,
})
const couponOptions = [
  { label: '新人专享券', value: 'coupon1' },
  { label: '9.9元体验券', value: 'coupon2' },
]
function openRegRules(row: any) {
  currentStore.value = row
  const r = row.regRules || { registerMode: 'phone', requiredFields: ['name'], enableGift: false, giftPoints: 0, giftBalance: 0 }
  rulesForm.value = { ...r }
  showRegRulesModal.value = true
}
function onPaySwitchChange(val: boolean) {
  if (!val) return
  message.info('支付业务开通后，请前往「支付码」下载拉卡拉收款码')
}
function handleRulesSubmit() {
  if (currentStore.value) {
    currentStore.value.regRules = { ...rulesForm.value }
    message.success('注册规则已保存')
  }
  showRegRulesModal.value = false
}

// 详情
const showDetailModal = ref(false)

function openDetail(row: any) {
  currentStore.value = row
  showDetailModal.value = true
}

function openEditFromDetail() {
  showDetailModal.value = false
  openEdit(currentStore.value)
}

// 删除
const showDeleteModal = ref(false)
const deleteTarget = ref<any>(null)

function handleDelete(row: any) {
  deleteTarget.value = row
  showDeleteModal.value = true
}

function confirmDelete() {
  if (deleteTarget.value) {
    storeData.value = storeData.value.filter(d => d.id !== deleteTarget.value.id)
    message.success('店铺已删除')
  }
  showDeleteModal.value = false
}
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.header-desc { font-size: 13px; color: var(--text-muted); margin-top: 4px; display: block; }

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: white; border-radius: 14px; padding: 20px; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 16px; }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-content { display: flex; flex-direction: column; }
.stat-content .label { font-size: 12px; color: var(--text-muted); }
.stat-content .value { font-family: 'Orbitron', sans-serif; font-size: 22px; font-weight: 700; color: var(--text-primary); }
.stat-content .value.warning { color: #F59E0B; }

.content-card { background: white; border-radius: 16px; padding: 24px; border: 1px solid var(--border-color); }

/* 二维码弹窗卡片 */
.qr-card {
  background: linear-gradient(180deg, #e8f4fd 0%, #f0f9ff 100%);
  border-radius: 16px; padding: 20px 24px 16px; text-align: center;
  position: relative; overflow: hidden; border: 2px solid #bae6fd;
}
.qr-header { font-size: 10px; color: #0ea5e9; letter-spacing: 1px; font-weight: 600; }
.qr-title { font-size: 22px; font-weight: 700; color: #0284c7; margin: 8px 0 16px; letter-spacing: 2px; }
.qr-code { background: #fff; border-radius: 12px; padding: 16px; margin: 0 auto; width: 200px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.qr-placeholder { width: 168px; height: 168px; margin: 0 auto; display: flex; align-items: center; justify-content: center; background: #f8fafc; border-radius: 8px; }
.qr-store { font-size: 13px; color: #666; margin-top: 10px; font-weight: 500; }
.qr-hint { font-size: 11px; color: #999; margin-top: 6px; }
.qr-reg-code { font-size: 13px; color: #333; margin-top: 12px; font-weight: 600; letter-spacing: 1px; }
</style>
