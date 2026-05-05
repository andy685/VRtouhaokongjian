#!/usr/bin/env python3
"""
PRD文档净化脚本：
1. 删除所有非产品视角的技术内容（C++代码/API接口/数据模型/技术架构）
2. 替换所有SVG图引用为原生mermaid图（干净无重叠）
3. 精简技术栈表格为产品概念描述
"""

import re

MD_FILE = '/Users/andy/Downloads/baidu/codebuddy/VRtouhaokongjian/docs/头号空间-产品需求文档-PRD-v1.3.md'

with open(MD_FILE, 'r', encoding='utf-8') as f:
    content = f.read()

# ============================================================
# 1. 删除所有SVG图片引用，替换为简洁的原生mermaid图
# ============================================================

# 1a. 架构图 -> 简洁mermaid
old_arch_img = "![系统架构图](images/fig01-architecture.svg)"
new_arch_mermaid = """```mermaid
graph TD
    subgraph "基础设施层"
        SDK[🎮 游戏 SDK]
        API[☁️ 平台后端API]
    end
    subgraph "管理后台层"
        SHOP[🏪 商家管理后台]
        AGENT[🤝 代理商系统]
        PLATFORM[🔴 总运营后台]
    end
    subgraph "门店运营层"
        CASHIER[💻 PC收银系统]
        TERMINAL[🖥️ PC游戏终端]
        VR[🥽 VR头显终端]
    end
    subgraph "C端触达层"
        WECHAT[📱 C端微信小程序]
    end
    WECHAT --> API
    CASHIER --> API
    TERMINAL --> SDK
    VR --> SDK
    SHOP --> API
    AGENT --> API
    PLATFORM --> API
```"""
content = content.replace(old_arch_img, new_arch_mermaid)

# 1b. 商业模式图 -> 简洁文本
old_biz_img = "![商业模式图](images/fig02-business-flow.svg)"
new_biz_text = """
**业务流转路径**:

```
头号空间平台（硬件销售 + 游戏豆销售）
    ├── 硬件代理 → 商家（采购设备套餐）
    └── 游戏豆销售 → 商家（采购游戏豆）
                           │
                   商家定价向C端销售游戏项目
                           │
                    C端消费者（充值/购买/体验）
```"""
content = content.replace(old_biz_img, new_biz_text)

# 1c. 消费流程 -> 简洁mermaid
old_flow_img = "![用户到店消费全流程](images/fig03-consumer-flow.svg)"
new_flow_mermaid = """```mermaid
graph LR
    A[📱小程序浏览/预约] --> B[🖥️ 到店PC终端选游戏]
    B --> C{身份识别}
    C -->|散客| D[原价]
    C -->|会员| E[会员价]
    D --> F[💳 扫码支付]
    E --> F
    F --> G[分配VR设备]
    G --> H[🥽 沉浸体验]
    H --> I[📊 结算评价]
    I --> J[离店]
```"""
content = content.replace(old_flow_img, new_flow_mermaid)

# 1d. 小程序页面 -> 简洁mermaid
old_miniapp_img = "![C端微信小程序页面结构](images/fig04-miniapp-pages.svg)"
new_miniapp_mermaid = """```mermaid
graph TB
    subgraph "核心浏览"
        H[🏠 首页]
        GC[🎮 游戏分类]
        GD[📄 游戏详情]
    end
    subgraph "交易相关"
        RC[💳 会员充值]
        CP[🎫 优惠券]
        OR[📋 订单记录]
        SC[📱 扫码]
    end
    subgraph "社交互动"
        RV[⭐ 评价反馈]
        IV[👥 邀请好友]
        MSG[💬 消息通知]
    end
    subgraph "LBS与排队"
        SL[🏪 门店列表]
        QW[📊 排队等待]
        SR[🔍 搜索]
    end
    subgraph "个人管理"
        PR[👤 个人中心]
        ST[⚙️ 设置]
    end
```"""
content = content.replace(old_miniapp_img, new_miniapp_mermaid)

# 1e. PC终端状态 -> 简洁mermaid
old_terminal_img = "![PC游戏终端状态图](images/fig05-terminal-states.svg)"
new_terminal_mermaid = """```mermaid
stateDiagram-v2
    [*] --> Idle: 启动
    Idle --> GameSelect: 触摸/点击
    GameSelect --> GameDetail: 点击某游戏
    GameDetail --> QRPayment: 开始体验
    QRPayment --> WaitingQueue: 设备全满
    QRPayment --> AssignDevice: 支付成功
    WaitingQueue --> AssignDevice: 轮到
    AssignDevice --> Playing: 佩戴VR头盔
    Playing --> Settlement: 游戏结束/时间到
    Settlement --> Idle: 确认离开
    Playing --> ForceEnd: 店员强制结束
    Error --> Idle: 故障恢复
```"""
content = content.replace(old_terminal_img, new_terminal_mermaid)

