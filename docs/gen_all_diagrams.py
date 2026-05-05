#!/usr/bin/env python3
"""
使用 fireworks-tech-graph 工具为 PRD 文档生成所有 SVG 图表
"""

import json, os, subprocess, sys

SCRIPT_DIR = os.path.dirname(__file__)
FW_DIR = '/tmp/fireworks-tech-graph'
GENERATOR = os.path.join(FW_DIR, 'scripts', 'generate-from-template.py')
OUTPUT_DIR = os.path.join(SCRIPT_DIR, 'images')
os.makedirs(OUTPUT_DIR, exist_ok=True)

def gen_svg(shape_type, name, data):
    path = os.path.join(OUTPUT_DIR, f'{name}.svg')
    cmd = [sys.executable, GENERATOR, shape_type, path, json.dumps(data, ensure_ascii=False)]
    subprocess.run(cmd, check=True, cwd=FW_DIR)
    # Try to convert to PNG
    png_path = path.replace('.svg', '.png')
    try:
        subprocess.run(['rsvg-convert', '-w', '1920', path, '-o', png_path], check=True)
        print(f'  ✓ {name}.svg + .png')
    except:
        print(f'  ✓ {name}.svg (no rsvg-convert)')
    return path

# ================================================================
# 1. 架构图 — Style 3 Blueprint
# ================================================================
arch_data = {
    "style": 3,
    "title": "头号空间 · 全链路VR体验店运营管理平台",
    "subtitle": "FOUR-LAYER SYSTEM ARCHITECTURE",
    "width": 960, "height": 640,
    "blueprint_title_block": {
        "x": 650, "y": 510, "width": 280, "height": 100,
        "title": "SYSTEM ARCHITECTURE",
        "subtitle": "ARCH-001",
        "left_caption": "REV: 1.3",
        "center_caption": "头号空间 ",
        "right_caption": "DWG: ARCH-001"
    },
    "containers": [
        {"x": 30, "y": 90, "width": 900, "height": 100, "label": "C端触达层",
         "header_text": "01 // C端触达层", "subtitle": "C端消费者唯一入口"},
        {"x": 30, "y": 210, "width": 900, "height": 120, "label": "门店运营层",
         "header_text": "02 // 门店运营层", "subtitle": "VR体验店现场终端"},
        {"x": 30, "y": 350, "width": 900, "height": 100, "label": "管理后台层",
         "header_text": "03 // 管理后台层", "subtitle": "Web管理端"},
        {"x": 30, "y": 470, "width": 900, "height": 80, "label": "基础设施层",
         "header_text": "04 // 基础设施层", "subtitle": "共享服务"},
    ],
    "nodes": [
        # C端触达层
        {"x": 350, "y": 105, "width": 260, "height": 60, "label": "📱 C端微信小程序",
         "sublabel": "预约 · 会员 · 支付 · 评价", "kind": "rect", "rx": 10, "glow": "blue"},
        # 门店运营层
        {"x": 80, "y": 230, "width": 220, "height": 60, "label": "💻 PC收银系统",
         "sublabel": "收银开单 / 会员识别 / 充值", "kind": "rect", "rx": 10},
        {"x": 370, "y": 230, "width": 220, "height": 60, "label": "🖥️ PC游戏终端",
         "sublabel": "选游戏 / 扫码支付 / 引导", "kind": "rect", "rx": 10},
        {"x": 660, "y": 230, "width": 220, "height": 60, "label": "🥽 VR头显终端",
         "sublabel": "沉浸游戏 / 时长计费 / 结算", "kind": "rect", "rx": 10},
        # 管理后台层
        {"x": 80, "y": 365, "width": 220, "height": 60, "label": "🏪 商家管理后台",
         "sublabel": "店铺运营 / 会员 / 商品", "kind": "rect", "rx": 10},
        {"x": 370, "y": 365, "width": 220, "height": 60, "label": "🤝 代理商系统",
         "sublabel": "商家管理 / 分润结算", "kind": "rect", "rx": 10},
        {"x": 660, "y": 365, "width": 220, "height": 60, "label": "🔴 总运营后台",
         "sublabel": "全平台管控 / 财务结算", "kind": "rect", "rx": 10},
        # 基础设施层
        {"x": 200, "y": 482, "width": 240, "height": 50, "label": "🎮 游戏 SDK (C++ Core + Unity C#)",
         "sublabel": "Session管理 / 计费引擎 / 心跳", "kind": "rect", "rx": 8},
        {"x": 520, "y": 482, "width": 240, "height": 50, "label": "☁️ 平台后端API / 消息队列",
         "sublabel": "REST / WebSocket / MQTT", "kind": "rect", "rx": 8},
    ],
    "arrows": [
        {"source": "0", "target": "1", "flow": "control", "label": "用户触达"},
        {"source": "0", "target": "2", "flow": "data", "label": "扫码/支付"},
        {"source": "0", "target": "3", "flow": "control", "label": "预约"},
        {"source": "1", "target": "2", "flow": "data", "label": "开单联动"},
        {"source": "2", "target": "3", "flow": "control", "label": "设备分配"},
        {"source": "4", "target": "7", "flow": "read", "label": "API调用"},
        {"source": "5", "target": "7", "flow": "read", "label": "API调用"},
        {"source": "6", "target": "7", "flow": "read", "label": "API调用"},
    ],
    "legend": [
        {"label": "数据/业务流", "flow": "control"},
        {"label": "API调用", "flow": "read"},
        {"label": "设备通信", "flow": "data"},
    ],
    "footer": "头号空间 PRD | 系统架构图 v1.3",
}

