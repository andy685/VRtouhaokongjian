<template>
  <div class="page-container">
    <div class="page-header">
      <h1>安全设置</h1>
      <p class="header-desc">管理密码、登录设备和安全选项</p>
    </div>

    <div class="security-card">
      <!-- 密码管理 -->
      <div class="security-section">
        <h3 class="section-title">登录密码</h3>
        <div class="security-item">
          <div class="item-content">
            <h4>修改登录密码</h4>
            <p>建议定期更换密码，使用大小写字母+数字+特殊字符组合，长度不少于 8 位</p>
          </div>
          <n-button type="primary" size="small" @click="showPwdModal = true">修改密码</n-button>
        </div>
      </div>

      <!-- 登录设备管理 -->
      <div class="security-section">
        <h3 class="section-title">登录设备 <n-tag size="tiny" :bordered="false" type="info">{{ devices.length }} 台</n-tag></h3>
        <div class="device-list">
          <div v-for="(d, i) in devices" :key="i" class="device-item">
            <div class="device-info">
              <div class="device-type">
                <n-icon :component="d.icon" size="22" />
                <span>{{ d.name }}</span>
                <n-tag v-if="d.current" type="success" size="tiny" :bordered="false">当前设备</n-tag>
              </div>
              <div class="device-details">
                <p>{{ d.browser }} · IP: {{ d.ip }}</p>
                <p>最后活跃: {{ d.lastActive }}</p>
                <p>{{ d.location }}</p>
              </div>
            </div>
            <div class="device-actions">
              <n-button v-if="!d.current" type="error" size="small" quaternary @click="kickDevice(i)">下线</n-button>
              <span v-else class="current-badge">正在使用</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 登录日志 -->
      <div class="security-section">
        <h3 class="section-title">近期登录记录</h3>
        <n-data-table
          :columns="logColumns"
          :data="loginLogs"
          :bordered="false"
          size="small"
          :pagination="{ pageSize: 8 }"
          striped
        />
      </div>
    </div>

    <!-- 修改密码弹窗 -->
    <n-modal v-model:show="showPwdModal" preset="card" title="修改登录密码" style="width: 420px;" :bordered="false">
      <n-form label-placement="top" style="margin-top: 16px;">
        <n-form-item label="当前密码">
          <n-input type="password" v-model:value="pwdForm.old" placeholder="请输入当前密码" show-password-on="click" />
        </n-form-item>
        <n-form-item label="新密码">
          <n-input type="password" v-model:value="pwdForm.newVal" placeholder="至少 8 位，含字母和数字" show-password-on="click" />
        </n-form-item>
        <n-form-item label="确认新密码">
          <n-input type="password" v-model:value="pwdForm.confirm" placeholder="再次输入新密码" show-password-on="click" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showPwdModal = false">取消</n-button>
          <n-button type="primary" @click="changePassword">确认修改</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { NIcon, NButton, NDataTable, NTag, NModal, NForm, NFormItem, NInput, NSpace, useMessage, type DataTableColumns } from 'naive-ui'
import { LaptopOutline, PhonePortraitOutline, DesktopOutline } from '@vicons/ionicons5'

const message = useMessage()
const showPwdModal = ref(false)
const pwdForm = ref({ old: '', newVal: '', confirm: '' })

interface Device { name: string; browser: string; ip: string; location: string; lastActive: string; current: boolean; icon: any }

const devices = ref<Device[]>([
  { name: 'MacBook Pro', browser: 'Chrome 126', ip: '192.168.1.*', location: '广东深圳', lastActive: '刚刚', current: true, icon: LaptopOutline },
  { name: 'iPhone 16 Pro', browser: 'Safari 18', ip: '10.0.0.*', location: '广东深圳', lastActive: '2 小时前', current: false, icon: PhonePortraitOutline },
  { name: 'Windows PC', browser: 'Edge 125', ip: '120.86.*.*', location: '四川成都', lastActive: '昨天 14:30', current: false, icon: DesktopOutline },
])

