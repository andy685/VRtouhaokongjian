<template>
  <div class="page-container animate-fade-in">
    <div class="page-header">
      <div>
        <h1>游戏审核</h1>
        <p class="header-desc">审核供应商提交的游戏，设置定价与成本，自动结算</p>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
          <n-icon :component="TimeOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">待审核</span>
          <span class="value warning">6</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
          <n-icon :component="CheckmarkCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">本月通过</span>
          <span class="value">12</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #EF4444, #DC2626);">
          <n-icon :component="CloseCircleOutline" size="22" color="#fff" />
        </div>
        <div class="stat-content">
          <span class="label">本月拒绝</span>
          <span class="value error">3</span>
        </div>
      </div>
    </div>

    <!-- Tab切换 -->
    <n-tabs v-model:value="activeTab" type="line" style="margin-top: 24px;">
      <!-- 待审核列表 -->
      <n-tab-pane name="pending" tab="待审核">
        <div class="content-card">
          <n-data-table :columns="pendingColumns" :data="pendingData" :pagination="pagination" striped />
        </div>
      </n-tab-pane>

      <!-- 已审核列表 -->
      <n-tab-pane name="reviewed" tab="已审核">
        <div class="content-card">
          <div class="section-header">
            <n-space>
              <n-select v-model:value="reviewFilter" placeholder="审核结果" :options="reviewResultOptions" size="small" style="width: 140px;" clearable />
              <n-button size="small" secondary>刷新</n-button>
            </n-space>
          </div>
          <n-data-table :columns="reviewedColumns" :data="filteredReviewedData" :pagination="pagination" striped />
        </div>
      </n-tab-pane>

    </n-tabs>

    <!-- 审核弹窗 -->
    <n-modal v-model:show="showReviewModal" preset="card" title="游戏审核" style="width: 980px;" :bordered="false">
      <template #header>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span>游戏审核</span>
          <n-tag v-if="currentGame?.reviewType === 'update'" type="warning" size="small" :bordered="false">更新审核</n-tag>
          <n-tag v-else type="info" size="small" :bordered="false">新游审核</n-tag>
        </div>
      </template>
      <template v-if="currentGame">
        <div class="review-modal-body">
          <!-- 变更摘要（仅更新审核显示） -->
          <section v-if="currentGame.reviewType === 'update' && currentGame.changeManifest" class="detail-panel change-summary-panel">
            <div class="detail-panel-head">
              <div>
                <h4>变更摘要 · Change Manifest</h4>
                <p>本次更新涉及的内容变更一览，分发时将根据变更级别自动选择合适的策略。</p>
              </div>
              <n-tag :type="changeLevelTagType(currentGame.changeManifest.changeLevel)" size="small" :bordered="false">
                {{ currentGame.changeManifest.changeLevel }} · {{ changeLevelLabel(currentGame.changeManifest.changeLevel) }}
              </n-tag>
            </div>
            <div class="change-summary-body">
              <div class="change-summary-row">
                <span class="change-summary-label">版本对比</span>
                <span class="change-summary-value">
                  <code>{{ currentGame.changeManifest.fromVersion }}</code>
                  <span class="change-arrow">→</span>
                  <code>{{ currentGame.changeManifest.toVersion }}</code>
                </span>
              </div>
              <div v-if="currentGame.changeManifest.metadataChanges.length" class="change-summary-row">
                <span class="change-summary-label">元数据变更</span>
                <div class="change-summary-tags">
                  <n-tag v-for="m in currentGame.changeManifest.metadataChanges" :key="m.field"
                    size="tiny" type="info" :bordered="false">
                    {{ metadataFieldLabel(m.field) }} {{ m.action === 'update' ? '已更新' : m.action === 'add' ? '新增' : '删除' }}
                  </n-tag>
                </div>
              </div>
              <div class="change-summary-row">
                <span class="change-summary-label">构件变更</span>
                <div class="change-summary-tags">
                  <n-tag v-for="a in currentGame.changeManifest.artifactChanges" :key="a.role"
                    size="tiny" :type="a.action === 'update' ? 'warning' : a.action === 'add' ? 'success' : 'error'" :bordered="false">
                    {{ a.action === 'update' ? '⬆' : a.action === 'add' ? '➕' : '➖' }}
                    {{ resourceMeta(a.role).label }}
                    <template v-if="a.fileSize">({{ formatFileSize(a.fileSize) }})</template>
                  </n-tag>
                </div>
              </div>
              <div class="change-summary-row">
                <span class="change-summary-label">分发策略</span>
                <span class="change-summary-value" style="font-weight: 600;">
                  推荐
                  <n-tag :type="currentGame.changeManifest.changeLevel === 'L0' ? 'success' : currentGame.changeManifest.changeLevel === 'L1' ? 'warning' : 'error'" size="tiny" :bordered="false">
                    {{ currentGame.changeManifest.changeLevel === 'L0' ? '不入分发队列' : currentGame.changeManifest.changeLevel === 'L1' ? '仅分发变更构件' : '全量分发' }}
                  </n-tag>
                </span>
              </div>
            </div>
          </section>

          <section class="detail-panel">
            <div class="detail-panel-head">
              <div>
                <h4>基础信息</h4>
                <p>审核基础资料是否完整，确认版本、题材与体验方式一致。</p>
              </div>
              <div class="runtime-badges">
                <n-tag size="small" type="info" :bordered="false">{{ currentGame.platform }}</n-tag>
                <n-tag size="small" type="success" :bordered="false">{{ currentGame.gameModeLabel }}</n-tag>
              </div>
            </div>
            <n-descriptions label-placement="left" :column="2" bordered size="small">
              <n-descriptions-item label="游戏名称">{{ currentGame.name }}</n-descriptions-item>
              <n-descriptions-item label="版本号">{{ currentGame.version }}</n-descriptions-item>
              <n-descriptions-item label="供应商">{{ currentGame.cpName }}</n-descriptions-item>
              <n-descriptions-item label="游戏题材">{{ currentGame.category }}</n-descriptions-item>
              <n-descriptions-item label="游戏大小">{{ currentGame.size }}</n-descriptions-item>
              <n-descriptions-item label="游戏时长">{{ currentGame.duration }} 分钟</n-descriptions-item>
              <n-descriptions-item label="运行平台">{{ currentGame.platform }}</n-descriptions-item>
              <n-descriptions-item label="玩法模式">{{ currentGame.gameModeLabel }}</n-descriptions-item>
              <n-descriptions-item label="提交时间">{{ currentGame.submitTime }}</n-descriptions-item>
              <n-descriptions-item label="体验人数">{{ currentGame.playerCountLabel }}</n-descriptions-item>
              <n-descriptions-item label="游戏描述" :span="2">{{ currentGame.description }}</n-descriptions-item>
              <n-descriptions-item label="开发者备注" :span="2">{{ currentGame.devNote || '无' }}</n-descriptions-item>
            </n-descriptions>
          </section>

          <section class="detail-panel">
            <div class="detail-panel-head">
              <div>
                <h4>运行与资源规格</h4>
                <p>对照运行架构校验资源构件、启动方式、联网依赖与安装目标。</p>
              </div>
              <n-tag size="small" type="warning" :bordered="false">
                {{ getRequiredResourceCount(currentGame) }} 个必传资源
              </n-tag>
            </div>

            <div class="architecture-summary">
              <div class="architecture-title">
                <strong>{{ runtimeMeta(currentGame.runtimeArchitecture).title }}</strong>
                <span>{{ runtimeMeta(currentGame.runtimeArchitecture).description }}</span>
              </div>
              <div class="architecture-tags">
                <n-tag
                  v-for="tag in runtimeMeta(currentGame.runtimeArchitecture).tags"
                  :key="tag"
                  size="small"
                  :bordered="false"
                >
                  {{ tag }}
                </n-tag>
              </div>
            </div>

            <div class="spec-grid">
              <div class="spec-item">
                <span>安装目标</span>
                <strong>{{ installTargetLabelMap[currentGame.installTarget] || currentGame.installTarget || '未填写' }}</strong>
              </div>
              <div class="spec-item">
                <span>包名 / 应用标识</span>
                <strong>{{ currentGame.packageIdentifier || '未填写' }}</strong>
              </div>
              <div class="spec-item">
                <span>启动入口</span>
                <strong>{{ currentGame.entryPoint || '未填写' }}</strong>
              </div>
              <div class="spec-item">
                <span>启动参数</span>
                <strong>{{ currentGame.launchArgs || '无' }}</strong>
              </div>
              <div class="spec-item" v-if="currentGame.servicePort">
                <span>PC 服务端口</span>
                <strong>{{ currentGame.servicePort }}</strong>
              </div>
              <div class="spec-item" v-if="currentGame.startupOrder">
                <span>启动顺序</span>
                <strong>{{ startupOrderLabelMap[currentGame.startupOrder] || currentGame.startupOrder }}</strong>
              </div>
              <div class="spec-item" v-if="currentGame.networkMode">
                <span>网络模式</span>
                <strong>{{ networkModeLabelMap[currentGame.networkMode] || currentGame.networkMode }}</strong>
              </div>
              <div class="spec-item" v-if="currentGame.portList">
                <span>开放端口</span>
                <strong>{{ currentGame.portList }}</strong>
              </div>
              <div class="spec-item" v-if="currentGame.streamingProvider">
                <span>云串流服务商</span>
                <strong>{{ currentGame.streamingProvider }}</strong>
              </div>
              <div class="spec-item" v-if="currentGame.cloudGameId">
                <span>云游戏 ID</span>
                <strong>{{ currentGame.cloudGameId }}</strong>
              </div>
              <div class="spec-item" v-if="currentGame.externalPlatform">
                <span>外部平台</span>
                <strong>{{ currentGame.externalPlatform }}</strong>
              </div>
              <div class="spec-item" v-if="currentGame.externalGameId">
                <span>平台游戏 ID</span>
                <strong>{{ currentGame.externalGameId }}</strong>
              </div>
              <div class="spec-item" v-if="currentGame.webEntryUrl">
                <span>WebXR 入口</span>
                <strong>{{ currentGame.webEntryUrl }}</strong>
              </div>
              <div class="spec-item" v-if="currentGame.browserRequirement">
                <span>浏览器要求</span>
                <strong>{{ currentGame.browserRequirement }}</strong>
              </div>
            </div>

            <div class="technical-note">
              <span>安装与验收说明</span>
              <p>{{ currentGame.technicalNote || '未填写安装说明' }}</p>
            </div>
          </section>

          <section class="detail-panel">
            <div class="detail-panel-head">
              <div>
                <h4>资源与素材下载</h4>
                <p>审核时可逐项下载 APK、EXE、服务端、联机房间包以及运营素材进行核对。</p>
              </div>
            </div>

            <div class="download-section">
              <div class="download-group">
                <div class="download-group-title">游戏资源构件</div>
                <div class="resource-list">
                  <div
                    v-for="component in currentGame.resourceComponents"
                    :key="component.role"
                    class="resource-card"
                    :class="{ 'has-sha-diff': component.sha256 && component.prevSha256 && component.sha256 !== component.prevSha256 }"
                  >
                    <div class="resource-card-main">
                      <div class="resource-card-title">
                        <span>{{ resourceMeta(component.role).label }}</span>
                        <n-tag v-if="component.required" size="tiny" type="error" :bordered="false">必传</n-tag>
                        <n-tag v-else size="tiny" :bordered="false">可选</n-tag>
                        <n-tag v-if="component.sha256 && component.prevSha256 && component.sha256 !== component.prevSha256"
                          size="tiny" type="warning" :bordered="false">已变更</n-tag>
                        <n-tag v-else-if="component.sha256 && component.prevSha256"
                          size="tiny" type="success" :bordered="false">未变更</n-tag>
                      </div>
                      <p>{{ resourceMeta(component.role).description }}</p>
                      <div class="resource-file-meta">
                        <span>{{ component.fileName || '未上传资源文件' }}</span>
                        <span>{{ component.fileSize || resourceMeta(component.role).maxSizeText }}</span>
                      </div>
                      <div v-if="currentGame.reviewType === 'update' && component.sha256" class="resource-sha-diff">
                        <div class="sha-row">
                          <span class="sha-label">SHA256 (新)</span>
                          <code class="sha-value">{{ component.sha256 }}</code>
                        </div>
                        <div v-if="component.prevSha256" class="sha-row">
                          <span class="sha-label">SHA256 (旧)</span>
                          <code class="sha-value old">{{ component.prevSha256 }}</code>
                        </div>
                      </div>
                    </div>
                    <n-button
                      size="small"
                      type="primary"
                      secondary
                      :disabled="!component.fileName"
                      @click="downloadResource(currentGame, component)"
                    >
                      下载
                    </n-button>
                  </div>
                </div>
              </div>

              <div class="download-group">
                <div class="download-group-title">运营素材</div>
                <div class="asset-download-grid">
                  <div class="asset-download-card">
                    <div>
                      <strong>游戏封面</strong>
                      <p>{{ currentGame.coverName || '未上传封面' }}</p>
                    </div>
                    <n-button size="small" secondary :disabled="!currentGame.coverName" @click="downloadAsset(currentGame, 'cover')">下载</n-button>
                  </div>
                  <div class="asset-download-card">
                    <div>
                      <strong>宣传视频</strong>
                      <p>{{ currentGame.videoName || '未上传宣传视频' }}</p>
                    </div>
                    <n-button size="small" secondary :disabled="!currentGame.videoName" @click="downloadAsset(currentGame, 'video')">下载</n-button>
                  </div>
                  <div
                    v-for="banner in currentGame.bannerList"
                    :key="banner.name"
                    class="asset-download-card"
                  >
                    <div>
                      <strong>展位图</strong>
                      <p>{{ banner.name }}</p>
                    </div>
                    <n-button size="small" secondary @click="downloadBanner(currentGame, banner)">下载</n-button>
                  </div>
                  <div v-if="!currentGame.bannerList.length" class="asset-download-card empty">
                    <div>
                      <strong>展位图</strong>
                      <p>未上传展位图</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div class="review-section">
            <h4>审核配置</h4>
            <n-form label-placement="left" label-width="110">
              <n-form-item label="游戏豆定价" required>
                <n-input-number v-model:value="reviewForm.gameBeanCost" :min="1" placeholder="每次消耗游戏豆数量" style="width: 200px;" />
                <span style="margin-left: 8px; font-size: 12px; color: var(--text-muted);">豆/次</span>
              </n-form-item>
              <n-form-item label="单次成本" required>
                <n-input-number v-model:value="reviewForm.costPerPlay" :min="0" :step="0.01" placeholder="每次给供应商多少钱" style="width: 200px;" />
                <span style="margin-left: 8px; font-size: 12px; color: var(--text-muted);">元/次（给CP的分成）</span>
              </n-form-item>
              <n-form-item label="销售金额" required>
                <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
                  <div v-if="currentGame.presetPrice != null" class="preset-price-ref">
                    <span>CP建议零售价</span>
                    <strong>¥{{ currentGame.presetPrice.toFixed(2) }}</strong>
                    <span>元/次</span>
                  </div>
                  <div v-else class="preset-price-ref empty">
                    <span>CP未提供建议零售价，请审核定价</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <n-input-number v-model:value="reviewForm.salePrice" :min="0" :max="9999" :precision="2" placeholder="设置最终售价" style="width: 200px;" />
                    <span style="font-size: 12px; color: var(--text-muted);">元/次</span>
                  </div>
                </div>
              </n-form-item>
              <n-form-item label="价格摘要">
                <span style="font-size: 13px; color: var(--text-muted);">
                  售价 <b style="color: var(--text-primary);">¥{{ reviewForm.salePrice || 0 }}</b>/次，
                  消耗 <b style="color: var(--text-primary);">{{ reviewForm.gameBeanCost || 0 }}</b> 豆/次，
                  分成 <b style="color: var(--text-primary);">¥{{ reviewForm.costPerPlay || 0 }}</b>/次
                </span>
              </n-form-item>
              <n-form-item label="审核意见">
                <n-input v-model:value="reviewForm.comment" type="textarea" :rows="2" placeholder="给CP的审核反馈（不通过时必填）" />
              </n-form-item>
            </n-form>
          </div>
        </div>
      </template>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showReviewModal = false">取消</n-button>
          <n-button type="error" secondary @click="rejectGame">审核不通过</n-button>
          <n-button type="primary" @click="approveGame">审核通过</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NButton, NDataTable, NTag, NSelect, NIcon, NSpace, NTabs, NTabPane,
  NModal, NDescriptions, NDescriptionsItem, NForm, NFormItem, NInputNumber,
  NInput, useMessage
} from 'naive-ui'
import {
  TimeOutline, CheckmarkCircleOutline, CloseCircleOutline,
} from '@vicons/ionicons5'

