#!/usr/bin/env python3
"""Fix mind map connection paths - route through column gaps, add waypoints"""
p = '/Users/andy/Downloads/baidu/codebuddy/VRtouhaokongjian/docs/头号空间-产品需求文档-PRD-v1.3.md'
with open(p, 'r') as f:
    c = f.read()
st = c.index('## 4. 子系统功能详解')
s = c.index('<svg', st)
e = c.index('</svg>', s) + 6
svg = c[s:e]

# Top row sub-item column positions:
# Branch 1 (C端小程序): col1=50-174, col2=180-304 → gap center=177
# Branch 2 (PC收银): col1=360-470, col2=476-586 → gap center=473  
# Branch 3 (PC终端): col1=680-764, col2=770-854 → gap center=767

# Header bottom: y=106 (68+38)
# Last sub-item bottom: y=188 (166+22)
# Center rect: y=300-360

# Replace each path:
# Current                         → New (with gap routing)
  
svg = svg.replace(
    'd="M 188,106 L 188,300"',
    'd="M 188,106 L 177,106 L 177,280 L 355,310"'
)

svg = svg.replace(
    'd="M 480,106 L 480,300"',
    'd="M 480,106 L 473,106 L 473,280 L 480,300"'
)

svg = svg.replace(
    'd="M 772,106 L 772,220 L 605,310"',
    'd="M 772,106 L 767,106 L 767,250 L 605,310"'
)

# Left VR branch: header at x=30, y=290. path: M 170,309 L 355,320  
# Add waypoint through gap
svg = svg.replace(
    'd="M 170,309 L 355,320"',
    'd="M 170,309 L 230,309 L 230,320 L 355,320"'
)

# Right SDK branch: header at x=790, y=290. path: M 790,309 L 605,320
svg = svg.replace(
    'd="M 790,309 L 605,320"',
    'd="M 790,309 L 580,309 L 580,320 L 605,320"'
)

# Bottom branches:
# Bottom-left (商家后台): header at x=100, y=450, center=188
# sub-items: col1=50-174, col2=180-304 → gap=177
# path: M 188,488 L 188,370 L 355,340
svg = svg.replace(
    'd="M 188,488 L 188,370 L 355,340"',
    'd="M 188,488 L 177,488 L 177,380 L 355,350"'
)

# Bottom-center (代理商): header at x=392, y=450, center=480
# sub-items: col1=360-470, col2=476-586 → gap=473
# path: M 480,488 L 480,360
svg = svg.replace(
    'd="M 480,488 L 480,360"',
    'd="M 480,488 L 473,488 L 473,370 L 480,360"'
)

# Bottom-right (总运营): header at x=684, y=450, center=772
# sub-items: col1=640-750, col2=756-866 → gap=753
# path: M 772,488 L 772,370 L 605,340
svg = svg.replace(
    'd="M 772,488 L 772,370 L 605,340"',
    'd="M 772,488 L 753,488 L 753,380 L 605,350"'
)

c = c[:s] + svg + c[e:]
with open(p, 'w') as f:
    f.write(c)
print('Done - all paths routed through column gaps')
