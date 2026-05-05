#!/usr/bin/env python3
"""Generate SVG diagrams for VR Space PRD"""
import os

OUT = os.path.join(os.path.dirname(__file__), 'images')
os.makedirs(OUT, exist_ok=True)

def rect(x, y, w, h, cls, label='', sub=''):
    parts = [f'<rect x="{x}" y="{y}" width="{w}" height="{h}" class="{cls}"/>']
    if label:
        parts.append(f'<text x="{x+w/2}" y="{y+h/2+4}" text-anchor="middle" class="lbl">{label}</text>')
    if sub:
        parts.append(f'<text x="{x+w/2}" y="{y+h/2+18}" text-anchor="middle" class="sub">{sub}</text>')
    return '\n'.join(parts)

def arrow(x1, y1, x2, y2, label='', kind='arrow'):
    parts = [f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" class="{kind}"/>']
    if label:
        mx, my = (x1+x2)/2, (y1+y2)/2
        parts.append(f'<text x="{mx}" y="{my-3}" text-anchor="middle" class="ar-lbl">{label}</text>')
    return '\n'.join(parts)

def ellipse(x, y, rx, ry, cls, label):
    return (f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" class="{cls}"/>'
            f'<text x="{x}" y="{y+4}" text-anchor="middle" class="lbl">{label}</text>')

def make(name, w, h, *items):
    style = '''
    .lbl{fill:#e2e8f0;font-size:11px;font-weight:600}
    .sub{fill:#94a3b8;font-size:9px}
    .ar-lbl{fill:#64748b;font-size:8px}
    .muted{fill:#94a3b8;font-size:9px}
    .accent{fill:#a78bfa;font-size:9px}
    .green{fill:#34d399;font-size:9px}
    .title{fill:#e2e8f0;font-size:13px;font-weight:600}
    .box{fill:#1e293b;stroke:#334155;stroke-width:1;rx:6}
    .box-a{fill:#1e1b4b;stroke:#6366f1;stroke-width:1.5;rx:6}
    .box-g{fill:#064e3b;stroke:#34d399;stroke-width:1.5;rx:6}
    .box-r{fill:#450a0a;stroke:#f87171;stroke-width:1.5;rx:6}
    .box-y{fill:#451a03;stroke:#fb923c;stroke-width:1.5;rx:6}
    .arrow{stroke:#475569;stroke-width:1.5;fill:none;marker-end:url(#a)}
    .arrow-d{stroke:#475569;stroke-width:1;fill:none;stroke-dasharray:4,3;marker-end:url(#a)}
    '''
    body = '\n  '.join(items)
    svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">
  <rect width="{w}" height="{h}" fill="#0f172a" rx="8"/>
  <defs>
    <marker id="a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10" fill="#475569"/>
    </marker>
  </defs>
  <style>{style}</style>
  {body}
</svg>'''
    fp = os.path.join(OUT, name)
    with open(fp, 'w') as f: f.write(svg)
    print(f'  {name} ({w}x{h})')

# Architecture
make('fig01-architecture.svg', 900, 530,
    '<text x="30" y="30" class="title">系统整体架构图</text>',
    rect(40, 45, 820, 55, 'box', 'C端触达层'),
    rect(50, 80, 250, 22, 'box-g', 'C端微信小程序'),
    rect(40, 115, 820, 65, 'box', 'B端运营层（门店现场）'),
    rect(50, 135, 220, 35, 'box', 'PC收银系统'),
    rect(300, 135, 220, 35, 'box', 'PC游戏终端'),
    rect(550, 135, 220, 35, 'box-a', 'VR头显终端 (集成游戏SDK)'),
    rect(40, 195, 820, 65, 'box', '管理后台层 (Web 同一代码库 + RBAC)'),
    rect(50, 215, 230, 35, 'box-g', '商家管理后台'),
    rect(310, 215, 230, 35, 'box-y', '代理商系统'),
    rect(570, 215, 230, 35, 'box-r', '官方总运营后台'),
    rect(40, 275, 820, 60, 'box', '基础设施层（后端共享）'),
    rect(50, 300, 120, 28, 'box-a', '平台后端API'),
    rect(185, 300, 120, 28, 'box-g', '🎮游戏SDK 核心库'),
    rect(320, 300, 100, 28, 'box', 'PostgreSQL'),
    rect(435, 300, 100, 28, 'box', 'Redis'),
    rect(550, 300, 100, 28, 'box', 'MQTT Broker'),
    rect(665, 300, 100, 28, 'box', 'MinIO/OSS'),
    rect(780, 300, 100, 28, 'box', 'RabbitMQ'),
    arrow(160, 185, 160, 275, '', 'arrow-d'),
    arrow(320, 185, 320, 275, '', 'arrow-d'),
    arrow(480, 185, 480, 210, '', 'arrow-d'),
    '<text x="450" y="390" text-anchor="middle" class="muted">C端触达 / B端运营 / 管理后台 / 基础设施 四层架构</text>'
)

# Consumption Flow
make('fig09-consumption-flow.svg', 750, 700,
    '<text x="30" y="30" class="title">用户到店消费全流程</text>',
    rect(80, 45, 590, 45, 'box', '到店前/到店/身份识别', '小程序浏览 → 微信扫码登录 → 散客/会员分支'),
    arrow(375, 90, 375, 110),
    rect(80, 110, 590, 40, 'box-a', '选游戏 · PC终端', '浏览大厅 → 查看详情(视频/价格/难度) → 点击"开始体验"'),
    arrow(375, 150, 375, 170),
    rect(80, 170, 590, 45, 'box-y', '支付', '扫码 → 微信/支付宝回调 → POST /payment/wechat/notify → 分配设备'),
    arrow(375, 215, 375, 235),
    rect(80, 235, 590, 50, 'box-g', '分配设备 + 佩戴VR', 'PC终端"请佩戴#03头盔" → 后端MQTT launch_game → VR终端自动加载'),
    arrow(375, 285, 375, 305),
    rect(80, 305, 590, 65, 'box-a', '游戏进行中', 'VR: 0 HUD纯沉浸 | SDK: 60s心跳+摘盔暂停(不计费) | PC: 监控面板'),
    arrow(375, 370, 375, 390),
    rect(80, 390, 590, 50, 'box-g', '结束结算', 'SDK endSession → 计算费用 → VR结束提示 → PC完整结算页(明细+评分)'),
    arrow(375, 440, 375, 460),
    rect(80, 460, 590, 40, 'box', '离店后', '小程序消费记录+积分+邀请 | 商家后台实时营收更新'),
    '<text x="375" y="540" text-anchor="middle" class="muted">到店前→选游戏→支付→分配设备→游戏→结算→离店 完整闭环</text>'
)

# VR States
make('fig-vr-states.svg', 650, 180,
    '<text x="30" y="25" class="title">VR头显终端状态流转图 (5个核心状态)</text>',
    ellipse(100, 75, 45, 18, 'box', 'Idle 待机'),
    ellipse(230, 75, 50, 18, 'box-a', 'Loading 加载'),
    ellipse(390, 75, 55, 18, 'box-g', 'GameRunning 游戏中'),
    ellipse(560, 75, 50, 18, 'box-y', 'GameEnded 结束'),
    ellipse(390, 140, 48, 18, 'box-r', 'Error 异常'),
    arrow(145, 75, 180, 75, 'MQTT指令'),
    arrow(280, 75, 335, 75, '自动拉起'),
    arrow(445, 75, 510, 75, 'SDK上报'),
    arrow(560, 90, 510, 132, '崩溃/断网'),
    arrow(390, 93, 390, 122, '', 'arrow'),
    '<text x="390" y="165" text-anchor="middle" class="muted">Idle → Loading → Running → Ended, Error为异常分支</text>',
    '<path d="M570,93 Q620,110 560,138" class="arrow-d"/>'
)

# PC Terminal States
make('fig-pc-states.svg', 720, 180,
    '<text x="30" y="25" class="title">PC游戏终端状态流转图 (7个状态)</text>',
    ellipse(70, 75, 38, 16, 'box', 'Idle'),
    ellipse(175, 75, 42, 16, 'box-a', 'GameSelect'),
    ellipse(300, 75, 42, 16, 'box-y', 'QRPayment'),
    ellipse(430, 75, 48, 16, 'box-g', 'AssignDevice'),
    ellipse(560, 75, 48, 16, 'box', 'Playing'),
    ellipse(680, 140, 42, 16, 'box-y', 'Settlement'),
    arrow(108, 75, 133, 75),
    arrow(217, 75, 258, 75, '选游戏'),
    arrow(342, 75, 382, 75, '支付成功'),
    arrow(478, 75, 512, 75, '佩戴VR'),
    arrow(608, 85, 650, 128, '结束'),
    '<text x="380" y="170" text-anchor="middle" class="muted">Idle→GameSelect→QRPayment→AssignDevice→Playing→Settlement</text>'
)

# Order Lifecycle
make('fig10-order-lifecycle.svg', 700, 300,
    '<text x="30" y="25" class="title">订单全生命周期状态机</text>',
    ellipse(100, 70, 50, 18, 'box', '已创建'),
    ellipse(250, 70, 50, 18, 'box-a', '已支付'),
    ellipse(420, 70, 50, 18, 'box-g', '处理中'),
    ellipse(580, 70, 50, 18, 'box', '已完成'),
    ellipse(180, 170, 48, 18, 'box-r', '已取消'),
    ellipse(360, 170, 48, 18, 'box-y', '退款中'),
    ellipse(510, 170, 48, 18, 'box-r', '已退款'),
    arrow(150, 70, 200, 70, '支付'),
    arrow(300, 70, 370, 70, '确认'),
    arrow(470, 70, 530, 70, '完成'),
    arrow(100, 85, 120, 155, '超时取消', 'arrow'),
    arrow(250, 85, 300, 155, '发起退款', 'arrow'),
    arrow(420, 85, 312, 155, '失败', 'arrow-d'),
    arrow(408, 170, 462, 170, '到账'),
    '<text x="350" y="230" text-anchor="middle" class="muted">创建→支付→处理→完成(正常) | 取消/退款(异常)</text>'
)

# Device State
make('fig13-device-state.svg', 650, 250,
    '<text x="30" y="25" class="title">设备状态机图</text>',
    ellipse(100, 70, 40, 16, 'box', '离线'),
    ellipse(230, 70, 40, 16, 'box-a', '在线'),
    ellipse(370, 70, 40, 16, 'box-g', '空闲'),
    ellipse(510, 70, 40, 16, 'box-y', '使用中'),
    ellipse(230, 160, 40, 16, 'box-r', '故障'),
    ellipse(400, 160, 40, 16, 'box', '维修中'),
    arrow(140, 70, 190, 70),
    arrow(270, 70, 330, 70),
    arrow(410, 70, 470, 70),
    arrow(100, 85, 100, 145, '', 'arrow'),
    arrow(100, 150, 190, 155, '', 'arrow'),
    arrow(370, 85, 270, 145, '', 'arrow-d'),
    arrow(270, 160, 360, 160),
    '<text x="330" y="210" text-anchor="middle" class="muted">离线→在线→空闲→使用中(正常) | 故障→维修(异常)</text>'
)

# RBAC
make('fig-rbac-hierarchy.svg', 700, 350,
    '<text x="30" y="25" class="title">RBAC角色权限层级图</text>',
    rect(50, 40, 600, 55, 'box-r', 'L1 平台层 — 全局管控'),
    rect(65, 65, 125, 22, 'box-r', '超管'),
    rect(205, 65, 125, 22, 'box', '运营'),
    rect(345, 65, 125, 22, 'box-a', '财务'),
    rect(485, 65, 125, 22, 'box-g', '内容'),
    rect(50, 110, 600, 45, 'box-y', 'L2 区域层 — 渠道管理'),
    rect(275, 125, 150, 22, 'box-y', '代理商管理员'),
    rect(50, 170, 600, 45, 'box', 'L3 门店层 — 日常运营'),
    rect(110, 185, 140, 22, 'box-g', '店长'),
    rect(280, 185, 140, 22, 'box-a', '收银员'),
    rect(450, 185, 140, 22, 'box', '员工'),
    rect(50, 230, 600, 40, 'box', 'L4 终端层'),
    '<text x="200" y="255" class="muted">C端游客(匿名) / C端会员(注册)</text>',
    '<text x="350" y="310" text-anchor="middle" class="muted">八角色四层级权限体系</text>'
)

# Deployment
make('fig-deployment.svg', 780, 320,
    '<text x="30" y="25" class="title">门店部署架构 (1:N PC→VR)</text>',
    rect(50, 45, 200, 55, 'box-a', 'PC终端 #1 触摸屏', '选游戏 → 支付 → 分配'),
    rect(300, 45, 180, 55, 'box-g', '后端调度服务', 'MQTT下发指令'),
    arrow(250, 72, 300, 72),
    arrow(390, 100, 390, 145),
    '<text x="400" y="130" class="ar-lbl">MQTT launch_game</text>',
    rect(60, 155, 100, 65, 'box-g', '#01 空闲', 'Pico 4'),
    rect(180, 155, 100, 65, 'box-g', '#02 空闲', 'Pico 4'),
    rect(300, 155, 100, 65, 'box-y', '#03 运行中', '过山车VR'),
    rect(420, 155, 100, 65, 'box-g', '#04 空闲', 'Quest 3'),
    rect(540, 155, 100, 65, 'box', '#05 充电', 'Pico 4'),
    rect(660, 155, 100, 65, 'box-r', '#06 离线', '需检修'),
    '<text x="390" y="260" text-anchor="middle" class="muted">建议 1:4~1:8 比例 | 后端统一调度空闲设备 | 排除低电量/过热/维修中</text>',
    '<text x="390" y="280" text-anchor="middle" class="muted">游戏包由 VR Launcher 后台自动下载 (MinIO/OSS → 本地存储)</text>'
)

print(f'\n完成! 共 {len(os.listdir(OUT))} 个SVG文件 → {OUT}')
