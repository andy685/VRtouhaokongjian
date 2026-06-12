<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <h1>待机画面</h1>
      <div class="header-actions">
        <div class="shop-switch">
          <n-select
            :value="currentShop"
            :options="shopOptions"
            filterable
            placeholder="搜索并选择店铺..."
            style="width: 200px"
            @update:value="switchShop"
          />
          <n-button quaternary circle size="small" :disabled="currentShopIndex <= 0" @click="switchToPrevShop">
            <template #icon><n-icon :component="ChevronBackOutline" /></template>
          </n-button>
          <span class="shop-index">{{ currentShopIndex + 1 }}/{{ shopProfiles.length }}</span>
          <n-button quaternary circle size="small" :disabled="currentShopIndex >= shopProfiles.length - 1" @click="switchToNextShop">
            <template #icon><n-icon :component="ChevronForwardOutline" /></template>
          </n-button>
          <n-button quaternary size="small" :disabled="!firstIncompleteShop" @click="jumpToFirstIncomplete">
            <template #icon><n-icon :component="AlertCircleOutline" /></template>
            待完善
          </n-button>
        </div>
        <n-space>
          <n-button size="small" @click="resetSettings" :disabled="!isDirty">重置</n-button>
          <n-button type="primary" size="small" @click="saveSettings">保存</n-button>
        </n-space>
      </div>
    </div>

    <!-- 主内容 -->
    <div class="layout-grid">
      <!-- 左栏：配置 -->
      <div class="config-col">
        <!-- 内容类型 -->
        <n-card class="card-block" size="small">
          <template #header>
            <div class="card-head">
              <div>
                <div class="card-head-title">待机内容类型</div>
                <div class="card-head-desc">{{ activeShop.meta.label }} 待机画面的展示内容</div>
              </div>
              <n-tag type="primary" size="small" :bordered="false">{{ idleContentLabelMap[settings.idleContent] }}</n-tag>
            </div>
          </template>

          <div class="type-grid">
            <button
              v-for="option in idleContentOptions"
              :key="option.value"
              type="button"
              class="type-btn"
              :class="{ active: settings.idleContent === option.value }"
              @click="settings.idleContent = option.value"
            >
              <div class="type-btn-icon">
                <n-icon :component="option.icon" size="22" />
              </div>
              <div class="type-btn-body">
                <strong>{{ option.label }}</strong>
                <span>{{ option.description }}</span>
              </div>
              <div v-if="settings.idleContent === option.value" class="type-btn-check">
                <n-icon :component="CheckmarkCircleOutline" size="18" />
              </div>
            </button>
          </div>
        </n-card>

        <!-- 资源上传 -->
        <n-card class="card-block" size="small">
          <template #header>
            <div class="card-head">
              <div>
                <div class="card-head-title">资源上传</div>
                <div class="card-head-desc">为横版和竖版终端分别上传资源</div>
              </div>
            </div>
          </template>

          <n-form label-placement="top" class="config-form">
            <!-- 海报上传 -->
            <n-form-item v-if="settings.idleContent === 'poster'" label="宣传海报">
              <div class="upload-dual">
                <div class="upload-card">
                  <div class="upload-card-hd">
                    <div>
                      <strong>横版海报</strong>
                      <span>16:9 · 21:9 横屏</span>
                    </div>
                    <n-tag size="tiny" :bordered="false">1920×1080</n-tag>
                  </div>
                  <n-upload action="/api/upload" list-type="image-card" :max="5" v-model:file-list="posterAssets.landscape" />
                  <div class="upload-card-stat">
                    <span class="stat-num">{{ posterAssets.landscape.length }}/5</span>
                    <n-tag v-if="posterAssets.landscape.length" size="tiny" type="success" :bordered="false">已配置</n-tag>
                    <n-tag v-else size="tiny" type="default" :bordered="false">待上传</n-tag>
                  </div>
                </div>
                <div class="upload-card">
                  <div class="upload-card-hd">
                    <div>
                      <strong>竖版海报</strong>
                      <span>9:16 · 3:4 竖屏</span>
                    </div>
                    <n-tag size="tiny" :bordered="false">1080×1920</n-tag>
                  </div>
                  <n-upload action="/api/upload" list-type="image-card" :max="5" v-model:file-list="posterAssets.portrait" />
                  <div class="upload-card-stat">
                    <span class="stat-num">{{ posterAssets.portrait.length }}/5</span>
                    <n-tag v-if="posterAssets.portrait.length" size="tiny" type="success" :bordered="false">已配置</n-tag>
                    <n-tag v-else size="tiny" type="default" :bordered="false">待上传</n-tag>
                  </div>
                </div>
              </div>
            </n-form-item>

            <!-- 视频上传 -->
            <n-form-item v-if="settings.idleContent === 'gamePreview'" label="游戏预告片">
              <div class="upload-dual">
                <div class="upload-card">
                  <div class="upload-card-hd">
                    <div>
                      <strong>横版视频</strong>
                      <span>横屏终端循环播放</span>
                    </div>
                    <n-tag size="tiny" :bordered="false">MP4/MOV</n-tag>
                  </div>
                  <n-upload action="/api/upload" accept=".mp4,.mov" :max="5" v-model:file-list="previewAssets.landscape">
                    <n-button secondary type="primary" size="small">上传横版视频</n-button>
                  </n-upload>
                  <div class="upload-card-stat">
                    <span class="stat-num">{{ previewAssets.landscape.length }}/5</span>
                    <n-tag v-if="previewAssets.landscape.length" size="tiny" type="success" :bordered="false">{{ previewAssets.landscape.length }} 个</n-tag>
                    <n-tag v-else size="tiny" type="default" :bordered="false">待上传</n-tag>
                  </div>
                </div>
                <div class="upload-card">
                  <div class="upload-card-hd">
                    <div>
                      <strong>竖版视频</strong>
                      <span>竖屏终端循环播放</span>
                    </div>
                    <n-tag size="tiny" :bordered="false">MP4/MOV</n-tag>
                  </div>
                  <n-upload action="/api/upload" accept=".mp4,.mov" :max="5" v-model:file-list="previewAssets.portrait">
                    <n-button secondary type="primary" size="small">上传竖版视频</n-button>
                  </n-upload>
                  <div class="upload-card-stat">
                    <span class="stat-num">{{ previewAssets.portrait.length }}/5</span>
                    <n-tag v-if="previewAssets.portrait.length" size="tiny" type="success" :bordered="false">{{ previewAssets.portrait.length }} 个</n-tag>
                    <n-tag v-else size="tiny" type="default" :bordered="false">待上传</n-tag>
                  </div>
                </div>
              </div>
            </n-form-item>

            <!-- 二维码：不需要上传 -->
            <n-form-item v-if="settings.idleContent === 'qrCode'">
              <n-alert type="info" :bordered="false" class="tip-alert">
                扫码注册会员二维码自动居中显示，横竖屏共用。
              </n-alert>
            </n-form-item>

            <!-- 熄屏：不需要上传 -->
            <n-form-item v-if="settings.idleContent === 'black'">
              <n-alert type="warning" :bordered="false" class="tip-alert">
                终端进入待机后直接熄屏，统一节能策略。
              </n-alert>
            </n-form-item>

            <!-- 适配策略 -->
            <n-form-item label="资源适配策略">
              <div class="strategy-grid">
                <button
                  v-for="mode in fallbackModeOptions"
                  :key="mode.value"
                  type="button"
                  class="strategy-btn"
                  :class="{ active: settings.orientationFallbackMode === mode.value }"
                  @click="settings.orientationFallbackMode = mode.value"
                >
                  <strong>{{ mode.label }}</strong>
                  <span>{{ mode.description }}</span>
                </button>
              </div>
            </n-form-item>

            <!-- 超时 -->
            <n-form-item label="待机超时">
              <div class="timeout-row">
                <n-input-number
                  v-model:value="settings.idleSwitchInterval"
                  :min="10"
                  :max="300"
                  size="small"
                  style="width: 130px;"
                >
                  <template #suffix>秒</template>
                </n-input-number>
                <div class="timeout-chips">
                  <button
                    v-for="preset in timeoutPresets"
                    :key="preset"
                    type="button"
                    class="chip"
                    :class="{ active: settings.idleSwitchInterval === preset }"
                    @click="settings.idleSwitchInterval = preset"
                  >
                    {{ preset }}s
                  </button>
                </div>
              </div>
            </n-form-item>
          </n-form>
        </n-card>
      </div>

      <!-- 右栏：预览 -->
      <div class="preview-col">
        <n-card class="card-block" size="small">
          <template #header>
            <div class="card-head">
              <div>
                <div class="card-head-title">终端适配预览</div>
                <div class="card-head-desc">当前店铺横竖屏资源覆盖</div>
              </div>
              <n-tag v-if="orientationCoverageLabel === '双方向完整'" type="success" size="small" :bordered="false">完整</n-tag>
              <n-tag v-else-if="orientationCoverageLabel === '统一配置'" type="info" size="small" :bordered="false">无需上传</n-tag>
              <n-tag v-else type="warning" size="small" :bordered="false">待补充</n-tag>
            </div>
          </template>

          <!-- 摘要 -->
          <div class="preview-summary">
            <div class="summary-item">
              <span>待机内容</span>
              <strong>{{ idleContentLabelMap[settings.idleContent] }}</strong>
            </div>
            <div class="summary-item">
              <span>超时</span>
              <strong>{{ settings.idleSwitchInterval }}s</strong>
            </div>
            <div class="summary-item">
              <span>适配策略</span>
              <strong>{{ fallbackModeLabelMap[settings.orientationFallbackMode] }}</strong>
            </div>
          </div>

          <!-- 终端预览卡 -->
          <div class="preview-cards">
            <!-- 横版 -->
            <div class="preview-card" :class="{ ok: hasOrientationAssets('landscape') }">
              <div class="preview-card-top">
                <div class="preview-card-badge landscape-badge">
                  <n-icon :component="DesktopOutline" size="16" />
                </div>
                <div class="preview-card-label">
                  <strong>横版终端</strong>
                  <span>Landscape</span>
                </div>
                <div class="preview-card-dot" :class="hasOrientationAssets('landscape') ? 'dot-ok' : 'dot-miss'"></div>
              </div>
              <div class="preview-card-screen landscape-screen">
                <div class="screen-inner">
                  <n-icon :component="ImageOutline" size="32" />
                  <p>{{ activeOrientationSummary('landscape') }}</p>
                </div>
              </div>
              <div class="preview-card-foot" :class="{ ok: hasOrientationAssets('landscape') }">
                {{ hasOrientationAssets('landscape') ? '已就绪' : '待补充' }}
              </div>
            </div>

            <!-- 竖版 -->
            <div class="preview-card" :class="{ ok: hasOrientationAssets('portrait') }">
              <div class="preview-card-top">
                <div class="preview-card-badge portrait-badge">
                  <n-icon :component="PhonePortraitOutline" size="16" />
                </div>
                <div class="preview-card-label">
                  <strong>竖版终端</strong>
                  <span>Portrait</span>
                </div>
                <div class="preview-card-dot" :class="hasOrientationAssets('portrait') ? 'dot-ok' : 'dot-miss'"></div>
              </div>
              <div class="preview-card-screen portrait-screen">
                <div class="screen-inner">
                  <n-icon :component="ImageOutline" size="24" />
                  <p>{{ activeOrientationSummary('portrait') }}</p>
                </div>
              </div>
              <div class="preview-card-foot" :class="{ ok: hasOrientationAssets('portrait') }">
                {{ hasOrientationAssets('portrait') ? '已就绪' : '待补充' }}
              </div>
            </div>
          </div>

          <n-alert type="info" :bordered="false" class="tip-alert">
            终端优先读取同方向资源；缺失时若已开启自动回退，则使用另一方向。
          </n-alert>
        </n-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import {
  NAlert,
  NButton,
  NCard,
  NForm,
  NFormItem,
  NIcon,
  NInputNumber,
  NSelect,
  NSpace,
  NTag,
  NUpload,
  type UploadFileInfo,
  useMessage,
} from 'naive-ui'
import {
  AlertCircleOutline,
  CheckmarkCircleOutline,
  ChevronBackOutline,
  ChevronForwardOutline,
  DesktopOutline,
  ImageOutline,
  PhonePortraitOutline,
  VideocamOutline,
  QrCodeOutline,
  MoonOutline,
} from '@vicons/ionicons5'