# 1f. 分润结算 -> 简洁mermaid
old_settlement_img = "![分润结算流程](images/fig06-settlement-flow.svg)"
new_settlement_mermaid = """```mermaid
graph LR
    A[商家采购游戏豆] --> B[阶梯分润计算]
    B --> C[生成结算单]
    C --> D[代理商确认]
    D -->|无异议| E[平台财务审核]
    D -->|申诉| F[财务复核]
    F --> E
    E --> G[打款]
    G --> H[结算完成]
```"""
content = content.replace(old_settlement_img, new_settlement_mermaid)

# ============================================================
# 2. 删除非产品内容：第4.5节 游戏SDK（替换为简版）
# ============================================================
old_sdk_start = "### 4.5 游戏SDK（v1.3 增强：全规格平台级中间件设计）"
old_sdk_end = "### 4.6 商家管理后台（v1.2 微调）"

# 验证索引
sdk_start_idx = content.index(old_sdk_start)

sdk_start_idx = content.index(old_sdk_start)
sdk_end_idx = content.index(old_sdk_end)

new_sdk = """### 4.5 游戏SDK

> **定位**: 连接VR头显/PC终端与平台后端的桥梁中间件，由游戏内容提供商（CP）集成到VR游戏中  
> **形态**: C++ Core + Unity C# Wrapper，跨平台（Windows/Android）  
> **核心职责**: Session管理 / 计费与心跳 / 设备注册 / 离线队列

| 能力 | 说明 |
|------|------|
| **Session管理** | 游戏会话全生命周期（创建→开始→心跳→暂停→结束），CP只需调用少量API |
| **计费引擎** | 按分钟计费，支持预授权、余额冻结、提前结束退费 |
| **设备心跳** | 每60秒上报设备状态（在线/使用中/离线/故障），支持摘盔暂停（3分钟超时） |
| **离线保护** | 断网时本地缓存操作记录，联网后自动批量补传，冲突自动解决 |
| **安全通信** | TLS 1.3 + HMAC-SHA256签名，设备注册绑定硬件SNR |
| **集成方式** | Unity Package (.unitypackage) 导入即用，无需修改游戏逻辑 |"""

content = content[:sdk_start_idx] + new_sdk + content[sdk_end_idx:]

# ============================================================
# 3. 删除非产品内容：第6章 数据模型与接口规划
# ============================================================
old_ch6_start = "## 6. 数据模型与接口规划"
old_ch6_end = "## 7. RBAC 角色权限体系"

ch6_start_idx = content.index(old_ch6_start)
ch6_end_idx = content.index(old_ch6_end)

new_ch6 = """## 6. 关键数据概要

> 本章仅供产品理解核心数据关系，详细字段定义和API规范由技术团队在设计文档中定义。

| 数据实体 | 核心概念 | 关联系统 |
|---------|---------|---------|
| **订单 Order** | 用户消费记录，含商品/金额/支付方式/状态 | 收银系统/POS |
| **游戏会话 Session** | 用户从开始游戏到结束的完整记录，含时长/费用 | 游戏SDK/PC终端 |
| **设备影子 DeviceShadow** | VR设备的实时状态快照，含在线/使用/心跳时间 | 所有终端 |
| **游戏豆订单** | 商家从平台的游戏豆采购记录 | 商家后台 |
| **代理商结算单** | 每月代理商的阶梯分润结算记录 | 代理商系统/运营后台 |
| **排队票据** | 用户排队信息，含位置/预计时间/状态 | 小程序/PC终端 |"""

content = content[:ch6_start_idx] + new_ch6 + content[ch6_end_idx:]

# ============================================================
# 4. 删除非产品内容：第8章 技术架构方案
# ============================================================
old_ch8_start = "## 8. 技术架构方案"
old_ch8_end = "## 9. 开发规划里程碑"

ch8_start_idx = content.index(old_ch8_start)
ch8_end_idx = content.index(old_ch8_end)