const message = useMessage()
const activeTab = ref('pending')
const reviewFilter = ref<string | null>(null)
const pagination = { pageSize: 10 }

const reviewResultOptions = [
  { label: '全部', value: '' },
  { label: '已通过', value: 'passed' },
  { label: '未通过', value: 'rejected' },
]

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
  sha256?: string
  prevSha256?: string
}

type ChangeLevel = 'L0' | 'L1' | 'L2'

type ChangeManifest = {
  changeLevel: ChangeLevel
  fromVersion: string
  toVersion: string
  metadataChanges: { field: string; action: 'add' | 'update' | 'delete'; oldHash?: string; newHash?: string }[]
  artifactChanges: { role: ResourceRole; action: 'add' | 'update' | 'delete'; fileSize?: number; sha256?: string }[]
}

type ReviewGame = {
  id: number
  name: string
  cpName: string
  prevVersion?: string
  version: string
  category: string
  size: string
  duration: number
  platform: string
  gameMode: string
  gameModeLabel: string
  playerCountLabel: string
  reviewType: 'new' | 'update'
  submitTime: string
  description: string
  devNote: string
  runtimeArchitecture: RuntimeArchitecture
  installTarget: string
  packageIdentifier: string
  entryPoint: string
  launchArgs: string
  servicePort: string
  startupOrder: string
  networkMode: string
  portList: string
  technicalNote: string
  streamingProvider: string
  cloudGameId: string
  externalPlatform: string
  externalGameId: string
  webEntryUrl: string
  browserRequirement: string
  coverName: string
  videoName: string
  bannerList: { name: string }[]
  resourceComponents: ResourceComponent[]
  presetPrice: number | null
  changeManifest?: ChangeManifest
}