// ── 类型 ──
type IdleContent = 'gamePreview' | 'poster' | 'qrCode' | 'black'
type Orientation = 'landscape' | 'portrait'
type FallbackMode = 'autoFallback' | 'sameOnly'

type ShopMeta = {
  label: string
  value: string
  region: string
  terminals: number
  status: string
  lastSavedAt: string
}

type ShopSettings = {
  idleContent: IdleContent
  idleSwitchInterval: number
  orientationFallbackMode: FallbackMode
}

type ShopDraft = {
  settings: ShopSettings
  posterAssets: Record<Orientation, UploadFileInfo[]>
  previewAssets: Record<Orientation, UploadFileInfo[]>
}

// ── 数据 ──
const message = useMessage()

const shopProfiles = ref<ShopMeta[]>([
  { label: '利民街小展厅', value: '利民街小展厅', region: '广州 海珠', terminals: 6, status: '待补竖版资源', lastSavedAt: '今天 09:20' },
  { label: '卓远萝岗区店', value: '卓远萝岗区店', region: '广州 黄埔', terminals: 14, status: '已配置完成', lastSavedAt: '今天 10:45' },
  { label: '卓远萧山区店', value: '卓远萧山区店', region: '杭州 萧山', terminals: 11, status: '待补横版资源', lastSavedAt: '昨天 18:10' },
  { label: '卓远亚运城店', value: '卓远亚运城店', region: '广州 番禺', terminals: 18, status: '已配置完成', lastSavedAt: '今天 11:30' },
  { label: '卓远文鼎路店', value: '卓远文鼎路店', region: '杭州 西湖', terminals: 9, status: '待确认策略', lastSavedAt: '昨天 16:25' },
])