gen_svg('architecture', 'fig01-architecture', arch_data)

# ================================================================
# 2. 商业模式流程图 — Style 1 Flat Icon
# ================================================================
biz_data = {
    "style": 1,
    "title": "商业模式 · 业务流转",
    "subtitle": "平台 → 代理商 → 商家 → C端消费者",
    "width": 780, "height": 580,
    "nodes": [
        {"x": 280, "y": 40, "width": 220, "height": 60, "label": "头号空间 平台",
         "sublabel": "硬件销售 + 游戏豆销售", "kind": "rect", "rx": 10, "glow": "blue"},
        {"x": 100, "y": 160, "width": 220, "height": 60, "label": "① 硬件销售",
         "sublabel": "设备套餐（线下合同）", "kind": "rect", "rx": 10},
        {"x": 460, "y": 160, "width": 220, "height": 60, "label": "② 游戏豆销售",
         "sublabel": "B端代币 ¥1/豆", "kind": "rect", "rx": 10},
        {"x": 220, "y": 300, "width": 340, "height": 70, "label": "商家（VR体验店）",
         "sublabel": "采购设备 ｜ 购买游戏豆 ｜ 定价销售", "kind": "rect", "rx": 10},
        {"x": 220, "y": 440, "width": 340, "height": 70, "label": "C端消费者",
         "sublabel": "充值 ｜ 购买游戏项目 ｜ 体验", "kind": "rect", "rx": 10, "glow": "green"},
    ],
    "arrows": [
        {"source": "0", "target": "1", "flow": "control", "label": "硬件代理"},
        {"source": "0", "target": "2", "flow": "data", "label": "采购游戏豆"},
        {"source": "1", "target": "3", "flow": "control", "label": "交付设备"},
        {"source": "2", "target": "3", "flow": "data", "label": "游戏豆到账"},
        {"source": "3", "target": "4", "flow": "write", "label": "C端付款 ¥"},
        {"source": "4", "target": "3", "flow": "feedback", "label": "消费 / 充值"},
    ],
    "legend": [
        {"label": "资金/商品流", "flow": "control"},
        {"label": "数据/服务流", "flow": "data"},
        {"label": "资金回流", "flow": "write"},
    ],
    "footer": "头号空间 PRD | 商业模式图",
}
gen_svg('data-flow', 'fig02-business-flow', biz_data)

