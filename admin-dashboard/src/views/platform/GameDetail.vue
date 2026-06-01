<template>
  <div class="page-root">
    <!-- 顶部操作栏 -->
    <header class="top-bar">
      <div class="top-bar-left">
        <n-button quaternary circle size="medium" @click="$router.push('/platform/games')">
          <template #icon><n-icon><ArrowBackOutline /></n-icon></template>
        </n-button>
        <n-breadcrumb>
          <n-breadcrumb-item @click="$router.push('/platform/games')">游戏库</n-breadcrumb-item>
          <n-breadcrumb-item>{{ isEdit ? '编辑游戏' : '新增游戏' }}</n-breadcrumb-item>
        </n-breadcrumb>
      </div>
      <n-space>
        <n-button secondary @click="$router.push('/platform/games')">取消</n-button>
        <n-button type="primary" :loading="saving" @click="handleSave">
          <template #icon><n-icon><SaveOutline /></n-icon></template>
          保存
        </n-button>
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
              <img v-if="gameData.videoCover" :src="gameData.videoCover" class="video-poster" />
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
            <span class="file-name">{{ gameData.videoName || '未上传宣传视频' }}</span>
            <n-upload accept="video/*" :show-file-list="false" @before-upload="handleVideoUpload">
              <n-button size="small" type="primary" secondary strong>
                <template #icon><n-icon :component="VideocamOutline" /></template>
                {{ gameData.videoUrl ? '更换' : '上传视频' }}
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
                <img v-if="gameData.iconUrl" :src="gameData.iconUrl" class="cover-preview" />
                <div v-else class="icon-placeholder">
                  <n-icon size="22" color="#aaa"><ImageOutline /></n-icon>
                  <span>上传封面</span>
                </div>
              </n-upload>
              <n-button v-if="gameData.iconUrl" size="tiny" quaternary type="error" @click="removeIcon">删除</n-button>
            </div>
            <span class="asset-hint">300×400 PNG/JPG ≤5MB</span>
          </div>
        </section>

        <!-- 展位图 -->
        <section class="card asset-card">
          <div class="card-head"><h4>展位图</h4></div>
          <div class="banner-section">
            <div class="banner-grid">
              <div v-for="(banner, i) in gameData.bannerList" :key="i" class="banner-thumb">
                <img :src="banner.url" />
                <n-button size="tiny" quaternary type="error" class="banner-del" @click="removeBanner(i)">×</n-button>
              </div>
              <div class="banner-add-placeholder">
                <n-upload class="banner-upload-inner" accept="image/*" :show-file-list="false" :max="1" @before-upload="handleBannerUpload">
                  <n-icon size="22" color="#aaa"><ImageOutline /></n-icon>
                  <span>上传展位图</span>
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
                {{ gameData.packageName || '上传资源包' }}
              </n-button>
            </n-upload>
            <div v-if="gameData.packageName" class="package-meta">
              <span>{{ gameData.packageName }}</span>
              <span class="package-size">{{ gameData.packageSize }}</span>
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
              <n-input v-model:value="gameData.name" placeholder="请输入游戏名称" size="large" />
            </div>
            <div class="form-group">
              <label>归属供应商</label>
              <n-select v-model:value="gameData.cpName" :options="cpOptions" placeholder="选择供应商（可选）" clearable filterable />
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label>游戏题材 <n-text depth="3">（多选，由总运营后台统一管理）</n-text></label>
                <n-select v-model:value="gameData.categories" :options="categoryOptions" multiple placeholder="选择题材" />
              </div>
              <div class="form-group">
                <label>当前版本</label>
                <n-input v-model:value="gameData.version" placeholder="v2.3.1" />
              </div>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label>游戏大小</label>
                <n-input v-model:value="gameData.size" placeholder="如：256M / 2G" />
              </div>
              <div class="form-group">
                <label>游戏时长</label>
                <n-input-number v-model:value="gameData.duration" :min="1" :max="180" style="width:100%">
                  <template #suffix>分钟</template>
                </n-input-number>
              </div>
            </div>
            <div class="form-group">
              <label>发布时间</label>
              <n-date-picker v-model:value="formattedDate" type="datetime" clearable style="width:100%" />
            </div>
            <div class="form-group">
              <label>评分</label>
              <div class="inline-items">
                <n-rate v-model:value="gameData.rating" size="medium" allow-half />
                <span class="rating-num">{{ gameData.rating.toFixed(1) }}</span>
              </div>
            </div>
            <div class="form-group">
              <label>标签</label>
              <div class="inline-items">
                <n-dynamic-tags v-model:value="gameData.tags" :render-tag="renderTag" />
                <n-select v-if="showTagSelect" v-model:value="selectedTag" :options="tagOptions" placeholder="选择标签" filterable size="small" style="width:130px" @update:value="addTagFromSelect" />
                <n-button v-else size="small" dashed @click="showTagSelect=true">+ 添加</n-button>
              </div>
            </div>
            <div class="form-group">
                <label>上线状态</label>
                <n-space :size="8">
                  <n-button
                    size="small"
                    :type="gameData.status === 'online' ? 'success' : 'default'"
                    :dashed="gameData.status !== 'online'"
                    @click="gameData.status = 'online'"
                  >上架</n-button>
                  <n-button
                    size="small"
                    :type="gameData.status === 'offline' ? 'warning' : 'default'"
                    :dashed="gameData.status !== 'offline'"
                    @click="gameData.status = 'offline'"
                  >下架</n-button>
                  <n-button
                    size="small"
                    :type="gameData.status === 'draft' ? 'info' : 'default'"
                    :dashed="gameData.status !== 'draft'"
                    @click="gameData.status = 'draft'"
                  >草稿</n-button>
                </n-space>
              </div>
              <div class="form-row-2">
                <div class="form-group">
                  <label>排序号</label>
                  <n-input-number v-model:value="gameData.sortOrder" :min="1" :max="999" style="width:100%" placeholder="数值越小越靠前">
                    <template #suffix>号</template>
                  </n-input-number>
                </div>
                <div class="form-group">
                  <label>&nbsp;</label>
                  <n-checkbox v-model:checked="gameData.recommended">标记为推荐游戏</n-checkbox>
                </div>
              </div>
          </div>
        </section>

        <!-- 游戏简介 -->
        <section class="card form-card">
          <div class="card-head"><h4>游戏简介</h4></div>
          <n-input v-model:value="gameData.description" type="textarea" :rows="5" placeholder="介绍游戏玩法、特色内容..." />
        </section>

        <!-- 支持特性 -->
        <section class="card form-card">
          <div class="card-head"><h4>支持特性</h4></div>
          <div class="checkbox-grid">
            <n-checkbox v-model:checked="gameData.supportShooting">支持射击</n-checkbox>
            <n-checkbox v-model:checked="gameData.supportWalking">支持行走</n-checkbox>
            <n-checkbox v-model:checked="gameData.supportSeated">支持坐姿</n-checkbox>
            <n-checkbox v-model:checked="gameData.multiPlayer">多人联机</n-checkbox>
            <n-checkbox v-model:checked="gameData.hasVoiceChat">语音聊天</n-checkbox>
            <n-checkbox v-model:checked="gameData.hasLeaderboard">排行榜</n-checkbox>
          </div>
        </section>

        <!-- 运营配置（v1.4 新增） -->
        <section class="card form-card">
          <div class="card-head">
            <h4>运营配置</h4>
            <n-tag size="small" type="info" bordered>v1.5</n-tag>
          </div>
          <div class="form-body">
            <!-- 游戏豆消耗 -->
            <div class="form-group">
              <label>游戏豆消耗 <n-text depth="3">（玩家每玩一次消耗的游戏豆数）</n-text></label>
              <n-input-number v-model:value="gameData.gameBeanCost" :min="0" :max="99999" style="width:100%">
                <template #suffix>个/次</template>
              </n-input-number>
            </div>

            <!-- 运行平台（v1.5 新增） -->
            <div class="form-group">
              <label>运行平台 <n-text depth="3">（游戏在哪个设备上运行）</n-text></label>
              <n-radio-group v-model:value="gameData.runPlatform">
                <n-radio-button value="host" label="主机游戏">🖥️ 主机游戏 — 串流到头显设备</n-radio-button>
                <n-radio-button value="allInOne" label="VR头显一体机">🥽 VR头显一体机游戏</n-radio-button>
              </n-radio-group>
              <n-text depth="3" style="font-size:11px;margin-top:4px;">
                主机游戏：游戏在 PC 主机上运行，画面串流到头显；VR头显一体机：游戏直接在头显上运行
              </n-text>
            </div>

            <!-- 玩法模式（原游戏类型） -->
            <div class="form-group">
              <label>玩法模式</label>
              <n-radio-group v-model:value="gameData.gameType">
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
                  <n-switch v-model:value="gameData.timeLimitEnabled" size="medium" />
                </div>
                <transition name="fade-slide">
                  <div v-if="gameData.timeLimitEnabled" class="time-limit-body">
                    <div class="time-limit-slider-area">
                      <div class="time-limit-slider-label">
                        <span>限制时长</span>
                        <span class="time-limit-value">{{ gameData.timeLimitMinutes }} <small>分钟</small></span>
                      </div>
                      <n-slider
                        v-model:value="gameData.timeLimitMinutes"
                        :min="1" :max="180" :step="1"
                        :marks="{ 5: '5min', 15: '15min', 30: '30min', 60: '1h', 120: '2h', 180: '3h' }"
                      />
                      <div class="time-limit-presets">
                        <span
                          v-for="preset in timePresets"
                          :key="preset.value"
                          class="preset-chip"
                          :class="{ active: gameData.timeLimitMinutes === preset.value }"
                          @click="gameData.timeLimitMinutes = preset.value"
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
              <n-radio-group v-model:value="gameData.payMode">
                <n-radio-button value="single" label="单人付费">👤 单人付费 — 一人花钱运行游戏</n-radio-button>
                <n-radio-button value="multi" label="多人付费">👥 多人付费 — 多人共同花钱运行游戏</n-radio-button>
              </n-radio-group>
              <n-text depth="3" style="font-size:11px;margin-top:4px;">
                单人付费：一名玩家付费后运行游戏；多人付费：多名玩家分摊费用后共同进入游戏
              </n-text>
            </div>
          </div>
        </section>

        <!-- 语言与设备 -->
        <section class="card form-card">
          <div class="card-head"><h4>语言与设备</h4></div>
          <div class="form-body">
            <div class="form-row-2">
              <div class="form-group">
                <label>界面语言</label>
                <n-select v-model:value="gameData.uiLanguage" :options="languageOptions" />
              </div>
              <div class="form-group">
                <label>语音语言</label>
                <n-select v-model:value="gameData.voiceLanguage" :options="languageOptions" />
              </div>
            </div>
            <div class="form-group">
              <label>空间需求</label>
              <n-input v-model:value="gameData.spaceRequired" placeholder="如：2m × 2m 或 无限制" />
            </div>
            <div class="form-group">
              <label>支持设备</label>
              <n-select v-model:value="gameData.supportDevices" :options="deviceOptions" multiple placeholder="选择兼容的 VR 设备" />
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NButton, NInput, NRate, NIcon, NSpace, NDynamicTags, NTag, NSelect,
  NCheckbox, NInputNumber, NDatePicker, NBreadcrumb,
  NBreadcrumbItem, NSlider, NUpload, NRadioGroup, NRadioButton,
  NSwitch, NText, useMessage
} from 'naive-ui'
import {
  PlayOutline, AddOutline, VideocamOutline,
  ImageOutline, FolderOutline,
  ArrowBackOutline, SaveOutline,
} from '@vicons/ionicons5'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const isPlaying = ref(false)
const videoProgress = ref(0)
const showTagSelect = ref(false)
const selectedTag = ref<string | null>(null)
const saving = ref(false)

