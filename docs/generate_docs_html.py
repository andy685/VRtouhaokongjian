#!/usr/bin/env python3
from __future__ import annotations

import html
import os
import re
import subprocess
import sys
from pathlib import Path


ROOT = Path("/Users/andy/Downloads/baidu/codebuddy/VRtouhaokongjian/docs")
PANDOC = "/opt/homebrew/bin/pandoc"

DOCS = [
    {
        "md": ROOT / "游戏SDK开发文档.md",
        "html": ROOT / "游戏SDK开发文档.html",
        "title": "头号空间 - 游戏SDK开发文档",
        "brand": "游戏SDK",
        "subtitle": "SDK 接入、统计、异常与会话边界",
    },
    {
        "md": ROOT / "游戏豆计费与自动退还规则.md",
        "html": ROOT / "游戏豆计费与自动退还规则.html",
        "title": "头号空间 - 游戏豆计费与自动退还规则",
        "brand": "游戏豆规则",
        "subtitle": "扣豆、自动退还、冲正与账务口径",
    },
]


def slugify(text: str) -> str:
    text = text.strip().lower()
    text = re.sub(r"[`*_~\[\](){}<>#+.!?,，。！？、:：；;\"'“”‘’\\/|]", "", text)
    text = re.sub(r"\s+", "-", text)
    text = re.sub(r"-+", "-", text)
    return text or "section"


def escape_md_heading_text(text: str) -> str:
    return re.sub(r"\s+\{#.*\}\s*$", "", text.strip())


def inject_anchors(md_text: str):
    toc = []
    seen: dict[str, int] = {}
    out_lines = []

    for line in md_text.splitlines():
        m = re.match(r"^(#{1,6})\s+(.*)$", line)
        if not m:
            out_lines.append(line)
            continue

        hashes, raw = m.groups()
        plain = escape_md_heading_text(raw)
        # Remove inline markdown decorations for a stable anchor.
        anchor_source = re.sub(r"[`*_]", "", plain)
        anchor = slugify(anchor_source)
        count = seen.get(anchor, 0)
        seen[anchor] = count + 1
        if count:
            anchor = f"{anchor}-{count + 1}"
        toc.append((len(hashes), plain, anchor))
        if "{#" not in raw:
            line = f"{hashes} {plain} {{#{anchor}}}"
        out_lines.append(line)

    return "\n".join(out_lines), toc


def render_markdown(md_text: str) -> str:
    if not Path(PANDOC).exists():
        raise FileNotFoundError(f"pandoc not found: {PANDOC}")

    result = subprocess.run(
        [PANDOC, "-f", "markdown", "-t", "html5", "--wrap=none"],
        input=md_text,
        text=True,
        capture_output=True,
        check=True,
    )
    body = result.stdout

    # Mermaid blocks are emitted as fenced code blocks by pandoc. Convert them to
    # <pre class="mermaid"> so the client-side renderer can pick them up.
    body = re.sub(
        r'<pre class="mermaid"><code>(.*?)</code></pre>',
        lambda m: f'<pre class="mermaid">{html.escape(html.unescape(m.group(1)))}</pre>',
        body,
        flags=re.DOTALL,
    )
    body = re.sub(
        r"<pre><code class=\"language-mermaid\">(.*?)</code></pre>",
        lambda m: f'<pre class="mermaid">{html.escape(html.unescape(m.group(1)))}</pre>',
        body,
        flags=re.DOTALL,
    )

    return body