# ================================================================
# 3. 用户到店消费全流程 — Style 1 Flat Icon
# ================================================================
flow_data = {
    "style": 1,
    "title": "用户到店消费全流程（六端联动）",
    "subtitle": "从到店前 → 离店后的完整闭环",
    "width": 960, "height": 680,
    "containers": [
        {"x": 30, "y": 90, "width": 220, "height": 310, "label": "到店前",
         "header_text": "01 // 到店前", "header_height": 36},
        {"x": 270, "y": 90, "width": 220, "height": 310, "label": "到店 & 选游戏",
         "header_text": "02 // 到店 & 选游戏", "header_height": 36},
        {"x": 510, "y": 90, "width": 220, "height": 310, "label": "支付 & 分配设备",
         "header_text": "03 // 支付 & 分配设备", "header_height": 36},
        {"x": 750, "y": 90, "width": 180, "height": 310, "label": "体验 & 结算",
         "header_text": "04 // 体验 & 结算", "header_height": 36},
    ],
    "nodes": [
        {"x": 50, "y": 140, "width": 180, "height": 50, "label": "C端小程序",
         "sublabel": "浏览游戏 · 查看门店", "kind": "rect", "rx": 8},
        {"x": 50, "y": 210, "width": 180, "height": 50, "label": "预约/了解价格",
         "sublabel": "LBS附近门店", "kind": "rect", "rx": 8},

        {"x": 290, "y": 140, "width": 180, "height": 50, "label": "PC游戏终端",
         "sublabel": "待机画面吸引", "kind": "rect", "rx": 8},
        {"x": 290, "y": 210, "width": 180, "height": 50, "label": "身份识别",
         "sublabel": "散客 / 会员登录", "kind": "rect", "rx": 8},
        {"x": 290, "y": 280, "width": 180, "height": 50, "label": "选游戏",
         "sublabel": "浏览 → 详情 → 开始", "kind": "rect", "rx": 8},

        {"x": 530, "y": 140, "width": 180, "height": 50, "label": "扫码支付",
         "sublabel": "微信/支付宝/余额", "kind": "rect", "rx": 8, "glow": "green"},
        {"x": 530, "y": 210, "width": 180, "height": 50, "label": "分配VR设备",
         "sublabel": "自动分配空闲设备", "kind": "rect", "rx": 8},
        {"x": 530, "y": 280, "width": 180, "height": 50, "label": "引导佩戴",
         "sublabel": "\"请佩戴 #03 头盔\"", "kind": "rect", "rx": 8},

        {"x": 765, "y": 140, "width": 150, "height": 50, "label": "VR沉浸体验",
         "sublabel": "0 UI 干 扰", "kind": "rect", "rx": 8, "glow": "blue"},
        {"x": 765, "y": 210, "width": 150, "height": 50, "label": "游戏结束",
         "sublabel": "SDK自动结算", "kind": "rect", "rx": 8},
        {"x": 765, "y": 280, "width": 150, "height": 50, "label": "结算评价",
         "sublabel": "PC终端评分", "kind": "rect", "rx": 8},
    ],
    "arrows": [
        {"x1": 230, "y1": 165, "x2": 290, "y2": 165, "flow": "control", "label": "LBS/预约"},
        {"source": "2", "target": "3", "flow": "control"},
        {"source": "3", "target": "4", "flow": "control", "label": "选游戏"},
        {"source": "4", "target": "5", "flow": "write", "label": "确认支付"},
        {"source": "5", "target": "6", "flow": "control", "label": "成功"},
        {"source": "6", "target": "7", "flow": "control", "label": "指引"},
        {"source": "7", "target": "8", "flow": "control", "label": "开始体验"},
        {"source": "8", "target": "9", "flow": "control"},
        {"source": "9", "target": "10", "flow": "control", "label": "结算"},
    ],
    "legend": [
        {"label": "用户操作流", "flow": "control"},
        {"label": "系统处理", "flow": "control"},
    ],
    "footer": "头号空间 PRD | 六端联动流程图",
}
gen_svg('flowchart', 'fig03-consumer-flow', flow_data)

