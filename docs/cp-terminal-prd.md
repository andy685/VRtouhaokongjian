# CP 端（游戏供应商终端）需求文档

## 一、角色定位与关系

### 1.1 角色关系链

```
CP 供应商 ──提交游戏──▶ 平台超管 ──审核分发──▶ 商家/门店 ──消费──▶ 终端用户
    ▲                      │                      │
    └──── 收益分成 ◀────────┴──── 结算对账 ◀────────┘
```

| 角色 | 终端 | 路由前缀 | 核心职责 |
|------|------|----------|---------|
| 平台超管 | Platform | `/platform` | 内容审核、分发配置、结算管理 |
| CP 供应商 | **CP（新增）** | **`/cp`** | **上传游戏、查看数据、收益提现** |
| 商家/门店 | Shop | `/shop` | 门店运营、会员管理 |
| 代理商 | Agent | `/agent` | 下级商家管理、分润查看 |

### 1.2 CP 端核心价值

- **去中心化内容供给**：CP 可以自助提交游戏，不用通过运营人工录入
- **数据透明化**：CP 实时查看自家游戏在平台上的表现
- **激励闭环**：游戏数据 → 收益分成 → 提现，形成正向激励

---

## 二、功能模块总览

```
/cp 路由树
├── /cp/dashboard         数据中心首页
├── /cp/games             我的游戏（列表）
├── /cp/games/add         上传新游戏
├── /cp/games/:id         游戏详情/编辑
├── /cp/games/:id/data    单游戏数据详情
├── /cp/finance           收益总览
├── /cp/finance/detail    收益明细
├── /cp/finance/withdraw  提现管理
├── /cp/account/info      CP 资料（公司信息、结算账户）
├── /cp/account/security  安全设置
├── /cp/account/message   消息通知
```

---

## 三、详细功能说明

### 3.1 数据中心首页 `/cp/dashboard`

**参考文件**：`PlatformLayout.vue` 模式、`views/platform/Dashboard.vue`、`views/platform/ContentConsumption.vue`

| 模块 | 内容 | 说明 |
|------|------|------|
| **核心指标卡片** | 累计游戏数、已上线数、审核中数、本月新增体验次数、本月收益 | 复用 Platform GameLibrary 的统计卡片模式 |
| **体验趋势图** | 近 30 天所有游戏的日体验次数折线图 | 可切换按日/周/月 |
| **游戏排行榜** | TOP 10 游戏按体验次数/收益排名 | 支持切换排序维度 |
| **收益趋势图** | 近 6 个月收益柱状图 | 含环比增长率 |
| **审核状态提醒** | 待审核 / 审核不通过（需修改）的游戏列表 | 快捷入口跳转到编辑页 |
| **平台公告** | 拉取平台通知中的公告内容 | 复用 NoticeAnnouncement 数据 |

### 3.2 我的游戏 `/cp/games`

**参考文件**：`views/platform/GameLibrary.vue`

#### 游戏列表

| 功能 | 说明 |
|------|------|
| 状态筛选 | 全部 / 已上线 / 审核中 / 审核不通过 / 草稿 / 已下架 |
| 搜索 | 按游戏名称搜索 |
| 排序 | 按更新时间 / 体验次数 / 收益 |
| 游戏卡片 | 封面图 + 名称 + 状态标签 + 体验次数 + 累计收益 + 更新时间 |

**状态流转**：
```
草稿 ──提交审核──▶ 审核中 ──通过──▶ 已上线 ──CP下架──▶ 已下架
  ▲                  │ 不通过              │ 平台下架
  └──修改重提────────┘                    ▼
                                     已下架（平台）
```

#### 列表每项操作

| 状态 | 可用操作 |
|------|---------|
| 草稿 | 编辑、提交审核、删除 |
| 审核中 | 查看、撤回 |
| 审核不通过 | 查看原因、编辑、重新提交 |
| 已上线 | 查看数据、申请下架 |
| 已下架 | 查看、重新提交 |

### 3.3 上传新游戏 `/cp/games/add`

