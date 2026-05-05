with open('/Users/andy/Downloads/baidu/codebuddy/VRtouhaokongjian/docs/头号空间-产品需求文档-PRD-v1.3.md') as f:
    content = f.read()

# Fix the game bean price example in section 2
old = '平台抽成(15%) | ¥27,000 | 从营业额中扣除'
new = '游戏豆采购成本 | ¥9,000 | 约100万豆/月 @ ¥0.5/豆'
if old in content:
    content = content.replace(old, new)
    print('Fixed game bean cost example')

# Fix the platform commission reference in settlement
old2 = '平台抽成'
cnt = content.count(old2)
content = content.replace(old2, '平台收入(硬件+游戏豆)')
print(f'Replaced {cnt} instances of 平台抽成')

with open('/Users/andy/Downloads/baidu/codebuddy/VRtouhaokongjian/docs/头号空间-产品需求文档-PRD-v1.3.md', 'w') as f:
    f.write(content)
print('Done')