const runtimeArchitectureOptions: Record<RuntimeArchitecture, { title: string; description: string; tags: string[] }> = {
  pcvr: {
    title: 'PCVR 主机运行',
    description: '游戏安装在 Windows 主机，依赖头显串流或直连启动。',
    tags: ['EXE/ZIP', 'PC'],
  },
  headset_native: {
    title: '头显原生运行',
    description: '游戏直接安装在头显中，上传 APK 或头显内容包即可。',
    tags: ['APK', '头显'],
  },
  headset_with_pc_service: {
    title: '头显 + PC 服务终端',
    description: '单台或少量头显运行 APK，但必须连接本地 PC 服务做授权、同步、外设或房控。',
    tags: ['单机为主', 'PC 服务'],
  },
  multiplayer_server: {
    title: '多终端联机/主控',
    description: '多台头显进入同一房间联机，必须有主控/房间服务统一建房、同步与结算。',
    tags: ['多人联机', '主控服务'],
  },
  webxr: {
    title: 'WebXR 浏览器游戏',
    description: '通过浏览器访问 VR 内容，重点校验 URL、浏览器与缓存包。',
    tags: ['URL', 'Web Bundle'],
  },
  media_experience: {
    title: '沉浸式媒体内容',
    description: '非传统交互游戏，常见于 360 视频、互动影片与轻交互展项。',
    tags: ['视频资源', '媒体包'],
  },
}