**参考文件**：`views/platform/GameDetail.vue`（字段基本复用，权限做减法）

与平台端 GameDetail 的差异：

| 字段 | 平台端 | CP 端 |
|------|--------|-------|
| 游戏名称 | ✅ 可编辑 | ✅ 可编辑 |
| 游戏题材 | ✅ 可编辑 | ⚠️ 从平台已有题材中选择（不可新增题材） |
| 版本号 | ✅ | ✅ |
| 游戏大小 | ✅ | ✅ |
| 游戏时长 | ✅ | ✅ |
| 评分 | ✅ | ❌ 不显示（由平台运营统一管理） |
| 标签（动态标签） | ✅ | ⚠️ 从预设标签选取（不可自定义） |
| 上线状态 | ✅ | ❌ 不显示（提交后由平台审核状态替代） |
| 排序号 | ✅ | ❌ 隐藏（由平台统一管理） |
| 推荐标记 | ✅ | ❌ 隐藏 |
| 游戏描述 | ✅ | ✅ |
| 支持特性 | ✅ | ✅ |
| 游戏豆消耗 | ✅ | ⚠️ 只读（由平台定价） |
| 运行平台 | ✅ | ✅ |
| 玩法模式 | ✅ | ✅ |
| 付费模式 | ✅ | ✅ |
| 时长限制 | ✅ | ✅ |
| 宣传视频 | ✅ | ✅ |
| 封面图 | ✅ | ✅ |
| 展位图 | ✅ | ✅ |
| 资源包 | ✅ | ✅ |
| **建议分成比例** | — | 🆕 CP 可填写期望分成比（供平台参考） |
| **开发者备注** | — | 🆕 给审核人员的说明 |

### 3.4 单游戏数据详情 `/cp/games/:id/data`

**参考文件**：`views/platform/ContentConsumption.vue`、商家端点播汇总

| 数据模块 | 指标 | 说明 |
|---------|------|------|
| **核心指标** | 累计体验次数、本月体验次数、累计收益、本月收益 | 与 dashboard 指标卡片一致风格 |
| **体验趋势** | 近 30 天体验次数 + 收益双轴折线图 | 可按日/周/月切换 |
| **分发店铺** | 已分发到多少个商家/店铺、TOP 店铺排行 | 数据来源：ContentDistribute 的分发记录 |
| **用户画像** | 玩家平均时长、活跃时段分布热力图 | 帮助 CP 了解游戏受众 |
| **评分反馈** | 平台评分展示、用户评论摘要 | 参考 GameLibrary 的评分展示 |

### 3.5 收益管理 `/cp/finance`

**参考文件**：`views/platform/SettlementManage.vue`、`views/platform/Reconciliation.vue`、`views/shop/FilmRevenue.vue`、`views/agent/Commission.vue`

#### 收益总览 `/cp/finance`

| 模块 | 说明 |
|------|------|
| 账户余额卡片 | 可提现余额、累计收益、本月收益、上月收益 |
| 收益趋势图 | 近 12 个月收益变化 |
| 各游戏收益占比 | 饼图展示每个游戏贡献的收益比例 |
| 快速操作 | 申请提现按钮 → 跳转提现管理 |

#### 收益明细 `/cp/finance/detail`

| 字段 | 说明 |
|------|------|
| 时间 | 结算周期（按月） |
| 游戏名称 | |
| 体验次数 | 该游戏当月总体验次数 |
| 消费金额 | 消费者实际支付总额 |
| 分成比例 | CP 实际获得的分成比例（平台设定） |
| 分成金额 | = 消费金额 × 分成比例 |
| 结算状态 | 待结算 / 已结算 / 已提现 |
| 明细 | 展开查看按店铺/按日的明细 |

#### 提现管理 `/cp/finance/withdraw`

| 功能 | 说明 |
|------|------|
| 提现申请 | 输入金额（不超过可提现余额）、选择收款账户 |
| 提现记录 | 申请时间、金额、收款账户、状态（审核中/已打款/已拒绝） |
| 收款账户管理 | 绑定银行卡/支付宝（在账户设置页） |

