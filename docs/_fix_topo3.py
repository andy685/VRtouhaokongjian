#!/usr/bin/env python3
"""Completely redesign topology: hub-and-spoke with generous spacing"""
p = '/Users/andy/Downloads/baidu/codebuddy/VRtouhaokongjian/docs/头号空间-产品需求文档-PRD-v1.3.md'
with open(p, 'r') as f:
    c = f.read()
st = c.index('### 3.2 子系统间交互关系')
s = c.index('<svg', st)
e = c.index('</svg>', s) + 6

new = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 460" style="max-width:100%;height:auto;margin:12px auto;display:block;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.08);font-family:'PingFang SC','Microsoft YaHei','Helvetica Neue',sans-serif">
  <rect width="840" height="460" fill="#f8fafc" rx="12"/>
  <text x="420" y="28" text-anchor="middle" fill="#1e293b" font-size="15" font-weight="700">子系统交互拓扑图</text>
  <text x="420" y="46" text-anchor="middle" fill="#64748b" font-size="11">后端API为所有端共享的基础设施</text>

  <!-- 范围标记 -->
  <text x="50" y="66" fill="#3b82f6" font-size="10" font-weight="600">C端触达 / 门店运营层</text>
  <text x="420" y="66" fill="#16a34a" font-size="10" font-weight="600">基础设施（共享服务）</text>
  <text x="740" y="66" fill="#7c3aed" font-size="10" font-weight="600">管理后台层</text>

  <!-- ============ 节点布局：宽间距 ============ -->

  <!-- 左列：C端 + 门店（带分组底色） -->
  <rect x="30" y="76" width="200" height="340" rx="10" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
  <rect x="44" y="90" width="172" height="34" rx="8" fill="#3b82f6"/>
  <text x="130" y="113" text-anchor="middle" fill="#fff" font-size="13" font-weight="600">📱 C端微信小程序</text>

  <rect x="44" y="148" width="172" height="32" rx="6" fill="#0ea5e9"/>
  <text x="130" y="171" text-anchor="middle" fill="#fff" font-size="12" font-weight="600">💻 PC收银系统</text>

  <rect x="44" y="194" width="172" height="32" rx="6" fill="#0ea5e9"/>
  <text x="130" y="217" text-anchor="middle" fill="#fff" font-size="12" font-weight="600">🖥️ PC游戏终端</text>

  <rect x="44" y="240" width="172" height="32" rx="6" fill="#0ea5e9"/>
  <text x="130" y="263" text-anchor="middle" fill="#fff" font-size="12" font-weight="600">🥽 VR头显终端</text>

  <!-- 中列：基础设施 -->
  <rect x="250" y="76" width="340" height="340" rx="10" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>

  <!-- 后端API（中心节点，加大） -->
  <rect x="360" y="100" width="130" height="40" rx="10" fill="#8b5cf6"/>
  <text x="425" y="126" text-anchor="middle" fill="#fff" font-size="14" font-weight="600">☁️ 后端API</text>

  <!-- 游戏SDK -->
  <rect x="370" y="180" width="110" height="34" rx="8" fill="#10b981"/>
  <text x="425" y="203" text-anchor="middle" fill="#fff" font-size="12" font-weight="600">🎮 游戏SDK</text>

  <!-- WebSocket -->
  <rect x="265" y="280" width="100" height="28" rx="6" fill="#a78bfa"/>
  <text x="315" y="300" text-anchor="middle" fill="#fff" font-size="10" font-weight="500">🔄 WebSocket</text>

  <!-- MQTT -->
  <rect x="385" y="280" width="100" height="28" rx="6" fill="#14b8a6"/>
  <text x="435" y="300" text-anchor="middle" fill="#fff" font-size="10" font-weight="500">📡 MQTT</text>

  <!-- 右列：管理后台 -->
  <rect x="610" y="76" width="200" height="340" rx="10" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>

  <rect x="618" y="96" width="184" height="34" rx="8" fill="#f59e0b"/>
  <text x="710" y="119" text-anchor="middle" fill="#fff" font-size="13" font-weight="600">🖥️ Web管理后台×3</text>

  <rect x="618" y="148" width="184" height="30" rx="6" fill="#fbbf24"/>
  <text x="710" y="169" text-anchor="middle" fill="#78350f" font-size="11" font-weight="500">🔐 RBAC 权限控制</text>

  <rect x="618" y="196" width="184" height="34" rx="8" fill="#f59e0b"/>
  <text x="710" y="219" text-anchor="middle" fill="#fff" font-size="13" font-weight="600">📊 业务服务层</text>

  <!-- 数据层 -->
  <rect x="30" y="426" width="780" height="24" rx="6" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
  <text x="420" y="444" text-anchor="middle" fill="#475569" font-size="10">数据层 · PostgreSQL(业务) · Redis(缓存/会话) · MongoDB(日志) · MinIO(游戏包/图片) · MQTT(设备通信)</text>

  <!-- ============ 连线：简洁正交 ============ -->

  <!-- 小程序 → 后端API -->
  <polyline points="216,107 360,107" fill="none" stroke="#a78bfa" stroke-width="1.8" marker-end="url(#ap)"/>
  <text x="288" y="101" text-anchor="middle" fill="#8b5cf6" font-size="9">REST/WS</text>

  <!-- 小程序 → WebSocket -->
  <polyline points="216,124 216,294 265,294" fill="none" stroke="#a78bfa" stroke-width="1.5" marker-end="url(#ap)" stroke-dasharray="4,3"/>
  <text x="240" y="290" text-anchor="middle" fill="#8b5cf6" font-size="9">消息推送</text>

  <!-- PC收银 → 后端API -->
  <polyline points="216,164 290,164 290,120 360,120" fill="none" stroke="#38bdf8" stroke-width="1.8" marker-end="url(#as)"/>
  <text x="254" y="157" text-anchor="middle" fill="#0ea5e9" font-size="9">Token认证</text>

  <!-- PC终端 → 游戏SDK -->
  <polyline points="216,210 370,197" fill="none" stroke="#10b981" stroke-width="1.8" marker-end="url(#ag)"/>
  <text x="310" y="203" text-anchor="middle" fill="#16a34a" font-size="9">Session/计费</text>

  <!-- VR → 游戏SDK -->
  <polyline points="216,256 280,256 280,197 370,197" fill="none" stroke="#10b981" stroke-width="1.5" marker-end="url(#ag)" stroke-dasharray="4,3"/>

  <!-- SDK → MQTT -->
  <polyline points="425,214 425,280" fill="none" stroke="#14b8a6" stroke-width="1.5" marker-end="url(#at)"/>
  <text x="435" y="250" text-anchor="middle" fill="#14b8a6" font-size="9">设备通信</text>

  <!-- SDK → 后端API -->
  <polyline points="390,180 390,140" fill="none" stroke="#10b981" stroke-width="1.5" marker-end="url(#ag)"/>

  <!-- Web后台 → 后端API: 直接左连 -->
  <polyline points="618,113 490,113" fill="none" stroke="#f59e0b" stroke-width="1.8" marker-end="url(#aa)"/>
  <text x="554" y="107" text-anchor="middle" fill="#d97706" font-size="9">HTTP API</text>

  <!-- Web后台 → RBAC → 业务服务 -->
  <polyline points="710,130 710,148" fill="none" stroke="#f59e0b" stroke-width="1.8" marker-end="url(#aa)"/>
  <polyline points="710,178 710,196" fill="none" stroke="#f59e0b" stroke-width="1.8" marker-end="url(#aa)"/>

  <!-- WebSocket → 后端API -->
  <polyline points="365,280 365,140" fill="none" stroke="#a78bfa" stroke-width="1.5" marker-end="url(#ap)"/>

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
print('Done')