const shopOptions = computed(() => shopProfiles.value.map(({ label, value }) => ({ label, value })))

const idleContentOptions = [
  { value: 'gamePreview' as IdleContent, label: '游戏预告片', description: '动态视频循环播放，适合高流量门店', icon: VideocamOutline },
  { value: 'poster' as IdleContent, label: '宣传海报', description: '静态海报轮播，维护成本更低', icon: ImageOutline },
  { value: 'qrCode' as IdleContent, label: '注册二维码', description: '会员拉新，静态二维码展示', icon: QrCodeOutline },
  { value: 'black' as IdleContent, label: '节能熄屏', description: '夜间或低客流时段自动熄屏', icon: MoonOutline },
]

const fallbackModeOptions = [
  { value: 'autoFallback' as FallbackMode, label: '自动回退', description: '缺少同方向资源时自动使用另一方向' },
  { value: 'sameOnly' as FallbackMode, label: '仅同方向', description: '只显示对应方向，需门店自行补齐' },
]

const timeoutPresets = [15, 20, 30, 45, 60, 120]

const idleContentLabelMap: Record<IdleContent, string> = {
  gamePreview: '视频待机',
  poster: '海报轮播',
  qrCode: '注册二维码',
  black: '节能熄屏',
}

const fallbackModeLabelMap: Record<FallbackMode, string> = {
  autoFallback: '自动回退',
  sameOnly: '仅同方向',
}

