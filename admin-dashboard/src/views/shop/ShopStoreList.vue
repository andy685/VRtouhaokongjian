<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>店铺列表</h1>
    </div>

    <n-card class="table-card">
      <n-data-table :columns="columns" :data="storeData" :pagination="pagination" striped size="small" />
    </n-card>

    <!-- 编辑弹窗 -->
    <n-modal v-model:show="showEditModal" preset="card" title="编辑店铺" style="width: 520px;">
      <n-form :model="editForm" label-placement="left" label-width="80px">
        <n-form-item label="店铺名称">
          <n-input v-model:value="editForm.name" />
        </n-form-item>
        <n-form-item label="联系电话">
          <n-input v-model:value="editForm.phone" />
        </n-form-item>
        <n-form-item label="地址">
          <n-input v-model:value="editForm.address" type="textarea" :rows="2" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showEditModal = false">取消</n-button>
          <n-button type="primary" @click="handleEditSubmit">保存</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 注册码弹窗 -->
    <n-modal v-model:show="showCodeModal" preset="card" :title="`自助注册码 - ${currentStore?.name}`" style="width: 420px;">
      <div class="qr-card">
        <div class="qr-header">WELCOME TO FUNIN VR</div>
        <div class="qr-title">扫码注册会员</div>
        <div class="qr-code">
          <div class="qr-placeholder">
            <n-icon :component="QrCodeOutline" size="120" color="#333" />
          </div>
          <div class="qr-store">{{ currentStore?.name }}</div>
        </div>
        <div class="qr-mascot">
          <div class="mascot-circle">🐻</div>
        </div>
        <div class="qr-footer">WELCOME TO FUNIN VR</div>
      </div>
      <div class="qr-download-hint">当前图片仅供预览，为保证打印效果，请直接下载</div>
      <n-button type="primary" block @click="downloadCode">点击下载</n-button>
    </n-modal>

    <!-- 注册规则弹窗 -->
    <n-modal v-model:show="showRulesModal" preset="card" title="注册规则设置" style="width: 560px;">
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
            <span v-if="rulesForm.enableGift" class="form-hint">开启后新注册用户自动获得赠送</span>
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
          <n-form-item label="赠送优惠券">
            <n-select v-model:value="rulesForm.giftCoupon" :options="couponOptions" clearable placeholder="选择优惠券" style="width: 240px;" />
          </n-form-item>
        </template>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showRulesModal = false">取消</n-button>
          <n-button type="primary" @click="handleRulesSubmit">保存</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import {
  NButton, NIcon, NTag, NModal, NForm, NFormItem, NInput,
  NCard, NDataTable, NSpace, NRadioGroup, NRadio, NCheckboxGroup,
  NCheckbox, NSwitch, NInputNumber, NSelect
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { QrCodeOutline } from '@vicons/ionicons5'

const showEditModal = ref(false)
const showCodeModal = ref(false)
const showRulesModal = ref(false)
const currentStore = ref<any>(null)
const editForm = ref({ name: '', phone: '', address: '' })
const pagination = { pageSize: 10 }

const couponOptions = [
  { label: '新人专享券', value: 'coupon1' },
  { label: '9.9元体验券', value: 'coupon2' },
  { label: '会员专享券', value: 'coupon3' },
]

const rulesForm = ref({
  registerMode: 'phone' as 'phone' | 'wechat' | 'both',
  requiredFields: ['name'] as string[],
  enableGift: true,
  giftPoints: 100,
  giftBalance: 0,
  giftCoupon: null as string | null,
})

const columns: DataTableColumns = [
  { title: '编号', key: 'id', width: 80 },
  { title: '店铺', key: 'name', width: 160 },
  { title: '国内店铺', key: 'isDomestic', width: 90, render: (row: any) =>
    h(NTag, { type: 'success', size: 'small' }, { default: () => row.isDomestic ? '是' : '否' })
  },
  { title: '联系电话', key: 'phone', width: 140 },
  { title: '创建时间', key: 'createTime', width: 170 },
  { title: '地址', key: 'address', minWidth: 200, ellipsis: { tooltip: true } },
  { title: '支付业务状态', key: 'payStatus', width: 130, render: (row: any) =>
    h(NTag, { type: row.payStatus === '已开通' ? 'success' : 'warning', size: 'small' },
      { default: () => row.payStatus })
  },
  { title: '状态', key: 'status', width: 80, render: (row: any) =>
    h(NTag, { type: row.status === '启用' ? 'success' : 'default', size: 'small' },
      { default: () => row.status })
  },
  { title: '操作', key: 'actions', width: 200, render: (row: any) =>
    h(NSpace, { size: 8 }, {
      default: () => [
        h(NButton, { size: 'tiny', text: true, type: 'primary', onClick: () => openEdit(row) },
          { default: () => '编辑' }),
        h(NButton, { size: 'tiny', text: true, type: 'info', onClick: () => openCode(row) },
          { default: () => '自助注册码' }),
        h(NButton, { size: 'tiny', text: true, type: 'primary', onClick: () => handleRegisterRules(row) },
          { default: () => '注册规则' }),
      ]
    })
  }
]

const storeData = ref([
  { id: 5324, name: '卓远亚运城店', isDomestic: true, phone: '145878451236955587', createTime: '2022-02-18 14:06:34', address: '广州番禺亚运城1', payStatus: '支付业务未开通', status: '启用', registerCode: 'REG-5324-ABCD' },
  { id: 4415, name: '卓远文桥路店', isDomestic: true, phone: '15972158080', createTime: '2021-04-13 10:19:28', address: '文桥路13号', payStatus: '支付业务未开通', status: '启用', registerCode: 'REG-4415-EFGH' },
  { id: 4005, name: '卓远天河路店', isDomestic: true, phone: '15972158080', createTime: '2020-11-14 14:33:17', address: '大龙街道文桥路13号', payStatus: '支付业务未开通', status: '启用', registerCode: 'REG-4005-IJKL' },
  { id: 3998, name: '卓远白云路店', isDomestic: true, phone: '15972158080', createTime: '2020-11-13 18:24:06', address: '1', payStatus: '支付业务未开通', status: '启用', registerCode: 'REG-3998-MNOP' },
])

function openEdit(row: any) {
  currentStore.value = row
  editForm.value = { name: row.name, phone: row.phone, address: row.address }
  showEditModal.value = true
}

function handleEditSubmit() {
  if (currentStore.value) {
    currentStore.value.name = editForm.value.name
    currentStore.value.phone = editForm.value.phone
    currentStore.value.address = editForm.value.address
  }
  showEditModal.value = false
}

function openCode(row: any) {
  currentStore.value = row
  showCodeModal.value = true
}

function downloadCode() {
  console.log('下载注册码:', currentStore.value?.registerCode)
}

function handleRegisterRules(row: any) {
  currentStore.value = row
  showRulesModal.value = true
}

function handleRulesSubmit() {
  console.log('保存注册规则:', rulesForm.value)
  showRulesModal.value = false
}
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { font-size: 20px; font-weight: 600; color: #333; margin: 0; }
.table-card { border-radius: 12px; }

/* 二维码卡片 */
.qr-card {
  background: linear-gradient(180deg, #e8f4fd 0%, #f0f9ff 100%);
  border-radius: 16px;
  padding: 20px 24px 16px;
  text-align: center;
  position: relative;
  overflow: hidden;
  border: 2px solid #bae6fd;
}
.qr-header, .qr-footer {
  font-size: 10px;
  color: #0ea5e9;
  letter-spacing: 1px;
  font-weight: 600;
}
.qr-title {
  font-size: 22px;
  font-weight: 700;
  color: #0284c7;
  margin: 8px 0 16px;
  letter-spacing: 2px;
}
.qr-code {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin: 0 auto;
  width: 200px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.qr-placeholder {
  width: 168px;
  height: 168px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border-radius: 8px;
}
.qr-store {
  font-size: 13px;
  color: #666;
  margin-top: 10px;
  font-weight: 500;
}
.qr-mascot {
  margin-top: 12px;
}
.mascot-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #38bdf8, #0ea5e9);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}
.qr-download-hint {
  font-size: 12px;
  color: #999;
  text-align: center;
  margin: 12px 0;
}
.form-hint { font-size: 12px; color: #999; }
</style>
