#!/usr/bin/env python3
"""Topology v6: Clean radial layout - no zone boxes, clear connection grouping"""
p = '/Users/andy/Downloads/baidu/codebuddy/VRtouhaokongjian/docs/头号空间-产品需求文档-PRD-v1.3.md'
with open(p, 'r') as f:
    c = f.read()
st = c.index('### 3.2 子系统间交互关系')
s = c.index('<svg', st)
e = c.index('</svg>', s) + 6

new = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 520" style="max-width:100%;height:auto;margin:12px auto;display:block;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.08);font-family:'PingFang SC','Microsoft YaHei','Helvetica Neue',sans-serif">
  <rect width="860" height="520" fill="#f8fafc" rx="12"/>
  <text x="430" y="28" text-anchor="middle" fill="#1e293b" font-size="16" font-weight="700">子系统交互拓扑图</text>
  <text x="430" y="46" text-anchor="middle" fill="#94a3b8" font-size="11">后端API为所有端共享的基础设施</text>

  <!-- ====== 左列：C端触达 + 门店运营层 ====== -->
  <rect x="40" y="72" width="160" height="36" rx="8" fill="#3b82f6"/>
  <text x="120" y="96" text-anchor="middle" fill="#fff" font-size="12" font-weight="600">📱 C端微信小程序</text>

  <rect x="40" y="130" width="160" height="32" rx="6" fill="#0ea5e9"/>
  <text x="120" y="153" text-anchor="middle" fill="#fff" font-size="12" font-weight="600">💻 PC收银系统</text>

  <rect x="40" y="178" width="160" height="32" rx="6" fill="#0ea5e9"/>
  <text x="120" y="201" text-anchor="middle" fill="#fff" font-size="12" font-weight="600">🖥️ PC游戏终端</text>

  <rect x="40" y="226" width="160" height="32" rx="6" fill="#0ea5e9"/>
  <text x="120" y="249" text-anchor="middle" fill="#fff" font-size="12" font-weight="600">🥽 VR头显终端</text>

  <!-- ====== 中列：基础设施 ====== -->
  <rect x="340" y="66" width="180" height="46" rx="10" fill="#8b5cf6"/>
  <text x="430" y="93" text-anchor="middle" fill="#fff" font-size="15" font-weight="700">☁️ 后端API</text>

  <rect x="350" y="140" width="80" height="28" rx="6" fill="#10b981"/>
  <text x="390" y="160" text-anchor="middle" fill="#fff" font-size="11" font-weight="600">🎮 SDK</text>

  <rect x="450" y="140" width="80" height="28" rx="6" fill="#a78bfa"/>
  <text x="490" y="160" text-anchor="middle" fill="#fff" font-size="10" font-weight="500">🔄 WS</text>

  <rect x="390" y="240" width="90" height="28" rx="6" fill="#14b8a6"/>
  <text x="435" y="260" text-anchor="middle" fill="#fff" font-size="10" font-weight="500">📡 MQTT</text>

  <!-- ====== 右列：管理后台 ====== -->
  <rect x="660" y="72" width="160" height="36" rx="8" fill="#f59e0b"/>
  <text x="740" y="96" text-anchor="middle" fill="#fff" font-size="12" font-weight="600">🖥️ 管理后台×3</text>

  <rect x="660" y="130" width="160" height="30" rx="6" fill="#fbbf24"/>
  <text x="740" y="151" text-anchor="middle" fill="#78350f" font-size="11" font-weight="500">🔐 RBAC</text>

  <rect x="660" y="178" width="160" height="34" rx="8" fill="#f59e0b"/>
  <text x="740" y="201" text-anchor="middle" fill="#fff" font-size="12" font-weight="600">📊 业务服务层</text>

  <!-- ====== 连线：简洁，分组 ====== -->
  <!-- 小程序 → 后端API (REST/WS) -->
  <line x1="200" y1="90" x2="340" y2="90" stroke="#a78bfa" stroke-width="2" marker-end="url(#ap)"/>
  <text x="270" y="84" text-anchor="middle" fill="#8b5cf6" font-size="10" font-weight="600">REST / WebSocket</text>

  <!-- 小程序 → WS -->
  <line x1="200" y1="100" x2="490" y2="154" stroke="#a78bfa" stroke-width="1.5" marker-end="url(#ap)" stroke-dasharray="5,3"/>
  <text x="340" y="136" fill="#8b5cf6" font-size="9">消息推送</text>

  <!-- PC收银 → 后端API -->
  <path d="M 200,146 L 260,146 L 260,89 L 340,89" fill="none" stroke="#38bdf8" stroke-width="2" marker-end="url(#as)"/>
  <text x="230" y="120" fill="#0ea5e9" font-size="9" font-weight="600">Token认证</text>

  <!-- PC终端 → SDK -->
  <line x1="200" y1="194" x2="350" y2="154" stroke="#10b981" stroke-width="2" marker-end="url(#ag)"/>
  <text x="270" y="178" text-anchor="middle" fill="#16a34a" font-size="10" font-weight="600">Session / 计费</text>

  <!-- VR → SDK -->
  <path d="M 200,242 L 240,242 L 240,154 L 350,154" fill="none" stroke="#10b981" stroke-width="1.5" marker-end="url(#ag)" stroke-dasharray="5,3"/>
  <text x="220" y="238" fill="#16a34a" font-size="9">本地运行</text>

  <!-- SDK → 后端API -->
  <line x1="390" y1="140" x2="420" y2="112" stroke="#10b981" stroke-width="1.5" marker-end="url(#ag)"/>

  <!-- SDK → MQTT -->
  <line x1="435" y1="168" x2="435" y2="240" stroke="#14b8a6" stroke-width="1.5" marker-end="url(#at)"/>
  <text x="445" y="206" fill="#14b8a6" font-size="9">设备通信</text>

  <!-- WS → 后端API -->
  <line x1="470" y1="140" x2="450" y2="112" stroke="#a78bfa" stroke-width="1.5" marker-end="url(#ap)"/>

  <!-- 管理后台 → 后端API -->
  <line x1="660" y1="90" x2="520" y2="89" stroke="#f59e0b" stroke-width="2" marker-end="url(#aa)"/>
  <text x="590" y="84" text-anchor="middle" fill="#d97706" font-size="10" font-weight="600">HTTP API</text>

  <!-- 管理后台 → RBAC → 业务服务 -->
  <line x1="740" y1="108" x2="740" y2="130" stroke="#f59e0b" stroke-width="1.8" marker-end="url(#aa)"/>
  <line x1="740" y1="160" x2="740" y2="178" stroke="#f59e0b" stroke-width="1.8" marker-end="url(#aa)"/>

  <!-- ====== 图例 ====== -->
  <rect x="40" y="310" width="780" height="28" rx="6" fill="#f1f5f9"/>
  <text x="430" y="330" text-anchor="middle" fill="#64748b" font-size="10">
    图例：<tspan fill="#8b5cf6">● REST/WS</tspan> ·
    <tspan fill="#0ea5e9">● Token认证</tspan> ·
    <tspan fill="#16a34a">● Session/计费</tspan> ·
    <tspan fill="#14b8a6">● 设备通信</tspan> ·
    <tspan fill="#d97706">● HTTP API</tspan> ·
    <tspan fill="#8b5cf6" stroke-dasharray="5,3">┅ 消息推送</tspan>
  </text>

  <!-- 数据层 -->
  <rect x="40" y="360" width="780" height="26" rx="6" fill="#f1f5f9"/>
  <text x="430" y="378" text-anchor="middle" fill="#475569" font-size="11" font-weight="600">数据层 — PostgreSQL(业务) · Redis(缓存/会话) · MongoDB(日志) · MinIO(游戏包/图片) · MQTT(设备通信)</text>

  <!-- 分区标签 -->
  <text x="120" y="68" fill="#3b82f6" font-size="11" font-weight="600">C端触达 / 门店运营</text>
  <text x="430" y="62" fill="#16a34a" font-size="11" font-weight="600">基础设施</text>
  <text x="740" y="68" fill="#7c3aed" font-size="11" font-weight="600">管理后台</text>

  <defs>
    <marker id="ap" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#8b5cf6"/></marker>
    <marker id="as" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#0ea5e9"/></marker>
    <marker id="ag" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#10b981"/></marker>
    <marker id="aa" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#f59e0b"/></marker>
    <marker id="at" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#14b8a6"/></marker>
  </defs>
</svg>'''
c = c[:s] + new + c[e:]
with open(p, 'w') as f:
    f.write(c)
print('Done - clean topology with grouped connections')
