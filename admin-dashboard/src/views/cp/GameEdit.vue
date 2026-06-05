<template>
  <div class="page-root">
    <!-- 顶部操作栏 -->
    <header class="top-bar">
      <div class="top-bar-left">
        <n-button quaternary circle size="medium" @click="$router.push('/cp/games')">
          <template #icon><n-icon><ArrowBackOutline /></n-icon></template>
        </n-button>
        <n-breadcrumb>
          <n-breadcrumb-item @click="$router.push('/cp/games')">我的游戏</n-breadcrumb-item>
          <n-breadcrumb-item>{{ pageTitle }}</n-breadcrumb-item>
        </n-breadcrumb>
        <n-tag v-if="isUpdate" type="warning" size="small" :bordered="false">更新审核</n-tag>
      </div>
      <n-space>
        <n-button secondary @click="$router.push('/cp/games')">取消</n-button>
        <n-button type="primary" secondary @click="saveDraft">保存草稿</n-button>
        <n-button type="primary" @click="submitForReview">提交审核</n-button>
      </n-space>
    </header>

    <!-- 主体双栏 -->
    <div class="main-grid">
      <!-- 左栏：媒体区 -->
      <div class="left-col">
        <!-- 视频卡片 -->
        <section class="card video-card">
          <div class="video-stage" style="background: linear-gradient(135deg, #667eea, #764ba2)">
            <template v-if="!isPlaying">
              <img v-if="form.videoCover" :src="form.videoCover" class="video-poster" />
              <div class="play-mask" @click="togglePlay">
                <div class="play-btn-circle">
                  <n-icon size="32" color="#fff"><PlayOutline /></n-icon>
                </div>
                <span class="play-label">播放演示视频</span>
              </div>
            </template>
            <template v-else>
              <div class="video-stage-placeholder">
                <n-icon size="40" color="rgba(255,255,255,.5)"><VideocamOutline /></n-icon>
                <span>视频播放中...</span>
                <n-button size="tiny" ghost style="color:#fff" @click="togglePlay">暂停</n-button>
              </div>
            </template>
          </div>
          <div class="video-progress-bar">
            <n-slider v-model:value="videoProgress" :step="0.01" :tooltip="false" size="small" />
          </div>
          <div class="video-upload-row">
            <span class="file-name">{{ form.videoName || '未上传宣传视频' }}</span>
            <n-upload accept="video/*" :show-file-list="false" @before-upload="handleVideoUpload">
              <n-button size="small" type="primary" secondary strong>
                <template #icon><n-icon :component="VideocamOutline" /></template>
                {{ form.videoUrl ? '更换' : '上传视频' }}
              </n-button>
            </n-upload>
          </div>
        </section>

        <!-- 游戏封面 -->
        <section class="card asset-card">
          <div class="card-head"><h4>游戏封面</h4></div>
          <div class="asset-single">
            <div class="asset-icon-area">
              <n-upload accept="image/*" :show-file-list="false" :max="1" @before-upload="handleIconUpload">
                <img v-if="form.coverUrl" :src="form.coverUrl" class="cover-preview" />
                <div v-else class="icon-placeholder">
                  <n-icon size="22" color="#aaa"><ImageOutline /></n-icon>
                  <span>上传封面</span>
                </div>
              </n-upload>
              <n-button v-if="form.coverUrl" size="tiny" quaternary type="error" @click="removeCover">删除</n-button>
            </div>
            <span class="asset-hint">300×400 PNG/JPG ≤5MB</span>
          </div>
        </section>

        <!-- 展位图 -->
        <section class="card asset-card">
          <div class="card-head"><h4>展位图</h4></div>
          <div class="banner-section">
            <div class="banner-grid">
              <div v-for="(banner, i) in form.bannerList" :key="i" class="banner-thumb">
                <img :src="banner.url" />
                <n-button size="tiny" quaternary type="error" class="banner-del" @click="removeBanner(i)">×</n-button>
              </div>
              <div class="banner-add-placeholder">
                <n-upload accept="image/*" :show-file-list="false" :max="1" @before-upload="handleBannerUpload" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">
                  <div style="display:flex;align-items:center;justify-content:center;gap:6px;">
                    <n-icon size="20" color="#aaa"><ImageOutline /></n-icon>
                    <span style="font-size:10px;color:#999;">上传展位图</span>
                  </div>
                </n-upload>
              </div>
            </div>
            <span class="asset-hint">推荐尺寸 1600×900，PNG/JPG ≤5MB，支持多张</span>
          </div>
        </section>

        <!-- 游戏资源包 -->
        <section class="card asset-card">
          <div class="card-head"><h4>游戏资源包</h4></div>
          <div class="asset-single">
            <n-upload accept=".zip,.apk,.obb,.rar,.7z" :show-file-list="false" :max="1" @before-upload="handlePackageUpload">
              <n-button size="small" type="primary" secondary block strong>
                <template #icon><n-icon :component="FolderOutline" /></template>
                {{ form.packageName || '上传资源包' }}
              </n-button>
            </n-upload>
            <div v-if="form.packageName" class="package-meta">
              <span>{{ form.packageName }}</span>
              <span class="package-size">{{ form.packageSize }}</span>
              <n-button size="tiny" quaternary type="error" @click="removePackage">删除</n-button>
            </div>
            <span class="asset-hint">.zip/.apk/.obb/.rar/.7z ≤2GB</span>
          </div>
        </section>
      </div>

      <!-- 右栏：表单区 -->
      <div class="right-col">
        <!-- 基本信息 -->
        <section class="card form-card">
          <div class="card-head"><h4>基本信息</h4></div>
          <div class="form-body">
            <div class="form-group">
              <label>游戏名称</label>
              <n-input v-model:value="form.name" placeholder="请输入游戏名称" size="large" />
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label>游戏题材</label>
                <n-select v-model:value="form.category" :options="categoryOptions" placeholder="选择游戏题材" />
              </div>
              <div class="form-group">
                <label>当前版本</label>
                <n-input v-model:value="form.version" placeholder="如：v1.0.0" />
              </div>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label>游戏大小</label>
                <n-input v-model:value="form.size" placeholder="如：256M / 2G" />
              </div>
              <div class="form-group">
                <label>游戏时长</label>
                <n-input-number v-model:value="form.duration" :min="1" :max="180" style="width:100%">
                  <template #suffix>分钟</template>
                </n-input-number>
              </div>
            </div>
            <div class="form-group">
              <label>标签</label>
              <div class="inline-items">
                <n-dynamic-tags v-model:value="form.tags" :render-tag="renderTag" />
                <n-select v-if="showTagSelect" v-model:value="selectedTag" :options="tagOptions" placeholder="选择标签" filterable size="small" style="width:130px" @update:value="addTagFromSelect" />
                <n-button v-else size="small" dashed @click="showTagSelect = true">+ 添加</n-button>
              </div>
            </div>
          </div>
        </section>

        <!-- 游戏简介 -->
        <section class="card form-card">
          <div class="card-head"><h4>游戏简介</h4></div>
          <div class="form-body">
            <n-input v-model:value="form.description" type="textarea" :rows="5" placeholder="介绍游戏玩法、特色内容..." />

            <!-- 游戏介绍长图上传 -->
            <div class="long-image-section">
            <label class="long-image-label">游戏介绍长图</label>
            <n-upload accept="image/*" :show-file-list="false" @before-upload="handleLongImageUpload">
              <div v-if="form.longImageUrl" class="long-image-preview-wrapper">
                <img :src="form.longImageUrl" class="long-image-preview" />
                <div class="long-image-overlay">
                  <n-icon size="20" color="#fff"><ImageOutline /></n-icon>
                  <span>点击更换长图</span>
                </div>
              </div>
              <div v-else class="long-image-upload-area">
                <div class="long-image-upload-icon">
                  <n-icon size="32" color="#bbb"><ImageOutline /></n-icon>
                </div>
                <div class="long-image-upload-text">
                  <span class="long-image-upload-title">上传游戏介绍长图</span>
                  <span class="long-image-upload-hint">支持 JPG/PNG 格式，≤10MB</span>
                </div>
              </div>
            </n-upload>
            <div v-if="form.longImageUrl" class="long-image-file-row">
              <span class="file-name">{{ form.longImageName }}</span>
              <n-button size="small" quaternary type="error" @click="removeLongImage">删除</n-button>
            </div>
          </div>
          </div>
        </section>

        <!-- 支持特性 -->
        <section class="card form-card">
          <div class="card-head"><h4>支持特性</h4></div>
          <div class="checkbox-grid">
            <n-checkbox v-model:checked="form.supportShooting">支持射击</n-checkbox>
            <n-checkbox v-model:checked="form.supportWalking">支持行走</n-checkbox>
            <n-checkbox v-model:checked="form.supportSeated">支持坐姿</n-checkbox>
            <n-checkbox v-model:checked="form.multiPlayer">多人联机</n-checkbox>
            <n-checkbox v-model:checked="form.hasVoiceChat">语音聊天</n-checkbox>
            <n-checkbox v-model:checked="form.hasLeaderboard">排行榜</n-checkbox>
          </div>
        </section>

        <!-- 运营配置 -->
        <section class="card form-card">
          <div class="card-head">
            <h4>运营配置</h4>
            <n-tag size="small" type="info" bordered>提交后由平台审核</n-tag>
          </div>
          <div class="form-body">
            <!-- 游戏豆消耗 -->
            <div class="form-group">
              <label>游戏豆消耗 <n-text depth="3">（由平台审核定价，此处仅供参考）</n-text></label>
              <n-input-number v-model:value="form.gameBeanCost" :min="0" :max="99999" style="width:100%" disabled>
                <template #suffix>个/次</template>
              </n-input-number>
              <n-text depth="3" style="font-size:11px;">提交后由平台运营审核定价，CP不可自行修改</n-text>
            </div>

            <!-- 运行平台 -->
            <div class="form-group">
              <label>运行平台</label>
              <n-radio-group v-model:value="form.runPlatform">
                <n-radio-button value="host" label="主机游戏">🖥️ 主机游戏 — 串流到头显设备</n-radio-button>
                <n-radio-button value="allInOne" label="VR头显一体机">🥽 VR头显一体机游戏</n-radio-button>
              </n-radio-group>
              <n-text depth="3" style="font-size:11px;margin-top:4px;">
                主机游戏：游戏在 PC 主机上运行，画面串流到头显；VR头显一体机：游戏直接在头显上运行
              </n-text>
            </div>

            <!-- 玩法模式 -->
            <div class="form-group">
              <label>玩法模式</label>
              <n-radio-group v-model:value="form.gameMode">
                <n-radio-button value="standalone" label="单机游戏">单机游戏</n-radio-button>
                <n-radio-button value="online" label="联机游戏">联机游戏</n-radio-button>
              </n-radio-group>
              <n-text depth="3" style="font-size:11px;margin-top:4px;">
                单机游戏：单人独立体验；联机游戏：支持多台 VR 设备联网共同游戏
              </n-text>
            </div>

            <!-- 时长限制 -->
            <div class="form-group">
              <label>时长限制</label>
              <div class="time-limit-card">
                <div class="time-limit-header">
                  <div class="time-limit-info">
                    <span class="time-limit-icon">⏱</span>
                    <div>
                      <div class="time-limit-title">游戏时长限制</div>
                      <div class="time-limit-desc">时间到了以后自动结束游戏</div>
                    </div>
                  </div>
                  <n-switch v-model:value="form.timeLimitEnabled" size="medium" />
                </div>
                <transition name="fade-slide">
                  <div v-if="form.timeLimitEnabled" class="time-limit-body">
                    <div class="time-limit-slider-area">
                      <div class="time-limit-slider-label">
                        <span>限制时长</span>
                        <span class="time-limit-value">{{ form.timeLimitMinutes }} <small>分钟</small></span>
                      </div>
                      <n-slider
                        v-model:value="form.timeLimitMinutes"
                        :min="1" :max="180" :step="1"
                        :marks="{ 5: '5min', 15: '15min', 30: '30min', 60: '1h', 120: '2h', 180: '3h' }"
                      />
                      <div class="time-limit-presets">
                        <span
                          v-for="preset in timePresets"
                          :key="preset.value"
                          class="preset-chip"
                          :class="{ active: form.timeLimitMinutes === preset.value }"
                          @click="form.timeLimitMinutes = preset.value"
                        >{{ preset.label }}</span>
                      </div>
                    </div>
                  </div>
                  <div v-else class="time-limit-unlimited">
                    <span>♾️</span>
                    <span>不限制游戏时长，玩家可一直体验直到手动结束</span>
                  </div>
                </transition>
              </div>
            </div>

            <!-- 付费模式 -->
            <div class="form-group">
              <label>付费模式</label>
              <n-radio-group v-model:value="form.payMode">
                <n-radio-button value="multi" label="多人付费">👥 多人付费 — 多人共同花钱运行游戏</n-radio-button>
                <n-radio-button value="single" label="单人付费">👤 单人付费 — 一人花钱运行游戏</n-radio-button>
              </n-radio-group>
              <n-text depth="3" style="font-size:11px;margin-top:4px;">
                单人付费：一名玩家付费后运行游戏；多人付费：多名玩家分摊费用后共同进入游戏
              </n-text>
            </div>
          </div>
        </section>

        <!-- 开发者备注 -->
        <section class="card form-card">
          <div class="card-head"><h4>开发者备注</h4></div>
          <n-input v-model:value="form.devNote" type="textarea" :rows="3" placeholder="给审核人员的备注说明（选填）" />
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NButton, NInput, NInputNumber, NSelect, NSwitch, NCheckbox, NTag,
  NIcon, NSpace, NBreadcrumb, NBreadcrumbItem, NSlider, NUpload,
  NRadioGroup, NRadioButton, NDynamicTags, NText, useMessage
} from 'naive-ui'
import {
  PlayOutline, VideocamOutline, ImageOutline, FolderOutline, ArrowBackOutline,
} from '@vicons/ionicons5'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const isEdit = computed(() => !!route.params.id)
const isUpdate = computed(() => route.query.mode === 'update')
const pageTitle = computed(() => {
  if (isUpdate.value) return '更新游戏版本'
  if (isEdit.value) return '编辑游戏'
  return '上传新游戏'
})

