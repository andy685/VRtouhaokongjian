<template>
  <div class="page-container animate-fade-in">
    <div class="page-header"><h1>店铺设置</h1></div>
    
    <!-- Tab切换 -->
    <n-tabs type="line" animated default-value="basic">
      <n-tab-pane name="basic" tab="📋 基本信息">
        <div class="settings-card">
          <div class="form-section">
            <h3>店铺基本信息</h3>
            <n-form label-placement="left" :label-width="100" style="max-width: 600px;">
              <n-form-item label="店铺名称">
                <n-input value="深圳福田旗舰店" />
              </n-form-item>
              <n-form-item label="联系电话">
                <n-input value="0755-88886666" />
              </n-form-item>
              <n-form-item label="店铺地址">
                <n-input value="深圳市福田区XX路XX号" type="textarea" />
              </n-form-item>
              <n-form-item label="营业时间">
                <n-time-picker v-model:value="timeRange" type="daterange" clearable />
              </n-form-item>
            </n-form>
          </div>
          <n-button type="primary">保存修改</n-button>
        </div>
      </n-tab-pane>

      <n-tab-pane name="cashier" tab="💳 收银设置">
        <div class="settings-card">
          <div class="token-section highlight">
            <div class="token-header">
              <span class="token-title">🔑 收销Token配置</span>
              <n-tag type="warning" size="small">重要</n-tag>
            </div>
            <div class="token-body">
              <p class="token-desc">此Token用于连接PC收银系统和小程序，请妥善保管！</p>
              
              <div class="token-display">
                <code>hk_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6</code>
                <n-button size="tiny" secondary>复制</n-button>
                <n-button size="tiny" secondary>显示</n-button>
                <n-button size="tiny" quaternary>重新生成</n-button>
              </div>
              
              <div class="token-steps">
                <h4>使用方法:</h4>
                <ol>
                  <li>点击「复制Token」按钮</li>
                  <li>打开PC收银系统 → 系统设置 → 粘贴Token</li>
                  <li>或在小程序后台配置中填入此Token</li>
                </ol>
              </div>
              
              <div class="token-footer">
                <span>上次更新: 2026-04-20 10:30</span>
                <n-button size="tiny" quaternary>查看操作日志</n-button>
              </div>
            </div>
          </div>
          
          <div class="form-section" style="margin-top: 24px;">
            <h3>收银参数</h3>
            <n-form label-placement="left" :label-width="120" style="max-width: 500px;">
              <n-form-item label="自动打印小票">
                <n-switch :value="true" />
              </n-form-item>
              <n-form-item label="默认支付方式">
                <n-select value="wechat" :options="[{label:'微信支付',value:'wechat'},{label:'支付宝',value:'alipay'}]" />
              </n-form-item>
              <n-form-item label="退款需密码">
                <n-radio-group value="yes">
                  <n-radio value="yes">需要</n-radio>
                  <n-radio value="no">不需要</n-radio>
                </n-radio-group>
              </n-form-item>
            </n-form>
          </div>
          
          <n-button type="primary" style="margin-top: 16px;">保存设置</n-button>
        </div>
      </n-tab-pane>

      <n-tab-pane name="print" tab="🖨️ 打印设置">
        <div class="settings-card" style="padding: 40px; text-align: center;">
          <p style="color: var(--text-muted);">打印机选择 / 小票模板自定义 - 开发中...</p>
        </div>
      </n-tab-pane>

      <n-tab-pane name="notify" tab="🔔 消息通知">
        <div class="settings-card" style="padding: 40px; text-align: center;">
          <p style="color: var(--text-muted);">告警通知 / 营销推送开关 - 开发中...</p>
        </div>
      </n-tab-pane>

      <n-tab-pane name="security" tab="🔒 安全设置">
        <div class="settings-card" style="padding: 40px; text-align: center;">
          <p style="color: var(--text-muted);">操作日志 / IP白名单 / 权限管理 - 开发中...</p>
        </div>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  NButton, NTabs, NTabPane, NForm, NFormItem, NInput,
  NSwitch, NSelect, NRadioGroup, NRadio, NTag, NTimePicker
} from 'naive-ui'

const timeRange = ref(null)
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); }

.settings-card {
  background: white;
  border-radius: 16px;
  padding: 28px;
  border: 1px solid var(--border-color);
}

.form-section { margin-bottom: 20px; }
.form-section h3 { font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 16px; padding-bottom: 10px; border-bottom: 1px solid #f1f5f9; }

/* Token区域 */
.token-section {
  background: linear-gradient(135deg, #fefce8, #fff);
  border: 2px solid #FBBF24;
  border-radius: 14px;
  overflow: hidden;
}

.token-section.highlight {
  animation: pulse-glow 3s infinite;
}

.token-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  background: linear-gradient(135deg, #FEF3C7, #FDE68A);
  border-bottom: 1px solid #FCD34D;
}

.token-title {
  font-size: 15px;
  font-weight: 600;
  color: #92400E;
}

.token-body { padding: 20px; }

.token-desc {
  font-size: 13px;
  color: #B45309;
  margin-bottom: 16px;
}

.token-display {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #1A2332;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.token-display code {
  flex: 1;
  font-family: 'SF Mono', monospace;
  font-size: 13px;
  color: #60A5FA;
  word-break: break-all;
}

.token-steps {
  background: #FFFBEB;
  padding: 14px 18px;
  border-radius: 8px;
  margin-bottom: 14px;
}

.token-steps h4 {
  font-size: 13px;
  color: #92400E;
  margin-bottom: 8px;
}

.token-steps ol {
  margin-left: 18px;
  font-size: 13px;
  color: #78716C;
}
.token-steps li { margin-bottom: 4px; }

.token-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: var(--text-muted);
}
</style>
