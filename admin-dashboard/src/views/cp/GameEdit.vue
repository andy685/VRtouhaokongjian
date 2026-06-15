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
                <n-dynamic-tags v-model:value="form.tags" />
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

        <!-- 运行与资源规格 -->
        <section class="card form-card">
          <div class="card-head">
            <h4>运行与资源规格</h4>
            <n-tag size="small" type="info" bordered>{{ requiredResourceCount }} 个资源必填</n-tag>
          </div>
          <div class="form-body">
            <div class="form-group">
              <label>运行架构</label>
              <div class="architecture-grid">
                <button
                  v-for="option in runtimeArchitectureOptions"
                  :key="option.value"
                  class="architecture-card"
                  :class="{ active: form.runtimeArchitecture === option.value }"
                  type="button"
                  @click="selectRuntimeArchitecture(option.value)"
                >
                  <span class="architecture-icon">
                    <n-icon :component="option.icon" size="22" />
                  </span>
                  <span class="architecture-copy">
                    <strong>{{ option.title }}</strong>
                    <small>{{ option.description }}</small>
                  </span>
                  <span class="architecture-tags">
                    <n-tag v-for="tag in option.tags" :key="tag" size="tiny" :bordered="false">{{ tag }}</n-tag>
                  </span>
                </button>
              </div>
            </div>

            <div class="resource-spec-block">
              <div class="resource-spec-head">
                <div>
                  <strong>游戏资源构件</strong>
                  <span>按运行架构上传对应构件，平台审核会逐项校验文件类型、启动方式和依赖说明。</span>
                </div>
                <n-icon :component="selectedRuntimeArchitecture.icon" size="24" />
              </div>
              <div class="runtime-summary">
                <strong>{{ selectedRuntimeArchitecture.title }}</strong>
                <span>{{ selectedRuntimeArchitecture.description }}</span>
              </div>

              <div class="resource-list">
                <div
                  v-for="component in form.resourceComponents"
                  :key="component.role"
                  class="resource-component"
                  :class="{ required: component.required, uploaded: component.fileName }"
                >
                  <div class="resource-component-head">
                    <div>
                      <div class="resource-title">
                        <n-icon :component="resourceMeta(component.role).icon" />
                        <span>{{ resourceMeta(component.role).label }}</span>
                        <n-tag v-if="component.required" size="tiny" type="error" :bordered="false">必填</n-tag>
                        <n-tag v-else size="tiny" :bordered="false">可选</n-tag>
                      </div>
                      <p>{{ resourceMeta(component.role).description }}</p>
                    </div>
                    <n-button
                      v-if="!component.required"
                      size="tiny"
                      quaternary
                      type="error"
                      @click="removeResourceComponent(component.role)"
                    >移除</n-button>
                  </div>
                  <n-upload
                    :accept="resourceMeta(component.role).accept"
                    :show-file-list="false"
                    :max="1"
                    @before-upload="(options) => handleResourceUpload(component.role, options)"
                  >
                    <n-button size="small" secondary block strong>
                      <template #icon><n-icon :component="FolderOutline" /></template>
                      {{ component.fileName ? '更换文件' : `上传${resourceMeta(component.role).fileLabel}` }}
                    </n-button>
                  </n-upload>
                  <div v-if="component.fileName" class="package-meta">
                    <span>{{ component.fileName }}</span>
                    <span class="package-size">{{ component.fileSize }}</span>
                    <n-button size="tiny" quaternary type="error" @click="clearResourceFile(component.role)">删除文件</n-button>
                  </div>
                  <span class="asset-hint">{{ resourceMeta(component.role).acceptText }}，{{ resourceMeta(component.role).maxSizeText }}</span>
                </div>
              </div>

              <div v-if="optionalResourceOptions.length" class="resource-add-row">
                <n-select
                  v-model:value="selectedResourceRole"
                  :options="optionalResourceOptions"
                  size="small"
                  placeholder="添加可选资源构件"
                  clearable
                />
                <n-button size="small" secondary :disabled="!selectedResourceRole" @click="addSelectedResourceComponent">添加</n-button>
              </div>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label>安装目标</label>
                <n-select v-model:value="form.installTarget" :options="installTargetOptions" placeholder="选择安装位置" />
              </div>
              <div class="form-group">
                <label>包名 / 应用标识</label>
                <n-input v-model:value="form.packageIdentifier" placeholder="如 com.vendor.game 或 Steam AppID" />
              </div>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label>启动入口</label>
                <n-input v-model:value="form.entryPoint" placeholder="如 Game.exe / MainActivity / 启动协议" />
              </div>
              <div class="form-group">
                <label>启动参数</label>
                <n-input v-model:value="form.launchArgs" placeholder="如 -vr -room={roomId}" />
              </div>
            </div>

            <div v-if="needsPcService" class="form-row-2">
              <div class="form-group">
                <label>PC 服务端口</label>
                <n-input v-model:value="form.servicePort" placeholder="如 17890 / 8000-8010" />
              </div>
              <div class="form-group">
                <label>启动顺序</label>
                <n-select v-model:value="form.startupOrder" :options="startupOrderOptions" />
              </div>
            </div>

            <div v-if="needsNetworkConfig" class="form-row-2">
              <div class="form-group">
                <label>网络模式</label>
                <n-select v-model:value="form.networkMode" :options="networkModeOptions" />
              </div>
              <div class="form-group">
                <label>开放端口</label>
                <n-input v-model:value="form.portList" placeholder="如 TCP 7777, UDP 27015" />
              </div>
            </div>

            <div v-if="form.runtimeArchitecture === 'webxr'" class="form-row-2">
              <div class="form-group">
                <label>WebXR 入口 URL</label>
                <n-input v-model:value="form.webEntryUrl" placeholder="https://example.com/vr-game" />
              </div>
              <div class="form-group">
                <label>浏览器要求</label>
                <n-input v-model:value="form.browserRequirement" placeholder="如 Chromium 120+ / Pico Browser" />
              </div>
            </div>

            <div class="form-group">
              <label>安装与验收说明</label>
              <n-input v-model:value="form.technicalNote" type="textarea" :rows="3" placeholder="说明安装步骤、依赖环境、联机房间、外设驱动、异常退出处理等..." />
            </div>
          </div>
        </section>

        <!-- 运营配置 -->
        <section class="card form-card">
          <div class="card-head">
            <h4>运营配置</h4>
            <n-tag size="small" type="info" bordered>提交后由平台审核</n-tag>
          </div>
          <div class="form-body">
            <!-- 预设销售金额 -->
            <div class="form-group">
              <label>
                <span class="required-mark">*</span> 预设销售金额
                <n-text depth="3">（CP设置后由平台审核确认）</n-text>
              </label>
              <n-input-number v-model:value="form.presetPrice" :min="0.01" :max="9999" :precision="2" placeholder="请输入建议售价" style="width:100%">
                <template #suffix>元/次</template>
              </n-input-number>
            </div>

            <!-- 游戏豆消耗 -->
            <div class="form-group">
              <label>游戏豆消耗 <n-text depth="3">（由平台审核定价，此处仅供参考）</n-text></label>
              <n-input-number v-model:value="form.gameBeanCost" :min="0" :max="99999" style="width:100%" disabled>
                <template #suffix>个/次</template>
              </n-input-number>
              <n-text depth="3" style="font-size:11px;">提交后由平台运营审核定价，CP不可自行修改</n-text>
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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NButton, NInput, NInputNumber, NSelect, NSwitch, NCheckbox, NTag,
  NIcon, NSpace, NBreadcrumb, NBreadcrumbItem, NSlider, NUpload,
  NRadioGroup, NRadioButton, NDynamicTags, NText, useMessage
} from 'naive-ui'
import {
  PlayOutline, VideocamOutline, ImageOutline, FolderOutline, ArrowBackOutline,
  DesktopOutline, HeadsetOutline, HardwareChipOutline, ServerOutline,
  CloudOutline, GlobeOutline, LayersOutline, FilmOutline, CubeOutline,
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
const selectedResourceRole = ref<ResourceRole | null>(null)

type RuntimeArchitecture =
  | 'pcvr'
  | 'headset_native'
  | 'headset_with_pc_service'
  | 'multiplayer_server'
  | 'webxr'
  | 'media_experience'

type ResourceRole =
  | 'headset_client'
  | 'headset_data'
  | 'pc_client'
  | 'pc_service'
  | 'server_room'
  | 'stream_client'
  | 'web_bundle'
  | 'media_content'
  | 'dependency'
  | 'patch'

type ResourceComponent = {
  role: ResourceRole
  required: boolean
  fileName: string
  fileSize: string
  fileUrl: string
  version: string
}

type UploadBeforeOptions = {
  file: {
    name: string
    file?: File | null
  }
}

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

const runtimeArchitectureOptions: {
  value: RuntimeArchitecture
  title: string
  description: string
  icon: any
  tags: string[]
  requiredRoles: ResourceRole[]
  runPlatform: 'host' | 'allInOne'
}[] = [
  { value: 'pcvr', title: 'PCVR 主机运行', description: '游戏安装在 Windows 主机，画面串流或直连到头显。', icon: DesktopOutline, tags: ['EXE/ZIP', 'PC'], requiredRoles: ['pc_client'], runPlatform: 'host' },
  { value: 'headset_native', title: '头显本地运行', description: '游戏直接安装在 Pico、Quest 等安卓头显内。', icon: HeadsetOutline, tags: ['APK', '头显'], requiredRoles: ['headset_client'], runPlatform: 'allInOne' },
  { value: 'headset_with_pc_service', title: '头显 + PC 服务终端', description: '单台或少量头显运行 APK，但必须连接本地 PC 服务做授权、同步、外设或房控。', icon: HardwareChipOutline, tags: ['单机为主', 'PC服务'], requiredRoles: ['headset_client', 'pc_service'], runPlatform: 'allInOne' },
  { value: 'multiplayer_server', title: '多终端联机/主控', description: '多台头显进入同一房间联机，必须有主控/房间服务统一建房、同步与结算。', icon: ServerOutline, tags: ['多人联机', '主控服务'], requiredRoles: ['headset_client', 'server_room'], runPlatform: 'allInOne' },
  { value: 'webxr', title: 'WebXR/浏览器游戏', description: '通过浏览器、WebView 或离线 Web 包启动。', icon: GlobeOutline, tags: ['URL', 'Web'], requiredRoles: ['web_bundle'], runPlatform: 'allInOne' },
  { value: 'media_experience', title: 'VR 影视/体验内容', description: '不是可执行程序，主要由视频、播放清单或座舱内容组成。', icon: FilmOutline, tags: ['MP4', '内容包'], requiredRoles: ['media_content'], runPlatform: 'allInOne' },
]

const resourceRoleOptions: Record<ResourceRole, {
  label: string
  description: string
  fileLabel: string
  accept: string
  acceptText: string
  maxSize: number
  maxSizeText: string
  icon: any
}> = {
  headset_client: { label: '头显客户端', description: '安装到 VR 头显内的安卓客户端，通常为 APK。', fileLabel: 'APK', accept: '.apk', acceptText: '仅支持 .apk', maxSize: 2 * 1024 * 1024 * 1024, maxSizeText: '≤2GB', icon: HeadsetOutline },
  headset_data: { label: '头显数据包', description: 'APK 之外的 OBB、地图、素材或离线数据。', fileLabel: '数据包', accept: '.obb,.zip,.rar,.7z', acceptText: '支持 .obb/.zip/.rar/.7z', maxSize: 5 * 1024 * 1024 * 1024, maxSizeText: '≤5GB', icon: CubeOutline },
  pc_client: { label: 'PC 游戏客户端', description: 'Windows 主机运行的游戏程序或绿色包。', fileLabel: 'PC 包', accept: '.exe,.zip,.rar,.7z', acceptText: '支持 .exe/.zip/.rar/.7z', maxSize: 10 * 1024 * 1024 * 1024, maxSizeText: '≤10GB', icon: DesktopOutline },
  pc_service: { label: 'PC 服务终端', description: '为头显客户端提供联网、授权、房间或同步服务。', fileLabel: '服务端包', accept: '.exe,.zip,.rar,.7z', acceptText: '支持 .exe/.zip/.rar/.7z', maxSize: 5 * 1024 * 1024 * 1024, maxSizeText: '≤5GB', icon: HardwareChipOutline },
  server_room: { label: '房间/主控服务', description: '多人联机、主控端、房间服务或局域网协调程序。', fileLabel: '服务包', accept: '.exe,.zip,.rar,.7z', acceptText: '支持 .exe/.zip/.rar/.7z', maxSize: 5 * 1024 * 1024 * 1024, maxSizeText: '≤5GB', icon: ServerOutline },
  stream_client: { label: '串流客户端', description: '云串流或本地串流所需的门店侧客户端。', fileLabel: '客户端包', accept: '.apk,.exe,.zip,.rar,.7z', acceptText: '支持 .apk/.exe/.zip/.rar/.7z', maxSize: 2 * 1024 * 1024 * 1024, maxSizeText: '≤2GB', icon: CloudOutline },
  web_bundle: { label: 'WebXR 离线包', description: '可选的离线 WebXR 资源包；纯在线 URL 可不上传。', fileLabel: 'Web 包', accept: '.zip,.rar,.7z', acceptText: '支持 .zip/.rar/.7z', maxSize: 2 * 1024 * 1024 * 1024, maxSizeText: '≤2GB', icon: GlobeOutline },
  media_content: { label: '媒体内容包', description: 'VR 视频、播放清单、球幕或座舱体验内容。', fileLabel: '媒体包', accept: '.mp4,.mov,.zip,.rar,.7z', acceptText: '支持 .mp4/.mov/.zip/.rar/.7z', maxSize: 10 * 1024 * 1024 * 1024, maxSizeText: '≤10GB', icon: FilmOutline },
  dependency: { label: '运行依赖/驱动', description: '显卡运行库、外设驱动、SteamVR 插件或厂商 SDK。', fileLabel: '依赖包', accept: '.exe,.msi,.zip,.rar,.7z', acceptText: '支持 .exe/.msi/.zip/.rar/.7z', maxSize: 2 * 1024 * 1024 * 1024, maxSizeText: '≤2GB', icon: CubeOutline },
  patch: { label: '补丁/差分包', description: '只更新地图、素材、脚本或版本差分时使用。', fileLabel: '补丁包', accept: '.patch,.zip,.rar,.7z', acceptText: '支持 .patch/.zip/.rar/.7z', maxSize: 2 * 1024 * 1024 * 1024, maxSizeText: '≤2GB', icon: LayersOutline },
}

const installTargetOptions = [
  { label: 'Windows 主机', value: 'windows_pc' },
  { label: '安卓 VR 头显', value: 'android_headset' },
  { label: '浏览器/WebView', value: 'web' },
]

const startupOrderOptions = [
  { label: '先启动 PC 服务，再启动头显客户端', value: 'pc_service_first' },
  { label: '先启动头显客户端，再连接 PC 服务', value: 'headset_first' },
  { label: '主控端统一拉起客户端', value: 'controller_first' },
]

const networkModeOptions = [
  { label: '离线可运行', value: 'offline' },
  { label: '仅局域网', value: 'lan' },
  { label: '需要公网', value: 'internet' },
  { label: '局域网 + 公网授权', value: 'lan_with_auth' },
]

function createResourceComponent(role: ResourceRole, required = false): ResourceComponent {
  return { role, required, fileName: '', fileSize: '', fileUrl: '', version: '' }
}

const form = ref({
  name: '',
  category: null as string | null,
  version: '',
  size: '',
  duration: null as number | null,
  description: '',
  tags: [] as string[],
  runtimeArchitecture: 'pcvr' as RuntimeArchitecture,
  runPlatform: 'host' as string,
  gameMode: 'standalone' as string,
  payMode: 'multi' as string,
  timeLimitEnabled: false,
  timeLimitMinutes: 10,
  gameBeanCost: 0,
  presetPrice: null as number | null,
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
  resourceComponents: [
    createResourceComponent('pc_client', true),
  ] as ResourceComponent[],
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
  installTarget: 'windows_pc',
  packageIdentifier: '',
  entryPoint: '',
  launchArgs: '',
  servicePort: '',
  startupOrder: 'pc_service_first',
  networkMode: 'offline',
  portList: '',
  streamingProvider: '',
  cloudGameId: '',
  externalPlatform: null as string | null,
  externalGameId: '',
  webEntryUrl: '',
  browserRequirement: '',
  technicalNote: '',
})

const selectedRuntimeArchitecture = computed(() => (
  runtimeArchitectureOptions.find(item => item.value === form.value.runtimeArchitecture) || runtimeArchitectureOptions[0]
))

const requiredResourceCount = computed(() => form.value.resourceComponents.filter(item => item.required).length)

const optionalResourceOptions = computed(() => Object.entries(resourceRoleOptions)
  .filter(([role]) => !form.value.resourceComponents.some(item => item.role === role))
  .map(([value, meta]) => ({ label: meta.label, value })))

const needsPcService = computed(() => ['headset_with_pc_service', 'multiplayer_server'].includes(form.value.runtimeArchitecture))

const needsNetworkConfig = computed(() => (
  ['headset_with_pc_service', 'multiplayer_server'].includes(form.value.runtimeArchitecture)
))

function resourceMeta(role: ResourceRole) {
  return resourceRoleOptions[role]
}

function syncResourceComponents() {
  const requiredRoles = selectedRuntimeArchitecture.value.requiredRoles
  form.value.resourceComponents = form.value.resourceComponents
    .filter(item => item.required || item.fileName || requiredRoles.includes(item.role))
    .map(item => ({ ...item, required: requiredRoles.includes(item.role) }))

  requiredRoles.forEach((role) => {
    if (!form.value.resourceComponents.some(item => item.role === role)) {
      form.value.resourceComponents.push(createResourceComponent(role, true))
    }
  })
}

function selectRuntimeArchitecture(value: RuntimeArchitecture) {
  const selected = runtimeArchitectureOptions.find(item => item.value === value)
  if (!selected) return
  form.value.runtimeArchitecture = value
  form.value.runPlatform = selected.runPlatform
  if (value === 'pcvr') form.value.installTarget = 'windows_pc'
  if (value === 'headset_native' || value === 'headset_with_pc_service' || value === 'multiplayer_server') {
    form.value.installTarget = 'android_headset'
  }
  if (value === 'webxr') form.value.installTarget = 'web'
  syncResourceComponents()
  selectedResourceRole.value = null
}

function addSelectedResourceComponent() {
  if (!selectedResourceRole.value) return
  if (!form.value.resourceComponents.some(item => item.role === selectedResourceRole.value)) {
    form.value.resourceComponents.push(createResourceComponent(selectedResourceRole.value))
  }
  selectedResourceRole.value = null
}

function removeResourceComponent(role: ResourceRole) {
  const requiredRoles = selectedRuntimeArchitecture.value.requiredRoles
  if (requiredRoles.includes(role)) return
  form.value.resourceComponents = form.value.resourceComponents.filter(item => item.role !== role)
}

function clearResourceFile(role: ResourceRole) {
  const target = form.value.resourceComponents.find(item => item.role === role)
  if (!target) return
  target.fileName = ''
  target.fileSize = ''
  target.fileUrl = ''
  message.info(`${resourceMeta(role).label}文件已删除`)
}

// 模拟加载已有游戏数据
function loadGameData(id: string) {
  const mockData: Record<string, any> = {
    '1': {
      name: '过山车VR', category: 'scifi', version: 'v2.3.2', size: '256M', duration: 10,
      tags: ['热门', '全年龄', '刺激'],
      description: '体验身临其境的VR过山车之旅！穿越壮观的虚拟世界，感受失重与速度的极致刺激。',
      runtimeArchitecture: 'pcvr', runPlatform: 'host', gameMode: 'standalone', payMode: 'multi',
      timeLimitEnabled: true, timeLimitMinutes: 10,
      gameBeanCost: 20, presetPrice: 38, devNote: '',
      coverUrl: '', videoUrl: '', videoCover: '', bannerList: [],
      packageName: 'rollercoster-vr-v2.3.2.apk', packageSize: '256 MB',
      installTarget: 'windows_pc', entryPoint: 'RollerCoasterVR.exe', packageIdentifier: 'rollercoaster-vr',
      networkMode: 'offline',
      resourceComponents: [
        { ...createResourceComponent('pc_client', true), fileName: 'rollercoaster-vr-v2.3.2.zip', fileSize: '2.4 GB' },
      ],
      supportShooting: false, supportWalking: true, supportSeated: true,
      multiPlayer: false, hasVoiceChat: false, hasLeaderboard: true,
    },
    '2': {
      name: '恐怖医院', category: 'horror', version: 'v1.8.5', size: '500M', duration: 15,
      tags: ['惊悚恐怖', '最新VR'],
      description: '面对日益强悍的僵尸浪潮围困，人类与僵尸迎来最终对决。',
      runtimeArchitecture: 'headset_with_pc_service', runPlatform: 'allInOne', gameMode: 'standalone', payMode: 'multi',
      timeLimitEnabled: true, timeLimitMinutes: 15,
      gameBeanCost: 25, presetPrice: 48, devNote: '',
      coverUrl: '', videoUrl: '', videoCover: '', bannerList: [],
      packageName: 'horror-hospital-v1.8.5.zip', packageSize: '500 MB',
      installTarget: 'android_headset', entryPoint: 'com.vendor.horror.MainActivity', packageIdentifier: 'com.vendor.horror',
      servicePort: '17890', startupOrder: 'pc_service_first', networkMode: 'lan', portList: 'TCP 17890, UDP 17891',
      resourceComponents: [
        { ...createResourceComponent('headset_client', true), fileName: 'horror-hospital-v1.8.5.apk', fileSize: '500 MB' },
        { ...createResourceComponent('pc_service', true), fileName: 'horror-hospital-service-v1.8.5.zip', fileSize: '120 MB' },
      ],
      supportShooting: true, supportWalking: true, supportSeated: false,
      multiPlayer: true, hasVoiceChat: true, hasLeaderboard: true,
    },
    '5': {
      name: '极速赛车', category: 'sports', version: 'v3.1.0', size: '800M', duration: 8,
      tags: ['热门', '竞技射击'],
      description: '真实赛车模拟，多条赛道，支持联机对战。',
      runtimeArchitecture: 'multiplayer_server', runPlatform: 'allInOne', gameMode: 'online', payMode: 'multi',
      timeLimitEnabled: true, timeLimitMinutes: 8,
      gameBeanCost: 15, presetPrice: 30, devNote: '',
      coverUrl: '', videoUrl: '', videoCover: '', bannerList: [],
      packageName: 'speed-racing-v3.1.0.apk', packageSize: '800 MB',
      installTarget: 'android_headset', entryPoint: 'com.vendor.racing.MainActivity', packageIdentifier: 'com.vendor.racing',
      servicePort: '7777', startupOrder: 'controller_first', networkMode: 'lan', portList: 'TCP 7777, UDP 7778',
      resourceComponents: [
        { ...createResourceComponent('headset_client', true), fileName: 'speed-racing-v3.1.0.apk', fileSize: '800 MB' },
        { ...createResourceComponent('server_room', true), fileName: 'speed-racing-room-server-v3.1.0.zip', fileSize: '96 MB' },
      ],
      supportShooting: false, supportWalking: false, supportSeated: true,
      multiPlayer: true, hasVoiceChat: false, hasLeaderboard: true,
    },
  }
  if (mockData[id]) {
    Object.assign(form.value, mockData[id])
    syncResourceComponents()
  }
}

function togglePlay() { isPlaying.value = !isPlaying.value }

function handleIconUpload(options: UploadBeforeOptions) {
  const file = options.file.file
  if (!file) return false
  if (file.size > 5 * 1024 * 1024) { message.warning('封面临时文件不能超过5MB'); return false }
  form.value.coverUrl = URL.createObjectURL(file)
  form.value.coverName = file.name
  message.success(`封面「${file.name}」上传成功（模拟）`)
  return false
}

function removeCover() { form.value.coverUrl = ''; form.value.coverName = ''; message.info('封面已删除') }

function handleBannerUpload(options: UploadBeforeOptions) {
  const file = options.file.file
  if (!file) return false
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

function handleVideoUpload(options: UploadBeforeOptions) {
  const file = options.file.file
  if (!file) return false
  if (file.size > 500 * 1024 * 1024) { message.warning('视频文件不能超过500MB'); return false }
  form.value.videoUrl = URL.createObjectURL(file)
  form.value.videoName = file.name
  form.value.videoSize = (file.size / (1024 * 1024)).toFixed(1) + ' MB'
  form.value.videoCover = form.value.videoUrl
  message.success(`视频「${file.name}」上传成功（模拟）`)
  return false
}

function handleResourceUpload(role: ResourceRole, options: UploadBeforeOptions) {
  const file = options.file.file
  if (!file) return false
  const meta = resourceMeta(role)
  if (file.size > meta.maxSize) {
    message.warning(`${meta.label}不能超过${meta.maxSizeText.replace('≤', '')}`)
    return false
  }
  const target = form.value.resourceComponents.find(item => item.role === role)
  if (!target) return false
  target.fileName = file.name
  target.fileSize = (file.size / (1024 * 1024)).toFixed(1) + ' MB'
  target.fileUrl = URL.createObjectURL(file)
  message.success(`${meta.label}「${file.name}」上传成功（模拟）`)
  return false
}

// 游戏介绍长图上传
function handleLongImageUpload(options: UploadBeforeOptions) {
  const file = options.file.file
  if (!file) return false
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
  if (!form.value.presetPrice || form.value.presetPrice <= 0) {
    message.warning('请填写预设销售金额')
    return
  }
  const missingResources = form.value.resourceComponents.filter(item => item.required && !item.fileName)
  if (missingResources.length) {
    message.warning(`请上传必填资源：${missingResources.map(item => resourceMeta(item.role).label).join('、')}`)
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
.required-mark {
  color: #d03050;
  font-weight: 700;
  margin-right: 2px;
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

/* ===== 运行架构与资源构件 ===== */
.resource-spec-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}
.resource-spec-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  color: #2563eb;
}
.resource-spec-head strong {
  display: block;
  font-size: 13px;
  color: #111827;
  margin-bottom: 3px;
}
.resource-spec-head span {
  display: block;
  font-size: 11px;
  line-height: 1.5;
  color: #64748b;
}
.runtime-summary {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #e2e8f0;
  color: #475569;
}
.runtime-summary strong {
  display: block;
  font-size: 13px;
  color: #1e293b;
  margin-bottom: 2px;
}
.runtime-summary span {
  display: block;
  font-size: 11px;
  line-height: 1.5;
}
.resource-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.resource-component {
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.resource-component.required {
  border-color: #bfdbfe;
  background: #f8fbff;
}
.resource-component.uploaded {
  border-color: #bbf7d0;
  background: #f7fef9;
}
.resource-component-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
.resource-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
}
.resource-component p {
  margin: 4px 0 0;
  font-size: 11px;
  line-height: 1.5;
  color: #64748b;
}
.resource-add-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
}
.architecture-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.architecture-card {
  min-height: 116px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}
.architecture-card:hover,
.architecture-card:focus-visible {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
  outline: none;
}
.architecture-card.active {
  border-color: #2563eb;
  background: #eff6ff;
}
.architecture-icon {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: #eef2ff;
  color: #2563eb;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.architecture-copy {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.architecture-copy strong {
  font-size: 13px;
  color: #111827;
}
.architecture-copy small {
  font-size: 11px;
  color: #64748b;
  line-height: 1.45;
}
.architecture-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: auto;
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
  .architecture-grid { grid-template-columns: 1fr; }
}
</style>