const resourceRoleOptions: Record<ResourceRole, { label: string; description: string; maxSizeText: string }> = {
  headset_client: { label: '头显客户端', description: '安装在头显中的主程序包，通常为 APK。', maxSizeText: '建议单包 ≤ 8GB' },
  headset_data: { label: '头显数据包', description: '拆分的 OBB/资源数据包，需与头显客户端配套。', maxSizeText: '建议单包 ≤ 20GB' },
  pc_client: { label: 'PC 游戏主包', description: '安装在 Windows 主机的 EXE/ZIP 主程序。', maxSizeText: '建议单包 ≤ 30GB' },
  pc_service: { label: 'PC 服务终端', description: '房控、授权、联网、启动器等服务程序。', maxSizeText: '建议单包 ≤ 5GB' },
  server_room: { label: '联机房间服务', description: '多人联机房间创建、同步、结算所需服务端资源。', maxSizeText: '建议单包 ≤ 10GB' },
  web_bundle: { label: 'WebXR 内容包', description: 'WebGL/WebXR 站点资源包、离线缓存包或静态资源。', maxSizeText: '建议单包 ≤ 5GB' },
  media_content: { label: '媒体内容包', description: '360 视频、互动影片或媒体体验内容资源。', maxSizeText: '建议单包 ≤ 50GB' },
  dependency: { label: '依赖组件', description: '驱动、运行库、授权文件等附加依赖。', maxSizeText: '建议单包 ≤ 2GB' },
  patch: { label: '增量补丁', description: '更新审核时提交的差分补丁或热更新包。', maxSizeText: '建议单包 ≤ 10GB' },
}

const installTargetLabelMap: Record<string, string> = {
  windows_pc: 'Windows 主机',
  android_headset: 'Android 头显',
  web: 'Web 浏览器',
}

const startupOrderLabelMap: Record<string, string> = {
  pc_service_first: '先启动 PC 服务，再启动游戏',
  controller_first: '先启动房控/联机服务，再启动客户端',
  game_first: '先启动游戏，再由终端拉起依赖',
}

const networkModeLabelMap: Record<string, string> = {
  offline: '离线单机',
  lan: '局域网联机',
  internet: '公网联机',
  mixed: '混合网络',
}

