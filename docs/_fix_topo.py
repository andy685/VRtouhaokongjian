#!/usr/bin/env python3
"""Rebuild topology SVG with clean layout - no overlapping"""
import re

path = '/Users/andy/Downloads/baidu/codebuddy/VRtouhaokongjian/docs/头号空间-产品需求文档-PRD-v1.3.md'
with open(path, 'r') as f:
    c = f.read()

start = c.index('### 3.2 子系统间交互关系')
s = c.index('<svg', start)
e = c.index('</svg>', s) + 6

new = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 500" style="max-width:100%;height:auto;margin:12px auto;display:block;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.08);font-family:'PingFang SC','Microsoft YaHei','Helvetica Neue',sans-serif">
  <rect width="860" height="500" fill="#f8fafc" rx="12"/>
  <text x="430" y="28" text-anchor="middle" fill="#1e293b" font-size="15" font-weight="700">子系统交互拓扑图</text>
  <text x="430" y="46" text-anchor="middle" fill="#64748b" font-size="11">后端API为所有端共享的基础设施</text>

  <!-- 区域1: C端触达 -->
  <rect x="18" y="60" width="170" height="200" rx="8" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1" stroke-dasharray="4,3"/>
  <text x="28" y="76" fill="#3b82f6" font-size="10" font-weight="600">C端触达</text>
  <rect x="28" y="86" width="148" height="36" rx="8" fill="#3b82f6"/>
  <text x="102" y="110" text-anchor="middle" fill="#fff" font-size="12" font-weight="600">📱 C端微信小程序</text>

  <!-- 区域2: 门店运营层 -->
  <rect x="18" y="270" width="170" height="180" rx="8" fill="#fefce8" stroke="#fde68a" stroke-width="1" stroke-dasharray="4,3"/>
  <text x="28" y="286" fill="#d97706" font-size="10" font-weight="600">门店运营层</text>
  <rect x="28" y="296" width="148" height="32" rx="6" fill="#0ea5e9"/>
  <text x="102" y="318" text-anchor="middle" fill="#fff" font-size="12" font-weight="600">💻 PC收银系统</text>
  <rect x="28" y="338" width="148" height="32" rx="6" fill="#0ea5e9"/>
  <text x="102" y="360" text-anchor="middle" fill="#fff" font-size="12" font-weight="600">🖥️ PC游戏终端</text>
  <rect x="28" y="380" width="148" height="32" rx="6" fill="#0ea5e9"/>
  <text x="102" y="402" text-anchor="middle" fill="#fff" font-size="12" font-weight="600">🥽 VR头显终端</text>

  <!-- 区域3: 基础设施 -->
  <rect x="200" y="60" width="240" height="390" rx="8" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1" stroke-dasharray="4,3"/>
  <text x="210" y="76" fill="#16a34a" font-size="10" font-weight="600">基础设施（共享服务）</text>

  <rect x="214" y="90" width="106" height="36" rx="8" fill="#8b5cf6"/>
  <text x="267" y="114" text-anchor="middle" fill="#fff" font-size="12" font-weight="600">☁️ 后端API</text>

  <rect x="214" y="148" width="106" height="30" rx="6" fill="#a78bfa"/>
  <text x="267" y="169" text-anchor="middle" fill="#fff" font-size="10" font-weight="500">🔄 WebSocket</text>

  <rect x="330" y="90" width="96" height="36" rx="8" fill="#10b981"/>
  <text x="378" y="114" text-anchor="middle" fill="#fff" font-size="12" font-weight="600">🎮 游戏SDK</text>

  <rect x="330" y="260" width="96" height="30" rx="6" fill="#14b8a6"/>
  <text x="378" y="281" text-anchor="middle" fill="#fff" font-size="10" font-weight="500">📡 MQTT</text>

  <!-- 区域4: 管理后台 -->
  <rect x="458" y="60" width="384" height="270" rx="8" fill="#f5f3ff" stroke="#ddd6fe" stroke-width="1" stroke-dasharray="4,3"/>
  <text x="468" y="76" fill="#7c3aed" font-size="10" font-weight="600">管理后台层</text>

  <rect x="468" y="96" width="364" height="36" rx="8" fill="#f59e0b"/>
  <text x="650" y="120" text-anchor="middle" fill="#fff" font-size="13" font-weight="600">🖥️ Web管理后台 × 3</text>

  <rect x="468" y="152" width="364" height="32" rx="6" fill="#fbbf24"/>
  <text x="650" y="174" text-anchor="middle" fill="#78350f" font-size="12" font-weight="500">🔐 RBAC 权限控制</text>

  <rect x="468" y="204" width="364" height="36" rx="8" fill="#f59e0b"/>
  <text x="650" y="228" text-anchor="middle" fill="#fff" font-size="13" font-weight="600">📊 业务服务层</text>
  <text x="650" y="246" text-anchor="middle" fill="#fef3c7" font-size="10">商家管理后台 · 代理商系统 · 总运营后台</text>

  <!-- 区域5: 数据层 -->
  <rect x="18" y="462" width="824" height="28" rx="6" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
  <text x="430" y="481" text-anchor="middle" fill="#475569" font-size="11" font-weight="600">数据层  ·  PostgreSQL(业务)  ·  Redis(缓存/会话)  ·  MongoDB(日志)  ·  MinIO(游戏包/图片)  ·  MQTT(设备通信)</text>

  <!-- 连接线: 使用正交路由避免交叉 -->
  <!-- 小程序 → 后端API -->
  <polyline points="176,104 214,104" fill="none" stroke="#a78bfa" stroke-width="1.8" marker-end="url(#ap)"/>
  <text x="195" y="98" text-anchor="middle" fill="#8b5cf6" font-size="9">REST/WS</text>

  <!-- 小程序 → WebSocket -->
  <polyline points="176,120 176,163 214,163" fill="none" stroke="#a78bfa" stroke-width="1.5" marker-end="url(#ap)" stroke-dasharray="4,3"/>
  <text x="195" y="158" text-anchor="middle" fill="#8b5cf6" font-size="9">消息推送</text>

  <!-- PC收银 → 后端API -->
  <polyline points="176,312 176,108 214,108" fill="none" stroke="#38bdf8" stroke-width="1.8" marker-end="url(#as)"/>
  <text x="195" y="130" text-anchor="middle" fill="#0ea5e9" font-size="9">Token认证</text>

  <!-- PC游戏终端 → 游戏SDK -->
  <polyline points="176,354 330,108" fill="none" stroke="#10b981" stroke-width="1.8" marker-end="url(#ag)"/>
  <text x="253" y="230" text-anchor="middle" fill="#16a34a" font-size="9">Session/计费</text>
  <text x="137" y="348" text-anchor="middle" fill="#0ea5e9" font-size="8" font-style="italic">本地运行</text>

  <!-- VR → 游戏SDK (走不同路径避免交叉) -->
  <polyline points="176,396 176,430 330,430 330,126" fill="none" stroke="#10b981" stroke-width="1.5" marker-end="url(#ag)" stroke-dasharray="4,3"/>

  <!-- 游戏SDK → MQTT -->
  <polyline points="378,126 378,260" fill="none" stroke="#14b8a6" stroke-width="1.5" marker-end="url(#at)"/>
  <text x="388" y="200" text-anchor="middle" fill="#14b8a6" font-size="9">设备通信</text>

  <!-- Web后台 → RBAC → 业务服务 -->
  <polyline points="650,132 650,152" fill="none" stroke="#f59e0b" stroke-width="1.8" marker-end="url(#aa)"/>
  <polyline points="650,184 650,204" fill="none" stroke="#f59e0b" stroke-width="1.8" marker-end="url(#aa)"/>

  <!-- Web后台 → 后端API -->
  <polyline points="468,114 320,114" fill="none" stroke="#f59e0b" stroke-width="1.8" marker-end="url(#aa)"/>
  <text x="394" y="108" text-anchor="middle" fill="#d97706" font-size="9">HTTP API</text>

  <defs>
    <marker id="ap" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#8b5cf6"/></marker>
    <marker id="as" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#0ea5e9"/></marker>
    <marker id="ag" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#10b981"/></marker>
    <marker id="aa" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#f59e0b"/></marker>
    <marker id="at" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#14b8a6"/></marker>
  </defs>
</svg>'''

c = c[:s] + new + c[e:]
with open(path, 'w') as f:
    f.write(c)
print('Topology rebuilt with orthogonal routing')
