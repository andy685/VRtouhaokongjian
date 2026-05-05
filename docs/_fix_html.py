#!/usr/bin/env python3
"""Fix the PRD HTML - remove duplicate SVG lines"""

import re

path = '/Users/andy/Downloads/baidu/codebuddy/VRtouhaokongjian/docs/PRD-完整版.html'

with open(path, 'r', encoding='utf-8') as f:
    html = f.read()

# Remove the duplicate SVG content (wrapped in <p> tags starting with <p><rect)
# Find all <p><rect... patterns that are duplicates of the inline SVG
html = re.sub(r'<p><rect x="210" y="24" width="300".*?</p>\n', '', html, flags=re.DOTALL)
html = re.sub(r'<p><line x1=.*?</p>\n', '', html)
html = re.sub(r'<p><polygon points=.*?</p>\n', '', html)
html = re.sub(r'<p><text x=.*?</p>\n', '', html)
html = re.sub(r'<p><feDropShadow.*?</p>\n', '', html)
html = re.sub(r'<p></filter></p>\n', '', html)
html = re.sub(r'<p><filter id=.*?</p>\n', '', html)
html = re.sub(r'<p><defs></p>\n', '', html)
html = re.sub(r'<p></defs></p>\n', '', html)
html = re.sub(r'<p></svg></p>\n', '', html)
html = re.sub(r'<p>  <!--.*?</p>\n', '', html)

# Also clean up the sidebar TOC reference
html = html.replace('8. 技术方案概要）', '8. 技术方案概要')

with open(path, 'w', encoding='utf-8') as f:
    f.write(html)

print('✅ Fixed duplicate SVG lines in HTML')