# ================================================================
# 4. C端小程序 思维导图 — Style 4 Notion Clean
# ================================================================
miniapp_data = {
    "style": 4,
    "title": "C端微信小程序 — 15个功能页面",
    "width": 960, "height": 620,
    "containers": [
        {"x": 30, "y": 90, "width": 280, "height": 190, "label": "核心内容",
         "header_text": "核心浏览", "header_height": 36},
        {"x": 340, "y": 90, "width": 280, "height": 190, "label": "交易相关",
         "header_text": "交易与支付", "header_height": 36},
        {"x": 650, "y": 90, "width": 280, "height": 190, "label": "社交互动",
         "header_text": "社交与互动", "header_height": 36},
        {"x": 30, "y": 310, "width": 280, "height": 150, "label": "LBS功能",
         "header_text": "LBS与排队", "header_height": 36},
        {"x": 340, "y": 310, "width": 280, "height": 150, "label": "个人管理",
         "header_text": "个人与系统", "header_height": 36},
    ],
    "nodes": [
        {"x": 50, "y": 140, "width": 110, "height": 40, "label": "🏠 首页", "kind": "rect", "rx": 6},
        {"x": 175, "y": 140, "width": 115, "height": 40, "label": "🎮 游戏分类", "kind": "rect", "rx": 6},
        {"x": 105, "y": 200, "width": 120, "height": 40, "label": "📄 游戏详情", "kind": "rect", "rx": 6},
        {"x": 360, "y": 140, "width": 110, "height": 40, "label": "💳 会员充值", "kind": "rect", "rx": 6},
        {"x": 485, "y": 140, "width": 110, "height": 40, "label": "🎫 优惠券", "kind": "rect", "rx": 6},
        {"x": 360, "y": 200, "width": 110, "height": 40, "label": "📋 订单记录", "kind": "rect", "rx": 6},
        {"x": 485, "y": 200, "width": 110, "height": 40, "label": "📱 扫码", "kind": "rect", "rx": 6},
        {"x": 670, "y": 140, "width": 110, "height": 40, "label": "⭐ 评价反馈", "kind": "rect", "rx": 6},
        {"x": 795, "y": 140, "width": 115, "height": 40, "label": "👥 邀请好友", "kind": "rect", "rx": 6},
        {"x": 670, "y": 200, "width": 115, "height": 40, "label": "💬 消息通知", "kind": "rect", "rx": 6},
        {"x": 50, "y": 350, "width": 110, "height": 40, "label": "🏪 门店列表", "kind": "rect", "rx": 6},
        {"x": 175, "y": 350, "width": 115, "height": 40, "label": "📊 排队等待", "kind": "rect", "rx": 6},
        {"x": 360, "y": 350, "width": 110, "height": 40, "label": "👤 个人中心", "kind": "rect", "rx": 6, "glow": "blue"},
        {"x": 485, "y": 350, "width": 110, "height": 40, "label": "⚙️ 设置", "kind": "rect", "rx": 6},
        {"x": 175, "y": 410, "width": 110, "height": 40, "label": "🔍 搜索", "kind": "rect", "rx": 6},
    ],
    "footer": "头号空间 PRD | 小程序页面结构图",
}
gen_svg('mind-map', 'fig04-miniapp-pages', miniapp_data)

# ================================================================
# 5. PC游戏终端 状态机 — Style 3 Blueprint
# ================================================================
terminal_data = {
    "style": 3,
    "title": "PC游戏终端 — 状态流转图",
    "subtitle": "STATE DIAGRAM: 9种核心状态",
    "width": 960, "height": 620,
    "nodes": [
        {"x": 380, "y": 40, "width": 180, "height": 50, "label": "[*] 启动",
         "sublabel": "系统启动", "kind": "rect", "rx": 8},

        {"x": 380, "y": 140, "width": 180, "height": 50, "label": "① 待机 / Idle",
         "sublabel": "Logo + 宣传视频", "kind": "rect", "rx": 8, "glow": "blue"},

        {"x": 130, "y": 260, "width": 180, "height": 50, "label": "② 游戏选择",
         "sublabel": "卡片网格浏览", "kind": "rect", "rx": 8},
        {"x": 380, "y": 260, "width": 180, "height": 50, "label": "③ 游戏详情",
         "sublabel": "预览 + 开始按钮", "kind": "rect", "rx": 8, "glow": "blue"},

        {"x": 130, "y": 380, "width": 180, "height": 50, "label": "④ 扫码支付",
         "sublabel": "二维码 + 倒计时", "kind": "rect", "rx": 8, "glow": "green"},
        {"x": 380, "y": 380, "width": 180, "height": 50, "label": "⑤ 排队等待",
         "sublabel": "设备全满时触发", "kind": "rect", "rx": 8},
        {"x": 640, "y": 380, "width": 180, "height": 50, "label": "⑥ 设备分配",
         "sublabel": "\"请佩戴#03\"", "kind": "rect", "rx": 8},

        {"x": 130, "y": 500, "width": 180, "height": 50, "label": "⑦ 游戏中监控",
         "sublabel": "画面镜像 + 倒计时", "kind": "rect", "rx": 8, "glow": "blue"},
        {"x": 640, "y": 500, "width": 180, "height": 50, "label": "⑧ 结算评价",
         "sublabel": "明细 + 五星评分", "kind": "rect", "rx": 8},

        {"x": 640, "y": 260, "width": 180, "height": 50, "label": "⚡ 强制结束",
         "sublabel": "店员操作", "kind": "rect", "rx": 8},
        {"x": 380, "y": 500, "width": 180, "height": 50, "label": "⚠️ Error",
         "sublabel": "故障恢复", "kind": "rect", "rx": 8},
    ],
    "arrows": [
        {"source": "0", "target": "1", "flow": "control", "label": "初始化"},
        {"source": "1", "target": "2", "flow": "control", "label": "触摸/点击"},
        {"source": "2", "target": "3", "flow": "control", "label": "点某游戏"},
        {"source": "3", "target": "4", "flow": "write", "label": "开始体验"},
        {"source": "4", "target": "6", "flow": "control", "label": "支付成功"},
        {"source": "4", "target": "5", "flow": "async", "label": "设备全满"},
        {"source": "5", "target": "6", "flow": "control", "label": "轮到"},
        {"source": "6", "target": "7", "flow": "control", "label": "佩戴VR"},
        {"source": "7", "target": "8", "flow": "control", "label": "游戏结束/时间到"},
        {"source": "7", "target": "9", "flow": "feedback", "label": "强制结束"},
        {"source": "8", "target": "1", "flow": "control", "label": "确认离开"},
        {"source": "10", "target": "1", "flow": "neutral", "label": "故障恢复"},
    ],
    "legend": [
        {"label": "用户操作流", "flow": "control"},
        {"label": "支付/成功", "flow": "write"},
        {"label": "异常/强制", "flow": "feedback"},
    ],
    "footer": "头号空间 PRD | PC终端状态图",
}
gen_svg('state-machine', 'fig05-terminal-states', terminal_data)