const isPlaying = ref(false)
const videoProgress = ref(0)
const showTagSelect = ref(false)
const selectedTag = ref<string | null>(null)

// 题材选项
const categoryOptions = [
  { label: '科幻冒险', value: 'scifi' },
  { label: '极限运动', value: 'extreme' },
  { label: '海洋探索', value: 'ocean' },
  { label: '亲子娱乐', value: 'family' },
  { label: '恐怖惊悚', value: 'horror' },
  { label: '音乐节奏', value: 'rhythm' },
  { label: '竞技射击', value: 'shooting' },
  { label: '休闲益智', value: 'casual' },
  { label: '教育科普', value: 'education' },
  { label: '体育竞速', value: 'sports' },
]

// 标签选项
const tagOptions = [
  { label: '惊悚恐怖', value: '惊悚恐怖' },
  { label: '竞技射击', value: '竞技射击' },
  { label: '最新VR', value: '最新VR' },
  { label: '热门', value: '热门' },
  { label: '全年龄', value: '全年龄' },
  { label: '成人', value: '成人' },
  { label: '沉浸', value: '沉浸' },
  { label: '刺激', value: '刺激' },
  { label: '科普', value: '科普' },
  { label: '亲子', value: '亲子' },
  { label: '休闲', value: '休闲' },
  { label: '冒险', value: '冒险' },
  { label: '科幻', value: '科幻' },
  { label: '探索', value: '探索' },
  { label: '音乐', value: '音乐' },
  { label: '多人', value: '多人' },
  { label: '放松', value: '放松' },
]