// ── 工具函数 ──
function createDefaultSettings(): ShopSettings {
  return { idleContent: 'gamePreview', idleSwitchInterval: 30, orientationFallbackMode: 'autoFallback' }
}

function cloneFiles(files: UploadFileInfo[]) {
  return files.map(file => ({ ...file }))
}

function cloneDraft(draft: ShopDraft): ShopDraft {
  return {
    settings: { ...draft.settings },
    posterAssets: {
      landscape: cloneFiles(draft.posterAssets.landscape),
      portrait: cloneFiles(draft.posterAssets.portrait),
    },
    previewAssets: {
      landscape: cloneFiles(draft.previewAssets.landscape),
      portrait: cloneFiles(draft.previewAssets.portrait),
    },
  }
}

function createShopDraft(seed?: Partial<ShopDraft>): ShopDraft {
  return {
    settings: { ...createDefaultSettings(), ...seed?.settings },
    posterAssets: {
      landscape: seed?.posterAssets?.landscape ? cloneFiles(seed.posterAssets.landscape) : [],
      portrait: seed?.posterAssets?.portrait ? cloneFiles(seed.posterAssets.portrait) : [],
    },
    previewAssets: {
      landscape: seed?.previewAssets?.landscape ? cloneFiles(seed.previewAssets.landscape) : [],
      portrait: seed?.previewAssets?.portrait ? cloneFiles(seed.previewAssets.portrait) : [],
    },
  }
}

