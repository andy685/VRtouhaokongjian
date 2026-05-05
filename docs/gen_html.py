#!/usr/bin/env python3
"""Generate PRD HTML handling SVGs properly: extract → pandoc → inject"""
import re, os, subprocess, time, shutil

MD_FILE = '/Users/andy/Downloads/baidu/codebuddy/VRtouhaokongjian/docs/头号空间-产品需求文档-PRD-v1.3.md'
HTML_OUT = '/Users/andy/Downloads/baidu/codebuddy/VRtouhaokongjian/docs/PRD-完整版.html'
BACKUP_DIR = '/Users/andy/Downloads/baidu/codebuddy/VRtouhaokongjian/docs/versions'
os.makedirs(BACKUP_DIR, exist_ok=True)

# Generate version string
ts = time.strftime('%Y%m%d_%H%M')
ver = f'v1.3.3_{ts}'

# 1. Read markdown and extract SVGs
with open(MD_FILE, 'r') as f:
    content = f.read()

# Extract all SVG blocks, replace with placeholders
svgs = []
def replace_svg(m):
    svgs.append(m.group(0))
    return f'<!-- SVG_PLACEHOLDER_{len(svgs)-1} -->'

cleaned = re.sub(r'<svg xmlns[^>]*>.*?</svg>', replace_svg, content, flags=re.DOTALL)

# Write cleaned markdown
with open('/tmp/prd_cleaned.md', 'w') as f:
    f.write(cleaned)

# 2. Run pandoc
subprocess.run([
    'pandoc', '/tmp/prd_cleaned.md',
    '-f', 'markdown', '-t', 'html',
    '--wrap=none', '-o', '/tmp/prd_body.html'
], check=True)

with open('/tmp/prd_body.html', 'r') as f:
    body = f.read()

# 3. Inject SVGs back
for i, svg in enumerate(svgs):
    # Small fix: convert &quot; back to " in SVG attributes if needed
    body = body.replace(f'<!-- SVG_PLACEHOLDER_{i} -->', svg)

# 4. Build sidebar from markdown headers
sections = []
for line in content.split('\n'):
    m = re.match(r'^(#{1,3})\s+(.+)$', line)
    if m:
        level = len(m.group(1))
        title = m.group(2).strip().rstrip('\\')
        if re.match(r'^\d+\.\d+\s', title) or (level <= 2 and not title.startswith('>')):
            sections.append((level, title))