interface LogItem { time: string; device: string; ip: string; location: string; status: string; result: string }
const loginLogs = ref<LogItem[]>([
  { time: '2026-04-29 23:20:15', device: 'MacBook Pro / Chrome', ip: '192.168.1.*', location: '广东深圳', status: '成功', result: '正常登录' },
  { time: '2026-04-29 21:05:33', device: 'iPhone 16 Pro / Safari', ip: '10.0.0.*', location: '广东深圳', status: '成功', result: '正常登录' },
  { time: '2026-04-29 14:30:00', device: 'MacBook Pro / Chrome', ip: '192.168.1.*', location: '广东深圳', status: '成功', result: '自动登录' },
  { time: '2026-04-28 18:12:44', device: 'Windows PC / Edge', ip: '120.86.*.*', location: '四川成都', status: '成功', result: '异地登录' },
  { time: '2026-04-28 09:45:11', device: 'MacBook Pro / Chrome', ip: '192.168.1.*', location: '广东深圳', status: '失败', result: '密码错误' },
  { time: '2026-04-28 09:44:32', device: 'MacBook Pro / Chrome', ip: '192.168.1.*', location: '广东深圳', status: '失败', result: '密码错误' },
  { time: '2026-04-27 17:20:08', device: 'MacBook Pro / Chrome', ip: '192.168.1.*', location: '广东深圳', status: '成功', result: '正常登录' },
  { time: '2026-04-27 10:00:00', device: 'MacBook Pro / Chrome', ip: '103.24.*.*', location: '未知境外', status: '失败', result: '已拦截' },
])

const logColumns: DataTableColumns<LogItem> = [
  { title: '时间', key: 'time', width: 170 },
  { title: '设备', key: 'device', ellipsis: { tooltip: true } },
  { title: 'IP', key: 'ip', width: 130 },
  { title: '地点', key: 'location', width: 100 },
  {
    title: '结果', key: 'status', width: 70,
    render(row) {
      return row.status === '成功'
        ? h(NTag, { size: 'small', type: 'success', bordered: false }, () => '成功')
        : h(NTag, { size: 'small', type: 'error', bordered: false }, () => '失败')
    }
  },
  { title: '备注', key: 'result', ellipsis: { tooltip: true } },
]

function kickDevice(idx: number) {
  devices.value.splice(idx, 1)
  message.success('已强制下线该设备')
}
function changePassword() {
  if (!pwdForm.value.old || !pwdForm.value.newVal || !pwdForm.value.confirm) {
    message.warning('请填写完整信息')
    return
  }
  if (pwdForm.value.newVal !== pwdForm.value.confirm) {
    message.error('两次输入的新密码不一致')
    return
  }
  showPwdModal.value = false
  message.success('密码修改成功，请重新登录')
  // 实际应触发重新登录
}
</script>

<style scoped>
.page-container { padding: 24px; background: var(--color-bg-base); min-height: calc(100vh - 64px); }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0 0 4px; }
.header-desc { font-size: 14px; color: var(--text-muted); margin: 0; }

.security-card { background: white; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); overflow: hidden; }

.security-section {
  padding: 24px 28px;
  border-bottom: 1px solid rgba(0,0,0,0.06);
}
.security-section:last-child { border-bottom: none; }

.section-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 15px; font-weight: 600; color: var(--text-primary);
  margin: 0 0 16px;
}

.security-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 18px; background: var(--color-bg-elevated, #f8f9fa); border-radius: 10px;
}
.item-content h4 { font-size: 14px; font-weight: 600; color: var(--text-primary); margin: 0 0 4px; }
.item-content p { font-size: 12px; color: var(--text-muted); margin: 0; }

.device-list { display: flex; flex-direction: column; gap: 10px; }
.device-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px; background: var(--color-bg-elevated, #f8f9fa); border-radius: 10px;
}
.device-info { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 0; }
.device-type { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 13px; color: var(--text-primary); }
.device-details p { font-size: 12px; color: var(--text-muted); margin: 2px 0; }
.device-actions { flex-shrink: 0; margin-left: 16px; }
.current-badge { font-size: 12px; color: #10B981; font-weight: 500; padding: 4px 0; }
</style>
