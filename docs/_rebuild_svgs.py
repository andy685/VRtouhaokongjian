#!/usr/bin/env python3
"""Rebuild mind map and topology SVGs with correct coordinates"""
import re

path = '/Users/andy/Downloads/baidu/codebuddy/VRtouhaokongjian/docs/头号空间-产品需求文档-PRD-v1.3.md'
with open(path, 'r') as f:
    c = f.read()

# ================================================================
# 1. REBUILD MIND MAP (产品功能全景)
# ================================================================
start = c.index('## 4. 子系统功能详解')
s = c.index('<svg', start)
e = c.index('</svg>', s) + 6
old_svg = c[s:e]

# Find the center node text positions to fix them
# Center rect at y=300, h=60 -> text at y=328, 346
# Top branches at y=68, sub-items at 114, 140, 166
# Side branches (VR/SDK) at y=290
# Bottom branches at y=450, sub-items at 496, 522, 548

new_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 680" style="max-width:100%;height:auto;margin:12px auto;display:block;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.08);font-family:'PingFang SC','Microsoft YaHei','Helvetica Neue',sans-serif">
  <rect width="960" height="680" fill="#f8fafc" rx="12"/>
  <text x="480" y="32" text-anchor="middle" fill="#1e293b" font-size="18" font-weight="700">头号空间 · 产品功能全景</text>
  <text x="480" y="52" text-anchor="middle" fill="#94a3b8" font-size="12">8大子系统 · 全链路VR体验店运营管理</text>

  <!-- 中心节点 -->
  <rect x="355" y="300" width="250" height="60" rx="30" fill="#3b82f6" filter="url(#shadow)"/>
  <text x="480" y="330" text-anchor="middle" fill="#fff" font-size="16" font-weight="700">🎮 头号空间</text>
  <text x="480" y="348" text-anchor="middle" fill="#bfdbfe" font-size="11">全链路VR体验店运营管理平台</text>

  <!-- 上1: C端小程序 -->
  <rect x="100" y="68" width="176" height="38" rx="8" fill="#eff6ff" stroke="#93c5fd" stroke-width="1.5"/>
  <text x="188" y="93" text-anchor="middle" fill="#1e40af" font-size="13" font-weight="600">📱 C端微信小程序</text>
  <rect x="50" y="114" width="124" height="22" rx="4" fill="#fff" stroke="#bfdbfe" stroke-width="1"/><text x="112" y="130" text-anchor="middle" fill="#475569" font-size="9">🏠 首页</text>
  <rect x="180" y="114" width="124" height="22" rx="4" fill="#fff" stroke="#bfdbfe" stroke-width="1"/><text x="242" y="130" text-anchor="middle" fill="#475569" font-size="9">🎮 游戏分类</text>
  <rect x="50" y="140" width="124" height="22" rx="4" fill="#fff" stroke="#bfdbfe" stroke-width="1"/><text x="112" y="156" text-anchor="middle" fill="#475569" font-size="9">📄 游戏详情</text>
  <rect x="180" y="140" width="124" height="22" rx="4" fill="#fff" stroke="#bfdbfe" stroke-width="1"/><text x="242" y="156" text-anchor="middle" fill="#475569" font-size="9">💳 充值</text>
  <rect x="50" y="166" width="124" height="22" rx="4" fill="#fff" stroke="#bfdbfe" stroke-width="1"/><text x="112" y="182" text-anchor="middle" fill="#475569" font-size="9">📋 订单·扫码</text>
  <rect x="180" y="166" width="124" height="22" rx="4" fill="#fff" stroke="#bfdbfe" stroke-width="1"/><text x="242" y="182" text-anchor="middle" fill="#475569" font-size="9">🏪 门店·⭐评价</text>
  <path d="M 188,106 L 188,300" fill="none" stroke="#93c5fd" stroke-width="1.5"/>

  <!-- 上2: PC收银 -->
  <rect x="392" y="68" width="176" height="38" rx="8" fill="#f0f9ff" stroke="#7dd3fc" stroke-width="1.5"/>
  <text x="480" y="93" text-anchor="middle" fill="#0369a1" font-size="13" font-weight="600">💻 PC收银系统</text>
  <rect x="360" y="114" width="110" height="22" rx="4" fill="#fff" stroke="#7dd3fc" stroke-width="1"/><text x="415" y="130" text-anchor="middle" fill="#475569" font-size="9">🛒 收银台(4Tab)</text>
  <rect x="476" y="114" width="110" height="22" rx="4" fill="#fff" stroke="#7dd3fc" stroke-width="1"/><text x="531" y="130" text-anchor="middle" fill="#475569" font-size="9">👥 会员管理</text>
  <rect x="360" y="140" width="110" height="22" rx="4" fill="#fff" stroke="#7dd3fc" stroke-width="1"/><text x="415" y="156" text-anchor="middle" fill="#475569" font-size="9">💰 充值/办卡</text>
  <rect x="476" y="140" width="110" height="22" rx="4" fill="#fff" stroke="#7dd3fc" stroke-width="1"/><text x="531" y="156" text-anchor="middle" fill="#475569" font-size="9">🔄 交接班</text>
  <rect x="360" y="166" width="110" height="22" rx="4" fill="#fff" stroke="#7dd3fc" stroke-width="1"/><text x="415" y="182" text-anchor="middle" fill="#475569" font-size="9">📋 订单管理</text>
  <rect x="476" y="166" width="110" height="22" rx="4" fill="#fff" stroke="#7dd3fc" stroke-width="1"/><text x="531" y="182" text-anchor="middle" fill="#475569" font-size="9">🖥️ 设备监控</text>
  <path d="M 480,106 L 480,300" fill="none" stroke="#7dd3fc" stroke-width="1.5"/>

  <!-- 上3: PC游戏终端 -->
  <rect x="684" y="68" width="176" height="38" rx="8" fill="#f0fdf4" stroke="#86efac" stroke-width="1.5"/>
  <text x="772" y="93" text-anchor="middle" fill="#166534" font-size="13" font-weight="600">🖥️ PC游戏终端</text>
  <rect x="680" y="114" width="84" height="22" rx="4" fill="#fff" stroke="#86efac" stroke-width="1"/><text x="722" y="130" text-anchor="middle" fill="#475569" font-size="9">待机→选游戏</text>
  <rect x="770" y="114" width="84" height="22" rx="4" fill="#fff" stroke="#86efac" stroke-width="1"/><text x="812" y="130" text-anchor="middle" fill="#475569" font-size="9">扫码支付</text>
  <rect x="680" y="140" width="84" height="22" rx="4" fill="#fff" stroke="#86efac" stroke-width="1"/><text x="722" y="156" text-anchor="middle" fill="#475569" font-size="9">设备繁忙</text>
  <rect x="770" y="140" width="84" height="22" rx="4" fill="#fff" stroke="#86efac" stroke-width="1"/><text x="812" y="156" text-anchor="middle" fill="#475569" font-size="9">分配设备</text>
  <rect x="680" y="166" width="84" height="22" rx="4" fill="#fff" stroke="#86efac" stroke-width="1"/><text x="722" y="182" text-anchor="middle" fill="#475569" font-size="9">监控·结算</text>
  <rect x="770" y="166" width="84" height="22" rx="4" fill="#fff" stroke="#86efac" stroke-width="1"/><text x="812" y="182" text-anchor="middle" fill="#475569" font-size="9">评分评价</text>
  <path d="M 772,106 L 772,220 L 605,310" fill="none" stroke="#86efac" stroke-width="1.5"/>

  <!-- 左: VR头显 -->
  <rect x="30" y="290" width="140" height="38" rx="8" fill="#fefce8" stroke="#fcd34d" stroke-width="1.5"/>
  <text x="100" y="315" text-anchor="middle" fill="#92400e" font-size="13" font-weight="600">🥽 VR头显终端</text>
  <rect x="18" y="334" width="90" height="22" rx="4" fill="#fff" stroke="#fcd34d" stroke-width="1"/><text x="63" y="350" text-anchor="middle" fill="#475569" font-size="9">待机→加载</text>
  <rect x="112" y="334" width="90" height="22" rx="4" fill="#fff" stroke="#fcd34d" stroke-width="1"/><text x="157" y="350" text-anchor="middle" fill="#475569" font-size="9">沉浸游戏</text>
  <rect x="18" y="360" width="90" height="22" rx="4" fill="#fff" stroke="#fcd34d" stroke-width="1"/><text x="63" y="376" text-anchor="middle" fill="#475569" font-size="9">结束提示</text>
  <rect x="112" y="360" width="90" height="22" rx="4" fill="#fff" stroke="#fcd34d" stroke-width="1"/><text x="157" y="376" text-anchor="middle" fill="#475569" font-size="9">异常提示</text>
  <path d="M 170,309 L 355,320" fill="none" stroke="#fcd34d" stroke-width="1.5"/>

  <!-- 右: 游戏SDK -->
  <rect x="790" y="290" width="140" height="38" rx="8" fill="#f0fdfa" stroke="#99f6e4" stroke-width="1.5"/>
  <text x="860" y="315" text-anchor="middle" fill="#115e59" font-size="13" font-weight="600">🎮 游戏SDK</text>
  <rect x="800" y="334" width="120" height="22" rx="4" fill="#fff" stroke="#99f6e4" stroke-width="1"/><text x="860" y="350" text-anchor="middle" fill="#475569" font-size="9">Session管理</text>
  <rect x="800" y="360" width="120" height="22" rx="4" fill="#fff" stroke="#99f6e4" stroke-width="1"/><text x="860" y="376" text-anchor="middle" fill="#475569" font-size="9">计费引擎</text>
  <rect x="800" y="386" width="120" height="22" rx="4" fill="#fff" stroke="#99f6e4" stroke-width="1"/><text x="860" y="402" text-anchor="middle" fill="#475569" font-size="9">设备·心跳</text>
  <path d="M 790,309 L 605,320" fill="none" stroke="#99f6e4" stroke-width="1.5"/>

  <!-- 下1: 商家管理后台 -->
  <rect x="100" y="450" width="176" height="38" rx="8" fill="#fef2f2" stroke="#fecaca" stroke-width="1.5"/>
  <text x="188" y="475" text-anchor="middle" fill="#991b1b" font-size="13" font-weight="600">🏪 商家管理后台</text>
  <rect x="50" y="496" width="124" height="22" rx="4" fill="#fff" stroke="#fecaca" stroke-width="1"/><text x="112" y="512" text-anchor="middle" fill="#475569" font-size="9">📊 工作台·商品</text>
  <rect x="180" y="496" width="124" height="22" rx="4" fill="#fff" stroke="#fecaca" stroke-width="1"/><text x="242" y="512" text-anchor="middle" fill="#475569" font-size="9">👤 会员管理</text>
  <rect x="50" y="522" width="124" height="22" rx="4" fill="#fff" stroke="#fecaca" stroke-width="1"/><text x="112" y="538" text-anchor="middle" fill="#475569" font-size="9">📋 订单管理</text>
  <rect x="180" y="522" width="124" height="22" rx="4" fill="#fff" stroke="#fecaca" stroke-width="1"/><text x="242" y="538" text-anchor="middle" fill="#475569" font-size="9">💰 充值·游戏豆</text>
  <rect x="50" y="548" width="124" height="22" rx="4" fill="#fff" stroke="#fecaca" stroke-width="1"/><text x="112" y="564" text-anchor="middle" fill="#475569" font-size="9">📈 报表·设备</text>
  <rect x="180" y="548" width="124" height="22" rx="4" fill="#fff" stroke="#fecaca" stroke-width="1"/><text x="242" y="564" text-anchor="middle" fill="#475569" font-size="9">⚙️ 系统设置</text>
  <path d="M 188,488 L 188,370 L 355,340" fill="none" stroke="#fecaca" stroke-width="1.5"/>

  <!-- 下2: 代理商 -->
  <rect x="392" y="450" width="176" height="38" rx="8" fill="#f5f3ff" stroke="#c4b5fd" stroke-width="1.5"/>
  <text x="480" y="475" text-anchor="middle" fill="#5b21b6" font-size="13" font-weight="600">🤝 代理商系统</text>
  <rect x="360" y="496" width="110" height="22" rx="4" fill="#fff" stroke="#c4b5fd" stroke-width="1"/><text x="415" y="512" text-anchor="middle" fill="#475569" font-size="9">📊 工作台</text>
  <rect x="476" y="496" width="110" height="22" rx="4" fill="#fff" stroke="#c4b5fd" stroke-width="1"/><text x="531" y="512" text-anchor="middle" fill="#475569" font-size="9">🏪 商家管理</text>
  <rect x="360" y="522" width="110" height="22" rx="4" fill="#fff" stroke="#c4b5fd" stroke-width="1"/><text x="415" y="538" text-anchor="middle" fill="#475569" font-size="9">💰 分润明细</text>
  <rect x="476" y="522" width="110" height="22" rx="4" fill="#fff" stroke="#c4b5fd" stroke-width="1"/><text x="531" y="538" text-anchor="middle" fill="#475569" font-size="9">📋 结算记录</text>
  <rect x="360" y="548" width="110" height="22" rx="4" fill="#fff" stroke="#c4b5fd" stroke-width="1"/><text x="415" y="564" text-anchor="middle" fill="#475569" font-size="9">💳 提现账户</text>
  <rect x="476" y="548" width="110" height="22" rx="4" fill="#fff" stroke="#c4b5fd" stroke-width="1"/><text x="531" y="564" text-anchor="middle" fill="#475569" font-size="9">📈 营收·消息</text>
  <path d="M 480,488 L 480,360" fill="none" stroke="#c4b5fd" stroke-width="1.5"/>

  <!-- 下3: 总运营后台 -->
  <rect x="684" y="450" width="176" height="38" rx="8" fill="#fefce8" stroke="#fde68a" stroke-width="1.5"/>
  <text x="772" y="475" text-anchor="middle" fill="#92400e" font-size="13" font-weight="600">🔴 总运营后台</text>
  <rect x="640" y="496" width="110" height="22" rx="4" fill="#fff" stroke="#fde68a" stroke-width="1"/><text x="695" y="512" text-anchor="middle" fill="#475569" font-size="9">📊 大屏看板</text>
  <rect x="756" y="496" width="110" height="22" rx="4" fill="#fff" stroke="#fde68a" stroke-width="1"/><text x="811" y="512" text-anchor="middle" fill="#475569" font-size="9">门店·商家·代理</text>
  <rect x="640" y="522" width="110" height="22" rx="4" fill="#fff" stroke="#fde68a" stroke-width="1"/><text x="695" y="538" text-anchor="middle" fill="#475569" font-size="9">🎮 游戏库管理</text>
  <rect x="756" y="522" width="110" height="22" rx="4" fill="#fff" stroke="#fde68a" stroke-width="1"/><text x="811" y="538" text-anchor="middle" fill="#475569" font-size="9">💰 财务·分润</text>
  <rect x="640" y="548" width="110" height="22" rx="4" fill="#fff" stroke="#fde68a" stroke-width="1"/><text x="695" y="564" text-anchor="middle" fill="#475569" font-size="9">🔍 对账中心</text>
  <rect x="756" y="548" width="110" height="22" rx="4" fill="#fff" stroke="#fde68a" stroke-width="1"/><text x="811" y="564" text-anchor="middle" fill="#475569" font-size="9">📢 消息·设置</text>
  <path d="M 772,488 L 772,370 L 605,340" fill="none" stroke="#fde68a" stroke-width="1.5"/>

  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="160%">
      <feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="#0f172a" flood-opacity="0.15"/>
    </filter>
  </defs>