// 判断是新增还是编辑模式
const gameId = computed(() => route.params.id as string | undefined)
const isEdit = computed(() => !!gameId.value && gameId.value !== 'add')

// 供应商选项
const cpOptions = [
  { label: '极境互动科技', value: '极境互动科技' },
  { label: '闪耀游戏工作室', value: '闪耀游戏工作室' },
  { label: '乐游网络', value: '乐游网络' },
  { label: '星际科技', value: '星际科技' },
  { label: '未来幻境', value: '未来幻境' },
  { label: '幻视科技', value: '幻视科技' },
  { label: '星辰游戏', value: '星辰游戏' },
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

// 题材选项（由总运营后台「游戏题材」页面统一管理）
const categoryOptions = [
  { label: '科幻冒险', value: 'scifi' },
  { label: '极限运动', value: 'extreme' },
  { label: '海洋探索', value: 'ocean' },
  { label: '亲子娱乐', value: 'family' },
  { label: '恐怖惊悚', value: 'horror' },
  { label: '音乐节奏', value: 'rhythm' },
]

// 语言选项
const languageOptions = [
  { label: '中文', value: 'zh-CN' },
  { label: '英文', value: 'en-US' },
  { label: '中英双语', value: 'both' },
  { label: '多语言', value: 'multi' },
]

// 支持设备选项
const deviceOptions = [
  { label: 'HTC Vive', value: 'HTC Vive' },
  { label: 'HTC Vive Pro', value: 'HTC Vive Pro' },
  { label: 'HTC Vive XR Elite', value: 'HTC Vive XR Elite' },
  { label: 'Oculus Rift', value: 'Oculus Rift' },
  { label: 'Oculus Rift S', value: 'Oculus Rift S' },
  { label: 'Meta Quest', value: 'Meta Quest' },
  { label: 'Meta Quest 2', value: 'Meta Quest 2' },
  { label: 'Meta Quest 3', value: 'Meta Quest 3' },
  { label: 'Meta Quest 3S', value: 'Meta Quest 3S' },
  { label: 'Meta Quest Pro', value: 'Meta Quest Pro' },
  { label: 'Pico Neo 3', value: 'Pico Neo 3' },
  { label: 'Pico 4', value: 'Pico 4' },
  { label: 'Pico 4 Pro', value: 'Pico 4 Pro' },
  { label: 'Pico 4 Ultra', value: 'Pico 4 Ultra' },
  { label: 'Valve Index', value: 'Valve Index' },
  { label: 'PlayStation VR', value: 'PS VR' },
  { label: 'PlayStation VR2', value: 'PS VR2' },
  { label: 'Apple Vision Pro', value: 'Apple Vision Pro' },
  { label: 'Bigscreen Beyond', value: 'Bigscreen Beyond' },
  { label: 'Samsung Gear VR', value: 'Samsung Gear VR' },
  { label: 'Windows Mixed Reality', value: 'Windows Mixed Reality' },
]

// 时长预设快速选项
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

// 游戏数据
const gameData = ref({
  id: null as number | null,
  name: '',
  icon: '',
  rating: 4.5,
  tags: [] as string[],
  categories: [] as string[],
  description: '',
  duration: 10,
  size: '',
  version: '',
  publishTime: null as number | null,

  // 游戏封面
  iconUrl: '' as string,
  iconName: '' as string,
  // 展位图（多张）
  bannerList: [] as { url: string; name: string }[],
  // 宣传视频
  videoName: '' as string,
  videoSize: '' as string,
  // 资源包
  packageName: '' as string,
  packageSize: '' as string,
  packageUrl: '' as string,

  // 支持特性
  supportShooting: false,
  supportWalking: false,
  supportSeated: false,
  multiPlayer: false,
  hasVoiceChat: false,
  hasLeaderboard: false,

  // 语言与设备
  uiLanguage: 'zh-CN',
  voiceLanguage: 'zh-CN',
  spaceRequired: '',
  supportDevices: ['HTC Vive'] as string[],

  videoUrl: '',
  videoCover: '',
  status: 'draft',
  sortOrder: 10,
  recommended: false,
  cpName: '' as string,

  // ===== 运营配置（v1.5 新增） =====
  // 运行平台：host-主机游戏（串流到头显）, allInOne-VR头显一体机
  runPlatform: 'host',
  // 游戏豆消耗（个/次）
  gameBeanCost: 0,
  // 玩法模式：standalone-单机游戏, online-联机游戏
  gameType: 'standalone',
  // 联机游戏
  // 时长限制开关
  timeLimitEnabled: false,
  // 时长限制（分钟）
  timeLimitMinutes: 10,
  // 付费模式：single-单人付费, multi-多人付费
  payMode: 'single',
})



// 格式化日期
const formattedDate = computed({
  get: () => gameData.value.publishTime ? new Date(gameData.value.publishTime * 1000).getTime() : Date.now(),
  set: (val: number) => { if (val) gameData.value.publishTime = Math.floor(val / 1000) }
})

// 推荐游戏（示例）
const recommendGames = ref([
  { id: 101, name: 'CS对战', icon: '🔫', rating: 4.8, tags: ['射击', '多人'], gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)' },
  { id: 102, name: '太空漫步', icon: '🚀', rating: 4.3, tags: ['科幻', '探索'], gradient: 'linear-gradient(135deg, #0c3483, #a2b6df)' },
  { id: 103, name: '恐龙王国', icon: '🦖', rating: 4.5, tags: ['冒险', '亲子'], gradient: 'linear-gradient(135deg, #fa709a, #fee140)' },
  { id: 104, name: '音乐节VR', icon: '🎵', rating: 4.4, tags: ['音乐', '休闲'], gradient: 'linear-gradient(135deg, #ff9a9e, #fecfef)' },
])

// 模拟加载已有游戏数据
function loadGameData(id: string) {
  const mockData: Record<string, any> = {
    '1': {
      id: 1, name: '过山车VR', icon: '🎢', rating: 4.9,
      tags: ['热门', '全年龄', '刺激'],
      categories: ['scifi', 'rhythm'],
      description: '体验身临其境的VR过山车之旅！穿越壮观的虚拟世界，感受失重与速度的极致刺激。',
      duration: 10, size: '256M', version: 'v2.3.1', publishTime: 1713576800,
      supportShooting: false, supportWalking: true, supportSeated: true,
      multiPlayer: false, hasVoiceChat: false, hasLeaderboard: true,
      uiLanguage: 'zh-CN', voiceLanguage: 'zh-CN',
      spaceRequired: '无限制', supportDevices: ['HTC Vive', 'Oculus'],
      videoUrl: '', videoCover: '', status: 'online',
      runPlatform: 'host', gameBeanCost: 20, gameType: 'standalone',
      timeLimitEnabled: true, timeLimitMinutes: 10, payMode: 'single',
    },
    '2': {
      id: 2, name: '末日大灾灭', icon: '💀', rating: 4.7,
      tags: ['惊悚恐怖', '竞技射击', '最新VR'],
      categories: ['horror', 'extreme'],
      description: '面对日益强悍的僵尸浪潮围困，人类与僵尸迎来最终对决。',
      duration: 15, size: '500M', version: 'v1.8.5', publishTime: 1713490400,
      supportShooting: true, supportWalking: true, supportSeated: false,
      multiPlayer: true, hasVoiceChat: true, hasLeaderboard: true,
      uiLanguage: 'zh-CN', voiceLanguage: 'zh-CN',
      spaceRequired: '2m x 3m', supportDevices: ['HTC Vive'],
      videoUrl: '', videoCover: '', status: 'online',
      runPlatform: 'allInOne', gameBeanCost: 30, gameType: 'standalone',
      timeLimitEnabled: true, timeLimitMinutes: 15, payMode: 'multi',
    },
  }

  if (mockData[id]) {
    Object.assign(gameData.value, mockData[id])
    const bannerCount = parseInt(id) % 2 + 2
    gameData.value.bannerList = Array.from({ length: bannerCount }).map((_, i) => ({
      url: `https://picsum.photos/seed/game${id}_banner${i}/900/600`,
      name: `banner_${i + 1}.jpg`,
    }))
  }
}

// 视频控制
function togglePlay() {
  isPlaying.value = !isPlaying.value
}

// 游戏封面上传
function handleIconUpload(options: { file: File }) {
  const { file } = options
  if (file.size > 5 * 1024 * 1024) {
    message.warning('封面临时文件不能超过5MB')
    return false
  }
  gameData.value.iconUrl = URL.createObjectURL(file)
  gameData.value.iconName = file.name
  message.success(`封面「${file.name}」上传成功（模拟）`)
  return false
}

// 展位图上传（支持多张）
function handleBannerUpload(options: { file: File }) {
  const { file } = options
  if (file.size > 5 * 1024 * 1024) {
    message.warning('展位图文件不能超过5MB')
    return false
  }
  gameData.value.bannerList.push({
    url: URL.createObjectURL(file),
    name: file.name,
  })
  message.success(`展位图「${file.name}」上传成功（模拟）`)
  return false
}

// 删除指定展位图
function removeBanner(index: number) {
  const banner = gameData.value.bannerList[index]
  gameData.value.bannerList.splice(index, 1)
  message.info(`展位图「${banner.name}」已删除`)
}

// 删除封面
function removeIcon() {
  gameData.value.iconUrl = ''
  gameData.value.iconName = ''
  message.info('封面已删除')
}

// 视频上传（唯一实现）
function handleVideoUpload(options: { file: File }) {
  const { file } = options
  if (file.size > 500 * 1024 * 1024) {
    message.warning('视频文件不能超过500MB')
    return false
  }
  gameData.value.videoUrl = URL.createObjectURL(file)
  gameData.value.videoName = file.name
  gameData.value.videoSize = (file.size / (1024 * 1024)).toFixed(1) + ' MB'
  gameData.value.videoCover = gameData.value.videoUrl
  message.success(`视频「${file.name}」上传成功（模拟）`)
  return false
}

// 删除视频
function removeVideo() {
  gameData.value.videoUrl = ''
  gameData.value.videoName = ''
  gameData.value.videoSize = ''
  gameData.value.videoCover = ''
  message.info('视频已删除')
}

// 资源包上传
function handlePackageUpload(options: { file: File }) {
  const { file } = options
  const maxSize = 2 * 1024 * 1024 * 1024
  if (file.size > maxSize) {
    message.warning('资源包不能超过2GB')
    return false
  }
  gameData.value.packageName = file.name
  gameData.value.packageSize = (file.size / (1024 * 1024)).toFixed(1) + ' MB'
  gameData.value.packageUrl = URL.createObjectURL(file)
  message.success(`资源包「${file.name}」上传成功（模拟）`)
  return false
}

// 删除资源包
function removePackage() {
  gameData.value.packageName = ''
  gameData.value.packageSize = ''
  gameData.value.packageUrl = ''
  message.info('资源包已删除')
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// 标签渲染
function renderTag({ tag, handleClose }: { tag: string; handleClose: () => void }) {
  return h(NTag, {
    closable: true,
    round: true,
    type: 'info',
    size: 'small',
    onClose: handleClose,
  }, () => tag)
}

function onTagsChange(tags: string[]) {
  gameData.value.tags = tags
}

function addTagFromSelect(value: string) {
  if (value && !gameData.value.tags.includes(value)) {
    gameData.value.tags.push(value)
  }
  selectedTag.value = null
  showTagSelect.value = false
}

// 导航到其他游戏
function navigateToGame(id: number) {
  router.push(`/platform/games/${id}`)
}

// 保存
async function handleSave() {
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 800))
    message.success(isEdit.value ? '游戏信息已更新' : '游戏已成功创建')
  } finally {
    saving.value = false
  }
}

