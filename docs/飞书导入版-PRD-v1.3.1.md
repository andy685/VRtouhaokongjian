# 头号空间（VR Touhao Kongjian）产品需求文档（PRD）

> **版本**: v1.3.1 | **日期**: 2026-05-04  
> **密级**: 内部公开 | **面向**: 技术团队 / 测试 / 运营 / 管理层 / 游戏CP

---

## 📑 目录

| # | 章节 | 说明 |
|:-:|------|------|
| 1 | [产品概述](#1) | 产品定义、核心价值、目标用户 |
| 2 | [商业模式](#2) | 硬件销售 + 游戏豆销售 + 代理商双维度分润 |
| 3 | [系统架构](#3) | 六大子系统、交互拓扑、技术选型 |
| 4 | [子系统功能详解](#4) | PC终端 / VR终端 / SDK / 管理后台 |
| 5 | [核心业务流程](#5) | 用户消费全流程 / 结算分润 / 多人Session / 离线恢复 |
| 6 | [数据模型与API](#6) | ORDER/GAME_SESSION/DEVICE_SHADOW 完整字段 / 全部API |
| 7 | [RBAC权限体系](#7) | 8角色4层级 / 数据隔离 / 权限矩阵 |
| 8 | [技术架构](#8) | 部署1:N / 游戏分发 / 技术栈 |
| 9 | [竞品分析](#9) | 幻影星空对比 |
| 10 | [实施路线图](#10) | Phase 1-4 / 人力估算 / 依赖图 |
| 11 | [开发执行规范](#11) | 环境 / 代码规范 / 任务拆解 |
| A | [附录](#a) | 术语表 / 色彩规范 / 版本历史 |

---

## 1. 产品概述

### 1.1 产品定义

**头号空间** 是一套面向 **VR线下体验店** 的全链路运营管理系统。平台通过 **硬件销售佣金** 和 **游戏豆销售** 盈利，代理商按区域分润。

系统由 **三大层级 + 六大子系统** 组成：

![系统架构图](images/fig01-architecture.svg)

### 1.2 核心价值主张

| 对象 | 核心价值 |
|------|---------|
| **商家** | 降本增效、数据洞察、设备管控、多端协同运营 |
| **C端用户** | 便捷预约、沉浸式消费、会员权益 |
| **代理商** | 区域分润(硬件+游戏豆)、管理工具、结算透明 |
| **平台** | 全网掌控、内容分发、财务闭环 |

### 1.3 目标用户画像

| 角色 | 年龄段 | 核心诉求 | 使用频率 |
|------|--------|---------|:--------:|
| 平台超管/运营/财务 | 28-45岁 | 全局数据 / 内容推广 / 结算对账 | 每日多次 |
| 代理商 | 30-50岁 | 多店业绩 / 分润收益 / 辖区管理 | 每周几次 |
| 店长/收银员/员工 | 18-40岁 | 营收清晰 / 操作便捷 | 每日高频 |
| C端消费者 | 12-45岁 | 便捷预约 / 沉浸体验 / 会员权益 | 按需使用 |

---

## 2. 商业模式

### 2.1 核心业务模型


```
                      ┌─────────────────────────────┐
                      │       头号空间 平台           │
                      │  (硬件代理 + 游戏豆销售)      │
                      └──┬──────────┬──────────────┘
                         │          │
              ┌──────────▼──┐  ┌───▼──────────┐
              │ ① 硬件销售  │  │ ② 游戏豆销售  │
              │ (设备套餐)  │  │ (B端运营代币)  │
              └──────┬──────┘  └──────┬────────┘
                     │                │
              ┌──────▼────────────────▼──────┐
              │        商家 (VR体验店)         │
              │  · 从平台采购游戏豆(启动游戏用)  │
              │  · 从平台购买设备套餐(硬件代理)  │
              │  · 自行定价向C端卖游戏项目      │
              └──────┬────────────────▲──────┘
                     │  C端付款(¥)    │
              ┌──────▼────────────────┘
              │      C端消费者          │
              │ 在商家处充值/购项目       │
              │ 玩游戏(消耗商家游戏豆)    │
              └────────────────────────┘
```

### 2.2 收入模式

#### 收入一：硬件销售（设备套餐代理）

| 项目 | 说明 |
|------|------|
| 产品形态 | 整套VR游戏设备套餐（头显+主机+外设+安装） |
| 供货来源 | 上游硬件厂商代理（非自研） |
| 平台角色 | 销售渠道 + 售前咨询 + 售后安装 + 软件预装 |
| 平台收入 | **设备售价 - 硬件采购成本 = 佣金** |
| 设备定价 | ¥15,000~¥50,000/套 |
| 下单方式 | 商家在"硬件商城"选购下单 |

#### 收入二：游戏豆（B端运营代币）

| 项目 | 说明 |
|------|------|
| 游戏豆定义 | **B端运营代币**，商家从平台购买，用户每玩一局消耗 |
| 购买方 | 商家（非C端用户） |
| 使用场景 | 用户付费玩游戏 → 商家后台自动扣减对应游戏豆 |
| 平台定价 | ¥1/豆（），商家自行配置每个游戏的豆消耗量 |
| 与C端关系 | C端用户不接触游戏豆。C端付¥给商家，商家消耗游戏豆 |
| 库存管理 | 商家预购，不足时补充，后台有库存预警 |

> **举例**：商家采购100,000豆(¥1/豆=¥100,000)。C端花¥39玩过山车VR，商家成本=消耗500豆(¥500)，毛利-¥461/次。

### 2.3 分润体系

#### 代理商层级

| 级别 | 保证金 | 硬件分润 | 游戏豆采购分润(基础) |
|------|:------:|:--------:|:------------------:|
| 城市代理 | ¥5,000 | 设备佣金的10% | 辖区采购额的3%-5% |
| 区域代理 | ¥20,000 | 设备佣金的15% | 辖区采购额的5%-8% |
| 省级总代 | ¥50,000 | 设备佣金的20% | 辖区采购额的8%-12% |

#### 硬件销售分润

```
商家下单¥30,000设备套餐 → 硬件成本¥20,000 → 平台佣金¥10,000
  → 省级总代分润: ¥10,000×20% = ¥2,000
  → 区域代理分润: ¥10,000×15% = ¥1,500
  → 平台净收入: ¥6,500
```

#### 游戏豆阶梯分润

以城市代理(基础5%)为例：

| 月采购额 | 系数 | 实际比例 |
|:--------:|:----:|:--------:|
| ¥0~49,999 | ×0.8 | 4.0% |
| ¥50,000~99,999 | ×1.0 | 5.0% |
| ¥100,000~199,999 | ×1.2 | 6.0% |
| ≥¥200,000 | ×1.5 | 7.5% |

**例**：月采购额¥120,000 → 落在×1.2档 → ¥120,000×5%×1.2=**¥7,200**（全额按档位计算）

#### 结算安全机制

| 项目 | 规则 |
|------|------|
| 结算周期 | T+1 月结（次月15日前） |
| 最低提现 | ¥100（不足累积下月） |
| 安全机制 | 修改账户需10分钟冷却期 + 短信验证码 |

---

## 3. 系统整体架构

### 3.1 子系统清单

| # | 子系统 | 技术栈 | 页数 | 完成度 |
|:-:|--------|--------|:----:|:------:|
| 1 | **C端微信小程序** | uni-app/Vue3 | ~15 | 规划中 |
| 2 | **PC收银系统** | Electron+Vue3 | ~20 | 规划中 |
| 3 | **PC游戏终端** | Electron/WPF | ~8 | 规划中 |
| 4 | **VR头显终端** | Unity XR | ~5 | ✅ v1.3完成 |
| 5 | **商家管理后台** | Vue3+NaiveUI | ~75 | ✅ 骨架完成 |
| 6 | **代理商系统** | Vue3(琥珀主题) | ~12 | ✅ 骨架完成 |
| 7 | **总运营后台** | Vue3(蓝紫主题) | ~55 | ✅ 骨架完成 |
| 8 | **游戏SDK** | C++17/C# | — | ✅ v1.3完成 |

### 3.2 技术选型

| 层级 | 选型 |
|------|------|
| Web前端 | Vue3 + TypeScript + Vite + NaiveUI + ECharts + Pinia |
| PC终端 | Electron 28+ / Tauri 2 |
| 小程序 | uni-app (Vue3) |
| VR终端 | Pico SDK / Meta XR SDK + Unity XR Plugin |
| 游戏SDK | C++17 (core) + C# (Unity wrapper) |
| 后端 | NestJS + Prisma/TypeORM |
| 数据库 | PostgreSQL 16+ / Redis 7+ / MongoDB 6+ |
| 基础设施 | MinIO/OSS / RabbitMQ / MQTT / Docker-K8s |

---

## 4. 子系统功能详解

### 4.1 PC游戏终端

> **形态**: Windows全屏kiosk应用（触摸屏）  
> **UI风格**: 深蓝色沉浸式 `#0A1628` + 电光蓝 `#3B82F6`

#### PC终端状态流转

![PC终端状态](images/fig-pc-states.svg)

| # | 状态 | UI要素 |
|---|------|--------|
| 1 | **Idle 待机** | Logo + 宣传视频循环 + "点击开始"大按钮 + 设备状态 |
| 2 | **GameSelect** | 4x3大图标网格 + 分类筛选(刺激/恐怖/休闲) + 价格/时长/难度 |
| 3 | **GameDetail** | 大图/视频 + 名称/价格/星级/时长 + "开始体验" |
| 4 | **QRPayment** | 微信/支付宝大二维码 + 金额 + 15分钟倒计时 + 状态轮询 |
| 5 | **AssignDevice** | 已分配设备编号 + VR位置指引 + "请佩戴 #03 头盔" |
| 6 | **Playing** | VR画面镜像 + 剩余时间 + 进度条 + [提前结束] |
| 7 | **Settlement** | 消费明细 + 余额 + 五星评分 + 分享 + 打印(可选) |

> **关键**: PC终端负责所有用户交互。VR头显仅做纯沉浸体验，不做任何UI。

---

### 4.2 VR头显终端

> **核心原则**: VR头显内 **不做任何可有可无的UI**。用户戴头盔的唯一目的就是沉浸式玩游戏。

#### VR终端状态流转

![VR终端状态](images/fig-vr-states.svg)

#### 5个核心状态

| 状态 | 用户看到 | 说明 |
|------|---------|------|
| **Idle** | Logo浮空(30秒淡出至纯黑) | 等待PC终端分配 |
| **Loading** | Logo+环形进度(最多3秒) | 收到MQTT指令后自动加载 |
| **GameRunning** | **纯游戏画面，0 HUD** | 沉浸体验，SDK后台心跳 |
| **GameEnded** | "体验已结束，请取下头盔"(3秒) | 自动返回待机 |
| **Error** | "⚠️系统异常，请联系店员" | 常驻不消失 |

#### Launcher 拉起协议

MQTT `/device/{deviceId}/command`:

```json
{
  "command": "launch_game",
  "params": {
    "game_id": "roller-coaster-vr",
    "game_package": "com.thk.rollercoster",
    "arguments": {
      "session_id": "sess_123",
      "api_base_url": "https://api.touhaokongjian.com/v2",
      "store_token": "tk_store_xxx"
    }
  },
  "expires_at": 1714435200000,
  "signature": "hmac-sha256-..."
}
```

| MQTT命令 | 说明 |
|----------|------|
| `launch_game` | 拉起游戏（PC终端支付成功触发） |
| `force_stop` | 强制结束（PC终端点击"结束"） |
| `reboot` | 重启Launcher（远程维护） |
| `fetch_logs` | 上传日志（远程诊断） |

#### 暂停计费规则

```
摘盔→Session标记paused→暂停期间⏸不计费
→ 3分钟内重新佩戴→自动恢复
→ 3分钟超时→自动结束Session
实际付费时长 = actual_duration_sec - pause_duration_sec
```

#### 技术规格

| 项目 | 规格 |
|------|------|
| 渲染层级 | 2层: Logo/文字 → 全屏游戏画面 |
| 存储 | Launcher < 50MB |
| 待机功耗 | < 15% |
| 部署比例 | 1台PC : 4~8台VR（后端统一调度） |

---

### 4.3 游戏SDK

> **定位**: 连接VR头显/PC终端与平台后端的桥梁中间件  
> **核心原则**: 零侵入 / 高可靠 / 轻量(<50MB)

#### SDK 架构

```
                    Game App (Unity/Unreal/Native)
                            ↓ SDK API
               ┌──────────────────────────┐
               │     SDK Core (C++17)      │
               │  ① Session Manager       │
               │  ② Billing Engine        │
               │  ③ Device Manager        │
               │  ④ Event & Telemetry     │
               │  ⑤ Logging & Diagnostics │
               │  ⑥ Security Module       │
               │  ⑦ Network Layer         │
               └──────────────────────────┘
               ┌──────────────────────────┐
               │  Platform Adapters       │
               │ Windows/Linux/Android    │
               │ Unity C# / Unreal Plugin │
               └──────────────────────────┘
```

#### 核心 API

```cpp
// 初始化
int initialize(const SdkConfig& cfg);  // api_base_url, device_id, store_token
void shutdown();

// Session
SessionHandle createSession(const SessionParams& params);
Result startSession(SessionHandle h);       // 开始计费
Result pauseSession(SessionHandle h);       // 暂停(不计费)
SessionResult endSession(SessionHandle h);  // 结算
Result heartbeat(SessionHandle h, float progress);  // 每60秒

// 计费
BalanceInfo queryBalance(const string& memberId);
PreAuthResult preAuthorize(const string& memberId, int expectedMinutes);
```

#### 错误码

| 码 | 说明 | 处理 |
|:--:|------|------|
| 0 | 成功 | — |
| -200 | 网络失败 | 队列重试 |
| -300 | Token认证失败 | 检查storeToken |
| -400 | Session不存在 | 检查sessionId |
| -500 | 余额不足 | 引导充值 |
| -800 | 离线数据冲突 | 以服务端为准，上报审核 |

#### 离线队列冲突解决

```
三大原则：
1️⃣ FIFO严格重放 - 离线期间请求按时间戳顺序重放
2️⃣ 幂等覆盖 - 服务端以最终状态为准（幂等Key保留72h）
3️⃣ 冲突人工审核 - 不一致时标记CONFLICT → 运营审核
```

---

### 4.4 管理后台模块

| 后台 | 页面数 | 核心功能 |
|------|:------:|---------|
| **商家管理后台** | ~75页 | 工作台/商品/运营/会员/报表/财务/设置 |
| **代理商系统** | ~12页 | 首页/商家/店铺/分润/结算/提现/报表/设置 |
| **总运营后台** | ~55页 | 数据中心/门店/内容/会员/订单/财务/账号/运维 |

#### 平台财务模块（9页）

| 页面 | 功能 |
|------|------|
| **营收总览** | 全平台收入(硬件佣金+游戏豆销售)/月趋势/Top排行 |
| **硬件商城** | 设备套餐展示/商家下单/成本录入/佣金计算/发货 |
| **游戏豆销售** | 采购明细/商家排名/采购趋势/库存预警 |
| **商家结算** | 月度流水/待结算/已打款/异常标记 |
| **代理商结算** | 分润概览/阶梯系数/本月应发 |
| **阶梯策略配置** | 规则CRUD/系数矩阵/模拟计算器/版本管理 |
| **打款管理** | 自动+异常处置/自动提交/失败重试 |
| **对账中心** | 四方自动比对(平台/支付渠道/商家/代理) |
| **财务报表** | 损益表/现金流/ARPU趋势 |

---

## 5. 核心业务流程

### 5.1 用户到店消费全流程

![用户消费流程](images/fig09-consumption-flow.svg)

#### 场景一：散客自助体验

```
1. 到店 → 2. PC终端浏览游戏(无需登录)
3. 选游戏 → 点击"开始体验" → 原价
4. 扫码支付(微信/支付宝)
5. 后端回调成功 → 分配空闲VR设备 → "请佩戴 #03 头盔"
6. 佩戴VR → 自动加载游戏 → 纯沉浸游玩
7. 游戏结束 → PC终端结算(消费金额+评分入口)
```

#### 场景二：会员身份消费

```
1. 到店 → 2. PC终端微信扫码登录/手机号验证
3. 验证身份 → 显示会员信息(余额/等级/折扣)
4. 支付(余额/次数/扫码) → 分配设备
5. 游玩 → 结束 → PC结算(含积分变动)
```

#### 场景三：小程序预约到店

```
1. 预约时段 → 2. 到店核销预约码
   ├─ 已预付: 直接分配设备
   └─ 未预付: PC终端支付
3. 游玩 → 结算
```

### 5.2 订单生命周期

![订单周期](images/fig10-order-lifecycle.svg)

`Created → Paid → Processing → Completed`（正常）
`Cancelled`（超时取消）/ `Refunded`（退款）

### 5.3 结算分润流程

#### 分润一：硬件销售分润（实时）

```
商家下单设备→平台佣金→代理商按比例分润(10%-20%)
```

#### 分润二：游戏豆分润（月末汇总）

```
月采购额汇总→阶梯匹配→系数应用→分润计算
```

#### 结算周期

| 时间 | 操作 |
|------|------|
| 月末23:59 | 冻结当月数据 |
| 次月1-3日 | 汇总硬件分润+游戏豆阶梯分润→生成结算单 |
| 次月4-7日 | 公示期（可申诉） |
| 次月15日前 | 打款完成 |

### 5.4 设备状态机

![设备状态](images/fig13-device-state.svg)

### 5.5 多人Session计费

> **各付各的**：每人独立Session、独立扣费、退出互不影响

```
GROUP_SESSION: group_id, game_id, host_device_id, member_devices[]
→ 每台VR设备各自GAME_SESSION(独立计时/计费/心跳/退出)
```

### 5.6 离线恢复

| 场景 | 处理 |
|------|------|
| **断网** | SDK本地缓存→3分钟超时自动结束→联网后FIFO重放→冲突审核 |
| **断电** | 后端90秒标记offline→上电后检查unfinished_session→按最后心跳计费 |

---

## 6. 数据模型与API

### 6.1 ORDER 订单表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| order_no | VARCHAR(32) | 格式: `THK{门店}{8位日期}{6位序列}` |
| store_id | UUID | 门店ID |
| member_id | UUID | 会员(空=散客) |
| terminal_type | ENUM | cashier/pc_terminal/vr_headset/miniapp/manual |
| order_type | ENUM | consume/recharge/refund/gift/adjust |
| status | ENUM | created/paid/processing/completed/cancelled/refunding/refunded/failed |
| actual_amount | DECIMAL(10,2) | 实付金额 |
| **session_id** | VARCHAR(64) | **关联GAME_SESSION(1:1)** |
| **payment_channel** | ENUM | **wechat/alipay/balance/cash** |
| **transaction_id** | VARCHAR(128) | **渠道流水号** |
| **refund_status** | ENUM | **none/partial/full** |
| **platform_commission** | DECIMAL(10,2) | **平台佣金(硬件)** |
| **agent_commission** | DECIMAL(10,2) | **代理分润** |
| created_at | TIMESTAMP | 创建 |
| paid_at | TIMESTAMP | 支付 |

### 6.2 GAME_SESSION 游戏会话表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(64) | `sess_{日期}_{6位随机}` |
| order_id | UUID | 关联ORDER |
| device_id | VARCHAR(64) | VR设备ID |
| game_id | UUID | 游戏ID |
| session_type | ENUM | single/multi |
| billing_mode | ENUM | by_time/by_count/package |
| unit_price | DECIMAL(10,4) | 单价(元/分钟) |
| actual_duration_sec | INT | 实际游玩时长 |
| **pause_duration_sec** | INT | **暂停累计(不计费)** |
| pre_auth_id | VARCHAR(64) | 预授权ID |
| status | ENUM | pending/running/paused/ended/abnormal/force_ended |
| total_fee | DECIMAL(10,2) | 结算费用 |
| offline_created | BOOLEAN | 是否离线 |

### 6.3 核心 API

#### 终端API（15个）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/terminal/auth` | 终端认证 |
| GET | `/terminal/games` | 游戏列表 |
| POST | `/terminal/session/create` | 创建会话 |
| POST | `/terminal/session/:id/start` | 开始 |
| POST | `/terminal/session/:id/pause` | 暂停(不计费) |
| POST | `/terminal/session/:id/resume` | 恢复 |
| POST | `/terminal/session/:id/end` | 结束结算 |
| POST | `/terminal/session/:id/extend` | 续费 |
| POST | `/terminal/session/:id/force-stop` | 强制结束 |
| POST | `/terminal/session/:id/heartbeat` | 心跳 |
| WS | `/ws/terminal/:deviceId/events` | 事件推送 |

#### 支付回调API

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/payment/wechat/notify` | 微信支付回调 |
| POST | `/payment/alipay/notify` | 支付宝回调 |
| GET | `/payment/query/:order_id` | 支付状态查询 |

---

## 7. RBAC 权限体系

### 7.1 角色层级

![RBAC层级](images/fig-rbac-hierarchy.svg)

| 层级 | 角色 | 可见范围 |
|:----:|------|---------|
| L1 | 超管/运营/财务/内容 | 全平台 |
| L2 | 代理商 | 仅管辖区域 |
| L3 | 店长/收银员/员工 | 仅本店 |
| L4 | C端会员/游客 | 仅自己数据 |

---

## 8. 技术架构

### 8.1 门店部署

![部署架构](images/fig-deployment.svg)

| 项目 | 说明 |
|------|------|
| 部署模式 | 1台PC终端 : N台VR头显（后端统一调度） |
| 建议比例 | 1:4~1:8 |
| 游戏分发 | MinIO/OSS → VR Launcher后台静默下载 |
| 设备分配 | 排除低电量/过热/维修中，分配后锁定防冲突 |

### 8.2 工程结构

```
admin-dashboard/          # Web三套后台（Vue3+NaiveUI）
cashier-app/              # PC收银系统（Electron）
pc-terminal/              # PC游戏终端（Electron kiosk）
mini-program/             # C端微信小程序（uni-app）
vr-headset/               # VR头显Launcher（Unity）
game-sdk/                 # 游戏SDK（C++17 core + C# wrapper）
  ├── core/               # C++17 核心库
  │   ├── include/        # 公共API头文件
  │   ├── src/            # 实现(session/billing/device/network)
  │   └── third_party/    # curl/mqtt-cpp/json
  ├── unity-wrapper/      # Unity C# 封装
  ├── platform/           # Windows/Linux/Android适配
  └── tests/              # 测试工具+Test Harness
```

---

## 9. 竞品分析

| 维度 | 幻影星空 | 头号空间 |
|------|---------|----------|
| 架构 | 双后台割裂 | **统一平台+RBAC+六端联动** |
| 权限 | 游客模式 | **8角色矩阵+终端权限** |
| 终端 | 仅PC后台 | **PC收银+PC终端+VR+小程序+SDK** |
| 代理商 | 不完善 | **完整分润+阶梯+安全** |
| 游戏接入 | 封闭生态 | **开放SDK+标准化接入** |
| VR体验 | 无统一方案 | **纯沉浸式Launcher+SDK** |

---

## 10. 实施路线图

### 10.1 当前进度

| 子系统 | 前端 | API | 规范 | 进度 |
|--------|:----:|:---:|:----:|:----:|
| 商家后台 | ✅75页 | ❌ | — | ~30% |
| 代理商 | ✅12页 | ❌ | — | ~25% |
| 总运营后台 | ✅55页 | ❌ | — | ~25% |
| PC终端/收银/小程序 | ❌ | ❌ | — | 0% |
| **VR头显终端** | ❌ | — | ✅ | ~15% |
| **游戏SDK** | — | ❌ | ✅ | ~15% |

### 10.2 Phase 1 人员（8周·8-13人）

| 角色 | 人数 | 范围 |
|------|:----:|------|
| 后端 | 2-3人 | 基础设施+核心API+支付+Session |
| Web前端 | 1-2人 | 三套后台API对接 |
| Electron | 1-2人 | PC终端+收银系统MVP |
| 小程序 | 1人 | 核心5页 |
| Unity | 1人 | VR Launcher MVP(Pico) |
| C++ | 1-2人 | SDK Core |
| QA | 1-2人 | 端到端联调 |

### 10.3 任务依赖

```
W1-2: 基础设施(T001-T004)
  → W3-4: 核心API(T005-T008) + SDK Alpha(T009-T012) 并行
  → W5-6: PC终端(T013) + 收银(T014) + 小程序(T015) + VR终端(T017)
  → W7-8: 端到端联调(T018)
```

---

## 11. 开发执行规范

### 11.1 启动命令

```bash
# Web后台
cd admin-dashboard && npm install && npm run dev -- --port 9527

# PC终端
cd pc-terminal && npm install && npm run dev

# VR终端 (Unity)
cd vr-headset && unity -projectPath . -executeMethod BuildLauncher -quit

# 游戏SDK
cd game-sdk/core && mkdir build && cd build && cmake .. && make
```

### 11.2 提交规范

| 范围 | 前缀 |
|------|------|
| 代理商 | `feat(agent):` |
| 商家 | `feat(shop):` |
| 平台 | `feat(platform):` |
| PC终端 | `feat(terminal):` |
| VR终端 | `feat(vr-launcher):` |
| SDK | `feat(sdk-core):` / `feat(sdk-unity):` |

### 11.3 代码规范

| 类型 | 规范 |
|------|------|
| Vue文件(Web) | PascalCase |
| SDK C++ | snake_case |
| SDK C# | PascalCase |
| API路径 | kebab-case |
| 常量 | UPPER_SNAKE_CASE |

---

## A. 附录

### A.1 术语表

| 术语 | 定义 |
|------|------|
| **游戏豆** | B端运营代币，商家从平台购买，用于启动游戏 |
| **Session** | 用户从开始到结束的一次完整游戏游玩记录 |
| **Device Shadow** | 设备数字孪生，云端实时状态镜像 |
| **Launcher** | VR终端极简启动应用(仅Logo+加载+结束) |
| **预授权** | 开始前锁定金额防超支 |
| **离线队列** | 断网时FIFO缓存，联网后重放 |

### A.2 色彩规范

| 用途 | 商家后台 | 小程序 | PC终端/VR | 代理商 |
|------|---------|--------|-----------|--------|
| 主色 | `#3B82F6`蓝 | `#6366F1`靛 | `#0A1628`深蓝 | `#F59E0B`琥珀 |
| 背景 | `#F8FAFC`灰 | `#0D0D0D`黑 | `#0A1628`深蓝 | `#FFFBEB`黄 |
| 成功 | `#22C55E` | `#22C55E` | `#34D399` | `#22C55E` |
| 错误 | `#EF4444` | `#EF4444` | `#F87171` | `#DC2626` |

### A.3 版本历史

| 版本 | 日期 | 核心变更 | 规模 |
|------|------|---------|:----:|
| v1.0 | 04-30 | 初版 | ~450行 |
| v1.1 | 04-30 | 代理商完善 | ~540行 |
| v1.2 | 04-30 | 五大子系统规格 | ~1100行 |
| v1.3 | 05-04 | VR纯沉浸式+SDK全规格+论坛修复10项 | ~2900行 |
| **v1.3.1** | **05-04** | **商业模式修正(硬件佣金+游戏豆销售+双维度分润)** | **~3300行** |

---

> 📧 问题反馈请联系产品团队  
> 📎 流程图SVG: `docs/images/` (8张)  
> 📎 完整版PRD: `头号空间-产品需求文档-PRD-v1.3.md` (3298行)  
> 📎 设计稿: `designs/` (6张核心 + 9张竞品)  
> © 2026 头号空间 All Rights Reserved