</svg>'''

c = c[:s] + new_svg + c[e:]

# ================================================================
# 2. REBUILD TOPOLOGY SVG (子系统交互拓扑图)
# ================================================================
start2 = c.index('### 3.2 子系统间交互关系')
s2 = c.index('<svg', start2)
e2 = c.index('</svg>', s2) + 6

new_topology = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 420" style="max-width:100%;height:auto;margin:12px auto;display:block;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.08);font-family:'PingFang SC','Microsoft YaHei','Helvetica Neue',sans-serif">
  <rect width="840" height="420" fill="#f8fafc" rx="12"/>
  <text x="420" y="26" text-anchor="middle" fill="#1e293b" font-size="15" font-weight="700">子系统交互拓扑图</text>
  <text x="420" y="44" text-anchor="middle" fill="#64748b" font-size="11">后端API为所有端共享的基础设施</text>

  <!-- 区域: C端触达 -->
  <rect x="18" y="56" width="170" height="108" rx="8" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1" stroke-dasharray="4,3"/>
  <text x="28" y="72" fill="#3b82f6" font-size="10" font-weight="600">C端触达</text>
  <rect x="28" y="82" width="148" height="34" rx="8" fill="#3b82f6"/>
  <text x="102" y="105" text-anchor="middle" fill="#fff" font-size="12" font-weight="600">📱 C端微信小程序</text>

  <!-- 区域: 门店运营层 -->
  <rect x="18" y="172" width="170" height="182" rx="8" fill="#fefce8" stroke="#fde68a" stroke-width="1" stroke-dasharray="4,3"/>
  <text x="28" y="188" fill="#d97706" font-size="10" font-weight="600">门店运营层</text>
  <rect x="28" y="196" width="148" height="30" rx="6" fill="#0ea5e9"/>
  <text x="102" y="217" text-anchor="middle" fill="#fff" font-size="11" font-weight="600">💻 PC收银系统</text>
  <rect x="28" y="232" width="148" height="30" rx="6" fill="#0ea5e9"/>
  <text x="102" y="253" text-anchor="middle" fill="#fff" font-size="11" font-weight="600">🖥️ PC游戏终端</text>
  <rect x="28" y="268" width="148" height="30" rx="6" fill="#0ea5e9"/>
  <text x="102" y="289" text-anchor="middle" fill="#fff" font-size="11" font-weight="600">🥽 VR头显终端</text>

  <!-- 区域: 基础设施 -->
  <rect x="200" y="56" width="240" height="298" rx="8" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1" stroke-dasharray="4,3"/>
  <text x="210" y="72" fill="#16a34a" font-size="10" font-weight="600">基础设施（共享服务）</text>
  <rect x="214" y="84" width="106" height="34" rx="8" fill="#8b5cf6"/>
  <text x="267" y="107" text-anchor="middle" fill="#fff" font-size="12" font-weight="600">☁️ 后端API</text>
  <rect x="214" y="128" width="106" height="28" rx="6" fill="#a78bfa"/>
  <text x="267" y="147" text-anchor="middle" fill="#fff" font-size="10" font-weight="500">🔄 WebSocket</text>
  <rect x="320" y="84" width="106" height="34" rx="8" fill="#10b981"/>
  <text x="373" y="107" text-anchor="middle" fill="#fff" font-size="12" font-weight="600">🎮 游戏SDK</text>
  <rect x="320" y="210" width="106" height="28" rx="6" fill="#14b8a6"/>
  <text x="373" y="229" text-anchor="middle" fill="#fff" font-size="10" font-weight="500">📡 MQTT</text>

  <!-- 区域: 管理后台 -->
  <rect x="458" y="56" width="364" height="170" rx="8" fill="#f5f3ff" stroke="#ddd6fe" stroke-width="1" stroke-dasharray="4,3"/>
  <text x="468" y="72" fill="#7c3aed" font-size="10" font-weight="600">管理后台层</text>
  <rect x="468" y="84" width="172" height="34" rx="8" fill="#f59e0b"/>
  <text x="554" y="107" text-anchor="middle" fill="#fff" font-size="12" font-weight="600">🖥️ Web管理后台 × 3</text>
  <rect x="648" y="84" width="166" height="34" rx="8" fill="#fbbf24"/>
  <text x="731" y="107" text-anchor="middle" fill="#78350f" font-size="12" font-weight="600">🔐 RBAC 权限控制</text>
  <rect x="468" y="128" width="346" height="34" rx="8" fill="#f59e0b"/>
  <text x="641" y="151" text-anchor="middle" fill="#fff" font-size="12" font-weight="600">📊 业务服务层（商家/代理商/总运营）</text>

  <!-- 数据层 -->
  <rect x="18" y="370" width="804" height="38" rx="8" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
  <text x="420" y="394" text-anchor="middle" fill="#475569" font-size="11" font-weight="600">数据层</text>
  <text x="420" y="408" text-anchor="middle" fill="#64748b" font-size="9" visibility="hidden">PostgreSQL · Redis · MongoDB · MinIO · MQTT</text>

  <!-- 连接线: C端 -->
  <line x1="176" y1="100" x2="214" y2="100" stroke="#a78bfa" stroke-width="1.8" marker-end="url(#a-purple)"/>
  <text x="195" y="94" text-anchor="middle" fill="#8b5cf6" font-size="9">REST/WS</text>
  <path d="M 176,110 L 240,140 L 214,142" fill="none" stroke="#a78bfa" stroke-width="1.5" marker-end="url(#a-purple)" stroke-dasharray="4,3"/>
  <text x="200" y="138" text-anchor="middle" fill="#8b5cf6" font-size="8">消息推送</text>

  <!-- 连接线: PC收银 -->
  <line x1="176" y1="211" x2="214" y2="101" stroke="#38bdf8" stroke-width="1.8" marker-end="url(#a-sky)"/>
  <text x="195" y="160" text-anchor="middle" fill="#0ea5e9" font-size="9">Token认证</text>

  <!-- 连接线: PC终端→SDK -->
  <line x1="176" y1="248" x2="320" y2="102" stroke="#10b981" stroke-width="1.8" marker-end="url(#a-green)"/>
  <text x="248" y="170" text-anchor="middle" fill="#16a34a" font-size="9">Session/计费</text>
  <text x="194" y="224" text-anchor="middle" fill="#0ea5e9" font-size="8" font-style="italic">本地运行</text>

  <!-- 连接线: VR→SDK -->
  <line x1="176" y1="283" x2="320" y2="103" stroke="#10b981" stroke-width="1.5" marker-end="url(#a-green)" stroke-dasharray="4,3"/>

  <!-- 连接线: SDK→MQTT(设备通信) -->
  <line x1="373" y1="118" x2="373" y2="210" stroke="#14b8a6" stroke-width="1.5" marker-end="url(#a-teal)"/>
  <text x="383" y="170" text-anchor="middle" fill="#14b8a6" font-size="9">设备通信</text>

  <!-- 连接线: Web后台→RBAC→业务服务 -->
  <line x1="640" y1="101" x2="648" y2="101" stroke="#f59e0b" stroke-width="1.8" marker-end="url(#a-amber)"/>
  <line x1="731" y1="118" x2="731" y2="128" stroke="#f59e0b" stroke-width="1.8" marker-end="url(#a-amber)"/>

  <!-- 连接线: Web后台→后端API -->
  <path d="M 468,101 L 320,101" fill="none" stroke="#f59e0b" stroke-width="1.8" marker-end="url(#a-amber)"/>
  <text x="394" y="94" text-anchor="middle" fill="#d97706" font-size="9">HTTP API</text>

  <defs>
    <marker id="a-purple" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#8b5cf6"/></marker>
    <marker id="a-sky" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#0ea5e9"/></marker>
    <marker id="a-green" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#10b981"/></marker>
    <marker id="a-amber" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#f59e0b"/></marker>
    <marker id="a-teal" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#14b8a6"/></marker>
  </defs>
</svg>'''

c = c[:s2] + new_topology + c[e2:]

with open(path, 'w') as f:
    f.write(c)
print('✅ Both SVGs rebuilt with correct coordinates')