const shopDrafts = ref<Record<string, ShopDraft>>({
  '利民街小展厅': createShopDraft({
    settings: { idleContent: 'poster', idleSwitchInterval: 20, orientationFallbackMode: 'sameOnly' },
    posterAssets: {
      landscape: [{ id: 'p1', name: 'lmin-01.png', status: 'finished', percentage: 100 }],
      portrait: [],
    },
  }),
  '卓远萝岗区店': createShopDraft({
    previewAssets: {
      landscape: [{ id: 'v1', name: 'luogang-01.mp4', status: 'finished', percentage: 100 }],
      portrait: [{ id: 'v2', name: 'luogang-v-01.mp4', status: 'finished', percentage: 100 }],
    },
  }),
  '卓远萧山区店': createShopDraft({
    settings: { idleContent: 'gamePreview', idleSwitchInterval: 45, orientationFallbackMode: 'autoFallback' },
    previewAssets: {
      landscape: [],
      portrait: [{ id: 'v3', name: 'xiaoshan-v-01.mp4', status: 'finished', percentage: 100 }],
    },
  }),
  '卓远亚运城店': createShopDraft({
    previewAssets: {
      landscape: [{ id: 'v4', name: 'yayun-l-01.mp4', status: 'finished', percentage: 100 }],
      portrait: [{ id: 'v5', name: 'yayun-p-01.mp4', status: 'finished', percentage: 100 }],
    },
  }),
  '卓远文鼎路店': createShopDraft({
    settings: { idleContent: 'qrCode', idleSwitchInterval: 60, orientationFallbackMode: 'autoFallback' },
  }),
})

// ── 状态 ──
const currentShop = ref('卓远亚运城店')
const settings = ref<ShopSettings>(createDefaultSettings())
const posterAssets = ref<Record<Orientation, UploadFileInfo[]>>({ landscape: [], portrait: [] })
const previewAssets = ref<Record<Orientation, UploadFileInfo[]>>({ landscape: [], portrait: [] })
const isDirty = ref(false)
const isHydrating = ref(false)
const hasInitialized = ref(false)

// ── 计算属性 ──
const currentShopIndex = computed(() => shopProfiles.value.findIndex(s => s.value === currentShop.value))
const activeShop = computed(() => ({ meta: shopProfiles.value.find(s => s.value === currentShop.value) || shopProfiles.value[0] }))

const firstIncompleteShop = computed(() =>
  shopProfiles.value.find(s => {
    const c = summarizeShopCoverage(s.value)
    return c !== '双方向完整' && c !== '统一配置'
  })?.value || null,
)

const orientationCoverageLabel = computed(() => {
  if (settings.value.idleContent === 'black' || settings.value.idleContent === 'qrCode') return '统一配置'
  const l = hasOrientationAssets('landscape')
  const p = hasOrientationAssets('portrait')
  if (l && p) return '双方向完整'
  if (l) return '仅横版'
  if (p) return '仅竖版'
  return '未上传'
})

const missingOrientationHints = computed(() => {
  if (settings.value.idleContent !== 'poster' && settings.value.idleContent !== 'gamePreview') return []
  const hints: string[] = []
  if (!hasOrientationAssets('landscape')) hints.push('横版资源未上传')
  if (!hasOrientationAssets('portrait')) hints.push('竖版资源未上传')
  return hints
})

// ── 店铺切换 ──
async function loadShopDraft(shop: string) {
  isHydrating.value = true
  const draft = shopDrafts.value[shop] || createShopDraft()
  const cloned = cloneDraft(draft)
  settings.value = cloned.settings
  posterAssets.value = cloned.posterAssets
  previewAssets.value = cloned.previewAssets
  await nextTick()
  isDirty.value = false
  isHydrating.value = false
  hasInitialized.value = true
}

function persistCurrentDraft() {
  shopDrafts.value[currentShop.value] = createShopDraft({
    settings: settings.value,
    posterAssets: posterAssets.value,
    previewAssets: previewAssets.value,
  })
}

async function switchShop(shop: string) {
  if (shop === currentShop.value) return
  persistCurrentDraft()
  currentShop.value = shop
  hasInitialized.value = false
  await loadShopDraft(shop)
}