// 时长预设
const timePresets = [
  { label: '3分钟', value: 3 },
  { label: '5分钟', value: 5 },
  { label: '10分钟', value: 10 },
  { label: '15分钟', value: 15 },
  { label: '30分钟', value: 30 },
  { label: '1小时', value: 60 },
  { label: '2小时', value: 120 },
  { label: '3小时', value: 180 },
]

const form = ref({
  name: '',
  category: null as string | null,
  version: '',
  size: '',
  duration: null as number | null,
  description: '',
  tags: [] as string[],
  runPlatform: 'host' as string,
  gameMode: 'standalone' as string,
  payMode: 'multi' as string,
  timeLimitEnabled: false,
  timeLimitMinutes: 10,
  gameBeanCost: 0,
  devNote: '',
  // 资源
  coverUrl: '',
  coverName: '',
  videoUrl: '',
  videoName: '',
  videoSize: '',
  videoCover: '',
  bannerList: [] as { url: string; name: string }[],
  packageName: '',
  packageSize: '',
  // 游戏介绍长图
  longImageUrl: '',
  longImageName: '',
  // 支持特性
  supportShooting: false,
  supportWalking: false,
  supportSeated: false,
  multiPlayer: false,
  hasVoiceChat: false,
  hasLeaderboard: false,
})