def build_html(body: str, toc: list[tuple[int, str, str]], title: str, brand: str, subtitle: str) -> str:
    toc_links = []
    for level, text, anchor in toc:
        cls = f"s{min(level, 3)}"
        toc_links.append(f'<a href="#{anchor}" class="{cls}">{html.escape(text)}</a>')

    css = """
    :root {
      --bg: #0f172a;
      --panel: #111827;
      --card: #1e293b;
      --border: #334155;
      --accent: #6366f1;
      --accent2: #8b5cf6;
      --text: #e2e8f0;
      --muted: #94a3b8;
      --blue: #60a5fa;
      --green: #34d399;
      --amber: #f59e0b;
    }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
    }
    a { color: inherit; }
    .sidebar {
      position: fixed;
      inset: 0 auto 0 0;
      width: 280px;
      background: #0a0f1a;
      border-right: 1px solid var(--border);
      overflow-y: auto;
      padding: 20px 0;
    }
    .logo {
      padding: 0 20px 16px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 12px;
    }
    .logo h2 {
      margin: 0;
      font-size: 18px;
      background: linear-gradient(135deg, var(--accent), var(--accent2));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .logo .ver {
      margin-top: 4px;
      font-size: 12px;
      color: var(--muted);
    }
    .logo .sub {
      margin-top: 8px;
      font-size: 12px;
      color: #cbd5e1;
      line-height: 1.6;
    }
    .sidebar a {
      display: block;
      text-decoration: none;
      color: var(--muted);
      padding: 7px 20px;
      border-left: 3px solid transparent;
      line-height: 1.35;
      transition: .15s;
      word-break: break-word;
    }
    .sidebar a:hover { color: var(--text); background: rgba(99,102,241,.08); }
    .sidebar a.s1 { font-weight: 700; color: var(--text); font-size: 13px; margin-top: 4px; }
    .sidebar a.s2 { padding-left: 32px; font-size: 12px; }
    .sidebar a.s3 { padding-left: 44px; font-size: 11px; }
    .main {
      margin-left: 280px;
      padding: 40px 56px 96px;
      max-width: 1080px;
    }
    .hero {
      margin-bottom: 28px;
      padding-bottom: 18px;
      border-bottom: 1px solid var(--border);
    }
    .hero h1 {
      margin: 0 0 8px;
      font-size: 30px;
      background: linear-gradient(135deg, var(--accent), var(--accent2));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero .meta {
      font-size: 13px;
      line-height: 1.8;
      color: var(--muted);
    }
    .hero .pill {
      display: inline-block;
      margin-top: 12px;
      padding: 6px 10px;
      border-radius: 999px;
      background: rgba(99,102,241,.12);
      color: #c4b5fd;
      font-size: 12px;
      border: 1px solid rgba(99,102,241,.28);
    }
    h1, h2, h3, h4 {
      scroll-margin-top: 24px;
    }
    h2 {
      margin: 40px 0 18px;
      padding-bottom: 8px;
      border-bottom: 2px solid var(--accent);
      font-size: 22px;
    }
    h3 {
      margin: 28px 0 12px;
      color: #c4b5fd;
      font-size: 17px;
    }
    h4 {
      margin: 20px 0 10px;
      color: #93c5fd;
      font-size: 15px;
    }
    p, li {
      line-height: 1.85;
      font-size: 14px;
      color: var(--text);
    }
    ul, ol { padding-left: 24px; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0 24px;
      font-size: 13px;
    }
    th {
      background: #1a1a3e;
      color: #a78bfa;
      border: 1px solid var(--border);
      text-align: left;
      padding: 8px 10px;
    }
    td {
      border: 1px solid var(--border);
      padding: 7px 10px;
      color: var(--text);
      vertical-align: top;
    }
    tr:hover td { background: rgba(99,102,241,.04); }
    code {
      font-family: "SF Mono", "JetBrains Mono", Consolas, monospace;
      font-size: 12px;
      color: #60a5fa;
    }
    pre {
      background: #0a0f1a;
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 16px;
      overflow-x: auto;
      margin: 14px 0;
    }
    pre code {
      color: var(--text);
      font-size: 12px;
      line-height: 1.65;
      white-space: pre;
    }
    pre.mermaid {
      text-align: center;
      background: #0a0f1a;
    }
    blockquote {
      margin: 14px 0;
      padding: 10px 16px;
      border-left: 4px solid var(--accent);
      background: rgba(99,102,241,.06);
      border-radius: 0 10px 10px 0;
    }
    blockquote p { color: #cbd5e1; font-size: 13px; }
    hr {
      border: 0;
      border-top: 1px solid var(--border);
      margin: 28px 0;
    }
    .footer {
      margin-top: 54px;
      padding-top: 18px;
      border-top: 1px solid var(--border);
      color: var(--muted);
      font-size: 12px;
    }
    @media (max-width: 960px) {
      .sidebar {
        position: static;
        width: auto;
        height: auto;
        border-right: 0;
        border-bottom: 1px solid var(--border);
      }
      .main {
        margin-left: 0;
        padding: 24px 20px 72px;
      }
    }
    """

    return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{html.escape(title)}</title>
  <style>{css}</style>
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
    mermaid.initialize({{ startOnLoad: true, theme: 'dark', securityLevel: 'loose' }});
  </script>
</head>
<body>
  <aside class="sidebar">
    <div class="logo">
      <h2>{html.escape(brand)}</h2>
      <div class="ver">{html.escape(title)}</div>
      <div class="sub">{html.escape(subtitle)}</div>
    </div>
    <a href="#top" class="s1">文档目录</a>
    {''.join(toc_links)}
  </aside>
  <main class="main" id="top">
    <section class="hero">
      <h1>{html.escape(title)}</h1>
      <div class="meta">静态 HTML 版本，可直接放到站点或对象存储里访问。</div>
      <div class="pill">{html.escape(subtitle)}</div>
    </section>
    {body}
    <div class="footer">Generated from Markdown in {html.escape(str(ROOT))}</div>
  </main>
</body>
</html>
"""


def main() -> int:
    for doc in DOCS:
        md_text = doc["md"].read_text(encoding="utf-8")
        marked_md, toc = inject_anchors(md_text)
        body = render_markdown(marked_md)
        html_text = build_html(body, toc, doc["title"], doc["brand"], doc["subtitle"])
        doc["html"].write_text(html_text, encoding="utf-8")
        print(f"Generated: {doc['html']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