// 初始化
onMounted(() => {
  if (gameId.value) {
    loadGameData(gameId.value)
  }
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
.play-btn-circle:hover {
  background: rgba(37, 99, 235, 0.95);
}
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
.video-progress-bar {
  padding: 0 16px;
  margin-top: -6px;
}
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

/* 图标+资源包卡片 */
.asset-card {
  padding: 20px;
}
.asset-row {
  display: flex;
  gap: 20px;
}
.asset-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.asset-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary, #333);
}
.asset-icon-area {
  display: flex;
  align-items: center;
  gap: 10px;
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
.banner-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.banner-del {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 20px;
  height: 20px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  line-height: 1;
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 10px;
  color: #aaa;
}
.banner-add-placeholder:hover {
  border-color: #bbb;
  background: #f0f0f0;
}

/* 单独资源区（封面/资源包） */
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
.banner-add:hover {
  border-color: var(--primary-color, #3B82F6);
  color: var(--primary-color, #3B82F6);
}
.asset-hint {
  font-size: 11px;
  color: var(--text-muted, #999);
}
.package-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-muted, #999);
}
.package-size {
  color: var(--text-muted, #999);
}

/* ===== 右栏 ===== */
.right-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 表单卡片 */
.form-card {
  padding-bottom: 20px;
}
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
.form-row-2 .form-group {
  min-width: 0;
}
.inline-items {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.rating-num {
  font-size: 15px;
  font-weight: 600;
  color: #F59E0B;
  margin-left: 4px;
}

/* 复选框网格 */
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
.time-limit-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
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
.time-limit-title {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}
.time-limit-desc {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 1px;
}
.time-limit-body {
  padding: 16px 20px 20px;
  border-top: 1px solid #e0e7f0;
  background: rgba(255,255,255,0.5);
}
.time-limit-slider-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
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
.time-limit-value small {
  font-size: 12px;
  font-weight: 400;
  color: #94a3b8;
}
.time-limit-presets {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 4px;
}
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
.preset-chip:hover {
  background: rgba(99,102,241,0.12);
  color: #6366f1;
}
.preset-chip.active {
  background: #6366f1;
  color: #fff;
  border-color: #6366f1;
}
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
.time-limit-unlimited span:first-child {
  font-size: 24px;
}

/* 切换动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 响应式 */
@media (max-width: 1100px) {
  .main-grid {
    grid-template-columns: 1fr;
  }
  .left-col {
    position: static;
  }
  .form-row-2 {
    grid-template-columns: 1fr;
  }
}
</style>