// ========== 待审核数据 ==========
const pendingData = ref<ReviewGame[]>([
  {
    id: 1, name: '深海探险VR', cpName: '极境互动科技', version: '1.0.0', category: '冒险', size: '1.8GB', duration: 15,
    platform: '头显一体机', gameMode: 'standalone', gameModeLabel: '单机体验', playerCountLabel: '1 人',
    reviewType: 'new', submitTime: '2026-05-28 14:30', description: '潜入深海世界，探索未知海域，与海洋生物互动。支持体感控制。',
    devNote: '这是我们首款海洋题材 VR 游戏，画面精美，适合全年龄段。',
    runtimeArchitecture: 'headset_native', installTarget: 'android_headset', packageIdentifier: 'com.ocean.deepsea',
    entryPoint: 'com.ocean.deepsea.MainActivity', launchArgs: '', servicePort: '', startupOrder: '', networkMode: 'offline',
    portList: '', technicalNote: '头显内直接安装 APK。首次启动需授予存储与空间定位权限。',
    streamingProvider: '', cloudGameId: '', externalPlatform: '', externalGameId: '', webEntryUrl: '', browserRequirement: '',
    coverName: 'deepsea-cover.png', videoName: 'deepsea-trailer.mp4', bannerList: [{ name: 'deepsea-booth-01.png' }, { name: 'deepsea-booth-02.png' }],
    resourceComponents: [
      { role: 'headset_client', required: true, fileName: 'deepsea-vr-v1.0.0.apk', fileSize: '1.8 GB' },
      { role: 'dependency', required: false, fileName: 'deepsea-handtracking-plugin.zip', fileSize: '120 MB' },
    ],
    presetPrice: 38,
  },
  {
    id: 2, name: '赛博朋克2079', cpName: '闪耀游戏工作室', version: '0.5.0', category: '射击', size: '3.2GB', duration: 20,
    platform: 'PCVR', gameMode: 'online', gameModeLabel: '多人联机', playerCountLabel: '2-4 人',
    reviewType: 'new', submitTime: '2026-05-28 10:15', description: '未来都市背景的多人在线射击游戏，支持 4 人对战。',
    devNote: '目前是早期版本，后续会持续更新内容。',
    runtimeArchitecture: 'pcvr', installTarget: 'windows_pc', packageIdentifier: 'steam-app-42079',
    entryPoint: 'Cyber2079VR.exe', launchArgs: '-vr -matchmaking=lan', servicePort: '', startupOrder: '', networkMode: 'internet',
    portList: 'TCP 27015, UDP 27016', technicalNote: '需先在 Windows 主机安装主包，头显通过串流模式接入；建议显卡 RTX 3070 及以上。',
    streamingProvider: '', cloudGameId: '', externalPlatform: '', externalGameId: '', webEntryUrl: '', browserRequirement: '',
    coverName: 'cyberpunk-cover.png', videoName: 'cyberpunk-teaser.mp4', bannerList: [{ name: 'cyberpunk-booth.png' }],
    resourceComponents: [
      { role: 'pc_client', required: true, fileName: 'cyber2079-v0.5.0.zip', fileSize: '3.2 GB' },
      { role: 'patch', required: false, fileName: 'cyber2079-hotfix-0501.patch', fileSize: '240 MB' },
    ],
    presetPrice: 58,
  },
  {
    id: 3, name: '棋牌乐园', cpName: '乐游网络', version: '2.0.0', category: '休闲', size: '500MB', duration: 30,
    platform: '头显一体机', gameMode: 'online', gameModeLabel: '房间联机', playerCountLabel: '2-6 人',
    reviewType: 'new', submitTime: '2026-05-29 09:00', description: '包含斗地主、麻将等多款经典棋牌游戏，支持语音交流。',
    devNote: '已在线下棋牌室验证，用户粘性强。',
    runtimeArchitecture: 'multiplayer_server', installTarget: 'android_headset', packageIdentifier: 'com.leyou.cardvr',
    entryPoint: 'com.leyou.cardvr.MainActivity', launchArgs: '', servicePort: '17777', startupOrder: 'controller_first', networkMode: 'lan',
    portList: 'TCP 17777, UDP 17778', technicalNote: '头显与房间服务端需处于同一局域网，先启动房控程序再拉起头显客户端。',
    streamingProvider: '', cloudGameId: '', externalPlatform: '', externalGameId: '', webEntryUrl: '', browserRequirement: '',
    coverName: 'card-vr-cover.png', videoName: '', bannerList: [],
    resourceComponents: [
      { role: 'headset_client', required: true, fileName: 'card-vr-v2.0.0.apk', fileSize: '500 MB' },
      { role: 'server_room', required: true, fileName: 'card-vr-room-server-v2.0.0.zip', fileSize: '88 MB' },
    ],
    presetPrice: 25,
  },
  {
    id: 4, name: '极限滑雪', cpName: '极境互动科技', version: '1.2.0', category: '体育', size: '2.1GB', duration: 12,
    platform: '头显一体机', gameMode: 'standalone', gameModeLabel: '单机体验', playerCountLabel: '1 人',
    reviewType: 'new', submitTime: '2026-05-29 11:20', description: '模拟真实滑雪体验，多种赛道可选，支持体感控制。',
    devNote: '',
    runtimeArchitecture: 'headset_with_pc_service', installTarget: 'android_headset', packageIdentifier: 'com.extreme.ski',
    entryPoint: 'com.extreme.ski.MainActivity', launchArgs: '--gyro-mode=comfort', servicePort: '17890',
    startupOrder: 'pc_service_first', networkMode: 'lan', portList: 'TCP 17890', technicalNote: '头显安装 APK，PC 端同步启动授权服务；若房间断网会导致成绩上传失败。',
    streamingProvider: '', cloudGameId: '', externalPlatform: '', externalGameId: '', webEntryUrl: '', browserRequirement: '',
    coverName: 'ski-cover.png', videoName: 'ski-demo.mp4', bannerList: [{ name: 'ski-booth-01.png' }],
    resourceComponents: [
      { role: 'headset_client', required: true, fileName: 'extreme-ski-v1.2.0.apk', fileSize: '1.4 GB' },
      { role: 'pc_service', required: true, fileName: 'extreme-ski-service-v1.2.0.zip', fileSize: '220 MB' },
    ],
    presetPrice: 35,
  },
  {
    id: 5, name: '太空站', cpName: '星际科技', version: '1.0.0', category: '冒险', size: '4.5GB', duration: 25,
    platform: '沉浸式体验', gameMode: 'standalone', gameModeLabel: '单机体验', playerCountLabel: '1 人',
    reviewType: 'new', submitTime: '2026-05-29 16:00', description: '在国际空间站中完成各种任务，体验宇航员生活。',
    devNote: '与航天局合作素材，画面真实度极高。',
    runtimeArchitecture: 'media_experience', installTarget: 'android_headset', packageIdentifier: 'space-station-media',
    entryPoint: '播放列表 / 主场景入口', launchArgs: '', servicePort: '', startupOrder: '', networkMode: 'offline',
    portList: '', technicalNote: '内容以 360 视频和互动展项素材为主，头显本地播放即可，入场前校验素材完整性和播放顺序。',
    streamingProvider: '', cloudGameId: '', externalPlatform: '', externalGameId: '', webEntryUrl: '', browserRequirement: '',
    coverName: 'space-cover.png', videoName: 'space-trailer.mp4', bannerList: [{ name: 'space-booth-01.png' }],
    resourceComponents: [
      { role: 'media_content', required: true, fileName: 'space-station-experience-v1.0.0.zip', fileSize: '4.5 GB' },
      { role: 'dependency', required: false, fileName: 'space-station-codec-pack.zip', fileSize: '120 MB' },
    ],
    presetPrice: null,
  },
  {
    id: 6, name: '过山车VR', cpName: '极境互动科技', prevVersion: 'v2.3.2', version: 'v2.4.0', category: '冒险', size: '280M', duration: 10,
    platform: 'PCVR', gameMode: 'standalone', gameModeLabel: '单机体验', playerCountLabel: '1 人',
    reviewType: 'update', submitTime: '2026-05-30 09:15', description: '更新版本：新增两条赛道，优化画面渲染性能，修复联机掉线问题。',
    devNote: '根据用户反馈优化了晕动症适配参数。',
    runtimeArchitecture: 'pcvr', installTarget: 'windows_pc', packageIdentifier: 'rollercoaster-vr',
    entryPoint: 'RollerCoasterVR.exe', launchArgs: '-vr -comfort=2', servicePort: '', startupOrder: '', networkMode: 'offline',
    portList: '', technicalNote: '本次更新为主包 + 增量补丁模式，安装时先覆盖主包再执行补丁。',
    streamingProvider: '', cloudGameId: '', externalPlatform: '', externalGameId: '', webEntryUrl: '', browserRequirement: '',
    coverName: 'rollercoaster-cover.png', videoName: 'rollercoaster-v240.mp4', bannerList: [{ name: 'rollercoaster-booth-01.png' }, { name: 'rollercoaster-booth-02.png' }],
    resourceComponents: [
      { role: 'pc_client', required: true, fileName: 'rollercoaster-vr-v2.4.0.zip', fileSize: '2.4 GB',
        sha256: 'd4e5f6a7b8c9...3f2a1b0c', prevSha256: 'a1b2c3d4e5f6...8a7b6c5d' },
      { role: 'patch', required: false, fileName: 'rollercoaster-v2.4.0-hotfix.patch', fileSize: '280 MB',
        sha256: 'e8f7a6b5c4d3...7b6c5d4e', prevSha256: '' },
    ],
    presetPrice: 38,
    changeManifest: {
      changeLevel: 'L1',
      fromVersion: 'v2.3.2',
      toVersion: 'v2.4.0',
      metadataChanges: [
        { field: 'coverUrl', action: 'update', oldHash: 'abc123', newHash: 'def456' },
        { field: 'videoUrl', action: 'update', oldHash: 'vid789', newHash: 'vid012' },
        { field: 'description', action: 'update' },
      ],
      artifactChanges: [
        { role: 'pc_client', action: 'update', fileSize: 2576980378, sha256: 'd4e5f6a7b8c9...3f2a1b0c' },
        { role: 'patch', action: 'add', fileSize: 293601280, sha256: 'e8f7a6b5c4d3...7b6c5d4e' },
      ],
    },
  },
  // ── L0 示例：仅素材/元数据变更，不入分发队列 ──
  {
    id: 7, name: '恐怖医院', cpName: '极境互动科技', prevVersion: 'v1.8.5', version: 'v1.8.6', category: '恐怖', size: '—', duration: 12,
    platform: '一体机', gameMode: 'standalone', gameModeLabel: '单机体验', playerCountLabel: '1 人',
    reviewType: 'update', submitTime: '2026-06-28 16:45', description: '更新封面图与展位宣传图，调整游戏介绍文案。',
    devNote: 'CP 仅替换了封面图和 banner 素材，无任何二进制变更。',
    runtimeArchitecture: 'headset_native', installTarget: 'headset', packageIdentifier: 'horror-hospital',
    entryPoint: 'HorrorHospital.apk', launchArgs: '', servicePort: '', startupOrder: '', networkMode: 'offline',
    portList: '', technicalNote: '',
    streamingProvider: '', cloudGameId: '', externalPlatform: '', externalGameId: '', webEntryUrl: '', browserRequirement: '',
    coverName: 'horror-hospital-cover-v2.png', videoName: '', bannerList: [{ name: 'horror-booth-v2-01.png' }, { name: 'horror-booth-v2-02.png' }],
    resourceComponents: [
      { role: 'headset_client', required: true, fileName: 'horror-hospital-v1.8.5.apk', fileSize: '1.8 GB',
        sha256: 'b2c3d4e5f6a7...9b0c1d2e', prevSha256: 'b2c3d4e5f6a7...9b0c1d2e' },
      { role: 'headset_data', required: true, fileName: 'horror-hospital-data.obb', fileSize: '920 MB',
        sha256: 'c3d4e5f6a7b8...0c1d2e3f', prevSha256: 'c3d4e5f6a7b8...0c1d2e3f' },
    ],
    presetPrice: 48,
    changeManifest: {
      changeLevel: 'L0',
      fromVersion: 'v1.8.5',
      toVersion: 'v1.8.6',
      metadataChanges: [
        { field: 'coverUrl', action: 'update', oldHash: 'hh001', newHash: 'hh002' },
        { field: 'bannerList', action: 'update', oldHash: 'hb001', newHash: 'hb002' },
        { field: 'description', action: 'update' },
      ],
      artifactChanges: [],
    },
  },
  // ── L2 示例：运行架构变更，全量分发 ──
  {
    id: 8, name: '末日求生', cpName: '极境互动科技', prevVersion: 'v0.9.1', version: 'v1.0.0', category: '生存', size: '4.2G', duration: 30,
    platform: 'PCVR+一体机', gameMode: 'multiplayer_coop', gameModeLabel: '多人联机', playerCountLabel: '2-4 人',
    reviewType: 'update', submitTime: '2026-06-25 11:20', description: '重大版本升级：从一体机独占升级为 PCVR + 一体机双端架构，新增联机模式。',
    devNote: '运行架构从 headset 改为 dual_device，所有构件都需要换新。',
    runtimeArchitecture: 'headset_with_pc_service', installTarget: 'headset+pc', packageIdentifier: 'doomsday-survival',
    entryPoint: 'DoomsdayVR.exe', launchArgs: '-mode=mp', servicePort: '', startupOrder: 'pc_first', networkMode: 'online',
    portList: '7777,7778', technicalNote: 'PC 端需安装 SteamVR 运行时，头显端通过无线串流连接。',
    streamingProvider: '', cloudGameId: '', externalPlatform: '', externalGameId: '', webEntryUrl: '', browserRequirement: '',
    coverName: 'doomsday-v1-cover.png', videoName: 'doomsday-trailer-v1.mp4', bannerList: [{ name: 'doomsday-booth-v1.png' }],
    resourceComponents: [
      { role: 'headset_client', required: true, fileName: 'doomsday-quest-v1.0.0.apk', fileSize: '2.1 GB',
        sha256: 'f1a2b3c4d5e6...8e7d6c5b', prevSha256: 'a7b8c9d0e1f2...3a4b5c6d' },
      { role: 'headset_data', required: true, fileName: 'doomsday-assets.obb', fileSize: '1.5 GB',
        sha256: 'e1f2a3b4c5d6...7e8f9a0b', prevSha256: 'b8c9d0e1f2a3...4b5c6d7e' },
      { role: 'pc_client', required: true, fileName: 'doomsday-pc-v1.0.0.zip', fileSize: '4.2 GB',
        sha256: 'd1e2f3a4b5c6...9a0b1c2d', prevSha256: '' },
    ],
    presetPrice: 58,
    changeManifest: {
      changeLevel: 'L2',
      fromVersion: 'v0.9.1',
      toVersion: 'v1.0.0',
      metadataChanges: [
        { field: 'coverUrl', action: 'update', oldHash: 'ds001', newHash: 'ds002' },
        { field: 'videoUrl', action: 'add', newHash: 'dsv001' },
        { field: 'name', action: 'update' },
        { field: 'description', action: 'update' },
        { field: 'platform', action: 'update' },
        { field: 'gameMode', action: 'update' },
        { field: 'playerCountLabel', action: 'update' },
      ],
      artifactChanges: [
        { role: 'headset_client', action: 'update', fileSize: 2254857830, sha256: 'f1a2b3c4d5e6...8e7d6c5b' },
        { role: 'headset_data', action: 'update', fileSize: 1610612736, sha256: 'e1f2a3b4c5d6...7e8f9a0b' },
        { role: 'pc_client', action: 'add', fileSize: 4509715660, sha256: 'd1e2f3a4b5c6...9a0b1c2d' },
      ],
    },
  },
])