// 模拟加载已有游戏数据
function loadGameData(id: string) {
  const mockData: Record<string, any> = {
    '1': {
      name: '过山车VR', category: 'scifi', version: 'v2.3.2', size: '256M', duration: 10,
      tags: ['热门', '全年龄', '刺激'],
      description: '体验身临其境的VR过山车之旅！穿越壮观的虚拟世界，感受失重与速度的极致刺激。',
      runPlatform: 'host', gameMode: 'standalone', payMode: 'multi',
      timeLimitEnabled: true, timeLimitMinutes: 10,
      gameBeanCost: 20, devNote: '',
      coverUrl: '', videoUrl: '', videoCover: '', bannerList: [],
      packageName: 'rollercoster-vr-v2.3.2.apk', packageSize: '256 MB',
      supportShooting: false, supportWalking: true, supportSeated: true,
      multiPlayer: false, hasVoiceChat: false, hasLeaderboard: true,
    },
    '2': {
      name: '恐怖医院', category: 'horror', version: 'v1.8.5', size: '500M', duration: 15,
      tags: ['惊悚恐怖', '最新VR'],
      description: '面对日益强悍的僵尸浪潮围困，人类与僵尸迎来最终对决。',
      runPlatform: 'allInOne', gameMode: 'standalone', payMode: 'multi',
      timeLimitEnabled: true, timeLimitMinutes: 15,
      gameBeanCost: 25, devNote: '',
      coverUrl: '', videoUrl: '', videoCover: '', bannerList: [],
      packageName: 'horror-hospital-v1.8.5.zip', packageSize: '500 MB',
      supportShooting: true, supportWalking: true, supportSeated: false,
      multiPlayer: true, hasVoiceChat: true, hasLeaderboard: true,
    },
    '5': {
      name: '极速赛车', category: 'sports', version: 'v3.1.0', size: '800M', duration: 8,
      tags: ['热门', '竞技射击'],
      description: '真实赛车模拟，多条赛道，支持联机对战。',
      runPlatform: 'allInOne', gameMode: 'online', payMode: 'multi',
      timeLimitEnabled: true, timeLimitMinutes: 8,
      gameBeanCost: 15, devNote: '',
      coverUrl: '', videoUrl: '', videoCover: '', bannerList: [],
      packageName: 'speed-racing-v3.1.0.apk', packageSize: '800 MB',
      supportShooting: false, supportWalking: false, supportSeated: true,
      multiPlayer: true, hasVoiceChat: false, hasLeaderboard: true,
    },
  }
  if (mockData[id]) {
    Object.assign(form.value, mockData[id])
  }
}