### 3.6 消息通知 `/cp/account/message`

**参考文件**：`views/agent/Message.vue`、`views/platform/SystemNoticeInbox.vue`

| 通知类型 | 触发场景 |
|---------|---------|
| 审核结果 | 游戏审核通过 / 不通过（含原因） |
| 游戏下线通知 | 平台运营主动下架游戏 |
| 结算通知 | 月度结算完成，收益已到账 |
| 提现通知 | 提现申请审核结果 |
| 平台公告 | 平台发布的公告/政策更新 |
| 系统通知 | 账号安全、合同到期提醒等 |

### 3.7 CP 资料 `/cp/account/info`

**参考文件**：`views/shop/account/ShopInfo.vue`、`views/agent/AgentProfile.vue`

| 信息分组 | 字段 |
|---------|------|
| 公司信息 | 公司名称、营业执照号、联系人、联系电话、联系邮箱、公司地址 |
| 结算账户 | 账户类型（对公/对私）、开户行、开户名、账号、支付宝账号 |
| 合同管理 | 当前合作协议查看/下载（平台上传）、签约状态 |

---

## 四、与现有系统的关联

### 4.1 平台端需要配合的改动

| 平台端页面 | 改动内容 |
|-----------|---------|
| 游戏库 `GameLibrary.vue` | 新增「供应商」筛选列、显示 CP 来源 |
| 游戏详情 `GameDetail.vue` | 新增审核操作区（通过/不通过+原因）、查看 CP 信息、查看建议分成比 |
| 内容分发 `ContentDistribute.vue` | 分发时可看到 CP 来源信息 |
| 商家结算 | 结算数据需要拆分出 CP 分成部分 |
| **🆕 CP 管理页** | 新增：CP 列表、审核入驻、合同管理、分成比例配置 |

### 4.2 数据流关系

```
CP 提交游戏 ──▶ 平台审核 ──▶ 游戏库 ──▶ 内容分发 ──▶ 商家店铺
                                          │
                                          ▼
                              消费者体验（收银端/点播系统）
                                          │
                                          ▼
                              体验数据上报 ──▶ CP 数据看板
                              消费金额记录 ──▶ 结算系统 ──▶ CP 收益
```

---

## 五、非功能需求

| 维度 | 要求 |
|------|------|
| 资源包存储 | 支持断点续传、上传进度显示、最大 2GB |
| 审核流程 | 支持审核意见（文字 + 截图标注）、修改后重新提交 |
| 数据刷新 | 数据看板支持手动刷新，T+1 数据为准 |
| 权限控制 | CP 只能看到自己提交的游戏和数据，无法跨 CP 查看 |
| 移动端适配 | 数据看板核心指标适配移动端 H5 查看 |

---

## 六、路由规划

```typescript
// 参考 router/index.ts 中的模式，CPLayout 作为新布局
{
  path: '/cp',
  name: 'CP',
  component: CPLayout,           // 新建布局组件
  redirect: '/cp/dashboard',
  children: [
    { path: 'dashboard', component: () => import('../views/cp/Dashboard.vue') },
    { path: 'games', component: () => import('../views/cp/GameList.vue') },
    { path: 'games/add', component: () => import('../views/cp/GameEdit.vue') },
    { path: 'games/:id', component: () => import('../views/cp/GameEdit.vue') },
    { path: 'games/:id/data', component: () => import('../views/cp/GameDataDetail.vue') },
    { path: 'finance', component: () => import('../views/cp/FinanceOverview.vue') },
    { path: 'finance/detail', component: () => import('../views/cp/FinanceDetail.vue') },
    { path: 'finance/withdraw', component: () => import('../views/cp/Withdraw.vue') },
    { path: 'account/info', component: () => import('../views/cp/AccountInfo.vue') },
    { path: 'account/security', component: () => import('../views/cp/AccountSecurity.vue') },
    { path: 'account/message', component: () => import('../views/cp/Message.vue') },
  ]
}
```