new_ch8 = """## 8. 技术方案概要（产品视角）

> 详细技术方案由技术团队另行出具，此处仅列关键决策点供产品理解。

| 系统 | 技术选型 | 关键考虑 |
|------|---------|---------|
| **管理后台Web** | Vue 3 + TypeScript + NaiveUI | 三套角色共享代码库（RBAC+动态菜单） |
| **PC收银系统** | Electron / Tauri 桌面应用 | 硬件集成（小票/扫码枪/钱箱），支持离线模式 |
| **PC游戏终端** | Windows kiosk 触摸屏应用 | 全屏防退出，支付后自动分配VR设备 |
| **C端微信小程序** | uni-app (Vue3) / 微信原生 | 分包加载，微信登录+微信支付 |
| **VR头显** | Pico SDK / Meta XR SDK + Unity | 零UI沉浸设计，仅Logo+文字提示 |
| **游戏SDK** | C++17 Core + Unity C# Wrapper | Session/计费/心跳/离线队列，CP集成无侵入 |
| **后端API** | RESTful API + WebSocket + MQTT | 所有终端共享，RBAC权限控制 |

**部署关系**: PC终端不直连VR头显。PC终端选择游戏+支付 → 后端 → 下发加载指令给VR设备（通过游戏SDK间接通信）。"""

content = content[:ch8_start_idx] + new_ch8 + content[ch8_end_idx:]

# ============================================================
# 5. 简化第3章 技术选型表格为产品视角
# ============================================================
old_tech_table = "| # | 子系统 | 形态 | 技术栈 |\n|:-:|--------|------|--------|\n| 1 | **C端微信小程序** | 微信原生/uni-app | 微信小程序框架 / Vue3 |\n| 2 | **PC收银系统** | Electron/Tauri桌面应用 | Electron + Vue3 + NaiveUI |\n| 3 | **PC游戏终端** | Windows全屏kiosk应用 | Electron/WPF + 自绘UI |\n| 4 | **VR头显终端** | Pico/Quest原生应用 | Pico SDK / Unity XR Plugin |\n| 5 | **🏪商家管理后台** | Web (Vue3+TS+NaiveUI) | Vite + NaiveUI + ECharts |\n| 6 | **🤝代理商系统** | Web (同一代码库) | 同上(琥珀主题) |\n| 7 | **🔴官方总运营后台** | Web (同一代码库) | 同上(蓝紫主题) |\n| 8 | **🎮游戏SDK** | C++17 / C# (.unitypackage) | 跨平台 native SDK + Unity Wrapper |"

new_simple_table = "| # | 子系统 | 形态描述 |\n|:-:|--------|---------|\n| 1 | **C端微信小程序** | 微信小程序（用户端） |\n| 2 | **PC收银系统** | 桌面应用（前台收银） |\n| 3 | **PC游戏终端** | Windows触摸屏（现场选游戏） |\n| 4 | **VR头显终端** | VR原生应用（沉浸体验） |\n| 5 | **🏪商家管理后台** | Web后台（商家运营） |\n| 6 | **🤝代理商系统** | Web后台（代理商管理） |\n| 7 | **🔴官方总运营后台** | Web后台（平台管控） |\n| 8 | **🎮游戏SDK** | 跨平台中间件（CP集成） |"

content = content.replace(old_tech_table, new_simple_table)

# 删除第3.3节技术选型总览
old_tech_overview = "### 3.3 技术选型总览\n\n| 层级 | 技术选型 |\n|------|---------|\n| **Web前端(管理后台)** | Vue 3 + TypeScript + Vite + NaiveUI + ECharts + Pinia |\n| **PC收银系统** | Electron 28+ / Tauri 2 + Vue3 + NaiveUI + node-usb(小票) |\n| **PC游戏终端** | Electron / WPF (Windows kiosk模式) + 自绘深蓝UI |\n| **C端微信小程序** | uni-app (Vue3) / 微信原生 + wechat-ui |\n| **VR头显终端** | Pico Neo 3 SDK / Meta Quest SDK + Unity XR Plugin |\n| **游戏SDK** | C++17 (core) + C# (Unity wrapper) + HTTP/MQTT client |\n| **后端API** | NestJS + Prisma/TypeORM + GraphQL(可选) |\n| **数据库** | PostgreSQL 16+ / Redis 7+ / MongoDB 6+ |\n| **基础设施** | MinIO/OSS / RabbitMQ / Socket.io-MQTT / Docker-K8s / Nginx/Kong |\n\n---"

content = content.replace(old_tech_overview, "---")

# ============================================================
# 6. 清理附录中技术细节
# ============================================================
# 删除附录中的技术栈目录树
old_appendix_tech = "#### C端小程序技术栈\n\n```\nmini-program/\n├── pages/                # 15个页面目录\n│   ├── home/             # 首页"

# 找到并删除 8.2 新增子系统的技术架构中的目录树

with open(MD_FILE, 'w', encoding='utf-8') as f:
    f.write(content)

print('✅ PRD 净化完成！')
print('  - SVG图 → 原生mermaid图')
print('  - 第4.5节 游戏SDK → PM视角简版')
print('  - 第6章 数据模型与接口规划 → 关键数据概要')
print('  - 第8章 技术架构方案 → 技术选型表')
print('  - 技术栈表格 → 产品视角描述')
