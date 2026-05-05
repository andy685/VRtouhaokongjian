#!/usr/bin/env python3
"""Rebuild VR state flow SVG with clean, beautiful layout"""
p = '/Users/andy/Downloads/baidu/codebuddy/VRtouhaokongjian/docs/头号空间-产品需求文档-PRD-v1.3.md'
with open(p, 'r') as f:
    c = f.read()
st = c.index('VR头显终端 — 状态流转图')
s = c.rindex('<svg', 0, st)
e = c.index('</svg>', s) + 6

new = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 420" style="max-width:100%;height:auto;margin:12px auto;display:block;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.08);font-family:'PingFang SC','Microsoft YaHei','Helvetica Neue',sans-serif">
  <rect width="760" height="420" fill="#f8fafc" rx="12"/>
  <text x="380" y="28" text-anchor="middle" fill="#1e293b" font-size="16" font-weight="700">VR头显终端 — 状态流转图</text>
  <text x="380" y="46" text-anchor="middle" fill="#94a3b8" font-size="11">VR内不做任何界面，所有交互由PC终端承担</text>

  <!-- VR区域 -->
  <rect x="18" y="56" width="724" height="316" rx="10" fill="none" stroke="#93c5fd" stroke-width="1.5" stroke-dasharray="6,3"/>
  <text x="28" y="74" fill="#3b82f6" font-size="10" font-weight="600">🥽 VR头显内部（用户视野）</text>

  <!-- === 状态节点（横向布局） === -->

  <!-- ① 待机 -->
  <rect x="40" y="120" width="140" height="44" rx="22" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.8"/>
  <text x="110" y="140" text-anchor="middle" fill="#475569" font-size="13" font-weight="600">① 待机 Idle</text>
  <text x="110" y="156" text-anchor="middle" fill="#94a3b8" font-size="9">品牌Logo · 30秒省电</text>

  <!-- ② 加载 -->
  <rect x="230" y="120" width="140" height="44" rx="22" fill="#dbeafe" stroke="#60a5fa" stroke-width="1.8"/>
  <text x="300" y="140" text-anchor="middle" fill="#1e40af" font-size="13" font-weight="600">② 加载 Loading</text>
  <text x="300" y="156" text-anchor="middle" fill="#3b82f6" font-size="9">Logo + 环形动画</text>

  <!-- ③ 游戏中 -->
  <rect x="420" y="120" width="140" height="44" rx="22" fill="#dcfce7" stroke="#22c55e" stroke-width="1.8"/>
  <text x="490" y="140" text-anchor="middle" fill="#166534" font-size="13" font-weight="600">③ 游戏中 ▶</text>
  <text x="490" y="156" text-anchor="middle" fill="#16a34a" font-size="9">0 HUD · 纯沉浸</text>

  <!-- ④ 结束 -->
  <rect x="590" y="120" width="140" height="44" rx="22" fill="#f0f9ff" stroke="#38bdf8" stroke-width="1.8"/>
  <text x="660" y="140" text-anchor="middle" fill="#0369a1" font-size="13" font-weight="600">④ 结束</text>
  <text x="660" y="156" text-anchor="middle" fill="#0ea5e9" font-size="9">"请取下头盔"</text>

  <!-- ⑤ 异常 -->
  <rect x="230" y="260" width="140" height="44" rx="22" fill="#fef2f2" stroke="#f87171" stroke-width="1.8"/>
  <text x="300" y="280" text-anchor="middle" fill="#991b1b" font-size="13" font-weight="600">⑤ 异常 Error</text>
  <text x="300" y="296" text-anchor="middle" fill="#ef4444" font-size="9">"系统异常" · 红色常驻</text>

  <!-- 底部：PC终端操作 -->
  <rect x="40" y="335" width="690" height="26" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="4,3"/>
  <text x="55" y="353" fill="#64748b" font-size="10">💻 PC终端（外部操作）：选游戏 → 扫码支付 → 分配"请佩戴#03" → 监控面板 → 提前结束/呼叫店员 → 结算评价</text>

  <!-- === 连线（简洁清晰） === -->

  <!-- 开机初始化 → 待机 -->
  <text x="70" y="106" fill="#64748b" font-size="10">开机初始化</text>
  <line x1="110" y1="110" x2="110" y2="120" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#ag)"/>

  <!-- 待机 → 加载 -->
  <line x1="180" y1="142" x2="230" y2="142" stroke="#60a5fa" stroke-width="1.8" marker-end="url(#ab)"/>
  <text x="205" y="136" text-anchor="middle" fill="#3b82f6" font-size="9">收到加载指令</text>

  <!-- 加载 → 游戏中 -->
  <line x1="370" y1="142" x2="420" y2="142" stroke="#22c55e" stroke-width="1.8" marker-end="url(#ag)"/>
  <text x="395" y="136" text-anchor="middle" fill="#16a34a" font-size="9">游戏启动成功</text>

  <!-- 游戏中 → 结束 -->
  <line x1="560" y1="142" x2="590" y2="142" stroke="#38bdf8" stroke-width="1.8" marker-end="url(#ab)"/>
  <text x="575" y="136" text-anchor="middle" fill="#0ea5e9" font-size="9">时间到/结束</text>

  <!-- 结束 → 待机（返回） -->
  <path d="M 590,164 L 590,196 L 110,196 L 110,164" fill="none" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#ag)" stroke-dasharray="4,3"/>
  <text x="350" y="190" text-anchor="middle" fill="#94a3b8" font-size="9">3秒自动返回待机</text>

  <!-- 游戏中 → 异常 -->
  <line x1="490" y1="164" x2="370" y2="260" fill="none" stroke="#ef4444" stroke-width="1.8" marker-end="url(#ar)"/>
  <text x="430" y="210" text-anchor="middle" fill="#ef4444" font-size="9">崩溃/异常</text>

  <!-- 异常 → 待机 -->
  <line x1="230" y1="282" x2="110" y2="164" fill="none" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#ao)" stroke-dasharray="4,3"/>
  <text x="170" y="230" text-anchor="middle" fill="#f59e0b" font-size="9">店员处理/重启</text>

  <!-- 摘盔提示（右上角） -->
  <rect x="590" y="220" width="140" height="40" rx="6" fill="#fef3c7" stroke="#f59e0b" stroke-width="1"/>
  <text x="660" y="238" text-anchor="middle" fill="#92400e" font-size="9">摘盔 → 3分钟超时</text>
  <text x="660" y="252" text-anchor="middle" fill="#92400e" font-size="9">自动结束Session</text>
  <line x1="660" y1="220" x2="560" y2="164" stroke="#f59e0b" stroke-width="1" stroke-dasharray="3,3"/>

  <defs>
    <marker id="ab" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#3b82f6"/></marker>
    <marker id="ag" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#64748b"/></marker>
    <marker id="ar" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#ef4444"/></marker>
    <marker id="ao" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#f59e0b"/></marker>
  </defs>
</svg>'''
c = c[:s] + new + c[e:]
with open(p, 'w') as f:
    f.write(c)
print('VR diagram rebuilt with clean horizontal layout')
