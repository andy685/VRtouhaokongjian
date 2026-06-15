#!/usr/bin/env python3
"""将 头号空间-产品需求文档-PRD-v1.3.md 转换为带侧边栏的深色主题 HTML"""

import re, os

MD_FILE = os.path.join(os.path.dirname(__file__), '头号空间-产品需求文档-PRD-v1.3.md')
HTML_OUT = os.path.join(os.path.dirname(__file__), 'PRD-完整版.html')

with open(MD_FILE, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 构建侧边栏目录
sections = []
for i, line in enumerate(lines):
    m = re.match(r'^(#{1,3})\s+(.+)$', line)
    if m:
        level = len(m.group(1))
        title = m.group(2).strip().rstrip('\\')
        # 跳过纯装饰行 和 目录表
        if title.startswith('📑') or re.match(r'^\d+\.\d+\s', title):
            sections.append((i, level, title))
        elif level <= 2 and not title.startswith('>'):
            sections.append((i, level, title))

# HTML header
html = []
html.append('<!DOCTYPE html>')
html.append('<html lang="zh-CN">')
html.append('<head>')
html.append('<meta charset="UTF-8">')
html.append('<meta name="viewport" content="width=device-width, initial-scale=1.0">')
html.append('<title>头号空间 PRD v2.1 — 产品需求文档</title>')
html.append('<style>')
html.append('  :root {')
html.append('    --bg: #0f172a; --card: #1e293b; --border: #334155;')
html.append('    --accent: #6366f1; --accent2: #8b5cf6;')
html.append('    --green: #34d399; --amber: #fb923c; --red: #f87171; --blue: #60a5fa;')
html.append('    --text: #e2e8f0; --muted: #94a3b8;')
html.append('  }')
html.append('  * { margin:0; padding:0; box-sizing:border-box; }')
html.append('  body {')
html.append('    font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;')
html.append('    background: var(--bg); color: var(--text); display: flex; min-height: 100vh;')
html.append('  }')
html.append('  .sidebar {')
html.append('    width: 260px; background: #0a0f1a; border-right: 1px solid var(--border);')
html.append('    padding: 20px 0; position: fixed; top:0; left:0; height:100vh; overflow-y:auto; z-index:10;')
html.append('  }')
html.append('  .sidebar .logo { padding: 0 20px 16px; border-bottom:1px solid var(--border); margin-bottom:12px; }')
html.append('  .sidebar .logo h2 { font-size:15px; background:linear-gradient(135deg,var(--accent),var(--accent2)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }')
html.append('  .sidebar .logo .ver { font-size:11px; color:var(--muted); -webkit-text-fill-color:var(--muted); margin-top:2px; }')
html.append('  .sidebar a {')
html.append('    display: block; padding: 6px 20px; color: var(--muted); text-decoration: none;')
html.append('    font-size: 12px; transition: .15s; border-left: 3px solid transparent;')
html.append('  }')
html.append('  .sidebar a:hover { color: var(--text); background: rgba(99,102,241,.08); }')
html.append('  .sidebar a.s1 { font-weight: 600; color: var(--text); font-size: 13px; margin-top: 4px; }')
html.append('  .sidebar a.s2 { padding-left: 32px; font-size: 12px; }')
html.append('  .sidebar a.s3 { padding-left: 44px; font-size: 11px; }')
html.append('  .main { margin-left: 260px; flex:1; padding: 40px 60px 100px; max-width: 1000px; }')
html.append('  h1 { font-size: 28px; margin-bottom: 4px; background:linear-gradient(135deg,var(--accent),var(--accent2)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }')
html.append('  h2 { font-size: 22px; margin: 40px 0 20px; padding-bottom:8px; border-bottom:2px solid var(--accent); }')
html.append('  h3 { font-size: 17px; margin: 28px 0 14px; color: var(--accent); }')
html.append('  h4 { font-size: 15px; margin: 20px 0 10px; color: var(--blue); }')
html.append('  .meta { font-size:13px; color:var(--muted); margin-bottom:30px; line-height:1.8; }')
html.append('  p, li { font-size: 14px; line-height: 1.8; color: var(--text); }')
html.append('  table { width:100%; border-collapse:collapse; margin:12px 0; font-size:13px; }')
html.append('  th { background:#1a1a3e; color:#a78bfa; font-weight:600; text-align:left; padding:8px 10px; border:1px solid var(--border); }')
html.append('  td { padding:6px 10px; border:1px solid var(--border); color: var(--text); }')
html.append('  tr:hover td { background:rgba(99,102,241,.04); }')
html.append('  code { font-family: "JetBrains Mono", "SF Mono", monospace; font-size: 12px; color: var(--blue); }')
html.append('  pre { background: #0a0f1a; border: 1px solid var(--border); border-radius: 8px; padding: 16px; overflow-x: auto; margin: 12px 0; }')
html.append('  pre code { color: var(--text); font-size: 12px; line-height: 1.6; }')
html.append('  blockquote { border-left: 4px solid var(--accent); padding: 10px 16px; margin: 12px 0; background: rgba(99,102,241,.06); border-radius: 0 8px 8px 0; }')
html.append('  blockquote p { font-size: 13px; color: var(--muted); }')
html.append('  .card { background: var(--card); border:1px solid var(--border); border-radius:10px; padding:18px; margin:14px 0; }')
html.append('  .card-accent { border-left:4px solid var(--accent); }')
html.append('  .card-green { border-left:4px solid var(--green); }')
html.append('  .card-amber { border-left:4px solid var(--amber); }')
html.append('  hr { border: none; border-top: 1px solid var(--border); margin: 30px 0; }')
html.append('  ul, ol { padding-left: 24px; margin: 8px 0; }')
html.append('  strong { color: var(--text); }')
html.append('  .mermaid-container { background: #0a0f1a; border-radius: 8px; padding: 16px; margin: 12px 0; overflow-x: auto; }')
html.append('</style>')
html.append('</head><body>')

# 生成侧边栏
html.append('<div class="sidebar">')
html.append('<div class="logo"><h2>🎮 头号空间</h2><div class="ver">PRD v2.1</div></div>')
html.append('<a href="#top" class="s1">📋 文档目录</a>')
for idx, (line_num, level, title) in enumerate(sections):
    anchor = re.sub(r'[^\w\u4e00-\u9fff]+', '-', title).strip('-').lower()
    cls = f's{level}'
    label = title
    if re.match(r'^\d+', title):
        label = title
    html.append(f'<a href="#{anchor}" class="{cls}">{label}</a>')
html.append('</div>')

# 主内容区
html.append('<div class="main" id="top">')

# 解析 Markdown 行
in_code = False
code_lang = ''
code_lines = []
in_table = False
in_mermaid = False
mermaid_lines = []
in_blockquote = False

i = 0
while i < len(lines):
    raw_line = lines[i]
    # 去掉行号前缀
    line = raw_line.rstrip('\n')

    # 代码块
    if line.startswith('```'):
        if in_code:
            # 关闭代码块
            lang = code_lang
            code_content = '\n'.join(code_lines)
            if lang == 'mermaid' or in_mermaid:
                html.append(f'<div class="mermaid-container"><pre class="mermaid">{code_content}</pre></div>')
            else:
                html.append(f'<pre><code>{code_content}</code></pre>')
            in_code = False
            in_mermaid = False
            code_lang = ''
            code_lines = []
        else:
            in_code = True
            code_lang = line[3:].strip()
            if code_lang == 'mermaid':
                in_mermaid = True
        continue

    if in_code:
        # 转义 HTML
        escaped = line.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        code_lines.append(escaped)
        continue

    # 空行
    if not line.strip():
        if in_table:
            html.append('</table>')
            in_table = False
        html.append('')
        continue

    # 水平线
    if line.strip() == '---':
        html.append('<hr>')
        continue

    # 标题
    hm = re.match(r'^(#{1,4})\s+(.+)$', line)
    if hm:
        level = len(hm.group(1))
        title = hm.group(2).strip()
        # 去掉末尾的双空格
        title = title.rstrip()
        # 生成锚点
        anchor = re.sub(r'[^\w\u4e00-\u9fff]+', '-', title).strip('-').lower()
        if level == 1:
            html.append(f'<h1 id="{anchor}">{title}</h1>')
        elif level == 2:
            html.append(f'<h2 id="{anchor}">{title}</h2>')
        elif level == 3:
            html.append(f'<h3 id="{anchor}">{title}</h3>')
        elif level == 4:
            html.append(f'<h4 id="{anchor}">{title}</h4>')
        continue

    # SVG 内嵌 — 直接透传
    if line.strip().startswith('<svg '):
        html.append(line)
        # 读取到 </svg> 为止
        while True:
            i += 1
            if i >= len(lines):
                break
            line = lines[i].rstrip('\n')
            html.append(line)
            if '</svg>' in line:
                break
        continue

    # 图片 ![](src)
    img_match = re.match(r'^!\[([^\]]*)\]\(([^)]+)\)$', line.strip())
    if img_match:
        alt = img_match.group(1)
        src = img_match.group(2)
        # 如果是SVG, 尝试内嵌
        svg_path = os.path.join(os.path.dirname(MD_FILE), src)
        if os.path.exists(svg_path) and src.endswith('.svg'):
            try:
                with open(svg_path, 'r', encoding='utf-8') as svg_f:
                    svg_content = svg_f.read()
                # 提取SVG标签内部内容, 调整宽度适应页面
                svg_content = svg_content.replace('<svg ', '<svg style="max-width:100%;height:auto;margin:12px 0;border-radius:8px;" ')
                html.append(f'<div style="text-align:center;margin:12px 0;">{svg_content}</div>')
            except:
                html.append(f'<p><img src="{src}" alt="{alt}" style="max-width:100%;border-radius:8px;"/></p>')
        else:
            html.append(f'<p><img src="{src}" alt="{alt}" style="max-width:100%;border-radius:8px;"/></p>')
        continue

    # 块引用
    if line.startswith('> '):
        content = line[2:]
        if not in_blockquote:
            html.append('<blockquote>')
            in_blockquote = True
        html.append(f'<p>{content}</p>')
        continue
    else:
        if in_blockquote:
            html.append('</blockquote>')
            in_blockquote = False

    # 表格
    if '|' in line:
        cells = [c.strip() for c in line.split('|')[1:-1]]
        if all(re.match(r'^[-:\s]+$', c) for c in cells):
            # 分隔行，跳过
            continue
        if not in_table:
            html.append('<table>')
            in_table = True
            # 第一行是表头
            html.append('<tr>' + ''.join(f'<th>{c}</th>' for c in cells) + '</tr>')
        else:
            html.append('<tr>' + ''.join(f'<td>{c}</td>' for c in cells) + '</tr>')
        continue
    else:
        if in_table:
            html.append('</table>')
            in_table = False

    # 无序列表
    if line.strip().startswith('- '):
        content = line.strip()[2:]
        html.append(f'<li>{content}</li>')
        continue

    # 有序列表
    olm = re.match(r'^\d+[\.\)]\s+(.+)$', line.strip())
    if olm:
        html.append(f'<li>{olm.group(1)}</li>')
        continue

    # 普通段落（包含粗体/行内代码）
    p = line.strip()
    if p:
        # 粗体 **text**
        p = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', p)
        # 行内代码 `text`
        p = re.sub(r'`([^`]+)`', r'<code>\1</code>', p)
        # 链接 [text](url)
        p = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2" style="color:var(--accent)">\1</a>', p)
        html.append(f'<p>{p}</p>')

    i += 1

# 关闭可能打开的标签
if in_table:
    html.append('</table>')
if in_blockquote:
    html.append('</blockquote>')
if in_code:
    html.append('</pre></code>')

html.append('</div>')
html.append('</body></html>')

with open(HTML_OUT, 'w', encoding='utf-8') as f:
    f.write('\n'.join(html))

print(f'✅ PRD HTML 生成完成: {HTML_OUT}')
print(f'   共 {len(html)} 行, {len(sections)} 个目录条目')