function togglePlay() { isPlaying.value = !isPlaying.value }

function handleIconUpload(options: { file: File }) {
  const { file } = options
  if (file.size > 5 * 1024 * 1024) { message.warning('封面临时文件不能超过5MB'); return false }
  form.value.coverUrl = URL.createObjectURL(file)
  form.value.coverName = file.name
  message.success(`封面「${file.name}」上传成功（模拟）`)
  return false
}

function removeCover() { form.value.coverUrl = ''; form.value.coverName = ''; message.info('封面已删除') }

function handleBannerUpload(options: { file: File }) {
  const { file } = options
  if (file.size > 5 * 1024 * 1024) { message.warning('展位图文件不能超过5MB'); return false }
  form.value.bannerList.push({ url: URL.createObjectURL(file), name: file.name })
  message.success(`展位图「${file.name}」上传成功（模拟）`)
  return false
}

function removeBanner(index: number) {
  const item = form.value.bannerList[index]
  form.value.bannerList.splice(index, 1)
  message.info(`展位图「${item.name}」已删除`)
}

function handleVideoUpload(options: { file: File }) {
  const { file } = options
  if (file.size > 500 * 1024 * 1024) { message.warning('视频文件不能超过500MB'); return false }
  form.value.videoUrl = URL.createObjectURL(file)
  form.value.videoName = file.name
  form.value.videoSize = (file.size / (1024 * 1024)).toFixed(1) + ' MB'
  form.value.videoCover = form.value.videoUrl
  message.success(`视频「${file.name}」上传成功（模拟）`)
  return false
}