const pendingColumns = [
  { title: '游戏名称', key: 'name', width: 150 },
  { title: '供应商', key: 'cpName', width: 130 },
  { title: '版本', key: 'version', width: 90 },
  { title: '题材', key: 'category', width: 80 },
  { title: '类型', key: 'reviewType', width: 90,
    render(row: any) {
      return h(NTag, { type: row.reviewType === 'update' ? 'warning' : 'info', size: 'small', bordered: false }, () => row.reviewType === 'update' ? '更新审核' : '新游审核')
    }
  },
  { title: '大小', key: 'size', width: 80 },
  { title: '提交时间', key: 'submitTime', width: 150 },
  {
    title: '操作', key: 'action', width: 80, fixed: 'right',
    render(row: any) {
      return h(NButton, { size: 'tiny', type: 'primary', onClick: () => openReview(row) }, () => '审核')
    }
  },
]

// ========== 已审核数据 ==========
const reviewedData = ref([
  { id: 101, name: '恐怖医院', cpName: '极境互动科技', version: '1.8.5', result: 'passed', gameBeanCost: 25, costPerPlay: 8.75, salePrice: 48, reviewer: '管理员', reviewTime: '2026-05-18 15:30', comment: '内容质量优秀，通过' },
  { id: 102, name: '末日求生', cpName: '极境互动科技', version: '0.9.1', result: 'rejected', gameBeanCost: 0, costPerPlay: 0, salePrice: 0, reviewer: '管理员', reviewTime: '2026-05-27 10:00', comment: '游戏描述与内容不符，请修改后重新提交' },
  { id: 103, name: '极速赛车', cpName: '闪耀游戏工作室', version: '3.1.0', result: 'passed', gameBeanCost: 15, costPerPlay: 4.50, salePrice: 30, reviewer: '运营主管', reviewTime: '2026-05-15 14:00', comment: '品质优秀，定价15豆' },
  { id: 104, name: '过山车VR', cpName: '极境互动科技', version: '2.3.2', result: 'passed', gameBeanCost: 20, costPerPlay: 6.00, salePrice: 38, reviewer: '管理员', reviewTime: '2026-05-20 11:30', comment: '热门游戏更新版本，保持原定价' },
])

