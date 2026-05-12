<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>点播设置</h1>
      <n-select v-model:value="currentShop" :options="shopOptions" size="small" style="width: 200px;" />
    </div>

    <!-- 游戏体验控制 -->
    <n-card class="settings-card">
      <template #header>
        <div class="card-title">🎮 游戏体验控制</div>
      </template>
      <n-form label-placement="left" label-width="170">
        <n-form-item label="体验模式">
          <n-radio-group v-model:value="settings.playMode">
            <n-space>
              <n-radio value="single">单次体验（体验结束自动停止）</n-radio>
              <n-radio value="autoNext">自动换玩（结束后推荐其他游戏）</n-radio>
              <n-radio value="unlimited">不限时畅玩（按时段计费）</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="单次体验时长上限">
          <n-input-number v-model:value="settings.maxSessionDuration" :min="5" :max="180" style="width: 150px;">
            <template #suffix>分钟</template>
          </n-input-number>
          <span class="form-hint">超过时长自动弹出续费提示</span>
        </n-form-item>
        <n-form-item label="头显默认音量">
          <n-slider v-model:value="settings.defaultVolume" :min="0" :max="100" style="width: 300px;" />
          <span style="margin-left: 12px; color: #666;">{{ settings.defaultVolume }}%</span>
        </n-form-item>
        <n-form-item label="顾客可调音量">
          <n-switch v-model:value="settings.allowVolumeAdjust" />
        </n-form-item>
        <n-form-item label="游戏中途暂停策略">
          <n-radio-group v-model:value="settings.pausePolicy">
            <n-space>
              <n-radio value="free">自由暂停（不计时）</n-radio>
              <n-radio value="limit">限时暂停（最多5分钟）</n-radio>
              <n-radio value="charge">暂停仍计费</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="游戏启动前确认">
          <n-switch v-model:value="settings.confirmBeforeLaunch" />
          <span class="form-hint">启动游戏前弹出确认弹窗，防止误操作扣费</span>
        </n-form-item>
      </n-form>
    </n-card>

    <!-- 头显参数默认值 -->
    <n-card class="settings-card">
      <template #header>
        <div class="card-title">🥽 头显参数默认值</div>
      </template>
      <n-form label-placement="left" label-width="170">
        <n-form-item label="默认瞳距(IPD)">
          <n-input-number v-model:value="settings.defaultIpd" :min="54" :max="74" style="width: 150px;">
            <template #suffix>mm</template>
          </n-input-number>
          <span class="form-hint">顾客未手动调节时的默认值，范围 54-74mm</span>
        </n-form-item>
        <n-form-item label="默认刷新率">
          <n-radio-group v-model:value="settings.defaultRefreshRate">
            <n-space>
              <n-radio :value="72">72Hz</n-radio>
              <n-radio :value="90">90Hz（推荐）</n-radio>
              <n-radio :value="120">120Hz</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="默认亮度">
          <n-slider v-model:value="settings.defaultBrightness" :min="0" :max="100" style="width: 300px;" />
          <span style="margin-left: 12px; color: #666;">{{ settings.defaultBrightness }}%</span>
        </n-form-item>
        <n-form-item label="允许顾客调节以上参数">
          <n-switch v-model:value="settings.allowUserAdjust" />
          <span class="form-hint">开启后顾客可在启动前自定义IPD/刷新率/亮度</span>
        </n-form-item>
      </n-form>
    </n-card>

    <!-- 游戏推荐与排序 -->
    <n-card class="settings-card">
      <template #header>
        <div class="card-title">🎯 游戏推荐与排序</div>
      </template>
      <n-form label-placement="left" label-width="170">
        <n-form-item label="首页游戏排序策略">
          <n-radio-group v-model:value="settings.recommendStrategy">
            <n-space>
              <n-radio value="hot">按热度排序（体验次数最多）</n-radio>
              <n-radio value="new">按上新排序（最新上线）</n-radio>
              <n-radio value="price">按价格排序</n-radio>
              <n-radio value="manual">手动排序（后台拖拽）</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="按分类展示">
          <n-switch v-model:value="settings.showCategory" />
          <span class="form-hint">顾客端按射击/冒险/休闲等游戏类型分类展示</span>
        </n-form-item>
        <n-form-item label="显示游戏时长">
          <n-switch v-model:value="settings.showDuration" />
          <span class="form-hint">在游戏卡片上展示预估体验时长</span>
        </n-form-item>
        <n-form-item label="显示所需游戏豆">
          <n-switch v-model:value="settings.showGameCoins" />
          <span class="form-hint">在游戏卡片上展示所需游戏豆数量</span>
        </n-form-item>
        <n-form-item label="显示游戏评分">
          <n-switch v-model:value="settings.showScore" />
          <span class="form-hint">在游戏卡片上展示玩家评分</span>
        </n-form-item>
      </n-form>
    </n-card>

    <!-- 待机画面 -->
    <n-card class="settings-card">
      <template #header>
        <div class="card-title">🖥️ 待机画面</div>
      </template>
      <n-form label-placement="left" label-width="170">
        <n-form-item label="待机显示内容">
          <n-radio-group v-model:value="settings.idleContent">
            <n-space vertical>
              <n-radio value="gamePreview">热门游戏预览视频（循环播放）</n-radio>
              <n-radio value="poster">宣传海报轮播</n-radio>
              <n-radio value="qrCode">扫码注册会员二维码</n-radio>
              <n-radio value="black">息屏（节能模式）</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item v-if="settings.idleContent === 'poster'" label="上传宣传海报">
          <n-upload
            action="/api/upload"
            list-type="image-card"
            :max="5"
            v-model:file-list="posterList"
          />
          <span class="form-hint">最多5张，待机时轮播展示，建议尺寸 1920×1080</span>
        </n-form-item>
        <n-form-item v-if="settings.idleContent === 'gamePreview'" label="上传游戏预告片">
          <n-space align="center">
            <n-upload
              action="/api/upload"
              accept=".mp4,.mov"
              :max="5"
              v-model:file-list="gamePreviewList"
            >
              <n-button type="primary">上传视频</n-button>
            </n-upload>
            <span class="form-hint">最多5个热门游戏预告片，待机时循环播放，支持 mp4 格式</span>
          </n-space>
        </n-form-item>
        <n-form-item label="待机超时时间">
          <n-input-number v-model:value="settings.idleSwitchInterval" :min="10" :max="300" style="width: 150px;">
            <template #suffix>秒</template>
          </n-input-number>
          <span class="form-hint">无操作后多久进入待机画面</span>
        </n-form-item>
        <n-form-item label="待机背景音乐">
          <n-switch v-model:value="settings.idleMusic" />
          <span class="form-hint">待机时播放轻音乐</span>
        </n-form-item>
      </n-form>
    </n-card>

    <!-- 保存按钮 -->
    <div class="actions">
      <n-space>
        <n-button @click="resetSettings">重置</n-button>
        <n-button type="primary" @click="saveSettings">保存设置</n-button>
      </n-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  NCard, NForm, NFormItem, NSwitch, NInputNumber, NRadioGroup, NRadio,
  NSpace, NButton, NSelect, NSlider, NUpload,
  type UploadFileInfo, useMessage
} from 'naive-ui'

