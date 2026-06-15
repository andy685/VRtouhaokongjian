#!/usr/bin/env python3
"""生成 PRD HTML 版本"""
import markdown
import re
import sys

MD_FILE = '/Users/andy/Downloads/baidu/codebuddy/VRtouhaokongjian/docs/头号空间-产品需求文档-PRD-v1.3.md'
HTML_OUT = '/Users/andy/Downloads/baidu/codebuddy/VRtouhaokongjian/docs/PRD-完整版.html'

with open(MD_FILE, 'r', encoding='utf-8') as f:
    md_content = f.read()

# Convert markdown to HTML with extensions
extensions = ['tables', 'fenced_code', 'codehilite', 'toc', 'nl2br']
md = markdown.Markdown(extensions=extensions)
html_body = md.convert(md_content)

# Extract version
version_match = re.search(r'\*\*版本\*\*:\s*v([\d.]+)', md_content)
version = version_match.group(1) if version_match else '1.3'

CSS = """
:root {
  --bg:#0f172a; --card:#1e293b; --border:#334155;
  --accent:#6366f1; --accent2:#8b5cf6; --text:#e2e8f0;
  --muted:#94a3b8; --blue:#60a5fa; --green:#34d399;
  --red:#f87171; --yellow:#fbbf24; --orange:#fb923c;
}
* { box-sizing:border-box; margin:0; padding:0; }
html { scroll-behavior:smooth; }
body {
  font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;
  background:var(--bg); color:var(--text); line-height:1.7;
  display:flex; min-height:100vh;
}
.sidebar {
  position:fixed; inset:0 auto 0 0; width:280px; padding:0;
  background:#0a0f1a; border-right:1px solid var(--border); overflow-y:auto;
  z-index:10;
}
.sidebar .logo {
  padding:20px 20px 16px; border-bottom:1px solid var(--border);
  position:sticky; top:0; background:#0a0f1a; z-index:1;
}
.sidebar .logo h2 {
  font-size:18px; background:linear-gradient(135deg,var(--accent),var(--accent2));
  -webkit-background-clip:text; -webkit-text-fill-color:transparent;
}
.sidebar .logo .ver { font-size:12px; color:var(--muted); margin-top:4px; }
.sidebar nav { padding:8px 0; }
.sidebar nav a {
  display:block; padding:6px 20px; font-size:13px; color:var(--muted);
  text-decoration:none; border-left:3px solid transparent; transition:all .15s;
}
.sidebar nav a:hover {
  color:var(--text); background:rgba(99,102,241,.08);
  border-left-color:var(--accent);
}
.sidebar nav a.h1 { font-weight:600; color:var(--text); font-size:14px; padding-top:10px; }
.sidebar nav a.h2 { padding-left:36px; }
.sidebar nav a.h3 { padding-left:52px; font-size:12px; }
.main {
  margin-left:280px; flex:1; max-width:960px; padding:40px 48px 80px;
}
h1 { font-size:28px; margin:32px 0 16px; color:#fff; border-bottom:2px solid var(--accent); padding-bottom:10px; }
h2 { font-size:22px; margin:36px 0 14px; color:#f1f5f9; border-bottom:1px solid var(--border); padding-bottom:8px; }
h3 { font-size:18px; margin:24px 0 10px; color:#e2e8f0; }
h4 { font-size:15px; margin:18px 0 8px; color:var(--blue); }
h5 { font-size:14px; margin:14px 0 6px; color:var(--muted); }
p { margin:8px 0; }
blockquote {
  border-left:3px solid var(--accent); background:rgba(99,102,241,.06);
  padding:8px 16px; margin:12px 0; color:var(--muted); font-size:14px;
  border-radius:0 6px 6px 0;
}
blockquote p { margin:4px 0; }
table {
  width:100%; border-collapse:collapse; margin:12px 0; font-size:13px;
  background:var(--card); border-radius:8px; overflow:hidden;
}
thead th, th {
  background:rgba(99,102,241,.15); padding:10px 12px; text-align:left;
  font-weight:600; color:var(--blue); border-bottom:2px solid var(--border);
}
td { padding:8px 12px; border-bottom:1px solid var(--border); }
tr:last-child td { border-bottom:none; }
tr:hover td { background:rgba(99,102,241,.04); }
pre {
  background:#0a0f1a; padding:16px; border-radius:8px; overflow-x:auto;
  margin:12px 0; font-size:13px; line-height:1.5; border:1px solid var(--border);
  white-space:pre-wrap; word-break:break-all;
}
code {
  font-family:"SF Mono","Fira Code","Consolas",monospace;
  font-size:12px; background:rgba(99,102,241,.1); padding:2px 6px;
  border-radius:4px; color:var(--accent2);
}
pre code { background:none; padding:0; color:var(--text); }
hr { border:none; border-top:1px solid var(--border); margin:32px 0; }
ul, ol { padding-left:24px; margin:8px 0; }
li { margin:4px 0; }
strong { color:#f1f5f9; }
em { color:var(--muted); }
a { color:var(--blue); }

@media (max-width:900px) {
  .sidebar { display:none; }
  .main { margin-left:0; padding:20px 16px 60px; }
}
"""

# Build TOC from headings
toc_items = []
heading_pattern = re.compile(r'^(#{1,4})\s+(.+)$', re.MULTILINE)
for m in heading_pattern.finditer(md_content):
    level = len(m.group(1))
    title = m.group(2).strip()
    anchor = title.lower()
    for ch in ' ./,:;()[]{}|—†⚠️☑❌✅🆕📑🎮🟤🟢🟡🔵🟣🔴⚪📱💻🥽☁️🏪🤝🎂🌟👤💰📋📊📈🖥️🎟️':
        anchor = anchor.replace(ch, '-')
    anchor = re.sub(r'-+', '-', anchor).strip('-')
    if not anchor:
        anchor = 'section'
    if level <= 3:
        toc_items.append((level, title, anchor))

toc_html = '\n'.join(
    f'<a href="#{anchor}" class="h{lv}">{title}</a>'
    for lv, title, anchor in toc_items
)

full_html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>头号空间 - 产品需求文档 PRD v{version}</title>
  <style>{CSS}</style>
</head>
<body>
  <aside class="sidebar">
    <div class="logo">
      <h2>头号空间 PRD</h2>
      <div class="ver">v{version} · 2026-06-15</div>
    </div>
    <nav>{toc_html}</nav>
  </aside>
  <main class="main">
    {html_body}
  </main>
</body>
</html>"""

with open(HTML_OUT, 'w', encoding='utf-8') as f:
    f.write(full_html)

print(f"HTML generated: {HTML_OUT}")
print(f"Version: v{version}")
print(f"Size: {len(full_html):,} bytes")
