<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>待机画面</h1>
      <n-select v-model:value="currentShop" :options="shopOptions" size="small" style="width: 200px;" />
    </div>

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
  NCard, NForm, NFormItem, NInputNumber, NRadioGroup, NRadio,
  NSpace, NButton, NSelect, NUpload,
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
  idleContent: 'gamePreview' as 'gamePreview' | 'poster' | 'qrCode' | 'black',
  idleSwitchInterval: 30,
})

function saveSettings() {
  message.success('待机画面设置已保存')
}

function resetSettings() {
  settings.value = {
    idleContent: 'gamePreview',
    idleSwitchInterval: 30,
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