const message = useMessage()
const currentShop = ref('卓远亚运城店')

const shopOptions = [
  { label: '利民街小展厅', value: '利民街小展厅' },
  { label: '卓远萝岗区店', value: '卓远萝岗区店' },
  { label: '卓远萧山区店', value: '卓远萧山区店' },
  { label: '卓远亚运城店', value: '卓远亚运城店' },
  { label: '卓远文鼎路店', value: '卓远文鼎路店' },
]

const posterList = ref<UploadFileInfo[]>([])
const gamePreviewList = ref<UploadFileInfo[]>([])

const settings = ref({
  // 游戏体验控制
  playMode: 'single' as 'single' | 'autoNext' | 'unlimited',
  maxSessionDuration: 30,
  defaultVolume: 70,
  allowVolumeAdjust: true,
  pausePolicy: 'limit' as 'free' | 'limit' | 'charge',
  confirmBeforeLaunch: true,

  // 头显参数
  defaultIpd: 63,
  defaultRefreshRate: 90,
  defaultBrightness: 80,
  allowUserAdjust: true,

  // 游戏推荐
  recommendStrategy: 'hot' as 'hot' | 'new' | 'price' | 'manual',
  showCategory: true,
  showDuration: true,
  showGameCoins: true,
  showScore: true,

  // 待机画面
  idleContent: 'gamePreview' as 'gamePreview' | 'poster' | 'qrCode' | 'black',
  idleSwitchInterval: 30,
  idleMusic: true,
})

function saveSettings() {
  message.success('点播设置已保存')
}

function resetSettings() {
  settings.value = {
    playMode: 'single',
    maxSessionDuration: 30,
    defaultVolume: 70,
    allowVolumeAdjust: true,
    pausePolicy: 'limit',
    confirmBeforeLaunch: true,
    defaultIpd: 63,
    defaultRefreshRate: 90,
    defaultBrightness: 80,
    allowUserAdjust: true,
    recommendStrategy: 'hot',
    showCategory: true,
    showDuration: true,
    showGameCoins: true,
    showScore: true,
    idleContent: 'gamePreview',
    idleSwitchInterval: 30,
    idleMusic: true,
  }
  posterList.value = []
  gamePreviewList.value = []
}
</script>

<style scoped>
.page-container { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { font-size: 20px; font-weight: 600; color: #333; margin: 0; }
.settings-card { margin-bottom: 20px; border-radius: 12px; }
.card-title { font-size: 16px; font-weight: 600; color: #333; }
.actions { display: flex; justify-content: flex-end; padding: 20px 0; }
.form-hint { margin-left: 12px; color: #999; font-size: 13px; }
</style>