# 5. CSS and template
css = '''  :root {
    --bg: #0f172a; --card: #1e293b; --border: #334155;
    --accent: #6366f1; --accent2: #8b5cf6;
    --green: #34d399; --amber: #fb923c; --red: #f87171; --blue: #60a5fa;
    --text: #e2e8f0; --muted: #94a3b8;
  }
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
    background: var(--bg); color: var(--text); display: flex; min-height: 100vh;
  }
  .sidebar {
    width: 260px; background: #0a0f1a; border-right: 1px solid var(--border);
    padding: 20px 0; position: fixed; top:0; left:0; height:100vh; overflow-y:auto; z-index:10;
  }
  .sidebar .logo { padding: 0 20px 16px; border-bottom:1px solid var(--border); margin-bottom:12px; }
  .sidebar .logo h2 { font-size:15px; background:linear-gradient(135deg,var(--accent),var(--accent2)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
  .sidebar .logo .ver { font-size:11px; color:var(--muted); -webkit-text-fill-color:var(--muted); margin-top:2px; }
  .sidebar a {
    display: block; padding: 6px 20px; color: var(--muted); text-decoration: none;
    font-size: 12px; transition: .15s; border-left: 3px solid transparent;
  }
  .sidebar a:hover { color: var(--text); background: rgba(99,102,241,.08); }
  .sidebar a.s1 { font-weight: 600; color: var(--text); font-size: 13px; margin-top: 4px; }
  .sidebar a.s2 { padding-left: 32px; font-size: 12px; }
  .sidebar a.s3 { padding-left: 44px; font-size: 11px; }
  .main { margin-left: 260px; flex:1; padding: 40px 60px 100px; max-width: 1000px; }
  h1 { font-size: 28px; margin-bottom: 4px; background:linear-gradient(135deg,var(--accent),var(--accent2)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
  h2 { font-size: 22px; margin: 40px 0 20px; padding-bottom:8px; border-bottom:2px solid var(--accent); }
  h3 { font-size: 17px; margin: 28px 0 14px; color: var(--accent); }
  h4 { font-size: 15px; margin: 20px 0 10px; color: var(--blue); }
  .meta { font-size:13px; color:var(--muted); margin-bottom:30px; line-height:1.8; }
  p, li { font-size: 14px; line-height: 1.8; color: var(--text); }
  table { width:100%; border-collapse:collapse; margin:12px 0; font-size:13px; }
  th { background:#1a1a3e; color:#a78bfa; font-weight:600; text-align:left; padding:8px 10px; border:1px solid var(--border); }
  td { padding:6px 10px; border:1px solid var(--border); color: var(--text); }
  tr:hover td { background:rgba(99,102,241,.04); }
  code { font-family: "JetBrains Mono", "SF Mono", monospace; font-size: 12px; color: var(--blue); }
  pre { background: #0a0f1a; border: 1px solid var(--border); border-radius: 8px; padding: 16px; overflow-x: auto; margin: 12px 0; }
  pre code { color: var(--text); font-size: 12px; line-height: 1.6; }
  blockquote { border-left: 4px solid var(--accent); padding: 10px 16px; margin: 12px 0; background: rgba(99,102,241,.06); border-radius: 0 8px 8px 0; }
  blockquote p { font-size: 13px; color: var(--muted); }
  hr { border: none; border-top: 1px solid var(--border); margin: 30px 0; }
  ul, ol { padding-left: 24px; margin: 8px 0; }
  strong { color: var(--text); }'''

html_parts = []
html_parts.append('<!DOCTYPE html><html lang="zh-CN"><head>')
html_parts.append('<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">')
html_parts.append(f'<title>头号空间 PRD {ver} — 产品需求文档</title>')
html_parts.append(f'<style>{css}</style></head><body>')

# Sidebar
html_parts.append('<div class="sidebar">')
html_parts.append(f'<div class="logo"><h2>🎮 头号空间</h2><div class="ver">PRD {ver}</div></div>')
html_parts.append('<a href="#top" class="s1">📋 文档目录</a>')
for level, title in sections:
    anchor = re.sub(r'[^\w\u4e00-\u9fff]+', '-', title).strip('-').lower()
    html_parts.append(f'<a href="#{anchor}" class="s{level}">{title}</a>')
html_parts.append('</div>')

# Main content
html_parts.append(f'<div class="main" id="top">{body}</div></body></html>')

html_str = ''.join(html_parts)

# Save current version
with open(HTML_OUT, 'w', encoding='utf-8') as f:
    f.write(html_str)

# Save versioned backup
backup_path = os.path.join(BACKUP_DIR, f'PRD-完整版_{ver}.html')
with open(backup_path, 'w', encoding='utf-8') as f:
    f.write(html_str)

# Keep latest copy in root too
latest_copy = os.path.join(os.path.dirname(HTML_OUT), f'PRD-完整版_{ver}.html')
with open(latest_copy, 'w', encoding='utf-8') as f:
    f.write(html_str)

# Also update the backup file
shutil.copy2(HTML_OUT, os.path.join(os.path.dirname(HTML_OUT), 'PRD-完整版_副本.html'))

# Clean up old backups (keep last 20)
backups = sorted([f for f in os.listdir(BACKUP_DIR) if f.endswith('.html')])
while len(backups) > 20:
    os.remove(os.path.join(BACKUP_DIR, backups[0]))
    backups = backups[1:]

print(f'✅ Done: {HTML_OUT}')
print(f'   Version: {ver}')
print(f'   SVGs injected: {len(svgs)}')
print(f'   Total size: {os.path.getsize(HTML_OUT)} bytes')
print(f'   Backup: versions/PRD-完整版_{ver}.html')