function handlePackageUpload(options: { file: File }) {
  const { file } = options
  if (file.size > 2 * 1024 * 1024 * 1024) { message.warning('资源包不能超过2GB'); return false }
  form.value.packageName = file.name
  form.value.packageSize = (file.size / (1024 * 1024)).toFixed(1) + ' MB'
  message.success(`资源包「${file.name}」上传成功（模拟）`)
  return false
}

function removePackage() { form.value.packageName = ''; form.value.packageSize = ''; message.info('资源包已删除') }

// 游戏介绍长图上传
function handleLongImageUpload(options: { file: File }) {
  const { file } = options
  if (file.size > 10 * 1024 * 1024) { message.warning('长图文件不能超过10MB'); return false }
  form.value.longImageUrl = URL.createObjectURL(file)
  form.value.longImageName = file.name
  message.success(`游戏介绍长图「${file.name}」上传成功（模拟）`)
  return false
}

function removeLongImage() {
  form.value.longImageUrl = ''
  form.value.longImageName = ''
  message.info('介绍长图已删除')
}

function renderTag({ tag, handleClose }: { tag: string; handleClose: () => void }) {
  return h(NTag, { closable: true, round: true, type: 'info', size: 'small', onClose: handleClose }, () => tag)
}

function addTagFromSelect(value: string) {
  if (value && !form.value.tags.includes(value)) form.value.tags.push(value)
  selectedTag.value = null
  showTagSelect.value = false
}

function saveDraft() {
  if (!form.value.name) { message.warning('请填写游戏名称'); return }
  message.success('草稿已保存')
}

function submitForReview() {
  if (!form.value.name || !form.value.category || !form.value.version) {
    message.warning('请填写必填项：游戏名称、游戏题材、版本号')
    return
  }
  const action = isUpdate.value ? '更新版本已提交审核' : '已提交审核'
  message.success(`「${form.value.name}」${action}，请等待平台审核结果`)
  router.push('/cp/games')
}

onMounted(() => {
  if (route.params.id) loadGameData(route.params.id as string)
})
</script>

<style scoped>
.page-root {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px 24px 40px;
}

/* ===== 顶部操作栏 ===== */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 12px 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid var(--border-color, #e8e8e8);
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.top-bar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* ===== 主体双栏 ===== */
.main-grid {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 24px;
  align-items: start;
}

/* ===== 通用卡片 ===== */
.card {
  background: white;
  border-radius: 14px;
  border: 1px solid var(--border-color, #e8e8e8);
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  overflow: hidden;
}
.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px 12px;
}
.card-head h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #333);
  margin: 0;
}

/* ===== 左栏 ===== */
.left-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 20px;
}