function switchToPrevShop() {
  if (currentShopIndex.value <= 0) return
  void switchShop(shopProfiles.value[currentShopIndex.value - 1].value)
}

function switchToNextShop() {
  if (currentShopIndex.value >= shopProfiles.value.length - 1) return
  void switchShop(shopProfiles.value[currentShopIndex.value + 1].value)
}

function jumpToFirstIncomplete() {
  if (!firstIncompleteShop.value) return
  void switchShop(firstIncompleteShop.value)
}

// ── 资源 ──
function currentOrientationFiles(o: Orientation) {
  if (settings.value.idleContent === 'poster') return posterAssets.value[o]
  if (settings.value.idleContent === 'gamePreview') return previewAssets.value[o]
  return []
}

function hasOrientationAssets(o: Orientation) {
  return currentOrientationFiles(o).length > 0
}

function activeOrientationSummary(o: Orientation) {
  if (settings.value.idleContent === 'black') return '统一使用黑屏节能模式'
  if (settings.value.idleContent === 'qrCode') return '统一显示会员注册二维码'
  const count = currentOrientationFiles(o).length
  const fallbackO = o === 'landscape' ? 'portrait' : 'landscape'
  const fbCount = currentOrientationFiles(fallbackO).length
  const name = settings.value.idleContent === 'poster' ? '海报' : '视频'
  if (count > 0) return `已配置 ${count} 个${name}`
  if (settings.value.orientationFallbackMode === 'autoFallback' && fbCount > 0) return `回退使用${fallbackO === 'landscape' ? '横版' : '竖版'}${name}`
  return `暂无${name}资源`
}

function summarizeShopCoverage(shop: string) {
  const d = shopDrafts.value[shop]
  if (!d) return '未配置'
  const c = d.settings.idleContent
  if (c === 'black' || c === 'qrCode') return '统一配置'
  const a = c === 'poster' ? d.posterAssets : d.previewAssets
  const l = a.landscape.length > 0
  const p = a.portrait.length > 0
  if (l && p) return '双方向完整'
  if (l) return '仅横版'
  if (p) return '仅竖版'
  return '未上传'
}

// ── 保存 / 重置 ──
function saveSettings() {
  if (missingOrientationHints.value.length && settings.value.orientationFallbackMode === 'sameOnly') {
    message.warning(`当前选择"仅同方向"，但${missingOrientationHints.value.join('、')}`)
    return
  }
  persistCurrentDraft()
  const shop = shopProfiles.value.find(s => s.value === currentShop.value)
  if (shop) {
    shop.lastSavedAt = '刚刚'
    const coverage = summarizeShopCoverage(currentShop.value)
    shop.status = coverage === '双方向完整' || coverage === '统一配置' ? '已配置完成' : '待补资源'
  }
  isDirty.value = false
  message.success(`${currentShop.value} 的${idleContentLabelMap[settings.value.idleContent]}设置已保存`)
}

function resetSettings() {
  settings.value = createDefaultSettings()
  posterAssets.value = { landscape: [], portrait: [] }
  previewAssets.value = { landscape: [], portrait: [] }
  isDirty.value = true
}

watch(
  [settings, posterAssets, previewAssets],
  () => {
    if (isHydrating.value || !hasInitialized.value) return
    isDirty.value = true
  },
  { deep: true },
)

void loadShopDraft(currentShop.value)
</script>

<style scoped>
.page-container {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  gap: 16px;
  flex-wrap: wrap;
}

.shop-switch {
  display: flex;
  align-items: center;
  gap: 8px;
}

.shop-index {
  font-size: 13px;
  color: #999;
  min-width: 36px;
  text-align: center;
}

/* ── 布局 ── */
.layout-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(340px, 0.8fr);
  gap: 20px;
  align-items: start;
}

/* ── 卡片 ── */
.card-block {
  border-radius: 12px;
}

.card-block + .card-block {
  margin-top: 20px;
}

/* ── 内容类型按钮 ── */
.type-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.type-btn {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  border-radius: 8px;
  border: 1.5px solid #e8e8e8;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.type-btn:hover {
  border-color: #3B82F6;
}

.type-btn.active {
  border-color: #3B82F6;
  background: #f0f7ff;
}