const filteredReviewedData = computed(() => {
  if (!reviewFilter.value) return reviewedData.value
  return reviewedData.value.filter(d => d.result === reviewFilter.value)
})

const reviewedColumns = [
  { title: '游戏名称', key: 'name', width: 140 },
  { title: '供应商', key: 'cpName', width: 140 },
  { title: '版本', key: 'version', width: 90 },
  {
    title: '审核结果', key: 'result', width: 100,
    render(row: any) {
      return h(NTag, { type: row.result === 'passed' ? 'success' : 'error', size: 'small', bordered: false }, () => row.result === 'passed' ? '通过' : '不通过')
    }
  },
  { title: '售价', key: 'salePrice', width: 90, render: (row: any) => row.salePrice ? `¥${row.salePrice}/次` : '-' },
  { title: '游戏豆', key: 'gameBeanCost', width: 90, render: (row: any) => row.gameBeanCost ? `${row.gameBeanCost} 豆/次` : '-' },
  { title: '分成成本', key: 'costPerPlay', width: 100, render: (row: any) => row.costPerPlay ? `¥${row.costPerPlay}/次` : '-' },
  { title: '审核人', key: 'reviewer', width: 90 },
  { title: '审核时间', key: 'reviewTime', width: 150 },
  { title: '审核意见', key: 'comment', width: 180, ellipsis: { tooltip: true } },
]

// ========== 审核弹窗 ==========
const showReviewModal = ref(false)
const currentGame = ref<ReviewGame | null>(null)
const reviewForm = ref({ gameBeanCost: 20, costPerPlay: 6, salePrice: 0, comment: '' })

function runtimeMeta(value: RuntimeArchitecture) {
  return runtimeArchitectureOptions[value]
}

function resourceMeta(role: ResourceRole) {
  return resourceRoleOptions[role]
}

function getRequiredResourceCount(game: ReviewGame) {
  return game.resourceComponents.filter(item => item.required).length
}

function changeLevelTagType(level: ChangeLevel) {
  return level === 'L0' ? 'success' : level === 'L1' ? 'warning' : 'error'
}

function changeLevelLabel(level: ChangeLevel) {
  return level === 'L0' ? '仅元数据变更' : level === 'L1' ? '部分构件变更' : '全量构件变更'
}

const metadataFieldNameMap: Record<string, string> = {
  coverUrl: '游戏封面',
  videoUrl: '宣传视频',
  bannerList: '展位图',
  name: '游戏名称',
  description: '游戏简介',
  category: '游戏题材',
  tags: '标签',
  gameBeanCost: '游戏豆消耗',
  timeLimitMinutes: '时长限制',
  timeLimitEnabled: '时长开关',
  payMode: '付费模式',
}

function metadataFieldLabel(field: string) {
  return metadataFieldNameMap[field] || field
}

function formatFileSize(bytes: number) {
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + ' GB'
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(0) + ' MB'
  if (bytes >= 1024) return (bytes / 1024).toFixed(0) + ' KB'
  return bytes + ' B'
}