/* 视频卡片 */
.video-card .video-stage {
  height: 260px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.video-poster {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.play-mask {
  position: relative;
  z-index: 1;
  text-align: center;
  cursor: pointer;
}
.play-btn-circle {
  width: 60px;
  height: 60px;
  background: rgba(59, 130, 246, 0.85);
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  transition: background 0.2s;
}
.play-btn-circle:hover { background: rgba(37, 99, 235, 0.95); }
.play-label {
  display: block;
  color: rgba(255,255,255,0.85);
  font-size: 12px;
}
.video-stage-placeholder {
  text-align: center;
  color: rgba(255,255,255,0.6);
  font-size: 13px;
}
.video-progress-bar { padding: 0 16px; margin-top: -6px; }
.video-upload-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  border-top: 1px solid var(--border-color, #e8e8e8);
}
.file-name {
  font-size: 12px;
  color: var(--text-muted, #999);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

/* 资源卡片 */
.asset-card { padding: 0; }
.asset-single {
  padding: 16px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.banner-section {
  padding: 16px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.asset-icon-area {
  display: flex;
  align-items: center;
  gap: 10px;
}
.cover-preview {
  width: 80px;
  height: 110px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--border-color, #e8e8e8);
}
.icon-placeholder {
  width: 80px;
  height: 110px;
  border-radius: 8px;
  background: var(--bg-secondary, #f5f5f5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-size: 10px;
  color: #aaa;
  cursor: pointer;
  border: 2px dashed #ddd;
}
.banner-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.banner-thumb {
  position: relative;
  aspect-ratio: 16/9;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color, #e8e8e8);
  cursor: pointer;
}
.banner-thumb img { width: 100%; height: 100%; object-fit: cover; }
.banner-del {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 20px;
  height: 20px;
  padding: 0;
}
.banner-add-placeholder {
  aspect-ratio: 16/9;
  border-radius: 8px;
  background: var(--bg-secondary, #f5f5f5);
  border: 2px dashed #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.banner-upload-inner {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  color: #aaa;
}
.banner-add-placeholder:hover { border-color: #bbb; background: #f0f0f0; }
.asset-hint { font-size: 11px; color: var(--text-muted, #999); }
.package-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-muted, #999);
}
.package-size { color: var(--text-muted, #999); }

/* ===== 右栏 ===== */
.right-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-card { padding-bottom: 20px; }
.form-body {
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.form-group > label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted, #999);
}
.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.form-row-2 .form-group { min-width: 0; }
.inline-items {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 0 20px 4px;
}

/* ===== 时长限制卡片 ===== */
.time-limit-card {
  background: linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%);
  border: 1px solid #e0e7f0;
  border-radius: 12px;
  overflow: hidden;
}
.time-limit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: rgba(255,255,255,0.7);
}
.time-limit-info { display: flex; align-items: center; gap: 10px; }
.time-limit-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.time-limit-title { font-size: 13px; font-weight: 600; color: #1e293b; }
.time-limit-desc { font-size: 11px; color: #94a3b8; margin-top: 1px; }
.time-limit-body {
  padding: 16px 20px 20px;
  border-top: 1px solid #e0e7f0;
  background: rgba(255,255,255,0.5);
}
.time-limit-slider-area { display: flex; flex-direction: column; gap: 8px; }
.time-limit-slider-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #64748b;
}
.time-limit-value {
  font-size: 18px;
  font-weight: 700;
  color: #6366f1;
  font-family: 'Orbitron', 'SF Mono', monospace;
}
.time-limit-value small { font-size: 12px; font-weight: 400; color: #94a3b8; }
.time-limit-presets { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px; }
.preset-chip {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  color: #64748b;
  background: rgba(99,102,241,0.06);
  border: 1px solid rgba(99,102,241,0.12);
  cursor: pointer;
  transition: all 0.2s;
}
.preset-chip:hover { background: rgba(99,102,241,0.12); color: #6366f1; }
.preset-chip.active { background: #6366f1; color: #fff; border-color: #6366f1; }
.time-limit-unlimited {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  color: #94a3b8;
  border-top: 1px solid #e0e7f0;
}
.time-limit-unlimited span:first-child { font-size: 24px; }

/* 切换动画 */
.fade-slide-enter-active,
.fade-slide-leave-active { transition: all 0.25s ease; }
.fade-slide-enter-from,
.fade-slide-leave-to { opacity: 0; transform: translateY(-8px); }

/* 游戏介绍长图 */
.long-image-section {
  padding-top: 0;
}
.long-image-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted, #999);
  margin-bottom: 10px;
}
.long-image-preview-wrapper {
  position: relative;
  width: 100%;
  max-height: 300px;
  overflow: hidden;
  border-radius: 10px;
  border: 1px solid var(--border-color, #e8e8e8);
  cursor: pointer;
}
.long-image-preview {
  width: 100%;
  height: auto;
  display: block;
  object-fit: contain;
  background: var(--bg-secondary, #f5f5f5);
  max-height: 300px;
}
.long-image-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.25s;
  color: #fff;
  font-size: 13px;
}
.long-image-preview-wrapper:hover .long-image-overlay {
  opacity: 1;
}
.long-image-upload-area {
  width: 100%;
  padding: 28px 20px;
  border: 2px dashed #ddd;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--bg-secondary, #fafafa);
}
.long-image-upload-area:hover {
  border-color: var(--primary-color, #3B82F6);
  background: rgba(59,130,246,0.03);
}
.long-image-upload-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.long-image-upload-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.long-image-upload-title {
  font-size: 13px;
  color: var(--text-secondary, #666);
  font-weight: 500;
}
.long-image-upload-hint {
  font-size: 11px;
  color: var(--text-muted, #999);
}
.long-image-file-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  padding: 6px 10px;
  background: var(--bg-secondary, #f5f5f5);
  border-radius: 6px;
}

/* 响应式 */
@media (max-width: 1100px) {
  .main-grid { grid-template-columns: 1fr; }
  .left-col { position: static; }
  .form-row-2 { grid-template-columns: 1fr; }
}
</style>