.type-btn-icon {
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: all 0.2s;
}

.type-btn.active .type-btn-icon {
  background: #3B82F6;
  color: #fff;
}

.type-btn-body {
  flex: 1;
  min-width: 0;
}

.type-btn-body strong {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 3px;
}

.type-btn-body span {
  font-size: 12px;
  line-height: 1.5;
  color: #999;
}

.type-btn-check {
  position: absolute;
  top: 8px;
  right: 8px;
  color: #3B82F6;
}

/* ── 上传 ── */
.config-form {
  margin-top: 0;
}

.upload-dual {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  width: 100%;
}

.upload-card {
  padding: 14px;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
}

.upload-card-hd {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 10px;
}

.upload-card-hd strong {
  display: block;
  font-size: 13px;
  color: #333;
  margin-bottom: 2px;
}

.upload-card-hd span {
  font-size: 12px;
  color: #999;
}

.upload-card-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.stat-num {
  font-size: 12px;
  color: #666;
}

.tip-alert {
  border-radius: 8px;
}

/* ── 适配策略 ── */
.strategy-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  width: 100%;
}

.strategy-btn {
  padding: 14px;
  border-radius: 8px;
  border: 1.5px solid #e8e8e8;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
}

.strategy-btn:hover {
  border-color: #3B82F6;
}

.strategy-btn.active {
  border-color: #3B82F6;
  background: #f0f7ff;
}

.strategy-btn strong {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.strategy-btn span {
  font-size: 12px;
  line-height: 1.5;
  color: #999;
}

/* ── 超时 ── */
.timeout-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.timeout-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip {
  min-height: 30px;
  padding: 0 10px;
  border: 1px solid #e8e8e8;
  border-radius: 999px;
  background: transparent;
  color: #666;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.chip.active,
.chip:hover {
  border-color: #3B82F6;
  background: #f0f7ff;
  color: #3B82F6;
}

/* ── 预览区 ── */
.preview-col {
  position: sticky;
  top: 64px;
}

.preview-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 14px;
}

.summary-item {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
}

.summary-item span {
  display: block;
  font-size: 12px;
  color: #999;
  margin-bottom: 3px;
}

.summary-item strong {
  font-size: 13px;
  color: #333;
  font-weight: 600;
}

/* ── 终端预览卡 ── */
.preview-cards {
  display: grid;
  gap: 12px;
  margin-bottom: 12px;
}

.preview-card {
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  background: #fff;
  overflow: hidden;
  transition: all 0.2s;
}

.preview-card.ok {
  border-color: #c8e6c9;
}

.preview-card-top {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
}

.preview-card-badge {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.landscape-badge,
.portrait-badge {
  background: #3B82F6;
}

.preview-card-label {
  flex: 1;
  min-width: 0;
}

.preview-card-label strong {
  display: block;
  font-size: 12px;
  color: #333;
}

.preview-card-label span {
  font-size: 11px;
  color: #999;
}

.preview-card-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-ok {
  background: #4caf50;
}

.dot-miss {
  background: #ff9800;
}

.preview-card-screen {
  position: relative;
  overflow: hidden;
  background: #fafafa;
}

.landscape-screen {
  aspect-ratio: 16 / 9;
}

.portrait-screen {
  aspect-ratio: 9 / 16;
  max-height: 280px;
}

.screen-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 16px;
  text-align: center;
  color: #999;
}

.screen-inner .n-icon {
  margin-bottom: 6px;
  opacity: 0.35;
}

.screen-inner p {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: #666;
}

.preview-card-foot {
  padding: 6px 12px;
  font-size: 12px;
  color: #999;
  text-align: center;
}

.preview-card-foot.ok {
  color: #4caf50;
}

/* ── 响应式 ── */
@media (max-width: 1200px) {
  .layout-grid {
    grid-template-columns: 1fr;
  }
  .preview-col {
    position: static;
  }
  .portrait-screen {
    max-height: none;
  }
}

@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }
  .shop-switch {
    flex-wrap: wrap;
  }
  .type-grid {
    grid-template-columns: 1fr;
  }
  .upload-dual {
    grid-template-columns: 1fr;
  }
  .strategy-grid {
    grid-template-columns: 1fr;
  }
  .preview-summary {
    grid-template-columns: 1fr;
  }
  .timeout-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