function triggerMockDownload(fileName: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

function downloadResource(game: ReviewGame, component: ResourceComponent) {
  if (!component.fileName) return
  triggerMockDownload(
    `${component.fileName}.txt`,
    [
      `游戏：${game.name}`,
      `资源构件：${resourceMeta(component.role).label}`,
      `原始文件名：${component.fileName}`,
      `文件大小：${component.fileSize || '未知'}`,
      `运行架构：${runtimeMeta(game.runtimeArchitecture).title}`,
      `说明：${resourceMeta(component.role).description}`,
    ].join('\n'),
  )
  message.success(`已开始下载 ${component.fileName}`)
}

function downloadAsset(game: ReviewGame, assetType: 'cover' | 'video') {
  const fileName = assetType === 'cover' ? game.coverName : game.videoName
  if (!fileName) return
  const assetLabel = assetType === 'cover' ? '游戏封面' : '宣传视频'
  triggerMockDownload(
    `${fileName}.txt`,
    [
      `游戏：${game.name}`,
      `素材类型：${assetLabel}`,
      `原始文件名：${fileName}`,
      '说明：当前为审核后台演示数据，后续可替换为真实文件下载地址。',
    ].join('\n'),
  )
  message.success(`已开始下载${assetLabel}：${fileName}`)
}

function downloadBanner(game: ReviewGame, banner: { name: string }) {
  triggerMockDownload(
    `${banner.name}.txt`,
    [
      `游戏：${game.name}`,
      '素材类型：展位图',
      `原始文件名：${banner.name}`,
      '说明：当前为审核后台演示数据，后续可替换为真实文件下载地址。',
    ].join('\n'),
  )
  message.success(`已开始下载展位图：${banner.name}`)
}

function openReview(game: ReviewGame) {
  currentGame.value = game
  reviewForm.value = {
    gameBeanCost: 20,
    costPerPlay: 6,
    salePrice: game.presetPrice ?? 0,
    comment: '',
  }
  showReviewModal.value = true
}

function approveGame() {
  if (!reviewForm.value.gameBeanCost || !reviewForm.value.costPerPlay) {
    message.warning('请设置游戏豆定价和单次成本')
    return
  }
  if (!reviewForm.value.salePrice) {
    message.warning('请设置销售金额')
    return
  }
  // 从待审核移除，加入已审核
  const idx = pendingData.value.findIndex(g => g.id === currentGame.value.id)
  if (idx > -1) {
    const game = pendingData.value.splice(idx, 1)[0]
    reviewedData.value.unshift({
      id: game.id,
      name: game.name,
      cpName: game.cpName,
      version: game.version,
      result: 'passed',
      gameBeanCost: reviewForm.value.gameBeanCost,
      costPerPlay: reviewForm.value.costPerPlay,
      salePrice: reviewForm.value.salePrice,
      reviewer: '管理员',
      reviewTime: new Date().toLocaleString('zh-CN'),
      comment: reviewForm.value.comment || '审核通过',
    })
  }
  message.success(`「${currentGame.value.name}」审核通过，售价 ¥${reviewForm.value.salePrice}/次，消耗 ${reviewForm.value.gameBeanCost} 豆/次，分成 ¥${reviewForm.value.costPerPlay}/次`)
  showReviewModal.value = false
}

function rejectGame() {
  if (!reviewForm.value.comment) {
    message.warning('审核不通过时请填写审核意见')
    return
  }
  const idx = pendingData.value.findIndex(g => g.id === currentGame.value.id)
  if (idx > -1) {
    const game = pendingData.value.splice(idx, 1)[0]
    reviewedData.value.unshift({
      id: game.id,
      name: game.name,
      cpName: game.cpName,
      version: game.version,
      result: 'rejected',
      gameBeanCost: 0,
      costPerPlay: 0,
      salePrice: 0,
      reviewer: '管理员',
      reviewTime: new Date().toLocaleString('zh-CN'),
      comment: reviewForm.value.comment,
    })
  }
  message.info(`已拒绝「${currentGame.value.name}」的审核申请`)
  showReviewModal.value = false
}

</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
.header-desc { font-size: 13px; color: var(--text-muted); margin-top: 4px; }

.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: white; border-radius: 14px; padding: 20px; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 16px; }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-content { display: flex; flex-direction: column; }
.stat-content .label { font-size: 12px; color: var(--text-muted); }
.stat-content .value { font-family: 'Orbitron', sans-serif; font-size: 22px; font-weight: 700; color: var(--text-primary); }
.stat-content .value.warning { color: #F59E0B; }
.stat-content .value.error { color: #EF4444; }

.content-card { background: white; border-radius: 16px; padding: 24px; border: 1px solid var(--border-color); }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-header h3 { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0; }

.review-section {
  margin-top: 20px; padding-top: 20px;
  border-top: 1px solid var(--border-color);
}
.review-section h4 { font-size: 14px; font-weight: 600; color: var(--text-primary); margin: 0 0 16px; }

.preset-price-ref {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  background: #fef9f0;
  border: 1px solid #f8d9a0;
  font-size: 12px;
  color: var(--text-muted);
}
.preset-price-ref strong {
  color: #d4790e;
  font-size: 14px;
}
.preset-price-ref.empty {
  background: #f8f9fb;
  border-color: #dfe3e8;
  color: #8e98a3;
}

.review-modal-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 72vh;
  overflow-y: auto;
  padding-right: 4px;
}

.detail-panel {
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #fafcff 100%);
}

.detail-panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.detail-panel-head h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}

.detail-panel-head p {
  margin: 6px 0 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--text-muted);
}

.runtime-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.architecture-summary {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  padding: 14px 16px;
  border-radius: 14px;
  background: #f5f8ff;
  border: 1px solid #dbe7ff;
}

.architecture-title {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.architecture-title strong {
  font-size: 14px;
  color: var(--text-primary);
}

.architecture-title span {
  font-size: 12px;
  line-height: 1.7;
  color: var(--text-muted);
}

.architecture-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-content: flex-start;
  justify-content: flex-end;
}

.spec-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.spec-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  border-radius: 12px;
  background: white;
  border: 1px solid #edf2f7;
}

.spec-item span {
  font-size: 12px;
  color: var(--text-muted);
}

.spec-item strong {
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-primary);
  word-break: break-all;
}

.technical-note {
  margin-top: 14px;
  padding: 14px 16px;
  border-radius: 12px;
  background: #fffdf5;
  border: 1px solid #f7ebc5;
}

.technical-note span {
  display: block;
  font-size: 12px;
  color: #8a6d1d;
  margin-bottom: 6px;
}

.technical-note p {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--text-primary);
}

.download-section {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.download-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.download-group-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
}

.resource-list {
  display: grid;
  gap: 12px;
}

.resource-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid #edf2f7;
  background: white;
}

.resource-card-main {
  min-width: 0;
}

.resource-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.resource-card-title span {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
}

.resource-card p {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--text-muted);
}

.resource-file-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 10px;
  font-size: 12px;
  color: var(--text-secondary);
}

.asset-download-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.asset-download-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid #edf2f7;
  background: white;
}

.asset-download-card strong {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  color: var(--text-primary);
}

.asset-download-card p {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--text-muted);
  word-break: break-all;
}

.asset-download-card.empty {
  opacity: 0.7;
}

/* 变更摘要面板 */
.change-summary-panel {
  border-color: #fcd34d !important;
  background: linear-gradient(180deg, #fffbeb 0%, #ffffff 100%) !important;
}

.change-summary-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.change-summary-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 13px;
}

.change-summary-label {
  min-width: 72px;
  color: var(--text-muted);
  font-weight: 500;
  flex-shrink: 0;
  padding-top: 2px;
}

.change-summary-value {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-primary);
}

.change-summary-value code {
  padding: 2px 8px;
  border-radius: 4px;
  background: #f1f5f9;
  font-size: 12px;
  color: #334155;
}

.change-arrow {
  color: var(--text-muted);
  font-size: 12px;
}

.change-summary-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* 资源构件 SHA 对比 */
.resource-sha-diff {
  margin-top: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.sha-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
}

.sha-row + .sha-row {
  margin-top: 4px;
}

.sha-label {
  color: var(--text-muted);
  min-width: 80px;
  flex-shrink: 0;
}

.sha-value {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 3px;
  background: #e8f5e9;
  color: #2e7d32;
  word-break: break-all;
}

.sha-value.old {
  background: #fff3e0;
  color: #e65100;
}

.resource-card.has-sha-diff {
  border-color: #fcd34d;
  background: #fffdf5;
}

@media (max-width: 900px) {
  .stats-row,
  .spec-grid,
  .asset-download-grid {
    grid-template-columns: 1fr;
  }

  .architecture-summary,
  .resource-card,
  .asset-download-card,
  .detail-panel-head {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