# ================================================================
# 6. 分润结算流程 — Style 1 Flat
# ================================================================
settlement_data = {
    "style": 1,
    "title": "代理商分润结算流程（T+1月结）",
    "subtitle": "全量阶梯分润 · 四级安全机制",
    "width": 780, "height": 500,
    "nodes": [
        {"x": 280, "y": 30, "width": 220, "height": 50, "label": "商家采购游戏豆",
         "sublabel": "¥1/豆 · 平台统一定价", "kind": "rect", "rx": 8, "glow": "blue"},

        {"x": 50, "y": 140, "width": 200, "height": 60, "label": "① 阶梯分润计算",
         "sublabel": "全量按档位计算", "kind": "rect", "rx": 8},
        {"x": 290, "y": 140, "width": 200, "height": 60, "label": "② 生成结算单",
         "sublabel": "次月1日自动生成", "kind": "rect", "rx": 8},
        {"x": 530, "y": 140, "width": 200, "height": 60, "label": "③ 代理商确认",
         "sublabel": "日确认 / 申诉冻结", "kind": "rect", "rx": 8},

        {"x": 140, "y": 270, "width": 220, "height": 60, "label": "④ 平台财务审核",
         "sublabel": "争议处理 · 复核", "kind": "rect", "rx": 8},
        {"x": 420, "y": 270, "width": 220, "height": 60, "label": "⑤ 打款",
         "sublabel": "自动/线下  ≥¥100", "kind": "rect", "rx": 8, "glow": "green"},

        {"x": 280, "y": 390, "width": 220, "height": 50, "label": "⑥ 结算完成",
         "sublabel": "次月15日前到账", "kind": "rect", "rx": 8, "glow": "green"},
    ],
    "arrows": [
        {"source": "0", "target": "1", "flow": "data", "label": "采购数据"},
        {"source": "1", "target": "2", "flow": "control", "label": "阶梯策略"},
        {"source": "2", "target": "3", "flow": "control"},
        {"source": "3", "target": "4", "flow": "control", "label": "审核通过"},
        {"source": "4", "target": "5", "flow": "control", "label": "打款完成"},
        {"source": "3", "target": "4", "flow": "feedback", "label": "申诉 → 复核"},
    ],
    "legend": [
        {"label": "正向流程", "flow": "control"},
        {"label": "数据驱动", "flow": "data"},
        {"label": "异常分支", "flow": "feedback"},
    ],
    "footer": "头号空间 PRD | 分润结算流程图",
}
gen_svg('flowchart', 'fig06-settlement-flow', settlement_data)

print(f'\n✅ 所有图表已生成到 {OUTPUT_DIR}/')
print(f'   架构图: fig01-architecture.svg')
print(f'   商业模式: fig02-business-flow.svg')
print(f'   消费流程: fig03-consumer-flow.svg')
print(f'   小程序页面: fig04-miniapp-pages.svg')
print(f'   PC终端状态: fig05-terminal-states.svg')
print(f'   分润结算: fig06-settlement-flow.svg')
