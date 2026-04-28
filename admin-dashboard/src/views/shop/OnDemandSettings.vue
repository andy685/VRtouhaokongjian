<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>点播设置</h1>
      <n-select v-model:value="currentShop" :options="shopOptions" size="small" style="width: 200px;" />
    </div>

    <!-- 一、播放控制 -->
    <n-card class="settings-card">
      <template #header>
        <div class="card-title">播放控制</div>
      </template>
      <n-form label-placement="left" label-width="160">
        <n-form-item label="播放模式">
          <n-radio-group v-model:value="settings.playMode">
            <n-space>
              <n-radio value="single">单次播放（播完自动停止）</n-radio>
              <n-radio value="loop">循环播放（结束后自动重播）</n-radio>
              <n-radio value="autoNext">自动续播（播放推荐内容）</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="音量默认设置">
          <n-slider v-model:value="settings.defaultVolume" :min="0" :max="100" style="width: 300px;" />
          <span style="margin-left: 12px; color: #666;">{{ settings.defaultVolume }}%</span>
        </n-form-item>
        <n-form-item label="顾客可调音量">
          <n-switch v-model:value="settings.allowVolumeAdjust" />
        </n-form-item>
        <n-form-item label="中途暂停策略">
          <n-radio-group v-model:value="settings.pausePolicy">
            <n-space>
              <n-radio value="free">自由暂停（不计时）</n-radio>
              <n-radio value="limit">限时暂停（最多5分钟）</n-radio>
              <n-radio value="charge">暂停仍计费</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
      </n-form>
    </n-card>

    <!-- 待机画面 -->
    <n-card class="settings-card">
      <template #header>
        <div class="card-title">待机画面</div>
      </template>
      <n-form label-placement="left" label-width="160">
        <n-form-item label="待机显示内容">
          <n-radio-group v-model:value="settings.idleContent">
            <n-space>
              <n-radio value="poster">店铺宣传海报</n-radio>
              <n-radio value="video">品牌宣传视频</n-radio>
              <n-radio value="gamePreview">热门游戏预览</n-radio>
              <n-radio value="qrCode">扫码关注/注册二维码</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item v-if="settings.idleContent === 'poster'" label="上传海报">
          <n-upload
            action="/api/upload"
            list-type="image-card"
            :max="5"
            v-model:file-list="posterList"
          />
          <span class="form-hint">最多上传5张，待机时轮播展示</span>
        </n-form-item>
        <n-form-item v-if="settings.idleContent === 'video'" label="上传视频">
          <n-space align="center">
            <n-upload
              action="/api/upload"
              accept=".mp4,.mov,.avi,.mkv"
              :max="1"
              v-model:file-list="videoList"
            >
              <n-button type="primary">上传视频</n-button>
            </n-upload>
            <span class="form-hint">支持 mp4 / mov / avi / mkv 格式，待机时循环播放</span>
          </n-space>
        </n-form-item>
        <n-form-item v-if="settings.idleContent === 'gamePreview'" label="上传预览视频">
          <n-space align="center">
            <n-upload
              action="/api/upload"
              accept=".mp4,.mov,.avi,.mkv"
              :max="5"
              v-model:file-list="gamePreviewList"
            >
              <n-button type="primary">上传视频</n-button>
            </n-upload>
            <span class="form-hint">支持 mp4 / mov / avi / mkv 格式，最多5个热门游戏预览</span>
          </n-space>
        </n-form-item>
        <n-form-item label="待机切换时间">
          <n-input-number v-model:value="settings.idleSwitchInterval" :min="5" style="width: 150px;">
            <template #suffix>秒</template>
          </n-input-number>
          <span class="form-hint">无操作时多久进入待机画面</span>
        </n-form-item>
        <n-form-item label="待机背景音乐">
          <n-switch v-model:value="settings.idleMusic" />
          <span class="form-hint">待机时播放轻音乐</span>
        </n-form-item>
      </n-form>
    </n-card>

    <!-- 内容展示 -->
    <n-card class="settings-card">
      <template #header>
        <div class="card-title">内容展示</div>
      </template>
      <n-form label-placement="left" label-width="160">
        <n-form-item label="首页推荐策略">
          <n-radio-group v-model:value="settings.recommendStrategy">
            <n-space>
              <n-radio value="hot">按热度排序</n-radio>
              <n-radio value="new">按上新排序</n-radio>
              <n-radio value="price">按价格排序</n-radio>
              <n-radio value="manual">手动置顶</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="分类显示">
          <n-switch v-model:value="settings.showCategory" />
          <span class="form-hint">顾客端按游戏类型分类展示</span>
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
  NCheckboxGroup, NCheckbox, NSpace, NButton, NSelect, NSlider, NUpload,
  type UploadFileInfo
} from 'naive-ui'

const currentShop = ref('卓远亚运城店')

const shopOptions = [
  { label: '利民街小展厅', value: '利民街小展厅' },
  { label: '卓远萝岗区店', value: '卓远萝岗区店' },
  { label: '卓远萧山区店', value: '卓远萧山区店' },
  { label: '卓远亚运城店', value: '卓远亚运城店' },
  { label: '卓远文鼎路店', value: '卓远文鼎路店' },
]

const posterList = ref<UploadFileInfo[]>([])
const videoList = ref<UploadFileInfo[]>([])
const gamePreviewList = ref<UploadFileInfo[]>([])

const settings = ref({
  // 播放控制
  playMode: 'single' as 'single' | 'loop' | 'autoNext',
  defaultVolume: 70,
  allowVolumeAdjust: true,
  pausePolicy: 'limit' as 'free' | 'limit' | 'charge',

  // 待机画面
  idleContent: 'poster' as 'poster' | 'video' | 'gamePreview' | 'qrCode',
  idleSwitchInterval: 30,
  idleMusic: true,

  // 内容展示
  recommendStrategy: 'hot' as 'hot' | 'new' | 'price' | 'manual',
  showCategory: true,
})

function saveSettings() {
  console.log('保存设置', { shop: currentShop.value, settings: settings.value })
}

function resetSettings() {
  settings.value = {
    playMode: 'single',
    defaultVolume: 70,
    allowVolumeAdjust: true,
    pausePolicy: 'limit',
    idleContent: 'poster',
    idleSwitchInterval: 30,
    idleMusic: true,
    recommendStrategy: 'hot',
    showCategory: true,
  }
  posterList.value = []
  videoList.value = []
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
